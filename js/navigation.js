export function initNavigation() {
  const tablist = document.querySelector('#tabs');
  const menu = document.querySelector('#navigation-menu');
  const toggle = document.querySelector('#hamburger');
  const close = document.querySelector('#close-menu');
  const main = document.querySelector('#main-content');
  const footer = document.querySelector('.footer');
  const mobile = matchMedia('(max-width: 980px)');
  const tabs = [...tablist.querySelectorAll('a[href^="#"]')];
  const panels = new Map(tabs.map(tab => {
    const id = tab.hash.slice(1);
    return [id, document.getElementById(id)];
  }));
  let current = 'terminal';
  let menuOpen = false;

  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab) => {
    const id = tab.hash.slice(1);
    const panel = panels.get(id);
    tab.id = 'tab-' + id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
  });

  function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    main.inert = open;
    footer.inert = open;
    for (const tab of tabs) tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    if (open) {
      tablist.querySelector('[aria-selected="true"]').focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  }

  function select(id, addHistory = false) {
    if (!panels.has(id)) return;
    const wasOpen = menuOpen;
    if (wasOpen) setMenu(false);
    if (current !== id) panels.get(current).querySelectorAll('video').forEach(video => video.pause());
    current = id;
    for (const [key, panel] of panels) panel.hidden = key !== id;
    for (const tab of tabs) {
      const active = tab.hash === '#' + id;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    if (addHistory && location.hash !== '#' + id) {
      history.pushState(null, '', '#' + id);
    }
    window.scrollTo(0, 0);
    if (wasOpen) panels.get(id).focus({ preventScroll: true });
  }

  function syncLocation() {
    const id = location.hash.slice(1);
    if (!id || panels.has(id)) select(id || 'terminal');
  }

  function syncOrientation() {
    tablist.setAttribute('aria-orientation', mobile.matches ? 'vertical' : 'horizontal');
    if (!mobile.matches && menuOpen) {
      setMenu(false);
      tablist.querySelector('[aria-selected="true"]').focus();
    }
  }

  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(tab.hash.slice(1), true);
  });

  tablist.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(event.target);
    if (index === -1) return;
    const forward = mobile.matches ? 'ArrowDown' : 'ArrowRight';
    const backward = mobile.matches ? 'ArrowUp' : 'ArrowLeft';
    let next;
    if (event.key === forward) next = (index + 1) % tabs.length;
    if (event.key === backward) next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (event.key === ' ') next = index;
    if (next === undefined) return;
    event.preventDefault();
    const wasOpen = menuOpen;
    // Arrow keys move between tabs within the menu. Enter or Space activates one.
    if (wasOpen && event.key !== ' ') {
      tabs[index].tabIndex = -1;
      tabs[next].tabIndex = 0;
      tabs[next].focus();
      return;
    }
    select(tabs[next].hash.slice(1), true);
    if (!wasOpen) tabs[next].focus();
  });

  toggle.addEventListener('click', () => setMenu(!menuOpen, menuOpen));
  close.addEventListener('click', () => setMenu(false, true));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      setMenu(false, true);
    }
  });
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    if (menuOpen) setMenu(false);
    panels.get(current).focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
  mobile.addEventListener('change', syncOrientation);
  syncOrientation();
  select(panels.has(location.hash.slice(1)) ? location.hash.slice(1) : 'terminal');

  return {
    getPanel: id => panels.get(id),
    focusCurrent() {
      const target = current === 'terminal' && !mobile.matches
        ? document.querySelector('#in')
        : panels.get(current);
      target.focus({ preventScroll: true });
    },
  };
}

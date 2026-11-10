export function initAppearance({ onWelcomeChange, onEnter }) {
  const root = document.documentElement;
  const welcome = document.querySelector('#welcome');
  const shell = document.querySelector('#site-shell');
  const start = document.querySelector('#startBtn');
  const checkbox = document.querySelector('#themeSwitch');
  const toggle = document.querySelector('#themeToggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function setTheme(theme) {
    const light = theme === 'light';
    root.dataset.theme = theme;
    checkbox.checked = light;
    toggle.setAttribute('aria-pressed', String(light));
    toggle.textContent = light ? '☀︎' : '☾';
  }

  function saveTheme(theme) {
    setTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // The selected theme still works for this visit.
    }
  }

  setTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  checkbox.addEventListener('change', () => saveTheme(checkbox.checked ? 'light' : 'dark'));
  toggle.addEventListener('click', () => saveTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));

  let entered = Boolean(location.hash);
  function enter() {
    if (entered) return;
    entered = true;
    welcome.inert = true;
    shell.inert = false;
    document.body.classList.remove('welcome-open');
    onWelcomeChange(false);
    if (reducedMotion.matches) {
      welcome.hidden = true;
    } else {
      welcome.classList.add('is-dismissing');
      setTimeout(() => { welcome.hidden = true; }, 350);
    }
    onEnter();
  }

  start.addEventListener('click', enter);
  window.addEventListener('hashchange', enter);
  window.addEventListener('keydown', (event) => {
    if (entered || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest('button, input, a')) return;
    if (event.key.length === 1 || event.key === 'Enter') enter();
  });

  if (!entered) {
    welcome.hidden = false;
    shell.inert = true;
    document.body.classList.add('welcome-open');
  }
  onWelcomeChange(!entered);
}

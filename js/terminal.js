const sections = {
  about: 'about',
  skills: 'skills',
  experience: 'experience',
  education: 'edu-certs',
  certificates: 'edu-certs',
  projects: 'projects',
  contact: 'contact',
  terminal: 'terminal',
};
const messages = {
  help: 'NAVIGATE\n/projects  /certificates  /experience  /skills  /about  /contact\nUse a bare section name to print a summary here.\n\nSHELL\nwhoami · ls · date · clear · coffee · play · matrix\nUp / Down recalls command history.',
  whoami: 'erion — Software engineering, testing, embedded systems and local AI; founder of SpaceEagles; open to opportunities.',
  ls: 'about/  skills/  experience/  education/  projects/  contact/  cv.pdf',
  matrix: 'Wake up, Neo…\nThe Matrix has you.\nFollow the orange glow.',
  coffee: '☕ Brewing coffee… Done. Caffeine level: OPTIMAL.',
  odr: 'Hi Im Odri and I love MATCHAA!',
  mirela: 'balerina capuchina — mi mi mirela ✨',
  erion: 'Un n bank ka mu martu 💵',
  bo: '❄⏲',
};

export function initTerminal({ getPanel, navigate, openGame }) {
  const output = document.querySelector('#out');
  const input = document.querySelector('#in');
  const glow = document.querySelector('#glow-button');
  const history = [];
  let historyIndex = 0;
  let draft = '';
  let glowTimer;

  function line(content, className = '') {
    const element = document.createElement('div');
    element.className = 'line ' + className;
    element.append(content);
    output.append(element);
    while (output.childElementCount > 200) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }

  function echo(command) {
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = 'erion@portfolio:~$ ';
    const content = document.createDocumentFragment();
    content.append(prompt, command);
    line(content);
  }

  function printPanel(panel) {
    const content = document.createDocumentFragment();
    for (const source of panel.querySelectorAll('h3, p:not(.subtitle), li')) {
      const row = document.createElement(source.tagName === 'H3' ? 'strong' : 'div');
      if (source.tagName === 'LI' && source.closest('.kv')) {
        row.append(source.firstElementChild.textContent + ' — ');
        const value = source.lastElementChild;
        row.append(...[...value.childNodes].map(node => node.cloneNode(true)));
      } else {
        row.textContent = source.textContent.trim();
      }
      content.append(row);
    }
    line(content, 'terminal-response muted');
  }

  function revealTypingGame() {
    clearTimeout(glowTimer);
    glow.hidden = false;
    glowTimer = setTimeout(() => {
      if (document.activeElement === glow) input.focus();
      glow.hidden = true;
    }, 60000);
  }

  input.addEventListener('keydown', async (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!history.length) return;
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex += event.key === 'ArrowUp' ? -1 : 1;
      historyIndex = Math.min(history.length, Math.max(0, historyIndex));
      input.value = history[historyIndex] ?? draft;
      input.setSelectionRange(input.value.length, input.value.length);
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const original = input.value.trim();
    input.value = '';
    if (!original) return;

    const command = original.toLowerCase().replace(/^\//, '');
    if (history.at(-1) !== original) history.push(original);
    if (history.length > 50) history.shift();
    historyIndex = history.length;
    draft = '';

    if (command === 'clear') {
      output.replaceChildren();
      return;
    }

    echo(original);
    if (original.startsWith('/') && Object.hasOwn(sections, command)) {
      navigate(sections[command]);
    } else if (command === 'play' || command === 'game') {
      try {
        await openGame();
        line('Launching minigame… Press Esc to exit.', 'muted');
      } catch {
        line('The game could not load. Try the command again.', 'muted');
      }
    } else if (command === 'date') {
      line(new Date().toString(), 'muted');
    } else if (Object.hasOwn(sections, command)) {
      printPanel(getPanel(sections[command]));
    } else if (Object.hasOwn(messages, command)) {
      line(messages[command], 'muted');
      if (command === 'matrix') revealTypingGame();
    } else {
      line('Command "' + original + '" not found. Try "help".', 'muted');
    }
  });
}

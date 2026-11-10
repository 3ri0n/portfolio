const passage = document.querySelector('#text');
const wrap = document.querySelector('#wrap');
const caret = document.querySelector('#caret');
const input = document.querySelector('#typing-input');
const status = document.querySelector('#status');
const time = document.querySelector('#time');
const wpm = document.querySelector('#wpm');
const accuracy = document.querySelector('#acc');
const chars = document.querySelector('#chars');
const bar = document.querySelector('#bar');
const modes = [...document.querySelectorAll('[data-time]')];
const newText = document.querySelector('#newText');
const restart = document.querySelector('#restart');
const focus = document.querySelector('#focus');

let pool = [];
let deck = [];
let spans = [];
let typed = [];
let correct = 0;
let duration = 15;
let startedAt = null;
let timer = 0;
let finished = false;

const fallback = [
  'Practice makes every keystroke feel a little more natural.',
  'The orange glow points the way back to the terminal.',
  'Write clearly, keep your rhythm, and watch the clock.',
  'Small experiments can turn into useful tools.',
];

async function loadPool() {
  try {
    const response = await fetch('./sentences.txt');
    if (!response.ok) return fallback;
    const lines = (await response.text()).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    return lines.length ? [...new Set(lines)] : fallback;
  } catch {
    return fallback;
  }
}

function refillDeck() {
  deck = pool.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function appendPassage() {
  const sentences = Array.from({ length: 6 }, () => {
    if (!deck.length) refillDeck();
    return deck.pop();
  });
  const fragment = document.createDocumentFragment();
  for (const char of sentences.join(' ') + ' ') {
    const span = document.createElement('span');
    span.className = 'c';
    span.textContent = char;
    spans.push(span);
    fragment.append(span);
  }
  passage.append(fragment);
}

function positionCaret() {
  const next = spans[typed.length];
  if (!next) return;
  const rect = next.getBoundingClientRect();
  const bounds = wrap.getBoundingClientRect();
  const top = rect.top - bounds.top + wrap.scrollTop - wrap.clientTop;
  caret.style.left = (rect.left - bounds.left + wrap.scrollLeft - wrap.clientLeft) + 'px';
  caret.style.top = top + 'px';
  if (top < wrap.scrollTop + 12) {
    wrap.scrollTop = Math.max(0, top - 12);
  } else if (top + rect.height > wrap.scrollTop + wrap.clientHeight - 16) {
    wrap.scrollTop = top + rect.height - wrap.clientHeight + 16;
  }
}

function updateStats(elapsed) {
  wpm.textContent = Math.round(correct / 5 * 60000 / Math.max(1000, elapsed));
  accuracy.textContent = (typed.length ? Math.round(correct / typed.length * 100) : 100) + '%';
  chars.textContent = correct + '/' + typed.length;
}

function tick() {
  const elapsed = Math.min(duration * 1000, performance.now() - startedAt);
  time.textContent = Math.ceil(duration - elapsed / 1000);
  bar.style.width = (elapsed / (duration * 10)) + '%';
  updateStats(elapsed);
  if (elapsed >= duration * 1000) {
    clearInterval(timer);
    timer = 0;
    finished = true;
    input.readOnly = true;
    status.textContent = 'Time’s up. Restart to try again.';
    caret.hidden = true;
  }
}

function focusTyping() {
  if (!finished) input.focus({ preventScroll: true });
}

function reset(useNewText = false, focusInput = true) {
  clearInterval(timer);
  timer = 0;
  startedAt = null;
  typed = [];
  correct = 0;
  finished = false;
  input.readOnly = false;
  input.value = '';
  time.textContent = duration;
  bar.style.width = '0%';
  status.textContent = 'The timer starts when you type.';
  caret.hidden = false;
  wrap.scrollTop = 0;

  if (useNewText || !spans.length) {
    spans = [];
    passage.replaceChildren();
    appendPassage();
  } else {
    spans.forEach(span => span.className = 'c');
  }
  positionCaret();
  updateStats(0);
  if (focusInput) focusTyping();
}

function readTyping() {
  if (finished || input.disabled) return;
  const next = Array.from(input.value);
  if (startedAt === null && next.length) {
    startedAt = performance.now();
    timer = setInterval(tick, 200);
    status.textContent = 'Test in progress.';
  }
  while (spans.length - next.length < 180) appendPassage();

  let firstChanged = 0;
  while (firstChanged < typed.length && typed[firstChanged] === next[firstChanged]) firstChanged++;
  for (let i = firstChanged; i < typed.length; i++) {
    if (spans[i].classList.contains('ok')) correct--;
    spans[i].className = 'c';
  }
  for (let i = firstChanged; i < next.length; i++) {
    const match = spans[i].textContent === next[i];
    spans[i].classList.add(match ? 'ok' : 'bad');
    if (match) correct++;
  }
  typed = next;
  updateStats(startedAt === null ? 0 : performance.now() - startedAt);
  positionCaret();
}

input.addEventListener('input', event => {
  if (!event.isComposing) readTyping();
});
input.addEventListener('compositionend', readTyping);
input.addEventListener('paste', event => event.preventDefault());
input.addEventListener('drop', event => event.preventDefault());
focus.addEventListener('click', focusTyping);
wrap.addEventListener('click', focusTyping);
restart.addEventListener('click', () => reset());
newText.addEventListener('click', () => reset(true));
window.addEventListener('resize', positionCaret);
for (const button of modes) {
  button.addEventListener('click', () => {
    for (const mode of modes) {
      const active = mode === button;
      mode.classList.toggle('active', active);
      mode.setAttribute('aria-pressed', String(active));
    }
    duration = Number(button.dataset.time);
    reset(false, false);
  });
}

pool = await loadPool();
reset(true, false);
for (const control of [input, focus, restart, newText, ...modes]) control.disabled = false;

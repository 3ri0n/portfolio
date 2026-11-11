const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const random = (min, max) => min + Math.random() * (max - min);

function canvasScene(canvas, createScene) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  let active = false;
  let frame = 0;
  let paint;

  function draw() {
    paint(true);
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    cancelAnimationFrame(frame);
    if (!active || document.hidden) return;
    paint(false);
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  }

  function resize() {
    if (!active) return;
    const { innerWidth: width, innerHeight: height } = window;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    paint = createScene(context, width, height);
    sync();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  return (enabled) => {
    if (enabled === active) return;
    active = enabled;
    if (enabled) resize();
    else cancelAnimationFrame(frame);
  };
}

function stars(context, width, height) {
  const dots = Array.from({ length: 80 }, () => ({
    x: random(0, width),
    y: random(0, height),
    radius: random(0.4, 2),
    dx: random(-0.075, 0.075),
    dy: random(-0.075, 0.075),
    angle: random(0, 2 * Math.PI),
  }));
  return (moving) => {
    context.clearRect(0, 0, width, height);
    for (const dot of dots) {
      if (moving) {
        dot.x = (dot.x + dot.dx + width) % width;
        dot.y = (dot.y + dot.dy + height) % height;
        dot.angle += 0.01;
      }
      context.beginPath();
      context.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
      context.fillStyle = 'hsla(35, 100%, ' + (72 + 20 * Math.sin(dot.angle)) + '%, 0.7)';
      context.fill();
    }
  };
}

function cheese(context, width, height, image) {
  const count = Math.min(10, Math.max(3, Math.round(width * height / 520000)));
  const pieces = Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    scale: random(0.7, 1.3),
    angle: random(-0.5, 0.5),
    spin: random(-0.002, 0.002),
    dx: random(-0.08, 0.08),
    dy: random(-0.08, 0.08),
    alpha: random(0.28, 0.44),
  }));
  return (moving) => {
    context.clearRect(0, 0, width, height);
    for (const piece of pieces) {
      if (moving) {
        piece.x = (piece.x + piece.dx + width * 1.25) % (width * 1.5) - width * 0.25;
        piece.y = (piece.y + piece.dy + height * 1.25) % (height * 1.5) - height * 0.25;
        piece.angle += piece.spin;
      }
      const w = image.naturalWidth * piece.scale;
      const h = image.naturalHeight * piece.scale;
      context.save();
      context.globalAlpha = piece.alpha;
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.drawImage(image, -w / 2, -h / 2, w, h);
      context.restore();
    }
  };
}

function initFollower() {
  const follower = document.querySelector('#follower');
  const input = document.querySelector('#in');
  let frame = 0;
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let targetX = x;
  let targetY = y;

  function hide() {
    cancelAnimationFrame(frame);
    frame = 0;
    follower.classList.remove('is-tracking');
    document.body.classList.remove('has-follower');
  }

  function draw() {
    frame = 0;
    // Match the original 15% easing and movement angle at the cursor position.
    x += (targetX - x) * .15;
    y += (targetY - y) * .15;
    const dx = targetX - x;
    const dy = targetY - y;
    const moving = Math.abs(dx) + Math.abs(dy) > .4;
    if (!moving) { x = targetX; y = targetY; }
    const angle = moving ? Math.atan2(dy, dx) * 10 / Math.PI : 0;
    follower.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
    if (moving) frame = requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', event => {
    targetX = event.clientX;
    targetY = event.clientY;
    follower.classList.add('is-tracking');
    document.body.classList.add('has-follower');
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener('touchstart', hide, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  input.addEventListener('focus', () => follower.classList.add('is-dimmed'));
  input.addEventListener('blur', () => follower.classList.remove('is-dimmed'));
}

export function initEffects() {
  const toggleStars = canvasScene(document.querySelector('#fx'), stars);
  const image = new Image();
  const toggleCheese = canvasScene(document.querySelector('#cheeseBG'),
    (context, width, height) => cheese(context, width, height, image));
  let welcomeOpen = true;
  image.addEventListener('load', () => toggleCheese(!welcomeOpen), { once: true });
  image.src = new URL('../cheese.png', import.meta.url);
  initFollower();

  return (showWelcome) => {
    welcomeOpen = showWelcome;
    toggleStars(showWelcome);
    toggleCheese(!showWelcome && image.complete && image.naturalWidth > 0);
  };
}

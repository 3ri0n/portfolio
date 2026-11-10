const random = (min, max) => min + Math.random() * (max - min);

export function initGame() {
  const dialog = document.querySelector('#gameModal');
  const canvas = document.querySelector('#gameCanvas');
  const context = canvas.getContext('2d');
  const pause = document.querySelector('#gamePause');
  const status = document.querySelector('#gameStatus');
  const { width, height } = canvas;
  const player = { x: 0, y: height - 60, width: 44, height: 18 };
  const movement = new Map();
  let obstacles = [];
  let orbs = [];
  let score = 0;
  let frame = 0;
  let lastTime = 0;
  let obstacleTime = 0;
  let orbTime = 0;
  let state = 'closed';
  let accent = '#ff8c00';

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = accent;
    context.fillRect(player.x, player.y, player.width, player.height);
    context.fillRect(player.x + 10, player.y - 6, player.width - 20, 6);

    context.fillStyle = 'rgba(255,255,255,.35)';
    for (const obstacle of obstacles) {
      context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    context.fillStyle = 'rgba(255,180,80,.9)';
    for (const orb of orbs) {
      context.beginPath();
      context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = accent;
    context.font = '16px monospace';
    context.fillText('Score: ' + score, 14, 25);
    if (state === 'ended') {
      context.fillStyle = 'rgba(0,0,0,.66)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#ff746e';
      context.font = 'bold 26px monospace';
      context.textAlign = 'center';
      context.fillText('Game Over — Score: ' + score, width / 2, height / 2);
      context.fillStyle = '#fff';
      context.font = '16px monospace';
      context.fillText('Press Enter to play again', width / 2, height / 2 + 32);
      context.textAlign = 'start';
    }
  }

  function move(amount) {
    player.x = Math.min(width - player.width, Math.max(0, player.x + amount));
  }

  function update(now) {
    frame = 0;
    if (state !== 'running') return;
    const elapsed = lastTime ? Math.min(32, now - lastTime) : 16;
    lastTime = now;
    const step = elapsed / (1000 / 60);
    obstacleTime += elapsed;
    orbTime += elapsed;
    if (obstacleTime >= 650) {
      const obstacleWidth = random(40, 110);
      obstacles.push({
        x: random(0, width - obstacleWidth), y: -20,
        width: obstacleWidth, height: 14, speed: random(2.2, 4.6),
      });
      obstacleTime -= 650;
    }
    if (orbTime >= 1200) {
      orbs.push({ x: random(16, width - 16), y: -20, radius: 8, speed: random(2.4, 4.2) });
      orbTime -= 1200;
    }

    const directions = [...movement.values()];
    move((Number(directions.includes(1)) - Number(directions.includes(-1))) * 6 * step);
    for (const obstacle of obstacles) obstacle.y += obstacle.speed * step;
    obstacles = obstacles.filter(obstacle => obstacle.y < height + 40);
    orbs = orbs.filter(orb => {
      orb.y += orb.speed * step;
      const caught = Math.abs(orb.x - (player.x + player.width / 2)) < player.width / 2 + orb.radius &&
        Math.abs(orb.y - (player.y + player.height / 2)) < player.height / 2 + orb.radius;
      if (caught) score += 10;
      return !caught && orb.y < height + 20;
    });

    if (obstacles.some(obstacle => obstacle.x < player.x + player.width &&
        obstacle.x + obstacle.width > player.x && obstacle.y < player.y + player.height &&
        obstacle.y + obstacle.height > player.y)) {
      state = 'ended';
      movement.clear();
      status.textContent = 'Game over. Score: ' + score + '.';
      pause.textContent = 'Restart';
    }
    draw();
    if (state === 'running') frame = requestAnimationFrame(update);
  }

  function resume() {
    state = 'running';
    lastTime = 0;
    status.textContent = 'Use the arrows or the buttons below to move.';
    pause.textContent = 'Pause';
    frame = requestAnimationFrame(update);
  }

  function pauseGame() {
    state = 'paused';
    cancelAnimationFrame(frame);
    frame = 0;
    movement.clear();
    status.textContent = 'Paused. Score: ' + score + '.';
    pause.textContent = 'Resume';
  }

  function restart() {
    cancelAnimationFrame(frame);
    movement.clear();
    player.x = (width - player.width) / 2;
    obstacles = [];
    orbs = [];
    score = 0;
    obstacleTime = 0;
    orbTime = 0;
    resume();
    draw();
  }

  pause.addEventListener('click', () => {
    if (state === 'running') pauseGame();
    else if (state === 'paused') resume();
    else if (state === 'ended') restart();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && state === 'ended' && event.target === canvas) {
      event.preventDefault();
      restart();
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (state === 'running') movement.set(event.key, event.key === 'ArrowLeft' ? -1 : 1);
  });
  dialog.addEventListener('keyup', event => movement.delete(event.key));
  for (const button of dialog.querySelectorAll('[data-move]')) {
    const direction = Number(button.dataset.move);
    button.addEventListener('pointerdown', (event) => {
      if (state !== 'running') return;
      button.setPointerCapture(event.pointerId);
      movement.set(event.pointerId, direction);
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(eventName, event => movement.delete(event.pointerId));
    }
    button.addEventListener('click', (event) => {
      if (event.detail === 0 && state === 'running') move(direction * 20);
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'running') pauseGame();
  });
  window.addEventListener('blur', () => movement.clear());
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    state = 'closed';
    movement.clear();
    document.body.classList.remove('game-open');
  });

  return {
    open() {
      if (!context) throw new Error('Canvas unavailable');
      if (dialog.open) return;
      accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff8c00';
      dialog.showModal();
      document.body.classList.add('game-open');
      restart();
      canvas.focus({ preventScroll: true });
    },
  };
}

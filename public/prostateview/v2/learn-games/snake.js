const CELLS = 18;
const START_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];

export function mountSnake(root, options = {}) {
  const bestKey = options.bestKey || "pv-minigame-snake-best";
  const gameId = options.gameId || "snake";

  root.innerHTML = `
    <div class="pv2-snake-game">
      <div class="pv2-game-stats">
        <span data-score>Score: 0</span>
        <span data-best>Best: 0</span>
        <button type="button" class="pv2-snake-sound" data-sound aria-pressed="false">Sound off</button>
      </div>
      <canvas class="pv2-snake-board" data-board tabindex="0" aria-label="Snake game board"></canvas>
      <div class="pv2-snake-controls" aria-label="Snake controls">
        <button type="button" class="pv2-snake-control" data-dir="up">Up</button>
        <button type="button" class="pv2-snake-control" data-dir="left">Left</button>
        <button type="button" class="pv2-snake-control" data-dir="down">Down</button>
        <button type="button" class="pv2-snake-control" data-dir="right">Right</button>
      </div>
      <p class="pv2-game-hint">Arrow keys, WASD, swipe, or tap the controls.</p>
      <p class="pv2-game-state" data-state></p>
    </div>
  `;

  const canvas = root.querySelector("[data-board]");
  const scoreEl = root.querySelector("[data-score]");
  const bestEl = root.querySelector("[data-best]");
  const stateEl = root.querySelector("[data-state]");
  const soundButton = root.querySelector("[data-sound]");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || document.documentElement.classList.contains("a11y-reduce-motion");
  const tickMs = reduceMotion ? 165 : 130;

  let snake = [];
  let food = { x: 13, y: 9 };
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let score = 0;
  let best = readBest();
  let running = false;
  let gameOver = false;
  let destroyed = false;
  let boardPx = 320;
  let cell = boardPx / CELLS;
  let raf = 0;
  let lastTick = 0;
  let touchStart = null;
  let soundOn = false;
  let audioContext = null;

  function readBest() {
    try {
      return parseInt(localStorage.getItem(bestKey) || "0", 10) || 0;
    } catch (error) {
      return 0;
    }
  }

  function writeBest(value) {
    if (value <= best) return;
    best = value;
    try { localStorage.setItem(bestKey, String(best)); } catch (error) {}
    window.dispatchEvent(new CustomEvent("pv-minigame-score", { detail: { gameId, best } }));
  }

  function cssHsl(name, fallback) {
    const raw = getComputedStyle(root).getPropertyValue(name).trim();
    return raw ? `hsl(${raw})` : fallback;
  }

  function colors() {
    return {
      fg: cssHsl("--fg", "#f3eee5"),
      muted: cssHsl("--muted", "#aca39a"),
      card: cssHsl("--card", "#211b16"),
      line: cssHsl("--line", "#3a3028"),
      accent: cssHsl("--accent", "#36d6c4"),
      key: cssHsl("--key", "#e3a23a"),
      mnem: cssHsl("--mnem", "#58bf76"),
      warn: cssHsl("--warn", "#e06961"),
    };
  }

  function reset() {
    snake = START_SNAKE.map((part) => ({ ...part }));
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    food = placeFood();
    running = false;
    gameOver = false;
    lastTick = 0;
    updateStats();
    stateEl.textContent = "Choose a direction to start.";
    draw();
    window.setTimeout(() => canvas.focus({ preventScroll: true }), 0);
  }

  function placeFood() {
    let pick = { x: 0, y: 0 };
    do {
      pick = {
        x: Math.floor(Math.random() * CELLS),
        y: Math.floor(Math.random() * CELLS),
      };
    } while (snake.some((part) => part.x === pick.x && part.y === pick.y));
    return pick;
  }

  function start() {
    if (running || gameOver || destroyed) return;
    running = true;
    stateEl.textContent = "";
    lastTick = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!running || destroyed) return;
    if (now - lastTick >= tickMs) {
      step();
      lastTick = now;
    }
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) {
      endGame();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      writeBest(score);
      food = placeFood();
      beep(520, 0.045);
    } else {
      snake.pop();
    }
    updateStats();
  }

  function endGame() {
    running = false;
    gameOver = true;
    writeBest(score);
    updateStats();
    stateEl.textContent = "Game over. Press Play again, or Space to restart.";
    beep(180, 0.12);
    draw();
  }

  function updateStats() {
    scoreEl.textContent = `Score: ${score}`;
    bestEl.textContent = `Best: ${Math.max(best, score)}`;
  }

  function setDirection(name) {
    const dirs = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const candidate = dirs[name];
    if (!candidate || gameOver) return;
    if (candidate.x + dir.x === 0 && candidate.y + dir.y === 0) return;
    nextDir = candidate;
    start();
  }

  function onKey(event) {
    const keyMap = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
    };
    if (event.code === "Space" && gameOver) {
      event.preventDefault();
      reset();
      return;
    }
    const name = keyMap[event.code];
    if (!name) return;
    event.preventDefault();
    setDirection(name);
  }

  function onTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchMove(event) {
    event.preventDefault();
  }

  function onTouchEnd(event) {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left");
    else setDirection(dy > 0 ? "down" : "up");
  }

  function roundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function draw() {
    if (!ctx) return;
    const c = colors();
    ctx.clearRect(0, 0, boardPx, boardPx);
    ctx.fillStyle = c.card;
    ctx.fillRect(0, 0, boardPx, boardPx);

    ctx.strokeStyle = c.line;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;
    for (let i = 1; i < CELLS; i += 1) {
      const pos = i * cell;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, boardPx);
      ctx.moveTo(0, pos);
      ctx.lineTo(boardPx, pos);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const foodX = food.x * cell + cell / 2;
    const foodY = food.y * cell + cell / 2;
    ctx.fillStyle = c.key;
    ctx.beginPath();
    ctx.arc(foodX, foodY, cell * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.warn;
    ctx.lineWidth = 2;
    ctx.stroke();

    snake.forEach((part, index) => {
      const inset = index === 0 ? 2 : 3.5;
      const x = part.x * cell + inset;
      const y = part.y * cell + inset;
      const size = cell - inset * 2;
      roundedRect(x, y, size, size, Math.max(5, cell * 0.22));
      ctx.fillStyle = index === 0 ? c.accent : c.mnem;
      ctx.fill();
      ctx.strokeStyle = c.fg;
      ctx.globalAlpha = index === 0 ? 0.46 : 0.18;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    if (!running && !gameOver) drawOverlay("Ready");
    if (gameOver) drawOverlay("Game over");
  }

  function drawOverlay(text) {
    const c = colors();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.fillRect(0, 0, boardPx, boardPx);
    ctx.fillStyle = c.fg;
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, boardPx / 2, boardPx / 2);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    boardPx = Math.max(260, Math.floor(rect.width || 320));
    cell = boardPx / CELLS;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(boardPx * ratio);
    canvas.height = Math.floor(boardPx * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function beep(frequency, seconds) {
    if (!soundOn) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    audioContext = audioContext || new AudioCtor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.value = 0.035;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + seconds);
  }

  function toggleSound() {
    soundOn = !soundOn;
    soundButton.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundButton.textContent = soundOn ? "Sound on" : "Sound off";
    beep(420, 0.04);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener("keydown", onKey);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });
  root.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => setDirection(button.getAttribute("data-dir")));
  });
  soundButton.addEventListener("click", toggleSound);

  reset();

  return {
    restart: reset,
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    },
  };
}

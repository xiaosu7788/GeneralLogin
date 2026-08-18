(() => {
  const canvas = document.getElementById("triangle-field");
  const themeButtons = Array.from(document.querySelectorAll("[data-theme]"));
  const jumpButton = document.getElementById("jump-button");
  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  const TAU = Math.PI * 2;
  const BASE_CELL = 60;
  const MAX_COLS = 36;
  const MAX_ROWS = 22;
  const POINTER_RADIUS = 150;
  const MAX_FLIP = Math.PI * 0.92;
  const TRANSITION_SPINS = 2.75;
  const TRANSITION_ROTATION = TAU * TRANSITION_SPINS;
  const SPRING = 58;
  const DAMPING = 13.5;
  const THEME_PRESETS = [
    {
      brightnessBase: 1.02,
      brightnessRange: 0.18,
      palettes: [
        [[255, 72, 112], [255, 214, 86]],
        [[55, 236, 222], [126, 154, 255]],
        [[255, 139, 65], [255, 248, 174]],
        [[184, 108, 255], [255, 124, 192]]
      ]
    },
    {
      brightnessBase: 1.06,
      brightnessRange: 0.16,
      palettes: [
        [[62, 232, 255], [138, 166, 255]],
        [[156, 255, 228], [255, 255, 255]],
        [[96, 178, 255], [216, 246, 255]],
        [[255, 132, 166], [92, 235, 255]]
      ]
    },
    {
      brightnessBase: 1.04,
      brightnessRange: 0.18,
      palettes: [
        [[255, 83, 62], [255, 196, 108]],
        [[255, 110, 176], [255, 234, 158]],
        [[255, 137, 66], [255, 84, 140]],
        [[255, 204, 98], [255, 255, 255]]
      ]
    },
    {
      brightnessBase: 1.02,
      brightnessRange: 0.2,
      palettes: [
        [[182, 96, 255], [84, 255, 219]],
        [[255, 116, 202], [255, 241, 137]],
        [[59, 171, 255], [255, 115, 160]],
        [[103, 255, 148], [255, 255, 255]]
      ]
    },
    {
      brightnessBase: 1.05,
      brightnessRange: 0.18,
      palettes: [
        [[113, 255, 156], [49, 192, 255]],
        [[255, 94, 150], [255, 212, 94]],
        [[162, 112, 255], [246, 255, 255]],
        [[255, 132, 78], [218, 246, 255]]
      ]
    }
  ];
  const JUMP_INTERVAL = 5;
  const INTRO_INTERVAL = 8;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let cellSize = BASE_CELL;
  let cols = 0;
  let rows = 0;
  let tiles = [];
  let staticCanvas = document.createElement("canvas");
  let staticCtx = staticCanvas.getContext("2d", { alpha: true });
  let rafId = 0;
  let lastFrame = 0;
  let themeIndex = 0;
  let jumpState = null;
  let introPending = true;
  let introState = null;

  const activeTiles = new Set();

  const pointer = {
    active: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    time: 0,
    glow: 0
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  function addQuad(tris, x, y, w, h, tone = 0) {
    tris.push(
      { p: [x, y, x + w, y, x, y + h], tone },
      { p: [x + w, y, x + w, y + h, x, y + h], tone: tone + 0.12 }
    );
  }

  function addSlash(tris, x1, y1, x2, y2, thickness, tone = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const nx = (-dy / length) * thickness * 0.5;
    const ny = (dx / length) * thickness * 0.5;

    tris.push(
      {
        p: [
          x1 + nx,
          y1 + ny,
          x2 + nx,
          y2 + ny,
          x1 - nx,
          y1 - ny
        ],
        tone
      },
      {
        p: [
          x2 + nx,
          y2 + ny,
          x2 - nx,
          y2 - ny,
          x1 - nx,
          y1 - ny
        ],
        tone: tone + 0.12
      }
    );
  }

  function makeTemplates() {
    const z = [];
    addQuad(z, 0.04, 0.08, 0.92, 0.18, 0.08);
    addSlash(z, 0.86, 0.17, 0.14, 0.83, 0.2, 0.28);
    addQuad(z, 0.04, 0.74, 0.92, 0.18, -0.02);

    const r = [];
    addQuad(r, 0.05, 0.08, 0.19, 0.84, -0.04);
    addQuad(r, 0.2, 0.08, 0.54, 0.17, 0.14);
    addQuad(r, 0.2, 0.43, 0.52, 0.16, 0.04);
    addQuad(r, 0.68, 0.18, 0.2, 0.31, 0.22);
    addSlash(r, 0.25, 0.55, 0.88, 0.91, 0.17, 0.36);

    return { Z: z, R: r };
  }

  const templates = makeTemplates();

  function hash2(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function createTile(col, row) {
    const x = col * cellSize;
    const y = row * cellSize;
    const char = col % 2 === 0 ? "Z" : "R";
    const seed = hash2(col + 4.2, row + 8.7);

    return {
      col,
      row,
      index: row * cols + col,
      x,
      y,
      cx: x + cellSize * 0.5,
      cy: y + cellSize * 0.5,
      char,
      hidden: false,
      transition: "",
      opacity: 1,
      paletteSeed: hash2(col * 2.17 + 8.5, row * 3.41 + 1.6),
      brightnessSeed: hash2(col * 4.9, row * 6.3),
      triangleSeed: hash2(col * 12.9 + 1.1, row * 9.7 + 2.4),
      paletteA: [255, 72, 112],
      paletteB: [255, 214, 86],
      brightness: 1,
      rotation: 0,
      velocity: 0,
      target: 0,
      phase: seed * TAU,
      inertia: lerp(0.82, 1.24, seed)
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, width * height > 2500000 ? 1.2 : 1.35);

    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    staticCanvas.width = canvas.width;
    staticCanvas.height = canvas.height;
    staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellSize = Math.max(
      BASE_CELL,
      Math.ceil(Math.max(width / MAX_COLS, height / MAX_ROWS))
    );
    cols = Math.ceil(width / cellSize) + 1;
    rows = Math.ceil(height / cellSize) + 1;

    tiles = [];
    activeTiles.clear();
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        tiles.push(createTile(col, row));
      }
    }

    applyTheme(themeIndex, false);
    renderStaticLayer();
    drawFrame();
  }

  function applyTheme(nextThemeIndex, shouldRender = true) {
    themeIndex = (nextThemeIndex + THEME_PRESETS.length) % THEME_PRESETS.length;
    const theme = THEME_PRESETS[themeIndex];

    for (const tile of tiles) {
      const paletteIndex = Math.floor(tile.paletteSeed * theme.palettes.length) % theme.palettes.length;
      const palette = theme.palettes[paletteIndex];
      tile.paletteA = palette[0];
      tile.paletteB = palette[1];
      tile.brightness = theme.brightnessBase + tile.brightnessSeed * theme.brightnessRange;
    }

    for (const button of themeButtons) {
      button.classList.toggle("active", Number(button.dataset.theme) === themeIndex);
    }

    if (shouldRender) {
      renderStaticLayer();
      drawFrame();
    }
  }

  function renderStaticLayer() {
    staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    staticCtx.clearRect(0, 0, width, height);

    for (const tile of tiles) {
      if (!tile.hidden) {
        drawTile(staticCtx, tile, 0, false);
      }
    }
  }

  function clearTile(context, tile) {
    context.clearRect(tile.x - 1, tile.y - 1, cellSize + 2, cellSize + 2);
  }

  function colorFor(tile, triangle, rotation, back, index) {
    const a = tile.paletteA;
    const b = tile.paletteB;
    const facetSeed = hash2(tile.triangleSeed * 23.7 + index * 5.1, tile.phase * 0.31 + index * 9.4);
    const hueSeed = hash2(tile.col * 4.6 + index * 1.7, tile.row * 6.2 + index * 2.9);
    const mix = clamp(
      0.45 +
        triangle.tone +
        (facetSeed - 0.5) * 0.16 +
        Math.abs(Math.sin(rotation)) * 0.18,
      0,
      1
    );
    const facetLight = 0.92 + facetSeed * 0.16;
    const light =
      (back ? 0.52 : 0.98 + Math.abs(Math.sin(rotation)) * 0.18) *
      tile.brightness *
      facetLight;
    const channelShift = (hueSeed - 0.5) * 14;
    const r = Math.round(lerp(a[0], b[0], mix) * light + channelShift);
    const g = Math.round(lerp(a[1], b[1], mix) * light - channelShift * 0.45);
    const blue = Math.round(lerp(a[2], b[2], mix) * light + (facetSeed - 0.5) * 12);

    return `rgb(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(blue, 0, 255)})`;
  }

  function project(tile, px, py, rotation) {
    const size = cellSize * 0.94;
    const originX = tile.x + cellSize * 0.03;
    const originY = tile.y + cellSize * 0.03;
    const cx = originX + size * 0.5;
    const localX = originX + px * size;
    const localY = originY + py * size;
    let scaleX = Math.cos(rotation);

    if (Math.abs(scaleX) < 0.045) {
      scaleX = scaleX < 0 ? -0.045 : 0.045;
    }

    const perspective = Math.sin(rotation);
    return {
      x: cx + (localX - cx) * scaleX + perspective * (py - 0.5) * cellSize * 0.12,
      y: localY - perspective * (px - 0.5) * cellSize * 0.1
    };
  }

  function drawTile(context, tile, rotation, active) {
    const template = templates[tile.char];
    const back = Math.cos(rotation) < 0;
    const flipAmount = Math.abs(Math.sin(rotation));
    let transitionAlpha = 1;

    if (tile.transition === "hide") {
      transitionAlpha = clamp(1 - Math.abs(rotation) / TRANSITION_ROTATION, 0, 1);
    } else if (tile.transition === "show") {
      transitionAlpha = clamp(1 - Math.abs(rotation) / TRANSITION_ROTATION, 0, 1);
    }

    if (transitionAlpha <= 0.01) {
      return;
    }

    context.save();
    context.globalAlpha *= transitionAlpha * tile.opacity;

    for (let i = 0; i < template.length; i += 1) {
      const triangle = template[i];
      const p = triangle.p;
      const a = project(tile, p[0], p[1], rotation);
      const b = project(tile, p[2], p[3], rotation);
      const c = project(tile, p[4], p[5], rotation);

      context.fillStyle = colorFor(tile, triangle, rotation, back, i);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.lineTo(c.x, c.y);
      context.closePath();
      context.fill();
    }

    context.restore();
  }

  function activateTile(tile, target, velocity) {
    if (tile.hidden || tile.transition) {
      return;
    }

    tile.target = Math.abs(target) > Math.abs(tile.target) ? target : tile.target;
    tile.velocity += velocity;
    activeTiles.add(tile);
  }

  function visibleTileCount() {
    let count = 0;

    for (const tile of tiles) {
      if (!tile.hidden) {
        count += 1;
      }
    }

    return count;
  }

  function startTileExit(tile) {
    if (tile.hidden) {
      return;
    }

    tile.transition = "hide";
    tile.rotation = 0;
    tile.velocity = 0;
    tile.target = TRANSITION_ROTATION;
    tile.opacity = 1;
    activeTiles.add(tile);
  }

  function startTileEnter(tile) {
    if (!tile.hidden) {
      return;
    }

    tile.hidden = false;
    tile.transition = "show";
    tile.rotation = TRANSITION_ROTATION;
    tile.velocity = 0;
    tile.target = 0;
    tile.opacity = 1;
    activeTiles.add(tile);
  }

  function buildJumpQueue(mode) {
    const queue = tiles.filter((tile) => (mode === "hide" ? !tile.hidden : tile.hidden));

    queue.sort((a, b) => {
      if (mode === "hide") {
        return b.row + b.col - (a.row + a.col) || b.col - a.col;
      }

      return a.row + a.col - (b.row + b.col) || a.col - b.col;
    });

    return queue;
  }

  function startJumpTransition() {
    if (jumpState) {
      return;
    }

    pointer.active = false;
    pointer.glow = 0;

    for (const tile of activeTiles) {
      if (!tile.transition) {
        tile.rotation = 0;
        tile.velocity = 0;
        tile.target = 0;
      }
    }
    activeTiles.clear();

    const mode = visibleTileCount() > 0 ? "hide" : "show";
    const queue = buildJumpQueue(mode);

    jumpState = {
      mode,
      queue,
      nextAt: performance.now(),
      interval: JUMP_INTERVAL
    };

    requestTick();
  }

  function startIntroTransition() {
    if (!introPending || introState || jumpState) {
      return;
    }

    const queue = tiles.slice().sort((a, b) => a.row + a.col - (b.row + b.col) || a.col - b.col);

    for (const tile of tiles) {
      tile.hidden = true;
      tile.transition = "";
      tile.rotation = 0;
      tile.velocity = 0;
      tile.target = 0;
    }

    staticCtx.clearRect(0, 0, width, height);
    activeTiles.clear();

    introState = {
      queue,
      nextAt: performance.now() + 160,
      interval: INTRO_INTERVAL
    };

    requestTick();
  }

  function processJumpQueue(now) {
    if (!jumpState) {
      return;
    }

    while (jumpState.queue.length && now >= jumpState.nextAt) {
      const tile = jumpState.queue.shift();

      if (jumpState.mode === "hide") {
        startTileExit(tile);
      } else {
        startTileEnter(tile);
      }

      jumpState.nextAt += jumpState.interval;
    }

    if (!jumpState.queue.length && activeTiles.size === 0) {
      jumpState = null;
    }
  }

  function processIntroQueue(now) {
    if (!introState) {
      return;
    }

    while (introState.queue.length && now >= introState.nextAt) {
      const tile = introState.queue.shift();
      startTileEnter(tile);
      introState.nextAt += introState.interval;
    }

    if (!introState.queue.length && activeTiles.size === 0) {
      introState = null;
      introPending = false;
    }
  }

  function disturbAt(x, y, vx, vy, speed) {
    if (jumpState) {
      return;
    }

    const radius = POINTER_RADIUS;
    const colStart = clamp(Math.floor((x - radius) / cellSize), 0, cols - 1);
    const colEnd = clamp(Math.ceil((x + radius) / cellSize), 0, cols - 1);
    const rowStart = clamp(Math.floor((y - radius) / cellSize), 0, rows - 1);
    const rowEnd = clamp(Math.ceil((y + radius) / cellSize), 0, rows - 1);
    const length = Math.hypot(vx, vy);
    const nx = length > 1 ? vx / length : 1;
    const ny = length > 1 ? vy / length : 0;
    const speedBoost = clamp(speed / 900, 0, 1.65);

    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        const tile = tiles[row * cols + col];
        const dx = tile.cx - x;
        const dy = tile.cy - y;
        const distance = Math.hypot(dx, dy);

        if (distance > radius) {
          continue;
        }

        const falloff = Math.pow(1 - distance / radius, 2.25);
        const directional = clamp((dx * nx + dy * ny) / radius, -0.32, 1);
        const sign = length > 1 ? Math.sign(vx || nx || 1) : col % 2 === 0 ? 1 : -1;
        const strength = falloff * (0.84 + directional * 0.36) * (0.92 + speedBoost);
        const target = clamp(sign * strength * MAX_FLIP, -MAX_FLIP, MAX_FLIP);

        activateTile(tile, target, sign * strength * 4.8);
      }
    }

    requestTick();
  }

  function pointerMove(event) {
    if (jumpState) {
      return;
    }

    const now = performance.now();
    const x = event.clientX;
    const y = event.clientY;

    if (!pointer.active) {
      pointer.active = true;
      pointer.x = x;
      pointer.y = y;
      pointer.px = x;
      pointer.py = y;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.speed = 0;
      pointer.time = now;
      pointer.glow = 1;
      disturbAt(x, y, 1, 0, 280);
      return;
    }

    const dt = Math.max((now - pointer.time) / 1000, 0.012);
    const rawVx = (x - pointer.x) / dt;
    const rawVy = (y - pointer.y) / dt;

    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.vx = lerp(pointer.vx, rawVx, 0.55);
    pointer.vy = lerp(pointer.vy, rawVy, 0.55);
    pointer.speed = Math.hypot(pointer.vx, pointer.vy);
    pointer.time = now;
    pointer.glow = 1;

    disturbAt(x, y, pointer.vx, pointer.vy, Math.max(pointer.speed, 260));
  }

  function pointerLeave() {
    pointer.active = false;
    pointer.glow = 0;
  }

  function update(dt, now) {
    processIntroQueue(now);
    processJumpQueue(now);
    pointer.glow *= Math.pow(0.08, dt);

    for (const tile of Array.from(activeTiles)) {
      // The mouse writes a temporary flip target directly into nearby cells.
      // A damped spring chases that target, then both target and velocity decay
      // so the Z/R block visibly flips and settles back to the cached front.
      if (!tile.transition) {
        tile.target *= Math.pow(0.018, dt);
      }

      const acceleration = ((tile.target - tile.rotation) * SPRING - tile.velocity * DAMPING) / tile.inertia;
      tile.velocity += acceleration * dt;
      tile.rotation += tile.velocity * dt;

      if (tile.transition === "hide") {
        const alpha = clamp(1 - Math.abs(tile.rotation) / TRANSITION_ROTATION, 0, 1);

        if (alpha < 0.045 || Math.abs(tile.rotation) > TRANSITION_ROTATION * 0.98) {
          tile.hidden = true;
          tile.transition = "";
          tile.rotation = 0;
          tile.velocity = 0;
          tile.target = 0;
          activeTiles.delete(tile);
          clearTile(staticCtx, tile);
          continue;
        }
      }

      if (tile.transition === "show") {
        const alpha = clamp(1 - Math.abs(tile.rotation) / TRANSITION_ROTATION, 0, 1);

        if (alpha > 0.985 && Math.abs(tile.velocity) < 0.12) {
          tile.transition = "";
          tile.rotation = 0;
          tile.velocity = 0;
          tile.target = 0;
          activeTiles.delete(tile);
          drawTile(staticCtx, tile, 0, false);
          continue;
        }
      }

      if (
        !tile.transition &&
        Math.abs(tile.rotation) < 0.006 &&
        Math.abs(tile.velocity) < 0.025 &&
        Math.abs(tile.target) < 0.006
      ) {
        tile.rotation = 0;
        tile.velocity = 0;
        tile.target = 0;
        activeTiles.delete(tile);
      }
    }
  }

  function drawPointerGlow() {
    if (pointer.glow < 0.02) {
      return;
    }

    const radius = POINTER_RADIUS * 0.72;
    const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
    glow.addColorStop(0, `rgba(255, 255, 255, ${0.12 * pointer.glow})`);
    glow.addColorStop(0.34, `rgba(255, 70, 106, ${0.07 * pointer.glow})`);
    glow.addColorStop(0.72, `rgba(40, 226, 207, ${0.045 * pointer.glow})`);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
  }

  function drawFrame() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(staticCanvas, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const tile of activeTiles) {
      clearTile(ctx, tile);
      drawTile(ctx, tile, tile.rotation, true);
    }

    drawPointerGlow();
  }

  function requestTick() {
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    rafId = 0;

    if (!lastFrame) {
      lastFrame = now;
    }

    const dt = clamp((now - lastFrame) / 1000, 0.001, 0.033);
    lastFrame = now;

    update(dt, now);
    drawFrame();

    if (introState || jumpState || activeTiles.size > 0 || pointer.glow > 0.02) {
      requestTick();
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("pointerleave", pointerLeave);
  window.addEventListener("blur", pointerLeave);
  for (const button of themeButtons) {
    button.addEventListener("click", () => {
      applyTheme(Number(button.dataset.theme));
    });
  }
  jumpButton.addEventListener("click", startJumpTransition);
  window.addEventListener("beforeunload", () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });

  resize();
  startIntroTransition();
})();

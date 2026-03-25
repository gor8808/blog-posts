(() => {
  const canvas = document.getElementById('not-found-grid');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Thick block font bitmaps — 9 columns x 11 rows, 2-3 cell wide strokes
  const FONT = {
    N: [
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,0,1,1],
      [1,1,1,1,0,0,0,1,1],
      [1,1,0,1,1,0,0,1,1],
      [1,1,0,0,1,1,0,1,1],
      [1,1,0,0,0,1,1,1,1],
      [1,1,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
    ],
    O: [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,0],
      [1,1,1,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
    ],
    T: [
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,0,0],
    ],
    F: [
      [1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0],
    ],
    U: [
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,0,0],
    ],
    D: [
      [1,1,1,1,1,0,0,0,0],
      [1,1,1,1,1,1,0,0,0],
      [1,1,0,0,1,1,1,0,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,0],
      [1,1,0,0,1,1,1,0,0],
      [1,1,1,1,1,1,0,0,0],
      [1,1,1,1,1,0,0,0,0],
    ],
  };

  const CHAR_W = 9;
  const CHAR_GAP = 2;
  const LINE_GAP = 3;
  const PULSE_SPEED = Math.PI / 1000;

  // Options to try:
  // 1: '✳' / '╲'   — asterisk + diagonal slash
  // 2: '※' / '·'   — reference mark + middle dot
  // 3: '■' / '/'   — filled square + slash
  // 4: '#' / '.'   — hash + dot
  // 5: '✦' / '+'   — star + plus
  // Each cell picks a random character
  const ON_CHARS = '0123456789';
  const OFF_CHARS = '01';
  const GLYPH_ON = null;  // random from ON_CHARS
  const GLYPH_OFF = null; // random from OFF_CHARS

  const line1 = 'NOT';
  const line2 = 'FOUND';

  // Calculate grid dimensions
  function lineWidth(text) {
    return text.length * CHAR_W + (text.length - 1) * CHAR_GAP;
  }
  function lineHeight(text) {
    return Math.max(...[...text].map(ch => FONT[ch] ? FONT[ch].length : 0));
  }

  const line1W = lineWidth(line1);
  const line2W = lineWidth(line2);
  const line1H = lineHeight(line1);
  const line2H = lineHeight(line2);
  const gridCols = Math.max(line1W, line2W);
  const gridRows = line1H + LINE_GAP + line2H;
  const line1Offset = Math.floor((gridCols - line1W) / 2);
  const line2Offset = Math.floor((gridCols - line2W) / 2);

  // Build full grid
  const grid = [];
  for (let r = 0; r < gridRows; r++) {
    grid[r] = new Array(gridCols).fill(0);
  }

  function stampLine(text, offsetX, offsetY) {
    let cx = offsetX;
    for (const ch of text) {
      const bitmap = FONT[ch];
      if (!bitmap) { cx += CHAR_W + CHAR_GAP; continue; }
      for (let r = 0; r < bitmap.length; r++) {
        for (let c = 0; c < CHAR_W; c++) {
          if (bitmap[r][c] && (offsetY + r) < gridRows && (cx + c) < gridCols) {
            grid[offsetY + r][cx + c] = 1;
          }
        }
      }
      cx += CHAR_W + CHAR_GAP;
    }
  }

  stampLine(line1, line1Offset, 0);
  stampLine(line2, line2Offset, line1H + LINE_GAP);

  // Build cell lists
  const onCells = [];
  const allCells = [];
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const isOn = grid[r][c] === 1;
      const chars = isOn ? ON_CHARS : OFF_CHARS;
      const cell = {
        col: c,
        row: r,
        on: isOn,
        glyph: chars[Math.floor(Math.random() * chars.length)],
        phase: Math.random() * Math.PI * 2,
        revealed: false,
      };
      allCells.push(cell);
      if (isOn) onCells.push(cell);
    }
  }

  // Shuffle on-cells for entrance
  const shuffledOn = onCells.slice();
  for (let i = shuffledOn.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOn[i], shuffledOn[j]] = [shuffledOn[j], shuffledOn[i]];
  }

  const batchSize = Math.ceil(onCells.length / 60);
  let revealIndex = 0;
  let entranceDone = false;
  let startTime = null;
  let animId = null;
  let colorRgb = { r: 33, g: 37, b: 41 };

  function readThemeColor() {
    // Use a probe element to get the actual resolved body text color
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;color:var(--bs-body-color,inherit)';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    const m = computed.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      colorRgb = { r: +m[1], g: +m[2], b: +m[3] };
    } else {
      // Fallback: dark for light mode, light for dark mode
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      colorRgb = isDark ? { r: 222, g: 226, b: 230 } : { r: 33, g: 37, b: 41 };
    }
  }

  let cellSize = 0;

  function sizeCanvas() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const cs = w / gridCols;
    const dpr = window.devicePixelRatio || 1;
    const cssW = cs * gridCols;
    const cssH = cs * gridRows;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return cs;
  }

  function draw(time) {
    if (startTime === null) startTime = time;
    const elapsed = time - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Entrance
    if (!entranceDone) {
      const toReveal = Math.min(shuffledOn.length, revealIndex + batchSize);
      for (let i = revealIndex; i < toReveal; i++) {
        shuffledOn[i].revealed = true;
      }
      revealIndex = toReveal;
      if (revealIndex >= shuffledOn.length) entranceDone = true;
    }

    const fontSize = cellSize * 0.85;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const { r, g, b } = colorRgb;

    for (const cell of allCells) {
      const x = cell.col * cellSize + cellSize / 2;
      const y = cell.row * cellSize + cellSize / 2;

      if (cell.on) {
        if (!cell.revealed) continue;

        let alpha;
        if (!entranceDone) {
          alpha = 1;
        } else {
          alpha = 0.85 + 0.15 * Math.sin(elapsed * PULSE_SPEED + cell.phase);
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillText(cell.glyph, x, y);
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},0.25)`;
        ctx.fillText(cell.glyph, x, y);
      }
    }

    animId = requestAnimationFrame(draw);
  }

  function init() {
    readThemeColor();
    cellSize = sizeCanvas();

    animId = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cellSize = sizeCanvas();
    }, 200);
  });

  const observer = new MutationObserver(() => {
    readThemeColor();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme'],
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  init();
})();

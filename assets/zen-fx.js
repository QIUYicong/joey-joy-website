/* ─────────────────────────────────────────────────────────
   Joey's Joy — zen-fx.js
   ambient effects: lotus petals, incense smoke, enso ink
   Auto-binds by reading <body data-fx="petals|incense|none">
   ───────────────────────────────────────────────────────── */
(function () {
  const body = document.body;
  const fx   = (body.dataset.fx || 'petals').toLowerCase();
  if (fx === 'none') return;

  /* create canvas */
  const canvas = document.createElement('canvas');
  canvas.className = 'zen-fx';
  body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.width  = Math.floor(innerWidth  * DPR);
    H = canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width  = innerWidth  + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const rand = (a, b) => a + Math.random() * (b - a);

  /* ── theme-aware palette ───────────────────────────── */
  function readPalette() {
    const isDark = body.dataset.theme === 'dark';
    return {
      isDark,
      copper:   isDark ? [214,161,96] : [184,134,79],
      moss:     isDark ? [138,160,122]: [90,111,78],
      cinnabar: isDark ? [194, 94, 79] : [164, 74, 63],
      ink:      isDark ? [237,225,196] : [42, 29, 18],
      petalA:   isDark ? [232, 196, 174] : [248, 210, 200], // soft rose petal
      petalB:   isDark ? [222, 178, 138] : [228, 188, 148], // warm
      smoke:    isDark ? [220,200,170] : [120, 96, 64]
    };
  }
  let P = readPalette();
  const refreshPalette = () => { P = readPalette(); };

  /* ─────────────────────────────────────────────────────
     LOTUS PETALS — gentle falling petals (light pages)
     ───────────────────────────────────────────────────── */
  function makePetal(initialY) {
    return {
      x: Math.random() * 1.1 - 0.05,
      y: initialY ? Math.random() : -0.05 - Math.random() * 0.4,
      vy: rand(0.00040, 0.00095),
      vx: rand(-0.00012, 0.00012),
      drift: rand(0, Math.PI * 2),
      driftSpeed: rand(0.0010, 0.0024),
      driftAmp: rand(0.00010, 0.00030),
      size: rand(8, 17),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.0025, 0.0025),
      hue: Math.random() < 0.55 ? 'A' : 'B',
      opacity: rand(0.45, 0.85)
    };
  }

  /* draw one petal — lotus tip shape via two quadratic curves */
  function drawPetal(p) {
    const x = p.x * innerWidth;
    const y = p.y * innerHeight;
    const s = p.size;
    const [r, g, b] = (p.hue === 'A' ? P.petalA : P.petalB);

    ctx.save();
    ctx.translate(x * DPR, y * DPR);
    ctx.rotate(p.rot);
    ctx.scale(DPR, DPR);

    /* petal body */
    const grad = ctx.createLinearGradient(0, -s, 0, s);
    grad.addColorStop(0, `rgba(${r},${g},${b},${p.opacity * 0.15})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${p.opacity * 0.85})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${p.opacity * 0.30})`);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.7, -s * 0.2, 0, s);
    ctx.quadraticCurveTo(-s * 0.7, -s * 0.2, 0, -s);
    ctx.fill();

    /* center vein */
    ctx.strokeStyle = `rgba(${r},${g},${b},${p.opacity * 0.7})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(0, s * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────
     INCENSE SMOKE — slow vertical ribbon (dark pages)
     ───────────────────────────────────────────────────── */
  function makeSmoke(initial) {
    return {
      x: rand(0.20, 0.80),
      y: initial ? rand(0.55, 1.0) : 1.05,
      vy: rand(0.00040, 0.00075),
      noise: rand(0, 1000),
      size: rand(40, 100),
      life: 0,
      maxLife: rand(8, 18)
    };
  }

  function drawSmoke(p, t) {
    const x = (p.x + Math.sin((t * 0.0007) + p.noise) * 0.045) * innerWidth;
    const y = p.y * innerHeight;
    const ageProgress = p.life / p.maxLife;
    const op = (1 - ageProgress) * 0.55 * (1 - (1 - p.y) * 0.3);
    const s = p.size * (1 + ageProgress * 1.8) * DPR;
    const [r, g, b] = P.smoke;

    const grad = ctx.createRadialGradient(x*DPR, y*DPR, 0, x*DPR, y*DPR, s);
    grad.addColorStop(0,    `rgba(${r},${g},${b},${op * 0.32})`);
    grad.addColorStop(0.5,  `rgba(${r},${g},${b},${op * 0.16})`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x*DPR, y*DPR, s, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ─────────────────────────────────────────────────────
     animate
     ───────────────────────────────────────────────────── */
  let particles = [];
  let t0 = performance.now();

  if (fx === 'petals') {
    particles = Array.from({ length: 26 }, () => makePetal(true));
  } else if (fx === 'incense') {
    particles = Array.from({ length: 18 }, () => makeSmoke(true));
  }

  function frame() {
    const now = performance.now();
    const dt  = now - t0;
    t0 = now;
    ctx.clearRect(0, 0, W, H);

    if (fx === 'petals') {
      particles.forEach((p, i) => {
        p.drift += p.driftSpeed * dt;
        p.y += p.vy * dt;
        p.x += p.vx * dt + Math.sin(p.drift) * p.driftAmp * dt;
        p.rot += p.rotSpeed * dt;
        drawPetal(p);
        if (p.y > 1.1) particles[i] = makePetal(false);
      });
    } else if (fx === 'incense') {
      particles.forEach((p, i) => {
        p.y -= p.vy * dt;
        p.life += dt / 1000;
        drawSmoke(p, now);
        if (p.life > p.maxLife || p.y < -0.1) particles[i] = makeSmoke(false);
      });
    }

    requestAnimationFrame(frame);
  }
  frame();

  /* re-read palette if user toggles theme */
  const observer = new MutationObserver(refreshPalette);
  observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] });
})();

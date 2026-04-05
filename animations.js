/* animations.js — animated pipeline diagrams */

function drawPipeline(canvasId, nodes, colors, textColors, dotColor, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DPR = window.devicePixelRatio || 1;
  const LOGICAL_W = canvas.parentElement.clientWidth - 40;
  const LOGICAL_H = 110;
  canvas.width  = LOGICAL_W * DPR;
  canvas.height = LOGICAL_H * DPR;
  canvas.style.width  = LOGICAL_W + 'px';
  canvas.style.height = LOGICAL_H + 'px';
  ctx.scale(DPR, DPR);

  const N = nodes.length;
  const BOX_W = Math.min(130, (LOGICAL_W - 20) / N - 14);
  const BOX_H = 56;
  const CY = LOGICAL_H / 2;
  const TOTAL = N * BOX_W + (N - 1) * 14;
  const startX = (LOGICAL_W - TOTAL) / 2;
  const xs = nodes.map((_, i) => startX + i * (BOX_W + 14));

  const dots = [];
  for (let i = 0; i < N - 1; i++) {
    dots.push({ x: xs[i] + BOX_W, target: xs[i + 1], t: Math.random(), active: true, delay: i * 400 + Math.random() * 300 });
  }

  let started = false;
  setTimeout(() => { started = true; }, Math.max(...dots.map(d => d.delay)));

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

    // Arrows
    ctx.strokeStyle = '#C8C6BE';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < N - 1; i++) {
      const x1 = xs[i] + BOX_W + 2;
      const x2 = xs[i + 1] - 2;
      ctx.beginPath();
      ctx.moveTo(x1, CY);
      ctx.lineTo(x2 - 6, CY);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = '#C8C6BE';
      ctx.beginPath();
      ctx.moveTo(x2 - 6, CY - 4);
      ctx.lineTo(x2, CY);
      ctx.lineTo(x2 - 6, CY + 4);
      ctx.fill();
    }

    // Boxes
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = colors[i];
      roundRect(xs[i], CY - BOX_H / 2, BOX_W, BOX_H, 7);
      ctx.fill();

      const node = nodes[i];
      ctx.fillStyle = textColors[i];
      ctx.font = `500 12px -apple-system, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, xs[i] + BOX_W / 2, CY - 5);
      ctx.font = `400 10px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = textColors[i];
      ctx.globalAlpha = 0.75;
      ctx.fillText(node.sub, xs[i] + BOX_W / 2, CY + 11);
      ctx.globalAlpha = 1;
    }

    // Animated dots
    for (const d of dots) {
      if (!started && d.t === 0) continue;
      const range = d.target - (d.x);
      const cx = d.x + d.t * range;
      const alpha = d.t < 0.1 ? d.t * 10 : d.t > 0.85 ? (1 - d.t) / 0.15 : 1;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * 0.9;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(cx, CY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  let lastTime = 0;
  function animate(ts) {
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    for (const d of dots) {
      if (ts < d.delay) continue;
      d.t += dt / 1400;
      if (d.t >= 1) {
        d.t = 0;
        d.delay = ts + 200 + Math.random() * 500;
      }
    }

    draw();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ── Pipeline 1: CBCT → Synthetic CT ──
drawPipeline('pipelineCanvas',
  [
    { label: 'CBCT input',    sub: 'low quality CT' },
    { label: 'Patch embed',   sub: 'ViT tokenizer' },
    { label: 'AFNO layers',   sub: 'frequency domain' },
    { label: 'Decoder',       sub: 'upsampling' },
    { label: 'Synthetic CT',  sub: 'high resolution' },
  ],
  ['#B5D4F4', '#9FE1CB', '#9FE1CB', '#9FE1CB', '#C0DD97'],
  ['#0C447C', '#085041', '#085041', '#085041', '#27500A'],
  '#378ADD'
);

// ── Pipeline 2: TME framework ──
drawPipeline('tmeCanvas',
  [
    { label: 'CT input',       sub: 'standard imaging' },
    { label: 'OT-FM model',    sub: 'Aim 1' },
    { label: 'Synthetic PET',  sub: 'metabolic map' },
    { label: 'ViT + VAE',      sub: 'Aim 2' },
    { label: 'TME latent z',   sub: 'immune/hypoxic' },
    { label: 'Survival model', sub: 'Aim 3' },
  ],
  ['#B5D4F4', '#FAC775', '#FAC775', '#CCC4F6', '#CCC4F6', '#C0DD97'],
  ['#0C447C', '#633806', '#633806', '#26215C', '#26215C', '#27500A'],
  '#7F77DD'
);

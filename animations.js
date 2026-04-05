/* animations.js — three research animations */

function setupCanvas(id, logicalH) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth - 40;
  canvas.width  = W * DPR;
  canvas.height = logicalH * DPR;
  canvas.style.width  = W + 'px';
  canvas.style.height = logicalH + 'px';
  ctx.scale(DPR, DPR);
  return { ctx, W, H: logicalH };
}

/* ─────────────────────────────────────────────
   ANIMATION 1: TME Components
   Central tumor with orbiting cell types.
   Each cell type pulses and has a label.
───────────────────────────────────────────── */
(function tmeComponents() {
  const c = setupCanvas('tmeComponentsCanvas', 280);
  if (!c) return;
  const { ctx, W, H } = c;

  const CX = W / 2, CY = H / 2;
  const ORBIT = Math.min(W * 0.32, 100);

  const components = [
    { label: 'Immune cells',   sub: 'T cells, NK cells',    color: '#378ADD', fill: '#E6F1FB', angle: -Math.PI/2,      speed: 0.004 },
    { label: 'Hypoxic regions',sub: 'low oxygen zones',     color: '#854F0B', fill: '#FAEEDA', angle: Math.PI/6,       speed: 0.003 },
    { label: 'Fibroblasts',    sub: 'stromal tissue (CAF)', color: '#0F6E56', fill: '#E1F5EE', angle: Math.PI/2 + Math.PI/3, speed: 0.0035 },
  ];

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Orbit ring
    ctx.beginPath();
    ctx.arc(CX, CY, ORBIT, 0, Math.PI * 2);
    ctx.strokeStyle = '#E0DED6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // FDG PET signal glow ring (animated)
    const glowR = 28 + Math.sin(t * 0.04) * 4;
    ctx.beginPath();
    ctx.arc(CX, CY, glowR + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(55,138,221,0.12)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Tumor core
    ctx.beginPath();
    ctx.arc(CX, CY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#F0997B';
    ctx.fill();
    ctx.fillStyle = '#4A1B0C';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tumor', CX, CY - 3);
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.fillStyle = '#712B13';
    ctx.fillText('NSCLC', CX, CY + 10);

    // Orbiting components
    components.forEach((comp, i) => {
      const angle = comp.angle + t * comp.speed;
      const ox = CX + Math.cos(angle) * ORBIT;
      const oy = CY + Math.sin(angle) * ORBIT;

      // Connector line
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * 30, CY + Math.sin(angle) * 30);
      ctx.lineTo(ox - Math.cos(angle) * 22, oy - Math.sin(angle) * 22);
      ctx.strokeStyle = comp.color + '55';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Node circle
      const pulse = 20 + Math.sin(t * 0.05 + i * 1.2) * 3;
      ctx.beginPath();
      ctx.arc(ox, oy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = comp.fill;
      ctx.fill();
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      const labelX = ox;
      const labelY = oy + pulse + 14;
      ctx.fillStyle = comp.color;
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.label, labelX, labelY);
      ctx.fillStyle = '#888';
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillText(comp.sub, labelX, labelY + 12);
    });

    // FDG PET label in center bottom
    ctx.fillStyle = '#185FA5';
    ctx.font = '500 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FDG PET signal encodes all three', CX, H - 14);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ─────────────────────────────────────────────
   ANIMATION 2: Old way vs New way
   Left: multiple tracers/biopsy → each component
   Right: single FDG PET + AI → all components
───────────────────────────────────────────── */
(function approachComparison() {
  const c = setupCanvas('approachCanvas', 220);
  if (!c) return;
  const { ctx, W, H } = c;

  const half = W / 2;
  const components = ['Immune', 'Hypoxia', 'Fibroblasts'];
  const tracers    = ['FAPI', 'FMISO', 'Biopsy'];
  const tracerColors = ['#854F0B', '#3B6D11', '#533AB7'];
  const compColors   = ['#378ADD', '#854F0B', '#0F6E56'];
  const compFills    = ['#E6F1FB', '#FAEEDA', '#E1F5EE'];

  let t = 0;

  function drawArrow(x1, y1, x2, y2, color, progress) {
    const dx = x2 - x1, dy = y2 - y1;
    const ex = x1 + dx * progress, ey = y1 + dy * progress;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (progress > 0.85) {
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 8 * Math.cos(angle - 0.4), ey - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(ex - 8 * Math.cos(angle + 0.4), ey - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function pill(x, y, w, h, fill, stroke, label, sub, textColor) {
    ctx.beginPath();
    ctx.roundRect(x - w/2, y - h/2, w, h, 6);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = textColor || stroke;
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + (sub ? -3 : 4));
    if (sub) {
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText(sub, x, y + 10);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const phase = (t % 180) / 180;
    const prog  = Math.min(phase * 2, 1);
    const prog2 = Math.max((phase - 0.5) * 2, 0);

    // Divider
    ctx.beginPath();
    ctx.moveTo(half, 20); ctx.lineTo(half, H - 20);
    ctx.strokeStyle = '#E0DED6'; ctx.lineWidth = 1; ctx.stroke();

    // LEFT SIDE — old approach
    ctx.fillStyle = '#999';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Current approach', half / 2, 22);

    const leftCX = half / 2;
    // Patient node
    pill(leftCX, 48, 70, 28, '#F1EFE8', '#888', 'Patient', null, '#444');

    // Three tracers fanning out
    const targets = [
      { x: leftCX - 58, y: 120 },
      { x: leftCX,      y: 120 },
      { x: leftCX + 58, y: 120 },
    ];
    targets.forEach((tgt, i) => {
      drawArrow(leftCX, 63, tgt.x, tgt.y - 14, tracerColors[i], prog);
      pill(tgt.x, tgt.y, 52, 26, '#F8F7F4', tracerColors[i], tracers[i], 'tracer', tracerColors[i]);
    });

    // Each tracer to its component
    const compTargets = [
      { x: leftCX - 58, y: 178 },
      { x: leftCX,      y: 178 },
      { x: leftCX + 58, y: 178 },
    ];
    compTargets.forEach((tgt, i) => {
      drawArrow(targets[i].x, targets[i].y + 13, tgt.x, tgt.y - 13, compColors[i], prog2);
      pill(tgt.x, tgt.y, 62, 26, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#C0392B';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3 separate procedures', leftCX, H - 10);

    // RIGHT SIDE — new approach
    const rightCX = half + half / 2;
    ctx.fillStyle = '#185FA5';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My approach', rightCX, 22);

    pill(rightCX, 48, 70, 28, '#F1EFE8', '#888', 'Patient', null, '#444');

    // Single FDG PET arrow
    drawArrow(rightCX, 63, rightCX, 105, '#378ADD', prog);
    pill(rightCX, 118, 80, 26, '#E6F1FB', '#378ADD', 'FDG PET + CT', null, '#185FA5');

    // AI model
    drawArrow(rightCX, 131, rightCX, 148, '#533AB7', prog2);
    pill(rightCX, 160, 70, 22, '#EEEDFE', '#533AB7', 'AI model', null, '#3C3489');

    // Three outputs fanning from AI
    const rightTargets = [
      { x: rightCX - 58, y: 196 },
      { x: rightCX,      y: 196 },
      { x: rightCX + 58, y: 196 },
    ];
    rightTargets.forEach((tgt, i) => {
      drawArrow(rightCX, 171, tgt.x, tgt.y - 13, compColors[i], prog2);
      pill(tgt.x, tgt.y, 62, 26, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#27500A';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1 standard scan', rightCX, H - 10);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ─────────────────────────────────────────────
   ANIMATION 3: TME Trajectory during treatment
   Two patients, pre/post treatment.
   Shows TME axes evolving differently.
───────────────────────────────────────────── */
(function tmeTrajectory() {
  const c = setupCanvas('trajectoryCanvas', 220);
  if (!c) return;
  const { ctx, W, H } = c;

  const patients = [
    {
      label: 'Patient A — responder',
      color: '#0F6E56',
      fill:  '#E1F5EE',
      pre:  { immune: 0.3, hypoxia: 0.7, stromal: 0.6 },
      post: { immune: 0.85, hypoxia: 0.25, stromal: 0.3 },
      outcome: 'Immune activation detected',
      outcomeColor: '#0F6E56',
    },
    {
      label: 'Patient B — non-responder',
      color: '#993C1D',
      fill:  '#FAECE7',
      pre:  { immune: 0.35, hypoxia: 0.65, stromal: 0.55 },
      post: { immune: 0.3,  hypoxia: 0.7,  stromal: 0.75 },
      outcome: 'Stromal resistance sustained',
      outcomeColor: '#993C1D',
    },
  ];

  const axes = ['Immune', 'Hypoxia', 'Stromal'];
  const axisColors = ['#378ADD', '#854F0B', '#0F6E56'];
  let t = 0;

  function barGroup(px, py, vals, colors, alpha) {
    const barW = 18, gap = 8, groupW = (barW + gap) * 3 - gap;
    let x = px - groupW / 2;
    axes.forEach((_, i) => {
      const barH = vals[i] * 60;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors[i] + '33';
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x, py - barH, barW, barH, 3);
      ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1;
      x += barW + gap;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const phase = ((t % 240) / 240);
    const anim  = Math.min(Math.sin(phase * Math.PI), 1);
    const showPost = phase > 0.5;

    const col1 = W * 0.25, col2 = W * 0.75;

    // Labels
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';

    patients.forEach((p, pi) => {
      const cx = pi === 0 ? col1 : col2;

      ctx.fillStyle = p.color;
      ctx.fillText(p.label, cx, 18);

      // Pre-treatment bars (always shown)
      barGroup(cx, 100, [p.pre.immune, p.pre.hypoxia, p.pre.stromal], axisColors, 0.5);

      // Post-treatment bars (animated in)
      if (showPost) {
        const postVals = [
          p.pre.immune  + (p.post.immune  - p.pre.immune)  * anim * 2 % 1,
          p.pre.hypoxia + (p.post.hypoxia - p.pre.hypoxia) * anim * 2 % 1,
          p.pre.stromal + (p.post.stromal - p.pre.stromal) * anim * 2 % 1,
        ];
        barGroup(cx, 100, postVals, axisColors, 1.0);
      }

      // Axis labels
      const barW = 18, gap = 8, groupW = (barW + gap) * 3 - gap;
      let bx = cx - groupW / 2 + barW / 2;
      axes.forEach((label, i) => {
        ctx.fillStyle = axisColors[i];
        ctx.font = '400 9px system-ui, sans-serif';
        ctx.fillText(label, bx, 115);
        bx += barW + gap;
      });

      // Pre / Post labels
      ctx.fillStyle = '#aaa';
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillText('pre-treatment (faded)  →  post-treatment', cx, 130);

      // Arrow showing change
      if (showPost) {
        ctx.fillStyle = p.outcomeColor;
        ctx.font = '500 10px system-ui, sans-serif';
        ctx.fillText(p.outcome, cx, 155);
      }
    });

    // Divider
    ctx.beginPath();
    ctx.moveTo(W/2, 25); ctx.lineTo(W/2, H - 30);
    ctx.strokeStyle = '#E0DED6'; ctx.lineWidth = 1; ctx.stroke();

    // Bottom legend
    let lx = 20;
    axes.forEach((label, i) => {
      ctx.fillStyle = axisColors[i];
      ctx.beginPath();
      ctx.arc(lx + 5, H - 14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '400 10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, lx + 13, H - 10);
      lx += 80;
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('bar height = TME component strength', W - 8, H - 10);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

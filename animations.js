/* animations.js */

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
   ANIMATION 1: TME Components orbiting tumor
───────────────────────────────────────────── */
(function tmeComponents() {
  const c = setupCanvas('tmeComponentsCanvas', 320);
  if (!c) return;
  const { ctx, W, H } = c;

  const CX = W / 2;
  const CY = H / 2 - 10;
  const TUMOR_R = 32;
  const NODE_R  = 24;
  const ORBIT   = Math.min(W * 0.36, 130);

  const components = [
    { label: 'Immune cells',    sub: 'T cells, NK cells',    color: '#185FA5', fill: '#E6F1FB', baseAngle: -Math.PI / 2,                speed: 0.005  },
    { label: 'Hypoxic regions', sub: 'low oxygen zones',     color: '#854F0B', fill: '#FAEEDA', baseAngle: -Math.PI / 2 + 2*Math.PI/3,  speed: 0.004  },
    { label: 'Fibroblasts',     sub: 'stromal tissue (CAF)', color: '#0F6E56', fill: '#E1F5EE', baseAngle: -Math.PI / 2 + 4*Math.PI/3,  speed: 0.0045 },
  ];

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(CX, CY, ORBIT, 0, Math.PI * 2);
    ctx.strokeStyle = '#DDDBD3';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    const glow = 28 + Math.sin(t * 0.035) * 5;
    ctx.beginPath();
    ctx.arc(CX, CY, TUMOR_R + glow, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(55,138,221,0.10)';
    ctx.lineWidth = 12;
    ctx.stroke();

    const positions = components.map(comp => {
      const angle = comp.baseAngle + t * comp.speed;
      return { x: CX + Math.cos(angle) * ORBIT, y: CY + Math.sin(angle) * ORBIT, comp, angle };
    });

    positions.forEach(({ x, y, comp, angle }) => {
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * (TUMOR_R + 2), CY + Math.sin(angle) * (TUMOR_R + 2));
      ctx.lineTo(x - Math.cos(angle) * (NODE_R + 2), y - Math.sin(angle) * (NODE_R + 2));
      ctx.strokeStyle = comp.color + '44';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(CX, CY, TUMOR_R, 0, Math.PI * 2);
    ctx.fillStyle = '#F0997B';
    ctx.fill();
    ctx.fillStyle = '#4A1B0C';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tumor', CX, CY - 4);
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.fillStyle = '#712B13';
    ctx.fillText('NSCLC', CX, CY + 11);

    positions.forEach(({ x, y, comp }, i) => {
      const pulse = NODE_R + Math.sin(t * 0.05 + i * 1.3) * 2.5;
      ctx.beginPath();
      ctx.arc(x, y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = comp.fill;
      ctx.fill();
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const dx = x - CX, dy = y - CY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const nx = dx / dist, ny = dy / dist;
      const lx = x + nx * (pulse + 14);
      const ly = y + ny * (pulse + 4);

      ctx.fillStyle = comp.color;
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = lx < CX - 5 ? 'right' : lx > CX + 5 ? 'left' : 'center';
      ctx.fillText(comp.label, lx, ly);
      ctx.fillStyle = '#888';
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillText(comp.sub, lx, ly + 13);
    });

    ctx.fillStyle = '#185FA5';
    ctx.font = '500 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FDG PET signal encodes all three components', CX, H - 10);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ─────────────────────────────────────────────
   ANIMATION 2: Old way vs New way
   Fixed: right side output pills spaced wider,
   caption moved below with clear gap
───────────────────────────────────────────── */
(function approachComparison() {
  const c = setupCanvas('approachCanvas', 260);
  if (!c) return;
  const { ctx, W, H } = c;

  const half = W / 2;
  const components   = ['Immune', 'Hypoxia', 'Fibroblasts'];
  const tracers      = ['FAPI', 'FMISO', 'Biopsy'];
  const tracerColors = ['#854F0B', '#3B6D11', '#533AB7'];
  const compColors   = ['#378ADD', '#854F0B', '#0F6E56'];
  const compFills    = ['#E6F1FB', '#FAEEDA', '#E1F5EE'];

  let t = 0;

  function drawArrow(x1, y1, x2, y2, color, progress) {
    const dx = x2 - x1, dy = y2 - y1;
    const p = Math.min(progress, 1);
    const ex = x1 + dx * p, ey = y1 + dy * p;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (p >= 0.9) {
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
    if (ctx.roundRect) ctx.roundRect(x - w/2, y - h/2, w, h, 6);
    else ctx.rect(x - w/2, y - h/2, w, h);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = textColor || stroke;
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + (sub ? -4 : 4));
    if (sub) {
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText(sub, x, y + 10);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const phase = (t % 200) / 200;
    const prog  = Math.min(phase * 2.2, 1);
    const prog2 = Math.max((phase - 0.45) * 2.2, 0);

    // Divider
    ctx.beginPath();
    ctx.moveTo(half, 18); ctx.lineTo(half, H - 18);
    ctx.strokeStyle = '#E0DED6'; ctx.lineWidth = 1; ctx.stroke();

    // ── LEFT: current approach ──
    const lCX = half / 2;
    ctx.fillStyle = '#888';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Current approach', lCX, 20);

    pill(lCX, 44, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');

    // Spread tracers evenly across available left half width
    const lSpread = Math.min((half - 40) / 2 * 0.85, 62);
    const tracerY = 110;
    const tracerX = [lCX - lSpread, lCX, lCX + lSpread];
    tracerX.forEach((tx, i) => {
      drawArrow(lCX, 59, tx, tracerY - 14, tracerColors[i], prog);
      pill(tx, tracerY, 52, 28, '#F8F7F4', tracerColors[i], tracers[i], 'tracer', tracerColors[i]);
    });

    const compY = 172;
    tracerX.forEach((tx, i) => {
      drawArrow(tx, tracerY + 14, tx, compY - 14, compColors[i], prog2);
      pill(tx, compY, 64, 28, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#C0392B';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3 separate procedures', lCX, H - 16);

    // ── RIGHT: my approach ──
    const rCX = half + half / 2;
    ctx.fillStyle = '#185FA5';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My approach', rCX, 20);

    pill(rCX, 44, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');
    drawArrow(rCX, 59, rCX, 93, '#378ADD', prog);
    pill(rCX, 106, 84, 28, '#E6F1FB', '#378ADD', 'FDG PET + CT', null, '#185FA5');
    drawArrow(rCX, 120, rCX, 140, '#533AB7', prog2);
    pill(rCX, 153, 72, 24, '#EEEDFE', '#533AB7', 'AI model', null, '#3C3489');

    // Right output pills: use full available right-half width for spacing
    const rSpread = Math.min((half - 40) / 2 * 0.85, 62);
    const rTargetX = [rCX - rSpread, rCX, rCX + rSpread];
    rTargetX.forEach((tx, i) => {
      drawArrow(rCX, 165, tx, compY - 14, compColors[i], prog2);
      pill(tx, compY, 64, 28, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    // Caption well below the pills with a guaranteed gap
    ctx.fillStyle = '#27500A';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1 standard scan', rCX, H - 16);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ─────────────────────────────────────────────
   ANIMATION 3: TME Trajectory
   Fully animated: bars grow over time showing
   how immune/hypoxia/stromal axes shift for
   two patients during chemoRT. Clear labels,
   no overlaps, outcome revealed at end.
───────────────────────────────────────────── */
(function tmeTrajectory() {
  const c = setupCanvas('trajectoryCanvas', 300);
  if (!c) return;
  const { ctx, W, H } = c;

  // Layout: two patient columns
  const colW  = W / 2;
  const col   = [colW * 0.5, colW * 1.5];
  const AXES  = ['Immune', 'Hypoxia', 'Stromal'];
  const COLORS = ['#185FA5', '#854F0B', '#0F6E56'];
  const FILLS  = ['#E6F1FB', '#FAEEDA', '#E1F5EE'];

  const patients = [
    {
      name: 'Patient A',
      subtitle: 'Responder',
      nameColor: '#085041',
      subColor: '#0F6E56',
      pre:  [0.30, 0.72, 0.65],
      post: [0.88, 0.22, 0.28],
      outcome: 'Immune activation',
      outcomeColor: '#0F6E56',
      outcomeBg: '#E1F5EE',
    },
    {
      name: 'Patient B',
      subtitle: 'Non-responder',
      nameColor: '#712B13',
      subColor: '#993C1D',
      pre:  [0.32, 0.68, 0.60],
      post: [0.28, 0.74, 0.82],
      outcome: 'Stromal resistance',
      outcomeColor: '#993C1D',
      outcomeBg: '#FAECE7',
    },
  ];

  // Animation: 0-60 = show pre bars, 60-160 = transition to post, 160-220 = show outcome, 220-260 = hold, loop at 260
  const CYCLE = 280;
  let t = 0;

  const BAR_W   = 28;
  const BAR_GAP = 14;
  const BAR_MAX = 90;
  const GROUP_W = 3 * BAR_W + 2 * BAR_GAP;

  function easeInOut(x) {
    return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2;
  }

  function drawBars(cx, barY, values, alpha) {
    const startX = cx - GROUP_W / 2;
    values.forEach((v, i) => {
      const bx = startX + i * (BAR_W + BAR_GAP);
      const bh = v * BAR_MAX;
      ctx.globalAlpha = alpha;
      // Background track
      ctx.fillStyle = '#F0EEE8';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, barY - BAR_MAX, BAR_W, BAR_MAX, 3);
      else ctx.rect(bx, barY - BAR_MAX, BAR_W, BAR_MAX);
      ctx.fill();
      // Value bar
      ctx.fillStyle = FILLS[i];
      ctx.strokeStyle = COLORS[i];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, barY - bh, BAR_W, bh, 3);
      else ctx.rect(bx, barY - bh, BAR_W, bh);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  function drawAxisLabels(cx, barY) {
    const startX = cx - GROUP_W / 2;
    AXES.forEach((label, i) => {
      const bx = startX + i * (BAR_W + BAR_GAP) + BAR_W / 2;
      ctx.fillStyle = COLORS[i];
      ctx.font = '400 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, bx, barY + 13);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const frame = t % CYCLE;
    // Pre phase: 0-50, transition: 50-170, outcome: 170-220, hold: 220-280
    const preAlpha  = frame < 50 ? 1 : Math.max(1 - (frame - 50) / 40, 0.25);
    const transP    = frame < 50 ? 0 : Math.min(easeInOut((frame - 50) / 120), 1);
    const showOut   = frame > 170;
    const outAlpha  = frame < 170 ? 0 : Math.min((frame - 170) / 30, 1);

    const barY = H - 70;

    // Divider
    ctx.beginPath();
    ctx.moveTo(W/2, 10); ctx.lineTo(W/2, H - 10);
    ctx.strokeStyle = '#E0DED6'; ctx.lineWidth = 1; ctx.stroke();

    patients.forEach((p, pi) => {
      const cx = col[pi];

      // Patient name
      ctx.fillStyle = p.nameColor;
      ctx.font = '500 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cx, 22);
      ctx.fillStyle = p.subColor;
      ctx.font = '400 11px system-ui, sans-serif';
      ctx.fillText(p.subtitle, cx, 36);

      // Interpolated bar values
      const current = p.pre.map((pre, i) => pre + (p.post[i] - pre) * transP);

      // Pre-treatment bars (fade to ghost)
      drawBars(cx, barY, p.pre, Math.max(preAlpha * 0.4, 0.12));

      // Current (animating) bars
      drawBars(cx, barY, current, 1.0);

      // Axis labels
      drawAxisLabels(cx, barY);

      // Phase label
      const phaseLabel = transP < 0.05 ? 'Before treatment' : transP > 0.95 ? 'After chemoRT' : 'During treatment...';
      ctx.fillStyle = '#888';
      ctx.font = '400 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(phaseLabel, cx, barY + 28);

      // Outcome card (fades in)
      if (showOut) {
        ctx.globalAlpha = outAlpha;
        const cardW = Math.min(colW - 20, 160);
        const cardH = 40;
        const cardX = cx - cardW / 2;
        const cardY = barY + 42;
        ctx.fillStyle = p.outcomeBg;
        ctx.strokeStyle = p.outcomeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        else ctx.rect(cardX, cardY, cardW, cardH);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = p.outcomeColor;
        ctx.font = '500 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.outcome, cx, cardY + cardH / 2 + 4);
        ctx.globalAlpha = 1;
      }

      // Delta arrows on bars showing direction of change (appear during transition)
      if (transP > 0.1 && transP < 0.95) {
        const startX = cx - GROUP_W / 2;
        p.pre.forEach((pre, i) => {
          const diff = p.post[i] - pre;
          if (Math.abs(diff) < 0.05) return;
          const bx = startX + i * (BAR_W + BAR_GAP) + BAR_W / 2;
          const curH = (pre + diff * transP) * BAR_MAX;
          const arrowY = barY - curH - 8;
          ctx.fillStyle = diff > 0 ? COLORS[i] : '#C0392B';
          ctx.font = '500 14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.globalAlpha = Math.min(transP * 3, 1) * 0.8;
          ctx.fillText(diff > 0 ? '↑' : '↓', bx, arrowY);
          ctx.globalAlpha = 1;
        });
      }
    });

    // Bottom note
    ctx.fillStyle = '#aaa';
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bar height = TME component strength   ·   Ghost bars = pre-treatment baseline', W / 2, H - 8);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

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
───────────────────────────────────────────── */
(function approachComparison() {
  const c = setupCanvas('approachCanvas', 300);
  if (!c) return;
  const { ctx, W, H } = c;

  const half = W / 2;
  const components   = ['Immune', 'Hypoxia', 'Fibroblasts'];
  const tracers      = ['FAPI', 'FMISO', 'Biopsy'];
  const tracerColors = ['#854F0B', '#3B6D11', '#533AB7'];
  const compColors   = ['#378ADD', '#854F0B', '#0F6E56'];
  const compFills    = ['#E6F1FB', '#FAEEDA', '#E1F5EE'];

  // Pill dimensions — sized to never overflow half-width
  const PILL_W = 58;
  const PILL_H = 26;

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

    pill(lCX, 46, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');

    // Spread = half the available width minus padding, capped so pills don't touch edges
    const maxSpread = half / 2 - PILL_W / 2 - 10;
    const lSpread = Math.min(maxSpread, 58);
    const tracerY = 112;
    const tracerX = [lCX - lSpread, lCX, lCX + lSpread];
    tracerX.forEach((tx, i) => {
      drawArrow(lCX, 61, tx, tracerY - 13, tracerColors[i], prog);
      pill(tx, tracerY, PILL_W, PILL_H, '#F8F7F4', tracerColors[i], tracers[i], 'tracer', tracerColors[i]);
    });

    const compY = 178;
    tracerX.forEach((tx, i) => {
      drawArrow(tx, tracerY + 13, tx, compY - 13, compColors[i], prog2);
      pill(tx, compY, PILL_W + 10, PILL_H, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#C0392B';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3 separate procedures', lCX, H - 14);

    // ── RIGHT: my approach ──
    const rCX = half + half / 2;
    ctx.fillStyle = '#185FA5';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My approach', rCX, 20);

    pill(rCX, 46, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');
    drawArrow(rCX, 61, rCX, 96, '#378ADD', prog);
    pill(rCX, 109, 86, 28, '#E6F1FB', '#378ADD', 'FDG PET + CT', null, '#185FA5');
    drawArrow(rCX, 123, rCX, 143, '#533AB7', prog2);
    pill(rCX, 156, 72, 26, '#EEEDFE', '#533AB7', 'AI model', null, '#3C3489');

    // Output pills for right side — same spread logic as left, anchored to rCX
    const rSpread = Math.min(maxSpread, 58);
    const rTargetX = [rCX - rSpread, rCX, rCX + rSpread];
    const rCompY = 220; // well below AI model box (bottom edge ~169)
    rTargetX.forEach((tx, i) => {
      drawArrow(rCX, 169, tx, rCompY - 13, compColors[i], prog2);
      pill(tx, rCompY, PILL_W + 10, PILL_H, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#27500A';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1 standard scan', rCX, H - 14);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ─────────────────────────────────────────────
   ANIMATION 3: TME Trajectory — Radar Charts
   Two side-by-side radar/spider charts showing
   Immune, Hypoxia, Stromal axes morphing from
   pre-treatment to post-treatment. Ghost shape
   stays visible. Outcome badge fades in at end.
───────────────────────────────────────────── */
(function tmeTrajectory() {
  const c = setupCanvas('trajectoryCanvas', 360);
  if (!c) return;
  const { ctx, W, H } = c;

  const colW = W / 2;
  const col  = [colW * 0.5, colW * 1.5];

  const AXES   = ['Immune', 'Hypoxia', 'Stromal'];
  const COLORS = ['#185FA5', '#854F0B', '#0F6E56'];
  // Radar axes at -90°, +30°, +150° (evenly spaced triangle pointing up)
  const ANGLES = [-Math.PI/2, -Math.PI/2 + 2*Math.PI/3, -Math.PI/2 + 4*Math.PI/3];

  const patients = [
    {
      name: 'Patient A',
      subtitle: 'Responder',
      nameColor: '#085041',
      subColor: '#0F6E56',
      radarColor: '#1D9E75',
      radarFill: 'rgba(29,158,117,0.15)',
      radarFillPost: 'rgba(29,158,117,0.25)',
      pre:  [0.30, 0.72, 0.65],
      post: [0.88, 0.20, 0.25],
      outcome: 'Immune activation',
      outcomeDetail: 'Tumour responding to treatment',
      outcomeColor: '#085041',
      outcomeBorder: '#1D9E75',
      outcomeBg: '#E1F5EE',
    },
    {
      name: 'Patient B',
      subtitle: 'Non-responder',
      nameColor: '#712B13',
      subColor: '#993C1D',
      radarColor: '#D85A30',
      radarFill: 'rgba(216,90,48,0.12)',
      radarFillPost: 'rgba(216,90,48,0.22)',
      pre:  [0.32, 0.68, 0.58],
      post: [0.26, 0.75, 0.86],
      outcome: 'Stromal resistance',
      outcomeDetail: 'Fibroblasts blocking immune access',
      outcomeColor: '#712B13',
      outcomeBorder: '#D85A30',
      outcomeBg: '#FAECE7',
    },
  ];

  const CYCLE = 320;
  // 0-60: show pre shape, 60-200: morph to post, 200-260: hold + show outcome, 260-320: hold
  let t = 0;

  function easeInOut(x) {
    return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;
  }

  function radarPoints(cx, cy, R, values) {
    return values.map((v, i) => ({
      x: cx + Math.cos(ANGLES[i]) * v * R,
      y: cy + Math.sin(ANGLES[i]) * v * R,
    }));
  }

  function drawRadarGrid(cx, cy, R) {
    // 4 concentric rings
    [0.25, 0.5, 0.75, 1.0].forEach(r => {
      ctx.beginPath();
      ANGLES.forEach((a, i) => {
        const x = cx + Math.cos(a) * r * R;
        const y = cy + Math.sin(a) * r * R;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = r === 1.0 ? '#CCCAB8' : '#E4E2D8';
      ctx.lineWidth = r === 1.0 ? 1 : 0.8;
      ctx.stroke();
    });
    // Axis spokes
    ANGLES.forEach((a, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = '#DDDBD3';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Axis label — nudge outward past the ring
      const lx = cx + Math.cos(a) * (R + 18);
      const ly = cy + Math.sin(a) * (R + 18);
      ctx.fillStyle = COLORS[i];
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = lx < cx - 4 ? 'right' : lx > cx + 4 ? 'left' : 'center';
      ctx.fillText(AXES[i], lx, ly + 4);
    });
  }

  function drawRadarShape(cx, cy, R, values, fillStyle, strokeStyle, lineWidth, alpha) {
    const pts = radarPoints(cx, cy, R, values);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    // Dots at vertices
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fillStyle = strokeStyle;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawOutcomeCard(cx, cardY, p, alpha) {
    ctx.globalAlpha = alpha;
    const cardW = Math.min(colW - 24, 190);
    const cardH = 52;
    const cx0 = cx - cardW / 2;
    ctx.fillStyle = p.outcomeBg;
    ctx.strokeStyle = p.outcomeBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx0, cardY, cardW, cardH, 10);
    else ctx.rect(cx0, cardY, cardW, cardH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = p.outcomeColor;
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.outcome, cx, cardY + 20);
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.fillStyle = p.subColor || p.outcomeColor;
    ctx.fillText(p.outcomeDetail, cx, cardY + 38);
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const frame  = t % CYCLE;
    const transP = frame < 60 ? 0 : Math.min(easeInOut((frame - 60) / 140), 1);
    const outAlpha = frame < 200 ? 0 : Math.min((frame - 200) / 40, 1);
    const phaseLabel = transP < 0.02 ? 'Before treatment' : transP > 0.98 ? 'After chemoRT' : 'During treatment\u2026';

    // Divider
    ctx.beginPath();
    ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H);
    ctx.strokeStyle = '#E0DED6'; ctx.lineWidth = 1; ctx.stroke();

    const R = Math.min(colW * 0.34, 88);
    const CY = 60 + R + 22; // center of radar, leaving room for labels top and outcome bottom

    patients.forEach((p, pi) => {
      const cx = col[pi];

      // Name
      ctx.fillStyle = p.nameColor;
      ctx.font = '500 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cx, 20);
      ctx.fillStyle = p.subColor;
      ctx.font = '400 11px system-ui, sans-serif';
      ctx.fillText(p.subtitle, cx, 34);

      // Grid
      drawRadarGrid(cx, CY, R);

      // Ghost pre-treatment shape (always visible, fades slightly as post appears)
      const ghostAlpha = 0.22 + (1 - transP) * 0.28;
      drawRadarShape(cx, CY, R, p.pre, p.radarFill, p.radarColor + '55', 1.2, ghostAlpha);

      // Morphing current shape
      const current = p.pre.map((v, i) => v + (p.post[i] - v) * transP);
      drawRadarShape(cx, CY, R, current, p.radarFillPost, p.radarColor, 2, 1);

      // Phase label
      ctx.fillStyle = '#999';
      ctx.font = '400 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(phaseLabel, cx, CY + R + 30);

      // Outcome card
      drawOutcomeCard(cx, CY + R + 44, p, outAlpha);
    });

    // Bottom legend
    ctx.fillStyle = '#bbb';
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Faded shape = pre-treatment baseline   \u00b7   Solid shape = current TME state', W/2, H - 8);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

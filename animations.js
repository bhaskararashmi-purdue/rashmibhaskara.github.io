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
   ANIMATION 1: TME Components
   Fixed: larger orbit, nodes spaced so they never overlap
───────────────────────────────────────────── */
(function tmeComponents() {
  const c = setupCanvas('tmeComponentsCanvas', 320);
  if (!c) return;
  const { ctx, W, H } = c;

  const CX = W / 2;
  const CY = H / 2 - 10;
  const TUMOR_R = 32;
  const NODE_R  = 24;
  // Orbit large enough that nodes (r=24) at 120° apart never touch each other or the tumor
  const ORBIT   = Math.min(W * 0.36, 130);

  const components = [
    { label: 'Immune cells',    sub: 'T cells, NK cells',     color: '#185FA5', fill: '#E6F1FB', baseAngle: -Math.PI / 2,               speed: 0.005 },
    { label: 'Hypoxic regions', sub: 'low oxygen zones',      color: '#854F0B', fill: '#FAEEDA', baseAngle: -Math.PI / 2 + (2*Math.PI/3),  speed: 0.004 },
    { label: 'Fibroblasts',     sub: 'stromal tissue (CAF)',  color: '#0F6E56', fill: '#E1F5EE', baseAngle: -Math.PI / 2 + (4*Math.PI/3),  speed: 0.0045 },
  ];

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Orbit ring
    ctx.beginPath();
    ctx.arc(CX, CY, ORBIT, 0, Math.PI * 2);
    ctx.strokeStyle = '#DDDBD3';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Soft FDG glow
    const glow = 28 + Math.sin(t * 0.035) * 5;
    ctx.beginPath();
    ctx.arc(CX, CY, TUMOR_R + glow, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(55,138,221,0.10)';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Compute node positions first so we can draw connectors behind nodes
    const positions = components.map(comp => {
      const angle = comp.baseAngle + t * comp.speed;
      return { x: CX + Math.cos(angle) * ORBIT, y: CY + Math.sin(angle) * ORBIT, comp, angle };
    });

    // Connector lines (draw before nodes)
    positions.forEach(({ x, y, comp, angle }) => {
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * (TUMOR_R + 2), CY + Math.sin(angle) * (TUMOR_R + 2));
      ctx.lineTo(x - Math.cos(angle) * (NODE_R + 2), y - Math.sin(angle) * (NODE_R + 2));
      ctx.strokeStyle = comp.color + '44';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Tumor core
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

    // Orbiting nodes
    positions.forEach(({ x, y, comp }, i) => {
      const pulse = NODE_R + Math.sin(t * 0.05 + i * 1.3) * 2.5;

      ctx.beginPath();
      ctx.arc(x, y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = comp.fill;
      ctx.fill();
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Label positioned outward from center so it never overlaps the node
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

    // Bottom note
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
   ANIMATION 2: Old way vs New way (unchanged)
───────────────────────────────────────────── */
(function approachComparison() {
  const c = setupCanvas('approachCanvas', 230);
  if (!c) return;
  const { ctx, W, H } = c;

  const half = W / 2;
  const components  = ['Immune', 'Hypoxia', 'Fibroblasts'];
  const tracers     = ['FAPI', 'FMISO', 'Biopsy'];
  const tracerColors = ['#854F0B', '#3B6D11', '#533AB7'];
  const compColors   = ['#378ADD', '#854F0B', '#0F6E56'];
  const compFills    = ['#E6F1FB', '#FAEEDA', '#E1F5EE'];

  let t = 0;

  function drawArrow(x1, y1, x2, y2, color, progress) {
    const dx = x2 - x1, dy = y2 - y1;
    const ex = x1 + dx * Math.min(progress, 1);
    const ey = y1 + dy * Math.min(progress, 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (progress >= 0.9) {
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
    ctx.fillStyle = '#888';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Current approach', half / 2, 20);

    const lCX = half / 2;
    pill(lCX, 44, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');

    const tracerY = 112;
    const spread  = Math.min(lCX * 0.72, 58);
    const tracerX = [lCX - spread, lCX, lCX + spread];
    tracerX.forEach((tx, i) => {
      drawArrow(lCX, 59, tx, tracerY - 13, tracerColors[i], prog);
      pill(tx, tracerY, 52, 26, '#F8F7F4', tracerColors[i], tracers[i], 'tracer', tracerColors[i]);
    });

    const compY = 172;
    tracerX.forEach((tx, i) => {
      drawArrow(tx, tracerY + 13, tx, compY - 13, compColors[i], prog2);
      pill(tx, compY, 62, 26, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#C0392B';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3 separate procedures', lCX, H - 8);

    // ── RIGHT: my approach ──
    const rCX = half + half / 2;
    ctx.fillStyle = '#185FA5';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My approach', rCX, 20);

    pill(rCX, 44, 72, 28, '#F1EFE8', '#888', 'Patient', null, '#444');
    drawArrow(rCX, 59, rCX, 96, '#378ADD', prog);
    pill(rCX, 108, 82, 26, '#E6F1FB', '#378ADD', 'FDG PET + CT', null, '#185FA5');
    drawArrow(rCX, 121, rCX, 140, '#533AB7', prog2);
    pill(rCX, 152, 70, 24, '#EEEDFE', '#533AB7', 'AI model', null, '#3C3489');

    const rSpread = Math.min(rCX * 0.38, 58);
    const rTargetX = [rCX - rSpread, rCX, rCX + rSpread];
    rTargetX.forEach((tx, i) => {
      drawArrow(rCX, 164, tx, compY - 13, compColors[i], prog2);
      pill(tx, compY, 62, 26, compFills[i], compColors[i], components[i], null, compColors[i]);
    });

    ctx.fillStyle = '#27500A';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1 standard scan', rCX, H - 8);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

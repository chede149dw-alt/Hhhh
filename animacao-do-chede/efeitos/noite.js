// Efeitos da Parte 2 (VALDOR, noite): brilho de olhos com reflexo de lente, energia da transformação,
// faíscas subindo, clarão, onda de choque do rugido e poeira de luz.
// Noite.olhos(ctx, pts, r, k, t)            — pts = [[x,y],[x,y]]: brilho amarelo + risco horizontal (lente)
// Noite.energia(ctx, cx, cy, h, t, k)        — redemoinho de energia laranja/dourada em volta de um corpo de altura h (px)
// Noite.faiscas(ctx, cx, cy, w, h, t, k, seed) — brasas subindo
// Noite.clarao(ctx, x, y, k, cor)            — clarão na tela inteira a partir de um ponto
// Noite.onda(ctx, x, y, r, k)                — anéis de onda de choque (k 0..1)
// Noite.anelChao(ctx, x, y, rx, k, cor)      — anel de energia no chão (elipse achatada)
(function () {
  const TAU = Math.PI * 2;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const cl = (v) => Math.max(0, Math.min(1, v)), ease = (k) => 1 - Math.pow(1 - k, 3);

  function olhos(ctx, pts, r, k = 1, t = 0) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const [x, y] of pts) {
      const p = 0.85 + 0.15 * Math.sin(t * 9 + x);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(255,236,150,${0.9 * k * p})`); g.addColorStop(0.15, `rgba(255,200,60,${0.55 * k})`); g.addColorStop(1, 'rgba(255,160,30,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
      // risco de lente anamórfico
      const s = ctx.createLinearGradient(x - r * 8, 0, x + r * 8, 0); s.addColorStop(0, 'rgba(255,190,60,0)'); s.addColorStop(0.5, `rgba(255,236,170,${0.55 * k * p})`); s.addColorStop(1, 'rgba(255,190,60,0)');
      ctx.fillStyle = s; ctx.fillRect(x - r * 8, y - r * 0.08, r * 16, r * 0.16);
      ctx.fillStyle = `rgba(255,255,230,${k})`; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function energia(ctx, cx, cy, h, t, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    // aura atrás
    const a = ctx.createRadialGradient(cx, cy - h * 0.5, h * 0.05, cx, cy - h * 0.5, h * 0.75); a.addColorStop(0, `rgba(255,170,60,${0.35 * k})`); a.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = a; ctx.beginPath(); ctx.arc(cx, cy - h * 0.5, h * 0.75, 0, TAU); ctx.fill();
    // fitas de energia girando em espiral em volta do corpo
    for (let i = 0; i < 7; i++) {
      const fase = t * (2.4 + i * 0.3) + i * 0.9, y0 = cy - h * (0.05 + (i / 7) * 0.9), rx = h * (0.32 + 0.06 * Math.sin(i)), ry = h * 0.07;
      const a0 = fase % TAU, a1 = a0 + 2.2;
      ctx.strokeStyle = `rgba(255,${180 + i * 8},${80 + i * 10},${0.75 * k})`; ctx.lineWidth = h * 0.012 * (1 + (i % 2));
      ctx.beginPath(); ctx.ellipse(cx, y0, rx, ry, -0.12, a0, a1); ctx.stroke();
      ctx.strokeStyle = `rgba(255,250,220,${0.6 * k})`; ctx.lineWidth = h * 0.004;
      ctx.beginPath(); ctx.ellipse(cx, y0, rx, ry, -0.12, a0 + 0.4, a1 - 0.4); ctx.stroke();
    }
    // raios curtos saindo do corpo
    const r = rng(Math.floor(t * 12) + 3);
    for (let i = 0; i < 6; i++) {
      const y = cy - h * (0.15 + r() * 0.75), x = cx + (r() - 0.5) * h * 0.45, L = h * (0.08 + r() * 0.1), ang = r() * TAU;
      ctx.strokeStyle = `rgba(255,220,140,${0.8 * k})`; ctx.lineWidth = h * 0.005;
      ctx.beginPath(); ctx.moveTo(x, y); let px = x, py = y; for (let j = 0; j < 4; j++) { px += Math.cos(ang) * L / 4 + (r() - 0.5) * L * 0.3; py += Math.sin(ang) * L / 4 + (r() - 0.5) * L * 0.3; ctx.lineTo(px, py); } ctx.stroke();
    }
    ctx.restore();
  }

  function faiscas(ctx, cx, cy, w, h, t, k = 1, seed = 1, cor = '255,180,70') {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const r = rng(seed);
    for (let i = 0; i < 60; i++) {
      const vel = 0.25 + r() * 0.5, fase = r(), x0 = cx + (r() - 0.5) * w, vida = ((t * vel + fase) % 1), x = x0 + Math.sin(t * 3 + i) * w * 0.04, y = cy - vida * h, tam = (2 + r() * 4) * (1 - vida);
      const a = k * (1 - vida) * (0.6 + 0.4 * Math.sin(t * 20 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, tam * 4); g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, tam * 4, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,250,220,${a})`; ctx.beginPath(); ctx.arc(x, y, tam * 0.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function clarao(ctx, x, y, k, cor = '255,214,150') {
    if (k <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, 0, x, y, H * 0.9); g.addColorStop(0, `rgba(255,255,240,${k})`); g.addColorStop(0.25, `rgba(${cor},${0.8 * k})`); g.addColorStop(1, `rgba(${cor},${0.25 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function onda(ctx, x, y, r, k) {
    if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const R = r * (0.12 + ease(k) * 1.1), a = Math.pow(1 - k, 1.5) * 0.5;
    // anel macio (degradê) em vez de linha dura
    const g = ctx.createRadialGradient(x, y, R * 0.82, x, y, R); g.addColorStop(0, 'rgba(190,215,255,0)'); g.addColorStop(0.7, `rgba(200,225,255,${a})`); g.addColorStop(1, 'rgba(200,225,255,0)');
    ctx.translate(x, y); ctx.scale(1, 0.6); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function anelChao(ctx, x, y, rx, k, cor = '255,170,60') {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, rx * 0.2, x, y, rx); g.addColorStop(0, `rgba(${cor},${0.35 * k})`); g.addColorStop(0.8, `rgba(${cor},${0.15 * k})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.translate(x, y); ctx.scale(1, 0.28); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(255,230,160,${0.8 * k})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, rx * 0.8, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  window.Noite = { olhos, energia, faiscas, clarao, onda, anelChao };
})();

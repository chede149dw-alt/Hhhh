// Fenda dimensional (poder do Chede e da Lia): rasgo escuro com borda violeta/ciano, halo, anéis e partículas sugadas.
// Efeitos.fenda(ctx, x, y, s, { t, abre (0..1), achata (0..1, 1 = de frente), semente })   s = largura em px
(function () {
  window.Efeitos = window.Efeitos || {};
  window.Efeitos.fenda = function (ctx, x, y, s, o = {}) {
    const t = o.t || 0, abre = o.abre === undefined ? 1 : o.abre, ach = o.achata === undefined ? 1 : o.achata;
    if (abre <= 0.01 || s <= 1) return;
    const w = s * abre, h = s * 0.36 * abre * ach, pulso = 1 + 0.05 * Math.sin(t * 9);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // halo
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, w * 1.25);
    g.addColorStop(0, `rgba(201,166,255,${0.75 * abre})`); g.addColorStop(0.4, `rgba(123,77,255,${0.4 * abre})`); g.addColorStop(1, 'rgba(58,31,160,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w * 1.25, w * 1.25 * Math.max(0.35, ach), 0, 0, Math.PI * 2); ctx.fill();
    // anéis de distorção
    for (let i = 0; i < 3; i++) {
      const k = ((t * 1.1 + i / 3) % 1);
      ctx.strokeStyle = `rgba(185,242,255,${0.7 * k * abre})`; ctx.lineWidth = Math.max(1, s * 0.012);
      ctx.beginPath(); ctx.ellipse(x, y, (w * 0.75) * (1 - k) + w * 0.12, (h * 1.8) * (1 - k) + h * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // rasgo (olho): borda brilhante + interior escuro com estrelas
    const olho = (k) => { ctx.beginPath(); ctx.moveTo(x - w * 0.5 * k, y); ctx.quadraticCurveTo(x, y - h * k * pulso, x + w * 0.5 * k, y); ctx.quadraticCurveTo(x, y + h * k * pulso, x - w * 0.5 * k, y); ctx.closePath(); };
    ctx.shadowColor = 'rgba(167,121,255,0.95)'; ctx.shadowBlur = s * 0.12;
    olho(1.08); ctx.fillStyle = '#A779FF'; ctx.fill();
    ctx.shadowBlur = 0;
    olho(0.94); ctx.fillStyle = '#0B0618'; ctx.fill();
    ctx.save(); olho(0.94); ctx.clip();
    let sd = (o.semente || 3) * 99991;
    const r = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
    for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(230,220,255,${0.4 + r() * 0.6})`; ctx.beginPath(); ctx.arc(x + (r() - 0.5) * w * 0.9, y + (r() - 0.5) * h * 1.6, Math.max(0.8, s * 0.006 * (0.5 + r())), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = Math.max(1.2, s * 0.014);
    ctx.strokeStyle = '#E9DCFF'; ctx.beginPath(); ctx.moveTo(x - w * 0.47, y); ctx.quadraticCurveTo(x, y - h * 0.94 * pulso, x + w * 0.47, y); ctx.stroke();
    ctx.strokeStyle = '#7FE7FF'; ctx.beginPath(); ctx.moveTo(x - w * 0.47, y); ctx.quadraticCurveTo(x, y + h * 0.94 * pulso, x + w * 0.47, y); ctx.stroke();
    // partículas sendo sugadas
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const f = ((t * 1.6 + i * 0.137) % 1), a = i * 2.4, rr = w * 1.1 * (1 - f);
      ctx.fillStyle = i % 3 ? `rgba(216,196,255,${f * abre})` : `rgba(158,240,255,${f * abre})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.55 * Math.max(0.4, ach), Math.max(1, s * 0.012 * (1 - f) + 1), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };
})();

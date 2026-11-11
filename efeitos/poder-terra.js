// Efeito "poder-terra" — poder oficial do Lucas (controlar o elemento terra). Guia, seção 7 (elemento Terra).
// Uso: Efeitos['poder-terra'](ctx, x, y, H, { t, semente, tamanho })
//   x, y: centro (px); H: tamanho da cabeça do personagem em px (escala); t: tempo (anima); tamanho: multiplica a esfera.
// Camadas: nuvem de poeira, pedras orbitando atrás, esfera de terra com textura e rachaduras brilhando,
// pedras orbitando na frente, cascalho e poeira soltos. Funciona em cena clara (cores chapadas) e escura.
(function () {
  const COR = { brilho: '#FFE2B0', rachadura: '#FFB347', terra: '#8B5E3C', terraEscura: '#5A3A22', terraClara: '#B07A4E', pedra: '#7A7480', pedraClara: '#A39CA6', pedraEscura: '#4E4855' };

  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  // pedra de poucos lados, com face clara (luz de cima à esquerda) e face escura
  function pedra(ctx, x, y, r, giro, rnd) {
    const n = 5 + Math.floor(rnd() * 3), pts = [];
    for (let i = 0; i < n; i++) { const a = giro + (i / n) * Math.PI * 2; const rr = r * (0.75 + rnd() * 0.35); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    ctx.fillStyle = COR.pedraEscura; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COR.pedra; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px - r * 0.12, py - r * 0.12) : ctx.moveTo(px - r * 0.12, py - r * 0.12))); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COR.pedraClara; ctx.beginPath(); ctx.moveTo(pts[0][0] - r * 0.12, pts[0][1] - r * 0.12);
    const k = Math.floor(n / 2); for (let i = 1; i <= k; i++) ctx.lineTo(pts[(n - i) % n][0] - r * 0.14, pts[(n - i) % n][1] - r * 0.14);
    ctx.lineTo(x - r * 0.1, y - r * 0.1); ctx.closePath(); ctx.fill();
  }

  window.Efeitos = window.Efeitos || {};
  window.Efeitos['poder-terra'] = function (ctx, x, y, H, o = {}) {
    const t = o.t || 0;
    const R = H * 0.62 * (o.tamanho || 1) * (1 + Math.sin(t * 5) * 0.03);
    const rnd = rng(o.semente || 11);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 1. nuvem de poeira atrás (translúcida, chapada)
    for (let i = 0; i < 9; i++) {
      const a = rnd() * Math.PI * 2 + t * 0.4, d = R * (1.0 + rnd() * 0.7), r = R * (0.45 + rnd() * 0.35);
      ctx.fillStyle = `rgba(176,122,78,${0.12 + rnd() * 0.1})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, r, 0, Math.PI * 2); ctx.fill();
    }
    // brilho âmbar suave das rachaduras
    const g = ctx.createRadialGradient(x, y, R * 0.3, x, y, R * 2.2);
    g.addColorStop(0, 'rgba(255,179,71,0.35)'); g.addColorStop(1, 'rgba(255,179,71,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 2.2, 0, Math.PI * 2); ctx.fill();

    // pedras orbitando (anel inclinado): as de trás antes da esfera
    const pedras = [];
    for (let i = 0; i < 8; i++) {
      const a = t * 1.6 + (i / 8) * Math.PI * 2;
      pedras.push({ a, x: x + Math.cos(a) * R * 1.75, y: y + Math.sin(a) * R * 0.5 - Math.cos(a) * R * 0.15, r: R * (0.16 + (i % 3) * 0.05), frente: Math.sin(a) > 0, giro: a * 1.3 + i });
    }
    for (const p of pedras.filter((q) => !q.frente)) pedra(ctx, p.x, p.y, p.r * 0.85, p.giro, rng(p.r * 1000 | 0));

    // 2. esfera de terra: base, manchas, luz e sombra
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = COR.terra; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    const rr = rng(o.semente || 11);
    for (let i = 0; i < 26; i++) { // torrões (textura)
      const a = rr() * Math.PI * 2 + t * 0.6, d = rr() * R, s = R * (0.1 + rr() * 0.16);
      ctx.fillStyle = rr() > 0.5 ? COR.terraEscura : COR.terraClara;
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s * 0.7, a, 0, Math.PI * 2); ctx.fill();
    }
    const sombra = ctx.createLinearGradient(x - R, y - R, x + R, y + R);
    sombra.addColorStop(0, 'rgba(255,230,190,0.25)'); sombra.addColorStop(0.55, 'rgba(0,0,0,0)'); sombra.addColorStop(1, 'rgba(40,20,30,0.45)');
    ctx.fillStyle = sombra; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    // rachaduras brilhando
    ctx.strokeStyle = COR.rachadura; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 5; k++) {
      let a = k * 1.3 + t * 0.6, px = x + Math.cos(a) * R * 0.15, py = y + Math.sin(a) * R * 0.15;
      ctx.lineWidth = Math.max(1.5, R * 0.05); ctx.beginPath(); ctx.moveTo(px, py);
      for (let s = 0; s < 4; s++) { a += (rr() - 0.5) * 0.9; px += Math.cos(a) * R * 0.28; py += Math.sin(a) * R * 0.28; ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.strokeStyle = COR.brilho; ctx.lineWidth = Math.max(0.8, R * 0.018); ctx.stroke(); ctx.strokeStyle = COR.rachadura;
    }
    ctx.restore();
    // borda da esfera (cor escura da terra, sem contorno preto)
    ctx.strokeStyle = 'rgba(60,35,30,0.55)'; ctx.lineWidth = Math.max(1, R * 0.03);
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();

    // pedras da frente
    for (const p of pedras.filter((q) => q.frente)) pedra(ctx, p.x, p.y, p.r, p.giro, rng(p.r * 1000 | 0));

    // 3. cascalho e poeira soltos, caindo e subindo
    for (let i = 0; i < 22; i++) {
      const a = rnd() * Math.PI * 2, d = R * (1.2 + rnd() * 1.4), fase = (t * (0.6 + rnd()) + rnd()) % 1;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.8 - fase * R * 0.8;
      ctx.globalAlpha = 1 - fase;
      if (i % 3 === 0) pedra(ctx, px, py, R * 0.06, a, rng(i + 1));
      else { ctx.fillStyle = 'rgba(176,122,78,0.8)'; ctx.beginPath(); ctx.arc(px, py, R * 0.025, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  };
})();

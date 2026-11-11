// Efeito "poder-energia" (elemento Energia do guia de estilo, seção 7). Poder oficial do Lucas.
// Uso: Efeitos['poder-energia'](ctx, x, y, H, { t, semente })
//   x, y: centro (px); H: tamanho da cabeça do personagem em px (escala); t: tempo em segundos (anima).
// Camadas (de baixo para cima): aura, corpo chapado com borda recortada, miolo, núcleo, anéis, faíscas.
(function () {
  const COR = { nucleo: '#FFFDF2', miolo: '#CDF6FF', principal: '#3FC3F0', aura: '#2A6FD6' };

  function rng(seed) {
    return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function estrela(ctx, x, y, r, cor) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.22 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }
  function blobRecortado(ctx, x, y, raio, pontas, irreg, rnd, giro) {
    ctx.beginPath();
    for (let i = 0; i <= pontas * 2; i++) {
      const a = giro + (i / (pontas * 2)) * Math.PI * 2;
      const rr = i % 2 ? raio * (0.62 + rnd() * 0.12) : raio * (1 + rnd() * irreg);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  window.Efeitos = window.Efeitos || {};
  window.Efeitos['poder-energia'] = function (ctx, x, y, H, o = {}) {
    const t = o.t || 0;
    const rnd = rng((o.semente || 7) + Math.floor(t * 30) * 13);
    const pulso = 1 + Math.sin(t * 9) * 0.06;
    const R = H * 0.42 * pulso; // raio do núcleo de energia
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 1. aura (aditiva, desfocada)
    ctx.globalCompositeOperation = 'lighter';
    for (const [k, a] of [[3.6, 0.28], [2.2, 0.38]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * k);
      g.addColorStop(0, `rgba(42,111,214,${a})`);
      g.addColorStop(0.5, `rgba(42,111,214,${a * 0.45})`);
      g.addColorStop(1, 'rgba(42,111,214,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * k, 0, Math.PI * 2); ctx.fill();
    }

    // 2. corpo chapado, borda recortada (normal, sem contorno)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = COR.principal;
    blobRecortado(ctx, x, y, R * 1.25, 9, 0.35, rnd, t * 2);
    ctx.fill();

    // 3. miolo e 4. núcleo (aditivos)
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = COR.miolo;
    blobRecortado(ctx, x, y, R * 0.85, 7, 0.25, rnd, -t * 3);
    ctx.fill();
    ctx.fillStyle = COR.nucleo;
    ctx.beginPath(); ctx.arc(x, y, R * 0.45, 0, Math.PI * 2); ctx.fill();

    // anéis girando (miolo), com espessura variável
    ctx.strokeStyle = COR.miolo;
    ctx.lineCap = 'round';
    for (const [rx, ry, giro, esp] of [[1.9, 0.62, 0.5 + t * 2.4, 0.09], [1.6, 0.5, -0.9 - t * 3.1, 0.07]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(giro);
      ctx.lineWidth = R * esp;
      ctx.beginPath(); ctx.ellipse(0, 0, R * rx, R * ry, 0, 0.2, Math.PI * 1.35); ctx.stroke();
      ctx.restore();
    }

    // 5. faíscas: estrelas de 4 pontas e pontos
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, d = R * (1.4 + rnd() * 1.6);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      if (i % 3 === 0) estrela(ctx, px, py, H * (0.06 + rnd() * 0.12), COR.miolo);
      else { ctx.fillStyle = COR.miolo; ctx.beginPath(); ctx.arc(px, py, H * (0.012 + rnd() * 0.02), 0, Math.PI * 2); ctx.fill(); }
    }
    // estrela grande no centro (brilho)
    estrela(ctx, x, y, R * 1.9, 'rgba(255,253,242,0.85)');
    ctx.restore();
  };
})();

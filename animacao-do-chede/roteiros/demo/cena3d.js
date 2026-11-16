// Exemplo do cenário 3D sem personagens da série: uma silhueta 2D simples (troque pela sua fábrica de personagem
// com api.personagem3d) dentro do Valdor3D, com sombra, grama na frente das pernas, magia 3D, tocha e fumaça.
(function () {
  const { noite, camNoite, chave, orbe } = window.CenaNoite;
  // silhueta de exemplo, desenhada em pé no ponto (X, Z) do mundo; alt = altura em metros
  function boneco(ctx, cam, X, Z, alt, cor, t) {
    const q = cam.p(X, 0, Z), h = alt * q.s, bal = Math.sin(t * 3) * 0.02 * h;
    ctx.save(); ctx.fillStyle = cor; ctx.strokeStyle = cor; ctx.lineCap = 'round';
    ctx.lineWidth = h * 0.11; ctx.beginPath(); ctx.moveTo(q.x - h * 0.08, q.y); ctx.lineTo(q.x - h * 0.05, q.y - h * 0.47); ctx.moveTo(q.x + h * 0.08, q.y); ctx.lineTo(q.x + h * 0.05, q.y - h * 0.47); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(q.x, q.y - h * 0.66, h * 0.15, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = h * 0.08; ctx.beginPath(); ctx.moveTo(q.x - h * 0.13, q.y - h * 0.8); ctx.lineTo(q.x - h * 0.22, q.y - h * 0.52 + bal); ctx.moveTo(q.x + h * 0.13, q.y - h * 0.8); ctx.lineTo(q.x + h * 0.24, q.y - h * 0.55 - bal); ctx.stroke();
    ctx.beginPath(); ctx.arc(q.x, q.y - h * 0.92, h * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); return q;
  }
  window.PLANOS = {
    dia(ctx, u, d, api) {
      const cam = camNoite(api, { noite: 0, dia: true, nevoa: Valdor3D.nevoa(0, true), x: chave(u, [[0, -0.4], [d, 0.2]]), z: chave(u, [[0, 0.6], [d, 1.2]]), y: 1.3 });
      noite(ctx, api, cam, [
        { pos: [0.3, 5.5], alt: 1.75, f: () => boneco(ctx, cam, 0.3, 5.5, 1.75, '#3A4A6B', api.t) },
        { pos: [-1.6, 7.5], alt: 1.7, f: () => boneco(ctx, cam, -1.6, 7.5, 1.7, '#6B3A3A', api.t + 1) },
      ], { dia: true, forca: 0.6 });
    },
    magia(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0, 1.1, 5], raio: 2.6, ang: -1.75 + u * 0.12, altura: 1.25, f: 1150, ySalvo: 960, nevoa: Valdor3D.nevoa(0.3) });
      const k = Math.min(1, u / 0.8);
      noite(ctx, api, cam, [{ pos: [0, 5], alt: 1.75, f: () => boneco(ctx, cam, 0, 5, 1.75, '#2E3550', api.t) }], {
        noite: 0.3,
        magias: () => [{ tipo: 'circulo', x: 0, z: 5, raio: 1.0, k }, orbe({ x: 0.35, y: 1.15, z: 5 }, k)],
        luzes: [{ x: -1.2, y: 1.7, z: 5.6, cor: '#FFB066', forca: 0.9 }],
        depois: () => { const q = cam.p(-1.2, 1.7, 5.6); Noite.tocha(ctx, q.x, q.y, 0.6 * q.s / 100, api.t); },
      });
    },
    noite(ctx, u, d, api) {
      const cam = camNoite(api, { noite: 1, x: 0.1, y: 1.35, z: chave(u, [[0, 0.8], [d, 1.6]]) });
      noite(ctx, api, cam, [{ pos: [0.2, 5.4], alt: 1.75, f: () => boneco(ctx, cam, 0.2, 5.4, 1.75, '#2A2F45', api.t) }], {
        noite: 1, forca: 0.7,
        depois: () => { const q = cam.p(0.2, 0, 5.4); Noite.fumaca(ctx, q.x, q.y, 1.2 * q.s, Math.min(1, u / 1.5), { cor: '150,160,190', seed: 4 }); },
      });
    },
  };
})();

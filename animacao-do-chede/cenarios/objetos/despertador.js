// Objeto: DESPERTADOR de dois sinos. Unidades em H; base no chão/móvel (y = 0). Altura ~1 H.
// Opções: { tocando: true } (treme e mostra linhas de vibração), { hora: 6.5 } (6h30), { t } tempo para tremer
(function () {
  const T = (n) => Estilo.tom(n);
  window.Objetos.despertador = {
    largura: 0.9, altura: 1.05,
    desenhar(pc, o = {}) {
      const P = Cena.P, ctx = pc.ctx;
      const corpo = T('brasa'), linho = T('linho'), grafite = T('grafite');
      const cy = -0.5, R = 0.36;
      if (o.tocando) { const t = o.t || 0; ctx.translate(0, cy); ctx.rotate(Math.sin(t * 60) * 0.12); ctx.translate(0, -cy); }
      // pés
      for (const s of [-1, 1]) pc.peca(P((p) => { p.moveTo(0.18 * s, -0.2); p.lineTo(0.3 * s, 0); p.lineTo(0.2 * s, 0); p.lineTo(0.1 * s, -0.16); p.closePath(); }), grafite, { sombra: 0 });
      // sinos e martelo
      for (const s of [-1, 1]) {
        pc.peca(P((p) => { p.moveTo(0.06 * s, -0.83); p.quadraticCurveTo(0.12 * s, -1.06, 0.34 * s, -0.98); p.quadraticCurveTo(0.42 * s, -0.86, 0.34 * s, -0.78); p.closePath(); }), corpo, { sombra: 0.04 });
      }
      pc.peca(P((p) => p.roundRect(-0.03, -1.04, 0.06, 0.2, 0.02)), grafite, { sombra: 0 });
      pc.peca(P((p) => p.arc(0, -1.06, 0.045, 0, Math.PI * 2)), grafite, { sombra: 0 });
      // corpo e mostrador
      pc.peca(P((p) => p.arc(0, cy, R, 0, Math.PI * 2)), corpo, { sombra: 0.07 });
      pc.peca(P((p) => p.arc(-0.01, cy - 0.01, R * 0.76, 0, Math.PI * 2)), linho, { sombra: 0.03 });
      // marcas e ponteiros
      pc.linha(P((p) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const r0 = i % 3 ? 0.22 : 0.19; p.moveTo(Math.cos(a) * r0 - 0.01, cy - 0.01 + Math.sin(a) * r0); p.lineTo(Math.cos(a) * 0.245 - 0.01, cy - 0.01 + Math.sin(a) * 0.245); } }), pc.interno * 0.8);
      const hora = o.hora === undefined ? 6.5 : o.hora;
      const aH = ((hora % 12) / 12) * Math.PI * 2 - Math.PI / 2, aM = ((hora % 1) * Math.PI * 2) - Math.PI / 2;
      pc.linha(P((p) => { p.moveTo(-0.01, cy - 0.01); p.lineTo(-0.01 + Math.cos(aH) * 0.12, cy - 0.01 + Math.sin(aH) * 0.12); }), pc.contorno * 1.1);
      pc.linha(P((p) => { p.moveTo(-0.01, cy - 0.01); p.lineTo(-0.01 + Math.cos(aM) * 0.19, cy - 0.01 + Math.sin(aM) * 0.19); }), pc.contorno * 0.8);
      pc.preencher(P((p) => p.arc(-0.01, cy - 0.01, 0.025, 0, Math.PI * 2)), Estilo.base.tinta);
      // brilho do vidro
      pc.preencher(P((p) => { p.moveTo(-0.2, cy - 0.12); p.quadraticCurveTo(-0.16, cy - 0.24, -0.04, cy - 0.26); p.quadraticCurveTo(-0.14, cy - 0.2, -0.17, cy - 0.08); p.closePath(); }), 'rgba(255,255,255,0.8)');
      if (o.tocando) {
        // linhas de vibração
        ctx.rotate(0);
        for (const s of [-1, 1]) {
          pc.linha(P((p) => { p.moveTo(0.5 * s, -1.0); p.lineTo(0.62 * s, -1.12); p.moveTo(0.56 * s, -0.86); p.lineTo(0.72 * s, -0.9); p.moveTo(0.52 * s, -0.72); p.lineTo(0.66 * s, -0.66); }), pc.contorno);
        }
      }
    },
  };
})();

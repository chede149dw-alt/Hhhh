// Objeto: MOCHILA escolar (vista de frente, apoiada no chão). Unidades em H; base em y = 0. Altura ~1,5 H.
// Opções: { cor: nome de cor do guia } (padrão Brasa)
(function () {
  const T = (n) => Estilo.tom(n);
  window.Objetos.mochila = {
    largura: 1.2, altura: 1.6,
    desenhar(pc, o = {}) {
      const P = Cena.P;
      const cor = T(o.cor || 'brasa'), grafite = T('grafite'), linho = T('linho');
      // alça de mão e alças das costas (atrás)
      pc.linha(P((p) => { p.moveTo(-0.16, -1.42); p.quadraticCurveTo(0, -1.72, 0.16, -1.42); }), 0.07, Estilo.base.tinta);
      pc.linha(P((p) => { p.moveTo(-0.16, -1.42); p.quadraticCurveTo(0, -1.72, 0.16, -1.42); }), 0.04, grafite.base);
      for (const s of [-1, 1]) pc.peca(P((p) => { p.moveTo(0.3 * s, -1.38); p.quadraticCurveTo(0.66 * s, -1.0, 0.5 * s, -0.12); p.lineTo(0.4 * s, -0.12); p.quadraticCurveTo(0.54 * s, -1.0, 0.22 * s, -1.34); p.closePath(); }), grafite, { sombra: 0.03 });
      // corpo
      const corpo = P((p) => { p.moveTo(-0.5, -0.05); p.lineTo(-0.56, -1.05); p.quadraticCurveTo(-0.56, -1.5, 0, -1.5); p.quadraticCurveTo(0.56, -1.5, 0.56, -1.05); p.lineTo(0.5, -0.05); p.quadraticCurveTo(0, 0.02, -0.5, -0.05); p.closePath(); });
      pc.peca(corpo, cor, { sombra: 0.1 });
      // zíper de cima
      pc.linha(P((p) => { p.moveTo(-0.5, -1.0); p.quadraticCurveTo(0, -1.4, 0.5, -1.0); }));
      // bolso da frente
      const bolso = P((p) => p.roundRect(-0.36, -0.72, 0.72, 0.58, 0.14));
      pc.peca(bolso, cor, { sombra: 0.06 });
      pc.linha(P((p) => { p.moveTo(-0.34, -0.6); p.lineTo(0.34, -0.6); }));
      // puxadores
      for (const [x, y] of [[0.28, -1.14], [0.22, -0.62]]) {
        pc.peca(P((p) => p.roundRect(x - 0.03, y, 0.06, 0.16, 0.03)), linho, { sombra: 0, espessura: pc.interno });
      }
      // etiqueta geométrica
      pc.peca(P((p) => { p.moveTo(-0.12, -0.28); p.lineTo(0.0, -0.46); p.lineTo(0.12, -0.28); p.closePath(); }), linho, { sombra: 0, espessura: pc.interno });
    },
  };
})();

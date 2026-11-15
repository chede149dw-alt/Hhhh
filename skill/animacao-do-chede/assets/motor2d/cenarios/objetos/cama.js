// Objeto: CAMA de solteiro (vista lateral, cabeceira à esquerda). Unidades em H; base no chão (y = 0).
// Comprimento 6,3 H (~2 m para um personagem de 5,5 H). Opções: { cobertor: nome de cor do guia }
(function () {
  const T = (n) => Estilo.tom(n);
  window.Objetos.cama = {
    largura: 6.4, altura: 3.1,
    desenhar(pc, o = {}) {
      const P = Cena.P;
      const madeira = T('madeira'), linho = T('linho'), cob = T(o.cobertor || 'denim');
      // pés
      for (const x of [-2.95, 2.75]) pc.peca(P((p) => p.roundRect(x, -0.35, 0.22, 0.35, 0.04)), madeira, { sombra: 0.04 });
      // estrado
      pc.peca(P((p) => p.roundRect(-3.0, -0.95, 6.0, 0.62, 0.08)), madeira, { sombra: 0.1 });
      pc.linha(P((p) => { p.moveTo(-2.9, -0.62); p.lineTo(2.9, -0.62); }));
      // cabeceira e peseira
      pc.peca(P((p) => { p.moveTo(-3.2, 0); p.lineTo(-3.2, -2.75); p.quadraticCurveTo(-3.2, -3.1, -2.85, -3.1); p.lineTo(-2.7, -3.1); p.quadraticCurveTo(-2.55, -3.1, -2.55, -2.75); p.lineTo(-2.55, 0); p.closePath(); }), madeira, { sombra: 0.12 });
      pc.peca(P((p) => { p.moveTo(2.6, 0); p.lineTo(2.6, -1.9); p.quadraticCurveTo(2.6, -2.15, 2.85, -2.15); p.lineTo(2.95, -2.15); p.quadraticCurveTo(3.2, -2.15, 3.2, -1.9); p.lineTo(3.2, 0); p.closePath(); }), madeira, { sombra: 0.12 });
      // colchão
      pc.peca(P((p) => p.roundRect(-2.6, -1.6, 5.25, 0.7, 0.18)), linho, { sombra: 0.1 });
      // travesseiro
      pc.peca(P((p) => { p.moveTo(-2.5, -1.6); p.quadraticCurveTo(-2.6, -2.15, -2.1, -2.12); p.lineTo(-1.35, -2.06); p.quadraticCurveTo(-0.95, -2.0, -1.05, -1.6); p.closePath(); }), linho, { sombra: 0.12 });
      pc.linha(P((p) => { p.moveTo(-2.2, -1.85); p.quadraticCurveTo(-1.8, -1.95, -1.45, -1.8); }));
      // cobertor dobrado sobre o colchão, caindo pela lateral com dobras
      const cobertor = P((p) => {
        p.moveTo(-1.2, -1.66);
        p.quadraticCurveTo(0.6, -1.86, 2.68, -1.66);
        p.lineTo(2.62, -0.7);
        p.quadraticCurveTo(2.3, -0.6, 2.0, -0.72); p.quadraticCurveTo(1.6, -0.6, 1.2, -0.7);
        p.quadraticCurveTo(0.7, -0.58, 0.2, -0.7); p.quadraticCurveTo(-0.3, -0.6, -0.75, -0.72);
        p.lineTo(-1.25, -0.74);
        p.closePath();
      });
      pc.peca(cobertor, cob, { sombra: 0.12 });
      // faixa e barra do cobertor
      pc.sombraDentro(cobertor, P((p) => p.rect(-1.3, -1.0, 4.1, 0.12)), T('linho').base);
      pc.linha(P((p) => { p.moveTo(-1.2, -1.5); p.quadraticCurveTo(0.6, -1.66, 2.66, -1.5); }));
      pc.linha(P((p) => { for (const x of [-0.3, 0.7, 1.7]) { p.moveTo(x, -1.45); p.quadraticCurveTo(x + 0.08, -1.1, x - 0.02, -0.75); } }));
    },
  };
})();

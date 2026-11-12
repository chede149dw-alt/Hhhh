// Ferramentas para cenários e objetos (mesmas regras do guia: cor chapada, sombra de corte único, contorno Tinta).
//   Cena.pincel(ctx, x, y, escala, contornoPx): pincel com origem em (x, y) e unidade = escala px
//   Cena.objeto(ctx, nome, x, yChao, H, opcoes): desenha window.Objetos[nome] com a base em (x, yChao); H = cabeça em px
//   Cena.cenario(ctx, nome, opcoes): desenha window.Cenarios[nome] em 1080 × 1920
// Contorno dos cenários (guia, seção 11): plano do personagem 4 px · plano médio 2,5 px · fundo distante sem contorno.
(function () {
  window.Objetos = window.Objetos || {};
  window.Cenarios = window.Cenarios || {};
  const CONTORNO = { perto: 4, medio: 2.5, longe: 0 };

  function pincel(ctx, x, y, escala, contornoPx) {
    const m = ctx.getTransform().multiply(new DOMMatrix().translate(x, y).scale(escala));
    ctx.setTransform(m);
    return window.criarPincel(ctx, m, (contornoPx === undefined ? CONTORNO.perto : contornoPx) / escala);
  }

  function rng(seed) {
    return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  }

  window.Cena = {
    CONTORNO, pincel, rng,
    P: (fn) => { const p = new Path2D(); fn(p); return p; },
    objeto(ctx, nome, x, yChao, H, o = {}) {
      const obj = window.Objetos[nome];
      if (!obj) throw new Error('Objeto não encontrado: ' + nome);
      ctx.save();
      // sombra no chão
      if (obj.sombra !== false && !o.semSombra) {
        ctx.filter = 'blur(10px)';
        ctx.fillStyle = Estilo.sombraChao;
        ctx.beginPath(); ctx.ellipse(x, yChao, (obj.largura * H) / 2 * 0.95, H * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.filter = 'none';
      }
      const pc = pincel(ctx, x, yChao, H * (o.escala || 1), (o.contornoPx === undefined ? CONTORNO.perto : o.contornoPx) * (o.escala || 1));
      if (o.espelhar) { ctx.scale(-1, 1); }
      obj.desenhar(pc, o);
      ctx.restore();
    },
    cenario(ctx, nome, o = {}) {
      const c = window.Cenarios[nome];
      if (!c) throw new Error('Cenário não encontrado: ' + nome);
      ctx.save();
      c.desenhar(ctx, o);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
  };
})();

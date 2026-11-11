// Cenário: CORREDOR DA ESCOLA (1080 × 1920, câmera frontal): armários, mural, relógio, piso xadrez.
// Chão (pés): y ≈ 1620. Escala sugerida: cabeça de 140 px.
(function () {
  const T = (n) => Estilo.tom(n);
  window.Cenarios.escola = {
    chaoY: 1620, cabecaPx: 140,
    desenhar(ctx, o = {}) {
      const P = Cena.P, W = 1080, H = 1920, CHAO = 1450;
      const parede = T('paredeEscola'), armario = T('armario'), linho = T('linho');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = parede.base; ctx.fillRect(0, 0, W, CHAO);
      // teto com luminárias
      ctx.fillStyle = Estilo.multiply(parede.base, '#E4E0EC'); ctx.fillRect(0, 0, W, 120);
      let pc = Cena.pincel(ctx, 0, 0, 1, Cena.CONTORNO.medio);
      for (const x of [140, 600]) {
        pc.peca(P((p) => p.roundRect(x, 60, 340, 34, 10)), T('vidro'), { sombra: 0, espessura: 2.5 });
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        const g = ctx.createLinearGradient(0, 94, 0, 420); g.addColorStop(0, 'rgba(255,253,242,0.45)'); g.addColorStop(1, 'rgba(255,253,242,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 94); ctx.lineTo(x + 340, 94); ctx.lineTo(x + 420, 420); ctx.lineTo(x - 80, 420); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      // faixa decorativa na parede
      pc.peca(P((p) => p.rect(-10, 600, W + 20, 26)), T('turquesa'), { sombra: 0, espessura: 2.5 });

      // mural de cortiça com papéis
      pc = Cena.pincel(ctx, 0, 0, 1);
      pc.peca(P((p) => p.rect(90, 230, 470, 320)), T('madeira'), { sombra: 8 });
      pc.peca(P((p) => p.rect(110, 250, 430, 280)), T('madeiraClara'), { sombra: 0, espessura: 2.5 });
      for (const [x, y, w, h, cor, a] of [[135, 275, 120, 150, 'linho', -0.05], [280, 270, 110, 90, 'mostarda', 0.06], [410, 285, 105, 130, 'linho', 0.04], [290, 385, 140, 110, 'coral', -0.04], [150, 440, 100, 70, 'turquesa', 0.08]]) {
        ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(a);
        pc.peca(P((p) => p.rect(-w / 2, -h / 2, w, h)), T(cor), { sombra: 4, espessura: 2.5 });
        pc.linha(P((p) => { for (let i = 1; i < 4; i++) { p.moveTo(-w / 2 + 14, -h / 2 + i * (h / 5) + 10); p.lineTo(w / 2 - 18 - (i % 2) * 20, -h / 2 + i * (h / 5) + 10); } }), 2.5, 'rgba(33,27,38,0.35)');
        pc.peca(P((p) => p.arc(0, -h / 2 + 10, 8, 0, Math.PI * 2)), T('brasa'), { sombra: 0, espessura: 2 });
        ctx.restore();
      }
      // relógio
      pc.peca(P((p) => p.arc(820, 380, 105, 0, Math.PI * 2)), T('grafite'), { sombra: 6 });
      pc.peca(P((p) => p.arc(820, 380, 86, 0, Math.PI * 2)), linho, { sombra: 0, espessura: 2.5 });
      pc.linha(P((p) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; p.moveTo(820 + Math.cos(a) * 70, 380 + Math.sin(a) * 70); p.lineTo(820 + Math.cos(a) * 80, 380 + Math.sin(a) * 80); } }), 2.5);
      pc.linha(P((p) => { p.moveTo(820, 380); p.lineTo(820, 325); p.moveTo(820, 380); p.lineTo(862, 400); }), 5);

      // armários
      const topo = 680, lw = 154;
      for (let i = 0; i < 7; i++) {
        const x0 = i * lw - 2;
        const porta = P((p) => p.rect(x0, topo, lw, CHAO - topo));
        pc.peca(porta, armario, { sombra: 10 });
        pc.linha(P((p) => { for (let k = 0; k < 3; k++) { p.moveTo(x0 + 40, topo + 50 + k * 22); p.lineTo(x0 + lw - 40, topo + 50 + k * 22); } }), 3.5, armario.sombra);
        pc.peca(P((p) => p.roundRect(x0 + lw - 40, topo + 330, 16, 60, 8)), T('linho'), { sombra: 0, espessura: 2.5 });
        pc.peca(P((p) => p.rect(x0 + 50, topo + 150, 54, 30)), T('linho'), { sombra: 0, espessura: 2.5 });
      }
      // um armário entreaberto
      pc.peca(P((p) => { p.moveTo(4 * lw - 2, topo); p.lineTo(4 * lw + 60, topo - 20); p.lineTo(4 * lw + 60, CHAO + 18); p.lineTo(4 * lw - 2, CHAO); p.closePath(); }), T('armario'), { sombra: 6 });
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(33,27,38,0.55)'; ctx.fillRect(3 * lw + 6, topo + 8, lw - 16, CHAO - topo - 16); ctx.restore();
      pc.peca(P((p) => p.rect(3 * lw + 20, topo + 420, lw - 40, 18)), T('madeira'), { sombra: 0, espessura: 2.5 });
      pc.peca(P((p) => p.rect(3 * lw + 30, topo + 330, 60, 90)), T('coral'), { sombra: 4, espessura: 2.5 });
      // rodapé e piso xadrez em perspectiva
      pc.peca(P((p) => p.rect(-10, CHAO - 20, W + 20, 24)), T('grafite'), { sombra: 0 });
      const linhas = [CHAO, CHAO + 55, CHAO + 125, CHAO + 215, CHAO + 330, H];
      for (let r = 0; r < linhas.length - 1; r++) {
        const y0 = linhas[r] + 4, y1 = linhas[r + 1];
        const n = 8, larg0 = W / n;
        for (let i = -1; i <= n; i++) {
          const cx0 = i * larg0, k0 = 1 + (y0 - CHAO) / 600, k1 = 1 + (y1 - CHAO) / 600;
          const xa = W / 2 + (cx0 - W / 2) * k0, xb = W / 2 + (cx0 + larg0 - W / 2) * k0;
          const xc = W / 2 + (cx0 + larg0 - W / 2) * k1, xd = W / 2 + (cx0 - W / 2) * k1;
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = (i + r) % 2 ? T('calcada').base : linho.base;
          ctx.beginPath(); ctx.moveTo(xa, y0); ctx.lineTo(xb, y0); ctx.lineTo(xc, y1); ctx.lineTo(xd, y1); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
      // reflexo suave dos armários no piso
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, CHAO, 0, CHAO + 160); g.addColorStop(0, 'rgba(94,127,168,0.22)'); g.addColorStop(1, 'rgba(94,127,168,0)');
      ctx.fillStyle = g; ctx.fillRect(0, CHAO + 4, W, 160);
    },
  };
})();

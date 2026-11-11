// Cenário: QUARTO DO LUCAS, DE MANHÃ (1080 × 1920, câmera frontal).
// Chão (pés dos personagens): y ≈ 1640 em primeiro plano. Escala sugerida: cabeça de 145 px (personagem ~800 px).
// Luz: sol da manhã entrando pela janela à esquerda (de cima à esquerda, como o guia).
(function () {
  const T = (n) => Estilo.tom(n);
  window.Cenarios['quarto-manha'] = {
    chaoY: 1640, cabecaPx: 145,
    desenhar(ctx, o = {}) {
      const P = Cena.P, W = 1080, H = 1920, CHAO = 1480;
      const parede = T('parede'), madeira = T('madeira'), madeiraC = T('madeiraClara'), linho = T('linho');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // parede
      ctx.fillStyle = parede.base; ctx.fillRect(0, 0, W, CHAO);
      // faixa de sombra no alto da parede (teto)
      ctx.fillStyle = parede.sombra; ctx.globalAlpha = 0.35; ctx.fillRect(0, 0, W, 90); ctx.globalAlpha = 1;
      // chão de madeira com tábuas em perspectiva
      ctx.fillStyle = madeiraC.base; ctx.fillRect(0, CHAO, W, H - CHAO);
      let pc = Cena.pincel(ctx, 0, 0, 1, Cena.CONTORNO.medio);
      const linhas = [CHAO + 40, CHAO + 95, CHAO + 165, CHAO + 255, CHAO + 370];
      pc.linha(P((p) => { for (const y of linhas) { p.moveTo(0, y); p.lineTo(W, y); } }), 2.5, madeira.base);
      pc.linha(P((p) => {
        let y0 = CHAO;
        linhas.concat([H]).forEach((y, i) => { for (let x = (i % 2) * 90 + 60; x < W; x += 260 + i * 40) { p.moveTo(x, y0); p.lineTo(x, y); } y0 = y; });
      }), 2.5, madeira.base);

      // janela (esquerda): moldura, céu da manhã, telhados ao longe, sol, travessas
      const jx = 80, jy = 300, jw = 430, jh = 560;
      pc = Cena.pincel(ctx, 0, 0, 1);
      pc.peca(P((p) => p.rect(jx - 24, jy - 24, jw + 48, jh + 48)), linho, { sombra: 8 });
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath(); ctx.rect(jx, jy, jw, jh); ctx.clip();
      const faixas = [T('ceu').base, T('ceu').luz, Estilo.multiply(T('ceuHorizonte').base, '#FFFFFF'), T('ceuHorizonte').base];
      faixas.forEach((cor, i) => { ctx.fillStyle = cor; ctx.fillRect(jx, jy + (jh * i) / 4, jw, jh / 4 + 1); });
      ctx.fillStyle = 'rgba(255,230,168,0.45)'; ctx.beginPath(); ctx.arc(jx + 120, jy + 360, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T('sol').base; ctx.beginPath(); ctx.arc(jx + 120, jy + 360, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = Estilo.multiply(T('casaCeu').base, '#E8EEF4');
      ctx.beginPath(); ctx.moveTo(jx, jy + jh);
      for (const [x, y] of [[0, 430], [60, 430], [60, 400], [150, 400], [150, 450], [220, 450], [220, 380], [300, 380], [330, 350], [360, 380], [430, 380], [430, 560]]) ctx.lineTo(jx + x, jy + y);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      pc = Cena.pincel(ctx, 0, 0, 1);
      pc.contornar(P((p) => p.rect(jx, jy, jw, jh)), 2.5);
      pc.peca(P((p) => { p.rect(jx + jw / 2 - 9, jy, 18, jh); }), linho, { sombra: 0, espessura: 2.5 });
      pc.peca(P((p) => { p.rect(jx, jy + 250, jw, 18); }), linho, { sombra: 0, espessura: 2.5 });
      pc.peca(P((p) => p.roundRect(jx - 40, jy + jh + 20, jw + 80, 30, 6)), linho, { sombra: 6 });

      // cortinas mostarda com dobras
      const mostarda = T('mostarda');
      pc.peca(P((p) => p.roundRect(jx - 90, jy - 70, jw + 180, 16, 8)), T('grafite'), { sombra: 0 });
      for (const [x0, dir] of [[jx - 95, 1], [jx + jw + 95, -1]]) {
        const cort = P((p) => {
          p.moveTo(x0, jy - 60); p.lineTo(x0 + 120 * dir, jy - 60);
          p.quadraticCurveTo(x0 + 70 * dir, jy + 300, x0 + 110 * dir, jy + 620);
          p.quadraticCurveTo(x0 + 60 * dir, jy + 650, x0, jy + 640); p.closePath();
        });
        pc.peca(cort, mostarda, { sombra: 14 });
        pc.linha(P((p) => { for (const k of [0.33, 0.66]) { p.moveTo(x0 + 120 * k * dir, jy - 50); p.quadraticCurveTo(x0 + 80 * k * dir, jy + 300, x0 + 100 * k * dir, jy + 620); } }));
      }

      // pôster geométrico
      pc.peca(P((p) => p.rect(640, 290, 300, 380)), linho, { sombra: 6 });
      pc.peca(P((p) => p.rect(665, 315, 250, 330)), T('marinho'), { sombra: 0, espessura: 2.5 });
      pc.peca(P((p) => p.arc(790, 430, 70, 0, Math.PI * 2)), T('turquesa'), { sombra: 0, espessura: 2.5 });
      pc.peca(P((p) => { p.moveTo(700, 610); p.lineTo(790, 480); p.lineTo(880, 610); p.closePath(); }), T('mostarda'), { sombra: 0, espessura: 2.5 });
      for (const [x, y] of [[650, 282], [920, 282]]) { pc.ctx.save(); pc.ctx.translate(x, y); pc.ctx.rotate(0.6); pc.preencher(P((p) => p.rect(-6, -20, 40, 18)), 'rgba(242,237,230,0.85)'); pc.ctx.restore(); }

      // prateleira com livros e plantinha
      pc.peca(P((p) => p.rect(620, 800, 360, 20)), madeira, { sombra: 4 });
      let bx = 640;
      for (const [w, h, cor] of [[34, 110, 'brasa'], [28, 96, 'denim'], [40, 120, 'turquesa'], [30, 90, 'lilas'], [36, 104, 'mostarda']]) {
        pc.peca(P((p) => p.rect(bx, 800 - h, w, h)), T(cor), { sombra: 5, espessura: 2.5 }); bx += w + 4;
      }
      pc.peca(P((p) => { p.moveTo(860, 800); p.lineTo(872, 745); p.lineTo(928, 745); p.lineTo(940, 800); p.closePath(); }), T('coral'), { sombra: 5, espessura: 2.5 });
      for (const a of [-0.7, -0.2, 0.3, 0.8]) pc.peca(P((p) => p.ellipse(900 + Math.sin(a) * 30, 715 - Math.cos(a) * 18, 14, 34, a, 0, Math.PI * 2)), T('folhagem'), { sombra: 3, espessura: 2.5 });

      // rodapé
      pc.peca(P((p) => p.rect(-10, CHAO - 34, W + 20, 34)), linho, { sombra: 4 });

      // feixes de luz da janela no chão e na parede (luz chapada, sem contorno)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(255,241,204,0.28)';
      ctx.beginPath(); ctx.moveTo(jx + jw, jy); ctx.lineTo(jx + jw + 520, CHAO + 60); ctx.lineTo(jx + jw + 760, CHAO + 300); ctx.lineTo(jx + jw, jy + jh); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,241,204,0.32)';
      ctx.beginPath(); ctx.moveTo(jx + 330, CHAO + 70); ctx.lineTo(jx + 780, CHAO + 70); ctx.lineTo(jx + 1000, CHAO + 330); ctx.lineTo(jx + 420, CHAO + 330); ctx.closePath(); ctx.fill();

      // tapete
      pc = Cena.pincel(ctx, 0, 0, 1);
      const tapete = P((p) => p.ellipse(560, 1780, 420, 95, 0, 0, Math.PI * 2));
      pc.peca(tapete, T('lilas'), { sombra: 10 });
      pc.linha(P((p) => p.ellipse(560, 1780, 330, 68, 0, 0, Math.PI * 2)), 2.5, T('lilas').sombra);

      // móveis e objetos
      // criado-mudo
      pc.peca(P((p) => p.rect(70, 1250, 220, 300)), madeira, { sombra: 14 });
      pc.peca(P((p) => p.rect(55, 1230, 250, 30)), madeiraC, { sombra: 6 });
      pc.linha(P((p) => { p.moveTo(80, 1390); p.lineTo(280, 1390); }));
      pc.peca(P((p) => p.roundRect(155, 1310, 50, 16, 8)), T('grafite'), { sombra: 0, espessura: 2.5 });
      if (o.objetos !== false) {
        Cena.objeto(ctx, 'despertador', 180, 1230, 110, { tocando: o.despertadorTocando, t: o.t, semSombra: true });
        Cena.objeto(ctx, 'cama', 715, 1600, 116, { cobertor: 'denim' });
        Cena.objeto(ctx, 'mochila', 200, 1690, 120, { cor: 'brasa' });
      }
    },
  };
})();

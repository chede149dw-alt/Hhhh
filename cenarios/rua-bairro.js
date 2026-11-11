// Cenário: RUA DO BAIRRO, DE MANHÃ (1080 × 1920). Três planos para paralaxe:
//   fundo (céu, nuvens, prédios distantes: sem contorno), meio (casas e árvores: 2,5 px), frente (calçada, poste: 4 px).
// Chão (pés na calçada): y ≈ 1470. Escala sugerida: cabeça de 115 px. o.paralaxe (px) desloca os planos.
(function () {
  const T = (n) => Estilo.tom(n);
  window.Cenarios['rua-bairro'] = {
    chaoY: 1470, cabecaPx: 115,
    desenhar(ctx, o = {}) {
      const P = Cena.P, W = 1080, H = 1920, px = o.paralaxe || 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // céu em faixas
      const ceu = [T('ceu').base, T('ceu').luz, Estilo.multiply(T('ceuHorizonte').base, '#FFFFFF'), T('ceuHorizonte').base];
      ceu.forEach((cor, i) => { ctx.fillStyle = cor; ctx.fillRect(0, i * 290, W, i === 3 ? 460 : 291); });
      // sol (alto à esquerda)
      ctx.fillStyle = 'rgba(255,230,168,0.4)'; ctx.beginPath(); ctx.arc(200 - px * 0.05, 300, 150, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T('sol').base; ctx.beginPath(); ctx.arc(200 - px * 0.05, 300, 95, 0, Math.PI * 2); ctx.fill();
      // nuvens (chapadas, sem contorno)
      const nuvem = (x, y, s) => {
        ctx.fillStyle = T('nuvem').base;
        ctx.beginPath();
        for (const [dx, dy, r] of [[0, 0, 60], [70, -30, 75], [150, 0, 60], [75, 20, 55]]) { ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); }
        ctx.fill();
        ctx.fillStyle = 'rgba(190,174,207,0.35)'; ctx.fillRect(x - 60 * s, y + 30 * s, 270 * s, 0);
      };
      nuvem(560 - px * 0.1, 260, 1.1); nuvem(820 - px * 0.1, 520, 0.8); nuvem(80 - px * 0.1, 640, 0.7);
      // prédios distantes
      ctx.fillStyle = Estilo.multiply(T('casaCeu').base, '#EEF2F6');
      ctx.beginPath(); ctx.moveTo(0, 1180);
      let x = -40 - (px * 0.25) % 200;
      while (x < W + 200) { const h = 120 + ((x * 7) % 130); ctx.lineTo(x, 1180 - h); ctx.lineTo(x + 150, 1180 - h); ctx.lineTo(x + 150, 1180 - h * 0.7); x += 170; }
      ctx.lineTo(W, 1180); ctx.closePath(); ctx.fill();

      // plano médio: casas e árvores
      let pc = Cena.pincel(ctx, -px * 0.5, 0, 1, Cena.CONTORNO.medio);
      const casa = (x0, w, h, cor, telhadoH) => {
        const base = 1300;
        pc.peca(P((p) => p.rect(x0, base - h, w, h)), T(cor), { sombra: 12, espessura: 2.5 });
        pc.peca(P((p) => { p.moveTo(x0 - 25, base - h); p.lineTo(x0 + w / 2, base - h - telhadoH); p.lineTo(x0 + w + 25, base - h); p.closePath(); }), T('telhado'), { sombra: 10, espessura: 2.5 });
        // janelas e porta
        for (const jx of [x0 + 30, x0 + w - 110]) {
          pc.peca(P((p) => p.rect(jx, base - h + 50, 80, 80)), T('vidro'), { sombra: 0, espessura: 2.5 });
          pc.linha(P((p) => { p.moveTo(jx + 40, base - h + 50); p.lineTo(jx + 40, base - h + 130); p.moveTo(jx, base - h + 90); p.lineTo(jx + 80, base - h + 90); }), 2.5);
          pc.preencher(P((p) => { p.moveTo(jx + 8, base - h + 120); p.lineTo(jx + 30, base - h + 58); p.lineTo(jx + 40, base - h + 58); p.lineTo(jx + 18, base - h + 120); p.closePath(); }), 'rgba(255,255,255,0.6)');
        }
        pc.peca(P((p) => p.rect(x0 + w / 2 - 40, base - 150, 80, 150)), T('madeira'), { sombra: 6, espessura: 2.5 });
        pc.preencher(P((p) => p.arc(x0 + w / 2 + 25, base - 75, 6, 0, Math.PI * 2)), T('mostarda').base);
      };
      const arvore = (x0, h) => {
        pc.peca(P((p) => p.rect(x0 - 16, 1300 - h * 0.45, 32, h * 0.45)), T('tronco'), { sombra: 6, espessura: 2.5 });
        pc.peca(P((p) => { for (const [dx, dy, r] of [[0, -h * 0.7, h * 0.3], [-h * 0.2, -h * 0.55, h * 0.22], [h * 0.2, -h * 0.55, h * 0.22]]) { p.moveTo(x0 + dx + r, 1300 + dy); p.arc(x0 + dx, 1300 + dy, r, 0, Math.PI * 2); } }), T('folhagem'), { sombra: 14, espessura: 2.5 });
      };
      casa(-60, 330, 300, 'casaAreia', 130);
      arvore(345, 330);
      casa(420, 300, 260, 'casaRosa', 120);
      arvore(790, 300);
      casa(840, 340, 320, 'casaCeu', 140);
      // muretas e grama
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = T('grama').base; ctx.fillRect(0, 1290, W, 30);

      // primeiro plano: calçada e rua
      pc = Cena.pincel(ctx, 0, 0, 1);
      pc.peca(P((p) => p.rect(-10, 1310, W + 20, 200)), T('calcada'), { sombra: 0 });
      pc.linha(P((p) => { for (let xx = -(px % 160); xx < W; xx += 160) { p.moveTo(xx, 1310); p.lineTo(xx - 30, 1500); } p.moveTo(0, 1400); p.lineTo(W, 1400); }), 2.5, T('calcada').sombra);
      pc.peca(P((p) => p.rect(-10, 1500, W + 20, 26)), T('linho'), { sombra: 0 });
      pc.peca(P((p) => p.rect(-10, 1526, W + 20, 400)), T('asfalto'), { sombra: 0 });
      pc.preencher(P((p) => { for (let xx = -(px * 1.3 % 300); xx < W; xx += 300) p.rect(xx, 1720, 160, 22); }), T('linho').base);
      // poste e caixa de correio
      const postX = 140 - px;
      pc.peca(P((p) => p.rect(postX - 14, 560, 28, 960)), T('grafite'), { sombra: 6 });
      pc.peca(P((p) => { p.moveTo(postX, 580); p.quadraticCurveTo(postX + 10, 520, postX + 120, 540); p.lineTo(postX + 120, 556); p.quadraticCurveTo(postX + 20, 540, postX + 14, 590); p.closePath(); }), T('grafite'), { sombra: 0 });
      pc.peca(P((p) => p.roundRect(postX + 80, 548, 90, 36, 14)), T('linho'), { sombra: 6 });
      pc.peca(P((p) => p.rect(900 - px, 1330, 18, 150)), T('grafite'), { sombra: 0 });
      pc.peca(P((p) => p.roundRect(860 - px, 1250, 100, 90, 30)), T('turquesa'), { sombra: 10 });
      pc.linha(P((p) => { p.moveTo(875 - px, 1290); p.lineTo(945 - px, 1290); }));
    },
  };
})();

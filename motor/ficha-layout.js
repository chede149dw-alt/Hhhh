// Monta a ficha oficial de um personagem (imagem-resumo) e as imagens separadas.
// Carregado no palco (motor/palco.html) por motor/ficha.js.
(function () {
  const E = () => window.Estilo;

  function titulo(ctx, txt, x, y) {
    ctx.fillStyle = E().base.tinta;
    ctx.font = '800 44px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(txt, x, y);
    ctx.fillStyle = 'rgba(33,27,38,0.15)';
    ctx.fillRect(x, y + 16, 2400 - 2 * x, 3);
  }
  function rotulo(ctx, txt, x, y, cor) {
    ctx.fillStyle = cor || E().base.tinta;
    ctx.font = '600 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(txt, x, y);
  }

  // cabeça centralizada numa célula (recorta o corpo)
  function rosto(ctx, cfg, ex, x0, y0, cw, ch, cab, k = 0.62) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, cw, ch); ctx.clip();
    const A = window[cfg.fabrica](cfg.opcoes || {}, 'frente').alturaEmH;
    window.desenharItem(ctx, { fabrica: cfg.fabrica, opcoes: cfg.opcoes, vista: 'frente', pose: {}, expressao: ex },
      x0 + cw / 2, y0 + k * cab + A * cab, 0, cab);
    ctx.restore();
  }

  window.desenharFichaOficial = async function (cfg) {
    await document.fonts.load('800 44px Inter');
    await document.fonts.load('600 32px Inter');
    const W = 2400, H = 4320, M = 80;
    const c = document.getElementById('c');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = E().fundoFicha; ctx.fillRect(0, 0, W, H);

    // ---------- cabeçalho ----------
    ctx.fillStyle = E().base.tinta;
    ctx.textAlign = 'left';
    ctx.font = '800 130px Inter';
    ctx.fillText(cfg.titulo, M, 170);
    ctx.font = '600 34px Inter';
    ctx.fillText(cfg.subtitulo, M, 232);
    ctx.fillStyle = E().base.brasa;
    ctx.font = '800 28px Inter';
    ctx.fillText('FICHA OFICIAL · REGRA OBRIGATÓRIA EM TODOS OS VÍDEOS', M, 282);
    // paleta
    // paleta (linha própria, abaixo do subtítulo)
    cfg.paleta.forEach((p, i) => {
      const x = M + 44 + i * 300, y = 370;
      ctx.fillStyle = p.cor;
      ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = E().base.tinta; ctx.stroke();
      ctx.fillStyle = E().base.tinta; ctx.textAlign = 'left';
      ctx.font = '700 28px Inter'; ctx.fillText(p.nome, x + 58, y - 4);
      ctx.font = '600 24px Inter'; ctx.fillStyle = 'rgba(33,27,38,0.7)'; ctx.fillText(p.cor, x + 58, y + 28);
    });

    // ---------- vistas ----------
    let y = 520;
    titulo(ctx, 'VISTAS', M, y);
    const cab = 150, ySola = y + 1000;
    const A = window[cfg.fabrica](cfg.opcoes || {}, 'frente').alturaEmH;
    // linhas-guia de altura (as mesmas em todas as vistas)
    const f = (A - 1) / 4.5, Yv = (v) => (v <= 1 ? v : 1 + (v - 1) * f);
    const guias = [['cabeça', 0], ['queixo', 1], ['ombro', Yv(1.2)], ['quadril', Yv(2.75)], ['joelho', Yv(4.0)], ['sola', A]];
    ctx.save();
    ctx.setLineDash([14, 12]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(210,58,66,0.45)';
    ctx.font = '600 22px Inter'; ctx.fillStyle = 'rgba(210,58,66,0.8)'; ctx.textAlign = 'left';
    for (const [nome, v] of guias) {
      const yy = ySola - (A - v) * cab;
      ctx.beginPath(); ctx.moveTo(M + 110, yy); ctx.lineTo(W - M, yy); ctx.stroke();
      ctx.fillText(nome, M, yy + 8);
    }
    ctx.restore();
    const vistas = cfg.vistas;
    const vw = (W - M * 2 - 110) / vistas.length;
    vistas.forEach((v, i) => {
      const cx = M + 110 + vw * (i + 0.5);
      window.desenharItem(ctx, { fabrica: cfg.fabrica, opcoes: cfg.opcoes, vista: v.vista, pose: v.pose || {}, expressao: v.expressao || 'neutro', registroPoses: cfg.registroPoses },
        cx, ySola, 0, cab);
      rotulo(ctx, v.nome, cx, ySola + 70);
    });

    // ---------- expressões ----------
    y = ySola + 160;
    titulo(ctx, 'EXPRESSÕES', M, y);
    const ecw = (W - M * 2) / 4, ech = 400;
    cfg.expressoes.forEach((ex, i) => {
      const x0 = M + (i % 4) * ecw, y0 = y + 50 + Math.floor(i / 4) * (ech + 20);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.roundRect(x0 + 10, y0, ecw - 20, ech, 24); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(x0 + 10, y0, ecw - 20, ech - 60, 24); ctx.clip();
      rosto(ctx, cfg, ex.expressao, x0 + 10, y0, ecw - 20, ech - 60, 190, 0.5);
      ctx.restore();
      rotulo(ctx, ex.nome, x0 + ecw / 2, y0 + ech - 18);
    });

    // ---------- poses ----------
    y = y + 50 + 2 * (ech + 20) + 60;
    titulo(ctx, 'POSES', M, y);
    const pcw = (W - M * 2) / 3, pch = 640;
    cfg.poses.forEach((p, i) => {
      const x0 = M + (i % 3) * pcw, y0 = y + 50 + Math.floor(i / 3) * (pch + 20);
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x0 + 10, y0, pcw - 20, pch, 24);
      ctx.fillStyle = p.fundo || 'rgba(255,255,255,0.55)'; ctx.fill(); ctx.clip();
      window.desenharItem(ctx, { fabrica: cfg.fabrica, opcoes: cfg.opcoes, pose: p.pose, registroPoses: cfg.registroPoses },
        x0 + pcw / 2 + (p.dx || 0), y0 + pch - 80 - (p.subir || 0), 0, p.cabecaPx || 92);
      ctx.restore();
      rotulo(ctx, p.nome, x0 + pcw / 2, y0 + pch - 22, p.fundo ? '#F2EDE6' : undefined);
    });

    // ---------- regras ----------
    y = y + 50 + 2 * (pch + 20) + 40;
    ctx.fillStyle = E().base.tinta; ctx.textAlign = 'left'; ctx.font = '600 28px Inter';
    cfg.regras.forEach((linha, i) => ctx.fillText('•  ' + linha, M, y + i * 44));

    return c.toDataURL('image/png').split(',')[1];
  };

  // Imagens separadas
  window.desenharPecaFicha = async function (cfg, tipo, item) {
    await document.fonts.load('600 32px Inter');
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    if (tipo === 'vista') {
      c.width = 1080; c.height = 1920;
      ctx.fillStyle = E().fundoFicha; ctx.fillRect(0, 0, c.width, c.height);
      window.desenharItem(ctx, { fabrica: cfg.fabrica, opcoes: cfg.opcoes, vista: item.vista, pose: item.pose || {}, expressao: item.expressao || 'neutro', registroPoses: cfg.registroPoses },
        540, 1510, 1100);
    } else if (tipo === 'expressao') {
      c.width = 800; c.height = 800;
      ctx.fillStyle = E().fundoFicha; ctx.fillRect(0, 0, c.width, c.height);
      rosto(ctx, cfg, item.expressao, 0, 0, 800, 800, 470);
    } else {
      c.width = 1080; c.height = 1080;
      ctx.fillStyle = item.fundo || E().fundoFicha; ctx.fillRect(0, 0, c.width, c.height);
      window.desenharItem(ctx, { fabrica: cfg.fabrica, opcoes: cfg.opcoes, pose: item.pose, registroPoses: cfg.registroPoses },
        540 + (item.dx || 0) * 1.6, 1080 - 150 - (item.subir || 0) * 1.6, 0, 150);
    }
    return c.toDataURL('image/png').split(',')[1];
  };
})();

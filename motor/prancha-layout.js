// Prancha de produção de uma série: cenários, personagens, objetos e efeitos numa imagem só.
// Carregado no palco por motor/prancha.js. Configuração: ver roteiros/<serie>/prancha.json.
(function () {
  const E = () => window.Estilo;
  const W = 2400, M = 80;

  function secao(ctx, txt, y, sub) {
    ctx.fillStyle = E().base.tinta; ctx.textAlign = 'left';
    ctx.font = '800 48px Inter'; ctx.fillText(txt, M, y);
    const largura = ctx.measureText(txt).width;
    if (sub) { ctx.font = '600 28px Inter'; ctx.fillStyle = 'rgba(33,27,38,0.6)'; ctx.fillText(sub, M + largura + 30, y); }
    ctx.fillStyle = 'rgba(33,27,38,0.15)'; ctx.fillRect(M, y + 18, W - 2 * M, 3);
  }
  function rotulo(ctx, txt, x, y, o = {}) {
    ctx.fillStyle = o.cor || E().base.tinta; ctx.textAlign = 'center';
    ctx.font = o.fonte || '700 32px Inter'; ctx.fillText(txt, x, y);
  }
  function painel(ctx, x, y, w, h, cor) {
    ctx.fillStyle = cor || 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill();
  }
  function cenarioCanvas(nome, o) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
    Cena.cenario(c.getContext('2d'), nome, o || {});
    return c;
  }
  function personagemCanvas(item, w, h, cab) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    window.desenharItem(c.getContext('2d'), item, w / 2, h - 30, 0, cab);
    return c;
  }

  window.desenharPrancha = async function (cfg) {
    for (const f of ['800 48px Inter', '700 32px Inter', '600 28px Inter', '800 110px Inter']) await document.fonts.load(f);
    const c = document.getElementById('c');
    c.width = W; c.height = 6400;
    const ctx = c.getContext('2d');
    ctx.fillStyle = E().fundoFicha; ctx.fillRect(0, 0, W, c.height);

    // cabeçalho
    ctx.fillStyle = E().base.tinta; ctx.textAlign = 'left';
    let tam = 96; do { ctx.font = `800 ${tam}px Inter`; tam -= 2; } while (ctx.measureText(cfg.titulo).width > W - 2 * M && tam > 40);
    ctx.fillText(cfg.titulo, M, 150);
    ctx.font = '600 34px Inter'; ctx.fillText(cfg.subtitulo, M, 215);
    let y = 330;

    // ---------- cenários ----------
    secao(ctx, 'CENÁRIOS', y, 'pasta cenarios/');
    y += 60;
    const n = cfg.cenarios.length, gap = 40, cw = (W - 2 * M - gap * (n - 1)) / n, chh = cw * (1920 / 1080);
    cfg.cenarios.forEach((s, i) => {
      const x = M + i * (cw + gap);
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, cw, chh, 20); ctx.clip();
      ctx.drawImage(cenarioCanvas(s.nome, s.opcoes), x, y, cw, chh);
      ctx.restore();
      rotulo(ctx, s.titulo, x + cw / 2, y + chh + 50);
    });
    y += chh + 120;

    // ---------- personagens ----------
    secao(ctx, 'PERSONAGENS', y, 'pasta personagens/');
    y += 60;
    const np = cfg.personagens.length, pw = (W - 2 * M - gap * (np - 1)) / np;
    let alturaBloco = 0;
    cfg.personagens.forEach((p, i) => {
      const x = M + i * (pw + gap);
      painel(ctx, x, y, pw, p.alturaPainel || 1080);
      rotulo(ctx, p.titulo, x + pw / 2, y + 60, { fonte: '800 40px Inter' });
      rotulo(ctx, p.descricao || '', x + pw / 2, y + 100, { fonte: '600 24px Inter', cor: 'rgba(33,27,38,0.65)' });
      const vw = pw / p.poses.length;
      p.poses.forEach((pose, k) => {
        const item = { fabrica: p.fabrica, registroPoses: p.registroPoses, pose };
        window.desenharItem(ctx, item, x + vw * (k + 0.5), y + 760, 0, p.cabecaPx || 105);
      });
      // rostos
      const ew = pw / p.expressoes.length;
      p.expressoes.forEach((ex, k) => {
        const cx = x + ew * (k + 0.5), cy = y + 800;
        ctx.save(); ctx.beginPath(); ctx.roundRect(cx - ew / 2 + 10, cy, ew - 20, 230, 18); ctx.fillStyle = 'rgba(244,242,238,0.9)'; ctx.fill(); ctx.clip();
        const A = window[p.fabrica]({}, 'frente').alturaEmH, cab = 150;
        window.desenharItem(ctx, { fabrica: p.fabrica, pose: {}, expressao: ex }, cx, cy + 0.55 * cab + A * cab, 0, cab);
        ctx.restore();
      });
      alturaBloco = Math.max(alturaBloco, p.alturaPainel || 1080);
    });
    y += alturaBloco + 80;

    // ---------- objetos ----------
    secao(ctx, 'OBJETOS', y, 'pasta cenarios/objetos/');
    y += 60;
    const no = cfg.objetos.length, ow = (W - 2 * M - gap * (no - 1)) / no, oh = 520;
    cfg.objetos.forEach((o, i) => {
      const x = M + i * (ow + gap);
      painel(ctx, x, y, ow, oh);
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, ow, oh, 24); ctx.clip();
      Cena.objeto(ctx, o.nome, x + ow / 2 + (o.dx || 0), y + oh - 90, o.H || 120, o.opcoes || {});
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      rotulo(ctx, o.titulo, x + ow / 2, y + oh - 30);
    });
    y += oh + 100;

    // ---------- efeitos ----------
    for (const ef of cfg.efeitos) {
      secao(ctx, 'EFEITO · ' + ef.titulo.toUpperCase(), y, 'pasta efeitos/');
      y += 60;
      if (ef.nota) { ctx.fillStyle = E().base.brasa; ctx.font = '700 28px Inter'; ctx.textAlign = 'left'; ctx.fillText(ef.nota, M, y + 20); y += 50; }
      const ne = ef.estagios.length, ew = (W - 2 * M - 24 * (ne - 1)) / ne, eh = ew * 1.55;
      const fundo = cenarioCanvas(ef.cenario, { objetos: false });
      const cab = ef.cabecaPx || 120;
      const item = { fabrica: ef.fabrica, registroPoses: ef.registroPoses, pose: ef.pose, vista: ef.vista, expressao: ef.expressao, efeito: null };
      const fonte = personagemCanvas(item, 520, 1000, cab);
      ef.estagios.forEach((pr, i) => {
        const x = M + i * (ew + 24);
        ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, ew, eh, 20); ctx.clip();
        // recorte do cenário atrás
        const [sx, sy, sw] = ef.recorte || [240, 700, 600];
        ctx.drawImage(fundo, sx, sy, sw, sw * 1.55, x, y, ew, eh);
        // personagem + efeito, numa escala que caiba no painel
        const k = ew / sw;
        const tmp = document.createElement('canvas'); tmp.width = Math.round(520 * k); tmp.height = Math.round(1000 * k);
        tmp.getContext('2d').drawImage(fonte, 0, 0, tmp.width, tmp.height);
        window.Efeitos[ef.efeito](ctx, tmp, x + ew / 2 - tmp.width / 2, y + eh - tmp.height - (ef.subir || 20) * k, pr, { t: i * 0.37, celula: Math.max(5, Math.round(9 * k)) });
        ctx.restore();
        rotulo(ctx, ef.rotulos ? ef.rotulos[i] : Math.round(pr * 100) + '%', x + ew / 2, y + eh + 46);
      });
      y += eh + 110;
    }

    // notas
    ctx.fillStyle = E().base.tinta; ctx.textAlign = 'left'; ctx.font = '600 28px Inter';
    (cfg.notas || []).forEach((l, i) => ctx.fillText('•  ' + l, M, y + i * 44));
    y += (cfg.notas || []).length * 44 + 60;

    // recorta a altura final
    const out = document.createElement('canvas'); out.width = W; out.height = Math.ceil(y);
    out.getContext('2d').drawImage(c, 0, 0);
    return out.toDataURL('image/png').split(',')[1];
  };
})();

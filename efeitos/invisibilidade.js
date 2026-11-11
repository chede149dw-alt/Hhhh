// Efeito "invisibilidade": o corpo se desfaz em partículas azuis, dos pés para a cabeça.
// Cores do elemento Água (guia, seção 7). Partículas chapadas (mistura normal), para funcionar
// também em cenas claras de dia; o brilho aditivo só é usado com o.fundoEscuro = true.
//
// Uso: Efeitos.invisibilidade(ctx, fonte, x0, y0, progresso, { t, celula, fundoEscuro })
//   fonte: canvas com o personagem desenhado (fundo transparente), colocado em (x0, y0) no ctx
//   progresso: 0 = visível ... 1 = invisível (sobra só um contorno translúcido)
//   t: tempo em segundos (faz as partículas tremularem); celula: tamanho do "grão" em px (padrão 10)
//   focos: [[x, y], ...] faz o sumiço começar nesses pontos (ex.: nas mãos); raioFocos: alcance em px
(function () {
  const COR = { nucleo: '#FFFDF2', miolo: '#D6ECFF', principal: '#5B8EF0', aura: '#2B3FB0' };
  const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  function losango(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.7, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.7, y); ctx.closePath(); ctx.fill(); }
  function estrela(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.25 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }

  function tingir(fonte, cor) {
    const c = document.createElement('canvas'); c.width = fonte.width; c.height = fonte.height;
    const g = c.getContext('2d'); g.drawImage(fonte, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = cor; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // ruído suave (valor interpolado), para a dissolução avançar em manchas e não em chuvisco
  function ruido(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, 11), b = hash(xi + 1, yi, 11), c = hash(xi, yi + 1, 11), d = hash(xi + 1, yi + 1, 11);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  window.Efeitos = window.Efeitos || {};
  window.Efeitos.invisibilidade = function (ctx, fonte, x0, y0, progresso, o = {}) {
    const t = o.t || 0, cs = o.celula || 10;
    const W = fonte.width, H = fonte.height;
    if (progresso <= 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(fonte, x0, y0); ctx.restore(); return; }
    const alfa = fonte.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, W, H).data;
    const cols = Math.ceil(W / cs), rows = Math.ceil(H / cs);
    const th = progresso * 1.15 - 0.05, banda = 0.07;
    // linhas ocupadas pelo personagem (para medir de pé a cabeça)
    let topo = rows, base = 0;
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx += 3) {
      const px = Math.min(W - 1, gx * cs + cs / 2), py = Math.min(H - 1, gy * cs + cs / 2);
      if (alfa[(py * W + px) * 4 + 3] > 20) { topo = Math.min(topo, gy); base = Math.max(base, gy); }
    }
    const alt = Math.max(1, base - topo);
    const particulas = [];
    const tint = tingir(fonte, COR.principal);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        // a célula conta se qualquer um de 5 pontos dela tiver pixel do personagem
        let cheia = false;
        for (const [ax, ay] of [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]) {
          const px = Math.min(W - 1, Math.floor(gx * cs + ax * cs)), py = Math.min(H - 1, Math.floor(gy * cs + ay * cs));
          if (alfa[(py * W + px) * 4 + 3] > 10) { cheia = true; break; }
        }
        if (!cheia) continue;
        const n = hash(gx, gy);
        // ordem de sumiço: dos pés para a cabeça; ou, com o.focos (pontos em px no canvas), a partir desses pontos
        let ordem = 1 - (gy - topo) / alt;
        if (o.focos) { let d = 1e9; for (const [fx, fy] of o.focos) d = Math.min(d, Math.hypot(gx * cs - fx, gy * cs - fy)); ordem = Math.min(1, d / (o.raioFocos || H * 0.6)); }
        const v = 0.36 * ruido(gx / 5, gy / 5) + 0.14 * n + 0.5 * ordem;
        const sx = gx * cs, sy = gy * cs;
        if (v > th + banda) {
          ctx.drawImage(fonte, sx, sy, cs, cs, x0 + sx, y0 + sy, cs, cs);
        } else if (v > th) {
          // borda que está se desfazendo: corpo tingido de azul
          ctx.drawImage(fonte, sx, sy, cs, cs, x0 + sx, y0 + sy, cs, cs);
          ctx.globalAlpha = 0.75 * (1 - (v - th) / banda);
          ctx.drawImage(tint, sx, sy, cs, cs, x0 + sx, y0 + sy, cs, cs);
          ctx.globalAlpha = 1;
        } else {
          const a = (th - v) / 0.32; // idade da partícula
          if (a < 1 && hash(gx, gy, 3) < 0.55) particulas.push([x0 + sx + cs / 2, y0 + sy + cs / 2, a, n, hash(gx, gy, 7)]);
        }
      }
    }
    // fantasma: quase transparente, só um contorno azul fino tremeluzindo
    if (progresso > 0.55) {
      const g = Math.min(1, (progresso - 0.55) / 0.45);
      const borda = document.createElement('canvas'); borda.width = W + 8; borda.height = H + 8; // margem de 4 px
      const b = borda.getContext('2d');
      const e = Math.max(3, Math.round(cs * 0.45)); // espessura do contorno proporcional ao tamanho
      for (const [dx, dy] of [[-e, 0], [e, 0], [0, -e], [0, e], [-e * 0.7, -e * 0.7], [e * 0.7, e * 0.7]]) b.drawImage(tint, 4 + dx, 4 + dy);
      b.globalCompositeOperation = 'destination-out'; b.drawImage(fonte, 4, 4);
      const tremor = 0.75 + 0.25 * Math.sin(t * 7);
      ctx.globalAlpha = 0.1 * g * tremor;
      ctx.drawImage(tingir(fonte, COR.miolo), x0, y0);
      ctx.globalAlpha = 0.8 * g * tremor;
      ctx.drawImage(borda, x0 - 4, y0 - 4);
      ctx.globalAlpha = 1;
    }
    // partículas: aura, corpo, miolo
    const aditivo = !!o.fundoEscuro;
    for (const camada of ['aura', 'corpo']) {
      ctx.globalCompositeOperation = camada === 'aura' && aditivo ? 'lighter' : 'source-over';
      for (const [x, y, a, n, m] of particulas) {
        const dx = (m - 0.5) * a * 140 + Math.sin(t * 3 + n * 9) * 6 * a;
        const dy = -a * (180 + n * 220);
        const r = cs * (1.05 - a * 0.8) * (0.7 + n * 0.6);
        const X = x + dx, Yp = y + dy;
        ctx.globalAlpha = Math.max(0, 1 - a);
        if (camada === 'aura') {
          ctx.globalAlpha *= 0.28; ctx.fillStyle = COR.aura;
          ctx.beginPath(); ctx.arc(X, Yp, r * 1.9, 0, Math.PI * 2); ctx.fill();
        } else if (n > 0.9) {
          ctx.fillStyle = COR.miolo; estrela(ctx, X, Yp, r * 2.2);
          ctx.fillStyle = COR.nucleo; estrela(ctx, X, Yp, r * 1.1);
        } else {
          ctx.fillStyle = a < 0.35 ? COR.principal : COR.miolo; losango(ctx, X, Yp, r);
          if (n > 0.6) { ctx.fillStyle = COR.nucleo; losango(ctx, X, Yp, r * 0.4); }
        }
      }
    }
    ctx.restore();
  };
})();

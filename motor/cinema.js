// Pós-processamento "cinema" aplicado ao quadro inteiro (inspirado na referência referencias/videos/ref-cenario-01.mp4):
// cor quente de fim de tarde, brilho (bloom), vinheta, névoa clara e granulado.
// Uso: Cinema.aplicar(ctx, { t, quente: 0..1, bloom: 0..1, vinheta: 0..1, grao: 0..1 })
//      Cinema.desfocar(ctx, canvasOrigem, px) — desenha uma camada desfocada (profundidade de campo)
(function () {
  let grao = null, pequeno = null;
  function texturaGrao() {
    if (grao) return grao;
    grao = document.createElement('canvas'); grao.width = 256; grao.height = 256;
    const g = grao.getContext('2d'), img = g.createImageData(256, 256);
    let s = 12345;
    for (let i = 0; i < img.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = 96 + (s >>> 24) % 64; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    return grao;
  }

  window.Cinema = {
    aplicar(ctx, o = {}) {
      const c = ctx.canvas, W = c.width, H = c.height, t = o.t || 0;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // 1. bloom: cópia pequena, só os claros, desfocada, somada com "screen"
      const b = o.bloom === undefined ? 0.5 : o.bloom;
      if (b > 0) {
        if (!pequeno) { pequeno = document.createElement('canvas'); }
        pequeno.width = Math.round(W / 4); pequeno.height = Math.round(H / 4);
        const p = pequeno.getContext('2d');
        p.filter = 'brightness(1.25) contrast(2.2) saturate(1.2) blur(6px)';
        p.drawImage(c, 0, 0, pequeno.width, pequeno.height);
        ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.32 * b;
        ctx.drawImage(pequeno, 0, 0, W, H);
      }
      // 2. cor quente (luz de cima à esquerda) e sombras um pouco frias
      const q = o.quente === undefined ? 0.6 : o.quente;
      if (q > 0) {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'soft-light';
        const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
        g.addColorStop(0, `rgba(255,190,110,${0.55 * q})`);
        g.addColorStop(0.55, `rgba(255,214,170,${0.25 * q})`);
        g.addColorStop(1, `rgba(90,110,190,${0.35 * q})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // vazamento de luz no canto do sol
        ctx.globalCompositeOperation = 'screen';
        const r = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.9);
        r.addColorStop(0, `rgba(255,200,120,${0.22 * q})`); r.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
      }
      // 3. vinheta
      const v = o.vinheta === undefined ? 0.6 : o.vinheta;
      if (v > 0) {
        ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1;
        const r = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.5, H * 0.75);
        r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(1, `rgba(60,40,70,${0.55 * v})`);
        ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
      }
      // 4. granulado (muda a cada quadro)
      const gr = o.grao === undefined ? 0.5 : o.grao;
      if (gr > 0) {
        ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.12 * gr;
        const pat = ctx.createPattern(texturaGrao(), 'repeat');
        const k = Math.floor(t * 30);
        ctx.translate((k * 73) % 256, (k * 151) % 256);
        ctx.fillStyle = pat; ctx.fillRect(-256, -256, W + 512, H + 512);
      }
      ctx.restore();
    },
    // desenha uma camada inteira desfocada (profundidade de campo), barato: desfoca em 1/4 da resolução
    desfocar(ctx, origem, px, alpha = 1) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
      if (px <= 0.3) { ctx.drawImage(origem, 0, 0); ctx.restore(); return; }
      const k = 0.25, a = document.createElement('canvas'); a.width = Math.ceil(origem.width * k); a.height = Math.ceil(origem.height * k);
      const g = a.getContext('2d'); g.filter = `blur(${px * k}px)`; g.drawImage(origem, 0, 0, a.width, a.height);
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(a, 0, 0, origem.width, origem.height);
      ctx.restore();
    },
    camada(W, H) { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; },
    // desenha algo desfocado de forma barata: pinta numa camada de 1/4 da resolução, desfoca lá e amplia
    desfocado(ctx, px, desenhar) {
      const W = ctx.canvas.width, H = ctx.canvas.height, k = 0.25;
      const a = document.createElement('canvas'); a.width = Math.ceil(W * k); a.height = Math.ceil(H * k);
      const g = a.getContext('2d'); g.scale(k, k); desenhar(g);
      const b = document.createElement('canvas'); b.width = a.width; b.height = a.height;
      const h = b.getContext('2d'); h.filter = `blur(${Math.max(0.5, px * k)}px)`; h.drawImage(a, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(b, 0, 0, W, H); ctx.restore();
    },
  };
})();

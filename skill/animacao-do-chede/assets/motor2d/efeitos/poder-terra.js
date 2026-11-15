// Efeito "poder-terra" — poder oficial do Lucas (controlar o elemento terra). Guia, seção 7 (elemento Terra).
// Uso: Efeitos['poder-terra'](ctx, x, y, H, { t, semente, tamanho })
//   x, y: centro (px); H: tamanho da cabeça do personagem em px (escala); t: tempo (anima); tamanho: multiplica a esfera.
// Camadas (referência 3, a bola de lava): halo âmbar, poeira, pedras orbitando com rastro (atrás),
// esfera com placas de terra separadas por rachaduras que EMITEM luz e sombreado esférico, brilho aditivo das
// rachaduras, pedras da frente, brasas subindo e cascalho. Respeita o zoom/giro atual do contexto.
(function () {
  const C = { brilho: '#FFE2B0', rach: '#FFB347', terra: '#8B5E3C', escura: '#5A3A22', clara: '#B07A4E', pedra: '#7A7480', pedraC: '#A39CA6', pedraE: '#4E4855' };
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const cache = {};

  // textura de placas (Voronoi) com rachaduras: calculada uma vez por semente
  function textura(seed) {
    if (cache[seed]) return cache[seed];
    const N = 256, rnd = rng(seed), pts = [];
    for (let i = 0; i < 26; i++) pts.push([rnd() * N, rnd() * N, rnd()]);
    const cor = document.createElement('canvas'); cor.width = cor.height = N;
    const brilho = document.createElement('canvas'); brilho.width = brilho.height = N;
    const gc = cor.getContext('2d'), gb = brilho.getContext('2d');
    const ic = gc.createImageData(N, N), ib = gb.createImageData(N, N);
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const tons = [hex(C.escura), hex(C.terra), hex(C.clara)], ra = hex(C.rach), br = hex(C.brilho);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let d1 = 1e9, d2 = 1e9, k = 0;
      for (let i = 0; i < pts.length; i++) {
        let dx = Math.abs(x - pts[i][0]), dy = Math.abs(y - pts[i][1]); dx = Math.min(dx, N - dx); dy = Math.min(dy, N - dy);
        const d = dx * dx + dy * dy;
        if (d < d1) { d2 = d1; d1 = d; k = i; } else if (d < d2) d2 = d;
      }
      const borda = Math.sqrt(d2) - Math.sqrt(d1); // distância até a rachadura
      const o = (y * N + x) * 4;
      const v = pts[k][2], base = v < 0.35 ? tons[0] : v < 0.75 ? tons[1] : tons[2];
      const ruido = ((x * 13 + y * 7) % 11) / 11 * 14 - 7;
      if (borda < 2.2) { ic.data.set([ra[0], ra[1], ra[2], 255], o); }
      else { const e = Math.min(1, (borda - 2.2) / 10); ic.data.set([base[0] * (0.85 + 0.15 * e) + ruido, base[1] * (0.85 + 0.15 * e) + ruido, base[2] * (0.85 + 0.15 * e) + ruido, 255], o); }
      const g = Math.max(0, 1 - borda / 6);
      ib.data.set([br[0], br[1], br[2], 255 * g], o);
    }
    gc.putImageData(ic, 0, 0); gb.putImageData(ib, 0, 0);
    return (cache[seed] = { cor, brilho });
  }

  function pedra(ctx, x, y, r, giro, seed) {
    const rnd = rng(seed), n = 5 + Math.floor(rnd() * 3), pts = [];
    for (let i = 0; i < n; i++) { const a = giro + (i / n) * Math.PI * 2; const rr = r * (0.75 + rnd() * 0.35); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    g.addColorStop(0, C.pedraC); g.addColorStop(0.5, C.pedra); g.addColorStop(1, C.pedraE);
    ctx.fillStyle = g; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
    // faceta clara (topo) e aresta de luz âmbar do lado da esfera
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(x - r * 0.1, y - r * 0.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,45,60,0.5)'; ctx.lineWidth = Math.max(0.8, r * 0.08); ctx.stroke();
  }

  window.Efeitos = window.Efeitos || {};
  window.Efeitos['poder-terra'] = function (ctx, x, y, H, o = {}) {
    const t = o.t || 0;
    const R = H * 0.62 * (o.tamanho || 1) * (1 + Math.sin(t * 5) * 0.03);
    const rnd = rng(o.semente || 11);
    ctx.save();

    // 1. halo âmbar (aditivo) e poeira suave atrás
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, R * 0.5, x, y, R * 2.6);
    halo.addColorStop(0, `rgba(255,170,70,${0.42 + 0.08 * Math.sin(t * 7)})`); halo.addColorStop(0.45, 'rgba(255,140,50,0.14)'); halo.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, R * 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 8; i++) {
      const a = rnd() * Math.PI * 2 + t * 0.35, d = R * (1.1 + rnd() * 0.7), r = R * (0.5 + rnd() * 0.4);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.7;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(176,122,78,0.28)'); g.addColorStop(1, 'rgba(176,122,78,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }

    // pedras orbitando num anel inclinado, com rastro
    const pedras = [];
    for (let i = 0; i < 9; i++) {
      const a = t * 1.7 + (i / 9) * Math.PI * 2;
      pedras.push({ a, r: R * (0.13 + (i % 3) * 0.05), frente: Math.sin(a) > 0, i });
    }
    const pos = (a) => [x + Math.cos(a) * R * 1.75, y + Math.sin(a) * R * 0.48 - Math.cos(a) * R * 0.18];
    const desenhaPedra = (p) => {
      for (let k = 3; k >= 1; k--) { const [px, py] = pos(p.a - k * 0.09); ctx.globalAlpha = 0.12 * (4 - k); pedra(ctx, px, py, p.r * 0.95, p.a * 1.3 + p.i, p.i + 3); }
      ctx.globalAlpha = 1; const [px, py] = pos(p.a); pedra(ctx, px, py, p.r, p.a * 1.3 + p.i, p.i + 3);
    };
    pedras.filter((p) => !p.frente).forEach(desenhaPedra);

    // 2. esfera: textura de placas girando + sombreado esférico + borda
    const tex = textura(o.semente || 11);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    const passo = (t * 30) % 256;
    ctx.translate(x, y); ctx.rotate(0.3);
    for (const dx of [-256, 0]) ctx.drawImage(tex.cor, -R + ((passo + dx) / 256) * R * 2, -R, R * 2, R * 2);
    ctx.setTransform(ctx.getTransform().rotate(-0.3 * 180 / Math.PI).translate(-x, -y));
    const sh = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.05);
    sh.addColorStop(0, 'rgba(255,236,200,0.35)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(30,15,25,0.65)');
    ctx.fillStyle = sh; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    // brilho das rachaduras por cima (aditivo, pulsando)
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 9);
    ctx.translate(x, y); ctx.rotate(0.3);
    for (const dx of [-256, 0]) ctx.drawImage(tex.brilho, -R + ((passo + dx) / 256) * R * 2, -R, R * 2, R * 2);
    ctx.restore();
    // aro de luz (contraluz âmbar no lado de baixo/direita) e borda
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,179,71,0.5)'; ctx.lineWidth = R * 0.08;
    ctx.beginPath(); ctx.arc(x, y, R * 0.97, 0.1, Math.PI * 0.9); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(50,30,25,0.5)'; ctx.lineWidth = Math.max(1, R * 0.025);
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();

    pedras.filter((p) => p.frente).forEach(desenhaPedra);

    // 3. brasas subindo (aditivo) e cascalho caindo
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const f = (t * (0.5 + rnd() * 0.6) + rnd()) % 1, a = rnd() * Math.PI * 2, d = R * (0.6 + rnd() * 0.9);
      const px = x + Math.cos(a) * d + Math.sin(t * 3 + i) * R * 0.08, py = y + Math.sin(a) * d * 0.6 - f * R * 1.6;
      const r = R * (0.02 + rnd() * 0.025) * (1 - f);
      ctx.fillStyle = `rgba(255,${170 + Math.floor(rnd() * 60)},90,${0.9 * (1 - f)})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,150,60,${0.25 * (1 - f)})`; ctx.beginPath(); ctx.arc(px, py, r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 12; i++) {
      const f = (t * (0.6 + rnd()) + rnd()) % 1, a = rnd() * Math.PI * 2, d = R * (1.1 + rnd() * 0.8);
      ctx.globalAlpha = 1 - f;
      pedra(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7 + f * R * 0.9, R * 0.045, a, i + 50);
    }
    ctx.restore();
  };
  window.Efeitos._texturaTerra = textura;
})();

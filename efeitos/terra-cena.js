// Efeitos de cena do poder da terra (série "E se você acordasse controlando a terra?").
// Mesmas cores de efeitos/poder-terra.js (guia, seção 7, elemento Terra). Chapados: funcionam em cena clara.
//   Efeitos.terraPoeira(ctx, x, y, raio, progresso, { semente })      nuvem de poeira explodindo
//   Efeitos.terraSubindo(ctx, [x0,y0], [x1,y1], H, progresso, t)       terra subindo de um vaso e virando esfera
//   Efeitos.terraCaindo(ctx, x, y, yChao, H, progresso)                 esfera desmanchando e caindo no chão
//   Efeitos.rachadura(ctx, cam, de:[X,Z], para:[X,Z], progresso, t, o)  rachadura no chão (3D) que brilha por dentro
//   Efeitos.ondaPedras(ctx, cam, X, Z, largura, t, o)                   monte de pedras correndo (alguém pode subir nele)
//   Efeitos.colunaTerra(ctx, x, yBase, yTopo, largura, t)               coluna de terra subindo (2D, em px)
//   Efeitos.poeiraTeto(ctx, W, H, t, forca)                              poeira e pedrinhas caindo do teto
(function () {
  const C = { brilho: '#FFE2B0', rach: '#FFB347', terra: '#8B5E3C', escura: '#5A3A22', clara: '#B07A4E', pedra: '#7A7480', pedraC: '#A39CA6', pedraE: '#4E4855' };
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function pedra(ctx, x, y, r, giro, seed, cor) {
    const rnd = rng(seed), n = 5 + Math.floor(rnd() * 3), pts = [];
    for (let i = 0; i < n; i++) { const a = giro + (i / n) * Math.PI * 2; const rr = r * (0.75 + rnd() * 0.35); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    const poly = (dx, dy) => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px + dx, py + dy) : ctx.moveTo(px + dx, py + dy))); ctx.closePath(); };
    ctx.fillStyle = (cor && cor.e) || C.pedraE; poly(0, 0); ctx.fill();
    ctx.fillStyle = (cor && cor.b) || C.pedra; poly(-r * 0.12, -r * 0.12); ctx.fill();
    ctx.fillStyle = (cor && cor.c) || C.pedraC; ctx.beginPath(); ctx.moveTo(pts[0][0] - r * 0.14, pts[0][1] - r * 0.14);
    for (let i = 1; i <= Math.floor(n / 2); i++) ctx.lineTo(pts[(n - i) % n][0] - r * 0.16, pts[(n - i) % n][1] - r * 0.16);
    ctx.lineTo(x - r * 0.1, y - r * 0.1); ctx.closePath(); ctx.fill();
  }
  const TORRAO = { e: C.escura, b: C.terra, c: C.clara };

  window.Efeitos = window.Efeitos || {};
  window.Efeitos._pedra = pedra;

  window.Efeitos.terraPoeira = function (ctx, x, y, raio, p, o = {}) {
    if (p <= 0 || p >= 1) return;
    const rnd = rng(o.semente || 5);
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, v = 0.5 + rnd() * 0.7, r = raio * (0.18 + rnd() * 0.25) * (0.6 + p);
      const d = raio * v * Math.pow(p, 0.6);
      ctx.globalAlpha = (1 - p) * 0.75;
      ctx.fillStyle = i % 3 ? 'rgba(176,122,78,0.7)' : 'rgba(210,180,150,0.7)';
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.55 - p * raio * 0.2, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 10; i++) {
      const a = rnd() * Math.PI * 2, d = raio * (0.6 + rnd()) * p;
      ctx.globalAlpha = 1 - p;
      pedra(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6 - Math.sin(p * Math.PI) * raio * 0.4, raio * 0.05, a, i + 3, TORRAO);
    }
    ctx.restore();
  };

  window.Efeitos.terraSubindo = function (ctx, [x0, y0], [x1, y1], H, p, t) {
    const n = 34, rnd = rng(9);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const atraso = rnd() * 0.45, q = clamp((p - atraso) / 0.55, 0, 1);
      const sx = x0 + (rnd() - 0.5) * H * 0.5, sy = y0 + (rnd() - 0.5) * H * 0.1;
      const ang = rnd() * Math.PI * 2 + t * 3, rr = H * 0.18 * (0.4 + rnd() * 0.6);
      const ex = x1 + Math.cos(ang) * rr, ey = y1 + Math.sin(ang) * rr * 0.9;
      const e = q * q * (3 - 2 * q);
      const px = sx + (ex - sx) * e + Math.sin(t * 4 + i) * H * 0.02 * (1 - e), py = sy + (ey - sy) * e - Math.sin(e * Math.PI) * H * 0.25;
      pedra(ctx, px, py, H * (0.025 + rnd() * 0.03), t * 2 + i, i + 7, TORRAO);
    }
    if (p > 0.7) window.Efeitos['poder-terra'](ctx, x1, y1, H * 0.35 * clamp((p - 0.7) / 0.3, 0.05, 1), { t, semente: 4 });
    ctx.restore();
  };

  window.Efeitos.terraCaindo = function (ctx, x, y, yChao, H, p) {
    const rnd = rng(13);
    ctx.save();
    for (let i = 0; i < 40; i++) {
      const vx = (rnd() - 0.5) * H * 0.9, d = H * 0.25 * rnd(), a0 = rnd() * Math.PI * 2;
      const px = x + Math.cos(a0) * d + vx * p, py = Math.min(yChao, y + Math.sin(a0) * d + p * p * (yChao - y) * (1.1 + rnd() * 0.4));
      ctx.globalAlpha = py >= yChao ? 0.8 : 1;
      pedra(ctx, px, py, H * (0.02 + rnd() * 0.03), i, i + 21, TORRAO);
    }
    window.Efeitos.terraPoeira(ctx, x, yChao, H * 0.9, clamp((p - 0.55) / 0.45, 0, 0.99), { semente: 8 });
    ctx.restore();
  };

  window.Efeitos.rachadura = function (ctx, cam, de, para, p, t, o = {}) {
    if (p <= 0) return;
    const rnd = rng(o.semente || 17);
    const n = 18, pts = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, desvio = (rnd() - 0.5) * (o.zigue || 0.35) * (i > 0 && i < n ? 1 : 0);
      const X = de[0] + (para[0] - de[0]) * k + desvio, Z = de[1] + (para[1] - de[1]) * k + desvio * 0.5;
      pts.push(cam.p(X, o.y || 0.005, Z));
    }
    const m = Math.max(1, Math.floor(p * n));
    const caminho = (lista) => { ctx.beginPath(); lista.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const larg = (q) => Math.max(2, q.s * (o.largura || 0.06));
    // fenda escura, brilho âmbar e miolo claro
    caminho(pts.slice(0, m + 1)); ctx.strokeStyle = '#2A1A18'; ctx.lineWidth = larg(pts[0]) * 1.6; ctx.stroke();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(255,179,71,${0.55 + 0.25 * Math.sin(t * 12)})`; ctx.lineWidth = larg(pts[0]) * 3.2; ctx.stroke();
    ctx.strokeStyle = C.brilho; ctx.lineWidth = larg(pts[0]) * 0.6; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    // galhos
    for (let i = 3; i < m; i += 4) {
      const a = pts[i], ang = (rnd() - 0.5) * 2.4, L = a.s * (0.25 + rnd() * 0.3);
      ctx.strokeStyle = '#2A1A18'; ctx.lineWidth = larg(a) * 0.8;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + Math.cos(ang) * L, a.y + Math.sin(ang) * L * 0.4); ctx.stroke();
    }
    // pedrinhas pulando na ponta da rachadura
    const ponta = pts[m];
    if (p < 1) for (let i = 0; i < 6; i++) pedra(ctx, ponta.x + (rnd() - 0.5) * ponta.s * 0.4, ponta.y - rnd() * ponta.s * 0.3 - Math.abs(Math.sin(t * 9 + i)) * ponta.s * 0.15, ponta.s * 0.03, i, i + 31);
    ctx.restore();
  };

  window.Efeitos.ondaPedras = function (ctx, cam, X, Z, largura, t, o = {}) {
    const rnd = rng(o.semente || 23), lista = [];
    for (let i = 0; i < 46; i++) {
      const dx = (rnd() - 0.5) * largura, dz = (rnd() - 0.5) * 1.6, h = (1 - Math.abs(dx) / (largura / 2)) * (0.55 + rnd() * 0.25);
      const y = Math.max(0, h * (1 - Math.abs(dz) / 0.9)) + Math.abs(Math.sin(t * 10 + i)) * 0.04;
      lista.push({ X: X + dx, Y: y, Z: Z + dz, r: 0.09 + rnd() * 0.12, g: i + t * 3 });
    }
    lista.sort((a, b) => b.Z - a.Z);
    ctx.save();
    // poeira atrás do monte
    for (let i = 0; i < 10; i++) {
      const q = cam.p(X + (rnd() - 0.5) * largura * 1.4, 0.2 + rnd() * 0.5, Z + 0.8 + rnd() * 1.5);
      ctx.fillStyle = 'rgba(176,122,78,0.22)'; ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (0.25 + rnd() * 0.3), 0, Math.PI * 2); ctx.fill();
    }
    for (const r of lista) { const q = cam.p(r.X, r.Y, r.Z); pedra(ctx, q.x, q.y, r.r * q.s, r.g, Math.floor(r.r * 1000), r.Y < 0.2 ? TORRAO : null); }
    ctx.restore();
    return cam.p(X, 0.62, Z); // topo do monte (onde ficam os pés de quem surfa)
  };

  window.Efeitos.colunaTerra = function (ctx, x, yBase, yTopo, largura, t) {
    const rnd = rng(29), alt = yBase - yTopo;
    ctx.save();
    // corpo da coluna: torrões empilhados
    for (let i = 0; i < 60; i++) {
      const k = rnd(), y = yBase - k * alt, w = largura * (0.55 + 0.45 * (1 - k)) * 0.5;
      pedra(ctx, x + (rnd() - 0.5) * w * 2, y + Math.sin(t * 8 + i) * 3, largura * (0.09 + rnd() * 0.08), i + t, i + 41, rnd() > 0.3 ? TORRAO : null);
    }
    // borda de terra solta caindo
    for (let i = 0; i < 14; i++) {
      const f = (t * 1.5 + rnd()) % 1, side = rnd() > 0.5 ? 1 : -1;
      pedra(ctx, x + side * largura * (0.5 + f * 0.3), yTopo + f * alt, largura * 0.035, i, i + 51, TORRAO);
    }
    ctx.restore();
  };

  window.Efeitos.poeiraTeto = function (ctx, W, H, t, forca = 1) {
    const rnd = rng(37);
    ctx.save();
    for (let i = 0; i < 60 * forca; i++) {
      const x = rnd() * W, v = 400 + rnd() * 600, y = ((rnd() * H + t * v) % (H * 1.1)) - H * 0.05;
      ctx.globalAlpha = 0.5 + rnd() * 0.4;
      if (i % 5 === 0) pedra(ctx, x, y, 4 + rnd() * 6, t * 5 + i, i + 61, TORRAO);
      else { ctx.fillStyle = 'rgba(200,170,140,0.8)'; ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd() * 2.5, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  };
})();

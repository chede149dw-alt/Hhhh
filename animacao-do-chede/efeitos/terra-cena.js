// Efeitos de cena do poder da terra (série "E se você acordasse controlando a terra?").
// Mesmas cores de efeitos/poder-terra.js (guia, seção 7, elemento Terra). Chapados: funcionam em cena clara.
//   Efeitos.terraPoeira(ctx, x, y, raio, progresso, { semente })      nuvem de poeira explodindo
//   Efeitos.terraSubindo(ctx, [x0,y0], [x1,y1], H, progresso, t)       terra subindo de um vaso e virando esfera
//   Efeitos.terraCaindo(ctx, x, y, yChao, H, progresso)                 esfera desmanchando e caindo no chão
//   Efeitos.rachadura(ctx, cam, de:[X,Z], para:[X,Z], progresso, t, o)  rachadura no chão (3D) que brilha por dentro
//   Efeitos.ondaPedras(ctx, cam, X, Z, largura, t, o)                   monte de pedras correndo (alguém pode subir nele)
//   Efeitos.colunaTerra(ctx, x, yBase, yTopo, largura, t)               coluna de terra subindo (2D, em px)
//   Efeitos.poeiraTeto(ctx, W, H, t, forca)                              poeira e pedrinhas caindo do teto
//   Efeitos.impacto(ctx, cam, X, Z, progresso, t, { tamanho })           pisão: espinhos, poeira, anéis de choque (ref. 01)
//   Efeitos.ondaTerra(ctx, cam, X, Z, t, { largura, altura })            onda de terra curvada com crista e respingos (ref. 02)
//   Efeitos.erupcao(ctx, cam, X, Z, progresso, t, { raio, altura })      placas rachadas, anel incandescente, jatos de poeira (ref. 03/04)
//   Efeitos.fluxoTerra(ctx, [x0,y0], [x1,y1], t, { forca })              linhas de energia âmbar da mão até a terra (ref. vídeo 05)
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
      const q = cam.p(X, o.y || 0.005, Z); if (q.dz < 0.9) q.atras = true; // rente à câmera: o risco ficaria largo demais
      pts.push(q);
    }
    const m = Math.max(1, Math.floor(p * n));
    // pontos atrás/rente à câmera ficam de fora (viravam riscos gigantes)
    const caminho = (lista) => { ctx.beginPath(); let novo = true; lista.forEach((q) => { if (q.atras) { novo = true; return; } if (novo) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); novo = false; }); };
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
      if (q.atras) continue;
      ctx.fillStyle = 'rgba(176,122,78,0.22)'; ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (0.25 + rnd() * 0.3), 0, Math.PI * 2); ctx.fill();
    }
    for (const r of lista) { const q = cam.p(r.X, r.Y, r.Z); if (q.dz < r.r + 0.3) continue; pedra(ctx, q.x, q.y, r.r * q.s, r.g, Math.floor(r.r * 1000), r.Y < 0.2 ? TORRAO : null); }
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

  // ---------- efeitos das referências de terra ----------
  const elipseChao = (cam, X, Z, r) => { const c = cam.p(X, 0.01, Z), a = cam.p(X + r, 0.01, Z), b = cam.p(X, 0.01, Z + r); return [c.x, c.y, Math.abs(a.x - c.x), Math.max(1, Math.abs(c.y - b.y))]; };
  function anelChao(ctx, cam, X, Z, r, cor, lw, a0 = 0, a1 = Math.PI * 2) {
    const [cx, cy, rx, ry] = elipseChao(cam, X, Z, r);
    ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1); ctx.stroke();
  }
  function bolhaPoeira(ctx, x, y, r, a) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, `rgba(232,180,120,${a})`); g.addColorStop(0.7, `rgba(196,140,90,${a * 0.85})`); g.addColorStop(1, `rgba(196,140,90,0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function espinho(ctx, x, y, w, h, ang, cor) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const g = ctx.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, cor[0]); g.addColorStop(1, cor[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w * 0.1, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  window.Efeitos.impacto = function (ctx, cam, X, Z, p, t, o = {}) {
    if (p <= 0 || p >= 1) return;
    const k = o.tamanho || 1, rnd = rng(o.semente || 71), e = 1 - Math.pow(1 - p, 3);
    const c = cam.p(X, 0, Z), s = c.s * k;
    if (c.dz < 1.2 * k + 0.3) return; // rente à câmera: não desenha
    ctx.save();
    // anéis de choque brancos no chão (expandem e somem)
    for (const [r0, lw, a] of [[0.6, 0.03, 0.9], [1.1, 0.018, 0.6], [1.6, 0.012, 0.4]]) {
      ctx.globalAlpha = a * (1 - p);
      anelChao(ctx, cam, X, Z, r0 * k * (0.4 + e * 1.2), '#FFF6E8', Math.max(1.5, s * lw));
    }
    // marca rachada e incandescente no chão
    ctx.globalAlpha = 1 - p * 0.6;
    const [cx, cy, rx, ry] = elipseChao(cam, X, Z, 0.75 * k);
    ctx.fillStyle = 'rgba(58,38,30,0.55)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rnd() * 0.4;
      ctx.strokeStyle = `rgba(255,179,71,${0.8 * (1 - p)})`; ctx.lineWidth = Math.max(1.5, s * 0.012);
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * rx * 0.55, cy + Math.sin(a) * ry * 0.55); ctx.lineTo(cx + Math.cos(a + 0.2) * rx * 1.0, cy + Math.sin(a + 0.2) * ry * 1.0); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // espinhos escuros explodindo em leque (sobem rápido e afundam)
    const sobe = Math.sin(Math.min(1, p * 1.6) * Math.PI);
    const lista = [];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + rnd() * 0.3; lista.push({ a, d: 0.45 + rnd() * 0.5, h: 0.4 + rnd() * 0.7, w: 0.14 + rnd() * 0.12 }); }
    lista.sort((A, B) => Math.sin(A.a) - Math.sin(B.a));
    ctx.globalAlpha = 1;
    for (const q of lista) {
      const px = X + Math.cos(q.a) * q.d * k * (0.6 + e * 0.6), pz = Z + Math.sin(q.a) * q.d * k * 0.6;
      const b = cam.p(px, 0, pz);
      if (b.atras) continue;
      espinho(ctx, b.x, b.y, q.w * b.s * k, q.h * b.s * k * sobe, Math.cos(q.a) * 0.6, ['#3A2620', '#6A4A3A']);
    }
    // poeira em bolhas cor de areia
    for (let i = 0; i < 18; i++) {
      const a = rnd() * Math.PI * 2, d = (0.5 + rnd() * 0.9) * k * e;
      const b = cam.p(X + Math.cos(a) * d, (0.15 + rnd() * 0.5) * k * e, Z + Math.sin(a) * d * 0.5);
      if (b.atras) continue;
      bolhaPoeira(ctx, b.x, b.y, b.s * k * (0.12 + rnd() * 0.18) * (0.6 + e), 0.75 * (1 - p));
    }
    // lascas claras e escuras voando
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, v = 0.8 + rnd() * 1.4;
      const b = cam.p(X + Math.cos(a) * v * e * k, (Math.sin(e * Math.PI) * (0.6 + rnd()) ) * k, Z + Math.sin(a) * v * e * k * 0.5);
      if (b.atras) continue;
      ctx.globalAlpha = 1 - p;
      espinho(ctx, b.x, b.y, b.s * 0.04 * k, b.s * 0.12 * k, a, rnd() > 0.5 ? ['#FFF1DC', '#E8D2B8'] : ['#2E2020', '#4E3A30']);
    }
    ctx.restore();
  };

  window.Efeitos.ondaTerra = function (ctx, cam, X, Z, t, o = {}) {
    const L = o.largura || 2.2, A = o.altura || 1.3, rnd = rng(81);
    const base = cam.p(X, 0, Z), s = base.s;
    if (base.dz < 1.0) return base;
    const larg = L * s, alt = A * s;
    ctx.save();
    // marca no chão (rastro da onda)
    const [cx, cy, rx, ry] = elipseChao(cam, X, Z + 0.8, L * 0.6);
    ctx.fillStyle = 'rgba(139,94,60,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry * 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // corpo da onda: crescente que sobe e enrola para a frente (para a câmera)
    const x0 = base.x - larg / 2, x1 = base.x + larg / 2, yb = base.y;
    const ond = Math.sin(t * 6) * alt * 0.03;
    const corpo = new Path2D();
    corpo.moveTo(x0, yb);
    corpo.bezierCurveTo(x0 + larg * 0.05, yb - alt * 0.7, x0 + larg * 0.25, yb - alt * 1.05 + ond, base.x, yb - alt + ond);
    corpo.bezierCurveTo(x1 - larg * 0.25, yb - alt * 1.05 - ond, x1 - larg * 0.05, yb - alt * 0.7, x1, yb);
    corpo.closePath();
    const g = ctx.createLinearGradient(0, yb - alt, 0, yb);
    g.addColorStop(0, '#F2C98A'); g.addColorStop(0.35, '#D9A066'); g.addColorStop(1, '#8B5E3C');
    ctx.fillStyle = g; ctx.fill(corpo);
    // fluxo interno (riscos claros descendo)
    ctx.save(); ctx.clip(corpo);
    for (let i = 0; i < 14; i++) {
      const fx = x0 + rnd() * larg, f = (t * (0.8 + rnd()) + rnd()) % 1;
      ctx.strokeStyle = `rgba(255,236,200,${0.35 * (1 - f)})`; ctx.lineWidth = s * (0.02 + rnd() * 0.03);
      ctx.beginPath(); ctx.moveTo(fx, yb - alt * (1 - f * 0.5)); ctx.quadraticCurveTo(fx + s * 0.1, yb - alt * (0.6 - f * 0.4), fx - s * 0.05, yb - alt * (0.25 - f * 0.2)); ctx.stroke();
    }
    const sh = ctx.createLinearGradient(x0, 0, x1, 0); sh.addColorStop(0, 'rgba(255,240,210,0.25)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(60,30,30,0.35)');
    ctx.fillStyle = sh; ctx.fillRect(x0, yb - alt * 1.2, larg, alt * 1.2);
    ctx.restore();
    // crista: borda clara enrolando, com respingos pontudos e pedras
    ctx.strokeStyle = '#FFE7BE'; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0 + larg * 0.12, yb - alt * 0.85); ctx.bezierCurveTo(x0 + larg * 0.3, yb - alt * 1.04 + ond, x1 - larg * 0.3, yb - alt * 1.04 - ond, x1 - larg * 0.12, yb - alt * 0.85); ctx.stroke();
    for (let i = 0; i < 22; i++) {
      const fx = x0 + larg * (0.1 + rnd() * 0.8), fy = yb - alt * (0.95 + rnd() * 0.1);
      espinho(ctx, fx, fy, s * (0.04 + rnd() * 0.05), s * (0.15 + rnd() * 0.35) * (0.7 + 0.3 * Math.sin(t * 12 + i)), (rnd() - 0.5) * 1.4, ['#FFE7BE', '#D9A066']);
    }
    for (let i = 0; i < 10; i++) { const f = (t * 1.5 + rnd()) % 1; pedra(ctx, x0 + rnd() * larg, yb - alt * (1 + f * 0.6), s * 0.05, i + t, i + 91, TORRAO); }
    // respingo de poeira na base
    for (let i = 0; i < 12; i++) bolhaPoeira(ctx, x0 + rnd() * larg, yb - rnd() * s * 0.3, s * (0.15 + rnd() * 0.2), 0.55);
    ctx.restore();
    return { x: base.x, y: yb - alt * 0.98 }; // topo da crista (onde fica quem surfa)
  };

  window.Efeitos.erupcao = function (ctx, cam, X, Z, p, t, o = {}) {
    if (p <= 0) return;
    const R = o.raio || 0.7, Hm = o.altura || 2.2, rnd = rng(o.semente || 101), e = Math.min(1, p * 1.4);
    const c = cam.p(X, 0, Z), s = c.s;
    if (c.dz < R + 0.6) return;
    ctx.save();
    // anel incandescente rachado no chão
    const [cx, cy, rx, ry] = elipseChao(cam, X, Z, R * (0.6 + e * 0.4));
    ctx.fillStyle = 'rgba(50,32,28,0.6)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    // placas de pedra (meia elipse de trás, depois a da frente)
    const placas = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + rnd() * 0.2; placas.push({ a, r: 0.22 + rnd() * 0.12, h: 0.08 + rnd() * 0.12 }); }
    const placa = (q) => { const b = cam.p(X + Math.cos(q.a) * R * 0.75, 0, Z + Math.sin(q.a) * R * 0.75); pedra(ctx, b.x, b.y - q.h * b.s * e, q.r * b.s, q.a, Math.floor(q.r * 1000) + 3, { e: '#5A4038', b: '#8E7060', c: '#B89A86' }); };
    placas.filter((q) => Math.sin(q.a) < 0).forEach(placa);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,140,60,${0.9})`; ctx.lineWidth = Math.max(2, s * 0.03);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 1.02, ry * 1.02, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,226,176,0.9)'; ctx.lineWidth = Math.max(1, s * 0.01); ctx.stroke();
    // jatos verticais de poeira (fitas que afinam e somem no alto)
    for (let i = 0; i < 9; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * R * 0.5, h = Hm * (0.5 + rnd() * 0.5) * e;
      const b = cam.p(X + Math.cos(a) * d, 0, Z + Math.sin(a) * d * 0.5), w = s * (0.1 + rnd() * 0.12);
      const topo = b.y - h * s, bal = Math.sin(t * 5 + i) * w * 0.6;
      const g = ctx.createLinearGradient(0, b.y, 0, topo);
      g.addColorStop(0, 'rgba(240,210,160,0.55)'); g.addColorStop(0.6, 'rgba(200,170,120,0.3)'); g.addColorStop(1, 'rgba(200,170,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - w / 2, b.y); ctx.quadraticCurveTo(b.x - w * 0.4 + bal, (b.y + topo) / 2, b.x + bal * 1.5, topo); ctx.quadraticCurveTo(b.x + w * 0.4 + bal, (b.y + topo) / 2, b.x + w / 2, b.y); ctx.closePath(); ctx.fill();
    }
    // brasas
    for (let i = 0; i < 24; i++) {
      const f = (t * (0.6 + rnd() * 0.8) + rnd()) % 1, a = rnd() * Math.PI * 2, d = R * (0.3 + rnd() * 1.2);
      const b = cam.p(X + Math.cos(a) * d, f * Hm * 1.2 * e, Z + Math.sin(a) * d * 0.5);
      ctx.fillStyle = `rgba(255,${160 + Math.floor(rnd() * 80)},80,${(1 - f) * 0.9})`; ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(1.5, b.s * 0.012), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    placas.filter((q) => Math.sin(q.a) >= 0).forEach(placa);
    // lascas escuras voando
    for (let i = 0; i < 12; i++) {
      const f = (t * 0.9 + rnd()) % 1, a = rnd() * Math.PI * 2;
      const b = cam.p(X + Math.cos(a) * R * (0.5 + f * 1.4), Math.sin(f * Math.PI) * Hm * 0.6 * e, Z + Math.sin(a) * R * 0.5);
      ctx.globalAlpha = 1 - f; espinho(ctx, b.x, b.y, b.s * 0.05, b.s * 0.14, a + t * 4, ['#2E2020', '#5A4038']);
    }
    ctx.restore();
  };

  window.Efeitos.fluxoTerra = function (ctx, a, b, t, o = {}) {
    const forca = o.forca === undefined ? 1 : o.forca, rnd = rng(o.semente || 111);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const curva = (i - 1.5) * L * 0.22 + Math.sin(t * 2 + i) * L * 0.04;
      const c1 = [a[0] + dx * 0.3 + nx * curva, a[1] + dy * 0.3 + ny * curva], c2 = [a[0] + dx * 0.7 + nx * curva * 0.8, a[1] + dy * 0.7 + ny * curva * 0.8];
      const ponto = (u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]]; };
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], b[0], b[1]);
      ctx.strokeStyle = `rgba(255,150,60,${0.22 * forca})`; ctx.lineWidth = L * 0.035; ctx.stroke();
      ctx.strokeStyle = `rgba(255,214,150,${0.7 * forca})`; ctx.lineWidth = Math.max(1.5, L * 0.007); ctx.stroke();
      // grãos de terra brilhando viajando pela linha
      for (let k = 0; k < 5; k++) {
        const u = (t * (0.6 + i * 0.15) + k / 5 + rnd() * 0.1) % 1, [px, py] = ponto(u);
        ctx.fillStyle = `rgba(255,226,176,${0.95 * forca})`; ctx.beginPath(); ctx.arc(px, py, Math.max(2, L * 0.012), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,170,70,${0.35 * forca})`; ctx.beginPath(); ctx.arc(px, py, Math.max(5, L * 0.03), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  };
})();

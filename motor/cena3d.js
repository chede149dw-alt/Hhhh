// Câmera 3D simples (perspectiva de um ponto) para cenários com profundidade, no estilo do guia.
// Unidades do mundo em METROS: X para a direita, Y para cima, Z para dentro da tela.
//   const cam = Cena3D.camera({ x, y: alturaDoOlho, z, f: focalPx, cx, cy: linhaDoHorizonte })
//   cam.p(X, Y, Z) -> { x, y, s }  (s = px por metro naquela profundidade)
// Desenho: faces chapadas com tom conforme a direção (luz do guia, de cima à esquerda),
// contorno que afina com a distância e névoa (perspectiva atmosférica) que clareia o que está longe.
(function () {
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mistura = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); };

  function camera(o) {
    const c = { x: 0, y: 1.0, z: -4, f: 720, cx: 540, cy: 960, nevoa: '#F6DFC2', distNevoa: 45, ...o };
    // yaw (radianos): giro da câmera para os lados (positivo = vira para a direita)
    c.yaw = c.yaw || 0;
    const cy0 = Math.cos(c.yaw), sy0 = Math.sin(c.yaw);
    c.p = (X, Y, Z) => {
      const dx = X - c.x, dz0 = Z - c.z;
      const xr = dx * cy0 - dz0 * sy0, zr = dx * sy0 + dz0 * cy0;
      const dz = Math.max(0.05, zr);
      const s = c.f / dz;
      return { x: c.cx + xr * s, y: c.cy - (Y - c.y) * s, s, dz };
    };
    // quanto da névoa entra numa profundidade (0 perto ... 1 longe)
    c.fator = (Z) => Math.min(0.85, Math.max(0, 1 - Math.exp(-Math.max(0, Z - c.z) / c.distNevoa)));
    c.tom = (cor, Z) => mistura(cor, c.nevoa, c.fator(Z));
    // espessura do contorno numa profundidade (4 px a ~3 m, afinando; some ao longe)
    c.linha = (Z) => { const dz = Math.max(0.3, Z - c.z); return dz > 30 ? 0 : Math.min(6, Math.max(0.8, 12 / dz)); };
    return c;
  }

  // caminho 2D a partir de pontos 3D
  function caminho(cam, pts) {
    const p = new Path2D();
    pts.forEach(([X, Y, Z], i) => { const q = cam.p(X, Y, Z); if (i) p.lineTo(q.x, q.y); else p.moveTo(q.x, q.y); });
    p.closePath();
    return p;
  }

  // face plana: cor com névoa, contorno pela distância média
  function face(ctx, cam, pts, cor, o = {}) {
    const zm = pts.reduce((a, q) => a + q[2], 0) / pts.length;
    const p = caminho(cam, pts);
    ctx.fillStyle = o.semNevoa ? cor : cam.tom(cor, zm);
    ctx.fill(p);
    const lw = o.linha === undefined ? cam.linha(zm) : o.linha;
    if (lw > 0 && o.contorno !== false) {
      ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeStyle = cam.tom(Estilo.base.tinta, zm * 0.7);
      ctx.stroke(p);
    }
    return p;
  }

  // caixa: desenha só as faces visíveis; tons: { frente, topo, lado } (nomes ou hex)
  function caixa(ctx, cam, x0, x1, y0, y1, z0, z1, cor, o = {}) {
    const t = typeof cor === 'string' && cor[0] !== '#' ? Estilo.tom(cor) : { base: cor, sombra: Estilo.multiply(cor, '#C4B6DE'), luz: Estilo.screen(cor, '#FFF1CC', 0.18) };
    // luz de cima à esquerda: topo e lado esquerdo claros, lado direito em sombra
    if (cam.y > y1) face(ctx, cam, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], t.luz, o);
    if (cam.x > x1) face(ctx, cam, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], t.sombra, o);
    if (cam.x < x0) face(ctx, cam, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], t.luz, o);
    return face(ctx, cam, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], o.frente || t.base, o);
  }

  // sombra suave no chão (elipse projetada, desfocada), esticada para a direita como a luz do guia
  function sombraChao(ctx, cam, X, Z, larg, comp = 1) {
    const a = cam.p(X - larg / 2, 0, Z), b = cam.p(X + larg / 2 + larg * 0.6 * comp, 0, Z);
    const c = cam.p(X, 0, Z - larg * 0.3), d = cam.p(X, 0, Z + larg * 0.3);
    // gradiente radial achatado (borda suave sem filtro de desfoque, que é caro)
    const cx = (a.x + b.x) / 2, cy = (c.y + d.y) / 2, rx = Math.abs(b.x - a.x) / 2, ry = Math.max(2, Math.abs(d.y - c.y) / 2);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(40,24,40,0.34)'); g.addColorStop(0.6, 'rgba(40,24,40,0.2)'); g.addColorStop(1, 'rgba(40,24,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // personagem do Rig num ponto do chão; altura em metros
  function personagem(ctx, cam, item, X, Z, alturaM, extra = {}) {
    const q = cam.p(X, 0, Z);
    sombraChao(ctx, cam, X, Z, 0.55, 1.4);
    return window.desenharItem(ctx, { ...item, ...extra }, q.x, q.y, alturaM * q.s);
  }

  // copa de árvore estilizada (círculos com pintinhas), como billboard
  function arvore(ctx, cam, X, Z, alturaM, o = {}) {
    const base = cam.p(X, 0, Z), s = base.s;
    const folha = cam.tom(o.folha || '#9CCB4A', Z), folhaSombra = cam.tom(o.folhaSombra || '#4F8A3A', Z), tronco = cam.tom('#6B4C3B', Z);
    if (o.desfoque) { const { desfoque, ...resto } = o; window.Cinema.desfocado(ctx, desfoque, (g) => arvore(g, cam, X, Z, alturaM, resto)); return; }
    ctx.save();
    ctx.fillStyle = tronco; ctx.fillRect(base.x - 0.12 * s, base.y - alturaM * 0.55 * s, 0.24 * s, alturaM * 0.55 * s);
    const bolas = [[0, 0.78, 0.36], [-0.32, 0.62, 0.28], [0.34, 0.6, 0.3], [-0.12, 0.95, 0.26], [0.2, 0.9, 0.24]];
    for (const [dx, dy, r] of bolas) { ctx.fillStyle = folhaSombra; ctx.beginPath(); ctx.arc(base.x + (dx + 0.06) * alturaM * s, base.y - (dy - 0.04) * alturaM * s, r * alturaM * s, 0, Math.PI * 2); ctx.fill(); }
    for (const [dx, dy, r] of bolas) { ctx.fillStyle = folha; ctx.beginPath(); ctx.arc(base.x + dx * alturaM * s, base.y - dy * alturaM * s, r * alturaM * s * 0.92, 0, Math.PI * 2); ctx.fill(); }
    // pintinhas de folha
    const rnd = Cena.rng(Math.floor(X * 97 + Z * 31) >>> 0);
    ctx.fillStyle = folhaSombra;
    for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 0.42; ctx.beginPath(); ctx.ellipse(base.x + Math.cos(a) * d * alturaM * s, base.y - (0.78 + Math.sin(a) * d * 0.8) * alturaM * s, 0.018 * alturaM * s, 0.01 * alturaM * s, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  // ---------- iluminação por face (referência 2: volume com degradê, contraluz da janela) ----------
  // luz: { pos: [x,y,z] da fonte, cor: '#FFE2AA', forca: 0..1.5, alcance (m), ambiente: '#5C4E86', amb: 0..1 }
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function brilho(luz, P, n) {
    const L = sub(luz.pos, P), d = Math.hypot(...L);
    const lam = Math.max(0, dot(n, norm(L)));
    const at = 1 / (1 + Math.pow(d / (luz.alcance || 4), 2));
    return Math.min(1, (luz.amb === undefined ? 0.28 : luz.amb) + (luz.forca === undefined ? 1 : luz.forca) * lam * at);
  }
  function corPorBrilho(cor, b, luz) {
    const escuro = Estilo.multiply(cor, luz.ambiente || '#5C4E86');
    const claro = Estilo.screen(cor, luz.cor || '#FFE2AA', 0.55);
    return b < 0.5 ? mistura(escuro, cor, b * 2) : mistura(cor, claro, (b - 0.5) * 2);
  }
  function faceLuz(ctx, cam, pts, cor, luz, o = {}) {
    if (cor[0] !== '#') cor = Estilo.tom(cor).base;
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    const centro = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length, a[2] + q[2] / pts.length], [0, 0, 0]);
    if (dot(n, sub([cam.x, cam.y, cam.z], centro)) < 0) n = n.map((v) => -v); // normal virada para a câmera
    const bs = pts.map((P) => brilho(luz, P, n));
    let iMax = 0, iMin = 0; bs.forEach((b, i) => { if (b > bs[iMax]) iMax = i; if (b < bs[iMin]) iMin = i; });
    const a = cam.p(...pts[iMax]), b = cam.p(...pts[iMin]);
    const path = caminho(cam, pts);
    const zm = centro[2];
    const g = ctx.createLinearGradient(a.x, a.y, b.x === a.x && b.y === a.y ? a.x + 1 : b.x, b.y);
    g.addColorStop(0, cam.tom(corPorBrilho(cor, bs[iMax], luz), zm));
    g.addColorStop(1, cam.tom(corPorBrilho(cor, bs[iMin], luz), zm));
    ctx.fillStyle = g; ctx.fill(path);
    const lw = o.linha === undefined ? cam.linha(zm) * 0.8 : o.linha;
    if (lw > 0 && o.contorno !== false) { ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeStyle = cam.tom(Estilo.base.tinta, zm * 0.7); ctx.stroke(path); }
    return path;
  }
  // caixa com luz por face e cantos levemente realçados (aresta clara no lado da luz)
  function caixaLuz(ctx, cam, x0, x1, y0, y1, z0, z1, cor, luz, o = {}) {
    const fs = [];
    if (cam.y > y1) fs.push([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
    if (cam.y < y0) fs.push([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]);
    const cx = cam.p(0, 0, 0) && cam.x;
    if (cx > x1) fs.push([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]]);
    if (cx < x0) fs.push([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]);
    if (cam.z < z0) fs.push([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]);
    if (cam.z > z1) fs.push([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
    for (const f of fs) faceLuz(ctx, cam, f, cor, luz, o);
  }
  // sombra de contato (oclusão) no chão em volta da base de um objeto
  function sombraContato(ctx, cam, x0, x1, z0, z1, forca = 0.45) {
    const m = 0.18;
    window.Cinema.desfocado(ctx, 14, (g) => {
      g.fillStyle = `rgba(30,20,45,${forca})`;
      g.fill(caminho(cam, [[x0 - m * 0.3, 0.001, z0 - m * 0.3], [x1 + m, 0.001, z0 - m * 0.3], [x1 + m, 0.001, z1 + m], [x0 - m * 0.3, 0.001, z1 + m]]));
    });
  }
  // poeira flutuando num volume (caixa) iluminado
  function poeira(ctx, cam, vol, n, t, o = {}) {
    const rnd = Cena.rng(o.semente || 3);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const fx = rnd(), fy = rnd(), fz = rnd(), ph = rnd() * 6.28, sp = 0.03 + rnd() * 0.05;
      const X = vol[0][0] + (vol[1][0] - vol[0][0]) * fx + Math.sin(t * 0.7 + ph) * 0.05;
      const Y = vol[0][1] + (vol[1][1] - vol[0][1]) * ((fy + t * sp) % 1);
      const Z = vol[0][2] + (vol[1][2] - vol[0][2]) * fz;
      const q = cam.p(X, Y, Z), r = Math.max(0.8, q.s * (0.004 + rnd() * 0.006));
      const brilho = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + ph));
      ctx.fillStyle = `rgba(255,236,190,${(o.alpha || 0.7) * brilho})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  window.Cena3D = { camera, caminho, face, caixa, sombraChao, personagem, arvore, mistura, faceLuz, caixaLuz, sombraContato, poeira, brilho, corPorBrilho };
})();

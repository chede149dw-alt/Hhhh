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
    c.p = (X, Y, Z) => {
      const dz = Math.max(0.05, Z - c.z);
      const s = c.f / dz;
      return { x: c.cx + (X - c.x) * s, y: c.cy - (Y - c.y) * s, s, dz };
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

  window.Cena3D = { camera, caminho, face, caixa, sombraChao, personagem, arvore, mistura };
})();

// VALDOR em 3D de verdade (WebGL / three.js), com personagens 2D por cima — como nas referências 3D:
// cenário 3D (chão com textura, lajes, muros de tijolo, tochas com luz real, árvores, rochas, rio, ponte, montanhas,
// céu com lua e estrelas, grama 3D balançando, vaga-lumes) e personagens recortados 2D.
// A câmera é a mesma do motor (Cena3D.camera / api.orbita): X direita, Y cima, Z para dentro da tela, sem inclinação,
// horizonte em cam.cy e yaw para os lados. Assim cam.p() bate exatamente com o 3D e os pés ficam presos no chão.
//
// Uso (noite):  Valdor3D.desenhar(ctx, cam, { t, noite, luzes, perto })   → fundo (tudo que está além de `perto` metros)
//               ...personagens 2D...
//               Valdor3D.frente(ctx, cam, { t, noite, perto, forca })      → o que está a menos de `perto` m (desfocado) + luz
// Dia:          passar { dia: true }. `noite` vai de 0 (pôr do sol) a 1 (noite fechada).
// luzes extras: [{ x, y, z, cor: '#FFA050', forca: 1, raio: 8 }] (tochas na mão, magia, lâmina...)
(function () {
  const W = 1080, H = 1920;
  const lerp = (a, b, k) => a + (b - a) * k;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const suave = (a, b, x) => { const k = cl((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  function rng(s) { let x = (s * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function ruido(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); }
  const fbm = (x, y) => ruido(x, y) * 0.5 + ruido(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + ruido(x * 4.3 + 9.1, y * 4.3 + 7.7) * 0.2;

  // ---------------- traçado do lugar (o mesmo em todos os planos) ----------------
  const trilhaX = (z) => Math.sin(z * 0.12) * 1.4 + 0.3, trilhaW = (z) => 0.8 + Math.max(0, z) * 0.012;
  const RIO = { z0: 19, larg: 3.4 };
  const rioZ = (x) => RIO.z0 + Math.sin(x * 0.07) * 1.6;
  const PONTE = (() => { const zc = rioZ(trilhaX(RIO.z0 + 1.7)); return { z0: zc - 0.9, z1: zc + RIO.larg + 0.9 }; })();
  const naPonte = (z) => z > PONTE.z0 - 0.2 && z < PONTE.z1 + 0.2;
  const noRio = (x, z, folga = 0) => { const zr = rioZ(x); return z > zr - folga && z < zr + RIO.larg + folga; };
  const naTrilha = (x, z, folga = 0) => Math.abs(x - trilhaX(z)) < trilhaW(z) + folga;
  // área onde a ação acontece: chão plano (os pés dos personagens ficam em y = 0)
  function altura(X, Z) {
    const e = Math.max(Math.abs(X) - 10, -Z - 12, Z - 30, 0);
    let h = suave(0, 26, e) * (fbm(X * 0.025, Z * 0.025) * 16 + e * 0.12);
    const zr = rioZ(X), zc = zr + RIO.larg / 2, d = Math.abs(Z - zc), meia = RIO.larg / 2;
    h -= 0.5 * suave(meia + 0.7, meia - 0.3, d);
    return h;
  }
  // tochas em postes (fora do caminho dos personagens)
  const POSTES = [[-3.6, 7.8], [4.4, 4.2], [trilhaX(10.8) + trilhaW(10.8) + 0.6, 10.8], [trilhaX(13) - trilhaW(13) - 0.6, 13], [trilhaX(-2.5) - trilhaW(-2.5) - 0.6, -2.5],
    [trilhaX(PONTE.z0 - 0.5) - 1.25, PONTE.z0 - 0.5], [trilhaX(PONTE.z0 - 0.5) + 1.25, PONTE.z0 - 0.5], [trilhaX(27) + trilhaW(27) + 0.6, 27], [trilhaX(32) - trilhaW(32) - 0.6, 32], [trilhaX(-8) + trilhaW(-8) + 0.6, -8]];
  const ESPADAS = [[-16, 46, 26, -0.18], [24, 62, 34, 0.14], [-34, 80, 22, 0.25], [10, 98, 18, -0.08]];

  // ---------------- paleta por hora: 0 = dia, 1 = pôr do sol, 2 = noite ----------------
  const PAL = {
    ceuTopo: ['#5E9EE8', '#5A5EA8', '#141E52'], ceuHz: ['#CFE6F4', '#F2A27A', '#3A4C96'], ceuBaixo: ['#9CC4DE', '#C98A86', '#26326A'],
    nevoa: ['#BFD8E8', '#C9A0A0', '#24316A'], hemiCeu: ['#D8ECFF', '#F0B8A0', '#5C74C8'], hemiChao: ['#5A7A3A', '#5A4A50', '#141A30'],
    sol: ['#FFF2D8', '#FFB070', '#A8C0FF'],
  };
  const forcaHemi = [0.62, 0.5, 0.26], forcaSol = [4.0, 2.4, 2.0], nevoaPerto = [40, 22, 14], nevoaLonge = [260, 170, 120];
  function pal(chave, h) { const a = PAL[chave], i = Math.min(1, Math.floor(h)), k = h - i; return new THREE.Color(a[i]).lerp(new THREE.Color(a[Math.min(2, i + 1)]), k); }
  function num(arr, h) { const i = Math.min(1, Math.floor(h)), k = h - i; return lerp(arr[i], arr[Math.min(2, i + 1)], k); }
  const hex = (c) => '#' + c.getHexString();

  // ---------------- texturas desenhadas por código ----------------
  function tela(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
  function textura(c, rep) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.repeat.set(rep[0], rep[1]); return t; }
  function texGrama() {
    return tela(512, 512, (g, w, h) => {
      g.fillStyle = '#C8D6B4'; g.fillRect(0, 0, w, h);
      const r = rng(7);
      for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, R = 20 + r() * 60; g.fillStyle = `rgba(${r() < 0.5 ? '255,255,235' : '90,110,70'},${0.06 + r() * 0.08})`; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); }
      g.lineCap = 'round';
      for (let i = 0; i < 5200; i++) { const x = r() * w, y = r() * h, l = 5 + r() * 11, a = -Math.PI / 2 + (r() - 0.5) * 0.9, c = r(); g.strokeStyle = c < 0.5 ? `rgba(70,95,50,${0.25 + r() * 0.3})` : `rgba(250,255,225,${0.2 + r() * 0.3})`; g.lineWidth = 1 + r() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    });
  }
  function texPedra(base, borda, seed, juntas) {
    return tela(256, 256, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const r = rng(seed);
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.04 + r() * 0.07})`; const s = 1 + r() * 4; g.fillRect(r() * w, r() * h, s, s); }
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '20,20,30' : '255,250,240'},${0.05 + r() * 0.06})`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 40, 6 + r() * 24, r() * 3, 0, 7); g.fill(); }
      // rachaduras
      g.strokeStyle = 'rgba(20,18,26,0.35)'; g.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
      // borda escura (parece chanfro com a luz)
      const gr = 18; for (let i = 0; i < gr; i++) { g.strokeStyle = `rgba(${borda},${0.5 * (1 - i / gr) ** 2})`; g.lineWidth = 2; g.strokeRect(i, i, w - 2 * i, h - 2 * i); }
      g.strokeStyle = 'rgba(255,250,235,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(gr, gr + 2); g.lineTo(w - gr, gr + 2); g.stroke();
      if (juntas) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, h - 6, w, 6); g.fillRect(w - 6, 0, 6, h); }
    });
  }
  function texMadeira() {
    return tela(128, 512, (g, w, h) => {
      g.fillStyle = '#A07A54'; g.fillRect(0, 0, w, h);
      const r = rng(31);
      for (let i = 0; i < 70; i++) { const x = r() * w; g.strokeStyle = `rgba(${r() < 0.6 ? '60,36,20' : '230,200,160'},${0.15 + r() * 0.25})`; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y * 0.02 + i) * 4, y); g.stroke(); }
      for (let i = 0; i < 3; i++) { const x = r() * w, y = r() * h; g.fillStyle = 'rgba(50,30,16,0.5)'; g.beginPath(); g.ellipse(x, y, 6, 12, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(30,18,10,0.45)'; g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
    });
  }
  function texCasca() {
    return tela(128, 256, (g, w, h) => {
      g.fillStyle = '#8A6446'; g.fillRect(0, 0, w, h);
      const r = rng(41);
      for (let i = 0; i < 60; i++) { const x = r() * w; g.strokeStyle = `rgba(${r() < 0.7 ? '40,24,14' : '200,170,130'},${0.2 + r() * 0.3})`; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 20) g.lineTo(x + (r() - 0.5) * 6, y); g.stroke(); }
    });
  }
  function texTerra() {
    return tela(256, 256, (g, w, h) => {
      g.fillStyle = '#8C7258'; g.fillRect(0, 0, w, h);
      const r = rng(51);
      for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,30,20' : '220,200,170'},${0.08 + r() * 0.12})`; const s = 1 + r() * 3; g.beginPath(); g.arc(r() * w, r() * h, s, 0, 7); g.fill(); }
      for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(150,140,130,${0.3 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, 7); g.fill(); }
    });
  }
  function texAguaNormal() {
    // mapa de normais de ondinhas (para o reflexo da lua tremer)
    return tela(256, 256, (g, w, h) => {
      const img = g.createImageData(w, h), hf = (x, y) => Math.sin(x * 0.11 + Math.sin(y * 0.07) * 2) * 0.5 + Math.sin(y * 0.19 + x * 0.05) * 0.35 + ruido(x * 0.08, y * 0.08) * 0.6;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = hf(x + 1, y) - hf(x - 1, y), dy = hf(x, y + 1) - hf(x, y - 1), i = (y * w + x) * 4;
        img.data[i] = 128 + dx * 90; img.data[i + 1] = 128 + dy * 90; img.data[i + 2] = 255; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    });
  }
  function texBrilho(cor) {
    return tela(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, `rgba(${cor},1)`); gr.addColorStop(0.25, `rgba(${cor},0.55)`); gr.addColorStop(1, `rgba(${cor},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  }
  function texChama() {
    return tela(64, 128, (g) => {
      const gr = g.createRadialGradient(32, 92, 2, 32, 80, 60); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.25, 'rgba(255,210,110,1)'); gr.addColorStop(0.6, 'rgba(255,120,40,0.85)'); gr.addColorStop(1, 'rgba(200,40,10,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(46, 40, 60, 70, 54, 98); g.bezierCurveTo(48, 122, 16, 122, 10, 98); g.bezierCurveTo(4, 70, 18, 40, 32, 4); g.fill();
    });
  }
  function texLua() {
    return tela(512, 512, (g, w) => {
      const c = w / 2, R = 92;
      const gl = g.createRadialGradient(c, c, R * 0.8, c, c, c); gl.addColorStop(0, 'rgba(200,215,255,0.55)'); gl.addColorStop(0.35, 'rgba(160,185,255,0.18)'); gl.addColorStop(1, 'rgba(140,170,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, w);
      const gm = g.createRadialGradient(c - 25, c - 25, 10, c, c, R); gm.addColorStop(0, '#FFFFFF'); gm.addColorStop(1, '#D6DEF2'); g.fillStyle = gm; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill();
      for (const [x, y, r] of [[-30, -20, 22], [28, 10, 16], [-6, 38, 12], [40, -36, 10], [-44, 26, 9], [10, -50, 8]]) { g.fillStyle = 'rgba(150,160,190,0.45)'; g.beginPath(); g.arc(c + x, c + y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(c + x - r * 0.25, c + y - r * 0.25, r * 0.6, 0, 7); g.fill(); }
    });
  }
  function texNevoa() {
    return tela(256, 128, (g, w, h) => { g.save(); g.scale(1, h / w); const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.restore(); });
  }

  // ---------------- geometria ----------------
  // junta várias geometrias numa só (sem índice), pintando cada vértice com cor(x,y,z,nx,ny,nz)
  function juntar(lista) {
    const P = [], N = [], C = [], c = new THREE.Color();
    for (const { g, cor } of lista) {
      const gg = g.index ? g.toNonIndexed() : g; gg.computeVertexNormals();
      const p = gg.attributes.position.array, n = gg.attributes.normal.array;
      for (let i = 0; i < p.length; i += 3) { P.push(p[i], p[i + 1], p[i + 2]); N.push(n[i], n[i + 1], n[i + 2]); const k = cor(p[i], p[i + 1], p[i + 2], n[i], n[i + 1], n[i + 2]); c.set(k); C.push(c.r, c.g, c.b); }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    return out;
  }
  // amassa os vértices (mesmo deslocamento para vértices na mesma posição → sem rachar)
  function amassar(g, forca, freq = 1.7) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = (ruido(x * freq + 3.1, z * freq + y * 1.3) - 0.5) * 2 * forca; const L = Math.hypot(x, y, z) || 1; p.setXYZ(i, x + (x / L) * k, y + (y / L) * k, z + (z / L) * k); }
    return g;
  }
  const mix = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), cl(k));
  function geoArvoreRedonda(seed) {
    const r = rng(seed), lista = [], alt = 1.9 + r() * 0.6;
    const tronco = new THREE.CylinderGeometry(0.13, 0.22, alt, 7, 3); tronco.translate(0, alt / 2, 0);
    lista.push({ g: amassar(tronco, 0.03, 3), cor: (x, y) => mix('#5A3C26', '#7A5436', y / alt) });
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(), gg = new THREE.CylinderGeometry(0.04, 0.08, 0.9, 5); gg.rotateZ(0.9); gg.rotateY(a); gg.translate(Math.cos(a) * 0.25, alt - 0.3, -Math.sin(a) * 0.25); lista.push({ g: gg, cor: () => '#5E4029' }); }
    const blobs = [[0, alt + 0.75, 0, 1.15], [0.65, alt + 0.35, 0.2, 0.8], [-0.6, alt + 0.4, -0.15, 0.85], [0.1, alt + 0.3, 0.6, 0.75], [-0.15, alt + 0.45, -0.6, 0.8], [0.15, alt + 1.35, 0.05, 0.75]];
    for (const [x, y, z, R] of blobs) {
      const s = R * (0.85 + r() * 0.3), gg = amassar(new THREE.IcosahedronGeometry(s, 1), s * 0.22, 1.3); gg.translate(x, y, z);
      lista.push({ g: gg, cor: (px, py, pz, nx, ny) => { const k = cl((py - alt) / 2.2); return mix('#1F4A22', '#5FA040', k * 0.8 + Math.max(0, ny) * 0.35).lerp(new THREE.Color('#86B84E'), ny > 0.7 ? 0.25 : 0); } });
    }
    return juntar(lista);
  }
  function geoPinheiro(seed) {
    const r = rng(seed), lista = [], alt = 4.2 + r() * 1.5;
    const tronco = new THREE.CylinderGeometry(0.1, 0.18, alt * 0.35, 6); tronco.translate(0, alt * 0.175, 0); lista.push({ g: tronco, cor: () => '#4E3422' });
    for (let i = 0; i < 4; i++) { const k = i / 4, R = (1.35 - k * 0.9) * (0.9 + r() * 0.2), hh = alt * 0.38, gg = amassar(new THREE.ConeGeometry(R, hh, 8, 2), 0.08, 2.2); gg.translate(0, alt * (0.3 + k * 0.2) + hh / 2, 0); lista.push({ g: gg, cor: (x, y, z, nx, ny) => mix('#14361E', '#3E7A3A', 0.25 + Math.max(0, ny) * 0.6 + k * 0.15) }); }
    return juntar(lista);
  }
  function geoArbusto(seed) {
    const r = rng(seed), lista = [];
    for (let i = 0; i < 4; i++) { const s = 0.35 + r() * 0.3, gg = amassar(new THREE.IcosahedronGeometry(s, 1), s * 0.2); gg.translate((r() - 0.5) * 0.8, s * 0.7, (r() - 0.5) * 0.6); lista.push({ g: gg, cor: (x, y, z, nx, ny) => mix('#1E4620', '#5A9A3C', 0.2 + y * 0.6 + Math.max(0, ny) * 0.3) }); }
    return juntar(lista);
  }
  function geoRocha(seed) {
    const g = amassar(new THREE.DodecahedronGeometry(1, 1), 0.22, 1.1 + seed * 0.1); g.scale(1, 0.62, 0.9); g.translate(0, 0.25, 0);
    return juntar([{ g, cor: (x, y, z, nx, ny) => ny > 0.6 ? mix('#5E7A3C', '#7E9A4C', ruido(x * 3, z * 3)) : mix('#6E7078', '#9A9CA4', 0.3 + ny * 0.4 + ruido(x * 4, y * 4) * 0.3) }]);
  }
  // tufo de grama: 7 lâminas curvas, escura na base e clara na ponta
  function geoTufo(seed) {
    const r = rng(seed), P = [], C = [], N = [], c0 = new THREE.Color('#1F4A1C'), c1 = new THREE.Color('#9AD05A'), c = new THREE.Color();
    for (let b = 0; b < 7; b++) {
      const a = r() * Math.PI * 2, inc = 0.25 + r() * 0.5, h = 0.16 + r() * 0.26, w = 0.022 + r() * 0.014, ox = (r() - 0.5) * 0.14, oz = (r() - 0.5) * 0.14;
      const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx, seg = 3, pts = [];
      for (let s = 0; s <= seg; s++) { const k = s / seg, y = h * k, cv = inc * k * k * h, ww = w * (1 - k * 0.92); pts.push([[ox + dx * cv + px * ww, y, oz + dz * cv + pz * ww], [ox + dx * cv - px * ww, y, oz + dz * cv - pz * ww], k]); }
      for (let s = 0; s < seg; s++) {
        const [a0, b0, k0] = pts[s], [a1, b1, k1] = pts[s + 1];
        for (const [v, k] of [[a0, k0], [b0, k0], [a1, k1], [b0, k0], [b1, k1], [a1, k1]]) { P.push(...v); N.push(dx * 0.3, 0.9, dz * 0.3); c.copy(c0).lerp(c1, k * k * 0.9 + 0.1); C.push(c.r, c.g, c.b); }
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    return g;
  }
  // eixo com passo fino perto da ação e cada vez maior para longe
  function eixo(a0, a1, f0, f1, passo) {
    const v = []; for (let x = f0; x <= f1 + 1e-6; x += passo) v.push(x);
    let x = f0, d = passo; while (x > a0) { d *= 1.1; x -= d; v.unshift(Math.max(a0, x)); }
    x = v[v.length - 1]; d = passo; while (x < a1) { d *= 1.1; x += d; v.push(Math.min(a1, x)); }
    return v;
  }

  // ---------------- montagem do mundo ----------------
  let R = null;
  function montar() {
    const T = THREE, r = rng(2024);
    const canvas = document.createElement('canvas');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    const esc = 0.75; renderer.setPixelRatio(1); renderer.setSize(Math.round(W * esc), Math.round(H * esc), false);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const cena = new T.Scene(); cena.fog = new T.Fog(0x1e2a5a, 14, 120);
    const camera = new T.PerspectiveCamera(60, W / H, 0.05, 900); camera.matrixAutoUpdate = true;
    const uni = { uTempo: { value: 0 }, uNoite: { value: 1 } };
    const tex = { grama: textura(texGrama(), [150, 150]), laje: textura(texPedra('#8E8C92', '22,20,30', 3)), tijolo: textura(texPedra('#9A8676', '30,20,16', 9, true)), madeira: textura(texMadeira()), casca: textura(texCasca()), terra: textura(texTerra()) };
    const lambert = (o) => new T.MeshLambertMaterial(o);

    // céu (gradiente) que acompanha a câmera
    const ceuMat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { topo: { value: new T.Color() }, hz: { value: new T.Color() }, baixo: { value: new T.Color() } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topo; uniform vec3 hz; uniform vec3 baixo; varying vec3 vP; void main(){ float y = normalize(vP).y; vec3 c = y > 0.0 ? mix(hz, topo, pow(clamp(y*1.6,0.0,1.0),0.7)) : mix(hz, baixo, clamp(-y*6.0,0.0,1.0)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}',
    });
    const grupoCeu = new T.Group(); cena.add(grupoCeu);
    const ceu = new T.Mesh(new T.SphereGeometry(800, 32, 16), ceuMat); ceu.frustumCulled = false; ceu.renderOrder = -10; grupoCeu.add(ceu);
    // estrelas
    { const n = 1400, P = new Float32Array(n * 3), S = new Float32Array(n), F = new Float32Array(n); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, y = 0.04 + Math.pow(r(), 0.8) * 0.96, rr = Math.sqrt(1 - y * y); P.set([Math.cos(a) * rr * 700, y * 700, Math.sin(a) * rr * 700], i * 3); S[i] = 1.2 + Math.pow(r(), 3) * 4.5; F[i] = r() * 6.28; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('tam', new T.BufferAttribute(S, 1)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float tam; attribute float fase; uniform float uTempo; varying float vA; void main(){ vA = 0.6 + 0.4*sin(uTempo*2.0 + fase*3.0); gl_PointSize = tam * 0.75; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform float uNoite; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vec3(0.85,0.9,1.0), a * vA * uNoite); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; pts.renderOrder = -9; grupoCeu.add(pts); R_estrelas = m; }
    // lua
    const lua = new T.Sprite(new T.SpriteMaterial({ map: textura(texLua()), transparent: true, depthWrite: false, fog: false })); lua.scale.set(260, 260, 1); lua.renderOrder = -8; grupoCeu.add(lua);
    const sol = new T.Sprite(new T.SpriteMaterial({ map: textura(texBrilho('255,240,200')), transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending })); sol.scale.set(220, 220, 1); sol.renderOrder = -8; grupoCeu.add(sol);

    // luzes
    const hemi = new T.HemisphereLight(0xffffff, 0x223322, 1); cena.add(hemi);
    const dir = new T.DirectionalLight(0xffffff, 1); dir.castShadow = true; dir.shadow.mapSize.set(2048, 2048);
    Object.assign(dir.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 140 }); dir.shadow.camera.updateProjectionMatrix(); dir.shadow.bias = -0.0006; dir.shadow.normalBias = 0.02;
    cena.add(dir); cena.add(dir.target);
    const pontos = []; for (let i = 0; i < 9; i++) { const p = new T.PointLight(0xffa050, 0, 9, 1.6); cena.add(p); pontos.push(p); }

    // chão (grade fina perto da ação, larga longe)
    {
      const xs = eixo(-420, 420, -24, 24, 0.4), zs = eixo(-300, 520, -20, 44, 0.4), nx = xs.length, nz = zs.length;
      const P = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), U = new Float32Array(nx * nz * 2), idx = [], c = new T.Color();
      const gA = new T.Color('#3E6E2A'), gB = new T.Color('#6E9A3A'), gC = new T.Color('#2E5422'), terra = new T.Color('#7A6044'), lama = new T.Color('#4A4436');
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const X = xs[i], Z = zs[j], k = j * nx + i, h = altura(X, Z);
        P.set([X, h, -Z], k * 3); U.set([X / 4, Z / 4], k * 2);
        const v = fbm(X * 0.08, Z * 0.08), v2 = ruido(X * 0.5, Z * 0.5);
        c.copy(gA).lerp(gB, v * 0.9).lerp(gC, v2 * 0.35);
        const dt = Math.abs(X - trilhaX(Z)) - trilhaW(Z); if (Z > -40 && Z < 70 && !naPonte(Z)) c.lerp(terra, suave(1.1, 0.05, dt) * 0.85);
        const zr = rioZ(X), dr = Math.min(Math.abs(Z - zr), Math.abs(Z - zr - RIO.larg)); c.lerp(lama, suave(1.2, 0.1, dr) * 0.7);
        if (h > 6) c.lerp(new T.Color('#5A7A4A'), suave(6, 30, h) * 0.5);
        C.set([c.r, c.g, c.b], k * 3);
      }
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1; idx.push(a, b, d, b, e, d); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('color', new T.BufferAttribute(C, 3)); g.setAttribute('uv', new T.BufferAttribute(U, 2)); g.setIndex(idx); g.computeVertexNormals();
      tex.grama.repeat.set(1, 1);
      const chao = new T.Mesh(g, lambert({ map: tex.grama, vertexColors: true })); chao.receiveShadow = true; cena.add(chao);
    }
    // faixa de terra batida debaixo das lajes
    {
      const P = [], U = [], idx = []; let n = 0;
      for (let z = -40; z <= 70; z += 0.5) { const x = trilhaX(z), w = trilhaW(z) + 0.35; P.push(x - w, 0.004, -z, x + w, 0.004, -z); U.push(0, z / 2, 1.2, z / 2); if (n) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n); n++; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); g.setIndex(idx); g.computeVertexNormals();
      const m = new T.Mesh(g, lambert({ map: tex.terra, transparent: true, opacity: 0.92, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; cena.add(m);
    }
    // lajes de pedra
    {
      const lista = [];
      for (let z = -40, linha = 0; z < 70; z += 0.5, linha++) {
        if (naPonte(z) || noRio(trilhaX(z), z, 0.6)) continue;
        const x = trilhaX(z), w = trilhaW(z) * 2, partes = linha % 2 ? 2 : 3, ang = Math.atan(Math.cos(z * 0.12) * 0.168);
        let acc = 0; const cortes = []; for (let i = 0; i < partes; i++) { const k = i === partes - 1 ? 1 - acc : (1 / partes) * (0.75 + r() * 0.5); cortes.push(k); acc += k; }
        let x0 = -w / 2;
        for (const k of cortes) { const ww = k * w; if (r() > 0.06) lista.push([x + (x0 + ww / 2) * Math.cos(ang), z - (x0 + ww / 2) * Math.sin(ang), ww - 0.07, 0.44 + (r() - 0.5) * 0.04, ang + (r() - 0.5) * 0.06, 0.05 + r() * 0.03]); x0 += ww; }
      }
      const m = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), lambert({ map: tex.laje }), lista.length), o = new T.Object3D(), c = new T.Color();
      lista.forEach(([x, z, w, d, a, h], i) => { o.position.set(x, h / 2 - 0.01, -z); o.rotation.set((r() - 0.5) * 0.03, a, (r() - 0.5) * 0.03); o.scale.set(w, h, d); o.updateMatrix(); m.setMatrixAt(i, o.matrix); c.setHSL(0.6 + r() * 0.06, 0.04 + r() * 0.05, 0.62 + r() * 0.2); m.setColorAt(i, c); });
      m.receiveShadow = true; cena.add(m);
    }
    // muros de tijolo (ruínas baixas ao lado da trilha)
    {
      const tijolos = [], nucleos = [], caidos = [];
      for (const [z0, z1, lado, dist] of [[-12, -3, 1, 1.7], [-1.5, 2.5, -1, 1.9], [9.5, 16.5, -1, 2.2], [11.5, 16.8, 1, 2.3], [25.5, 36, 1, 1.8], [27, 33, -1, 2.0]]) {
        for (let z = z0; z < z1; z += 0.42) {
          if (naPonte(z) || noRio(trilhaX(z), z, 1.2)) continue;
          const v = fbm(z * 0.35 + lado * 7, dist); if (v < 0.36) continue; // brechas no muro
          const x = trilhaX(z) + lado * (trilhaW(z) + dist), ang = Math.atan(Math.cos(z * 0.12) * 0.168), fi = Math.max(1, Math.round((0.35 + v * 0.9) / 0.21 * (0.6 + 0.4 * ruido(z * 1.3, 2))));
          nucleos.push([x, z, fi * 0.21 - 0.03, ang]);
          for (let k = 0; k < fi; k++) { const off = k % 2 ? 0.21 : 0; if (k === fi - 1 && r() < 0.35) continue; tijolos.push([x - Math.sin(ang) * 0, z + off * 0.5 - 0.1, k * 0.21 + 0.1, ang + (r() - 0.5) * 0.04, 0.4 + r() * 0.03]); }
          if (r() < 0.18) caidos.push([x + lado * (0.3 + r() * 0.5), z + (r() - 0.5) * 0.5]);
        }
      }
      const o = new T.Object3D(), c = new T.Color();
      const mt = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), lambert({ map: tex.tijolo }), tijolos.length + caidos.length);
      tijolos.forEach(([x, z, y, a, l], i) => { o.position.set(x, y, -z); o.rotation.set(0, a, 0); o.scale.set(0.3, 0.19, l); o.updateMatrix(); mt.setMatrixAt(i, o.matrix); c.setHSL(0.06 + r() * 0.04, 0.12 + r() * 0.12, 0.42 + r() * 0.2); mt.setColorAt(i, c); });
      caidos.forEach(([x, z], j) => { o.position.set(x, 0.09, -z); o.rotation.set(r(), r() * 3, r() * 0.5); o.scale.set(0.3, 0.18, 0.4); o.updateMatrix(); mt.setMatrixAt(tijolos.length + j, o.matrix); c.setHSL(0.07, 0.15, 0.45); mt.setColorAt(tijolos.length + j, c); });
      mt.castShadow = mt.receiveShadow = true; cena.add(mt);
      const mn = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), lambert({ color: 0x3a3430 }), nucleos.length);
      nucleos.forEach(([x, z, h, a], i) => { o.position.set(x, h / 2, -z); o.rotation.set(0, a, 0); o.scale.set(0.22, h, 0.44); o.updateMatrix(); mn.setMatrixAt(i, o.matrix); });
      mn.castShadow = true; mn.receiveShadow = true; cena.add(mn);
    }
    // postes com tocha
    const chamas = [];
    {
      const matPoste = lambert({ map: tex.madeira, color: 0x8a6a50 }), matFerro = lambert({ color: 0x2a2a30 });
      const gPoste = new T.CylinderGeometry(0.055, 0.075, 1.75, 7), gCesto = new T.CylinderGeometry(0.13, 0.07, 0.16, 8, 1, true), gAro = new T.TorusGeometry(0.13, 0.015, 5, 12);
      const tChama = textura(texChama()), tBrilho = textura(texBrilho('255,170,80'));
      POSTES.forEach(([x, z], i) => {
        const y0 = altura(x, z), g = new T.Group(); g.position.set(x, y0, -z);
        const p = new T.Mesh(gPoste, matPoste); p.position.y = 0.875; p.castShadow = true; g.add(p);
        const c = new T.Mesh(gCesto, matFerro); c.position.y = 1.8; g.add(c);
        const a = new T.Mesh(gAro, matFerro); a.rotation.x = Math.PI / 2; a.position.y = 1.88; g.add(a);
        const ch = new T.Sprite(new T.SpriteMaterial({ map: tChama, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); ch.position.y = 2.05; ch.center.set(0.5, 0.15); g.add(ch);
        const br = new T.Sprite(new T.SpriteMaterial({ map: tBrilho, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.6 })); br.position.y = 2.05; br.scale.set(1.6, 1.6, 1); g.add(br);
        cena.add(g); chamas.push({ x, y: y0 + 2.05, z, ch, br, i });
      });
    }
    // árvores, arbustos e rochas (instanciados)
    {
      const proto = [geoArvoreRedonda(1), geoArvoreRedonda(2), geoPinheiro(3), geoPinheiro(4), geoArbusto(5)], pos = proto.map(() => []);
      const livre = (x, z, folga) => !naTrilha(x, z, folga) && !noRio(x, z, 1.5) && !(Math.abs(x) < 4.2 && z > -1.5 && z < 11.5);
      for (let i = 0; i < 2600 && pos.reduce((a, b) => a + b.length, 0) < 340; i++) {
        const ang = r() * Math.PI * 2, d = 5 + Math.pow(r(), 0.7) * 85, x = Math.cos(ang) * d * 1.1, z = 6 + Math.sin(ang) * d;
        if (!livre(x, z, 2.6)) continue;
        if (pos.some((l) => l.some(([a, b]) => Math.hypot(a - x, b - z) < 2.2))) continue;
        const tipo = d > 35 && r() < 0.6 ? 2 + Math.floor(r() * 2) : r() < 0.25 ? 4 : Math.floor(r() * 4);
        pos[tipo].push([x, z, 0.85 + r() * 0.5, r() * 6.28]);
      }
      // fileiras de árvores na beira do campo (moldura dos planos)
      for (const [x, z] of [[-5.2, 9], [-6.8, 12.5], [5.8, 11.5], [7.4, 14], [-7.5, 4], [7.8, 6.5], [-4.8, 15], [4.9, 16.2], [-8.5, -1], [8.6, 1], [-6, -6], [6.4, -4.5]]) pos[r() < 0.5 ? 0 : 1].push([x, z, 1.0 + r() * 0.3, r() * 6.28]);
      const mat = lambert({ vertexColors: true, flatShading: true }), o = new T.Object3D();
      proto.forEach((g, k) => {
        const lista = pos[k]; if (!lista.length) return;
        const m = new T.InstancedMesh(g, mat, lista.length);
        lista.forEach(([x, z, s, a], i) => { o.position.set(x, altura(x, z) - 0.05, -z); o.rotation.set(0, a, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
        m.castShadow = true; m.receiveShadow = true; cena.add(m);
      });
      const rochas = [geoRocha(1), geoRocha(2)], rp = [[], []];
      for (let i = 0; i < 900 && rp[0].length + rp[1].length < 90; i++) { const x = (r() - 0.5) * 70, z = -15 + r() * 70; if (naTrilha(x, z, 0.6) || (Math.abs(x) < 3.6 && z > 0 && z < 11)) continue; const banco = noRio(x, z, 1.4) && !noRio(x, z, -0.2); if (noRio(x, z, -0.1)) continue; if (!banco && r() < 0.6) continue; rp[i % 2].push([x, z, banco ? 0.25 + r() * 0.35 : 0.2 + r() * 0.6, r() * 6.28]); }
      for (const [x, z, s] of [[-2.6, 3.2, 0.45], [3.1, 9.2, 0.55], [-3.3, 10.4, 0.7], [2.6, 1.6, 0.35]]) rp[0].push([x, z, s, r() * 6]);
      const mr = lambert({ vertexColors: true, flatShading: true });
      rochas.forEach((g, k) => { const m = new T.InstancedMesh(g, mr, rp[k].length); rp[k].forEach(([x, z, s, a], i) => { o.position.set(x, altura(x, z) - 0.06 * s, -z); o.rotation.set(0, a, 0); o.scale.set(s * 1.2, s, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = true; m.receiveShadow = true; cena.add(m); });
    }
    // rio com reflexo da lua
    const aguaNorm = textura(texAguaNormal()); aguaNorm.colorSpace = T.NoColorSpace; aguaNorm.repeat.set(30, 2);
    const aguaMat = new T.MeshPhongMaterial({ color: 0x2a3e7a, specular: 0xcfdcff, shininess: 90, normalMap: aguaNorm, normalScale: new T.Vector2(0.6, 0.6), transparent: true, opacity: 0.94 });
    {
      const P = [], U = [], idx = []; let n = 0;
      for (let x = -200; x <= 200; x += 1) { const z = rioZ(x); P.push(x, -0.22, -(z - 0.3), x, -0.22, -(z + RIO.larg + 0.3)); U.push(x / 13, 0, x / 13, 1); if (n) idx.push(2 * n - 2, 2 * n, 2 * n - 1, 2 * n - 1, 2 * n, 2 * n + 1); n++; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); g.setIndex(idx); g.computeVertexNormals();
      const m = new T.Mesh(g, aguaMat); m.receiveShadow = true; cena.add(m);
    }
    // ponte de tábuas sobre o rio
    {
      const za = PONTE.z0, zb = PONTE.z1, xa = trilhaX(za), xb = trilhaX(zb), L = Math.hypot(xb - xa, zb - za), ang = Math.atan2(xb - xa, zb - za);
      const g = new T.Group(); g.position.set(xa, 0, -za); g.rotation.y = ang;
      const mad = lambert({ map: tex.madeira }), madE = lambert({ map: tex.madeira, color: 0x8a6e58 });
      const nt = Math.floor(L / 0.3), arco = (s) => 0.12 + 0.35 * Math.sin(Math.PI * s);
      for (let i = 0; i < nt; i++) { const s = (i + 0.5) / nt, t = new T.Mesh(new T.BoxGeometry(2.0, 0.07, 0.26), mad); t.position.set((r() - 0.5) * 0.04, arco(s), -s * L); t.rotation.set(-Math.cos(Math.PI * s) * 0.32, (r() - 0.5) * 0.04, 0); t.castShadow = t.receiveShadow = true; g.add(t); }
      for (const sd of [-1, 1]) {
        for (let i = 0; i <= 6; i++) { const s = i / 6, p = new T.Mesh(new T.BoxGeometry(0.1, 0.75, 0.1), madE); p.position.set(sd * 0.98, arco(s) + 0.3, -s * L); p.castShadow = true; g.add(p); }
        for (let i = 0; i < 12; i++) { const s0 = i / 12, s1 = (i + 1) / 12, y0 = arco(s0) + 0.66, y1 = arco(s1) + 0.66, seg = Math.hypot(L / 12, y1 - y0), c = new T.Mesh(new T.BoxGeometry(0.08, 0.07, seg + 0.02), madE); c.position.set(sd * 0.98, (y0 + y1) / 2, -(s0 + s1) / 2 * L); c.rotation.x = Math.atan2(y1 - y0, L / 12); c.castShadow = true; g.add(c); }
        const viga = new T.Mesh(new T.BoxGeometry(0.14, 0.16, L), madE); viga.position.set(sd * 0.9, 0.1, -L / 2); g.add(viga);
      }
      cena.add(g);
    }
    // espadas gigantes antigas com runas
    const runasMat = new T.MeshBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 1, fog: false });
    {
      const aco = new T.MeshPhongMaterial({ color: 0x8e9cb4, emissive: 0x2a3658, specular: 0xffffff, shininess: 60, flatShading: true }), cabo = lambert({ color: 0x4a3426 }), ouro = new T.MeshPhongMaterial({ color: 0xb08a40, shininess: 40 });
      for (const [x, z, alt, inc] of ESPADAS) {
        // espada antiga cravada no chão: ponta enterrada, guarda e cabo lá em cima, runas brilhando no meio da lâmina
        const g = new T.Group(); g.position.set(x, altura(x, z), -z); g.rotation.z = inc;
        const lb = alt * 0.07, lam = new T.BoxGeometry(lb, alt * 0.8, lb * 0.22, 1, 6, 1), p = lam.attributes.position;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -alt * 0.39) p.setX(i, 0); p.setZ(i, p.getZ(i) * (Math.abs(p.getX(i)) > lb * 0.3 ? 0.35 : 1)); }
        lam.translate(0, alt * 0.4 - alt * 0.12, 0); lam.computeVertexNormals();
        const m = new T.Mesh(lam, aco); m.castShadow = true; g.add(m);
        const fuller = new T.Mesh(new T.BoxGeometry(lb * 0.16, alt * 0.55, lb * 0.26), runasMat); fuller.position.y = alt * 0.36; g.add(fuller);
        const gd = new T.Mesh(new T.BoxGeometry(alt * 0.34, alt * 0.035, alt * 0.05), ouro); gd.position.y = alt * 0.69; g.add(gd);
        for (const sd of [-1, 1]) { const pt = new T.Mesh(new T.SphereGeometry(alt * 0.03, 8, 6), ouro); pt.position.set(sd * alt * 0.17, alt * 0.69, 0); g.add(pt); }
        const cb = new T.Mesh(new T.CylinderGeometry(alt * 0.022, alt * 0.025, alt * 0.17, 8), cabo); cb.position.y = alt * 0.79; g.add(cb);
        const pm = new T.Mesh(new T.SphereGeometry(alt * 0.04, 10, 8), ouro); pm.position.y = alt * 0.89; g.add(pm);
        cena.add(g);
      }
    }
    // montanhas ao redor e castelo
    const janelaMat = new T.MeshBasicMaterial({ color: 0xffc070, fog: false, transparent: true });
    {
      const mat = lambert({ vertexColors: true, flatShading: true });
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + r() * 0.2, d = 170 + r() * 110, hh = 50 + r() * 70, rr = 45 + r() * 50;
        const g = amassar(new T.ConeGeometry(rr, hh, 7, 4), rr * 0.08, 0.05); const geo = juntar([{ g, cor: (x, y) => (y > hh * 0.18 + ruido(x * 0.1, 3) * 8 ? '#E8EEF8' : mix('#3E4E6A', '#5A6A86', ruido(x * 0.05, y * 0.05))) }]);
        const m = new T.Mesh(geo, mat); m.position.set(Math.cos(a) * d, hh / 2 - 6, -(6 + Math.sin(a) * d)); m.rotation.y = r() * 6; cena.add(m);
      }
      const pedra = lambert({ color: 0x8c8a9a }), telhado = lambert({ color: 0x4a3a6a }), cx = -46, cz = 150, base = altura(cx, cz);
      const g = new T.Group(); g.position.set(cx, base, -cz);
      const muralha = new T.Mesh(new T.BoxGeometry(26, 9, 8), pedra); muralha.position.y = 4.5; g.add(muralha);
      for (const [x, z, hh, rr] of [[-13, 0, 18, 3], [13, 0, 18, 3], [0, -2, 28, 4], [-6, 2, 14, 2.2], [7, 2, 15, 2.4]]) {
        const t = new T.Mesh(new T.CylinderGeometry(rr, rr * 1.05, hh, 10), pedra); t.position.set(x, hh / 2, z); g.add(t);
        const tc = new T.Mesh(new T.ConeGeometry(rr * 1.3, rr * 2.4, 10), telhado); tc.position.set(x, hh + rr * 1.2, z); g.add(tc);
        for (let k = 0; k < 3; k++) { const j = new T.Mesh(new T.PlaneGeometry(0.9, 1.4), janelaMat); j.position.set(x + (k - 1) * rr * 0.5, hh * (0.45 + k * 0.15), z + rr + 0.05); g.add(j); }
      }
      cena.add(g);
    }
    // grama 3D (tufos instanciados) balançando com o vento
    const gramaMat = lambert({ vertexColors: true, side: T.DoubleSide });
    gramaMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTempo = uni.uTempo;
      sh.vertexShader = 'uniform float uTempo;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0); float bal = sin(uTempo*1.6 + wp.x*0.45 + wp.z*0.3) + 0.4*sin(uTempo*3.1 + wp.x*1.3); transformed.x += bal * 0.11 * position.y * position.y * 6.0; transformed.z += bal * 0.05 * position.y * position.y * 6.0;');
    };
    {
      const protos = [geoTufo(11), geoTufo(12), geoTufo(13)], lista = [[], [], []];
      for (let i = 0; i < 52000; i++) {
        const perto = r() < 0.7, x = perto ? (r() - 0.5) * 34 : (r() - 0.5) * 110, z = perto ? -8 + r() * 30 : -30 + r() * 90;
        if (naTrilha(x, z, 0.12) || noRio(x, z, 0.5) || naPonte(z) && Math.abs(x - trilhaX(z)) < 1.4) continue;
        const d = Math.hypot(x - 0.3, z - 6), s = (0.75 + r() * 0.75) * (1 + Math.max(0, d - 12) / 18), k = i % 3;
        if (d > 30 && r() < 0.5) continue;
        lista[k].push([x, z, s, r() * 6.28, r()]);
      }
      const o = new T.Object3D(), c = new T.Color();
      protos.forEach((g, k) => { const L = lista[k], m = new T.InstancedMesh(g, gramaMat, L.length); L.forEach(([x, z, s, a, v], i) => { o.position.set(x, altura(x, z), -z); o.rotation.set(0, a, 0); o.scale.set(s, s * (0.8 + v * 0.5), s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); c.setHSL(0.24 + v * 0.06, 0.45, 0.42 + v * 0.18); m.setColorAt(i, c.multiplyScalar(1.45)); }); m.receiveShadow = true; cena.add(m); });
    }
    // flores da lua (pontinhos claros que brilham de noite)
    const florMat = new T.MeshBasicMaterial({ color: 0xbfe4ff, transparent: true });
    {
      const L = []; for (let i = 0; i < 900; i++) { const x = (r() - 0.5) * 30, z = -4 + r() * 26; if (naTrilha(x, z, 0.2) || noRio(x, z, 0.5)) continue; L.push([x, z]); }
      const m = new T.InstancedMesh(new T.IcosahedronGeometry(0.035, 0), florMat, L.length), o = new T.Object3D();
      L.forEach(([x, z], i) => { o.position.set(x, 0.17 + r() * 0.1, -z); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); cena.add(m);
    }
    // vaga-lumes
    {
      const n = 160, P = new Float32Array(n * 3), F = new Float32Array(n); for (let i = 0; i < n; i++) { P.set([(r() - 0.5) * 26, 0.3 + r() * 2.2, -(-2 + r() * 24)], i * 3); F[i] = r() * 100; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float fase; uniform float uTempo; varying float vA; void main(){ vec3 p = position + vec3(sin(uTempo*0.5+fase)*0.6, sin(uTempo*0.8+fase*1.7)*0.3, cos(uTempo*0.45+fase*1.3)*0.6); vA = max(0.0, sin(uTempo*1.8 + fase*2.0)); vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = 26.0 * (6.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform float uNoite; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a = a*a; gl_FragColor = vec4(vec3(0.85,1.0,0.5), a * (0.25 + 0.75*vA) * uNoite); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; cena.add(pts);
    }
    // neblina baixa (placas macias andando devagar)
    const nevoas = [];
    { const tn = textura(texNevoa()); for (let i = 0; i < 22; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: tn, transparent: true, depthWrite: false, opacity: 0.12, color: 0x96aae6 })); const w = 7 + r() * 9; s.scale.set(w, w * 0.22, 1); const x = (r() - 0.5) * 40, z = 4 + r() * 40; s.position.set(x, 0.35, -z); cena.add(s); nevoas.push({ s, x, z, v: 0.15 + r() * 0.25 }); } }

    R = { renderer, canvas, cena, camera, uni, ceuMat, lua, sol, hemi, dir, pontos, chamas, nevoas, aguaMat, aguaNorm, runasMat, janelaMat, florMat, grupoCeu, esc };
  }
  let R_estrelas = null;

  // posiciona a câmera do three igual à câmera do motor (inclusive o horizonte fora do centro)
  function ajustaCamera(cam, near, far) {
    const c = R.camera, f = cam.f, cx = cam.cx || W / 2, cy = cam.cy || H / 2;
    c.position.set(cam.x, cam.y, -cam.z); c.rotation.set(0, -(cam.yaw || 0), 0, 'YXZ'); c.updateMatrixWorld(true);
    c.near = near; c.far = far;
    c.projectionMatrix.makePerspective((-cx / f) * near, ((W - cx) / f) * near, (cy / f) * near, (-(H - cy) / f) * near, near, far);
    c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  }
  const horaDe = (o) => (o.dia ? 0 : 1 + (o.noite === undefined ? 1 : o.noite));
  function dirLua(h) { const el = lerp(0.1, 0.55, suave(1.0, 1.85, h)); return new THREE.Vector3(-0.32, el, -1).normalize(); }
  function dirSol(h) { const el = lerp(0.62, 0.06, suave(0, 1.15, h)); return new THREE.Vector3(0.32, el, -1).normalize(); }

  function atualizar(cam, o) {
    const t = o.t || 0, h = horaDe(o), noite = suave(1.0, 1.9, h), T = THREE;
    R.uni.uTempo.value = t; R.uni.uNoite.value = noite;
    R.ceuMat.uniforms.topo.value.copy(pal('ceuTopo', h)); R.ceuMat.uniforms.hz.value.copy(pal('ceuHz', h)); R.ceuMat.uniforms.baixo.value.copy(pal('ceuBaixo', h));
    R.cena.fog.color.copy(pal('nevoa', h)); R.cena.fog.near = num(nevoaPerto, h); R.cena.fog.far = num(nevoaLonge, h);
    R.hemi.color.copy(pal('hemiCeu', h)); R.hemi.groundColor.copy(pal('hemiChao', h)); R.hemi.intensity = num(forcaHemi, h);
    // luz principal: sol de dia → lua de noite (troca no pôr do sol)
    const dl = dirLua(h), ds = dirSol(h), k = suave(1.25, 1.6, h), dls = new THREE.Vector3(dl.x * 0.6, Math.max(dl.y, 0.7), dl.z).normalize(), d = ds.clone().lerp(dls, k).normalize();
    R.dir.color.copy(pal('sol', h)); R.dir.intensity = num(forcaSol, h) * (1 - 0.55 * Math.sin(Math.PI * k));
    const fx = cam.x + Math.sin(cam.yaw || 0) * 9, fz = cam.z + Math.cos(cam.yaw || 0) * 9;
    R.dir.target.position.set(fx, 0, -fz); R.dir.position.set(fx + d.x * 60, d.y * 60, -fz + d.z * 60); R.dir.target.updateMatrixWorld();
    // céu, lua, sol, estrelas
    R.grupoCeu.position.set(cam.x, cam.y, -cam.z);
    R.lua.position.copy(dl).multiplyScalar(600); R.lua.material.opacity = suave(1.1, 1.6, h);
    R.sol.position.copy(ds).multiplyScalar(600); R.sol.material.opacity = 1 - suave(1.0, 1.4, h);
    // emissivos que acendem à noite
    R.runasMat.opacity = 0.25 + 0.75 * noite * (0.75 + 0.25 * Math.sin(t * 2)); R.janelaMat.opacity = 0.2 + 0.8 * noite; R.florMat.opacity = 0.15 + 0.85 * noite;
    R.aguaNorm.offset.set(t * 0.03, t * 0.015);
    R.aguaMat.color.copy(new T.Color('#4A80B8').lerp(new T.Color('#E09A88'), suave(0.5, 1, h) * (1 - suave(1.2, 1.7, h))).lerp(new T.Color('#1C2C66'), noite));
    for (const n of R.nevoas) { const x = ((n.x + t * n.v + 30) % 60 + 60) % 60 - 30; n.s.position.x = x; n.s.material.opacity = 0.05 + 0.13 * noite; n.s.material.color.set(noite > 0.5 ? 0x96aae6 : 0xf0c8b0); }
    // tochas: acendem no pôr do sol; as 9 luzes vão para as tochas mais perto do que a câmera vê + luzes extras do plano
    const acesa = suave(1.15, 1.7, h), extras = (o.luzes || []).slice(0, 4);
    const lista = R.chamas.map((c) => ({ c, d: Math.hypot(c.x - fx, c.z - fz) })).sort((a, b) => a.d - b.d);
    for (const { c } of lista) { const fl = 0.85 + 0.15 * Math.sin(t * 13 + c.i * 2) * Math.sin(t * 7.3 + c.i); c.ch.scale.set(0.34 * fl * acesa, 0.62 * (0.9 + 0.2 * Math.sin(t * 11 + c.i)) * acesa, 1); c.br.material.opacity = 0.55 * acesa * fl; c.br.visible = acesa > 0.01; c.ch.visible = acesa > 0.01; c.fl = fl; }
    let li = 0;
    for (const e of extras) { const p = R.pontos[li++]; p.position.set(e.x, e.y === undefined ? 1.6 : e.y, -e.z); p.color.set(e.cor || '#FFA050'); p.intensity = 5.5 * (e.forca === undefined ? 1 : e.forca); p.distance = e.raio || 9; }
    for (const { c } of lista) { if (li >= R.pontos.length) break; const p = R.pontos[li++]; p.position.set(c.x, c.y + 0.1, -c.z); p.color.set('#FFB066'); p.intensity = 5 * acesa * c.fl; p.distance = 10; }
    for (; li < R.pontos.length; li++) R.pontos[li].intensity = 0;
    return { h, noite, acesa, dl };
  }

  // personagens 2D dentro do 3D: cada recorte vira uma placa em pé, virada para a câmera, na profundidade dos pés.
  // A grama da frente passa na frente das pernas (teste de profundidade) e a luz (sol/lua) projeta a sombra da silhueta.
  const figPool = [];
  function figuras3d(lista, cam) {
    const T = THREE, yaw = cam.yaw || 0, co = Math.cos(yaw), si = Math.sin(yaw), f = cam.f, cx = cam.cx || W / 2, cy = cam.cy || H / 2;
    const mundo = (sx, sy, dz) => { const xr = ((sx - cx) * dz) / f, yr = ((cy - sy) * dz) / f; return new T.Vector3(cam.x + xr * co + dz * si, cam.y + yr, -(cam.z - xr * si + dz * co)); };
    lista.forEach((fg, i) => {
      let m = figPool[i];
      if (!m) {
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(12), 3)); g.setAttribute('uv', new T.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2)); g.setIndex([0, 2, 1, 1, 2, 3]);
        const vazio = new T.DataTexture(new Uint8Array(4), 1, 1); vazio.needsUpdate = true;
        const mat = new T.MeshBasicMaterial({ map: vazio, transparent: true, alphaTest: 0.35, depthWrite: false, toneMapped: false, fog: false, side: T.DoubleSide });
        m = new T.Mesh(g, mat); m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: vazio, alphaTest: 0.5, side: T.DoubleSide });
        m.frustumCulled = false; R.cena.add(m); figPool[i] = m;
      }
      const velha = m.material.map; const tex = new T.CanvasTexture(fg.canvas); tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter;
      m.material.map = tex; m.customDepthMaterial.map = tex; if (velha && velha.isCanvasTexture) velha.dispose();
      const dz = fg.dz, c = [mundo(fg.x0, fg.y0, dz), mundo(fg.x0 + fg.w, fg.y0, dz), mundo(fg.x0, fg.y0 + fg.h, dz), mundo(fg.x0 + fg.w, fg.y0 + fg.h, dz)];
      const centro = c[0].clone().add(c[3]).multiplyScalar(0.5), pos = m.geometry.attributes.position;
      c.forEach((v, k) => pos.setXYZ(k, v.x - centro.x, v.y - centro.y, v.z - centro.z)); pos.needsUpdate = true; m.geometry.computeBoundingSphere();
      m.position.copy(centro); m.castShadow = fg.sombra !== false; m.visible = true;
    });
    for (let i = lista.length; i < figPool.length; i++) figPool[i].visible = false;
    // sombra de contato (oclusão) no chão, embaixo dos pés: a grama da frente passa por cima dela
    const comPe = lista.filter((fg) => fg.X !== undefined && fg.sombra !== false);
    comPe.forEach((fg, i) => {
      let d = contatoPool[i];
      if (!d) {
        if (!texContato) texContato = textura(tela(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }));
        d = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: texContato, transparent: true, depthWrite: false, opacity: 0.55, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -4 }));
        d.renderOrder = 1; R.cena.add(d); contatoPool[i] = d;
      }
      const a = fg.alt || 1.8, y = fg.y || 0; d.position.set(fg.X, altura(fg.X, fg.Z) + (naTrilha(fg.X, fg.Z, 0.15) ? 0.09 : 0.02), -fg.Z); d.scale.set(a * 0.42, 1, a * 0.26); d.material.opacity = 0.55 / (1 + y * 2.5); d.visible = true;
    });
    for (let i = comPe.length; i < contatoPool.length; i++) contatoPool[i].visible = false;
  }
  const contatoPool = []; let texContato = null;

  // brilho das chamas por cima (bloom simples em 2D)
  function brilhos(ctx, cam, acesa, t, perto) {
    if (acesa < 0.02) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const c of R.chamas) {
      const q = cam.p(c.x, c.y, c.z); if (q.atras || q.dz < Math.max(0.5, perto) || q.x < -300 || q.x > W + 300) continue;
      const rr = Math.min(600, 1.3 * q.s) * (0.9 + 0.1 * (c.fl || 1)), a = 0.32 * acesa * Math.max(0.2, 1 - q.dz / 60);
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr); g.addColorStop(0, `rgba(255,190,110,${a})`); g.addColorStop(0.35, `rgba(255,130,50,${a * 0.35})`); g.addColorStop(1, 'rgba(255,100,30,0)');
      ctx.fillStyle = g; ctx.fillRect(q.x - rr, q.y - rr, rr * 2, rr * 2);
    }
    ctx.restore();
  }

  window.Valdor3D = {
    trilhaX, trilhaW, rioZ, RIO, PONTE, altura, 
    nevoa: (n = 1, dia = false) => hex(pal('nevoa', dia ? 0 : 1 + n)),
    // fundo: renderiza tudo que está além de `perto` metros da câmera
    desenhar(ctx, cam, o = {}) {
      if (!R) montar();
      const st = atualizar(cam, o), perto = o.perto || 0;
      figuras3d(o.figuras || [], cam);
      const foco = o.foco || 0, bokeh = o.bokeh || 0;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high';
      if (foco > Math.max(0.05, perto) + 0.5 && bokeh > 0) {
        // profundidade de campo como nas referências: o que está além do foco sai borrado, o plano dos personagens nítido
        ajustaCamera(cam, foco, 900); R.renderer.setClearColor(0x000000, 1); R.renderer.render(R.cena, R.camera);
        ctx.drawImage(R.canvas, 0, 0, W, H); ctx.filter = `blur(${bokeh}px)`; ctx.drawImage(R.canvas, 0, 0, W, H); ctx.filter = 'none';
        ajustaCamera(cam, Math.max(0.05, perto), foco); R.renderer.setClearColor(0x000000, 0); R.renderer.render(R.cena, R.camera);
        ctx.drawImage(R.canvas, 0, 0, W, H);
      } else {
        ajustaCamera(cam, Math.max(0.05, perto), 900);
        R.renderer.setClearColor(0x000000, 1); R.renderer.render(R.cena, R.camera);
        ctx.drawImage(R.canvas, 0, 0, W, H);
      }
      ctx.restore();
      brilhos(ctx, cam, st.acesa, o.t || 0, perto);
      return st;
    },
    // primeiro plano: o que está a menos de `perto` metros (grama, pedras perto da lente), desfocado, + luz da cena
    frente(ctx, cam, o = {}) {
      if (!R) montar();
      const perto = o.perto || 0, forca = o.forca === undefined ? 0.5 : o.forca, st = atualizar(cam, o);
      if (perto > 0.06 && forca > 0) {
        ajustaCamera(cam, 0.05, perto);
        R.renderer.setClearColor(0x000000, 0); R.renderer.render(R.cena, R.camera);
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${Math.round(4 + 6 * forca)}px)`; ctx.drawImage(R.canvas, 0, 0, W, H); ctx.filter = 'none'; ctx.restore();
      }
      this.luz(ctx, cam, { ...o, st });
    },
    // luz da cena: feixes de luar, tom e vinheta
    luz(ctx, cam, o = {}) {
      const st = o.st || atualizar(cam, o), t = o.t || 0, n = st.noite;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const d = st.dl, L = cam.p(cam.x + d.x * 500, cam.y + d.y * 500, cam.z - d.z * 500);
      if (!L.atras && n > 0.3) {
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 5; i++) {
          const x0 = L.x - 100 + i * 120, larg = 60 + i * 30, a = (0.045 - i * 0.006 + 0.01 * Math.sin(t * 0.6 + i * 1.3)) * n;
          const g = ctx.createLinearGradient(x0, L.y, x0 + 700, H); g.addColorStop(0, `rgba(170,195,255,${a})`); g.addColorStop(1, 'rgba(170,195,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, L.y); ctx.lineTo(x0 + larg, L.y); ctx.lineTo(x0 + larg + 760, H); ctx.lineTo(x0 + 760, H); ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      const v = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.3, W * 0.5, H * 0.5, H * 0.8);
      v.addColorStop(0, 'rgba(5,8,25,0)'); v.addColorStop(1, `rgba(5,8,25,${0.25 + 0.3 * n})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    },
  };
})();

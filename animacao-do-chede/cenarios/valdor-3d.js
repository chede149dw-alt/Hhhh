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
  function pal(chave, h) { const a = ((R && R.PAL) || PAL)[chave], i = Math.min(1, Math.floor(h)), k = h - i; return new THREE.Color(a[i]).lerp(new THREE.Color(a[Math.min(2, i + 1)]), k); }
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

  // árvore 2D como nas referências: tronco escuro com galhos em V e copa de bolas chapadas em 3 verdes (escuro atrás, limão na frente)
  function texArvore2D(seed, tipo) {
    return tela(512, 768, (g, w, h) => {
      const r = rng(seed), cx = w / 2, chao = h - 6;
      const pinta = (x, y, R, cor, n) => { g.fillStyle = cor; for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.8; g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + r() * 4, 2 + r() * 2.5, r() * 3, 0, 7); g.fill(); } };
      if (tipo === 'pinheiro') {
        g.fillStyle = '#3E2A1E'; g.fillRect(cx - 14, chao - 150, 28, 150);
        for (let i = 0; i < 4; i++) {
          const yb = chao - 110 - i * 135, L = 210 - i * 38, alt = 230;
          g.fillStyle = '#1F4426'; g.beginPath(); g.moveTo(cx, yb - alt); g.quadraticCurveTo(cx + L * 0.5, yb - alt * 0.35, cx + L, yb); g.quadraticCurveTo(cx, yb + 26, cx - L, yb); g.quadraticCurveTo(cx - L * 0.5, yb - alt * 0.35, cx, yb - alt); g.fill();
          g.fillStyle = '#2F6A33'; g.beginPath(); g.moveTo(cx, yb - alt); g.quadraticCurveTo(cx - L * 0.45, yb - alt * 0.35, cx - L * 0.92, yb - 4); g.quadraticCurveTo(cx - L * 0.3, yb + 8, cx - 6, yb + 6); g.closePath(); g.fill();
          pinta(cx - L * 0.35, yb - alt * 0.3, L * 0.35, 'rgba(20,40,20,0.35)', 8);
        }
        return;
      }
      const arbusto = tipo === 'arbusto', topo = arbusto ? chao - 60 : chao - 330, ccy = arbusto ? chao - 150 : 300, rx = arbusto ? 200 : 205, ry = arbusto ? 120 : 175;
      if (!arbusto) {
        // tronco e galhos (mais escuro do lado da sombra)
        g.fillStyle = '#4A3428'; g.beginPath(); g.moveTo(cx - 20, chao); g.lineTo(cx - 11, topo); g.lineTo(cx + 11, topo); g.lineTo(cx + 20, chao); g.closePath(); g.fill();
        g.fillStyle = '#3A281E'; g.beginPath(); g.moveTo(cx + 2, chao); g.lineTo(cx + 2, topo); g.lineTo(cx + 11, topo); g.lineTo(cx + 20, chao); g.closePath(); g.fill();
        g.strokeStyle = '#4A3428'; g.lineCap = 'round';
        for (const [dx, dy, lw] of [[-95, -150, 13], [105, -170, 12], [-25, -210, 10]]) { g.lineWidth = lw; g.beginPath(); g.moveTo(cx, topo + 40); g.lineTo(cx + dx, topo + dy); g.stroke(); }
      }
      // bolas da copa
      const bolas = [];
      const n = arbusto ? 9 : 16;
      for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()); bolas.push([cx + Math.cos(a) * d * rx * 0.78, ccy + Math.sin(a) * d * ry * 0.78, (arbusto ? 55 : 72) + r() * (arbusto ? 30 : 40)]); }
      bolas.push([cx, ccy - ry * 0.55, arbusto ? 60 : 95], [cx - rx * 0.55, ccy, arbusto ? 55 : 85], [cx + rx * 0.55, ccy + 10, arbusto ? 55 : 85]);
      const nota = (b) => -(b[1] - ccy) / ry - 0.55 * (b[0] - cx) / rx + (r() - 0.5) * 0.5;
      bolas.forEach((b) => (b[3] = nota(b))); bolas.sort((a, b) => a[3] - b[3]);
      bolas.forEach((b, i) => {
        const k = i / bolas.length, cor = k < 0.38 ? '#2C5A28' : k < 0.68 ? '#3D7B33' : (r() < 0.5 ? '#86C23E' : '#78B53A');
        g.fillStyle = cor; g.beginPath(); g.arc(b[0], b[1], b[2], 0, 7); g.fill();
        pinta(b[0], b[1], b[2], k < 0.68 ? 'rgba(15,35,15,0.35)' : 'rgba(40,80,25,0.4)', 6);
      });
      if (!arbusto) { g.strokeStyle = '#3A281E'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx, topo + 40); g.lineTo(cx - 40, topo - 60); g.moveTo(cx, topo + 40); g.lineTo(cx + 45, topo - 70); g.stroke(); }
    });
  }
  function texCirculo() {
    return tela(1024, 1024, (g, w) => {
      const c = w / 2; g.translate(c, c); g.strokeStyle = '#FFFFFF'; g.fillStyle = '#FFFFFF'; g.shadowColor = '#FFFFFF'; g.shadowBlur = 18;
      const anel = (R, lw) => { g.lineWidth = lw; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); };
      anel(480, 10); anel(450, 4); anel(330, 8); anel(300, 3); anel(170, 6);
      // runas entre os anéis
      g.font = '700 46px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const runas = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.save(); g.rotate(a); g.fillText(runas[i], 0, -392); g.restore(); }
      // hexagrama e estrela interna
      g.lineWidth = 6;
      for (const off of [0, Math.PI / 3]) { g.beginPath(); for (let i = 0; i <= 3; i++) { const a = off + (i / 3) * Math.PI * 2 - Math.PI / 2; const x = Math.cos(a) * 300, y = Math.sin(a) * 300; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 330, Math.sin(a) * 330, 26, 0, 7); g.stroke(); }
      g.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 170, Math.sin(a) * 170); g.lineTo(Math.cos(a) * 300, Math.sin(a) * 300); g.stroke(); }
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 480); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.shadowBlur = 0; g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 480, 0, 7); g.fill();
    });
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
  function geoTufo(seed, cores) {
    const r = rng(seed), P = [], C = [], N = [], c0 = new THREE.Color(cores ? cores[0] : '#1F4A1C'), c1 = new THREE.Color(cores ? cores[1] : '#9AD05A'), c = new THREE.Color();
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
  let R = null; const MUNDOS = {};
  // escolhe o mundo do plano: o.mundo ou window.MUNDO_3D ('campo' = padrão, 'canion' = Cânion Vermelho)
  function usar(o) { const m = (o && o.mundo) || window.MUNDO_3D || 'campo'; if (!MUNDOS[m]) { R = null; if (m === 'canion') montarCanion(); else if (m === 'masmorra') montarMasmorra(); else { montar(); R.figPool = []; R.contatoPool = []; } MUNDOS[m] = R; } R = MUNDOS[m]; }
  function montar() {
    const T = THREE, r = rng(2024), arvores = [];
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
      // árvores 2D em pé no 3D (como nas referências), sempre viradas para a câmera; recebem luz e fazem sombra
      const o = new T.Object3D();
      const tipos = [['redonda', 11, 6.2], ['redonda', 12, 5.6], ['redonda', 13, 6.6], ['pinheiro', 14, 8.5], ['pinheiro', 15, 9.5], ['arbusto', 16, 1.5]];
      const deTipo = [[0, 1, 2], [0, 1, 2], [3, 4], [3, 4], [5]];
      const listas = tipos.map(() => []);
      pos.forEach((l, k) => l.forEach((p, i) => { const op = deTipo[k]; listas[op[i % op.length]].push(p); }));
      tipos.forEach(([tipo, seed, alt], k) => {
        const L = listas[k]; if (!L.length) return;
        const g = new T.PlaneGeometry(alt * (512 / 768), alt); g.translate(0, alt / 2, 0);
        const nr = g.attributes.normal; for (let i = 0; i < nr.count; i++) nr.setXYZ(i, 0, 1, 0); // luz por cima: não fica escura contra a lua/sol
        const mat = lambert({ map: textura(texArvore2D(seed, tipo)), alphaTest: 0.5, side: T.DoubleSide }); mat.alphaToCoverage = true;
        const m = new T.InstancedMesh(g, mat, L.length); m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false;
        m.userData.arv = L.map(([x, z, s]) => [x, altura(x, z) - 0.05, z, s]); cena.add(m); arvores.push(m);
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

    R = { renderer, canvas, cena, camera, uni, arvores, magia: montarMagia(cena, uni), ceuMat, lua, sol, hemi, dir, pontos, chamas, nevoas, aguaMat, aguaNorm, runasMat, janelaMat, florMat, grupoCeu, esc };
  }
  let R_estrelas = null;

  // ---------------- MUNDO 3: Ruína / masmorra de pedra (Parte 4, referência do autor) ----------------
  // Salão de blocos grandes de pedra azul-acinzentada com linhas escuras entre os blocos (o fundo escuro aparece nas
  // frestas), lajes do chão soltas e quebradas, entulho com contorno, rachaduras vermelhas acesas no chão, corredores
  // escuros, tochas e um baú dourado brilhando (a única luz quente). Salão: X de -8 a 8, Z de -3 a 28, teto em y = 11.
  const MAS = { x0: -8, x1: 8, z0: -3, z1: 28, alt: 11, sacada: { x0: -8, x1: -5.4, z0: 12, z1: 18, y: 3.6 }, bau: [5.6, 7.5] };
  const PAL_MASMORRA = (() => { const t = (c) => [c, c, c]; return { ceuTopo: t('#0A0E18'), ceuHz: t('#141A28'), ceuBaixo: t('#0A0E18'), nevoa: t('#121826'), hemiCeu: t('#8A9AC8'), hemiChao: t('#2A2228'), sol: t('#A8B8E8') }; })();
  function montarMasmorra() {
    const T = THREE, r = rng(4242);
    const canvas = document.createElement('canvas');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    const esc = 0.75; renderer.setPixelRatio(1); renderer.setSize(Math.round(W * esc), Math.round(H * esc), false);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const cena = new T.Scene(); cena.fog = new T.Fog(0x121826, 12, 48);
    const camera = new T.PerspectiveCamera(60, W / H, 0.05, 900);
    const uni = { uTempo: { value: 0 }, uNoite: { value: 1 } };
    const lambert = (o) => new T.MeshLambertMaterial(o);
    const ceuMat = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: { topo: { value: new T.Color() }, hz: { value: new T.Color() }, baixo: { value: new T.Color() } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topo; uniform vec3 hz; uniform vec3 baixo; varying vec3 vP; void main(){ float y = normalize(vP).y; vec3 c = y > 0.0 ? mix(hz, topo, clamp(y,0.0,1.0)) : mix(hz, baixo, clamp(-y,0.0,1.0)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}' });
    const grupoCeu = new T.Group(); cena.add(grupoCeu); const ceu = new T.Mesh(new T.SphereGeometry(800, 16, 8), ceuMat); ceu.frustumCulled = false; grupoCeu.add(ceu);
    const lua = new T.Sprite(new T.SpriteMaterial({ transparent: true, opacity: 0 })); const sol = new T.Sprite(new T.SpriteMaterial({ transparent: true, opacity: 0 })); grupoCeu.add(lua); grupoCeu.add(sol);
    const hemi = new T.HemisphereLight(0x8a9ac8, 0x2a2228, 1); cena.add(hemi);
    const dir = new T.DirectionalLight(0xa8b8e8, 1); dir.castShadow = true; dir.shadow.mapSize.set(2048, 2048);
    Object.assign(dir.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 140 }); dir.shadow.camera.updateProjectionMatrix(); dir.shadow.bias = -0.0008; dir.shadow.normalBias = 0.03;
    cena.add(dir); cena.add(dir.target);
    const pontos = []; for (let i = 0; i < 9; i++) { const p = new T.PointLight(0xffa050, 0, 9, 1.6); cena.add(p); pontos.push(p); }
    const contorno = new T.LineBasicMaterial({ color: 0x07090f, transparent: true, opacity: 0.85 });
    const comContorno = (mesh) => { const l = new T.LineSegments(new T.EdgesGeometry(mesh.geometry, 25), contorno); mesh.add(l); return mesh; };
    const pedra = (l) => new T.Color().setHSL(0.6 + r() * 0.04, 0.07 + r() * 0.05, l + (r() - 0.5) * 0.07);
    // fundo escuro (aparece nas frestas entre blocos e lajes = as linhas escuras do estilo)
    const fundo = lambert({ color: 0x07090f });
    { const g = new T.PlaneGeometry(200, 200).rotateX(-Math.PI / 2); const m = new T.Mesh(g, fundo); m.position.y = -0.18; cena.add(m); }
    // paredes de blocos: grade de caixas com fresta, cada bloco com um tom; aberturas para corredores escuros
    const blocos = [];
    const parede = (eixo, fixo, a0, a1, lado, aberturas = []) => {
      let y = 0, linha = 0;
      while (y < MAS.alt) {
        const h = 0.62 + r() * 0.22; let a = a0 - (linha % 2) * 0.6;
        while (a < a1) {
          const l = 1.1 + r() * 1.3, c = Math.min(a + l, a1), m = (Math.max(a, a0) + c) / 2, w = c - Math.max(a, a0);
          const livre = !aberturas.some(([b0, b1, h1]) => m > b0 && m < b1 && y < h1);
          if (w > 0.2 && livre) { const inset = r() * 0.08; blocos.push(eixo === 'x' ? [fixo - lado * inset, y + h / 2, m, 0.6, h - 0.06, w - 0.06] : [m, y + h / 2, fixo - lado * inset, w - 0.06, h - 0.06, 0.6]); }
          a += l;
        }
        y += h; linha++;
      }
      // placa escura atrás (fresta)
      const pl = new T.Mesh(new T.PlaneGeometry(a1 - a0 + 2, MAS.alt + 2), fundo); pl.position.set(eixo === 'x' ? fixo + lado * 0.32 : (a0 + a1) / 2, MAS.alt / 2, -(eixo === 'x' ? (a0 + a1) / 2 : fixo + lado * 0.32)); pl.rotation.y = eixo === 'x' ? -lado * Math.PI / 2 : (lado > 0 ? Math.PI : 0); cena.add(pl);
    };
    parede('x', MAS.x0, MAS.z0, MAS.z1, -1, [[19, 23.5, 4.2]]);
    parede('x', MAS.x1, MAS.z0, MAS.z1, 1, [[9, 11.5, 3.2]]);
    parede('z', MAS.z1, MAS.x0, MAS.x1, 1, [[-1.6, 1.6, 3.8]]);
    parede('z', MAS.z0, MAS.x0, MAS.x1, -1, [[-1.5, 1.5, 3.6]]);
    // entrada da ruína: luz forte do cânion lá fora
    { const m = new T.Mesh(new T.PlaneGeometry(6, 6), new T.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false, fog: false, side: T.DoubleSide })); m.position.set(0, 2.5, -(MAS.z0 - 2.2)); cena.add(m);
      const c = new T.Mesh(new T.BoxGeometry(3.6, 4.2, 2.5), lambert({ color: 0x3a2a24, side: T.BackSide })); c.position.set(0, 2.1, -(MAS.z0 - 1.2)); cena.add(c); }
    {
      const m = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), lambert({}), blocos.length), o = new T.Object3D();
      blocos.forEach(([x, y, z, sx, sy, sz], i) => { o.position.set(x, y, -z); o.rotation.set(0, 0, 0); o.scale.set(sx, sy, sz); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, pedra(0.3 - (y / MAS.alt) * 0.1)); });
      m.castShadow = true; m.receiveShadow = true; cena.add(m);
    }
    // corredores escuros atrás das aberturas
    for (const [x, z, w, h, d, ry] of [[0, MAS.z1 + 5, 3.2, 3.8, 10, 0], [MAS.x0 - 5, 21.25, 4.5, 4.2, 10, Math.PI / 2], [MAS.x1 + 5, 10.25, 2.5, 3.2, 10, Math.PI / 2]]) {
      const g = new T.BoxGeometry(w + 0.6, h + 0.6, d); const m = new T.Mesh(g, lambert({ color: 0x0c0f18, side: T.BackSide })); m.position.set(x, h / 2, -z); m.rotation.y = ry; cena.add(m);
    }
    // teto
    { const m = new T.Mesh(new T.PlaneGeometry(40, 50).rotateX(Math.PI / 2), lambert({ color: 0x10131c })); m.position.set(0, MAS.alt, -12); cena.add(m); }
    // lajes do chão (soltas, com fresta, algumas levantadas/quebradas perto do entulho)
    {
      const L = [];
      for (let z = MAS.z0, lin = 0; z < MAS.z1; z += 1.5, lin++) for (let x = MAS.x0 - (lin % 2) * 0.7; x < MAS.x1; x += 1.5) {
        if (r() < 0.05) continue; const jx = (r() - 0.5) * 0.12, jz = (r() - 0.5) * 0.12, quebra = r() < 0.08;
        L.push([x + 0.75 + jx, z + 0.75 + jz, 1.42 - r() * 0.08, 1.42 - r() * 0.08, (r() - 0.5) * 0.06, quebra ? (r() - 0.5) * 0.35 : (r() - 0.5) * 0.02, quebra ? 0.08 : 0]);
      }
      const m = new T.InstancedMesh(new T.BoxGeometry(1, 0.2, 1).translate(0, -0.1, 0), lambert({}), L.length), o = new T.Object3D();
      L.forEach(([x, z, w, d, ry, rx, dy], i) => { o.position.set(x, dy, -z); o.rotation.set(rx, ry, rx * 0.5); o.scale.set(w, 1, d); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, new T.Color().setHSL(0.07 + r() * 0.5 * 0.1, 0.08 + r() * 0.06, 0.2 + r() * 0.07)); });
      m.receiveShadow = true; m.castShadow = false; cena.add(m);
    }
    // entulho: blocos caídos, lajes inclinadas, pedras (com contorno)
    {
      const mat = lambert({ flatShading: true });
      const pilhas = [[-6.2, 9, 2.4], [6.4, 15, 2.0], [-5.8, 24, 2.6], [4.8, 24.5, 1.8], [-3.2, 4.5, 0.9], [3.6, 12, 0.8]];
      for (const [cx, cz, tam] of pilhas) for (let i = 0; i < 9 * tam; i++) {
        const sx = 0.3 + r() * 0.9 * tam * 0.5, sy = 0.2 + r() * 0.5, sz = 0.3 + r() * 0.8 * tam * 0.5;
        const m = new T.Mesh(new T.BoxGeometry(sx, sy, sz), mat.clone()); m.material.color = pedra(0.25);
        m.position.set(cx + (r() - 0.5) * tam * 1.6, sy / 2 + r() * 0.5 * tam * (1 - Math.abs(r() - 0.5)), -(cz + (r() - 0.5) * tam * 1.6)); m.rotation.set((r() - 0.5) * 0.8, r() * 3, (r() - 0.5) * 0.8);
        m.castShadow = m.receiveShadow = true; comContorno(m); cena.add(m);
      }
      // pedras pontudas (pirâmides) e pedaços de pilar
      for (let i = 0; i < 10; i++) { const m = new T.Mesh(new T.ConeGeometry(0.25 + r() * 0.3, 0.6 + r() * 0.8, 4), mat.clone()); m.material.color = pedra(0.32); m.position.set((r() < 0.5 ? -1 : 1) * (4 + r() * 3.5), 0.3, -(3 + r() * 22)); m.castShadow = true; comContorno(m); cena.add(m); }
      for (const [x, z, h] of [[-4.5, 18, 5.5], [4.5, 18, 2.2], [-4.5, 6, 3.4], [4.5, 6, 6.5]]) { const m = new T.Mesh(new T.BoxGeometry(1.1, h, 1.1), mat.clone()); m.material.color = pedra(0.3); m.position.set(x, h / 2, -z); m.castShadow = m.receiveShadow = true; comContorno(m); cena.add(m); }
    }
    // sacada alta de pedra (onde a arqueira fica), com escada de entulho
    {
      const s = MAS.sacada, m = new T.Mesh(new T.BoxGeometry(s.x1 - s.x0, 0.5, s.z1 - s.z0), lambert({ color: pedra(0.3) })); m.position.set((s.x0 + s.x1) / 2, s.y - 0.25, -(s.z0 + s.z1) / 2); m.castShadow = m.receiveShadow = true; comContorno(m); cena.add(m);
      for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.BoxGeometry(0.4, 0.5, 0.4), lambert({ color: pedra(0.34) })); b.position.set(s.x1 - 0.2, s.y + 0.25, -(s.z0 + 0.6 + i * 1.6)); b.castShadow = true; comContorno(b); cena.add(b); }
    }
    // rachaduras vermelhas acesas no chão (galhos)
    {
      const P = [], Pg = [];
      const fita = (arr, a, b, w, y) => { const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1, px = (-dz / n) * w, pz = (dx / n) * w; arr.push(a[0] - px, y, -(a[1] - pz), a[0] + px, y, -(a[1] + pz), b[0] + px, y, -(b[1] + pz), a[0] - px, y, -(a[1] - pz), b[0] + px, y, -(b[1] + pz), b[0] - px, y, -(b[1] - pz)); };
      const galho = (x, z, ang, len, prof) => { let p = [x, z]; const n = 6 + Math.floor(r() * 5); for (let i = 0; i < n; i++) { ang += (r() - 0.5) * 0.9; const q = [p[0] + Math.cos(ang) * len / n, p[1] + Math.sin(ang) * len / n]; fita(P, p, q, 0.014, 0.012); fita(Pg, p, q, 0.09, 0.01); if (prof > 0 && r() < 0.3) galho(q[0], q[1], ang + (r() < 0.5 ? 0.8 : -0.8), len * 0.5, prof - 1); p = q; } };
      for (const [x, z, a, l] of [[-3, 7, 0.3, 5], [2.5, 11, 2.4, 4], [-1, 16, 0.9, 5], [3, 20, 2.0, 4]]) galho(x, z, a, l, 1);
      const g1 = new T.BufferGeometry(); g1.setAttribute('position', new T.Float32BufferAttribute(P, 3));
      const g2 = new T.BufferGeometry(); g2.setAttribute('position', new T.Float32BufferAttribute(Pg, 3));
      const m1 = new T.Mesh(g1, new T.MeshBasicMaterial({ color: 0xc8301c, toneMapped: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 })); cena.add(m1);
      const m2 = new T.Mesh(g2, new T.MeshBasicMaterial({ color: 0xff2a10, transparent: true, opacity: 0.14, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); cena.add(m2);
    }
    // tochas nas paredes (sempre acesas)
    const chamas = [];
    {
      const tChama = textura(texChama()), tBrilho = textura(texBrilho('255,170,80')), ferro = lambert({ color: 0x2a2a30 });
      [[MAS.x0 + 0.35, 2.6, 5], [MAS.x1 - 0.35, 2.6, 5], [MAS.x0 + 0.35, 2.6, 15], [MAS.x1 - 0.35, 2.6, 15], [-2.6, 2.8, MAS.z1 - 0.35], [2.6, 2.8, MAS.z1 - 0.35]].forEach(([x, y, z], i) => {
        const g = new T.Group(); g.position.set(x, y, -z);
        const c = new T.Mesh(new T.CylinderGeometry(0.12, 0.06, 0.2, 8, 1, true), ferro); g.add(c);
        const ch = new T.Sprite(new T.SpriteMaterial({ map: tChama, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); ch.position.y = 0.15; ch.center.set(0.5, 0.15); g.add(ch);
        const br = new T.Sprite(new T.SpriteMaterial({ map: tBrilho, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.6 })); br.position.y = 0.15; br.scale.set(1.6, 1.6, 1); g.add(br);
        cena.add(g); chamas.push({ x, y: y + 0.15, z, ch, br, i });
      });
    }
    // baú dourado aberto brilhando (a luz quente da cena)
    {
      const [bx, bz] = MAS.bau, g = new T.Group(); g.position.set(bx, 0, -bz); g.rotation.y = 0.5;
      const mad = lambert({ color: 0x8a5a2a }), ouro = new T.MeshPhongMaterial({ color: 0xd9a03a, emissive: 0x6a4010, shininess: 60 });
      const base = new T.Mesh(new T.BoxGeometry(1.1, 0.6, 0.7), mad); base.position.y = 0.3; base.castShadow = true; comContorno(base); g.add(base);
      const tampa = new T.Mesh(new T.BoxGeometry(1.1, 0.12, 0.7), mad); tampa.position.set(0, 0.85, 0.3); tampa.rotation.x = -1.2; comContorno(tampa); g.add(tampa);
      for (const dx of [-0.5, 0.5]) { const f = new T.Mesh(new T.BoxGeometry(0.08, 0.62, 0.72), ouro); f.position.set(dx, 0.3, 0); g.add(f); }
      const luz = new T.Mesh(new T.PlaneGeometry(1.0, 0.6).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffd070, toneMapped: false })); luz.position.y = 0.58; g.add(luz);
      const brilho = new T.Sprite(new T.SpriteMaterial({ map: textura(texBrilho('255,200,100')), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 })); brilho.position.y = 1.1; brilho.scale.set(3.2, 3.2, 1); g.add(brilho);
      cena.add(g);
    }
    // poeira/brasas douradas flutuando
    {
      const n = 220, Pp = new Float32Array(n * 3), F = new Float32Array(n); for (let i = 0; i < n; i++) { Pp.set([(r() - 0.5) * 15, 0.2 + r() * 2.6, -(r() * 26)], i * 3); F[i] = r() * 100; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(Pp, 3)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float fase; uniform float uTempo; varying float vA; void main(){ vec3 p = position + vec3(sin(uTempo*0.3+fase)*0.4, mod(uTempo*0.15+fase*0.05,1.0)*0.8, cos(uTempo*0.25+fase*1.3)*0.4); vA = 0.5 + 0.5*sin(uTempo*1.5 + fase*2.0); vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = 9.0 * (6.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.0,0.8,0.45), a * (0.12 + 0.35*vA)); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; cena.add(pts);
    }
    R = { renderer, canvas, cena, camera, uni, arvores: [], magia: montarMagia(cena, uni), ceuMat, lua, sol, hemi, dir, pontos, chamas, nevoas: [], runasMat: new T.MeshBasicMaterial(), grupoCeu, esc,
      PAL: PAL_MASMORRA, nevoaPerto: [12, 12, 12], nevoaLonge: [48, 48, 48], forcaHemi: [0.75, 0.75, 0.75], forcaSol: [1.1, 1.1, 1.1], solEl: 1.6, solX: -0.25, sempreAcesa: true,
      luzesFixas: [{ x: MAS.bau[0], y: 1.0, z: MAS.bau[1], cor: '#FFB850', forca: 1.6, raio: 9 }, { x: 0, y: 0.3, z: 14, cor: '#FF3A22', forca: 0.18, raio: 4 }],
      altura: () => 0, naTrilha: () => false, semRaiosLua: true, figPool: [], contatoPool: [] };
  }

  // ---------------- MUNDO 2: Cânion Vermelho (Parte 4) ----------------
  // Paredes altas de pedra em camadas (vermelho/laranja/creme), chão de terra batida, trilha clara no meio, pedras,
  // arbustos secos, cristais azuis saindo das paredes, ponte de corda lá no alto, poeira dourada no ar.
  // O cânion corre ao longo de Z (para dentro da tela), então o sol nascendo lá no fundo ilumina o corredor.
  const canX = (z) => Math.sin(z * 0.045) * 1.2;
  const canParede = (z, lado, y) => lado * (7.2 + 2.2 * Math.sin(z * 0.06 + lado * 1.7) + 1.6 * fbm(z * 0.05 + 3, lado + 5)) + lado * (y * 0.22 + Math.floor(y / 3.2) * 0.35 * (0.6 + 0.8 * ruido(z * 0.13, Math.floor(y / 3.2))));
  const CAN_ALT = 34, CAN_PONTE = { z: 36, y: 23 }, CAN_ROCHA = { x0: -6.6, x1: -3.8, z0: 13.6, z1: 16.4, y: 3.6 };
  const PAL_CANION = {
    ceuTopo: ['#5A98DC', '#5A4E98', '#141E52'], ceuHz: ['#FFE0B0', '#F2955E', '#3A4C96'], ceuBaixo: ['#F0C49A', '#C47460', '#26326A'],
    nevoa: ['#EAC7A0', '#D88E6C', '#2A2E6E'], hemiCeu: ['#FFEBD2', '#F4B494', '#9A86E8'], hemiChao: ['#9A5236', '#5E3A36', '#3A2448'],
    sol: ['#FFE6BE', '#FF9A50', '#A8C0FF'],
  };
  function montarCanion() {
    const T = THREE, r = rng(77);
    const canvas = document.createElement('canvas');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    const esc = 0.75; renderer.setPixelRatio(1); renderer.setSize(Math.round(W * esc), Math.round(H * esc), false);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const cena = new T.Scene(); cena.fog = new T.Fog(0xeac7a0, 30, 220);
    const camera = new T.PerspectiveCamera(60, W / H, 0.05, 900);
    const uni = { uTempo: { value: 0 }, uNoite: { value: 0 } };
    const lambert = (o) => new T.MeshLambertMaterial(o);
    const madeira = textura(texMadeira());
    // céu, sol, lua (o mesmo esquema do campo)
    const ceuMat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { topo: { value: new T.Color() }, hz: { value: new T.Color() }, baixo: { value: new T.Color() } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topo; uniform vec3 hz; uniform vec3 baixo; varying vec3 vP; void main(){ float y = normalize(vP).y; vec3 c = y > 0.0 ? mix(hz, topo, pow(clamp(y*1.6,0.0,1.0),0.7)) : mix(hz, baixo, clamp(-y*6.0,0.0,1.0)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}',
    });
    const grupoCeu = new T.Group(); cena.add(grupoCeu);
    const ceu = new T.Mesh(new T.SphereGeometry(800, 32, 16), ceuMat); ceu.frustumCulled = false; ceu.renderOrder = -10; grupoCeu.add(ceu);
    const lua = new T.Sprite(new T.SpriteMaterial({ map: textura(texLua()), transparent: true, depthWrite: false, fog: false })); lua.scale.set(260, 260, 1); lua.renderOrder = -8; grupoCeu.add(lua);
    const sol = new T.Sprite(new T.SpriteMaterial({ map: textura(texBrilho('255,236,190')), transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending })); sol.scale.set(300, 300, 1); sol.renderOrder = -8; grupoCeu.add(sol);
    const hemi = new T.HemisphereLight(0xffffff, 0x884433, 1); cena.add(hemi);
    const dir = new T.DirectionalLight(0xffffff, 1); dir.castShadow = true; dir.shadow.mapSize.set(2048, 2048);
    Object.assign(dir.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 }); dir.shadow.camera.updateProjectionMatrix(); dir.shadow.bias = -0.0008; dir.shadow.normalBias = 0.03;
    cena.add(dir); cena.add(dir.target);
    const pontos = []; for (let i = 0; i < 9; i++) { const p = new T.PointLight(0xffa050, 0, 9, 1.6); cena.add(p); pontos.push(p); }

    // chão: terra batida vermelha, trilha mais clara no meio, marcas e manchas
    {
      const xs = eixo(-60, 60, -14, 14, 0.35), zs = eixo(-80, 420, -20, 60, 0.4), nx = xs.length, nz = zs.length;
      const P = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), idx = [], c = new T.Color();
      const tA = new T.Color('#B8653E'), tB = new T.Color('#D4844E'), tC = new T.Color('#9A4E32'), trilha = new T.Color('#E8B888'), seco = new T.Color('#D0A070');
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const X = xs[i], Z = zs[j], k = j * nx + i, dw = Math.abs(X) - Math.abs(canParede(Z, Math.sign(X) || 1, 0));
        const h = dw > -1.2 ? Math.max(0, dw + 1.2) * 0.35 : (fbm(X * 0.3, Z * 0.3) - 0.5) * 0.05 * suave(1.5, 4, Math.abs(X - canX(Z)));
        P.set([X, h, -Z], k * 3);
        const v = fbm(X * 0.12, Z * 0.12), v2 = ruido(X * 0.9, Z * 0.9);
        c.copy(tA).lerp(tB, v).lerp(tC, v2 * 0.55).lerp(new T.Color('#7A3424'), suave(0.62, 0.8, ruido(X * 2.2 + 3, Z * 2.2)) * 0.35);
        c.lerp(trilha, suave(1.5, 0.4, Math.abs(X - canX(Z))) * 0.6 * (0.7 + 0.3 * ruido(X * 1.5, Z * 1.5)));
        c.lerp(seco, suave(0.55, 0.8, ruido(X * 0.35 + 9, Z * 0.35)) * 0.35);
        C.set([c.r, c.g, c.b], k * 3);
      }
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1; idx.push(a, b, d, b, e, d); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('color', new T.BufferAttribute(C, 3)); g.setIndex(idx); g.computeVertexNormals();
      const chao = new T.Mesh(g, lambert({ vertexColors: true })); chao.receiveShadow = true; cena.add(chao);
    }
    // paredes do cânion em camadas (estratos), com saliências e degraus; topo plano (platô) para fora
    const ESTRATOS = ['#B5452A', '#D0683A', '#E39A5C', '#C25A35', '#8E3A26', '#E8B07A', '#A84A2C', '#D9804A'];
    for (const lado of [-1, 1]) {
      const zs = eixo(-80, 420, -20, 60, 0.6), ys = []; for (let y = 0; y <= CAN_ALT; y += 0.7) ys.push(y);
      const nz = zs.length, ny = ys.length, P = new Float32Array(nz * (ny + 1) * 3), C = new Float32Array(nz * (ny + 1) * 3), idx = [], c = new T.Color();
      for (let j = 0; j < nz; j++) {
        const Z = zs[j];
        for (let i = 0; i <= ny; i++) {
          const k = j * (ny + 1) + i, top = i === ny, y = top ? CAN_ALT : ys[i];
          let x = top ? lado * 220 : canParede(Z, lado, y) + lado * (ruido(Z * 0.5, y * 0.5) - 0.5) * 0.9 + lado * (ruido(Z * 1.7, y * 1.7) - 0.5) * 0.25;
          P.set([x, y + (top ? 0 : (ruido(Z * 0.8, y) - 0.5) * 0.2), -Z], k * 3);
          const banda = Math.floor((y + (fbm(Z * 0.04, lado) - 0.5) * 2.5) / 1.6), base = new T.Color(ESTRATOS[((banda % ESTRATOS.length) + ESTRATOS.length) % ESTRATOS.length]);
          c.copy(base).lerp(new T.Color('#5A2A1E'), suave(3, 0, y) * 0.35).lerp(new T.Color('#F0C69A'), ruido(Z * 0.6, y * 0.6) * 0.18);
          if (top) c.set('#B86A44');
          C.set([c.r, c.g, c.b], k * 3);
        }
      }
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < ny; i++) { const a = j * (ny + 1) + i, b = a + 1, d = a + ny + 1, e = d + 1; if (lado > 0) idx.push(a, d, b, b, d, e); else idx.push(a, b, d, b, e, d); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('color', new T.BufferAttribute(C, 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = new T.Mesh(g, lambert({ vertexColors: true, flatShading: true, side: T.DoubleSide })); m.castShadow = true; m.receiveShadow = true; cena.add(m);
    }
    // mesas (morros de topo plano) lá no fim do cânion, na névoa
    {
      const mat = lambert({ vertexColors: true, flatShading: true });
      for (let i = 0; i < 9; i++) {
        const x = (r() - 0.5) * 260, z = 300 + r() * 220, rr = 14 + r() * 30, hh = 30 + r() * 40;
        const g = amassar(new T.CylinderGeometry(rr * 0.8, rr, hh, 9, 4), rr * 0.06, 0.08);
        const geo = juntar([{ g, cor: (x2, y2) => ESTRATOS[Math.abs(Math.floor((y2 + hh) / 4)) % ESTRATOS.length] }]);
        const m = new T.Mesh(geo, mat); m.position.set(x, hh / 2 - 2, -z); cena.add(m);
      }
    }
    // pedras e pedregulhos (vermelhos, facetados)
    {
      const g = amassar(new T.DodecahedronGeometry(1, 1), 0.25, 1.3); g.scale(1, 0.7, 0.9); g.translate(0, 0.3, 0);
      const L = [];
      for (let i = 0; i < 1600 && L.length < 160; i++) {
        const z = -20 + r() * 260, lado = r() < 0.5 ? -1 : 1, borda = Math.abs(canParede(z, lado, 0));
        const x = lado * (borda - 0.3 - Math.pow(r(), 1.6) * (borda - 1.6)); if (Math.abs(x - canX(z)) < 1.6) continue;
        const pertoParede = Math.abs(x) > borda - 2; L.push([x, z, (pertoParede ? 0.35 + r() * 1.1 : 0.12 + r() * 0.35), r() * 6.28]);
      }
      for (const [x, z, s] of [[-3.4, 4.5, 0.9], [3.8, 8.5, 1.3], [-4.2, 13, 1.1], [3.2, 2.0, 0.5], [-2.6, 9.5, 0.4]]) L.push([x, z, s, r() * 6]);
      for (let i = 0; i < 1400; i++) { const z = -6 + r() * 70, x = (r() - 0.5) * 2 * (Math.abs(canParede(z, 1, 0)) - 0.8); L.push([x, z, 0.03 + Math.pow(r(), 2) * 0.08, r() * 6.28]); } // pedrinhas soltas
      const m = new T.InstancedMesh(g, lambert({ flatShading: true }), L.length), o = new T.Object3D(), c = new T.Color();
      L.forEach(([x, z, s, a], i) => { o.position.set(x, -0.05 * s, -z); o.rotation.set(0, a, 0); o.scale.set(s * 1.2, s, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); c.set(ESTRATOS[i % ESTRATOS.length]).lerp(new T.Color('#7A3A26'), 0.25); m.setColorAt(i, c); });
      m.castShadow = true; m.receiveShadow = true; cena.add(m);
    }
    // rochedo alto de topo plano (onde a arqueira fica), com pedras em degrau na base
    {
      const R0 = CAN_ROCHA, cx = (R0.x0 + R0.x1) / 2, cz = (R0.z0 + R0.z1) / 2, mat = lambert({ vertexColors: true, flatShading: true });
      for (const [h0, h1, rr, dx] of [[0, 1.4, 1.75, 0], [1.3, 2.6, 1.55, 0.12], [2.5, R0.y, 1.4, -0.08]]) {
        const g = amassar(new T.CylinderGeometry(rr, rr * 1.08, h1 - h0, 9, 2), 0.12, 1.4);
        const geo = juntar([{ g, cor: (x2, y2) => ESTRATOS[Math.abs(Math.floor((y2 + h0 + 5) / 0.6)) % ESTRATOS.length] }]);
        const m = new T.Mesh(geo, mat); m.position.set(cx + dx, (h0 + h1) / 2, -cz); m.castShadow = m.receiveShadow = true; cena.add(m);
      }
      const gp = amassar(new T.DodecahedronGeometry(1, 0), 0.15, 1.2), mp = lambert({ flatShading: true, color: 0xb05a36 });
      for (const [x, z, s2] of [[R0.x1 + 0.4, cz - 1.2, 0.7], [R0.x1 + 0.1, cz - 0.4, 1.0], [R0.x1 + 0.6, cz + 0.8, 0.5]]) { const m = new T.Mesh(gp, mp); m.position.set(x, s2 * 0.5, -z); m.scale.setScalar(s2); m.castShadow = m.receiveShadow = true; cena.add(m); }
    }
    // arbustos e capim secos (tufos instanciados, cor de palha)
    const gramaMat = lambert({ vertexColors: true, side: T.DoubleSide });
    gramaMat.onBeforeCompile = (sh) => { sh.uniforms.uTempo = uni.uTempo; sh.vertexShader = 'uniform float uTempo;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0); float bal = sin(uTempo*1.3 + wp.x*0.45 + wp.z*0.3); transformed.x += bal * 0.08 * position.y * position.y * 6.0;'); };
    {
      const protos = [geoTufo(21, ['#6A4A2A', '#E8C888']), geoTufo(22, ['#5E3E24', '#D8B070'])], lista = [[], []];
      for (let i = 0; i < 9000; i++) {
        const z = -10 + r() * 120, lado = r() < 0.5 ? -1 : 1, borda = Math.abs(canParede(z, lado, 0)), x = lado * (1.8 + r() * (borda - 2));
        if (Math.abs(x - canX(z)) < 1.4 || ruido(x * 0.4, z * 0.4) < 0.5) continue;
        lista[i % 2].push([x, z, 0.8 + r() * 1.4, r() * 6.28, r()]);
      }
      const o = new T.Object3D(), c = new T.Color();
      protos.forEach((g, k) => { const L = lista[k], m = new T.InstancedMesh(g, gramaMat, L.length); L.forEach(([x, z, s, a, v], i) => { o.position.set(x, 0, -z); o.rotation.set(0, a, 0); o.scale.set(s, s * (0.7 + v * 0.6), s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); c.setHSL(0.09, 0.2, 0.75 + v * 0.2); m.setColorAt(i, c); }); m.receiveShadow = true; cena.add(m); });
    }
    // cristais azuis saindo das paredes (brilham sozinhos)
    const cristais = [];
    const runasMat = new T.MeshPhongMaterial({ color: 0x8fe4ff, emissive: 0x2a8ccf, specular: 0xffffff, shininess: 90, flatShading: true, transparent: true, opacity: 0.95 });
    {
      const gc = new T.OctahedronGeometry(1, 0); gc.scale(0.22, 1, 0.22); gc.translate(0, 0.8, 0);
      const L = [];
      for (let i = 0; i < 70; i++) {
        const z = -6 + r() * 90, lado = r() < 0.5 ? -1 : 1, y = 0.3 + Math.pow(r(), 1.5) * 9, x = canParede(z, lado, y) - lado * 0.15;
        const n = 2 + Math.floor(r() * 4); for (let k = 0; k < n; k++) L.push([x, y + (r() - 0.5) * 0.4, z + (r() - 0.5) * 0.6, 0.3 + r() * 0.6, -lado * (0.5 + r() * 0.9), (r() - 0.5) * 0.8]);
      }
      const m = new T.InstancedMesh(gc, runasMat, L.length), o = new T.Object3D();
      L.forEach(([x, y, z, s, rz, rx], i) => { o.position.set(x, y, -z); o.rotation.set(rx, 0, rz); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
      m.castShadow = true; cena.add(m);
      // de noite cada grupo de cristais acende: halo azul em volta (e as luzes que sobram vão para os mais perto da câmera)
      const tb = textura(texBrilho('110,205,255'));
      for (let i = 0; i < L.length; i++) {
        const [x, y, z, s] = L[i]; if (i > 0 && Math.hypot(L[i - 1][0] - x, L[i - 1][2] - z) < 0.9) continue;
        const sp = new T.Sprite(new T.SpriteMaterial({ map: tb, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0, fog: false }));
        const w = 1.6 + s * 2.2; sp.scale.set(w, w, 1); sp.position.set(x, y + 0.6 * s, -z); cena.add(sp); cristais.push({ x, y: y + 0.6 * s, z, sp, w, f: r() * 6.28 });
      }
    }
    // tochas dos jogadores na borda lá em cima (aparecem uma a uma e descem de rapel pela parede)
    const tochasBorda = [];
    {
      const tChama = textura(texChama()), tBr = textura(texBrilho('255,170,80')), corda = new T.MeshBasicMaterial({ color: 0x2a1c14, transparent: true, opacity: 0.8 }), gCorda = new T.CylinderGeometry(0.02, 0.02, 1, 4);
      for (let i = 0; i < 64; i++) {
        const lado = i % 2 ? 1 : -1, z = 4 + r() * 46, g = new T.Group();
        const ch = new T.Sprite(new T.SpriteMaterial({ map: tChama, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); ch.center.set(0.5, 0.15); g.add(ch);
        const br = new T.Sprite(new T.SpriteMaterial({ map: tBr, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); g.add(br);
        const cd = new T.Mesh(gCorda, corda); cena.add(cd); cena.add(g); g.visible = cd.visible = false;
        tochasBorda.push({ g, ch, br, cd, lado, z, lim: r(), atraso: r() * 0.35, f: r() * 6.28 });
      }
      tochasBorda.sort((a, b) => a.lim - b.lim); tochasBorda.forEach((t, i) => { t.lim = i / tochasBorda.length; });
    }
    // estrelas (só de noite)
    { const n = 1400, P = new Float32Array(n * 3), S = new Float32Array(n), F = new Float32Array(n); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, y = 0.04 + Math.pow(r(), 0.8) * 0.96, rr = Math.sqrt(1 - y * y); P.set([Math.cos(a) * rr * 700, y * 700, Math.sin(a) * rr * 700], i * 3); S[i] = 1.2 + Math.pow(r(), 3) * 4.5; F[i] = r() * 6.28; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('tam', new T.BufferAttribute(S, 1)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float tam; attribute float fase; uniform float uTempo; varying float vA; void main(){ vA = 0.6 + 0.4*sin(uTempo*2.0 + fase*3.0); gl_PointSize = tam * 0.75; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform float uNoite; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vec3(0.85,0.9,1.0), a * vA * uNoite); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; pts.renderOrder = -9; grupoCeu.add(pts); }
    // ponte de corda lá no alto, de parede a parede
    {
      const z = CAN_PONTE.z, y0 = CAN_PONTE.y, xa = canParede(z, -1, y0) + 0.6, xb = canParede(z, 1, y0) - 0.6, L = xb - xa, n = Math.floor(L / 0.32);
      const mad = lambert({ map: madeira, color: 0xa07a58 }), corda = lambert({ color: 0x8a6a44 }), g = new T.Group();
      const flecha = (s) => y0 - 2.2 * Math.sin(Math.PI * s);
      for (let i = 0; i < n; i++) { const s = (i + 0.5) / n; if (r() < 0.06) continue; const t = new T.Mesh(new T.BoxGeometry(0.26, 0.05, 1.3), mad); t.position.set(xa + s * L, flecha(s), -z); t.rotation.set((r() - 0.5) * 0.08, (r() - 0.5) * 0.08, Math.cos(Math.PI * s) * -0.28); t.castShadow = true; g.add(t); }
      for (const dz of [-0.62, 0.62]) for (const dy of [0.0, 0.95]) {
        const pts = []; for (let i = 0; i <= 40; i++) { const s = i / 40; pts.push(new T.Vector3(xa + s * L, flecha(s) + dy - (dy ? 0.25 * Math.sin(Math.PI * s) : 0), -z + dz)); }
        const tubo = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.035, 5, false), corda); tubo.castShadow = true; g.add(tubo);
      }
      for (let i = 0; i <= 14; i++) { const s = i / 14; for (const dz of [-0.62, 0.62]) { const v = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.95, 4), corda); v.position.set(xa + s * L, flecha(s) + 0.45, -z + dz); g.add(v); } }
      cena.add(g);
    }
    // poeira dourada flutuando no ar (aparece de dia contra a luz)
    {
      const n = 900, Pp = new Float32Array(n * 3), F = new Float32Array(n); for (let i = 0; i < n; i++) { Pp.set([(r() - 0.5) * 16, 0.2 + r() * 9, -(-4 + r() * 50)], i * 3); F[i] = r() * 100; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(Pp, 3)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float fase; uniform float uTempo; varying float vA; void main(){ vec3 p = position + vec3(sin(uTempo*0.25+fase)*0.5 + uTempo*0.12, sin(uTempo*0.4+fase*1.7)*0.25, cos(uTempo*0.2+fase*1.3)*0.5); vA = 0.5 + 0.5*sin(uTempo*1.2 + fase*2.0); vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = 10.0 * (6.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform float uNoite; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vec3(1.0,0.86,0.6), vec3(0.55,0.85,1.0), uNoite), a * (0.25 + 0.45*vA) * (1.0 - 0.55*uNoite)); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; cena.add(pts);
    }
    // véu de poeira baixo (placas macias andando devagar)
    const nevoas = [];
    { const tn = textura(texNevoa()); for (let i = 0; i < 18; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: tn, transparent: true, depthWrite: false, opacity: 0.12, color: 0xf0c8a0 })); const w = 7 + r() * 9; s.scale.set(w, w * 0.2, 1); const x = (r() - 0.5) * 12, z = 6 + r() * 60; s.position.set(x, 0.3, -z); cena.add(s); nevoas.push({ s, x, z, v: 0.1 + r() * 0.2 }); } }

    R = { renderer, canvas, cena, camera, uni, arvores: [], magia: montarMagia(cena, uni), ceuMat, lua, sol, hemi, dir, pontos, chamas: [], nevoas, runasMat, grupoCeu, esc,
      PAL: PAL_CANION, nevoaPerto: [34, 24, 18], nevoaLonge: [240, 170, 140], forcaHemi: [0.78, 0.6, 0.62], forcaSol: [3.0, 2.4, 1.5],
      altura: (x, z) => 0, naTrilha: () => false, raiosSol: true, solEl: 1.25, solX: 0.12, luaX: 0.04, nevoaCor: [0xf0c8a0, 0x96aae6], figPool: [], contatoPool: [], cristais, tochasBorda };
  }

  // ---------------- magia em 3D: círculo no chão (em perspectiva, girando) e faíscas em volta das mãos ----------------
  // magias: [{ tipo: 'circulo', x, z, raio, k, cor } | { tipo: 'orbe', x, y, z, k, cor }]
  function montarMagia(cena, uni) {
    const T = THREE, tc = textura(texCirculo()), circulos = [], nuvens = [], tb = textura(texBrilho('255,255,255'));
    for (let i = 0; i < 2; i++) {
      const a = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: tc, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0x7fd0ff, fog: false, polygonOffset: true, polygonOffsetFactor: -6 }));
      const b = a.clone(); b.material = a.material.clone();
      a.visible = b.visible = false; a.renderOrder = b.renderOrder = -1; cena.add(a); cena.add(b); circulos.push([a, b]);
    }
    for (let i = 0; i < 3; i++) {
      const n = 70, P = new Float32Array(n * 3), g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3));
      const pts = new T.Points(g, new T.PointsMaterial({ map: tb, size: 0.05, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0x9fe0ff, sizeAttenuation: true }));
      pts.frustumCulled = false; pts.visible = false; cena.add(pts); nuvens.push(pts);
    }
    return { circulos, nuvens };
  }
  function atualizaMagia(lista, t) {
    const M = R.magia; let ic = 0, io = 0;
    for (const g of lista) {
      if (!(g.k > 0.01)) continue;
      if (g.tipo === 'circulo' && ic < M.circulos.length) {
        const [a, b] = M.circulos[ic++], y = altura(g.x, g.z) + (naTrilha(g.x, g.z, 0.3) ? 0.12 : 0.26), R0 = (g.raio || 0.9) * (0.6 + 0.4 * Math.min(1, g.k * 1.5));
        a.position.set(g.x, y, -g.z); a.scale.set(R0 * 2, 1, R0 * 2); a.rotation.y = t * 0.7; a.material.opacity = Math.min(1, g.k); a.material.color.set(g.cor || '#9AD8FF'); a.visible = true;
        b.position.set(g.x, y + 0.005, -g.z); b.scale.set(R0 * 1.25, 1, R0 * 1.25); b.rotation.y = -t * 1.3; b.material.opacity = 0.7 * Math.min(1, g.k); b.material.color.set(g.cor || '#C8ECFF'); b.visible = true;
      }
      if (g.tipo === 'orbe' && io < M.nuvens.length) {
        const pts = M.nuvens[io++], P = pts.geometry.attributes.position, n = P.count, vidaNada = 0;
        for (let i = 0; i < n; i++) { const f = i * 1.618, vida = ((t * 0.9 + f * 0.37) % 1), ang = f * 2.4 + t * (2 + (i % 3)), rr = 0.06 + 0.2 * vida; P.setXYZ(i, g.x + Math.cos(ang) * rr, g.y - 0.03 + vida * 0.4 + Math.sin(t * 3 + f) * 0.03, -(g.z + Math.sin(ang) * rr)); }
        P.needsUpdate = true; pts.material.opacity = Math.min(1, g.k) * (1 - 0.5 * vidaNada); pts.material.color.set(g.cor || '#8FD8FF'); pts.visible = true;
      }
    }
    for (; ic < M.circulos.length; ic++) M.circulos[ic].forEach((m) => (m.visible = false));
    for (; io < M.nuvens.length; io++) M.nuvens[io].visible = false;
  }

  // ---------------- efeitos 3D modelados (flechas, muralha de gelo, raízes, meteoro, explosão, pixels de "saiu do jogo") ----------------
  // fx: [{ tipo: 'flecha', x, y, z, dx, dy, dz, rastro, gelo, brilho, s }
  //      { tipo: 'gelo', x, z, larg, alt, k, rumo, racha }   { tipo: 'raizes', x, z, raio, alt, k, seed }
  //      { tipo: 'meteoro', x, y, z, dx, dy, dz, s, k }      { tipo: 'explosao', x, z, k, s }
  //      { tipo: 'pixels', x, z, alt, k, cor }]  (coordenadas do motor: z para dentro da tela)
  const v3 = (x, y, z) => new THREE.Vector3(x, y, -z);
  function montarFx(cena) {
    const T = THREE, F = { flechas: [], gelos: [], raizes: [], meteoros: [], explosoes: [], pixels: [], ondas: [], redes: [] };
    const tBr = textura(texBrilho('255,255,255')), tRastro = textura(tela(256, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, w, h); }));
    tRastro.wrapS = tRastro.wrapT = T.ClampToEdgeWrapping;
    const aditivo = (cor, map = tBr, op = 1) => new T.MeshBasicMaterial({ map, color: cor, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false, fog: false });
    const sprite = (cor, op = 1) => { const s = new T.Sprite(new T.SpriteMaterial({ map: tBr, color: cor, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, fog: false })); s.visible = false; cena.add(s); return s; };
    // ---- flecha: haste de madeira, ponta de aço, amarração, 3 penas, encaixe; rastro de luz e casca de gelo ----
    const madeira = new T.MeshStandardMaterial({ color: 0xA8743F, roughness: 0.75 }), aco = new T.MeshStandardMaterial({ color: 0xD9E2EC, roughness: 0.25, metalness: 0.85 });
    const pena = new T.MeshStandardMaterial({ color: 0x3FC46A, roughness: 0.6, side: T.DoubleSide }), corda = new T.MeshStandardMaterial({ color: 0x3A2414, roughness: 0.9 });
    const gelo = new T.MeshStandardMaterial({ color: 0xCFF4FF, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.78, emissive: 0x3AA0D0, emissiveIntensity: 0.35, flatShading: true });
    const formaPena = new T.Shape(); formaPena.moveTo(0, 0); formaPena.quadraticCurveTo(0.012, 0.05, 0.05, 0.07); formaPena.lineTo(0.17, 0.045); formaPena.quadraticCurveTo(0.12, 0.012, 0.16, 0); formaPena.closePath();
    const gPena = new T.ShapeGeometry(formaPena); gPena.rotateY(-Math.PI / 2); // ao longo de +Z, para cima
    for (let i = 0; i < 16; i++) {
      const gr = new T.Group(), L = 0.78;
      const haste = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, L, 7).rotateX(Math.PI / 2), madeira); gr.add(haste);
      const ponta = new T.Mesh(new T.ConeGeometry(0.032, 0.11, 4).rotateX(Math.PI / 2), aco); ponta.position.z = L / 2 + 0.05; gr.add(ponta);
      const amarra = new T.Mesh(new T.CylinderGeometry(0.016, 0.016, 0.04, 7).rotateX(Math.PI / 2), corda); amarra.position.z = L / 2 - 0.01; gr.add(amarra);
      for (let k = 0; k < 3; k++) { const p = new T.Mesh(gPena, pena); p.position.z = -L / 2 + 0.01; p.rotation.z = (k / 3) * Math.PI * 2; gr.add(p); }
      const enc = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.03, 7).rotateX(Math.PI / 2), corda); enc.position.z = -L / 2 - 0.015; gr.add(enc);
      const rastro = new T.Group(); for (let k = 0; k < 2; k++) { const m = new T.Mesh(new T.PlaneGeometry(1, 0.05).translate(-0.5, 0, 0).rotateY(-Math.PI / 2), aditivo(0xBFFFD0, tRastro, 0.9)); m.rotation.z = k * Math.PI / 2; rastro.add(m); } rastro.position.z = -L / 2; gr.add(rastro);
      const casca = new T.Group(); for (let k = 0; k < 6; k++) { const c = new T.Mesh(new T.OctahedronGeometry(0.05 + (k % 3) * 0.02, 0), gelo); c.position.set(Math.sin(k * 2.1) * 0.03, Math.cos(k * 2.1) * 0.03, L / 2 - 0.05 - k * 0.06); c.rotation.set(k, k * 1.7, k * 0.6); c.scale.set(1, 1, 1.8); casca.add(c); } gr.add(casca);
      const brilho = new T.Mesh(new T.PlaneGeometry(1, 1), aditivo(0x9CFFB8)); brilho.position.z = L / 2 + 0.06; gr.add(brilho);
      gr.visible = false; cena.add(gr); F.flechas.push({ gr, rastro, casca, brilho, L });
    }
    // ---- rede de prata: malha redonda (raios + anéis) com pesinhos de chumbo na borda, brilho frio, abre girando no ar ----
    {
      const NR = 20, NA = 8, nSeg = NR * NA * 2;               // segmentos: anéis (NR por anel) + raios (NR por anel)
      const matFio = new T.LineBasicMaterial({ color: 0xDCE6F4, transparent: true, opacity: 0.95, toneMapped: false, fog: false });
      const matBrilho = new T.LineBasicMaterial({ color: 0x9FD4FF, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
      const chumbo = new T.MeshStandardMaterial({ color: 0x5A6070, roughness: 0.4, metalness: 0.8 }), geloPeso = new T.MeshStandardMaterial({ color: 0xDFF6FF, roughness: 0.1, transparent: true, opacity: 0.85, emissive: 0x3AA0D0, emissiveIntensity: 0.4, flatShading: true });
      for (let i = 0; i < 4; i++) {
        const gr = new T.Group(), geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(nSeg * 2 * 3), 3));
        const fio = new T.LineSegments(geo, matFio.clone()), brilho = new T.LineSegments(geo, matBrilho.clone()); fio.frustumCulled = brilho.frustumCulled = false; gr.add(brilho); gr.add(fio);
        const pesos = []; for (let k = 0; k < NR; k++) { const m = new T.Mesh(new T.SphereGeometry(0.045, 8, 6), chumbo); const c = new T.Mesh(new T.OctahedronGeometry(0.075, 0), geloPeso); c.visible = false; m.add(c); gr.add(m); pesos.push(m); }
        const halo = new T.Mesh(new T.PlaneGeometry(1, 1), aditivo(0x9FD4FF, tBr, 0.35)); gr.add(halo);
        const cordaGeo = new T.BufferGeometry(); cordaGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3)); const cordaL = new T.Line(cordaGeo, new T.LineBasicMaterial({ color: 0xC8A46A, toneMapped: false })); cordaL.frustumCulled = false; cena.add(cordaL); cordaL.visible = false;
        gr.visible = false; cena.add(gr); F.redes.push({ gr, geo, fio, brilho, pesos, halo, cordaL, NR, NA });
      }
    }
    // ---- muralha de gelo: cristais hexagonais com ponta, facetados, translúcidos, arestas claras e geada no chão ----
    const cristalMat = new T.MeshPhysicalMaterial({ color: 0xBDEBFF, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.62, emissive: 0x1E6E9E, emissiveIntensity: 0.45, flatShading: true, side: T.DoubleSide, depthWrite: false });
    const nucleoMat = new T.MeshBasicMaterial({ color: 0xE8FBFF, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
    const arestaMat = new T.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7, toneMapped: false });
    const gCristal = new T.LatheGeometry([new T.Vector2(0.001, -0.05), new T.Vector2(0.16, 0), new T.Vector2(0.15, 0.72), new T.Vector2(0.001, 1)], 6), gAresta = new T.EdgesGeometry(gCristal, 20);
    const geadaTex = textura(tela(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(235,250,255,0.95)'); gr.addColorStop(0.6, 'rgba(200,240,255,0.5)'); gr.addColorStop(1, 'rgba(200,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; const rr = rng(7); for (let i = 0; i < 40; i++) { const a = rr() * 6.28, r0 = rr() * 60, r1 = r0 + 20 + rr() * 60; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r0, w / 2 + Math.sin(a) * r0); g.lineTo(w / 2 + Math.cos(a) * r1, w / 2 + Math.sin(a) * r1); g.stroke(); } }));
    geadaTex.wrapS = geadaTex.wrapT = T.ClampToEdgeWrapping;
    for (let i = 0; i < 2; i++) {
      const gr = new T.Group(), cr = [], rr = rng(31 + i);
      for (let k = 0; k < 17; k++) { const c = new T.Group(), m = new T.Mesh(gCristal, cristalMat), n = new T.Mesh(gCristal, nucleoMat), a = new T.LineSegments(gAresta, arestaMat); n.scale.set(0.45, 0.92, 0.45); c.add(m); c.add(n); c.add(a); gr.add(c); cr.push({ c, u: (k + 0.5) / 17 - 0.5 + (rr() - 0.5) * 0.04, d: (rr() - 0.5) * 0.35, h: 0.55 + rr() * 0.5 + (k % 3 === 1 ? 0.25 : 0), w: 0.8 + rr() * 0.7, tx: (rr() - 0.5) * 0.5, tz: (rr() - 0.5) * 0.35, atraso: rr() * 0.35, ry: rr() * 3 }); }
      const geada = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: geadaTex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -5 })); gr.add(geada);
      const nevoa = []; for (let k = 0; k < 10; k++) { const s = sprite(0xDDF6FF, 0.3); nevoa.push(s); }
      gr.visible = false; cena.add(gr); F.gelos.push({ gr, cr, geada, nevoa });
    }
    // ---- raízes: tubos afinando que saem do chão e sobem em espiral; veio verde brilhante; folhas; terra levantando ----
    const casca = new T.MeshStandardMaterial({ color: 0x8A6038, roughness: 0.9, flatShading: true, emissive: 0x2A1A0C, emissiveIntensity: 0.6 }), veio = new T.MeshBasicMaterial({ color: 0x8CFF7A, transparent: true, opacity: 0.9, toneMapped: false, blending: T.AdditiveBlending, depthWrite: false });
    const folhaMat = new T.MeshStandardMaterial({ color: 0x4FB04A, roughness: 0.7, side: T.DoubleSide }), gFolha = new T.ShapeGeometry((() => { const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.05, 0.05, 0, 0.13); s.quadraticCurveTo(-0.05, 0.05, 0, 0); return s; })());
    for (let i = 0; i < 4; i++) {
      const gr = new T.Group(), tubos = [], rr = rng(77 + i);
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * Math.PI * 2 + rr() * 0.5, dir = k % 2 ? 1 : -1, voltas = 0.9 + rr() * 0.8, h = 0.55 + rr() * 0.45, pts = [];
        for (let j = 0; j <= 14; j++) { const f = j / 14, rad = j < 3 ? 1.25 - j * 0.28 : 0.42 + 0.06 * Math.sin(f * 9 + k), y = j < 3 ? -0.15 + j * 0.06 : (f - 3 / 14) / (11 / 14) * h, a = a0 + dir * voltas * Math.PI * 2 * Math.max(0, f - 3 / 14); pts.push(new T.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad)); }
        const curva = new T.CatmullRomCurve3(pts), seg = 90, rad0 = 0.07 + rr() * 0.03, G = new T.TubeGeometry(curva, seg, rad0, 7, false), P = G.attributes.position;
        for (let j = 0; j <= seg; j++) { const c = curva.getPointAt(j / seg), af = 1 - 0.85 * (j / seg); for (let q = 0; q <= 7; q++) { const id = j * 8 + q; P.setXYZ(id, c.x + (P.getX(id) - c.x) * af, c.y + (P.getY(id) - c.y) * af, c.z + (P.getZ(id) - c.z) * af); } }
        G.computeVertexNormals();
        const Gv = new T.TubeGeometry(curva, seg, rad0 * 0.32, 4, false), Pv = Gv.attributes.position; for (let j = 0; j <= seg; j++) { const c = curva.getPointAt(j / seg), af = 1 - 0.85 * (j / seg), off = new T.Vector3(0, rad0 * af * 0.75, 0); for (let q = 0; q <= 4; q++) { const id = j * 5 + q; Pv.setXYZ(id, c.x + (Pv.getX(id) - c.x) * af + off.x, c.y + (Pv.getY(id) - c.y) * af + off.y, c.z + (Pv.getZ(id) - c.z) * af + off.z); } }
        const m = new T.Mesh(G, casca), mv = new T.Mesh(Gv, veio); m.castShadow = true; gr.add(m); gr.add(mv);
        const folhas = []; for (let q = 0; q < 3; q++) { const f = 0.4 + q * 0.2, fo = new T.Mesh(gFolha, folhaMat), c = curva.getPointAt(f); fo.position.copy(c); fo.rotation.set(rr() * 3, rr() * 3, rr() * 3); fo.scale.setScalar(1.3); gr.add(fo); folhas.push({ fo, f }); }
        tubos.push({ m, mv, seg, ate: 0.75 + rr() * 0.25, atraso: rr() * 0.25, folhas });
      }
      const brilhos = []; for (let k = 0; k < 18; k++) brilhos.push(sprite(0x9CFF8A, 0.8));
      const terra = []; for (let k = 0; k < 14; k++) { const t2 = new T.Mesh(new T.DodecahedronGeometry(0.05 + rr() * 0.05, 0), casca); terra.push({ t: t2, a: rr() * 6.28, v: 0.6 + rr() }); gr.add(t2); }
      gr.visible = false; cena.add(gr); F.raizes.push({ gr, tubos, brilhos, terra });
    }
    // ---- meteoro: rocha deformada com rachaduras de lava (emissivo pela cor do vértice) + cauda de fogo ----
    { const G = new T.IcosahedronGeometry(1, 3), P = G.attributes.position, cor = new Float32Array(P.count * 3), rr = rng(5), v = new T.Vector3();
      for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const n = fbm(v.x * 1.7 + 3, v.y * 1.7 + v.z * 1.3), d = 0.82 + 0.3 * n + 0.06 * Math.sin(v.z * 7); v.multiplyScalar(d); P.setXYZ(i, v.x, v.y, v.z); const lava = Math.abs(fbm(v.x * 3 + v.z * 2, v.y * 3 - v.z) - 0.5) < 0.05; if (lava) { cor[i * 3] = 1; cor[i * 3 + 1] = 0.5; cor[i * 3 + 2] = 0.12; } else { const g = 0.16 + 0.08 * n; cor[i * 3] = g * 1.15; cor[i * 3 + 1] = g; cor[i * 3 + 2] = g * 0.95; } }
      G.setAttribute('color', new T.BufferAttribute(cor, 3)); G.computeVertexNormals();
      const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
      mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += max(vec3(0.0), vColor.rgb - vec3(0.4)) * 6.0;'); };
      const rocha = new T.Mesh(G, mat), aura = new T.Mesh(new T.SphereGeometry(1.25, 24, 16), aditivo(0xFF7A2A, null, 0.28)); aura.material.map = null;
      const gr = new T.Group(); gr.add(rocha); gr.add(aura); gr.visible = false; cena.add(gr);
      const cauda = []; for (let k = 0; k < 46; k++) cauda.push(sprite(k % 3 ? 0xFF8A30 : 0xFFD27A, 0.9));
      const fumaca = []; for (let k = 0; k < 16; k++) { const s = new T.Sprite(new T.SpriteMaterial({ map: tBr, color: 0x3A2A24, transparent: true, opacity: 0.5, depthWrite: false })); s.visible = false; cena.add(s); fumaca.push(s); }
      F.meteoros.push({ gr, rocha, aura, cauda, fumaca });
    }
    // ---- explosão: bola de fogo crescendo, anel de choque no chão, faíscas e pedras voando ----
    { const bola = new T.Mesh(new T.IcosahedronGeometry(1, 3), aditivo(0xFF9A40, null, 1)); bola.material.map = null; const nucleo = new T.Mesh(new T.IcosahedronGeometry(1, 2), aditivo(0xFFF0C0, null, 1)); nucleo.material.map = null;
      const anel = new T.Mesh(new T.RingGeometry(0.8, 1, 64).rotateX(-Math.PI / 2), aditivo(0xFFC080, null, 1)); anel.material.map = null;
      const fogo = []; for (let k = 0; k < 40; k++) fogo.push(sprite(k % 2 ? 0xFF7A20 : 0xFFC060, 1));
      const pedras = []; const rr = rng(9); const rochaM = new T.MeshStandardMaterial({ color: 0x6A3A24, roughness: 0.9, flatShading: true }); for (let k = 0; k < 18; k++) { const p = new T.Mesh(new T.DodecahedronGeometry(0.06 + rr() * 0.1, 0), rochaM); p.visible = false; cena.add(p); pedras.push({ p, a: rr() * 6.28, v: 2 + rr() * 4, up: 3 + rr() * 5 }); }
      const gr = new T.Group(); gr.add(bola); gr.add(nucleo); gr.add(anel); gr.visible = false; cena.add(gr); F.explosoes.push({ gr, bola, nucleo, anel, fogo, pedras }); }
    // ---- pixels: o corpo vira cubinhos de luz subindo (saiu do jogo) + coluna de luz ----
    for (let i = 0; i < 5; i++) { const n = 150, im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1, toneMapped: false, blending: T.AdditiveBlending, depthWrite: false }), n); im.frustumCulled = false; im.visible = false; cena.add(im);
      const raio = new T.Mesh(new T.CylinderGeometry(0.28, 0.42, 1, 24, 1, true), aditivo(0x9FE8FF, textura(tela(16, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); })), 0.8)); raio.visible = false; cena.add(raio);
      const rr = rng(50 + i), sem = []; for (let k = 0; k < n; k++) sem.push([rr(), rr(), rr(), rr()]); F.pixels.push({ im, raio, sem }); }
    // ---- onda no chão: 3 anéis de luz se abrindo (passo forte, impacto) ----
    for (let i = 0; i < 4; i++) { const gr = new T.Group(), aneis = []; for (let k = 0; k < 3; k++) { const a = new T.Mesh(new T.RingGeometry(0.965, 1, 96).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, fog: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6 })); gr.add(a); aneis.push(a); }
      const brilho = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), aditivo(0xFFFFFF)); brilho.material.polygonOffset = true; brilho.material.polygonOffsetFactor = -5; gr.add(brilho); gr.visible = false; cena.add(gr); F.ondas.push({ gr, aneis, brilho }); }
    return F;
  }
  function atualizaFx(lista, t) {
    if (!R.fx) R.fx = montarFx(R.cena);
    const F = R.fx, T = THREE, ix = { flecha: 0, gelo: 0, raizes: 0, meteoro: 0, explosao: 0, pixels: 0, onda: 0, rede: 0 }, o = new T.Object3D(), cl = (v) => Math.max(0, Math.min(1, v));
    for (const g of lista) {
      if (!g) continue;
      // rede: { tipo: 'rede', x, y, z, dx, dy, dz (para onde voa), abre 0..1, gira (rad), R (raio aberta, m), congela 0..1, corda: [x, y, z] }
      if (g.tipo === 'rede' && ix.rede < F.redes.length) {
        const N = F.redes[ix.rede++], p = v3(g.x, g.y, g.z), d = new T.Vector3(g.dx || 0, g.dy || 0, -(g.dz === undefined ? 1 : g.dz)).normalize();
        N.gr.position.copy(p); N.gr.lookAt(p.clone().add(d)); N.gr.visible = true;
        const ab = g.abre === undefined ? 1 : g.abre, Rm = (g.R || 1.3) * (0.12 + 0.88 * ab), gira = g.gira || 0, cg = g.congela || 0, tt = cg > 0 ? (g.tCongela || t) : t;
        const pos = N.geo.attributes.position.array; let w = 0;
        const pt = (i, k) => { // anel i (0 = centro), raio k
          const a = (k / N.NR) * Math.PI * 2 + gira, f = i / N.NA, r = Rm * f * (1 + 0.06 * Math.sin(k * 2.3 + i)),
            onda = (1 - cg) * (0.09 * ab * f * Math.sin(a * 3 + tt * 9) + 0.05 * f * Math.sin(tt * 13 + k)), cuia = (1 - 0.7 * cg) * (0.55 * (1 - ab) + 0.28) * Rm * f * f;
          return [Math.cos(a) * r, Math.sin(a) * r, -cuia + onda]; };
        for (let i = 1; i <= N.NA; i++) for (let k = 0; k < N.NR; k++) {
          const A = pt(i, k), B = pt(i, (k + 1) % N.NR), C = pt(i - 1, k);
          pos.set(A, w); pos.set(B, w + 3); pos.set(A, w + 6); pos.set(C, w + 9); w += 12;
        }
        N.geo.attributes.position.needsUpdate = true;
        const cor = new T.Color(0xDCE6F4).lerp(new T.Color(0xF4FCFF), cg); N.fio.material.color.copy(cor); N.brilho.material.color.copy(new T.Color(0x9FD4FF).lerp(new T.Color(0xBFF0FF), cg)); N.brilho.material.opacity = 0.45 + 0.35 * cg;
        N.pesos.forEach((m, k) => { const q = pt(N.NA, k); m.position.set(q[0] * 1.03, q[1] * 1.03, q[2] - 0.04); m.children[0].visible = cg > 0.05; m.children[0].scale.setScalar(cl(cg * 1.5)); m.children[0].rotation.set(k, k * 2, 0); });
        N.halo.scale.setScalar(Rm * 2.6); N.halo.material.opacity = 0.18 + 0.25 * cg;
        if (g.corda) { const c = N.cordaL.geometry.attributes.position.array, q = v3(g.corda[0], g.corda[1], g.corda[2]); c.set([p.x, p.y, p.z, q.x, q.y, q.z]); N.cordaL.geometry.attributes.position.needsUpdate = true; N.cordaL.visible = true; } else N.cordaL.visible = false;
        continue;
      }
      if (g.tipo === 'flecha' && ix.flecha < F.flechas.length) {
        const A = F.flechas[ix.flecha++], p = v3(g.x, g.y, g.z), d = new T.Vector3(g.dx, g.dy, -g.dz).normalize(), s = g.s || 1;
        A.gr.position.copy(p); A.gr.lookAt(p.clone().add(d)); A.gr.scale.setScalar(s); A.gr.visible = true;
        const rs = g.rastro || 0; A.rastro.visible = rs > 0.01; A.rastro.scale.set(1, 1, 1); A.rastro.children.forEach((m) => { m.scale.set(1, 1 + rs, 0.2 + 2.4 * rs); m.material.opacity = 0.85 * Math.min(1, rs * 2); });
        const ge = g.gelo || 0; A.casca.visible = ge > 0.01; A.casca.children.forEach((c, k) => c.scale.setScalar(cl(ge * 1.6 - k * 0.12) * (k % 2 ? 1.2 : 1)));
        const br = g.brilho || 0; A.brilho.visible = br > 0.01; if (br > 0.01) { A.brilho.quaternion.copy(R.camera.quaternion).premultiply(A.gr.quaternion.clone().invert()); A.brilho.scale.setScalar(0.12 + 0.5 * br * (0.9 + 0.1 * Math.sin(t * 30))); A.brilho.material.opacity = Math.min(1, br * 1.4); }
      }
      if (g.tipo === 'gelo' && ix.gelo < F.gelos.length) {
        const G = F.gelos[ix.gelo++], larg = g.larg || 2.8, alt = g.alt || 2.2, k = g.k === undefined ? 1 : g.k;
        G.gr.position.set(g.x, 0, -g.z); G.gr.rotation.y = -(g.rumo || 0); G.gr.visible = k > 0.01;
        G.cr.forEach((c, i) => { const kk = cl((k - c.atraso * 0.6) / 0.45), e = 1 - Math.pow(1 - kk, 3), rach = g.racha && Math.abs(c.u) < 0.08 ? g.racha : 0; c.c.position.set(c.u * larg, -0.05 + (1 - e) * -0.3, c.d); c.c.rotation.set(c.tx * (1 + rach * 0.6), c.ry, c.tz + rach * 0.25); c.c.scale.set(c.w * 1.25, alt * c.h * Math.max(0.001, e), c.w * 1.25); c.c.visible = kk > 0.001; });
        G.geada.scale.set(larg * 1.6 * Math.min(1, k * 2), 1, 2.2 * Math.min(1, k * 2)); G.geada.position.y = altura(g.x, g.z) + 0.03; G.geada.material.opacity = Math.min(1, k * 2);
        G.nevoa.forEach((s, i) => { const f = ((t * 0.25 + i / G.nevoa.length) % 1), u = (i / G.nevoa.length - 0.5) * larg; const lp = v3(g.x + u * Math.cos(g.rumo || 0), 0.2 + f * 0.8, g.z + 0.3 + u * Math.sin(g.rumo || 0)); s.position.copy(lp); s.scale.setScalar(0.8 + f * 1.4); s.material.opacity = 0.22 * Math.sin(Math.PI * f) * Math.min(1, k * 1.5); s.visible = k > 0.05; });
      }
      if (g.tipo === 'raizes' && ix.raizes < F.raizes.length) {
        const Rz = F.raizes[ix.raizes++], k = g.k === undefined ? 1 : g.k, raio = g.raio || 0.45, alt = g.alt || 2.4;
        Rz.gr.position.set(g.x, altura(g.x, g.z), -g.z); Rz.gr.scale.set(raio / 0.45, alt, raio / 0.45); Rz.gr.visible = k > 0.01; Rz.gr.rotation.y = t * 0.0;
        Rz.tubos.forEach((tb) => { const kk = cl((k - tb.atraso) / 0.6) * tb.ate, n = Math.floor(tb.seg * kk) * 7 * 6, nv = Math.floor(tb.seg * kk) * 4 * 6; tb.m.geometry.setDrawRange(0, n); tb.mv.geometry.setDrawRange(0, nv); tb.mv.material.opacity = 0.6 + 0.4 * Math.sin(t * 5); tb.folhas.forEach((f) => (f.fo.visible = kk > f.f + 0.05)); });
        Rz.brilhos.forEach((s, i) => { const f = ((t * 0.5 + i / Rz.brilhos.length) % 1), a = i * 2.4 + t; s.position.copy(v3(g.x + Math.cos(a) * raio * 1.3, f * alt * 0.9, g.z + Math.sin(a) * raio * 1.3)); s.scale.setScalar(0.12 + 0.1 * Math.sin(i)); s.material.opacity = 0.9 * Math.sin(Math.PI * f) * k; s.visible = k > 0.05; });
        Rz.terra.forEach((tr, i) => { const f = cl(k * 2.5 - i * 0.04), y = Math.max(0, f * 1.6 - f * f * 1.8) * 0.4 / alt; tr.t.position.set(Math.cos(tr.a) * (1.1 + f * 0.6 * tr.v) * 0.45 / raio * raio, y, Math.sin(tr.a) * (1.1 + f * 0.6 * tr.v) * 0.45 / raio * raio); tr.t.visible = f > 0 && f < 1; });
      }
      if (g.tipo === 'meteoro' && ix.meteoro < F.meteoros.length) {
        const M = F.meteoros[ix.meteoro++], s = g.s || 0.9, p = v3(g.x, g.y, g.z), d = new T.Vector3(g.dx, g.dy, -g.dz).normalize();
        M.gr.position.copy(p); M.gr.scale.setScalar(s); M.rocha.rotation.set(t * 2.1, t * 1.3, t * 0.7); M.gr.visible = true; M.aura.scale.setScalar(1 + 0.05 * Math.sin(t * 20));
        M.cauda.forEach((sp, i) => { const f = i / M.cauda.length, j = Math.sin(i * 12.9 + t * 9) * 0.25 * f; sp.position.copy(p).addScaledVector(d, -f * 9 * s).add(new T.Vector3(j * s, Math.cos(i * 7.1 + t * 7) * 0.25 * f * s, j * s)); sp.scale.setScalar(s * (2.6 - 1.6 * f) * (0.8 + 0.3 * Math.sin(i * 3 + t * 15))); sp.material.opacity = 0.9 * (1 - f); sp.visible = true; });
        M.fumaca.forEach((sp, i) => { const f = (i + 1) / M.fumaca.length; sp.position.copy(p).addScaledVector(d, -(3 + f * 12) * s); sp.scale.setScalar(s * (2 + f * 4)); sp.material.opacity = 0.4 * (1 - f); sp.visible = true; });
      }
      if (g.tipo === 'explosao' && ix.explosao < F.explosoes.length) {
        const E = F.explosoes[ix.explosao++], k = cl(g.k), s = g.s || 1, y0 = altura(g.x, g.z);
        E.gr.position.set(g.x, y0, -g.z); E.gr.visible = k > 0 && k < 1;
        const e = 1 - Math.pow(1 - k, 3); E.bola.position.y = 0.6 * s; E.bola.scale.set(s * 2.8 * e, s * 2.2 * e, s * 2.8 * e); E.bola.material.opacity = 0.85 * (1 - k); E.bola.material.color.setRGB(1, 0.6 - 0.3 * k, 0.25 - 0.2 * k);
        E.nucleo.position.y = 0.5 * s; E.nucleo.scale.setScalar(s * 1.4 * Math.min(1, k * 5) * (1 - k)); E.nucleo.material.opacity = 1 - k;
        E.anel.position.y = 0.05; E.anel.scale.setScalar(s * (0.5 + 7 * e)); E.anel.material.opacity = 0.9 * (1 - k);
        E.fogo.forEach((sp, i) => { const a = i * 2.39, el = (i % 7) / 7, v = (0.6 + (i % 5) * 0.25) * s * 3.2 * e; sp.position.set(g.x + Math.cos(a) * v * (1 - el * 0.5), y0 + 0.3 + el * v * 0.9 + k * 0.8, -(g.z + Math.sin(a) * v * (1 - el * 0.5))); sp.scale.setScalar(s * (1.8 - k) * (0.7 + (i % 3) * 0.3)); sp.material.opacity = (1 - k) * 0.9; sp.visible = k > 0 && k < 1; });
        E.pedras.forEach((pd, i) => { const tt = k * 1.4; pd.p.position.set(g.x + Math.cos(pd.a) * pd.v * tt * s, y0 + Math.max(0, pd.up * tt - 9.8 * tt * tt * 0.5 * 1.2) * s, -(g.z + Math.sin(pd.a) * pd.v * tt * s)); pd.p.rotation.set(tt * 9 + i, tt * 7, i); pd.p.visible = k > 0 && k < 1; });
      }
      if (g.tipo === 'pixels' && ix.pixels < F.pixels.length) {
        const P = F.pixels[ix.pixels++], k = cl(g.k), alt = g.alt || 1.8, cor = new T.Color(g.cor || '#9FE8FF');
        P.im.visible = k > 0 && k < 1; P.im.material.color.copy(cor);
        P.sem.forEach(([a, b, c, e], i) => { const tt = cl((k - b * 0.45) / 0.55), y = (0.05 + c * 0.95) * alt + tt * (1.5 + e * 2.5), r = 0.25 * (1 - c * 0.4) + tt * 0.35 * a; const ang = a * 6.28 + tt * 2; o.position.set(g.x + Math.cos(ang) * r, y, -(g.z + Math.sin(ang) * r)); o.rotation.set(tt * 4 + i, tt * 3, 0); o.scale.setScalar((0.05 + e * 0.07) * (tt > 0 ? 1 - tt * 0.7 : 0.0001)); o.updateMatrix(); P.im.setMatrixAt(i, o.matrix); });
        P.im.instanceMatrix.needsUpdate = true; P.im.material.opacity = 1;
        P.raio.visible = k > 0 && k < 1; P.raio.position.set(g.x, altura(g.x, g.z) + alt * 1.5, -g.z); P.raio.scale.set(1 + k * 0.4, alt * 3, 1 + k * 0.4); P.raio.material.opacity = 0.32 * Math.sin(Math.PI * k); P.raio.material.color.copy(cor);
      }
    }
    for (const g of lista) {
      if (!g || g.tipo !== 'onda' || ix.onda >= F.ondas.length) continue;
      const O = F.ondas[ix.onda++], k = cl(g.k), s = g.s || 1, cor = new T.Color(g.cor || '#FFE2B0');
      O.gr.position.set(g.x, altura(g.x, g.z) + 0.04, -g.z); O.gr.visible = k > 0 && k < 1;
      O.aneis.forEach((a, i) => { const kk = cl((k - i * 0.12) / 0.75), e = 1 - Math.pow(1 - kk, 2.5), R0 = s * (0.2 + 3.2 * e); a.scale.set(R0, 1, R0); a.material.color.copy(cor); a.material.opacity = kk > 0 ? 0.75 * (1 - kk) * (1 - i * 0.2) : 0; a.visible = kk > 0 && kk < 1; });
      O.brilho.scale.setScalar(s * 2.6 * (0.5 + k)); O.brilho.material.color.copy(cor); O.brilho.material.opacity = 0.55 * (1 - k) * (1 - k);
    }
    for (; ix.onda < F.ondas.length; ix.onda++) F.ondas[ix.onda].gr.visible = false;
    // o que não foi usado neste quadro fica escondido
    for (; ix.flecha < F.flechas.length; ix.flecha++) F.flechas[ix.flecha].gr.visible = false;
    for (; ix.gelo < F.gelos.length; ix.gelo++) { F.gelos[ix.gelo].gr.visible = false; F.gelos[ix.gelo].nevoa.forEach((s) => (s.visible = false)); }
    for (; ix.raizes < F.raizes.length; ix.raizes++) { F.raizes[ix.raizes].gr.visible = false; F.raizes[ix.raizes].brilhos.forEach((s) => (s.visible = false)); }
    for (; ix.meteoro < F.meteoros.length; ix.meteoro++) { const M = F.meteoros[ix.meteoro]; M.gr.visible = false; M.cauda.forEach((s) => (s.visible = false)); M.fumaca.forEach((s) => (s.visible = false)); }
    for (; ix.explosao < F.explosoes.length; ix.explosao++) { const E = F.explosoes[ix.explosao]; E.gr.visible = false; E.fogo.forEach((s) => (s.visible = false)); E.pedras.forEach((p) => (p.p.visible = false)); }
    for (; ix.rede < F.redes.length; ix.rede++) { F.redes[ix.rede].gr.visible = false; F.redes[ix.rede].cordaL.visible = false; }
    for (; ix.pixels < F.pixels.length; ix.pixels++) { F.pixels[ix.pixels].im.visible = false; F.pixels[ix.pixels].raio.visible = false; }
  }

  // posiciona a câmera do three igual à câmera do motor (inclusive o horizonte fora do centro)
  function ajustaCamera(cam, near, far) {
    const c = R.camera, f = cam.f, cx = cam.cx || W / 2, cy = cam.cy || H / 2;
    c.position.set(cam.x, cam.y, -cam.z); c.rotation.set(0, -(cam.yaw || 0), 0, 'YXZ'); c.updateMatrixWorld(true);
    c.near = near; c.far = far;
    c.projectionMatrix.makePerspective((-cx / f) * near, ((W - cx) / f) * near, (cy / f) * near, (-(H - cy) / f) * near, near, far);
    c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  }
  const horaDe = (o) => (o.dia ? 0 : 1 + (o.noite === undefined ? 1 : o.noite));
  function dirLua(h) { const el = lerp(0.1, (R && R.luaEl) || 0.55, suave(1.0, 1.85, h)); return new THREE.Vector3((R && R.luaX !== undefined) ? R.luaX : -0.32, el, -1).normalize(); }
  function dirSol(h) { const el = lerp((R && R.solEl) || 0.62, 0.06, suave(0, 1.15, h)); return new THREE.Vector3((R && R.solX !== undefined) ? R.solX : 0.32, el, -1).normalize(); }

  function atualizar(cam, o) {
    const t = o.t || 0, h = horaDe(o), noite = suave(1.0, 1.9, h), T = THREE;
    R.uni.uTempo.value = t; R.uni.uNoite.value = noite;
    R.ceuMat.uniforms.topo.value.copy(pal('ceuTopo', h)); R.ceuMat.uniforms.hz.value.copy(pal('ceuHz', h)); R.ceuMat.uniforms.baixo.value.copy(pal('ceuBaixo', h));
    R.cena.fog.color.copy(pal('nevoa', h)); R.cena.fog.near = num(R.nevoaPerto || nevoaPerto, h); R.cena.fog.far = num(R.nevoaLonge || nevoaLonge, h);
    R.hemi.color.copy(pal('hemiCeu', h)); R.hemi.groundColor.copy(pal('hemiChao', h)); R.hemi.intensity = num(R.forcaHemi || forcaHemi, h);
    // luz principal: sol de dia → lua de noite (troca no pôr do sol)
    const dl = dirLua(h), ds = dirSol(h), k = suave(1.25, 1.6, h), dls = new THREE.Vector3(dl.x * 0.6, Math.max(dl.y, 0.7), dl.z).normalize(), d = ds.clone().lerp(dls, k).normalize();
    R.dir.color.copy(pal('sol', h)); R.dir.intensity = num(R.forcaSol || forcaSol, h) * (1 - 0.55 * Math.sin(Math.PI * k));
    const fx = cam.x + Math.sin(cam.yaw || 0) * 9, fz = cam.z + Math.cos(cam.yaw || 0) * 9;
    R.dir.target.position.set(fx, 0, -fz); R.dir.position.set(fx + d.x * 60, d.y * 60, -fz + d.z * 60); R.dir.target.updateMatrixWorld();
    // céu, lua, sol, estrelas
    R.grupoCeu.position.set(cam.x, cam.y, -cam.z);
    R.lua.position.copy(dl).multiplyScalar(600); R.lua.material.opacity = suave(1.1, 1.6, h);
    R.sol.position.copy(ds).multiplyScalar(600); R.sol.material.opacity = 1 - suave(1.0, 1.4, h);
    // emissivos que acendem à noite
    if (R.janelaMat) { R.runasMat.opacity = 0.25 + 0.75 * noite * (0.75 + 0.25 * Math.sin(t * 2)); R.janelaMat.opacity = 0.2 + 0.8 * noite; R.florMat.opacity = 0.15 + 0.85 * noite; }
    if (R.aguaNorm) R.aguaNorm.offset.set(t * 0.03, t * 0.015);
    if (R.aguaMat) R.aguaMat.color.copy(new T.Color('#4A80B8').lerp(new T.Color('#E09A88'), suave(0.5, 1, h) * (1 - suave(1.2, 1.7, h))).lerp(new T.Color('#1C2C66'), noite));
    { const o = new T.Object3D(), cx = cam.x, cz = cam.z, tom = new T.Color(1, 1, 1).lerp(new T.Color('#55628E'), 0.62 * noite); for (const m of R.arvores) { m.material.color.copy(tom); m.userData.arv.forEach(([x, y, z, s], i) => { o.position.set(x, y, -z); o.rotation.set(0, Math.atan2(cx - x, -(cz - z)), 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.instanceMatrix.needsUpdate = true; } }
    atualizaMagia(o.magias || [], t);
    if (o.fx !== undefined) atualizaFx(o.fx, t);
    for (const n of R.nevoas) { const x = ((n.x + t * n.v + 30) % 60 + 60) % 60 - 30; n.s.position.x = x; n.s.material.opacity = 0.05 + 0.13 * noite; n.s.material.color.set(noite > 0.5 ? 0x96aae6 : (R.nevoaCor ? R.nevoaCor[0] : 0xf0c8b0)); }
    // tochas: acendem no pôr do sol; as 9 luzes vão para as tochas mais perto do que a câmera vê + luzes extras do plano
    const acesa = R.sempreAcesa ? 1 : suave(1.15, 1.7, h), extras = [...(o.magias || []).filter((g) => g.k > 0.02).map((g) => ({ x: g.x, y: g.tipo === 'circulo' ? 0.7 : g.y, z: g.z, cor: g.cor || '#4E9CFF', forca: (g.tipo === 'circulo' ? 1.4 : 0.9) * g.k, raio: g.tipo === 'circulo' ? 6 : 3.5 })), ...(o.luzes || []), ...(R.luzesFixas || [])].slice(0, 6);
    const lista = R.chamas.map((c) => ({ c, d: Math.hypot(c.x - fx, c.z - fz) })).sort((a, b) => a.d - b.d);
    for (const { c } of lista) { const fl = 0.85 + 0.15 * Math.sin(t * 13 + c.i * 2) * Math.sin(t * 7.3 + c.i); c.ch.scale.set(0.34 * fl * acesa, 0.62 * (0.9 + 0.2 * Math.sin(t * 11 + c.i)) * acesa, 1); c.br.material.opacity = 0.55 * acesa * fl; c.br.visible = acesa > 0.01; c.ch.visible = acesa > 0.01; c.fl = fl; }
    let li = 0;
    for (const e of extras) { const p = R.pontos[li++]; p.position.set(e.x, e.y === undefined ? 1.6 : e.y, -e.z); p.color.set(e.cor || '#FFA050'); p.intensity = 5.5 * (e.forca === undefined ? 1 : e.forca); p.distance = e.raio || 9; }
    for (const { c } of lista) { if (li >= R.pontos.length) break; const p = R.pontos[li++]; p.position.set(c.x, c.y + 0.1, -c.z); p.color.set('#FFB066'); p.intensity = 5 * acesa * c.fl; p.distance = 10; }
    if (R.cristais) {
      // cristais: halo e brilho próprio acendem com a noite; as luzes que sobraram iluminam a parede em volta dos mais perto
      R.runasMat.emissiveIntensity = 0.55 + 1.9 * noite;
      for (const c of R.cristais) { const p = 0.8 + 0.2 * Math.sin(t * 1.7 + c.f); c.sp.material.opacity = (0.04 + 0.5 * noite) * p; c.sp.scale.set(c.w * p, c.w * p, 1); }
      if (noite > 0.05) { const perto = R.cristais.map((c) => ({ c, d: Math.hypot(c.x - fx, c.z - fz) })).sort((a, b) => a.d - b.d); for (const { c } of perto) { if (li >= R.pontos.length) break; const p = R.pontos[li++]; p.position.set(c.x, c.y, -c.z); p.color.set('#9ADCFF'); p.intensity = 3.0 * noite * (0.85 + 0.15 * Math.sin(t * 1.7 + c.f)); p.distance = 7; } }
    }
    if (R.tochasBorda) {
      // o.borda = { n: 0..1 (quantas tochas já apareceram), desce: 0..1 (quanto já desceram pela corda) }
      const b = o.borda || { n: 0, desce: 0 };
      for (const tc of R.tochasBorda) {
        const vis = suave(tc.lim, tc.lim + 0.06, b.n || 0); tc.g.visible = tc.cd.visible = vis > 0.01; if (!tc.g.visible) continue;
        const ds = Math.max(0, Math.min(1, ((b.desce || 0) - tc.atraso) / (1 - tc.atraso))), yt = CAN_ALT + 0.6, y = lerp(yt, 1.3, ds * ds * (3 - 2 * ds));
        const xt = canParede(tc.z, tc.lado, CAN_ALT) - tc.lado * 0.4, x = ds > 0 ? canParede(tc.z, tc.lado, y) - tc.lado * 0.7 : xt, fl = 0.85 + 0.15 * Math.sin(t * 13 + tc.f) * Math.sin(t * 7 + tc.f);
        tc.g.position.set(x, y, -tc.z); tc.ch.scale.set(0.5 * fl * vis, 0.9 * fl * vis, 1); tc.br.scale.set(2.4 * vis, 2.4 * vis, 1); tc.br.material.opacity = 0.55 * vis * fl;
        if (ds > 0) { const dx = xt - x, dy = yt - y; tc.cd.position.set((x + xt) / 2, (y + yt) / 2 + 0.3, -tc.z); tc.cd.scale.set(1, Math.hypot(dx, dy), 1); tc.cd.rotation.set(0, 0, -Math.atan2(dx, dy)); } else tc.cd.visible = false;
      }
    }
    for (; li < R.pontos.length; li++) R.pontos[li].intensity = 0;
    return { h, noite, acesa, dl };
  }

  // personagens 2D dentro do 3D: cada recorte vira uma placa em pé, virada para a câmera, na profundidade dos pés.
  // A grama da frente passa na frente das pernas (teste de profundidade) e a luz (sol/lua) projeta a sombra da silhueta.
  function figuras3d(lista, cam) {
    const T = THREE, yaw = cam.yaw || 0, co = Math.cos(yaw), si = Math.sin(yaw), f = cam.f, cx = cam.cx || W / 2, cy = cam.cy || H / 2;
    const mundo = (sx, sy, dz) => { const xr = ((sx - cx) * dz) / f, yr = ((cy - sy) * dz) / f; return new T.Vector3(cam.x + xr * co + dz * si, cam.y + yr, -(cam.z - xr * si + dz * co)); };
    lista.forEach((fg, i) => {
      let m = R.figPool[i];
      if (!m) {
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(12), 3)); g.setAttribute('uv', new T.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2)); g.setIndex([0, 2, 1, 1, 2, 3]);
        const vazio = new T.DataTexture(new Uint8Array(4), 1, 1); vazio.needsUpdate = true;
        const mat = new T.MeshBasicMaterial({ map: vazio, transparent: true, alphaTest: 0.35, depthWrite: false, toneMapped: false, fog: false, side: T.DoubleSide });
        m = new T.Mesh(g, mat); m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: vazio, alphaTest: 0.5, side: T.DoubleSide });
        m.frustumCulled = false; R.cena.add(m); R.figPool[i] = m;
      }
      const velha = m.material.map; const tex = new T.CanvasTexture(fg.canvas); tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter;
      m.material.map = tex; m.customDepthMaterial.map = tex; if (velha && velha.isCanvasTexture) velha.dispose();
      const dz = fg.dz, c = [mundo(fg.x0, fg.y0, dz), mundo(fg.x0 + fg.w, fg.y0, dz), mundo(fg.x0, fg.y0 + fg.h, dz), mundo(fg.x0 + fg.w, fg.y0 + fg.h, dz)];
      const centro = c[0].clone().add(c[3]).multiplyScalar(0.5), pos = m.geometry.attributes.position;
      c.forEach((v, k) => pos.setXYZ(k, v.x - centro.x, v.y - centro.y, v.z - centro.z)); pos.needsUpdate = true; m.geometry.computeBoundingSphere();
      m.position.copy(centro); m.castShadow = fg.sombra !== false; m.visible = true;
    });
    for (let i = lista.length; i < R.figPool.length; i++) R.figPool[i].visible = false;
    // sombra de contato (oclusão) no chão, embaixo dos pés: a grama da frente passa por cima dela
    const comPe = lista.filter((fg) => fg.X !== undefined && fg.sombra !== false);
    comPe.forEach((fg, i) => {
      let d = R.contatoPool[i];
      if (!d) {
        if (!texContato) texContato = textura(tela(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }));
        d = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: texContato, transparent: true, depthWrite: false, opacity: 0.55, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -4 }));
        d.renderOrder = 1; R.cena.add(d); R.contatoPool[i] = d;
      }
      const a = fg.alt || 1.8, y = fg.y || 0; d.position.set(fg.X, (R.altura || altura)(fg.X, fg.Z) + ((R.naTrilha || naTrilha)(fg.X, fg.Z, 0.15) ? 0.09 : 0.02), -fg.Z); d.scale.set(a * 0.42, 1, a * 0.26); d.material.opacity = 0.55 / (1 + y * 2.5); d.visible = true;
    });
    for (let i = comPe.length; i < R.contatoPool.length; i++) R.contatoPool[i].visible = false;
  }
  let texContato = null;

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
    trilhaX, trilhaW, rioZ, RIO, PONTE, altura, canX, canParede, CAN_PONTE, CAN_ALT, CAN_ROCHA, MAS,
    nevoa: (n = 1, dia = false, mundo) => { const mm = mundo || window.MUNDO_3D, A = (mm === 'canion' ? PAL_CANION : mm === 'masmorra' ? PAL_MASMORRA : PAL).nevoa, h = dia ? 0 : 1 + n, i = Math.min(1, Math.floor(h)), k = h - i; return hex(new THREE.Color(A[i]).lerp(new THREE.Color(A[Math.min(2, i + 1)]), k)); },
    // ponto da tela (px) na profundidade dz (m) da câmera → mundo { x, y, z }
    paraMundo(cam, sx, sy, dz) { const yaw = cam.yaw || 0, co = Math.cos(yaw), si = Math.sin(yaw), xr = ((sx - (cam.cx || W / 2)) * dz) / cam.f, yr = (((cam.cy || H / 2) - sy) * dz) / cam.f; return { x: cam.x + xr * co + dz * si, y: cam.y + yr, z: cam.z - xr * si + dz * co }; },
    // fundo: renderiza tudo que está além de `perto` metros da câmera
    desenhar(ctx, cam, o = {}) {
      usar(o);
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
      usar(o);
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
      usar(o);
      const st = o.st || atualizar(cam, o), t = o.t || 0, n = st.noite;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      // raios de sol entrando pelo cânion (de dia e no pôr do sol), saindo do ponto do sol na tela
      if (R.raiosSol && n < 0.6) {
        const ds = dirSol(st.h), S = cam.p(cam.x + ds.x * 500, cam.y + ds.y * 500, cam.z - ds.z * 500), a0 = (1 - n) * (o.raios === undefined ? 1 : o.raios);
        if (!S.atras) {
          ctx.globalCompositeOperation = 'screen';
          const g0 = ctx.createRadialGradient(S.x, S.y, 0, S.x, S.y, 900); g0.addColorStop(0, `rgba(255,220,160,${0.35 * a0})`); g0.addColorStop(1, 'rgba(255,200,140,0)'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 7; i++) {
            const ang = Math.PI / 2 + (i - 3) * 0.16 + 0.03 * Math.sin(t * 0.3 + i), len = 2600, larg = 0.035 + 0.02 * ((i * 7) % 3), a = (0.06 + 0.03 * Math.sin(t * 0.5 + i * 1.7)) * a0;
            const g = ctx.createLinearGradient(S.x, S.y, S.x + Math.cos(ang) * len, S.y + Math.sin(ang) * len); g.addColorStop(0, `rgba(255,214,150,${a})`); g.addColorStop(1, 'rgba(255,214,150,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(S.x + Math.cos(ang - larg) * len, S.y + Math.sin(ang - larg) * len); ctx.lineTo(S.x + Math.cos(ang + larg) * len, S.y + Math.sin(ang + larg) * len); ctx.closePath(); ctx.fill();
          }
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      const d = st.dl, L = cam.p(cam.x + d.x * 500, cam.y + d.y * 500, cam.z - d.z * 500);
      if (!L.atras && n > 0.3 && !R.semRaiosLua) {
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

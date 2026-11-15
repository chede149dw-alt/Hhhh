// TERRA 3D — caverna de cristais e túnel da escada em WebGL de verdade (three.js r160), para a Parte 2 da Terra.
// Mesmo esquema do Valdor3D: a câmera do three é montada igual à do motor (cam.p() bate com o 3D) e os personagens
// 2D viram placas em pé dentro do 3D (com sombra no chão). Tudo o que é "efeito" aqui é 3D: coração de pedra com
// rachaduras acesas e luz real, pedras orbitando em profundidade, onda de pulso, cristais emissivos que iluminam a
// cena, rio de luz, poeira brilhante, muro de pedra subindo, escada do túnel com veios acesos.
//
//   Terra3D.cena(ctx, api, cam, entradas, o)   monta o quadro (como a noite() do VALDOR):
//     entradas: [{ f: () => api.personagem3d(cam, item, X, Z, alt, opts) }]  — cada uma vira placa no 3D
//     o = { t, pulso: 0..1 (batida do coração), nucleo: false (esconde), muro: { x, z, larg, sobe, racha },
//           luzes: [{ x, y, z, cor, forca, raio }], bokeh: px (fundo além do foco, padrão 4), depois: () => {...} 2D por cima }
//   Terra3D.pontos (caverna): nucleo [x,y,z], pintura [x,z], entrada [x,z]; Terra3D.rio(z) → x do rio
//   Terra3D.escada: degrau(i) → {x,y,z}, yEm(z), X0 (deslocamento do túnel no mundo)
(function () {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const lerp = (a, b, k) => a + (b - a) * k;
  function rng(s) { let x = (s * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function ruido(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); }
  const fbm = (x, y) => ruido(x, y) * 0.5 + ruido(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + ruido(x * 4.3 + 9.1, y * 4.3 + 7.7) * 0.2;

  // ---------- lugar (mesmas medidas da caverna em canvas) ----------
  const CX = 0, CZ = 9, R0 = 13, TETO = 9;
  const raioParede = (a) => R0 * (1 + 0.08 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 11 + 3));
  const PINTURA_ANG = Math.PI * 1.08;
  const rio = (z) => 2.6 * Math.sin(z * 0.35 + 0.6) - 1.0;
  const NUCLEO = [0, 2.5, 11.5];
  const X0 = 60, PZ = 0.34, PY = 0.23, LX = 1.25, PX = 1.7; // túnel da escada (em x = 60)
  const degrau = (i) => ({ x: X0, y: -i * PY, z: i * PZ });
  const yEm = (z) => -(z / PZ) * PY;

  // ---------- texturas ----------
  function tela(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
  function textura(c, rep) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.repeat.set(rep[0], rep[1]); return t; }
  function texRocha(base, seed) {
    return tela(512, 512, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(seed);
      for (let i = 0; i < 2600; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 14, k = r(); g.fillStyle = k < 0.5 ? `rgba(20,12,30,${0.05 + r() * 0.1})` : `rgba(255,240,230,${0.03 + r() * 0.06})`; g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * 3, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(15,8,20,0.16)'; g.lineWidth = 2;
      for (let i = 0; i < 40; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
    });
  }
  // rachaduras (Voronoi) para o coração de pedra: preto com linhas brancas → emissiveMap
  function texRachaduras(seed) {
    return tela(1024, 512, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const r = rng(seed), pts = [];
      for (let i = 0; i < 70; i++) pts.push([r() * w, r() * h]);
      const img = g.getImageData(0, 0, w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let a = 1e9, b = 1e9;
        for (const [px, py] of pts) { let dx = Math.abs(x - px); dx = Math.min(dx, w - dx); const q = dx * dx + (y - py) * (y - py); if (q < a) { b = a; a = q; } else if (q < b) b = q; }
        const borda = Math.sqrt(b) - Math.sqrt(a), v = borda < 2.2 ? 255 : borda < 6 ? 255 * (1 - (borda - 2.2) / 3.8) * 0.45 : 0;
        const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    });
  }
  function texBrilho(cor) { return tela(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, `rgba(${cor},1)`); gr.addColorStop(0.25, `rgba(${cor},0.45)`); gr.addColorStop(1, `rgba(${cor},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, w); }); }
  function texPinturas() {
    return tela(1200, 640, (g, w, h) => {
      g.fillStyle = '#5A4A52'; g.fillRect(0, 0, w, h);
      const r = rng(5); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '30,20,30' : '230,210,200'},${0.04 + r() * 0.06})`; g.fillRect(r() * w, r() * h, 3 + r() * 9, 2 + r() * 6); }
      g.lineCap = 'round'; g.lineJoin = 'round';
      const oc = 'rgba(222,150,80,0.95)';
      const crianca = (cx) => { g.strokeStyle = oc; g.lineWidth = 9; g.beginPath(); g.arc(cx, 190, 26, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(cx, 216); g.lineTo(cx, 360); g.moveTo(cx, 255); g.lineTo(cx - 40, 300); g.moveTo(cx, 255); g.lineTo(cx + 46, 225); g.moveTo(cx, 360); g.lineTo(cx - 30, 450); g.moveTo(cx, 360); g.lineTo(cx + 30, 450); g.stroke(); };
      const sim = [
        (x, y) => { g.moveTo(x, y - 44); g.lineTo(x + 36, y); g.lineTo(x, y + 44); g.lineTo(x - 36, y); g.closePath(); g.moveTo(x - 22, y + 6); g.lineTo(x - 6, y - 18); g.lineTo(x + 22, y + 6); },
        (x, y) => { for (let k = 0; k < 3; k++) { g.moveTo(x - 40, y - 22 + k * 22); g.quadraticCurveTo(x - 20, y - 40 + k * 22, x, y - 22 + k * 22); g.quadraticCurveTo(x + 20, y - 4 + k * 22, x + 40, y - 22 + k * 22); } },
        (x, y) => { g.moveTo(x, y + 40); g.quadraticCurveTo(x - 46, y, x - 8, y - 50); g.quadraticCurveTo(x, y - 14, x + 22, y - 30); g.quadraticCurveTo(x + 40, y + 16, x, y + 40); },
        (x, y) => { g.moveTo(x, y); for (let k = 0; k < 30; k++) { const a = k * 0.45, rr = 3 + k * 1.5; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } },
      ];
      const cores = ['255,170,70', '110,190,255', '255,90,60', '205,232,255'];
      [150, 450, 750, 1050].forEach((cx, i) => {
        crianca(cx);
        g.save(); g.shadowColor = `rgba(${cores[i]},1)`; g.shadowBlur = 30; g.strokeStyle = `rgba(${cores[i]},1)`; g.lineWidth = 10; g.beginPath(); sim[i](cx + 100, 200); g.stroke(); g.restore();
      });
      g.strokeStyle = 'rgba(160,80,50,0.8)'; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 480); g.lineTo(w - 40, 480); g.stroke();
    });
  }

  // ---------- montagem do mundo ----------
  let R = null, ladosTunel = null;
  function deformar(geo, f) { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); f(v, i); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; }
  function montar() {
    const T = THREE, r = rng(77);
    const canvas = document.createElement('canvas');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    const esc = 0.85; renderer.setPixelRatio(1); renderer.setSize(Math.round(W * esc), Math.round(H * esc), false);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    const cena = new T.Scene(); cena.fog = new T.Fog(0x2c2036, 20, 65); cena.background = new T.Color(0x1c1424);
    const camera = new T.PerspectiveCamera(60, W / H, 0.05, 300);
    const uni = { uTempo: { value: 0 } };
    const rocha = textura(texRocha('#7A6A84', 3), [14, 5]), rocha2 = textura(texRocha('#6E6466', 9), [3, 3]);
    const std = (o) => new T.MeshStandardMaterial({ roughness: 0.92, metalness: 0.0, flatShading: true, ...o });

    // luz ambiente roxa bem baixa + luz do núcleo (holofote que faz sombra) + luz pontual do núcleo + cristais
    const hemi = new T.HemisphereLight(0xb0a0d0, 0x2c2434, 1.25); cena.add(hemi);
    // luz que entra por uma fenda no teto: é ela que faz as sombras bem marcadas no chão (personagens, golem, muro, cristais)
    const sol = new T.DirectionalLight(0xffe0b8, 3.2); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 0.5, far: 60 }); sol.shadow.bias = -0.0008; sol.shadow.normalBias = 0.03; sol.shadow.radius = 3;
    cena.add(sol); cena.add(sol.target);
    const spot = new T.SpotLight(0xffa050, 20, 40, Math.PI * 0.42, 0.6, 1.4); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0006; spot.shadow.camera.near = 0.5; spot.shadow.camera.far = 40;
    spot.position.set(NUCLEO[0], NUCLEO[1] + 0.4, -NUCLEO[2]); cena.add(spot); cena.add(spot.target);
    const nucleoLuz = new T.PointLight(0xff8a3a, 40, 22, 1.6); nucleoLuz.position.set(NUCLEO[0], NUCLEO[1], -NUCLEO[2]); cena.add(nucleoLuz);
    const pontos = []; for (let i = 0; i < 4; i++) { const p = new T.PointLight(0xff9a40, 0, 8, 1.8); cena.add(p); pontos.push(p); }

    // ===== caverna =====
    const domo = deformar(new T.SphereGeometry(1, 160, 64, 0, TAU, 0, Math.PI / 2), (v) => {
      const a = Math.atan2(v.z, v.x), k = raioParede(a) / R0, n = 1 + 0.16 * (fbm(a * 3 + 2, v.y * 4) - 0.5) + 0.09 * (fbm(a * 14 + 7, v.y * 16) - 0.5);
      v.set(v.x * R0 * k * n, v.y * TETO * (0.92 + 0.16 * fbm(v.x * 3, v.z * 3)), v.z * R0 * k * n);
    });
    // cor de rocha por vértice: manchas grandes, camadas (estratos) e a base mais escura, para a parede não parecer céu
    { const p = domo.attributes.position, cor = new Float32Array(p.count * 3), base = new T.Color(0xb8a2c4), escura = new T.Color(0x5a4660), quente = new T.Color(0xc89a8a), c = new T.Color();
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
        const m = fbm(a * 5 + 1, y * 0.5), estr = 0.5 + 0.5 * Math.sin(y * 3.1 + fbm(a * 8, y) * 3), k = Math.min(1, Math.max(0, 0.15 + 0.85 * m * 1.3 - 0.25 * estr));
        c.copy(escura).lerp(base, k); if (y < 2.5) c.lerp(quente, 0.25 * (1 - y / 2.5)); cor.set([c.r, c.g, c.b], i * 3); }
      domo.setAttribute('color', new T.BufferAttribute(cor, 3)); }
    const domoM = new T.Mesh(domo, std({ map: rocha, color: 0xffffff, vertexColors: true, side: T.BackSide })); domoM.position.set(CX, 0, -CZ); domoM.receiveShadow = true; cena.add(domoM);
    const chaoG = deformar(new T.CircleGeometry(R0 * 1.12, 96, 0, TAU).rotateX(-Math.PI / 2), (v) => { v.y = (fbm(v.x * 0.6 + 10, v.z * 0.6) - 0.5) * 0.12 * Math.min(1, Math.hypot(v.x, v.z) / 6); });
    const chao = new T.Mesh(chaoG, std({ map: rocha2, color: 0xa69a9a, flatShading: false })); chao.position.set(CX, 0, -CZ); chao.receiveShadow = true; cena.add(chao);
    // estalactites e estalagmites
    { const g = new T.ConeGeometry(1, 1, 7, 1), n = 70, m = new T.InstancedMesh(g, std({ map: rocha, color: 0x8a7894 }), n), o = new T.Object3D();
      for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 0.9, x = CX + Math.cos(a) * R0 * d, z = CZ + Math.sin(a) * R0 * d, teto = TETO * Math.sqrt(Math.max(0.05, 1 - d * d)) * 0.95, h = 0.8 + r() * 2.6, w = 0.18 + r() * 0.35;
        o.position.set(x, teto - h / 2, -z); o.rotation.set(Math.PI, r() * 3, 0); o.scale.set(w, h, w); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
      m.castShadow = true; cena.add(m);
      const m2 = new T.InstancedMesh(g, std({ map: rocha, color: 0x7a6a80 }), 26);
      for (let i = 0; i < 26; i++) { const a = r() * TAU, d = 0.62 + r() * 0.3, x = CX + Math.cos(a) * R0 * d, z = CZ + Math.sin(a) * R0 * d, h = 0.6 + r() * 1.8, w = 0.25 + r() * 0.4; o.position.set(x, h / 2, -z); o.rotation.set(0, r() * 3, 0); o.scale.set(w, h, w); o.updateMatrix(); m2.setMatrixAt(i, o.matrix); }
      m2.castShadow = true; m2.receiveShadow = true; cena.add(m2); }
    // seixos e pedras soltas
    { const g = new T.DodecahedronGeometry(1, 0), n = 160, m = new T.InstancedMesh(g, std({ map: rocha, color: 0x9a8a9a }), n), o = new T.Object3D();
      for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 0.95, s = 0.05 + Math.pow(r(), 3) * 0.45; const x = CX + Math.cos(a) * R0 * d, z = CZ + Math.sin(a) * R0 * d; if (Math.abs(x - rio(z)) < 0.9) continue; o.position.set(x, s * 0.35, -z); o.rotation.set(r() * 3, r() * 3, r() * 3); o.scale.set(s, s * 0.7, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
      m.castShadow = true; m.receiveShadow = true; cena.add(m); }
    // cristais emissivos (cachos)
    const cristalMat = std({ color: 0xffb070, emissive: 0xff6a18, emissiveIntensity: 1.3, roughness: 0.25, metalness: 0.1, flatShading: true });
    const geoCristal = (() => { const a = new T.CylinderGeometry(0.11, 0.14, 0.8, 6, 1), b = new T.ConeGeometry(0.11, 0.3, 6, 1); a.translate(0, 0.4, 0); b.translate(0, 0.95, 0); const pa = a.toNonIndexed(), pb = b.toNonIndexed(); const pos = new Float32Array(pa.attributes.position.array.length + pb.attributes.position.array.length); pos.set(pa.attributes.position.array, 0); pos.set(pb.attributes.position.array, pa.attributes.position.array.length); const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; })();
    const cachos = [];
    for (let i = 0; i < 26; i++) { const a = r() * TAU, d = 0.72 + r() * 0.24; cachos.push([CX + Math.cos(a) * raioParede(a) * d, CZ + Math.sin(a) * raioParede(a) * d, 0.7 + r() * 1.8]); }
    for (const c of [[-4.6, 10.4, 1.1], [6.2, 8.6, 1.3], [2.4, 13.8, 1.6], [-4.4, 13, 1.2], [5.5, 10.5, 1.0], [-1.6, 14.4, 1.4]]) cachos.push(c);
    for (let i = cachos.length - 1; i >= 0; i--) if (Math.hypot(cachos[i][0] - 5.5, cachos[i][1] - 1.5) < 3.2 || Math.hypot(cachos[i][0] + 2.5, cachos[i][1] - 3.4) < 2.5 || Math.hypot(cachos[i][0] + 9.0, cachos[i][1] - 6.7) < 3.2 || Math.hypot(cachos[i][0] + 6.0, cachos[i][1] - 7.4) < 2.6) cachos.splice(i, 1);
    const brilhoTex = textura(texBrilho('255,150,60'));
    { const total = cachos.length * 6, m = new T.InstancedMesh(geoCristal, cristalMat, total), o = new T.Object3D(); let k = 0;
      for (const [x, z, s] of cachos) { const n = 3 + Math.floor(r() * 4); for (let j = 0; j < n && k < total; j++, k++) { o.position.set(x + (r() - 0.5) * s * 0.6, 0, -(z + (r() - 0.5) * s * 0.5)); o.rotation.set((r() - 0.5) * 0.9, r() * 3, (r() - 0.5) * 0.9); const h = s * (0.5 + r() * 0.8); o.scale.set(h * 0.9, h, h * 0.9); o.updateMatrix(); m.setMatrixAt(k, o.matrix); } }
      m.count = k; m.castShadow = true; cena.add(m);
      for (const [x, z, s] of cachos) { const sp = new T.Sprite(new T.SpriteMaterial({ map: brilhoTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55 })); sp.position.set(x, s * 0.5, -z); sp.scale.set(s * 3.2, s * 3.2, 1); cena.add(sp); } }
    // rio de luz
    { const pts = []; for (let z = CZ - R0 * 1.0; z <= CZ + R0 * 1.0; z += 0.3) pts.push([rio(z), z]);
      const pos = [], idx = []; pts.forEach(([x, z], i) => { const w = 0.5 + 0.12 * Math.sin(z * 1.3); pos.push(x - w, 0.03, -z, x + w, 0.03, -z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx);
      const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0xff9a40, toneMapped: false })); cena.add(m);
      for (let i = 0; i < pts.length; i += 6) { const sp = new T.Sprite(new T.SpriteMaterial({ map: brilhoTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.35 })); sp.position.set(pts[i][0], 0.25, -pts[i][1]); sp.scale.set(2.6, 1.4, 1); cena.add(sp); } }
    // mural com as pinturas
    { const pl = new T.Mesh(new T.PlaneGeometry(6.4, 3.4), std({ map: textura(texPinturas()), emissiveMap: textura(texPinturas()), emissive: 0x332216, flatShading: false }));
      const a = PINTURA_ANG, rr = raioParede(a) * 0.9; pl.position.set(CX + Math.cos(a) * rr, 2.6, -(CZ + Math.sin(a) * rr)); pl.lookAt(CX, 2.6, -CZ); pl.receiveShadow = true; cena.add(pl); }
    // pedestal e coração de pedra
    const pedestal = new T.Mesh(deformar(new T.CylinderGeometry(1.1, 1.55, 1.0, 14, 2), (v) => { v.x *= 1 + 0.08 * (hash(v.x * 9, v.z * 9) - 0.5); v.z *= 1 + 0.08 * (hash(v.z * 7, v.x * 5) - 0.5); }), std({ map: rocha, color: 0x8a7894 }));
    pedestal.position.set(NUCLEO[0], 0.5, -NUCLEO[2]); pedestal.castShadow = true; pedestal.receiveShadow = true; cena.add(pedestal);
    const rach = textura(texRachaduras(11)); rach.wrapS = T.RepeatWrapping;
    const nucleoGeo = deformar(new T.SphereGeometry(1.25, 72, 48), (v) => { const n = fbm(v.x * 2.2 + 3, v.y * 2.2 + v.z * 1.7); v.multiplyScalar(1 + (n - 0.5) * 0.18); });
    const nucleoMat = new T.MeshStandardMaterial({ color: 0x6a5450, roughness: 0.85, metalness: 0.05, emissive: 0xff8a2a, emissiveMap: rach, emissiveIntensity: 2.2, flatShading: true });
    const nucleo = new T.Mesh(nucleoGeo, nucleoMat); nucleo.position.set(NUCLEO[0], NUCLEO[1], -NUCLEO[2]); nucleo.castShadow = false; cena.add(nucleo);
    const aura = new T.Sprite(new T.SpriteMaterial({ map: brilhoTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.7 })); aura.position.copy(nucleo.position); aura.scale.set(7, 7, 1); cena.add(aura);
    const orbitam = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), std({ map: rocha, color: 0xb0a0b8 }), 18); orbitam.castShadow = false; cena.add(orbitam);
    const orbDados = Array.from({ length: 18 }, () => ({ a: r() * TAU, d: 1.9 + r() * 0.8, v: 0.25 + r() * 0.4, y: (r() - 0.5) * 1.4, s: 0.1 + r() * 0.16, giro: r() * 3 }));
    const onda = new T.Mesh(new T.TorusGeometry(1, 0.012, 6, 96), new T.MeshBasicMaterial({ color: 0xffc070, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })); onda.position.copy(nucleo.position); cena.add(onda);
    // poeira brilhante no ar
    const poeira = (() => { const n = 220, P = new Float32Array(n * 3), F = new Float32Array(n); for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * R0 * 0.9; P[i * 3] = CX + Math.cos(a) * d; P[i * 3 + 1] = r() * 7; P[i * 3 + 2] = -(CZ + Math.sin(a) * d); F[i] = r() * 10; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('fase', new T.BufferAttribute(F, 1));
      const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: uni,
        vertexShader: 'attribute float fase; uniform float uTempo; varying float vA; void main(){ vec3 p = position; p.y = mod(p.y + uTempo*0.12 + fase, 7.0); p.x += sin(uTempo*0.5+fase)*0.2; vA = 0.4 + 0.6*sin(uTempo*2.0+fase*3.0); vec4 mv = modelViewMatrix*vec4(p,1.0); gl_PointSize = 70.0/(-mv.z); gl_Position = projectionMatrix*mv; }',
        fragmentShader: 'varying float vA; void main(){ float a = smoothstep(0.5,0.0,length(gl_PointCoord-0.5)); gl_FragColor = vec4(1.0,0.7,0.35, a*vA*0.55); }' });
      const pts = new T.Points(g, m); pts.frustumCulled = false; cena.add(pts); return pts; })();
    // muro de pedra (blocos que sobem do chão)
    const muro = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1, 2, 3, 2), std({ map: rocha2, color: 0xa898ac }), 7); muro.castShadow = true; muro.receiveShadow = true; muro.count = 0; cena.add(muro);
    const muroDados = Array.from({ length: 7 }, () => ({ h: 0.82 + r() * 0.32, d: 0.5 + r() * 0.2, atraso: r() * 0.25, giro: (r() - 0.5) * 0.15 }));
    const muroRacha = new T.Mesh(new T.PlaneGeometry(0.5, 1.8), new T.MeshBasicMaterial({ map: textura(tela(64, 256, (g) => { g.strokeStyle = '#ffd59a'; g.shadowColor = '#ff8a30'; g.shadowBlur = 12; g.lineWidth = 6; g.beginPath(); g.moveTo(32, 0); g.lineTo(20, 70); g.lineTo(42, 120); g.lineTo(24, 180); g.lineTo(36, 256); g.stroke(); })), transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    muroRacha.visible = false; cena.add(muroRacha);
    // coluna de pedra que o Lucas lança (sobe do chão inclinada) e pedras que caem do teto quando a caverna treme
    const coluna = new T.Mesh(deformar(new T.CylinderGeometry(0.32, 0.5, 1, 7, 4).translate(0, 0.5, 0), (v) => { v.x *= 1 + 0.12 * (hash(v.y * 9, v.z * 4) - 0.5); v.z *= 1 + 0.12 * (hash(v.x * 5, v.y * 7) - 0.5); }), std({ map: rocha2, color: 0xb4a2a6 }));
    coluna.castShadow = true; coluna.receiveShadow = true; coluna.visible = false; cena.add(coluna);
    const queda = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), std({ map: rocha, color: 0xa894b0 }), 40); queda.castShadow = true; queda.count = 0; cena.add(queda);
    const quedaDados = Array.from({ length: 40 }, () => ({ a: r() * TAU, d: 0.6 + Math.sqrt(r()) * 4.5, atraso: r() * 1.6, s: 0.06 + Math.pow(r(), 2) * 0.22, giro: r() * 6 }));

    // ===== túnel da escada (em x = 60) =====
    const tunel = new T.Group(); cena.add(tunel);
    { const n = 110, mPiso = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), std({ map: rocha2, color: 0x9c8c8c }), n), o = new T.Object3D();
      for (let i = 0; i < n; i++) { const d = degrau(i - 8); o.position.set(X0, d.y - 0.5, -(d.z + PZ / 2)); o.scale.set(LX * 2 + (r() - 0.5) * 0.08, 1, PZ + 0.02); o.rotation.set(0, (r() - 0.5) * 0.03, 0); o.updateMatrix(); mPiso.setMatrixAt(i, o.matrix); }
      mPiso.castShadow = true; mPiso.receiveShadow = true; tunel.add(mPiso);
      // paredes e teto inclinados acompanhando a descida
      const comp = 40, inc = Math.atan2(PY, PZ);
      for (const sx of [-1, 1]) { const pg = deformar(new T.PlaneGeometry(comp, 5, 60, 8), (v) => { v.z += (fbm(v.x * 0.8 + sx * 7, v.y * 0.8) - 0.5) * 0.5; }); const p = new T.Mesh(pg, std({ map: rocha, color: 0x9a8088, side: T.FrontSide }));
        p.rotation.set(0, -sx * Math.PI / 2, 0); p.rotateX(0); const meio = degrau(comp / PZ / 2 - 8); p.position.set(X0 + sx * PX, meio.y + 1.2, -(meio.z)); p.rotateOnAxis(new T.Vector3(1, 0, 0), 0); p.rotation.z = -sx * inc * 0; p.receiveShadow = true;
        // inclina junto com a escada
        p.geometry.applyMatrix4(new T.Matrix4().makeShear(0, 0, 0, 0, 0, 0)); tunel.add(p);
        p.geometry = deformar(p.geometry, (v) => { v.y += (sx > 0 ? v.x : -v.x) * Math.tan(inc); }); }
      const teto = new T.Mesh(deformar(new T.PlaneGeometry(PX * 2 + 0.2, 40, 6, 60).rotateX(Math.PI / 2), (v) => { v.y += (fbm(v.x * 2, v.z * 0.7) - 0.5) * 0.3 + (v.z) * Math.tan(inc); }), std({ map: rocha, color: 0x6a5860, side: T.FrontSide }));
      const mt = degrau(40 / PZ / 2 - 8); teto.position.set(X0, mt.y + 3.1, -mt.z); tunel.add(teto);
      // veios acesos nas paredes e cristais nos cantos
      const veioMat = new T.MeshBasicMaterial({ color: 0xffb066, toneMapped: false });
      // veios e cristais separados por parede: o lado da câmera some junto com a parede (senão ficam boiando na frente)
      ladosTunel = { '-1': new T.Group(), '1': new T.Group() }; tunel.add(ladosTunel['-1'], ladosTunel['1']);
      for (let i = 0; i < 26; i++) { const sx = i % 2 ? 1 : -1, d = degrau(i * 4 - 4 + r() * 2); const v = new T.Mesh(new T.BoxGeometry(0.03, 1.2 + r() * 0.8, 0.05), veioMat); v.position.set(X0 + sx * (PX - 0.04), d.y + 1.3, -d.z); v.rotation.set((r() - 0.5) * 0.8, 0, (r() - 0.5) * 0.6); ladosTunel[sx].add(v);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: brilhoTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.4 })); sp.position.copy(v.position); sp.scale.set(1.6, 2.4, 1); ladosTunel[sx].add(sp); }
      const mcs = { '-1': new T.InstancedMesh(geoCristal, cristalMat, 60), '1': new T.InstancedMesh(geoCristal, cristalMat, 60) }, ks = { '-1': 0, '1': 0 };
      for (let i = 0; i < 16; i++) { const sx = r() < 0.5 ? -1 : 1, d = degrau(i * 6 + r() * 4); for (let j = 0; j < 3 + Math.floor(r() * 3); j++) { o.position.set(X0 + sx * (PX - 0.2 - r() * 0.2), d.y + 0.02, -(d.z + (r() - 0.5) * 0.5)); o.rotation.set((r() - 0.5) * 0.8, r() * 3, sx * 0.3 + (r() - 0.5) * 0.6); const h = 0.4 + r() * 0.6; o.scale.set(h, h, h); o.updateMatrix(); mcs[sx].setMatrixAt(ks[sx]++, o.matrix); } }
      for (const l of ['-1', '1']) { mcs[l].count = ks[l]; ladosTunel[l].add(mcs[l]); }
      const fundoL = new T.PointLight(0xff8a3a, 30, 18, 1.5); const df = degrau(90); fundoL.position.set(X0, df.y + 1.2, -df.z); tunel.add(fundoL);
      const fundoS = new T.Sprite(new T.SpriteMaterial({ map: brilhoTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 })); fundoS.position.copy(fundoL.position); fundoS.scale.set(10, 10, 1); tunel.add(fundoS); }

    const luzCristal = [...cachos].sort((a, b) => b[2] - a[2]).slice(0, 8).map((c) => { const p = new T.PointLight(0xff9a40, 0, 7, 1.8); p.position.set(c[0], c[2] * 0.6, -c[1]); cena.add(p); return { p, c }; });
    R = { coluna, queda, quedaDados, cristalMat, sol, luzCristal, renderer, canvas, cena, camera, uni, spot, nucleoLuz, pontos, nucleo, nucleoMat, aura, orbitam, orbDados, onda, poeira, muro, muroDados, muroRacha, cachos, hemi };
  }

  function ajustaCamera(cam, near, far) {
    const c = R.camera, f = cam.f, cx = cam.cx || W / 2, cy = cam.cy || H / 2;
    c.position.set(cam.x, cam.y, -cam.z); c.rotation.set(0, -(cam.yaw || 0), 0, 'YXZ'); c.updateMatrixWorld(true);
    c.near = near; c.far = far;
    c.projectionMatrix.makePerspective((-cx / f) * near, ((W - cx) / f) * near, (cy / f) * near, (-(H - cy) / f) * near, near, far);
    c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  }

  function atualizar(cam, o) {
    const T = THREE, t = o.t || 0, pu = o.pulso || 0;
    R.uni.uTempo.value = t;
    // coração: brilho das rachaduras, aura e onda acompanham a batida
    const nuc = o.nucleo !== false;
    R.nucleo.visible = R.aura.visible = R.orbitam.visible = R.onda.visible = nuc;
    R.nucleo.rotation.set(0.2, t * 0.25, 0.1); R.nucleo.scale.setScalar(1 + 0.06 * pu);
    R.nucleoMat.emissiveIntensity = 1.6 + 2.6 * pu;
    R.aura.scale.setScalar(6 + 3 * pu); R.aura.material.opacity = 0.45 + 0.4 * pu;
    R.nucleoLuz.intensity = nuc ? 22 + 30 * pu : 0; R.spot.intensity = nuc ? 14 + 22 * pu : 0;
    R.onda.scale.setScalar(1.4 + (1 - pu) * 2.2); R.onda.material.opacity = 0.55 * Math.max(0, pu - 0.4) / 0.6; R.onda.rotation.set(Math.PI / 2 + 0.2, 0, t * 0.3);
    { const ob = new T.Object3D(); R.orbDados.forEach((d, i) => { const a = d.a + t * d.v; ob.position.set(NUCLEO[0] + Math.cos(a) * d.d, NUCLEO[1] + d.y + Math.sin(a * 2) * 0.15, -NUCLEO[2] + Math.sin(a) * d.d); ob.rotation.set(t * d.v + d.giro, t * 0.7 + d.giro, 0); ob.scale.setScalar(d.s); ob.updateMatrix(); R.orbitam.setMatrixAt(i, ob.matrix); }); R.orbitam.instanceMatrix.needsUpdate = true; }
    // holofote do núcleo mira a câmera (as sombras dos personagens caem na direção de quem assiste, dramático)
    R.spot.target.position.set(cam.x, 0, -cam.z); R.spot.target.updateMatrixWorld();
    { const yaw = cam.yaw || 0, fx = Math.sin(yaw), fz = Math.cos(yaw), cx0 = cam.x + fx * 6, cz0 = cam.z + fz * 6, y0 = cam.y - 1.2;
      R.sol.target.position.set(cx0, y0, -cz0); R.sol.target.updateMatrixWorld();
      R.sol.position.set(cx0 - fx * 7 - fz * 6, y0 + 16, -(cz0 - fz * 7 + fx * 6)); R.sol.intensity = (o.sol === undefined ? 5.5 : o.sol) * (0.9 + 0.1 * Math.sin(t * 1.3) * Math.sin(t * 3.7 + 1)); }
    R.cena.background.set(Math.abs(cam.x - X0) < 20 ? 0x0e080b : 0x1c1424);
    if (ladosTunel) { const dx = cam.x - X0; for (const l of [-1, 1]) ladosTunel[l].visible = !(Math.abs(dx) > 0.3 && Math.sign(dx) === l); }
    // coluna: o.coluna = { x, z, altura, k (0..1 sobe), incl (rad, inclinação), giro (rad, para onde inclina) }
    { const c = o.coluna; if (c && c.k > 0.01) { R.coluna.visible = true; R.coluna.position.set(c.x, -0.05, -c.z); R.coluna.rotation.set(0, c.giro || 0, 0); R.coluna.rotateX(c.incl || 0); R.coluna.scale.set(c.grossura || 1, (c.altura || 2.4) * Math.min(1, c.k), c.grossura || 1); } else R.coluna.visible = false; }
    // pedras caindo: o.queda = { x, z, s (segundos desde o começo) }
    { const q = o.queda; if (q) { const ob = new T.Object3D(); let k = 0;
        R.quedaDados.forEach((d) => { const tt = q.s - d.atraso; if (tt < 0) return; const y = Math.max(d.s * 0.4, 7.5 - 4.9 * tt * tt); ob.position.set(q.x + Math.cos(d.a) * d.d, y, -(q.z + Math.sin(d.a) * d.d)); ob.rotation.set(d.giro + tt * 3, d.giro, 0); ob.scale.setScalar(d.s); ob.updateMatrix(); R.queda.setMatrixAt(k++, ob.matrix); });
        R.queda.count = k; R.queda.instanceMatrix.needsUpdate = true; } else R.queda.count = 0; }
    // cristais piscando (o.piscar 0..1) quando a caverna treme
    R.cristalMat.emissiveIntensity = 1.3 * (o.piscar ? (1 - o.piscar * 0.8 * (Math.sin(t * 37) > 0.2 ? 1 : 0) * (Math.sin(t * 11) > -0.3 ? 1 : 0.3)) : 1);
    // muro
    const mu = o.muro;
    if (mu && mu.sobe > 0) {
      const ob = new T.Object3D(), n = Math.max(3, Math.min(7, Math.round(mu.larg / 0.55))), w = mu.larg / n, alt = mu.altura || 1.9; let k = 0;
      for (let i = 0; i < n; i++) { const d = R.muroDados[i], hh = alt * d.h * Math.max(0, Math.min(1, (mu.sobe - d.atraso) / (1 - d.atraso))); if (hh < 0.02) continue; ob.position.set(mu.x - mu.larg / 2 + (i + 0.5) * w, hh / 2, -mu.z); ob.rotation.set(0, (mu.giro || 0) + d.giro, 0); ob.scale.set(w * 0.86, hh, d.d); ob.updateMatrix(); R.muro.setMatrixAt(k++, ob.matrix); }
      R.muro.count = k; R.muro.instanceMatrix.needsUpdate = true;
      R.muroRacha.visible = (mu.racha || 0) > 0.02; R.muroRacha.material.opacity = mu.racha || 0; R.muroRacha.position.set(mu.x, alt * 0.5, -(mu.z - 0.36)); R.muroRacha.rotation.set(0, (mu.giro || 0), 0);
    } else { R.muro.count = 0; R.muroRacha.visible = false; }
    // luzes extras do plano (mão do Lucas, etc.) + cristais mais perto da câmera
    let li = 0;
    for (const e of o.luzes || []) { if (li >= R.pontos.length) break; const p = R.pontos[li++]; p.position.set(e.x, e.y === undefined ? 1.2 : e.y, -e.z); p.color.set(e.cor || '#FFA050'); p.intensity = 8 * (e.forca === undefined ? 1 : e.forca); p.distance = e.raio || 6; }
    for (; li < R.pontos.length; li++) R.pontos[li].intensity = 0;
    // cristais: luzes fixas nos cachos maiores (antes elas trocavam de cristal conforme a câmera andava e a luz "pulava")
    R.luzCristal.forEach(({ p, c }) => { p.intensity = 6 * c[2] * (0.85 + 0.15 * Math.sin(t * 2 + c[0])); });
  }

  // personagens 2D em placas dentro do 3D (cópia do Valdor3D, chão da caverna em y = 0 / degrau no túnel)
  const figPool = [], contatoPool = []; let texContato = null;
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
    const comPe = lista.filter((fg) => fg.X !== undefined && fg.sombra !== false);
    comPe.forEach((fg, i) => {
      let d = contatoPool[i];
      if (!d) {
        if (!texContato) texContato = textura(tela(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }));
        d = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: texContato, transparent: true, depthWrite: false, opacity: 0.6, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -4 }));
        d.renderOrder = 1; R.cena.add(d); contatoPool[i] = d;
      }
      const a = fg.alt || 1.8, y = fg.y || 0; d.position.set(fg.X, y + 0.03, -fg.Z); d.scale.set(a * 0.42, 1, a * 0.26); d.material.opacity = 0.75; d.visible = true;
    });
    for (let i = comPe.length; i < contatoPool.length; i++) contatoPool[i].visible = false;
  }

  function desenhar(ctx, cam, o = {}) {
    if (!R) montar();
    atualizar(cam, o);
    figuras3d(o.figuras || [], cam);
    const foco = o.foco || 0, bokeh = o.bokeh === undefined ? 4 : o.bokeh;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high';
    if (foco > 1 && bokeh > 0) {
      ajustaCamera(cam, foco, 300); R.renderer.setClearColor(0x1c1424, 1); R.renderer.render(R.cena, R.camera);
      // copia para um canvas 2D antes do desfoque (o blur direto do canvas WebGL saía vazio: o fundo sumia)
      if (!R.copia) { R.copia = document.createElement('canvas'); R.copia.width = W; R.copia.height = H; }
      const cg = R.copia.getContext('2d'); cg.clearRect(0, 0, W, H); cg.drawImage(R.canvas, 0, 0, W, H);
      ctx.filter = `blur(${bokeh}px)`; ctx.drawImage(R.copia, 0, 0); ctx.filter = 'none';
      ajustaCamera(cam, 0.05, foco); R.renderer.setClearColor(0x000000, 0); const fundo = R.cena.background; R.cena.background = null; R.renderer.render(R.cena, R.camera); R.cena.background = fundo;
      ctx.drawImage(R.canvas, 0, 0, W, H);
    } else {
      ajustaCamera(cam, 0.05, 300); R.renderer.setClearColor(0x1c1424, 1); R.renderer.render(R.cena, R.camera);
      ctx.drawImage(R.canvas, 0, 0, W, H);
    }
    ctx.restore();
  }

  // monta o quadro inteiro: personagens viram placas no 3D; o resto do 2D (closes, raios, mãos) vai por cima
  function cena(ctx, api, cam, entradas, o = {}) {
    const figuras = [], camadas = [], res = [];
    const p3 = api.personagem3d; let reg = null;
    api.personagem3d = (c, item, X, Z, alt, op = {}) => { reg = { X, Z, y: op.y || 0, alt }; return p3(c, item, X, Z, alt, op); };
    window.SEM_SOMBRA_CHAO = true;
    for (const e of entradas) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
      reg = null; res.push(e.f());
      const L = api.camada(), g = L.getContext('2d'); g.drawImage(ctx.canvas, 0, 0);
      if (reg) {
        const q = cam.p(reg.X, reg.y, reg.Z), hp = reg.alt * q.s;
        const x0 = Math.max(0, Math.floor(q.x - 1.0 * hp)), x1 = Math.min(W, Math.ceil(q.x + 1.0 * hp)), y0 = Math.max(0, Math.floor(q.y - 1.8 * hp)), y1 = Math.min(H, Math.ceil(q.y + 0.12 * hp));
        if (q.dz > 0.6 && x1 > x0 + 2 && y1 > y0 + 2) {
          const C = document.createElement('canvas'); C.width = x1 - x0; C.height = y1 - y0; C.getContext('2d').drawImage(L, x0, y0, C.width, C.height, 0, 0, C.width, C.height);
          figuras.push({ canvas: C, x0, y0, w: C.width, h: C.height, dz: q.dz, X: reg.X, Z: reg.Z, y: reg.y, alt: reg.alt });
          continue;
        }
      }
      camadas.push(L);
    }
    api.personagem3d = p3;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const dzs = figuras.map((f) => f.dz), foco = dzs.length ? Math.max(...dzs) + (o.folgaFoco || 4) : 0;
    desenhar(ctx, cam, { ...o, t: o.t === undefined ? api.t : o.t, figuras, foco });
    for (const L of camadas) ctx.drawImage(L, 0, 0);
    window.SEM_SOMBRA_CHAO = false;
    if (o.depois) o.depois(res);
    return res;
  }

  window.Terra3D = {
    cena, desenhar, rio,
    pontos: { nucleo: NUCLEO, pintura: [CX + Math.cos(PINTURA_ANG) * R0 * 0.82, CZ + Math.sin(PINTURA_ANG) * R0 * 0.82], entrada: [5.5, 1.5], centro: [CX, CZ] },
    nevoa: '#1A1020',
    escada: { degrau, yEm: (z) => yEm(z), X0, PZ, PY },
  };
})();

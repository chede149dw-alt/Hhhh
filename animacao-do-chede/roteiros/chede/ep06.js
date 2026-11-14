// Parte 6 — "E se alguém tivesse o mesmo poder que você?" (Chede + Kaik + Lia)
// Planos do roteiro roteiros/chede/ep06.json. Estrada de manhã (rua), tomadas contínuas girando em volta dos
// personagens, closes só para mão/efeito e reações. Poder: fenda roxa (efeitos/fenda.js).
(function () {
  const CHEDE = { fabrica: 'criarChede', registroPoses: 'POSES_PADRAO' };
  const KAIK = { fabrica: 'criarKaik', registroPoses: 'POSES_PADRAO' };
  const LIA = { fabrica: 'criarLia', registroPoses: 'POSES_PADRAO' };
  const P = () => window.EXPRESSOES_PADRAO;
  const LUZ = { lado: -1, forca: 0.5 };
  const W = 1080, H = 1920;
  const AMARELO = '#EBC25A';
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  // posições na estrada (m): rua de x −3 a 3, indo para dentro em Z
  const C = [-0.9, 3.8], K = [-0.1, 3.6], L = [2.0, 6.4];

  function chave(T, lista) {
    if (T <= lista[0][0]) return lista[0][1];
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, v0] = lista[i], [t1, v1] = lista[i + 1];
      if (T <= t1) {
        const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0);
        return Array.isArray(v0) ? v0.map((v, j) => v + (v1[j] - v) * k) : v0 + (v1 - v0) * k;
      }
    }
    return lista[lista.length - 1][1];
  }
  function tempoTomada(api, ids, nominais) {
    let acc = 0;
    for (let i = 0; i < ids.length; i++) {
      const q = api.planos.find((k) => k.id === ids[i]);
      if (api.t < q.fim || i === ids.length - 1) return acc + api.clamp((api.t - q.inicio) / (q.fim - q.inicio), 0, 1) * nominais[i];
      acc += nominais[i];
    }
    return acc;
  }
  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  function fundo(ctx, api, camOpts, px) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D.rua.nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D.rua.desenhar(g, cam, { t: api.t });
    api.desfocar(camada, px);
    return cam;
  }
  // desenha os personagens de trás para a frente (o mais longe da câmera primeiro)
  function emOrdem(cam, lista) {
    const dist = (X, Z) => (X - cam.x) * (X - cam.x) + (Z - cam.z) * (Z - cam.z);
    lista.slice().sort((a, b) => dist(b[0], b[1]) - dist(a[0], a[1])).forEach((it) => it[2]());
  }
  // fenda num ponto 3D (deitada de frente para a câmera)
  function fenda3d(ctx, cam, X, Y, Z, largM, abre, t, sem = 3) {
    const q = cam.p(X, Y, Z); if (q.dz < 0.6) return null;
    Efeitos.fenda(ctx, q.x, q.y, largM * q.s, { t, abre, semente: sem });
    return q;
  }

  // ---------- gato preto (2D, mesmo estilo chapado) ----------
  function gato(ctx, x, y, s, o = {}) {
    // origem: pés no chão; s = altura em px (sentado ≈ 30 cm)
    const pose = o.pose || 'sentado', t = o.t || 0, esp = o.espelhar ? -1 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(esp * s / 300, s / 300);
    const C1 = '#1E1B24', C2 = '#121017', LUZC = '#3A3446';
    ctx.fillStyle = 'rgba(17,14,20,0.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 130, 20, 0, 0, Math.PI * 2); ctx.fill();
    if (pose === 'andando') {
      const c = t * 7, ay = -120;
      const perna = (px, f, cor) => { ctx.save(); ctx.translate(px, ay + 20); ctx.rotate(Math.sin(c + f) * 0.4); ctx.fillStyle = cor; ctx.beginPath(); ctx.roundRect(-13, 0, 26, 100, 12); ctx.fill(); ctx.restore(); };
      perna(-70, Math.PI, C2); perna(60, 0, C2);
      ctx.strokeStyle = C1; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-100, ay); ctx.quadraticCurveTo(-180, ay - 60, -150 + Math.sin(c) * 15, ay - 160); ctx.stroke();
      ctx.fillStyle = C1; ctx.beginPath(); ctx.ellipse(0, ay, 118, 52, 0, 0, Math.PI * 2); ctx.fill();
      perna(-50, 0, C1); perna(80, Math.PI, C1);
      ctx.save(); ctx.translate(128, ay - 52);
      ctx.fillStyle = C1; ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(-18, -102); ctx.lineTo(14, -52); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 62, 54, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F4D23C'; ctx.beginPath(); ctx.ellipse(30, -8, 14, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0A0A0C'; ctx.beginPath(); ctx.ellipse(34, -8, 4, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5E7A45'; ctx.beginPath(); ctx.ellipse(-30, 38, 30, 9, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      const arr = pose === 'arrepiado';
      ctx.strokeStyle = C1; ctx.lineWidth = arr ? 34 : 24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(60, -20); ctx.quadraticCurveTo(170 + Math.sin(t * 2) * 14, -90, 120, -150); ctx.stroke();
      ctx.fillStyle = C1; ctx.beginPath(); ctx.moveTo(-80, 0); ctx.bezierCurveTo(-95, -90, -70, -170, 0, arr ? -205 : -185); ctx.bezierCurveTo(70, -170, 95, -90, 80, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C2; ctx.beginPath(); ctx.moveTo(10, -175); ctx.bezierCurveTo(70, -160, 92, -90, 80, 0); ctx.lineTo(30, 0); ctx.bezierCurveTo(50, -60, 45, -130, 10, -175); ctx.fill();
      if (arr) for (let i = -2; i <= 2; i++) { ctx.fillStyle = C1; ctx.beginPath(); ctx.moveTo(i * 30 - 10, -180 + Math.abs(i) * 18); ctx.lineTo(i * 30, -210 + Math.abs(i) * 18); ctx.lineTo(i * 30 + 10, -180 + Math.abs(i) * 18); ctx.fill(); }
      ctx.save(); ctx.translate(0, -235);
      ctx.fillStyle = C1;
      ctx.beginPath(); ctx.moveTo(-70, -20); ctx.lineTo(-62, -96); ctx.lineTo(-18, -58); ctx.fill();
      ctx.beginPath(); ctx.moveTo(70, -20); ctx.lineTo(62, -96); ctx.lineTo(18, -58); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, 78, 66, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = LUZC; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(-38, -34, 22, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      for (const dx of [-26, 26]) {
        ctx.fillStyle = '#F4D23C'; ctx.beginPath(); ctx.ellipse(dx, -6, 16, arr ? 18 : 17, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0A0A0C'; ctx.beginPath(); ctx.ellipse(dx, -6, arr ? 7 : 4.5, 13, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#C97C8C'; ctx.beginPath(); ctx.moveTo(-9, 20); ctx.lineTo(9, 20); ctx.lineTo(0, 31); ctx.fill();
      ctx.strokeStyle = '#9A96A8'; ctx.lineWidth = 2.5;
      for (const l of [-1, 1]) for (const dy of [0, 12]) { ctx.beginPath(); ctx.moveTo(l * 22, 28 + dy); ctx.lineTo(l * 92, 18 + dy * 1.6); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = '#5E7A45'; ctx.beginPath(); ctx.moveTo(-52, -178); ctx.quadraticCurveTo(0, -160, 52, -178); ctx.lineTo(50, -164); ctx.quadraticCurveTo(0, -146, -50, -164); ctx.fill();
    }
    ctx.restore();
  }
  const gato3d = (ctx, cam, X, Z, o = {}) => { const q = cam.p(X, o.y || 0, Z); if (q.dz < 0.6) return; gato(ctx, q.x, q.y, 0.32 * q.s, o); };

  // vento/folhas voando (ímã das fendas)
  function vento(ctx, api, forca, cx, cy) {
    const rnd = rng(11);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 50; i++) {
      const y0 = rnd() * H, v = 600 + rnd() * 900, x = ((rnd() * W + api.t * v) % (W + 400)) - 200, y = y0 + Math.sin(api.t * 3 + i) * 30;
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * forca})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 180 * forca, y); ctx.stroke();
    }
    for (let i = 0; i < 18; i++) {
      const a = api.t * (2 + rnd() * 3) + i, r = (220 + rnd() * 420) * (1 - ((api.t * 0.7 + i * 0.13) % 1));
      ctx.fillStyle = i % 2 ? `rgba(110,150,70,${forca})` : `rgba(160,120,70,${forca})`;
      ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5); ctx.rotate(a * 2);
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  function info(api, ctx, rotulo, valor, y, cor = AMARELO, k = 1) {
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k); ctx.translate(-540, -y);
    api.texto(rotulo, 540, y - 90, 54); api.texto(valor, 540, y + 40, 150, { cor });
    ctx.restore();
  }

  // ---------- tomadas contínuas ----------
  // 1) garota → gato → lia: a câmera sai de trás dos dois, gira e revela a Lia; o gato corre até ela e sobe no colo
  function tomadaEstrada(ctx, api) {
    const T = tempoTomada(api, ['garota', 'gato', 'lia'], [3, 3, 3]);
    const cam = api.orbita({
      alvo: chave(T, [[0, [0.6, 1.3, 5.4]], [3, [1.1, 1.2, 5.9]], [6, [1.4, 1.25, 6.2]], [9, [0.5, 1.3, 5.0]]]),
      raio: chave(T, [[0, 4.4], [3, 3.0], [6, 2.0], [9, 3.0]]),
      ang: chave(T, [[0, 0.12], [3, 0.5], [6, 0.9], [9, 1.2]]),
      altura: chave(T, [[0, 1.5], [6, 1.35], [9, 1.45]]), f: 1150, ySalvo: 980, nevoa: Cenarios3D.rua.nevoa,
    });
    Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
    const exC = T < 1 ? 'neutro' : T < 7 ? 'preocupado' : 'determinado';
    const exK = T < 1 ? 'neutro' : T < 4 ? 'espanto' : 'preocupado';
    // ordem de desenho: de trás para a frente (Lia mais longe na primeira metade)
    const gx = chave(T, [[0, K[0] + 0.2], [2.6, L[0] - 0.25]]), gz = chave(T, [[0, K[1] + 0.3], [2.6, L[1] - 0.15]]);
    const noColo = T > 3.4;
    const pe = (q) => cam.p(q[0], 0, q[1]);
    emOrdem(cam, [
      [L[0], L[1], () => {
        api.personagem3d(cam, { ...LIA, pose: 'parado', expressao: T < 3 ? 'neutro' : T < 6 ? 'feliz' : 'neutro', voz: T > 3 ? 'narrador' : undefined }, L[0], L[1], 1.65, { luz: LUZ, olhaPara: T < 3 ? K : C, vida: 1.4 });
        if (noColo) { const q = cam.p(L[0] - 0.1, 0, L[1] - 0.22); if (q.dz > 0.6) gato(ctx, q.x, q.y, 0.32 * q.s, { pose: 'sentado', t: api.t, espelhar: true }); }
      }],
      [gx, gz, () => { if (!noColo) gato3d(ctx, cam, gx, gz, { pose: T < 2.6 ? 'andando' : 'sentado', t: api.t, espelhar: pe(L).x < pe(K).x }); }],
      [K[0], K[1], () => api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: exK }, K[0], K[1], 1.75, { luz: LUZ, olhaPara: L, vida: 1.6 })],
      [C[0], C[1], () => api.personagem3d(cam, { ...CHEDE, pose: 'parado', expressao: exC }, C[0], C[1], 1.75, { luz: LUZ, olhaPara: L, vida: 1.5 })],
    ]);
    Cenarios3D.rua.frente && Cenarios3D.rua.frente(ctx, cam, { desfoque: 0 });
  }

  // 2) testa → ímã → fecham: Chede e Lia abrem as fendas, elas se puxam, ventania, fecham juntos
  function tomadaIma(ctx, api) {
    const T = tempoTomada(api, ['testa', 'ima', 'fecham'], [3, 3, 3]);
    const C2 = [-0.5, 3.6], L2 = [1.1, 3.8];
    const [tx, ty] = api.tremor(T > 1.5 && T < 7 ? 10 : 0);
    ctx.save(); ctx.translate(tx, ty);
    const cam = api.orbita({
      alvo: [0.3, 1.25, 3.7], raio: chave(T, [[0, 3.4], [4, 2.8], [9, 3.2]]),
      ang: chave(T, [[0, -0.5], [4.5, 0.1], [9, 0.55]]), altura: 1.4, f: 1150, ySalvo: 1000, nevoa: Cenarios3D.rua.nevoa,
    });
    Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
    const fecha = T > 7.4;
    const olhosFechados = T > 6.9 && T < 7.8;
    const exF = olhosFechados ? { ...P().neutro, fechado: 'apertado' } : T < 1 ? 'determinado' : fecha ? 'cansado' : 'espanto';
    const K2 = [-1.6, 5.4];
    emOrdem(cam, [
      [L2[0], L2[1], () => api.personagem3d(cam, { ...LIA, pose: 'parado', expressao: exF }, L2[0], L2[1], 1.65, { luz: LUZ, olhaPara: C2, vida: 2 })],
      [C2[0], C2[1], () => api.personagem3d(cam, { ...CHEDE, pose: 'parado', expressao: exF }, C2[0], C2[1], 1.75, { luz: LUZ, olhaPara: L2, vida: 2 })],
      [K2[0], K2[1], () => api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: T < 2 ? 'preocupado' : 'medo' }, K2[0], K2[1], 1.75, { luz: LUZ, olhaPara: [0.3, 3.7], vida: 2 })],
    ]);
    // fendas: saem das mãos e se puxam para o meio
    const abreC = api.clamp((T - 0.4) / 0.6, 0, 1) * (fecha ? api.clamp(1 - (T - 7.4) / 0.25, 0, 1) : 1);
    const abreL = api.clamp((T - 1.0) / 0.5, 0, 1) * (fecha ? api.clamp(1 - (T - 7.4) / 0.25, 0, 1) : 1);
    const puxa = api.clamp((T - 1.4) / 4, 0, 1) * 0.35;
    const xc = api.lerp(C2[0] + 0.35, 0.3, puxa), xl = api.lerp(L2[0] - 0.35, 0.3, puxa);
    fenda3d(ctx, cam, xc, 1.3 + Math.sin(api.t * 13) * 0.03, C2[1] + 0.1, 0.55, abreC, api.t, 3);
    fenda3d(ctx, cam, xl, 1.3 + Math.cos(api.t * 13) * 0.03, L2[1] - 0.05, 0.5, abreL, api.t, 7);
    const ventoF = api.clamp((T - 1.6) / 0.8, 0, 1) * (fecha ? 0 : 1);
    ctx.restore();
    if (ventoF > 0) { const q = cam.p(0.3, 1.3, 3.7); vento(ctx, api, ventoF, q.x, q.y); }
    if (T > 3.2 && T < 6.6) info(api, ctx, 'VENTO', '80 km/h', 1560, AMARELO, api.ease.volta ? api.clamp((T - 3.2) / 0.35, 0, 1) : 1);
    if (T > 7.35 && T < 7.6) { ctx.fillStyle = `rgba(233,220,255,${1 - Math.abs(T - 7.47) / 0.13})`; ctx.fillRect(0, 0, W, H); }
  }

  // 3) séria → saiu: gira em volta da Lia; o gato arrepia olhando o asfalto
  function tomadaSeria(ctx, api) {
    const T = tempoTomada(api, ['seria', 'saiu'], [3, 3]);
    const L3 = [0.9, 4.0], C3 = [-0.4, 3.5], K3 = [-1.1, 4.4];
    const cam = api.orbita({
      alvo: chave(T, [[0, [0.6, 1.35, 3.9]], [6, [0.8, 1.2, 4.0]]]), raio: chave(T, [[0, 2.6], [6, 1.9]]),
      ang: chave(T, [[0, 0.9], [6, 0.2]]), altura: chave(T, [[0, 1.45], [6, 1.25]]), f: 1150, ySalvo: 990, nevoa: Cenarios3D.rua.nevoa,
    });
    Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
    emOrdem(cam, [
      [K3[0], K3[1], () => api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: T < 3.5 ? 'preocupado' : 'medo' }, K3[0], K3[1], 1.75, { luz: LUZ, olhaPara: L3, vida: 1.6 })],
      [L3[0], L3[1], () => api.personagem3d(cam, { ...LIA, pose: 'parado', expressao: T < 3 ? 'preocupado' : 'medo' }, L3[0], L3[1], 1.65, { luz: LUZ, olhaPara: C3, vida: 1.5 })],
      [C3[0], C3[1], () => api.personagem3d(cam, { ...CHEDE, pose: 'parado', expressao: T < 3.5 ? 'preocupado' : 'espanto' }, C3[0], C3[1], 1.75, { luz: LUZ, olhaPara: L3, vida: 1.6 })],
      [L3[0] - 0.45, L3[1] - 0.35, () => gato3d(ctx, cam, L3[0] - 0.45, L3[1] - 0.35, { pose: T > 3.3 ? 'arrepiado' : 'sentado', t: api.t, espelhar: true })],
    ]);
  }

  window.PLANOS = {
    // CAPA DO REELS no estilo da referência do usuário (12/11): protagonista grande no centro com o poder na mão
    // vindo na direção da câmera, dois personagens atrás nas laterais, fundo roxo dramático com círculo mágico,
    // título grande embaixo (prata + dourado) e selo "PARTE N".
    capaReels(ctx, u, d, api) {
      // fundo: céu roxo de tempestade + círculo de runas + cidade em silhueta
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1A0B3A'); g.addColorStop(0.45, '#3A1478'); g.addColorStop(0.75, '#22104E'); g.addColorStop(1, '#0C0620');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const rnd = rng(31);
      for (let i = 0; i < 26; i++) { // nuvens
        const x = rnd() * W, y = rnd() * 900, r = 120 + rnd() * 220;
        const n = ctx.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, 'rgba(120,70,200,0.35)'); n.addColorStop(1, 'rgba(120,70,200,0)');
        ctx.fillStyle = n; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.save(); ctx.translate(540, 520); ctx.globalCompositeOperation = 'lighter';
      for (const [r, a] of [[430, 0.55], [370, 0.35], [300, 0.25]]) { ctx.strokeStyle = `rgba(190,140,255,${a})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.font = '700 34px Inter'; ctx.fillStyle = 'rgba(210,180,255,0.6)'; ctx.textAlign = 'center';
      for (let i = 0; i < 28; i++) { ctx.save(); ctx.rotate((i / 28) * Math.PI * 2); ctx.fillText('ᚠᚱᛟᚾᛞᚨ'[i % 6], 0, -398); ctx.restore(); }
      ctx.restore();
      ctx.fillStyle = '#120828'; ctx.beginPath(); ctx.moveTo(0, 980);
      for (let x = 0; x <= W; x += 45) { const h = 60 + ((x * 37) % 170) + (x > 380 && x < 700 ? 140 : 0); ctx.lineTo(x, 980 - h); ctx.lineTo(x + 45, 980 - h); }
      ctx.lineTo(W, 1100); ctx.lineTo(0, 1100); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(200,160,255,0.75)';
      for (let i = 0; i < 40; i++) { const x = rnd() * W, y = 820 + rnd() * 150; ctx.fillRect(x, y, 6, 9); }
      // personagens: Lia (esq.) e Kaik (dir.) atrás, Chede grande no centro
      const sombra = (f) => { ctx.save(); f(); ctx.restore(); };
      sombra(() => close(api, { ...LIA, pose: 'parado', expressao: 'determinado', vista: 'tq' }, 230, 690, 330, { parado: true, luz: { lado: 1, cor: 'rgb(190,150,255)', forca: 0.8 } }));
      sombra(() => close(api, { ...KAIK, pose: 'maos-na-cintura', expressao: 'determinado', vista: 'tq', espelhar: true }, 860, 700, 330, { parado: true, luz: { lado: -1, cor: 'rgb(190,150,255)', forca: 0.8 } }));
      ctx.fillStyle = 'rgba(30,10,70,0.35)'; ctx.fillRect(0, 0, W, 1250);
      const rig = close(api, { ...CHEDE, pose: { braco_d: 68, antebraco_d: 20, braco_e: -8, antebraco_e: 4 }, expressao: 'determinado' }, 560, 640, 430, { parado: true, luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 } });
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.25]) : { x: 300, y: 1050 };
      Efeitos.fenda(ctx, Math.max(260, m.x), m.y - 20, 420, { t: 1.3, abre: 1, semente: 9 });
      // logo da série: A FENDA (com o rasgo roxo atravessando o meio)
      Efeitos.fenda(ctx, 540, 336, 760, { t: 0.4, abre: 0.3, semente: 2 });
      ctx.save(); ctx.translate(540, 330);
      ctx.font = '900 140px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(167,121,255,0.95)'; ctx.shadowBlur = 40;
      ctx.lineJoin = 'round'; ctx.strokeStyle = '#140826'; ctx.lineWidth = 22; ctx.strokeText('A FENDA', 0, 0);
      ctx.shadowBlur = 0;
      const lg = ctx.createLinearGradient(0, -70, 0, 70); lg.addColorStop(0, '#F3EBFF'); lg.addColorStop(0.5, '#C9A6FF'); lg.addColorStop(1, '#7B4DFF');
      ctx.fillStyle = lg; ctx.fillText('A FENDA', 0, 0);
      ctx.restore();
      // faixa escura atrás do título
      const f = ctx.createLinearGradient(0, 1150, 0, 1700); f.addColorStop(0, 'rgba(12,6,32,0)'); f.addColorStop(0.35, 'rgba(12,6,32,0.8)'); f.addColorStop(1, 'rgba(12,6,32,0.95)');
      ctx.fillStyle = f; ctx.fillRect(0, 1150, W, H - 1150);
      // título metálico
      const metal = (txt, y, tam, cores, contorno = '#1A0B30') => {
        ctx.save(); ctx.font = `900 ${tam}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let k = 1; while (ctx.measureText(txt).width * k > 1000) k -= 0.02;
        ctx.translate(540, y); ctx.scale(k, 1);
        ctx.shadowColor = 'rgba(167,121,255,0.9)'; ctx.shadowBlur = 30;
        ctx.lineJoin = 'round'; ctx.strokeStyle = contorno; ctx.lineWidth = tam * 0.16; ctx.strokeText(txt, 0, 0);
        ctx.shadowBlur = 0;
        const gr = ctx.createLinearGradient(0, -tam * 0.5, 0, tam * 0.5); cores.forEach(([o, c]) => gr.addColorStop(o, c));
        ctx.fillStyle = gr; ctx.fillText(txt, 0, 0);
        ctx.restore();
      };
      const PRATA = [[0, '#FFFFFF'], [0.45, '#D7D2E6'], [0.55, '#9C94B4'], [1, '#E9E5F5']];
      const OURO = [[0, '#FFF2B0'], [0.45, '#FFC83D'], [0.55, '#D98A12'], [1, '#FFD45E']];
      metal('E SE ALGUÉM', 1290, 130, PRATA);
      metal('TIVESSE O MESMO', 1405, 92, PRATA);
      metal('PODER?', 1530, 168, OURO);
      // selo PARTE 6 com moldura
      ctx.save(); ctx.translate(540, 1690);
      ctx.fillStyle = '#2A1060'; ctx.strokeStyle = '#B98CFF'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-230, 0); ctx.lineTo(-195, -62); ctx.lineTo(195, -62); ctx.lineTo(230, 0); ctx.lineTo(195, 62); ctx.lineTo(-195, 62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(185,140,255,0.8)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-420, 0); ctx.lineTo(-250, 0); ctx.moveTo(250, 0); ctx.lineTo(420, 0); ctx.stroke();
      ctx.restore();
      metal('PARTE 6', 1693, 84, PRATA);
    },

    capa(ctx, u, d, api) {
      const z = api.lerp(1, 1.06, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      const cam = api.camera({ f: 1150, x: 0.2, y: 1.45, z: 0.4, cy: 1050, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
      api.personagem3d(cam, { ...LIA, pose: 'parado', expressao: 'determinado' }, 1.9, 6.6, 1.65, { luz: LUZ, olhaPara: [0, 3] });
      fenda3d(ctx, cam, 1.55, 1.15, 6.4, 0.7, 1, api.t, 5);
      api.personagem3d(cam, { ...KAIK, pose: 'costas' }, 0.45, 3.0, 1.75, { luz: LUZ });
      api.personagem3d(cam, { ...CHEDE, pose: 'costas' }, -0.55, 3.1, 1.75, { luz: LUZ });
      ctx.restore();
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 380); ctx.scale(k, k); ctx.translate(-540, -380);
      api.texto('E SE ALGUÉM', 540, 300, 100); api.texto('TIVESSE O MESMO', 540, 415, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 560); ctx.scale(k2, k2); ctx.translate(-540, -560);
      api.texto('PODER?', 540, 560, 160, { cor: AMARELO });
      ctx.restore();
      const k3 = api.fase(0.45, 0.8, 'volta');
      ctx.save(); ctx.translate(540, 1500); ctx.scale(k3, k3); ctx.translate(-540, -1500); ctx.rotate(0);
      api.texto('PARTE 6', 540, 1500, 150, { cor: AMARELO });
      ctx.restore();
    },

    garota: (ctx, u, d, api) => tomadaEstrada(ctx, api),
    gato: (ctx, u, d, api) => tomadaEstrada(ctx, api),
    lia: (ctx, u, d, api) => tomadaEstrada(ctx, api),

    // close da mão da Lia abrindo a fenda
    fenda(ctx, u, d, api) {
      const z = api.lerp(1, 1.08, u / d);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      fundo(ctx, api, { f: 1100, x: 1.2, y: 1.3, z: 3.6, cy: 960 }, 14);
      const rig = close(api, { ...LIA, pose: { braco_d: 72, antebraco_d: 28, braco_e: -6, antebraco_e: 3 }, expressao: u < 0.6 ? 'determinado' : 'neutro' }, 660, 760, 300, { luz: LUZ });
      ctx.restore();
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.3]) : { x: 700, y: 1100 };
      Efeitos.fenda(ctx, Math.max(300, m.x), m.y - 60, 440, { t: api.t, abre: api.fase(0.35, 0.9, 'sai'), semente: 4 });
    },

    // reação do Kaik em 3 tempos
    travou(ctx, u, d, api) {
      const z = u < 0.9 ? 1 : api.lerp(1, 1.05, (u - 0.9) / (d - 0.9));
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, { f: 1100, x: 0.9, y: 1.4, z: 1.2, yaw: -0.2, cy: 980 }, 16);
      const ex = u < 0.4 ? { ...P().neutro, olhar: [0.012, 0] } : u < 0.9 ? 'espanto' : 'medo';
      close(api, { ...KAIK, pose: 'parado', expressao: ex, vistaCabeca: u > 0.4 && u < 0.9 ? 'tq' : undefined, voz: 'narrador' }, 540, 900, 520, { luz: LUZ, vida: 1.6 });
      ctx.restore();
    },

    // ficha "NÃO ABORDAR" ganha o rosto da Lia
    fichas(ctx, u, d, api) {
      fundo(ctx, api, { f: 1000, x: 0.5, y: 1.3, z: 2.4, cy: 960 }, 20);
      ctx.fillStyle = 'rgba(20,16,24,0.45)'; ctx.fillRect(0, 0, W, H);
      const k = api.ease.sai(api.clamp(u / 0.4, 0, 1)), rot = api.lerp(-0.12, -0.04, u / d);
      ctx.save(); ctx.translate(540, 980); ctx.rotate(rot); ctx.scale(k, k);
      ctx.fillStyle = '#F2EDE6'; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.roundRect(-330, -440, 660, 880, 18); ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = '900 46px Inter'; ctx.fillStyle = '#38343F'; ctx.textAlign = 'left'; ctx.fillText('CASO Nº 3', -280, -360);
      // foto: borrada que vira o rosto da Lia
      ctx.save(); ctx.beginPath(); ctx.rect(-280, -320, 300, 360); ctx.clip();
      ctx.fillStyle = '#C9C2B6'; ctx.fillRect(-280, -320, 300, 360);
      const foco = api.fase(0.5, 1.4);
      if (foco > 0.02) {
        ctx.globalAlpha = foco;
        const A = alturaH(LIA); const Hc = 180;
        api.personagem({ ...LIA, pose: 'parado', expressao: 'neutro' }, -130, -60 - 0.47 * Hc + A * Hc, A * Hc, { vida: 0.3, semRosto: true });
        ctx.globalAlpha = 1;
      }
      ctx.filter = `blur(${(1 - foco) * 18}px)`; if (foco < 1) { ctx.fillStyle = `rgba(150,130,120,${1 - foco})`; ctx.fillRect(-280, -320, 300, 360); }
      ctx.filter = 'none'; ctx.restore();
      ctx.fillStyle = '#A9A3A0'; for (let i = 0; i < 6; i++) ctx.fillRect(60, -300 + i * 52, 220 - (i % 2) * 60, 16);
      for (let i = 0; i < 4; i++) ctx.fillRect(-280, 110 + i * 52, 540 - (i % 2) * 120, 16);
      if (u > 1.0) { ctx.font = '900 44px Inter'; ctx.fillStyle = '#38343F'; ctx.fillText('LIA MORAES', -280, 90); }
      ctx.save(); ctx.translate(120, 330); ctx.rotate(-0.18); ctx.strokeStyle = '#D23A42'; ctx.lineWidth = 10; ctx.strokeRect(-200, -60, 400, 120);
      ctx.font = '900 60px Inter'; ctx.fillStyle = '#D23A42'; ctx.textAlign = 'center'; ctx.fillText('NÃO ABORDAR', 0, 22); ctx.restore();
      ctx.restore();
    },

    // a Lia some numa fenda e reaparece atrás do Kaik
    some(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0.2, 1.25, 3.4], raio: api.lerp(2.7, 2.3, u / d), ang: api.lerp(-0.35, 0.05, u / d), altura: 1.45, f: 1150, ySalvo: 1000, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
      const A1 = [1.0, 3.3], A2 = [-1.0, 3.7], K4 = [0.0, 3.2];
      const sumiu = u > 0.75, voltou = u > 1.35;
      emOrdem(cam, [
        [K4[0], K4[1], () => api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: voltou ? 'espanto' : 'preocupado' }, K4[0], K4[1], 1.75, { luz: LUZ, olhaPara: voltou ? A2 : A1, vida: voltou ? 3 : 1.5 })],
        [A1[0], A1[1], () => { if (!sumiu) api.personagem3d(cam, { ...LIA, pose: 'parado', expressao: 'determinado', voz: 'narrador' }, A1[0], A1[1], 1.65, { luz: LUZ, olhaPara: K4 }); }],
        [A2[0], A2[1], () => { if (voltou) api.personagem3d(cam, { ...LIA, pose: 'maos-na-cintura', expressao: 'feliz' }, A2[0], A2[1], 1.65, { luz: LUZ, olhaPara: K4 }); }],
      ]);
      const ab1 = api.fase(0.45, 0.65) * (1 - api.fase(0.8, 0.95));
      fenda3d(ctx, cam, A1[0], 0.9, A1[1] - 0.05, 0.9, ab1, api.t, 2);
      const ab2 = api.fase(1.15, 1.3) * (1 - api.fase(1.45, 1.65));
      fenda3d(ctx, cam, A2[0], 0.9, A2[1] - 0.05, 0.9, ab2, api.t, 6);
    },

    // infográfico do eco: ondas roxas saindo do Chede e chegando na Lia longe
    eco(ctx, u, d, api) {
      ctx.fillStyle = '#14122B'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(123,92,255,0.25)'; ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 100, 0); ctx.lineTo(i * 100, H); ctx.stroke(); }
      for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(0, i * 100); ctx.lineTo(W, i * 100); ctx.stroke(); }
      // ruas do mapa
      ctx.strokeStyle = 'rgba(200,190,255,0.35)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      [[[80, 1500], [1000, 1300]], [[300, 300], [420, 1800]], [[760, 200], [700, 1700]], [[100, 700], [980, 820]]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); });
      const A = [330, 1380], B = [760, 520];
      for (let i = 0; i < 4; i++) {
        const k = ((u * 0.9 + i / 4) % 1), r = k * 1100;
        ctx.strokeStyle = `rgba(167,121,255,${(1 - k) * 0.9})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(A[0], A[1], r, 0, Math.PI * 2); ctx.stroke();
      }
      const pin = (x, y, cor, txt) => { ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill(); ctx.font = '900 46px Inter'; ctx.fillStyle = '#F2EDE6'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y + 95); };
      pin(A[0], A[1], '#F07C28', 'CHEDE');
      const chega = u > 0.9; pin(B[0], B[1], chega ? '#C9A6FF' : '#5E7A45', 'LIA');
      if (chega) { ctx.strokeStyle = `rgba(201,166,255,${0.5 + 0.5 * Math.sin(u * 20)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(B[0], B[1], 60 + Math.sin(u * 20) * 8, 0, Math.PI * 2); ctx.stroke(); }
      info(api, ctx, 'CADA FENDA', 'ECO', 1640, '#C9A6FF', api.fase(0.1, 0.45, 'volta'));
    },

    testa: (ctx, u, d, api) => tomadaIma(ctx, api),
    ima: (ctx, u, d, api) => tomadaIma(ctx, api),
    fecham: (ctx, u, d, api) => tomadaIma(ctx, api),
    seria: (ctx, u, d, api) => tomadaSeria(ctx, api),
    saiu: (ctx, u, d, api) => tomadaSeria(ctx, api),

    // câmera baixa seguindo as marcas pretas pela estrada até a cidade
    marcas(ctx, u, d, api) {
      const cam = api.camera({ f: 1100, x: 0.3, y: api.lerp(0.5, 0.7, u / d), z: api.lerp(-0.6, 1.0, u / d), cy: 700, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
      for (let i = 0; i < 12; i++) {
        const Z = 1.6 + i * 1.3, X = (i % 2 ? 0.28 : -0.28) + Math.sin(i * 0.7) * 0.2;
        if (Z < cam.z + 1.3) continue;
        const q = cam.p(X, 0.01, Z), q2 = cam.p(X, 0.01, Z + 0.3); if (q.dz < 0.6) continue;
        const s = 0.34 * q.s, achata = Math.max(0.12, Math.abs(q2.y - q.y) / (0.3 * q.s));
        ctx.save(); ctx.translate(q.x, q.y); ctx.scale(1, achata); ctx.rotate((i % 2 ? 0.2 : -0.2));
        ctx.fillStyle = 'rgba(12,8,16,0.92)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.45, s * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        [[-0.32, -0.75, 0.13, 0.42], [-0.11, -0.95, 0.13, 0.5], [0.12, -0.92, 0.13, 0.48], [0.34, -0.7, 0.12, 0.4], [0.55, 0.1, 0.12, 0.32]].forEach(([fx, fy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(fx * s, fy * s, rx * s, ry * s, 0, 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
      }
      const g = ctx.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, 'rgba(60,40,90,0.35)'); g.addColorStop(1, 'rgba(60,40,90,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 700);
    },

    parte(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      fundo(ctx, api, { x: 0, y: 1.4, z: -0.5 + u * 0.2, cy: 960 }, 18);
      ctx.restore();
      ctx.fillStyle = 'rgba(30,20,30,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 760); ctx.scale(k, k); ctx.translate(-540, -760);
      api.texto('PARTE', 540, 680, 120); api.texto('6', 540, 850, 230, { cor: AMARELO });
      ctx.restore();
      const k2 = api.fase(0.45, 0.8, 'volta');
      ctx.save(); ctx.translate(540, 1130); ctx.scale(k2, k2); ctx.translate(-540, -1130);
      api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 7', 540, 1190, 96, { cor: AMARELO });
      ctx.restore();
      const k3 = api.fase(0.9, 1.2, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

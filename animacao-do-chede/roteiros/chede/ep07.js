// A FENDA · PARTE FINAL (Parte 7, final da 1ª temporada) — Chede + Kaik + Lia
// Planos do roteiro roteiros/chede/ep07.json (~2min40). Ajudantes copiados da Parte 6 (ep06.js).
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


  // ======================= PARTE FINAL: elementos novos =======================
  // fração do plano (0..1) → 0..1 (api.fase conta em SEGUNDOS)
  const fr = (api, a, b, e) => api.fase(a * api.dur, b * api.dur, e);
  const ROXO = '#C9A6FF';
  const LUZ_NOITE = { lado: -1, cor: 'rgb(150,170,255)', forca: 0.6 };
  // trajes do governo (moletom técnico com faixa da cor do poder, calça e bota de cano alto)
  const TRAJE = (cor, faixa) => ({ top: { tipo: 'moletom', cor, faixa }, calca: { tipo: 'reta', cor: 'grafite' }, calcado: { tipo: 'cano-alto', cor: 'grafite', acento: faixa } });
  const CHEDE_T = { ...CHEDE, opcoes: TRAJE('grafite', 'laranja') };
  const KAIK_T = { ...KAIK, opcoes: TRAJE('marinho', 'turquesa') };
  const LIA_T = { ...LIA, opcoes: { ...TRAJE('grafite', 'lilas'), cabelo: { estilo: 'coque', cor: 'cabCafe', prendedor: 'lilas' } } };
  const AGENTE = { fabrica: 'criarPersonagem', registroPoses: 'POSES_PADRAO', opcoes: { nome: 'Agente', altura: 5.8, pele: 'pele3', cabelo: { estilo: 'liso-lateral', cor: 'cabNoite' }, top: { tipo: 'cardiga', cor: 'grafite', corInterna: 'linho' }, calca: { tipo: 'reta', cor: 'grafite' }, calcado: { tipo: 'baixo', cor: 'grafite', acento: 'grafite' }, olhos: { iris: 'irisAmbar' } } };
  const MULHER = { fabrica: 'criarPersonagem', registroPoses: 'POSES_PADRAO', opcoes: { nome: 'Mulher do governo', altura: 5.7, pele: 'pele2', cabelo: { estilo: 'coque', cor: 'cabNoite', prendedor: 'grafite' }, top: { tipo: 'cardiga', cor: 'grafite', corInterna: 'linho' }, calca: { tipo: 'reta', cor: 'grafite' }, calcado: { tipo: 'sapatilha', cor: 'grafite' }, olhos: { iris: 'irisAmbar', cilios: true } } };

  // escurece e esfria o quadro (noite) + vinheta
  function noite(ctx, k = 0.6) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = Math.min(1, k);
    ctx.fillStyle = '#3A4680'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(540, 960, 380, 540, 960, 1250);
    g.addColorStop(0, 'rgba(6,8,24,0)'); g.addColorStop(1, `rgba(6,8,24,${0.6 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function brilho(ctx, x, y, r, a, cor = '255,220,150') {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,250,230,${a})`); g.addColorStop(0.3, `rgba(${cor},${a * 0.5})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  // postes dos dois lados da rua; apagados = os que a criatura já "comeu" (zApaga: postes com Z maior que isso estão apagados)
  function postes(ctx, cam, zApaga = 999) {
    for (let Z = 4; Z < 70; Z += 7) for (const X of [-3.4, 3.4]) {
      const b = cam.p(X, 0, Z), t = cam.p(X, 5.2, Z); if (b.dz < 0.8) continue;
      ctx.strokeStyle = '#2A2838'; ctx.lineWidth = Math.max(1.5, 0.12 * b.s); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(t.x, t.y); ctx.stroke();
      if (Z < zApaga) { brilho(ctx, t.x, t.y, 1.6 * t.s, 0.9); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.beginPath(); ctx.moveTo(t.x - 0.2 * t.s, t.y); ctx.lineTo(t.x + 0.2 * t.s, t.y); ctx.lineTo(b.x + 1.6 * b.s, b.y); ctx.lineTo(b.x - 1.6 * b.s, b.y); ctx.fill(); ctx.restore(); }
    }
  }
  // prédios escuros ao fundo, com janelas que apagam
  function predios(ctx, cam, acesas = 1, sem = 4) {
    const rnd = rng(sem);
    for (let i = 0; i < 14; i++) {
      const X = -40 + i * 6.2 + rnd() * 2, Z = 70 + rnd() * 30, h = 18 + rnd() * 40, w = 5 + rnd() * 3;
      const a = cam.p(X - w / 2, 0, Z), b = cam.p(X + w / 2, h, Z); if (a.dz < 1) continue;
      ctx.fillStyle = '#151830'; ctx.fillRect(a.x, b.y, b.x - a.x, a.y - b.y);
      const r2 = rng(sem * 31 + i);
      for (let jy = b.y + 6; jy < a.y - 6; jy += Math.max(6, (a.y - b.y) / 14)) for (let jx = a.x + 4; jx < b.x - 4; jx += Math.max(5, (b.x - a.x) / 5)) {
        if (r2() < 0.5 * acesas) { ctx.fillStyle = 'rgba(255,214,140,0.85)'; ctx.fillRect(jx, jy, Math.max(2, (b.x - a.x) / 9), Math.max(2, (a.y - b.y) / 30)); }
      }
    }
  }
  // cenário da cidade à noite: rua + prédios + postes, escurecida
  function cidade(ctx, api, cam, o = {}) {
    Cenarios3D.rua.desenhar(ctx, cam, { t: api.t });
    predios(ctx, cam, o.acesas === undefined ? 1 : o.acesas);
    noite(ctx, o.noite === undefined ? 0.72 : o.noite);
    postes(ctx, cam, o.zApaga === undefined ? 999 : o.zApaga);
  }

  // ---------- A CRIATURA (2D) ----------
  // pés em (x, y), altura h em px. o: { t, olhos (0..1), bracoD (0 caído .. 1 levantado/esticado para a frente), garra (0..1), inclina (graus), cresce (0..1 incha) }
  function criatura(ctx, x, y, h, o = {}) {
    const t = o.t || 0, s = h / 10, inc = ((o.inclina || 0) * Math.PI) / 180, resp = 1 + Math.sin(t * 1.3) * 0.015 + (o.cresce || 0) * 0.04;
    ctx.save(); ctx.translate(x, y); ctx.rotate(inc); ctx.scale(s * resp, s);
    const corpo = '#0E0818', borda = '#24123E';
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 0.35, 0, 0, Math.PI * 2); ctx.fill();
    // pernas
    ctx.fillStyle = corpo;
    for (const l of [-1, 1]) { ctx.beginPath(); ctx.moveTo(l * 0.5, -4.6); ctx.quadraticCurveTo(l * 1.1, -2.4, l * 0.9, 0); ctx.lineTo(l * 0.35, 0); ctx.quadraticCurveTo(l * 0.5, -2.4, l * 0.15, -4.3); ctx.fill(); }
    // tronco curvado
    ctx.beginPath(); ctx.moveTo(-1.3, -4.4); ctx.quadraticCurveTo(-1.6, -7.2, -0.5, -8.2); ctx.quadraticCurveTo(0.6, -8.6, 1.3, -7.6); ctx.quadraticCurveTo(1.7, -6, 1.2, -4.3); ctx.quadraticCurveTo(0, -3.9, -1.3, -4.4); ctx.fill();
    // braços compridos (passam do joelho); o direito pode levantar
    const braco = (l, sobe) => {
      ctx.save(); ctx.translate(l * 1.25, -7.4); ctx.rotate(l * (0.12 - sobe * 1.6));
      ctx.fillStyle = corpo; ctx.beginPath(); ctx.moveTo(-0.28, 0); ctx.quadraticCurveTo(-0.5, 2.6, -0.22, 5.4); ctx.lineTo(0.26, 5.4); ctx.quadraticCurveTo(0.42, 2.6, 0.3, 0); ctx.fill();
      // mão com dedos compridos
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(k * 0.13, 5.85 + Math.abs(k) * -0.05, 0.07, 0.55 + (o.garra || 0) * 0.15, k * 0.12, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    };
    braco(-1, 0); braco(1, o.bracoD || 0);
    // cabeça lisa, pequena para o corpo
    ctx.beginPath(); ctx.ellipse(0.1, -8.85, 0.85, 0.95, 0.1, 0, Math.PI * 2); ctx.fill();
    // contorno sutil (lê no escuro)
    ctx.strokeStyle = borda; ctx.lineWidth = 0.08; ctx.stroke();
    // rachaduras roxas acesas
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const r = rng(9);
    for (let i = 0; i < 9; i++) {
      let px = (r() - 0.5) * 2, py = -4.6 - r() * 3.6; ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 0.7; py += (r() - 0.5) * 0.7; ctx.lineTo(px, py); }
      ctx.strokeStyle = `rgba(167,121,255,${0.35 + 0.25 * Math.sin(t * 3 + i)})`; ctx.lineWidth = 0.14; ctx.stroke();
      ctx.strokeStyle = 'rgba(233,220,255,0.7)'; ctx.lineWidth = 0.04; ctx.stroke();
    }
    // olhos
    const ol = o.olhos === undefined ? 1 : o.olhos;
    for (const dx of [-0.32, 0.42]) {
      const g = ctx.createRadialGradient(dx, -8.95, 0, dx, -8.95, 0.7); g.addColorStop(0, `rgba(240,230,255,${ol})`); g.addColorStop(0.25, `rgba(190,150,255,${0.7 * ol})`); g.addColorStop(1, 'rgba(120,80,255,0)');
      ctx.fillStyle = g; ctx.fillRect(dx - 0.7, -9.65, 1.4, 1.4);
      ctx.fillStyle = `rgba(255,255,255,${ol})`; ctx.beginPath(); ctx.ellipse(dx, -8.95, 0.16, 0.09, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.restore();
  }
  const criatura3d = (ctx, cam, X, Z, altM, o = {}) => { const q = cam.p(X, 0, Z); if (q.dz < 1) return null; criatura(ctx, q.x, q.y, altM * q.s, o); return q; };
  // só os olhos no escuro
  function olhosEscuro(ctx, x, y, s, a) { for (const dx of [-0.6, 0.6]) brilho(ctx, x + dx * s, y, s * 0.9, a, '190,150,255'); ctx.save(); ctx.fillStyle = `rgba(255,255,255,${a})`; for (const dx of [-0.6, 0.6]) { ctx.beginPath(); ctx.ellipse(x + dx * s, y, s * 0.22, s * 0.12, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }

  // faíscas (poste sendo comido / impacto)
  function faiscas(ctx, x, y, n, raio, t, sem = 1) {
    const r = rng(sem); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = raio * (0.3 + ((t * 2 + r()) % 1)); ctx.strokeStyle = i % 2 ? 'rgba(255,230,160,0.9)' : 'rgba(180,220,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d * 0.6, y + Math.sin(a) * d * 0.6); ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.stroke(); }
    ctx.restore();
  }
  // onda de choque
  function onda(ctx, x, y, k, rmax) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.strokeStyle = `rgba(220,240,255,${1 - k})`; ctx.lineWidth = 14 * (1 - k) + 2; ctx.beginPath(); ctx.ellipse(x, y, rmax * k, rmax * k * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  // rastro ciano do Kaik entre dois pontos de tela
  function rastro(ctx, x0, y0, x1, y1, larg, a = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [w, c] of [[larg, `rgba(89,216,255,${0.35 * a})`], [larg * 0.45, `rgba(200,245,255,${0.8 * a})`]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    ctx.restore();
  }
  // fundo infográfico escuro com grade
  function grade(ctx, cor = '#14122B') {
    ctx.fillStyle = cor; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(123,92,255,0.22)'; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 100, 0); ctx.lineTo(i * 100, H); ctx.stroke(); }
    for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(0, i * 100); ctx.lineTo(W, i * 100); ctx.stroke(); }
  }
  // personagem deitado (cama de hospital / desmaiado): desenha de pé numa camada girada
  function deitado(api, ctx, item, x, y, alt, ang = -Math.PI / 2) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); api.personagem(item, 0, alt * 0.5, alt, { parado: true, vida: 0.2 }); ctx.restore();
  }
  const fechado = () => ({ ...P().neutro, fechado: 'sorriso', boca: { tipo: 'linha', curva: 0 } });

  // ---------- planos ----------
  const CAM_RUA = (api, o) => api.orbita({ nevoa: Cenarios3D.rua.nevoa, f: 1150, ySalvo: 1000, ...o });
  // trio na rua (trajes ou não), em ordem de profundidade
  function trio(api, ctx, cam, pos, o = {}) {
    const [C1, K1, L1] = pos, alvo = o.alvo || [0, 30];
    const itC = o.traje ? CHEDE_T : CHEDE, itK = o.traje ? KAIK_T : KAIK, itL = o.traje ? LIA_T : LIA;
    emOrdem(cam, [
      [C1[0], C1[1], () => api.personagem3d(cam, { ...itC, pose: o.poseC || 'parado', expressao: o.exC || 'medo' }, C1[0], C1[1], 1.75, { luz: LUZ_NOITE, olhaPara: o.olhaC || alvo, vida: 1.6 })],
      [K1[0], K1[1], () => api.personagem3d(cam, { ...itK, pose: o.poseK || 'parado', expressao: o.exK || 'medo' }, K1[0], K1[1], 1.75, { luz: LUZ_NOITE, olhaPara: o.olhaK || alvo, vida: 1.6 })],
      [L1[0], L1[1], () => api.personagem3d(cam, { ...itL, pose: o.poseL || 'parado', expressao: o.exL || 'medo' }, L1[0], L1[1], 1.65, { luz: LUZ_NOITE, olhaPara: o.olhaL || alvo, vida: 1.6 })],
    ]);
  }
  const POS = [[-0.9, 4.0], [0.2, 3.7], [1.2, 4.3]];

  window.PLANOS = {
    capaReels(ctx, u, d, api) { capaFinal(ctx, api, 1.2); },
    capa(ctx, u, d, api) { capaFinal(ctx, api, api.t); const k = fr(api, 0, 0.35, 'volta'); void k; },

    // ATO 1
    apagando(ctx, u, d, api) {
      const cam = api.camera({ f: 1150, x: 0.3, y: 1.6, z: api.lerp(0, 1.2, u / d), cy: 980, nevoa: Cenarios3D.rua.nevoa });
      cidade(ctx, api, cam, { zApaga: api.lerp(70, 8, fr(api, 0.1, 0.95)) });
      // marcas pretas no asfalto
      for (let i = 0; i < 10; i++) { const Z = 4 + i * 2.6, X = (i % 2 ? 0.3 : -0.3); const q = cam.p(X, 0.01, Z); if (q.dz < 1) continue; ctx.fillStyle = 'rgba(8,4,14,0.9)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.18 * q.s, 0.06 * q.s, 0, 0, Math.PI * 2); ctx.fill(); }
    },
    bairros(ctx, u, d, api) {
      ctx.fillStyle = '#070914'; ctx.fillRect(0, 0, W, H);
      const r = rng(5), k = fr(api, 0, 1) * 0.8;
      for (let i = 0; i < 900; i++) { const x = r() * W, y = 300 + r() * 1400, dist = Math.hypot(x - 540, y - 1000) / 900; const acesa = dist > k * 1.1; if (acesa) { ctx.fillStyle = `rgba(255,${200 + r() * 40},140,${0.5 + r() * 0.5})`; ctx.fillRect(x, y, 9, 9); } }
      const g = ctx.createRadialGradient(540, 1000, 0, 540, 1000, 950 * k); g.addColorStop(0, 'rgba(60,30,110,0.35)'); g.addColorStop(1, 'rgba(60,30,110,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },
    dezmetros(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, api.lerp(1.5, 6, fr(api, 0, 0.8)), 22], raio: 18, ang: 0.15, altura: api.lerp(1.4, 2.6, fr(api, 0, 0.8)), ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 6, acesas: 0.3 });
      criatura3d(ctx, cam, 0.5, 26, 10, { t: api.t });
      if (u > 1.2) info(api, ctx, 'ALTURA', '10 m', 1580, ROXO, fr(api, 1.2, 1.5, 'volta'));
    },
    energia(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [2.5, 4.5, 14], raio: 9, ang: api.lerp(0.4, 0.55, u / d), altura: 2.5, ySalvo: 1050 });
      const pega = fr(api, 0.2, 0.6);
      cidade(ctx, api, cam, { zApaga: pega > 0.9 ? 4 : 999, acesas: 0.3 });
      const q = criatura3d(ctx, cam, 1.0, 19, 10 + fr(api, 0.6, 1) * 0.6, { t: api.t, bracoD: 0.35 * pega, garra: pega, cresce: fr(api, 0.6, 1) });
      const pt = cam.p(3.4, 5.2, 18);
      if (pega > 0.5 && pega < 1 || (u > 0.5 * d && u < 0.75 * d)) faiscas(ctx, pt.x, pt.y, 26, 0.9 * pt.s, api.t, 3);
      void q;
    },
    kaikcorre(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 3, 16], raio: 12, ang: api.lerp(-0.3, 0.1, u / d), altura: 3.2, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 4, acesas: 0.3 });
      criatura3d(ctx, cam, 0, 18, 10, { t: api.t });
      const n = 40; let prev = null;
      for (let i = 0; i <= n; i++) { const a = api.t * 9 - i * 0.09, X = Math.cos(a) * 3.2, Z = 18 + Math.sin(a) * 2.2, q = cam.p(X, 0.9, Z); if (prev && q.dz > 1) rastro(ctx, prev.x, prev.y, q.x, q.y, 0.6 * q.s, 1 - i / n); prev = q; }
      info(api, ctx, 'KAIK', '1.000 km/h', 1580, '#59D8FF', fr(api, 0.2, 0.5, 'volta'));
    },
    tapa(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 2, 12], raio: 11, ang: 0.3, altura: 2.2, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 4, acesas: 0.3 });
      const golpe = fr(api, 0.3, 0.55);
      criatura3d(ctx, cam, 0.5, 16, 10, { t: api.t, bracoD: golpe < 1 ? golpe * 0.9 : 0.9 - fr(api, 0.55, 1) * 0.9, garra: 0.5 });
      const voo = fr(api, 0.5, 1, 'sai'), X = api.lerp(0.6, -4, voo), Z = api.lerp(13, 2.5, voo), y = Math.sin(voo * Math.PI) * 2.5;
      if (u > 0.35 * d) api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: 'medo' }, X, Z, 1.75, { luz: LUZ_NOITE, y, rumo: voo * 6 });
      if (voo > 0.2) info(api, ctx, 'VOOU', '30 m', 1580, AMARELO, fr(api, 0.6, 0.85, 'volta'));
    },
    moeda(ctx, u, d, api) {
      const z = api.lerp(1, 1.05, u / d);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      const camada = api.camada(), g = camada.getContext('2d'); const cam = api.camera({ f: 1100, x: 0.4, y: 1.4, z: 1.2, cy: 980, nevoa: Cenarios3D.rua.nevoa });
      cidade(g, api, cam, { zApaga: 4, acesas: 0.3 }); api.desfocar(camada, 14);
      const rig = close(api, { ...CHEDE, pose: { braco_d: 70, antebraco_d: 20 }, expressao: 'medo' }, 600, 760, 300, { luz: LUZ_NOITE, vida: 2 });
      ctx.restore();
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.3]) : { x: 400, y: 1100 };
      Efeitos.fenda(ctx, Math.max(260, m.x), m.y - 30, 120 + Math.sin(api.t * 30) * 10, { t: api.t, abre: 1, semente: 3 });
      info(api, ctx, 'COM MEDO', 'MOEDA', 1580, ROXO, fr(api, 0.5, 0.8, 'volta'));
    },
    fugir(ctx, u, d, api) {
      const cam = api.camera({ f: 1100, x: 0.2, y: 1.5, z: api.lerp(-1, 4, u / d), cy: 990, nevoa: Cenarios3D.rua.nevoa });
      cidade(ctx, api, cam, { zApaga: 4, acesas: 0.3 });
      criatura3d(ctx, cam, -1, 30, 10, { t: api.t, bracoD: 0.4 });
      const zz = api.lerp(9, 6, u / d) + api.lerp(-1, 4, u / d);
      emOrdem(cam, POS.map((p0, i) => [p0[0], zz + i * 0.3 - 0.3, () => api.personagem3d(cam, { ...[CHEDE, KAIK, LIA][i], pose: 'andando', expressao: 'medo' }, p0[0], zz + i * 0.3 - 0.3, i === 2 ? 1.65 : 1.75, { luz: LUZ_NOITE, rumo: 0, caminharFrontal: api.t * 2.2, vida: 2 })]));
    },

    // ATO 2
    beco(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 1.2, 4], raio: 5, ang: api.lerp(-0.6, -0.2, u / d), altura: 1.6 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, noite: 0.85 });
      const far = fr(api, 0.1, 0.4);
      for (const [X, Z] of [[-2.6, 0.5], [2.6, 8.5]]) { const q = cam.p(X, 0.7, Z); if (q.dz > 1) { brilho(ctx, q.x - 0.5 * q.s, q.y, 2.2 * q.s * far, far); brilho(ctx, q.x + 0.5 * q.s, q.y, 2.2 * q.s * far, far); } }
      trio(api, ctx, cam, [[-0.6, 4.0], [0.3, 3.7], [1.1, 4.3]], { alvo: [-2.6, 0.5] });
    },
    carros(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 1.2, 5], raio: 6, ang: api.lerp(0.2, 0.6, u / d), altura: 1.5 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, noite: 0.85 });
      const lista = [];
      for (let i = 0; i < 4; i++) { const X = -2 + i * 1.3, Z = 9 + (i % 2) * 0.6; lista.push([X, Z, () => api.personagem3d(cam, { ...AGENTE, pose: 'parado', expressao: 'neutro' }, X, Z, 1.8, { luz: LUZ_NOITE, olhaPara: [0, 4] })]); }
      [[-0.6, 4.0], [0.3, 3.7], [1.1, 4.3]].forEach((p0, i) => lista.push([p0[0], p0[1], () => api.personagem3d(cam, { ...[CHEDE, KAIK, LIA][i], pose: 'parado', expressao: 'preocupado' }, p0[0], p0[1], i === 2 ? 1.65 : 1.75, { luz: LUZ_NOITE, olhaPara: [0, 9] })]));
      emOrdem(cam, lista);
    },
    mulher(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.6, 1.4, 6.5], raio: api.lerp(4, 3.2, u / d), ang: 0.35, altura: 1.55 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, noite: 0.85 });
      emOrdem(cam, [
        [1.0, 8.6, () => api.personagem3d(cam, { ...MULHER, pose: 'parado', expressao: 'neutro', voz: 'narrador' }, 1.0, 8.6, 1.7, { luz: LUZ_NOITE, olhaPara: [0, 4] })],
        [-0.4, 9.4, () => api.personagem3d(cam, { ...AGENTE, pose: 'parado', expressao: 'neutro' }, -0.4, 9.4, 1.8, { luz: LUZ_NOITE, olhaPara: [0, 4] })],
        [0.3, 4.4, () => api.personagem3d(cam, { ...CHEDE, pose: 'parado', expressao: 'preocupado' }, 0.3, 4.4, 1.75, { luz: LUZ_NOITE, olhaPara: [1, 8.6] })],
      ]);
    },
    amanhecer(ctx, u, d, api) {
      grade(ctx);
      ctx.save(); ctx.translate(540, 980); ctx.rotate(-0.04);
      ctx.fillStyle = '#1C1A28'; ctx.beginPath(); ctx.roundRect(-380, -560, 760, 1060, 40); ctx.fill();
      ctx.fillStyle = '#0E1430'; ctx.fillRect(-350, -520, 700, 980);
      const k = fr(api, 0, 1), r = rng(2);
      ctx.strokeStyle = 'rgba(120,150,220,0.35)'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-350, -400 + i * 120 + r() * 40); ctx.lineTo(350, -380 + i * 110 + r() * 40); ctx.stroke(); }
      const g = ctx.createRadialGradient(0, -20, 0, 0, -20, 120 + 360 * k); g.addColorStop(0, 'rgba(40,10,60,0.95)'); g.addColorStop(0.8, 'rgba(90,40,160,0.7)'); g.addColorStop(1, 'rgba(90,40,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -20, 120 + 360 * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      info(api, ctx, 'ATÉ O AMANHECER', '6 h', 1640, ROXO, fr(api, 0.2, 0.5, 'volta'));
    },
    anel(ctx, u, d, api) {
      const z = api.lerp(1, 1.1, u / d);
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      const camada = api.camada(), g = camada.getContext('2d'); const cam = api.camera({ f: 1100, x: 0.8, y: 1.5, z: 3, cy: 980, nevoa: Cenarios3D.rua.nevoa });
      cidade(g, api, cam, { zApaga: 0, acesas: 0.1, noite: 0.85 }); api.desfocar(camada, 16);
      close(api, { ...MULHER, pose: 'parado', expressao: { ...P().neutro, pupila: 0.7 } }, 540, 860, 560, { luz: LUZ_NOITE, vida: 0.5 });
      ctx.restore();
      // anel dourado brilhando nos dois olhos
      const a = fr(api, 0.3, 0.6);
      for (const dx of [-0.19, 0.19]) brilho(ctx, 540 + dx * 560 * z, 860 - 0.37 * 560 * z + 0.47 * 560 * z * 0 + (-0.37 + 0.47) * 0, 60 * a, 0.7 * a, '255,178,30');
    },
    aceitam(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.2, 1.4, 4.0], raio: api.lerp(3.2, 2.6, u / d), ang: api.lerp(-0.2, 0.2, u / d), altura: 1.55 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, noite: 0.85 });
      trio(api, ctx, cam, [[-0.6, 4.0], [0.3, 3.7], [1.1, 4.3]], { exC: u > 1 ? 'determinado' : 'preocupado', exK: 'preocupado', exL: 'preocupado', olhaK: [-0.6, 4], olhaL: [-0.6, 4], olhaC: [0.3, 3.7] });
      SELO(ctx, api);
    },
    galpao(ctx, u, d, api) {
      ctx.fillStyle = '#0B0B12'; ctx.fillRect(0, 0, W, H);
      const z = api.lerp(1, 1.06, u / d); ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      ctx.fillStyle = '#16161F'; ctx.fillRect(0, 1350, W, 570);
      [[CHEDE_T, 220, 0.15], [KAIK_T, 540, 0.45], [LIA_T, 860, 0.75]].forEach(([it, x, t0]) => {
        const a = fr(api, t0 * 0.6, t0 * 0.6 + 0.25);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x, 200, x, 1400); g.addColorStop(0, `rgba(230,235,255,${0.35 * a})`); g.addColorStop(1, 'rgba(230,235,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 40, 200); ctx.lineTo(x + 40, 200); ctx.lineTo(x + 190, 1420); ctx.lineTo(x - 190, 1420); ctx.fill(); ctx.restore();
        ctx.globalAlpha = 0.25 + 0.75 * a;
        api.personagem({ ...it, pose: 'parado', expressao: 'neutro' }, x, 1400, 760, { parado: true, semRosto: true });
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(200,210,255,${0.4 * a})`; ctx.lineWidth = 6; ctx.strokeRect(x - 150, 560, 300, 870);
      });
      ctx.restore();
    },
    sola(ctx, u, d, api) {
      grade(ctx, '#0D1530');
      ctx.save(); ctx.translate(540, 1050); ctx.scale(2.4, 2.4);
      ctx.strokeStyle = '#7FD8FF'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(127,216,255,0.12)';
      ctx.beginPath(); ctx.moveTo(-90, -160); ctx.lineTo(10, -160); ctx.lineTo(20, 20); ctx.quadraticCurveTo(140, 20, 150, 60); ctx.lineTo(150, 90); ctx.lineTo(-100, 90); ctx.lineTo(-100, -160); ctx.closePath(); ctx.fill(); ctx.stroke();
      const k = fr(api, 0.2, 0.6);
      ctx.fillStyle = `rgba(255,170,90,${0.6 * k})`; ctx.fillRect(-100, 62, 250 * k, 28);
      ctx.restore();
      info(api, ctx, 'SOLA DE CERÂMICA', '1.500 °C', 1640, '#FFB06A', fr(api, 0.2, 0.5, 'volta'));
    },
    derrete(ctx, u, d, api) {
      const camada = api.camada(), g = camada.getContext('2d'); g.fillStyle = '#121220'; g.fillRect(0, 0, W, H); api.desfocar(camada, 4);
      const rig = close(api, { ...KAIK_T, pose: 'parado', expressao: u > 0.8 ? 'feliz' : 'determinado' }, 540, 760, 420, { luz: { lado: -1, cor: 'rgb(150,220,255)', forca: 0.7 } });
      void rig;
    },
    luvas(ctx, u, d, api) {
      grade(ctx, '#140E26');
      const a = fr(api, 0.1, 0.6);
      [[CHEDE_T, 300], [LIA_T, 780]].forEach(([it, x]) => {
        const rig = close(api, { ...it, pose: { braco_d: 75, antebraco_d: 15 }, expressao: 'determinado', vista: 'frente' }, x, 820, 210, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.7 }, vida: 0.8 });
        const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.2]) : { x, y: 1100 };
        brilho(ctx, m.x, m.y, 140 * a, 0.8 * a, '190,150,255');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(201,166,255,${a})`; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(m.x, m.y, 46, 0, Math.PI * 2 * a); ctx.stroke(); ctx.restore();
      });
      info(api, ctx, 'TRAJE', 'LUVAS', 1600, ROXO, fr(api, 0.2, 0.5, 'volta'));
    },
    medo(ctx, u, d, api) {
      grade(ctx, '#140E26');
      Efeitos.fenda(ctx, 540, 1000, 560, { t: api.t, abre: 1, semente: 7 });
      info(api, ctx, 'COM MEDO', 'IGUAL', 1640, ROXO, fr(api, 0.1, 0.4, 'volta'));
    },

    // ATO 3
    quinze(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 6, 24], raio: 20, ang: api.lerp(-0.2, 0.05, u / d), altura: 1.3, ySalvo: 1100 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      criatura3d(ctx, cam, 0.5, 30, 15, { t: api.t, cresce: 0.5 });
      trio(api, ctx, cam, [[-0.9, 6.0], [0.1, 5.6], [1.1, 6.2]], { traje: true, exC: 'determinado', exK: 'determinado', exL: 'determinado' });
      info(api, ctx, 'ALTURA', '15 m', 1600, ROXO, fr(api, 0.3, 0.6, 'volta'));
    },
    cincokm(ctx, u, d, api) {
      ctx.fillStyle = '#070914'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(150,170,255,0.35)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(540, 1800); ctx.lineTo(540, 200); ctx.stroke();
      const r = rng(8); for (let i = 0; i < 500; i++) { const x = r() * W, y = r() * H; if (Math.abs(x - 540) > 40) { ctx.fillStyle = `rgba(255,214,140,${0.3 + r() * 0.5})`; ctx.fillRect(x, y, 3, 3); } }
      ctx.fillStyle = '#59D8FF'; ctx.beginPath(); ctx.arc(540, 1700, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#C9A6FF'; ctx.beginPath(); ctx.arc(540, 330, 34, 0, Math.PI * 2); ctx.fill();
      ctx.font = '900 44px Inter'; ctx.fillStyle = '#F2EDE6'; ctx.textAlign = 'center'; ctx.fillText('KAIK', 540, 1780); ctx.fillText('CRIATURA', 540, 260);
      info(api, ctx, 'DISTÂNCIA', '5 km', 1050, '#59D8FF', fr(api, 0.2, 0.5, 'volta'));
    },
    corre(ctx, u, d, api) {
      const cam = api.camera({ f: 1000, x: 2.2, y: 1.1, z: api.lerp(2, 8, u / d), cy: 1000, nevoa: Cenarios3D.rua.nevoa });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      const k = fr(api, 0.1, 0.9), Z = api.lerp(-30, 40, k);
      const a = cam.p(0, 0.9, Z - 25), b = cam.p(0, 0.9, Z); if (b.dz > 1 && a.dz > 1) rastro(ctx, a.x, a.y, b.x, b.y, 0.7 * b.s);
      if (b.dz > 1) api.personagem3d(cam, { ...KAIK_T, pose: 'andando', expressao: 'raiva' }, 0, Z, 1.75, { luz: LUZ_NOITE, rumo: Math.PI, caminhar: api.t * 6 });
      info(api, ctx, 'VELOCIDADE', '2.000 km/h', 1600, '#59D8FF', fr(api, 0.1, 0.4, 'volta'));
    },
    caminhoes(ctx, u, d, api) {
      grade(ctx, '#0D1530');
      ctx.font = '900 90px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#F2EDE6';
      api.personagem({ ...KAIK_T, pose: 'parado', expressao: 'determinado' }, 200, 900, 420, { parado: true });
      ctx.fillText('=', 380, 760);
      for (let i = 0; i < 3; i++) {
        const k = fr(api, 0.2 + i * 0.15, 0.4 + i * 0.15, 'volta'); const y = 560 + i * 200;
        ctx.save(); ctx.translate(720, y); ctx.scale(k, k);
        ctx.fillStyle = '#D9DEE8'; ctx.fillRect(-220, -60, 300, 120); ctx.fillStyle = '#C93A32'; ctx.fillRect(80, -40, 110, 100);
        ctx.fillStyle = '#20202A'; for (const wx of [-170, -10, 140]) { ctx.beginPath(); ctx.arc(wx, 64, 26, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      { const k = fr(api, 0.5, 0.8, 'volta'); ctx.save(); ctx.translate(540, 1560); ctx.scale(k, k); ctx.translate(-540, -1560); api.texto('O SOCO = 3 CAMINHÕES', 540, 1720, 70, { cor: AMARELO }); api.texto('A 100 KM/H', 540, 1820, 56); ctx.restore(); }
    },
    soco(ctx, u, d, api) {
      const lento = fr(api, 0.35, 0.65), imp = u > 0.6 * d;
      const [tx, ty] = api.tremor(imp ? 24 * (1 - fr(api, 0.6, 1)) : 0);
      ctx.save(); ctx.translate(tx, ty);
      const cam = CAM_RUA(api, { alvo: [0, 6, 15], raio: 13, ang: 1.05, altura: 5, f: 1000, ySalvo: 950 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      criatura3d(ctx, cam, 0, 17, 15, { t: api.t, inclina: imp ? -6 * fr(api, 0.6, 0.8) : 0 });
      const Y = api.lerp(1, 7.5, fr(api, 0, 0.6)), Zk = api.lerp(10, 16.2, fr(api, 0, 0.6));
      api.personagem3d(cam, { ...KAIK_T, pose: { tronco: 20, braco_d: 95, antebraco_d: 0, braco_e: -50, antebraco_e: -60, coxa_d: -40, canela_d: 60, coxa_e: 30, canela_e: 40 }, expressao: 'raiva' }, -0.3, Zk, 1.75, { luz: LUZ_NOITE, y: Y, rumo: Math.PI * 0.95, parado: true });
      ctx.restore();
      if (imp) { const q = cam.p(0, 8, 16.5); onda(ctx, q.x, q.y, fr(api, 0.6, 0.95), 700); faiscas(ctx, q.x, q.y, 40, 260, api.t, 6); ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - fr(api, 0.6, 0.7))})`; ctx.fillRect(0, 0, W, H); }
      void lento;
    },
    sentiu(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 6, 18], raio: 16, ang: 0.2, altura: 2, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      const k = fr(api, 0, 0.8, 'sai');
      criatura3d(ctx, cam, api.lerp(0, 1.5, k), api.lerp(18, 22, k), 15, { t: api.t, inclina: -10 * (1 - k) + 4 });
      const p = cam.p(3.4, 0, 21); if (p.dz > 1) faiscas(ctx, p.x, p.y - 2 * p.s, 20, 1.5 * p.s, api.t, 4);
    },
    braco: (ctx, u, d, api) => raioX(ctx, api, 0, d),
    osso: (ctx, u, d, api) => raioX(ctx, api, 1, d),
    caiu(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 0.6, 6], raio: api.lerp(3, 2.4, u / d), ang: 0.6, altura: 1.1, ySalvo: 1150 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      const q = cam.p(0, 0, 6);
      if (q.dz > 1) deitado(api, ctx, { ...KAIK_T, pose: { braco_d: 30, antebraco_d: 90, braco_e: 10 }, expressao: 'raiva' }, q.x, q.y - 0.25 * q.s, 1.75 * q.s, -Math.PI / 2 + 0.15);
    },
    sofenda(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.4, 1.3, 6], raio: api.lerp(3.2, 2.8, u / d), ang: -0.4, altura: 1.5 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      criatura3d(ctx, cam, 2, 26, 15, { t: api.t });
      emOrdem(cam, [
        [0.9, 6.4, () => api.personagem3d(cam, { ...LIA_T, pose: 'parado', expressao: 'determinado', voz: 'narrador' }, 0.9, 6.4, 1.65, { luz: LUZ_NOITE, olhaPara: [2, 26] })],
        [-0.3, 6.2, () => { const q = cam.p(-0.3, 0, 6.2); if (q.dz > 1) deitado(api, ctx, { ...KAIK_T, pose: 'parado', expressao: 'cansado' }, q.x, q.y - 0.2 * q.s, 1.75 * q.s, -Math.PI / 2 + 0.1); }],
      ]);
    },
    porta(ctx, u, d, api) {
      grade(ctx);
      const q = { x: 700, y: 1360 }; criatura(ctx, q.x, q.y, 1000, { t: api.t });
      Efeitos.fenda(ctx, 250, 1100, 220, { t: api.t, abre: 1 });
      info(api, ctx, 'FENDA 2 m', 'x 15 m', 1660, ROXO, fr(api, 0.2, 0.5, 'volta'));
    },
    juntas(ctx, u, d, api) {
      grade(ctx);
      const k = fr(api, 0.1, 0.7);
      const xa = api.lerp(300, 540, k), xb = api.lerp(780, 540, k);
      if (k < 0.98) { Efeitos.fenda(ctx, xa, 1000, 300, { t: api.t, abre: 1, semente: 2 }); Efeitos.fenda(ctx, xb, 1000, 300, { t: api.t, abre: 1, semente: 5 }); }
      else Efeitos.fenda(ctx, 540, 1000, 300 + fr(api, 0.7, 1) * 560, { t: api.t, abre: 1, semente: 8 });
      info(api, ctx, '1 + 1 =', 'GIGANTE', 1640, ROXO, fr(api, 0.6, 0.85, 'volta'));
    },

    // ATO 4
    vinte: (ctx, u, d, api) => tomadaFenda(ctx, api),
    borda: (ctx, u, d, api) => { tomadaFenda(ctx, api); SELO(ctx, api); },
    dentro(ctx, u, d, api) {
      const z = api.lerp(1, 1.07, u / d); ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      const camada = api.camada(), g = camada.getContext('2d'); g.fillStyle = '#20103E'; g.fillRect(0, 0, W, H); Efeitos.fenda(g, 540, 500, 1400, { t: api.t, abre: 1 }); api.desfocar(camada, 20);
      close(api, { ...LIA_T, pose: 'parado', expressao: 'medo', voz: 'narrador' }, 540, 860, 520, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.9 }, vida: 2.5 });
      ctx.restore();
    },
    // a mão: o Chede puxado para o alto, o Kaik no chão segurando a mão dele
    segurou(ctx, u, d, api) { maoDada(ctx, api, 0); },
    kaikfala(ctx, u, d, api) { closeChoro(ctx, api, KAIK_T, 'kaik'); },
    chedefala(ctx, u, d, api) { closeChoro(ctx, api, CHEDE_T, 'chede'); },
    choram(ctx, u, d, api) {
      // os dois rostos, um em cima do outro, chorando no vento
      fundoTornado(ctx, api);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H / 2 - 6); ctx.clip();
      const r1 = close(api, { ...KAIK_T, pose: 'parado', expressao: { ...P().medo, boca: { tipo: 'aberta', curva: -0.8, abertura: 0.03, largura: 0.05 } }, vista: 'tq' }, 560, 520, 420, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.9 }, vida: 2.5 });
      lagrimas(ctx, api, r1, 1); ctx.restore();
      ctx.fillStyle = '#0B0620'; ctx.fillRect(0, H / 2 - 6, W, 12);
      ctx.save(); ctx.beginPath(); ctx.rect(0, H / 2 + 6, W, H / 2); ctx.clip();
      const r2 = close(api, { ...CHEDE_T, pose: 'parado', expressao: { ...P().preocupado, boca: { tipo: 'linha', curva: -0.6 } }, vista: 'tq', espelhar: true }, 520, 1330, 420, { luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 }, vida: 2.5 });
      lagrimas(ctx, api, r2, 1); ctx.restore();
      vento(ctx, api, 0.8, 540, 300);
    },
    solta(ctx, u, d, api) { maoDada(ctx, api, 1); },
    pulou(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 8, 18], raio: 16, ang: 0.15, altura: 3, ySalvo: 1150 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
      const fq = cam.p(0, 12, 22); tornado(ctx, api, fq.x, fq.y, 900, 1); Efeitos.fenda(ctx, fq.x, fq.y, 20 * fq.s, { t: api.t, abre: 1, semente: 8 });
      const k = fr(api, 0.1, 1, 'entra');
      criatura3d(ctx, cam, 0, api.lerp(20, 22, k), 15, { t: api.t, inclina: -20 * k });
      const Y = api.lerp(4, 11.5, k), Zc = api.lerp(14, 21.6, k);
      if (k < 0.95) api.personagem3d(cam, { ...CHEDE_T, pose: { braco_d: 160, braco_e: 150, coxa_d: -30, canela_d: 40 }, expressao: 'medo' }, 0.6, Zc, 1.75, { luz: LUZ_NOITE, y: Y, rumo: Math.PI, parado: true });
      vento(ctx, api, 1, fq.x, fq.y);
    },
    fechou(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 3, 12], raio: 12, ang: api.lerp(0.1, 0.25, u / d), altura: 1.8, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: api.lerp(0, 70, fr(api, 0.3, 1)), acesas: api.lerp(0.15, 1, fr(api, 0.3, 1)) });
      const fq = cam.p(0, 12, 22); Efeitos.fenda(ctx, fq.x, fq.y, 20 * fq.s, { t: api.t, abre: 1 - fr(api, 0, 0.2), semente: 8 });
      if (u < 0.2 * d + 0.05) { ctx.fillStyle = `rgba(233,220,255,${1 - fr(api, 0.15, 0.3)})`; ctx.fillRect(0, 0, W, H); }
    },
    semforca(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0, 0.7, 0], raio: api.lerp(2.6, 2.1, u / d), ang: api.lerp(-0.4, -0.1, u / d), altura: 1.1, f: 1100, ySalvo: 1000 });
      grade(ctx, '#0B0816');
      const g = ctx.createLinearGradient(0, 1050, 0, H); g.addColorStop(0, '#1B1530'); g.addColorStop(1, '#0B0816'); ctx.fillStyle = g; ctx.fillRect(0, 1050, W, H - 1050);
      const rig = api.personagem3d(cam, { ...CHEDE_T, pose: { tronco: 25, braco_d: 70, antebraco_d: 30, coxa_d: -80, canela_d: 100, coxa_e: -80, canela_e: 100 }, expressao: 'cansado' }, 0, 0, 1.75, { luz: { lado: -1, cor: 'rgb(150,130,255)', forca: 0.7 }, rumo: 0.5, y: -0.35, vida: 2.5 });
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.3]) : null;
      if (m) Efeitos.fenda(ctx, m.x + 40, m.y - 20, 60, { t: api.t, abre: 0.5 + 0.5 * Math.abs(Math.sin(api.t * 9)) * (1 - fr(api, 0.4, 1)), semente: 3 });
    },
    desmaiou(ctx, u, d, api) {
      ctx.fillStyle = '#16102C'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 1000, 0, H); g.addColorStop(0, '#2A2248'); g.addColorStop(1, '#120E22'); ctx.fillStyle = g; ctx.fillRect(0, 1000, W, H - 1000);
      brilho(ctx, 430, 1120, 560, 0.55, '140,110,240');
      deitado(api, ctx, { ...CHEDE_T, pose: 'parado', expressao: fechado() }, 430, 1120, 620, -Math.PI / 2);
      const k = fr(api, 0.25, 1);
      olhosEscuro(ctx, 760, api.lerp(600, 760, k), api.lerp(40, 110, k), fr(api, 0.25, 0.5));
      ctx.fillStyle = `rgba(0,0,0,${fr(api, 0.85, 1)})`; ctx.fillRect(0, 0, W, H);
    },
    coma: (ctx, u, d, api) => hospital(ctx, api, 0, d),
    kaikhosp: (ctx, u, d, api) => hospital(ctx, api, 1, d),
    naomorreu(ctx, u, d, api) {
      ctx.fillStyle = '#1A1E2E'; ctx.fillRect(0, 0, W, H);
      // janela com a cidade acesa
      ctx.fillStyle = '#0D1330'; ctx.fillRect(140, 200, 800, 900);
      const r = rng(12); for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(255,214,140,${0.4 + r() * 0.6})`; ctx.fillRect(160 + r() * 760, 600 + r() * 480, 4, 4); }
      ctx.strokeStyle = '#2C3248'; ctx.lineWidth = 24; ctx.strokeRect(140, 200, 800, 900); ctx.beginPath(); ctx.moveTo(540, 200); ctx.lineTo(540, 1100); ctx.stroke();
      const z = api.lerp(1, 1.06, u / d); ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      close(api, { ...KAIK, pose: { braco_d: 20, antebraco_d: 100 }, expressao: { ...P().preocupado, olhar: [0, -0.006] }, vista: 'costas', voz: 'narrador' }, 540, 980, 520, { luz: { lado: 1, cor: 'rgb(255,214,160)', forca: 0.5 }, vida: 1 });
      ctx.restore();
    },
    luz: (ctx, u, d, api) => hospital(ctx, api, 2, d),
    parte(ctx, u, d, api) {
      ctx.fillStyle = '#0B0620'; ctx.fillRect(0, 0, W, H);
      Efeitos.fenda(ctx, 540, 560, 700, { t: api.t, abre: 0.6, semente: 2 });
      const k = fr(api, 0, 0.3, 'volta');
      ctx.save(); ctx.translate(540, 800); ctx.scale(k, k); ctx.translate(-540, -800);
      api.texto('FIM DA', 540, 760, 110); api.texto('1ª TEMPORADA', 540, 880, 120, { cor: AMARELO });
      ctx.restore();
      const k2 = fr(api, 0.35, 0.65, 'volta');
      ctx.save(); ctx.translate(540, 1130); ctx.scale(k2, k2); ctx.translate(-540, -1130);
      api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A TEMPORADA 2', 540, 1190, 96, { cor: AMARELO });
      ctx.restore();
      const k3 = fr(api, 0.55, 0.75, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };

  // selo "SEGUE PRA VER" pulsando no alto-centro (meio do vídeo)
  function SELO(ctx, api) {
    const k = fr(api, 0.2, 0.45, 'volta'), p = 1 + Math.sin(api.t * 6) * 0.03;
    ctx.save(); ctx.translate(540, 1720); ctx.scale(k * p, k * p);
    ctx.fillStyle = '#EBC25A'; ctx.beginPath(); ctx.roundRect(-300, -50, 600, 100, 50); ctx.fill();
    ctx.font = '900 46px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#211B26'; ctx.fillText('SEGUE PRA VER ▶', 0, 3);
    ctx.restore();
  }
  // raio-X do braço do Kaik: fase 0 = impacto, fase 1 = osso trincando e ombro saindo do lugar
  function raioX(ctx, api, fase, d) {
    const u = api.u;
    ctx.fillStyle = '#04122A'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(540, 960, 100, 540, 960, 1100); g.addColorStop(0, 'rgba(40,120,200,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const [tx, ty] = api.tremor(fase === 0 ? 18 * (1 - fr(api, 0, 0.6)) : 6);
    ctx.save(); ctx.translate(540 + tx, 960 + ty); ctx.rotate(-0.5);
    const azul = 'rgba(200,235,255,0.9)';
    // pele (contorno translúcido do braço)
    ctx.fillStyle = 'rgba(120,180,255,0.16)'; ctx.strokeStyle = 'rgba(150,210,255,0.5)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(-640, -110, 1100, 220, 110); ctx.fill(); ctx.stroke();
    // ossos: úmero, rádio e ulna, punho
    const deslocado = fase === 1 ? fr(api, 0.45, 0.75) : 0;
    ctx.fillStyle = azul;
    ctx.save(); ctx.translate(-560 - 40 * deslocado, -10 + 60 * deslocado); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fill(); ctx.restore(); // cabeça do úmero
    ctx.beginPath(); ctx.roundRect(-560, -26, 470, 52, 26); ctx.fill(); // úmero
    ctx.beginPath(); ctx.arc(-560, 0, 0, 0, 0); // (ombro)
    ctx.fillStyle = 'rgba(160,210,255,0.4)'; ctx.beginPath(); ctx.arc(-600, -20, 95, -2.2, 0.6); ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(160,210,255,0.55)'; ctx.stroke(); // encaixe do ombro
    ctx.fillStyle = azul; ctx.beginPath(); ctx.roundRect(-90, -50, 470, 34, 17); ctx.fill(); ctx.beginPath(); ctx.roundRect(-90, 14, 470, 30, 15); ctx.fill();
    ctx.beginPath(); ctx.roundRect(380, -60, 90, 120, 30); ctx.fill();
    // trinca no rádio
    if (fase === 1) {
      const k = fr(api, 0.05, 0.5);
      ctx.strokeStyle = '#FF4A3A'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(150, -52); const pts = [[165, -44], [150, -36], [172, -28], [158, -20], [176, -16]]; pts.slice(0, Math.ceil(k * pts.length)).forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke();
      brilho(ctx, 540 + 160 * Math.cos(-0.5) + 35 * Math.sin(-0.5), 960 + 160 * Math.sin(-0.5) - 35 * Math.cos(-0.5), 120 * k, 0.6 * k, '255,80,60');
    }
    ctx.restore();
    // punho do impacto (fase 0): onda vindo do punho
    if (fase === 0) { const k = fr(api, 0.1, 0.8); onda(ctx, 540 + 420 * Math.cos(-0.5), 960 + 420 * Math.sin(-0.5), k, 600); }
    if (fase === 1) {
      info(api, ctx, 'RÁDIO', 'TRINCOU', 1420, '#FF6A5A', fr(api, 0.1, 0.35, 'volta'));
      if (u > 0.45 * d) info(api, ctx, 'OMBRO', 'DESLOCOU', 1690, '#FF6A5A', fr(api, 0.45, 0.65, 'volta'));
    } else info(api, ctx, 'RAIO-X', 'IMPACTO', 1500, '#7FD8FF', fr(api, 0.1, 0.35, 'volta'));
  }

  // tomada da fenda gigante: Chede e Lia de braço estendido; criatura puxada e agarrada na borda
  function tomadaFenda(ctx, api) {
    const T = tempoTomada(api, ['vinte', 'borda'], [3.5, 3.5]);
    const cam = CAM_RUA(api, { alvo: [0.3, 4, 10], raio: chave(T, [[0, 9], [7, 7]]), ang: chave(T, [[0, -0.6], [7, 0.4]]), altura: 1.3, ySalvo: 1250, f: 1000 });
    const [tx, ty] = api.tremor(T > 3.5 ? 12 : 4); ctx.save(); ctx.translate(tx, ty);
    cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 });
    const abre = api.clamp(T / 2, 0, 1), fq = cam.p(0.3, 11, 22);
    tornado(ctx, api, fq.x, fq.y, 1000, api.clamp((T - 1.5) / 2, 0, 1));
    Efeitos.fenda(ctx, fq.x, fq.y, 20 * fq.s * abre + 1, { t: api.t, abre: 1, semente: 8 });
    const puxa = api.clamp((T - 2) / 1.5, 0, 1);
    criatura3d(ctx, cam, 0.3, api.lerp(17, 21, puxa), 15, { t: api.t, inclina: -15 * puxa, bracoD: 1 * puxa, garra: 1 });
    if (T > 3.5) { // dedos cravados na borda
      for (let i = 0; i < 4; i++) { const q = cam.p(-3 + i * 0.5, 10.6, 21.8); ctx.fillStyle = '#0E0818'; ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.12 * q.s, 0.5 * q.s, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    emOrdem(cam, [
      [-0.8, 6, () => api.personagem3d(cam, { ...CHEDE_T, pose: { braco_d: 120, antebraco_d: 0, braco_e: 120, antebraco_e: 0 }, expressao: 'raiva' }, -0.8, 6, 1.75, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.9 }, olhaPara: [0.3, 22], vida: 3 })],
      [1.3, 6.2, () => api.personagem3d(cam, { ...LIA_T, pose: { braco_d: 120, antebraco_d: 0, braco_e: 120, antebraco_e: 0 }, expressao: 'raiva' }, 1.3, 6.2, 1.65, { luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 }, olhaPara: [0.3, 22], vida: 3 })],
    ]);
    ctx.restore();
    vento(ctx, api, 0.8, fq.x, fq.y);
    if (T < 3.5) info(api, ctx, 'FENDA', '20 m', 1600, ROXO, api.clamp((T - 0.6) / 0.35, 0, 1));
  }

  // tornado: braços em espiral de poeira/vento girando em volta da fenda
  function tornado(ctx, api, x, y, R, forca) {
    if (forca <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let b = 0; b < 7; b++) {
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const k = i / 40, a = b * 0.9 + k * 5 + api.t * 3, r = R * (1 - k * 0.85); const px = Math.cos(a) * r, py = Math.sin(a) * r * 0.45; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.strokeStyle = `rgba(${b % 2 ? '200,180,255' : '170,150,200'},${0.22 * forca})`; ctx.lineWidth = 18 - b; ctx.stroke();
    }
    const r = rng(17);
    for (let i = 0; i < 70; i++) { const a = r() * 6.28 + api.t * (2 + r() * 2), rr = R * (0.2 + ((r() + api.t * 0.4) % 1) * 0.9); ctx.fillStyle = `rgba(150,120,90,${0.6 * forca})`; ctx.save(); ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr * 0.45); ctx.rotate(a * 3); ctx.fillRect(-10, -4, 20, 8); ctx.restore(); }
    ctx.restore();
  }
  // fundo da cena da mão: céu roxo, fenda enorme em cima puxando
  function fundoTornado(ctx, api) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2A0E5C'); g.addColorStop(0.5, '#170A36'); g.addColorStop(1, '#0B0620'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    tornado(ctx, api, 540, 260, 1100, 1); Efeitos.fenda(ctx, 540, 240, 1300, { t: api.t, abre: 1, semente: 8 });
  }
  // lágrimas escorrendo dos dois olhos (e voando para cima com o vento)
  function lagrimas(ctx, api, rig, forca) {
    if (!rig || !rig.pontoMundo) return;
    for (const sx of [-0.19, 0.19]) {
      const o = rig.pontoMundo('cabeca', [sx, -0.33]), b = rig.pontoMundo('cabeca', [sx * 1.05, -0.12]);
      const L = Math.hypot(b.x - o.x, b.y - o.y);
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(190,225,255,${0.75 * forca})`; ctx.lineWidth = Math.max(3, L * 0.09);
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.quadraticCurveTo(o.x + (b.x - o.x) * 0.4 + 4, o.y + (b.y - o.y) * 0.5, b.x, b.y); ctx.stroke();
      for (let k = 0; k < 3; k++) { const f = ((api.t * 1.4 + k / 3 + (sx > 0 ? 0.5 : 0)) % 1); ctx.fillStyle = `rgba(210,235,255,${(1 - f) * forca})`; ctx.beginPath(); ctx.ellipse(o.x + f * L * 0.2, o.y - f * L * 1.2, L * 0.07, L * 0.11, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
  // close chorando com o vento
  function closeChoro(ctx, api, item, quem) {
    fundoTornado(ctx, api);
    const z = api.lerp(1, 1.08, api.u / api.dur); ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
    const ex = quem === 'kaik' ? { ...P().medo, boca: { tipo: 'aberta', curva: -0.9, abertura: 0.04, largura: 0.055 } } : { ...P().preocupado, boca: { tipo: 'aberta', curva: -0.5, abertura: 0.025, largura: 0.05 } };
    const rig = close(api, { ...item, pose: 'parado', expressao: ex, voz: quem === 'kaik' ? 'amigo' : 'lucas' }, 540, 900, 560, { luz: { lado: quem === 'kaik' ? 1 : -1, cor: 'rgb(200,160,255)', forca: 0.9 }, vida: 2.5 });
    ctx.restore();
    lagrimas(ctx, api, rig, 1);
    vento(ctx, api, 0.9, 540, 260);
  }
  // as duas mãos: fase 0 = segurando firme (o Chede puxado para cima), 1 = solta em câmera lenta e o Chede some
  function maoDada(ctx, api, fase) {
    fundoTornado(ctx, api);
    const u = api.u, d = api.dur;
    const solta = fase === 1 ? fr(api, 0.5, 1, 'entra') : 0;
    const tremor = api.tremor(10); ctx.save(); ctx.translate(tremor[0], tremor[1]);
    // Kaik agachado no chão, braço bom esticado para cima
    ctx.fillStyle = '#1A1428'; ctx.fillRect(0, 1720, W, 200);
    const exK = fase === 1 && u > 0.6 * d ? 'medo' : 'raiva';
    const rk = api.personagem({ ...KAIK_T, pose: { braco_d: 160, antebraco_d: 5, braco_e: 25, antebraco_e: 80, tronco: 12, coxa_d: -60, canela_d: 90, coxa_e: -20, canela_e: 30 }, expressao: exK, vista: 'tq' }, 380, 1860, 760, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.8 }, vida: 3 });
    const mk = rk && rk.pontoMundo ? rk.pontoMundo('mao_d', [0, 0.25]) : { x: 520, y: 900 };
    // Chede de cabeça para cima da fenda (puxado), a mão dele encaixada na do Kaik
    const poseC = { braco_d: 170, antebraco_d: 0, braco_e: 140, antebraco_e: 25, coxa_d: -12, coxa_e: 18 };
    const exC = fase === 1 && u > 0.35 * d ? { ...P().raiva } : 'preocupado';
    const giro = Math.PI + 0.25 + Math.sin(api.t * 9) * 0.04;
    // 1) mede onde fica a mão do Chede (desenho invisível)
    ctx.save(); ctx.globalAlpha = 0; ctx.translate(0, 0); ctx.rotate(giro);
    const rm = api.personagem({ ...CHEDE_T, pose: poseC, expressao: exC }, 0, 0, 700, { parado: true });
    ctx.restore();
    const hm = rm && rm.pontoMundo ? rm.pontoMundo('mao_d', [0, 0.25]) : { x: 0, y: 0 };
    // 2) desenha de verdade com a mão no lugar certo (e subindo quando solta)
    const subir = solta * 1500;
    ctx.save(); ctx.translate(mk.x - hm.x + solta * 60, mk.y - hm.y - subir); ctx.rotate(giro + solta * 0.5);
    api.personagem({ ...CHEDE_T, pose: poseC, expressao: exC }, 0, 0, 700, { luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.8 }, vida: 3 });
    ctx.restore();
    if (solta < 0.12) brilho(ctx, mk.x, mk.y, 110, 0.4, '200,180,255');
    ctx.restore();
    vento(ctx, api, 1, 540, 240);
    if (fase === 1 && u > 0.35 * d && u < 0.75 * d) { const k = fr(api, 0.35, 0.45, 'volta'); ctx.save(); ctx.translate(540, 1300); ctx.scale(k, k); ctx.translate(-540, -1300); api.texto('CORRE!', 540, 1300, 170, { cor: '#FF5A4A' }); ctx.restore(); }
  }

  // hospital: 0 = Lia em coma (3 dias), 1 = Kaik de tipoia ao lado, 2 = luz roxa na mão + monitor dispara
  function hospital(ctx, api, cena, d) {
    const u = api.u;
    ctx.fillStyle = '#C9D2D8'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#AEB9C2'; ctx.fillRect(0, 1250, W, 670);
    // janela noturna
    ctx.fillStyle = '#0D1330'; ctx.fillRect(660, 260, 360, 520); ctx.strokeStyle = '#8A96A2'; ctx.lineWidth = 16; ctx.strokeRect(660, 260, 360, 520);
    const r = rng(3); for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,214,140,${0.4 + r() * 0.6})`; ctx.fillRect(670 + r() * 340, 520 + r() * 250, 4, 4); }
    const z = cena === 2 ? api.lerp(1, 1.25, fr(api, 0, 1)) : api.lerp(1, 1.05, u / d);
    const fx = cena === 2 ? 380 : 540, fy = cena === 2 ? 1140 : 1100;
    ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    // monitor
    const pico = cena === 2 && u > 0.55 * d;
    ctx.fillStyle = '#20262E'; ctx.fillRect(110, 360, 360, 250); ctx.fillStyle = '#0A1410'; ctx.fillRect(126, 376, 328, 218);
    ctx.strokeStyle = pico ? '#FF4A3A' : '#4BE08A'; ctx.lineWidth = 5; ctx.beginPath();
    for (let x = 0; x <= 320; x += 4) { const ph = (x / 320 * 3 + api.t * (pico ? 3 : 1)) % 1; const yv = ph > 0.45 && ph < 0.52 ? -70 * (pico ? 1.4 : 1) : ph > 0.52 && ph < 0.56 ? 40 : 0; x ? ctx.lineTo(130 + x, 485 + yv) : ctx.moveTo(130 + x, 485 + yv); }
    ctx.stroke();
    // cama
    ctx.fillStyle = '#E8ECEF'; ctx.fillRect(120, 1150, 780, 120); ctx.fillStyle = '#8A96A2'; ctx.fillRect(120, 1270, 780, 30); ctx.fillRect(130, 1300, 24, 160); ctx.fillRect(866, 1300, 24, 160);
    ctx.fillStyle = '#F4F6F8'; ctx.beginPath(); ctx.roundRect(140, 1070, 200, 100, 30); ctx.fill();
    // Lia deitada, coberta
    deitado(api, ctx, { ...LIA, pose: 'parado', expressao: fechado() }, 240, 1135, 700, -Math.PI / 2);
    ctx.fillStyle = '#B9D4E8'; ctx.beginPath(); ctx.roundRect(330, 1080, 560, 120, 20); ctx.fill();
    // mão da Lia para fora do lençol
    const mx = 560, my = 1150;
    ctx.fillStyle = Estilo.base.pele3; ctx.beginPath(); ctx.ellipse(mx, my, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
    if (cena === 2 && u > 0.3 * d) Efeitos.fenda(ctx, mx, my - 40, 120, { t: api.t, abre: Math.abs(Math.sin(api.t * 7)) * fr(api, 0.3, 0.5), semente: 6 });
    // gato no pé da cama
    if (cena >= 1) gato(ctx, 820, 1150, 130, { pose: 'sentado', t: api.t, espelhar: true });
    ctx.restore();
    // Kaik de tipoia sentado ao lado (cena 1)
    if (cena === 1) {
      const rk = api.personagem({ ...KAIK, pose: { braco_d: 40, antebraco_d: 110 }, expressao: 'preocupado', vista: 'tq', espelhar: true }, 960, 1900, 1000, { vida: 1 });
      const mk = rk && rk.pontoMundo ? rk.pontoMundo('antebraco_d', [0, 0.3]) : null; if (mk) { ctx.fillStyle = '#F2EDE6'; ctx.beginPath(); ctx.ellipse(mk.x, mk.y, 70, 44, 0.4, 0, Math.PI * 2); ctx.fill(); }
    }
    if (cena === 0) info(api, ctx, 'EM COMA', '3 DIAS', 1640, '#211B26', fr(api, 0.3, 0.6, 'volta'));
    if (pico) { ctx.fillStyle = `rgba(167,121,255,${0.25 * Math.abs(Math.sin(api.t * 8))})`; ctx.fillRect(0, 0, W, H); }
  }

  // capa (vídeo e Reels): A FENDA + PARTE FINAL, padrão do autor
  function capaFinal(ctx, api, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A0B3A'); g.addColorStop(0.5, '#3A1478'); g.addColorStop(1, '#0C0620'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 560); ctx.globalCompositeOperation = 'lighter';
    for (const [r, a] of [[430, 0.5], [360, 0.3]]) { ctx.strokeStyle = `rgba(190,140,255,${a})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    criatura(ctx, 540, 1180, 1050, { t, olhos: 1 });
    ctx.fillStyle = 'rgba(20,8,50,0.35)'; ctx.fillRect(0, 0, W, 1250);
    close(api, { ...LIA_T, pose: 'parado', expressao: 'determinado', vista: 'tq' }, 220, 760, 300, { parado: true, luz: { lado: 1, cor: 'rgb(190,150,255)', forca: 0.8 } });
    close(api, { ...KAIK_T, pose: 'maos-na-cintura', expressao: 'determinado', vista: 'tq', espelhar: true }, 870, 770, 300, { parado: true, luz: { lado: -1, cor: 'rgb(190,150,255)', forca: 0.8 } });
    const rig = close(api, { ...CHEDE_T, pose: { braco_d: 68, antebraco_d: 20, braco_e: -8, antebraco_e: 4 }, expressao: 'determinado' }, 560, 720, 400, { parado: true, luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 } });
    const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.25]) : { x: 300, y: 1050 };
    Efeitos.fenda(ctx, Math.max(260, m.x), m.y - 20, 380, { t, abre: 1, semente: 9 });
    const f = ctx.createLinearGradient(0, 1150, 0, 1750); f.addColorStop(0, 'rgba(12,6,32,0)'); f.addColorStop(0.35, 'rgba(12,6,32,0.85)'); f.addColorStop(1, 'rgba(12,6,32,0.95)'); ctx.fillStyle = f; ctx.fillRect(0, 1150, W, H - 1150);
    const metal = (txt, y, tam, cores) => {
      ctx.save(); ctx.font = `900 ${tam}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let k = 1; while (ctx.measureText(txt).width * k > 1000) k -= 0.02; ctx.translate(540, y); ctx.scale(k, 1);
      ctx.shadowColor = 'rgba(167,121,255,0.9)'; ctx.shadowBlur = 34; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A0B30'; ctx.lineWidth = tam * 0.16; ctx.strokeText(txt, 0, 0); ctx.shadowBlur = 0;
      const gr = ctx.createLinearGradient(0, -tam * 0.5, 0, tam * 0.5); cores.forEach(([o, c]) => gr.addColorStop(o, c)); ctx.fillStyle = gr; ctx.fillText(txt, 0, 0); ctx.restore();
    };
    Efeitos.fenda(ctx, 540, 1340, 900, { t, abre: 0.25, semente: 2 });
    metal('A FENDA', 1340, 200, [[0, '#F3EBFF'], [0.5, '#C9A6FF'], [1, '#7B4DFF']]);
    ctx.save(); ctx.translate(540, 1560);
    ctx.fillStyle = '#2A1060'; ctx.strokeStyle = '#EBC25A'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(-262, -70); ctx.lineTo(262, -70); ctx.lineTo(300, 0); ctx.lineTo(262, 70); ctx.lineTo(-262, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(235,194,90,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-480, 0); ctx.lineTo(-320, 0); ctx.moveTo(320, 0); ctx.lineTo(480, 0); ctx.stroke();
    ctx.restore();
    metal('PARTE FINAL', 1563, 92, [[0, '#FFF2B0'], [0.45, '#FFC83D'], [0.55, '#D98A12'], [1, '#FFD45E']]);
  }
})();

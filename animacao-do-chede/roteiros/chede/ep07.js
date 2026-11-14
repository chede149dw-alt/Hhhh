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
    const cam = api.camera({ nevoa: NEV, distNevoa: 30, ...camOpts });
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
  const NEV = Cenarios3D.cidade.nevoa;
  // olho na cabeça do rig (unidades da cabeça) e raio do anel em fração da altura do close
  const OLHO_SX = 0.1, OLHO_DY = -0.14, OLHO_R = 0.048;
  const DOR = () => ({ ...P().raiva, palpebra: 0.7, sobrancelha: { y: 0.02, ang: 14 }, boca: { tipo: 'aberta', curva: -0.6, abertura: 0.04, largura: 0.07 } });
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
  // cenário da cidade à noite (Cenarios3D.cidade: avenida larga, prédios dos dois lados, nada no meio da rua)
  function cidade(ctx, api, cam, o = {}) {
    Cenarios3D.cidade.desenhar(ctx, cam, { t: api.t, acesas: o.acesas === undefined ? 1 : o.acesas, zApaga: o.zApaga === undefined ? 999 : o.zApaga, apagados: o.apagados, destruicao: o.destruicao || 0, beco: o.beco, semPoste: o.semPoste });
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

  // ---------- efeitos da batalha (estilhaços, poeira, rachadura, linhas de impacto) ----------
  // estilhaços 3D com gravidade; k = segundos desde a explosão. o: { v, dir:[x,y,z], tam, cor, g }
  function estilhacos(ctx, cam, X, Y, Z, k, n, sem, o = {}) {
    if (k <= 0) return; const r = rng(sem), g = o.g === undefined ? 9.8 : o.g, v0 = o.v || 8, dir = o.dir || [0, 0.6, 0];
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, b = (r() - 0.3) * Math.PI * 0.6, v = v0 * (0.35 + r() * 0.9), sz = (o.tam || 0.22) * (0.4 + r() * 1.1);
      const vx = Math.cos(a) * Math.cos(b) * v * 0.6 + dir[0] * v, vy = Math.sin(b) * v * 0.6 + dir[1] * v, vz = Math.sin(a) * Math.cos(b) * v * 0.6 + dir[2] * v;
      let y = Y + vy * k - 0.5 * g * k * k; const x = X + vx * k, z = Z + vz * k;
      if (y < 0) y = 0;
      const q = cam.p(x, y + sz / 2, z); if (q.dz < 0.5) continue;
      const R = sz * q.s; if (R < 0.6) continue;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(r() * 6 + k * (r() - 0.5) * 18);
      ctx.fillStyle = o.cor || (i % 3 ? '#454660' : '#5D5B78'); ctx.beginPath(); ctx.moveTo(-R, -R * 0.4); ctx.lineTo(R * 0.2, -R); ctx.lineTo(R, R * 0.3); ctx.lineTo(-R * 0.3, R * 0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(200,200,255,0.35)'; ctx.fillRect(-R * 0.5, -R * 0.6, R * 0.6, R * 0.18);
      ctx.restore();
    }
  }
  // nuvem de poeira se abrindo; k 0..1
  function nuvem(ctx, cam, X, Y, Z, k, R, sem, cor = '110,100,140', a0 = 0.55) {
    if (k <= 0 || k >= 1) return; const r = rng(sem), e = 1 - Math.pow(1 - k, 3);
    for (let i = 0; i < 12; i++) {
      const a = r() * Math.PI * 2, d = R * e * (0.3 + r() * 0.7), q = cam.p(X + Math.cos(a) * d, Y + Math.abs(Math.sin(a)) * d * 0.4 + e * 0.6, Z + Math.sin(a) * d * 0.5);
      if (q.dz < 0.5) continue; const rr = R * (0.35 + 0.5 * e) * (0.6 + r() * 0.6) * q.s;
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr); g.addColorStop(0, `rgba(${cor},${a0 * (1 - k)})`); g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g; ctx.fillRect(q.x - rr, q.y - rr, 2 * rr, 2 * rr);
    }
  }
  // rachadura numa parede vertical (plano x = Xw) ou no chão (plano y = 0, eixo: 'chao'); k 0..1 cresce
  function racha(ctx, cam, P, k, sem, esc = 1, plano = 'parede') {
    if (k <= 0) return; const r = rng(sem);
    const pt = (a, b) => (plano === 'parede' ? cam.p(P[0], P[1] + a, P[2] + b) : cam.p(P[0] + b, 0.02, P[2] + a));
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // cratera
    const cr = 0.5 * esc * Math.min(1, k * 4), c = pt(0, 0);
    if (!c.atras) {
      ctx.fillStyle = 'rgba(10,8,20,0.85)'; ctx.beginPath();
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr = cr * (0.7 + r() * 0.5), q = pt(Math.sin(a) * rr, Math.cos(a) * rr); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(190,190,230,0.6)'; ctx.lineWidth = Math.max(1, 0.06 * c.s); ctx.stroke();
      // lascas em volta da cratera
      for (let i = 0; i < 8; i++) { const a = r() * Math.PI * 2, rr = cr * (1.1 + r() * 0.5), q = pt(Math.sin(a) * rr, Math.cos(a) * rr), z = Math.max(2, 0.08 * c.s); ctx.fillStyle = 'rgba(20,16,34,0.8)'; ctx.fillRect(q.x - z / 2, q.y - z / 2, z, z * 0.7); }
    }
    const linha = (pts, w) => {
      const q = pts.map(([a, b]) => pt(a, b)); if (q.some((v) => v.atras)) return;
      ctx.strokeStyle = 'rgba(12,10,22,0.9)'; ctx.lineWidth = Math.max(1, w * c.s); ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,190,235,0.4)'; ctx.lineWidth = Math.max(0.6, w * 0.5 * c.s); ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v.x + 2, v.y + 2) : ctx.moveTo(v.x + 2, v.y + 2))); ctx.stroke();
    };
    for (let i = 0; i < 12; i++) {
      let ang = (i / 12) * Math.PI * 2 + r() * 0.4, a = 0, b = 0; const pts = [[0, 0]], L = (0.7 + r() * 1.5) * esc * k;
      for (let j = 0; j < 8; j++) {
        ang += (j % 2 ? 1 : -1) * (0.25 + r() * 0.35); a += (Math.sin(ang) * L) / 8; b += (Math.cos(ang) * L) / 8; pts.push([a, b]);
        if (j === 3 && r() < 0.7) { let a2 = a, b2 = b, an2 = ang + (r() < 0.5 ? 0.9 : -0.9); const p2 = [[a, b]]; for (let m = 0; m < 4; m++) { an2 += (r() - 0.5) * 0.6; a2 += (Math.sin(an2) * L) / 10; b2 += (Math.cos(an2) * L) / 10; p2.push([a2, b2]); } linha(p2, 0.008 * esc); }
      }
      linha(pts, 0.018 * esc);
    }
    ctx.restore();
  }
  // linhas de impacto estilo anime saindo de um ponto (de fora para dentro)
  function linhasImpacto(ctx, x, y, a, sem, cor = '255,255,255', rMin = 260) {
    if (a <= 0) return; const r = rng(sem + Math.floor(a * 3));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 70; i++) {
      const ang = r() * Math.PI * 2, r0 = rMin + r() * 260, w = 2 + r() * 10;
      ctx.fillStyle = `rgba(${cor},${a * (0.4 + r() * 0.6)})`;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(ang - 0.004 * w) * r0, y + Math.sin(ang - 0.004 * w) * r0);
      ctx.lineTo(x + Math.cos(ang) * 2200, y + Math.sin(ang) * 2200); ctx.lineTo(x + Math.cos(ang + 0.004 * w) * r0, y + Math.sin(ang + 0.004 * w) * r0); ctx.fill();
    }
    ctx.restore();
  }
  // linhas de velocidade (radiais a partir do ponto de fuga)
  function linhasVel(ctx, cx, cy, a, t, cor = '220,245,255') {
    if (a <= 0) return; const r = rng(77);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      const ang = r() * Math.PI * 2, sp = 0.6 + r() * 1.4, ph = (t * sp * 2.2 + r()) % 1, r0 = 200 + ph * 1400, len = 120 + ph * 700;
      ctx.strokeStyle = `rgba(${cor},${a * ph * (0.3 + r() * 0.5)})`; ctx.lineWidth = 1 + ph * 4;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); ctx.lineTo(cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len)); ctx.stroke();
    }
    ctx.restore();
  }
  // quadro de impacto: cores invertidas (anime)
  function inverte(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // quadro de impacto (mangá): tela branca com linhas pretas saindo do ponto
  function quadroImpacto(ctx, x, y, sem) { clarao(ctx, 0.92, '250,250,255'); linhasImpacto(ctx, x, y, 1, sem, '10,6,24', 180); }
  function clarao(ctx, a, cor = '255,255,255') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${cor},${Math.min(1, a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // brasas/poeira flutuando na tela (clima de batalha)
  function brasas(ctx, api, n = 40, a = 1) {
    const r = rng(19); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const x = (r() * W + Math.sin(api.t * 0.7 + i) * 40 + api.t * 30 * (r() - 0.3)) % W, y = H - ((r() * H + api.t * (40 + r() * 80)) % H), s = 1.5 + r() * 3.5;
      ctx.fillStyle = `rgba(255,${140 + r() * 80},${60 + r() * 60},${a * (0.25 + 0.5 * r()) * (0.6 + 0.4 * Math.sin(api.t * 5 + i))})`;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // poses
  const SENTADO_PAREDE = { tronco: -6, cabeca: 16, coxa_d: -82, canela_d: 12, pe_d: 10, coxa_e: -70, canela_e: 38, pe_e: 5, braco_d: 8, antebraco_d: -18, braco_e: -6, antebraco_e: -30 };
  const ESMAGADO = { tronco: -14, cabeca: -18, braco_d: 120, antebraco_d: 30, braco_e: 100, antebraco_e: 20, coxa_d: 25, canela_d: 30, coxa_e: -20, canela_e: 45 };
  const SOCO_AR = { tronco: 22, cabeca: -6, braco_d: -92, antebraco_d: -2, braco_e: 70, antebraco_e: -110, coxa_d: 35, canela_d: 70, coxa_e: -55, canela_e: 80, pe_d: 20, _maos: { d: 'punho', e: 'punho' } };
  const AGACHA = { tronco: 35, cabeca: -20, braco_d: 55, antebraco_d: -40, braco_e: 60, antebraco_e: -50, coxa_d: -70, canela_d: 110, coxa_e: -40, canela_e: 120, _desloca: [0, 0.18] };
  const PULO = { tronco: 18, cabeca: -12, braco_d: -60, antebraco_d: -70, braco_e: 50, antebraco_e: -90, coxa_d: -60, canela_d: 90, coxa_e: 30, canela_e: 40, _maos: { d: 'punho', e: 'punho' } };
  // braços do Kaik em primeira pessoa (manga marinho com faixa turquesa, punho fechado)
  function bracosPOV(ctx, api, vel) {
    const f = api.t * 2 * Math.PI * (1.6 + vel * 0.6);
    for (const l of [-1, 1]) {
      const s = Math.sin(f + (l > 0 ? Math.PI : 0)), x = 540 + l * 360 + l * s * 20, y = 1780 - s * 170 * (1 - vel * 0.6), ang = l * (0.35 - s * 0.15);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.fillStyle = '#1F2B52'; ctx.beginPath(); ctx.roundRect(-95, -40, 190, 520, 80); ctx.fill();
      ctx.fillStyle = '#41D8CB'; ctx.fillRect(l > 0 ? -95 : 75, -10, 20, 470);
      ctx.fillStyle = '#16203F'; ctx.beginPath(); ctx.roundRect(-100, -60, 200, 70, 30); ctx.fill();
      // punho
      ctx.fillStyle = '#E9B892'; ctx.beginPath(); ctx.roundRect(-82, -175, 164, 130, 55); ctx.fill();
      ctx.fillStyle = '#D29E7A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.roundRect(-74 + k * 38, -182, 34, 40, 15); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.beginPath(); ctx.roundRect(-60, -165, 60, 30, 12); ctx.fill();
      ctx.restore();
      // aura ciano nos punhos
      brilho(ctx, x - l * 30, y - 120, 220, 0.35 * vel, '89,216,255');
    }
  }
  // parede de prédio (concreto) no plano x = Xw, de z0 a z1, com placas e uma vitrine
  function paredeConcreto(ctx, cam, Xw, z0, z1, h) {
    const q = [[Xw, 0, z0], [Xw, 0, z1], [Xw, h, z1], [Xw, h, z0]].map((P) => cam.p(...P)); if (q.some((v) => v.atras)) return;
    const g = ctx.createLinearGradient(0, (q[0].y + q[1].y) / 2, 0, (q[2].y + q[3].y) / 2);
    g.addColorStop(0, '#5B5470'); g.addColorStop(0.3, '#433F5E'); g.addColorStop(1, '#22213D');
    ctx.fillStyle = g; ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(15,12,30,0.45)'; ctx.lineWidth = 2;
    for (let y = 3.2; y < h; y += 3.2) { const a = cam.p(Xw, y, z0), b = cam.p(Xw, y, z1); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    for (let z = z0 + 4; z < z1; z += 4) { const a = cam.p(Xw, 0, z), b = cam.p(Xw, h, z); if (a.atras) continue; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    // rodapé
    const r0 = cam.p(Xw, 0.4, z0), r1 = cam.p(Xw, 0.4, z1); ctx.strokeStyle = 'rgba(10,8,22,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y); ctx.stroke();
    // janelas dos andares de cima
    for (let y = 4.4; y + 1.7 < h; y += 3.2) for (let z = z0 + 1; z + 1.4 < z1; z += 2.6) {
      const ac = rng(Math.floor(y * 13 + z * 7))() < 0.45;
      const w = [[Xw - 0.01, y, z], [Xw - 0.01, y, z + 1.3], [Xw - 0.01, y + 1.7, z + 1.3], [Xw - 0.01, y + 1.7, z]].map((P) => cam.p(...P)); if (w.some((v) => v.atras)) continue;
      ctx.fillStyle = ac ? '#E9C487' : '#1A1C36'; ctx.beginPath(); w.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath(); ctx.fill();
    }
  }

  // ---------- planos ----------
  const CAM_RUA = (api, o) => api.orbita({ nevoa: NEV, distNevoa: 70, f: 1150, ySalvo: 1000, ...o });
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
      const cam = api.camera({ f: 1150, x: 0.3, y: 1.6, z: api.lerp(0, 1.2, u / d), cy: 980, nevoa: NEV });
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
      cidade(ctx, api, cam, { zApaga: 6, acesas: 0.3 , destruicao: 0.6 });
      criatura3d(ctx, cam, 0.5, 26, 10, { t: api.t });
      if (u > 1.2) info(api, ctx, 'ALTURA', '10 m', 1580, ROXO, fr(api, 1.2, 1.5, 'volta'));
    },
    energia(ctx, u, d, api) {
      // a mão gigante agarra um poste: faíscas, o poste apaga e ela incha
      const cam = CAM_RUA(api, { alvo: [-2, 5, 16], raio: 10, ang: api.lerp(-0.35, -0.2, u / d), altura: 2.2, ySalvo: 1060 });
      const pega = fr(api, 0.2, 0.55), comeu = fr(api, 0.55, 1);
      cidade(ctx, api, cam, { zApaga: 999, acesas: 0.4, apagados: pega > 0.95 ? [18] : [], destruicao: 0.4 });
      criatura3d(ctx, cam, -1.2, 21, 10 + comeu * 0.8, { t: api.t, bracoD: 0.55 * pega, garra: pega, cresce: comeu, inclina: -4 * pega });
      const pt = cam.p(-4.5, 8.5, 18);
      if (pega > 0.6 && comeu < 0.6) { faiscas(ctx, pt.x, pt.y, 34, 1.2 * pt.s, api.t, 3); brilho(ctx, pt.x, pt.y, 2.5 * pt.s, 0.8 * (1 - comeu), '190,150,255'); }
      if (comeu > 0) { const q = cam.p(-1.2, 6, 21); brilho(ctx, q.x, q.y, 6 * q.s * (1 - comeu), 0.6 * (1 - comeu), '190,150,255'); }
      brasas(ctx, api, 20, 0.6);
    },
    kaikcorre(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 3, 16], raio: 12, ang: api.lerp(-0.3, 0.1, u / d), altura: 3.2, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 4, acesas: 0.3 , destruicao: 0.6 });
      criatura3d(ctx, cam, 0, 18, 10, { t: api.t });
      const n = 40; let prev = null;
      for (let i = 0; i <= n; i++) { const a = api.t * 9 - i * 0.09, X = Math.cos(a) * 3.2, Z = 18 + Math.sin(a) * 2.2, q = cam.p(X, 0.9, Z); if (prev && q.dz > 1) rastro(ctx, prev.x, prev.y, q.x, q.y, 0.6 * q.s, 1 - i / n); prev = q; }
      info(api, ctx, 'KAIK', '1.000 km/h', 1580, '#59D8FF', fr(api, 0.2, 0.5, 'volta'));
    },
    tapa(ctx, u, d, api) {
      const k = u / d;
      if (k < 0.6) {
        // plano aberto: o Kaik girando no pé dela; ela abre a mão sem olhar e acerta
        const cam = CAM_RUA(api, { alvo: [0.8, 3.4, 16], raio: 10, ang: 0.22, altura: 1.3, ySalvo: 1120 });
        const imp = fr(api, 0.5, 0.52), [tx, ty] = api.tremor(k > 0.52 ? 22 * (1 - fr(api, 0.52, 0.6)) : 0);
        ctx.save(); ctx.translate(tx, ty);
        cidade(ctx, api, cam, { zApaga: 4, acesas: 0.35, destruicao: 0.5 });
        const golpe = fr(api, 0.38, 0.52, 'entra');
        criatura3d(ctx, cam, 0.4, 19, 10, { t: api.t, bracoD: golpe * 1.05, garra: 0.4 + 0.6 * golpe });
        if (k < 0.52) {
          const n = 30; let prev = null;
          for (let i = 0; i <= n; i++) { const a = api.t * 7 - i * 0.1, q = cam.p(Math.cos(a) * 3.4, 0.9, 19 + Math.sin(a) * 2.4); if (prev && q.dz > 1) rastro(ctx, prev.x, prev.y, q.x, q.y, 0.5 * q.s, 1 - i / n); prev = q; }
          const a = api.t * 7, X = Math.cos(a) * 3.4, Z = 19 + Math.sin(a) * 2.4;
          if (Z < 19) api.personagem3d(cam, { ...KAIK, pose: 'parado', expressao: 'determinado' }, X, Z, 1.75, { luz: LUZ_NOITE, rumo: Math.atan2(Math.sin(a), -Math.cos(a)), correr: api.t * 1.6 });
        } else {
          const q = cam.p(3.2, 1.2, 17.5);
          onda(ctx, q.x, q.y, fr(api, 0.52, 0.6), 520); faiscas(ctx, q.x, q.y, 30, 220, api.t, 5);
          const s = fr(api, 0.52, 0.58, 'sai'); rastro(ctx, q.x, q.y, q.x + 1400 * s, q.y - 160 * s, 60, 1);
          if (s < 0.4) clarao(ctx, 0.85 * (1 - s / 0.4));
        }
        ctx.restore();
        if (k > 0.515 && k < 0.535) { const q = cam.p(3.2, 1.2, 17.5); quadroImpacto(ctx, q.x, q.y, 3); }
        void imp;
        return;
      }
      // contraplano: ele bate na parede do prédio, a parede racha e ele fica escorado
      const Zk = 60, Xw = 8.6, b = fr(api, 0.6, 0.66, 'entra'), bate = k >= 0.66;
      const [tx, ty] = api.tremor(bate ? 30 * (1 - fr(api, 0.66, 0.8)) : 6);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 980, x: 4.2, y: 1.2, z: Zk - 5.6, yaw: 0.68, cy: 1100, nevoa: NEV, distNevoa: 70 });
      Cenarios3D.cidade.desenhar(ctx, cam, { t: api.t, acesas: 0.35, zApaga: 4, destruicao: 0.5, semPoste: (s, Z) => s > 0 && Z > Zk - 8 && Z < Zk + 14 });
      criatura3d(ctx, cam, -1.5, Zk + 45, 10, { t: api.t, olhos: 0.8 });
      paredeConcreto(ctx, cam, Xw, Zk - 12, Zk + 16, 16);
      const P = [Xw - 0.01, 1.45, Zk];
      racha(ctx, cam, P, fr(api, 0.66, 0.78, 'sai'), 31, 1.2);
      if (!bate) {
        // voando de lado contra a parede
        const X = api.lerp(1.5, Xw - 0.35, b), Y = api.lerp(1.6, 0.55, b);
        const q0 = cam.p(X - 3, Y + 0.9, Zk + 0.4), q1 = cam.p(X, Y + 0.9, Zk);
        rastro(ctx, q0.x, q0.y, q1.x, q1.y, 0.9 * q1.s, 0.8);
        api.personagem3d(cam, { ...KAIK, pose: ESMAGADO, expressao: DOR() }, X, Zk, 1.75, { luz: LUZ_NOITE, y: Y, rumo: Math.PI / 2, parado: true });
      } else {
        // escorrega pela parede até sentar (poeira e pedaços atrás dele)
        const desce = fr(api, 0.7, 0.84, 'sai'), dt = (k - 0.66) * d;
        nuvem(ctx, cam, P[0] - 0.3, P[1], P[2], fr(api, 0.66, 0.95), 1.3, 4, '150,140,175', 0.45);
        estilhacos(ctx, cam, P[0], P[1], P[2], dt, 34, 8, { v: 5, dir: [-0.8, 0.4, 0], tam: 0.14 });
        api.personagem3d(cam, { ...KAIK, pose: ESMAGADO, pose2: SENTADO_PAREDE, mistura: desce, expressao: desce > 0.8 ? fechado() : DOR() }, Xw - 0.38, Zk, 1.75, { luz: LUZ_NOITE, y: api.lerp(0.55, -0.62, desce), rumo: Math.PI / 2, parado: true });
        nuvem(ctx, cam, Xw - 0.6, 0.1, Zk + 0.3, fr(api, 0.8, 1), 0.9, 5, '140,130,165', 0.3);
        if (k < 0.68) clarao(ctx, 0.9 * (1 - fr(api, 0.66, 0.68)));
      }
      ctx.restore();
      if (bate && k < 0.68) { const q = cam.p(P[0], P[1], P[2]); quadroImpacto(ctx, q.x, q.y, 7); }
      info(api, ctx, 'VOOU', '30 m', 1600, AMARELO, fr(api, 0.72, 0.84, 'volta'));
    },
    moeda(ctx, u, d, api) {
      const z = api.lerp(1, 1.05, u / d);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      const camada = api.camada(), g = camada.getContext('2d'); const cam = api.camera({ f: 1100, x: 0.4, y: 1.4, z: 1.2, cy: 980, nevoa: NEV });
      cidade(g, api, cam, { zApaga: 4, acesas: 0.3 }); api.desfocar(camada, 14);
      const rig = close(api, { ...CHEDE, pose: { braco_d: 70, antebraco_d: 20 }, expressao: 'medo' }, 600, 760, 300, { luz: LUZ_NOITE, vida: 2 });
      ctx.restore();
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.3]) : { x: 400, y: 1100 };
      Efeitos.fenda(ctx, Math.max(260, m.x), m.y - 30, 120 + Math.sin(api.t * 30) * 10, { t: api.t, abre: 1, semente: 3 });
      info(api, ctx, 'COM MEDO', 'MOEDA', 1580, ROXO, fr(api, 0.5, 0.8, 'volta'));
    },
    fugir(ctx, u, d, api) {
      // câmera correndo junto (3/4 de frente); a criatura vem atrás e soca o asfalto
      const v = 7.5, Zg = 34 - v * u, k = u / d;
      const slam = fr(api, 0.38, 0.45, 'entra'), dt = Math.max(0, u - 0.45 * d);
      const [tx, ty] = api.tremor(dt > 0 ? 26 * Math.max(0, 1 - dt / 0.8) : 3);
      ctx.save(); ctx.translate(tx, ty);
      const cam = CAM_RUA(api, { alvo: [0.4, 1.15, Zg], raio: 6.2, ang: 0.6, altura: 1.25, f: 950, ySalvo: 1100 });
      cidade(ctx, api, cam, { zApaga: 4, acesas: 0.35, destruicao: 0.6 });
      const Pc = [3.0, 0, Zg + 9];
      racha(ctx, cam, Pc, fr(api, 0.45, 0.6, 'sai'), 12, 3, 'chao');
      criatura3d(ctx, cam, 4.4, Zg + 14, 10, { t: api.t, bracoD: slam < 1 ? 0.2 + slam * 0.6 : 0.8 - fr(api, 0.6, 1) * 0.5, garra: 1, inclina: 8 * slam });
      if (dt > 0) {
        estilhacos(ctx, cam, Pc[0], 0.2, Pc[2], dt, 40, 3, { v: 9, dir: [-0.2, 0.9, -0.4], tam: 0.4 });
        nuvem(ctx, cam, Pc[0], 0, Pc[2], fr(api, 0.45, 1), 6, 7, '110,100,140', 0.6);
        
      }
      const corre = [[CHEDE, -0.9, 0.3, 1.75, 0], [LIA, 0.5, 0.9, 1.65, 0.33], [KAIK, 1.6, -0.3, 1.75, 0.6]];
      emOrdem(cam, corre.map(([it, X, dz, h, ph]) => [X, Zg + dz, () => {
        api.personagem3d(cam, { ...it, pose: 'parado', expressao: 'medo' }, X, Zg + dz, h, { luz: LUZ_NOITE, rumo: 0, correr: api.t + ph, velocidade: 1.15 });
        // poeira dos passos
        const pp = (api.t * 1.45 * 1.15 + ph) % 0.5; nuvem(ctx, cam, X, 0, Zg + dz + 0.4, pp * 2, 0.5, Math.floor(api.t * 3 + ph * 7), '140,130,170', 0.35);
      }]));
      ctx.restore();
      vento(ctx, api, 0.25, 540, 900);
      brasas(ctx, api, 30, 0.8);
      void k;
    },
    // ATO 2
    beco(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 1.2, 4], raio: 5, ang: api.lerp(-0.6, -0.2, u / d), altura: 1.6 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, beco: true });
      const far = fr(api, 0.1, 0.4);
      for (const [X, Z] of [[-2.6, 0.5], [2.6, 8.5]]) { const q = cam.p(X, 0.7, Z); if (q.dz > 1) { brilho(ctx, q.x - 0.5 * q.s, q.y, 2.2 * q.s * far, far); brilho(ctx, q.x + 0.5 * q.s, q.y, 2.2 * q.s * far, far); } }
      trio(api, ctx, cam, [[-0.6, 4.0], [0.3, 3.7], [1.1, 4.3]], { alvo: [-2.6, 0.5] });
    },
    carros(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 1.2, 5], raio: 6, ang: api.lerp(0.2, 0.6, u / d), altura: 1.5 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, beco: true });
      const lista = [];
      for (let i = 0; i < 4; i++) { const X = -2 + i * 1.3, Z = 9 + (i % 2) * 0.6; lista.push([X, Z, () => api.personagem3d(cam, { ...AGENTE, pose: 'parado', expressao: 'neutro' }, X, Z, 1.8, { luz: LUZ_NOITE, olhaPara: [0, 4] })]); }
      [[-0.6, 4.0], [0.3, 3.7], [1.1, 4.3]].forEach((p0, i) => lista.push([p0[0], p0[1], () => api.personagem3d(cam, { ...[CHEDE, KAIK, LIA][i], pose: 'parado', expressao: 'preocupado' }, p0[0], p0[1], i === 2 ? 1.65 : 1.75, { luz: LUZ_NOITE, olhaPara: [0, 9] })]));
      emOrdem(cam, lista);
    },
    mulher(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.6, 1.4, 6.5], raio: api.lerp(4, 3.2, u / d), ang: 0.35, altura: 1.55 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, beco: true });
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
      const k = u / d;
      if (k < 0.36) {
        // o Kaik aperta os olhos, desconfiado
        const camada = api.camada(), g = camada.getContext('2d'); const cam = api.camera({ f: 1100, x: -0.6, y: 1.5, z: 2.6, cy: 980, nevoa: NEV, distNevoa: 40 });
        cidade(g, api, cam, { zApaga: 0, acesas: 0.25, beco: true }); api.desfocar(camada, 16);
        const z = api.lerp(1, 1.06, fr(api, 0, 0.36));
        ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
        close(api, { ...KAIK, pose: 'parado', expressao: { ...P().serio, palpebra: 0.55, sobrancelha: { y: 0.03, ang: -14 }, olhar: [0.01, 0] }, vista: 'tq' }, 520, 860, 600, { luz: LUZ_NOITE, vida: 0.6 });
        ctx.restore();
        return;
      }
      // close nos olhos da mulher: o anel dourado acende em volta da íris
      const camada = api.camada(), g = camada.getContext('2d'); const cam = api.camera({ f: 1100, x: 0.8, y: 1.5, z: 3, cy: 980, nevoa: NEV, distNevoa: 40 });
      cidade(g, api, cam, { zApaga: 0, acesas: 0.25, beco: true }); api.desfocar(camada, 18);
      const z = api.lerp(1.55, 1.9, fr(api, 0.36, 1, 'sai'));
      ctx.save(); ctx.translate(540, 760); ctx.scale(z, z); ctx.translate(-540, -760);
      const rig = close(api, { ...MULHER, pose: 'parado', expressao: { ...P().neutro, pupila: 0.7 } }, 540, 860, 560, { luz: LUZ_NOITE, vida: 0.3 });
      const a = fr(api, 0.55, 0.8);
      if (rig && rig.pontoMundo && a > 0) for (const sx of [-OLHO_SX, OLHO_SX]) {
        const e = rig.pontoMundo('cabeca', [sx, -0.37 + OLHO_DY]), R = OLHO_R * 560;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gl = ctx.createRadialGradient(e.x, e.y, R * 0.5, e.x, e.y, R * 3.2); gl.addColorStop(0, `rgba(255,190,60,${0.55 * a})`); gl.addColorStop(1, 'rgba(255,170,40,0)');
        ctx.fillStyle = gl; ctx.fillRect(e.x - R * 3.2, e.y - R * 3.2, R * 6.4, R * 6.4);
        ctx.strokeStyle = `rgba(255,214,90,${a})`; ctx.lineWidth = R * 0.28; ctx.beginPath(); ctx.arc(e.x, e.y, R * 1.0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,250,210,${a})`; ctx.lineWidth = R * 0.1; ctx.beginPath(); ctx.arc(e.x, e.y, R * 1.0, api.t * 3, api.t * 3 + Math.PI * 1.2); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    },
    aceitam(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.2, 1.4, 4.0], raio: api.lerp(3.2, 2.6, u / d), ang: api.lerp(-0.2, 0.2, u / d), altura: 1.55 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.1, beco: true });
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
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 , destruicao: 0.6 });
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
      // primeira pessoa: a visão do Kaik descendo a avenida reta, cada vez mais rápido, até a criatura
      const k = u / d, vel = fr(api, 0.05, 0.75, 'entra');
      const Zc = 20 + 6 * u + 32 * u * u * u / 3 * 2; // posição (acelera)
      const Zcri = Zc + 16 + 380 * Math.pow(1 - k, 1.6);
      const bob = Math.sin(api.t * 2 * Math.PI * 2.4) * 0.08 * (1 - vel);
      const cam = api.camera({ f: api.lerp(900, 620, vel), x: Math.sin(api.t * 1.3) * 0.15, y: 1.55 + bob, z: Zc, cy: 960 + Math.sin(api.t * 2 * Math.PI * 2.4 + 1) * 12 * (1 - vel), nevoa: NEV, distNevoa: 110 });
      const camada = api.camada(), g = camada.getContext('2d');
      cidade(g, api, cam, { zApaga: 0, acesas: 0.2, destruicao: 0.6 });
      criatura3d(g, cam, 0.5, Zcri, 15, { t: api.t, bracoD: 0.2 });
      // borrão de zoom (velocidade): várias cópias ampliadas a partir do ponto de fuga
      ctx.drawImage(camada, 0, 0);
      const n = 5;
      for (let i = 1; i <= n; i++) { const s = 1 + i * 0.022 * vel; ctx.save(); ctx.globalAlpha = 0.32 * vel; ctx.translate(540, 960); ctx.scale(s, s); ctx.translate(-540, -960); ctx.drawImage(camada, 0, 0); ctx.restore(); }
      // estrondo sônico: anel de vapor quando passa da velocidade do som
      const boom = fr(api, 0.3, 0.55);
      if (boom > 0 && boom < 1) { ctx.save(); ctx.strokeStyle = `rgba(230,245,255,${0.7 * (1 - boom)})`; ctx.lineWidth = 60 * (1 - boom) + 6; ctx.beginPath(); ctx.ellipse(540, 960, 200 + boom * 900, 260 + boom * 1300, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); if (boom < 0.15) clarao(ctx, 0.5 * (1 - boom / 0.15)); }
      // vidros estourando dos dois lados
      if (k > 0.32) for (let j = 0; j < 4; j++) {
        const z0 = Zc + 8 + j * 9; const s = j % 2 ? 1 : -1;
        estilhacos(ctx, cam, s * 9.7, 5 + j * 2, z0, 0.15 + ((api.t * 3 + j * 0.25) % 0.6), 14, 40 + j, { v: 6, dir: [-s * 0.9, 0.2, -0.6], tam: 0.25, cor: 'rgba(170,220,255,0.75)', g: 4 });
      }
      linhasVel(ctx, 540, 960, 0.25 + 0.75 * vel, api.t);
      // aura ciano nas bordas da tela
      ctx.save(); const gv = ctx.createRadialGradient(540, 960, 500, 540, 960, 1150); gv.addColorStop(0, 'rgba(89,216,255,0)'); gv.addColorStop(1, `rgba(89,216,255,${0.35 * vel})`); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H); ctx.restore();
      // faíscas da sola de cerâmica lá embaixo
      faiscas(ctx, 540, 1960, 30, 260 * (0.5 + vel), api.t, 9);
      bracosPOV(ctx, api, vel);
      info(api, ctx, 'VELOCIDADE', vel > 0.6 ? '2.000 km/h' : `${Math.round(api.lerp(30, 2000, vel / 0.6) / 10) * 10} km/h`, 1250, '#59D8FF', fr(api, 0.08, 0.3, 'volta'));
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
      const k = u / d, KI = 0.55; // momento do impacto (fração do plano)
      if (k < 0.3) {
        // chão: ele chega como um raio, agacha e pula; o asfalto racha na decolagem
        const cam = api.orbita({ alvo: [0, 3.5, 16], raio: 6.5, ang: 0.7, altura: 0.45, f: 820, ySalvo: 1420, nevoa: NEV, distNevoa: 70 });
        const [tx, ty] = api.tremor(k > 0.17 ? 18 * (1 - fr(api, 0.17, 0.3)) : 4);
        ctx.save(); ctx.translate(tx, ty);
        cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15, destruicao: 0.8 });
        criatura3d(ctx, cam, 0, 22, 15, { t: api.t, bracoD: 0.15 });
        const chega = fr(api, 0, 0.1, 'sai'), agacha = fr(api, 0.1, 0.17), sobe = fr(api, 0.17, 0.3, 'sai');
        const Z = api.lerp(4, 15, chega) + sobe * 3, Y = sobe * 5.5;
        if (chega < 1) { const a = cam.p(0, 0.9, Z - 14), b = cam.p(0, 0.9, Z); if (a.dz > 0.6 && b.dz > 0.6) rastro(ctx, a.x, a.y, b.x, b.y, 0.9 * b.s); }
        racha(ctx, cam, [0, 0, 15], fr(api, 0.17, 0.25, 'sai'), 21, 1.6, 'chao');
        if (sobe > 0) {
          const dt = (k - 0.17) * d;
          nuvem(ctx, cam, 0, 0, 15, fr(api, 0.17, 0.3), 3, 2, '120,120,160', 0.6);
          const q = cam.p(0, 0.05, 15); onda(ctx, q.x, q.y, fr(api, 0.17, 0.27), 700);
          const a = cam.p(0, 0.9, 15), b = cam.p(0, Y + 0.9, Z); rastro(ctx, a.x, a.y, b.x, b.y, 0.35 * b.s, 0.6);
          estilhacos(ctx, cam, 0, 0.1, 15, dt, 30, 9, { v: 7, dir: [0, 1, 0], tam: 0.3 });
        }
        const pose = sobe > 0 ? PULO : agacha > 0 ? AGACHA : null;
        if (pose) api.personagem3d(cam, { ...KAIK_T, pose, expressao: 'raiva' }, 0, Z, 1.75, { luz: { lado: 1, cor: 'rgb(140,230,255)', forca: 0.9 }, y: Y, rumo: Math.PI, parado: true });
        else api.personagem3d(cam, { ...KAIK_T, pose: 'parado', expressao: 'raiva' }, 0, Z, 1.75, { luz: LUZ_NOITE, rumo: Math.PI, correr: api.t * 2.5, velocidade: 1.5 });
        if (sobe > 0) { const b = cam.p(0, Y + 0.9, Z); brilho(ctx, b.x, b.y, 1.6 * b.s, 0.4, '89,216,255'); }
        ctx.restore();
        brasas(ctx, api, 30, 0.8);
        return;
      }
      // no ar, de lado, na altura da barriga: câmera lenta até o punho entrar; quadro de impacto
      const imp = k >= KI, di = (k - KI) * d;
      const [tx, ty] = api.tremor(imp ? 34 * Math.max(0, 1 - di / 1.1) : 2);
      const zoom = imp ? 1 + 0.12 * Math.exp(-di * 3) : api.lerp(1, 1.06, fr(api, 0.3, KI));
      ctx.save(); ctx.translate(540 + tx, 960 + ty); ctx.scale(zoom, zoom); ctx.translate(-540, -960);
      const camada = api.camada(), g = camada.getContext('2d');
      const cam = api.camera({ f: 900, x: -6, y: 7, z: 4, yaw: 0.5, cy: 1180, nevoa: NEV, distNevoa: 70 });
      cidade(g, api, cam, { zApaga: 0, acesas: 0.15, destruicao: 0.8 }); api.desfocar(camada, 8);
      linhasVel(ctx, 1300, 960, imp ? 0 : 0.5, api.t, '200,240,255');
      // criatura gigante à direita; recua depois do soco
      const recua = imp ? fr(api, KI + 0.03, 1, 'sai') : 0, cx = 800 + 160 * recua, hC = 3700, PI = [560, 930];
      ctx.save(); ctx.translate(PI[0], PI[1]); ctx.rotate(0.12 * recua); ctx.translate(-PI[0], -PI[1]);
      const cc = api.camada(), gc = cc.getContext('2d'); gc.setTransform(ctx.getTransform());
      criatura(gc, cx, PI[1] + 0.56 * hC, hC, { t: api.t, olhos: imp ? 0.6 + 0.4 * Math.sin(api.t * 30) : 1, bracoD: 0.3 + 0.4 * recua, garra: 1 });
      gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'source-atop';
      const lr = gc.createRadialGradient(PI[0], PI[1], 0, PI[0], PI[1], 700); lr.addColorStop(0, `rgba(120,230,255,${imp ? 0.55 : 0.25 + 0.2 * fr(api, 0.3, KI)})`); lr.addColorStop(1, 'rgba(120,230,255,0)');
      gc.fillStyle = lr; gc.fillRect(0, 0, W, H);
      const lt = gc.createLinearGradient(0, 0, W, 0); lt.addColorStop(0, 'rgba(150,110,255,0.28)'); lt.addColorStop(0.5, 'rgba(150,110,255,0)'); gc.fillStyle = lt; gc.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cc, 0, 0); ctx.restore();
      // barriga afundando: anéis roxos e a rachadura acesa
      if (imp) {
        const e = fr(api, KI, KI + 0.25, 'sai');
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { const r = (60 + i * 70) * (0.3 + e) + 40 * recua; ctx.strokeStyle = `rgba(190,140,255,${0.7 * (1 - e) * (1 - i * 0.2)})`; ctx.lineWidth = 10 - i * 2; ctx.beginPath(); ctx.ellipse(PI[0] + 60 + 160 * recua, PI[1], r * 0.55, r, 0, -1.3, 1.3); ctx.stroke(); }
        ctx.restore();
      }
      // Kaik: chega em câmera lenta com o punho na frente; o punho termina exatamente no ponto de impacto
      const chega = imp ? 1 : fr(api, 0.3, KI, 'sai'), ret = imp ? fr(api, KI + 0.05, 1, 'sai') : 0;
      const off = (1 - chega) * 520 + ret * 60, hK = 820;
      const pose = { ...SOCO_AR, braco_d: -92 + (1 - chega) * 40, antebraco_d: -2 - (1 - chega) * 70 };
      const item = { ...KAIK_T, pose, expressao: { ...P().raiva, boca: { tipo: 'aberta', curva: -0.4, abertura: 0.05, largura: 0.07 } }, vista: 'perfil' };
      ctx.save(); ctx.globalAlpha = 0; const rig0 = api.personagem(item, 0, 0, hK, { parado: true, semRosto: true }); ctx.restore();
      const m = rig0 && rig0.pontoMundo ? rig0.pontoMundo('mao_d', [0, 0.35]) : { x: 300, y: -420 };
      const x0 = PI[0] - m.x - off, y0 = PI[1] - m.y + (1 - chega) * 90;
      // aura e rastro do pulo
      brilho(ctx, x0 + 120, y0 - hK * 0.5, 520, 0.35, '89,216,255');
      rastro(ctx, x0 - 900, y0 - hK * 0.35 + 300, x0 + 60, y0 - hK * 0.45, 200, 0.6);
      api.personagem(item, x0, y0, hK, { parado: true, luz: { lado: 1, cor: 'rgb(140,230,255)', forca: 0.9 } });
      brilho(ctx, PI[0], PI[1], imp ? 260 : 120 + 140 * chega, imp ? 0.9 : 0.5, '120,230,255');
      ctx.restore();
      if (imp) {
        const e = fr(api, KI, KI + 0.3, 'sai');
        // ondas de choque e estrela de energia
        for (let i = 0; i < 3; i++) { const kk = api.clamp(e * 1.4 - i * 0.18, 0, 1); onda(ctx, PI[0], PI[1], kk, 1100 + i * 300); }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(PI[0], PI[1]);
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.2, L = (180 + (i % 3) * 120) * (1 - e * 0.7); ctx.fillStyle = `rgba(200,245,255,${1 - e})`; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.08) * 30, Math.sin(a - 0.08) * 30); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.lineTo(Math.cos(a + 0.08) * 30, Math.sin(a + 0.08) * 30); ctx.fill(); }
        ctx.restore();
        faiscas(ctx, PI[0], PI[1], 60, 520, api.t, 6);
        if (di < 0.5) linhasImpacto(ctx, PI[0], PI[1], 1 - di / 0.5, 5, '20,10,40', 300);
        if (di < 0.09) quadroImpacto(ctx, PI[0], PI[1], 11);
        else clarao(ctx, 0.75 * Math.max(0, 1 - (di - 0.09) / 0.25), '235,250,255');
      }
      brasas(ctx, api, 30, 0.8);
    },
    sentiu(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 6, 18], raio: 16, ang: 0.2, altura: 2, ySalvo: 1050 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15, destruicao: 0.8, apagados: [25] });
      const k = fr(api, 0, 0.8, 'sai');
      criatura3d(ctx, cam, api.lerp(0, 1.5, k), api.lerp(18, 22, k), 15, { t: api.t, inclina: -10 * (1 - k) + 4 });
      const p = cam.p(4.5, 8.5, 25); if (p.dz > 1 && k > 0.4) faiscas(ctx, p.x, p.y, 24, 1.5 * p.s, api.t, 4);
    },
    braco: (ctx, u, d, api) => raioX(ctx, api, 0, d),
    osso: (ctx, u, d, api) => raioX(ctx, api, 1, d),
    caiu(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0, 0.6, 6], raio: api.lerp(3, 2.4, u / d), ang: 0.6, altura: 1.1, ySalvo: 1150 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 , destruicao: 0.6 });
      const q = cam.p(0, 0, 6);
      if (q.dz > 1) deitado(api, ctx, { ...KAIK_T, pose: { braco_d: 30, antebraco_d: 90, braco_e: 10 }, expressao: 'raiva' }, q.x, q.y - 0.25 * q.s, 1.75 * q.s, -Math.PI / 2 + 0.15);
    },
    sofenda(ctx, u, d, api) {
      const cam = CAM_RUA(api, { alvo: [0.4, 1.3, 6], raio: api.lerp(3.2, 2.8, u / d), ang: -0.4, altura: 1.5 });
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 , destruicao: 0.6 });
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
      cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 , destruicao: 0.6 });
      const fq = cam.p(0, 12, 22); tornado(ctx, api, fq.x, fq.y, 900, 1); Efeitos.fenda(ctx, fq.x, fq.y, 20 * fq.s, { t: api.t, abre: 1, semente: 8 });
      const k = fr(api, 0.1, 1, 'entra');
      criatura3d(ctx, cam, 0, api.lerp(20, 22, k), 15, { t: api.t, inclina: -20 * k });
      const Y = api.lerp(4, 11.5, k), Zc = api.lerp(14, 21.6, k);
      if (k < 0.95) { ctx.save(); ctx.globalAlpha = 1 - api.clamp((k - 0.7) / 0.25, 0, 1); api.personagem3d(cam, { ...CHEDE_T, pose: { braco_d: 160, braco_e: 150, coxa_d: -30, canela_d: 40 }, expressao: 'medo' }, 0.6, Zc, 1.75 * (1 - 0.8 * Math.max(0, k - 0.5) * 2), { luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 }, y: Y, rumo: Math.PI, parado: true }); ctx.restore(); }
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
      // o Kaik de costas na janela do quarto, olhando a cidade; lá longe, um brilho roxo
      const z = api.lerp(1, 1.07, u / d); ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#121A2C'); g.addColorStop(1, '#1D263A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      janelaCidade(ctx, api, 120, 170, 840, 1050, 0.9);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; g = ctx.createRadialGradient(540, 700, 100, 540, 700, 900); g.addColorStop(0, 'rgba(120,130,255,0.12)'); g.addColorStop(1, 'rgba(120,130,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      const rig = close(api, { ...KAIK, pose: { braco_d: 5, antebraco_d: 0, braco_e: -5, antebraco_e: 0 }, expressao: { ...P().preocupado }, vista: 'costas', voz: 'narrador' }, 540, 1000, 540, { luz: { lado: 1, cor: 'rgb(170,160,255)', forca: 0.8 }, vida: 0.8 });
      // faixa da tipoia cruzando as costas
      if (rig && rig.pontoMundo) { const o = rig.pontoMundo('pescoco', [0, 0]); ctx.strokeStyle = '#3E5A86'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(o.x - 70, o.y + 40); ctx.quadraticCurveTo(o.x + 40, o.y + 160, o.x + 170, o.y + 330); ctx.stroke(); }
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
    cidade(ctx, api, cam, { zApaga: 0, acesas: 0.15 , destruicao: 0.8 });
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
    // ao soltar, o Kaik cai para trás
    const cai = fase === 1 ? fr(api, 0.5, 0.75, 'sai') : 0;
    ctx.save(); ctx.translate(380, 1860); ctx.rotate(-0.35 * cai); ctx.translate(-380, -1860 - 0 * cai);
    const rk = api.personagem({ ...KAIK_T, pose: { braco_d: 160 - 25 * cai, antebraco_d: 5, braco_e: 25 + 30 * cai, antebraco_e: 80, tronco: 12 - 20 * cai, coxa_d: -60, canela_d: 90, coxa_e: -20, canela_e: 30 }, expressao: exK, vista: 'tq' }, 380, 1860, 760, { luz: { lado: 1, cor: 'rgb(200,160,255)', forca: 0.8 }, vida: 3 });
    ctx.restore();
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
    // centro do corpo do Chede na tela; ao soltar, ele vai para o fundo da fenda encolhendo e girando
    const ox = mk.x - hm.x, oy = mk.y - hm.y, c0 = [ox + Math.sin(giro) * 350, oy - Math.cos(giro) * 350];
    const e = solta * solta, alvo = [api.lerp(c0[0], 540, e), api.lerp(c0[1], 250, e)], esc = api.lerp(1, 0.03, Math.pow(solta, 0.8));
    if (solta < 0.97) {
      ctx.save(); ctx.globalAlpha = 1 - fr(api, 0.9, 0.99);
      ctx.translate(alvo[0], alvo[1]); ctx.scale(esc, esc); ctx.rotate(solta * 3.5); ctx.translate(-c0[0], -c0[1]);
      ctx.translate(ox, oy); ctx.rotate(giro);
      api.personagem({ ...CHEDE_T, pose: poseC, expressao: exC }, 0, 0, 700, { luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.8 + solta }, vida: 3 });
      ctx.restore();
      if (solta > 0.3) brilho(ctx, alvo[0], alvo[1], 260 * esc + 60, 0.5 * solta, '200,160,255');
    }
    if (solta > 0.9) brilho(ctx, 540, 250, 700, 0.8 * (1 - fr(api, 0.95, 1)), '220,190,255');
    if (solta < 0.12) brilho(ctx, mk.x, mk.y, 110, 0.4, '200,180,255');
    ctx.restore();
    vento(ctx, api, 1, 540, 240);
  }

  // ---------- hospital (refeito: quarto à noite, cama de lado, Lia deitada de perfil com o lençol até o ombro) ----------
  // janela com a cidade à noite (e um brilho roxo lá longe, onde a fenda fechou)
  function janelaCidade(ctx, api, x0, y0, w, h, roxo = 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#080B26'); g.addColorStop(0.6, '#1C1B4A'); g.addColorStop(1, '#3A2768'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    const r = rng(5); for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(230,225,255,${0.2 + r() * 0.5})`; ctx.fillRect(x0 + r() * w, y0 + r() * h * 0.5, 2, 2); }
    ctx.fillStyle = '#EDE6FF'; ctx.beginPath(); ctx.arc(x0 + w * 0.75, y0 + h * 0.18, 26, 0, Math.PI * 2); ctx.fill(); brilho(ctx, x0 + w * 0.75, y0 + h * 0.18, 140, 0.3, '170,160,255');
    if (roxo > 0) brilho(ctx, x0 + w * 0.3, y0 + h * 0.62, 220, roxo * (0.5 + 0.2 * Math.sin(api.t * 2)), '170,110,255');
    const r2 = rng(9);
    for (let i = 0; i < 16; i++) {
      const bx = x0 - 20 + i * (w / 14), bw = w / 16 + r2() * 30, bh = h * (0.18 + r2() * 0.35), by = y0 + h - bh;
      ctx.fillStyle = i % 2 ? '#141838' : '#1A1E44'; ctx.fillRect(bx, by, bw, bh);
      for (let j = 0; j < 14; j++) if (r2() < 0.5) { ctx.fillStyle = r2() < 0.8 ? 'rgba(255,210,140,0.85)' : 'rgba(150,210,255,0.8)'; ctx.fillRect(bx + 4 + r2() * (bw - 10), by + 6 + r2() * (bh - 12), 4, 5); }
    }
    ctx.restore();
    // moldura e divisória
    ctx.strokeStyle = '#5A6680'; ctx.lineWidth = 18; ctx.strokeRect(x0, y0, w, h);
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0 + w / 2, y0); ctx.lineTo(x0 + w / 2, y0 + h); ctx.stroke();
    ctx.fillStyle = '#6B7895'; ctx.fillRect(x0 - 24, y0 + h, w + 48, 20);
  }
  function quartoHospital(ctx, api, cena) {
    let g = ctx.createLinearGradient(0, 0, 0, 1320); g.addColorStop(0, '#121A2C'); g.addColorStop(1, '#27344D'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1320);
    g = ctx.createLinearGradient(0, 1320, 0, H); g.addColorStop(0, '#202A3E'); g.addColorStop(1, '#0E1220'); ctx.fillStyle = g; ctx.fillRect(0, 1320, W, H - 1320);
    ctx.fillStyle = '#1A2234'; ctx.fillRect(0, 1305, W, 18);
    janelaCidade(ctx, api, 520, 200, 470, 700, cena === 2 ? 0.8 : 0.35);
    // cortinas
    for (const [x, l] of [[470, -1], [1000, 1]]) { ctx.fillStyle = '#34405E'; ctx.beginPath(); ctx.moveTo(x - 50, 170); ctx.lineTo(x + 50, 170); ctx.quadraticCurveTo(x + 30 + l * 20, 600, x + 60 * l + 10, 980); ctx.lineTo(x - 60 * -l - 10, 980); ctx.quadraticCurveTo(x - 30, 600, x - 50, 170); ctx.fill(); ctx.strokeStyle = 'rgba(15,20,40,0.5)'; ctx.lineWidth = 4; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 20, 190); ctx.quadraticCurveTo(x + k * 26, 600, x + k * 30 + l * 20, 960); ctx.stroke(); } }
    // luz da janela no chão e na parede
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(120,140,255,0.07)'; ctx.beginPath(); ctx.moveTo(520, 900); ctx.lineTo(990, 900); ctx.lineTo(900, 1920); ctx.lineTo(200, 1920); ctx.fill(); ctx.restore();
    // soro
    ctx.strokeStyle = '#8C97AE'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(430, 330); ctx.lineTo(430, 1420); ctx.stroke(); ctx.beginPath(); ctx.moveTo(380, 330); ctx.lineTo(480, 330); ctx.stroke();
    ctx.fillStyle = 'rgba(200,225,255,0.55)'; ctx.beginPath(); ctx.roundRect(400, 340, 60, 110, 18); ctx.fill(); ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(210,230,255,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(430, 450); ctx.bezierCurveTo(440, 800, 520, 900, 520, 1130); ctx.stroke();
    // monitor no suporte
    const pico = cena === 2 && api.u > 0.55 * api.dur;
    ctx.fillStyle = '#3A4458'; ctx.fillRect(205, 640, 14, 700);
    ctx.fillStyle = '#1E2533'; ctx.beginPath(); ctx.roundRect(80, 420, 300, 230, 18); ctx.fill();
    ctx.fillStyle = '#06110C'; ctx.beginPath(); ctx.roundRect(96, 436, 268, 198, 10); ctx.fill();
    ctx.strokeStyle = pico ? '#FF5A4A' : '#4BE08A'; ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 0; x <= 256; x += 4) { const ph = (x / 256 * 3 + api.t * (pico ? 3 : 1)) % 1; const yv = ph > 0.45 && ph < 0.5 ? -60 * (pico ? 1.4 : 1) : ph > 0.5 && ph < 0.54 ? 34 : 0; x ? ctx.lineTo(102 + x, 545 + yv) : ctx.moveTo(102 + x, 545 + yv); }
    ctx.stroke();
    ctx.font = '700 30px Inter'; ctx.fillStyle = pico ? '#FF5A4A' : '#4BE08A'; ctx.textAlign = 'left'; ctx.fillText(pico ? '142' : '58', 300, 470);
    brilho(ctx, 230, 535, 300, 0.25, pico ? '255,90,74' : '75,224,138');
  }
  // cama de lado com a Lia deitada (perfil, olhando para cima) e o lençol até o ombro
  function camaLia(ctx, api, cena) {
    // estrutura
    ctx.fillStyle = '#7C889E'; ctx.beginPath(); ctx.roundRect(108, 960, 30, 360, 10); ctx.fill(); // cabeceira
    ctx.fillStyle = '#8F9BB2'; ctx.beginPath(); ctx.roundRect(100, 950, 46, 40, 12); ctx.fill();
    ctx.fillStyle = '#7C889E'; ctx.beginPath(); ctx.roundRect(940, 1060, 26, 260, 10); ctx.fill(); // pé
    ctx.fillStyle = '#5E6A80'; ctx.fillRect(120, 1270, 840, 34);
    for (const x of [170, 900]) { ctx.fillStyle = '#4A5468'; ctx.fillRect(x, 1300, 18, 130); ctx.fillStyle = '#2A3040'; ctx.beginPath(); ctx.arc(x + 9, 1438, 18, 0, Math.PI * 2); ctx.fill(); }
    // colchão e travesseiro
    ctx.fillStyle = '#D5DEEA'; ctx.beginPath(); ctx.roundRect(130, 1190, 820, 86, 26); ctx.fill();
    ctx.fillStyle = '#EEF2F8'; ctx.beginPath(); ctx.ellipse(250, 1170, 125, 42, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(150,165,200,0.35)'; ctx.beginPath(); ctx.ellipse(262, 1186, 105, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Lia deitada de perfil: cabeça no travesseiro, rosto para cima
    deitado(api, ctx, { ...LIA, pose: 'parado', expressao: fechado(), vista: 'perfil' }, 560, 1150, 700, -Math.PI / 2);
    // lençol (do ombro ao pé), com dobras
    const g = ctx.createLinearGradient(0, 1080, 0, 1260); g.addColorStop(0, '#B8CCE6'); g.addColorStop(1, '#7F97BC');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(330, 1250); ctx.bezierCurveTo(325, 1150, 360, 1105, 420, 1100); ctx.bezierCurveTo(560, 1092, 700, 1112, 790, 1118); ctx.bezierCurveTo(880, 1122, 930, 1150, 955, 1200); ctx.lineTo(960, 1262); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E4ECF6'; ctx.beginPath(); ctx.moveTo(330, 1250); ctx.bezierCurveTo(325, 1150, 360, 1105, 420, 1100); ctx.lineTo(440, 1102); ctx.bezierCurveTo(380, 1115, 352, 1160, 356, 1250); ctx.fill(); // dobra de cima
    ctx.strokeStyle = 'rgba(70,90,130,0.35)'; ctx.lineWidth = 4;
    for (const [a, b] of [[520, 1110], [660, 1116], [800, 1125]]) { ctx.beginPath(); ctx.moveTo(a, b + 10); ctx.quadraticCurveTo(a + 30, b + 70, a - 10, b + 130); ctx.stroke(); }
    // mão da Lia por cima do lençol
    const mx = 560, my = 1100;
    ctx.fillStyle = '#B57B55'; ctx.beginPath(); ctx.roundRect(mx - 38, my - 16, 76, 30, 14); ctx.fill();
    ctx.fillStyle = '#C98B63'; ctx.beginPath(); ctx.roundRect(mx - 34, my - 20, 70, 28, 14); ctx.fill();
    ctx.fillStyle = '#8E8A9E'; ctx.fillRect(mx - 70, my - 14, 34, 24); // punho do pijama
    // monitor no dedo (fio)
    ctx.strokeStyle = 'rgba(40,46,60,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx + 34, my - 6); ctx.bezierCurveTo(mx + 120, my - 200, 300, 760, 230, 650); ctx.stroke();
    if (cena === 2) {
      const a = fr(api, 0.3, 0.5);
      if (a > 0) { Efeitos.fenda(ctx, mx, my - 46, 110, { t: api.t, abre: (0.4 + 0.6 * Math.abs(Math.sin(api.t * 7))) * a, semente: 6 }); brilho(ctx, mx, my - 30, 260 * a, 0.7 * a, '190,150,255'); }
    }
    // gato no pé da cama, em cima do lençol, olhando para ela
    if (cena >= 1) gato(ctx, 860, 1124, 150, { pose: cena === 2 && api.u > 0.55 * api.dur ? 'arrepiado' : 'sentado', t: api.t, espelhar: true });
    return { mx, my };
  }
  // tipoia + gesso no braço direito do Kaik (sobre o rig)
  function tipoia(ctx, rig) {
    if (!rig || !rig.pontoMundo) return;
    const a = rig.pontoMundo('antebraco_d', [0, 0.02]), b = rig.pontoMundo('mao_d', [0, 0.1]), n = rig.pontoMundo('pescoco', [0, 0]);
    const L = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
    ctx.fillStyle = '#F4F1EA'; ctx.strokeStyle = '#B9B4AA'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-L * 0.08, -L * 0.2, L * 1.0, L * 0.4, L * 0.18); ctx.fill(); ctx.stroke();
    ctx.restore();
    // faixa da tipoia até o pescoço
    ctx.strokeStyle = '#3E5A86'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(8, L * 0.16);
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo((b.x + n.x) / 2 + 10, (b.y + n.y) / 2, n.x + L * 0.25, n.y + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(n.x - L * 0.2, n.y + 6); ctx.stroke();
  }
  // hospital: 0 = Lia em coma (3 dias), 1 = Kaik de tipoia ao lado, 2 = luz roxa na mão + monitor dispara
  function hospital(ctx, api, cena, d) {
    const u = api.u;
    const z = cena === 2 ? api.lerp(1, 1.9, fr(api, 0, 0.7, 'sai')) : api.lerp(1, 1.05, u / d);
    const fx = cena === 2 ? 560 : 540, fy = cena === 2 ? 1080 : 1000;
    ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    quartoHospital(ctx, api, cena);
    if (cena === 1) {
      // Kaik em pé atrás da cama, olhando para ela, braço direito na tipoia
      const rk = api.personagem({ ...KAIK, pose: { braco_d: 30, antebraco_d: -95, braco_e: -4, cabeca: 10 }, expressao: { ...P().preocupado, olhar: [-0.012, 0.01] }, vista: 'tq', espelhar: true }, 760, 1360, 880, { luz: { lado: 1, cor: 'rgb(150,170,255)', forca: 0.7 }, vida: 0.8 });
      tipoia(ctx, rk);
    }
    camaLia(ctx, api, cena);
    ctx.restore();
    if (cena === 0) info(api, ctx, 'EM COMA', '3 DIAS', 1640, '#B9A6FF', fr(api, 0.3, 0.6, 'volta'));
    if (cena === 2 && u > 0.55 * d) { ctx.fillStyle = `rgba(167,121,255,${0.25 * Math.abs(Math.sin(api.t * 8))})`; ctx.fillRect(0, 0, W, H); }
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

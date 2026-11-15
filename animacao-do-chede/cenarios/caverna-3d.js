// Cenários da Terra · Parte 2 (canvas em perspectiva, mesma câmera do motor; a câmera pode girar 360° dentro deles)
//   Cenarios3D.caverna.desenhar(ctx, cam, { t, pulso, brilho })  — caverna de cristais: domo de pedra (raio ~13 m,
//     teto a 9 m), estalactites, chão de pedra com seixos, cristais laranja brilhando, rio de luz, mural com as
//     pinturas das 4 crianças (parede da esquerda) e o pedestal do coração de pedra (pontos.nucleo).
//   Cenarios3D.escada.desenhar(ctx, cam, { t, brilho })  — poço com escada em espiral de pedra descendo em volta de
//     uma coluna (eixo em x 0, z 0; degraus de y 0 até y -12), rachaduras brilhando nas paredes.
//   Cenarios3D.caverna.pontos / .escada.degrau(i) → posições úteis para os planos.
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const { face, caminho } = Cena3D;
  const TAU = Math.PI * 2;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const LAR = '255,160,70';

  function brilho(ctx, x, y, r, a, cor = LAR) {
    if (a <= 0.01 || r <= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.4, `rgba(${cor},${a * 0.35})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  // cristal (billboard): base no ponto (X,Y,Z), altura h metros, inclinação ang
  function cristal3d(ctx, cam, X, Y, Z, h, ang, br, semente) {
    const q = cam.p(X, Y, Z); if (q.atras || q.dz < 0.5) return;
    const s = q.s, w = h * 0.26 * s, H = h * s, c = Math.cos(ang), sn = Math.sin(ang);
    const pt = (u, v) => [q.x + u * c - v * sn, q.y + u * sn + v * c];
    const forma = [pt(-w, 0), pt(-w * 0.85, -H * 0.72), pt(0, -H), pt(w * 0.85, -H * 0.7), pt(w, 0)];
    const fog = cam.fator(Z);
    const mist = (a, b) => Cena3D.mistura(a, b, fog * 0.7);
    ctx.save();
    ctx.beginPath(); forma.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath();
    ctx.fillStyle = mist('#E87A2A', '#2A1A28'); ctx.fill();
    // face clara (esquerda) e escura (direita)
    ctx.beginPath(); ctx.moveTo(...forma[0]); ctx.lineTo(...forma[1]); ctx.lineTo(...forma[2]); ctx.lineTo(...pt(-w * 0.1, 0)); ctx.closePath();
    ctx.fillStyle = mist('#FFC07A', '#3A2430'); ctx.fill();
    ctx.beginPath(); ctx.moveTo(...forma[2]); ctx.lineTo(...forma[3]); ctx.lineTo(...forma[4]); ctx.lineTo(...pt(w * 0.15, 0)); ctx.closePath();
    ctx.fillStyle = mist('#B4521C', '#20141E'); ctx.fill();
    ctx.strokeStyle = `rgba(255,236,200,${0.5 * br * (1 - fog)})`; ctx.lineWidth = Math.max(1, s * 0.012);
    ctx.beginPath(); ctx.moveTo(...forma[2]); ctx.lineTo(...pt(0, -H * 0.1)); ctx.stroke();
    ctx.restore();
    brilho(ctx, q.x, q.y - H * 0.5, H * 1.4, 0.22 * br * (1 - fog * 0.6));
    void semente;
  }
  function grupoCristais(ctx, cam, X, Y, Z, tam, br, semente) {
    const r = rng(semente), n = 3 + Math.floor(r() * 4), lista = [];
    for (let i = 0; i < n; i++) lista.push([X + (r() - 0.5) * tam * 0.9, Z + (r() - 0.5) * tam * 0.6, tam * (0.45 + r() * 0.7), (r() - 0.5) * 1.1]);
    lista.sort((a, b) => b[1] - a[1]).forEach(([x, z, h, a]) => cristal3d(ctx, cam, x, Y, z, h, a, br, semente));
  }

  // ===================== CAVERNA DE CRISTAIS =====================
  const CX = 0, CZ = 9, R0 = 13, TETO = 9;
  const raioParede = (a) => R0 * (1 + 0.08 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 11 + 3));
  const PINTURA_ANG = Math.PI * 1.08; // parede da esquerda (x negativo)
  const r0 = rng(31);
  const CRISTAIS = [];
  for (let i = 0; i < 26; i++) { const a = r0() * TAU, d = 0.72 + r0() * 0.24; CRISTAIS.push([CX + Math.cos(a) * raioParede(a) * d, CZ + Math.sin(a) * raioParede(a) * d, 0.7 + r0() * 1.8, 100 + i]); }
  for (const [x, z, t] of [[-3.2, 7.2, 1.1], [3.6, 6.4, 1.3], [2.4, 13.8, 1.6], [-4.4, 13, 1.2], [5.5, 10.5, 1.0]]) CRISTAIS.push([x, z, t, Math.floor(x * 17 + z * 7) >>> 0]);
  const ESTALACTITES = [];
  for (let i = 0; i < 40; i++) { const a = r0() * TAU, d = Math.sqrt(r0()) * 0.92; ESTALACTITES.push([CX + Math.cos(a) * R0 * d, CZ + Math.sin(a) * R0 * d, 0.6 + r0() * 2.2, 0.25 + r0() * 0.5]); }
  const SEIXOS = [];
  for (let i = 0; i < 70; i++) { const a = r0() * TAU, d = Math.sqrt(r0()) * 0.95; SEIXOS.push([CX + Math.cos(a) * R0 * d, CZ + Math.sin(a) * R0 * d, 0.08 + r0() * 0.3, r0()]); }
  const rio = (z) => 2.6 * Math.sin(z * 0.35 + 0.6) - 1.0; // x do rio de luz em função de z

  function pinturas(ctx, cam, br) {
    // retângulo da pintura na parede: 4 cantos em 3D (2,6 m de altura, 6 m de largura)
    const a0 = PINTURA_ANG - 0.24, a1 = PINTURA_ANG + 0.24;
    const P3 = (a, y) => { const r = raioParede(a) * 0.985; return [CX + Math.cos(a) * r, y, CZ + Math.sin(a) * r]; };
    const c00 = cam.p(...P3(a1, 1.0)), c10 = cam.p(...P3(a0, 1.0)), c01 = cam.p(...P3(a1, 4.2));
    if (c00.atras || c10.atras || c01.atras) return;
    ctx.save();
    ctx.setTransform(c10.x - c00.x, c10.y - c00.y, c01.x - c00.x, c01.y - c00.y, c00.x, c00.y); // quadrado unitário → parede
    const fog = cam.fator(CZ + Math.sin(PINTURA_ANG) * R0);
    const oc = `rgba(214,140,70,${0.85 * (1 - fog * 0.6)})`, oc2 = `rgba(160,70,40,${0.8 * (1 - fog * 0.6)})`;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // moldura de pedra mais clara
    ctx.fillStyle = `rgba(120,100,110,${0.35 * (1 - fog)})`; ctx.fillRect(0.02, 0.04, 0.96, 0.92);
    const crianca = (cx, simbolo, cor) => {
      ctx.strokeStyle = oc; ctx.lineWidth = 0.012;
      ctx.beginPath(); ctx.arc(cx, 0.3, 0.035, 0, TAU); ctx.stroke();                      // cabeça
      ctx.beginPath(); ctx.moveTo(cx, 0.335); ctx.lineTo(cx, 0.55); ctx.moveTo(cx, 0.4); ctx.lineTo(cx - 0.05, 0.47); ctx.moveTo(cx, 0.4); ctx.lineTo(cx + 0.06, 0.36);
      ctx.moveTo(cx, 0.55); ctx.lineTo(cx - 0.04, 0.68); ctx.moveTo(cx, 0.55); ctx.lineTo(cx + 0.04, 0.68); ctx.stroke();
      ctx.strokeStyle = cor; ctx.lineWidth = 0.014; ctx.beginPath(); simbolo(cx + 0.1, 0.3); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = cor.replace(/[\d.]+\)$/, `${0.3 * br})`); ctx.lineWidth = 0.035; ctx.beginPath(); simbolo(cx + 0.1, 0.3); ctx.stroke(); ctx.restore();
    };
    const terra = (x, y) => { ctx.moveTo(x, y - 0.06); ctx.lineTo(x + 0.05, y); ctx.lineTo(x, y + 0.06); ctx.lineTo(x - 0.05, y); ctx.closePath(); ctx.moveTo(x - 0.03, y + 0.01); ctx.lineTo(x - 0.008, y - 0.025); ctx.lineTo(x + 0.03, y + 0.01); };
    const agua = (x, y) => { for (let k = 0; k < 3; k++) { ctx.moveTo(x - 0.05, y - 0.03 + k * 0.03); ctx.quadraticCurveTo(x - 0.025, y - 0.05 + k * 0.03, x, y - 0.03 + k * 0.03); ctx.quadraticCurveTo(x + 0.025, y - 0.01 + k * 0.03, x + 0.05, y - 0.03 + k * 0.03); } };
    const fogo = (x, y) => { ctx.moveTo(x, y + 0.05); ctx.quadraticCurveTo(x - 0.06, y, x - 0.01, y - 0.07); ctx.quadraticCurveTo(x, y - 0.02, x + 0.03, y - 0.04); ctx.quadraticCurveTo(x + 0.05, y + 0.02, x, y + 0.05); };
    const ar = (x, y) => { ctx.moveTo(x, y); for (let k = 0; k < 24; k++) { const a = k * 0.45, rr = 0.004 + k * 0.0022; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } };
    crianca(0.12, terra, `rgba(255,170,70,${0.95})`);
    crianca(0.36, agua, `rgba(110,190,255,${0.9})`);
    crianca(0.6, fogo, `rgba(255,90,60,${0.9})`);
    crianca(0.84, ar, `rgba(200,230,255,${0.9})`);
    // chão desenhado e um grande símbolo da terra no alto
    ctx.strokeStyle = oc2; ctx.lineWidth = 0.008; ctx.beginPath(); ctx.moveTo(0.05, 0.72); ctx.lineTo(0.95, 0.72); ctx.stroke();
    ctx.restore();
  }

  window.Cenarios3D.caverna = {
    nevoa: '#1E1526',
    pontos: { nucleo: [0, 0, 11.5], pintura: [CX + Math.cos(PINTURA_ANG) * R0 * 0.9, CZ + Math.sin(PINTURA_ANG) * R0 * 0.9], entrada: [5.5, 1.5], centro: [CX, CZ] },
    rio,
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0, br = o.brilho === undefined ? 1 : o.brilho, pu = o.pulso || 0;
      const W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.save();
      ctx.fillStyle = '#120C16'; ctx.fillRect(-200, -200, W + 400, H + 400);
      // teto (disco) e chão (disco)
      const N = 40, aro = (y, k = 1) => Array.from({ length: N }, (_, i) => { const a = (i / N) * TAU; return [CX + Math.cos(a) * raioParede(a) * k, y, CZ + Math.sin(a) * raioParede(a) * k]; });
      face(ctx, cam, aro(TETO), '#2A2030', { contorno: false });
      face(ctx, cam, aro(0), '#3C3040', { contorno: false });
      // anéis mais claros no chão (pedra gasta) e seixos
      face(ctx, cam, aro(0.002, 0.55), '#463848', { contorno: false });
      for (const [x, z, s, v] of SEIXOS) { const q = cam.p(x, 0, z); if (q.atras || q.dz < 0.8) continue; ctx.fillStyle = cam.tom(v > 0.5 ? '#5A4C5E' : '#2E2434', z); ctx.beginPath(); ctx.ellipse(q.x, q.y, s * q.s, s * q.s * 0.35, 0, 0, TAU); ctx.fill(); }
      // rio de luz serpenteando pelo chão
      const faixa = [], faixa2 = [];
      for (let z = CZ - R0 * 0.95; z <= CZ + R0 * 0.95; z += 0.4) { const x = rio(z), w = 0.45 + 0.12 * Math.sin(z * 1.3 + t); faixa.push([x - w, 0.004, z]); faixa2.unshift([x + w, 0.004, z]); }
      const pathRio = caminho(cam, faixa.concat(faixa2));
      ctx.save(); ctx.fillStyle = `rgba(255,${130 + 30 * pu | 0},50,${0.85})`; ctx.fill(pathRio);
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,190,110,${0.35 * br})`; ctx.lineWidth = 6; ctx.stroke(pathRio); ctx.restore();
      for (let z = CZ - R0 * 0.9; z <= CZ + R0 * 0.9; z += 1.6) { const q = cam.p(rio(z), 0.05, z); if (!q.atras && q.dz > 1) brilho(ctx, q.x, q.y, q.s * 1.6, 0.14 * br); }
      // paredes (gomos de pedra em volta), do fundo para a frente
      const gomos = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU, b = ((i + 1) / N) * TAU, ra = raioParede(a), rb = raioParede(b);
        const pts = [[CX + Math.cos(a) * ra, 0, CZ + Math.sin(a) * ra], [CX + Math.cos(b) * rb, 0, CZ + Math.sin(b) * rb], [CX + Math.cos(b) * rb * 0.82, TETO, CZ + Math.sin(b) * rb * 0.82], [CX + Math.cos(a) * ra * 0.82, TETO, CZ + Math.sin(a) * ra * 0.82]];
        const mx = (pts[0][0] + pts[1][0]) / 2, mz = (pts[0][2] + pts[1][2]) / 2;
        gomos.push({ d: Math.hypot(mx - cam.x, mz - cam.z), pts, i, a });
      }
      gomos.sort((p, q) => q.d - p.d).forEach(({ pts, i, a }) => {
        const cor = ['#3A2E42', '#342A3C', '#40324A', '#2E2636'][i % 4];
        face(ctx, cam, pts, cor, { linha: 1 });
        // veios brilhantes na parede
        if (i % 3 === 0) {
          const q0 = cam.p((pts[0][0] * 2 + pts[3][0]) / 3, 2.2, (pts[0][2] * 2 + pts[3][2]) / 3), q1 = cam.p((pts[1][0] + pts[2][0]) / 2, 5.2, (pts[1][2] + pts[2][2]) / 2);
          if (!q0.atras && !q1.atras && q0.dz > 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,150,60,${0.35 * br})`; ctx.lineWidth = Math.max(1, q0.s * 0.05); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo((q0.x + q1.x) / 2 + q0.s * 0.3, (q0.y + q1.y) / 2); ctx.lineTo(q1.x, q1.y); ctx.stroke(); ctx.restore(); }
        }
        if (Math.abs(((a - PINTURA_ANG + Math.PI) % TAU) - Math.PI) < 0.3 && i % 2 === 0) pinturas(ctx, cam, br);
      });
      // estalactites (penduradas no teto)
      for (const [x, z, h, w] of ESTALACTITES) {
        const q = cam.p(x, TETO, z), b = cam.p(x, TETO - h, z); if (q.atras || q.dz < 1) continue;
        ctx.fillStyle = cam.tom('#4A3E50', z); ctx.beginPath(); ctx.moveTo(q.x - w * q.s, q.y); ctx.lineTo(q.x + w * q.s, q.y); ctx.lineTo(b.x, b.y); ctx.closePath(); ctx.fill();
      }
      // pedestal do coração de pedra
      const [nx, , nz] = this.pontos.nucleo;
      Cena3D.cilindro(ctx, cam, nx, nz, 0, 0.9, 1.5, 1.1, '#4E4258', null, { topo: '#5E5068' });
      // cristais (do fundo para a frente)
      CRISTAIS.map((c) => ({ c, d: Math.hypot(c[0] - cam.x, c[1] - cam.z) })).sort((a, b) => b.d - a.d).forEach(({ c }) => grupoCristais(ctx, cam, c[0], 0, c[1], c[2], br * (0.8 + 0.2 * Math.sin(t * 2 + c[3])) + pu * 0.3, c[3]));
      // poeira brilhando no ar
      Cena3D.poeira(ctx, cam, [[-8, 0.3, 2], [8, 6, 16]], 60, t, { alpha: 0.5 });
      ctx.restore();
    },
  };

  // ===================== ESCADA EM ESPIRAL =====================
  const RE = 2.9, RC = 0.55, PASSO = 0.42, ALT = 0.24; // raio do poço, raio da coluna, ângulo por degrau, altura do degrau
  const degrau = (i) => ({ ang: i * PASSO, y: -i * ALT, x: Math.cos(i * PASSO) * (RE + RC) / 2, z: Math.sin(i * PASSO) * (RE + RC) / 2 });
  window.Cenarios3D.escada = {
    nevoa: '#180F14', degrau, raio: RE,
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0, br = o.brilho === undefined ? 1 : o.brilho;
      const W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.save();
      ctx.fillStyle = '#0E0A0E'; ctx.fillRect(-200, -200, W + 400, H + 400);
      const itens = [];
      // paredes do poço (anéis de pedra) — de y +4 até -14
      const NA = 28;
      for (let k = 0; k < 9; k++) for (let i = 0; i < NA; i++) {
        const a = (i / NA) * TAU, b = ((i + 1) / NA) * TAU, y0 = 4 - k * 2.2, y1 = y0 - 2.2, rr = RE + 0.35 + 0.12 * Math.sin(i * 3 + k);
        const pts = [[Math.cos(a) * rr, y0, Math.sin(a) * rr], [Math.cos(b) * rr, y0, Math.sin(b) * rr], [Math.cos(b) * rr, y1, Math.sin(b) * rr], [Math.cos(a) * rr, y1, Math.sin(a) * rr]];
        const mx = Math.cos((a + b) / 2) * rr, mz = Math.sin((a + b) / 2) * rr, my = (y0 + y1) / 2;
        itens.push({ d: Math.hypot(mx - cam.x, my - cam.y, mz - cam.z) + 2, f: () => {
          face(ctx, cam, pts, ['#3C2E30', '#352A2C', '#433436'][(i + k) % 3], { linha: 0.8 });
          if ((i * 7 + k * 3) % 5 === 0) { const q0 = cam.p(pts[0][0] * 0.99, y0 - 0.3, pts[0][2] * 0.99), q1 = cam.p(pts[2][0] * 0.99, y1 + 0.4, pts[2][2] * 0.99); if (!q0.atras && !q1.atras && q0.dz > 0.6) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,150,60,${0.5 * br})`; ctx.lineWidth = Math.max(1, q0.s * 0.04); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo((q0.x + q1.x) / 2 + q0.s * 0.15, (q0.y + q1.y) / 2); ctx.lineTo(q1.x, q1.y); ctx.stroke(); ctx.restore(); brilho(ctx, (q0.x + q1.x) / 2, (q0.y + q1.y) / 2, q0.s * 1.2, 0.2 * br); } }
        } });
      }
      // coluna central
      for (let k = 0; k < 9; k++) itens.push({ d: Math.hypot(cam.x, 4 - k * 2.2 - 1.1 - cam.y, cam.z) - 0.2, f: () => Cena3D.cilindro(ctx, cam, 0, 0, 4 - (k + 1) * 2.2, 4 - k * 2.2, RC, RC, '#4A3A3C', null, {}) });
      // degraus
      for (let i = -6; i < 52; i++) {
        const a = i * PASSO, b = a + PASSO * 1.05, y = -i * ALT;
        const top = [[Math.cos(a) * RC, y, Math.sin(a) * RC], [Math.cos(a) * RE, y, Math.sin(a) * RE], [Math.cos(b) * RE, y, Math.sin(b) * RE], [Math.cos(b) * RC, y, Math.sin(b) * RC]];
        const frente = [[Math.cos(a) * RC, y, Math.sin(a) * RC], [Math.cos(a) * RE, y, Math.sin(a) * RE], [Math.cos(a) * RE, y - ALT, Math.sin(a) * RE], [Math.cos(a) * RC, y - ALT, Math.sin(a) * RC]];
        const mx = Math.cos(a + PASSO / 2) * (RE + RC) / 2, mz = Math.sin(a + PASSO / 2) * (RE + RC) / 2;
        itens.push({ d: Math.hypot(mx - cam.x, y - cam.y, mz - cam.z), f: () => {
          face(ctx, cam, frente, '#4E3E40', { linha: 1 });
          face(ctx, cam, top, '#6A5658', { linha: 1 });
          // borda do degrau acesa de leve (luz que vem de baixo)
          const q0 = cam.p(Math.cos(a) * RC, y + 0.002, Math.sin(a) * RC), q1 = cam.p(Math.cos(a) * RE, y + 0.002, Math.sin(a) * RE);
          if (!q0.atras && !q1.atras) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,140,60,${0.25 * br})`; ctx.lineWidth = Math.max(1, q0.s * 0.02); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke(); ctx.restore(); }
        } });
      }
      itens.sort((p, q) => q.d - p.d).forEach((it) => it.f());
      // luz laranja vindo do fundo do poço
      const fundo = cam.p(0, -14, 0.01);
      if (!fundo.atras) brilho(ctx, fundo.x, fundo.y, 900, 0.4 * br);
      Cena3D.poeira(ctx, cam, [[-2.5, -12, -2.5], [2.5, 3, 2.5]], 40, t, { alpha: 0.4 });
      ctx.restore();
    },
  };
})();

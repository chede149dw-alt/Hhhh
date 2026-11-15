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

  // ===================== ESCADA DO TÚNEL =====================
  // escada de pedra reta descendo num túnel escavado: degrau i em z = i·0,34, y = -i·0,23 (x de -1,25 a 1,25);
  // paredes de rocha em x = ±1,7, teto acompanhando a descida, cristais nos cantos e luz laranja vindo do fundo.
  const PZ = 0.34, PY = 0.23, LX = 1.25, PX = 1.7;
  const degrau = (i) => ({ x: 0, y: -i * PY, z: i * PZ });
  const yEm = (z) => -(z / PZ) * PY;
  const rE = rng(77), CRIST_E = [];
  for (let i = 0; i < 18; i++) CRIST_E.push([(rE() < 0.5 ? -1 : 1) * (PX - 0.15), 2 + rE() * 28, 0.35 + rE() * 0.6, 300 + i]);
  window.Cenarios3D.escada = {
    nevoa: '#1A1014', degrau, yEm,
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0, br = o.brilho === undefined ? 1 : o.brilho;
      const W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.save();
      ctx.fillStyle = '#0E0A0C'; ctx.fillRect(-200, -200, W + 400, H + 400);
      // luz do fundo do túnel
      const fundo = cam.p(0, yEm(34) + 1.2, 34);
      if (!fundo.atras) brilho(ctx, fundo.x, fundo.y, 1100, 0.55 * br);
      const itens = [];
      for (let i = -8; i < 100; i++) {
        const z0 = i * PZ, z1 = z0 + PZ, y = -i * PY;
        const dz = z0 - cam.z; if (dz < -3 || dz > 34) continue;
        const d = Math.hypot(0 - cam.x, y - cam.y, z0 + PZ / 2 - cam.z);
        // paredes e teto por trecho (blocos de rocha irregulares)
        const a = 0.06 * Math.sin(i * 1.7), b = 0.06 * Math.sin(i * 2.3 + 1);
        itens.push({ d: d + 1.5, f: () => {
          face(ctx, cam, [[-PX - a, y - 0.6, z0], [-PX - b, y - 0.6 - PY, z1], [-PX - b, y + 3.0 - PY, z1], [-PX - a, y + 3.0, z0]], i % 2 ? '#3A2C2E' : '#433335', { linha: 0.8 });
          face(ctx, cam, [[PX + a, y - 0.6, z0], [PX + b, y - 0.6 - PY, z1], [PX + b, y + 3.0 - PY, z1], [PX + a, y + 3.0, z0]], i % 2 ? '#342829' : '#3D2F31', { linha: 0.8 });
          face(ctx, cam, [[-PX - a, y + 3.0, z0], [PX + a, y + 3.0, z0], [PX + b, y + 3.0 - PY, z1], [-PX - b, y + 3.0 - PY, z1]], '#2A2022', { linha: 0.6 });
          if (i % 4 === 1) for (const sx of [-1, 1]) {
            const q0 = cam.p(sx * PX * 0.99, y + 2.4, z0), q1 = cam.p(sx * PX * 0.99, y + 0.5, z1 + PZ * 2);
            if (!q0.atras && !q1.atras && q0.dz > 0.6) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (const [lw, cor] of [[q0.s * 0.07, `rgba(255,120,40,${0.3 * br})`], [q0.s * 0.025, `rgba(255,200,120,${0.85 * br})`]]) { ctx.strokeStyle = cor; ctx.lineWidth = Math.max(1, lw); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo((q0.x + q1.x) / 2 + sx * q0.s * 0.12, (q0.y + q1.y) / 2); ctx.lineTo(q1.x, q1.y); ctx.stroke(); } ctx.restore(); brilho(ctx, (q0.x + q1.x) / 2, (q0.y + q1.y) / 2, q0.s * 1.1, 0.18 * br); }
          }
        } });
        // degrau: espelho (frente, escuro) + piso (claro, luz quente) + borda gasta acesa
        itens.push({ d, f: () => {
          face(ctx, cam, [[-LX, y, z0], [LX, y, z0], [LX, y - PY, z0], [-LX, y - PY, z0]], '#3E2F31', { linha: 1 });
          face(ctx, cam, [[-LX, y, z0], [LX, y, z0], [LX, y, z1], [-LX, y, z1]], i % 3 ? '#7A6260' : '#866C69', { linha: 1 });
          // sobra de pedra nas laterais (degrau encaixado na parede)
          face(ctx, cam, [[-PX, y + 0.1, z0], [-LX, y, z0], [-LX, y, z1], [-PX, y + 0.1, z1]], '#4A3A3B', { contorno: false });
          face(ctx, cam, [[LX, y, z0], [PX, y + 0.1, z0], [PX, y + 0.1, z1], [LX, y, z1]], '#4A3A3B', { contorno: false });
          const q0 = cam.p(-LX, y + 0.003, z0), q1 = cam.p(LX, y + 0.003, z0);
          if (!q0.atras && !q1.atras) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,170,90,${0.35 * br})`; ctx.lineWidth = Math.max(1, q0.s * 0.018); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke(); ctx.restore(); }
        } });
      }
      for (const [x, z, h, sem] of CRIST_E) {
        if (z - cam.z < 0.8 || z - cam.z > 30) continue;
        itens.push({ d: Math.hypot(x - cam.x, yEm(z) - cam.y, z - cam.z), f: () => grupoCristais(ctx, cam, x, yEm(z) + 0.05, z, h, br, sem) });
      }
      itens.sort((p, q) => q.d - p.d).forEach((it) => it.f());
      Cena3D.poeira(ctx, cam, [[-1.5, cam.y - 3, cam.z + 0.5], [1.5, cam.y + 2, cam.z + 8]], 50, t, { alpha: 0.45 });
      ctx.restore();
    },
  };
})();

// Episódio 2 — "E se você acordasse controlando a terra?" (PARTE 2) — versão 3D
// Planos de roteiros/terra/ep02.json (~80 s). O quarto é o mesmo do episódio 1 (2D em perspectiva); a escada, a caverna,
// o coração de pedra, o golem, o muro, a coluna e as pedras caindo são 3D de verdade (cenarios/terra-3d.js).
// Tomadas contínuas: a mesma câmera atravessa várias falas (escada, pinturas, luta, mãe).
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const GOLEM = { fabrica: 'criarGolem', registroPoses: 'GOLEM_POSES' };
  const LUZ = { lado: 1, cor: 'rgb(255,165,80)', forca: 0.75 };
  const LUZ_FRIA = { lado: -1, cor: 'rgb(160,185,255)', forca: 0.65 };
  const W = 1080, H = 1920;
  const T3 = () => Terra3D;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };
  const angDe = (de, para) => Math.atan2(-(para[0] - de[0]), -(para[1] - de[1]));
  const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  function frio(ctx, k = 0.6) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = Math.min(1, k);
    ctx.fillStyle = '#4A5A8C'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(540, 960, 350, 540, 960, 1250);
    g.addColorStop(0, 'rgba(8,10,28,0)'); g.addColorStop(1, `rgba(8,10,28,${0.6 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function aceso(ctx, alfa, f) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alfa; f(); ctx.restore(); }
  function brilho(ctx, x, y, r, a, cor = '255,165,70') {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,226,176,${a})`); g.addColorStop(0.35, `rgba(${cor},${a * 0.55})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
  function pulso(api, u) {
    let v = 0;
    for (const b of api.batidas) {
      const d = u - b; if (d >= 0) v = Math.max(v, Math.exp(-d * 9));
      const d2 = d - 0.17; if (d2 >= 0) v = Math.max(v, 0.7 * Math.exp(-d2 * 9));
    }
    return v;
  }
  function veias(ctx, x, y, s, a, semente) {
    if (a <= 0) return;
    const rnd = rng(semente);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 6; i++) {
      let ang = (i / 6) * Math.PI * 2 + rnd() * 0.6, px = x, py = y;
      const pts = [[px, py]];
      for (let k = 0; k < 4; k++) { ang += (rnd() - 0.5) * 1.1; const L = s * (0.12 + rnd() * 0.12); px += Math.cos(ang) * L; py += Math.sin(ang) * L; pts.push([px, py]); }
      for (const [lw, cor] of [[s * 0.05, `rgba(255,140,50,${0.35 * a})`], [s * 0.018, `rgba(255,226,176,${0.9 * a})`]]) {
        ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([qx, qy], j) => (j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy))); ctx.stroke();
      }
    }
    ctx.restore();
  }
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
  // tempo de uma tomada que atravessa vários planos, em segundos reais desde o começo do primeiro plano + limites de cada um
  function tomada(api, ids) {
    const q = ids.map((id) => api.planos.find((k) => k.id === id));
    const T = api.t - q[0].inicio, marcos = q.map((k) => k.inicio - q[0].inicio);
    return { T, m: (id) => marcos[ids.indexOf(id)] };
  }
  // fundo desfocado do quarto (2D em perspectiva do episódio 1)
  function fundoQuarto(ctx, api, camOpts, px, o = {}) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D.quarto.nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D.quarto.desenhar(g, cam, { t: api.t });
    if (o.frio) frio(g, o.frio);
    if (o.depois) o.depois(g, cam);
    api.desfocar(camada, px);
    return cam;
  }
  // brilho do poder nas mãos atrás do corpo (de costas, mostra que as mãos estão na frente)
  function brilhoMaos(ctx, rig, t, k = 1) {
    if (!rig || !rig.ultimas) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'destination-over';
    for (const m of ['mao_d', 'mao_e']) {
      const p = rig.pontoMundo(m, [0, 0.2]), r = rig.escalaPx * k * (1.1 + 0.12 * Math.sin(t * 9 + (m === 'mao_d' ? 0 : 2)));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, 'rgba(255,236,190,0.95)'); g.addColorStop(0.3, 'rgba(255,170,80,0.55)'); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);
    }
    ctx.restore();
  }
  // lanterna do celular do Rafael (na mão direita)
  function lanterna(ctx, rig, a = 1) {
    if (!rig || !rig.ultimas) return;
    const p = rig.pontoMundo('mao_d', [0, 0.25]), s = rig.escalaPx;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1C1C24'; ctx.beginPath(); ctx.roundRect(p.x - s * 0.09, p.y - s * 0.16, s * 0.18, s * 0.3, s * 0.03); ctx.fill();
    ctx.restore();
    brilho(ctx, p.x, p.y - s * 0.1, s * 0.75, 0.5 * a, '220,235,255');
  }
  // abismo dentro da rachadura (2D, do episódio 1)
  function abismo(ctx, api, k, pu, desloc = 0) {
    ctx.fillStyle = '#0A0607'; ctx.fillRect(0, 0, W, H);
    const cx = 540 + Math.sin(api.t * 0.7) * 20, cy = 1020;
    brilho(ctx, cx, cy, 520 + 260 * pu + 180 * k, 0.45 + 0.5 * pu, '255,120,40');
    const rnd0 = rng(77);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,190,110,${0.35 + 0.45 * pu})`; ctx.beginPath();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = (70 + 40 * pu + 40 * k) * (0.7 + rnd0() * 0.5); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    const n = 7, camadas = [];
    for (let i = 0; i < n; i++) { const pos = (i + k * 3.2 + desloc) / n, zz = 1 - (pos % 1), id = i + n * Math.floor(pos); camadas.push({ zz, id }); }
    camadas.sort((a, b) => b.zz - a.zz);
    for (const { zz, id } of camadas) {
      const s = 0.22 / (zz + 0.07), rnd = rng(100 + id * 13), pts = [];
      for (let j = 0; j < 24; j++) { const a = (j / 24) * Math.PI * 2, r = 420 * s * (0.72 + rnd() * 0.4); pts.push([cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 1.15]); }
      const luz = Math.max(0, 1 - zz * 1.1);
      ctx.save(); ctx.beginPath(); ctx.rect(-50, -50, W + 100, H + 100);
      pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      const tom = Math.round(18 + 30 * luz);
      ctx.fillStyle = `rgb(${tom + 10},${Math.round(tom * 0.65)},${Math.round(tom * 0.5)})`; ctx.fill('evenodd');
      ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.strokeStyle = `rgba(255,140,50,${(0.25 + 0.5 * pu) * (1 - zz)})`; ctx.lineWidth = 10 * s; ctx.stroke();
      ctx.strokeStyle = `rgba(255,226,176,${(0.2 + 0.5 * pu) * (1 - zz)})`; ctx.lineWidth = 3 * s; ctx.stroke();
      ctx.restore();
    }
    const rp = rng(9);
    for (let i = 0; i < 70; i++) {
      const x0 = rp() * W, y0 = rp() * H, v = 20 + rp() * 60, r = 2 + rp() * 5;
      const y = (y0 - api.t * v) % H, x = x0 + Math.sin(api.t + i) * 20;
      brilho(ctx, x, y < 0 ? y + H : y, r * 4, 0.35 + 0.3 * pu);
    }
  }
  // degrau: corpo baixa um degrau por passo e cada pé pousa em cima do degrau (s = degraus andados, contínuo)
  function naEscada(s, lado) {
    const D = T3().escada, n = Math.floor(s), fr = s - n;
    const desce = fr < 0.15 ? 0 : fr > 0.75 ? 1 : (1 - Math.cos(Math.PI * (fr - 0.15) / 0.6)) / 2;
    return { x: D.X0 + lado, z: (s + 0.5) * D.PZ, y: -(n + desce) * D.PY, descer: (0.5 + s) / 1.7 };
  }

  // ---------- pontos da caverna ----------
  const NUC = [0, 2.5, 11.5], ENT = [5.5, 1.5];
  const MURAL = [-11.35, 6.1], NM = [0.969, 0.248], TM = [-0.248, 0.969]; // mural, normal (para o centro) e tangente
  const noMural = (dn, dt) => [MURAL[0] + NM[0] * dn + TM[0] * dt, MURAL[1] + NM[1] * dn + TM[1] * dt];
  const ANG_MURAL = Math.atan2(-NM[0], -NM[1]); // câmera olhando para o mural
  // luta
  const G0 = [0.6, 8.9], GA = [0.1, 7.5], GB = [0.15, 9.1], LL = [-2.0, 6.2], RR = [-0.6, 5.4], MU = [-0.25, 6.7];

  // ---------- tomadas ----------
  function tomadaEscada(ctx, api) {
    const { T, m } = tomada(api, ['desce', 'espera', 'medo', 'valeu']);
    const t1 = m('espera'), t2 = m('medo'), t3 = m('valeu');
    // Lucas: desce 9 → 10 durante "desce", para e se vira para cima quando o Rafael chama
    const sL = Math.min(10, 9 + T * 0.6), L = naEscada(sL, -0.5), andandoL = T < t1 + 0.05 && sL < 10;
    // Rafael: entra lá em cima e desce correndo até o degrau 9
    const sR = T < t1 ? 3 : Math.min(9, 3 + (T - t1) * 3.0), R = naEscada(sR, 0.5), andandoR = T >= t1 && sR < 9;
    const alvo = chave(T, [[0, [L.x, L.y + 0.95, L.z]], [t1, [L.x, L.y + 0.95, L.z]], [t1 + 0.9, [R.x - 0.2, R.y + 1.2, R.z + 0.2]], [t2, [(L.x + R.x) / 2, L.y + 1.1, (L.z + R.z) / 2]], [t3 - 1.2, [(L.x + R.x) / 2, L.y + 1.1, (L.z + R.z) / 2]], [t3 + 0.9, [L.x, L.y + 1.45, L.z]]]);
    const cam = api.orbita({
      alvo, raio: chave(T, [[0, 3.1], [t1, 3.1], [t1 + 0.9, 3.6], [t2, 3.0], [t3 - 1.2, 2.8], [t3 + 0.9, 1.7]]),
      ang: chave(T, [[0, Math.PI - 0.95], [t1, Math.PI - 0.9], [t1 + 0.9, Math.PI - 0.55], [t2, Math.PI - 0.5], [t3 - 1.2, Math.PI - 0.7], [t3 + 0.9, 0.45]]),
      altura: chave(T, [[0, L.y + 0.55], [t1, L.y + 0.6], [t1 + 0.9, L.y + 1.0], [t2, L.y + 1.2], [t3 - 1.2, L.y + 1.2], [t3 + 0.9, L.y + 2.0]]), f: chave(T, [[0, 980], [t3 - 1.2, 1000], [t3 + 0.9, 1150]]), ySalvo: chave(T, [[0, 1080], [t3 - 1.2, 1040], [t3 + 0.9, 900]]),
    });
    const exL = T < t1 ? { ...LUCAS_EXPRESSOES.curioso, olhar: [0.01, 0.012] } : T < t1 + 0.4 ? 'espanto' : T < t3 ? 'neutro' : 'feliz';
    const res = T3().cena(ctx, api, cam, [
      { f: () => api.personagem3d(cam, { ...LUCAS, pose: andandoL ? {} : 'parado', expressao: exL, voz: 'lucas' }, L.x, L.z, 1.75, andandoL ? { y: L.y, descer: L.descer, vida: 0, luz: LUZ, rumo: Math.PI } : { y: L.y, luz: LUZ, rumo: chave(T, [[t1, Math.PI], [t1 + 0.5, 0.15]]) }) },
      ...(T >= t1 - 0.01 ? [{ f: () => { const rig = api.personagem3d(cam, { ...RAFAEL, pose: andandoR ? {} : 'parado', expressao: T < t2 ? 'medo' : T < t3 ? 'preocupado' : 'feliz', voz: 'rafael' }, R.x, R.z, 1.8, andandoR ? { y: R.y, descer: R.descer, vida: 0, luz: LUZ, rumo: Math.PI } : { y: R.y, luz: LUZ, rumo: Math.PI - 0.15 }); lanterna(ctx, rig); return rig; } }] : []),
    ], { nucleo: false, sol: 4, luzes: [{ x: L.x, y: L.y + 1.6, z: L.z + 1.2, cor: '#FFB070', forca: 1.2, raio: 5 }, ...(T >= t1 ? [{ x: R.x, y: R.y + 1.3, z: R.z + 0.3, cor: '#DDEBFF', forca: 2.2, raio: 5 }] : [])] });
    void res;
  }

  function tomadaMural(ctx, api) {
    const { T, m } = tomada(api, ['desenhos', 'criancas', 'unico']);
    const t1 = m('criancas'), t2 = m('unico');
    const PL = noMural(2.5, 0.65), PR = noMural(2.25, -0.55), luzM = noMural(0.6, -0.3 + T * 0.18);
    let cam;
    if (T < t2) {
      // a câmera desliza ao longo do mural (de um lado para o outro) e depois abre mostrando os dois olhando
      const dt = chave(T, [[0, 2.2], [t1, -0.4], [t2, 0.1]]), dn = chave(T, [[0, 1.0], [t1, 1.2], [t2, 1.6]]);
      const a = noMural(dn, dt);
      cam = api.orbita({ alvo: [a[0], 2.2, a[1]], raio: chave(T, [[0, 3.2], [t1, 3.6], [t2, 5.4]]), ang: ANG_MURAL + chave(T, [[0, 0.35], [t1, -0.1], [t2, 0.12]]), altura: chave(T, [[0, 2.3], [t2, 1.7]]), f: 1050, ySalvo: 1000 });
    } else {
      // "Você não é o único": de frente para o Rafael, com a luz do celular no rosto
      const U = T - t2;
      cam = api.orbita({ alvo: [PR[0], 1.55, PR[1]], raio: 2.3 - U * 0.15, ang: ANG_MURAL + Math.PI + 1.15 - U * 0.05, altura: 1.6, f: 1150, ySalvo: 930 });
    }
    T3().cena(ctx, api, cam, [
      { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: T < t2 ? 'curioso' : 'espanto' }, PL[0], PL[1], 1.75, { luz: LUZ, olhaPara: noMural(0, 0.6) }) },
      { f: () => { const rig = api.personagem3d(cam, { ...RAFAEL, pose: 'acenando', expressao: T < t2 ? 'espanto' : { ...EXPRESSOES_PADRAO.espanto }, voz: 'rafael' }, PR[0], PR[1], 1.8, { luz: LUZ, olhaPara: noMural(0, -0.4) }); lanterna(ctx, rig); return rig; } },
    ], { pulso: 0.15, luzes: [{ x: luzM[0], y: 2.4, z: luzM[1], cor: '#EAF2FF', forca: 3.2, raio: 4.5 }] });
  }

  function tomadaLuta(ctx, api) {
    const ids = ['levanta', 'avanca', 'muro', 'manda', 'naoataca', 'ajoelha'];
    const { T, m } = tomada(api, ids);
    const tA = m('avanca'), tM = m('muro'), tC = m('manda'), tN = m('naoataca'), tJ = m('ajoelha');
    const monta = api.clamp(T / 1.9, 0, 1);
    const hitMuro = tM + 1.75, hitCol = tC + 0.75;
    // golem: monta → avança no Rafael → bate no muro → é jogado para trás → se endireita → ajoelha
    let G = G0;
    if (T >= tA) G = lerp2(G0, GA, api.ease.entra(api.clamp((T - tA) / 1.6, 0, 1)));
    if (T >= hitCol) G = lerp2(GA, GB, 1 - Math.pow(1 - api.clamp((T - hitCol) / 0.55, 0, 1), 3));
    const incl = T < hitCol ? 0 : T < tN ? -0.42 * Math.min(1, (T - hitCol) / 0.3) : -0.42 * (1 - api.ease.suave(api.clamp((T - tN) / 1.8, 0, 1)));
    const poseG = T < tA ? 'parado' : T < hitMuro - 0.45 ? 'punho' : T < hitMuro + 0.6 ? 'soco' : T < tC ? 'parado' : T < tN ? 'erguendo' : 'parado';
    const muroSobe = T < tM + 0.25 ? 0 : api.ease.volta(api.clamp((T - tM - 0.25) / 0.45, 0, 1));
    const racha = api.clamp((T - hitMuro) / 0.25, 0, 1);
    const colK = api.clamp((T - (hitCol - 0.35)) / 0.35, 0, 1) * (1 - api.clamp((T - tN - 0.8) / 0.8, 0, 1));
    // tremor: montagem, golpes
    const forca = (T < 1.9 ? 8 : 0) + 22 * Math.exp(-Math.max(0, T - hitMuro) * 4) * (T > hitMuro ? 1 : 0) + 26 * Math.exp(-Math.max(0, T - hitCol) * 3.5) * (T > hitCol ? 1 : 0) + (T > tJ + 0.9 ? 10 * Math.exp(-(T - tJ - 0.9) * 4) : 0);
    const [tx, ty] = api.tremor(forca);
    ctx.save(); ctx.translate(tx, ty);
    const cam = api.orbita({
      alvo: chave(T, [[0, [0.3, 1.5, 8.2]], [tA, [0.1, 1.7, 7.6]], [tM, [-0.6, 1.5, 6.8]], [tC, [-0.6, 1.6, 7.2]], [tN, [-0.2, 1.6, 7.8]], [tJ, [-0.2, 1.5, 8.0]], [tJ + 3, [-0.3, 1.4, 8.0]]]),
      raio: chave(T, [[0, 4.6], [tA, 5.6], [tM, 6.0], [tC, 6.4], [tN, 6.0], [tJ + 3, 5.4]]),
      ang: chave(T, [[0, -0.2], [tA, 0.05], [tM, 0.32], [tC, 0.18], [tN, 0.2], [tJ, -0.05], [tJ + 3, -0.2]]),
      altura: chave(T, [[0, 0.55], [tA, 0.9], [tM, 1.2], [tN, 1.3], [tJ + 3, 1.2]]), f: 1000, ySalvo: 1080,
    });
    const exL = T < tM ? 'espanto' : T < tN ? 'raiva' : T < tJ ? 'determinado' : 'espanto';
    const exR = T < tN ? 'medo' : 'espanto';
    const poseL = T > tM - 0.1 && T < tN ? 'poder' : 'parado';
    const res = T3().cena(ctx, api, cam, [
      { f: () => {
        const q = cam.p(G[0], 0, G[1]);
        ctx.save(); if (incl && !q.atras) { ctx.translate(q.x, q.y); ctx.rotate(incl * (cam.p(G[0] + 1, 0, G[1]).x > q.x ? 1 : -1)); ctx.translate(-q.x, -q.y); }
        let rig;
        if (T >= tJ) {
          const ajo = api.clamp((T - tJ - 0.3) / 0.6, 0, 1);
          rig = ajo < 0.5 ? api.personagem3d(cam, { ...GOLEM, pose: 'parado', opcoes: { brilho: 1 } }, G[0], G[1], 3.2, { luz: LUZ, olhaPara: LL })
            : api.personagem3d(cam, { ...GOLEM, pose: 'ajoelhado', opcoes: { brilho: 0.75 }, espelhar: cam.p(LL[0], 0, LL[1]).x < q.x }, G[0], G[1], 3.2, { luz: LUZ });
        } else rig = api.personagem3d(cam, { ...GOLEM, pose: poseG, opcoes: { monta, brilho: monta } }, G[0], G[1], 3.2, { luz: LUZ, olhaPara: T < tN ? RR : LL });
        ctx.restore(); return rig;
      } },
      { f: () => { const rig = api.personagem3d(cam, { ...LUCAS, pose: poseL, expressao: exL }, LL[0], LL[1], 1.75, { luz: LUZ, olhaPara: T < tN ? G : G }); if (poseL === 'poder') brilhoMaos(ctx, rig, api.t, 0.9); return rig; } },
      { f: () => api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: exR }, RR[0], RR[1], 1.8, { luz: LUZ, olhaPara: G, vida: T < tN ? 2.5 : 1 }) },
    ], {
      pulso: 0.25 + 0.2 * Math.sin(api.t * 3),
      muro: { x: MU[0], z: MU[1], larg: 2.2, sobe: muroSobe * (1 - api.ease.suave(api.clamp((T - tN - 0.2) / 1.1, 0, 1))), racha, altura: 2.0 },
      coluna: { x: GA[0] + 0.05, z: GA[1] - 0.55, altura: 2.6, k: colK, incl: -0.55, giro: 0, grossura: 1.1 },
      luzes: [{ x: LL[0] + 0.3, y: 1.5, z: LL[1] + 0.5, cor: '#FFB060', forca: poseL === 'poder' ? 1.8 : 0.4, raio: 5 }],
      depois: () => {
        // poeira: montagem, muro subindo, golpe da coluna
        const pG = cam.p(G[0], 0, G[1]);
        if (T < 2.2 && !pG.atras) Efeitos.terraPoeira(ctx, pG.x, pG.y, pG.s * 2.4, api.clamp(T / 2.2, 0.01, 0.99), { semente: 41 });
        const pM = cam.p(MU[0], 0, MU[1]);
        if (muroSobe > 0 && T < tM + 1.3 && !pM.atras) Efeitos.terraPoeira(ctx, pM.x, pM.y, pM.s * 1.6, api.clamp((T - tM - 0.25) / 1.0, 0.01, 0.99), { semente: 43 });
        if (T > hitMuro && T < hitMuro + 0.8) Efeitos.impacto(ctx, cam, MU[0], MU[1] + 0.3, api.clamp((T - hitMuro) / 0.8, 0.01, 0.99), api.t, { tamanho: 0.7 });
        if (T > hitCol && T < hitCol + 1.4 && !pG.atras) Efeitos.terraPoeira(ctx, pG.x, pG.y, pG.s * 3.0, api.clamp((T - hitCol) / 1.4, 0.01, 0.99), { semente: 47 });
        if (T > tJ + 0.9 && T < tJ + 2.0 && !pG.atras) Efeitos.terraPoeira(ctx, pG.x, pG.y, pG.s * 1.8, api.clamp((T - tJ - 0.9) / 1.1, 0.01, 0.99), { semente: 53 });
      },
    });
    void res;
    ctx.restore();
  }

  function tomadaMae(ctx, api) {
    const { T, m } = tomada(api, ['passos', 'mae', 'maeq']);
    const tM = m('mae'), tQ = m('maeq');
    const M = T < tM ? ENT : lerp2(ENT, [4.4, 2.6], api.ease.suave(api.clamp((T - tM) / 2.2, 0, 1)));
    const andaM = T >= tM && T < tM + 2.2;
    let cam;
    const P0 = [-0.6, 1.5, 8.2];
    if (T < tM) {
      // virada rápida da câmera para a entrada: uma silhueta com um colar brilhando
      const a = chave(T, [[0, 0.45], [0.35, 2.3], [tM, 2.36]]);
      cam = api.orbita({ alvo: [P0[0], P0[1], P0[2]], raio: 0.01, ang: a, altura: P0[1], f: chave(T, [[0, 1000], [0.35, 1000], [tM, 1250]]), ySalvo: 1000 });
    } else if (T < tQ) {
      const U = T - tM;
      cam = api.orbita({ alvo: [M[0], 1.45, M[1]], raio: 3.2 - U * 0.3, ang: angDe(M, LL) + Math.PI + 0.25, altura: 1.5, f: 1150, ySalvo: 950 });
    } else {
      const U = T - tQ;
      cam = api.orbita({ alvo: [LL[0], 1.5, LL[1]], raio: 1.45 - U * 0.15, ang: angDe(LL, M) - 0.25, altura: 1.5, f: 1200, ySalvo: 880 });
    }
    const sombra = 1 - api.clamp((T - tM - 0.2) / 1.2, 0, 1);
    T3().cena(ctx, api, cam, [
      { f: () => {
        ctx.save(); if (sombra > 0.02) ctx.filter = `brightness(${(1 - sombra * 0.88).toFixed(3)})`;
        const rig = api.personagem3d(cam, { ...MAE, pose: 'parado', expressao: 'serio', voz: 'mae' }, M[0], M[1], 1.65, andaM ? { luz: LUZ, olhaPara: LL, caminhar: api.t, velocidade: 0.8 } : { luz: LUZ, olhaPara: LL });
        ctx.restore();
        if (rig && rig.ultimas) { const p = rig.pontoMundo('tronco', [0, -1.1]); if (p.x > -1000) Efeitos.amuleto(ctx, p.x, p.y, rig.escalaPx * 0.32, 1, api.t, [rig.pontoMundo('pescoco', [-0.11, 0]), rig.pontoMundo('pescoco', [0.11, 0])].map((q) => [q.x, q.y])); }
        return rig;
      } },
      { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: T < tQ ? 'espanto' : { ...LUCAS_EXPRESSOES.espanto, pupila: 0.4 }, voz: 'lucas' }, LL[0], LL[1], 1.75, { luz: LUZ, olhaPara: M }) },
      { f: () => api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'espanto' }, RR[0], RR[1], 1.8, { luz: LUZ, olhaPara: M }) },
      { f: () => api.personagem3d(cam, { ...GOLEM, pose: 'ajoelhado', opcoes: { brilho: 0.6 }, espelhar: true }, GB[0], GB[1], 3.2, { luz: LUZ }) },
    ], { pulso: 0.2, luzes: [{ x: M[0], y: 1.3, z: M[1] + 0.4, cor: '#FF9A40', forca: 1.0 + 0.6 * (1 - sombra), raio: 3 }] });
  }

  window.PLANOS = {
    // capa: o Lucas de costas no alto da escada, olhando o buraco que brilha laranja lá embaixo
    capa(ctx, u, d, api) {
      const L = naEscada(2, -0.1);
      const cam = api.orbita({ alvo: [L.x, L.y + 0.6, L.z + 1.2], raio: 3.4 - u * 0.12, ang: 0.12 - u * 0.05, altura: L.y + 2.0, f: 1000, ySalvo: 1280 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'determinado' }, L.x, L.z, 1.75, { y: L.y, luz: LUZ, rumo: Math.PI }) },
      ], { nucleo: false, sol: 3, luzes: [{ x: L.x, y: L.y + 1.4, z: L.z + 2.5, cor: '#FF9A40', forca: 2.0, raio: 6 }] });
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); zoom(ctx, 540, 380, k);
      api.texto('E SE VOCÊ', 540, 250, 92); api.texto('ACORDASSE', 540, 360, 92); api.texto('CONTROLANDO', 540, 470, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 610); ctx.scale(k2, k2); ctx.rotate(-0.03); ctx.translate(-540, -610);
      api.texto('A TERRA?', 540, 610, 150, { cor: Estilo.base.mostarda });
      ctx.restore();
      // selo PARTE 2
      const k3 = api.fase(0.55, 0.85, 'volta');
      ctx.save(); ctx.translate(540, 790); ctx.scale(k3, k3); ctx.rotate(-0.04);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -70, 460, 140, 26); ctx.fill();
      ctx.font = '900 92px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('PARTE 2', 0, 6);
      ctx.restore();
    },

    // lembrete: o poder da Parte 1 (o Lucas no quarto com a esfera de terra nas mãos)
    lembra(ctx, u, d, api) {
      const L = [0, 2.4];
      const cam = api.orbita({ alvo: [L[0] + 0.25, 1.3, L[1]], raio: 1.75, ang: api.lerp(-0.4, -0.05, u / d), altura: 1.3, f: 1250, ySalvo: 1150, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, L[0], L[1], 1.75, { luz: LUZ_FRIA, rumo: -0.95, vida: 1.5 });
      frio(ctx, 0.6);
      const a = rig.pontoMundo('mao_d', [0, 0.3]), b = rig.pontoMundo('mao_e', [0, 0.3]);
      const ex = (a.x + b.x) / 2 + 60, ey = (a.y + b.y) / 2;
      brilho(ctx, ex, ey, 520, 0.35);
      Efeitos['poder-terra'](ctx, ex, ey, 260, { t: api.t });
      // tom de lembrança: borda clara e leve sépia
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,200,140,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    },

    // e alguma coisa acordou junto com ele: o brilho pulsando dentro da rachadura
    acordou(ctx, u, d, api) {
      const pu = pulso(api, u);
      const [tx, ty] = api.tremor(3 + 4 * pu);
      ctx.save(); ctx.translate(tx, ty); abismo(ctx, api, api.fase(0, d, 'entra'), pu); ctx.restore();
    },

    // meia-noite: deitado de olhos abertos; o chão pulsa laranja no ritmo do coração
    meianoite(ctx, u, d, api) {
      const pu = pulso(api, u);
      const z = api.lerp(1.0, 1.08, u / d);
      ctx.save(); zoom(ctx, 540, 1000, z);
      fundoQuarto(ctx, api, { x: 1.0, y: 1.0, z: 0.9, cy: 900 }, 10, { frio: 0.9 });
      const rig = new Rig(criarLucas({}, 'perfil'));
      rig.usarPose({ ...LUCAS_POSES.caido.angulos, cabeca: -6 + Math.sin(u * 1.3) * 1.5 });
      rig.usarExpressao({ ...LUCAS_EXPRESSOES.cansado, palpebra: 0.12, olhar: [0.012 * Math.sin(u * 1.5), -0.008] });
      const tmp = api.camada().getContext('2d');
      rig.desenhar(tmp, 0, 0, 2300);
      const c = rig.pontoMundo('cabeca', [0, 0]);
      rig.desenhar(ctx, 600 - c.x, 1050 - c.y, 2300);
      ctx.restore();
      frio(ctx, 0.75);
      // luz laranja vindo do chão, pulsando
      brilho(ctx, 540, 2050, 1100, 0.18 + 0.5 * pu, '255,120,40');
    },

    // a voz da terra: "Lucas..." — ele se assusta, poeira sobe do chão
    chamado(ctx, u, d, api) {
      const pu = 0.5 + 0.5 * Math.sin(u * 5);
      const [tx, ty] = api.tremor(2 + 3 * Math.exp(-u * 2));
      ctx.save(); ctx.translate(tx, ty); zoom(ctx, 540, 960, 1.04 + u * 0.03);
      fundoQuarto(ctx, api, { x: -0.2, y: 1.2, z: 0.4, cy: 960 }, 12, { frio: 0.85 });
      close(api, { ...LUCAS, pose: 'parado', expressao: u < 0.3 ? 'espanto' : 'medo' }, 540, 1000, 600, { luz: LUZ_FRIA, vida: 2.2 });
      ctx.restore();
      frio(ctx, 0.4);
      brilho(ctx, 540, 2000, 1000, 0.25 + 0.3 * pu, '255,120,40');
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.9);
    },

    // a rachadura embaixo da cama se abre: degraus de pedra brilhando, descendo
    abre(ctx, u, d, api) {
      const k = api.ease.suave(api.clamp((u - 0.2) / 2.2, 0, 1));
      const [tx, ty] = api.tremor(6 + 8 * k);
      ctx.save(); ctx.translate(tx, ty);
      const L = [-0.55, 2.7];
      const cam = api.orbita({ alvo: [0.25, 0.7, 2.25], raio: 2.6 - 0.3 * k, ang: api.lerp(-0.35, -0.05, u / d), altura: 1.75, f: 1000, ySalvo: 1150, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 1.0 });
      const rach = () => {
        Efeitos.rachadura(ctx, cam, [1.0, 2.0], [-0.25, 2.5], 1, api.t, { largura: 0.04 + 0.14 * k, zigue: 0.5, semente: 23 });
        Efeitos.rachadura(ctx, cam, [1.0, 2.3], [0.35, 3.3], 1, api.t, { largura: 0.025 + 0.06 * k, semente: 29 });
      };
      rach();
      // degraus aparecendo dentro da fenda
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const f = (i + 0.5) / 6, X = 1.0 + (-0.25 - 1.0) * f, Z = 2.0 + (2.5 - 2.0) * f, q0 = cam.p(X - 0.05, 0, Z - 0.15 * k), q1 = cam.p(X + 0.05, 0, Z + 0.15 * k);
        if (q0.atras || q1.atras) continue;
        ctx.strokeStyle = `rgba(255,220,160,${0.7 * k})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(q0.x, q0.y + 10 * i * k); ctx.lineTo(q1.x, q1.y + 10 * i * k); ctx.stroke();
      }
      ctx.restore();
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: k < 0.3 ? 'espanto' : 'curioso' }, L[0], L[1], 1.75, { luz: LUZ_FRIA, olhaPara: [0.4, 2.2] });
      ctx.restore();
      frio(ctx, 0.62);
      const q = cam.p(0.4, 0, 2.25);
      if (!q.atras) brilho(ctx, q.x + tx, q.y + ty, 260 + 450 * k, 0.25 + 0.35 * k, '255,130,50');
      ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.4, rach); ctx.restore();
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.8);
    },

    desce(ctx, u, d, api) { tomadaEscada(ctx, api); },
    espera(ctx, u, d, api) { tomadaEscada(ctx, api); },
    medo(ctx, u, d, api) { tomadaEscada(ctx, api); },
    valeu(ctx, u, d, api) { tomadaEscada(ctx, api); },

    // revelação: a câmera sai de perto deles e abre na caverna gigante
    caverna(ctx, u, d, api) {
      const k = api.ease.suave(api.clamp(u / d, 0, 1));
      const Lp = lerp2([3.6, 3.4], [2.6, 5.0], k), Rp = lerp2([4.4, 3.0], [3.4, 4.6], k);
      const cam = api.orbita({ alvo: [3.2 - 1.6 * k, 1.5 + 0.8 * k, 4.0 + 2.6 * k], raio: 2.2 + 7.5 * k, ang: -0.45 + 0.1 * k, altura: 1.5 + 2.2 * k, f: 1000, ySalvo: 1050 - 50 * k });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: {}, expressao: 'espanto' }, Lp[0], Lp[1], 1.75, { luz: LUZ, olhaPara: [NUC[0], NUC[2]], caminhar: api.t, velocidade: 0.7 }) },
        { f: () => api.personagem3d(cam, { ...RAFAEL, pose: {}, expressao: 'espanto' }, Rp[0], Rp[1], 1.8, { luz: LUZ, olhaPara: [NUC[0], NUC[2]], caminhar: api.t + 0.3, velocidade: 0.7 }) },
      ], { pulso: 0.3 + 0.2 * Math.sin(api.t * 3.4) });
    },

    desenhos(ctx, u, d, api) { tomadaMural(ctx, api); },
    criancas(ctx, u, d, api) { tomadaMural(ctx, api); },
    unico(ctx, u, d, api) { tomadaMural(ctx, api); },

    // no centro, o coração de pedra bate junto com o coração dele
    coracao(ctx, u, d, api) {
      const pu = pulso(api, u);
      const cam = api.orbita({ alvo: [NUC[0] - 0.9, 1.8, NUC[2] - 0.8], raio: 4.6 - u * 0.15, ang: -0.45 + u * 0.06, altura: 1.5, f: 1050, ySalvo: 1000 });
      const P = [NUC[0] - 1.9, NUC[2] - 1.9];
      T3().cena(ctx, api, cam, [
        { f: () => { const rig = api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: { ...LUCAS_EXPRESSOES.curioso, olhar: [0.014, -0.012] } }, P[0], P[1], 1.75, { luz: LUZ, olhaPara: [NUC[0], NUC[2]] });
          const p = rig.pontoMundo && rig.pontoMundo('tronco', [0, 0.25]); if (p && p.x > -1000) { brilho(ctx, p.x, p.y, rig.escalaPx * 1.6 * (0.6 + 0.6 * pu), 0.2 + 0.5 * pu); veias(ctx, p.x, p.y, rig.escalaPx * 2.4, 0.3 + 0.6 * pu, 91); } return rig; } },
      ], { pulso: pu });
    },

    // ele encosta a mão: linhas de luz sobem pelo braço
    mao(ctx, u, d, api) {
      const k = api.clamp((u - 0.35) / 0.9, 0, 1);
      const P = [NUC[0] - 0.02, NUC[2] - 1.62];
      const cam = api.orbita({ alvo: [P[0], 1.7, P[1] + 0.45], raio: 3.3 - u * 0.15, ang: Math.PI / 2 - 0.35, altura: 1.75, f: 1100, ySalvo: 1000 });
      const pose = { ...LUCAS_POSES.apontando.angulos, braco_d: -112 - 8 * k, antebraco_d: -10, mao_d: -30, cabeca: -14, _maos: { d: 'aberta' } };
      const res = T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose, expressao: k < 0.5 ? 'curioso' : 'espanto' }, P[0], P[1], 1.75, { luz: LUZ, rumo: Math.PI }) },
      ], { pulso: 0.4 + 0.6 * k * (0.6 + 0.4 * Math.sin(api.t * 9)) });
      const rig = res[0];
      if (rig && rig.ultimas && k > 0) {
        const pts = [rig.pontoMundo('mao_d', [0, 0.3]), rig.pontoMundo('antebraco_d', [0, 0]), rig.pontoMundo('braco_d', [0, 0]), rig.pontoMundo('tronco', [0, 0.2])];
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        const n = Math.max(1, Math.round(k * 3));
        for (const [lw, cor] of [[rig.escalaPx * 0.2, 'rgba(255,140,50,0.4)'], [rig.escalaPx * 0.07, 'rgba(255,230,180,0.95)']]) {
          ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        }
        ctx.restore();
        brilho(ctx, pts[0].x, pts[0].y, rig.escalaPx * 2.5, 0.4 + 0.4 * k);
        veias(ctx, pts[0].x, pts[0].y, rig.escalaPx * 3, k, 61);
      }
    },

    // visão: silhuetas escuras de olhos brilhando, chegando
    guardiao(ctx, u, d, api) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120408'); g.addColorStop(0.6, '#3A0C10'); g.addColorStop(1, '#5A1A0C');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      brilho(ctx, 540, 1500, 900, 0.35 + 0.1 * Math.sin(api.t * 7), '255,60,30');
      const OP = [
        { altura: 6.2, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabNoite' }, top: { tipo: 'moletom', cor: 'grafite' }, calca: { tipo: 'reta', cor: 'grafite' } },
        { altura: 6.6, pele: 'pele3', cabelo: { estilo: 'baguncado', cor: 'cabNoite' }, top: { tipo: 'moletom', cor: 'grafite' }, calca: { tipo: 'reta', cor: 'grafite' } },
        { altura: 5.9, pele: 'pele1', cabelo: { estilo: 'coque', cor: 'cabNoite' }, top: { tipo: 'moletom', cor: 'grafite' }, calca: { tipo: 'reta', cor: 'grafite' } },
      ];
      const fig = [[-330, 0.0, 0], [0, 0.35, 1], [330, 0.1, 2], [-160, 0.7, 1], [170, 0.6, 0]];
      const ord = fig.map(([x, z, i], j) => ({ x, z: z - u * 0.25, i, j })).sort((a, b) => a.z - b.z).reverse();
      for (const f of ord) {
        const s = 1 / (1.6 + f.z * 2.2), alt = 1500 * s, yS = 1300 + 420 * s;
        const L = api.camada(), gl = L.getContext('2d');
        const tmpRig = new Rig(criarPersonagem(OP[f.i], 'frente'));
        tmpRig.usarPose({ ...POSES_PADRAO.parado.angulos, coxa_d: 8 * Math.sin(api.t * 3 + f.j), coxa_e: -8 * Math.sin(api.t * 3 + f.j) });
        tmpRig.desenhar(gl, 540 + f.x * s * 2, yS, alt);
        ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.92; ctx.drawImage(L, 0, 0); ctx.restore();
        for (const lado of [-1, 1]) { const p = tmpRig.pontoMundo('cabeca', [lado * 0.14, -0.42]); brilho(ctx, p.x, p.y, alt * 0.05, 0.95, '255,90,30'); brilho(ctx, p.x, p.y, alt * 0.015, 1, '255,230,200'); }
      }
      // névoa vermelha por cima e piscadas de "visão"
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const nv = ctx.createLinearGradient(0, 1100, 0, H); nv.addColorStop(0, 'rgba(120,20,10,0)'); nv.addColorStop(1, 'rgba(160,40,20,0.45)');
      ctx.fillStyle = nv; ctx.fillRect(0, 0, W, H); ctx.restore();
      const flash = Math.max(0, 1 - u * 4);
      if (flash > 0) { ctx.fillStyle = `rgba(255,200,150,${flash * 0.8})`; ctx.fillRect(0, 0, W, H); }
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
    },

    // a caverna treme: pedras caem do teto, os cristais piscam
    treme(ctx, u, d, api) {
      const [tx, ty] = api.tremor(18 - u * 4);
      ctx.save(); ctx.translate(tx, ty);
      const C = [-0.8, 6.0];
      const cam = api.orbita({ alvo: [C[0], 1.6, C[1]], raio: 4.2 + u * 0.4, ang: 0.6 - u * 0.1, altura: 1.0, f: 1000, ySalvo: 1080 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'medo' }, LL[0], LL[1], 1.75, { luz: LUZ, vida: 3, olhaPara: [0, 9] }) },
        { f: () => api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'medo' }, RR[0], RR[1], 1.8, { luz: LUZ, vida: 3, olhaPara: [0, 9] }) },
      ], { pulso: 0.6 + 0.4 * Math.sin(api.t * 17), piscar: 1, queda: { x: C[0] + 0.8, z: C[1] + 1.5, s: u } });
      ctx.restore();
      Efeitos.poeiraTeto(ctx, W, H, api.t, 1.4);
    },

    levanta(ctx, u, d, api) { tomadaLuta(ctx, api); },
    avanca(ctx, u, d, api) { tomadaLuta(ctx, api); },
    muro(ctx, u, d, api) { tomadaLuta(ctx, api); },
    manda(ctx, u, d, api) { tomadaLuta(ctx, api); },
    naoataca(ctx, u, d, api) { tomadaLuta(ctx, api); },
    ajoelha(ctx, u, d, api) { tomadaLuta(ctx, api); },

    passos(ctx, u, d, api) { tomadaMae(ctx, api); },
    mae(ctx, u, d, api) { tomadaMae(ctx, api); },
    maeq(ctx, u, d, api) { tomadaMae(ctx, api); },

    // CAPA DO REELS/TIKTOK (não entra no vídeo; gerar com motor/quadro.js e roteiros/terra/capa-reels-ep02.json)
    capaReels(ctx, u, d, api) {
      const Lc = [-0.75, 5.6], Gc = [1.0, 8.2];
      const cam = api.orbita({ alvo: [0.1, 1.6, 6.8], raio: 5.0, ang: -0.25, altura: 0.9, f: 1050, ySalvo: 1300 });
      const res = T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...GOLEM, pose: 'punho', opcoes: { brilho: 1 } }, Gc[0], Gc[1], 3.4, { luz: LUZ, olhaPara: Lc, parado: true }) },
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, Lc[0], Lc[1], 1.75, { luz: LUZ, rumo: angDe(Lc, Gc) + 0.55, parado: true }) },
      ], { pulso: 0.7, nucleo: false, luzes: [{ x: Lc[0] + 0.5, y: 1.4, z: Lc[1] + 0.2, cor: '#FFB060', forca: 2.2, raio: 5 }] });
      const rig = res[1];
      if (rig && rig.ultimas) {
        const a = rig.pontoMundo('mao_d', [0, 0.3]), b = rig.pontoMundo('mao_e', [0, 0.3]);
        const ex = Math.max(a.x, b.x) + rig.escalaPx * 0.5, ey = (a.y + b.y) / 2 - 10;
        brilho(ctx, ex, ey, 520, 0.5); Efeitos['poder-terra'](ctx, ex, ey, 170, { t: api.t });
      }
      const g = ctx.createLinearGradient(0, 120, 0, 900);
      g.addColorStop(0, 'rgba(10,6,14,0.8)'); g.addColorStop(0.7, 'rgba(10,6,14,0.35)'); g.addColorStop(1, 'rgba(10,6,14,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
      api.texto('E SE VOCÊ', 540, 330, 104);
      api.texto('ACORDASSE', 540, 450, 126);
      api.texto('CONTROLANDO', 540, 575, 118);
      ctx.save(); ctx.translate(540, 730); ctx.rotate(-0.035); ctx.translate(-540, -730);
      api.texto('A TERRA?', 540, 730, 196, { cor: Estilo.base.mostarda });
      ctx.restore();
      ctx.save(); ctx.translate(540, 1560);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-220, -66, 440, 132, 66); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.font = '900 76px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('PARTE 2', 0, 5);
      ctx.restore();
    },

    // cartela final: PARTE 2 + chamada para a parte 3
    parte(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); zoom(ctx, 540, 960, z);
      const Lc = api.camada();
      const cam = api.orbita({ alvo: [0, 2.0, 9.5], raio: 8.5, ang: -0.3 + u * 0.05, altura: 2.6, f: 950, ySalvo: 1000 });
      T3().cena(Lc.getContext('2d'), api, cam, [], { pulso: 0.4 + 0.3 * Math.sin(api.t * 3.4) });
      api.desfocar(Lc, 16);
      ctx.restore();
      ctx.fillStyle = 'rgba(10,8,16,0.5)'; ctx.fillRect(0, 0, W, H);
      brilho(ctx, 540, 1250, 700, 0.18 + 0.06 * Math.sin(api.t * 4));
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); zoom(ctx, 540, 760, k);
      api.texto('PARTE', 540, 680, 120); api.texto('2', 540, 850, 230, { cor: Estilo.base.mostarda });
      ctx.restore();
      const k2 = api.fase(0.45, 0.8, 'volta');
      ctx.save(); zoom(ctx, 540, 1130, k2);
      api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 3', 540, 1190, 96, { cor: Estilo.base.mostarda });
      ctx.restore();
      const k3 = api.fase(0.9, 1.2, 'volta'), pulsoB = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulsoB, k3 * pulsoB);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

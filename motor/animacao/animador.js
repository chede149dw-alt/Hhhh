// Animador por poses-chave (prompt 4) — puro: não depende do three, roda no navegador e no Node.
//
// criarAnimacao(chaves | { chaves, voos }): cada chave é { t, pose, curva }.
// Padrão ('fluida'): curva contínua que PASSA pelas poses sem frear em cada uma (spline cúbica monotônica:
// sem passar do ponto; só para onde o movimento inverte ou há pausa). Outras curvas valem para o trecho
// que CHEGA naquela chave: linear, suave, entra, sai, sobe, cai, estalo, antecipa. Com `so: ['altura', 'corpo']`
// a curva vale só para esses canais (o resto continua fluido) — ex.: impulso de salto sem travar os braços.
// voos: [{ de, ate, altura, zDe, zAte, xDe, xAte }] — no ar o corpo segue uma parábola de gravidade
// (somada a corpo.y) e anda em velocidade constante no chão (x/z), como um salto de verdade.
// em(t) devolve a pose interpolada no instante t (função só do tempo: determinística).
// em(t, { arrasto: true, vida: true }) soma o arrasto (cabeça, cotovelos e mãos atrasados) e a vida
// (respiração e piscar). final(t) = em(t) com os dois ligados.
// Chaves seguidas com a mesma pose viram pausa (segurar).
//
// Campos da pose (todos opcionais):
//   juntas {nome: [x,y,z] graus} · altura (m) · maos {e,d} · rosto · piscar (0–1)
//   corpo {x, y, z, giro}  — posição no chão (m) e giro (graus) do personagem inteiro
//   quadril [x, y, z]      — deslocamento do quadril (m), para balanço
//   estica                 — amassa e estica (1 = normal; >1 estica para cima)
//   peEAlvo / peDAlvo [x,y,z] — ponto da sola no mundo (IK dos pés)
//   maoEAlvo / maoDAlvo [x,y,z] — ponto do pulso no mundo (IK das mãos)
//   ikPes / ikMaos (0–1)   — peso do IK (0 = só ângulos). pernas: 'fk' é o mesmo que ikPes: 0.

export const CURVAS = {
  linear: (k) => k,
  suave: (k) => k * k * (3 - 2 * k),
  entra: (k) => k * k * k,                       // começa devagar, chega rápido
  sai: (k) => 1 - Math.pow(1 - k, 3),            // sai rápido, chega devagar
  sobe: (k) => 1 - (1 - k) * (1 - k),            // subida de salto (gravidade)
  cai: (k) => k * k,                             // queda (gravidade)
  estalo: (k) => 1 - Math.pow(1 - k, 6),         // quase instantâneo, depois assenta
  antecipa: (k) => { const s = 1.70158; return k * k * ((s + 1) * k - s); }, // recua um pouco antes de ir
};

// interpola qualquer valor da pose: números, listas, objetos; textos trocam na metade.
// Campo que falta numa das poses: usa o valor neutro (junta [0,0,0], corpo 0, quadril 0, altura 0, estica 1,
// piscar 0, pesos de IK 1). Sem valor neutro (alvos de IK, mãos, rosto), segura o valor da outra pose.
const NEUTRO = { altura: 0, estica: 1, piscar: 0, ikPes: 1, ikMaos: 1, quadril: [0, 0, 0], corpo: { x: 0, y: 0, z: 0, giro: 0 } };
const neutroDe = (pai, n) => (pai === 'juntas' ? [0, 0, 0] : pai === 'corpo' ? 0 : pai === '' ? NEUTRO[n] : undefined);
function interp(a, b, k, pai = '', nome = '') {
  if (a === undefined || b === undefined) {
    const neutro = neutroDe(pai, nome);
    if (neutro === undefined) return clone(a === undefined ? b : a);
    if (a === undefined && b === undefined) return undefined;
    a = a === undefined ? neutro : a; b = b === undefined ? neutro : b;
  }
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => interp(v, b[i], k, '#'));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const o = {};
    for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) o[n] = interp(a[n], b[n], k, pai === '' ? n : '#' + n, n);
    return o;
  }
  return k < 0.5 ? a : b;
}
const clone = (v) => (v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v);

function normalizar(p) {
  const o = clone(p) || {};
  if (o.pernas === 'fk') { o.ikPes = 0; delete o.pernas; }
  if (o.pernas === 'ik') { o.ikPes = 1; delete o.pernas; }
  return o;
}

export function misturarPoses(a, b, k) { return interp(normalizar(a), normalizar(b), k); }

// ---------- arrasto e vida ----------
const ARRASTO = { pescoco: 0.03, cabeca: 0.06, cotovelo_e: 0.05, cotovelo_d: 0.05, mao_e: 0.08, mao_d: 0.08 };
const soma = (a = [0, 0, 0], b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const frac = (x) => x - Math.floor(x);
const ruido = (i) => frac(Math.sin(i * 127.1 + 311.7) * 43758.5453);

// piscadas em instantes pseudoaleatórios fixos (a cada 2,6–4,4 s), cada uma com 0,16 s
export function piscar(t, semente = 0) {
  let inicio = 0.8 + ruido(semente) * 1.5;
  for (let i = 0; inicio < t + 0.2 && i < 10000; i++) {
    const d = t - inicio;
    if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
    inicio += 2.6 + ruido(semente + i + 1) * 1.8;
  }
  return 0;
}

export function vida(pose, t, semente = 0) {
  const r = Math.sin((t / 3.6) * Math.PI * 2);           // respiração: um ciclo a cada 3,6 s
  const j = pose.juntas || (pose.juntas = {});
  j.peito = soma(j.peito, [-1.2 * r, 0, 0]);
  j.ombro_e = soma(j.ombro_e, [0, 0, 0.8 * r]);
  j.ombro_d = soma(j.ombro_d, [0, 0, -0.8 * r]);
  j.cabeca = soma(j.cabeca, [0.6 * r, 0, 0]);
  pose.piscar = Math.max(pose.piscar || 0, piscar(t, semente));
  return pose;
}

// ---------- animação ----------
// achata a pose em canais "caminho → valor" (ex.: 'juntas.coxa_e.0', 'corpo.y', 'rosto') e reconstrói
function achatar(v, pre, out) {
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) achatar(v[k], pre ? pre + '.' + k : k, out); return out; }
  out[pre] = v; return out;
}
function montar(plano, listas) {
  const o = {};
  for (const [cam, v] of Object.entries(plano)) {
    if (v === undefined) continue;
    const ps = cam.split('.'); let at = o;
    for (let i = 0; i < ps.length - 1; i++) {
      const caminho = ps.slice(0, i + 1).join('.');
      if (!(ps[i] in at)) at[ps[i]] = listas.has(caminho) ? [] : {};
      at = at[ps[i]];
    }
    at[ps[ps.length - 1]] = v;
  }
  return o;
}
function neutroCanal(cam) {
  const ps = cam.split('.');
  if (ps[0] === 'juntas' || ps[0] === 'corpo' || ps[0] === 'quadril') return 0;
  return NEUTRO[cam];
}

export function criarAnimacao(entrada, opcoes = {}) {
  const lista = Array.isArray(entrada) ? entrada : entrada.chaves;
  const voos = (Array.isArray(entrada) ? opcoes.voos : entrada.voos || opcoes.voos) || [];
  const ks = lista.map((c) => ({ ...c, pose: normalizar(c.pose) })).sort((a, b) => a.t - b.t);
  if (!ks.length) throw new Error('animação sem chaves');
  const inicio = ks[0].t, fim = ks[ks.length - 1].t, n = ks.length;

  // canais de todas as chaves; canal que falta: valor neutro, ou o da chave mais próxima no tempo (alvos, mãos, rosto)
  const planos = ks.map((c) => achatar(c.pose, '', {}));
  const listas = new Set();
  ks.forEach((c) => (function marca(v, pre) {
    if (v && typeof v === 'object') { if (Array.isArray(v)) listas.add(pre); for (const k of Object.keys(v)) marca(v[k], pre ? pre + '.' + k : k); }
  })(c.pose, ''));
  const canais = [...new Set(planos.flatMap((p) => Object.keys(p)))];
  const val = {}, tang = {};
  for (const cam of canais) {
    const neutro = neutroCanal(cam);
    val[cam] = planos.map((p, i) => {
      if (p[cam] !== undefined) return p[cam];
      if (neutro !== undefined) return neutro;
      let melhor, dist = Infinity;
      planos.forEach((q, j) => { if (q[cam] !== undefined && Math.abs(ks[j].t - ks[i].t) < dist) { dist = Math.abs(ks[j].t - ks[i].t); melhor = q[cam]; } });
      return melhor;
    });
    // tangentes monotônicas (Fritsch–Carlson): contínuas, sem passar do ponto, zero nas inversões e pausas
    if (val[cam].every((v) => typeof v === 'number')) {
      const y = val[cam], d = [], m = new Array(n).fill(0);
      for (let i = 0; i < n - 1; i++) d.push(ks[i + 1].t > ks[i].t ? (y[i + 1] - y[i]) / (ks[i + 1].t - ks[i].t) : 0);
      for (let i = 1; i < n - 1; i++) {
        if (d[i - 1] * d[i] <= 0) continue;
        const h0 = ks[i].t - ks[i - 1].t, h1 = ks[i + 1].t - ks[i].t;
        const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
        m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
      }
      tang[cam] = m;
    }
  }

  function bruta(t) {
    const plano = {};
    if (t <= inicio || t >= fim || n === 1) {
      const i = t <= inicio ? 0 : n - 1;
      for (const cam of canais) plano[cam] = val[cam][i];
      return montar(plano, listas);
    }
    let i = 0;
    while (ks[i + 1].t < t) i++;
    const a = ks[i], b = ks[i + 1], h = b.t - a.t;
    const u = h > 0 ? (t - a.t) / h : 1;
    const curvaB = b.curva && b.curva !== 'fluida' ? (CURVAS[b.curva] || CURVAS.suave) : null;
    const kB = curvaB ? curvaB(u) : u;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    for (const cam of canais) {
      const va = val[cam][i], vb = val[cam][i + 1];
      const curva = curvaB && (!b.so || b.so.some((pre) => cam === pre || cam.startsWith(pre + '.'))) ? curvaB : null;
      const k = curva ? kB : u;
      if (tang[cam]) {
        plano[cam] = curva ? va + (vb - va) * k : h00 * va + h10 * h * tang[cam][i] + h01 * vb + h11 * h * tang[cam][i + 1];
      } else plano[cam] = k < 0.5 ? va : vb;
    }
    return montar(plano, listas);
  }

  function voar(p, t) {
    for (const v of voos) {
      if (t < v.de || t > v.ate) continue;
      const u = (t - v.de) / (v.ate - v.de);
      const c = p.corpo || (p.corpo = {});
      c.y = (c.y || 0) + 4 * v.altura * u * (1 - u);
      if (v.zDe !== undefined) c.z = v.zDe + (v.zAte - v.zDe) * u;
      if (v.xDe !== undefined) c.x = v.xDe + (v.xAte - v.xDe) * u;
    }
    return p;
  }

  function em(t, o = {}) {
    const p = voar(bruta(t), t);
    if (o.arrasto) {
      const j = p.juntas || (p.juntas = {});
      for (const [nome, atraso] of Object.entries(ARRASTO)) {
        const atrasada = bruta(t - atraso).juntas || {};
        j[nome] = atrasada[nome] || [0, 0, 0];
      }
    }
    if (o.vida) vida(p, t, opcoes.semente || 0);
    return p;
  }

  return { chaves: ks, voos, inicio, fim, duracao: fim - inicio, em, final: (t) => em(t, { arrasto: true, vida: true }) };
}

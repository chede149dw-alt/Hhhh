// Animador por poses-chave (prompt 4) — puro: não depende do three, roda no navegador e no Node.
//
// criarAnimacao(chaves): cada chave é { t, pose, curva }. A curva diz como se CHEGA naquela chave.
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
export function criarAnimacao(chaves, opcoes = {}) {
  const ks = chaves.map((c) => ({ ...c, pose: normalizar(c.pose) })).sort((a, b) => a.t - b.t);
  if (!ks.length) throw new Error('animação sem chaves');
  const inicio = ks[0].t, fim = ks[ks.length - 1].t;

  function bruta(t) {
    if (t <= inicio) return clone(ks[0].pose);
    if (t >= fim) return clone(ks[ks.length - 1].pose);
    let i = 0;
    while (ks[i + 1].t < t) i++;
    const a = ks[i], b = ks[i + 1];
    if (b.t === a.t) return clone(b.pose);
    const k = (t - a.t) / (b.t - a.t);
    const curva = CURVAS[b.curva || 'suave'] || CURVAS.suave;
    return interp(a.pose, b.pose, curva(k));
  }

  function em(t, o = {}) {
    const p = bruta(t);
    if (o.arrasto) {
      const j = p.juntas || (p.juntas = {});
      for (const [n, atraso] of Object.entries(ARRASTO)) {
        const atrasada = bruta(t - atraso).juntas || {};
        j[n] = atrasada[n] || [0, 0, 0];
      }
    }
    if (o.vida) vida(p, t, opcoes.semente || 0);
    return p;
  }

  return { chaves: ks, inicio, fim, duracao: fim - inicio, em, final: (t) => em(t, { arrasto: true, vida: true }) };
}

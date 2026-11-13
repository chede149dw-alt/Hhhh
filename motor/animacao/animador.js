// Animador por poses-chave. Puro: roda no navegador e no Node.
//   const anim = criarAnimacao(chaves, { medidas })      chave = { t, pose?, curva?, peDAlvo?, peEAlvo?, maoDAlvo?, maoEAlvo?, pernas? }
//   anim.em(t)               → pose final (interpolação + arrasto + vida + IK)
//   anim.em(t, { puro: true }) → só a interpolação entre chaves
//   aplicar(boneco, pose)
// Regras:
// - A curva de uma chave diz como se CHEGA nela a partir da anterior (padrão 'suave').
// - Chave sem pose (ou pose: 'pausa') repete a pose anterior: vira pausa.
// - Alvos de IK (pontos no mundo, em metros) valem da chave em diante até mudar; null solta o membro.
//   pernas: 'fk' solta os dois pés (no ar, sentado). Entre alvo e "solto", os ângulos se misturam.
// - Pé que muda de lugar entre duas chaves faz um arco (passo) automático.
import { misturar, valor, validarPose } from './poses.js';
import { resolver, MEMBROS_IK, juntasDoMembro } from './ik.js';
import { lerp3 } from './mat.js';

const backC = 1.70158;
export const CURVAS = {
  linear: (k) => k,
  suave: (k) => k * k * (3 - 2 * k),
  entra: (k) => k * k * k,                                    // começa devagar, acelera
  sai: (k) => 1 - (1 - k) ** 3,                                // começa rápido, freia
  estalo: (k) => 1 - (1 - k) ** 5,                             // chega quase na hora
  antecipa: (k) => k * k * ((backC + 1) * k - backC),          // recua um pouco antes de ir
  passa: (k) => 1 + (backC + 1) * (k - 1) ** 3 + backC * (k - 1) ** 2, // passa do ponto e volta
  degrau: (k) => (k < 1 ? 0 : 1),                              // segura e troca na chave
};

export const ARRASTO = { pescoco: 0.03, cabeca: 0.06, cotoveloD: 0.05, cotoveloE: 0.05, maoD: 0.09, maoE: 0.09 };
const ALVOS = { peD: 'peDAlvo', peE: 'peEAlvo', maoD: 'maoDAlvo', maoE: 'maoEAlvo' };

function rng(semente) {   // mulberry32
  let a = semente >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function criarAnimacao(chavesIn, { medidas = null, arrasto = true, vida = true, semente = 7, respiracao = 1 } = {}) {
  if (!Array.isArray(chavesIn) || chavesIn.length === 0) throw new Error('Animação sem chaves');
  const chaves = [];
  let anterior = null;
  for (const [i, c] of chavesIn.entries()) {
    if (typeof c.t !== 'number') throw new Error(`Chave ${i} sem tempo t`);
    if (anterior && c.t <= anterior.t) throw new Error(`Chaves fora de ordem: chave ${i} (t=${c.t}) não é posterior a t=${anterior.t}`);
    const curva = c.curva || 'suave';
    if (!CURVAS[curva]) throw new Error(`Curva "${curva}" não existe. Existentes: ${Object.keys(CURVAS).join(', ')}`);
    const semPose = c.pose === undefined || c.pose === 'pausa';
    if (semPose && !anterior) throw new Error('A primeira chave precisa de pose');
    const n = { t: c.t, curva, pose: semPose ? anterior.pose : validarPose(c.pose) };
    for (const [k, campo] of Object.entries(ALVOS)) n[k] = campo in c ? c[campo] : (anterior ? anterior[k] : null);
    if (c.pernas === 'fk') n.peD = n.peE = null;
    for (const k of MEMBROS_IK) if (n[k] && !medidas) throw new Error('Alvos de IK precisam de { medidas } (boneco.medidas)');
    chaves.push(n); anterior = n;
  }
  const duracao = chaves[chaves.length - 1].t;

  function segmento(t) {
    if (t <= chaves[0].t) return { a: chaves[0], b: chaves[0], k: 0, e: 0 };
    for (let i = 0; i < chaves.length - 1; i++) {
      const a = chaves[i], b = chaves[i + 1];
      if (t <= b.t) { const k = (t - a.t) / (b.t - a.t); return { a, b, k, e: CURVAS[b.curva](k) }; }
    }
    const u = chaves[chaves.length - 1];
    return { a: u, b: u, k: 1, e: 1 };
  }
  const interp = (t) => { const s = segmento(t); return s.a === s.b ? s.a.pose : misturar(s.a.pose, s.b.pose, s.e); };

  // Piscadas: instantes determinísticos a partir da semente.
  const piscadas = [];
  { const r = rng(semente); let tp = 0.6 + r() * 1.5; while (tp < duracao + 30) { piscadas.push(tp); tp += 2.4 + r() * 2.6; } }
  const fechamento = (t) => {   // 0 = aberto, 1 = fechado (fecha 0,06 s, fica 0,04 s, abre 0,09 s)
    for (const p of piscadas) {
      const d = t - p;
      if (d < 0) break;
      if (d < 0.06) return d / 0.06;
      if (d < 0.10) return 1;
      if (d < 0.19) return 1 - (d - 0.10) / 0.09;
    }
    return 0;
  };

  function em(t, { puro = false } = {}) {
    let pose = interp(t);
    if (puro) return pose;
    pose = { ...pose };
    if (arrasto) for (const [j, d] of Object.entries(ARRASTO)) { const atr = interp(t - d)[j]; if (atr) pose[j] = atr; else delete pose[j]; }
    if (vida) {
      const w = (2 * Math.PI) / 3.8, s = Math.sin(w * t) * respiracao;
      const soma = (g, c, v) => { pose[g] = { ...pose[g], [c]: valor(pose, g, c) + v }; };
      soma('peito', 'frente', -1.6 * s); soma('coluna', 'frente', -0.5 * s); soma('cabeca', 'frente', 1.2 * s);
      soma('ombroD', 'abre', 0.7 * Math.sin(w * t - 0.5) * respiracao); soma('ombroE', 'abre', 0.7 * Math.sin(w * t - 0.5) * respiracao);
      if (valor(pose, 'rosto', 'estranho') < 0.3) {    // infiltrado não pisca
        const f = fechamento(t);
        if (f > 0) pose.rosto = { ...pose.rosto, olhos: valor(pose, 'rosto', 'olhos') * (1 - f) };
      }
    }
    if (medidas) {
      const s = segmento(t), ec = Math.min(1, Math.max(0, s.e));
      const fkPose = pose;
      for (const mb of MEMBROS_IK) {
        const A = s.a[mb], B = s.b[mb];
        if (!A && !B) continue;
        if (A && B) {
          let alvo = lerp3(A, B, ec);
          if (mb.startsWith('pe')) {   // arco do passo
            const dist = Math.hypot(B[0] - A[0], B[2] - A[2]);
            if (dist > 0.01) alvo = [alvo[0], alvo[1] + Math.min(0.1, dist * 0.4) * Math.sin(Math.PI * ec), alvo[2]];
          }
          pose = resolver(pose, medidas, mb, alvo);
        } else {
          const ik = resolver(pose, medidas, mb, A || B);
          const [de, para, k] = A ? [ik, fkPose, ec] : [fkPose, ik, ec];
          pose = { ...pose };
          for (const j of juntasDoMembro(mb)) {
            const mix = misturar({ [j]: de[j] || {} }, { [j]: para[j] || {} }, k);
            pose[j] = mix[j];
          }
        }
      }
    }
    return pose;
  }

  return { chaves, duracao, em, piscadas };
}

export const aplicar = (boneco, pose) => boneco.posar(pose);

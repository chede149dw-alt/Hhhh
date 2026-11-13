// Poses: puro (sem three), roda no navegador e no Node.
// Uma POSE é um objeto plano:
//   { <junta>: { <canal>: graus, ... }, corpo: {x,y,z,giro}, desl: {x,y,z}, rosto: {...} }
// Canais anatômicos: o lado esquerdo usa os MESMOS números do direito (o espelhamento é automático).
//   tronco (quadril, coluna, peito, pescoco, cabeca): frente (curvar p/ frente), lado (inclinar p/ a direita dele), giro (virar p/ a esquerda dele)
//   ombro / coxa: frente (levar p/ frente), abre (afastar do corpo), giro (rotação no eixo do osso)
//   cotovelo / joelho: dobra
//   mao: dobra, lado, giro, fecha (dedos 0 = abertos, 90 = punho), indicador (padrão = fecha)
//   pe: dobra (ponta p/ cima), lado
// corpo: posição (m), giro (graus) e estica (amassa < 0 < estica, volume constante) do boneco inteiro. desl: deslocamento do quadril (m), p/ sentar, agachar.
// rosto: boca ('neutra'|'sorriso'|'triste'|'aberta'), olhos (abertura, 1 = normal), sobrancelha (-1 brava .. 1 preocupada),
//        olharX, olharY (-1..1), estranho (0..1: olhos negros, boca larga — o infiltrado),
//        abertura (0..1: boca abrindo ao falar; sobrepõe a forma da boca).

export const TIPOS = {
  quadril: 'tronco', coluna: 'tronco', peito: 'tronco', pescoco: 'tronco', cabeca: 'tronco',
  ombroD: 'ombro', cotoveloD: 'cotovelo', maoD: 'mao', ombroE: 'ombro', cotoveloE: 'cotovelo', maoE: 'mao',
  coxaD: 'coxa', joelhoD: 'joelho', peD: 'pe', coxaE: 'coxa', joelhoE: 'joelho', peE: 'pe',
};
export const JUNTAS = Object.keys(TIPOS);
export const CANAIS = {
  tronco: ['frente', 'lado', 'giro'], ombro: ['frente', 'abre', 'giro'], cotovelo: ['dobra'],
  mao: ['dobra', 'lado', 'giro', 'fecha', 'indicador'], coxa: ['frente', 'abre', 'giro'], joelho: ['dobra'],
  pe: ['dobra', 'lado'],
};
export const BOCAS = ['neutra', 'sorriso', 'triste', 'aberta'];
const EXTRAS = {
  corpo: { x: 0, y: 0, z: 0, giro: 0, estica: 0 },
  desl: { x: 0, y: 0, z: 0 },
  rosto: { boca: 'neutra', olhos: 1, sobrancelha: 0, olharX: 0, olharY: 0, estranho: 0, abertura: 0 },
};
export const GRUPOS = [...JUNTAS, ...Object.keys(EXTRAS)];

function canaisDe(grupo) {
  if (EXTRAS[grupo]) return Object.keys(EXTRAS[grupo]);
  const t = TIPOS[grupo];
  if (!t) throw new Error(`Junta "${grupo}" não existe. Existentes: ${GRUPOS.join(', ')}`);
  return CANAIS[t];
}

// Valor de um canal, com padrão (0, ou o padrão dos extras; indicador herda fecha).
export function valor(pose, grupo, canal) {
  const v = pose?.[grupo]?.[canal];
  if (v !== undefined) return v;
  if (grupo.startsWith('mao') && canal === 'indicador') return valor(pose, grupo, 'fecha');
  return EXTRAS[grupo]?.[canal] ?? 0;
}

export function validarPose(pose) {
  for (const [g, canais] of Object.entries(pose)) {
    const ok = canaisDe(g);
    for (const [c, v] of Object.entries(canais)) {
      if (!ok.includes(c)) throw new Error(`Canal "${c}" não existe em "${g}". Existentes: ${ok.join(', ')}`);
      if (g === 'rosto' && c === 'boca') { if (!BOCAS.includes(v)) throw new Error(`Boca "${v}" não existe. Existentes: ${BOCAS.join(', ')}`); }
      else if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${g}.${c} deve ser número (veio ${v})`);
    }
  }
  return pose;
}

// Pose nova = base + modificações (só os canais citados mudam).
export function derivar(base, mods) {
  const r = {};
  for (const g of new Set([...Object.keys(base), ...Object.keys(mods)])) r[g] = { ...base[g], ...mods[g] };
  return validarPose(r);
}

// Mistura a e b (k = 0 → a, k = 1 → b). Números interpolam; boca troca na metade.
export function misturar(a, b, k) {
  const r = {};
  for (const g of new Set([...Object.keys(a), ...Object.keys(b)])) {
    r[g] = {};
    const canais = new Set([...Object.keys(a[g] || {}), ...Object.keys(b[g] || {})]);
    if (g.startsWith('mao') && canais.has('fecha')) canais.add('indicador');
    for (const c of canais) {
      const va = valor(a, g, c), vb = valor(b, g, c);
      r[g][c] = typeof va === 'number' ? va + (vb - va) * k : (k < 0.5 ? va : vb);
    }
  }
  return r;
}

export const REPOUSO = validarPose({
  ombroD: { abre: 6 }, ombroE: { abre: 6 },
  cotoveloD: { dobra: 10 }, cotoveloE: { dobra: 10 },
  maoD: { fecha: 25 }, maoE: { fecha: 25 },
  coxaD: { abre: 2 }, coxaE: { abre: 2 },
  rosto: { boca: 'neutra', olhos: 1 },
});

export const POSES = {
  repouso: REPOUSO,
  acenar: derivar(REPOUSO, {
    ombroD: { abre: 80, giro: 90, frente: 10 }, cotoveloD: { dobra: 95 }, maoD: { fecha: 0, lado: -10 },
    cabeca: { lado: 8, giro: 5 }, peito: { lado: -4 },
    rosto: { boca: 'sorriso', sobrancelha: 0.3 },
  }),
  apontar: derivar(REPOUSO, {
    ombroD: { frente: 85, abre: 5 }, cotoveloD: { dobra: 5 }, maoD: { fecha: 90, indicador: 0 },
    peito: { giro: 12 }, cabeca: { giro: -8 },
    rosto: { boca: 'neutra', sobrancelha: -0.5 },
  }),
  sentar: derivar(REPOUSO, {
    coxaD: { frente: 88, abre: 6 }, coxaE: { frente: 88, abre: 6 },
    joelhoD: { dobra: 88 }, joelhoE: { dobra: 88 },
    ombroD: { frente: 32, abre: 8 }, ombroE: { frente: 32, abre: 8 },
    cotoveloD: { dobra: 45 }, cotoveloE: { dobra: 45 },
    coluna: { frente: 4 }, cabeca: { frente: 4 },
    desl: { y: -0.32 },
  }),
  assustado: derivar(REPOUSO, {
    coluna: { frente: -8 }, peito: { frente: -6 }, cabeca: { frente: -10 },
    ombroD: { frente: 45, abre: 25 }, ombroE: { frente: 45, abre: 25 },
    cotoveloD: { dobra: 115 }, cotoveloE: { dobra: 115 },
    maoD: { fecha: 0, dobra: -40 }, maoE: { fecha: 0, dobra: -40 },
    coxaD: { frente: 12, abre: 8 }, coxaE: { frente: -10, abre: 8 },
    joelhoD: { dobra: 22 }, joelhoE: { dobra: 12 },
    desl: { y: -0.05, z: -0.04 },
    rosto: { boca: 'aberta', olhos: 1.35, sobrancelha: 1 },
  }),
};

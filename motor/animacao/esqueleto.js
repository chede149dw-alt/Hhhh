// Esqueleto puro: hierarquia, posições das juntas, canais → ângulos e cinemática direta (FK).
// É a ÚNICA fonte da geometria das juntas: boneco.js (three) usa estas mesmas tabelas.
// Coordenadas "locais" = espaço da raiz do boneco (sem giro/estica do corpo). "Mundo" = cena.
import { TIPOS, JUNTAS, valor } from './poses.js';
import { eulerXZY, mul, mv, add, ry, tr, sub, I } from './mat.js';

const D = Math.PI / 180;

// Canal anatômico → [eixo, sinal] para o lado DIREITO. O esquerdo espelha y e z.
export const EIXOS = {
  tronco: { frente: ['x', 1], lado: ['z', 1], giro: ['y', 1] },
  ombro: { frente: ['x', -1], abre: ['z', -1], giro: ['y', -1] },
  cotovelo: { dobra: ['x', -1] },
  mao: { dobra: ['x', -1], lado: ['z', -1], giro: ['y', -1] },
  coxa: { frente: ['x', -1], abre: ['z', -1], giro: ['y', -1] },
  joelho: { dobra: ['x', 1] },
  pe: { dobra: ['x', -1], lado: ['z', -1] },
};

export const PAI = {
  quadril: null, coluna: 'quadril', peito: 'coluna', pescoco: 'peito', cabeca: 'pescoco',
  ombroD: 'peito', cotoveloD: 'ombroD', maoD: 'cotoveloD', ombroE: 'peito', cotoveloE: 'ombroE', maoE: 'cotoveloE',
  coxaD: 'quadril', joelhoD: 'coxaD', peD: 'joelhoD', coxaE: 'quadril', joelhoE: 'coxaE', peE: 'joelhoE',
};

// Posição de cada junta no espaço do pai (o quadril é relativo à raiz, sem o deslocamento da pose).
export function posicoes(m) {
  const p = {
    quadril: [0, m.pernaComp, 0], coluna: [0, 0.02 * m.H, 0], peito: [0, m.colunaH, 0],
    pescoco: [0, m.peitoH, 0], cabeca: [0, m.pescocoH, 0],
  };
  for (const [l, s] of [['D', -1], ['E', 1]]) {
    p['ombro' + l] = [s * m.ombros / 2, m.peitoH - m.bracoL * 0.55, 0];
    p['cotovelo' + l] = [0, -m.bracoLen, 0];
    p['mao' + l] = [0, -m.anteLen, 0];
    p['coxa' + l] = [s * m.pernasDist / 2, 0, 0];
    p['joelho' + l] = [0, -m.coxaLen, 0];
    p['pe' + l] = [0, -m.canelaLen, 0];
  }
  return p;
}
export const SOLA = (m) => [0, -m.peAlt, 0];   // ponto da sola, no espaço do pé

const esquerdo = (nome) => nome.endsWith('E') && TIPOS[nome] !== 'tronco';

// Ângulos reais (radianos) da junta, na ordem [x, y, z].
export function angulos(pose, nome) {
  const r = { x: 0, y: 0, z: 0 };
  for (const [canal, [eixo, sinal]] of Object.entries(EIXOS[TIPOS[nome]])) {
    const esp = esquerdo(nome) && eixo !== 'x' ? -1 : 1;
    r[eixo] += valor(pose, nome, canal) * sinal * esp * D;
  }
  return [r.x, r.y, r.z];
}

// Inverso: ângulos reais {x,y,z} (rad) → canais em graus (só os eixos que a junta tem).
export function paraCanais(nome, ang) {
  const out = {};
  for (const [canal, [eixo, sinal]] of Object.entries(EIXOS[TIPOS[nome]])) {
    if (ang[eixo] === undefined) continue;
    const esp = esquerdo(nome) && eixo !== 'x' ? -1 : 1;
    out[canal] = ang[eixo] / (sinal * esp) / D;
  }
  return out;
}

export const rotLocal = (pose, nome) => { const [x, y, z] = angulos(pose, nome); return eulerXZY(x, y, z); };

// FK no espaço local da raiz: { R: rotação no espaço da raiz, P: posição }.
export function fk(pose, m) {
  const pos = posicoes(m), R = {}, P = {};
  for (const j of JUNTAS) {
    const pai = PAI[j];
    let off = pos[j];
    if (j === 'quadril') off = add(off, [valor(pose, 'desl', 'x'), valor(pose, 'desl', 'y'), valor(pose, 'desl', 'z')]);
    const Rp = pai ? R[pai] : I, Pp = pai ? P[pai] : [0, 0, 0];
    P[j] = add(Pp, mv(Rp, off));
    R[j] = mul(Rp, rotLocal(pose, j));
  }
  return { R, P };
}

// Transformação da raiz: posição, giro e estica (escala com volume constante).
export function raiz(pose) {
  const e = 1 + valor(pose, 'corpo', 'estica');
  return {
    pos: [valor(pose, 'corpo', 'x'), valor(pose, 'corpo', 'y'), valor(pose, 'corpo', 'z')],
    R: ry(valor(pose, 'corpo', 'giro') * D),
    esc: [1 / Math.sqrt(e), e, 1 / Math.sqrt(e)],
  };
}
export function paraMundo(pose, p) {
  const r = raiz(pose);
  return add(r.pos, mv(r.R, [p[0] * r.esc[0], p[1] * r.esc[1], p[2] * r.esc[2]]));
}
export function paraLocal(pose, p) {
  const r = raiz(pose), q = mv(tr(r.R), sub(p, r.pos));
  return [q[0] / r.esc[0], q[1] / r.esc[1], q[2] / r.esc[2]];
}

// Pontos usados pelo IK, no mundo: sola de cada pé e pulso de cada mão.
export function pontos(pose, m) {
  const f = fk(pose, m), sola = SOLA(m), r = {};
  for (const l of ['D', 'E']) {
    r['pe' + l] = paraMundo(pose, add(f.P['pe' + l], mv(f.R['pe' + l], sola)));
    r['mao' + l] = paraMundo(pose, f.P['mao' + l]);
  }
  return r;
}

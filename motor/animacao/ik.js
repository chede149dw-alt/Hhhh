// IK analítico de 2 ossos para pernas (alvo = ponto da sola) e braços (alvo = pulso). Puro.
// A direção do joelho/cotovelo vem de um "polo" (joelho p/ frente; cotovelo p/ trás, baixo e fora),
// girado em torno do eixo do membro pelo canal "giro" da coxa/ombro da pose.
// O osso de cima recebe os 3 ângulos (decompostos em Euler XZY); o do meio só dobra.
import { fk, posicoes, paraLocal, angulos, paraCanais, rotLocal } from './esqueleto.js';
import { mul, mv, tr, add, sub, len, esc } from './mat.js';

const MEMBROS = {
  peD: { raiz: 'coxaD', meio: 'joelhoD', fim: 'peD', perna: true, fora: -1 },
  peE: { raiz: 'coxaE', meio: 'joelhoE', fim: 'peE', perna: true, fora: 1 },
  maoD: { raiz: 'ombroD', meio: 'cotoveloD', fim: 'maoD', perna: false, fora: -1 },
  maoE: { raiz: 'ombroE', meio: 'cotoveloE', fim: 'maoE', perna: false, fora: 1 },
};
export const MEMBROS_IK = Object.keys(MEMBROS);
export const juntasDoMembro = (k) => { const b = MEMBROS[k]; return b.perna ? [b.raiz, b.meio, b.fim] : [b.raiz, b.meio]; };

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => esc(a, 1 / len(a));
const perp = (v, eixo) => sub(v, esc(eixo, dot(v, eixo)));             // componente de v perpendicular ao eixo
const girar = (v, k, a) => {                                           // Rodrigues: gira v em torno do eixo unitário k
  const c = Math.cos(a), s = Math.sin(a);
  return add(add(esc(v, c), esc(cross(k, v), s)), esc(k, dot(k, v) * (1 - c)));
};
const clamp = (x) => Math.min(1, Math.max(-1, x));

// Matriz (linha a linha) → Euler XZY do three (mesma fórmula de Euler.setFromRotationMatrix).
function eulerXZYde(R) {
  const z = Math.asin(-clamp(R[1]));
  if (Math.abs(R[1]) < 0.9999999) return { x: Math.atan2(R[7], R[4]), y: Math.atan2(R[2], R[0]), z };
  return { x: Math.atan2(-R[5], R[8]), y: 0, z };
}

// Devolve uma cópia da pose com o membro resolvido para o alvo (mundo).
// _alcancou[membro] = false se o alvo estava fora de alcance (o membro estica na direção dele).
export function resolver(pose, m, membro, alvoMundo) {
  const b = MEMBROS[membro];
  if (!b) throw new Error(`Membro "${membro}" não existe. Existentes: ${MEMBROS_IK.join(', ')}`);
  const f = fk(pose, m), pos = posicoes(m);
  const pai = b.perna ? 'quadril' : 'peito';
  const Rp = f.R[pai];
  const base = add(f.P[pai], mv(Rp, pos[b.raiz]));
  let alvo = paraLocal(pose, alvoMundo);
  if (b.perna) alvo = add(alvo, [0, m.peAlt, 0]);           // pé plano: tornozelo fica acima da sola
  const d = mv(tr(Rp), sub(alvo, base));                     // no espaço do pai
  const L1 = b.perna ? m.coxaLen : m.bracoLen, L2 = b.perna ? m.canelaLen : m.anteLen;
  const rr = len(d), rmin = Math.abs(L1 - L2) + 1e-9, rmax = L1 + L2;
  const alcancou = rr >= rmin && rr <= rmax + 1e-9;
  const r = Math.min(rmax, Math.max(rmin, rr));
  const a = rr > 1e-12 ? esc(d, 1 / rr) : [0, -1, 0];        // eixo do membro
  const phi = Math.acos(clamp((r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2)));
  const th1 = Math.acos(clamp((L1 * L1 + r * r - L2 * L2) / (2 * L1 * r)));

  // polo → direção para onde a junta do meio se projeta
  let polo = b.perna ? [0, 0, 1] : [b.fora * 0.4, -0.6, -1];
  polo = girar(norm(polo), a, angulos(pose, b.raiz)[1]);
  let c = perp(polo, a);
  if (len(c) < 1e-6) c = perp(b.perna ? [0, 1, 0] : [0, -1, 0], a);
  c = norm(c);
  const u1 = add(esc(a, Math.cos(th1)), esc(c, Math.sin(th1)));          // direção do osso de cima
  let z = norm(perp(c, u1));                                              // frente do osso
  if (!b.perna) z = esc(z, -1);
  const y = esc(u1, -1), x = cross(y, z);
  const Rc = [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
  const ang = eulerXZYde(Rc);

  const out = { ...pose };
  out[b.raiz] = { ...pose[b.raiz], ...paraCanais(b.raiz, ang) };
  out[b.meio] = { ...pose[b.meio], ...paraCanais(b.meio, { x: b.perna ? phi : -phi }) };
  if (b.perna) {   // pé plano: eixo y do pé alinhado com o "para cima" da raiz
    const Rpai = mul(Rp, mul(rotLocal(out, b.raiz), rotLocal(out, b.meio)));
    const u = mv(tr(Rpai), [0, 1, 0]);
    const bz = Math.asin(clamp(-u[0])), ax = Math.atan2(u[2], u[1]);
    out[b.fim] = { ...pose[b.fim], ...paraCanais(b.fim, { x: ax, z: bz }) };
  }
  Object.defineProperty(out, '_alcancou', { value: { ...(pose._alcancou || {}), [membro]: alcancou }, enumerable: false });
  return out;
}

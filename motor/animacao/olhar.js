// "Olhar para": vira peito (se preciso), pescoço e cabeça para que o olhar aponte para um ponto do mundo.
// Puro. A cabeça é resolvida de forma exata (com 3 iterações por causa do deslocamento dos olhos).
import { fk, raiz } from './esqueleto.js';
import { valor } from './poses.js';
import { mul, mv, tr, add, sub, len } from './mat.js';

const G = 180 / Math.PI;
const norm = (v) => { const l = len(v); return [v[0] / l, v[1] / l, v[2] / l]; };
export const OLHO = (m) => [0, m.cabecaH * 0.52, m.cabecaP * 0.3];   // olhos no espaço da cabeça

// Olho e direção do olhar no mundo (sem estica, que só achata o corpo).
export function olharAtual(pose, m) {
  const f = fk(pose, m), rz = raiz(pose);
  const Rh = mul(rz.R, f.R.cabeca);
  const olho = add(rz.pos, mv(rz.R, add(f.P.cabeca, mv(f.R.cabeca, OLHO(m)))));
  return { olho, frente: mv(Rh, [0, 0, 1]), Rpescoco: mul(rz.R, f.R.pescoco), Rpeito: mul(rz.R, f.R.peito) };
}

// Ângulos (rad) de uma junta tronco (R = Rx(a)·Rz(c)·Ry(b)) para levar +z até f, com o "lado" c fixo.
function anguloPara(f, c) {
  const sb = Math.max(-1, Math.min(1, f[0] / Math.cos(c)));
  const b = Math.asin(sb), y0 = sb * Math.sin(c), z0 = Math.cos(b);
  const a = Math.atan2(f[2], f[1]) - Math.atan2(z0, y0);
  return { b, a: Math.atan2(Math.sin(a), Math.cos(a)) };
}

export function olharPara(pose, m, alvo, { usarPeito = true } = {}) {
  let p = { ...pose, peito: { ...pose.peito }, pescoco: { ...pose.pescoco }, cabeca: { ...pose.cabeca } };
  // 1) distribuição grossa: quanto virar no total, visto do peito
  const o0 = olharAtual(p, m), d0 = mv(tr(o0.Rpeito), norm(sub(alvo, o0.olho)));
  const yaw = Math.atan2(d0[0], d0[2]) * G, pitch = Math.atan2(-d0[1], Math.hypot(d0[0], d0[2])) * G;
  if (usarPeito && Math.abs(yaw) > 45) p.peito.giro = valor(pose, 'peito', 'giro') + (Math.abs(yaw) - 45) * Math.sign(yaw) * 0.6;
  // o pescoço leva o giro (para os lados); a cabeça leva o "para baixo/para cima". Assim, mesmo virando
  // muito, inclinar a cabeça continua sendo inclinar (e não rolar o horizonte).
  const yawPeito = usarPeito && Math.abs(yaw) > 45 ? (Math.abs(yaw) - 45) * Math.sign(yaw) * 0.6 : 0;
  p.pescoco.giro = valor(pose, 'pescoco', 'giro') + (yaw - yawPeito) * 0.92;
  // 2) cabeça exata, iterando porque os olhos não ficam no pivô
  for (let i = 0; i < 4; i++) {
    const o = olharAtual(p, m);
    const f = mv(tr(o.Rpescoco), norm(sub(alvo, o.olho)));
    const c = valor(p, 'cabeca', 'lado') / G;
    const { a, b } = anguloPara(f, c);
    p.cabeca.giro = b * G; p.cabeca.frente = a * G;
  }
  return p;
}

export function erroDoOlhar(pose, m, alvo) {   // graus entre o olhar e a direção do alvo
  const o = olharAtual(pose, m), d = norm(sub(alvo, o.olho)), f = norm(o.frente);
  return Math.acos(Math.max(-1, Math.min(1, d[0] * f[0] + d[1] * f[1] + d[2] * f[2]))) * G;
}

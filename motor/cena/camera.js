// Câmera por tamanho de plano (prompt 6) + linguagem das referências (refs 03, 04, 05).
// Funções puras do tempo: mesmo t → mesma câmera.
//
// enquadrar(tamanho, ancora, o) → { pos, alvo, fov, distancia }
//   tamanho: 'geral' (corpo inteiro com folga), 'medio' (da cintura para cima), 'close' (cabeça e ombros),
//            'detalhe' (mão, objeto: 0,3 m de quadro)
//   ancora: { pes:[x,y,z], cabeca:[x,y,z], giro }  (personagem)  ou  { centro:[x,y,z], giro }  (objeto)
//   o: { lado (graus em volta; 0 = de frente), angulo (graus na vertical: + de cima, − de baixo, 90 = zenital),
//        elevacao (m, antigo), areaLivre, escalaDist, alturaQuadro }
// O tamanho vira altura de quadro e lente; a distância sai de  d = (altura/2) / tan(fov/2).
// Se a câmera sairia da área livre do cenário, ela chega mais perto e abre a lente (enquadramento igual).
//
// camNoTempo(plano, ancoras, u, dur, areaLivre) → { pos, alvo, fov, distancia, rolagem, cima, foco }
//   ancoras: ancora do personagem, ou { personagem, objeto } quando o plano olha para um objeto
//   plano: {
//     tamanho, lado, angulo, elevacao,
//     alvo: 'personagem' | 'objeto'                    — quem a câmera segue
//     movimento: { tipo: 'parado'|'empurrar'|'puxar'|'lateral'|'orbita'|'subir'|'descer', forca, graus, metros }
//     deriva: 0..1 (padrão 1)                          — flutuação lenta: nada fica parado
//     rolagem: graus (inclinação do quadro), giroRolagem: graus/s (zenital girando)
//     reenquadres: [{ t, dx, dy, zoom, dur }]          — pequeno ajuste de câmera (reação em 3 tempos)
//     tremores: [{ t, forca, dur }]
//     primeiroPlano: { distancia }                     — objeto grande na frente da lente, personagem atrás
//   }

export const TAMANHOS = {
  geral: { altura: 2.5, fov: 34, centro: 'corpo', angulo: 14 },
  medio: { altura: 1.0, fov: 28, centro: 'peito', angulo: 3 },
  close: { altura: 0.5, fov: 22, centro: 'rosto', angulo: 2 },
  detalhe: { altura: 0.3, fov: 26, centro: 'objeto', angulo: 10 },
};

const R = (g) => (g * Math.PI) / 180;
const suave = (k) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const soma = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norma = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const n = norma(a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export function distanciaPara(alturaQuadro, fov) { return alturaQuadro / 2 / Math.tan(R(fov) / 2); }
export function fovPara(alturaQuadro, distancia) { return (2 * Math.atan(alturaQuadro / 2 / distancia) * 180) / Math.PI; }

function centroDe(tam, ancora) {
  if (ancora.centro) return [...ancora.centro];
  const [px, py, pz] = ancora.pes, [cx, cy, cz] = ancora.cabeca;
  if (tam.centro === 'corpo') return [(px + cx) / 2, py + (cy - py) * 0.52, (pz + cz) / 2];
  if (tam.centro === 'peito') return [cx, cy - 0.3, cz];
  return [cx, cy - 0.01, cz];
}

// mantém a câmera dentro do círculo livre: devolve a maior distância ao alvo que cabe
function limitar(alvo, dir, d, area) {
  if (!area) return d;
  const [cx, cz] = area.centro, r = area.raio;
  const ox = alvo[0] - cx, oz = alvo[2] - cz, dx = dir[0], dz = dir[2];
  const a = dx * dx + dz * dz, b = 2 * (ox * dx + oz * dz), c = ox * ox + oz * oz - r * r;
  if (a < 1e-9) return d;                                   // câmera bem em cima (zenital): não sai do círculo
  const disc = b * b - 4 * a * c;
  if (disc < 0) return Math.min(d, 0.3);
  const dMax = (-b + Math.sqrt(disc)) / (2 * a);
  return Math.max(0.25, Math.min(d, dMax));
}

export function enquadrar(tamanho, ancora, o = {}) {
  const tam = TAMANHOS[tamanho] || TAMANHOS.medio;
  const alvo = centroDe(tam, ancora);
  const altura = (o.alturaQuadro || tam.altura) * (o.escalaDist || 1);
  const ang = R((ancora.giro || 0) + (o.lado === undefined ? 25 : o.lado));
  let d = distanciaPara(o.alturaQuadro || tam.altura, tam.fov) * (o.escalaDist || 1);
  let dir;
  if (o.angulo !== undefined || o.elevacao === undefined) {
    const v = R(Math.max(-80, Math.min(89.5, o.angulo === undefined ? tam.angulo : o.angulo)));
    dir = [Math.sin(ang) * Math.cos(v), Math.sin(v), Math.cos(ang) * Math.cos(v)];
  } else {
    const elev = o.elevacao, horiz = Math.sqrt(Math.max(1e-6, d * d - elev * elev));
    dir = [Math.sin(ang) * horiz / d, elev / d, Math.cos(ang) * horiz / d];
  }
  const dLim = limitar(alvo, dir, d, o.areaLivre);
  const fov = dLim < d ? fovPara(altura, dLim) : tam.fov;
  d = dLim;
  return { pos: soma(alvo, dir, d), alvo, fov, distancia: d };
}

// ruído suave determinístico (deriva de câmera na mão, sem tremer)
const onda = (t, a, b, c) => Math.sin(t * a + c) * 0.6 + Math.sin(t * b + c * 1.7) * 0.4;

function tremor(t, tremores) {
  let x = 0, y = 0;
  for (const tr of tremores || []) {
    const u = t - tr.t; if (u < 0 || u > tr.dur) continue;
    const a = tr.forca * Math.exp(-3 * (u / tr.dur));
    x += a * (Math.sin(u * 71) * 0.6 + Math.sin(u * 43 + 1.3) * 0.4);
    y += a * (Math.sin(u * 59 + 0.7) * 0.6 + Math.sin(u * 37 + 2.1) * 0.4);
  }
  return [x, y];
}

export function camNoTempo(plano, ancoras, u, dur, areaLivre) {
  const anc = ancoras.personagem || ancoras.pes ? (ancoras.personagem || ancoras) : null;
  const obj = ancoras.objeto || null;
  const mov = plano.movimento || { tipo: 'parado' }, k = suave(dur > 0 ? u / dur : 1), f = mov.forca === undefined ? 0.25 : mov.forca;
  let escalaDist = 1, lado = plano.lado, angulo = plano.angulo, lateral = 0, subida = 0;
  if (mov.tipo === 'empurrar') escalaDist = 1 - f * k;
  if (mov.tipo === 'puxar') escalaDist = 1 - f + f * k;
  if (mov.tipo === 'orbita') lado = (lado === undefined ? 25 : lado) + (mov.graus || 30) * (k - 0.5);
  if (mov.tipo === 'lateral') lateral = (mov.metros || 0.5) * (k - 0.5);
  if (mov.tipo === 'subir') subida = (mov.metros || 0.4) * k;
  if (mov.tipo === 'descer') subida = -(mov.metros || 0.4) * k;

  let c, foco;
  if (plano.primeiroPlano && obj && anc) {
    // objeto grande na frente da lente, personagem atrás (refs 03 e 05)
    const cab = anc.cabeca, o = obj.centro;
    const daCab = unit(sub(o, cab));
    const giroLado = R(lado || 0);
    const dirCam = unit([daCab[0] * Math.cos(giroLado) - daCab[2] * Math.sin(giroLado), daCab[1] * 0.3 + 0.08, daCab[0] * Math.sin(giroLado) + daCab[2] * Math.cos(giroLado)]);
    const dObj = (plano.primeiroPlano.distancia || 0.45) * escalaDist;
    const pos = soma(o, dirCam, dObj);
    const alvo = mix(o, cab, 0.72);                        // a esfera fica num canto de baixo, o rosto aparece
    c = { pos, alvo, fov: plano.fov || 44, distancia: norma(sub(alvo, pos)) };
    foco = norma(sub(cab, pos));
  } else {
    const a = plano.alvo === 'objeto' && obj ? { centro: obj.centro, giro: anc ? anc.giro : 0 } : anc;
    const tam = plano.alvo === 'objeto' && plano.tamanho !== 'detalhe' ? 'detalhe' : plano.tamanho;
    c = enquadrar(tam, a, { lado, angulo, elevacao: plano.elevacao, areaLivre, escalaDist, alturaQuadro: plano.alturaQuadro });
    foco = c.distancia;
  }
  // eixos da tela: direita (lx, lz) e cima
  const dx = c.pos[0] - c.alvo[0], dz = c.pos[2] - c.alvo[2], n = Math.hypot(dx, dz) || 1;
  const lx = -dz / n, lz = dx / n;
  // reenquadres: deslocamentos pequenos que entram suaves e ficam
  let rx = 0, ry = 0, zoom = 1;
  for (const r of plano.reenquadres || []) { const kk = suave((u - r.t) / (r.dur || 0.35)); rx += (r.dx || 0) * kk; ry += (r.dy || 0) * kk; zoom *= 1 + ((r.zoom || 1) - 1) * kk; }
  const [tx, ty] = tremor(u, plano.tremores);
  const dv = plano.deriva === undefined ? 1 : plano.deriva;
  const ox = onda(u, 0.9, 1.7, 0.3) * 0.018 * dv, oy = onda(u, 0.7, 1.3, 1.1) * 0.012 * dv, oz = onda(u, 0.6, 1.1, 2.3) * 0.015 * dv;
  const pos = [c.pos[0] + lx * (lateral + tx * 0.5 + rx * 0.4) + ox, c.pos[1] + ty * 0.5 + ry * 0.4 + oy + subida, c.pos[2] + lz * (lateral + tx * 0.5 + rx * 0.4) + oz];
  const alvo = [c.alvo[0] + lx * (lateral + tx + rx), c.alvo[1] + ty + ry, c.alvo[2] + lz * (lateral + tx + rx)];
  const rolagem = (plano.rolagem || 0) + (plano.giroRolagem || 0) * u + onda(u, 0.5, 0.9, 0.7) * 0.4 * dv;
  // zenital: o "cima" da tela aponta para a frente do personagem (evita a câmera virar ao olhar reto para baixo)
  const giro = R((anc && anc.giro) || 0);
  const cima = (angulo || 0) > 75 ? [Math.sin(giro), 0, Math.cos(giro)] : [0, 1, 0];
  return { pos, alvo, fov: c.fov / zoom, distancia: c.distancia, rolagem, cima, foco };
}

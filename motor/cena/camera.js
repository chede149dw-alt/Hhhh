// Câmera por tamanho de plano (prompt 6). Funções puras de tempo (mesmo t → mesma câmera).
//
// enquadrar(tamanho, ancora, o) → { pos, alvo, fov }
//   tamanho: 'geral' (corpo inteiro com folga), 'medio' (da cintura para cima), 'close' (cabeça e ombros)
//   ancora: { pes:[x,y,z], cabeca:[x,y,z], giro } — vem do corpo do personagem (a câmera fica presa ao corpo)
//   o: { lado (graus, em volta do personagem; 0 = de frente), elevacao (m), areaLivre }
// O tamanho vira altura de quadro (m) e campo de visão; a distância sai da conta  d = (altura/2) / tan(fov/2).
// Se a câmera sairia da área livre do cenário, ela chega mais perto e abre a lente para manter o enquadramento.
//
// camNoTempo(plano, ancora, u, dur, areaLivre) → { pos, alvo, fov } com movimento e tremor:
//   plano: { tamanho, lado, elevacao, movimento: { tipo: 'parado'|'empurrar'|'puxar'|'lateral'|'orbita', forca },
//            tremores: [{ t, forca, dur }] }

export const TAMANHOS = {
  geral: { altura: 2.5, fov: 34, centro: 'corpo' },
  medio: { altura: 1.0, fov: 28, centro: 'peito' },
  close: { altura: 0.5, fov: 22, centro: 'rosto' },
};

const R = (g) => (g * Math.PI) / 180;
const suave = (k) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };

export function distanciaPara(alturaQuadro, fov) { return alturaQuadro / 2 / Math.tan(R(fov) / 2); }
export function fovPara(alturaQuadro, distancia) { return (2 * Math.atan(alturaQuadro / 2 / distancia) * 180) / Math.PI; }

function centroDe(tam, ancora) {
  const [px, py, pz] = ancora.pes, [cx, cy, cz] = ancora.cabeca;
  if (tam.centro === 'corpo') return [(px + cx) / 2, py + (cy - py) * 0.52, (pz + cz) / 2];
  if (tam.centro === 'peito') return [cx, cy - 0.3, cz];
  return [cx, cy - 0.01, cz];
}

// mantém a câmera dentro do círculo livre: devolve a nova distância ao alvo
function limitar(alvo, dir, d, area) {
  if (!area) return d;
  const [cx, cz] = area.centro, r = area.raio;
  // ponto = alvo + dir*d; resolve |(alvo.xz + dir.xz*d) - c| = r e pega o maior d que cabe
  const ox = alvo[0] - cx, oz = alvo[2] - cz, dx = dir[0], dz = dir[2];
  const a = dx * dx + dz * dz, b = 2 * (ox * dx + oz * dz), c = ox * ox + oz * oz - r * r;
  if (a < 1e-9) return d;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return Math.min(d, 0.3);
  const dMax = (-b + Math.sqrt(disc)) / (2 * a);
  return Math.max(0.25, Math.min(d, dMax));
}

export function enquadrar(tamanho, ancora, o = {}) {
  const tam = TAMANHOS[tamanho] || TAMANHOS.medio;
  const alvo = centroDe(tam, ancora);
  const ang = R((ancora.giro || 0) + (o.lado === undefined ? 25 : o.lado));
  const elev = o.elevacao === undefined ? (tamanho === 'geral' ? 0.35 : 0.08) : o.elevacao;
  let d = distanciaPara(tam.altura, tam.fov) * (o.escalaDist || 1);
  const horiz = Math.sqrt(Math.max(1e-6, d * d - elev * elev));
  const dir = [Math.sin(ang) * horiz / d, elev / d, Math.cos(ang) * horiz / d];
  const dLim = limitar(alvo, dir, d, o.areaLivre);
  const fov = dLim < d ? fovPara(tam.altura * (o.escalaDist || 1), dLim) : tam.fov;
  d = dLim;
  return { pos: [alvo[0] + dir[0] * d, alvo[1] + dir[1] * d, alvo[2] + dir[2] * d], alvo, fov, distancia: d };
}

// tremor determinístico, com decaimento
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

export function camNoTempo(plano, ancora, u, dur, areaLivre) {
  const mov = plano.movimento || { tipo: 'parado' }, k = suave(dur > 0 ? u / dur : 1), f = mov.forca === undefined ? 0.25 : mov.forca;
  let escalaDist = 1, lado = plano.lado, lateral = 0;
  if (mov.tipo === 'empurrar') escalaDist = 1 - f * k;
  if (mov.tipo === 'puxar') escalaDist = 1 - f + f * k;
  if (mov.tipo === 'orbita') lado = (lado === undefined ? 25 : lado) + (mov.graus || 30) * (k - 0.5);
  if (mov.tipo === 'lateral') lateral = (mov.metros || 0.5) * (k - 0.5);
  const c = enquadrar(plano.tamanho, ancora, { lado, elevacao: plano.elevacao, areaLivre, escalaDist });
  // travelling lateral: desloca câmera e alvo para o lado (perpendicular à direção da câmera)
  const dx = c.pos[0] - c.alvo[0], dz = c.pos[2] - c.alvo[2], n = Math.hypot(dx, dz) || 1;
  const lx = -dz / n, lz = dx / n;
  const [tx, ty] = tremor(u, plano.tremores);
  const pos = [c.pos[0] + lx * (lateral + tx * 0.5), c.pos[1] + ty * 0.5, c.pos[2] + lz * (lateral + tx * 0.5)];
  const alvo = [c.alvo[0] + lx * (lateral + tx), c.alvo[1] + ty, c.alvo[2] + lz * (lateral + tx)];
  return { pos, alvo, fov: c.fov, distancia: c.distancia };
}

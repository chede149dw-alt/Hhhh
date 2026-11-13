// Câmera: enquadramento por tamanho de plano, movimentos e tremor. Puro (Node e navegador).
//   enquadrar({ ator, medidas, tamanho, angulo, elevacao, fov, livre }) → { pos, alvo, fov, dist }
//   ator = { x, z, giro } (marca/raiz do corpo; a câmera fica presa ao corpo, não aos braços)
//   angulo: graus em volta do ator (0 = de frente para ele, 90 = do lado esquerdo dele)
//   livre: raio livre da marca; se a distância passar dele, a câmera chega mais perto e abre a lente.
const R = Math.PI / 180;

export const TAMANHOS = {
  geral: { altura: (m) => m.H * 1.3, centro: (m) => m.H * 0.5 },                         // corpo inteiro com folga
  medio: { altura: (m) => m.H * 0.62, centro: (m) => m.H * 0.69 },                       // da cintura para cima
  close: { altura: (m) => m.cabecaH * 2.6, centro: (m) => m.olhosY - m.cabecaH * 0.25 }, // rosto e ombros
};

//   limites: { x0, x1, z0, z1, margem } — caixa (sala) de onde a câmera não sai (encurta a distância e abre a lente).
export function enquadrar({ ator, medidas: m, tamanho = 'medio', angulo = 0, elevacao = 0, fov = 30, livre = Infinity, alturaBase = 0, limites = null }) {
  const T = TAMANHOS[tamanho];
  if (!T) throw new Error(`Tamanho de plano "${tamanho}" não existe. Existentes: ${Object.keys(TAMANHOS).join(', ')}`);
  const alt = T.altura(m), cy = alturaBase + T.centro(m);
  const g = ((ator.giro || 0) + angulo) * R;
  let dist = alt / 2 / Math.tan((fov * R) / 2), f = fov;
  let max = livre;
  if (limites) {   // distância até sair da caixa, andando de (ator) na direção da câmera
    const mg = limites.margem ?? 0.3, dx = Math.sin(g), dz = Math.cos(g);
    const lim = (p, d, a, b) => (Math.abs(d) < 1e-9 ? Infinity : d > 0 ? (b - mg - p) / d : (a + mg - p) / d);
    max = Math.min(max, lim(ator.x, dx, limites.x0, limites.x1), lim(ator.z, dz, limites.z0, limites.z1));
  }
  if (dist > max) { dist = Math.max(0.3, max); f = (2 * Math.atan(alt / 2 / dist)) / R; }
  const pos = [ator.x + Math.sin(g) * dist, cy + elevacao, ator.z + Math.cos(g) * dist];
  return { pos, alvo: [ator.x, cy, ator.z], fov: f, dist };
}

// Movimentos (k = progresso 0..1, já com curva): empurrar/puxar (fração da distância), lateral (m), subir (m).
export function mover(enq, { empurrar = 0, lateral = 0, subir = 0 } = {}, k = 1) {
  const d = [enq.alvo[0] - enq.pos[0], enq.alvo[1] - enq.pos[1], enq.alvo[2] - enq.pos[2]];
  const lado = [d[2], 0, -d[0]], ll = Math.hypot(lado[0], lado[2]) || 1;
  const e = empurrar * k, l = lateral * k, s = subir * k;
  const pos = [enq.pos[0] + d[0] * e + (lado[0] / ll) * l, enq.pos[1] + d[1] * e + s, enq.pos[2] + d[2] * e + (lado[2] / ll) * l];
  const alvo = [enq.alvo[0] + (lado[0] / ll) * l, enq.alvo[1] + s, enq.alvo[2] + (lado[2] / ll) * l];
  return { ...enq, pos, alvo };
}

// Tremor determinístico (mesmo t → mesmo deslocamento). forca em metros; devolve deslocamento e giro (rad).
export function tremor(t, forca = 0.02, semente = 1) {
  const s = (f, fase) => Math.sin(t * f + fase + semente * 1.7);
  const n = (a, b, c) => (s(a, 0.3) * 0.5 + s(b, 1.1) * 0.3 + s(c, 2.3) * 0.2);
  return { d: [n(23, 37, 61) * forca, n(29, 43, 71) * forca, n(19, 31, 53) * forca * 0.5], rolar: n(17, 41, 67) * forca * 1.5 };
}

// Respiração da câmera subjetiva (leve sobe-desce e balanço).
export function respiracaoCamera(t, forca = 1) {
  const w = (2 * Math.PI) / 3.8;
  return { d: [Math.sin(w * t * 0.5) * 0.002 * forca, Math.sin(w * t) * 0.006 * forca, 0], rolar: Math.sin(w * t * 0.5) * 0.004 * forca };
}

// Projeção de um ponto (para testes de enquadramento): devolve [x, y] em 0..1 (y de cima para baixo).
export function projetar(p, { pos, alvo, fov }, aspecto = 1080 / 1920) {
  const f = [alvo[0] - pos[0], alvo[1] - pos[1], alvo[2] - pos[2]], fl = Math.hypot(...f);
  const fw = f.map((v) => v / fl);
  let rt = [-fw[2], 0, fw[0]]; const rl = Math.hypot(...rt); rt = rt.map((v) => v / rl);   // direita = frente × cima
  const up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
  const v = [p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]];
  const z = v[0] * fw[0] + v[1] * fw[1] + v[2] * fw[2];
  const x = v[0] * rt[0] + v[1] * rt[1] + v[2] * rt[2], y = v[0] * up[0] + v[1] * up[1] + v[2] * up[2];
  const th = Math.tan((fov * R) / 2);
  return [0.5 + x / (z * th * aspecto) / 2, 0.5 - y / (z * th) / 2];
}

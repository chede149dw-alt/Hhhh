// Atuações (sequências de poses-chave). Começa com a de exemplo do prompt 4; a biblioteca cresce no prompt 5.
// O personagem olha para +z. Alvos de sola em metros no mundo (y = 0 é o chão).

const guardaBracos = {
  ombro_e: [-50, 0, 22], cotovelo_e: [-105, 0, 0], ombro_d: [-42, 0, -26], cotovelo_d: [-112, 0, 0],
};

// pés no chão antes (A) e depois do salto (B, 40 cm à frente)
const A = { peEAlvo: [0.11, 0, 0.05], peDAlvo: [-0.11, 0, -0.09] };
const B = { peEAlvo: [0.11, 0, 0.45], peDAlvo: [-0.11, 0, 0.31] };

export const ATAQUE_SALTO = [
  { t: 0.0, nome: 'pronto', pose: {
    ...A, ikPes: 1, altura: -0.04, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
  { t: 0.3, nome: 'antecipação', curva: 'suave', pose: {
    ...A, ikPes: 1, altura: -0.21, juntas: { coluna: [24, 0, 0], peito: [10, 0, 0], cabeca: [-18, 0, 0],
      ombro_e: [42, 0, 14], cotovelo_e: [-22, 0, 0], ombro_d: [42, 0, -14], cotovelo_d: [-22, 0, 0] },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
  { t: 0.45, nome: 'impulso', curva: 'estalo', pose: {
    ...A, ikPes: 1, altura: 0.0, estica: 1.06, juntas: { coluna: [-6, 0, 0], cabeca: [-10, 0, 0],
      ombro_e: [-150, 0, 12], cotovelo_e: [-10, 0, 0], ombro_d: [-150, 0, -12], cotovelo_d: [-10, 0, 0], pe_e: [30, 0, 0], pe_d: [30, 0, 0] },
    maos: { e: 'punho', d: 'punho' }, rosto: 'raiva' } },
  { t: 0.7, nome: 'no ar', curva: 'sai', pose: {
    ikPes: 0, corpo: { y: 0.5, z: 0.18 }, estica: 1.0, juntas: { coluna: [-10, 0, 0], peito: [0, 10, 0], cabeca: [-6, 0, 0],
      coxa_e: [-72, 0, 6], joelho_e: [100, 0, 0], pe_e: [20, 0, 0], coxa_d: [-28, 0, -6], joelho_d: [82, 0, 0], pe_d: [25, 0, 0],
      ombro_d: [-165, 0, -22], cotovelo_d: [-95, 0, 0], ombro_e: [-62, 0, 30], cotovelo_e: [-80, 0, 0] },
    maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
  { t: 0.88, nome: 'golpe', curva: 'estalo', pose: {
    ikPes: 0, corpo: { y: 0.34, z: 0.32 }, juntas: { coluna: [26, 0, 0], peito: [10, -16, 0], cabeca: [-14, 10, 0],
      coxa_e: [-52, 0, 6], joelho_e: [72, 0, 0], pe_e: [10, 0, 0], coxa_d: [-10, 0, -6], joelho_d: [52, 0, 0], pe_d: [20, 0, 0],
      ombro_d: [-72, 0, -6], cotovelo_d: [0, 0, 0], ombro_e: [-30, 0, 48], cotovelo_e: [-60, 0, 0] },
    maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
  { t: 1.05, nome: 'aterrissagem', curva: 'entra', pose: {
    ...B, ikPes: 1, corpo: { y: 0, z: 0.4 }, altura: -0.25, estica: 0.93, juntas: { coluna: [30, 0, 0], peito: [6, -6, 0], cabeca: [-22, 4, 0],
      ombro_d: [-40, 0, -32], cotovelo_d: [-30, 0, 0], ombro_e: [-20, 0, 42], cotovelo_e: [-40, 0, 0] },
    maos: { e: 'aberta', d: 'punho' }, rosto: 'determinado' } },
  { t: 1.3, nome: 'assentamento', curva: 'sai', pose: {
    ...B, ikPes: 1, corpo: { y: 0, z: 0.4 }, altura: -0.09, estica: 1.02, juntas: { coluna: [12, 0, 0], cabeca: [-8, 0, 0],
      ombro_e: [-40, 0, 26], cotovelo_e: [-90, 0, 0], ombro_d: [-34, 0, -28], cotovelo_d: [-95, 0, 0] },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
  { t: 1.7, nome: 'pronto', curva: 'suave', pose: {
    ...B, ikPes: 1, corpo: { y: 0, z: 0.4 }, altura: -0.04, estica: 1, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
  { t: 2.1, nome: 'segura', curva: 'linear', pose: {
    ...B, ikPes: 1, corpo: { y: 0, z: 0.4 }, altura: -0.04, estica: 1, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
];

export const ATUACOES = { ataque_salto: ATAQUE_SALTO };

// Atuações (sequências de poses-chave). Começa com a de exemplo do prompt 4; a biblioteca cresce no prompt 5.
// O personagem olha para +z. Alvos de sola em metros no mundo (y = 0 é o chão).

const guardaBracos = {
  ombro_e: [-50, 0, 22], cotovelo_e: [-105, 0, 0], ombro_d: [-42, 0, -26], cotovelo_d: [-112, 0, 0],
};

// pés no chão antes (A) e depois do salto (B, 40 cm à frente)
const A = { peEAlvo: [0.11, 0, 0.05], peDAlvo: [-0.11, 0, -0.09] };
const B = { peEAlvo: [0.11, 0, 0.45], peDAlvo: [-0.11, 0, 0.31] };

// Salto: decola em 0,60 s e toca o chão em 1,30 s (parábola de 0,5 m, anda 0,4 m para a frente).
// Velocidades emendadas: o impulso acelera (curva 'cai', ~2 g) até a velocidade de decolagem do voo (4·h/T ≈ 2,9 m/s),
// e a aterrissagem começa nessa mesma velocidade e freia (curva 'sobe').
// No ar, corpo.y das chaves é 0: quem levanta o corpo é o voo (gravidade).
export const ATAQUE_SALTO = {
  voos: [{ de: 0.6, ate: 1.3, altura: 0.5, zDe: 0, zAte: 0.4 }],
  chaves: [
    { t: 0.0, nome: 'pronto', pose: {
      ...A, ikPes: 1, altura: -0.04, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
      maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
    { t: 0.445, nome: 'antecipação', pose: {
      ...A, ikPes: 1, altura: -0.22, juntas: { coluna: [24, 0, 0], peito: [10, 0, 0], cabeca: [-18, 0, 0],
        ombro_e: [42, 0, 14], cotovelo_e: [-22, 0, 0], ombro_d: [42, 0, -14], cotovelo_d: [-22, 0, 0] },
      maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
    // impulso: chega acelerando, para emendar na velocidade da decolagem
    { t: 0.6, nome: 'impulso', curva: 'cai', so: ['altura'], pose: {
      ...A, ikPes: 1, altura: 0.0, estica: 1.05, juntas: { coluna: [-4, 0, 0], cabeca: [-10, 0, 0],
        ombro_e: [-140, 0, 12], cotovelo_e: [-12, 0, 0], ombro_d: [-140, 0, -12], cotovelo_d: [-12, 0, 0], pe_e: [28, 0, 0], pe_d: [28, 0, 0] },
      maos: { e: 'punho', d: 'punho' }, rosto: 'raiva' } },
    { t: 0.74, nome: 'decolagem', pose: {
      ikPes: 0, corpo: { z: 0.07 }, estica: 1.03, juntas: { coluna: [-8, 0, 0], cabeca: [-8, 0, 0],
        coxa_e: [-20, 0, 5], joelho_e: [30, 0, 0], pe_e: [35, 0, 0], coxa_d: [6, 0, -5], joelho_d: [25, 0, 0], pe_d: [40, 0, 0],
        ombro_e: [-150, 0, 18], cotovelo_e: [-30, 0, 0], ombro_d: [-160, 0, -16], cotovelo_d: [-50, 0, 0] },
      maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
    { t: 0.96, nome: 'no ar', pose: {
      ikPes: 0, corpo: { z: 0.2 }, estica: 1.0, juntas: { coluna: [-10, 0, 0], peito: [0, 12, 0], cabeca: [-6, 0, 0],
        coxa_e: [-72, 0, 6], joelho_e: [100, 0, 0], pe_e: [20, 0, 0], coxa_d: [-30, 0, -6], joelho_d: [84, 0, 0], pe_d: [25, 0, 0],
        ombro_d: [-168, 0, -22], cotovelo_d: [-100, 0, 0], ombro_e: [-62, 0, 30], cotovelo_e: [-80, 0, 0] },
      maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
    { t: 1.08, nome: 'golpe', pose: {
      ikPes: 0, corpo: { z: 0.3 }, juntas: { coluna: [26, 0, 0], peito: [10, -16, 0], cabeca: [-14, 10, 0],
        coxa_e: [-48, 0, 6], joelho_e: [62, 0, 0], pe_e: [10, 0, 0], coxa_d: [-12, 0, -6], joelho_d: [44, 0, 0], pe_d: [18, 0, 0],
        ombro_d: [-72, 0, -6], cotovelo_d: [0, 0, 0], ombro_e: [-30, 0, 48], cotovelo_e: [-60, 0, 0] },
      maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
    // toque: pernas esticam procurando o chão (o IK entra aos poucos)
    { t: 1.3, nome: 'toque', pose: {
      ...B, ikPes: 1, corpo: { z: 0.4 }, altura: 0, juntas: { coluna: [20, 0, 0], peito: [6, -10, 0], cabeca: [-14, 6, 0],
        ombro_d: [-55, 0, -20], cotovelo_d: [-15, 0, 0], ombro_e: [-25, 0, 45], cotovelo_e: [-45, 0, 0] },
      maos: { e: 'aberta', d: 'punho' }, rosto: 'raiva' } },
    // aterrissagem: continua descendo na velocidade da queda e freia = amortece o impacto
    { t: 1.482, nome: 'aterrissagem', curva: 'sobe', so: ['altura'], pose: {
      ...B, ikPes: 1, corpo: { z: 0.4 }, altura: -0.26, estica: 0.94, juntas: { coluna: [30, 0, 0], peito: [6, -6, 0], cabeca: [-22, 4, 0],
        ombro_d: [-40, 0, -32], cotovelo_d: [-30, 0, 0], ombro_e: [-20, 0, 42], cotovelo_e: [-40, 0, 0] },
      maos: { e: 'aberta', d: 'punho' }, rosto: 'determinado' } },
    { t: 1.85, nome: 'assentamento', pose: {
      ...B, ikPes: 1, corpo: { z: 0.4 }, altura: -0.09, estica: 1.01, juntas: { coluna: [12, 0, 0], cabeca: [-8, 0, 0],
        ombro_e: [-40, 0, 26], cotovelo_e: [-90, 0, 0], ombro_d: [-34, 0, -28], cotovelo_d: [-95, 0, 0] },
      maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
    { t: 2.35, nome: 'pronto', pose: {
      ...B, ikPes: 1, corpo: { z: 0.4 }, altura: -0.04, estica: 1, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
      maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
    { t: 2.8, nome: 'segura', pose: {
      ...B, ikPes: 1, corpo: { z: 0.4 }, altura: -0.04, estica: 1, juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos },
      maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' } },
  ],
};

export const ATUACOES = { ataque_salto: ATAQUE_SALTO };

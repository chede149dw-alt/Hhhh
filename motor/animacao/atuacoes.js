// Biblioteca de atuações (prompts 4 e 5). O personagem olha para +z; alvos de sola em metros no mundo (y = 0 é o chão).
//
// ATUACOES[nome] = { descricao, chaves(o), voos?(o), impacto?, sons?, fim, cenario? }
//   chaves(o)  → lista de poses-chave { t, nome, pose, curva } (o = opções, ex.: { passos: 6 } no andar)
//   impacto    → instante-chave em segundos (o golpe, o susto…), para alinhar depois a uma palavra da narração
//   sons       → [{ t, som }] efeitos com o instante relativo à atuação
//   fim        → 'repouso' ou o nome de uma pausa declarada em PAUSAS (pose em que a atuação termina parada)
//   cenario    → objetos que a atuação precisa (ex.: banco para sentar)
// montarAtuacao(nome, o) devolve { chaves, voos, impacto, sons, fim, cenario } pronto para criarAnimacao.
import { REPOUSO } from '../personagem/boneco.js';

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

// ---------------- biblioteca ----------------
const R = REPOUSO.juntas;
const PES = { peEAlvo: [0.1, 0, 0], peDAlvo: [-0.1, 0, 0] };            // posição de pé parado
const repousoEm = (pes = PES, corpo = {}) => ({ ...pes, ikPes: 1, corpo, altura: 0, estica: 1, juntas: { ...R }, maos: { ...REPOUSO.maos }, rosto: 'neutro' });

// pausas declaradas: poses em que uma atuação pode terminar parada
export const PAUSAS = {
  guarda: { juntas: { coluna: [8, 0, 0], cabeca: [-6, 0, 0], ...guardaBracos }, altura: -0.04, estica: 1, maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' },
  assustado: { juntas: { coluna: [-8, 0, 0], peito: [-6, 0, 0], cabeca: [-6, 0, 0], ombro_e: [-55, 0, 32], cotovelo_e: [-70, 0, 0], ombro_d: [-55, 0, -32], cotovelo_d: [-70, 0, 0], mao_e: [0, 0, -10], mao_d: [0, 0, 10] },
    altura: -0.04, estica: 1, maos: { e: 'aberta', d: 'aberta' }, rosto: 'medo' },
  sentado_triste: { juntas: { coluna: [16, 0, 0], peito: [12, 0, 0], cabeca: [24, -8, 0], ombro_e: [-38, 0, 8], cotovelo_e: [-30, 0, 0], ombro_d: [-38, 0, -8], cotovelo_d: [-30, 0, 0] },
    altura: -0.33, estica: 1, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'triste' },
  poder_terra: { juntas: { coluna: [6, 0, 0], peito: [0, 0, 0], cabeca: [8, 0, 0], ombro_e: [-52, 0, 14], cotovelo_e: [-62, 0, 0], ombro_d: [-52, 0, -14], cotovelo_d: [-62, 0, 0], mao_e: [0, 0, -10], mao_d: [0, 0, 10] },
    altura: -0.08, estica: 1, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' },
};

// andar: ciclo com pés plantados (o pé de apoio não sai do lugar), braços opostos às pernas, quadril sobe e desce
function chavesAndar(o = {}) {
  const n = o.passos || 4, passo = o.passo || 0.32, T = o.tempo || 0.52;
  const pes = { e: [0.1, 0, 0], d: [-0.1, 0, 0] };
  const ks = [{ t: 0, nome: 'parado', pose: repousoEm() }];
  let t = 0.25;
  const pose = (extra) => ({ peEAlvo: [...pes.e], peDAlvo: [...pes.d], ikPes: 1, estica: 1, maos: { ...REPOUSO.maos }, rosto: 'neutro', ...extra });
  for (let i = 0; i <= n; i++) {
    const lado = i % 2 === 0 ? 'd' : 'e', apoio = lado === 'd' ? 'e' : 'd', ultimo = i === n;
    const de = pes[lado][2], para = ultimo ? pes[apoio][2] : (i + 1) * passo;
    const sl = lado === 'd' ? 1 : -1;                                       // braço esquerdo vai à frente quando a perna direita vai
    // passagem: pé no ar no meio do caminho, corpo alto sobre o pé de apoio
    const meio = pose({ corpo: { z: pes[apoio][2] }, altura: 0.0, juntas: { ...R, quadril: [0, 0, 0], ombro_e: [0, 0, 5], ombro_d: [0, 0, -5] } });
    meio[lado === 'e' ? 'peEAlvo' : 'peDAlvo'] = [pes[lado][0], ultimo ? 0.04 : 0.075, (de + para) / 2];
    meio.juntas['pe_' + lado] = [12, 0, 0];
    ks.push({ t: t + T / 2, nome: 'passagem', pose: meio });
    pes[lado] = [pes[lado][0], 0, para];
    // contato: pé da frente toca o chão, corpo baixo no meio dos pés, quadril e peito giram em sentidos opostos
    const contato = ultimo ? repousoEm({ peEAlvo: [...pes.e], peDAlvo: [...pes.d] }, { z: para })
      : pose({ corpo: { z: (pes.e[2] + pes.d[2]) / 2 }, altura: -0.03,
        juntas: { ...R, quadril: [0, 7 * sl, 0], peito: [0, -9 * sl, 0], ['pe_' + lado]: [-8, 0, 0],
          ombro_e: [-24 * sl, 0, 5], cotovelo_e: [-16 - 8 * Math.max(0, sl), 0, 0], ombro_d: [24 * sl, 0, -5], cotovelo_d: [-16 - 8 * Math.max(0, -sl), 0, 0] } });
    ks.push({ t: t + T, nome: ultimo ? 'para' : 'contato', pose: contato });
    t += T;
  }
  ks.push({ t: t + 0.4, nome: 'parado', pose: repousoEm({ peEAlvo: [...pes.e], peDAlvo: [...pes.d] }, { z: pes.e[2] }) });
  return ks;
}

const ACENAR = () => {
  const braco = (cot) => ({ ...R, ombro_d: [0, 0, -128], cotovelo_d: [0, 0, cot], mao_d: [0, 0, 8], peito: [0, -6, 3], cabeca: [0, -10, 6] });
  return [
    { t: 0, nome: 'parado', pose: repousoEm() },
    { t: 0.35, nome: 'nota', pose: { ...repousoEm(), juntas: { ...R, cabeca: [4, -12, 4] }, rosto: 'feliz' } },
    { t: 0.75, nome: 'levanta', pose: { ...repousoEm(), juntas: braco(-40), maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz' } },
    { t: 1.0, nome: 'aceno', pose: { ...repousoEm(), juntas: braco(-70), maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz' } },
    { t: 1.25, nome: 'aceno', pose: { ...repousoEm(), juntas: braco(-25), maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz' } },
    { t: 1.5, nome: 'aceno', pose: { ...repousoEm(), juntas: braco(-70), maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz' } },
    { t: 1.75, nome: 'aceno', pose: { ...repousoEm(), juntas: braco(-30), maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz' } },
    { t: 2.25, nome: 'abaixa', pose: { ...repousoEm(), juntas: { ...R, ombro_d: [-10, 0, -20], cotovelo_d: [-30, 0, 0] }, rosto: 'feliz' } },
    { t: 2.7, nome: 'parado', pose: repousoEm() },
  ];
};

const ASSUSTAR = () => [
  { t: 0, nome: 'parado', pose: repousoEm() },
  { t: 0.3, nome: 'percebe', pose: { ...repousoEm(), juntas: { ...R, cabeca: [-4, 8, 0] }, rosto: 'neutro' } },
  // susto: encolhe e pula para trás (o voo levanta), braços sobem, mãos abertas
  { t: 0.42, nome: 'encolhe', curva: 'entra', so: ['altura'], pose: { ...repousoEm(), altura: -0.08, juntas: { ...R, coluna: [10, 0, 0], cabeca: [8, 0, 0], ombro_e: [-20, 0, 20], ombro_d: [-20, 0, -20] }, rosto: 'espanto' } },
  { t: 0.5, nome: 'pula', pose: { ...PES, ikPes: 0.3, corpo: { z: -0.06 }, altura: 0, estica: 1.04, juntas: { ...R, coluna: [-12, 0, 0], peito: [-8, 0, 0], cabeca: [-10, 0, 0], ombro_e: [-70, 0, 40], cotovelo_e: [-80, 0, 0], ombro_d: [-70, 0, -40], cotovelo_d: [-80, 0, 0], coxa_e: [-10, 0, 0], joelho_e: [20, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto' } },
  { t: 0.72, nome: 'cai', curva: 'sai', so: ['altura'], pose: { peEAlvo: [0.12, 0, -0.16], peDAlvo: [-0.12, 0, -0.2], ikPes: 1, corpo: { z: -0.18 }, altura: -0.1, estica: 0.96, juntas: { ...PAUSAS.assustado.juntas, coluna: [-4, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto' } },
  { t: 1.1, nome: 'assustado', pose: { peEAlvo: [0.12, 0, -0.16], peDAlvo: [-0.12, 0, -0.2], ikPes: 1, corpo: { z: -0.18 }, ...PAUSAS.assustado } },
  { t: 1.6, nome: 'segura', pose: { peEAlvo: [0.12, 0, -0.16], peDAlvo: [-0.12, 0, -0.2], ikPes: 1, corpo: { z: -0.18 }, ...PAUSAS.assustado } },
];

const SENTAR_TRISTE = () => {
  const pesBanco = { peEAlvo: [0.12, 0, 0.12], peDAlvo: [-0.12, 0, 0.1] };
  return [
    { t: 0, nome: 'parado', pose: { ...repousoEm(pesBanco), corpo: { z: 0.1 } } },
    { t: 0.4, nome: 'olha para baixo', pose: { ...repousoEm(pesBanco), corpo: { z: 0.1 }, juntas: { ...R, cabeca: [18, 0, 0] }, rosto: 'triste' } },
    { t: 0.9, nome: 'desce', pose: { ...pesBanco, ikPes: 1, corpo: { z: -0.02 }, altura: -0.2, estica: 1, juntas: { ...R, coluna: [28, 0, 0], cabeca: [10, 0, 0], ombro_e: [-30, 0, 10], ombro_d: [-30, 0, -10] }, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'triste' } },
    { t: 1.35, nome: 'senta', curva: 'sai', pose: { ...pesBanco, ikPes: 1, corpo: { z: -0.14 }, altura: -0.34, estica: 0.98, juntas: { ...PAUSAS.sentado_triste.juntas, coluna: [10, 0, 0], cabeca: [10, 0, 0] }, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'triste' } },
    // suspiro: ombros sobem e caem, cabeça baixa
    { t: 1.9, nome: 'suspira', pose: { ...pesBanco, ikPes: 1, corpo: { z: -0.14 }, altura: -0.32, estica: 1.01, juntas: { ...PAUSAS.sentado_triste.juntas, coluna: [8, 0, 0], cabeca: [14, -6, 0], ombro_e: [-34, 0, 14], ombro_d: [-34, 0, -14] }, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'cansado' } },
    { t: 2.6, nome: 'sentado triste', pose: { ...pesBanco, ikPes: 1, corpo: { z: -0.14 }, ...PAUSAS.sentado_triste } },
    { t: 3.1, nome: 'segura', pose: { ...pesBanco, ikPes: 1, corpo: { z: -0.14 }, ...PAUSAS.sentado_triste } },
  ];
};

const COMEMORAR = () => {
  const punhos = (e, d) => ({ ...R, ombro_e: [0, 0, e], cotovelo_e: [0, 0, 30], ombro_d: [0, 0, d], cotovelo_d: [0, 0, -30] });
  return [
    { t: 0, nome: 'parado', pose: repousoEm() },
    { t: 0.35, nome: 'antecipa', pose: { ...repousoEm(), altura: -0.16, juntas: { ...R, coluna: [18, 0, 0], cabeca: [-12, 0, 0], ombro_e: [-40, 0, 20], cotovelo_e: [-100, 0, 0], ombro_d: [-40, 0, -20], cotovelo_d: [-100, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'feliz' } },
    { t: 0.5, nome: 'impulso', curva: 'cai', so: ['altura'], pose: { ...repousoEm(), altura: 0, estica: 1.04, juntas: { ...punhos(150, -150), coluna: [-6, 0, 0], cabeca: [-14, 0, 0], pe_e: [25, 0, 0], pe_d: [25, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    { t: 0.66, nome: 'no ar', pose: { ...PES, ikPes: 0, altura: 0, estica: 1.02, juntas: { ...punhos(160, -160), coluna: [-10, 0, 0], cabeca: [-18, 0, 0], coxa_e: [-30, 0, 4], joelho_e: [60, 0, 0], coxa_d: [-20, 0, -4], joelho_d: [70, 0, 0], pe_e: [20, 0, 0], pe_d: [20, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    { t: 0.9, nome: 'toque', pose: { ...repousoEm(), altura: 0, juntas: { ...punhos(140, -140), coluna: [-4, 0, 0], cabeca: [-12, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    { t: 1.05, nome: 'amortece', curva: 'sobe', so: ['altura'], pose: { ...repousoEm(), altura: -0.13, estica: 0.96, juntas: { ...punhos(120, -120), coluna: [14, 0, 0], cabeca: [-6, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    // punho cerrado puxado duas vezes ("yes!")
    { t: 1.35, nome: 'yes', pose: { ...repousoEm(), altura: -0.06, juntas: { ...R, coluna: [12, 10, 0], ombro_d: [-40, 0, -10], cotovelo_d: [-120, 0, 0], ombro_e: [-20, 0, 15], cotovelo_e: [-40, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    { t: 1.55, nome: 'yes', pose: { ...repousoEm(), altura: -0.03, juntas: { ...R, coluna: [4, 10, 0], ombro_d: [-60, 0, -10], cotovelo_d: [-90, 0, 0], ombro_e: [-20, 0, 15], cotovelo_e: [-40, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'feliz' } },
    { t: 1.75, nome: 'yes', pose: { ...repousoEm(), altura: -0.07, juntas: { ...R, coluna: [14, 10, 0], ombro_d: [-35, 0, -10], cotovelo_d: [-125, 0, 0], ombro_e: [-20, 0, 15], cotovelo_e: [-40, 0, 0] }, maos: { e: 'punho', d: 'punho' }, rosto: 'rindo' } },
    { t: 2.3, nome: 'parado', pose: { ...repousoEm(), rosto: 'neutro' } },
  ];
};

const PODER_TERRA = () => {
  const base = { peEAlvo: [0.17, 0, 0.08], peDAlvo: [-0.16, 0, -0.1], ikPes: 1, estica: 1 };
  return [
    { t: 0, nome: 'parado', pose: repousoEm() },
    { t: 0.45, nome: 'base', pose: { ...base, altura: -0.1, juntas: { ...R, coluna: [10, 0, 0], cabeca: [8, 0, 0], ombro_e: [-20, 0, 25], ombro_d: [-20, 0, -25] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    // concentra: mãos descem com a palma para o chão
    { t: 0.95, nome: 'concentra', pose: { ...base, altura: -0.16, juntas: { ...R, coluna: [18, 0, 0], cabeca: [16, 0, 0], ombro_e: [-35, 0, 30], cotovelo_e: [-20, 0, 0], mao_e: [0, 0, 40], ombro_d: [-35, 0, -30], cotovelo_d: [-20, 0, 0], mao_d: [0, 0, -40] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    // ergue: as mãos sobem de uma vez e a terra levanta (impacto)
    { t: 1.2, nome: 'ergue', curva: 'estalo', so: ['altura', 'estica'], pose: { ...base, altura: -0.05, estica: 1.03, juntas: { ...PAUSAS.poder_terra.juntas, ombro_e: [-68, 0, 12], cotovelo_e: [-50, 0, 0], ombro_d: [-68, 0, -12], cotovelo_d: [-50, 0, 0], cabeca: [-4, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'raiva' } },
    { t: 1.7, nome: 'poder', pose: { ...base, ...PAUSAS.poder_terra } },
    { t: 2.3, nome: 'segura', pose: { ...base, ...PAUSAS.poder_terra } },
  ];
};

// arremesso da terra: forma a esfera no peito, segura, recua e arremessa para a frente (a esfera sai em lancamento)
const ARREMESSO_TERRA = () => {
  const base = { peEAlvo: [0.17, 0, 0.1], peDAlvo: [-0.16, 0, -0.12], ikPes: 1, estica: 1 };
  const P = PAUSAS.poder_terra.juntas;
  return [
    { t: 0, nome: 'parado', pose: repousoEm() },
    { t: 0.5, nome: 'base', pose: { ...base, altura: -0.08, juntas: { ...R, coluna: [8, 0, 0], cabeca: [6, 0, 0], ombro_e: [-15, 0, 25], ombro_d: [-15, 0, -25] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    { t: 1.4, nome: 'concentra', pose: { ...base, altura: -0.15, juntas: { ...R, coluna: [16, 0, 0], cabeca: [14, 0, 0], ombro_e: [-40, 0, 18], cotovelo_e: [-55, 0, 0], ombro_d: [-40, 0, -18], cotovelo_d: [-55, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    { t: 2.0, nome: 'ergue', curva: 'estalo', so: ['altura'], pose: { ...base, altura: -0.06, juntas: { ...P, cabeca: [-4, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'raiva' } },
    { t: 2.7, nome: 'segura', pose: { ...base, altura: -0.08, juntas: { ...P }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    // recua: tronco gira e os braços vão para trás (antecipação do arremesso)
    { t: 3.05, nome: 'recua', pose: { ...base, altura: -0.12, juntas: { ...R, coluna: [-6, 18, 0], peito: [-6, 10, 0], cabeca: [0, -14, 0], ombro_e: [-30, 0, 30], cotovelo_e: [-70, 0, 0], ombro_d: [-20, 0, -40], cotovelo_d: [-80, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'raiva' } },
    // arremessa: braços disparam para a frente (lançamento)
    { t: 3.25, nome: 'arremessa', curva: 'estalo', pose: { ...base, altura: -0.1, estica: 1.02, juntas: { ...R, coluna: [18, -10, 0], peito: [8, -8, 0], cabeca: [-10, 6, 0], ombro_e: [-88, 0, 8], cotovelo_e: [-5, 0, 0], ombro_d: [-88, 0, -8], cotovelo_d: [-5, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'raiva' } },
    { t: 3.7, nome: 'acompanha', pose: { ...base, altura: -0.14, juntas: { ...R, coluna: [24, -6, 0], peito: [8, -4, 0], cabeca: [-14, 4, 0], ombro_e: [-70, 0, 14], cotovelo_e: [-15, 0, 0], ombro_d: [-70, 0, -14], cotovelo_d: [-15, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'determinado' } },
    { t: 4.6, nome: 'olha o estrago', pose: { ...base, altura: -0.06, juntas: { ...R, coluna: [6, 0, 0], cabeca: [10, 0, 0], ombro_e: [-10, 0, 14], ombro_d: [-10, 0, -14] }, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'espanto' } },
    { t: 5.6, nome: 'parado', pose: { ...repousoEm(base), rosto: 'neutro' } },
  ];
};

export const ATUACOES = {
  arremesso_terra: { descricao: 'Lucas forma a esfera de terra no peito, segura e arremessa no chão à frente', chaves: ARREMESSO_TERRA, fim: 'repouso',
    impacto: 3.25, eventos: { forma: 1.3, cheia: 2.0, lancamento: 3.25, impacto: 3.75 },
    sons: [{ t: 1.3, som: 'terra_sobe' }, { t: 3.25, som: 'arremesso' }, { t: 3.75, som: 'impacto_terra' }] },
  andar: { descricao: 'Anda para a frente (passos configuráveis) e para com os pés juntos', chaves: chavesAndar, fim: 'repouso',
    impacto: null, sons: (o = {}) => { const n = o.passos || 4, T = o.tempo || 0.52; return [...Array(n + 1).keys()].map((i) => ({ t: 0.25 + (i + 1) * T, som: 'passo' })); } },
  acenar: { descricao: 'Nota alguém, sorri e acena com a mão direita', chaves: ACENAR, fim: 'repouso', impacto: 1.0, sons: [] },
  assustar: { descricao: 'Leva um susto: encolhe, pula para trás e fica com as mãos para cima', chaves: ASSUSTAR, fim: 'assustado', impacto: 0.5,
    voos: [{ de: 0.5, ate: 0.72, altura: 0.12 }], sons: [{ t: 0.48, som: 'susto' }, { t: 0.72, som: 'passo' }] },
  sentar_triste: { descricao: 'Fica triste, senta no banco devagar e suspira', chaves: SENTAR_TRISTE, fim: 'sentado_triste', impacto: 1.35,
    sons: [{ t: 1.35, som: 'senta' }, { t: 1.9, som: 'suspiro' }], cenario: { banco: { z: -0.32, altura: 0.4 } } },
  comemorar: { descricao: 'Comemora: pula com os punhos para cima e faz "yes!"', chaves: COMEMORAR, fim: 'repouso', impacto: 0.66,
    voos: [{ de: 0.5, ate: 0.9, altura: 0.28 }], sons: [{ t: 0.5, som: 'pulo' }, { t: 0.9, som: 'aterrissa' }, { t: 1.35, som: 'yes' }] },
  poder_terra: { descricao: 'Lucas usa o poder da terra: base firme, concentra e ergue as mãos', chaves: PODER_TERRA, fim: 'poder_terra', impacto: 1.2,
    sons: [{ t: 0.95, som: 'tremor' }, { t: 1.2, som: 'terra_sobe' }] },
  ataque_salto: { descricao: 'Ataque com salto: antecipa, salta, golpeia no ar e aterrissa em guarda', chaves: () => ATAQUE_SALTO.chaves, fim: 'guarda',
    impacto: 1.08, voos: ATAQUE_SALTO.voos, sons: [{ t: 0.6, som: 'pulo' }, { t: 1.08, som: 'golpe' }, { t: 1.3, som: 'aterrissa' }] },
};

export function montarAtuacao(nome, o = {}) {
  const a = ATUACOES[nome];
  if (!a) throw new Error('atuação desconhecida: ' + nome);
  const val = (v) => (typeof v === 'function' ? v(o) : v);
  return { nome, descricao: a.descricao, chaves: a.chaves(o), voos: val(a.voos) || [], impacto: a.impacto, eventos: a.eventos || {}, sons: val(a.sons) || [], fim: a.fim, cenario: a.cenario || null };
}

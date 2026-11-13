// Biblioteca de atuações (a etapa 5 amplia). Pura.
// ATUACOES[nome] = { descricao, impacto?, sons?, chaves({ medidas, ...contexto }) → lista de chaves }
// impacto: instante-chave (s) que pode ser alinhado a uma palavra da narração.
// sons: [{ t, som }] relativos ao início da atuação.
import { REPOUSO, derivar } from './poses.js';
import { pontos } from './esqueleto.js';

const noChao = (p) => [p[0], 0, p[2]];
const somar = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];

export const ATUACOES = {
  larissa_grade: {
    descricao: 'A cliente se joga contra a grade, agarra as barras e inclina a cabeça demais (começo da revelação).',
    impacto: 1.5,
    sons: [{ t: 1.36, som: 'passo' }, { t: 1.5, som: 'grade_impacto' }],
    chaves({ medidas: m, grade = { z: 0.72, alturaMao: 1.16, abertura: 0.2 } }) {
      const B = derivar(REPOUSO, { desl: { y: -0.03 }, rosto: { boca: 'sorriso' } });
      const p = pontos(B, m), sD = noChao(p.peD), sE = noChao(p.peE);
      const barra = (s) => [s * grade.abertura, grade.alturaMao, grade.z - 0.035];
      const bracos = (frente, abre, dobra, fecha) => ({
        ombroD: { frente, abre }, ombroE: { frente, abre }, cotoveloD: { dobra }, cotoveloE: { dobra }, maoD: { fecha }, maoE: { fecha },
      });
      return [
        { t: 0, pose: B, peDAlvo: sD, peEAlvo: sE },
        { t: 0.7 },                                                         // parada, olhando
        { t: 1.1, curva: 'suave', pose: derivar(B, {                       // antecipação: recua e encolhe
          corpo: { estica: -0.05 }, desl: { y: -0.09, z: -0.04 }, coluna: { frente: -7 }, peito: { frente: -5 }, cabeca: { frente: 6 },
          ...bracos(22, 12, 75, 10), rosto: { boca: 'neutra', olhos: 1.1 } }) },
        { t: 1.36, curva: 'entra', peDAlvo: somar(sD, [0, 0, 0.24]), pose: derivar(B, {   // impulso: passo à frente
          corpo: { z: 0.12, estica: 0.05 }, desl: { y: -0.04, z: 0.06 }, coluna: { frente: 12 }, peito: { frente: 8 }, cabeca: { frente: -4 },
          ...bracos(80, 12, 25, 0), rosto: { boca: 'neutra', olhos: 1.15 } }) },
        { t: 1.5, curva: 'estalo', maoDAlvo: barra(-1), maoEAlvo: barra(1), pose: derivar(B, {     // golpe nas barras
          corpo: { z: 0.16, estica: -0.07 }, desl: { y: -0.07, z: 0.04 }, coluna: { frente: 11 }, peito: { frente: 8 }, cabeca: { frente: -8 },
          ...bracos(70, 15, 40, 85), rosto: { boca: 'neutra', olhos: 1.2 } }) },
        { t: 1.72, curva: 'sai', pose: derivar(B, {                        // recuo do impacto
          corpo: { z: 0.16, estica: 0.02 }, desl: { y: -0.05, z: 0.04 }, coluna: { frente: 8 }, peito: { frente: 6 }, cabeca: { frente: 0 },
          ...bracos(70, 15, 40, 85), rosto: { boca: 'neutra', olhos: 1.1 } }) },
        { t: 2.5, curva: 'suave', pose: derivar(B, {                       // assentamento: sorriso volta, cabeça começa a pender
          corpo: { z: 0.16 }, desl: { y: -0.04, z: 0.04 }, coluna: { frente: 6 }, peito: { frente: 5 }, cabeca: { lado: 16, frente: 4 },
          ...bracos(70, 15, 40, 85), rosto: { boca: 'sorriso', estranho: 0.3 } }) },
        { t: 3.7, curva: 'suave', pose: derivar(B, {                       // inclinada demais, olhar morto
          corpo: { z: 0.16 }, desl: { y: -0.04, z: 0.04 }, coluna: { frente: 6 }, peito: { frente: 5, lado: -4 }, pescoco: { lado: 10 },
          cabeca: { lado: 34, frente: 6, giro: -6 }, ...bracos(70, 15, 40, 85), rosto: { boca: 'neutra', estranho: 0.6, olharY: 0.1 } }) },
        { t: 4.2 },                                                         // segura
      ];
    },
  },
};

export function chavesDe(nome, contexto) {
  const a = ATUACOES[nome];
  if (!a) throw new Error(`Atuação "${nome}" não existe. Existentes: ${Object.keys(ATUACOES).join(', ')}`);
  return a.chaves(contexto);
}

// Biblioteca de atuações. Pura (Node e navegador).
//
// ATUACOES[nome] = {
//   descricao, inicio, final,          // estados (ESTADOS) em que começa e termina: garante continuidade
//   impacto?,                          // instante-chave (s) para alinhar a uma palavra da narração
//   sons?: [{ t, som }],               // efeitos relativos ao início
//   objetos?: [{ id, mao, de?, ate? }],// adereços presos à mão (celular, lata)
//   cena?: {...},                      // o que a atuação supõe no cenário (assento, grade, cadeado, geladeira)
//   chaves(ctx) → [chave],             // ctx = { medidas, ...parâmetros }
//   camada?(ctx) → (t) → deltas,       // movimento contínuo somado por cima (balanço da caminhada)
// }
// Toda atuação é escrita com o ator na origem olhando para +z. `noLugar` leva para a marca do cenário.
import { REPOUSO, derivar } from './poses.js';
import { pontos, fk, paraMundo } from './esqueleto.js';
import { add } from './mat.js';

const noChao = (p) => [p[0], 0, p[2]];
const somar = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
const graus = (r) => (r * 180) / Math.PI;
const solas = (pose, m) => { const p = pontos(pose, m); return { peDAlvo: noChao(p.peD), peEAlvo: noChao(p.peE) }; };
const ombroMundo = (pose, m, l = 'D') => { const f = fk(pose, m); return paraMundo(pose, f.P['ombro' + l]); };
const bracos = (frente, abre, dobra, fecha = 25) => ({
  ombroD: { frente, abre }, ombroE: { frente, abre }, cotoveloD: { dobra }, cotoveloE: { dobra }, maoD: { fecha }, maoE: { fecha },
});
export const ASSENTO = 0.44;   // altura do engradado/banco (m)
// Ponto na frente dos olhos (1ª pessoa): baixo = metros abaixo dos olhos, frente = metros à frente.
const naFrenteDosOlhos = (m, x, baixo, frente) => [x, m.olhosY - 0.03 - baixo, frente];

// Estados: poses de início/fim compartilhadas pelas atuações (dependem das medidas do ator).
export function estados(m, ctx = {}) {
  const emPe = derivar(REPOUSO, { desl: { y: -0.03 } });
  const sentado = derivar(REPOUSO, {
    desl: { y: ASSENTO + m.coxaL * 0.5 - m.pernaComp }, coxaD: { frente: 88, abre: 6 }, coxaE: { frente: 88, abre: 6 },
    joelhoD: { dobra: 86 }, joelhoE: { dobra: 86 }, coluna: { frente: 4 }, ...bracos(30, 8, 50),
  });
  const alvo = ctx.alvo || [0, 1.55, 2.5];
  const base = ctx.inicio ? null : emPe;
  const olhosY = m.olhosY + (ctx.inicio === 'sentado' ? sentado.desl.y : -0.03);
  const yaw = graus(Math.atan2(alvo[0], alvo[2])), pitch = graus(Math.atan2(olhosY - alvo[1], Math.hypot(alvo[0], alvo[2])));
  const E = {
    em_pe: emPe,
    sentado,
    sentado_celular: derivar(sentado, { cabeca: { frente: 26 }, pescoco: { frente: 10 }, coluna: { frente: 10 }, ...bracos(40, 10, 95, 70) }),
    sentado_triste: derivar(sentado, {
      coluna: { frente: 18 }, peito: { frente: 12 }, cabeca: { frente: 24 }, ...bracos(28, 10, 70, 40),
      rosto: { boca: 'triste', sobrancelha: 1, olhos: 0.75 },
    }),
    olhar_fixo: derivar(emPe, { cabeca: { lado: 7 }, rosto: { boca: 'sorriso', estranho: 0.3 } }),
    na_grade: null,   // preenchido abaixo (final de larissa_grade)
    no_cadeado: derivar(emPe, { coluna: { frente: 8 }, cabeca: { frente: 12 }, ombroD: { frente: 55 }, cotoveloD: { dobra: 60 }, maoD: { fecha: 80, giro: 30 } }),
    // poses de 1ª pessoa: braços "para a câmera" (mais altos que o natural, como em jogos), mãos guiadas por IK
    olhando_celular: derivar(emPe, { cabeca: { frente: 18 }, pescoco: { frente: 6 }, ombroD: { frente: 60, abre: 10 }, cotoveloD: { dobra: 100 }, maoD: { fecha: 18, giro: 60 } }),
    segurando_lata: derivar(emPe, { cabeca: { frente: 14 }, ombroD: { frente: 55, abre: 10 }, cotoveloD: { dobra: 100 }, maoD: { fecha: 85 } }),
    mao_estendida: derivar(emPe, { coluna: { frente: 4 }, peito: { giro: 8 }, cabeca: { giro: 14 }, ombroE: { frente: 92, abre: 6 }, cotoveloE: { dobra: 12 }, maoE: { fecha: 0, dobra: -65 } }),
    olhando: derivar(ctx.inicioPose || base || emPe, {
      pescoco: { giro: yaw * 0.4, frente: pitch * 0.3 }, cabeca: { giro: yaw * 0.6, frente: pitch * 0.7, lado: 10 },
      rosto: { estranho: ctx.estranho ?? 0.7, boca: 'sorriso' },
    }),
  };
  E.revelada = null;
  E.na_grade = derivar(emPe, {
    corpo: { z: 0.16 }, desl: { y: -0.04, z: 0.04 }, coluna: { frente: 6 }, peito: { frente: 5, lado: -4 }, pescoco: { lado: 10 },
    cabeca: { lado: 34, frente: 6, giro: -6 }, ...bracos(70, 15, 40, 85), rosto: { boca: 'neutra', estranho: 0.6, olharY: 0.1 },
  });
  E.revelada = derivar(E.na_grade, { coluna: { frente: 12 }, peito: { frente: 7, lado: 0 }, pescoco: { lado: 4 }, cabeca: { lado: 22, frente: -4, giro: 0 },
    corpo: { z: 0.2 }, rosto: { boca: 'sorriso', estranho: 0.9, olharY: 0 } });
  return E;
}
export const estado = (nome, m, ctx) => {
  const E = estados(m, ctx);
  if (!E[nome]) throw new Error(`Estado "${nome}" não existe. Existentes: ${Object.keys(E).join(', ')}`);
  return E[nome];
};

export const ATUACOES = {
  // ------------------------------------------------------------ genéricas
  andar: {
    descricao: 'Anda para a frente (+z) e para com os pés juntos. Parâmetros: distancia (m), tempoPasso (s).',
    inicio: 'em_pe', final: 'em_pe',
    chaves({ medidas: m, distancia = 2, tempoPasso = 0.5 }) {
      const E = estados(m), base = E.em_pe, s0 = solas(base, m);
      const passo = 0.3 * m.H, T = tempoPasso;
      const pe = { D: s0.peDAlvo, E: s0.peEAlvo };
      const chaves = [{ t: 0, pose: base, ...s0 }];
      let k = 0, lado = 'D';
      while (true) {
        k++;
        const z = Math.min(k * passo, distancia);
        pe[lado] = [pe[lado][0], 0, z];
        const zc = (pe.D[2] + pe.E[2]) / 2;
        const ultimo = pe.D[2] >= distancia && pe.E[2] >= distancia;
        chaves.push({ t: k * T, curva: k === 1 ? 'entra' : ultimo ? 'sai' : 'linear', pose: derivar(base, { corpo: { z: zc }, desl: { y: ultimo ? -0.03 : -0.07 } }), peDAlvo: pe.D, peEAlvo: pe.E });
        if (ultimo) break;
        lado = lado === 'D' ? 'E' : 'D';
        if (k > 200) throw new Error('andar: passos demais');
      }
      chaves.push({ t: (k + 0.6) * T });   // assenta
      return chaves;
    },
    camada({ medidas: m, distancia = 2, tempoPasso = 0.5 }) {
      const n = Math.ceil(distancia / (0.3 * m.H)) + 1, fim = n * tempoPasso;
      return (t) => {
        if (t <= 0 || t >= fim) return null;
        const env = Math.min(1, t / tempoPasso, (fim - t) / tempoPasso), f = Math.sin((Math.PI * t) / tempoPasso);
        return {
          desl: { y: 0.045 * f * f * env },        // contato baixo (chave), passagem alta
          ombroE: { frente: 20 * f * env }, ombroD: { frente: -20 * f * env },
          cotoveloD: { dobra: 10 * env }, cotoveloE: { dobra: 10 * env },
          quadril: { giro: 6 * f * env }, peito: { giro: -7 * f * env }, coluna: { frente: 3 * env },
        };
      };
    },
    sonsDe(ctx) { const c = this.chaves(ctx); return c.slice(1, -1).map((k) => ({ t: k.t, som: 'passo' })); },
  },

  acenar: {
    descricao: 'Levanta a mão direita e acena três vezes.',
    inicio: 'em_pe', final: 'em_pe', impacto: 0.6,
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe;
      const aceno = (dobra, lado) => derivar(b, { ombroD: { abre: 80, giro: 90, frente: 10 }, cotoveloD: { dobra }, maoD: { fecha: 0, lado }, cabeca: { lado: 8 }, peito: { lado: -4 }, rosto: { boca: 'sorriso', sobrancelha: 0.3 } });
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.3, curva: 'antecipa', pose: derivar(b, { ombroD: { abre: 30, giro: 40 }, cotoveloD: { dobra: 60 }, rosto: { boca: 'sorriso' } }) },
        { t: 0.6, curva: 'sai', pose: aceno(95, 0) },
        { t: 0.82, pose: aceno(118, 18) }, { t: 1.04, pose: aceno(82, -18) },
        { t: 1.26, pose: aceno(118, 18) }, { t: 1.48, pose: aceno(82, -18) },
        { t: 1.7, pose: aceno(100, 0) },
        { t: 2.3, curva: 'suave', pose: b },
      ];
    },
  },

  assustar: {
    descricao: 'Leva um susto: recua um passo, braços para cima, olhos arregalados; depois se recompõe.',
    inicio: 'em_pe', final: 'em_pe', impacto: 0.35, sons: [{ t: 0.35, som: 'susto' }],
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe, s = solas(b, m);
      const susto = derivar(b, {
        corpo: { z: -0.12, estica: 0.07 }, desl: { y: -0.06 }, coluna: { frente: -10 }, peito: { frente: -8 }, cabeca: { frente: -12 },
        ombroD: { frente: 50, abre: 28 }, ombroE: { frente: 50, abre: 28 }, cotoveloD: { dobra: 118 }, cotoveloE: { dobra: 118 },
        maoD: { fecha: 0, dobra: -45 }, maoE: { fecha: 0, dobra: -45 }, rosto: { boca: 'aberta', olhos: 1.4, sobrancelha: 1 },
      });
      return [
        { t: 0, pose: b, ...s },
        { t: 0.22, curva: 'suave', pose: derivar(b, { desl: { y: -0.04 }, rosto: { olhos: 1.1 } }) },
        { t: 0.35, curva: 'estalo', pose: susto, peDAlvo: somar(s.peDAlvo, [0, 0, -0.26]) },
        { t: 0.55, curva: 'sai', pose: derivar(susto, { corpo: { estica: -0.03 }, desl: { y: -0.09 } }) },
        { t: 1.2 },
        { t: 1.9, curva: 'suave', pose: derivar(b, { corpo: { z: -0.13 } }), peEAlvo: somar(s.peEAlvo, [0, 0, -0.26]) },
      ];
    },
  },

  sentar_triste: {
    descricao: 'Senta no assento atrás dele, curva o corpo, cabeça baixa e rosto triste.',
    inicio: 'em_pe', final: 'sentado_triste', sons: [{ t: 1.9, som: 'suspiro' }],
    cena: { assento: { z: -0.35 } },
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe, s = solas(b, m);
      const recuo = -0.33;
      return [
        { t: 0, pose: b, ...s },
        { t: 0.5, curva: 'antecipa', pose: derivar(b, { desl: { y: -0.12, z: 0.02 }, coluna: { frente: 22 }, peito: { frente: 8 }, ...bracos(20, 10, 40) }) },
        { t: 1.1, curva: 'sai', pose: derivar(E.sentado, { corpo: { z: recuo, estica: -0.03 }, coluna: { frente: 10 } }) },
        { t: 1.35, curva: 'suave', pose: derivar(E.sentado, { corpo: { z: recuo } }) },
        { t: 2.2, curva: 'suave', pose: derivar(E.sentado_triste, { corpo: { z: recuo } }) },
        { t: 3.0 },
      ];
    },
  },

  comemorar: {
    descricao: 'Agacha, pula com os braços para cima, aterrissa e soca o ar.',
    inicio: 'em_pe', final: 'em_pe', impacto: 0.74, sons: [{ t: 0.74, som: 'aterrissa' }],
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe, s = solas(b, m);
      return [
        { t: 0, pose: b, ...s },
        { t: 0.3, curva: 'suave', pose: derivar(b, { desl: { y: -0.14 }, corpo: { estica: -0.06 }, coluna: { frente: 14 }, ombroD: { frente: -25 }, ombroE: { frente: -25 }, cotoveloD: { dobra: 20 }, cotoveloE: { dobra: 20 }, rosto: { boca: 'sorriso' } }) },
        { t: 0.52, curva: 'sai', pernas: 'fk', pose: derivar(b, {
          corpo: { y: 0.2, estica: 0.08 }, desl: { y: -0.02 }, coxaD: { frente: 25 }, coxaE: { frente: 10 }, joelhoD: { dobra: 45 }, joelhoE: { dobra: 30 },
          ombroD: { frente: 165, abre: 25 }, ombroE: { frente: 165, abre: 25 }, cotoveloD: { dobra: 15 }, cotoveloE: { dobra: 15 },
          maoD: { fecha: 90 }, maoE: { fecha: 90 }, cabeca: { frente: -10 }, rosto: { boca: 'aberta', sobrancelha: 0.5 } }) },
        { t: 0.74, curva: 'entra', ...s, pose: derivar(b, { desl: { y: -0.12 }, corpo: { estica: -0.07 }, coluna: { frente: 10 }, ...bracos(60, 20, 60, 90), rosto: { boca: 'aberta' } }) },
        { t: 1.0, curva: 'sai', pose: derivar(b, { desl: { y: -0.05 }, ombroD: { frente: 150, abre: 30 }, cotoveloD: { dobra: 30 }, maoD: { fecha: 90 }, rosto: { boca: 'sorriso', sobrancelha: 0.4 } }) },
        { t: 1.25, curva: 'suave', pose: derivar(b, { desl: { y: -0.06 }, ombroD: { frente: 120, abre: 30 }, cotoveloD: { dobra: 80 }, maoD: { fecha: 90 }, rosto: { boca: 'sorriso' } }) },
        { t: 1.9, curva: 'suave', pose: b },
      ];
    },
  },

  // ------------------------------------------------------------ Gabriel (roteiro)
  sentado_celular: {
    descricao: 'Sentado, pega o celular com as duas mãos, cabeça baixa, polegar rolando a tela.',
    inicio: 'sentado', final: 'sentado_celular', objetos: [{ id: 'celular', mao: 'D' }], cena: { assento: { z: -0.02 } },
    chaves({ medidas: m }) {
      const E = estados(m), b = E.sentado, s = solas(b, m);
      const om = ombroMundo(E.sentado_celular, m, 'D'), oe = ombroMundo(E.sentado_celular, m, 'E');
      const c = [0, (om[1] + oe[1]) / 2 - 0.27 * m.H / 1.7, om[2] + 0.24];
      const maos = { maoDAlvo: add(c, [-0.07, -0.05, -0.02]), maoEAlvo: add(c, [0.07, -0.05, -0.02]) };
      const rola = (d) => derivar(E.sentado_celular, { maoD: { dobra: d } });
      return [
        { t: 0, pose: b, ...s },
        { t: 0.6, curva: 'suave', pose: E.sentado_celular, ...maos },
        { t: 1.1, pose: rola(-12) }, { t: 1.3, pose: rola(0) }, { t: 2.0, pose: rola(-12) }, { t: 2.2, pose: rola(0) },
        { t: 2.6, pose: E.sentado_celular },
      ];
    },
  },

  rir_sentado: {
    descricao: 'Sentado com o celular, ri: cabeça para trás, ombros sacudindo.',
    inicio: 'sentado_celular', final: 'sentado_celular', impacto: 0.25, sons: [{ t: 0.2, som: 'risada' }],
    objetos: [{ id: 'celular', mao: 'D' }], cena: { assento: { z: -0.02 } },
    chaves(ctx) {
      const m = ctx.medidas, E = estados(m), b = E.sentado_celular;
      const k0 = ATUACOES.sentado_celular.chaves(ctx)[1];
      const ri = (f) => derivar(b, { cabeca: { frente: -14 + f }, pescoco: { frente: -6 }, peito: { frente: -8 + f * 0.5 }, ombroD: { frente: 40 + f }, ombroE: { frente: 40 + f }, rosto: { boca: 'aberta', olhos: 0.45, sobrancelha: 0.5 } });
      return [
        { t: 0, pose: b, ...solas(E.sentado, m), maoDAlvo: k0.maoDAlvo, maoEAlvo: k0.maoEAlvo },
        { t: 0.25, curva: 'estalo', pose: ri(0) }, { t: 0.4, pose: ri(6) }, { t: 0.55, pose: ri(0) }, { t: 0.7, pose: ri(6) }, { t: 0.85, pose: ri(1) },
        { t: 1.5, curva: 'suave', pose: b },
      ];
    },
  },

  levantar: {
    descricao: 'Levanta do assento: inclina para a frente e sobe; termina em pé sobre os pés.',
    inicio: 'sentado', final: 'em_pe', cena: { assento: { z: -0.02 } },
    chaves({ medidas: m }) {
      const E = estados(m), b = E.sentado, s = solas(b, m);
      const zPe = (s.peDAlvo[2] + s.peEAlvo[2]) / 2;
      return [
        { t: 0, pose: b, ...s },
        { t: 0.45, curva: 'antecipa', pose: derivar(b, { coluna: { frente: 32 }, peito: { frente: 10 }, desl: { z: 0.08 }, ...bracos(25, 8, 40) }) },
        { t: 0.95, curva: 'sai', pose: derivar(E.em_pe, { corpo: { z: zPe - 0.03 }, desl: { y: -0.08 }, coluna: { frente: 12 } }) },
        { t: 1.4, curva: 'suave', pose: derivar(E.em_pe, { corpo: { z: zPe - 0.03 } }) },
      ];
    },
  },

  mao_no_cadeado: {
    descricao: 'Diante da grade, leva a mão direita ao cadeado e gira a chave.',
    inicio: 'em_pe', final: 'no_cadeado', impacto: 0.45, sons: [{ t: 0.75, som: 'chave_cadeado' }],
    cena: { grade: { z: 0.5 }, cadeado: [-0.08, 1.02, 0.47] },
    chaves({ medidas: m, cadeado = [-0.08, 1.02, 0.47] }) {
      const E = estados(m), b = E.em_pe;
      const alvo = somar(cadeado, [0, 0.02, -0.06]);
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.45, curva: 'sai', pose: E.no_cadeado, maoDAlvo: alvo },
        { t: 0.75, pose: derivar(E.no_cadeado, { maoD: { fecha: 80, giro: 70 } }) },
        { t: 1.0, pose: E.no_cadeado },
        { t: 1.4 },
      ];
    },
  },

  // ------------------------------------------------------------ Larissa (roteiro)
  olhar_fixo: {
    descricao: 'Parada, sorriso congelado, não pisca; a cabeça pende devagar.',
    inicio: 'em_pe', final: 'olhar_fixo',
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe;
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.6, curva: 'suave', pose: derivar(b, { rosto: { boca: 'sorriso', estranho: 0.3 } }) },
        { t: 3.0, curva: 'suave', pose: E.olhar_fixo },
      ];
    },
  },

  larissa_grade: {
    descricao: 'A cliente se joga contra a grade, agarra as barras e inclina a cabeça demais (começo da revelação).',
    inicio: 'em_pe', final: 'na_grade', impacto: 1.5,
    sons: [{ t: 1.36, som: 'passo' }, { t: 1.5, som: 'grade_impacto' }],
    cena: { grade: { z: 0.72 } },
    chaves({ medidas: m, grade = { z: 0.72, alturaMao: 1.16, abertura: 0.2 } }) {
      const E = estados(m);
      const B = derivar(E.em_pe, { rosto: { boca: 'sorriso' } });
      const s = solas(B, m);
      const barra = (lado) => [lado * grade.abertura, grade.alturaMao, grade.z - 0.035];
      return [
        { t: 0, pose: E.em_pe, ...s },
        { t: 0.35, curva: 'suave', pose: B },
        { t: 0.7 },                                                         // parada, olhando
        { t: 1.1, curva: 'suave', pose: derivar(B, {                       // antecipação: recua e encolhe
          corpo: { estica: -0.05 }, desl: { y: -0.09, z: -0.04 }, coluna: { frente: -7 }, peito: { frente: -5 }, cabeca: { frente: 6 },
          ...bracos(22, 12, 75, 10), rosto: { boca: 'neutra', olhos: 1.1 } }) },
        { t: 1.36, curva: 'entra', peDAlvo: somar(s.peDAlvo, [0, 0, 0.24]), pose: derivar(B, {   // impulso: passo à frente
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
        { t: 3.7, curva: 'suave', pose: E.na_grade },                      // inclinada demais, olhar morto
        { t: 4.2 },
      ];
    },
  },

  revelar_na_grade: {
    descricao: 'Agarrada na grade, endireita a cabeça num estalo encarando a câmera e o rosto se revela.',
    inicio: 'na_grade', final: 'revelada', impacto: 0.35, sons: [{ t: 0.35, som: 'estalo_pescoco' }],
    cena: { grade: { z: 0.72 } },
    chaves(ctx) {
      const m = ctx.medidas, E = estados(m), b = E.na_grade;
      const s = solas(derivar(E.em_pe, {}), m);
      return [
        { t: 0, pose: b, peDAlvo: [s.peDAlvo[0], 0, s.peDAlvo[2] + 0.24], peEAlvo: s.peEAlvo, maoDAlvo: [-0.2, 1.16, 0.685], maoEAlvo: [0.2, 1.16, 0.685] },
        { t: 0.2, curva: 'suave', pose: derivar(b, { cabeca: { lado: 40, frente: 8 } }) },
        { t: 0.35, curva: 'estalo', pose: derivar(E.revelada, { rosto: { estranho: 0.75 } }) },
        { t: 2.2, curva: 'suave', pose: E.revelada },
      ];
    },
  },

  olhar_camera: {
    descricao: 'Vira a cabeça num estalo para um ponto (a câmera) e a revelação avança. Parâmetros: alvo [x,y,z], estranho.',
    inicio: 'em_pe', final: 'olhando', impacto: 0.4, sons: [{ t: 0.4, som: 'estalo_pescoco' }],
    chaves(ctx) {
      const m = ctx.medidas, E = estados(m, ctx), b = E.em_pe;
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.25, curva: 'suave', pose: derivar(b, { cabeca: { giro: -4, frente: 3 } }) },
        { t: 0.4, curva: 'estalo', pose: E.olhando },
        { t: 1.6 },
      ];
    },
  },

  // ------------------------------------------------------------ Eduardo (mãos em 1ª pessoa)
  pegar_latas: {
    descricao: 'Vira para a geladeira à direita, pega a lata e volta segurando na frente do peito.',
    inicio: 'em_pe', final: 'segurando_lata', impacto: 1.15, sons: [{ t: 0.55, som: 'porta_geladeira' }, { t: 1.15, som: 'lata' }],
    objetos: [{ id: 'lata', mao: 'D', de: 1.15 }], cena: { geladeira: { x: -0.72, z: 0.3 } },
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe;
      const vira = { cabeca: { giro: -50, frente: 10 }, peito: { giro: -18 }, coluna: { giro: -10 } };
      // alvos a partir do ombro direito (girado para a geladeira), a 80% e 90% do braço
      const om = ombroMundo(derivar(b, vira), m, 'D'), braco = m.bracoLen + m.anteLen;
      const naDirecao = (d, f) => { const n = Math.hypot(...d); return add(om, d.map((v) => (v / n) * braco * f)); };
      const porta = naDirecao([-0.45, -0.5, 0.75], 0.8), lata = naDirecao([-0.5, -0.6, 0.65], 0.9);
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.55, curva: 'suave', pose: derivar(b, { ...vira, ombroD: { frente: 60, abre: 20 }, cotoveloD: { dobra: 40 }, maoD: { fecha: 0 } }), maoDAlvo: porta },
        { t: 0.9, curva: 'suave', pose: derivar(b, { ...vira, ombroD: { frente: 60, abre: 20 }, cotoveloD: { dobra: 30 }, maoD: { fecha: 0 } }), maoDAlvo: lata },
        { t: 1.15, curva: 'estalo', pose: derivar(b, { ...vira, ombroD: { frente: 60, abre: 20 }, cotoveloD: { dobra: 30 }, maoD: { fecha: 85 } }) },
        { t: 1.7, curva: 'suave', pose: E.segurando_lata, maoDAlvo: naFrenteDosOlhos(m, -0.1, 0.33, 0.3) },
        { t: 2.2 },
      ];
    },
  },

  segurar_celular: {
    descricao: 'Levanta o celular na mão direita e olha para a tela.',
    inicio: 'em_pe', final: 'olhando_celular', impacto: 0.5, objetos: [{ id: 'celular', mao: 'D' }],
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe;
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.5, curva: 'sai', pose: E.olhando_celular, maoDAlvo: naFrenteDosOlhos(m, -0.03, 0.3, 0.27) },
        { t: 1.5 },
      ];
    },
  },

  estender_mao: {
    descricao: 'Estende a mão esquerda aberta para a frente ("espera!").',
    inicio: 'em_pe', final: 'mao_estendida', impacto: 0.45,
    chaves({ medidas: m }) {
      const E = estados(m), b = E.em_pe;
      return [
        { t: 0, pose: b, ...solas(b, m) },
        { t: 0.25, curva: 'suave', pose: derivar(b, { ombroE: { frente: 15 }, cotoveloE: { dobra: 50 }, coluna: { frente: -3 } }) },
        { t: 0.45, curva: 'estalo', pose: E.mao_estendida, maoEAlvo: naFrenteDosOlhos(m, 0.13, 0.17, 0.5) },
        { t: 1.3 },
      ];
    },
  },
};

export function chavesDe(nome, contexto) {
  const a = ATUACOES[nome];
  if (!a) throw new Error(`Atuação "${nome}" não existe. Existentes: ${Object.keys(ATUACOES).join(', ')}`);
  return a.chaves(contexto);
}
export function camadasDe(nome, contexto) {
  const a = ATUACOES[nome];
  return a.camada ? [a.camada(contexto)] : [];
}
export function sonsDe(nome, contexto) {
  const a = ATUACOES[nome];
  return a.sonsDe ? a.sonsDe(contexto) : (a.sons || []);
}

// Leva as chaves (escritas na origem, olhando para +z) para uma marca do cenário.
export function noLugar(chaves, { x = 0, z = 0, giro = 0 } = {}) {
  const r = (giro * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const ponto = (p) => (p ? [x + c * p[0] + s * p[2], p[1], z - s * p[0] + c * p[2]] : p);
  return chaves.map((k) => {
    const n = { ...k };
    if (k.pose && k.pose !== 'pausa') {
      const cp = k.pose.corpo || {};
      const q = ponto([cp.x || 0, 0, cp.z || 0]);
      n.pose = { ...k.pose, corpo: { ...cp, x: q[0], z: q[2], giro: (cp.giro || 0) + giro } };
    }
    for (const a of ['peDAlvo', 'peEAlvo', 'maoDAlvo', 'maoEAlvo']) if (a in k) n[a] = ponto(k[a]);
    return n;
  });
}

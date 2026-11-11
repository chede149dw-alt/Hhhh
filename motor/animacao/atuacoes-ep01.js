// Atuações do episódio 1 da terra ("E se você acordasse controlando a terra?"). Entram em ATUACOES (atuacoes.js).
// Convenções das poses: ver boneco.js (ombro x<0 = braço à frente; ombro_e z>0 / ombro_d z<0 = braço para o lado;
// cotovelo x<0 dobra para a frente; coluna x>0 inclina para a frente; y>0 gira para a esquerda dele).
// Posições (ikPes, alvos, corpo) são no espaço do "palco" do ator (a marca dele no cenário).
import { REPOUSO } from '../personagem/boneco.js';

const R = REPOUSO.juntas;
const PES = { peEAlvo: [0.1, 0, 0], peDAlvo: [-0.1, 0, 0], ikPes: 1 };
const pose = (o) => ({ estica: 1, altura: 0, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'neutro', ...o, juntas: { ...R, ...(o.juntas || {}) } });
const fim = (pausa, extra = {}) => ({ ...extra, ...pausa, juntas: { ...pausa.juntas } });

// ---------------- pausas (poses em que as atuações terminam paradas) ----------------
// deitado de costas na cama: o quadril gira 90° para trás; pernas e braços soltos (sem IK)
const deitado = pose({ ikPes: 0, altura: -0.04, juntas: { quadril: [-88, 0, 0], coxa_e: [-6, 0, 4], coxa_d: [-4, 0, -4], joelho_e: [8, 0, 0], joelho_d: [6, 0, 0],
  pe_e: [-50, 0, 0], pe_d: [-50, 0, 0], cabeca: [14, -24, 0], ombro_e: [0, 0, 12], ombro_d: [0, 0, -14], cotovelo_e: [-20, 0, 0], cotovelo_d: [-20, 0, 0] }, rosto: 'dormindo' });
const sentadoCama = { peEAlvo: [0.12, 0, 0.3], peDAlvo: [-0.12, 0, 0.28], ikPes: 1 };
export const PAUSAS_EP01 = {
  deitado,
  deitado_tapa: pose({ ...deitado, juntas: { ...deitado.juntas, ombro_d: [0, 0, -138], cotovelo_d: [-10, 0, 0], cabeca: [10, -30, 0] }, maos: { e: 'relaxada', d: 'aberta' }, rosto: 'cansado' }),
  sentado_espanto: pose({ altura: -0.12, juntas: { coluna: [-6, 0, 0], peito: [-4, 0, 0], cabeca: [-4, 0, 0], ombro_e: [-30, 0, 24], cotovelo_e: [-40, 0, 0], ombro_d: [-30, 0, -24], cotovelo_d: [-40, 0, 0] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto' }),
  olha_vaso: pose({ altura: -0.12, juntas: { coluna: [8, 0, 0], cabeca: [-2, 22, 0], ombro_e: [-50, 0, 12], cotovelo_e: [-80, 0, 0], ombro_d: [-50, 0, -12], cotovelo_d: [-80, 0, 0], mao_e: [0, 0, -30], mao_d: [0, 0, 30] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'curioso' }),
  mao_estendida: pose({ altura: -0.12, juntas: { coluna: [6, 0, 0], cabeca: [12, -10, 0], ombro_d: [-62, 0, -6], cotovelo_d: [-40, 0, 0], mao_d: [0, 0, 70], ombro_e: [-10, 0, 10], cotovelo_e: [-30, 0, 0] },
    maos: { e: 'relaxada', d: 'aberta' }, rosto: 'curioso' }),
  segura_esfera: pose({ ...PES, altura: -0.04, juntas: { coluna: [-4, 0, 0], cabeca: [-10, 0, 0], ombro_e: [-60, 0, 22], cotovelo_e: [-70, 0, 0], ombro_d: [-60, 0, -22], cotovelo_d: [-70, 0, 0], mao_e: [0, 0, -20], mao_d: [0, 0, 20] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'rindo' }),
  chama: pose({ ...PES, juntas: { coluna: [10, 0, 0], cabeca: [-8, 0, 0], ombro_d: [-70, 0, -40], cotovelo_d: [-130, 0, 0], mao_d: [0, -40, 0], ombro_e: [-20, 0, 30], cotovelo_e: [-60, 0, 0] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'raiva' }),
  maos_cintura: pose({ ...PES, maoEAlvo: [0.19, 0.86, -0.02], maoDAlvo: [-0.19, 0.86, -0.02], ikMaos: 1, juntas: { coluna: [-4, 0, 0], peito: [0, 0, 4], cabeca: [-6, 0, -8] },
    maos: { e: 'segura', d: 'segura' }, rosto: 'raiva' }),
  coca_cabeca: pose({ ...PES, juntas: { cabeca: [4, 0, 10], ombro_d: [-150, 0, -30], cotovelo_d: [-120, 0, 0], ombro_e: [0, 0, 8] }, maos: { e: 'relaxada', d: 'garra' }, rosto: 'sem_graca' }),
  firme: pose({ peEAlvo: [0.17, 0, 0.02], peDAlvo: [-0.17, 0, -0.02], ikPes: 1, altura: -0.1, juntas: { coluna: [12, 0, 0], cabeca: [-8, 0, 0], ombro_e: [-20, 0, 30], cotovelo_e: [-50, 0, 0], ombro_d: [-20, 0, -30], cotovelo_d: [-50, 0, 0] },
    maos: { e: 'punho', d: 'punho' }, rosto: 'determinado' }),
  surf: pose({ ikPes: 0, altura: 0, juntas: { quadril: [0, 70, 0], coluna: [8, -40, 0], cabeca: [-6, -36, 0], coxa_e: [-25, 0, 18], joelho_e: [45, 0, 0], pe_e: [-18, 0, 0], coxa_d: [-10, 0, -22], joelho_d: [35, 0, 0], pe_d: [-20, 0, 0],
    ombro_e: [0, 0, 80], cotovelo_e: [-15, 0, 0], ombro_d: [0, 0, -75], cotovelo_d: [-20, 0, 0] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'rindo' }),
  boquiaberto: pose({ ...PES, juntas: { coluna: [-6, 0, 0], cabeca: [-6, 0, 0], ombro_d: [-40, 0, -12], cotovelo_d: [-50, 0, 0], ombro_e: [-10, 0, 14] }, maos: { e: 'relaxada', d: 'aberta' }, rosto: 'espanto' }),
  tropeco: pose({ peEAlvo: [0.12, 0, 0.55], peDAlvo: [-0.1, 0, 0.15], ikPes: 1, corpo: { z: 0.4 }, altura: -0.12, juntas: { coluna: [26, 0, 0], cabeca: [-14, 0, 0], ombro_e: [-70, 0, 30], cotovelo_e: [-20, 0, 0], ombro_d: [-60, 0, -30], cotovelo_d: [-20, 0, 0] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto' }),
  desespero: pose({ ...PES, altura: -0.05, maoEAlvo: [0.14, 1.4, 0.04], maoDAlvo: [-0.14, 1.4, 0.04], ikMaos: 1, juntas: { coluna: [10, 0, 0], cabeca: [8, 0, 0] }, maos: { e: 'garra', d: 'garra' }, rosto: 'medo' }),
  conferindo: pose({ ...PES, altura: -0.04, juntas: { coluna: [6, 0, 0], cabeca: [0, 6, 0], ombro_d: [-20, 0, -14], cotovelo_d: [-40, 0, 0] }, maos: { e: 'relaxada', d: 'aberta' }, rosto: 'determinado' }),
  comando: pose({ peEAlvo: [0.15, 0, 0.05], peDAlvo: [-0.14, 0, -0.08], ikPes: 1, altura: -0.06, juntas: { coluna: [8, 10, 0], cabeca: [10, 14, 0], ombro_d: [-100, 0, -10], cotovelo_d: [-12, 0, 0], mao_d: [0, 0, 80], ombro_e: [-10, 0, 14] },
    maos: { e: 'relaxada', d: 'aberta' }, rosto: 'determinado' }),
  sorriso_canto: pose({ ...PES, juntas: { cabeca: [-4, 8, 10], ombro_e: [0, 0, 6], ombro_d: [0, 0, -6] }, rosto: 'feliz' }),
  medo_baixo: pose({ ...PES, altura: -0.08, juntas: { coluna: [-8, 0, 0], cabeca: [26, 0, 0], ombro_e: [-35, 0, 30], cotovelo_e: [-40, 0, 0], ombro_d: [-35, 0, -30], cotovelo_d: [-40, 0, 0] },
    maos: { e: 'aberta', d: 'aberta' }, rosto: 'medo' }),
  segura_celular: pose({ ...PES, juntas: { cabeca: [14, 0, 0], ombro_d: [-50, 0, -8], cotovelo_d: [-70, 0, 0], mao_d: [0, 0, 60], ombro_e: [-30, 0, 12], cotovelo_e: [-50, 0, 0] }, maos: { e: 'aberta', d: 'segura' }, rosto: 'espanto' }),
};
const P = PAUSAS_EP01;

// ---------------- atuações ----------------
export const ATUACOES_EP01 = {
  dormindo: { descricao: 'Dormindo de costas na cama (respira)', fim: 'deitado', impacto: null, sons: [],
    chaves: () => [{ t: 0, nome: 'dormindo', pose: fim(P.deitado, { piscar: 1 }) }, { t: 2, nome: 'dormindo', pose: fim(P.deitado, { piscar: 1 }) }] },
  tapa_deitado: { descricao: 'Deitado, levanta o braço direito e dá um tapa no despertador', fim: 'deitado_tapa', impacto: 0.55, sons: [{ t: 0.55, som: 'impacto' }],
    chaves: () => [
      { t: 0, nome: 'dormindo', pose: fim(P.deitado, { piscar: 1 }) },
      { t: 0.35, nome: 'levanta', pose: pose({ ...P.deitado, juntas: { ...P.deitado.juntas, ombro_d: [-110, 0, -70], cotovelo_d: [-40, 0, 0] }, maos: { e: 'relaxada', d: 'aberta' }, rosto: 'cansado' }) },
      { t: 0.55, nome: 'tapa', curva: 'estalo', pose: fim(P.deitado_tapa) },
      { t: 1.2, nome: 'fica', pose: fim(P.deitado_tapa) }] },
  acorda_assustado: { descricao: 'Sentado na beira da cama, olha em volta assustado', fim: 'sentado_espanto', impacto: 0.2, sons: [],
    chaves: () => [
      { t: 0, nome: 'susto', pose: pose({ ...sentadoCama, ...P.sentado_espanto, juntas: { ...P.sentado_espanto.juntas, coluna: [-14, 0, 0], ombro_e: [-50, 0, 34], ombro_d: [-50, 0, -34] } }) },
      { t: 0.5, nome: 'olha', pose: pose({ ...sentadoCama, ...P.sentado_espanto, juntas: { ...P.sentado_espanto.juntas, cabeca: [-6, 30, 0] } }) },
      { t: 1.0, nome: 'olha', pose: pose({ ...sentadoCama, ...P.sentado_espanto, juntas: { ...P.sentado_espanto.juntas, cabeca: [-4, -28, 0] } }) },
      { t: 1.6, nome: 'parado', pose: fim(P.sentado_espanto, sentadoCama) }] },
  olha_maos: { descricao: 'Sentado, olha as mãos; depois os olhos e a cabeça vão para o vaso (reação em 3 tempos)', fim: 'olha_vaso', impacto: 1.4, sons: [],
    chaves: () => [
      { t: 0, nome: 'sentado', pose: fim(P.sentado_espanto, sentadoCama) },
      { t: 0.45, nome: 'mãos', pose: pose({ ...sentadoCama, ...P.olha_vaso, juntas: { ...P.olha_vaso.juntas, cabeca: [18, 0, 0] }, rosto: 'espanto' }) },
      { t: 1.2, nome: 'olhos', pose: pose({ ...sentadoCama, ...P.olha_vaso, juntas: { ...P.olha_vaso.juntas, cabeca: [14, 6, 0] }, rosto: 'curioso' }) },
      { t: 1.6, nome: 'cabeça vira', pose: fim(P.olha_vaso, sentadoCama) }] },
  dedos: { descricao: 'Mão direita estendida, palma para cima, mexendo os dedos', fim: 'mao_estendida', impacto: 0.6, sons: [],
    chaves: () => ['aberta', 'garra', 'aberta', 'segura', 'aberta'].map((m, i) => ({ t: i * 0.35, nome: 'dedos', pose: i === 4 ? fim(P.mao_estendida, sentadoCama)
      : pose({ ...sentadoCama, ...P.mao_estendida, maos: { e: 'relaxada', d: m } }) })) },
  rir_segurando: { descricao: 'De pé, rindo, mãos para cima segurando a esfera (ela cresce)', fim: 'segura_esfera', impacto: 0.6, sons: [],
    chaves: () => [
      { t: 0, nome: 'segura', pose: pose({ ...P.segura_esfera, rosto: 'feliz' }) },
      { t: 0.3, nome: 'ri', pose: pose({ ...P.segura_esfera, juntas: { ...P.segura_esfera.juntas, coluna: [-10, 0, 0], cabeca: [-18, 0, 0] } }) },
      { t: 0.6, nome: 'ri', pose: pose({ ...P.segura_esfera, juntas: { ...P.segura_esfera.juntas, coluna: [-2, 0, 0], cabeca: [-6, 0, 0] } }) },
      { t: 0.9, nome: 'ri', pose: pose({ ...P.segura_esfera, juntas: { ...P.segura_esfera.juntas, coluna: [-10, 0, 0], cabeca: [-18, 0, 0] } }) },
      { t: 1.3, nome: 'segura', pose: fim(P.segura_esfera) }] },
  mae_chama: { descricao: 'Mãe abre a porta e chama com a mão perto da boca', fim: 'chama', impacto: 0.3, sons: [],
    chaves: () => [{ t: 0, nome: 'entra', pose: pose({ ...PES, juntas: { ombro_e: [-40, 0, 20], cotovelo_e: [-50, 0, 0] }, rosto: 'neutro' }) },
      { t: 0.35, nome: 'chama', pose: fim(P.chama) }, { t: 1.2, nome: 'chama', pose: fim(P.chama) }] },
  maos_cintura: { descricao: 'Mãe de mãos na cintura, brava', fim: 'maos_cintura', impacto: 0.3, sons: [],
    chaves: () => [{ t: 0, nome: 'cruza', pose: pose({ ...PES, juntas: { coluna: [4, 0, 0] }, rosto: 'raiva' }) }, { t: 0.35, nome: 'cintura', pose: fim(P.maos_cintura) }, { t: 1.2, nome: 'cintura', pose: fim(P.maos_cintura) }] },
  sem_graca: { descricao: 'Sorriso amarelo, coçando a cabeça', fim: 'coca_cabeca', impacto: 0.4, sons: [],
    chaves: () => [{ t: 0, nome: 'parado', pose: pose({ ...PES, rosto: 'sem_graca' }) }, { t: 0.45, nome: 'coça', pose: fim(P.coca_cabeca) },
      { t: 0.7, nome: 'coça', pose: pose({ ...P.coca_cabeca, juntas: { ...P.coca_cabeca.juntas, cotovelo_d: [-128, 0, 0] } }) }, { t: 1.0, nome: 'coça', pose: fim(P.coca_cabeca) }] },
  pisao: { descricao: 'Bate o pé direito no chão com força', fim: 'firme', impacto: 0.45, sons: [{ t: 0.45, som: 'impacto_terra' }],
    chaves: () => [
      { t: 0, nome: 'parado', pose: pose({ ...PES, rosto: 'determinado' }) },
      { t: 0.3, nome: 'ergue o pé', pose: pose({ peEAlvo: [0.15, 0, 0.02], peDAlvo: [-0.16, 0.28, 0.05], ikPes: 1, altura: 0.0, juntas: { coluna: [-4, 0, 0], ombro_e: [-10, 0, 40], ombro_d: [-10, 0, -40] }, maos: { e: 'punho', d: 'punho' }, rosto: 'raiva' }) },
      { t: 0.45, nome: 'pisão', curva: 'estalo', pose: pose({ ...P.firme, altura: -0.16, estica: 0.96 }) },
      { t: 0.9, nome: 'firme', pose: fim(P.firme) }] },
  surfar: { descricao: 'Em pé de lado na onda de terra, braços abertos, rindo, andando rua abaixo', fim: 'surf', impacto: 0.3, sons: [{ t: 0, som: 'tremor' }],
    chaves: (o = {}) => { const d = o.distancia || 7, T = o.tempo || 2.4;
      return [{ t: 0, nome: 'sobe', pose: { ...fim(P.surf), corpo: { z: 0, y: 0.45 } } },
        { t: T * 0.5, nome: 'equilibra', pose: { ...pose({ ...P.surf, juntas: { ...P.surf.juntas, coluna: [14, -40, 8], ombro_e: [0, 0, 95], ombro_d: [0, 0, -60] } }), corpo: { z: d * 0.5, y: 0.5 } } },
        { t: T, nome: 'surf', pose: { ...fim(P.surf), corpo: { z: d, y: 0.45 } } }]; } },
  derruba_cafe: { descricao: 'Vizinho segurando o café, fica de boca aberta e deixa o copo cair', fim: 'boquiaberto', impacto: 0.5, eventos: { solta: 0.5 }, sons: [],
    chaves: () => [{ t: 0, nome: 'toma café', pose: pose({ ...PES, juntas: { ombro_d: [-30, 0, -10], cotovelo_d: [-110, 0, 0], mao_d: [0, 0, 60] }, maos: { e: 'relaxada', d: 'segura' } }) },
      { t: 0.35, nome: 'vê', pose: pose({ ...PES, juntas: { ombro_d: [-30, 0, -10], cotovelo_d: [-100, 0, 0], cabeca: [-8, 0, 0] }, maos: { e: 'relaxada', d: 'segura' }, rosto: 'espanto' }) },
      { t: 0.5, nome: 'solta', pose: fim(P.boquiaberto) }, { t: 1.2, nome: 'boquiaberto', pose: fim(P.boquiaberto) }] },
  tropecar: { descricao: 'Andando com o celular, tropeça para a frente e o celular voa da mão', fim: 'tropeco', impacto: 0.35, eventos: { solta: 0.35 }, sons: [{ t: 0.3, som: 'passo' }, { t: 0.6, som: 'passo' }],
    chaves: () => [
      { t: 0, nome: 'anda', pose: pose({ ...PES, juntas: { cabeca: [16, 0, 0], ombro_d: [-50, 0, -8], cotovelo_d: [-70, 0, 0] }, maos: { e: 'relaxada', d: 'segura' }, rosto: 'neutro' }) },
      { t: 0.3, nome: 'tropeça', pose: pose({ peEAlvo: [0.1, 0, 0.05], peDAlvo: [-0.1, 0.12, -0.15], ikPes: 1, corpo: { z: 0.15 }, juntas: { coluna: [22, 0, 0], ombro_d: [-80, 0, -10], cotovelo_d: [-30, 0, 0], ombro_e: [-50, 0, 30] }, maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto' }) },
      { t: 0.6, nome: 'cambaleia', pose: fim(P.tropeco) }, { t: 1.2, nome: 'tropeço', pose: fim(P.tropeco) }] },
  desesperar: { descricao: 'Mãos na cabeça, desesperado', fim: 'desespero', impacto: 0.3, sons: [],
    chaves: () => [{ t: 0, nome: 'olha', pose: pose({ ...PES, juntas: { cabeca: [20, 0, 0] }, rosto: 'espanto' }) }, { t: 0.3, nome: 'mãos na cabeça', pose: fim(P.desespero) },
      { t: 0.7, nome: 'balança', pose: pose({ ...P.desespero, juntas: { ...P.desespero.juntas, coluna: [10, 0, 6], cabeca: [8, 0, 10] } }) }, { t: 1.1, nome: 'desespero', pose: fim(P.desespero) }] },
  conferir: { descricao: 'Olha para um lado e para o outro, desconfiado (olhos, cabeça, ajuste)', fim: 'conferindo', impacto: 1.2, sons: [],
    chaves: () => [{ t: 0, nome: 'parado', pose: pose({ ...PES, rosto: 'neutro' }) },
      { t: 0.35, nome: 'esquerda', pose: pose({ ...P.conferindo, juntas: { ...P.conferindo.juntas, cabeca: [0, 50, 0] } }) },
      { t: 0.85, nome: 'direita', pose: pose({ ...P.conferindo, juntas: { ...P.conferindo.juntas, cabeca: [0, -50, 0] } }) },
      { t: 1.25, nome: 'frente', pose: fim(P.conferindo) }] },
  comandar_terra: { descricao: 'Estende a mão para o chão e ergue: a terra obedece', fim: 'comando', impacto: 0.6, eventos: { ergue: 0.6 }, sons: [{ t: 0.3, som: 'terra_sobe' }],
    chaves: () => [{ t: 0, nome: 'aponta', pose: pose({ ...P.comando, juntas: { ...P.comando.juntas, ombro_d: [-60, 0, -10] }, maos: { e: 'relaxada', d: 'aberta' } }) },
      { t: 0.6, nome: 'ergue', curva: 'estalo', pose: fim(P.comando) }, { t: 1.4, nome: 'comando', pose: fim(P.comando) }] },
  sorrir_canto: { descricao: 'Sorri de canto e pisca para a câmera', fim: 'sorriso_canto', impacto: 0.7, sons: [{ t: 0.7, som: 'brilho' }],
    chaves: () => [{ t: 0, nome: 'parado', pose: pose({ ...PES }) }, { t: 0.4, nome: 'sorri', pose: fim(P.sorriso_canto) },
      { t: 0.7, nome: 'pisca', pose: { ...fim(P.sorriso_canto), piscadela: ['e', 1] } }, { t: 1.0, nome: 'sorri', pose: fim(P.sorriso_canto) }] },
  medo_chao: { descricao: 'Olha para o chão rachando, com medo, recuando', fim: 'medo_baixo', impacto: 0.3, sons: [],
    chaves: () => [{ t: 0, nome: 'parado', pose: pose({ ...PES, rosto: 'espanto' }) }, { t: 0.4, nome: 'medo', pose: fim(P.medo_baixo) }, { t: 1.2, nome: 'medo', pose: fim(P.medo_baixo) }] },
  segurar_celular: { descricao: 'Segura o celular sujo de terra, espantado', fim: 'segura_celular', impacto: 0.3, sons: [],
    chaves: () => [{ t: 0, nome: 'segura', pose: pose({ ...P.segura_celular, rosto: 'espanto' }) }, { t: 0.6, nome: 'olha', pose: fim(P.segura_celular) }] },
};

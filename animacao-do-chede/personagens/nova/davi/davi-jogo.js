// DAVI dentro do jogo VALDOR — raça: humano · classe: MAGO que conjura com as MÃOS (sem cajado nem varinha) e também luta
// com a adaga · nível 1, equipamento de iniciante. Mesmo rosto e corpo do Davi (davi.js).
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, davi/davi.js.
// Magia nas mãos: qualquer pose com "_magia: 1" (0 a 1.5 = força do brilho) acende as palmas.
(function () {
  window.DAVI_JOGO_OPCOES = {
    top: { tipo: 'cardiga', cor: 'azulArdosia', corInterna: 'capuzDavi' },
    calca: { tipo: 'reta', cor: 'marromCalca' },
    calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'couroEscuro' },
  };
  window.DAVI_JOGO_EQUIP = {
    capuz: 'capuzDavi', manto: { cor: 'azulArdosia', barra: 'mostarda' },
    cinto: { cor: 'couroEscuro', fivela: 'pedra', bolsa: 'couro' },
    botas: { cor: 'couro', cano: 0.4 }, bracadeira: 'couro',
    magiaMaos: { cor: '111,200,255' }, adagaCinto: true,
  };
  window.DAVI_JOGO_POSES = {
    ...window.POSES_PADRAO,
    conjurando: { vista: 'frente', expressao: 'determinado', angulos: { braco_d: 62, antebraco_d: 48, braco_e: -62, antebraco_e: -48, coxa_d: 4, canela_d: -2, coxa_e: -4, canela_e: 2, cabeca: 0, _magia: 1 } },
    'magia-na-mao': { vista: 'tq', expressao: 'espanto', angulos: { braco_d: 75, antebraco_d: 70, mao_d: -20, braco_e: -4, coxa_d: -3, coxa_e: 3, cabeca: -4, _magia: 0.7 } },
  };
  window.criarDaviJogo = (opcoes = {}, vista = 'frente') => window.equipar(window.criarPersonagem({ ...window.DAVI_OPCOES, ...window.DAVI_JOGO_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.DAVI_JOGO_POSES).map(([k, v]) => [k, v.angulos])) }, vista), window.DAVI_JOGO_EQUIP);
})();

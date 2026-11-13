// DAVI dentro do jogo VALDOR — raça: humano · classe: MAGO (que também luta) · nível 1, equipamento de iniciante.
// Mesmo rosto e corpo do Davi (davi.js). Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, davi/davi.js.
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
    cajado: { mao: 'd', cristal: '#6FC8FF' }, adagaCinto: true,
  };
  window.criarDaviJogo = (opcoes = {}, vista = 'frente') => window.equipar(window.criarDavi({ ...window.DAVI_JOGO_OPCOES, ...opcoes }, vista), window.DAVI_JOGO_EQUIP);
})();

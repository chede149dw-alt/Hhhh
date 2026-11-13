// DAVI dentro do jogo VALDOR — nível 1, roupa de iniciante. Mesmo rosto e corpo do Davi (davi.js).
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, davi/davi.js.
(function () {
  window.DAVI_JOGO_OPCOES = {
    top: { tipo: 'cardiga', cor: 'azulArdosia', corInterna: 'capuzDavi' },
    calca: { tipo: 'reta', cor: 'marromCalca' },
    calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'couroEscuro' },
  };
  window.DAVI_JOGO_EQUIP = {
    capuz: 'capuzDavi', cinto: { cor: 'couroEscuro', fivela: 'pedra', bolsa: 'couro' },
    botas: { cor: 'couro', cano: 0.45 }, bracadeira: 'couro', arma: { tipo: 'adaga', mao: 'd' },
  };
  window.criarDaviJogo = (opcoes = {}, vista = 'frente') => window.equipar(window.criarDavi({ ...window.DAVI_JOGO_OPCOES, ...opcoes }, vista), window.DAVI_JOGO_EQUIP);
})();

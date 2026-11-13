// TÉO dentro do jogo VALDOR — nível 1, roupa de iniciante. Mesmo rosto e corpo do Téo (teo.js).
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, teo/teo.js.
(function () {
  window.TEO_JOGO_OPCOES = {
    top: { tipo: 'cardiga', cor: 'verdeFloresta', corInterna: 'linhoEscuro' },
    calca: { tipo: 'reta', cor: 'caqui' },
    calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'couroEscuro' },
  };
  window.TEO_JOGO_EQUIP = {
    gola: 'couro', cinto: { cor: 'couroEscuro', fivela: 'mostarda' },
    botas: { cor: 'couroEscuro', cano: 0.4 }, arma: { tipo: 'espada-madeira', mao: 'd' },
    escudo: { cor: 'madeira', borda: 'pedra', emblema: 'verdeAgua' },
  };
  window.criarTeoJogo = (opcoes = {}, vista = 'frente') => window.equipar(window.criarTeo({ ...window.TEO_JOGO_OPCOES, ...opcoes }, vista), window.TEO_JOGO_EQUIP);
})();

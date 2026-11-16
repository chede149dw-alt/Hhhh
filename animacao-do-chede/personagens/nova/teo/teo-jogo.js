// TÉO dentro do jogo VALDOR — raça: HOMEM-FERA (aparência humana de dia; transformação só à noite, episódio futuro) · classe: GUARDIÃO · nível 1. Mesmo rosto e corpo do Téo (teo.js).
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
    escudo: { cor: 'madeira', borda: 'pedra', emblema: 'verdeAgua' }, ombreira: { cor: 'couro', rebites: 'pedra' },
  };
  window.criarTeoJogo = (opcoes = {}, vista = 'frente') => window.equipar(window.criarTeo({ ...window.TEO_JOGO_OPCOES, ...opcoes }, vista), window.TEO_JOGO_EQUIP);
  // Parte 3: Colete do Guardião (épico, do loot) — roupa nova
  window.TEO_GUARDIAO_OPCOES = {
    top: { tipo: 'cardiga', cor: 'verdeGuardiao', corInterna: 'linhoEscuro' },
    calca: { tipo: 'reta', cor: 'marromCalca' },
    calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'acoEscuro' },
  };
  window.TEO_GUARDIAO_EQUIP = {
    colete: { cor: 'couroGuardiao', placas: 'acoGuardiao', pelo: 'peloGuardiao' },
    ombreira: { cor: 'acoGuardiao', rebites: 'ouroBordado' }, bracadeira: 'acoGuardiao',
    cinto: { cor: 'couroEscuro', fivela: 'ouroBordado', bolsa: 'couroGuardiao' }, botas: { cor: 'couroEscuro', cano: 0.6 },
    escudo: { cor: 'prata', borda: 'ouroBordado', emblema: 'verdeGuardiao' }, arma: { tipo: 'espada-madeira', mao: 'd' },
  };
  window.criarTeoGuardiao = (opcoes = {}, vista = 'frente') => window.equipar(window.criarTeo({ ...window.TEO_GUARDIAO_OPCOES, ...opcoes }, vista), window.TEO_GUARDIAO_EQUIP);
  // Parte 2: escudo de ferro (do loot)
  window.criarTeoFerro = window.criarTeoFerro || ((o = {}, v = 'frente') => window.equipar(window.criarTeo({ ...window.TEO_JOGO_OPCOES, ...o }, v), { ...window.TEO_JOGO_EQUIP, escudo: { ...(window.TEO_JOGO_EQUIP.escudo || {}), cor: 'prata', borda: 'carvao' } }));
})();

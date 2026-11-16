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
  // Parte 3 · opções de roupa nova do Téo (para o autor escolher)
  window.TEO_ROUPAS = {
    A: { nome: 'GUARDIÃO DE AÇO', top: { tipo: 'cardiga', cor: 'cinzaMalha', corInterna: 'carvao' }, calca: { tipo: 'reta', cor: 'carvao' }, calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'acoEscuro' },
      eq: { capa: { cor: 'verdeTabardo', borda: 'ouroBordado' }, malha: true, peitoralAco: { cor: 'acoGuardiao', borda: 'ouroBordado', emblema: true }, sobreveste: { cor: 'verdeTabardo', borda: 'ouroBordado' }, ombreira: { cor: 'acoGuardiao', rebites: 'ouroBordado' }, bracadeira: 'acoGuardiao', cinto: { cor: 'couroEscuro', fivela: 'ouroBordado' }, botas: { cor: 'acoEscuro', cano: 0.65 }, escudo: { cor: 'prata', borda: 'ouroBordado', emblema: 'verdeTabardo' }, arma: { tipo: 'espada-madeira', mao: 'd' } } },
    B: { nome: 'CAÇADOR DE FERAS', top: { tipo: 'cardiga', cor: 'verdeEscuro', corInterna: 'linhoEscuro' }, calca: { tipo: 'reta', cor: 'marromCalca' }, calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'couroEscuro' },
      eq: { capa: { cor: 'verdeFloresta', borda: 'couro' }, peitoral: { cor: 'couroGuardiao', faixas: 3, tachas: 'prata' }, pele: { cor: 'peloGuardiao' }, colarDentes: true, cinta: { cor: 'couroEscuro', tachas: 'prata', bolsa: 'couroGuardiao' }, bracadeira: 'couroEscuro', cinto: { cor: 'couroEscuro', fivela: 'prata', bolsa: 'couro' }, botas: { cor: 'couroEscuro', cano: 0.6 }, escudo: { cor: 'prata', borda: 'couroEscuro', emblema: 'verdeEscuro' }, arma: { tipo: 'espada-madeira', mao: 'd' } } },
    C: { nome: 'GUARDIÃO DA FLORESTA', top: { tipo: 'cardiga', cor: 'couroEscuro', corInterna: 'linhoEscuro' }, calca: { tipo: 'reta', cor: 'carvao' }, calcado: { tipo: 'cano-alto', cor: 'couroEscuro', acento: 'bronze' },
      eq: { capa: { cor: 'vinhoCapa', borda: 'bronze' }, escamas: { cor: 'verdeEscama', borda: 'bronze' }, sobreveste: { cor: 'couroEscuro', borda: 'bronze' }, ombreira: { cor: 'bronze', rebites: 'acoGuardiao' }, bracadeira: 'bronze', cinto: { cor: 'couroEscuro', fivela: 'bronze' }, botas: { cor: 'couroEscuro', cano: 0.6 }, escudo: { cor: 'bronze', borda: 'carvao', emblema: 'verdeEscama' }, arma: { tipo: 'espada-madeira', mao: 'd' } } },
  };
  window.criarTeoRoupa = (opcoes = {}, vista = 'frente') => { const R = window.TEO_ROUPAS[opcoes.estilo || 'A']; return window.equipar(window.criarTeo({ ...window.TEO_JOGO_OPCOES, top: R.top, calca: R.calca, calcado: R.calcado }, vista), R.eq); };
})();

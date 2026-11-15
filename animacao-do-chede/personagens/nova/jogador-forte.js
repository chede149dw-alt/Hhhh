// Jogador de nível alto (NV 80) que passa com a Adaga Eclipse na cintura — figurante da Parte 1 (VALDOR).
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js.
(function () {
  window.FORTE_OPCOES = {
    nome: 'Jogador NV 80', altura: 6.1, cabecaLargura: 0.9, pele: 'pele1', fatorContorno: 1.35,
    olhos: { raio: 0.06, sep: 0.19, iris: 'irisVioleta' }, sobrancelha: { esp: 0.06, tipo: 'reta' },
    cabelo: { estilo: 'liso-lateral', cor: 'cabCafe', volume: 1.0 },
    corpo: { ombro: 0.62, quadril: 0.2 },
    top: { tipo: 'cardiga', cor: 'armaduraEscura', corInterna: 'armaduraLuz' },
    calca: { tipo: 'reta', cor: 'carvao' },
    calcado: { tipo: 'cano-alto', cor: 'armaduraEscura', acento: 'prata' },
  };
  window.FORTE_EQUIP = {
    capuz: 'mantoRoxo', gola: 'prata', manto: { cor: 'mantoRoxo', barra: 'prata' },
    cinto: { cor: 'carvao', fivela: 'mostarda' }, botas: { cor: 'armaduraLuz', cano: 0.5 }, bracadeira: 'prata',
    adagaCinto: { epica: true },
  };
  window.criarJogadorForte = (opcoes = {}, vista = 'frente') => window.equipar(window.criarPersonagem({ ...window.FORTE_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.POSES_PADRAO).map(([k, v]) => [k, v.angulos])) }, vista), window.FORTE_EQUIP);
})();

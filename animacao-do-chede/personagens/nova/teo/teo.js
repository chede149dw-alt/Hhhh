// TÉO — melhor amigo do Davi (série nova, VALDOR). Joga desde criança e conhece os segredos do jogo.
// Montado com motor/personagem-base.js. Carregar personagens/nova/cores.js antes.
(function () {
  window.TEO_OPCOES = {
    nome: 'Téo',
    altura: 5.9, cabecaLargura: 0.9, pele: 'pele2', fatorContorno: 1.35,
    olhos: { raio: 0.066, sep: 0.19, iris: 'irisAzul' },
    sobrancelha: { esp: 0.05, tipo: 'arqueada' },
    cabelo: { estilo: 'liso-lateral', cor: 'cabRuivo', volume: 1.02 },
    corpo: { ombro: 0.55, quadril: 0.19 },
    top: { tipo: 'camiseta', cor: 'verdeAgua', estampa: 'linho' },
    calca: { tipo: 'reta', cor: 'caqui' },
    calcado: { tipo: 'baixo', cor: 'grafite', acento: 'linho' },
  };
  window.TEO_POSES = window.POSES_PADRAO;
  window.criarTeo = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.TEO_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.TEO_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

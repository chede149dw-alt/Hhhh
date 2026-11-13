// DAVI — protagonista da série nova (VALDOR). Gastou as economias no equipamento do jogo e agora joga para ganhar dinheiro.
// Montado com motor/personagem-base.js. Carregar personagens/nova/cores.js antes.
(function () {
  window.DAVI_OPCOES = {
    nome: 'Davi',
    altura: 5.7, cabecaLargura: 0.93, pele: 'pele4', fatorContorno: 1.35,
    olhos: { raio: 0.068, sep: 0.19, iris: 'irisCastanho' },
    sobrancelha: { esp: 0.06, tipo: 'reta' },
    cabelo: { estilo: 'baguncado', cor: 'cabNoite', volume: 0.96 },
    corpo: { ombro: 0.57, quadril: 0.2 },
    top: { tipo: 'moletom', cor: 'cinzaMoletom', corInterna: 'carvao', mangaLonga: 'cinzaMoletom' },
    calca: { tipo: 'larga', cor: 'carvao' },
    calcado: { tipo: 'cano-alto', cor: 'linho', acento: 'vermelhoTenis' },
  };
  window.DAVI_POSES = window.POSES_PADRAO;
  window.criarDavi = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.DAVI_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.DAVI_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

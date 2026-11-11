// AMIGO do Lucas — personagem secundário da série "E se você acordasse podendo ficar invisível?".
// Montado com motor/personagem-base.js (carregar antes). Ficha: personagens/amigo/ficha.md.
(function () {
  window.AMIGO_OPCOES = {
    nome: 'Amigo',
    altura: 5.8, cabecaLargura: 0.9, pele: 'pele1', fatorContorno: 1.35,
    olhos: { raio: 0.066, sep: 0.19, iris: 'irisVerde' },
    sobrancelha: { esp: 0.05, tipo: 'reta' },
    cabelo: { estilo: 'liso-lateral', cor: 'cabCastanho', volume: 1.04 },
    acessorios: { oculos: true },
    corpo: { ombro: 0.56, quadril: 0.19 },
    top: { tipo: 'camiseta', cor: 'linho', mangaLonga: 'mostarda', estampa: 'mostarda' },
    calca: { tipo: 'reta', cor: 'denim' },
    calcado: { tipo: 'baixo', cor: 'linho', acento: 'mostarda' },
  };
  window.AMIGO_POSES = window.POSES_PADRAO;
  window.criarAmigo = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.AMIGO_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.AMIGO_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

// MÃE do Lucas — personagem secundária da série "E se você acordasse podendo ficar invisível?".
// Montada com motor/personagem-base.js (carregar antes). Ficha: personagens/mae/ficha.md.
(function () {
  window.MAE_OPCOES = {
    nome: 'Mãe',
    altura: 6.0, cabecaLargura: 0.9, pele: 'pele4', fatorContorno: 1.35,
    olhos: { raio: 0.068, sep: 0.19, iris: 'irisCastanho', cilios: true },
    sobrancelha: { esp: 0.045, tipo: 'arqueada' },
    cabelo: { estilo: 'coque', cor: 'cabCafe', volume: 1.0, prendedor: 'mostarda' },
    acessorios: { brincos: 'mostarda' },
    corpo: { ombro: 0.55, quadril: 0.22 },
    top: { tipo: 'cardiga', cor: 'linho', corInterna: 'lilas' },
    calca: { tipo: 'reta', cor: 'grafite' },
    calcado: { tipo: 'sapatilha', cor: 'grafite' },
  };
  window.MAE_POSES = window.POSES_PADRAO;
  window.criarMae = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.MAE_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.MAE_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

// LIA MORAES — dona do gato preto, a "terceira ficha" (NÃO ABORDAR). Mesmo poder do Chede (fenda roxa).
// 21 anos, moletom verde-musgo, cabelo castanho-escuro, calça jeans clara, tênis branco. Montada com motor/personagem-base.js.
(function () {
  window.LIA_OPCOES = {
    nome: 'Lia',
    altura: 5.5, cabecaLargura: 0.9, pele: 'pele3', fatorContorno: 1.35,
    olhos: { raio: 0.07, sep: 0.19, iris: 'irisCastanho', cilios: true },
    sobrancelha: { esp: 0.045, tipo: 'arqueada' },
    cabelo: { estilo: 'coque', cor: 'cabCafe', volume: 1.0, prendedor: 'musgo' },
    corpo: { ombro: 0.55, quadril: 0.2 },
    top: { tipo: 'moletom', cor: 'musgo' },
    calca: { tipo: 'reta', cor: 'jeansClaro' },
    calcado: { tipo: 'baixo', cor: 'linho', acento: 'musgo' },
  };
  window.LIA_POSES = window.POSES_PADRAO;
  window.criarLia = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.LIA_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.LIA_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

// CHEDE — protagonista da nossa história (fenda dimensional). Montado com motor/personagem-base.js.
// Mesma identidade dos episódios 1–5: pele morena, cabelo preto volumoso, camiseta laranja com bolso, bermuda preta, tênis branco.
(function () {
  window.CHEDE_OPCOES = {
    nome: 'Chede',
    altura: 5.6, cabecaLargura: 0.94, pele: 'pele4', fatorContorno: 1.35,
    olhos: { raio: 0.072, sep: 0.19, iris: 'irisCastanho' },
    sobrancelha: { esp: 0.06, tipo: 'reta' },
    cabelo: { estilo: 'cacheado', cor: 'cabNoite', volume: 1.12 },
    corpo: { ombro: 0.58, quadril: 0.2 },
    top: { tipo: 'camiseta', cor: 'laranja', bolso: true },
    calca: { tipo: 'bermuda', cor: 'pretoBermuda' },
    calcado: { tipo: 'baixo', cor: 'linho', acento: 'pedra' },
  };
  window.CHEDE_POSES = window.POSES_PADRAO;
  window.criarChede = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.CHEDE_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.CHEDE_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

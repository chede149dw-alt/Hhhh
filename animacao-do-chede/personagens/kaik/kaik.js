// KAIK — melhor amigo do Chede (super velocidade, rastro ciano). Montado com motor/personagem-base.js.
// Mesma identidade dos episódios: pele clara, cabelo preto cacheado, camiseta azul com faixa branca, bermuda vermelha.
(function () {
  window.KAIK_OPCOES = {
    nome: 'Kaik',
    altura: 5.6, cabecaLargura: 0.92, pele: 'pele1', fatorContorno: 1.35,
    olhos: { raio: 0.07, sep: 0.19, iris: 'irisCastanho' },
    sobrancelha: { esp: 0.055, tipo: 'reta' },
    cabelo: { estilo: 'cacheado', cor: 'cabNoite', volume: 1.0 },
    corpo: { ombro: 0.58, quadril: 0.2 },
    top: { tipo: 'camiseta', cor: 'azulKaik', listra: 'linho' },
    calca: { tipo: 'bermuda', cor: 'vermelhoKaik' },
    calcado: { tipo: 'baixo', cor: 'linho', acento: 'pedra' },
  };
  window.KAIK_POSES = window.POSES_PADRAO;
  window.criarKaik = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.KAIK_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.KAIK_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
})();

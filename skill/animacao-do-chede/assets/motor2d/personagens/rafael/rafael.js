// RAFAEL — melhor amigo do Lucas. Personagem secundário (séries da invisibilidade e da terra).
// Montado com motor/personagem-base.js (carregar antes). Ficha: personagens/rafael/ficha.md.
(function () {
  window.RAFAEL_OPCOES = {
    nome: 'Rafael',
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
  window.RAFAEL_POSES = window.POSES_PADRAO;
  window.AMIGO_OPCOES = window.RAFAEL_OPCOES; window.AMIGO_POSES = window.RAFAEL_POSES; // nomes antigos
  window.criarRafael = (opcoes = {}, vista = 'frente') => window.criarPersonagem({ ...window.RAFAEL_OPCOES, ...opcoes, poses: Object.fromEntries(Object.entries(window.RAFAEL_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
  window.criarAmigo = window.criarRafael; // nome antigo, usado na série da invisibilidade
})();

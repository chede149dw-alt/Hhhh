// Protagonista — versão escolhida: B2 ("Mais volume e traço"), rodada 2.
// Depende de personagens/protagonista/gerador.js (carregar antes deste arquivo).
window.OPCOES_PROTAGONISTA = {
  altura: 5.5, cabecaLargura: 0.97,
  olhos: 'oval', olhoRaio: 0.072,
  sobrancelha: 'arqueada', sobrancelhaEsp: 0.066,
  cabelo: 'baguncado', cabeloVolume: 1.1,
  moletom: 'largo', faixaManga: 'turquesa',
  calca: 'larga', tenis: 'cano-alto', acentoTenis: 'turquesa',
  fatorContorno: 1.35,
};
window.PERSONAGEM = window.criarProtagonista(window.OPCOES_PROTAGONISTA);

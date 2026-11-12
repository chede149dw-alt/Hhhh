// Regras visuais do guia-de-estilo.md em forma de código.
// Carregado no navegador (Canvas 2D). Tudo em unidades de H (altura da cabeça).
(function () {
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (a) =>
    '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  const multiply = (a, b) => { const B = hex2rgb(b); return rgb2hex(hex2rgb(a).map((x, i) => (x * B[i]) / 255)); };
  const screen = (a, b, k) => { const B = hex2rgb(b); return rgb2hex(hex2rgb(a).map((x, i) => x + (255 - x) * (B[i] / 255) * k)); };

  // Seção 2.2 do guia
  const SOMBRA = '#C4B6DE';
  const SOMBRA_PELE = '#E8AFA2';
  const LUZ = '#FFF1CC';

  // Seção 2.3 do guia (+ Marinho, cor-assinatura do protagonista)
  const base = {
    tinta: '#211B26', grafite: '#38343F', pedra: '#6A6573', linho: '#F2EDE6', denim: '#55708C',
    marinho: '#2B3B66',
    // série Chede + Kaik
    laranja: '#F07C28', azulKaik: '#2F6FD6', vermelhoKaik: '#C93A32', pretoBermuda: '#2A2830',
    brasa: '#D23A42', coral: '#F28A5E', turquesa: '#3DB5B0', lilas: '#A487DE', mostarda: '#EBC25A',
    pele1: '#F6D6C0', pele2: '#EAB28E', pele3: '#C98B63', pele4: '#8F5B3E',
    cabCafe: '#4A3536', cabNoite: '#2C2936', cabCastanho: '#73493A', cabCobre: '#BC673C',
    // cenários (guia, seção 11)
    ceu: '#BFE3F2', ceuHorizonte: '#FBE3C8', sol: '#FFE6A8', nuvem: '#F7F4EE',
    parede: '#E9DCCB', paredeEscola: '#D8E6E2', madeira: '#B98563', madeiraClara: '#D6A77F',
    telhado: '#B5544A', casaAreia: '#E8C9A0', casaCeu: '#9FB7C9', casaRosa: '#D9A6A0',
    asfalto: '#5A5866', calcada: '#CFC8C0', grama: '#86B46E', folhagem: '#5E9E5A', tronco: '#7A5A44',
    armario: '#5E7FA8', vidro: '#CFEAF5',
    irisAzul: '#4F9BE0', irisAmbar: '#D9902F', irisVerde: '#4FAF7A', irisVioleta: '#8B63D9', irisCastanho: '#6A4330',
  };

  function tom(nome) {
    const b = base[nome];
    if (!b) throw new Error('Cor fora do guia: ' + nome);
    const pele = nome.startsWith('pele');
    return { nome, base: b, sombra: multiply(b, pele ? SOMBRA_PELE : SOMBRA), luz: screen(b, LUZ, 0.18) };
  }

  window.Estilo = {
    base, tom, multiply, screen,
    fundoFicha: '#F4F2EE',
    pupila: '#110E14',
    brilhoOlho: '#FFFFFF',
    // Modo de render: 'suave' (padrão desde o pedido de deixar menos cartunesco) ou 'classico' (contorno Tinta grosso, sombra dura)
    modo: 'suave',
    suave: {
      contorno: 0.42,                    // contorno = 42% do clássico
      borda: '#9A8EAA',                  // contorno = tom de sombra da peça × esta cor (nunca preto)
      linha: 'rgba(48,32,56,0.62)',      // linhas internas
      contato: 'rgba(28,18,42,0.16)',    // sombra de contato entre peças
    },
    get blush() { return this.modo === 'suave' ? 'rgba(232,140,128,0.16)' : 'rgba(240,154,140,0.35)'; },
    sombraChao: 'rgba(17,14,20,0.22)',
    // Seção 6: contorno = 4‰ da altura do personagem; internas = 55%
    contorno: (alturaEmH) => alturaEmH * 0.004,
    fatorInterno: 0.55,
    // Luz de cima à esquerda, 45°: direção em que a luz VIAJA (para baixo-direita)
    luzViaja: [Math.SQRT1_2, Math.SQRT1_2],
  };
})();

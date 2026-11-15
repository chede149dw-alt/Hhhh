// Ladrões encapuzados de Valdor (Parte 2): capuz fechado na cabeça, máscara de pano no rosto, faca na mão.
// criarLadrao({ lider, variante }, vista) — variante 0..3 muda pele, tom do pano e altura dos comuns.
// O líder usa capa vermelho-escura, gola de metal e a Adaga Eclipse escondida na cintura.
// Carregar depois de personagem-base.js, nova/cores.js e nova/equipamento.js.
(function () {
  Object.assign(Estilo.base, { capuzLadrao: '#2B2F3A', roupaLadrao: '#3A3F4C', capuzLadrao2: '#3A3328', vinho: '#6E1A2A', mascara: '#17181F', couroLadrao: '#4A3A30' });
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tomFixo = (b, s) => ({ base: b, sombra: s, luz: b });
  const VAR = [
    { pele: 'pele3', capuz: 'capuzLadrao', altura: 5.9 },
    { pele: 'pele2', capuz: 'capuzLadrao2', altura: 6.0 },
    { pele: 'pele4', capuz: 'capuzLadrao', altura: 5.8 },
    { pele: 'pele1', capuz: 'capuzLadrao2', altura: 6.05 },
  ];

  // capuz fechado + máscara por cima da cabeça já desenhada
  function vestirCabeca(def, corCapuz, corMascara, borda) {
    const p = def.partes.find((q) => q.nome === 'cabeca'); if (!p) return;
    const orig = p.desenhar, r = def.opcoes.cabecaLargura / 2, vista = def.vista;
    const cap = Estilo.tom(corCapuz), masc = Estilo.tom(corMascara);
    p.desenhar = (pc, ...resto) => {
      orig(pc, ...resto);
      const dx = vista === 'tq' ? 0.07 : vista === 'perfil' ? 0.14 : 0, k = vista === 'perfil' ? 0.7 : vista === 'tq' ? 0.86 : 1;
      if (vista === 'costas') { pc.peca(P((q) => { q.moveTo(-r - 0.2, 0.16); q.bezierCurveTo(-r - 0.34, -0.5, -r - 0.22, -0.47 - r - 0.3, 0, -0.47 - r - 0.32); q.bezierCurveTo(r + 0.22, -0.47 - r - 0.3, r + 0.34, -0.5, r + 0.2, 0.16); q.closePath(); }), cap, { sombra: 0.14 }); return; }
      // máscara de pano cobrindo nariz e boca
      if (vista !== 'perfil') pc.peca(P((q) => { q.moveTo(dx - r * 0.98 * k, -0.27); q.quadraticCurveTo(dx, -0.33, dx + r * 0.98 * k, -0.27); q.bezierCurveTo(dx + r * k, -0.05, dx + r * 0.55 * k, 0.09, dx, 0.09); q.bezierCurveTo(dx - r * 0.55 * k, 0.09, dx - r * k, -0.05, dx - r * 0.98 * k, -0.27); q.closePath(); }), masc, { sombra: 0.12 });
      else pc.peca(P((q) => { q.moveTo(-0.05, -0.28); q.lineTo(r + 0.07, -0.3); q.quadraticCurveTo(r + 0.04, 0.0, r - 0.12, 0.06); q.quadraticCurveTo(0.0, 0.06, -0.05, -0.28); q.closePath(); }), masc, { sombra: 0.1 });
      if (borda) pc.linha(P((q) => { q.moveTo(dx - r * 0.98 * k, -0.27); q.quadraticCurveTo(dx, -0.33, dx + r * 0.98 * k, -0.27); }), pc.interno * 2.2, borda);
      pc.linha(P((q) => { q.moveTo(dx - r * 0.5 * k, -0.12); q.quadraticCurveTo(dx, -0.08, dx + r * 0.4 * k, -0.14); q.moveTo(dx - r * 0.3 * k, -0.0); q.quadraticCurveTo(dx + 0.05, 0.03, dx + r * 0.3 * k, -0.02); }), pc.interno, 'rgba(0,0,0,0.35)');
      // sombra do capuz sobre a testa e os olhos
      pc.preencher(P((q) => q.ellipse(dx, -0.62, r * 1.05 * k, 0.24, 0, 0, Math.PI * 2)), 'rgba(10,8,20,0.45)');
      // capuz: contorno de fora com abertura no rosto
      const capuz = P((q) => {
        q.moveTo(-r - 0.2, 0.16); q.bezierCurveTo(-r - 0.34, -0.5, -r - 0.22, -0.47 - r - 0.3, 0.02, -0.47 - r - 0.32);
        q.bezierCurveTo(r + 0.24, -0.47 - r - 0.3, r + 0.34, -0.5, r + 0.2, 0.16);
        q.lineTo(dx + r * 0.9 * k, 0.12); q.quadraticCurveTo(dx + r * 0.98 * k, -0.62, dx, -0.47 - r * 0.78); q.quadraticCurveTo(dx - r * 0.98 * k, -0.62, dx - r * 0.9 * k, 0.12);
        q.closePath();
      });
      pc.peca(capuz, cap, { sombra: 0.16 });
      pc.linha(P((q) => { q.moveTo(dx - r * 0.9 * k, 0.1); q.quadraticCurveTo(dx - r * 0.98 * k, -0.62, dx, -0.47 - r * 0.78); q.quadraticCurveTo(dx + r * 0.98 * k, -0.62, dx + r * 0.9 * k, 0.1); }), pc.interno * 3.2, 'rgba(255,255,255,0.18)');
      if (pc.modo !== 'contorno') { pc.ctx.save(); pc.ctx.setLineDash([0.035, 0.03]); pc.linha(P((q) => { q.moveTo(dx - r * 1.02 * k, 0.1); q.quadraticCurveTo(dx - r * 1.12 * k, -0.66, dx, -0.47 - r * 0.9); q.quadraticCurveTo(dx + r * 1.12 * k, -0.66, dx + r * 1.02 * k, 0.1); }), pc.interno * 0.7, 'rgba(255,236,205,0.45)'); pc.ctx.restore(); }
    };
  }

  window.LADRAO_POSES = {
    ...window.POSES_PADRAO,
    faca: { vista: 'tq', expressao: 'raiva', angulos: { braco_d: 55, antebraco_d: 60, mao_d: -10, braco_e: -20, antebraco_e: -30, coxa_d: -10, canela_d: 15, coxa_e: 12, canela_e: 10, tronco: 6, _desloca: [0, 0.08] } },
    aponta: { vista: 'tq', expressao: 'raiva', angulos: { braco_d: 88, antebraco_d: 0, mao_d: 0, braco_e: -8, antebraco_e: -10, coxa_d: -4, coxa_e: 6 } },
    caido: { vista: 'perfil', expressao: 'medo', angulos: { tronco: -70, cabeca: -20, braco_d: -120, antebraco_d: -20, braco_e: -100, antebraco_e: -30, coxa_d: -60, canela_d: 30, coxa_e: -40, canela_e: 20, _desloca: [0, 1.6] } },
    tocha: { vista: 'tq', expressao: 'raiva', angulos: { braco_d: 30, antebraco_d: 45, mao_d: -10, braco_e: -38, antebraco_e: -115, mao_e: 10, coxa_d: -6, canela_d: 8, coxa_e: 8, canela_e: 6, tronco: 4 } },
    abrindoCapa: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 70, antebraco_d: -30, braco_e: -70, antebraco_e: 30, coxa_d: 6, coxa_e: -6 } },
  };
  window.criarLadrao = (o = {}, vista = 'frente') => {
    const v = VAR[(o.variante || 0) % VAR.length], lider = !!o.lider;
    const opc = {
      nome: lider ? 'Líder dos ladrões' : 'Ladrão', altura: lider ? 6.2 : v.altura, cabecaLargura: 0.9, pele: lider ? 'pele2' : v.pele, fatorContorno: 1.35,
      olhos: { raio: 0.06, sep: 0.19, iris: lider ? 'irisVioleta' : 'irisCastanho' }, sobrancelha: { esp: 0.07, tipo: 'reta' },
      cabelo: { estilo: 'liso-lateral', cor: 'cabCafe', volume: 0.75 },
      corpo: { ombro: lider ? 0.64 : 0.58, quadril: 0.2 },
      top: { tipo: 'cardiga', cor: lider ? 'armaduraEscura' : 'roupaLadrao', corInterna: lider ? 'vinho' : 'carvao' },
      calca: { tipo: 'reta', cor: 'carvao' },
      calcado: { tipo: 'cano-alto', cor: 'couroLadrao', acento: 'carvao' },
      poses: Object.fromEntries(Object.entries(window.LADRAO_POSES).map(([k, x]) => [k, x.angulos])),
    };
    const eq = lider
      ? { peitoral: { cor: 'armaduraEscura', faixas: 4, tachas: 'prata' }, manto: { cor: 'vinho', barra: 'carvao' }, cinto: { cor: 'carvao', fivela: 'prata' }, botas: { cor: 'armaduraEscura', cano: 0.5 }, bracadeira: 'armaduraEscura', cinta: { cor: 'carvao', tachas: 'prata' }, ombreira: { cor: 'armaduraEscura', rebites: 'prata' }, adagaCinto: o.semAdaga ? undefined : { epica: true } }
      : { cinto: { cor: 'couroLadrao', fivela: 'carvao', bolsa: 'couroLadrao' }, botas: { cor: 'couroLadrao', cano: 0.4 }, bracadeira: 'couroLadrao', peitoral: { cor: 'couroLadrao', faixas: 3, tachas: 'prata' }, cinta: { cor: 'carvao', tachas: 'prata', bolsa: 'carvao' }, ombreira: { cor: 'couroLadrao', rebites: 'prata' }, arma: o.semFaca ? undefined : { tipo: 'adaga', mao: 'd' } };
    const def = window.equipar(window.criarPersonagem(opc, vista), eq);
    vestirCabeca(def, lider ? 'vinho' : v.capuz, 'mascara', lider ? 'rgba(200,40,60,0.9)' : null);
    return def;
  };
})();

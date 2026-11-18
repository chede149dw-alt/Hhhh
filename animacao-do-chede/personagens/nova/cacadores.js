// VALDOR · Parte 4: os caçadores de recompensa (jogadores de verdade dentro do jogo) e a figura encapuzada.
//   criarArqueira  — capuz verde, arco comprido na mão esquerda, aljava nas costas
//   criarGigante   — armadura de ferro, elmo, martelo enorme na mão direita
//   criarAssassina — roupa escura, capuz e máscara, uma adaga em cada mão
//   criarEncapuzado — manto cinza comprido, rosto na sombra do capuz, lente de cristal brilhando na mão
// As armas são peças do boneco (presas na mão, desenhadas atrás dos dedos), nunca por cima da mão.
// Ângulo da arma na mão: window.ARMA_ANG = { arco, martelo, adaga_d, adaga_e } em graus (opcional, por quadro).
// Carregar depois de: personagem-base.js, nova/cores.js, nova/equipamento.js.
(function () {
  Object.assign(Estilo.base, {
    verdeArqueira: '#3E6B3A', verdeArqueiraEsc: '#2A4A2A', couroClaro: '#9A6A40', madeiraArco: '#7A4A26', cordaArco: '#E8E0C8',
    acoGigante: '#9AA2B2', acoGiganteEsc: '#5C6474', peleGigante: '#C88A62', barbaRuiva: '#8A3A1E',
    pretoAssassina: '#25222E', roxoNoite: '#3A2C55', laminaClara: '#D8DEE8',
    cinzaManto: '#4E4A56', cinzaMantoEsc: '#34313C', cristalLente: '#9EE6FF',
  });
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const T = (n) => Estilo.tom(n);
  const fixo = (b, s, l) => ({ base: b, sombra: s, luz: l || b });
  const ang = (nome, padrao) => { const a = window.ARMA_ANG && window.ARMA_ANG[nome]; return ((a === undefined ? padrao : a) * Math.PI) / 180; };
  const poses = () => Object.fromEntries(Object.entries(window.POSES_PADRAO).map(([k, v]) => [k, v.angulos]));

  // capuz levantado (opcional: máscara de pano no nariz e boca, rosto na sombra)
  function capuz(def, cor, o = {}) {
    const p = def.partes.find((q) => q.nome === 'cabeca'); if (!p) return;
    const orig = p.desenhar, r = def.opcoes.cabecaLargura / 2, vista = def.vista, cap = T(cor);
    p.desenhar = (pc, ...resto) => {
      if (!o.semRosto) orig(pc, ...resto);
      const dx = vista === 'tq' ? 0.07 : vista === 'perfil' ? 0.14 : 0, k = vista === 'perfil' ? 0.7 : vista === 'tq' ? 0.86 : 1;
      if (o.semRosto && vista !== 'costas') pc.peca(P((q) => q.ellipse(dx, -0.47, r * 0.92 * k, r * 1.02, 0, 0, Math.PI * 2)), fixo('#141218', '#0A090C'), { sombra: 0 });
      if (o.mascara && vista !== 'costas') {
        const m = T(o.mascara);
        if (vista !== 'perfil') pc.peca(P((q) => { q.moveTo(dx - r * 0.98 * k, -0.27); q.quadraticCurveTo(dx, -0.33, dx + r * 0.98 * k, -0.27); q.bezierCurveTo(dx + r * k, -0.05, dx + r * 0.55 * k, 0.09, dx, 0.09); q.bezierCurveTo(dx - r * 0.55 * k, 0.09, dx - r * k, -0.05, dx - r * 0.98 * k, -0.27); q.closePath(); }), m, { sombra: 0.12 });
        else pc.peca(P((q) => { q.moveTo(-0.05, -0.28); q.lineTo(r + 0.07, -0.3); q.quadraticCurveTo(r + 0.04, 0.0, r - 0.12, 0.06); q.quadraticCurveTo(0.0, 0.06, -0.05, -0.28); q.closePath(); }), m, { sombra: 0.1 });
      }
      if (vista !== 'costas') pc.preencher(P((q) => q.ellipse(dx, -0.62, r * 1.05 * k, 0.26, 0, 0, Math.PI * 2)), `rgba(10,8,20,${o.semRosto ? 0.8 : 0.4})`);
      const fora = P((q) => {
        q.moveTo(-r - 0.2, 0.16); q.bezierCurveTo(-r - 0.34, -0.5, -r - 0.22, -0.47 - r - 0.3, 0.02, -0.47 - r - 0.36);
        q.bezierCurveTo(r + 0.24, -0.47 - r - 0.3, r + 0.34, -0.5, r + 0.2, 0.16);
        if (vista === 'costas') { q.closePath(); return; }
        q.lineTo(dx + r * 0.9 * k, 0.12); q.quadraticCurveTo(dx + r * 0.98 * k, -0.62, dx, -0.47 - r * 0.78); q.quadraticCurveTo(dx - r * 0.98 * k, -0.62, dx - r * 0.9 * k, 0.12);
        q.closePath();
      });
      pc.peca(fora, cap, { sombra: 0.16 });
      if (vista !== 'costas') pc.linha(P((q) => { q.moveTo(dx - r * 0.9 * k, 0.1); q.quadraticCurveTo(dx - r * 0.98 * k, -0.62, dx, -0.47 - r * 0.78); q.quadraticCurveTo(dx + r * 0.98 * k, -0.62, dx + r * 0.9 * k, 0.1); }), pc.interno * 3, cap.sombra);
    };
  }
  // elmo de ferro com crista e protetor de nariz
  function elmo(def) {
    const p = def.partes.find((q) => q.nome === 'cabeca'); if (!p) return;
    const orig = p.desenhar, r = def.opcoes.cabecaLargura / 2, vista = def.vista;
    p.desenhar = (pc, ...resto) => {
      orig(pc, ...resto);
      const dx = vista === 'tq' ? 0.07 : vista === 'perfil' ? 0.12 : 0, k = vista === 'perfil' ? 0.75 : vista === 'tq' ? 0.9 : 1;
      pc.peca(P((q) => { q.moveTo(-r * 1.08, -0.52); q.bezierCurveTo(-r * 1.1, -0.47 - r * 1.25, r * 1.1, -0.47 - r * 1.25, r * 1.08, -0.52); q.lineTo(r * 1.1, -0.36); q.lineTo(-r * 1.1, -0.36); q.closePath(); }), T('acoGigante'), { sombra: 0.2 });
      pc.peca(P((q) => q.roundRect(-r * 1.12, -0.52, r * 2.24, 0.12, 0.03)), T('acoGiganteEsc'), { sombra: 0.1 });
      if (vista !== 'costas') pc.peca(P((q) => q.roundRect(dx - 0.035, -0.52, 0.07, 0.3, 0.02)), T('acoGiganteEsc'), { sombra: 0.1 });
      pc.peca(P((q) => { q.moveTo(-0.04, -0.47 - r * 0.95); q.quadraticCurveTo(0, -0.47 - r * 1.45, 0.25 * k, -0.47 - r * 1.3); q.quadraticCurveTo(0.06, -0.47 - r * 1.15, 0.04, -0.47 - r * 0.95); q.closePath(); }), T('barbaRuiva'), { sombra: 0.15 });
      for (const sx of [-0.7, -0.35, 0.35, 0.7]) pc.preencher(P((q) => q.arc(sx * r, -0.46, 0.022, 0, Math.PI * 2)), '#E6E9EF');
    };
  }
  // barba cheia (gigante)
  function barba(def, cor) {
    const p = def.partes.find((q) => q.nome === 'cabeca'); if (!p) return;
    const orig = p.desenhar, r = def.opcoes.cabecaLargura / 2, vista = def.vista;
    p.desenhar = (pc, ...resto) => {
      orig(pc, ...resto); if (vista === 'costas') return;
      const dx = vista === 'tq' ? 0.07 : vista === 'perfil' ? 0.14 : 0, k = vista === 'perfil' ? 0.6 : vista === 'tq' ? 0.85 : 1;
      pc.peca(P((q) => { q.moveTo(dx - r * 0.95 * k, -0.3); q.quadraticCurveTo(dx - r * k, 0.1, dx, 0.2); q.quadraticCurveTo(dx + r * k, 0.1, dx + r * 0.95 * k, -0.3); q.quadraticCurveTo(dx + r * 0.5 * k, -0.08, dx, -0.12); q.quadraticCurveTo(dx - r * 0.5 * k, -0.08, dx - r * 0.95 * k, -0.3); q.closePath(); }), T(cor), { sombra: 0.15 });
      pc.preencher(P((q) => q.ellipse(dx, -0.06, 0.07 * k, 0.025, 0, 0, Math.PI * 2)), 'rgba(60,20,10,0.7)');
    };
  }
  // peça presa na mão (atrás dos dedos): desenho em unidades H, origem no meio da mão, +y = para onde os dedos apontam
  function naMao(def, mao, nome, desenho, frente = false) {
    const m = def.partes.find((q) => q.nome === 'mao_' + mao); if (!m) return;
    def.partes.push({ nome, pai: 'mao_' + mao, pivo: [0, 0.1], z: frente ? m.z + 0.004 : m.z - 0.004, desenhar: desenho });
  }
  // peça nas costas (atrás do tronco)
  function nasCostas(def, nome, desenho) {
    const t = def.partes.find((q) => q.nome === 'tronco'); if (!t) return;
    def.partes.push({ nome, pai: 'tronco', pivo: [0, 0], z: def.vista === 'costas' ? t.z + 0.05 : t.z - 0.05, desenhar: desenho });
  }

  // ---------- Arqueira ----------
  window.ARQUEIRA_OPCOES = {
    nome: 'Arqueira NV 22', altura: 5.9, cabecaLargura: 0.88, pele: 'pele2', fatorContorno: 1.35,
    olhos: { raio: 0.068, sep: 0.19, iris: 'irisVerde', cilios: true }, sobrancelha: { esp: 0.045, tipo: 'arqueada' },
    cabelo: { estilo: 'coque', cor: 'cabRuivo', volume: 0.9, prendedor: 'couro' },
    corpo: { ombro: 0.52, quadril: 0.22 },
    top: { tipo: 'cardiga', cor: 'verdeArqueira', corInterna: 'linhoEscuro' },
    calca: { tipo: 'reta', cor: 'couroEscuro' },
    calcado: { tipo: 'cano-alto', cor: 'couroClaro', acento: 'couroEscuro' },
  };
  window.ARQUEIRA_EQUIP = {
    peitoral: { cor: 'couroClaro', faixas: 3, tachas: 'mostarda' }, cinto: { cor: 'couroEscuro', fivela: 'mostarda', bolsa: 'couroClaro' },
    botas: { cor: 'couroClaro', cano: 0.55 }, bracadeira: 'couroEscuro', cinta: { cor: 'couroEscuro', tachas: 'prata' },
  };
  window.criarArqueira = (o = {}, vista = 'frente') => {
    const def = window.equipar(window.criarPersonagem({ ...window.ARQUEIRA_OPCOES, ...o, poses: poses() }, vista), window.ARQUEIRA_EQUIP);
    capuz(def, 'verdeArqueira');
    // aljava com flechas nas costas
    nasCostas(def, 'aljava', (pc) => {
      pc.ctx.save(); pc.ctx.rotate(0.35);
      for (let i = 0; i < 5; i++) { const x = -0.07 + i * 0.035; pc.peca(P((q) => q.rect(x - 0.008, -1.22, 0.016, 0.32)), fixo('#C9A06A', '#8A6A40'), { sombra: 0 }); pc.peca(P((q) => { q.moveTo(x - 0.03, -1.22); q.lineTo(x, -1.32); q.lineTo(x + 0.03, -1.22); q.closePath(); }), fixo(i % 2 ? '#E8E2D2' : '#C84A3A', i % 2 ? '#B8B2A2' : '#8A2A20'), { sombra: 0 }); }
      pc.peca(P((q) => q.roundRect(-0.12, -1.0, 0.24, 0.72, 0.06)), T('couroClaro'), { sombra: 0.2 });
      pc.linha(P((q) => { q.moveTo(-0.12, -0.9); q.lineTo(0.12, -0.9); q.moveTo(-0.12, -0.42); q.lineTo(0.12, -0.42); }), pc.interno * 1.4);
      pc.ctx.restore();
    });
    // arco comprido na mão esquerda (perpendicular ao braço), corda e flecha opcional: window.ARCO = { puxa: 0..1, flecha: true }
    naMao(def, 'e', 'arco', (pc) => {
      const c = pc.ctx, a = window.ARCO || {}, puxa = a.puxa || 0, L = 1.05;
      c.save(); c.rotate(ang('arco', 0));
      const arco = P((q) => { q.moveTo(-L, -0.05); q.quadraticCurveTo(-L * 0.5, 0.32, 0, 0.12); q.quadraticCurveTo(L * 0.5, 0.32, L, -0.05); q.lineTo(L * 0.98, 0.02); q.quadraticCurveTo(L * 0.5, 0.4, 0, 0.2); q.quadraticCurveTo(-L * 0.5, 0.4, -L * 0.98, 0.02); q.closePath(); });
      pc.peca(arco, T('madeiraArco'), { sombra: 0.15 });
      pc.peca(P((q) => q.roundRect(-0.09, 0.08, 0.18, 0.16, 0.04)), T('couroEscuro'), { sombra: 0.1 });
      const py = -0.05 - puxa * 0.75;
      pc.linha(P((q) => { q.moveTo(-L, -0.04); q.lineTo(0, py); q.lineTo(L, -0.04); }), pc.interno * 0.9, '#EDE6D0');
      if (a.flecha) { pc.peca(P((q) => q.rect(-0.012, py, 0.024, 0.95 - py * 0.2)), fixo('#C9A06A', '#8A6A40'), { sombra: 0 }); pc.peca(P((q) => { q.moveTo(-0.045, 0.9); q.lineTo(0, 1.04); q.lineTo(0.045, 0.9); q.closePath(); }), fixo('#D8DEE8', '#9AA0AA'), { sombra: 0 }); if (a.brilho) pc.preencher(P((q) => q.arc(0, 0.97, 0.09, 0, Math.PI * 2)), `rgba(150,255,170,${0.5 * a.brilho})`); }
      c.restore();
    });
    return def;
  };

  // ---------- Gigante ----------
  window.GIGANTE_OPCOES = {
    nome: 'Gigante NV 30', altura: 7.6, cabecaLargura: 0.95, pele: 'pele2', fatorContorno: 1.45,
    olhos: { raio: 0.055, sep: 0.2, iris: 'irisCastanho' }, sobrancelha: { esp: 0.08, tipo: 'reta' },
    cabelo: { estilo: 'liso-lateral', cor: 'cabRuivo', volume: 0.6 },
    corpo: { ombro: 0.86, quadril: 0.26 },
    top: { tipo: 'cardiga', cor: 'acoGiganteEsc', corInterna: 'couroEscuro' },
    calca: { tipo: 'reta', cor: 'couroEscuro' },
    calcado: { tipo: 'cano-alto', cor: 'acoGigante', acento: 'acoGiganteEsc' },
  };
  window.GIGANTE_EQUIP = {
    peitoral: { cor: 'acoGigante', faixas: 4, tachas: 'prata' }, ombreira: { cor: 'acoGigante', rebites: 'acoGiganteEsc' },
    cinto: { cor: 'couroEscuro', fivela: 'mostarda' }, botas: { cor: 'acoGigante', cano: 0.65 }, bracadeira: 'acoGigante', cinta: { cor: 'couroEscuro', tachas: 'prata' },
  };
  window.criarGigante = (o = {}, vista = 'frente') => {
    const def = window.equipar(window.criarPersonagem({ ...window.GIGANTE_OPCOES, ...o, poses: poses() }, vista), window.GIGANTE_EQUIP);
    barba(def, 'barbaRuiva'); elmo(def);
    // martelo de guerra: cabo comprido de madeira com anéis de ferro, cabeça de ferro enorme com cravos
    naMao(def, 'd', 'martelo', (pc) => {
      const c = pc.ctx; c.save(); c.rotate(ang('martelo', 0));
      pc.peca(P((q) => q.roundRect(-0.06, -0.55, 0.12, 2.15, 0.05)), T('madeiraArco'), { sombra: 0.15 });
      for (const y of [-0.45, 0.35, 1.2]) pc.peca(P((q) => q.roundRect(-0.075, y, 0.15, 0.08, 0.02)), T('acoGiganteEsc'), { sombra: 0.1 });
      pc.peca(P((q) => q.roundRect(-0.52, 1.45, 1.04, 0.62, 0.08)), T('acoGigante'), { sombra: 0.25 });
      pc.peca(P((q) => q.roundRect(-0.56, 1.42, 0.14, 0.68, 0.04)), T('acoGiganteEsc'), { sombra: 0.1 });
      pc.peca(P((q) => q.roundRect(0.42, 1.42, 0.14, 0.68, 0.04)), T('acoGiganteEsc'), { sombra: 0.1 });
      for (const [x, y] of [[-0.25, 1.62], [0, 1.62], [0.25, 1.62], [-0.12, 1.86], [0.12, 1.86]]) pc.preencher(P((q) => q.arc(x, y, 0.035, 0, Math.PI * 2)), '#E6E9EF');
      c.restore();
    });
    return def;
  };

  // ---------- Assassina ----------
  window.ASSASSINA_OPCOES = {
    nome: 'Assassina NV 26', altura: 5.8, cabecaLargura: 0.86, pele: 'pele1', fatorContorno: 1.35,
    olhos: { raio: 0.066, sep: 0.19, iris: 'irisVioleta', cilios: true }, sobrancelha: { esp: 0.045, tipo: 'arqueada' },
    cabelo: { estilo: 'coque', cor: 'carvao', volume: 0.85, prendedor: 'carvao' },
    corpo: { ombro: 0.5, quadril: 0.22 },
    top: { tipo: 'cardiga', cor: 'pretoAssassina', corInterna: 'roxoNoite' },
    calca: { tipo: 'reta', cor: 'pretoAssassina' },
    calcado: { tipo: 'cano-alto', cor: 'pretoAssassina', acento: 'roxoNoite' },
  };
  window.ASSASSINA_EQUIP = {
    cinto: { cor: 'roxoNoite', fivela: 'prata', bolsa: 'pretoAssassina' }, botas: { cor: 'pretoAssassina', cano: 0.6 }, bracadeira: 'roxoNoite',
    cinta: { cor: 'roxoNoite', tachas: 'prata' }, ombreira: { cor: 'roxoNoite', rebites: 'prata' },
  };
  const adaga = (nome) => (pc) => {
    const c = pc.ctx; c.save(); c.rotate(ang(nome, 0));
    pc.peca(P((q) => q.roundRect(-0.04, -0.12, 0.08, 0.26, 0.03)), T('roxoNoite'), { sombra: 0.1 });
    pc.peca(P((q) => { q.moveTo(-0.13, 0.14); q.quadraticCurveTo(0, 0.1, 0.13, 0.14); q.lineTo(0.1, 0.19); q.lineTo(-0.1, 0.19); q.closePath(); }), T('prata'), { sombra: 0.05 });
    pc.peca(P((q) => { q.moveTo(-0.05, 0.19); q.lineTo(0.05, 0.19); q.quadraticCurveTo(0.08, 0.5, 0, 0.78); q.quadraticCurveTo(-0.03, 0.5, -0.05, 0.19); q.closePath(); }), T('laminaClara'), { sombra: 0.15 });
    pc.linha(P((q) => { q.moveTo(0, 0.22); q.lineTo(0.005, 0.66); }), pc.interno * 0.6, 'rgba(120,90,200,0.7)');
    c.restore();
  };
  window.criarAssassina = (o = {}, vista = 'frente') => {
    const def = window.equipar(window.criarPersonagem({ ...window.ASSASSINA_OPCOES, ...o, poses: poses() }, vista), window.ASSASSINA_EQUIP);
    capuz(def, 'roxoNoite', { mascara: 'pretoAssassina' });
    if (!o.semAdagas) { naMao(def, 'd', 'adaga_d', adaga('adaga_d')); naMao(def, 'e', 'adaga_e', adaga('adaga_e')); }
    return def;
  };

  // ---------- Figura encapuzada (quem filma tudo) ----------
  window.ENCAPUZADO_OPCOES = {
    nome: 'Encapuzado', altura: 6.3, cabecaLargura: 0.9, pele: 'pele1', fatorContorno: 1.35,
    olhos: { raio: 0.06, sep: 0.19, iris: 'irisAmbar' }, sobrancelha: { esp: 0.06, tipo: 'reta' },
    cabelo: { estilo: 'liso-lateral', cor: 'carvao', volume: 0.6 },
    corpo: { ombro: 0.58, quadril: 0.22 },
    top: { tipo: 'cardiga', cor: 'cinzaManto', corInterna: 'cinzaMantoEsc' },
    calca: { tipo: 'reta', cor: 'cinzaMantoEsc' },
    calcado: { tipo: 'cano-alto', cor: 'cinzaMantoEsc', acento: 'carvao' },
  };
  window.criarEncapuzado = (o = {}, vista = 'frente') => {
    const def = window.equipar(window.criarPersonagem({ ...window.ENCAPUZADO_OPCOES, ...o, poses: poses() }, vista), { manto: { cor: 'cinzaManto', barra: 'cinzaMantoEsc' }, cinto: { cor: 'carvao', fivela: 'prata' }, botas: { cor: 'cinzaMantoEsc', cano: 0.4 } });
    capuz(def, 'cinzaManto', { semRosto: true });
    // olhos acesos dentro da sombra do capuz
    const cab = def.partes.find((q) => q.nome === 'cabeca'), orig = cab.desenhar;
    cab.desenhar = (pc, ...resto) => { orig(pc, ...resto); if (def.vista === 'costas') return; const dx = def.vista === 'tq' ? 0.09 : def.vista === 'perfil' ? 0.2 : 0; for (const sx of def.vista === 'perfil' ? [0.06] : [-0.12, 0.12]) { pc.preencher(P((q) => q.ellipse(dx + sx, -0.5, 0.05, 0.02, 0, 0, Math.PI * 2)), '#FFC24A'); pc.preencher(P((q) => q.arc(dx + sx, -0.5, 0.11, 0, Math.PI * 2)), 'rgba(255,190,80,0.25)'); } };
    // lente de cristal na mão direita
    naMao(def, 'd', 'lente', (pc) => {
      pc.peca(P((q) => q.roundRect(-0.03, -0.05, 0.06, 0.3, 0.02)), T('madeiraArco'), { sombra: 0.1 });
      pc.peca(P((q) => q.arc(0, 0.42, 0.2, 0, Math.PI * 2)), T('mostarda'), { sombra: 0.15 });
      pc.peca(P((q) => q.arc(0, 0.42, 0.15, 0, Math.PI * 2)), fixo('#BFF2FF', '#5AB8E0', '#FFFFFF'), { sombra: 0.2 });
      pc.preencher(P((q) => q.arc(0, 0.42, 0.34, 0, Math.PI * 2)), 'rgba(150,230,255,0.25)');
      pc.preencher(P((q) => q.ellipse(-0.05, 0.36, 0.05, 0.03, -0.6, 0, Math.PI * 2)), 'rgba(255,255,255,0.9)');
    }, true);
    return def;
  };
})();

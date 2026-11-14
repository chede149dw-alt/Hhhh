// TÉO · HOMEM-FERA — transformação em etapas (série VALDOR, Parte 2).
// criarTeoFera({ estagio }, vista)  estagio: 0 normal · 1 olhos acendem · 2 orelhas, costeletas e garras
//                                    3 pelo no corpo, presas e mangas rasgando · 4 forma fera completa (maior, rabo, sem armas)
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, teo/teo.js, teo/teo-jogo.js.
(function () {
  const T = (n) => Estilo.tom(n);
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  window.TEO_FERA_POSES = {
    ...window.POSES_PADRAO,
    garras: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 28, antebraco_d: -30, braco_e: -28, antebraco_e: 30, coxa_d: 7, canela_d: -4, coxa_e: -7, canela_e: 4, cabeca: 0 } },
    tremendo: { vista: 'frente', expressao: 'cansado', angulos: { braco_d: 14, antebraco_d: -40, braco_e: -14, antebraco_e: 40, coxa_d: 3, coxa_e: -3, cabeca: 6 } },
  };
  window.criarTeoFera = (opcoes = {}, vista = 'frente') => {
    const e = opcoes.estagio === undefined ? 4 : opcoes.estagio;
    const o = { ...window.TEO_OPCOES, ...window.TEO_JOGO_OPCOES };
    if (e >= 1) o.olhos = { ...o.olhos, iris: 'irisAmbar' };
    if (e >= 3) { o.pele = 'peleFera'; o.cabelo = { ...o.cabelo, volume: 1.12 }; o.altura = 6.2; o.corpo = { ombro: 0.62, quadril: 0.2 }; }
    if (e >= 4) { o.altura = 6.6; o.corpo = { ombro: 0.7, quadril: 0.22 }; o.cabelo = { ...o.cabelo, volume: 1.22 }; o.sobrancelha = { esp: 0.07, tipo: 'reta' }; }
    const { estagio, ...resto } = opcoes;
    const def = window.criarPersonagem({ ...o, ...resto, poses: Object.fromEntries(Object.entries(window.TEO_FERA_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
    const eq = { ...window.TEO_JOGO_EQUIP };
    if (e >= 4) { delete eq.arma; delete eq.escudo; }
    window.equipar(def, eq);
    const parte = (n) => def.partes.find((p) => p.nome === n);
    const depois = (n, fn) => { const p = parte(n); if (!p) return; const orig = p.desenhar; p.desenhar = (pc, ...r) => { orig(pc, ...r); fn(pc, ...r); }; };
    const antes = (n, fn) => { const p = parte(n); if (!p) return; const orig = p.desenhar; p.desenhar = (pc, ...r) => { fn(pc, ...r); orig(pc, ...r); }; };
    const pelo = T('peloFera'), cab = T(o.cabelo.cor), garra = T('garra');
    const frente = vista === 'frente', costas = vista === 'costas', lado = vista === 'tq' || vista === 'perfil';
    // cabeça: brilho dos olhos, orelhas de lobo, costeletas de pelo, presas, nariz escuro
    depois('cabeca', (pc) => {
      if (e >= 1 && !costas) {
        const xs = frente ? [-0.19, 0.19] : vista === 'tq' ? [0.12, 0.38] : [0.36];
        for (const x of xs) for (const [r, a] of [[0.16, 0.12], [0.1, 0.22], [0.055, 0.45]]) pc.preencher(P((p) => p.arc(x, -0.37, r, 0, Math.PI * 2)), `rgba(255,214,70,${a * (e >= 4 ? 1.3 : 1)})`);
      }
      if (e >= 2) {
        const orelha = (x, inc, s) => {
          const base = P((p) => { p.moveTo(x - 0.13 * s, -0.86); p.quadraticCurveTo(x + inc - 0.02 * s, -1.25, x + inc + 0.05 * s, -1.42); p.quadraticCurveTo(x + 0.12 * s, -1.15, x + 0.16 * s, -0.84); p.closePath(); });
          pc.peca(base, cab, { sombra: 0.08 });
          pc.preencher(P((p) => { p.moveTo(x - 0.06 * s, -0.9); p.quadraticCurveTo(x + inc, -1.2, x + inc + 0.04 * s, -1.32); p.quadraticCurveTo(x + 0.07 * s, -1.12, x + 0.08 * s, -0.9); p.closePath(); }), '#5A2418');
        };
        if (frente || costas) { orelha(-0.33, -0.12, 1); orelha(0.33, 0.12, -1); }
        else if (vista === 'tq') { orelha(-0.28, -0.1, 1); orelha(0.12, 0.06, -1); }
        else orelha(-0.18, -0.08, 1);
        if (!costas) {
          const cost = (x, s) => pc.peca(P((p) => { p.moveTo(x, -0.52); p.lineTo(x + 0.1 * s, -0.42); p.lineTo(x + 0.02 * s, -0.38); p.lineTo(x + 0.12 * s, -0.27); p.lineTo(x + 0.01 * s, -0.25); p.lineTo(x + 0.08 * s, -0.12); p.lineTo(x - 0.04 * s, -0.2); p.closePath(); }), cab, { sombra: 0.05 });
          if (frente) { cost(-0.47, -1); cost(0.47, 1); } else cost(vista === 'tq' ? -0.42 : -0.3, -1);
        }
      }
      if (e >= 3 && !costas) {
        const fx = frente ? [-0.055, 0.055] : vista === 'tq' ? [0.2, 0.3] : [0.4];
        for (const x of fx) pc.peca(P((p) => { p.moveTo(x - 0.022, -0.155); p.lineTo(x + 0.022, -0.155); p.lineTo(x, -0.09); p.closePath(); }), garra, { sombra: 0, espessura: pc.interno * 0.6 });
        if (e >= 4) { const nx = frente ? 0 : vista === 'tq' ? 0.3 : 0.47; pc.peca(P((p) => p.ellipse(nx, -0.22, 0.05, 0.035, 0, 0, Math.PI * 2)), T('narizFera'), { sombra: 0 }); }
      }
    });
    // garras nas mãos
    if (e >= 2) for (const l of ['d', 'e']) depois('mao_' + l, (pc) => {
      const g = e >= 4 ? 1.5 : 1;
      for (const x of [-0.08, -0.025, 0.03, 0.085]) pc.peca(P((p) => { p.moveTo(x - 0.02, 0.24); p.quadraticCurveTo(x + 0.02, 0.28 + 0.05 * g, x - 0.005, 0.3 + 0.08 * g); p.lineTo(x + 0.02, 0.25); p.closePath(); }), garra, { sombra: 0, espessura: pc.interno * 0.6 });
    });
    // mangas rasgando: o antebraço peludo aparece por baixo da manga em farrapos
    if (e >= 3) {
      const Lante = 0.74 * ((o.altura - 1) / 4.5);
      for (const l of ['d', 'e']) depois('antebraco_' + l, (pc) => {
        const y0 = Lante * (e >= 4 ? 0.15 : 0.45);
        pc.peca(P((p) => { p.moveTo(-0.17, y0); for (let i = 0; i <= 6; i++) p.lineTo(-0.17 + i * 0.057, y0 + (i % 2 ? 0.07 : -0.03)); p.lineTo(0.17, Lante + 0.02); p.lineTo(-0.17, Lante + 0.02); p.closePath(); }), pelo, { sombra: 0.08 });
        pc.linha(P((p) => { for (let i = 0; i < 4; i++) { const y = y0 + 0.1 + i * (Lante - y0) / 4; p.moveTo(-0.08, y); p.lineTo(-0.02, y + 0.05); p.moveTo(0.05, y + 0.02); p.lineTo(0.1, y + 0.06); } }), pc.interno * 0.7, 'rgba(90,30,15,0.6)');
      });
    }
    // juba de pelo no pescoço (por cima da gola) e tufo no peito
    if (e >= 3) depois('tronco', (pc) => {
      const f = (o.altura - 1) / 4.5, ny = -1.4 * f - 0.06, k = e >= 4 ? 1.35 : 0.9, w = (vista === 'perfil' ? 0.32 : 0.48) * k;
      const cx = vista === 'tq' ? 0.12 : vista === 'perfil' ? 0.05 : 0;
      pc.peca(P((p) => { p.moveTo(cx - w, ny + 0.02); const n = 9; for (let i = 0; i <= n; i++) { const x = cx - w + (2 * w * i) / n, y = ny + (i % 2 ? 0.28 * k : 0.12 * k) + Math.sin(i / n * Math.PI) * 0.1 * k; p.lineTo(x, y); } p.lineTo(cx + w, ny - 0.05); p.quadraticCurveTo(cx, ny - 0.12, cx - w, ny - 0.05); p.closePath(); }), cab, { sombra: 0.1 });
      if (!costas && !lado) pc.preencher(P((p) => { p.moveTo(cx - 0.12, ny + 0.2); p.lineTo(cx, ny + 0.42 * k); p.lineTo(cx + 0.12, ny + 0.2); p.closePath(); }), '#F1E2CF');
    });
    if (e >= 4) for (const l of ['d', 'e']) depois('pe_' + l, (pc) => {
      for (const x of [0.05, 0.14, 0.23]) pc.peca(P((p) => { p.moveTo(x, 0.22); p.quadraticCurveTo(x + 0.06, 0.26, x + 0.09, 0.33); p.lineTo(x + 0.03, 0.28); p.closePath(); }), garra, { sombra: 0, espessura: pc.interno * 0.6 });
    });
    // rabo peludo (forma completa)
    if (e >= 4) {
      const rabo = (pc) => {
        const s = vista === 'perfil' ? -1 : 1, bx = vista === 'perfil' ? -0.25 : 0.12;
        pc.peca(P((p) => { p.moveTo(bx, 0.05); p.quadraticCurveTo(bx + 0.95 * s, 0.1, bx + 1.05 * s, 0.85); p.quadraticCurveTo(bx + 0.98 * s, 1.18, bx + 0.72 * s, 1.08); p.quadraticCurveTo(bx + 0.75 * s, 0.45, bx - 0.05 * s, 0.28); p.closePath(); }), cab, { sombra: 0.12 });
        pc.preencher(P((p) => { p.moveTo(bx + 0.98 * s, 0.98); p.quadraticCurveTo(bx + 0.95 * s, 1.16, bx + 0.74 * s, 1.07); p.quadraticCurveTo(bx + 0.86 * s, 1.0, bx + 0.98 * s, 0.98); p.closePath(); }), '#F1E2CF');
      };
      if (costas) depois('quadril', rabo); else antes('quadril', rabo);
    }
    return def;
  };
})();

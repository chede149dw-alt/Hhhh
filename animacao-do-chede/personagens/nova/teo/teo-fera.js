// TÉO · HOMEM-FERA — transformação em etapas (série VALDOR, Parte 2). Versão caprichada (pedido do autor 14/11).
// criarTeoFera({ estagio }, vista)  estagio: 0 normal · 1 olhos acendem · 2 orelhas, costeletas e garras
//                                    3 pelo, presas, juba e mangas rasgando · 4 forma fera completa (patas, rabo, roupa rasgada)
// Carregar: personagem-base.js, nova/cores.js, nova/equipamento.js, teo/teo.js, teo/teo-jogo.js.
(function () {
  const T = (n) => Estilo.tom(n);
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tom = (b, s, l) => ({ base: b, sombra: s, luz: l || b });
  // tons do pelo
  const PELO = tom('#C9542A', '#8E3418', '#E8834F'), PELO_ESC = tom('#7E2E16', '#55200F', '#A0401F'), CREME = tom('#F2E3CC', '#CDB79A', '#FFF6E8');
  const GARRA = tom('#F4EFE4', '#B8B0A2', '#FFFFFF'), NARIZ = tom('#1E1512', '#0E0907', '#4A3A34');
  window.TEO_FERA_POSES = {
    ...window.POSES_PADRAO,
    garras: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 30, antebraco_d: -34, mao_d: -10, braco_e: -30, antebraco_e: 34, mao_e: 10, coxa_d: 9, canela_d: -6, coxa_e: -9, canela_e: 6, cabeca: 0, _desloca: [0, 0.05] } },
    tremendo: { vista: 'frente', expressao: 'cansado', angulos: { braco_d: 14, antebraco_d: -40, braco_e: -14, antebraco_e: 40, coxa_d: 3, coxa_e: -3, cabeca: 6 } },
    rugindo: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 70, antebraco_d: -50, mao_d: -20, braco_e: -70, antebraco_e: 50, mao_e: 20, coxa_d: 12, canela_d: -8, coxa_e: -12, canela_e: 8, cabeca: 0, _desloca: [0, 0.08] } },
  };
  window.criarTeoFera = (opcoes = {}, vista = 'frente') => {
    const e = opcoes.estagio === undefined ? 4 : opcoes.estagio;
    const o = { ...window.TEO_OPCOES, ...window.TEO_JOGO_OPCOES };
    // roupa: estilo das roupas novas (window.TEO_ROUPAS, ex.: 'B' = Guardião da Parte 3+) em vez da roupa da Parte 2
    const R = opcoes.roupa && window.TEO_ROUPAS ? window.TEO_ROUPAS[opcoes.roupa] : null;
    if (R) { o.top = R.top; o.calca = R.calca; o.calcado = R.calcado; }
    if (e >= 1) o.olhos = { ...o.olhos, iris: 'irisAmbar' };
    if (e >= 3) { o.pele = 'peleFera'; o.cabelo = { ...o.cabelo, volume: 1.12 }; o.altura = 6.2; o.corpo = { ombro: 0.62, quadril: 0.2 }; }
    if (e >= 4) { o.altura = 6.6; o.corpo = { ombro: 0.72, quadril: 0.22 }; o.cabelo = { ...o.cabelo, volume: 1.24 }; o.sobrancelha = { esp: 0.08, tipo: 'reta' }; }
    const { estagio, roupa, ...resto } = opcoes;
    const def = window.criarPersonagem({ ...o, ...resto, poses: Object.fromEntries(Object.entries(window.TEO_FERA_POSES).map(([k, v]) => [k, v.angulos])) }, vista);
    const eq = { ...(R ? R.eq : window.TEO_JOGO_EQUIP) };
    if (R && e >= 3) delete eq.capa; // a capa rasga e cai na transformação
    if (e >= 4) { delete eq.arma; delete eq.escudo; }
    window.equipar(def, eq);
    const parte = (n) => def.partes.find((p) => p.nome === n);
    const depois = (n, fn) => { const p = parte(n); if (!p) return; const orig = p.desenhar; p.desenhar = (pc, ...r) => { orig(pc, ...r); fn(pc, ...r); }; };
    const antes = (n, fn) => { const p = parte(n); if (!p) return; const orig = p.desenhar; p.desenhar = (pc, ...r) => { fn(pc, ...r); orig(pc, ...r); }; };
    const trocar = (n, fn) => { const p = parte(n); if (p) p.desenhar = fn; };
    const frente = vista === 'frente', costas = vista === 'costas', perfil = vista === 'perfil', tq = vista === 'tq', lado = tq || perfil;
    const f = (o.altura - 1) / 4.5, Lante = 0.74 * f, Lbraco = 0.78 * f;
    // tufo de pelo: leque de pontas a partir de uma base
    const tufo = (pc, x, y, w, h, n, cor, ang = 0, esp = 0.6) => pc.peca(P((p) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), R = (px, py) => [x + px * ca - py * sa, y + px * sa + py * ca];
      p.moveTo(...R(-w / 2, 0));
      for (let i = 0; i < n; i++) { const a = -w / 2 + (w * (i + 0.5)) / n; p.quadraticCurveTo(...R(a - w / n * 0.4, -h * 0.55), ...R(a + (i % 2 ? 0.01 : -0.01), -h * (0.8 + 0.2 * ((i * 7) % 3) / 2))); p.quadraticCurveTo(...R(a + w / n * 0.3, -h * 0.4), ...R(a + w / n / 2, 0)); }
      p.closePath();
    }), cor, { sombra: 0.06, espessura: esp ? pc.interno * esp : undefined });
    // ---------- cabeça ----------
    depois('cabeca', (pc) => {
      if (e >= 2) {
        // orelhas de lobo com tufos claros por dentro e ponta escura
        const orelha = (x, inc, s, k = 1) => {
          const fora = P((p) => { p.moveTo(x - 0.14 * s, -0.84); p.quadraticCurveTo(x + inc - 0.04 * s, -1.22, x + inc + 0.04 * s, -1.46 * k); p.quadraticCurveTo(x + 0.14 * s, -1.16, x + 0.17 * s, -0.82); p.closePath(); });
          pc.peca(fora, PELO, { sombra: 0.1 });
          pc.preencher(P((p) => { p.moveTo(x + inc - 0.01 * s, -1.33 * k); p.quadraticCurveTo(x + inc + 0.04 * s, -1.42 * k, x + inc + 0.04 * s, -1.46 * k); p.quadraticCurveTo(x + inc + 0.07 * s, -1.36 * k, x + inc + 0.06 * s, -1.3 * k); p.closePath(); }), PELO_ESC.base);
          pc.preencher(P((p) => { p.moveTo(x - 0.07 * s, -0.88); p.quadraticCurveTo(x + inc, -1.18, x + inc + 0.035 * s, -1.33 * k); p.quadraticCurveTo(x + 0.08 * s, -1.1, x + 0.09 * s, -0.88); p.closePath(); }), '#4A1C12');
          for (let i = 0; i < 2; i++) pc.linha(P((p) => { const bx = x - 0.02 * s + i * 0.04 * s; p.moveTo(bx, -0.88); p.quadraticCurveTo(bx + inc * 0.3, -0.98, bx + inc * 0.45 + 0.01 * s, -1.04 - i * 0.04); }), pc.interno * 0.9, 'rgba(242,227,204,0.75)');
        };
        if (frente || costas) { orelha(-0.33, -0.12, 1); orelha(0.33, 0.12, -1); }
        else if (tq) { orelha(-0.3, -0.1, 1); orelha(0.1, 0.06, -1, 0.97); }
        else orelha(-0.18, -0.08, 1);
      }
      if (e >= 1 && !costas) {
        // olhos acesos (pupila de fera a partir da etapa 3)
        const xs = frente ? [-0.19, 0.19] : tq ? [0.12, 0.38] : [0.36];
        for (const x of xs) {
          for (const [r, a] of [[0.17, 0.1], [0.11, 0.2], [0.06, 0.4]]) pc.preencher(P((p) => p.arc(x, -0.37, r, 0, Math.PI * 2)), `rgba(255,214,70,${a * (e >= 4 ? 1.3 : 1)})`);
          if (e >= 3) {
            const kx = frente ? 1 : 0.7;
            pc.preencher(P((p) => p.ellipse(x, -0.37, 0.065 * kx, 0.055, 0, 0, Math.PI * 2)), '#FFC23A');
            pc.preencher(P((p) => p.ellipse(x, -0.37, 0.016 * kx, 0.05, 0, 0, Math.PI * 2)), '#140A06');
            pc.preencher(P((p) => p.arc(x - 0.02, -0.39, 0.012, 0, Math.PI * 2)), '#FFFFFF');
          }
        }
      }
      if (e >= 2 && !costas) {
        // costeletas de pelo em camadas
        const cost = (x, s) => pc.peca(P((p) => { p.moveTo(x - 0.05 * s, -0.5); p.quadraticCurveTo(x + 0.06 * s, -0.47, x + 0.13 * s, -0.43); p.lineTo(x + 0.05 * s, -0.37); p.lineTo(x + 0.15 * s, -0.31); p.lineTo(x + 0.05 * s, -0.26); p.lineTo(x + 0.12 * s, -0.17); p.lineTo(x + 0.02 * s, -0.16); p.lineTo(x + 0.04 * s, -0.07); p.quadraticCurveTo(x - 0.06 * s, -0.12, x - 0.08 * s, -0.25); p.closePath(); }), PELO, { sombra: 0.08 });
        if (frente) { cost(-0.47, -1); cost(0.47, 1); } else cost(tq ? -0.42 : -0.3, -1);
      }
      if (e >= 3 && !costas) {
        const mx = frente ? 0 : tq ? 0.2 : 0.38, kx = frente ? 1 : tq ? 0.8 : 0.5;
        // focinho claro, sobrancelha de pelo, nariz e boca rosnando com presas
        pc.peca(P((p) => p.ellipse(mx, -0.16, 0.17 * kx, 0.11, 0, 0, Math.PI * 2)), CREME, { sombra: 0.05, espessura: pc.interno * 0.5 });
        if (frente) for (const s of [-1, 1]) pc.preencher(P((p) => { p.moveTo(0.05 * s, -0.47); p.lineTo(0.3 * s, -0.5); p.lineTo(0.27 * s, -0.44); p.lineTo(0.08 * s, -0.42); p.closePath(); }), PELO_ESC.base);
        const boca = P((p) => { p.moveTo(mx - 0.11 * kx, -0.14); p.quadraticCurveTo(mx, -0.16, mx + 0.11 * kx, -0.14); p.quadraticCurveTo(mx + 0.08 * kx, -0.04, mx, -0.035); p.quadraticCurveTo(mx - 0.08 * kx, -0.04, mx - 0.11 * kx, -0.14); p.closePath(); });
        pc.preencher(boca, '#5A1018');
        pc.preencher(P((p) => p.ellipse(mx, -0.06, 0.05 * kx, 0.02, 0, 0, Math.PI * 2)), '#C24A5A');
        for (const s of [-1, 1]) {
          const fx = mx + 0.065 * kx * s;
          pc.peca(P((p) => { p.moveTo(fx - 0.02 * kx, -0.145); p.lineTo(fx + 0.02 * kx, -0.145); p.lineTo(fx, -0.07); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.5 });
          pc.peca(P((p) => { p.moveTo(fx - 0.016 * kx, -0.04); p.lineTo(fx + 0.016 * kx, -0.04); p.lineTo(fx, -0.09); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.5 });
        }
        pc.peca(P((p) => { p.moveTo(mx - 0.06 * kx, -0.25); p.quadraticCurveTo(mx, -0.27, mx + 0.06 * kx, -0.25); p.quadraticCurveTo(mx + 0.05 * kx, -0.19, mx, -0.185); p.quadraticCurveTo(mx - 0.05 * kx, -0.19, mx - 0.06 * kx, -0.25); p.closePath(); }), NARIZ, { sombra: 0 });
        pc.preencher(P((p) => p.ellipse(mx - 0.02 * kx, -0.24, 0.018, 0.008, 0, 0, Math.PI * 2)), 'rgba(255,255,255,0.7)');
      }
    });
    // ---------- patas (mãos) ----------
    if (e >= 2) for (const l of ['d', 'e']) {
      if (e >= 3) trocar('mao_' + l, (pc) => {
        const g = e >= 4 ? 1.25 : 1;
        tufo(pc, 0, 0.02, 0.36 * g, 0.12, 5, PELO, Math.PI, 0.5);
        pc.peca(P((p) => p.roundRect(-0.14 * g, -0.03, 0.28 * g, 0.24 * g, 0.1 * g)), PELO, { sombra: 0.08 });
        for (let i = 0; i < 4; i++) {
          const x = (-0.105 + i * 0.07) * g;
          pc.peca(P((p) => p.roundRect(x - 0.035 * g, 0.14 * g, 0.07 * g, 0.16 * g, 0.035 * g)), PELO, { sombra: 0.06 });
          pc.peca(P((p) => { p.moveTo(x - 0.026 * g, 0.28 * g); p.quadraticCurveTo(x + 0.03 * g, 0.33 * g, x + 0.006 * g, 0.44 * g); p.quadraticCurveTo(x - 0.012 * g, 0.36 * g, x - 0.026 * g, 0.28 * g); p.closePath(); }), GARRA, { sombra: 0.04, espessura: pc.interno * 0.6 });
        }
        pc.preencher(P((p) => p.ellipse(0, 0.08 * g, 0.07 * g, 0.05 * g, 0, 0, Math.PI * 2)), PELO_ESC.base);
      });
      else depois('mao_' + l, (pc) => { for (const x of [-0.08, -0.025, 0.03, 0.085]) pc.peca(P((p) => { p.moveTo(x - 0.02, 0.24); p.quadraticCurveTo(x + 0.02, 0.33, x - 0.005, 0.38); p.lineTo(x + 0.02, 0.25); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 }); });
    }
    // ---------- mangas rasgando: antebraço peludo em farrapos ----------
    if (e >= 3) for (const l of ['d', 'e']) depois('antebraco_' + l, (pc) => {
      const y0 = Lante * (e >= 4 ? 0.08 : 0.42);
      pc.peca(P((p) => { p.moveTo(-0.19, y0); for (let i = 0; i <= 7; i++) p.lineTo(-0.19 + i * 0.054, y0 + (i % 2 ? 0.09 : -0.04)); p.lineTo(0.19, Lante + 0.03); p.lineTo(-0.19, Lante + 0.03); p.closePath(); }), PELO, { sombra: 0.1 });
      for (let i = 0; i < 4; i++) tufo(pc, -0.12 + (i % 2) * 0.12, y0 + 0.14 + i * (Lante - y0) / 4.5, 0.12, 0.08, 3, PELO_ESC, Math.PI + (i % 2 ? 0.4 : -0.4), 0);
      pc.peca(P((p) => { p.moveTo(-0.2, y0 - 0.06); for (let i = 0; i <= 6; i++) p.lineTo(-0.2 + i * 0.067, y0 - 0.06 + (i % 2 ? 0.1 : 0)); p.lineTo(0.2, y0 - 0.1); p.lineTo(-0.2, y0 - 0.1); p.closePath(); }), T('verdeFloresta'), { sombra: 0.05 });
    });
    if (e >= 4) for (const l of ['d', 'e']) depois('braco_' + l, (pc) => {
      // rasgo no ombro com pelo aparecendo
      pc.peca(P((p) => { p.moveTo(-0.08, Lbraco * 0.2); p.lineTo(0.02, Lbraco * 0.14); p.lineTo(0.1, Lbraco * 0.3); p.lineTo(0.0, Lbraco * 0.42); p.lineTo(-0.1, Lbraco * 0.34); p.closePath(); }), PELO, { sombra: 0.05 });
      tufo(pc, 0, Lbraco * 0.28, 0.12, 0.07, 3, PELO_ESC, 0, 0);
    });
    // ---------- juba, peito e túnica rasgada ----------
    if (e >= 3) depois('tronco', (pc) => {
      const ny = -1.4 * f - 0.06, k = e >= 4 ? 1.35 : 0.9, w = (perfil ? 0.32 : 0.5) * k;
      const cx = tq ? 0.12 : perfil ? 0.05 : 0;
      // gola de pelo em duas camadas: pontas para cima (atrás do pescoço) e para baixo (no peito e ombros)
      const gola = (ww, alto, baixo, n, cor) => pc.peca(P((p) => {
        p.moveTo(cx - ww, ny + 0.06);
        for (let i = 0; i <= n; i++) { const t = i / n, x = cx - ww + 2 * ww * t, arco = Math.sin(t * Math.PI); p.lineTo(x, ny + 0.06 + (i % 2 ? baixo : baixo * 0.45) * (0.55 + 0.45 * arco)); }
        for (let i = n; i >= 0; i--) { const t = i / n, x = cx - ww * 0.82 + 1.64 * ww * t, arco = Math.sin(t * Math.PI); p.lineTo(x, ny + 0.02 - (i % 2 ? alto : alto * 0.4) * (0.3 + 0.7 * arco)); }
        p.closePath();
      }), cor, { sombra: 0.1 });
      gola(w * 1.08, 0.2 * k, 0.36 * k, 11, PELO_ESC);
      gola(w, 0.14 * k, 0.28 * k, 9, PELO);
      if (!costas && !perfil) {
        pc.peca(P((p) => { p.moveTo(cx - 0.16 * k, ny + 0.18); for (let i = 0; i <= 6; i++) { const x = cx - 0.16 * k + (0.32 * k * i) / 6; p.lineTo(x, ny + 0.2 + (i % 2 ? 0.08 : 0) + Math.sin(i / 6 * Math.PI) * 0.32 * k); } p.closePath(); }), CREME, { sombra: 0.05, espessura: pc.interno * 0.5 });
      }
      if (e >= 4 && !perfil) {
        // barra da túnica rasgada
        const hy = 0.49 * f, hw = (0.72 + 0.02) * (tq ? 0.94 : 1);
        pc.preencher(P((p) => { p.moveTo(cx - hw - 0.02, hy - 0.02); for (let i = 0; i <= 12; i++) p.lineTo(cx - hw + (2 * hw * i) / 12, hy - 0.02 - (i % 2 ? 0.12 : 0.02) - ((i * 5) % 3) * 0.02); p.lineTo(cx + hw + 0.02, hy + 0.1); p.lineTo(cx - hw - 0.02, hy + 0.1); p.closePath(); }), 'rgba(0,0,0,0)');
      }
    });
    // ---------- calça rasgada na canela + garras saindo da bota ----------
    if (e >= 4) {
      const Lcanela = o.altura - 0.35 - (1 + 3 * f);
      for (const l of ['d', 'e']) depois('canela_' + l, (pc) => {
        const y0 = Lcanela * 0.5;
        pc.peca(P((p) => { p.moveTo(-0.17, y0); for (let i = 0; i <= 6; i++) p.lineTo(-0.17 + i * 0.057, y0 + (i % 2 ? 0.1 : 0)); p.lineTo(0.17, Lcanela - 0.42); p.lineTo(-0.17, Lcanela - 0.42); p.closePath(); }), PELO, { sombra: 0.08 });
        tufo(pc, 0, Lcanela - 0.42, 0.34, 0.08, 5, PELO_ESC, Math.PI, 0);
      });
      for (const l of ['d', 'e']) depois('pe_' + l, (pc) => {
        for (const x of [0.06, 0.15, 0.24]) pc.peca(P((p) => { p.moveTo(x, 0.2); p.quadraticCurveTo(x + 0.07, 0.24, x + 0.1, 0.34); p.lineTo(x + 0.03, 0.27); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
      });
    }
    // ---------- rabo volumoso em camadas ----------
    if (e >= 4) {
      const rabo = (pc) => {
        const s = perfil ? -1 : 1, bx = perfil ? -0.25 : 0.14;
        const forma = P((p) => { p.moveTo(bx, 0.05); p.quadraticCurveTo(bx + 1.0 * s, 0.05, bx + 1.1 * s, 0.85); p.quadraticCurveTo(bx + 1.02 * s, 1.22, bx + 0.74 * s, 1.1); p.quadraticCurveTo(bx + 0.8 * s, 0.45, bx - 0.05 * s, 0.3); p.closePath(); });
        pc.peca(forma, PELO, { sombra: 0.14 });
        pc.ctx.save(); pc.ctx.clip(forma);
        for (let i = 0; i < 6; i++) pc.linha(P((p) => { const t = i / 6; p.moveTo(bx + (0.2 + t * 0.75) * s, 0.12 + t * 0.6); p.quadraticCurveTo(bx + (0.35 + t * 0.7) * s, 0.25 + t * 0.6, bx + (0.3 + t * 0.72) * s, 0.4 + t * 0.6); }), pc.interno * 1.2, PELO_ESC.base);
        pc.ctx.restore();
        pc.peca(P((p) => { p.moveTo(bx + 1.04 * s, 0.92); p.quadraticCurveTo(bx + 1.02 * s, 1.2, bx + 0.76 * s, 1.1); p.quadraticCurveTo(bx + 0.86 * s, 1.0, bx + 0.84 * s, 0.9); p.quadraticCurveTo(bx + 0.95 * s, 0.98, bx + 1.04 * s, 0.92); p.closePath(); }), CREME, { sombra: 0.05 });
      };
      if (costas) depois('quadril', rabo); else antes('quadril', rabo);
    }
    return def;
  };
})();

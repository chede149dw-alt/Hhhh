// GOLEM · GUARDIÃO DE PEDRA (série "E se você acordasse controlando a terra?", Parte 2)
// Criatura de pedra com facetas de luz e sombra, rachaduras laranja brilhando por dentro (a mesma cor do poder do
// Lucas), olhos acesos, cristais laranja nas costas/ombros, musgo e o SÍMBOLO DA TERRA no peito (o mesmo do amuleto
// da mãe). Ombros enormes, cabeça pequena afundada, braços longos até o joelho, pernas curtas e grossas.
// criarGolem(opcoes, vista)  vista: 'frente' | 'tq' | 'perfil' | 'costas'  (tq/perfil olham para a DIREITA)
//   opcoes.brilho (0..1, padrão 1): força das rachaduras e dos olhos
//   opcoes.monta (0..1, padrão 1): 0 = pedras espalhadas, 1 = golem montado (para a cena em que o chão se levanta)
// Poses: GOLEM_POSES (parado, punho, soco, erguendo, ajoelhado, tq, perfil, costas). Altura: 8 H.
(function () {
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tom = (b, s, l) => ({ base: b, sombra: s, luz: l || b });
  const PEDRA = tom('#7C7486', '#4E4858', '#A39CAE'), PEDRA2 = tom('#6A6374', '#423C4B', '#8F889A');
  const PEDRA3 = tom('#8C8494', '#5A5363', '#B4ADBC'), MUSGO = tom('#5E8A4A', '#3C5E30', '#86B46A');
  const CRISTAL = tom('#FF9A3C', '#C25A18', '#FFD9A0');
  const A = 8.0, HIP = 4.05;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  window.GOLEM_POSES = {
    parado: { vista: 'frente', expressao: 'neutro', angulos: { braco_d: 10, antebraco_d: -6, braco_e: -10, antebraco_e: 6, coxa_d: 6, canela_d: -3, coxa_e: -6, canela_e: 3 } },
    punho: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 150, antebraco_d: 40, mao_d: 10, braco_e: -28, antebraco_e: 30, tronco: -6, cabeca: 4, coxa_d: 14, canela_d: -6, coxa_e: -10, canela_e: 6, _desloca: [0, 0.1] } },
    soco: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 88, antebraco_d: -8, mao_d: 0, braco_e: -40, antebraco_e: 46, tronco: 8, coxa_d: 18, canela_d: -10, coxa_e: -16, canela_e: 12, _desloca: [0, 0.16] } },
    erguendo: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 160, antebraco_d: 18, braco_e: -160, antebraco_e: -18, cabeca: -8, coxa_d: 10, coxa_e: -10 } },
    ajoelhado: { vista: 'tq', expressao: 'neutro', angulos: { tronco: 22, cabeca: 22, braco_d: -30, antebraco_d: -40, mao_d: -10, braco_e: 28, antebraco_e: -60, coxa_d: -82, canela_d: 82, pe_d: 0, coxa_e: 12, canela_e: 70, pe_e: -60, _desloca: [0, 1.05] } },
    tq: { vista: 'tq', expressao: 'neutro', angulos: { braco_d: -8, antebraco_d: -14, braco_e: 10, antebraco_e: -12, coxa_d: -8, canela_d: 12, coxa_e: 8, canela_e: 10, tronco: 4 } },
    perfil: { vista: 'perfil', expressao: 'neutro', angulos: { braco_d: -12, antebraco_d: -20, braco_e: 10, antebraco_e: -18, tronco: 10, cabeca: -8, coxa_d: -14, canela_d: 20, coxa_e: 6, canela_e: 18 } },
    costas: { vista: 'costas', expressao: 'neutro', angulos: { braco_d: -10, antebraco_d: 6, braco_e: 10, antebraco_e: -6, coxa_d: -6, coxa_e: 6 } },
  };

  // pedra facetada: polígono com facetas (centro → arestas) clareando para a luz (de cima à esquerda)
  function rocha(pc, pts, cor, o = {}) {
    const caminho = P((p) => { pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); });
    pc.peca(caminho, cor, { sombra: o.sombra === undefined ? 0.18 : o.sombra });
    const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length + (o.cx || 0), cy = pts.reduce((a, q) => a + q[1], 0) / pts.length + (o.cy || 0);
    pc.ctx.save(); pc.ctx.clip(caminho);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const nx = (a[1] + b[1]) / 2 - cy, ny = -((a[0] + b[0]) / 2 - cx); // normal "para fora" girada
      const mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy, L = Math.hypot(mx, my) || 1;
      const luz = (-mx / L) * 0.62 + (-my / L) * 0.78; // luz vem de cima/esquerda
      const face = P((p) => { p.moveTo(cx, cy); p.lineTo(a[0], a[1]); p.lineTo(b[0], b[1]); p.closePath(); });
      if (luz > 0.25) pc.preencher(face, `rgba(255,244,230,${0.16 * luz})`);
      else if (luz < -0.2) pc.preencher(face, `rgba(30,20,45,${0.22 * -luz})`);
      void nx; void ny;
    }
    pc.ctx.restore();
    if (o.aresta !== false) pc.linha(P((p) => { for (let i = 0; i < pts.length; i += 2) { p.moveTo(cx, cy); p.lineTo(pts[i][0], pts[i][1]); } }), pc.interno * 0.7, 'rgba(40,30,55,0.25)');
    return caminho;
  }
  // rachadura brilhando (camadas: halo laranja, linha âmbar, miolo claro)
  function racha(pc, pts, k, brilho) {
    if (brilho <= 0) return;
    const c = P((p) => pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))));
    pc.linha(c, pc.interno * 4.2 * k, `rgba(255,120,30,${0.28 * brilho})`);
    pc.linha(c, pc.interno * 1.9 * k, `rgba(255,170,70,${0.9 * brilho})`);
    pc.linha(c, pc.interno * 0.8 * k, `rgba(255,236,190,${brilho})`);
  }
  function cristal(pc, x, y, h, ang, brilho) {
    const s = Math.sin(ang), c = Math.cos(ang), w = h * 0.28;
    const pt = (u, v) => [x + u * c - v * s, y + u * s + v * c];
    const forma = [pt(-w, 0), pt(-w * 0.8, -h * 0.75), pt(0, -h), pt(w * 0.8, -h * 0.72), pt(w, 0)];
    const caminho = P((p) => { forma.forEach(([a, b], i) => (i ? p.lineTo(a, b) : p.moveTo(a, b))); p.closePath(); });
    pc.peca(caminho, CRISTAL, { sombra: 0.25 });
    const meio = P((p) => { const a = pt(0, -h), b = pt(0, 0); p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); });
    pc.linha(meio, pc.interno * 0.8, `rgba(255,240,210,${0.7 * brilho + 0.2})`);
    pc.preencher(P((p) => { const a = pt(-w * 0.8, -h * 0.75), b = pt(0, -h), d = pt(0, -h * 0.2); p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); p.lineTo(d[0], d[1]); p.closePath(); }), `rgba(255,250,235,${0.35 + 0.3 * brilho})`);
  }
  function musgo(pc, x, y, w) {
    pc.peca(P((p) => { p.moveTo(x - w, y); for (let i = 0; i <= 6; i++) { const t = i / 6; p.quadraticCurveTo(x - w + (t - 0.08) * 2 * w, y - 0.16 - (i % 2) * 0.08, x - w + t * 2 * w, y - 0.02); } p.lineTo(x + w, y + 0.1); p.quadraticCurveTo(x, y + 0.18, x - w, y + 0.1); p.closePath(); }), MUSGO, { sombra: 0.2 });
  }
  // símbolo da terra: losango com uma montanha e três raízes (o mesmo do amuleto)
  window.desenharSimboloTerra = function (ctx, x, y, r, brilho = 1, cor = '255,170,70') {
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tracar = () => {
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.82, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.82, 0); ctx.closePath();
      ctx.moveTo(-r * 0.46, r * 0.12); ctx.lineTo(-r * 0.12, -r * 0.42); ctx.lineTo(r * 0.06, -r * 0.14); ctx.lineTo(r * 0.22, -r * 0.3); ctx.lineTo(r * 0.46, r * 0.12);
      ctx.moveTo(0, r * 0.12); ctx.lineTo(0, r * 0.62); ctx.moveTo(0, r * 0.32); ctx.lineTo(-r * 0.2, r * 0.56); ctx.moveTo(0, r * 0.32); ctx.lineTo(r * 0.2, r * 0.56);
    };
    tracar(); ctx.strokeStyle = `rgba(${cor},${0.3 * brilho})`; ctx.lineWidth = r * 0.34; ctx.stroke();
    tracar(); ctx.strokeStyle = `rgba(${cor},${0.95 * brilho})`; ctx.lineWidth = r * 0.13; ctx.stroke();
    tracar(); ctx.strokeStyle = `rgba(255,240,210,${brilho})`; ctx.lineWidth = r * 0.05; ctx.stroke();
    ctx.restore();
  };

  window.criarGolem = (opcoes = {}, vista = 'frente') => {
    const frente = vista === 'frente', costas = vista === 'costas', perfil = vista === 'perfil', tq = vista === 'tq', lado = tq || perfil;
    const br = opcoes.brilho === undefined ? 1 : opcoes.brilho, monta = opcoes.monta === undefined ? 1 : opcoes.monta;
    const LB = 1.55, LA = 1.45, LC = 1.25, LK = 1.15;
    const kx = perfil ? 0.62 : tq ? 0.84 : 1, ox = perfil ? 0.15 : tq ? 0.12 : 0;
    const X = (x) => ox + x * kx;
    // espalha as peças quando o golem ainda está se montando
    const espalha = (nome, f) => (pc) => {
      if (monta >= 0.999) return f(pc);
      const r = rng([...nome].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
      const d = 1 - monta, e = d * d;
      // cada peça cai até o chão (y ≈ 7,6 H) e fica amontoada; quanto mais alta a peça, mais ela cai
      const alturaPeca = { cabeca: 0.6, pescoco: 1.0, cristais: 1.6, tronco: 2.4, braco: 1.6, musgo: 1.3, antebraco: 3.0, mao: 4.3, quadril: 4.0, coxa: 4.8, canela: 6.0, pe: 7.2 }[nome.replace(/_[de]$/, '')] || 4;
      pc.ctx.save(); pc.ctx.translate((r() - 0.5) * 3.0 * e, (7.4 - alturaPeca) * e * (0.85 + 0.15 * r())); pc.ctx.rotate((r() - 0.5) * 2.2 * e);
      f(pc); pc.ctx.restore();
    };

    // ================= TRONCO =================
    function tronco(pc) {
      const caixa = [[X(-1.25), -2.95], [X(-0.55), -3.25], [X(0.55), -3.25], [X(1.25), -2.95], [X(1.42), -2.15], [X(1.12), -1.1], [X(0.82), -0.2], [X(0.0), 0.08], [X(-0.82), -0.2], [X(-1.12), -1.1], [X(-1.42), -2.15]];
      rocha(pc, caixa, PEDRA, { sombra: 0.24, cy: -0.4 });
      // placas do peito e do abdômen
      if (!costas) {
        rocha(pc, [[X(-0.95), -2.85], [X(-0.12), -3.0], [X(-0.05), -2.0], [X(-0.85), -1.75], [X(-1.18), -2.2]], PEDRA3, { sombra: 0.12 });
        rocha(pc, [[X(0.95), -2.85], [X(0.12), -3.0], [X(0.05), -2.0], [X(0.85), -1.75], [X(1.18), -2.2]], PEDRA3, { sombra: 0.12 });
        rocha(pc, [[X(-0.7), -1.55], [X(0.7), -1.55], [X(0.55), -0.6], [X(0), -0.4], [X(-0.55), -0.6]], PEDRA2, { sombra: 0.12 });
        racha(pc, [[X(-0.05), -3.1], [X(0.02), -2.4], [X(-0.08), -1.95], [X(0.04), -1.2], [X(-0.03), -0.3]], 1, br);
        racha(pc, [[X(-0.85), -1.7], [X(-0.5), -1.25], [X(-0.62), -0.8]], 0.7, br * 0.8);
        racha(pc, [[X(0.9), -1.62], [X(0.55), -1.15], [X(0.7), -0.7]], 0.7, br * 0.8);
        if (!perfil) {
          const m = pc.ctx.getTransform();
          pc.ctx.save(); pc.ctx.setTransform(m); pc.ctx.scale(kx, 1);
          window.desenharSimboloTerra(pc.ctx, ox / kx, -2.25, 0.42, br);
          pc.ctx.restore();
        }
      } else {
        // costas: coluna de pedras e cristais grandes
        for (let i = 0; i < 4; i++) rocha(pc, [[-0.26, -3.0 + i * 0.7], [0.26, -3.0 + i * 0.7], [0.3, -2.45 + i * 0.7], [-0.3, -2.45 + i * 0.7]], PEDRA2, { sombra: 0.1, aresta: false });
        racha(pc, [[-0.9, -2.6], [-0.5, -2.0], [-0.8, -1.2]], 0.8, br);
        racha(pc, [[0.95, -2.4], [0.55, -1.7], [0.85, -0.9]], 0.8, br);
      }
    }
    function cristaisCostas(pc) {
      const lista = costas ? [[-0.7, -2.9, 1.1, -0.35], [-0.2, -3.15, 1.35, -0.1], [0.35, -3.05, 1.15, 0.2], [0.85, -2.75, 0.9, 0.45], [-1.05, -2.5, 0.75, -0.6]]
        : lado ? [[-0.55, -3.0, 0.95, -0.5], [-0.75, -2.5, 0.75, -0.9], [-0.25, -3.2, 0.8, -0.25]] : [[-1.0, -2.95, 0.7, -0.6], [1.05, -2.95, 0.65, 0.55], [-0.6, -3.2, 0.55, -0.25]];
      for (const [x, y, h, a] of lista) cristal(pc, X(x), y, h, a, br);
    }
    function quadril(pc) {
      rocha(pc, [[X(-0.95), -0.25], [X(0.95), -0.25], [X(1.0), 0.32], [X(0.4), 0.55], [X(-0.4), 0.55], [X(-1.0), 0.32]], PEDRA2, { sombra: 0.2 });
      if (!costas) racha(pc, [[X(-0.4), 0.0], [X(0.0), 0.25], [X(0.35), 0.05]], 0.6, br * 0.7);
    }
    function pescoco(pc) { rocha(pc, [[-0.42, -0.1], [0.42, -0.1], [0.38, 0.3], [-0.38, 0.3]], PEDRA2, { sombra: 0.2, aresta: false }); }
    function cabeca(pc) {
      // cabeça pequena e quadrada, testa pesada
      const k = perfil ? 0.75 : tq ? 0.9 : 1, dx = perfil ? 0.18 : tq ? 0.1 : 0;
      const forma = [[dx - 0.58 * k, -0.95], [dx - 0.3 * k, -1.15], [dx + 0.32 * k, -1.15], [dx + 0.6 * k, -0.95], [dx + 0.66 * k, -0.35], [dx + 0.42 * k, 0.0], [dx - 0.42 * k, 0.0], [dx - 0.66 * k, -0.35]];
      rocha(pc, forma, PEDRA3, { sombra: 0.22 });
      if (costas) { racha(pc, [[-0.2, -1.0], [0.05, -0.6], [-0.1, -0.2]], 0.6, br * 0.6); return; }
      // testa (sobrancelha de pedra)
      rocha(pc, [[dx - 0.62 * k, -0.78], [dx + 0.64 * k, -0.78], [dx + 0.55 * k, -0.55], [dx - 0.55 * k, -0.55]], PEDRA2, { sombra: 0.1, aresta: false });
      // olhos acesos (fendas) — 2 de frente/3-4, 1 de perfil
      const ex = rig_ex(pc);
      const ab = 0.07 + 0.04 * (ex === 'raiva' ? -0.4 : 0);
      const olhos = perfil ? [dx + 0.42] : tq ? [dx + 0.02, dx + 0.48] : [-0.26, 0.26];
      for (const x of olhos) {
        const w = perfil ? 0.13 : 0.16;
        const ol = P((p) => { p.moveTo(x - w, -0.5); p.lineTo(x + w, -0.5 - (ex === 'raiva' ? 0.04 * Math.sign(x - dx || 1) : 0)); p.lineTo(x + w * 0.8, -0.5 + ab); p.lineTo(x - w * 0.8, -0.5 + ab); p.closePath(); });
        pc.preencher(ol, '#1A0E08');
        pc.preencher(ol, `rgba(255,190,90,${br})`);
        pc.linha(ol, pc.interno * 3, `rgba(255,140,40,${0.35 * br})`);
      }
      // boca: fenda brilhando fraca
      racha(pc, [[dx - 0.25 * k, -0.18], [dx + (perfil ? 0.4 : 0.25) * k, -0.16]], 0.5, br * 0.6);
    }
    const rig_ex = () => 'neutro';
    function braco(pc) {
      rocha(pc, [[-0.62, -0.35], [0.0, -0.62], [0.62, -0.35], [0.6, 0.4], [0.0, 0.62], [-0.6, 0.4]], PEDRA3, { sombra: 0.2 }); // ombreira
      rocha(pc, [[-0.42, 0.25], [0.42, 0.25], [0.46, LB * 0.6], [0.36, LB + 0.08], [-0.36, LB + 0.08], [-0.46, LB * 0.6]], PEDRA, { sombra: 0.2 });
      racha(pc, [[0.05, 0.45], [-0.12, 0.85], [0.08, 1.3]], 0.6, br * 0.8);
    }
    function ombroMusgo(pc) { musgo(pc, 0, -0.5, 0.5); }
    function antebraco(pc) {
      rocha(pc, [[-0.42, -0.05], [0.42, -0.05], [0.55, LA * 0.5], [0.48, LA + 0.06], [-0.48, LA + 0.06], [-0.55, LA * 0.5]], PEDRA2, { sombra: 0.2 });
      racha(pc, [[-0.2, 0.3], [0.05, 0.75], [-0.1, 1.2]], 0.6, br * 0.8);
    }
    function mao(pc) {
      // punho de pedra grande com 3 dedos grossos
      rocha(pc, [[-0.55, -0.05], [0.55, -0.05], [0.66, 0.5], [0.46, 0.85], [-0.46, 0.85], [-0.66, 0.5]], PEDRA3, { sombra: 0.2 });
      for (const x of [-0.32, 0.0, 0.32]) rocha(pc, [[x - 0.15, 0.7], [x + 0.15, 0.7], [x + 0.13, 1.0], [x - 0.13, 1.0]], PEDRA2, { sombra: 0.12, aresta: false });
    }
    const coxa = () => (pc) => {
      rocha(pc, [[-0.6, -0.1], [0.6, -0.1], [0.66, LC * 0.5], [0.5, LC + 0.05], [-0.5, LC + 0.05], [-0.66, LC * 0.5]], PEDRA, { sombra: 0.2 });
      racha(pc, [[0.1, 0.2], [-0.12, 0.65], [0.05, 1.05]], 0.6, br * 0.7);
    };
    const canela = () => (pc) => {
      rocha(pc, [[-0.62, -0.08], [0.62, -0.08], [0.7, 0.3], [0.55, LK + 0.02], [-0.55, LK + 0.02], [-0.7, 0.3]], PEDRA3, { sombra: 0.2 }); // joelho largo
    };
    const pe = () => (pc) => {
      if (lado) rocha(pc, [[-0.4, -0.05], [0.45, -0.05], [0.95, 0.5], [0.95, 0.72], [-0.45, 0.72], [-0.55, 0.35]], PEDRA2, { sombra: 0.18 });
      else rocha(pc, [[-0.62, -0.05], [0.62, -0.05], [0.78, 0.5], [0.72, 0.72], [-0.72, 0.72], [-0.78, 0.5]], PEDRA2, { sombra: 0.18 });
    };

    // ================= MONTAGEM =================
    const SHX = 1.55, qx = 0.62;
    const fZ = { coxa_e: 1, canela_e: 1.05, pe_e: 1.1, coxa_d: 1, canela_d: 1.05, pe_d: 1.1, quadril: 1.5, pescoco: 2.6, cristais: 2.7, tronco: 3, cabeca: 3.6, braco_e: 5, musgo_e: 5.05, antebraco_e: 5.1, mao_e: 5.2, braco_d: 5, musgo_d: 5.05, antebraco_d: 5.1, mao_d: 5.2 };
    const lZ = { braco_e: 0.4, musgo_e: 0.42, antebraco_e: 0.45, mao_e: 0.5, coxa_e: 0.7, canela_e: 0.75, pe_e: 0.8, cristais: 0.9, quadril: 1.5, coxa_d: 2, canela_d: 2.05, pe_d: 2.1, pescoco: 2.6, tronco: 3, cabeca: 3.6, braco_d: 5, musgo_d: 5.05, antebraco_d: 5.1, mao_d: 5.2 };
    const z = lado ? { ...lZ } : { ...fZ };
    if (costas) { z.cristais = 4.5; z.cabeca = 2.0; }
    const esp = lado ? 1 : -1;
    const bx = perfil ? [0.1, -0.15] : tq ? [X(-SHX), X(SHX * 0.85)] : [-SHX, SHX];
    const lx = perfil ? [0.1, -0.1] : tq ? [X(-qx), X(qx)] : [-qx, qx];
    const E = (nome, f) => espalha(nome, f);
    const partes = [
      { nome: 'quadril', pai: null, pivo: [0, HIP], z: z.quadril, desenhar: E('quadril', quadril) },
      { nome: 'coxa_d', pai: 'quadril', pivo: [lx[0], 0.3], z: z.coxa_d, desenhar: E('coxa_d', coxa()) },
      { nome: 'canela_d', pai: 'coxa_d', pivo: [0, LC], z: z.canela_d, desenhar: E('canela_d', canela()) },
      { nome: 'pe_d', pai: 'canela_d', pivo: [0, LK], z: z.pe_d, desenhar: E('pe_d', pe()) },
      { nome: 'coxa_e', pai: 'quadril', pivo: [lx[1], 0.3], z: z.coxa_e, espelho: esp, desenhar: E('coxa_e', coxa()) },
      { nome: 'canela_e', pai: 'coxa_e', pivo: [0, LC], z: z.canela_e, espelho: esp, desenhar: E('canela_e', canela()) },
      { nome: 'pe_e', pai: 'canela_e', pivo: [0, LK], z: z.pe_e, espelho: esp, desenhar: E('pe_e', pe()) },
      { nome: 'tronco', pai: 'quadril', pivo: [0, -0.1], z: z.tronco, desenhar: E('tronco', tronco) },
      { nome: 'cristais', pai: 'tronco', pivo: [0, 0], z: z.cristais, desenhar: E('cristais', cristaisCostas) },
      { nome: 'pescoco', pai: 'tronco', pivo: [lado ? 0.15 : 0, -3.2], z: z.pescoco, desenhar: E('pescoco', pescoco) },
      { nome: 'cabeca', pai: 'pescoco', pivo: [lado ? 0.1 : 0, 0.15], z: z.cabeca, desenhar: E('cabeca', cabeca) },
      { nome: 'braco_d', pai: 'tronco', pivo: [bx[0], -2.75], z: z.braco_d, desenhar: E('braco_d', braco) },
      { nome: 'musgo_d', pai: 'braco_d', pivo: [0, 0], z: z.musgo_d, desenhar: E('musgo_d', ombroMusgo) },
      { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, LB], z: z.antebraco_d, desenhar: E('antebraco_d', antebraco) },
      { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, LA], z: z.mao_d, desenhar: E('mao_d', mao) },
      { nome: 'braco_e', pai: 'tronco', pivo: [bx[1], -2.75], z: z.braco_e, espelho: esp, desenhar: E('braco_e', braco) },
      { nome: 'musgo_e', pai: 'braco_e', pivo: [0, 0], z: z.musgo_e, espelho: esp, desenhar: E('musgo_e', ombroMusgo) },
      { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, LB], z: z.antebraco_e, espelho: esp, desenhar: E('antebraco_e', antebraco) },
      { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, LA], z: z.mao_e, espelho: esp, desenhar: E('mao_e', mao) },
    ];
    if (costas) for (const p of partes) { const d = /_d$/.test(p.nome), e = /_e$/.test(p.nome); if (!d && !e) continue; p.espelho = d ? -1 : 1; if (p.pai === 'tronco' || p.pai === 'quadril') p.pivo = [-p.pivo[0], p.pivo[1]]; }
    void frente;
    return {
      nome: 'Golem guardião', vista, opcoes, alturaEmH: A, larguraOmbrosH: lado ? 2.2 : 3.4, fatorContorno: 1.6,
      partes, poses: Object.fromEntries(Object.entries(window.GOLEM_POSES).map(([k, v]) => [k, v.angulos])), expressoes: window.EXPRESSOES_PADRAO || {},
    };
  };
})();

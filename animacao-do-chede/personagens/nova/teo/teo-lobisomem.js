// TÉO · LOBISOMEM v2 — forma fera completa (série VALDOR), refeito no nível profissional das referências do autor
// (referencias/nova/personagens/lobisomem-ref-01..05): tronco em V com ombros enormes, peito e abdômen desenhados,
// juba selvagem caindo nos ombros, focinho comprido, braços grossos com pelo espetado, mãos de garra,
// jaqueta verde do Téo amarrada na cintura, calça larga rasgada, faixas de couro e patas de lobo com garras pretas.
// Pelo ruivo (cor do cabelo do Téo) com listras escuras e frente clara.
// criarTeoLobisomem(opcoes, vista)  vista: 'frente' | 'tq' | 'perfil' | 'costas'  (tq/perfil olham para a direita)
(function () {
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tom = (b, s, l) => ({ base: b, sombra: s, luz: l || b });
  const PELO = tom('#D9622B', '#9A3815', '#F2884A'), PELO2 = tom('#B84A1E', '#7A2A10', '#D8683A');
  const LISTRA = '#3E140A', CREME = tom('#F4E6D0', '#CDB497', '#FFF8EC'), VERDE = tom('#3F7A55', '#24503A', '#5A9A6E');
  const CALCA = tom('#A88D62', '#6F5A3A', '#C6AD80'), CALCA2 = tom('#937A52', '#5E4B30');
  const COURO = tom('#5A3B26', '#33221A', '#7A5238'), METAL = tom('#C9A24A', '#8A6A2A', '#F0D27A');
  const GARRA = tom('#231917', '#0A0605', '#5A4A44'), NARIZ = tom('#1A110E', '#050302', '#4A3A34');
  const DENTE = tom('#FBF6EA', '#D8CDB8');
  const MUSC = 'rgba(105,32,10,0.55)', MUSC_C = 'rgba(150,108,70,0.6)', BRILHO = 'rgba(255,240,220,0.35)';
  const A = 8.0, HIP = 4.2;

  // forma simétrica: meia = [[x0,y0], seg, seg...]; seg = [x,y] (reta) ou [cx,cy,x,y] (curva). Começa e termina em x = 0.
  function simetrico(meia, dx = 0) {
    return P((p) => {
      const nos = [meia[0]]; p.moveTo(meia[0][0] + dx, meia[0][1]);
      for (const sg of meia.slice(1)) { if (sg.length === 2) p.lineTo(sg[0] + dx, sg[1]); else p.quadraticCurveTo(sg[0] + dx, sg[1], sg[2] + dx, sg[3]); nos.push(sg.slice(-2)); }
      for (let i = meia.length - 1; i >= 1; i--) { const sg = meia[i], ant = nos[i - 1]; if (sg.length === 2) p.lineTo(-ant[0] + dx, ant[1]); else p.quadraticCurveTo(-sg[0] + dx, sg[1], -ant[0] + dx, ant[1]); }
      p.closePath();
    });
  }
  // borda de pelo com pontas curvas entre dois pontos (n pontas; dir = lado para onde as pontas apontam)
  function franja(p, x0, y0, x1, y1, n, amp, dir = 1, cai = 0.35) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * dir, ny = (dx / L) * dir;
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n, m = (a + b) / 2, k = amp * (0.75 + 0.25 * (((i * 7) % 5) / 4));
      const tx = x0 + dx * m + nx * k + (dx / L) * k * cai, ty = y0 + dy * m + ny * k + (dy / L) * k * cai;
      p.quadraticCurveTo(x0 + dx * (a + 0.12 / n), y0 + dy * (a + 0.12 / n), tx, ty);
      p.quadraticCurveTo(x0 + dx * (m + 0.1 / n), y0 + dy * (m + 0.1 / n), x0 + dx * b, y0 + dy * b);
    }
  }
  // tufo de pelo (mechas pontudas) em volta de (x,y), virado no ângulo ang
  function tufo(pc, x, y, w, h, n, cor, ang = 0, sombra = 0.06) {
    const ca = Math.cos(ang), sa = Math.sin(ang), R = (px, py) => [x + px * ca - py * sa, y + px * sa + py * ca];
    pc.peca(P((p) => {
      p.moveTo(...R(-w / 2, 0));
      for (let i = 0; i < n; i++) { const a = -w / 2 + (w * (i + 0.5)) / n, hh = h * (0.7 + 0.3 * (((i * 5) % 3) / 2)); p.quadraticCurveTo(...R(a - (w / n) * 0.45, -hh * 0.45), ...R(a + (w / n) * 0.15, -hh)); p.quadraticCurveTo(...R(a + (w / n) * 0.1, -hh * 0.3), ...R(a + w / n / 2, 0)); }
      p.closePath();
    }), cor, { sombra });
  }
  // listra escura em forma de chama
  const listra = (pc, x, y, w, h, ang = 0) => pc.preencher(P((p) => { const ca = Math.cos(ang), sa = Math.sin(ang), R = (a, b) => [x + a * ca - b * sa, y + a * sa + b * ca]; p.moveTo(...R(0, 0)); p.quadraticCurveTo(...R(w * 0.55, h * 0.15), ...R(w, h)); p.quadraticCurveTo(...R(w * 0.35, h * 0.55), ...R(0, h * 0.42)); p.closePath(); }), LISTRA);
  // rabo: espinha em curva (b0 → b2, controle b1), largura máxima wmax, pelo nas bordas e ponta clara em pincel
  function rabo(pc, b0, b1, b2, wmax) {
    const N = 30, pt = (t) => [(1 - t) * (1 - t) * b0[0] + 2 * (1 - t) * t * b1[0] + t * t * b2[0], (1 - t) * (1 - t) * b0[1] + 2 * (1 - t) * t * b1[1] + t * t * b2[1]];
    const W = (t) => wmax * (0.42 + 0.58 * Math.sin(Math.PI * (0.12 + 0.7 * t))) * (t > 0.78 ? ((1 - t) / 0.22) * 0.75 + 0.25 : 1);
    const dir = (t) => { const [a, b] = pt(Math.max(0, t - 0.01)), [c, d] = pt(Math.min(1, t + 0.01)); const L = Math.hypot(c - a, d - b) || 1; return [(c - a) / L, (d - b) / L]; };
    const E = [], D = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, [x, y] = pt(t), [ux, uy] = dir(t), w = W(t), j = i % 3 === 1 ? 1.12 : i % 3 === 2 ? 0.97 : 1.0;
      E.push([x - uy * w * j + ux * w * 0.15 * (i % 3 === 1), y + ux * w * j + uy * w * 0.15 * (i % 3 === 1)]);
      D.push([x + uy * w * (2 - j) , y - ux * w * (2 - j)]);
    }
    const [tx, ty] = pt(1), [ux, uy] = dir(1), ponta = [tx + ux * wmax * 0.9, ty + uy * wmax * 0.9];
    const forma = P((p) => {
      p.moveTo(...E[0]);
      for (let i = 1; i <= N; i++) { const [a, b] = E[i - 1], [c, d] = E[i]; p.quadraticCurveTo(a, b, (a + c) / 2, (b + d) / 2); }
      p.quadraticCurveTo(...E[N], ...ponta); p.quadraticCurveTo(...D[N], (D[N][0] + D[N - 1][0]) / 2, (D[N][1] + D[N - 1][1]) / 2);
      for (let i = N - 1; i >= 1; i--) { const [a, b] = D[i], [c, d] = D[i - 1]; p.quadraticCurveTo(a, b, (a + c) / 2, (b + d) / 2); }
      p.lineTo(...D[0]); p.closePath();
    });
    pc.peca(forma, PELO, { sombra: 0.22 });
    pc.ctx.save(); pc.ctx.clip(forma);
    for (let i = 0; i < 4; i++) { const t = 0.16 + i * 0.15, [x, y] = pt(t), [vx, vy] = dir(t), w = W(t); pc.preencher(P((p) => { p.moveTo(x - vy * w * 1.1, y + vx * w * 1.1); p.quadraticCurveTo(x + vx * 0.12, y + vy * 0.12, x + vy * w * 0.2 + vx * 0.2, y - vx * w * 0.2 + vy * 0.2); p.quadraticCurveTo(x - vy * w * 0.5 + vx * 0.05, y + vx * w * 0.5 + vy * 0.05, x - vy * w * 1.1 + vx * 0.08, y + vx * w * 1.1 + vy * 0.08); p.closePath(); }), LISTRA); }
    const k0 = Math.round(N * 0.8);
    pc.peca(P((p) => { p.moveTo(...E[k0]); for (let i = k0 + 1; i <= N; i++) p.lineTo(...E[i]); p.lineTo(...ponta); for (let i = N; i >= k0; i--) p.lineTo(...D[i]); const [mx, my] = pt(0.8); franja(p, D[k0][0], D[k0][1], E[k0][0], E[k0][1], 4, wmax * 0.35, -1, 0); p.closePath(); }), CREME, { sombra: 0.14, contorno: false });
    pc.linha(P((p) => { for (let i = 0; i < 9; i++) { const t = 0.08 + i * 0.09, [x, y] = pt(t), [x2, y2] = pt(t + 0.07), [vx, vy] = dir(t), o = ((i % 3) - 1) * W(t) * 0.45; p.moveTo(x - vy * o, y + vx * o); p.quadraticCurveTo((x + x2) / 2 - vy * o * 1.3, (y + y2) / 2 + vx * o * 1.3, x2 - vy * o, y2 + vx * o); } }), pc.interno, 'rgba(110,35,12,0.45)');
    pc.ctx.restore();
  }

  window.TEO_LOBISOMEM_POSES = {
    parado: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 13, antebraco_d: -10, mao_d: -6, braco_e: -13, antebraco_e: 10, mao_e: 6, coxa_d: 7, canela_d: -3, pe_d: -3, coxa_e: -7, canela_e: 3, pe_e: 3 } },
    garras: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 24, antebraco_d: -26, mao_d: -12, braco_e: -24, antebraco_e: 26, mao_e: 12, coxa_d: 11, canela_d: -6, pe_d: -4, coxa_e: -11, canela_e: 6, pe_e: 4, _desloca: [0, 0.08] } },
    rugindo: { vista: 'frente', expressao: 'rugido', angulos: { braco_d: 48, antebraco_d: -42, mao_d: -18, braco_e: -48, antebraco_e: 42, mao_e: 18, coxa_d: 14, canela_d: -8, pe_d: -5, coxa_e: -14, canela_e: 8, pe_e: 5, _desloca: [0, 0.14] } },
    tq: { vista: 'tq', expressao: 'raiva', angulos: { braco_d: -8, antebraco_d: -22, mao_d: -8, braco_e: 10, antebraco_e: -18, coxa_d: -12, canela_d: 22, pe_d: -10, coxa_e: 8, canela_e: 18, pe_e: -14, tronco: 5 } },
    perfil: { vista: 'perfil', expressao: 'raiva', angulos: { braco_d: -10, antebraco_d: -34, mao_d: -10, braco_e: 8, antebraco_e: -28, tronco: 9, cabeca: -6, coxa_d: -22, canela_d: 40, pe_d: -18, coxa_e: 4, canela_e: 34, pe_e: -30 } },
    bote: { vista: 'perfil', expressao: 'rugido', angulos: { tronco: 32, cabeca: -24, braco_d: -105, antebraco_d: -12, braco_e: -82, antebraco_e: -24, coxa_d: -55, canela_d: 70, pe_d: -10, coxa_e: 35, canela_e: 45, pe_e: -20, _desloca: [0, -0.4] } },
    costas: { vista: 'costas', expressao: 'raiva', angulos: { braco_d: -13, antebraco_d: 10, braco_e: 13, antebraco_e: -10, coxa_d: -7, coxa_e: 7 } },
  };
  window.TEO_LOBISOMEM_EXPR = { ...window.EXPRESSOES_PADRAO, rugido: { olhar: [0, 0], palpebra: 0.1, pupila: 1, sobrancelha: { y: 0, ang: -20 }, boca: { tipo: 'aberta', abertura: 0.12 } } };

  window.criarTeoLobisomem = (opcoes = {}, vista = 'frente') => {
    const frente = vista === 'frente', costas = vista === 'costas', perfil = vista === 'perfil', tq = vista === 'tq', lado = tq || perfil;
    const LB = 1.2, LA = 1.15, LC = 1.25, LK = 1.1;
    const abertura = (rig) => { const ex = rig.expressao || {}; if (ex.boca && ex.boca.tipo === 'aberta') return Math.min(1, (ex.boca.abertura || 0.06) / 0.12); if (ex.boca && ex.boca.tipo === 'grito') return 0.45; return 0.15; };

    // ================= TRONCO =================
    const TORSO = [[0, -2.42], [0.32, -2.42], [0.72, -2.28, 1.06, -2.0], [1.2, -1.86, 1.15, -1.58], [1.03, -1.4], [1.0, -1.08, 0.84, -0.8], [0.66, -0.55, 0.7, -0.25], [0.73, -0.04, 0.62, 0.08], [0, 0.08]];
    const FRENTE_CLARA = [[0, -2.36], [0.52, -2.24, 0.84, -1.76], [0.94, -1.52], [0.78, -1.4], [0.86, -1.16], [0.63, -1.02], [0.68, -0.8], [0.5, -0.66], [0.55, -0.42], [0.42, -0.27], [0.45, -0.02, 0.36, 0.08], [0, 0.08]];
    function troncoFrente(pc, dx = 0, k = 1) {
      const corpo = simetrico(TORSO);
      pc.ctx.save(); pc.ctx.scale(k, 1);
      pc.peca(corpo, PELO, { sombra: 0.22 });
      pc.ctx.save(); pc.ctx.clip(corpo);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) listra(pc, s * 1.15, -1.55 + i * 0.36, -s * 0.42, 0.16, s * 0.15);
      if (costas) {
        // costas: coluna, omoplatas e dorsais
        pc.linha(P((p) => { p.moveTo(0, -2.3); p.quadraticCurveTo(0.02, -1.2, 0, 0.05); }), pc.interno * 1.4, MUSC);
        for (const s of [-1, 1]) pc.linha(P((p) => { p.moveTo(s * 0.18, -2.05); p.quadraticCurveTo(s * 0.62, -2.0, s * 0.72, -1.55); p.quadraticCurveTo(s * 0.5, -1.45, s * 0.22, -1.62); p.moveTo(s * 0.92, -1.3); p.quadraticCurveTo(s * 0.5, -0.9, s * 0.2, -0.4); }), pc.interno * 1.2, MUSC);
      } else {
        const clara = simetrico(FRENTE_CLARA, dx);
        pc.peca(clara, CREME, { sombra: 0.14, contorno: false });
        pc.ctx.save(); pc.ctx.clip(clara);
        for (const s of [-1, 1]) {
          // peitoral: sombra embaixo, linha e brilho
          pc.preencher(P((p) => { p.moveTo(dx + s * 0.03, -1.42); p.quadraticCurveTo(dx + s * 0.1, -1.36, dx + s * 0.46, -1.31); p.quadraticCurveTo(dx + s * 0.78, -1.33, dx + s * 0.9, -1.64); p.lineTo(dx + s * 0.9, -1.4); p.quadraticCurveTo(dx + s * 0.62, -1.16, dx + s * 0.45, -1.16); p.quadraticCurveTo(dx + s * 0.12, -1.18, dx + s * 0.03, -1.22); p.closePath(); }), 'rgba(175,125,85,0.38)');
          pc.linha(P((p) => { p.moveTo(dx + s * 0.04, -2.06); p.quadraticCurveTo(dx + s * 0.06, -1.37, dx + s * 0.46, -1.32); p.quadraticCurveTo(dx + s * 0.76, -1.33, dx + s * 0.88, -1.62); }), pc.interno * 1.3, MUSC_C);
          pc.linha(P((p) => { p.moveTo(dx + s * 0.22, -1.95); p.quadraticCurveTo(dx + s * 0.5, -1.98, dx + s * 0.7, -1.78); }), pc.interno * 2.4, BRILHO);
          // abdômen em 3 linhas + borda dos oblíquos
          for (let i = 0; i < 3; i++) { const y = -1.04 + i * 0.29; pc.linha(P((p) => { p.moveTo(dx + s * 0.05, y); p.quadraticCurveTo(dx + s * 0.2, y + 0.05, dx + s * 0.33, y - 0.02); }), pc.interno * 1.1, MUSC_C); pc.linha(P((p) => { p.moveTo(dx + s * 0.1, y - 0.2); p.quadraticCurveTo(dx + s * 0.2, y - 0.23, dx + s * 0.28, y - 0.19); }), pc.interno * 2, BRILHO); }
          pc.linha(P((p) => { p.moveTo(dx + s * 0.38, -1.22); p.quadraticCurveTo(dx + s * 0.46, -0.7, dx + s * 0.3, -0.12); }), pc.interno * 1.1, MUSC_C);
        }
        pc.linha(P((p) => { p.moveTo(dx, -1.32); p.lineTo(dx, -0.12); }), pc.interno * 1.1, MUSC_C);
        pc.ctx.restore();
        // serrátil e dorsal no pelo do lado
        for (const s of [-1, 1]) pc.linha(P((p) => { for (let i = 0; i < 3; i++) { const y = -1.3 + i * 0.14; p.moveTo(s * 0.98, y); p.quadraticCurveTo(s * 0.88, y + 0.03, s * 0.82, y + 0.09); } p.moveTo(s * 1.0, -1.42); p.quadraticCurveTo(s * 0.95, -1.0, s * 0.78, -0.72); }), pc.interno, MUSC);
      }
      pc.ctx.restore();
      pc.ctx.restore();
    }
    function troncoPerfil(pc) {
      const corpo = P((p) => { p.moveTo(-0.42, 0.08); p.quadraticCurveTo(-0.62, -0.8, -0.56, -1.5); p.quadraticCurveTo(-0.5, -2.2, -0.16, -2.42); p.lineTo(0.22, -2.42); p.quadraticCurveTo(0.66, -2.18, 0.78, -1.66); p.quadraticCurveTo(0.74, -1.22, 0.5, -1.04); p.quadraticCurveTo(0.5, -0.55, 0.42, 0.08); p.closePath(); });
      pc.peca(corpo, PELO, { sombra: 0.22 });
      pc.ctx.save(); pc.ctx.clip(corpo);
      for (let i = 0; i < 3; i++) listra(pc, -0.62, -1.7 + i * 0.4, 0.5, 0.16, 0.2);
      const clara = P((p) => { p.moveTo(0.18, -2.4); p.quadraticCurveTo(0.7, -2.2, 0.82, -1.66); p.quadraticCurveTo(0.76, -1.2, 0.52, -1.04); p.quadraticCurveTo(0.52, -0.5, 0.45, 0.1); p.lineTo(0.2, 0.1); franja(p, 0.2, 0.1, 0.32, -1.1, 6, 0.1, 1); franja(p, 0.32, -1.1, 0.18, -2.4, 5, 0.1, 1); p.closePath(); });
      pc.peca(clara, CREME, { sombra: 0.12, contorno: false });
      pc.linha(P((p) => { p.moveTo(0.3, -1.98); p.quadraticCurveTo(0.7, -1.7, 0.6, -1.25); for (let i = 0; i < 3; i++) { const y = -0.95 + i * 0.28; p.moveTo(0.36, y); p.quadraticCurveTo(0.45, y + 0.04, 0.5, y - 0.02); } }), pc.interno * 1.2, MUSC_C);
      pc.linha(P((p) => { p.moveTo(-0.35, -2.1); p.quadraticCurveTo(0.0, -1.7, -0.1, -1.2); }), pc.interno * 1.2, MUSC);
      pc.ctx.restore();
    }
    function tronco(pc) { if (perfil) troncoPerfil(pc); else troncoFrente(pc, tq ? 0.18 : 0, tq ? 0.9 : 1); }

    // ================= JUBA (atrás da cabeça, caindo nos ombros) =================
    function jubaForma(k, cx, larg) {
      return P((p) => {
        const cy = -0.62, rx = 1.0 * k * larg, ry = 0.95 * k, n = 15, ang0 = Math.PI * 0.92, ang1 = Math.PI * 2.08;
        const base = (t, r) => { const a = ang0 + (ang1 - ang0) * t; return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]; };
        p.moveTo(...base(0, 0.95));
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
          const [bx, by] = base(t1, 0.86), [tx, ty] = base(tm + 0.03, 1.1 + (0.1 * ((i * 5) % 3)) / 2), [cxx, cyy] = base(tm - 0.02, 1.0);
          p.quadraticCurveTo(cxx, cyy, tx, ty + 0.1 * Math.abs(Math.cos(Math.PI * tm)));
          p.quadraticCurveTo(...base(tm + 0.02, 0.95), bx, by);
        }
        // mechas caindo nos ombros e no peito
        const yb = 0.25 * k, pts = [[1.0, yb + 0.05], [0.88, yb + 0.62], [0.74, yb + 0.12], [0.58, yb + 0.52], [0.42, yb + 0.06], [0.24, yb + 0.6], [0.1, yb + 0.12], [0, yb + 0.5]];
        const todos = [...pts, ...pts.map(([x, y]) => [-x, y]).reverse().slice(1)];
        for (let i = 0; i < todos.length; i++) { const [x, y] = todos[i]; if (i % 2) p.quadraticCurveTo(cx + x * rx + 0.05, y - 0.15, cx + x * rx, y); else p.quadraticCurveTo(cx + x * rx + 0.06, y + 0.12, cx + x * rx, y); }
        p.closePath();
      });
    }
    function juba(pc) {
      const larg = frente || costas ? 0.98 : tq ? 0.86 : 0.72, cx = perfil ? -0.3 : tq ? -0.08 : 0;
      pc.peca(jubaForma(1.04, cx, larg), PELO2, { sombra: 0.16 });
      const frenteJ = jubaForma(0.9, cx, larg);
      pc.peca(frenteJ, PELO, { sombra: 0.12 });
      pc.ctx.save(); pc.ctx.clip(frenteJ);
      for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i * 0.12); pc.linha(P((p) => { const x0 = cx + Math.cos(a) * 0.45, y0 = -0.62 + Math.sin(a) * 0.45; p.moveTo(x0, y0); p.quadraticCurveTo(x0 + Math.cos(a) * 0.3 + 0.05, y0 + Math.sin(a) * 0.3, x0 + Math.cos(a) * 0.6, y0 + Math.sin(a) * 0.6 + 0.1); }), pc.interno * 1.2, 'rgba(110,35,12,0.55)'); }
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) listra(pc, cx + s * (0.55 + i * 0.16), -0.1 + i * 0.1, s * 0.12, 0.45, 0);
      pc.ctx.restore();
      // tufo claro do peito (frente)
    }

    // ================= CABEÇA =================
    const CRANIO = [[0, -1.26], [0.34, -1.26, 0.52, -1.04], [0.62, -0.94, 0.64, -0.8], [0.88, -0.76], [0.66, -0.64], [0.86, -0.52], [0.6, -0.44], [0.74, -0.3], [0.44, -0.26], [0.38, -0.08, 0.18, 0.0], [0, 0.03]];
    function olhoAmarelo(pc, x, y, s, pisca) {
      const gl = pc.ctx.createRadialGradient(x, y, 0.02, x, y, 0.28); gl.addColorStop(0, 'rgba(255,215,80,0.55)'); gl.addColorStop(1, 'rgba(255,180,40,0)');
      pc.preencher(P((p) => p.arc(x, y, 0.28, 0, Math.PI * 2)), gl);
      pc.preencher(P((p) => { p.moveTo(x - s * 0.16, y + 0.05); p.quadraticCurveTo(x, y - 0.12, x + s * 0.18, y - 0.1); p.quadraticCurveTo(x + s * 0.04, y + 0.1, x - s * 0.16, y + 0.05); p.closePath(); }), '#2A0C05');
      if (pisca) { pc.linha(P((p) => { p.moveTo(x - s * 0.13, y + 0.03); p.lineTo(x + s * 0.15, y - 0.06); }), pc.interno * 2.2, LISTRA); return; }
      const olho = P((p) => { p.moveTo(x - s * 0.13, y + 0.035); p.quadraticCurveTo(x, y - 0.085, x + s * 0.15, y - 0.075); p.quadraticCurveTo(x + s * 0.03, y + 0.075, x - s * 0.13, y + 0.035); p.closePath(); });
      const gi = pc.ctx.createRadialGradient(x, y - 0.01, 0.005, x, y - 0.01, 0.11); gi.addColorStop(0, '#FFF4A8'); gi.addColorStop(0.55, '#FFC92E'); gi.addColorStop(1, '#D9860F');
      pc.peca(olho, { base: gi, sombra: '#C27A10' }, { sombra: 0, espessura: pc.interno * 1.2 });
      pc.preencher(P((p) => p.ellipse(x + s * 0.01, y - 0.01, 0.013, 0.05, 0, 0, Math.PI * 2)), '#120804');
      pc.preencher(P((p) => p.arc(x - s * 0.035, y - 0.03, 0.014, 0, Math.PI * 2)), 'rgba(255,255,255,0.9)');
    }
    function cabecaFrente(pc, rig) {
      const ab = abertura(rig), ex = rig.expressao || {}, pisca = (ex.palpebra || 0) > 0.6;
      // orelhas
      for (const s of [-1, 1]) {
        pc.peca(P((p) => { p.moveTo(s * 0.16, -1.08); p.quadraticCurveTo(s * 0.3, -1.6, s * 0.56, -1.92); p.quadraticCurveTo(s * 0.72, -1.4, s * 0.62, -0.94); p.closePath(); }), PELO, { sombra: 0.16 });
        if (costas) continue;
        pc.preencher(P((p) => { p.moveTo(s * 0.26, -1.08); p.quadraticCurveTo(s * 0.38, -1.5, s * 0.55, -1.76); p.quadraticCurveTo(s * 0.62, -1.36, s * 0.55, -1.0); p.closePath(); }), '#3A1209');
        tufo(pc, s * 0.42, -1.02, 0.3, 0.42, 4, CREME, s * 0.3, 0.04);
        pc.preencher(P((p) => { p.moveTo(s * 0.5, -1.78); p.quadraticCurveTo(s * 0.56, -1.92, s * 0.56, -1.92); p.quadraticCurveTo(s * 0.62, -1.72, s * 0.64, -1.62); p.closePath(); }), LISTRA);
      }
      const cranio = simetrico(CRANIO);
      pc.peca(cranio, PELO, { sombra: 0.16 });
      if (costas) { tufo(pc, 0, -1.1, 0.7, 0.4, 5, PELO2, 0); pc.linha(P((p) => { p.moveTo(0, -1.0); p.lineTo(0, -0.3); }), pc.interno * 1.2, MUSC); return; }
      pc.ctx.save(); pc.ctx.clip(cranio);
      // marcas escuras da testa
      pc.preencher(P((p) => { p.moveTo(-0.07, -1.28); p.lineTo(0, -0.92); p.lineTo(0.07, -1.28); p.closePath(); }), LISTRA);
      for (const s of [-1, 1]) { pc.preencher(P((p) => { p.moveTo(s * 0.17, -1.26); p.quadraticCurveTo(s * 0.16, -1.08, s * 0.12, -0.98); p.quadraticCurveTo(s * 0.24, -1.1, s * 0.3, -1.24); p.closePath(); }), LISTRA); pc.preencher(P((p) => { p.moveTo(s * 0.66, -0.9); p.quadraticCurveTo(s * 0.5, -0.86, s * 0.42, -0.74); p.quadraticCurveTo(s * 0.56, -0.8, s * 0.7, -0.78); p.closePath(); }), LISTRA); }
      // bochechas claras
      pc.peca(P((p) => { p.moveTo(-0.62, -0.5); franja(p, -0.62, -0.5, -0.4, -0.12, 3, 0.1, -1); p.quadraticCurveTo(0, 0.1, 0.4, -0.12); franja(p, 0.4, -0.12, 0.62, -0.5, 3, 0.1, -1); p.quadraticCurveTo(0, -0.62, -0.62, -0.5); p.closePath(); }), CREME, { sombra: 0.08, contorno: false });
      pc.ctx.restore();
      for (const s of [-1, 1]) {
        olhoAmarelo(pc, s * 0.28, -0.8, s, pisca);
        // sobrancelha pesada (brava, desce para o meio)
        const x = s * 0.28, y = -0.8;
        pc.peca(P((p) => { p.moveTo(x - s * 0.2, y - 0.02); p.quadraticCurveTo(x, y - 0.17, x + s * 0.22, y - 0.18); p.lineTo(x + s * 0.2, y - 0.12); p.quadraticCurveTo(x, y - 0.1, x - s * 0.2, y - 0.02); p.closePath(); }), tom(LISTRA, '#200804'), { sombra: 0, contorno: false });
      }
      // ponte do focinho (vem para a frente) com brilho
      pc.peca(P((p) => { p.moveTo(-0.14, -0.86); p.quadraticCurveTo(0, -0.9, 0.14, -0.86); p.quadraticCurveTo(0.24, -0.6, 0.27, -0.4); p.lineTo(-0.27, -0.4); p.quadraticCurveTo(-0.24, -0.6, -0.14, -0.86); p.closePath(); }), PELO2, { sombra: 0.1, contorno: false });
      pc.linha(P((p) => { p.moveTo(0, -0.8); p.quadraticCurveTo(0.02, -0.6, 0, -0.46); }), pc.interno * 2.6, 'rgba(255,190,140,0.45)');
      for (const s of [-1, 1]) pc.linha(P((p) => { p.moveTo(s * 0.12, -0.82); p.quadraticCurveTo(s * 0.2, -0.62, s * 0.24, -0.42); }), pc.interno, MUSC);
      // focinho claro de baixo + boca
      const bo = 0.04 + 0.2 * ab;
      pc.peca(P((p) => { p.moveTo(-0.37, -0.44); p.quadraticCurveTo(-0.44, -0.16, -0.22, -0.05 + bo * 0.4); p.quadraticCurveTo(0, 0.05 + bo, 0.22, -0.05 + bo * 0.4); p.quadraticCurveTo(0.44, -0.16, 0.37, -0.44); p.quadraticCurveTo(0, -0.36, -0.37, -0.44); p.closePath(); }), CREME, { sombra: 0.1 });
      pc.peca(P((p) => { p.moveTo(-0.24, -0.22); p.quadraticCurveTo(0, -0.27, 0.24, -0.22); p.quadraticCurveTo(0.2, -0.18 + bo, 0, -0.14 + bo * 1.1); p.quadraticCurveTo(-0.2, -0.18 + bo, -0.24, -0.22); p.closePath(); }), tom('#4A0A12', '#2A050A'), { sombra: 0, espessura: pc.interno * 1.4 });
      pc.preencher(P((p) => p.ellipse(0, -0.16 + bo * 0.95, 0.11, 0.03 + bo * 0.14, 0, 0, Math.PI * 2)), '#C24A5A');
      for (const s of [-1, 1]) {
        // presas grandes + dentinhos
        pc.peca(P((p) => { p.moveTo(s * 0.13, -0.235); p.lineTo(s * 0.2, -0.225); p.quadraticCurveTo(s * 0.17, -0.12, s * 0.15, -0.09); p.closePath(); }), DENTE, { sombra: 0, espessura: pc.interno * 0.7 });
        pc.peca(P((p) => { const yb = -0.15 + bo * 1.05; p.moveTo(s * 0.11, yb); p.lineTo(s * 0.17, yb - 0.01); p.lineTo(s * 0.13, yb - 0.1); p.closePath(); }), DENTE, { sombra: 0, espessura: pc.interno * 0.7 });
        for (const x of [0.03, 0.08]) pc.peca(P((p) => { p.moveTo(s * (x - 0.02), -0.25); p.lineTo(s * (x + 0.02), -0.25); p.lineTo(s * x, -0.21); p.closePath(); }), DENTE, { sombra: 0, espessura: pc.interno * 0.5 });
      }
      // nariz
      pc.peca(P((p) => { p.moveTo(-0.15, -0.46); p.quadraticCurveTo(0, -0.52, 0.15, -0.46); p.quadraticCurveTo(0.14, -0.33, 0, -0.3); p.quadraticCurveTo(-0.14, -0.33, -0.15, -0.46); p.closePath(); }), NARIZ, { sombra: 0 });
      pc.preencher(P((p) => p.ellipse(-0.04, -0.45, 0.045, 0.016, -0.2, 0, Math.PI * 2)), 'rgba(255,255,255,0.6)');
      for (const s of [-1, 1]) pc.preencher(P((p) => p.ellipse(s * 0.06, -0.36, 0.025, 0.014, s * 0.4, 0, Math.PI * 2)), '#000');
      pc.linha(P((p) => { p.moveTo(0, -0.3); p.lineTo(0, -0.25); }), pc.interno, '#1A0A06');
      // topete ruivo do Téo entre as orelhas
      tufo(pc, 0, -1.18, 0.56, 0.4, 5, PELO2, 0, 0.08);
    }
    function cabecaLado(pc, rig) {
      const ab = abertura(rig), ex = rig.expressao || {}, pisca = (ex.palpebra || 0) > 0.6, k = tq ? 0.88 : 1;
      pc.peca(P((p) => { p.moveTo(-0.36, -0.9); p.quadraticCurveTo(-0.34, -1.5, -0.2, -1.86); p.quadraticCurveTo(0.02, -1.32, 0.06, -0.9); p.closePath(); }), PELO, { sombra: 0.14 });
      pc.preencher(P((p) => { p.moveTo(-0.27, -0.94); p.quadraticCurveTo(-0.27, -1.4, -0.2, -1.68); p.quadraticCurveTo(-0.06, -1.3, -0.03, -0.94); p.closePath(); }), '#3A1209');
      tufo(pc, -0.15, -0.95, 0.24, 0.32, 3, CREME, 0.1, 0.04);
      if (tq) pc.peca(P((p) => { p.moveTo(0.06, -0.96); p.quadraticCurveTo(0.14, -1.48, 0.3, -1.76); p.quadraticCurveTo(0.38, -1.25, 0.34, -0.88); p.closePath(); }), PELO2, { sombra: 0.14 });
      const bo = 0.03 + 0.16 * ab;
      // mandíbula de baixo e boca
      pc.peca(P((p) => { p.moveTo(0.05, -0.3); p.lineTo(0.78 * k, -0.34 + bo); p.quadraticCurveTo(0.8 * k, -0.24 + bo, 0.7 * k, -0.22 + bo); p.quadraticCurveTo(0.4, -0.06 + bo * 0.6, 0.0, -0.06); p.closePath(); }), CREME, { sombra: 0.08 });
      pc.preencher(P((p) => { p.moveTo(0.12, -0.35); p.lineTo(0.8 * k, -0.4); p.lineTo(0.76 * k, -0.33 + bo); p.lineTo(0.12, -0.26); p.closePath(); }), '#4A0A12');
      pc.preencher(P((p) => p.ellipse(0.42 * k, -0.3 + bo * 0.6, 0.2, 0.03 + bo * 0.15, -0.05, 0, Math.PI * 2)), '#C24A5A');
      // crânio + focinho comprido
      const cab = P((p) => { p.moveTo(-0.52, -0.4); p.quadraticCurveTo(-0.6, -0.92, -0.24, -1.06); p.quadraticCurveTo(0.12, -1.12, 0.34, -0.84); p.quadraticCurveTo(0.62 * k, -0.66, 0.92 * k, -0.56); p.quadraticCurveTo(1.0 * k, -0.47, 0.92 * k, -0.4); p.lineTo(0.14, -0.35); p.quadraticCurveTo(-0.1, -0.12, -0.36, -0.1); franja(p, -0.36, -0.1, -0.52, -0.4, 3, 0.12, 1); p.closePath(); });
      pc.peca(cab, PELO, { sombra: 0.16 });
      pc.ctx.save(); pc.ctx.clip(cab);
      pc.preencher(P((p) => { p.moveTo(0.05, -0.52); p.quadraticCurveTo(0.5 * k, -0.5, 0.98 * k, -0.45); p.lineTo(0.98 * k, -0.3); p.lineTo(0.05, -0.3); p.closePath(); }), CREME.base);
      pc.peca(P((p) => { p.moveTo(-0.5, -0.45); franja(p, -0.5, -0.45, -0.1, -0.12, 4, 0.1, 1); p.quadraticCurveTo(0.1, -0.35, 0.0, -0.55); p.quadraticCurveTo(-0.3, -0.6, -0.5, -0.45); p.closePath(); }), CREME, { sombra: 0.05, contorno: false });
      for (let i = 0; i < 3; i++) pc.preencher(P((p) => { const x = -0.22 + i * 0.13; p.moveTo(x, -1.1); p.lineTo(x + 0.06, -0.82); p.lineTo(x + 0.11, -1.1); p.closePath(); }), LISTRA);
      pc.linha(P((p) => { p.moveTo(0.3, -0.82); p.quadraticCurveTo(0.6 * k, -0.64, 0.9 * k, -0.56); }), pc.interno * 2.4, 'rgba(255,190,140,0.45)');
      pc.ctx.restore();
      for (const [x, h] of [[0.66 * k, 0.12], [0.46 * k, 0.08]]) { pc.peca(P((p) => { p.moveTo(x - 0.03, -0.38); p.lineTo(x + 0.03, -0.38); p.lineTo(x, -0.38 + h); p.closePath(); }), DENTE, { sombra: 0, espessura: pc.interno * 0.6 }); pc.peca(P((p) => { const yb = -0.27 + bo; p.moveTo(x - 0.125, yb); p.lineTo(x - 0.075, yb); p.lineTo(x - 0.1, yb - h * 0.8); p.closePath(); }), DENTE, { sombra: 0, espessura: pc.interno * 0.6 }); }
      // olho, sobrancelha, nariz
      const x = 0.27, y = -0.7;
      const gl = pc.ctx.createRadialGradient(x, y, 0.02, x, y, 0.25); gl.addColorStop(0, 'rgba(255,215,80,0.55)'); gl.addColorStop(1, 'rgba(255,180,40,0)');
      pc.preencher(P((p) => p.arc(x, y, 0.25, 0, Math.PI * 2)), gl);
      if (pisca) pc.linha(P((p) => { p.moveTo(0.16, -0.7); p.lineTo(0.38, -0.72); }), pc.interno * 2, LISTRA);
      else {
        const gi = pc.ctx.createRadialGradient(x, y, 0.005, x, y, 0.1); gi.addColorStop(0, '#FFF4A8'); gi.addColorStop(0.55, '#FFC92E'); gi.addColorStop(1, '#D9860F');
        pc.peca(P((p) => { p.moveTo(0.15, -0.69); p.quadraticCurveTo(0.27, -0.79, 0.4, -0.75); p.quadraticCurveTo(0.29, -0.63, 0.15, -0.69); p.closePath(); }), { base: gi, sombra: '#C27A10' }, { sombra: 0, espessura: pc.interno * 1.2 });
        pc.preencher(P((p) => p.ellipse(0.29, -0.71, 0.012, 0.045, 0, 0, Math.PI * 2)), '#120804');
      }
      pc.peca(P((p) => { p.moveTo(0.08, -0.74); p.quadraticCurveTo(0.26, -0.88, 0.46, -0.84); p.lineTo(0.44, -0.79); p.quadraticCurveTo(0.26, -0.8, 0.1, -0.7); p.closePath(); }), tom(LISTRA, '#200804'), { sombra: 0, contorno: false });
      pc.peca(P((p) => p.ellipse(0.93 * k, -0.5, 0.08, 0.065, -0.2, 0, Math.PI * 2)), NARIZ, { sombra: 0 });
      tufo(pc, -0.12, -1.02, 0.46, 0.34, 4, PELO2, -0.3);
    }
    function cabeca(pc, rig) { if (lado) cabecaLado(pc, rig); else cabecaFrente(pc, rig); }
    function pescoco(pc) { pc.peca(P((p) => p.roundRect(-0.36, -0.45, 0.72, 0.62, 0.22)), PELO, { sombra: 0.1 }); }

    // ================= BRAÇOS (desenhados para o braço da esquerda da tela; o outro é espelhado) =================
    function braco(pc) {
      const forma = P((p) => { p.moveTo(0.36, -0.1); p.quadraticCurveTo(0.05, -0.44, -0.4, -0.2); p.quadraticCurveTo(-0.64, 0.16, -0.48, 0.56); p.quadraticCurveTo(-0.38, 0.86, -0.3, LB); p.lineTo(0.27, LB); p.quadraticCurveTo(0.44, 0.76, 0.37, 0.46); p.quadraticCurveTo(0.42, 0.15, 0.36, -0.1); p.closePath(); });
      pc.peca(forma, PELO, { sombra: 0.2 });
      pc.ctx.save(); pc.ctx.clip(forma);
      listra(pc, -0.62, 0.62, 0.45, 0.14, 0.2); listra(pc, -0.58, 0.88, 0.38, 0.12, 0.25);
      pc.linha(P((p) => { p.moveTo(-0.48, 0.52); p.quadraticCurveTo(-0.12, 0.6, 0.18, 0.28); p.moveTo(0.05, 0.72); p.quadraticCurveTo(0.2, 0.9, 0.12, 1.12); }), pc.interno * 1.2, MUSC);
      pc.linha(P((p) => { p.moveTo(-0.28, -0.18); p.quadraticCurveTo(-0.44, 0.05, -0.38, 0.3); p.moveTo(0.18, 0.62); p.quadraticCurveTo(0.3, 0.75, 0.28, 0.95); }), pc.interno * 2.6, 'rgba(255,190,140,0.4)');
      pc.ctx.restore();
      tufo(pc, -0.55, 0.12, 0.42, 0.22, 3, PELO2, -Math.PI / 2 - 0.25);
    }
    function antebraco(pc) {
      const forma = P((p) => { p.moveTo(-0.34, -0.05); p.quadraticCurveTo(-0.52, 0.32, -0.32, 0.8); p.quadraticCurveTo(-0.26, 0.98, -0.21, LA); p.lineTo(0.2, LA); p.quadraticCurveTo(0.36, 0.5, 0.31, -0.05); p.quadraticCurveTo(0, -0.14, -0.34, -0.05); p.closePath(); });
      pc.peca(forma, PELO, { sombra: 0.2 });
      pc.ctx.save(); pc.ctx.clip(forma);
      listra(pc, -0.5, 0.4, 0.5, 0.13, 0.25); listra(pc, -0.42, 0.68, 0.42, 0.12, 0.3);
      pc.linha(P((p) => { p.moveTo(-0.1, 0.05); p.quadraticCurveTo(0.05, 0.4, -0.02, 0.85); }), pc.interno * 1.2, MUSC);
      pc.ctx.restore();
      // pelo espetado no lado de fora do antebraço (como nas referências)
      pc.peca(P((p) => { p.moveTo(-0.36, 0.0); franja(p, -0.36, 0.0, -0.32, 0.82, 5, 0.17, 1, 0.9); p.quadraticCurveTo(-0.42, 0.4, -0.36, 0.0); p.closePath(); }), PELO2, { sombra: 0.08 });
      tufo(pc, 0.02, LA - 0.02, 0.48, 0.16, 5, PELO2, Math.PI);
    }
    function mao(pc, rig) { pc.ctx.save(); pc.ctx.scale(1.25, 1.25); maoBase(pc, rig); pc.ctx.restore(); }
    function maoBase(pc, rig) {
      const curl = ((rig.pose && rig.pose._maos) || {}).fechada ? 0.5 : 0.18;
      pc.peca(P((p) => { p.moveTo(-0.23, -0.04); p.lineTo(0.22, -0.04); p.quadraticCurveTo(0.31, 0.18, 0.27, 0.38); p.lineTo(-0.27, 0.38); p.quadraticCurveTo(-0.32, 0.15, -0.23, -0.04); p.closePath(); }), PELO, { sombra: 0.12 });
      for (let i = 0; i < 4; i++) {
        const x = -0.2 + i * 0.13, L1 = 0.27 - Math.abs(i - 1.5) * 0.03, c = curl;
        pc.peca(P((p) => { p.moveTo(x - 0.065, 0.32); p.quadraticCurveTo(x - 0.075, 0.32 + L1 * 0.6, x - 0.04 + c * 0.05, 0.32 + L1); p.lineTo(x + 0.05 + c * 0.05, 0.32 + L1 - 0.01); p.quadraticCurveTo(x + 0.07, 0.32 + L1 * 0.5, x + 0.065, 0.32); p.closePath(); }), i % 2 ? PELO : PELO2, { sombra: 0.1 });
        // garra preta curva
        const gx = x + 0.005 + c * 0.05, gy = 0.3 + L1;
        pc.peca(P((p) => { p.moveTo(gx - 0.042, gy - 0.02); p.quadraticCurveTo(gx + 0.02 + c * 0.1, gy + 0.04, gx - 0.005 + c * 0.12, gy + 0.26); p.quadraticCurveTo(gx + 0.04, gy + 0.06, gx + 0.045, gy - 0.02); p.closePath(); }), GARRA, { sombra: 0.05, espessura: pc.interno * 0.7 });
        pc.linha(P((p) => { p.moveTo(gx - 0.012, gy); p.quadraticCurveTo(gx + 0.01, gy + 0.08, gx + c * 0.1, gy + 0.2); }), pc.interno * 0.9, 'rgba(255,255,255,0.45)');
      }
      // polegar (lado de dentro)
      pc.peca(P((p) => { p.moveTo(0.22, 0.05); p.quadraticCurveTo(0.38, 0.12, 0.36, 0.3); p.lineTo(0.27, 0.3); p.quadraticCurveTo(0.26, 0.18, 0.18, 0.14); p.closePath(); }), PELO, { sombra: 0.1 });
      pc.peca(P((p) => { p.moveTo(0.27, 0.29); p.lineTo(0.36, 0.29); p.quadraticCurveTo(0.36, 0.38, 0.3, 0.46); p.quadraticCurveTo(0.3, 0.36, 0.27, 0.29); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
      tufo(pc, -0.02, 0.0, 0.5, 0.14, 5, PELO, Math.PI);
    }

    // ================= QUADRIL, JAQUETA AMARRADA, PERNAS =================
    function quadril(pc) {
      const k = perfil ? 0.7 : tq ? 0.9 : 1, c = tq ? 0.12 : perfil ? 0.15 : 0;
      pc.peca(P((p) => { p.moveTo(c - 0.66 * k, -0.06); p.lineTo(c + 0.66 * k, -0.06); p.quadraticCurveTo(c + 0.86 * k, 0.3, c + 0.8 * k, 0.62); p.lineTo(c - 0.8 * k, 0.62); p.quadraticCurveTo(c - 0.86 * k, 0.3, c - 0.66 * k, -0.06); p.closePath(); }), CALCA, { sombra: 0.14 });
    }
    function cinto(pc) {
      const k = perfil ? 0.7 : tq ? 0.9 : 1, c = tq ? 0.12 : perfil ? 0.15 : 0;
      // cinto de couro com fivela
      pc.peca(P((p) => { p.moveTo(c - 0.7 * k, -0.1); p.quadraticCurveTo(c, -0.04, c + 0.7 * k, -0.1); p.lineTo(c + 0.71 * k, 0.1); p.quadraticCurveTo(c, 0.16, c - 0.71 * k, 0.1); p.closePath(); }), COURO, { sombra: 0.08 });
      if (!costas) { const fx = c + (perfil ? 0.25 : 0); pc.peca(P((p) => p.roundRect(fx - 0.12, -0.11, 0.24, 0.24, 0.04)), METAL, { sombra: 0.05 }); pc.preencher(P((p) => p.roundRect(fx - 0.06, -0.05, 0.12, 0.12, 0.02)), COURO.base); }
      // mangas da jaqueta verde amarradas na frente
      if (frente || tq) {
        const kx = c + 0.18 * k;
        for (const [s, comp] of [[-1, 0.95], [1, 0.8]]) pc.peca(P((p) => { p.moveTo(kx - 0.05, 0.12); p.quadraticCurveTo(kx + s * 0.22, 0.4, kx + s * 0.16, comp); franja(p, kx + s * 0.16, comp, kx + s * 0.38, comp - 0.1, 3, 0.1, s); p.quadraticCurveTo(kx + s * 0.32, 0.4, kx + 0.08, 0.1); p.closePath(); }), VERDE, { sombra: 0.12 });
        pc.peca(P((p) => p.ellipse(kx, 0.12, 0.14, 0.11, 0.3, 0, Math.PI * 2)), VERDE, { sombra: 0.1 });
        pc.linha(P((p) => { p.moveTo(kx - 0.1, 0.08); p.quadraticCurveTo(kx, 0.16, kx + 0.1, 0.1); }), pc.interno, 'rgba(20,50,30,0.7)');
      }
    }
    // corpo da jaqueta caindo atrás das pernas, como uma saia rasgada
    function jaqueta(pc) {
      const k = perfil ? 0.6 : tq ? 0.9 : 1, c = perfil ? -0.2 : tq ? 0.05 : 0, L = 1.55;
      pc.peca(P((p) => { p.moveTo(c - 0.78 * k, 0.0); p.quadraticCurveTo(c, -0.1, c + 0.78 * k, 0.0); p.quadraticCurveTo(c + 1.05 * k, 0.8, c + 1.08 * k, L); franja(p, c + 1.08 * k, L, c - 1.08 * k, L - 0.08, 9, 0.2, -1, 0); p.quadraticCurveTo(c - 1.05 * k, 0.8, c - 0.78 * k, 0.0); p.closePath(); }), VERDE, { sombra: 0.2 });
      pc.linha(P((p) => { p.moveTo(c - 0.6 * k, 0.2); p.quadraticCurveTo(c - 0.75 * k, 0.8, c - 0.8 * k, 1.3); p.moveTo(c + 0.55 * k, 0.25); p.quadraticCurveTo(c + 0.7 * k, 0.8, c + 0.85 * k, 1.35); }), pc.interno * 1.1, 'rgba(20,50,30,0.6)');
      for (const [x, y] of [[c - 0.85 * k, 1.0], [c + 0.75 * k, 0.65]]) pc.preencher(P((p) => { p.moveTo(x, y); p.lineTo(x + 0.1, y - 0.08); p.lineTo(x + 0.16, y + 0.06); p.lineTo(x + 0.04, y + 0.14); p.closePath(); }), '#1A0E08');
    }
    const C = (escuro) => (escuro ? CALCA2 : CALCA), PL = (escuro) => (escuro ? PELO2 : PELO);
    const coxa = (escuro) => (pc) => {
      pc.peca(P((p) => { p.moveTo(-0.44, -0.12); p.lineTo(0.44, -0.12); p.quadraticCurveTo(0.62, 0.55, 0.48, LC + 0.05); p.lineTo(-0.44, LC + 0.05); p.quadraticCurveTo(-0.64, 0.55, -0.44, -0.12); p.closePath(); }), C(escuro), { sombra: 0.16 });
      pc.linha(P((p) => { p.moveTo(-0.3, 0.32); p.quadraticCurveTo(-0.05, 0.46, 0.12, 0.4); p.moveTo(0.05, 0.8); p.quadraticCurveTo(0.25, 0.92, 0.42, 0.86); p.moveTo(-0.4, 0.95); p.quadraticCurveTo(-0.2, 1.05, -0.1, 1.0); }), pc.interno * 1.2, 'rgba(70,52,30,0.6)');
      const r = P((p) => { p.moveTo(-0.16, 0.58); p.lineTo(0.0, 0.5); p.lineTo(0.14, 0.62); p.lineTo(0.02, 0.72); p.closePath(); });
      pc.preencher(r, PL(escuro).base); pc.linha(r, pc.interno, 'rgba(70,40,20,0.75)');
    };
    const canela = (escuro) => (pc) => {
      // pelo da canela (afina até o tornozelo)
      pc.peca(P((p) => { p.moveTo(-0.3, 0.3); p.quadraticCurveTo(-0.38, 0.7, -0.19, LK + 0.02); p.lineTo(0.19, LK + 0.02); p.quadraticCurveTo(0.36, 0.7, 0.3, 0.3); p.closePath(); }), PL(escuro), { sombra: 0.18 });
      pc.linha(P((p) => { p.moveTo(-0.08, 0.72); p.quadraticCurveTo(0.02, 0.9, -0.02, 1.05); }), pc.interno, MUSC);
      // calça larga franzida, rasgada na barra
      pc.peca(P((p) => { p.moveTo(-0.46, -0.06); p.lineTo(0.46, -0.06); p.quadraticCurveTo(0.56, 0.3, 0.42, 0.56); franja(p, 0.42, 0.56, -0.42, 0.58, 7, 0.17, 1, 0); p.quadraticCurveTo(-0.56, 0.3, -0.46, -0.06); p.closePath(); }), C(escuro), { sombra: 0.16 });
      pc.linha(P((p) => { p.moveTo(-0.3, 0.4); p.quadraticCurveTo(-0.1, 0.34, 0.0, 0.46); p.moveTo(0.1, 0.18); p.quadraticCurveTo(0.25, 0.26, 0.38, 0.2); }), pc.interno * 1.1, 'rgba(70,52,30,0.6)');
      tufo(pc, 0, 0.66, 0.5, 0.16, 5, PELO2, Math.PI);
    };
    const pe = (escuro) => (pc) => {
      const cor = PL(escuro);
      if (lado) {
        pc.peca(P((p) => { p.moveTo(-0.2, -0.02); p.lineTo(0.15, -0.02); p.quadraticCurveTo(0.3, 0.4, 0.36, 0.72); p.lineTo(0.02, 0.8); p.quadraticCurveTo(-0.1, 0.4, -0.2, -0.02); p.closePath(); }), cor, { sombra: 0.14 });
        pc.peca(P((p) => { p.moveTo(-0.04, 0.66); p.quadraticCurveTo(0.6, 0.6, 0.78, 0.92); p.quadraticCurveTo(0.7, 1.02, 0.0, 1.0); p.quadraticCurveTo(-0.1, 0.84, -0.04, 0.66); p.closePath(); }), cor, { sombra: 0.12 });
        pc.peca(P((p) => { p.moveTo(-0.22, 0.04); p.lineTo(0.18, 0.0); p.lineTo(0.24, 0.26); franja(p, 0.24, 0.26, -0.16, 0.3, 4, 0.08, -1, 0); p.closePath(); }), COURO, { sombra: 0.1 });
        for (const x of [0.46, 0.6, 0.72]) pc.peca(P((p) => { p.moveTo(x - 0.03, 0.9); p.quadraticCurveTo(x + 0.12, 0.92, x + 0.14, 1.12); p.quadraticCurveTo(x + 0.04, 1.0, x - 0.03, 0.98); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
        return;
      }
      // pé de lobo visto de frente: tornozelo, peito do pé e pata larga com 4 dedos
      pc.peca(P((p) => { p.moveTo(-0.2, -0.04); p.lineTo(0.2, -0.04); p.quadraticCurveTo(0.3, 0.4, 0.33, 0.72); p.lineTo(-0.33, 0.72); p.quadraticCurveTo(-0.3, 0.4, -0.2, -0.04); p.closePath(); }), cor, { sombra: 0.14 });
      // faixa de couro com fivela no tornozelo
      pc.peca(P((p) => { p.moveTo(-0.25, 0.08); p.quadraticCurveTo(0, 0.14, 0.25, 0.08); p.lineTo(0.28, 0.3); p.quadraticCurveTo(0, 0.36, -0.28, 0.3); p.closePath(); }), COURO, { sombra: 0.08 });
      pc.peca(P((p) => p.roundRect(-0.06, 0.12, 0.12, 0.14, 0.02)), METAL, { sombra: 0 });
      pc.linha(P((p) => { p.moveTo(-0.27, 0.4); p.quadraticCurveTo(0, 0.48, 0.28, 0.38); }), pc.interno * 1.4, COURO.base);
      for (const x of [-0.27, -0.09, 0.09, 0.27]) {
        pc.peca(P((p) => { p.moveTo(x - 0.11, 0.66); p.quadraticCurveTo(x - 0.13, 0.98, x, 1.0); p.quadraticCurveTo(x + 0.13, 0.98, x + 0.11, 0.66); p.closePath(); }), cor, { sombra: 0.1 });
        const s = Math.sign(x);
        pc.peca(P((p) => { p.moveTo(x - 0.05, 0.94); p.quadraticCurveTo(x + s * 0.02, 1.0, x + s * 0.04, 1.2); p.quadraticCurveTo(x + s * 0.06, 1.02, x + 0.05, 0.94); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.7 });
      }
      tufo(pc, 0, 0.62, 0.7, 0.14, 6, cor, Math.PI, 0.04);
    };
    function cauda(pc) {
      if (perfil) return rabo(pc, [-0.3, 0.1], [-1.9, 0.2], [-1.6, 2.3], 0.42);
      if (tq) return rabo(pc, [-0.2, 0.1], [-1.8, 0.4], [-1.45, 2.4], 0.42);
      if (costas) return rabo(pc, [0.0, 0.15], [1.1, 0.8], [0.5, 2.5], 0.44);
      rabo(pc, [0.3, 0.2], [1.95, 0.45], [1.55, 2.5], 0.42);
    }

    // ================= MONTAGEM =================
    const SHX = 1.12, qx = 0.42;
    const fZ = { cauda: 0.2, jaqueta: 0.5, coxa_e: 1, canela_e: 1.05, pe_e: 1.1, coxa_d: 1, canela_d: 1.05, pe_d: 1.1, quadril: 0.9, pescoco: 2.6, tronco: 3, juba: 3.4, braco_e: 5, antebraco_e: 5.1, mao_e: 5.2, braco_d: 5, antebraco_d: 5.1, mao_d: 5.2, cabeca: 6 };
    const lZ = { braco_e: 0.4, antebraco_e: 0.45, mao_e: 0.5, coxa_e: 0.7, canela_e: 0.75, pe_e: 0.8, cauda: 0.3, jaqueta: 0.6, quadril: 1.5, coxa_d: 2, canela_d: 2.05, pe_d: 2.1, pescoco: 2.6, tronco: 3, juba: 2.8, braco_d: 5, antebraco_d: 5.1, mao_d: 5.2, cabeca: 6 };
    const z = lado ? { ...lZ } : { ...fZ };
    if (costas) { z.cauda = 4; z.jaqueta = 3.9; z.cabeca = 3.6; z.juba = 3.5; }
    const eL = lado, esp = lado ? 1 : -1;
    const bx = perfil ? [0.08, -0.12] : tq ? [-SHX * 0.85, SHX * 0.7] : [-SHX, SHX];
    const lx = perfil ? [0.08, -0.1] : tq ? [-qx * 0.8, qx * 0.9] : [-qx, qx];
    const partes = [
      { nome: 'quadril', pai: null, pivo: [0, HIP], z: z.quadril, desenhar: quadril },
      { nome: 'cinto', pai: 'quadril', pivo: [0, 0], z: 1.6, desenhar: cinto },
      { nome: 'jaqueta', pai: 'quadril', pivo: [0, 0.02], z: z.jaqueta, desenhar: jaqueta },
      { nome: 'cauda', pai: 'quadril', pivo: [0, 0.05], z: z.cauda, desenhar: cauda },
      { nome: 'coxa_d', pai: 'quadril', pivo: [lx[0], 0.25], z: z.coxa_d, grupo: 'perna_d', desenhar: coxa(false) },
      { nome: 'canela_d', pai: 'coxa_d', pivo: [0, LC], z: z.canela_d, grupo: 'perna_d', desenhar: canela(false) },
      { nome: 'pe_d', pai: 'canela_d', pivo: [0, LK], z: z.pe_d, desenhar: pe(false) },
      { nome: 'coxa_e', pai: 'quadril', pivo: [lx[1], 0.25], z: z.coxa_e, grupo: 'perna_e', espelho: esp, desenhar: coxa(eL) },
      { nome: 'canela_e', pai: 'coxa_e', pivo: [0, LC], z: z.canela_e, grupo: 'perna_e', espelho: esp, desenhar: canela(eL) },
      { nome: 'pe_e', pai: 'canela_e', pivo: [0, LK], z: z.pe_e, espelho: esp, desenhar: pe(eL) },
      { nome: 'tronco', pai: 'quadril', pivo: [0, -0.05], z: z.tronco, desenhar: tronco },
      { nome: 'juba', pai: 'tronco', pivo: [lado ? 0.05 : 0, -2.2], z: z.juba, desenhar: juba },
      { nome: 'pescoco', pai: 'tronco', pivo: [lado ? 0.12 : 0, -2.2], z: z.pescoco, desenhar: pescoco },
      { nome: 'cabeca', pai: 'pescoco', pivo: [lado ? 0.08 : 0, -0.15], z: z.cabeca, desenhar: cabeca },
      { nome: 'braco_d', pai: 'tronco', pivo: [bx[0], -1.82], z: z.braco_d, grupo: 'braco_d', desenhar: braco },
      { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, LB], z: z.antebraco_d, grupo: 'braco_d', desenhar: antebraco },
      { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, LA], z: z.mao_d, desenhar: mao },
      { nome: 'braco_e', pai: 'tronco', pivo: [bx[1], -1.82], z: z.braco_e, grupo: 'braco_e', espelho: esp, desenhar: braco },
      { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, LB], z: z.antebraco_e, grupo: 'braco_e', espelho: esp, desenhar: antebraco },
      { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, LA], z: z.mao_e, espelho: esp, desenhar: mao },
    ];
    // de costas, o braço/perna "d" fica à direita da tela
    if (costas) for (const p of partes) { const d = /_d$/.test(p.nome), e = /_e$/.test(p.nome); if (!d && !e) continue; p.espelho = d ? -1 : 1; if (p.pai === 'tronco' || p.pai === 'quadril') p.pivo = [-p.pivo[0], p.pivo[1]]; }
    return {
      nome: 'Téo lobisomem', vista, opcoes, alturaEmH: A, larguraOmbrosH: lado ? 1.6 : 2.6, fatorContorno: 1.5,
      partes, poses: Object.fromEntries(Object.entries(window.TEO_LOBISOMEM_POSES).map(([k, v]) => [k, v.angulos])), expressoes: window.TEO_LOBISOMEM_EXPR,
    };
  };
})();

// TÉO · LOBISOMEM — forma fera completa (série VALDOR), no nível das referências do autor
// (referencias/nova/personagens/lobisomem-ref-01..03): cabeça de lobo com focinho, corpo musculoso, juba enorme,
// listras escuras, peito de pelo claro, jaqueta verde em farrapos, calça rasgada, pernas de lobo (digitígradas),
// patas com garras escuras e rabo volumoso. Rig próprio (mesmos nomes de peças da base, poses compatíveis).
// criarTeoLobisomem(opcoes, vista)  vista: 'frente' | 'tq' | 'perfil' | 'costas'  (tq/perfil olham para a direita)
(function () {
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tom = (b, s, l) => ({ base: b, sombra: s, luz: l || b });
  const PELO = tom('#D45E2A', '#963616', '#F28B4C'), PELO2 = tom('#B9481F', '#7E2C12', '#D9663A');
  const LISTRA = '#4A1A0C', CREME = tom('#F3E4CC', '#CDB596', '#FFF7EA'), VERDE = tom('#3F7A55', '#2A5A3C', '#5A9A6E');
  const CALCA = tom('#B39A6F', '#8A7450', '#CDB78D'), COURO = tom('#4E3524', '#33221A', '#6A4A34');
  const GARRA = tom('#2A1E1A', '#120C0A', '#5A4A44'), NARIZ = tom('#1A110E', '#0A0605', '#4A3A34');
  const A = 7.4, HIP = 4.3;
  const caps = (a, b, y0, y1) => P((p) => { p.moveTo(-a / 2, y0); p.arc(0, y0, a / 2, Math.PI, 0); p.lineTo(b / 2, y1); p.arc(0, y1, b / 2, 0, Math.PI); p.closePath(); });
  // borda de pelo serrilhada entre dois pontos (para tufos e farrapos)
  function serra(p, x0, y0, x1, y1, n, amp, nx = 0, ny = 1) {
    for (let i = 1; i <= n; i++) { const t = (i - 0.5) / n, t2 = i / n; p.lineTo(x0 + (x1 - x0) * t + nx * amp * (i % 2 ? 1 : 0.55), y0 + (y1 - y0) * t + ny * amp * (i % 2 ? 1 : 0.55)); p.lineTo(x0 + (x1 - x0) * t2, y0 + (y1 - y0) * t2); }
  }
  function tufo(pc, x, y, w, h, n, cor, ang = 0) {
    pc.peca(P((p) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), R = (px, py) => [x + px * ca - py * sa, y + px * sa + py * ca];
      p.moveTo(...R(-w / 2, 0));
      for (let i = 0; i < n; i++) { const a = -w / 2 + (w * (i + 0.5)) / n; p.quadraticCurveTo(...R(a - w / n * 0.4, -h * 0.5), ...R(a, -h * (0.75 + 0.25 * ((i * 7) % 3) / 2))); p.quadraticCurveTo(...R(a + w / n * 0.3, -h * 0.35), ...R(a + w / n / 2, 0)); }
      p.closePath();
    }), cor, { sombra: 0.05 });
  }
  window.TEO_LOBISOMEM_POSES = {
    parado: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 14, antebraco_d: -18, braco_e: -14, antebraco_e: 18, coxa_d: 4, coxa_e: -4 } },
    garras: { vista: 'frente', expressao: 'raiva', angulos: { braco_d: 32, antebraco_d: -40, mao_d: -10, braco_e: -32, antebraco_e: 40, mao_e: 10, coxa_d: 8, canela_d: -4, coxa_e: -8, canela_e: 4, _desloca: [0, 0.08] } },
    rugindo: { vista: 'frente', expressao: 'rugido', angulos: { braco_d: 75, antebraco_d: -60, mao_d: -20, braco_e: -75, antebraco_e: 60, mao_e: 20, coxa_d: 12, canela_d: -8, coxa_e: -12, canela_e: 8, cabeca: 0, _desloca: [0, 0.12] } },
    tq: { vista: 'tq', expressao: 'raiva', angulos: { braco_d: -10, antebraco_d: -30, braco_e: 12, antebraco_e: -20, coxa_d: -8, coxa_e: 8, tronco: 6 } },
    perfil: { vista: 'perfil', expressao: 'raiva', angulos: { braco_d: -12, antebraco_d: -40, braco_e: 10, antebraco_e: -30, tronco: 8, cabeca: -4 } },
    bote: { vista: 'perfil', expressao: 'rugido', angulos: { tronco: 28, cabeca: -18, braco_d: -100, antebraco_d: -10, braco_e: -80, antebraco_e: -20, coxa_d: 30, canela_d: 40, coxa_e: -45, canela_e: 20, _desloca: [0, -0.3] } },
    costas: { vista: 'costas', expressao: 'raiva', angulos: { braco_d: -14, braco_e: 14 } },
  };
  window.TEO_LOBISOMEM_EXPR = { ...window.EXPRESSOES_PADRAO, rugido: { olhar: [0, 0], palpebra: 0.1, pupila: 1, sobrancelha: { y: 0, ang: -20 }, boca: { tipo: 'aberta', abertura: 0.12 } } };

  window.criarTeoLobisomem = (opcoes = {}, vista = 'frente') => {
    const frente = vista === 'frente', costas = vista === 'costas', perfil = vista === 'perfil', tq = vista === 'tq', lado = tq || perfil;
    const kx = frente || costas ? 1.12 : tq ? 0.95 : 0.74; // largura do tronco conforme a vista
    const SH = 1.0 * kx, WA = 0.52 * kx;            // meia-largura dos ombros e da cintura
    const LB = 1.15, LA = 1.12, LC = 1.12, LK = 0.98;  // braço, antebraço, coxa, canela
    const ombroY = -2.15, pescocoY = -2.35;
    // ---------- tronco: peito musculoso, peito claro, listras, jaqueta em farrapos ----------
    function tronco(pc) {
      const corpo = P((p) => {
        p.moveTo(-0.32 * kx, pescocoY); p.quadraticCurveTo(-SH * 0.8, pescocoY + 0.02, -SH, ombroY + 0.15);
        p.quadraticCurveTo(-SH - 0.12, ombroY + 0.7, -SH * 0.78, -1.0); p.quadraticCurveTo(-WA * 1.05, -0.45, -WA, 0.05);
        p.lineTo(WA, 0.05); p.quadraticCurveTo(WA * 1.05, -0.45, SH * 0.78, -1.0); p.quadraticCurveTo(SH + 0.12, ombroY + 0.7, SH, ombroY + 0.15);
        p.quadraticCurveTo(SH * 0.8, pescocoY + 0.02, 0.32 * kx, pescocoY); p.closePath();
      });
      pc.peca(corpo, PELO, { sombra: 0.16 });
      pc.ctx.save(); pc.ctx.clip(corpo);
      // listras escuras nos lados
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const y = -1.6 + i * 0.38; pc.preencher(P((p) => { p.moveTo(s * SH * 1.1, y); p.quadraticCurveTo(s * SH * 0.7, y + 0.06, s * SH * 0.5, y + 0.2); p.quadraticCurveTo(s * SH * 0.72, y + 0.14, s * SH * 1.1, y + 0.12); p.closePath(); }), LISTRA); }
      if (!costas) {
        // camisa de linho rasgada no meio, mostrando o pelo listrado
        const cx = tq ? 0.18 : perfil ? 0.38 : 0, w = (perfil ? 0.22 : 0.36) * kx;
        const y0 = pescocoY + (lado ? 0.45 : 0.1); const camisa = P((p) => { p.moveTo(cx - w, y0); p.lineTo(cx + w, y0); p.lineTo(cx + w * 1.05, -0.1); p.lineTo(cx - w * 1.05, -0.1); p.closePath(); });
        pc.peca(camisa, tom('#DCCBA6', '#B5A27C', '#EEE2C6'), { sombra: 0.1, contorno: false });
        for (const [x, y, r] of [[cx - w * 0.3, -1.25, 0.2], [cx + w * 0.45, -0.75, 0.16], [cx - w * 0.5, -0.5, 0.12]]) {
          const rasgo = P((p) => { p.moveTo(x - r, y); p.lineTo(x - r * 0.3, y - r * 0.8); p.lineTo(x + r * 0.2, y - r * 0.3); p.lineTo(x + r, y - r * 0.6); p.lineTo(x + r * 0.6, y + r * 0.5); p.lineTo(x, y + r * 0.9); p.lineTo(x - r * 0.6, y + r * 0.4); p.closePath(); });
          pc.preencher(rasgo, PELO.base); pc.linha(rasgo, pc.interno, 'rgba(90,50,30,0.7)');
          pc.preencher(P((p) => { p.moveTo(x - r * 0.6, y); p.quadraticCurveTo(x, y + 0.03, x + r * 0.5, y + r * 0.3); p.quadraticCurveTo(x, y + r * 0.15, x - r * 0.6, y + r * 0.2); p.closePath(); }), LISTRA);
        }
      }
      pc.ctx.restore();
      // jaqueta verde em farrapos (aberta no peito)
      const jaq = (s) => P((p) => {
        const x0 = s * SH * (lado && s < 0 ? 0.9 : 1.02), xi = s * (frente || costas ? 0.4 : 0.16) * kx + (lado ? 0.22 : 0);
        p.moveTo(xi, pescocoY + 0.02); p.lineTo(s * SH * 0.82, pescocoY + 0.05); p.quadraticCurveTo(x0 + s * 0.06, ombroY + 0.1, x0, ombroY + 0.55);
        p.lineTo(s * SH * 0.86, -0.75); serra(p, s * SH * 0.86, -0.75, xi + s * 0.05, -0.55, 6, 0.16, 0, 1); p.quadraticCurveTo(xi - s * 0.04, -1.3, xi, pescocoY + 0.02); p.closePath();
      });
      if (costas) {
        pc.peca(P((p) => { p.moveTo(-SH, ombroY + 0.15); p.quadraticCurveTo(0, pescocoY - 0.05, SH, ombroY + 0.15); p.lineTo(SH * 0.86, -0.8); serra(p, SH * 0.86, -0.8, -SH * 0.86, -0.8, 12, 0.18, 0, 1); p.closePath(); }), VERDE, { sombra: 0.1 });
        for (const [x, y] of [[-0.4, -1.4], [0.35, -1.1]]) pc.peca(P((p) => { p.moveTo(x, y); p.lineTo(x + 0.12, y - 0.1); p.lineTo(x + 0.2, y + 0.08); p.lineTo(x + 0.06, y + 0.2); p.closePath(); }), PELO, { sombra: 0.04 });
      } else for (const s of [-1, 1]) { if (perfil && s < 0) continue; pc.peca(jaq(s), VERDE, { sombra: 0.1 }); pc.peca(P((p) => { const x = s * SH * 0.7, y = -1.45; p.moveTo(x, y); p.lineTo(x + s * 0.12, y - 0.08); p.lineTo(x + s * 0.18, y + 0.1); p.lineTo(x + s * 0.04, y + 0.18); p.closePath(); }), PELO, { sombra: 0.04 }); }
      // cinto
      pc.peca(P((p) => p.roundRect(-WA - 0.05, -0.12, 2 * WA + 0.1, 0.16, 0.05)), COURO, { sombra: 0.05 });
      if (!costas) pc.peca(P((p) => p.roundRect((tq ? 0.15 : perfil ? 0.3 : 0) - 0.09, -0.15, 0.18, 0.22, 0.04)), tom('#C9A24A', '#8A6A2A'), { sombra: 0 });
    }
    // ---------- juba enorme (atrás da cabeça, por cima dos ombros) ----------
    // gola de pelo: contorna o pescoço, cai sobre os ombros em mechas para baixo
    function juba(pc) {
      const w = frente || costas ? 0.95 : tq ? 0.8 : 0.62, cx = perfil ? -0.22 : tq ? -0.06 : 0;
      const mechas = (k, dy) => P((p) => {
        p.moveTo(cx - w * k, -0.1 + dy);
        p.quadraticCurveTo(cx - w * k * 0.9, -0.9 * k + dy, cx, -0.95 * k + dy);
        p.quadraticCurveTo(cx + w * k * 0.9, -0.9 * k + dy, cx + w * k, -0.1 + dy);
        const n = 9;
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
          const xa = cx + w * k * (1 - 2 * t1), xm = cx + w * k * (1 - 2 * tm) + w * 0.04;
          const yb = -0.1 + dy + Math.sin(tm * Math.PI) * 0.45 * k;
          p.quadraticCurveTo(xm + w * 0.06, yb + 0.1, xm, yb + 0.32 * k * (0.8 + 0.2 * ((i * 5) % 3)));
          p.quadraticCurveTo(xm - w * 0.02, yb + 0.05, xa, -0.1 + dy + Math.sin(t1 * Math.PI) * 0.45 * k);
        }
        p.closePath();
      });
      pc.peca(mechas(1.08, 0.06), PELO2, { sombra: 0.12 });
      pc.peca(mechas(0.92, 0), PELO, { sombra: 0.08 });
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) pc.preencher(P((p) => { const x = cx + s * w * (0.35 + i * 0.18), y = -0.05 + i * 0.06; p.moveTo(x, y); p.quadraticCurveTo(x + s * 0.05, y + 0.18, x + s * 0.02, y + 0.32); p.quadraticCurveTo(x - s * 0.03, y + 0.16, x, y); p.closePath(); }), LISTRA);
    }
    // peito de pelo claro estourando da camisa (frente / 3/4)
    function peito(pc) {
      if (costas || perfil) return;
      const cx = tq ? 0.2 : perfil ? 0.42 : 0, w = (perfil ? 0.32 : 0.48) * kx;
      pc.peca(P((p) => {
        p.moveTo(cx - w, -0.25);
        p.quadraticCurveTo(cx - w * 0.6, -0.42, cx, -0.4); p.quadraticCurveTo(cx + w * 0.6, -0.42, cx + w, -0.25);
        const n = 7;
        for (let i = 0; i < n; i++) { const t1 = (i + 1) / n, tm = (i + 0.5) / n, xm = cx + w * (1 - 2 * tm), yb = 0.1 + Math.sin(tm * Math.PI) * 0.45; p.quadraticCurveTo(xm + 0.05, yb, xm, yb + 0.22 + 0.08 * (i % 2)); p.quadraticCurveTo(xm - 0.02, yb, cx + w * (1 - 2 * t1), 0.1 + Math.sin(t1 * Math.PI) * 0.45 - 0.05); }
        p.closePath();
      }), CREME, { sombra: 0.1 });
      pc.linha(P((p) => { for (const s of [-1, 1]) { p.moveTo(cx + s * w * 0.5, 0.15); p.quadraticCurveTo(cx + s * w * 0.4, 0.35, cx + s * w * 0.25, 0.5); } p.moveTo(cx, 0.25); p.lineTo(cx, 0.6); }), pc.interno, 'rgba(160,120,80,0.55)');
    }
    // ---------- cabeça de lobo ----------
    function cabeca(pc, rig) { pc.ctx.save(); pc.ctx.scale(1.14, 1.14); cabecaLobo(pc, rig); pc.ctx.restore(); }
    function cabecaLobo(pc, rig) {
      const ex = rig.expressao || {}, ab = ex.boca && ex.boca.tipo !== 'linha' ? Math.min(1, (ex.boca.abertura || 0.05) / 0.12) : 0.35;
      const pisca = (ex.palpebra || 0) > 0.6;
      if (frente || costas) {
        // orelhas
        for (const s of [-1, 1]) {
          pc.peca(P((p) => { p.moveTo(s * 0.18, -0.9); p.quadraticCurveTo(s * 0.42, -1.45, s * 0.58, -1.62); p.quadraticCurveTo(s * 0.62, -1.15, s * 0.52, -0.72); p.closePath(); }), PELO, { sombra: 0.1 });
          if (frente) { pc.preencher(P((p) => { p.moveTo(s * 0.26, -0.92); p.quadraticCurveTo(s * 0.44, -1.36, s * 0.55, -1.5); p.quadraticCurveTo(s * 0.55, -1.1, s * 0.47, -0.8); p.closePath(); }), '#3E160C'); tufo(pc, s * 0.4, -0.86, 0.22, 0.32, 3, CREME, s * 0.35); }
          pc.preencher(P((p) => { p.moveTo(s * 0.52, -1.48); p.quadraticCurveTo(s * 0.58, -1.6, s * 0.58, -1.62); p.quadraticCurveTo(s * 0.6, -1.45, s * 0.6, -1.4); p.closePath(); }), LISTRA);
        }
        // crânio com bochechas de pelo
        const cranio = P((p) => { p.moveTo(-0.2, -1.0); p.quadraticCurveTo(0, -1.08, 0.2, -1.0); p.quadraticCurveTo(0.55, -0.92, 0.6, -0.55); serra(p, 0.6, -0.55, 0.42, -0.08, 4, 0.12, 1, 0); p.quadraticCurveTo(0.2, 0.08, 0, 0.1); p.quadraticCurveTo(-0.2, 0.08, -0.42, -0.08); serra(p, -0.42, -0.08, -0.6, -0.55, 4, 0.12, -1, 0); p.quadraticCurveTo(-0.55, -0.92, -0.2, -1.0); p.closePath(); });
        pc.peca(cranio, PELO, { sombra: 0.12 });
        if (costas) { tufo(pc, 0, -0.9, 0.5, 0.3, 4, PELO2, 0); return; }
        // marcas escuras na testa e sobrancelhas
        pc.preencher(P((p) => { p.moveTo(-0.06, -0.98); p.lineTo(0, -0.7); p.lineTo(0.06, -0.98); p.closePath(); }), LISTRA);
        for (const s of [-1, 1]) pc.preencher(P((p) => { p.moveTo(s * 0.14, -0.94); p.lineTo(s * 0.1, -0.78); p.lineTo(s * 0.2, -0.9); p.closePath(); }), LISTRA);
        // focinho claro (visto de frente) e ponte do focinho
        pc.peca(P((p) => { p.moveTo(-0.3, -0.42); p.quadraticCurveTo(-0.36, -0.08, -0.16, 0.05); p.quadraticCurveTo(0, 0.12, 0.16, 0.05); p.quadraticCurveTo(0.36, -0.08, 0.3, -0.42); p.quadraticCurveTo(0, -0.34, -0.3, -0.42); p.closePath(); }), CREME, { sombra: 0.06 });
        pc.peca(P((p) => { p.moveTo(-0.11, -0.62); p.quadraticCurveTo(0, -0.66, 0.11, -0.62); p.lineTo(0.15, -0.3); p.quadraticCurveTo(0, -0.26, -0.15, -0.3); p.closePath(); }), PELO2, { sombra: 0.05, contorno: false });
        // olhos amarelos com pupila de fera
        for (const s of [-1, 1]) {
          const x = s * 0.27, y = -0.6;
          pc.preencher(P((p) => p.arc(x, y, 0.16, 0, Math.PI * 2)), 'rgba(255,200,60,0.18)');
          if (pisca) { pc.linha(P((p) => { p.moveTo(x - 0.1, y); p.lineTo(x + 0.1, y); }), pc.interno * 2, LISTRA); continue; }
          pc.peca(P((p) => { p.moveTo(x - s * 0.11, y + 0.03); p.quadraticCurveTo(x, y - 0.08, x + s * 0.12, y - 0.05); p.quadraticCurveTo(x + s * 0.02, y + 0.07, x - s * 0.11, y + 0.03); p.closePath(); }), tom('#FFC93A', '#E09A1A'), { sombra: 0 });
          pc.preencher(P((p) => p.ellipse(x + s * 0.01, y - 0.01, 0.014, 0.045, 0, 0, Math.PI * 2)), '#140A06');
          pc.linha(P((p) => { p.moveTo(x - s * 0.15, y - 0.06); p.lineTo(x + s * 0.13, y - 0.11); }), pc.interno * 2.2, LISTRA);
        }
        // nariz
        pc.peca(P((p) => { p.moveTo(-0.12, -0.33); p.quadraticCurveTo(0, -0.38, 0.12, -0.33); p.quadraticCurveTo(0.1, -0.22, 0, -0.2); p.quadraticCurveTo(-0.1, -0.22, -0.12, -0.33); p.closePath(); }), NARIZ, { sombra: 0 });
        pc.preencher(P((p) => p.ellipse(-0.04, -0.32, 0.03, 0.012, 0, 0, Math.PI * 2)), 'rgba(255,255,255,0.65)');
        // boca rosnando (abre com a expressão/voz)
        const bo = 0.06 + 0.14 * ab;
        const boca = P((p) => { p.moveTo(-0.22, -0.14); p.quadraticCurveTo(0, -0.2, 0.22, -0.14); p.quadraticCurveTo(0.18, -0.12 + bo, 0, -0.1 + bo * 1.1); p.quadraticCurveTo(-0.18, -0.12 + bo, -0.22, -0.14); p.closePath(); });
        pc.peca(boca, tom('#5A1018', '#3A0810'), { sombra: 0 });
        pc.preencher(P((p) => p.ellipse(0, -0.12 + bo * 0.85, 0.1, 0.035 + bo * 0.15, 0, 0, Math.PI * 2)), '#C24A5A');
        for (const s of [-1, 1]) for (const [x, h, yy] of [[0.15, 0.1, -0.16], [0.07, 0.06, -0.17]]) {
          pc.peca(P((p) => { p.moveTo(s * x - 0.025, yy); p.lineTo(s * x + 0.025, yy); p.lineTo(s * x, yy + h); p.closePath(); }), CREME, { sombra: 0, espessura: pc.interno * 0.6 });
          pc.peca(P((p) => { const yb = -0.1 + bo * 1.05; p.moveTo(s * x - 0.02, yb); p.lineTo(s * x + 0.02, yb); p.lineTo(s * x, yb - h * 0.8); p.closePath(); }), CREME, { sombra: 0, espessura: pc.interno * 0.6 });
        }
        // topete ruivo do Téo entre as orelhas
        tufo(pc, 0, -0.96, 0.46, 0.34, 4, PELO2, 0);
        return;
      }
      // ---- de lado (perfil / 3/4): focinho comprido para a direita ----
      const k = tq ? 0.85 : 1;
      pc.peca(P((p) => { p.moveTo(-0.32, -0.88); p.quadraticCurveTo(-0.3, -1.42, -0.2, -1.62); p.quadraticCurveTo(0.0, -1.2, 0.06, -0.86); p.closePath(); }), PELO, { sombra: 0.1 });
      pc.preencher(P((p) => { p.moveTo(-0.24, -0.92); p.quadraticCurveTo(-0.24, -1.32, -0.2, -1.48); p.quadraticCurveTo(-0.06, -1.18, -0.03, -0.9); p.closePath(); }), '#3E160C');
      if (tq) pc.peca(P((p) => { p.moveTo(0.05, -0.92); p.quadraticCurveTo(0.12, -1.38, 0.24, -1.55); p.quadraticCurveTo(0.3, -1.15, 0.28, -0.85); p.closePath(); }), PELO2, { sombra: 0.1 });
      const bo = 0.04 + 0.12 * ab;
      // mandíbula de baixo e boca
      pc.peca(P((p) => { p.moveTo(0.05, -0.28); p.lineTo(0.75 * k, -0.3 + bo); p.lineTo(0.72 * k, -0.2 + bo); p.quadraticCurveTo(0.4, -0.08 + bo * 0.6, 0.05, -0.08); p.closePath(); }), CREME, { sombra: 0.06 });
      pc.preencher(P((p) => { p.moveTo(0.12, -0.33); p.lineTo(0.74 * k, -0.37); p.lineTo(0.72 * k, -0.31 + bo); p.lineTo(0.12, -0.25); p.closePath(); }), '#5A1018');
      // crânio + focinho
      const cab = P((p) => { p.moveTo(-0.5, -0.4); p.quadraticCurveTo(-0.55, -0.85, -0.25, -1.0); p.quadraticCurveTo(0.1, -1.05, 0.32, -0.78); p.quadraticCurveTo(0.6 * k, -0.62, 0.86 * k, -0.52); p.quadraticCurveTo(0.92 * k, -0.44, 0.86 * k, -0.38); p.lineTo(0.12, -0.33); p.quadraticCurveTo(-0.1, -0.12, -0.38, -0.12); serra(p, -0.38, -0.12, -0.5, -0.4, 3, 0.1, -1, 0.3); p.closePath(); });
      pc.peca(cab, PELO, { sombra: 0.12 });
      pc.ctx.save(); pc.ctx.clip(cab);
      pc.preencher(P((p) => { p.moveTo(0.05, -0.5); p.quadraticCurveTo(0.5 * k, -0.48, 0.9 * k, -0.42); p.lineTo(0.9 * k, -0.3); p.lineTo(0.05, -0.3); p.closePath(); }), CREME.base);
      for (let i = 0; i < 3; i++) pc.preencher(P((p) => { const x = -0.2 + i * 0.13; p.moveTo(x, -1.05); p.lineTo(x + 0.06, -0.78); p.lineTo(x + 0.1, -1.05); p.closePath(); }), LISTRA);
      pc.ctx.restore();
      // bochecha de pelo
      tufo(pc, -0.22, -0.2, 0.4, 0.25, 4, PELO2, Math.PI * 0.9);
      // presas
      for (const [x, h] of [[0.62 * k, 0.1], [0.42 * k, 0.07]]) { pc.peca(P((p) => { p.moveTo(x - 0.025, -0.36); p.lineTo(x + 0.025, -0.36); p.lineTo(x, -0.36 + h); p.closePath(); }), CREME, { sombra: 0, espessura: pc.interno * 0.6 }); pc.peca(P((p) => { const yb = -0.27 + bo; p.moveTo(x - 0.02, yb); p.lineTo(x + 0.02, yb); p.lineTo(x, yb - h * 0.8); p.closePath(); }), CREME, { sombra: 0, espessura: pc.interno * 0.6 }); }
      // olho, sobrancelha, nariz
      if (pisca) pc.linha(P((p) => { p.moveTo(0.18, -0.68); p.lineTo(0.36, -0.66); }), pc.interno * 2, LISTRA);
      else {
        pc.preencher(P((p) => p.arc(0.27, -0.66, 0.14, 0, Math.PI * 2)), 'rgba(255,200,60,0.2)');
        pc.peca(P((p) => { p.moveTo(0.16, -0.66); p.quadraticCurveTo(0.27, -0.75, 0.38, -0.7); p.quadraticCurveTo(0.28, -0.6, 0.16, -0.66); p.closePath(); }), tom('#FFC93A', '#E09A1A'), { sombra: 0 });
        pc.preencher(P((p) => p.ellipse(0.29, -0.67, 0.013, 0.04, 0, 0, Math.PI * 2)), '#140A06');
      }
      pc.linha(P((p) => { p.moveTo(0.12, -0.74); p.lineTo(0.4, -0.8); }), pc.interno * 2.2, LISTRA);
      pc.peca(P((p) => p.ellipse(0.86 * k, -0.47, 0.07, 0.055, -0.2, 0, Math.PI * 2)), NARIZ, { sombra: 0 });
      tufo(pc, -0.1, -0.98, 0.4, 0.3, 4, PELO2, -0.3);
    }
    // ---------- membros (grossos, musculosos) ----------
    const braco = (escuro) => (pc) => {
      const cor = escuro ? PELO2 : PELO;
      // ombro redondo + bíceps
      pc.peca(P((p) => { p.moveTo(-0.32, 0.0); p.quadraticCurveTo(-0.42, LB * 0.45, -0.27, LB); p.lineTo(0.27, LB); p.quadraticCurveTo(0.46, LB * 0.38, 0.32, 0.0); p.quadraticCurveTo(0, -0.3, -0.32, 0.0); p.closePath(); }), cor, { sombra: 0.14 });
      pc.preencher(P((p) => { p.moveTo(0.34, LB * 0.55); p.quadraticCurveTo(0.14, LB * 0.62, 0.02, LB * 0.78); p.quadraticCurveTo(0.18, LB * 0.66, 0.36, LB * 0.66); p.closePath(); }), LISTRA);
      // manga verde rasgada até o meio do braço
      pc.peca(P((p) => { p.moveTo(-0.36, -0.02); p.quadraticCurveTo(0, -0.34, 0.36, -0.02); p.lineTo(0.4, LB * 0.42); serra(p, 0.4, LB * 0.42, -0.4, LB * 0.4, 6, 0.16, 0, 1); p.closePath(); }), VERDE, { sombra: 0.1 });
      pc.linha(P((p) => { p.moveTo(-0.1, LB * 0.1); p.lineTo(-0.05, LB * 0.3); }), pc.interno, 'rgba(20,50,30,0.6)');
    };
    const antebraco = (escuro) => (pc) => {
      const cor = escuro ? PELO2 : PELO;
      // antebraço largo em cima (pelo eriçado), afina no pulso
      pc.peca(P((p) => { p.moveTo(-0.3, 0); p.quadraticCurveTo(-0.42, LA * 0.3, -0.22, LA); p.lineTo(0.22, LA); p.quadraticCurveTo(0.44, LA * 0.28, 0.3, 0); p.closePath(); }), cor, { sombra: 0.13 });
      tufo(pc, -0.3, 0.32, 0.32, 0.26, 3, PELO2, -Math.PI / 2 - 0.35);
      tufo(pc, 0.3, 0.28, 0.26, 0.2, 3, PELO2, Math.PI / 2 + 0.35);
      for (let i = 0; i < 2; i++) pc.preencher(P((p) => { const y = LA * (0.4 + i * 0.24); p.moveTo(-0.34, y); p.quadraticCurveTo(-0.08, y + 0.05, 0.06, y + 0.16); p.quadraticCurveTo(-0.1, y + 0.11, -0.34, y + 0.11); p.closePath(); }), LISTRA);
    };
    const mao = (escuro) => (pc, rig) => {
      const cor = escuro ? PELO2 : PELO, curl = ((rig.pose && rig.pose._maos) || {}).fechada ? 0.6 : 0;
      tufo(pc, 0, 0.05, 0.5, 0.16, 5, cor, Math.PI);
      pc.peca(P((p) => p.roundRect(-0.22, -0.02, 0.44, 0.34, 0.15)), cor, { sombra: 0.08 });
      for (let i = 0; i < 4; i++) {
        const x = -0.165 + i * 0.11;
        pc.peca(P((p) => p.roundRect(x - 0.05, 0.22, 0.1, 0.24 - curl * 0.1, 0.05)), cor, { sombra: 0.06 });
        pc.peca(P((p) => { const y = 0.43 - curl * 0.1; p.moveTo(x - 0.038, y); p.quadraticCurveTo(x + 0.05, y + 0.06, x + 0.012, y + 0.24); p.quadraticCurveTo(x - 0.02, y + 0.1, x - 0.038, y); p.closePath(); }), GARRA, { sombra: 0.03, espessura: pc.interno * 0.6 });
      }
      pc.peca(P((p) => p.roundRect(0.17, 0.05, 0.1, 0.2, 0.05)), cor, { sombra: 0.05 });
      pc.peca(P((p) => { p.moveTo(0.2, 0.23); p.quadraticCurveTo(0.27, 0.27, 0.24, 0.38); p.lineTo(0.21, 0.25); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
    };
    // calça comprida cáqui, rasgada abaixo do joelho
    const coxa = (escuro) => (pc) => {
      const cor = escuro ? PELO2 : PELO, c = escuro ? tom('#9C8560', '#77623F') : CALCA;
      pc.peca(P((p) => { p.moveTo(-0.42, -0.1); p.lineTo(0.42, -0.1); p.quadraticCurveTo(0.5, LC * 0.5, 0.34, LC + 0.05); p.lineTo(-0.34, LC + 0.05); p.quadraticCurveTo(-0.5, LC * 0.5, -0.42, -0.1); p.closePath(); }), c, { sombra: 0.12 });
      pc.linha(P((p) => { p.moveTo(-0.2, LC * 0.3); p.quadraticCurveTo(-0.05, LC * 0.4, 0.05, LC * 0.38); p.moveTo(0.1, LC * 0.7); p.quadraticCurveTo(0.2, LC * 0.78, 0.3, LC * 0.75); }), pc.interno, 'rgba(90,70,40,0.6)');
      const r = P((p) => { p.moveTo(-0.1, LC * 0.5); p.lineTo(0.05, LC * 0.42); p.lineTo(0.16, LC * 0.55); p.lineTo(0.02, LC * 0.64); p.closePath(); });
      pc.preencher(r, cor.base); pc.linha(r, pc.interno, 'rgba(90,60,30,0.7)');
    };
    // canela: de frente, coluna grossa; de lado, digitígrada (inclina para trás)
    const canela = (escuro) => (pc) => {
      const cor = escuro ? PELO2 : PELO, c = escuro ? tom('#9C8560', '#77623F') : CALCA;
      if (lado) pc.peca(P((p) => { p.moveTo(-0.28, 0); p.quadraticCurveTo(-0.58, LK * 0.5, -0.5, LK); p.lineTo(-0.2, LK); p.quadraticCurveTo(0.0, LK * 0.45, 0.3, 0); p.closePath(); }), cor, { sombra: 0.13 });
      else pc.peca(P((p) => { p.moveTo(-0.3, 0); p.quadraticCurveTo(-0.36, LK * 0.4, -0.2, LK); p.lineTo(0.2, LK); p.quadraticCurveTo(0.36, LK * 0.4, 0.3, 0); p.closePath(); }), cor, { sombra: 0.13 });
      // barra da calça rasgada
      const x0 = lado ? -0.42 : -0.36, x1 = lado ? 0.34 : 0.36;
      pc.peca(P((p) => { p.moveTo(x0, -0.05); p.lineTo(x1, -0.05); p.lineTo(x1 - (lado ? 0.12 : 0.02), LK * 0.42); serra(p, x1 - (lado ? 0.12 : 0.02), LK * 0.42, x0 - (lado ? 0.08 : -0.02), LK * 0.42, 6, 0.16, 0, 1); p.closePath(); }), c, { sombra: 0.12 });
      tufo(pc, lado ? -0.1 : 0, LK * 0.5, 0.56, 0.14, 5, PELO2, Math.PI);
    };
    const pe = (escuro) => (pc) => {
      const cor = escuro ? PELO2 : PELO;
      if (lado) {
        pc.peca(P((p) => { p.moveTo(-0.17, 0); p.lineTo(0.12, 0); p.lineTo(0.34, 0.68); p.lineTo(0.06, 0.72); p.closePath(); }), cor, { sombra: 0.1 });
        pc.peca(P((p) => { p.moveTo(-0.02, 0.58); p.quadraticCurveTo(0.55, 0.5, 0.7, 0.76); p.quadraticCurveTo(0.6, 0.84, -0.04, 0.84); p.closePath(); }), cor, { sombra: 0.08 });
        pc.peca(P((p) => { p.moveTo(-0.16, 0.05); p.lineTo(0.16, 0.02); p.lineTo(0.22, 0.24); serra(p, 0.22, 0.24, -0.12, 0.26, 4, 0.08, 0, 1); p.closePath(); }), COURO, { sombra: 0.08 });
        for (const x of [0.4, 0.52, 0.64]) pc.peca(P((p) => { p.moveTo(x, 0.74); p.quadraticCurveTo(x + 0.09, 0.76, x + 0.12, 0.88); p.lineTo(x + 0.02, 0.82); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
        return;
      }
      pc.peca(P((p) => { p.moveTo(-0.21, -0.05); p.lineTo(0.21, -0.05); p.lineTo(0.27, 0.55); p.lineTo(-0.27, 0.55); p.closePath(); }), cor, { sombra: 0.1 });
      pc.peca(P((p) => p.ellipse(0, 0.67, 0.36, 0.18, 0, 0, Math.PI * 2)), cor, { sombra: 0.08 });
      // resto da bota estourada no tornozelo
      pc.peca(P((p) => { p.moveTo(-0.25, 0.08); p.lineTo(0.25, 0.08); p.lineTo(0.28, 0.32); serra(p, 0.28, 0.32, -0.28, 0.32, 5, 0.09, 0, 1); p.closePath(); }), COURO, { sombra: 0.08 });
      for (const x of [-0.22, -0.075, 0.075, 0.22]) pc.peca(P((p) => { p.moveTo(x - 0.04, 0.76); p.quadraticCurveTo(x + 0.04, 0.8, x, 0.94); p.lineTo(x + 0.04, 0.78); p.closePath(); }), GARRA, { sombra: 0, espessura: pc.interno * 0.6 });
    };
    // ---------- rabo (felpudo, ponta clara) ----------
    function rabo(pc) {
      const s = perfil || tq ? -1 : 1, bx = perfil ? -0.4 : tq ? -0.3 : 0.25, k = 0.9;
      const forma = P((p) => { p.moveTo(bx, -0.1); p.quadraticCurveTo(bx + 1.2 * k * s, -0.25, bx + 1.4 * k * s, 0.85 * k); p.quadraticCurveTo(bx + 1.3 * k * s, 1.45 * k, bx + 0.85 * k * s, 1.3 * k); serra(p, bx + 0.85 * k * s, 1.3 * k, bx - 0.05 * s, 0.25, 7, 0.14, -s * 0.5, 0.5); p.closePath(); });
      pc.peca(forma, PELO, { sombra: 0.16 });
      pc.ctx.save(); pc.ctx.clip(forma);
      for (let i = 0; i < 4; i++) pc.preencher(P((p) => { const t = i / 4, x = bx + (0.35 + t * 0.85) * k * s, y = 0.05 + t * 0.9 * k; p.moveTo(x - 0.18 * s, y); p.quadraticCurveTo(x, y + 0.1, x + 0.18 * s, y + 0.24); p.quadraticCurveTo(x, y + 0.14, x - 0.18 * s, y + 0.08); p.closePath(); }), LISTRA);
      pc.ctx.restore();
      pc.peca(P((p) => { p.moveTo(bx + 1.38 * k * s, 0.95 * k); p.quadraticCurveTo(bx + 1.3 * k * s, 1.45 * k, bx + 0.85 * k * s, 1.3 * k); serra(p, bx + 0.85 * k * s, 1.3 * k, bx + 1.1 * k * s, 0.95 * k, 3, 0.07, -s, -0.3); p.closePath(); }), CREME, { sombra: 0.06 });
    }
    // pélvis (shorts da calça rasgada)
    function quadril(pc) { pc.peca(P((p) => { p.moveTo(-WA - 0.08, -0.15); p.lineTo(WA + 0.08, -0.15); p.lineTo(WA + 0.2, 0.4); p.lineTo(-WA - 0.2, 0.4); p.closePath(); }), CALCA, { sombra: 0.1 }); }
    function pescoco(pc) { pc.peca(P((p) => p.roundRect(-0.3, -0.45, 0.6, 0.6, 0.2)), PELO, { sombra: 0.08 }); }
    // ---------- montagem ----------
    const bx = SH - 0.12, qx = 0.36 * kx;
    const fZ = { cauda: 0.2, coxa_e: 1, canela_e: 1.05, pe_e: 1.1, coxa_d: 1, canela_d: 1.05, pe_d: 1.1, quadril: 1.5, pescoco: 2.6, tronco: 3, juba: 3.4, peito: 3.5, braco_e: 5, antebraco_e: 5.1, mao_e: 5.2, braco_d: 5, antebraco_d: 5.1, mao_d: 5.2, cabeca: 6 };
    const lZ = { braco_e: 0.4, antebraco_e: 0.45, mao_e: 0.5, coxa_e: 0.7, canela_e: 0.75, pe_e: 0.8, cauda: 0.9, quadril: 1.5, coxa_d: 2, canela_d: 2.05, pe_d: 2.1, pescoco: 2.6, tronco: 3, juba: 3.4, peito: 3.5, braco_d: 5, antebraco_d: 5.1, mao_d: 5.2, cabeca: 6 };
    const z = lado ? lZ : fZ;
    if (costas) { z.cauda = 4; z.cabeca = 3.6; z.juba = 3.5; }
    const eL = lado; // membro do lado de lá mais escuro
    const kneeX = lado ? 0.18 : 0, ankX = lado ? -0.3 : 0;
    const partes = [
      { nome: 'quadril', pai: null, pivo: [0, HIP], z: z.quadril, desenhar: quadril },
      { nome: 'cauda', pai: 'quadril', pivo: [0, 0.05], z: z.cauda, desenhar: rabo },
      { nome: 'coxa_d', pai: 'quadril', pivo: [lado ? 0.05 : -qx, 0.12], z: z.coxa_d, grupo: 'perna_d', desenhar: coxa(false) },
      { nome: 'canela_d', pai: 'coxa_d', pivo: [kneeX, LC], z: z.canela_d, grupo: 'perna_d', desenhar: canela(false) },
      { nome: 'pe_d', pai: 'canela_d', pivo: [ankX, LK], z: z.pe_d, desenhar: pe(false) },
      { nome: 'coxa_e', pai: 'quadril', pivo: [lado ? -0.08 : qx, 0.12], z: z.coxa_e, grupo: 'perna_e', desenhar: coxa(eL) },
      { nome: 'canela_e', pai: 'coxa_e', pivo: [kneeX, LC], z: z.canela_e, grupo: 'perna_e', desenhar: canela(eL) },
      { nome: 'pe_e', pai: 'canela_e', pivo: [ankX, LK], z: z.pe_e, desenhar: pe(eL) },
      { nome: 'tronco', pai: 'quadril', pivo: [0, -0.05], z: z.tronco, desenhar: tronco },
      { nome: 'juba', pai: 'tronco', pivo: [lado ? 0.05 : 0, pescocoY + 0.1], z: z.juba, desenhar: juba },
      { nome: 'peito', pai: 'tronco', pivo: [0, pescocoY + 0.1], z: z.peito, desenhar: peito },
      { nome: 'pescoco', pai: 'tronco', pivo: [lado ? 0.12 : 0, pescocoY + 0.05], z: z.pescoco, desenhar: pescoco },
      { nome: 'cabeca', pai: 'pescoco', pivo: [lado ? 0.05 : 0, -0.35], z: z.cabeca, desenhar: cabeca },
      { nome: 'braco_d', pai: 'tronco', pivo: [lado ? 0.1 : -bx, ombroY + 0.18], z: z.braco_d, grupo: 'braco_d', desenhar: braco(false) },
      { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, LB], z: z.antebraco_d, grupo: 'braco_d', desenhar: antebraco(false) },
      { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, LA], z: z.mao_d, desenhar: mao(false) },
      { nome: 'braco_e', pai: 'tronco', pivo: [lado ? -0.15 : bx, ombroY + 0.18], z: z.braco_e, grupo: 'braco_e', desenhar: braco(eL) },
      { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, LB], z: z.antebraco_e, grupo: 'braco_e', desenhar: antebraco(eL) },
      { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, LA], z: z.mao_e, desenhar: mao(eL) },
    ];
    // ajuste de altura: de lado a perna dobra (digitígrada), então o quadril desce menos
    if (lado) partes[0].pivo = [0, HIP + 0.02];
    return {
      nome: 'Téo lobisomem', vista, opcoes, alturaEmH: A, larguraOmbrosH: lado ? 1.4 : SH * 2 + 0.4, fatorContorno: 1.6,
      partes, poses: Object.fromEntries(Object.entries(window.TEO_LOBISOMEM_POSES).map(([k, v]) => [k, v.angulos])), expressoes: window.TEO_LOBISOMEM_EXPR,
    };
  };
})();

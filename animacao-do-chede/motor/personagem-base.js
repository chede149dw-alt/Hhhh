// Base genérica de personagem (recorte, 4 vistas), seguindo o guia-de-estilo.md.
// criarPersonagem(cfg, vista) -> definição para o Rig. Usada pelos personagens secundários.
// (O Lucas tem o próprio arquivo, personagens/lucas/lucas.js, e não usa esta base.)
//
// cfg (todas as chaves são opcionais):
//   altura (em H), cabecaLargura, pele, fatorContorno,
//   olhos: { raio, sep, iris, cilios }, sobrancelha: { esp, tipo: 'arqueada'|'reta' },
//   cabelo: { estilo: 'coque'|'liso-lateral'|'baguncado', cor, volume },
//   acessorios: { oculos, brincos (cor) },
//   corpo: { ombro, quadril },
//   top: { tipo: 'moletom'|'camiseta'|'cardiga', cor, corInterna, mangaLonga (cor ou null), faixa },
//   calca: { tipo: 'larga'|'reta', cor },
//   calcado: { tipo: 'cano-alto'|'baixo'|'sapatilha', cor, acento }
// Lados: "_d" = lado direito do personagem. Vistas 'tq' e 'perfil' olham para a direita.
(function () {
  const T = (n) => Estilo.tom(n);
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const capsula = (wTop, wBot, y0, y1) => P((p) => {
    p.moveTo(-wTop / 2, y0); p.arc(0, y0, wTop / 2, Math.PI, 0);
    p.lineTo(wBot / 2, y1); p.arc(0, y1, wBot / 2, 0, Math.PI); p.closePath();
  });
  function zigue(p, pts, dy = 0, suave = false) {
    p.moveTo(pts[0][0], pts[0][1] + dy);
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i]; const [px, py] = pts[i - 1];
      if (suave) p.quadraticCurveTo(px, py + dy, (px + x) / 2, (py + y) / 2 + dy);
      else p.quadraticCurveTo((px + x) / 2 + 0.01, Math.max(py, y) + dy, x, y + dy);
    }
    if (suave) { const l = pts[pts.length - 1]; p.lineTo(l[0], l[1] + dy); }
  }
  function cunhas(p, pts, estufa = 0.12) {
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i]; const [px, py] = pts[i - 1];
      const mx = (px + x) / 2, my = (py + y) / 2;
      p.quadraticCurveTo(mx + mx * estufa, my + (my + 0.5) * estufa, x, y);
    }
  }

  const CABELOS = {
    baguncado: {
      borda: [[0.48, -0.38], [0.43, -0.63], [0.36, -0.52], [0.27, -0.69], [0.16, -0.55], [0.06, -0.71], [-0.04, -0.51],
        [-0.14, -0.69], [-0.25, -0.47], [-0.3, -0.67], [-0.4, -0.55], [-0.44, -0.66], [-0.49, -0.38]],
      topo: [[-0.49, -0.38], [-0.6, -0.5], [-0.54, -0.6], [-0.63, -0.78], [-0.51, -0.85], [-0.53, -1.01], [-0.35, -0.99],
        [-0.3, -1.15], [-0.13, -1.05], [-0.02, -1.21], [0.09, -1.07], [0.25, -1.17], [0.29, -1.03], [0.47, -1.03],
        [0.45, -0.89], [0.62, -0.81], [0.54, -0.67], [0.61, -0.52], [0.48, -0.38]],
      nuca: [[-0.5, -0.32], [-0.43, -0.12], [-0.32, -0.22], [-0.2, -0.05], [-0.07, -0.17], [0.05, -0.03], [0.17, -0.18],
        [0.29, -0.07], [0.41, -0.2], [0.5, -0.32]],
      linhas: [[[-0.14, -0.69], [-0.12, -0.84], [-0.02, -0.97]], [[0.16, -0.55], [0.2, -0.75], [0.3, -0.9]]],
      estufa: 0.12,
    },
    'liso-lateral': {
      borda: [[0.48, -0.4], [0.47, -0.62], [0.36, -0.73], [0.3, -0.64], [0.18, -0.76], [0.05, -0.65], [-0.1, -0.68],
        [-0.22, -0.57], [-0.33, -0.6], [-0.39, -0.45], [-0.44, -0.58], [-0.49, -0.38]],
      topo: [[-0.49, -0.38], [-0.56, -0.62], [-0.52, -0.87], [-0.34, -1.02], [-0.08, -1.08], [0.16, -1.06], [0.23, -1.15],
        [0.3, -1.04], [0.46, -0.96], [0.56, -0.75], [0.55, -0.55], [0.48, -0.4]],
      nuca: [[-0.5, -0.32], [-0.42, -0.16], [-0.25, -0.22], [-0.08, -0.12], [0.1, -0.2], [0.28, -0.13], [0.42, -0.2], [0.5, -0.32]],
      linhas: [[[0.24, -1.03], [0.28, -0.9], [0.26, -0.76]], [[0.05, -0.65], [-0.08, -0.82], [-0.06, -0.97]]],
      estufa: 0.06,
    },
    coque: {
      // risca no meio, cabelo puxado para trás, franja cortina e coque no alto
      borda: [[0.48, -0.34], [0.46, -0.56], [0.36, -0.66], [0.2, -0.72], [0.06, -0.76], [0.0, -0.8], [-0.06, -0.76],
        [-0.2, -0.72], [-0.36, -0.66], [-0.46, -0.56], [-0.48, -0.34]],
      topo: [[-0.48, -0.34], [-0.53, -0.6], [-0.5, -0.84], [-0.33, -0.99], [0, -1.03], [0.33, -0.99], [0.5, -0.84],
        [0.53, -0.6], [0.48, -0.34]],
      nuca: [[-0.5, -0.3], [-0.38, -0.2], [0, -0.17], [0.38, -0.2], [0.5, -0.3]],
      linhas: [[[0.0, -0.8], [0.12, -0.9], [0.3, -0.92]], [[0.0, -0.8], [-0.12, -0.9], [-0.3, -0.92]]],
      suave: true, estufa: 0.05, coque: true,
    },
  };

  // cacheado (Chede e Kaik): contorno em muitos caracóis arredondados
  const cachos = (n, cx, cy, rx, ry, a0, a1, amp) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * (i / n), k = i % 2 ? 1 + amp : 1;
    return [Math.round((cx + Math.cos(a) * rx * k) * 1000) / 1000, Math.round((cy + Math.sin(a) * ry * k) * 1000) / 1000];
  });
  CABELOS.cacheado = {
    // justo na cabeça (pedido do usuário 12/11: "o cabelo ficou fora da cabeça")
    borda: [[0.47, -0.4], ...cachos(12, 0, -0.62, 0.45, 0.13, -0.2, -Math.PI + 0.2, 0.16).slice(1, -1), [-0.47, -0.4]],
    topo: [[-0.47, -0.4], ...cachos(22, 0, -0.52, 0.53, 0.5, Math.PI - 0.12, 2 * Math.PI + 0.12, 0.06).slice(1, -1), [0.47, -0.4]],
    nuca: [[-0.48, -0.3], ...cachos(8, 0, -0.2, 0.44, 0.06, Math.PI, 0, 0.22).slice(1, -1), [0.48, -0.3]],
    linhas: [[[-0.2, -0.78], [-0.14, -0.88], [-0.02, -0.92]], [[0.12, -0.8], [0.2, -0.88], [0.3, -0.9]]],
    estufa: 0.14,
  };


  const ANGULO = { frente: 0, tq: 45, perfil: 90, costas: 180 };

  window.criarPersonagem = function (cfg = {}, vista = 'frente') {
    const c = {
      nome: 'Personagem', altura: 5.5, cabecaLargura: 0.92, pele: 'pele2', fatorContorno: 1.35,
      ...cfg,
      olhos: { raio: 0.07, sep: 0.19, iris: 'irisCastanho', cilios: false, ...(cfg.olhos || {}) },
      sobrancelha: { esp: 0.055, tipo: 'arqueada', ...(cfg.sobrancelha || {}) },
      cabelo: { estilo: 'liso-lateral', cor: 'cabCastanho', volume: 1, ...(cfg.cabelo || {}) },
      acessorios: { oculos: false, brincos: null, ...(cfg.acessorios || {}) },
      corpo: { ombro: 0.6, quadril: 0.2, ...(cfg.corpo || {}) },
      top: { tipo: 'camiseta', cor: 'mostarda', corInterna: 'linho', mangaLonga: null, faixa: null, ...(cfg.top || {}) },
      calca: { tipo: 'reta', cor: 'denim', ...(cfg.calca || {}) },
      calcado: { tipo: 'baixo', cor: 'linho', acento: 'pedra', ...(cfg.calcado || {}) },
    };
    const th = (ANGULO[vista] * Math.PI) / 180, cosT = Math.cos(th), sinT = Math.sin(th);
    const lado = vista === 'tq' || vista === 'perfil';
    const COR = {
      pele: T(c.pele), cabelo: T(c.cabelo.cor), top: T(c.top.cor), interna: T(c.top.corInterna),
      manga: c.top.mangaLonga ? T(c.top.mangaLonga) : null, faixa: c.top.faixa ? T(c.top.faixa) : null,
      calca: T(c.calca.cor), calcado: T(c.calcado.cor), acento: T(c.calcado.acento), detalhe: T('pedra'),
      iris: Estilo.base[c.olhos.iris],
    };

    const A = c.altura, f = (A - 1) / 4.5;
    const Y = (y) => (y <= 1 ? y : 1 + (y - 1) * f);
    const yOmbro = Y(1.2), yQuadril = Y(2.75), yJoelho = Y(4.0);
    const tO = yQuadril - 0.15 * f, ombroL = yOmbro - tO;
    const neckY = ombroL - 0.06, shoulderY = ombroL + 0.04;
    const tipoTop = c.top.tipo;
    const fit = {
      moletom: { sw: c.corpo.ombro + 0.06, hw: c.corpo.ombro + 0.08, hem: yQuadril + 0.27 * f },
      camiseta: { sw: c.corpo.ombro, hw: c.corpo.ombro - 0.04, hem: yQuadril + 0.16 * f },
      cardiga: { sw: c.corpo.ombro, hw: c.corpo.ombro + 0.02, hem: yQuadril + 0.34 * f },
    }[tipoTop];
    const hemY = fit.hem - tO;
    const bracoX = fit.sw - 0.04;
    const Lbraco = 0.78 * f, Lante = 0.74 * f;
    const quadrilX = c.corpo.quadril;
    const Lcoxa = yJoelho - yQuadril - 0.05 * f, Lcanela = A - 0.35 - yJoelho;
    const pescocoX = vista === 'perfil' ? 0.1 : vista === 'tq' ? 0.06 : 0;
    const largMembro = tipoTop === 'moletom' ? 1 : 0.86;

    // ---------- pernas ----------
    function quadril(pc) {
      const k = vista === 'perfil' ? 0.72 : vista === 'tq' ? 0.9 : 1;
      const w = quadrilX + 0.22;
      pc.peca(P((p) => {
        p.moveTo(-w * k, -0.3); p.lineTo(w * k, -0.3); p.lineTo((w - 0.02) * k, 0.22);
        p.quadraticCurveTo(0, 0.3, -(w - 0.02) * k, 0.22); p.closePath();
      }), COR.calca, { sombra: 0.08 });
    }
    const CAL = { larga: { c0: 0.48, c1: 0.44, k0: 0.44, k1: 0.52 }, reta: { c0: 0.4, c1: 0.35, k0: 0.35, k1: 0.37 }, bermuda: { c0: 0.5, c1: 0.47, k0: 0.27, k1: 0.24 } }[c.calca.tipo];
    function coxa(pc) {
      const a = CAL.c0 / 2, b = CAL.c1 / 2;
      if (c.calca.tipo === 'bermuda') pc.peca(capsula(0.28, 0.27, -0.1, Lcoxa), COR.pele, { sombra: 0.06 });
      pc.peca(P((p) => {
        p.moveTo(-a, -0.15); p.lineTo(a + 0.01, -0.15);
        const Lb = c.calca.tipo === 'bermuda' ? Lcoxa * 0.82 : Lcoxa + 0.05;
        p.quadraticCurveTo(a + 0.02, Lb * 0.5, b, Lb); p.lineTo(-b, Lb);
        p.quadraticCurveTo(-a - 0.01, Lb * 0.5, -a, -0.15); p.closePath();
      }), COR.calca, { sombra: 0.09 });
      pc.linha(P((p) => { p.moveTo(-b * 0.6, Lcoxa - 0.02); p.quadraticCurveTo(0, Lcoxa + 0.03, b * 0.5, Lcoxa - 0.04); }));
    }
    function canela(pc) {
      const a = CAL.k0 / 2, b = CAL.k1 / 2, L = Lcanela;
      pc.peca(P((p) => {
        p.moveTo(-a, 0); p.arc(0, 0, a, Math.PI, 0);
        p.lineTo(a, L * 0.78); p.quadraticCurveTo(b + 0.01, L * 0.86, b, L - 0.04);
        p.quadraticCurveTo(0, L + 0.01, -b, L - 0.04); p.quadraticCurveTo(-b - 0.01, L * 0.86, -a, L * 0.78); p.closePath();
      }), c.calca.tipo === 'bermuda' ? COR.pele : COR.calca, { sombra: 0.09 });
      if (c.calca.tipo === 'bermuda') {
        // perna de fora: sem barra
      } else if (c.calca.tipo === 'larga') {
        pc.linha(P((p) => { p.moveTo(-b + 0.02, L * 0.8); p.quadraticCurveTo(-0.02, L * 0.85, b * 0.6, L * 0.79); }));
      } else {
        pc.linha(P((p) => { p.moveTo(-b + 0.03, L * 0.9); p.lineTo(b - 0.03, L * 0.9); }));
      }
    }
    function pe(pc) {
      const tipo = c.calcado.tipo;
      const h = tipo === 'sapatilha' ? 0.7 : 1; // sapatilha é mais baixa
      const lin = T('linho');
      if (tipo === 'cano-alto') {
        pc.peca(P((p) => p.roundRect(-0.15, -0.3, 0.3, 0.4, 0.05)), COR.calcado, { sombra: 0.06 });
        pc.peca(P((p) => p.roundRect(-0.155, -0.31, 0.31, 0.09, 0.04)), COR.acento, { sombra: 0.03 });
      }
      const sola = (x0, w) => P((p) => p.roundRect(x0, 0.24 + (1 - h) * 0.1, w, 0.12 - (1 - h) * 0.06, 0.04));
      if (vista === 'frente' || vista === 'costas') {
        const cab = P((p) => {
          p.moveTo(-0.19, 0.27 - 0.31 * h); p.lineTo(0.19, 0.27 - 0.31 * h);
          p.bezierCurveTo(0.26, 0.27 - 0.23 * h, 0.27, 0.2, 0.25, 0.27);
          p.lineTo(-0.21, 0.27); p.bezierCurveTo(-0.24, 0.2, -0.24, 0.27 - 0.23 * h, -0.19, 0.27 - 0.31 * h); p.closePath();
        });
        pc.peca(cab, COR.calcado, { sombra: 0.07 });
        if (vista === 'frente' && tipo !== 'sapatilha') {
          pc.sombraDentro(cab, P((p) => { p.moveTo(-0.2, 0.27); p.quadraticCurveTo(-0.2, 0.14, 0.03, 0.13); p.quadraticCurveTo(0.25, 0.14, 0.255, 0.27); p.closePath(); }), COR.acento.base);
          pc.linha(P((p) => { p.moveTo(-0.07, 0.04); p.lineTo(0.1, 0.04); p.moveTo(-0.06, 0.09); p.lineTo(0.11, 0.09); }), pc.interno, COR.detalhe.base);
        }
        if (tipo !== 'sapatilha') pc.peca(sola(-0.25, 0.53), lin, { sombra: 0.04 });
        return;
      }
      const k = vista === 'tq' ? 0.72 : 1, X = (x) => x * k;
      const cab = P((p) => {
        p.moveTo(X(-0.2), 0.27 - 0.32 * h); p.lineTo(X(0.12), 0.27 - 0.3 * h);
        p.quadraticCurveTo(X(0.36), 0.27 - 0.23 * h, X(0.6), 0.14 + (1 - h) * 0.06);
        p.quadraticCurveTo(X(0.72), 0.2, X(0.7), 0.28); p.lineTo(X(-0.24), 0.28);
        p.quadraticCurveTo(X(-0.27), 0.1, X(-0.2), 0.27 - 0.32 * h); p.closePath();
      });
      pc.peca(cab, COR.calcado, { sombra: 0.06 });
      if (tipo !== 'sapatilha') {
        pc.sombraDentro(cab, P((p) => { p.moveTo(X(0.42), 0.28); p.quadraticCurveTo(X(0.44), 0.12, X(0.6), 0.13); p.quadraticCurveTo(X(0.74), 0.18, X(0.72), 0.28); p.closePath(); }), COR.acento.base);
        pc.peca(sola(X(-0.27), X(1.0)), lin, { sombra: 0.04 });
      }
    }

    // ---------- tronco ----------
    function capuzAtras(pc) {
      if (tipoTop !== 'moletom' || vista === 'costas') return;
      const dx = vista === 'perfil' ? -0.26 : vista === 'tq' ? -0.08 : 0, w = vista === 'perfil' ? 0.3 : 0.42;
      pc.peca(P((p) => {
        p.moveTo(dx - w, -0.06); p.quadraticCurveTo(dx - w - 0.02, -0.4, dx, -0.42);
        p.quadraticCurveTo(dx + w + 0.02, -0.4, dx + w, -0.06); p.closePath();
      }), { base: COR.top.sombra, sombra: COR.top.sombra }, { sombra: 0 });
    }
    function pescoco(pc) {
      const forma = P((p) => p.rect(-0.12, -0.3, 0.24, 0.42));
      pc.peca(forma, COR.pele, { sombra: 0 });
      if (vista !== 'costas') pc.sombraDentro(forma, P((p) => p.rect(-0.2, -0.3, 0.4, 0.2)), COR.pele.sombra);
    }
    function contornoTronco(k, sw, hw) {
      return P((p) => {
        p.moveTo(-0.16 * k, neckY);
        p.quadraticCurveTo(-0.45 * k, neckY + 0.02, -sw * k, shoulderY);
        p.quadraticCurveTo(-(sw + 0.13) * k, shoulderY + 0.08, -(sw + 0.08) * k, shoulderY + 0.32);
        p.quadraticCurveTo(-(hw + 0.02) * k, (shoulderY + hemY) / 2, -hw * k, hemY);
        p.quadraticCurveTo(0, hemY + 0.05, hw * k, hemY);
        p.quadraticCurveTo((hw + 0.02) * k, (shoulderY + hemY) / 2, (sw + 0.08) * k, shoulderY + 0.32);
        p.quadraticCurveTo((sw + 0.13) * k, shoulderY + 0.08, sw * k, shoulderY);
        p.quadraticCurveTo(0.45 * k, neckY + 0.02, 0.16 * k, neckY);
        p.quadraticCurveTo(0, neckY + 0.1, -0.16 * k, neckY);
        p.closePath();
      });
    }
    function tronco(pc) {
      const sw = fit.sw, hw = fit.hw;
      if (vista === 'perfil') {
        const d = c.corpo.ombro * 0.62;
        const corpo = P((p) => {
          p.moveTo(-0.12, neckY - 0.02);
          p.quadraticCurveTo(-d + 0.02, neckY + 0.02, -d, shoulderY + 0.25);
          p.quadraticCurveTo(-d - 0.03, (shoulderY + hemY) / 2, -d + 0.02, hemY);
          p.lineTo(d + 0.04, hemY);
          p.quadraticCurveTo(d + 0.1, (shoulderY + hemY) / 2 + 0.1, d + 0.04, shoulderY + 0.35);
          p.quadraticCurveTo(d, neckY + 0.05, 0.18, neckY); p.closePath();
        });
        pc.peca(corpo, COR.top, { sombra: 0.12 });
        if (tipoTop === 'cardiga') {
          pc.sombraDentro(corpo, P((p) => { p.moveTo(0.12, neckY); p.lineTo(d + 0.2, neckY); p.lineTo(d + 0.2, hemY); p.lineTo(d - 0.02, hemY); p.quadraticCurveTo(d - 0.06, neckY + 0.5, 0.12, neckY); }), COR.interna.base);
          pc.linha(P((p) => { p.moveTo(0.12, neckY + 0.02); p.quadraticCurveTo(d - 0.06, neckY + 0.5, d - 0.02, hemY); }));
        } else if (tipoTop === 'camiseta') {
          pc.linha(P((p) => { p.moveTo(-0.1, neckY + 0.05); p.quadraticCurveTo(0.05, neckY + 0.1, 0.18, neckY + 0.02); }));
        }
        return;
      }
      const k = vista === 'tq' ? 0.94 : 1;
      const corpo = contornoTronco(k, sw, hw);
      pc.peca(corpo, COR.top, { sombra: 0.14 });
      const cx = vista === 'tq' ? 0.15 : 0;
      if (vista === 'costas') {
        if (tipoTop === 'moletom') pc.linha(P((p) => { p.moveTo(-0.26, neckY + 0.12); p.quadraticCurveTo(0, shoulderY + 0.42, 0.26, neckY + 0.12); }));
        pc.linha(P((p) => { p.moveTo(-hw * 0.5, hemY - 0.05); p.lineTo(hw * 0.5, hemY - 0.05); }));
        return;
      }
      if (tipoTop === 'camiseta') {
        // gola careca
        const gola = P((p) => {
          p.moveTo(cx - 0.17, neckY); p.quadraticCurveTo(cx, neckY + 0.16, cx + 0.17, neckY);
          p.lineTo(cx + 0.13, neckY - 0.01); p.quadraticCurveTo(cx, neckY + 0.1, cx - 0.13, neckY - 0.01); p.closePath();
        });
        pc.peca(gola, COR.top, { sombra: 0, espessura: pc.interno });
        pc.linha(P((p) => { p.moveTo(-hw * k + 0.1, hemY - 0.35); p.quadraticCurveTo(-hw * k + 0.18, hemY - 0.25, -hw * k + 0.15, hemY - 0.1); }));
        if (c.top.listra) {
          // faixa larga atravessando o peito (Kaik)
          const yl = shoulderY + 0.42, hl = 0.13;
          pc.sombraDentro(corpo, P((p) => p.rect(-1, yl, 2, hl)), T(c.top.listra).base);
          pc.sombraDentro(corpo, P((p) => p.rect(-1, yl + hl, 2, 0.03)), T(c.top.cor).sombra);
        }
        if (c.top.bolso) {
          // bolso no peito, do lado esquerdo da tela (Chede)
          const bx = cx - 0.3, by = shoulderY + 0.3;
          pc.peca(P((p) => { p.moveTo(bx - 0.11, by); p.lineTo(bx + 0.11, by); p.lineTo(bx + 0.11, by + 0.2); p.lineTo(bx, by + 0.25); p.lineTo(bx - 0.11, by + 0.2); p.closePath(); }), { base: T(c.top.cor).sombra, sombra: T(c.top.cor).sombra }, { sombra: 0, espessura: pc.interno });
        }
        if (c.top.estampa) {
          const cor = T(c.top.estampa);
          pc.peca(P((p) => { p.moveTo(cx - 0.12, shoulderY + 0.55); p.lineTo(cx + 0.12, shoulderY + 0.55); p.lineTo(cx, shoulderY + 0.35); p.closePath(); }), cor, { sombra: 0, espessura: pc.interno });
        }
      } else if (tipoTop === 'cardiga') {
        // blusa por dentro, em V, e o cardigã aberto
        const v = P((p) => {
          p.moveTo(cx - 0.17, neckY); p.lineTo(cx - 0.06, hemY - 0.02); p.lineTo(cx + 0.06, hemY - 0.02); p.lineTo(cx + 0.17, neckY);
          p.quadraticCurveTo(cx, neckY + 0.1, cx - 0.17, neckY); p.closePath();
        });
        pc.peca(v, COR.interna, { sombra: 0.04, espessura: pc.interno });
        pc.linha(P((p) => { p.moveTo(cx - 0.17, neckY); p.lineTo(cx - 0.06, hemY - 0.02); p.moveTo(cx + 0.17, neckY); p.lineTo(cx + 0.06, hemY - 0.02); }), pc.contorno);
        for (let i = 0; i < 4; i++) {
          const by = neckY + 0.45 + i * ((hemY - neckY - 0.6) / 3);
          pc.peca(P((p) => p.arc(cx + 0.13, by, 0.028, 0, Math.PI * 2)), T('linho'), { sombra: 0, espessura: pc.interno * 0.8 });
        }
        pc.linha(P((p) => { p.moveTo(-hw * k + 0.08, hemY - 0.2); p.lineTo(-hw * k + 0.4, hemY - 0.2); p.moveTo(hw * k - 0.08, hemY - 0.2); p.lineTo(hw * k - 0.32, hemY - 0.2); }));
      } else {
        // moletom: bolso, capuz e cordões
        pc.linha(P((p) => { p.moveTo(cx - 0.4, hemY - 0.22); p.quadraticCurveTo(cx - 0.42, hemY - 0.45, cx - 0.27, hemY - 0.7); p.lineTo(cx + 0.27, hemY - 0.7); p.quadraticCurveTo(cx + 0.42, hemY - 0.45, cx + 0.4, hemY - 0.22); }));
      }
    }

    // ---------- braços ----------
    function braco(pc) {
      const w = 0.36 * largMembro;
      if (tipoTop === 'camiseta') {
        const braco = capsula(0.27, 0.26, 0, Lbraco);
        pc.peca(braco, COR.manga || COR.pele, { sombra: 0.08 });
        const manga = P((p) => { p.moveTo(-0.21, -0.15); p.arc(0, -0.02, 0.21, Math.PI * 1.1, -0.1); p.lineTo(0.22, Lbraco * 0.5); p.lineTo(-0.22, Lbraco * 0.5); p.closePath(); });
        pc.peca(manga, COR.top, { sombra: 0.08 });
        return;
      }
      const manga = capsula(w, w - 0.01, 0, Lbraco);
      pc.peca(manga, COR.top, { sombra: 0.1 });
      if (COR.faixa) pc.sombraDentro(manga, P((p) => p.rect(0.07, -0.2, 0.06, Lbraco + 0.4)), COR.faixa.base);
      pc.linha(P((p) => { p.moveTo(-w * 0.44, Lbraco - 0.14); p.quadraticCurveTo(-w * 0.22, Lbraco - 0.1, -0.04, Lbraco - 0.16); }));
    }
    function antebraco(pc) {
      if (tipoTop === 'camiseta') {
        const cor = COR.manga || COR.pele;
        pc.peca(capsula(0.26, 0.22, 0, Lante - 0.05), cor, { sombra: 0.08 });
        if (COR.manga) pc.peca(P((p) => p.roundRect(-0.12, Lante - 0.16, 0.24, 0.15, 0.05)), cor, { sombra: 0.04 });
        return;
      }
      const w = 0.35 * largMembro;
      pc.peca(P((p) => p.roundRect(-0.135 * largMembro, Lante - 0.19, 0.27 * largMembro, 0.2, 0.05)), COR.top, { sombra: 0.05 });
      const manga = capsula(w, w + 0.02, 0, Lante - 0.24);
      pc.peca(manga, COR.top, { sombra: 0.1 });
      if (COR.faixa) pc.sombraDentro(manga, P((p) => p.rect(0.07, -0.2, 0.06, Lante)), COR.faixa.base);
    }
    function maoForma(pc, forma) {
      const pele = COR.pele;
      if (forma === 'apontando') {
        pc.peca(capsula(0.075, 0.07, 0.15, 0.4), pele, { sombra: 0.02 });
        pc.peca(P((p) => p.roundRect(-0.11, -0.04, 0.22, 0.24, 0.08)), pele, { sombra: 0.05 });
        return;
      }
      if (forma === 'punho') { pc.peca(P((p) => p.roundRect(-0.12, -0.04, 0.24, 0.27, 0.09)), pele, { sombra: 0.05 }); return; }
      pc.peca(P((p) => {
        p.moveTo(-0.1, -0.04); p.lineTo(0.1, -0.04); p.quadraticCurveTo(0.14, 0.16, 0.11, 0.3);
        p.quadraticCurveTo(0.06, 0.42, -0.03, 0.39); p.quadraticCurveTo(-0.11, 0.36, -0.11, 0.24); p.closePath();
      }), pele, { sombra: 0.06 });
      pc.peca(P((p) => { p.moveTo(-0.08, 0.05); p.quadraticCurveTo(-0.17, 0.12, -0.15, 0.22); p.quadraticCurveTo(-0.12, 0.28, -0.07, 0.22); p.closePath(); }), pele, { sombra: 0.03 });
      pc.linha(P((p) => { p.moveTo(0.0, 0.3); p.lineTo(0.01, 0.36); p.moveTo(0.06, 0.28); p.lineTo(0.065, 0.34); }));
    }
    const mao = (l) => (pc, rig) => maoForma(pc, ((rig.pose._maos || {})[l]) || 'relaxada');

    // ---------- cabeça ----------
    const r = c.cabecaLargura / 2, sx = r / 0.48;
    const cab = CABELOS[c.cabelo.estilo];
    const proj = (x, rr = r) => { const fi = Math.asin(clamp(x / rr, -1, 1)); const a = fi + th; return { x: rr * Math.sin(a), k: Math.cos(a) }; };
    const vol = (pts) => pts.map(([x, y], i, arr) => (i === 0 || i === arr.length - 1) ? [x, y] : [x * c.cabelo.volume, -0.5 + (y + 0.5) * c.cabelo.volume]);
    const orelhaX = vista === 'tq' ? -r * 0.7 : vista === 'perfil' ? -0.05 : null;

    function rostoPath() {
      return P((p) => {
        p.moveTo(-r, -0.47); p.arc(0, -0.47, r, Math.PI, 0);
        if (vista === 'frente') { p.bezierCurveTo(r, -0.12, r * 0.54, 0.05, 0, 0.05); p.bezierCurveTo(-r * 0.54, 0.05, -r, -0.12, -r, -0.47); }
        else if (vista === 'tq') { p.bezierCurveTo(r, -0.2, r * 0.72, 0.02, 0.17, 0.05); p.bezierCurveTo(-0.04, 0.07, -0.3, -0.04, -r * 0.94, -0.26); p.quadraticCurveTo(-r, -0.36, -r, -0.47); }
        else if (vista === 'perfil') {
          p.lineTo(r * 0.99, -0.5); p.quadraticCurveTo(r + 0.02, -0.44, r, -0.38);
          p.quadraticCurveTo(r + 0.06, -0.3, r + 0.05, -0.25); p.quadraticCurveTo(r + 0.03, -0.21, r - 0.01, -0.2);
          p.quadraticCurveTo(r + 0.01, -0.15, r - 0.02, -0.12); p.quadraticCurveTo(r - 0.04, -0.1, r - 0.02, -0.07);
          p.quadraticCurveTo(r - 0.02, 0.0, r - 0.1, 0.03); p.quadraticCurveTo(r - 0.24, 0.07, -0.02, 0.0);
          p.quadraticCurveTo(-0.3, -0.04, -r * 0.92, -0.25); p.quadraticCurveTo(-r, -0.36, -r, -0.47);
        } else { p.bezierCurveTo(r, -0.2, r * 0.6, -0.02, 0, -0.01); p.bezierCurveTo(-r * 0.6, -0.02, -r, -0.2, -r, -0.47); }
        p.closePath();
      });
    }
    function orelha(pc, x, s) {
      pc.peca(P((p) => p.ellipse(x, -0.35, 0.07, 0.105, 0, 0, Math.PI * 2)), COR.pele, { sombra: 0.04 });
      pc.linha(P((p) => { p.moveTo(x, -0.42); p.quadraticCurveTo(x + 0.03 * s, -0.35, x - 0.01 * s, -0.29); }));
      if (c.acessorios.brincos) pc.peca(P((p) => p.arc(x, -0.22, 0.03, 0, Math.PI * 2)), T(c.acessorios.brincos), { sombra: 0, espessura: pc.interno });
    }
    function olho(pc, e, s) {
      const ctx = pc.ctx, R = c.olhos.raio;
      const pr = proj(c.olhos.sep * sx * s, r * 0.92);
      if (pr.k < 0.22) return;
      const kx = Math.max(pr.k, 0.5), x = pr.x, cy = -0.37;
      let [ox, oy] = e.olhar || [0, 0]; ox += R * 0.35 * sinT;
      if (e.fechado === 'sorriso') { pc.linha(P((p) => { p.moveTo(x - R * 0.95 * kx, cy + R * 0.25); p.quadraticCurveTo(x, cy - R * 1.2, x + R * 0.95 * kx, cy + R * 0.25); }), pc.contorno * 1.3); return; }
      if (e.fechado === 'apertado') { pc.linha(P((p) => { p.moveTo(x - R * 0.9 * kx, cy - R * 0.35); p.lineTo(x + R * 0.5 * kx, cy); p.lineTo(x - R * 0.9 * kx, cy + R * 0.35); }), pc.contorno * 1.2); return; }
      const area = P((p) => p.ellipse(x + ox * kx, cy + oy, R * 0.72 * kx, R, 0, 0, Math.PI * 2));
      ctx.save();
      pc.preencher(area, COR.iris); ctx.clip(area);
      pc.preencher(P((p) => p.ellipse(x + ox * kx, cy + oy - R * 0.45, R * 0.9, R * 0.55, 0, 0, Math.PI * 2)), Estilo.multiply(COR.iris, '#7A6A80'));
      const pu = e.pupila || 1;
      pc.preencher(P((p) => p.ellipse(x + ox * kx, cy + oy + R * 0.05, R * 0.34 * pu * kx, R * 0.5 * pu, 0, 0, Math.PI * 2)), Estilo.pupila);
      pc.preencher(P((p) => p.arc(x + ox * kx - R * 0.25 * kx, cy + oy - R * 0.32, R * 0.24, 0, Math.PI * 2)), Estilo.brilhoOlho);
      const pal = e.palpebra || 0, topo = cy - R, yP = topo + 2 * R * pal, inc = (e.palpebraInclina || 0) * R * s;
      const borda = (p) => { p.moveTo(x - R * kx, yP + R * 0.18 - inc); p.quadraticCurveTo(x, yP - R * 0.28, x + R * kx, yP + R * 0.18 + inc); };
      if (pal > 0) pc.preencher(P((p) => { borda(p); p.lineTo(x + R * 1.3, topo - 0.03); p.lineTo(x - R * 1.3, topo - 0.03); p.closePath(); }), COR.pele.base);
      ctx.restore();
      if (pal > 0.02) pc.linha(P(borda), pc.contorno * 1.25);
      else pc.linha(P((p) => p.ellipse(x, cy, R * 0.95 * kx, R * 1.15, 0, Math.PI * 1.15, Math.PI * 1.85)), pc.contorno * 1.3);
      if (c.olhos.cilios && pal < 0.4) {
        const xo = x + R * 0.9 * kx * s, yo = cy - R * 0.55;
        pc.linha(P((p) => { p.moveTo(xo, yo); p.lineTo(xo + 0.04 * s * kx, yo - 0.035); }), pc.contorno);
      }
      if (e.olheira) pc.linha(P((p) => { p.moveTo(x - R * 0.7 * kx, cy + R * 1.35); p.quadraticCurveTo(x, cy + R * 1.6, x + R * 0.7 * kx, cy + R * 1.35); }), pc.interno, COR.pele.sombra);
    }
    function oculos(pc) {
      if (!c.acessorios.oculos) return;
      const R = 0.115;
      const aros = [];
      for (const s of [-1, 1]) {
        const pr = proj(c.olhos.sep * sx * s, r * 0.95);
        if (pr.k < 0.15) continue;
        aros.push([pr.x, Math.max(pr.k, 0.35)]);
      }
      for (const [x, k] of aros) {
        const aro = P((p) => p.ellipse(x, -0.36, R * k, R * 0.9, 0, 0, Math.PI * 2));
        pc.preencher(aro, 'rgba(207,234,245,0.35)');
        pc.preencher(P((p) => { p.moveTo(x - R * 0.5 * k, -0.4); p.lineTo(x - R * 0.1 * k, -0.45); p.lineTo(x + R * 0.3 * k, -0.3); p.lineTo(x - R * 0.1 * k, -0.27); p.closePath(); }), 'rgba(255,255,255,0.55)');
        pc.linha(aro, pc.contorno * 0.9);
      }
      if (aros.length === 2) pc.linha(P((p) => { p.moveTo(aros[0][0] + R * aros[0][1], -0.37); p.quadraticCurveTo((aros[0][0] + aros[1][0]) / 2, -0.41, aros[1][0] - R * aros[1][1], -0.37); }), pc.contorno * 0.8);
      if (orelhaX !== null && aros.length) pc.linha(P((p) => { p.moveTo(aros[0][0] - R * aros[0][1], -0.38); p.lineTo(orelhaX + 0.04, -0.4); }), pc.contorno * 0.8);
    }
    function sobrancelha(pc, e, s) {
      const ctx = pc.ctx, pr = proj(0.2 * sx * s, r * 0.95);
      if (pr.k < 0.22) return;
      const sb = e.sobrancelha || { y: 0, ang: 0 }, t = c.sobrancelha.esp;
      ctx.save(); ctx.translate(pr.x, -0.505 + sb.y); ctx.scale(Math.max(pr.k, 0.45), 1); ctx.rotate((sb.ang * s * Math.PI) / 180);
      const i = -0.1 * s, o = 0.11 * s;
      pc.preencher(P((p) => {
        if (c.sobrancelha.tipo === 'reta') { p.moveTo(i, -t * 0.5); p.quadraticCurveTo(0, -t * 0.8, o, -t * 0.3); p.quadraticCurveTo(o * 1.1, 0, o * 0.92, t * 0.22); p.quadraticCurveTo(0, 0, i, t * 0.48); p.closePath(); return; }
        p.moveTo(i, -t * 0.3); p.quadraticCurveTo(0, -t * 1.6, o, -t * 0.1); p.quadraticCurveTo(o * 1.05, t * 0.25, o * 0.9, t * 0.3);
        p.quadraticCurveTo(0, -t * 0.6, i, t * 0.55); p.closePath();
      }), Estilo.multiply(COR.cabelo.base, '#D8D0E0'));
      ctx.restore();
    }
    function boca(pc, e) {
      const ctx = pc.ctx, b = e.boca || { tipo: 'linha', curva: 0.3 };
      const bx = vista === 'tq' ? 0.19 : vista === 'perfil' ? r - 0.07 : 0, kw = vista === 'tq' ? 0.8 : vista === 'perfil' ? 0.45 : 1;
      const w = (b.largura || 0.06) * kw, yb = -0.11;
      ctx.save(); ctx.translate(bx, 0);
      if (b.tipo === 'aberta' || b.tipo === 'grito') {
        const ab = b.abertura || 0.05;
        const forma = P((p) => {
          if (b.tipo === 'grito') { p.moveTo(-w, yb + 0.02); p.quadraticCurveTo(0, yb - 0.03, w, yb + 0.02); p.quadraticCurveTo(w * 0.8, yb + ab * 1.9, 0, yb + ab * 1.9); p.quadraticCurveTo(-w * 0.8, yb + ab * 1.9, -w, yb + 0.02); }
          else { p.moveTo(-w, yb); p.quadraticCurveTo(0, yb + 0.03 * (b.curva || 0) - 0.01, w, yb); p.quadraticCurveTo(0, yb + ab * 2 + 0.03 * (b.curva || 0), -w, yb); }
          p.closePath();
        });
        pc.preencher(forma, Estilo.base.tinta);
        ctx.save(); ctx.clip(forma); pc.preencher(P((p) => p.ellipse(0, yb + ab * 1.6, w * 0.6, ab * 0.7, 0, 0, Math.PI * 2)), T('brasa').sombra); ctx.restore();
        pc.linha(forma, pc.interno);
      } else {
        const cv = b.curva || 0;
        pc.linha(P((p) => { p.moveTo(-w, yb - 0.008 * cv); p.quadraticCurveTo(0, yb + 0.03 * cv, w, yb - 0.008 * cv); }), pc.interno * 1.2);
      }
      ctx.restore();
    }
    function franjaVista() {
      const pts = cab.borda.map(([x, y]) => [x * sx, y]);
      if (vista === 'frente') return pts;
      return pts.map(([x, y]) => { const pr = proj(x); return [pr.k < 0 ? r * 0.99 : pr.x, y]; });
    }
    function cabeloPath(dy = 0) {
      return P((p) => {
        if (vista === 'costas') {
          if (dy) return;
          zigue(p, cab.nuca.map(([x, y]) => [x * sx, y]), 0, cab.suave);
          cunhas(p, vol(cab.topo).map(([x, y]) => [x * sx, y]).reverse(), cab.estufa);
          p.closePath(); return;
        }
        const fr = franjaVista();
        zigue(p, fr, dy, cab.suave);
        if (dy) { p.lineTo(-0.8, -1.3); p.lineTo(0.8, -1.3); p.closePath(); return; }
        if (vista === 'frente') { cunhas(p, vol(cab.topo).map(([x, y]) => [x * sx, y]), cab.estufa); p.closePath(); return; }
        const ex = orelhaX, fim = fr[fr.length - 1];
        const alto = cab.coque ? -0.12 : 0; // cabelo preso: nuca mais alta
        const nuca = vista === 'perfil'
          ? [[ex + 0.09, -0.4], [ex + 0.08, -0.5], [ex - 0.01, -0.56], [ex - 0.1, -0.5], [ex - 0.12, -0.36 + alto / 2],
            [-0.3, -0.18 + alto], [-0.42, -0.16 + alto], [-r - 0.03, -0.3 + alto / 2]]
          : [[ex + 0.09, -0.4], [ex + 0.08, -0.5], [ex - 0.01, -0.56], [ex - 0.09, -0.48], [ex - 0.1, -0.34], [-r + 0.02, -0.18 + alto], [-r - 0.04, -0.3]];
        let prev = fim;
        for (const [x, y] of nuca) { p.quadraticCurveTo((prev[0] + x) / 2, (prev[1] + y) / 2, x, y); prev = [x, y]; }
        const recuo = 0.06 * sinT;
        const topo = vol(cab.topo).map(([x, y]) => [x * sx - recuo, y]).filter(([x, y], i, arr) => i > 0 && i < arr.length - 1 && !(x > r * 0.55 && y > -0.68));
        cunhas(p, [prev, ...topo, [fr[0][0] + 0.02, fr[0][1] - 0.18], fr[0]], cab.estufa);
        p.closePath();
      });
    }
    function coque(pc) {
      if (!cab.coque) return;
      const bx = vista === 'frente' ? 0 : vista === 'costas' ? 0 : -0.22 * sinT - 0.02;
      const by = vista === 'frente' ? -1.1 : vista === 'costas' ? -1.02 : -1.02;
      const forma = P((p) => p.ellipse(bx, by, 0.2, 0.17, 0, 0, Math.PI * 2));
      pc.peca(forma, COR.cabelo, { sombra: 0.05 });
      pc.linha(P((p) => { p.moveTo(bx - 0.12, by - 0.02); p.quadraticCurveTo(bx, by - 0.14, bx + 0.12, by - 0.02); p.moveTo(bx - 0.08, by + 0.06); p.quadraticCurveTo(bx + 0.04, by - 0.05, bx + 0.13, by + 0.05); }));
      pc.peca(P((p) => p.roundRect(bx - 0.13, by + 0.1, 0.26, 0.06, 0.03)), T(c.cabelo.prendedor || 'mostarda'), { sombra: 0, espessura: pc.interno });
    }
    function cabeca(pc, rig) {
      const e = rig.expressao, rosto = rostoPath();
      if (vista === 'costas' || vista === 'frente') coque(pc); // coque atrás da cabeça
      if (vista === 'frente' || vista === 'costas') for (const s of [-1, 1]) orelha(pc, (r - 0.01) * s, s);
      if (lado) coque(pc);
      pc.peca(rosto, COR.pele, { sombra: 0.07 });
      if (vista !== 'costas') {
        pc.sombraDentro(rosto, cabeloPath(0.06), COR.pele.sombra);
        for (const s of [-1, 1]) { const pr = proj(0.29 * sx * s, r * 0.9); if (pr.k > 0.3) pc.preencher(P((p) => p.ellipse(pr.x, -0.24, 0.065 * Math.max(pr.k, 0.5), 0.03, 0, 0, Math.PI * 2)), Estilo.blush); }
        for (const s of [-1, 1]) olho(pc, e, s);
        for (const s of [-1, 1]) sobrancelha(pc, e, s);
        if (vista === 'frente') pc.linha(P((p) => { p.moveTo(-0.01, -0.21); p.quadraticCurveTo(0.035, -0.205, 0.025, -0.235); }), pc.interno, COR.pele.sombra);
        else if (vista === 'tq') pc.linha(P((p) => { p.moveTo(0.29, -0.3); p.quadraticCurveTo(0.35, -0.22, 0.29, -0.21); }), pc.interno, COR.pele.sombra);
        boca(pc, e);
      }
      const forma = cabeloPath();
      pc.peca(forma, COR.cabelo, { sombra: 0.06 });
      const bx = -0.08 * sinT;
      pc.preencher(P((p) => { p.moveTo(-0.36 * sx + bx, -0.9); p.quadraticCurveTo(-0.18 * sx + bx, -1.0, 0.02 * sx + bx, -0.97); p.quadraticCurveTo(-0.16 * sx + bx, -0.94, -0.33 * sx + bx, -0.85); p.closePath(); }), COR.cabelo.luz);
      pc.ctx.save(); pc.ctx.clip(forma);
      pc.linha(P((p) => {
        if (vista === 'costas') {
          if (cab.coque) { for (const x of [-0.3, 0.3]) { p.moveTo(x, -0.28); p.quadraticCurveTo(x * 0.9, -0.6, x * 0.35, -0.82); } p.moveTo(0, -0.24); p.quadraticCurveTo(0.03, -0.5, 0, -0.78); return; }
          p.moveTo(-0.22, -0.3); p.quadraticCurveTo(-0.26, -0.5, -0.16, -0.66);
          p.moveTo(0.18, -0.26); p.quadraticCurveTo(0.24, -0.46, 0.16, -0.62);
          p.moveTo(0.02, -0.82); p.quadraticCurveTo(0.12, -0.9, 0.05, -0.97);
          return;
        }
        for (const l of cab.linhas) { const m = l.map(([x, y]) => [vista === 'frente' ? x * sx : proj(x * sx).x, y]); p.moveTo(m[0][0], m[0][1]); p.quadraticCurveTo(m[1][0], m[1][1], m[2][0], m[2][1]); }
      }));
      pc.ctx.restore();
      if (vista !== 'costas') oculos(pc);
      if (orelhaX !== null) orelha(pc, orelhaX, 1);
      if (e.gota && vista !== 'costas') {
        const gx = vista === 'frente' ? 0.4 * sx : -0.1, gy = -0.62;
        pc.peca(P((p) => { p.moveTo(gx, gy - 0.1); p.quadraticCurveTo(gx + 0.06, gy - 0.01, gx + 0.045, gy + 0.03); p.arc(gx, gy + 0.03, 0.045, 0, Math.PI); p.quadraticCurveTo(gx - 0.06, gy - 0.01, gx, gy - 0.1); p.closePath(); }), { base: '#D6ECFF', sombra: '#A9C8EE' }, { sombra: 0.02, espessura: pc.interno * 1.2 });
      }
    }

    // ---------- montagem ----------
    const zFrente = { quadril: 0.5, pe_d: 0.8, pe_e: 0.8, coxa_d: 1, canela_d: 1.05, coxa_e: 1.1, canela_e: 1.15,
      capuz: 4, pescoco: 5, tronco: 6, braco_d: 7, antebraco_d: 7.1, braco_e: 7.2, antebraco_e: 7.3, mao_d: 9, mao_e: 9, cabeca: 10 };
    const zLado = { braco_e: 0.2, antebraco_e: 0.25, mao_e: 0.3, pe_e: 0.5, coxa_e: 0.6, canela_e: 0.65, quadril: 0.9,
      pe_d: 1.0, coxa_d: 1.1, canela_d: 1.15, capuz: 4, pescoco: 5, tronco: 6, braco_d: 7, antebraco_d: 7.1, mao_d: 9, cabeca: 10 };
    const z = lado ? zLado : zFrente;
    const bx = bracoX * cosT, qx = quadrilX * cosT;
    const espMao = { frente: [-1, 1], costas: [1, -1], tq: [-1, -1], perfil: [-1, -1] }[vista];
    const espBraco = vista === 'costas' ? [1, -1] : [-1, 1];
    return {
      nome: c.nome, vista, opcoes: c, alturaEmH: A,
      larguraOmbrosH: vista === 'perfil' ? 0.95 : fit.sw * 2 + 0.2,
      fatorContorno: c.fatorContorno,
      partes: [
        { nome: 'quadril', pai: null, pivo: [0, yQuadril], z: z.quadril, desenhar: quadril },
        { nome: 'pe_d', pai: 'canela_d', pivo: [0, Lcanela], z: z.pe_d, espelho: vista === 'frente' ? -1 : 1, desenhar: pe },
        { nome: 'pe_e', pai: 'canela_e', pivo: [0, Lcanela], z: z.pe_e, desenhar: pe },
        { nome: 'coxa_d', pai: 'quadril', pivo: [-qx, 0.05 * f], z: z.coxa_d, grupo: 'perna_d', espelho: -1, desenhar: coxa },
        { nome: 'canela_d', pai: 'coxa_d', pivo: [0, Lcoxa], z: z.canela_d, grupo: 'perna_d', espelho: -1, desenhar: canela },
        { nome: 'coxa_e', pai: 'quadril', pivo: [qx, 0.05 * f], z: z.coxa_e, grupo: 'perna_e', desenhar: coxa },
        { nome: 'canela_e', pai: 'coxa_e', pivo: [0, Lcoxa], z: z.canela_e, grupo: 'perna_e', desenhar: canela },
        { nome: 'capuz', pai: 'tronco', pivo: [0, ombroL + 0.1], z: z.capuz, desenhar: capuzAtras },
        { nome: 'pescoco', pai: 'tronco', pivo: [pescocoX, ombroL - 0.02], z: z.pescoco, desenhar: pescoco },
        { nome: 'tronco', pai: 'quadril', pivo: [0, -0.15 * f], z: z.tronco, desenhar: tronco },
        { nome: 'braco_d', pai: 'tronco', pivo: [-bx, ombroL + 0.18], z: z.braco_d, grupo: 'braco_d', espelho: espBraco[0], desenhar: braco },
        { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, Lbraco], z: z.antebraco_d, grupo: 'braco_d', espelho: espBraco[0], desenhar: antebraco },
        { nome: 'braco_e', pai: 'tronco', pivo: [bx, ombroL + 0.18], z: z.braco_e, grupo: 'braco_e', espelho: espBraco[1], desenhar: braco },
        { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, Lbraco], z: z.antebraco_e, grupo: 'braco_e', espelho: espBraco[1], desenhar: antebraco },
        { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, Lante], z: z.mao_d, espelho: espMao[0], desenhar: mao('d') },
        { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, Lante], z: z.mao_e, espelho: espMao[1], desenhar: mao('e') },
        { nome: 'cabeca', pai: 'pescoco', pivo: [0, -0.23], z: z.cabeca, desenhar: cabeca },
      ],
      poses: cfg.poses || {},
      expressoes: cfg.expressoes || window.EXPRESSOES_PADRAO,
    };
  };

  // Expressões padrão (mesmo vocabulário do Lucas)
  window.EXPRESSOES_PADRAO = {
    neutro: { olhar: [0, 0], palpebra: 0, pupila: 1, sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.35 } },
    feliz: { fechado: 'sorriso', sobrancelha: { y: -0.03, ang: 5 }, boca: { tipo: 'aberta', curva: 1.4, abertura: 0.06, largura: 0.09 } },
    espanto: { olhar: [0, 0], palpebra: 0, pupila: 0.5, sobrancelha: { y: -0.08, ang: 4 }, boca: { tipo: 'aberta', curva: -0.6, abertura: 0.075, largura: 0.05 } },
    medo: { olhar: [0, 0.004], palpebra: 0, pupila: 0.6, sobrancelha: { y: -0.045, ang: 18 }, boca: { tipo: 'aberta', curva: -0.8, abertura: 0.035, largura: 0.055 }, gota: true },
    raiva: { olhar: [0, 0], palpebra: 0.28, palpebraInclina: -0.45, pupila: 0.8, sobrancelha: { y: 0.04, ang: -26 }, boca: { tipo: 'grito', abertura: 0.045, largura: 0.085 } },
    determinado: { olhar: [0, 0], palpebra: 0.3, palpebraInclina: -0.25, pupila: 1, sobrancelha: { y: 0.025, ang: -18 }, boca: { tipo: 'linha', curva: -0.1, largura: 0.07 } },
    cansado: { olhar: [0, 0.014], palpebra: 0.52, palpebraInclina: 0.2, pupila: 1, sobrancelha: { y: 0, ang: 10 }, boca: { tipo: 'aberta', curva: -0.3, abertura: 0.018, largura: 0.045 }, olheira: true },
    rindo: { fechado: 'apertado', sobrancelha: { y: -0.04, ang: 8 }, boca: { tipo: 'aberta', curva: 1.8, abertura: 0.085, largura: 0.11 } },
    preocupado: { olhar: [0, 0.006], palpebra: 0.1, pupila: 1, sobrancelha: { y: -0.02, ang: 16 }, boca: { tipo: 'linha', curva: -0.5, largura: 0.06 } },
  };

  // Poses padrão (ângulos genéricos)
  window.POSES_PADRAO = {
    parado: { vista: 'frente', expressao: 'neutro', angulos: { braco_d: 6, antebraco_d: -3, braco_e: -6, antebraco_e: 3, coxa_d: 1.5, canela_d: -1.5, coxa_e: -1.5, canela_e: 1.5 } },
    tq: { vista: 'tq', expressao: 'neutro', angulos: { braco_d: 5, braco_e: -4, coxa_d: -3, coxa_e: 3 } },
    perfil: { vista: 'perfil', expressao: 'neutro', angulos: {} },
    costas: { vista: 'costas', expressao: 'neutro', angulos: { braco_d: -6, braco_e: 6 } },
    andando: { vista: 'perfil', expressao: 'neutro', angulos: { tronco: 3, cabeca: -3, coxa_d: -24, canela_d: 10, pe_d: 12, coxa_e: 20, canela_e: 24, pe_e: -30, braco_d: 22, antebraco_d: -14, braco_e: -24, antebraco_e: -20, _desloca: [0, -0.04] } },
    acenando: { vista: 'frente', expressao: 'feliz', angulos: { braco_d: 150, antebraco_d: 25, mao_d: 10, braco_e: -6, antebraco_e: 3, cabeca: -4, coxa_d: 1.5, coxa_e: -1.5 } },
    'maos-na-cintura': { vista: 'frente', expressao: 'serio', angulos: { braco_d: 40, antebraco_d: -110, mao_d: -40, braco_e: -40, antebraco_e: 110, mao_e: 40, coxa_d: 3, coxa_e: -3, _maos: { d: 'punho', e: 'punho' } } },
  };
  window.EXPRESSOES_PADRAO.serio = { olhar: [0, 0], palpebra: 0.22, pupila: 1, sobrancelha: { y: 0.025, ang: -6 }, boca: { tipo: 'linha', curva: -0.2, largura: 0.07 } };
})();

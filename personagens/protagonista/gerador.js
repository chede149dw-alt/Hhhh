// Gerador de variações do protagonista (vista de frente).
// criarProtagonista(opcoes) devolve uma definição pronta para o Rig (motor/rig.js).
// Briefing fixo: moletom Marinho com capuz, cabelo escuro curto com franja, pele morena,
// olhos pequenos e redondos, sobrancelhas grossas, boca simples. O resto varia.
//
// Unidades: H = altura da cabeça. y cresce para baixo. "_d" = lado direito do personagem (esquerda da tela).
(function () {
  const T = (n) => Estilo.tom(n);
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };

  const capsula = (wTop, wBot, y0, y1) => P((p) => {
    p.moveTo(-wTop / 2, y0);
    p.arc(0, y0, wTop / 2, Math.PI, 0);
    p.lineTo(wBot / 2, y1);
    p.arc(0, y1, wBot / 2, 0, Math.PI);
    p.closePath();
  });

  // borda dentada (franja): pontas e vales suavizados
  function zigue(p, pts, dy = 0, sx = 1, primeiro = true) {
    if (primeiro) p.moveTo(pts[0][0] * sx, pts[0][1] + dy); else p.lineTo(pts[0][0] * sx, pts[0][1] + dy);
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i]; const [px, py] = pts[i - 1];
      p.quadraticCurveTo(((px + x) / 2 + 0.01) * sx, Math.max(py, y) + dy, x * sx, y + dy);
    }
  }
  // silhueta em cunhas: curvas levemente estufadas para fora do centro da cabeça, pontas afiadas
  function cunhas(p, pts, sx = 1, centro = [0, -0.5]) {
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i]; const [px, py] = pts[i - 1];
      const mx = (px + x) / 2, my = (py + y) / 2;
      const cx = mx + (mx - centro[0]) * 0.12, cy = my + (my - centro[1]) * 0.12;
      p.quadraticCurveTo(cx * sx, cy, x * sx, y);
    }
  }

  // ---------- estilos de cabelo (todos curtos, escuros, com franja) ----------
  const CABELOS = {
    pontas: {
      borda: [[0.47, -0.4], [0.4, -0.66], [0.31, -0.58], [0.22, -0.7], [0.1, -0.59], [0.0, -0.72], [-0.12, -0.6],
        [-0.22, -0.71], [-0.32, -0.6], [-0.41, -0.68], [-0.47, -0.4]],
      topo: [[-0.47, -0.4], [-0.55, -0.64], [-0.52, -0.86], [-0.33, -1.03], [0.04, -1.08], [0.1, -1.17], [0.17, -1.07],
        [0.44, -1.0], [0.55, -0.76], [0.54, -0.55], [0.47, -0.4]],
      linhas: [[[-0.22, -0.71], [-0.2, -0.85], [-0.1, -0.95]], [[0.22, -0.7], [0.26, -0.84], [0.36, -0.92]]],
    },
    baguncado: {
      borda: [[0.48, -0.38], [0.43, -0.63], [0.36, -0.52], [0.27, -0.69], [0.16, -0.55], [0.06, -0.71], [-0.04, -0.51],
        [-0.14, -0.69], [-0.25, -0.47], [-0.3, -0.67], [-0.4, -0.55], [-0.44, -0.66], [-0.49, -0.38]],
      topo: [[-0.49, -0.38], [-0.6, -0.5], [-0.54, -0.6], [-0.63, -0.78], [-0.51, -0.85], [-0.53, -1.01], [-0.35, -0.99],
        [-0.3, -1.15], [-0.13, -1.05], [-0.02, -1.21], [0.09, -1.07], [0.25, -1.17], [0.29, -1.03], [0.47, -1.03],
        [0.45, -0.89], [0.62, -0.81], [0.54, -0.67], [0.61, -0.52], [0.48, -0.38]],
      linhas: [[[-0.14, -0.69], [-0.12, -0.84], [-0.02, -0.97]], [[0.16, -0.55], [0.2, -0.75], [0.3, -0.9]],
        [[-0.3, -0.67], [-0.36, -0.8], [-0.34, -0.93]]],
    },
    lateral: {
      borda: [[0.48, -0.4], [0.47, -0.62], [0.36, -0.73], [0.3, -0.63], [0.18, -0.75], [0.05, -0.64], [-0.1, -0.67],
        [-0.22, -0.56], [-0.33, -0.59], [-0.39, -0.44], [-0.44, -0.57], [-0.49, -0.38]],
      topo: [[-0.49, -0.38], [-0.56, -0.62], [-0.51, -0.87], [-0.34, -1.03], [-0.08, -1.1], [0.16, -1.07], [0.23, -1.17],
        [0.3, -1.05], [0.46, -0.97], [0.56, -0.75], [0.55, -0.55], [0.48, -0.4]],
      linhas: [[[0.24, -1.04], [0.28, -0.9], [0.26, -0.76]], [[0.05, -0.64], [-0.08, -0.82], [-0.06, -0.98]]],
    },
    reto: {
      borda: [[0.48, -0.4], [0.46, -0.6], [0.34, -0.635], [0.3, -0.58], [0.24, -0.645], [0.08, -0.645], [0.03, -0.59],
        [-0.02, -0.65], [-0.2, -0.65], [-0.25, -0.585], [-0.3, -0.645], [-0.46, -0.6], [-0.49, -0.4]],
      topo: [[-0.49, -0.4], [-0.56, -0.62], [-0.53, -0.87], [-0.36, -1.03], [0, -1.1], [0.36, -1.03], [0.53, -0.87],
        [0.56, -0.62], [0.48, -0.4]],
      linhas: [[[0.03, -0.59], [0.02, -0.8], [0.08, -0.98]], [[-0.25, -0.585], [-0.28, -0.78], [-0.22, -0.95]]],
    },
  };

  const PADRAO = {
    altura: 5.5,              // em cabeças
    cabecaLargura: 0.96,      // briefing: redonda e grande
    queixo: 'redondo',        // 'redondo' | 'quadrado'
    olhos: 'esclera',         // 'esclera' | 'ponto' | 'oval'
    olhoRaio: 0.068,
    olhoSep: 0.19,
    sobrancelha: 'reta',      // 'reta' | 'arqueada' | 'angular'
    sobrancelhaEsp: 0.06,
    cabelo: 'pontas',
    corCabelo: 'cabNoite',
    cabeloVolume: 1,          // 1 = normal; 1.1 = 10% mais volume
    pele: 'pele3',
    moletom: 'largo',         // 'largo' | 'reto' | 'curto'
    faixaManga: null,         // cor de acento na manga
    emblema: null,            // { forma: 'circulo'|'triangulo'|'raio', cor }
    corCordao: 'linho',
    calca: 'reta',            // 'reta' | 'larga' | 'jogger' | 'cargo'
    corCalca: 'grafite',
    tenis: 'baixo',           // 'baixo' | 'cano-alto'
    corTenis: 'linho',
    acentoTenis: 'pedra',
    fatorContorno: 1,
    iris: 'irisCastanho',
  };

  window.criarProtagonista = function (opcoes = {}) {
    const c = { ...PADRAO, ...opcoes };
    const COR = {
      pele: T(c.pele), cabelo: T(c.corCabelo), moletom: T('marinho'), calca: T(c.corCalca),
      tenis: T(c.corTenis), acentoTenis: T(c.acentoTenis), cordao: T(c.corCordao), detalhe: T('pedra'),
      faixa: c.faixaManga ? T(c.faixaManga) : null, iris: Estilo.base[c.iris],
    };

    // ---------- marcos verticais (seção 3 do guia, escalados pela altura) ----------
    const A = c.altura;
    const f = (A - 1) / 4.5;
    const Y = (y) => (y <= 1 ? y : 1 + (y - 1) * f);
    const yOmbro = Y(1.2), yQuadril = Y(2.75), yJoelho = Y(4.0);
    const tO = yQuadril - 0.15 * f;              // origem do tronco
    const ombroL = yOmbro - tO;                  // ombro em coordenadas do tronco
    const neckY = ombroL - 0.06, shoulderY = ombroL + 0.04;
    const fit = {
      largo: { sw: 0.66, hw: 0.68, hem: yQuadril + 0.27 * f },
      reto: { sw: 0.63, hw: 0.6, hem: yQuadril + 0.2 * f },
      curto: { sw: 0.66, hw: 0.64, hem: yQuadril - 0.02 * f },
    }[c.moletom];
    const hemY = fit.hem - tO;
    const bracoX = fit.sw - 0.04;
    const Lbraco = 0.78 * f, Lante = 0.74 * f;
    const quadrilX = 0.22;
    const Lcoxa = yJoelho - yQuadril - 0.05 * f;
    const Lcanela = A - 0.35 - yJoelho;

    // ---------- peças ----------
    function quadril(pc) {
      const forma = P((p) => {
        p.moveTo(-0.44, -0.3); p.lineTo(0.44, -0.3); p.lineTo(0.42, 0.22);
        p.quadraticCurveTo(0, 0.3, -0.42, 0.22); p.closePath();
      });
      pc.peca(forma, COR.calca, { sombra: 0.08 });
    }

    const CALCAS = {
      reta: { c0: 0.41, c1: 0.36, k0: 0.36, k1: 0.43, barra: true },
      larga: { c0: 0.48, c1: 0.44, k0: 0.44, k1: 0.52, barra: true },
      jogger: { c0: 0.44, c1: 0.37, k0: 0.37, k1: 0.29, punho: true },
      cargo: { c0: 0.48, c1: 0.45, k0: 0.45, k1: 0.5, barra: true, bolso: true },
    };
    const calca = CALCAS[c.calca];

    function coxa(pc) {
      const a = calca.c0 / 2, b = calca.c1 / 2;
      const forma = P((p) => {
        p.moveTo(-a, -0.15); p.lineTo(a + 0.01, -0.15);
        p.quadraticCurveTo(a + 0.02, Lcoxa * 0.5, b, Lcoxa + 0.05);
        p.lineTo(-b, Lcoxa + 0.05);
        p.quadraticCurveTo(-a - 0.01, Lcoxa * 0.5, -a, -0.15);
        p.closePath();
      });
      pc.peca(forma, COR.calca, { sombra: 0.09 });
      if (calca.bolso) {
        const bolso = P((p) => p.roundRect(a - 0.13, Lcoxa * 0.42, 0.15, 0.3, 0.03));
        pc.peca(bolso, COR.calca, { sombra: 0.03, espessura: pc.interno });
        pc.linha(P((p) => { p.moveTo(a - 0.13, Lcoxa * 0.42 + 0.08); p.lineTo(a + 0.02, Lcoxa * 0.42 + 0.08); }));
      }
      // vinco do joelho
      pc.linha(P((p) => { p.moveTo(-b * 0.6, Lcoxa - 0.02); p.quadraticCurveTo(0, Lcoxa + 0.03, b * 0.5, Lcoxa - 0.04); }));
    }

    function canela(pc) {
      const a = calca.k0 / 2, b = calca.k1 / 2;
      const L = Lcanela;
      const forma = P((p) => {
        p.moveTo(-a, 0);
        p.arc(0, 0, a, Math.PI, 0);
        if (calca.punho) {
          p.lineTo(b + 0.01, L - 0.42);
          p.lineTo(b, L - 0.24);
          p.lineTo(-b, L - 0.24);
          p.lineTo(-b - 0.01, L - 0.42);
        } else {
          p.lineTo(a, L * 0.78);
          p.quadraticCurveTo(b + 0.01, L * 0.86, b, L - 0.04);
          p.quadraticCurveTo(0, L + 0.01, -b, L - 0.04);
          p.quadraticCurveTo(-b - 0.01, L * 0.86, -a, L * 0.78);
        }
        p.closePath();
      });
      pc.peca(forma, COR.calca, { sombra: 0.09 });
      if (calca.punho) {
        pc.linha(P((p) => { p.moveTo(-b, L - 0.36); p.lineTo(b, L - 0.36); }));
        pc.linha(P((p) => { p.moveTo(-a * 0.7, L * 0.55); p.quadraticCurveTo(0, L * 0.6, a * 0.5, L * 0.52); }));
      } else if (calca.barra) {
        pc.linha(P((p) => { p.moveTo(-b + 0.02, L * 0.8); p.quadraticCurveTo(-0.02, L * 0.85, b * 0.6, L * 0.79); }));
        pc.linha(P((p) => { p.moveTo(-b * 0.3, L * 0.88); p.quadraticCurveTo(b * 0.3, L * 0.91, b - 0.02, L * 0.87); }));
      }
    }

    function pe(pc) {
      if (c.tenis === 'cano-alto' || calca.punho) {
        // meia (jogger) ou cano do tênis
        const cano = c.tenis === 'cano-alto';
        const parte = P((p) => p.roundRect(-0.15, cano ? -0.3 : -0.32, 0.3, cano ? 0.4 : 0.4, 0.05));
        pc.peca(parte, cano ? COR.tenis : COR.cordao, { sombra: 0.06 });
        if (cano) {
          const gola = P((p) => p.roundRect(-0.155, -0.31, 0.31, 0.09, 0.04));
          pc.peca(gola, COR.acentoTenis, { sombra: 0.03 });
        }
      }
      const cabedal = P((p) => {
        p.moveTo(-0.2, -0.04); p.lineTo(0.2, -0.04);
        p.bezierCurveTo(0.26, 0.04, 0.27, 0.2, 0.25, 0.27);
        p.lineTo(-0.21, 0.27);
        p.bezierCurveTo(-0.24, 0.2, -0.24, 0.04, -0.2, -0.04);
        p.closePath();
      });
      pc.peca(cabedal, COR.tenis, { sombra: 0.07 });
      const biqueira = P((p) => {
        p.moveTo(-0.2, 0.27); p.quadraticCurveTo(-0.2, 0.14, 0.03, 0.13);
        p.quadraticCurveTo(0.25, 0.14, 0.255, 0.27); p.closePath();
      });
      pc.sombraDentro(cabedal, biqueira, COR.acentoTenis.base);
      pc.linha(P((p) => { p.moveTo(-0.19, 0.2); p.quadraticCurveTo(0.03, 0.12, 0.24, 0.2); }));
      pc.linha(P((p) => { p.moveTo(-0.07, 0.02); p.lineTo(0.1, 0.02); p.moveTo(-0.06, 0.07); p.lineTo(0.11, 0.07); }), pc.interno, COR.detalhe.base);
      const sola = P((p) => p.roundRect(-0.25, 0.23, 0.53, 0.13, 0.05));
      pc.peca(sola, T('linho'), { sombra: 0.04 });
    }

    function capuzAtras(pc) {
      const forma = P((p) => {
        p.moveTo(-0.42, -0.06);
        p.quadraticCurveTo(-0.44, -0.4, 0, -0.42);
        p.quadraticCurveTo(0.44, -0.4, 0.42, -0.06);
        p.closePath();
      });
      pc.peca(forma, { base: COR.moletom.sombra, sombra: COR.moletom.sombra }, { sombra: 0 });
    }

    function pescoco(pc) {
      const forma = P((p) => p.rect(-0.13, -0.3, 0.26, 0.42));
      pc.peca(forma, COR.pele, { sombra: 0 });
      pc.sombraDentro(forma, P((p) => p.rect(-0.2, -0.3, 0.4, 0.2)), COR.pele.sombra);
    }

    function tronco(pc) {
      const sw = fit.sw, hw = fit.hw;
      const corpo = P((p) => {
        p.moveTo(-0.16, neckY);
        p.quadraticCurveTo(-0.45, neckY + 0.02, -sw, shoulderY);
        p.quadraticCurveTo(-(sw + 0.14), shoulderY + 0.08, -(sw + 0.09), shoulderY + 0.32);
        p.quadraticCurveTo(-(hw + 0.02), (shoulderY + hemY) / 2, -hw, hemY - 0.1);
        p.lineTo(hw, hemY - 0.1);
        p.quadraticCurveTo(hw + 0.02, (shoulderY + hemY) / 2, sw + 0.09, shoulderY + 0.32);
        p.quadraticCurveTo(sw + 0.14, shoulderY + 0.08, sw, shoulderY);
        p.quadraticCurveTo(0.45, neckY + 0.02, 0.16, neckY);
        p.quadraticCurveTo(0, neckY + 0.1, -0.16, neckY);
        p.closePath();
      });
      pc.peca(corpo, COR.moletom, { sombra: 0.14 });
      // sombra embaixo do capuz
      pc.sombraDentro(corpo, P((p) => p.ellipse(0, neckY + 0.2, 0.42, 0.12, 0, 0, Math.PI * 2)), COR.moletom.sombra);

      // bolso canguru
      const k = hw / 0.65, top = hemY - 0.7, base = hemY - 0.2;
      if (c.moletom !== 'curto') {
        pc.linha(P((p) => {
          p.moveTo(-0.42 * k, base); p.quadraticCurveTo(-0.44 * k, (top + base) / 2, -0.28 * k, top);
          p.lineTo(0.28 * k, top);
          p.quadraticCurveTo(0.44 * k, (top + base) / 2, 0.42 * k, base);
        }));
      }
      // dobras
      pc.linha(P((p) => {
        p.moveTo(-(sw - 0.04), shoulderY + 0.55); p.quadraticCurveTo(-(sw - 0.14), shoulderY + 0.62, -(sw - 0.22), shoulderY + 0.6);
        p.moveTo(sw - 0.04, shoulderY + 0.55); p.quadraticCurveTo(sw - 0.14, shoulderY + 0.62, sw - 0.22, shoulderY + 0.6);
        p.moveTo(-hw + 0.08, hemY - 0.4); p.quadraticCurveTo(-hw + 0.16, hemY - 0.3, -hw + 0.14, hemY - 0.16);
      }));

      if (c.emblema) {
        const cor = T(c.emblema.cor);
        const ex = 0.24, ey = shoulderY + 0.48;
        const forma = c.emblema.forma === 'circulo'
          ? P((p) => p.arc(ex, ey, 0.075, 0, Math.PI * 2))
          : c.emblema.forma === 'triangulo'
            ? P((p) => { p.moveTo(ex, ey - 0.08); p.lineTo(ex + 0.085, ey + 0.065); p.lineTo(ex - 0.085, ey + 0.065); p.closePath(); })
            : P((p) => { p.moveTo(ex + 0.03, ey - 0.1); p.lineTo(ex - 0.05, ey + 0.01); p.lineTo(ex, ey + 0.01); p.lineTo(ex - 0.03, ey + 0.1); p.lineTo(ex + 0.06, ey - 0.02); p.lineTo(ex + 0.01, ey - 0.02); p.closePath(); });
        pc.peca(forma, cor, { sombra: 0, espessura: pc.interno });
      }

      // barra canelada
      const barra = P((p) => {
        p.moveTo(-hw, hemY - 0.18); p.lineTo(hw, hemY - 0.18); p.lineTo(hw - 0.06, hemY + 0.04);
        p.quadraticCurveTo(0, hemY + 0.08, -(hw - 0.06), hemY + 0.04); p.closePath();
      });
      pc.peca(barra, COR.moletom, { sombra: 0.06 });

      // capuz enrolado em volta do pescoço
      for (const s of [-1, 1]) {
        const lobo = P((p) => {
          p.moveTo(0.12 * s, neckY + 0.22);
          p.quadraticCurveTo(0.18 * s, neckY - 0.14, 0.37 * s, neckY - 0.04);
          p.quadraticCurveTo(0.52 * s, neckY + 0.06, 0.41 * s, neckY + 0.17);
          p.quadraticCurveTo(0.26 * s, neckY + 0.24, 0.12 * s, neckY + 0.22);
          p.closePath();
        });
        pc.peca(lobo, COR.moletom, { sombra: 0.05 });
      }
      // cordões
      for (const s of [-1, 1]) {
        const cordao = P((p) => { p.moveTo(0.11 * s, neckY + 0.19); p.quadraticCurveTo(0.13 * s, neckY + 0.4, 0.12 * s, neckY + 0.6); });
        pc.linha(cordao, 0.05, Estilo.base.tinta);
        pc.linha(cordao, 0.03, COR.cordao.base);
        const ponta = P((p) => p.roundRect(0.12 * s - 0.022, neckY + 0.58, 0.044, 0.09, 0.02));
        pc.peca(ponta, COR.detalhe, { sombra: 0, espessura: pc.interno });
      }
    }

    function faixa(pc, manga, y0, y1) {
      if (!COR.faixa) return;
      pc.sombraDentro(manga, P((p) => p.rect(0.07, y0, 0.06, y1 - y0)), COR.faixa.base);
    }

    function braco(pc) {
      const manga = capsula(0.36, 0.35, 0, Lbraco);
      pc.peca(manga, COR.moletom, { sombra: 0.1 });
      faixa(pc, manga, -0.2, Lbraco + 0.2);
      pc.linha(P((p) => { p.moveTo(-0.16, Lbraco - 0.14); p.quadraticCurveTo(-0.08, Lbraco - 0.1, -0.04, Lbraco - 0.16); }));
    }

    function antebraco(pc) {
      const punho = P((p) => p.roundRect(-0.135, Lante - 0.19, 0.27, 0.2, 0.05));
      const manga = capsula(0.35, 0.38, 0, Lante - 0.24);
      pc.peca(punho, COR.moletom, { sombra: 0.05 });
      pc.peca(manga, COR.moletom, { sombra: 0.1 });
      faixa(pc, manga, -0.2, Lante);
      pc.linha(P((p) => { p.moveTo(-0.16, Lante - 0.36); p.quadraticCurveTo(-0.05, Lante - 0.31, 0.06, Lante - 0.37); }));
    }

    function mao(pc) {
      const palma = P((p) => {
        p.moveTo(-0.1, -0.04); p.lineTo(0.1, -0.04);
        p.quadraticCurveTo(0.14, 0.16, 0.11, 0.3);
        p.quadraticCurveTo(0.06, 0.42, -0.03, 0.39);
        p.quadraticCurveTo(-0.11, 0.36, -0.11, 0.24);
        p.closePath();
      });
      const polegar = P((p) => {
        p.moveTo(-0.08, 0.05);
        p.quadraticCurveTo(-0.17, 0.12, -0.15, 0.22);
        p.quadraticCurveTo(-0.12, 0.28, -0.07, 0.22);
        p.closePath();
      });
      pc.peca(palma, COR.pele, { sombra: 0.06 });
      pc.peca(polegar, COR.pele, { sombra: 0.03 });
      pc.linha(P((p) => { p.moveTo(0.0, 0.3); p.lineTo(0.01, 0.36); p.moveTo(0.06, 0.28); p.lineTo(0.065, 0.34); }));
    }

    // ---------- cabeça ----------
    const r = c.cabecaLargura / 2;
    const sx = r / 0.48;
    const cab = CABELOS[c.cabelo];

    function rostoPath() {
      return P((p) => {
        p.moveTo(-r, -0.47);
        p.arc(0, -0.47, r, Math.PI, 0);
        if (c.queixo === 'quadrado') {
          p.bezierCurveTo(r, -0.1, r * 0.72, 0.04, 0, 0.05);
          p.bezierCurveTo(-r * 0.72, 0.04, -r, -0.1, -r, -0.47);
        } else {
          p.bezierCurveTo(r, -0.12, r * 0.54, 0.05, 0, 0.05);
          p.bezierCurveTo(-r * 0.54, 0.05, -r, -0.12, -r, -0.47);
        }
        p.closePath();
      });
    }

    function olho(pc, e, s) {
      const ctx = pc.ctx;
      const x = c.olhoSep * sx * s, cy = -0.37, R = c.olhoRaio;
      const [ox, oy] = e.olhar || [0, 0];
      const pal = e.palpebra || 0;
      if (e.fechado === 'sorriso') {
        pc.linha(P((p) => { p.moveTo(x - R * 0.95, cy + R * 0.25); p.quadraticCurveTo(x, cy - R * 1.2, x + R * 0.95, cy + R * 0.25); }), pc.contorno * 1.3);
        return;
      }
      let area;
      if (c.olhos === 'esclera') {
        area = P((p) => p.arc(x, cy, R, 0, Math.PI * 2));
        pc.preencher(area, T('linho').base);
        ctx.save(); ctx.clip(area);
        const ri = R * 0.76;
        pc.preencher(P((p) => p.arc(x + ox, cy + oy, ri, 0, Math.PI * 2)), COR.iris);
        pc.preencher(P((p) => p.arc(x + ox, cy + oy, ri * 0.52 * (e.pupila || 1), 0, Math.PI * 2)), Estilo.pupila);
        pc.preencher(P((p) => p.arc(x + ox - ri * 0.38, cy + oy - ri * 0.4, ri * 0.28, 0, Math.PI * 2)), Estilo.brilhoOlho);
        pc.preencher(P((p) => p.arc(x + ox + ri * 0.4, cy + oy + ri * 0.4, ri * 0.11, 0, Math.PI * 2)), Estilo.brilhoOlho);
      } else if (c.olhos === 'ponto') {
        area = P((p) => p.arc(x + ox, cy + oy, R * 0.8, 0, Math.PI * 2));
        ctx.save();
        pc.preencher(area, Estilo.pupila);
        pc.preencher(P((p) => p.arc(x + ox - R * 0.28, cy + oy - R * 0.3, R * 0.26, 0, Math.PI * 2)), Estilo.brilhoOlho);
        pc.preencher(P((p) => p.arc(x + ox + R * 0.3, cy + oy + R * 0.28, R * 0.1, 0, Math.PI * 2)), Estilo.brilhoOlho);
      } else { // oval
        area = P((p) => p.ellipse(x + ox, cy + oy, R * 0.72, R * 1.0, 0, 0, Math.PI * 2));
        ctx.save();
        pc.preencher(area, COR.iris);
        ctx.clip(area);
        pc.preencher(P((p) => p.ellipse(x + ox, cy + oy - R * 0.45, R * 0.9, R * 0.55, 0, 0, Math.PI * 2)), Estilo.multiply(COR.iris, '#7A6A80'));
        pc.preencher(P((p) => p.ellipse(x + ox, cy + oy + R * 0.05, R * 0.34 * (e.pupila || 1), R * 0.5 * (e.pupila || 1), 0, 0, Math.PI * 2)), Estilo.pupila);
        pc.preencher(P((p) => p.arc(x + ox - R * 0.25, cy + oy - R * 0.32, R * 0.24, 0, Math.PI * 2)), Estilo.brilhoOlho);
        pc.preencher(P((p) => p.arc(x + ox + R * 0.22, cy + oy + R * 0.42, R * 0.09, 0, Math.PI * 2)), Estilo.brilhoOlho);
      }
      // pálpebra (pele cobrindo de cima)
      const topo = cy - R * (c.olhos === 'oval' ? 1.0 : 1), alt = 2 * R * (c.olhos === 'oval' ? 1.0 : 1);
      const yP = topo + alt * pal;
      // borda da pálpebra curva (acompanha o olho); inclinação opcional: e.palpebraInclina (+ = canto de fora mais baixo)
      const inc = (e.palpebraInclina || 0) * R * s;
      const bordaPalpebra = (p) => { p.moveTo(x - R * 1.0, yP + R * 0.18 - inc); p.quadraticCurveTo(x, yP - R * 0.28, x + R * 1.0, yP + R * 0.18 + inc); };
      if (pal > 0) pc.preencher(P((p) => { bordaPalpebra(p); p.lineTo(x + R * 1.3, topo - 0.03); p.lineTo(x - R * 1.3, topo - 0.03); p.closePath(); }), COR.pele.base);
      ctx.restore();
      if (c.olhos === 'esclera') pc.linha(area, pc.interno);
      // linha da pálpebra / cílio superior
      if (pal > 0.02) {
        pc.linha(P(bordaPalpebra), pc.contorno * 1.25);
      } else if (c.olhos === 'esclera') {
        pc.linha(P((p) => p.arc(x, cy, R, Math.PI * 1.1, Math.PI * 1.9)), pc.contorno * 1.2);
      } else if (c.olhos === 'oval') {
        pc.linha(P((p) => p.ellipse(x, cy, R * 0.95, R * 1.15, 0, Math.PI * 1.15, Math.PI * 1.85)), pc.contorno * 1.3);
      }
    }

    function sobrancelha(pc, e, s) {
      const ctx = pc.ctx;
      const sb = e.sobrancelha || { y: 0, ang: 0 };
      const t = c.sobrancelhaEsp;
      ctx.save();
      ctx.translate(0.2 * sx * s, -0.505 + sb.y);
      ctx.rotate((sb.ang * s * Math.PI) / 180); // ang positivo = ponta de dentro levantada
      const i = -0.1 * s, o = 0.11 * s; // ponta de dentro / de fora
      const forma = P((p) => {
        if (c.sobrancelha === 'arqueada') {
          p.moveTo(i, -t * 0.3);
          p.quadraticCurveTo(0, -t * 1.6, o, -t * 0.1);
          p.quadraticCurveTo(o * 1.05, t * 0.25, o * 0.9, t * 0.3);
          p.quadraticCurveTo(0, -t * 0.6, i, t * 0.55);
          p.quadraticCurveTo(i * 1.12, t * 0.1, i, -t * 0.3);
        } else if (c.sobrancelha === 'angular') {
          p.moveTo(i, -t * 0.55);
          p.lineTo(0.035 * s, -t * 0.95);
          p.lineTo(o * 1.05, t * 0.15);
          p.lineTo(0.03 * s, -t * 0.1);
          p.lineTo(i, t * 0.55);
          p.closePath();
        } else {
          p.moveTo(i, -t * 0.55);
          p.quadraticCurveTo(0, -t * 0.85, o, -t * 0.35);
          p.quadraticCurveTo(o * 1.1, 0, o * 0.92, t * 0.22);
          p.quadraticCurveTo(0, 0, i, t * 0.48);
          p.quadraticCurveTo(i * 1.15, 0, i, -t * 0.55);
        }
        p.closePath();
      });
      pc.preencher(forma, Estilo.multiply(COR.cabelo.base, '#D8D0E0'));
      ctx.restore();
    }

    function boca(pc, e) {
      const ctx = pc.ctx;
      const b = e.boca || { tipo: 'linha', curva: 0.3 };
      const w = b.largura || 0.06, yb = -0.11;
      if (b.tipo === 'aberta') {
        const ab = b.abertura || 0.05;
        const forma = P((p) => {
          p.moveTo(-w, yb);
          p.quadraticCurveTo(0, yb + 0.03 * (b.curva || 0) - 0.01, w, yb);
          p.quadraticCurveTo(0, yb + ab * 2 + 0.03 * (b.curva || 0), -w, yb);
          p.closePath();
        });
        pc.preencher(forma, Estilo.base.tinta);
        ctx.save(); ctx.clip(forma);
        pc.preencher(P((p) => p.ellipse(0, yb + ab * 1.6, w * 0.6, ab * 0.7, 0, 0, Math.PI * 2)), T('brasa').sombra);
        ctx.restore();
        pc.linha(forma, pc.interno);
      } else {
        const cv = b.curva || 0;
        pc.linha(P((p) => { p.moveTo(-w, yb - 0.008 * cv); p.quadraticCurveTo(0, yb + 0.03 * cv, w, yb - 0.008 * cv); }), pc.interno * 1.2);
      }
    }

    function cabelo(dy = 0) {
      return P((p) => {
        zigue(p, cab.borda, dy, sx);
        if (dy) { p.lineTo(-0.7, -1.3); p.lineTo(0.7, -1.3); p.closePath(); return; }
        // volume do cabelo: afasta os pontos do topo a partir do centro da cabeça (mantém as costeletas)
        const v = c.cabeloVolume;
        const topo = cab.topo.map(([x, y], i, arr) => (i === 0 || i === arr.length - 1) ? [x, y] : [x * v, -0.5 + (y + 0.5) * v]);
        cunhas(p, topo, sx);
        p.closePath();
      });
    }

    function cabeca(pc, rig) {
      const e = rig.expressao;
      const rosto = rostoPath();
      for (const s of [-1, 1]) {
        const orelha = P((p) => p.ellipse((r - 0.01) * s, -0.35, 0.075, 0.11, 0, 0, Math.PI * 2));
        pc.peca(orelha, COR.pele, { sombra: 0.04 });
        pc.linha(P((p) => { p.moveTo((r - 0.01) * s, -0.42); p.quadraticCurveTo((r + 0.02) * s, -0.35, (r - 0.02) * s, -0.29); }));
      }
      pc.peca(rosto, COR.pele, { sombra: 0.07 });
      pc.sombraDentro(rosto, cabelo(0.06), COR.pele.sombra);
      for (const s of [-1, 1]) pc.preencher(P((p) => p.ellipse(0.29 * sx * s, -0.24, 0.07, 0.033, 0, 0, Math.PI * 2)), Estilo.blush);
      for (const s of [-1, 1]) olho(pc, e, s);
      for (const s of [-1, 1]) sobrancelha(pc, e, s);
      pc.linha(P((p) => { p.moveTo(-0.01, -0.21); p.quadraticCurveTo(0.035, -0.205, 0.025, -0.235); }), pc.interno, COR.pele.sombra);
      boca(pc, e);

      const forma = cabelo();
      const gota = e.gota ? P((p) => {
        const gx = 0.4 * sx, gy = -0.62;
        p.moveTo(gx, gy - 0.1);
        p.quadraticCurveTo(gx + 0.06, gy - 0.01, gx + 0.045, gy + 0.03);
        p.arc(gx, gy + 0.03, 0.045, 0, Math.PI);
        p.quadraticCurveTo(gx - 0.06, gy - 0.01, gx, gy - 0.1);
        p.closePath();
      }) : null;
      pc.peca(forma, COR.cabelo, { sombra: 0.06 });
      pc.preencher(P((p) => {
        p.moveTo(-0.36 * sx, -0.92); p.quadraticCurveTo(-0.18 * sx, -1.02, 0.02 * sx, -0.99);
        p.quadraticCurveTo(-0.16 * sx, -0.96, -0.33 * sx, -0.87); p.closePath();
      }), COR.cabelo.luz);
      if (gota) {
        pc.peca(gota, { base: '#D6ECFF', sombra: '#A9C8EE' }, { sombra: 0.02, espessura: pc.interno * 1.2 });
        pc.preencher(P((p) => p.ellipse(0.39 * sx, -0.585, 0.012, 0.02, 0, 0, Math.PI * 2)), '#FFFFFF');
      }
      pc.linha(P((p) => {
        for (const l of cab.linhas) { p.moveTo(l[0][0] * sx, l[0][1]); p.quadraticCurveTo(l[1][0] * sx, l[1][1], l[2][0] * sx, l[2][1]); }
      }));
    }

    return {
      nome: 'Protagonista',
      opcoes: c,
      alturaEmH: A,
      larguraOmbrosH: fit.sw * 2 + 0.2,
      fatorContorno: c.fatorContorno,
      partes: [
        { nome: 'quadril', pai: null, pivo: [0, yQuadril], z: 0.5, desenhar: quadril },
        { nome: 'pe_d', pai: 'canela_d', pivo: [0, Lcanela], z: 0.8, espelho: -1, desenhar: pe },
        { nome: 'pe_e', pai: 'canela_e', pivo: [0, Lcanela], z: 0.8, desenhar: pe },
        { nome: 'coxa_d', pai: 'quadril', pivo: [-quadrilX, 0.05 * f], z: 1, grupo: 'perna_d', espelho: -1, desenhar: coxa },
        { nome: 'canela_d', pai: 'coxa_d', pivo: [0, Lcoxa], z: 1.05, grupo: 'perna_d', espelho: -1, desenhar: canela },
        { nome: 'coxa_e', pai: 'quadril', pivo: [quadrilX, 0.05 * f], z: 1.1, grupo: 'perna_e', desenhar: coxa },
        { nome: 'canela_e', pai: 'coxa_e', pivo: [0, Lcoxa], z: 1.15, grupo: 'perna_e', desenhar: canela },
        { nome: 'capuz', pai: 'tronco', pivo: [0, ombroL + 0.1], z: 4, desenhar: capuzAtras },
        { nome: 'pescoco', pai: 'tronco', pivo: [0, ombroL - 0.02], z: 5, desenhar: pescoco },
        { nome: 'tronco', pai: 'quadril', pivo: [0, -0.15 * f], z: 6, desenhar: tronco },
        { nome: 'braco_d', pai: 'tronco', pivo: [-bracoX, ombroL + 0.18], z: 7, grupo: 'braco_d', espelho: -1, desenhar: braco },
        { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, Lbraco], z: 7.1, grupo: 'braco_d', espelho: -1, desenhar: antebraco },
        { nome: 'braco_e', pai: 'tronco', pivo: [bracoX, ombroL + 0.18], z: 7.2, grupo: 'braco_e', desenhar: braco },
        { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, Lbraco], z: 7.3, grupo: 'braco_e', desenhar: antebraco },
        { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, Lante], z: 9, espelho: -1, desenhar: mao },
        { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, Lante], z: 9, desenhar: mao },
        { nome: 'cabeca', pai: 'pescoco', pivo: [0, -0.23], z: 10, desenhar: cabeca },
      ],
      poses: {
        parado: {
          braco_d: 7, antebraco_d: -3, mao_d: -2, braco_e: -7, antebraco_e: 3, mao_e: 2,
          coxa_d: 1.5, canela_d: -1.5, coxa_e: -1.5, canela_e: 1.5, cabeca: 2,
        },
      },
      expressoes: {
        neutro: { olhar: [0, 0], palpebra: 0, pupila: 1, sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.35 } },
        curioso: { olhar: [0.014, -0.01], palpebra: 0, pupila: 1.1, sobrancelha: { y: -0.03, ang: 8 }, boca: { tipo: 'linha', curva: 0.2, largura: 0.045 } },
        assustado: { olhar: [0, 0.004], palpebra: 0, pupila: 0.6, sobrancelha: { y: -0.045, ang: 18 }, boca: { tipo: 'aberta', curva: -0.8, abertura: 0.035, largura: 0.055 }, gota: true },
        determinado: { olhar: [0, 0], palpebra: 0.3, palpebraInclina: -0.25, pupila: 1, sobrancelha: { y: 0.025, ang: -18 }, boca: { tipo: 'linha', curva: -0.1, largura: 0.07 } },
        feliz: { fechado: 'sorriso', sobrancelha: { y: -0.03, ang: 5 }, boca: { tipo: 'aberta', curva: 1.4, abertura: 0.06, largura: 0.09 } },
        serio: { olhar: [0, 0], palpebra: 0.22, pupila: 1, sobrancelha: { y: 0.025, ang: -6 }, boca: { tipo: 'linha', curva: -0.2, largura: 0.07 } },
        surpreso: { olhar: [0, 0], palpebra: 0, pupila: 0.55, sobrancelha: { y: -0.075, ang: 4 }, boca: { tipo: 'aberta', curva: 0, abertura: 0.05, largura: 0.035 } },
        triste: { olhar: [0, 0.012], palpebra: 0.28, palpebraInclina: 0.35, pupila: 1, sobrancelha: { y: -0.015, ang: 20 }, boca: { tipo: 'linha', curva: -0.9, largura: 0.065 } },
      },
    };
  };
})();

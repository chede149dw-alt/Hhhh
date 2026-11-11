// Protagonista — jovem comum que acorda com poderes. Vista de frente.
// Segue o guia-de-estilo.md (exceções do briefing anotadas em ficha.md).
//
// Unidades: H = altura da cabeça. Altura total 5,5 H. y cresce para baixo.
// Lados: "_d" = lado direito do personagem (esquerda da tela), "_e" = lado esquerdo (direita da tela).
// As peças são desenhadas como se fossem do lado direito da tela; as da esquerda usam espelho: -1.
// Ângulos: positivo = horário na tela. Para abrir os braços: braco_d positivo, braco_e negativo.
(function () {
  const T = (n) => Estilo.tom(n);
  const COR = {
    pele: T('pele3'),
    cabelo: T('cabNoite'),
    moletom: T('marinho'),
    calca: T('grafite'),
    tenis: T('linho'),
    detalhe: T('pedra'),
    iris: Estilo.base.irisCastanho,
  };

  const P = (fn) => { const p = new Path2D(); fn(p); return p; };

  // cápsula afunilada vertical: larguras no topo/base, extremos arredondados
  const capsula = (wTop, wBot, y0, y1) => P((p) => {
    p.moveTo(-wTop / 2, y0);
    p.arc(0, y0, wTop / 2, Math.PI, 0);
    p.lineTo(wBot / 2, y1);
    p.arc(0, y1, wBot / 2, 0, Math.PI);
    p.closePath();
  });

  // ---------- peças ----------

  function quadril(pc) {
    const forma = P((p) => {
      p.moveTo(-0.44, -0.3); p.lineTo(0.44, -0.3); p.lineTo(0.42, 0.22);
      p.quadraticCurveTo(0, 0.3, -0.42, 0.22); p.closePath();
    });
    pc.peca(forma, COR.calca, { sombra: 0.08 });
  }

  function coxa(pc) {
    const forma = P((p) => {
      p.moveTo(-0.2, -0.15); p.lineTo(0.21, -0.15);
      p.quadraticCurveTo(0.22, 0.6, 0.18, 1.28);
      p.lineTo(-0.18, 1.28);
      p.quadraticCurveTo(-0.21, 0.6, -0.2, -0.15);
      p.closePath();
    });
    pc.peca(forma, COR.calca, { sombra: 0.09 });
  }

  function canela(pc) {
    const forma = P((p) => {
      p.moveTo(-0.18, 0);
      p.arc(0, 0, 0.18, Math.PI, 0);
      p.lineTo(0.18, 0.88);
      p.quadraticCurveTo(0.22, 0.98, 0.215, 1.1);
      p.quadraticCurveTo(0, 1.15, -0.215, 1.1);
      p.quadraticCurveTo(-0.22, 0.98, -0.18, 0.88);
      p.closePath();
    });
    pc.peca(forma, COR.calca, { sombra: 0.09 });
    // barra embolada (seção 8)
    pc.linha(P((p) => { p.moveTo(-0.17, 0.9); p.quadraticCurveTo(-0.02, 0.95, 0.12, 0.89); }));
    pc.linha(P((p) => { p.moveTo(-0.05, 1.0); p.quadraticCurveTo(0.08, 1.03, 0.18, 0.99); }));
  }

  function pe(pc) {
    const cabedal = P((p) => {
      p.moveTo(-0.2, -0.04);
      p.lineTo(0.2, -0.04);
      p.bezierCurveTo(0.26, 0.04, 0.27, 0.2, 0.25, 0.27);
      p.lineTo(-0.21, 0.27);
      p.bezierCurveTo(-0.24, 0.2, -0.24, 0.04, -0.2, -0.04);
      p.closePath();
    });
    const sola = P((p) => {
      p.roundRect(-0.25, 0.23, 0.53, 0.13, 0.05);
    });
    pc.peca(cabedal, COR.tenis, { sombra: 0.07 });
    // biqueira e cadarço
    pc.linha(P((p) => { p.moveTo(-0.17, 0.2); p.quadraticCurveTo(0.03, 0.12, 0.23, 0.2); }));
    pc.linha(P((p) => { p.moveTo(-0.08, 0.02); p.lineTo(0.1, 0.02); p.moveTo(-0.07, 0.08); p.lineTo(0.11, 0.08); }), pc.interno, COR.detalhe.base);
    pc.peca(sola, COR.tenis, { sombra: 0.04 });
    pc.linha(P((p) => { p.moveTo(-0.22, 0.3); p.lineTo(0.25, 0.3); }));
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
    const forma = P((p) => p.rect(-0.14, -0.3, 0.28, 0.42));
    pc.peca(forma, COR.pele, { sombra: 0 });
    // sombra do queixo (seção 6)
    pc.sombraDentro(forma, P((p) => p.rect(-0.2, -0.3, 0.4, 0.2)), COR.pele.sombra);
  }

  function tronco(pc) {
    const corpo = P((p) => {
      p.moveTo(-0.16, -1.46);
      p.quadraticCurveTo(-0.45, -1.44, -0.62, -1.36);
      p.quadraticCurveTo(-0.76, -1.28, -0.71, -1.04);
      p.lineTo(-0.65, 0.24);
      p.lineTo(0.65, 0.24);
      p.lineTo(0.71, -1.04);
      p.quadraticCurveTo(0.76, -1.28, 0.62, -1.36);
      p.quadraticCurveTo(0.45, -1.44, 0.16, -1.46);
      p.quadraticCurveTo(0, -1.36, -0.16, -1.46);
      p.closePath();
    });
    pc.peca(corpo, COR.moletom, { sombra: 0.14 });

    // bolso canguru
    pc.linha(P((p) => {
      p.moveTo(-0.42, 0.16); p.quadraticCurveTo(-0.44, -0.08, -0.28, -0.32);
      p.lineTo(0.28, -0.32);
      p.quadraticCurveTo(0.44, -0.08, 0.42, 0.16);
    }));
    // dobras perto das axilas
    pc.linha(P((p) => {
      p.moveTo(-0.6, -0.85); p.quadraticCurveTo(-0.5, -0.78, -0.42, -0.8);
      p.moveTo(0.6, -0.85); p.quadraticCurveTo(0.5, -0.78, 0.42, -0.8);
    }));

    // barra canelada
    const barra = P((p) => {
      p.moveTo(-0.66, 0.16); p.lineTo(0.66, 0.16); p.lineTo(0.6, 0.4);
      p.quadraticCurveTo(0, 0.44, -0.6, 0.4); p.closePath();
    });
    pc.peca(barra, COR.moletom, { sombra: 0.06 });

    // capuz enrolado em volta do pescoço (frente)
    for (const s of [-1, 1]) {
      const lobo = P((p) => {
        p.moveTo(0.12 * s, -1.24);
        p.quadraticCurveTo(0.18 * s, -1.6, 0.37 * s, -1.5);
        p.quadraticCurveTo(0.52 * s, -1.4, 0.41 * s, -1.29);
        p.quadraticCurveTo(0.26 * s, -1.22, 0.12 * s, -1.24);
        p.closePath();
      });
      pc.peca(lobo, COR.moletom, { sombra: 0.05 });
    }

    // cordões
    for (const s of [-1, 1]) {
      const cordao = P((p) => {
        p.moveTo(0.11 * s, -1.27);
        p.quadraticCurveTo(0.13 * s, -1.05, 0.12 * s, -0.86);
      });
      pc.linha(cordao, 0.05, Estilo.base.tinta);
      pc.linha(cordao, 0.03, COR.tenis.base);
      const ponta = P((p) => p.roundRect(0.12 * s - 0.022, -0.88, 0.044, 0.09, 0.02));
      pc.peca(ponta, COR.detalhe, { sombra: 0, espessura: pc.interno });
    }
  }

  function braco(pc) {
    const manga = capsula(0.36, 0.35, 0, 0.78);
    pc.peca(manga, COR.moletom, { sombra: 0.1 });
    pc.linha(P((p) => { p.moveTo(-0.16, 0.64); p.quadraticCurveTo(-0.08, 0.68, -0.04, 0.62); }));
  }

  function antebraco(pc) {
    const punho = P((p) => p.roundRect(-0.135, 0.55, 0.27, 0.2, 0.05));
    const manga = capsula(0.35, 0.38, 0, 0.5);
    pc.peca(punho, COR.moletom, { sombra: 0.05 });
    pc.peca(manga, COR.moletom, { sombra: 0.1 });
    // manga sobrando, embolada no punho
    pc.linha(P((p) => { p.moveTo(-0.16, 0.38); p.quadraticCurveTo(-0.05, 0.43, 0.06, 0.37); }));
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
    pc.linha(P((p) => {
      p.moveTo(0.0, 0.3); p.lineTo(0.01, 0.36);
      p.moveTo(0.06, 0.28); p.lineTo(0.065, 0.34);
    }));
  }

  // ---------- cabeça e rosto ----------

  const cx = 0.19, cy = -0.37, rOlho = 0.068; // olhos pequenos e redondos (briefing)

  function franja(p, dy = 0) {
    // borda de baixo do cabelo: 5 pontas em cunha sobre a testa
    const pts = [[0.47, -0.4], [0.4, -0.66], [0.31, -0.58], [0.22, -0.7], [0.1, -0.59],
      [0.0, -0.72], [-0.12, -0.6], [-0.22, -0.71], [-0.32, -0.6], [-0.41, -0.68], [-0.47, -0.4]];
    p.moveTo(pts[0][0], pts[0][1] + dy);
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i]; const [px, py] = pts[i - 1];
      p.quadraticCurveTo((px + x) / 2 + 0.01, Math.max(py, y) + dy, x, y + dy);
    }
  }

  function cabeca(pc, rig) {
    const e = rig.expressao;
    const ctx = pc.ctx;
    const rosto = P((p) => {
      p.moveTo(-0.48, -0.47);
      p.arc(0, -0.47, 0.48, Math.PI, 0);
      p.bezierCurveTo(0.48, -0.12, 0.26, 0.05, 0, 0.05);
      p.bezierCurveTo(-0.26, 0.05, -0.48, -0.12, -0.48, -0.47);
      p.closePath();
    });

    // orelhas (atrás do rosto)
    for (const s of [-1, 1]) {
      const orelha = P((p) => p.ellipse(0.47 * s, -0.35, 0.075, 0.11, 0, 0, Math.PI * 2));
      pc.peca(orelha, COR.pele, { sombra: 0.04 });
      pc.linha(P((p) => { p.moveTo(0.47 * s, -0.42); p.quadraticCurveTo(0.5 * s, -0.35, 0.46 * s, -0.29); }));
    }

    pc.peca(rosto, COR.pele, { sombra: 0.07 });

    // sombra da franja na testa (seção 6)
    const sombraFranja = P((p) => { franja(p, 0.06); p.lineTo(-0.6, -1.2); p.lineTo(0.6, -1.2); p.closePath(); });
    pc.sombraDentro(rosto, sombraFranja, COR.pele.sombra);

    // blush
    for (const s of [-1, 1]) {
      pc.preencher(P((p) => p.ellipse(0.29 * s, -0.24, 0.07, 0.033, 0, 0, Math.PI * 2)), Estilo.blush);
    }

    // olhos
    const [ox, oy] = e.olhar || [0, 0];
    for (const s of [-1, 1]) {
      const x = cx * s;
      const esclera = P((p) => p.arc(x, cy, rOlho, 0, Math.PI * 2));
      pc.preencher(esclera, COR.tenis.base);
      ctx.save(); ctx.clip(esclera);
      const ri = rOlho * 0.76;
      pc.preencher(P((p) => p.arc(x + ox, cy + oy, ri, 0, Math.PI * 2)), COR.iris);
      pc.preencher(P((p) => p.arc(x + ox, cy + oy, ri * 0.52 * (e.pupila || 1), 0, Math.PI * 2)), Estilo.pupila);
      pc.preencher(P((p) => p.arc(x + ox - ri * 0.38, cy + oy - ri * 0.4, ri * 0.28, 0, Math.PI * 2)), Estilo.brilhoOlho);
      pc.preencher(P((p) => p.arc(x + ox + ri * 0.4, cy + oy + ri * 0.4, ri * 0.11, 0, Math.PI * 2)), Estilo.brilhoOlho);
      // pálpebra
      const pal = e.palpebra || 0;
      const yP = cy - rOlho + 2 * rOlho * pal;
      if (pal > 0) pc.preencher(P((p) => p.rect(x - rOlho, cy - rOlho - 0.01, rOlho * 2, yP - (cy - rOlho) + 0.01)), COR.pele.base);
      ctx.restore();
      pc.linha(esclera, pc.interno);
      if (pal > 0.02) {
        const meia = Math.sqrt(Math.max(0, rOlho * rOlho - (yP - cy) ** 2));
        pc.linha(P((p) => { p.moveTo(x - meia - 0.005, yP); p.lineTo(x + meia + 0.005, yP); }), pc.contorno * 1.2);
      } else {
        pc.linha(P((p) => p.arc(x, cy, rOlho, Math.PI * 1.1, Math.PI * 1.9)), pc.contorno * 1.2);
      }
    }

    // sobrancelhas grossas (briefing)
    const sb = e.sobrancelha || { y: 0, ang: 0 };
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(0.2 * s, -0.505 + sb.y);
      ctx.rotate((sb.ang * s * Math.PI) / 180); // ang positivo = ponta de dentro levantada
      const forma = P((p) => {
        p.moveTo(-0.1 * s, -0.032);
        p.quadraticCurveTo(0, -0.05, 0.11 * s, -0.022);
        p.quadraticCurveTo(0.12 * s, 0.0, 0.1 * s, 0.012);
        p.quadraticCurveTo(0, 0.0, -0.1 * s, 0.028);
        p.quadraticCurveTo(-0.115 * s, 0, -0.1 * s, -0.032);
        p.closePath();
      });
      pc.preencher(forma, COR.cabelo.base);
      ctx.restore();
    }

    // nariz (marca curta)
    pc.linha(P((p) => { p.moveTo(-0.01, -0.21); p.quadraticCurveTo(0.035, -0.205, 0.025, -0.235); }), pc.interno, COR.pele.sombra);

    // boca simples
    const b = e.boca || { tipo: 'linha', curva: 0.3, largura: 0.06 };
    const w = b.largura || 0.06, yb = -0.11;
    if (b.tipo === 'aberta') {
      const ab = b.abertura || 0.05;
      const boca = P((p) => {
        p.moveTo(-w, yb);
        p.quadraticCurveTo(0, yb + 0.03 * (b.curva || 0) - 0.01, w, yb);
        p.quadraticCurveTo(0, yb + ab * 2 + 0.03 * (b.curva || 0), -w, yb);
        p.closePath();
      });
      pc.preencher(boca, Estilo.base.tinta);
      ctx.save(); ctx.clip(boca);
      pc.preencher(P((p) => p.ellipse(0, yb + ab * 1.6, w * 0.6, ab * 0.7, 0, 0, Math.PI * 2)), Estilo.tom('brasa').sombra);
      ctx.restore();
      pc.linha(boca, pc.interno);
    } else {
      pc.linha(P((p) => { p.moveTo(-w, yb - 0.008 * (b.curva || 0)); p.quadraticCurveTo(0, yb + 0.03 * (b.curva || 0), w, yb - 0.008 * (b.curva || 0)); }), pc.interno * 1.2);
    }

    // cabelo curto com franja
    const cabelo = P((p) => {
      franja(p);
      p.bezierCurveTo(-0.53, -0.5, -0.56, -0.66, -0.53, -0.8);
      p.quadraticCurveTo(-0.5, -0.98, -0.32, -1.04);
      p.quadraticCurveTo(-0.12, -1.11, 0.04, -1.08);
      p.lineTo(0.1, -1.17); // mecha solta no topo
      p.lineTo(0.17, -1.07);
      p.quadraticCurveTo(0.42, -1.04, 0.52, -0.84);
      p.bezierCurveTo(0.57, -0.7, 0.55, -0.52, 0.47, -0.4);
      p.closePath();
    });
    pc.peca(cabelo, COR.cabelo, { sombra: 0.06 });
    // faixa de luz no cabelo (seção 6: 1 faixa)
    pc.preencher(P((p) => {
      p.moveTo(-0.36, -0.92); p.quadraticCurveTo(-0.18, -1.02, 0.02, -0.99);
      p.quadraticCurveTo(-0.16, -0.96, -0.33, -0.87); p.closePath();
    }), COR.cabelo.luz);
    // separação das mechas
    pc.linha(P((p) => {
      p.moveTo(-0.22, -0.71); p.quadraticCurveTo(-0.2, -0.85, -0.1, -0.95);
      p.moveTo(0.22, -0.7); p.quadraticCurveTo(0.26, -0.84, 0.36, -0.92);
    }));
  }

  // ---------- definição ----------

  window.PERSONAGEM = {
    nome: 'Protagonista',
    alturaEmH: 5.5,
    larguraOmbrosH: 1.45,
    partes: [
      { nome: 'quadril', pai: null, pivo: [0, 2.75], z: 0.5, desenhar: quadril },
      { nome: 'coxa_d', pai: 'quadril', pivo: [-0.22, 0.05], z: 1, grupo: 'perna_d', espelho: -1, desenhar: coxa },
      { nome: 'coxa_e', pai: 'quadril', pivo: [0.22, 0.05], z: 1.1, grupo: 'perna_e', desenhar: coxa },
      { nome: 'canela_d', pai: 'coxa_d', pivo: [0, 1.2], z: 1.05, grupo: 'perna_d', espelho: -1, desenhar: canela },
      { nome: 'canela_e', pai: 'coxa_e', pivo: [0, 1.2], z: 1.15, grupo: 'perna_e', desenhar: canela },
      { nome: 'pe_d', pai: 'canela_d', pivo: [0, 1.15], z: 3, espelho: -1, desenhar: pe },
      { nome: 'pe_e', pai: 'canela_e', pivo: [0, 1.15], z: 3, desenhar: pe },
      { nome: 'tronco', pai: 'quadril', pivo: [0, -0.15], z: 6, desenhar: tronco },
      { nome: 'capuz', pai: 'tronco', pivo: [0, -1.3], z: 4, desenhar: capuzAtras },
      { nome: 'pescoco', pai: 'tronco', pivo: [0, -1.42], z: 5, desenhar: pescoco },
      { nome: 'cabeca', pai: 'pescoco', pivo: [0, -0.23], z: 10, desenhar: cabeca },
      { nome: 'braco_d', pai: 'tronco', pivo: [-0.6, -1.22], z: 7, grupo: 'braco_d', espelho: -1, desenhar: braco },
      { nome: 'braco_e', pai: 'tronco', pivo: [0.6, -1.22], z: 7.2, grupo: 'braco_e', desenhar: braco },
      { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, 0.78], z: 7.1, grupo: 'braco_d', espelho: -1, desenhar: antebraco },
      { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, 0.78], z: 7.3, grupo: 'braco_e', desenhar: antebraco },
      { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, 0.74], z: 9, espelho: -1, desenhar: mao },
      { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, 0.74], z: 9, desenhar: mao },
    ],
    poses: {
      parado: {
        braco_d: 7, antebraco_d: -3, mao_d: -2,
        braco_e: -7, antebraco_e: 3, mao_e: 2,
        coxa_d: 1.5, canela_d: -1.5, coxa_e: -1.5, canela_e: 1.5,
        cabeca: 2,
      },
    },
    // seção 4: neutro, feliz, sério, surpreso, triste, determinado + curioso e assustado (briefing)
    expressoes: {
      neutro: { olhar: [0, 0], palpebra: 0.12, pupila: 1, sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.35 } },
      curioso: { olhar: [0.012, -0.008], palpebra: 0, pupila: 1.05, sobrancelha: { y: -0.025, ang: 7 }, boca: { tipo: 'linha', curva: 0.15, largura: 0.045 } },
      assustado: { olhar: [0, 0], palpebra: 0, pupila: 0.65, sobrancelha: { y: -0.04, ang: 16 }, boca: { tipo: 'aberta', curva: -0.6, abertura: 0.03, largura: 0.05 } },
      determinado: { olhar: [0, 0], palpebra: 0.32, pupila: 1, sobrancelha: { y: 0.018, ang: -15 }, boca: { tipo: 'linha', curva: -0.15, largura: 0.065 } },
      feliz: { olhar: [0, 0], palpebra: 0.2, pupila: 1, sobrancelha: { y: -0.02, ang: 4 }, boca: { tipo: 'aberta', curva: 1, abertura: 0.04, largura: 0.075 } },
      serio: { olhar: [0, 0], palpebra: 0.28, pupila: 1, sobrancelha: { y: 0.02, ang: -10 }, boca: { tipo: 'linha', curva: -0.3 } },
      surpreso: { olhar: [0, 0], palpebra: 0, pupila: 0.6, sobrancelha: { y: -0.06, ang: 5 }, boca: { tipo: 'aberta', curva: 0, abertura: 0.045, largura: 0.04 } },
      triste: { olhar: [0, 0.006], palpebra: 0.25, pupila: 1, sobrancelha: { y: -0.01, ang: 18 }, boca: { tipo: 'linha', curva: -0.6 } },
    },
  };
})();

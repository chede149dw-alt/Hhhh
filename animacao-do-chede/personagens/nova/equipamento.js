// Equipamento de jogo (série nova, VALDOR): veste por cima de um personagem feito com motor/personagem-base.js.
// equipar(def, eq) recebe a definição do Rig e devolve a mesma, com peças extras desenhadas por cima:
//   eq.capuz (cor)            capuz de pano atrás da cabeça
//   eq.cinto { cor, fivela, bolsa }   cinto na cintura, com fivela e bolsinha opcional
//   eq.gola (cor)             gola/peitoral de couro no alto do peito
//   eq.botas { cor, cano }    cano de bota de couro sobre a calça
//   eq.bracadeira (cor)       braçadeira de couro no antebraço
//   eq.arma { tipo: 'adaga'|'espada-madeira', mao: 'd'|'e' }
//   eq.escudo { cor, borda, emblema }   escudo redondo no antebraço esquerdo
// Carregar depois de personagem-base.js e de personagens/nova/cores.js.
(function () {
  const T = (n) => Estilo.tom(n);
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const tomFixo = (b, s, l) => ({ base: b, sombra: s, luz: l || b });

  // costura tracejada clara (couro costurado, referências 3D)
  const costura = (pc, path, cor = 'rgba(255,236,205,0.55)') => { if (pc.modo === 'contorno') return; pc.ctx.save(); pc.ctx.setLineDash([0.035, 0.028]); pc.linha(path, pc.interno * 0.75, cor); pc.ctx.restore(); };
  const tachas = (pc, pts, tom, r = 0.022) => { for (const [x, y] of pts) { pc.peca(P((p) => p.arc(x, y, r, 0, Math.PI * 2)), tom, { sombra: 0, espessura: pc.interno * 0.5 }); pc.preencher(P((p) => p.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2)), 'rgba(255,255,255,0.7)'); } };
  window.equipar = function (def, eq) {
    const c = def.opcoes, vista = def.vista;
    const A = c.altura, f = (A - 1) / 4.5;
    const ombroL = -1.4 * f, neckY = ombroL - 0.06, shoulderY = ombroL + 0.04;
    const fit = { moletom: [c.corpo.ombro + 0.06, c.corpo.ombro + 0.08, 0.42], camiseta: [c.corpo.ombro, c.corpo.ombro - 0.04, 0.31], cardiga: [c.corpo.ombro, c.corpo.ombro + 0.02, 0.49] }[c.top.tipo];
    const hw = fit[1], hemY = fit[2] * f;
    const Lcanela = A - 0.35 - (1 + 3 * f);
    const Lbraco = 0.78 * f, Lante = 0.74 * f;
    const parte = (n) => def.partes.find((p) => p.nome === n);
    const depois = (n, fn) => { const p = parte(n); if (!p) return; const orig = p.desenhar; p.desenhar = (pc, ...r) => { orig(pc, ...r); fn(pc, ...r); }; };
    const trocar = (n, fn) => { const p = parte(n); if (p) p.desenhar = fn; };
    const k = vista === 'tq' ? 0.94 : 1, cx = vista === 'tq' ? 0.15 : 0;
    const perfil = vista === 'perfil', costas = vista === 'costas';
    const d = c.corpo.ombro * 0.62; // meia largura do tronco de perfil

    if (eq.capuz) {
      const cor = T(eq.capuz);
      trocar('capuz', (pc) => {
        if (costas) return;
        const dx = perfil ? -0.26 : vista === 'tq' ? -0.08 : 0, w = perfil ? 0.3 : 0.42;
        pc.peca(P((p) => { p.moveTo(dx - w, -0.06); p.quadraticCurveTo(dx - w - 0.02, -0.4, dx, -0.42); p.quadraticCurveTo(dx + w + 0.02, -0.4, dx + w, -0.06); p.closePath(); }), tomFixo(cor.sombra, cor.sombra), { sombra: 0 });
      });
      depois('tronco', (pc) => {
        // capuz caído nas costas / gola do capuz na frente
        if (costas) pc.peca(P((p) => { p.moveTo(-0.34, neckY + 0.02); p.quadraticCurveTo(0, neckY - 0.04, 0.34, neckY + 0.02); p.quadraticCurveTo(0.3, shoulderY + 0.5, 0, shoulderY + 0.58); p.quadraticCurveTo(-0.3, shoulderY + 0.5, -0.34, neckY + 0.02); p.closePath(); }), cor, { sombra: 0.1 });
        else if (!perfil) pc.peca(P((p) => { p.moveTo(cx - 0.36 * k, neckY + 0.03); p.quadraticCurveTo(cx, neckY + 0.3, cx + 0.36 * k, neckY + 0.03); p.lineTo(cx + 0.24 * k, neckY - 0.02); p.quadraticCurveTo(cx, neckY + 0.16, cx - 0.24 * k, neckY - 0.02); p.closePath(); }), cor, { sombra: 0.05 });
      });
    }

    if (eq.gola) {
      const cor = T(eq.gola);
      depois('tronco', (pc) => {
        if (perfil) { pc.peca(P((p) => { p.moveTo(-0.1, neckY); p.lineTo(d + 0.05, neckY + 0.06); p.lineTo(d + 0.08, shoulderY + 0.45); p.quadraticCurveTo(0.2, shoulderY + 0.4, 0.02, neckY + 0.12); p.closePath(); }), cor, { sombra: 0.08 }); return; }
        if (costas) return;
        // peitoral de couro com alças
        pc.peca(P((p) => { p.moveTo(cx - 0.3 * k, neckY + 0.06); p.lineTo(cx - 0.18 * k, neckY + 0.02); p.quadraticCurveTo(cx, neckY + 0.2, cx + 0.18 * k, neckY + 0.02); p.lineTo(cx + 0.3 * k, neckY + 0.06); p.lineTo(cx + 0.34 * k, shoulderY + 0.62); p.quadraticCurveTo(cx, shoulderY + 0.7, cx - 0.34 * k, shoulderY + 0.62); p.closePath(); }), cor, { sombra: 0.1 });
        pc.linha(P((p) => { p.moveTo(cx - 0.26 * k, shoulderY + 0.5); p.quadraticCurveTo(cx, shoulderY + 0.56, cx + 0.26 * k, shoulderY + 0.5); }));
        for (const sx of [-1, 1]) pc.peca(P((p) => p.arc(cx + sx * 0.24 * k, shoulderY + 0.14, 0.03, 0, Math.PI * 2)), T('mostarda'), { sombra: 0, espessura: pc.interno * 0.7 });
        costura(pc, P((p) => { p.moveTo(cx - 0.26 * k, neckY + 0.1); p.lineTo(cx - 0.3 * k, shoulderY + 0.56); p.quadraticCurveTo(cx, shoulderY + 0.63, cx + 0.3 * k, shoulderY + 0.56); p.lineTo(cx + 0.26 * k, neckY + 0.1); }));
        tachas(pc, [-0.16, -0.05, 0.05, 0.16].map((x) => [cx + x * k, shoulderY + 0.4]), T('pedra'), 0.018);
      });
    }

    if (eq.manto) {
      // manto de mago até acima do joelho, com abertura na frente e barra com runas
      const cor = T(eq.manto.cor), barra = T(eq.manto.barra || 'mostarda');
      depois('tronco', (pc) => {
        const y0 = hemY - 0.32 * f, y1 = 1.25 * f;
        if (perfil) {
          const forma = P((p) => { p.moveTo(-d - 0.02, y0); p.lineTo(d + 0.06, y0); p.lineTo(d + 0.2, y1); p.quadraticCurveTo(0, y1 + 0.05, -d - 0.12, y1); p.closePath(); });
          pc.peca(forma, cor, { sombra: 0.12 });
          pc.sombraDentro(forma, P((p) => p.rect(-1, y1 - 0.09, 2, 0.09)), barra.base);
          return;
        }
        const a = (hw + 0.02) * k, b = (hw + 0.16) * k;
        const forma = P((p) => { p.moveTo(-a, y0); p.lineTo(a, y0); p.lineTo(b, y1); p.quadraticCurveTo(0, y1 + 0.06, -b, y1); p.closePath(); });
        pc.peca(forma, cor, { sombra: 0.12 });
        pc.sombraDentro(forma, P((p) => p.rect(-1, y1 - 0.09, 2, 0.09)), barra.base);
        if (!costas) {
          // abertura na frente
          pc.preencher(P((p) => { p.moveTo(cx - 0.03, y1 + 0.02); p.lineTo(cx, 0.7 * f); p.lineTo(cx + 0.03, y1 + 0.02); p.closePath(); }), cor.sombra);
          pc.linha(P((p) => { p.moveTo(cx, 0.55 * f); p.lineTo(cx, y1); }));
          // runas na barra
          for (let i = -2; i <= 2; i++) if (i) pc.preencher(P((p) => { const x = cx + i * 0.16 * k, y = y1 - 0.045; p.moveTo(x, y - 0.03); p.lineTo(x + 0.025, y); p.lineTo(x, y + 0.03); p.lineTo(x - 0.025, y); p.closePath(); }), cor.sombra);
        }
      });
    }

    if (eq.cinto) {
      const cor = T(eq.cinto.cor), fiv = T(eq.cinto.fivela || 'mostarda');
      depois('tronco', (pc) => {
        const y = hemY - 0.26 * f, h = 0.1;
        if (perfil) {
          pc.peca(P((p) => p.roundRect(-d - 0.02, y, 2 * d + 0.08, h, 0.03)), cor, { sombra: 0.05 });
          if (eq.cinto.bolsa) pc.peca(P((p) => p.roundRect(-d - 0.06, y + 0.06, 0.2, 0.22, 0.05)), T(eq.cinto.bolsa), { sombra: 0.1 });
          return;
        }
        pc.peca(P((p) => p.roundRect(-(hw + 0.03) * k, y, 2 * (hw + 0.03) * k, h, 0.03)), cor, { sombra: 0.05 });
        if (costas) return;
        pc.peca(P((p) => p.roundRect(cx - 0.07, y - 0.015, 0.14, h + 0.03, 0.025)), fiv, { sombra: 0.05, espessura: pc.interno });
        pc.peca(P((p) => p.roundRect(cx - 0.035, y + 0.02, 0.07, h - 0.04, 0.01)), cor, { sombra: 0, espessura: pc.interno * 0.6 });
        if (eq.cinto.bolsa) {
          const bx = cx + (hw - 0.12) * k;
          pc.peca(P((p) => p.roundRect(bx - 0.11, y + 0.04, 0.22, 0.24, 0.05)), T(eq.cinto.bolsa), { sombra: 0.1 });
          pc.linha(P((p) => { p.moveTo(bx - 0.11, y + 0.12); p.quadraticCurveTo(bx, y + 0.16, bx + 0.11, y + 0.12); }));
        }
      });
    }

    if (eq.botas) {
      const cor = T(eq.botas.cor), cano = (eq.botas.cano || 0.42);
      const bota = (pc) => {
        const L = Lcanela, w = 0.2;
        pc.peca(P((p) => { p.moveTo(-w - 0.01, L - cano); p.lineTo(w + 0.01, L - cano); p.lineTo(w - 0.005, L); p.lineTo(-w + 0.005, L); p.closePath(); }), cor, { sombra: 0.08 });
        pc.peca(P((p) => p.roundRect(-w - 0.025, L - cano - 0.02, 2 * w + 0.05, 0.07, 0.025)), tomFixo(cor.sombra, cor.sombra), { sombra: 0, espessura: pc.interno });
      };
      depois('canela_d', bota); depois('canela_e', bota);
    }

    if (eq.bracadeira) {
      const cor = T(eq.bracadeira);
      const brac = (pc) => {
        pc.peca(P((p) => p.roundRect(-0.16, Lante - 0.32, 0.32, 0.3, 0.06)), cor, { sombra: 0.08 });
        pc.linha(P((p) => { p.moveTo(-0.13, Lante - 0.2); p.lineTo(0.13, Lante - 0.2); }));
        costura(pc, P((p) => { p.moveTo(-0.13, Lante - 0.29); p.lineTo(0.13, Lante - 0.29); p.moveTo(-0.13, Lante - 0.06); p.lineTo(0.13, Lante - 0.06); }));
        tachas(pc, [[-0.07, Lante - 0.13], [0.07, Lante - 0.13]], T('pedra'), 0.016);
      };
      depois('antebraco_d', brac); depois('antebraco_e', brac);
    }

    if (eq.magiaMaos) {
      // mago que conjura com as mãos: quando a pose tem _magia, as palmas acendem
      const cor = eq.magiaMaos.cor || '111,200,255';
      const brilho = (pc, rig) => {
        const forca = rig && rig.pose && rig.pose._magia;
        if (!forca) return;
        const y = 0.2;
        for (const [r, a] of [[0.42, 0.1], [0.3, 0.18], [0.2, 0.32], [0.12, 0.6]]) pc.preencher(P((p) => p.arc(0, y, r * forca, 0, Math.PI * 2)), `rgba(${cor},${a})`);
        pc.preencher(P((p) => p.arc(0, y, 0.06 * forca, 0, Math.PI * 2)), 'rgba(240,252,255,0.95)');
        for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3 + 0.3, r0 = 0.16 * forca, r1 = 0.3 * forca; pc.linha(P((p) => { p.moveTo(Math.cos(an) * r0, y + Math.sin(an) * r0); p.lineTo(Math.cos(an) * r1, y + Math.sin(an) * r1); }), pc.interno * 0.8, `rgba(${cor},0.8)`); }
      };
      depois('mao_d', brilho); depois('mao_e', brilho);
    }

    if (eq.cajado) {
      // cajado de iniciante: galho de madeira com um cristal pequeno preso por cordão
      const m = eq.cajado.mao || 'd', cr = eq.cajado.cristal || '#6FC8FF';
      const inc = eq.cajado.inclina ?? { frente: -0.13, tq: -0.16, perfil: -0.3, costas: -0.1 }[vista];
      const Q = (fn) => { const a = P(fn), out = new Path2D(); out.addPath(a, new DOMMatrix([1, 0, inc, 1, 0, 0])); return out; };
      depois('mao_' + m, (pc) => {
        pc.peca(Q((p) => { p.moveTo(-0.04, -2.45); p.quadraticCurveTo(0.03, -0.8, -0.02, 0.8); p.lineTo(0.05, 0.8); p.quadraticCurveTo(0.09, -0.8, 0.04, -2.45); p.closePath(); }), T('madeira'), { sombra: 0.12 });
        pc.peca(Q((p) => { p.moveTo(0.02, -2.40); p.quadraticCurveTo(-0.16, -2.52, -0.1, -2.72); p.lineTo(-0.06, -2.70); p.quadraticCurveTo(-0.1, -2.54, 0.04, -2.46); p.closePath(); }), T('madeira'), { sombra: 0.1 });
        pc.peca(Q((p) => { p.moveTo(0.1, -2.85); p.lineTo(0.16, -2.66); p.lineTo(0.1, -2.50); p.lineTo(0.04, -2.66); p.closePath(); }), tomFixo(cr, Estilo.multiply(cr, '#7A90C8'), '#E8F7FF'), { sombra: 0.1 });
        pc.preencher(Q((p) => p.arc(0.1, -2.67, 0.17, 0, Math.PI * 2)), cr.length === 7 ? cr + '33' : 'rgba(111,200,255,0.2)');
        pc.peca(Q((p) => p.roundRect(-0.07, -2.52, 0.16, 0.06, 0.02)), T('caqui'), { sombra: 0, espessura: pc.interno * 0.7 });
      });
    }

    if (eq.adagaCinto) {
      // adaga embainhada na cintura
      depois('tronco', (pc) => {
        if (costas || perfil) return;
        const x = cx - (hw - 0.05) * k, y = hemY - 0.2 * f;
        if (eq.adagaCinto && eq.adagaCinto.epica) {
          // Adaga Eclipse (épica): lâmina roxa à mostra, brilhando
          const pul = 1;
          pc.preencher(P((p) => p.ellipse(x + 0.08, y + 0.28, 0.22, 0.34, -0.3, 0, Math.PI * 2)), `rgba(155,92,255,${0.28 * pul})`);
          pc.peca(P((p) => { p.moveTo(x - 0.05, y); p.lineTo(x + 0.05, y); p.quadraticCurveTo(x + 0.14, y + 0.25, x + 0.12, y + 0.55); p.quadraticCurveTo(x + 0.02, y + 0.3, x - 0.05, y); p.closePath(); }), { base: '#9B5CFF', sombra: '#5B2DB8', luz: '#D9C2FF' }, { sombra: 0.15 });
          pc.peca(P((p) => p.roundRect(x - 0.12, y - 0.04, 0.24, 0.05, 0.02)), T('mostarda'), { sombra: 0 });
          pc.peca(P((p) => p.roundRect(x - 0.035, y - 0.2, 0.07, 0.17, 0.03)), T('carvao'), { sombra: 0.08 });
          return;
        }
        pc.peca(P((p) => { p.moveTo(x - 0.05, y); p.lineTo(x + 0.05, y); p.lineTo(x + 0.13, y + 0.42); p.lineTo(x + 0.06, y + 0.46); p.closePath(); }), T('couroEscuro'), { sombra: 0.1 });
        pc.peca(P((p) => p.roundRect(x - 0.1, y - 0.04, 0.2, 0.05, 0.02)), T('pedra'), { sombra: 0 });
        pc.peca(P((p) => p.roundRect(x - 0.035, y - 0.2, 0.07, 0.17, 0.03)), T('caqui'), { sombra: 0.08 });
      });
    }

    if (eq.arma) {
      const m = eq.arma.mao || 'd';
      depois('mao_' + m, (pc) => {
        if (eq.arma.tipo === 'adaga') {
          // adaga de iniciante: lâmina curta de ferro gasto, cabo enrolado em couro
          pc.peca(P((p) => p.roundRect(-0.045, 0.02, 0.09, 0.24, 0.03)), T('caqui'), { sombra: 0.1 });
          pc.peca(P((p) => p.roundRect(-0.13, 0.24, 0.26, 0.05, 0.02)), T('pedra'), { sombra: 0.05 });
          pc.peca(P((p) => { p.moveTo(-0.055, 0.29); p.lineTo(0.055, 0.29); p.lineTo(0.035, 0.66); p.lineTo(0, 0.74); p.lineTo(-0.035, 0.66); p.closePath(); }), tomFixo('#B8BDC6', '#7E8590', '#E6E9EE'), { sombra: 0.15 });
          pc.linha(P((p) => { p.moveTo(0, 0.31); p.lineTo(0, 0.66); }), pc.interno * 0.6, 'rgba(70,74,84,0.5)');
          pc.preencher(P((p) => { p.ellipse(0.022, 0.5, 0.012, 0.03, 0, 0, Math.PI * 2); }), 'rgba(160,96,60,0.55)'); // ferrugem
        } else {
          // espada de madeira
          pc.peca(P((p) => p.roundRect(-0.045, 0.02, 0.09, 0.24, 0.03)), T('carvao'), { sombra: 0.1 });
          pc.peca(P((p) => p.roundRect(-0.15, 0.24, 0.3, 0.06, 0.02)), T('madeira'), { sombra: 0.05 });
          pc.peca(P((p) => { p.moveTo(-0.07, 0.3); p.lineTo(0.07, 0.3); p.lineTo(0.06, 0.95); p.lineTo(0, 1.03); p.lineTo(-0.06, 0.95); p.closePath(); }), T('madeiraClara'), { sombra: 0.12 });
          pc.linha(P((p) => { p.moveTo(-0.02, 0.4); p.lineTo(-0.02, 0.6); p.moveTo(0.025, 0.55); p.lineTo(0.025, 0.85); }), pc.interno * 0.6);
        }
      });
    }

    if (eq.escudo) {
      const cor = T(eq.escudo.cor), borda = T(eq.escudo.borda || 'pedra');
      const desenhaEscudo = (pc) => {
        const y = Lante * 0.55, R = 0.36, rx = perfil ? R * 0.35 : vista === 'tq' ? R * 0.75 : R;
        pc.peca(P((p) => p.ellipse(0, y, rx + 0.05, R + 0.05, 0, 0, Math.PI * 2)), borda, { sombra: 0.08 });
        pc.peca(P((p) => p.ellipse(0, y, rx, R, 0, 0, Math.PI * 2)), cor, { sombra: 0.14 });
        if (!perfil) {
          // tábuas e rebites
          pc.linha(P((p) => { for (const t of [-0.33, 0.33]) { p.moveTo(t * rx, y - R * 0.92); p.lineTo(t * rx, y + R * 0.92); } }));
          for (const a of [0, 1, 2, 3]) { const an = a * Math.PI / 2 + Math.PI / 4; pc.peca(P((p) => p.arc(Math.cos(an) * rx * 0.82, y + Math.sin(an) * R * 0.82, 0.025, 0, Math.PI * 2)), borda, { sombra: 0, espessura: pc.interno * 0.6 }); }
          pc.peca(P((p) => p.ellipse(0, y, rx * 0.26, R * 0.26, 0, 0, Math.PI * 2)), borda, { sombra: 0.1 });
          if (eq.escudo.emblema) pc.peca(P((p) => { p.moveTo(0, y - R * 0.16); p.lineTo(rx * 0.13, y); p.lineTo(0, y + R * 0.16); p.lineTo(-rx * 0.13, y); p.closePath(); }), T(eq.escudo.emblema), { sombra: 0, espessura: pc.interno * 0.6 });
        }
      };
      if (costas) depois('tronco', (pc) => desenhaEscudoCostas(pc));
      else depois('antebraco_e', desenhaEscudo);
      function desenhaEscudoCostas(pc) {
        const y = shoulderY + 0.75, R = 0.42;
        pc.peca(P((p) => p.ellipse(0, y, R + 0.05, R + 0.05, 0, 0, Math.PI * 2)), borda, { sombra: 0.08 });
        pc.peca(P((p) => p.ellipse(0, y, R, R, 0, 0, Math.PI * 2)), cor, { sombra: 0.14 });
        pc.linha(P((p) => { for (const t of [-0.33, 0.33]) { p.moveTo(t * R, y - R * 0.92); p.lineTo(t * R, y + R * 0.92); } }));
      }
    }
    // luvas do conjurador (item raro): luva azul com punho dourado e runa que brilha
    if (eq.luvas) {
      const cor = T(eq.luvas.cor || 'azulArdosia'), punho = T(eq.luvas.punho || 'mostarda'), brilho = eq.luvas.brilho || '120,200,255';
      const luva = (pc, rig) => {
        pc.peca(P((p) => { p.moveTo(-0.115, -0.03); p.lineTo(0.115, -0.03); p.quadraticCurveTo(0.155, 0.16, 0.12, 0.31); p.quadraticCurveTo(0.065, 0.43, -0.03, 0.4); p.quadraticCurveTo(-0.12, 0.37, -0.12, 0.24); p.closePath(); }), cor, { sombra: 0.1 });
        pc.peca(P((p) => p.roundRect(-0.135, -0.07, 0.27, 0.1, 0.03)), punho, { sombra: 0.05 });
        pc.linha(P((p) => { p.moveTo(-0.02, 0.24); p.lineTo(0.0, 0.33); p.moveTo(0.05, 0.22); p.lineTo(0.06, 0.32); }), pc.interno, 'rgba(0,0,0,0.3)');
        if (pc.modo !== 'contorno') { const g = pc.ctx.createRadialGradient(0, 0.13, 0, 0, 0.13, 0.12); g.addColorStop(0, `rgba(${brilho},0.95)`); g.addColorStop(1, `rgba(${brilho},0)`); pc.preencher(P((p) => p.arc(0, 0.13, 0.12, 0, Math.PI * 2)), g); pc.preencher(P((p) => { p.moveTo(0, 0.08); p.lineTo(0.035, 0.13); p.lineTo(0, 0.18); p.lineTo(-0.035, 0.13); p.closePath(); }), '#EAF8FF'); }
      };
      depois('mao_d', luva); depois('mao_e', luva);
    }
    // peitoral de couro em faixas horizontais com tachas e costura (assassino da referência 3D)
    if (eq.peitoral) {
      const cor = T(eq.peitoral.cor), tc = T(eq.peitoral.tachas || 'prata'), n = eq.peitoral.faixas || 3;
      depois('tronco', (pc) => {
        const y0 = shoulderY + 0.1, y1 = hemY - 0.36 * f;
        if (perfil) { const forma = P((p) => p.roundRect(-d * 0.85, y0, d * 1.85, y1 - y0, 0.06)); pc.peca(forma, cor, { sombra: 0.12 }); for (let i = 1; i <= n; i++) { const y = y0 + (y1 - y0) * (i / (n + 1)); pc.linha(P((p) => { p.moveTo(-d * 0.85, y); p.lineTo(d, y); })); tachas(pc, [-0.1, 0.08, 0.26].map((x) => [x, y + 0.05]), tc, 0.018); } return; }
        const a = (hw - 0.03) * k, x0 = cx - a, x1 = cx + a;
        const forma = P((p) => { p.moveTo(x0, y0 + 0.04); if (!costas) { p.lineTo(cx - 0.14 * k, y0); p.lineTo(cx, y0 + 0.16); p.lineTo(cx + 0.14 * k, y0); } p.lineTo(x1, y0 + 0.04); p.lineTo(x1 + 0.02 * k, y1); p.quadraticCurveTo(cx, y1 + 0.05, x0 - 0.02 * k, y1); p.closePath(); });
        pc.peca(forma, cor, { sombra: 0.14 });
        for (let i = 1; i <= n; i++) {
          const y = y0 + 0.1 + (y1 - y0 - 0.1) * (i / (n + 1));
          pc.sombraDentro(forma, P((p) => p.rect(x0 - 0.1, y - 0.035, 2 * a + 0.2, 0.035)), 'rgba(0,0,0,0.28)');
          pc.linha(P((p) => { p.moveTo(x0, y); p.quadraticCurveTo(cx, y + 0.03, x1, y); }));
          tachas(pc, [-0.7, -0.35, 0.35, 0.7].map((t) => [cx + t * a, y + 0.06]), tc, 0.02);
        }
        costura(pc, P((p) => { p.moveTo(x0 + 0.05, y0 + 0.1); p.lineTo(x0 + 0.04, y1 - 0.05); p.moveTo(x1 - 0.05, y0 + 0.1); p.lineTo(x1 - 0.04, y1 - 0.05); }));
        if (!costas) { pc.linha(P((p) => { p.moveTo(cx, y0 + 0.18); p.lineTo(cx, y1); })); for (let i = 0; i < 4; i++) { const y = y0 + 0.24 + i * (y1 - y0 - 0.3) / 4; pc.linha(P((p) => { p.moveTo(cx - 0.05, y); p.lineTo(cx + 0.05, y + 0.07); p.moveTo(cx + 0.05, y); p.lineTo(cx - 0.05, y + 0.07); }), pc.interno * 0.9, 'rgba(230,210,180,0.8)'); } }
      });
    }
    // cinta de couro cruzada no peito, com tachas e bolsinha (referências 3D: couro com cintas, fivelas e tachas)
    if (eq.cinta) {
      const cor = T(eq.cinta.cor), tacha = T(eq.cinta.tachas || 'prata');
      depois('tronco', (pc) => {
        if (perfil) return;
        const s = costas ? -1 : 1, x0 = cx + s * (-hw * 0.78) * k, y0 = shoulderY + 0.06, x1 = cx + s * (hw * 0.82) * k, y1 = hemY - 0.3 * f, w = 0.075;
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * w, ny = dx / L * w;
        pc.peca(P((p) => { p.moveTo(x0 - nx, y0 - ny); p.lineTo(x1 - nx, y1 - ny); p.lineTo(x1 + nx, y1 + ny); p.lineTo(x0 + nx, y0 + ny); p.closePath(); }), cor, { sombra: 0.06, espessura: pc.interno * 1.2 });
        costura(pc, P((p) => { p.moveTo(x0 - nx * 0.6, y0 - ny * 0.6); p.lineTo(x1 - nx * 0.6, y1 - ny * 0.6); p.moveTo(x0 + nx * 0.6, y0 + ny * 0.6); p.lineTo(x1 + nx * 0.6, y1 + ny * 0.6); }));
        tachas(pc, [1, 2, 3, 4, 5].map((i) => [x0 + dx * i / 6, y0 + dy * i / 6]), tacha, 0.02);
        const fx = x0 + dx * 0.5, fy = y0 + dy * 0.5;
        pc.peca(P((p) => p.roundRect(fx - 0.06, fy - 0.06, 0.12, 0.12, 0.02)), tacha, { sombra: 0.05, espessura: pc.interno * 0.7 });
        if (eq.cinta.bolsa && !costas) pc.peca(P((p) => p.roundRect(x1 - 0.12, y1 - 0.02, 0.22, 0.2, 0.05)), T(eq.cinta.bolsa), { sombra: 0.1 });
      });
    }
    // ombreira com rebites no ombro do braço da frente
    if (eq.ombreira) {
      const cor = T(eq.ombreira.cor), reb = T(eq.ombreira.rebites || 'prata');
      for (const nome of ['braco_d', 'braco_e']) depois(nome, (pc) => {
        pc.peca(P((p) => { p.moveTo(-0.22, 0.02); p.quadraticCurveTo(-0.24, -0.16, 0, -0.18); p.quadraticCurveTo(0.24, -0.16, 0.22, 0.02); p.quadraticCurveTo(0.24, Lbraco * 0.38, 0, Lbraco * 0.42); p.quadraticCurveTo(-0.24, Lbraco * 0.38, -0.22, 0.02); p.closePath(); }), cor, { sombra: 0.12 });
        pc.linha(P((p) => { p.moveTo(-0.2, Lbraco * 0.16); p.quadraticCurveTo(0, Lbraco * 0.2, 0.2, Lbraco * 0.16); }), pc.interno, 'rgba(0,0,0,0.35)');
        costura(pc, P((p) => { p.moveTo(-0.18, 0.0); p.quadraticCurveTo(-0.19, -0.12, 0, -0.14); p.quadraticCurveTo(0.19, -0.12, 0.18, 0.0); }));
        for (const [x, y] of [[-0.13, -0.04], [0.13, -0.04], [0, Lbraco * 0.3]]) pc.peca(P((p) => p.arc(x, y, 0.025, 0, Math.PI * 2)), reb, { sombra: 0, espessura: pc.interno * 0.5 });
      });
    }
    return def;
  };
})();

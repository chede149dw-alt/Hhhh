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
    // ===== Parte 3: roupas novas do loot =====
    // Manto do Arcano (épico, Davi): casaco longo de mago com abas até o joelho, bordado dourado, runas que brilham,
    // gola alta, capa curta nos ombros com broche e faixa de pano na cintura.
    if (eq.casaco) {
      const cor = T(eq.casaco.cor || 'azulArcano'), forro = T(eq.casaco.forro || 'vinhoFaixa'), bord = T(eq.casaco.bordado || 'ouroBordado'), runa = eq.casaco.runa || '127,230,255';
      const trim = (pc, path, w = 0.05) => { if (pc.modo === 'contorno') return; pc.linha(path, w, bord.base); pc.linha(path, w * 0.3, 'rgba(255,240,190,0.75)'); };
      const runaBrilho = (pc, x, y, s0 = 0.035) => { if (pc.modo === 'contorno') return; const g = pc.ctx.createRadialGradient(x, y, 0, x, y, s0 * 2.4); g.addColorStop(0, `rgba(${runa},0.85)`); g.addColorStop(1, `rgba(${runa},0)`); pc.preencher(P((p) => p.arc(x, y, s0 * 2.4, 0, Math.PI * 2)), g); pc.linha(P((p) => { p.moveTo(x, y - s0); p.lineTo(x + s0 * 0.7, y); p.lineTo(x, y + s0); p.lineTo(x - s0 * 0.7, y); p.closePath(); p.moveTo(x, y - s0 * 1.3); p.lineTo(x, y + s0 * 1.3); }), 0.012, '#EFFFFF'); };
      // punhos largos com bordado nas mangas
      for (const nome of ['antebraco_d', 'antebraco_e']) depois(nome, (pc) => {
        const ya = Lante * 0.5, yb = Lante + 0.02;
        const f0 = P((p) => { p.moveTo(-0.13, ya); p.lineTo(0.13, ya); p.lineTo(0.2, yb); p.quadraticCurveTo(0, yb + 0.05, -0.2, yb); p.closePath(); });
        pc.peca(f0, cor, { sombra: 0.12 });
        trim(pc, P((p) => { p.moveTo(-0.19, yb - 0.035); p.quadraticCurveTo(0, yb + 0.01, 0.19, yb - 0.035); }), 0.04);
      });
      // capa curta no ombro (por cima do braço)
      for (const nome of ['braco_d', 'braco_e']) depois(nome, (pc) => {
        const f0 = P((p) => { p.moveTo(-0.24, 0.0); p.quadraticCurveTo(-0.26, -0.18, 0, -0.2); p.quadraticCurveTo(0.26, -0.18, 0.24, 0.0); p.lineTo(0.22, Lbraco * 0.42); p.quadraticCurveTo(0.11, Lbraco * 0.5, 0, Lbraco * 0.44); p.quadraticCurveTo(-0.11, Lbraco * 0.5, -0.22, Lbraco * 0.42); p.closePath(); });
        pc.peca(f0, cor, { sombra: 0.14 });
        trim(pc, P((p) => { p.moveTo(-0.21, Lbraco * 0.4); p.quadraticCurveTo(-0.11, Lbraco * 0.47, 0, Lbraco * 0.41); p.quadraticCurveTo(0.11, Lbraco * 0.47, 0.21, Lbraco * 0.4); }), 0.04);
      });
      depois('tronco', (pc) => {
        const y0 = shoulderY + 0.02, yc = hemY - 0.28 * f, y1 = 1.72 * f;
        if (perfil) {
          const forma = P((p) => { p.moveTo(-d - 0.04, y0); p.lineTo(d + 0.06, y0); p.lineTo(d + 0.1, yc); p.lineTo(d + 0.24, y1); p.quadraticCurveTo(0, y1 + 0.06, -d - 0.16, y1); p.lineTo(-d - 0.06, yc); p.closePath(); });
          pc.peca(forma, cor, { sombra: 0.14 });
          trim(pc, P((p) => { p.moveTo(d + 0.22, y1 - 0.03); p.quadraticCurveTo(0, y1 + 0.03, -d - 0.14, y1 - 0.03); }));
          trim(pc, P((p) => { p.moveTo(d + 0.06, y0 + 0.05); p.lineTo(d + 0.22, y1 - 0.04); }), 0.04);
          pc.peca(P((p) => p.roundRect(-d - 0.06, yc - 0.06, 2 * d + 0.14, 0.12, 0.03)), forro, { sombra: 0.06 });
          pc.peca(P((p) => { p.moveTo(-0.02, neckY + 0.04); p.lineTo(0.02, neckY - 0.2); p.lineTo(0.16, neckY - 0.08); p.lineTo(0.14, neckY + 0.06); p.closePath(); }), cor, { sombra: 0.1 });
          runaBrilho(pc, 0.06, y1 - 0.12);
          return;
        }
        const a = (hw + 0.05) * k, b = (hw + 0.2) * k;
        if (costas) {
          const forma = P((p) => { p.moveTo(-a, y0); p.lineTo(a, y0); p.lineTo(a + 0.02, yc); p.lineTo(b, y1); p.quadraticCurveTo(0, y1 + 0.07, -b, y1); p.lineTo(-a - 0.02, yc); p.closePath(); });
          pc.peca(forma, cor, { sombra: 0.14 });
          trim(pc, P((p) => { p.moveTo(b - 0.02, y1 - 0.035); p.quadraticCurveTo(0, y1 + 0.035, -b + 0.02, y1 - 0.035); }));
          pc.peca(P((p) => p.roundRect(-a - 0.02, yc - 0.06, 2 * a + 0.04, 0.12, 0.03)), forro, { sombra: 0.06 });
          for (const x of [-0.18, 0, 0.18]) runaBrilho(pc, x * k, y1 - 0.13);
          const cap = P((p) => { p.moveTo(-0.3, neckY + 0.02); p.quadraticCurveTo(0, neckY - 0.06, 0.3, neckY + 0.02); p.quadraticCurveTo(0.32, shoulderY + 0.42, 0, shoulderY + 0.55); p.quadraticCurveTo(-0.32, shoulderY + 0.42, -0.3, neckY + 0.02); p.closePath(); });
          pc.peca(cap, cor, { sombra: 0.16 }); pc.sombraDentro(cap, P((p) => p.rect(-0.4, neckY - 0.1, 0.8, 0.12)), forro.base);
          trim(pc, P((p) => { p.moveTo(-0.28, neckY + 0.05); p.quadraticCurveTo(0.3, shoulderY + 0.38, 0, shoulderY + 0.53); }), 0.03);
          // gola alta por trás
          pc.peca(P((p) => { p.moveTo(-0.3, neckY + 0.06); p.quadraticCurveTo(-0.34, neckY - 0.22, 0, neckY - 0.24); p.quadraticCurveTo(0.34, neckY - 0.22, 0.3, neckY + 0.06); p.closePath(); }), cor, { sombra: 0.1 });
          return;
        }
        // duas metades do casaco (abrem em V no peito e se abrem nas abas, mostrando a túnica e as pernas)
        const meia = (s) => P((p) => { const X = (x) => cx + s * x; p.moveTo(X(0.15 * k), neckY + 0.04); p.lineTo(X(a), y0); p.lineTo(X(a + 0.02), yc); p.lineTo(X(b), y1); p.quadraticCurveTo(X((a + 0.02) * 0.55), y1 + 0.06, X(0.07), y1 - 0.03); p.lineTo(X(0.03), yc + 0.08); p.lineTo(X(0.02), yc - 0.22); p.closePath(); });
        for (const s of [-1, 1]) {
          const fm = meia(s); pc.peca(fm, cor, { sombra: 0.14 });
          // forro aparecendo na dobra da aba
          pc.sombraDentro(fm, P((p) => { const X = (x) => cx + s * x; p.moveTo(X(0.02), yc + 0.06); p.lineTo(X(0.13), y1); p.lineTo(X(0.02), y1); p.closePath(); }), forro.base);
          trim(pc, P((p) => { const X = (x) => cx + s * x; p.moveTo(X(0.15 * k), neckY + 0.06); p.lineTo(X(0.03), yc - 0.2); p.lineTo(X(0.04), yc + 0.08); p.lineTo(X(0.08), y1 - 0.04); p.quadraticCurveTo(X((a + 0.02) * 0.55), y1 + 0.03, X(b - 0.02), y1 - 0.02); }));
          for (let i = 0; i < 3; i++) runaBrilho(pc, cx + s * (0.15 + i * 0.09) * k, y1 - 0.13 - i * 0.01, 0.03);
          if (pc.modo !== 'contorno') { const X = (x) => cx + s * x * k; pc.linha(P((p) => { p.moveTo(X(0.12), y0 + 0.12); p.bezierCurveTo(X(0.3), y0 + 0.1, X(0.32), y0 + 0.3, X(0.2), y0 + 0.32); p.bezierCurveTo(X(0.12), y0 + 0.33, X(0.13), y0 + 0.22, X(0.21), y0 + 0.23); p.moveTo(X(0.08), y0 + 0.42); p.bezierCurveTo(X(0.26), y0 + 0.4, X(0.3), y0 + 0.56, X(0.18), y0 + 0.6); }), 0.022, bord.base); pc.linha(P((p) => { p.moveTo(X(a / k - 0.05), y0 + 0.05); p.lineTo(X(a / k - 0.03), yc - 0.08); }), 0.03, bord.base); }
          // bordado em losangos descendo na frente
          if (pc.modo !== 'contorno') for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5, x = cx + s * (0.05 + 0.04 * t), y = yc + 0.12 + (y1 - yc - 0.25) * t; pc.preencher(P((p) => { p.moveTo(x + s * 0.045, y - 0.03); p.lineTo(x + s * 0.075, y); p.lineTo(x + s * 0.045, y + 0.03); p.lineTo(x + s * 0.015, y); p.closePath(); }), bord.base); }
        }
        // faixa de pano na cintura com pontas caindo e bolsinha
        pc.peca(P((p) => p.roundRect(cx - a - 0.02, yc - 0.065, 2 * a + 0.04, 0.13, 0.03)), forro, { sombra: 0.08 });
        pc.linha(P((p) => { p.moveTo(cx - a, yc + 0.0); p.quadraticCurveTo(cx, yc + 0.03, cx + a, yc + 0.0); }), pc.interno, 'rgba(0,0,0,0.25)');
        pc.peca(P((p) => { p.moveTo(cx + 0.18 * k, yc + 0.03); p.quadraticCurveTo(cx + 0.24 * k, yc + 0.3, cx + 0.2 * k, yc + 0.48); p.lineTo(cx + 0.3 * k, yc + 0.45); p.quadraticCurveTo(cx + 0.31 * k, yc + 0.25, cx + 0.28 * k, yc + 0.03); p.closePath(); }), forro, { sombra: 0.1 });
        trim(pc, P((p) => { p.moveTo(cx + 0.2 * k, yc + 0.47); p.lineTo(cx + 0.3 * k, yc + 0.44); }), 0.03);
        pc.peca(P((p) => p.roundRect(cx - a + 0.02, yc + 0.03, 0.2, 0.2, 0.05)), T('couroEscuro'), { sombra: 0.1 });
        // gola alta (duas abas em pé dos lados do pescoço, forro por dentro)
        for (const s of [-1, 1]) {
          const X = (x) => cx + s * x;
          pc.peca(P((p) => { p.moveTo(X(0.13 * k), neckY + 0.06); p.lineTo(X(0.3 * k), neckY - 0.18); p.quadraticCurveTo(X(0.36 * k), neckY - 0.02, X(0.32 * k), neckY + 0.08); p.closePath(); }), cor, { sombra: 0.08 });
          pc.preencher(P((p) => { p.moveTo(X(0.16 * k), neckY + 0.04); p.lineTo(X(0.29 * k), neckY - 0.14); p.lineTo(X(0.28 * k), neckY + 0.02); p.closePath(); }), forro.base);
          trim(pc, P((p) => { p.moveTo(X(0.3 * k), neckY - 0.18); p.quadraticCurveTo(X(0.36 * k), neckY - 0.02, X(0.32 * k), neckY + 0.08); }), 0.03);
        }
        // broche com gema na capa
        pc.peca(P((p) => p.arc(cx, neckY + 0.2, 0.055, 0, Math.PI * 2)), bord, { sombra: 0.05 });
        runaBrilho(pc, cx, neckY + 0.2, 0.028);
      });
    }
    // Colete do Guardião (épico, Téo): colete de couro aberto com cordão, placas de aço no peito, gola de pelo.
    if (eq.colete) {
      const cor = T(eq.colete.cor || 'couroGuardiao'), aco = T(eq.colete.placas || 'acoGuardiao'), pelo = T(eq.colete.pelo || 'peloGuardiao');
      const placa = (pc, x, y, w, h) => { const f0 = P((p) => p.roundRect(x - w / 2, y - h / 2, w, h, 0.035)); pc.peca(f0, aco, { sombra: 0.18 }); if (pc.modo !== 'contorno') { pc.preencher(P((p) => p.roundRect(x - w / 2 + 0.02, y - h / 2 + 0.015, w - 0.04, h * 0.25, 0.02)), 'rgba(255,255,255,0.35)'); for (const sx of [-1, 1]) pc.preencher(P((p) => p.arc(x + sx * (w / 2 - 0.03), y + h / 2 - 0.03, 0.015, 0, Math.PI * 2)), '#E8D9A8'); } };
      const pelagem = (pc, x0, x1, y, alt) => { const f0 = P((p) => { p.moveTo(x0, y); const n = 9; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * (i / n); p.lineTo(x, y - alt * (i % 2 ? 1.25 : 0.65)); } p.lineTo(x1, y + alt * 0.5); for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * (i / n); p.lineTo(x + 0.01, y + alt * (i % 2 ? 0.9 : 0.55)); } p.closePath(); }); pc.peca(f0, pelo, { sombra: 0.12 }); if (pc.modo !== 'contorno') for (let i = 0; i < 9; i++) { const x = x0 + (x1 - x0) * ((i + 0.5) / 9); pc.linha(P((p) => { p.moveTo(x, y + alt * 0.3); p.lineTo(x + 0.015, y - alt * 0.6); }), 0.012, 'rgba(255,235,200,0.45)'); } };
      depois('tronco', (pc) => {
        const y0 = shoulderY + 0.02, y1 = hemY - 0.08 * f;
        if (perfil) { const forma = P((p) => p.roundRect(-d * 0.9, y0, d * 1.9, y1 - y0, 0.05)); pc.peca(forma, cor, { sombra: 0.14 }); placa(pc, d * 0.35, y0 + 0.3, 0.26, 0.2); placa(pc, d * 0.35, y0 + 0.52, 0.26, 0.2); pelagem(pc, -d - 0.05, d + 0.08, neckY + 0.08, 0.09); return; }
        const a = (hw + 0.035) * k;
        if (costas) { const forma = P((p) => p.roundRect(cx - a, y0, 2 * a, y1 - y0, 0.06)); pc.peca(forma, cor, { sombra: 0.14 }); costura(pc, P((p) => { p.moveTo(cx, y0 + 0.08); p.lineTo(cx, y1 - 0.05); })); pelagem(pc, cx - a - 0.06, cx + a + 0.06, neckY + 0.08, 0.1); return; }
        for (const s of [-1, 1]) {
          const X = (x) => cx + s * x;
          const fm = P((p) => { p.moveTo(X(0.12 * k), neckY + 0.06); p.lineTo(X(a), y0); p.lineTo(X(a + 0.02), y1); p.quadraticCurveTo(X(a * 0.5), y1 + 0.04, X(0.04), y1 - 0.02); p.lineTo(X(0.04), y0 + 0.16); p.closePath(); });
          pc.peca(fm, cor, { sombra: 0.14 });
          costura(pc, P((p) => { p.moveTo(X(a - 0.04), y0 + 0.06); p.lineTo(X(a - 0.03), y1 - 0.04); p.moveTo(X(0.08), y0 + 0.18); p.lineTo(X(0.08), y1 - 0.05); p.quadraticCurveTo(X(a * 0.5), y1 - 0.0, X(a - 0.03), y1 - 0.04); }));
          // placas de aço sobrepostas em duas fileiras
          for (let i = 0; i < 3; i++) placa(pc, X((0.19 + 0.015 * i) * k), y0 + 0.24 + i * 0.17, 0.2 * k, 0.15);
        }
        // cordão cruzado na abertura
        if (pc.modo !== 'contorno') for (let i = 0; i < 4; i++) { const y = y0 + 0.22 + i * 0.13; pc.linha(P((p) => { p.moveTo(cx - 0.05, y); p.lineTo(cx + 0.05, y + 0.08); p.moveTo(cx + 0.05, y); p.lineTo(cx - 0.05, y + 0.08); }), 0.02, '#D8C39A'); }
        // gola de pelo nos ombros
        pelagem(pc, cx - a - 0.1, cx + a + 0.1, neckY + 0.12, 0.15);
        pelagem(pc, cx - a - 0.02, cx + a + 0.02, neckY + 0.16, 0.1);
      });
    }
    // ===== Parte 3 · opções de roupa do Téo =====
    const borda = (pc, path, cor, w = 0.035) => { if (pc.modo === 'contorno') return; pc.linha(path, w, cor); pc.linha(path, w * 0.3, 'rgba(255,245,210,0.6)'); };
    // capa atrás do corpo (na vista de costas, por cima das costas)
    if (eq.capa) {
      const cor = T(eq.capa.cor || 'verdeEscuro'), bc = T(eq.capa.borda || 'ouroBordado').base;
      def.partes.push({ nome: 'capa', pai: 'tronco', pivo: [0, 0], z: costas ? 7.6 : 0.3, desenhar: (pc, rig) => {
        const y0 = neckY + 0.04, y1 = 2.2 * f, a0 = (hw + 0.02) * k, a1 = (hw + 0.34) * k;
        // vento e movimento: a barra ondula; andando, a capa voa um pouco para trás; fica pendurada para baixo quando o corpo inclina
        const tt = window.TEMPO_PERSONAGEM || 0, mov = window.MOVIMENTO_PERSONAGEM || 0, pose = (rig && rig.pose) || {};
        const w1 = 0.05 * Math.sin(tt * 2.1) + 0.07 * mov * Math.sin(tt * 6.3), w2 = 0.05 * Math.sin(tt * 2.1 + 1.7) + 0.07 * mov * Math.sin(tt * 6.3 + 2), atras = 0.22 * mov;
        const incl = ((pose.tronco || 0) + (pose.quadril || 0)) * Math.PI / 180 * 0.85;
        pc.ctx.save(); pc.ctx.translate(cx, y0); pc.ctx.rotate(-incl); pc.ctx.translate(-cx, -y0);
        const forma = perfil ? P((p) => { p.moveTo(-d * 0.4, y0); p.lineTo(-d - 0.04, y0 + 0.08); p.quadraticCurveTo(-d - 0.4 - atras * 0.5, y1 * 0.6, -d - 0.32 - atras + w1, y1 - atras * 0.4); p.quadraticCurveTo(-d * 0.6 - atras * 0.5, y1 + 0.06 + w2 * 0.5, -d * 0.2 - atras * 0.3, y1 + 0.02 - atras * 0.3); p.closePath(); })
          : P((p) => { p.moveTo(cx - a0, y0); p.lineTo(cx + a0, y0); p.quadraticCurveTo(cx + a1, y1 * 0.5, cx + a1 + w1, y1); p.quadraticCurveTo(cx + a1 * 0.5, y1 + 0.05 + w2 * 0.6, cx, y1 - 0.02 + w1 * 0.4); p.quadraticCurveTo(cx - a1 * 0.5, y1 + 0.05 - w1 * 0.6, cx - a1 + w2, y1); p.quadraticCurveTo(cx - a1, y1 * 0.5, cx - a0, y0); p.closePath(); });
        pc.peca(forma, cor, { sombra: 0.18 });
        if (costas) { pc.linha(P((p) => { p.moveTo(cx - 0.1, y0 + 0.2); p.quadraticCurveTo(cx - 0.16, y1 * 0.6, cx - 0.2 + w2 * 0.5, y1 - 0.05); p.moveTo(cx + 0.12, y0 + 0.2); p.quadraticCurveTo(cx + 0.18, y1 * 0.6, cx + 0.24 + w1 * 0.5, y1 - 0.05); }), pc.interno, 'rgba(0,0,0,0.25)'); borda(pc, P((p) => { p.moveTo(cx - a1 + w2, y1 - 0.03); p.quadraticCurveTo(cx - a1 * 0.5, y1 + 0.02 - w1 * 0.6, cx, y1 - 0.05 + w1 * 0.4); p.quadraticCurveTo(cx + a1 * 0.5, y1 + 0.02 + w2 * 0.6, cx + a1 + w1, y1 - 0.03); }), bc, 0.045); }
        pc.ctx.restore();
      } });
    }
    // malha de aço nas mangas (escamas em arco)
    if (eq.malha) {
      const tom = T(eq.malha === true ? 'cinzaMalha' : eq.malha);
      const escamas = (pc, L) => { if (pc.modo === 'contorno') return; for (let r = 0; r < 7; r++) for (let i = -2; i <= 2; i++) { const x = i * 0.08 + (r % 2) * 0.04, y = 0.03 + r * L / 7; if (Math.abs(x) > 0.17) continue; pc.linha(P((p) => p.arc(x, y, 0.045, 0.1 * Math.PI, 0.9 * Math.PI)), 0.012, 'rgba(20,24,32,0.45)'); pc.linha(P((p) => p.arc(x, y - 0.008, 0.04, 0.2 * Math.PI, 0.5 * Math.PI)), 0.008, 'rgba(255,255,255,0.35)'); } };
      depois('braco_d', (pc) => escamas(pc, Lbraco)); depois('braco_e', (pc) => escamas(pc, Lbraco));
      depois('antebraco_d', (pc) => escamas(pc, Lante * 0.6)); depois('antebraco_e', (pc) => escamas(pc, Lante * 0.6));
    }
    // peitoral de aço moldado (crista no meio, brilho, borda dourada, emblema)
    if (eq.peitoralAco) {
      const cor = T(eq.peitoralAco.cor || 'acoGuardiao'), bc = T(eq.peitoralAco.borda || 'ouroBordado').base;
      depois('tronco', (pc) => {
        const y0 = shoulderY + 0.02, y1 = hemY - 0.3 * f;
        if (perfil) { const fm = P((p) => { p.moveTo(-d * 0.7, y0); p.quadraticCurveTo(d + 0.16, y0 + 0.05, d + 0.1, (y0 + y1) / 2); p.quadraticCurveTo(d + 0.02, y1, -d * 0.6, y1); p.closePath(); }); pc.peca(fm, cor, { sombra: 0.2 }); borda(pc, fm, bc); return; }
        const a = (hw - 0.01) * k, b = (hw - 0.09) * k;
        const fm = P((p) => { p.moveTo(cx - a, y0 + 0.04); if (!costas) { p.lineTo(cx - 0.15 * k, y0); p.quadraticCurveTo(cx, y0 + 0.12, cx + 0.15 * k, y0); } p.lineTo(cx + a, y0 + 0.04); p.quadraticCurveTo(cx + a + 0.03, (y0 + y1) / 2, cx + b, y1); p.quadraticCurveTo(cx, y1 + 0.06, cx - b, y1); p.quadraticCurveTo(cx - a - 0.03, (y0 + y1) / 2, cx - a, y0 + 0.04); p.closePath(); });
        pc.peca(fm, cor, { sombra: 0.22 });
        if (pc.modo !== 'contorno') {
          pc.sombraDentro(fm, P((p) => p.rect(cx - a - 0.1, y0, a * 0.55, y1 - y0 + 0.1)), 'rgba(255,255,255,0.22)');
          if (!costas) { pc.linha(P((p) => { p.moveTo(cx, y0 + 0.13); p.lineTo(cx, y1 - 0.02); }), 0.02, 'rgba(30,34,44,0.5)'); pc.linha(P((p) => { p.moveTo(cx - 0.012, y0 + 0.14); p.lineTo(cx - 0.012, y1 - 0.04); }), 0.01, 'rgba(255,255,255,0.6)'); }
          pc.linha(P((p) => { p.moveTo(cx - b, y1 - 0.14); p.quadraticCurveTo(cx, y1 - 0.08, cx + b, y1 - 0.14); }), pc.interno, 'rgba(30,34,44,0.45)');
        }
        borda(pc, fm, bc);
        if (!costas && eq.peitoralAco.emblema) { const ex = cx, ey = y0 + 0.34; pc.peca(P((p) => { p.moveTo(ex, ey - 0.1); p.lineTo(ex + 0.09, ey - 0.03); p.lineTo(ex + 0.06, ey + 0.09); p.lineTo(ex, ey + 0.12); p.lineTo(ex - 0.06, ey + 0.09); p.lineTo(ex - 0.09, ey - 0.03); p.closePath(); }), T('ouroBordado'), { sombra: 0.1 }); pc.preencher(P((p) => { p.moveTo(ex - 0.05, ey - 0.06); p.lineTo(ex - 0.03, ey - 0.12); p.lineTo(ex - 0.01, ey - 0.05); p.moveTo(ex + 0.05, ey - 0.06); p.lineTo(ex + 0.03, ey - 0.12); p.lineTo(ex + 0.01, ey - 0.05); }), '#8A6A20'); }
        for (const [x, y] of [[-0.7, 0.12], [0.7, 0.12], [-0.62, 0.8], [0.62, 0.8]]) if (!costas) pc.preencher(P((p) => p.arc(cx + x * a, y0 + (y1 - y0) * y, 0.018, 0, Math.PI * 2)), '#E8D9A8');
      });
    }
    // armadura de escamas (verde) com bordas de bronze
    if (eq.escamas) {
      const cor = T(eq.escamas.cor || 'verdeEscama'), bc = T(eq.escamas.borda || 'bronze').base;
      depois('tronco', (pc) => {
        const y0 = shoulderY + 0.04, y1 = hemY - 0.2 * f;
        const a = perfil ? d : (hw + 0.01) * k, x0 = perfil ? -d * 0.8 : cx - a;
        const fm = perfil ? P((p) => p.roundRect(-d * 0.8, y0, d * 1.85, y1 - y0, 0.06)) : P((p) => { p.moveTo(cx - a, y0 + 0.05); if (!costas) { p.lineTo(cx - 0.13 * k, y0); p.lineTo(cx, y0 + 0.14); p.lineTo(cx + 0.13 * k, y0); } p.lineTo(cx + a, y0 + 0.05); p.lineTo(cx + a + 0.02, y1); p.quadraticCurveTo(cx, y1 + 0.05, cx - a - 0.02, y1); p.closePath(); });
        pc.peca(fm, cor, { sombra: 0.18 });
        if (pc.modo !== 'contorno') { pc.ctx.save(); pc.ctx.clip(fm); const W2 = perfil ? d * 1.85 : 2 * a; for (let r = 0; r < 9; r++) for (let i = 0; i < 9; i++) { const x = x0 + i * W2 / 8 + (r % 2) * W2 / 16, y = y0 + 0.1 + r * (y1 - y0) / 9; pc.preencher(P((p) => p.arc(x, y, 0.06, 0, Math.PI)), r % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.06)'); pc.linha(P((p) => p.arc(x, y, 0.06, 0.05 * Math.PI, 0.95 * Math.PI)), 0.012, 'rgba(10,30,22,0.5)'); } pc.ctx.restore(); }
        borda(pc, fm, bc, 0.04);
      });
    }
    // sobreveste (tabardo) da cintura até o joelho, com borda e emblema de lobo
    if (eq.sobreveste) {
      const cor = T(eq.sobreveste.cor || 'verdeTabardo'), bc = T(eq.sobreveste.borda || 'ouroBordado').base;
      depois('tronco', (pc) => {
        if (perfil) return;
        const yc = hemY - 0.32 * f, y1 = 1.5 * f, w = 0.22 * k;
        const fm = P((p) => { p.moveTo(cx - w, yc); p.lineTo(cx + w, yc); p.lineTo(cx + w * 1.12, y1); p.lineTo(cx, y1 + 0.1); p.lineTo(cx - w * 1.12, y1); p.closePath(); });
        pc.peca(fm, cor, { sombra: 0.14 }); borda(pc, fm, bc, 0.035);
        if (!costas && pc.modo !== 'contorno') { const ex = cx, ey = yc + 0.36; pc.preencher(P((p) => { p.moveTo(ex, ey - 0.13); p.lineTo(ex + 0.07, ey - 0.02); p.lineTo(ex + 0.1, ey - 0.16); p.lineTo(ex + 0.12, ey + 0.02); p.lineTo(ex + 0.06, ey + 0.13); p.lineTo(ex, ey + 0.16); p.lineTo(ex - 0.06, ey + 0.13); p.lineTo(ex - 0.12, ey + 0.02); p.lineTo(ex - 0.1, ey - 0.16); p.lineTo(ex - 0.07, ey - 0.02); p.closePath(); }), bc); pc.preencher(P((p) => { p.arc(ex - 0.04, ey + 0.0, 0.015, 0, Math.PI * 2); p.arc(ex + 0.04, ey + 0.0, 0.015, 0, Math.PI * 2); }), T(eq.sobreveste.cor || 'verdeTabardo').sombra); }
      });
    }
    // manto de pele grosso nos ombros (caçador de feras)
    if (eq.pele) {
      const pel = T(eq.pele.cor || 'peloGuardiao'), claro = T(eq.pele.claro || 'peloClaro').base;
      const tufos = (pc, x0, x1, y, alt, n = 12) => { const fm = P((p) => { p.moveTo(x0, y); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * (i / n); p.quadraticCurveTo(x - (x1 - x0) / n / 2, y - alt * (1.1 + 0.3 * Math.sin(i * 2.3)), x, y - alt * 0.6); } p.lineTo(x1, y + alt * 0.4); for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * (i / n); p.quadraticCurveTo(x + (x1 - x0) / n / 2, y + alt * (1.0 + 0.25 * Math.sin(i * 1.7)), x, y + alt * 0.5); } p.closePath(); }); pc.peca(fm, pel, { sombra: 0.16 }); if (pc.modo !== 'contorno') for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * ((i + 0.5) / n); pc.linha(P((p) => { p.moveTo(x, y + alt * 0.2); p.quadraticCurveTo(x + 0.02, y - alt * 0.3, x - 0.01, y - alt * 0.8); }), 0.016, claro); } };
      depois('tronco', (pc) => { const a = perfil ? d + 0.12 : (hw + 0.14) * k; tufos(pc, cx - a, cx + a, neckY + 0.14, 0.17, perfil ? 7 : 12); if (!perfil && !costas) tufos(pc, cx - a * 0.75, cx + a * 0.75, neckY + 0.28, 0.1, 9); });
      for (const nome of ['braco_d', 'braco_e']) depois(nome, (pc) => tufos(pc, -0.24, 0.24, 0.02, 0.12, 6));
    }
    // colar de dentes
    if (eq.colarDentes) {
      depois('tronco', (pc) => { if (perfil || costas) return; const y = neckY + 0.2; pc.linha(P((p) => { p.moveTo(cx - 0.2 * k, neckY + 0.05); p.quadraticCurveTo(cx, y + 0.06, cx + 0.2 * k, neckY + 0.05); }), 0.014, '#3A2414'); for (let i = -2; i <= 2; i++) { const x = cx + i * 0.07 * k, yy = y + 0.04 - Math.abs(i) * 0.025; pc.peca(P((p) => { p.moveTo(x - 0.022, yy); p.quadraticCurveTo(x + 0.01, yy + 0.05, x, yy + 0.09); p.quadraticCurveTo(x + 0.03, yy + 0.04, x + 0.022, yy); p.closePath(); }), T('garra'), { sombra: 0.05, espessura: pc.interno * 0.6 }); } });
    }
    // roupa rasgada pela transformação: barra esfiapada, rasgos mostrando a pele, mangas arrancadas, bermuda desfiada
    if (eq.rasgado) {
      const pele = T(c.pele), roupa = T(c.top.cor), esc = 'rgba(30,20,16,0.55)';
      const zigue = (x0, x1, y, alt, n, s0 = 1) => P((p) => { p.moveTo(x0, y - 0.2); p.lineTo(x0, y); for (let i = 1; i <= n; i++) { const x = x0 + (x1 - x0) * (i / n); p.lineTo(x - (x1 - x0) / n / 2, y + alt * (0.5 + 0.5 * Math.sin(i * 2.7 + s0))); p.lineTo(x, y - alt * 0.15); } p.lineTo(x1, y - 0.2); p.closePath(); });
      const rasgo = (pc, x, y, w, h, s0) => { const fm = P((p) => { const n = 7; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, r = 0.6 + 0.4 * Math.sin(i * 3.1 + s0); const px = x + Math.cos(a) * w * r, py = y + Math.sin(a) * h * r; i ? p.lineTo(px, py) : p.moveTo(px, py); } p.closePath(); }); pc.peca(fm, pele, { sombra: 0.08, espessura: pc.interno }); if (pc.modo !== 'contorno') pc.linha(fm, pc.interno * 1.2, esc); };
      depois('tronco', (pc) => {
        if (perfil) { rasgo(pc, d * 0.2, shoulderY + 0.45, 0.07, 0.1, 1); return; }
        // barra rasgada: a camiseta acaba em farrapos mostrando a barriga
        const yb = hemY - 0.2 * f, a = (hw - 0.01) * k;
        // barriga aparecendo embaixo e a barra da camiseta em farrapos (dentes de pano caindo por cima)
        pc.peca(P((p) => p.roundRect(cx - a * 0.92, yb, 2 * a * 0.92, hemY - yb + 0.04, 0.05)), pele, { sombra: 0.08 });
        const dentes = P((p) => { const n = 8; p.moveTo(cx - a, yb - 0.08); p.lineTo(cx - a, yb); for (let i = 0; i < n; i++) { const x0 = cx - a + 2 * a * (i / n), x1 = cx - a + 2 * a * ((i + 1) / n), L = 0.06 + 0.07 * (0.5 + 0.5 * Math.sin(i * 2.9 + 0.4)); p.lineTo((x0 + x1) / 2 + 0.01 * Math.sin(i), yb + L); p.lineTo(x1, yb); } p.lineTo(cx + a, yb - 0.08); p.closePath(); });
        pc.peca(dentes, roupa, { sombra: 0.1 });
        if (!costas) { rasgo(pc, cx - 0.17 * k, shoulderY + 0.4, 0.09, 0.13, 1.3); rasgo(pc, cx + 0.15 * k, shoulderY + 0.66, 0.07, 0.1, 2.1); rasgo(pc, cx + 0.2 * k, shoulderY + 0.18, 0.05, 0.07, 0.6); }
        else { rasgo(pc, cx + 0.1, shoulderY + 0.5, 0.08, 0.12, 0.9); rasgo(pc, cx - 0.2, shoulderY + 0.8, 0.05, 0.07, 1.9); }
        // tiras penduradas
        if (pc.modo !== 'contorno') for (const [x, L] of [[-0.6, 0.18], [0.1, 0.12], [0.5, 0.2]]) { const xx = cx + x * a; pc.peca(P((p) => { p.moveTo(xx - 0.025, yb - 0.02); p.lineTo(xx + 0.025, yb - 0.02); p.lineTo(xx + 0.01, yb + L); p.lineTo(xx - 0.015, yb + L * 0.9); p.closePath(); }), roupa, { sombra: 0.1, espessura: pc.interno * 0.8 }); }
      });
      // mangas arrancadas: ponta esfiapada no ombro
      for (const nome of ['braco_d', 'braco_e']) depois(nome, (pc) => { pc.linha(P((p) => { p.moveTo(-0.18, Lbraco * 0.32); for (let i = 1; i <= 5; i++) { p.lineTo(-0.18 + i * 0.072 - 0.036, Lbraco * (0.36 + 0.05 * Math.sin(i * 2.3))); p.lineTo(-0.18 + i * 0.072, Lbraco * 0.31); } }), pc.interno * 1.2, esc); });
      // bermuda desfiada (a calça rasgou na altura do joelho)
      const Lcoxa = (parte('canela_d') || { pivo: [0, 1] }).pivo[1];
      for (const nome of ['coxa_d', 'coxa_e']) depois(nome, (pc) => { const y = Lcoxa * 0.8; pc.peca(zigue(-0.21, 0.21, y, 0.09, 5, nome === 'coxa_d' ? 0.3 : 1.7), T(c.calca.cor), { sombra: 0.08, espessura: pc.interno }); if (pc.modo !== 'contorno') for (let i = 0; i < 4; i++) pc.linha(P((p) => { const x = -0.16 + i * 0.1; p.moveTo(x, y + 0.04); p.lineTo(x + 0.01, y + 0.1 + 0.03 * Math.sin(i * 3)); }), 0.01, esc); });
    }
    return def;
  };
})();

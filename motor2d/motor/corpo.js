// UM BONECO SÓ (capítulo 10 do livro "O Motor").
// Tudo o que é corpo mora aqui e vale para todos os personagens:
//   - Corpo.marcos(): as medidas do esqueleto (onde ficam ombro, quadril, joelho, tamanho dos membros);
//   - Corpo.montar(): as juntas (peças, pais, pivôs, ordem de desenho e espelhos) em cada vista;
//   - Corpo.mao(): a mão oficial, com os gestos relaxada | apontando | aberta | punho;
//   - Corpo.POSES e Corpo.EXPRESSOES: um catálogo só, que serve para qualquer personagem.
// De um personagem para outro muda só a roupa, o cabelo, a cor da pele e os acessórios (o arquivo de cada um).
// Proibido: um personagem ou episódio redesenhar junta, mão ou esqueleto por conta própria.
// Faltou alguma coisa? Entra aqui e passa a valer para todo mundo (e o teste de diferença confere os vídeos aprovados).
(function () {
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const capsula = (wTop, wBot, y0, y1) => P((p) => {
    p.moveTo(-wTop / 2, y0); p.arc(0, y0, wTop / 2, Math.PI, 0);
    p.lineTo(wBot / 2, y1); p.arc(0, y1, wBot / 2, 0, Math.PI); p.closePath();
  });

  // ---------- medidas do esqueleto (em H = altura da cabeça) ----------
  function marcos(A, vista) {
    const f = (A - 1) / 4.5;
    const Y = (y) => (y <= 1 ? y : 1 + (y - 1) * f);
    const yOmbro = Y(1.2), yQuadril = Y(2.75), yJoelho = Y(4.0);
    const tO = yQuadril - 0.15 * f, ombroL = yOmbro - tO;
    return {
      f, Y, yOmbro, yQuadril, yJoelho, tO, ombroL,
      neckY: ombroL - 0.06, shoulderY: ombroL + 0.04,
      Lbraco: 0.78 * f, Lante: 0.74 * f,
      Lcoxa: yJoelho - yQuadril - 0.05 * f, Lcanela: A - 0.35 - yJoelho,
      // deslocamento do pescoço para a frente nas vistas de lado
      pescocoX: vista === 'perfil' ? 0.1 : vista === 'tq' ? 0.06 : 0,
    };
  }

  // ---------- juntas ----------
  const ANGULO = { frente: 0, tq: 45, perfil: 90, costas: 180 };
  // profundidade: de lado, _d é o lado perto (na frente) e _e o lado longe (atrás)
  const Z_FRENTE = { quadril: 0.5, pe_d: 0.8, pe_e: 0.8, coxa_d: 1, canela_d: 1.05, coxa_e: 1.1, canela_e: 1.15,
    capuz: 4, pescoco: 5, tronco: 6, braco_d: 7, antebraco_d: 7.1, braco_e: 7.2, antebraco_e: 7.3, mao_d: 9, mao_e: 9, cabeca: 10 };
  const Z_LADO = { braco_e: 0.2, antebraco_e: 0.25, mao_e: 0.3, pe_e: 0.5, coxa_e: 0.6, canela_e: 0.65, quadril: 0.9,
    pe_d: 1.0, coxa_d: 1.1, canela_d: 1.15, capuz: 4, pescoco: 5, tronco: 6, braco_d: 7, antebraco_d: 7.1, mao_d: 9, cabeca: 10 };

  // o: { vista, m (marcos), bracoX, quadrilX, d: { quadril, pe, coxa, canela, capuz, pescoco, tronco, braco, antebraco, mao, cabeca } }
  function montar(o) {
    const { vista, m, d } = o;
    const lado = vista === 'tq' || vista === 'perfil';
    const z = lado ? Z_LADO : Z_FRENTE;
    const cosT = Math.cos((ANGULO[vista] * Math.PI) / 180);
    const bx = o.bracoX * cosT, qx = o.quadrilX * cosT; // _d fica em -bx (frente), +bx (costas), 0 (perfil)
    // espelho das mãos: polegar para o centro do corpo (frente/costas) ou para a frente (lado)
    const espMao = { frente: [-1, 1], costas: [1, -1], tq: [-1, -1], perfil: [-1, -1] }[vista];
    const espBraco = vista === 'costas' ? [1, -1] : [-1, 1];
    const mao = (l) => (pc, rig) => d.mao(pc, ((rig.pose._maos || {})[l]) || 'relaxada');
    return [
      { nome: 'quadril', pai: null, pivo: [0, m.yQuadril], z: z.quadril, desenhar: d.quadril },
      { nome: 'pe_d', pai: 'canela_d', pivo: [0, m.Lcanela], z: z.pe_d, espelho: vista === 'frente' ? -1 : 1, desenhar: d.pe },
      { nome: 'pe_e', pai: 'canela_e', pivo: [0, m.Lcanela], z: z.pe_e, desenhar: d.pe },
      { nome: 'coxa_d', pai: 'quadril', pivo: [-qx, 0.05 * m.f], z: z.coxa_d, grupo: 'perna_d', espelho: -1, desenhar: d.coxa },
      { nome: 'canela_d', pai: 'coxa_d', pivo: [0, m.Lcoxa], z: z.canela_d, grupo: 'perna_d', espelho: -1, desenhar: d.canela },
      { nome: 'coxa_e', pai: 'quadril', pivo: [qx, 0.05 * m.f], z: z.coxa_e, grupo: 'perna_e', desenhar: d.coxa },
      { nome: 'canela_e', pai: 'coxa_e', pivo: [0, m.Lcoxa], z: z.canela_e, grupo: 'perna_e', desenhar: d.canela },
      { nome: 'capuz', pai: 'tronco', pivo: [0, m.ombroL + 0.1], z: z.capuz, desenhar: d.capuz },
      { nome: 'pescoco', pai: 'tronco', pivo: [m.pescocoX, m.ombroL - 0.02], z: z.pescoco, desenhar: d.pescoco },
      { nome: 'tronco', pai: 'quadril', pivo: [0, -0.15 * m.f], z: z.tronco, desenhar: d.tronco },
      { nome: 'braco_d', pai: 'tronco', pivo: [-bx, m.ombroL + 0.18], z: z.braco_d, grupo: 'braco_d', espelho: espBraco[0], desenhar: d.braco },
      { nome: 'antebraco_d', pai: 'braco_d', pivo: [0, m.Lbraco], z: z.antebraco_d, grupo: 'braco_d', espelho: espBraco[0], desenhar: d.antebraco },
      { nome: 'braco_e', pai: 'tronco', pivo: [bx, m.ombroL + 0.18], z: z.braco_e, grupo: 'braco_e', espelho: espBraco[1], desenhar: d.braco },
      { nome: 'antebraco_e', pai: 'braco_e', pivo: [0, m.Lbraco], z: z.antebraco_e, grupo: 'braco_e', espelho: espBraco[1], desenhar: d.antebraco },
      { nome: 'mao_d', pai: 'antebraco_d', pivo: [0, m.Lante], z: z.mao_d, espelho: espMao[0], desenhar: mao('d') },
      { nome: 'mao_e', pai: 'antebraco_e', pivo: [0, m.Lante], z: z.mao_e, espelho: espMao[1], desenhar: mao('e') },
      { nome: 'cabeca', pai: 'pescoco', pivo: [0, -0.23], z: z.cabeca, desenhar: d.cabeca },
    ];
  }

  // ---------- a mão oficial ----------
  // (veio do Lucas, que era a mais completa; antes a Mãe e o Rafael tinham uma cópia sem polegar e sem a mão aberta)
  // Gestos: relaxada | apontando | aberta | punho. Dedos para +y, polegar para -x.
  function mao(pc, forma, pele) {
    if (forma === 'apontando') {
      const punho = P((p) => p.roundRect(-0.11, -0.04, 0.22, 0.24, 0.08));
      const indicador = capsula(0.075, 0.07, 0.15, 0.4);
      pc.peca(indicador, pele, { sombra: 0.02 });
      pc.peca(punho, pele, { sombra: 0.05 });
      pc.peca(P((p) => p.ellipse(-0.1, 0.08, 0.05, 0.08, -0.3, 0, Math.PI * 2)), pele, { sombra: 0.02 });
      pc.linha(P((p) => { p.moveTo(0.0, 0.17); p.lineTo(0.09, 0.17); }));
      return;
    }
    if (forma === 'punho') {
      pc.peca(P((p) => p.roundRect(-0.12, -0.04, 0.24, 0.27, 0.09)), pele, { sombra: 0.05 });
      pc.linha(P((p) => { p.moveTo(-0.07, 0.15); p.lineTo(0.1, 0.15); p.moveTo(-0.02, 0.15); p.lineTo(-0.02, 0.22); p.moveTo(0.04, 0.15); p.lineTo(0.04, 0.22); }));
      pc.peca(P((p) => p.ellipse(-0.1, 0.07, 0.05, 0.09, 0, 0, Math.PI * 2)), pele, { sombra: 0.02 });
      return;
    }
    if (forma === 'aberta') {
      // palma aberta, dedos afastados (soltando poder)
      const dedos = [[-0.07, 0.3, -0.2], [0.0, 0.34, -0.05], [0.07, 0.33, 0.08], [0.12, 0.27, 0.25]];
      for (const [x, comp, ang] of dedos) {
        const ctx = pc.ctx;
        ctx.save(); ctx.translate(x, 0.14); ctx.rotate(ang);
        pc.peca(capsula(0.065, 0.06, 0, comp - 0.14), pele, { sombra: 0.02 });
        ctx.restore();
      }
      pc.peca(P((p) => p.roundRect(-0.12, -0.04, 0.25, 0.24, 0.08)), pele, { sombra: 0.05 });
      const ctx = pc.ctx;
      ctx.save(); ctx.translate(-0.1, 0.06); ctx.rotate(0.9);
      pc.peca(capsula(0.075, 0.065, 0, 0.14), pele, { sombra: 0.02 });
      ctx.restore();
      return;
    }
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
    pc.peca(palma, pele, { sombra: 0.06 });
    pc.peca(polegar, pele, { sombra: 0.03 });
    pc.linha(P((p) => { p.moveTo(0.0, 0.3); p.lineTo(0.01, 0.36); p.moveTo(0.06, 0.28); p.lineTo(0.065, 0.34); }));
  }
  const GESTOS = ['relaxada', 'apontando', 'aberta', 'punho'];

  // ---------- catálogo único de expressões ----------
  const EXPRESSOES = {
    neutro: { olhar: [0, 0], palpebra: 0, pupila: 1, sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.35 } },
    feliz: { fechado: 'sorriso', sobrancelha: { y: -0.03, ang: 5 }, boca: { tipo: 'aberta', curva: 1.4, abertura: 0.06, largura: 0.09 } },
    espanto: { olhar: [0, 0], palpebra: 0, pupila: 0.5, sobrancelha: { y: -0.08, ang: 4 }, boca: { tipo: 'aberta', curva: -0.6, abertura: 0.075, largura: 0.05 } },
    medo: { olhar: [0, 0.004], palpebra: 0, pupila: 0.6, sobrancelha: { y: -0.045, ang: 18 }, boca: { tipo: 'aberta', curva: -0.8, abertura: 0.035, largura: 0.055 }, gota: true },
    raiva: { olhar: [0, 0], palpebra: 0.28, palpebraInclina: -0.45, pupila: 0.8, sobrancelha: { y: 0.04, ang: -26 }, boca: { tipo: 'grito', abertura: 0.045, largura: 0.085 } },
    determinado: { olhar: [0, 0], palpebra: 0.3, palpebraInclina: -0.25, pupila: 1, sobrancelha: { y: 0.025, ang: -18 }, boca: { tipo: 'linha', curva: -0.1, largura: 0.07 } },
    cansado: { olhar: [0, 0.014], palpebra: 0.52, palpebraInclina: 0.2, pupila: 1, sobrancelha: { y: 0.0, ang: 10 }, boca: { tipo: 'aberta', curva: -0.3, abertura: 0.018, largura: 0.045 }, olheira: true },
    rindo: { fechado: 'apertado', sobrancelha: { y: -0.04, ang: 8 }, boca: { tipo: 'aberta', curva: 1.8, abertura: 0.085, largura: 0.11 } },
    curioso: { olhar: [0.014, -0.01], palpebra: 0, pupila: 1.1, sobrancelha: { y: -0.03, ang: 8 }, boca: { tipo: 'linha', curva: 0.2, largura: 0.045 } },
    triste: { olhar: [0, 0.012], palpebra: 0.28, palpebraInclina: 0.35, pupila: 1, sobrancelha: { y: -0.015, ang: 20 }, boca: { tipo: 'linha', curva: -0.9, largura: 0.065 } },
    preocupado: { olhar: [0, 0.006], palpebra: 0.1, pupila: 1, sobrancelha: { y: -0.02, ang: 16 }, boca: { tipo: 'linha', curva: -0.5, largura: 0.06 } },
    serio: { olhar: [0, 0], palpebra: 0.22, pupila: 1, sobrancelha: { y: 0.025, ang: -6 }, boca: { tipo: 'linha', curva: -0.2, largura: 0.07 } },
  };

  // ---------- catálogo único de poses ----------
  // Cada pose diz a vista, os ângulos, as mãos, a expressão e (opcional) o efeito.
  // O catálogo é ATALHO, NÃO GAIOLA (capítulo 11): a pose pronta é o ponto de partida; o plano ajusta em toda cena.
  const POSES = {
    parado: {
      vista: 'frente', expressao: 'neutro',
      angulos: { braco_d: 7, antebraco_d: -3, mao_d: -2, braco_e: -7, antebraco_e: 3, mao_e: 2,
        coxa_d: 1.5, canela_d: -1.5, coxa_e: -1.5, canela_e: 1.5, cabeca: 2 },
    },
    // versão mais solta do parado, que a Mãe e o Rafael usavam nos vídeos já aprovados (sem cabeça e mãos inclinadas)
    'parado-leve': { vista: 'frente', expressao: 'neutro', angulos: { braco_d: 6, antebraco_d: -3, braco_e: -6, antebraco_e: 3, coxa_d: 1.5, canela_d: -1.5, coxa_e: -1.5, canela_e: 1.5 } },
    tq: { vista: 'tq', expressao: 'neutro', angulos: { braco_d: 5, braco_e: -4, coxa_d: -3, coxa_e: 3 } },
    perfil: { vista: 'perfil', expressao: 'neutro', angulos: {} },
    costas: { vista: 'costas', expressao: 'neutro', angulos: { braco_d: -6, braco_e: 6 } },
    andando: {
      vista: 'perfil', expressao: 'neutro',
      angulos: { tronco: 3, cabeca: -3,
        coxa_d: -24, canela_d: 10, pe_d: 12, coxa_e: 20, canela_e: 24, pe_e: -30,
        braco_d: 22, antebraco_d: -14, braco_e: -24, antebraco_e: -20, _desloca: [0, -0.04] },
    },
    correndo: {
      vista: 'perfil', expressao: 'determinado',
      angulos: { tronco: 12, cabeca: -10,
        coxa_d: -62, canela_d: 78, pe_d: -20, coxa_e: 38, canela_e: 82, pe_e: -40,
        braco_d: 50, antebraco_d: -85, braco_e: -55, antebraco_e: -80,
        _maos: { d: 'punho', e: 'punho' }, _desloca: [0, -0.32] },
    },
    apontando: {
      vista: 'tq', expressao: 'determinado',
      angulos: { tronco: -2, cabeca: -4, braco_d: -84, antebraco_d: -6, mao_d: 4, braco_e: 6, antebraco_e: -10,
        coxa_d: -8, canela_d: 4, pe_d: 4, coxa_e: 7, canela_e: -2, pe_e: -5, _maos: { d: 'apontando' } },
    },
    poder: {
      vista: 'tq', expressao: 'determinado', efeito: 'poder-terra',
      angulos: { tronco: 6, cabeca: -2, braco_d: -76, antebraco_d: -14, mao_d: -78, braco_e: -66, antebraco_e: -24, mao_e: -70,
        coxa_d: -20, canela_d: 14, pe_d: 6, coxa_e: 22, canela_e: 4, pe_e: -26, _maos: { d: 'aberta', e: 'aberta' } },
    },
    caido: {
      vista: 'perfil', expressao: 'cansado',
      angulos: { quadril: -90, tronco: -4, cabeca: -10,
        braco_d: 150, antebraco_d: 30, braco_e: 30, antebraco_e: 20,
        coxa_d: -42, canela_d: 70, pe_d: -10, coxa_e: -6, canela_e: 12, pe_e: -6,
        _desloca: [0, 2.45], _sombra: [3.6, 0.1] },
    },
    acenando: { vista: 'frente', expressao: 'feliz', angulos: { braco_d: 150, antebraco_d: 25, mao_d: 10, braco_e: -6, antebraco_e: 3, cabeca: -4, coxa_d: 1.5, coxa_e: -1.5 } },
    'maos-na-cintura': { vista: 'frente', expressao: 'serio', angulos: { braco_d: 40, antebraco_d: -110, mao_d: -40, braco_e: -40, antebraco_e: 110, mao_e: 40, coxa_d: 3, coxa_e: -3, _maos: { d: 'punho', e: 'punho' } } },
  };
  const angulos = (reg) => Object.fromEntries(Object.entries(reg).map(([k, v]) => [k, v.angulos]));

  window.Corpo = { marcos, montar, mao, GESTOS, ANGULO, EXPRESSOES, POSES, angulos };
  // nomes antigos: todos apontam para o MESMO catálogo (não existe mais catálogo por personagem)
  window.EXPRESSOES_PADRAO = window.LUCAS_EXPRESSOES = EXPRESSOES;
  window.LUCAS_POSES = POSES;
  // POSES_PADRAO é o mesmo catálogo; a única diferença é que "parado" aponta para "parado-leve",
  // para os vídeos já aprovados da Mãe e do Rafael continuarem idênticos (teste de diferença zero, 14/11/2026).
  window.POSES_PADRAO = { ...POSES, parado: POSES['parado-leve'] };
  window.LUCAS_POSES_ANGULOS = angulos(POSES);
})();

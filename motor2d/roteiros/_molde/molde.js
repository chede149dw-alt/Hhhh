// MOLDE de planos. Tudo aqui usa o Kit (motor/kit.js) e peças aprovadas da biblioteca (biblioteca.json).
// Modelo de câmera do autor: tomadas contínuas que atravessam várias falas, câmera girando em volta do personagem,
// personagem sempre vivo; close só para mão/efeito e reação rápida. "Desenha, escurece, acende" para a luz.
// O catálogo de poses é atalho, não gaiola: ajuste a pose em cada cena (rumo, vida, expressão).
(function () {
  const K = window.Kit, LUCAS = K.LUCAS, W = K.W, H = K.H;

  // TOMADA CONTÍNUA: atravessa os planos "treme" e "rachadura" (a câmera gira em volta do Lucas o tempo todo)
  function tomadaQuarto(ctx, api) {
    const T = K.tempoTomada(api, ['treme', 'rachadura'], [2.3, 2.9]);
    const [tx, ty] = api.tremor(T < 2.3 ? 20 : 6);
    ctx.save(); ctx.translate(tx, ty);
    const L = [-0.3 - 0.35 * api.ease.entra(api.clamp((T - 3.2) / 0.8, 0, 1)), 2.45];
    const cam = api.orbita({
      alvo: [L[0], K.chave(T, [[0, 1.25], [2.3, 1.15], [5.2, 1.05]]), L[1]], raio: K.chave(T, [[0, 2.5], [2.3, 2.1], [5.2, 1.75]]),
      ang: K.chave(T, [[0, -0.2], [2.3, 0.12], [5.2, 0.38]]), altura: K.chave(T, [[0, 1.45], [2.3, 1.2], [5.2, 0.95]]), f: 1000, ySalvo: 1020, nevoa: Cenarios3D.quarto.nevoa,
    });
    Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: T < 2.3 ? 1.6 : 0.4, livrosCaindo: api.clamp((T - 0.1) / 1.5, 0, 1) });
    const Tr = T - 2.3;
    const rach = () => {
      if (Tr <= 0) return;
      Efeitos.rachadura(ctx, cam, [1.0, 2.0], [L[0] + 0.15, L[1] - 0.05], api.clamp((Tr - 0.1) / 1.2, 0, 1), api.t, { largura: 0.04, zigue: 0.6, semente: 23 });
      Efeitos.rachadura(ctx, cam, [1.0, 2.3], [0.35, 3.3], api.clamp((Tr - 0.5) / 1.3, 0, 1), api.t, { largura: 0.025, semente: 29 });
    };
    rach();
    // reação em três tempos: olhos → cabeça/corpo vira e a expressão muda → a câmera acompanha
    const expr = T < 0.7 ? 'espanto' : Tr < 0 ? 'medo' : Tr < 0.4 ? { ...Corpo.EXPRESSOES.espanto, olhar: [0, 0.012] } : 'medo';
    const rumo = K.chave(T, [[0, 0], [2.4, 0], [3.1, K.angDe(L, [1.0, 2.0]) * 0.7]]);
    api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: expr }, L[0], L[1], 1.75, { luz: K.LUZ_FRIA, vida: T < 2.3 ? 3 : 2.2, rumo });
    ctx.restore();
    K.frio(ctx, 0.62);
    if (T < 2.3) Efeitos.poeiraTeto(ctx, W, H, api.t, 1.4);
    ctx.save(); ctx.translate(tx, ty); K.aceso(ctx, 0.25, rach); ctx.restore();
  }

  window.PLANOS = {
    // CAPA: protagonista com o poder + a premissa escrita grande
    capa(ctx, u, d, api) {
      const L = [0, 2.4];
      const cam = api.orbita({ alvo: [L[0] + 0.25, 1.3, L[1]], raio: 1.75, ang: api.lerp(-0.4, -0.05, u / d), altura: 1.3, f: 1250, ySalvo: 1150, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, L[0], L[1], 1.75, { luz: K.LUZ_FRIA, rumo: -0.95, vida: 1.5 });
      K.frio(ctx, 0.6);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.5);
      const a = K.maoDoRig(rig), b = K.maoDoRig(rig, 'e');
      const ex = (a.x + b.x) / 2 + 60, ey = (a.y + b.y) / 2;
      K.brilho(ctx, ex, ey, 520, 0.35);
      Efeitos['poder-terra'](ctx, ex, ey, 260, { t: api.t });
      K.capaTitulo(ctx, api, ['E SE VOCÊ', 'ACORDASSE', 'CONTROLANDO'], 'A TERRA?');
    },

    treme(ctx, u, d, api) { tomadaQuarto(ctx, api); },
    rachadura(ctx, u, d, api) { tomadaQuarto(ctx, api); },

    // CLOSE DE MÃO no momento do poder (mão articulada de motor/mao-detalhe.js), no ritmo do coração
    maos(ctx, u, d, api) {
      const pu = K.pulso(api, u);
      K.fundo(ctx, api, 'quarto', { x: 0.2, y: 1.3, z: 0.6, cy: 1000 }, 16);
      const tre = (k) => Math.sin(api.t * 41 + k) * 7 + Math.sin(api.t * 29 + k * 2) * 4;
      const sobe = api.lerp(0, -90, api.fase(0, d, 'suave'));
      const curl = [0, 1, 2, 3, 4].map((i) => 0.25 + 0.08 * Math.sin(api.t * 9 + i));
      const me = Maos.desenhar(ctx, 270 + tre(1), 2000 + sobe + tre(2), 360, { ang: -0.15, curl, abre: 0.6, espelhar: true });
      const md = Maos.desenhar(ctx, 820 + tre(3), 1980 + sobe + tre(4), 360, { ang: 0.15, curl, abre: 0.6 });
      K.frio(ctx, 0.6);
      for (const [m, s] of [[me, 3], [md, 5]]) {
        K.brilho(ctx, m.palma.x, m.palma.y, 260 * (0.7 + 0.5 * pu), 0.3 + 0.45 * pu);
        K.veias(ctx, m.palma.x, m.palma.y, 420, 0.5 + 0.5 * pu, s);
      }
    },

    // CARTELA FINAL: PARTE X + SEGUE PRA VER A PARTE X+1
    parte(ctx, u, d, api) { K.cartelaParte(ctx, u, d, api, 1); },
  };
})();

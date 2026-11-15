// Teste de movimentação na masmorra (roteiro em ep01.md). Começou do molde; usa o Kit e o cenário masmorra.
// Luz: escuro com tochas laranja piscando e a saída clara no fundo. Personagens sempre andando ou reagindo.
(function () {
  const K = window.Kit, W = K.W, H = K.H;
  const LUCAS = K.LUCAS;
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const LUZ_TOCHA = { lado: 1, cor: 'rgb(255,170,95)', forca: 0.75 };
  const LUZ_FUNDO = { lado: -1, cor: 'rgb(255,236,200)', forca: 0.5 };
  const M = () => Cenarios3D.masmorra;
  // tocha presa na mão de um personagem (pontos do Rig vêm em px da tela)
  function tochaNaMao(ctx, rig, t, lado = 'd', i = 7) {
    const m = rig.pontoMundo('mao_' + lado, [0, 0.25]);
    if (m.x < -1000) return;
    const s = rig.escalaPx * 3.1;
    const camTela = { p: () => ({ x: m.x, y: m.y - s * 0.3, s, atras: false }) };
    M().tocha(ctx, camTela, 0, 0, 0, t, 1, i);
  }
  const ERGUIDA = { braco_d: 158, antebraco_d: 18, mao_d: 4, braco_e: -8, antebraco_e: 6, _maos: { d: 'punho' } };

  // TOMADA CONTÍNUA 1 (capa + entrada): os dois vêm do fundo do túnel, contra a luz da saída; a câmera recua
  function tomadaTunel(ctx, api) {
    const T = K.tempoTomada(api, ['capa', 'entrada'], [3.0, 2.6]);
    const camZ = K.chave(T, [[0, 4.0], [5.6, 2.9]]);
    const cam = api.camera({ f: K.chave(T, [[0, 1150], [5.6, 1050]]), x: K.chave(T, [[0, -0.15], [5.6, 0.1]]), y: 1.3, z: camZ, cy: 980, nevoa: M().nevoa, distNevoa: M().distNevoa });
    M().desenhar(ctx, cam, { t: api.t });
    const zL = 10.8 - T * 1.1, zR = zL + 0.7;
    // de trás para a frente: quem está mais longe primeiro
    const rigR = api.personagem3d(cam, { ...RAFAEL, expressao: 'preocupado' }, 0.45, zR, 1.72, { luz: LUZ_FUNDO, rumo: 0, caminharFrontal: api.t + 0.3, velocidade: 0.95 });
    api.personagem3d(cam, { ...LUCAS, expressao: T < 3 ? 'curioso' : 'espanto' }, -0.4, zL, 1.75, { luz: LUZ_FUNDO, rumo: 0, caminharFrontal: api.t, velocidade: 0.95 });
    tochaNaMao(ctx, rigR, api.t, 'e');
    Cena3D.poeira(ctx, cam, [[-1.4, 0.3, camZ + 1], [1.4, 2.6, camZ + 8]], 40, api.t, { alpha: 0.5, semente: 11 });
  }

  window.PLANOS = {
    capa(ctx, u, d, api) {
      tomadaTunel(ctx, api);
      K.capaTitulo(ctx, api, ['E SE VOCÊ ACHASSE', 'UMA MASMORRA'], 'NA ESCOLA?');
    },
    entrada(ctx, u, d, api) { tomadaTunel(ctx, api); },

    // a câmera vira para a parede e chega perto da placa
    placa(ctx, u, d, api) {
      const k = api.fase(0, d, 'suave');
      const cam = api.camera({ f: api.lerp(950, 1250, k), x: 0.4, y: 1.35, z: api.lerp(1.9, 2.3, k), yaw: api.lerp(-0.6, -0.92, k), cy: 960, nevoa: M().nevoa, distNevoa: M().distNevoa });
      M().desenhar(ctx, cam, { t: api.t, placa: 'ANDAR 1' });
      Cena3D.poeira(ctx, cam, [[-1.5, 0.5, 2], [0.5, 2.4, 5]], 30, api.t, { alpha: 0.45, semente: 5 });
    },

    // câmera baixa: só os pés andando na pedra; a câmera recua junto com eles
    pes(ctx, u, d, api) {
      const zL = 4.6 - u * 0.95;
      const cam = api.camera({ f: 2900, x: -0.1, y: 0.22, z: zL - 1.9, cy: 1180, nevoa: M().nevoa, distNevoa: M().distNevoa });
      M().desenhar(ctx, cam, { t: api.t });
      api.personagem3d(cam, { ...RAFAEL }, 0.55, zL + 1.1, 1.72, { luz: LUZ_TOCHA, rumo: 0, caminharFrontal: api.t + 0.35, velocidade: 0.9, semRosto: true });
      api.personagem3d(cam, { ...LUCAS }, -0.3, zL, 1.75, { luz: LUZ_TOCHA, rumo: 0, caminharFrontal: api.t, velocidade: 0.9, semRosto: true });
      // poeirinha levantando a cada passo
      Cena3D.poeira(ctx, cam, [[-0.8, 0.0, zL - 0.3], [0.9, 0.25, zL + 0.6]], 26, api.t, { alpha: 0.55, semente: 9 });
    },

    // close do rosto com luz de tocha; reação em três tempos: olhos → cabeça e expressão → câmera
    tocha(ctx, u, d, api) {
      const pu = K.pulso(api, u);
      const z = 1 + 0.05 * api.fase(1.3, 1.8, 'entra') + 0.012 * pu;
      ctx.save(); K.zoom(ctx, 540, 900, z);
      K.fundo(ctx, api, 'masmorra', { x: 0.2, y: 1.5, z: 4, cy: 900 }, 16);
      const olhos = u < 0.5 ? [0, 0] : [0.016, -0.004];
      const expr = u < 1.0 ? { ...Corpo.EXPRESSOES.neutro, olhar: olhos } : u < 1.3 ? { ...Corpo.EXPRESSOES.espanto, olhar: [0.016, 0] } : 'medo';
      const item = { ...LUCAS, pose: 'parado', expressao: expr, vistaCabeca: u > 1.0 ? 'tq' : undefined };
      K.close(api, item, 520, 820, 330, { luz: LUZ_TOCHA, vida: 0.6 + 0.8 * pu });
      ctx.restore();
      // a tocha fora do quadro, embaixo à direita: brilho piscando no rosto
      const f = 1 + 0.12 * Math.sin(api.t * 13) + 0.07 * Math.sin(api.t * 23.3);
      K.brilho(ctx, 980, 1500, 900 * f, 0.32 * f, '255,140,60');
      ctx.fillStyle = 'rgba(8,5,4,0.25)'; ctx.fillRect(0, 0, W, H);
    },

    // a câmera gira em volta do Lucas e revela o Rafael erguendo a tocha para o fundo do túnel
    revela(ctx, u, d, api) {
      const L = [-0.2, 5.0], R = [0.85, 6.3];
      const cam = api.orbita({
        alvo: [K.chave(u, [[0, -0.2], [2.9, 0.3]]), 1.35, K.chave(u, [[0, 5.0], [2.9, 5.6]])],
        raio: K.chave(u, [[0, 1.5], [1.4, 2.1], [2.9, 2.6]]), ang: K.chave(u, [[0, -0.45], [2.9, 0.55]]), altura: 1.4, f: 1100, ySalvo: 1000,
        nevoa: M().nevoa, distNevoa: M().distNevoa,
      });
      M().desenhar(ctx, cam, { t: api.t });
      const ergue = api.fase(1.0, 1.7, 'volta');
      const poseR = { ...Corpo.POSES['parado-leve'].angulos };
      for (const [k, v] of Object.entries(ERGUIDA)) poseR[k] = typeof v === 'number' ? (poseR[k] || 0) + (v - (poseR[k] || 0)) * ergue : v;
      const fundoTunel = [0, 14];
      const desenharR = () => { const rig = api.personagem3d(cam, { ...RAFAEL, pose: poseR, expressao: ergue > 0.5 ? 'determinado' : 'preocupado' }, R[0], R[1], 1.72, { luz: LUZ_TOCHA, olhaPara: fundoTunel, vida: 1.2 }); tochaNaMao(ctx, rig, api.t); };
      const rumoL = K.chave(u, [[0, Math.PI], [1.6, Math.PI], [2.3, K.angDe(L, R)]]);
      const desenharL = () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: u < 2.0 ? 'medo' : 'espanto' }, L[0], L[1], 1.75, { luz: LUZ_TOCHA, rumo: rumoL, vida: 1.6 });
      // ordem por profundidade em relação à câmera
      const dL = Math.hypot(cam.x - L[0], cam.z - L[1]), dR = Math.hypot(cam.x - R[0], cam.z - R[1]);
      if (dR > dL) { desenharR(); desenharL(); } else { desenharL(); desenharR(); }
      if (ergue > 0) K.brilho(ctx, 540, 700, 700 * ergue, 0.18 * ergue, '255,150,70');
    },

    parte(ctx, u, d, api) { K.cartelaParte(ctx, u, d, api, 1, 'masmorra', { x: 0, y: 1.4, cy: 960 }); },
  };
})();

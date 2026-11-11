// Episódio 1 — "E se você acordasse podendo ficar invisível?" (PARTE 1)
// Planos do roteiro roteiros/invisivel/ep01.json. Cada função desenha um quadro do plano.
// Regras: câmera sempre em movimento lento; personagens com respiração/piscar; Lucas segue a ficha oficial.
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const AMIGO = { fabrica: 'criarAmigo', registroPoses: 'POSES_PADRAO' };
  const alturaH = (item, vista = 'frente') => window[item.fabrica]({}, vista).alturaEmH;

  // close: centro da cabeça em (cx, cy) com cabeça de Hpx
  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  // fundo 3D desfocado (profundidade de campo)
  function fundo(ctx, api, cenario, camOpts, px, extra = {}) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D[cenario].nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D[cenario].desenhar(g, cam, extra);
    api.desfocar(camada, px);
    return cam;
  }

  window.PLANOS = {
    // 0–2 s: capa com a premissa
    capa(ctx, u, d, api) {
      const z = api.lerp(1, 1.07, u / d);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      fundo(ctx, api, 'quarto', { x: -0.2, y: 1.1, z: -0.5, cy: 1150 }, 10);
      api.invisivel({ ...LUCAS, pose: 'parado', expressao: 'espanto' }, 560, 2380, 1450, 0.42 + 0.04 * Math.sin(u * 3));
      ctx.restore();
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 380); ctx.scale(k, k); ctx.translate(-540, -380);
      api.texto('E SE VOCÊ', 540, 250, 92);
      api.texto('ACORDASSE PODENDO', 540, 360, 84);
      api.texto('FICAR', 540, 470, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 600); ctx.scale(k2, k2); ctx.rotate(-0.03); ctx.translate(-540, -600);
      api.texto('INVISÍVEL?', 540, 600, 150, { cor: Estilo.base.mostarda });
      ctx.restore();
    },

    // despertador tocando, perto da cabeça do Lucas dormindo
    despertador(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.12, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      const camada = api.camada(), g = camada.getContext('2d');
      const cam = api.camera({ x: 1.2, y: 1.0, z: 1.2, cy: 900, nevoa: Cenarios3D.quarto.nevoa, distNevoa: 30 });
      Cenarios3D.quarto.desenhar(g, cam, {});
      api.desfocar(camada, 9);
      // Lucas dormindo na cama, ao fundo (desfocado de leve)
      const cl = api.camada(), gl = cl.getContext('2d');
      const q = cam.p(1.55, 0.55, 2.4);
      const rig = new Rig(criarLucas({}, 'perfil'));
      rig.usarPose({ ...LUCAS_POSES.caido.angulos, _desloca: [0, 2.45], cabeca: -6 + Math.sin(u * 2) * 1.5 });
      rig.usarExpressao({ fechado: 'sorriso', sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.1 } });
      rig.desenhar(gl, q.x + 330, q.y + 40, 1.75 * q.s);
      api.desfocar(cl, 4);
      ctx.restore();
      // despertador em primeiro plano, tremendo
      const [tx, ty] = api.tremor(4);
      Cena.objeto(ctx, 'despertador', 400 + tx, 1530 + ty, 620, { tocando: true, t: u, hora: 6.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    // close: acorda tonto
    acorda(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.08, u / d);
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, 'quarto', { x: -0.8 + u * 0.08, y: 1.5, z: 0.5, cy: 1000 }, 14);
      const expr = u < d * 0.55 ? 'cansado' : 'neutro';
      close(api, { ...LUCAS, pose: 'parado', expressao: expr }, 560, 1080, 560, { vida: 1.6 });
      ctx.restore();
    },

    // close: as mãos começam a sumir
    maos(ctx, u, d, api) {
      const z = api.lerp(1.04, 1.0, u / d);
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      fundo(ctx, api, 'quarto', { x: 0.4, y: 1.4, z: 0.2, cy: 1000 }, 14);
      const prog = 0.2 + 0.45 * api.fase(0, d);
      api.invisivel({ ...LUCAS, pose: 'poder', expressao: 'espanto', vista: 'tq' }, 300, 3050, 2300, prog, { focos: ['mao_d', 'mao_e'], raioFocos: 750 });
      ctx.restore();
    },

    // close: medo, câmera tremendo
    medo(ctx, u, d, api) {
      const [tx, ty] = api.tremor(10);
      const z = api.lerp(1.0, 1.15, api.fase(0, d, 'entra'));
      ctx.save(); ctx.translate(540 + tx, 900 + ty); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, 'quarto', { x: -0.4, y: 1.5, z: 0.6, cy: 980 }, 16);
      close(api, { ...LUCAS, pose: 'parado', expressao: 'medo' }, 540, 1080, 600, { vida: 2.2 });
      ctx.restore();
    },

    // plano médio: o corpo todo some
    some(ctx, u, d, api) {
      const cam = api.camera({ x: -0.2 + u * 0.1, y: 1.15, z: -0.6 + u * 0.25, cy: 1080, nevoa: Cenarios3D.quarto.nevoa, distNevoa: 30 });
      Cenarios3D.quarto.desenhar(ctx, cam, {});
      api.invisivel3d(cam, { ...LUCAS, pose: 'parado', expressao: 'medo' }, -0.3, 2.2, 1.75, api.fase(0.1, d * 0.95));
    },

    // mãe abre a porta e chama
    'mae-porta'(ctx, u, d, api) {
      const cam = api.camera({ x: 0.6, y: 1.3, z: 1.6 + u * 0.18, cy: 1000, nevoa: Cenarios3D.quarto.nevoa, distNevoa: 30 });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: api.fase(0, 0.45, 'entra') });
      const pose = { ...MAE, pose: 'parado', pose2: 'acenando', mistura: api.fase(0.4, 0.8), expressao: 'neutro', voz: 'mae' };
      api.personagem3d(cam, pose, 1.3, 4.55, 1.65);
    },

    // mãe procura; o contorno do Lucas aponta para ela
    'mae-procura'(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      fundo(ctx, api, 'quarto', { x: 1.0, y: 1.4, z: 2.6, cy: 960 }, 12, { portaAberta: 1 });
      const olhar = [Math.sin(u * 2.4) * 0.016, 0];
      const expr = { ...EXPRESSOES_PADRAO.preocupado, olhar };
      close(api, { ...MAE, pose: 'parado', expressao: expr }, 380, 1080, 430);
      api.invisivel({ ...LUCAS, pose: 'apontando', expressao: 'determinado', vista: 'tq', espelhar: true }, 800, 2350, 1500, 1);
      ctx.restore();
    },

    // rua: ninguém te vê
    rua(ctx, u, d, api) {
      const cam = api.camera({ x: 0.4, y: 0.9, z: -2 + u * 1.1, cy: 1060, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      // vizinho passando (figurante), sem perceber nada
      api.personagem3d(cam, { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: {}, vista: 'perfil', espelhar: true, expressao: 'neutro' }, -1.4, 9 - u * 1.3, 1.78, { caminhar: u + 0.3 });
      api.invisivel3d(cam, { ...LUCAS, pose: {}, vista: 'perfil', expressao: 'neutro' }, 0.7, cam.z + 2.7, 1.75, 1, { caminhar: u });
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.4 });
    },

    // escola: o amigo no armário
    escola(ctx, u, d, api) {
      const cam = api.camera({ x: 0.1, y: 1.3, z: -0.4 + u * 0.3, cy: 1000, nevoa: Cenarios3D.escola.nevoa, distNevoa: 35 });
      Cenarios3D.escola.desenhar(ctx, cam, {});
      api.personagem3d(cam, { ...AMIGO, pose: 'tq', vista: 'tq', espelhar: true, expressao: 'neutro' }, -0.9, 2.6, 1.8);
    },

    // o armário abre sozinho; close no amigo assustado
    armario(ctx, u, d, api) {
      const cam = api.camera({ x: -0.15 - u * 0.05, y: 1.45, z: 1.0 + u * 0.12, cy: 980, nevoa: Cenarios3D.escola.nevoa, distNevoa: 35 });
      const camada = api.camada();
      Cenarios3D.escola.desenhar(camada.getContext('2d'), cam, { armarioAberto: api.fase(0.15, 0.7, 'entra') });
      api.desfocar(camada, 2);
      const expr = u < 0.55 ? 'neutro' : 'espanto';
      close(api, { ...AMIGO, pose: 'tq', vista: 'tq', espelhar: true, expressao: expr }, 700, 1150, 400);
    },

    // o amigo encara a câmera, desconfiado
    desconfia(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.14, api.fase(0, d));
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, 'escola', { x: 0.3, y: 1.6, z: 0.8, cy: 950 }, 14, { armarioAberto: 1 });
      const expr = { ...EXPRESSOES_PADRAO.serio, palpebra: 0.3, palpebraInclina: -0.3, olhar: [0, 0] };
      close(api, { ...AMIGO, pose: 'parado', expressao: expr }, 540, 1080, 560);
      ctx.restore();
    },

    // cartela final
    parte(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      fundo(ctx, api, 'escola', { x: 0, y: 1.3, z: -1 + u * 0.2, cy: 980 }, 18, { armarioAberto: 1 });
      ctx.restore();
      ctx.fillStyle = 'rgba(20,18,43,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 960); ctx.scale(k, k); ctx.translate(-540, -960);
      api.texto('PARTE', 540, 880, 130);
      api.texto('1', 540, 1060, 260, { cor: Estilo.base.mostarda });
      ctx.restore();
    },
  };
})();

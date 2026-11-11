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

    // close: acorda tonto; olha para o despertador, vira a cabeça e se assusta (referência 4)
    acorda(ctx, u, d, api) {
      const vira = api.fase(0.95, 1.2, 'entra');                    // momento da virada
      const ajuste = api.fase(0.95, 1.5, 'volta');                   // câmera acompanha com pequena passada
      const z = api.lerp(1.0, 1.05, u / d) + ajuste * 0.05;
      ctx.save(); ctx.translate(540 - ajuste * 40, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, 'quarto', { x: -0.8 + u * 0.08, y: 1.5, z: 0.5, cy: 1000 }, 14);
      const olhar = [api.lerp(0, -0.018, api.fase(0.6, 0.9)), 0];
      const expr = u < 1.0 ? { ...LUCAS_EXPRESSOES.cansado, olhar } : 'espanto';
      close(api, { ...LUCAS, pose: 'parado', expressao: expr, vistaCabeca: vira > 0.5 ? 'tq' : 'frente', cabecaEsquerda: true },
        560, 1050, 560, { vida: 1.6 });
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

    // plano médio (joelhos para cima): o corpo todo some
    some(ctx, u, d, api) {
      const cam = api.camera({ f: 1400, x: -0.25 + u * 0.06, y: 1.2, z: 0.45 + u * 0.12, cy: 980, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t });
      api.invisivel3d(cam, { ...LUCAS, pose: 'parado', expressao: 'medo' }, -0.3, 2.2, 1.75, api.fase(0.1, d * 0.95), { luz: { lado: -1 } });
    },

    // mãe abre a porta e chama (cintura para cima)
    'mae-porta'(ctx, u, d, api) {
      const cam = api.camera({ f: 1500, x: 1.2, y: 1.4, z: 3.0 + u * 0.12, cy: 960, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: api.fase(0, 0.45, 'entra'), t: api.t });
      const pose = { ...MAE, pose: 'parado', pose2: 'acenando', mistura: api.fase(0.4, 0.8), expressao: 'neutro', voz: 'mae' };
      api.personagem3d(cam, pose, 1.3, 4.55, 1.65, { luz: { lado: -1, forca: 0.6 } });
    },

    // plano contínuo (referência 2): a mãe procura e sai; a câmera vira, balança e revela o Lucas invisível
    'mae-procura'(ctx, u, d, api) {
      // giro da câmera: parado na mãe, depois vira para a janela com passada do ponto e acomodação
      const k = api.fase(1.0, 2.3, 'volta');                  // 0 -> 1 com leve passada (easeOutBack)
      const balanco = Math.sin(Math.max(0, u - 1.0) * 9) * Math.exp(-Math.max(0, u - 1.0) * 3) * 0.02;
      const yaw = api.lerp(0.22, -0.5, k) + balanco + Math.sin(u * 1.7) * 0.006;
      const roll = (api.lerp(0, -1.8, k) + Math.sin(u * 2.3) * 0.25) * Math.PI / 180;
      const cam = api.camera({ f: 1050, x: 0.55 - k * 0.15, y: 1.35, z: 0.55 + u * 0.08, cy: 860, yaw, nevoa: Cenarios3D.quarto.nevoa });
      ctx.save(); ctx.translate(540, 960); ctx.rotate(roll); ctx.scale(1.04, 1.04); ctx.translate(-540, -960);
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: 1, t: api.t });
      // Lucas invisível parado na luz da janela (só o contorno)
      api.invisivel3d(cam, { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES', pose: 'parado', expressao: 'neutro' }, -0.75, 2.6, 1.75, 1);
      // mãe: olha em volta, depois anda até a porta
      const sai = api.fase(0.75, 2.6, 'linear');
      const X = api.lerp(0.85, 1.35, sai), Z = api.lerp(2.2, 4.9, sai);
      const olhar = [Math.sin(u * 3) * 0.016, 0];
      const mae = sai > 0.02
        ? { fabrica: 'criarMae', pose: {}, vista: 'perfil', expressao: { ...EXPRESSOES_PADRAO.preocupado, olhar } }
        : { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO', pose: 'tq', vista: 'tq', espelhar: true, expressao: { ...EXPRESSOES_PADRAO.preocupado, olhar } };
      api.personagem3d(cam, mae, X, Z, 1.65, { luz: { lado: -1, forca: 0.7 }, ...(sai > 0.02 ? { caminhar: u } : {}) });
      ctx.restore();
    },

    // rua: ninguém te vê — câmera atrás do Lucas, que anda de costas rua adentro
    rua(ctx, u, d, api) {
      const zc = -1.2 + u * 1.25; // câmera e Lucas andando juntos
      const cam = api.camera({ f: 1150, x: 0.35 + Math.sin(u * 1.3) * 0.03, y: 1.35, z: zc, cy: 980, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      // vizinho vindo de frente, sem perceber nada
      api.personagem3d(cam, { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: {}, vista: 'frente', expressao: 'neutro' },
        -0.55, zc + 7.5 - u * 1.4, 1.78, { caminharFrontal: u + 0.4 });
      api.invisivel3d(cam, { ...LUCAS, pose: {}, vista: 'costas', expressao: 'neutro' }, 0.45, zc + 2.1, 1.75, 1, { caminharFrontal: u });
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.6 });
    },

    // escola: o amigo no armário (cintura para cima)
    escola(ctx, u, d, api) {
      const cam = api.camera({ f: 1300, x: -0.75, y: 1.4, z: 0.4 + u * 0.15, cy: 960, nevoa: Cenarios3D.escola.nevoa, distNevoa: 35 });
      Cenarios3D.escola.desenhar(ctx, cam, {});
      api.personagem3d(cam, { ...AMIGO, pose: 'tq', vista: 'tq', espelhar: true, expressao: 'neutro' }, -0.95, 2.4, 1.8);
    },

    // o armário abre sozinho; o amigo olha, vira a cabeça e se assusta (referência 4)
    armario(ctx, u, d, api) {
      const vira = api.fase(0.75, 0.95, 'entra'), ajuste = api.fase(0.75, 1.3, 'volta');
      const cam = api.camera({ x: -0.15 - u * 0.05, y: 1.45, z: 1.0 + u * 0.12 + ajuste * 0.15, cy: 980, nevoa: Cenarios3D.escola.nevoa, distNevoa: 35 });
      const camada = api.camada();
      Cenarios3D.escola.desenhar(camada.getContext('2d'), cam, { armarioAberto: api.fase(0.15, 0.7, 'entra') });
      api.desfocar(camada, 2);
      const olhar = [api.lerp(0, -0.018, api.fase(0.45, 0.7)), 0];
      const expr = u < 0.8 ? { ...EXPRESSOES_PADRAO.neutro, olhar } : 'espanto';
      close(api, { ...AMIGO, pose: 'tq', vista: 'tq', espelhar: true, expressao: expr, vistaCabeca: vira > 0.5 ? 'perfil' : 'tq', cabecaEsquerda: true },
        700 + ajuste * 20, 1150, 400);
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

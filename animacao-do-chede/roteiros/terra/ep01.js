// Episódio 1 — "E se você acordasse controlando a terra?" (PARTE 1)
// Planos do roteiro roteiros/terra/ep01.json. Regras: câmera perto e sempre se mexendo; Lucas segue a ficha
// (poder oficial: controlar a terra); reações em três tempos (olhar → cabeça/expressão → ajuste de câmera).
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const LUZ_JANELA = { lado: -1 };
  const alturaH = (item, vista = 'frente') => window[item.fabrica]({}, vista).alturaEmH;

  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  function fundo(ctx, api, cenario, camOpts, px, extra = {}) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D[cenario].nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D[cenario].desenhar(g, cam, { t: api.t, ...extra });
    api.desfocar(camada, px);
    return cam;
  }
  const maoDoRig = (rig, lado = 'd') => rig.pontoMundo('mao_' + lado, [0, 0.3]);
  // câmera auxiliar: o ponto (0, 0, 2) cai em (x, y) da tela com s px por metro (para efeitos 3D em closes)
  const camEm = (x, y, s) => Cena3D.camera({ f: s * 2, x: 0, y: 1, z: 0, cx: x, cy: y - s });
  function celular(ctx, x, y, s, ang = 0, sujo = false) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(ang);
    const w = s * 0.075, h = s * 0.15;
    ctx.fillStyle = '#2A2632'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.2); ctx.fill();
    ctx.fillStyle = '#9FD2EA'; ctx.beginPath(); ctx.roundRect(-w / 2 + w * 0.1, -h / 2 + h * 0.08, w * 0.8, h * 0.82, w * 0.12); ctx.fill();
    if (sujo) { ctx.fillStyle = 'rgba(139,94,60,0.85)'; for (const [a, b, r] of [[-0.2, 0.2, 0.25], [0.15, -0.1, 0.2], [0, 0.35, 0.18]]) { ctx.beginPath(); ctx.arc(a * w, b * h, r * w, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
  }
  function mao(ctx, x, y, s) { // mão do Lucas descendo (close no despertador): punho do moletom + mão aberta
    const pc = Cena.pincel(ctx, x, y, s, 2.5);
    const P = Cena.P, pele = Estilo.tom('pele3');
    pc.peca(P((p) => p.roundRect(-0.42, -2.4, 0.84, 1.75, 0.25)), Estilo.tom('marinho'), { sombra: 0.12 });
    pc.sombraDentro(P((p) => p.roundRect(-0.42, -2.4, 0.84, 1.75, 0.25)), P((p) => p.rect(0.22, -2.4, 0.1, 1.75)), Estilo.base.turquesa);
    pc.peca(P((p) => p.roundRect(-0.38, -0.75, 0.76, 0.22, 0.08)), Estilo.tom('marinho'), { sombra: 0.04 });
    for (const [dx, comp] of [[-0.27, 0.42], [-0.09, 0.5], [0.09, 0.48], [0.26, 0.4]]) pc.peca(P((p) => p.roundRect(dx - 0.08, -0.25, 0.16, comp + 0.25, 0.08)), pele, { sombra: 0.04 });
    pc.peca(P((p) => p.roundRect(-0.36, -0.6, 0.72, 0.55, 0.18)), pele, { sombra: 0.08 });
    pc.peca(P((p) => p.ellipse(-0.42, -0.3, 0.1, 0.22, 0.5, 0, Math.PI * 2)), pele, { sombra: 0.03 });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  window.PLANOS = {
    // 0–2 s: capa com a premissa
    capa(ctx, u, d, api) {
      const z = api.lerp(1, 1.06, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      fundo(ctx, api, 'quarto', { x: 0.2, y: 1.2, z: -0.3, cy: 1100 }, 10);
      Efeitos.poeiraTeto(ctx, 1080, 1920, api.t, 0.5);
      const rig = api.personagem({ ...LUCAS, pose: 'poder', expressao: 'determinado' }, 330, 2350, 1450, { luz: LUZ_JANELA });
      ctx.restore();
      const a = maoDoRig(rig), b = maoDoRig(rig, 'e');
      Efeitos['poder-terra'](ctx, Math.min(800, (a.x + b.x) / 2 + 90), (a.y + b.y) / 2, 280, { t: api.t });
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 380); ctx.scale(k, k); ctx.translate(-540, -380);
      api.texto('E SE VOCÊ', 540, 250, 92); api.texto('ACORDASSE', 540, 360, 92); api.texto('CONTROLANDO', 540, 470, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 610); ctx.scale(k2, k2); ctx.rotate(-0.03); ctx.translate(-540, -610);
      api.texto('A TERRA?', 540, 610, 150, { cor: Estilo.base.mostarda });
      ctx.restore();
    },

    // despertador tocando, perto da cabeça do Lucas dormindo
    despertador(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.1, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      const cam = fundo(ctx, api, 'quarto', { x: 1.2, y: 1.0, z: 1.2, cy: 900 }, 9);
      const cl = api.camada(), gl = cl.getContext('2d'), q = cam.p(1.55, 0.55, 2.4);
      const rig = new Rig(criarLucas({}, 'perfil'));
      rig.usarPose({ ...LUCAS_POSES.caido.angulos, _desloca: [0, 2.45], cabeca: -6 + Math.sin(u * 2) * 1.5 });
      rig.usarExpressao({ fechado: 'sorriso', sobrancelha: { y: 0, ang: 0 }, boca: { tipo: 'linha', curva: 0.1 } });
      rig.desenhar(gl, q.x + 330, q.y + 40, 1.75 * q.s);
      api.desfocar(cl, 4);
      ctx.restore();
      const [tx, ty] = api.tremor(4);
      Cena.objeto(ctx, 'despertador', 400 + tx, 1530 + ty, 620, { tocando: true, t: u, hora: 6.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    // a mão (detalhada) bate no despertador: para de tocar e o impacto levanta espinhos de terra e poeira
    tapa(ctx, u, d, api) {
      const bate = 0.45, depois = Math.max(0, u - bate);
      const [tx, ty] = u > bate ? api.tremor(18 * Math.exp(-depois * 4)) : [0, 0];
      ctx.save(); ctx.translate(tx, ty);
      fundo(ctx, api, 'quarto', { x: 1.2, y: 1.0, z: 1.25, cy: 900 }, 10);
      Efeitos.impacto(ctx, camEm(400, 1560, 520), 0, 2, api.clamp(depois / 1.3, 0, 0.99), api.t, { tamanho: 0.8 });
      Cena.objeto(ctx, 'despertador', 400, 1530 + (u > bate ? Math.sin(depois * 30) * 6 * Math.exp(-depois * 5) : 0), 620, { tocando: u < bate, t: u, hora: 6.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const desce = api.fase(0.12, bate, 'sai');
      const abre = u < bate ? 0 : 0.1;
      Maos.desenhar(ctx, 470, api.lerp(-300, 900, desce), 330, { ang: Math.PI * 0.94, curl: [0.2 + abre, 0.15, 0.1, 0.15, 0.2], abre: 0.7 });
      ctx.restore();
    },

    // o quarto inteiro treme: livros caem, poeira do teto
    treme(ctx, u, d, api) {
      const [tx, ty] = api.tremor(14);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1300, x: 0.0, y: 1.3, z: 0.3 + u * 0.1, cy: 950, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 1, livrosCaindo: api.fase(0.1, 1.6) });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'espanto' }, 0.05, 2.0, 1.75, { luz: LUZ_JANELA, vida: 2.5 });
      Efeitos.poeiraTeto(ctx, 1080, 1920, api.t, 1);
      ctx.restore();
    },

    // a terra do vaso começa a flutuar (contra a luz da janela)
    vaso(ctx, u, d, api) {
      const p = Cenarios3D.quarto.pontos.vaso;
      const cam = api.camera({ f: 1500, x: -1.15 + u * 0.05, y: 1.4, z: 1.25 + u * 0.08, yaw: -0.62, cy: 960, nevoa: Cenarios3D.quarto.nevoa });
      const prog = api.fase(0.1, d);
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, vasoTerra: 1 - prog * 0.6 });
      const a = cam.p(p[0], p[1] - 0.08, p[2]), b = cam.p(p[0] + 0.15, p[1] + 0.25, p[2] - 0.15);
      Efeitos.terraSubindo(ctx, [a.x, a.y], [b.x, b.y - a.s * 0.1], a.s * 0.6, prog * 0.95, api.t);
    },

    // close na mão (referência 5): os dedos mexem e fecham; a terra se junta em cima da palma
    dedos(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      fundo(ctx, api, 'quarto', { x: -0.6, y: 1.3, z: 0.4, cy: 1050 }, 16);
      ctx.restore();
      const fecha = api.fase(1.3, 2.1, 'suave');
      const curl = [0, 1, 2, 3, 4].map((i) => api.clamp(0.25 + 0.25 * Math.sin(api.t * 7 + i * 0.9) + fecha * 0.75, 0, 1));
      const sway = Math.sin(api.t * 1.6) * 0.04;
      const mao = Maos.desenhar(ctx, 560 + Math.sin(api.t * 1.3) * 12, 1950, 560, { ang: -0.12 + sway, curl, abre: 0.8 - fecha * 0.6 });
      const cx = mao.palma.x + 40, cy = mao.palma.y - 520 + fecha * 120;
      const tam = 0.35 + 0.65 * api.fase(0.1, 1.4);
      for (const pt of mao.pontas.slice(0, 4)) Efeitos.fluxoTerra(ctx, [pt.x, pt.y], [cx, cy], api.t, { forca: 0.9 - fecha * 0.4 });
      Efeitos['poder-terra'](ctx, cx, cy, 300 * (1 - fecha * 0.25), { t: api.t, tamanho: tam });
    },

    // a mãe abre a porta e chama
    mae(ctx, u, d, api) {
      const cam = api.camera({ f: 1500, x: 1.2, y: 1.4, z: 3.0 + u * 0.12, cy: 960, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: api.fase(0, 0.45, 'entra'), t: api.t });
      api.personagem3d(cam, { ...MAE, pose: 'parado', pose2: 'maos-na-cintura', mistura: api.fase(0.5, 0.9), expressao: 'neutro', voz: 'mae' }, 1.3, 4.55, 1.65, { luz: { lado: -1, forca: 0.6 } });
    },

    // susto: a terra cai no tapete; a mãe olha a sujeira
    susto(ctx, u, d, api) {
      const cam = api.camera({ f: 1250, x: 0.35, y: 1.35, z: 0.4 + u * 0.1, cy: 940, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: 1, t: api.t });
      const olhaChao = u > 1.5;
      api.personagem3d(cam, { ...MAE, pose: 'maos-na-cintura', expressao: { ...EXPRESSOES_PADRAO.serio, olhar: [0, olhaChao ? 0.015 : 0] } }, 1.3, 4.5, 1.65, { luz: { lado: -1, forca: 0.6 } });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: u < 0.4 ? 'feliz' : 'medo' }, 0.1, 2.0, 1.75, { luz: LUZ_JANELA });
      const m = rig.pontoMundo('mao_e', [0, 0.3]), chao = cam.p(0.3, 0, 1.9);
      const cai = api.fase(0.4, 1.6);
      if (cai <= 0.01) Efeitos['poder-terra'](ctx, m.x + 40, m.y - 60, 120, { t: api.t, tamanho: 0.8 });
      else Efeitos.terraCaindo(ctx, m.x + 40, m.y - 60, chao.y, 160, cai);
    },

    // rua: atrasado, você bate o pé no chão (câmera atrás do Lucas)
    rua(ctx, u, d, api) {
      const pisa = 1.0, depois = Math.max(0, u - pisa);
      const zc = -1.2 + Math.min(u, pisa) * 1.25;
      const [tx, ty] = u > pisa ? api.tremor(14 * Math.exp(-depois * 3)) : [0, 0];
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1150, x: 0.35, y: 1.35, z: zc, cy: 980, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      const X = 0.45, Z = zc + 2.1;
      Efeitos.rachadura(ctx, cam, [X, Z + 0.2], [X + 0.5, Z + 9], api.clamp(depois / 1.1, 0, 1), api.t, { largura: 0.07, zigue: 0.5 });
      if (u < pisa) api.personagem3d(cam, { ...LUCAS, pose: {}, vista: 'costas', expressao: 'determinado' }, X, Z, 1.75, { caminharFrontal: u });
      else api.personagem3d(cam, { ...LUCAS, pose: 'parado', vista: 'costas', expressao: 'determinado' }, X, Z, 1.75);
      const pe = cam.p(X, 0, Z);
      Efeitos.impacto(ctx, cam, X, Z + 0.2, api.clamp(depois / 1.2, 0, 0.99), api.t, { tamanho: 1.1 });
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.6 });
      ctx.restore();
    },

    // uma onda de terra te leva pra escola (Lucas na crista; vizinho assustado)
    onda(ctx, u, d, api) {
      const zc = -1 + u * 5.5;
      const [tx, ty] = api.tremor(5);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1100, x: 0.2 + Math.sin(u * 2) * 0.05, y: 1.9, z: zc, cy: 1050, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      api.personagem3d(cam, { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: 'parado', registroPoses: 'POSES_PADRAO', vista: 'frente', expressao: u > 0.9 ? 'espanto' : 'neutro' }, 2.2, 10, 1.78);
      const Z = zc + 3.4;
      const crista = Efeitos.ondaTerra(ctx, cam, 0.35, Z, api.t, { largura: 2.4, altura: 1.05 });
      const q = cam.p(0.35, 0, Z);
      api.personagem({ ...LUCAS, pose: 'parado', vista: 'costas', expressao: 'feliz' }, crista.x, crista.y + q.s * 0.05, 1.75 * q.s, { vida: 2 });
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.8 });
      ctx.restore();
    },

    // pátio: o celular do Rafael cai no bueiro
    celular(ctx, u, d, api) {
      const B = Cenarios3D.patio.bueiro;
      const cam = api.camera({ f: 1300, x: 0.9, y: 1.45, z: 0.6 + u * 0.12, cy: 960, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const rig = api.personagem3d(cam, { ...RAFAEL, pose: 'tq', vista: 'tq', espelhar: true, expressao: u < 0.9 ? 'neutro' : 'espanto' }, 1.35, 3.5, 1.8);
      const m = rig.pontoMundo('mao_d', [0, 0.25]), alvo = cam.p(B.x + 0.3, 0, B.z + 0.2);
      const cai = api.fase(0.3, 0.9, 'sai');
      if (cai < 1) celular(ctx, api.lerp(m.x, alvo.x, cai), api.lerp(m.y, alvo.y, cai), alvo.s, cai * 5);
    },

    // você puxa a terra: erupção no bueiro e a coluna traz o celular inteiro
    coluna(ctx, u, d, api) {
      const B = Cenarios3D.patio.bueiro;
      const cam = api.camera({ f: 1050, x: 0.3, y: 1.4, z: -0.4 + u * 0.1, cy: 960, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      api.personagem3d(cam, { ...RAFAEL, pose: 'tq', vista: 'tq', espelhar: true, expressao: 'espanto' }, 1.45, 3.6, 1.8);
      const sobe = api.fase(0.2, 1.6, 'entra');
      Efeitos.erupcao(ctx, cam, B.x + 0.3, B.z + 0.2, api.fase(0.05, 0.9), api.t, { raio: 0.55, altura: 1.6 });
      const b = cam.p(B.x + 0.3, 0, B.z + 0.2), topo = cam.p(B.x + 0.3, 0.2 + sobe * 1.0, B.z + 0.2);
      if (sobe > 0) Efeitos.colunaTerra(ctx, b.x, b.y, topo.y, b.s * 0.45, api.t);
      celular(ctx, topo.x, topo.y - b.s * 0.08, b.s, 0.2, true);
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, -0.9, 2.7, 1.75, { luz: { lado: -1, forca: 0.5 } });
      const m = maoDoRig(rig);
      Efeitos.fluxoTerra(ctx, [m.x + 20, m.y], [topo.x, topo.y + b.s * 0.1], api.t, { forca: 0.8 });
    },

    // Rafael: "Cara... como você fez isso?"
    amigo(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.08, u / d);
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
      fundo(ctx, api, 'patio', { x: 0.5, y: 1.6, z: 1.0, cy: 950 }, 14);
      close(api, { ...RAFAEL, pose: 'parado', expressao: 'espanto', voz: 'rafael' }, 540, 1050, 560);
      ctx.restore();
      celular(ctx, 760, 1720, 2600, -0.2, true);
    },

    // o chão da escola começa a rachar até os pés do Lucas
    racha(ctx, u, d, api) {
      const [tx, ty] = api.tremor(6 + 10 * api.fase(0.5, d));
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1100, x: -0.3, y: 1.5 - u * 0.1, z: -0.5 + u * 0.15, cy: 900 + u * 60, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      Efeitos.rachadura(ctx, cam, [0.8, 9], [-0.35, 2.75], api.fase(0, d * 0.85), api.t, { largura: 0.08, zigue: 0.6, semente: 41 });
      Efeitos.rachadura(ctx, cam, [-2.5, 7], [-0.5, 2.9], api.fase(0.6, d), api.t, { largura: 0.05, semente: 43 });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: u < 0.8 ? 'espanto' : 'medo' }, -0.35, 2.6, 1.75, { luz: { lado: -1, forca: 0.5 }, vida: 2 });
      Efeitos.impacto(ctx, cam, -0.35, 2.75, api.clamp((u - d * 0.8) / 0.9, 0, 0.99), api.t, { tamanho: 0.8 });
      ctx.restore();
    },

    // cartela final: PARTE 1 + chamada para seguir
    parte(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      fundo(ctx, api, 'patio', { x: 0, y: 1.4, z: -0.5 + u * 0.2, cy: 960 }, 18);
      ctx.restore();
      ctx.fillStyle = 'rgba(30,20,20,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 760); ctx.scale(k, k); ctx.translate(-540, -760);
      api.texto('PARTE', 540, 680, 120); api.texto('1', 540, 850, 230, { cor: Estilo.base.mostarda });
      ctx.restore();
      const k2 = api.fase(0.45, 0.8, 'volta');
      ctx.save(); ctx.translate(540, 1130); ctx.scale(k2, k2); ctx.translate(-540, -1130);
      api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 2', 540, 1190, 96, { cor: Estilo.base.mostarda });
      ctx.restore();
      // botão de seguir: aparece e pulsa de leve (sem mão clicando)
      const k3 = api.fase(0.9, 1.2, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

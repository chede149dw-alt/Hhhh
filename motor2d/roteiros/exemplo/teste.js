// Exemplo mínimo de planos (3 planos): capa com a premissa, uma cena no quarto e a cartela final.
// Cada plano: PLANOS[id] = (ctx, u, d, api) — u = segundos desde o início do plano, d = duração.
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const LUZ_JANELA = { lado: -1 };
  const maoDoRig = (rig, lado = 'd') => rig.pontoMundo('mao_' + lado, [0, 0.3]);
  function fundo(ctx, api, cenario, camOpts, px) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D[cenario].nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D[cenario].desenhar(g, cam, { t: api.t });
    api.desfocar(camada, px);
    return cam;
  }

  window.PLANOS = {
    capa(ctx, u, d, api) {
      const z = api.lerp(1, 1.06, u / d);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
      fundo(ctx, api, 'quarto', { x: 0.2, y: 1.2, z: -0.3, cy: 1100 }, 10);
      const rig = api.personagem({ ...LUCAS, pose: 'poder', expressao: 'determinado' }, 330, 2350, 1450, { luz: LUZ_JANELA });
      ctx.restore();
      const a = maoDoRig(rig), b = maoDoRig(rig, 'e');
      Efeitos['poder-terra'](ctx, Math.min(800, (a.x + b.x) / 2 + 90), (a.y + b.y) / 2, 280, { t: api.t });
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); ctx.translate(540, 380); ctx.scale(k, k); ctx.translate(-540, -380);
      api.texto('E SE VOCÊ', 540, 250, 92); api.texto('ACORDASSE', 540, 360, 92); api.texto('CONTROLANDO', 540, 470, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 610); ctx.scale(k2, k2); ctx.translate(-540, -610);
      api.texto('A TERRA?', 540, 610, 150, { cor: Estilo.base.mostarda });
      ctx.restore();
    },

    treme(ctx, u, d, api) {
      const [tx, ty] = api.tremor(14);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1300, x: 0.0, y: 1.3, z: 0.3 + u * 0.1, cy: 950, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 1, livrosCaindo: api.fase(0.1, 1.6) });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'espanto' }, 0.05, 2.0, 1.75, { luz: LUZ_JANELA, vida: 2.5 });
      Efeitos.poeiraTeto(ctx, 1080, 1920, api.t, 1);
      ctx.restore();
    },

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

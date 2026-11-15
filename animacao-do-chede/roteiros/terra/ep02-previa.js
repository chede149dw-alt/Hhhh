// Prévia das peças novas da Terra · Parte 2 (caverna, escada, coração de pedra, golem, mãe com amuleto)
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const GOLEM = { fabrica: 'criarGolem', registroPoses: 'GOLEM_POSES' };
  const LUZ_CRISTAL = { lado: 1, cor: 'rgb(255,165,80)', forca: 0.75 };
  const CV = () => Cenarios3D.caverna;
  window.PLANOS = {
    caverna(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0, 2.2, 9], raio: 9.5, ang: -0.35 + u * 0.06, altura: 2.6, f: 950, ySalvo: 1000, nevoa: CV().nevoa });
      CV().desenhar(ctx, cam, { t: api.t });
      const [nx, , nz] = CV().pontos.nucleo; const q = cam.p(nx, 2.4, nz);
      Efeitos.nucleoTerra(ctx, q.x, q.y, q.s * 2.6, api.t, 0.4);
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'espanto' }, -0.6, 4.0, 1.75, { luz: LUZ_CRISTAL, olhaPara: [nx, nz] });
      api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'espanto' }, 0.4, 3.6, 1.8, { luz: LUZ_CRISTAL, olhaPara: [nx, nz] });
    },
    escada(ctx, u, d, api) {
      const D = Cenarios3D.escada, g = D.degrau(10);
      // câmera dentro do corredor da espiral, alguns degraus acima e atrás do Lucas, olhando para ele
      const ac = g.ang - 1.25, rc = 1.75, cx = Math.cos(ac) * rc, cz = Math.sin(ac) * rc, cy = g.y + (1.25 / 0.42) * 0.24 + 1.7;
      const yaw = Math.atan2(g.x - cx, g.z - cz), dist = Math.hypot(g.x - cx, g.z - cz), f = 820;
      const cam = Cena3D.camera({ f, x: cx, y: cy, z: cz, yaw, cy: 1150 + ((g.y + 1.0 - cy) * f) / dist, nevoa: D.nevoa });
      D.desenhar(ctx, cam, { t: api.t });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'curioso' }, g.x, g.z, 1.75, { y: g.y, luz: { lado: -1, cor: 'rgb(255,150,70)', forca: 0.7 }, rumo: -(g.ang + Math.PI / 2) });
    },
    nucleo(ctx, u, d, api) {
      const [nx, , nz] = CV().pontos.nucleo;
      const cam = api.orbita({ alvo: [nx - 0.6, 1.8, nz - 1.2], raio: 3.2, ang: 0.4, altura: 1.6, f: 1100, ySalvo: 1000, nevoa: CV().nevoa });
      CV().desenhar(ctx, cam, { t: api.t, pulso: 0.6 });
      const q = cam.p(nx, 2.4, nz); Efeitos.nucleoTerra(ctx, q.x, q.y, q.s * 2.6, api.t, 0.7);
      api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, nx - 1.3, nz - 2.0, 1.75, { luz: LUZ_CRISTAL, olhaPara: [nx, nz] });
    },
    golem(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0, 1.9, 8.2], raio: 5.0, ang: 0.45, altura: 1.0, f: 1000, ySalvo: 1080, nevoa: CV().nevoa });
      CV().desenhar(ctx, cam, { t: api.t });
      api.personagem3d(cam, { ...GOLEM, pose: 'punho' }, 1.0, 9.6, 3.2, { luz: LUZ_CRISTAL, olhaPara: [-0.8, 6] });
      api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'raiva' }, -1.4, 6.6, 1.75, { luz: LUZ_CRISTAL, olhaPara: [0.6, 10] });
      api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'medo' }, -0.2, 6.0, 1.8, { luz: LUZ_CRISTAL, olhaPara: [0.6, 10] });
      Efeitos.muroPedra(ctx, cam, 0.6, 7.9, 2.2, 0.75, api.t, { racha: 0.8 });
    },
    mae(ctx, u, d, api) {
      const [ex, ez] = CV().pontos.entrada;
      const cam = api.orbita({ alvo: [ex, 1.4, ez + 1.5], raio: 2.4, ang: -0.9, altura: 1.5, f: 1200, ySalvo: 950, nevoa: CV().nevoa });
      CV().desenhar(ctx, cam, { t: api.t });
      const rig = api.personagem3d(cam, { ...MAE, pose: 'parado', expressao: 'serio' }, ex, ez + 1.5, 1.65, { luz: LUZ_CRISTAL, rumo: -0.9 });
      const p = rig.pontoMundo('tronco', [0, -1.1]);
      if (p.x > -1000) Efeitos.amuleto(ctx, p.x, p.y, rig.escalaPx * 0.32, 1, api.t);
    },
  };
})();

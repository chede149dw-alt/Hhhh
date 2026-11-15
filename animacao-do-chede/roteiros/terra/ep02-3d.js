// Prévia EM 3D (WebGL) da Terra · Parte 2: caverna, escada do túnel, coração de pedra, golem com o muro, mãe com o amuleto.
// O cenário e todos os efeitos (coração, pedras orbitando, onda, cristais, rio de luz, poeira, muro) são 3D de verdade;
// os personagens continuam 2D, em placas dentro do 3D, recebendo sombra no chão.
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const GOLEM = { fabrica: 'criarGolem', registroPoses: 'GOLEM_POSES' };
  const LUZ = { lado: 1, cor: 'rgb(255,165,80)', forca: 0.75 };
  const T3 = () => Terra3D;
  const batida = (t) => Math.pow(Math.max(0, Math.sin(t * Math.PI * 1.1)), 6); // coração batendo
  window.PLANOS = {
    caverna(ctx, u, d, api) {
      const [nx, , nz] = T3().pontos.nucleo;
      const cam = api.orbita({ alvo: [0, 2.2, 9], raio: 9.5, ang: -0.35 + u * 0.12, altura: 2.4, f: 950, ySalvo: 1000 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'espanto' }, -0.6, 4.0, 1.75, { luz: LUZ, olhaPara: [nx, nz] }) },
        { f: () => api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'espanto' }, 0.4, 3.6, 1.8, { luz: LUZ, olhaPara: [nx, nz] }) },
      ], { pulso: batida(api.t) * 0.6 });
    },
    escada(ctx, u, d, api) {
      const D = T3().escada, zL = 3.0 + u * 0.75, yL = D.yEm(zL), xL = D.X0 - 0.35;
      const cam = api.orbita({ alvo: [xL, yL + 0.95, zL], raio: 3.1, ang: Math.PI - 0.95 + u * 0.08, altura: yL + 0.55, f: 980, ySalvo: 1080 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: {}, expressao: { ...LUCAS_EXPRESSOES.curioso, olhar: [0.01, 0.012] } }, xL, zL, 1.75, { y: yL, descer: api.t, luz: LUZ, rumo: Math.PI }) },
      ], { nucleo: false, luzes: [{ x: xL, y: yL + 1.6, z: zL + 1.2, cor: '#FFB070', forca: 1.2, raio: 5 }] });
    },
    nucleo(ctx, u, d, api) {
      const [nx, , nz] = T3().pontos.nucleo;
      const cam = api.orbita({ alvo: [nx - 0.9, 1.8, nz - 0.8], raio: 4.4, ang: -0.45 + u * 0.15, altura: 1.5, f: 1050, ySalvo: 1000 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'apontando', expressao: { ...LUCAS_EXPRESSOES.curioso, olhar: [0.014, -0.006] } }, nx - 1.7, nz - 1.4, 1.75, { luz: LUZ, olhaPara: [nx, nz] }) },
      ], { pulso: 0.25 + 0.75 * batida(api.t) });
    },
    golem(ctx, u, d, api) {
      // a câmera gira em volta da luta (teste do "personagem girando em volta do golem com a câmera junto")
      const G = [1.0, 9.6], L = [-1.4, 6.6], R = [-0.2, 6.0], M = [0.55, 8.0];
      const cam = api.orbita({ alvo: [0, 1.9, 8.0], raio: 5.2, ang: 0.25 + u * 0.35, altura: 1.1, f: 1000, ySalvo: 1080 });
      T3().cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...GOLEM, pose: 'punho' }, G[0], G[1], 3.2, { luz: LUZ, olhaPara: R }) },
        { f: () => api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'raiva' }, L[0], L[1], 1.75, { luz: LUZ, olhaPara: G }) },
        { f: () => api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'medo' }, R[0], R[1], 1.8, { luz: LUZ, olhaPara: G }) },
      ], { nucleo: false, muro: { x: M[0], z: M[1], larg: 2.2, sobe: Math.min(1, 0.3 + u * 1.4), racha: Math.max(0, u * 2 - 1), giro: 0.3 },
        luzes: [{ x: L[0] + 0.3, y: 1.5, z: L[1] + 0.5, cor: '#FFB060', forca: 1.5, raio: 5 }] });
    },
    mae(ctx, u, d, api) {
      const [ex, ez] = T3().pontos.entrada;
      const cam = api.orbita({ alvo: [ex, 1.4, ez + 1.5], raio: 2.6, ang: -0.9 + u * 0.08, altura: 1.5, f: 1200, ySalvo: 950 });
      T3().cena(ctx, api, cam, [
        { f: () => { const rig = api.personagem3d(cam, { ...MAE, pose: 'parado', expressao: 'serio' }, ex, ez + 1.5, 1.65, { luz: LUZ, rumo: -0.9 });
          const p = rig.pontoMundo && rig.pontoMundo('tronco', [0, -1.1]); if (p && p.x > -1000) Efeitos.amuleto(ctx, p.x, p.y, rig.escalaPx * 0.32, 1, api.t); return rig; } },
      ], { pulso: 0.3, luzes: [{ x: ex, y: 1.3, z: ez + 1.2, cor: '#FF9A40', forca: 1.0, raio: 3 }] });
    },
  };
})();

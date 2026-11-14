// VALDOR · Prévia dos efeitos da Parte 2 (cenário de noite, olhos, transformação e rugido). Roteiro: previa-noite.json
(function () {
  const DAVIJ = { fabrica: 'criarDaviJogo', registroPoses: 'DAVI_JOGO_POSES' };
  const TEOJ = { fabrica: 'criarTeoJogo', registroPoses: 'POSES_PADRAO' };
  const FERA = (e) => ({ fabrica: 'criarTeoFera', opcoes: { estagio: e }, registroPoses: 'TEO_FERA_POSES' });
  const LOBO = { fabrica: 'criarTeoLobisomem', registroPoses: 'TEO_LOBISOMEM_POSES' };
  const W = 1080, H = 1920;
  const LUZ_LUA = { lado: -1, forca: 0.85, cor: 'rgb(150,185,255)', sombra: 1 };
  const V = () => Cenarios3D.valdorNoite;
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const chave = (T, lista) => { if (T <= lista[0][0]) return lista[0][1]; for (let i = 0; i < lista.length - 1; i++) { const [t0, v0] = lista[i], [t1, v1] = lista[i + 1]; if (T <= t1) { const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0); return v0 + (v1 - v0) * k; } } return lista[lista.length - 1][1]; };

  // cena de noite: personagens numa camada própria (tom de noite + recorte azul), depois o cenário e o primeiro plano
  function noite(ctx, api, cam, n, personagens, o = {}) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
    const rigs = personagens.map((f) => f(cam));
    const P = api.camada(), gp = P.getContext('2d');
    gp.drawImage(ctx.canvas, 0, 0); gp.globalCompositeOperation = 'source-atop'; gp.fillStyle = `rgba(22,36,100,${0.34 * n})`; gp.fillRect(0, 0, W, H);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (o.desfoque) { const F = api.camada(); V().desenhar(F.getContext('2d'), cam, { t: api.t, noite: n }); api.desfocar(F, o.desfoque); }
    else V().desenhar(ctx, cam, { t: api.t, noite: n });
    if (o.antes) o.antes(cam, rigs);
    ctx.drawImage(P, 0, 0);
    if (o.depois) o.depois(cam, rigs);
    V().frente(ctx, cam, { t: api.t, noite: n, forca: o.forca === undefined ? 0.7 : o.forca });
    return rigs;
  }

  window.PLANOS = {
    // 1) o pôr do sol vira noite; os dois de costas olhando o céu
    anoitecer(ctx, u, d, api) {
      const n = api.ease.suave(api.clamp((u - 0.3) / 3.6, 0, 1));
      const cam = api.camera({ f: 1150, x: chave(u, [[0, -0.3], [d, 0.2]]), y: chave(u, [[0, 1.2], [d, 1.55]]), z: chave(u, [[0, -0.8], [d, 0.4]]), cy: 860, nevoa: V().nevoa(n) });
      noite(ctx, api, cam, n, [
        (c) => api.personagem3d(c, { ...DAVIJ, pose: 'parado', expressao: 'espanto' }, -0.75, 4.4, 1.76, { rumo: Math.PI, luz: { ...LUZ_LUA, forca: 0.85 * n } }),
        (c) => api.personagem3d(c, { ...TEOJ, pose: 'parado', expressao: 'neutro' }, 0.75, 4.5, 1.82, { rumo: Math.PI, luz: { ...LUZ_LUA, forca: 0.85 * n }, semente: 3 }),
      ]);
    },
    // 2) câmera baixa deslizando pela grama: lua, rio com reflexo, espadas com runas, vaga-lumes e neblina
    lua(ctx, u, d, api) {
      const cam = api.camera({ f: 980, x: chave(u, [[0, 0.6], [d, 0.1]]), y: chave(u, [[0, 0.5], [d, 0.75]]), z: chave(u, [[0, 0.6], [d, 2.4]]), cy: 1150, yaw: chave(u, [[0, -0.06], [d, -0.16]]), nevoa: V().nevoa(1) });
      noite(ctx, api, cam, 1, [], { forca: 0.3 });
    },
    // 3) close no Téo: tremendo, os olhos abrem amarelos e brilham
    olhos(ctx, u, d, api) {
      const cam = api.camera({ f: 1150, x: 0.2, y: 1.6, z: 0.5, cy: 820, nevoa: V().nevoa(1) });
      const abre = u > 1.3, e = abre ? 1 : 0, item = { ...FERA(e), pose: 'tremendo', expressao: abre ? 'raiva' : 'cansado' };
      const zoom = chave(u, [[0, 1], [d, 1.12]]), [tx, ty] = api.tremor(u < 1.3 ? 3 : 1.5), Hpx = 560 * zoom;
      noite(ctx, api, cam, 1, [() => { const A = alturaH(item); return api.personagem(item, W * 0.5 + tx, 980 + ty - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: LUZ_LUA }); }], {
        desfoque: 9, forca: 0,
        depois: (c, [rig]) => { if (!abre || !rig || !rig.pontoMundo) return; const k = api.fase(1.3, 1.6); Noite.olhos(ctx, [rig.pontoMundo('cabeca', [-0.2, -0.37]), rig.pontoMundo('cabeca', [0.2, -0.37])].map((p) => [p.x, p.y]), 11, k, api.t); },
      });
    },
    // 4) transformação: energia girando, orelhas, pelo e garras… clarão… lobisomem
    transforma(ctx, u, d, api) {
      const X = 0.35, Z = 4.4, vira = 1.7;
      const cam = api.orbita({ alvo: [X, 1.2, Z], raio: chave(u, [[0, 3.6], [d, 3.0]]), ang: chave(u, [[0, -0.45], [d, 0.25]]), altura: 1.0, f: 1100, ySalvo: 1080, nevoa: V().nevoa(1) });
      const e = Math.min(3, 1 + Math.floor(u / 0.5)), lobo = u >= vira;
      const k = api.fase(0.1, 0.8) * (1 - api.fase(vira + 0.3, vira + 1.2)), [tx] = api.tremor(u > 0.9 && u < vira + 0.4 ? 7 : 0);
      noite(ctx, api, cam, 1, [
        (c) => api.personagem3d(c, { ...DAVIJ, pose: 'parado', expressao: 'espanto' }, -1.25, 4.0, 1.76, { olhaPara: [X, Z], luz: LUZ_LUA }),
        (c) => lobo ? api.personagem3d(c, { ...LOBO, pose: 'garras' }, X, Z, 2.55, { luz: LUZ_LUA }) : api.personagem3d(c, { ...FERA(e), pose: e >= 2 ? 'garras' : 'tremendo', expressao: 'raiva' }, X + tx * 0.002, Z, 1.82 + (e >= 3 ? 0.12 : 0), { luz: LUZ_LUA }),
      ], {
        antes: (c) => { const q = c.p(X, 0, Z); Noite.anelChao(ctx, q.x, q.y, 1.4 * q.s * (1 + api.fase(vira, vira + 0.8)), k); },
        depois: (c) => {
          const q = c.p(X, 0, Z), h = (lobo ? 2.55 : 1.9) * q.s;
          Noite.energia(ctx, q.x, q.y, h, api.t, k);
          Noite.faiscas(ctx, q.x, q.y, h * 0.8, h * 1.3, api.t, Math.max(k, 0.4 * api.fase(vira, vira + 0.2)), 5);
          Noite.clarao(ctx, q.x, q.y - h * 0.5, Math.max(0, 1 - api.fase(vira - 0.05, vira + 0.7)) * (u > vira - 0.15 ? 1 : 0));
        },
      });
    },
    // 5) rugido: câmera baixa, lua atrás da cabeça, onda de choque, olhos brilhando
    rugido(ctx, u, d, api) {
      const ruge = u > 0.7, [tx, ty] = api.tremor(u > 0.75 && u < 1.9 ? 9 : 0);
      const cam = api.camera({ f: chave(u, [[0, 900], [d, 980]]), x: 0.25 + tx * 0.001, y: 0.45 + ty * 0.001, z: chave(u, [[0, 1.4], [d, 1.8]]), cy: 1300, yaw: -0.04, nevoa: V().nevoa(1) });
      noite(ctx, api, cam, 1, [(c) => api.personagem3d(c, { ...LOBO, pose: ruge ? 'rugindo' : 'garras', expressao: ruge ? 'rugido' : 'raiva' }, 0.2, 4.2, 2.6, { luz: { ...LUZ_LUA, forca: 1 } })], {
        forca: 0.45,
        depois: (c, [rig]) => {
          if (!rig || !rig.pontoMundo) return;
          const olhos = [rig.pontoMundo('cabeca', [-0.28, -0.8]), rig.pontoMundo('cabeca', [0.28, -0.8])].map((p) => [p.x, p.y]);
          Noite.olhos(ctx, olhos, 9, ruge ? 1 : 0.6, api.t);
          if (ruge) { const b = rig.pontoMundo('cabeca', [0, -0.2]); for (const atraso of [0, 0.4]) Noite.onda(ctx, b.x, b.y, 1000, api.fase(0.72 + atraso, 1.7 + atraso)); }
        },
      });
    },
  };
})();

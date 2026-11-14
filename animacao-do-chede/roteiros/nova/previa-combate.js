// VALDOR · Prévia dos efeitos de luta da Parte 2: magia elétrica do Davi, esquiva em câmera lenta, dano e corte final.
// Roteiro: previa-combate.json. Inimigo de teste: lobo das sombras (os ladrões ainda vão ganhar ficha).
(function () {
  const DAVIJ = { fabrica: 'criarDaviJogo', registroPoses: 'DAVI_JOGO_POSES' };
  window.criarDaviAdaga = (o = {}, v = 'frente') => window.equipar(window.criarPersonagem({ ...window.DAVI_OPCOES, ...window.DAVI_JOGO_OPCOES, ...o, poses: Object.fromEntries(Object.entries(window.DAVI_JOGO_POSES).map(([k, x]) => [k, x.angulos])) }, v), { ...window.DAVI_JOGO_EQUIP, adagaCinto: undefined, arma: { tipo: 'adaga', mao: 'd' } });
  const DAVIA = { fabrica: 'criarDaviAdaga', registroPoses: 'DAVI_JOGO_POSES' };
  const W = 1080, H = 1920;
  const V = () => Cenarios3D.valdorNoite;
  const LUZ_LUA = { lado: -1, forca: 0.8, cor: 'rgb(150,185,255)', sombra: 1 };
  const PELE = { base: '#5C607C', costas: '#2C3048', barriga: '#A2A6C2', escuro: '#161826', focinho: '#8E92AE' };
  const ESQUIVA = { tronco: -16, cabeca: 10, braco_d: 60, antebraco_d: 35, braco_e: -70, antebraco_e: -25, coxa_d: -40, canela_d: 45, coxa_e: 30, canela_e: 25, _desloca: [0, -0.18] };
  const APANHA = { tronco: -20, cabeca: 16, braco_d: 40, antebraco_d: 50, braco_e: -45, antebraco_e: -40, coxa_d: 10, canela_d: 10, coxa_e: -15, canela_e: 20, _desloca: [0, 0.05] };
  const chave = (T, lista) => { if (T <= lista[0][0]) return lista[0][1]; for (let i = 0; i < lista.length - 1; i++) { const [t0, v0] = lista[i], [t1, v1] = lista[i + 1]; if (T <= t1) { const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0); return v0 + (v1 - v0) * k; } } return lista[lista.length - 1][1]; };
  const remap = (u0, mapa) => { for (let k = 0; k < mapa.length - 1; k++) { const [a, va] = mapa[k], [b, vb] = mapa[k + 1]; if (u0 <= b) return va + ((vb - va) * (u0 - a)) / (b - a); } return mapa[mapa.length - 1][1]; };
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lobo = (cam, api, X, Z, o = {}) => () => { const q = cam.p(X, o.y || 0, Z); Cena3D.sombraChao(cam.__ctx, cam, X, Z, 0.6, 1.6); Criaturas.lobo(cam.__ctx, q.x, q.y, 0.95 * q.s, api.t, { espelhar: true, pelagem: PELE, ...o }); return { q }; };

  // cena de noite com cada personagem numa camada (tom de noite + cor extra: clarão branco, vermelho do dano, azul do rastro)
  function cena(ctx, api, cam, entradas, o = {}) {
    cam.__ctx = ctx;
    const camadas = [], res = [];
    for (const e of entradas) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
      res.push(e.f());
      const L = api.camada(), g = L.getContext('2d'); g.drawImage(ctx.canvas, 0, 0); g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(22,36,100,0.24)'; g.fillRect(0, 0, W, H);
      if (e.cor) { g.fillStyle = e.cor; g.fillRect(0, 0, W, H); }
      camadas.push([L, e.alfa === undefined ? 1 : e.alfa]);
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    V().desenhar(ctx, cam, { t: api.t, noite: 1 });
    if (o.chao) o.chao(res);
    for (const [L, a] of camadas) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(L, 0, 0); ctx.restore(); }
    if (o.depois) o.depois(res);
    V().frente(ctx, cam, { t: api.t, noite: 1, forca: o.forca === undefined ? 0.45 : o.forca });
    if (o.fim) o.fim(res);
    return res;
  }
  const luzMagia = (k) => ({ lado: 1, forca: 0.5 + 0.5 * k, cor: 'rgb(130,200,255)', sombra: 0.8 });
  const brilhoChao = (ctx, x, y, r, k) => { if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(x, y); ctx.scale(1, 0.3); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(120,200,255,${0.55 * k})`); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
  const maos = (rig) => (rig && rig.pontoMundo ? [rig.pontoMundo('mao_d', [0, 0.28]), rig.pontoMundo('mao_e', [0, 0.28])] : null);
  const hudDavi = (ctx, api, vida, atraso, tre = 0) => Combate.hud(ctx, 40, 150, 'DAVI', 5, vida, atraso, { max: 120, corRetrato: '#2E4A8A', tremor: tre, t: api.t });

  window.PLANOS = {
    // 1) carregando o feitiço: círculo de runas, luz sendo puxada para as mãos, arcos estalando
    carga(ctx, u, d, api) {
      const cam = api.camera({ f: 1150, x: chave(u, [[0, -0.35], [d, -0.55]]), y: 1.2, z: chave(u, [[0, 1.3], [d, 2.3]]), cy: 900, yaw: 0.06, nevoa: V().nevoa(1) });
      const kc = api.fase(0.3, 2.4), DX = -0.9, DZ = 4.3;
      cena(ctx, api, cam, [
        { f: lobo(cam, api, 1.7, 5.6, { pose: 'parado' }) },
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: u < 0.35 ? 'parado' : 'conjurando', expressao: 'determinado' }, DX, DZ, 1.76, { olhaPara: [1.7, 5.6], luz: kc > 0.1 ? luzMagia(kc) : LUZ_LUA, vida: 1.2 }) },
      ], {
        chao: () => { const q = cam.p(DX, 0, DZ); brilhoChao(ctx, q.x, q.y, 1.6 * q.s, kc); Valdor.circuloMagico(ctx, q.x, q.y, 0.85 * q.s, { k: api.fase(0.2, 1.1), t: api.t }); },
        depois: ([, rig]) => {
          const m = maos(rig); if (!m) return;
          const c = [(m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2];
          Combate.convergir(ctx, c[0], c[1], 520, api.t, kc);
          for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 16 + 18 * kc, api.t, api.fase(0.4, 1.6));
          Combate.arcoEntre(ctx, [m[0].x, m[0].y], [m[1].x, m[1].y], api.t, api.fase(1.0, 1.8));
        },
      });
    },
    // 2) o raio: clarão, impacto, número crítico, lobo eletrocutado e a vida caindo
    raio(ctx, u, d, api) {
      const sai = 0.3, bate = 0.36, [tx, ty] = api.tremor(u > sai && u < sai + 0.45 ? 13 : 0);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1100, x: -0.12, y: 1.05, z: chave(u, [[0, 0.7], [d, 1.0]]), cy: 960, yaw: 0.0, nevoa: V().nevoa(1) });
      const empurra = api.ease.entra(api.fase(bate, bate + 0.35)), LX = 0.8 + 0.4 * empurra, LZ = 4.9, DX = -1.05, DZ = 4.3;
      const kr = u > sai && u < sai + 0.55 ? 1 - api.fase(sai + 0.3, sai + 0.55) : 0;
      const vida = u < bate ? 1 : 12 / 40, atraso = u < bate ? 1 : 1 - (28 / 40) * api.fase(bate + 0.4, bate + 0.9);
      const res = cena(ctx, api, cam, [
        { f: lobo(cam, api, LX, LZ, { pose: u > bate ? 'atingido' : 'parado', boca: u > bate ? 0.9 : undefined }), cor: u > bate && u < bate + 0.12 ? 'rgba(220,240,255,0.85)' : undefined },
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: 'conjurando', expressao: 'raiva' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: luzMagia(1), vida: 1 }) },
      ], {
        chao: () => { const q = cam.p(DX, 0, DZ); brilhoChao(ctx, q.x, q.y, 1.8 * q.s, 0.6 + 0.4 * kr); Valdor.circuloMagico(ctx, q.x, q.y, 0.85 * q.s, { k: 1 - api.fase(0.8, 1.4), t: api.t }); },
        depois: ([lw, rig]) => {
          const m = maos(rig), alvo = cam.p(LX, 0.45, LZ);
          if (m) { const c = [(m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2]; for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 26, api.t, u < sai ? 1 : 0.4 * (1 - api.fase(sai + 0.5, sai + 1))); Combate.relampago(ctx, c, [alvo.x, alvo.y], api.t, kr, { espessura: 1.2 }); }
          Combate.impacto(ctx, alvo.x, alvo.y, 220, u - bate, { dura: 0.6 });
          Combate.eletrocutado(ctx, alvo.x, alvo.y + 60, 0.9 * alvo.s, 0.7 * alvo.s, api.t, (u > bate ? 1 : 0) * (1 - api.fase(bate + 0.9, bate + 1.6)));
          Criaturas.barraVida(ctx, alvo.x, alvo.y - 0.95 * alvo.s, 0.9 * alvo.s, vida, { max: 40, nome: 'Lobo das sombras', nivel: 'Nv 6', h: 0.09 * alvo.s, atraso });
          Combate.numero(ctx, alvo.x - 40, alvo.y - 230, '28', u - bate, 'critico');
        },
        fim: () => { if (u > sai && u < sai + 0.18) Noite.clarao(ctx, W * 0.5, H * 0.45, 0.75 * (1 - (u - sai) / 0.18), '150,210,255'); hudDavi(ctx, api, 1, 1); },
      });
      ctx.restore();
    },
    // 3) esquiva em câmera lenta: o lobo dá o bote, o Davi sai num borrão azul e o lobo morde o ar
    esquiva(ctx, u0, d, api) {
      const u = remap(u0, [[0, 0], [0.7, 0.7], [2.0, 1.0], [d, 1.0 + (d - 2.0)]]), lento = u0 > 0.7 && u0 < 2.0 ? 1 : 0;
      const cam = api.camera({ f: 1250, x: chave(u0, [[0, 0.0], [d, -0.45]]), y: 0.85, z: chave(u0, [[0, 1.3], [d, 1.6]]), cy: 1000, yaw: -0.02, nevoa: V().nevoa(1) });
      const pulo = cl((u - 0.35) / 0.65), LX = 1.35 + (-0.4 - 1.35) * api.ease.suave(pulo), LY = Math.sin(pulo * Math.PI) * 0.55, LZ = 4.7;
      const sk = api.ease.entra(cl((u - 0.78) / 0.2)), DX = -0.3 + (-1.15 + 0.3) * sk, DZ = 4.4 - 0.3 * sk;
      const pose = sk > 0 && sk < 1 ? ESQUIVA : sk >= 1 ? { tronco: 8, braco_d: 25, antebraco_d: 40, braco_e: -25, antebraco_e: -40, coxa_d: -18, canela_d: 30, coxa_e: 18, canela_e: 30, _desloca: [0, 0.06] } : 'parado';
      const fantasmas = [];
      if (sk > 0.02 && sk < 1) for (let k = 4; k >= 1; k--) { const s2 = Math.max(0, sk - k * 0.16); fantasmas.push({ f: () => api.personagem3d(cam, { ...DAVIJ, pose: ESQUIVA, expressao: 'espanto' }, -0.3 + (-1.15 + 0.3) * s2, 4.4 - 0.3 * s2, 1.76, { olhaPara: [LX, LZ], vida: 0 }), cor: 'rgba(90,170,255,0.75)', alfa: 0.12 + 0.08 * (4 - k) }); }
      cena(ctx, api, cam, [
        ...fantasmas,
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose, expressao: sk > 0 ? 'determinado' : 'espanto' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: LUZ_LUA, vida: 0.3 }) },
        { f: lobo(cam, api, LX, LZ, { y: LY, pose: u < 0.35 ? 'parado' : pulo < 1 ? 'pulando' : 'parado', fase: pulo, boca: pulo >= 1 ? 0.2 + 0.8 * Math.abs(Math.sin(u0 * 14)) : undefined }) },
      ], {
        depois: () => {
          if (sk > 0 && sk < 1) Combate.velocidade(ctx, W * 0.5, H * 0.55, Math.PI, 1, api.t);
          const q = cam.p(DX, 1.95, DZ); Combate.numero(ctx, q.x, q.y, 'ESQUIVA!', u - 0.86, 'esquiva');
          const qp = cam.p(-0.3, 0, 4.6), kp = cl((u - 0.78) / 0.5); if (kp > 0 && kp < 1) for (let i = 0; i < 10; i++) { const a = i * 0.63, r = qp.s * (0.15 + 0.6 * kp); ctx.fillStyle = `rgba(150,160,190,${0.45 * (1 - kp)})`; ctx.beginPath(); ctx.arc(qp.x + Math.cos(a) * r, qp.y - Math.abs(Math.sin(a)) * r * 0.45, qp.s * 0.12 * (0.6 + kp), 0, Math.PI * 2); ctx.fill(); }
        },
        fim: () => {
          // câmera lenta: tom frio, bordas escuras e um leve "respirar" da imagem
          if (lento) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(40,80,160,0.16)'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
          hudDavi(ctx, api, 1, 1);
        },
      });
    },
    // 4) o Davi apanha: congela um instante, pisca branco e vermelho, garras, número vermelho e a vida cai
    dano(ctx, u0, d, api) {
      const bate = 0.55, u = remap(u0, [[0, 0], [bate, bate], [bate + 0.14, bate + 0.01], [d, d - 0.13]]);
      const [tx, ty] = api.tremor(u0 > bate && u0 < bate + 0.4 ? 16 : 0);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1250, x: -0.05, y: 1.1, z: chave(u0, [[0, 1.2], [d, 1.5]]), cy: 920, yaw: 0.03, nevoa: V().nevoa(1) });
      const voa = api.ease.entra(cl((u - bate) / 0.45)), DX = -0.4 - 0.5 * voa, DZ = 4.3, ataque = cl((u - 0.25) / 0.35);
      const LX = 1.05 - 0.6 * api.ease.suave(ataque), LZ = 4.6, LY = Math.sin(ataque * Math.PI) * 0.35;
      const kd = u0 - bate, corDavi = kd > 0 && kd < 0.12 ? 'rgba(255,255,255,0.95)' : kd >= 0.12 && kd < 0.7 ? `rgba(255,30,40,${0.55 * (1 - (kd - 0.12) / 0.58)})` : undefined;
      const vida = u0 < bate ? 1 : 0.88, atraso = u0 < bate ? 1 : 1 - 0.12 * api.fase(bate + 0.5, bate + 1.0);
      cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: kd > 0 ? APANHA : 'parado', expressao: kd > 0 ? 'medo' : 'espanto' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: LUZ_LUA, vida: 0.4 }), cor: corDavi },
        { f: lobo(cam, api, LX, LZ, { y: LY, pose: ataque > 0 && ataque < 1 ? 'pulando' : 'parado', fase: ataque, boca: 0.9 }) },
      ], {
        depois: () => {
          const q = cam.p(DX + 0.1, 1.1, DZ);
          Combate.garras(ctx, q.x, q.y, 0.75 * q.s, kd * 1.6);
          Combate.impacto(ctx, q.x, q.y, 160, kd, { rgb: '255,120,120', dura: 0.45, seed: 9 });
          Combate.numero(ctx, q.x - 60, q.y - 260, '-14', kd, 'recebido');
        },
        fim: () => { Combate.vinhetaDano(ctx, kd > 0 ? Math.exp(-kd * 3) : 0); hudDavi(ctx, api, vida, atraso, kd > 0 && kd < 0.4 ? 8 : 0); },
      });
      ctx.restore();
    },
    // 5) contra-ataque: avanço num borrão, corte em meia-lua, crítico e o lobo vira luz
    golpe(ctx, u0, d, api) {
      const bate = 0.62, u = remap(u0, [[0, 0], [bate, bate], [bate + 0.12, bate + 0.01], [d, d - 0.11]]);
      const [tx, ty] = api.tremor(u0 > bate && u0 < bate + 0.35 ? 14 : 0);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1150, x: chave(u0, [[0, -0.15], [d, 0.15]]), y: 1.0, z: chave(u0, [[0, 0.9], [d, 1.3]]), cy: 960, yaw: 0.0, nevoa: V().nevoa(1) });
      const av = api.ease.entra(cl((u - 0.3) / 0.25)), DX = -1.15 + 1.55 * av, DZ = 4.3 + 0.25 * av, LX = 1.0 + 0.3 * api.ease.entra(cl((u - bate) / 0.4)), LZ = 4.7;
      const dis = cl((u - 1.25) / 0.8), vida = u0 < bate ? 12 / 40 : 0;
      const fantasmas = [];
      if (av > 0.02 && av < 1) for (let k = 4; k >= 1; k--) { const s2 = Math.max(0, av - k * 0.15); fantasmas.push({ f: () => api.personagem3d(cam, { ...DAVIA, pose: 'magia-na-mao', expressao: 'raiva' }, -1.15 + 1.55 * s2, 4.3 + 0.25 * s2, 1.76, { olhaPara: [LX, LZ], vida: 0 }), cor: 'rgba(90,170,255,0.75)', alfa: 0.12 + 0.08 * (4 - k) }); }
      cena(ctx, api, cam, [
        { f: lobo(cam, api, LX, LZ, { pose: u0 > bate ? 'atingido' : 'parado', dissolve: dis }), cor: u0 > bate && u0 < bate + 0.12 ? 'rgba(255,255,255,0.9)' : undefined },
        ...fantasmas,
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: av > 0 ? 'magia-na-mao' : 'parado', expressao: 'raiva' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: LUZ_LUA, vida: 0.6 }) },
      ], {
        depois: () => {
          const alvo = cam.p(LX, 0.5, LZ);
          if (av > 0 && av < 1) Combate.velocidade(ctx, W * 0.5, H * 0.55, 0, 0.9, api.t);
          Combate.corte(ctx, alvo.x - 30, alvo.y, 0.75 * alvo.s, -2.5, 0.5, (u0 - bate + 0.1) / 0.22, { espessura: 0.2 });
          Combate.impacto(ctx, alvo.x, alvo.y, 230, u0 - bate, { dura: 0.6, seed: 5 });
          Criaturas.barraVida(ctx, alvo.x, alvo.y - 0.95 * alvo.s, 0.9 * alvo.s, vida, { max: 40, nome: 'Lobo das sombras', nivel: 'Nv 6', h: 0.09 * alvo.s, atraso: u0 < bate ? vida : (12 / 40) * (1 - api.fase(bate + 0.4, bate + 0.8)), alfa: 1 - dis });
          Combate.numero(ctx, alvo.x + 30, alvo.y - 240, '35', u0 - bate, 'critico');
          if (dis > 0) Noite.faiscas(ctx, alvo.x, alvo.y + 0.4 * alvo.s, 0.9 * alvo.s, 1.6 * alvo.s, api.t, (1 - dis * 0.6), 21, '140,200,255');
        },
        fim: () => hudDavi(ctx, api, 0.88, 0.88),
      });
      ctx.restore();
    },
  };
})();

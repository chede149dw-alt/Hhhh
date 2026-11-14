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
    const tc = o.t === undefined ? api.t : o.t;
    V().desenhar(ctx, cam, { t: tc, noite: 1 });
    if (o.chao) o.chao(res);
    for (const [L, a] of camadas) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(L, 0, 0); ctx.restore(); }
    if (o.depois) o.depois(res);
    V().frente(ctx, cam, { t: tc, noite: 1, forca: o.forca === undefined ? 0.45 : o.forca });
    if (o.fx) camFx(ctx, api, o.fx);
    if (o.fim) o.fim(res);
    return res;
  }
  // efeitos de câmera aplicados no quadro pronto: zoom-soco, inclinação (ângulo holandês) e borrão de movimento
  // fx = { zoom: 1.0.., rolo: rad, borrao: [dx, dy] px, cx, cy }
  function camFx(ctx, api, fx) {
    const zoom = fx.zoom || 1, rolo = fx.rolo || 0, [bx, by] = fx.borrao || [0, 0], cx = fx.cx || W / 2, cy = fx.cy || H / 2;
    if (zoom === 1 && !rolo && !bx && !by) return;
    const L = api.camada(); L.getContext('2d').drawImage(ctx.canvas, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const margem = 1 + Math.abs(rolo) * 1.1 + (Math.abs(bx) + Math.abs(by)) / W;
    ctx.translate(cx, cy); ctx.rotate(rolo); ctx.scale(zoom * margem, zoom * margem); ctx.translate(-cx, -cy);
    const n = bx || by ? 6 : 1;
    for (let i = 0; i < n; i++) { const k = n === 1 ? 0 : i / (n - 1) - 0.5; ctx.globalAlpha = n === 1 ? 1 : i === 0 ? 1 : 1 / (i + 1); ctx.drawImage(L, k * bx, k * by); }
    ctx.restore();
  }
  // zoom-soco: salta rápido e volta devagar; k = tempo desde o golpe
  const soco = (k, forca = 0.14) => (k < 0 ? 1 : 1 + forca * Math.exp(-k * 7) * Math.min(1, k / 0.04));
  const luzMagia = (k) => ({ lado: 1, forca: 0.5 + 0.5 * k, cor: 'rgb(130,200,255)', sombra: 0.8 });
  const brilhoChao = (ctx, x, y, r, k) => { if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(x, y); ctx.scale(1, 0.3); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(120,200,255,${0.55 * k})`); g.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
  const maos = (rig) => (rig && rig.pontoMundo ? [rig.pontoMundo('mao_d', [0, 0.28]), rig.pontoMundo('mao_e', [0, 0.28])] : null);
  const hudDavi = (ctx, api, vida, atraso, tre = 0) => Combate.hud(ctx, 40, 150, 'DAVI', 5, vida, atraso, { max: 120, corRetrato: '#2E4A8A', tremor: tre, t: api.t });

  // derivada numérica (para o borrão de movimento da câmera)
  const vel = (fn, u, h = 1 / 30) => (fn(u + h) - fn(u)) / h;

  window.PLANOS = {
    // 1) carregando o feitiço — câmera gira em volta do Davi e fecha nas mãos
    carga(ctx, u, d, api) {
      const DX = -0.9, DZ = 4.3, kc = api.fase(0.3, 2.4);
      const cam = api.orbita({ alvo: [DX, chave(u, [[0, 1.0], [d, 1.25]]), DZ], raio: chave(u, [[0, 3.8], [d, 1.9]]), ang: chave(u, [[0, -2.0], [d, -1.35]]), altura: chave(u, [[0, 0.7], [d, 1.35]]), f: 1150, ySalvo: 960, nevoa: V().nevoa(1) });
      cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: u < 0.35 ? 'parado' : 'conjurando', expressao: 'determinado' }, DX, DZ, 1.76, { olhaPara: [1.7, 5.6], luz: kc > 0.1 ? luzMagia(kc) : LUZ_LUA, vida: 1.2 }) },
      ], {
        chao: () => { const q = cam.p(DX, 0, DZ); brilhoChao(ctx, q.x, q.y, 1.6 * q.s, kc); Valdor.circuloMagico(ctx, q.x, q.y, 0.85 * q.s, { k: api.fase(0.2, 1.1), t: api.t }); },
        depois: ([rig]) => {
          const m = maos(rig); if (!m) return;
          const c = [(m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2];
          Combate.convergir(ctx, c[0], c[1], 520, api.t, kc);
          for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 16 + 18 * kc, api.t, api.fase(0.4, 1.6));
          Combate.arcoEntre(ctx, [m[0].x, m[0].y], [m[1].x, m[1].y], api.t, api.fase(1.0, 1.8));
        },
        // no fim, a carga "pulsa" a câmera
        fx: { zoom: 1 + 0.03 * kc * (0.5 + 0.5 * Math.sin(api.t * 18)) * api.fase(1.8, 2.6) },
      });
    },
    // 2) o raio — chicote de câmera acompanhando o raio, borrão de movimento e zoom-soco no impacto
    raio(ctx, u, d, api) {
      const sai = 0.3, bate = 0.36, LX0 = 0.8, LZ = 4.9, DX = -1.05, DZ = 4.3;
      const yawF = (x) => chave(x, [[0, 0.22], [sai - 0.02, 0.26], [sai + 0.16, 0.62], [d, 0.66]]);
      const cam = api.camera({ f: 1100, x: -1.85, y: 1.15, z: chave(u, [[0, 1.7], [d, 2.1]]), cy: 940, yaw: yawF(u), nevoa: V().nevoa(1) });
      const empurra = api.ease.entra(api.fase(bate, bate + 0.35)), LX = LX0 + 0.45 * empurra;
      const kr = u > sai && u < sai + 0.55 ? 1 - api.fase(sai + 0.3, sai + 0.55) : 0;
      const vida = u < bate ? 1 : 12 / 40, atraso = u < bate ? 1 : 1 - (28 / 40) * api.fase(bate + 0.4, bate + 0.9);
      const [tx, ty] = api.tremor(u > sai && u < sai + 0.45 ? 14 : 0);
      cena(ctx, api, cam, [
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
          if (u > sai && u < sai + 0.18) Noite.clarao(ctx, W * 0.5, H * 0.45, 0.75 * (1 - (u - sai) / 0.18), '150,210,255');
        },
        fx: { zoom: soco(u - bate, 0.16), borrao: [-vel(yawF, u) * 1100 / 30 * 0.8, 0], cx: W * 0.5 + tx, cy: H * 0.5 + ty },
        fim: () => hudDavi(ctx, api, 1, 1),
      });
    },
    // 3) esquiva em câmera lenta — câmera baixa acompanha, inclina (ângulo holandês) e faz o efeito vertigem
    esquiva(ctx, u0, d, api) {
      const u = remap(u0, [[0, 0], [0.7, 0.7], [2.0, 1.0], [d, 1.0 + (d - 2.0)]]), lento = u0 > 0.7 && u0 < 2.0 ? 1 : 0, tc = api.t - (u0 - u);
      const cam = api.camera({ f: chave(u0, [[0, 1250], [0.7, 1250], [2.0, 900], [d, 950]]), x: chave(u0, [[0, 0.25], [0.7, 0.05], [2.0, -0.45], [d, -0.6]]), y: 0.75, z: chave(u0, [[0, 1.1], [0.7, 1.25], [2.0, 2.15], [d, 2.2]]), cy: 1000, yaw: chave(u0, [[0, 0.02], [2.0, -0.05], [d, -0.06]]), nevoa: V().nevoa(1) });
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
        t: tc,
        depois: () => {
          if (sk > 0 && sk < 1) Combate.velocidade(ctx, W * 0.5, H * 0.55, Math.PI, 1, tc);
          const q = cam.p(DX, 1.95, DZ); Combate.numero(ctx, q.x, q.y, 'ESQUIVA!', u - 0.86, 'esquiva');
          const qp = cam.p(-0.3, 0, 4.6), kp = cl((u - 0.78) / 0.5); if (kp > 0 && kp < 1) for (let i = 0; i < 10; i++) { const a = i * 0.63, r = qp.s * (0.15 + 0.6 * kp); ctx.fillStyle = `rgba(150,160,190,${0.45 * (1 - kp)})`; ctx.beginPath(); ctx.arc(qp.x + Math.cos(a) * r, qp.y - Math.abs(Math.sin(a)) * r * 0.45, qp.s * 0.12 * (0.6 + kp), 0, Math.PI * 2); ctx.fill(); }
          if (lento) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(40,80,160,0.16)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        },
        fx: { rolo: chave(u0, [[0.6, 0], [1.0, -0.085], [1.9, -0.06], [2.25, 0]]), zoom: soco(u0 - 1.2, 0.05) },
        fim: () => {
          if (lento) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
          hudDavi(ctx, api, 1, 1);
        },
      });
    },
    // 4) o Davi apanha — congela, zoom-soco, a câmera recua e dá um tranco inclinado
    dano(ctx, u0, d, api) {
      const bate = 0.55, u = remap(u0, [[0, 0], [bate, bate], [bate + 0.14, bate + 0.01], [d, d - 0.13]]), tc = api.t - (u0 - u), kd = u0 - bate;
      const [tx, ty] = api.tremor(kd > 0 && kd < 0.4 ? 18 : 0), recuo = kd > 0 ? api.ease.entra(cl(kd / 0.3)) : 0;
      const cam = api.camera({ f: 1250, x: chave(u0, [[0, 0.15], [bate, -0.05]]) - 0.15 * recuo, y: 1.1, z: chave(u0, [[0, 1.0], [bate, 1.35]]) - 0.35 * recuo, cy: 920, yaw: 0.03 - 0.03 * recuo, nevoa: V().nevoa(1) });
      const voa = api.ease.entra(cl((u - bate) / 0.45)), DX = -0.4 - 0.5 * voa, DZ = 4.3, ataque = cl((u - 0.25) / 0.35);
      const LX = 1.05 - 0.6 * api.ease.suave(ataque), LZ = 4.6, LY = Math.sin(ataque * Math.PI) * 0.35;
      const corDavi = kd > 0 && kd < 0.12 ? 'rgba(255,255,255,0.95)' : kd >= 0.12 && kd < 0.7 ? `rgba(255,30,40,${0.55 * (1 - (kd - 0.12) / 0.58)})` : undefined;
      const vida = u0 < bate ? 1 : 0.88, atraso = u0 < bate ? 1 : 1 - 0.12 * api.fase(bate + 0.5, bate + 1.0);
      cena(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: kd > 0 ? APANHA : 'parado', expressao: kd > 0 ? 'medo' : 'espanto' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: LUZ_LUA, vida: 0.4 }), cor: corDavi },
        { f: lobo(cam, api, LX, LZ, { y: LY, pose: ataque > 0 && ataque < 1 ? 'pulando' : 'parado', fase: ataque, boca: 0.9 }) },
      ], {
        t: tc,
        depois: () => {
          const q = cam.p(DX + 0.1, 1.1, DZ);
          Combate.garras(ctx, q.x, q.y, 0.75 * q.s, kd * 1.6);
          Combate.impacto(ctx, q.x, q.y, 160, kd, { rgb: '255,120,120', dura: 0.45, seed: 9 });
          Combate.numero(ctx, q.x - 60, q.y - 260, '-14', kd, 'recebido');
        },
        fx: { zoom: soco(kd, 0.2), rolo: kd > 0 ? 0.08 * Math.exp(-kd * 5) : 0, borrao: kd > 0 && kd < 0.25 ? [-35 * (1 - kd / 0.25), 0] : [0, 0], cx: W * 0.45 + tx, cy: H * 0.5 + ty },
        fim: () => { Combate.vinhetaDano(ctx, kd > 0 ? Math.exp(-kd * 3) : 0); hudDavi(ctx, api, vida, atraso, kd > 0 && kd < 0.4 ? 8 : 0); },
      });
    },
    // 5) contra-ataque — a câmera persegue o avanço; no golpe o tempo para e a câmera gira em volta (bullet time)
    golpe(ctx, u0, d, api) {
      const bate = 0.62, u = remap(u0, [[0, 0], [bate + 0.08, bate + 0.08], [bate + 0.85, bate + 0.13], [d, d - 0.72]]), tc = api.t - (u0 - u), k = u - bate;
      const LZ = 4.7, LX = 1.0 + 0.3 * api.ease.entra(cl((u - bate - 0.13) / 0.4));
      const av = api.ease.entra(cl((u - 0.3) / 0.25)), DX = -1.15 + 1.55 * av, DZ = 4.3 + 0.25 * av;
      const alvoX = chave(u0, [[0, -0.6], [0.3, -0.55], [bate, 0.55], [d, 0.75]]);
      const angF = (x) => chave(x, [[0, -0.35], [bate, -0.25], [bate + 0.08, -0.25], [bate + 0.85, 0.42], [d, 0.5]]);
      const cam = api.orbita({ alvo: [alvoX, 0.95, 4.6], raio: chave(u0, [[0, 3.5], [bate, 3.0], [bate + 0.85, 2.5], [d, 3.1]]), ang: angF(u0), altura: chave(u0, [[0, 1.0], [bate + 0.85, 0.85], [d, 1.1]]), f: 1100, ySalvo: 980, nevoa: V().nevoa(1) });
      const [tx, ty] = api.tremor(k > 0 && k < 0.1 ? 14 : (u0 > bate + 0.85 && u0 < bate + 1.1 ? 10 : 0));
      const dis = cl((u - 1.25) / 0.8), vida = u < bate ? 12 / 40 : 0;
      const fantasmas = [];
      if (av > 0.02 && av < 1) for (let j = 4; j >= 1; j--) { const s2 = Math.max(0, av - j * 0.15); fantasmas.push({ f: () => api.personagem3d(cam, { ...DAVIA, pose: 'magia-na-mao', expressao: 'raiva' }, -1.15 + 1.55 * s2, 4.3 + 0.25 * s2, 1.76, { olhaPara: [LX, LZ], vida: 0 }), cor: 'rgba(90,170,255,0.75)', alfa: 0.12 + 0.08 * (4 - j) }); }
      const congelado = u0 > bate + 0.08 && u0 < bate + 0.85;
      cena(ctx, api, cam, [
        { f: lobo(cam, api, LX, LZ, { pose: u > bate ? 'atingido' : 'parado', dissolve: dis }), cor: u0 > bate && u0 < bate + 0.12 ? 'rgba(255,255,255,0.9)' : undefined },
        ...fantasmas,
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: av > 0 ? 'magia-na-mao' : 'parado', expressao: 'raiva' }, DX, DZ, 1.76, { olhaPara: [LX, LZ], luz: LUZ_LUA, vida: 0.6 }) },
      ], {
        t: tc,
        depois: () => {
          const alvo = cam.p(LX, 0.5, LZ);
          if (av > 0 && av < 1) Combate.velocidade(ctx, W * 0.5, H * 0.55, 0, 0.9, tc);
          Combate.corte(ctx, alvo.x - 30, alvo.y, 0.75 * alvo.s, -2.5, 0.5, (k + 0.1) / 0.18, { espessura: 0.2 });
          Combate.impacto(ctx, alvo.x, alvo.y, 230, k, { dura: 0.6, seed: 5 });
          Criaturas.barraVida(ctx, alvo.x, alvo.y - 0.95 * alvo.s, 0.9 * alvo.s, vida, { max: 40, nome: 'Lobo das sombras', nivel: 'Nv 6', h: 0.09 * alvo.s, atraso: u < bate ? vida : (12 / 40) * (1 - cl((u - bate - 0.2) / 0.4)), alfa: 1 - dis });
          Combate.numero(ctx, alvo.x + 30, alvo.y - 240, '35', u - bate - 0.1, 'critico');
          if (dis > 0) Noite.faiscas(ctx, alvo.x, alvo.y + 0.4 * alvo.s, 0.9 * alvo.s, 1.6 * alvo.s, tc, (1 - dis * 0.6), 21, '140,200,255');
          // tempo parado: tom frio e linhas finas em volta (bullet time)
          if (congelado) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(30,60,140,0.14)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        },
        fx: { zoom: soco(u0 - bate, 0.12) * (congelado ? 1.04 : 1), borrao: av > 0.05 && av < 0.95 ? [-70, 0] : [0, 0], cx: W * 0.5 + tx, cy: H * 0.5 + ty },
        fim: () => hudDavi(ctx, api, 0.88, 0.88),
      });
    },
  };
})();

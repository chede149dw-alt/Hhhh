// VALDOR · Parte 1 — "Gastei tudo num videogame". Planos do roteiro roteiros/nova/ep01.json.
// Formato do vídeo de referência: corte a cada 2–3 s, câmera sempre andando, ciência em raio-X, legenda no meio.
// Mundo real: quarto escuro e azulado. Dentro do jogo: campo de Valdor claro e colorido.
(function () {
  const DAVI = { fabrica: 'criarDavi', registroPoses: 'POSES_PADRAO' };
  const DAVIJ = { fabrica: 'criarDaviJogo', registroPoses: 'DAVI_JOGO_POSES' };
  const TEO = { fabrica: 'criarTeo', registroPoses: 'POSES_PADRAO' };
  const TEOJ = { fabrica: 'criarTeoJogo', registroPoses: 'POSES_PADRAO' };
  const FORTE = { fabrica: 'criarJogadorForte', registroPoses: 'POSES_PADRAO' };
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const AMARELO = '#EBC25A';
  const LUZ_CAMPO = { lado: 1, forca: 0.9, cor: 'rgb(255,200,130)', sombra: 0.75 };
  const LUZ_QUARTO = { lado: 1, forca: 0.7, cor: 'rgb(150,190,255)', sombra: 1 };
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reais = (n) => { const [i, c] = Math.abs(n).toFixed(2).split('.'); return 'R$ ' + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + c; };

  function chave(T, lista) {
    if (T <= lista[0][0]) return lista[0][1];
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, v0] = lista[i], [t1, v1] = lista[i + 1];
      if (T <= t1) { const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0); return Array.isArray(v0) ? v0.map((v, j) => v + (v1[j] - v) * k) : v0 + (v1 - v0) * k; }
    }
    return lista[lista.length - 1][1];
  }
  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  function emOrdem(cam, lista) {
    const dist = (X, Z) => (X - cam.x) * (X - cam.x) + (Z - cam.z) * (Z - cam.z);
    lista.slice().sort((a, b) => dist(b[0], b[1]) - dist(a[0], a[1])).forEach((it) => it[2]());
  }
  // zoom em volta de um ponto da tela
  function zoomEm(ctx, x, y, k, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); fn(); ctx.restore(); }

  // ---------- fundos ----------
  // quarto do Davi à noite: o quarto do motor, escurecido e azulado
  function quarto(ctx, api, camOpts, o = {}) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ f: 1100, x: 0, y: 1.3, z: -0.4, cy: 900, nevoa: Cenarios3D.quarto.nevoa, ...camOpts });
    Cenarios3D.quarto.desenhar(g, cam, { t: api.t, portaAberta: o.portaAberta || 0 });
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#5A6688'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    const lua = g.createRadialGradient(W * 0.15, H * 0.35, 50, W * 0.15, H * 0.35, 900); lua.addColorStop(0, 'rgba(140,180,255,0.18)'); lua.addColorStop(1, 'rgba(140,180,255,0)');
    g.fillStyle = lua; g.fillRect(0, 0, W, H);
    g.restore();
    if (o.desfoque) api.desfocar(camada, o.desfoque); else ctx.drawImage(camada, 0, 0);
    return cam;
  }
  function campo(ctx, api, camOpts, o = {}) {
    const cam = api.camera({ f: 1150, x: 0, y: 1.45, z: 0, cy: 860, nevoa: Cenarios3D.valdor.nevoa, ...camOpts });
    if (o.desfoque) {
      const camada = api.camada(), g = camada.getContext('2d');
      Cenarios3D.valdor.desenhar(g, cam, { t: api.t });
      api.desfocar(camada, o.desfoque);
    } else Cenarios3D.valdor.desenhar(ctx, cam, { t: api.t });
    if (o.desfoque) Cenarios3D.valdor.luz(ctx, cam, { t: api.t });
    return cam;
  }
  function escuroVitrine(ctx) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, H * 0.75);
    g.addColorStop(0, '#1A1D2C'); g.addColorStop(1, '#05060A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function flash(ctx, k) { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // brilho de olhos (homem-fera): pontos amarelos nos olhos do rig (vista de frente)
  function olhosFera(ctx, rig, k) {
    if (k <= 0) return;
    for (const sx of [-1, 1]) { const p = rig.pontoMundo('cabeca', [0.19 * sx, -0.37]); Valdor.brilhoRadial(ctx, p.x, p.y, rig.escalaPx * 0.35, '255,210,60', 0.9 * k); ctx.fillStyle = `rgba(255,236,140,${k})`; ctx.beginPath(); ctx.arc(p.x, p.y, rig.escalaPx * 0.05, 0, TAU); ctx.fill(); }
  }
  // cartas de vidro girando em volta de um ponto; as de trás antes do personagem, as da frente depois
  function cartasEmVolta(api, ctx, nomes, cx, cy, raio, giro, escolhida, brilho, desenhaMeio, alfaMul = 1) {
    const itens = nomes.map((n, i) => { const a = giro + (i * TAU) / nomes.length; return { n, a, prof: Math.cos(a) }; });
    const desenha = (it) => {
      const k = 0.72 + 0.28 * (it.prof + 1) / 2, x = cx + Math.sin(it.a) * raio, y = cy + it.prof * 40;
      Valdor.carta(ctx, x, y, 250 * k, 360 * k, it.n, { icone: Valdor.ICONES[it.n], brilho: it.n === escolhida ? brilho : 0, alfa: alfaMul * (0.55 + 0.45 * (it.prof + 1) / 2) });
    };
    itens.filter((it) => it.prof < 0).sort((a, b) => a.prof - b.prof).forEach(desenha);
    const r = desenhaMeio();
    itens.filter((it) => it.prof >= 0).sort((a, b) => a.prof - b.prof).forEach(desenha);
    return r;
  }

  window.PLANOS = {
    // CAPA DO REELS/TIKTOK (padrão do autor): protagonista grande no centro com a magia na mão vindo para a câmera,
    // dois personagens atrás nas laterais (menores e mais escuros), fundo roxo com círculo de runas e silhueta do castelo,
    // logo VALDOR no alto (brilho atrás das letras), título metálico embaixo (prata + dourado) e selo "PARTE 1".
    capaReels(ctx, u, d, api) {
      const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1A0B3A'); g.addColorStop(0.45, '#3A1478'); g.addColorStop(0.75, '#22104E'); g.addColorStop(1, '#0C0620');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const rnd = rng(31);
      for (let i = 0; i < 26; i++) { const x = rnd() * W, y = rnd() * 900, r = 120 + rnd() * 220; const n = ctx.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, 'rgba(120,70,200,0.35)'); n.addColorStop(1, 'rgba(120,70,200,0)'); ctx.fillStyle = n; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      // círculo de runas de pé atrás do Davi
      Valdor.circuloMagico(ctx, 540, 560, 440, { k: 1, t: 1.2, achata: 1, rgb: '190,140,255', colunas: false });
      // montanhas, castelo e espadas gigantes em silhueta
      ctx.fillStyle = '#1A0C3A'; ctx.beginPath(); ctx.moveTo(0, 1000);
      for (const [x, y] of [[0, 820], [160, 700], [300, 820], [430, 640], [560, 780], [700, 610], [860, 760], [1000, 680], [1080, 740]]) ctx.lineTo(x, y);
      ctx.lineTo(W, 1100); ctx.lineTo(0, 1100); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#120828';
      ctx.fillRect(640, 520, 120, 140); for (const [tx, th] of [[620, 210], [740, 190], [685, 260]]) { ctx.fillRect(tx, 660 - th, 40, th); ctx.beginPath(); ctx.moveTo(tx - 8, 660 - th); ctx.lineTo(tx + 20, 600 - th); ctx.lineTo(tx + 48, 660 - th); ctx.fill(); }
      for (const [x, a, h] of [[120, -0.2, 420], [960, 0.18, 380]]) { ctx.save(); ctx.translate(x, 1000); ctx.rotate(a); ctx.fillRect(-22, -h, 44, h); ctx.fillRect(-75, -h * 0.82, 150, 26); ctx.fillRect(-12, -h * 1.12, 24, h * 0.3); ctx.beginPath(); ctx.arc(0, -h * 1.14, 24, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = 'rgba(200,160,255,0.75)'; for (let i = 0; i < 30; i++) { const x = 600 + rnd() * 200, y = 420 + rnd() * 220; ctx.fillRect(x, y, 5, 8); }
      // Téo (esq.) e Kael (dir.) atrás, mais escuros
      close(api, { ...TEOJ, pose: 'maos-na-cintura', expressao: 'determinado', vista: 'tq' }, 220, 690, 320, { parado: true, luz: { lado: 1, cor: 'rgb(190,150,255)', forca: 0.8 } });
      close(api, { ...FORTE, pose: 'parado', expressao: 'serio', vista: 'tq', espelhar: true }, 870, 680, 330, { parado: true, luz: { lado: -1, cor: 'rgb(190,150,255)', forca: 0.8 } });
      ctx.fillStyle = 'rgba(30,10,70,0.4)'; ctx.fillRect(0, 0, W, 1250);
      // Davi grande no centro, olhando para a câmera, magia na mão vindo para a frente
      const rig = close(api, { ...DAVIJ, pose: { braco_d: 70, antebraco_d: 22, braco_e: -8, antebraco_e: 4, _magia: 1.4 }, expressao: 'determinado' }, 560, 640, 430, { parado: true, luz: { lado: -1, cor: 'rgb(200,160,255)', forca: 0.9 } });
      const m = rig && rig.pontoMundo ? rig.pontoMundo('mao_d', [0, 0.25]) : { x: 300, y: 1050 };
      Valdor.esferaEnergia(ctx, Math.max(250, m.x), m.y - 10, 120, 1.3, 1);
      // logo VALDOR: brilho mágico ATRÁS das letras
      Valdor.brilhoRadial(ctx, 540, 300, 520, '160,110,255', 0.9);
      Valdor.circuloMagico(ctx, 540, 300, 300, { k: 1, t: 0.5, achata: 0.3, rgb: '200,160,255', colunas: false });
      ctx.save(); ctx.translate(540, 300);
      ctx.font = '900 168px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(167,121,255,0.95)'; ctx.shadowBlur = 40;
      ctx.lineJoin = 'round'; ctx.strokeStyle = '#140826'; ctx.lineWidth = 22; ctx.strokeText('VALDOR', 0, 0);
      ctx.shadowBlur = 0;
      const lg = ctx.createLinearGradient(0, -80, 0, 80); lg.addColorStop(0, '#F3EBFF'); lg.addColorStop(0.5, '#C9A6FF'); lg.addColorStop(1, '#7B4DFF');
      ctx.fillStyle = lg; ctx.fillText('VALDOR', 0, 0);
      ctx.restore();
      const f = ctx.createLinearGradient(0, 1150, 0, 1700); f.addColorStop(0, 'rgba(12,6,32,0)'); f.addColorStop(0.35, 'rgba(12,6,32,0.8)'); f.addColorStop(1, 'rgba(12,6,32,0.95)');
      ctx.fillStyle = f; ctx.fillRect(0, 1150, W, H - 1150);
      const metal = (txt, y, tam, cores, contorno = '#1A0B30') => {
        ctx.save(); ctx.font = `900 ${tam}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let k = 1; while (ctx.measureText(txt).width * k > 1000) k -= 0.02;
        ctx.translate(540, y); ctx.scale(k, 1);
        ctx.shadowColor = 'rgba(167,121,255,0.9)'; ctx.shadowBlur = 30;
        ctx.lineJoin = 'round'; ctx.strokeStyle = contorno; ctx.lineWidth = tam * 0.16; ctx.strokeText(txt, 0, 0);
        ctx.shadowBlur = 0;
        const gr = ctx.createLinearGradient(0, -tam * 0.5, 0, tam * 0.5); cores.forEach(([o, c]) => gr.addColorStop(o, c));
        ctx.fillStyle = gr; ctx.fillText(txt, 0, 0);
        ctx.restore();
      };
      const PRATA = [[0, '#FFFFFF'], [0.45, '#D7D2E6'], [0.55, '#9C94B4'], [1, '#E9E5F5']];
      const OURO = [[0, '#FFF2B0'], [0.45, '#FFC83D'], [0.55, '#D98A12'], [1, '#FFD45E']];
      metal('GASTEI TUDO', 1290, 130, PRATA);
      metal('NUM', 1400, 92, PRATA);
      metal('VIDEOGAME', 1525, 160, OURO);
      ctx.save(); ctx.translate(540, 1690);
      ctx.fillStyle = '#2A1060'; ctx.strokeStyle = '#B98CFF'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-230, 0); ctx.lineTo(-195, -62); ctx.lineTo(195, -62); ctx.lineTo(230, 0); ctx.lineTo(195, 62); ctx.lineTo(-195, 62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(185,140,255,0.8)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-420, 0); ctx.lineTo(-250, 0); ctx.moveTo(250, 0); ctx.lineTo(420, 0); ctx.stroke();
      ctx.restore();
      metal('PARTE 1', 1693, 84, PRATA);
    },

    // 1) gancho: caixa misteriosa no quarto escuro + premissa
    capa(ctx, u, d, api) {
      const cam = quarto(ctx, api, { x: 0.15 - u * 0.05, y: 1.1, z: -0.6 + u * 0.25, cy: 860 });
      const q = cam.p(0.1, 0, 2.6);
      const br = api.fase(1.6, 2.8);
      Valdor.caixaVR(ctx, q.x, q.y, 1.1 * q.s, api.t, { brilho: br, tampa: br * 0.6 });
      // feixe da janela na caixa
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const g = ctx.createLinearGradient(0, 300, q.x, q.y); g.addColorStop(0, 'rgba(150,190,255,0)'); g.addColorStop(1, 'rgba(150,190,255,0.22)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-100, 250); ctx.lineTo(160, 220); ctx.lineTo(q.x + 0.8 * q.s, q.y); ctx.lineTo(q.x - 0.8 * q.s, q.y + 30); ctx.closePath(); ctx.fill();
      ctx.restore();
      const k = api.fase(0, 0.35, 'volta');
      zoomEm(ctx, 540, 380, k, () => { api.texto('E SE UM', 540, 260, 96); api.texto('VIDEOGAME', 540, 375, 110); api.texto('PAGASSE SEU', 540, 490, 96); });
      const k2 = api.fase(0.3, 0.65, 'volta');
      zoomEm(ctx, 540, 640, k2, () => api.texto('ALUGUEL?', 540, 640, 165, { cor: AMARELO }));
    },

    // 2) saldo juntando por dois anos
    saldo(ctx, u, d, api) {
      quarto(ctx, api, { x: -0.6, y: 1.2, z: 0.4 + u * 0.1, yaw: 0.3 }, { desfoque: 16 });
      const v = 8430 * api.fase(0.1, 1.8, 'entra');
      Valdor.celular(ctx, 540 + Math.sin(api.t * 1.3) * 8, 1020 + Math.sin(api.t * 1.7) * 10, 1200 * api.lerp(1, 1.05, u / d), { saldo: reais(v), titulo: 'SALDO · 2 ANOS JUNTANDO', linhas: [] });
      Valdor.brilhoRadial(ctx, 540, 900, 600, '120,170,255', 0.18);
    },

    // 3) comprou: botão COMPRAR e o saldo despencando
    comprar(ctx, u, d, api) {
      quarto(ctx, api, { x: -0.6, y: 1.2, z: 0.5 + u * 0.1, yaw: 0.3 }, { desfoque: 16 });
      const desce = api.fase(1.0, 1.9, 'entra');
      const v = desce < 0.5 ? api.lerp(8430, 312, desce * 2) : api.lerp(312, 7.9, (desce - 0.5) * 2);
      const tre = u > 1.0 && u < 1.4 ? Math.sin(u * 80) * 10 : 0;
      const linhas = desce > 0.1 ? [['CADEIRA VR', '- R$ 6.890,00'], ['CAPACETE VR', '- R$ 1.230,10']] : [];
      if (desce > 0.55) linhas.push(['FRETE', '- R$ 302,00']);
      Valdor.celular(ctx, 540 + tre, 1020, 1200 * api.lerp(1.05, 1.1, u / d), { saldo: reais(v), vermelho: desce > 0.3, botao: clamp(u / 1.0, 0, 1) * (desce > 0.2 ? 0 : 1), titulo: 'SALDO', linhas });
    },

    // 4) "A mãe dele ainda não sabe": Davi abraçado na caixa, olha para a porta (reação em 3 tempos)
    mae(ctx, u, d, api) {
      const z = api.lerp(1, 1.05, api.fase(0.9, d));
      zoomEm(ctx, 540, 900, z, () => {
        quarto(ctx, api, { x: 0.2, y: 1.35, z: 0.2, yaw: 0.12 }, { desfoque: 10, portaAberta: 0.15 });
        const olhos = u < 0.4 ? { ...window.EXPRESSOES_PADRAO.neutro, olhar: [0.03, 0] } : 'preocupado';
        const rig = close(api, { ...DAVI, pose: 'parado', expressao: olhos, vistaCabeca: u > 0.4 ? 'tq' : undefined }, 520, 760, 470, { luz: LUZ_QUARTO });
        const m = rig.pontoMundo('quadril', [0, -0.2]);
        Valdor.caixaVR(ctx, m.x, m.y + 260, 560, api.t, {});
      });
      // fresta de luz da porta
      Valdor.brilhoRadial(ctx, 1040, 760, 380, '255,200,140', 0.25 + 0.05 * Math.sin(api.t * 2));
    },

    // 5) itens em feixes de luz, acendendo um por um
    itens(ctx, u, d, api) {
      escuroVitrine(ctx);
      const z = api.lerp(1, 1.06, u / d);
      zoomEm(ctx, 540, 900, z, () => {
        const xs = [230, 540, 850], rgb = ['200,200,215', '62,142,240', '155,92,255'], rot = ['COMUM', 'RARO', 'ÉPICO'];
        for (let i = 0; i < 3; i++) {
          const k = api.fase(i * 0.55, i * 0.55 + 0.35, 'volta');
          if (k <= 0) continue;
          Valdor.feixe(ctx, xs[i], 200, 1200, 300, rgb[i], k);
          const y = 860 + Math.sin(api.t * 2 + i) * 14;
          zoomEm(ctx, xs[i], y, k, () => {
            if (i === 0) Valdor.escudoComum(ctx, xs[i], y, 200);
            if (i === 1) Valdor.anelRaro(ctx, xs[i], y, 220, api.t);
            if (i === 2) Valdor.adagaEpica(ctx, xs[i], y + 40, 300, api.t, -0.5);
          });
          Valdor.texto(ctx, rot[i], xs[i], 1340, 46, `rgb(${rgb[i]})`, { peso: 900 });
        }
      });
    },

    // 6) etiquetas de preço; a da adaga pulsa e a câmera vai para ela
    precos(ctx, u, d, api) {
      escuroVitrine(ctx);
      const z = api.lerp(1.06, 1.22, api.fase(0.8, d)), zx = api.lerp(540, 850, api.fase(0.8, d));
      zoomEm(ctx, zx, 950, z, () => {
        const xs = [230, 540, 850], rgb = ['200,200,215', '62,142,240', '155,92,255'], preco = ['R$ 2', 'R$ 90', 'R$ 15.000'];
        for (let i = 0; i < 3; i++) {
          Valdor.feixe(ctx, xs[i], 200, 1200, 300, rgb[i], 1);
          const y = 860 + Math.sin(api.t * 2 + i) * 14;
          if (i === 0) Valdor.escudoComum(ctx, xs[i], y, 200);
          if (i === 1) Valdor.anelRaro(ctx, xs[i], y, 220, api.t);
          if (i === 2) Valdor.adagaEpica(ctx, xs[i], y + 40, 300, api.t, -0.5, { brilho: 1 + 0.4 * Math.sin(api.t * 6) });
          const k = api.fase(0.15 + i * 0.3, 0.45 + i * 0.3, 'volta') * (i === 2 ? 1 + 0.06 * Math.sin(api.t * 8) : 1);
          Valdor.etiqueta(ctx, xs[i], 1340, preco[i], `rgb(${rgb[i]})`, k, { tam: i === 2 ? 52 : 50 });
        }
      });
    },

    // 7) gente trabalhando em cápsulas, moedas subindo
    capsulas(ctx, u, d, api) {
      Valdor.capsulas(ctx, api.t, { moedas: true, avanca: u * 0.45, horizonte: 760 });
    },

    // 8) 1 em 1.000: grade de pontos, um fica roxo e a câmera mergulha nele
    raro(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { oy: u * 20 });
      const kz = api.fase(1.9, d, 'sai');
      const alvo = [540 - 960 / 2 + (960 / 25) * 17.5, 860 - (40 * 960 / 25) / 2 + (960 / 25) * 23.5];
      zoomEm(ctx, alvo[0], alvo[1], 1 + kz * 5, () => {
        Valdor.grade1000(ctx, 540, 860, 960, api.fase(0, 1.4, 'linear'), api.fase(1.45, 1.75, 'volta'), api.t);
      });
      const k = api.fase(1.5, 1.8, 'volta');
      zoomEm(ctx, 540, 1640, k, () => { api.texto('1 EM 1.000', 540, 1640, 130, { cor: '#C9A8FF' }); });
    },

    // 9) o Téo chega na porta com a mesma caixa; a câmera gira e revela o Davi
    teo(ctx, u, d, api) {
      const T = u;
      const cam = api.orbita({ alvo: chave(T, [[0, [1.2, 1.2, 4.3]], [d, [0.2, 1.2, 3.4]]]), raio: chave(T, [[0, 2.6], [d, 3.6]]), ang: chave(T, [[0, 0.35], [d, -0.25]]), altura: 1.4, f: 1050, ySalvo: 980, nevoa: Cenarios3D.quarto.nevoa });
      const camada = api.camada(), g = camada.getContext('2d');
      Cenarios3D.quarto.desenhar(g, cam, { t: api.t, portaAberta: 1 });
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#56628E'; g.fillRect(0, 0, W, H); g.restore();
      ctx.drawImage(camada, 0, 0);
      Valdor.brilhoRadial(ctx, cam.p(1.35, 1.2, 4.95).x, cam.p(1.35, 1.2, 4.95).y, 500, '255,200,140', 0.35);
      emOrdem(cam, [
        [1.3, 4.4, () => {
          const r = api.personagem3d(cam, { ...TEO, pose: 'parado', expressao: 'feliz' }, 1.3, 4.4, 1.82, { olhaPara: [-0.5, 2.6], luz: LUZ_QUARTO });
          if (r.escalaPx) { const m = r.pontoMundo('quadril', [0, -0.25]); Valdor.caixaVR(ctx, m.x, m.y + r.escalaPx * 0.9, r.escalaPx * 1.4, api.t, {}); }
        }],
        [-0.5, 2.6, () => api.personagem3d(cam, { ...DAVI, pose: 'acenando', expressao: 'rindo' }, -0.5, 2.6, 1.76, { olhaPara: [1.3, 4.4], luz: LUZ_QUARTO })],
      ]);
    },

    // 10) os dois põem o capacete; o visor acende
    novatos(ctx, u, d, api) {
      quarto(ctx, api, { x: 0, y: 1.4, z: 0.6 + u * 0.08 }, { desfoque: 14 });
      const desce = api.fase(0.3, 1.3, 'entra'), visorK = api.fase(1.4, 1.9);
      const rigs = [close(api, { ...DAVI, pose: 'parado', expressao: 'determinado' }, 300, 780, 360, { luz: LUZ_QUARTO }), close(api, { ...TEO, pose: 'parado', expressao: 'feliz' }, 790, 760, 350, { luz: LUZ_QUARTO, semente: 2 })];
      for (const r of rigs) {
        const c = r.pontoMundo('cabeca', [0, -0.5]);
        Valdor.capacete(ctx, c.x, api.lerp(c.y - 700, c.y - r.escalaPx * 0.05, desce), r.escalaPx * 1.25, visorK, api.t);
      }
      Valdor.brilhoRadial(ctx, 540, 760, 700, '111,200,255', 0.25 * visorK);
    },

    // 11) raio-X: o ouvido interno (labirinto)
    ouvido(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { ox: -u * 15 });
      const z = api.lerp(1, 1.7, api.fase(0.6, d)), ox = 540 + 0.05 * 330, oy = 900 + 0.1 * 330;
      zoomEm(ctx, ox, oy, z, () => Valdor.cabecaRaio(ctx, 540, 900, 330, { t: api.t, ouvido: api.fase(0.5, 1.5) }));
    },

    // 12) o capacete manda um pulso para o labirinto
    pulso(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { ox: -u * 15 });
      Valdor.cabecaRaio(ctx, 560, 760, 260, { t: api.t, ouvido: 1, capacete: true, onda: u / d });
      // detalhe ampliado do labirinto embaixo
      const k = api.fase(0.4, 0.8, 'volta');
      zoomEm(ctx, 540, 1520, k, () => {
        ctx.fillStyle = 'rgba(8,33,41,0.85)'; ctx.beginPath(); ctx.arc(540, 1520, 250, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(214,246,250,0.8)'; ctx.lineWidth = 6; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(540, 1520, 246, 0, TAU); ctx.clip();
        Valdor.labirinto(ctx, 520, 1540, 120, api.t * 2.5, { brilho: 0.6 + 0.4 * Math.sin(api.t * 8) });
        for (let i = 0; i < 3; i++) { const p = (u * 1.4 + i * 0.33) % 1; ctx.strokeStyle = `rgba(140,215,255,${1 - p})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(300 + p * 180, 1500, 60 + p * 40, -0.8, 0.8); ctx.stroke(); }
        ctx.restore();
      });
      Valdor.texto(ctx, 'LABIRINTO', 540, 1830, 54, '#BFE6FF', { peso: 900 });
    },

    // 13) o cérebro acredita que você está andando
    cerebro(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { ox: -api.t * 220 });
      Valdor.corpoRaio(ctx, 560, 1700, 1250, api.t * 1.1, { cerebro: api.fase(0.2, 0.8) });
      // chão correndo
      ctx.strokeStyle = 'rgba(214,246,250,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 1705); ctx.lineTo(W, 1705); ctx.stroke();
      for (let i = 0; i < 8; i++) { const x = ((i * 160 - api.t * 380) % 1280 + 1280) % 1280 - 100; ctx.fillStyle = 'rgba(214,246,250,0.4)'; ctx.fillRect(x, 1712, 60, 6); }
    },

    // 14) o visor acende: linha de luz abrindo e o campo de Valdor
    visor(ctx, u, d, api) {
      const cam = campo(ctx, api, { x: 0.1, y: 1.6 + u * 0.05, z: -3 + u * 0.6, f: 1050, cy: 900 });
      const apar = api.fase(1.7, 2.4);
      if (apar > 0) {
        emOrdem(cam, [
          [-0.7, 5, () => api.personagem3d(cam, { ...DAVI, pose: 'parado', expressao: 'espanto' }, -0.7, 5, 1.76, { luz: LUZ_CAMPO })],
          [0.8, 5.3, () => api.personagem3d(cam, { ...TEO, pose: 'parado', expressao: 'feliz' }, 0.8, 5.3, 1.82, { luz: LUZ_CAMPO })],
        ]);
        for (const [X, Z] of [[-0.7, 5], [0.8, 5.3]]) { const q = cam.p(X, 0.9, Z); Valdor.brilhoRadial(ctx, q.x, q.y, 260, '200,240,255', 0.9 * (1 - apar)); }
      }
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.8 });
      const tk = api.fase(0.9, 1.5);
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha = 0.85 * tk;
        api.texto('VALDOR', 540, 430 - tk * 20, 190, { cor: '#F4FAFF' });
        Valdor.texto(ctx, 'B E M - V I N D O S', 540, 560 - tk * 20, 44, '#FFFFFF', { peso: 800, contorno: 'rgba(40,70,110,0.6)' });
        ctx.restore();
      }
      Valdor.visor(ctx, api.fase(0.15, 1.1));
    },

    // 15) escolha da raça: cartas de vidro girando em volta do Davi
    raca(ctx, u, d, api) {
      campo(ctx, api, { x: 0.3, y: 1.5, z: 0, yaw: -0.05 + u * 0.03 }, { desfoque: 9 });
      const esc = api.fase(1.3, 1.7);
      const rig = cartasEmVolta(api, ctx, ['HUMANO', 'ELFO', 'ANÃO', 'HOMEM-FERA'], 540, 1080, 400, -u * 0.9 + 1.2, 'HUMANO', esc,
        () => close(api, { ...DAVI, pose: esc > 0.5 ? 'acenando' : 'parado', expressao: esc > 0.5 ? 'feliz' : 'neutro' }, 540, 760, 400, { luz: LUZ_CAMPO }));
    },

    // 16) o Téo escolhe homem-fera; os olhos brilham amarelos por um instante
    fera(ctx, u, d, api) {
      campo(ctx, api, { x: -0.3, y: 1.5, z: 0, yaw: 0.06 - u * 0.03 }, { desfoque: 9 });
      const esc = api.fase(0.9, 1.3);
      const z = api.lerp(1, 1.08, api.fase(1.5, d));
      zoomEm(ctx, 540, 700, z, () => {
        const rig = cartasEmVolta(api, ctx, ['HOMEM-FERA', 'HUMANO', 'ELFO', 'ANÃO'], 540, 1080, 400, -u * 0.9 + 0.9, 'HOMEM-FERA', esc,
          () => close(api, { ...TEO, pose: 'parado', expressao: u > 1.6 ? 'determinado' : 'neutro', cabecaEsquerda: false }, 540, 760, 400, { luz: LUZ_CAMPO, semente: 3 }));
        olhosFera(ctx, rig, api.fase(1.5, 1.7) * (1 - api.fase(2.2, 2.5)));
      });
    },

    // 17) classe: o Davi escolhe MAGO; brilho, a roupa vira manto e o círculo de runas acende
    classe(ctx, u, d, api) {
      const cam = campo(ctx, api, { x: 0, y: 1.2, z: 0.6 + u * 0.1, cy: 820 }, { desfoque: 6 });
      const troca = u > 1.25, esc = api.fase(0.8, 1.1);
      const nomes = ['MAGO', 'ASSASSINO', 'GUARDIÃO', 'PALADINO'];
      const cartasK = 1 - api.fase(1.15, 1.35);
      const desenhaDavi = () => {
        if (troca) Valdor.circuloMagico(ctx, 540, 1640, 330, { k: api.fase(1.3, 1.9), t: api.t });
        const r = api.personagem(troca ? { ...DAVIJ, pose: 'conjurando' } : { ...DAVI, pose: 'parado', expressao: 'neutro' }, 540, 1640, 1050, { luz: LUZ_CAMPO });
        if (troca) for (const l of ['d', 'e']) { const m = r.pontoMundo('mao_' + l, [0, 0.2]); Valdor.esferaEnergia(ctx, m.x, m.y, 34, api.t, api.fase(1.5, 1.9) * 0.8); }
        return r;
      };
      if (cartasK > 0) cartasEmVolta(api, ctx, nomes, 540, 1000, 420, -u * 1.1 + 0.6, 'MAGO', esc, desenhaDavi, cartasK);
      else desenhaDavi();
      flash(ctx, Math.max(0, 1 - Math.abs(u - 1.25) / 0.18) * 0.9);
    },

    // 18) o Téo vira guardião
    guardiao(ctx, u, d, api) {
      campo(ctx, api, { x: 0.2, y: 1.2, z: 0.6 + u * 0.1, cy: 820, yaw: 0.04 }, { desfoque: 6 });
      const troca = u > 0.45;
      api.personagem(troca ? { ...TEOJ, pose: 'maos-na-cintura', expressao: 'determinado' } : { ...TEO, pose: 'parado', expressao: 'feliz' }, 540, 1640, 1080, { luz: LUZ_CAMPO, semente: 3 });
      if (troca) Valdor.brilhoRadial(ctx, 540, 1100, 600, '255,240,200', 0.4 * (1 - api.fase(0.5, 1.4)));
      flash(ctx, Math.max(0, 1 - Math.abs(u - 0.45) / 0.18) * 0.9);
    },

    // 19) nível 1: a magia mal acende e apaga; o Téo bate no escudo de madeira
    nivel(ctx, u, d, api) {
      const cam = campo(ctx, api, { x: 0.1, y: 1.35, z: 1.2 + u * 0.12, cy: 860, f: 1300 });
      const fizz = api.fase(0.3, 0.6) * (1 - api.fase(0.9, 1.3));
      let rigD = null, rigT = null;
      emOrdem(cam, [
        [-0.55, 4.2, () => { rigD = api.personagem3d(cam, { ...DAVIJ, pose: 'magia-na-mao', expressao: u > 1.1 ? 'cansado' : 'espanto' }, -0.55, 4.2, 1.76, { rumo: 0.35, luz: LUZ_CAMPO }); }],
        [0.65, 4.4, () => { rigT = api.personagem3d(cam, { ...TEOJ, pose: u > 1.3 ? 'parado' : 'parado', expressao: u > 1.3 ? 'rindo' : 'neutro' }, 0.65, 4.4, 1.82, { rumo: -0.3, luz: LUZ_CAMPO, semente: 3 }); }],
      ]);
      if (rigD && rigD.escalaPx) { const m = rigD.pontoMundo('mao_d', [0, 0.25]); Valdor.faisca(ctx, m.x, m.y, 50, api.t, fizz); }
      if (rigT && rigT.escalaPx && u > 1.4) { const m = rigT.pontoMundo('antebraco_e', [0, 0.4]); Valdor.dano(ctx, m.x, m.y - 40, 'TOC!', u - 1.45, { tam: 64, cor: '#F2D9A0', sobe: 60, dura: 0.7 }); }
      for (const [r, nv] of [[rigD, 1], [rigT, 1]]) if (r && r.escalaPx) { const c = r.pontoMundo('cabeca', [0, -1.25]); Valdor.placaNivel(ctx, c.x, c.y, nv, api.fase(0, 0.3, 'volta'), { tam: 38 }); }
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.6 });
    },

    // 20) explorando: tomada girando em volta dos dois andando pela trilha
    explorar(ctx, u, d, api) {
      const T = u, zc = 4 + T * 0.9;
      const cam = api.orbita({ alvo: [0.2, 1.0, zc], raio: chave(T, [[0, 4.2], [d, 3.4]]), ang: chave(T, [[0, -1.5], [d, -1.15]]), altura: 1.5, f: 1150, ySalvo: 1000, nevoa: Cenarios3D.valdor.nevoa });
      Cenarios3D.valdor.desenhar(ctx, cam, { t: api.t });
      emOrdem(cam, [
        [-0.35, zc, () => api.personagem3d(cam, { ...DAVIJ, pose: 'parado', expressao: 'determinado' }, -0.35, zc, 1.76, { rumo: Math.PI, caminhar: api.t, luz: LUZ_CAMPO })],
        [0.75, zc + 0.3, () => api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'feliz' }, 0.75, zc + 0.3, 1.82, { rumo: Math.PI, caminhar: api.t + 0.3, luz: LUZ_CAMPO, semente: 3 })],
      ]);
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.7 });
    },

    // 21) primeiro monstro: um lobo jovem chega rosnando (estilo da referência de batalha)
    gosma(ctx, u, d, api) {
      const cam = campo(ctx, api, { x: 0.3, y: 1.1, z: 0.3 + u * 0.1, cy: 900, f: 1050, yaw: -0.02 });
      const anda = api.fase(0, 1.2, 'sai'), gx = api.lerp(3.2, 0.7, anda), gz = 5.8;
      emOrdem(cam, [
        [gx, gz, () => {
          const q = cam.p(gx, 0, gz);
          api.rosto(q.x, q.y - 0.55 * q.s, 0.75 * q.s);
          Criaturas.lobo(ctx, q.x, q.y, 0.95 * q.s, api.t, { espelhar: true, pose: anda < 1 ? 'andando' : 'parado', fase: u * 1.4 });
          Criaturas.barraVida(ctx, q.x, q.y - 1.35 * q.s, 0.9 * q.s, 1, { max: 8, nome: 'Lobo jovem', nivel: 'Nv 1', h: 0.1 * q.s, alfa: api.fase(1.0, 1.3) });
        }],
        [-0.55, 3.9, () => api.personagem3d(cam, { ...DAVIJ, pose: u > 1.4 ? 'conjurando' : 'parado', expressao: u > 1.4 ? 'determinado' : 'espanto' }, -0.55, 3.9, 1.76, { olhaPara: [gx, gz], luz: LUZ_CAMPO })],
        [1.05, 4.1, () => api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'espanto' }, 1.05, 4.1, 1.82, { olhaPara: [gx, gz], luz: LUZ_CAMPO, semente: 3 })],
      ]);
      if (u > 1.4) { const q = cam.p(-0.55, 0, 3.9); Valdor.circuloMagico(ctx, q.x, q.y, 0.7 * q.s, { k: api.fase(1.4, 2.0), t: api.t }); }
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.6 });
    },

    // 21b) "O lobo deu o bote... e o Davi saltou pra trás num borrão." — câmera baixa, quase no chão (referência de batalha)
    bote(ctx, u, d, api) {
      const tre = u > 1.45 && u < 1.75 ? api.tremor(12) : [0, 0];
      ctx.save(); ctx.translate(tre[0], tre[1]);
      const cam = campo(ctx, api, { x: -0.55 - api.clamp((u - 1.3) / 0.6, 0, 1) * 0.35, y: 0.6, z: 0.9, cy: 1020, f: 1050, yaw: 0.02 });
      // Davi salta para trás em 0,25 s (borrão), o lobo pousa onde ele estava e morde o ar
      const salto = api.ease.entra(api.clamp((u - 1.3) / 0.28, 0, 1));
      const dX = api.lerp(-0.2, -1.75, salto), dZ = api.lerp(4.4, 4.0, salto);
      const pulo = api.clamp((u - 0.45) / 1.0, 0, 1);
      const lx = u < 0.45 ? 1.9 : api.lerp(1.9, 0.15, api.ease.suave(pulo)), lz = 4.6;
      const ly = Math.sin(pulo * Math.PI) * 0.55;
      const posePulo = u < 0.45 ? 'parado' : pulo < 1 ? 'pulando' : 'parado';
      const poseDavi = salto > 0 && salto < 1 ? { tronco: -14, cabeca: 8, braco_d: 55, antebraco_d: 30, braco_e: -60, antebraco_e: -20, coxa_d: -35, canela_d: 40, coxa_e: 25, canela_e: 20, _desloca: [0, -0.15] } : (u < 1.3 ? 'parado' : { tronco: 8, braco_d: 25, antebraco_d: 40, braco_e: -25, antebraco_e: -40, coxa_d: -18, canela_d: 30, coxa_e: 18, canela_e: 30, _desloca: [0, 0.06] });
      emOrdem(cam, [
        [lx, lz, () => {
          const q = cam.p(lx, ly, lz), qc = cam.p(lx, 0, lz);
          Cena3D.sombraChao(ctx, cam, lx, lz, 0.6, 1.6);
          api.rosto(q.x, q.y - 0.55 * q.s, 0.75 * q.s);
          Criaturas.lobo(ctx, q.x, q.y, 0.95 * q.s, api.t, { espelhar: true, pose: posePulo, fase: pulo, boca: pulo >= 1 ? 0.2 + 0.8 * Math.abs(Math.sin(u * 14)) : undefined });
        }],
        [dX, dZ, () => {
          // rastro do borrão: cópias transparentes no caminho do salto
          if (salto > 0.05 && salto < 1) for (let k = 3; k >= 1; k--) {
            const sk = Math.max(0, salto - k * 0.18), gx = api.lerp(-0.2, -1.75, sk);
            ctx.save(); ctx.globalAlpha = 0.18 * (4 - k) / 3; api.personagem3d(cam, { ...DAVIJ, pose: poseDavi, expressao: 'espanto' }, gx, dZ, 1.76, { olhaPara: [lx, lz], semRosto: true, vida: 0 }); ctx.restore();
          }
          api.personagem3d(cam, { ...DAVIJ, pose: poseDavi, expressao: u < 1.3 ? 'espanto' : 'medo' }, dX, dZ, 1.76, { olhaPara: [lx, lz], luz: LUZ_CAMPO, vida: 0.4 });
          // poeira levantada no salto e no pouso do lobo
          for (const [px, t0] of [[-0.2, 1.3], [0.15, 1.45]]) {
            const k = api.clamp((u - t0) / 0.6, 0, 1); if (k <= 0 || k >= 1) continue;
            const q = cam.p(px, 0, dZ + 0.3);
            for (let i = 0; i < 9; i++) { const a = i * 0.7, r = q.s * (0.15 + 0.5 * k); ctx.fillStyle = `rgba(190,160,120,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(q.x + Math.cos(a) * r, q.y - Math.abs(Math.sin(a)) * r * 0.5, q.s * 0.12 * (0.6 + k), 0, Math.PI * 2); ctx.fill(); }
          }
        }],
      ]);
      // linhas de velocidade no salto
      if (salto > 0 && salto < 1) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = 700 + i * 80, x = 200 + ((i * 137) % 600); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 260, y); ctx.stroke(); } ctx.restore(); }
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.7 });
      ctx.restore();
    },

    // 21c) "Mas o segundo bote pegou a perna dele, e o lobo arrastou ele pelo chão." — close na perna (mordida, mastigando,
    //      puxando) e depois o arrasto pelo chão, com a vida do Davi caindo e o aviso LENTO (referência de batalha)
    mordida(ctx, u, d, api) {
      const vidaD = u < 0.1 ? 1 : u < 0.7 ? 0.8 : u < 1.3 ? 0.6 : u < 1.9 ? 0.45 : api.lerp(0.45, 0.3, api.clamp((u - 1.9) / 1.5, 0, 1));
      if (u < 1.9) {
        // close (nível da referência ref-mordida-nivel.jpg): fundo escuro desfocado, perna do Davi com costuras e marcas
        // de dente, bota com fivelas; a cabeça do lobo crava os dentes na panturrilha, mastiga e puxa.
        campo(ctx, api, { x: 0.3, y: 0.35, z: 2.6, cy: 1240, f: 1400 }, { desfoque: 18 });
        ctx.fillStyle = 'rgba(14,10,18,0.62)'; ctx.fillRect(0, 0, W, H);
        const vg = ctx.createRadialGradient(560, 900, 200, 560, 900, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        const chew = Math.sin(u * 20), puxa = Math.sin(u * 8.5) * 26 - api.clamp((u - 0.2) / 1.5, 0, 1) * 40;
        const sh = Math.sin(u * 37) * 6 + puxa * 0.35, ang = 0.06 + puxa * 0.0012;
        const legX = 640 + sh;
        // perna (calça) — atravessa a tela de cima até a bota
        const perna = () => {
          ctx.save(); ctx.translate(legX, 0); ctx.rotate(ang);
          const g = ctx.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, '#6E5846'); g.addColorStop(0.55, '#5A4636'); g.addColorStop(1, '#3A2C22');
          ctx.fillStyle = g; ctx.strokeStyle = '#1E140F'; ctx.lineWidth = 9;
          ctx.beginPath(); ctx.moveTo(-150, -80); ctx.lineTo(150, -80); ctx.quadraticCurveTo(160, 600, 120, 1180); ctx.lineTo(-115, 1180); ctx.quadraticCurveTo(-150, 600, -150, -80); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#C9A24A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-118, 80); ctx.quadraticCurveTo(-128, 600, -98, 1170); ctx.stroke();
          ctx.setLineDash([16, 12]); ctx.strokeStyle = 'rgba(230,210,180,0.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, -60); ctx.quadraticCurveTo(80, 600, 50, 1170); ctx.stroke(); ctx.setLineDash([]);
          // marcas de dente / pano rasgado
          ctx.strokeStyle = 'rgba(30,20,15,0.85)'; ctx.lineWidth = 6;
          for (const [a, b, c] of [[-60, 760, 0.5], [-30, 840, 0.4], [10, 800, 0.6], [-80, 900, 0.3], [30, 900, 0.5]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + 70 * c + 40, b + 30 * c); ctx.stroke(); }
          // bota de couro com fivelas e pena roxa
          ctx.fillStyle = '#7A4E2E'; ctx.strokeStyle = '#1E140F'; ctx.lineWidth = 9;
          ctx.beginPath(); ctx.moveTo(-140, 1120); ctx.lineTo(140, 1110); ctx.lineTo(150, 1470); ctx.quadraticCurveTo(330, 1490, 360, 1560); ctx.lineTo(-150, 1570); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#5E3A20'; ctx.fillRect(-150, 1100, 300, 70); ctx.strokeRect(-150, 1100, 300, 70);
          for (const yb of [1260, 1380]) { ctx.fillStyle = '#3E2A1C'; ctx.fillRect(-150, yb, 300, 34); ctx.strokeStyle = '#C8CCD8'; ctx.lineWidth = 6; ctx.strokeRect(40, yb - 4, 44, 42); }
          ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(240,220,190,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-110, 1180); ctx.lineTo(-110, 1540); ctx.stroke(); ctx.setLineDash([]);
          for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? '#B48CFF' : '#8E5BE8'; ctx.save(); ctx.translate(150, 1110); ctx.rotate(0.5 + k * 0.35); ctx.beginPath(); ctx.ellipse(0, -60, 22, 70, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
          ctx.fillStyle = '#1E140F'; ctx.fillRect(-155, 1560, 530, 32);
          ctx.restore();
        };
        // sombra no chão
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(700, 1600, 420, 50, 0, 0, Math.PI * 2); ctx.fill();
        // lobo: cabeça grande à esquerda com a boca na panturrilha (camada de trás → perna → ponta por cima)
        const s = 540, hx = legX - 145 - 0.66 * s + Math.sin(u * 8.5) * 14, hy = 880 + chew * 12, giro = -0.04 + Math.sin(u * 8.5) * 0.05;
        const boca = 0.32 + 0.22 * (chew * 0.5 + 0.5);
        perna();
        Criaturas.cabecaLobo(ctx, hx, hy, s, api.t, { boca, giro });
        api.rosto(hx, hy - 120, 330);
        // baba e pedacinhos de pano voando na mastigada
        for (let i = 0; i < 7; i++) { const k = ((u * 2.4 + i / 7) % 1); ctx.fillStyle = i % 2 ? `rgba(90,70,54,${1 - k})` : `rgba(225,235,255,${0.75 * (1 - k)})`; ctx.beginPath(); ctx.arc(legX - 120 + Math.cos(i * 2.3) * k * 190, 880 - k * 140 + k * k * 300, 9 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); }
        // impactos da mordida e dano
        for (const [t0, dano] of [[0.08, '-4'], [0.68, '-4'], [1.28, '-3']]) {
          const k = u - t0;
          if (k > 0 && k < 0.18) { Valdor.brilhoRadial(ctx, legX - 110, 880, 300, '255,80,60', 0.75 * (1 - k / 0.18)); const [tx, ty] = api.tremor(14); ctx.translate(tx * 0.3, ty * 0.3); }
          Valdor.dano(ctx, legX + 230, 700, dano, k, { tam: 120, cor: '#FF6B5E', dura: 0.6 });
        }
      } else {
        // arrasto: câmera baixa, o lobo anda de ré puxando o Davi deitado pela perna; poeira atrás
        const v = u - 1.9;
        const lx = 0.6 + v * 0.75, lz = 4.6;
        const cam = campo(ctx, api, { x: lx - 1.15, y: 0.7, z: 2.0, cy: 1000, f: 980, yaw: -0.03 });
        const qL = cam.p(lx, 0, lz);
        // Davi deitado: pés junto da boca do lobo, cabeça para a esquerda
        const pes = cam.p(lx - 0.62, 0.32, lz);
        ctx.save(); ctx.translate(pes.x, pes.y); ctx.rotate(-Math.PI / 2 + 0.06 * Math.sin(api.t * 18));
        api.personagem({ ...DAVIJ, pose: { braco_d: 160, antebraco_d: 10, braco_e: -165, antebraco_e: -10, coxa_d: -6, coxa_e: 4 }, expressao: 'medo', vista: 'perfil' }, 0, 0, 1.76 * pes.s, { vida: 0.3, semRosto: true });
        ctx.restore();
        api.rosto(pes.x - 1.4 * pes.s, pes.y, 0.4 * pes.s);
        // poeira e marcas no chão
        for (let i = 0; i < 12; i++) { const k = ((api.t * 2 + i / 12) % 1), q = cam.p(lx - 0.8 - k * 1.8, 0.05 + k * 0.25, lz + (i % 3 - 1) * 0.15); ctx.fillStyle = `rgba(185,155,115,${0.45 * (1 - k)})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (0.08 + k * 0.18), 0, Math.PI * 2); ctx.fill(); }
        Criaturas.lobo(ctx, qL.x, qL.y, 0.95 * qL.s, api.t, { espelhar: true, pose: 'andando', fase: -v * 2.2, boca: 0.35 });
        api.rosto(qL.x - 0.55 * qL.s, qL.y - 0.6 * qL.s, 0.6 * qL.s);
        // Téo correndo para ajudar, entrando pela esquerda
        if (v > 0.6) api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'raiva' }, api.lerp(-2.6, -1.2, api.clamp((v - 0.6) / 1.4, 0, 1)), 4.2, 1.82, { rumo: -Math.PI / 2, caminhar: api.t * 1.6, velocidade: 1.4, luz: LUZ_CAMPO, semente: 3 });
        Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.6 });
        // aviso LENTO
        const k = api.fase(2.2, 2.45, 'volta');
        if (k > 0) { ctx.save(); ctx.translate(540, 420); ctx.scale(k, k); ctx.fillStyle = 'rgba(20,14,20,0.85)'; ctx.beginPath(); ctx.roundRect(-110, -34, 220, 68, 18); ctx.fill(); ctx.strokeStyle = '#7FB8FF'; ctx.lineWidth = 4; ctx.stroke(); Valdor.texto(ctx, 'LENTO', 0, 2, 40, '#BFE0FF', { peso: 900 }); ctx.restore(); }
      }
      // barra de vida do Davi (verde → vermelha)
      const cores = vidaD > 0.5 ? ['#8FF09A', '#2FA35A'] : vidaD > 0.35 ? ['#FFD36A', '#E09A2A'] : ['#FF7A7A', '#D23A42'];
      Criaturas.barraVida(ctx, 540, 300, 420, vidaD, { max: 20, nome: 'Davi', nivel: 'Nv 1', h: 34, cores });
    },

    // 22) "O Davi se preparou e lançou um feitiço de eletricidade, enquanto o Téo bloqueou. E finalizou com um corte seco!"
    //     0–1,4 s: Davi carrega a magia (círculo de runas + esfera na mão) · 1,4–2,3: raio de eletricidade no lobo (3)
    //     2,6–3,1: o lobo pula e o Téo bloqueia · 4,1–4,75: Davi avança e dá o corte seco (5) · 5,0: o lobo vira luz
    golpe(ctx, u0, d, api) {
      const mapa = [[0, 0], [1.4, 0.2], [1.7, 0.45], [2.3, 0.6], [2.6, 0.62], [3.1, 0.92], [3.6, 1.15], [4.1, 1.2], [4.5, 1.5], [4.75, 1.55], [5.0, 1.75], [5.4, 2.0], [9, 2.4]];
      let u = 0; for (let k = 0; k < mapa.length - 1; k++) { const [a, va] = mapa[k], [b, vb] = mapa[k + 1]; if (u0 <= b) { u = va + (vb - va) * (u0 - a) / (b - a); break; } }
      const [tx, ty] = (u > 0.85 && u < 1.05) || (u > 1.5 && u < 1.75) || (u > 0.42 && u < 0.55) ? api.tremor(10) : [0, 0];
      ctx.save(); ctx.translate(tx, ty);
      const cam = campo(ctx, api, { x: 0.3 - u0 * 0.04, y: 1.35, z: 0.6 + u0 * 0.06, cy: 880, f: 1100, yaw: 0.02 + u0 * 0.01 });
      const pulo = api.clamp((u - 0.62) / 0.3, 0, 1), volta = api.clamp((u - 0.92) / 0.28, 0, 1);
      const G = [api.lerp(api.lerp(0.9, 1.25, pulo), 1.6, volta), 5.2];
      const anda = api.ease.suave(api.clamp((u - 1.2) / 0.3, 0, 1));
      const davX = api.lerp(-0.9, 0.35, anda), davZ = api.lerp(3.9, 4.8, anda);
      const tf = api.ease.suave(api.clamp((u - 0.5) / 0.2, 0, 1)), teoX = api.lerp(1.4, 0.95, tf), teoZ = api.lerp(4.0, 4.6, tf);
      const est = api.clamp((u - 1.75) / 0.25, 0, 1);
      const vida = u < 0.45 ? 1 : u < 1.55 ? 5 / 8 : 0;
      const poseLobo = u > 1.55 ? 'atingido' : (u > 0.62 && u < 0.92) ? 'pulando' : (u > 0.4 && u < 0.62) || (u > 0.92 && u < 1.15) ? 'atingido' : 'parado';
      const carrega = api.clamp(u0 / 1.3, 0, 1) * (u0 < 2.3 ? 1 : 0);
      let rigD = null;
      emOrdem(cam, [
        [G[0], G[1], () => {
          const q = cam.p(G[0], 0, G[1]);
          api.rosto(q.x, q.y - 0.55 * q.s, 0.75 * q.s);
          Criaturas.lobo(ctx, q.x, q.y, 0.95 * q.s, api.t, { espelhar: true, pose: poseLobo, fase: pulo, dissolve: est });
          Criaturas.barraVida(ctx, q.x, q.y - 1.35 * q.s, 0.9 * q.s, vida, { max: 8, nome: 'Lobo jovem', nivel: 'Nv 1', h: 0.1 * q.s, atraso: u < 1.55 ? Math.max(vida, 1 - api.clamp((u - 0.5) / 0.3, 0, 1) * 3 / 8) : 5 / 8 * (1 - api.clamp((u - 1.6) / 0.3, 0, 1)), alfa: 1 - est });
        }],
        [davX, davZ, () => {
          if (carrega > 0) { const q = cam.p(davX, 0, davZ); Valdor.circuloMagico(ctx, q.x, q.y, 0.75 * q.s, { k: carrega, t: api.t }); }
          rigD = api.personagem3d(cam, { ...DAVIJ, pose: u < 0.9 ? 'magia-na-mao' : 'parado', expressao: u0 < 1.3 ? 'determinado' : 'raiva' }, davX, davZ, 1.76, { olhaPara: G, luz: LUZ_CAMPO, vida: 1.6 });
        }],
        [teoX, teoZ, () => api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'determinado' }, teoX, teoZ, 1.82, { olhaPara: G, luz: LUZ_CAMPO, semente: 3 })],
      ]);
      const qg = cam.p(G[0], 0.45, G[1]);
      if (rigD && rigD.escalaPx && u0 < 1.45) { const m = rigD.pontoMundo('mao_d', [0, 0.25]); Valdor.esferaEnergia(ctx, m.x, m.y, 18 + 34 * carrega, api.t, 0.4 + 0.6 * carrega); }
      if (rigD && rigD.escalaPx && u > 0.2 && u < 0.6) { const m = rigD.pontoMundo('mao_d', [0, 0.25]); Valdor.raioMagia(ctx, [m.x, m.y], [qg.x, qg.y], api.t, 1 - api.clamp((u - 0.45) / 0.15, 0, 1)); Valdor.faisca(ctx, qg.x, qg.y, 70, api.t, 1); }
      Valdor.dano(ctx, qg.x, qg.y - 150, '3', u0 - 1.7, { tam: 100 });
      if (u > 0.88 && u < 1.0) { const qe = cam.p(teoX - 0.25, 0.9, teoZ); Valdor.faisca(ctx, qe.x, qe.y, 70, api.t, 1); }
      Valdor.dano(ctx, qg.x - 140, qg.y - 70, 'BLOQUEADO', u0 - 3.1, { tam: 58, cor: '#BFE6FF', sobe: 50, dura: 0.7 });
      if (u > 1.5 && u < 1.62) { ctx.save(); ctx.strokeStyle = 'rgba(255,250,235,0.95)'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(qg.x, qg.y, 170, -2.4, -0.4); ctx.stroke(); ctx.restore(); Valdor.faisca(ctx, qg.x, qg.y - 20, 90, api.t, 1); }
      Valdor.dano(ctx, qg.x + 40, qg.y - 170, '5', u0 - 4.75, { tam: 130, cor: AMARELO });
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.5 });
      ctx.restore();
    },

    // 23) o lobo deixa cair dois centavos; os dois caem na risada
    drop(ctx, u, d, api) {
      if (u < 1.25) {
        const cam = campo(ctx, api, { x: 0.4, y: 0.45, z: 3.6 + u * 0.1, cy: 1050, f: 1500 });
        const q = cam.p(0.4, 0, 5.0), cai = api.fase(0, 0.4, 'entra');
        const y = api.lerp(q.y - 300, q.y - 30, cai);
        Valdor.brilhoRadial(ctx, q.x, y - 30, 160, '255,210,120', 0.7);
        Valdor.moeda(ctx, q.x, y - 30, 42, api.t * 2, 1);
        Valdor.etiqueta(ctx, q.x, y - 170, 'R$ 0,02', '#BFE6FF', api.fase(0.5, 0.8, 'volta'), { tam: 70 });
        Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.9 });
      } else {
        campo(ctx, api, { x: 0, y: 1.5, z: 0.4, yaw: 0.02 }, { desfoque: 8 });
        close(api, { ...DAVIJ, pose: 'parado', expressao: 'rindo' }, 320, 800, 360, { luz: LUZ_CAMPO, vida: 2.2 });
        close(api, { ...TEOJ, pose: 'parado', expressao: 'rindo' }, 780, 780, 350, { luz: LUZ_CAMPO, vida: 2.4, semente: 3 });
      }
    },

    // 24) nível 2!
    nivel2(ctx, u, d, api) {
      const cam = campo(ctx, api, { x: 0, y: 1.3, z: 1.0 + u * 0.15, cy: 860, f: 1250 });
      const sobe = api.fase(0.5, 1.0);
      const rigs = [];
      emOrdem(cam, [
        [-0.6, 4.2, () => rigs.push(api.personagem3d(cam, { ...DAVIJ, pose: sobe > 0.5 ? 'acenando' : 'parado', expressao: 'feliz' }, -0.6, 4.2, 1.76, { luz: LUZ_CAMPO }))],
        [0.7, 4.4, () => rigs.push(api.personagem3d(cam, { ...TEOJ, pose: sobe > 0.5 ? 'acenando' : 'parado', expressao: 'rindo' }, 0.7, 4.4, 1.82, { luz: LUZ_CAMPO, semente: 3 }))],
      ]);
      for (const r of rigs) if (r.escalaPx) {
        const base = r.pontoMundo('quadril', [0, 2.8]), cab = r.pontoMundo('cabeca', [0, -1.25]);
        if (sobe > 0 && sobe < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(0, base.y, 0, cab.y); g.addColorStop(0, 'rgba(255,230,120,0.0)'); g.addColorStop(sobe, 'rgba(255,240,170,0.75)'); g.addColorStop(Math.min(1, sobe + 0.08), 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(base.x - r.escalaPx * 1.2, cab.y, r.escalaPx * 2.4, base.y - cab.y); ctx.restore(); }
        Valdor.placaNivel(ctx, cab.x, cab.y, sobe > 0.6 ? 2 : 1, sobe > 0.6 ? 1 + 0.25 * Math.max(0, 1 - (u - 0.8) * 3) : 1, { tam: 38, cor: sobe > 0.6 ? AMARELO : '#BFE6FF' });
      }
      Valdor.barraXP(ctx, 600, 1650, 760, api.fase(0, 0.6), { segmentos: 10 });
      const k = api.fase(0.75, 1.05, 'volta');
      zoomEm(ctx, 540, 420, k, () => api.texto('NÍVEL 2!', 540, 420, 160, { cor: AMARELO }));
    },

    // 25) raio-X: a barra de experiência enche e o cérebro solta dopamina a cada pedaço
    xp(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { oy: -u * 12 });
      const seg = Math.floor(api.fase(0, d, 'linear') * 10.99);
      const pulso = (api.fase(0, d, 'linear') * 10.99) % 1;
      Valdor.cabecaRaio(ctx, 540, 820, 320, { t: api.t, semOuvido: true, cerebro: 0.3 + 0.7 * (1 - pulso), dopamina: (u * 0.9) % 1 + 0.01 });
      Valdor.barraXP(ctx, 600, 1600, 760, seg / 10, { segmentos: 10 });
      Valdor.dano(ctx, 540 + 300, 1520, '+1 XP', pulso * 0.8, { tam: 60, cor: AMARELO, sobe: 80, dura: 0.8 });
      Valdor.texto(ctx, 'DOPAMINA', 540, 1760, 60, '#FFD45A', { peso: 900 });
    },

    // 26) progresso pequeno e frequente x prêmio grande e raro
    progresso(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, { oy: -u * 12 });
      // à esquerda: muitas barrinhas enchendo rápido, cada uma com um pulso dourado
      for (let i = 0; i < 5; i++) {
        const f = ((api.t * 1.4 + i * 0.2) % 1);
        Valdor.barraXP(ctx, 330, 560 + i * 120, 330, f, { h: 30, rotulo: '' });
        if (f > 0.92) Valdor.brilhoRadial(ctx, 330, 560 + i * 120, 140, '255,210,80', 0.9);
      }
      Valdor.texto(ctx, 'PEQUENO', 330, 1310, 58, '#FFD45A', { peso: 900 });
      Valdor.texto(ctx, '+ FREQUENTE', 330, 1375, 50, '#FFD45A', { peso: 900 });
      // à direita: um baú distante, apagado, com "?" (prêmio raro)
      ctx.save(); ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#6A4A2E'; ctx.beginPath(); ctx.roundRect(700, 700, 240, 170, 20); ctx.fill();
      ctx.fillStyle = '#8A6A3E'; ctx.beginPath(); ctx.roundRect(690, 640, 260, 90, [40, 40, 10, 10]); ctx.fill();
      ctx.fillStyle = '#C9A24A'; ctx.fillRect(800, 700, 40, 60);
      ctx.restore();
      Valdor.texto(ctx, '?', 820, 560, 110, 'rgba(255,255,255,0.5)', { peso: 900 });
      Valdor.texto(ctx, 'GRANDE', 820, 1310, 58, 'rgba(200,210,230,0.6)', { peso: 900 });
      Valdor.texto(ctx, '+ RARO', 820, 1375, 50, 'rgba(200,210,230,0.6)', { peso: 900 });
      // cérebro pequeno embaixo, aceso do lado esquerdo
      Valdor.cabecaRaio(ctx, 560, 1640, 140, { t: api.t, semOuvido: true, cerebro: 0.6, dopamina: (u * 1.2) % 1 + 0.01 });
    },

    // 27) passa um jogador nível 80 (Adaga Eclipse na cintura); Davi e Téo olham
    forte(ctx, u, d, api) {
      const fx = api.lerp(3.0, -1.6, u / d), fz = 7.2;
      const cam = api.orbita({ alvo: [0.2, 1.1, 4.6], raio: 4.0, ang: api.lerp(0.25, -0.05, u / d), altura: 1.4, f: 1150, ySalvo: 960, nevoa: Cenarios3D.valdor.nevoa });
      Cenarios3D.valdor.desenhar(ctx, cam, { t: api.t });
      let rigF = null;
      emOrdem(cam, [
        [fx, fz, () => { rigF = api.personagem3d(cam, { ...FORTE, pose: 'parado', expressao: 'serio' }, fx, fz, 1.9, { rumo: Math.PI / 2, caminhar: api.t * 0.9, velocidade: 0.8, luz: LUZ_CAMPO }); }],
        [-1.3, 3.6, () => api.personagem3d(cam, { ...DAVIJ, pose: 'parado', expressao: 'espanto' }, -1.3, 3.6, 1.76, { olhaPara: [fx, fz], luz: LUZ_CAMPO })],
        [-0.25, 3.3, () => api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'espanto' }, -0.25, 3.3, 1.82, { olhaPara: [fx, fz], luz: LUZ_CAMPO, semente: 3 })],
      ]);
      if (rigF && rigF.escalaPx) {
        const c = rigF.pontoMundo('cabeca', [0, -1.25]); Valdor.placaNivel(ctx, c.x, c.y, 80, 1, { tam: 40, cor: AMARELO, nome: 'KAEL' });
        const cin = rigF.pontoMundo('quadril', [0, 0.1]); Valdor.brilhoRadial(ctx, cin.x, cin.y, rigF.escalaPx * 0.9, '155,92,255', 0.55 + 0.2 * Math.sin(api.t * 6));
      }
      Cenarios3D.valdor.frente(ctx, cam, { t: api.t, forca: 0.6 });
    },

    // 28) close na adaga épica + preço
    adaga(ctx, u, d, api) {
      campo(ctx, api, { x: -0.5 + u * 0.1, y: 1.0, z: 2, yaw: 0.1 }, { desfoque: 18 });
      ctx.fillStyle = 'rgba(20,10,40,0.45)'; ctx.fillRect(0, 0, W, H);
      const s = api.lerp(700, 780, u / d);
      Valdor.adagaEpica(ctx, 540, 920, s, api.t, -0.7 + Math.sin(api.t * 0.8) * 0.06, { brilho: 1.2 });
      Valdor.etiqueta(ctx, 540, 1430, 'ADAGA ECLIPSE · ÉPICA', '#C9A8FF', api.fase(0.2, 0.5, 'volta'), { tam: 52 });
      const k = api.fase(1.2, 1.5, 'volta') * (1 + 0.05 * Math.sin(api.t * 8));
      Valdor.etiqueta(ctx, 540, 1600, 'R$ 15.000', AMARELO, k, { tam: 96 });
    },

    // 29) "Só que o Davi tinha sete reais...": o celular com R$ 7,90
    aluguel(ctx, u, d, api) {
      quarto(ctx, api, { x: -0.6, y: 1.2, z: 0.6 + u * 0.1, yaw: 0.3 }, { desfoque: 16 });
      Valdor.celular(ctx, 540, 1020 + Math.sin(api.t * 1.4) * 8, 1150 * api.lerp(1, 1.06, u / d), { saldo: 'R$ 7,90', vermelho: true, titulo: 'SALDO', linhas: [['CADEIRA VR', '- R$ 6.890,00'], ['CAPACETE VR', '- R$ 1.230,10'], ['FRETE', '- R$ 302,00']] });
    },

    // 30) o aluguel vence em 30 dias: Davi preocupado + calendário
    trinta(ctx, u, d, api) {
      campo(ctx, api, { x: 0, y: 1.5, z: 0.5, yaw: -0.03 }, { desfoque: 10 });
      ctx.fillStyle = 'rgba(30,20,50,0.25)'; ctx.fillRect(0, 0, W, H);
      const z = api.lerp(1, 1.06, api.fase(0.5, d));
      zoomEm(ctx, 540, 640, z, () => {
        const olho = u < 0.4 ? { ...window.EXPRESSOES_PADRAO.preocupado, olhar: [0, 0.02] } : 'preocupado';
        close(api, { ...DAVIJ, pose: 'parado', expressao: olho, vistaCabeca: u > 0.4 ? 'tq' : undefined, cabecaEsquerda: true }, 540, 640, 420, { luz: LUZ_CAMPO });
      });
      const k = api.fase(0.3, 0.6, 'volta');
      zoomEm(ctx, 540, 1560, k, () => Valdor.calendario(ctx, 540, 1560, 360, '30', 'ALUGUEL'));
    },

    // 31) cartela final
    parte(ctx, u, d, api) {
      campo(ctx, api, { x: 0, y: 1.6, z: -0.5 + u * 0.2 }, { desfoque: 16 });
      ctx.fillStyle = 'rgba(20,16,36,0.55)'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0, 0.35, 'volta');
      zoomEm(ctx, 540, 760, k, () => { api.texto('PARTE', 540, 680, 120); api.texto('1', 540, 850, 230, { cor: AMARELO }); });
      const k2 = api.fase(0.45, 0.8, 'volta');
      zoomEm(ctx, 540, 1130, k2, () => { api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 2', 540, 1190, 96, { cor: AMARELO }); });
      const k3 = api.fase(0.9, 1.2, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

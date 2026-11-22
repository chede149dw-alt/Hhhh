// VALDOR · Parte 5 — "Noite de caça". Planos do roteiro roteiros/nova/ep05.json (Cânion Vermelho de noite, a fera, redes de prata).
// Ajudantes herdados da Parte 4.
// Ajudantes copiados da Parte 3 (cena 3D com personagens dentro, cartas de loot, efeitos de luta).
(function () {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const AMARELO = '#EBC25A', ROXO = '155,92,255';
  const DAVIJ = { fabrica: 'criarDaviJogo', registroPoses: 'DAVI_JOGO_POSES' };
  const DAVIL = { fabrica: 'criarDaviLuvas', registroPoses: 'DAVI_JOGO_POSES' };
  const TEOJ = { fabrica: 'criarTeoJogo', registroPoses: 'POSES_PADRAO' };
  const FERA = (e) => ({ fabrica: 'criarTeoFera', opcoes: { estagio: e }, registroPoses: 'TEO_FERA_POSES' });
  const LOBO = { fabrica: 'criarTeoLobisomem', registroPoses: 'TEO_LOBISOMEM_POSES' };
  const LADRAO = (v) => ({ fabrica: 'criarLadrao', opcoes: { variante: v }, registroPoses: 'LADRAO_POSES' });
  const LIDER = { fabrica: 'criarLadrao', opcoes: { lider: true, estilo: 'C' }, registroPoses: 'LADRAO_POSES' };
  window.criarTeoFerro = (o = {}, v = 'frente') => window.equipar(window.criarTeo({ ...window.TEO_JOGO_OPCOES, ...o }, v), { ...window.TEO_JOGO_EQUIP, escudo: { ...(window.TEO_JOGO_EQUIP.escudo || {}), cor: 'prata', borda: 'carvao' } });
  const TEOF = { fabrica: 'criarTeoFerro', registroPoses: 'POSES_PADRAO' };
  const LUZ_CAMPO = { lado: 1, forca: 0.9, cor: 'rgb(255,200,130)', sombra: 0.75 };
  const LUZ_LUA = { lado: -1, forca: 0.85, cor: 'rgb(150,185,255)', sombra: 1 };
  const V = () => Valdor3D;
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const chave = (T, lista) => { if (T <= lista[0][0]) return lista[0][1]; for (let i = 0; i < lista.length - 1; i++) { const [t0, v0] = lista[i], [t1, v1] = lista[i + 1]; if (T <= t1) { const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0); return v0 + (v1 - v0) * k; } } return lista[lista.length - 1][1]; };
  const remap = (u0, mapa) => { for (let k = 0; k < mapa.length - 1; k++) { const [a, va] = mapa[k], [b, vb] = mapa[k + 1]; if (u0 <= b) return va + ((vb - va) * (u0 - a)) / (b - a); } return mapa[mapa.length - 1][1]; };
  const soco = (k, f = 0.14) => (k < 0 ? 1 : 1 + f * Math.exp(-k * 7) * Math.min(1, k / 0.04));
  function zoomEm(ctx, x, y, k, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function close(api, item, cx, cy, Hpx, o = {}) { const A = alturaH(item, item.vista || 'frente'); return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o); }
  // mão do personagem (tela) → mundo 3D, para a magia acontecer dentro do cenário
  const maoMundo = (cam, rig, parte, X, Z) => { if (!rig || !rig.pontoMundo) return null; const m = rig.pontoMundo(parte, [0, 0.28]); return Valdor3D.paraMundo(cam, m.x, m.y, cam.p(X, 0, Z).dz); };
  const orbe = (p, k, cor) => (p ? { tipo: 'orbe', x: p.x, y: p.y, z: p.z, k, cor } : null);
  // expressão com ajuste (olhar para um lado, etc.)
  const expr = (nome, extra = {}) => ({ ...window.EXPRESSOES_PADRAO[nome], ...extra });
  function emOrdem(cam, lista) { const dist = (X, Z) => (X - cam.x) ** 2 + (Z - cam.z) ** 2; lista.slice().sort((a, b) => dist(b[0], b[1]) - dist(a[0], a[1])).forEach((it) => it[2]()); }

  // ---------- fundos ----------
  function campoDia(ctx, api, camOpts, o = {}) {
    const cam = api.camera({ f: 1150, x: 0, y: 1.45, z: 0, cy: 860, nevoa: Valdor3D.nevoa(0, true), ...camOpts });
    if (o.desfoque) { const c = api.camada(); Valdor3D.desenhar(c.getContext('2d'), cam, { t: api.t, dia: true }); api.desfocar(c, o.desfoque); }
    else Valdor3D.desenhar(ctx, cam, { t: api.t, dia: true });
    return cam;
  }
  // cena de noite com cada personagem numa camada (tom de noite + cor extra), efeitos de câmera no fim
  // cena 3D com personagens 2D DENTRO do cenário: cada personagem posicionado (personagem3d ou e.pos) vira uma placa
  // em pé no 3D (a grama da frente passa na frente das pernas e a luz projeta a sombra). Closes em tela ficam por cima.
  function noite(ctx, api, cam, entradas, o = {}) {
    cam.__ctx = ctx;
    const n = o.noite === undefined ? 1 : o.noite, dia = !!o.dia, camadas = [], res = [], figuras = [];
    const p3 = api.personagem3d; let reg = null;
    api.personagem3d = (c, item, X, Z, alt, op = {}) => { reg = { X, Z, y: op.y || 0, alt }; return p3(c, item, X, Z, alt, op); };
    window.SEM_SOMBRA_CHAO = true;
    for (const e of entradas) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
      reg = null; res.push(e.f());
      const L = api.camada(), g = L.getContext('2d'); g.drawImage(ctx.canvas, 0, 0); g.globalCompositeOperation = 'source-atop';
      if (!dia) { g.fillStyle = `rgba(22,36,100,${0.26 * n})`; g.fillRect(0, 0, W, H); }
      if (e.cor) { g.fillStyle = e.cor; g.fillRect(0, 0, W, H); }
      const alfa = e.alfa === undefined ? 1 : e.alfa, pos = reg || (e.pos ? { X: e.pos[0], Z: e.pos[1], y: 0, alt: e.alt || 1.2 } : null);
      if (pos && !o.desfoque && !e.plano) {
        const q = cam.p(pos.X, pos.y, pos.Z), hp = pos.alt * q.s;
        const x0 = Math.max(0, Math.floor(q.x - 0.95 * hp)), x1 = Math.min(W, Math.ceil(q.x + 0.95 * hp)), y0 = Math.max(0, Math.floor(q.y - 1.75 * hp)), y1 = Math.min(H, Math.ceil(q.y + 0.12 * hp));
        if (q.dz > 0.6 && x1 > x0 + 2 && y1 > y0 + 2) {
          const C = document.createElement('canvas'); C.width = x1 - x0; C.height = y1 - y0; const gc = C.getContext('2d'); gc.globalAlpha = alfa; gc.drawImage(L, x0, y0, C.width, C.height, 0, 0, C.width, C.height);
          figuras.push({ canvas: C, x0, y0, w: C.width, h: C.height, dz: q.dz, X: pos.X, Z: pos.Z, y: pos.y, alt: pos.alt });
          continue;
        }
      }
      camadas.push([L, alfa]);
    }
    api.personagem3d = p3;
    // efeitos no chão (círculo mágico, anel): numa placa logo atrás de quem está em cima, para o personagem ficar por cima
    if (o.chao && o.chaoEm) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.restore();
      o.chao(res); const C = document.createElement('canvas'); C.width = W; C.height = H; C.getContext('2d').drawImage(ctx.canvas, 0, 0);
      figuras.push({ canvas: C, x0: 0, y0: 0, w: W, h: H, dz: cam.p(o.chaoEm[0], 0, o.chaoEm[1]).dz + 0.5, sombra: false });
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const tc = o.t === undefined ? api.t : o.t;
    // perto: o que fica a menos disso (m) da câmera vai para o primeiro plano, na frente dos personagens (desfocado)
    let perto = o.forca === 0 ? 0 : o.perto === undefined ? 1.2 : o.perto; let luzes = o.luzes;
    for (const f of figuras) if (f.sombra !== false) perto = Math.min(perto, f.dz - 0.3);
    if (perto < 0.3) perto = 0;
    // foco logo atrás de quem está mais longe; o fundo além disso sai desfocado
    const dzs = figuras.filter((f) => f.sombra !== false).map((f) => f.dz), foco = dzs.length ? Math.max(...dzs) + (o.folgaFoco || 3) : 0;
    const magias = o.magias ? o.magias(res).filter(Boolean) : [];
    const fx = o.fx3d ? o.fx3d(res).filter(Boolean) : []; if (fx.some((g) => g.luz)) luzes = [...(luzes || []), ...fx.filter((g) => g.luz).map((g) => g.luz)];
    const op = { t: tc, noite: n, dia, perto, luzes, figuras, foco, bokeh: o.bokeh === undefined ? 5 : o.bokeh, magias, fx, borda: o.borda };
    if (o.desfoque) { const F = api.camada(); V().desenhar(F.getContext('2d'), cam, op); api.desfocar(F, o.desfoque); } else V().desenhar(ctx, cam, op);
    if (o.chao && !o.chaoEm) o.chao(res);
    for (const [L, a] of camadas) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(L, 0, 0); ctx.restore(); }
    window.SEM_SOMBRA_CHAO = false;
    if (o.depois) o.depois(res);
    V().frente(ctx, cam, { t: tc, noite: n, dia, forca: o.forca === undefined ? 0.5 : o.forca, perto, luzes, magias, borda: o.borda });
    if (o.fx) camFx(ctx, api, o.fx);
    if (o.fim) o.fim(res);
    return res;
  }
  function camFx(ctx, api, fx) {
    const zoom = fx.zoom || 1, rolo = fx.rolo || 0, [bx, by] = fx.borrao || [0, 0], cx = fx.cx || W / 2, cy = fx.cy || H / 2;
    if (zoom === 1 && !rolo && !bx && !by) return;
    const L = api.camada(); L.getContext('2d').drawImage(ctx.canvas, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const m = 1 + Math.abs(rolo) * 1.1 + (Math.abs(bx) + Math.abs(by)) / W;
    ctx.translate(cx, cy); ctx.rotate(rolo); ctx.scale(zoom * m, zoom * m); ctx.translate(-cx, -cy);
    const nn = bx || by ? 6 : 1;
    for (let i = 0; i < nn; i++) { const k = nn === 1 ? 0 : i / (nn - 1) - 0.5; ctx.globalAlpha = i === 0 ? 1 : 1 / (i + 1); ctx.drawImage(L, k * bx, k * by); }
    ctx.restore();
  }
  const camNoite = (api, o) => api.camera({ f: 1150, x: 0, y: 1.45, z: 0, cy: 860, nevoa: V().nevoa(o.noite === undefined ? 1 : o.noite), ...o });

  // ---------- peças desta parte ----------
  // carta de loot (vidro) com ícone, raridade e preço
  const RAR = { comum: ['#C9CED8', '200,206,216', 'COMUM'], raro: ['#5AB4FF', '90,180,255', 'RARO'], epico: ['#B07CFF', '176,124,255', 'ÉPICO'] };
  function icone(ctx, tipo, s, t) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (tipo === 'couro') { ctx.fillStyle = '#9A6A42'; ctx.strokeStyle = '#4A2E1C'; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.3); ctx.quadraticCurveTo(-s * 0.1, -s * 0.45, s * 0.15, -s * 0.32); ctx.quadraticCurveTo(s * 0.45, -s * 0.38, s * 0.4, -s * 0.05); ctx.quadraticCurveTo(s * 0.5, s * 0.25, s * 0.3, s * 0.38); ctx.quadraticCurveTo(0, s * 0.3, -s * 0.3, s * 0.4); ctx.quadraticCurveTo(-s * 0.5, s * 0.1, -s * 0.4, -s * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,180,0.5)'; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.1); ctx.quadraticCurveTo(0, 0, s * 0.2, -s * 0.12); ctx.stroke(); }
    if (tipo === 'pocao') { ctx.fillStyle = 'rgba(220,240,255,0.35)'; ctx.strokeStyle = '#E8F4FF'; ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.arc(0, s * 0.1, s * 0.3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#E8344E'; ctx.beginPath(); ctx.arc(0, s * 0.12, s * 0.26, 0.1, Math.PI - 0.1); ctx.fill(); ctx.fillStyle = '#8A5A3A'; ctx.fillRect(-s * 0.08, -s * 0.38, s * 0.16, s * 0.14); ctx.strokeRect(-s * 0.1, -s * 0.24, s * 0.2, s * 0.08); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.02, s * 0.05, s * 0.09, 0.4, 0, TAU); ctx.fill(); }
    if (tipo === 'anel') Valdor.anelRaro(ctx, 0, 0, s * 0.9, t);
    if (tipo === 'luvas') { for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * s * 0.17, 0); ctx.rotate(sd * 0.15); ctx.fillStyle = '#2E4A8A'; ctx.strokeStyle = '#13213F'; ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.roundRect(-s * 0.15, -s * 0.1, s * 0.3, s * 0.42, s * 0.08); ctx.fill(); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(-s * 0.15 + i * s * 0.077, -s * 0.34, s * 0.07, s * 0.26, s * 0.035); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#C9A24A'; ctx.fillRect(-s * 0.15, s * 0.22, s * 0.3, s * 0.06); ctx.restore(); } Valdor.brilhoRadial(ctx, 0, 0, s * 0.6, '120,200,255', 0.4 + 0.2 * Math.sin(t * 5)); }
    ctx.restore();
  }
  function cartaLoot(ctx, x, y, s, item, k, t, o = {}) {
    if (k <= 0) return;
    const [cor, rgb, rot] = RAR[item.rar], w = s, h = s * 1.4;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.giro || 0);
    Valdor.brilhoRadial(ctx, 0, 0, s * 0.95, rgb, 0.45);
    ctx.fillStyle = 'rgba(16,20,40,0.72)'; ctx.strokeStyle = cor; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.stroke();
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.4, 'rgba(255,255,255,0.02)'); g.addColorStop(1, 'rgba(255,255,255,0.08)'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.translate(0, -h * 0.13); icone(ctx, item.icone, s * 0.62, t); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${s * 0.085}px Inter`; ctx.fillStyle = '#FFFFFF'; ctx.fillText(item.nome, 0, h * 0.2);
    ctx.font = `800 ${s * 0.07}px Inter`; ctx.fillStyle = cor; ctx.fillText(rot, 0, h * 0.28);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(-w * 0.36, h * 0.33, w * 0.72, h * 0.11, h * 0.05); ctx.fill();
    ctx.font = `900 ${s * 0.1}px Inter`; ctx.fillStyle = '#9BF0A8'; ctx.fillText(item.preco, 0, h * 0.385);
    if (o.selo) { ctx.save(); ctx.translate(w * 0.36, -h * 0.44); ctx.rotate(0.2); ctx.fillStyle = o.selo === 'EQUIPAR' ? '#2FA84A' : '#D9A21A'; ctx.beginPath(); ctx.roundRect(-s * 0.28, -s * 0.07, s * 0.56, s * 0.14, s * 0.07); ctx.fill(); ctx.font = `900 ${s * 0.075}px Inter`; ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.selo, 0, 2); ctx.restore(); }
    ctx.restore();
  }
  const LOOTS = [
    { nome: 'Couro de lobo', rar: 'comum', preco: 'R$ 0,18', icone: 'couro' },
    { nome: 'Poção de vida', rar: 'comum', preco: 'R$ 1,50', icone: 'pocao' },
    { nome: 'Anel de faísca', rar: 'raro', preco: 'R$ 60', icone: 'anel' },
    { nome: 'Luvas do conjurador', rar: 'raro', preco: 'R$ 95', icone: 'luvas' },
  ];
  // seta verde de atributo subindo
  function setaAtributo(ctx, x, y, txt, k) {
    if (k <= 0) return;
    const sobe = (1 - Math.pow(1 - cl(k), 3)) * 60, al = k > 1.2 ? 1 - cl((k - 1.2) / 0.4) : 1;
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y - sobe);
    ctx.fillStyle = '#4CFF7A'; ctx.strokeStyle = '#0E3A1A'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(34, -8); ctx.lineTo(12, -8); ctx.lineTo(12, 30); ctx.lineTo(-12, 30); ctx.lineTo(-12, -8); ctx.lineTo(-34, -8); ctx.closePath(); ctx.stroke(); ctx.fill();
    ctx.font = '900 54px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeText(txt, 46, -4); ctx.fillText(txt, 46, -4);
    ctx.restore();
  }
  // neurônio e mielina (raio-X): k1 = capa de mielina 0..1, sinal = posição do pulso 0..1
  function neuronio(ctx, x0, x1, y, mielina, sinal, t) {
    ctx.save(); ctx.lineCap = 'round';
    const corpo = (x, r) => { ctx.fillStyle = 'rgba(120,230,255,0.25)'; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#7FE6FF'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7FE6FF'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 2, y + Math.sin(a + 0.3) * r * 2, x + Math.cos(a) * r * 2.8, y + Math.sin(a) * r * 2.8); ctx.stroke(); } };
    ctx.strokeStyle = 'rgba(127,230,255,0.85)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    // capas de mielina (segmentos brancos que vão envolvendo)
    const n = 6, passo = (x1 - x0 - 120) / n;
    for (let i = 0; i < n; i++) { const kk = cl(mielina * n - i); if (kk <= 0) continue; const cx = x0 + 70 + i * passo + passo / 2, w = (passo - 26) * kk; ctx.fillStyle = 'rgba(240,250,255,0.92)'; ctx.strokeStyle = '#7FE6FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - 26, w, 52, 26); ctx.fill(); ctx.stroke(); }
    corpo(x0, 46); corpo(x1, 30);
    // pulso elétrico
    if (sinal >= 0 && sinal <= 1) { const px = x0 + (x1 - x0) * sinal; Valdor.brilhoRadial(ctx, px, y, 90, '255,240,120', 1); ctx.fillStyle = '#FFFBE0'; ctx.beginPath(); ctx.arc(px, y, 16, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  // olho em corte (raio-X): luz entra, bate no tapetum lucidum e volta
  function olhoCorte(ctx, cx, cy, R, k, t) {
    ctx.save(); ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(120,230,255,0.12)'; ctx.strokeStyle = '#7FE6FF'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill(); ctx.stroke();
    // córnea e cristalino (lado esquerdo = frente do olho)
    ctx.beginPath(); ctx.arc(cx - R * 0.95, cy, R * 0.42, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = 'rgba(200,245,255,0.5)'; ctx.beginPath(); ctx.ellipse(cx - R * 0.62, cy, R * 0.14, R * 0.3, 0, 0, TAU); ctx.fill(); ctx.stroke();
    // retina + tapetum (fundo do olho, lado direito), espelho dourado
    ctx.strokeStyle = '#FF9AB0'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, -0.9, 0.9); ctx.stroke();
    const g = ctx.createLinearGradient(cx + R * 0.7, cy - R, cx + R, cy + R); g.addColorStop(0, '#FFE680'); g.addColorStop(0.5, '#7BFFD8'); g.addColorStop(1, '#FFD24A');
    ctx.strokeStyle = g; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, R * 0.97, -0.7, 0.7); ctx.stroke();
    // raio de luz: entra, cruza, bate no espelho e volta
    const ida = cl(k * 2), volta = cl(k * 2 - 1);
    const A = [cx - R * 2.2, cy - R * 0.35], B = [cx + R * 0.94, cy + R * 0.06], C = [cx - R * 2.2, cy + R * 0.42];
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,240,150,0.9)'; ctx.shadowColor = 'rgba(255,240,150,0.9)'; ctx.shadowBlur = 20;
    if (ida > 0) { ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(A[0] + (B[0] - A[0]) * ida, A[1] + (B[1] - A[1]) * ida); ctx.stroke(); }
    if (volta > 0) { ctx.strokeStyle = 'rgba(255,214,90,0.95)'; ctx.beginPath(); ctx.moveTo(...B); ctx.lineTo(B[0] + (C[0] - B[0]) * volta, B[1] + (C[1] - B[1]) * volta); ctx.stroke(); Valdor.brilhoRadial(ctx, B[0], B[1], 120, '255,230,120', 0.9); }
    ctx.restore();
  }
  // corrente brilhando entre dois pontos (caída)
  // corrente de verdade: elos de aço encaixados (um de frente, um de lado) seguindo a curva, com brilho mágico fraco
  function corrente(ctx, a, b, t, k = 1, tam = 15) {
    if (k <= 0) return;
    const L0 = Math.hypot(b[0] - a[0], b[1] - a[1]), cai = L0 * 0.16;
    const P = (s) => [a[0] + (b[0] - a[0]) * s + Math.sin(t * 3 + s * 7) * 2.5, a[1] + (b[1] - a[1]) * s + Math.sin(s * Math.PI) * cai + Math.sin(t * 2.2 + s * 5) * 3];
    const amostras = []; for (let i = 0; i <= 80; i++) amostras.push(P(i / 80));
    ctx.save(); ctx.globalAlpha = k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(140,170,255,0.18)'; ctx.lineWidth = tam * 2.4; ctx.beginPath(); amostras.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    const passo = tam * 1.25; let acc = 0, prox = 0, idx = 0;
    for (let i = 1; i < amostras.length; i++) {
      const [x0, y0] = amostras[i - 1], [x1, y1] = amostras[i], seg = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
      while (prox <= acc + seg) {
        const f = (prox - acc) / seg, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        if (idx % 2 === 0) {
          ctx.strokeStyle = '#141826'; ctx.lineWidth = tam * 0.5; ctx.beginPath(); ctx.ellipse(0, 0, tam * 0.85, tam * 0.48, 0, 0, TAU); ctx.stroke();
          const g = ctx.createLinearGradient(0, -tam * 0.5, 0, tam * 0.5); g.addColorStop(0, '#F2F5FF'); g.addColorStop(0.45, '#9AA6C4'); g.addColorStop(1, '#4A5470');
          ctx.strokeStyle = g; ctx.lineWidth = tam * 0.28; ctx.beginPath(); ctx.ellipse(0, 0, tam * 0.85, tam * 0.48, 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = tam * 0.08; ctx.beginPath(); ctx.ellipse(0, 0, tam * 0.85, tam * 0.48, 0, Math.PI * 1.15, Math.PI * 1.7); ctx.stroke();
        } else {
          ctx.fillStyle = '#141826'; ctx.beginPath(); ctx.roundRect(-tam * 0.95, -tam * 0.2, tam * 1.9, tam * 0.4, tam * 0.2); ctx.fill();
          const g = ctx.createLinearGradient(0, -tam * 0.14, 0, tam * 0.14); g.addColorStop(0, '#E8EDFF'); g.addColorStop(1, '#5A6684');
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-tam * 0.85, -tam * 0.11, tam * 1.7, tam * 0.22, tam * 0.11); ctx.fill();
        }
        ctx.restore(); prox += passo; idx++;
      }
      acc += seg;
    }
    for (let i = 0; i < 3; i++) { const [x, y] = P(((t * 0.35 + i / 3) % 1)); Valdor.brilhoRadial(ctx, x, y, tam * 2.2, '170,190,255', 0.5); }
    ctx.restore();
  }
  function tituloMetal(ctx, txt, x, y, tam, cores) {
    ctx.save(); ctx.font = `900 ${tam}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let k = 1; while (ctx.measureText(txt).width * k > 980) k -= 0.02;
    ctx.translate(x, y); ctx.scale(k, 1); ctx.shadowColor = 'rgba(255,170,60,0.9)'; ctx.shadowBlur = 30; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A0B10'; ctx.lineWidth = tam * 0.16; ctx.strokeText(txt, 0, 0); ctx.shadowBlur = 0;
    const g = ctx.createLinearGradient(0, -tam * 0.5, 0, tam * 0.5); cores.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillText(txt, 0, 0); ctx.restore();
  }
  // ladrão com tocha na mão esquerda: desenha a tocha depois do corpo
  const tochaNaMao = (ctx, rig, t, seed, s = 0.5) => { if (rig && rig.pontoMundo) { const m = rig.pontoMundo('mao_e', [0, 0.2]); Noite.tocha(ctx, m.x, m.y, s * rig.escalaPx * 2.2, t, { seed }); } };
  const ALUGUEL_META = 1200;
  const reaisTxt = (v) => 'R$ ' + v.toFixed(2).replace('.', ',') + ' / 1.200';
  const OURO = [[0, '#FFF2B0'], [0.45, '#FFC83D'], [0.55, '#D98A12'], [1, '#FFD45E']];
  // ================= Parte 3: peças novas =================
  const DAVIA = { fabrica: 'criarDaviArcano', registroPoses: 'DAVI_JOGO_POSES' };
  const TEOG = { fabrica: 'criarTeoRoupa', opcoes: { estilo: 'B' }, registroPoses: 'POSES_PADRAO' };
  const LIDERM = { fabrica: 'criarLadrao', opcoes: { lider: true, estilo: 'C', semEspada: true, espadaNaMao: true }, registroPoses: 'LADRAO_POSES' };
  const VERMELHO = '255,70,60', LARANJA = '255,170,80', AZUL = '130,200,255';
  const LUZ_RUBRA = { lado: 1, forca: 0.6, cor: 'rgb(255,110,80)', sombra: 1 };
  const espada = (api, ang, brilho = 1) => { window.ESPADA_MAO = { t: api.t, ang, brilho }; };
  const mix = (a, b, k) => a + (b - a) * k;
  const rnd = (s) => { let x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  // flash branco de impacto (um quadro)
  const flash = (ctx, k, a = 0.85) => { if (k < 0 || k > 0.08) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,255,${a * (1 - k / 0.08)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); };
  // fio de vida: partículas vermelhas indo do ferido para a espada
  function drenoVida(ctx, a, b, t, k = 1, n = 26) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const cx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.25, cy = (a[1] + b[1]) / 2 - Math.abs(b[0] - a[0]) * 0.35 - 60;
    for (let i = 0; i < n; i++) {
      const s = ((t * 0.9 + i / n) % 1), x = (1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * cx + s * s * b[0] + Math.sin(t * 7 + i) * 8, y = (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * cy + s * s * b[1] + Math.cos(t * 6 + i) * 8;
      const r = (6 + 8 * Math.sin(Math.PI * s)) * k;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, `rgba(255,220,210,${0.95 * k})`); g.addColorStop(0.3, `rgba(${VERMELHO},${0.7 * k})`); g.addColorStop(1, `rgba(${VERMELHO},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // lascas/pedrinhas/tijolos voando a partir de um ponto do mundo (física simples, projetada na câmera)
  function destrocos(ctx, cam, X, Y, Z, u, o = {}) {
    if (u < 0) return;
    const n = o.n || 18, cor = o.cor || '#8C8A92', tam = o.tam || 0.08, forca = o.forca || 3, seed = o.seed || 1;
    for (let i = 0; i < n; i++) {
      const a = rnd(seed + i) * TAU, v = forca * (0.4 + rnd(seed + i * 3) * 0.8), up = forca * (0.5 + rnd(seed + i * 7));
      let x = X + Math.cos(a) * v * u * (o.dirX === undefined ? 1 : 0.4) + (o.dirX || 0) * v * u, z = Z + Math.sin(a) * v * u * 0.6 + (o.dirZ || 0) * v * u, y = Y + up * u - 4.9 * u * u;
      if (y < 0) { y = Math.abs(Math.sin(u * 6 + i)) * 0.05; }
      const q = cam.p(x, y, z); if (q.dz < 0.4) continue;
      const s = Math.max(2, tam * (0.6 + rnd(seed + i * 11)) * q.s);
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(u * (6 + i) + i);
      ctx.fillStyle = o.cores ? o.cores[i % o.cores.length] : cor; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = Math.max(1, s * 0.12);
      if (o.tipo === 'tijolo') { ctx.beginPath(); ctx.roundRect(-s, -s * 0.5, s * 2, s, s * 0.15); ctx.fill(); ctx.stroke(); }
      else if (o.tipo === 'grama') { ctx.strokeStyle = o.cores ? o.cores[i % 2] : '#5FA040'; ctx.lineWidth = Math.max(2, s * 0.25); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * 0.4, s * 1.2, 0); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s * 0.4, -s); ctx.lineTo(s, s * 0.2); ctx.lineTo(-s * 0.2, s * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
  }
  // rachadura em estrela no chão (decal na perspectiva)
  function rachadura(ctx, cam, X, Z, R, k, seed = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + rnd(seed + i) * 0.5, L = R * (0.5 + rnd(seed + i * 5) * 0.6) * Math.min(1, k * 1.5);
      ctx.beginPath(); let px = X, pz = Z; const q0 = cam.p(px, 0.07, pz); ctx.moveTo(q0.x, q0.y);
      for (let j = 1; j <= 4; j++) { px = X + Math.cos(a + (rnd(seed + i + j) - 0.5) * 0.5) * L * j / 4; pz = Z + Math.sin(a + (rnd(seed + i * j) - 0.5) * 0.5) * L * j / 4; const q = cam.p(px, 0.07, pz); ctx.lineTo(q.x, q.y); }
      ctx.strokeStyle = 'rgba(15,10,12,0.85)'; ctx.lineWidth = Math.max(2, 0.03 * q0.s); ctx.stroke();
      ctx.strokeStyle = `rgba(255,120,70,${0.5 * Math.max(0, 1 - k * 0.5)})`; ctx.lineWidth = Math.max(1, 0.012 * q0.s); ctx.stroke();
    }
    ctx.restore();
  }
  // sulcos dos pés arrastando na terra
  function sulcos(ctx, cam, X0, Z0, X1, Z1, larg = 0.18) {
    ctx.save(); ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      const a = cam.p(X0 + s * larg, 0.02, Z0), b = cam.p(X1 + s * larg, 0.02, Z1); if (a.dz < 0.5 || b.dz < 0.5) continue;
      ctx.strokeStyle = 'rgba(30,20,14,0.75)'; ctx.lineWidth = Math.max(3, 0.09 * b.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(160,120,80,0.45)'; ctx.lineWidth = Math.max(1, 0.025 * b.s); ctx.beginPath(); ctx.moveTo(a.x, a.y - 0.04 * a.s); ctx.lineTo(b.x, b.y - 0.04 * b.s); ctx.stroke();
    }
    ctx.restore();
  }
  // faca girando
  function faca(ctx, x, y, s, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = '#D8DEE8'; ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.16, -s * 0.4, s * 0.1, 0); ctx.lineTo(-s * 0.1, 0); ctx.quadraticCurveTo(-s * 0.12, -s * 0.5, 0, -s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5A3A26'; ctx.beginPath(); ctx.roundRect(-s * 0.08, 0, s * 0.16, s * 0.45, s * 0.04); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9AA0AA'; ctx.fillRect(-s * 0.2, -s * 0.04, s * 0.4, s * 0.08);
    ctx.restore();
  }
  // punho de luva segurando a faca: (x, y) = centro do punho, s = largura do punho em px, ang = direção da lâmina (0 = para cima)
  function punhoComFaca(ctx, x, y, s, ang, o = {}) {
    // braço preso num ponto fixo da tela (primeira pessoa: sempre vem do canto de baixo)
    if (o.ancora) { const [ax, ay] = o.ancora, dx = ax - x, dy = ay - y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w0 = 0.42 * s, w1 = 0.95 * s; const gm = ctx.createLinearGradient(x + nx * w0, y + ny * w0, x - nx * w0, y - ny * w0); gm.addColorStop(0, '#5A6B88'); gm.addColorStop(0.55, '#46566F'); gm.addColorStop(1, '#2F3B50'); ctx.save(); ctx.fillStyle = gm; ctx.beginPath(); ctx.moveTo(x + nx * w0, y + ny * w0); ctx.lineTo(ax + nx * w1, ay + ny * w1); ctx.lineTo(ax - nx * w1, ay - ny * w1); ctx.lineTo(x - nx * w0, y - ny * w0); ctx.closePath(); ctx.fill(); ctx.restore(); o = { ...o, manga: false }; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.lineJoin = 'round';
    const g0 = '#4B5D7A', gL = '#6A7FA0', gS = '#33415A', borda = '#1E2738';
    if (o.manga !== false) { const gm = ctx.createLinearGradient(-0.45 * s, 0, 0.45 * s, 0); gm.addColorStop(0, '#5A6B88'); gm.addColorStop(0.55, '#46566F'); gm.addColorStop(1, '#2F3B50'); ctx.fillStyle = gm; ctx.beginPath(); ctx.moveTo(-0.4 * s, 0.4 * s); ctx.lineTo(0.4 * s, 0.4 * s); ctx.lineTo(0.5 * s, 0.4 * s + (o.comp || 6) * s); ctx.lineTo(-0.5 * s, 0.4 * s + (o.comp || 6) * s); ctx.closePath(); ctx.fill(); }
    if (o.faca !== false) faca(ctx, 0.02 * s, -0.36 * s, 2.0 * s, 0);
    // palma (por cima do cabo)
    const gp = ctx.createLinearGradient(-0.5 * s, 0, 0.5 * s, 0); gp.addColorStop(0, gL); gp.addColorStop(0.5, g0); gp.addColorStop(1, gS);
    ctx.fillStyle = gp; ctx.strokeStyle = borda; ctx.lineWidth = 0.035 * s; ctx.beginPath(); ctx.roundRect(-0.46 * s, -0.42 * s, 0.92 * s, 0.86 * s, 0.24 * s); ctx.fill(); ctx.stroke();
    // quatro dedos dobrados enrolando o cabo (por cima dele)
    for (let i = 0; i < 4; i++) { const yy = -0.36 * s + i * 0.19 * s; const gd = ctx.createLinearGradient(0, yy, 0, yy + 0.18 * s); gd.addColorStop(0, gL); gd.addColorStop(1, gS); ctx.fillStyle = gd; ctx.beginPath(); ctx.roundRect(-0.5 * s, yy, 0.7 * s, 0.18 * s, 0.09 * s); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-0.36 * s, yy + 0.05 * s, 0.07 * s, 0.03 * s, 0, 0, TAU); ctx.fill(); }
    // polegar fechando por cima dos dedos
    ctx.fillStyle = gp; ctx.beginPath(); ctx.moveTo(0.36 * s, -0.12 * s); ctx.quadraticCurveTo(0.52 * s, -0.44 * s, 0.12 * s, -0.46 * s); ctx.quadraticCurveTo(-0.16 * s, -0.47 * s, -0.2 * s, -0.36 * s); ctx.quadraticCurveTo(0.0 * s, -0.3 * s, 0.2 * s, -0.24 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    // punho dourado da luva
    const gc = ctx.createLinearGradient(-0.5 * s, 0, 0.5 * s, 0); gc.addColorStop(0, '#F2CF6A'); gc.addColorStop(0.5, '#D9A93A'); gc.addColorStop(1, '#9C7420');
    ctx.fillStyle = gc; ctx.beginPath(); ctx.moveTo(-0.44 * s, 0.3 * s); ctx.lineTo(0.44 * s, 0.3 * s); ctx.lineTo(0.52 * s, 0.62 * s); ctx.quadraticCurveTo(0, 0.68 * s, -0.52 * s, 0.62 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (o.runa !== false) { Valdor.brilhoRadial(ctx, 0, 0.0, 0.35 * s, '120,200,255', 0.6); }
    ctx.restore();
  }
  // vapor da respiração no frio
  function vapor(ctx, x, y, s, t) { for (let i = 0; i < 3; i++) { const f = (t * 1.2 + i / 3) % 1; Noite.fumaca(ctx, x + f * s * 0.8, y - f * s * 0.3, s * (0.25 + f * 0.4), f, { seed: 21 + i, cor: '220,228,245', n: 6, largura: 0.8, sobe: 0.2 }); } }
  // brasa/fagulhas subindo
  function brasas(ctx, x, y, w, t, k = 1, seed = 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 14; i++) { const f = (t * (0.5 + rnd(seed + i) * 0.6) + rnd(seed + i * 3)) % 1, px = x + (rnd(seed + i * 5) - 0.5) * w + Math.sin(t * 3 + i) * 10, py = y - f * w * 1.2, r = 3 + rnd(i + seed) * 3; ctx.fillStyle = `rgba(255,${150 + 80 * rnd(i)},70,${k * (1 - f)})`; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill(); } ctx.restore(); }
  // corpo piscando em raio-X ao levar choque
  function raioXCorpo(ctx, rig, t, k) { if (!rig || !rig.pontoMundo || k <= 0) return; if (Math.sin(t * 60) < 0) return; const a = rig.pontoMundo('cabeca', [0, -0.3]), b = rig.pontoMundo('quadril', [0, 0.5]), h = Math.abs(b.y - a.y) * 1.25; ctx.save(); ctx.globalAlpha = 0.85 * k; Valdor.corpoRaio(ctx, (a.x + b.x) / 2, b.y + h * 0.3, h * 0.82, 0, {}); ctx.restore(); }
  // barra de vida grande no topo (herói à esquerda, inimigo à direita)
  function barras(ctx, api, teo, lider, o = {}) {
    Combate.hud(ctx, 40, 150, 'TÉO', 5, teo[0], teo[1], { max: 240, w: 300, corRetrato: '#B84A1E', alfa: o.alfa === undefined ? 1 : o.alfa, tremor: o.tremorT, t: api.t });
    Combate.hud(ctx, 590, 150, 'LÍDER', 15, lider[0], lider[1], { max: 300, w: 300, corRetrato: '#B02030', alfa: o.alfa === undefined ? 1 : o.alfa, inimigo: true, t: api.t });
  }
  const RARL = ['#FF5A4A', '255,90,74', 'LENDÁRIA'];
  function iconeNovo(ctx, tipo, s, t) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (tipo === 'moedas') { ctx.fillStyle = '#8A5A36'; ctx.strokeStyle = '#3A2414'; ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.moveTo(-s * 0.32, s * 0.38); ctx.quadraticCurveTo(-s * 0.42, -s * 0.05, -s * 0.12, -s * 0.18); ctx.lineTo(s * 0.12, -s * 0.18); ctx.quadraticCurveTo(s * 0.42, -s * 0.05, s * 0.32, s * 0.38); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#D9A93A'; ctx.beginPath(); ctx.moveTo(-s * 0.14, -s * 0.2); ctx.lineTo(s * 0.14, -s * 0.2); ctx.stroke(); for (let i = 0; i < 3; i++) Valdor.moeda(ctx, -s * 0.15 + i * s * 0.15, -s * 0.3 - i * s * 0.04, s * 0.11, t * 3 + i); }
    if (tipo === 'pocaoG') { ctx.fillStyle = 'rgba(220,240,255,0.35)'; ctx.strokeStyle = '#E8F4FF'; ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.ellipse(0, s * 0.1, s * 0.32, s * 0.36, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FF3A5A'; ctx.beginPath(); ctx.ellipse(0, s * 0.16, s * 0.28, s * 0.28, 0, 0.15, Math.PI - 0.15); ctx.fill(); ctx.fillStyle = '#8A5A3A'; ctx.fillRect(-s * 0.09, -s * 0.38, s * 0.18, s * 0.14); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-s * 0.12, -s * 0.02, s * 0.05, s * 0.1, 0.4, 0, TAU); ctx.fill(); }
    if (tipo === 'botas') { for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * s * 0.16, 0); ctx.fillStyle = '#5A3E2A'; ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.35); ctx.lineTo(s * 0.08, -s * 0.35); ctx.lineTo(s * 0.08, s * 0.18); ctx.lineTo(s * 0.22, s * 0.25); ctx.lineTo(s * 0.22, s * 0.35); ctx.lineTo(-s * 0.12, s * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#9FE0FF'; ctx.beginPath(); ctx.moveTo(-s * 0.12, -s * 0.1); ctx.quadraticCurveTo(-s * 0.3, -s * 0.2, -s * 0.26, -s * 0.36); ctx.quadraticCurveTo(-s * 0.18, -s * 0.2, -s * 0.1, -s * 0.2); ctx.fill(); ctx.restore(); } Valdor.brilhoRadial(ctx, 0, 0, s * 0.6, AZUL, 0.3); }
    if (tipo === 'colete') { ctx.fillStyle = '#6B4429'; ctx.strokeStyle = '#2E1C10'; ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.3); ctx.lineTo(-s * 0.08, -s * 0.36); ctx.lineTo(0, -s * 0.2); ctx.lineTo(s * 0.08, -s * 0.36); ctx.lineTo(s * 0.3, -s * 0.3); ctx.lineTo(s * 0.32, s * 0.36); ctx.lineTo(-s * 0.32, s * 0.36); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#B8C0CE'; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.roundRect(sd * s * 0.2 - s * 0.08, -s * 0.15 + i * s * 0.15, s * 0.16, s * 0.12, s * 0.02); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#8A6A4C'; ctx.beginPath(); ctx.ellipse(0, -s * 0.33, s * 0.34, s * 0.07, 0, 0, TAU); ctx.fill(); }
    if (tipo === 'manto') { ctx.fillStyle = '#1F2C5C'; ctx.strokeStyle = '#0C1430'; ctx.lineWidth = s * 0.035; ctx.beginPath(); ctx.moveTo(-s * 0.24, -s * 0.38); ctx.lineTo(s * 0.24, -s * 0.38); ctx.lineTo(s * 0.36, s * 0.4); ctx.lineTo(-s * 0.36, s * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#D9A93A'; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.moveTo(-s * 0.06, -s * 0.36); ctx.lineTo(-s * 0.03, s * 0.38); ctx.moveTo(s * 0.06, -s * 0.36); ctx.lineTo(s * 0.03, s * 0.38); ctx.moveTo(-s * 0.34, s * 0.34); ctx.lineTo(s * 0.34, s * 0.34); ctx.stroke(); ctx.fillStyle = '#7A2638'; ctx.fillRect(-s * 0.3, s * 0.0, s * 0.6, s * 0.07); Valdor.brilhoRadial(ctx, 0, s * 0.25, s * 0.3, '127,230,255', 0.5); }
    if (tipo === 'arco') { ctx.strokeStyle = '#7A4A26'; ctx.lineWidth = s * 0.07; ctx.beginPath(); ctx.arc(-s * 0.1, 0, s * 0.42, -1.2, 1.2); ctx.stroke(); ctx.strokeStyle = '#EDE6D0'; ctx.lineWidth = s * 0.015; ctx.beginPath(); ctx.moveTo(-s * 0.1 + Math.cos(-1.2) * s * 0.42, Math.sin(-1.2) * s * 0.42); ctx.lineTo(-s * 0.1 + Math.cos(1.2) * s * 0.42, Math.sin(1.2) * s * 0.42); ctx.stroke(); }
    if (tipo === 'adagas') { for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * 0.5); ctx.fillStyle = '#3A2C55'; ctx.fillRect(-s * 0.04, s * 0.1, s * 0.08, s * 0.22); ctx.fillStyle = '#C8CCD8'; ctx.fillRect(-s * 0.12, s * 0.08, s * 0.24, s * 0.04); ctx.fillStyle = '#E8EEF8'; ctx.beginPath(); ctx.moveTo(-s * 0.05, s * 0.08); ctx.lineTo(0, -s * 0.42); ctx.lineTo(s * 0.05, s * 0.08); ctx.fill(); ctx.restore(); } }
    if (tipo === 'lamina') Combate.laminaRubra(ctx, 0, s * 0.42, s * 0.95, t, 0.35, { brilho: 1 });
    if (tipo === 'rede') { ctx.strokeStyle = '#DCE6F4'; ctx.lineWidth = s * 0.02; for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(0, 0, s * 0.1 * i, 0, TAU); ctx.stroke(); } for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4); ctx.stroke(); ctx.fillStyle = '#5A6070'; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42, s * 0.03, 0, TAU); ctx.fill(); } }
    if (tipo === 'besta') { ctx.save(); ctx.rotate(-0.5); ctx.fillStyle = '#7A4A26'; ctx.fillRect(-s * 0.05, -s * 0.38, s * 0.1, s * 0.76); ctx.strokeStyle = '#D6E0EE'; ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.arc(0, s * 0.42, s * 0.42, -2.4, -0.74); ctx.stroke(); ctx.strokeStyle = '#EDE6D0'; ctx.lineWidth = s * 0.015; ctx.beginPath(); ctx.moveTo(-s * 0.31, s * 0.14); ctx.lineTo(0, s * 0.02); ctx.lineTo(s * 0.31, s * 0.14); ctx.stroke(); ctx.fillStyle = '#E8F0FF'; ctx.fillRect(-s * 0.012, -s * 0.45, s * 0.024, s * 0.5); ctx.restore(); }
    ctx.restore();
  }
  function carta3(ctx, x, y, s, item, k, t, o = {}) {
    if (k <= 0) return;
    if (item.rar !== 'lendario' && ['couro', 'pocao', 'anel', 'luvas'].includes(item.icone)) return cartaLoot(ctx, x, y, s, item, k, t, o);
    const [cor, rgb, rot] = item.rar === 'lendario' ? RARL : RAR[item.rar], w = s, h = s * 1.4;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.giro || 0);
    Valdor.brilhoRadial(ctx, 0, 0, s * (item.rar === 'lendario' ? 1.3 : 0.95), rgb, item.rar === 'lendario' ? 0.7 : 0.45);
    ctx.fillStyle = item.rar === 'lendario' ? 'rgba(40,8,12,0.82)' : 'rgba(16,20,40,0.72)'; ctx.strokeStyle = cor; ctx.lineWidth = item.rar === 'lendario' ? 8 : 5; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.stroke();
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.2)'); g.addColorStop(0.4, 'rgba(255,255,255,0.02)'); g.addColorStop(1, 'rgba(255,255,255,0.08)'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.translate(0, -h * 0.13); iconeNovo(ctx, item.icone, s * 0.62, t); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${s * 0.085}px Inter`; ctx.fillStyle = '#FFFFFF'; ctx.fillText(item.nome, 0, h * 0.2);
    ctx.font = `800 ${s * 0.07}px Inter`; ctx.fillStyle = cor; ctx.fillText(rot, 0, h * 0.28);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(-w * 0.4, h * 0.33, w * 0.8, h * 0.11, h * 0.05); ctx.fill();
    ctx.font = `900 ${s * 0.1}px Inter`; ctx.fillStyle = '#9BF0A8'; ctx.fillText(item.preco, 0, h * 0.385);
    ctx.restore();
  }
  const LOOT3 = [
    { nome: 'Saco de moedas', rar: 'comum', preco: 'R$ 18,40', icone: 'moedas' },
    { nome: 'Poção grande', rar: 'comum', preco: 'R$ 4,00', icone: 'pocaoG' },
    { nome: 'Botas do vento', rar: 'raro', preco: 'R$ 35,00', icone: 'botas' },
    { nome: 'Colete do Caçador', rar: 'epico', preco: 'R$ 120,00', icone: 'colete' },
    { nome: 'Manto do Arcano', rar: 'epico', preco: 'R$ 150,00', icone: 'manto' },
  ];
  // posições da luta (Z < 17: ninguém na água)
  const PT = [0.25, 5.6], PL = [0.95, 6.9], PD = [-1.7, 4.3], LA = [-2.9, 5.6], LB = [-1.2, 6.4], LC = [-3.4, 6.4];
  const TEOV = (vida, atraso) => [vida, atraso];
  // ================= Parte 4: Cânion Vermelho =================
  window.MUNDO_3D = 'canion';
  const ARQ = { fabrica: 'criarArqueira', registroPoses: 'POSES_PADRAO' }, GIG = { fabrica: 'criarGigante', registroPoses: 'POSES_PADRAO' };
  const ASS = { fabrica: 'criarAssassina', registroPoses: 'POSES_PADRAO' }, ENC = { fabrica: 'criarEncapuzado', registroPoses: 'POSES_PADRAO' };
  const DAVIE = { fabrica: 'criarDaviEspada', registroPoses: 'DAVI_JOGO_POSES' };
  const VERDE = '120,230,120', GELO = '170,230,255', FOGO = '255,150,60';
  // câmera sempre em movimento (referências do autor): gira devagar em volta do assunto, aproxima e sobe um pouco.
  // O enquadramento escrito no plano é o do MEIO do plano; no começo e no fim a câmera está levemente girada.
  // o.mov = { orbita (rad), empurra (fração da distância), sobe (m), dist (m até o assunto) } | false
  const camDia = (api, o) => {
    window.MUNDO_3D = 'canion'; const c = { f: 1100, x: 0, y: 1.5, z: 0, cy: 900, nevoa: V().nevoa(0, true, 'canion'), ...o };
    // direção do giro fixa no plano inteiro (sorteada pela duração do plano; nunca pela posição, que muda a cada quadro)
    const h = Math.sin((api.dur || 1) * 12.9898) * 43758.5453, sem = (h - Math.floor(h)) * 2 - 1, m = o.mov === false ? null : { orbita: 0.17 * (sem > 0 ? 1 : -1), empurra: 0.08, sobe: 0.1 * (sem > 0.5 ? -1 : 1), dist: 4.2, ...(o.mov || {}) };
    if (m && api.dur) { const r = api.ease.suave(cl(api.u / api.dur)) - 0.5, D = m.dist, y0 = c.yaw || 0, px = c.x + Math.sin(y0) * D, pz = c.z + Math.cos(y0) * D, yaw = y0 + m.orbita * r, Dd = D * (1 - m.empurra * r);
      c.x = px - Math.sin(yaw) * Dd; c.z = pz - Math.cos(yaw) * Dd; c.yaw = yaw; c.y += m.sobe * r; }
    return api.camera(c);
  };
  // pose por chaves no tempo, com transição suave entre elas (antecipação → golpe → continuação, sem "pulos")
  function poseChave(r, chaves) {
    if (r <= chaves[0][0]) return chaves[0][1]; const ult = chaves[chaves.length - 1]; if (r >= ult[0]) return ult[1];
    let i = 0; while (r > chaves[i + 1][0]) i++; const [r0, A] = chaves[i], [r1, B, tipo] = chaves[i + 1], k0 = (r - r0) / (r1 - r0), c1 = 1.9, c3 = c1 + 1;
    // 'golpe': sai rápido e passa um pouco do ponto antes de assentar; 'rapido': sai rápido e freia; padrão: suave nas duas pontas
    const k = tipo === 'golpe' ? 1 + c3 * Math.pow(k0 - 1, 3) + c1 * Math.pow(k0 - 1, 2) : tipo === 'rapido' ? 1 - Math.pow(1 - k0, 3) : k0 * k0 * (3 - 2 * k0), out = {};
    for (const n of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[n], b = B[n]; if (typeof a === 'number' || typeof b === 'number') out[n] = (typeof a === 'number' ? a : 0) + ((typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0)) * k; else out[n] = k < 0.5 ? (a !== undefined ? a : b) : (b !== undefined ? b : a); }
    return out;
  }
  // parada no impacto (hit-stop): o tempo congela por um instante no golpe
  const paraNoImpacto = (r, em, dura = 0.05) => (r < em ? r : r < em + dura ? em : r - dura);
  // onda no chão (anéis de luz saindo do ponto de impacto)
  const onda = (x, z, k, cor = '#FFE2B0', s = 1) => (k > 0 && k < 1 ? { tipo: 'onda', x, z, k, cor, s } : null);
  const dia = (ctx, api, cam, ents, o = {}) => noite(ctx, api, cam, ents, { dia: true, bokeh: 3, ...o });
  // ruína (masmorra de pedra, estilo da referência do autor)
  // a luta também é no cânion (pedido do autor): mesmas câmeras do cânion, luz de sol de lado nos personagens
  const camRuina = (api, o) => camDia(api, o);
  const ruina = (ctx, api, cam, ents, o = {}) => dia(ctx, api, cam, ents, o);
  const LUZ_TOCHA = { lado: 1, forca: 0.5, cor: 'rgb(255,225,180)', sombra: 0.6 };
  // barrinha de vida verde em cima da cabeça (como na referência)
  function vidaCabeca(ctx, x, y, frac, o = {}) { const w = o.w || 120, h = o.h || 14; ctx.save(); ctx.fillStyle = 'rgba(10,14,20,0.85)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 8); ctx.fill(); ctx.fillStyle = o.cor || '#4FD06A'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w * Math.max(0, Math.min(1, frac)), h, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - w / 2 + 4, y - h / 2 + 2, w * Math.max(0, frac) - 8, 3); ctx.restore(); }
  // etiqueta verde de preço em cima da cabeça ("R$ 1.000")
  function etiqueta(ctx, x, y, txt, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = '800 30px Inter'; const w = ctx.measureText(txt).width + 64; ctx.fillStyle = 'rgba(14,40,24,0.92)'; ctx.strokeStyle = '#4FD06A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-w / 2, -22, w, 44, 22); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#4FD06A'; ctx.beginPath(); ctx.arc(-w / 2 + 24, 0, 12, 0, TAU); ctx.fill(); ctx.strokeStyle = '#0E2818'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 18, 0); ctx.lineTo(-w / 2 + 23, 5); ctx.lineTo(-w / 2 + 31, -5); ctx.stroke(); ctx.fillStyle = '#E8FFE8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + 44, 1); ctx.restore(); }
  // transição de clarão: uma faixa de luz varrendo a tela (como na referência)
  function clarao(ctx, k) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const x = -400 + k * (W + 800); ctx.globalCompositeOperation = 'screen'; for (const [w, a] of [[520, 0.35], [220, 0.7], [70, 1]]) { const g = ctx.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, 'rgba(200,220,255,0)'); g.addColorStop(0.5, `rgba(235,242,255,${a})`); g.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - w, 0, w * 2, H); } ctx.restore(); }
  // Davi com a Lâmina Rubra na mão (cabo atrás dos dedos, lâmina na frente de tudo); ângulo em window.ESPADA_MAO
  window.criarDaviEspada = (o = {}, vista = 'frente') => {
    const def = window.criarDaviArcano(o, vista), mao = def.partes.find((q) => q.nome === 'mao_d'); if (!mao) return def;
    const T0 = def.alturaEmH * 0.5;
    const peca = (nome, z, so) => ({ nome, pai: 'mao_d', pivo: [0, 0.17], z, desenhar: (pc) => {
      const g = pc.ctx, m = g.getTransform(), esc = Math.hypot(m.c, m.d), e = window.ESPADA_MAO || {}, S = T0 * esc, a = e.ang || 0, dd = 0.06 * S;
      g.save(); g.setTransform(1, 0, 0, 1, m.e - dd * Math.sin(a), m.f + dd * Math.cos(a)); Combate.laminaRubra(g, 0, 0, S, e.t || 0, a, { brilho: e.brilho === undefined ? 1 : e.brilho, semAura: true, so }); g.restore();
    } });
    const zMax = Math.max(...def.partes.map((q) => q.z));
    def.partes.push(peca('espada_cabo', mao.z - 0.004, 'cabo'), peca('espada_lamina', zMax + 1, 'lamina'));
    return def;
  };
  // cartaz de recompensa (papel velho, retrato do Davi)
  function cartaz(ctx, api, x, y, s, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-195, -255, 400, 520);
    const g = ctx.createLinearGradient(0, -260, 0, 260); g.addColorStop(0, '#EAD6A8'); g.addColorStop(1, '#C9A86E'); ctx.fillStyle = g; ctx.fillRect(-200, -260, 400, 520);
    ctx.strokeStyle = '#7A5A32'; ctx.lineWidth = 6; ctx.strokeRect(-186, -246, 372, 492);
    ctx.font = '900 54px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#7A1E16'; ctx.fillText('PROCURADO', 0, -190);
    ctx.save(); ctx.beginPath(); ctx.rect(-140, -160, 280, 270); ctx.clip(); ctx.fillStyle = '#6A4A2A'; ctx.fillRect(-140, -160, 280, 270);
    ctx.translate(0, 0); close(api, { ...(o.item || DAVIA), pose: 'parado', expressao: 'neutro' }, 0, -20, 300, {}); ctx.restore();
    ctx.strokeStyle = '#3A2414'; ctx.lineWidth = 5; ctx.strokeRect(-140, -160, 280, 270);
    ctx.font = '900 70px Inter'; ctx.fillStyle = '#2A1A0E'; ctx.fillText(o.valor || 'R$ 1.000', 0, 190);
    ctx.font = '700 26px Inter'; ctx.fillText(o.sub || 'QUEM PEGOU A LÂMINA RUBRA', 0, 232);
    ctx.restore();
  }
  // falcão (silhueta batendo asas)
  function falcao(ctx, x, y, s, t) { const a = Math.sin(t * 9) * 0.6; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#3A2418'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-40, -40 * a - 10, -78, -20 * a); ctx.lineTo(-10, 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(6, 0); ctx.quadraticCurveTo(40, -40 * a - 10, 78, -20 * a); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(22, -2); ctx.lineTo(36, 2); ctx.lineTo(22, 5); ctx.fill(); ctx.restore(); }
  // painel de vidro do jogo
  function painel(ctx, x, y, w, h, cor, k = 1) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(12,16,32,0.82)'; ctx.strokeStyle = cor; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x, y, w, h, 28); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // carta de magia (ícone desenhado + nome + custo de mana)
  function cartaMagia(ctx, x, y, s, nome, rgb, tipo, t, k = 1) {
    if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.globalAlpha = Math.min(1, k);
    Valdor.brilhoRadial(ctx, 0, 0, 170, rgb, 0.45);
    ctx.fillStyle = 'rgba(14,18,34,0.9)'; ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-100, -140, 200, 280, 22); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(0, -40);
    if (tipo === 'gelo') { for (const [dx, h, w] of [[-34, 70, 26], [0, 100, 32], [34, 64, 24]]) { const g = ctx.createLinearGradient(0, -h, 0, 30); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#5FC0F0'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(dx - w / 2, 30); ctx.lineTo(dx, -h + 30); ctx.lineTo(dx + w / 2, 30); ctx.closePath(); ctx.fill(); } }
    else if (tipo === 'raiz') { ctx.strokeStyle = '#6A4A2A'; ctx.lineCap = 'round'; for (const [a, l] of [[-0.6, 70], [0, 90], [0.6, 70]]) { ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 40); ctx.quadraticCurveTo(Math.sin(a) * l * 0.4 + 20 * Math.sin(t * 2 + a), 0, Math.sin(a) * l, 40 - Math.cos(a) * l); ctx.stroke(); } ctx.fillStyle = '#5ACF6A'; for (const [lx, ly] of [[-40, -20], [38, -18], [4, -48]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 14, 7, 0.6, 0, TAU); ctx.fill(); } }
    else if (tipo === 'meteoro') { const g = ctx.createLinearGradient(-60, -60, 30, 30); g.addColorStop(0, 'rgba(255,220,120,0)'); g.addColorStop(1, 'rgba(255,140,40,0.9)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(40, 10); ctx.lineTo(10, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#6A3A22'; ctx.beginPath(); ctx.arc(24, 24, 30, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFB040'; ctx.beginPath(); ctx.arc(30, 18, 12, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#BFE6FF'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(-20, 0); ctx.lineTo(14, 0); ctx.lineTo(-10, 60); ctx.stroke(); }
    ctx.restore();
    ctx.font = '900 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; const pal = nome.split(' '); pal.forEach((p, i) => ctx.fillText(p, 0, 60 + i * 34 - (pal.length - 1) * 10));
    ctx.font = '800 24px Inter'; ctx.fillStyle = '#7FC8FF'; ctx.fillText('MANA 30', 0, 122);
    ctx.restore();
  }
  // selo "SAIU DO JOGO" em cima da cabeça
  function etiquetaSaiu(ctx, x, y, k) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, k * 1.5); ctx.fillStyle = 'rgba(10,30,50,0.85)'; ctx.strokeStyle = '#9FE8FF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-150, -34, 300, 60, 16); ctx.fill(); ctx.stroke(); ctx.font = '900 34px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#DFF8FF'; ctx.fillText('SAIU DO JOGO', 0, -3); ctx.restore(); }
  // flecha 3D entre dois pontos do mundo: k = 0 (saindo) → 1 (chegou); a ponta fica no ponto B quando crava
  function flecha3d(A, B, k, o = {}) { const s = o.s || 1.4, dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], L = Math.hypot(dx, dy, dz) || 1, recua = (0.44 * s) / L, kk = Math.min(k, 1 - (o.crava === false ? 0 : recua * 0.6));
    return { tipo: 'flecha', x: A[0] + dx * kk, y: A[1] + dy * kk, z: A[2] + dz * kk, dx, dy, dz, s, rastro: o.rastro === undefined ? (k < 1 ? 1 : 0) : o.rastro, gelo: o.gelo || 0, brilho: o.brilho || 0 }; }
  // flecha 2D detalhada (haste com veio, amarração, ponta de aço com fio, penas com nervura)
  function flecha2d(ctx, x, y, ang, len, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const w = Math.max(5, len * 0.045);
    if (o.rastro) { const g = ctx.createLinearGradient(-len * 3, 0, -len * 0.4, 0); g.addColorStop(0, 'rgba(190,255,210,0)'); g.addColorStop(1, `rgba(220,255,230,${0.7 * o.rastro})`); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-len * 3, 0); ctx.lineTo(-len * 0.4, -w * 1.4); ctx.lineTo(-len * 0.4, w * 1.4); ctx.closePath(); ctx.fill(); }
    const gh = ctx.createLinearGradient(0, -w / 2, 0, w / 2); gh.addColorStop(0, '#D9A66A'); gh.addColorStop(0.5, '#A8743F'); gh.addColorStop(1, '#6A4626'); ctx.fillStyle = gh; ctx.fillRect(-len, -w / 2, len, w);
    ctx.fillStyle = '#3A2414'; ctx.fillRect(-w * 2.2, -w * 0.65, w * 1.6, w * 1.3); ctx.fillRect(-len - w * 0.6, -w * 0.6, w * 0.9, w * 1.2);
    const gp = ctx.createLinearGradient(0, -w * 2, 0, w * 2); gp.addColorStop(0, '#F4F8FC'); gp.addColorStop(0.5, '#B8C4D2'); gp.addColorStop(1, '#6E7C8C'); ctx.fillStyle = gp; ctx.beginPath(); ctx.moveTo(-w * 0.6, -w * 1.7); ctx.lineTo(w * 3.6, 0); ctx.lineTo(-w * 0.6, w * 1.7); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w * 0.4, -w * 1.4); ctx.lineTo(w * 3.4, 0); ctx.stroke();
    for (const sd of [-1, 1]) { ctx.fillStyle = sd < 0 ? '#4FD27A' : '#2E9A52'; ctx.beginPath(); ctx.moveTo(-len + w * 0.6, 0); ctx.quadraticCurveTo(-len + w * 2, sd * w * 3.2, -len + w * 7, sd * w * 2.6); ctx.lineTo(-len + w * 8.2, sd * w * 0.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(20,60,30,0.5)'; ctx.lineWidth = 1; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-len + w * (1 + i * 1.5), sd * w * 0.4); ctx.lineTo(-len + w * (0.4 + i * 1.5), sd * w * 2.4); ctx.stroke(); } }
    ctx.restore();
  }
  // muralha de gelo em perspectiva (blocos pontudos subindo do chão), rachaduras e lascas
  function muralhaGelo(ctx, cam, X, Z, larg, k, t, rach = 0) {
    if (k <= 0) return; const n = 9;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1) - 0.5, x = X + s * larg, h = (1.4 + 0.6 * rnd(i * 3.1)) * Math.min(1, k * 1.6 - i * 0.04), w = 0.32 + 0.12 * rnd(i);
      if (h <= 0) continue;
      const a = cam.p(x - w, 0, Z + rnd(i * 7) * 0.2), b = cam.p(x + w, 0, Z + rnd(i * 7) * 0.2), c = cam.p(x + (rnd(i * 5) - 0.5) * 0.2, h, Z);
      const g = ctx.createLinearGradient(c.x, c.y, a.x, a.y); g.addColorStop(0, 'rgba(240,252,255,0.95)'); g.addColorStop(0.5, 'rgba(150,215,245,0.85)'); g.addColorStop(1, 'rgba(70,150,210,0.8)');
      ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.lineTo(b.x, b.y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo((a.x + c.x) / 2, (a.y + c.y) / 2); ctx.lineTo((b.x + c.x) / 2 + 10, (b.y + c.y) / 2 + 30); ctx.stroke();
      if (rach > 0 && rnd(i * 11) < rach) { ctx.strokeStyle = 'rgba(30,60,90,0.8)'; ctx.lineWidth = 3; const mx = (a.x + b.x + c.x) / 3, my = (a.y + b.y + c.y) / 3; ctx.beginPath(); ctx.moveTo(mx, my); for (let j = 0; j < 4; j++) ctx.lineTo(mx + (rnd(i + j) - 0.5) * 80, my + (rnd(i * 2 + j) - 0.5) * 120); ctx.stroke(); }
    }
    // geada no chão
    const q = cam.p(X, 0, Z); ctx.globalAlpha = 0.5 * Math.min(1, k); ctx.fillStyle = 'rgba(230,248,255,0.8)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, larg * q.s * 0.7, larg * q.s * 0.12, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // raízes rasgando o chão e enrolando o alvo (screen-space a partir dos pés)
  function raizes(ctx, cam, X, Z, alt, k, t) {
    if (k <= 0) return; const q = cam.p(X, 0, Z), hp = alt * q.s;
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const lado = i % 2 ? 1 : -1, x0 = q.x + lado * (0.3 + rnd(i) * 0.6) * hp * 0.5, alto = (0.25 + rnd(i * 3) * 0.55) * hp * Math.min(1, k * 1.3);
      const g = ctx.createLinearGradient(x0, q.y, x0, q.y - alto); g.addColorStop(0, '#3A2414'); g.addColorStop(1, '#8A6A3A');
      ctx.strokeStyle = g; ctx.lineWidth = (0.05 + rnd(i * 5) * 0.03) * hp;
      ctx.beginPath(); ctx.moveTo(x0, q.y); ctx.bezierCurveTo(x0 + lado * 0.3 * hp, q.y - alto * 0.4, q.x - lado * 0.35 * hp + Math.sin(t * 3 + i) * 6, q.y - alto * 0.7, q.x + lado * 0.05 * hp, q.y - alto); ctx.stroke();
      ctx.fillStyle = '#5ACF6A'; ctx.beginPath(); ctx.ellipse(q.x + lado * 0.05 * hp, q.y - alto, 0.05 * hp, 0.022 * hp, lado, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(70,40,20,0.6)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.7 * hp, 0.08 * hp, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // raízes enroladas no corpo: cada raiz sobe do chão e dá voltas em volta das pernas, do tronco e dos braços
  function raizesNoCorpo(ctx, rig, k, t) {
    if (!rig || !rig.pontoMundo || k <= 0) return;
    const e = rig.escalaPx, partes = [['canela_d', 0, 1, 0], ['coxa_d', 0, 1, 0.12], ['canela_e', 0, 1, 0.05], ['coxa_e', 0, 1, 0.17], ['tronco', -0.05, -1.1, 0.3], ['antebraco_d', 0, 0.9, 0.45], ['antebraco_e', 0, 0.9, 0.5]];
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    partes.forEach(([nome, y0, y1, atraso], j) => {
      const kk = Math.max(0, Math.min(1, (k - atraso) / 0.45)); if (kk <= 0) return;
      const n = 22, larg = (nome === 'tronco' ? 0.3 : 0.12) * e, voltas = nome === 'tronco' ? 2.2 : 2.8, pts = [];
      for (let i = 0; i <= n * kk; i++) { const f = i / n, y = y0 + (y1 - y0) * f, a = rig.pontoMundo(nome, [0, y]), b = rig.pontoMundo(nome, [0.1, y]), nx = b.x - a.x, ny = b.y - a.y, nl = Math.hypot(nx, ny) || 1, ang = f * voltas * Math.PI * 2 + j; pts.push([a.x + (nx / nl) * Math.sin(ang) * larg, a.y + (ny / nl) * Math.sin(ang) * larg, Math.cos(ang)]); }
      // parte de trás da volta (mais escura e fina) e parte da frente (grossa, com brilho)
      for (const frente of [false, true]) for (let i = 1; i < pts.length; i++) {
        const [x0, y0p, z0] = pts[i - 1], [x1, y1p, z1] = pts[i]; if ((z0 + z1 > 0) !== frente) continue;
        ctx.strokeStyle = frente ? '#5A3A1E' : '#2E1C10'; ctx.lineWidth = (frente ? 0.075 : 0.05) * e; ctx.beginPath(); ctx.moveTo(x0, y0p); ctx.lineTo(x1, y1p); ctx.stroke();
        if (frente) { ctx.strokeStyle = 'rgba(190,140,80,0.6)'; ctx.lineWidth = 0.018 * e; ctx.beginPath(); ctx.moveTo(x0, y0p - 0.02 * e); ctx.lineTo(x1, y1p - 0.02 * e); ctx.stroke(); }
      }
      // folhas brotando nas raízes
      for (let i = 3; i < pts.length; i += 6) if (pts[i][2] > 0) { ctx.fillStyle = '#5ACF6A'; ctx.beginPath(); ctx.ellipse(pts[i][0] + 0.04 * e, pts[i][1], 0.05 * e, 0.022 * e, 0.6 + j, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2E7A3A'; ctx.lineWidth = 0.006 * e; ctx.stroke(); }
    });
    // raízes grossas saindo do chão em volta dos pés
    const pe = rig.pontoMundo('pe_d', [0, 0.05]), pe2 = rig.pontoMundo('pe_e', [0, 0.05]), cx = (pe.x + pe2.x) / 2, cy = Math.max(pe.y, pe2.y);
    for (let i = 0; i < 6; i++) { const lado = i % 2 ? 1 : -1, x0 = cx + lado * (0.25 + 0.12 * i) * e * Math.min(1, k * 2); ctx.strokeStyle = '#4A2E18'; ctx.lineWidth = 0.09 * e * (1 - i * 0.1); ctx.beginPath(); ctx.moveTo(x0, cy + 0.02 * e); ctx.quadraticCurveTo((x0 + cx) / 2, cy - 0.18 * e * Math.min(1, k * 2), cx + lado * 0.08 * e, cy - 0.05 * e); ctx.stroke(); }
    ctx.restore();
  }
  // meteoro (rocha em chamas com rastro)
  function meteoro(ctx, x, y, s, t) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 12; i++) { const f = i / 12, g = ctx.createRadialGradient(x - f * s * 3.2, y - f * s * 4.2, 0, x - f * s * 3.2, y - f * s * 4.2, s * (1.1 - f * 0.6)); g.addColorStop(0, `rgba(255,${200 - f * 100},80,${0.5 * (1 - f)})`); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(x - f * s * 3.2 - s, y - f * s * 4.2 - s, s * 2, s * 2); }
    ctx.restore(); ctx.save(); Valdor.brilhoRadial(ctx, x, y, s * 2.4, FOGO, 0.7);
    ctx.fillStyle = '#4A2A1A'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU, r = s * (0.55 + 0.12 * rnd(i)); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF9A30'; ctx.beginPath(); ctx.arc(x + s * 0.15, y + s * 0.15, s * 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.arc(x + s * 0.22, y + s * 0.22, s * 0.14, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // explosão de fogo (bola + onda + brasas)
  function explosao(ctx, x, y, s, k, t) {
    if (k <= 0 || k > 1.4) return; const v = 1 - Math.min(1, k / 1.4);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const [r, c, a] of [[1.3, '255,240,180', 0.9], [1.0, '255,170,60', 0.85], [0.7, '255,90,30', 0.7]]) { const g = ctx.createRadialGradient(x, y, 0, x, y, s * r * (0.5 + k)); g.addColorStop(0, `rgba(${c},${a * v})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * r * (0.5 + k), 0, TAU); ctx.fill(); }
    ctx.restore(); Noite.fumaca(ctx, x, y + s * 0.3, s * 1.1, Math.min(0.95, k * 0.7), { seed: 9, cor: '90,70,60', sobe: 1.2, largura: 1.6, n: 20 }); brasas(ctx, x, y, s * 2.4, t, v, 7);
  }
  // pegadas aparecendo na poeira
  function pegadas(ctx, cam, pts, k) { ctx.save(); pts.forEach(([X, Z], i) => { const a = Math.min(1, k * pts.length - i); if (a <= 0) return; const q = cam.p(X, 0.01, Z); ctx.fillStyle = `rgba(90,40,20,${0.55 * a})`; ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.09 * q.s, 0.03 * q.s, 0, 0, TAU); ctx.fill(); Noite.fumaca(ctx, q.x, q.y, 0.15 * q.s, Math.min(0.9, (k * pts.length - i) * 0.4), { seed: i, cor: '220,170,120', sobe: 0.3, n: 6 }); }); ctx.restore(); }
  // relógio da recompensa
  function relogio(ctx, x, y, txt, k = 1, tam = 64) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(40,6,10,0.85)'; ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x - tam * 3.1, y - tam * 0.85, tam * 6.2, tam * 1.5, 18); ctx.fill(); ctx.stroke(); ctx.font = `900 ${tam}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD0C8'; ctx.fillText('⏱ ' + txt, x, y); ctx.restore(); }
  const D0 = [-0.55, 5.2], T0P = [0.6, 5.5];
  // conversa andando: câmera de costas na frente deles, fechada em quem fala (boca mexendo com a voz)
  function papo(ctx, u, d, api, quem, eD, eT, o = {}) {
    const anda = o.para ? Math.max(0, 0.4 - u * 0.5) : 1, z = 0.4 + u * 0.75 * anda, dav = quem === 'davi';
    const cam = camDia(api, { x: dav ? 0.32 : -0.38, y: 1.6, z: z + 1.75, cy: 740, f: 1450, yaw: Math.PI });
    dia(ctx, api, cam, [
      { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: eD, voz: 'davi' }, 0.45, z, 1.76, o.para ? { rumo: Math.PI - 0.5 } : { caminharFrontal: api.t * 1.25, rumo: Math.PI }) },
      { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: eT, voz: 'teo' }, -0.5, z + 0.1, 1.8, { caminharFrontal: api.t * 1.25 + 0.5, rumo: Math.PI }) },
    ], { forca: 0.3, bokeh: 6 });
  }
  const borda = (z, lado) => V().canParede(z, lado, V().CAN_ALT);

  // ================= Parte 5: o Cânion Vermelho de noite =================
  // câmera de noite: a mesma do cânion, com a névoa azul da noite
  const camCan = (api, o) => camDia(api, { nevoa: V().nevoa(1, false, 'canion'), ...o });
  const CAC = (v, arma) => ({ fabrica: 'criarCacadorNoite', opcoes: { variante: v, ...(arma !== undefined ? { arma } : {}) }, registroPoses: 'POSES_PADRAO' });
  const LIDER5 = { fabrica: 'criarLadrao', opcoes: { lider: true, estilo: 'D' }, registroPoses: 'LADRAO_POSES' };
  const POSE_TOCHA = { braco_d: 10, antebraco_d: -12, braco_e: -38, antebraco_e: -115, mao_e: 10, coxa_d: 4, coxa_e: -4, tronco: 2 };
  function fundoFicha(ctx, titulo, sub) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A1838'); g.addColorStop(0.6, '#2A1E3E'); g.addColorStop(1, '#3A2230'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { const x = (i * 397) % W, y = (i * 211) % 700; ctx.fillStyle = `rgba(220,230,255,${0.2 + (i % 5) * 0.1})`; ctx.fillRect(x, y, 2, 2); }
    ctx.save(); ctx.font = '900 64px Inter'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.fillText(titulo, W / 2, 120); ctx.font = '700 32px Inter'; ctx.fillStyle = '#BFC8E8'; sub.split('\\n').forEach((l, i) => ctx.fillText(l, W / 2, 178 + i * 40)); ctx.restore();
  }
  function rotuloFicha(ctx, x, y, nome, extra) { ctx.save(); ctx.textAlign = 'center'; ctx.font = '800 32px Inter'; ctx.fillStyle = '#FFE6A0'; ctx.fillText(nome, x, y); if (extra) { ctx.font = '600 25px Inter'; ctx.fillStyle = '#C8D0E8'; extra.split('\n').forEach((l, i) => ctx.fillText(l, x, y + 36 + i * 30)); } ctx.restore(); }
  function sombraPe(ctx, x, y, w) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.18, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // ---------- transformação do Téo no cânion ----------
  const FERA5 = (e) => ({ fabrica: 'criarTeoFera', opcoes: { estagio: e, roupa: 'B' }, registroPoses: 'TEO_FERA_POSES' });
  const PD5 = [-0.55, 3.0], PT5 = [0.55, 3.3];                     // Davi e Téo lado a lado
  const LUA5 = { ...LUZ_LUA, forca: 0.8 };
  const nt = (ctx, api, cam, ents, o = {}) => noite(ctx, api, cam, ents, { noite: 1, forca: 0.3, ...o });
  // olhos acesos do Téo na tela (a partir do rig)
  const olhosTeo = (ctx, rig, r, k, t, vista = 'frente') => { if (!rig || !rig.pontoMundo || k <= 0) return; const xs = vista === 'tq' ? [0.12, 0.38] : [-0.19, 0.19]; Noite.olhos(ctx, xs.map((x) => { const p = rig.pontoMundo('cabeca', [x, -0.37]); return [p.x, p.y]; }), r, k, t); };
  // placa em cima da cabeça trocando (TÉO · NV 12 → FERA · NV ???)
  function placaNivel(ctx, x, y, txt, cor, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.font = '800 34px Inter'; const w = ctx.measureText(txt).width + 48; ctx.fillStyle = 'rgba(12,12,20,0.88)'; ctx.strokeStyle = cor; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-w / 2, -26, w, 52, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = cor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2); ctx.restore(); }
  // pedrinhas despencando das paredes (o uivo faz o cânion tremer)
  function pedrinhas(ctx, api, k, seed = 3) { if (k <= 0) return; ctx.save(); for (let i = 0; i < 26; i++) { const lado = i % 2 ? 1 : -1, f = ((api.t * (0.5 + (i % 5) * 0.12) + i * 0.137 + seed) % 1), x = W / 2 + lado * (300 + ((i * 97) % 220)), y = -40 + f * 1300, r = 4 + (i % 4) * 3; ctx.fillStyle = `rgba(60,34,40,${0.85 * k})`; ctx.beginPath(); ctx.arc(x + Math.sin(f * 6 + i) * 12, y, r, 0, TAU); ctx.fill(); } ctx.restore(); }
  // capa verde rasgada caindo (2D, em tela)
  function capaCaindo(ctx, x, y, s, k) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.translate(x - 0.3 * s * k, y + 0.9 * s * k * k); ctx.rotate(-0.9 * k); ctx.globalAlpha = 1 - Math.max(0, k - 0.75) * 4; ctx.fillStyle = '#2E5A34'; ctx.strokeStyle = '#1A2A1C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-0.3 * s, 0); ctx.lineTo(0.28 * s, 0.05 * s); ctx.lineTo(0.36 * s, 0.6 * s); ctx.lineTo(0.18 * s, 0.52 * s); ctx.lineTo(0.08 * s, 0.7 * s); ctx.lineTo(-0.1 * s, 0.55 * s); ctx.lineTo(-0.34 * s, 0.66 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }

  // passo pesado da fera vista de frente (um passo de cada vez): k = número do passo (alterna a perna), p = 0..1 dentro do passo
  //   0–0,2 joga o peso para a perna de apoio · 0,15–0,7 levanta e traz a outra perna (joelho dobra, corpo sobe)
  //   0,7 pisa: o corpo afunda, a cabeça dá um tranco, o braço do outro lado balança · 0,7–1 assenta com um repique
  //   p = null → parada entre passos: respira pesado (ombros sobem e descem), cabeça baixa, garras abertas
  function passoFera(k, p, t) {
    // vista de frente: tronco/cabeça/quadril giram NO PLANO DA TELA (inclinam para o lado), então ficam quase retos
    const G = window.TEO_LOBISOMEM_POSES.garras.angulos, o = { ...G, tronco: 0, cabeca: 0 };
    const sm = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q); };
    if (p === null) {
      const r = Math.sin(t * 3.2), r2 = Math.sin(t * 3.2 + 0.9);
      Object.assign(o, { tronco: 0.8 * r, cabeca: -1 * r2, braco_d: G.braco_d + 3 * r, braco_e: G.braco_e - 3 * r, antebraco_d: G.antebraco_d - 4 * r2, antebraco_e: G.antebraco_e + 4 * r2, _desloca: [0, 0.02 * r] });
      return o;
    }
    const perna = k % 2 ? 'e' : 'd', s = perna === 'd' ? 1 : -1, apoio = -s;           // _d fica à esquerda da tela (vista de frente)
    const peso = sm(0, 0.2, p) * (1 - sm(0.72, 1, p));                                    // peso na perna de apoio
    const sobe = Math.sin(Math.PI * cl((p - 0.15) / 0.55));                               // perna no ar
    const pisa = p > 0.7 ? Math.exp(-(p - 0.7) * 9) * Math.sin(Math.min(1, (p - 0.7) / 0.08) * Math.PI / 2) : 0; // tranco da pisada
    const rep = p > 0.78 ? -0.35 * Math.sin((p - 0.78) / 0.22 * Math.PI) : 0;            // repique ao assentar
    o['coxa_' + perna] = (G['coxa_' + perna] || 0) + s * 3 * sobe;
    o['canela_' + perna] = (G['canela_' + perna] || 0) + s * 10 * sobe;
    o['pe_' + perna] = (G['pe_' + perna] || 0) - s * 6 * sobe;
    o['_dy_coxa_' + perna] = -0.34 * sobe;
    const outra = perna === 'd' ? 'e' : 'd';
    o['coxa_' + outra] = (G['coxa_' + outra] || 0) - s * 4 * peso; o['canela_' + outra] = (G['canela_' + outra] || 0) - s * 8 * peso;
    // braço do lado oposto à perna vai à frente (abre), o do mesmo lado recolhe; garras balançando com o tranco
    o['braco_' + outra] = (G['braco_' + outra] || 0) - s * (10 * sobe + 8 * pisa); o['antebraco_' + outra] = (G['antebraco_' + outra] || 0) - s * 14 * sobe;
    o['braco_' + perna] = (G['braco_' + perna] || 0) + s * 6 * sobe; o['mao_' + perna] = (G['mao_' + perna] || 0) + s * 10 * pisa;
    o.quadril = 2 * apoio * peso; o.tronco = 2 * apoio * peso; o.cabeca = -1.5 * apoio * peso;
    o['braco_' + outra] -= s * 8 * sobe; o['braco_' + perna] += s * 10 * sobe;
    o._desloca = [0.03 * apoio * peso, -0.05 * sobe + 0.08 * pisa + 0.03 * rep];
    // o tranco da pisada vai para o tronco e os joelhos (o corpo afunda sem tirar os pés do chão)
    o['canela_' + outra] += -s * 10 * pisa; o['coxa_' + outra] += -s * 3 * pisa;
    return o;
  }
  // ---------- visão do Davi (câmera nos olhos dele) ----------
  // passos: [[segundo em que começa, índice do passo]] · cada passo anda 0,8 m em 0,55 s; entre eles a fera para e rosna
  function povFera(ctx, u, d, api, o) {
    const X = PD5[0] + 0.12, Z0 = PD5[1] + o.z0, DUR = 0.85;
    let anda = o.passos.length ? o.passos[0][1] : 0, passo = null, pisada = -9;
    const sm = (a, b, x) => { const q = cl((x - a) / (b - a)); return q * q * (3 - 2 * q); };
    for (const [t0, k] of o.passos) { const p = cl((u - t0) / DUR); if (u >= t0) { anda = k + sm(0.18, 0.74, p); if (p < 1) passo = [k, p]; pisada = t0 + 0.72 * DUR; } }
    const base = o.passos.length ? o.passos[0][1] : 0, FZ = Z0 - 0.5 * (anda - base) - (o.perto || 0) * 0.5;
    const imp = Math.max(0, 1 - (u - pisada) / 0.4) * (u >= pisada ? 1 : 0);
    const cam = camCan(api, { x: PD5[0] + Math.sin(api.t * 1.7) * 0.012, y: 1.62 + Math.sin(api.t * 2.3) * 0.01 - 0.03 * imp, z: PD5[1] - 0.15 * (o.perto || 0), cy: 1200 - 100 * (o.perto || 0), f: 2000 - 250 * (o.perto || 0), yaw: 0.02 + Math.sin(api.t * 1.1) * 0.006, mov: false });
    nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...LOBO, pose: (() => { const ps = passoFera(passo ? passo[0] : 0, passo ? passo[1] : null, api.t); if (o.perto) { ps._desloca = [(ps._desloca || [0, 0])[0], (ps._desloca || [0, 0])[1] + 0.12 * o.perto]; } return ps; })(), expressao: passo ? 'raiva' : 'rugido' }, X, FZ, 2.55, { y: -0.12, parado: true, olhaPara: [PD5[0], PD5[1] - 3], luz: LUA5 }) }], {
      forca: 0, bokeh: 3, fx: { borrao: [Math.sin(api.t * 40) * 6 * imp, Math.cos(api.t * 37) * 6 * imp] },
      fim: () => {
        // chão some no escuro embaixo do quadro (as pernas ficam fora de vista)
        { const gb = ctx.createLinearGradient(0, H * 0.72, 0, H); gb.addColorStop(0, 'rgba(6,4,14,0)'); gb.addColorStop(1, 'rgba(6,4,14,0.85)'); ctx.fillStyle = gb; ctx.fillRect(0, H * 0.72, W, H * 0.28); }
        maoPOV(ctx, o.maoK || 0, api.t);
        // bordas escuras de quem está olhando (visão de primeira pessoa) e o coração batendo
        const bat = 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(api.t * 7.5)), 8), v = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.26, W / 2, H * 0.5, H * 0.75);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(4,2,10,${0.55 + 0.12 * bat})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      },
    });
  }
  // a mão do Davi entrando no quadro por baixo, aberta (manga azul com punho dourado e a luva com a pedra azul)
  function maoPOV(ctx, k, t) {
    if (k <= 0) return; const e = 1 - Math.pow(1 - k, 3), x = 700 + 40 * (1 - e), y = H + 260 - 720 * e, bal = Math.sin(t * 2) * 6;
    ctx.save(); ctx.translate(x, y + bal); ctx.rotate(-0.12);
    const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#1E2C6A'); g.addColorStop(0.5, '#3448A8'); g.addColorStop(1, '#1A2660');
    ctx.fillStyle = g; ctx.strokeStyle = '#0C1230'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-130, 700); ctx.lineTo(-105, 120); ctx.lineTo(105, 120); ctx.lineTo(140, 700); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D9B44A'; ctx.beginPath(); ctx.roundRect(-112, 96, 224, 46, 14); ctx.fill(); ctx.stroke();
    const luva = '#22306E', luz = '#3E56B8';
    ctx.fillStyle = luva; ctx.beginPath(); ctx.roundRect(-95, -60, 190, 170, 50); ctx.fill(); ctx.stroke();
    for (const [dx, h, a] of [[-66, 150, -0.12], [-22, 175, -0.03], [22, 170, 0.04], [64, 140, 0.13]]) { ctx.save(); ctx.translate(dx, -40); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-20, -h, 40, h + 20, 20); ctx.fill(); ctx.stroke(); ctx.fillStyle = luz; ctx.fillRect(-8, -h + 22, 8, h - 50); ctx.fillStyle = luva; ctx.restore(); }
    ctx.save(); ctx.translate(-92, 30); ctx.rotate(-0.85); ctx.beginPath(); ctx.roundRect(-22, -120, 44, 135, 22); ctx.fill(); ctx.stroke(); ctx.restore();
    const gl = ctx.createRadialGradient(0, 30, 0, 0, 30, 70); gl.addColorStop(0, 'rgba(140,210,255,0.9)'); gl.addColorStop(1, 'rgba(80,160,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 30, 70, 0, TAU); ctx.fill();
    ctx.fillStyle = '#BFE8FF'; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(16, 30); ctx.lineTo(0, 54); ctx.lineTo(-16, 30); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- rede de prata (caçador → fera) ----------
  const PC5 = [2.3, 9.2], PF5 = [0.7, 4.4];                       // caçador da rede e a fera
  const POSE_GIRA = (t) => ({ braco_d: 150 + 12 * Math.sin(t * 10), antebraco_d: -25 + 15 * Math.sin(t * 10 + 1), braco_e: -38, antebraco_e: -115, mao_e: 10, coxa_d: 8, canela_d: -6, coxa_e: -8, canela_e: 6 });
  const POSE_JOGA = (k) => poseChave(k, [[0, POSE_GIRA(0)], [0.35, { braco_d: 165, antebraco_d: -40, braco_e: -38, antebraco_e: -115, tronco: -6, coxa_d: 10, coxa_e: -10 }], [0.6, { braco_d: 40, antebraco_d: 10, braco_e: -38, antebraco_e: -115, tronco: 10, coxa_d: 14, canela_d: -10, coxa_e: -12, canela_e: 8 }, 'golpe']]);
  // trajeto da rede: arco da mão do caçador até a fera
  const caminhoRede = (k, de, ate, sobe = 1.0) => { const x = de[0] + (ate[0] - de[0]) * k, z = de[2] + (ate[2] - de[2]) * k, y = de[1] + (ate[1] - de[1]) * k + sobe * 4 * k * (1 - k); return [x, y, z]; };
  // ---------- HUD do Davi na luta: vida + MANA (pedido do autor: a mana desce a cada magia) ----------
  // mana: 0..1 agora; antes: valor antes da última magia (o pedaço gasto some devagar, em azul claro)
  function hudDavi(ctx, api, vida, mana, antes, o = {}) {
    Combate.hud(ctx, 40, 150, 'DAVI', 14, vida, vida, { max: 220, w: 300, corRetrato: '#2F4FA8', t: api.t, alfa: o.alfa });
    const x = 160, y = 270, w = 300, h = 22, a = o.alfa === undefined ? 1 : o.alfa; if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(12,16,34,0.78)'; ctx.beginPath(); ctx.roundRect(40, y - 18, 450, 58, 20); ctx.fill(); ctx.strokeStyle = 'rgba(120,190,255,0.55)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = '900 24px Inter'; ctx.fillStyle = '#8AD8FF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('MANA', 60, y + h / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
    if (antes !== undefined && antes > mana) { ctx.fillStyle = `rgba(200,240,255,${0.9 * (o.kGasto === undefined ? 1 : o.kGasto)})`; ctx.beginPath(); ctx.roundRect(x, y, w * cl(antes), h, h / 2); ctx.fill(); }
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#8AD8FF'); g.addColorStop(1, '#2A6FE0'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(h * 0.5, w * cl(mana)), h, h / 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 6, y + 3, Math.max(0, w * cl(mana) - 12), 4);
    ctx.font = '800 18px Inter'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(mana * 100)}/100`, x + w / 2, y + h / 2 + 1);
    if (o.custo && o.kCusto > 0 && o.kCusto < 1) { ctx.globalAlpha = a * Math.sin(Math.PI * o.kCusto); ctx.font = '900 34px Inter'; ctx.fillStyle = '#8AD8FF'; ctx.fillText('-' + o.custo + ' MANA', x + w * cl(mana) + 60, y - 18 - 30 * o.kCusto); }
    ctx.restore();
  }
  // mana ao longo da luta (100 → gelo 75 → relâmpago 65 → raízes 35 → meteoro 5)
  const MANA = { inicio: 1, gelo: 0.75, raio: 0.65, raizes: 0.35, meteoro: 0.05 };
  const gasta = (de, para, k) => de + (para - de) * cl(k);
  // ---------- cartaz de recompensa do Téo num visor ----------
  function cartazTeo(ctx, api, x, y, s, k) {
    if (k <= 0) return; zoomEm(ctx, x, y, k * s, () => {
      ctx.save(); ctx.fillStyle = 'rgba(40,8,12,0.94)'; ctx.strokeStyle = '#FF6A5A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(x - 300, y - 330, 600, 660, 36); ctx.fill(); ctx.stroke(); ctx.restore();
      api.texto('RECOMPENSA', x, y - 250, 62, { cor: '#FF8A7A' });
      ctx.save(); ctx.beginPath(); ctx.roundRect(x - 140, y - 200, 280, 280, 20); ctx.clip(); ctx.fillStyle = '#1A0A10'; ctx.fillRect(x - 140, y - 200, 280, 280); close(api, { ...TEOG, pose: 'parado', expressao: 'neutro' }, x, y - 40, 310, {}); ctx.restore();
      api.texto('R$ 5.000', x, y + 160, 86, { cor: '#FFE680' }); api.texto('HOMEM-FERA VIVO', x, y + 250, 46);
    });
  }
  // olho de frente em raio-X (pupila abrindo)
  function olhoFrente(ctx, cx, cy, R, pupila, t) {
    ctx.save(); ctx.lineWidth = 8; ctx.strokeStyle = '#7FE6FF'; ctx.fillStyle = 'rgba(120,230,255,0.10)';
    ctx.beginPath(); ctx.moveTo(cx - R * 1.6, cy); ctx.quadraticCurveTo(cx, cy - R * 1.25, cx + R * 1.6, cy); ctx.quadraticCurveTo(cx, cy + R * 1.25, cx - R * 1.6, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
    const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 0.8); g.addColorStop(0, '#9A6A3A'); g.addColorStop(1, '#4A2A14'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3); ctx.lineTo(cx + Math.cos(a) * R * 0.76, cy + Math.sin(a) * R * 0.76); ctx.stroke(); }
    ctx.fillStyle = '#050208'; ctx.beginPath(); ctx.arc(cx, cy, R * (0.16 + 0.5 * pupila), 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(cx - R * 0.25, cy - R * 0.25, R * 0.1, R * 0.06, -0.5, 0, TAU); ctx.fill();
    // setas mostrando a pupila abrindo
    if (pupila > 0.1) { ctx.strokeStyle = '#FFE680'; ctx.fillStyle = '#FFE680'; ctx.lineWidth = 6; for (const sd of [-1, 1]) { const x0 = cx + sd * R * (0.2 + 0.5 * pupila), x1 = x0 + sd * 70; ctx.beginPath(); ctx.moveTo(x0 + sd * 10, cy); ctx.lineTo(x1, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1 + sd * 18, cy); ctx.lineTo(x1, cy - 14); ctx.lineTo(x1, cy + 14); ctx.closePath(); ctx.fill(); } }
    ctx.restore();
  }
  // retina: cones (coloridos) apagando, bastonetes (cinza) acendendo
  function retina(ctx, x0, y0, w, cones, bast, t) {
    ctx.save(); const n = 14, dx = w / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + dx * (i + 0.5), cone = i % 3 === 1;
      if (cone) { const cor = ['#FF5A5A', '#5AE06A', '#5A8AFF'][Math.floor(i / 3) % 3]; ctx.globalAlpha = 0.25 + 0.75 * cones; ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(x - dx * 0.3, y0 + 220); ctx.lineTo(x, y0 + 60); ctx.lineTo(x + dx * 0.3, y0 + 220); ctx.closePath(); ctx.fill(); if (cones > 0.4) Valdor.brilhoRadial(ctx, x, y0 + 140, 60, '255,240,200', 0.4 * cones); }
      else { ctx.globalAlpha = 1; ctx.fillStyle = `rgba(200,210,230,${0.25 + 0.75 * bast})`; ctx.beginPath(); ctx.roundRect(x - dx * 0.22, y0 + 20, dx * 0.44, 200, dx * 0.2); ctx.fill(); if (bast > 0.3) Valdor.brilhoRadial(ctx, x, y0 + 100, 70, '200,220,255', 0.45 * bast * (0.8 + 0.2 * Math.sin(t * 4 + i))); }
    }
    ctx.globalAlpha = 1; ctx.font = '800 38px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFB0A0'; ctx.fillText('CONES (COR)', x0 + w * 0.27, y0 + 290); ctx.fillStyle = '#D0DCF0'; ctx.fillText('BASTONETES (ESCURO)', x0 + w * 0.72, y0 + 290);
    ctx.restore();
  }
  // corrente de prata em tela (do ponto A ao B), com elos, avançando até k
  function correnteTela(ctx, A, B, k, t, curva = 120) {
    if (k <= 0) return; const n = 34; ctx.save();
    for (let i = 0; i < n * k; i++) { const s = i / n, x = A[0] + (B[0] - A[0]) * s + Math.sin(s * Math.PI) * curva * 0.3, y = A[1] + (B[1] - A[1]) * s - Math.sin(s * Math.PI) * curva + Math.sin(t * 8 + i) * 3; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(B[1] - A[1], B[0] - A[0]) + (i % 2 ? Math.PI / 2 : 0)); ctx.strokeStyle = '#E8F0FF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    Valdor.brilhoRadial(ctx, A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, 120, '200,230,255', 0.5); ctx.restore();
  }
  const H5 = [[2.2, 6.8, 0], [-2.3, 6.3, 1], [2.5, 3.8, 3], [-1.6, 8.4, 2]];   // caçadores em volta: [x, z, variante]
  const POSE_RAPEL = { braco_d: 165, antebraco_d: -10, braco_e: -165, antebraco_e: 10, coxa_d: -30, canela_d: 40, coxa_e: -20, canela_e: 30, tronco: -10 };
  window.PLANOS = {
    // 1) gancho: "Cinco mil reais pelo Téo. Vivo." — o cartaz aparecendo no visor de vários jogadores
    capa(ctx, u, d, api) {
      const cam = camCan(api, { x: 0, y: 1.6, z: 0, cy: 900, mov: false });
      nt(ctx, api, cam, [], { noite: 0.35, desfoque: 12, forca: 0 });
      ctx.fillStyle = 'rgba(20,6,10,0.45)'; ctx.fillRect(0, 0, W, H);
      cartazTeo(ctx, api, 250, 1480, 0.5, api.fase(0.6, 0.85, 'volta')); cartazTeo(ctx, api, 830, 1480, 0.5, api.fase(0.85, 1.1, 'volta')); cartazTeo(ctx, api, 540, 920, 0.82, api.fase(0.05, 0.35, 'volta'));
      const k = api.fase(0, 0.3, 'volta'); zoomEm(ctx, 540, 300, k, () => { api.texto('5 MIL', 540, 240, 120, { cor: AMARELO }); api.texto('PELO TÉO VIVO', 540, 360, 84); });
    },
    // 10) "Só que o Davi não enxergava quase nada." — quase tudo preto, só os olhos amarelos da fera
    escuro(ctx, u, d, api) {
      ctx.fillStyle = '#020104'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0.3, 1.2); ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 18; i++) { const x = 60 + ((i * 173) % 960), y = 120 + ((i * 97) % 260); Valdor.brilhoRadial(ctx, x, y, 40 + (i % 3) * 15, '255,170,80', 0.25 + 0.1 * Math.sin(api.t * 6 + i)); }
      ctx.restore(); Noite.olhos(ctx, [[490, 900], [590, 900]], 12, k, api.t);
      api.texto('?', 540, 1300, 120, { cor: 'rgba(255,255,255,0.25)' });
    },
    // 11) "Quando a luz some, o olho precisa trocar de turno." — raio-X do olho, a pupila abre
    turno(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t); olhoFrente(ctx, 540, 900, 300, api.fase(0.3, 1.8), api.t);
      Valdor.etiqueta(ctx, 540, 1400, 'A PUPILA ABRE', '#FFE680', api.fase(1.0, 1.4, 'volta'), { tam: 58 });
      api.texto('TROCA DE TURNO', 540, 380, 84, { cor: '#7FE6FF' });
    },
    // 12) "Os bastonetes enxergam no escuro..." — retina e o mundo voltando em cinza
    bastonetes(ctx, u, d, api) {
      const r = u / d;
      if (r < 0.55) { Valdor.raioFundo(ctx, api.t); api.texto('DENTRO DO OLHO', 540, 330, 76, { cor: '#7FE6FF' }); retina(ctx, 90, 700, 900, 1 - api.fase(0.4, 1.6), api.fase(1.0, 3.0), api.t); api.texto('~20 MINUTOS', 540, 1300, 70, { cor: '#FFE680' }); }
      else {
        const L = api.camada(), cam = camCan(api, { x: 0, y: 1.6, z: 0.4, cy: 900, f: 1000, mov: false });
        nt(L.getContext('2d'), api, cam, [{ f: () => api.personagem3d(cam, { ...LOBO, pose: 'garras', expressao: 'raiva' }, PF5[0], PF5[1] + 1.2, 2.55, { y: -0.12, olhaPara: [0, 0], luz: LUA5 }) }], { forca: 0 });
        const k = api.fase(d * 0.55, d * 0.75); ctx.filter = `grayscale(1) brightness(${0.25 + 0.6 * k}) contrast(1.15)`; ctx.drawImage(L, 0, 0); ctx.filter = 'none';
        Valdor.etiqueta(ctx, 540, 1500, 'NO ESCURO, O OLHO VÊ SEM COR', '#FFFFFF', api.fase(d * 0.62, d * 0.75, 'volta'), { tam: 46 });
      }
    },
    // 13) "Já o olho de uma fera tem um espelho no fundo..." — o tapetum, a luz passa duas vezes
    espelho(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t); olhoCorte(ctx, 600, 860, 260, api.fase(0.3, 3.0), api.t);
      Valdor.etiqueta(ctx, 540, 1400, 'ESPELHO NO FUNDO DO OLHO', '#FFE680', api.fase(1.6, 2.0, 'volta'), { tam: 50 });
      api.texto('A LUZ PASSA 2x', 540, 380, 84, { cor: '#7FE6FF' });
    },
    // 19) "Os jogadores desceram pelas cordas, com redes de prata." — câmera baixa olhando a parede, eles descendo de rapel
    desceram(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 0.8, y: 1.2, z: 1.0, cy: 1500, f: 900, yaw: 0.35, mov: { orbita: 0.06, empurra: 0, sobe: 0, dist: 5 } });
      const lista = [[3.6, 6.5, 0, 0], [4.2, 9.5, 1, 0.15], [2.9, 4.6, 3, 0.3]];
      nt(ctx, api, cam, lista.map(([x, z, v, at]) => ({ f: () => api.personagem3d(cam, { ...CAC(v), pose: POSE_RAPEL, expressao: 'raiva' }, x, z, 1.78, { y: Math.max(0.2, 7.5 - 6.5 * cl((r - at) / 0.85)), olhaPara: [0, 4], luz: LUA5, parado: true }) })), {
        forca: 0, bokeh: 0, borda: { n: 1, desce: 0.3 + r * 0.6 },
        depois: () => lista.forEach(([x, z, v, at]) => { const y = Math.max(0.2, 7.5 - 6.5 * cl((r - at) / 0.85)), a = cam.p(x, 30, z), b = cam.p(x, y + 1.95, z); ctx.save(); ctx.strokeStyle = '#C8A46A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore(); }),
      });
      Valdor.etiqueta(ctx, 540, 1650, 'PRATA · DANO DOBRADO EM FERAS', '#E8F0FF', api.fase(d * 0.45, d * 0.6, 'volta'), { tam: 44 });
    },
    // 21) "Ninguém encosta nele." — o Davi de frente, com raiva; atrás, o gelo e a rede congelada
    ninguem(ctx, u, d, api) {
      const cam = camCan(api, { x: PD5[0] + 0.5, y: 1.6, z: PD5[1] - 1.6, cy: 840, f: 1350, yaw: -0.2, mov: { orbita: -0.05, empurra: 0.08, sobe: 0, dist: 2 } });
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 30, antebraco_d: -30, braco_e: -30, antebraco_e: 30 }, expressao: 'raiva', voz: 'davi' }, PD5[0], PD5[1], 1.76, { olhaPara: [PD5[0] + 0.4, PD5[1] - 2], luz: LUA5 }) }], {
        luzes: [{ x: 1.15, y: 1.2, z: 6.5, cor: '#9FE0FF', forca: 1.2, raio: 7 }],
        fx3d: () => [{ tipo: 'gelo', x: 1.15, z: 6.5, larg: 2.4, alt: 2.4, k: 1, rumo: -0.3 }, { tipo: 'rede', x: 1.2, y: 1.7, z: 6.62, dx: 0.32, dy: 0, dz: -1, abre: 1, gira: 12, R: 1.3, congela: 1, tCongela: 1 }] });
      hudDavi(ctx, api, 0.92, MANA.gelo);
    },
    // 22a) o cerco: câmera alta girando, a fera e o Davi no meio, os caçadores fechando o círculo com as tochas
    cerco(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [0.1, 0.8, 4.9], raio: 6.2, ang: chave(u, [[0, -0.5], [d, 0.3]]), altura: 5.2, f: 950, ySalvo: 1100, nevoa: V().nevoa(1, false, 'canion') });
      const rigs = [];
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'garras', expressao: 'rugido' }, PF5[0], PF5[1], 2.55, { y: -0.12, olhaPara: [H5[0][0], H5[0][1]], luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 30, antebraco_d: -30, braco_e: -30, antebraco_e: 30 }, expressao: 'determinado' }, PD5[0], PD5[1], 1.76, { olhaPara: [H5[1][0], H5[1][1]], luz: LUA5 }) },
        ...H5.map(([x, z, v], i) => ({ f: () => (rigs[i] = api.personagem3d(cam, { ...CAC(v), pose: POSE_TOCHA, expressao: 'raiva' }, x * (1 - 0.12 * u / d), z, 1.78, { olhaPara: PF5, luz: LUA5 })) })),
      ], { forca: 0, bokeh: 0, depois: () => { rigs.forEach((rg, i) => tochaNaMao(ctx, rg, api.t, i + 2, 0.55)); const q = cam.p(PF5[0], 2.9, PF5[1]); etiqueta(ctx, q.x, q.y, 'R$ 5.000', api.fase(0.3, 0.6, 'volta')); } });
      hudDavi(ctx, api, 0.92, MANA.gelo);
    },
    // 22b) a fera pula em cima de dois caçadores; uma rede de prata pega no braço dela (fumaça, -90)
    fera_ataca(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 3.4, y: 1.4, z: 2.6, cy: 900, f: 950, yaw: -0.55, mov: { orbita: 0.1, empurra: 0.06, sobe: 0, dist: 4 } });
      const sal = cl((r - 0.08) / 0.32), A = [PF5[0], PF5[1]], B = [H5[0][0] - 0.5, H5[0][1] - 0.4], fx = mix(A[0], B[0], sal), fz = mix(A[1], B[1], sal), hit = r > 0.4, kh = (r - 0.4) * d, voa = cl(kh / 0.5);
      const redeK = cl((r - 0.62) / 0.18);
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...CAC(0, null), pose: hit ? { tronco: -50, braco_d: 120, braco_e: -120, coxa_d: -30, coxa_e: 30 } : POSE_TOCHA, expressao: hit ? 'medo' : 'raiva' }, H5[0][0] + 0.6 * voa, H5[0][1] + 0.8 * voa, 1.78, { y: Math.sin(voa * Math.PI) * 0.6, olhaPara: PF5, luz: LUA5, parado: true }) },
        { f: () => api.personagem3d(cam, { ...CAC(1, null), pose: hit ? { tronco: 45, braco_d: -120, braco_e: 120, coxa_d: 30, coxa_e: -30 } : POSE_TOCHA, expressao: hit ? 'medo' : 'raiva' }, H5[0][0] - 1.2 - 0.6 * voa, H5[0][1] + 0.6 + 0.5 * voa, 1.78, { y: Math.sin(voa * Math.PI) * 0.5, olhaPara: PF5, luz: LUA5, parado: true }) },
        { f: () => api.personagem3d(cam, { ...LOBO, vista: sal > 0 && sal < 1 ? 'perfil' : undefined, pose: sal > 0 && sal < 1 ? 'bote' : redeK > 0 ? 'rugindo' : 'garras', expressao: 'rugido' }, fx, fz, 2.55, { y: -0.12 + Math.sin(sal * Math.PI) * 1.1, olhaPara: B, luz: LUA5 }) },
      ], {
        forca: 0.2, bokeh: 2,
        fx3d: () => (redeK > 0 ? [{ tipo: 'rede', x: B[0] - 0.4 + (1 - redeK) * 2.5, y: 1.6, z: B[1] - 0.1 - (1 - redeK) * 2, dx: 1, dy: 0, dz: 0.6, abre: 0.5 + 0.3 * redeK, gira: api.t * 8, R: 0.9 }] : []),
        depois: () => { const q = cam.p(B[0] + 0.3, 2.4, B[1] + 0.5); if (hit) { Combate.numero(ctx, q.x - 80, q.y - 120, '-140', kh); Combate.numero(ctx, q.x + 120, q.y - 60, '-140', kh - 0.1); }
          if (redeK >= 1) { const f = cam.p(B[0], 1.7, B[1]); Noite.fumaca(ctx, f.x, f.y, 0.6 * f.s, cl((r - 0.8) / 0.2), { seed: 4, cor: '230,235,250', n: 14, largura: 1.2 }); Combate.numero(ctx, f.x, f.y - 200, '-90', (r - 0.8) * d, 'recebido'); } },
      });
      hudDavi(ctx, api, 0.92, MANA.gelo);
    },
    // 22c) o Davi: passo-relâmpago (some num raio e aparece do lado do caçador) e corta com a Lâmina Rubra
    davi_corta(ctx, u, d, api) {
      const r = u / d, salta = 0.25, X0 = PD5, X1 = [H5[1][0] + 0.7, H5[1][1] - 0.5], aqui = r < salta ? X0 : X1, corta = cl((r - 0.35) / 0.2), hit = r > 0.45, kh = (r - 0.45) * d;
      const cam = camCan(api, { x: -0.4, y: 1.5, z: 1.8, cy: 900, f: 950, yaw: -0.35, mov: { orbita: -0.08, empurra: 0.06, sobe: 0, dist: 4 } });
      espada(api, mix(-2.2, 1.2, corta), 1.4);
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...CAC(1, null), pose: hit ? { tronco: -35, braco_d: 100, braco_e: -100, coxa_d: -20, coxa_e: 20 } : POSE_TOCHA, expressao: hit ? 'medo' : 'raiva' }, H5[1][0], H5[1][1], 1.78, { olhaPara: X1, luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...DAVIE, pose: { ...poseChave(corta, [[0, { braco_d: -150, tronco: 10 }], [1, { braco_d: 70, tronco: -14 }, 'golpe']]), antebraco_d: -15, coxa_d: 25, canela_d: -20, coxa_e: -20, canela_e: 20, _maos: { d: 'punho' }, _plantar: true }, expressao: 'determinado' }, aqui[0], aqui[1], 1.76, { olhaPara: [H5[1][0], H5[1][1]], luz: LUA5 }), alfa: r > salta - 0.06 && r < salta + 0.04 ? 0 : 1 },
      ], {
        forca: 0.2, luzes: [{ x: aqui[0], y: 1.3, z: aqui[1], cor: '#7AB8FF', forca: r < salta + 0.1 ? 0.9 : 0.5, raio: 5 }],
        depois: ([rc, rd]) => {
          for (const [P, k] of [[X0, cl((r - salta + 0.08) / 0.1)], [X1, cl((r - salta) / 0.1)]]) if (k > 0 && k < 1) { const q = cam.p(P[0], 1, P[1]); Valdor.brilhoRadial(ctx, q.x, q.y, 260 * (1 - k * 0.5), '140,200,255', 0.8 * (1 - k)); Noite.clarao(ctx, q.x, q.y, (1 - k) * 0.22); }
          if (rd && rd.pontoMundo && corta > 0) { const m = rd.pontoMundo('antebraco_d', [0, 1]); Combate.corte(ctx, m.x + 40, m.y + 30, 300, -0.5, -3.9, corta * 1.3, { rgb: '255,70,60', espessura: 0.2 }); }
          if (hit && rc && rc.pontoMundo) { const b = rc.pontoMundo('tronco', [0, -0.3]); Combate.impacto(ctx, b.x, b.y, 240, kh, { rgb: '255,90,80', dura: 0.5 }); Combate.numero(ctx, b.x, b.y - 240, '-160', kh); const dv = cam.p(aqui[0], 2.2, aqui[1]); Combate.numero(ctx, dv.x - 60, dv.y - 60, '+40', kh - 0.2, 'cura'); }
        },
      });
      hudDavi(ctx, api, Math.min(1, 0.92 + (hit ? 0.08 * cl(kh / 0.4) : 0)), gasta(MANA.gelo, MANA.raio, (r - 0.15) / 0.2), MANA.gelo, { custo: 10, kCusto: cl((r - 0.15) / 0.5) });
    },
    // 22d) um caçador mira a besta nas costas do Davi; câmera lenta: a fera salta na frente e o virote crava nela (-200)
    besta(ctx, u, d, api) {
      const r = u / d, HB = [H5[3][0] + 0.4, H5[3][1] - 0.8], DV = [PD5[0] + 0.3, PD5[1] + 1.2];
      const cam = camCan(api, { x: DV[0] + 0.9, y: 1.55, z: DV[1] - 1.6, cy: 880, f: 1000, yaw: -0.15, mov: { orbita: 0.05, empurra: 0.08, sobe: 0, dist: 4 } });
      const voo = cl((r - 0.3) / 0.35), lento = voo * (0.5 + 0.5 * voo), pulo = cl((r - 0.35) / 0.25), hit = r > 0.62, kh = (r - 0.62) * d;
      const FB = [mix(DV[0] + 1.6, (DV[0] + HB[0]) / 2 + 0.2, pulo), mix(DV[1] + 0.4, (DV[1] + HB[1]) / 2, pulo)];
      const P0 = [HB[0], 1.6, HB[1]], P1 = [FB[0], 1.9, FB[1]], P = [mix(P0[0], P1[0], lento), mix(P0[1], P1[1], lento), mix(P0[2], P1[2], lento)];
      window.ARMA_ANG = { besta: -90 };
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...CAC(2, 'besta'), pose: { braco_d: -70, antebraco_d: -10, braco_e: -60, antebraco_e: -40 }, expressao: 'raiva' }, HB[0], HB[1], 1.8, { olhaPara: DV, luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: r > 0.75 ? { braco_d: 20, braco_e: -20 } : 'parado', expressao: r > 0.75 ? 'espanto' : 'determinado' }, DV[0], DV[1], 1.76, { olhaPara: r > 0.75 ? FB : [DV[0] - 2, DV[1] - 1], luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...LOBO, vista: pulo > 0 && pulo < 1 ? 'perfil' : undefined, pose: pulo > 0 && pulo < 1 ? 'bote' : hit ? 'rugindo' : 'garras', expressao: 'rugido' }, FB[0], FB[1], 2.55, { y: -0.12 + Math.sin(pulo * Math.PI) * 0.7, olhaPara: HB, luz: LUA5 }) },
      ], {
        forca: 0.2, bokeh: 2,
        fx3d: () => (r > 0.3 && !hit ? [{ tipo: 'flecha', x: P[0], y: P[1], z: P[2], dx: P1[0] - P0[0], dy: P1[1] - P0[1], dz: P1[2] - P0[2], s: 1.6, rastro: 0.8, brilho: 0.8 }] : []),
        depois: () => { if (hit) { const q = cam.p(FB[0], 2.0, FB[1]); Combate.impacto(ctx, q.x, q.y, 260, kh, { rgb: '220,230,255', dura: 0.5 }); Combate.numero(ctx, q.x, q.y - 250, '-200', kh, 'recebido'); flash(ctx, kh, 0.5); } },
      });
      if (r > 0.3 && r < 0.62) { ctx.save(); ctx.fillStyle = 'rgba(10,20,40,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      hudDavi(ctx, api, 1, MANA.raio);
    },
    // 22e) "Raízes Anciãs." — o Davi bate as mãos no chão: raízes prendem os caçadores de uma vez
    raizes5(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 0.2, y: 2.6, z: -0.6, cy: 1000, f: 900, mov: { orbita: 0.1, empurra: 0.05, sobe: 0, dist: 6 } });
      const presos = H5.slice(0, 4);
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { tronco: 25, braco_d: 20, antebraco_d: -20, braco_e: -20, antebraco_e: 20, coxa_d: -40, canela_d: 70, coxa_e: 30, canela_e: 30, _plantar: true }, expressao: 'determinado' }, PD5[0], PD5[1], 1.76, { olhaPara: [0, 7], luz: LUA5 }) },
        ...presos.map(([x, z, v]) => ({ f: () => api.personagem3d(cam, { ...CAC(v), pose: { braco_d: -30 - 20 * Math.sin(api.t * 6 + x), antebraco_d: -20, braco_e: 30, antebraco_e: -30, tronco: 6 * Math.sin(api.t * 7 + z) }, expressao: 'medo' }, x, z, 1.78, { olhaPara: PD5, luz: LUA5 }) })),
      ], { forca: 0.2, luzes: [{ x: 0, y: 0.5, z: 6, cor: '#7AF07A', forca: 1.2, raio: 9 }], fx3d: () => presos.map(([x, z], i) => ({ tipo: 'raizes', x, z, raio: 0.45, alt: 1.9, k: api.fase(0.05 + i * 0.08, 0.9 + i * 0.08) })),
        chaoEm: PD5, chao: () => { const q = cam.p(PD5[0], 0.02, PD5[1]); Valdor.brilhoRadial(ctx, q.x, q.y, 220, VERDE, 0.7); } });
      const k = api.fase(0, 0.25, 'volta'); zoomEm(ctx, 540, 380, k, () => api.texto('RAÍZES ANCIÃS', 540, 380, 80, { cor: '#8AF08A' }));
      hudDavi(ctx, api, 1, gasta(MANA.raio, MANA.raizes, r / 0.3), MANA.raio, { custo: 30, kCusto: cl(r / 0.6) });
    },
    // 22f) "Meteoro." — cai no meio deles: CRÍTICO -400, e um por um vira pixel e sai do jogo
    meteoro5(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 0.2, y: 1.2, z: -0.8, cy: 1150, f: 850, mov: false });
      const cai = Math.min(1, u / (d * 0.4)), kb = u - d * 0.4, A0 = [-8, 36, 22], B0 = [0.3, 1.0, 6.6], mp = [mix(A0[0], B0[0], cai * cai), mix(A0[1], B0[1], cai * cai), mix(A0[2], B0[2], cai * cai)];
      const kd = (i) => cl((kb - 0.5 - i * 0.18) / 0.5);
      nt(ctx, api, cam, H5.map(([x, z, v], i) => ({ f: () => api.personagem3d(cam, { ...CAC(v), pose: kb > 0 ? { tronco: 20, cabeca: 25, braco_d: 8, braco_e: -8, coxa_d: -18, canela_d: 26, coxa_e: 12, canela_e: 18, _plantar: true } : { braco_d: -30, antebraco_d: -20, tronco: 8 }, expressao: kb > 0 ? 'medo' : 'espanto' }, x, z, 1.78, { olhaPara: [0, 2], luz: LUA5 }), alfa: Math.max(0, 1 - kd(i) * 1.6), cor: kd(i) > 0 ? `rgba(170,235,255,${Math.min(0.85, kd(i) * 2.5)})` : undefined })), {
        forca: 0.2,
        luzes: [{ x: kb > 0 ? B0[0] : mp[0], y: kb > 0 ? 1.5 : mp[1], z: kb > 0 ? B0[2] : mp[2], cor: '#FF8A30', forca: kb > 0 ? 4 * Math.max(0, 1 - kb) : 2.5, raio: kb > 0 ? 18 : 22 }],
        fx3d: () => [kb < 0 ? { tipo: 'meteoro', x: mp[0], y: mp[1], z: mp[2], dx: B0[0] - A0[0], dy: B0[1] - A0[1], dz: B0[2] - A0[2], s: 1.2 } : null, kb >= 0 && kb < 1.4 ? { tipo: 'explosao', x: B0[0], z: B0[2], k: kb * 1.0, s: 1.4 } : null, ...H5.map(([x, z], i) => (kd(i) > 0 ? { tipo: 'pixels', x, z, alt: 1.78, k: kd(i), cor: '#A8ECFF' } : null))],
        depois: () => { const alvo = cam.p(B0[0], 1.3, B0[2]); if (kb >= 0) { Combate.numero(ctx, alvo.x, alvo.y - 360, '-400', kb, 'critico'); flash(ctx, kb); }
          H5.forEach(([x, z], i) => { const q = cam.p(x, 2.2, z), kt = api.ease.suave(cl((kd(i) - 0.1) / 0.3)) * (1 - cl((kd(i) - 0.8) / 0.2)); if (kt > 0) etiquetaSaiu(ctx, q.x, q.y - 40, kt); }); },
      });
      ctx.save(); ctx.fillStyle = `rgba(255,120,40,${0.12 * cai * (kb < 0 ? 1 : Math.max(0, 1 - kb))})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      hudDavi(ctx, api, 1, gasta(MANA.raizes, MANA.meteoro, r / 0.2), MANA.raizes, { custo: 30, kCusto: cl(r / 0.5) });
    },
    // 23) o loot: redes, besta, moedas · o aluguel passa da metade pela primeira vez
    loot5(ctx, u, d, api) {
      const cam = camCan(api, { x: 0.2, y: 1.6, z: 0.6, cy: 900, f: 1000, mov: false });
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'feliz' }, PD5[0], PD5[1] + 0.5, 1.76, { olhaPara: [0, 0], luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'parado', expressao: 'raiva' }, PF5[0], PF5[1], 2.55, { y: -0.12, olhaPara: [0, 0], luz: LUA5 }) },
      ], { forca: 0.2, desfoque: 5 });
      const L = [{ nome: 'Redes de prata', rar: 'comum', preco: 'R$ 18,00', icone: 'rede' }, { nome: 'Besta de prata', rar: 'raro', preco: 'R$ 54,00', icone: 'besta' }, { nome: 'Moedas', rar: 'comum', preco: 'R$ 36,40', icone: 'moedas' }];
      L.forEach((it, i) => { const k = api.fase(0.1 + i * 0.25, 0.6 + i * 0.25, 'volta'); carta3(ctx, 220 + i * 320, 900, 290, it, k, api.t); });
      const v = mix(499.38, 607.78, api.fase(1.6, 2.6)); Combate.aluguel(ctx, v / 1200, reaisTxt(v), { dias: '27 DIAS', y: 150 });
      const km = api.fase(2.6, 2.9, 'volta'); zoomEm(ctx, 540, 1400, km, () => api.texto('METADE DO ALUGUEL!', 540, 1400, 74, { cor: AMARELO }));
    },
    // 24) "Viu? Eu não corri." — os dois lado a lado, a fera encosta a cabeça no ombro dele
    viu(ctx, u, d, api) {
      const cam = camCan(api, { x: PD5[0] + 0.55, y: 1.6, z: PD5[1] - 3.2, cy: 900, f: 1250, mov: { orbita: 0.05, empurra: 0.08, sobe: 0, dist: 3.2 } });
      const encosta = api.fase(1.0, 1.8);
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 8, antebraco_d: -10, braco_e: -8, antebraco_e: 10, cabeca: -6 }, expressao: expr('feliz', { olhar: [0.01, 0] }), voz: 'davi' }, PD5[0] + 0.15, PD5[1], 1.76, { olhaPara: [PD5[0] + 2.2, PD5[1] - 3], luz: LUA5 }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { ...window.TEO_LOBISOMEM_POSES.parado.angulos, cabeca: -16 * encosta, tronco: -4 * encosta }, expressao: 'raiva' }, PD5[0] + 1.0, PD5[1] + 0.25, 2.55, { y: -0.12, olhaPara: [PD5[0] - 1.4, PD5[1] - 3], luz: LUA5 }) },
      ], { forca: 0.2 });
    },
    // 25) "Mas o encapuzado ainda estava lá em cima." — a câmera sobe até a ponte
    encapuzado(ctx, u, d, api) {
      const r = u / d, P0 = V().CAN_PONTE, x = 0.6, y0 = P0.y - 2.2 * Math.sin(Math.PI * 0.52) + 0.05;
      const cam = camCan(api, { x: 0.3, y: mix(1.6, 12, api.ease.suave(r)), z: P0.z - 6.5, cy: mix(900, 2250, api.ease.suave(r)), f: 1250, mov: false });
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...ENC, pose: { braco_d: mix(-100, 10, cl((r - 0.5) / 0.4)), antebraco_d: mix(-40, -10, cl((r - 0.5) / 0.4)) } }, x, P0.z, 1.85, { y: y0, rumo: 0, luz: LUA5 }) }], { forca: 0, bokeh: 3 });
    },
    // 26) o capuz cai: é o líder dos ladrões (NV 41) — "Você ficou com a minha espada. Agora eu fico com o seu amigo."
    lider_fala(ctx, u, d, api) {
      const P0 = V().CAN_PONTE, x = 0.6, y0 = P0.y - 2.2 * Math.sin(Math.PI * 0.52) + 0.05, tira = api.fase(0.2, 0.7);
      const cam = camCan(api, { x: 1.4, y: y0 + 1.5, z: P0.z - 3.6, cy: 900, f: 1350, yaw: -0.2, mov: { orbita: 0.06, empurra: 0.08, sobe: 0, dist: 3.4 } });
      window.CORRENTE = { t: api.t };
      let rl; nt(ctx, api, cam, [{ f: () => (rl = api.personagem3d(cam, tira < 1 ? { ...ENC, pose: { braco_d: 150, antebraco_d: -30, braco_e: -150, antebraco_e: 30 } } : { ...LIDER5, pose: { braco_e: -14, antebraco_e: -40 }, expressao: 'raiva', voz: 'lider' }, x, P0.z, 1.85, { y: y0, olhaPara: [x, P0.z - 6], luz: LUA5 })) }], {
        forca: 0, bokeh: 4, depois: () => { if (tira >= 1 && rl && rl.pontoMundo) { const q = rl.pontoMundo('cabeca', [0, -1.3]); placaNivel(ctx, q.x, q.y, 'LÍDER · NV 41', '#FF5A4A', api.fase(0.8, 1.1, 'volta')); } if (tira > 0 && tira < 1) Noite.clarao(ctx, 540, 700, 0.4 * Math.sin(Math.PI * tira)); },
      });
    },
    // 27) ele joga a corrente de prata lá de cima: enrola na fera, que some num clarão roxo junto com ele
    corrente5(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 0.2, y: 1.2, z: 0.4, cy: 1250, f: 900, mov: false });
      const voa = cl(r / 0.4), some = cl((r - 0.62) / 0.15);
      let rf; nt(ctx, api, cam, [{ f: () => (rf = api.personagem3d(cam, { ...LOBO, pose: voa >= 1 ? 'rugindo' : 'garras', expressao: 'rugido' }, PF5[0], PF5[1] + 0.6, 2.55, { y: -0.12, olhaPara: [0, 0], luz: LUA5 })), alfa: 1 - some }], {
        forca: 0.2, depois: () => {
          const top = cam.p(0.6, 21, 36), f = cam.p(PF5[0], 1.6, PF5[1] + 0.6); correnteTela(ctx, [top.x, top.y], [f.x, f.y], voa * (1 - some), api.t, 200);
          if (voa >= 1 && some < 1) { ctx.save(); ctx.globalAlpha = 1 - some; ctx.strokeStyle = '#E8F0FF'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(f.x, f.y - 60 + i * 70, 0.55 * f.s, 0.16 * f.s, 0.1 * Math.sin(api.t * 6 + i), 0, TAU); ctx.stroke(); } ctx.restore(); Noite.fumaca(ctx, f.x, f.y, 0.7 * f.s, cl((r - 0.4) / 0.3), { seed: 3, cor: '230,235,250', n: 12, largura: 1 }); }
          if (some > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; Valdor.brilhoRadial(ctx, f.x, f.y - 100, 700 * (0.5 + some), '155,92,255', 1 - Math.abs(some - 0.4)); ctx.restore(); }
        },
      });
    },
    // 28) o Davi sozinho; a corrente vazia no chão; o visor: TÉO · LOCALIZAÇÃO DESCONHECIDA e o relógio
    sozinho(ctx, u, d, api) {
      const cam = camCan(api, { x: PD5[0] + 0.3, y: 2.2, z: PD5[1] - 2.6, cy: 1000, f: 1100, mov: { orbita: 0.06, empurra: 0, sobe: 0.2, dist: 2.6 } });
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 8, antebraco_d: -10, braco_e: -8, antebraco_e: 10, cabeca: 10 }, expressao: expr('medo', { olhar: [0, 0.01] }) }, PD5[0], PD5[1], 1.76, { olhaPara: [PF5[0], PF5[1] + 0.6], luz: LUA5 }) }], { forca: 0.3 });
      const k = api.fase(0.5, 0.9, 'volta'); zoomEm(ctx, 540, 1350, k, () => { ctx.save(); ctx.fillStyle = 'rgba(30,6,10,0.9)'; ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(110, 1260, 860, 180, 26); ctx.fill(); ctx.stroke(); ctx.restore(); api.texto('TÉO', 540, 1320, 54, { cor: '#FF8A7A' }); api.texto('LOCALIZAÇÃO DESCONHECIDA', 540, 1395, 44); });
      relogio(ctx, 540, 330, '22:58:' + String(13 - Math.floor(u) % 60).padStart(2, '0'), api.fase(1.4, 1.8), 60);
    },
    // 29) cartela
    parte(ctx, u, d, api) {
      const cam = camCan(api, { x: 0, y: 1.6, z: 0, mov: false });
      nt(ctx, api, cam, [], { desfoque: 14, forca: 0 });
      ctx.fillStyle = 'rgba(20,8,30,0.5)'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0, 0.35, 'volta'); zoomEm(ctx, 540, 760, k, () => { api.texto('PARTE', 540, 680, 120); api.texto('5', 540, 850, 230, { cor: AMARELO }); });
      const k2 = api.fase(0.4, 0.75, 'volta'); zoomEm(ctx, 540, 1130, k2, () => { api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 6', 540, 1190, 96, { cor: AMARELO }); });
    },
    // o caçador gira a rede de prata em cima da cabeça (tocha na outra mão)
    rede_gira(ctx, u, d, api) {
      const cam = camCan(api, { x: PC5[0] - 1.6, y: 1.2, z: PC5[1] - 3.2, cy: 1050, f: 1250, yaw: 0.45, mov: { orbita: 0.1, empurra: 0.08, sobe: 0.1, dist: 3.4 } });
      let rig;
      nt(ctx, api, cam, [{ f: () => (rig = api.personagem3d(cam, { ...CAC(0, null), pose: POSE_GIRA(api.t), expressao: 'raiva' }, PC5[0], PC5[1], 1.78, { olhaPara: PF5, luz: LUA5, parado: true })) }], {
        forca: 0.2, bokeh: 3,
        fx3d: () => { const m = maoMundo(cam, rig, 'mao_d', PC5[0], PC5[1]); if (!m) return []; return [{ tipo: 'rede', x: m.x, y: m.y + 0.15, z: m.z, dx: 0, dy: 1, dz: 0.001, abre: 0.42, gira: api.t * 11, R: 1.2 }]; },
        depois: () => tochaNaMao(ctx, rig, api.t, 1, 0.55),
      });
    },
    // câmera lenta: ele solta, a rede abre no ar girando e voa para a fera (a corda ainda presa na mão dele)
    rede_voa(ctx, u, d, api) {
      const r = u / d, solta = 0.3, cam = camCan(api, { x: 3.7, y: 1.5, z: 1.6, cy: 900, f: 900, yaw: -0.42, mov: { orbita: 0.1, empurra: 0.05, sobe: 0, dist: 5 } });
      let rig; const k = cl((r - solta) / (1 - solta)), lento = k * (0.6 + 0.4 * k);
      nt(ctx, api, cam, [
        { f: () => (rig = api.personagem3d(cam, { ...CAC(0, null), pose: POSE_JOGA(cl(r / 0.45)), expressao: 'raiva' }, PC5[0], PC5[1], 1.78, { olhaPara: PF5, luz: LUA5, parado: true })) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { ...window.TEO_LOBISOMEM_POSES.garras.angulos, tronco: 0 }, expressao: 'rugido' }, PF5[0], PF5[1], 2.55, { y: -0.12, olhaPara: PC5, luz: LUA5 }) },
      ], {
        forca: 0.2, bokeh: 2,
        fx3d: () => {
          const m = maoMundo(cam, rig, 'mao_d', PC5[0], PC5[1]); if (!m) return [];
          if (r < solta) return [{ tipo: 'rede', x: m.x, y: m.y + 0.15, z: m.z, dx: 0, dy: 1, dz: 0.001, abre: 0.42, gira: api.t * 11, R: 1.2 }];
          const de = [m.x, m.y + 0.1, m.z], ate = [PF5[0] + 0.2, 1.9, PF5[1] + 0.9], P = caminhoRede(lento, de, ate, 0.9), P2 = caminhoRede(Math.min(1, lento + 0.02), de, ate, 0.9);
          return [{ tipo: 'rede', x: P[0], y: P[1], z: P[2], dx: P2[0] - P[0], dy: P2[1] - P[1], dz: P2[2] - P[2], abre: Math.min(1, 0.42 + k * 1.6), gira: api.t * 11 + k * 2, R: 1.35, corda: de }];
        },
        depois: () => tochaNaMao(ctx, rig, api.t, 1, 0.55),
      });
    },
    // o Davi bate o pé: a Muralha de Gelo sobe entre a fera e a rede; a rede bate no gelo e gruda congelada, chiando
    rede_gelo(ctx, u, d, api) {
      const r = u / d, cam = camCan(api, { x: 3.5, y: 1.5, z: 0.6, cy: 900, f: 860, yaw: -0.74, mov: { orbita: 0.08, empurra: 0.08, sobe: 0, dist: 4.5 } });
      const pisa = poseChave(cl(r / 0.25), [[0, { coxa_d: 0 }], [0.6, { coxa_d: -40, canela_d: 50, braco_d: 20, braco_e: -20 }], [1, { coxa_d: 4, canela_d: -2, braco_d: 30, antebraco_d: -30, braco_e: -30, antebraco_e: 30 }, 'golpe']]);
      const subiu = cl((r - 0.2) / 0.25), MZ = 6.5, MX = 1.15, bate = 0.5, k = cl(r / bate), de = [PC5[0] - 0.1, 2.3, PC5[1] - 0.4];
      const ate = [MX + 0.05, 1.7, MZ + 0.12], P = r < bate ? caminhoRede(k * (0.6 + 0.4 * k), de, ate, 0.7) : ate, P2 = caminhoRede(Math.min(1, k + 0.02), de, ate, 0.7);
      const cg = cl((r - bate) / 0.25), [tx, ty] = api.tremor(r > bate && r < bate + 0.08 ? 6 : r > 0.2 && r < 0.3 ? 4 : 0);
      nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: pisa, expressao: 'raiva' }, PD5[0], PD5[1], 1.76, { olhaPara: [MX, MZ], luz: LUA5, parado: true }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { ...window.TEO_LOBISOMEM_POSES.garras.angulos, tronco: 0 }, expressao: 'raiva' }, PF5[0], PF5[1], 2.55, { y: -0.12, olhaPara: PC5, luz: LUA5 }) },
      ], {
        forca: 0.2, bokeh: 2, fx: { borrao: [tx, ty] },
        luzes: [{ x: MX, y: 1.2, z: MZ, cor: '#9FE0FF', forca: 1.2 * subiu, raio: 7 }],
        fx3d: () => [
          { tipo: 'gelo', x: MX, z: MZ, larg: 2.4, alt: 2.4, k: subiu, rumo: -0.3, racha: 0 },
          { tipo: 'rede', x: P[0], y: P[1], z: P[2], dx: r < bate ? P2[0] - P[0] : 0.32, dy: r < bate ? P2[1] - P[1] : 0, dz: r < bate ? P2[2] - P[2] : -1, abre: 1, gira: r < bate ? api.t * 11 : bate * d * 11, R: 1.3, congela: cg, tCongela: bate * d },
        ],
      });
      hudDavi(ctx, api, 0.92, gasta(MANA.inicio, MANA.gelo, (r - 0.2) / 0.25), MANA.inicio, { custo: 25, kCusto: cl((r - 0.2) / 0.5) });
    },
    // "E eu tô começando a virar." — o Téo olhando as mãos tremendo
    virar(ctx, u, d, api) {
      const cam = camCan(api, { x: 0.35, y: 1.55, z: 1.1, cy: 820, f: 1350, mov: { orbita: 0.08, empurra: 0.1, sobe: 0, dist: 2.2 } });
      const [tx] = api.tremor(1.6);
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...FERA5(u > d - 0.5 ? 1 : 0), pose: { braco_d: 12, antebraco_d: -118, braco_e: -12, antebraco_e: 118, cabeca: 14, tronco: 4 }, expressao: expr('medo', { olhar: [0, 0.014] }), voz: 'teo' }, PT5[0] + tx * 0.002, PT5[1], 1.8, { rumo: 0.2, luz: LUA5 }) }]);
    },
    // "Davi, me prende com as raízes. Antes que eu perca o controle." — por cima do ombro do Davi
    prende(ctx, u, d, api) {
      const cam = camCan(api, { x: -1.0, y: 1.6, z: 1.3, cy: 850, f: 1250, yaw: 0.5, mov: { orbita: 0.06, empurra: 0.06, sobe: 0, dist: 2.4 } });
      const [tx] = api.tremor(1.2);
      let rt; nt(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'preocupado' }, PD5[0], PD5[1], 1.76, { olhaPara: PT5, luz: LUA5 }) },
        { f: () => (rt = api.personagem3d(cam, { ...FERA5(1), pose: { braco_d: 30, antebraco_d: -70, braco_e: -14, antebraco_e: 40, cabeca: -4 }, expressao: 'medo', voz: 'teo' }, PT5[0] + tx * 0.002, PT5[1], 1.8, { olhaPara: PD5, luz: LUA5 })) },
      ], { depois: () => olhosTeo(ctx, rt, 6, 0.55 + 0.25 * Math.sin(api.t * 3), api.t, 'tq') });
    },
    // "Eu não vou te prender."
    naoprendo(ctx, u, d, api) {
      const cam = camCan(api, { x: 0.2, y: 1.6, z: 1.4, cy: 830, f: 1450, yaw: -0.4, mov: { orbita: -0.05, empurra: 0.06, sobe: 0, dist: 2.2 } });
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'determinado', voz: 'davi' }, PD5[0], PD5[1], 1.76, { olhaPara: PT5, luz: LUA5 }) }]);
    },
    // "Lembra o que eu falei? Se eu te atacar..." — orelhas e garras começando
    lembra(ctx, u, d, api) {
      const cam = camCan(api, { x: -0.1, y: 1.55, z: 1.3, cy: 840, f: 1350, yaw: 0.25, mov: { orbita: 0.06, empurra: 0.08, sobe: 0, dist: 2.2 } });
      const [tx] = api.tremor(2.2); let rt;
      nt(ctx, api, cam, [{ f: () => (rt = api.personagem3d(cam, { ...FERA5(2), pose: 'tremendo', expressao: expr('cansado', { olhar: [-0.01, 0] }), voz: 'teo' }, PT5[0] + tx * 0.002, PT5[1], 1.82, { olhaPara: PD5, luz: LUA5 })) }],
        { depois: () => olhosTeo(ctx, rt, 7, 0.8, api.t, 'tq') });
    },
    // "...eu corro. Eu sei."
    corro(ctx, u, d, api) {
      const cam = camCan(api, { x: 0.25, y: 1.6, z: 1.5, cy: 830, f: 1450, yaw: -0.47, mov: { orbita: -0.05, empurra: 0.08, sobe: 0, dist: 2.2 } });
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 8, antebraco_d: -10, braco_e: -8, antebraco_e: 10, cabeca: 6 }, expressao: expr('preocupado', { olhar: [0.01, 0.006] }), voz: 'davi' }, PD5[0], PD5[1], 1.76, { olhaPara: PT5, luz: LUA5 }) }]);
    },
    // close no olho: o castanho engolido pelo amarelo, e a placa trocando
    placa(ctx, u, d, api) {
      ctx.fillStyle = '#05040A'; ctx.fillRect(0, 0, W, H);
      const vira = api.fase(0.3, 1.2);
      TeoCloses.olho(ctx, 540, 900, 520, api.t, { humano: 1 - vira, abre: 0.6 + 0.4 * vira });
      const k = api.fase(1.25, 1.6, 'volta');
      placaNivel(ctx, 540, 1450, 'TÉO · NV 12', '#7FE08A', 1 - api.fase(1.1, 1.25));
      placaNivel(ctx, 540, 1450, 'FERA · NV ???', '#FF5A4A', k);
    },
    // "E aí o Téo virou fera." — a transformação: corpo curvando, capa rasgando, pelo, e a fera inteira
    fera(ctx, u, d, api) {
      const X = PT5[0], Z = PT5[1] + 0.6, vira = d * 0.55;
      const cam = api.orbita({ alvo: [X, 1.2, Z], raio: chave(u, [[0, 3.8], [d, 3.1]]), ang: chave(u, [[0, -0.5], [d, 0.25]]), altura: 0.75, f: 1050, ySalvo: 1150, nevoa: V().nevoa(1, false, 'canion') });
      const e = Math.min(3, 2 + Math.floor(u / (vira * 0.5))), lobo = u >= vira;
      const k = api.fase(0.1, 0.8) * (1 - api.fase(vira + 0.3, vira + 1.0)), [tx] = api.tremor(u > 0.3 && u < vira + 0.3 ? 7 : 0);
      nt(ctx, api, cam, [
        { f: () => (lobo ? api.personagem3d(cam, { ...LOBO, pose: 'garras' }, X, Z, 2.55, { luz: LUA5 }) : api.personagem3d(cam, { ...FERA5(e), pose: e >= 3 ? 'garras' : 'tremendo', expressao: 'raiva' }, X + tx * 0.002, Z, 1.82 + (e >= 3 ? 0.12 : 0), { luz: LUA5 })) },
      ], {
        forca: 0, depois: () => {
          const q = cam.p(X, 0, Z), h = (lobo ? 2.55 : 1.9) * q.s;
          Noite.energia(ctx, q.x, q.y, h, api.t, k); Noite.faiscas(ctx, q.x, q.y, h * 0.8, h * 1.3, api.t, Math.max(k, 0.4 * api.fase(vira, vira + 0.2)), 5);
          Noite.clarao(ctx, q.x, q.y - h * 0.5, Math.max(0, 1 - api.fase(vira - 0.05, vira + 0.7)) * (u > vira - 0.15 ? 1 : 0));
          Noite.fumaca(ctx, q.x, q.y - 0.1 * q.s, 1.1 * q.s, api.fase(vira - 0.1, vira + 1.4), { seed: 7, cor: '190,200,235', n: 22, largura: 1.8 });
        },
      });
    },
    // o uivo: câmera baixa, a fera de cabeça erguida para a lua, pedrinhas despencando das paredes
    uivo(ctx, u, d, api) {
      const X = PT5[0] - 0.2, Z = PT5[1] + 0.9;
      const cam = camCan(api, { x: X + 0.1, y: 0.55, z: Z - 2.9, cy: 1480, f: 1000, mov: { orbita: 0.14, empurra: 0.1, sobe: 0.1, dist: 2.9 } });
      const [tx, ty] = api.tremor(api.fase(0.4, 0.8) * (1 - api.fase(d - 0.5, d)) * 5);
      nt(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...LOBO, pose: { ...window.TEO_LOBISOMEM_POSES.rugindo.angulos, cabeca: -30, tronco: -6 }, expressao: 'rugido' }, X, Z, 2.55, { luz: { ...LUA5, forca: 1 } }) }],
        { forca: 0, fx: { borrao: [tx, ty] }, fim: () => pedrinhas(ctx, api, api.fase(0.6, 1.0)) });
    },
    // ===== na visão do Davi (pedido do autor): a fera vem na direção dele, um passo de cada vez =====
    // "encara": ela vem de longe, para, rosna, dá outro passo... a câmera respira e treme a cada pisada
    encara(ctx, u, d, api) { povFera(ctx, u, d, api, { z0: 3.8, passos: [[0.5, 0], [1.9, 1], [3.3, 2]], maoK: 0 }); },
    // "Não. Dessa vez eu não vou correr." — mais um passo; a mão do Davi entra no quadro, aberta
    naocorrer(ctx, u, d, api) { povFera(ctx, u, d, api, { z0: 3.8 - 3 * 0.5, passos: [[0.6, 3]], maoK: api.fase(1.5, 2.4) }); },
    // "Sou eu, Téo." — o focinho chega a um palmo... e no close a pupila de fenda abre redonda (é o Téo ali dentro)
    soueu(ctx, u, d, api) {
      const corte = d * 0.42;
      if (u < corte) povFera(ctx, u, d, api, { z0: 3.8 - 4 * 0.5, passos: [], perto: api.fase(0.1, corte), maoK: 1 });
      else {
        ctx.fillStyle = '#05040A'; ctx.fillRect(0, 0, W, H);
        const muda = api.fase(corte + 0.5, corte + 1.6), z = 1 + 0.06 * api.fase(corte, d);
        zoomEm(ctx, 540, 960, z, () => TeoCloses.olho(ctx, 540, 960, 600, api.t, { humano: muda, abre: 0.85 + 0.15 * muda }));
      }
    },
    // ficha: os caçadores da noite (4 variações), com tocha e rede de prata ou besta
    ficha_cacadores(ctx, u, d, api) {
      fundoFicha(ctx, 'CAÇADORES DA NOITE', 'jogadores atrás do homem-fera\\ntocha + rede de prata ou besta de prata');
      const lista = [[0, 'rede', 'capuz verde-azulado\nrede de prata'], [1, 'rede', 'faixa na testa\nrede de prata'], [2, 'besta', 'elmo de ferro\nbesta de prata'], [3, 'rede', 'capuz e máscara\nrede de prata']];
      lista.forEach(([v, arma, txt], i) => {
        const x = 280 + (i % 2) * 520, y = 900 + Math.floor(i / 2) * 760, item = { ...CAC(v, arma), vista: 'tq', pose: POSE_TOCHA, expressao: i === 1 ? 'determinado' : 'raiva' };
        sombraPe(ctx, x, y, 120);
        const rig = api.personagem(item, x, y, 560 * window.criarCacadorNoite({ variante: v }, 'tq').alturaEmH / 6.2);
        tochaNaMao(ctx, rig, api.t, v + 1, 0.55);
        rotuloFicha(ctx, x, y + 60, window.CACADOR_NOITE_VARIANTES[v].nome, txt);
      });
    },
    // ficha: o líder dos ladrões de volta, com armadura nova (frente, 3/4, costas) e a corrente de prata
    ficha_lider(ctx, u, d, api) {
      fundoFicha(ctx, 'O LÍDER VOLTOU', 'o líder dos ladrões da Parte 3, agora NV 41\\narmadura de aço negro + corrente de prata');
      window.CORRENTE = { t: api.t };
      const A = window.criarLadrao({ lider: true, estilo: 'D' }, 'frente').alturaEmH, hp = 980;
      sombraPe(ctx, 540, 1500, 200);
      api.personagem({ ...LIDER5, vista: 'frente', pose: { braco_e: -14, antebraco_e: -40, braco_d: 8, antebraco_d: -6 }, expressao: 'raiva' }, 540, 1500, hp);
      sombraPe(ctx, 175, 1500, 90); api.personagem({ ...LIDER5, vista: 'tq', pose: 'parado', expressao: 'determinado' }, 175, 1500, hp * 0.5);
      sombraPe(ctx, 905, 1500, 90); api.personagem({ ...LIDER5, vista: 'costas', pose: 'parado' }, 905, 1500, hp * 0.5);
      rotuloFicha(ctx, 540, 1580, 'Líder dos ladrões · NV 41', 'o mesmo da Parte 3: cabelo branco, bandana vermelha e cicatriz\nagora com peitoral de aço negro, ombreiras com espinhos e capa roxa\na corrente de prata enrolada no braço (é ela que prende a fera)');
      rotuloFicha(ctx, 175, 1560, '3/4'); rotuloFicha(ctx, 905, 1560, 'costas');
    },
    // a noite caindo no cânion: céu vira roxo, a lua sobe atrás da ponte, os cristais acendem um por um
    noite(ctx, u, d, api) {
      const cam = camCan(api, { f: 1000, x: 0, y: 2.4, z: -6 + u * 1.5, cy: 980, mov: false });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado' }, -0.45, 3.2, 1.76, { rumo: 0.2 }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado' }, 0.5, 3.4, 1.8, { rumo: -0.2 }) },
      ], { noite: Math.min(1, (u / d) * 1.25), forca: 0, bokeh: 0 });
    },
    // tochas aparecendo na borda, uma, depois dez, depois dezenas
    tochas(ctx, u, d, api) {
      const cam = camCan(api, { f: 900, x: 0.2, y: 1.3, z: 0.5, cy: 1250, mov: { orbita: 0.08, empurra: 0.04, sobe: 0, dist: 6 } });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { cabeca: -12 }, expressao: expr('preocupado', { olhar: [0, -0.014] }), voz: 'davi' }, -0.5, 3.0, 1.76, { rumo: 0.15 }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: { cabeca: -10 }, expressao: expr('medo', { olhar: [0, -0.014] }) }, 0.55, 3.3, 1.8, { rumo: -0.15 }) },
      ], { noite: 1, forca: 0.2, bokeh: 0, borda: { n: Math.min(1, 0.02 + (u / d) * 1.1), desce: 0 } });
    },
    // de costas para os dois, olhando para cima: a borda cheia de tochas
    olhando(ctx, u, d, api) {
      const cam = camCan(api, { f: 1050, x: 0.1, y: 1.0, z: -1.2, cy: 1350, mov: { orbita: 0.1, empurra: 0.06, sobe: 0.15, dist: 4 } });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { cabeca: -14, braco_d: 8, antebraco_d: -12, braco_e: -8, antebraco_e: 12 } }, -0.45, 1.4, 1.76, { rumo: Math.PI }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: { cabeca: -12, braco_d: 8, antebraco_d: -12, braco_e: -8, antebraco_e: 12 } }, 0.5, 1.6, 1.8, { rumo: Math.PI }) },
      ], { noite: 1, forca: 0.3, bokeh: 3, borda: { n: 1, desce: 0 } });
    },
    // os jogadores descendo de rapel pela parede com as tochas
    descem(ctx, u, d, api) {
      const cam = camCan(api, { f: 950, x: -0.4, y: 1.5, z: 0, cy: 1100, mov: { orbita: -0.12, empurra: 0.08, sobe: 0, dist: 6 } });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'preocupado' }, -0.3, 4.2, 1.76, { rumo: 0 }) },
      ], { noite: 1, forca: 0.2, bokeh: 0, borda: { n: 1, desce: 0.1 + (u / d) * 0.8 } });
    },
  };
})();

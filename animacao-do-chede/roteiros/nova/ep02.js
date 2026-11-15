// VALDOR · Parte 2 — "O segredo do Téo". Planos do roteiro roteiros/nova/ep02.json (versão 2 aprovada, com ladrões).
// Reaproveita: cenário de noite (cenarios/valdor-noite.js), efeitos de noite/combate e câmeras da prévia de luta.
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
      if (pos && !o.desfoque) {
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
    let perto = o.forca === 0 ? 0 : o.perto === undefined ? 1.2 : o.perto; const luzes = o.luzes;
    for (const f of figuras) if (f.sombra !== false) perto = Math.min(perto, f.dz - 0.3);
    if (perto < 0.3) perto = 0;
    // foco logo atrás de quem está mais longe; o fundo além disso sai desfocado
    const dzs = figuras.filter((f) => f.sombra !== false).map((f) => f.dz), foco = dzs.length ? Math.max(...dzs) + (o.folgaFoco || 3) : 0;
    const magias = o.magias ? o.magias(res).filter(Boolean) : [];
    const op = { t: tc, noite: n, dia, perto, luzes, figuras, foco, bokeh: o.bokeh === undefined ? 5 : o.bokeh, magias };
    if (o.desfoque) { const F = api.camada(); V().desenhar(F.getContext('2d'), cam, op); api.desfocar(F, o.desfoque); } else V().desenhar(ctx, cam, op);
    if (o.chao && !o.chaoEm) o.chao(res);
    for (const [L, a] of camadas) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(L, 0, 0); ctx.restore(); }
    window.SEM_SOMBRA_CHAO = false;
    if (o.depois) o.depois(res);
    V().frente(ctx, cam, { t: tc, noite: n, dia, forca: o.forca === undefined ? 0.5 : o.forca, perto, luzes, magias });
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

  window.PLANOS = {
    // 1) gancho / capa
    capa(ctx, u, d, api) {
      campoDia(ctx, api, { x: 0.2, y: 1.5, z: -0.3 + u * 0.1 }, { desfoque: 12 });
      ctx.fillStyle = 'rgba(20,14,40,0.45)'; ctx.fillRect(0, 0, W, H);
      const rig = close(api, { ...DAVIJ, pose: { braco_d: 70, antebraco_d: 22, braco_e: -8, antebraco_e: 4, _magia: 1.2 }, expressao: 'determinado' }, 600, 1000, 430, { luz: LUZ_CAMPO });
      if (rig && rig.pontoMundo) { const m = rig.pontoMundo('mao_d', [0, 0.25]); Combate.maoEletrica(ctx, m.x, m.y, 30, api.t, 1); }
      { const kc = api.fase(0.4, 0.8, 'volta'); if (kc > 0.01) Valdor.calendario(ctx, 250, 1450, 300 * kc, '30', 'DIAS'); }
      const k = api.fase(0, 0.3, 'volta');
      zoomEm(ctx, 540, 360, k, () => { api.texto('30 DIAS PRA', 540, 260, 104); api.texto('PAGAR O', 540, 380, 104); api.texto('ALUGUEL', 540, 510, 150, { cor: AMARELO }); api.texto('JOGANDO', 540, 640, 110); });
    },
    // 2) lembrete rápido: saldo R$ 7,90, visor e a adaga roxa
    lembra(ctx, u, d, api) {
      if (u < 1.2) {
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0E1530'); g.addColorStop(1, '#1E2A55'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        Valdor.celular(ctx, 540, 1020, 1250, { saldo: 'R$ 7,90', vermelho: true, titulo: 'SALDO', linhas: [['CADEIRA VR', '- R$ 6.890,00'], ['CAPACETE VR', '- R$ 1.230,10']] });
      } else if (u < 2.2) {
        campoDia(ctx, api, { x: 0, y: 1.5, z: u * 0.3 });
        Valdor.visor(ctx, cl((u - 1.2) / 0.7));
        api.texto('VALDOR', 540, 700, 150, { cor: '#D9C8FF' });
      } else {
        ctx.fillStyle = '#0B0818'; ctx.fillRect(0, 0, W, H);
        Valdor.feixe(ctx, 540, 0, 1500, 600, ROXO, 1);
        Valdor.adagaEpica(ctx, 540, 900, 520 * (1 + (u - 2.2) * 0.05), api.t, -0.5);
        Valdor.etiqueta(ctx, 540, 1320, 'ADAGA ECLIPSE · R$ 15.000', '#D9C8FF', api.fase(2.4, 2.8, 'volta'), { tam: 58 });
      }
    },
    // 3) farmar: montagem rápida, lobos caindo e o nível subindo 2 → 5
    farmar(ctx, u, d, api) {
      const i = Math.min(3, Math.floor(u / (d / 4))), uu = u - i * (d / 4);
      const angulos = [{ x: -0.4, y: 1.1, z: 0.6, yaw: 0.08 }, { x: 0.6, y: 0.7, z: 1.2, yaw: -0.1 }, { x: 0, y: 1.6, z: 0.2, yaw: 0.0 }, { x: -0.8, y: 0.9, z: 1.0, yaw: 0.15 }];
      const cam = api.camera({ f: 1150, x: 0, y: 1.45, z: 0, cy: 860, nevoa: Valdor3D.nevoa(0, true), ...angulos[i], z: angulos[i].z + uu * 0.3 });
      const LX = 1.0 + (i % 2) * 0.3, LZ = 5.2, golpe = cl((uu - 0.25) / 0.2);
      noite(ctx, api, cam, [
        { pos: [LX, LZ], alt: 1.0, f: () => { const q = cam.p(LX, 0, LZ); Criaturas.lobo(ctx, q.x, q.y, 0.95 * q.s, api.t, { espelhar: true, pose: golpe > 0 ? 'atingido' : 'parado', dissolve: cl((uu - 0.45) / 0.35) }); } },
        { f: () => api.personagem3d(cam, { ...DAVIJ, pose: i % 2 ? 'conjurando' : 'magia-na-mao', expressao: 'determinado' }, -0.6, 4.4, 1.76, { olhaPara: [LX, LZ], luz: LUZ_CAMPO }) },
        { f: () => api.personagem3d(cam, { ...TEOJ, pose: 'parado', expressao: 'determinado' }, 0.4, 4.0, 1.82, { olhaPara: [LX, LZ], luz: LUZ_CAMPO, semente: 3 }) },
      ], {
        dia: true, forca: 0.5,
        magias: (rs) => [orbe(maoMundo(cam, rs[1], 'mao_d', -0.6, 4.4), 0.9), i % 2 ? { tipo: 'circulo', x: -0.6, z: 4.4, raio: 0.8, k: 0.8 } : null],
        depois: () => {
          const q = cam.p(LX, 0.45, LZ); Combate.impacto(ctx, q.x, q.y, 140, uu - 0.25, { dura: 0.4, seed: i + 2 });
          const qd = cam.p(-0.6, 2.05, 4.4); Valdor.placaNivel(ctx, qd.x, qd.y, 2 + i, 1 + 0.3 * Math.max(0, 1 - uu * 4), { tam: 42, cor: AMARELO });
          const qt = cam.p(0.4, 2.1, 4.0); Combate.vidaCabeca(ctx, qt.x, qt.y, 0.7 * qt.s, 1); Combate.vidaCabeca(ctx, qd.x, qd.y - 0.22 * qd.s, 0.7 * qd.s, 1, { mana: 0.4 + 0.5 * Math.abs(Math.sin(api.t * 1.5)) });
        },
      });
      const v = 7.9 + 1.5 * (u / d); Combate.aluguel(ctx, v / ALUGUEL_META, reaisTxt(v), { dias: '29 DIAS' });
    },
    // 4) loots caindo em cartas de vidro
    loot(ctx, u, d, api) {
      const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, '#26305E'); g.addColorStop(1, '#0A0D20'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      LOOTS.forEach((it, i) => { const t0 = 0.1 + i * 0.5, k = api.fase(t0, t0 + 0.35, 'volta'); const x = i % 2 ? 790 : 290, y = i < 2 ? 560 : 1580; if (k > 0) Valdor.feixe(ctx, x, 0, y + 200, 340, RAR[it.rar][1], 0.6 * cl(k)); cartaLoot(ctx, x, y - (1 - cl(k)) * 200, 360, it, k, api.t); });
    },
    vender(ctx, u, d, api) {
      const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, '#26305E'); g.addColorStop(1, '#0A0D20'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      LOOTS.forEach((it, i) => { const x = i % 2 ? 790 : 290, y = i < 2 ? 560 : 1580, vende = i < 3; cartaLoot(ctx, x, y, 360, it, 1 + (vende ? 0.04 * Math.sin(api.t * 8) : 0), api.t, { selo: vende ? 'VENDER' : undefined }); if (vende) Valdor.moeda(ctx, x + 150, y + 230 - api.fase(0.1, 0.8) * 60, 30, api.t * 3, api.fase(0.1, 0.3)); });
      const v = 9.4 + 61.68 * api.fase(0.15, 0.9); Combate.aluguel(ctx, v / ALUGUEL_META, reaisTxt(v), { dias: '29 DIAS', y: 900 });
    },
    // 5) equipar: luvas no Davi (a faísca vira raio) e escudo de ferro no Téo
    equipar(ctx, u, d, api) {
      campoDia(ctx, api, { x: 0, y: 1.4, z: 1.2 + u * 0.1 }, { desfoque: 10 });
      const meio = d * 0.55;
      if (u < meio) {
        // close no Davi: a carta voa para a mão e as luvas aparecem com brilho raro
        const troca = u > 0.55, Hpx = 360 * (1 + u * 0.04);
        const rig = close(api, { ...(troca ? DAVIL : DAVIJ), pose: { braco_d: 28, antebraco_d: -105, mao_d: -15, braco_e: -28, antebraco_e: 105, mao_e: 15, _magia: troca ? 1 : 0 }, expressao: troca ? 'determinado' : 'espanto' }, 540, 640, Hpx, { luz: LUZ_CAMPO });
        if (rig && rig.pontoMundo) {
          const m = [rig.pontoMundo('mao_d', [0, 0.2]), rig.pontoMundo('mao_e', [0, 0.2])], c = [(m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2];
          const kv = api.fase(0.0, 0.5); if (kv < 1) cartaLoot(ctx, 540 + (c[0] - 540) * kv, 420 + (c[1] - 420) * kv, 320 * (1 - 0.85 * kv), LOOTS[3], 1, api.t);
          if (troca) { for (const p of m) { Valdor.brilhoRadial(ctx, p.x, p.y, 200 * (1 - api.fase(0.6, 1.3)) + 70, '90,180,255', 0.8); Combate.maoEletrica(ctx, p.x, p.y, 24, api.t, api.fase(0.7, 1.0)); } Noite.faiscas(ctx, c[0], c[1] + 60, 360, 420, api.t, 1 - api.fase(1.0, 1.6), 9, '120,200,255'); }
          if (u > 0.5 && u < 0.7) Noite.clarao(ctx, c[0], c[1], 0.6 * (1 - (u - 0.5) / 0.2), '170,220,255');
          Valdor.etiqueta(ctx, 540, 1580, 'LUVAS DO CONJURADOR · RARO', '#5AB4FF', api.fase(0.6, 0.85, 'volta'), { tam: 44 });
          setaAtributo(ctx, 380, 1730, '+MAGIA', (u - 0.7) * 2);
        }
      } else {
        // close no Téo: o escudo de tábuas vira escudo de ferro
        const uu = u - meio, troca = uu > 0.25;
        close(api, { ...(troca ? TEOF : TEOJ), pose: 'parado', expressao: troca ? 'feliz' : 'neutro' }, 540, 640, 360, { luz: LUZ_CAMPO, semente: 3 });
        if (uu > 0.2 && uu < 0.4) Noite.clarao(ctx, 700, 1200, 0.5 * (1 - (uu - 0.2) / 0.2), '230,230,240');
        Valdor.etiqueta(ctx, 540, 1580, 'ESCUDO DE FERRO', '#E8E8F0', api.fase(meio + 0.3, meio + 0.55, 'volta'), { tam: 46 });
        setaAtributo(ctx, 380, 1730, '+DEFESA', (uu - 0.35) * 2);
      }
    },
    // 6) raio-X: neurônio com sinal lento → mielina → sinal rápido
    cerebro(ctx, u, d, api) { Valdor.raioFundo(ctx, api.t); neuronio(ctx, 160, 920, 960, 0, (u * 0.35) % 1, api.t); api.texto('100x', 540, 600, 120, { cor: '#7FE6FF' }); },
    mielina(ctx, u, d, api) { Valdor.raioFundo(ctx, api.t); const m = api.fase(0.2, 3.2); neuronio(ctx, 160, 920, 960, m, (u * (0.35 + m * 1.2)) % 1, api.t); Valdor.etiqueta(ctx, 540, 1480, 'MIELINA', '#FFFFFF', api.fase(1.6, 2.0, 'volta'), { tam: 70 }); },
    rapido(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t);
      const x = 540 + Math.sin(u * 9) * 160;
      for (let k = 3; k >= 1; k--) { ctx.save(); ctx.globalAlpha = 0.18 * (4 - k); Valdor.corpoRaio(ctx, 540 + Math.sin((u - k * 0.05) * 9) * 160, 1500, 900, u * 3, { cerebro: 1 }); ctx.restore(); }
      Valdor.corpoRaio(ctx, x, 1500, 900, u * 3, { cerebro: 1 });
      Combate.velocidade(ctx, 540, 1000, Math.cos(u * 9) > 0 ? 0 : Math.PI, 0.6, api.t);
      api.texto('100x MAIS RÁPIDO', 540, 380, 96, { cor: '#7FE6FF' });
    },
    // 7) a noite cai
    noite(ctx, u, d, api) {
      const n = api.ease.suave(cl((u - 0.3) / (d - 0.6)));
      const cam = camNoite(api, { noite: n, x: chave(u, [[0, -0.5], [d, 0.1]]), y: chave(u, [[0, 1.15], [d, 1.4]]), z: chave(u, [[0, 1.2], [d, 2.2]]), yaw: chave(u, [[0, 0.05], [d, -0.03]]) });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'parado', expressao: 'espanto' }, -0.45, 4.1, 1.76, { rumo: Math.PI, luz: { ...LUZ_LUA, forca: 0.85 * n } }) },
        { f: () => api.personagem3d(cam, { ...TEOF, pose: 'parado', expressao: 'neutro' }, 0.6, 4.9, 1.82, { rumo: Math.PI, luz: { ...LUZ_LUA, forca: 0.85 * n }, semente: 3 }) },
      ], { noite: n, forca: 0.7 });
    },
    // 8) o Téo começa a tremer, os olhos abrem amarelos
    tremer(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0.2, y: 1.6, z: 0.5, cy: 820 });
      const abre = u > 1.2, item = { ...FERA(abre ? 1 : 0), pose: 'tremendo', expressao: abre ? 'raiva' : 'cansado' };
      const zoom = chave(u, [[0, 1], [d, 1.12]]), [tx, ty] = api.tremor(abre ? 1.5 : 3), Hpx = 560 * zoom;
      noite(ctx, api, cam, [{ f: () => { const A = alturaH(item); return api.personagem(item, W * 0.5 + tx, 980 + ty - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: LUZ_LUA }); } }], {
        desfoque: 9, forca: 0,
        depois: ([rig]) => { if (!abre || !rig || !rig.pontoMundo) return; Noite.olhos(ctx, [rig.pontoMundo('cabeca', [-0.2, -0.37]), rig.pontoMundo('cabeca', [0.2, -0.37])].map((p) => [p.x, p.y]), 11, api.fase(1.2, 1.5), api.t); },
      });
    },
    // 9) raio-X: o olho de bicho da noite (tapetum lucidum)
    olho(ctx, u, d, api) {
      if (u < d - 0.9) { Valdor.raioFundo(ctx, api.t); olhoCorte(ctx, 640, 760, 250, api.fase(0.4, 2.6), api.t); Valdor.etiqueta(ctx, 640, 1480, 'TAPETUM LUCIDUM', '#FFE680', api.fase(1.6, 2.0, 'volta'), { tam: 54 }); api.texto('A LUZ PASSA 2x', 540, 380, 88, { cor: '#7FE6FF' }); }
      else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); TeoCloses.olho(ctx, 540, 960, 560, api.t, { abre: api.fase(d - 0.9, d - 0.5) }); }
    },
    // 10) a transformação
    nome(ctx, u, d, api) {
      const X = 0.35, Z = 4.4, vira = 1.5;
      const cam = api.orbita({ alvo: [X, 1.2, Z], raio: chave(u, [[0, 3.6], [d, 3.0]]), ang: chave(u, [[0, -0.45], [d, 0.2]]), altura: 1.0, f: 1100, ySalvo: 1080, nevoa: V().nevoa(1) });
      const e = Math.min(3, 1 + Math.floor(u / 0.45)), lobo = u >= vira;
      const k = api.fase(0.1, 0.7) * (1 - api.fase(vira + 0.3, vira + 1.0)), [tx] = api.tremor(u > 0.8 && u < vira + 0.4 ? 7 : 0);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'parado', expressao: lobo ? expr('medo', { olhar: [0, -0.012] }) : 'espanto' }, -1.25, 4.0, 1.76, { olhaPara: [X, Z], luz: LUZ_LUA }) },
        { f: () => (lobo ? api.personagem3d(cam, { ...LOBO, pose: 'garras' }, X, Z, 2.55, { luz: LUZ_LUA }) : api.personagem3d(cam, { ...FERA(e), pose: e >= 2 ? 'garras' : 'tremendo', expressao: 'raiva' }, X + tx * 0.002, Z, 1.82 + (e >= 3 ? 0.12 : 0), { luz: LUZ_LUA })) },
      ], {
        chaoEm: [X, Z],
        chao: () => { const q = cam.p(X, 0, Z); Noite.anelChao(ctx, q.x, q.y, 1.4 * q.s * (1 + api.fase(vira, vira + 0.8)), k); },
        depois: () => { const q = cam.p(X, 0, Z), h = (lobo ? 2.55 : 1.9) * q.s; Noite.energia(ctx, q.x, q.y, h, api.t, k); Noite.faiscas(ctx, q.x, q.y, h * 0.8, h * 1.3, api.t, Math.max(k, 0.4 * api.fase(vira, vira + 0.2)), 5); Noite.clarao(ctx, q.x, q.y - h * 0.5, Math.max(0, 1 - api.fase(vira - 0.05, vira + 0.7)) * (u > vira - 0.15 ? 1 : 0)); Noite.fumaca(ctx, q.x, q.y - 0.1 * q.s, 1.1 * q.s, api.fase(vira - 0.1, vira + 1.4), { seed: 7, cor: '190,200,235', n: 22, largura: 1.8 }); },
      });
    },
    // 11) "Téo...?" — TÉO · FORMA FERA e a vida dobrando
    davi(ctx, u, d, api) {
      const cam = camNoite(api, { x: -0.6, y: 1.3, z: 1.6 + u * 0.1, cy: 900, yaw: 0.06 });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'parado' }, 0.4, 4.6, 2.55, { luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'parado', expressao: u < 1.1 ? 'espanto' : expr('medo', { olhar: [0.012, -0.006] }) }, -1.15, 3.1, 1.76, { olhaPara: [0.4, 4.6], luz: LUZ_LUA }) },
      ], {
        forca: 0.3,
        fim: () => {
          const k = api.fase(0.1, 0.45, 'volta'); zoomEm(ctx, 540, 300, k, () => tituloMetal(ctx, 'TÉO · FORMA FERA', 540, 300, 96, OURO));
          const v = 0.5 + 0.5 * api.fase(0.6, 1.6);
          Combate.hud(ctx, 260, 400, 'TÉO', 5, v, v, { max: 240, w: 380, corRetrato: '#B84A1E', alfa: api.fase(0.4, 0.6) });
          Valdor.etiqueta(ctx, 540, 590, 'VIDA x2', '#9BF0A8', api.fase(1.2, 1.5, 'volta'), { tam: 48 });
        },
      });
    },
    // 12) olhos acendendo entre as árvores
    sozinhos(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0.3, y: 1.2, z: 0.2 + u * 0.4, cy: 880, yaw: 0.25 });
      const pares = [[3.2, 9, 0.2], [5.5, 11, 0.45], [1.6, 12, 0.7], [7.2, 13, 0.95], [4.4, 15, 1.2]];
      noite(ctx, api, cam, [], {
        forca: 0.4,
        luzes: pares.slice(0, 4).map(([X, Z, t0]) => ({ x: X + 0.35, y: 1.9, z: Z, cor: '#FFB066', forca: 0.9 * api.fase(t0 + 0.1, t0 + 0.35) })),
        depois: () => {
          const _p = [[3.2, 9, 0.2], [5.5, 11, 0.45], [1.6, 12, 0.7], [7.2, 13, 0.95], [4.4, 15, 1.2]];
          for (const [X, Z, t0] of pares) { const k = api.fase(t0 + 0.1, t0 + 0.35); if (k <= 0) continue; const q = cam.p(X + 0.35, 1.9, Z); Noite.tocha(ctx, q.x, q.y + 0.5 * q.s, 0.55 * q.s, api.t, { seed: X }); }
          for (const [X, Z, t0] of pares) { const q = cam.p(X, 1.6, Z), k = api.fase(t0, t0 + 0.2); if (k <= 0) continue; const sep = 0.09 * q.s; Noite.olhos(ctx, [[q.x - sep, q.y], [q.x + sep, q.y]], Math.max(4, 0.035 * q.s), k * (0.7 + 0.3 * Math.sin(api.t * 3 + X)), api.t); }
        },
      });
    },
    // 13) cinco encapuzados saem da neblina e cercam os dois
    rara(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [-0.1, 1.15, 6.6], raio: chave(u, [[0, 5.6], [d, 5.0]]), ang: chave(u, [[0, -0.2], [d, -0.04]]), altura: 1.9, f: 1050, ySalvo: 940, nevoa: V().nevoa(1) });
      const anda = api.ease.entra(api.fase(0, 1.8));
      const pos = [[-2.4, 6.6], [-1.5, 7.4], [0.0, 7.9], [1.8, 7.3], [2.7, 6.4]].map(([x, z]) => [x * (1.4 - 0.4 * anda), 5.0 + (z - 5.0) * (1.6 - 0.6 * anda)]);
      const ents = [
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'garras' }, 1.05, 5.0, 2.55, { olhaPara: pos[2], luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'medo' }, -1.0, 5.3, 1.76, { olhaPara: pos[1], luz: LUZ_LUA }) },
        ...pos.map(([x, z], i) => ({ f: () => api.personagem3d(cam, { ...(i === 2 ? LIDER : LADRAO(i)), pose: i === 2 ? 'parado' : i % 2 ? 'tocha' : 'faca', expressao: 'raiva' }, x, z, 1.85, { olhaPara: [0, 5], luz: i === 2 ? LUZ_LUA : { lado: 1, forca: 0.9, cor: 'rgb(255,170,90)', sombra: 0.9 }, caminhar: anda < 1 ? api.t : undefined, semente: i }) })),
      ];
      noite(ctx, api, cam, ents.reverse(), {
        forca: 0.35,
        magias: (rs) => { const dv = rs[rs.length - 2]; return [orbe(maoMundo(cam, dv, 'mao_d', -1.0, 5.3), 0.8), orbe(maoMundo(cam, dv, 'mao_e', -1.0, 5.3), 0.8)]; },
        luzes: pos.filter((_, i) => i % 2).map(([x, z]) => ({ x: x + 0.3, y: 1.7, z, cor: '#FFB066', forca: 0.9 })),
        depois: (rs) => { const ladr = rs.slice().reverse().slice(2); ladr.forEach((r, i) => { if (i % 2) tochaNaMao(ctx, r, api.t, i); }); const qt = cam.p(1.05, 2.75, 5.0), qd = cam.p(-1.0, 2.0, 5.3); Combate.vidaCabeca(ctx, qt.x, qt.y, 0.7 * qt.s, 1); Combate.vidaCabeca(ctx, qd.x, qd.y, 0.6 * qd.s, 1, { mana: 0.8 });
          pos.forEach(([x, z], i) => { const q = cam.p(x, 2.15, z); Valdor.placaNivel(ctx, q.x, q.y, [12, 13, 15, 14, 12][i], api.fase(1.0 + i * 0.1, 1.3 + i * 0.1, 'volta'), { tam: 34, cor: i === 2 ? '#FF6A7A' : '#FFB0B0' }); }); },
      });
    },
    // 14) o líder aponta para o Téo; um ladrão prepara a corrente
    fortuna(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0.9, y: 1.4, z: 4.4 + u * 0.15, cy: 900, yaw: -0.15 });
      const res = noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(3), pose: 'tocha', expressao: 'raiva' }, -0.6, 8.9, 1.85, { olhaPara: [0, 5], luz: { lado: 1, forca: 0.9, cor: 'rgb(255,170,90)', sombra: 0.9 } }) },
        { f: () => api.personagem3d(cam, { ...LADRAO(1), pose: 'faca', expressao: 'raiva' }, 1.7, 8.4, 1.85, { olhaPara: [0, 5], luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...LIDER, pose: 'aponta', expressao: 'raiva' }, 0.75, 7.6, 1.9, { olhaPara: [0, 5], luz: LUZ_LUA }) },
      ], {
        forca: 0.3,
        luzes: [{ x: -0.3, y: 1.7, z: 8.9, cor: '#FFB066', forca: 1 }],
        depois: ([r0, r1]) => { tochaNaMao(ctx, r0, api.t, 3); if (r1 && r1.pontoMundo) { const m = r1.pontoMundo('mao_e', [0, 0.25]), m2 = r1.pontoMundo('mao_d', [0, 0.25]); corrente(ctx, [m.x, m.y], [m2.x - 40, m2.y + 30], api.t, api.fase(0.4, 0.8)); } },
        fim: () => Valdor.etiqueta(ctx, 540, 380, 'RECOMPENSA: HOMEM-FERA', '#FFB0B0', api.fase(1.0, 1.3, 'volta'), { tam: 52 }),
      });
    },
    // 15) o rugido
    terminou(ctx, u, d, api) {
      const ruge = u > 0.6, [tx, ty] = api.tremor(u > 0.65 && u < 1.8 ? 9 : 0);
      const cam = camNoite(api, { f: chave(u, [[0, 900], [d, 980]]), x: 0.25, y: 0.45, z: chave(u, [[0, 1.4], [d, 1.8]]), cy: 1300, yaw: -0.04 });
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...LOBO, pose: ruge ? 'rugindo' : 'garras', expressao: ruge ? 'rugido' : 'raiva' }, 0.2, 4.2, 2.6, { luz: { ...LUZ_LUA, forca: 1 } }) }], {
        forca: 0.45,
        depois: ([rig]) => { if (!rig || !rig.pontoMundo) return; Noite.olhos(ctx, [rig.pontoMundo('cabeca', [-0.28, -0.8]), rig.pontoMundo('cabeca', [0.28, -0.8])].map((p) => [p.x, p.y]), 9, ruge ? 1 : 0.6, api.t); if (ruge) { const b = rig.pontoMundo('cabeca', [0, -0.2]); for (const a of [0, 0.4]) Noite.onda(ctx, b.x, b.y, 1000, api.fase(0.62 + a, 1.6 + a)); const qc = cam.p(0.2, 0, 4.2); Noite.fumaca(ctx, qc.x, qc.y, 1.3 * qc.s, api.fase(0.6, 2.4), { seed: 11, cor: '160,160,190', sobe: 0.25, largura: 2.2, n: 20 }); } },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(u - 0.62, 0.08) },
      });
    },
    // 16) o salto: borrão e o primeiro ladrão voando
    ataca(ctx, u, d, api) {
      const sal = api.ease.entra(cl((u - 0.15) / 0.45)), LX = -1.2 + 2.5 * sal, bate = 0.6, kb = u - bate;
      const yawF = (x) => chave(x, [[0, -0.15], [0.6, 0.2], [d, 0.25]]);
      const cam = camNoite(api, { f: 1050, x: 0, y: 1.0, z: 0.8, cy: 960, yaw: yawF(u) });
      const voa = cl(kb / 0.5);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(0), pose: kb > 0 ? 'caido' : 'faca', expressao: kb > 0 ? 'medo' : 'raiva' }, 1.4 + 1.2 * voa, 5.0, 1.85, { olhaPara: [LX, 5], luz: LUZ_LUA, y: Math.sin(voa * Math.PI) * 0.6 }), cor: kb > 0 && kb < 0.1 ? 'rgba(255,255,255,0.9)' : undefined },
        { f: () => api.personagem3d(cam, { ...LOBO, vista: 'perfil', pose: 'bote', expressao: 'rugido' }, LX, 5.0, 2.55, { luz: LUZ_LUA, y: Math.sin(sal * Math.PI) * 0.5 }) },
      ], {
        depois: () => { const q0 = cam.p(-1.2, 0, 5.0), q1 = cam.p(1.4, 0, 5.0); Noite.fumaca(ctx, q0.x, q0.y, 0.7 * q0.s, (u - 0.12) / 0.9, { seed: 3, cor: '170,165,190', sobe: 0.35, largura: 1.4 }); Noite.fumaca(ctx, q1.x, q1.y, 0.8 * q1.s, (u - bate) / 1.0, { seed: 5, cor: '170,165,190', sobe: 0.45 }); if (sal > 0.05 && sal < 0.95) Combate.velocidade(ctx, W / 2, H * 0.55, 0, 0.9, api.t); const q = cam.p(1.4, 1.0, 5.0); Combate.impacto(ctx, q.x, q.y, 220, kb, { rgb: '255,200,120' }); Combate.numero(ctx, q.x, q.y - 200, '42', kb, 'critico'); },
        fx: { zoom: soco(kb, 0.15), borrao: sal > 0.05 && sal < 0.95 ? [-60, 0] : [0, 0] },
      });
    },
    // 17) a luta continua: desvia da faca, arranca a corrente; o Davi carrega o raio com as luvas novas
    luta(ctx, u, d, api) {
      if (u < 1.7) {
        const cam = camNoite(api, { f: 1150, x: 0.4, y: 1.1, z: 2.2 + u * 0.2, cy: 920, yaw: 0.02 });
        const desvia = api.ease.entra(cl((u - 0.25) / 0.25)), arranca = u > 0.9;
        noite(ctx, api, cam, [
          { f: () => api.personagem3d(cam, { ...LADRAO(2), pose: 'faca', expressao: arranca ? 'medo' : 'raiva' }, 1.3, 5.2, 1.85, { olhaPara: [0, 5], luz: LUZ_LUA }) },
          { f: () => api.personagem3d(cam, { ...LOBO, pose: arranca ? 'rugindo' : 'garras', expressao: 'rugido' }, 0.2 - 0.4 * desvia, 5.0, 2.55, { luz: LUZ_LUA }) },
        ], {
          depois: ([rl]) => {
            const q = cam.p(0.9, 1.4, 5.1); Combate.corte(ctx, q.x, q.y, 160, -0.8, 1.6, (u - 0.2) / 0.2, { rgb: '255,200,200', espessura: 0.12 });
            if (rl && rl.pontoMundo) { const m = rl.pontoMundo('mao_e', [0, 0.25]); if (!arranca) corrente(ctx, [m.x, m.y], [m.x - 260, m.y + 40], api.t, 1); else { Combate.impacto(ctx, m.x - 130, m.y + 60, 160, u - 0.9, { rgb: '170,190,255', seed: 4 }); } }
            Combate.numero(ctx, 540, 520, 'ESQUIVA!', u - 0.45, 'esquiva');
          },
          fx: { zoom: soco(u - 0.9, 0.1) },
        });
      } else {
        const uu = u - 1.7, cam = api.orbita({ alvo: [-0.9, 1.15, 4.3], raio: chave(uu, [[0, 2.6], [d - 1.7, 1.9]]), ang: chave(uu, [[0, -1.9], [d - 1.7, -1.5]]), altura: 1.2, f: 1150, ySalvo: 960, nevoa: V().nevoa(1) });
        const kc = api.fase(1.7, d);
        noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'determinado' }, -0.9, 4.3, 1.76, { olhaPara: [1.7, 5.6], luz: { lado: 1, forca: 1, cor: 'rgb(130,200,255)', sombra: 0.8 } }) }], {
          magias: ([rig]) => [{ tipo: 'circulo', x: -0.9, z: 4.3, raio: 1.0, k: kc }, orbe(maoMundo(cam, rig, 'mao_d', -0.9, 4.3), 1), orbe(maoMundo(cam, rig, 'mao_e', -0.9, 4.3), 1)],
          depois: ([rig]) => { if (!rig || !rig.pontoMundo) return; const m = [rig.pontoMundo('mao_d', [0, 0.28]), rig.pontoMundo('mao_e', [0, 0.28])]; for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 30, api.t, 1); Combate.arcoEntre(ctx, [m[0].x, m[0].y], [m[1].x, m[1].y], api.t, 1); Combate.convergir(ctx, (m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2, 500, api.t, 1); },
        });
      }
    },
    // 18) gancho: o líder leva a mão por cima do ombro e saca a Lâmina Rubra das costas; luz vermelha no rosto
    lider(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1150, x: 0.45, y: 1.0, z: 4.2 + u * 0.3, cy: 1000, yaw: -0.03 });
      const pega = api.ease.entra(api.fase(0.2, 0.7)), ergue = api.ease.entra(api.fase(0.75, 1.35)), luz = api.fase(0.8, 1.8);
      const fora = ergue > 0.05;
      const pose = { braco_d: 12 + 150 * pega - 120 * ergue, antebraco_d: -10 - 140 * pega + 40 * ergue, mao_d: 0, braco_e: -12, antebraco_e: 8, coxa_d: 5, coxa_e: -5, cabeca: -4 * ergue, _maos: { d: pega > 0.6 ? 'punho' : 'relaxada' } };
      window.ESPADA_MAO = { t: api.t, ang: -0.25 + 0.25 * ergue, brilho: luz };
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...LIDER, opcoes: { lider: true, estilo: 'C', semEspada: fora, espadaNaMao: fora }, vista: 'frente', pose, expressao: 'raiva' }, 0.55, 6.4, 1.9, { luz: { lado: 1, forca: 0.3 + 0.5 * luz, cor: 'rgb(255,110,80)', sombra: 1 } }), cor: `rgba(160,30,30,${0.1 * luz})` }], {
        forca: 0.3,
        depois: ([rig]) => {
          if (!rig || !rig.pontoMundo) return;
          if (fora) { const m = rig.pontoMundo('mao_d', [0, 0.15]); Valdor.brilhoRadial(ctx, m.x, m.y - 200, 520 * luz, '255,80,60', 0.5 * luz); }
          const cab = rig.pontoMundo('cabeca', [0, -0.4]); Valdor.brilhoRadial(ctx, cab.x, cab.y + 40, 220 * luz, '255,80,60', 0.35 * luz);
        },
      });
    },
    // 19) a Lâmina Rubra (lendária); o Davi arregala os olhos
    conhecia(ctx, u, d, api) {
      if (u < d * 0.55) {
        ctx.fillStyle = '#10060A'; ctx.fillRect(0, 0, W, H);
        Valdor.brilhoRadial(ctx, 540, 900, 900, '255,70,50', 0.55);
        Combate.laminaRubra(ctx, 520, 1420, 1150 * (1 + u * 0.05), api.t, 0.12 - u * 0.04, { brilho: 1 });
        for (let i = 0; i < 4; i++) Valdor.estrela(ctx, 400 + i * 110, 700 + i * 120, 26 * (0.5 + 0.5 * Math.sin(api.t * 6 + i)), '#FFE0D0');
        Valdor.etiqueta(ctx, 540, 1600, 'LÂMINA RUBRA · LENDÁRIA', '#FFB070', api.fase(0.2, 0.5, 'volta'), { tam: 56 });
      } else {
        const cam = camNoite(api, { x: -0.2, y: 1.6, z: 0.4, cy: 820 }), uu = u - d * 0.55;
        const zoom = 1 + uu * 0.2, Hpx = 560 * zoom, item = { ...DAVIL, pose: 'parado', expressao: uu < 0.8 ? expr('espanto', { olhar: [0.018, -0.004] }) : expr('medo', { olhar: [0.01, 0] }) };
        noite(ctx, api, cam, [{ f: () => { const A = alturaH(item); return api.personagem(item, W * 0.5, 980 - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: { lado: 1, forca: 1, cor: 'rgb(255,110,80)', sombra: 1 } }); }, cor: 'rgba(160,30,30,0.1)' }], { desfoque: 10, forca: 0 });
        Valdor.brilhoRadial(ctx, 900, 1300, 600, '255,80,60', 0.4);
      }
    },
    // 20) cartela final
    parte(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0, y: 1.6, z: -0.5 + u * 0.2 });
      noite(ctx, api, cam, [], { desfoque: 14, forca: 0 });
      ctx.fillStyle = 'rgba(10,10,30,0.5)'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0, 0.35, 'volta');
      zoomEm(ctx, 540, 760, k, () => { api.texto('PARTE', 540, 680, 120); api.texto('2', 540, 850, 230, { cor: AMARELO }); });
      const k2 = api.fase(0.4, 0.75, 'volta');
      zoomEm(ctx, 540, 1130, k2, () => { api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 3', 540, 1190, 96, { cor: AMARELO }); });
      const k3 = api.fase(0.8, 1.1, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

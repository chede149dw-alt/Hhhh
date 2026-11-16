// VALDOR · Parte 3 — "A lâmina que rouba vida". Planos do roteiro roteiros/nova/ep03.json (luta detalhada: preparo, impacto, reação, marca no cenário).
// Ajudantes copiados da Parte 2 (cena 3D com personagens dentro, câmera de luta, cartas de loot, corrente).
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
    if (tipo === 'lamina') Combate.laminaRubra(ctx, 0, s * 0.42, s * 0.95, t, 0.35, { brilho: 1 });
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

  window.PLANOS = {
    // 1) gancho: a Lâmina Rubra girando no escuro, runas acendendo, fumaça vermelha
    capa(ctx, u, d, api) {
      const g = ctx.createRadialGradient(W / 2, H * 0.48, 50, W / 2, H * 0.48, H * 0.8); g.addColorStop(0, '#3A0A10'); g.addColorStop(1, '#07030A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      Valdor.brilhoRadial(ctx, 540, 1050, 760, VERMELHO, 0.35 + 0.1 * Math.sin(api.t * 3));
      Noite.fumaca(ctx, 540, 520, 260, (u * 0.35) % 1, { seed: 3, cor: '160,30,40', n: 14, sobe: 1.2, largura: 0.8 });
      Combate.laminaRubra(ctx, 540, 1560, 1150 * (1 + u * 0.03), api.t, Math.sin(u * 1.4) * 0.18, { brilho: Math.min(1, u * 0.8) });
      brasas(ctx, 540, 1500, 700, api.t, 0.8, 4);
      const k = api.fase(0, 0.35, 'volta');
      zoomEm(ctx, 540, 330, k, () => { api.texto('UMA ESPADA', 540, 260, 104); api.texto('QUE ROUBA VIDA', 540, 390, 96, { cor: '#FF6A5A' }); });
    },
    // 2) o líder avança num borrão vermelho (câmera baixa, rente às lajes)
    ataque(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1000, x: 2.3, y: 0.45, z: 4.4 + u * 0.2, cy: 1180, yaw: -0.62 });
      const k = api.ease.entra(cl((u - 0.35) / 0.9)), X = mix(1.6, 0.85, k), Z = mix(9.0, 6.6, k);
      espada(api, -1.2 + 0.4 * k, 1);
      const pose = { braco_d: 110, antebraco_d: -20, braco_e: -50, antebraco_e: -30, tronco: 14 * k, coxa_d: 30 * k, canela_d: -20 * k, coxa_e: -35 * k, canela_e: 30 * k, _maos: { d: 'punho' }, _plantar: true };
      const fant = [0.7, 0.45, 0.2].map((a, i) => ({ alfa: a * (k > 0.05 && k < 0.98 ? 0.6 : 0), f: () => api.personagem3d(cam, { ...LIDERM, pose, expressao: 'raiva' }, mix(1.6, 0.85, Math.max(0, k - 0.08 * (i + 1))), mix(9.0, 6.6, Math.max(0, k - 0.08 * (i + 1))), 1.9, { olhaPara: PT, luz: LUZ_RUBRA }), cor: `rgba(255,40,40,0.5)` }));
      noite(ctx, api, cam, [
        ...fant,
        { f: () => api.personagem3d(cam, { ...LIDERM, pose, expressao: 'raiva' }, X, Z, 1.9, { olhaPara: PT, luz: LUZ_RUBRA }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'garras', expressao: 'rugido' }, PT[0], PT[1], 2.55, { luz: LUZ_LUA }) },
      ], {
        luzes: [{ x: X, y: 1.4, z: Z, cor: '#FF4030', forca: 0.8, raio: 4 }],
        chaoEm: [1.6, 9.0], chao: () => sulcos(ctx, cam, 1.6, 9.0, X, Z, 0.12),
        depois: (rs) => {
          const q0 = cam.p(1.6, 0, 9.0); Noite.fumaca(ctx, q0.x, q0.y, 0.9 * q0.s, (u - 0.3) / 1.2, { seed: 2, cor: '150,140,160', sobe: 0.3, largura: 1.6 });
          if (k > 0.05 && k < 0.98) { const a = cam.p(1.6, 1.2, 9.0), b = cam.p(X, 1.2, Z); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round'; for (const [w, al] of [[60, 0.25], [24, 0.6], [8, 0.95]]) { ctx.strokeStyle = `rgba(${VERMELHO},${al})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } ctx.restore(); Combate.velocidade(ctx, b.x, b.y, Math.atan2(a.y - b.y, a.x - b.x), 0.8, api.t); }
        },
        fx: { borrao: k > 0.05 && k < 0.95 ? [-40, 0] : [0, 0] },
      });
    },
    // 3) o choque: lâmina nas garras, faíscas, onda na neblina, o Téo arrasta os pés
    choque(ctx, u, d, api) {
      const bate = 0.35, kb = u - bate, emp = api.ease.entra(cl(kb / 1.4)), [tx, ty] = api.tremor(kb > 0 && kb < 0.5 ? 10 : kb > 0 ? 2 : 0);
      const cam = api.orbita({ alvo: [0.55, 1.4, 6.0], raio: chave(u, [[0, 4.4], [d, 3.6]]), ang: chave(u, [[0, -1.35], [d, -1.1]]), altura: 1.3, f: 1050, ySalvo: 900, nevoa: V().nevoa(1) });
      const TZ = PT[1] - 0.6 * emp, LZ = 6.5 - 0.5 * emp;
      espada(api, kb < 0 ? -0.6 : 0.9, 1);
      const poseL = kb < 0 ? { braco_d: 150, antebraco_d: -40, braco_e: -40, tronco: -6, coxa_d: 10, coxa_e: -10, _maos: { d: 'punho' }, _plantar: true } : { braco_d: 70, antebraco_d: -30, braco_e: -30, tronco: 12, coxa_d: 25, canela_d: -10, coxa_e: -20, canela_e: 20, _maos: { d: 'punho' }, _plantar: true };
      const res = noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'garras', expressao: 'rugido' }, PT[0], TZ, 2.55, { olhaPara: [0.95, LZ], luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: poseL, expressao: 'raiva' }, 0.9, LZ, 1.9, { olhaPara: PT, luz: LUZ_RUBRA }) },
      ], {
        luzes: [{ x: 0.6, y: 1.6, z: 6.0, cor: '#FF9A50', forca: kb > 0 && kb < 0.3 ? 2 : 0.5, raio: 4 }],
        chaoEm: [PT[0], TZ], chao: () => { if (kb > 0) sulcos(ctx, cam, PT[0], PT[1], PT[0], TZ, 0.22); },
        depois: () => {
          const qc = cam.p(0.6, 1.65, (TZ + LZ) / 2);
          Combate.impacto(ctx, qc.x, qc.y, 260, kb, { rgb: LARANJA, dura: 0.6 });
          if (kb > 0) { Noite.faiscas(ctx, qc.x, qc.y, 120, 160, api.t, kb < 1.6 ? 1 : 0.3, 7, LARANJA); const qo = cam.p(0.6, 0.1, (TZ + LZ) / 2); Noite.onda(ctx, qo.x, qo.y, 900, cl(kb / 0.9)); }
          const qf = cam.p(PT[0], 0, TZ); if (kb > 0) Noite.fumaca(ctx, qf.x, qf.y, 0.8 * qf.s, (kb) / 1.6, { seed: 6, cor: '150,140,160', sobe: 0.25, largura: 1.8 });
          destrocos(ctx, cam, PT[0], 0.05, TZ, kb, { n: 14, forca: 1.6, tam: 0.05, seed: 3, cor: '#6E5A48' });
          flash(ctx, kb);
        },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(kb, 0.12) },
      });
    },
    // 4) o corte que rouba vida: fio de partículas vermelhas indo para a espada, barras mudando
    rouba(ctx, u, d, api) {
      const corte = 0.45, kc = u - corte, cam = camNoite(api, { f: 1050, x: 1.6, y: 1.25, z: 1.9 + u * 0.15, cy: 940, yaw: -0.18 });
      espada(api, kc < 0 ? -1.4 + u * 1.2 : 1.6, 1);
      const poseL = kc < 0 ? { braco_d: 120, antebraco_d: -60, tronco: -10, coxa_d: 8, coxa_e: -8, _maos: { d: 'punho' }, _plantar: true } : { braco_d: 40, antebraco_d: 30, tronco: 16, coxa_d: 20, canela_d: -8, coxa_e: -18, canela_e: 14, _maos: { d: 'punho' }, _plantar: true };
      const vt = 1 - 0.24 * cl(kc / 0.2), vl = 0.62 + 0.12 * cl((kc - 0.4) / 1.2);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LOBO, pose: kc > 0 && kc < 0.5 ? 'rugindo' : 'garras', expressao: 'rugido' }, 0.05, 5.0, 2.55, { olhaPara: [1.2, 5.9], luz: LUZ_LUA }), cor: kc > 0 && kc < 0.08 ? 'rgba(255,255,255,0.85)' : undefined },
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: poseL, expressao: 'raiva' }, 1.2, 5.9, 1.9, { olhaPara: [0.05, 5.0], luz: LUZ_RUBRA }) },
      ], {
        luzes: [{ x: 1.0, y: 1.5, z: 5.6, cor: '#FF4030', forca: 0.4 + 0.8 * cl(kc / 0.3), raio: 4 }],
        depois: ([rl, rt]) => {
          const ombro = rt && rt.pontoMundo ? rt.pontoMundo('braco_d', [0, 0.1]) : { x: 400, y: 900 }, lam = rl && rl.pontoMundo ? rl.pontoMundo('mao_d', [0, 0.2]) : { x: 700, y: 800 };
          Combate.corte(ctx, ombro.x, ombro.y, 170, -2.4, 0.4, kc / 0.25, { rgb: VERMELHO, espessura: 0.2 });
          Combate.numero(ctx, ombro.x, ombro.y - 140, '-58', kc, 'recebido');
          drenoVida(ctx, [ombro.x, ombro.y], [lam.x, lam.y - 120], api.t, cl((kc - 0.15) / 0.3) * (1 - cl((kc - 2.2) / 0.4)));
          Combate.numero(ctx, lam.x + 80, lam.y - 300, '+30', kc - 0.8, 'esquiva');
          flash(ctx, kc, 0.5);
        },
        fim: () => barras(ctx, api, [vt, 1 - 0.24 * cl((kc - 0.5) / 1)], [vl, vl], { tremorT: kc > 0 && kc < 0.4 ? 6 : 0 }),
        fx: { zoom: soco(kc, 0.08) },
      });
    },
    // 5) plano geral: três ladrões cercando o Davi; o Téo e o líder lutando ao fundo
    cerco(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [-1.6, 0.9, 5.0], raio: 4.6, ang: chave(u, [[0, 0.45], [d, 0.15]]), altura: 3.0, f: 1050, ySalvo: 1150, nevoa: V().nevoa(1) });
      const anda = api.ease.entra(api.fase(0, 2.2)), ap = (P, k) => [PD[0] + (P[0] - PD[0]) * (1.5 - 0.5 * k), PD[1] + (P[1] - PD[1]) * (1.5 - 0.5 * k)];
      const ladr = [LA, LB, LC].map((P) => ap(P, anda));
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'parado', expressao: 'medo' }, PD[0], PD[1], 1.76, { olhaPara: ladr[0], luz: LUZ_LUA }) },
        ...ladr.map(([x, z], i) => ({ f: () => api.personagem3d(cam, { ...LADRAO(i + 1), pose: i === 0 ? 'tocha' : 'faca', expressao: 'raiva' }, x, z, 1.85, { olhaPara: PD, luz: { lado: 1, forca: 0.8, cor: 'rgb(255,170,90)', sombra: 0.9 }, caminhar: anda < 1 ? api.t : undefined, semente: i }) })),
        { f: () => api.personagem3d(cam, { ...LOBO, pose: Math.sin(api.t * 5) > 0 ? 'garras' : 'rugindo', expressao: 'rugido' }, 0.6, 7.6, 2.55, { olhaPara: [1.3, 8.4], luz: LUZ_LUA }) },
        { f: () => { espada(api, Math.sin(api.t * 5) * 1.2, 1); return api.personagem3d(cam, { ...LIDERM, pose: { braco_d: 80 + 50 * Math.sin(api.t * 5), antebraco_d: -30, _maos: { d: 'punho' }, _plantar: true }, expressao: 'raiva' }, 1.3, 8.4, 1.9, { olhaPara: [0.6, 7.6], luz: LUZ_RUBRA }); } },
      ], {
        luzes: [{ x: ladr[0][0] + 0.3, y: 1.7, z: ladr[0][1], cor: '#FFB066', forca: 0.9 }],
        depois: (rs) => { tochaNaMao(ctx, rs[1], api.t, 2); ladr.forEach(([x, z], i) => { const q = cam.p(x, 2.15, z); Valdor.placaNivel(ctx, q.x, q.y, [12, 13, 14][i], api.fase(0.5 + i * 0.15, 0.8 + i * 0.15, 'volta'), { tam: 34, cor: '#FFB0B0' }); });
          const qd = cam.p(PD[0], 2.1, PD[1]); Combate.vidaCabeca(ctx, qd.x, qd.y, 0.6 * qd.s, 0.9, { mana: 0.85 });
          if (rs[0] && rs[0].pontoMundo) for (const m of ['mao_d', 'mao_e']) { const p = rs[0].pontoMundo(m, [0, 0.28]); Combate.maoEletrica(ctx, p.x, p.y, 18, api.t, api.fase(1.6, 2.2)); } },
      });
    },
    // 6) o Davi abre as mãos: círculo mágico 3D acende, faíscas sobem, vento girando
    maos(ctx, u, d, api) {
      const cam = api.orbita({ alvo: [PD[0], 1.15, PD[1]], raio: chave(u, [[0, 2.8], [d, 2.1]]), ang: chave(u, [[0, -2.1], [d, -1.55]]), altura: 1.15, f: 1150, ySalvo: 960, nevoa: V().nevoa(1) });
      const kc = api.fase(0.1, 1.4);
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: u < 1 ? 'determinado' : expr('raiva', { boca: { tipo: 'linha', curva: -0.2, largura: 0.07 } }) }, PD[0], PD[1], 1.76, { olhaPara: LA, luz: { lado: 1, forca: 1, cor: 'rgb(130,200,255)', sombra: 0.8 } }) }], {
        magias: ([rig]) => [{ tipo: 'circulo', x: PD[0], z: PD[1], raio: 1.0 + 0.2 * kc, k: kc }, orbe(maoMundo(cam, rig, 'mao_d', PD[0], PD[1]), kc), orbe(maoMundo(cam, rig, 'mao_e', PD[0], PD[1]), kc)],
        depois: ([rig]) => { if (!rig || !rig.pontoMundo) return; const m = [rig.pontoMundo('mao_d', [0, 0.28]), rig.pontoMundo('mao_e', [0, 0.28])]; for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 34, api.t, kc); Combate.arcoEntre(ctx, [m[0].x, m[0].y], [m[1].x, m[1].y], api.t, kc); Combate.convergir(ctx, (m[0].x + m[1].x) / 2, (m[0].y + m[1].y) / 2, 520, api.t, kc);
          const q = cam.p(PD[0], 0.2, PD[1]); destrocos(ctx, cam, PD[0], 0.2, PD[1], (u % 1.2) / 1.2 * 0.6, { n: 16, forca: 1.2, tam: 0.05, tipo: 'grama', cores: ['#4F8A3A', '#7FB050'], seed: Math.floor(u / 1.2) + 2 }); },
      });
    },
    // 7) raio em corrente: acerta o primeiro, pula para o segundo; corpos piscando em raio-X
    corrente(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1000, x: -0.2, y: 1.5, z: 2.3 + u * 0.1, cy: 900, yaw: -0.46 });
      const h1 = u - 0.25, h2 = u - 0.75, v1 = cl((h1 - 0.25) / 0.6), v2 = cl((h2 - 0.25) / 0.6);
      const A = [LA[0] - 0.9 * v1, LA[1] + 0.8 * v1], B = [LB[0] + 0.3 * v2, LB[1] + 1.1 * v2];
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(2), pose: v2 > 0.1 ? 'caido' : 'faca', expressao: h2 > 0 ? 'medo' : 'raiva' }, B[0], B[1], 1.85, { olhaPara: PD, luz: LUZ_LUA, y: Math.sin(v2 * Math.PI) * 0.5 }), cor: h2 > 0 && h2 < 0.25 ? 'rgba(170,220,255,0.6)' : undefined },
        { f: () => api.personagem3d(cam, { ...LADRAO(1), pose: v1 > 0.1 ? 'caido' : 'tocha', expressao: h1 > 0 ? 'medo' : 'raiva' }, A[0], A[1], 1.85, { olhaPara: PD, luz: { lado: 1, forca: 0.8, cor: 'rgb(255,170,90)', sombra: 0.9 }, y: Math.sin(v1 * Math.PI) * 0.5 }), cor: h1 > 0 && h1 < 0.25 ? 'rgba(170,220,255,0.6)' : undefined },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'determinado' }, PD[0], PD[1], 1.76, { rumo: Math.atan2(-(LA[0] - PD[0]), -(LA[1] - PD[1])), luz: { lado: 1, forca: 1, cor: 'rgb(130,200,255)', sombra: 0.8 } }) },
      ], {
        magias: (rs) => [orbe(maoMundo(cam, rs[2], 'mao_d', PD[0], PD[1]), 1), orbe(maoMundo(cam, rs[2], 'mao_e', PD[0], PD[1]), 1)],
        luzes: [{ x: A[0], y: 1.2, z: A[1], cor: '#7FC8FF', forca: h1 > 0 && h1 < 0.4 ? 1.8 : 0 }, { x: B[0], y: 1.2, z: B[1], cor: '#7FC8FF', forca: h2 > 0 && h2 < 0.4 ? 1.8 : 0 }],
        depois: ([rb, ra, rd]) => {
          if (!rd || !rd.pontoMundo) return;
          const m = rd.pontoMundo('mao_d', [0, 0.28]), qa = cam.p(A[0], 1.25, A[1]), qb = cam.p(B[0], 1.25, B[1]);
          if (h1 > 0 && h1 < 0.5) Combate.relampago(ctx, [m.x, m.y], [qa.x, qa.y], api.t, 1, { espessura: 1.5 });
          if (h2 > 0 && h2 < 0.5) Combate.relampago(ctx, [qa.x, qa.y], [qb.x, qb.y], api.t + 3, 1, { espessura: 1.2 });
          if (h1 > 0 && h1 < 0.5) { raioXCorpo(ctx, ra, api.t, 1); Combate.eletrocutado(ctx, qa.x, qa.y + 0.6 * qa.s, 0.8 * qa.s, 1.6 * qa.s, api.t, 1); }
          if (h2 > 0 && h2 < 0.5) { raioXCorpo(ctx, rb, api.t, 1); Combate.eletrocutado(ctx, qb.x, qb.y + 0.6 * qb.s, 0.8 * qb.s, 1.6 * qb.s, api.t, 1); }
          Combate.impacto(ctx, qa.x, qa.y, 200, h1, { rgb: AZUL }); Combate.impacto(ctx, qb.x, qb.y, 180, h2, { rgb: AZUL, seed: 5 });
          Combate.numero(ctx, qa.x, qa.y - 220, '-36', h1, 'normal'); Combate.numero(ctx, qb.x, qb.y - 220, '-41', h2, 'normal');
          // a tocha do primeiro cai e espalha brasa
          if (v1 > 0.3) { const qt = cam.p(A[0] + 0.5, 0.1, A[1] - 0.2); Noite.tocha(ctx, qt.x, qt.y, 0.4 * qt.s, api.t, { seed: 4, ang: 1.4 }); brasas(ctx, qt.x, qt.y, 0.8 * qt.s, api.t, 1, 9); }
          flash(ctx, h1, 0.6); flash(ctx, h2, 0.5);
        },
        fx: { zoom: Math.max(soco(h1, 0.08), soco(h2, 0.06)) },
      });
    },
    // 8) close em câmera lenta: a faca vem girando e o Davi desvia inclinando o corpo (sem agachar de pernas abertas)
    faca(ctx, u, d, api) {
      const lento = remap(u, [[0, 0], [0.5, 0.35], [d, 0.95]]); // segundos "do mundo"
      const cam = camNoite(api, { x: -1.0, y: 1.6, z: 2.6, cy: 820, yaw: -0.35 });
      const desvia = api.ease.suave(cl((lento - 0.3) / 0.35)), Hpx = 600 * (1 + u * 0.04);
      const item = { ...DAVIL, vista: 'tq', pose: { tronco: -16 * desvia, cabeca: -14 * desvia, quadril: -4 * desvia, braco_d: 25 + 35 * desvia, antebraco_d: 30, braco_e: -20 - 25 * desvia, antebraco_e: -30, coxa_d: 4, coxa_e: -4 }, expressao: expr('espanto', { olhar: [-0.02, 0] }) };
      const kf = cl(lento / 0.8), fx = mix(-160, 1240, kf), fy = mix(1000, 1060, kf) - Math.sin(kf * Math.PI) * 30 - 70 * desvia;
      noite(ctx, api, cam, [{ f: () => { const A = alturaH(item, 'tq'); return api.personagem(item, W * 0.68 + 60 * desvia, 1080 - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: LUZ_LUA }); } }], {
        desfoque: 12, forca: 0, t: api.t * 0.25,
        depois: ([rd]) => {
          if (kf > 0 && kf < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 1; i <= 5; i++) { ctx.globalAlpha = 0.12 * (6 - i) / 5; faca(ctx, fx - i * 50, fy, 150, lento * 14 - i * 0.25); } ctx.restore(); faca(ctx, fx, fy, 150, lento * 14); }
          if (lento > 0.45 && rd && rd.pontoMundo) { const c = rd.pontoMundo('cabeca', [0.3, -0.6]), f2 = lento - 0.45; ctx.save(); ctx.strokeStyle = '#1A1210'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < 2; i++) { const x = c.x + 40 + i * 34 + f2 * 120, y = c.y + f2 * 260 + Math.sin(f2 * 5 + i) * 16; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 24, y + 14, x + 8, y + 46); ctx.stroke(); } ctx.restore(); }
          Combate.numero(ctx, 560, 380, 'ESQUIVA!', u - 1.1, 'esquiva');
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(10,20,50,0.2)'; ctx.fillRect(0, 0, W, H); ctx.restore();
        },
      });
    },
    // 8b) close da mão: o braço ainda estendido para trás agarra a faca no ar e a eletrifica com a magia
    agarra(ctx, u, d, api) {
      const cam = camNoite(api, { x: -1.4, y: 1.5, z: 3.4, cy: 860, yaw: 0.9 });
      noite(ctx, api, cam, [], { desfoque: 18, forca: 0, t: api.t * 0.3 });
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(8,14,40,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      const pega = 0.9, kp = u - pega, fecha = cl(kp / 0.18), elet = cl((u - pega - 0.25) / 0.4);
      // a faca chega girando devagar (câmera lenta) até a mão
      const kf = cl(u / pega), fx = mix(1250, 610, api.ease.entra(kf)), fy = mix(700, 840, kf), ang = kp < 0 ? u * 7 : -0.5;
      // braço (manga) vindo de baixo à esquerda até o pulso
      const px = 470 + 30 * Math.sin(api.t * 1.5) * (1 - fecha), py = 1080;
      const aM = 0.35, kx = px + Math.sin(aM) * 300 * 0.95, ky = py - Math.cos(aM) * 300 * 0.95;
      if (kp < 0) faca(ctx, fx, fy, 500, ang); else faca(ctx, kx, ky, 520, aM - 0.15);
      Maos.desenhar(ctx, px, py, 300, { curl: [0.3 + 0.6 * fecha, 0.15 + 0.85 * fecha, 0.15 + 0.85 * fecha, 0.2 + 0.8 * fecha, 0.25 + 0.75 * fecha], abre: 0.6 * (1 - fecha), ang: 0.35, pele: 'azulArdosia', manga: 'azulArdosia', faixa: false, mangaLarg: 1.05, mangaComp: 8, luvaPunho: 'mostarda', semVincos: true });
      if (kp >= 0) Combate.impacto(ctx, px + 60, py - 200, 200, kp, { rgb: '255,240,220', dura: 0.35 });
      if (elet > 0) {
        const tip = [kx + Math.sin(aM - 0.15) * 520, ky - Math.cos(aM - 0.15) * 520];
        Valdor.brilhoRadial(ctx, (kx + tip[0]) / 2, (ky + tip[1]) / 2, 520 * elet, AZUL, 0.55 * elet);
        Combate.maoEletrica(ctx, px + 40, py - 60, 70, api.t, elet);
        for (let i = 0; i < 3; i++) Combate.relampago(ctx, [kx, ky + 40], [tip[0] + (i - 1) * 25, tip[1] + i * 15], api.t + i, elet, { espessura: 0.9 });
        Combate.eletrocutado(ctx, (kx + tip[0]) / 2, (ky + tip[1]) / 2 + 80, 200, 300, api.t, elet);
      }
      Combate.velocidade(ctx, 640, 860, Math.PI, kp < 0 ? 0.5 : 0, api.t);
    },
    // 8c) primeira pessoa: os olhos do Davi; o braço lança a faca eletrificada de volta e acerta o ladrão
    devolveu(ctx, u, d, api) {
      const solta = 0.55, ks = u - solta, voo = cl(ks / 0.45), bate = u - solta - 0.45, [tx, ty] = api.tremor(bate > 0 && bate < 0.4 ? 9 : ks > 0 && ks < 0.15 ? 5 : 0);
      const yaw = Math.atan2(LC[0] - PD[0], LC[1] - PD[1]);
      const cam = camNoite(api, { f: 1150, x: PD[0], y: 1.62, z: PD[1], cy: 900, yaw: yaw + 0.04 });
      const recua = cl(bate / 0.6), C = [LC[0] + (LC[0] - PD[0]) * 0.35 * recua, LC[1] + (LC[1] - PD[1]) * 0.35 * recua];
      const res = noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(3), pose: bate > 0.05 ? 'caido' : 'aponta', expressao: bate > 0 ? 'medo' : 'espanto' }, C[0], C[1], 1.85, { olhaPara: PD, luz: { lado: 1, forca: 0.9, cor: 'rgb(150,210,255)', sombra: 1 }, y: Math.sin(recua * Math.PI) * 0.45 }), cor: bate > 0 && bate < 0.12 ? 'rgba(200,235,255,0.8)' : undefined },
      ], {
        bokeh: 4,
        luzes: [{ x: mix(PD[0], C[0], voo), y: 1.4, z: mix(PD[1], C[1], voo), cor: '#7FC8FF', forca: ks > 0 && voo < 1 ? 1.4 : bate > 0 && bate < 0.4 ? 2 : 0, raio: 5 }],
        depois: ([rc]) => {
          const alvo = cam.p(C[0], 1.15, C[1]);
          // a faca voando com rastro elétrico, ficando pequena com a distância
          if (ks > 0 && voo < 1) { const x = mix(820, alvo.x, voo), y = mix(1380, alvo.y, voo), s = mix(420, 50, voo); Combate.relampago(ctx, [mix(820, alvo.x, Math.max(0, voo - 0.35)), mix(1380, alvo.y, Math.max(0, voo - 0.35))], [x, y], api.t, 1, { espessura: 1.1 }); Valdor.brilhoRadial(ctx, x, y, s * 2.2, AZUL, 0.6); faca(ctx, x, y, s, -0.9 + voo * 0.3); }
          if (bate > 0 && bate < 0.5) { raioXCorpo(ctx, rc, api.t, 1); Combate.eletrocutado(ctx, alvo.x, alvo.y + 0.5 * alvo.s, 0.9 * alvo.s, 1.7 * alvo.s, api.t, 1); }
          Combate.impacto(ctx, alvo.x, alvo.y, 240, bate, { rgb: AZUL }); Combate.numero(ctx, alvo.x, alvo.y - 260, '-48', bate, 'critico');
          // braço do Davi em primeira pessoa: puxa para trás e lança
          const kb = ks < 0 ? cl(u / solta) : 1, avanca = ks < 0 ? 0 : api.ease.entra(cl(ks / 0.2));
          const hx = ks < 0 ? mix(900, 1010, kb) : mix(1010, 640, avanca), hy = ks < 0 ? mix(1500, 1560, kb) : mix(1560, 1250, avanca), ang = ks < 0 ? 0.5 + 0.4 * kb : mix(0.9, -0.2, avanca);
          if (ks < 0) faca(ctx, hx + Math.sin(ang) * 290 * 0.95, hy - Math.cos(ang) * 290 * 0.95, 480, ang - 0.1);
          Maos.desenhar(ctx, hx, hy, 290, { curl: ks < 0 ? [0.85, 1, 1, 1, 1] : [0.25, 0.1 * (1 - avanca), 0.1, 0.15, 0.2], abre: ks < 0 ? 0 : 0.5 * avanca, ang, pele: 'azulArdosia', manga: 'azulArdosia', faixa: false, mangaLarg: 1.05, mangaComp: 8, luvaPunho: 'mostarda', semVincos: true });
          if (ks < 0) { const bx = hx + Math.sin(ang) * 290 * 0.95, by = hy - Math.cos(ang) * 290 * 0.95, tx2 = bx + Math.sin(ang - 0.1) * 480, ty2 = by - Math.cos(ang - 0.1) * 480; Combate.maoEletrica(ctx, bx, by + 30, 70, api.t, 1); Combate.relampago(ctx, [bx, by + 20], [tx2, ty2], api.t, 0.9, { espessura: 0.8 }); Valdor.brilhoRadial(ctx, (bx + tx2) / 2, (by + ty2) / 2, 380, AZUL, 0.5); }
          if (ks > 0 && ks < 0.2) Combate.velocidade(ctx, 700, 1200, -2.4, 0.8, api.t);
          flash(ctx, bate, 0.6);
        },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(bate, 0.08) },
      });
    },
    // 9) o Téo arranca a corrente e gira o ladrão no ar
    puxa(ctx, u, d, api) {
      const T0 = [0.6, 8.0], gira = cl((u - 0.9) / (d - 0.9)), ang = gira * TAU * 2;
      const cam = api.orbita({ alvo: [T0[0], 1.2, T0[1]], raio: 3.6, ang: -0.35 + gira * 1.4, altura: 1.3, f: 1050, ySalvo: 960, nevoa: V().nevoa(1) });
      const E = u < 0.9 ? [-0.8 + 0.5 * cl((u - 0.5) / 0.4), 8.7] : [T0[0] + Math.cos(ang + Math.PI) * 1.4, T0[1] + Math.sin(ang + Math.PI) * 1.4];
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(0), pose: u < 0.9 ? 'faca' : 'caido', expressao: u < 0.9 ? 'raiva' : 'medo' }, E[0], E[1], 1.85, { olhaPara: T0, luz: LUZ_LUA, y: u < 0.9 ? 0 : 0.7 + 0.2 * Math.sin(ang) }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: u < 0.9 ? 'garras' : 'rugindo', expressao: 'rugido' }, T0[0], T0[1], 2.55, { olhaPara: E, luz: LUZ_LUA }) },
      ], {
        depois: ([re, rt]) => { if (!re || !rt || !re.pontoMundo || !rt.pontoMundo) return; const a = re.pontoMundo('mao_d', [0, 0.25]), b = rt.pontoMundo('mao_e', [0, 0.2]); corrente(ctx, [a.x, a.y], [b.x, b.y], api.t, api.fase(0.15, 0.4), 14); if (u > 0.9) Combate.velocidade(ctx, W / 2, H * 0.5, ang, 0.7, api.t); const qf = cam.p(T0[0], 0, T0[1]); Noite.fumaca(ctx, qf.x, qf.y, 1.0 * qf.s, (u - 0.9) / 1.6, { seed: 8, cor: '150,140,160', sobe: 0.2, largura: 2 }); },
        fx: { borrao: u > 0.9 ? [-50, 0] : [0, 0], rolo: u > 0.9 ? 0.04 * Math.sin(u * 6) : 0 },
      });
    },
    // 10) ...e joga no muro: tijolos explodindo, poeira, CRÍTICO
    muro(ctx, u, d, api) {
      const WX = -1.35, WZ = 11.3, bate = 0.4, kb = u - bate, voo = cl(u / bate), [tx, ty] = api.tremor(kb > 0 && kb < 0.6 ? 12 : 0);
      const cam = camNoite(api, { f: 1000, x: 2.0, y: 1.35, z: 5.6 + u * 0.12, cy: 920, yaw: -0.5 });
      const EX = mix(0.3, WX + 0.4, voo), EZ = mix(8.4, WZ - 0.3, voo), EY = kb < 0 ? 1.0 + Math.sin(voo * Math.PI) * 0.4 : 0;
      noite(ctx, api, cam, [
        { alfa: kb > 0.15 ? Math.max(0, 1 - (kb - 0.15) / 0.3) * 0.0 + (kb > 0.9 ? 0.7 : 0.15) : 1, f: () => api.personagem3d(cam, { ...LADRAO(0), pose: 'caido', expressao: 'medo' }, EX, EZ, 1.85, { olhaPara: [0, 8], luz: LUZ_LUA, y: EY }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: 'rugindo', expressao: 'rugido' }, 1.1, 8.0, 2.55, { olhaPara: [WX, WZ], luz: LUZ_LUA }) },
      ], {
        depois: () => {
          const q = cam.p(WX, 0.7, WZ);
          destrocos(ctx, cam, WX, 0.6, WZ, kb, { n: 26, forca: 3.2, tam: 0.11, tipo: 'tijolo', cores: ['#9A6A52', '#8A5A44', '#A47A60', '#7A4E3A'], dirX: 0.5, dirZ: -0.6, seed: 5 });
          Noite.fumaca(ctx, q.x, q.y + 0.3 * q.s, 1.6 * q.s, kb / 2.2, { seed: 9, cor: '170,155,145', n: 26, sobe: 0.5, largura: 1.6 });
          Combate.impacto(ctx, q.x, q.y, 300, kb, { rgb: '255,220,180', dura: 0.6 });
          Combate.numero(ctx, q.x, q.y - 330, '-75', kb, 'critico');
          if (kb < 0 && voo > 0.1) Combate.velocidade(ctx, q.x, q.y, Math.atan2(0, -1), 0.7, api.t);
          flash(ctx, kb, 0.7);
        },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(kb, 0.15) },
      });
    },
    // 11) o duelo: três golpes, cada um num ângulo, com chicote de câmera
    duelo(ctx, u, d, api) {
      const seg = d / 3, i = Math.min(2, Math.floor(u / seg)), uu = u - i * seg, chic = uu < 0.12 ? (1 - uu / 0.12) : 0;
      const cams = [{ x: -0.6, y: 0.6, z: 3.6, yaw: 0.22, cy: 1150 }, { x: 2.4, y: 1.2, z: 4.6, yaw: -0.55, cy: 920 }, { x: 0.9, y: 1.1, z: 2.5, yaw: -0.08, cy: 960 }];
      const cam = camNoite(api, { f: 1100, ...cams[i], z: cams[i].z + uu * 0.15 });
      const g = cl((uu - 0.25) / 0.2);
      let TP = [0.2, 5.6], LP = [0.9, 6.7], poseL, angE, poseT = 'garras', ty = 0;
      if (i === 0) { TP = [0.2 - 0.6 * g, 5.6]; poseL = g < 0.01 ? { braco_d: 160, antebraco_d: -30, tronco: -8, _maos: { d: 'punho' }, _plantar: true } : { braco_d: 30, antebraco_d: 20, tronco: 20, coxa_d: 25, canela_d: -10, coxa_e: -20, _maos: { d: 'punho' }, _plantar: true }; angE = g < 0.01 ? -0.5 : 2.6; }
      if (i === 1) { TP = [0.2 - 0.6, 5.6 - 0.7 * g]; ty = Math.sin(g * Math.PI) * 0.45; poseL = { braco_d: 95, antebraco_d: g < 0.01 ? -60 : 10, tronco: g < 0.01 ? -14 : 14, _maos: { d: 'punho' }, _plantar: true }; angE = g < 0.01 ? -1.6 : 1.5; poseT = 'bote'; }
      if (i === 2) { TP = [-0.1, 5.0 + 0.4 * g]; LP = [0.9 + 0.35 * cl((uu - 0.35) / 0.4), 6.7 + 0.4 * cl((uu - 0.35) / 0.4)]; poseL = { braco_d: 40, antebraco_d: -40, tronco: -16 * g, _maos: { d: 'punho' }, _plantar: true }; angE = 0.4; poseT = g > 0 ? 'rugindo' : 'garras'; }
      espada(api, angE, 1);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: poseL, expressao: 'raiva' }, LP[0], LP[1], 1.9, { olhaPara: TP, luz: LUZ_RUBRA }), cor: i === 2 && g > 0 && g < 0.4 ? 'rgba(255,255,255,0.7)' : undefined },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: poseT, expressao: 'rugido' }, TP[0], TP[1], 2.55, { olhaPara: LP, luz: LUZ_LUA, y: ty }) },
      ], {
        luzes: [{ x: LP[0], y: 1.4, z: LP[1], cor: '#FF4030', forca: 0.7, raio: 4 }],
        chaoEm: [0.3, 5.7], chao: () => { if (i >= 0 && (i > 0 || g > 0)) rachadura(ctx, cam, 0.25, 5.75, 0.7, i > 0 ? 1 : g, 4); },
        depois: ([rl, rt]) => {
          const lam = rl && rl.pontoMundo ? rl.pontoMundo('mao_d', [0, 0.2]) : { x: 600, y: 800 };
          if (i === 0) { Combate.corte(ctx, lam.x - 60, lam.y + 40, 260, -1.9, 0.5, g * 1.3, { rgb: VERMELHO, espessura: 0.18 }); destrocos(ctx, cam, 0.25, 0.08, 5.75, uu - 0.4, { n: 16, forca: 2, tam: 0.06, seed: 7 }); const qs = cam.p(0.25, 0.1, 5.75); if (g > 0) Noite.faiscas(ctx, qs.x, qs.y, 80, 60, api.t, cl(1 - (uu - 0.45) / 0.4), 3, LARANJA); }
          if (i === 1) { Combate.corte(ctx, lam.x, lam.y, 300, -3.0, 0.1, g * 1.3, { rgb: VERMELHO, espessura: 0.14 }); destrocos(ctx, cam, 0.0, 0.25, 5.3, uu - 0.4, { n: 30, forca: 1.6, tam: 0.07, tipo: 'grama', cores: ['#4F8A3A', '#7FB050'], seed: 11 }); }
          if (i === 2 && rt && rt.pontoMundo) { const c = rl.pontoMundo('tronco', [0, 0.4]); Combate.garras(ctx, c.x, c.y, 220, g * 1.2); Combate.numero(ctx, c.x, c.y - 240, '64', uu - 0.4, 'critico'); Combate.impacto(ctx, c.x, c.y, 220, uu - 0.4, { rgb: '255,230,200' }); flash(ctx, uu - 0.4, 0.6); }
        },
        fx: { borrao: chic > 0 ? [(i === 1 ? 80 : -80) * chic, 0] : [0, 0], zoom: soco(uu - 0.42, 0.1) },
      });
    },
    // 12) a espada devolve a vida para o líder
    devolve(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1200, x: 1.5, y: 1.55, z: 4.9 + u * 0.12, cy: 860, yaw: -0.12 });
      const gira = u * 4, vl = 0.7 + 0.2 * cl((u - 0.5) / 1.4);
      espada(api, Math.sin(gira) * 1.4 + 0.2, 1.3);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: { braco_d: 55 + 20 * Math.sin(gira), antebraco_d: -70, braco_e: -18, coxa_d: 6, coxa_e: -6, _maos: { d: 'punho' }, _plantar: true }, expressao: expr('raiva', { palpebra: 0.45 }) }, 1.35, 7.0, 1.9, { olhaPara: [0.2, 5.6], luz: LUZ_RUBRA }) },
      ], {
        luzes: [{ x: 1.35, y: 1.6, z: 6.8, cor: '#FF3020', forca: 1.2, raio: 4 }],
        depois: ([rl]) => { if (!rl || !rl.pontoMundo) return; const lam = rl.pontoMundo('mao_d', [0, 0.2]); drenoVida(ctx, [-120, 1100], [lam.x, lam.y - 140], api.t, cl(u / 0.3) * (1 - cl((u - 2.2) / 0.4)), 30); Valdor.brilhoRadial(ctx, lam.x, lam.y - 200, 300, VERMELHO, 0.4); Combate.numero(ctx, lam.x + 140, lam.y - 380, '+40', u - 0.6, 'esquiva'); },
        fim: () => barras(ctx, api, [0.46, 0.46], [vl, vl]),
      });
    },
    // 13) o Téo cai de joelho: vapor no frio, vida piscando, o líder riscando a laje
    joelho(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1000, x: -2.6, y: 0.8, z: 3.9 + u * 0.08, cy: 1080, yaw: 1.0 });
      const anda = cl(u / d), LP = [1.6 - 0.8 * anda, 7.6 - 1.0 * anda], bat = Math.max(0, Math.sin(api.t * 9)) ** 6;
      espada(api, 2.8, 1);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: { braco_d: 20, antebraco_d: 15, braco_e: -10, coxa_d: 0, coxa_e: 0, _maos: { d: 'punho' }, _plantar: true }, expressao: 'raiva', caminhar: undefined }, LP[0], LP[1], 1.9, { olhaPara: [0.1, 5.2], luz: LUZ_RUBRA, caminhar: api.t * 0.6 }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { coxa_d: -75, canela_d: 105, coxa_e: 30, canela_e: 40, tronco: 22, cabeca: 10, braco_d: 20, antebraco_d: 40, braco_e: -30, antebraco_e: -20, _desloca: [0, 0.9] }, expressao: 'rugido' }, 0.1, 5.2, 2.55, { olhaPara: LP, luz: LUZ_LUA }) },
      ], {
        chaoEm: [LP[0], LP[1]], chao: () => { const a = cam.p(1.5, 0.08, 7.5), b = cam.p(LP[0] + 0.25, 0.08, LP[1] - 0.15); ctx.save(); ctx.strokeStyle = 'rgba(255,140,90,0.75)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore(); },
        depois: ([rl, rt]) => {
          const b = cam.p(LP[0] + 0.25, 0.08, LP[1] - 0.15); Noite.faiscas(ctx, b.x, b.y, 50, 50, api.t, 1, 5, LARANJA);
          if (rt && rt.pontoMundo) { const m = rt.pontoMundo('cabeca', [0.3, 0.1]); vapor(ctx, m.x, m.y, 120, api.t); }
          Combate.vinhetaDano(ctx, 0.35 + 0.5 * bat);
        },
        fim: () => barras(ctx, api, [0.12, 0.12], [0.92, 0.92], { tremorT: 2 + 4 * bat }),
      });
    },
    // 14) o Davi corre e manda o raio mais forte
    raio(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1050, x: -2.3, y: 1.4, z: 2.0 + u * 0.2, cy: 900, yaw: 0.28 });
      const corre = cl(u / 1.0), DP = [mix(-2.2, -1.2, corre), mix(3.4, 4.4, corre)], disp = u - 1.2;
      espada(api, 0.4, 1);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: { braco_d: 40, antebraco_d: -40, _maos: { d: 'punho' }, _plantar: true }, expressao: 'raiva' }, 0.9, 6.4, 1.9, { olhaPara: DP, luz: LUZ_RUBRA }) },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: disp > 0 ? 'conjurando' : 'parado', expressao: 'raiva' }, DP[0], DP[1], 1.76, { olhaPara: [0.9, 6.4], luz: { lado: 1, forca: 1, cor: 'rgb(130,200,255)', sombra: 0.8 }, caminhar: corre < 1 ? api.t : undefined }) },
      ], {
        magias: (rs) => [orbe(maoMundo(cam, rs[1], 'mao_d', DP[0], DP[1]), 1), { tipo: 'circulo', x: DP[0], z: DP[1], raio: 0.9, k: cl(disp / 0.3) }],
        depois: ([rl, rd]) => { if (!rd || !rd.pontoMundo || disp < 0) return; const m = rd.pontoMundo('mao_d', [0, 0.28]), q = cam.p(0.9, 1.5, 6.4); Combate.relampago(ctx, [m.x, m.y], [q.x, q.y], api.t, 1, { espessura: 2.6 }); Combate.maoEletrica(ctx, m.x, m.y, 40, api.t, 1); flash(ctx, disp, 0.4); },
        fx: { zoom: soco(disp, 0.06) },
      });
    },
    // 15) o líder bloqueia com a espada: o raio se espalha em galhos pelo chão e queima a grama
    bloqueia(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1150, x: 0.4, y: 1.2, z: 3.9 + u * 0.12, cy: 950, yaw: 0.06 });
      const ativo = u < 1.6;
      espada(api, -0.2, 2);
      const galhos = [[-0.4, 5.6], [0.3, 5.3], [1.6, 5.5], [2.0, 6.2], [-0.2, 6.8]];
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...LIDERM, pose: { braco_d: 75, antebraco_d: -95, braco_e: -30, antebraco_e: -40, coxa_d: 15, canela_d: -6, coxa_e: -15, canela_e: 6, _maos: { d: 'punho' }, _plantar: true }, expressao: 'raiva' }, 0.9, 6.4, 1.9, { olhaPara: PD, luz: { lado: 1, forca: 0.9, cor: 'rgb(150,200,255)', sombra: 1 } }) }], {
        luzes: [{ x: 0.9, y: 2.0, z: 6.2, cor: '#8FD0FF', forca: ativo ? 2 : 0.2, raio: 6 }],
        chaoEm: [0.9, 6.5], chao: () => { ctx.save(); ctx.lineCap = 'round'; for (const [x, z] of galhos) { const a = cam.p(0.9, 0.03, 6.3), b = cam.p(mix(0.9, x, cl(u / 0.4)), 0.03, mix(6.3, z, cl(u / 0.4))); ctx.strokeStyle = 'rgba(20,12,10,0.85)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.strokeStyle = 'rgba(255,140,60,0.7)'; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore(); },
        depois: ([rl]) => {
          if (!rl || !rl.pontoMundo) return; const lam = rl.pontoMundo('mao_d', [0, -0.6]);
          if (ativo) { Combate.relampago(ctx, [-200, 900], [lam.x, lam.y], api.t, 1, { espessura: 2.2 }); for (const [x, z] of galhos) { const q = cam.p(x, 0.05, z); Combate.relampago(ctx, [lam.x, lam.y], [q.x, q.y], api.t + x, 0.8, { espessura: 0.8 }); } Valdor.brilhoRadial(ctx, lam.x, lam.y, 260, '255,90,60', 0.6); }
          for (const [x, z] of galhos) { const q = cam.p(x, 0.05, z); brasas(ctx, q.x, q.y, 0.5 * q.s, api.t, 0.7, x * 10); }
          Valdor.etiqueta(ctx, 540, 420, 'BLOQUEADO', '#FF8A7A', api.fase(0.25, 0.55, 'volta'), { tam: 64 });
          Combate.hud(ctx, 40, 150, 'DAVI', 5, 0.9, 0.9, { max: 180, w: 300, corRetrato: '#4B5D7A', t: api.t });
          ctx.save(); ctx.fillStyle = 'rgba(10,14,30,0.8)'; ctx.beginPath(); ctx.roundRect(190, 236, 300, 18, 9); ctx.fill(); ctx.fillStyle = '#4FA8FF'; ctx.beginPath(); ctx.roundRect(190, 236, 300 * Math.max(0.02, 1 - cl(u / 1.4)), 18, 9); ctx.fill(); ctx.font = '800 22px Inter'; ctx.fillStyle = '#CFE6FF'; ctx.fillText('MANA', 120, 252); ctx.restore();
        },
      });
    },
    // 16) close do Davi: os olhos vão da espada para as próprias luvas
    metal(ctx, u, d, api) {
      const cam = camNoite(api, { x: -1.4, y: 1.6, z: 2.2, cy: 820, yaw: 0.2 });
      const olho = u < 1.0 ? [0.02, -0.004] : [0.004, 0.018], Hpx = 560 * (1 + u * 0.05), item = { ...DAVIL, pose: { braco_d: 50, antebraco_d: 95, braco_e: -50, antebraco_e: -95, _magia: 0.4 }, expressao: expr(u < 1.6 ? 'espanto' : 'determinado', { olhar: olho }) };
      noite(ctx, api, cam, [{ f: () => { const A = alturaH(item); return api.personagem(item, W * 0.5, 980 - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: { lado: 1, forca: 0.8, cor: 'rgb(130,200,255)', sombra: 0.9 } }); } }], {
        desfoque: 10, forca: 0,
        depois: () => { Valdor.brilhoRadial(ctx, 180, 760, 360, '255,80,60', 0.35); },
      });
    },
    // 17) raio-X: no ar, a eletricidade quase não anda
    caminho(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t);
      ctx.save();
      for (let i = 0; i < 46; i++) { const x = 120 + rnd(i) * 840 + Math.sin(api.t + i) * 12, y = 560 + rnd(i * 3) * 820 + Math.cos(api.t * 0.8 + i) * 12; ctx.strokeStyle = 'rgba(127,230,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 22, y, 10, 0, TAU); ctx.stroke(); }
      ctx.restore();
      const k = (u * 0.6) % 1, xe = 120 + 300 * Math.min(1, k * 1.5);
      Combate.relampago(ctx, [80, 960], [xe, 960 + Math.sin(api.t * 9) * 40], api.t, 0.7 + 0.3 * Math.sin(api.t * 13), { espessura: 0.8 });
      Valdor.etiqueta(ctx, 540, 1500, 'AR', '#FFFFFF', api.fase(0.3, 0.6, 'volta'), { tam: 70 });
      api.texto('O CAMINHO MAIS FÁCIL', 540, 400, 80, { cor: '#7FE6FF' });
    },
    // 18) raio-X: no metal os elétrons livres levam o raio num instante; para-raio
    solta(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t);
      // metade de cima: ar (raio travando)
      ctx.save(); for (let i = 0; i < 18; i++) { const x = 140 + rnd(i) * 800, y = 500 + rnd(i * 3) * 300; ctx.strokeStyle = 'rgba(127,230,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.stroke(); } ctx.restore();
      Combate.relampago(ctx, [80, 650], [80 + 240 * (0.6 + 0.4 * Math.sin(api.t * 7)), 650], api.t, 0.6, { espessura: 0.6 });
      Valdor.etiqueta(ctx, 900, 840, 'AR', '#FFFFFF', 1, { tam: 44 });
      // metade de baixo: metal (grade de átomos + elétrons livres correndo)
      ctx.save(); ctx.fillStyle = 'rgba(255,120,100,0.12)'; ctx.fillRect(60, 1000, 960, 520);
      for (let gx = 0; gx < 9; gx++) for (let gy = 0; gy < 4; gy++) { const x = 130 + gx * 105, y = 1080 + gy * 120; ctx.fillStyle = 'rgba(255,170,150,0.55)'; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 60; i++) { const v = api.fase(0.5, 0.8) * 3 + 0.3, x = 80 + ((rnd(i) * 960 + api.t * 380 * v) % 960), y = 1040 + rnd(i * 7) * 460 + Math.sin(api.t * 6 + i) * 10; const g = ctx.createRadialGradient(x, y, 0, x, y, 14); g.addColorStop(0, 'rgba(240,255,255,1)'); g.addColorStop(1, 'rgba(127,230,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); }
      ctx.restore();
      if (u > 0.6) Combate.relampago(ctx, [60, 1260], [1020, 1260], api.t, 1, { espessura: 1.2 });
      Valdor.etiqueta(ctx, 540, 1600, 'ELÉTRONS LIVRES', '#FFE680', api.fase(0.7, 1.0, 'volta'), { tam: 54 });
      Valdor.etiqueta(ctx, 540, 1720, 'POR ISSO PARA-RAIO É DE METAL', '#FFFFFF', api.fase(1.6, 1.9, 'volta'), { tam: 40 });
    },
    // 19) o plano: o Téo crava a lâmina na laje; o Davi carrega o círculo enorme
    plano(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1000, x: -2.6, y: 1.5, z: 2.2 + u * 0.1, cy: 900, yaw: 0.36 });
      const crava = api.ease.entra(cl((u - 0.6) / 0.35)), kc = api.fase(0, 1.2);
      espada(api, mix(-0.7, 2.9, crava), 1.2);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, pose: crava < 0.05 ? { braco_d: 160, antebraco_d: -30, tronco: -8, _maos: { d: 'punho' }, _plantar: true } : { braco_d: 35, antebraco_d: 25, tronco: 26, coxa_d: 28, canela_d: -12, coxa_e: -22, _maos: { d: 'punho' }, _plantar: true }, expressao: crava > 0 ? 'medo' : 'raiva' }, 0.75, 6.3, 1.9, { olhaPara: [0.2, 5.6], luz: LUZ_RUBRA }) },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { coxa_d: -60, canela_d: 90, coxa_e: 20, canela_e: 30, tronco: 10, braco_d: 100 * crava + 20, antebraco_d: -20, braco_e: 60, antebraco_e: 40, _desloca: [0, 0.6] }, expressao: 'rugido' }, 0.2, 5.6, 2.55, { olhaPara: [0.75, 6.3], luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'raiva' }, -1.6, 3.6, 1.76, { olhaPara: [0.75, 6.3], luz: { lado: 1, forca: 1, cor: 'rgb(140,210,255)', sombra: 0.8 } }) },
      ], {
        magias: (rs) => [{ tipo: 'circulo', x: -1.6, z: 3.6, raio: 1.9, k: kc }, orbe(maoMundo(cam, rs[2], 'mao_d', -1.6, 3.6), kc), orbe(maoMundo(cam, rs[2], 'mao_e', -1.6, 3.6), kc)],
        chaoEm: [0.75, 6.0], chao: () => rachadura(ctx, cam, 0.7, 6.0, 0.6, crava, 9),
        depois: ([rl, rt, rd]) => { if (rd && rd.pontoMundo) { const m = [rd.pontoMundo('mao_d', [0, 0.28]), rd.pontoMundo('mao_e', [0, 0.28])]; for (const p of m) Combate.maoEletrica(ctx, p.x, p.y, 44, api.t, kc); Combate.arcoEntre(ctx, [m[0].x, m[0].y], [m[1].x, m[1].y], api.t, kc); }
          const qd = cam.p(-1.6, 0.4, 3.6); destrocos(ctx, cam, -1.6, 0.3, 3.6, (u % 1.0) * 0.7, { n: 20, forca: 1.4, tam: 0.05, tipo: 'grama', cores: ['#4F8A3A', '#7FB050'], seed: Math.floor(u) + 4 }); brasas(ctx, qd.x, qd.y, 0.9 * qd.s, api.t, kc, 3);
          const qs = cam.p(0.7, 0.1, 6.0); if (crava > 0.95) Noite.faiscas(ctx, qs.x, qs.y, 70, 50, api.t, cl(1 - (u - 0.95) / 0.5), 6, LARANJA); },
      });
    },
    // 20) golpe final: tempo parado com a câmera girando, o raio desce pela espada e atravessa o líder
    final(ctx, u, d, api) {
      const parado = 1.0, kf = u - parado, ang = chave(u, [[0, -0.7], [parado, -0.2], [d, 0.1]]);
      const cam = api.orbita({ alvo: [0.4, 1.2, 6.0], raio: chave(u, [[0, 3.8], [d, 3.2]]), ang, altura: 1.25, f: 1050, ySalvo: 960, nevoa: V().nevoa(1) });
      const voa = cl((kf - 0.35) / 0.6), LP = [0.75 + 1.4 * voa, 6.3 + 1.6 * voa];
      espada(api, 2.9, 1.5);
      const tcena = u < parado ? api.t - u : api.t;
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LIDERM, opcoes: { lider: true, estilo: 'C', semEspada: true, espadaNaMao: kf < 0.35 }, pose: kf < 0.35 ? { braco_d: 35, antebraco_d: 25, tronco: 26, coxa_d: 28, canela_d: -12, coxa_e: -22, _maos: { d: 'punho' }, _plantar: true } : 'caido', expressao: 'medo' }, LP[0], LP[1], 1.9, { olhaPara: [0.2, 5.6], luz: LUZ_RUBRA, y: Math.sin(voa * Math.PI) * 0.6 }), cor: kf > 0.1 && kf < 0.45 && Math.sin(api.t * 50) > 0 ? 'rgba(170,220,255,0.7)' : undefined },
        { f: () => api.personagem3d(cam, { ...LOBO, pose: { coxa_d: -60, canela_d: 90, coxa_e: 20, canela_e: 30, tronco: 10, braco_d: 120, antebraco_d: -20, braco_e: 60, antebraco_e: 40, _desloca: [0, 0.6] }, expressao: 'rugido' }, 0.2, 5.6, 2.55, { olhaPara: LP, luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'conjurando', expressao: 'raiva' }, -1.6, 3.6, 1.76, { olhaPara: [0.75, 6.3], luz: { lado: 1, forca: 1, cor: 'rgb(140,210,255)', sombra: 0.8 } }) },
      ], {
        t: tcena,
        magias: (rs) => [{ tipo: 'circulo', x: -1.6, z: 3.6, raio: 1.9, k: 1 }],
        luzes: [{ x: 0.7, y: 1.2, z: 6.1, cor: '#BFE6FF', forca: kf > 0 && kf < 0.5 ? 2.4 : 0, raio: 7 }],
        chaoEm: [0.75, 6.0], chao: () => rachadura(ctx, cam, 0.7, 6.0, 0.6, 1, 9),
        depois: ([rl, rt, rd]) => {
          // folhas e brasas paradas no ar enquanto o tempo está parado
          ctx.save(); for (let i = 0; i < 24; i++) { const X = -2.5 + rnd(i) * 4, Y = 0.3 + rnd(i * 3) * 2, Z = 3.5 + rnd(i * 7) * 4, q = cam.p(X + (u > parado ? kf * 0.5 : 0), Y + (u > parado ? kf * 0.3 : 0), Z); if (q.dz < 0.5) continue; ctx.fillStyle = i % 3 ? 'rgba(255,160,80,0.9)' : '#5E8A3A'; ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.03 * q.s, 0.015 * q.s, i, 0, TAU); ctx.fill(); } ctx.restore();
          const ponta = cam.p(0.72, 0.05, 6.0), cabo = cam.p(0.78, 0.9, 6.05);
          if (kf > 0 && kf < 0.55 && rd && rd.pontoMundo) { const m = rd.pontoMundo('mao_d', [0, 0.28]); Combate.relampago(ctx, [m.x, m.y], [cabo.x, cabo.y], api.t, 1, { espessura: 3 }); Combate.relampago(ctx, [cabo.x, cabo.y], [ponta.x, ponta.y], api.t + 1, 1, { espessura: 1.6 }); }
          if (kf > 0.05 && kf < 0.5) { raioXCorpo(ctx, rl, api.t, 1); const q = cam.p(LP[0], 1.0, LP[1]); Combate.eletrocutado(ctx, q.x, q.y + 0.6 * q.s, 0.9 * q.s, 1.8 * q.s, api.t, 1); }
          const qL = cam.p(LP[0], 1.2, LP[1]); Combate.impacto(ctx, qL.x, qL.y, 380, kf - 0.05, { rgb: AZUL, dura: 0.7 }); Combate.numero(ctx, 560, 560, '-420', kf - 0.1, 'critico');
          // a espada solta da mão, gira no ar e crava em pé no chão
          if (kf >= 0.35) { const s = cl((kf - 0.35) / 0.9), X = mix(0.8, 1.15, s), Y = 1.2 + Math.sin(s * Math.PI) * 1.2 - 1.15 * s * s, Z = mix(6.2, 6.6, s), q = cam.p(X, Math.max(0.05, Y), Z); Combate.laminaRubra(ctx, q.x, q.y + 0.3 * q.s, 1.0 * q.s, api.t, s < 1 ? s * 9 : Math.PI + 0.12, { brilho: 1 }); if (s >= 1) Noite.fumaca(ctx, q.x, q.y, 0.4 * q.s, (kf - 1.25) / 1.2, { seed: 14, cor: '120,40,40', sobe: 1.2, largura: 0.6, n: 10 }); }
          flash(ctx, kf, 0.9);
          if (u < parado) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(20,40,90,0.22)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        },
        fx: { zoom: soco(kf, 0.16), cx: W / 2 + api.tremor(kf > 0 && kf < 0.5 ? 14 : 0)[0] },
      });
    },
    // 21) os ladrões fogem arrastando o líder; tochas largadas no chão; cartas de loot subindo
    fugiram(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1050, x: 0.2, y: 1.6, z: 2.6 + u * 0.1, cy: 880, yaw: -0.05 });
      const k = cl(u / d), F = [mix(1.4, 3.6, k), mix(7.8, 12.0, k)];
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...LADRAO(1), pose: 'andando', expressao: 'medo' }, F[0] - 0.5, F[1] + 0.3, 1.85, { olhaPara: [5, 14], luz: LUZ_LUA, caminhar: api.t * 1.4 }) },
        { f: () => api.personagem3d(cam, { ...LIDER, opcoes: { lider: true, estilo: 'C', semEspada: true }, pose: 'caido', expressao: 'medo' }, F[0], F[1], 1.9, { olhaPara: [5, 14], luz: LUZ_LUA }) },
        { f: () => api.personagem3d(cam, { ...LADRAO(2), pose: 'andando', expressao: 'medo' }, F[0] + 0.5, F[1] + 0.3, 1.85, { olhaPara: [5, 14], luz: LUZ_LUA, caminhar: api.t * 1.4 + 0.5 }) },
        { pos: [1.15, 6.6], alt: 1.2, f: () => { const q = cam.p(1.15, 0, 6.6); Combate.laminaRubra(ctx, q.x, q.y + 0.05 * q.s, 1.0 * q.s, api.t, Math.PI + 0.12, { brilho: 0.8 }); } },
      ], {
        luzes: [{ x: -2.2, y: 0.3, z: 5.4, cor: '#FFB066', forca: 0.8 }, { x: -0.6, y: 0.3, z: 6.9, cor: '#FFB066', forca: 0.8 }],
        depois: () => {
          for (const [x, z, sd] of [[-2.2, 5.4, 1], [-0.6, 6.9, 2]]) { const q = cam.p(x, 0.08, z); Noite.tocha(ctx, q.x, q.y, 0.35 * q.s, api.t, { seed: sd, ang: 1.45 }); brasas(ctx, q.x, q.y, 0.6 * q.s, api.t, 1, sd); }
          LOOT3.forEach((it, i) => { const kk = api.fase(0.8 + i * 0.25, 1.2 + i * 0.25); if (kk <= 0) return; const q = cam.p(-0.4 + i * 0.4, 0.6 + kk * 0.9 + Math.sin(api.t * 2 + i) * 0.05, 6.0); Valdor.feixe(ctx, q.x, q.y - 200, q.y + 120, 90, it.rar === 'epico' ? '176,124,255' : it.rar === 'raro' ? '90,180,255' : '200,206,216', 0.4 * kk); carta3(ctx, q.x, q.y, 0.42 * q.s, it, kk, api.t); });
        },
      });
    },
    // 22) as cartas abrem em leque
    loot(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0, y: 1.4, z: 3.6 + u * 0.1, cy: 900 });
      noite(ctx, api, cam, [], { desfoque: 14, forca: 0 });
      ctx.save(); ctx.fillStyle = 'rgba(8,10,26,0.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      LOOT3.forEach((it, i) => { const t0 = 0.1 + i * 0.32, k = api.fase(t0, t0 + 0.35, 'volta'), ang = (i - 2) * 0.14, x = 540 + (i - 2) * 168, y = 1020 + Math.abs(i - 2) * 50; if (k > 0) Valdor.feixe(ctx, x, 0, y + 240, 220, it.rar === 'epico' ? '176,124,255' : it.rar === 'raro' ? '90,180,255' : '200,206,216', 0.35 * cl(k)); carta3(ctx, x, y - (1 - cl(k)) * 160, 250, it, k, api.t, { giro: ang }); });
    },
    // 22b) o Téo volta a ser gente numa nuvem de fumaça — com a roupa toda rasgada; o Davi ri
    rasgado(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1150, x: -0.2, y: 1.35, z: 3.0 + u * 0.1, cy: 920, yaw: 0.06 });
      const volta = 0.55, humano = u > volta, vergonha = cl((u - volta - 0.3) / 0.4);
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIL, pose: 'parado', expressao: u > 1.2 ? 'rindo' : 'espanto' }, -1.1, 5.4, 1.76, { olhaPara: [0.35, 5.6], luz: LUZ_LUA }) },
        { f: () => humano ? api.personagem3d(cam, { fabrica: 'criarTeoRasgado', registroPoses: 'POSES_PADRAO', pose: { braco_d: -20 * vergonha, antebraco_d: -110 * vergonha, braco_e: 20 * vergonha, antebraco_e: 110 * vergonha, coxa_d: 4, coxa_e: -4, cabeca: 8 * vergonha }, expressao: expr('preocupado', { olhar: [0, 0.01] }) }, 0.35, 5.6, 1.82, { olhaPara: [-1.1, 5.4], luz: LUZ_LUA })
          : api.personagem3d(cam, { ...LOBO, pose: 'parado' }, 0.35, 5.6, 2.55 * (1 - 0.25 * cl(u / volta)), { luz: LUZ_LUA }) },
      ], {
        depois: () => { const q = cam.p(0.35, 0, 5.6); Noite.fumaca(ctx, q.x, q.y - 0.2 * q.s, 1.1 * q.s, (u - volta + 0.25) / 1.6, { seed: 17, cor: '200,205,230', n: 22, largura: 1.4, sobe: 0.8 }); Noite.clarao(ctx, q.x, q.y - 0.9 * q.s, Math.max(0, 1 - Math.abs(u - volta) / 0.3)); if (humano) for (let i = 0; i < 6; i++) { const f = cl((u - volta) / 1.4), x = q.x + (rnd(i) - 0.5) * 260, y = q.y - 1.5 * q.s + f * 1.4 * q.s + Math.sin(api.t * 3 + i) * 10; ctx.save(); ctx.globalAlpha = 1 - f; ctx.fillStyle = i % 2 ? '#3F7A55' : '#B39A6F'; ctx.translate(x, y); ctx.rotate(api.t * 2 + i); ctx.fillRect(-14, -6, 28, 12); ctx.restore(); } },
      });
    },
    // 23) tela de equipamento: a roupa rasgada do Téo e a do Davi trocam pela roupa nova do drop, peças entrando com brilho
    roupa(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0, y: 1.4, z: 3.0, cy: 900 });
      noite(ctx, api, cam, [], { desfoque: 18, forca: 0 });
      ctx.save(); ctx.fillStyle = 'rgba(10,14,34,0.55)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(30,40,80,0.55)'; ctx.strokeStyle = 'rgba(160,190,255,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(60, 330, 960, 1280, 40); ctx.fill(); ctx.stroke();
      ctx.font = '900 54px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('EQUIPAMENTO', 540, 410); ctx.restore();
      const giro = u * 1.4;
      const troca = u > d * 0.45;
      for (const [x, item, cor] of [[320, troca ? DAVIA : DAVIL, '127,200,255'], [760, troca ? TEOG : { fabrica: 'criarTeoRasgado', registroPoses: 'POSES_PADRAO' }, '127,230,170']]) {
        Valdor.brilhoRadial(ctx, x, 1380, 300, cor, 0.35);
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, 1430, 150, 26, 0, 0, TAU); ctx.fill(); ctx.restore();
        api.personagemGirando({ ...item, pose: 'parado', expressao: 'feliz' }, x, 1430, 880, Math.sin(giro) * 1.2, {});
        const kk = api.fase(d * 0.45 - 0.2, d * 0.45 + 0.2); if (kk > 0 && kk < 1) Valdor.brilhoRadial(ctx, x, 1000, 520 * Math.sin(kk * Math.PI), '255,255,255', 0.85 * Math.sin(kk * Math.PI));
      }
      setaAtributo(ctx, 150, 1530, '+MAGIA', (u - d * 0.5) * 2);
      setaAtributo(ctx, 600, 1530, '+DEFESA', (u - d * 0.5 - 0.15) * 2);
      setaAtributo(ctx, 380, 1640, '+VELOCIDADE', (u - d * 0.5 - 0.3) * 2);
      if (!troca) { ctx.save(); ctx.font = '800 34px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFB0A0'; ctx.fillText('ROUPA RASGADA', 760, 480); ctx.restore(); }
    },
    // 24) a carta lendária: Lâmina Rubra · R$ 348.000
    premio(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0, y: 1.4, z: 3.4, cy: 900 });
      noite(ctx, api, cam, [], { desfoque: 16, forca: 0 });
      ctx.save(); ctx.fillStyle = 'rgba(30,4,8,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      Valdor.feixe(ctx, 540, 0, 1500, 700, VERMELHO, 0.6);
      const k = api.fase(0.1, 0.6, 'volta'), giro = (1 - cl(u / 0.9)) * TAU * 1.5;
      ctx.save(); ctx.translate(540, 960); ctx.scale(Math.cos(giro) || 0.01, 1); ctx.translate(-540, -960); carta3(ctx, 540, 960, 520, { nome: 'Lâmina Rubra', rar: 'lendario', preco: 'R$ 347,00', icone: 'lamina' }, k, api.t); ctx.restore();
      brasas(ctx, 540, 1500, 800, api.t, 0.8, 12);
    },
    // 25) o aluguel transborda; o Davi de roupa nova encosta a mão no cabo da espada cravada
    aluguel(ctx, u, d, api) {
      const cam = camNoite(api, { f: 1150, x: -0.3, y: 1.3, z: 3.9 + u * 0.1, cy: 940, yaw: 0.12 });
      noite(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: 'espanto' }, 1.3, 7.6, 1.82, { olhaPara: [0.55, 6.2], luz: LUZ_LUA }) },
        { pos: [1.15, 6.6], alt: 1.2, f: () => { const q = cam.p(1.15, 0, 6.6); Combate.laminaRubra(ctx, q.x, q.y + 0.05 * q.s, 1.0 * q.s, api.t, Math.PI + 0.12, { brilho: 0.9 }); } },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 35 * cl((u - 1) / 0.6), antebraco_d: 30 * cl((u - 1) / 0.6), braco_e: -8, coxa_d: 4, coxa_e: -4 }, expressao: u < 1.2 ? 'espanto' : 'feliz' }, 0.55, 6.2, 1.76, { olhaPara: [1.15, 6.6], luz: { lado: 1, forca: 0.6, cor: 'rgb(255,120,90)', sombra: 1 } }) },
      ], {
        luzes: [{ x: 1.15, y: 0.8, z: 6.5, cor: '#FF4030', forca: 0.9, raio: 4 }],
        fim: () => {
          const v = 71.08 + 347 * api.ease.entra(api.fase(0.2, 1.6)), frac = v / ALUGUEL_META;
          Combate.aluguel(ctx, Math.min(1, frac), reaisTxt(v), { dias: '29 DIAS', y: 150 });
          { const kq = api.fase(0.2, 1.6); if (kq > 0 && kq < 1) for (let i = 0; i < 12; i++) { const f = ((api.t * 1.2 + i / 12) % 1), x = 300 + rnd(i) * 300, y = 600 - f * 380; Valdor.moeda(ctx, x, y, 22, api.t * 4 + i, 1 - f); } }
          for (const [x, txt, cor] of [[300, 'VENDER', '#D9A21A'], [780, 'EQUIPAR', '#2FA84A']]) { const k = api.fase(1.8 + (x > 500 ? 0.15 : 0), 2.2 + (x > 500 ? 0.15 : 0), 'volta'); if (k <= 0) continue; zoomEm(ctx, x, 1640, k, () => { ctx.fillStyle = cor; ctx.beginPath(); ctx.roundRect(x - 190, 1590, 380, 100, 50); ctx.fill(); ctx.font = '900 54px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, x, 1642); }); }
        },
      });
    },
    // 26) câmera alta: avisos acendendo pelo mapa inteiro
    aviso(ctx, u, d, api) {
      const cam = api.camera({ f: 900, x: 0.3, y: 14 + u * 2, z: -12 - u * 2, cy: 420, nevoa: V().nevoa(1) });
      noite(ctx, api, cam, [], { forca: 0, bokeh: 0 });
      for (let i = 0; i < 28; i++) {
        const X = (rnd(i) - 0.5) * 80, Z = 10 + rnd(i * 3) * 110, t0 = 0.2 + rnd(i * 7) * 1.6, k = api.fase(t0, t0 + 0.25, 'volta'); if (k <= 0) continue;
        const q = cam.p(X, 3, Z); if (q.dz < 1) continue; const s = Math.max(14, 0.9 * q.s) * cl(k);
        Valdor.brilhoRadial(ctx, q.x, q.y, s * 3, VERMELHO, 0.5); ctx.save(); ctx.fillStyle = 'rgba(40,6,10,0.85)'; ctx.strokeStyle = '#FF6A5A'; ctx.lineWidth = Math.max(2, s * 0.08); ctx.beginPath(); ctx.roundRect(q.x - s, q.y - s * 0.6, s * 2, s * 1.2, s * 0.2); ctx.fill(); ctx.stroke(); ctx.font = `900 ${s * 0.9}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD0C8'; ctx.fillText('!', q.x, q.y + s * 0.05); ctx.restore();
      }
    },
    // 27) o aviso com o rosto do Davi; o Davi engole seco
    rosto(ctx, u, d, api) {
      const meio = d * 0.55;
      const cam = camNoite(api, { x: -0.4, y: 1.6, z: 3.6, cy: 820, yaw: 0.1 });
      if (u < meio) {
        noite(ctx, api, cam, [], { desfoque: 16, forca: 0 });
        ctx.save(); ctx.fillStyle = 'rgba(20,4,8,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
        const k = api.fase(0, 0.3, 'volta');
        zoomEm(ctx, 540, 960, k, () => {
          ctx.save(); ctx.fillStyle = 'rgba(40,8,12,0.92)'; ctx.strokeStyle = '#FF6A5A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(120, 420, 840, 1100, 40); ctx.fill(); ctx.stroke();
          ctx.font = '900 84px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FF8A7A'; ctx.fillText('RECOMPENSA', 540, 540);
          ctx.fillStyle = '#1A0A10'; ctx.beginPath(); ctx.roundRect(290, 600, 500, 520, 24); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(290, 600, 500, 520, 24); ctx.clip();
          close(api, { ...DAVIA, pose: 'parado', expressao: 'neutro' }, 540, 900, 470, {}); ctx.restore();
          ctx.strokeStyle = '#D9A93A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(290, 600, 500, 520, 24); ctx.stroke();
          ctx.font = '900 96px Inter'; ctx.fillStyle = '#FFE680'; ctx.fillText('R$ 1.000', 540, 1250);
          ctx.font = '800 42px Inter'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('QUEM PEGOU A LÂMINA RUBRA', 540, 1340); ctx.restore();
        });
      } else {
        const uu = u - meio, zoom = 1 + uu * 0.12, Hpx = 600 * zoom, item = { ...DAVIA, pose: 'parado', expressao: expr('medo', { olhar: [0, 0.006] }) };
        noite(ctx, api, cam, [{ f: () => { const A = alturaH(item); return api.personagem(item, W * 0.5, 1000 - 0.47 * Hpx + A * Hpx, A * Hpx, { luz: { lado: 1, forca: 0.9, cor: 'rgb(255,110,90)', sombra: 1 } }); } }], { desfoque: 12, forca: 0 });
        Valdor.brilhoRadial(ctx, 900, 400, 500, VERMELHO, 0.35);
      }
    },
    // 28) cartela final
    parte(ctx, u, d, api) {
      const cam = camNoite(api, { x: 0, y: 1.6, z: -0.5 + u * 0.2 });
      noite(ctx, api, cam, [], { desfoque: 14, forca: 0 });
      ctx.fillStyle = 'rgba(10,10,30,0.5)'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0, 0.35, 'volta');
      zoomEm(ctx, 540, 760, k, () => { api.texto('PARTE', 540, 680, 120); api.texto('3', 540, 850, 230, { cor: AMARELO }); });
      const k2 = api.fase(0.4, 0.75, 'volta');
      zoomEm(ctx, 540, 1130, k2, () => { api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 4', 540, 1190, 96, { cor: AMARELO }); });
      const k3 = api.fase(0.8, 1.1, 'volta'), pulso = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulso, k3 * pulso);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

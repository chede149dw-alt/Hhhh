// VALDOR · Parte 4 — "Caçado". Planos do roteiro roteiros/nova/ep04.json (Cânion Vermelho, caçadores, magias novas).
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
    const op = { t: tc, noite: n, dia, perto, luzes, figuras, foco, bokeh: o.bokeh === undefined ? 5 : o.bokeh, magias, fx };
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
    let i = 0; while (r > chaves[i + 1][0]) i++; const [r0, A] = chaves[i], [r1, B] = chaves[i + 1], k0 = (r - r0) / (r1 - r0), k = k0 * k0 * (3 - 2 * k0), out = {};
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

  window.PLANOS = {
    // 1) gancho: cartaz de recompensa no poste, flecha crava
    capa(ctx, u, d, api) {
      const cam = camDia(api, { x: -0.3, y: 1.6, z: 1.2 + u * 0.2, cy: 950 });
      dia(ctx, api, cam, [], { desfoque: 10, forca: 0 });
      ctx.save(); ctx.fillStyle = '#5A3A22'; ctx.fillRect(500, 700, 80, 1300); ctx.restore();
      const bal = Math.sin(api.t * 2) * 0.03, crava = api.fase(0.25, 0.32);
      cartaz(ctx, api, 540, 1000, 1.25, bal + (crava > 0 && crava < 1 ? Math.sin(crava * 30) * 0.03 : 0));
      if (crava > 0) { ctx.save(); ctx.translate(560, 980); ctx.rotate(-0.25); ctx.fillStyle = '#C9A06A'; ctx.fillRect(-6, -280 * Math.min(1, crava * 3), 12, 280 * Math.min(1, crava * 3)); ctx.fillStyle = '#C84A3A'; ctx.beginPath(); ctx.moveTo(-24, -290); ctx.lineTo(0, -240); ctx.lineTo(24, -290); ctx.fill(); ctx.restore(); }
      const k = api.fase(0, 0.3, 'volta'); zoomEm(ctx, 540, 300, k, () => { api.texto('MIL REAIS', 540, 240, 110); api.texto('PELA CABEÇA DELE', 540, 360, 84, { cor: AMARELO }); });
    },
    // 2) o cânion de cima, os dois pequenininhos andando lá no fundo
    canion(ctx, u, d, api) {
      const cam = camDia(api, { f: 950, x: 0.5, y: 16 - u * 1.5, z: -10 + u * 2, cy: 260 });
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado' }, -0.35, 6 + u * 0.6, 1.76, { caminhar: api.t * 1.4, rumo: 0 }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado' }, 0.35, 6.1 + u * 0.6, 1.8, { caminhar: api.t * 1.4 + 0.5, rumo: 0 }) },
      ], { forca: 0, bokeh: 0 });
      falcao(ctx, 200 + u * 700, 520 - u * 120, 1.4, api.t);
      Combate.aluguel(ctx, 418.08 / 1200, reaisTxt(418.08), { dias: '28 DIAS', y: 150 });
    },
    // 3) a conversa andando (câmera de costas na frente deles)
    conversa(ctx, u, d, api) {
      const cam = camDia(api, { x: 0, y: 1.55, z: 2.2 + u * 0.8, cy: 860, yaw: Math.PI, f: 1050 });
      // câmera virada para trás (olhando de frente para eles), eles andando na direção da câmera
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: expr('neutro', { olhar: [0.01, 0] }) }, 0.45, 0.2 + u * 0.8, 1.76, { caminharFrontal: api.t * 1.3, rumo: Math.PI }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: 'feliz' }, -0.5, 0.3 + u * 0.8, 1.8, { caminharFrontal: api.t * 1.3 + 0.5, rumo: Math.PI }) },
      ], { forca: 0.3 });
    },
    // 3b) menu de criação de personagem: a carta dourada do homem-fera
    raca(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, {});
      painel(ctx, 90, 260, 900, 1400, '#7FC8FF');
      api.texto('ESCOLHA SUA RAÇA', 540, 360, 64);
      ['HUMANO', 'ELFO', 'ANÃO', 'ORC'].forEach((r, i) => { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(170, 440 + i * 150, 740, 120, 20); ctx.fill(); ctx.font = '800 54px Inter'; ctx.fillStyle = '#C8D4E8'; ctx.textAlign = 'left'; ctx.fillText(r, 220, 520 + i * 150); ctx.font = '700 34px Inter'; ctx.fillStyle = '#8FA0B8'; ctx.textAlign = 'right'; ctx.fillText('COMUM', 870, 515 + i * 150); ctx.restore(); });
      const k = api.fase(0.2, 0.6, 'volta');
      if (k > 0) { ctx.save(); ctx.translate(540, 1240); ctx.scale(k, k); ctx.rotate(Math.sin(api.t * 2) * 0.03); Valdor.brilhoRadial(ctx, 0, 0, 420, '255,200,80', 0.6); const g = ctx.createLinearGradient(0, -180, 0, 180); OURO.forEach(([p, c]) => g.addColorStop(p, c)); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-360, -170, 720, 340, 30); ctx.fill(); ctx.font = '900 76px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#4A2A06'; ctx.fillText('HOMEM-FERA', 0, -20); ctx.font = '900 54px Inter'; ctx.fillText('0,1% DE CHANCE', 0, 70); ctx.restore(); }
    },
    // 3c) Téo olhando as mãos: "De noite, quem manda é a fera"
    maos(ctx, u, d, api) {
      const cam = camDia(api, { x: -0.2, y: 1.55, z: 2.3 + u * 0.3, cy: 820, f: 1200 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_d: 10, antebraco_d: -115, braco_e: -10, antebraco_e: 115, cabeca: 14, tronco: 4 }, expressao: expr('preocupado', { olhar: [0, 0.012] }), voz: 'teo' }, 0.1, 5.2, 1.8, { rumo: 0.15 }) }], { forca: 0.4 });
      if (u > 0.5) { ctx.save(); ctx.fillStyle = `rgba(160,20,20,${0.18 * Math.sin(api.t * 6) ** 2})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
    // 3d) os dois rindo, o Davi empurrando o ombro do Téo
    rindo(ctx, u, d, api) {
      const cam = camDia(api, { x: 0, y: 1.5, z: 2.6, cy: 860, f: 1150 });
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_e: -75, antebraco_e: -10, braco_d: 10, antebraco_d: -10 }, expressao: 'feliz' }, -0.45, 5.3, 1.76, { olhaPara: [0.5, 5.4] }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: { tronco: -8, cabeca: -10, braco_d: 20, antebraco_d: -40 }, expressao: 'rindo', voz: 'teo' }, 0.45, 5.4, 1.8, { olhaPara: [-0.5, 5.3] }) },
      ], { forca: 0.4 });
    },
    // 4) a espada não pode ser vendida + relógio 24h
    vender(ctx, u, d, api) {
      const cam = camDia(api, { x: 0.2, y: 1.6, z: 3.2, cy: 820 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 70, antebraco_d: -60 }, expressao: 'espanto' }, 0.1, 5.4, 1.76, { rumo: 0.1 }) }], { forca: 0.3, desfoque: 6 });
      const k = api.fase(0.1, 0.35, 'volta');
      zoomEm(ctx, 540, 640, k, () => { painel(ctx, 110, 420, 860, 420, '#FF5A4A'); api.texto('ITEM COM RECOMPENSA', 540, 540, 62, { cor: '#FF8A7A' }); api.texto('NÃO PODE SER VENDIDO', 540, 640, 62); ctx.save(); ctx.font = '900 40px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE680'; ctx.fillText('SOBREVIVA ATÉ ZERAR', 540, 760); ctx.restore(); });
      const s = Math.max(0, 86400 - Math.floor(api.fase(0.4, 1) * 3)), hh = String(Math.floor(s / 3600)).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
      relogio(ctx, 540, 1000, `${hh}:${mm}:${ss}`, api.fase(0.35, 0.5));
    },
    // 4b) no fim do cânion, a ruína: os dois entram (contra a luz da entrada)
    ruina(ctx, u, d, api) {
      const cam = camRuina(api, { x: 0.3, y: 1.5, z: 9 - u * 0.4, cy: 950, f: 1000, yaw: Math.PI });
      ruina(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado' }, -0.45, 0.6 + u * 0.7, 1.76, { caminharFrontal: api.t * 1.2, rumo: Math.PI, luz: LUZ_TOCHA }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado' }, 0.55, 0.4 + u * 0.7, 1.8, { caminharFrontal: api.t * 1.2 + 0.5, rumo: Math.PI, luz: LUZ_TOCHA }) },
      ], { forca: 0.3 });
      clarao(ctx, u / 0.5);
    },
    // 5) os caçadores saem do escuro: por cima do ombro do Davi (vidas e preço em cima das cabeças)
    chegaram(ctx, u, d, api) {
      const cam = camRuina(api, { x: 0.45, y: 1.8, z: 5.6 + u * 0.12, cy: 880, f: 950, yaw: -0.35 });
      const S = V().CAN_ROCHA, sai = api.fase(0.05, 0.5);
      const H3 = [[-5.2, 15, 1.75, ARQ, S.y, 22], [1.0, 18 - 2.5 * sai, 2.6, GIG, 0, 30], [-1.6, 12, 1.72, ASS, 0, 26]];
      ruina(ctx, api, cam, [
        ...H3.map(([x, z, a, it, y]) => ({ f: () => api.personagem3d(cam, { ...it, pose: 'parado', expressao: 'raiva' }, x, z, a, { y, olhaPara: [0, 4.6], luz: LUZ_TOCHA }) })),
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado' }, 0.1, 7.6, 1.76, { rumo: 0.15 + Math.PI, luz: LUZ_TOCHA }) },
      ], { forca: 0.3, bokeh: 2,
        depois: () => { H3.forEach(([x, z, a, it, y, nv], i) => { const q = cam.p(x, y + a + 0.35, z), k = api.fase(0.25 + i * 0.1, 0.5 + i * 0.1, 'volta'); vidaCabeca(ctx, q.x, q.y, 1, { w: 90 * k, h: 12 }); Valdor.placaNivel(ctx, q.x, q.y - 40, nv, k, { tam: 28, cor: '#FFB0B0' }); }); const qd = cam.p(0.1, 2.05, 7.6); etiqueta(ctx, qd.x, qd.y - 30, 'R$ 1.000', api.fase(0.5, 0.75, 'volta')); },
      });
    },
    // 5b) magias novas girando em volta do Davi
    magias(ctx, u, d, api) {
      const cam = camRuina(api, { x: 0, y: 1.4, z: 2.4, cy: 900, f: 1150 });
      ruina(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: 'conjurando', expressao: 'determinado' }, 0, 5.0, 1.76, { rumo: 0, luz: LUZ_TOCHA }) }], { forca: 0.3,
        magias: () => [{ tipo: 'circulo', x: 0, z: 5.0, raio: 1.1, k: Math.min(1, u * 2), cor: '#FFD27A' }] });
      [['MURALHA DE GELO', GELO, 'gelo'], ['RAÍZES ANCIÃS', VERDE, 'raiz'], ['METEORO', FOGO, 'meteoro']].forEach(([n, c, t], i) => { const a = api.t * 0.9 + (i / 3) * TAU, x = 540 + Math.cos(a) * 360, y = 760 + Math.sin(a) * 140; cartaMagia(ctx, x, y, 0.95 + 0.15 * Math.sin(a), n, c, t, api.t, api.fase(0.1 + i * 0.12, 0.4 + i * 0.12, 'volta')); });
      const k = api.fase(0.5, 0.8, 'volta'); zoomEm(ctx, 540, 320, k, () => api.texto('NOVAS MAGIAS', 540, 320, 90, { cor: AMARELO }));
    },
    // 6) a arqueira de costas em cima do rochedo: puxa a corda devagar (a ponta da flecha brilha), clarão e dispara
    flechas(ctx, u, d, api) {
      const S = V().CAN_ROCHA, AX = -5.2, AZ = 15, r = u / d, puxa = api.ease.suave(cl(r / 0.55)), solta = r > 0.58, ks = (r - 0.58) / 0.42;
      const cam = camDia(api, { x: AX + 0.42, y: S.y + 1.65, z: AZ + 1.9 - r * 0.25, cy: 980, f: 1150, yaw: Math.PI - 0.08 });
      window.ARCO = { puxa: solta ? 0 : puxa, flecha: !solta, brilho: puxa }; window.ARMA_ANG = { arco: 0 };
      const corda = solta ? Math.max(0, 1 - ks * 6) : puxa;
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...ARQ, pose: { braco_e: -88, antebraco_e: 0, mao_e: 0, braco_d: -60 - 25 * corda, antebraco_d: 60 + 55 * corda, tronco: -3 - 4 * corda, cabeca: 6, coxa_d: 16, canela_d: -10, coxa_e: -12, canela_e: 12, _plantar: true }, expressao: 'determinado' }, AX, AZ, 1.75, { y: S.y, olhaPara: [0, 5.2], luz: { lado: -1, forca: 0.8, cor: 'rgb(255,220,160)', sombra: 0.7 } }) },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'espanto' }, 0, 5.2, 1.76, { olhaPara: [AX, AZ] }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: 'espanto' }, 1.1, 5.6, 1.8, { olhaPara: [AX, AZ] }) }], { forca: 0, bokeh: 6,
        // a chuva de flechas sai do arco (3D) e voa até o Davi
        fx3d: () => !solta ? [] : Array.from({ length: 10 }, (_, i) => flecha3d([AX - 0.45 + (i % 3) * 0.05, S.y + 1.42 + (i % 2) * 0.05, AZ - 0.25], [-0.9 + (i % 5) * 0.45, 0.9 + (i % 3) * 0.35, 5.2 + Math.floor(i / 5) * 0.4], Math.min(1, Math.max(0, ks * 1.5 - i * 0.025)), { s: 2.2, crava: false })),
        depois: ([rig]) => {
          const m = rig.pontoMundo('mao_e', [0, 0.2]);
          // energia juntando na ponta da flecha enquanto ela puxa
          if (!solta) { Valdor.brilhoRadial(ctx, m.x, m.y, 60 + 160 * puxa, '150,255,170', 0.35 + 0.5 * puxa); Noite.faiscas(ctx, m.x, m.y, 40, 90 * puxa, api.t, puxa, 3, '170,255,190'); }
          else {
            if (ks < 0.15) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(220,255,225,${0.8 * (1 - ks / 0.15)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
          }
        } });
      if (solta) Combate.velocidade(ctx, 540, 900, 0.6, Math.max(0, 1 - ks * 2), api.t);
    },
    // 7) ciência: adrenalina e o cérebro gravando mais quadros
    ciencia(ctx, u, d, api) {
      Valdor.raioFundo(ctx, api.t, {});
      Valdor.corpoRaio(ctx, 540, 1700, 1300, 0, {});
      const bate = 1 + 0.12 * Math.max(0, Math.sin(api.t * 14)) ** 6;
      ctx.save(); ctx.translate(565, 800); ctx.scale(bate, bate); Valdor.brilhoRadial(ctx, 0, 0, 120, '255,80,80', 0.7); ctx.fillStyle = '#FF5A5A'; ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-70, -10, -40, -70, 0, -30); ctx.bezierCurveTo(40, -70, 70, -10, 0, 40); ctx.fill(); ctx.restore();
      for (const sx of [-1, 1]) { Valdor.brilhoRadial(ctx, 540 + sx * 62, 1000, 70, '255,160,40', 0.9); ctx.fillStyle = '#FFAA30'; ctx.beginPath(); ctx.ellipse(540 + sx * 62, 1000, 24, 15, 0, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 18; i++) { const f = (api.t * 0.6 + i / 18) % 1; ctx.fillStyle = `rgba(255,170,60,${1 - f})`; ctx.beginPath(); ctx.arc(540 + Math.sin(i * 2.3) * 40, 1000 - f * 520, 9, 0, TAU); ctx.fill(); }
      // fita de filme no cérebro: mais quadros por segundo
      const k = api.fase(0.35, 0.7); ctx.save(); ctx.translate(540, 250); ctx.fillStyle = 'rgba(20,20,30,0.9)'; ctx.fillRect(-330, -70, 660, 140); const n = Math.round(4 + k * 10); for (let i = 0; i < n; i++) { const w = 600 / n; ctx.fillStyle = 'rgba(180,230,255,0.85)'; ctx.fillRect(-300 + i * w + 4, -48, w - 8, 96); } ctx.fillStyle = '#111'; for (let i = 0; i < 20; i++) { ctx.fillRect(-320 + i * 33, -64, 14, 10); ctx.fillRect(-320 + i * 33, 54, 14, 10); } ctx.restore();
      if (k > 0.6) api.texto('MAIS QUADROS = CÂMERA LENTA', 540, 380, 50, { cor: AMARELO });
      api.texto('ADRENALINA', 540, 1180, 70, { cor: '#FFB040' });
    },
    // 8) muralha de gelo: sobe do chão, as flechas cravam e congelam (casca de gelo e geada), câmera de 3/4 com o Davi atrás
    gelo(ctx, u, d, api) {
      const cam = camDia(api, { x: 2.3, y: 1.5, z: 1.8, cy: 900, f: 1050, yaw: -0.5 });
      // o Davi levanta o pé e bate no chão: uma onda de gelo sai do pé e a muralha sobe
      const sobe = api.fase(0.3, 0.8), r = u / d;
      const pose = poseChave(u, [[0, { braco_d: -25, antebraco_d: -40, braco_e: 25, antebraco_e: 40, tronco: 0 }], [0.2, { coxa_d: -70, canela_d: 80, braco_d: -60, antebraco_d: -20, braco_e: 60, antebraco_e: 20, tronco: -6 }], [0.3, { coxa_d: 8, canela_d: 4, coxa_e: -6, braco_d: 40, antebraco_d: -30, braco_e: -40, antebraco_e: 30, tronco: 12, cabeca: 8 }], [3, { coxa_d: 6, coxa_e: -6, braco_d: 20, antebraco_d: -60, braco_e: -20, antebraco_e: 60, tronco: 6 }]]);
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { ...pose, _plantar: true }, expressao: 'determinado' }, 0, 5.4, 1.76, { rumo: 0, luz: LUZ_TOCHA }) }], { forca: 0.3,
        luzes: [{ x: 0, y: 1, z: 4.0, cor: '#9FE0FF', forca: 1.6 * sobe, raio: 6 }],
        fx3d: () => [{ tipo: 'gelo', x: 0, z: 4.4, larg: 2.9, alt: 2.3, k: sobe },
          ...Array.from({ length: 9 }, (_, i) => { const t0 = 0.26 + i * 0.06; if (r < t0) return null; const k = cl((r - t0) / 0.06), cong = cl((r - t0 - 0.06) / 0.22), B = [-1.15 + i * 0.29, 0.7 + rnd(i) * 1.1, 4.25]; return flecha3d([B[0] + 0.6 + rnd(i * 2) * 0.4, B[1] + 0.6, B[2] - 5], B, k, { s: 1.5, gelo: cong }); })],
        depois: () => { for (let i = 0; i < 9; i++) { const t0 = 0.26 + i * 0.06, k = (r - t0) / 0.06; if (k < 1 || k > 1.6) continue; const q = cam.p(-1.15 + i * 0.29, 0.7 + rnd(i) * 1.1, 4.25); Noite.faiscas(ctx, q.x, q.y, 30, 70, api.t, 1.6 - k, i, GELO); Valdor.brilhoRadial(ctx, q.x, q.y, 90, '170,230,255', 0.6 * (1.6 - k)); } } });
    },
    // 8b) o Davi saca a Lâmina Rubra e corta o resto das flechas
    corta(ctx, u, d, api) {
      const cam = camRuina(api, { x: 0, y: 1.3, z: 2.2, cy: 900, f: 1150 });
      espada(api, -1.6 + Math.min(1, u / (d * 0.5)) * 3.2, 1);
      ruina(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIE, pose: { braco_d: 95 - 140 * Math.min(1, u / (d * 0.5)), antebraco_d: -10, tronco: 8, coxa_d: 20, canela_d: -15, coxa_e: -15, canela_e: 15, _maos: { d: 'punho' }, _plantar: true }, expressao: 'determinado' }, 0, 5.0, 1.76, { rumo: 0.1, luz: LUZ_TOCHA }) }], { forca: 0.3,
        luzes: [{ x: 0.3, y: 1.4, z: 4.6, cor: '#FF5A4A', forca: 1.2, raio: 5 }],
        fx3d: () => Array.from({ length: 6 }, (_, i) => { const r = u / d, t0 = 0.02 + i * 0.05, k = cl((r - t0) / 0.3), A = [-1.2 + i * 0.48, 1.6 + (i % 2) * 0.3, 15], B = [-0.5 + i * 0.2, 1.25 + (i % 3) * 0.12, 4.4];
          if (k < 1) return flecha3d(A, B, k, { s: 1.3, crava: false });
          const tt = (r - t0 - 0.3) * d, sd = i % 2 ? 1 : -1, a = tt * (9 + i); return { tipo: 'flecha', x: B[0] + sd * tt * 1.4, y: Math.max(0.05, B[1] + tt * 1.2 - tt * tt * 7), z: B[2] - tt * 0.8, dx: Math.sin(a) * sd, dy: Math.cos(a), dz: Math.sin(a * 0.7), s: 1.3 }; }),
        depois: () => { const r = u / d; for (let i = 0; i < 6; i++) { const kc = (r - 0.02 - i * 0.05 - 0.3) * d; if (kc < 0 || kc > 0.3) continue; const q = cam.p(-0.5 + i * 0.2, 1.25 + (i % 3) * 0.12, 4.4); Noite.faiscas(ctx, q.x, q.y, 40, 120, api.t, 1 - kc / 0.3, i, '255,120,90'); } Valdor.brilhoRadial(ctx, 540, 820, 380, VERMELHO, 0.3); } });
    },
    // 9) o Téo escala o rochedo (câmera baixa e perto), a flecha pega no braço, ele escorrega e se segura
    parede(ctx, u, d, api) {
      const S = V().CAN_ROCHA, TX = S.x1 + 0.3, TZ = 15, r = u / d, sobe = Math.min(r / 0.45, 1), hit = r > 0.45, kh = r - 0.45;
      const yT = hit ? Math.max(0.35, 1.25 - Math.min(kh * 4, 0.6) * 1.5) + Math.max(0, kh - 0.25) * 1.2 : 0.1 + sobe * 1.15;
      const cam = camDia(api, { x: -0.5 + r * 0.15, y: 0.7, z: 14.0, cy: 1380, f: 950, yaw: -1.22 });
      const esc = Math.sin(api.t * 9);
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...TEOG, pose: hit && kh < 0.25 ? { braco_d: -175, antebraco_d: 0, braco_e: 40, antebraco_e: 30, coxa_d: 30, coxa_e: -20, canela_e: 40, _escala_capa: [0.8, 0.5] } : { braco_d: -160 + 25 * esc, antebraco_d: -15, braco_e: 150 - 25 * esc, antebraco_e: 15, coxa_d: -60 + 30 * esc, canela_d: 70, coxa_e: -10 - 30 * esc, canela_e: 40, _escala_capa: [0.8, 0.5] }, expressao: hit ? 'medo' : 'determinado' }, TX, TZ, 1.8, { y: yT, rumo: Math.PI / 2 + 0.75, luz: LUZ_TOCHA }), plano: true },
        { f: () => api.personagem3d(cam, { ...ARQ, pose: { braco_e: -50, antebraco_e: 0, braco_d: -30, antebraco_d: 100, tronco: 25, cabeca: 25, _plantar: true }, expressao: 'raiva' }, S.x1 - 0.35, 15.4, 1.75, { y: S.y, rumo: Math.PI / 2 + 0.3 }), plano: true }], { forca: 0.4,
        depois: ([rig]) => {
          for (let i = 0; i < 7; i++) { const f = (api.t * 1.3 + i / 7) % 1, q = cam.p(TX + 0.05, yT - f * 1.8, TZ + (rnd(i) - 0.5) * 0.5); ctx.fillStyle = '#8A4228'; ctx.beginPath(); ctx.arc(q.x, q.y, 5 + rnd(i) * 6, 0, TAU); ctx.fill(); }
          const qp = cam.p(TX, yT, TZ); Noite.fumaca(ctx, qp.x, qp.y, 0.5 * qp.s, (api.t * 0.8) % 1, { seed: 2, cor: '210,150,110', sobe: 0.2, n: 8 });
          const qa = cam.p(S.x1 - 0.1, S.y + 1.3, 15.4); if (!hit && r > 0.3) { const a = rig.pontoMundo('antebraco_e', [0, 0.25]), k = (r - 0.3) / 0.15; flecha2d(ctx, mix(qa.x, a.x, k), mix(qa.y, a.y, k), Math.atan2(a.y - qa.y, a.x - qa.x), 190, { rastro: 1 }); }
          if (hit) { const a = rig.pontoMundo('antebraco_e', [0, 0.25]); flecha2d(ctx, a.x + 30, a.y + 40, Math.atan2(a.y - qa.y, a.x - qa.x), 190); Combate.impacto(ctx, a.x, a.y, 180, kh, { rgb: '255,90,80', dura: 0.4 }); Combate.numero(ctx, a.x + 50, a.y - 140, '-35', kh, 'recebido'); flash(ctx, kh, 0.4); }
        },
        fx: { zoom: soco(hit ? kh : -1, 0.1) } });
    },
    // 10) o cavaleiro gira o martelo e acerta a barriga do Davi: ele voa e bate na parede do cânion, que racha
    martelo(ctx, u, d, api) {
      const r = paraNoImpacto(u / d, 0.38, 0.045), bate = 0.38, kb = r - bate, voa = cl(kb / 0.3), naParede = kb > 0.3, kp = kb - 0.3;
      const DZ = 5.2, xP = V().canParede(DZ, -1, 1.0) + 0.55, DX0 = 0.1;
      const dx = kb < 0 ? DX0 : mix(DX0, xP, api.ease.entra(voa)), dy = kb < 0 ? 0 : naParede ? Math.max(0, 0.9 - kp * 3) : 0.9 * Math.sin(voa * Math.PI * 0.5);
      // câmera de frente acompanha o Davi voando até a parede (pan lateral)
      const pan = api.ease.suave(cl(kb / 0.34)), camX = mix(0.25, xP + 1.25, pan);
      const cam = camDia(api, { x: camX, y: 1.6 + pan * 0.5, z: DZ - 3.9 + pan * 1.6, cy: mix(900, 820, pan), f: 880, yaw: mix(-0.05, -0.34, pan), mov: false });
      const [tx, ty] = api.tremor(kb > 0 && kb < 0.12 ? 12 : naParede && kp < 0.12 ? 16 : 0);
      window.ARMA_ANG = { martelo: 95 };
      const giro = kb < 0 ? api.ease.suave(cl(r / bate)) : 1;
      // cavaleiro: antecipação (levanta o martelo atrás), golpe rápido, continuação do movimento
      const poseG = poseChave(r, [[0, { braco_d: 60, tronco: 0 }], [0.26, { braco_d: 165, tronco: -18 }], [bate, { braco_d: -60, tronco: 22 }], [bate + 0.12, { braco_d: -95, tronco: 28 }], [1, { braco_d: -80, tronco: 18 }]]);
      const poseD = poseChave(r, [[0, { braco_d: 30, antebraco_d: -40, braco_e: -30, antebraco_e: 40, coxa_d: 10, coxa_e: -10 }], [bate - 0.06, { braco_d: 70, antebraco_d: -90, braco_e: -70, antebraco_e: 90, coxa_d: 15, coxa_e: -15, tronco: -6 }],
        [bate + 0.04, { tronco: 45, cabeca: 30, braco_d: -110, braco_e: 110, coxa_d: -55, canela_d: 45, coxa_e: -35, canela_e: 35 }], [bate + 0.28, { tronco: 25, cabeca: 10, braco_d: -140, braco_e: 140, coxa_d: -40, canela_d: 40, coxa_e: -20, canela_e: 30 }],
        [bate + 0.34, { tronco: 10, braco_d: 60, braco_e: -60, coxa_d: -30, canela_d: 60, coxa_e: 20, canela_e: 40, cabeca: 20 }], [1, { tronco: 18, braco_d: 40, braco_e: -40, coxa_d: -20, canela_d: 50, coxa_e: 15, canela_e: 35, cabeca: 30 }]]);
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...GIG, pose: { ...poseG, antebraco_d: -10, braco_e: 40, antebraco_e: -40, coxa_d: -25, canela_d: 30, coxa_e: 25, canela_e: 10, _plantar: true }, expressao: 'raiva' }, 1.0, 5.6, 2.6, { olhaPara: [DX0, DZ], luz: LUZ_TOCHA }) },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: poseD, expressao: kb < 0 ? 'espanto' : 'medo' }, dx, DZ, 1.76, { y: dy, olhaPara: [1, 5.6], luz: LUZ_TOCHA }) },
      ], { forca: 0.3,
                chaoEm: naParede ? [xP + 0.05, DZ - 0.5] : undefined, chao: naParede ? () => { const w = cam.p(xP - 0.35, 1.2, DZ), g0 = cam.p(xP - 0.1, 0.1, DZ);
            Noite.fumaca(ctx, g0.x, g0.y, 150, Math.min(0.9, kp / 1.5), { seed: 6, cor: '200,120,80', sobe: 0.4, largura: 1.3, n: 12 });
            const kr = Math.min(1, kp * 6); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (const [cor, lw] of [['rgba(255,210,170,0.75)', 9], ['#1E0804', 0]]) { ctx.strokeStyle = cor; for (let i = 0; i < 11; i++) { const a = (i / 11) * TAU + rnd(i), L = (260 + rnd(i * 3) * 360) * kr; ctx.lineWidth = (22 - i * 1.2) + lw; ctx.beginPath(); ctx.moveTo(w.x, w.y); let px = w.x, py = w.y; for (let j = 1; j <= 5; j++) { px += Math.cos(a + (rnd(i * 7 + j) - 0.5) * 0.9) * L / 5; py += Math.sin(a + (rnd(i * 5 + j) - 0.5) * 0.9) * L / 5; ctx.lineTo(px, py); if (j === 2 && rnd(i * 11) > 0.4) { ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a + 0.9) * L * 0.25, py + Math.sin(a + 0.9) * L * 0.25); ctx.moveTo(px, py); } } ctx.stroke(); } }
            ctx.fillStyle = 'rgba(25,8,4,0.8)'; ctx.beginPath(); ctx.ellipse(w.x + 40, w.y, 170 * kr, 230 * kr, 0, 0, TAU); ctx.fill(); ctx.restore();
        } : undefined,
        depois: ([rg, rd]) => {
          if (kb > 0 && kb < 0.3) { const b = rd.pontoMundo('tronco', [0, -0.3]); Combate.impacto(ctx, b.x, b.y, 260, kb, { rgb: '255,200,120', dura: 0.5 }); Combate.numero(ctx, b.x, b.y - 200, '-120', kb, 'recebido'); Combate.velocidade(ctx, b.x, b.y, Math.PI, 1 - voa, api.t); Noite.fumaca(ctx, b.x, b.y, 120, voa, { seed: 3, cor: '220,170,120', sobe: 0.2, n: 10 }); }
          if (naParede) { const w = cam.p(xP - 0.35, 1.2, DZ);
            destrocos(ctx, cam, xP - 0.3, 1.2, DZ, kp, { n: 16, forca: 2.4, tam: 0.06, seed: 8, cor: '#9A4A2A' }); Combate.impacto(ctx, w.x, w.y, 260, kp, { rgb: '255,160,100', dura: 0.35 }); }
          flash(ctx, kb, 0.45); if (naParede) flash(ctx, kp, 0.25);
          if (naParede) { ctx.save(); const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(200,0,0,0)'); v.addColorStop(1, 'rgba(200,0,0,0.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(kb, 0.14) } });
    },
    // 10b) raízes anciãs prendendo o cavaleiro
    raizes(ctx, u, d, api) {
      const cam = camRuina(api, { x: -0.4, y: 1.35, z: 1.4, cy: 900, f: 900 });
      window.ARMA_ANG = { martelo: 30 };
      ruina(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...GIG, pose: { braco_d: -30 - 20 * Math.sin(api.t * 6), antebraco_d: -20, braco_e: 30, antebraco_e: -30, tronco: 10 + 3 * Math.sin(api.t * 8), coxa_d: 10, coxa_e: -10 }, expressao: 'raiva' }, 0.3, 6.6, 2.6, { rumo: 0, luz: LUZ_TOCHA }) },
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: { tronco: 25, braco_d: 20, antebraco_d: -20, braco_e: -20, antebraco_e: 20, coxa_d: -40, canela_d: 70, coxa_e: 30, canela_e: 30, _plantar: true }, expressao: 'determinado' }, -1.25, 4.4, 1.76, { olhaPara: [0.3, 6.6], luz: LUZ_TOCHA }) },
      ], { forca: 0.3, luzes: [{ x: 0.2, y: 0.5, z: 6.2, cor: '#7AF07A', forca: 1.0, raio: 6 }],
        fx3d: () => [{ tipo: 'raizes', x: 0.3, z: 6.6, raio: 0.55, alt: 2.5, k: api.fase(0.03, 0.8) }],
        chaoEm: [-1.25, 4.4], chao: () => { const q = cam.p(-1.25, 0.02, 4.4); Valdor.brilhoRadial(ctx, q.x, q.y, 200, VERDE, 0.7); const g = cam.p(0.3, 0.02, 6.6); Valdor.brilhoRadial(ctx, g.x, g.y, 260, VERDE, 0.5 * api.fase(0, 0.4)); } });
      const k = api.fase(0, 0.25, 'volta'); zoomEm(ctx, 540, 320, k, () => api.texto('RAÍZES ANCIÃS', 540, 320, 80, { cor: '#8AF08A' }));
    },
    // 10c) meteoro: rompe o teto da ruína e cai em cima do cavaleiro preso
    meteoro(ctx, u, d, api) {
      const cam = camRuina(api, { x: -0.5, y: 1.0, z: 0.3, cy: 1250, f: 900 });
      const cai = Math.min(1, u / (d * 0.55)), kb = u - d * 0.55;
      window.ARMA_ANG = { martelo: 30 };
      const A0 = [-6, 34, 16], B0 = [0.2, 1.1, 6.8], mp = [mix(A0[0], B0[0], cai * cai), mix(A0[1], B0[1], cai * cai), mix(A0[2], B0[2], cai * cai)];
      ruina(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...GIG, pose: kb > 0 ? { tronco: -40, braco_d: 120, braco_e: -120, coxa_d: 30, coxa_e: -30 } : { braco_d: -30, antebraco_d: -20, tronco: 10 }, expressao: kb > 0 ? 'medo' : 'espanto' }, 0.2, 6.8, 2.6, { rumo: 0, luz: LUZ_TOCHA })}], { forca: 0.2,
        luzes: [{ x: kb > 0 ? 0.2 : mp[0], y: kb > 0 ? 1.5 : mp[1], z: kb > 0 ? 6.8 : mp[2], cor: '#FF8A30', forca: kb > 0 ? 4 * Math.max(0, 1 - kb) : 2.5, raio: kb > 0 ? 18 : 22 }],
        fx3d: () => [kb < 0.12 ? { tipo: 'raizes', x: 0.2, z: 6.8, raio: 0.55, alt: 2.5, k: 1 } : null, kb < 0 ? { tipo: 'meteoro', x: mp[0], y: mp[1], z: mp[2], dx: B0[0] - A0[0], dy: B0[1] - A0[1], dz: B0[2] - A0[2], s: 1.1 } : null, kb >= 0 ? { tipo: 'explosao', x: 0.2, z: 6.8, k: kb * 1.1, s: 1.3 } : null],
        depois: () => { const alvo = cam.p(0.2, 1.3, 6.8); if (kb >= 0) { Combate.numero(ctx, alvo.x, alvo.y - 380, '-320', kb, 'critico'); Noite.fumaca(ctx, alvo.x, alvo.y + 60, 300, Math.min(0.95, kb * 0.8), { seed: 9, cor: '90,70,60', sobe: 1.2, largura: 1.6, n: 18 }); } flash(ctx, kb); } });
      ctx.save(); ctx.fillStyle = `rgba(255,120,40,${0.12 * cai})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    },
    // 11) a assassina invisível: pegadas na poeira, contorno vermelho, a espada puxando como bússola
    assassina(ctx, u, d, api) {
      const cam = camRuina(api, { x: -0.25, y: 1.4, z: 2.0, cy: 880, f: 1050 });
      const revela = api.fase(0.45, 0.7);
      espada(api, -1.9 + 0.2 * Math.sin(api.t * 20) * (1 - revela), 1.2);
      ruina(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIE, pose: { braco_d: 80, antebraco_d: -20, tronco: -5, _maos: { d: 'punho' } }, expressao: 'determinado' }, 0.4, 5.1, 1.76, { olhaPara: [-0.8, 4.8], luz: LUZ_TOCHA }) },
        { f: () => api.personagem3d(cam, { ...ASS, pose: { braco_d: -150, antebraco_d: -20, braco_e: 150, antebraco_e: 20, coxa_d: 20, coxa_e: -30, canela_e: 30 }, expressao: 'raiva' }, -0.8, 4.8, 1.72, { olhaPara: [0.4, 5.1] }), alfa: 0.12 + 0.75 * revela, cor: revela < 1 ? 'rgba(255,40,40,0.55)' : undefined },
      ], { forca: 0.3, luzes: [{ x: 0.4, y: 1.4, z: 4.7, cor: '#FF4A3A', forca: 1.0, raio: 5 }], depois: () => pegadas(ctx, cam, [[-2.4, 6.4], [-2.1, 6.0], [-1.8, 5.6], [-1.4, 5.3], [-1.1, 5.0]], api.fase(0, 0.5)) });
      if (revela > 0) Valdor.brilhoRadial(ctx, 380, 900, 360, VERMELHO, 0.35 * revela);
    },
    // 11b) o Davi gira e acerta a assassina com a Lâmina Rubra (ela aparece de vez e voa para trás)
    golpe(ctx, u, d, api) {
      const r = paraNoImpacto(u / d, 0.32, 0.05), gira = api.ease.suave(cl((r - 0.12) / 0.2)), hit = r > 0.32, kh = (r - 0.32) * d;
      const cam = camRuina(api, { x: -0.35, y: 1.35, z: 2.0 + r * 0.2, cy: 900, f: 980 });
      const [tx, ty] = api.tremor(hit && kh < 0.2 ? 14 : 0);
      espada(api, mix(-2.4, 1.4, gira), 1.4);
      const ax = hit ? -0.75 - Math.min(1, kh * 2.2) * 0.5 : -0.75, ay = hit ? Math.max(0, Math.sin(Math.min(1, kh * 2.2) * Math.PI) * 0.35) : 0;
      ruina(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIE, pose: { braco_d: mix(-130, 80, gira), antebraco_d: -15, tronco: mix(10, -14, gira), coxa_d: 25, canela_d: -20, coxa_e: -20, canela_e: 20, _maos: { d: 'punho' }, _plantar: true }, expressao: 'determinado' }, 0.35, 5.1, 1.76, { olhaPara: [-0.8, 4.9], luz: LUZ_TOCHA }) },
        { f: () => api.personagem3d(cam, { ...ASS, pose: poseChave(r, [[0, { braco_d: -150, antebraco_d: -20, braco_e: 150, antebraco_e: 20, coxa_d: 20, coxa_e: -30, canela_e: 30 }], [0.32, { braco_d: -110, antebraco_d: -30, braco_e: 110, antebraco_e: 30, coxa_d: 30, coxa_e: -35, canela_e: 35 }], [0.38, { tronco: -40, cabeca: -30, braco_d: 150, antebraco_d: 20, braco_e: 130, antebraco_e: 20, coxa_d: -45, canela_d: 55, coxa_e: 10, canela_e: 30 }], [1, { tronco: -25, cabeca: -15, braco_d: 120, antebraco_d: 30, braco_e: 100, antebraco_e: 30, coxa_d: -30, canela_d: 40, coxa_e: 5, canela_e: 25 }]]), expressao: hit ? 'medo' : 'raiva' }, ax, 4.9, 1.72, { y: ay, olhaPara: [0.35, 5.1] }), alfa: hit ? 1 : 0.55, cor: hit ? undefined : 'rgba(255,40,40,0.5)' },
      ], { forca: 0.3, luzes: [{ x: 0.2, y: 1.4, z: 4.6, cor: '#FF4A3A', forca: 1.4, raio: 6 }],
        depois: ([rd, ra]) => { const m = rd.pontoMundo('antebraco_d', [0, 1]); Combate.corte(ctx, m.x + 60, m.y + 40, 330, -0.5, -3.9, cl((r - 0.12) / 0.22) * 1.3, { rgb: '255,70,60', espessura: 0.22 });
          if (hit) { const b = ra.pontoMundo('tronco', [0, -0.3]); Combate.impacto(ctx, b.x, b.y, 280, kh, { rgb: '255,90,80', dura: 0.5 }); Combate.numero(ctx, b.x, b.y - 260, '-280', kh, 'critico'); Combate.velocidade(ctx, b.x, b.y, Math.PI, Math.max(0, 1 - kh * 2), api.t); flash(ctx, kh, 0.5); } },
        fx: { cx: W / 2 + tx, cy: H / 2 + ty, zoom: soco(hit ? kh : -1, 0.12) } });
    },
    // 11c) os três caçadores de joelhos: a vida zera e o corpo desfaz em pixels de luz (saíram do jogo)
    derrota(ctx, u, d, api) {
      const r = u / d, cam = camDia(api, { x: 0.1, y: 1.5, z: 1.4 + r * 0.3, cy: 900, f: 1000, yaw: 0.02 });
      const ajoelha = (t) => ({ tronco: 26 + 3 * Math.sin(t * 2), cabeca: 32, braco_d: 8, antebraco_d: -12, braco_e: -8, antebraco_e: 12, coxa_d: -18, canela_d: 26, coxa_e: 12, canela_e: 18, _plantar: true });
      window.ARMA_ANG = { martelo: 160, arco: 40 }; window.ARCO = { puxa: 0, flecha: false, brilho: 0 };
      const H3 = [[ASS, -1.15, 5.2, 1.72, 0.18, '#FF7A7A'], [ARQ, 1.2, 5.6, 1.75, 0.36, '#9AF0A0'], [GIG, 0.05, 7.4, 2.6, 0.54, '#FFE08A']];
      const kd = (t0) => cl((r - t0) / 0.3);
      dia(ctx, api, cam, H3.map(([it, x, z, a, t0, cor]) => { const k = kd(t0); return { f: () => api.personagem3d(cam, { ...it, pose: ajoelha(api.t), expressao: 'medo' }, x, z, a, { olhaPara: [0, 2], luz: LUZ_TOCHA }), alfa: Math.max(0, 1 - k * 1.6), cor: k > 0 ? `rgba(170,235,255,${Math.min(0.85, k * 2.5)})` : undefined }; }), { forca: 0.3,
        fx3d: () => H3.map(([it, x, z, a, t0, cor]) => ({ tipo: 'pixels', x, z, alt: a, k: kd(t0), cor: '#A8ECFF', luz: kd(t0) > 0 && kd(t0) < 1 ? { x, y: 1.2, z, cor: '#9FE8FF', forca: 1.2 * Math.sin(Math.PI * kd(t0)), raio: 4 } : undefined })),
        depois: () => H3.forEach(([it, x, z, a, t0, cor]) => { const q = cam.p(x, a * 0.82 + 0.35, z), k = kd(t0), vida = cl(1 - (r - t0 + 0.12) / 0.12);
          if (k < 0.6) { vidaCabeca(ctx, q.x, q.y, vida, { w: 110, h: 14 }); }
          const kt = api.ease.suave(cl((r - t0 - 0.04) / 0.1)) * (1 - cl((r - t0 - 0.4) / 0.1)); if (kt > 0) etiquetaSaiu(ctx, q.x, q.y - 50, kt); }) });
    },
    // 12) loot dos caçadores perto do baú dourado e a barra do aluguel subindo
    loot(ctx, u, d, api) {
      const B = [2.6, 9.5];
      const cam = camRuina(api, { x: B[0] - 2.4, y: 1.7, z: B[1] - 4.2, cy: 900, f: 1050, yaw: 0.25 });
      ruina(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'feliz' }, B[0] - 2.2, B[1] - 1.2, 1.76, { olhaPara: B, luz: { lado: 1, forca: 0.9, cor: 'rgb(255,200,120)', sombra: 0.8 } }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: 'feliz' }, B[0] - 1.0, B[1] - 2.0, 1.8, { olhaPara: B, luz: { lado: 1, forca: 0.9, cor: 'rgb(255,200,120)', sombra: 0.8 } }) },
      ], { forca: 0.3, desfoque: 4 });
      const L = [{ nome: 'Arco longo', rar: 'raro', preco: 'R$ 28,00', icone: 'arco' }, { nome: 'Moedas', rar: 'comum', preco: 'R$ 21,30', icone: 'moedas' }, { nome: 'Adagas gêmeas', rar: 'raro', preco: 'R$ 32,00', icone: 'adagas' }];
      L.forEach((it, i) => { const k = api.fase(0.05 + i * 0.12, 0.35 + i * 0.12, 'volta'); carta3(ctx, 220 + i * 320, 900, 290, it, k, api.t); });
      const v = mix(418.08, 499.38, api.fase(0.55, 0.9)); Combate.aluguel(ctx, v / 1200, reaisTxt(v), { dias: '28 DIAS', y: 150 });
    },
    // 13) gancho: pôr do sol, o encapuzado na ponte com a lente, recompensa pelo Téo
    gancho(ctx, u, d, api) {
      const P0 = V().CAN_PONTE, x = 0.5;
      const cam = camDia(api, { f: 1150, x: x - 0.3, y: P0.y - 0.4, z: P0.z - 3.0, cy: 900, nevoa: V().nevoa(0, false, 'canion') });
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...ENC, pose: { braco_d: -100, antebraco_d: -40 } }, x, P0.z, 1.85, { y: P0.y - 2.2 * Math.sin(Math.PI * 0.52) + 0.05, rumo: Math.PI }) }], { noite: 0, forca: 0, bokeh: 4 });
      const k = api.fase(0.45, 0.75, 'volta');
      zoomEm(ctx, 540, 1350, k, () => { ctx.save(); ctx.fillStyle = 'rgba(40,8,12,0.92)'; ctx.strokeStyle = '#FF6A5A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(140, 1000, 800, 700, 40); ctx.fill(); ctx.stroke(); ctx.restore(); api.texto('RECOMPENSA', 540, 1100, 72, { cor: '#FF8A7A' }); ctx.save(); ctx.beginPath(); ctx.roundRect(390, 1150, 300, 300, 20); ctx.clip(); ctx.fillStyle = '#1A0A10'; ctx.fillRect(390, 1150, 300, 300); close(api, { ...TEOG, pose: 'parado', expressao: 'neutro' }, 540, 1320, 330, {}); ctx.restore(); api.texto('R$ 5.000', 540, 1545, 92, { cor: '#FFE680' }); api.texto('HOMEM-FERA VIVO', 540, 1640, 50); });
    },

    // ciência, parte 2: a fita do cérebro cheia de quadros
    ciencia2(ctx, u, d, api) { window.PLANOS.ciencia(ctx, u, d, api); api.texto('MAIS DETALHES POR SEGUNDO', 540, 1320, 46, { cor: '#BFE6FF' }); },
    // ---------- conversa andando: câmera de frente, fechando em quem fala (vozes do Davi e do Téo) ----------
    davi1(ctx, u, d, api) { papo(ctx, u, d, api, 'davi', expr('preocupado', { olhar: [-0.012, 0] }), 'neutro'); },
    teo1(ctx, u, d, api) { papo(ctx, u, d, api, 'teo', 'neutro', expr('preocupado', { olhar: [0.01, 0] })); },
    davi2(ctx, u, d, api) { papo(ctx, u, d, api, 'davi', 'espanto', 'neutro', { para: true }); },
    davi3(ctx, u, d, api) { papo(ctx, u, d, api, 'davi', expr('neutro', { olhar: [-0.012, 0] }), 'neutro'); },
    davi4(ctx, u, d, api) { papo(ctx, u, d, api, 'davi', expr('preocupado', { olhar: [-0.012, 0] }), 'neutro'); },
    // o Téo lembrando da noite: olhos amarelos e garras (tom vermelho)
    maos2(ctx, u, d, api) {
      const cam = camDia(api, { x: 0.1, y: 1.6, z: 3.0, cy: 760, f: 1500 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_d: 10, antebraco_d: -115, braco_e: -10, antebraco_e: 115, cabeca: 10 }, expressao: expr('preocupado', { olhar: [0, 0.01] }), voz: 'teo' }, 0.1, 5.2, 1.8, { rumo: 0.1 }) }], { forca: 0.3 });
      const r = u / d, k = cl((r - 0.2) / 0.1) * (1 - cl((r - 0.72) / 0.1));
      if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(70,0,0,0.75)'; ctx.fillRect(0, 0, W, H); close(api, { ...LOBO, pose: 'rugindo', expressao: 'rugido' }, 540, 980, 1100, {}); ctx.fillStyle = 'rgba(200,20,20,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
    // "Vinte e quatro horas?!": close do Davi em choque com o relógio
    horas(ctx, u, d, api) {
      const cam = camDia(api, { x: 0.1, y: 1.6, z: 3.4 + u * 0.3, cy: 760, f: 1500 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: { braco_d: 30, antebraco_d: -90, braco_e: -30, antebraco_e: 90 }, expressao: 'espanto', voz: 'davi' }, 0.1, 5.4, 1.76, { rumo: 0.05 }) }], { forca: 0.3, desfoque: 4 });
      relogio(ctx, 540, 380, '24:00:00', 1, 70);
    },
    // a regra: o relógio grande correndo
    regra(ctx, u, d, api) {
      const cam = camDia(api, { x: 0.2, y: 1.6, z: 3.2, cy: 820 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: 'parado', expressao: 'preocupado' }, -0.4, 5.4, 1.76, { rumo: 0.1 }) }, { f: () => api.personagem3d(cam, { ...TEOG, pose: 'parado', expressao: 'preocupado' }, 0.6, 5.6, 1.8, { rumo: -0.1 }) }], { forca: 0.3, desfoque: 7 });
      const s = 86400 - Math.floor(u * 3), hh = String(Math.floor(s / 3600)).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
      relogio(ctx, 540, 820, `${hh}:${mm}:${ss}`, api.fase(0, 0.2, 'volta'), 110);
    },
    // "Eu fico com a arqueira": o Téo puxa o escudo
    arqueira(ctx, u, d, api) {
      const cam = camDia(api, { x: 0.4, y: 1.55, z: 4.3, cy: 800, f: 1400 });
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_e: -50, antebraco_e: -60, braco_d: 20, antebraco_d: -30, coxa_d: 15, canela_d: -10, coxa_e: -15, canela_e: 15, _plantar: true }, expressao: 'determinado', voz: 'teo' }, 0.5, 6.0, 1.8, { olhaPara: [-5.2, 15] }) }], { forca: 0.3 });
    },
    // "Ai! Essa doeu!": câmera de lado — uma flecha passa pela rachadura do gelo e acerta o ombro do Davi
    ai(ctx, u, d, api) {
      const cam = camDia(api, { x: 3.6, y: 1.3, z: 4.9, cy: 920, f: 1100, yaw: -Math.PI / 2 });
      const r = u / d, voo = cl(r / 0.25), acerta = r > 0.25, ka = (r - 0.25);
      const fx = [{ tipo: 'gelo', x: 0, z: 4.4, larg: 2.9, alt: 2.3, k: 1, racha: 1 }, flecha3d([0.12, 1.5, 1.6], [0.12, 1.36, 5.3], voo, { s: 1.5 })];
      dia(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...DAVIA, pose: acerta ? poseChave(ka, [[0, { braco_d: -20, antebraco_d: -30, braco_e: 20, antebraco_e: 30, _plantar: true }], [0.08, { coxa_d: -55, canela_d: 85, coxa_e: 22, canela_e: 42, tronco: 18, braco_d: 35, antebraco_d: -115, braco_e: -25, _plantar: true }], [1, { coxa_d: -45, canela_d: 75, coxa_e: 18, canela_e: 38, tronco: 12, braco_d: 30, antebraco_d: -105, braco_e: -18, _plantar: true }]]) : 'conjurando', expressao: acerta ? 'medo' : 'determinado', voz: 'davi' }, 0, 5.6, 1.76, { olhaPara: [0, 2], luz: LUZ_TOCHA }) }], { forca: 0.3, fx3d: () => fx,
        depois: ([rig]) => {
          const a = rig.pontoMundo('braco_d', [0, 0.12]);
          if (acerta) { Combate.impacto(ctx, a.x, a.y, 200, ka, { rgb: '255,90,80', dura: 0.5 }); Combate.numero(ctx, a.x + 40, a.y - 160, '-45', ka, 'recebido'); flash(ctx, ka, 0.5); }
        },
        fx: { zoom: soco(acerta ? ka : -1, 0.1) } });
      if (acerta) { ctx.save(); const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(200,0,0,0)'); v.addColorStop(1, `rgba(200,0,0,${0.35 + 0.1 * Math.sin(api.t * 8)})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
    // "Sem arco, sem flecha.": o Téo em cima do rochedo, o arco partido
    arco(ctx, u, d, api) {
      const S = V().CAN_ROCHA;
      const cam = camDia(api, { x: -3.2, y: S.y + 1.4, z: 11.8, cy: 900, f: 1200, yaw: -0.45 });
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_e: -40, antebraco_e: -50, braco_d: 30, antebraco_d: -20 }, expressao: 'feliz', voz: 'teo' }, -4.7, 14.6, 1.8, { y: S.y, olhaPara: [-5.6, 15.6] }) },
        { f: () => api.personagem3d(cam, { ...ARQ, pose: { braco_d: 60, braco_e: -60, tronco: -15 }, expressao: 'espanto' }, -5.7, 15.6, 1.75, { y: S.y, olhaPara: [-4.7, 14.6] }) },
      ], { forca: 0.2, depois: () => { const q = cam.p(-5.2, S.y + 0.1, 15.1); for (const sd of [-1, 1]) { ctx.save(); ctx.translate(q.x + sd * 30, q.y); ctx.rotate(sd * 0.9); ctx.strokeStyle = '#7A4A26'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 60, -0.6, 0.6); ctx.stroke(); ctx.restore(); } } });
    },
    // "Cadê ela?!": os dois de costas um pro outro
    cade(ctx, u, d, api) {
      const cam = camDia(api, { x: 0, y: 1.5, z: 3.2 + u * 0.2, cy: 840, f: 1250 });
      espada(api, -2.2, 1.1);
      dia(ctx, api, cam, [
        { f: () => api.personagem3d(cam, { ...DAVIE, pose: { braco_d: 80, antebraco_d: -20, _maos: { d: 'punho' } }, expressao: 'preocupado' }, -0.35, 5.3, 1.76, { olhaPara: [-3, 5.1] }) },
        { f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_e: -50, antebraco_e: -60, coxa_d: 15, coxa_e: -15 }, expressao: 'medo', voz: 'teo' }, 0.4, 5.4, 1.8, { olhaPara: [3, 5.5] }) },
      ], { forca: 0.3, depois: () => pegadas(ctx, cam, [[1.6, 7.0], [1.3, 6.6], [0.9, 6.3]], api.fase(0.2, 0.9)) });
    },
    // a piada no fim: o Téo rindo, o Davi respondendo
    entregar(ctx, u, d, api) { papo(ctx, u, d, api, 'teo', 'neutro', 'rindo'); },
    engracado(ctx, u, d, api) { papo(ctx, u, d, api, 'davi', expr('feliz', { olhar: [-0.012, 0] }), 'rindo'); },
    // gancho em duas partes: o pôr do sol e as mãos do Téo; depois o encapuzado na ponte
    gancho1(ctx, u, d, api) {
      const cam = camDia(api, { x: 0, y: 1.55, z: 3.2, cy: 820, f: 1300, nevoa: V().nevoa(0, false, 'canion') });
      noite(ctx, api, cam, [{ f: () => api.personagem3d(cam, { ...TEOG, pose: { braco_d: 10, antebraco_d: -115, braco_e: -10, antebraco_e: 115, cabeca: 14 }, expressao: expr('medo', { olhar: [0, 0.012] }) }, 0.1, 5.2, 1.8, { rumo: 0.1, tremor: 1 }) }], { noite: 0, forca: 0.3 });
      relogio(ctx, 540, 360, '23:41:07', 1, 64);
    },
    // 14) cartela
    parte(ctx, u, d, api) {
      const cam = camDia(api, { x: 0, y: 1.6, z: 0 });
      dia(ctx, api, cam, [], { desfoque: 14, forca: 0 });
      ctx.fillStyle = 'rgba(30,10,10,0.5)'; ctx.fillRect(0, 0, W, H);
      const k = api.fase(0, 0.35, 'volta'); zoomEm(ctx, 540, 760, k, () => { api.texto('PARTE', 540, 680, 120); api.texto('4', 540, 850, 230, { cor: AMARELO }); });
      const k2 = api.fase(0.4, 0.75, 'volta'); zoomEm(ctx, 540, 1130, k2, () => { api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 5', 540, 1190, 96, { cor: AMARELO }); });
    },
  };
})();

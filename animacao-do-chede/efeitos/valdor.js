// Efeitos e objetos 2D da série nova (VALDOR), no estilo do vídeo de referência:
// celular na mão, itens em feixes de luz, etiquetas de preço, raio-X (cabeça, ouvido interno, cérebro, corpo),
// grade "1 em 1.000", cartas de vidro, plaquinha de nível, barra de experiência, gosma, números de dano,
// faísca de magia, transição do visor, sala de cápsulas, caixa e capacete de realidade virtual.
// Tudo em coordenadas de tela (px). Uso: Valdor.<função>(ctx, ...).
(function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const FONTE = (peso, tam) => `${peso} ${tam}px Inter`;
  const ROXO = '#9B5CFF', AZUL = '#3E8EF0', OURO = '#F2B53A', CIANO = '#6FC8FF';

  function brilhoRadial(ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.4, `rgba(${rgb},${a * 0.4})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  function textoSimples(ctx, txt, x, y, tam, cor, o = {}) {
    ctx.save(); ctx.font = FONTE(o.peso || 800, tam); ctx.textAlign = o.alinhar || 'center'; ctx.textBaseline = 'middle';
    if (o.contorno) { ctx.lineJoin = 'round'; ctx.lineWidth = tam * 0.18; ctx.strokeStyle = o.contorno; ctx.strokeText(txt, x, y); }
    ctx.fillStyle = cor; ctx.fillText(txt, x, y); ctx.restore();
  }

  // ---------- celular na mão (close em primeira pessoa) ----------
  // o: { saldo, vermelho, botao: 0..1 (aparece o botão COMPRAR; >0.7 = apertado), pele, titulo, linhas }
  function celular(ctx, x, y, h, o = {}) {
    const w = h * 0.49, r = h * 0.07, pele = o.pele || '#8F5B3E', peleS = Estilo.multiply(pele, '#B8A8C8');
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || -0.06);
    // mão esquerda: palma atrás do aparelho (aparece embaixo à esquerda)
    ctx.fillStyle = peleS; ctx.beginPath(); ctx.roundRect(-w * 0.78, h * 0.12, w * 0.7, h * 0.7, w * 0.3); ctx.fill();
    ctx.fillStyle = pele; ctx.beginPath(); ctx.roundRect(-w * 0.8, h * 0.1, w * 0.66, h * 0.68, w * 0.3); ctx.fill();
    // aparelho
    ctx.fillStyle = '#141820'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill();
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#1E2533'); g.addColorStop(1, '#121722');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-w / 2 + h * 0.02, -h / 2 + h * 0.02, w - h * 0.04, h - h * 0.04, r * 0.8); ctx.fill();
    ctx.fillStyle = '#05070A'; ctx.beginPath(); ctx.roundRect(-w * 0.12, -h * 0.47, w * 0.24, h * 0.025, h * 0.012); ctx.fill();
    // tela do banco
    textoSimples(ctx, o.titulo || 'SALDO', -w * 0.38, -h * 0.34, h * 0.03, '#8C96AA', { alinhar: 'left', peso: 700 });
    textoSimples(ctx, o.saldo || 'R$ 0,00', -w * 0.38, -h * 0.27, h * 0.062, o.vermelho ? '#FF5A5F' : '#FFFFFF', { alinhar: 'left', peso: 900 });
    ctx.fillStyle = '#2A3242';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(-w * 0.38, -h * 0.16 + i * h * 0.075, w * 0.76, h * 0.05, h * 0.012); ctx.fill(); }
    for (const [i, txt] of (o.linhas || []).entries()) {
      textoSimples(ctx, txt[0], -w * 0.34, -h * 0.135 + i * h * 0.075, h * 0.02, '#C8D0DE', { alinhar: 'left', peso: 700 });
      textoSimples(ctx, txt[1], w * 0.34, -h * 0.135 + i * h * 0.075, h * 0.021, '#FF7A7F', { alinhar: 'right', peso: 800 });
    }
    if (o.botao > 0) {
      const k = clamp(o.botao / 0.3, 0, 1), aperta = o.botao > 0.7 ? 0.94 : 1;
      ctx.save(); ctx.translate(0, h * 0.3); ctx.scale(k * aperta, k * aperta);
      ctx.fillStyle = o.botao > 0.7 ? '#2FA36B' : '#3BC27E'; ctx.beginPath(); ctx.roundRect(-w * 0.36, -h * 0.045, w * 0.72, h * 0.09, h * 0.045); ctx.fill();
      textoSimples(ctx, o.botaoTexto || 'COMPRAR', 0, 0, h * 0.036, '#FFFFFF', { peso: 900 });
      ctx.restore();
    }
    // dedos da mão esquerda dobrados sobre a borda do aparelho
    for (let i = 0; i < 3; i++) {
      const fy = h * (0.04 + i * 0.1);
      ctx.fillStyle = peleS; ctx.beginPath(); ctx.roundRect(-w * 0.6, fy + h * 0.006, w * 0.2, h * 0.075, h * 0.037); ctx.fill();
      ctx.fillStyle = pele; ctx.beginPath(); ctx.roundRect(-w * 0.6, fy, w * 0.19, h * 0.07, h * 0.035); ctx.fill();
      ctx.fillStyle = Estilo.screen(pele, '#FFE8D8', 0.3); ctx.beginPath(); ctx.ellipse(-w * 0.44, fy + h * 0.035, w * 0.025, h * 0.02, 0, 0, TAU); ctx.fill();
    }
    // mão direita: palma embaixo à direita e polegar indo até o botão
    const aperta = o.botao > 0.55;
    ctx.fillStyle = peleS; ctx.beginPath(); ctx.roundRect(w * 0.12, h * 0.36, w * 0.7, h * 0.6, w * 0.3); ctx.fill();
    ctx.fillStyle = pele; ctx.beginPath(); ctx.roundRect(w * 0.14, h * 0.34, w * 0.68, h * 0.6, w * 0.3); ctx.fill();
    const px = aperta ? w * 0.02 : w * 0.24, py = aperta ? h * 0.3 : h * 0.4;
    ctx.save(); ctx.translate(w * 0.36, h * 0.5);
    const ang = Math.atan2(py - h * 0.5, px - w * 0.36), L = Math.hypot(px - w * 0.36, py - h * 0.5) + w * 0.08;
    ctx.rotate(ang);
    ctx.fillStyle = peleS; ctx.beginPath(); ctx.roundRect(0, -w * 0.085, L, w * 0.18, w * 0.09); ctx.fill();
    ctx.fillStyle = pele; ctx.beginPath(); ctx.roundRect(0, -w * 0.095, L, w * 0.17, w * 0.085); ctx.fill();
    ctx.fillStyle = Estilo.screen(pele, '#FFE8D8', 0.35); ctx.beginPath(); ctx.ellipse(L - w * 0.07, -w * 0.01, w * 0.05, w * 0.045, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---------- feixe de luz de vitrine + itens ----------
  function feixe(ctx, x, yTopo, yBase, larg, rgb, a = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, yTopo, 0, yBase); g.addColorStop(0, `rgba(${rgb},${0.0})`); g.addColorStop(0.3, `rgba(${rgb},${0.22 * a})`); g.addColorStop(1, `rgba(${rgb},${0.38 * a})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - larg * 0.18, yTopo); ctx.lineTo(x + larg * 0.18, yTopo); ctx.lineTo(x + larg / 2, yBase); ctx.lineTo(x - larg / 2, yBase); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(${rgb},${0.7 * a})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, yBase, larg / 2, larg * 0.08, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  function escudoComum(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#6E6A78'; ctx.beginPath(); ctx.arc(0, 0, s * 0.52, 0, TAU); ctx.fill();
    ctx.fillStyle = '#A8A4B2'; ctx.beginPath(); ctx.arc(0, 0, s * 0.46, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7E7A8A'; ctx.lineWidth = s * 0.03; for (const t of [-0.16, 0.16]) { ctx.beginPath(); ctx.moveTo(t * s, -s * 0.43); ctx.lineTo(t * s, s * 0.43); ctx.stroke(); }
    ctx.fillStyle = '#6E6A78'; ctx.beginPath(); ctx.arc(0, 0, s * 0.12, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function anelRaro(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.cos(t * 1.6) * 0.35 + 0.65, 1);
    ctx.strokeStyle = '#D9B04A'; ctx.lineWidth = s * 0.1; ctx.beginPath(); ctx.ellipse(0, s * 0.08, s * 0.3, s * 0.32, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.ellipse(-s * 0.03, s * 0.06, s * 0.28, s * 0.3, 0, 3.6, 5.2); ctx.stroke();
    ctx.fillStyle = AZUL; ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(s * 0.13, -s * 0.28); ctx.lineTo(0, -s * 0.16); ctx.lineTo(-s * 0.13, -s * 0.28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#BFE0FF'; ctx.beginPath(); ctx.moveTo(-s * 0.03, -s * 0.38); ctx.lineTo(s * 0.04, -s * 0.3); ctx.lineTo(-s * 0.06, -s * 0.28); ctx.fill();
    ctx.restore();
    brilhoRadial(ctx, x, y - s * 0.28, s * 0.35, '62,142,240', 0.5);
  }
  // Adaga Eclipse (épica): lâmina roxa com runas, cabo escuro, gema; ang = giro (rad)
  function adagaEpica(ctx, x, y, s, t, ang = -0.6, o = {}) {
    brilhoRadial(ctx, x, y, s * 0.9, '155,92,255', 0.55 * (o.brilho === undefined ? 1 : o.brilho));
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = '#2A2238'; ctx.beginPath(); ctx.roundRect(-s * 0.045, s * 0.12, s * 0.09, s * 0.3, s * 0.03); ctx.fill();
    ctx.fillStyle = '#C9A24A'; ctx.beginPath(); ctx.roundRect(-s * 0.2, s * 0.08, s * 0.4, s * 0.06, s * 0.03); ctx.fill();
    ctx.fillStyle = ROXO; ctx.beginPath(); ctx.arc(0, s * 0.11, s * 0.045, 0, TAU); ctx.fill();
    const g = ctx.createLinearGradient(-s * 0.08, 0, s * 0.08, 0); g.addColorStop(0, '#5B2DB8'); g.addColorStop(0.5, '#C9A8FF'); g.addColorStop(1, '#6E3CD6');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-s * 0.08, s * 0.08); ctx.lineTo(s * 0.08, s * 0.08); ctx.quadraticCurveTo(s * 0.1, -s * 0.3, 0, -s * 0.62); ctx.quadraticCurveTo(-s * 0.1, -s * 0.3, -s * 0.08, s * 0.08); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,240,255,${0.6 + 0.4 * Math.sin(t * 5)})`;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -s * (0.05 + i * 0.15), s * 0.018, 0, TAU); ctx.fill(); }
    ctx.restore();
    // brilhinhos
    const r = rng(5);
    for (let i = 0; i < 6; i++) { const a = r() * TAU + t * 0.8, d = s * (0.3 + r() * 0.4), k = (Math.sin(t * 4 + i * 2) + 1) / 2; estrela(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, s * 0.04 * k, '#F1E6FF'); }
  }
  function estrela(ctx, x, y, r, cor) {
    if (r <= 0.3) return;
    ctx.save(); ctx.fillStyle = cor; ctx.beginPath();
    for (let j = 0; j < 8; j++) { const a = (j * Math.PI) / 4, rr = j % 2 ? r * 0.28 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // etiqueta de preço (pílula), aparece com k (0..1)
  function etiqueta(ctx, x, y, txt, cor = '#FFFFFF', k = 1, o = {}) {
    if (k <= 0) return;
    const tam = o.tam || 54;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = FONTE(900, tam); const w = ctx.measureText(txt).width + tam * 0.9;
    ctx.fillStyle = o.fundo || 'rgba(14,16,24,0.82)'; ctx.beginPath(); ctx.roundRect(-w / 2, -tam * 0.75, w, tam * 1.5, tam * 0.75); ctx.fill();
    ctx.strokeStyle = cor; ctx.lineWidth = tam * 0.07; ctx.stroke();
    textoSimples(ctx, txt, 0, tam * 0.04, tam, cor, { peso: 900 });
    ctx.restore();
  }

  // ---------- raio-X ----------
  function raioFundo(ctx, t, o = {}) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, H * 0.8);
    g.addColorStop(0, '#1B5A66'); g.addColorStop(1, '#082129');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const passo = o.passo || 90, ox = (o.ox || 0) % passo, oy = (o.oy || 0) % passo;
    ctx.strokeStyle = 'rgba(140,220,230,0.08)'; ctx.lineWidth = 2;
    for (let x = ox - passo; x < W + passo; x += passo) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = oy - passo; y < H + passo; y += passo) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }
  const LINHA_RX = 'rgba(214,246,250,0.85)', PREENCHE_RX = 'rgba(170,230,240,0.10)';
  // cabeça de perfil olhando para a direita. (x, y) = centro do crânio; s = raio do crânio em px.
  // o: { cerebro: 0..1 aceso, dopamina: 0..1, ouvido: 0..1 destaque, onda: 0..1 (pulso do capacete ao ouvido), capacete: true, t }
  function cabecaRaio(ctx, x, y, s, o = {}) {
    const t = o.t || 0;
    ctx.save(); ctx.translate(x, y);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // pescoço e coluna
    ctx.fillStyle = PREENCHE_RX; ctx.strokeStyle = LINHA_RX; ctx.lineWidth = s * 0.018;
    ctx.beginPath(); ctx.moveTo(-s * 0.45, s * 0.75); ctx.lineTo(-s * 0.5, s * 1.9); ctx.moveTo(s * 0.25, s * 0.95); ctx.lineTo(s * 0.2, s * 1.9); ctx.stroke();
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(214,246,250,0.55)'; ctx.beginPath(); ctx.roundRect(-s * 0.32, s * (0.8 + i * 0.18), s * 0.24, s * 0.13, s * 0.04); ctx.stroke(); }
    // contorno do rosto (perfil)
    const cab = new Path2D();
    cab.moveTo(-s * 0.55, s * 0.78); cab.bezierCurveTo(-s * 1.05, s * 0.3, -s * 1.05, -s * 0.85, -s * 0.1, -s * 1.0);
    cab.bezierCurveTo(s * 0.6, -s * 1.05, s * 0.95, -s * 0.55, s * 0.92, -s * 0.15);
    cab.lineTo(s * 0.98, s * 0.05); cab.quadraticCurveTo(s * 1.2, s * 0.22, s * 1.02, s * 0.32); // nariz
    cab.lineTo(s * 1.0, s * 0.45); cab.quadraticCurveTo(s * 1.06, s * 0.52, s * 0.98, s * 0.58); // boca
    cab.quadraticCurveTo(s * 0.98, s * 0.8, s * 0.7, s * 0.85); cab.quadraticCurveTo(s * 0.4, s * 0.9, s * 0.25, s * 0.95);
    ctx.fillStyle = PREENCHE_RX; ctx.fill(cab); ctx.strokeStyle = LINHA_RX; ctx.lineWidth = s * 0.022; ctx.stroke(cab);
    // crânio
    ctx.strokeStyle = 'rgba(214,246,250,0.55)'; ctx.lineWidth = s * 0.014;
    ctx.beginPath(); ctx.ellipse(-s * 0.05, -s * 0.25, s * 0.82, s * 0.68, -0.08, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(s * 0.62, -s * 0.05, s * 0.12, s * 0.1, 0, 0, TAU); ctx.stroke(); // olho
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.roundRect(s * (0.5 + i * 0.075), s * 0.5, s * 0.06, s * 0.09, s * 0.015); ctx.stroke(); }
    // cérebro rosa com dobras
    const ac = o.cerebro || 0;
    ctx.save();
    const cer = new Path2D(); cer.ellipse(-s * 0.08, -s * 0.33, s * 0.72, s * 0.55, -0.08, 0, TAU);
    ctx.fillStyle = `rgba(${Math.round(214 + 30 * ac)},${Math.round(120 + 60 * ac)},${Math.round(170 + 20 * ac)},${0.45 + 0.3 * ac})`; ctx.fill(cer);
    ctx.clip(cer);
    ctx.strokeStyle = `rgba(150,40,110,${0.5})`; ctx.lineWidth = s * 0.02;
    const r = rng(17);
    for (let i = 0; i < 16; i++) { const cx = -s * 0.7 + r() * s * 1.3, cy = -s * 0.8 + r() * s * 0.9; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.bezierCurveTo(cx + s * 0.15, cy - s * 0.1, cx + s * 0.1, cy + s * 0.2, cx + s * 0.3, cy + s * 0.1); ctx.stroke(); }
    ctx.restore();
    if (ac > 0) brilhoRadial(ctx, -s * 0.08, -s * 0.33, s * 0.95, '255,180,230', 0.35 * ac);
    // dopamina: pontinhos dourados se espalhando a partir do centro
    if (o.dopamina > 0) {
      const rd = rng(23);
      for (let i = 0; i < 70; i++) {
        const a = rd() * TAU, vel = 0.4 + rd() * 0.6, fase = rd(), prog = ((o.dopamina * 1.4 * vel + fase * 0.3) % 1);
        const d = prog * s * 0.62, px = -s * 0.1 + Math.cos(a) * d * 1.2, py = -s * 0.35 + Math.sin(a) * d;
        const al = Math.sin(prog * Math.PI) * clamp(o.dopamina * 3, 0, 1);
        ctx.fillStyle = `rgba(255,214,90,${al})`; ctx.beginPath(); ctx.arc(px, py, s * 0.022, 0, TAU); ctx.fill();
      }
      brilhoRadial(ctx, -s * 0.1, -s * 0.35, s * 0.7, '255,200,80', 0.4 * clamp(o.dopamina * 2, 0, 1));
    }
    // ouvido interno (labirinto) atrás do olho
    const ox = s * 0.05, oy = s * 0.1, oo = o.ouvido || 0;
    if (oo > 0) brilhoRadial(ctx, ox, oy, s * 0.35, '111,200,255', 0.6 * oo);
    if (!o.semOuvido) labirinto(ctx, ox, oy, s * 0.13, t, { brilho: oo });
    // capacete em volta (sem tocar)
    if (o.capacete) {
      ctx.strokeStyle = 'rgba(190,230,255,0.75)'; ctx.lineWidth = s * 0.05;
      ctx.beginPath(); ctx.ellipse(-s * 0.02, -s * 0.28, s * 1.12, s * 0.98, -0.08, Math.PI * 0.82, Math.PI * 2.05); ctx.stroke();
      ctx.fillStyle = 'rgba(80,140,200,0.35)'; ctx.beginPath(); ctx.roundRect(s * 0.75, -s * 0.35, s * 0.42, s * 0.45, s * 0.1); ctx.fill(); ctx.stroke();
    }
    // pulso do capacete até o ouvido
    if (o.onda > 0) {
      const sx = -s * 0.95, sy = s * 0.05;
      for (let i = 0; i < 3; i++) {
        const p = ((o.onda * 1.6 + i * 0.33) % 1), px = sx + (ox - sx) * p, py = sy + (oy - sy) * p;
        ctx.strokeStyle = `rgba(140,215,255,${Math.sin(p * Math.PI)})`; ctx.lineWidth = s * 0.025;
        ctx.beginPath(); ctx.arc(px, py, s * 0.08, -0.9, 0.9); ctx.stroke();
      }
    }
    ctx.restore();
  }
  // labirinto do ouvido: três canais em arco + cóclea em espiral, com o líquido balançando
  function labirinto(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y);
    const b = o.brilho || 0, cor = `rgba(${Math.round(190 + 60 * b)},${Math.round(230 + 20 * b)},255,0.9)`;
    ctx.strokeStyle = cor; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.9, s * 0.75, Math.PI * 0.85, Math.PI * 2.1); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-s * 1.0, -s * 0.2, s * 0.7, s * 0.45, 0.6, Math.PI * 0.5, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(s * 0.2, -s * 0.15, s * 0.35, s * 0.7, -0.3, Math.PI * 1.2, Math.PI * 2.6); ctx.stroke();
    // cóclea
    ctx.beginPath();
    for (let a = 0; a < TAU * 2.3; a += 0.15) { const r = s * (0.7 - a * 0.045); const px = s * 0.9 + Math.cos(a) * r, py = s * 0.7 + Math.sin(a) * r; if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
    // líquido (pontinhos correndo nos canais)
    if (o.liquido !== false) {
      ctx.fillStyle = `rgba(111,200,255,${0.6 + 0.4 * b})`;
      for (let i = 0; i < 5; i++) { const a = Math.PI * 0.9 + ((t * 0.9 + i * 0.25) % 1.2) + Math.sin(t * 3) * 0.1; ctx.beginPath(); ctx.arc(-s * 0.3 + Math.cos(a) * s * 0.75, -s * 0.9 + Math.sin(a) * s * 0.75, s * 0.07, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }
  // boneco de raio-X de corpo inteiro andando (passo: fase da caminhada)
  function corpoRaio(ctx, x, y, s, passo, o = {}) {
    // (x, y) = pés; s = altura em px
    const k = s / 10, sw = Math.sin(passo * TAU), ac = o.cerebro || 0;
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const osso = (a, b, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    ctx.strokeStyle = LINHA_RX;
    const quad = [0, -5 * k], ombro = [0.2 * k, -8.2 * k];
    for (const lado of [1, -1]) {
      const fs = sw * lado, joelho = [quad[0] + fs * 1.0 * k, -2.6 * k], pe = [quad[0] + fs * 1.6 * k, Math.min(0, -fs * 0.4 * k)];
      ctx.globalAlpha = lado > 0 ? 1 : 0.5; osso(quad, joelho, 0.32 * k); osso(joelho, pe, 0.28 * k);
      const cot = [ombro[0] - fs * 0.8 * k, -6.2 * k], mao = [ombro[0] - fs * 1.2 * k, -4.6 * k];
      osso(ombro, cot, 0.26 * k); osso(cot, mao, 0.22 * k);
    }
    ctx.globalAlpha = 1;
    osso(quad, ombro, 0.4 * k);
    ctx.fillStyle = PREENCHE_RX; ctx.lineWidth = 0.12 * k;
    ctx.beginPath(); ctx.ellipse(0.1 * k, -6.9 * k, 1.1 * k, 1.6 * k, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0.35 * k, -9.1 * k, 0.85 * k, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = `rgba(230,140,190,${0.5 + 0.4 * ac})`; ctx.beginPath(); ctx.ellipse(0.3 * k, -9.3 * k, 0.6 * k, 0.45 * k, 0, 0, TAU); ctx.fill();
    if (ac > 0) brilhoRadial(ctx, 0.3 * k, -9.3 * k, 1.6 * k, '255,180,230', 0.6 * ac);
    ctx.restore();
  }

  // ---------- grade "1 em 1.000" ----------
  // k: quantos pontos já apareceram (0..1); roxo: 0..1 (o ponto escolhido acende); devolve a posição do ponto roxo
  function grade1000(ctx, cx, cy, larg, k, roxo, t) {
    const cols = 25, lin = 40, passo = larg / cols, x0 = cx - larg / 2 + passo / 2, y0 = cy - (lin * passo) / 2 + passo / 2;
    const alvo = [17, 23], n = Math.floor(k * cols * lin);
    for (let i = 0; i < n; i++) {
      const c = i % cols, l = Math.floor(i / cols);
      if (c === alvo[0] && l === alvo[1] && roxo > 0) continue;
      ctx.fillStyle = 'rgba(200,205,220,0.55)'; ctx.beginPath(); ctx.arc(x0 + c * passo, y0 + l * passo, passo * 0.32, 0, TAU); ctx.fill();
    }
    const px = x0 + alvo[0] * passo, py = y0 + alvo[1] * passo;
    if (roxo > 0) {
      brilhoRadial(ctx, px, py, passo * 3 * roxo, '155,92,255', 0.9);
      ctx.fillStyle = ROXO; ctx.beginPath(); ctx.arc(px, py, passo * (0.32 + 0.25 * roxo + 0.05 * Math.sin(t * 6)), 0, TAU); ctx.fill();
    }
    return [px, py];
  }

  // ---------- carta de vidro (holograma) ----------
  // o: { brilho: 0..1 (escolhida), icone: (ctx, x, y, s) => {}, alfa, cor }
  function carta(ctx, x, y, w, h, rotulo, o = {}) {
    const a = o.alfa === undefined ? 1 : o.alfa, b = o.brilho || 0, cor = o.cor || '255,255,255';
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    if (b > 0) brilhoRadial(ctx, x, y, w * 1.2, '200,235,255', 0.6 * b);
    const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2); g.addColorStop(0, `rgba(${cor},0.32)`); g.addColorStop(1, `rgba(${cor},0.14)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, w * 0.08); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.75 + 0.25 * b})`; ctx.lineWidth = Math.max(2, w * (0.018 + 0.02 * b)); ctx.stroke();
    if (b > 0) { ctx.strokeStyle = `rgba(255,255,255,${0.5 * b})`; ctx.lineWidth = w * 0.01; ctx.beginPath(); ctx.roundRect(x - w / 2 - w * 0.05, y - h / 2 - w * 0.05, w * 1.1, h + w * 0.1, w * 0.1); ctx.stroke(); }
    // reflexo diagonal
    ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, w * 0.08); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h * 0.1); ctx.lineTo(x - w * 0.1, y - h / 2); ctx.lineTo(x + w * 0.1, y - h / 2); ctx.lineTo(x - w / 2, y + h * 0.15); ctx.fill();
    ctx.restore();
    if (o.icone) o.icone(ctx, x, y - h * 0.08, w * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - w / 2 + w * 0.06, y + h * 0.27, w * 0.88, h * 0.16);
    textoSimples(ctx, rotulo, x, y + h * 0.35, w * 0.12, '#FFFFFF', { peso: 900, contorno: 'rgba(20,30,50,0.55)' });
    ctx.restore();
  }
  // ícones simples para as cartas (silhuetas)
  const ICONES = {
    HUMANO: (c, x, y, s) => silhueta(c, x, y, s, {}),
    ELFO: (c, x, y, s) => silhueta(c, x, y, s, { orelha: true }),
    'ANÃO': (c, x, y, s) => silhueta(c, x, y, s, { baixo: true, barba: true }),
    'HOMEM-FERA': (c, x, y, s) => silhueta(c, x, y, s, { orelhasFera: true }),
    MAGO: (c, x, y, s) => { silhueta(c, x, y, s, { manto: true }); estrela(c, x + s * 0.32, y - s * 0.05, s * 0.12, '#BFE6FF'); brilhoRadial(c, x + s * 0.32, y - s * 0.05, s * 0.25, '111,200,255', 0.8); },
    ASSASSINO: (c, x, y, s) => silhueta(c, x, y, s, { capuz: true }),
    'GUARDIÃO': (c, x, y, s) => { silhueta(c, x, y, s, {}); c.fillStyle = 'rgba(240,250,255,0.9)'; c.beginPath(); c.arc(x + s * 0.24, y + s * 0.05, s * 0.18, 0, TAU); c.fill(); },
    PALADINO: (c, x, y, s) => { silhueta(c, x, y, s, {}); c.fillStyle = '#FFE38A'; c.fillRect(x - s * 0.03, y - s * 0.05, s * 0.06, s * 0.3); c.fillRect(x - s * 0.1, y + s * 0.03, s * 0.2, s * 0.05); },
  };
  function silhueta(c, x, y, s, o) {
    c.save(); c.fillStyle = 'rgba(235,245,255,0.92)';
    const k = o.baixo ? 0.8 : 1;
    c.beginPath(); c.arc(x, y - s * 0.32 * k, s * 0.16, 0, TAU); c.fill();
    if (o.manto) { c.beginPath(); c.moveTo(x - s * 0.2, y - s * 0.14); c.lineTo(x + s * 0.2, y - s * 0.14); c.lineTo(x + s * 0.3, y + s * 0.45); c.lineTo(x - s * 0.3, y + s * 0.45); c.closePath(); c.fill(); }
    else { c.beginPath(); c.roundRect(x - s * 0.2 * (o.baixo ? 1.25 : 1), y - s * 0.14 * k, s * 0.4 * (o.baixo ? 1.25 : 1), s * 0.4 * k, s * 0.08); c.fill(); c.fillRect(x - s * 0.15, y + s * 0.2 * k, s * 0.11, s * 0.26 * k); c.fillRect(x + s * 0.04, y + s * 0.2 * k, s * 0.11, s * 0.26 * k); }
    if (o.orelha) { c.beginPath(); c.moveTo(x - s * 0.14, y - s * 0.34); c.lineTo(x - s * 0.3, y - s * 0.46); c.lineTo(x - s * 0.15, y - s * 0.26); c.fill(); c.beginPath(); c.moveTo(x + s * 0.14, y - s * 0.34); c.lineTo(x + s * 0.3, y - s * 0.46); c.lineTo(x + s * 0.15, y - s * 0.26); c.fill(); }
    if (o.orelhasFera) { for (const l of [-1, 1]) { c.beginPath(); c.moveTo(x + l * s * 0.06, y - s * 0.45); c.lineTo(x + l * s * 0.17, y - s * 0.62); c.lineTo(x + l * s * 0.18, y - s * 0.4); c.fill(); } }
    if (o.barba) { c.beginPath(); c.moveTo(x - s * 0.13, y - s * 0.25); c.lineTo(x + s * 0.13, y - s * 0.25); c.lineTo(x, y - s * 0.02); c.fill(); }
    if (o.capuz) { c.beginPath(); c.moveTo(x - s * 0.2, y - s * 0.2); c.quadraticCurveTo(x - s * 0.22, y - s * 0.55, x, y - s * 0.55); c.quadraticCurveTo(x + s * 0.22, y - s * 0.55, x + s * 0.2, y - s * 0.2); c.fill(); c.fillStyle = 'rgba(30,40,60,0.8)'; c.beginPath(); c.arc(x, y - s * 0.32, s * 0.1, 0, TAU); c.fill(); }
    c.restore();
  }

  // ---------- nível, experiência, dano ----------
  function placaNivel(ctx, x, y, nv, k = 1, o = {}) {
    if (k <= 0) return;
    const tam = o.tam || 40;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = FONTE(900, tam); const txt = 'NV ' + nv, w = ctx.measureText(txt).width + tam * 0.8;
    ctx.fillStyle = o.fundo || 'rgba(20,28,44,0.78)'; ctx.beginPath(); ctx.roundRect(-w / 2, -tam * 0.7, w, tam * 1.4, tam * 0.3); ctx.fill();
    ctx.strokeStyle = o.cor || '#BFE6FF'; ctx.lineWidth = tam * 0.08; ctx.stroke();
    textoSimples(ctx, txt, 0, tam * 0.04, tam, o.cor || '#FFFFFF', { peso: 900 });
    if (o.nome) textoSimples(ctx, o.nome, 0, -tam * 1.2, tam * 0.7, '#FFFFFF', { peso: 800, contorno: 'rgba(20,28,44,0.7)' });
    ctx.restore();
  }
  function barraXP(ctx, x, y, w, enche, o = {}) {
    const h = o.h || 34;
    ctx.save();
    ctx.fillStyle = 'rgba(16,22,36,0.75)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; ctx.stroke();
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#FFD45A'); g.addColorStop(1, '#FFF2A8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2 + 5, y - h / 2 + 5, Math.max(0, (w - 10) * clamp(enche, 0, 1)), h - 10, (h - 10) / 2); ctx.fill();
    if (o.segmentos) { ctx.strokeStyle = 'rgba(16,22,36,0.5)'; ctx.lineWidth = 3; for (let i = 1; i < o.segmentos; i++) { const sx = x - w / 2 + (w * i) / o.segmentos; ctx.beginPath(); ctx.moveTo(sx, y - h / 2 + 4); ctx.lineTo(sx, y + h / 2 - 4); ctx.stroke(); } }
    textoSimples(ctx, o.rotulo || 'XP', x - w / 2 - 14, y, h * 0.9, '#FFFFFF', { alinhar: 'right', peso: 900, contorno: 'rgba(16,22,36,0.7)' });
    ctx.restore();
  }
  // número de dano que salta e sobe; k = tempo desde o golpe (s)
  function dano(ctx, x, y, txt, k, o = {}) {
    if (k < 0 || k > (o.dura || 1.1)) return;
    const pop = k < 0.12 ? 0.4 + (k / 0.12) * 0.9 : 1.3 - Math.min(0.3, (k - 0.12) * 1.5), sobe = k * (o.sobe || 120), al = 1 - clamp((k - 0.75) / 0.35, 0, 1);
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y - sobe); ctx.scale(pop, pop);
    textoSimples(ctx, txt, 0, 0, o.tam || 110, o.cor || '#FFFFFF', { peso: 900, contorno: '#1A1420' });
    ctx.restore();
  }

  // ---------- gosma ----------
  // (x, y) = base no chão; s = largura em px; o: { pulo: 0..1 fase, amassa, estoura: 0..1, olhar, susto }
  function gosma(ctx, x, y, s, t, o = {}) {
    const est = o.estoura || 0;
    if (est >= 1) return;
    if (est > 0) {
      const r = rng(9);
      for (let i = 0; i < 14; i++) { const a = r() * TAU, d = est * s * (0.6 + r() * 0.8); ctx.fillStyle = `rgba(90,170,255,${1 - est})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y - s * 0.3 + Math.sin(a) * d * 0.7 - est * s * 0.3, s * 0.08 * (1 - est * 0.5), 0, TAU); ctx.fill(); }
      return;
    }
    const pulo = o.pulo || 0, alt = Math.sin(pulo * Math.PI) * s * 0.55, am = o.amassa !== undefined ? o.amassa : (pulo < 0.08 || pulo > 0.92 ? 0.25 : -0.12 * Math.sin(pulo * Math.PI));
    const w = s * (1 + am * 0.6), h = s * 0.72 * (1 - am * 0.7) + Math.sin(t * 6) * s * 0.015;
    ctx.save();
    ctx.fillStyle = 'rgba(20,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(x, y, w * 0.5 * (1 - alt / (s * 1.6)), s * 0.08, 0, 0, TAU); ctx.fill();
    ctx.translate(x, y - alt);
    const corpo = new Path2D(); corpo.moveTo(-w / 2, 0); corpo.bezierCurveTo(-w / 2, -h * 0.9, -w * 0.18, -h, 0, -h); corpo.bezierCurveTo(w * 0.18, -h, w / 2, -h * 0.9, w / 2, 0); corpo.quadraticCurveTo(0, h * 0.08, -w / 2, 0);
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#8FD0FF'); g.addColorStop(1, '#3A86E0');
    ctx.fillStyle = g; ctx.fill(corpo);
    ctx.strokeStyle = 'rgba(30,70,150,0.5)'; ctx.lineWidth = s * 0.02; ctx.stroke(corpo);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-w * 0.2, -h * 0.72, w * 0.1, h * 0.08, -0.4, 0, TAU); ctx.fill();
    const ol = o.olhar || 0;
    for (const l of [-1, 1]) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(l * w * 0.16, -h * 0.5, s * 0.085, s * (o.susto ? 0.11 : 0.1), 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#152238'; ctx.beginPath(); ctx.arc(l * w * 0.16 + ol * s * 0.03, -h * 0.48, s * (o.susto ? 0.035 : 0.05), 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#152238'; ctx.lineWidth = s * 0.025; ctx.lineCap = 'round';
    ctx.beginPath(); if (o.susto) ctx.arc(0, -h * 0.28, s * 0.05, 0, TAU); else { ctx.moveTo(-s * 0.06, -h * 0.3); ctx.quadraticCurveTo(0, -h * 0.24, s * 0.06, -h * 0.3); } ctx.stroke();
    ctx.restore();
  }
  // faísca de magia (azul): r = raio; forca 0..1 (apaga com 0)
  function faisca(ctx, x, y, r, t, forca = 1) {
    if (forca <= 0) return;
    brilhoRadial(ctx, x, y, r * 2.2 * forca, '111,200,255', 0.9 * forca);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(200,240,255,${forca})`; ctx.lineWidth = Math.max(2, r * 0.08); ctx.lineCap = 'round';
    const rr = rng(Math.floor(t * 20));
    for (let i = 0; i < 7; i++) { const a = rr() * TAU, d = r * (0.6 + rr() * 0.8) * forca; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * d * 0.5 + (rr() - 0.5) * r * 0.3, y + Math.sin(a) * d * 0.5); ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.stroke(); }
    ctx.fillStyle = `rgba(255,255,255,${forca})`; ctx.beginPath(); ctx.arc(x, y, r * 0.25 * forca, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // raio de magia de um ponto a outro (curto, tremido)
  function raioMagia(ctx, a, b, t, forca = 1) {
    if (forca <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    const rr = rng(Math.floor(t * 24));
    for (const [lw, al] of [[22, 0.25], [9, 0.6], [3, 1]]) {
      ctx.strokeStyle = `rgba(170,225,255,${al * forca})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      for (let i = 1; i <= 6; i++) { const k = i / 6; ctx.lineTo(a[0] + (b[0] - a[0]) * k + (i < 6 ? (rr() - 0.5) * 40 : 0), a[1] + (b[1] - a[1]) * k + (i < 6 ? (rr() - 0.5) * 40 : 0)); }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- transição do visor: tela preta com uma fenda de luz que abre na horizontal ----------
  // k: 0 (fechado, só a linha) .. 1 (aberto)
  function visor(ctx, k) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    if (k >= 1) return;
    const abre = Math.pow(clamp(k, 0, 1), 1.6) * H / 2, cy = H / 2;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, cy - abre); ctx.fillRect(0, cy + abre, W, H - cy - abre);
    const larg = k < 0.15 ? (k / 0.15) * W : W;
    const g = ctx.createLinearGradient(W / 2 - larg / 2, 0, W / 2 + larg / 2, 0); g.addColorStop(0, 'rgba(200,240,255,0)'); g.addColorStop(0.5, 'rgba(235,250,255,1)'); g.addColorStop(1, 'rgba(200,240,255,0)');
    ctx.fillStyle = g; const lw = 6 + 14 * (1 - k);
    ctx.fillRect(W / 2 - larg / 2, cy - abre - lw / 2, larg, lw); if (abre > 2) ctx.fillRect(W / 2 - larg / 2, cy + abre - lw / 2, larg, lw);
    ctx.restore();
    brilhoRadial(ctx, W / 2, cy, 260 * (1 - k * 0.5), '200,240,255', 0.5 * (1 - k));
  }

  // ---------- sala de cápsulas (gente trabalhando dentro do jogo) ----------
  function capsulas(ctx, t, o = {}) {
    const W = ctx.canvas.width, H = ctx.canvas.height, hz = o.horizonte || 760, avanca = o.avanca || 0;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A2333'); g.addColorStop(0.4, '#26344A'); g.addColorStop(1, '#101722');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // luminárias do teto
    for (let i = 0; i < 6; i++) { const z = 1 + i * 1.6 - (avanca % 1.6), s = 700 / z; const y = hz - 0.9 * s; ctx.fillStyle = `rgba(220,240,255,${Math.min(0.9, 0.3 + 0.12 * s / 100)})`; ctx.fillRect(W / 2 - s * 0.9, y, s * 1.8, Math.max(2, s * 0.03)); }
    // fileiras: da mais longe para a mais perto
    const fileiras = [];
    for (let i = 0; i < 7; i++) fileiras.push(1.6 + i * 1.3 - (avanca % 1.3));
    fileiras.sort((a, b) => b - a);
    const r = rng(31);
    const cores = ['#C93A32', '#2F6FD6', '#EBC25A', '#5E7A45', '#A487DE', '#F07C28'];
    for (const z of fileiras) {
      if (z < 0.6) continue;
      const s = 600 / z, y = hz + 1.1 * s, nevoa = clamp((z - 2) / 9, 0, 0.7);
      for (let c = -3; c <= 3; c++) {
        const x = W / 2 + c * 1.25 * s;
        if (x < -s || x > W + s) continue;
        // cápsula branca deitada
        ctx.fillStyle = Cena3D.mistura('#5A6478', '#26344A', nevoa); ctx.beginPath(); ctx.ellipse(x, y + s * 0.05, s * 0.55, s * 0.09, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = Cena3D.mistura('#E8EDF4', '#3A4A62', nevoa); ctx.beginPath(); ctx.roundRect(x - s * 0.5, y - s * 0.32, s * 1.0, s * 0.34, s * 0.16); ctx.fill();
        ctx.fillStyle = Cena3D.mistura('#C2CAD6', '#33425A', nevoa); ctx.fillRect(x - s * 0.44, y - s * 0.06, s * 0.88, s * 0.06);
        // pessoa deitada: corpo colorido + capacete
        const cor = cores[Math.floor(r() * cores.length)];
        ctx.fillStyle = Cena3D.mistura(cor, '#3A4A62', nevoa); ctx.beginPath(); ctx.roundRect(x - s * 0.2, y - s * 0.4, s * 0.55, s * 0.13, s * 0.06); ctx.fill();
        ctx.fillStyle = Cena3D.mistura('#F2F4F8', '#3A4A62', nevoa); ctx.beginPath(); ctx.ellipse(x - s * 0.3, y - s * 0.38, s * 0.12, s * 0.1, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = Cena3D.mistura('#2A6FB0', '#3A4A62', nevoa); ctx.beginPath(); ctx.ellipse(x - s * 0.24, y - s * 0.38, s * 0.05, s * 0.06, 0, 0, TAU); ctx.fill();
        // painel verde piscando
        ctx.fillStyle = (Math.sin(t * 3 + c + z) > 0) ? '#4CE08A' : '#1E7A48'; ctx.fillRect(x + s * 0.3, y - s * 0.2, s * 0.06, s * 0.03);
        // moedinha subindo
        if (o.moedas) { const p = ((t * 0.6 + r()) % 1); if (z < 7) moeda(ctx, x + s * 0.05, y - s * 0.5 - p * s * 0.7, s * 0.09 * (1 - p * 0.3), t + c, 1 - p); }
      }
    }
  }
  function moeda(ctx, x, y, r, t, a = 1) {
    if (a <= 0 || r < 1) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(Math.abs(Math.cos(t * 3)) * 0.8 + 0.2, 1);
    ctx.fillStyle = '#C98E1C'; ctx.beginPath(); ctx.arc(0, r * 0.08, r, 0, TAU); ctx.fill();
    ctx.fillStyle = OURO; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFE38A'; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C98E1C'; ctx.font = FONTE(900, r * 0.9); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, r * 0.05);
    ctx.restore();
  }

  // ---------- caixa e capacete de realidade virtual ----------
  function caixaVR(ctx, x, y, s, t, o = {}) {
    // (x, y) = base no chão; s = largura em px
    const h = s * 0.62, prof = s * 0.28, br = o.brilho || 0;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(s * 0.1, 0, s * 0.7, s * 0.1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1C2230'; ctx.beginPath(); ctx.moveTo(s / 2, -h); ctx.lineTo(s / 2 + prof, -h - prof * 0.5); ctx.lineTo(s / 2 + prof, -prof * 0.5); ctx.lineTo(s / 2, 0); ctx.closePath(); ctx.fill();
    const tampa = (o.tampa || 0) * s * 0.12;
    ctx.fillStyle = '#3A4458'; ctx.beginPath(); ctx.moveTo(-s / 2, -h - tampa); ctx.lineTo(s / 2, -h - tampa); ctx.lineTo(s / 2 + prof, -h - prof * 0.5 - tampa); ctx.lineTo(-s / 2 + prof, -h - prof * 0.5 - tampa); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(-s / 2, -h, s / 2, 0); g.addColorStop(0, '#2B3448'); g.addColorStop(1, '#161B26');
    ctx.fillStyle = g; ctx.fillRect(-s / 2, -h, s, h);
    if (br > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(155,92,255,${0.5 * br})`; ctx.fillRect(-s / 2, -h - tampa - 4, s + prof, 6 + tampa); ctx.restore(); brilhoRadial(ctx, s * 0.1, -h - tampa, s * 0.9, '155,92,255', 0.5 * br); }
    // logo
    textoSimples(ctx, 'VALDOR', 0, -h * 0.55, s * 0.13, '#E8ECF6', { peso: 900 });
    ctx.fillStyle = ROXO; ctx.fillRect(-s * 0.28, -h * 0.4, s * 0.56, s * 0.012);
    textoSimples(ctx, 'CADEIRA + CAPACETE VR', 0, -h * 0.3, s * 0.035, '#9AA4BA', { peso: 700 });
    capacete(ctx, 0, -h * 0.72, s * 0.22, 0.3, t);
    ctx.restore();
  }
  // capacete VR de frente; visor 0..1 (aceso)
  function capacete(ctx, x, y, s, visorK = 0, t = 0) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#E8ECF2'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.55, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C8CED8'; ctx.beginPath(); ctx.ellipse(0, s * 0.1, s * 0.62, s * 0.45, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#10141C'; ctx.beginPath(); ctx.roundRect(-s * 0.5, -s * 0.12, s * 1.0, s * 0.34, s * 0.14); ctx.fill();
    if (visorK > 0) {
      const g = ctx.createLinearGradient(-s * 0.5, 0, s * 0.5, 0); g.addColorStop(0, `rgba(111,200,255,${0.2 * visorK})`); g.addColorStop(0.5, `rgba(180,235,255,${0.85 * visorK})`); g.addColorStop(1, `rgba(111,200,255,${0.2 * visorK})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-s * 0.46, -s * 0.09, s * 0.92, s * 0.28, s * 0.12); ctx.fill();
    }
    ctx.restore();
    if (visorK > 0) brilhoRadial(ctx, x, y + s * 0.05, s * 0.9, '111,200,255', 0.45 * visorK);
  }
  // calendário de parede com texto grande
  function calendario(ctx, x, y, s, txt, sub) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#F4F1EC'; ctx.beginPath(); ctx.roundRect(-s / 2, -s * 0.5, s, s, s * 0.06); ctx.fill();
    ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-s / 2, -s * 0.5, s, s * 0.26, [s * 0.06, s * 0.06, 0, 0]); ctx.fill();
    textoSimples(ctx, sub || 'ALUGUEL', 0, -s * 0.37, s * 0.12, '#FFFFFF', { peso: 900 });
    textoSimples(ctx, txt, 0, s * 0.08, s * 0.36, '#1A1420', { peso: 900 });
    textoSimples(ctx, 'DIAS', 0, s * 0.36, s * 0.12, '#6A6573', { peso: 800 });
    ctx.restore();
  }


  // ---------- círculo mágico de runas (referências magia-03/04/05): deitado no chão, em perspectiva ----------
  // (x, y) = centro no chão; r = raio em px; o: { k: 0..1 (aparece girando), achata: 0.25..1, rgb, t }
  const RUNAS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  function circuloMagico(ctx, x, y, r, o = {}) {
    const k = clamp(o.k === undefined ? 1 : o.k, 0, 1), t = o.t || 0, rgb = o.rgb || '111,200,255', ach = o.achata || 0.32;
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ach);
    ctx.globalCompositeOperation = 'screen';
    const rr = r * (0.6 + 0.4 * k), a = k;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr * 1.25); g.addColorStop(0, `rgba(${rgb},${0.35 * a})`); g.addColorStop(0.7, `rgba(${rgb},${0.12 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr * 1.25, 0, TAU); ctx.fill();
    ctx.lineCap = 'round';
    const anel = (raio, lw, al) => { ctx.strokeStyle = `rgba(${rgb},${al * a})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(0, 0, raio, 0, TAU * k); ctx.stroke(); };
    for (const [lw, al] of [[r * 0.05, 0.25], [r * 0.018, 0.95]]) { anel(rr, lw, al); anel(rr * 0.78, lw * 0.8, al); anel(rr * 0.42, lw * 0.8, al); }
    // estrela de 6 pontas girando
    ctx.save(); ctx.rotate(t * 0.6);
    ctx.strokeStyle = `rgba(220,245,255,${0.9 * a})`; ctx.lineWidth = r * 0.014;
    for (const off of [0, Math.PI / 3]) { ctx.beginPath(); for (let i = 0; i <= 3; i++) { const an = off + i * TAU / 3; const px = Math.cos(an) * rr * 0.78, py = Math.sin(an) * rr * 0.78; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); }
    ctx.restore();
    // runas no anel, girando ao contrário
    ctx.save(); ctx.rotate(-t * 0.35);
    ctx.fillStyle = `rgba(230,250,255,${0.95 * a})`; ctx.font = FONTE(700, r * 0.13); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const n = 22;
    for (let i = 0; i < n * k; i++) { const an = (i / n) * TAU; ctx.save(); ctx.rotate(an); ctx.translate(0, -rr * 0.89); ctx.fillText(RUNAS[i % RUNAS.length], 0, 0); ctx.restore(); }
    ctx.restore();
    // pequenos círculos nas pontas
    for (let i = 0; i < 6; i++) { const an = i * TAU / 6 + t * 0.6; ctx.strokeStyle = `rgba(${rgb},${0.9 * a})`; ctx.lineWidth = r * 0.012; ctx.beginPath(); ctx.arc(Math.cos(an) * rr * 0.78, Math.sin(an) * rr * 0.78, rr * 0.08, 0, TAU); ctx.stroke(); }
    ctx.restore();
    // colunas de luz subindo do círculo
    if (o.colunas !== false) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const rd = rng(3);
      for (let i = 0; i < 14; i++) {
        const an = rd() * TAU, d = rr * (0.3 + rd() * 0.65), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * ach, h = r * (0.3 + rd() * 0.7) * k, f = (t * 1.5 + rd()) % 1;
        const gg = ctx.createLinearGradient(0, py, 0, py - h); gg.addColorStop(0, `rgba(${rgb},${0.5 * a})`); gg.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gg; ctx.fillRect(px - r * 0.008, py - h, r * 0.016, h);
        ctx.fillStyle = `rgba(230,250,255,${(1 - f) * a})`; ctx.beginPath(); ctx.arc(px, py - h * f, r * 0.012, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }
  // esfera de energia com raios por dentro (referências magia-02 e magia-06); forca 0..1
  function esferaEnergia(ctx, x, y, r, t, forca = 1, o = {}) {
    if (forca <= 0) return;
    const rgb = o.rgb || '111,200,255', R = r * forca;
    brilhoRadial(ctx, x, y, R * 2.4, rgb, 0.7);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
    g.addColorStop(0, 'rgba(240,252,255,0.95)'); g.addColorStop(0.5, `rgba(${rgb},0.75)`); g.addColorStop(1, `rgba(${rgb},0.15)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(230,250,255,0.9)'; ctx.lineWidth = Math.max(1.5, R * 0.05); ctx.lineCap = 'round';
    const rr = rng(Math.floor(t * 18));
    for (let i = 0; i < 4; i++) { let a = rr() * TAU, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (rr() - 0.5) * 1.4; px += Math.cos(a) * R * 0.3; py += Math.sin(a) * R * 0.3; ctx.lineTo(px, py); } ctx.stroke(); }
    ctx.strokeStyle = `rgba(${rgb},0.9)`; ctx.lineWidth = Math.max(1.5, R * 0.04); ctx.beginPath(); ctx.arc(x, y, R * 1.02, 0, TAU); ctx.stroke();
    ctx.restore();
    // cristaizinhos de luz em volta
    const rc = rng(13);
    for (let i = 0; i < 7; i++) { const a = rc() * TAU + t * (0.8 + rc()), d = R * (1.3 + rc() * 0.6); estrela(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, R * 0.12 * (0.5 + 0.5 * Math.sin(t * 6 + i)), '#E6F7FF'); }
  }

  window.Valdor = { celular, feixe, escudoComum, anelRaro, adagaEpica, estrela, etiqueta, raioFundo, cabecaRaio, labirinto, corpoRaio, grade1000, carta, ICONES, placaNivel, barraXP, dano, gosma, faisca, raioMagia, visor, capsulas, moeda, caixaVR, capacete, calendario, brilhoRadial, circuloMagico, esferaEnergia, texto: textoSimples, CORES: { ROXO, AZUL, OURO, CIANO } };
})();

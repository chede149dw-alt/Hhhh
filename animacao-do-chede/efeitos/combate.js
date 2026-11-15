// Efeitos de combate da série VALDOR (Parte 2 em diante): magia elétrica do Davi, impacto, corte, esquiva e dano.
// Combate.relampago(ctx, a, b, t, k, o)        — raio de verdade (deslocamento do ponto médio) com galhos e brilho em camadas
// Combate.maoEletrica(ctx, x, y, r, t, k)       — mão carregada: brilho, arcos estalando e faíscas em órbita
// Combate.arcoEntre(ctx, a, b, t, k)            — arco elétrico fino entre dois pontos (entre as mãos)
// Combate.convergir(ctx, x, y, R, t, k)         — partículas de luz sendo puxadas para um ponto (carregando)
// Combate.impacto(ctx, x, y, r, k, o)           — estouro de golpe: clarão em cruz, riscos radiais, anel e faíscas com gravidade
// Combate.eletrocutado(ctx, x, y, w, h, t, k)   — arcos pequenos correndo pelo corpo de quem levou o raio
// Combate.corte(ctx, x, y, r, a0, a1, k, o)     — meia-lua de corte (afinando nas pontas) com brilho
// Combate.garras(ctx, x, y, s, k)               — três riscos vermelhos de garra
// Combate.numero(ctx, x, y, txt, k, tipo)       — número de dano: 'normal' | 'critico' | 'recebido' | 'esquiva'
// Combate.velocidade(ctx, cx, cy, ang, k, t)    — linhas de velocidade na direção ang
// Combate.vinhetaDano(ctx, k)                   — borda vermelha pulsando quando o herói apanha
// Combate.hud(ctx, x, y, nome, nv, vida, atraso, o) — barra de vida do herói no canto (com retrato)
(function () {
  const TAU = Math.PI * 2;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const brilho = (ctx, x, y, r, rgb, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

  // caminho de raio: deslocamento do ponto médio, recursivo
  function trilha(a, b, desvio, nivel, r) {
    if (nivel === 0) return [a, b];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const off = (r() - 0.5) * desvio, m = [mx - (dy / L) * off, my + (dx / L) * off];
    const e = trilha(a, m, desvio / 2, nivel - 1, r), d = trilha(m, b, desvio / 2, nivel - 1, r);
    return [...e.slice(0, -1), ...d];
  }
  function tracar(ctx, pts, camadas, rgb) {
    for (const [lw, al, cor] of camadas) {
      ctx.strokeStyle = cor ? `rgba(${cor},${al})` : `rgba(${rgb},${al})`; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
    }
  }
  function relampago(ctx, a, b, t, k = 1, o = {}) {
    if (k <= 0) return;
    const rgb = o.rgb || '120,200,255', L = Math.hypot(b[0] - a[0], b[1] - a[1]), esp = o.espessura || 1;
    const r = rng(Math.floor(t * (o.troca || 20)) * 7 + 1);
    const pts = trilha(a, b, L * 0.32, 6, r);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // brilho largo
    ctx.filter = 'blur(14px)'; tracar(ctx, pts, [[60 * esp, 0.5 * k]], rgb); ctx.filter = 'none';
    // galhos
    for (let i = 0; i < 6; i++) {
      const j = 2 + Math.floor(r() * (pts.length - 4)), p = pts[j], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (r() - 0.5) * 1.8, comp = L * (0.12 + r() * 0.2);
      const fim = [p[0] + Math.cos(ang) * comp, p[1] + Math.sin(ang) * comp], g = trilha(p, fim, comp * 0.4, 4, r);
      tracar(ctx, g, [[10 * esp, 0.25 * k], [3 * esp, 0.7 * k], [1.2 * esp, 0.9 * k, '240,250,255']], rgb);
    }
    tracar(ctx, pts, [[26 * esp, 0.35 * k], [11 * esp, 0.8 * k], [4.5 * esp, k, '245,252,255']], rgb);
    // clarão nas pontas
    brilho(ctx, a[0], a[1], 90 * esp, rgb, 0.8 * k); brilho(ctx, b[0], b[1], 160 * esp, rgb, 0.9 * k); brilho(ctx, b[0], b[1], 50 * esp, '255,255,255', k);
    ctx.restore();
  }
  function arcoEntre(ctx, a, b, t, k = 1, rgb = '120,200,255') {
    if (k <= 0) return;
    const r = rng(Math.floor(t * 30) + 11), L = Math.hypot(b[0] - a[0], b[1] - a[1]), pts = trilha(a, b, L * 0.45, 5, r);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    tracar(ctx, pts, [[12, 0.3 * k], [4, 0.8 * k], [1.5, k, '240,250,255']], rgb);
    ctx.restore();
  }
  function maoEletrica(ctx, x, y, r, t, k = 1, rgb = '120,200,255') {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    const p = 0.85 + 0.15 * Math.sin(t * 23);
    brilho(ctx, x, y, r * 3.2 * k, rgb, 0.55 * k * p); brilho(ctx, x, y, r * 1.1, '230,248,255', 0.95 * k);
    // arcos curtos estalando em volta
    const rr = rng(Math.floor(t * 26) + 5);
    for (let i = 0; i < 5; i++) { const a0 = rr() * TAU, d = r * (1.2 + rr() * 1.6) * k, fim = [x + Math.cos(a0) * d, y + Math.sin(a0) * d]; const pts = trilha([x, y], fim, d * 0.6, 4, rr); tracar(ctx, pts, [[6, 0.35 * k], [2, 0.95 * k, '235,250,255']], rgb); }
    // faíscas em órbita
    for (let i = 0; i < 8; i++) { const a0 = t * (3 + i * 0.4) + i * 0.8, d = r * (1.6 + 0.6 * Math.sin(t * 4 + i)) * k; const px = x + Math.cos(a0) * d, py = y + Math.sin(a0) * d * 0.6; brilho(ctx, px, py, r * 0.35, rgb, 0.9 * k); ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.beginPath(); ctx.arc(px, py, r * 0.08, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function convergir(ctx, x, y, R, t, k = 1, rgb = '120,200,255') {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    const r = rng(9);
    for (let i = 0; i < 46; i++) {
      const a0 = r() * TAU, vel = 0.7 + r() * 0.8, f = (t * vel + r()) % 1, d = R * (1 - f) * (0.5 + r() * 0.6), px = x + Math.cos(a0) * d, py = y + Math.sin(a0) * d, cauda = R * 0.12 * (1 - f);
      ctx.strokeStyle = `rgba(${rgb},${k * f * 0.9})`; ctx.lineWidth = 3 + 3 * f;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a0) * cauda, py + Math.sin(a0) * cauda); ctx.stroke();
      ctx.fillStyle = `rgba(240,252,255,${k * f})`; ctx.beginPath(); ctx.arc(px, py, 2.5 * f + 1, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // k = tempo desde o golpe (s)
  function impacto(ctx, x, y, r, k, o = {}) {
    const dur = o.dura || 0.55; if (k < 0 || k > dur) return;
    const f = k / dur, rgb = o.rgb || '170,220,255', seed = o.seed || 3;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    // clarão em cruz (4 pontas) que encolhe
    const c = Math.max(0, 1 - f * 2.2);
    if (c > 0) {
      brilho(ctx, x, y, r * 1.6 * c, '255,255,255', c);
      ctx.fillStyle = `rgba(255,255,255,${c})`;
      for (const ang of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) { const L = r * (ang % (Math.PI / 2) ? 0.9 : 1.8) * c, w = r * 0.07 * c; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(0, -w, L, 0); ctx.quadraticCurveTo(0, w, -L, 0); ctx.fill(); ctx.restore(); }
    }
    // riscos radiais
    const rr = rng(seed);
    for (let i = 0; i < 14; i++) { const ang = rr() * TAU, d0 = r * (0.3 + f * 1.4), d1 = d0 + r * (0.4 + rr() * 0.5) * (1 - f); ctx.strokeStyle = `rgba(${rgb},${(1 - f) * 0.9})`; ctx.lineWidth = r * 0.04 * (1 - f) + 1; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * d0, y + Math.sin(ang) * d0); ctx.lineTo(x + Math.cos(ang) * d1, y + Math.sin(ang) * d1); ctx.stroke(); }
    // anel
    ctx.strokeStyle = `rgba(${rgb},${(1 - f) * 0.8})`; ctx.lineWidth = r * 0.06 * (1 - f) + 1; ctx.beginPath(); ctx.arc(x, y, r * (0.4 + f * 1.3), 0, TAU); ctx.stroke();
    // faíscas com gravidade
    for (let i = 0; i < 22; i++) { const ang = rr() * TAU, v = r * (2 + rr() * 3), px = x + Math.cos(ang) * v * k, py = y + Math.sin(ang) * v * k + 900 * k * k * 0.5, tam = (1 - f) * (2 + rr() * 4); brilho(ctx, px, py, tam * 4, rgb, (1 - f)); ctx.fillStyle = `rgba(255,255,255,${1 - f})`; ctx.beginPath(); ctx.arc(px, py, tam * 0.7, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function eletrocutado(ctx, x, y, w, h, t, k = 1) {
    if (k <= 0) return;
    const r = rng(Math.floor(t * 24) + 77);
    for (let i = 0; i < 4; i++) { const a = [x + (r() - 0.5) * w, y - r() * h], b = [a[0] + (r() - 0.5) * w * 0.6, a[1] + (r() - 0.5) * h * 0.4]; arcoEntre(ctx, a, b, t + i, k * (0.5 + r() * 0.5)); }
  }
  // meia-lua de corte; k = progresso (0..1 desenha, 1..1.6 some)
  function corte(ctx, x, y, r, a0, a1, k, o = {}) {
    if (k <= 0 || k >= 1.6) return;
    const rgb = o.rgb || '200,235,255', fim = a0 + (a1 - a0) * Math.min(1, k), ini = a0 + (a1 - a0) * Math.max(0, (k - 0.35) / 1.25), al = k > 1 ? 1 - (k - 1) / 0.6 : 1, esp = r * (o.espessura || 0.16);
    if (Math.abs(fim - ini) < 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const N = 30, pts = [];
    for (let i = 0; i <= N; i++) { const s = i / N, a = ini + (fim - ini) * s, w = esp * Math.sin(Math.PI * Math.pow(s, 0.7)); pts.push([a, w]); }
    const forma = (kk) => { ctx.beginPath(); pts.forEach(([a, w], i) => { const px = x + Math.cos(a) * (r + w * kk * 0.5), py = y + Math.sin(a) * (r + w * kk * 0.5); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); for (let i = N; i >= 0; i--) { const [a, w] = pts[i]; ctx.lineTo(x + Math.cos(a) * (r - w * kk * 0.5), y + Math.sin(a) * (r - w * kk * 0.5)); } ctx.closePath(); };
    ctx.filter = 'blur(10px)'; ctx.fillStyle = `rgba(${rgb},${0.7 * al})`; forma(2.2); ctx.fill(); ctx.filter = 'none';
    ctx.fillStyle = `rgba(${rgb},${0.85 * al})`; forma(1); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${al})`; forma(0.4); ctx.fill();
    ctx.restore();
  }
  function garras(ctx, x, y, s, k) {
    if (k <= 0 || k >= 1.5) return;
    const al = k > 0.8 ? 1 - (k - 0.8) / 0.7 : 1, p = Math.min(1, k / 0.25);
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * s * 0.22, a = [x - s * 0.5 + ox, y - s * 0.55], b = [x + s * 0.45 + ox, y + s * 0.5], m = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
      for (const [lw, cor] of [[s * 0.12, `rgba(255,40,60,${0.35 * al})`], [s * 0.05, `rgba(255,70,80,${0.9 * al})`], [s * 0.018, `rgba(255,230,230,${al})`]]) { ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + m[0]) / 2 + s * 0.1, (a[1] + m[1]) / 2 - s * 0.05, m[0], m[1]); ctx.stroke(); }
    }
    ctx.restore();
  }
  // número de dano com pulo elástico; k = tempo desde o golpe (s)
  function numero(ctx, x, y, txt, k, tipo = 'normal') {
    const dura = tipo === 'critico' ? 1.3 : 1.0; if (k < 0 || k > dura) return;
    const est = { normal: ['#FFFFFF', '#DDE8FF', 110], critico: ['#FFE36A', '#FF8A1A', 150], recebido: ['#FF6A6A', '#C81E2E', 120], esquiva: ['#BFF4FF', '#5AC8FF', 96] }[tipo];
    const el = k < 0.18 ? 0.3 + 1.0 * (k / 0.18) : 1.3 - 0.3 * Math.min(1, (k - 0.18) / 0.15), sobe = 160 * (1 - Math.pow(1 - Math.min(1, k / dura), 2)), al = 1 - cl((k - dura + 0.3) / 0.3);
    ctx.save(); ctx.font = `900 ${est[2]}px Inter`; const meia = ctx.measureText(txt).width * 0.65 + 30, Wc = ctx.canvas.width; x = Math.max(meia, Math.min(Wc - meia, x));
    ctx.globalAlpha = al; ctx.translate(x + (tipo === 'recebido' ? -40 * k : 30 * k), y - sobe); ctx.rotate(tipo === 'critico' ? -0.08 : tipo === 'recebido' ? 0.06 : 0); ctx.scale(el, el);
    ctx.font = `900 ${est[2]}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = est[2] * 0.2; ctx.strokeStyle = 'rgba(15,10,25,0.95)'; ctx.strokeText(txt, 0, 0);
    const g = ctx.createLinearGradient(0, -est[2] * 0.45, 0, est[2] * 0.45); g.addColorStop(0, est[0]); g.addColorStop(1, est[1]); ctx.fillStyle = g; ctx.fillText(txt, 0, 0);
    if (tipo === 'critico') { ctx.font = `900 ${est[2] * 0.36}px Inter`; ctx.lineWidth = est[2] * 0.09; ctx.strokeText('CRÍTICO!', 0, -est[2] * 0.72); ctx.fillStyle = '#FFE36A'; ctx.fillText('CRÍTICO!', 0, -est[2] * 0.72); }
    ctx.restore();
  }
  function velocidade(ctx, cx, cy, ang, k, t) {
    if (k <= 0) return;
    const r = rng(Math.floor(t * 30) + 2), W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const off = (r() - 0.5) * H * 0.9, L = 200 + r() * 500, px = cx + Math.cos(ang + Math.PI / 2) * off + (r() - 0.5) * 400, py = cy + Math.sin(ang + Math.PI / 2) * off;
      const g = ctx.createLinearGradient(px, py, px + Math.cos(ang) * L, py + Math.sin(ang) * L); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(220,240,255,${0.55 * k})`);
      ctx.strokeStyle = g; ctx.lineWidth = 2 + r() * 5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang) * L, py + Math.sin(ang) * L); ctx.stroke();
    }
    ctx.restore();
  }
  function vinhetaDano(ctx, k) {
    if (k <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72); g.addColorStop(0, 'rgba(200,0,20,0)'); g.addColorStop(1, `rgba(200,0,30,${0.6 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function hud(ctx, x, y, nome, nv, vida, atraso, o = {}) {
    const w = o.w || 420, h = 30, a = o.alfa === undefined ? 1 : o.alfa, max = o.max || 120;
    ctx.save(); ctx.globalAlpha = a; ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.tremor) ctx.translate(Math.sin(o.t * 60) * o.tremor, Math.cos(o.t * 50) * o.tremor * 0.6);
    ctx.fillStyle = 'rgba(12,16,34,0.78)'; ctx.beginPath(); ctx.roundRect(x, y, w + 150, 110, 24); ctx.fill();
    ctx.strokeStyle = 'rgba(140,190,255,0.5)'; ctx.lineWidth = 3; ctx.stroke();
    // retrato
    ctx.fillStyle = o.corRetrato || '#3A4F8A'; ctx.beginPath(); ctx.arc(x + 62, y + 55, 40, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '900 34px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nome[0], x + 62, y + 57);
    ctx.textAlign = 'left'; ctx.font = '800 30px Inter'; ctx.fillText(nome, x + 120, y + 30); ctx.fillStyle = '#F2C14A'; ctx.fillText('NV ' + nv, x + 120 + ctx.measureText(nome + '  ').width, y + 30);
    const bx = x + 120, by = y + 58;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(bx, by, w, h, h / 2); ctx.fill();
    if (atraso > vida) { ctx.fillStyle = '#FFE0B0'; ctx.beginPath(); ctx.roundRect(bx, by, w * cl(atraso), h, h / 2); ctx.fill(); }
    const g = ctx.createLinearGradient(0, by, 0, by + h); const baixa = vida < 0.35; g.addColorStop(0, baixa ? '#FF8A6A' : '#8CFF9A'); g.addColorStop(1, baixa ? '#D23A42' : '#2FA84A');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(0, w * cl(vida)), h, h / 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 22px Inter'; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(vida * max)}/${max}`, bx + w / 2, by + h / 2 + 1);
    ctx.restore();
  }

  // barra do objetivo (referência 3D): casinha + "Aluguel" + moeda + valor; frac = quanto já juntou
  function aluguel(ctx, frac, valor, o = {}) {
    const W = ctx.canvas.width, x = o.x || 70, y = o.y || 110, w = o.w || W - 140, h = 132, a = o.alfa === undefined ? 1 : o.alfa;
    if (a <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(14,18,34,0.85)'; ctx.strokeStyle = 'rgba(255,214,120,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 28); ctx.fill(); ctx.stroke();
    ctx.font = '800 36px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F4EEDC'; ctx.fillText(o.titulo || 'Aluguel', x + 104, y + 38);
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFD76A'; ctx.fillText(valor, x + w - 36, y + 38);
    if (o.dias) { ctx.font = '700 26px Inter'; ctx.fillStyle = '#FF8A8A'; ctx.fillText(o.dias, x + w - 36, y + 104); }
    // casinha
    ctx.save(); ctx.translate(x + 56, y + 86); ctx.fillStyle = '#F4EEDC'; ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(0, -26); ctx.lineTo(26, -2); ctx.closePath(); ctx.fill(); ctx.fillRect(-20, -4, 40, 28); ctx.fillStyle = '#7A4A2A'; ctx.fillRect(-7, 6, 14, 18); ctx.restore();
    const bx = x + 96, by = y + 70, bw = w - (o.dias ? 260 : 140), bh = 34;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
    const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#FFE27A'); g.addColorStop(1, '#E09A1A');
    const fw = Math.max(bh, bw * cl(frac)); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx, by, fw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.roundRect(bx + 6, by + 5, fw - 12, bh * 0.3, bh * 0.15); ctx.fill();
    // moeda no fim da barra
    const mx = bx + fw - bh * 0.1, my = by + bh / 2; ctx.fillStyle = '#FFD24A'; ctx.strokeStyle = '#B07A10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, 22, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FFF2B0'; ctx.beginPath(); ctx.arc(mx - 7, my - 7, 6, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // vida verde em cima da cabeça (com coração), e mana azul opcional
  function vidaCabeca(ctx, x, y, w, frac, o = {}) {
    const h = Math.max(8, w * 0.09), a = o.alfa === undefined ? 1 : o.alfa; if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(10,14,24,0.75)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, (h + 6) / 2); ctx.fill();
    const cores = o.inimigo ? ['#FF7A7A', '#C8303A'] : ['#8CFF9A', '#2FA84A'], g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, cores[0]); g.addColorStop(1, cores[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, Math.max(h, w * cl(frac)), h, h / 2); ctx.fill();
    // coração
    const cx = x - w / 2 - h * 1.4; ctx.fillStyle = o.inimigo ? '#FF6A6A' : '#5CFF7A'; ctx.beginPath(); ctx.moveTo(cx, y + h * 0.6); ctx.bezierCurveTo(cx - h * 1.1, y - h * 0.2, cx - h * 0.5, y - h * 1.0, cx, y - h * 0.35); ctx.bezierCurveTo(cx + h * 0.5, y - h * 1.0, cx + h * 1.1, y - h * 0.2, cx, y + h * 0.6); ctx.fill();
    if (o.mana !== undefined) { const my = y + h * 1.6; ctx.fillStyle = 'rgba(10,14,24,0.75)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 3, my - h * 0.35 - 3, w + 6, h * 0.7 + 6, h); ctx.fill(); const gm = ctx.createLinearGradient(0, my - h * 0.35, 0, my + h * 0.35); gm.addColorStop(0, '#8AD8FF'); gm.addColorStop(1, '#2A7BE0'); ctx.fillStyle = gm; ctx.beginPath(); ctx.roundRect(x - w / 2, my - h * 0.35, Math.max(h * 0.7, w * cl(o.mana)), h * 0.7, h * 0.35); ctx.fill(); }
    ctx.restore();
  }

  // LÂMINA RUBRA (item lendário do líder): espada curva vermelho-escura, fio brilhando, guarda dourada com gema
  // (x, y) = cabo; s = comprimento total em px; ang = rotação (0 = lâmina para cima)
  function laminaRubra(ctx, x, y, s, t, ang = 0, o = {}) {
    const br = o.brilho === undefined ? 1 : o.brilho;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (br > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(0, -s * 0.45, 0, 0, -s * 0.45, s * 0.75); g.addColorStop(0, `rgba(255,90,60,${0.5 * br})`); g.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -s * 0.45, s * 0.75, 0, TAU); ctx.fill(); ctx.restore(); }
    // lâmina curva
    const lam = new Path2D(); lam.moveTo(-s * 0.035, -s * 0.16); lam.quadraticCurveTo(-s * 0.06, -s * 0.6, s * 0.06, -s * 0.98); lam.quadraticCurveTo(s * 0.09, -s * 0.62, s * 0.045, -s * 0.16); lam.closePath();
    const gl = ctx.createLinearGradient(-s * 0.06, 0, s * 0.08, 0); gl.addColorStop(0, '#3A0A10'); gl.addColorStop(0.45, '#9E1424'); gl.addColorStop(1, '#E2384A');
    ctx.fillStyle = gl; ctx.fill(lam); ctx.strokeStyle = '#1A0406'; ctx.lineWidth = Math.max(1.5, s * 0.012); ctx.stroke(lam);
    // fio brilhante e runas
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(255,180,140,${0.9 * br + 0.1})`; ctx.lineWidth = Math.max(1, s * 0.01); ctx.beginPath(); ctx.moveTo(s * 0.04, -s * 0.18); ctx.quadraticCurveTo(s * 0.085, -s * 0.62, s * 0.06, -s * 0.96); ctx.stroke();
    ctx.fillStyle = `rgba(255,140,90,${0.8 * br})`; for (let i = 0; i < 4; i++) { const yy = -s * (0.3 + i * 0.13); ctx.beginPath(); ctx.arc(s * (0.0 + i * 0.008), yy, s * 0.012, 0, TAU); ctx.fill(); }
    ctx.restore();
    // guarda dourada em asa + gema
    ctx.fillStyle = '#C9A24A'; ctx.strokeStyle = '#5A4010'; ctx.lineWidth = Math.max(1, s * 0.01);
    ctx.beginPath(); ctx.moveTo(-s * 0.15, -s * 0.13); ctx.quadraticCurveTo(0, -s * 0.2, s * 0.15, -s * 0.13); ctx.quadraticCurveTo(s * 0.17, -s * 0.18, s * 0.12, -s * 0.21); ctx.quadraticCurveTo(0, -s * 0.15, -s * 0.12, -s * 0.21); ctx.quadraticCurveTo(-s * 0.17, -s * 0.18, -s * 0.15, -s * 0.13); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FF3A4A'; ctx.beginPath(); ctx.arc(0, -s * 0.165, s * 0.028, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-s * 0.008, -s * 0.172, s * 0.009, 0, TAU); ctx.fill();
    // cabo com fita e pomo
    ctx.fillStyle = '#2A1A14'; ctx.beginPath(); ctx.roundRect(-s * 0.025, -s * 0.13, s * 0.05, s * 0.15, s * 0.01); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#7A1E26'; ctx.lineWidth = Math.max(1, s * 0.008); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.025, -s * (0.11 - i * 0.03)); ctx.lineTo(s * 0.025, -s * (0.09 - i * 0.03)); ctx.stroke(); }
    ctx.fillStyle = '#C9A24A'; ctx.beginPath(); ctx.arc(0, s * 0.035, s * 0.03, 0, TAU); ctx.fill();
    ctx.restore();
  }

  window.Combate = { laminaRubra, aluguel, vidaCabeca, relampago, arcoEntre, maoEletrica, convergir, impacto, eletrocutado, corte, garras, numero, velocidade, vinhetaDano, hud };
})();

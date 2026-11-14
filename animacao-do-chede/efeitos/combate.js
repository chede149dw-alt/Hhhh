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

  window.Combate = { relampago, arcoEntre, maoEletrica, convergir, impacto, eletrocutado, corte, garras, numero, velocidade, vinhetaDano, hud };
})();

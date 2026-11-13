// Criaturas da série nova (VALDOR), no estilo da referência de batalha (referencias/nova/videos/ref-batalha-luz.mp4):
// formas angulosas com facetas de luz e sombra, contorno fino escuro, dentes à mostra, barra de vida em cima.
// Criaturas.lobo(ctx, x, y, s, t, o)  — lobo de perfil olhando para a DIREITA (o.espelhar: para a esquerda)
//   (x, y) = chão embaixo do corpo; s = comprimento do corpo em px (focinho ao rabo ≈ 1,7 s)
//   o.pose: 'parado' (rosnando) | 'andando' | 'pulando' | 'atingido' | 'caido'; o.fase (0..1, passo/pulo);
//   o.boca (0..1 aberta); o.dissolve (0..1: vira faíscas de luz); o.pelagem: { base, costas, barriga }
// Criaturas.barraVida(ctx, x, y, w, frac, o) — barra vermelha com "vida/máx" e o nome + nível embaixo
(function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const PELE_LOBO = { base: '#B88D5F', costas: '#5E4636', barriga: '#E6CFA6', escuro: '#3A2A22', focinho: '#D9BE93' };

  function poli(ctx, pts, cor, contorno) {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = cor; ctx.fill();
    if (contorno) { ctx.strokeStyle = contorno; ctx.lineWidth = 0.012; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  // perna em dois segmentos (coxa + canela) com pata; a0/a1 em rad (0 = para baixo)
  function perna(ctx, x, y, L1, L2, a0, a1, w, cor, corPata) {
    const kx = x + Math.sin(a0) * L1, ky = y + Math.cos(a0) * L1;
    const px = kx + Math.sin(a0 + a1) * L2, py = ky + Math.cos(a0 + a1) * L2;
    const seg = (ax, ay, bx, by, wa, wb) => { const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; poli(ctx, [[ax + nx * wa, ay + ny * wa], [bx + nx * wb, by + ny * wb], [bx - nx * wb, by - ny * wb], [ax - nx * wa, ay - ny * wa]], cor, 'rgba(40,26,20,0.55)'); };
    seg(x, y, kx, ky, w, w * 0.6);
    seg(kx, ky, px, py, w * 0.6, w * 0.42);
    poli(ctx, [[px - w * 0.55, py - 0.01], [px + w * 1.1, py - 0.015], [px + w * 1.25, py + 0.02], [px - w * 0.6, py + 0.025]], corPata, 'rgba(40,26,20,0.55)');
    return [px, py];
  }

  function lobo(ctx, x, y, s, t, o = {}) {
    const dis = clamp(o.dissolve || 0, 0, 1);
    if (dis >= 1) return;
    const P = { ...PELE_LOBO, ...(o.pelagem || {}) };
    const pose = o.pose || 'parado', f = o.fase === undefined ? t * 1.6 : o.fase;
    const resp = Math.sin(t * 5) * 0.008;
    // ângulos das pernas por pose
    let fr = [0.1, -0.15], fr2 = [-0.05, -0.05], tr = [-0.15, 0.25], tr2 = [0.05, 0.2], corpoY = 0, giro = 0, boca = o.boca === undefined ? 0.5 + 0.2 * Math.sin(t * 7) : o.boca;
    if (pose === 'parado') { fr = [0.25, -0.2]; fr2 = [0.05, -0.1]; tr = [-0.35, 0.45]; tr2 = [-0.2, 0.4]; corpoY = -0.01; giro = 0.06; }
    if (pose === 'andando') { const a = Math.sin(f * TAU) * 0.45; fr = [a, -0.15 - Math.max(0, a) * 0.6]; fr2 = [-a, -0.15 - Math.max(0, -a) * 0.6]; tr = [-a - 0.1, 0.3]; tr2 = [a - 0.1, 0.3]; corpoY = Math.abs(Math.cos(f * TAU)) * -0.02; }
    if (pose === 'pulando') { fr = [-1.1, 0.4]; fr2 = [-1.0, 0.3]; tr = [0.9, -0.2]; tr2 = [1.0, -0.3]; corpoY = -0.35 * Math.sin(clamp(f, 0, 1) * Math.PI); giro = -0.15; boca = 0.9; }
    if (pose === 'atingido') { fr = [0.35, -0.3]; fr2 = [0.2, -0.2]; tr = [-0.2, 0.5]; tr2 = [-0.05, 0.45]; corpoY = -0.02; giro = 0.14; boca = 0.8; }
    if (pose === 'caido') { fr = [1.3, 0]; fr2 = [1.2, 0]; tr = [1.3, 0]; tr2 = [1.2, 0]; corpoY = 0.3; giro = 0; boca = 0.2; }

    ctx.save();
    ctx.translate(x, y); ctx.scale(o.espelhar ? -s : s, s);
    // sombra no chão
    ctx.fillStyle = 'rgba(20,14,10,0.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 0.75, 0.07, 0, 0, TAU); ctx.fill();
    if (dis > 0) ctx.globalAlpha = 1 - dis;
    ctx.translate(0, corpoY); ctx.rotate(giro);
    const ombro = [0.28, -0.42], quadril = [-0.36, -0.42];
    const Lc = 0.24, Lb = 0.22;
    // pernas de trás (lado longe, mais escuras)
    perna(ctx, quadril[0] + 0.03, quadril[1], Lc, Lb, tr2[0], tr2[1], 0.065, P.costas, P.escuro);
    perna(ctx, ombro[0] - 0.03, ombro[1], Lc, Lb, fr2[0], fr2[1], 0.055, P.costas, P.escuro);
    // rabo peludo
    const rb = Math.sin(t * 3) * 0.04;
    poli(ctx, [[-0.42, -0.55], [-0.62, -0.5 + rb], [-0.82, -0.36 + rb], [-0.86, -0.28 + rb], [-0.7, -0.3 + rb * 0.5], [-0.5, -0.38]], P.costas, 'rgba(40,26,20,0.6)');
    poli(ctx, [[-0.78, -0.34 + rb], [-0.86, -0.28 + rb], [-0.74, -0.3 + rb]], P.barriga);
    // corpo
    const corpo = [[-0.46, -0.58], [-0.2, -0.64], [0.12, -0.66], [0.34, -0.7], [0.46, -0.58], [0.44, -0.36], [0.3, -0.26], [0.0, -0.3], [-0.3, -0.29], [-0.48, -0.36]];
    poli(ctx, corpo, P.base, 'rgba(40,26,20,0.7)');
    // sela escura nas costas e facetas de sombra
    poli(ctx, [[-0.46, -0.58], [-0.2, -0.64], [0.12, -0.66], [0.34, -0.7], [0.3, -0.58], [0.05, -0.54], [-0.25, -0.5], [-0.44, -0.48]], P.costas);
    poli(ctx, [[-0.3, -0.29], [0.0, -0.3], [-0.05, -0.38], [-0.32, -0.36]], Estilo.multiply(P.base, '#C9B8C0'));
    poli(ctx, [[0.3, -0.26], [0.44, -0.36], [0.46, -0.5], [0.36, -0.42]], P.barriga);
    // marcas de pelo
    ctx.strokeStyle = 'rgba(60,40,30,0.5)'; ctx.lineWidth = 0.01; ctx.lineCap = 'round';
    for (const [a, b] of [[[-0.1, -0.47], [0.05, -0.42]], [[-0.25, -0.44], [-0.12, -0.4]], [[0.12, -0.5], [0.22, -0.45]]]) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    // pernas da frente (lado perto)
    perna(ctx, quadril[0], quadril[1], Lc, Lb, tr[0], tr[1], 0.075, P.base, P.escuro);
    perna(ctx, ombro[0], ombro[1], Lc, Lb, fr[0], fr[1], 0.06, P.base, P.escuro);
    // juba do pescoço (tufos claros)
    poli(ctx, [[0.34, -0.72], [0.5, -0.74], [0.56, -0.56], [0.5, -0.44], [0.46, -0.5], [0.42, -0.4], [0.38, -0.5], [0.3, -0.56]], P.barriga, 'rgba(40,26,20,0.5)');
    // cabeça
    ctx.save(); ctx.translate(0.5, -0.74); ctx.rotate(-giro * 0.6 + resp * 3);
    const ab = boca * 0.07;
    // mandíbula de baixo
    poli(ctx, [[0.08, 0.08], [0.36, 0.08 + ab * 0.6], [0.38, 0.11 + ab], [0.1, 0.15]], P.focinho, 'rgba(40,26,20,0.7)');
    // boca aberta (interior e dentes)
    if (ab > 0.005) {
      poli(ctx, [[0.12, 0.08], [0.37, 0.07], [0.36, 0.08 + ab * 0.7], [0.12, 0.11]], '#7A2630');
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) { const tx = 0.2 + i * 0.045; ctx.beginPath(); ctx.moveTo(tx, 0.07); ctx.lineTo(tx + 0.015, 0.07 + 0.035); ctx.lineTo(tx + 0.03, 0.07); ctx.fill(); ctx.beginPath(); ctx.moveTo(tx + 0.01, 0.09 + ab * 0.65); ctx.lineTo(tx + 0.022, 0.06 + ab * 0.65); ctx.lineTo(tx + 0.035, 0.09 + ab * 0.65); ctx.fill(); }
    }
    // crânio + focinho
    poli(ctx, [[-0.1, -0.02], [0.0, -0.12], [0.14, -0.1], [0.26, -0.03], [0.42, 0.0], [0.44, 0.05], [0.38, 0.08], [0.12, 0.08], [0.0, 0.14], [-0.1, 0.1]], P.base, 'rgba(40,26,20,0.75)');
    poli(ctx, [[0.14, -0.1], [0.26, -0.03], [0.42, 0.0], [0.3, 0.02], [0.14, -0.02]], Estilo.screen(P.base, '#FFF0D8', 0.25));
    poli(ctx, [[0.12, 0.04], [0.38, 0.06], [0.38, 0.08], [0.12, 0.08], [0.02, 0.12]], P.focinho);
    poli(ctx, [[-0.1, -0.02], [0.0, -0.12], [0.06, -0.08], [-0.04, 0.02]], P.costas);
    // orelhas
    poli(ctx, [[-0.02, -0.08], [-0.02, -0.28], [0.1, -0.1]], P.base, 'rgba(40,26,20,0.75)');
    poli(ctx, [[0.0, -0.1], [0.0, -0.22], [0.07, -0.11]], '#8A5A4A');
    poli(ctx, [[-0.08, -0.06], [-0.12, -0.24], [0.0, -0.09]], P.costas, 'rgba(40,26,20,0.6)');
    // olho bravo + sobrancelha
    ctx.fillStyle = '#F2C14A'; ctx.beginPath(); ctx.moveTo(0.12, -0.04); ctx.lineTo(0.2, -0.03); ctx.lineTo(0.13, -0.01); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1A1210'; ctx.beginPath(); ctx.arc(0.155, -0.027, 0.011, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2A1C16'; ctx.lineWidth = 0.016; ctx.beginPath(); ctx.moveTo(0.1, -0.07); ctx.lineTo(0.21, -0.04); ctx.stroke();
    // nariz
    ctx.fillStyle = '#1A1210'; ctx.beginPath(); ctx.ellipse(0.43, 0.02, 0.025, 0.02, 0, 0, TAU); ctx.fill();
    // bochecha peluda
    poli(ctx, [[-0.02, 0.06], [0.08, 0.12], [0.0, 0.18], [-0.06, 0.12]], P.barriga);
    ctx.restore();
    ctx.restore();

    // dissolvendo: faíscas de luz subindo
    if (dis > 0) {
      const r = rng(77);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 40; i++) {
        const px = x + (r() - 0.5) * s * 1.4, py = y - r() * s * 0.8 - dis * s * (0.3 + r() * 0.6), rr = s * 0.012 * (1 - dis * 0.5) * (0.5 + r());
        ctx.fillStyle = `rgba(255,${200 + Math.floor(r() * 50)},140,${(1 - dis) * 0.9})`; ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  function barraVida(ctx, x, y, w, frac, o = {}) {
    const h = o.h || 26, a = o.alfa === undefined ? 1 : o.alfa;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `900 ${h * 0.95}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = h * 0.22; ctx.strokeStyle = 'rgba(20,14,20,0.8)';
    const txt = `${Math.max(0, Math.round(frac * (o.max || 100)))}/${o.max || 100}`;
    ctx.strokeText(txt, x, y - h * 1.15); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, x, y - h * 1.15);
    ctx.fillStyle = 'rgba(20,14,20,0.8)'; ctx.beginPath(); ctx.roundRect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, (h + 8) / 2); ctx.fill();
    if (o.atraso !== undefined && o.atraso > frac) { ctx.fillStyle = '#F2D9A0'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w * clamp(o.atraso, 0, 1), h, h / 2); ctx.fill(); }
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#FF7A7A'); g.addColorStop(1, '#D23A42');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, Math.max(0, w * clamp(frac, 0, 1)), h, h / 2); ctx.fill();
    if (o.nome) {
      ctx.font = `800 ${h * 0.75}px Inter`; const tw = ctx.measureText(o.nome + '   ' + (o.nivel || '')).width + h;
      ctx.fillStyle = 'rgba(20,14,20,0.85)'; ctx.beginPath(); ctx.roundRect(x - tw / 2, y + h * 0.9, tw, h * 1.1, h * 0.3); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'right'; ctx.fillText(o.nome, x + h * 0.1, y + h * 1.45);
      ctx.fillStyle = '#F2C14A'; ctx.textAlign = 'left'; ctx.fillText(o.nivel || '', x + h * 0.6, y + h * 1.45);
    }
    ctx.restore();
  }

  window.Criaturas = { lobo, barraVida };
})();

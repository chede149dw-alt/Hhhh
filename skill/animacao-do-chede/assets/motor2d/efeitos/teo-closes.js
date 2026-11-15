// Closes do Téo lobisomem (série VALDOR), no estilo da referência 3 (referencias/nova/personagens/lobisomem-ref-03-teo.png).
// TeoCloses.olho(ctx, x, y, s, t, o)  — olho de fera amarelo com pupila em fenda; s = largura do olho em px.
//   o.abre (0..1, pálpebra), o.brilho (0..1), o.pelo (true: pinta o pelo em volta num retângulo 3s × 1.8s)
// TeoCloses.garra(ctx, x, y, s, t, o) — pata com garras pretas, vista de lado; s = comprimento da pata em px.
//   o.estende (0..1: garras crescendo), o.espelhar
(function () {
  const PELO = '#D45E2A', PELO2 = '#963616', LISTRA = '#4A1A0C', CREME = '#F3E4CC', L = '#1E0E08';
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  function fios(ctx, x0, y0, w, h, n, cor, ang, comp, seed) {
    const r = rng(seed); ctx.strokeStyle = cor; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, a = ang + (r() - 0.5) * 0.5, c = comp * (0.6 + r() * 0.6); ctx.lineWidth = comp * 0.08; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * c * 0.5 + c * 0.1, y + Math.sin(a) * c * 0.5, x + Math.cos(a) * c, y + Math.sin(a) * c); ctx.stroke(); }
  }
  function olho(ctx, x, y, s, t = 0, o = {}) {
    const abre = o.abre === undefined ? 1 : o.abre, br = o.brilho === undefined ? 1 : o.brilho;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
    if (o.pelo !== false) {
      const g = ctx.createLinearGradient(0, -2, 0, 2); g.addColorStop(0, '#B8461C'); g.addColorStop(0.5, PELO); g.addColorStop(1, '#E0743A');
      ctx.fillStyle = g; ctx.fillRect(-2, -2, 4, 4);
      fios(ctx, -2, -2, 4, 4, 380, 'rgba(120,40,14,0.55)', 0.35, 0.22, 7);
      fios(ctx, -2, -2, 4, 4, 200, 'rgba(255,170,110,0.45)', 0.3, 0.18, 11);
      // listras escuras em cima (como na referência)
      ctx.fillStyle = LISTRA;
      for (const [a, b, c] of [[-1.5, -2, -0.6], [-0.9, -2, -0.55], [-0.35, -2, -0.58], [0.25, -2, -0.6], [0.85, -2, -0.65]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(a + 0.25, c + 0.1, a + 0.55, c); ctx.quadraticCurveTo(a + 0.3, c - 0.05, a + 0.2, b); ctx.closePath(); ctx.fill(); }
      // pelo claro embaixo do olho
      ctx.fillStyle = 'rgba(243,228,204,0.85)'; ctx.beginPath(); ctx.moveTo(-1.5, 0.6); ctx.quadraticCurveTo(-0.4, 0.32, 0.8, 0.5); ctx.lineTo(2, 0.9); ctx.lineTo(2, 2); ctx.lineTo(-2, 2); ctx.lineTo(-2, 0.6); ctx.closePath(); ctx.fill();
      fios(ctx, -2, 0.6, 4, 1.4, 120, 'rgba(190,160,120,0.5)', 1.2, 0.16, 5);
    }
    // brilho em volta
    const gl = ctx.createRadialGradient(0, 0, 0.1, 0, 0, 1.1); gl.addColorStop(0, `rgba(255,210,70,${0.55 * br})`); gl.addColorStop(1, 'rgba(255,160,40,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 1.1, 0, Math.PI * 2); ctx.fill();
    // formato amendoado (canto de fora sobe)
    const h = 0.34 * abre;
    const forma = new Path2D(); forma.moveTo(-0.62, 0.06); forma.quadraticCurveTo(-0.1, -0.05 - h * 1.3, 0.6, -0.16); forma.quadraticCurveTo(0.05, 0.1 + h * 0.9, -0.62, 0.06); forma.closePath();
    ctx.fillStyle = '#2A0E06'; ctx.save(); ctx.translate(0, 0); ctx.scale(1.12, 1.25); ctx.fill(forma); ctx.restore();
    if (abre > 0.03) {
      ctx.save(); ctx.clip(forma);
      const gi = ctx.createRadialGradient(-0.02, -0.05, 0.02, -0.02, -0.05, 0.42); gi.addColorStop(0, '#FFF6B0'); gi.addColorStop(0.45, '#FFD23A'); gi.addColorStop(0.85, '#E8961A'); gi.addColorStop(1, '#8A4A0A');
      ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(-0.02, -0.05, 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,80,10,0.5)'; ctx.lineWidth = 0.012;
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(-0.02 + Math.cos(a) * 0.1, -0.05 + Math.sin(a) * 0.1); ctx.lineTo(-0.02 + Math.cos(a) * 0.38, -0.05 + Math.sin(a) * 0.38); ctx.stroke(); }
      // pupila em fenda
      ctx.fillStyle = '#0A0402'; ctx.beginPath(); ctx.ellipse(-0.02, -0.05, 0.05, 0.4, 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(-0.17, -0.17, 0.07, 0.045, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0.13, 0.03, 0.025, 0, Math.PI * 2); ctx.fill();
      // sombra da pálpebra em cima
      ctx.fillStyle = 'rgba(60,20,5,0.45)'; ctx.fillRect(-0.7, -0.6, 1.4, 0.18 + (1 - abre) * 0.3);
      ctx.restore();
    }
    ctx.strokeStyle = L; ctx.lineWidth = 0.045; ctx.stroke(forma);
    // risco grosso da pálpebra de cima e sobrancelha brava
    ctx.lineCap = 'round'; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.moveTo(-0.66, 0.04); ctx.quadraticCurveTo(-0.1, -0.06 - h * 1.35, 0.68, -0.2); ctx.stroke();
    ctx.lineWidth = 0.1; ctx.beginPath(); ctx.moveTo(-0.7, -0.42); ctx.quadraticCurveTo(-0.1, -0.55, 0.75, -0.62); ctx.stroke();
    ctx.restore();
  }
  function garra(ctx, x, y, s, t = 0, o = {}) {
    const e = o.estende === undefined ? 1 : o.estende;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.giro || 0); ctx.scale(o.espelhar ? -s : s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const forma = (fn, cor, lw = 0.018) => { const p = new Path2D(); fn(p); ctx.fillStyle = cor; ctx.fill(p); ctx.strokeStyle = L; ctx.lineWidth = lw; ctx.stroke(p); return p; };
    // antebraço peludo entrando pela esquerda
    const braco = forma((p) => { p.moveTo(-1.2, -0.35); p.quadraticCurveTo(-0.6, -0.42, -0.2, -0.3); p.lineTo(-0.15, 0.22); p.quadraticCurveTo(-0.6, 0.3, -1.2, 0.3); p.closePath(); }, PELO);
    ctx.save(); ctx.clip(braco); fios(ctx, -1.2, -0.45, 1.1, 0.8, 70, 'rgba(120,40,14,0.6)', 0.1, 0.16, 3);
    ctx.fillStyle = LISTRA; for (const xx of [-0.95, -0.6]) { ctx.beginPath(); ctx.moveTo(xx, -0.4); ctx.quadraticCurveTo(xx + 0.12, -0.15, xx + 0.05, 0.05); ctx.quadraticCurveTo(xx + 0.02, -0.15, xx - 0.06, -0.4); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // tufos de pelo no pulso
    ctx.fillStyle = PELO2; for (let i = 0; i < 5; i++) { const yy = -0.34 + i * 0.13; ctx.beginPath(); ctx.moveTo(-0.3, yy); ctx.quadraticCurveTo(-0.08, yy + 0.02, -0.02, yy + 0.08); ctx.quadraticCurveTo(-0.12, yy + 0.08, -0.3, yy + 0.11); ctx.closePath(); ctx.fill(); }
    // dedos (4) com garras pretas curvas
    const dedos = [[-0.2, 0.08], [-0.08, 0.06], [0.04, 0.05], [0.16, 0.06]];
    dedos.slice().reverse().forEach(([dy], k) => {
      const i = 3 - k, by = -0.28 + i * 0.17, ex = 0.42 + (i === 0 || i === 3 ? -0.06 : 0);
      forma((p) => { p.moveTo(-0.15, by - 0.07); p.quadraticCurveTo(ex * 0.6, by - 0.12, ex, by - 0.02); p.quadraticCurveTo(ex + 0.06, by + 0.08, ex - 0.04, by + 0.1); p.quadraticCurveTo(ex * 0.5, by + 0.13, -0.15, by + 0.08); p.closePath(); }, i % 2 ? PELO : '#C9531F');
      // almofadinha clara
      ctx.fillStyle = 'rgba(243,228,204,0.6)'; ctx.beginPath(); ctx.ellipse(ex - 0.08, by + 0.07, 0.05, 0.025, 0, 0, Math.PI * 2); ctx.fill();
      // garra
      const c = 0.32 * e;
      if (c > 0.01) {
        const g = ctx.createLinearGradient(ex, by, ex + c, by + c * 0.6); g.addColorStop(0, '#3A2E2A'); g.addColorStop(0.6, '#140C0A'); g.addColorStop(1, '#0A0605');
        const p = new Path2D(); p.moveTo(ex - 0.03, by - 0.05); p.quadraticCurveTo(ex + c * 0.9, by - 0.04, ex + c * 1.05, by + c * 0.75); p.quadraticCurveTo(ex + c * 0.5, by + 0.04, ex - 0.02, by + 0.07); p.closePath();
        ctx.fillStyle = g; ctx.fill(p); ctx.strokeStyle = L; ctx.lineWidth = 0.014; ctx.stroke(p);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.012; ctx.beginPath(); ctx.moveTo(ex + 0.02, by - 0.03); ctx.quadraticCurveTo(ex + c * 0.7, by - 0.02, ex + c * 0.92, by + c * 0.5); ctx.stroke();
      }
    });
    ctx.restore();
  }
  window.TeoCloses = { olho, garra };
})();

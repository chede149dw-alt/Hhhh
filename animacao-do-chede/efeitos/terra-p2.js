// Efeitos da Terra · Parte 2 (mesmas cores do poder da terra: âmbar #FFB347, miolo #FFE2B0, terra #8B5E3C)
//   Efeitos.nucleoTerra(ctx, x, y, H, t, pulso)          coração de pedra gigante pulsando (H = diâmetro em px)
//   Efeitos.amuleto(ctx, x, y, r, brilho, t)              amuleto da mãe: moldura de bronze, pedra laranja e o símbolo
//   Efeitos.muroPedra(ctx, cam, X, Z, larg, sobe, t, o)   muro de blocos subindo do chão (sobe 0..1; o.racha 0..1)
//   Efeitos.luzColorida(ctx, x, y, r, a, cor)             luz de uma fonte (cristal, núcleo) somada na cena
(function () {
  const TAU = Math.PI * 2;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  window.Efeitos = window.Efeitos || {};

  function luzColorida(ctx, x, y, r, a, cor = '255,150,60') {
    if (a <= 0.01 || r <= 1) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.35, `rgba(${cor},${a * 0.4})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  Efeitos.luzColorida = luzColorida;

  Efeitos.nucleoTerra = function (ctx, x, y, H, t, pulso = 0) {
    const k = 1 + 0.05 * pulso;
    luzColorida(ctx, x, y, H * (1.6 + 0.5 * pulso), 0.45 + 0.4 * pulso);
    // anel de pedras orbitando (atrás)
    const r = rng(5), pedras = [];
    for (let i = 0; i < 14; i++) pedras.push({ a: r() * TAU, d: 0.62 + r() * 0.25, v: 0.25 + r() * 0.35, s: 0.04 + r() * 0.05, y: (r() - 0.5) * 0.25 });
    const pedra = (p, frente) => {
      const a = p.a + t * p.v, sn = Math.sin(a); if ((sn > 0) !== frente) return;
      const px = x + Math.cos(a) * H * p.d, py = y + (p.y + sn * 0.12) * H, s = p.s * H * (1 + 0.25 * sn);
      if (Efeitos._pedra) Efeitos._pedra(ctx, px, py, s, a * 2, 900 + Math.floor(p.d * 100), null);
    };
    pedras.forEach((p) => pedra(p, false));
    Efeitos['poder-terra'](ctx, x, y, H * 0.62 * k, { t, tamanho: 1 });
    pedras.forEach((p) => pedra(p, true));
    // pulso: anel de luz expandindo a cada batida
    if (pulso > 0.05) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,190,110,${0.5 * pulso})`; ctx.lineWidth = H * 0.02;
      ctx.beginPath(); ctx.arc(x, y, H * (0.45 + (1 - pulso) * 0.5), 0, TAU); ctx.stroke(); ctx.restore();
    }
  };

  Efeitos.amuleto = function (ctx, x, y, r, brilho = 1, t = 0) {
    ctx.save(); ctx.translate(x, y);
    // cordão
    ctx.strokeStyle = '#4A3424'; ctx.lineWidth = r * 0.08;
    ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 2.4); ctx.quadraticCurveTo(-r * 0.4, -r * 1.2, 0, -r * 1.05); ctx.quadraticCurveTo(r * 0.4, -r * 1.2, r * 0.9, -r * 2.4); ctx.stroke();
    luzColorida(ctx, x, y, r * (3.2 + 0.4 * Math.sin(t * 4)), 0.4 * brilho);
    // moldura de bronze em losango
    const los = (k) => { ctx.beginPath(); ctx.moveTo(0, -r * k); ctx.lineTo(r * 0.8 * k, 0); ctx.lineTo(0, r * k); ctx.lineTo(-r * 0.8 * k, 0); ctx.closePath(); };
    los(1.08); ctx.fillStyle = '#7A5426'; ctx.fill();
    los(1.0); const gb = ctx.createLinearGradient(-r, -r, r, r); gb.addColorStop(0, '#F0C870'); gb.addColorStop(0.5, '#B7832F'); gb.addColorStop(1, '#6E4A1C'); ctx.fillStyle = gb; ctx.fill();
    // pedra laranja
    los(0.74); const gp = ctx.createRadialGradient(-r * 0.2, -r * 0.25, 0, 0, 0, r * 0.8); gp.addColorStop(0, '#FFE2B0'); gp.addColorStop(0.45, '#FF9A3C'); gp.addColorStop(1, '#9C3E10'); ctx.fillStyle = gp; ctx.fill();
    ctx.restore();
    if (window.desenharSimboloTerra) window.desenharSimboloTerra(ctx, x, y, r * 0.5, 0.6 + 0.4 * brilho, '255,240,200');
  };

  Efeitos.muroPedra = function (ctx, cam, X, Z, larg, sobe, t, o = {}) {
    if (sobe <= 0) return;
    const alt = (o.altura || 1.9) * Math.min(1, sobe), r = rng(o.semente || 13);
    const nb = Math.max(3, Math.round(larg / 0.55)), w = larg / nb;
    const c = cam.p(X, 0, Z); if (c.atras || c.dz < 1) return;
    // poeira na base enquanto sobe
    if (sobe < 1.2 && Efeitos.terraPoeira) Efeitos.terraPoeira(ctx, c.x, c.y, c.s * larg * 0.7, Math.min(0.99, sobe), { semente: 77 });
    for (let i = 0; i < nb; i++) {
      const x0 = X - larg / 2 + i * w, h = alt * (0.82 + r() * 0.3), d = 0.45 + r() * 0.15, atraso = r() * 0.25;
      const hh = h * Math.max(0, Math.min(1, (sobe - atraso) / (1 - atraso)));
      if (hh <= 0.02) continue;
      Cena3D.caixa(ctx, cam, x0 + 0.02, x0 + w - 0.02, 0, hh, Z - d / 2, Z + d / 2, i % 2 ? '#7A7480' : '#6A6370');
      // ponta irregular
      const q0 = cam.p(x0 + 0.02, hh, Z - d / 2), q1 = cam.p(x0 + w - 0.02, hh, Z - d / 2), qm = cam.p(x0 + w * (0.3 + r() * 0.4), hh + 0.18, Z - d / 2);
      ctx.fillStyle = cam.tom('#8C8494', Z); ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(qm.x, qm.y); ctx.lineTo(q1.x, q1.y); ctx.closePath(); ctx.fill();
    }
    // rachadura brilhando no muro depois do soco
    const rc = o.racha || 0;
    if (rc > 0) {
      const pts = [[0, 0.95], [0.08, 0.7], [-0.06, 0.5], [0.1, 0.3], [-0.02, 0.1]].map(([dx, fy]) => cam.p(X + dx * larg, alt * fy, Z - 0.26));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (const [lw, cor] of [[c.s * 0.09, `rgba(255,120,30,${0.3 * rc})`], [c.s * 0.035, `rgba(255,190,100,${0.95 * rc})`]]) {
        ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
      }
      ctx.restore();
    }
    void t;
  };
})();

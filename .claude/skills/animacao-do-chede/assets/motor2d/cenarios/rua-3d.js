// Cenário em perspectiva: RUA DO BAIRRO no fim de tarde (estilo da referência, regras do guia).
// Mundo em metros: rua de 7 m (x de -3,5 a 3,5) indo para dentro (Z), calçadas até ±6 m, casas a partir de ±6,8 m.
// Uso: Cenarios3D.rua.desenhar(ctx, cam, { t }) — depois desenhe os personagens com Cena3D.personagem,
//      e por fim Cenarios3D.rua.frente(ctx, cam, { desfoque }) para os elementos de primeiro plano.
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const T = (n) => Estilo.tom(n);
  const { face, caixa, arvore } = Cena3D;
  const CASAS = ['casaAreia', 'casaRosa', 'casaCeu', 'parede', 'casaAreia', 'casaCeu', 'casaRosa'];

  function ceu(ctx, cam) {
    const W = ctx.canvas.width, hz = cam.cy - (0 - cam.y) * 0; // horizonte = cam.cy
    const g = ctx.createLinearGradient(0, 0, 0, cam.cy + 40);
    g.addColorStop(0, '#9FCBE6'); g.addColorStop(0.45, '#C9E1EC'); g.addColorStop(0.8, '#F6DCC0'); g.addColorStop(1, '#F7CFA2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, cam.cy + 60);
    // sol baixo à esquerda com halo
    const sx = cam.cx - 380 - cam.x * 4, sy = cam.cy - 520;
    const h = ctx.createRadialGradient(sx, sy, 0, sx, sy, 420);
    h.addColorStop(0, 'rgba(255,236,190,0.95)'); h.addColorStop(0.25, 'rgba(255,220,160,0.5)'); h.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = h; ctx.fillRect(0, 0, W, cam.cy + 60);
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(sx, sy, 70, 0, Math.PI * 2); ctx.fill();
    // morros/prédios ao longe, bem clareados
    ctx.fillStyle = Cena3D.mistura('#9FB7C9', '#F6DFC2', 0.55);
    ctx.beginPath(); ctx.moveTo(0, cam.cy + 4);
    for (let x = 0; x <= W; x += 60) ctx.lineTo(x, cam.cy - 30 - 22 * Math.sin(x * 0.011) - 14 * Math.sin(x * 0.037));
    ctx.lineTo(W, cam.cy + 4); ctx.closePath(); ctx.fill();
  }

  // geometria (m): rua ±3, calçada até ±5, muro em ±5, fachada em ±6,2
  const RUA = 3, CALC = 5, FACH = 6.2;
  // faixas de chão em Z cada vez mais compridas: a névoa muda com a distância
  function faixasZ(cam, ate = 140) {
    const zs = []; let z = cam.z + 0.1, d = 0.6;
    while (z < ate) { zs.push(z); z += d; d *= 1.18; }
    zs.push(ate); return zs;
  }
  function chao(ctx, cam) {
    const zs = faixasZ(cam);
    for (let i = 0; i < zs.length - 1; i++) {
      const a = zs[i], b = zs[i + 1] + 0.02;
      face(ctx, cam, [[-RUA, 0, a], [RUA, 0, a], [RUA, 0, b], [-RUA, 0, b]], T('asfalto').base, { contorno: false });
      for (const s of [-1, 1]) {
        face(ctx, cam, [[RUA * s, 0, a], [RUA * s, 0.15, a], [RUA * s, 0.15, b], [RUA * s, 0, b]], T('calcada').sombra, { contorno: false });
        face(ctx, cam, [[RUA * s, 0.15, a], [CALC * s, 0.15, a], [CALC * s, 0.15, b], [RUA * s, 0.15, b]], T('calcada').base, { contorno: false });
        face(ctx, cam, [[(RUA - 0.25) * s, 0.002, a], [(RUA - 0.15) * s, 0.002, a], [(RUA - 0.15) * s, 0.002, b], [(RUA - 0.25) * s, 0.002, b]], '#EDE6DA', { contorno: false });
      }
    }
    // faixa central amarela tracejada
    for (let z = Math.ceil(cam.z / 4) * 4; z < 90; z += 4) face(ctx, cam, [[-0.08, 0.003, z], [0.08, 0.003, z], [0.08, 0.003, z + 2], [-0.08, 0.003, z + 2]], '#E9C04F', { contorno: false });
    // juntas da calçada
    ctx.save(); ctx.strokeStyle = 'rgba(120,100,120,0.3)';
    for (const s of [-1, 1]) for (let z = Math.ceil(cam.z / 1.5) * 1.5; z < 50; z += 1.5) {
      const a = cam.p(RUA * s, 0.15, z), b = cam.p(CALC * s, 0.15, z);
      if (a.atras || b.atras) continue;
      ctx.lineWidth = Math.max(0.6, a.s * 0.01); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();
    // remendos de asfalto, sutis
    const rnd = Cena.rng(7);
    for (let i = 0; i < 26; i++) {
      const z = cam.z + 2 + rnd() * 35, x = (rnd() - 0.5) * 4.6, w = 0.3 + rnd() * 0.7;
      face(ctx, cam, [[x, 0.002, z], [x + w, 0.002, z], [x + w * 0.9, 0.002, z + w * 0.5], [x, 0.002, z + w * 0.4]], Estilo.multiply(T('asfalto').base, '#EAE6F0'), { contorno: false });
    }
  }

  function casa(ctx, cam, s, z0, z1, k) {
    const prof = 9, h = 3.0 + (k % 3) * 0.35;
    const cor = T(CASAS[k % CASAS.length]);
    // muro/frente baixa na divisa com a calçada
    caixa(ctx, cam, s < 0 ? -(CALC + 0.2) : CALC, s < 0 ? -CALC : CALC + 0.2, 0.15, 1.3, z0, z1, cor.luz);
    // fachada voltada para a rua
    const xf = FACH * s;
    face(ctx, cam, [[xf, 0, z0 + 0.4], [xf, 0, z1 - 0.4], [xf, h, z1 - 0.4], [xf, h, z0 + 0.4]], s < 0 ? cor.base : cor.sombra);
    // telhado (aba inclinada para dentro)
    const xr = (FACH - 0.4) * s, xt = (FACH + prof * 0.45) * s;
    face(ctx, cam, [[xr, h, z0], [xr, h, z1], [xt, h + 1.6, z1 - 0.8], [xt, h + 1.6, z0 + 0.8]], T('telhado').base);
    face(ctx, cam, [[xr, h - 0.12, z0], [xr, h - 0.12, z1], [xr, h, z1], [xr, h, z0]], T('telhado').sombra);
    // janelas e porta na fachada
    const nJ = 2;
    for (let i = 0; i < nJ; i++) {
      const za = z0 + 1.4 + i * ((z1 - z0 - 2.6) / nJ), zb = za + 1.1;
      face(ctx, cam, [[xf - 0.01 * s, 1.2, za], [xf - 0.01 * s, 1.2, zb], [xf - 0.01 * s, 2.2, zb], [xf - 0.01 * s, 2.2, za]], T('vidro').base);
      face(ctx, cam, [[xf - 0.02 * s, 1.12, za - 0.08], [xf - 0.02 * s, 1.12, zb + 0.08], [xf - 0.02 * s, 1.2, zb + 0.08], [xf - 0.02 * s, 1.2, za - 0.08]], T('linho').base);
    }
    const zp = z1 - 1.8;
    face(ctx, cam, [[xf - 0.01 * s, 0, zp], [xf - 0.01 * s, 0, zp + 0.9], [xf - 0.01 * s, 2.1, zp + 0.9], [xf - 0.01 * s, 2.1, zp]], T('madeira').base);
    // grade de ferro em cima do muro
    ctx.save(); ctx.strokeStyle = cam.tom('#3A3442', (z0 + z1) / 2);
    const xg = (CALC + 0.1) * s;
    for (let z = z0 + 0.2; z < z1; z += 0.25) {
      const a = cam.p(xg, 1.3, z), b = cam.p(xg, 2.0, z);
      if (a.atras) continue;
      ctx.lineWidth = Math.max(0.6, a.s * 0.02); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    const a1 = cam.p(xg, 2.0, z0), b1 = cam.p(xg, 2.0, z1); if (!a1.atras && !b1.atras) { ctx.lineWidth = Math.max(0.8, a1.s * 0.03); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
    ctx.restore();
  }

  function postes(ctx, cam) {
    const tops = { '-1': [], '1': [] };
    for (let z = 4; z < 90; z += 18) {
      for (const s of [-1, 1]) {
        if (s > 0 && z % 36 !== 4) continue;
        const x = (RUA + 0.6) * s;
        caixa(ctx, cam, x - 0.1, x + 0.1, 0.15, 7.5, z, z + 0.2, '#6F6878');
        caixa(ctx, cam, Math.min(x, x - 0.9 * s) - 0.03, Math.max(x, x - 0.9 * s) + 0.03, 7.1, 7.2, z, z + 0.15, '#6F6878');
        tops[s].push(cam.p(x, 7.3, z));
      }
    }
    // fios (curvas entre os postes)
    ctx.save(); ctx.strokeStyle = 'rgba(40,30,45,0.6)';
    for (const s of [-1, 1]) {
      const t = tops[s];
      for (let i = 0; i < t.length - 1; i++) for (const dy of [0, 0.25]) {
        const a = t[i], b = t[i + 1];
        if (a.atras || b.atras) continue;
        ctx.lineWidth = Math.max(0.6, a.s * 0.012);
        ctx.beginPath(); ctx.moveTo(a.x, a.y + dy * a.s); ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.6 * (a.s + b.s) / 2, b.x, b.y + dy * b.s); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // carro estacionado (encostado no meio-fio direito)
  function carro(ctx, cam, x, z, cor) {
    const c = T(cor);
    for (const zr of [z + 0.7, z + 3.3]) for (const xr of [x - 0.75, x + 0.75]) {
      const q = cam.p(xr, 0.33, zr); if (q.atras) continue; ctx.fillStyle = cam.tom('#26212C', zr);
      ctx.beginPath(); ctx.ellipse(q.x, q.y, Math.max(2, q.s * 0.12), q.s * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    }
    caixa(ctx, cam, x - 0.85, x + 0.85, 0.3, 1.0, z, z + 4.0, c.base);
    caixa(ctx, cam, x - 0.75, x + 0.75, 1.0, 1.5, z + 1.1, z + 3.0, c.base);
    face(ctx, cam, [[x - 0.7, 1.03, z + 1.12], [x + 0.7, 1.03, z + 1.12], [x + 0.62, 1.45, z + 1.3], [x - 0.62, 1.45, z + 1.3]], T('vidro').base);
    face(ctx, cam, [[x - 0.752, 1.05, z + 1.4], [x - 0.752, 1.05, z + 2.8], [x - 0.752, 1.42, z + 2.7], [x - 0.752, 1.42, z + 1.5]], T('vidro').base);
    for (const xs of [x - 0.6, x + 0.6]) { const q = cam.p(xs, 0.75, z - 0.01); if (q.atras) continue; ctx.fillStyle = cam.tom('#FFF1C8', z); ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.5, q.s * 0.09), 0, Math.PI * 2); ctx.fill(); }
  }
  function lixeira(ctx, cam, x, z, cor) {
    caixa(ctx, cam, x - 0.28, x + 0.28, 0.15, 1.15, z, z + 0.55, T(cor).base);
    caixa(ctx, cam, x - 0.31, x + 0.31, 1.15, 1.22, z - 0.03, z + 0.58, T(cor).sombra);
  }
  function arbusto(ctx, cam, x, z) {
    const q = cam.p(x, 0.15, z), s2 = q.s;
    if (q.dz < 0.8) return;
    for (const [dx, dy, r, cor] of [[0, 0.35, 0.45, '#4F8A3A'], [-0.3, 0.25, 0.32, '#5E9E5A'], [0.3, 0.28, 0.35, '#6FAF55'], [0.05, 0.55, 0.3, '#86B46E']]) {
      ctx.fillStyle = cam.tom(cor, z); ctx.beginPath(); ctx.arc(q.x + dx * s2, q.y - dy * s2, r * s2, 0, Math.PI * 2); ctx.fill();
    }
  }

  window.Cenarios3D.rua = {
    nevoa: '#F6DFC2',
    desenhar(ctx, cam, o = {}) {
      ctx.save();
      ceu(ctx, cam);
      chao(ctx, cam);
      // do fundo para a frente
      const itens = [];
      for (let k = 0, z = 2; z < 110; k++, z += 11.5) for (const s of [-1, 1]) itens.push({ z, f: () => casa(ctx, cam, s, z, z + 10, k + (s > 0 ? 3 : 0)) });
      for (let z = 8; z < 100; z += 14) for (const s of [-1, 1]) itens.push({ z: z + 0.5, f: () => arvore(ctx, cam, (CALC - 0.7) * s, z + (s > 0 ? 7 : 0), 5.2 + ((z / 14) % 2) * 0.8) });
      for (const [z, cor] of [[9, 'brasa'], [27, 'casaCeu'], [46, 'mostarda']]) itens.push({ z: z + 2, f: () => carro(ctx, cam, RUA - 1.0, z, cor) });
      for (let z = 5; z < 70; z += 12.5) itens.push({ z, f: () => lixeira(ctx, cam, -(CALC - 0.45), z, z % 2 ? 'folhagem' : 'pedra') });
      for (let z = 3; z < 80; z += 7.3) for (const s of [-1, 1]) itens.push({ z: z + 0.2, f: () => arbusto(ctx, cam, (CALC - 0.25) * s, z + (s > 0 ? 3 : 0)) });
      itens.filter((i) => i.z > cam.z + 1).sort((a, b) => b.z - a.z).forEach((i) => i.f());
      postes(ctx, cam);
      ctx.restore();
    },
    // primeiro plano desfocado (copa de árvore perto da câmera, como na referência)
    frente(ctx, cam, o = {}) {
      if (o.semFrente) return;
      ctx.save();
      arvore(ctx, cam, o.arvoreX === undefined ? -2.6 : o.arvoreX, cam.z + 1.6, 3.6, { desfoque: o.desfoque === undefined ? 10 : o.desfoque });
      ctx.restore();
    },
  };
})();

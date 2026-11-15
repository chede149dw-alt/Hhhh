// Cenário em perspectiva: TÚNEL DE MASMORRA (abóbada de pedra, tochas nas paredes, saída clara no fundo).
// Mundo em metros: túnel de x -1,6 a 1,6; paredes retas até 1,8 m e abóbada de raio 1,6 (topo a 3,4 m); vai até z = 26.
// A luz vem das tochas (laranja, piscando) e da saída no fundo; o resto se perde no escuro (névoa escura).
// Uso: Cenarios3D.masmorra.desenhar(ctx, cam, { t, placa: 'ANDAR 1' })
//      Cenarios3D.masmorra.tocha(ctx, cam, X, Y, Z, t, escala)  — tocha solta (na mão de alguém, por exemplo)
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const { face, caixa, cilindro, mistura } = Cena3D;
  const XL = -1.6, XR = 1.6, YP = 1.8, R = 1.6, ZF = 26, NV = 12;
  const PEDRA = '#6A5A4E', PEDRA_ESC = '#1C1714', PEDRA_QUENTE = '#B87A48', LAJE = '#5A4E44', JUNTA = '#1E1814';
  // tochas: alternando as paredes a cada 3,5 m
  const TOCHAS = []; for (let z = 2.5, i = 0; z < ZF - 2; z += 3.5, i++) TOCHAS.push({ x: i % 2 ? XR - 0.12 : XL + 0.12, y: 1.75, z, i });
  const pisca = (t, i) => 1 + 0.10 * Math.sin(t * 13 + i * 1.7) + 0.06 * Math.sin(t * 23.3 + i * 2.9) + 0.04 * Math.sin(t * 41 + i);

  // quanto de luz de tocha chega num ponto (0..1)
  function luzEm(X, Y, Z, t) {
    let l = 0;
    for (const k of TOCHAS) { const d = Math.hypot(X - k.x, Y - k.y, Z - k.z); l += (0.8 * pisca(t, k.i)) / (1 + d * d * 1.1); }
    // luz fria da saída no fundo
    const ds = ZF - Z; if (ds < 5) l += (1 - ds / 5) * 0.55;
    return Math.min(1, l);
  }
  const corPedra = (base, l) => (l < 0.6 ? mistura(PEDRA_ESC, base, l / 0.6) : mistura(base, PEDRA_QUENTE, (l - 0.6) * 1.6));

  // perfil do túnel (do chão esquerdo, subindo pela parede e pela abóbada, até o chão direito)
  const PERFIL = [[XL, 0], [XL, YP]];
  for (let k = 1; k < NV; k++) { const a = Math.PI - (k / NV) * Math.PI; PERFIL.push([R * Math.cos(a), YP + R * Math.sin(a)]); }
  PERFIL.push([XR, YP], [XR, 0]);

  function linhas(ctx, cam, segs, cor, z) {
    const lw = Math.max(0.5, cam.linha(z) * 0.45);
    if (lw <= 0.5 && z > 16) return;
    ctx.strokeStyle = cam.tom(cor, z); ctx.lineWidth = lw; ctx.beginPath();
    for (const [a, b] of segs) { const p = cam.p(...a), q = cam.p(...b); if (p.atras || q.atras) continue; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    ctx.stroke();
  }

  function tocha(ctx, cam, X, Y, Z, t, k = 1, i = 0) {
    const q = cam.p(X, Y, Z); if (q.atras) return;
    const s = q.s * k, f = pisca(t, i);
    // cabo
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = '#4A3424'; ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.beginPath(); ctx.moveTo(q.x, q.y + s * 0.05); ctx.lineTo(q.x, q.y + s * 0.42); ctx.stroke();
    ctx.fillStyle = '#3A2A20'; ctx.beginPath(); ctx.ellipse(q.x, q.y + s * 0.04, s * 0.06, s * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    // brilho (aditivo)
    ctx.globalCompositeOperation = 'lighter';
    const r = s * 1.1 * f, g = ctx.createRadialGradient(q.x, q.y - s * 0.08, 0, q.x, q.y - s * 0.08, r);
    g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(0.3, 'rgba(255,140,60,0.22)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.fillRect(q.x - r, q.y - s * 0.08 - r, r * 2, r * 2);
    // chama: duas gotas (laranja e miolo creme) balançando
    const bal = Math.sin(t * 9 + i) * s * 0.02, alt = s * (0.2 + 0.03 * Math.sin(t * 17 + i * 3));
    for (const [w, h, cor] of [[0.075, 1, 'rgba(255,128,40,0.95)'], [0.042, 0.62, 'rgba(255,236,190,0.95)']]) {
      ctx.fillStyle = cor; ctx.beginPath();
      ctx.moveTo(q.x + bal * 1.6, q.y - alt * h);
      ctx.quadraticCurveTo(q.x + s * w, q.y - alt * h * 0.35, q.x, q.y);
      ctx.quadraticCurveTo(q.x - s * w, q.y - alt * h * 0.35, q.x + bal * 1.6, q.y - alt * h);
      ctx.fill();
    }
    ctx.restore();
  }

  window.Cenarios3D.masmorra = {
    nevoa: '#17120F', distNevoa: 14, luzEm, tocha, saida: { z: ZF, y: 1.4 },
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0;
      ctx.save();
      // fundo escuro (o que a abóbada não cobre)
      ctx.fillStyle = '#0E0B09'; ctx.fillRect(-2000, -2000, 6000, 6000);
      // saída clara no fundo: o perfil do túnel cheio de luz
      const sai = PERFIL.map(([x, y]) => [x, y, ZF]);
      face(ctx, cam, sai, '#FFF2D2', { semNevoa: true, contorno: false });
      const cs = cam.p(0, 1.4, ZF);
      if (!cs.atras) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const r = cs.s * 3.2, g = ctx.createRadialGradient(cs.x, cs.y, 0, cs.x, cs.y, r);
        g.addColorStop(0, 'rgba(255,240,205,0.5)'); g.addColorStop(1, 'rgba(255,240,205,0)');
        ctx.fillStyle = g; ctx.fillRect(cs.x - r, cs.y - r, r * 2, r * 2); ctx.restore();
      }
      // faixas em profundidade, do fundo para a frente
      const zs = []; for (let z = Math.max(-1, cam.z + 0.2), d = 0.45; z < ZF; z += d, d *= 1.1) zs.push(z); zs.push(ZF);
      for (let i = zs.length - 2; i >= 0; i--) {
        const a = zs[i], b = zs[i + 1] + 0.01, zm = (a + b) / 2;
        // chão
        face(ctx, cam, [[XL, 0, a], [XR, 0, a], [XR, 0, b], [XL, 0, b]], corPedra(LAJE, luzEm(0, 0, zm, t) * 0.9), { contorno: false });
        // paredes e abóbada (segmento a segmento)
        for (let k = 0; k < PERFIL.length - 1; k++) {
          const [x0, y0] = PERFIL[k], [x1, y1] = PERFIL[k + 1];
          if (y0 === 0 && y1 === 0) continue;
          const l = luzEm((x0 + x1) / 2, (y0 + y1) / 2, zm, t), topo = Math.min(1, ((y0 + y1) / 2) / 3.4);
          face(ctx, cam, [[x0, y0, a], [x1, y1, a], [x1, y1, b], [x0, y0, b]], corPedra(PEDRA, l * (1 - 0.35 * topo)), { contorno: false });
        }
        // tijolos e lajotas perto da câmera
        if (zm < 15) {
          const segs = [];
          for (let k = 1; k < PERFIL.length - 2; k++) { const [x, y] = PERFIL[k]; segs.push([[x, y, a], [x, y, b]]); }
          for (const y of [0.45, 0.9, 1.35]) { segs.push([[XL, y, a], [XL, y, b]]); segs.push([[XR, y, a], [XR, y, b]]); }
          // juntas verticais desencontradas
          for (let z = Math.ceil(a / 0.5) * 0.5; z < b; z += 0.5) {
            for (let k = 0; k < PERFIL.length - 1; k++) {
              const [x0, y0] = PERFIL[k], [x1, y1] = PERFIL[k + 1]; if (y0 === 0 && y1 === 0) continue;
              const zz = z + ((k % 2) ? 0.25 : 0); if (zz >= b) continue;
              segs.push([[x0, y0, zz], [x1, y1, zz]]);
            }
            segs.push([[XL, 0.002, z], [XR, 0.002, z]]);
          }
          for (const x of [-0.8, 0, 0.8]) segs.push([[x, 0.002, a], [x, 0.002, b]]);
          linhas(ctx, cam, segs, JUNTA, zm);
        }
      }
      // objetos encostados nas paredes: barris e caixotes (dão escala e enchem o cenário)
      const luzObj = { pos: [0, 2, 4], amb: 0.2, forca: 0.9, alcance: 5, cor: '#FFB070', ambiente: '#3A2C48' };
      for (const [X, Z] of [[XR - 0.4, 9.2], [XR - 0.45, 10.0], [XL + 0.42, 15.2]]) if (Z > cam.z + 0.6) cilindro(ctx, cam, X, Z, 0, 0.8, 0.3, 0.34, '#7A5236', luzObj, { topo: '#8E6444' });
      for (const [x0, z0, h] of [[XL + 0.1, 11.0, 0.6], [XL + 0.15, 11.7, 0.45], [XR - 0.8, 18, 0.6]]) if (z0 > cam.z + 0.6) caixa(ctx, cam, x0, x0 + 0.6, 0, h, z0, z0 + 0.6, mistura('#6E4E34', '#17120F', Math.min(0.7, (z0 - cam.z) / 30)), { linha: cam.linha(z0) * 0.6 });
      // placa na parede esquerda (ex.: "ANDAR 1")
      if (o.placa) {
        const z0 = 3.2, z1 = 4.4, y0 = 1.05, y1 = 1.55, x = XL + 0.01;
        face(ctx, cam, [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], corPedra('#9C8466', luzEm(x, 1.3, 3.8, t)), { linha: cam.linha(z0) });
        const p00 = cam.p(x, y1, z0), p10 = cam.p(x, y1, z1), p01 = cam.p(x, y0, z0);
        if (!p00.atras && !p10.atras) {
          ctx.save();
          ctx.transform((p10.x - p00.x) / 100, (p10.y - p00.y) / 100, (p01.x - p00.x) / 40, (p01.y - p00.y) / 40, p00.x, p00.y);
          ctx.font = '900 22px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(40,30,24,0.85)'; ctx.fillText(o.placa, 50, 21);
          ctx.restore();
        }
      }
      // tochas nas paredes (por cima de tudo, com brilho) e poças de luz no chão
      for (const k of TOCHAS) {
        if (k.z < cam.z + 0.5) continue;
        caixa(ctx, cam, k.x - 0.05, k.x + 0.05, 1.45, 1.6, k.z - 0.05, k.z + 0.05, '#3A2A20', { linha: 0.6 });
        const c = cam.p(k.x * 0.7, 0, k.z);
        if (!c.atras) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const r = c.s * 1.3 * pisca(t, k.i); ctx.translate(c.x, c.y); ctx.scale(1, 0.35);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(255,150,70,0.22)'); g.addColorStop(1, 'rgba(255,150,70,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        tocha(ctx, cam, k.x, k.y, k.z, t, 1, k.i);
      }
      ctx.restore();
    },
  };
})();

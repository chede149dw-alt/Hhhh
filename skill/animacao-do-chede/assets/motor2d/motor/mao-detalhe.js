// Mão detalhada e articulada para closes (referência 5: a mão grande na tela, dedos fechando um a um).
// Maos.desenhar(ctx, x, y, escala, o)
//   (x, y): centro do punho (pulso) em px; escala: px por unidade (palma ≈ 1 unidade de largura)
//   o.curl: [polegar, indicador, médio, anelar, mínimo] de 0 (aberto) a 1 (fechado)
//   o.abre: 0..1 afasta os dedos; o.ang: giro da mão (rad, 0 = dedos para cima); o.espelhar: mão esquerda
//   o.pele: tom do guia (padrão pele3), o.manga / o.faixa: cores do punho (padrão Marinho / Turquesa)
// Modo suave do guia: sem contorno preto, degradê de luz da esquerda, vincos discretos.
(function () {
  const T = (n) => Estilo.tom(n);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function capsulaEntre(ctx, a, b, w) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 0.0001;
    const nx = -dy / L * w / 2, ny = dx / L * w / 2;
    ctx.beginPath();
    ctx.moveTo(a[0] + nx, a[1] + ny); ctx.lineTo(b[0] + nx, b[1] + ny);
    ctx.arc(b[0], b[1], w / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    ctx.lineTo(a[0] - nx, a[1] - ny);
    ctx.arc(a[0], a[1], w / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
    ctx.closePath();
  }

  // dedo: cadeia de 3 falanges; dobrar encurta (escorço) e, passando de 90°, a falange volta por cima da palma
  function dedo(ctx, base, dir, comp, larg, curl, cores, pontas) {
    const lens = [0.46, 0.3, 0.24].map((k) => k * comp);
    const dobra = [80, 100, 70].map((g) => (g * Math.PI / 180) * curl);
    let th = 0, p = base;
    const juntas = [p];
    for (let i = 0; i < 3; i++) {
      th += dobra[i];
      const L = lens[i] * Math.cos(th);
      p = [p[0] + dir[0] * L, p[1] + dir[1] * L];
      juntas.push(p);
    }
    // falanges: as que estão viradas (cos < 0) ficam mais escuras (vemos o dorso dobrado)
    th = 0;
    for (let i = 0; i < 3; i++) {
      th += dobra[i];
      const virada = Math.cos(th) < 0;
      const w = larg * (1 - i * 0.07);
      const g = ctx.createLinearGradient(juntas[i][0] - dir[1] * w, juntas[i][1] + dir[0] * w, juntas[i][0] + dir[1] * w, juntas[i][1] - dir[0] * w);
      g.addColorStop(0, virada ? cores.base : cores.luz); g.addColorStop(0.6, virada ? cores.sombra : cores.base); g.addColorStop(1, cores.sombra);
      ctx.fillStyle = g; capsulaEntre(ctx, juntas[i], juntas[i + 1], w); ctx.fill();
      ctx.strokeStyle = cores.borda; ctx.lineWidth = w * 0.06; ctx.stroke();
      // vinco da junta
      if (i < 2 && !virada) {
        const j = juntas[i + 1];
        ctx.strokeStyle = cores.vinco; ctx.lineWidth = w * 0.05;
        ctx.beginPath(); ctx.moveTo(j[0] - dir[1] * w * 0.3, j[1] + dir[0] * w * 0.3); ctx.lineTo(j[0] + dir[1] * w * 0.3, j[1] - dir[0] * w * 0.3); ctx.stroke();
      }
    }
    pontas.push(juntas[3]);
    return juntas;
  }

  window.Maos = {
    desenhar(ctx, x, y, escala, o = {}) {
      const pele = T(o.pele || 'pele3');
      const cores = {
        base: pele.base, sombra: pele.sombra, luz: pele.luz,
        borda: Estilo.multiply(pele.sombra, '#9A8EAA'), vinco: 'rgba(110,60,45,0.45)',
      };
      const curl = o.curl || [0, 0, 0, 0, 0], abre = o.abre === undefined ? 0.5 : o.abre;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(o.ang || 0); if (o.espelhar) ctx.scale(-1, 1); ctx.scale(escala, escala);
      // punho do moletom
      const manga = T(o.manga || 'marinho');
      const gm = ctx.createLinearGradient(-0.75, 0, 0.75, 0); gm.addColorStop(0, manga.luz); gm.addColorStop(0.55, manga.base); gm.addColorStop(1, manga.sombra);
      ctx.fillStyle = gm; ctx.beginPath(); ctx.roundRect(-0.72, 0.15, 1.44, 2.2, 0.2); ctx.fill();
      ctx.fillStyle = Estilo.base[o.faixa || 'turquesa']; ctx.fillRect(0.38, 0.15, 0.12, 2.2);
      ctx.fillStyle = manga.sombra; ctx.beginPath(); ctx.roundRect(-0.7, 0.1, 1.4, 0.22, 0.1); ctx.fill();
      // pulso e palma
      const gp = ctx.createLinearGradient(-0.6, 0, 0.6, 0); gp.addColorStop(0, cores.luz); gp.addColorStop(0.5, cores.base); gp.addColorStop(1, cores.sombra);
      ctx.fillStyle = gp;
      ctx.beginPath();
      ctx.moveTo(-0.38, 0.2); ctx.lineTo(0.38, 0.2);
      ctx.quadraticCurveTo(0.58, -0.3, 0.55, -0.95);
      ctx.quadraticCurveTo(0.52, -1.18, 0.3, -1.2);
      ctx.lineTo(-0.32, -1.2);
      ctx.quadraticCurveTo(-0.56, -1.18, -0.58, -0.92);
      ctx.quadraticCurveTo(-0.6, -0.3, -0.38, 0.2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = cores.borda; ctx.lineWidth = 0.025; ctx.stroke();
      // vincos da palma
      ctx.strokeStyle = cores.vinco; ctx.lineWidth = 0.022; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-0.45, -0.85); ctx.quadraticCurveTo(0.0, -0.72, 0.5, -0.88);
      ctx.moveTo(-0.5, -0.62); ctx.quadraticCurveTo(-0.05, -0.55, 0.28, -0.42);
      ctx.moveTo(-0.22, -0.08); ctx.quadraticCurveTo(-0.32, -0.5, -0.05, -0.9);
      ctx.stroke();
      // dedos (do mínimo ao indicador; os mais longe primeiro)
      const pontas = [];
      const DEDOS = [[0.42, 0.62, 0.17, 4, 0.18], [0.15, 0.82, 0.19, 3, 0.06], [-0.13, 0.9, 0.2, 2, -0.04], [-0.4, 0.8, 0.19, 1, -0.15]];
      for (const [bx, comp, w, idx, spread] of DEDOS) {
        const a = spread * (0.4 + abre);
        dedo(ctx, [bx, -1.12], [Math.sin(a), -Math.cos(a)], comp, w, clamp(curl[idx], 0, 1), cores, pontas);
      }
      // polegar: sai do lado e cruza a palma quando fecha
      const c0 = clamp(curl[0], 0, 1);
      const angP = (-1.05 + c0 * 0.95) - abre * 0.25;
      const dirP = [Math.sin(angP), -Math.cos(angP)];
      dedo(ctx, [-0.5, -0.35], dirP, 0.7 * (1 - c0 * 0.25), 0.22, c0 * 0.6, cores, pontas);
      ctx.restore();
      // devolve as pontas dos dedos em px (para ancorar efeitos)
      const m = new DOMMatrix().translate(x, y).rotate((o.ang || 0) * 180 / Math.PI).scale(o.espelhar ? -escala : escala, escala);
      return { palma: m.transformPoint(new DOMPoint(0, -0.7)), pontas: pontas.map(([px, py]) => m.transformPoint(new DOMPoint(px, py))) };
    },
  };
})();

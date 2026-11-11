// Cenário em perspectiva: PÁTIO DA ESCOLA (fim de tarde): piso de pedra, prédio de tijolo ao fundo,
// janelas, faixa, árvores, bancos e um BUEIRO no chão (x = 0,6, z = 3,2).
// Mundo em metros: pátio de x -9 a 9; prédio em z = 16. Uso: Cenarios3D.patio.desenhar(ctx, cam, { t })
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const T = (n) => Estilo.tom(n);
  const { face, caixa, arvore } = Cena3D;
  const ZP = 16;
  const BUEIRO = { x: 0.6, z: 3.2, w: 0.7, d: 0.45 };

  window.Cenarios3D.patio = {
    nevoa: '#F3DCC0',
    bueiro: BUEIRO,
    desenhar(ctx, cam, o = {}) {
      ctx.save();
      // céu e sol baixo à esquerda
      const W = ctx.canvas.width;
      const g = ctx.createLinearGradient(0, 0, 0, cam.cy + 40);
      g.addColorStop(0, '#9FCBE6'); g.addColorStop(0.6, '#F3DCC2'); g.addColorStop(1, '#F7CFA2');
      ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, cam.cy + 260);
      const sx = cam.cx - 420, sy = cam.cy - 700;
      const h = ctx.createRadialGradient(sx, sy, 0, sx, sy, 380); h.addColorStop(0, 'rgba(255,236,190,0.9)'); h.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = h; ctx.fillRect(sx - 400, sy - 400, 800, 800);
      // árvores atrás do prédio
      for (const x of [-11, -6, 6.5, 11]) arvore(ctx, cam, x, ZP + 3, 7.5);
      // chão de pedra em faixas (névoa por distância) + juntas
      for (let z = cam.z + 0.2, d = 0.7; z < ZP; z += d, d *= 1.15) face(ctx, cam, [[-14, 0, z], [14, 0, z], [14, 0, Math.min(ZP, z + d + 0.02)], [-14, 0, Math.min(ZP, z + d + 0.02)]], T('calcada').base, { contorno: false });
      ctx.save(); ctx.strokeStyle = 'rgba(120,100,120,0.35)';
      for (let z = Math.ceil(cam.z), i = 0; z < ZP; z += 0.8, i++) { const a = cam.p(-14, 0, z), b = cam.p(14, 0, z); ctx.lineWidth = Math.max(0.6, a.s * 0.008); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      for (let x = -14; x <= 14; x += 0.8) { const a = cam.p(x, 0, Math.max(cam.z + 0.3, 0)), b = cam.p(x, 0, ZP); ctx.lineWidth = Math.max(0.6, a.s * 0.008); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.restore();
      // círculo decorativo no piso (desenho de pedra mais escura)
      const c0 = cam.p(-2.2, 0.002, 8.5), c1 = cam.p(-2.2 + 2.2, 0.002, 8.5), c2 = cam.p(-2.2, 0.002, 8.5 + 2.2);
      ctx.fillStyle = cam.tom(T('calcada').sombra, 8.5); ctx.beginPath(); ctx.ellipse(c0.x, c0.y, Math.abs(c1.x - c0.x), Math.abs(c2.y - c0.y), 0, 0, Math.PI * 2); ctx.fill();
      // prédio de tijolo: fachada, faixas, janelas acesas e porta
      const tijolo = '#B9705A';
      face(ctx, cam, [[-12, 0, ZP], [12, 0, ZP], [12, 7.5, ZP], [-12, 7.5, ZP]], tijolo, { contorno: false });
      ctx.save(); ctx.strokeStyle = cam.tom('#8C4F42', ZP);
      for (let y = 0.25; y < 7.5; y += 0.25) { const a = cam.p(-12, y, ZP), b = cam.p(12, y, ZP); ctx.globalAlpha = 0.25; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.restore();
      face(ctx, cam, [[-12, 7.5, ZP], [12, 7.5, ZP], [12, 8.1, ZP - 0.4], [-12, 8.1, ZP - 0.4]], T('telhado').base);
      for (let x = -10; x < 10; x += 2.6) for (const y of [1.3, 4.3]) {
        if (Math.abs(x + 0.4) < 1.2 && y < 2) continue;
        face(ctx, cam, [[x, y, ZP - 0.01], [x + 1.3, y, ZP - 0.01], [x + 1.3, y + 1.8, ZP - 0.01], [x, y + 1.8, ZP - 0.01]], (x * 7 + y) % 3 < 1 ? '#FFE6B0' : T('vidro').base);
        face(ctx, cam, [[x - 0.08, y - 0.12, ZP - 0.02], [x + 1.38, y - 0.12, ZP - 0.02], [x + 1.38, y, ZP - 0.02], [x - 0.08, y, ZP - 0.02]], T('linho').base, { contorno: false });
      }
      face(ctx, cam, [[-1.2, 0, ZP - 0.01], [0.4, 0, ZP - 0.01], [0.4, 2.6, ZP - 0.01], [-1.2, 2.6, ZP - 0.01]], T('madeira').base);
      // faixas da escola penduradas
      for (const [x, cor] of [[-6.5, 'marinho'], [5.2, 'turquesa']]) {
        face(ctx, cam, [[x, 3.6, ZP - 0.03], [x + 1.0, 3.6, ZP - 0.03], [x + 1.0, 6.8, ZP - 0.03], [x, 6.8, ZP - 0.03]], T(cor).base);
        face(ctx, cam, [[x + 0.2, 5.6, ZP - 0.04], [x + 0.8, 5.6, ZP - 0.04], [x + 0.5, 5.0, ZP - 0.04]], T('mostarda').base, { contorno: false });
      }
      // relógio no alto da fachada
      const rc = cam.p(-0.4, 6.4, ZP - 0.05); ctx.fillStyle = T('linho').base; ctx.beginPath(); ctx.arc(rc.x, rc.y, rc.s * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3A3045'; ctx.lineWidth = Math.max(1, rc.s * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rc.x, rc.y); ctx.lineTo(rc.x, rc.y - rc.s * 0.3); ctx.moveTo(rc.x, rc.y); ctx.lineTo(rc.x + rc.s * 0.22, rc.y + rc.s * 0.1); ctx.stroke();
      // bancos, canteiros e árvores do pátio (do fundo para a frente)
      const itens = [];
      for (const [x, z] of [[-6.5, 11], [6.2, 9], [-7.2, 5.5], [7.4, 4]]) itens.push({ z, f: () => arvore(ctx, cam, x, z, 5.4) });
      for (const [x, z] of [[-4.2, 9.5], [4.0, 7.2], [-5.0, 4.0]]) itens.push({ z, f: () => { caixa(ctx, cam, x - 0.9, x + 0.9, 0.42, 0.5, z, z + 0.4, 'madeira'); for (const dx of [-0.8, 0.7]) caixa(ctx, cam, x + dx, x + dx + 0.1, 0, 0.42, z + 0.05, z + 0.35, 'grafite'); } });
      itens.push({ z: 12, f: () => caixa(ctx, cam, 2.2, 4.4, 0, 0.5, 12, 13.2, 'telhado') });
      itens.filter((i) => i.z > cam.z + 0.5).sort((a, b) => b.z - a.z).forEach((i) => i.f());
      // bueiro (grade escura no chão)
      const B = BUEIRO;
      face(ctx, cam, [[B.x - B.w / 2 - 0.05, 0.003, B.z - 0.05], [B.x + B.w / 2 + 0.05, 0.003, B.z - 0.05], [B.x + B.w / 2 + 0.05, 0.003, B.z + B.d + 0.05], [B.x - B.w / 2 - 0.05, 0.003, B.z + B.d + 0.05]], T('pedra').base, { linha: 1.5 });
      face(ctx, cam, [[B.x - B.w / 2, 0.004, B.z], [B.x + B.w / 2, 0.004, B.z], [B.x + B.w / 2, 0.004, B.z + B.d], [B.x - B.w / 2, 0.004, B.z + B.d]], '#241C22', { contorno: false });
      ctx.save(); ctx.strokeStyle = '#6A6573';
      for (let x = B.x - B.w / 2 + 0.08; x < B.x + B.w / 2; x += 0.1) { const a = cam.p(x, 0.006, B.z), b = cam.p(x, 0.006, B.z + B.d); ctx.lineWidth = Math.max(1, a.s * 0.025); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.restore();
      ctx.restore();
    },
    frente(ctx, cam, o = {}) {
      arvore(ctx, cam, o.arvoreX === undefined ? -2.4 : o.arvoreX, cam.z + 1.5, 3.4, { desfoque: 10 });
    },
  };
})();

// Cenário em perspectiva: QUARTO DO LUCAS, de manhã, em contraluz (referência 2: objetos com volume,
// quarto na penumbra, janela estourada de luz, feixes com poeira, sombra de contato).
// Mundo em metros: quarto de x -2,3 a 2,3; chão y = 0, teto y = 2,7; parede do fundo em z = 5.
// Janela na parede esquerda (z 1,2–3,0); porta no fundo à direita; cama encostada na parede direita.
// Uso: Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: 0..1, t, despertadorTocando })
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const T = (n) => Estilo.tom(n);
  const { face, faceLuz, caixaLuz, caminho, sombraContato, poeira } = Cena3D;
  const XL = -2.3, XR = 2.3, YT = 2.7, ZF = 5;
  const JAN = { z0: 1.2, z1: 3.0, y0: 1.0, y1: 2.3 };
  const SOL = [0.78, -0.52, 0.34]; // direção da luz do sol entrando pela janela
  const LUZ = { pos: [XL - 0.4, 1.9, 2.1], cor: '#FFD08A', forca: 2.4, alcance: 2.2, ambiente: '#2E2650', amb: 0.06 };
  const noChao = ([X, Y, Z]) => { const k = Y / -SOL[1]; return [X + SOL[0] * k, 0.003, Z + SOL[2] * k]; };

  function linhas3d(ctx, cam, segs, cor, larg) {
    ctx.save(); ctx.strokeStyle = cor; ctx.lineCap = 'round';
    for (const [a, b] of segs) { const p = cam.p(...a), q = cam.p(...b); ctx.lineWidth = Math.max(0.6, larg * (p.s + q.s) / 2); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    ctx.restore();
  }

  // travesseiro fofo: retângulo com bordas estufadas, luz pela janela
  function travesseiro(ctx, cam, x0, x1, y, z0, z1, h) {
    const c = [[x0, y + h * 0.5, z0], [x1, y + h * 0.5, z0], [x1, y + h * 0.5, z1], [x0, y + h * 0.5, z1]].map((P) => cam.p(...P));
    const top = cam.p((x0 + x1) / 2, y + h, (z0 + z1) / 2);
    const p = new Path2D();
    p.moveTo((c[0].x + c[1].x) / 2, (c[0].y + c[1].y) / 2 + 6);
    for (let i = 0; i < 4; i++) {
      const a = c[(i + 1) % 4], b = c[(i + 2) % 4];
      p.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2 + (a.x + b.x - 2 * top.x) * 0.04, (a.y + b.y) / 2 + (a.y + b.y - 2 * top.y) * 0.04);
    }
    p.closePath();
    const g = ctx.createRadialGradient(top.x - 40, top.y - 20, 4, top.x, top.y, Math.abs(c[1].x - c[0].x) * 0.9 + 40);
    g.addColorStop(0, '#FBF4E6'); g.addColorStop(0.6, '#E6DCD2'); g.addColorStop(1, '#9C90A8');
    ctx.fillStyle = g; ctx.fill(p);
    ctx.lineWidth = Math.max(1.5, top.s * 0.008); ctx.strokeStyle = Estilo.base.tinta; ctx.stroke(p);
  }

  window.Cenarios3D.quarto = {
    nevoa: '#3E3550',
    luz: LUZ,
    pontos: { cama: { x: 1.55, z: 1.8 }, criado: { x: 1.9, z: 3.35 }, porta: { x: 1.35, z: 4.85 }, centro: { x: 0, z: 2.4 }, vaso: [XL + 0.14, JAN.y0 + 0.3, 2.57] },
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0;
      cam.distNevoa = 60; // dentro de casa quase não há névoa
      ctx.save();
      const parede = T('parede').base, madeira = T('madeira').base, madeiraC = T('madeiraClara').base;
      const z0 = cam.z + 0.2;
      // teto, paredes (parte de cima lisa, lambri de madeira embaixo) e chão — todos com luz por face
      faceLuz(ctx, cam, [[XL, YT, z0], [XR, YT, z0], [XR, YT, ZF], [XL, YT, ZF]], Estilo.multiply(parede, '#D8D0E4'), LUZ, { contorno: false });
      for (const [y0, y1, cor] of [[1.05, YT, parede], [0, 1.05, madeira]]) {
        faceLuz(ctx, cam, [[XL, y0, z0], [XL, y0, ZF], [XL, y1, ZF], [XL, y1, z0]], cor, LUZ, { contorno: false });
        faceLuz(ctx, cam, [[XR, y0, z0], [XR, y0, ZF], [XR, y1, ZF], [XR, y1, z0]], cor, LUZ, { contorno: false });
        faceLuz(ctx, cam, [[XL, y0, ZF], [XR, y0, ZF], [XR, y1, ZF], [XL, y1, ZF]], cor, LUZ, { contorno: false });
      }
      // tábuas do lambri
      const segL = [];
      for (let z = 0; z < ZF; z += 0.18) segL.push([[XR - 0.001, 0.08, z], [XR - 0.001, 1.0, z]], [[XL + 0.001, 0.08, z], [XL + 0.001, 1.0, z]]);
      for (let x = XL; x < XR; x += 0.18) segL.push([[x, 0.08, ZF - 0.001], [x, 1.0, ZF - 0.001]]);
      linhas3d(ctx, cam, segL, 'rgba(60,35,40,0.35)', 0.004);
      // moldura do lambri
      face(ctx, cam, [[XR - 0.002, 1.0, z0], [XR - 0.002, 1.0, ZF], [XR - 0.002, 1.07, ZF], [XR - 0.002, 1.07, z0]], madeiraC, { linha: 1 });
      face(ctx, cam, [[XL, 1.0, ZF - 0.002], [XR, 1.0, ZF - 0.002], [XR, 1.07, ZF - 0.002], [XL, 1.07, ZF - 0.002]], madeiraC, { linha: 1 });
      // chão de tábuas (em faixas, para a luz variar)
      for (let z = z0, d = 0.5; z < ZF; z += d, d *= 1.15) faceLuz(ctx, cam, [[XL, 0, z], [XR, 0, z], [XR, 0, Math.min(ZF, z + d + 0.01)], [XL, 0, Math.min(ZF, z + d + 0.01)]], Estilo.multiply(madeiraC, '#B8A8B8'), LUZ, { contorno: false });
      const segC = [];
      for (let x = XL; x <= XR; x += 0.3) segC.push([[x, 0.001, Math.max(z0, 0)], [x, 0.001, ZF]]);
      for (let z = 0.3, i = 0; z < ZF; z += 0.85, i++) for (let x = XL + (i % 2) * 0.3; x < XR; x += 0.6) segC.push([[x, 0.001, z], [x + 0.3, 0.001, z]]);
      linhas3d(ctx, cam, segC, 'rgba(60,35,45,0.3)', 0.004);
      // sombra de contato nos cantos parede/chão
      for (const [a, b] of [[[XL, ZF], [XR, ZF]], [[XR, z0], [XR, ZF]], [[XL, z0], [XL, ZF]]]) {
        Cinema.desfocado(ctx, 18, (g) => { g.strokeStyle = 'rgba(25,15,40,0.5)'; const p = cam.p(a[0], 0, a[1]), q = cam.p(b[0], 0, b[1]); g.lineWidth = 30; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); });
      }

      // janela estourada de luz (céu bem claro), treliça e moldura de madeira
      const J = [[XL + 0.003, JAN.y0, JAN.z0], [XL + 0.003, JAN.y0, JAN.z1], [XL + 0.003, JAN.y1, JAN.z1], [XL + 0.003, JAN.y1, JAN.z0]];
      const pj = caminho(cam, J);
      ctx.save(); ctx.clip(pj);
      const pa = cam.p(XL, JAN.y1, 2.1), pb = cam.p(XL, JAN.y0, 2.1);
      const g = ctx.createLinearGradient(0, pa.y, 0, pb.y); g.addColorStop(0, '#E4F0F2'); g.addColorStop(0.55, '#FFF3D8'); g.addColorStop(1, '#FFE0A6');
      ctx.fillStyle = g; ctx.fill(pj);
      // morros e árvore lá fora, quase apagados pela luz
      ctx.fillStyle = 'rgba(150,170,130,0.35)';
      const m0 = cam.p(XL, 1.25, JAN.z0), m1 = cam.p(XL, 1.45, 2.2), m2 = cam.p(XL, 1.2, JAN.z1);
      ctx.beginPath(); ctx.moveTo(m0.x, pb.y); ctx.lineTo(m0.x, m0.y); ctx.quadraticCurveTo(m1.x, m1.y, m2.x, m2.y); ctx.lineTo(m2.x, pb.y); ctx.fill();
      ctx.restore();
      const segJ = [];
      for (let z = JAN.z0; z <= JAN.z1 + 0.01; z += 0.3) segJ.push([[XL + 0.004, JAN.y0, z], [XL + 0.004, JAN.y1, z]]);
      for (let y = JAN.y0; y <= JAN.y1 + 0.01; y += 0.26) segJ.push([[XL + 0.004, y, JAN.z0], [XL + 0.004, y, JAN.z1]]);
      linhas3d(ctx, cam, segJ, 'rgba(70,50,60,0.75)', 0.012);
      caixaLuz(ctx, cam, XL, XL + 0.14, JAN.y0 - 0.1, JAN.y0, JAN.z0 - 0.1, JAN.z1 + 0.1, madeiraC, LUZ, { linha: 2 });
      face(ctx, cam, [[XL + 0.005, JAN.y0, JAN.z0], [XL + 0.005, JAN.y0, JAN.z1], [XL + 0.005, JAN.y1, JAN.z1], [XL + 0.005, JAN.y1, JAN.z0]], 'rgba(0,0,0,0)', { linha: 3, semNevoa: true });
      // halo da janela
      const hc = cam.p(XL, 1.7, 2.1);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const hg = ctx.createRadialGradient(hc.x, hc.y, 0, hc.x, hc.y, hc.s * 1.6);
      hg.addColorStop(0, 'rgba(255,226,170,0.55)'); hg.addColorStop(1, 'rgba(255,226,170,0)');
      ctx.fillStyle = hg; ctx.fillRect(hc.x - hc.s * 2, hc.y - hc.s * 2, hc.s * 4, hc.s * 4);
      ctx.restore();
      // vaso de planta no parapeito da janela (o.vasoTerra: quanto de terra ainda está no vaso, 0..1)
      if (o.vaso !== false) {
        const vx0 = XL + 0.02, vx1 = XL + 0.26, vz0 = 2.45, vz1 = 2.69, vy = JAN.y0;
        caixaLuz(ctx, cam, vx0, vx1, vy, vy + 0.22, vz0, vz1, T('coral').base, LUZ, { linha: 1.5 });
        const nivel = vy + 0.2 * (o.vasoTerra === undefined ? 1 : o.vasoTerra);
        face(ctx, cam, [[vx0 + 0.02, nivel, vz0 + 0.02], [vx1 - 0.02, nivel, vz0 + 0.02], [vx1 - 0.02, nivel, vz1 - 0.02], [vx0 + 0.02, nivel, vz1 - 0.02]], '#5A3A22', { contorno: false });
        for (const [a, h2] of [[-0.6, 0.32], [0, 0.4], [0.6, 0.3], [1.2, 0.26]]) {
          const b = cam.p((vx0 + vx1) / 2, vy + 0.22, (vz0 + vz1) / 2), tp = cam.p((vx0 + vx1) / 2 + Math.sin(a) * 0.1, vy + 0.22 + h2, (vz0 + vz1) / 2 + Math.cos(a) * 0.05);
          ctx.fillStyle = Cena3D.corPorBrilho('#5E9E5A', 0.55, LUZ); ctx.beginPath();
          ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(tp.x + (tp.x - b.x) * 0.6 + 12, (b.y + tp.y) / 2, tp.x, tp.y); ctx.quadraticCurveTo(tp.x - 14, (b.y + tp.y) / 2, b.x, b.y); ctx.fill();
        }
      }
      // cortinas mostarda (com luz por face e dobras)
      for (const [za, zb] of [[0.7, 1.25], [2.95, 3.5]]) {
        faceLuz(ctx, cam, [[XL + 0.07, 0.55, za], [XL + 0.07, 0.55, zb], [XL + 0.07, 2.5, zb], [XL + 0.07, 2.5, za]], T('mostarda').base, LUZ, { linha: 2 });
        const segD = []; for (const k of [0.25, 0.5, 0.75]) segD.push([[XL + 0.072, 2.45, za + (zb - za) * k], [XL + 0.072, 0.62, za + (zb - za) * k]]);
        linhas3d(ctx, cam, segD, T('mostarda').sombra, 0.01);
      }
      linhas3d(ctx, cam, [[[XL + 0.1, 2.55, 0.6], [XL + 0.1, 2.55, 3.6]]], '#3A3045', 0.025);

      // pôster e prateleira com livros (parede do fundo)
      faceLuz(ctx, cam, [[-1.5, 1.35, ZF - 0.01], [-0.55, 1.35, ZF - 0.01], [-0.55, 2.35, ZF - 0.01], [-1.5, 2.35, ZF - 0.01]], T('linho').base, LUZ);
      faceLuz(ctx, cam, [[-1.42, 1.43, ZF - 0.012], [-0.63, 1.43, ZF - 0.012], [-0.63, 2.27, ZF - 0.012], [-1.42, 2.27, ZF - 0.012]], T('marinho').base, LUZ, { linha: 1 });
      const pc = cam.p(-1.02, 1.98, ZF); ctx.fillStyle = Cena3D.corPorBrilho(T('turquesa').base, 0.45, LUZ); ctx.beginPath(); ctx.arc(pc.x, pc.y, pc.s * 0.16, 0, Math.PI * 2); ctx.fill();
      face(ctx, cam, [[-1.32, 1.52, ZF - 0.013], [-0.72, 1.52, ZF - 0.013], [-1.02, 1.86, ZF - 0.013]], Cena3D.corPorBrilho(T('mostarda').base, 0.45, LUZ), { linha: 1 });
      // prateleira com livros (parede do fundo); com o.tremor os livros chacoalham e caem (o.livrosCaindo 0..1)
      const tr = o.tremor || 0, tt = o.t || 0;
      caixaLuz(ctx, cam, -2.2, -0.2, 1.05, 1.1, ZF - 0.3, ZF, madeira, LUZ, { linha: 1.5 });
      let bx = -2.1;
      [[0.09, 0.32, 'brasa'], [0.07, 0.27, 'denim'], [0.1, 0.34, 'turquesa'], [0.08, 0.25, 'lilas'], [0.09, 0.3, 'mostarda'], [0.08, 0.28, 'coral']].forEach(([w, h, c], i) => {
        const cai = Math.max(0, Math.min(1, ((o.livrosCaindo || 0) - i * 0.08) / 0.5));
        const jx = Math.sin(tt * 40 + i) * 0.012 * tr, y0 = 1.1 - cai * cai * 1.1 + (cai > 0.95 ? 0.0 : 0);
        if (cai < 1) caixaLuz(ctx, cam, bx + jx, bx + w + jx, y0, y0 + h * (1 - cai * 0.6), ZF - 0.25 + cai * 0.4, ZF - 0.05 + cai * 0.4, c, LUZ, { linha: 1 });
        else caixaLuz(ctx, cam, bx - 0.1, bx + h - 0.1, 0, w * 0.8, ZF - 0.6 + i * 0.05, ZF - 0.35 + i * 0.05, c, LUZ, { linha: 1 });
        bx += w + 0.015;
      });
      // porta no fundo
      const ab = o.portaAberta || 0;
      faceLuz(ctx, cam, [[0.85, 0, ZF - 0.005], [1.85, 0, ZF - 0.005], [1.85, 2.15, ZF - 0.005], [0.85, 2.15, ZF - 0.005]], madeiraC, LUZ, { linha: 2 });
      face(ctx, cam, [[0.92, 0, ZF - 0.006], [1.78, 0, ZF - 0.006], [1.78, 2.08, ZF - 0.006], [0.92, 2.08, ZF - 0.006]], '#2A2232', { contorno: false });
      const ang = ab * 1.35, hx = 1.78, w = 0.86, fx = hx - Math.cos(ang) * w, fz = ZF - 0.006 - Math.sin(ang) * w;
      faceLuz(ctx, cam, [[hx, 0, ZF - 0.006], [fx, 0, fz], [fx, 2.08, fz], [hx, 2.08, ZF - 0.006]], madeira, LUZ, { linha: 2 });
      const mc = cam.p(fx + (hx - fx) * 0.12, 1.0, fz + (ZF - fz) * 0.12); ctx.fillStyle = T('mostarda').base; ctx.beginPath(); ctx.arc(mc.x, mc.y, Math.max(2, mc.s * 0.03), 0, Math.PI * 2); ctx.fill();
      // luz que vem do corredor pela porta aberta
      if (ab > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,236,200,${0.25 * ab})`; ctx.fill(caminho(cam, [[0.92, 0.003, ZF], [1.78, 0.003, ZF], [1.9, 0.003, ZF - 1.2], [0.7, 0.003, ZF - 1.2]])); ctx.restore(); }

      // tapete com borda
      faceLuz(ctx, cam, [[-1.3, 0.004, 1.4], [0.9, 0.004, 1.4], [0.9, 0.004, 3.3], [-1.3, 0.004, 3.3]], T('lilas').base, LUZ, { linha: 1.5 });
      faceLuz(ctx, cam, [[-1.12, 0.005, 1.58], [0.72, 0.005, 1.58], [0.72, 0.005, 3.12], [-1.12, 0.005, 3.12]], T('lilas').luz, LUZ, { contorno: false });

      // mancha de sol no chão (borda suave) e feixes de luz com poeira
      const piso = J.map(noChao);
      Cinema.desfocado(ctx, 10, (g2) => { g2.fillStyle = 'rgba(255,214,150,0.75)'; g2.fill(caminho(cam, piso)); }, 'screen');
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const [i, j, a] of [[2, 3, 0.2], [3, 0, 0.14], [1, 2, 0.12]]) {
        const p1 = cam.p(...J[i]), p2 = cam.p(...J[j]), p3 = cam.p(...piso[j]), p4 = cam.p(...piso[i]);
        const gf = ctx.createLinearGradient((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p3.x + p4.x) / 2, (p3.y + p4.y) / 2);
        gf.addColorStop(0, `rgba(255,232,180,${a})`); gf.addColorStop(1, 'rgba(255,232,180,0.02)');
        ctx.fillStyle = gf; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      poeira(ctx, cam, [[XL + 0.2, 0.2, 1.2], [0.6, 2.2, 3.4]], 70, t, { alpha: 0.75 });

      // criado-mudo, livros e despertador (do fundo para a frente)
      sombraContato(ctx, cam, 1.55, XR, 3.15, 3.65);
      caixaLuz(ctx, cam, 1.55, XR, 0, 0.6, 3.15, 3.65, madeira, LUZ, { linha: 2 });
      caixaLuz(ctx, cam, 1.5, XR, 0.6, 0.66, 3.1, 3.7, madeiraC, LUZ, { linha: 1.5 });
      linhas3d(ctx, cam, [[[1.55, 0.3, 3.149], [XR, 0.3, 3.149]]], 'rgba(40,25,30,0.6)', 0.008);
      caixaLuz(ctx, cam, 2.0, 2.25, 0.66, 0.74, 3.2, 3.55, 'brasa', LUZ, { linha: 1 });
      caixaLuz(ctx, cam, 2.02, 2.24, 0.74, 0.8, 3.22, 3.53, 'denim', LUZ, { linha: 1 });
      const dp = cam.p(1.8, 0.66, 3.38);
      ctx.save();
      Cena.objeto(ctx, 'despertador', dp.x, dp.y, dp.s * 0.16, { tocando: o.despertadorTocando, t, semSombra: true, contornoPx: 2.5 });
      ctx.restore();
      // cama: cabeceira, estrado, colchão, lençol dobrado, cobertor xadrez e travesseiro
      sombraContato(ctx, cam, 1.0, XR, 0.8, 3.08, 0.55);
      caixaLuz(ctx, cam, 1.0, XR, 0, 1.15, 3.0, 3.1, madeira, LUZ, { linha: 2 });
      caixaLuz(ctx, cam, 1.0, XR, 0.05, 0.34, 0.8, 3.0, madeira, LUZ, { linha: 2 });
      caixaLuz(ctx, cam, 1.04, XR - 0.04, 0.34, 0.56, 0.84, 2.96, '#EEE6DA', LUZ, { linha: 1.5 });
      travesseiro(ctx, cam, 1.18, XR - 0.18, 0.56, 2.35, 2.92, 0.16);
      // cobertor: caixa um pouco maior que o colchão até perto do travesseiro + xadrez projetado
      const cb = { x0: 0.98, x1: XR - 0.02, y0: 0.3, y1: 0.62, z0: 0.78, z1: 2.25 };
      caixaLuz(ctx, cam, cb.x0, cb.x1, cb.y0, cb.y1, cb.z0, cb.z1, T('denim').base, LUZ, { linha: 2 });
      const topo = caminho(cam, [[cb.x0, cb.y1, cb.z0], [cb.x1, cb.y1, cb.z0], [cb.x1, cb.y1, cb.z1], [cb.x0, cb.y1, cb.z1]]);
      const lado = caminho(cam, [[cb.x0, cb.y0, cb.z0], [cb.x0, cb.y0, cb.z1], [cb.x0, cb.y1, cb.z1], [cb.x0, cb.y1, cb.z0]]);
      const frente = caminho(cam, [[cb.x0, cb.y0, cb.z0], [cb.x1, cb.y0, cb.z0], [cb.x1, cb.y1, cb.z0], [cb.x0, cb.y1, cb.z0]]);
      const xadrez = [];
      for (let x = cb.x0 + 0.12; x < cb.x1; x += 0.24) xadrez.push([[x, cb.y1 + 0.001, cb.z0], [x, cb.y1 + 0.001, cb.z1]], [[x, cb.y0, cb.z0 - 0.001], [x, cb.y1, cb.z0 - 0.001]]);
      for (let z = cb.z0 + 0.12; z < cb.z1; z += 0.24) xadrez.push([[cb.x0, cb.y1 + 0.001, z], [cb.x1, cb.y1 + 0.001, z]], [[cb.x0 - 0.001, cb.y0, z], [cb.x0 - 0.001, cb.y1, z]]);
      ctx.save(); const clip = new Path2D(); clip.addPath(topo); clip.addPath(lado); clip.addPath(frente); ctx.clip(clip);
      linhas3d(ctx, cam, xadrez, 'rgba(43,59,102,0.55)', 0.035);
      linhas3d(ctx, cam, xadrez.filter((_, i) => i % 4 === 0), 'rgba(235,194,90,0.5)', 0.008);
      ctx.restore();
      // lençol dobrado sobre o cobertor
      caixaLuz(ctx, cam, cb.x0 + 0.01, cb.x1 - 0.01, cb.y1 - 0.02, cb.y1 + 0.03, cb.z1 - 0.18, cb.z1 + 0.02, '#F2EDE6', LUZ, { linha: 1.2 });
      ctx.restore();
    },
  };
})();

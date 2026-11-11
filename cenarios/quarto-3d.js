// Cenário em perspectiva: QUARTO DO LUCAS, de manhã (luz dourada entrando pela janela à esquerda).
// Mundo em metros: quarto de x -2,3 a 2,3; chão y = 0, teto y = 2,7; parede do fundo em z = 5.
// Janela na parede esquerda (z 1,2–3,0); porta no fundo à direita; cama encostada na parede direita.
// Uso: Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: 0..1, t, despertadorTocando })
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const T = (n) => Estilo.tom(n);
  const { face, caixa } = Cena3D;
  const XL = -2.3, XR = 2.3, YT = 2.7, ZF = 5;
  const SOL = [0.75, -0.55, 0.35]; // direção da luz do sol (entra pela janela, desce para a direita)

  function noChao([X, Y, Z]) { const k = Y / -SOL[1]; return [X + SOL[0] * k, 0.002, Z + SOL[2] * k]; }

  window.Cenarios3D.quarto = {
    nevoa: '#F3E3CF',
    // posições úteis
    pontos: { cama: { x: 1.55, z: 1.8 }, criado: { x: 1.9, z: 3.35 }, porta: { x: 1.35, z: 4.85 }, centro: { x: 0, z: 2.4 } },
    desenhar(ctx, cam, o = {}) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const parede = T('parede'), madeira = T('madeiraClara');
      // teto, paredes e chão (parede esquerda contra a luz = mais escura; direita recebe sol)
      face(ctx, cam, [[XL, YT, cam.z + 0.2], [XR, YT, cam.z + 0.2], [XR, YT, ZF], [XL, YT, ZF]], Estilo.multiply(parede.base, '#E8E0EA'), { contorno: false });
      face(ctx, cam, [[XL, 0, cam.z + 0.2], [XL, 0, ZF], [XL, YT, ZF], [XL, YT, cam.z + 0.2]], parede.sombra, { contorno: false });
      face(ctx, cam, [[XR, 0, cam.z + 0.2], [XR, 0, ZF], [XR, YT, ZF], [XR, YT, cam.z + 0.2]], parede.luz, { contorno: false });
      face(ctx, cam, [[XL, 0, ZF], [XR, 0, ZF], [XR, YT, ZF], [XL, YT, ZF]], parede.base, { contorno: false });
      face(ctx, cam, [[XL, 0, cam.z + 0.2], [XR, 0, cam.z + 0.2], [XR, 0, ZF], [XL, 0, ZF]], madeira.base, { contorno: false });
      // tábuas do chão (linhas para o ponto de fuga) e juntas
      ctx.save(); ctx.strokeStyle = 'rgba(140,95,80,0.45)';
      for (let x = XL; x <= XR; x += 0.32) { const a = cam.p(x, 0, Math.max(cam.z + 0.3, 0)), b = cam.p(x, 0, ZF); ctx.lineWidth = Math.max(0.7, a.s * 0.006); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      for (let z = 0.4, i = 0; z < ZF; z += 0.9, i++) for (let x = XL + (i % 2) * 0.32; x < XR; x += 0.64) { const a = cam.p(x, 0, z), b = cam.p(x + 0.32, 0, z); ctx.lineWidth = Math.max(0.6, a.s * 0.005); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.restore();
      // rodapé e cantos
      for (const [x, s] of [[XL, 1], [XR, -1]]) face(ctx, cam, [[x, 0, cam.z + 0.2], [x, 0, ZF], [x, 0.1, ZF], [x, 0.1, cam.z + 0.2]], T('linho').base, { linha: 1.2 });
      face(ctx, cam, [[XL, 0, ZF - 0.001], [XR, 0, ZF - 0.001], [XR, 0.1, ZF - 0.001], [XL, 0.1, ZF - 0.001]], T('linho').base, { linha: 1.2 });

      // janela (parede esquerda): céu da manhã por dentro, moldura e cortinas
      const J = [[XL + 0.002, 1.0, 1.2], [XL + 0.002, 1.0, 3.0], [XL + 0.002, 2.25, 3.0], [XL + 0.002, 2.25, 1.2]];
      const pj = Cena3D.caminho(cam, J);
      ctx.save(); ctx.clip(pj);
      const a = cam.p(XL, 2.25, 2.1), b = cam.p(XL, 1.0, 2.1);
      const g = ctx.createLinearGradient(0, a.y, 0, b.y); g.addColorStop(0, '#A9D3EC'); g.addColorStop(0.7, '#F9E2C2'); g.addColorStop(1, '#FBD7A8');
      ctx.fillStyle = g; ctx.fill(pj);
      const sol = cam.p(XL, 1.55, 1.7); const hs = ctx.createRadialGradient(sol.x, sol.y, 0, sol.x, sol.y, sol.s * 0.9);
      hs.addColorStop(0, 'rgba(255,248,220,1)'); hs.addColorStop(0.3, 'rgba(255,236,190,0.8)'); hs.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = hs; ctx.fill(pj);
      ctx.restore();
      face(ctx, cam, J, 'rgba(0,0,0,0)', { linha: 3, semNevoa: true });
      face(ctx, cam, [[XL + 0.004, 1.6, 1.2], [XL + 0.004, 1.65, 1.2], [XL + 0.004, 1.65, 3.0], [XL + 0.004, 1.6, 3.0]], T('linho').base, { linha: 1.5 });
      face(ctx, cam, [[XL + 0.004, 1.0, 2.07], [XL + 0.004, 1.0, 2.13], [XL + 0.004, 2.25, 2.13], [XL + 0.004, 2.25, 2.07]], T('linho').base, { linha: 1.5 });
      caixa(ctx, cam, XL, XL + 0.12, 0.92, 1.0, 1.1, 3.1, 'linho');
      for (const [z0, z1] of [[0.75, 1.3], [2.9, 3.45]]) {
        face(ctx, cam, [[XL + 0.06, 0.6, z0], [XL + 0.06, 0.6, z1], [XL + 0.06, 2.45, z1], [XL + 0.06, 2.45, z0]], T('mostarda').base);
        ctx.save(); ctx.strokeStyle = T('mostarda').sombra;
        for (const k of [0.33, 0.66]) { const p1 = cam.p(XL + 0.06, 2.4, z0 + (z1 - z0) * k), p2 = cam.p(XL + 0.06, 0.65, z0 + (z1 - z0) * k); ctx.lineWidth = Math.max(1, p1.s * 0.02); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
        ctx.restore();
      }

      // pôster e prateleira na parede do fundo
      face(ctx, cam, [[-1.5, 1.25, ZF - 0.01], [-0.55, 1.25, ZF - 0.01], [-0.55, 2.3, ZF - 0.01], [-1.5, 2.3, ZF - 0.01]], T('linho').base);
      face(ctx, cam, [[-1.42, 1.33, ZF - 0.012], [-0.63, 1.33, ZF - 0.012], [-0.63, 2.22, ZF - 0.012], [-1.42, 2.22, ZF - 0.012]], T('marinho').base, { linha: 1 });
      const pc = cam.p(-1.02, 1.9, ZF); ctx.fillStyle = cam.tom(T('turquesa').base, ZF); ctx.beginPath(); ctx.arc(pc.x, pc.y, pc.s * 0.17, 0, Math.PI * 2); ctx.fill();
      face(ctx, cam, [[-1.32, 1.42, ZF - 0.013], [-0.72, 1.42, ZF - 0.013], [-1.02, 1.8, ZF - 0.013]], T('mostarda').base, { linha: 1 });
      caixa(ctx, cam, -2.2, -0.2, 0.95, 1.0, ZF - 0.3, ZF, 'madeira');
      let bx = -2.1;
      for (const [w, h, c] of [[0.09, 0.32, 'brasa'], [0.07, 0.27, 'denim'], [0.1, 0.34, 'turquesa'], [0.08, 0.25, 'lilas'], [0.09, 0.3, 'mostarda']]) { caixa(ctx, cam, bx, bx + w, 1.0, 1.0 + h, ZF - 0.25, ZF - 0.05, c, { linha: 1 }); bx += w + 0.015; }

      // porta no fundo (abre para dentro do corredor escuro)
      const ab = o.portaAberta || 0;
      face(ctx, cam, [[0.85, 0, ZF - 0.005], [1.85, 0, ZF - 0.005], [1.85, 2.15, ZF - 0.005], [0.85, 2.15, ZF - 0.005]], T('linho').base, { linha: 2 });
      face(ctx, cam, [[0.92, 0, ZF - 0.006], [1.78, 0, ZF - 0.006], [1.78, 2.08, ZF - 0.006], [0.92, 2.08, ZF - 0.006]], '#6E5A64', { contorno: false });
      const ang = ab * 1.35, hx = 1.78, w = 0.86;
      const fx = hx - Math.cos(ang) * w, fz = ZF - 0.006 - Math.sin(ang) * w;
      face(ctx, cam, [[hx, 0, ZF - 0.006], [fx, 0, fz], [fx, 2.08, fz], [hx, 2.08, ZF - 0.006]], T('madeira').base, { linha: 2 });
      const mc = cam.p(fx + (hx - fx) * 0.12, 1.0, fz + (ZF - fz) * 0.12); ctx.fillStyle = T('mostarda').base; ctx.beginPath(); ctx.arc(mc.x, mc.y, Math.max(2, mc.s * 0.03), 0, Math.PI * 2); ctx.fill();

      // tapete
      const tp = [[-1.3, 0.003, 1.4], [0.9, 0.003, 1.4], [0.9, 0.003, 3.2], [-1.3, 0.003, 3.2]];
      face(ctx, cam, tp, T('lilas').base, { linha: 1.5 });
      face(ctx, cam, [[-1.1, 0.004, 1.6], [0.7, 0.004, 1.6], [0.7, 0.004, 3.0], [-1.1, 0.004, 3.0]], T('lilas').luz, { contorno: false });

      // luz do sol no chão e feixes (luz chapada, sem contorno)
      const piso = J.map(noChao);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255,226,170,0.55)'; ctx.fill(Cena3D.caminho(cam, piso));
      for (const [i, k] of [[0, 1], [1, 2], [3, 2]]) { }
      const feixe = Cena3D.caminho(cam, [J[2], J[3], piso[3], piso[2]]);
      ctx.fillStyle = 'rgba(255,236,190,0.16)'; ctx.fill(feixe);
      const feixe2 = Cena3D.caminho(cam, [J[3], J[0], piso[0], piso[3]]);
      ctx.fillStyle = 'rgba(255,236,190,0.12)'; ctx.fill(feixe2);
      ctx.restore();

      // cama encostada na parede direita, cabeceira no fundo; criado-mudo ao lado da cabeceira
      // (pintado do fundo para a frente)
      caixa(ctx, cam, 1.55, XR, 0, 0.6, 3.15, 3.65, 'madeira');
      caixa(ctx, cam, 1.5, XR, 0.6, 0.66, 3.1, 3.7, 'madeiraClara');
      const dp = cam.p(1.92, 0.66, 3.4);
      Cena.objeto(ctx, 'despertador', dp.x, dp.y, dp.s * 0.16, { tocando: o.despertadorTocando, t: o.t, semSombra: true, contornoPx: 2.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      caixa(ctx, cam, 1.0, XR, 0, 1.1, 3.0, 3.08, 'madeira');
      caixa(ctx, cam, 1.0, XR, 0, 0.32, 0.8, 3.0, 'madeira');
      caixa(ctx, cam, 1.05, XR - 0.05, 0.32, 0.55, 0.85, 2.95, 'linho');
      caixa(ctx, cam, 1.2, XR - 0.2, 0.55, 0.7, 2.4, 2.9, 'linho');
      caixa(ctx, cam, 0.98, XR - 0.02, 0.4, 0.6, 0.8, 2.3, 'denim');
      ctx.restore();
    },
  };
})();

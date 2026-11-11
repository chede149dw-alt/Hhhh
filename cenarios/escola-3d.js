// Cenário em perspectiva: CORREDOR DA ESCOLA (armários à esquerda, janelas com sol à direita).
// Mundo em metros: corredor de x -2 a 2, teto 3 m, até z = 32 (porta dupla no fim).
// Uso: Cenarios3D.escola.desenhar(ctx, cam, { armarioAberto: 0..1 }) — o armário que abre fica em z 3,6–4,1.
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const T = (n) => Estilo.tom(n);
  const { face, caixa } = Cena3D;
  const XL = -2, XR = 2, YT = 3, ZF = 32, LW = 0.5;

  window.Cenarios3D.escola = {
    nevoa: '#EDE7DC',
    pontos: { armario: { x: XL, z: 3.85 } },
    desenhar(ctx, cam, o = {}) {
      ctx.save();
      const parede = T('paredeEscola'), arm = T('armario');
      // faixas em profundidade (névoa muda com a distância)
      const zs = []; for (let z = cam.z + 0.2, d = 0.8; z < ZF; z += d, d *= 1.12) zs.push(z); zs.push(ZF);
      for (let i = 0; i < zs.length - 1; i++) {
        const a = zs[i], b = zs[i + 1] + 0.01;
        face(ctx, cam, [[XL, YT, a], [XR, YT, a], [XR, YT, b], [XL, YT, b]], Estilo.multiply(parede.base, '#E4E0EC'), { contorno: false });
        face(ctx, cam, [[XL, 0, a], [XL, 0, b], [XL, YT, b], [XL, YT, a]], parede.sombra, { contorno: false });
        face(ctx, cam, [[XR, 0, a], [XR, 0, b], [XR, YT, b], [XR, YT, a]], parede.luz, { contorno: false });
        face(ctx, cam, [[XL, 0, a], [XR, 0, a], [XR, 0, b], [XL, 0, b]], T('linho').base, { contorno: false });
      }
      // piso xadrez até 14 m
      for (let z = Math.floor((cam.z + 0.2) / 0.6) * 0.6, r = 0; z < 14; z += 0.6, r++) for (let x = XL, c = 0; x < XR - 0.01; x += 0.5, c++) {
        if ((c + Math.round(z / 0.6)) % 2) face(ctx, cam, [[x, 0.001, z], [x + 0.5, 0.001, z], [x + 0.5, 0.001, z + 0.6], [x, 0.001, z + 0.6]], T('calcada').base, { contorno: false });
      }
      // janelas com sol (parede direita) e luz no chão
      for (let z = 1.5; z < ZF - 2; z += 3.2) {
        const J = [[XR - 0.002, 1.0, z], [XR - 0.002, 1.0, z + 1.8], [XR - 0.002, 2.5, z + 1.8], [XR - 0.002, 2.5, z]];
        face(ctx, cam, J, '#F7EBD3', { linha: cam.linha(z) * 0.7 });
        face(ctx, cam, [[XR - 0.004, 1.0, z + 0.87], [XR - 0.004, 1.0, z + 0.93], [XR - 0.004, 2.5, z + 0.93], [XR - 0.004, 2.5, z + 0.87]], T('linho').base, { contorno: false });
        const chao = J.map(([X, Y, Z]) => [X - Y * 0.9, 0.002, Z - Y * 0.25]);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,226,170,0.45)'; ctx.fill(Cena3D.caminho(cam, chao)); ctx.restore();
      }
      // cartazes coloridos entre as janelas e um banco de madeira
      for (let z = 3.6, i = 0; z < 20; z += 3.2, i++) {
        const cor = ['coral', 'mostarda', 'turquesa', 'lilas'][i % 4];
        face(ctx, cam, [[XR - 0.003, 1.3, z], [XR - 0.003, 1.3, z + 0.5], [XR - 0.003, 2.0, z + 0.5], [XR - 0.003, 2.0, z]], T(cor).base, { linha: cam.linha(z) * 0.7 });
        face(ctx, cam, [[XR - 0.004, 1.75, z + 0.08], [XR - 0.004, 1.75, z + 0.42], [XR - 0.004, 1.9, z + 0.42], [XR - 0.004, 1.9, z + 0.08]], T('linho').base, { contorno: false });
      }
      caixa(ctx, cam, XR - 0.45, XR - 0.05, 0.42, 0.5, 6.5, 8.5, 'madeira');
      for (const z of [6.6, 8.3]) caixa(ctx, cam, XR - 0.4, XR - 0.1, 0, 0.42, z, z + 0.1, 'grafite');
      // luminárias no teto
      for (let z = 2; z < ZF; z += 3.2) face(ctx, cam, [[-0.5, YT - 0.01, z], [0.5, YT - 0.01, z], [0.5, YT - 0.01, z + 1.2], [-0.5, YT - 0.01, z + 1.2]], '#FFFBEA', { linha: cam.linha(z) * 0.5 });
      // porta dupla no fim
      face(ctx, cam, [[-1.0, 0, ZF - 0.01], [1.0, 0, ZF - 0.01], [1.0, 2.3, ZF - 0.01], [-1.0, 2.3, ZF - 0.01]], T('madeira').base);
      // faixa turquesa na parede esquerda acima dos armários
      face(ctx, cam, [[XL + 0.003, 2.15, (cam.z + 0.2)], [XL + 0.003, 2.15, ZF], [XL + 0.003, 2.25, ZF], [XL + 0.003, 2.25, (cam.z + 0.2)]], T('turquesa').base, { contorno: false });
      // armários (do fundo para a frente)
      const ab = o.armarioAberto || 0;
      for (let z = ZF - 2.5; z >= 0; z -= LW) {
        if (z + LW < cam.z + 0.3) continue;
        const aberto = Math.abs(z - 3.6) < 0.01 && ab > 0;
        const P = [[XL + 0.004, 0.1, z], [XL + 0.004, 0.1, z + LW], [XL + 0.004, 2.0, z + LW], [XL + 0.004, 2.0, z]];
        if (aberto) {
          face(ctx, cam, P, '#2E2838', { linha: cam.linha(z) });
          caixa(ctx, cam, XL, XL + 0.05, 1.3, 1.34, z + 0.04, z + LW - 0.04, 'madeira', { linha: 1 });
          caixa(ctx, cam, XL, XL + 0.04, 1.34, 1.62, z + 0.12, z + 0.3, 'coral', { linha: 1 });
          // porta girando para o corredor (dobradiça em z + LW)
          const ang = ab * 1.7, hz = z + LW, fx = XL + 0.004 + Math.sin(ang) * LW, fz = hz - Math.cos(ang) * LW;
          face(ctx, cam, [[XL + 0.004, 0.1, hz], [fx, 0.1, fz], [fx, 2.0, fz], [XL + 0.004, 2.0, hz]], arm.luz, { linha: cam.linha(z) });
          continue;
        }
        face(ctx, cam, P, arm.base, { linha: cam.linha(z) * 0.8 });
        if (z < 12) {
          ctx.save(); ctx.strokeStyle = cam.tom(arm.sombra, z);
          for (let k = 0; k < 3; k++) { const a = cam.p(XL + 0.005, 1.8 - k * 0.07, z + 0.12), b = cam.p(XL + 0.005, 1.8 - k * 0.07, z + LW - 0.12); ctx.lineWidth = Math.max(0.6, a.s * 0.012); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          ctx.restore();
          face(ctx, cam, [[XL + 0.006, 0.95, z + LW - 0.1], [XL + 0.006, 0.95, z + LW - 0.06], [XL + 0.006, 1.2, z + LW - 0.06], [XL + 0.006, 1.2, z + LW - 0.1]], T('linho').base, { linha: 0.8 });
        }
      }
      // rodapés
      face(ctx, cam, [[XL + 0.005, 0, (cam.z + 0.2)], [XL + 0.005, 0, ZF], [XL + 0.005, 0.1, ZF], [XL + 0.005, 0.1, (cam.z + 0.2)]], T('grafite').base, { contorno: false });
      face(ctx, cam, [[XR - 0.005, 0, (cam.z + 0.2)], [XR - 0.005, 0, ZF], [XR - 0.005, 0.1, ZF], [XR - 0.005, 0.1, (cam.z + 0.2)]], T('grafite').base, { contorno: false });
      ctx.restore();
    },
  };
})();

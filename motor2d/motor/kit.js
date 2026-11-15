// KIT DO MOLDE (capítulo 4 do livro "O Motor"): o jeito de fazer que já foi APROVADO e vale para todo vídeo.
// Veio do episódio 1 da terra (versão dramática, aprovado e postado). Episódio novo usa Kit.* em vez de copiar
// funções do último vídeo (o último vídeo carrega os remendos dele; o molde só tem o que deu certo).
// Só entra aqui o que o autor aprovou. Peça nova nasce dentro do episódio; se for elogiada, sobe para o kit.
(function () {
  const W = 1080, H = 1920;
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  // personagens prontos para usar (catálogo único de poses: motor/corpo.js)
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  // luzes aprovadas
  const LUZ_FRIA = { lado: -1, cor: 'rgb(160,185,255)', forca: 0.65 };   // madrugada
  const LUZ_DIA = { lado: -1, forca: 0.5 };

  // close de rosto: cabeça no ponto (cx, cy), cabeça com Hpx de altura
  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  // close que gira com a câmera (rel = ângulo entre câmera e frente do personagem)
  function closeGira(api, item, cx, cy, Hpx, rel, o = {}) {
    const A = alturaH(item, 'frente');
    return api.personagemGirando(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, rel, o);
  }
  // "desenha, escurece, acende": escurece e esfria o que já foi desenhado + vinheta (luz de madrugada)
  function frio(ctx, k = 0.6) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = Math.min(1, k);
    ctx.fillStyle = '#4A5A8C'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(540, 960, 350, 540, 960, 1250);
    g.addColorStop(0, 'rgba(8,10,28,0)'); g.addColorStop(1, `rgba(8,10,28,${0.6 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // redesenha somando luz por cima do escuro (rachadura acesa: alfa 0,25–0,45; acima disso estoura)
  function aceso(ctx, alfa, f) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alfa; f(); ctx.restore(); }
  function brilho(ctx, x, y, r, a, cor = '255,165,70') {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,226,176,${a})`); g.addColorStop(0.35, `rgba(${cor},${a * 0.55})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
  // batida de coração agora (0..1), nos mesmos tempos do som (sfx coracao → api.batidas)
  function pulso(api, u) {
    let v = 0;
    for (const b of api.batidas) {
      const d = u - b; if (d >= 0) v = Math.max(v, Math.exp(-d * 9));
      const d2 = d - 0.17; if (d2 >= 0) v = Math.max(v, 0.7 * Math.exp(-d2 * 9));
    }
    return v;
  }
  // linhas de energia saindo de um ponto (palma, peito)
  function veias(ctx, x, y, s, a, semente) {
    if (a <= 0) return;
    const rnd = rng(semente);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 6; i++) {
      let ang = (i / 6) * Math.PI * 2 + rnd() * 0.6, px = x, py = y;
      const pts = [[px, py]];
      for (let k = 0; k < 4; k++) { ang += (rnd() - 0.5) * 1.1; const L = s * (0.12 + rnd() * 0.12); px += Math.cos(ang) * L; py += Math.sin(ang) * L; pts.push([px, py]); }
      for (const [lw, cor] of [[s * 0.05, `rgba(255,140,50,${0.35 * a})`], [s * 0.018, `rgba(255,226,176,${0.9 * a})`]]) {
        ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([qx, qy], j) => (j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy))); ctx.stroke();
      }
    }
    ctx.restore();
  }
  // cenário desfocado atrás do close; o.frio escurece antes do desfoque; o.depois(g, cam) desenha por cima
  function fundo(ctx, api, cenario, camOpts, px, extra = {}, o = {}) {
    const camada = api.camada(), g = camada.getContext('2d');
    const cam = api.camera({ nevoa: Cenarios3D[cenario].nevoa, distNevoa: 30, ...camOpts });
    Cenarios3D[cenario].desenhar(g, cam, { t: api.t, ...extra });
    if (o.frio) frio(g, o.frio);
    if (o.depois) o.depois(g, cam);
    api.desfocar(camada, px);
    return cam;
  }
  const maoDoRig = (rig, lado = 'd') => rig.pontoMundo('mao_' + lado, [0, 0.3]);
  const camEm = (x, y, s) => Cena3D.camera({ f: s * 2, x: 0, y: 1, z: 0, cx: x, cy: y - s });
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };
  // chaves de animação: [[tempo, valor], ...] (número ou lista), suave entre as chaves
  function chave(T, lista) {
    if (T <= lista[0][0]) return lista[0][1];
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, v0] = lista[i], [t1, v1] = lista[i + 1];
      if (T <= t1) {
        const k0 = (T - t0) / (t1 - t0), k = k0 * k0 * (3 - 2 * k0);
        return Array.isArray(v0) ? v0.map((v, j) => v + (v1[j] - v) * k) : v0 + (v1 - v0) * k;
      }
    }
    return lista[lista.length - 1][1];
  }
  // tempo nominal de uma TOMADA CONTÍNUA que atravessa vários planos (a câmera não sai do lugar se a voz final
  // mudar a duração dos planos)
  function tempoTomada(api, ids, nominais) {
    let acc = 0;
    for (let i = 0; i < ids.length; i++) {
      const q = api.planos.find((k) => k.id === ids[i]);
      if (api.t < q.fim || i === ids.length - 1) return acc + api.clamp((api.t - q.inicio) / (q.fim - q.inicio), 0, 1) * nominais[i];
      acc += nominais[i];
    }
    return acc;
  }
  const angDe = (de, para) => Math.atan2(-(para[0] - de[0]), -(para[1] - de[1])); // rumo de quem olha de `de` para `para`

  // ---------- capa (primeiros 2–3 s): a premissa escrita grande ----------
  // linhas: ['E SE VOCÊ', 'ACORDASSE', 'CONTROLANDO'], destaque: 'A TERRA?' (amarelo, maior, levemente torto)
  function capaTitulo(ctx, api, linhas, destaque) {
    const k = api.fase(0, 0.35, 'volta');
    ctx.save(); zoom(ctx, 540, 380, k);
    linhas.forEach((l, i) => api.texto(l, 540, 250 + i * 110, 92));
    ctx.restore();
    const yD = 250 + linhas.length * 110 + 30;
    const k2 = api.fase(0.25, 0.6, 'volta');
    ctx.save(); ctx.translate(540, yD); ctx.scale(k2, k2); ctx.rotate(-0.03); ctx.translate(-540, -yD);
    api.texto(destaque, 540, yD, 150, { cor: Estilo.base.mostarda });
    ctx.restore();
  }

  // ---------- cartela final: PARTE X + SEGUE PRA VER A PARTE X+1, botão pulsando (sem mão clicando) ----------
  function cartelaParte(ctx, u, d, api, parte, cenario = 'patio', camOpts = { x: 0, y: 1.4, cy: 960 }) {
    const z = api.lerp(1.0, 1.06, u / d);
    ctx.save(); zoom(ctx, 540, 960, z);
    fundo(ctx, api, cenario, { z: -0.5 + u * 0.2, ...camOpts }, 18, {}, { frio: 0.8 });
    ctx.restore();
    ctx.fillStyle = 'rgba(10,8,16,0.55)'; ctx.fillRect(0, 0, W, H);
    brilho(ctx, 540, 1250, 700, 0.18 + 0.06 * Math.sin(api.t * 4));
    const k = api.fase(0, 0.35, 'volta');
    ctx.save(); zoom(ctx, 540, 760, k);
    api.texto('PARTE', 540, 680, 120); api.texto(String(parte), 540, 850, 230, { cor: Estilo.base.mostarda });
    ctx.restore();
    const k2 = api.fase(0.45, 0.8, 'volta');
    ctx.save(); zoom(ctx, 540, 1130, k2);
    api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE ' + (parte + 1), 540, 1190, 96, { cor: Estilo.base.mostarda });
    ctx.restore();
    const k3 = api.fase(0.9, 1.2, 'volta'), pulsoB = 1 + Math.sin(api.t * 6) * 0.04;
    ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulsoB, k3 * pulsoB);
    ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
    ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
    ctx.restore();
  }

  window.Kit = {
    W, H, alturaH, rng, LUCAS, LUZ_FRIA, LUZ_DIA,
    close, closeGira, frio, aceso, brilho, pulso, veias, fundo, maoDoRig, camEm, zoom, chave, tempoTomada, angDe,
    capaTitulo, cartelaParte,
  };
})();

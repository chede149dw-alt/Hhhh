// Episódio 1 (versão dramática) — "E se você acordasse controlando a terra?" (PARTE 1)
// Planos do roteiro roteiros/terra/ep01-dramatico.json (~1 min 12 s). Tom: medo e mistério.
// Luz: quarto frio e azulado; o brilho laranja das rachaduras é a única luz quente. Batidas de coração vêm de
// api.batidas (as mesmas do som). Regras: câmera perto e sempre se mexendo; Lucas segue a ficha; reações em 3 tempos.
(function () {
  const LUCAS = { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' };
  const MAE = { fabrica: 'criarMae', registroPoses: 'POSES_PADRAO' };
  const RAFAEL = { fabrica: 'criarRafael', registroPoses: 'POSES_PADRAO' };
  const LUZ_FRIA = { lado: -1, cor: 'rgb(160,185,255)', forca: 0.65 };
  const LUZ_DIA = { lado: -1, forca: 0.5 };
  const W = 1080, H = 1920;
  const alturaH = (item, vista = 'frente') => window[item.fabrica](item.opcoes || {}, vista).alturaEmH;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  function close(api, item, cx, cy, Hpx, o = {}) {
    const A = alturaH(item, item.vista || 'frente');
    return api.personagem(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, o);
  }
  // escurece e esfria o que já foi desenhado (luz de madrugada) + vinheta escura
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
  // redesenha algo somando luz (brilho das rachaduras por cima do escuro)
  function aceso(ctx, alfa, f) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alfa; f(); ctx.restore(); }
  function brilho(ctx, x, y, r, a, cor = '255,165,70') {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,226,176,${a})`); g.addColorStop(0.35, `rgba(${cor},${a * 0.55})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
  // intensidade da batida de coração agora (0..1): "tum" e "tum" mais fraco 0,17 s depois
  function pulso(api, u) {
    let v = 0;
    for (const b of api.batidas) {
      const d = u - b; if (d >= 0) v = Math.max(v, Math.exp(-d * 9));
      const d2 = d - 0.17; if (d2 >= 0) v = Math.max(v, 0.7 * Math.exp(-d2 * 9));
    }
    return v;
  }
  // linhas de rachadura brilhando saindo de um ponto (palma, peito)
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
  // fundo desfocado; o.frio escurece antes do desfoque; o.depois(g, cam) desenha por cima (ex.: rachadura acesa)
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
  // chaves de animação: lista [[tempo, valor], ...] (valor número ou lista); interpola suave entre as chaves
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
  // close com a vista escolhida pelo ângulo (rel): o personagem gira junto com a câmera
  function closeGira(api, item, cx, cy, Hpx, rel, o = {}) {
    const A = alturaH(item, 'frente');
    return api.personagemGirando(item, cx, cy - 0.47 * Hpx + A * Hpx, A * Hpx, rel, o);
  }
  // tempo "nominal" de uma tomada que atravessa vários planos: se a duração real dos planos mudar (ex.: voz final),
  // a câmera e as ações continuam batendo com as falas (cada plano é esticado/encolhido para a sua duração nominal)
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
  const ALUNOS = [
    { nome: 'Aluna 1', altura: 5.5, pele: 'pele2', cabelo: { estilo: 'coque', cor: 'cabCastanho' }, top: { tipo: 'camiseta', cor: 'lilas' }, calca: { tipo: 'reta', cor: 'denim' } },
    { nome: 'Aluno 2', altura: 5.7, pele: 'pele4', cabelo: { estilo: 'baguncado', cor: 'cabNoite' }, top: { tipo: 'moletom', cor: 'brasa' }, calca: { tipo: 'reta', cor: 'grafite' } },
    { nome: 'Aluna 3', altura: 5.4, pele: 'pele1', cabelo: { estilo: 'liso-lateral', cor: 'cabCobre' }, top: { tipo: 'camiseta', cor: 'turquesa' }, calca: { tipo: 'reta', cor: 'pedra' } },
    { nome: 'Aluno 4', altura: 5.6, pele: 'pele3', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'mostarda' }, calca: { tipo: 'reta', cor: 'denim' } },
  ];
  const aluno = (i, extra = {}) => ({ fabrica: 'criarPersonagem', registroPoses: 'POSES_PADRAO', opcoes: ALUNOS[i], pose: 'parado', ...extra });

  // abismo dentro da rachadura (2D): camadas de rocha vindo na direção da câmera e um brilho que pulsa
  function abismo(ctx, api, k, pu, desloc = 0) {
    ctx.fillStyle = '#0A0607'; ctx.fillRect(0, 0, W, H);
    const cx = 540 + Math.sin(api.t * 0.7) * 20, cy = 1020;
    brilho(ctx, cx, cy, 520 + 260 * pu + 180 * k, 0.45 + 0.5 * pu, '255,120,40');
    // núcleo: forma irregular incandescente
    const rnd0 = rng(77);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,190,110,${0.35 + 0.45 * pu})`; ctx.beginPath();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = (70 + 40 * pu + 40 * k) * (0.7 + rnd0() * 0.5); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    const n = 7, camadas = [];
    for (let i = 0; i < n; i++) {
      const pos = (i + k * 3.2 + desloc) / n, zz = 1 - (pos % 1), id = i + n * Math.floor(pos);
      camadas.push({ zz, id });
    }
    camadas.sort((a, b) => b.zz - a.zz);
    for (const { zz, id } of camadas) {
      const s = 0.22 / (zz + 0.07), rnd = rng(100 + id * 13), pts = [];
      for (let j = 0; j < 24; j++) { const a = (j / 24) * Math.PI * 2, r = 420 * s * (0.72 + rnd() * 0.4); pts.push([cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 1.15]); }
      const luz = Math.max(0, 1 - zz * 1.1);
      ctx.save();
      ctx.beginPath(); ctx.rect(-50, -50, W + 100, H + 100);
      pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      const tom = Math.round(18 + 30 * luz);
      ctx.fillStyle = `rgb(${tom + 10},${Math.round(tom * 0.65)},${Math.round(tom * 0.5)})`; ctx.fill('evenodd');
      ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.strokeStyle = `rgba(255,140,50,${(0.25 + 0.5 * pu) * (1 - zz)})`; ctx.lineWidth = 10 * s; ctx.stroke();
      ctx.strokeStyle = `rgba(255,226,176,${(0.2 + 0.5 * pu) * (1 - zz)})`; ctx.lineWidth = 3 * s; ctx.stroke();
      ctx.restore();
    }
    // poeira brilhante flutuando
    const rp = rng(9);
    for (let i = 0; i < 70; i++) {
      const x0 = rp() * W, y0 = rp() * H, v = 20 + rp() * 60, r = 2 + rp() * 5;
      const y = (y0 - api.t * v) % H, x = x0 + Math.sin(api.t + i) * 20;
      brilho(ctx, x, y < 0 ? y + H : y, r * 4, 0.35 + 0.3 * pu);
    }
  }

  // ---------- tomadas contínuas (a mesma câmera atravessa vários planos) ----------
  function tomadaQuarto(ctx, api) {
    const T = tempoTomada(api, ['treme', 'rachadura'], [2.5, 2.5]);
    const forte = T < 2.5 ? 20 : 6;
    const [tx, ty] = api.tremor(forte);
    ctx.save(); ctx.translate(tx, ty);
    const L = [-0.3 - 0.35 * api.ease.entra(api.clamp((T - 3.4) / 0.8, 0, 1)), 2.45];
    const cam = api.orbita({
      alvo: [L[0], chave(T, [[0, 1.25], [2.5, 1.15], [5, 1.05]]), L[1]], raio: chave(T, [[0, 2.5], [2.5, 2.1], [5, 1.75]]),
      ang: chave(T, [[0, -0.2], [2.5, 0.12], [5, 0.38]]), altura: chave(T, [[0, 1.45], [2.5, 1.2], [5, 0.95]]), f: 1000, ySalvo: 1020, nevoa: Cenarios3D.quarto.nevoa,
    });
    Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: T < 2.5 ? 1.6 : 0.4, livrosCaindo: api.clamp((T - 0.1) / 1.5, 0, 1) });
    const Tr = T - 2.5;
    const rach = () => {
      if (Tr <= 0) return;
      Efeitos.rachadura(ctx, cam, [1.0, 2.0], [L[0] + 0.15, L[1] - 0.05], api.clamp((Tr - 0.1) / 1.2, 0, 1), api.t, { largura: 0.04, zigue: 0.6, semente: 23 });
      Efeitos.rachadura(ctx, cam, [1.0, 2.3], [0.35, 3.3], api.clamp((Tr - 0.5) / 1.3, 0, 1), api.t, { largura: 0.025, semente: 29 });
    };
    rach();
    const expr = T < 0.7 ? 'espanto' : Tr < 0 ? 'medo' : Tr < 0.4 ? { ...LUCAS_EXPRESSOES.espanto, olhar: [0, 0.012] } : 'medo';
    const rumo = chave(T, [[0, 0], [2.6, 0], [3.3, angDe(L, [1.0, 2.0]) * 0.7]]);
    api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: expr }, L[0], L[1], 1.75, { luz: LUZ_FRIA, vida: T < 2.5 ? 3 : 2.2, rumo });
    ctx.restore();
    frio(ctx, 0.62);
    if (T < 2.5) Efeitos.poeiraTeto(ctx, W, H, api.t, 1.4);
    ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.25, rach); ctx.restore();
  }

  function tomadaMae(ctx, api) {
    const T = tempoTomada(api, ['mae', 'susto', 'mae2', 'mentira'], [2.5, 2.5, 2.5, 2.5]);
    const L = [0.1, 2.0], M = [1.3, 4.45];
    const cam = api.orbita({
      // 0–5: gira em volta do Lucas e revela a mãe; 5–7,4: por cima do ombro dele, aproxima na mãe (lente fecha);
      // 7,4–10: volta por fora até ficar de frente para ele (nunca passa rente ao Lucas)
      alvo: chave(T, [[0, [0.1, 1.4, 2.0]], [2.5, [0.4, 1.45, 2.7]], [5, [0.35, 1.35, 2.5]], [7.4, [1.3, 1.5, 4.45]], [10, [0.1, 1.4, 2.0]]]),
      raio: chave(T, [[0, 1.3], [2.5, 1.9], [5, 1.6], [7.4, 3.44], [10, 1.2]]),
      ang: chave(T, [[0, -0.2], [2.5, 0.4], [5, 0.45], [7.4, 0.235], [10, -0.25]]),
      altura: 1.42, f: chave(T, [[0, 1150], [5, 1150], [7.4, 1700], [10, 1150]]), ySalvo: 960, nevoa: Cenarios3D.quarto.nevoa,
    });
    Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: api.clamp((T - 0.2) / 0.35, 0, 1), t: api.t });
    // mãe na porta: olha o Lucas; depois olha a terra no chão e fica desconfiada
    const P = EXPRESSOES_PADRAO;
    const exM = T < 5 ? 'preocupado' : T < 5.5 ? { ...P.preocupado, olhar: [0, 0.016] } : T < 6.0 ? P.preocupado : P.serio;
    if (T > 0.3) api.personagem3d(cam, { ...MAE, pose: T > 6 ? 'maos-na-cintura' : 'parado', expressao: exM, voz: 'mae' }, M[0], M[1], 1.65, { luz: LUZ_FRIA, olhaPara: L, vida: 1.4 });
    // Lucas: encantado com a esfera → vira de corpo inteiro para a porta → volta mentindo
    const rumo = chave(T, [[0, 0], [0.8, 0], [2.0, angDe(L, M)], [7.6, angDe(L, M)], [8.7, -0.35]]);
    const forcado = { olhar: [0.012, 0], palpebra: 0.1, pupila: 0.75, sobrancelha: { y: -0.04, ang: 16 }, boca: { tipo: 'aberta', curva: 1.3, abertura: 0.03, largura: 0.085 }, gota: true };
    const exL = T < 0.8 ? 'curioso' : T < 2.5 ? 'espanto' : T < 7.5 ? 'medo' : forcado;
    const rig = api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: exL, voz: 'lucas' }, L[0], L[1], 1.75, { luz: LUZ_FRIA, rumo, vida: T > 2.5 && T < 5 ? 0.5 : 1.3 });
    const m = rig.pontoMundo('mao_e', [0, 0.3]), chao = cam.p(L[0] + 0.25, 0, L[1] - 0.1);
    const cai = api.clamp((T - 2.6) / 1.2, 0, 1);
    if (cai > 0.01 && cai < 1 && m.x > -1000) Efeitos.terraCaindo(ctx, m.x + 30, m.y - 50, chao.y, 160, cai);
    if (cai >= 1 && !chao.atras) { ctx.fillStyle = 'rgba(90,58,34,0.8)'; ctx.beginPath(); ctx.ellipse(chao.x, chao.y, chao.s * 0.3, chao.s * 0.07, 0, 0, Math.PI * 2); ctx.fill(); }
    frio(ctx, 0.55);
    if (cai <= 0.01 && m.x > -1000) { brilho(ctx, m.x + 30, m.y - 50, 300, 0.3); Efeitos['poder-terra'](ctx, m.x + 30, m.y - 50, 130, { t: api.t, tamanho: 0.8 }); }
    // rachadura embaixo da cama ainda brilhando (aparece quando a câmera volta para ele)
    aceso(ctx, 0.35, () => Efeitos.rachadura(ctx, cam, [1.0, 2.0], [-0.15, 2.4], 1, api.t, { largura: 0.04, zigue: 0.6, semente: 23 }));
  }

  function tomadaRua(ctx, api) {
    const T = tempoTomada(api, ['rua', 'onda'], [2.5, 2.5]);
    const X = 0.45;
    const Zl = T < 2.5 ? 1.0 + 2.2 * T : 6.5 + 6 * (T - 2.5) + 1.2 * (T - 2.5) * (T - 2.5);
    const [tx, ty] = api.tremor(T < 2.5 ? 5 : 9);
    ctx.save(); ctx.translate(tx, ty);
    const cam = api.orbita({
      alvo: [X, chave(T, [[0, 1.05], [2.5, 1.3], [5, 1.6]]), Zl], raio: chave(T, [[0, 2.3], [2.5, 2.7], [5, 3.6]]),
      ang: chave(T, [[0, 0], [2.3, 0.12], [5, 0.78]]), altura: chave(T, [[0, 1.35], [2.5, 1.5], [5, 1.95]]), f: 1100, ySalvo: 1020, nevoa: Cenarios3D.rua.nevoa,
    });
    Cenarios3D.rua.desenhar(ctx, cam, {});
    const rachas = [];
    [0.5, 1.05, 1.6, 2.15].forEach((tp, i) => {
      if (T < tp) return;
      const Zp = 1.0 + 2.2 * tp + 0.1, xs = X + (i % 2 ? 0.12 : -0.12), lado = i % 2 ? 1 : -1;
      if (cam.p(xs, 0, Zp).dz < 1.3) return;
      rachas.push(() => Efeitos.rachadura(ctx, cam, [xs, Zp], [xs + lado * 1.8, Zp + 0.8], api.clamp((T - tp) / 0.5, 0, 1), api.t, { largura: 0.05, zigue: 0.6, semente: 31 + i }));
      Efeitos.impacto(ctx, cam, xs, Zp, api.clamp((T - tp) / 0.8, 0, 0.99), api.t, { tamanho: 0.45 });
    });
    rachas.forEach((f) => f());
    const VIZ = { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: 'parado', registroPoses: 'POSES_PADRAO' };
    api.personagem3d(cam, { ...VIZ, expressao: T > 3.0 ? 'medo' : T > 1.2 ? 'espanto' : 'neutro' }, 4.6, 16, 1.78, { olhaPara: [X, Zl], vida: 2 });
    // a onda cresce embaixo dele (de 2,3 s a 2,9 s); poeira esconde a troca de pose
    const ko = api.ease.suave(api.clamp((T - 2.3) / 0.6, 0, 1));
    if (T < 2.45) {
      if (ko > 0) Efeitos.ondaTerra(ctx, cam, X, Zl, api.t, { largura: 2.6 * (0.35 + 0.65 * ko), altura: 1.2 * ko });
      api.personagem3d(cam, { ...LUCAS, pose: {}, vista: 'costas', expressao: 'medo' }, X, Zl, 1.75, { caminharFrontal: T, velocidade: 1.8 });
    } else {
      // em cima da onda, de lado como um surfista (rosto para a câmera), balançando sem controle
      const crista = Efeitos.ondaTerra(ctx, cam, X, Zl, api.t, { largura: 2.6 * (0.35 + 0.65 * ko), altura: 1.2 * ko });
      const q = cam.p(X, 0, Zl), rc = Math.atan2(-(cam.x - X), -(cam.z - Zl));
      ctx.save(); ctx.translate(crista.x, crista.y); ctx.rotate(Math.sin(api.t * 5) * 0.12); ctx.translate(-crista.x, -crista.y);
      api.personagemGirando({ ...LUCAS, pose: 'poder', expressao: 'medo' }, crista.x, crista.y + q.s * 0.05, 1.75 * q.s, rc - Math.PI / 2, { vida: 2.5 });
      ctx.restore();
    }
    if (T > 2.3 && T < 3.3) { const q = cam.p(X, 0, Zl); Efeitos.terraPoeira(ctx, q.x, q.y - q.s * 0.4, q.s * 1.5, api.clamp((T - 2.3) / 1.0, 0, 0.99), { semente: 66 }); }
    Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.6, semFrente: T > 2.2 });
    ctx.restore();
    frio(ctx, 0.3);
    ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.3, () => rachas.forEach((f) => f())); ctx.restore();
  }

  function tomadaPortao(ctx, api) {
    const T = tempoTomada(api, ['portao', 'olhares'], [2.5, 2.5]);
    const bate = 0.35, dep = Math.max(0, T - bate);
    const [tx, ty] = T > bate ? api.tremor(4 + 16 * Math.exp(-dep * 3)) : api.tremor(6);
    ctx.save(); ctx.translate(tx, ty);
    const L = [-0.1, 2.6];
    const cam = api.orbita({
      alvo: [L[0], chave(T, [[0, 0.45], [2.5, 0.6], [5, 1.35]]), L[1]], raio: chave(T, [[0, 2.9], [2.5, 2.5], [5, 1.6]]),
      ang: chave(T, [[0, -0.55], [2.5, -0.2], [5, 0.38]]), altura: chave(T, [[0, 0.75], [2.5, 1.0], [5, 1.45]]), f: 1150, ySalvo: 1050, nevoa: Cenarios3D.patio.nevoa,
    });
    Cenarios3D.patio.desenhar(ctx, cam, {});
    // alunos em volta, sempre virados para o Lucas (a câmera gira e eles aparecem)
    const alunos = [[0, -2.3, 4.9, 'espanto'], [1, -1.0, 5.7, 'espanto', 'acenando'], [2, 1.4, 5.4, 'medo'], [3, 2.5, 4.4, 'espanto'], [0, 0.4, 6.4, 'medo']];
    alunos.sort((a, b) => b[2] - a[2]).forEach(([i, x, z, ex, pose]) => api.personagem3d(cam, aluno(i, { expressao: ex, ...(pose ? { pose } : {}) }), x, z, 1.62, { olhaPara: L, vida: 1.8, semente: x * 7 }));
    const rc = Math.atan2(-(cam.x - L[0]), -(cam.z - L[1]));
    if (T < bate + 0.25) {
      const crista = Efeitos.ondaTerra(ctx, cam, L[0], L[1] + (bate - T) * 4, api.t, { largura: 2.2, altura: 1.1 * (1 - api.clamp((T - bate) / 0.25, 0, 1)) });
      if (T < bate) { const q = cam.p(L[0], 0, L[1]); api.personagemGirando({ ...LUCAS, pose: 'poder', expressao: 'medo' }, crista.x, crista.y, 1.75 * q.s, rc + Math.PI / 2); }
    }
    if (T >= bate) {
      // caído de lado; depois se levanta virando o rosto para a câmera
      const sobe = api.ease.suave(api.clamp((T - 2.7) / 0.9, 0, 1));
      const pose = sobe > 0 ? { ...LUCAS, pose: 'caido', pose2: 'parado', mistura: sobe } : { ...LUCAS, pose: 'caido' };
      api.personagem3d(cam, { ...pose, expressao: T < 1.6 ? 'cansado' : 'medo' }, L[0], L[1], 1.75, { vida: 0.8, rumo: rc - api.lerp(Math.PI / 2, 0.15, sobe) });
      const q = cam.p(L[0], 0, L[1]), rnd = rng(61);
      for (let i = 0; i < 10; i++) {
        const a = rnd() * Math.PI * 2, v = 0.6 + rnd() * 1.2, r = 0.05 + rnd() * 0.08, dd = v * (1 - Math.exp(-dep * 2.5));
        const p = cam.p(L[0] + Math.cos(a) * dd * 1.4, r, L[1] + Math.sin(a) * dd * 0.8);
        if (!p.atras) Efeitos._pedra(ctx, p.x, p.y, r * p.s, dep * 4 * (i % 2 ? 1 : -1), 70 + i);
      }
      Efeitos.terraPoeira(ctx, q.x, q.y - q.s * 0.3, q.s * 1.6, api.clamp(dep / 1.6, 0, 0.99), { semente: 63 });
    }
    ctx.restore();
    frio(ctx, 0.3);
  }

  function tomadaRafael(ctx, api) {
    const T = tempoTomada(api, ['rafael', 'buraco', 'coluna'], [2.5, 3, 3]);
    const B = Cenarios3D.patio.bueiro, hx = B.x, hz = B.z + 0.22;
    const L = [-0.7, 2.0];
    const Tb = T - 2.5, Tc = T - 5.5;
    const forca = Tb < 0 ? 2 : Tc < 0 ? 4 + 14 * Math.exp(-Math.max(0, Tb - 0.3) * 2) : 7;
    const [tx, ty] = api.tremor(forca);
    ctx.save(); ctx.translate(tx, ty);
    const cam = api.orbita({
      alvo: chave(T, [[0, [-0.45, 1.35, 2.5]], [2.5, [0.1, 1.2, 2.9]], [8.5, [0.2, 1.25, 2.95]]]),
      raio: chave(T, [[0, 1.5], [2.5, 2.6], [5.5, 3.1], [8.5, 3.5]]),
      ang: chave(T, [[0, 0.25], [2.6, 0.08], [4.2, -0.55], [8.5, -0.95]]), altura: chave(T, [[0, 1.55], [8.5, 1.45]]), f: 1100, ySalvo: 1000, nevoa: Cenarios3D.patio.nevoa,
    });
    Cenarios3D.patio.desenhar(ctx, cam, {});
    // buraco abrindo no bueiro e fechando no fim
    const abre = Tb < 0 ? 0 : api.ease.entra(api.clamp((Tb - 0.3) / 0.9, 0, 1));
    const R = (0.15 + abre * 0.85) * (1 - 0.55 * api.ease.suave(api.clamp((Tc - 1.6) / 1.4, 0, 1)));
    if (Tb < 0) { const bq = cam.p(B.x, 0, B.z + 0.2); for (let i = 0; i < 3; i++) { const ph = (api.t * 0.8 + i / 3) % 1; Efeitos.terraPoeira(ctx, bq.x, bq.y - ph * bq.s * 0.3, bq.s * 0.45, ph, { semente: 50 + i }); } }
    const c0 = cam.p(hx, 0, hz);
    if (abre > 0) {
      const rnd = rng(88), pts = [];
      for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = R * (0.8 + rnd() * 0.35); pts.push(cam.p(hx + Math.cos(a) * r, 0.002, hz + Math.sin(a) * r * 0.8)); }
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
      const gr = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, R * c0.s * 1.1);
      gr.addColorStop(0, '#2A1206'); gr.addColorStop(0.6, '#120A0C'); gr.addColorStop(1, '#3A2418');
      ctx.fillStyle = gr; ctx.fill();
      Efeitos.erupcao(ctx, cam, hx, hz, Tc < 0 ? api.clamp((Tb - 0.3) / 0.8, 0, 1) : 0.6 + 0.3 * api.clamp(Tc / 0.9, 0, 1), api.t, { raio: R + 0.22, altura: Tc < 0 ? 0.7 : 1.4 });
    }
    // Rafael: corre até perto do Lucas, escorrega para a beira do buraco, a coluna o levanta
    const chega = api.ease.entra(api.clamp(T / 1.3, 0, 1));
    const desliza = api.ease.suave(api.clamp((Tb - 0.5) / 1.8, 0, 1));
    const Rf = [api.lerp(1.0, hx + 0.55, desliza) + (1 - chega) * 0.2, api.lerp(6.0, hz + 0.35, chega) - desliza * 0.15];
    const exR = T < 1.4 ? 'preocupado' : Tb < 0.3 ? 'preocupado' : Tc < 0 ? 'medo' : 'medo';
    const sobe = api.ease.entra(api.clamp((Tc - 0.2) / 1.2, 0, 1));
    let topo = null;
    if (Tc > 0) {
      const b = cam.p(hx, -0.4, hz); topo = cam.p(hx, -0.4 + sobe * 1.05, hz);
      if (!b.atras) Efeitos.colunaTerra(ctx, b.x, b.y, topo.y, b.s * 0.6, api.t);
    }
    const posR = Tc > 0 ? [api.lerp(Rf[0], hx, api.clamp(Tc / 0.5, 0, 1)), api.lerp(Rf[1], hz, api.clamp(Tc / 0.5, 0, 1))] : Rf;
    const yR = Tc > 0 ? Math.max(0, -0.4 + sobe * 1.05) : 0;
    const qR = cam.p(posR[0], yR, posR[1]);
    ctx.save(); ctx.translate(qR.x, qR.y); ctx.rotate(Tc < 0 ? -0.25 * desliza : 0); ctx.translate(-qR.x, -qR.y);
    if (T < 1.3) api.personagem3d(cam, { ...RAFAEL, pose: {}, expressao: exR, voz: 'rafael' }, posR[0], posR[1], 1.8, { caminharFrontal: T, velocidade: 1.6, olhaPara: L });
    else api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: exR, voz: 'rafael' }, posR[0], posR[1], 1.8, { olhaPara: L, vida: Tb > 0 ? 2.5 : 1.4, y: yR });
    ctx.restore();
    // Lucas: assustado → estende a mão com raiva → determinado
    const exL = Tb < 0 ? 'medo' : Tc < 0 ? 'espanto' : Tc < 1.3 ? 'raiva' : 'determinado';
    const poder = api.ease.suave(api.clamp((Tc + 0.2) / 0.5, 0, 1));
    const rig = api.personagem3d(cam, { ...LUCAS, pose: 'parado', pose2: 'poder', mistura: poder, expressao: exL }, L[0], L[1], 1.75, { luz: LUZ_DIA, olhaPara: posR, vida: 1.4 });
    ctx.restore();
    frio(ctx, 0.3);
    ctx.save(); ctx.translate(tx, ty);
    if (abre > 0) brilho(ctx, c0.x, c0.y, R * c0.s * 1.6, 0.3 * abre);
    if (Tc > 0 && topo) {
      const m = maoDoRig(rig);
      if (m.x > -1000) { Efeitos.fluxoTerra(ctx, [m.x, m.y], [topo.x, topo.y + 40], api.t, { forca: 0.9 }); brilho(ctx, m.x, m.y, 200, 0.45); }
    }
    ctx.restore();
  }

  function tomadaSozinho(ctx, api) {
    const T = tempoTomada(api, ['sozinho', 'racha'], [3, 2.5]);
    const Tr = T - 3.0;
    const [tx, ty] = api.tremor(Tr < 0 ? 0 : 8 + 14 * api.clamp(Tr / 2.5, 0, 1));
    ctx.save(); ctx.translate(tx, ty);
    const L = [0, 4.2];
    const cam = api.orbita({
      alvo: [L[0], chave(T, [[0, 1.25], [3, 0.6], [5.5, 1.0]]), L[1]], raio: chave(T, [[0, 2.2], [3, 6.5], [5.5, 2.3]]),
      ang: chave(T, [[0, -0.1], [3, 0.6], [5.5, 0.95]]), altura: chave(T, [[0, 1.5], [3, 3.6], [5.5, 1.2]]), f: 1150, ySalvo: 1000, nevoa: Cenarios3D.patio.nevoa,
    });
    Cenarios3D.patio.desenhar(ctx, cam, {});
    const g = Tr < 0 ? 0 : api.clamp(Tr / 2.2, 0, 1);
    const rach = () => {
      Efeitos.rachadura(ctx, cam, L, [2.8, 7.5], 1, api.t, { largura: 0.06 + 0.06 * g, semente: 51 });
      Efeitos.rachadura(ctx, cam, L, [-3.2, 6.5], 1, api.t, { largura: 0.05 + 0.04 * g, semente: 52 });
      Efeitos.rachadura(ctx, cam, L, [0.9, 10], 1, api.t, { largura: 0.07 + 0.06 * g, semente: 53 });
      Efeitos.rachadura(ctx, cam, L, [1.6, 2.4], 1, api.t, { largura: 0.04, semente: 54 });
      if (g > 0) { Efeitos.rachadura(ctx, cam, [3.5, 6], L, g, api.t, { largura: 0.09, zigue: 0.7, semente: 45 }); Efeitos.rachadura(ctx, cam, [-3.5, 8], L, api.clamp(g * 1.3 - 0.2, 0, 1), api.t, { largura: 0.07, semente: 47 }); }
    };
    rach();
    // Rafael indo embora correndo, de perfil
    const Xr = 0.9 + T * 2.4;
    if (T < 3.2) api.personagem3d(cam, { ...RAFAEL, pose: 'andando', expressao: 'medo' }, Xr, 5.2, 1.8, { caminhar: T, velocidade: 1.8, rumo: -Math.PI / 2 });
    const exL = Tr < 0 ? 'triste' : Tr < 0.6 ? 'espanto' : 'medo';
    api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: exL }, L[0], L[1], 1.75, { vida: Tr < 0 ? 0.8 : 2.5, rumo: chave(T, [[0, 0], [3, 0.3], [5.5, 0.75]]) });
    ctx.restore();
    frio(ctx, Tr < 0 ? 0.5 : 0.45);
    ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.3 + 0.15 * g, rach); ctx.restore();
  }

  window.PLANOS = {
    // CAPA DO REELS/TIKTOK (não entra no vídeo; gerar com motor/quadro.js). Área segura: título e rosto entre y 280 e 1640
    // (a grade do Instagram corta em 4:5 e a do TikTok em 3:4 a partir do centro).
    capaReels(ctx, u, d, api) {
      const L = [0.1, 2.4];
      const cam = api.orbita({ alvo: [L[0] + 0.3, 1.25, L[1]], raio: 1.6, ang: -0.28, altura: 0.95, f: 1250, ySalvo: 1290, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t });
      const rach = () => {
        for (const [para, sem, lg] of [[[1.8, 3.4], 61, 0.025], [[-1.7, 3.6], 62, 0.022], [[0.9, 4.7], 63, 0.025], [[-0.7, 4.7], 64, 0.02]]) Efeitos.rachadura(ctx, cam, [L[0], L[1] + 0.25], para, 1, api.t, { largura: lg, zigue: 0.6, semente: sem });
      };
      rach();
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, L[0], L[1], 1.75, { luz: LUZ_FRIA, parado: true });
      frio(ctx, 0.72);
      aceso(ctx, 0.3, rach);
      const a = maoDoRig(rig), b = maoDoRig(rig, 'e');
      const ex = (a.x + b.x) / 2 + 40, ey = (a.y + b.y) / 2 - 10;
      brilho(ctx, ex, ey, 760, 0.55);
      Efeitos['poder-terra'](ctx, ex, ey, 290, { t: api.t });
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.6);
      // faixa escura atrás do título, para ler bem em qualquer tela
      const g = ctx.createLinearGradient(0, 120, 0, 900);
      g.addColorStop(0, 'rgba(6,8,22,0.75)'); g.addColorStop(0.7, 'rgba(6,8,22,0.35)'); g.addColorStop(1, 'rgba(6,8,22,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
      api.texto('E SE VOCÊ', 540, 330, 104);
      api.texto('ACORDASSE', 540, 450, 126);
      api.texto('CONTROLANDO', 540, 575, 118);
      ctx.save(); ctx.translate(540, 730); ctx.rotate(-0.035); ctx.translate(-540, -730);
      api.texto('A TERRA?', 540, 730, 196, { cor: Estilo.base.mostarda });
      ctx.restore();
      // selo PARTE 1
      ctx.save(); ctx.translate(540, 1560);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-220, -66, 440, 132, 66); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.font = '900 76px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('PARTE 1', 0, 5);
      ctx.restore();
    },

    // 0–2 s: capa com a premissa — a câmera gira devagar em volta do Lucas com a terra nas mãos
    capa(ctx, u, d, api) {
      const L = [0, 2.4];
      const cam = api.orbita({ alvo: [L[0] + 0.25, 1.3, L[1]], raio: 1.75, ang: api.lerp(-0.4, -0.05, u / d), altura: 1.3, f: 1250, ySalvo: 1150, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: 'determinado' }, L[0], L[1], 1.75, { luz: LUZ_FRIA, rumo: -0.95, vida: 1.5 });
      frio(ctx, 0.6);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.5);
      const a = maoDoRig(rig), b = maoDoRig(rig, 'e');
      const ex = (a.x + b.x) / 2 + 60, ey = (a.y + b.y) / 2;
      brilho(ctx, ex, ey, 520, 0.35);
      Efeitos['poder-terra'](ctx, ex, ey, 260, { t: api.t });
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); zoom(ctx, 540, 380, k);
      api.texto('E SE VOCÊ', 540, 250, 92); api.texto('ACORDASSE', 540, 360, 92); api.texto('CONTROLANDO', 540, 470, 92);
      ctx.restore();
      const k2 = api.fase(0.25, 0.6, 'volta');
      ctx.save(); ctx.translate(540, 610); ctx.scale(k2, k2); ctx.rotate(-0.03); ctx.translate(-540, -610);
      api.texto('A TERRA?', 540, 610, 150, { cor: Estilo.base.mostarda });
      ctx.restore();
    },

    // prólogo: a rua à noite tremendo; luzes piscando; uma rachadura acesa corre pelo asfalto
    noite(ctx, u, d, api) {
      const [tx, ty] = api.tremor(7);
      ctx.save(); ctx.translate(tx, ty);
      const sobe = api.fase(0, d, 'suave');
      const cam = api.camera({ f: 1150, x: 0.3, y: 1.4 + sobe * 1.4, z: u * 0.6, cy: 980 + sobe * 260, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      const rach = () => {
        Efeitos.rachadura(ctx, cam, [0.3, 7.5], [-0.8, 30], api.fase(0.1, d * 0.9), api.t, { largura: 0.07, zigue: 0.8, semente: 17 });
        Efeitos.rachadura(ctx, cam, [0.0, 10], [2.6, 18], api.fase(0.6, d), api.t, { largura: 0.04, semente: 19 });
      };
      rach();
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.6 });
      const pisca = Math.sin(api.t * 23) > 0.55 && Math.sin(api.t * 6.5) > 0 ? 0.15 : 0;
      frio(ctx, 0.95 - pisca);
      ctx.fillStyle = `rgba(4,6,22,${0.4 - pisca})`; ctx.fillRect(-50, -50, W + 100, H + 100);
      // janelas acesas das casas e postes (luz amarela fraca, piscando)
      for (const [X, Y, Z] of [[-6.6, 2.2, 8], [-6.6, 2.2, 19], [6.6, 2.2, 13], [6.6, 2.2, 25], [-3.9, 4.6, 12], [3.9, 4.6, 22]]) {
        const q = cam.p(X, Y, Z); if (q.s > 0) brilho(ctx, q.x, q.y, q.s * 1.2, 0.25 + pisca * 2, '255,200,120');
      }
      aceso(ctx, 0.45, rach);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.6);
      ctx.restore();
    },

    // você acorda: close no Lucas deitado abrindo os olhos devagar; poeira do teto; batida de coração
    acorda(ctx, u, d, api) {
      const [tx, ty] = api.tremor(3);
      const z = api.lerp(1.0, 1.08, u / d);
      ctx.save(); ctx.translate(tx, ty); zoom(ctx, 540, 1000, z);
      fundo(ctx, api, 'quarto', { x: 1.0, y: 1.0, z: 0.9, cy: 900 }, 10);
      const rig = new Rig(criarLucas({}, 'perfil'));
      const abre = api.fase(0.5, 1.3, 'suave');
      rig.usarPose({ ...LUCAS_POSES.caido.angulos, cabeca: -6 + Math.sin(u * 2) * 1.5 });
      const base = u < 1.5 ? LUCAS_EXPRESSOES.cansado : LUCAS_EXPRESSOES.medo;
      rig.usarExpressao({ ...base, palpebra: Math.max(base.palpebra || 0, 1 - abre) });
      const tmp = api.camada().getContext('2d');
      rig.desenhar(tmp, 0, 0, 2300);
      const c = rig.pontoMundo('cabeca', [0, 0]);
      rig.desenhar(ctx, 600 - c.x, 1050 - c.y, 2300);
      api.rosto(600, 1000, 360);
      ctx.restore();
      frio(ctx, 0.6);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.7);
    },

    // o despertador dispara, tremendo junto com o criado-mudo
    despertador(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.1, u / d);
      ctx.save(); zoom(ctx, 540, 1100, z);
      const cam = fundo(ctx, api, 'quarto', { x: 1.2, y: 1.0, z: 1.2, cy: 900 }, 9);
      const cl = api.camada(), gl = cl.getContext('2d'), q = cam.p(1.55, 0.55, 2.4);
      const rig = new Rig(criarLucas({}, 'perfil'));
      rig.usarPose({ ...LUCAS_POSES.caido.angulos, _desloca: [0, 2.45], cabeca: -6 + Math.sin(u * 2) * 1.5 });
      rig.usarExpressao({ ...LUCAS_EXPRESSOES.medo });
      rig.desenhar(gl, q.x + 330, q.y + 40, 1.75 * q.s);
      api.desfocar(cl, 4);
      ctx.restore();
      const [tx, ty] = api.tremor(7);
      Cena.objeto(ctx, 'despertador', 400 + tx, 1530 + ty, 620, { tocando: true, t: u, hora: 6.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      frio(ctx, 0.55);
    },

    // um tapa... silêncio... impacto
    tapa(ctx, u, d, api) {
      const bate = 0.45, depois = Math.max(0, u - bate);
      const [tx, ty] = u > bate ? api.tremor(24 * Math.exp(-depois * 3.5)) : [0, 0];
      ctx.save(); ctx.translate(tx, ty);
      fundo(ctx, api, 'quarto', { x: 1.2, y: 1.0, z: 1.25, cy: 900 }, 10);
      Efeitos.impacto(ctx, camEm(400, 1560, 520), 0, 2, api.clamp(depois / 1.3, 0, 0.99), api.t, { tamanho: 1.0 });
      Cena.objeto(ctx, 'despertador', 400, 1530 + (u > bate ? Math.sin(depois * 30) * 6 * Math.exp(-depois * 5) : 0), 620, { tocando: u < bate, t: u, hora: 6.5 });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const desce = api.fase(0.12, bate, 'sai');
      Maos.desenhar(ctx, 470, api.lerp(-300, 900, desce), 330, { ang: Math.PI * 0.94, curl: [0.2, 0.15, 0.1, 0.15, 0.2], abre: 0.7 });
      ctx.restore();
      frio(ctx, 0.55);
      if (u > bate) brilho(ctx, 400, 1560, 600 * Math.exp(-depois * 2), 0.5 * Math.exp(-depois * 3));
    },

    // TOMADA DO QUARTO (treme + rachadura, 5 s sem corte): a casa treme e a câmera desce girando em volta do Lucas
    // enquanto a rachadura nasce embaixo da cama e corre até os pés dele; ele recua e olha para ela
    treme(ctx, u, d, api) { tomadaQuarto(ctx, api); },

    rachadura(ctx, u, d, api) { tomadaQuarto(ctx, api); },

    // suas mãos estão quentes e tremendo: brilho nas linhas da palma, no ritmo do coração
    maos(ctx, u, d, api) {
      const pu = pulso(api, u);
      fundo(ctx, api, 'quarto', { x: 0.2, y: 1.3, z: 0.6, cy: 1000 }, 16);
      const tre = (k) => Math.sin(api.t * 41 + k) * 7 + Math.sin(api.t * 29 + k * 2) * 4;
      const sobe = api.lerp(0, -90, api.fase(0, d, 'suave'));
      const curl = [0, 1, 2, 3, 4].map((i) => 0.25 + 0.08 * Math.sin(api.t * 9 + i));
      const me = Maos.desenhar(ctx, 270 + tre(1), 2000 + sobe + tre(2), 360, { ang: -0.15, curl, abre: 0.6, espelhar: true });
      const md = Maos.desenhar(ctx, 820 + tre(3), 1980 + sobe + tre(4), 360, { ang: 0.15, curl, abre: 0.6 });
      frio(ctx, 0.6);
      for (const [m, s] of [[me, 3], [md, 5]]) {
        brilho(ctx, m.palma.x, m.palma.y, 260 * (0.7 + 0.5 * pu), 0.3 + 0.45 * pu);
        veias(ctx, m.palma.x, m.palma.y, 420, 0.5 + 0.5 * pu, s);
      }
    },

    // a terra do vaso vem até você: sobe em fios na direção da mão do Lucas
    vaso(ctx, u, d, api) {
      const p = Cenarios3D.quarto.pontos.vaso;
      const cam = api.camera({ f: 1500, x: -1.15 + u * 0.05, y: 1.4, z: 1.25 + u * 0.08, yaw: -0.62, cy: 960, nevoa: Cenarios3D.quarto.nevoa });
      const prog = api.fase(0.1, d);
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, vasoTerra: 1 - prog * 0.7 });
      const entra = api.fase(0, 0.8, 'entra');
      const m = Maos.desenhar(ctx, api.lerp(1250, 930, entra) + Math.sin(api.t * 30) * 4, 1780, 330, { ang: -1.0, curl: [0.2, 0.1, 0.15, 0.2, 0.3], abre: 0.7 });
      const a = cam.p(p[0], p[1] - 0.08, p[2]);
      const alvo = [m.palma.x - 120, m.palma.y - 160];
      Efeitos.terraSubindo(ctx, [a.x, a.y], [api.lerp(a.x, alvo[0], prog), api.lerp(a.y - a.s * 0.2, alvo[1], prog)], a.s * 0.6, prog * 0.95, api.t);
      frio(ctx, 0.5);
      for (const pt of m.pontas.slice(1, 4)) Efeitos.fluxoTerra(ctx, [pt.x, pt.y], alvo, api.t, { forca: 0.5 * prog });
    },

    // você fecha a mão... e ela obedece (esfera pulsando com o coração)
    dedos(ctx, u, d, api) {
      const pu = pulso(api, u);
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); zoom(ctx, 540, 1100, z);
      fundo(ctx, api, 'quarto', { x: -0.6, y: 1.3, z: 0.4, cy: 1050 }, 16);
      ctx.restore();
      const fecha = api.fase(1.5, 2.4, 'suave');
      const curl = [0, 1, 2, 3, 4].map((i) => api.clamp(0.25 + 0.25 * Math.sin(api.t * 7 + i * 0.9) + fecha * 0.75, 0, 1));
      const mao = Maos.desenhar(ctx, 560 + Math.sin(api.t * 1.3) * 12, 1950, 560, { ang: -0.12 + Math.sin(api.t * 1.6) * 0.04, curl, abre: 0.8 - fecha * 0.6 });
      frio(ctx, 0.6);
      const cx = mao.palma.x + 40, cy = mao.palma.y - 520 + fecha * 120;
      const tam = 0.35 + 0.65 * api.fase(0.1, 1.6);
      for (const pt of mao.pontas.slice(0, 4)) Efeitos.fluxoTerra(ctx, [pt.x, pt.y], [cx, cy], api.t, { forca: 0.9 - fecha * 0.4 });
      brilho(ctx, cx, cy, 450 * (0.8 + 0.4 * pu), 0.3 + 0.4 * pu);
      Efeitos['poder-terra'](ctx, cx, cy, 300 * (1 - fecha * 0.25) * (1 + 0.06 * pu), { t: api.t, tamanho: tam });
    },

    // TOMADA DA MÃE (mae + susto + mae2 + mentira, 10 s sem corte): a câmera gira em volta do Lucas e revela a mãe na
    // porta; ele vira de corpo inteiro para ela, a terra cai, a câmera vai até a mãe e volta para ele mentindo
    mae(ctx, u, d, api) { tomadaMae(ctx, api); },

    susto(ctx, u, d, api) { tomadaMae(ctx, api); },

    mae2(ctx, u, d, api) { tomadaMae(ctx, api); },

    mentira(ctx, u, d, api) { tomadaMae(ctx, api); },

    // TOMADA DA RUA (rua + onda, 5 s): a câmera segue o Lucas correndo e, quando a onda o leva, gira para o lado
    rua(ctx, u, d, api) { tomadaRua(ctx, api); },

    onda(ctx, u, d, api) { tomadaRua(ctx, api); },

    // TOMADA DO PORTÃO (portao + olhares, 5 s): ele cai, a câmera sobe girando e revela os alunos olhando
    portao(ctx, u, d, api) { tomadaPortao(ctx, api); },

    olhares(ctx, u, d, api) { tomadaPortao(ctx, api); },

    // TOMADA DO RAFAEL (rafael + buraco + coluna, 8,5 s): por cima do ombro do Lucas; o chão cede e a câmera gira
    // para o lado e mostra os dois; a coluna sobe com o Rafael
    rafael(ctx, u, d, api) { tomadaRafael(ctx, api); },

    buraco(ctx, u, d, api) { tomadaRafael(ctx, api); },

    coluna(ctx, u, d, api) { tomadaRafael(ctx, api); },

    // Rafael: "Lucas... o que é você?" — recuando; a câmera gira um pouco em volta dele (fundo passa atrás)
    amigo(ctx, u, d, api) {
      const k = api.fase(0, d, 'suave');
      ctx.save(); zoom(ctx, 540, 900, api.lerp(1.08, 1.0, k));
      fundo(ctx, api, 'patio', { x: 0.5 + k * 0.8, y: 1.6, z: 1.0, yaw: api.lerp(0.25, -0.15, k), cy: 950 }, 14);
      closeGira(api, { ...RAFAEL, pose: 'parado', expressao: 'medo', voz: 'rafael' }, 540 + api.lerp(-30, 60, k), 1050, 560, api.lerp(-0.5, -0.8, k), { vida: 1.8 });
      ctx.restore();
      frio(ctx, 0.4);
    },

    // Lucas: "Eu não sei o que tá acontecendo comigo." — a câmera gira devagar em volta dele
    resposta(ctx, u, d, api) {
      const pu = pulso(api, u), k = api.fase(0, d, 'suave');
      ctx.save(); zoom(ctx, 540, 1000, api.lerp(1, 1.06, k));
      fundo(ctx, api, 'patio', { x: -0.4 - k * 0.8, y: 1.5, z: 0.6, yaw: api.lerp(-0.3, 0.15, k), cy: 950 }, 14);
      closeGira(api, { ...LUCAS, pose: 'parado', expressao: { ...LUCAS_EXPRESSOES.triste, olhar: [0, 0.014] }, voz: 'lucas' }, 540, 950, 520, api.lerp(0.48, 0.8, k));
      ctx.restore();
      const tre = (j) => Math.sin(api.t * 37 + j) * 5;
      const me = Maos.desenhar(ctx, 330 + tre(1), 2050 + tre(2), 330, { ang: 0.35, curl: [0.3, 0.25, 0.25, 0.3, 0.35], abre: 0.5, espelhar: true });
      const md = Maos.desenhar(ctx, 760 + tre(3), 2040 + tre(4), 330, { ang: -0.35, curl: [0.3, 0.25, 0.25, 0.3, 0.35], abre: 0.5 });
      frio(ctx, 0.4);
      for (const [m, s] of [[me, 7], [md, 8]]) { brilho(ctx, m.palma.x, m.palma.y, 180, 0.15 + 0.3 * pu); veias(ctx, m.palma.x, m.palma.y, 300, 0.3 + 0.4 * pu, s); }
    },

    // TOMADA FINAL DO PÁTIO (sozinho + racha, 5,5 s): a câmera se afasta para o alto girando, e mergulha de volta nele
    sozinho(ctx, u, d, api) { tomadaSozinho(ctx, api); },

    racha(ctx, u, d, api) { tomadaSozinho(ctx, api); },

    // e lá embaixo... alguma coisa acordou com você: mergulho na rachadura, brilho pulsando como um coração
    fundo(ctx, u, d, api) {
      const pu = pulso(api, u);
      const [tx, ty] = api.tremor(3 + 4 * pu);
      ctx.save(); ctx.translate(tx, ty);
      abismo(ctx, api, api.fase(0, d, 'entra'), pu);
      ctx.restore();
    },

    // e bate no mesmo ritmo que o seu coração: alterna o brilho lá embaixo e o peito do Lucas
    ritmo(ctx, u, d, api) {
      const pu = pulso(api, u);
      const nBat = api.batidas.filter((b) => b <= u).length;
      if (nBat % 2 === 0) {
        const [tx, ty] = api.tremor(4 + 6 * pu);
        ctx.save(); ctx.translate(tx, ty); abismo(ctx, api, 1, pu, u * 0.4); ctx.restore();
        return;
      }
      const z = 1.04 + pu * 0.03;
      ctx.save(); zoom(ctx, 540, 1000, z);
      fundo(ctx, api, 'patio', { x: -0.4, y: 1.5, z: 0.6, cy: 950 }, 16, {}, { frio: 0.8 });
      const rig = close(api, { ...LUCAS, pose: 'parado', expressao: u < 1.5 ? 'espanto' : 'medo' }, 540, 980, 560, { luz: LUZ_FRIA });
      ctx.restore();
      frio(ctx, 0.35);
      const p = rig.pontoMundo('tronco', [0, 0.25]);
      brilho(ctx, p.x, p.y, 380 * (0.6 + 0.6 * pu), 0.25 + 0.6 * pu);
      veias(ctx, p.x, p.y, 520, 0.4 + 0.6 * pu, 91);
    },

    // cartela final: PARTE 1 + chamada para seguir
    parte(ctx, u, d, api) {
      const z = api.lerp(1.0, 1.06, u / d);
      ctx.save(); zoom(ctx, 540, 960, z);
      fundo(ctx, api, 'patio', { x: 0, y: 1.4, z: -0.5 + u * 0.2, cy: 960 }, 18, {}, { frio: 0.8 });
      ctx.restore();
      ctx.fillStyle = 'rgba(10,8,16,0.55)'; ctx.fillRect(0, 0, W, H);
      brilho(ctx, 540, 1250, 700, 0.18 + 0.06 * Math.sin(api.t * 4));
      const k = api.fase(0, 0.35, 'volta');
      ctx.save(); zoom(ctx, 540, 760, k);
      api.texto('PARTE', 540, 680, 120); api.texto('1', 540, 850, 230, { cor: Estilo.base.mostarda });
      ctx.restore();
      const k2 = api.fase(0.45, 0.8, 'volta');
      ctx.save(); zoom(ctx, 540, 1130, k2);
      api.texto('SEGUE PRA VER', 540, 1090, 84); api.texto('A PARTE 2', 540, 1190, 96, { cor: Estilo.base.mostarda });
      ctx.restore();
      // botão de seguir: aparece e pulsa de leve (sem mão clicando)
      const k3 = api.fase(0.9, 1.2, 'volta'), pulsoB = 1 + Math.sin(api.t * 6) * 0.04;
      ctx.save(); ctx.translate(540, 1420); ctx.scale(k3 * pulsoB, k3 * pulsoB);
      ctx.fillStyle = '#D23A42'; ctx.beginPath(); ctx.roundRect(-230, -62, 460, 124, 62); ctx.fill();
      ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('+ SEGUIR', 0, 4);
      ctx.restore();
    },
  };
})();

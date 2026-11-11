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

  window.PLANOS = {
    // 0–2 s: capa com a premissa (quarto escuro, pedras em volta das mãos)
    capa(ctx, u, d, api) {
      const z = api.lerp(1, 1.06, u / d);
      ctx.save(); zoom(ctx, 540, 1100, z);
      fundo(ctx, api, 'quarto', { x: 0.2, y: 1.2, z: -0.3, cy: 1100 }, 10);
      const rig = api.personagem({ ...LUCAS, pose: 'poder', expressao: 'determinado' }, 330, 2350, 1450, { luz: LUZ_FRIA });
      ctx.restore();
      frio(ctx, 0.6);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 0.5);
      const a = maoDoRig(rig), b = maoDoRig(rig, 'e');
      const ex = Math.min(800, (a.x + b.x) / 2 + 90), ey = (a.y + b.y) / 2;
      brilho(ctx, ex, ey, 520, 0.35);
      Efeitos['poder-terra'](ctx, ex, ey, 280, { t: api.t });
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

    // a casa inteira treme: livros caem, poeira do teto
    treme(ctx, u, d, api) {
      const [tx, ty] = api.tremor(20);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1300, x: 0.0, y: 1.3, z: 0.3 + u * 0.1, cy: 950, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 1.6, livrosCaindo: api.fase(0.1, 1.6) });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: u < 0.7 ? 'espanto' : 'medo' }, 0.05, 2.0, 1.75, { luz: LUZ_FRIA, vida: 3 });
      ctx.restore();
      frio(ctx, 0.6);
      Efeitos.poeiraTeto(ctx, W, H, api.t, 1.4);
    },

    // uma rachadura nasce embaixo da cama e corre até os pés do Lucas, que recua (reação em três tempos)
    rachadura(ctx, u, d, api) {
      const [tx, ty] = api.tremor(4);
      ctx.save(); ctx.translate(tx, ty);
      const desce = api.fase(0, 1.2, 'suave'), chega = api.fase(1.0, d, 'suave');
      const cam = api.camera({ f: 1250, x: 0.3, y: api.lerp(1.35, 0.8, desce), z: -0.2 + u * 0.1 + chega * 0.25, cy: api.lerp(950, 1060, desce), nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { t: api.t, tremor: 0.4 });
      const rach = () => {
        Efeitos.rachadura(ctx, cam, [0.9, 1.6], [-0.3, 2.05], api.fase(0.1, 1.3, 'entra'), api.t, { largura: 0.05, zigue: 0.6, semente: 23 });
        Efeitos.rachadura(ctx, cam, [0.9, 1.7], [0.35, 3.1], api.fase(0.5, 1.8), api.t, { largura: 0.03, semente: 29 });
      };
      rach();
      const Z = 2.15 + api.fase(0.9, 1.6, 'entra') * 0.35;
      const expr = u < 0.4 ? { ...LUCAS_EXPRESSOES.espanto, olhar: [0, 0.012] } : 'medo';
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: expr }, -0.4, Z, 1.75, { luz: LUZ_FRIA, vida: 2.2 });
      ctx.restore();
      frio(ctx, 0.65);
      ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.35, rach); ctx.restore();
    },

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

    // a mãe abre a porta de repente: "Lucas?! Que barulho foi esse?"
    mae(ctx, u, d, api) {
      const cam = api.camera({ f: 1500, x: 1.2, y: 1.4, z: 3.0 + u * 0.15, cy: 960, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: api.fase(0, 0.25, 'entra'), t: api.t });
      api.personagem3d(cam, { ...MAE, pose: 'parado', expressao: 'preocupado', voz: 'mae' }, 1.3, 4.55, 1.65, { luz: LUZ_FRIA });
      frio(ctx, 0.5);
    },

    // a terra desaba no tapete; Lucas congela
    susto(ctx, u, d, api) {
      const cam = api.camera({ f: 1250, x: 0.35, y: 1.35, z: 0.4 + u * 0.12, cy: 940, nevoa: Cenarios3D.quarto.nevoa });
      Cenarios3D.quarto.desenhar(ctx, cam, { portaAberta: 1, t: api.t });
      api.personagem3d(cam, { ...MAE, pose: 'parado', expressao: 'preocupado' }, 1.3, 4.5, 1.65, { luz: LUZ_FRIA });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'medo' }, 0.1, 2.0, 1.75, { luz: LUZ_FRIA, vida: 0.4 });
      const m = rig.pontoMundo('mao_e', [0, 0.3]), chao = cam.p(0.3, 0, 1.9);
      const cai = api.fase(0.4, 1.6);
      if (cai > 0.01) Efeitos.terraCaindo(ctx, m.x + 40, m.y - 60, chao.y, 160, cai);
      frio(ctx, 0.55);
      if (cai <= 0.01) Efeitos['poder-terra'](ctx, m.x + 40, m.y - 60, 120, { t: api.t, tamanho: 0.8 });
    },

    // close na mãe: olha a terra no chão, depois olha para ele, desconfiada (três tempos)
    mae2(ctx, u, d, api) {
      const z = api.lerp(1, 1.06, api.fase(0.9, d));
      ctx.save(); zoom(ctx, 540, 900, z);
      fundo(ctx, api, 'quarto', { x: 1.3, y: 1.5, z: 2.4, cy: 950 }, 14, { portaAberta: 1 });
      const P = EXPRESSOES_PADRAO;
      const expr = u < 0.5 ? { ...P.preocupado, olhar: [0, 0.016] } : u < 0.9 ? { ...P.preocupado, olhar: [0.01, 0.006] } : { ...P.serio };
      close(api, { ...MAE, pose: 'parado', expressao: expr, voz: 'mae', ...(u > 0.5 && u < 0.9 ? { vistaCabeca: 'tq' } : {}) }, 540, 1050, 560, { luz: LUZ_FRIA });
      ctx.restore();
      frio(ctx, 0.5);
    },

    // "Não é nada, mãe!" — sorriso forçado e suor; atrás, a rachadura ainda brilha embaixo da cama
    mentira(ctx, u, d, api) {
      const pu = pulso(api, u);
      const z = api.lerp(1, 1.05, u / d) + pu * 0.01;
      ctx.save(); zoom(ctx, 540, 1000, z);
      fundo(ctx, api, 'quarto', { x: -0.8, y: 1.2, z: 0.0, yaw: 0.55, cy: 980 }, 12, {}, {
        frio: 0.7,
        depois: (g, cam) => aceso(g, 1, () => Efeitos.rachadura(g, cam, [0.9, 1.35], [-0.35, 2.5], 1, api.t, { largura: 0.09, zigue: 0.6, semente: 23 })),
      });
      const forcado = { olhar: [0.012, 0], palpebra: 0.1, pupila: 0.75, sobrancelha: { y: -0.04, ang: 16 }, boca: { tipo: 'aberta', curva: 1.3, abertura: 0.03, largura: 0.085 }, gota: true };
      close(api, { ...LUCAS, pose: 'parado', vista: 'tq', espelhar: true, expressao: forcado, voz: 'lucas' }, 560, 1080, 560, { luz: LUZ_FRIA });
      ctx.restore();
      frio(ctx, 0.3);
    },

    // você foge... e cada passo racha a rua
    rua(ctx, u, d, api) {
      const zc = -1.2 + u * 2.2;
      const [tx, ty] = api.tremor(5);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1150, x: 0.35, y: 1.35, z: zc, cy: 980, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      const X = 0.45, Z = zc + 2.1;
      const rachas = [];
      [0.5, 1.05, 1.6, 2.15].forEach((tp, i) => {
        if (u < tp) return;
        const Zp = -1.2 + tp * 2.2 + 2.2, xs = X + (i % 2 ? 0.12 : -0.12), lado = i % 2 ? 1 : -1;
        rachas.push(() => Efeitos.rachadura(ctx, cam, [xs, Zp], [xs + lado * 1.8, Zp + 0.8], api.clamp((u - tp) / 0.5, 0, 1), api.t, { largura: 0.05, zigue: 0.6, semente: 31 + i }));
        Efeitos.impacto(ctx, cam, xs, Zp, api.clamp((u - tp) / 0.8, 0, 0.99), api.t, { tamanho: 0.45 });
      });
      rachas.forEach((f) => f());
      api.personagem3d(cam, { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: 'parado', registroPoses: 'POSES_PADRAO', vista: 'tq', espelhar: true, expressao: u > 0.8 ? 'espanto' : 'neutro' }, 2.6, 6.5, 1.78);
      api.personagem3d(cam, { ...LUCAS, pose: {}, vista: 'costas', expressao: 'medo' }, X, Z, 1.75, { caminharFrontal: u, velocidade: 1.8 });
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.6 });
      ctx.restore();
      frio(ctx, 0.3);
      ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.3, () => rachas.forEach((f) => f())); ctx.restore();
    },

    // você tenta parar. A terra não para: a onda arrasta o Lucas sem controle
    onda(ctx, u, d, api) {
      const zc = -1 + u * 6.5;
      const [tx, ty] = api.tremor(9);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1100, x: 0.2 + Math.sin(u * 2) * 0.08, y: 1.9, z: zc, cy: 1050, nevoa: Cenarios3D.rua.nevoa });
      Cenarios3D.rua.desenhar(ctx, cam, {});
      api.personagem3d(cam, { fabrica: 'criarPersonagem', opcoes: { nome: 'Vizinho', altura: 5.9, pele: 'pele2', cabelo: { estilo: 'liso-lateral', cor: 'cabCafe' }, top: { tipo: 'camiseta', cor: 'coral' }, calca: { tipo: 'reta', cor: 'pedra' } }, pose: 'parado', registroPoses: 'POSES_PADRAO', vista: 'frente', expressao: u > 0.9 ? 'medo' : 'neutro' }, 2.2, 11, 1.78);
      const Z = zc + 3.4;
      const crista = Efeitos.ondaTerra(ctx, cam, 0.35, Z, api.t, { largura: 2.6, altura: 1.2 });
      const q = cam.p(0.35, 0, Z);
      ctx.save(); ctx.translate(crista.x, crista.y); ctx.rotate(Math.sin(api.t * 5) * 0.12); ctx.translate(-crista.x, -crista.y);
      api.personagem({ ...LUCAS, pose: 'poder', vista: 'tq', espelhar: true, expressao: 'medo' }, crista.x, crista.y + q.s * 0.05, 1.75 * q.s, { vida: 2.5 });
      ctx.restore();
      Cenarios3D.rua.frente(ctx, cam, { arvoreX: -2.8 });
      ctx.restore();
      frio(ctx, 0.3);
    },

    // ela te joga no portão da escola: a onda desmancha e o Lucas cai na poeira
    portao(ctx, u, d, api) {
      const bate = 0.35, dep = Math.max(0, u - bate);
      const [tx, ty] = u > bate ? api.tremor(18 * Math.exp(-dep * 3)) : api.tremor(6);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1200, x: 0.0, y: api.lerp(1.1, 0.8, api.fase(0, d)), z: -0.6 + u * 0.18, cy: 1000, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const X = -0.1, Z = 2.4;
      if (u < bate + 0.25) {
        const crista = Efeitos.ondaTerra(ctx, cam, X, Z + (bate - u) * 4, api.t, { largura: 2.2, altura: 1.1 * (1 - api.fase(bate, bate + 0.25)) });
        if (u < bate) { const q = cam.p(X, 0, Z); api.personagem({ ...LUCAS, pose: 'poder', vista: 'tq', expressao: 'medo' }, crista.x, crista.y, 1.75 * q.s); }
      }
      if (u >= bate) {
        api.personagem3d(cam, { ...LUCAS, pose: 'caido', expressao: u < 1.5 ? 'cansado' : 'medo' }, X, Z, 1.75, { vida: 0.6 });
        // pedras rolando para fora do impacto
        const q = cam.p(X, 0, Z), rnd = rng(61);
        for (let i = 0; i < 10; i++) {
          const a = rnd() * Math.PI * 2, v = 0.6 + rnd() * 1.2, r = 0.05 + rnd() * 0.08;
          const dd = v * (1 - Math.exp(-dep * 2.5));
          const p = cam.p(X + Math.cos(a) * dd * 1.4, r, Z + Math.sin(a) * dd * 0.8);
          Efeitos._pedra(ctx, p.x, p.y, r * p.s, dep * 4 * (i % 2 ? 1 : -1), 70 + i);
        }
        Efeitos.terraPoeira(ctx, q.x, q.y - q.s * 0.3, q.s * 1.6, api.clamp(dep / 1.6, 0, 0.99), { semente: 63 });
      }
      ctx.restore();
      frio(ctx, 0.3);
    },

    // e todo mundo viu: alunos parados olhando; o Lucas levanta o olhar
    olhares(ctx, u, d, api) {
      const pu = pulso(api, u);
      const cam = fundo(ctx, api, 'patio', { x: 0.2, y: 1.5, z: -0.2 + u * 0.1, cy: 960 }, 6);
      api.personagem3d(cam, aluno(0, { expressao: 'espanto' }), -2.3, 5.6, 1.6);
      api.personagem3d(cam, aluno(1, { pose: 'acenando', expressao: 'espanto' }), -1.0, 6.6, 1.68);
      api.personagem3d(cam, aluno(2, { expressao: 'medo' }), 1.5, 6.1, 1.58);
      api.personagem3d(cam, aluno(3, { vista: 'tq', espelhar: true, expressao: 'espanto' }), 2.7, 5.2, 1.65);
      const z = api.lerp(1, 1.08, api.fase(0.9, d)) + pu * 0.008;
      ctx.save(); zoom(ctx, 540, 1400, z);
      const M = LUCAS_EXPRESSOES.medo;
      const expr = u < 0.45 ? { ...M, olhar: [0, 0.014] } : u < 1.2 ? { ...M, olhar: [-0.014, 0] } : { ...M, olhar: [0.014, -0.004] };
      close(api, { ...LUCAS, pose: 'parado', expressao: expr }, 540, 1300, 520, { luz: LUZ_DIA });
      ctx.restore();
      frio(ctx, 0.3);
    },

    // Rafael corre até o Lucas: "Cara... você tá pálido." Ao fundo, o bueiro solta poeira
    rafael(ctx, u, d, api) {
      const B = Cenarios3D.patio.bueiro;
      const cam = api.camera({ f: 1250, x: -0.2, y: 1.5, z: u * 0.1, cy: 960, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const bq = cam.p(B.x, 0, B.z + 0.2);
      for (let i = 0; i < 3; i++) { const ph = (api.t * 0.8 + i / 3) % 1; Efeitos.terraPoeira(ctx, bq.x, bq.y - ph * bq.s * 0.3, bq.s * 0.45, ph, { semente: 50 + i }); }
      const chega = api.fase(0, 1.3, 'entra'), Zr = api.lerp(5.2, 3.0, chega);
      if (u < 1.3) api.personagem3d(cam, { ...RAFAEL, pose: {}, vista: 'frente', expressao: 'preocupado', voz: 'rafael' }, 0.1, Zr, 1.8, { caminharFrontal: u, velocidade: 1.6 });
      else api.personagem3d(cam, { ...RAFAEL, pose: 'parado', expressao: 'preocupado', voz: 'rafael' }, 0.1, Zr, 1.8);
      api.personagem({ ...LUCAS, pose: 'parado', vista: 'costas', expressao: 'medo' }, 230, 2550, 1750, { semRosto: true });
      frio(ctx, 0.3);
    },

    // então o chão cede embaixo dele: o bueiro afunda e o Rafael escorrega para a beira do buraco
    buraco(ctx, u, d, api) {
      const B = Cenarios3D.patio.bueiro, hx = B.x, hz = B.z + 0.22;
      const dep = Math.max(0, u - 0.3);
      const [tx, ty] = api.tremor(4 + (u > 0.3 ? 16 * Math.exp(-dep * 2) : 0));
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1150, x: -0.1, y: 1.6, z: -0.4 + u * 0.12, cy: 960, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const abre = api.fase(0.3, 1.2, 'entra'), R = 0.15 + abre * 0.85;
      const borda = () => { const rnd = rng(88), pts = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = R * (0.8 + rnd() * 0.35); pts.push(cam.p(hx + Math.cos(a) * r, 0.002, hz + Math.sin(a) * r * 0.8)); } return pts; };
      const pts = borda();
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
      const c0 = cam.p(hx, 0, hz), gr = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, R * c0.s * 1.1);
      gr.addColorStop(0, '#2A1206'); gr.addColorStop(0.6, '#120A0C'); gr.addColorStop(1, '#3A2418');
      ctx.fillStyle = gr; ctx.fill();
      Efeitos.erupcao(ctx, cam, hx, hz, api.fase(0.3, 1.1), api.t, { raio: R + 0.25, altura: 0.7 });
      const desliza = api.fase(0.8, 2.4, 'suave');
      const Xr = api.lerp(hx + R + 0.9, hx + R + 0.2, desliza), q = cam.p(Xr, 0, hz);
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(-0.28 * desliza); ctx.translate(-q.x, -q.y);
      api.personagem3d(cam, { ...RAFAEL, pose: 'tq', vista: 'tq', espelhar: true, expressao: u < 0.6 ? 'espanto' : 'medo' }, Xr, hz, 1.8, { vida: 2.5 });
      ctx.restore();
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', vista: 'tq', expressao: 'espanto' }, -1.3, 2.3, 1.75, { luz: LUZ_DIA });
      ctx.restore();
      frio(ctx, 0.3);
      ctx.save(); ctx.translate(tx, ty);
      brilho(ctx, c0.x, c0.y, R * c0.s * 1.6, 0.3 * abre);
      ctx.restore();
    },

    // você estende a mão... e a terra segura ele: a coluna sobe com o Rafael e o chão se fecha
    coluna(ctx, u, d, api) {
      const B = Cenarios3D.patio.bueiro, hx = B.x, hz = B.z + 0.22;
      const [tx, ty] = api.tremor(8);
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1050, x: 0.3, y: 1.4, z: -0.4 + u * 0.1, cy: 960, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const fecha = api.fase(1.8, d, 'suave'), R = 1.0 - fecha * 0.6;
      const rnd = rng(88), pts = [];
      for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = R * (0.8 + rnd() * 0.35); pts.push(cam.p(hx + Math.cos(a) * r, 0.002, hz + Math.sin(a) * r * 0.8)); }
      ctx.fillStyle = '#140B0C'; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill();
      Efeitos.erupcao(ctx, cam, hx, hz, 0.5 + 0.4 * api.fase(0, 0.9), api.t, { raio: R + 0.2, altura: 1.4 });
      const sobe = api.fase(0.2, 1.4, 'entra');
      const b = cam.p(hx, -0.4, hz), topo = cam.p(hx, -0.4 + sobe * 1.0, hz);
      Efeitos.colunaTerra(ctx, b.x, b.y, topo.y, b.s * 0.6, api.t);
      api.personagem({ ...RAFAEL, pose: 'parado', expressao: 'medo' }, topo.x, topo.y, 1.8 * topo.s, { vida: 2 });
      const rig = api.personagem3d(cam, { ...LUCAS, pose: 'poder', expressao: u < 1.3 ? 'raiva' : 'determinado' }, -0.9, 2.5, 1.75, { luz: LUZ_DIA });
      const m = maoDoRig(rig);
      ctx.restore();
      frio(ctx, 0.3);
      ctx.save(); ctx.translate(tx, ty);
      Efeitos.fluxoTerra(ctx, [m.x + 20, m.y], [topo.x, topo.y + b.s * 0.3], api.t, { forca: 0.9 });
      brilho(ctx, m.x + 20, m.y, 220, 0.45);
      ctx.restore();
    },

    // Rafael: "Lucas... o que é você?" — recuando com medo do amigo
    amigo(ctx, u, d, api) {
      const z = api.lerp(1.08, 0.98, api.fase(0, d, 'suave'));
      ctx.save(); zoom(ctx, 540, 900, z);
      fundo(ctx, api, 'patio', { x: 0.5, y: 1.6, z: 1.0, cy: 950 }, 14);
      close(api, { ...RAFAEL, pose: 'parado', expressao: 'medo', voz: 'rafael' }, 540 + api.lerp(0, 60, api.fase(0, d)), 1050, 560, { vida: 1.5 });
      ctx.restore();
      frio(ctx, 0.4);
    },

    // Lucas: "Eu não sei o que tá acontecendo comigo." — olhando as próprias mãos
    resposta(ctx, u, d, api) {
      const pu = pulso(api, u);
      const z = api.lerp(1, 1.06, u / d);
      ctx.save(); zoom(ctx, 540, 1000, z);
      fundo(ctx, api, 'patio', { x: -0.4, y: 1.5, z: 0.6, cy: 950 }, 14);
      close(api, { ...LUCAS, pose: 'parado', expressao: { ...LUCAS_EXPRESSOES.triste, olhar: [0, 0.014] }, voz: 'lucas' }, 540, 950, 520);
      ctx.restore();
      const tre = (k) => Math.sin(api.t * 37 + k) * 5;
      const me = Maos.desenhar(ctx, 330 + tre(1), 2050 + tre(2), 330, { ang: 0.35, curl: [0.3, 0.25, 0.25, 0.3, 0.35], abre: 0.5, espelhar: true });
      const md = Maos.desenhar(ctx, 760 + tre(3), 2040 + tre(4), 330, { ang: -0.35, curl: [0.3, 0.25, 0.25, 0.3, 0.35], abre: 0.5 });
      frio(ctx, 0.4);
      for (const [m, s] of [[me, 7], [md, 8]]) { brilho(ctx, m.palma.x, m.palma.y, 180, 0.15 + 0.3 * pu); veias(ctx, m.palma.x, m.palma.y, 300, 0.3 + 0.4 * pu, s); }
    },

    // ele sai correndo... e você fica sozinho no pátio rachado (câmera se afasta e sobe)
    sozinho(ctx, u, d, api) {
      const k = api.fase(0, d, 'suave');
      const cam = api.camera({ f: 1100, x: 0.0, y: api.lerp(1.5, 3.4, k), z: api.lerp(0.8, -3.0, k), cy: api.lerp(960, 1180, k), nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const L = [0, 4.2];
      const rach = () => {
        Efeitos.rachadura(ctx, cam, L, [2.8, 7.5], 1, api.t, { largura: 0.06, semente: 51 });
        Efeitos.rachadura(ctx, cam, L, [-3.2, 6.5], 1, api.t, { largura: 0.05, semente: 52 });
        Efeitos.rachadura(ctx, cam, L, [0.9, 10], 1, api.t, { largura: 0.07, semente: 53 });
        Efeitos.rachadura(ctx, cam, L, [-1.8, 2.6], 1, api.t, { largura: 0.04, semente: 54 });
      };
      rach();
      const Xr = 0.9 + u * 2.4;
      api.personagem3d(cam, { ...RAFAEL, pose: 'andando', vista: 'perfil', expressao: 'medo' }, Xr, 5.2, 1.8, { caminhar: u, velocidade: 1.8 });
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: 'triste' }, L[0], L[1], 1.75, { vida: 0.6 });
      frio(ctx, 0.5);
      aceso(ctx, 0.3, rach);
    },

    // mas o poder não quer parar: a rachadura volta, maior, até os pés do Lucas
    racha(ctx, u, d, api) {
      const [tx, ty] = api.tremor(8 + 14 * api.fase(0.5, d));
      ctx.save(); ctx.translate(tx, ty);
      const cam = api.camera({ f: 1100, x: -0.3, y: 1.5 - u * 0.15, z: -0.5 + u * 0.18, cy: 900 + u * 70, nevoa: Cenarios3D.patio.nevoa });
      Cenarios3D.patio.desenhar(ctx, cam, {});
      const rach = () => {
        Efeitos.rachadura(ctx, cam, [0.8, 9], [-0.35, 2.75], api.fase(0, d * 0.8), api.t, { largura: 0.13, zigue: 0.7, semente: 41 });
        Efeitos.rachadura(ctx, cam, [-2.5, 7], [-0.5, 2.9], api.fase(0.4, d), api.t, { largura: 0.08, semente: 43 });
        Efeitos.rachadura(ctx, cam, [3.0, 6], [-0.2, 2.8], api.fase(0.8, d), api.t, { largura: 0.07, semente: 45 });
      };
      rach();
      api.personagem3d(cam, { ...LUCAS, pose: 'parado', expressao: u < 0.8 ? 'espanto' : 'medo' }, -0.35, 2.6, 1.75, { luz: LUZ_DIA, vida: 2.5 });
      Efeitos.impacto(ctx, cam, -0.35, 2.75, api.clamp((u - d * 0.75) / 0.9, 0, 0.99), api.t, { tamanho: 0.9 });
      ctx.restore();
      frio(ctx, 0.45);
      ctx.save(); ctx.translate(tx, ty); aceso(ctx, 0.4, rach); ctx.restore();
    },

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

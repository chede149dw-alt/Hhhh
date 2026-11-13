// Motor de episódio (roda no navegador). Desenha o quadro n de um episódio a partir da linha do tempo
// montada por motor/video.js e dos planos escritos em roteiros/<serie>/<ep>.js (window.PLANOS).
//
// Cada plano: PLANOS[id] = (ctx, u, dur, api) => { ... }   (u = segundos desde o início do plano)
// A api oferece: câmera e cenários, personagens animados, efeitos, rostos (para a legenda desviar) e texto.
(function () {
  const W = 1080, H = 1920;
  const ease = {
    linear: (x) => x,
    suave: (x) => x * x * (3 - 2 * x),
    entra: (x) => 1 - Math.pow(1 - x, 3),
    sai: (x) => x * x * x,
    volta: (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const fase = (u, a, b, e = 'suave') => ease[e](clamp((u - a) / (b - a), 0, 1));

  // mistura duas poses (mapas de ângulos)
  function misturaPoses(A, B, k) {
    const out = {};
    for (const key of new Set([...Object.keys(A || {}), ...Object.keys(B || {})])) {
      const a = (A || {})[key], b = (B || {})[key];
      if (key === '_maos') { out[key] = k < 0.5 ? a : b; continue; }
      if (Array.isArray(a) || Array.isArray(b)) { const aa = a || [0, 0], bb = b || [0, 0]; out[key] = aa.map((v, i) => lerp(v, bb[i], k)); continue; }
      out[key] = lerp(a || 0, b || 0, k);
    }
    return out;
  }

  // personagem fora da cena (atrás da câmera): devolve pontos fora da tela
  const RIG_FORA = { pontoMundo: () => ({ x: -9999, y: -9999 }), escalaPx: 0 };
  let TL = null;
  const rostos = [];

  // amplitude da voz de um personagem no tempo t (sincronia labial)
  function amplitude(voz, t) {
    for (const f of TL.falas) {
      if (f.voz !== voz || t < f.inicio || t > f.fim) continue;
      const i = Math.floor((t - f.inicio) * 30);
      return f.envelope[i] || 0;
    }
    return 0;
  }

  // vida: respiração, piscar e balanço, para nada ficar parado
  function vida(angulos, t, intensidade = 1) {
    const a = { ...angulos };
    const r = Math.sin(t * 2.1) * intensidade, r2 = Math.sin(t * 1.3 + 1) * intensidade;
    a.tronco = (a.tronco || 0) + r * 1.2;
    a.cabeca = (a.cabeca || 0) + r2 * 2.0;
    a.braco_d = (a.braco_d || 0) + r * 1.5; a.braco_e = (a.braco_e || 0) - r * 1.5;
    // movimentos lentos (o personagem nunca fica "estátua"): troca o peso, inclina, olha em volta
    const i2 = intensidade;
    a.tronco += Math.sin(t * 0.71 + 0.3) * 2.2 * i2;
    a.cabeca += Math.sin(t * 0.93 + 2.0) * 3.5 * i2 + Math.sin(t * 0.37) * 2.0 * i2;
    a.braco_d += Math.sin(t * 0.83 + 1.1) * 4 * i2; a.braco_e -= Math.sin(t * 0.77 + 0.2) * 4 * i2;
    a.antebraco_d = (a.antebraco_d || 0) + Math.sin(t * 1.1 + 0.5) * 3 * i2; a.antebraco_e = (a.antebraco_e || 0) - Math.sin(t * 1.05) * 3 * i2;
    a._desloca = [(a._desloca || [0, 0])[0] + Math.sin(t * 0.6 + 0.8) * 0.025 * i2, (a._desloca || [0, 0])[1] + Math.sin(t * 2.1) * 0.012 * intensidade];
    return a;
  }
  function piscando(t, semente = 0) {
    const ciclo = 2.7 + (semente % 3) * 0.4, f = (t + semente) % ciclo;
    return f < 0.12 ? Math.sin((f / 0.12) * Math.PI) : 0;
  }
  function expressaoViva(base, t, o = {}) {
    const e = JSON.parse(JSON.stringify(base));
    if (!e.fechado && o.piscar !== false) { const p = piscando(t, o.semente || 0); if (p > 0) e.palpebra = Math.max(e.palpebra || 0, p); }
    if (o.voz) {
      const amp = amplitude(o.voz, TL.t);
      if (amp > 0.08) e.boca = { tipo: 'aberta', curva: (e.boca && e.boca.curva) || 0.3, abertura: 0.015 + amp * 0.05, largura: 0.05 + amp * 0.02 };
    }
    return e;
  }

  // ciclo de caminhada procedural (vista de perfil)
  function caminhada(t, vel = 1) {
    const f = t * 2 * Math.PI * 1.1 * vel, s = Math.sin(f), c = Math.cos(f);
    return {
      tronco: 3, cabeca: -2,
      coxa_d: -22 * s, canela_d: 14 + 16 * Math.max(0, c), pe_d: 22 * s * 0.4,
      coxa_e: 22 * s, canela_e: 14 + 16 * Math.max(0, -c), pe_e: -22 * s * 0.4,
      braco_d: 20 * s, antebraco_d: -16, braco_e: -20 * s, antebraco_e: -16,
      _desloca: [0, -0.03 - 0.03 * Math.abs(Math.cos(f))],
    };
  }

  // luz da cena no personagem (referência 2): contraluz no lado da luz + sombra fria do outro lado.
  // o.luz = { lado: -1 (luz vem da esquerda) | 1, cor: 'rgb(255,214,150)', forca: 0..1, sombra: 0..1 }
  const camadas = {};
  function camadaFixa(nome, w, h) {
    let c = camadas[nome];
    if (!c || c.width !== w || c.height !== h) { c = camadas[nome] = document.createElement('canvas'); c.width = w; c.height = h; }
    const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
    return c;
  }
  function comLuz(ctx, luz, x, alturaPx, desenhar) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const L = camadaFixa('L', w, h), gL = L.getContext('2d');
    gL.setTransform(ctx.getTransform());
    const rig = desenhar(gL);
    const lado = luz.lado || -1, cor = luz.cor || 'rgb(255,214,150)';
    // sombra fria do lado oposto à luz e calor leve do lado da luz
    const S = camadaFixa('S', w, h), gS = S.getContext('2d');
    gS.drawImage(L, 0, 0); gS.globalCompositeOperation = 'source-atop';
    const larg = alturaPx * 0.45, gr = gS.createLinearGradient(x + lado * larg, 0, x - lado * larg, 0);
    gr.addColorStop(0, 'rgba(255,210,150,0.14)'); gr.addColorStop(0.55, 'rgba(255,210,150,0)'); gr.addColorStop(1, `rgba(56,42,104,${0.42 * (luz.sombra === undefined ? 1 : luz.sombra)})`);
    gS.fillStyle = gr; gS.fillRect(0, 0, w, h);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(S, 0, 0);
    // contraluz: borda do lado da luz
    const R = camadaFixa('R', w, h), gR = R.getContext('2d');
    gR.drawImage(L, 0, 0); gR.globalCompositeOperation = 'source-in'; gR.fillStyle = cor; gR.fillRect(0, 0, w, h);
    gR.globalCompositeOperation = 'destination-out';
    const e = Math.max(3, alturaPx * 0.006);
    gR.drawImage(L, -lado * e, -e * 0.4);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = luz.forca === undefined ? 0.9 : luz.forca;
    ctx.drawImage(R, 0, 0);
    ctx.restore();
    return rig;
  }

  // caminhada vista de costas (andando para dentro da cena) ou de frente (vindo para a câmera):
  // joelhos alternando, quadril e ombros balançando, braços acompanhando
  function caminhadaFrontal(t, vel = 1, costas = false) {
    const f = t * 2 * Math.PI * 1.1 * vel, s = Math.sin(f), c = Math.cos(f);
    const dob = (x) => Math.max(0, x);
    // perna da esquerda da tela abre com ângulo positivo; a da direita, com negativo.
    // De frente, _d fica à esquerda da tela; de costas, à direita.
    const sd = costas ? -1 : 1, se = -sd;
    return {
      quadril: 2.2 * s, tronco: -3.2 * s, cabeca: 1.5 * s,
      coxa_d: sd * 2 * dob(s), canela_d: sd * 7 * dob(s), pe_d: -sd * 5 * dob(s),
      coxa_e: se * 2 * dob(-s), canela_e: se * 7 * dob(-s), pe_e: -se * 5 * dob(-s),
      braco_d: sd * (5 + 5 * s), antebraco_d: -sd * 5, braco_e: se * (5 - 5 * s), antebraco_e: -se * 5,
      _dy_coxa_d: -0.16 * dob(s), _dy_coxa_e: -0.16 * dob(-s), // perna do passo sobe (pé sai do chão)
      _desloca: [0.02 * s, -0.02 - 0.04 * Math.abs(c)],
    };
  }

  // desenha um personagem (com vida) num ponto da tela; registra o rosto para a legenda desviar
  function personagem(ctx, item, x, ySola, alturaPx, o = {}) {
    if (o.luz) { const { luz, ...resto } = o; return comLuz(ctx, luz, x, alturaPx, (g) => personagem(g, item, x, ySola, alturaPx, resto)); }
    const fab = window[item.fabrica];
    const reg = item.registroPoses ? window[item.registroPoses] : {};
    const pdef = typeof item.pose === 'string' ? reg[item.pose] : null;
    const vista = item.vista || (pdef && pdef.vista) || 'frente';
    const def = fab(item.opcoes || {}, vista);
    // virada de cabeça (referência 4): a cabeça pode usar outra vista que o corpo
    // item.vistaCabeca: 'frente' | 'tq' | 'perfil'; item.cabecaEsquerda: true vira para o outro lado
    if (item.vistaCabeca && item.vistaCabeca !== vista) {
      const defC = fab(item.opcoes || {}, item.vistaCabeca);
      const cab = def.partes.find((q) => q.nome === 'cabeca'), cabC = defC.partes.find((q) => q.nome === 'cabeca');
      def.partes = def.partes.map((q) => (q.nome === 'cabeca' ? { ...cab, desenhar: cabC.desenhar, espelho: item.cabecaEsquerda ? -1 : 1 } : q));
    } else if (item.cabecaEsquerda) {
      def.partes = def.partes.map((q) => (q.nome === 'cabeca' ? { ...q, espelho: -1 } : q));
    }
    const rig = new Rig(def);
    let ang = pdef ? pdef.angulos : (item.pose || {});
    if (item.pose2) { const p2 = typeof item.pose2 === 'string' ? reg[item.pose2].angulos : item.pose2; ang = misturaPoses(ang, p2, item.mistura || 0); }
    // andando: de frente/costas usa o passo frontal (de perfil o passo de lado parecia balançar para os lados)
    if (o.caminhar !== undefined) ang = (vista === 'frente' || vista === 'costas') ? { ...caminhadaFrontal(o.caminhar, o.velocidade, vista === 'costas') } : { ...caminhada(o.caminhar, o.velocidade) };
    if (o.caminharFrontal !== undefined) ang = { ...caminhadaFrontal(o.caminharFrontal, o.velocidade, vista === 'costas') };
    const andando = o.caminhar !== undefined || o.caminharFrontal !== undefined;
    rig.usarPose(o.parado ? ang : vida(ang, TL.t + (o.semente || 0), o.vida === undefined ? (andando ? 0.15 : 1) : o.vida));
    const exprBase = typeof item.expressao === 'object' ? item.expressao : (def.expressoes[item.expressao || (pdef && pdef.expressao) || 'neutro']);
    rig.usarExpressao(expressaoViva(exprBase, TL.t, { voz: item.voz, semente: o.semente }));
    rig.desenhar(ctx, x, ySola, alturaPx, { espelhar: item.espelhar });
    if (!o.semRosto) {
      const c = rig.pontoMundo('cabeca', [0, -0.45]);
      rostos.push({ x: c.x, y: c.y, r: rig.escalaPx * 0.85 });
    }
    return rig;
  }

  // vista do personagem a partir do ângulo entre a câmera e a frente dele (rel em radianos; 0 = de frente,
  // positivo = câmera do lado direito dele, ele aparece olhando para a direita da tela)
  function vistaPorAngulo(rel) {
    const a = Math.atan2(Math.sin(rel), Math.cos(rel)), g = (Math.abs(a) * 180) / Math.PI, esp = a < 0;
    const faixas = [[22.5, 'frente', 'tq'], [67.5, 'tq', 'perfil'], [125, 'perfil', 'costas']];
    const nome = g < 22.5 ? 'frente' : g < 67.5 ? 'tq' : g < 125 ? 'perfil' : 'costas';
    for (const [lim, v1, v2] of faixas) {
      const d = g - lim;
      if (Math.abs(d) < 4) return { vista: v1, vista2: v2, mistura: (d + 4) / 8, espelhar: esp };
    }
    return { vista: nome, vista2: null, mistura: 0, espelhar: esp };
  }
  // personagem com a vista escolhida pelo ângulo; perto do limite entre duas vistas, mistura as duas
  function personagemGirando(ctx, item, x, ySola, alturaPx, rel, o) {
    const v = vistaPorAngulo(rel);
    const um = (vista) => ({ ...item, vista, espelhar: vista === 'frente' || vista === 'costas' ? false : v.espelhar });
    // troca de vista direta, sem misturar as duas (usuário 12/11: a mistura deixava o personagem transparente)
    if (!window.MISTURA_VISTAS) return personagem(ctx, um(v.vista2 && v.mistura >= 0.5 ? v.vista2 : v.vista), x, ySola, alturaPx, o);
    if (!v.vista2 || v.mistura <= 0.02 || v.mistura >= 0.98) return personagem(ctx, um(v.vista2 && v.mistura >= 0.98 ? v.vista2 : v.vista), x, ySola, alturaPx, o);
    const w = ctx.canvas.width, h = ctx.canvas.height, T = ctx.getTransform();
    const A = camadaFixa('giroA', w, h), B = camadaFixa('giroB', w, h);
    const gA = A.getContext('2d'), gB = B.getContext('2d'); gA.setTransform(T); gB.setTransform(T);
    const rig = personagem(gA, um(v.vista), x, ySola, alturaPx, o);
    personagem(gB, um(v.vista2), x, ySola, alturaPx, { ...o, semRosto: true });
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1 - v.mistura; ctx.drawImage(A, 0, 0);
    ctx.globalAlpha = v.mistura; ctx.drawImage(B, 0, 0);
    ctx.restore();
    return v.mistura < 0.5 ? rig : rig;
  }

  // personagem desenhado numa camada própria (para efeitos como a invisibilidade)
  function personagemCamada(item, alturaPx, o = {}) {
    const w = Math.ceil(alturaPx * 0.95), h = Math.ceil(alturaPx * 1.18);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const rig = personagem(c.getContext('2d'), item, w / 2, h - alturaPx * 0.06, alturaPx, { ...o, semRosto: true });
    return { canvas: c, rig, w, h, pe: [w / 2, h - alturaPx * 0.06] };
  }

  // personagem invisível (progresso 0..1) com pés em (x, ySola)
  // durante o sumiço (referência 3): halo azul, anel de energia subindo com a borda e faíscas
  function invisivel(ctx, item, x, ySola, alturaPx, progresso, o = {}) {
    const cam = personagemCamada(item, alturaPx, o);
    const x0 = x - cam.pe[0], y0 = ySola - cam.pe[1];
    const ativo = progresso > 0.02 && progresso < 0.98;
    const pulso = 0.85 + 0.15 * Math.sin(TL.t * 9);
    if (ativo && !o.focos) {
      const cx = x, cy = ySola - alturaPx * 0.5, r = alturaPx * 0.7;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const a = Math.sin(progresso * Math.PI) * 0.35 * pulso;
      g.addColorStop(0, `rgba(91,142,240,${a})`); g.addColorStop(0.6, `rgba(43,63,176,${a * 0.4})`); g.addColorStop(1, 'rgba(43,63,176,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.restore();
    }
    const focos = o.focos ? o.focos.map((nome) => { const p = cam.rig.pontoMundo(nome, [0, 0.2]); return [p.x, p.y]; }) : undefined;
    Efeitos.invisibilidade(ctx, cam.canvas, x0, y0, progresso, { t: TL.t, celula: Math.max(6, Math.round(alturaPx / 110)), focos, raioFocos: o.raioFocos });
    if (ativo && !o.focos) {
      // anel de energia na altura da borda que está sumindo (dos pés para a cabeça)
      const yb = ySola - alturaPx * Math.min(1, progresso * 1.1), rx = alturaPx * 0.3, ry = alturaPx * 0.06;
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (const [k, al, lw] of [[1.0, 0.9, 0.012], [1.25, 0.45, 0.006]]) {
        ctx.strokeStyle = `rgba(214,236,255,${al * pulso})`; ctx.lineWidth = Math.max(2, alturaPx * lw);
        ctx.beginPath(); ctx.ellipse(x, yb, rx * k, ry * k, 0, TL.t * 3, TL.t * 3 + Math.PI * 1.6); ctx.stroke();
      }
      // faíscas em estrela girando no anel
      ctx.fillStyle = 'rgba(255,253,242,0.95)';
      for (let i = 0; i < 6; i++) {
        const ang = TL.t * 4 + i * 1.05, sx = x + Math.cos(ang) * rx * 1.1, sy = yb + Math.sin(ang) * ry * 1.1, sr = alturaPx * (0.012 + 0.008 * Math.sin(TL.t * 11 + i));
        ctx.beginPath(); for (let j = 0; j < 8; j++) { const a2 = (j * Math.PI) / 4, rr = j % 2 ? sr * 0.25 : sr; ctx.lineTo(sx + Math.cos(a2) * rr, sy + Math.sin(a2) * rr); } ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    if (progresso < 0.6) { const c = cam.rig.pontoMundo('cabeca', [0, -0.45]); rostos.push({ x: x0 + c.x, y: y0 + c.y, r: cam.rig.escalaPx * 0.85 }); }
    return cam;
  }

  // ---------- texto ----------
  function textoContornado(ctx, txt, x, y, tam, o = {}) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `900 ${tam}px Inter`;
    ctx.textAlign = o.alinhar || 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tam * 0.2; ctx.strokeStyle = Estilo.base.tinta; ctx.strokeText(txt, x, y);
    ctx.fillStyle = o.cor || '#FFFFFF'; ctx.fillText(txt, x, y);
    ctx.restore();
  }

  // legenda: até 3 palavras, na faixa (alta ou baixa) mais longe dos rostos
  const legAnterior = { bloco: null, y: 0 };
  function legenda(ctx, t) {
    const bloco = TL.legendas.find((b) => t >= b.inicio && t < b.fim);
    if (!bloco) return;
    // faixas da legenda (y): padrão no alto; o roteiro pode trocar ("legenda": { "faixas": [...] }), ex.: no meio da tela
    const faixas = TL.legendaFaixas || [380, 1500, 1180, 700];
    const dist = (y) => { let d = 1e9; for (const r of rostos) d = Math.min(d, Math.abs(r.y - y) - r.r); return rostos.length ? d : 1e9; };
    let melhor = faixas[0], melhorD = -1;
    for (const y of faixas) {
      const d = dist(y);
      if (d > 140) { melhor = y; melhorD = d; break; }
      if (d > melhorD) { melhorD = d; melhor = y; }
    }
    // a legenda não pula de lugar no meio do bloco: fica onde estava enquanto não cobrir um rosto
    if (legAnterior.bloco === bloco && legAnterior.y !== melhor && dist(legAnterior.y) > 40) melhor = legAnterior.y;
    legAnterior.bloco = bloco; legAnterior.y = melhor;
    const k = fase(t, bloco.inicio, bloco.inicio + 0.09, 'entra');
    const tam = 98 * (1.18 - 0.18 * k);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `900 ${tam}px Inter`;
    const palavras = bloco.palavras;
    const larguras = palavras.map((p) => ctx.measureText(p.texto + ' ').width);
    let total = larguras.reduce((a, b) => a + b, 0);
    let escala = Math.min(1, (W - 120) / total);
    let x = W / 2 - (total * escala) / 2;
    palavras.forEach((p, i) => {
      const cor = p.destaque ? Estilo.base.mostarda : '#FFFFFF';
      textoContornado(ctx, p.texto, x + (larguras[i] * escala) / 2 - (ctx.measureText(' ').width * escala) / 2, melhor, tam * escala, { cor });
      x += larguras[i] * escala;
    });
    ctx.restore();
  }

  // câmera na mão: soma de senos lentos (deriva), giro de poucos décimos de grau, aproximação lenta durante o plano
  // e, logo depois do corte, a câmera chega um pouco deslocada e se acomoda (0,7 s). o.forca escala tudo; o.parada desliga.
  function cameraNaMao(t, u, dur, i, o) {
    const f = o.parada ? 0 : (o.forca === undefined ? 1 : o.forca);
    const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12543.1234;
    const ax = (r1 - Math.floor(r1)) * 2 - 1, ay = (r2 - Math.floor(r2)) * 2 - 1;
    const acom = o.continua ? 0 : 1 - ease.entra(clamp(u / 0.7, 0, 1));
    const dx = f * (7 * Math.sin(t * 0.53 + 1.3) + 3 * Math.sin(t * 1.17 + 0.4) + 1.2 * Math.sin(t * 2.3) + 12 * ax * acom);
    const dy = f * (6 * Math.sin(t * 0.61 + 2.1) + 3 * Math.sin(t * 1.29 + 0.7) + 8 * ay * acom);
    const giro = f * (0.0055 * Math.sin(t * 0.37 + 0.5) + 0.0028 * Math.sin(t * 0.93 + 1.9) + 0.004 * ax * acom);
    const empurra = f * ((o.tomada ? 0 : 0.025 * ease.suave(clamp(u / Math.max(dur, 0.1), 0, 1))) + 0.012 * acom);
    // margem mínima para cobrir deriva + giro (cantos) sem mostrar borda
    const margem = (Math.abs(dx) + Math.abs(giro) * H / 2 + 2) / (W / 2);
    return { dx, dy, giro, zoom: 1 + Math.max(0.035 * f, margem) + empurra };
  }

  window.Episodio = {
    W, H, ease, fase, clamp, lerp,
    iniciar(tl) { TL = tl; },
    quadro(n) {
      const t = n / TL.fps;
      TL.t = t;
      const c = document.getElementById('c');
      if (c.width !== W) { c.width = W; c.height = H; }
      const tela = c.getContext('2d');
      // o plano é desenhado numa camada; depois a "câmera na mão" leva a camada para a tela
      const ctx = camadaFixa('cena', W, H).getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      let forcaTremor = 0;
      rostos.length = 0;
      const p = TL.planos.find((q) => t >= q.inicio && t < q.fim) || TL.planos[TL.planos.length - 1];
      const u = t - p.inicio, dur = p.fim - p.inicio;
      const api = {
        W, H, t, u, dur, batidas: p.batidas || [], fase: (a, b, e) => fase(u, a, b, e), ease, lerp, clamp,
        camera: (o) => Cena3D.camera(o),
        personagem: (item, x, y, alt, o) => personagem(ctx, item, x, y, alt, o),
        personagem3d: (cam, item, X, Z, alturaM, o = {}) => {
          // o.rumo: para onde o personagem está virado (rad, 0 = para -Z); o.olhaPara: [X, Z]; o.y: altura do chão (flutuando)
          const y = o.y || 0, q = cam.p(X, y, Z); if (q.dz < 0.6) return RIG_FORA;
          const { rumo, olhaPara, y: _y, ...resto } = o;
          Cena3D.sombraChao(ctx, cam, X, Z, 0.55 / (1 + y * 1.5), 1.4);
          if (rumo === undefined && !olhaPara) return personagem(ctx, item, q.x, q.y, alturaM * q.s, resto);
          const r = olhaPara ? Math.atan2(-(olhaPara[0] - X), -(olhaPara[1] - Z)) : rumo;
          const rc = Math.atan2(-(cam.x - X), -(cam.z - Z));
          return personagemGirando(ctx, item, q.x, q.y, alturaM * q.s, rc - r, resto);
        },
        // câmera que orbita um ponto: o = { alvo: [X, Y, Z], raio, ang (rad; 0 = olhando para +Z), altura, f, ySalvo, nevoa }
        orbita: (o) => {
          const [X, Y, Z] = o.alvo, R = o.raio || 3, a = o.ang || 0, cy0 = o.altura === undefined ? Y + 0.2 : o.altura, f = o.f || 1200;
          const extra = {}; if (o.nevoa) extra.nevoa = o.nevoa; if (o.distNevoa) extra.distNevoa = o.distNevoa;
          return Cena3D.camera({ f, x: X - R * Math.sin(a), y: cy0, z: Z - R * Math.cos(a), yaw: a, cy: (o.ySalvo || 1000) + ((Y - cy0) * f) / R, ...extra });
        },
        personagemGirando: (item, x, y, alt, rel, o = {}) => personagemGirando(ctx, item, x, y, alt, rel, o),
        planos: TL.planos,
        // segundos desde o início do plano `id` (para tomadas contínuas que atravessam vários planos)
        desde: (id) => { const q = TL.planos.find((k) => k.id === id); return q ? t - q.inicio : u; },
        invisivel: (item, x, y, alt, prog, o) => invisivel(ctx, item, x, y, alt, prog, o),
        invisivel3d: (cam, item, X, Z, alturaM, prog, o = {}) => { const q = cam.p(X, 0, Z); if (q.dz < 0.6) return RIG_FORA; if (prog < 0.7) Cena3D.sombraChao(ctx, cam, X, Z, 0.55 * (1 - prog), 1.4); return invisivel(ctx, item, q.x, q.y, alturaM * q.s, prog, o); },
        camada: () => Cinema.camada(W, H),
        desfocar: (origem, px, a) => Cinema.desfocar(ctx, origem, px, a),
        texto: (txt, x, y, tam, o) => textoContornado(ctx, txt, x, y, tam, o),
        rosto: (x, y, r) => rostos.push({ x, y, r }),
        tremor: (forca) => { forcaTremor = Math.max(forcaTremor, forca); return [Math.sin(t * 53) * forca + Math.sin(t * 31) * forca * 0.5, Math.cos(t * 47) * forca * 0.6]; },
      };
      window.PLANOS[p.id](ctx, u, dur, api);
      // câmera na mão (referências do autor): deriva lenta, giro pequeno, aproximação suave e acomodação depois do corte.
      // A margem de corte (zoom) cobre o movimento e o tremor do plano, para nunca aparecer borda preta.
      const cm = cameraNaMao(t, u, dur, TL.planos.indexOf(p), p.camera || {});
      const zoom = cm.zoom + (1.5 * forcaTremor + 2) / (W / 2);
      tela.setTransform(1, 0, 0, 1, 0, 0);
      tela.fillStyle = '#000'; tela.fillRect(0, 0, W, H);
      tela.save();
      tela.translate(W / 2 + cm.dx, H / 2 + cm.dy); tela.rotate(cm.giro); tela.scale(zoom, zoom); tela.translate(-W / 2, -H / 2);
      tela.drawImage(ctx.canvas, 0, 0);
      tela.restore();
      for (const r of rostos) { r.y = H / 2 + cm.dy + (r.y - H / 2) * zoom; r.x = W / 2 + cm.dx + (r.x - W / 2) * zoom; r.r *= zoom; }
      if (!p.semCinema) Cinema.aplicar(tela, { t, ...(p.cinema || {}) });
      if (!p.semLegenda) legenda(tela, t);
      return p.id;
    },
  };
})();

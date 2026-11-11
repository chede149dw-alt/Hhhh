// Legendas animadas (prompt 9) a partir do words.json. Puro: roda no Node e no navegador.
//
// agrupar(palavras, o) → [{ inicio, fim, frase, palavras: [{ texto, destaque, inicio }] }]
//   grupos de 1 a 3 palavras; quebra depois de pontuação; nunca junta palavras de frases diferentes.
//   o.destaques: índices globais das palavras-chave (ficam em Mostarda)
// layout(grupo, medir, o) → { tamanho, x0, x1, y0, y1, palavras: [{ texto, x, largura, destaque }] }
//   medir(texto, tamanhoPx) → largura em px. O tamanho diminui até caber entre as margens.
// faixaLonge(rostos, H, faixas) → y da faixa mais longe dos rostos ({ y, r } em px)
// Estilo (guia, seção 15): Inter 900, caixa alta, branco com contorno Tinta (20% do tamanho), destaque Mostarda.

export const ESTILO = { fonte: 'Inter', peso: 900, tamanho: 96, contorno: 0.2, cor: '#FFFFFF', destaque: '#EBC25A', tinta: '#211B26', margem: 70 };

const limpa = (s) => s.toUpperCase();

export function agrupar(palavras, o = {}) {
  const destaques = new Set(o.destaques || []);
  const grupos = [];
  let atual = [];
  const fecha = () => { if (atual.length) grupos.push(atual); atual = []; };
  palavras.forEach((w, k) => {
    if (atual.length && atual[0].frase !== w.frase) fecha();
    atual.push(w);
    const prox = palavras[k + 1];
    if (/[.,!?;:…]$/.test(w.texto) || atual.length === 3 || !prox || prox.frase !== w.frase) fecha();
  });
  fecha();
  return grupos.map((g, i) => {
    const prox = grupos[i + 1];
    const fimFala = g[g.length - 1].fim;
    // fica na tela até o próximo grupo (sem buraco curto) ou um pouco depois da última palavra
    const fim = prox && prox[0].inicio - fimFala < 0.6 ? prox[0].inicio : fimFala + 0.3;
    return { inicio: g[0].inicio, fim: +fim.toFixed(3), frase: g[0].frase,
      palavras: g.map((w) => ({ texto: limpa(w.texto), destaque: destaques.has(w.i), inicio: w.inicio })) };
  });
}

export function layout(grupo, medir, o = {}) {
  const W = o.W || 1080, est = { ...ESTILO, ...(o.estilo || {}) };
  const espaco = (t) => medir(' ', t);
  let tam = est.tamanho;
  const larguraTotal = (t) => grupo.palavras.reduce((s, p) => s + medir(p.texto, t), 0) + espaco(t) * (grupo.palavras.length - 1) + t * est.contorno;
  while (tam > 30 && larguraTotal(tam) > W - 2 * est.margem) tam -= 2;
  const L = larguraTotal(tam), y = o.y === undefined ? (o.H || 1920) * 0.72 : o.y;
  let x = (W - L) / 2 + (tam * est.contorno) / 2;
  const palavras = grupo.palavras.map((p) => { const w = medir(p.texto, tam); const r = { ...p, x, largura: w }; x += w + espaco(tam); return r; });
  return { tamanho: tam, x0: (W - L) / 2, x1: (W + L) / 2, y0: y - tam * 0.55, y1: y + tam * 0.55, y, palavras };
}

// escolhe a faixa (y) mais longe dos rostos na tela; faixas padrão: alto, meio-alto, meio-baixo, baixo
export function faixaLonge(rostos, H = 1920, faixas = [0.2, 0.4, 0.62, 0.8]) {
  let melhor = faixas[faixas.length - 1] * H, dist = -Infinity;
  for (const f of faixas) {
    const y = f * H;
    const d = rostos.length ? Math.min(...rostos.map((r) => Math.abs(y - r.y) - r.r)) : (f === 0.8 ? 1 : 0);
    if (d > dist + 1) { dist = d; melhor = y; }
  }
  return melhor;
}

// posição pedida no roteiro: 'cima' | 'meio' | 'baixo' | número 0–1 (fração da altura)
export function posicaoPedida(pos, H = 1920) {
  if (pos === undefined || pos === null || pos === 'auto') return null;
  if (typeof pos === 'number') return pos * H;
  return { cima: 0.2, meio: 0.5, baixo: 0.8 }[pos] * H;
}

// animação de entrada: escala 0,82 → 1 com um leve passar do ponto (0,14 s); a palavra-chave pulsa um pouco
export function escalaEntrada(dt) {
  const k = Math.min(1, Math.max(0, dt / 0.14));
  const c = 1.7, volta = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
  return 0.82 + 0.18 * volta;
}

// desenha um grupo num contexto 2D (navegador)
export function desenhar(ctx, lay, t, grupo, o = {}) {
  const est = { ...ESTILO, ...(o.estilo || {}) };
  const s = escalaEntrada(t - grupo.inicio);
  const cx = (lay.x0 + lay.x1) / 2;
  ctx.save();
  ctx.translate(cx, lay.y); ctx.scale(s, s); ctx.translate(-cx, -lay.y);
  ctx.font = `${est.peso} ${lay.tamanho}px ${est.fonte}`;
  ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  for (const p of lay.palavras) {
    const pulso = p.destaque ? 1 + 0.06 * Math.max(0, 1 - (t - p.inicio) / 0.25) * (t >= p.inicio ? 1 : 0) : 1;
    const px = p.x + p.largura / 2;
    ctx.save(); ctx.translate(px, lay.y); ctx.scale(pulso, pulso); ctx.translate(-px, -lay.y);
    ctx.lineWidth = lay.tamanho * est.contorno; ctx.strokeStyle = est.tinta; ctx.strokeText(p.texto, p.x, lay.y);
    ctx.fillStyle = p.destaque ? est.destaque : est.cor; ctx.fillText(p.texto, p.x, lay.y);
    ctx.restore();
  }
  ctx.restore();
}

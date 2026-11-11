// Camada de direção (prompt 7): roteiro → planos → linha do tempo. Pura (sem three), roda no Node e no navegador.
//
// roteiro.json:
// { "titulo": "...", "folga": 0.6,
//   "frases": [
//     { "texto": "Ele sentiu a terra tremer.",
//       "inicio": "p3",                       (opcional: por padrão o plano começa na 1ª palavra da frase)
//       "cenario": "quarto",
//       "atores": [ { "nome": "lucas", "atuacao": "parado" | null, "opcoes": {…}, "marca": [dx, dz, giro] } ],
//       "acoes":  [ { "ator": "lucas", "atuacao": "poder_terra", "palavra": "terra", "alinhar": "impacto" } ],
//       "camera": [ { "inicio": 0, "tamanho": "medio", "angulo": -12, "movimento": {…}, … } ],
//       "efeitos": [ { "tipo": "tremor", "inicio": "p4", "fim": "fim-0.2", "forca": 0.05 } ],
//       "trilha": "tensa" } ] }
//
// palavras: [{ i, texto, inicio, fim, frase }] — índice global (p0, p1, …). Vêm do words.json da narração (prompt 8)
// ou de estimarPalavras(roteiro) enquanto não há voz.
//
// Tempos aceitos (dentro de um plano): 0.8 (segundos depois do início do plano), "p19+0.12" (palavra 19 + 0,12 s),
// "inicio+0.2", "fim-0.3". Uma ação com "palavra" acontece no instante dessa palavra: o impacto da atuação cai nela.
// Duração do vídeo = fim da última fala + folga.

export class ErroRoteiro extends Error {}

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// tempo estimado de cada palavra (até a narração real existir): ~2,6 palavras/s, pausas na pontuação
export function estimarPalavras(roteiro, o = {}) {
  const palavras = [];
  let t = o.inicio || 0.25, i = 0;
  roteiro.frases.forEach((f, k) => {
    for (const w of f.texto.split(/\s+/).filter(Boolean)) {
      const limpa = w.replace(/[^\p{L}\p{N}]/gu, '');
      const dur = 0.1 + 0.058 * limpa.length;
      palavras.push({ i: i++, texto: w, inicio: +t.toFixed(3), fim: +(t + dur).toFixed(3), frase: k });
      t += dur + (/[.!?]$/.test(w) ? 0.38 : /[,;:]$/.test(w) ? 0.2 : 0.04);
    }
    t += 0.12;
  });
  return palavras;
}

// converte uma expressão de tempo em segundos absolutos
export function tempo(expr, ctx) {
  if (expr === undefined || expr === null) return ctx.inicio;
  if (typeof expr === 'number') return ctx.inicio + expr;
  const m = String(expr).trim().match(/^(p(\d+)|inicio|fim)\s*(([+-])\s*(\d*\.?\d+))?$/);
  if (!m) throw new ErroRoteiro(`Tempo inválido "${expr}" (use 0.8, "p19+0.12", "inicio+0.2" ou "fim-0.3")`);
  let base;
  if (m[2] !== undefined) {
    const w = ctx.palavras[+m[2]];
    if (!w) throw new ErroRoteiro(`Palavra p${m[2]} não existe (o roteiro tem p0 a p${ctx.palavras.length - 1})`);
    base = w.inicio;
  } else base = m[1] === 'inicio' ? ctx.inicio : ctx.fim;
  return base + (m[3] ? (m[4] === '-' ? -1 : 1) * parseFloat(m[5]) : 0);
}

function conferir(nome, tipo, lista) {
  if (lista && !lista.includes(nome)) throw new ErroRoteiro(`${tipo} desconhecido(a): "${nome}". Existentes: ${lista.join(', ')}`);
}

// catalogos: { cenarios: [...], atuacoes: [...], impactos: { nome: segundos }, efeitos: [...] }
export function dirigir(roteiro, palavras, catalogos = {}) {
  if (!roteiro || !Array.isArray(roteiro.frases) || !roteiro.frases.length) throw new ErroRoteiro('O roteiro precisa de "frases" (lista)');
  const porFrase = roteiro.frases.map((_, k) => palavras.filter((w) => w.frase === k));
  porFrase.forEach((ws, k) => { if (!ws.length) throw new ErroRoteiro(`A frase ${k + 1} não tem palavras na narração`); });
  const ctxBase = { palavras };
  // inícios dos planos
  const inicios = roteiro.frases.map((f, k) => (f.inicio !== undefined ? tempo(f.inicio, { ...ctxBase, inicio: porFrase[k][0].inicio, fim: 0 }) : porFrase[k][0].inicio));
  const fimFala = palavras[palavras.length - 1].fim;
  const duracao = +(fimFala + (roteiro.folga === undefined ? 0.6 : roteiro.folga)).toFixed(3);
  const planos = roteiro.frases.map((f, k) => {
    const inicio = k === 0 ? 0 : inicios[k], fim = k < roteiro.frases.length - 1 ? inicios[k + 1] : duracao;
    const ctx = { ...ctxBase, inicio, fim };
    conferir(f.cenario, 'Cenário', catalogos.cenarios);
    const atores = (f.atores || []).map((a) => {
      if (!a.nome) throw new ErroRoteiro(`Frase ${k + 1}: ator sem "nome"`);
      if (a.atuacao) conferir(a.atuacao, 'Atuação', catalogos.atuacoes);
      return { nome: a.nome, ficha: a.ficha, marca: a.marca || [0, 0, 0], segmentos: a.atuacao ? [{ atuacao: a.atuacao, inicio: tempo(a.inicio, ctx), opcoes: a.opcoes || {} }] : [] };
    });
    const nomes = atores.map((a) => a.nome);
    // efeitos, objetos e cortes de câmera também podem começar numa palavra da frase ("palavra": "pé", "ajuste": 0.1)
    const naPalavra = (item, campo = 'inicio') => {
      if (!item.palavra) return tempo(item[campo], ctx);
      const alvo = semAcento(item.palavra), w = porFrase[k].find((p) => semAcento(p.texto) === alvo);
      if (!w) throw new ErroRoteiro(`Frase ${k + 1}: a palavra "${item.palavra}" não está na frase. Palavras: ${porFrase[k].map((p) => p.texto).join(' ')}`);
      return w.inicio + (item.ajuste || 0);
    };
    for (const ac of f.acoes || []) {
      const ator = atores.find((a) => a.nome === ac.ator);
      if (!ator) throw new ErroRoteiro(`Frase ${k + 1}: a ação usa o ator "${ac.ator}", que não está na cena. Atores: ${nomes.join(', ') || '(nenhum)'}`);
      conferir(ac.atuacao, 'Atuação', catalogos.atuacoes);
      let t;
      if (ac.palavra) {
        const alvo = semAcento(ac.palavra);
        const w = porFrase[k].find((p) => semAcento(p.texto) === alvo);
        if (!w) throw new ErroRoteiro(`Frase ${k + 1}: a palavra "${ac.palavra}" não está na frase. Palavras: ${porFrase[k].map((p) => p.texto).join(' ')}`);
        t = w.inicio + (ac.ajuste || 0);
      } else t = tempo(ac.inicio, ctx);
      // "desde": começa a atuação a partir desse instante dela (ex.: pula a preparação se o ator já está na pose)
      const desde = (ac.opcoes && ac.opcoes.desde) || 0;
      const impacto = (catalogos.impactos && catalogos.impactos[ac.atuacao]) || 0;
      const inicioAcao = (ac.alinhar === 'inicio' ? t : t - (impacto - desde));
      ator.segmentos.push({ atuacao: ac.atuacao, inicio: +inicioAcao.toFixed(3), opcoes: ac.opcoes || {}, palavra: ac.palavra || null, tPalavra: +t.toFixed(3) });
    }
    atores.forEach((a) => a.segmentos.sort((x, y) => x.inicio - y.inicio));
    // câmera: lista de planos de câmera (cortes dentro da frase); cada um vai até o próximo
    const cams = (f.camera && f.camera.length ? f.camera : [{ tamanho: 'medio' }]).map((c) => ({ ...c, de: naPalavra(c) }));
    cams.forEach((c, i) => { c.ate = i < cams.length - 1 ? cams[i + 1].de : fim; delete c.inicio; });
    const efeitos = (f.efeitos || []).map((e) => {
      if (catalogos.efeitos) conferir(e.tipo, 'Efeito', catalogos.efeitos);
      const de = naPalavra(e);
      return { ...e, de, ate: e.fim !== undefined ? tempo(e.fim, ctx) : (e.dur ? de + e.dur : fim) };
    });
    // objetos do cenário que se mexem (despertador toca, livros caem, porta abre…): { tipo, inicio, fim }
    const objetos = (f.objetos || []).map((o) => ({ ...o, de: naPalavra(o), ate: o.fim !== undefined ? tempo(o.fim, ctx) : fim }));
    return { id: `plano${k + 1}`, frase: k, texto: f.texto, legenda: f.legenda === undefined ? 'auto' : f.legenda, objetos, capa: f.capa || null, cartela: f.cartela || null, fala: f.fala || null, inicio: +inicio.toFixed(3), fim: +fim.toFixed(3), cenario: f.cenario, atores, cameras: cams, efeitos, trilha: f.trilha || null };
  });
  // palavras-chave da legenda: as marcadas em "destaque" na frase e as palavras que disparam ações
  const destaques = [];
  roteiro.frases.forEach((f, k) => {
    const alvos = new Set([...(f.destaque || []), ...(f.acoes || []).map((a) => a.palavra).filter(Boolean)].map(semAcento));
    for (const w of porFrase[k]) if (alvos.has(semAcento(w.texto))) destaques.push(w.i);
  });
  return { titulo: roteiro.titulo || '', duracao, palavras, planos, destaques };
}

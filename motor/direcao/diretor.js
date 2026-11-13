// Diretor: roteiro.json + palavras → linha do tempo (timeline). Puro (roda no Node).
//
// Cada plano começa na 1ª palavra da sua 1ª fala (ou em `ini`). Tempos aceitos (strings ou números):
//   0.8 (s desde o início do plano) · "ini+0.5" · "fim-0.3" · "p19+0.12" (palavra 19 do episódio) ·
//   "palavra:Dudu" (1ª ocorrência no plano) · "palavra:Dudu+0.2"
// Erros listam os nomes válidos (cenário, marca, atuação, olhar, ação, palavra).
import { ATUACOES, chavesDe, noLugar, estados } from '../animacao/atuacoes.js';
import { criarAnimacao } from '../animacao/animador.js';
import { valor } from '../animacao/poses.js';
import { limpar } from './palavras.js';

export const CENARIOS = { distribuidora: { marcas: null } };   // marcas vêm de fora (o cenário é módulo de navegador)
export const OLHARES = ['gabriel', 'larissa', 'larissa.rosto', 'portinhola', 'grade', 'geladeira', 'celular', 'frente'];
export const MOVIMENTOS = ['respiracao', 'virar', 'aproximar_lento', 'levantar_olhar', 'tremor', 'corte'];
export const ACOES = ['tensao', 'tremor_leve', 'alerta_celular', 'eduardo_estende_mao', 'corte_preto_batida'];
const lista = (o) => (Array.isArray(o) ? o : Object.keys(o)).join(', ');

export function compilar(roteiro, { palavras, falas }, { marcas, medidas, folgaFinal = 1.2 }) {
  const erro = (m) => { throw new Error(m); };
  if (roteiro.cenario && !CENARIOS[roteiro.cenario]) erro(`Cenário "${roteiro.cenario}" não existe. Existentes: ${lista(CENARIOS)}`);
  const atoresDef = roteiro.atores || {};
  const pal = (n) => palavras[n - 1] || erro(`Palavra ${n} não existe (o episódio tem ${palavras.length} palavras)`);

  // 1) início e fim de cada plano
  const planos = roteiro.planos.map((pl, ip) => {
    const ws = palavras.filter((w) => w.plano === pl.id);
    return { ...pl, _ws: ws, ini: ip === 0 ? 0 : (ws[0]?.ini ?? null) };
  });
  planos.forEach((pl, ip) => { if (pl.ini === null) pl.ini = planos[ip - 1].ini + 2; });
  const ultimaFala = palavras.at(-1)?.fim ?? 0;
  const duracao = +(ultimaFala + folgaFinal).toFixed(3);
  planos.forEach((pl, ip) => { pl.fim = ip < planos.length - 1 ? planos[ip + 1].ini : duracao; });

  function tempo(expr, pl, padrao = 'ini') {
    const e = expr ?? padrao;
    if (typeof e === 'number') return pl.ini + e;
    let m;
    if ((m = /^ini([+-][\d.]+)?$/.exec(e))) return pl.ini + (+m[1] || 0);
    if ((m = /^fim([+-][\d.]+)?$/.exec(e))) return pl.fim + (+m[1] || 0);
    if ((m = /^p(\d+)(?:([+-][\d.]+))?(?::(fim))?$/.exec(e))) { const w = pal(+m[1]); return (m[3] ? w.fim : w.ini) + (+m[2] || 0); }
    if ((m = /^palavra:([^+-]+)([+-][\d.]+)?$/.exec(e))) {
      const w = pl._ws.find((x) => limpar(x.texto) === limpar(m[1]));
      if (!w) erro(`Plano ${pl.id}: palavra "${m[1]}" não existe nas falas do plano. Palavras: ${pl._ws.map((x) => x.texto).join(' ')}`);
      return w.ini + (+m[2] || 0);
    }
    return erro(`Tempo "${e}" não entendido (use 0.8, "ini+0.5", "fim-0.3", "p19+0.12" ou "palavra:Dudu")`);
  }

  // 2) entradas de atuação por ator (com a marca/lugar resolvidos)
  const atores = {};
  for (const [id, def] of Object.entries(atoresDef)) {
    if (!medidas[def.ficha]) erro(`Ator "${id}": ficha "${def.ficha}" sem medidas`);
    atores[id] = [];
    const ini0 = roteiro.inicio?.[id];
    if (ini0) {
      if (!marcas[ini0.marca]) erro(`Ator "${id}": marca "${ini0.marca}" não existe. Existentes: ${lista(marcas)}`);
      atores[id].push({ ini: 0, atuacao: null, estado: ini0.estado || 'em_pe', lugar: { ...pick(marcas[ini0.marca]) } });
    }
  }
  const lugarFinal = (ent, id) => {   // onde o ator termina (para encadear uma caminhada)
    if (!ent.atuacao) return ent.lugar;
    const m = medidas[atoresDef[id].ficha];
    const an = criarAnimacao(noLugar(chavesDe(ent.atuacao, { medidas: m, ...ent.params }), ent.lugar), { medidas: m, vida: false });
    const p = an.em(an.duracao);
    return { x: valor(p, 'corpo', 'x'), z: valor(p, 'corpo', 'z'), giro: valor(p, 'corpo', 'giro') };
  };
  const sons = [], efeitos = [], cameras = [], cartelas = [], eventos = [];
  for (const pl of planos) {
    for (const [id, lst] of Object.entries(pl.atores || {})) {
      if (!atores[id]) erro(`Plano ${pl.id}: ator "${id}" não existe. Existentes: ${lista(atores)}`);
      for (const a of [].concat(lst)) {
        if (!ATUACOES[a.atuacao]) erro(`Plano ${pl.id}: atuação "${a.atuacao}" não existe. Existentes: ${lista(ATUACOES)}`);
        const ini = tempo(a.ini, pl);
        let lugar, params = { ...(a.params || {}) };
        const anterior = atores[id].filter((e) => e.ini <= ini).at(-1);
        if (a.atuacao === 'andar' && a.ate) {
          if (!marcas[a.ate]) erro(`Plano ${pl.id}: marca "${a.ate}" não existe. Existentes: ${lista(marcas)}`);
          const de = a.de ? pick(marcas[a.de]) : lugarFinal(anterior, id);
          const dx = marcas[a.ate].x - de.x, dz = marcas[a.ate].z - de.z;
          lugar = { x: de.x, z: de.z, giro: (Math.atan2(dx, dz) * 180) / Math.PI };
          params.distancia = Math.hypot(dx, dz);
        } else if (a.marca) {
          if (!marcas[a.marca]) erro(`Plano ${pl.id}: marca "${a.marca}" não existe. Existentes: ${lista(marcas)}`);
          lugar = pick(marcas[a.marca]);
        } else lugar = anterior ? lugarFinal(anterior, id) : erro(`Plano ${pl.id}: ator "${id}" sem marca`);
        const m = medidas[atoresDef[id].ficha];
        const dur = criarAnimacao(chavesDe(a.atuacao, { medidas: m, ...params }), { medidas: m, vida: false }).duracao;
        const ent = { ini, atuacao: a.atuacao, params, lugar, dur, plano: pl.id };
        atores[id].push(ent);
        for (const s of (ATUACOES[a.atuacao].sons || [])) sons.push({ t: ini + s.t, som: s.som, de: id });
        if (a.atuacao === 'andar') { const n = Math.ceil(params.distancia / (0.3 * m.H)) + 1; for (let k = 1; k <= n; k++) sons.push({ t: ini + k * (params.tempoPasso || 0.5), som: 'passo', de: id }); }
      }
    }
    for (const id of Object.keys(atores)) atores[id].sort((a, b) => a.ini - b.ini);

    // câmera
    const c = pl.camera || {};
    if (c.olhar && !OLHARES.includes(c.olhar)) erro(`Plano ${pl.id}: olhar "${c.olhar}" não existe. Existentes: ${lista(OLHARES)}`);
    if (c.movimento && !MOVIMENTOS.includes(c.movimento)) erro(`Plano ${pl.id}: movimento "${c.movimento}" não existe. Existentes: ${lista(MOVIMENTOS)}`);
    if (pl.cena !== 'preto') cameras.push({ ini: pl.ini, fim: pl.fim, tipo: c.tipo || 'subjetiva', olhar: c.olhar || 'frente', movimento: c.movimento || 'respiracao', plano: pl.id });

    // efeitos de plano
    if (pl.cena === 'preto') efeitos.push({ tipo: 'preto', ini: pl.ini, fim: pl.fim });
    if (pl.luz === 'piscando') efeitos.push({ tipo: 'piscar', ini: pl.ini, fim: pl.fim });
    if (pl.luz === 'apagada') efeitos.push({ tipo: 'apagar', ini: pl.ini, fim: pl.fim });
    if (pl.cartela) cartelas.push({ ...pl.cartela, ini: tempo(pl.cartela.ini ?? 0, pl), fim: tempo(pl.cartela.fim ?? 'ini+2.4', pl) });
    for (const s of (pl.sons || [])) sons.push({ t: tempo(s.ini ?? 0, pl), som: s.som, vol: s.vol, ate: s.ate !== undefined ? tempo(s.ate, pl) : pl.fim });
    for (const e of (pl.efeitos || [])) efeitos.push({ ...e, ini: tempo(e.ini ?? 0, pl), fim: e.fim !== undefined ? tempo(e.fim, pl) : pl.fim });
    // palavras de destaque → ações
    for (const d of (pl.destaques || [])) {
      if (!ACOES.includes(d.acao)) erro(`Plano ${pl.id}: ação "${d.acao}" não existe. Existentes: ${lista(ACOES)}`);
      const w = pl._ws.find((x) => limpar(x.texto) === limpar(d.palavra));
      const t = tempo(`palavra:${d.palavra}`, pl), tFim = w ? w.fim : t;
      eventos.push({ t, acao: d.acao, palavra: d.palavra, plano: pl.id });
      if (d.acao === 'tremor_leve') efeitos.push({ tipo: 'tremor', ini: t, fim: t + 0.45, forca: 0.012 });
      if (d.acao === 'tensao') sons.push({ t, som: 'tensao' });
      if (d.acao === 'alerta_celular') { efeitos.push({ tipo: 'alerta', ini: t, fim: duracao }); sons.push({ t, som: 'alerta' }); }
      if (d.acao === 'corte_preto_batida') { const tc = tFim + 0.8; efeitos.push({ tipo: 'preto', ini: tc, fim: duracao }); sons.push({ t: tc, som: 'batida' }); eventos.at(-1).t = tc; }
      if (d.acao === 'eduardo_estende_mao') atores.eduardo?.push({ ini: t, atuacao: 'estender_mao', params: {}, lugar: atores.eduardo.filter((e) => e.ini <= t).at(-1)?.lugar || pick(marcas.balcao), dur: 1.3, plano: pl.id });
    }
    for (const f of (pl.falas || [])) if (f.sobre === 'preto') { const fl = falas.find((x) => x.plano === pl.id && x.texto === f.texto); efeitos.push({ tipo: 'preto', ini: fl.ini - 0.2, fim: duracao }); }
  }
  for (const id of Object.keys(atores)) atores[id].sort((a, b) => a.ini - b.ini);
  if (roteiro.proxima_parte) {
    const ult = planos.at(-1);
    cartelas.push({ texto: 'SEGUE E COMENTA', sub: `PRA VER A PARTE ${roteiro.proxima_parte}`, ini: Math.max(ult.ini, duracao - 2.6), fim: duracao, estilo: 'final' });
  }
  const destaquesPalavras = new Set(planos.flatMap((pl) => (pl.destaques || []).map((d) => limpar(d.palavra))));
  const fortes = new Set([...destaquesPalavras, ...(roteiro.fortes || []).map(limpar)]);
  return {
    titulo: roteiro.titulo, serie: roteiro.serie, episodio: roteiro.episodio, duracao, fps: roteiro.formato?.fps || 60,
    planos: planos.map(({ _ws, atores: _a, ...p }) => p),
    atores, atoresDef, cameras, efeitos, cartelas, eventos,
    sons: sons.sort((a, b) => a.t - b.t),
    falas, palavras: palavras.map((w) => ({ ...w, destaque: destaquesPalavras.has(limpar(w.texto)), forte: fortes.has(limpar(w.texto)) })),
  };
}

function pick(m) { return { x: m.x, z: m.z, giro: m.giro }; }

// TRAVAS (capítulo 9 do livro "O Motor"): regra que dá para medir não fica no texto, vira trava.
// O vídeo não passa enquanto o problema existir. Gosto (direção, humor, cena bonita) continua com o autor.
//
// Roda sozinho dentro do motor/video.js:
//   antes do render  -> duração, capa, cartela final, fala cabe no plano, legenda, boneco único
//   durante o render -> personagem rente à câmera, personagem fantasma, legenda em cima de rosto
//   depois do render -> nada parado > 1 s, quadro que pisca, brilho estourado, volume, duração real
// Vídeo barrado sai com "-BARRADO" no nome e um relatório <video>.travas.txt ao lado.
//
// Também dá para conferir um vídeo pronto: node motor/travas.js <video.mp4> [linha-do-tempo.json]
//
// Cada trava foi testada no episódio 1 da terra (versão dramática, aprovado) antes de valer: ele passa em todas.
// Calibragem (15/11/2026): "fantasma" com 0,3 s barrava o aprovado (as misturas eram a câmera ATRAVESSANDO a troca de
// vista); passou a contar só o personagem parado no meio da troca (30–70%) por mais de 1 s. O pior trecho do aprovado
// tem 0,67 s (0:50,6, plano coluna). Depois o autor pediu para tirar o fantasma de vez: o motor troca a vista direto
// e qualquer quadro misturado barra. "Rente" barrava um figurante 18 mil px fora da tela; passou a contar só dentro do quadro.
// Para mudar um limite, mude aqui, anote em regras.md (regra, motivo, data) e rode de novo no episódio aprovado.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LIMITES = {
  duracaoMax: 75,          // 1 min 15 s (regra do autor)
  capaMin: 2.0,            // primeiros 2 s = capa com a premissa
  falaPassaMax: 0.3,       // a fala pode invadir o plano seguinte até 0,3 s (corte em "J"); mais que isso, não cabe
  palavrasLegenda: 3,      // legenda de no máximo 3 palavras
  fantasmaMax: 0,          // nenhum quadro com duas vistas misturadas (o autor não quer fantasma, 15/11/2026)
  telaMargem: 300,         // personagem rente só conta se estiver dentro do quadro (com esta folga em px)
  estouradoPct: 6,         // no máximo 6% de pixels quase brancos num quadro
  volumeAlvo: -16, volumeFolga: 1.5, picoMax: -1.0,
};

const raiz = path.resolve(__dirname, '..');
const fmt = (s) => { const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`; };
const trava = (nome, ok, detalhe) => ({ nome, ok, detalhe });

// ---------- antes do render ----------
function antes(TL, planosArq) {
  const r = [];
  r.push(trava('duração até 1 min 15 s', TL.total <= LIMITES.duracaoMax, `${TL.total.toFixed(1)} s`));
  const p0 = TL.planos[0], pN = TL.planos[TL.planos.length - 1];
  r.push(trava('capa nos primeiros 2 s', p0.id === 'capa' && p0.fim - p0.inicio >= LIMITES.capaMin,
    p0.id === 'capa' ? `capa com ${(p0.fim - p0.inicio).toFixed(1)} s` : `o primeiro plano é "${p0.id}", não "capa"`));
  r.push(trava('cartela "PARTE X" no fim', pN.id === 'parte', pN.id === 'parte' ? 'ok' : `o último plano é "${pN.id}", não "parte"`));
  const porId = Object.fromEntries(TL.planos.map((p) => [p.id, p]));
  const grandes = TL.falas.filter((f) => porId[f.id] && f.fim - porId[f.id].fim > LIMITES.falaPassaMax)
    .map((f) => `${f.id} (passa ${(f.fim - porId[f.id].fim).toFixed(2)} s)`);
  r.push(trava('fala cabe no plano', !grandes.length, grandes.length ? 'não cabe: ' + grandes.join(', ') + '. Aumente o plano (até 3 s), suba a velocidade ou corte a fala.' : 'ok'));
  const longas = TL.legendas.filter((l) => l.palavras.length > LIMITES.palavrasLegenda);
  r.push(trava('legenda de até 3 palavras', !longas.length, longas.length ? longas.map((l) => l.palavras.map((w) => w.texto).join(' ')).join(' | ') : 'ok'));
  r.push(bonecoUnico(planosArq));
  return r;
}

// boneco único (capítulo 10): fora de motor/corpo.js ninguém define junta, pivô ou mão
function bonecoUnico(planosArq) {
  const pastas = ['personagens', 'efeitos', 'cenarios', 'roteiros'];
  const arquivos = [];
  const andar = (d) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) andar(p); else if (n.endsWith('.js')) arquivos.push(p); } };
  for (const p of pastas) andar(path.join(raiz, p));
  if (planosArq && !arquivos.includes(path.resolve(planosArq))) arquivos.push(path.resolve(planosArq));
  const proibido = [
    [/\bpivo\s*:/, 'define pivô de junta'],
    [/\bpartes\s*:\s*\[/, 'monta o esqueleto por conta própria'],
    [/function\s+maoForma\b|maoForma\s*=\s*function/, 'redesenha a mão'],
    [/\bLUCAS_POSES\s*=|\bPOSES_PADRAO\s*=|\bEXPRESSOES_PADRAO\s*=|\bLUCAS_EXPRESSOES\s*=/, 'cria um catálogo de poses/expressões próprio'],
  ];
  const achados = [];
  for (const a of arquivos) {
    const txt = fs.readFileSync(a, 'utf8');
    for (const [re, oque] of proibido) if (re.test(txt)) achados.push(`${path.relative(raiz, a)} ${oque}`);
  }
  return trava('boneco único (corpo só em motor/corpo.js)', !achados.length, achados.length ? achados.join('; ') : 'ok');
}

// só peça aprovada (capítulo 7): vídeo final só usa peça com status "aprovado" na biblioteca.json.
// Na prévia, peça a confirmar é permitida (é assim que ela é mostrada para o autor aprovar).
function soAprovado(biblioteca, planosArq, previa) {
  const txt = planosArq ? fs.readFileSync(planosArq, 'utf8') : '';
  const usadas = biblioteca.filter((p) => p.status !== 'aprovado' && (p.fornece || []).some((f) => txt.includes(f)));
  const lista = usadas.map((p) => `${p.nome || p.arquivo} (${p.status})`).join(', ');
  if (!usadas.length) return trava('só peça aprovada da biblioteca', true, 'ok');
  return trava('só peça aprovada da biblioteca', previa, (previa ? 'prévia liberada; para o vídeo final falta aprovar: ' : 'falta aprovar na biblioteca.json: ') + lista);
}

// ---------- durante o render ----------
// eventos[q] = lista de eventos do quadro q (vindos de Episodio.eventos())
function durante(eventos, TL) {
  const fps = TL.fps, r = [];
  const trechos = (filtro) => {
    const out = []; let ini = null, quem = null;
    for (let q = 0; q <= eventos.length; q++) {
      const e = (eventos[q] || []).find(filtro);
      if (e && ini === null) { ini = q; quem = e; }
      if (!e && ini !== null) { out.push({ ini, fim: q - 1, quadros: q - ini, e: quem }); ini = null; }
    }
    return out;
  };
  const plano = (q) => (TL.planos.find((p) => q / fps >= p.inicio && q / fps < p.fim) || {}).id;
  const rente = trechos((e) => e.tipo === 'rente' && e.x > -LIMITES.telaMargem && e.x < 1080 + LIMITES.telaMargem);
  r.push(trava('nada rente à câmera (some e reaparece)', !rente.length,
    rente.length ? rente.map((x) => `${fmt(x.ini / fps)} plano ${plano(x.ini)}: ${x.e.quem} a ${x.e.dz} m`).join('; ') + '. Leve a câmera por fora (pelo menos 0,6 m).' : 'ok'));
  const fantasmas = [];
  for (const quem of new Set(eventos.flat().filter((e) => e.tipo === 'mistura').map((e) => e.quem))) {
    for (const x of trechos((e) => e.tipo === 'mistura' && e.quem === quem)) if (x.quadros > LIMITES.fantasmaMax) fantasmas.push(`${fmt(x.ini / fps)} plano ${plano(x.ini)}: ${quem} ${(x.quadros / fps).toFixed(1)} s em ${x.e.vistas}`);
  }
  r.push(trava('sem personagem fantasma (duas vistas misturadas)', !fantasmas.length,
    fantasmas.length ? fantasmas.join('; ') + '. Não pare a órbita perto de 22,5°, 67,5° ou 125°.' : 'ok'));
  const leg = trechos((e) => e.tipo === 'legenda-rosto');
  r.push(trava('legenda não cobre rosto', !leg.length, leg.length ? leg.map((x) => `${fmt(x.ini / fps)} "${x.e.texto}"`).join('; ') : 'ok'));
  return r;
}

// ---------- depois do render ----------
function depois(video) {
  const v = JSON.parse(execFileSync('python3', ['-I', path.join(raiz, 'ferramentas', 'travas_video.py'), video], { maxBuffer: 1 << 26 }).toString());
  const r = [];
  r.push(trava('duração real até 1 min 15 s', v.duracao <= LIMITES.duracaoMax + 0.05, `${v.duracao} s`));
  r.push(trava('nada parado mais de 1 s', !v.parado.length, v.parado.length ? v.parado.map((p) => `${fmt(p.inicio)} (${p.duracao.toFixed(1)} s)`).join('; ') : 'ok'));
  r.push(trava('nenhum quadro que pisca', !v.pisca.length, v.pisca.length ? v.pisca.slice(0, 8).map((p) => `${fmt(p.tempo)} (quadro ${p.quadro})`).join('; ') + (v.pisca.length > 8 ? ` e mais ${v.pisca.length - 8}` : '') : 'ok'));
  r.push(trava('brilho sem estourar (até 6% quase branco)', !v.estourado.length,
    v.estourado.length ? `${v.estourado.length} quadros; pior em ${fmt(v.estourado_pior.tempo)} com ${v.estourado_pior.pct}%` : `pior quadro: ${v.estourado_pior.pct}%`));
  const { lufs, pico } = v.volume;
  r.push(trava('volume medido (-16 LUFS, pico até -1 dB)', lufs !== null && Math.abs(lufs - LIMITES.volumeAlvo) <= LIMITES.volumeFolga && pico <= LIMITES.picoMax + 0.5,
    `${lufs} LUFS, pico ${pico} dB`));
  return r;
}

function relatorio(titulo, lista) {
  const linhas = [`${titulo}`];
  for (const t of lista) linhas.push(`  ${t.ok ? 'ok    ' : 'BARRA '} ${t.nome}${t.ok && t.detalhe === 'ok' ? '' : ' — ' + t.detalhe}`);
  return linhas.join('\n');
}

module.exports = { LIMITES, antes, soAprovado, durante, depois, relatorio };

if (require.main === module) {
  const [video, tlArq] = process.argv.slice(2);
  if (!video) { console.log('Uso: node motor/travas.js <video.mp4> [linha-do-tempo.json]'); process.exit(1); }
  let lista = depois(video);
  if (tlArq) { const TL = JSON.parse(fs.readFileSync(tlArq, 'utf8')); lista = [...antes(TL), ...lista]; }
  console.log(relatorio('Travas — ' + path.basename(video), lista));
  process.exit(lista.every((t) => t.ok) ? 0 : 1);
}

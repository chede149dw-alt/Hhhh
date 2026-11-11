// Comando único (prompt 10): roteiro → voz → direção → mixagem → quadros → MP4 → checagens (QA).
//
//   node motor/produzir.js roteiros/terra/ep01-3d.json [--saida prontos/terra-ep01-3d.mp4] [--fps 60] [--processos 4]
//                                                      [--de 0 --ate 10]  (só um trecho, em segundos)  [--sem-qa]
//
// - Voz: Edge TTS (cache em audio/<serie>/<nome>/falas). Trilha: "trilha" do roteiro (tensa | leve | nenhuma).
// - Render em partes de ~5 s (quadros PNG → MP4 da parte → apaga os PNG), para não lotar o disco.
// - QA: duração ≤ 1:15, volume entre −14,5 e −13,5 LUFS, nada parado mais de 1 s, planos de câmera ≤ 3 s,
//   capa no começo e cartela "PARTE X" no fim. Relatório em <saida>.qa.json.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { renderizar } = require('./render/quadros');
const { juntar } = require('./render/juntar');

const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, p) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : p; };
const tem = (n) => args.includes('--' + n);

function passo(nome) { console.log(`\n▶ ${nome}`); return Date.now(); }
function feito(t0) { console.log(`  ok (${((Date.now() - t0) / 1000).toFixed(1)} s)`); }

async function produzir(roteiroArq, o = {}) {
  const roteiro = JSON.parse(fs.readFileSync(roteiroArq, 'utf8'));
  const nome = path.basename(roteiroArq, '.json'), serie = roteiro.serie || path.basename(path.dirname(roteiroArq));
  const pastaAudio = path.join(RAIZ, 'audio', serie, nome);
  const pastaPrev = path.join(RAIZ, 'previas', `${serie}-${nome}`);
  fs.mkdirSync(pastaPrev, { recursive: true });
  const saida = path.resolve(o.saida || path.join(RAIZ, 'prontos', `${serie}-${nome}.mp4`));
  const fps = +(o.fps || 60), processos = +(o.processos || 4);

  let t0 = passo('1. Narração (Edge TTS)');
  execFileSync('python3', [path.join(__dirname, 'audio', 'narrar.py'), roteiroArq, pastaAudio], { stdio: 'inherit' });
  feito(t0);

  t0 = passo('2. Direção (roteiro → planos → linha do tempo)');
  const linhaArq = path.join(pastaPrev, 'linha-do-tempo.json');
  execFileSync('node', [path.join(__dirname, 'direcao', 'dirigir.js'), roteiroArq, '--palavras', path.join(pastaAudio, 'words.json'), '--saida', linhaArq], { stdio: ['ignore', 'pipe', 'inherit'] });
  const linha = JSON.parse(fs.readFileSync(linhaArq, 'utf8'));
  console.log(`  ${linha.planos.length} planos, ${linha.duracao.toFixed(2)} s, ${linha.sons.length} efeitos sonoros`);
  feito(t0);

  t0 = passo('3. Mixagem (voz + efeitos + trilha, −14 LUFS)');
  const mix = path.join(pastaAudio, 'mix.wav');
  if (!fs.existsSync(path.join(RAIZ, 'audio', 'sfx', 'impacto.wav'))) execFileSync('python3', [path.join(__dirname, 'audio', 'sfx.py'), path.join(RAIZ, 'audio', 'sfx')]);
  execFileSync('python3', [path.join(__dirname, 'audio', 'mixar.py'), '--voz', path.join(pastaAudio, 'narracao.wav'), '--linha', linhaArq, '--saida', mix,
    '--sfx', path.join(RAIZ, 'audio', 'sfx'), '--trilha', roteiro.trilha || 'tensa', '--duracao', String(linha.duracao)], { stdio: 'inherit' });
  feito(t0);

  t0 = passo(`4. Quadros (${fps} fps, ${processos} processos, em partes)`);
  const ini = o.de !== undefined ? Math.floor(+o.de * fps) : 0;
  const fim = o.ate !== undefined ? Math.min(Math.round(linha.duracao * fps) - 1, Math.floor(+o.ate * fps)) : Math.round(linha.duracao * fps) - 1;
  const pagina = `motor/visual/episodio.html?linha=${path.relative(RAIZ, linhaArq)}`;
  const tamParte = fps * 5, partes = [];
  const pastaPartes = path.join(pastaPrev, 'partes'); fs.mkdirSync(pastaPartes, { recursive: true });
  for (let a = ini, k = 0; a <= fim; a += tamParte, k++) {
    const b = Math.min(fim, a + tamParte - 1);
    const mp4 = path.join(pastaPartes, `parte-${String(k).padStart(3, '0')}-${a}-${b}.mp4`);
    if (!fs.existsSync(mp4)) {                                   // retoma de onde parou se o comando for rodado de novo
      const dir = path.join(pastaPartes, `q${k}`);
      const lista = []; for (let q = a; q <= b; q++) lista.push(q);
      const tp = Date.now();
      await renderizar({ pagina, lista, saida: dir, fps, processos });
      // os quadros vêm numerados pelo número global; o juntar lê uma sequência a partir de 0
      fs.readdirSync(dir).forEach((f) => { const q = +f.match(/\d+/)[0]; fs.renameSync(path.join(dir, f), path.join(dir, `quadro_${String(q - a).padStart(5, '0')}.png`)); });
      juntar(dir, mp4, { fps });
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  parte ${k + 1}: quadros ${a}–${b} em ${((Date.now() - tp) / 1000).toFixed(0)} s`);
    }
    partes.push(mp4);
  }
  feito(t0);

  t0 = passo('5. Junção (partes + áudio)');
  const listaTxt = path.join(pastaPartes, 'lista.txt');
  fs.writeFileSync(listaTxt, partes.map((p) => `file '${p}'`).join('\n'));
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  const offset = (ini / fps).toFixed(3), dur = ((fim - ini + 1) / fps).toFixed(3);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listaTxt, '-ss', offset, '-t', dur, '-i', mix,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida]);
  console.log(`  → ${path.relative(RAIZ, saida)}`);
  feito(t0);

  if (!o.semQa) {
    t0 = passo('6. Checagens (QA)');
    const qa = conferir(saida, linha, mix);
    fs.writeFileSync(saida + '.qa.json', JSON.stringify(qa, null, 2));
    for (const c of qa.checagens) console.log(`  ${c.ok ? '✔' : '✘'} ${c.nome}: ${c.detalhe}`);
    console.log(qa.ok ? '  Tudo certo.' : '  Há itens para revisar.');
    feito(t0);
    return qa;
  }
}

// checagens automáticas das regras do autor
function conferir(video, linha, mix) {
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString());
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr.toString();
  const lufs = parseFloat(JSON.parse(r.slice(r.lastIndexOf('{'), r.lastIndexOf('}') + 1)).input_i);
  const fz = spawnSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', 'freezedetect=n=-60dB:d=1', '-map', '0:v', '-f', 'null', '-']).stderr.toString();
  const congelados = (fz.match(/freeze_start/g) || []).length;
  const cams = linha.planos.flatMap((p) => p.cameras.map((c) => ({ plano: p.id, dur: c.ate - c.de })));
  const longos = cams.filter((c) => c.dur > 3.05);
  const checagens = [
    { nome: 'Duração ≤ 1 min 15 s', ok: dur <= 75, detalhe: `${dur.toFixed(2)} s` },
    { nome: 'Volume −14 LUFS', ok: lufs >= -14.5 && lufs <= -13.5, detalhe: `${lufs.toFixed(2)} LUFS` },
    { nome: 'Nada parado mais de 1 s', ok: congelados === 0, detalhe: congelados ? `${congelados} trecho(s) parado(s)` : 'nenhum trecho parado' },
    { nome: 'Planos de câmera ≤ 3 s', ok: longos.length === 0, detalhe: longos.length ? longos.map((c) => `${c.plano} (${c.dur.toFixed(1)} s)`).join(', ') : `${cams.length} planos, maior ${Math.max(...cams.map((c) => c.dur)).toFixed(2)} s` },
    { nome: 'Capa no começo', ok: !!linha.planos[0].capa, detalhe: linha.planos[0].capa ? (linha.planos[0].capa.linhas || []).join(' ') : 'sem capa' },
    { nome: 'Cartela "PARTE X" no fim', ok: !!linha.planos[linha.planos.length - 1].cartela, detalhe: linha.planos[linha.planos.length - 1].cartela ? `PARTE ${linha.planos[linha.planos.length - 1].cartela.parte}` : 'sem cartela' },
  ];
  return { video: path.relative(RAIZ, video), duracao: dur, lufs, ok: checagens.every((c) => c.ok), checagens };
}

module.exports = { produzir, conferir };

if (require.main === module) {
  const arq = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
  if (!arq) { console.error('Uso: node motor/produzir.js <roteiro.json> [--saida x.mp4] [--fps 60] [--processos 4] [--de s --ate s] [--sem-qa]'); process.exit(1); }
  const t0 = Date.now();
  produzir(arq, { saida: opt('saida'), fps: opt('fps'), processos: opt('processos'), de: opt('de'), ate: opt('ate'), semQa: tem('sem-qa') })
    .then((qa) => { console.log(`\nPronto em ${((Date.now() - t0) / 60000).toFixed(1)} min.`); if (qa && !qa.ok) process.exitCode = 3; })
    .catch((e) => { console.error(e); process.exit(1); });
}

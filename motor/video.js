// Monta um episódio: voz, linha do tempo, legendas, quadros e MP4 final.
// Uso: node motor/video.js <roteiro.json> <planos.js> <saida.mp4> [--previa] [--workers 4]
//   --previa: voz sintética gratuita (espeak-ng), só para conferir o tempo das cenas.
// Regras aplicadas: plano de 2 a 3 s; legenda de até 3 palavras; capa nos 2 primeiros segundos; "PARTE X" no fim.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n, p) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : p; };
const [roteiroArq, planosArq, saida] = args.filter((a, i) => !a.startsWith('--') && !['--workers', '--teste', '--momento'].includes(args[i - 1]));
const WORKERS = +opt('workers', 4);
const FPS = 30;
const raiz = path.resolve(__dirname, '..');
const roteiro = JSON.parse(fs.readFileSync(roteiroArq, 'utf8'));
const nomeEp = path.basename(roteiroArq, '.json');
const serie = path.basename(path.dirname(roteiroArq));
const pastaAudio = path.join(raiz, 'audio', serie, nomeEp, args.includes('--previa') ? 'previa' : 'final');
fs.mkdirSync(pastaAudio, { recursive: true });

const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

// ---------- 1. voz (prévia: espeak-ng) ----------
const VOZES = { narrador: ['-v', 'pt-br', '-p', '45'], mae: ['-v', 'pt-br+f3', '-p', '62'], amigo: ['-v', 'pt-br+m3', '-p', '55'], rafael: ['-v', 'pt-br+m3', '-p', '55'] };
for (const p of roteiro.planos) {
  if (!p.fala) continue;
  const arq = path.join(pastaAudio, p.id + '.wav');
  execFileSync('espeak-ng', [...(VOZES[p.fala.voz] || VOZES.narrador), '-s', String(p.fala.velocidade || 175), '-w', arq, p.fala.texto]);
  // corta o silêncio do fim
  const cortado = arq.replace('.wav', '-c.wav');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', arq, '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', cortado]);
  fs.renameSync(cortado, arq);
  p.fala.arquivo = arq;
  p.fala.dur = dur(arq);
}

// envelope de volume por quadro (sincronia labial)
function envelope(arq) {
  const py = `
import wave, struct, sys, math
w = wave.open(sys.argv[1]); n = w.getnframes(); sr = w.getframerate(); d = w.readframes(n)
a = struct.unpack('<%dh' % n, d); passo = sr // ${FPS}; out = []
for i in range(0, n, passo):
    b = a[i:i+passo]; out.append(math.sqrt(sum(x*x for x in b) / max(1, len(b))) / 32768)
m = max(out) or 1
print(','.join('%.3f' % min(1, v / m * 1.2) for v in out))`;
  return execFileSync('python3', ['-c', py, arq]).toString().trim().split(',').map(Number);
}

// ---------- 2. linha do tempo ----------
const planos = [], falas = [], legendas = [];
let t = 0, fimFalaAnterior = 0;
for (const p of roteiro.planos) {
  const ini = t;
  let fim;
  if (p.fala) {
    const iniFala = Math.max(ini + (p.id === 'capa' ? 0.15 : 0.08), fimFalaAnterior + 0.1);
    const fimFala = iniFala + p.fala.dur;
    falas.push({ id: p.id, voz: p.fala.voz, inicio: iniFala, fim: fimFala, arquivo: p.fala.arquivo, envelope: envelope(p.fala.arquivo) });
    fimFalaAnterior = fimFala;
    fim = p.duracao ? ini + p.duracao : Math.min(ini + 3.0, Math.max(ini + 2.0, fimFala + 0.3));
    // legendas: palavras distribuídas pelo tamanho, em blocos de até 3 (quebra na pontuação)
    if (p.id !== 'capa') {
      const palavras = p.fala.texto.split(/\s+/).filter(Boolean);
      const pesos = palavras.map((w) => w.length + 2), soma = pesos.reduce((a, b) => a + b, 0);
      let tw = iniFala, bloco = [];
      const destaque = new Set((p.destaque || []).map((d) => d.toUpperCase()));
      palavras.forEach((w, i) => {
        const dw = (pesos[i] / soma) * p.fala.dur;
        const txt = w.replace(/\.\.\.$/, '').toUpperCase();
        bloco.push({ texto: txt, destaque: destaque.has(txt.replace(/[.,!?]/g, '')) || destaque.has(txt), inicio: tw });
        tw += dw;
        const quebra = /[.,!?]$/.test(w) || bloco.length === 3 || i === palavras.length - 1;
        if (quebra) { legendas.push({ inicio: bloco[0].inicio, fim: tw, palavras: bloco }); bloco = []; }
      });
    }
  } else {
    fim = ini + (p.duracao || 2.0);
  }
  planos.push({ id: p.id, inicio: ini, fim, semLegenda: p.id === 'capa' || p.id === 'parte', semCinema: false });
  t = fim;
}
// legendas não passam do fim da fala seguinte nem se sobrepõem
for (let i = 0; i < legendas.length - 1; i++) legendas[i].fim = Math.min(legendas[i].fim + 0.15, legendas[i + 1].inicio);
const total = t;
const nQuadros = Math.round(total * FPS);
const TL = { fps: FPS, total, planos, falas: falas.map(({ arquivo, ...f }) => f), legendas };
fs.writeFileSync(path.join(pastaAudio, 'linha-do-tempo.json'), JSON.stringify({ ...TL, falas: falas.map(({ envelope, ...f }) => f) }, null, 2));
console.log('Duração', total.toFixed(2) + 's,', nQuadros, 'quadros');
for (const p of planos) console.log('  ', p.id.padEnd(12), (p.fim - p.inicio).toFixed(2) + 's');

// ---------- 3. áudio: falas posicionadas + bipe do despertador ----------
const bipe = path.join(pastaAudio, 'sfx-despertador.wav');
const pDesp = planos.find((p) => p.id === 'despertador');
const entradas = [], filtros = [];
falas.forEach((f, i) => { entradas.push('-i', f.arquivo); filtros.push(`[${i}]adelay=${Math.round(f.inicio * 1000)}|${Math.round(f.inicio * 1000)},volume=1.6[f${i}]`); });
let mix = falas.map((_, i) => `[f${i}]`).join('');
if (pDesp) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=2200:duration=${(pDesp.fim - pDesp.inicio).toFixed(2)}`, '-af', "volume='if(lt(mod(t,0.25),0.1),0.35,0)':eval=frame", bipe]);
  entradas.push('-i', bipe);
  const k = falas.length;
  filtros.push(`[${k}]adelay=${Math.round(pDesp.inicio * 1000)}|${Math.round(pDesp.inicio * 1000)}[sfx]`);
  mix += '[sfx]';
}
const n = mix.match(/\[/g).length;
filtros.push(`${mix}amix=inputs=${n}:normalize=0,apad,atrim=0:${total.toFixed(3)},loudnorm=I=-16:TP=-1.5[a]`);
const audioFinal = path.join(pastaAudio, 'mix.wav');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...entradas, '-filter_complex', filtros.join(';'), '-map', '[a]', '-ar', '48000', audioFinal]);

// ---------- 4. quadros em paralelo ----------
const scripts = ['motor/cena.js', 'motor/cena3d.js', 'motor/cinema.js', 'motor/personagem-base.js',
  'personagens/lucas/lucas.js', 'personagens/mae/mae.js', 'personagens/rafael/rafael.js',
  'cenarios/objetos/cama.js', 'cenarios/objetos/despertador.js', 'cenarios/objetos/mochila.js',
  'cenarios/quarto-3d.js', 'cenarios/rua-3d.js', 'cenarios/escola-3d.js', 'cenarios/patio-3d.js',
  'efeitos/invisibilidade.js', 'efeitos/poder-energia.js', 'efeitos/poder-terra.js', 'efeitos/terra-cena.js', 'motor/episodio.js', planosArq].map((s) => path.resolve(raiz, s));

const tmp = path.join(pastaAudio, 'partes'); fs.mkdirSync(tmp, { recursive: true });
async function trabalhador(k, browser) {
  const ini = Math.floor((nQuadros * k) / WORKERS), fim = Math.floor((nQuadros * (k + 1)) / WORKERS);
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of scripts) await page.addScriptTag({ path: s });
  await page.evaluate(async (tl) => { await document.fonts.load('900 98px Inter'); Episodio.iniciar(tl); }, TL);
  const arq = path.join(tmp, `parte-${k}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'veryfast', arq], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let q = ini; q < fim; q++) {
    const b64 = await page.evaluate((q) => { Episodio.quadro(q); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, q);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (k === 0 && (q - ini) % 30 === 0) process.stdout.write(`\r  quadros: ${Math.round(((q - ini) / (fim - ini)) * 100)}% `);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
  return arq;
}

// modo teste: um quadro de cada plano numa folha de contato (--teste saida.png [--momento 0.5])
async function teste(png) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Erro na página:', e.message));
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of scripts) await page.addScriptTag({ path: s });
  await page.evaluate(async (tl) => { await document.fonts.load('900 98px Inter'); Episodio.iniciar(tl); }, TL);
  const m = +opt('momento', 0.5);
  const dir = path.join(tmp, 'teste'); fs.mkdirSync(dir, { recursive: true });
  for (const [i, p] of planos.entries()) {
    const q = Math.floor((p.inicio + (p.fim - p.inicio) * m) * FPS);
    const b64 = await page.evaluate((q) => { Episodio.quadro(q); return document.getElementById('c').toDataURL('image/jpeg', 0.9).split(',')[1]; }, q);
    fs.writeFileSync(path.join(dir, String(i).padStart(2, '0') + '.jpg'), Buffer.from(b64, 'base64'));
  }
  await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, '*.jpg'), '-vf', 'scale=270:480,tile=7x2:padding=6', '-frames:v', '1', png]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('Folha de teste:', png);
}

(async () => {
  if (opt('teste')) { await teste(opt('teste')); return; }
  const t0 = Date.now();
  const browser = await chromium.launch();
  const partes = await Promise.all([...Array(WORKERS).keys()].map((k) => trabalhador(k, browser)));
  await browser.close();
  console.log(`\n  render: ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const lista = path.join(tmp, 'lista.txt');
  fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join('\n'));
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-i', audioFinal,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Pronto:', saida);
})();

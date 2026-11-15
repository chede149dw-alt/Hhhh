// Monta um episódio: voz, linha do tempo, legendas, quadros e MP4 final.
// Uso: node motor/video.js <roteiro.json> <planos.js> <saida.mp4> [--previa] [--workers 4]
//   --previa: voz sintética gratuita (espeak-ng), só para conferir o tempo das cenas.
//   sem --previa: usa a voz final de cada fala (fala.voz_final.arquivo, relativo a audio/<serie>/<ep>/).
// Regras aplicadas: plano de 2 a 3 s; legenda de até 3 palavras; capa nos 2 primeiros segundos; "PARTE X" no fim.
// Travas (motor/travas.js): conferidas antes, durante e depois do render. Se alguma barrar, o render nem começa
// (ou, com --mesmo-assim, o vídeo sai com "-BARRADO" no nome). O relatório fica em <saida>.travas.txt.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n, p) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : p; };
const [roteiroArq, planosArq, saida] = args.filter((a, i) => !a.startsWith('--') && !['--workers', '--teste', '--momento', '--quadros', '--cada', '--so-eventos'].includes(args[i - 1]));
const WORKERS = +opt('workers', 4);
const FPS = 30;
const raiz = path.resolve(__dirname, '..');
// peças que o motor pode carregar: só as da biblioteca (biblioteca.json), na ordem dela
const biblioteca = JSON.parse(fs.readFileSync(path.join(raiz, 'biblioteca.json'), 'utf8')).pecas;
const roteiro = JSON.parse(fs.readFileSync(roteiroArq, 'utf8'));
const nomeEp = path.basename(roteiroArq, '.json');
const serie = path.basename(path.dirname(roteiroArq));
const pastaAudio = path.join(raiz, 'audio', serie, nomeEp, args.includes('--previa') ? 'previa' : 'final');
fs.mkdirSync(pastaAudio, { recursive: true });

const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

// ---------- 1. voz (prévia: espeak-ng) ----------
const VOZES = { narrador: ['-v', 'pt-br', '-p', '45'], mae: ['-v', 'pt-br+f3', '-p', '62'], amigo: ['-v', 'pt-br+m3', '-p', '55'], rafael: ['-v', 'pt-br+m3', '-p', '55'], lucas: ['-v', 'pt-br+m1', '-p', '68'] };
for (const p of roteiro.planos) {
  if (!p.fala) continue;
  const arq = path.join(pastaAudio, p.id + '.wav');
  // voz final (ElevenLabs etc.): arquivo pronto em audio/<serie>/<ep>/<voz_final.arquivo>; a prévia usa espeak-ng
  const final = p.fala.voz_final && path.join(raiz, 'audio', serie, nomeEp, p.fala.voz_final.arquivo);
  if (!args.includes('--previa') && final) {
    if (!fs.existsSync(final)) throw new Error('Falta a voz final de ' + p.id + ': ' + final);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', final, '-ar', '48000', '-ac', '1', arq]);
  } else execFileSync('espeak-ng', [...(VOZES[p.fala.voz] || VOZES.narrador), '-s', String(p.fala.velocidade || 175), '-w', arq, p.fala.texto]);
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
  // batidas de coração do plano (segundos desde o início do plano): sfx { tipo: 'coracao', bpm, bpmFim, de, ate }
  const batidas = [];
  for (const s of p.sfx || []) {
    if (s.tipo !== 'coracao') continue;
    const d = fim - ini, ate = Math.min(d, s.ate === undefined ? d : s.ate);
    for (let b = s.de === undefined ? 0.1 : s.de; b < ate - 0.05;) { batidas.push(+b.toFixed(3)); const bpm = s.bpm + ((s.bpmFim || s.bpm) - s.bpm) * (b / d); b += 60 / bpm; }
  }
  planos.push({ id: p.id, inicio: ini, fim, semLegenda: p.id === 'capa' || p.id === 'parte', semCinema: false, cinema: p.cinema, camera: p.camera, batidas, sfx: p.sfx || [] });
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

// ---------- travas antes do render ----------
const Travas = require('./travas');
const travasAntes = [...Travas.antes(TL, planosArq), Travas.soAprovado(biblioteca, planosArq, args.includes('--previa'))];
console.log(Travas.relatorio('Travas antes do render:', travasAntes));
const soConferindo = opt('teste') || opt('quadros') || opt('so-eventos');
if (!soConferindo && !travasAntes.every((t) => t.ok) && !args.includes('--mesmo-assim')) {
  console.error('\nVídeo barrado antes do render. Corrija o que está marcado como BARRA (ou rode com --mesmo-assim para ver mesmo assim).');
  process.exit(1);
}
const eventosPorQuadro = [];

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
// efeitos sonoros por plano: coracao (batidas), impacto { em }, ronco { de, ate, volume }
const SFX = {
  coracao: "aevalsrc='0.9*sin(2*PI*52*t)*exp(-t*16)+0.65*sin(2*PI*46*(t-0.17))*exp(-(t-0.17)*16)*gte(t,0.17)':d=0.6:s=48000",
  impacto: "aevalsrc='(0.9*sin(2*PI*38*t)+0.6*sin(2*PI*61*t)*exp(-t*6)+0.5*(random(0)*2-1)*exp(-t*14))*exp(-t*3.2)':d=1.4:s=48000,lowpass=f=500",
};
const sfxArq = {};
for (const [nome, src] of Object.entries(SFX)) { sfxArq[nome] = path.join(pastaAudio, `sfx-${nome}.wav`); execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, sfxArq[nome]]); }
let nSfx = 0;
const addSfx = (arq, t0, vol, extra = '') => { const k = entradas.length / 2; entradas.push('-i', arq); const ms = Math.max(0, Math.round(t0 * 1000)); filtros.push(`[${k}]${extra}adelay=${ms}|${ms},volume=${vol}[x${nSfx}]`); mix += `[x${nSfx++}]`; };
for (const p of planos) {
  for (const b of p.batidas) addSfx(sfxArq.coracao, p.inicio + b, 1.1);
  for (const s of p.sfx) {
    if (s.tipo === 'impacto') addSfx(sfxArq.impacto, p.inicio + (s.em || 0), s.volume || 1.0);
    if (s.tipo === 'ronco') {
      const de = s.de || 0, ate = Math.min(p.fim - p.inicio, s.ate === undefined ? p.fim - p.inicio : s.ate), d = ate - de;
      const arq = path.join(pastaAudio, `sfx-ronco-${p.id}.wav`);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `anoisesrc=color=brown:d=${d.toFixed(2)}:a=0.9:r=48000:seed=7`, '-af', `lowpass=f=140,lowpass=f=140,afade=t=in:d=${Math.min(0.4, d / 3).toFixed(2)},afade=t=out:st=${(d - Math.min(0.5, d / 3)).toFixed(2)}:d=${Math.min(0.5, d / 3).toFixed(2)}`, arq]);
      addSfx(arq, p.inicio + de, s.volume || 1.4);
    }
  }
}
const n = mix.match(/\[/g).length;
filtros.push(`${mix}amix=inputs=${n}:normalize=0,apad,atrim=0:${total.toFixed(3)},loudnorm=I=-16:TP=-1.5[a]`);
const audioFinal = path.join(pastaAudio, 'mix.wav');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...entradas, '-filter_complex', filtros.join(';'), '-map', '[a]', '-ar', '48000', audioFinal]);

// ---------- 4. quadros em paralelo ----------
// peças carregadas = as da biblioteca (biblioteca.json), na ordem dela, + os planos do episódio
const scripts = [...biblioteca.map((p) => p.arquivo), planosArq].map((s) => path.resolve(raiz, s));

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
    const [b64, ev] = await page.evaluate((q) => { Episodio.quadro(q); return [document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1], Episodio.eventos()]; }, q);
    eventosPorQuadro[q] = ev;
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
    // cada plano sai NUMERADO (capítulo 7): o autor aponta "a 12" em vez de descrever a cena
    const b64 = await page.evaluate(([q, rotulo]) => {
      Episodio.quadro(q);
      const c = document.getElementById('c'), g = c.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0); g.font = '900 120px Inter'; g.textAlign = 'left'; g.textBaseline = 'top';
      const w = g.measureText(rotulo).width;
      g.fillStyle = 'rgba(210,58,66,0.92)'; g.beginPath(); g.roundRect(24, 1760, w + 60, 140, 30); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillText(rotulo, 54, 1772);
      return c.toDataURL('image/jpeg', 0.9).split(',')[1];
    }, [q, String(i + 1) + ' ' + p.id]);
    fs.writeFileSync(path.join(dir, String(i).padStart(2, '0') + '.jpg'), Buffer.from(b64, 'base64'));
  }
  await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, '*.jpg'), '-vf', `scale=270:480,tile=7x${Math.ceil(planos.length / 7)}:padding=6`, '-frames:v', '1', png]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('Folha de teste:', png);
}

// modo quadros: salva um PNG a cada N quadros, para comparar versões (--quadros pasta [--cada 10])
async function quadrosSoltos(pasta) {
  const cada = +opt('cada', 10);
  fs.mkdirSync(pasta, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of scripts) await page.addScriptTag({ path: s });
  await page.evaluate(async (tl) => { await document.fonts.load('900 98px Inter'); Episodio.iniciar(tl); }, TL);
  for (let q = 0; q < nQuadros; q += cada) {
    const b64 = await page.evaluate((q) => { Episodio.quadro(q); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, q);
    fs.writeFileSync(path.join(pasta, 'q' + String(q).padStart(5, '0') + '.png'), Buffer.from(b64, 'base64'));
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Quadros salvos em', pasta);
}

// modo eventos: roda todos os quadros sem gerar imagem e salva os eventos das travas (--so-eventos saida.json)
async function soEventos(arq) {
  const browser = await chromium.launch();
  await Promise.all([...Array(WORKERS).keys()].map(async (k) => {
    const ini = Math.floor((nQuadros * k) / WORKERS), fim = Math.floor((nQuadros * (k + 1)) / WORKERS);
    const page = await browser.newPage();
    await page.goto('file://' + path.join(__dirname, 'palco.html'));
    for (const s of scripts) await page.addScriptTag({ path: s });
    await page.evaluate(async (tl) => { await document.fonts.load('900 98px Inter'); Episodio.iniciar(tl); }, TL);
    for (let q = ini; q < fim; q++) eventosPorQuadro[q] = await page.evaluate((q) => { Episodio.quadro(q); return Episodio.eventos(); }, q);
  }));
  await browser.close();
  fs.writeFileSync(arq, JSON.stringify(eventosPorQuadro));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(Travas.relatorio('Durante o render:', Travas.durante(eventosPorQuadro, TL)));
}

(async () => {
  if (opt('teste')) { await teste(opt('teste')); return; }
  if (opt('so-eventos')) { await soEventos(opt('so-eventos')); return; }
  if (opt('quadros')) { await quadrosSoltos(opt('quadros')); return; }
  const t0 = Date.now();
  const browser = await chromium.launch();
  const partes = await Promise.all([...Array(WORKERS).keys()].map((k) => trabalhador(k, browser)));
  await browser.close();
  const segRender = (Date.now() - t0) / 1000;
  console.log(`\n  render: ${segRender.toFixed(0)}s`);
  const lista = path.join(tmp, 'lista.txt');
  fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join('\n'));
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-i', audioFinal,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida]);
  fs.rmSync(tmp, { recursive: true, force: true });
  // ---------- travas durante e depois do render ----------
  const travasDurante = Travas.durante(eventosPorQuadro, TL);
  const travasDepois = Travas.depois(saida);
  const todas = [...travasAntes, ...travasDurante, ...travasDepois];
  const texto = [Travas.relatorio('Antes do render:', travasAntes), Travas.relatorio('Durante o render:', travasDurante), Travas.relatorio('Vídeo pronto:', travasDepois)].join('\n');
  console.log('\n' + texto);
  let final = saida;
  if (!todas.every((t) => t.ok)) {
    final = saida.replace(/\.mp4$/, '') + '-BARRADO.mp4';
    fs.renameSync(saida, final);
    console.log('\nVÍDEO BARRADO:', final);
    process.exitCode = 1;
  } else console.log('\nPassou em todas as travas.');
  fs.writeFileSync(final + '.travas.txt', texto + '\n');
  // medição (capítulo 6: mede antes de cortar): uma linha por render em medicoes.csv
  const med = path.join(raiz, 'medicoes.csv');
  if (!fs.existsSync(med)) fs.writeFileSync(med, 'data,serie,episodio,modo,duracao_video_s,quadros,render_s,travas_ok,travas_barradas\n');
  const barradas = todas.filter((t) => !t.ok).map((t) => t.nome).join(' | ');
  fs.appendFileSync(med, [new Date().toISOString().slice(0, 16).replace('T', ' '), serie, nomeEp, args.includes('--previa') ? 'previa' : 'final',
    total.toFixed(1), nQuadros, segRender.toFixed(0), todas.filter((t) => t.ok).length, JSON.stringify(barradas)].join(',') + '\n');
  console.log('Pronto:', final);
})();

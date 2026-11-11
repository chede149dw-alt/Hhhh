// Renderiza quadros de uma página 3D em PNG, num Chrome sem tela (puppeteer-core).
// A página precisa expor window.quadro(t) (posiciona a cena no instante t, em segundos, e desenha)
// e window.pronto = true quando terminar de carregar. Nada depende do relógio real.
//
// Uso:
//   node motor/render/quadros.js <pagina.html> --quadros 0,90,239 --saida <pasta>
//   node motor/render/quadros.js <pagina.html> --de 0 --ate 239 --saida <pasta> [--fps 60] [--processos 4]
//   (caminho da página relativo à raiz do projeto; quadros salvos como quadro_00090.png)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { iniciar } = require('./servidor');

const RAIZ = path.resolve(__dirname, '..', '..');
// Chrome: variável CHROME, senão o Chromium da nuvem, senão o Chrome/Edge instalado no computador.
const CANDIDATOS = [process.env.CHROME, '/opt/pw-browsers/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
const CHROME = CANDIDATOS.find((c) => c && fs.existsSync(c));
// GPU: na nuvem não há placa de vídeo (SwiftShader, por software); no computador usa a placa (ANGLE padrão).
// Forçar software em qualquer lugar: SOFTWARE=1.
const SEM_GPU = process.env.SOFTWARE === '1' || (!process.env.CHROME && CHROME === '/opt/pw-browsers/chromium');
const FLAGS = ['--no-sandbox', '--headless=new', ...(SEM_GPU ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--enable-gpu', '--ignore-gpu-blocklist'])];

function argumentos(lista) {
  const o = { fps: 60, processos: 1 };
  const pos = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].startsWith('--')) { o[lista[i].slice(2)] = lista[i + 1]; i++; } else pos.push(lista[i]);
  }
  o.pagina = pos[0];
  o.fps = +o.fps; o.processos = +o.processos;
  if (o.quadros) o.lista = o.quadros.split(',').map(Number);
  else if (o.de !== undefined) { o.lista = []; for (let q = +o.de; q <= +o.ate; q++) o.lista.push(q); }
  return o;
}

async function renderizar({ pagina, lista, saida, fps = 60, processos = 1, aoQuadro }) {
  fs.mkdirSync(saida, { recursive: true });
  const srv = await iniciar(RAIZ);
  if (!CHROME) throw new Error('Chrome não encontrado: defina a variável CHROME com o caminho do chrome.exe');
  const navegador = await puppeteer.launch({ executablePath: CHROME, headless: true, args: FLAGS });
  const fatias = [...Array(processos)].map((_, k) => lista.filter((_, i) => i % processos === k));
  let feitos = 0;
  await Promise.all(fatias.map(async (fatia) => {
    const p = await navegador.newPage();
    p.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
    await p.goto(`${srv.url}/${pagina}`);
    await p.waitForFunction('window.pronto === true', { timeout: 60000 });
    for (const q of fatia) {
      const b64 = await p.evaluate(async (t) => { await window.quadro(t); return window.capturar ? window.capturar() : document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, q / fps);
      fs.writeFileSync(path.join(saida, `quadro_${String(q).padStart(5, '0')}.png`), Buffer.from(b64, 'base64'));
      feitos++; if (aoQuadro) aoQuadro(feitos, lista.length);
    }
    await p.close();
  }));
  await navegador.close();
  srv.fechar();
}

module.exports = { renderizar };

if (require.main === module) {
  const o = argumentos(process.argv.slice(2));
  if (!o.pagina || !o.lista || !o.saida) { console.error('Uso: node motor/render/quadros.js <pagina.html> (--quadros 0,90 | --de 0 --ate 239) --saida <pasta> [--fps 60] [--processos 4]'); process.exit(1); }
  const t0 = Date.now();
  renderizar({ ...o, saida: path.resolve(o.saida), aoQuadro: (n, tot) => { if (n % 30 === 0 || n === tot) process.stdout.write(`\r  ${n}/${tot} quadros`); } })
    .then(() => { const s = (Date.now() - t0) / 1000; console.log(`\nPronto: ${o.lista.length} quadros em ${s.toFixed(1)} s (${(o.lista.length / s).toFixed(1)} quadros/s)`); });
}

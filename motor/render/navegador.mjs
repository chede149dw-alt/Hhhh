// Abre Chrome headless com WebGL por software (SwiftShader): mesmo quadro => mesmos pixels.
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATOS = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

export function acharChrome() {
  const c = CANDIDATOS.find((p) => fs.existsSync(p));
  if (!c) throw new Error('Chrome não encontrado. Defina CHROME_PATH. Tentados:\n' + CANDIDATOS.join('\n'));
  return c;
}

export function abrirNavegador() {
  return puppeteer.launch({
    executablePath: acharChrome(),
    headless: true,
    args: [
      '--no-sandbox', '--headless=new',
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=angle',
      '--disable-gpu-rasterization', '--force-color-profile=srgb', '--hide-scrollbars',
      '--font-render-hinting=none', '--disable-lcd-text', '--mute-audio',
      '--disable-background-networking', '--disable-component-update', '--no-first-run',
      '--disable-features=Translate,OptimizationHints,MediaRouter',
    ],
  });
}

// Abre a página e espera window.pronto (Promise opcional) e window.quadro.
export async function abrirPagina(nav, url, { largura = 1080, altura = 1920 } = {}) {
  const pag = await nav.newPage();
  const erros = [];
  pag.on('pageerror', (e) => erros.push(e.message));
  pag.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); });
  pag.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) erros.push(`HTTP ${r.status()}: ${r.url()}`); });
  await pag.setViewport({ width: largura, height: altura, deviceScaleFactor: 1 });
  await pag.goto(url, { waitUntil: 'load' });
  await pag.waitForFunction(() => typeof window.quadro === 'function', { timeout: 30000 })
    .catch(() => { throw new Error('A página não expôs window.quadro(t).\n' + erros.join('\n')); });
  await pag.evaluate(() => window.pronto);
  if (erros.length) throw new Error('Erros na página:\n' + erros.join('\n'));
  return pag;
}

// Posiciona a cena no instante t (segundos) e devolve o PNG do quadro.
export async function capturar(pag, t) {
  await pag.evaluate(async (t) => { await window.quadro(t); }, t);
  return pag.screenshot({ type: 'png', captureBeyondViewport: false });
}

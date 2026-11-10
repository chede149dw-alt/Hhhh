// Renderiza motor/teste/cena.html quadro a quadro e gera previas/teste.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const cena = path.join(__dirname, 'cena.html');
const saida = path.join(raiz, 'previas', 'teste.mp4');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + cena);
  await page.evaluate(() => document.fonts.ready);
  const { FPS, TOTAL } = await page.evaluate(() => window.CENA);

  const ff = spawn('ffmpeg', [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-movflags', '+faststart', saida,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let n = 0; n < TOTAL; n++) {
    const b64 = await page.evaluate((n) => {
      window.renderFrame(n);
      return document.getElementById('c').toDataURL('image/png').split(',')[1];
    }, n);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
  await browser.close();
  console.log('Pronto:', saida);
})();

// Renderiza um cenário em PNG (1080 × 1920).
// Uso: node motor/cenario.js <script.js> [mais scripts.js] <nome-do-cenario> <saida.png> [--opcoes '{"t":0}']
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const i = args.indexOf('--opcoes');
const opcoes = i >= 0 ? JSON.parse(args[i + 1]) : {};
const pos = args.filter((a, k) => !a.startsWith('--') && args[k - 1] !== '--opcoes');
const scripts = pos.filter((a) => a.endsWith('.js'));
const saida = pos.find((a) => a.endsWith('.png'));
const nome = pos.find((a) => !a.endsWith('.js') && !a.endsWith('.png'));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of [path.join(__dirname, 'cena.js'), ...scripts]) await page.addScriptTag({ path: path.resolve(s) });
  const b64 = await page.evaluate(([n, o]) => {
    const c = document.getElementById('c'); c.width = 1080; c.height = 1920;
    const ctx = c.getContext('2d'); Cena.cenario(ctx, n, o);
    return c.toDataURL('image/png').split(',')[1];
  }, [nome, opcoes]);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log('Pronto:', saida);
})();

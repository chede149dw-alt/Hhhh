// Gera a prancha de produção de uma série.
// Uso: node motor/prancha.js <prancha.json> <saida.png>
//   O JSON lista em "scripts" todos os arquivos .js necessários (personagens, cenários, objetos, efeitos).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [config, saida] = process.argv.slice(2);
if (!config || !saida) { console.error('Uso: node motor/prancha.js <prancha.json> <saida.png>'); process.exit(1); }
(async () => {
  const cfg = JSON.parse(fs.readFileSync(config, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  const base = [path.join(__dirname, 'cena.js'), path.join(__dirname, 'personagem-base.js')];
  for (const s of [...base, ...cfg.scripts.map((s) => path.resolve(s)), path.join(__dirname, 'prancha-layout.js')]) await page.addScriptTag({ path: s });
  const b64 = await page.evaluate((c) => window.desenharPrancha(c), cfg);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log('Pronto:', saida);
})();

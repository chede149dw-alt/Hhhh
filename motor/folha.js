// Renderiza uma folha comparando variações de um personagem.
// Uso: node motor/folha.js <script.js> [mais scripts.js] <rodada.json> <saida.png>
// rodada.json: { "fabrica": "criarProtagonista", "variantes": [ { "id": "A", "nome": "...", "opcoes": {...} } ] }
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const scripts = args.filter((a) => a.endsWith('.js'));
const rodada = args.find((a) => a.endsWith('.json'));
const saida = args.find((a) => a.endsWith('.png'));
if (!scripts.length || !rodada || !saida) { console.error('Uso: node motor/folha.js <script.js> [mais scripts] <rodada.json> <saida.png>'); process.exit(1); }

(async () => {
  const cfg = JSON.parse(fs.readFileSync(rodada, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of scripts) await page.addScriptTag({ path: path.resolve(s) });
  const b64 = await page.evaluate((o) => window.desenharFolha(o), cfg);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log('Pronto:', saida);
})();

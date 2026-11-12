// Gera a ficha oficial de um personagem: ficha.png + vistas/, expressoes/, poses/.
// Uso: node motor/ficha.js <script.js> [mais scripts.js] <ficha.json> <pasta-de-saida>
//   ex.: node motor/ficha.js personagens/lucas/lucas.js efeitos/poder-energia.js personagens/lucas/ficha.json personagens/lucas
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const scripts = args.filter((a) => a.endsWith('.js'));
const config = args.find((a) => a.endsWith('.json'));
const pasta = args.find((a) => !a.endsWith('.js') && !a.endsWith('.json'));
if (!scripts.length || !config || !pasta) {
  console.error('Uso: node motor/ficha.js <script.js> [mais scripts] <ficha.json> <pasta-de-saida>');
  process.exit(1);
}

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

(async () => {
  const cfg = JSON.parse(fs.readFileSync(config, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of [...scripts, path.join(__dirname, 'ficha-layout.js')]) await page.addScriptTag({ path: path.resolve(s) });

  const salvar = (arq, b64) => {
    fs.mkdirSync(path.dirname(arq), { recursive: true });
    fs.writeFileSync(arq, Buffer.from(b64, 'base64'));
    console.log('  ', path.relative(process.cwd(), arq));
  };

  salvar(path.join(pasta, 'ficha.png'), await page.evaluate((c) => window.desenharFichaOficial(c), cfg));
  for (const v of cfg.vistas) salvar(path.join(pasta, 'vistas', slug(v.nome) + '.png'), await page.evaluate(([c, i]) => window.desenharPecaFicha(c, 'vista', i), [cfg, v]));
  for (const e of cfg.expressoes) salvar(path.join(pasta, 'expressoes', slug(e.nome) + '.png'), await page.evaluate(([c, i]) => window.desenharPecaFicha(c, 'expressao', i), [cfg, e]));
  for (const p of cfg.poses) salvar(path.join(pasta, 'poses', slug(p.nome) + '.png'), await page.evaluate(([c, i]) => window.desenharPecaFicha(c, 'pose', i), [cfg, p]));
  await browser.close();
  console.log('Pronto.');
})();

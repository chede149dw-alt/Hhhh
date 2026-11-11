// Renderiza um personagem parado em PNG.
// Uso: node motor/png.js personagens/protagonista/personagem.js previas/protagonista-frente.png
//        [--pose parado] [--expressao neutro] [--altura-personagem 1100] [--largura 1080] [--altura 1920] [--fundo #F4F2EE]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const opt = (nome, padrao) => { const i = args.indexOf('--' + nome); return i >= 0 ? args[i + 1] : padrao; };

const [arquivoPersonagem, saida] = pos;
if (!arquivoPersonagem || !saida) {
  console.error('Uso: node motor/png.js <personagem.js> <saida.png> [opções]');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  await page.addScriptTag({ path: path.resolve(arquivoPersonagem) });
  const b64 = await page.evaluate((o) => window.desenharFicha(o), {
    largura: +opt('largura', 1080),
    altura: +opt('altura', 1920),
    alturaPersonagem: +opt('altura-personagem', 1100),
    fundo: opt('fundo', undefined),
    pose: (() => { const p = opt('pose', 'parado'); return p.trim().startsWith('{') ? JSON.parse(p) : p; })(),
    expressao: (() => { const e = opt('expressao', 'neutro'); return e.trim().startsWith('{') ? JSON.parse(e) : e; })(),
  });
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log('Pronto:', saida);
})();

// Prompt 2 — a face iluminada sai exatamente na cor do material (calibração sol 2,0 + ambiente 1,2).
const test = require('node:test');
const assert = require('node:assert');
const puppeteer = require('puppeteer-core');
const { iniciar } = require('../render/servidor');
const { CHROME, FLAGS } = require('../render/quadros');

test('cor iluminada = cor do guia (tolerância 4 por canal)', async () => {
  const srv = await iniciar(require('path').resolve(__dirname, '..', '..'));
  const nav = await puppeteer.launch({ executablePath: CHROME, headless: true, args: FLAGS });
  try {
    const p = await nav.newPage();
    await p.goto(`${srv.url}/motor/visual/teste-estilo.html`);
    await p.waitForFunction('window.pronto === true', { timeout: 60000 });
    const r = await p.evaluate(() => window.medirCores());
    for (const [nome, { alvo, obtido }] of Object.entries(r)) {
      assert.ok(obtido, `${nome}: cor não encontrada`);
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(obtido[i] - alvo[i]) <= 4, `${nome}: ${obtido} ≠ ${alvo}`);
    }
  } finally { await nav.close(); srv.fechar(); }
});

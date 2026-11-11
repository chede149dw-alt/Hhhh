// Prompt 9 — legendas: grupos de 1 a 3 palavras sem atravessar frases; um quadro com legendas difíceis não sai da tela.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { iniciar } = require('../render/servidor');
const { CHROME, FLAGS } = require('../render/quadros');

const P = (frases) => { const ps = []; frases.forEach((f, k) => f.split(' ').forEach((w) => ps.push({ i: ps.length, texto: w, inicio: ps.length * 0.3, fim: ps.length * 0.3 + 0.25, frase: k }))); return ps; };

test('grupos de 1 a 3 palavras, quebra na pontuação, nunca junta frases; destaque marcado', async () => {
  const { agrupar } = await import('../legendas/legendas.js');
  const g = agrupar(P(['E se você acordasse controlando a terra?', 'Lucas sentiu, o chão tremer.']), { destaques: [6, 11] });
  assert.ok(g.every((x) => x.palavras.length >= 1 && x.palavras.length <= 3));
  assert.deepStrictEqual(g.map((x) => x.palavras.map((p) => p.texto).join(' ')),
    ['E SE VOCÊ', 'ACORDASSE CONTROLANDO A', 'TERRA?', 'LUCAS SENTIU,', 'O CHÃO TREMER.']);
  assert.ok(g[2].palavras[0].destaque && g[4].palavras[2].destaque && !g[0].palavras[0].destaque);
  for (let i = 1; i < g.length; i++) assert.ok(g[i].inicio >= g[i - 1].inicio && g[i - 1].fim <= g[i].inicio + 1e-9);
});

test('faixa da legenda fica longe do rosto', async () => {
  const { faixaLonge } = await import('../legendas/legendas.js');
  assert.ok(faixaLonge([{ x: 540, y: 500, r: 200 }]) > 1100);
  assert.ok(faixaLonge([{ x: 540, y: 1500, r: 250 }]) < 900);
});

test('quadro 1080×1920 com legendas difíceis: o texto não sai da tela', async () => {
  const srv = await iniciar(path.resolve(__dirname, '..', '..'));
  const nav = await puppeteer.launch({ executablePath: CHROME, headless: true, args: FLAGS });
  try {
    const p = await nav.newPage();
    await p.goto(`${srv.url}/motor/visual/legenda-teste.html`);
    await p.waitForFunction('window.pronto === true', { timeout: 60000 });
    const r = await p.evaluate(() => {
      window.quadro();
      // além da conta, procura pixels de texto (contorno escuro) nas bordas da imagem
      const ctx = document.getElementById('c').getContext('2d');
      const borda = (x) => { const d = ctx.getImageData(x, 0, 6, 1920).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 60 && d[i + 1] < 60 && d[i + 2] < 70) n++; return n; };
      return { medidas: window.medidas, esquerda: borda(0), direita: borda(1074) };
    });
    for (const m of r.medidas) {
      assert.ok(m.x0 >= 0 && m.x1 <= 1080 && m.y0 >= 0 && m.y1 <= 1920, `"${m.texto}" sai da tela: ${JSON.stringify(m)}`);
    }
    assert.ok(r.medidas[0].tamanho < 96, 'palavras longas deviam diminuir a fonte');
    assert.strictEqual(r.esquerda + r.direita, 0, 'há texto encostando na borda');
  } finally { await nav.close(); srv.fechar(); }
});

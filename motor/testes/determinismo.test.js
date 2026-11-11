// Prompt 1 — o mesmo instante sempre gera o mesmo quadro, em qualquer ordem de render.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { renderizar } = require('../render/quadros');

const md5 = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

test('quadros 0 e 90 iguais em ordens diferentes (md5)', async () => {
  const a = fs.mkdtempSync(path.join(os.tmpdir(), 'det-a-'));
  const b = fs.mkdtempSync(path.join(os.tmpdir(), 'det-b-'));
  await renderizar({ pagina: 'motor/visual/teste-render.html', lista: [0, 90], saida: a });
  await renderizar({ pagina: 'motor/visual/teste-render.html', lista: [90, 0], saida: b });
  for (const q of ['quadro_00000.png', 'quadro_00090.png']) assert.strictEqual(md5(path.join(a, q)), md5(path.join(b, q)), q);
  assert.notStrictEqual(md5(path.join(a, 'quadro_00000.png')), md5(path.join(a, 'quadro_00090.png')), 'quadros diferentes no tempo');
});

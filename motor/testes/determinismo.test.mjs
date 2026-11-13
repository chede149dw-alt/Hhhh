// Mesmo instante => mesmo quadro, independente da ordem e do processo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { renderizar } from '../render/renderizar.mjs';
import { RAIZ } from '../render/servidor.mjs';

const md5 = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
const PAGINA = 'motor/visual/testes/relogio.html';

test('quadros 0 e 90 iguais em ordem direta e invertida', { timeout: 120000 }, async () => {
  const base = path.join(RAIZ, 'projetos/_testes/determinismo');
  const a = path.join(base, 'a'), b = path.join(base, 'b');
  fs.rmSync(base, { recursive: true, force: true });
  await renderizar({ pagina: PAGINA, quadros: [0, 90], saida: a });
  await renderizar({ pagina: PAGINA, quadros: [90, 0], saida: b });
  for (const q of ['00000', '00090']) {
    const f = `quadro_${q}.png`;
    assert.equal(md5(path.join(a, f)), md5(path.join(b, f)), `md5 diferente no ${f}`);
  }
  assert.notEqual(md5(path.join(a, 'quadro_00000.png')), md5(path.join(a, 'quadro_00090.png')), 'cena não se moveu');
});

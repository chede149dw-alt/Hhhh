// A cor iluminada de uma face de frente para a luz principal deve ser igual à cor do material.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medirEstilo } from '../render/medir_estilo.mjs';

const dif = (a, b) => Math.max(...[1, 3, 5].map((i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16))));

for (const [nome, query] of [['render direto', 'calib=1&pos=0'], ['pós-processo neutro', 'calib=1&pos=neutro']]) {
  test(`calibração da cor (${nome})`, { timeout: 60000 }, async () => {
    for (const m of await medirEstilo(query)) {
      assert.ok(dif(m.face, m.esperado) <= 2, `${m.nome}: face ${m.face} ≠ ${m.esperado}`);
      assert.ok(dif(m.ref, m.esperado) <= 2, `${m.nome}: referência ${m.ref} ≠ ${m.esperado}`);
    }
  });
}

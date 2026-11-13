import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { REPOUSO, POSES, misturar, derivar, valor, validarPose, JUNTAS } from '../animacao/poses.js';
import { validarFicha, calcularMedidas } from '../visual/boneco/medidas.js';

test('misturar: k=0 dá a, k=1 dá b, k=0.5 dá a média', () => {
  const a = POSES.repouso, b = POSES.acenar;
  for (const [k, ref] of [[0, a], [1, b]]) {
    const r = misturar(a, b, k);
    for (const j of JUNTAS) for (const c of Object.keys(r[j] || {})) assert.equal(valor(r, j, c), valor(ref, j, c), `${j}.${c} em k=${k}`);
  }
  const m = misturar(a, b, 0.5);
  assert.equal(valor(m, 'cotoveloD', 'dobra'), (valor(a, 'cotoveloD', 'dobra') + valor(b, 'cotoveloD', 'dobra')) / 2);
  assert.equal(valor(misturar(a, b, 0.49), 'rosto', 'boca'), 'neutra');
  assert.equal(valor(misturar(a, b, 0.5), 'rosto', 'boca'), 'sorriso');
});

test('padrões: canal ausente = 0, olhos = 1, indicador herda fecha', () => {
  assert.equal(valor({}, 'coxaD', 'frente'), 0);
  assert.equal(valor({}, 'rosto', 'olhos'), 1);
  assert.equal(valor({ maoD: { fecha: 70 } }, 'maoD', 'indicador'), 70);
  assert.equal(valor(POSES.apontar, 'maoD', 'indicador'), 0);
});

test('derivar não altera a base', () => {
  const antes = JSON.stringify(REPOUSO);
  derivar(REPOUSO, { cabeca: { giro: 30 } });
  assert.equal(JSON.stringify(REPOUSO), antes);
});

test('validarPose recusa nomes errados listando os existentes', () => {
  assert.throws(() => validarPose({ cotovelo: { dobra: 10 } }), /não existe. Existentes: quadril/);
  assert.throws(() => validarPose({ joelhoD: { frente: 10 } }), /Existentes: dobra/);
  assert.throws(() => validarPose({ rosto: { boca: 'gritando' } }), /neutra, sorriso, triste, aberta/);
  for (const p of Object.values(POSES)) validarPose(p);
});

test('fichas válidas e medidas coerentes', () => {
  const dir = new URL('../visual/boneco/fichas/', import.meta.url);
  const arqs = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(arqs.length >= 3);
  for (const a of arqs) {
    const f = JSON.parse(fs.readFileSync(new URL(a, dir)));
    assert.deepEqual(validarFicha(f), [], a);
    const m = calcularMedidas(f);
    const topo = m.olhosY + m.cabecaR * 1.05;
    assert.ok(Math.abs(topo - m.H) / m.H < 0.06, `${a}: topo da cabeça ${topo.toFixed(2)} vs altura ${m.H}`);
  }
  assert.match(validarFicha({ nome: 'x', altura: 3, cores: {}, pecas: { chapeu: 'x' } }).join('|'), /altura 3.*pele.*chapeu/);
});

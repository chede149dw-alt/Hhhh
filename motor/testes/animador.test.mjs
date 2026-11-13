import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { criarAnimacao, CURVAS } from '../animacao/animador.js';
import { resolver } from '../animacao/ik.js';
import { pontos } from '../animacao/esqueleto.js';
import { REPOUSO, POSES, derivar, valor, GRUPOS } from '../animacao/poses.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';
import { sub, len, add } from '../animacao/mat.js';

const ficha = JSON.parse(fs.readFileSync(new URL('../visual/boneco/fichas/gabriel.json', import.meta.url)));
const m = calcularMedidas(ficha);
const erro = (a, b) => len(sub(a, b));

// corpos variados: girado, deslocado, inclinado, esticado
// (joelho levemente dobrado: com a perna 100% esticada o pé no chão fica no limite do alcance)
const CORPOS = [
  { desl: { y: -0.03 } },
  { corpo: { x: 0.3, z: -0.2, giro: 35 } },
  { corpo: { giro: -120, estica: 0.08 }, desl: { y: -0.08, z: 0.03 }, quadril: { giro: 12, lado: 5, frente: 8 } },
  { corpo: { estica: -0.07, y: 0.05 }, desl: { y: -0.15 }, quadril: { frente: -10 }, peito: { frente: 20 } },
];

test('IK do pé: a sola chega ao alvo com erro < 1e-6 m', () => {
  let n = 0;
  for (const c of CORPOS) {
    const base = derivar(derivar(REPOUSO, { desl: { y: -0.05 } }), c);
    const p0 = pontos(base, m);
    for (const [dx, dy, dz] of [[0, 0, 0], [0.08, 0, 0.12], [-0.05, 0.06, -0.1], [0.07, 0.02, 0.13], [0, 0.15, 0.05]]) {
      for (const pe of ['peD', 'peE']) {
        const alvo = add([p0[pe][0], 0, p0[pe][2]], [dx, dy, dz]);
        const r = resolver(base, m, pe, alvo);
        assert.ok(r._alcancou[pe], `fora de alcance: ${pe} ${alvo}`);
        const e = erro(pontos(r, m)[pe], alvo);
        assert.ok(e < 1e-6, `${pe} erro ${e} (corpo ${JSON.stringify(c)})`);
        n++;
      }
    }
  }
  assert.equal(n, 40);
});

test('IK da mão: o pulso chega ao alvo com erro < 1e-6 m', () => {
  for (const c of CORPOS) {
    const base = derivar(REPOUSO, c);
    const p0 = pontos(base, m);
    for (const [dx, dy, dz] of [[0, 0.3, 0.25], [0.1, 0.45, 0.3], [-0.05, 0.2, 0.15]]) {
      for (const mao of ['maoD', 'maoE']) {
        const alvo = add(p0[mao], [mao === 'maoD' ? -dx : dx, dy, dz]);
        const alvoMundo = alvo;
        const r = resolver(base, m, mao, alvoMundo);
        assert.ok(r._alcancou[mao]);
        assert.ok(erro(pontos(r, m)[mao], alvoMundo) < 1e-6, `${mao} ${JSON.stringify(c)}`);
      }
    }
  }
});

test('pé plantado não se move em 60 quadros de movimento do corpo', () => {
  const p0 = pontos(REPOUSO, m);
  const solo = (p) => [p[0], 0, p[2]];
  const anim = criarAnimacao([
    { t: 0, pose: derivar(REPOUSO, { desl: { y: -0.03 } }), peDAlvo: solo(p0.peD), peEAlvo: solo(p0.peE) },
    { t: 0.5, pose: derivar(REPOUSO, { corpo: { x: 0.08, z: 0.05, giro: 10 }, desl: { y: -0.12 }, quadril: { giro: 15, lado: 6 }, coluna: { frente: 15 } }), curva: 'antecipa' },
    { t: 1.0, pose: derivar(REPOUSO, { corpo: { x: -0.05, estica: 0.06 }, desl: { y: -0.04 }, quadril: { giro: -10 } }), curva: 'passa' },
  ], { medidas: m });
  for (let q = 0; q <= 60; q++) {
    const p = pontos(anim.em(q / 60), m);
    assert.ok(erro(p.peD, solo(p0.peD)) < 1e-6, `peD deslizou no quadro ${q}`);
    assert.ok(erro(p.peE, solo(p0.peE)) < 1e-6, `peE deslizou no quadro ${q}`);
  }
});

test('interpolação: em(t) nas chaves devolve a pose da chave; chave sem pose é pausa', () => {
  const chaves = [
    { t: 0, pose: REPOUSO },
    { t: 0.4, pose: POSES.acenar, curva: 'antecipa' },
    { t: 0.9 },                                     // pausa
    { t: 1.3, pose: POSES.assustado, curva: 'estalo' },
    { t: 2.0, pose: POSES.sentar, curva: 'passa' },
  ];
  const anim = criarAnimacao(chaves);
  const esperadas = [REPOUSO, POSES.acenar, POSES.acenar, POSES.assustado, POSES.sentar];
  chaves.forEach((c, i) => {
    const p = anim.em(c.t, { puro: true });
    for (const g of GRUPOS) for (const ca of Object.keys({ ...p[g], ...esperadas[i][g] })) {
      const a = valor(p, g, ca), b = valor(esperadas[i], g, ca);
      if (typeof a === 'number') assert.ok(Math.abs(a - b) < 1e-9, `chave ${i}: ${g}.${ca} ${a} ≠ ${b}`);
      else assert.equal(a, b);
    }
  });
  // durante a pausa a pose não muda
  assert.deepEqual(anim.em(0.6, { puro: true }), anim.em(0.85, { puro: true }));
});

test('curvas: 0→0, 1→1; antecipa recua; passa ultrapassa; erros claros', () => {
  for (const [nome, f] of Object.entries(CURVAS)) {
    assert.ok(Math.abs(f(0)) < 1e-12, nome); assert.ok(Math.abs(f(1) - 1) < 1e-12, nome);
  }
  assert.ok(CURVAS.antecipa(0.2) < 0);
  assert.ok(CURVAS.passa(0.8) > 1);
  assert.throws(() => criarAnimacao([{ t: 1, pose: REPOUSO }, { t: 0.5, pose: REPOUSO }]), /fora de ordem/);
  assert.throws(() => criarAnimacao([{ t: 0, pose: REPOUSO }, { t: 1, pose: REPOUSO, curva: 'mola' }]), /Existentes: linear, suave/);
  assert.throws(() => criarAnimacao([{ t: 0, pose: REPOUSO, peDAlvo: [0, 0, 0] }]), /medidas/);
});

test('vida: respira e pisca; infiltrado (estranho ≥ 0,3) não pisca', () => {
  const normal = criarAnimacao([{ t: 0, pose: REPOUSO }, { t: 10, pose: REPOUSO }]);
  const olhos = Array.from({ length: 600 }, (_, q) => valor(normal.em(q / 60), 'rosto', 'olhos'));
  assert.ok(Math.min(...olhos) < 0.05, 'nunca piscou');
  const peito = Array.from({ length: 300 }, (_, q) => valor(normal.em(q / 60), 'peito', 'frente'));
  assert.ok(Math.max(...peito) - Math.min(...peito) > 2, 'não respira');
  const infil = derivar(REPOUSO, { rosto: { estranho: 0.5 } });
  const ai = criarAnimacao([{ t: 0, pose: infil }, { t: 10, pose: infil }]);
  for (let q = 0; q < 600; q++) assert.equal(valor(ai.em(q / 60), 'rosto', 'olhos'), 1);
});

test('arrasto: cabeça chega depois do tronco', () => {
  const a = derivar(REPOUSO, { coluna: { giro: 0 }, cabeca: { giro: 0 } });
  const b = derivar(REPOUSO, { coluna: { giro: 40 }, cabeca: { giro: 40 } });
  const anim = criarAnimacao([{ t: 0, pose: a }, { t: 0.5, pose: b, curva: 'linear' }], { vida: false });
  const p = anim.em(0.25);
  assert.ok(valor(p, 'cabeca', 'giro') < valor(p, 'coluna', 'giro') - 2);
});

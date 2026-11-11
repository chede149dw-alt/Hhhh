// Prompt 4 — animador por poses-chave: interpolação, IK dos pés e das mãos, pé plantado.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const FICHA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'personagens', 'lucas', '3d', 'ficha.json'), 'utf8'));
const carregar = async () => ({
  THREE: await import('three'),
  ...(await import('../personagem/boneco.js')),
  ...(await import('../animacao/animador.js')),
  ...(await import('../animacao/aplicar.js')),
  ...(await import('../animacao/atuacoes.js')),
});

const perto = (a, b, tol, onde = '') => {
  if (typeof a === 'number') { assert.ok(Math.abs(a - b) <= tol, `${onde}: ${a} ≠ ${b}`); return; }
  if (Array.isArray(a)) { a.forEach((v, i) => perto(v, b[i], tol, `${onde}[${i}]`)); return; }
  if (a && typeof a === 'object') { for (const k of Object.keys(a)) perto(a[k], b[k], tol, `${onde}.${k}`); return; }
  assert.strictEqual(a, b, onde);
};

test('em(t) nos instantes das chaves devolve a pose da chave', async () => {
  const { criarAnimacao, ATAQUE_SALTO } = await carregar();
  const anim = criarAnimacao(ATAQUE_SALTO);
  for (const c of anim.chaves) perto(c.pose, anim.em(c.t), 1e-12, c.nome);
});

test('curvas: começam em 0 e terminam em 1', async () => {
  const { CURVAS } = await carregar();
  for (const [n, f] of Object.entries(CURVAS)) { perto(f(0), 0, 1e-12, n); perto(f(1), 1, 1e-12, n); }
  assert.ok(CURVAS.antecipa(0.2) < 0, 'antecipa recua antes de ir');
});

test('IK: a sola e o pulso chegam ao alvo com erro < 1e-6 m', async () => {
  const { THREE, criarBoneco, aplicar, pontoSola, pontoPulso } = await carregar();
  const b = criarBoneco(FICHA);
  const casos = [
    { peEAlvo: [0.12, 0, 0.1], peDAlvo: [-0.1, 0, -0.12], altura: -0.15 },
    { peEAlvo: [0.2, 0.1, 0.25], peDAlvo: [-0.05, 0, 0], altura: -0.2, corpo: { x: 0.1, z: 0.05, giro: 25 }, juntas: { pe_e: [15, 0, 0] } },
    { maoEAlvo: [0.25, 1.0, 0.3], maoDAlvo: [-0.2, 1.2, 0.25], juntas: { peito: [5, 10, 0] } },
  ];
  for (const p of casos) {
    aplicar(b, p);
    for (const [campo, f, lado] of [['peEAlvo', pontoSola, 'e'], ['peDAlvo', pontoSola, 'd'], ['maoEAlvo', pontoPulso, 'e'], ['maoDAlvo', pontoPulso, 'd']]) {
      if (!p[campo]) continue;
      const erro = f(b, lado, new THREE.Vector3()).distanceTo(new THREE.Vector3(...p[campo]));
      assert.ok(erro < 1e-6, `${campo}: erro ${erro.toExponential(2)} m`);
    }
  }
});

test('pé plantado não se move em 60 quadros de um movimento do corpo', async () => {
  const { THREE, criarBoneco, criarAnimacao, aplicar, pontoSola } = await carregar();
  const b = criarBoneco(FICHA);
  const pes = { peEAlvo: [0.12, 0, 0.08], peDAlvo: [-0.12, 0, -0.1] };
  const anim = criarAnimacao([
    { t: 0, pose: { ...pes, altura: -0.03, juntas: { coluna: [0, 0, 0] } } },
    { t: 1, curva: 'suave', pose: { ...pes, altura: -0.22, corpo: { x: 0.06, z: 0.04, giro: 20 }, quadril: [0.03, 0, 0], juntas: { coluna: [25, -10, 0], cabeca: [-15, 0, 0] } } },
  ]);
  const inicio = {};
  let maior = 0;
  for (let q = 0; q < 60; q++) {
    aplicar(b, anim.final(q / 59));
    for (const lado of ['e', 'd']) {
      const p = pontoSola(b, lado, new THREE.Vector3());
      if (!inicio[lado]) inicio[lado] = p.clone();
      maior = Math.max(maior, p.distanceTo(inicio[lado]));
    }
  }
  assert.ok(maior < 1e-6, `pé deslizou ${maior.toExponential(2)} m`);
});

test('arrasto: a cabeça chega depois do tronco; vida: respira e pisca', async () => {
  const { criarAnimacao, piscar } = await carregar();
  const anim = criarAnimacao([{ t: 0, pose: { juntas: { cabeca: [0, 0, 0] } } }, { t: 1, curva: 'linear', pose: { juntas: { cabeca: [30, 0, 0] } } }]);
  assert.ok(anim.em(0.5, { arrasto: true }).juntas.cabeca[0] < anim.em(0.5).juntas.cabeca[0]);
  let fechou = false;
  for (let q = 0; q < 600; q++) if (piscar(q / 60) > 0.9) fechou = true;
  assert.ok(fechou, 'não piscou em 10 s');
});

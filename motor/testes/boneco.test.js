// Prompt 3 — boneco articulado: juntas, medidas, poses e mistura.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const FICHA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'personagens', 'lucas', '3d', 'ficha.json'), 'utf8'));
const carregar = async () => ({ THREE: await import('three'), ...(await import('../personagem/boneco.js')) });
const caixa = (THREE, obj) => { obj.updateMatrixWorld(true); return new THREE.Box3().setFromObject(obj); };

test('tem todas as juntas e a altura da ficha, com a sola no chão', async () => {
  const { THREE, criarBoneco, JUNTAS } = await carregar();
  const b = criarBoneco(FICHA);
  for (const j of JUNTAS) assert.ok(b.juntas[j], `falta a junta ${j}`);
  const cx = caixa(THREE, b.raiz);
  assert.ok(Math.abs(cx.min.y) < 0.01, `sola em ${cx.min.y.toFixed(3)} m`);
  assert.ok(Math.abs(cx.max.y - FICHA.altura) < 0.05, `altura ${cx.max.y.toFixed(3)} m`);
});

test('altura da ficha escala o boneco inteiro', async () => {
  const { THREE, criarBoneco } = await carregar();
  const cx = caixa(THREE, criarBoneco({ ...FICHA, altura: 1.8 }).raiz);
  assert.ok(Math.abs(cx.max.y - cx.min.y - 1.8 * (caixa(THREE, criarBoneco(FICHA).raiz).max.y / FICHA.altura)) < 0.02);
});

test('misturar: pontas iguais às poses e meio no meio', async () => {
  const { misturar, POSES, REPOUSO } = await carregar();
  const a = REPOUSO, b = POSES.acenar;
  assert.deepStrictEqual(misturar(a, b, 0).juntas.ombro_d, a.juntas.ombro_d);
  assert.deepStrictEqual(misturar(a, b, 1).juntas.ombro_d, b.juntas.ombro_d);
  const meio = misturar(a, b, 0.5).juntas.ombro_d;
  meio.forEach((v, i) => assert.ok(Math.abs(v - (a.juntas.ombro_d[i] + b.juntas.ombro_d[i]) / 2) < 1e-9));
  assert.strictEqual(misturar(a, b, 0.4).rosto, 'neutro');
  assert.strictEqual(misturar(a, b, 0.6).rosto, 'feliz');
});

test('sentar abaixa o quadril e as 4 poses aplicam sem erro', async () => {
  const { THREE, criarBoneco, POSES } = await carregar();
  const b = criarBoneco(FICHA);
  const yQuadril = () => { b.raiz.updateMatrixWorld(true); return b.juntas.quadril.getWorldPosition(new THREE.Vector3()).y; };
  const em = yQuadril();
  for (const p of ['acenar', 'apontar', 'sentar', 'assustado']) b.posar(POSES[p]);
  b.posar(POSES.sentar);
  assert.ok(yQuadril() < em - 0.25, 'quadril não desceu ao sentar');
});

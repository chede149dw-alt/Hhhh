import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { enquadrar, mover, tremor, projetar, TAMANHOS } from '../animacao/camera.js';
import { olharPara, erroDoOlhar, olharAtual } from '../animacao/olhar.js';
import { estados } from '../animacao/atuacoes.js';
import { derivar } from '../animacao/poses.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';
import { fk, raiz } from '../animacao/esqueleto.js';
import { mul, mv } from '../animacao/mat.js';

const m = calcularMedidas(JSON.parse(fs.readFileSync(new URL('../visual/boneco/fichas/gabriel.json', import.meta.url))));
const ator = { x: 1.3, z: -0.6, giro: -63 };

test('geral: corpo inteiro dentro do quadro com folga', () => {
  const e = enquadrar({ ator, medidas: m, tamanho: 'geral' });
  const pe = projetar([ator.x, 0, ator.z], e), topo = projetar([ator.x, m.topo + 0.03, ator.z], e);
  assert.ok(pe[1] < 0.97 && pe[1] > 0.8, `pé em y=${pe[1]}`);
  assert.ok(topo[1] > 0.03 && topo[1] < 0.2, `topo em y=${topo[1]}`);
});

test('médio: cintura perto da base, cabeça dentro', () => {
  const e = enquadrar({ ator, medidas: m, tamanho: 'medio' });
  const cint = projetar([ator.x, m.pernaComp, ator.z], e), topo = projetar([ator.x, m.topo, ator.z], e);
  assert.ok(cint[1] > 0.85 && cint[1] < 1.08, `cintura em ${cint[1]}`);
  assert.ok(topo[1] > 0.02 && topo[1] < 0.2, `topo em ${topo[1]}`);
});

test('close: olhos no terço de cima', () => {
  const e = enquadrar({ ator, medidas: m, tamanho: 'close' });
  const olho = projetar([ator.x, m.olhosY, ator.z], e);
  assert.ok(olho[1] > 0.25 && olho[1] < 0.45, `olhos em ${olho[1]}`);
  assert.ok(Math.abs(olho[0] - 0.5) < 0.01);
});

test('área livre: câmera não passa do raio e abre a lente mantendo o enquadramento', () => {
  const livre = 1.6, e = enquadrar({ ator, medidas: m, tamanho: 'geral', livre });
  assert.ok(e.dist <= livre + 1e-9 && e.fov > 30);
  const pe = projetar([ator.x, 0, ator.z], e), topo = projetar([ator.x, m.topo, ator.z], e);
  assert.ok(pe[1] < 1 && topo[1] > 0);
});

test('limites da sala: a câmera não sai da caixa (nem entra na prateleira)', () => {
  const sala = { x0: -2.2, x1: 2.2, z0: -3.0, z1: 1.2, margem: 0.35 };
  for (const ang of [0, 45, 90, 135, 180, 270]) {
    const e = enquadrar({ ator: { x: 0.3, z: -1.4, giro: 160 }, medidas: m, tamanho: 'geral', angulo: ang, limites: sala });
    assert.ok(e.pos[0] >= sala.x0 + 0.35 - 1e-9 && e.pos[0] <= sala.x1 - 0.35 + 1e-9 && e.pos[2] >= sala.z0 + 0.35 - 1e-9 && e.pos[2] <= sala.z1 - 0.35 + 1e-9, `ângulo ${ang}: ${e.pos}`);
    const pe = projetar([0.3, 0, -1.4], e), topo = projetar([0.3, m.topo, -1.4], e);
    assert.ok(pe[1] <= 1 && topo[1] >= 0, `ângulo ${ang}: enquadramento perdido`);
  }
});

test('ângulo 0 = de frente para o ator; movimentos; tremor determinístico', () => {
  const e = enquadrar({ ator: { x: 0, z: 0, giro: 0 }, medidas: m, tamanho: 'medio' });
  assert.ok(e.pos[2] > 1 && Math.abs(e.pos[0]) < 1e-9);
  const emp = mover(e, { empurrar: 0.25 }, 1);
  assert.ok(Math.abs(emp.pos[2] - e.pos[2] * 0.75) < 1e-9);
  const lat = mover(e, { lateral: 0.5 }, 1);
  assert.ok(Math.abs(Math.abs(lat.pos[0]) - 0.5) < 1e-9);
  assert.deepEqual(tremor(1.234, 0.03), tremor(1.234, 0.03));
  assert.notDeepEqual(tremor(1.234, 0.03), tremor(1.25, 0.03));
  assert.throws(() => enquadrar({ ator, medidas: m, tamanho: 'americano' }), /Existentes: geral, medio, close/);
});

// rolagem do olhar: ângulo do "direita" da cabeça com o plano horizontal (graus)
function rolagem(p) {
  const f = fk(p, m), rz = raiz(p), R = mul(rz.R, f.R.cabeca);
  const dir = mv(R, [1, 0, 0]);
  return Math.asin(Math.max(-1, Math.min(1, dir[1]))) * 180 / Math.PI;
}

test('olharPara: o olhar aponta para o alvo (< 0,5°), inclusive alvos de lado e atrás', () => {
  const base = derivar(estados(m).em_pe, { corpo: { x: -0.55, z: 0.3, giro: 0 } });
  for (const alvo of [[1.3, 1.0, -0.6], [-0.55, 1.4, 1.9], [-1.9, 1.0, 0.1], [0.2, 0.9, 0.6], [-0.6, 0.2, 0.5], [-1.65, 1.0, 0.3]]) {
    const p = olharPara(base, m, alvo);
    assert.ok(erroDoOlhar(p, m, alvo) < 0.5, `alvo ${alvo}: erro ${erroDoOlhar(p, m, alvo).toFixed(2)}°`);
    assert.ok(Math.abs(rolagem(p)) < 4, `alvo ${alvo}: horizonte torto ${rolagem(p).toFixed(1)}°`);
  }
});

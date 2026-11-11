// Prompt 6 — câmera por tamanho de plano: enquadramento, área livre e movimentos.
const test = require('node:test');
const assert = require('node:assert');
const carregar = () => import('../cena/camera.js');
const ANCORA = { pes: [0, 0, 0], cabeca: [0, 1.45, 0], giro: 0 };
const altQuadro = (c) => 2 * c.distancia * Math.tan((c.fov * Math.PI) / 360);
const dist2d = (p, c) => Math.hypot(p[0] - c[0], p[2] - c[1]);

test('cada tamanho de plano mostra a altura de quadro certa', async () => {
  const { enquadrar, TAMANHOS } = await carregar();
  for (const [nome, t] of Object.entries(TAMANHOS)) {
    const c = enquadrar(nome, ANCORA, { lado: 20 });
    assert.ok(Math.abs(altQuadro(c) - t.altura) < 1e-9, `${nome}: ${altQuadro(c)}`);
  }
  assert.ok(enquadrar('close', ANCORA).distancia < enquadrar('medio', ANCORA).distancia);
  assert.ok(enquadrar('medio', ANCORA).distancia < enquadrar('geral', ANCORA).distancia);
});

test('área livre: a câmera fica dentro do círculo e o enquadramento se mantém', async () => {
  const { enquadrar, TAMANHOS } = await carregar();
  const area = { centro: [0, 0.2], raio: 1.4 };
  for (const nome of Object.keys(TAMANHOS)) for (let lado = -90; lado <= 90; lado += 30) {
    const c = enquadrar(nome, ANCORA, { lado, areaLivre: area });
    assert.ok(dist2d(c.pos, area.centro) <= area.raio + 1e-6, `${nome}/${lado}: fora da área`);
    assert.ok(Math.abs(altQuadro(c) - TAMANHOS[nome].altura) < 1e-6, `${nome}/${lado}: enquadramento mudou`);
  }
});

test('movimentos: empurrar aproxima, puxar afasta, tremor só no tempo dele, mesmo t = mesma câmera', async () => {
  const { camNoTempo } = await carregar();
  const emp = { tamanho: 'medio', lado: 20, movimento: { tipo: 'empurrar', forca: 0.2 } };
  const a = camNoTempo(emp, ANCORA, 0, 2), b = camNoTempo(emp, ANCORA, 2, 2);
  assert.ok(Math.abs(b.distancia - a.distancia * 0.8) < 1e-9);
  const pux = { tamanho: 'medio', lado: 20, movimento: { tipo: 'puxar', forca: 0.2 } };
  assert.ok(camNoTempo(pux, ANCORA, 2, 2).distancia > camNoTempo(pux, ANCORA, 0, 2).distancia);
  const tr = { tamanho: 'medio', lado: 20, tremores: [{ t: 1, forca: 0.05, dur: 0.4 }] };
  assert.deepStrictEqual(camNoTempo(tr, ANCORA, 0.5, 2), camNoTempo({ tamanho: 'medio', lado: 20 }, ANCORA, 0.5, 2));
  assert.notDeepStrictEqual(camNoTempo(tr, ANCORA, 1.1, 2).pos, camNoTempo({ tamanho: 'medio', lado: 20 }, ANCORA, 1.1, 2).pos);
  assert.deepStrictEqual(camNoTempo(tr, ANCORA, 1.1, 2), camNoTempo(tr, ANCORA, 1.1, 2));
});

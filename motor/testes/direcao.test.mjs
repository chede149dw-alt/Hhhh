import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilar } from '../direcao/diretor.js';
import { estimarPalavras } from '../direcao/palavras.js';
import { MARCAS } from '../visual/cenarios/distribuidora_dados.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';

const ficha = (n) => calcularMedidas(JSON.parse(fs.readFileSync(new URL(`../visual/boneco/fichas/${n}.json`, import.meta.url))));
const medidas = { gabriel: ficha('gabriel'), eduardo: ficha('eduardo') };
const base = () => ({
  cenario: 'distribuidora',
  atores: { gabriel: { ficha: 'gabriel' }, eduardo: { ficha: 'eduardo', camera: true } },
  inicio: { gabriel: { marca: 'engradado', estado: 'sentado' }, eduardo: { marca: 'balcao' } },
  planos: [
    { id: 1, cena: 'preto', falas: [{ quem: 'eduardo', tipo: 'narracao', texto: 'Era uma noite fria.' }] },
    { id: 2, camera: { olhar: 'gabriel' }, atores: { gabriel: { atuacao: 'sentado_celular', marca: 'engradado', ini: 'ini-0.2' } },
      falas: [{ quem: 'gabriel', texto: 'Ninguém vai aparecer hoje.' }], destaques: [{ palavra: 'aparecer', acao: 'tremor_leve' }] },
    { id: 3, camera: { olhar: 'portinhola', movimento: 'virar' }, atores: { gabriel: { atuacao: 'rir_sentado', ini: 'p8+0.12' } },
      falas: [{ quem: 'eduardo', tipo: 'narracao', texto: 'Aí ela apareceu.' }] },
  ],
});
const comp = (r) => compilar(r, estimarPalavras(r), { marcas: MARCAS, medidas });

test('3 planos: cada plano começa na 1ª palavra; tempos p/ini/palavra; duração = última fala + folga', () => {
  const r = base(), pal = estimarPalavras(r), tl = compilar(r, pal, { marcas: MARCAS, medidas });
  assert.equal(tl.planos.length, 3);
  assert.equal(tl.planos[0].ini, 0);
  assert.equal(tl.planos[1].ini, pal.palavras.find((w) => w.plano === 2).ini);
  assert.equal(tl.planos[2].ini, pal.palavras.find((w) => w.plano === 3).ini);
  assert.equal(tl.planos[0].fim, tl.planos[1].ini);
  assert.ok(Math.abs(tl.duracao - (pal.palavras.at(-1).fim + 1.2)) < 1e-3);
  const g = tl.atores.gabriel;
  assert.ok(Math.abs(g.find((e) => e.atuacao === 'sentado_celular').ini - (tl.planos[1].ini - 0.2)) < 1e-9);
  assert.ok(Math.abs(g.find((e) => e.atuacao === 'rir_sentado').ini - (pal.palavras[7].ini + 0.12)) < 1e-9);
  const ev = tl.eventos[0];
  assert.equal(ev.t, pal.palavras.find((w) => w.texto === 'aparecer').ini);
  assert.ok(tl.efeitos.some((e) => e.tipo === 'preto' && e.ini === 0) && tl.efeitos.some((e) => e.tipo === 'tremor'));
  assert.equal(tl.cameras.length, 2);   // plano preto não tem câmera
});

test('nomes errados são recusados listando os existentes', () => {
  const casos = [
    [(r) => { r.cenario = 'floresta'; }, /Cenário "floresta" não existe. Existentes: distribuidora/],
    [(r) => { r.planos[1].atores.gabriel.atuacao = 'dançar'; }, /atuação "dançar" não existe. Existentes: andar/],
    [(r) => { r.planos[1].atores.gabriel.marca = 'banheiro'; }, /marca "banheiro" não existe. Existentes: balcao/],
    [(r) => { r.planos[1].camera.olhar = 'teto'; }, /olhar "teto" não existe. Existentes: gabriel/],
    [(r) => { r.planos[1].destaques[0].palavra = 'zebra'; }, /palavra "zebra" não existe nas falas do plano/],
    [(r) => { r.planos[1].destaques[0].acao = 'explodir'; }, /ação "explodir" não existe. Existentes: tensao/],
    [(r) => { r.planos[2].atores.gabriel.ini = 'p999'; }, /Palavra 999 não existe/],
    [(r) => { r.planos[2].atores.gabriel.ini = 'depois'; }, /Tempo "depois" não entendido/],
    [(r) => { r.planos[1].atores = { lobisomem: { atuacao: 'andar' } }; }, /ator "lobisomem" não existe. Existentes: gabriel, eduardo/],
  ];
  for (const [mudar, re] of casos) { const r = base(); mudar(r); assert.throws(() => comp(r), re); }
});

test('roteiro real do episódio 1 compila', () => {
  const r = JSON.parse(fs.readFileSync(new URL('../../projetos/infiltrados_ep01/roteiro.json', import.meta.url)));
  const m = { gabriel: ficha('gabriel'), cliente: ficha('cliente'), eduardo: ficha('eduardo') };
  const tl = compilar(r, estimarPalavras(r), { marcas: MARCAS, medidas: m });
  assert.equal(tl.planos.length, 9);
  assert.ok(tl.cartelas.some((c) => c.estilo === 'final' && /PARTE 2/.test(c.sub)));
});

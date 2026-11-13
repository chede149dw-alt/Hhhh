import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ATUACOES, chavesDe, camadasDe, sonsDe, estados, noLugar } from '../animacao/atuacoes.js';
import { criarAnimacao } from '../animacao/animador.js';
import { resolver } from '../animacao/ik.js';
import { pontos } from '../animacao/esqueleto.js';
import { valor, GRUPOS } from '../animacao/poses.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';
import { sub, len } from '../animacao/mat.js';

const fichas = ['gabriel', 'cliente', 'eduardo'].map((n) => JSON.parse(fs.readFileSync(new URL(`../visual/boneco/fichas/${n}.json`, import.meta.url))));
const POSICAO = new Set(['corpo.x', 'corpo.z', 'corpo.giro']);   // onde o ator está não conta

function iguais(a, b, onde) {
  for (const g of GRUPOS) for (const c of new Set([...Object.keys(a[g] || {}), ...Object.keys(b[g] || {})])) {
    if (POSICAO.has(`${g}.${c}`)) continue;
    const va = valor(a, g, c), vb = valor(b, g, c);
    if (typeof va === 'number') assert.ok(Math.abs(va - vb) < 1e-9, `${onde}: ${g}.${c} = ${va}, estado pede ${vb}`);
    else assert.equal(va, vb, `${onde}: ${g}.${c}`);
  }
}

test('pelo menos as 5 genéricas + as do roteiro', () => {
  for (const n of ['andar', 'acenar', 'assustar', 'sentar_triste', 'comemorar', 'sentado_celular', 'rir_sentado', 'levantar',
    'mao_no_cadeado', 'olhar_fixo', 'larissa_grade', 'olhar_camera', 'pegar_latas', 'segurar_celular', 'estender_mao']) assert.ok(ATUACOES[n], n);
});

for (const [nome, a] of Object.entries(ATUACOES)) {
  test(`atuação ${nome}`, () => {
    assert.ok(a.descricao && a.inicio && a.final, 'falta descricao/inicio/final');
    for (const f of fichas) {
      const m = calcularMedidas(f), E = estados(m);
      assert.ok(E[a.inicio] && E[a.final], `estado inexistente (${a.inicio} → ${a.final})`);
      const ch = chavesDe(nome, { medidas: m });
      // ordem e poses
      ch.forEach((k, i) => {
        if (i) assert.ok(k.t > ch[i - 1].t, `chave ${i} fora de ordem`);
        if (k.pose !== undefined) assert.ok(k.pose !== 'pausa' ? Object.keys(k.pose).length > 0 : true, `chave ${i} com pose vazia`);
      });
      assert.ok(ch[0].pose && ch[0].t === 0, 'primeira chave em t=0 com pose');
      // estados de início e fim
      let ultima = ch[0].pose;
      for (const k of ch) if (k.pose && k.pose !== 'pausa') ultima = k.pose;
      iguais(ch[0].pose, E[a.inicio], `${nome}/${f.nome} início`);
      iguais(ultima, E[a.final], `${nome}/${f.nome} final`);
      // IK alcançável nas chaves
      const anim = criarAnimacao(ch, { medidas: m, camadas: camadasDe(nome, { medidas: m }) });
      let pose = ch[0].pose;
      for (const k of ch) {
        if (k.pose && k.pose !== 'pausa') pose = k.pose;
        for (const mb of ['peD', 'peE', 'maoD', 'maoE']) {
          const alvo = k[mb + 'Alvo'];
          if (alvo) assert.ok(resolver(pose, m, mb, alvo)._alcancou[mb], `${nome}/${f.nome}: ${mb} fora de alcance em t=${k.t}`);
        }
      }
      // sons e impacto dentro da duração
      for (const s of sonsDe(nome, { medidas: m })) assert.ok(s.t >= 0 && s.t <= anim.duracao && s.som, `som ${JSON.stringify(s)}`);
      if (a.impacto !== undefined) assert.ok(a.impacto > 0 && a.impacto <= anim.duracao);
      // roda sem erro do começo ao fim
      for (let q = 0; q <= Math.ceil(anim.duracao * 30); q++) anim.em(q / 30);
    }
  });
}

test('andar: pé de apoio não desliza e o corpo chega à distância pedida', () => {
  const m = calcularMedidas(fichas[1]);
  const ctx = { medidas: m, distancia: 1.8 };
  const ch = chavesDe('andar', ctx);
  const anim = criarAnimacao(ch, { medidas: m, camadas: camadasDe('andar', ctx), vida: false });
  // entre duas chaves seguidas, o pé que tem o mesmo alvo nas duas fica parado
  for (let i = 1; i < ch.length - 1; i++) {
    for (const pe of ['peD', 'peE']) {
      const A = ch[i][pe + 'Alvo'] || ch[i - 1][pe + 'Alvo'], B = ch[i + 1][pe + 'Alvo'] || A;
      if (len(sub(A, B)) > 1e-9) continue;
      for (let q = 1; q < 10; q++) {
        const t = ch[i].t + (ch[i + 1].t - ch[i].t) * q / 10;
        assert.ok(len(sub(pontos(anim.em(t), m)[pe], A)) < 1e-6, `${pe} deslizou em t=${t.toFixed(3)}`);
      }
    }
  }
  assert.ok(Math.abs(valor(anim.em(anim.duracao), 'corpo', 'z') - 1.8) < 1e-9);
});

test('noLugar leva a atuação para a marca (pé plantado continua no lugar certo)', () => {
  const m = calcularMedidas(fichas[0]);
  const ch = noLugar(chavesDe('acenar', { medidas: m }), { x: 2, z: -1, giro: 90 });
  const anim = criarAnimacao(ch, { medidas: m });
  const p = pontos(anim.em(1.0), m);
  assert.ok(len(sub(p.peD, ch[0].peDAlvo)) < 1e-6);
  assert.ok(Math.abs(valor(anim.em(1.0), 'corpo', 'giro') - 90) < 1e-9);
  assert.ok(Math.abs(valor(anim.em(1.0), 'corpo', 'x') - 2) < 1e-9);
});

test('nome errado lista as existentes', () => {
  assert.throws(() => chavesDe('dançar', {}), /Existentes: andar, acenar/);
});

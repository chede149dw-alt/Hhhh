// Prompt 5 — biblioteca de atuações: chaves em ordem, sem pose vazia, termina em repouso ou numa pausa declarada.
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
// o que define a pose final (posição no mundo e alvos de IK podem mudar: andar termina em outro lugar)
const essencia = (p) => ({ juntas: p.juntas || {}, altura: p.altura || 0, estica: p.estica === undefined ? 1 : p.estica, maos: p.maos, rosto: p.rosto || 'neutro' });

test('as 5 atuações pedidas existem (e mais as do Lucas)', async () => {
  const { ATUACOES } = await carregar();
  for (const n of ['andar', 'acenar', 'assustar', 'sentar_triste', 'comemorar', 'poder_terra', 'ataque_salto']) assert.ok(ATUACOES[n], n);
});

test('chaves em ordem crescente, sem pose vazia; impacto e sons dentro da duração', async () => {
  const { ATUACOES, montarAtuacao } = await carregar();
  for (const nome of Object.keys(ATUACOES)) {
    const a = montarAtuacao(nome);
    assert.ok(a.descricao, `${nome}: sem descrição`);
    a.chaves.forEach((c, i) => {
      assert.ok(c.pose && Object.keys(c.pose).length > 0, `${nome}: pose vazia na chave ${i}`);
      if (i > 0) assert.ok(c.t > a.chaves[i - 1].t, `${nome}: chave ${i} fora de ordem`);
    });
    const fim = a.chaves.at(-1).t;
    if (a.impacto !== null && a.impacto !== undefined) assert.ok(a.impacto >= 0 && a.impacto <= fim, `${nome}: impacto fora`);
    for (const s of a.sons) assert.ok(s.t >= 0 && s.t <= fim && s.som, `${nome}: som fora`);
  }
});

test('pose final = repouso ou a pausa declarada', async () => {
  const { ATUACOES, montarAtuacao, PAUSAS, REPOUSO } = await carregar();
  for (const nome of Object.keys(ATUACOES)) {
    const a = montarAtuacao(nome);
    const esperado = a.fim === 'repouso' ? REPOUSO : PAUSAS[a.fim];
    assert.ok(esperado, `${nome}: fim "${a.fim}" não declarado`);
    assert.deepStrictEqual(essencia(a.chaves.at(-1).pose), essencia(esperado), nome);
  }
});

test('andar: o pé de apoio não desliza enquanto está no chão', async () => {
  const { THREE, criarBoneco, criarAnimacao, aplicar, pontoSola, montarAtuacao } = await carregar();
  const b = criarBoneco(FICHA);
  const at = montarAtuacao('andar', { passos: 4 });
  const anim = criarAnimacao(at);
  let pior = 0;
  for (const lado of ['e', 'd']) {
    const campo = lado === 'e' ? 'peEAlvo' : 'peDAlvo';
    // trechos em que o alvo do pé é o mesmo em chaves seguidas (pé plantado)
    for (let i = 0; i < at.chaves.length - 1; i++) {
      const a = at.chaves[i].pose[campo], c = at.chaves[i + 1].pose[campo];
      if (!a || !c || a.some((v, k) => v !== c[k]) || a[1] !== 0) continue;
      let ref = null;
      for (let q = 0; q <= 10; q++) {
        const t = at.chaves[i].t + ((at.chaves[i + 1].t - at.chaves[i].t) * q) / 10;
        aplicar(b, anim.final(t));
        const p = pontoSola(b, lado, new THREE.Vector3());
        if (!ref) ref = p.clone();
        pior = Math.max(pior, p.distanceTo(ref));
      }
    }
  }
  assert.ok(pior < 1e-6, `pé de apoio deslizou ${pior.toExponential(2)} m`);
});

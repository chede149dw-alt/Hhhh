// Prompt 7 — direção: roteiro → planos com tempos certos; nomes errados recusados com a lista dos existentes.
const test = require('node:test');
const assert = require('node:assert');
const carregar = () => import('../direcao/direcao.js');

// narração de mentira com tempos fixos: 3 frases, 9 palavras
const P = [
  ['Lucas', 0.2, 0.6, 0], ['acordou', 0.65, 1.1, 0], ['diferente.', 1.15, 1.7, 0],
  ['Sentiu', 2.0, 2.4, 1], ['a', 2.45, 2.5, 1], ['terra.', 2.55, 3.0, 1],
  ['E', 3.3, 3.4, 2], ['arremessou', 3.45, 4.1, 2], ['tudo!', 4.15, 4.6, 2],
].map(([texto, inicio, fim, frase], i) => ({ i, texto, inicio, fim, frase }));
const CAT = { cenarios: ['quarto', 'rua'], atuacoes: ['andar', 'poder_terra', 'arremesso_terra'], impactos: { poder_terra: 1.2, arremesso_terra: 3.25, andar: 0 }, efeitos: ['tremor'] };
const ROT = () => ({ folga: 0.5, frases: [
  { texto: 'Lucas acordou diferente.', cenario: 'quarto', atores: [{ nome: 'lucas' }], camera: [{ tamanho: 'geral' }, { inicio: 0.8, tamanho: 'medio' }] },
  { texto: 'Sentiu a terra.', cenario: 'quarto', atores: [{ nome: 'lucas' }], acoes: [{ ator: 'lucas', atuacao: 'poder_terra', palavra: 'terra' }], efeitos: [{ tipo: 'tremor', inicio: 'p5+0.1', fim: 'fim-0.2' }] },
  { texto: 'E arremessou tudo!', cenario: 'quarto', atores: [{ nome: 'lucas', atuacao: 'arremesso_terra', inicio: 'p7-3.25' }] },
] });

test('planos começam na 1ª palavra da frase; duração = fim da fala + folga', async () => {
  const { dirigir } = await carregar();
  const l = dirigir(ROT(), P, CAT);
  assert.deepStrictEqual(l.planos.map((p) => [p.inicio, p.fim]), [[0, 2.0], [2.0, 3.3], [3.3, 5.1]]);
  assert.strictEqual(l.duracao, 5.1);
});

test('tempos: segundos, "pN+x", "fim-x"; câmera corta dentro do plano', async () => {
  const { dirigir } = await carregar();
  const l = dirigir(ROT(), P, CAT);
  const [c1, c2] = l.planos[0].cameras;
  assert.deepStrictEqual([c1.de, c1.ate, c2.de, c2.ate], [0, 0.8, 0.8, 2.0]);
  const ef = l.planos[1].efeitos[0];
  assert.ok(Math.abs(ef.de - 2.65) < 1e-9 && Math.abs(ef.ate - 3.1) < 1e-9);
  const seg = l.planos[2].atores[0].segmentos[0];
  assert.ok(Math.abs(seg.inicio - (3.45 - 3.25)) < 1e-9);
});

test('palavra de destaque: o impacto da atuação cai na palavra', async () => {
  const { dirigir } = await carregar();
  const s = dirigir(ROT(), P, CAT).planos[1].atores[0].segmentos[0];
  assert.strictEqual(s.tPalavra, 2.55);
  assert.ok(Math.abs(s.inicio + 1.2 - 2.55) < 1e-9);
});

test('recusa nomes errados com mensagem clara e a lista dos existentes', async () => {
  const { dirigir, ErroRoteiro } = await carregar();
  const casos = [
    [(r) => { r.frases[0].cenario = 'floresta'; }, /Cenário desconhecido.*"floresta".*quarto, rua/],
    [(r) => { r.frases[1].acoes[0].atuacao = 'voar'; }, /Atuação desconhecid.*"voar".*andar, poder_terra/],
    [(r) => { r.frases[1].acoes[0].palavra = 'pedra'; }, /palavra "pedra" não está na frase.*Sentiu a terra/],
    [(r) => { r.frases[1].efeitos[0].inicio = 'p40'; }, /Palavra p40 não existe.*p0 a p8/],
    [(r) => { r.frases[1].acoes[0].ator = 'rafael'; }, /ator "rafael".*Atores: lucas/],
    [(r) => { r.frases[0].camera[1].inicio = 'meio+1'; }, /Tempo inválido/],
  ];
  for (const [estraga, msg] of casos) {
    const r = ROT(); estraga(r);
    assert.throws(() => dirigir(r, P, CAT), (e) => e instanceof ErroRoteiro && msg.test(e.message), String(msg));
  }
});

test('estimativa de palavras: em ordem, sem sobreposição, uma frase por vez', async () => {
  const { estimarPalavras } = await carregar();
  const ws = estimarPalavras(ROT());
  assert.strictEqual(ws.length, 9);
  for (let i = 1; i < ws.length; i++) assert.ok(ws[i].inicio >= ws[i - 1].fim);
  assert.deepStrictEqual([...new Set(ws.map((w) => w.frase))], [0, 1, 2]);
});

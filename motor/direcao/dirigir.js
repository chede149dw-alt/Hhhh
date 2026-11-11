// Linha de comando: roteiro.json [words.json] → linha-do-tempo.json
//   node motor/direcao/dirigir.js roteiros/teste3d/roteiro.json [--palavras audio/.../words.json] --saida previas/.../linha.json
// Sem --palavras, estima o tempo de cada palavra (até a narração real existir).
import fs from 'fs';
import path from 'path';
import { dirigir, estimarPalavras, ErroRoteiro } from './direcao.js';
import { ATUACOES } from '../animacao/atuacoes.js';

export const CATALOGO = {
  cenarios: ['quarto', 'rua'],
  atuacoes: Object.keys(ATUACOES),
  impactos: Object.fromEntries(Object.entries(ATUACOES).map(([n, a]) => [n, a.impacto || 0])),
  efeitos: ['tremor', 'rachadura', 'esfera_terra'],
};

// sons da linha do tempo: os de cada atuação (no instante relativo a ela), tremores do roteiro e um "whoosh" leve nos cortes
export function sonsDaLinha(linha) {
  const sons = [];
  for (const p of linha.planos) {
    for (const a of p.atores) for (const sg of a.segmentos) {
      const at = ATUACOES[sg.atuacao], desde = (sg.opcoes && sg.opcoes.desde) || 0;
      const lista = typeof at.sons === 'function' ? at.sons(sg.opcoes || {}) : (at.sons || []);
      for (const som of lista) if (som.t >= desde) sons.push({ t: +(sg.inicio + som.t - desde).toFixed(3), som: som.som, ganho: 1 });
    }
    for (const e of p.efeitos) if (e.tipo === 'tremor') sons.push({ t: +e.de.toFixed(3), som: 'tremor', dur: +(e.ate - e.de).toFixed(3), ganho: 0.8 });
    for (const c of p.cameras) if (c.de > 0.01) sons.push({ t: +Math.max(0, c.de - 0.12).toFixed(3), som: 'whoosh', ganho: 0.22 });
  }
  return sons.filter((x) => x.t >= 0 && x.t < linha.duracao).sort((a, b) => a.t - b.t);
}

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
if (import.meta.url === `file://${process.argv[1]}`) {
  const arq = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
  if (!arq) { console.error('Uso: node motor/direcao/dirigir.js <roteiro.json> [--palavras words.json] --saida <linha.json>'); process.exit(1); }
  const roteiro = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const palavras = opt('palavras') ? JSON.parse(fs.readFileSync(opt('palavras'), 'utf8')) : estimarPalavras(roteiro);
  try {
    const linha = dirigir(roteiro, palavras, CATALOGO);
    linha.sons = sonsDaLinha(linha);
    const saida = opt('saida') || path.join(path.dirname(arq), 'linha-do-tempo.json');
    fs.mkdirSync(path.dirname(saida), { recursive: true });
    fs.writeFileSync(saida, JSON.stringify(linha, null, 2));
    console.log(`Linha do tempo: ${linha.duracao.toFixed(2)} s, ${linha.planos.length} planos → ${saida}`);
    for (const p of linha.planos) {
      console.log(`  ${p.id} ${p.inicio.toFixed(2)}–${p.fim.toFixed(2)} s  [${p.cenario}] "${p.texto}"`);
      for (const a of p.atores) for (const s of a.segmentos) console.log(`      ${a.nome}: ${s.atuacao} em ${s.inicio.toFixed(2)} s${s.palavra ? ` (impacto na palavra "${s.palavra}" = ${s.tPalavra.toFixed(2)} s)` : ''}`);
      for (const c of p.cameras) console.log(`      câmera ${c.tamanho || (c.primeiroPlano ? 'primeiro plano' : c.alvo)} ${c.de.toFixed(2)}–${c.ate.toFixed(2)} s`);
    }
    console.log(`  sons: ${linha.sons.map((x) => `${x.som}@${x.t.toFixed(2)}`).join(', ')}`);
  } catch (e) {
    if (e instanceof ErroRoteiro) { console.error('Erro no roteiro: ' + e.message); process.exit(2); }
    throw e;
  }
}

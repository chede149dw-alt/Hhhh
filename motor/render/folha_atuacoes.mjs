// Renderiza 6 quadros de cada atuação e monta uma folha por linha (uma linha por atuação).
// Uso: node render/folha_atuacoes.mjs <saida.png> nome:ficha:vista [...]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { renderizar } from './renderizar.mjs';
import { ATUACOES, chavesDe } from '../animacao/atuacoes.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';
import { RAIZ } from './servidor.mjs';

const [saida, ...itens] = process.argv.slice(2);
const tmp = path.join(RAIZ, 'projetos/_testes/folha_atuacoes');
fs.rmSync(tmp, { recursive: true, force: true });
const linhas = [];
for (const item of itens) {
  const [nome, ficha, vista = '34'] = item.split(':');
  const m = calcularMedidas(JSON.parse(fs.readFileSync(path.join(RAIZ, `motor/visual/boneco/fichas/${ficha}.json`))));
  const ch = chavesDe(nome, { medidas: m }), dur = ch.at(-1).t;
  const quadros = Array.from({ length: 6 }, (_, i) => Math.round((i * dur / 5) * 60));
  const dir = path.join(tmp, nome);
  await renderizar({ pagina: `motor/visual/testes/atuacao.html?atuacao=${nome}&ficha=${ficha}&vista=${vista}`, quadros, saida: dir, processos: 3 });
  const linha = path.join(tmp, `${nome}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, 'quadro_*.png'), '-vf', 'crop=1080:1660:0:40,scale=240:369,tile=6x1', '-frames:v', '1', linha]);
  linhas.push(linha);
  console.log('ok', nome, `(${ATUACOES[nome].inicio} → ${ATUACOES[nome].final})`);
}
const args = ['-v', 'error', '-y'];
for (const l of linhas) args.push('-i', l);
args.push('-filter_complex', `${linhas.map((_, i) => `[${i}]`).join('')}vstack=${linhas.length}`, '-frames:v', '1', saida);
if (linhas.length === 1) execFileSync('cp', [linhas[0], saida]); else execFileSync('ffmpeg', args);
console.log('folha ->', saida);

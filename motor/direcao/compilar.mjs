#!/usr/bin/env node
// node direcao/compilar.mjs <pasta do projeto>  → escreve timeline.json (usa words.json se existir; senão estima)
import fs from 'node:fs';
import path from 'node:path';
import { compilar } from './diretor.js';
import { estimarPalavras } from './palavras.js';
import { MARCAS } from '../visual/cenarios/distribuidora_dados.js';
import { calcularMedidas } from '../visual/boneco/medidas.js';

export function compilarProjeto(pasta) {
  const roteiro = JSON.parse(fs.readFileSync(path.join(pasta, 'roteiro.json')));
  const arqW = path.join(pasta, 'words.json');
  const pal = fs.existsSync(arqW) ? JSON.parse(fs.readFileSync(arqW)) : estimarPalavras(roteiro);
  const dirF = new URL('../visual/boneco/fichas/', import.meta.url);
  const medidas = {};
  for (const def of Object.values(roteiro.atores)) medidas[def.ficha] = calcularMedidas(JSON.parse(fs.readFileSync(new URL(`${def.ficha}.json`, dirF))));
  const tl = compilar(roteiro, pal, { marcas: MARCAS, medidas });
  tl.estimado = !!pal.estimado;
  fs.writeFileSync(path.join(pasta, 'timeline.json'), JSON.stringify(tl, null, 1));
  return tl;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tl = compilarProjeto(path.resolve(process.argv[2]));
  console.log(`${tl.planos.length} planos, ${tl.duracao.toFixed(2)} s${tl.estimado ? ' (tempos estimados)' : ''}`);
  for (const p of tl.planos) console.log(`  plano ${p.id}: ${p.ini.toFixed(2)} → ${p.fim.toFixed(2)}`);
  console.log(`  ${tl.sons.length} sons, ${tl.efeitos.length} efeitos, ${tl.eventos.length} eventos`);
}

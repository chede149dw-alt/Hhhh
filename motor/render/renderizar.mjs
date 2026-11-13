#!/usr/bin/env node
// Renderiza quadros de uma página em PNG.
// Uso:
//   node render/renderizar.mjs <pagina.html> --quadros 0,90,239 [--saida dir] [--fps 60] [--processos N]
//   node render/renderizar.mjs <pagina.html> --de 0 --ate 239   [--saida dir] [--fps 60] [--processos N]
// <pagina.html> é relativo à raiz do repositório. Arquivo de saída: quadro_00090.png (número do quadro).
import fs from 'node:fs';
import path from 'node:path';
import { iniciarServidor, RAIZ } from './servidor.mjs';
import { abrirNavegador, abrirPagina, capturar } from './navegador.mjs';

export async function renderizar({ pagina, quadros, saida, fps = 60, processos = 1, largura = 1080, altura = 1920, aoQuadro, formato = 'png' }) {
  fs.mkdirSync(saida, { recursive: true });
  const srv = await iniciarServidor();
  const url = `${srv.url}/${pagina.replace(/^\/+/, '')}`;
  try {
    // Divide os quadros em blocos contíguos, um Chrome por processo
    // (abas no mesmo Chrome ficam congeladas em segundo plano no headless).
    const n = Math.max(1, Math.min(processos, quadros.length));
    const tam = Math.ceil(quadros.length / n);
    const blocos = Array.from({ length: n }, (_, i) => quadros.slice(i * tam, (i + 1) * tam));
    await Promise.all(blocos.map(async (bloco) => {
      const nav = await abrirNavegador();
      try {
        const pag = await abrirPagina(nav, url, { largura, altura });
        for (const q of bloco) {
          const img = await capturar(pag, q / fps, formato);
          fs.writeFileSync(path.join(saida, `quadro_${String(q).padStart(5, '0')}.${formato === 'jpeg' ? 'jpg' : 'png'}`), img);
          aoQuadro?.(q);
        }
      } finally {
        await nav.close();
      }
    }));
  } finally {
    await srv.fechar();
  }
}

function lerArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[++i];
    else a._.push(argv[i]);
  }
  return a;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = lerArgs(process.argv.slice(2));
  const pagina = a._[0];
  if (!pagina) { console.error('Uso: renderizar.mjs <pagina.html> (--quadros 0,90 | --de A --ate B) [--saida dir]'); process.exit(1); }
  let quadros;
  if (a.quadros) quadros = a.quadros.split(',').map(Number);
  else if (a.de !== undefined && a.ate !== undefined) {
    quadros = []; for (let q = +a.de; q <= +a.ate; q++) quadros.push(q);
  } else { console.error('Informe --quadros ou --de/--ate'); process.exit(1); }
  if (quadros.some((q) => !Number.isInteger(q) || q < 0)) { console.error('Quadros devem ser inteiros >= 0'); process.exit(1); }
  const saida = path.resolve(a.saida || path.join(RAIZ, 'projetos/_quadros', path.basename(pagina, '.html')));
  const t0 = Date.now(); let feitos = 0;
  await renderizar({
    pagina, quadros, saida, fps: +(a.fps || 60), processos: +(a.processos || 1),
    largura: +(a.largura || 1080), altura: +(a.altura || 1920),
    aoQuadro: () => { if (++feitos % 30 === 0) process.stdout.write(`\r${feitos}/${quadros.length}`); },
  });
  const s = (Date.now() - t0) / 1000;
  console.log(`\r${quadros.length} quadros em ${s.toFixed(1)} s (${(quadros.length / s).toFixed(1)} q/s) -> ${saida}`);
}

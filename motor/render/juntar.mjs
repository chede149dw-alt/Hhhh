#!/usr/bin/env node
// Junta quadro_NNNNN.png em MP4 (H.264, crf 20, yuv420p).
// Uso: node render/juntar.mjs <pasta_quadros> <saida.mp4> [--fps 60] [--inicio 0] [--audio arq.wav]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function juntar({ pasta, saida, fps = 60, inicio = 0, audio }) {
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  const args = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-start_number', String(inicio),
    '-i', path.join(pasta, 'quadro_%05d.png')];
  if (audio) args.push('-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-r', String(fps), '-movflags', '+faststart', saida);
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg falhou (código ' + r.status + ')');
  return saida;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [pasta, saida, ...resto] = process.argv.slice(2);
  if (!pasta || !saida) { console.error('Uso: juntar.mjs <pasta_quadros> <saida.mp4> [--fps 60] [--inicio N] [--audio arq]'); process.exit(1); }
  const o = {}; for (let i = 0; i < resto.length; i += 2) o[resto[i].slice(2)] = resto[i + 1];
  const primeiro = fs.readdirSync(pasta).filter((f) => /^quadro_\d{5}\.png$/.test(f)).sort()[0];
  const inicio = o.inicio ?? (primeiro ? parseInt(primeiro.slice(7, 12), 10) : 0);
  juntar({ pasta, saida, fps: +(o.fps || 60), inicio, audio: o.audio });
  console.log('ok ->', saida);
}

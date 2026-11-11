// Junta os PNGs de uma pasta (quadro_00000.png ...) num MP4 H.264, 60 fps, crf 20.
// Uso: node motor/render/juntar.js <pasta-dos-quadros> <saida.mp4> [--fps 60] [--audio arquivo.wav]
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function juntar(pasta, saida, { fps = 60, audio } = {}) {
  const primeiros = fs.readdirSync(pasta).filter((f) => /^quadro_\d{5}\.png$/.test(f)).sort();
  if (!primeiros.length) throw new Error('Nenhum quadro em ' + pasta);
  const inicio = parseInt(primeiros[0].slice(7, 12), 10);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  const args = ['-v', 'error', '-y', '-framerate', String(fps), '-start_number', String(inicio), '-i', path.join(pasta, 'quadro_%05d.png')];
  if (audio) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-preset', 'medium');
  if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-movflags', '+faststart', saida);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
}

module.exports = { juntar };

if (require.main === module) {
  const a = process.argv.slice(2);
  const opt = (n, p) => { const i = a.indexOf('--' + n); return i >= 0 ? a[i + 1] : p; };
  const pos = a.filter((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--'));
  if (pos.length < 2) { console.error('Uso: node motor/render/juntar.js <pasta> <saida.mp4> [--fps 60] [--audio arquivo.wav]'); process.exit(1); }
  juntar(pos[0], pos[1], { fps: +opt('fps', 60), audio: opt('audio') });
  console.log('Pronto:', pos[1]);
}

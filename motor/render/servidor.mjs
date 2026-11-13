// Servidor estático mínimo. Raiz = pasta do repositório (acessa motor/ e projetos/).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};

export function iniciarServidor(raiz = RAIZ) {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const arq = path.join(raiz, rel);
    if (!arq.startsWith(raiz)) { res.writeHead(403).end(); return; }
    fs.readFile(arq, (err, dados) => {
      if (err) { res.writeHead(404).end('não encontrado: ' + rel); return; }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
      res.end(dados);
    });
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({
    url: `http://127.0.0.1:${srv.address().port}`,
    fechar: () => new Promise((f) => srv.close(f)),
  })));
}

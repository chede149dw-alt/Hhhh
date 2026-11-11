// Servidor estático mínimo (só leitura) para as páginas 3D: módulos ES não carregam de file://.
// Serve a raiz do projeto numa porta livre em 127.0.0.1. Uso interno de render/quadros.js.
const http = require('http');
const fs = require('fs');
const path = require('path');

const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.css': 'text/css' };

function iniciar(raiz) {
  raiz = path.resolve(raiz);
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const arq = path.resolve(raiz, '.' + rel);
    if (!arq.startsWith(raiz) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
    fs.createReadStream(arq).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}`, fechar: () => srv.close() })));
}

module.exports = { iniciar };

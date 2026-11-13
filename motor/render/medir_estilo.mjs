// Renderiza testes/estilo.html com os parâmetros dados e imprime a medição de cores.
import { iniciarServidor } from './servidor.mjs';
import { abrirNavegador, abrirPagina } from './navegador.mjs';
export async function medirEstilo(query, t = 0) {
  const srv = await iniciarServidor(); const nav = await abrirNavegador();
  try {
    const pag = await abrirPagina(nav, `${srv.url}/motor/visual/testes/estilo.html?${query}`);
    await pag.evaluate(async (t) => { await window.quadro(t); }, t);
    return await pag.evaluate(() => window.medir());
  } finally { await nav.close(); await srv.fechar(); }
}
if (import.meta.url === `file://${process.argv[1]}`) console.table(await medirEstilo(process.argv[2] || 'calib=1&pos=0'));

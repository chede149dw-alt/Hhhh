// O boneco desenhado (three) e a cinemática pura usada pelo IK precisam concordar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor } from '../render/servidor.mjs';
import { abrirNavegador, abrirPagina } from '../render/navegador.mjs';

test('FK pura = boneco three (sola e pulso, 34 poses, erro < 1e-5 m)', { timeout: 60000 }, async () => {
  const srv = await iniciarServidor(); const nav = await abrirNavegador();
  try {
    const pag = await abrirPagina(nav, `${srv.url}/motor/visual/testes/fk.html`, { largura: 64, altura: 64 });
    const r = await pag.evaluate(() => window.medirFK());
    assert.ok(r.poses >= 34);
    assert.ok(r.max < 1e-5, `erro máximo ${r.max}`);
  } finally { await nav.close(); await srv.fechar(); }
});

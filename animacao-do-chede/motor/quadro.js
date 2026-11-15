// Salva UM quadro em resolução cheia (1080×1920) — para capas de Reels/TikTok e conferências.
// Uso: node motor/quadro.js <roteiro.json> <planos.js> <idDoPlano> <saida.png> [--momento 0.5]
//   O plano não precisa estar no vídeo: basta existir em window.PLANOS. Sem legenda; com o pós de cinema do roteiro.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const opt = (n, p) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : p; };
const [roteiroArq, planosArq, id, saida] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const raiz = path.resolve(__dirname, '..');
const roteiro = JSON.parse(fs.readFileSync(roteiroArq, 'utf8'));
const def = roteiro.planos.find((p) => p.id === id) || {};
const dur = def.duracao || 3;
// linha do tempo com todos os planos (duração do json ou 3 s), para tomadas contínuas que atravessam vários planos
let acc = 0, ini0 = 0;
const planosTL = roteiro.planos.map((p) => {
  const d = p.duracao || 3, ini = acc; acc += d; if (p.id === id) ini0 = ini;
  const batidas = [];
  for (const s of p.sfx || []) { if (s.tipo !== 'coracao') continue; const ate = Math.min(d, s.ate === undefined ? d : s.ate); for (let b = s.de === undefined ? 0.1 : s.de; b < ate - 0.05;) { batidas.push(+b.toFixed(3)); b += 60 / (s.bpm + ((s.bpmFim || s.bpm) - s.bpm) * (b / d)); } }
  return { id: p.id, inicio: ini, fim: ini + d, semLegenda: true, cinema: p.cinema, camera: { parada: true }, batidas, sfx: [] };
});
const TL = { fps: 30, total: acc, falas: [], legendas: [], planos: planosTL.length ? planosTL : [{ id, inicio: 0, fim: dur, semLegenda: true, cinema: def.cinema, camera: { parada: true }, batidas: [], sfx: [] }] };
const scripts = ['motor/cena.js', 'motor/cena3d.js', 'motor/cinema.js', 'motor/personagem-base.js',
  'personagens/lucas/lucas.js', 'personagens/mae/mae.js', 'personagens/rafael/rafael.js', 'personagens/chede/chede.js', 'personagens/kaik/kaik.js', 'personagens/lia/lia.js', 'efeitos/fenda.js',
  'cenarios/objetos/cama.js', 'cenarios/objetos/despertador.js', 'cenarios/objetos/mochila.js',
  'cenarios/quarto-3d.js', 'cenarios/rua-3d.js', 'cenarios/escola-3d.js', 'cenarios/patio-3d.js',
  'efeitos/invisibilidade.js', 'efeitos/poder-energia.js', 'efeitos/poder-terra.js', 'efeitos/terra-cena.js', 'motor/mao-detalhe.js', ...(roteiro.scripts || []), 'motor/episodio.js', planosArq].map((s) => path.resolve(raiz, s));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Erro na página:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'palco.html'));
  for (const s of scripts) await page.addScriptTag({ path: s });
  await page.evaluate(async (tl) => { await document.fonts.load('900 98px Inter'); Episodio.iniciar(tl); }, TL);
  const q = Math.floor((ini0 + dur * +opt('momento', 0.5)) * 30);
  const b64 = await page.evaluate((q) => { Episodio.quadro(q); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, q);
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log('Quadro salvo:', saida);
})();

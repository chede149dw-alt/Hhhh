const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js','personagens/nova/cores.js','personagens/nova/equipamento.js','personagens/nova/teo/teo.js','personagens/nova/teo/teo-jogo.js','personagens/nova/teo/teo-fera.js','efeitos/valdor.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const c = document.getElementById('c'); c.width = 2400; c.height = 1500; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1500); gr.addColorStop(0, '#0E1530'); gr.addColorStop(0.6, '#1E2A55'); gr.addColorStop(1, '#0A0F22'); g.fillStyle = gr; g.fillRect(0, 0, 2400, 1500);
    g.fillStyle = '#F4F1E2'; g.beginPath(); g.arc(2180, 200, 90, 0, Math.PI * 2); g.fill();
    Valdor.brilhoRadial(g, 2180, 200, 300, '200,220,255', 0.5);
    g.font = '900 64px Inter'; g.fillStyle = '#FFFFFF'; g.textAlign = 'left'; g.fillText('TÉO · TRANSFORMAÇÃO EM HOMEM-FERA', 60, 100);
    g.font = '700 30px Inter'; g.fillStyle = '#BFD0FF'; g.fillText('Proposta · aguardando aprovação', 60, 148);
    const etapas = [[0, 'tremendo', 'cansado', '1. Começa|a tremer'], [1, 'tremendo', 'medo', '2. Olhos|acendem'], [2, 'garras', 'raiva', '3. Orelhas, costeletas|e garras'], [3, 'garras', 'raiva', '4. Pelo, presas, juba|e mangas rasgando'], [4, 'garras', 'raiva', '5. FORMA FERA|rabo e garras nos pés']];
    etapas.forEach(([e, pose, expr, rot], i) => {
      const x = 200 + i * 380;
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, 1270, 150, 22, 0, 0, Math.PI * 2); g.fill();
      window.desenharItem(g, { fabrica: 'criarTeoFera', opcoes: { estagio: e }, vista: 'frente', pose, expressao: expr, registroPoses: 'TEO_FERA_POSES' }, x, 1270, e >= 4 ? 1000 : e >= 3 ? 940 : 900);
      g.font = '800 30px Inter'; g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; rot.split('|').forEach((l, k) => g.fillText(l, x, 1340 + k * 38));
    });
    window.desenharItem(g, { fabrica: 'criarTeoFera', opcoes: { estagio: 4 }, vista: 'tq', pose: 'tq', expressao: 'raiva', registroPoses: 'TEO_FERA_POSES' }, 2010, 1270, 760);
    window.desenharItem(g, { fabrica: 'criarTeoFera', opcoes: { estagio: 4 }, vista: 'costas', pose: 'costas', registroPoses: 'TEO_FERA_POSES' }, 2290, 1270, 760);
    g.font = '800 26px Inter'; g.fillStyle = '#BFD0FF'; g.fillText('3/4 e costas', 2150, 1340);
    for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(255,214,70,0.85)'; g.font = '900 60px Inter'; g.fillText('›', 390 + i * 380, 760); }
    return c.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close();
})();

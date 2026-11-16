// Ficha: 3 opções de roupa nova do Téo (Parte 3). Uso: node gerar-teo-opcoes.js <raiz> <saida.jpg>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js', 'personagens/nova/cores.js', 'personagens/nova/equipamento.js', 'personagens/nova/teo/teo.js', 'personagens/nova/teo/teo-jogo.js', 'efeitos/valdor.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const W = 2400, H = 2000, c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#13202A'); gr.addColorStop(1, '#0A1016'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.textAlign = 'left'; g.font = '900 68px Inter'; g.fillStyle = '#FFFFFF'; g.fillText('TÉO · ROUPA NOVA · 3 OPÇÕES', 60, 100);
    g.font = '700 30px Inter'; g.fillStyle = '#C8E0D0'; g.fillText('Escolha uma (ou misture peças). Frente, 3/4 e costas.', 60, 150);
    ['A', 'B', 'C'].forEach((est, i) => {
      const x0 = 40 + i * 790, w = 760, R = window.TEO_ROUPAS[est];
      g.fillStyle = 'rgba(255,255,255,0.04)'; g.beginPath(); g.roundRect(x0, 200, w, 1760, 30); g.fill(); g.strokeStyle = 'rgba(140,220,170,0.4)'; g.lineWidth = 3; g.stroke();
      Valdor.brilhoRadial(g, x0 + w / 2, 900, 520, '140,220,170', 0.14);
      g.font = '900 52px Inter'; g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.fillText(est + ' · ' + R.nome, x0 + w / 2, 275);
      const it = (v, pose) => ({ fabrica: 'criarTeoRoupa', opcoes: { estilo: est }, vista: v, pose, registroPoses: 'POSES_PADRAO' });
      window.desenharItem(g, it('frente', 'parado'), x0 + w / 2, 1180, 860);
      window.desenharItem(g, it('tq', 'tq'), x0 + 200, 1900, 640);
      window.desenharItem(g, it('costas', 'costas'), x0 + 560, 1900, 640);
    });
    return c.toDataURL('image/jpeg', 0.9).split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close();
})();

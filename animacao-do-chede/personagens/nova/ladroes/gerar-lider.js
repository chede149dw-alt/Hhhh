// Ficha do líder dos ladrões em 3 opções. Uso: node gerar-lider.js <raiz> <saida.png>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message)); p.on('console', (m) => console.log(m.text()));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js', 'personagens/nova/cores.js', 'personagens/nova/equipamento.js', 'personagens/nova/ladroes.js', 'efeitos/valdor.js', 'efeitos/noite.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const W = 2400, H = 1900, c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120A18'); gr.addColorStop(0.6, '#24142E'); gr.addColorStop(1, '#0C0610'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.font = '900 68px Inter'; g.fillStyle = '#FF8A8A'; g.textAlign = 'left'; g.fillText('LÍDER DOS LADRÕES · 3 OPÇÕES', 60, 100);
    g.font = '700 30px Inter'; g.fillStyle = '#E8C8D0'; g.fillText('Escolha uma (ou misture): o que muda é o rosto, a gola, a capa e as cores. A Adaga Eclipse fica escondida na cintura.', 60, 150);
    const ops = [['A', 'CAPUZ VERMELHO', 'Capuz e capa vinho, máscara preta com borda vermelha, peitoral escuro com tachas.'], ['B', 'MERCENÁRIO DE FERRO', 'Máscara de metal com respiros, gola de pelo, ombreiras de aço, capa vinho, cicatriz no olho.'], ['C', 'LÂMINA RUBRA', 'Sem capuz, cabelo branco, bandana vermelha, casaco de couro vermelho com tachas douradas, cicatriz.']];
    ops.forEach(([est, nome, txt], i) => {
      const x0 = 40 + i * 790, w = 760;
      g.fillStyle = 'rgba(255,255,255,0.04)'; g.beginPath(); g.roundRect(x0, 200, w, 1660, 30); g.fill(); g.strokeStyle = 'rgba(255,140,150,0.4)'; g.lineWidth = 3; g.stroke();
      Valdor.brilhoRadial(g, x0 + w / 2, 900, 520, '255,140,80', 0.18);
      g.font = '900 54px Inter'; g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.fillText(est + ' · ' + nome, x0 + w / 2, 270);
      const it = (v, pose) => ({ fabrica: 'criarLadrao', opcoes: { lider: true, estilo: est }, vista: v, pose, registroPoses: 'LADRAO_POSES' });
      window.desenharItem(g, it('frente', 'parado'), x0 + 230, 1290, 900);
      window.desenharItem(g, it('tq', 'aponta'), x0 + 560, 1290, 900);
      // close do rosto
      g.save(); g.beginPath(); g.roundRect(x0 + 40, 1340, w - 80, 360, 24); g.clip(); g.fillStyle = '#1A0E1E'; g.fillRect(x0 + 40, 1340, w - 80, 360);
      window.desenharItem(g, it('frente', 'parado'), x0 + w / 2, 1340 + 3600 * 0.93, 3600); g.restore();
      g.strokeStyle = 'rgba(255,140,150,0.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(x0 + 40, 1340, w - 80, 360, 24); g.stroke();
      g.font = '700 26px Inter'; g.fillStyle = '#E8C8D0'; const pal = txt.split(' '); let ln = '', y = 1760; for (const p of pal) { if (g.measureText(ln + p).width > w - 80) { g.fillText(ln, x0 + w / 2, y); ln = ''; y += 34; } ln += p + ' '; } g.fillText(ln, x0 + w / 2, y);
    });
    return c.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close();
})();

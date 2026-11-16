// Ficha das roupas novas da Parte 3 (antes × depois). Uso: node gerar-roupas.js <raiz> <saida.png>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js', 'personagens/nova/cores.js', 'personagens/nova/equipamento.js', 'personagens/nova/davi/davi.js', 'personagens/nova/davi/davi-jogo.js', 'personagens/nova/teo/teo.js', 'personagens/nova/teo/teo-jogo.js', 'efeitos/valdor.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const W = 2600, H = 2400, c = document.getElementById('c'); c.width = W; c.height = H; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#141A33'); gr.addColorStop(1, '#0B0E1E'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.textAlign = 'left'; g.font = '900 70px Inter'; g.fillStyle = '#FFFFFF'; g.fillText('VALDOR · PARTE 3 · ROUPAS NOVAS DO LOOT', 60, 100);
    const linha = (y0, titulo, sub, cor, antes, depois) => {
      g.fillStyle = 'rgba(255,255,255,0.04)'; g.beginPath(); g.roundRect(40, y0, W - 80, 1080, 30); g.fill();
      g.font = '900 56px Inter'; g.fillStyle = cor; g.fillText(titulo, 80, y0 + 80); g.font = '700 30px Inter'; g.fillStyle = '#C8D0E8'; g.fillText(sub, 80, y0 + 125);
      Valdor.brilhoRadial(g, 1450, y0 + 620, 700, '120,170,255', 0.12);
      g.font = '800 30px Inter'; g.fillStyle = '#8A93B0'; g.textAlign = 'center'; g.fillText('ANTES', 260, y0 + 1040);
      window.desenharItem(g, { ...antes, vista: 'frente', pose: 'parado' }, 260, y0 + 990, 780);
      const vistas = [['frente', 'parado'], ['tq', 'tq'], ['perfil', 'perfil'], ['costas', 'costas']];
      vistas.forEach(([v, ps], i) => { const x = 700 + i * 470; window.desenharItem(g, { ...depois, vista: v, pose: ps }, x, y0 + 990, 820); g.fillStyle = '#FFFFFF'; g.fillText(v.toUpperCase(), x, y0 + 1040); });
      g.textAlign = 'left';
    };
    linha(160, 'DAVI · MANTO DO ARCANO (ÉPICO)', 'Casaco longo azul-escuro com bordado dourado, runas que brilham, gola alta, capa curta nos ombros, faixa vinho e luvas raras.', '#9FC4FF',
      { fabrica: 'criarDaviLuvas', registroPoses: 'DAVI_JOGO_POSES' }, { fabrica: 'criarDaviArcano', registroPoses: 'DAVI_JOGO_POSES' });
    linha(1280, 'TÉO · COLETE DO GUARDIÃO (ÉPICO)', 'Colete de couro com placas de aço, cordão cruzado, gola de pelo, ombreiras de aço, braçadeiras e escudo de prata.', '#9FE0B0',
      { fabrica: 'criarTeoFerro', registroPoses: 'POSES_PADRAO' }, { fabrica: 'criarTeoGuardiao', registroPoses: 'POSES_PADRAO' });
    return c.toDataURL('image/jpeg', 0.9).split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close();
})();

// Ficha do Golem (Guardião de Pedra) para aprovação. Uso: node personagens/golem/gerar-ficha.js <raiz> <saida.jpg>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => { console.error('ERRO', e.message); process.exitCode = 1; });
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js', 'personagens/lucas/lucas.js', 'personagens/golem/golem.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const W = 2400, Ht = 2300, c = document.getElementById('c'); c.width = W; c.height = Ht; const g = c.getContext('2d');
    const fundo = (x, y, w, h) => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#1A1220'); gr.addColorStop(0.65, '#2A1C24'); gr.addColorStop(1, '#120C12'); g.fillStyle = gr; g.fillRect(x, y, w, h); };
    const brilho = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,160,70,${a})`); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
    fundo(0, 0, W, Ht);
    g.textAlign = 'left'; g.font = '900 72px Inter'; g.fillStyle = '#FFB347'; g.fillText('GOLEM · GUARDIÃO DE PEDRA', 60, 110);
    g.font = '700 32px Inter'; g.fillStyle = '#E8D2BC'; g.fillText('Terra · Parte 2 · proposta para aprovação · símbolo da terra no peito (o mesmo do amuleto da mãe)', 60, 160);
    const chao = 1120;
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, chao, W, 6);
    const item = (opc, vista, pose, x, alt, extra = {}) => {
      brilho(x, chao - alt * 0.5, alt * 0.55, 0.12 * (opc.brilho === undefined ? 1 : opc.brilho));
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(x, chao, alt * 0.22, 22, 0, 0, Math.PI * 2); g.fill();
      window.desenharItem(g, { fabrica: 'criarGolem', opcoes: opc, vista, pose, registroPoses: 'GOLEM_POSES', ...extra }, x, chao, alt);
    };
    const rot = (x, txt, y = chao + 56) => { g.textAlign = 'center'; g.font = '800 30px Inter'; txt.split('|').forEach((l, k) => { g.fillStyle = k === 0 ? '#FFFFFF' : '#E8C9A8'; g.fillText(l, x, y + k * 38); }); };
    // vistas + escala com o Lucas
    const xs = [230, 640, 1020, 1420];
    item({}, 'frente', 'parado', xs[0], 700); rot(xs[0], 'Frente');
    item({}, 'tq', 'tq', xs[1], 700); rot(xs[1], '3/4');
    item({}, 'perfil', 'perfil', xs[2], 700); rot(xs[2], 'Perfil');
    item({}, 'costas', 'costas', xs[3], 700); rot(xs[3], 'Costas|cristais nas costas');
    // escala
    item({}, 'frente', 'parado', 1880, 760);
    window.desenharItem(g, { fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES', pose: 'parado', expressao: 'espanto' }, 2230, chao, 400);
    rot(2040, 'Escala|golem ~3,2 m · Lucas 1,6 m');
    // linha de baixo: poses e montagem
    const chao2 = 2080;
    const item2 = (opc, vista, pose, x, alt) => { g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(x, chao2, alt * 0.22, 20, 0, 0, Math.PI * 2); g.fill(); window.desenharItem(g, { fabrica: 'criarGolem', opcoes: opc, vista, pose, registroPoses: 'GOLEM_POSES' }, x, chao2, alt); };
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, chao2, W, 6);
    const ys = chao2 + 50;
    [[0.0, 'Montando|pedras soltas'], [0.45, 'Montando|se juntando'], [0.8, 'Quase'], [1, 'Montado|olhos acendem']].forEach(([m, t], i) => { item2({ monta: m, brilho: m }, 'frente', 'parado', 190 + i * 300, 560); rot(190 + i * 300, t, ys); });
    item2({}, 'frente', 'punho', 1430, 580); rot(1430, 'Punho erguido', ys);
    item2({}, 'frente', 'soco', 1780, 580); rot(1780, 'Soco', ys);
    item2({ brilho: 0.6 }, 'tq', 'ajoelhado', 2170, 580); rot(2170, 'Ajoelhado|(final da parte 2)', ys);
    return c.toDataURL('image/jpeg', 0.9).split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close(); console.log('Ficha:', saida);
})();

// Folha de transformação do Téo em lobisomem (VALDOR). Uso: node gerar-lobisomem.js <raiz> <saida.png>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message)); p.on('console', (m) => console.log(m.text()));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/personagem-base.js', 'personagens/nova/cores.js', 'personagens/nova/equipamento.js', 'personagens/nova/teo/teo.js', 'personagens/nova/teo/teo-jogo.js', 'personagens/nova/teo/teo-fera.js', 'personagens/nova/teo/teo-lobisomem.js', 'efeitos/valdor.js', 'efeitos/criaturas.js', 'efeitos/teo-closes.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const W = 2400, Ht = 2280, c = document.getElementById('c'); c.width = W; c.height = Ht; const g = c.getContext('2d');
    const fundo = (x, y, w, h) => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#0B1028'); gr.addColorStop(0.6, '#1B2550'); gr.addColorStop(1, '#090C1C'); g.fillStyle = gr; g.fillRect(x, y, w, h); };
    const lua = (x, y, r) => { Valdor.brilhoRadial(g, x, y, r * 3.4, '200,220,255', 0.45); g.fillStyle = '#F4F1E2'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(190,185,165,0.5)'; for (const [a, b2, rr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.13], [-0.05, 0.35, 0.1]]) { g.beginPath(); g.arc(x + a * r, y + b2 * r, rr * r, 0, Math.PI * 2); g.fill(); } };
    const brasa = (x, y, w, h, n, seed) => { let s = seed; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < n; i++) { const px = x + r() * w, py = y + r() * h, rr = 2 + r() * 4; g.fillStyle = `rgba(255,${150 + r() * 80 | 0},60,${0.4 + r() * 0.5})`; g.beginPath(); g.arc(px, py, rr, 0, Math.PI * 2); g.fill(); } };
    fundo(0, 0, W, Ht); lua(2290, 110, 70);
    g.textAlign = 'left'; g.font = '900 72px Inter'; g.fillStyle = '#FFB13B'; g.fillText('TÉO · TRANSFORMAÇÃO EM LOBISOMEM', 60, 110);
    g.font = '700 32px Inter'; g.fillStyle = '#BFD0FF'; g.fillText('Homem-fera · forma da noite · proposta para aprovação', 60, 160);
    // ---- linha de etapas ----
    const chao = 1150;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, chao, W, 6);
    const item = (fab, opc, vista, pose, expr, reg, x, alt) => { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, chao, alt * 0.16, 20, 0, 0, Math.PI * 2); g.fill(); window.desenharItem(g, { fabrica: fab, opcoes: opc, vista, pose, expressao: expr, registroPoses: reg }, x, chao, alt); };
    const rot = (x, txt, cor) => { g.textAlign = 'center'; g.font = '800 30px Inter'; txt.split('|').forEach((l, k) => { g.fillStyle = k === 0 ? (cor || '#FFFFFF') : '#C8D4FF'; g.fillText(l, x, chao + 56 + k * 38); }); };
    const xs = [170, 470, 790, 1150, 1600, 2110];
    item('criarTeoFera', { estagio: 0 }, 'frente', 'tremendo', 'cansado', 'TEO_FERA_POSES', xs[0], 760); rot(xs[0], '1. Começa|a tremer');
    item('criarTeoFera', { estagio: 1 }, 'frente', 'tremendo', 'medo', 'TEO_FERA_POSES', xs[1], 770); rot(xs[1], '2. Olhos|amarelos');
    item('criarTeoFera', { estagio: 2 }, 'frente', 'garras', 'raiva', 'TEO_FERA_POSES', xs[2], 800); rot(xs[2], '3. Orelhas|e garras');
    item('criarTeoFera', { estagio: 3 }, 'frente', 'garras', 'raiva', 'TEO_FERA_POSES', xs[3], 860); rot(xs[3], '4. Pelo e|mangas rasgando');
    brasa(xs[4] - 260, 260, 520, 860, 50, 3);
    item('criarTeoLobisomem', {}, 'frente', 'garras', 'raiva', 'TEO_LOBISOMEM_POSES', xs[4], 960); rot(xs[4], '5. LOBISOMEM|cabeça de lobo, juba, rabo', '#FFB13B');
    // lobisomem de 3/4
    item('criarTeoLobisomem', {}, 'tq', 'tq', 'raiva', 'TEO_LOBISOMEM_POSES', xs[5] + 30, 960);
    rot(xs[5], '6. Visto de 3/4|focinho de lobo');
    g.fillStyle = 'rgba(255,190,70,0.9)'; g.font = '900 64px Inter'; g.textAlign = 'center';
    for (let i = 0; i < 4; i++) g.fillText('›', (xs[i] + xs[i + 1]) / 2 + (i === 3 ? 10 : 0), 760);
    // ---- quadros de close ----
    const y0 = 1300, hq = 900, gap = 20, ws = [620, 500, 500, 670], tit = ['Rugido', 'Olho de fera', 'Garras', 'De costas, sob a lua'];
    let x = 30;
    ws.forEach((w, i) => {
      g.save(); g.beginPath(); g.rect(x, y0, w, hq); g.clip(); fundo(x, y0, w, hq);
      if (i === 0) { brasa(x, y0, w, hq, 40, 21); window.desenharItem(g, { fabrica: 'criarTeoLobisomem', vista: 'frente', pose: 'rugindo', registroPoses: 'TEO_LOBISOMEM_POSES' }, x + w / 2, y0 + hq * 0.36 + 2300 * 0.86, 2300); }
      if (i === 1) TeoCloses.olho(g, x + w / 2, y0 + hq / 2, 300, 0, {});
      if (i === 2) {
        Valdor.brilhoRadial(g, x + w * 0.5, y0 + hq * 0.55, 360, '255,170,60', 0.35);
        const it = { fabrica: 'criarTeoLobisomem', vista: 'frente', pose: 'garras', expressao: 'raiva', registroPoses: 'TEO_LOBISOMEM_POSES' };
        const tmp = document.createElement('canvas').getContext('2d'); const r = window.desenharItem(tmp, it, 0, 0, 3000);
        const m = r.pontoMundo('mao_d', [0, 0.3]); window.desenharItem(g, it, x + w * 0.5 - m.x, y0 + hq * 0.42 - m.y, 3000);
      }
      if (i === 3) { lua(x + w * 0.55, y0 + 330, 190); window.desenharItem(g, { fabrica: 'criarTeoLobisomem', vista: 'costas', pose: 'costas', registroPoses: 'TEO_LOBISOMEM_POSES' }, x + w * 0.5, y0 + hq + 120, 980); }
      g.restore();
      g.strokeStyle = 'rgba(255,177,59,0.8)'; g.lineWidth = 4; g.strokeRect(x, y0, w, hq);
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x, y0 + hq - 64, w, 64); g.fillStyle = '#FFFFFF'; g.font = '800 32px Inter'; g.textAlign = 'center'; g.fillText(tit[i], x + w / 2, y0 + hq - 20);
      x += w + gap;
    });
    return c.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64')); await b.close();
})();

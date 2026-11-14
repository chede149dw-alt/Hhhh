// Prévia do cenário VALDOR à noite (Parte 2). Uso: node gerar-valdor-noite.js <raiz> <saida.png>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const raiz = process.argv[2], saida = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('ERRO', e.message)); p.on('console', (m) => console.log(m.text()));
  await p.goto('file://' + path.join(raiz, 'motor/palco.html'));
  for (const s of ['motor/cena.js', 'motor/cinema.js', 'motor/cena3d.js', 'motor/personagem-base.js', 'personagens/nova/cores.js', 'personagens/nova/equipamento.js', 'personagens/nova/davi/davi.js', 'personagens/nova/davi/davi-jogo.js', 'personagens/nova/teo/teo.js', 'personagens/nova/teo/teo-jogo.js', 'personagens/nova/teo/teo-lobisomem.js', 'cenarios/valdor-noite.js']) await p.addScriptTag({ path: path.join(raiz, s) });
  await p.evaluate(() => document.fonts.load('900 98px Inter'));
  const b64 = await p.evaluate(() => {
    const V = Cenarios3D.valdorNoite;
    const quadro = (n, t, camO, chars, forca = 0.7) => {
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d');
      const cam = Cena3D.camera({ f: 1150, x: 0, y: 1.45, z: 0, cy: 860, nevoa: V.nevoa(n), ...camO });
      V.desenhar(g, cam, { t, noite: n });
      for (const [item, X, Z, alt] of chars) V.personagemNoite(g, (h) => Cena3D.personagem(h, cam, item, X, Z, alt), { noite: n });
      V.frente(g, cam, { t, noite: n, forca });
      return c;
    };
    const davi = { fabrica: 'criarDaviJogo', vista: 'frente', pose: 'conjurando', registroPoses: 'DAVI_JOGO_POSES' };
    const teoH = { fabrica: 'criarTeoJogo', vista: 'frente', pose: {}, expressao: 'medo' };
    const lobo = { fabrica: 'criarTeoLobisomem', vista: 'frente', pose: 'rugindo', registroPoses: 'TEO_LOBISOMEM_POSES' };
    const Q = [
      [quadro(0.0, 1, {}, [[davi, -0.9, 4.2, 1.75], [teoH, 0.9, 4.2, 1.8]]), '1. Pôr do sol'],
      [quadro(0.55, 2, {}, [[davi, -0.9, 4.2, 1.75], [teoH, 0.9, 4.2, 1.8]]), '2. A noite caindo'],
      [quadro(1.0, 3, {}, [[davi, -1.1, 4.4, 1.75], [lobo, 0.9, 4.6, 2.6]]), '3. Noite (com o Téo lobisomem)'],
      [quadro(1.0, 4, { y: 0.9, z: 2.5, cy: 1150, yaw: -0.12, f: 1000 }, [], 0.25), '4. Câmera baixa: lua, rio e espadas'],
    ];
    const S = document.getElementById('c'); S.width = 2400; S.height = 1250; const s = S.getContext('2d');
    s.fillStyle = '#0B0F22'; s.fillRect(0, 0, 2400, 1250);
    s.font = '900 60px Inter'; s.fillStyle = '#9FC8FF'; s.textAlign = 'left'; s.fillText('VALDOR · CENÁRIO DA PARTE 2 (NOITE)', 40, 80);
    s.font = '700 28px Inter'; s.fillStyle = '#C8D4FF'; s.fillText('Lua, estrelas, neblina baixa, feixes de luar, vaga-lumes, rio com reflexo e runas acesas · proposta', 40, 122);
    Q.forEach(([c, txt], i) => { const x = 40 + i * 590, y = 150, w = 560, h = 996; s.drawImage(c, x, y, w, h); s.strokeStyle = 'rgba(160,200,255,0.7)'; s.lineWidth = 3; s.strokeRect(x, y, w, h); s.font = '800 28px Inter'; s.fillStyle = '#FFFFFF'; s.textAlign = 'center'; s.fillText(txt, x + w / 2, y + h + 44); });
    window.__quadros = Q.map(([c]) => c.toDataURL('image/png').split(',')[1]);
    return S.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
  const qs = await p.evaluate(() => window.__quadros);
  qs.forEach((q, i) => fs.writeFileSync(saida.replace('.png', `-${i + 1}.png`), Buffer.from(q, 'base64')));
  await b.close();
})();

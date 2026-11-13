// Cenário em perspectiva: CAMPO DE VALDOR (série nova). Dia claro, cores vivas, névoa azulada ao longe,
// montanhas com neve e um castelo, trilha de terra, árvores redondas, tufos de grama e flores.
// Mundo em metros: chão y = 0; trilha ao longo de Z em x ≈ 0; área da ação: x de −3 a 3, z de 2 a 10.
// Uso: Cenarios3D.valdor.desenhar(ctx, cam, { t })  → personagens →  Cenarios3D.valdor.frente(ctx, cam, { t, forca })
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const { face, arvore, mistura } = Cena3D;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const NEVOA = '#BCD3E4';

  // objetos fixos (gerados uma vez): árvores, pedras, tufos, flores — fora da área da ação
  const OBJ = (() => {
    const r = rng(2026), arv = [], ped = [], tufo = [], flor = [];
    for (let i = 0; i < 70; i++) {
      const z = 4 + r() * 70, lado = r() < 0.5 ? -1 : 1, x = lado * (4.5 + r() * (6 + z * 0.6));
      arv.push([x, z, 3.2 + r() * 2.6]);
    }
    for (let i = 0; i < 26; i++) { const z = 1 + r() * 30, x = (r() * 2 - 1) * (3 + z * 0.4); if (Math.abs(x) > 1.2) ped.push([x, z, 0.18 + r() * 0.35]); }
    for (let i = 0; i < 750; i++) { const z = 0.5 + Math.pow(r(), 1.6) * 34, x = (r() * 2 - 1) * (2 + z * 0.9); tufo.push([x, z, 0.28 + r() * 0.26, r() * 6]); }
    for (let i = 0; i < 160; i++) { const z = 0.8 + Math.pow(r(), 1.4) * 20, x = (r() * 2 - 1) * (2 + z * 0.8); flor.push([x, z, ['#FFFFFF', '#FFE27A', '#F7A8C8', '#B9A6FF'][Math.floor(r() * 4)], r() * 6]); }
    return { arv, ped, tufo, flor };
  })();

  function ceu(ctx, cam, t) {
    const W = ctx.canvas.width, hz = cam.cy;
    const g = ctx.createLinearGradient(0, hz - 1500, 0, hz + 20);
    g.addColorStop(0, '#3C80CC'); g.addColorStop(0.55, '#86BCE4'); g.addColorStop(1, '#D3E6F0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 80);
    // sol e feixes de luz (alto à esquerda)
    const desl = -cam.yaw * cam.f;
    const sx = W - 120 + desl * 0.9, sy = hz - 1150;
    const h = ctx.createRadialGradient(sx, sy, 0, sx, sy, 700);
    h.addColorStop(0, 'rgba(255,250,225,0.95)'); h.addColorStop(0.2, 'rgba(255,244,205,0.45)'); h.addColorStop(1, 'rgba(255,244,205,0)');
    ctx.fillStyle = h; ctx.fillRect(0, 0, W, hz + 80);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const a = Math.PI - 0.35 - i * 0.16 + Math.sin(t * 0.2 + i) * 0.02;
      ctx.fillStyle = `rgba(255,248,220,${0.07 - i * 0.008})`;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 2600, sy + Math.sin(a) * 2600); ctx.lineTo(sx + Math.cos(a + 0.06) * 2600, sy + Math.sin(a + 0.06) * 2600); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // nuvens fofas andando devagar
    const r = rng(7);
    for (let i = 0; i < 7; i++) {
      const w = 260 + r() * 260, y = hz - 700 - r() * 700, x = ((r() * 2400 + t * (8 + r() * 10) + desl * 0.95) % 2600 + 2600) % 2600 - 760;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      for (const [dx, dy, k] of [[0, 0, 0.32], [0.25, -0.12, 0.26], [-0.25, -0.05, 0.24], [0.45, 0.02, 0.18], [-0.45, 0.04, 0.16]]) { ctx.beginPath(); ctx.ellipse(x + dx * w, y + dy * w, k * w, k * w * 0.62, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(190,215,235,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 0.1 * w, 0.5 * w, 0.08 * w, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // cadeia de montanhas (infinitamente longe: só gira com o yaw)
  function montanhas(ctx, cam) {
    const W = ctx.canvas.width, hz = cam.cy, desl = -cam.yaw * cam.f;
    const camadas = [
      { k: 1.0, alt: 620, cor: '#9AB0CC', neve: true, seed: 3, per: 1500 },
      { k: 1.0, alt: 420, cor: '#8198BA', neve: true, seed: 9, per: 1100 },
      { k: 1.0, alt: 200, cor: '#6E9E62', neve: false, seed: 15, per: 800 },
    ];
    for (const c of camadas) {
      const r = rng(c.seed), picos = [];
      for (let i = 0; i < 12; i++) picos.push([i * c.per / 3 + r() * 120, c.alt * (0.55 + r() * 0.45)]);
      const ofs = ((desl * c.k) % (c.per * 4) + c.per * 4) % (c.per * 4);
      for (let rep = -1; rep <= 1; rep++) {
        const base = -ofs + rep * c.per * 4;
        ctx.fillStyle = c.cor; ctx.beginPath(); ctx.moveTo(base - 200, hz + 4);
        for (const [px, ph] of picos) { ctx.lineTo(base + px - ph * 0.9, hz + 4); ctx.lineTo(base + px, hz - ph); ctx.lineTo(base + px + ph * 0.9, hz + 4); }
        ctx.lineTo(base + c.per * 4 + 200, hz + 4); ctx.closePath(); ctx.fill();
        // lado em sombra
        ctx.fillStyle = Estilo.multiply(c.cor, '#C8C6E0');
        for (const [px, ph] of picos) { ctx.beginPath(); ctx.moveTo(base + px, hz - ph); ctx.lineTo(base + px + ph * 0.9, hz + 4); ctx.lineTo(base + px + ph * 0.25, hz + 4); ctx.closePath(); ctx.fill(); }
        if (c.neve) {
          ctx.fillStyle = '#F4FAFF';
          for (const [px, ph] of picos) { if (ph < c.alt * 0.7) continue; const s = ph * 0.2; ctx.beginPath(); ctx.moveTo(base + px, hz - ph); ctx.lineTo(base + px + s * 0.9, hz - ph + s); ctx.lineTo(base + px + s * 0.3, hz - ph + s * 0.8); ctx.lineTo(base + px - s * 0.2, hz - ph + s * 1.1); ctx.lineTo(base + px - s * 0.9, hz - ph + s); ctx.closePath(); ctx.fill(); }
        }
        // castelo no alto da segunda camada
        if (c.seed === 9) castelo(ctx, base + picos[4][0], hz - picos[4][1] + 30, 0.55);
      }
    }
    // névoa clara no pé das montanhas
    const g = ctx.createLinearGradient(0, hz - 160, 0, hz + 10);
    g.addColorStop(0, 'rgba(210,228,240,0)'); g.addColorStop(1, 'rgba(210,228,240,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, hz - 160, W, 175);
  }
  function castelo(ctx, x, y, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = '#C9D6E4';
    ctx.fillRect(-90, -120, 180, 120);
    for (const [tx, th] of [[-100, 190], [80, 170], [-15, 250]]) { ctx.fillRect(tx, -th, 36, th); ctx.fillStyle = '#7C8FB8'; ctx.beginPath(); ctx.moveTo(tx - 8, -th); ctx.lineTo(tx + 18, -th - 60); ctx.lineTo(tx + 44, -th); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#C9D6E4'; }
    ctx.fillStyle = '#9FB0C8'; for (const tx of [-60, -30, 30, 60]) ctx.fillRect(tx - 6, -90, 12, 22);
    ctx.fillStyle = '#E26B5B'; ctx.beginPath(); ctx.moveTo(3, -310); ctx.lineTo(3, -340); ctx.lineTo(40, -330); ctx.lineTo(3, -320); ctx.fill();
    ctx.restore();
  }

  function faixasZ(cam, ate = 160) { const zs = [cam.z - 120]; let z = cam.z - 6, d = 0.5; while (z < ate) { zs.push(z); z += d; d *= 1.16; } zs.push(ate); return zs; }
  function chao(ctx, cam) {
    const zs = faixasZ(cam), X = 260;
    for (let i = 0; i < zs.length - 1; i++) {
      const a = zs[i], b = zs[i + 1] + 0.03, k = (i % 2) * 0.03;
      face(ctx, cam, [[-X, 0, a], [X, 0, a], [X, 0, b], [-X, 0, b]], mistura('#74B444', '#68A83C', k), { contorno: false });
    }
    // trilha de terra serpenteando para dentro
    const pts = (lado) => { const out = []; for (const z of zs) { if (z > 90) break; const cx = Math.sin(z * 0.12) * 1.4 + 0.3, w = 0.75 + z * 0.012; out.push([cx + lado * w, 0.002, z]); } return out; };
    const e = pts(-1), d = pts(1);
    for (let i = 0; i < e.length - 1; i++) face(ctx, cam, [e[i], d[i], d[i + 1], e[i + 1]], mistura('#C9A06A', '#BE955E', (i % 2) * 0.4), { contorno: false });
  }


  // espada gigante antiga fincada no chão (referências cenario-01 e cenario-03): pedra com musgo e runas
  function espadaGigante(ctx, cam, X, Z, alt, inclina, o = {}) {
    const base = cam.p(X, 0, Z); if (base.dz < 2) return;
    const s = base.s, tom = (c) => cam.tom(c, Z);
    ctx.save(); ctx.translate(base.x, base.y); ctx.rotate(inclina);
    const L = alt * s, w = alt * 0.09 * s;
    ctx.fillStyle = tom('#8E96A6'); ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -L * 0.72); ctx.lineTo(w / 2, -L * 0.72); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tom('#6E7686'); ctx.fillRect(w * 0.05, -L * 0.72, w * 0.45, L * 0.72);
    ctx.fillStyle = tom('#7C8494'); ctx.beginPath(); ctx.roundRect(-w * 1.6, -L * 0.78, w * 3.2, w * 0.55, w * 0.2); ctx.fill();
    ctx.fillStyle = tom('#5E6676'); ctx.fillRect(-w * 0.32, -L * 0.98, w * 0.64, L * 0.2);
    ctx.fillStyle = tom('#7C8494'); ctx.beginPath(); ctx.arc(0, -L * 1.0, w * 0.5, 0, Math.PI * 2); ctx.fill();
    // musgo
    ctx.fillStyle = tom('#6FA14A');
    for (const [yy, ww] of [[-0.05, 1.3], [-0.3, 0.8], [-0.76, 1.8]]) { ctx.beginPath(); ctx.ellipse(0, yy * L, w * ww * 0.6, w * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
    // runas
    if (base.dz < 40) { ctx.fillStyle = tom('#4A5262'); ctx.font = `700 ${Math.max(6, w * 0.35)}px Inter`; ctx.textAlign = 'center'; const r = 'ᚠᚱᚢᚾᛖᛋᛏ'; for (let i = 0; i < 6; i++) ctx.fillText(r[i % r.length], -w * 0.1, -L * (0.12 + i * 0.09)); }
    ctx.restore();
    // monte de terra na base
    ctx.fillStyle = tom('#5E9A3E'); ctx.beginPath(); ctx.ellipse(base.x, base.y, alt * 0.12 * s, alt * 0.03 * s, 0, Math.PI, 0); ctx.fill();
  }
  const ESPADAS = [[-14, 42, 26, -0.18], [22, 60, 34, 0.14], [-30, 75, 22, 0.25], [9, 95, 18, -0.08], [-6, 28, 12, 0.1]];

  function tufo(ctx, cam, X, Z, h, fase, t) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.5 || q.x < -200 || q.x > 1280) return;
    const s = q.s, cor = cam.tom('#3F8A2E', Z), cor2 = cam.tom('#7CC24E', Z);
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const dx = (i - 2) * 0.035 * s, bal = Math.sin(t * 1.6 + fase + i) * 0.04 * s, alt = h * (0.7 + 0.3 * ((i * 7) % 3) / 2) * s;
      ctx.strokeStyle = i % 2 ? cor : cor2; ctx.lineWidth = Math.max(1, 0.025 * s);
      ctx.beginPath(); ctx.moveTo(q.x + dx, q.y); ctx.quadraticCurveTo(q.x + dx + bal * 0.5, q.y - alt * 0.6, q.x + dx * 1.8 + bal, q.y - alt); ctx.stroke();
    }
  }
  function flor(ctx, cam, X, Z, cor, fase, t) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.5 || q.x < -100 || q.x > 1180) return;
    const s = q.s, y = q.y - 0.14 * s, x = q.x + Math.sin(t * 1.4 + fase) * 0.02 * s;
    ctx.strokeStyle = cam.tom('#4E9A36', Z); ctx.lineWidth = Math.max(1, 0.012 * s); ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = cam.tom(cor, Z);
    for (let i = 0; i < 5; i++) { const a = i * 1.2566 + fase; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 0.025 * s, y + Math.sin(a) * 0.025 * s, 0.022 * s, 0.014 * s, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = cam.tom('#F2B53A', Z); ctx.beginPath(); ctx.arc(x, y, 0.014 * s, 0, Math.PI * 2); ctx.fill();
  }
  function pedra(ctx, cam, X, Z, r) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.6) return;
    const s = q.s;
    ctx.fillStyle = cam.tom('#9C9AA8', Z); ctx.beginPath(); ctx.ellipse(q.x, q.y - r * 0.4 * s, r * s, r * 0.55 * s, 0, Math.PI, 0); ctx.lineTo(q.x + r * s, q.y); ctx.lineTo(q.x - r * s, q.y); ctx.fill();
    ctx.fillStyle = cam.tom('#C2C0CC', Z); ctx.beginPath(); ctx.ellipse(q.x - r * 0.3 * s, q.y - r * 0.6 * s, r * 0.45 * s, r * 0.2 * s, -0.2, 0, Math.PI * 2); ctx.fill();
  }

  window.Cenarios3D.valdor = {
    nevoa: NEVOA,
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0;
      cam.distNevoa = o.distNevoa || 60;
      ceu(ctx, cam, t);
      montanhas(ctx, cam);
      chao(ctx, cam);
      // do mais longe para o mais perto
      const lista = [];
      if (o.espadas !== false) for (const [x, z, h, inc] of ESPADAS) lista.push([z, () => espadaGigante(ctx, cam, x, z, h, inc)]);
      for (const [x, z, h] of OBJ.arv) lista.push([z, () => arvore(ctx, cam, x, z, h, { folha: '#76B84A', folhaSombra: '#3E7A34' })]);
      for (const [x, z, r] of OBJ.ped) lista.push([z, () => pedra(ctx, cam, x, z, r)]);
      for (const [x, z, h, f] of OBJ.tufo) lista.push([z, () => tufo(ctx, cam, x, z, h, f, t)]);
      for (const [x, z, c, f] of OBJ.flor) lista.push([z, () => flor(ctx, cam, x, z, c, f, t)]);
      const dist = (z) => z - cam.z;
      lista.sort((a, b) => dist(b[0]) - dist(a[0]));
      for (const [z, fn] of lista) if (z > cam.z + 0.4) fn();
    },
    // luz da cena (referência do autor): raios de sol diagonais do alto à direita, ar levemente azulado embaixo
    luz(ctx, cam, o = {}) {
      const t = o.t || 0, W = ctx.canvas.width, H = ctx.canvas.height, desl = -(cam.yaw || 0) * cam.f * 0.5;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        const x0 = W + 80 + desl - i * 170, larg = 120 + i * 40, a = 0.07 - i * 0.012 + 0.01 * Math.sin(t * 0.5 + i);
        const g = ctx.createLinearGradient(x0, 0, x0 - 900, H); g.addColorStop(0, `rgba(255,248,225,${a})`); g.addColorStop(1, 'rgba(255,248,225,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x0 + larg, -10); ctx.lineTo(x0 + larg - 1100, H); ctx.lineTo(x0 - 1100, H); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      const g2 = ctx.createLinearGradient(0, H * 0.55, 0, H); g2.addColorStop(0, 'rgba(30,60,40,0)'); g2.addColorStop(1, 'rgba(30,60,40,0.18)');
      ctx.fillStyle = g2; ctx.fillRect(0, H * 0.55, W, H * 0.45);
      ctx.restore();
    },
    // grama alta desfocada no primeiro plano (profundidade, como na referência)
    frente(ctx, cam, o = {}) {
      const t = o.t || 0, W = ctx.canvas.width, H = ctx.canvas.height, forca = o.forca === undefined ? 1 : o.forca;
      if (forca <= 0) { this.luz(ctx, cam, o); return; }
      const desl = -(cam.yaw || 0) * cam.f * 1.6 - cam.x * 260;
      Cinema.desfocado(ctx, 10, (g) => {
        const r = rng(44);
        g.lineCap = 'round';
        for (let i = 0; i < 46; i++) {
          const x = ((r() * (W + 400) + desl) % (W + 400) + W + 400) % (W + 400) - 200, alt = (180 + r() * 380) * forca, bal = Math.sin(t * 1.3 + i) * 30;
          g.strokeStyle = i % 3 ? '#3F8A2E' : '#6CC048'; g.lineWidth = 14 + r() * 12;
          g.beginPath(); g.moveTo(x, H + 20); g.quadraticCurveTo(x + bal * 0.3, H - alt * 0.6, x + bal + (r() - 0.5) * 80, H - alt); g.stroke();
        }
        // margaridas grandes desfocadas (referência cenario-01)
        for (let i = 0; i < 7; i++) {
          const x = ((r() * (W + 400) + desl * 1.2) % (W + 400) + W + 400) % (W + 400) - 200, y = H - (40 + r() * 260) * forca, R = 50 + r() * 50, bal = Math.sin(t * 1.1 + i) * 10;
          for (let p = 0; p < 12; p++) { const a = p * Math.PI / 6 + i; g.fillStyle = '#F4F8FF'; g.beginPath(); g.ellipse(x + bal + Math.cos(a) * R * 0.55, y + Math.sin(a) * R * 0.55, R * 0.42, R * 0.14, a, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = '#F2B53A'; g.beginPath(); g.arc(x + bal, y, R * 0.24, 0, Math.PI * 2); g.fill();
        }
      });
      this.luz(ctx, cam, o);
    },
  };
})();

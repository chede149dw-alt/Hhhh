// Cenário em perspectiva: AVENIDA DA CIDADE À NOITE (A FENDA · Parte Final, palco da batalha).
// Mundo em metros: avenida de 12 m (x de -6 a 6) indo para dentro (Z, sem fim: os quarteirões se repetem),
// calçadas até ±9,2 m e prédios a partir de ±9,8 m. NADA no meio da avenida (sem árvore nem carro parado):
// a criatura e os personagens ficam sempre livres na frente do cenário.
// Uso: Cenarios3D.cidade.desenhar(ctx, cam, { t, acesas, zApaga, apagados, destruicao, beco })
//   acesas: 0..1 janelas e lojas acesas · zApaga: postes com Z maior que isso apagam · apagados: [Z...] postes apagados
//   destruicao: 0..1 fumaça, fogo e entulho · beco: true vira um beco estreito de tijolo
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const { face, mistura } = Cena3D;
  const NEVOA = '#2A2457';
  const FACHADAS = ['#2C3358', '#343C66', '#2A2D4A', '#3B3659', '#29405A', '#3D4262', '#33304F'];
  const TIJOLO = ['#3E2A33', '#35283A', '#432E31'];
  const SLOT = 18;
  const hash = (a, b = 0) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  function brilho(ctx, x, y, r, a, cor = '255,214,150') {
    if (a <= 0.01 || r <= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,250,235,${a})`); g.addColorStop(0.25, `rgba(${cor},${a * 0.55})`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  // quadrilátero simples (sem recorte): só se os 4 cantos estão na frente da câmera
  function quad(ctx, cam, pts, cor) {
    const q = pts.map((P) => cam.p(P[0], P[1], P[2]));
    if (q.some((v) => v.atras)) return null;
    ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y);
    for (let i = 1; i < q.length; i++) ctx.lineTo(q[i].x, q[i].y);
    ctx.closePath(); ctx.fill(); return q;
  }

  // ---------- céu ----------
  function ceu(ctx, cam, t, o) {
    const W = ctx.canvas.width, H = ctx.canvas.height, hz = cam.cy;
    const g = ctx.createLinearGradient(0, hz - 1500, 0, hz + 40);
    g.addColorStop(0, '#04051A'); g.addColorStop(0.5, '#10123A'); g.addColorStop(0.82, '#2A2160'); g.addColorStop(1, '#53316F');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // estrelas presas ao céu (giram com a câmera)
    for (let i = 0; i < 160; i++) {
      const az = (hash(i, 1) - 0.5) * 3.2, el = 0.08 + hash(i, 2) * 0.9;
      const x = cam.cx + (az - cam.yaw) * cam.f * 0.9, y = hz - el * cam.f * 0.9;
      if (x < -5 || x > W + 5 || y < -5 || y > hz - 30) continue;
      const pis = 0.55 + 0.45 * Math.sin(t * (1.5 + hash(i, 3) * 3) + i);
      ctx.fillStyle = `rgba(230,225,255,${(0.25 + hash(i, 4) * 0.6) * pis})`;
      const r = 1 + hash(i, 5) * 1.8; ctx.fillRect(x - r / 2, y - r / 2, r, r);
    }
    // lua com halo
    const mx = cam.cx + (0.42 - cam.yaw) * cam.f * 0.9, my = hz - 0.62 * cam.f * 0.9;
    if (mx > -200 && mx < W + 200) {
      brilho(ctx, mx, my, 260, 0.35, '170,160,255');
      ctx.fillStyle = '#EDE6FF'; ctx.beginPath(); ctx.arc(mx, my, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(180,170,220,0.45)'; ctx.beginPath(); ctx.arc(mx - 9, my - 6, 9, 0, Math.PI * 2); ctx.arc(mx + 10, my + 9, 6, 0, Math.PI * 2); ctx.fill();
    }
    // brilho roxo da cidade no horizonte (luz da fenda e da criatura)
    const gh = ctx.createRadialGradient(cam.cx, hz, 0, cam.cx, hz, 900);
    gh.addColorStop(0, `rgba(150,90,230,${0.35 + 0.1 * Math.sin(t * 0.8)})`); gh.addColorStop(1, 'rgba(150,90,230,0)');
    ctx.fillStyle = gh; ctx.fillRect(0, hz - 900, W, 1000);
    void o;
  }
  // silhueta da cidade lá no fim da avenida
  function skyline(ctx, cam, acesas) {
    const Zs = cam.z + 380;
    for (let i = 0; i < 46; i++) {
      const X = -330 + i * 14.5 + hash(i, 7) * 6, w = 10 + hash(i, 8) * 14, h = 30 + hash(i, 9) * 95;
      const a = cam.p(X - w / 2, 0, Zs + hash(i, 6) * 60), b = cam.p(X + w / 2, h, Zs + hash(i, 6) * 60);
      if (a.atras || b.x < -50 || a.x > ctx.canvas.width + 50) continue;
      ctx.fillStyle = i % 3 ? '#191C42' : '#1E1F48'; ctx.fillRect(a.x, b.y, b.x - a.x, a.y - b.y);
      const n = Math.floor((b.x - a.x) * (a.y - b.y) / 90);
      for (let j = 0; j < n; j++) if (hash(i * 97 + j, 11) < 0.35 * acesas) {
        ctx.fillStyle = hash(j, i) < 0.8 ? 'rgba(255,210,140,0.75)' : 'rgba(150,210,255,0.7)';
        ctx.fillRect(a.x + hash(j, 12 + i) * (b.x - a.x), b.y + hash(j, 13 + i) * (a.y - b.y), 2, 2);
      }
      if (h > 100) brilho(ctx, (a.x + b.x) / 2, b.y - 3, 14, 0.8, '255,60,60');
    }
  }

  // ---------- chão ----------
  function chao(ctx, cam, G, o) {
    const zIni = Math.max(cam.z + 0.3, -40), zFim = cam.z + 260;
    const corR = G.beco ? '#232232' : '#1D2036', corC = G.beco ? '#2C2A3A' : '#31344F';
    // faixas em Z (a névoa escurece com a distância)
    for (let z = zFim; z > zIni - 15; z -= 15) {
      const a = Math.max(zIni, z - 15), b = z; if (b <= a) continue;
      face(ctx, cam, [[-80, 0, a], [-G.RUA, 0, a], [-G.RUA, 0, b], [-80, 0, b]], corC, { contorno: false });
      face(ctx, cam, [[G.RUA, 0, a], [80, 0, a], [80, 0, b], [G.RUA, 0, b]], corC, { contorno: false });
      face(ctx, cam, [[-G.RUA, 0, a], [G.RUA, 0, a], [G.RUA, 0, b], [-G.RUA, 0, b]], corR, { contorno: false });
    }
    // meio-fio
    for (const s of [-1, 1]) {
      const x = s * G.RUA; const a = cam.p(x, 0.16, zIni + 0.2), b = cam.p(x, 0.16, zFim);
      if (!a.atras) { ctx.strokeStyle = cam.tom('#5A5C78', 30); ctx.lineWidth = Math.max(1, 0.12 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    if (G.beco) return;
    // faixa dupla amarela no meio
    for (const dx of [-0.16, 0.16]) for (let z = zFim; z > zIni - 15; z -= 15) {
      const a = Math.max(zIni, z - 15), b = z; if (b <= a) continue;
      face(ctx, cam, [[dx - 0.06, 0.01, a], [dx + 0.06, 0.01, a], [dx + 0.06, 0.01, b], [dx - 0.06, 0.01, b]], '#C9A23E', { contorno: false });
    }
    // faixas brancas tracejadas
    for (let k = Math.floor(zIni / 9); k * 9 < zFim; k++) for (const x of [-3, 3]) {
      const z0 = k * 9, z1 = z0 + 3; if (z1 < zIni) continue;
      face(ctx, cam, [[x - 0.07, 0.01, Math.max(zIni, z0)], [x + 0.07, 0.01, Math.max(zIni, z0)], [x + 0.07, 0.01, z1], [x - 0.07, 0.01, z1]], '#B9BCD0', { contorno: false });
    }
    // faixa de pedestre nas esquinas
    for (let k = Math.floor(zIni / SLOT); k * SLOT < zFim; k++) {
      if (!esquina(k)) continue;
      const zc = k * SLOT + 2.5; if (zc < zIni + 1) continue;
      for (let x = -5.4; x < 5.6; x += 1.1) face(ctx, cam, [[x, 0.01, zc], [x + 0.6, 0.01, zc], [x + 0.6, 0.01, zc + 3], [x, 0.01, zc + 3]], '#A9ACC2', { contorno: false });
    }
    void o;
  }
  const esquina = (k) => ((k % 5) + 5) % 5 === 2;

  // ---------- prédios ----------
  function listaPredios(cam, G) {
    const out = [];
    const k0 = Math.floor((cam.z - 30) / SLOT), k1 = Math.floor((cam.z + 240) / SLOT);
    for (let k = k0; k <= k1; k++) for (const s of [-1, 1]) {
      if (!G.beco && esquina(k)) continue; // rua lateral (vão entre os quarteirões)
      const id = k * 2 + (s > 0 ? 1 : 0);
      const rec = G.beco ? 0 : hash(id, 21) * 1.4;
      const ini = G.PRED + rec, prof = G.beco ? 8 : 12 + hash(id, 22) * 8;
      const z0 = k * SLOT + (G.beco ? 0 : 0.6), z1 = k * SLOT + SLOT - (G.beco ? 0 : 0.6);
      const h = G.beco ? 9 + hash(id, 23) * 7 : 13 + Math.pow(hash(id, 23), 1.6) * 38;
      const x0 = s < 0 ? -(ini + prof) : ini, x1 = s < 0 ? -ini : ini + prof;
      out.push({ id, s, k, x0, x1, z0, z1, h, cor: G.beco ? TIJOLO[((id % 3) + 3) % 3] : FACHADAS[Math.floor(hash(id, 24) * FACHADAS.length)], dens: 0.3 + hash(id, 25) * 0.5 });
    }
    return out;
  }
  // face vertical com degradê (embaixo mais quente, iluminada pela rua; em cima mais fria)
  function paredeDegrade(ctx, cam, pts, cor, zm, quente = 0.18) {
    const q = pts.map((P) => cam.p(P[0], P[1], P[2]));
    if (q.some((v) => v.atras)) { face(ctx, cam, pts, cam.tom(cor, zm), { contorno: false, semNevoa: true }); return; }
    const yb = (q[0].y + q[1].y) / 2, yt = (q[2].y + q[3].y) / 2;
    const g = ctx.createLinearGradient(0, yb, 0, yt);
    g.addColorStop(0, cam.tom(mistura(cor, '#B98A7A', quente), zm)); g.addColorStop(0.35, cam.tom(cor, zm)); g.addColorStop(1, cam.tom(mistura(cor, '#0B0D24', 0.35), zm));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y); for (let i = 1; i < 4; i++) ctx.lineTo(q[i].x, q[i].y); ctx.closePath(); ctx.fill();
  }
  function janelaCor(id, j) {
    const r = hash(id * 131 + j, 31);
    return r < 0.72 ? '#FFD08A' : r < 0.9 ? '#A9D8FF' : '#FFB3D1';
  }
  // janelas numa face vertical: eixo u (ao longo da parede) e altura
  function janelas(ctx, cam, b, plano, acesas, G, t) {
    // plano: { fixo: 'x'|'z', v: valor, u0, u1 }
    const larg = plano.u1 - plano.u0, nCol = Math.max(1, Math.floor((larg - 1) / G.passoJ)), passo = (larg - 1) / nCol;
    const pt = (u, y) => (plano.fixo === 'x' ? [plano.v, y, u] : [u, y, plano.v]);
    const zm = plano.fixo === 'x' ? (plano.u0 + plano.u1) / 2 : plano.v;
    const fat = cam.fator(zm);
    // teste rápido de tamanho: janela pequena demais vira só pontos
    const c0 = cam.p(...pt(plano.u0 + 0.5, 5)), c1 = cam.p(...pt(plano.u0 + 0.5 + passo, 5));
    if (c0.atras && c1.atras) return;
    const pxCol = Math.abs(c1.x - c0.x) + Math.abs(c1.y - c0.y);
    let j = 0;
    for (let y = G.andar0; y + 1.8 < b.h - 0.8; y += G.passoA) {
      for (let i = 0; i < nCol; i++, j++) {
        const u = plano.u0 + 0.5 + i * passo + passo * 0.22, w = passo * 0.56;
        const acesa = hash(b.id * 977 + j, 37) < b.dens * acesas;
        if (!acesa && pxCol < 7) continue;
        let cor;
        if (acesa) {
          const pis = b.id % 7 === 0 && j % 11 === 0 ? 0.6 + 0.4 * Math.sin(t * 13 + j) : 1;
          cor = mistura(janelaCor(b.id, j), NEVOA, fat * 0.55);
          if (pis < 1) cor = mistura(cor, '#20223A', 1 - pis);
        } else cor = cam.tom('#141833', zm);
        quad(ctx, cam, [pt(u, y), pt(u + w, y), pt(u + w, y + 1.7), pt(u, y + 1.7)], cor);
      }
    }
  }
  // térreo: vitrines de loja (acesas) e portas de enrolar
  function terreo(ctx, cam, b, plano, acesas, t) {
    const pt = (u, y) => (plano.fixo === 'x' ? [plano.v, y, u] : [u, y, plano.v]);
    const zm = plano.fixo === 'x' ? (plano.u0 + plano.u1) / 2 : plano.v;
    let i = 0;
    for (let u = plano.u0 + 0.6; u + 3.2 < plano.u1; u += 4.2, i++) {
      const acesa = hash(b.id * 53 + i, 41) < 0.55 * acesas;
      const cor = acesa ? mistura(hash(b.id + i, 42) < 0.5 ? '#FFE3B0' : '#9EE6FF', NEVOA, cam.fator(zm) * 0.5) : cam.tom('#22243A', zm);
      const q = quad(ctx, cam, [pt(u, 0.25), pt(u + 3.2, 0.25), pt(u + 3.2, 3.0), pt(u, 3.0)], cor);
      if (q && acesa) { const cx = (q[0].x + q[2].x) / 2, cy = (q[0].y + q[2].y) / 2; brilho(ctx, cx, cy, Math.abs(q[1].x - q[0].x) * 0.9 + 6, 0.18, hash(b.id + i, 42) < 0.5 ? '255,200,140' : '120,220,255'); }
      // toldo
      quad(ctx, cam, [pt(u - 0.1, 3.1), pt(u + 3.3, 3.1), pt(u + 3.3, 3.5), pt(u - 0.1, 3.5)], cam.tom('#191B30', zm));
    }
    void t;
  }
  function predio(ctx, cam, b, o, G) {
    const { x0, x1, z0, z1, h, s } = b, zm = (z0 + z1) / 2;
    const interna = s < 0 ? x1 : x0, veInterna = s < 0 ? cam.x > x1 : cam.x < x0;
    const corI = mistura(b.cor, '#8D86C0', 0.12), corF = mistura(b.cor, '#0A0B20', 0.25);
    // face de trás (câmera olhando para trás) e da frente
    if (cam.z > z1) { paredeDegrade(ctx, cam, [[x0, 0, z1], [x1, 0, z1], [x1, h, z1], [x0, h, z1]], corF, z1); }
    if (cam.z < z0) {
      paredeDegrade(ctx, cam, [[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]], corF, z0);
      if (!G.beco) janelas(ctx, cam, b, { fixo: 'z', v: z0 - 0.01, u0: x0, u1: x1 }, o.acesas, G, o.t);
    }
    if (veInterna) {
      paredeDegrade(ctx, cam, [[interna, 0, z0], [interna, 0, z1], [interna, h, z1], [interna, h, z0]], corI, zm, 0.24);
      const v = interna - s * 0.01;
      janelas(ctx, cam, b, { fixo: 'x', v, u0: z0, u1: z1 }, o.acesas, G, o.t);
      if (!G.beco) terreo(ctx, cam, { ...b, id: b.id + 500 }, { fixo: 'x', v: v - s * 0.01, u0: z0, u1: z1 }, o.acesas, o.t);
      // aresta iluminada (contraluz fria na quina)
      const a = cam.p(interna, 0, z0), c = cam.p(interna, h, z0);
      if (!a.atras && !c.atras) { ctx.strokeStyle = cam.tom('#8E90D8', zm); ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(1, 0.06 * a.s); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke(); ctx.globalAlpha = 1; }
      // letreiro neon saindo da parede
      if (!G.beco && hash(b.id, 51) < 0.45 && h > 14) {
        const zc = z0 + 2 + hash(b.id, 52) * (z1 - z0 - 5), on = hash(b.id, 53) < o.acesas + 0.15;
        const cor = hash(b.id, 54) < 0.5 ? ['#FF5FB0', '255,95,176'] : ['#5FE8FF', '95,232,255'];
        const xa = interna, xb = interna - s * 0.9;
        const q = quad(ctx, cam, [[xa, 5, zc], [xb, 5, zc], [xb, 10, zc], [xa, 10, zc]], on ? mistura(cor[0], NEVOA, cam.fator(zc) * 0.4) : cam.tom('#26283E', zc));
        if (q && on) brilho(ctx, (q[0].x + q[2].x) / 2, (q[0].y + q[2].y) / 2, Math.abs(q[2].y - q[0].y) * 1.1 + 8, 0.45, cor[1]);
      }
    }
    // topo (câmera alta) e luz vermelha no telhado dos altos
    if (cam.y > h) face(ctx, cam, [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], mistura(b.cor, '#0A0B20', 0.4), { contorno: false });
    if (h > 34 && !G.beco) { const q = cam.p(interna, h + 0.6, z0 + 1); if (!q.atras) brilho(ctx, q.x, q.y, 6 + 0.8 * q.s, 0.6 + 0.4 * Math.sin(o.t * 3 + b.id), '255,60,60'); }
  }

  // ---------- postes ----------
  function postes(cam, G, o) {
    const out = [];
    const k0 = Math.floor((cam.z - 20) / G.passoP), k1 = Math.floor((cam.z + 200) / G.passoP);
    for (let k = k0; k <= k1; k++) for (const s of [-1, 1]) {
      const Z = k * G.passoP + 4 + (s > 0 ? G.passoP / 2 : 0);
      let aceso = Z < o.zApaga && !(o.apagados || []).some((a) => Math.abs(a - Z) < 1);
      // pisca perto da frente do apagão
      if (aceso && o.zApaga - Z < 6) aceso = Math.sin(o.t * 40 + Z) > -0.3;
      out.push({ s, Z, aceso });
    }
    return out;
  }
  function poste(ctx, cam, p, G, t) {
    const { s, Z, aceso } = p;
    if (G.beco) { // luminária de parede
      const x = s * (G.PRED - 0.05), q = cam.p(x - s * 0.4, 3.6, Z); if (q.atras) return;
      ctx.fillStyle = '#121220'; ctx.fillRect(q.x - 0.15 * q.s, q.y - 0.1 * q.s, 0.3 * q.s, 0.18 * q.s);
      if (aceso) { brilho(ctx, q.x, q.y, 2.6 * q.s, 0.8, '255,190,120'); const c = cam.p(x - s * 1.2, 0, Z); if (!c.atras) poca(ctx, c.x, c.y, 2.4 * c.s, 0.4); }
      return;
    }
    const xb = s * (G.RUA + 0.7), xl = s * (G.RUA + 0.7 - 2.2), H = 8.4;
    const b = cam.p(xb, 0, Z), tp = cam.p(xb, H, Z), l = cam.p(xl, H + 0.15, Z);
    if (b.atras || tp.atras || l.atras) return;
    const cor = cam.tom('#262840', Z);
    ctx.strokeStyle = cor; ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.2, 0.16 * b.s); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tp.x, tp.y); ctx.stroke();
    ctx.lineWidth = Math.max(1, 0.1 * b.s); ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.quadraticCurveTo((tp.x + l.x) / 2, tp.y - 0.4 * tp.s, l.x, l.y); ctx.stroke();
    ctx.fillStyle = aceso ? '#FFF2D0' : cor; ctx.beginPath(); ctx.ellipse(l.x, l.y + 0.05 * l.s, 0.45 * l.s, 0.12 * l.s, 0, 0, Math.PI * 2); ctx.fill();
    if (!aceso) return;
    // cone de luz e poça no chão
    const ch = cam.p(xl, 0, Z);
    if (!ch.atras) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, l.y, 0, ch.y); const ac = 0.14 * (1 - cam.fator(Z)) * (1 - cam.fator(Z)); g.addColorStop(0, `rgba(255,214,150,${ac})`); g.addColorStop(1, 'rgba(255,214,150,0.01)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(l.x - 0.3 * l.s, l.y); ctx.lineTo(l.x + 0.3 * l.s, l.y); ctx.lineTo(ch.x + 2.6 * ch.s, ch.y); ctx.lineTo(ch.x - 2.6 * ch.s, ch.y); ctx.fill();
      ctx.restore();
      poca(ctx, ch.x, ch.y, 3.4 * ch.s, 0.5);
    }
    brilho(ctx, l.x, l.y, Math.min(240, 2.4 * l.s + 10), 0.85, '255,214,150');
    void t;
  }
  function poca(ctx, x, y, r, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,205,140,${a * 0.5})`); g.addColorStop(1, 'rgba(255,205,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  // ---------- destruição: fumaça, fogo e entulho ----------
  function fumaca(ctx, cam, X, Z, t, forca, sem) {
    const b = cam.p(X, 0, Z); if (b.atras) return;
    // fogo na base
    const fl = 0.7 + 0.3 * Math.sin(t * 17 + sem) * Math.sin(t * 7.3 + sem * 2);
    brilho(ctx, b.x, b.y - 1.5 * b.s, 7 * b.s * forca, 0.55 * fl * forca, '255,130,50');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const ph = (((t * 0.9 + i / 7 + sem * 0.13) % 1) + 1) % 1, q = cam.p(X + Math.sin(i * 2.1 + sem) * 1.2, ph * 4, Z);
      ctx.fillStyle = `rgba(255,${120 + i * 15},50,${0.5 * (1 - ph) * forca})`;
      ctx.beginPath(); ctx.ellipse(q.x, q.y, 0.9 * q.s * (1 - ph * 0.6), 1.6 * q.s * (1 - ph * 0.5), 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // coluna de fumaça subindo e abrindo
    for (let i = 0; i < 14; i++) {
      const ph = (((t * 0.12 + i / 14 + sem * 0.37) % 1) + 1) % 1, Y = 2 + ph * 40, R = 2 + ph * 9;
      const q = cam.p(X + Math.sin(ph * 4 + sem) * 3 + ph * 6, Y, Z + ph * 4); if (q.atras) continue;
      const a = 0.32 * forca * Math.sin(ph * Math.PI);
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R * q.s);
      g.addColorStop(0, `rgba(36,30,52,${a})`); g.addColorStop(1, 'rgba(36,30,52,0)');
      ctx.fillStyle = g; ctx.fillRect(q.x - R * q.s, q.y - R * q.s, 2 * R * q.s, 2 * R * q.s);
    }
  }
  function entulho(ctx, cam, X, Z, sem) {
    for (let i = 0; i < 9; i++) {
      const x = X + (hash(sem, i) - 0.5) * 3, z = Z + (hash(sem, i + 9) - 0.5) * 3, w = 0.3 + hash(sem, i + 20) * 0.9, hh = 0.2 + hash(sem, i + 30) * 0.6;
      Cena3D.caixa(ctx, cam, x - w / 2, x + w / 2, 0, hh, z - w / 2, z + w / 2, mistura('#3A3B55', '#5A4E62', hash(sem, i + 40)), { linha: 0, contorno: false });
    }
  }

  window.Cenarios3D.cidade = {
    nevoa: NEVOA,
    RUA: 6, PRED: 9.8,
    desenhar(ctx, cam, o = {}) {
      const op = { t: 0, acesas: 1, zApaga: 999, destruicao: 0, ...o };
      const G = op.beco
        ? { beco: true, RUA: 2.6, PRED: 3.2, passoJ: 3.2, passoA: 3.4, andar0: 4.2, passoP: 9 }
        : { beco: false, RUA: 6, PRED: 9.8, passoJ: 2.3, passoA: 3.2, andar0: 4.4, passoP: 14 };
      ctx.save();
      ceu(ctx, cam, op.t, op);
      if (!G.beco) skyline(ctx, cam, op.acesas);
      chao(ctx, cam, G, op);
      // do fundo para a frente
      const itens = [];
      const prof = (X, Z) => { const e = cam.esp(X, 0, Z); return e[2] + Math.abs(e[0]) * 0.05; };
      for (const b of listaPredios(cam, G)) {
        // profundidade: canto da face interna mais perto da câmera
        const xi = b.s < 0 ? b.x1 : b.x0, zc = Math.min(Math.max(cam.z, b.z0), b.z1);
        itens.push({ d: prof(xi, zc) + 0.5, f: () => predio(ctx, cam, b, op, G) });
      }
      for (const p of postes(cam, G, op)) {
        if (op.semPoste && op.semPoste(p.s, p.Z)) continue;
        const x = G.beco ? p.s * G.PRED : p.s * (G.RUA + 0.7);
        itens.push({ d: prof(x, p.Z), f: () => poste(ctx, cam, p, G, op.t) });
      }
      if (op.destruicao > 0 && !G.beco) {
        const kz = Math.floor(cam.z / 30);
        for (let k = kz; k < kz + 6; k++) {
          const s = hash(k, 61) < 0.5 ? -1 : 1, X = s * (G.PRED + 2 + hash(k, 62) * 6), Z = k * 30 + 12 + hash(k, 63) * 10;
          if (hash(k, 64) < 0.75) itens.push({ d: prof(X, Z) - 0.1, f: () => fumaca(ctx, cam, X, Z, op.t, op.destruicao, k) });
          const Xe = s * (G.RUA + 1.5 + hash(k, 65) * 1.5);
          itens.push({ d: prof(Xe, Z - 6), f: () => entulho(ctx, cam, Xe, Z - 6, k) });
        }
      }
      itens.filter((i) => i.d > 0.3).sort((a, b) => b.d - a.d).forEach((i) => i.f());
      ctx.restore();
    },
  };
})();

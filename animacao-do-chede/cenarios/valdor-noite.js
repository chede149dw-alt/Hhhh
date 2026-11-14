// Cenário em perspectiva: CAMPO DE VALDOR À NOITE (Parte 2). Mesmo campo da Parte 1, agora com:
// lua grande subindo atrás das espadas gigantes, estrelas e via láctea, nuvens com borda prateada, montanhas em silhueta,
// castelo com janelas acesas, rio atravessando o campo com o reflexo da lua, árvores escuras com recorte azul de luar,
// runas das espadas brilhando, neblina baixa, feixes de luar, vaga-lumes e flores da lua.
// o.noite (0..1): 0 = pôr do sol, 1 = noite fechada (transição do episódio).
// Uso: const cam = Cena3D.camera({ ..., nevoa: Cenarios3D.valdorNoite.nevoa(n) })
//      Cenarios3D.valdorNoite.desenhar(ctx, cam, { t, noite })  → personagens (personagemNoite) → frente(ctx, cam, { t, noite, forca })
(function () {
  window.Cenarios3D = window.Cenarios3D || {};
  const { face, mistura } = Cena3D;
  const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const lerp = (a, b, k) => a + (b - a) * k, cl = (v) => Math.max(0, Math.min(1, v)), suave = (a, b, v) => { const k = cl((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const M = (dia, noite, n) => mistura(dia, noite, n);
  const RIO = { z0: 8, larg: 3.2 }; // rio atravessando o campo
  const rioZ = (x) => RIO.z0 + Math.sin(x * 0.11) * 0.7 + Math.sin(x * 0.035) * 1.6;

  const naTrilha = (x, z) => Math.abs(x - (Math.sin(z * 0.12) * 1.4 + 0.3)) < 0.8 + z * 0.012;
  const OBJ = (() => {
    const r = rng(2026), arv = [], ped = [], tufo = [], flor = [], luz = [];
    for (let i = 0; i < 70; i++) {
      const z = 4 + r() * 70, lado = r() < 0.5 ? -1 : 1, x = lado * (4.5 + r() * (6 + z * 0.6));
      if (Math.abs(z - rioZ(x)) < RIO.larg) continue;
      arv.push([x, z, 3.2 + r() * 2.6, r() < 0.35 ? 'pinheiro' : 'copa', r() * 1000]);
    }
    for (let i = 0; i < 26; i++) { const z = 1 + r() * 30, x = (r() * 2 - 1) * (3 + z * 0.4); if (Math.abs(x) > 1.2 && Math.abs(z - rioZ(x)) > RIO.larg) ped.push([x, z, 0.18 + r() * 0.35]); }
    for (let i = 0; i < 1500; i++) { const z = 0.4 + Math.pow(r(), 1.7) * 32, x = (r() * 2 - 1) * (2.2 + z * 0.9); if (Math.abs(z - rioZ(x) - RIO.larg / 2) > RIO.larg * 0.6 && !naTrilha(x, z)) tufo.push([x, z, 0.28 + r() * 0.26, r() * 6]); }
    for (let i = 0; i < 90; i++) { const z = 0.8 + Math.pow(r(), 1.4) * 18, x = (r() * 2 - 1) * (2 + z * 0.8); if (Math.abs(x) > 0.9 && Math.abs(z - rioZ(x) - RIO.larg / 2) > RIO.larg * 0.6) flor.push([x, z, r() * 6]); }
    for (let i = 0; i < 90; i++) luz.push([(r() * 2 - 1) * 9, 0.25 + r() * 1.8, 1 + Math.pow(r(), 1.3) * 26, r() * 10, 0.6 + r() * 0.8]);
    // grama nas bordas da trilha e pedrinhas no caminho
    const seixo = [];
    for (let z = 0.6; z < 30; z += 0.22 + z * 0.02) { const cx = Math.sin(z * 0.12) * 1.4 + 0.3, w = 0.8 + z * 0.012; if (Math.abs(z - rioZ(cx) - RIO.larg / 2) < RIO.larg * 0.8) continue; for (const sd of [-1, 1]) tufo.push([cx + sd * (w - 0.05 + r() * 0.2), z + r() * 0.1, 0.16 + r() * 0.16, r() * 6]); for (let k = 0; k < 2; k++) seixo.push([cx + (r() * 2 - 1) * w * 0.8, z + r() * 0.2, 0.03 + r() * 0.05]); }
    const grama = []; for (let i = 0; i < 4200; i++) { const z = 0.3 + Math.pow(r(), 1.5) * 40, x = (r() * 2 - 1) * (2 + z * 0.95); if (Math.abs(z - rioZ(x) - RIO.larg / 2) > RIO.larg * 0.55 && !naTrilha(x, z)) grama.push([x, z, r()]); }
    const mata = []; for (const [zf, n0, seed] of [[95, 120, 1], [62, 90, 2]]) { const rr = rng(seed + 50); for (let i = 0; i < n0; i++) mata.push([(i / n0) * 360 - 180 + rr() * 2, zf + rr() * 6, 4 + rr() * 5, rr() < 0.4 ? 'p' : 'c', zf]); }
    return { arv, ped, tufo, flor, luz, grama, mata, seixo };
  })();
  const ESPADAS = [[-16, 46, 26, -0.18], [24, 62, 34, 0.14], [-34, 80, 22, 0.25], [10, 98, 18, -0.08]];

  // posição da lua na tela (sobe com a noite), usada também pelo reflexo e pelos feixes
  function lua(cam, n) { const W = cam.cx * 2, desl = -cam.yaw * cam.f * 0.9; return { x: W * 0.36 + desl, y: cam.cy - lerp(120, 640, suave(0.15, 1, n)), r: 150 }; }

  function ceu(ctx, cam, t, n) {
    const W = ctx.canvas.width, hz = cam.cy, desl = -cam.yaw * cam.f;
    const g = ctx.createLinearGradient(0, hz - 1500, 0, hz + 20);
    g.addColorStop(0, M('#2B3C7A', '#060A20', n)); g.addColorStop(0.45, M('#7A5A9A', '#121C46', n)); g.addColorStop(0.8, M('#E58A6A', '#24336A', n)); g.addColorStop(1, M('#FFC07A', '#3E4A86', n));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 80);
    // estrelas + via láctea
    const ae = suave(0.35, 1, n);
    if (ae > 0) {
      ctx.save(); ctx.translate(desl * 0.2, 0);
      const vl = ctx.createLinearGradient(-200, hz - 1400, W + 200, hz - 300);
      vl.addColorStop(0, 'rgba(150,160,230,0)'); vl.addColorStop(0.45, `rgba(170,175,240,${0.16 * ae})`); vl.addColorStop(0.55, `rgba(210,190,255,${0.2 * ae})`); vl.addColorStop(1, 'rgba(150,160,230,0)');
      ctx.save(); ctx.filter = 'blur(60px)'; ctx.fillStyle = vl; ctx.beginPath(); ctx.moveTo(-300, hz - 1100); ctx.lineTo(W + 300, hz - 1700); ctx.lineTo(W + 300, hz - 1350); ctx.lineTo(-300, hz - 650); ctx.closePath(); ctx.fill(); ctx.restore();
      const r = rng(5);
      for (let i = 0; i < 320; i++) {
        const x = r() * (W + 600) - 300, y = r() * (hz - 120), tam = r() < 0.06 ? 3.2 : 1 + r() * 1.4, pis = 0.55 + 0.45 * Math.sin(t * (1.5 + r() * 3) + i);
        ctx.fillStyle = `rgba(${r() < 0.2 ? '255,230,200' : '225,235,255'},${ae * pis * (0.5 + 0.5 * (1 - y / hz))})`;
        ctx.beginPath(); ctx.arc(x, y, tam, 0, Math.PI * 2); ctx.fill();
        if (tam > 3) { ctx.strokeStyle = `rgba(225,235,255,${ae * pis * 0.5})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.stroke(); }
      }
      ctx.restore();
    }
    // sol se pondo (some com a noite)
    if (n < 0.75) {
      const sx = W * 0.8 + desl * 0.9, sy = hz - 160 + 260 * n, a = 1 - suave(0.3, 0.75, n);
      const h = ctx.createRadialGradient(sx, sy, 0, sx, sy, 800); h.addColorStop(0, `rgba(255,220,160,${a})`); h.addColorStop(0.1, `rgba(255,170,100,${0.7 * a})`); h.addColorStop(1, 'rgba(255,150,100,0)');
      ctx.fillStyle = h; ctx.fillRect(0, 0, W, hz + 80);
      ctx.fillStyle = `rgba(255,236,190,${a})`; ctx.beginPath(); ctx.arc(sx, sy, 70, 0, Math.PI * 2); ctx.fill();
    }
    // lua grande com halo e crateras
    const L = lua(cam, n), al = suave(0.1, 0.6, n);
    if (al > 0) {
      const h = ctx.createRadialGradient(L.x, L.y, L.r * 0.8, L.x, L.y, L.r * 5); h.addColorStop(0, `rgba(200,215,255,${0.45 * al})`); h.addColorStop(0.3, `rgba(150,170,240,${0.16 * al})`); h.addColorStop(1, 'rgba(120,140,220,0)');
      ctx.fillStyle = h; ctx.fillRect(0, 0, W, hz + 80);
      const gl = ctx.createRadialGradient(L.x - L.r * 0.3, L.y - L.r * 0.3, L.r * 0.1, L.x, L.y, L.r);
      gl.addColorStop(0, `rgba(255,253,244,${al})`); gl.addColorStop(0.8, `rgba(236,236,226,${al})`); gl.addColorStop(1, `rgba(206,212,228,${al})`);
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.clip();
      for (const [dx, dy, rr, a] of [[-0.35, -0.2, 0.2, 0.16], [0.25, 0.15, 0.16, 0.14], [-0.05, 0.42, 0.12, 0.12], [0.42, -0.35, 0.09, 0.12], [-0.5, 0.3, 0.1, 0.1], [0.05, -0.05, 0.3, 0.06]]) { ctx.fillStyle = `rgba(150,155,175,${a * al * 1.5})`; ctx.beginPath(); ctx.arc(L.x + dx * L.r, L.y + dy * L.r, rr * L.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    // nuvens finas e compridas, abaixo da lua, com a borda de baixo prateada (ou dourada no pôr do sol)
    const r = rng(7);
    for (let i = 0; i < 5; i++) {
      const w = 420 + r() * 380, y = hz - 260 - r() * 300, x = ((r() * 2400 + t * (6 + r() * 8) + desl * 0.95) % 2700 + 2700) % 2700 - 800;
      const corN = `${Math.round(lerp(150, 30, n))},${Math.round(lerp(90, 40, n))},${Math.round(lerp(130, 86, n))}`;
      for (const [dx, dy, k, a] of [[0, 0, 0.5, 0.5], [0.22, -0.03, 0.34, 0.6], [-0.25, 0.01, 0.3, 0.55], [0.5, 0.02, 0.2, 0.45], [-0.5, 0.03, 0.18, 0.4]]) {
        const cx = x + dx * w, cy = y + dy * w, rx = k * w, ry = k * w * 0.16;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx); g.addColorStop(0, `rgba(${corN},${a})`); g.addColorStop(0.7, `rgba(${corN},${a * 0.6})`); g.addColorStop(1, `rgba(${corN},0)`);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.translate(-cx, -cy); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      const gb = ctx.createLinearGradient(x - 0.4 * w, 0, x + 0.4 * w, 0); const cb = n > 0.5 ? `190,210,255` : `255,190,130`, ab = n > 0.5 ? 0.45 * n : 0.6 * (1 - n);
      gb.addColorStop(0, `rgba(${cb},0)`); gb.addColorStop(0.4, `rgba(${cb},${ab})`); gb.addColorStop(1, `rgba(${cb},0)`);
      ctx.fillStyle = gb; ctx.beginPath(); ctx.ellipse(x - 0.05 * w, y + 0.04 * w, 0.42 * w, 0.012 * w, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function montanhas(ctx, cam, n, t) {
    const W = ctx.canvas.width, hz = cam.cy, desl = -cam.yaw * cam.f;
    const camadas = [
      { alt: 620, cor: M('#8D7CA8', '#1C2452', n), neve: true, seed: 3, per: 1500 },
      { alt: 420, cor: M('#6E6496', '#151C44', n), neve: true, seed: 9, per: 1100 },
      { alt: 200, cor: M('#3E5A3C', '#0E1A26', n), neve: false, seed: 15, per: 800 },
    ];
    for (const c of camadas) {
      const r = rng(c.seed), picos = [];
      for (let i = 0; i < 12; i++) picos.push([i * c.per / 3 + r() * 120, c.alt * (0.55 + r() * 0.45)]);
      const ofs = ((desl % (c.per * 4)) + c.per * 4) % (c.per * 4);
      for (let rep = -1; rep <= 1; rep++) {
        const base = -ofs + rep * c.per * 4;
        const gm = ctx.createLinearGradient(0, hz - c.alt, 0, hz); gm.addColorStop(0, mistura(c.cor, n > 0.5 ? '#8A9AD8' : '#E8B8A8', 0.28)); gm.addColorStop(1, c.cor);
        ctx.fillStyle = gm; ctx.beginPath(); ctx.moveTo(base - 200, hz + 4);
        for (const [px, ph] of picos) { ctx.lineTo(base + px - ph * 0.9, hz + 4); ctx.lineTo(base + px, hz - ph); ctx.lineTo(base + px + ph * 0.9, hz + 4); }
        ctx.lineTo(base + c.per * 4 + 200, hz + 4); ctx.closePath(); ctx.fill();
        // lado iluminado pela lua (esquerda)
        ctx.fillStyle = `rgba(150,170,240,${0.16 * n})`;
        for (const [px, ph] of picos) { ctx.beginPath(); ctx.moveTo(base + px, hz - ph); ctx.lineTo(base + px - ph * 0.9, hz + 4); ctx.lineTo(base + px - ph * 0.3, hz + 4); ctx.closePath(); ctx.fill(); }
        if (c.neve) {
          ctx.fillStyle = M('#F4D8D0', '#9DB0E0', n);
          for (const [px, ph] of picos) { if (ph < c.alt * 0.7) continue; const s = ph * 0.2; ctx.beginPath(); ctx.moveTo(base + px, hz - ph); ctx.lineTo(base + px + s * 0.9, hz - ph + s); ctx.lineTo(base + px + s * 0.3, hz - ph + s * 0.8); ctx.lineTo(base + px - s * 0.2, hz - ph + s * 1.1); ctx.lineTo(base + px - s * 0.9, hz - ph + s); ctx.closePath(); ctx.fill(); }
        }
        if (c.seed === 9) castelo(ctx, base + picos[4][0], hz - picos[4][1] + 30, 0.55, n, t);
      }
    }
    const g = ctx.createLinearGradient(0, hz - 200, 0, hz + 10);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, n > 0.5 ? `rgba(70,90,160,${0.5 * n})` : `rgba(240,170,130,${0.55 * (1 - n)})`);
    ctx.fillStyle = g; ctx.fillRect(0, hz - 200, W, 215);
  }
  function castelo(ctx, x, y, k, n, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const cor = M('#B9A9C8', '#202A58', n), teto = M('#6E6496', '#141A40', n);
    ctx.fillStyle = cor; ctx.fillRect(-90, -120, 180, 120);
    for (const [tx, th] of [[-100, 190], [80, 170], [-15, 250]]) { ctx.fillRect(tx, -th, 36, th); ctx.fillStyle = teto; ctx.beginPath(); ctx.moveTo(tx - 8, -th); ctx.lineTo(tx + 18, -th - 60); ctx.lineTo(tx + 44, -th); ctx.closePath(); ctx.fill(); ctx.fillStyle = cor; }
    // janelas acesas (luz quente piscando)
    const a = suave(0.3, 0.8, n);
    for (const [wx, wy] of [[-60, -80], [-30, -80], [30, -80], [60, -80], [-85, -150], [93, -130], [0, -200], [0, -160]]) {
      const f = 0.8 + 0.2 * Math.sin(t * 4 + wx);
      ctx.fillStyle = `rgba(255,190,90,${a * 0.35 * f})`; ctx.beginPath(); ctx.arc(wx, wy, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = a > 0 ? `rgba(255,214,120,${a * f})` : '#9FB0C8'; ctx.fillRect(wx - 5, wy - 9, 10, 18);
    }
    ctx.restore();
  }

  function faixasZ(cam, ate = 160) { const zs = [cam.z - 120]; let z = cam.z - 6, d = 0.5; while (z < ate) { zs.push(z); z += d; d *= 1.16; } zs.push(ate); return zs; }
  function chao(ctx, cam, n, t) {
    const zs = faixasZ(cam), X = 260;
    for (let i = 0; i < zs.length - 1; i++) {
      const a = zs[i], b = zs[i + 1] + 0.03, k = (i % 2) * 0.012;
      face(ctx, cam, [[-X, 0, a], [X, 0, a], [X, 0, b], [-X, 0, b]], mistura(M('#4E7A30', '#18332A', n), M('#46702B', '#152E25', n), k), { contorno: false });
    }
    // luar no chão: manchas mais claras onde a luz passa entre as árvores
    const rn = rng(91);
    for (let i = 0; i < 12; i++) {
      const cx = (rn() * 2 - 1) * 30, cz = 3 + rn() * 50, rx = 3 + rn() * 6, rz = 2 + rn() * 3, nn = 14, pts = [];
      for (let k = 0; k < nn; k++) { const a = (k / nn) * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, 0.003, cz + Math.sin(a) * rz]); }
      if (pts.some(([, , z]) => z < cam.z + 0.5)) continue;
      ctx.fillStyle = n > 0.5 ? `rgba(110,140,210,${0.12 * n * (1 - cam.fator(cz))})` : `rgba(20,40,20,${0.18 * (1 - cam.fator(cz))})`;
      ctx.fill(Cena3D.caminho(cam, pts));
    }
    // trilha de terra
    const pts = (lado) => { const out = []; for (const z of zs) { if (z > 90) break; const cx = Math.sin(z * 0.12) * 1.4 + 0.3, w = 0.75 + z * 0.012; out.push([cx + lado * w, 0.002, z]); } return out; };
    const e = pts(-1), d = pts(1);
    for (let i = 0; i < e.length - 1; i++) {
      const zr = rioZ(e[i][0] / 2 + d[i][0] / 2); if (e[i][2] > zr - 0.4 && e[i][2] < zr + RIO.larg + 0.4) continue;
      face(ctx, cam, [e[i], d[i], d[i + 1], e[i + 1]], mistura(M('#8E6A48', '#2E3446', n), M('#84623F', '#2B3142', n), (i % 2) * 0.1), { contorno: false });
    }
    gramaBaixa(ctx, cam, n);
    for (const [X, Z, rr] of OBJ.seixo) { const q = cam.p(X, 0, Z); if (q.dz < 0.5) continue; ctx.fillStyle = cam.tom(M('#6E5A48', '#22283A', n), Z); ctx.beginPath(); ctx.ellipse(q.x, q.y, rr * q.s, rr * 0.45 * q.s, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = cam.tom(M('#B8A088', '#4E5E86', n), Z); ctx.beginPath(); ctx.ellipse(q.x - rr * 0.3 * q.s, q.y - rr * 0.15 * q.s, rr * 0.45 * q.s, rr * 0.18 * q.s, 0, 0, Math.PI * 2); ctx.fill(); }
    rio(ctx, cam, n, t);
    ponte(ctx, cam, n);
  }
  // ponte de tábuas onde a trilha cruza o rio
  function ponte(ctx, cam, n) {
    const z0 = rioZ(0.3) - 0.5, z1 = rioZ(0.3) + RIO.larg + 0.5, cx = Math.sin(((z0 + z1) / 2) * 0.12) * 1.4 + 0.3, w = 0.85;
    const madeira = M('#7A5638', '#2E2A3A', n), madeira2 = M('#664629', '#26222F', n);
    for (let z = z0, k = 0; z < z1; z += 0.28, k++) face(ctx, cam, [[cx - w, 0.12, z], [cx + w, 0.12, z], [cx + w, 0.12, z + 0.24], [cx - w, 0.12, z + 0.24]], k % 2 ? madeira : madeira2, { contorno: false });
    for (const s of [-1, 1]) { face(ctx, cam, [[cx + s * w, 0.12, z0], [cx + s * w, 0.55, z0], [cx + s * w, 0.55, z1], [cx + s * w, 0.12, z1]], M('#5A3E28', '#1E1C2A', n), { contorno: false }); face(ctx, cam, [[cx + s * w, 0.5, z0], [cx + s * w, 0.6, z0], [cx + s * w, 0.6, z1], [cx + s * w, 0.5, z1]], M('#8A6440', '#4A5478', n), { contorno: false }); }
  }
  // rio atravessando o campo, com o reflexo da lua tremendo na água
  function rio(ctx, cam, n, t) {
    const xs = []; for (let x = -120; x <= 120; x += 3) xs.push(x);
    const borda = (k) => xs.map((x) => [x, 0.004, rioZ(x) + k * RIO.larg]);
    const a = borda(0), b = borda(1);
    const agua = Cena3D.caminho(cam, [...a, ...b.reverse()]);
    const zc = RIO.z0 + RIO.larg / 2, top = cam.p(0, 0, RIO.z0 - 2).y, bot = cam.p(0, 0, RIO.z0 + 4).y;
    const g = ctx.createLinearGradient(0, bot, 0, top);
    g.addColorStop(0, M('#D89A88', '#34488E', n)); g.addColorStop(1, M('#8A78A8', '#1A2858', n));
    ctx.fillStyle = g; ctx.fill(agua);
    // margens escuras com pedrinhas
    ctx.strokeStyle = n > 0.5 ? 'rgba(150,180,255,0.35)' : 'rgba(255,220,180,0.4)'; ctx.lineWidth = 3; ctx.stroke(Cena3D.caminho(cam, borda(0))); ctx.stroke(Cena3D.caminho(cam, borda(1)));
    ctx.save(); ctx.clip(agua);
    // reflexo do céu/lua: coluna de traços horizontais tremendo embaixo da lua
    const L = lua(cam, n), al = suave(0.2, 0.7, n), r = rng(13);
    for (let i = 0; i < 70; i++) {
      const y = lerp(bot, top, r()), w = (20 + r() * 90) * (0.6 + 0.4 * Math.sin(t * 3 + i)), x = L.x + (r() - 0.5) * 120 + Math.sin(t * 2 + i * 1.7) * 14;
      ctx.fillStyle = `rgba(225,232,255,${al * (0.35 + 0.5 * r())})`; ctx.fillRect(x - w / 2, y, w, 2 + r() * 3);
    }
    // ondinhas
    ctx.strokeStyle = `rgba(160,185,255,${0.18 + 0.1 * n})`; ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const x0 = (r() * 2 - 1) * 60, z = rioZ(x0) + 0.3 + r() * (RIO.larg - 0.6), q = cam.p(x0 + Math.sin(t + i) * 0.4, 0, z); if (q.dz < 1) continue; ctx.beginPath(); ctx.moveTo(q.x - 0.5 * q.s, q.y); ctx.quadraticCurveTo(q.x, q.y - 0.05 * q.s, q.x + 0.5 * q.s, q.y); ctx.stroke(); }
    ctx.restore();
  }

  // espada gigante antiga com runas que brilham à noite
  function espadaGigante(ctx, cam, X, Z, alt, inclina, n, t) {
    const base = cam.p(X, 0, Z); if (base.dz < 2) return;
    const s = base.s, tom = (c) => cam.tom(c, Z);
    ctx.save(); ctx.translate(base.x, base.y); ctx.rotate(inclina);
    const L = alt * s, w = alt * 0.09 * s;
    ctx.fillStyle = tom(M('#7E7A96', '#2A3150', n)); ctx.fillRect(-w / 2, -L * 0.72, w, L * 0.72);
    ctx.fillStyle = tom(M('#5E5A76', '#1B2140', n)); ctx.fillRect(w * 0.05, -L * 0.72, w * 0.45, L * 0.72);
    ctx.fillStyle = `rgba(160,185,255,${0.35 * n})`; ctx.fillRect(-w / 2, -L * 0.72, w * 0.12, L * 0.72);
    ctx.fillStyle = tom(M('#6C6884', '#252B4A', n)); ctx.beginPath(); ctx.roundRect(-w * 1.6, -L * 0.78, w * 3.2, w * 0.55, w * 0.2); ctx.fill();
    ctx.fillStyle = tom(M('#4E4A66', '#181D38', n)); ctx.fillRect(-w * 0.32, -L * 0.98, w * 0.64, L * 0.2);
    ctx.fillStyle = tom(M('#6C6884', '#252B4A', n)); ctx.beginPath(); ctx.arc(0, -L * 1.0, w * 0.5, 0, Math.PI * 2); ctx.fill();
    // runas acesas (azul-claro, pulsando)
    const ar = suave(0.4, 1, n);
    if (ar > 0 && base.dz < 90) {
      const p = 0.7 + 0.3 * Math.sin(t * 2 + X);
      ctx.save(); ctx.shadowColor = 'rgba(120,220,255,0.9)'; ctx.shadowBlur = w * 0.8;
      ctx.fillStyle = `rgba(150,235,255,${ar * p})`; ctx.font = `700 ${Math.max(6, w * 0.38)}px Inter`; ctx.textAlign = 'center';
      const rr = 'ᚠᚱᚢᚾᛖᛋᛏ'; for (let i = 0; i < 6; i++) ctx.fillText(rr[i % rr.length], -w * 0.05, -L * (0.12 + i * 0.09));
      ctx.beginPath(); ctx.arc(0, -L * 0.755, w * 0.18, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = tom(M('#3E6A2E', '#12261E', n)); ctx.beginPath(); ctx.ellipse(base.x, base.y, alt * 0.12 * s, alt * 0.03 * s, 0, Math.PI, 0); ctx.fill();
  }

  // árvore em silhueta com recorte azul do luar (lua à esquerda)
  function arvoreNoite(ctx, cam, X, Z, alt, tipo, sem, n) {
    const base = cam.p(X, 0, Z); if (base.dz < alt * 0.3) return;
    const s = base.s, k = alt * s, tom = (c) => cam.tom(c, Z), r = rng(Math.floor(sem) + 1);
    if (base.x < -k || base.x > ctx.canvas.width + k) return;
    const borda = `rgba(150,180,255,${0.55 * n * (1 - cam.fator(Z))})`;
    ctx.fillStyle = tom(M('#3E2A20', '#0E1418', n)); ctx.beginPath(); ctx.moveTo(base.x - 0.05 * k, base.y); ctx.lineTo(base.x - 0.03 * k, base.y - 0.5 * k); ctx.lineTo(base.x + 0.03 * k, base.y - 0.5 * k); ctx.lineTo(base.x + 0.05 * k, base.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = borda; ctx.fillRect(base.x - 0.05 * k, base.y - 0.5 * k, 0.015 * k, 0.5 * k);
    if (tipo === 'pinheiro') {
      for (let i = 0; i < 4; i++) {
        const y0 = base.y - (0.25 + i * 0.18) * k, w = (0.32 - i * 0.06) * k, h = 0.34 * k;
        ctx.fillStyle = tom(M('#24452C', '#0B1A1C', n)); ctx.beginPath(); ctx.moveTo(base.x, y0 - h); ctx.lineTo(base.x + w, y0); ctx.lineTo(base.x - w, y0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = borda; ctx.beginPath(); ctx.moveTo(base.x, y0 - h); ctx.lineTo(base.x - w, y0); ctx.lineTo(base.x - w * 0.75, y0); ctx.lineTo(base.x - 0.01 * k, y0 - h * 0.85); ctx.closePath(); ctx.fill();
      }
      return;
    }
    const cachos = [];
    for (let i = 0; i < 13; i++) { const a = r() * Math.PI * 2, d = r() * 0.26; cachos.push([Math.cos(a) * d * 1.2, 0.72 + Math.sin(a) * d * 0.8, 0.16 + r() * 0.12]); }
    cachos.sort((a, b) => a[1] - b[1]);
    // galhos
    ctx.strokeStyle = tom(M('#3E2A20', '#0E1418', n)); ctx.lineWidth = Math.max(1, 0.025 * k); ctx.lineCap = 'round';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(base.x, base.y - 0.42 * k); ctx.quadraticCurveTo(base.x + sd * 0.1 * k, base.y - 0.52 * k, base.x + sd * 0.2 * k, base.y - 0.62 * k); ctx.stroke(); }
    const folhas = (dx, dy, rr, cor, dd = 0) => { ctx.fillStyle = cor; ctx.beginPath(); const cx = base.x + dx * k, cy = base.y - dy * k, R = rr * k; ctx.moveTo(cx + R, cy); for (let a = 0; a <= 12; a++) { const ang = (a / 12) * Math.PI * 2, rb = R * (a % 2 ? 1.0 : 0.9) + dd; ctx.lineTo(cx + Math.cos(ang) * rb, cy + Math.sin(ang) * rb); } ctx.closePath(); ctx.fill(); for (let a = 0; a < 7; a++) { const ang = Math.PI * (1.05 + a * 0.13), rb = R * 0.95; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rb, cy + Math.sin(ang) * rb, R * 0.22 + dd * 0.5, 0, Math.PI * 2); ctx.fill(); } };
    for (const [dx, dy, rr] of cachos) folhas(dx - 0.03, dy + 0.03, rr, borda, 0);
    for (const [dx, dy, rr] of cachos) folhas(dx, dy, rr, tom(M('#2E5A2E', '#0C1C20', n)));
    for (const [dx, dy, rr] of cachos) folhas(dx - 0.05, dy + 0.06, rr * 0.5, tom(M('#5E9A42', '#1A3644', n)));
    ctx.fillStyle = tom(M('#0E2414', '#050C10', n)); for (const [dx, dy, rr] of cachos) { ctx.beginPath(); ctx.ellipse(base.x + (dx + 0.03) * k, base.y - (dy - rr * 0.55) * k, rr * 0.7 * k, rr * 0.25 * k, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  function sombraArvore(ctx, cam, X, Z, alt, n) {
    // sombra do luar: vai para a direita e para a frente (lua à esquerda, atrás)
    const L = alt * 1.2, w = alt * 0.22, dx = 0.7, dz = -0.5;
    const pts = [[X - w, 0.004, Z], [X + w, 0.004, Z], [X + dx * L + w * 1.4, 0.004, Z + dz * L], [X + dx * L - w * 1.4, 0.004, Z + dz * L]];
    if (pts.some(([, , z]) => z < cam.z + 0.5)) return;
    ctx.fillStyle = `rgba(5,10,20,${0.3 * n * (1 - cam.fator(Z))})`; ctx.fill(Cena3D.caminho(cam, pts));
  }
  // folhas de grama afinando na ponta, com degradê do pé escuro até a ponta iluminada (tela, em px)
  function laminas(ctx, x, y, h, w, nl, cBase, cPonta, t, fase, seed, vento = 1) {
    if (h < 1.5) return;
    const r = rng(seed), g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, cPonta); g.addColorStop(0.5, mistura(cPonta, cBase, 0.55)); g.addColorStop(0.85, cBase); g.addColorStop(1, cBase);
    ctx.fillStyle = g;
    for (let i = 0; i < nl; i++) {
      const bx = x + (r() - 0.5) * w, hh = h * (0.5 + 0.5 * r()), bal = Math.sin(t * 1.5 + fase + i * 0.7) * h * 0.06 * vento, lean = (r() - 0.5) * h * 0.55 + bal, bw = Math.max(0.8, h * 0.035 * (0.7 + 0.6 * r()));
      ctx.beginPath(); ctx.moveTo(bx - bw, y); ctx.quadraticCurveTo(bx - bw * 0.4 + lean * 0.25, y - hh * 0.6, bx + lean, y - hh); ctx.quadraticCurveTo(bx + bw * 0.4 + lean * 0.25, y - hh * 0.6, bx + bw, y); ctx.closePath(); ctx.fill();
    }
  }
  function tufo(ctx, cam, X, Z, h, fase, t, n) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.4 || q.x < -200 || q.x > 1280) return;
    const s = q.s, hp = h * s, nl = hp > 60 ? 11 : hp > 20 ? 8 : hp > 6 ? 5 : 3;
    laminas(ctx, q.x, q.y + 0.04 * s, hp, 0.32 * s, nl, cam.tom(M('#3E6E28', '#15302A', n), Z), cam.tom(M('#8CC452', '#6C93C8', n), Z), t, fase, Math.floor(fase * 1000) + 1);
  }
  // grama baixa cobrindo o chão (textura)
  function gramaBaixa(ctx, cam, n) {
    const escura = M('#2E5E22', '#10261F', n), clara = M('#76A844', '#3A5A6E', n);
    ctx.lineCap = 'round';
    for (const [X, Z, k] of OBJ.grama) {
      const q = cam.p(X, 0, Z); if (q.dz < 0.5 || q.x < -20 || q.x > 1100 || q.y > 1940) continue;
      const h = 0.1 * q.s, cor = cam.tom(k < 0.5 ? escura : clara, Z);
      ctx.strokeStyle = cor; ctx.lineWidth = Math.max(0.8, 0.012 * q.s);
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - h * 0.3, q.y - h); ctx.moveTo(q.x + h * 0.25, q.y); ctx.lineTo(q.x + h * 0.4, q.y - h * 0.8); ctx.stroke();
    }
  }
  // faixas de floresta no fundo (silhuetas com borda de luar), entre o campo e as montanhas
  function mata(ctx, cam, n, zFaixa) {
    const corTopo = `rgba(130,160,240,${0.22 * n})`;
    for (const [X, Z, h, tipo, zf] of OBJ.mata) {
      if (zf !== zFaixa) continue;
      const q = cam.p(X, 0, Z); if (q.dz < 5 || q.x < -300 || q.x > 1400) continue;
      const k = h * q.s, cor = mistura(cam.tom(M(zf > 80 ? '#3A5A44' : '#2A4A36', zf > 80 ? '#121E36' : '#0C1828', n), Z), M('#3A5A44', '#0A1424', n), 0.45);
      ctx.fillStyle = cor;
      if (tipo === 'p') { ctx.beginPath(); ctx.moveTo(q.x, q.y - k); ctx.lineTo(q.x + k * 0.3, q.y); ctx.lineTo(q.x - k * 0.3, q.y); ctx.closePath(); ctx.fill(); ctx.fillStyle = corTopo; ctx.beginPath(); ctx.moveTo(q.x, q.y - k); ctx.lineTo(q.x - k * 0.3, q.y); ctx.lineTo(q.x - k * 0.24, q.y); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(q.x, q.y - k * 0.55, k * 0.38, 0, Math.PI * 2); ctx.arc(q.x - k * 0.25, q.y - k * 0.35, k * 0.3, 0, Math.PI * 2); ctx.arc(q.x + k * 0.25, q.y - k * 0.32, k * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(q.x - k * 0.5, q.y - k * 0.3, k, k * 0.3); ctx.strokeStyle = corTopo; ctx.lineWidth = Math.max(1, k * 0.04); ctx.beginPath(); ctx.arc(q.x, q.y - k * 0.55, k * 0.38, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke(); }
    }
  }
  // flor da lua: pétalas claras que brilham de leve no escuro
  function florLua(ctx, cam, X, Z, fase, t, n) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.5 || q.x < -100 || q.x > 1180) return;
    const s = q.s, y = q.y - 0.14 * s, x = q.x + Math.sin(t * 1.4 + fase) * 0.02 * s, br = suave(0.5, 1, n);
    ctx.strokeStyle = cam.tom(M('#3E7A2C', '#1E3A34', n), Z); ctx.lineWidth = Math.max(1, 0.012 * s); ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(x, y); ctx.stroke();
    if (br > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 0.12 * s); g.addColorStop(0, `rgba(170,220,255,${0.45 * br})`); g.addColorStop(1, 'rgba(170,220,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 0.12 * s, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = cam.tom(M('#F4F0FF', '#CFE6FF', n), Z);
    for (let i = 0; i < 5; i++) { const a = i * 1.2566 + fase; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 0.025 * s, y + Math.sin(a) * 0.025 * s, 0.022 * s, 0.014 * s, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#9FE6FF'; ctx.beginPath(); ctx.arc(x, y, 0.012 * s, 0, Math.PI * 2); ctx.fill();
  }
  function pedra(ctx, cam, X, Z, r, n) {
    const q = cam.p(X, 0, Z); if (q.dz < 0.6) return;
    const s = q.s;
    ctx.fillStyle = cam.tom(M('#7E7A8E', '#252C44', n), Z); ctx.beginPath(); ctx.ellipse(q.x, q.y - r * 0.4 * s, r * s, r * 0.55 * s, 0, Math.PI, 0); ctx.lineTo(q.x + r * s, q.y); ctx.lineTo(q.x - r * s, q.y); ctx.fill();
    ctx.fillStyle = cam.tom(M('#A6A2B6', '#5A6C9C', n), Z); ctx.beginPath(); ctx.ellipse(q.x - r * 0.35 * s, q.y - r * 0.62 * s, r * 0.45 * s, r * 0.18 * s, -0.2, 0, Math.PI * 2); ctx.fill();
  }
  // vaga-lume em 3D (brilho amarelo-esverdeado piscando)
  function vagalume(ctx, cam, X, Y, Z, fase, k, t, a) {
    const x = X + Math.sin(t * 0.6 * k + fase) * 0.6, y = Y + Math.sin(t * 0.9 * k + fase * 2) * 0.25, z = Z + Math.cos(t * 0.5 * k + fase) * 0.5;
    const q = cam.p(x, y, z); if (q.dz < 0.4) return;
    const pisca = Math.max(0, Math.sin(t * 2.2 * k + fase * 3)), r = Math.max(2, 0.05 * q.s), al = a * (0.25 + 0.75 * pisca) * (1 - cam.fator(z) * 0.6);
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 5); g.addColorStop(0, `rgba(230,255,150,${al})`); g.addColorStop(0.25, `rgba(190,255,110,${al * 0.45})`); g.addColorStop(1, 'rgba(160,255,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r * 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,220,${al})`; ctx.beginPath(); ctx.arc(q.x, q.y, r * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  // neblina baixa: faixas largas e macias que andam devagar rente ao chão
  function neblina(ctx, cam, n, t, perto) {
    const r = rng(perto ? 31 : 17), a = 0.08 + 0.1 * suave(0.3, 1, n);
    const cor = n > 0.5 ? '150,170,230' : '240,190,170';
    for (let i = 0; i < 16; i++) {
      const z = perto ? 2 + r() * 8 : 9 + r() * 40, x = ((r() * 60 - 30 + t * (0.25 + r() * 0.3)) % 60 + 60) % 60 - 30, q = cam.p(x, 0.25, z);
      if (q.dz < 1) continue;
      const w = (6 + r() * 8) * q.s, h = (0.6 + r() * 0.5) * q.s;
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, w); g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(1, `rgba(${cor},0)`);
      ctx.save(); ctx.translate(q.x, q.y); ctx.scale(1, h / w); ctx.translate(-q.x, -q.y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, w, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  window.Cenarios3D.valdorNoite = {
    nevoa: (n = 1) => M('#C9A0A0', '#26315E', n),
    lua,
    desenhar(ctx, cam, o = {}) {
      const t = o.t || 0, n = o.noite === undefined ? 1 : o.noite;
      cam.distNevoa = o.distNevoa || 55;
      ceu(ctx, cam, t, n);
      montanhas(ctx, cam, n, t);
      chao(ctx, cam, n, t);
      for (const [x, z, h] of OBJ.arv) if (z > cam.z + 1) sombraArvore(ctx, cam, x, z, h, n);
      const lista = [];
      lista.push([95, () => mata(ctx, cam, n, 95)], [62, () => mata(ctx, cam, n, 62)]);
      if (o.espadas !== false) for (const [x, z, h, inc] of ESPADAS) lista.push([z, () => espadaGigante(ctx, cam, x, z, h, inc, n, t)]);
      for (const [x, z, h, tipo, sem] of OBJ.arv) lista.push([z, () => arvoreNoite(ctx, cam, x, z, h, tipo, sem, n)]);
      for (const [x, z, r] of OBJ.ped) lista.push([z, () => pedra(ctx, cam, x, z, r, n)]);
      for (const [x, z, h, f] of OBJ.tufo) lista.push([z, () => tufo(ctx, cam, x, z, h, f, t, n)]);
      for (const [x, z, f] of OBJ.flor) lista.push([z, () => florLua(ctx, cam, x, z, f, t, n)]);
      lista.sort((a, b) => b[0] - a[0]);
      for (const [z, fn] of lista) if (z > cam.z + 0.4) fn();
      neblina(ctx, cam, n, t, false);
      const av = suave(0.45, 1, n);
      if (av > 0) for (const [x, y, z, f, k] of OBJ.luz) vagalume(ctx, cam, x, y, z, f, k, t, av);
    },
    // personagem à noite: escurece/azula o corpo e acende um recorte azul do lado da lua
    personagemNoite(ctx, desenhar, o = {}) {
      const n = o.noite === undefined ? 1 : o.noite, W = ctx.canvas.width, H = ctx.canvas.height, d = o.recorte || 4;
      const a = document.createElement('canvas'); a.width = W; a.height = H; const ga = a.getContext('2d'); ga.setTransform(ctx.getTransform()); desenhar(ga);
      ga.setTransform(1, 0, 0, 1, 0, 0);
      // tinta da noite
      ga.globalCompositeOperation = 'source-atop'; ga.fillStyle = `rgba(30,45,110,${0.38 * n})`; ga.fillRect(0, 0, W, H);
      // recorte de luar: silhueta azul menos a silhueta deslocada para longe da lua (lua em cima à esquerda)
      const b = document.createElement('canvas'); b.width = W; b.height = H; const gb = b.getContext('2d');
      gb.drawImage(a, 0, 0); gb.globalCompositeOperation = 'source-in'; gb.fillStyle = 'rgba(120,160,255,1)'; gb.fillRect(0, 0, W, H);
      gb.globalCompositeOperation = 'destination-out'; gb.drawImage(a, d, d * 0.6);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(a, 0, 0); ctx.globalAlpha = 0.6 * n; ctx.globalCompositeOperation = 'screen'; ctx.drawImage(b, 0, 0); ctx.restore();
    },
    // luz da cena: feixes de luar entrando na diagonal, tom azul e vinheta
    luz(ctx, cam, o = {}) {
      const t = o.t || 0, n = o.noite === undefined ? 1 : o.noite, W = ctx.canvas.width, H = ctx.canvas.height, L = lua(cam, n);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
      const af = suave(0.4, 1, n);
      for (let i = 0; i < 6; i++) {
        const x0 = L.x - 120 + i * 110, larg = 60 + i * 30, a = (0.05 - i * 0.005 + 0.012 * Math.sin(t * 0.6 + i * 1.3)) * af;
        const g = ctx.createLinearGradient(x0, L.y, x0 + 700, H); g.addColorStop(0, `rgba(170,195,255,${a})`); g.addColorStop(1, 'rgba(170,195,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, L.y); ctx.lineTo(x0 + larg, L.y); ctx.lineTo(x0 + larg + 760, H); ctx.lineTo(x0 + 760, H); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = n > 0.5 ? `rgba(20,30,80,${0.12 * n})` : `rgba(255,140,90,${0.08 * (1 - n)})`; ctx.fillRect(0, 0, W, H);
      const v = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.28, W * 0.5, H * 0.5, H * 0.78);
      v.addColorStop(0, 'rgba(5,8,25,0)'); v.addColorStop(1, `rgba(5,8,25,${0.45 + 0.2 * n})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    },
    // primeiro plano: grama escura desfocada, neblina perto e vaga-lumes grandes passando perto da câmera
    frente(ctx, cam, o = {}) {
      const t = o.t || 0, n = o.noite === undefined ? 1 : o.noite, W = ctx.canvas.width, H = ctx.canvas.height, forca = o.forca === undefined ? 1 : o.forca;
      neblina(ctx, cam, n, t, true);
      if (forca > 0) {
        const desl = -(cam.yaw || 0) * cam.f * 1.6 - cam.x * 260;
        const base = M('#0A1E0C', '#030A08', n), ponta = M('#7CB24A', '#7E9ED6', n), pontaEsc = M('#3E7A2A', '#2E4870', n);
        // camada nítida: touceiras de grama na borda de baixo, ponta prateada pelo luar
        const rg = rng(44);
        for (let i = 0; i < 30; i++) {
          const x = ((rg() * (W + 300) + desl) % (W + 300) + W + 300) % (W + 300) - 150, h = (160 + rg() * 330) * forca;
          laminas(ctx, x, H + 30, h, 170, 13, base, i % 3 ? pontaEsc : ponta, t, i, 900 + i, 1.4);
        }
        // hastes com sementes (capim alto)
        for (let i = 0; i < 4; i++) {
          const x = ((rg() * W + desl * 0.8) % W + W) % W, h = (380 + rg() * 260) * forca, bal = Math.sin(t * 1.2 + i) * 18;
          ctx.strokeStyle = base; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, H + 10); ctx.quadraticCurveTo(x + bal * 0.5, H - h * 0.5, x + bal, H - h); ctx.stroke();
          ctx.fillStyle = pontaEsc; ctx.beginPath(); ctx.ellipse(x + bal, H - h - 22, 9, 30, bal * 0.01, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(170,200,255,${0.5 * n})`; ctx.beginPath(); ctx.ellipse(x + bal - 4, H - h - 26, 3, 22, bal * 0.01, 0, Math.PI * 2); ctx.fill();
        }
        // camada desfocada bem perto da câmera, nos cantos (moldura)
        Cinema.desfocado(ctx, 14, (g) => {
          const r2 = rng(45);
          for (let i = 0; i < 12; i++) { const lado = i % 2 ? -1 : 1, x = (lado < 0 ? r2() * 260 - 80 : W - r2() * 260 + 80) + desl * 1.3, h = (520 + r2() * 520) * forca; laminas(g, x, H + 60, h, 260, 9, '#020604', M('#2A5A26', '#1A2E48', n), t, i, 300 + i, 1.8); }
          for (const [cx, ang, esc] of [[-40, -0.5, 1], [W + 40, -2.6, 0.9]]) {
            g.save(); g.translate(cx + desl * 0.3, H + 30); g.rotate(ang + Math.sin(t * 0.9 + cx) * 0.03); g.scale(esc * forca, esc * forca);
            for (let f = -2; f <= 2; f++) { g.save(); g.rotate(f * 0.28); g.strokeStyle = M('#1A3E20', '#06120F', n); g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(260, -40, 520, 30); g.stroke(); for (let i = 1; i < 14; i++) { const px = i * 36, py = -Math.sin((i / 14) * Math.PI) * 30 + i * 2, l = 70 * (1 - i / 16); g.fillStyle = i % 2 ? M('#255A2A', '#0B1C1A', n) : M('#1E4E24', '#081614', n); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(px, py + sd * l * 0.5, l * 0.55, 14, sd * 0.9, 0, Math.PI * 2); g.fill(); } } g.restore(); }
            g.restore();
          }
        });
        // vaga-lumes grandes e desfocados bem perto
        const av = suave(0.45, 1, n), r = rng(77);
        if (av > 0) Cinema.desfocado(ctx, 6, (g) => { for (let i = 0; i < 5; i++) { const x = r() * W + Math.sin(t * 0.7 + i) * 60, y = H * (0.45 + r() * 0.5) + Math.cos(t * 0.5 + i) * 40, R = 12 + r() * 16, p = Math.max(0, Math.sin(t * 2 + i * 2)); const gr = g.createRadialGradient(x, y, 0, x, y, R * 3); gr.addColorStop(0, `rgba(230,255,150,${av * (0.3 + 0.7 * p)})`); gr.addColorStop(1, 'rgba(180,255,100,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 3, 0, Math.PI * 2); g.fill(); } }, 'screen');
      }
      this.luz(ctx, cam, o);
    },
  };
})();

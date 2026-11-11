// Texturas geradas por código (prompt 6): asfalto, calçada, madeira, parede, tijolo, grama, pedra, terra, céu.
// Desenhadas uma vez num canvas, com ruído determinístico (mesma imagem sempre). No Node (testes) devolvem null.
import * as THREE from 'three';

const cache = new Map();
const temCanvas = () => typeof document !== 'undefined';

// ruído determinístico
function hash(x, y, s = 0) { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); }
function ruidoSuave(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y, s = 0) => ruidoSuave(x, y, s) * 0.55 + ruidoSuave(x * 2.1, y * 2.1, s + 1) * 0.3 + ruidoSuave(x * 4.3, y * 4.3, s + 2) * 0.15;

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const mistura = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

// pinta pixel a pixel uma função (u, v) → [r, g, b]
function porPixel(ctx, n, f) {
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const c = f(x / n, y / n, x, y), i = (y * n + x) * 4;
    img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function criar(nome, n, desenhar, repetir = [1, 1]) {
  const chave = `${nome}|${repetir.join('x')}`;
  if (cache.has(chave)) return cache.get(chave);
  if (!temCanvas()) return null;
  const c = document.createElement('canvas'); c.width = c.height = n;
  desenhar(c.getContext('2d'), n);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repetir);
  t.anisotropy = 4;
  cache.set(chave, t);
  return t;
}

export const Texturas = {
  // asfalto com faixa central tracejada (a faixa corre no eixo v)
  asfalto: (rep = [1, 6]) => criar('asfalto', 512, (ctx, n) => {
    const base = hexRgb('#55525C'), claro = hexRgb('#6A6670');
    porPixel(ctx, n, (u, v) => mistura(base, claro, fbm(u * 18, v * 18, 3) * 0.9 + hash(u * 999, v * 999) * 0.15));
    ctx.fillStyle = '#E8C76A';
    for (let y = 0; y < n; y += 128) ctx.fillRect(n / 2 - 6, y + 20, 12, 70);
  }, rep),
  // calçada de lajotas claras
  calcada: (rep = [2, 8]) => criar('calcada', 256, (ctx, n) => {
    const a = hexRgb('#D9CDBB'), b = hexRgb('#C8BBA6');
    porPixel(ctx, n, (u, v, x, y) => {
      const junta = (x % 64 < 3) || (y % 64 < 3);
      return junta ? hexRgb('#A99C88') : mistura(a, b, fbm(u * 10, v * 10, 5) * 0.8 + hash(Math.floor(x / 64), Math.floor(y / 64)) * 0.3);
    });
  }, rep),
  // assoalho de tábuas
  madeira: (rep = [3, 3]) => criar('madeira', 512, (ctx, n) => {
    const a = hexRgb('#B7845A'), b = hexRgb('#9C6B45');
    porPixel(ctx, n, (u, v, x, y) => {
      const tab = Math.floor(y / 64), off = hash(tab, 7) * n;
      if (y % 64 < 2 || ((x + off) % n) < 2) return hexRgb('#7A5236');
      const veio = Math.sin((x + off) * 0.05 + fbm(u * 3, tab, 9) * 6) * 0.5 + 0.5;
      return mistura(a, b, veio * 0.55 + hash(tab, 3) * 0.35);
    });
  }, rep),
  // parede pintada (cor) com leve textura
  parede: (cor = '#E9D9C4', rep = [2, 1]) => criar('parede' + cor, 256, (ctx, n) => {
    const a = hexRgb(cor), b = mistura(a, [0, 0, 0], 0.06);
    porPixel(ctx, n, (u, v) => mistura(a, b, fbm(u * 14, v * 14, 11)));
  }, rep),
  tijolo: (rep = [2, 2]) => criar('tijolo', 256, (ctx, n) => {
    const a = hexRgb('#C47A5A'), b = hexRgb('#A85F44');
    porPixel(ctx, n, (u, v, x, y) => {
      const lin = Math.floor(y / 32), xo = x + (lin % 2) * 32;
      if (y % 32 < 3 || xo % 64 < 3) return hexRgb('#D8CBB8');
      return mistura(a, b, hash(Math.floor(xo / 64), lin) * 0.7 + fbm(u * 20, v * 20) * 0.3);
    });
  }, rep),
  grama: (rep = [4, 4]) => criar('grama', 256, (ctx, n) => {
    const a = hexRgb('#7FA65A'), b = hexRgb('#5E8A45');
    porPixel(ctx, n, (u, v) => mistura(a, b, fbm(u * 12, v * 12, 21) * 0.8 + hash(u * 777, v * 777) * 0.25));
  }, rep),
  // rocha cinza com fissuras (pedras, poder da terra)
  pedra: (rep = [1, 1]) => criar('pedra', 256, (ctx, n) => {
    const a = hexRgb('#8A8490'), b = hexRgb('#6E6874');
    porPixel(ctx, n, (u, v) => { const f = fbm(u * 8, v * 8, 31); return mistura(a, b, f + (Math.abs(f - 0.5) < 0.02 ? 0.6 : 0)); });
  }, rep),
  // terra marrom com torrões e rachaduras que brilham (âmbar) — usada no poder da terra
  terra: (brilho = true) => criar('terra' + brilho, 512, (ctx, n) => {
    const a = hexRgb('#8B5E3C'), b = hexRgb('#5A3A22'), c = hexRgb('#B07A4E');
    porPixel(ctx, n, (u, v) => {
      const f = fbm(u * 9, v * 9, 41), g = fbm(u * 26, v * 26, 42);
      return mistura(mistura(a, b, f), c, Math.max(0, g - 0.6) * 1.5);
    });
    if (!brilho) return;
    // rachaduras: linhas quebradas âmbar com miolo claro
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 9; k++) {
      let x = hash(k, 1) * n, y = hash(k, 2) * n, ang = hash(k, 3) * Math.PI * 2;
      const pts = [[x, y]];
      for (let s = 0; s < 7; s++) { ang += (hash(k, s + 10) - 0.5) * 1.4; x += Math.cos(ang) * 40; y += Math.sin(ang) * 40; pts.push([x, y]); }
      for (const [larg, cor] of [[9, 'rgba(255,179,71,0.55)'], [4, '#FFB347'], [1.6, '#FFE2B0']]) {
        ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
      }
    }
  }),
  // só as rachaduras (fundo preto), para usar como brilho (emissiveMap) da esfera de terra
  rachaduras: () => criar('rachaduras', 512, (ctx, n) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, n, n);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 9; k++) {
      let x = hash(k, 1) * n, y = hash(k, 2) * n, ang = hash(k, 3) * Math.PI * 2;
      const pts = [[x, y]];
      for (let s = 0; s < 7; s++) { ang += (hash(k, s + 10) - 0.5) * 1.4; x += Math.cos(ang) * 40; y += Math.sin(ang) * 40; pts.push([x, y]); }
      for (const [larg, cor] of [[9, 'rgba(255,179,71,0.5)'], [4, '#FFB347'], [1.6, '#FFE2B0']]) {
        ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
      }
    }
  }),
  // rachadura no chão (transparente fora das linhas): raios saindo do centro, brilho âmbar
  rachaduraChao: () => criar('rachaduraChao', 512, (ctx, n) => {
    ctx.clearRect(0, 0, n, n); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 7; k++) {
      let x = n / 2, y = n / 2, ang = (k / 7) * Math.PI * 2 + hash(k, 5) * 0.6;
      const pts = [[x, y]];
      for (let s = 0; s < 6; s++) { ang += (hash(k, s + 20) - 0.5) * 0.9; const L = 22 + hash(k, s) * 24; x += Math.cos(ang) * L; y += Math.sin(ang) * L; pts.push([x, y]); }
      for (const [larg, cor] of [[16, 'rgba(255,150,60,0.35)'], [7, '#3A2416'], [3.5, '#FFB347'], [1.4, '#FFE2B0']]) {
        ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
      }
    }
  }),
  // brilho redondo (halo) para somar à cena
  halo: (cor = '255,179,71') => criar('halo' + cor, 128, (ctx, n) => {
    const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, `rgba(${cor},0.9)`); g.addColorStop(0.35, `rgba(${cor},0.35)`); g.addColorStop(1, `rgba(${cor},0)`);
    ctx.clearRect(0, 0, n, n); ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
  }),
  // céu em degradê (fundo da cena), de cima para baixo
  ceu: (topo = '#8EC3E0', meio = '#F3D9B3', base = '#F7C79A') => criar('ceu' + topo + meio + base, 256, (ctx, n) => {
    const g = ctx.createLinearGradient(0, 0, 0, n);
    g.addColorStop(0, topo); g.addColorStop(0.6, meio); g.addColorStop(1, base);
    ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
  }),
};

// Texturas geradas por código (CanvasTexture), determinísticas (gerador com semente).
// Contraste baixo para não brigar com o estilo chapado: a cor vem do material, a textura só dá "pele".
import * as THREE from 'three';

function rng(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const cinza = (v) => { const c = Math.max(0, Math.min(255, Math.round(v))); return `rgb(${c},${c},${c})`; };

function tela(tam, desenhar, semente) {
  const c = document.createElement('canvas'); c.width = c.height = tam;
  const g = c.getContext('2d'); desenhar(g, tam, rng(semente));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}
function ruido(g, tam, r, n, base, amp, tamMax = 3) {
  for (let i = 0; i < n; i++) { g.fillStyle = cinza(base + (r() - 0.5) * amp); const s = 1 + r() * tamMax; g.fillRect(r() * tam, r() * tam, s, s); }
}

export const TEXTURAS = {
  // piso cerâmico: placas com rejunte
  azulejo: (semente = 1, placas = 4) => tela(512, (g, T, r) => {
    const p = T / placas;
    for (let i = 0; i < placas; i++) for (let j = 0; j < placas; j++) { g.fillStyle = cinza(238 + (r() - 0.5) * 10); g.fillRect(i * p, j * p, p, p); }
    ruido(g, T, r, 2500, 236, 14, 2);
    g.fillStyle = cinza(190); for (let i = 0; i <= placas; i++) { g.fillRect(i * p - 2, 0, 4, T); g.fillRect(0, i * p - 2, T, 4); }
  }, semente),
  concreto: (semente = 2) => tela(512, (g, T, r) => {
    g.fillStyle = cinza(232); g.fillRect(0, 0, T, T); ruido(g, T, r, 9000, 230, 26, 3);
    g.strokeStyle = cinza(205); g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { g.beginPath(); let x = r() * T, y = r() * T; g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - 0.5) * 70; y += (r() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
  }, semente),
  pedra: (semente = 3) => tela(512, (g, T, r) => {   // paralelepípedo
    g.fillStyle = cinza(170); g.fillRect(0, 0, T, T);
    const lin = 6, alt = T / lin;
    for (let j = 0; j < lin; j++) { let x = -r() * 60; while (x < T) { const w = 60 + r() * 50; g.fillStyle = cinza(225 + (r() - 0.5) * 30); g.beginPath(); g.roundRect(x + 3, j * alt + 3, w - 6, alt - 6, 10); g.fill(); x += w; } }
    ruido(g, T, r, 3000, 220, 20, 2);
  }, semente),
  madeira: (semente = 4) => tela(512, (g, T, r) => {
    g.fillStyle = cinza(228); g.fillRect(0, 0, T, T);
    for (let y = 0; y < T; y += 2) { const v = 228 + Math.sin(y * 0.09 + Math.sin(y * 0.013) * 4) * 10 + (r() - 0.5) * 6; g.fillStyle = cinza(v); g.fillRect(0, y, T, 2); }
    g.fillStyle = cinza(200); for (let k = 0; k < 4; k++) g.fillRect(0, Math.floor(r() * T), T, 3);
  }, semente),
  grama: (semente = 5) => tela(256, (g, T, r) => { g.fillStyle = cinza(225); g.fillRect(0, 0, T, T); for (let i = 0; i < 3000; i++) { g.fillStyle = cinza(215 + (r() - 0.5) * 50); g.fillRect(r() * T, r() * T, 1, 3 + r() * 4); } }, semente),
  agua: (semente = 6) => tela(256, (g, T, r) => { g.fillStyle = cinza(228); g.fillRect(0, 0, T, T); g.strokeStyle = cinza(250); g.lineWidth = 2; for (let k = 0; k < 40; k++) { const x = r() * T, y = r() * T; g.beginPath(); g.ellipse(x, y, 10 + r() * 20, 2 + r() * 3, 0, 0, Math.PI * 2); g.stroke(); } }, semente),
  metal_ondulado: (semente = 7) => tela(256, (g, T) => { for (let y = 0; y < T; y++) { g.fillStyle = cinza(222 + Math.sin(y * 0.4) * 18); g.fillRect(0, y, T, 1); } }, semente),
  parede: (semente = 8) => tela(512, (g, T, r) => { g.fillStyle = cinza(236); g.fillRect(0, 0, T, T); ruido(g, T, r, 6000, 234, 12, 4); for (let k = 0; k < 6; k++) { g.fillStyle = cinza(214); g.beginPath(); g.ellipse(r() * T, r() * T, 8 + r() * 26, 5 + r() * 14, r() * 3, 0, 7); g.fill(); } }, semente),
  asfalto: (semente = 9) => tela(512, (g, T, r) => { g.fillStyle = cinza(215); g.fillRect(0, 0, T, T); ruido(g, T, r, 14000, 210, 50, 2); }, semente),
};

export function textura(nome, repetir = [1, 1], semente) {
  const f = TEXTURAS[nome];
  if (!f) throw new Error(`Textura "${nome}" não existe. Existentes: ${Object.keys(TEXTURAS).join(', ')}`);
  const t = f(semente); t.repeat.set(...repetir); return t;
}

// Texto em placa (cartaz, letreiro): canvas → textura.
export function texturaTexto(linhas, { largura = 512, altura = 256, fundo = '#fff', cor = '#111', fonte = '800 64px sans-serif', alinhar = 'center' } = {}) {
  const c = document.createElement('canvas'); c.width = largura; c.height = altura;
  const g = c.getContext('2d');
  if (fundo) { g.fillStyle = fundo; g.fillRect(0, 0, largura, altura); }
  g.textAlign = alinhar; g.textBaseline = 'middle';
  const lista = [].concat(linhas);
  lista.forEach((l, i) => {
    const [txt, f, c2] = Array.isArray(l) ? l : [l, fonte, cor];
    g.font = f; g.fillStyle = c2;
    g.fillText(txt, alinhar === 'center' ? largura / 2 : 24, (altura / (lista.length + 1)) * (i + 1));
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

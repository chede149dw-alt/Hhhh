// Poder da terra em 3D (estilo chapado): esfera de terra com rachaduras que brilham, pedras orbitando,
// poeira subindo, halo âmbar e rachadura no chão. Tudo depende só de (t, progresso): determinístico.
//   const fx = criarPoderTerra(); cena.add(fx.grupo);
//   fx.atualizar(t, { prog: 0..1, centro: [x,y,z], raio: 0.16 })
//   const ch = criarRachaduraChao(); cena.add(ch.grupo); ch.atualizar(prog, [x, z], tamanho)
import * as THREE from 'three';
import { materialToon } from '../visual/estilo.js';
import { Texturas } from '../visual/texturas.js';

const frac = (x) => x - Math.floor(x);
const ruido = (i) => frac(Math.sin(i * 91.7 + 13.1) * 43758.5453);
const suave = (k) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };

export function criarPoderTerra() {
  const grupo = new THREE.Group(); grupo.name = 'poder-terra';
  // esfera: terra com rachaduras âmbar que brilham (emissiveMap só com as rachaduras)
  const matEsfera = materialToon('#FFFFFF', { mapa: Texturas.terra(true), gMin: 0.66 });
  if (Texturas.rachaduras()) { matEsfera.emissiveMap = Texturas.rachaduras(); matEsfera.emissive = new THREE.Color('#FFB347'); }
  const esfera = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), matEsfera);
  esfera.castShadow = true; grupo.add(esfera);
  // torrões grudados na esfera (silhueta irregular)
  const torroes = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), materialToon('#FFFFFF', { mapa: Texturas.terra(false), gMin: 0.66 }));
    m.userData = { th: ruido(i) * Math.PI * 2, ph: Math.acos(2 * ruido(i + 20) - 1), s: 0.22 + ruido(i + 40) * 0.18 };
    m.castShadow = true; grupo.add(m); torroes.push(m);
  }
  // pedras orbitando
  const pedras = [];
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), materialToon('#FFFFFF', { mapa: Texturas.pedra(), gMin: 0.66 }));
    m.userData = { a0: (i / 8) * Math.PI * 2, r: 1.55 + ruido(i) * 0.6, v: 0.9 + ruido(i + 3) * 0.8, y: (ruido(i + 7) - 0.5) * 1.2, s: 0.12 + ruido(i + 9) * 0.12 };
    m.castShadow = true; grupo.add(m); pedras.push(m);
  }
  // poeira: pedacinhos subindo e espalhando
  const poeira = [];
  const matPo = materialToon('#B07A4E', { gMin: 0.8 });
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 0), matPo);
    m.userData = { a: ruido(i + 50) * Math.PI * 2, v: 0.6 + ruido(i + 60), fase: ruido(i + 70), s: 0.03 + ruido(i + 80) * 0.05 };
    grupo.add(m); poeira.push(m);
  }
  // halo âmbar (soma luz)
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: Texturas.halo(), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  grupo.add(halo);
  // luz quente que acende em volta (ilumina mãos e rosto)
  const luz = new THREE.PointLight('#FFB347', 0, 1.4, 2);
  grupo.add(luz);

  function atualizar(t, o = {}) {
    const prog = Math.min(1, Math.max(0, o.prog === undefined ? 1 : o.prog));
    const r = (o.raio || 0.16) * suave(prog * 1.4);
    const [cx, cy, cz] = o.centro || [0, 1, 0.4];
    grupo.visible = prog > 0.001;
    esfera.position.set(cx, cy + Math.sin(t * 2.2) * 0.012, cz);
    esfera.scale.setScalar(Math.max(r, 1e-4));
    esfera.rotation.set(t * 0.6, t * 0.9, 0);
    if (matEsfera.emissiveMap) matEsfera.emissiveIntensity = (0.9 + 0.5 * Math.sin(t * 7)) * suave(prog * 2);
    torroes.forEach((m) => {
      const { th, ph, s } = m.userData, a = th + t * 0.9;
      m.position.set(cx + Math.sin(ph) * Math.cos(a) * r * 0.92, esfera.position.y + Math.cos(ph) * r * 0.92, cz + Math.sin(ph) * Math.sin(a) * r * 0.92);
      m.scale.setScalar(Math.max(1e-4, r * s)); m.rotation.set(th, a, ph);
    });
    pedras.forEach((m, i) => {
      const { a0, r: rr, v, y, s } = m.userData, a = a0 + t * v, aparece = suave(prog * 2 - 0.6 - i * 0.05);
      m.position.set(cx + Math.cos(a) * rr * (o.raio || 0.16) * 1.6, cy + y * (o.raio || 0.16) + Math.sin(t * 3 + i) * 0.02, cz + Math.sin(a) * rr * (o.raio || 0.16) * 1.6);
      m.scale.setScalar(Math.max(1e-4, s * (o.raio || 0.16) * aparece * 1.2)); m.rotation.set(t * v * 2, t * v, i);
      m.visible = aparece > 0.01;
    });
    poeira.forEach((m) => {
      const { a, v, fase, s } = m.userData, f = frac(t * 0.6 * v + fase), alc = (o.raio || 0.16) * (1.2 + f * 3.5);
      m.position.set(cx + Math.cos(a) * alc, cy - (o.raio || 0.16) * 1.2 + f * (o.raio || 0.16) * 4, cz + Math.sin(a) * alc);
      m.scale.setScalar(Math.max(1e-4, s * (1 - f) * suave(prog * 2) * (o.raio || 0.16) * 4)); m.rotation.set(t * 3 + a, t * 2, 0);
    });
    const hs = (o.raio || 0.16) * 3.4 * suave(prog * 1.5) * (1 + 0.06 * Math.sin(t * 7));
    halo.position.set(cx, cy, cz); halo.scale.set(hs, hs, 1);
    if (o.camera) halo.quaternion.copy(o.camera.quaternion);
    luz.position.set(cx, cy, cz); luz.intensity = 0.6 * suave(prog * 2) * (0.85 + 0.15 * Math.sin(t * 7));
  }
  return { grupo, atualizar, esfera };
}

export function criarRachaduraChao() {
  const grupo = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: Texturas.rachaduraChao(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.x = -Math.PI / 2; grupo.add(m);
  function atualizar(prog, [x, z] = [0, 0], tamanho = 2.5, y = 0.006) {
    const k = suave(prog);
    grupo.visible = k > 0.001;
    m.position.set(x, y, z); m.scale.set(tamanho * k + 1e-4, tamanho * k + 1e-4, 1);
  }
  return { grupo, atualizar };
}

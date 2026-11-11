// Personagem 3D articulado por código (prompt 3 do PROMPTS_RECRIAR), sem modelo externo.
//
// Esqueleto (cada junta é um grupo que gira em torno do próprio ponto):
//   raiz → quadril → coluna → peito → pescoco → cabeca
//                              peito → ombro_e/d → cotovelo_e/d → mao_e/d
//          quadril → coxa_e/d → joelho_e/d → pe_e/d
// Peças rígidas (cápsulas, cilindros, esferas) se sobrepõem nas juntas. Rosto com peças planas sobre a cabeça.
// O personagem olha para +z; _e = lado esquerdo dele (+x), _d = direito (−x). Medidas em metros, para 1,6 m.
//
// Convenção dos ângulos das poses (graus, ordem XYZ):
//   ombro/coxa x < 0 → braço/perna para a frente · ombro_e z > 0 / ombro_d z < 0 → braço para o lado
//   cotovelo x < 0 → dobra para a frente · joelho x > 0 → dobra para trás · coluna x > 0 → inclina para a frente
//   y > 0 → gira para a esquerda dele (para a direita de quem olha)
import * as THREE from 'three';
import { materialToon } from '../visual/estilo.js';
import { RoundedBoxGeometry } from '../visual/lib/three/addons/RoundedBoxGeometry.js';

export const JUNTAS = ['quadril', 'coluna', 'peito', 'pescoco', 'cabeca',
  'ombro_e', 'cotovelo_e', 'mao_e', 'ombro_d', 'cotovelo_d', 'mao_d',
  'coxa_e', 'joelho_e', 'pe_e', 'coxa_d', 'joelho_d', 'pe_d'];

const G = (g) => (g * Math.PI) / 180;

// mecha de cabelo: gota de altura 1 apontando para +y (base redonda, ponta fina), usada com escala
let _mecha = null;
function mecha() {
  if (_mecha) return _mecha;
  const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.0) * 0.5 + (t > 0.4 ? 0 : 0)), 1) * Math.pow(1 - t, 0.9) * 0.9 + 0.0001, t - 0.3)); }
  _mecha = new THREE.LatheGeometry(pts, 14);
  return _mecha;
}

// ---------------- poses ----------------
export const REPOUSO = {
  juntas: { ombro_e: [0, 0, 5], ombro_d: [0, 0, -5], cotovelo_e: [-6, 0, 0], cotovelo_d: [-6, 0, 0] },
  altura: 0, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'neutro',
};

export const POSES = {
  repouso: REPOUSO,
  acenar: {
    juntas: { ombro_d: [0, 0, -128], cotovelo_d: [0, 0, -42], mao_d: [0, 0, 8], ombro_e: [4, 0, 6], cotovelo_e: [-8, 0, 0],
      peito: [0, -6, 3], cabeca: [0, -10, 6], coxa_e: [0, 0, 3], coxa_d: [0, 0, -3] },
    altura: 0, maos: { e: 'relaxada', d: 'aberta' }, rosto: 'feliz',
  },
  apontar: {
    juntas: { ombro_d: [-84, 0, -14], cotovelo_d: [-4, 0, 0], ombro_e: [8, 0, 7], cotovelo_e: [-10, 0, 0],
      peito: [0, -16, 0], cabeca: [-3, -14, 0], coxa_e: [4, 0, 5], coxa_d: [-8, 0, -4], joelho_d: [6, 0, 0], pe_d: [2, 0, 0] },
    altura: 0, maos: { e: 'relaxada', d: 'apontando' }, rosto: 'determinado',
  },
  sentar: {
    juntas: { coxa_e: [-88, 0, 5], coxa_d: [-88, 0, -5], joelho_e: [88, 0, 0], joelho_d: [88, 0, 0],
      coluna: [6, 0, 0], peito: [4, 0, 0], cabeca: [-4, 8, 0],
      ombro_e: [-34, 0, 10], cotovelo_e: [-36, 0, 0], ombro_d: [-34, 0, -10], cotovelo_d: [-36, 0, 0] },
    altura: -0.33, maos: { e: 'relaxada', d: 'relaxada' }, rosto: 'neutro',
  },
  assustado: {
    juntas: { coluna: [-9, 0, 0], peito: [-6, 0, 0], cabeca: [-6, 0, 0],
      ombro_e: [-58, 0, 30], cotovelo_e: [-72, 0, 0], mao_e: [0, 0, -10], ombro_d: [-58, 0, -30], cotovelo_d: [-72, 0, 0], mao_d: [0, 0, 10],
      coxa_e: [-10, 0, 7], coxa_d: [-10, 0, -7], joelho_e: [18, 0, 0], joelho_d: [18, 0, 0], pe_e: [-8, 0, 0], pe_d: [-8, 0, 0] },
    altura: -0.025, maos: { e: 'aberta', d: 'aberta' }, rosto: 'espanto',
  },
};

// mistura duas poses: ângulos e altura em linha reta; mãos e rosto trocam na metade
export function misturar(a, b, k) {
  const nomes = new Set([...Object.keys(a.juntas || {}), ...Object.keys(b.juntas || {})]);
  const juntas = {};
  for (const n of nomes) {
    const va = (a.juntas || {})[n] || [0, 0, 0], vb = (b.juntas || {})[n] || [0, 0, 0];
    juntas[n] = [0, 1, 2].map((i) => va[i] + (vb[i] - va[i]) * k);
  }
  const ma = a.maos || REPOUSO.maos, mb = b.maos || REPOUSO.maos;
  return {
    juntas,
    altura: (a.altura || 0) + ((b.altura || 0) - (a.altura || 0)) * k,
    maos: k < 0.5 ? { ...ma } : { ...mb },
    rosto: k < 0.5 ? (a.rosto || 'neutro') : (b.rosto || 'neutro'),
  };
}

// ---------------- rosto ----------------
// olhos: escala vertical; sobrancelhas: altura (m) e inclinação (graus, + = ponta de dentro para cima); boca: forma
export const EXPRESSOES = {
  neutro:      { olho: 1.0,  sob: 0,      ang: 0,   boca: 'neutra' },
  feliz:       { olho: 0.7,  sob: 0.004,  ang: 4,   boca: 'sorriso' },
  triste:      { olho: 0.9,  sob: -0.002, ang: 18,  boca: 'triste' },
  espanto:     { olho: 1.18, sob: 0.012,  ang: 4,   boca: 'aberta' },
  medo:        { olho: 1.1,  sob: 0.006,  ang: 20,  boca: 'aberta' },
  determinado: { olho: 0.88, sob: -0.004, ang: -14, boca: 'neutra' },
  raiva:       { olho: 0.8,  sob: -0.006, ang: -24, boca: 'aberta' },
  cansado:     { olho: 0.55, sob: -0.003, ang: 8,   boca: 'neutra' },
};

// mãos: dobra de cada dedo (indicador, médio, anelar, mínimo) em graus, abertura e polegar
const MAOS = {
  relaxada:  { dedos: [22, 28, 34, 40], abre: 0, polegar: 20 },
  aberta:    { dedos: [0, 0, 0, 0], abre: 1, polegar: 35 },
  punho:     { dedos: [115, 115, 115, 115], abre: 0, polegar: 70 },
  apontando: { dedos: [0, 115, 115, 115], abre: 0, polegar: 60 },
};

// ---------------- construção ----------------
export function criarBoneco(ficha) {
  const c = ficha.cores, m = { quadrilAltura: 0.8, cabecaRaio: 0.13, ombroX: 0.185, braco: 0.26, antebraco: 0.22,
    coxa: 0.33, canela: 0.36, troncoLargura: 1.3, troncoProfundidade: 0.78, ...(ficha.medidas || {}) };
  const tem = (p) => !ficha.pecas || ficha.pecas.includes(p);
  const mats = new Map();
  const mat = (cor) => {
    if (!mats.has(cor)) mats.set(cor, materialToon(cor, { volume: true, baixo: 1, borda: 0.05 }));
    return mats.get(cor);
  };
  const chapado = new Map();
  const plano = (cor) => {
    if (!chapado.has(cor)) chapado.set(cor, new THREE.MeshBasicMaterial({ color: cor, side: THREE.DoubleSide }));
    return chapado.get(cor);
  };
  const peca = (geo, cor, pai, pos = [0, 0, 0], rot = [0, 0, 0], esc = [1, 1, 1]) => {
    const me = new THREE.Mesh(geo, mat(cor));
    me.position.set(...pos); me.rotation.set(...rot); me.scale.set(...esc);
    me.castShadow = true; me.receiveShadow = false;
    pai.add(me); return me;
  };
  const capsula = (r, comp) => new THREE.CapsuleGeometry(r, comp, 6, 16);
  const caixa = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 4, r);
  const cilindro = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 20);
  const juntas = {};
  const junta = (nome, pai, pos) => { const g = new THREE.Group(); g.name = nome; g.position.set(...pos); pai.add(g); juntas[nome] = g; return g; };

  const raiz = new THREE.Group(); raiz.name = 'raiz';
  const corpo = new THREE.Group(); raiz.add(corpo);           // corpo: recebe a altura da pose (sentar, agachar)

  // ---- tronco ----
  const quadril = junta('quadril', corpo, [0, m.quadrilAltura, 0]);
  const coluna = junta('coluna', quadril, [0, 0.02, 0]);
  const peito = junta('peito', coluna, [0, 0.2, 0]);
  const L = m.troncoLargura, P = m.troncoProfundidade;
  // bacia (calça)
  peca(capsula(0.082, 0.1), c.calca, quadril, [0, -0.04, 0], [0, 0, Math.PI / 2], [1, 1, 0.95]);
  if (tem('moletom')) {
    // moletom em blocos retos de cantos arredondados (estilo 3D chapado): barriga + barra (na coluna), peito (no peito)
    peca(caixa(0.39, 0.3, 0.235, 0.04), c.moletom, coluna, [0, 0.05, 0]);
    peca(caixa(0.4, 0.05, 0.245, 0.022), c.moletomEscuro, coluna, [0, -0.085, 0]);
    if (tem('bolso_canguru')) {
      peca(caixa(0.22, 0.115, 0.02, 0.01), c.bolso, coluna, [0, 0.0, 0.113]);
      peca(caixa(0.2, 0.012, 0.022, 0.005), c.moletomEscuro, coluna, [0, 0.052, 0.114]);
    }
    peca(caixa(0.41, 0.3, 0.245, 0.05), c.moletom, peito, [0, 0.075, 0]);
    if (tem('capuz_enrolado')) {
      peca(new THREE.TorusGeometry(0.083, 0.043, 12, 28), c.moletom, peito, [0, 0.235, -0.012], [Math.PI / 2 - 0.12, 0, 0], [1.08, 1, 0.85]);
      peca(cilindro(0.05, 0.05, 0.03), c.moletomEscuro, peito, [0, 0.245, -0.008]);
      peca(caixa(0.25, 0.2, 0.05, 0.024), c.bolso, peito, [0, 0.12, -0.125], [0.16, 0, 0]);
    }
    if (tem('cordoes')) for (const s of [1, -1]) {
      peca(new THREE.CylinderGeometry(0.0055, 0.0055, 0.12, 6), c.cordao, peito, [s * 0.034, 0.165, 0.128], [0.1, 0, s * 0.05]);
      peca(new THREE.CylinderGeometry(0.0075, 0.0075, 0.022, 8), c.cordaoPonta, peito, [s * 0.037, 0.1, 0.134], [0.1, 0, s * 0.05]);
    }
  }

  // ---- pescoço e cabeça ----
  const pescoco = junta('pescoco', peito, [0, 0.25, 0]);
  peca(new THREE.CylinderGeometry(0.045, 0.048, 0.1, 14), c.pele, pescoco, [0, 0.02, 0]);
  const cabeca = junta('cabeca', pescoco, [0, 0.04, 0]);
  const R = m.cabecaRaio;
  const cranio = new THREE.Group(); cranio.position.set(0, R, 0.005); cabeca.add(cranio);
  peca(new THREE.SphereGeometry(R, 40, 28), c.pele, cranio);
  for (const s of [1, -1]) peca(new THREE.SphereGeometry(0.028, 12, 10), c.pele, cranio, [s * R * 0.97, -0.012, -0.004], [0, 0, 0], [0.5, 1, 0.8]);
  { const nariz = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), materialToon(c.pele)); nariz.position.set(0, -0.028, R * 0.985); nariz.scale.set(1.1, 0.9, 0.8); cranio.add(nariz); }
  // posiciona uma peça sobre a superfície da cabeça (lat/lon em radianos; lon > 0 = lado esquerdo dele)
  const noRosto = (obj, lat, lon, alt = 0.0025) => {
    const g = new THREE.Group(); g.rotation.set(-lat, lon, 0, 'YXZ');
    obj.position.z = R + alt; g.add(obj); cranio.add(g); return obj;
  };
  const disco = (rx, ry, cor) => { const me = new THREE.Mesh(new THREE.CircleGeometry(1, 28), plano(cor)); me.scale.set(rx, ry, 1); return me; };
  const arco = (rIn, rOut, ini, comp, cor) => new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 24, 1, ini, comp), plano(cor));

  // olhos
  const olhos = [], sobrancelhas = [];
  for (const s of [1, -1]) {
    const olho = new THREE.Group();
    olho.add(disco(0.0145, 0.02, c.iris));
    const pup = disco(0.008, 0.011, c.pupila); pup.position.set(0, -0.002, 0.0004); olho.add(pup);
    const b1 = disco(0.0042, 0.0042, '#FFFFFF'); b1.position.set(0.004, 0.007, 0.0008); olho.add(b1);
    const b2 = disco(0.002, 0.002, '#FFFFFF'); b2.position.set(-0.004, -0.006, 0.0008); olho.add(b2);
    const cilio = arco(0.0135, 0.0205, G(18), G(144), c.cilio); cilio.scale.set(1.05, 1.2, 1); cilio.position.set(0, -0.003, 0.0006);
    olho.add(cilio);
    olhos.push(noRosto(olho, G(-4), s * 0.36, 0.003));
    const sob = new THREE.Group();
    const forma = arco(0.058, 0.077, G(68), G(44), c.sobrancelha); forma.position.y = -0.064; sob.add(forma);
    sob.userData.lado = s;
    sobrancelhas.push(noRosto(sob, G(14), s * 0.37, 0.0035));
  }
  // boca: 4 formas, uma visível por vez
  const boca = {
    neutra: arco(0.05, 0.056, G(256), G(28), c.boca),
    sorriso: arco(0.02, 0.0265, G(205), G(130), c.boca),
    triste: arco(0.022, 0.0285, G(35), G(110), c.boca),
    aberta: (() => { const g = new THREE.Group(); g.add(disco(0.016, 0.019, c.bocaDentro));
      const l = disco(0.01, 0.006, c.lingua); l.position.set(0, -0.01, 0.0004); g.add(l); return g; })(),
  };
  boca.neutra.position.y = 0.05; boca.sorriso.position.y = 0.012; boca.triste.position.y = -0.03;
  const bocaG = new THREE.Group();
  for (const k in boca) bocaG.add(boca[k]);
  noRosto(bocaG, G(-27), 0, 0.003);

  // cabelo (estilo 3D chapado): calota + mechas PLANAS e angulosas, em camadas — franja caída de lado,
  // textura no alto, laterais e nuca baixas (corte curto bagunçado, como na ficha 2D)
  if (tem('cabelo_mechas')) {
    const matCabelo = materialToon(c.cabelo, { volume: true, baixo: 1, borda: 0.05 });
    const matLuz = materialToon(c.cabeloLuz || c.cabelo, { volume: true, baixo: 1, borda: 0.05 });
    // casco do cabelo: superfície única com a borda recortada em pontas (franja na testa, laterais curtas,
    // pontas na nuca) e volume no alto. lon 0 = frente; teta = ângulo a partir do topo da cabeça.
    {
      const NU = 320, NV = 28, dentes = 17, pos = [], idx = [];
      const borda = (lon) => {
        const frente = Math.max(0, Math.cos(lon)), tras = Math.max(0, -Math.cos(lon));
        const base = 88 - 24 * frente + 26 * tras;                      // franja 64°, lados 88°, nuca 114°
        const amp = 7 + 9 * frente + 6 * tras;                          // pontas maiores na franja
        const desl = 0.45 * frente;                                     // franja puxada para a direita dele
        const f = ((lon / (2 * Math.PI)) * dentes + desl + 10) % 1;
        const dente = f < 0.7 ? f / 0.7 : (1 - f) / 0.3;                // dente assimétrico, inclinado (corte desfiado)
        const varia = 0.75 + 0.25 * Math.sin(Math.floor((lon / (2 * Math.PI)) * dentes + desl + 10) * 2.7);  // pontas de tamanhos diferentes
        return G(base - amp * 0.45 + amp * varia * Math.pow(dente, 1.6));
      };
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
        const lon = (i / NU) * Math.PI * 2, t = j / NV;
        const teta = borda(lon) * t;
        const r = R * (1.035 + 0.075 * Math.pow(1 - t, 1.6) * (0.75 + 0.25 * Math.cos(lon + 2.6)));   // volume no alto, mais atrás
        pos.push(r * Math.sin(teta) * Math.sin(lon), r * Math.cos(teta), r * Math.sin(teta) * Math.cos(lon));
      }
      for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
        const a0 = j * (NU + 1) + i, a1 = a0 + 1, b0 = a0 + NU + 1, b1 = b0 + 1;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      const casco = new THREE.Mesh(geo, materialToon(c.cabelo, { volume: true, baixo: 1, borda: 0.05 }));
      casco.material.side = THREE.DoubleSide; casco.castShadow = true; cranio.add(casco);
    }
    const geos = new Map();
    // mecha plana: lâmina de base larga e ponta fina, curvada para acompanhar a cabeça (dobra 1 = colada;
    // menor = a ponta descola um pouco); espessura pequena com chanfro
    const lamina = (L, w, curva, dobra) => {
      const k = `${L}|${w}|${curva}|${dobra}`;
      if (geos.has(k)) return geos.get(k);
      const f = new THREE.Shape();
      f.moveTo(-w / 2, 0);
      f.quadraticCurveTo(-w * 0.5 + curva * L * 0.3, L * 0.6, curva * L, L);
      f.quadraticCurveTo(w * 0.55 + curva * L * 0.4, L * 0.5, w / 2, 0);
      f.lineTo(-w / 2, 0);
      const g = new THREE.ExtrudeGeometry(f, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1, curveSegments: 10, steps: 1 });
      g.translate(0, 0, -0.0025);
      // dobra ao longo do comprimento (eixo y) em volta de um cilindro de raio Rc (normal = +z)
      const Rc = (R * 1.07) / Math.max(dobra, 0.01), pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i), z = pos.getZ(i), th = y / Rc, r = Rc + z;
        pos.setY(i, r * Math.sin(th)); pos.setZ(i, r * Math.cos(th) - Rc);
      }
      g.computeVertexNormals();
      geos.set(k, g); return g;
    };
    const eixoX = new THREE.Vector3(), eixoY = new THREE.Vector3(), eixoZ = new THREE.Vector3(), mb = new THREE.Matrix4();
    // lat/lon em graus (lon > 0 = esquerda dele); fluxo = para onde a mecha corre; ergue = quanto a mecha sai da cabeça
    const mecha = (lat, lon, fluxo, L, w, o = {}) => {
      const n = new THREE.Vector3(Math.cos(G(lat)) * Math.sin(G(lon)), Math.sin(G(lat)), Math.cos(G(lat)) * Math.cos(G(lon)));
      const f = new THREE.Vector3(...fluxo).normalize();
      eixoY.copy(f).addScaledVector(n, -f.dot(n)).normalize();
      eixoZ.copy(n); eixoX.crossVectors(eixoY, eixoZ).normalize();
      mb.makeBasis(eixoX, eixoY, eixoZ);
      const me = new THREE.Mesh(lamina(L, w, o.curva || 0, o.dobra === undefined ? 1 : o.dobra), o.luz ? matLuz : matCabelo);
      me.quaternion.setFromRotationMatrix(mb).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(G(o.ergue || 0), 0, 0)));
      me.position.copy(n).multiplyScalar(R * (o.alt || 1.055));
      me.castShadow = true; cranio.add(me);
    };
    // estilo 3D chapado: lascas planas grandes e pontudas, em camadas, que saem bem da silhueta da cabeça.
    // [lat, lon, fluxo, comprimento, largura, ergue, curva, dobra, tom claro]
    const lascas = [
      // franja: lascas largas caindo na diagonal sobre a testa, puxadas para a direita dele
      [72, -40, [-0.5, -1, 0.6], 0.15, 0.11, 10, -0.16, 0.7, false],
      [75, -10, [-0.55, -1, 0.7], 0.17, 0.12, 12, -0.2, 0.7, true],
      [75, 20, [-0.45, -1, 0.75], 0.16, 0.115, 10, -0.18, 0.7, false],
      [71, 48, [-0.2, -1, 0.6], 0.135, 0.105, 12, -0.12, 0.7, true],
      // coroa: redemoinho de lascas largas, erguidas e abertas para trás e para os lados
      [86, 0, [-0.2, 0.3, -1], 0.17, 0.12, 28, 0.08, 0.45, true],
      [83, 50, [0.6, 0.35, -1], 0.16, 0.12, 30, 0.14, 0.45, false],
      [83, -50, [-0.6, 0.35, -1], 0.16, 0.12, 30, -0.14, 0.45, false],
      [78, 110, [0.35, 0.2, -1], 0.15, 0.115, 20, 0.16, 0.55, true],
      [78, -110, [-0.35, 0.2, -1], 0.15, 0.115, 20, -0.16, 0.55, true],
      [80, 170, [0.1, 0.25, -1], 0.17, 0.12, 24, 0.1, 0.5, false],
      [76, -165, [-0.3, 0.2, -1], 0.15, 0.115, 22, -0.1, 0.5, true],
      // lados: lascas para baixo e um pouco para fora
      [60, 80, [0.1, -1, -0.3], 0.12, 0.1, 10, 0.1, 0.7, false],
      [55, 118, [0.1, -1, -0.5], 0.13, 0.1, 10, 0.08, 0.7, true],
      [60, -80, [-0.1, -1, -0.3], 0.12, 0.1, 10, -0.1, 0.7, true],
      [55, -118, [-0.1, -1, -0.5], 0.13, 0.1, 10, -0.08, 0.7, false],
      // nuca
      [46, 155, [0.15, -1, -0.2], 0.12, 0.1, 12, 0.1, 0.65, false],
      [46, -155, [-0.15, -1, -0.2], 0.12, 0.1, 12, -0.1, 0.65, true],
      [44, 180, [0, -1, -0.15], 0.13, 0.105, 10, 0.05, 0.65, false],
    ];
    if (!tem('franja')) lascas.splice(0, 4);
    for (const [lat, lon, fl, L, w, er, cv, db, luz] of lascas) mecha(lat, lon, fl, L, w, { ergue: er, curva: cv, dobra: db, alt: 1.06, luz });
  }

  // ---- braços ----
  const maos = {};
  for (const [lado, s] of [['e', 1], ['d', -1]]) {
    const ombro = junta('ombro_' + lado, peito, [s * m.ombroX, 0.2, 0]);
    // manga: ombro redondo + tubos retos levemente afunilados + cotovelo + punho
    peca(new THREE.SphereGeometry(0.068, 18, 14), c.moletom, ombro, [0, -0.01, 0]);
    peca(cilindro(0.067, 0.061, m.braco + 0.01), c.moletom, ombro, [0, -m.braco / 2 - 0.005, 0]);
    if (tem('faixa_manga')) peca(new THREE.BoxGeometry(0.014, m.braco, 0.026), c.faixa, ombro, [s * 0.055, -m.braco / 2 - 0.01, 0.03], [0, -s * 0.5, 0]);
    const cotovelo = junta('cotovelo_' + lado, ombro, [0, -m.braco, 0]);
    peca(new THREE.SphereGeometry(0.061, 16, 12), c.moletom, cotovelo);
    peca(cilindro(0.06, 0.054, m.antebraco - 0.02), c.moletom, cotovelo, [0, -m.antebraco / 2 + 0.005, 0]);
    if (tem('faixa_manga')) peca(new THREE.BoxGeometry(0.013, m.antebraco - 0.04, 0.024), c.faixa, cotovelo, [s * 0.05, -m.antebraco / 2 + 0.01, 0.028], [0, -s * 0.5, 0]);
    peca(caixa(0.1, 0.04, 0.1, 0.018), c.moletomEscuro, cotovelo, [0, -m.antebraco + 0.016, 0], [0, 0, 0], [1.05, 1, 1.05]);
    const mao = junta('mao_' + lado, cotovelo, [0, -m.antebraco, 0]);
    // mão simples (luva): palma em bloco + dedos em blocos colados + polegar
    peca(caixa(0.024, 0.062, 0.066, 0.01), c.pele, mao, [0, -0.04, 0]);
    const dedos = [0.0235, 0.0078, -0.0078, -0.0235].map((z, i) => {
      const g = new THREE.Group(); g.position.set(0, -0.068, z); mao.add(g);
      peca(caixa(0.02, 0.04 - (i === 3 ? 0.008 : 0), 0.0165, 0.007), c.pele, g, [0, -0.018, 0]);
      return g;
    });
    const pol = new THREE.Group(); pol.position.set(-s * 0.01, -0.03, 0.033); mao.add(pol);
    peca(caixa(0.018, 0.036, 0.018, 0.007), c.pele, pol, [0, -0.016, 0]);
    mao.scale.setScalar(m.maoEscala || 1.35);
    maos[lado] = { mao, dedos, pol, s };
  }

  // ---- pernas ----
  for (const [lado, s] of [['e', 1], ['d', -1]]) {
    const coxa = junta('coxa_' + lado, quadril, [s * 0.088, -0.04, 0]);
    // calça reta e larga: tubos + joelho + barra dobrada
    peca(cilindro(0.086, 0.077, m.coxa + 0.03), c.calca, coxa, [0, -m.coxa / 2, 0]);
    const joelho = junta('joelho_' + lado, coxa, [0, -m.coxa, 0]);
    peca(new THREE.SphereGeometry(0.077, 16, 12), c.calca, joelho);
    peca(cilindro(0.076, 0.073, m.canela - 0.04), c.calca, joelho, [0, -m.canela / 2 + 0.01, 0]);
    if (tem('barra_embolada')) {
      peca(new THREE.TorusGeometry(0.066, 0.02, 10, 24), c.calca, joelho, [0, -m.canela + 0.055, 0], [Math.PI / 2 + 0.06, 0, 0]);
      peca(cilindro(0.08, 0.08, 0.04), c.calca, joelho, [0, -m.canela + 0.03, 0.002]);
    }
    const pe = junta('pe_' + lado, joelho, [0, -m.canela, 0]);
    if (tem('tenis_cano_alto')) {
      // tênis de cano alto em blocos arredondados: cano, gola, corpo, biqueira e sola
      peca(cilindro(0.052, 0.056, 0.07), c.tenis, pe, [0, -0.01, 0]);
      peca(new THREE.TorusGeometry(0.052, 0.011, 8, 20), c.tenisDetalhe, pe, [0, 0.024, 0], [Math.PI / 2, 0, 0]);
      peca(caixa(0.105, 0.07, 0.2, 0.034), c.tenis, pe, [0, -0.03, 0.035]);
      peca(caixa(0.107, 0.032, 0.062, 0.015), c.tenisDetalhe, pe, [0, -0.044, 0.108]);
      peca(caixa(0.112, 0.024, 0.212, 0.01), c.tenisSola, pe, [0, -0.0605, 0.036]);
    }
  }

  // ---- aplicar pose ----
  const mostrarBoca = (forma) => { for (const k in boca) boca[k].visible = k === forma; };
  function rosto(nome) {
    const e = EXPRESSOES[nome] || EXPRESSOES.neutro;
    for (const o of olhos) o.scale.y = e.olho;
    for (const sb of sobrancelhas) { sb.position.y = e.sob; sb.rotation.z = -sb.userData.lado * G(e.ang); }
    mostrarBoca(e.boca);
  }
  function mao(lado, forma) {
    const f = MAOS[forma] || MAOS.relaxada, h = maos[lado];
    h.dedos.forEach((g, i) => { g.rotation.set(G([-9, -3, 4, 11][i] * f.abre), 0, -h.s * G(f.dedos[i])); });
    h.pol.rotation.set(G(-25 - f.polegar * 0.4), 0, h.s * G(f.polegar * 0.5));
  }
  function posar(pose) {
    const p = pose || REPOUSO;
    for (const n of JUNTAS) {
      const v = (p.juntas && p.juntas[n]) || [0, 0, 0];
      juntas[n].rotation.set(G(v[0]), G(v[1]), G(v[2]));
    }
    corpo.position.y = p.altura || 0;
    const mm = p.maos || REPOUSO.maos;
    mao('e', mm.e); mao('d', mm.d);
    rosto(p.rosto || 'neutro');
    // piscar: 0 = olho aberto, 1 = fechado (somado por cima da expressão)
    if (p.piscar) for (const o of olhos) o.scale.y *= Math.max(0.08, 1 - p.piscar);
  }
  posar(REPOUSO);
  // altura da ficha = do chão ao topo do cabelo, em repouso: mede o boneco montado e ajusta a escala
  raiz.updateMatrixWorld(true);
  const medida = new THREE.Box3().setFromObject(raiz).max.y;
  raiz.scale.setScalar((ficha.altura || 1.6) / medida);
  // medidas usadas pelo IK (em unidades locais do boneco, antes da escala da raiz)
  raiz.updateMatrixWorld(true);
  const pe = juntas.pe_e, caixaPe = new THREE.Box3().setFromObject(pe);
  const sola = (pe.getWorldPosition(new THREE.Vector3()).y - caixaPe.min.y) / raiz.scale.x;
  const base = { quadril: juntas.quadril.position.clone() };
  return { raiz, corpo, juntas, posar, rosto, mao, ficha, sola, base };
}

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
    if (!mats.has(cor)) mats.set(cor, materialToon(cor, { volume: true, baixo: 1, borda: 0.22 }));
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
    // parte de baixo do moletom (na coluna) + barra
    peca(new THREE.CylinderGeometry(0.15, 0.156, 0.27, 28), c.moletom, coluna, [0, 0.055 - 0.0, 0], [0, 0, 0], [L, 1, P]);
    peca(new THREE.CylinderGeometry(0.159, 0.159, 0.035, 28), c.moletomEscuro, coluna, [0, -0.07, 0], [0, 0, 0], [L, 1, P]);
    if (tem('bolso_canguru')) peca(new THREE.BoxGeometry(0.2, 0.1, 0.02), c.bolso, coluna, [0, 0.0, 0.156 * P - 0.004], [-0.04, 0, 0]);
    // peito e ombros (no peito)
    peca(capsula(0.15, 0.1), c.moletom, peito, [0, 0.08, 0], [0, 0, 0], [L + 0.02, 1, P + 0.02]);
    if (tem('capuz_enrolado')) {
      peca(new THREE.TorusGeometry(0.085, 0.04, 12, 28), c.moletom, peito, [0, 0.245, -0.015], [Math.PI / 2 - 0.12, 0, 0], [1.05, 0.92, 1]);
      peca(new THREE.SphereGeometry(0.11, 20, 14), c.bolso, peito, [0, 0.14, -0.108], [0.2, 0, 0], [1, 1.05, 0.3]);
      peca(new THREE.ConeGeometry(0.075, 0.12, 16), c.bolso, peito, [0, 0.03, -0.112], [Math.PI + 0.2, 0, 0], [1, 1, 0.28]);
    }
    if (tem('cordoes')) for (const s of [1, -1]) {
      peca(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), c.cordao, peito, [s * 0.034, 0.17, 0.125], [0.12, 0, s * 0.05]);
      peca(new THREE.CylinderGeometry(0.008, 0.008, 0.022, 8), c.cordaoPonta, peito, [s * 0.037, 0.105, 0.133], [0.12, 0, s * 0.05]);
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

  // cabelo: calota inclinada para trás + cachos + franja
  if (tem('cabelo_cachos')) {
    const matCabelo = materialToon(c.cabelo, { volume: true, baixo: 1, borda: 0.1 });
    const cal = new THREE.Mesh(new THREE.SphereGeometry(R * 1.09, 36, 20, 0, Math.PI * 2, 0, G(95)), matCabelo);
    cal.scale.set(1.04, 0.96, 1.02);
    cal.rotation.x = G(-35); cal.castShadow = true; cranio.add(cal);
    // mechas em cunha (como no 2D): cunhas grossas apontando para fora em volta da cabeça, mais no alto,
    // distribuídas numa espiral determinística, só onde a calota cobre
    const eixo = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(G(-35), 0, 0));
    const n = 72;
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), a = i * 2.39996;
      const d = new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
      if (d.dot(eixo) < Math.cos(G(84))) continue;
      const k = (i * 7) % 5;
      const g = new THREE.Group(); g.position.copy(d).multiplyScalar(R * 1.04);
      // aponta para fora, puxando um pouco para cima (cabelo armado)
      g.lookAt(g.position.clone().add(d.clone().add(new THREE.Vector3(0, 0.12, -0.08)).normalize()));
      const cu = new THREE.Mesh(mecha(), matCabelo);
      const t = 0.07 + k * 0.006;
      cu.rotation.x = Math.PI / 2; cu.rotation.y = ((i * 13) % 7 - 3) * 0.14; cu.position.z = 0.012;
      cu.scale.set(t * 1.0, t, t * 0.8);
      cu.castShadow = true; g.add(cu); cranio.add(g);
    }
    if (tem('franja')) {
      [[-0.42, 0.03, 18], [-0.2, 0.0, 8], [0.03, 0.02, -4], [0.24, 0.0, -10], [0.43, 0.03, -18]].forEach(([lon, dl, tor]) => {
        const g = new THREE.Group(); g.rotation.set(-G(36 + dl * 100), lon, 0, 'YXZ'); cranio.add(g);
        const me = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.075, 10), matCabelo);
        me.position.set(0, -0.012, R * 1.02); me.rotation.set(G(160), 0, G(tor)); me.castShadow = true; g.add(me);
      });
    }
  }

  // ---- braços ----
  const maos = {};
  for (const [lado, s] of [['e', 1], ['d', -1]]) {
    const ombro = junta('ombro_' + lado, peito, [s * m.ombroX, 0.2, 0]);
    peca(capsula(0.062, m.braco - 0.02), c.moletom, ombro, [0, -m.braco / 2 - 0.01, 0]);
    if (tem('faixa_manga')) peca(new THREE.BoxGeometry(0.014, m.braco, 0.026), c.faixa, ombro, [s * 0.05, -m.braco / 2 - 0.01, 0.03], [0, -s * 0.5, 0]);
    const cotovelo = junta('cotovelo_' + lado, ombro, [0, -m.braco, 0]);
    peca(capsula(0.057, m.antebraco - 0.03), c.moletom, cotovelo, [0, -m.antebraco / 2 + 0.005, 0]);
    if (tem('faixa_manga')) peca(new THREE.BoxGeometry(0.013, m.antebraco - 0.03, 0.024), c.faixa, cotovelo, [s * 0.047, -m.antebraco / 2 + 0.005, 0.028], [0, -s * 0.5, 0]);
    peca(new THREE.CylinderGeometry(0.05, 0.048, 0.035, 18), c.moletomEscuro, cotovelo, [0, -m.antebraco + 0.018, 0]);
    const mao = junta('mao_' + lado, cotovelo, [0, -m.antebraco, 0]);
    peca(new THREE.SphereGeometry(0.04, 16, 12), c.pele, mao, [0, -0.04, 0], [0, 0, 0], [0.55, 1, 0.95]);
    const dedos = [0.022, 0.0075, -0.0075, -0.022].map((z, i) => {
      const g = new THREE.Group(); g.position.set(0, -0.07, z); mao.add(g);
      peca(capsula(0.0088, 0.026 - (i === 3 ? 0.006 : 0)), c.pele, g, [0, -0.02, 0]);
      return g;
    });
    const pol = new THREE.Group(); pol.position.set(-s * 0.012, -0.028, 0.03); mao.add(pol);
    peca(capsula(0.01, 0.022), c.pele, pol, [0, -0.018, 0]);
    mao.scale.setScalar(m.maoEscala || 1.35);
    maos[lado] = { mao, dedos, pol, s };
  }

  // ---- pernas ----
  for (const [lado, s] of [['e', 1], ['d', -1]]) {
    const coxa = junta('coxa_' + lado, quadril, [s * 0.088, -0.04, 0]);
    peca(capsula(0.079, m.coxa - 0.02), c.calca, coxa, [0, -m.coxa / 2 - 0.01, 0]);
    const joelho = junta('joelho_' + lado, coxa, [0, -m.coxa, 0]);
    peca(capsula(0.073, m.canela - 0.06), c.calca, joelho, [0, -m.canela / 2 + 0.02, 0]);
    if (tem('barra_embolada')) {
      peca(new THREE.TorusGeometry(0.064, 0.019, 10, 22), c.calca, joelho, [0, -m.canela + 0.06, 0], [Math.PI / 2 + 0.08, 0, 0]);
      peca(new THREE.TorusGeometry(0.062, 0.017, 10, 22), c.calca, joelho, [0, -m.canela + 0.028, 0.004], [Math.PI / 2 - 0.1, 0, 0]);
    }
    const pe = junta('pe_' + lado, joelho, [0, -m.canela, 0]);
    if (tem('tenis_cano_alto')) {
      peca(new THREE.CylinderGeometry(0.05, 0.054, 0.07, 18), c.tenis, pe, [0, -0.012, 0]);
      peca(new THREE.TorusGeometry(0.05, 0.011, 8, 20), c.tenisDetalhe, pe, [0, 0.022, 0], [Math.PI / 2, 0, 0]);
      peca(capsula(0.046, 0.11), c.tenis, pe, [0, -0.03, 0.04], [Math.PI / 2, 0, 0], [1, 1, 0.8]);
      peca(new THREE.SphereGeometry(0.04, 16, 12), c.tenisDetalhe, pe, [0, -0.012, 0.075], [0.45, 0, 0], [1.22, 0.32, 0.5]);
      peca(capsula(0.05, 0.13), c.tenisSola, pe, [0, -0.062, 0.04], [Math.PI / 2, 0, 0], [1.04, 1, 0.22]);
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
  }
  posar(REPOUSO);
  // altura da ficha = do chão ao topo do cabelo, em repouso: mede o boneco montado e ajusta a escala
  raiz.updateMatrixWorld(true);
  const medida = new THREE.Box3().setFromObject(raiz).max.y;
  raiz.scale.setScalar((ficha.altura || 1.6) / medida);
  return { raiz, juntas, posar, rosto, mao, ficha };
}

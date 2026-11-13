// Personagem articulado por código, estilo "blocos": caixas arredondadas, cabelo em blocos facetados,
// olhos escuros sem branco. Hierarquia de grupos (juntas) + peças rígidas sobrepostas.
// O boneco olha para +z; o lado direito dele fica em -x.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { materialChapado } from '../estilo/chapado.js';
import { calcularMedidas } from './medidas.js';
import { TIPOS, REPOUSO, valor } from '../../animacao/poses.js';
import { posicoes, angulos, raiz as raizDaPose } from '../../animacao/esqueleto.js';



export async function carregarFicha(nome) {
  const r = await fetch(`/motor/visual/boneco/fichas/${nome}.json`);
  if (!r.ok) throw new Error(`Ficha "${nome}" não encontrada em motor/visual/boneco/fichas/`);
  return r.json();
}

const _geo = new Map();
function caixa(l, a, p, raio = 0.22) {          // caixa arredondada (raio = fração do menor lado)
  const k = [l, a, p, raio].map((v) => v.toFixed(4)).join();
  if (!_geo.has(k)) _geo.set(k, new RoundedBoxGeometry(l, a, p, 3, Math.min(l, a, p) * raio));
  return _geo.get(k);
}
function bloco(l, a, p) {                        // pedaço facetado (cabelo, barba): icosaedro achatado
  const g = new THREE.IcosahedronGeometry(0.5, 0); g.scale(l, a, p); return g;
}

export function criarBoneco(ficha) {
  const m = calcularMedidas(ficha);
  const POS = posicoes(m);   // posições das juntas: mesma tabela da cinemática pura
  const c = {
    sola: '#e8e8e8', sobrancelha: ficha.cores.cabelo, olhos: '#1d1612', boca: '#7a3f36',
    acessorio: '#222222', camisa2: ficha.cores.camisa, detalhe: ficha.cores.camisa, barba: ficha.cores.cabelo,
    cinto: '#1f1f22', fivela: '#b9bcc2', ...ficha.cores,
  };
  const p = { cabelo: 'curto', camisa: 'manga_curta', calca: 'comprida', calcado: 'tenis', barba: 'nenhuma', acessorios: [], ...ficha.pecas };
  const acess = [].concat(p.acessorios);
  const mats = {};
  const mat = (cor, o = {}) => (mats[cor + JSON.stringify(o)] ??= materialChapado(cor, o));
  const malha = (geo, cor, pai, x = 0, y = 0, z = 0, o = {}) => {
    const obj = new THREE.Mesh(geo, mat(cor, o));
    obj.position.set(x, y, z); obj.castShadow = true; obj.receiveShadow = false; pai.add(obj); return obj;
  };
  const faceta = { flatShading: true };
  const plano = { volume: false };
  const grupo = (nome, pai, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.name = nome; g.position.set(x, y, z);
    g.rotation.order = 'XZY';   // giro (eixo do osso) primeiro, depois abrir, depois frente
    pai.add(g); return g;
  };

  const raiz = new THREE.Group(); raiz.name = ficha.nome;
  const J = {};
  const camisa = c.camisa, corpoCor = p.camisa === 'moletom' ? c.camisa2 : camisa;
  const mangaLonga = !['manga_curta', 'camisa_social'].includes(p.camisa);

  // ---------- Tronco ----------
  J.quadril = grupo('quadril', raiz, ...POS.quadril);
  malha(caixa(m.quadrilL, m.quadrilH * 1.7, m.abdomenP * 0.98, 0.3), c.calca, J.quadril, 0, -m.quadrilH * 0.15, 0);
  if (acess.includes('cinto')) {
    malha(caixa(m.quadrilL * 1.04, m.quadrilH * 0.38, m.abdomenP * 1.03, 0.3), c.cinto, J.quadril, 0, m.quadrilH * 0.55, 0);
    malha(caixa(m.quadrilL * 0.26, m.quadrilH * 0.34, 0.012 * m.H, 0.2), c.fivela, J.quadril, 0, m.quadrilH * 0.55, m.abdomenP * 0.52, plano);
  }
  J.coluna = grupo('coluna', J.quadril, ...POS.coluna);
  malha(caixa(m.abdomenL, m.colunaH * 1.25, m.abdomenP, 0.3), corpoCor, J.coluna, 0, m.colunaH * 0.5, 0);
  J.peito = grupo('peito', J.coluna, ...POS.peito);
  malha(caixa(m.peitoL, m.peitoH, m.peitoP, 0.3), corpoCor, J.peito, 0, m.peitoH * 0.5, 0);
  const frente = m.peitoP / 2;
  if (p.camisa === 'moletom') {
    // cor-bloco: pala escura nos ombros em V, detalhe colorido, gola alta com zíper, barra
    malha(caixa(m.peitoL * 1.01, m.peitoH * 0.42, m.peitoP * 1.01, 0.3), camisa, J.peito, 0, m.peitoH * 0.8, 0);
    for (const s of [-1, 1]) {
      const v = malha(caixa(m.peitoL * 0.6, m.peitoH * 0.2, 0.01 * m.H, 0.2), camisa, J.peito, s * m.peitoL * 0.2, m.peitoH * 0.56, frente + 0.002, plano);
      v.rotation.z = s * 0.42;
    }
    malha(caixa(m.peitoL * 0.12, m.peitoH * 0.1, 0.008 * m.H, 0.2), c.detalhe, J.peito, m.peitoL * 0.3, m.peitoH * 0.56, frente + 0.006, plano);
    malha(caixa(m.abdomenL * 1.02, m.colunaH * 0.2, m.abdomenP * 1.02, 0.3), camisa, J.coluna, 0, m.colunaH * 0.0, 0);
  }
  if (['moletom', 'jaqueta'].includes(p.camisa)) {
    malha(caixa(m.pescocoL * 2.2, m.pescocoH * 1.9, m.pescocoL * 2.0, 0.35), camisa, J.peito, 0, m.peitoH + m.pescocoH * 0.35, 0);
    malha(new THREE.BoxGeometry(0.005 * m.H, m.peitoH * 0.5, 0.004), '#c9c9c9', J.peito, 0, m.peitoH * 0.85, frente + 0.004, plano);
  }
  if (p.camisa === 'jaqueta') malha(new THREE.BoxGeometry(0.005 * m.H, m.peitoH + m.colunaH, 0.004), '#c9c9c9', J.coluna, 0, (m.peitoH + m.colunaH) / 2, m.abdomenP / 2 + 0.004, plano);
  if (p.camisa === 'camisa_social') {
    for (const s of [-1, 1]) {   // colarinho
      const g = malha(caixa(m.pescocoL * 1.1, m.pescocoH * 1.1, 0.012 * m.H, 0.2), camisa, J.peito, s * m.pescocoL * 0.55, m.peitoH * 0.98, frente * 0.75);
      g.rotation.set(-0.35, 0, s * 0.85);
    }
    const nb = 4;
    for (let i = 0; i < nb; i++) malha(new THREE.CylinderGeometry(0.006 * m.H, 0.006 * m.H, 0.004, 10).rotateX(Math.PI / 2), '#d6d6d6', i < 2 ? J.peito : J.coluna, 0, i < 2 ? m.peitoH * (0.75 - i * 0.35) : m.colunaH * (0.95 - (i - 2) * 0.4), (i < 2 ? frente : m.abdomenP / 2) + 0.003, plano);
    malha(caixa(m.peitoL * 0.24, m.peitoH * 0.26, 0.008 * m.H, 0.25), camisa, J.peito, m.peitoL * 0.24, m.peitoH * 0.6, frente + 0.003);
  }
  if (acess.includes('colar')) {
    const colar = malha(new THREE.TorusGeometry(m.pescocoL * 0.8, 0.0035 * m.H, 6, 24), c.acessorio, J.peito, 0, m.peitoH * 0.93, 0.01, plano);
    colar.rotation.x = Math.PI / 2 - 0.55;
  }
  J.pescoco = grupo('pescoco', J.peito, ...POS.pescoco);
  malha(caixa(m.pescocoL, m.pescocoH * 1.8, m.pescocoL * 0.95, 0.4), c.pele, J.pescoco, 0, m.pescocoH * 0.5, 0);

  // ---------- Cabeça ----------
  J.cabeca = grupo('cabeca', J.pescoco, ...POS.cabeca);
  const hl = m.cabecaL, hh = m.cabecaH, hp = m.cabecaP, cy = hh * 0.5, zf = hp / 2;
  malha(caixa(hl, hh, hp, 0.34), c.pele, J.cabeca, 0, cy, 0);
  for (const s of [-1, 1]) malha(caixa(hl * 0.12, hh * 0.22, hp * 0.2, 0.4), c.pele, J.cabeca, s * hl * 0.5, cy - hh * 0.02, -hp * 0.04);

  // Cabelo: blocos facetados
  const cab = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = malha(geo, c.cabelo, J.cabeca, x, y, z, faceta); o.rotation.set(rx, ry, rz); return o; };
  const topoCabelo = (alt, folga) => {
    cab(caixa(hl * (1.04 + folga), hh * alt, hp * (1.06 + folga), 0.3), 0, hh * (1.0 - alt / 2) + hh * 0.04, -hp * 0.02);
    cab(caixa(hl * (1.04 + folga), hh * 0.55, hp * 0.24, 0.3), 0, hh * 0.68, -hp * 0.42);   // nuca
    for (const s of [-1, 1]) cab(caixa(hl * 0.1, hh * 0.32, hp * 0.6, 0.3), s * hl * 0.51, hh * 0.72, -hp * 0.12); // costeletas
  };
  if (p.cabelo === 'curto') {
    topoCabelo(0.3, 0.04);
    cab(bloco(hl * 0.55, hh * 0.24, hp * 0.38), -hl * 0.2, hh * 0.92, hp * 0.32, 0.2, 0, 0.25);    // franja em blocos
    cab(bloco(hl * 0.6, hh * 0.26, hp * 0.4), hl * 0.18, hh * 0.95, hp * 0.3, 0.15, 0, -0.18);
  }
  if (p.cabelo === 'raspado') topoCabelo(0.16, 0.01);
  if (p.cabelo === 'coque') { topoCabelo(0.26, 0.03); cab(bloco(hl * 0.42, hh * 0.38, hp * 0.4), 0, hh * 1.0, -hp * 0.5); }
  if (p.cabelo === 'volumoso') {
    topoCabelo(0.26, 0.04);
    const pos = [[-0.3, 1.02, 0.28], [0.05, 1.12, 0.32], [0.32, 1.03, 0.22], [-0.25, 1.1, -0.12], [0.25, 1.1, -0.18], [0, 1.05, -0.45], [-0.5, 0.85, -0.1], [0.5, 0.85, -0.1]];
    for (const [x, y, z] of pos) cab(bloco(hl * 0.7, hh * 0.42, hp * 0.62), x * hl, y * hh, z * hp, 0.3 * x, 0.6 * z, 0.4 * x);
  }
  if (p.cabelo === 'longo') {
    topoCabelo(0.28, 0.05);
    cab(bloco(hl * 0.8, hh * 0.22, hp * 0.36), -hl * 0.14, hh * 0.86, hp * 0.4, 0.2, 0, 0.32);    // franja de lado
    cab(bloco(hl * 0.45, hh * 0.2, hp * 0.34), hl * 0.3, hh * 0.9, hp * 0.38, 0.2, 0, -0.2);
    cab(caixa(hl * 1.1, hh * 1.35, hp * 0.3, 0.3), 0, hh * 0.25, -hp * 0.46);                      // costas
    for (const s of [-1, 1]) cab(caixa(hl * 0.18, hh * 1.05, hp * 0.75, 0.3), s * hl * 0.55, hh * 0.38, -hp * 0.08);
  }
  if (acess.includes('bone')) {
    const cor = c.acessorio;
    malha(caixa(hl * 1.1, hh * 0.3, hp * 1.1, 0.4), cor, J.cabeca, 0, hh * 0.9, -hp * 0.02);
    const aba = malha(caixa(hl * 0.9, hh * 0.05, hp * 0.5, 0.3), cor, J.cabeca, 0, hh * 0.78, zf + hp * 0.18);
    aba.rotation.x = 0.12;
  }

  // Rosto: peças planas na face frontal
  const rosto = new THREE.Group(); rosto.position.set(0, cy, zf + 0.0015); J.cabeca.add(rosto);
  const peca = (geo, cor, x, y, z = 0) => { const o = new THREE.Mesh(geo, mat(cor, plano)); o.position.set(x, y, z); rosto.add(o); return o; };
  const olhos = [], brilhos = [], sobr = [];
  for (const s of [-1, 1]) {
    const olho = new THREE.Group(); olho.position.set(s * hl * 0.2, hh * 0.04, 0); rosto.add(olho);
    const o = new THREE.Mesh(new THREE.CircleGeometry(hl * 0.068, 20), mat(c.olhos, plano)); o.scale.set(0.8, 1.1, 1); olho.add(o);
    const b = new THREE.Mesh(new THREE.CircleGeometry(hl * 0.016, 10), new THREE.MeshBasicMaterial({ color: '#f5f2ea' }));
    b.position.set(hl * 0.017, hl * 0.028, 0.001); olho.add(b);
    if (acess.includes('cilios')) {
      const ci = new THREE.Mesh(new THREE.PlaneGeometry(hl * 0.06, hl * 0.018), mat(c.olhos, plano));
      ci.position.set(s * hl * 0.05, hl * 0.07, 0.0005); ci.rotation.z = s * 0.5; olho.add(ci);
    }
    olhos.push(olho); brilhos.push(b);
    const sb = new THREE.Group(); sb.position.set(s * hl * 0.21, hh * 0.18, 0.004); sb.userData.lado = s; rosto.add(sb);
    sb.add(new THREE.Mesh(caixa(hl * 0.2, hh * 0.045, hl * 0.04, 0.3), mat(c.sobrancelha, plano)));
    sobr.push(sb);
  }
  malha(caixa(hl * 0.14, hh * 0.15, hl * 0.12, 0.35), c.pele, rosto, 0, -hh * 0.07, hl * 0.035);          // nariz
  const bocaG = new THREE.Group(); bocaG.position.set(0, -hh * 0.25, 0); rosto.add(bocaG);
  const bocas = {
    neutra: new THREE.Mesh(new THREE.PlaneGeometry(hl * 0.22, hh * 0.028), mat(c.boca, plano)),
    sorriso: new THREE.Mesh(new THREE.RingGeometry(hl * 0.11, hl * 0.135, 20, 1, Math.PI + 0.5, Math.PI - 1.0), mat(c.boca, plano)),
    triste: new THREE.Mesh(new THREE.RingGeometry(hl * 0.11, hl * 0.135, 20, 1, 0.55, Math.PI - 1.1), mat(c.boca, plano)),
    aberta: new THREE.Mesh(new THREE.CircleGeometry(hl * 0.075, 20), mat('#2e1010', plano)),
  };
  bocas.sorriso.position.y = hl * 0.1; bocas.triste.position.y = -hl * 0.14; bocas.aberta.scale.set(1.1, 0.85, 1);
  for (const b of Object.values(bocas)) bocaG.add(b);
  // Barba e bigode (blocos facetados)
  const barba = (geo, x, y, z, rz = 0) => { const o = malha(geo, c.barba, rosto, x, y, z, faceta); o.rotation.z = rz; return o; };
  if (['bigode', 'cheia'].includes(p.barba)) {
    barba(caixa(hl * 0.36, hh * 0.07, hl * 0.06, 0.3), 0, -hh * 0.17, hl * 0.02);
    for (const s of [-1, 1]) barba(caixa(hl * 0.07, hh * 0.12, hl * 0.06, 0.3), s * hl * 0.17, -hh * 0.21, hl * 0.02, s * 0.15);
  }
  if (p.barba === 'cavanhaque') barba(bloco(hl * 0.25, hh * 0.18, hl * 0.12), 0, -hh * 0.38, hl * 0.02);
  if (p.barba === 'cheia') {
    barba(bloco(hl * 0.7, hh * 0.42, hp * 0.5), 0, -hh * 0.4, -hp * 0.12);
    for (const s of [-1, 1]) barba(bloco(hl * 0.22, hh * 0.45, hp * 0.6), s * hl * 0.42, -hh * 0.17, -hp * 0.3);
  }
  if (acess.includes('oculos')) {
    for (const s of [-1, 1]) peca(new THREE.TorusGeometry(hl * 0.085, hl * 0.012, 6, 16), c.acessorio, s * hl * 0.2, hh * 0.04, hl * 0.03);
    peca(new THREE.BoxGeometry(hl * 0.12, hl * 0.018, hl * 0.018), c.acessorio, 0, hh * 0.06, hl * 0.03);
  }

  // ---------- Braços ----------
  const ombreira = m.bracoL * 1.18;
  for (const [lado, s] of [['D', -1], ['E', 1]]) {
    const om = J['ombro' + lado] = grupo('ombro' + lado, J.peito, ...POS['ombro' + lado]);
    malha(caixa(ombreira, ombreira, ombreira, 0.45), camisa, om, -s * m.bracoL * 0.1, 0, 0);
    const curta = !mangaLonga;
    malha(caixa(m.bracoL * (curta ? 1.12 : 1), m.bracoLen * (curta ? 0.72 : 1.08), m.bracoL * (curta ? 1.12 : 1), 0.4), camisa, om, 0, -m.bracoLen * (curta ? 0.32 : 0.5), 0);
    if (curta) malha(caixa(m.bracoL * 0.86, m.bracoLen * 0.7, m.bracoL * 0.86, 0.4), c.pele, om, 0, -m.bracoLen * 0.7, 0);
    const co = J['cotovelo' + lado] = grupo('cotovelo' + lado, om, ...POS['cotovelo' + lado]);
    malha(caixa(m.anteL, m.anteLen * 1.12, m.anteL, 0.42), mangaLonga ? camisa : c.pele, co, 0, -m.anteLen * 0.5, 0);
    if (mangaLonga) malha(caixa(m.anteL * 1.12, m.anteLen * 0.16, m.anteL * 1.12, 0.35), p.camisa === 'moletom' ? camisa : camisa, co, 0, -m.anteLen * 0.9, 0);
    if (acess.includes('relogio') && lado === 'E') malha(caixa(m.anteL * 1.12, m.anteLen * 0.1, m.anteL * 1.12, 0.3), c.acessorio, co, 0, -m.anteLen * 0.86, 0);
    const mao = J['mao' + lado] = grupo('mao' + lado, co, ...POS['mao' + lado]);
    const ml = m.maoLen, pt = m.anteL * 0.62, pw = m.anteL * 1.15;
    malha(caixa(pt, ml * 0.52, pw, 0.35), c.pele, mao, 0, -ml * 0.26, 0);
    const pol = malha(caixa(pt * 0.6, ml * 0.32, pt * 0.6, 0.4), c.pele, mao, -s * pt * 0.25, -ml * 0.22, pw * 0.5); pol.rotation.x = 0.45;
    const dedos = grupo('dedos' + lado, mao, 0, -ml * 0.5, -pw * 0.1);
    malha(caixa(pt * 0.9, ml * 0.45, pw * 0.74, 0.35), c.pele, dedos, 0, -ml * 0.2, -pw * 0.02);
    const indic = grupo('indicador' + lado, mao, 0, -ml * 0.5, pw * 0.35);
    malha(caixa(pt * 0.62, ml * 0.42, pt * 0.62, 0.45), c.pele, indic, 0, -ml * 0.2, 0);
    J['dedos' + lado] = dedos; J['indicador' + lado] = indic;
  }

  // ---------- Pernas ----------
  const bermuda = p.calca === 'bermuda';
  for (const [lado, s] of [['D', -1], ['E', 1]]) {
    const cx = J['coxa' + lado] = grupo('coxa' + lado, J.quadril, ...POS['coxa' + lado]);
    malha(caixa(m.coxaL, m.coxaLen * 1.12, m.coxaL * 1.05, 0.4), c.calca, cx, 0, -m.coxaLen * 0.5, 0);
    const jo = J['joelho' + lado] = grupo('joelho' + lado, cx, ...POS['joelho' + lado]);
    malha(caixa(m.canelaL * (bermuda ? 0.85 : 1), m.canelaLen * 1.1, m.canelaL * (bermuda ? 0.85 : 1), 0.4), bermuda ? c.pele : c.calca, jo, 0, -m.canelaLen * 0.5, 0);
    if (bermuda) malha(caixa(m.coxaL * 1.05, m.coxaLen * 0.25, m.coxaL * 1.08, 0.35), c.calca, jo, 0, m.coxaLen * 0.06, 0);
    const pe = J['pe' + lado] = grupo('pe' + lado, jo, ...POS['pe' + lado]);
    const pl = m.peComp, pa = m.peAlt, pw = m.canelaL * 1.15;
    if (p.calcado === 'chinelo') {
      malha(caixa(pw * 0.9, pa * 0.55, pl * 0.95, 0.35), c.pele, pe, 0, -pa * 0.55, pl * 0.3);
      malha(caixa(pw, pa * 0.28, pl * 1.05, 0.3), c.calcado, pe, 0, -pa * 0.88, pl * 0.3);
    } else if (p.calcado === 'coturno') {
      malha(caixa(pw * 1.12, pa * 1.1, pl * 1.05, 0.3), c.calcado, pe, 0, -pa * 0.42, pl * 0.3);
      malha(caixa(pw * 1.14, pa * 0.42, pl * 1.1, 0.25), c.sola, pe, 0, -pa * 0.8, pl * 0.3);
      malha(caixa(m.canelaL * 1.22, m.canelaLen * 0.4, m.canelaL * 1.25, 0.35), c.calcado, jo, 0, -m.canelaLen * 0.8, 0);  // cano
      malha(caixa(m.canelaL * 1.26, m.canelaLen * 0.06, m.canelaL * 1.29, 0.3), c.detalhe, jo, 0, -m.canelaLen * 0.6, 0);
    } else {
      const sap = p.calcado === 'sapato';
      malha(caixa(pw, pa * (sap ? 0.8 : 0.9), pl, 0.3), c.calcado, pe, 0, -pa * 0.5, pl * 0.3);
      malha(caixa(pw * 1.04, pa * 0.25, pl * 1.03, 0.25), sap ? c.calcado : c.sola, pe, 0, -pa * 0.88, pl * 0.3);
    }
  }

  function posar(pose = REPOUSO) {
    for (const nome of Object.keys(TIPOS)) J[nome].rotation.set(...angulos(pose, nome));
    for (const [lado, s] of [['D', -1], ['E', 1]]) {   // dedos dobram em direção à palma
      J['dedos' + lado].rotation.set(0, 0, -s * valor(pose, 'mao' + lado, 'fecha') * Math.PI / 180);
      J['indicador' + lado].rotation.set(0, 0, -s * valor(pose, 'mao' + lado, 'indicador') * Math.PI / 180);
    }
    const rz = raizDaPose(pose);
    raiz.position.set(...rz.pos);
    raiz.rotation.y = valor(pose, 'corpo', 'giro') * Math.PI / 180;
    raiz.scale.set(...rz.esc);
    J.quadril.position.set(POS.quadril[0] + valor(pose, 'desl', 'x'), POS.quadril[1] + valor(pose, 'desl', 'y'), POS.quadril[2] + valor(pose, 'desl', 'z'));
    // Rosto
    const forma = valor(pose, 'rosto', 'boca'), estr = valor(pose, 'rosto', 'estranho');
    for (const [k, b] of Object.entries(bocas)) b.visible = k === forma;
    bocaG.scale.set(1 + estr * 1.1, 1 + estr * 0.5, 1);
    const ab = valor(pose, 'rosto', 'olhos');
    const ox = valor(pose, 'rosto', 'olharX'), oy = valor(pose, 'rosto', 'olharY');
    olhos.forEach((o, i) => {
      const s = i ? 1 : -1;
      o.scale.set(1 + estr * 0.7, Math.max(0.06, ab) * (1 + estr * 0.9), 1);   // infiltrado: olhos maiores...
      o.position.set(s * hl * 0.2 + ox * hl * 0.03, hh * 0.04 + oy * hh * 0.025, 0);
    });
    for (const b of brilhos) b.visible = estr < 0.35 && ab > 0.3;          // ...e sem brilho (olhar morto)
    const sv = valor(pose, 'rosto', 'sobrancelha');
    for (const sb of sobr) { sb.rotation.z = -sb.userData.lado * sv * 0.35; sb.position.y = hh * (0.18 + 0.025 * sv); }
  }

  posar(REPOUSO);
  return { raiz, juntas: J, posar, medidas: m, ficha };
}

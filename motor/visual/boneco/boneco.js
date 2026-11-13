// Personagem articulado por código: hierarquia de grupos (juntas) + peças rígidas sobrepostas.
// O boneco olha para +z; o lado direito dele fica em -x.
import * as THREE from 'three';
import { materialChapado } from '../estilo/chapado.js';
import { calcularMedidas } from './medidas.js';
import { TIPOS, REPOUSO, valor } from '../../animacao/poses.js';

const D = THREE.MathUtils.DEG2RAD;

// Canal anatômico → [eixo, sinal] para o lado DIREITO. O esquerdo espelha y e z.
const EIXOS = {
  tronco: { frente: ['x', 1], lado: ['z', 1], giro: ['y', 1] },
  ombro: { frente: ['x', -1], abre: ['z', -1], giro: ['y', -1] },
  cotovelo: { dobra: ['x', -1] },
  mao: { dobra: ['x', -1], lado: ['z', -1], giro: ['y', -1] },
  coxa: { frente: ['x', -1], abre: ['z', -1], giro: ['y', -1] },
  joelho: { dobra: ['x', 1] },
  pe: { dobra: ['x', -1], lado: ['z', -1] },
};

export async function carregarFicha(nome) {
  const r = await fetch(`/motor/visual/boneco/fichas/${nome}.json`);
  if (!r.ok) throw new Error(`Ficha "${nome}" não encontrada em motor/visual/boneco/fichas/`);
  return r.json();
}

export function criarBoneco(ficha) {
  const m = calcularMedidas(ficha);
  const c = { sola: '#e8e8e8', sobrancelha: ficha.cores.cabelo, olhos: '#2a1a12', boca: '#8a4a40', acessorio: '#222222', ...ficha.cores };
  const p = { cabelo: 'curto', camisa: 'manga_curta', calca: 'comprida', calcado: 'tenis', acessorios: [], ...ficha.pecas };
  const acess = [].concat(p.acessorios);
  const mats = {};
  const mat = (cor, volume = true) => (mats[cor + volume] ??= materialChapado(cor, { volume }));
  const malha = (geo, cor, pai, x = 0, y = 0, z = 0, volume = true) => {
    const o = new THREE.Mesh(geo, mat(cor, volume));
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = false; pai.add(o); return o;
  };
  const grupo = (nome, pai, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.name = nome; g.position.set(x, y, z);
    g.rotation.order = 'XZY';   // giro (eixo do osso) primeiro, depois abrir, depois frente
    pai.add(g); return g;
  };
  const elipse = (rTopo, rBase, h, prof, seg = 20) => {
    const g = new THREE.CylinderGeometry(rTopo, rBase, h, seg); g.scale(1, 1, prof); return g;
  };
  const capsula = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);

  const camisaCor = c.camisa, mangaLonga = p.camisa !== 'manga_curta';
  const raiz = new THREE.Group(); raiz.name = ficha.nome;
  const J = {};

  // Tronco
  J.quadril = grupo('quadril', raiz, 0, m.pernaComp, 0);
  malha(elipse(m.abdomenL / 2, m.quadrilL / 2, m.quadrilH * 1.6, m.abdomenP / m.abdomenL), c.calca, J.quadril, 0, 0.0, 0);
  J.coluna = grupo('coluna', J.quadril, 0, 0.02 * m.H, 0);
  malha(elipse(m.peitoL * 0.46, m.abdomenL / 2, m.colunaH * 1.15, m.abdomenP / m.abdomenL), camisaCor, J.coluna, 0, m.colunaH / 2, 0);
  J.peito = grupo('peito', J.coluna, 0, m.colunaH, 0);
  malha(elipse(m.peitoL / 2, m.peitoL * 0.46, m.peitoH, m.peitoP / m.peitoL), camisaCor, J.peito, 0, m.peitoH / 2, 0);
  // ombros arredondados
  for (const s of [-1, 1]) malha(new THREE.SphereGeometry(m.bracoR * 1.35, 16, 12), camisaCor, J.peito, s * (m.ombros / 2 - m.bracoR * 0.3), m.peitoH - m.bracoR * 1.1, 0);
  if (p.camisa === 'moletom') {  // capuz caído atrás do pescoço
    const capuz = malha(new THREE.TorusGeometry(m.pescocoR * 2.1, m.pescocoR * 0.9, 10, 20), camisaCor, J.peito, 0, m.peitoH * 0.98, -m.pescocoR * 0.9);
    capuz.rotation.x = Math.PI / 2 + 0.35;
  }
  if (p.camisa === 'jaqueta') {  // gola e zíper
    const gola = malha(new THREE.TorusGeometry(m.pescocoR * 1.5, m.pescocoR * 0.55, 8, 20), camisaCor, J.peito, 0, m.peitoH * 0.98, 0);
    gola.rotation.x = Math.PI / 2;
    malha(new THREE.BoxGeometry(0.006 * m.H, m.peitoH + m.colunaH, 0.004), '#d0d0d0', J.coluna, 0, (m.peitoH + m.colunaH) / 2, m.abdomenP / 2 + 0.002, false);
  }
  if (acess.includes('colar')) {
    const colar = malha(new THREE.TorusGeometry(m.pescocoR * 1.35, 0.0035 * m.H, 6, 24), c.acessorio, J.peito, 0, m.peitoH * 0.93, 0.006, false);
    colar.rotation.x = Math.PI / 2 - 0.5;
  }
  J.pescoco = grupo('pescoco', J.peito, 0, m.peitoH, 0);
  malha(new THREE.CylinderGeometry(m.pescocoR, m.pescocoR * 1.1, m.pescocoH * 1.6, 14), c.pele, J.pescoco, 0, m.pescocoH / 2, 0);
  J.cabeca = grupo('cabeca', J.pescoco, 0, m.pescocoH, 0);
  const R = m.cabecaR, cy = R * 0.95;
  const cranio = malha(new THREE.SphereGeometry(R, 40, 28), c.pele, J.cabeca, 0, cy, 0);
  cranio.scale.set(0.94, 1.04, 0.98);
  for (const s of [-1, 1]) malha(new THREE.SphereGeometry(R * 0.2, 12, 10), c.pele, J.cabeca, s * R * 0.92, cy - R * 0.05, -R * 0.05).scale.set(0.5, 1, 0.8); // orelhas

  // Cabelo e boné
  const capa = (r, theta, inclina, cor) => {
    const g = malha(new THREE.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, theta), cor, J.cabeca, 0, cy, 0);
    g.scale.set(0.96, 1.04, 1.0); g.rotation.x = -inclina; return g;
  };
  if (p.cabelo === 'curto') capa(R * 1.06, Math.PI * 0.5, 0.45, c.cabelo);
  if (p.cabelo === 'raspado') capa(R * 1.015, Math.PI * 0.52, 0.5, c.cabelo);
  if (p.cabelo === 'coque') { capa(R * 1.05, Math.PI * 0.5, 0.4, c.cabelo); malha(new THREE.SphereGeometry(R * 0.38, 16, 12), c.cabelo, J.cabeca, 0, cy + R * 0.75, -R * 0.75); }
  if (p.cabelo === 'longo') {
    capa(R * 1.07, Math.PI * 0.52, 0.35, c.cabelo);
    malha(new THREE.BoxGeometry(R * 1.9, R * 2.3, R * 0.5), c.cabelo, J.cabeca, 0, cy - R * 0.85, -R * 0.62);
    for (const s of [-1, 1]) malha(new THREE.BoxGeometry(R * 0.32, R * 1.9, R * 0.75), c.cabelo, J.cabeca, s * R * 0.88, cy - R * 0.55, -R * 0.12);
  }
  if (acess.includes('bone')) {
    capa(R * 1.1, Math.PI * 0.42, 0.15, c.acessorio);
    const aba = malha(new THREE.CylinderGeometry(R * 0.85, R * 0.85, R * 0.07, 24, 1, false, -Math.PI / 2, Math.PI), c.acessorio, J.cabeca, 0, cy + R * 0.4, R * 0.62);
    aba.scale.set(1, 1, 1.35); aba.rotation.x = 0.22;
  }

  // Rosto: peças planas tangentes à esfera (posição por azimute/elevação).
  const rosto = new THREE.Group(); rosto.position.set(0, cy, 0); rosto.scale.set(0.94, 1.04, 0.98); J.cabeca.add(rosto);
  const naEsfera = (obj, az, el, folga = 0.012) => {
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    obj.position.copy(dir).multiplyScalar(R * (1 + folga));
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    rosto.add(obj); return obj;
  };
  const plana = (geo, cor) => { const o = new THREE.Mesh(geo, mat(cor, false)); return o; };
  const olhos = [], pupilas = [], sobr = [];
  for (const s of [-1, 1]) {
    const olho = naEsfera(new THREE.Group(), s * 0.36, 0.06);
    const branco = plana(new THREE.CircleGeometry(R * 0.19, 24), '#f4f1ea'); branco.scale.set(0.82, 1, 1); olho.add(branco);
    const pupila = plana(new THREE.CircleGeometry(R * 0.095, 20), c.olhos); pupila.position.z = 0.0015; olho.add(pupila);
    olhos.push(olho); pupilas.push(pupila);
    const sb = naEsfera(new THREE.Group(), s * 0.36, 0.33, 0.02);
    const b = plana(new THREE.PlaneGeometry(R * 0.36, R * 0.07), c.sobrancelha); sb.add(b);
    sb.userData.lado = s; sobr.push(sb);
  }
  const nariz = malha(new THREE.SphereGeometry(R * 0.11, 14, 10), c.pele, rosto, 0, 0, 0, false);
  nariz.position.set(0, -R * 0.13, R * 1.0); nariz.scale.set(1.0, 0.8, 1.0);
  const bocaG = naEsfera(new THREE.Group(), 0, -0.42);
  const bocas = {
    neutra: plana(new THREE.PlaneGeometry(R * 0.3, R * 0.045), c.boca),
    sorriso: plana(new THREE.RingGeometry(R * 0.17, R * 0.215, 24, 1, Math.PI + 0.45, Math.PI - 0.9), c.boca),
    triste: plana(new THREE.RingGeometry(R * 0.17, R * 0.215, 24, 1, 0.5, Math.PI - 1.0), c.boca),
    aberta: plana(new THREE.CircleGeometry(R * 0.13, 24), '#3a1414'),
  };
  bocas.sorriso.position.y = R * 0.15; bocas.triste.position.y = -R * 0.22; bocas.aberta.scale.set(1, 0.8, 1);
  for (const b of Object.values(bocas)) bocaG.add(b);

  // Braços
  for (const [lado, s] of [['D', -1], ['E', 1]]) {
    const om = J['ombro' + lado] = grupo('ombro' + lado, J.peito, s * m.ombros / 2, m.peitoH - m.bracoR * 1.1, 0);
    malha(capsula(m.bracoR, m.bracoLen), camisaCor, om, 0, -m.bracoLen / 2, 0);
    const co = J['cotovelo' + lado] = grupo('cotovelo' + lado, om, 0, -m.bracoLen, 0);
    malha(capsula(m.anteR, m.anteLen), mangaLonga ? camisaCor : c.pele, co, 0, -m.anteLen / 2, 0);
    if (mangaLonga) malha(new THREE.CylinderGeometry(m.anteR * 1.15, m.anteR * 1.15, m.anteLen * 0.12, 14), camisaCor, co, 0, -m.anteLen * 0.92, 0);
    if (acess.includes('relogio') && lado === 'E') malha(new THREE.CylinderGeometry(m.anteR * 1.12, m.anteR * 1.12, m.anteLen * 0.1, 14), c.acessorio, co, 0, -m.anteLen * 0.85, 0);
    const mao = J['mao' + lado] = grupo('mao' + lado, co, 0, -m.anteLen, 0);
    const ml = m.maoLen, pw = m.anteR * 2.2, pt = m.anteR * 1.05;
    malha(new THREE.BoxGeometry(pt, ml * 0.5, pw), c.pele, mao, 0, -ml * 0.25, 0);       // palma (largura no eixo z: polegar à frente)
    const pol = malha(capsula(pt * 0.32, ml * 0.25), c.pele, mao, -s * pt * 0.25, -ml * 0.2, pw * 0.55); pol.rotation.x = 0.5;
    const dedos = grupo('dedos' + lado, mao, 0, -ml * 0.5, -pw * 0.1);
    malha(new THREE.BoxGeometry(pt * 0.9, ml * 0.42, pw * 0.72), c.pele, dedos, 0, -ml * 0.2, -pw * 0.03);
    const indic = grupo('indicador' + lado, mao, 0, -ml * 0.5, pw * 0.36);
    malha(capsula(pt * 0.3, ml * 0.38), c.pele, indic, 0, -ml * 0.22, 0);
    J['dedos' + lado] = dedos; J['indicador' + lado] = indic;
  }
  // Pernas
  const bermuda = p.calca === 'bermuda';
  for (const [lado, s] of [['D', -1], ['E', 1]]) {
    const cx = J['coxa' + lado] = grupo('coxa' + lado, J.quadril, s * m.pernasDist / 2, -0.01 * m.H, 0);
    malha(capsula(m.coxaR, m.coxaLen), c.calca, cx, 0, -m.coxaLen / 2, 0);
    const jo = J['joelho' + lado] = grupo('joelho' + lado, cx, 0, -m.coxaLen, 0);
    malha(capsula(m.canelaR, m.canelaLen), bermuda ? c.pele : c.calca, jo, 0, -m.canelaLen / 2, 0);
    if (bermuda) malha(new THREE.CylinderGeometry(m.coxaR * 1.08, m.coxaR * 1.0, m.coxaLen * 0.2, 14), c.calca, jo, 0, m.coxaLen * 0.05, 0);
    const pe = J['pe' + lado] = grupo('pe' + lado, jo, 0, -m.canelaLen, 0);
    const pl = m.peComp, pa = m.peAlt;
    if (p.calcado === 'chinelo') {
      malha(new THREE.BoxGeometry(m.canelaR * 2.1, pa * 0.55, pl * 0.95), c.pele, pe, 0, -pa * 0.55, pl * 0.3);
      malha(new THREE.BoxGeometry(m.canelaR * 2.3, pa * 0.3, pl * 1.05), c.calcado, pe, 0, -pa * 0.88, pl * 0.3);
    } else {
      malha(new THREE.BoxGeometry(m.canelaR * 2.3, pa * 0.85, pl), c.calcado, pe, 0, -pa * 0.5, pl * 0.3);
      malha(new THREE.BoxGeometry(m.canelaR * 2.4, pa * 0.25, pl * 1.04), c.sola, pe, 0, -pa * 0.88, pl * 0.3);
    }
  }

  function posar(pose = REPOUSO) {
    for (const [nome, tipo] of Object.entries(TIPOS)) {
      const g = J[nome], esq = nome.endsWith('E') && tipo !== 'tronco';
      g.rotation.set(0, 0, 0);
      for (const [canal, [eixo, sinal]] of Object.entries(EIXOS[tipo])) {
        const espelho = esq && eixo !== 'x' ? -1 : 1;
        g.rotation[eixo] += valor(pose, nome, canal) * sinal * espelho * D;
      }
    }
    for (const [lado, s] of [['D', -1], ['E', 1]]) {   // dedos dobram em direção à palma (+x no direito)
      J['dedos' + lado].rotation.set(0, 0, -s * valor(pose, 'mao' + lado, 'fecha') * D);
      J['indicador' + lado].rotation.set(0, 0, -s * valor(pose, 'mao' + lado, 'indicador') * D);
    }
    raiz.position.set(valor(pose, 'corpo', 'x'), valor(pose, 'corpo', 'y'), valor(pose, 'corpo', 'z'));
    raiz.rotation.y = valor(pose, 'corpo', 'giro') * D;
    J.quadril.position.set(valor(pose, 'desl', 'x'), m.pernaComp + valor(pose, 'desl', 'y'), valor(pose, 'desl', 'z'));
    // Rosto
    const forma = valor(pose, 'rosto', 'boca'), estr = valor(pose, 'rosto', 'estranho');
    for (const [k, b] of Object.entries(bocas)) b.visible = k === forma;
    bocaG.scale.set(1 + estr * 0.9, 1 + estr * 0.4, 1);
    const ab = valor(pose, 'rosto', 'olhos');
    const ox = valor(pose, 'rosto', 'olharX'), oy = valor(pose, 'rosto', 'olharY');
    for (const o of olhos) o.scale.set(1, Math.max(0.05, ab), 1);
    for (const pu of pupilas) {
      pu.position.set(ox * R * 0.05, oy * R * 0.06, 0.0015);
      pu.scale.setScalar(1 + estr * 1.0);   // olhos tomados pela pupila
    }
    const sv = valor(pose, 'rosto', 'sobrancelha');
    for (const sb of sobr) { sb.rotation.z = 0; sb.children[0].rotation.z = -sb.userData.lado * sv * 0.35; sb.children[0].position.y = R * 0.03 * Math.abs(sv) * (sv > 0 ? 1 : -0.6); }
  }

  posar(REPOUSO);
  return { raiz, juntas: J, posar, medidas: m, ficha };
}

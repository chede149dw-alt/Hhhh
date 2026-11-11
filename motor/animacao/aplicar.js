// Aplica uma pose do animador num boneco (criarBoneco), com IK analítico de 2 ossos nos pés e nas mãos.
//
// IK dos pés: a pose pede o ponto da sola no mundo (peEAlvo / peDAlvo). Calcula coxa e joelho para o
// tornozelo chegar onde a sola precisa, e gira o pé para ficar com a orientação pedida em relação ao chão
// (ângulos de pe_e/pe_d da pose + giro do corpo). O joelho dobra para a frente do quadril.
// IK das mãos: a pose pede o ponto do pulso (maoEAlvo / maoDAlvo); o cotovelo aponta para trás e para fora.
// Pesos ikPes / ikMaos (0–1) misturam o resultado do IK com os ângulos da pose, sem pulo na troca.
// Observação: o amassa-e-estica (estica ≠ 1) deforma o corpo; o IK é exato só com estica = 1.
import * as THREE from 'three';

const G = (g) => (g * Math.PI) / 180;
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qPai = new THREE.Quaternion();
const m4 = new THREE.Matrix4();

// resolve 2 ossos: raiz em H, alvo A, comprimentos L1 e L2; polo = para onde a junta do meio aponta.
// sinal = +1 (joelho: dobra positiva em x leva o osso de baixo para trás) ou −1 (cotovelo).
// Devolve a rotação de mundo do osso de cima e o ângulo da junta do meio.
function doisOssos(H, A, L1, L2, polo, sinal) {
  const dir = v1.copy(A).sub(H);
  let d = dir.length();
  dir.normalize();
  d = Math.min(Math.max(d, Math.abs(L1 - L2) + 1e-9), L1 + L2 - 1e-9);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const senA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const u = v2.copy(polo).addScaledVector(dir, -polo.dot(dir));
  if (u.lengthSq() < 1e-12) u.set(0, 0, 1).addScaledVector(dir, -dir.z);
  u.normalize();
  const b1 = new THREE.Vector3().copy(dir).multiplyScalar(cosA).addScaledVector(u, senA).normalize(); // osso de cima
  const meio = new THREE.Vector3().copy(H).addScaledVector(b1, L1);
  const b2 = new THREE.Vector3().copy(A).sub(H).normalize().multiplyScalar(d).add(H).sub(meio).normalize(); // osso de baixo
  const c = Math.min(1, Math.max(-1, b1.dot(b2)));
  const ang = Math.acos(c);
  // eixos do osso de cima: Y = contra o osso; Z = lado para onde a dobra NÃO vai (joelho) / vai (cotovelo)
  const Y = new THREE.Vector3().copy(b1).negate();
  let Z = new THREE.Vector3().copy(b1).multiplyScalar(c).sub(b2).multiplyScalar(sinal);
  if (Z.lengthSq() < 1e-10) Z = v3.copy(polo).multiplyScalar(sinal).addScaledVector(b1, -polo.dot(b1) * sinal);
  Z.normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z).normalize();
  Z.crossVectors(X, Y).normalize();
  m4.makeBasis(X, Y, Z);
  return { qMundo: new THREE.Quaternion().setFromRotationMatrix(m4), ang: sinal * ang };
}

const quatEuler = (v) => new THREE.Quaternion().setFromEuler(new THREE.Euler(G(v[0]), G(v[1]), G(v[2])));
function definirMundo(obj, qMundo) {
  obj.parent.getWorldQuaternion(qPai);
  return qPai.invert().multiply(qMundo);
}

// alvos de IK vêm no espaço do pai da raiz (cena ou palco do cenário)
const paraMundo = (raiz, v) => (raiz.parent ? raiz.parent.localToWorld(v) : v);

export function pontoSola(boneco, lado, alvo = new THREE.Vector3()) {
  return boneco.juntas['pe_' + lado].localToWorld(alvo.set(0, -boneco.sola, 0));
}
export function pontoPulso(boneco, lado, alvo = new THREE.Vector3()) {
  return boneco.juntas['mao_' + lado].getWorldPosition(alvo);
}

export function aplicar(boneco, pose) {
  const p = pose || {};
  boneco.posar(p);
  const { raiz, corpo, juntas } = boneco;
  const c = p.corpo || {};
  raiz.position.set(c.x || 0, 0, c.z || 0);
  raiz.rotation.set(0, G(c.giro || 0), 0);
  corpo.position.y = (p.altura || 0) + (c.y || 0);
  const e = p.estica || 1;
  corpo.scale.set(1 / Math.sqrt(e), e, 1 / Math.sqrt(e));
  const q = p.quadril || [0, 0, 0];
  juntas.quadril.position.set(boneco.base.quadril.x + q[0], boneco.base.quadril.y + q[1], boneco.base.quadril.z + q[2]);
  raiz.updateMatrixWorld(true);

  const s = raiz.getWorldScale(new THREE.Vector3()).x * Math.sqrt(1 / e);
  // ---- pés ----
  const wPe = p.ikPes === undefined ? 1 : p.ikPes;
  for (const lado of ['e', 'd']) {
    const alvo = p[lado === 'e' ? 'peEAlvo' : 'peDAlvo'];
    if (!alvo || wPe <= 0) continue;
    const coxa = juntas['coxa_' + lado], joelho = juntas['joelho_' + lado], pe = juntas['pe_' + lado];
    const H = coxa.getWorldPosition(new THREE.Vector3());
    const L1 = H.distanceTo(joelho.getWorldPosition(new THREE.Vector3()));
    const L2 = joelho.getWorldPosition(new THREE.Vector3()).distanceTo(pe.getWorldPosition(new THREE.Vector3()));
    // orientação do pé em relação ao chão: giro do corpo + ângulos da pose
    const qPai0 = raiz.parent ? raiz.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
    const qPe = qPai0.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), G(c.giro || 0)))
      .multiply(quatEuler((p.juntas && p.juntas['pe_' + lado]) || [0, 0, 0]));
    const offSola = new THREE.Vector3(0, -boneco.sola * s, 0).applyQuaternion(qPe);
    const A = paraMundo(raiz, new THREE.Vector3(...alvo)).sub(offSola);
    const frente = new THREE.Vector3(0, 0, 1).applyQuaternion(juntas.quadril.getWorldQuaternion(new THREE.Quaternion()));
    const r = doisOssos(H, A, L1, L2, frente, 1);
    coxa.quaternion.slerp(definirMundo(coxa, r.qMundo), wPe);
    coxa.updateMatrixWorld(true);
    joelho.quaternion.slerp(qa.setFromEuler(new THREE.Euler(r.ang, 0, 0)), wPe);
    joelho.updateMatrixWorld(true);
    pe.quaternion.slerp(definirMundo(pe, qPe), wPe);
    pe.updateMatrixWorld(true);
  }
  // ---- mãos ----
  const wMao = p.ikMaos === undefined ? 1 : p.ikMaos;
  for (const [lado, sl] of [['e', 1], ['d', -1]]) {
    const alvo = p[lado === 'e' ? 'maoEAlvo' : 'maoDAlvo'];
    if (!alvo || wMao <= 0) continue;
    const ombro = juntas['ombro_' + lado], cot = juntas['cotovelo_' + lado], mao = juntas['mao_' + lado];
    const S = ombro.getWorldPosition(new THREE.Vector3());
    const L1 = S.distanceTo(cot.getWorldPosition(new THREE.Vector3()));
    const L2 = cot.getWorldPosition(new THREE.Vector3()).distanceTo(mao.getWorldPosition(new THREE.Vector3()));
    const qp = juntas.peito.getWorldQuaternion(new THREE.Quaternion());
    const polo = new THREE.Vector3(sl * 0.6, -0.3, -0.6).applyQuaternion(qp).normalize();
    const r = doisOssos(S, paraMundo(raiz, new THREE.Vector3(...alvo)), L1, L2, polo, -1);
    ombro.quaternion.slerp(definirMundo(ombro, r.qMundo), wMao);
    ombro.updateMatrixWorld(true);
    cot.quaternion.slerp(qb.setFromEuler(new THREE.Euler(r.ang, 0, 0)), wMao);
    cot.updateMatrixWorld(true);
  }
  return boneco;
}

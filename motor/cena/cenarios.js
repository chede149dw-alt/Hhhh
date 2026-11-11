// Cenários 3D chapados (prompt 6): montados com caixas, planos e formas simples, texturas geradas por código.
// Cada cenário devolve:
//   { grupo, marca: { pos:[x,0,z], giro }, areaLivre: { centro:[x,z], raio }, luz: { direcao, raioSombra, alvo },
//     fundo, nevoa: [cor, perto, longe], pontos: {…} }
// areaLivre: círculo no chão onde a câmera pode ficar sem atravessar paredes ou objetos.
// Personagem olha para +z quando giro = 0. Medidas em metros.
import * as THREE from 'three';
import { materialToon } from '../visual/estilo.js';
import { Texturas } from '../visual/texturas.js';
import { RoundedBoxGeometry } from '../visual/lib/three/addons/RoundedBoxGeometry.js';

const G = (g) => (g * Math.PI) / 180;
function ferramentas(grupo) {
  const mats = new Map();
  const mat = (cor, mapa, gMin) => {
    const k = cor + (mapa ? mapa.uuid : '') + (gMin || '');
    if (!mats.has(k)) mats.set(k, materialToon(cor, { mapa, gMin }));
    return mats.get(k);
  };
  const add = (geo, material, pos = [0, 0, 0], rot = [0, 0, 0], o = {}) => {
    const m = new THREE.Mesh(geo, typeof material === 'string' ? mat(material) : material);
    m.position.set(...pos); m.rotation.set(...rot);
    m.castShadow = o.sombra !== false; m.receiveShadow = !!o.recebe;
    (o.pai || grupo).add(m); return m;
  };
  const caixa = (w, h, d, cor, pos, o = {}) => add(o.r ? new RoundedBoxGeometry(w, h, d, 3, o.r) : new THREE.BoxGeometry(w, h, d), o.mat || cor, pos, o.rot, o);
  const cil = (rt, rb, h, cor, pos, o = {}) => add(new THREE.CylinderGeometry(rt, rb, h, o.seg || 16), o.mat || cor, pos, o.rot, o);
  // plano que só aparece de um lado (paredes vistas de dentro do quarto)
  const plano = (w, h, material, pos, rot, o = {}) => add(new THREE.PlaneGeometry(w, h), material, pos, rot, { sombra: false, ...o });
  const brilho = (cor) => new THREE.MeshBasicMaterial({ color: cor });
  // copa de árvore / planta low-poly
  const copa = (r, cor, pos, o = {}) => add(new THREE.IcosahedronGeometry(r, o.det || 0), mat(cor), pos, o.rot || [0.3, 0.5, 0.1], o);
  return { mat, add, caixa, cil, plano, brilho, copa };
}

// ----------------------------------------------------------------------------------------------- RUA
export function criarRua() {
  const grupo = new THREE.Group(); grupo.name = 'rua';
  const { mat, caixa, cil, plano, brilho, copa, add } = ferramentas(grupo);
  const L = 80;
  // chão: asfalto, meio-fio, calçadas, faixa de grama nos fundos
  plano(6, L, mat('#FFFFFF', Texturas.asfalto([1, L / 6])), [0, 0, 0], [-Math.PI / 2, 0, 0], { recebe: true });
  for (const s of [1, -1]) {
    caixa(2.2, 0.14, L, null, [s * 4.1, 0.07, 0], { mat: mat('#FFFFFF', Texturas.calcada([2, L / 2])), recebe: true, sombra: false });
    caixa(0.16, 0.16, L, '#BDB3A6', [s * 3.05, 0.08, 0], { recebe: true, sombra: false });
    plano(6, L, mat('#FFFFFF', Texturas.grama([3, 40])), [s * 8.2, 0.141, 0], [-Math.PI / 2, 0, 0], { recebe: true });
  }
  // casas dos dois lados: paredes pastel, telhado, janelas, porta, muro com grade
  const cores = ['#E8C9A0', '#9FB7C9', '#D9A6A0', '#CDE0C2', '#F2E2A8', '#C9B8D9'];
  let k = 0;
  for (const s of [1, -1]) for (let z = -36; z <= 36; z += 7.5) {
    const cor = cores[k++ % cores.length], w = 6.4, h = 3.2 + (k % 3) * 0.4, d = 6;
    const cx = s * (5.6 + d / 2);
    caixa(d, h, w, null, [cx, h / 2 + 0.14, z], { mat: mat('#FFFFFF', Texturas.parede(cor, [2, 1])) });
    // telhado de duas águas
    const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.3, 0); tri.lineTo(w / 2 + 0.3, 0); tri.lineTo(0, 1.3); tri.lineTo(-w / 2 - 0.3, 0);
    const tel = add(new THREE.ExtrudeGeometry(tri, { depth: d + 0.6, bevelEnabled: false }), mat('#B5654A'), [cx - (d + 0.6) / 2 * 1, h + 0.14, z], [0, Math.PI / 2, 0]);
    tel.position.x = cx - (d + 0.6) / 2;
    // fachada virada para a rua
    const fx = s * 5.58;
    for (const dz of [-1.7, 1.7]) {
      caixa(0.08, 1.2, 1.2, '#F4EFE6', [fx, 1.75, z + dz]);                          // moldura
      caixa(0.1, 1.0, 1.0, null, [fx - s * 0.01, 1.75, z + dz], { mat: mat('#3E5A78') }); // vidro
      caixa(0.12, 0.06, 1.0, '#F4EFE6', [fx - s * 0.02, 1.75, z + dz], { sombra: false });
    }
    caixa(0.08, 2.0, 1.0, '#7A5236', [fx, 1.14, z]);                                      // porta
    cil(0.03, 0.03, 0.02, '#E8C76A', [fx - s * 0.05, 1.1, z + 0.35], { rot: [0, 0, Math.PI / 2] });
    // muro baixo com portão de grade
    caixa(0.2, 0.9, 2.4, null, [s * 5.25, 0.59, z - 2.0], { mat: mat('#FFFFFF', Texturas.parede('#E0D6C8', [1, 0.5])) });
    caixa(0.2, 0.9, 2.4, null, [s * 5.25, 0.59, z + 2.0], { mat: mat('#FFFFFF', Texturas.parede('#E0D6C8', [1, 0.5])) });
    for (let g = -0.7; g <= 0.7; g += 0.18) cil(0.015, 0.015, 1.0, '#3A3640', [s * 5.25, 0.64, z + g], { seg: 6 });
    caixa(0.05, 0.05, 1.6, '#3A3640', [s * 5.25, 1.12, z]);
  }
  // árvores na calçada da direita e postes com fios na da esquerda
  for (let z = -32; z <= 32; z += 8) {
    if (Math.abs(z) < 3) continue;
    cil(0.12, 0.16, 2.2, '#7A5236', [4.7, 1.24, z]);
    copa(1.1, '#6E9A4E', [4.7, 2.9, z]); copa(0.8, '#5E8A45', [4.4, 3.4, z + 0.4], { rot: [1, 0.2, 0.4] }); copa(0.75, '#7FA65A', [5.0, 3.3, z - 0.5], { rot: [0.2, 1, 0.3] });
  }
  for (let z = -36; z <= 36; z += 12) {
    cil(0.1, 0.12, 7, '#8E8A86', [-4.6, 3.64, z]);
    caixa(1.4, 0.08, 0.08, '#8E8A86', [-4.6, 6.6, z]);
    caixa(0.5, 0.06, 0.06, '#8E8A86', [-4.25, 5.6, z], { rot: [0, 0, -0.2] });
    caixa(0.36, 0.14, 0.2, '#ECE6D8', [-3.95, 5.55, z]);                                   // luminária
    if (z < 36) for (const dx of [-0.6, 0, 0.6]) {                                          // fios (catenária simples)
      const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector3(-4.6 + dx, 6.6 - Math.sin(u * Math.PI) * 0.5, z + u * 12)); }
      const linha = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#3A3640' }));
      grupo.add(linha);
    }
  }
  // carro estacionado, lixeiras, hidrante
  const carro = new THREE.Group(); carro.position.set(-2.0, 0, 7); grupo.add(carro);
  caixa(1.8, 0.7, 4.0, '#D23A42', [0, 0.55, 0], { pai: carro, r: 0.12 });
  caixa(1.6, 0.6, 2.1, '#D23A42', [0, 1.15, -0.2], { pai: carro, r: 0.15 });
  caixa(1.62, 0.45, 1.9, '#3E5A78', [0, 1.17, -0.2], { pai: carro, r: 0.1 });
  for (const [x, z] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) cil(0.34, 0.34, 0.24, '#2A2632', [x, 0.34, z], { pai: carro, rot: [0, 0, Math.PI / 2], seg: 18 });
  caixa(1.7, 0.12, 0.1, '#F4EFE6', [0, 0.6, 2.02], { pai: carro });
  for (const [z, cor] of [[-5, '#3DB5B0'], [-5.7, '#EBC25A']]) { caixa(0.55, 0.8, 0.55, cor, [3.5, 0.55, z], { r: 0.05 }); caixa(0.6, 0.06, 0.6, '#2A2632', [3.5, 0.98, z]); }
  cil(0.12, 0.14, 0.6, '#D23A42', [3.4, 0.44, 9]);
  const marca = { pos: [3.7, 0.14, 0], giro: 0 };
  return {
    grupo, marca, nome: 'rua',
    areaLivre: { centro: [2.4, 0], raio: 2.7 },
    luz: { direcao: [-5, 8, 6], raioSombra: 7, alvo: [2, 0, 0] },
    fundo: Texturas.ceu('#8EC3E0', '#F3D9B3', '#F7C79A') || new THREE.Color('#F3D9B3'),
    nevoa: ['#F2D6B4', 18, 60],
    pontos: { lixeira: [3.5, 0.95, -5], carro: [-2, 0, 7] },
  };
}

// --------------------------------------------------------------------------------------------- QUARTO
export function criarQuarto() {
  const grupo = new THREE.Group(); grupo.name = 'quarto';
  const { mat, caixa, cil, plano, brilho, copa } = ferramentas(grupo);
  const X = 2.2, ZT = -2.4, ZF = 1.8, AL = 2.7;
  const parede = mat('#FFFFFF', Texturas.parede('#E9D9C4', [2, 1]));
  // chão de tábuas, paredes viradas para dentro (de fora ficam invisíveis), teto
  plano(2 * X, ZF - ZT, mat('#FFFFFF', Texturas.madeira([3, 3])), [0, 0, (ZT + ZF) / 2], [-Math.PI / 2, 0, 0], { recebe: true });
  plano(2 * X, AL, parede, [0, AL / 2, ZT], [0, 0, 0]);
  plano(2 * X, AL, parede, [0, AL / 2, ZF], [0, Math.PI, 0]);
  plano(ZF - ZT, AL, mat('#FFFFFF', Texturas.parede('#D9C7B0', [2, 1])), [-X, AL / 2, (ZT + ZF) / 2], [0, Math.PI / 2, 0]);
  plano(ZF - ZT, AL, parede, [X, AL / 2, (ZT + ZF) / 2], [0, -Math.PI / 2, 0]);
  plano(2 * X, ZF - ZT, mat('#F4EDE2'), [0, AL, (ZT + ZF) / 2], [Math.PI / 2, 0, 0]);
  // rodapés
  caixa(2 * X, 0.1, 0.03, '#F4EFE6', [0, 0.05, ZT + 0.015], { sombra: false });
  caixa(0.03, 0.1, ZF - ZT, '#F4EFE6', [-X + 0.015, 0.05, (ZT + ZF) / 2], { sombra: false });
  caixa(0.03, 0.1, ZF - ZT, '#F4EFE6', [X - 0.015, 0.05, (ZT + ZF) / 2], { sombra: false });
  // janela na parede esquerda (luz do dia), com cortinas
  const zj = -0.9;
  caixa(0.06, 1.3, 1.5, '#F4EFE6', [-X + 0.03, 1.55, zj]);
  plano(1.3, 1.1, brilho('#FFF2D2'), [-X + 0.07, 1.55, zj], [0, Math.PI / 2, 0]);
  caixa(0.05, 1.1, 0.05, '#F4EFE6', [-X + 0.08, 1.55, zj]);
  caixa(0.05, 0.05, 1.3, '#F4EFE6', [-X + 0.08, 1.55, zj]);
  caixa(0.14, 0.05, 1.7, '#F4EFE6', [-X + 0.1, 0.9, zj]);                           // parapeito
  for (const s of [1, -1]) caixa(0.08, 1.8, 0.45, '#3DB5B0', [-X + 0.12, 1.45, zj + s * 0.95], { r: 0.03 });
  cil(0.02, 0.02, 2.2, '#7A5236', [-X + 0.12, 2.37, zj], { rot: [Math.PI / 2, 0, 0] });
  // cama encostada no fundo à direita
  const cama = new THREE.Group(); cama.position.set(1.35, 0, -1.35); grupo.add(cama);
  caixa(1.1, 0.32, 2.05, '#9C6B45', [0, 0.18, 0], { pai: cama, r: 0.03 });
  caixa(1.04, 0.2, 1.98, '#F4EFE6', [0, 0.44, 0], { pai: cama, r: 0.06 });
  caixa(1.08, 0.12, 1.3, '#2B3B66', [0, 0.56, 0.32], { pai: cama, r: 0.05 });          // coberta
  caixa(1.1, 0.06, 0.25, '#EBC25A', [0, 0.6, -0.2], { pai: cama, r: 0.025 });         // dobra da coberta
  caixa(0.62, 0.14, 0.36, '#FFFFFF', [0, 0.62, -0.75], { pai: cama, r: 0.07 });       // travesseiro
  caixa(1.14, 0.9, 0.08, '#9C6B45', [0, 0.5, -1.02], { pai: cama, r: 0.03 });         // cabeceira
  // criado-mudo com despertador
  caixa(0.45, 0.5, 0.4, '#B7845A', [0.55, 0.25, -2.1], { r: 0.02 });
  caixa(0.16, 0.12, 0.08, '#D23A42', [0.55, 0.56, -2.05], { r: 0.03 });
  cil(0.045, 0.045, 0.01, '#F4EFE6', [0.55, 0.57, -2.0], { rot: [Math.PI / 2, 0, 0], seg: 18 });
  // escrivaninha perto da janela, notebook, luminária e cadeira
  caixa(0.7, 0.05, 1.3, '#B7845A', [-1.82, 0.75, -1.7]);
  for (const [dx, dz] of [[-0.3, -0.6], [0.3, -0.6], [-0.3, 0.6], [0.3, 0.6]]) caixa(0.05, 0.75, 0.05, '#9C6B45', [-1.82 + dx, 0.375, -1.7 + dz]);
  caixa(0.32, 0.02, 0.42, '#5C5866', [-1.75, 0.785, -1.75], { r: 0.008 });
  caixa(0.02, 0.28, 0.42, '#5C5866', [-1.92, 0.93, -1.75], { rot: [0, 0, -0.25], r: 0.008 });
  plano(0.38, 0.24, brilho('#9FD2EA'), [-1.905, 0.93, -1.75], [0, Math.PI / 2, -0.25]);
  cil(0.08, 0.1, 0.03, '#2A2632', [-1.95, 0.79, -2.2]); cil(0.012, 0.012, 0.35, '#2A2632', [-1.95, 0.97, -2.2]);
  cil(0.05, 0.12, 0.13, '#EBC25A', [-1.88, 1.14, -2.2], { rot: [0, 0, 0.5] });
  caixa(0.45, 0.06, 0.45, '#2B3B66', [-1.35, 0.46, -1.6], { r: 0.02 });
  caixa(0.45, 0.5, 0.06, '#2B3B66', [-1.14, 0.74, -1.6], { rot: [0, 0, 0.1], r: 0.02 });
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cil(0.015, 0.015, 0.45, '#2A2632', [-1.35 + dx, 0.22, -1.6 + dz], { seg: 6 });
  // guarda-roupa na parede direita
  caixa(0.6, 2.05, 1.1, '#C99A6E', [X - 0.32, 1.03, 0.8], { r: 0.02 });
  caixa(0.02, 1.9, 0.01, '#9C6B45', [X - 0.62, 1.05, 0.8], { sombra: false });
  for (const dz of [-0.07, 0.07]) caixa(0.03, 0.22, 0.03, '#E8C76A', [X - 0.64, 1.1, 0.8 + dz]);
  // prateleira com livros e pôsteres no fundo
  caixa(1.2, 0.04, 0.25, '#9C6B45', [-0.4, 1.7, ZT + 0.13]);
  const livros = ['#D23A42', '#3DB5B0', '#EBC25A', '#2B3B66', '#7FA65A', '#C9B8D9', '#D9A6A0'];
  livros.forEach((c, i) => caixa(0.08, 0.24 + (i % 3) * 0.04, 0.18, c, [-0.9 + i * 0.12, 1.85 + (i % 3) * 0.02, ZT + 0.13]));
  plano(0.6, 0.85, mat('#2B3B66'), [0.35, 1.6, ZT + 0.01], [0, 0, 0]);
  plano(0.42, 0.42, mat('#EBC25A'), [0.35, 1.7, ZT + 0.015], [0, 0, 0]);
  plano(0.5, 0.5, mat('#3DB5B0'), [-1.35, 1.25, ZT + 0.01], [0, 0, 0.08]);
  cil(0.17, 0.17, 0.04, '#F4EFE6', [1.0, 2.15, ZT + 0.03], { rot: [Math.PI / 2, 0, 0], seg: 24 });   // relógio
  // tapete redondo, planta, luminária de teto
  cil(1.0, 1.0, 0.012, '#EBC25A', [0, 0.006, -0.2], { seg: 40, recebe: true, sombra: false });
  cil(0.8, 0.8, 0.014, '#E8C9A0', [0, 0.008, -0.2], { seg: 40, recebe: true, sombra: false });
  cil(0.18, 0.14, 0.32, '#D9A6A0', [-1.85, 0.16, 1.4]);
  copa(0.3, '#6E9A4E', [-1.85, 0.55, 1.4]); copa(0.22, '#5E8A45', [-1.75, 0.75, 1.32], { rot: [1, 0.3, 0] });
  cil(0.3, 0.38, 0.22, '#F4EFE6', [0, AL - 0.11, -0.3]);
  const marca = { pos: [0, 0, -0.2], giro: 0 };
  return {
    grupo, marca, nome: 'quarto',
    areaLivre: { centro: [0, 0.1], raio: 1.55 },
    luz: { direcao: [-6, 4.5, 1.5], raioSombra: 4, alvo: [0, 0, -0.5] },
    fundo: new THREE.Color('#E9D9C4'),
    nevoa: ['#E9D9C4', 6, 14],
    pontos: { janela: [-X, 1.55, zj], cama: [1.35, 0.6, -1.35], vaso: [-1.85, 0.55, 1.4] },
  };
}

export const CENARIOS = { rua: criarRua, quarto: criarQuarto };

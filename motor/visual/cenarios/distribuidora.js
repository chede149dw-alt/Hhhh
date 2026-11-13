// Cenário: distribuidora de bebidas de madrugada (por dentro) + calçada e rua (por fora).
// Coordenadas (m): sala x ∈ [-2.2, 2.2], z ∈ [-3.0, 1.2], teto 2.9. A grade fica em z = 1.2 (frente).
// Quem está atrás do balcão olha para +z (rua). Lá fora fica escuro pela névoa preta do pós.
import * as THREE from 'three';
import { materialChapado, comoChao, comoObjeto } from '../estilo/chapado.js';
import { textura, texturaTexto } from '../estilo/texturas.js';
import { ASSENTO } from '../../animacao/atuacoes.js';

import { SALA, GRADE_Z, PORTINHOLA, BALCAO, MARCAS, CADEADO } from './distribuidora_dados.js';
export { SALA, GRADE_Z, PORTINHOLA, BALCAO, MARCAS, CADEADO };

function rng(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function texturaDegrade(vertical = true) {   // preto → transparente (cantos escurecidos, cone de luz)
  const c = document.createElement('canvas'); c.width = 4; c.height = 128;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 128, 0, 0);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
  const t = new THREE.CanvasTexture(c); return t;
}

function texturaBrilho() {   // halo radial para lâmpadas/neon
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function criarDistribuidora({ semente = 11 } = {}) {
  const raiz = new THREE.Group(); raiz.name = 'distribuidora';
  const r = rng(semente);
  const brilhoTex = texturaBrilho();
  const add = (obj, pai = raiz) => { pai.add(obj); return obj; };
  const caixa = (l, a, p, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), mat); m.position.set(x, y, z); return add(m); };
  const mat = (cor, o) => materialChapado(cor, o);
  const comTex = (cor, nome, rep, o = {}) => materialChapado(cor, { map: textura(nome, rep), ...o });
  const halo = (cor, tam, x, y, z, op = 0.6) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: brilhoTex, color: cor, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    s.renderOrder = 2;
    s.scale.set(tam, tam, 1); s.position.set(x, y, z); return add(s);
  };
  const W = SALA.x1 - SALA.x0, D = SALA.z1 - SALA.z0, cx = (SALA.x0 + SALA.x1) / 2, cz = (SALA.z0 + SALA.z1) / 2;

  // ---------- Sala ----------
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, D), comTex('#e4e9e4', 'azulejo', [W / 1.0, D / 1.0], { volume: false }));
  piso.rotation.x = -Math.PI / 2; piso.position.set(cx, 0, cz); add(comoChao(piso));
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat('#e6e6e0', { volume: false }));
  teto.rotation.x = Math.PI / 2; teto.position.set(cx, SALA.teto, cz); add(teto);
  const azulejoParede = comTex('#f1f5f2', 'azulejo', [8, 1.6], { volume: false });
  const pintura = comTex('#eef2ee', 'parede', [3, 1], { volume: false });
  const parede = (l, x, z, giroY) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = giroY; add(g);
    const baixo = new THREE.Mesh(new THREE.PlaneGeometry(l, 1.2), azulejoParede); baixo.position.y = 0.6; g.add(baixo);
    const cima = new THREE.Mesh(new THREE.PlaneGeometry(l, SALA.teto - 1.2), pintura); cima.position.y = 1.2 + (SALA.teto - 1.2) / 2; g.add(cima);
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(l, 0.05, 0.02), mat('#3f7f86')); faixa.position.y = 1.2; g.add(faixa);
    return g;
  };
  parede(W, cx, SALA.z0, 0);                    // fundo
  parede(D, SALA.x0, cz, Math.PI / 2);          // direita de quem olha a rua (-x)
  parede(D, SALA.x1, cz, -Math.PI / 2);         // esquerda (+x)
  // fachada acima da grade (por dentro e por fora)
  caixa(W, SALA.teto - 2.3, 0.15, pintura, cx, 2.3 + (SALA.teto - 2.3) / 2, GRADE_Z + 0.08);

  // ---------- Balcão ----------
  const bw = BALCAO.x1 - BALCAO.x0, bd = BALCAO.z1 - BALCAO.z0, bx = (BALCAO.x0 + BALCAO.x1) / 2, bz = (BALCAO.z0 + BALCAO.z1) / 2;
  comoObjeto(caixa(bw, BALCAO.altura - 0.05, bd, comTex('#8a5a3a', 'madeira', [3, 1]), bx, (BALCAO.altura - 0.05) / 2, bz));
  comoObjeto(caixa(bw + 0.06, 0.05, bd + 0.06, comTex('#3b3b40', 'concreto', [3, 1]), bx, BALCAO.altura - 0.025, bz));
  comoObjeto(caixa(0.22, 0.12, 0.2, mat('#2b2d33'), bx + 0.55, BALCAO.altura + 0.06, bz - 0.05));       // caixa registradora
  comoObjeto(caixa(0.08, 0.14, 0.03, mat('#1d1e22'), bx - 0.6, BALCAO.altura + 0.07, bz - 0.1));        // maquininha
  comoObjeto(caixa(0.3, 0.25, 0.25, mat('#c9b48a'), bx - 0.95, BALCAO.altura + 0.125, bz - 0.05));       // caixa de papelão

  // ---------- Geladeiras (porta de vidro, viradas para +x, encostadas na parede -x) ----------
  const telaGel = [];
  const latasCor = ['#c62828', '#e8b923', '#1e88e5', '#c62828', '#2e7d32', '#e8b923', '#ef6c00'];
  const latas = [];
  for (const zc of [0.15, -0.62]) {
    const g = new THREE.Group(); g.position.set(SALA.x0 + 0.33, 0, zc); add(g);
    // gabinete oco (aberto na frente, atrás do vidro): fundo, laterais, teto e base
    const branco = mat('#eef1f3');
    const painel = (l, a, p, x, y, z) => { const pn = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), branco); pn.position.set(x, y, z); g.add(pn); };
    painel(0.04, 1.95, 0.72, -0.29, 0.975, 0);
    for (const sz of [-1, 1]) painel(0.62, 1.95, 0.04, 0, 0.975, sz * 0.34);
    painel(0.62, 0.18, 0.72, 0, 0.09, 0); painel(0.62, 0.12, 0.72, 0, 1.79, 0);
    const topo = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.2, 0.74), mat('#c62828')); topo.position.y = 1.85; g.add(topo);
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.5), new THREE.MeshBasicMaterial({ color: '#d8f0ff', toneMapped: false }));
    fundo.position.set(-0.265, 0.95, 0); fundo.rotation.y = Math.PI / 2; g.add(fundo); telaGel.push(fundo);
    for (const y of [0.42, 0.8, 1.18, 1.56]) {
      const prat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.015, 0.62), mat('#cfd8dc')); prat.position.set(0.0, y, 0); g.add(prat);
      for (let k = 0; k < 6; k++) for (let fila = 0; fila < 2; fila++) latas.push({ x: SALA.x0 + 0.33 + 0.17 - fila * 0.1, y: y + 0.07, z: zc - 0.25 + k * 0.1, cor: latasCor[Math.floor(r() * latasCor.length)] });
    }
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 1.62), new THREE.MeshBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.16, depthWrite: false }));
    vidro.position.set(0.315, 0.97, 0); vidro.rotation.y = Math.PI / 2; g.add(vidro);
    const puxador = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.03), mat('#9aa3a8')); puxador.position.set(0.33, 1.0, 0.3); g.add(puxador);
    halo('#bfe9ff', 1.6, SALA.x0 + 0.75, 1.0, zc, 0.25);
    const lg = new THREE.PointLight('#8fd3ff', 0.55, 2.4, 2); lg.position.set(SALA.x0 + 0.95, 1.05, zc); add(lg);
  }
  const latasIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 12), mat('#ffffff', { volume: false }), latas.length);
  const m4 = new THREE.Matrix4(), cor = new THREE.Color();
  latas.forEach((l, i) => { m4.makeTranslation(l.x, l.y, l.z); latasIM.setMatrixAt(i, m4); latasIM.setColorAt(i, cor.set(l.cor)); });
  add(latasIM);

  // ---------- Prateleiras de garrafas (parede do fundo) ----------
  const garrafas = [];
  const vidros = ['#2e6b34', '#6b3e1f', '#3d5c2c', '#a8d0c8', '#7a4a1e'];
  for (const y of [0.95, 1.38, 1.81]) {
    comoObjeto(caixa(2.6, 0.04, 0.3, comTex('#7b5236', 'madeira', [2, 1]), -0.3, y, SALA.z0 + 0.16));
    for (let k = 0; k < 16; k++) garrafas.push({ x: -1.5 + k * 0.16 + (r() - 0.5) * 0.03, y: y + 0.02, z: SALA.z0 + 0.15, cor: vidros[Math.floor(r() * vidros.length)], alta: r() > 0.4 });
  }
  const corpoG = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 10), mat('#ffffff'), garrafas.length);
  const gargalo = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.03, 0.12, 8), mat('#ffffff'), garrafas.length);
  garrafas.forEach((gf, i) => {
    const h = gf.alta ? 1.25 : 1;
    m4.makeScale(1, h, 1).setPosition(gf.x, gf.y + 0.1 * h, gf.z); corpoG.setMatrixAt(i, m4); corpoG.setColorAt(i, cor.set(gf.cor));
    m4.makeTranslation(gf.x, gf.y + 0.2 * h + 0.06, gf.z); gargalo.setMatrixAt(i, m4); gargalo.setColorAt(i, cor.set(gf.cor));
  });
  add(corpoG); add(gargalo);

  // ---------- Engradados ----------
  const engradado = (x, y, z, corE, giro = 0, alt = 0.22) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = giro; add(g);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, alt, 0.32), mat(corE)); b.position.y = alt / 2; g.add(b);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.01, 0.28), mat('#1c1c1c')); t.position.y = alt + 0.002; g.add(t);
    comoObjeto(g); return g;
  };
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i % 2); j++) engradado(1.85, j * 0.22, -2.6 + i * 0.36, i % 2 ? '#e8b923' : '#c62828', (r() - 0.5) * 0.1);
  const me = MARCAS.engradado, gr = (me.giro * Math.PI) / 180;
  for (let j = 0; j < 2; j++) engradado(me.x - Math.sin(gr) * 0.02, j * (ASSENTO / 2), me.z - Math.cos(gr) * 0.02, '#c62828', gr, ASSENTO / 2);   // assento do Gabriel

  // ---------- Letreiro de neon e cartaz ----------
  const neonTex = texturaTexto([['ABERTO 24H', '900 88px sans-serif', '#ff3b3b']], { largura: 640, altura: 160, fundo: null });
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, toneMapped: false, depthWrite: false }));
  neon.position.set(SALA.x1 - 0.02, 2.15, -1.1); neon.rotation.y = -Math.PI / 2; add(neon);
  const neonHalo = halo('#ff2a2a', 1.8, SALA.x1 - 0.25, 2.15, -1.1, 0.35);
  const luzNeon = new THREE.PointLight('#ff2f2f', 1.6, 3.2, 2); luzNeon.position.set(SALA.x1 - 0.35, 2.05, -1.1); add(luzNeon);
  // placa de neon VERDE na frente da loja (por dentro, acima da grade): é ela que tinge o ambiente de verde
  const verdeTex = texturaTexto([['GELADA', '900 120px sans-serif', '#3dff8a']], { largura: 640, altura: 180, fundo: null });
  const placaVerde = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.37), new THREE.MeshBasicMaterial({ map: verdeTex, transparent: true, toneMapped: false, depthWrite: false }));
  placaVerde.position.set(0.15, 2.58, GRADE_Z - 0.02); placaVerde.rotation.y = Math.PI; add(placaVerde);
  const haloVerde = halo('#38ff7e', 2.6, 0.15, 2.58, GRADE_Z - 0.2, 0.4);
  const luzVerde = new THREE.PointLight('#3dff8a', 2.2, 6.5, 1.4); luzVerde.position.set(0.15, 2.45, GRADE_Z - 0.4); add(luzVerde);
  const cartaz = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.95), materialChapado('#ffffff', { volume: false, map: texturaTexto([
    ['TABELA', '900 64px sans-serif', '#c62828'], ['LATA ........ 5,00', '700 40px monospace', '#111'], ['LONG NECK ... 8,00', '700 40px monospace', '#111'],
    ['GARRAFA ..... 12,00', '700 40px monospace', '#111'], ['GELO ........ 10,00', '700 40px monospace', '#111'], ['CIGARRO ..... 14,00', '700 40px monospace', '#111']], { largura: 512, altura: 700, fundo: '#fff7d6' }) }));
  cartaz.position.set(1.2, 1.65, SALA.z0 + 0.01); add(cartaz);

  // ---------- Lâmpadas fluorescentes ----------
  const tubos = [];
  // calhas longas correndo da frente para o fundo (como na referência), 2 tubos cada
  for (const [x, z, comLuz] of [[-0.95, 0.05, true], [0.75, 0.05, false], [-0.95, -1.95, false], [0.75, -1.95, true]]) {
    caixa(0.22, 0.05, 1.7, mat('#d9dcd6'), x, SALA.teto - 0.03, z);
    for (const dx of [-0.05, 0.05]) {
      const tubo = caixa(0.035, 0.035, 1.6, new THREE.MeshBasicMaterial({ color: '#f2fff8', toneMapped: false }), x + dx, SALA.teto - 0.075, z);
      tubos.push({ tubo, halo: { material: { opacity: 0 } }, luz: { intensity: 0 }, base: 0 });
    }
    const h = halo('#e6fff2', 2.2, x, SALA.teto - 0.15, z, 0.3); h.scale.set(1.2, 2.4, 1);
    const item = { tubo: { material: { color: new THREE.Color() } }, halo: h, luz: { intensity: 0 }, base: 0 };
    if (comLuz) { const pl = new THREE.PointLight('#c2ffdc', 1.3, 7.5, 1.3); pl.position.set(x, SALA.teto - 0.3, z); add(pl); item.luz = pl; item.base = pl.intensity; }
    tubos.push(item);
  }

  // ---------- Grade com portinhola, portão e porta de aço enrolada ----------
  const metal = mat('#3b3f46');
  const barras = [];
  for (let x = SALA.x0 + 0.06; x <= SALA.x1 - 0.05; x += 0.12) {
    const naPort = Math.abs(x - PORTINHOLA.x) < PORTINHOLA.l / 2;
    if (naPort) { barras.push([x, 0, PORTINHOLA.base]); barras.push([x, PORTINHOLA.base + PORTINHOLA.a, 2.3]); } else barras.push([x, 0, 2.3]);
  }
  const barraIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), metal, barras.length);
  barras.forEach(([x, y0, y1], i) => { m4.makeScale(1, y1 - y0, 1).setPosition(x, (y0 + y1) / 2, GRADE_Z); barraIM.setMatrixAt(i, m4); });
  add(comoObjeto(barraIM));
  for (const y of [0.08, 2.27]) comoObjeto(caixa(W, 0.04, 0.03, metal, cx, y, GRADE_Z));
  for (const y of [PORTINHOLA.base, PORTINHOLA.base + PORTINHOLA.a]) comoObjeto(caixa(W, 0.035, 0.03, metal, cx, y, GRADE_Z));
  // moldura da portinhola (mais grossa e clara) + bandejinha de metal para passar latas e dinheiro
  const moldura = mat('#6b717a');
  for (const sx of [-1, 1]) comoObjeto(caixa(0.045, PORTINHOLA.a + 0.06, 0.05, moldura, PORTINHOLA.x + sx * (PORTINHOLA.l / 2 + 0.02), PORTINHOLA.base + PORTINHOLA.a / 2, GRADE_Z));
  for (const y of [PORTINHOLA.base - 0.01, PORTINHOLA.base + PORTINHOLA.a + 0.01]) comoObjeto(caixa(PORTINHOLA.l + 0.09, 0.045, 0.05, moldura, PORTINHOLA.x, y, GRADE_Z));
  comoObjeto(caixa(PORTINHOLA.l + 0.04, 0.012, 0.36, mat('#9aa1a9'), PORTINHOLA.x, PORTINHOLA.base + 0.012, GRADE_Z));
  comoObjeto(caixa(0.05, 2.3, 0.05, metal, 0.6, 1.15, GRADE_Z));                       // batente do portão
  comoObjeto(caixa(0.07, 0.08, 0.035, mat('#c9a640'), CADEADO[0], CADEADO[1], CADEADO[2]));   // cadeado
  const rolo = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, W, 20), comTex('#8d949b', 'metal_ondulado', [1, 8]));
  rolo.rotation.z = Math.PI / 2; rolo.position.set(cx, 2.55, GRADE_Z - 0.1); add(rolo);

  // ---------- Fora: calçada, meio-fio, rua, poste, casas ----------
  const calcada = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.2), comTex('#9a948a', 'pedra', [8, 1.2], { volume: false }));
  calcada.rotation.x = -Math.PI / 2; calcada.position.set(0, 0.0, GRADE_Z + 1.1); add(comoChao(calcada));
  comoObjeto(caixa(16, 0.15, 0.15, comTex('#a9a59c', 'concreto', [10, 1]), 0, 0.0, GRADE_Z + 2.25));
  const rua = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), comTex('#3a3b3f', 'asfalto', [12, 9], { volume: false }));
  rua.rotation.x = -Math.PI / 2; rua.position.set(0, -0.08, GRADE_Z + 17.3); add(comoChao(rua));
  const poste = new THREE.Group(); poste.position.set(2.7, 0, GRADE_Z + 2.0); add(poste);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 10), mat('#5d6168')); haste.position.y = 2.3; poste.add(haste);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), mat('#5d6168')); braco.position.set(-0.45, 4.55, 0); poste.add(braco);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.18), new THREE.MeshBasicMaterial({ color: '#ffb35c', toneMapped: false })); lamp.position.set(-0.85, 4.5, 0); poste.add(lamp);
  comoObjeto(poste);
  halo('#ff9d3c', 3.2, 2.7 - 0.85, 4.45, GRADE_Z + 2.0, 0.55);
  // luz do poste: projeta a sombra da grade PARA DENTRO da loja (listras laranja no piso perto da grade)
  const luzPoste = new THREE.SpotLight('#ffa552', 1.5, 12, 0.62, 0.5, 0);
  luzPoste.position.set(1.85, 4.45, GRADE_Z + 2.0); luzPoste.target.position.set(-0.6, 0, GRADE_Z - 1.3); add(luzPoste); add(luzPoste.target);
  luzPoste.castShadow = true; luzPoste.shadow.mapSize.set(2048, 2048); luzPoste.shadow.bias = -0.0006; luzPoste.shadow.radius = 1.5;
  luzPoste.shadow.camera.near = 0.5; luzPoste.shadow.camera.far = 14; luzPoste.shadow.intensity = 0.9;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4.4, 28, 1, true), new THREE.MeshBasicMaterial({
    map: texturaDegrade(), color: '#ffb25e', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
  cone.position.set(2.7 - 0.85, 4.45 - 2.2, GRADE_Z + 2.0); cone.material.map.repeat.set(1, -1); cone.material.map.offset.set(0, 1); cone.material.map.wrapT = THREE.RepeatWrapping; add(cone);
  // fileira de postes dos dois lados da rua, sumindo no escuro (só o primeiro projeta sombra)
  const poca = (x, z, raio, op) => {   // poça de luz falsa no chão (barata)
    const pc = new THREE.Mesh(new THREE.CircleGeometry(raio, 28), new THREE.MeshBasicMaterial({ map: brilhoTex, color: '#ff9c45', transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    pc.rotation.x = -Math.PI / 2; pc.position.set(x, -0.07, z); return add(pc);
  };
  const posteSimples = (x, z, lado) => {
    const pg = new THREE.Group(); pg.position.set(x, 0, z); add(pg);
    const hs = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 8), mat('#4d5158')); hs.position.y = 2.3; pg.add(hs);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), mat('#4d5158')); br.position.set(lado * 0.45, 4.55, 0); pg.add(br);
    const lp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.18), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb35c').multiplyScalar(3), toneMapped: false })); lp.position.set(lado * 0.85, 4.5, 0); pg.add(lp);
    const hx = x + lado * 0.85;
    const hl = halo('#ff9d3c', 3.0, hx, 4.45, z, 0.6); hl.material.depthWrite = true;
    const cn = cone.clone(); cn.position.set(hx, 2.25, z); add(cn);
    poca(hx, z, 2.6, 0.22);
  };
  for (const x of [-4.3, -11.3, 9.7, 16.7]) posteSimples(x, GRADE_Z + 2.0, -1);
  for (const x of [-7.8, -0.8, 6.2, 13.2]) posteSimples(x, GRADE_Z + 8.6, 1);
  poca(1.85, GRADE_Z + 2.6, 2.2, 0.12);
  for (let i = 0; i < 7; i++) {   // casas ao longe (silhuetas)
    const h = 3 + r() * 3, l = 3 + r() * 3;
    caixa(l, h, 4, mat(i % 2 ? '#3c3f4a' : '#4a4652'), -10 + i * 3.6, h / 2, GRADE_Z + 14 + r() * 3);
  }

  // ---------- Cantos escurecidos (rodapé e teto) e beirada do piso ----------
  const degrade = texturaDegrade();
  const faixa = (l, a, x, y, z, ry, rx = 0, op = 0.45, inverter = false) => {
    const t = degrade.clone(); t.needsUpdate = true; if (inverter) { t.repeat.set(1, -1); t.offset.set(0, 1); t.wrapT = THREE.RepeatWrapping; }
    const f = new THREE.Mesh(new THREE.PlaneGeometry(l, a), new THREE.MeshBasicMaterial({ color: '#000', alphaMap: t, transparent: true, opacity: op, depthWrite: false }));
    f.position.set(x, y, z); f.rotation.set(rx, ry, 0, 'YXZ'); return add(f);
  };
  // paredes: (comprimento, centro x, z, rotação y, normal para dentro)
  for (const [l, x, z, ry, nx, nz] of [[W, cx, SALA.z0, 0, 0, 1], [D, SALA.x0, cz, Math.PI / 2, 1, 0], [D, SALA.x1, cz, -Math.PI / 2, -1, 0]]) {
    faixa(l, 0.5, x + nx * 0.006, 0.25, z + nz * 0.006, ry, 0, 0.42, true);                       // rodapé
    faixa(l, 0.45, x + nx * 0.006, SALA.teto - 0.225, z + nz * 0.006, ry, 0, 0.32, false);        // junto ao teto
    faixa(l, 0.6, x + nx * 0.3, 0.003, z + nz * 0.3, ry, -Math.PI / 2, 0.35, false);               // piso junto à parede
  }

  // ---------- Objetos de cena ----------
  // TV de parede com chiado
  const tvCanvas = document.createElement('canvas'); tvCanvas.width = 160; tvCanvas.height = 96;
  const tvTex = new THREE.CanvasTexture(tvCanvas); tvTex.colorSpace = THREE.SRGBColorSpace;
  const tv = new THREE.Group(); tv.position.set(1.55, 2.25, SALA.z0 + 0.08); add(tv);
  tv.add(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.42, 0.06), mat('#141518')));
  const telaTv = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.36), new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false })); telaTv.position.z = 0.032; tv.add(telaTv);
  const suporte = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), mat('#2a2b30')); suporte.position.z = -0.06; tv.add(suporte);
  halo('#9fb8ff', 1.2, 1.55, 2.25, SALA.z0 + 0.2, 0.18);
  function chiado(t) {
    const g = tvCanvas.getContext('2d'), img = g.createImageData(160, 96), rr = rng(Math.floor(t * 24) + 5);
    for (let i = 0; i < img.data.length; i += 4) { const v = 40 + rr() * 170; img.data[i] = v * 0.85; img.data[i + 1] = v * 0.9; img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); tvTex.needsUpdate = true;
  }
  // ventilador de parede
  const vent = new THREE.Group(); vent.position.set(SALA.x1 - 0.18, 2.35, 0.35); vent.rotation.y = -Math.PI / 2 - 0.4; add(vent);
  vent.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 12).rotateX(Math.PI / 2), mat('#2b2d33')));
  const grade2 = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.008, 6, 32), mat('#c9cdd2')); grade2.position.z = 0.1; vent.add(grade2);
  const helice = new THREE.Group(); helice.position.z = 0.09; vent.add(helice);
  for (let i = 0; i < 3; i++) { const pa = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.01), mat('#2f6fb0')); pa.position.y = 0.12; const gp = new THREE.Group(); gp.rotation.z = (i * Math.PI * 2) / 3; gp.add(pa); helice.add(gp); }
  // cadeira de plástico, isopor, lixeira
  const cadeira = new THREE.Group(); cadeira.position.set(1.55, 0, 0.45); cadeira.rotation.y = -2.2; add(cadeira);
  const plast = mat('#eeeeea');
  const assentoC = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42), plast); assentoC.position.y = 0.44; cadeira.add(assentoC);
  const encosto = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.04), plast); encosto.position.set(0, 0.66, -0.2); encosto.rotation.x = -0.15; cadeira.add(encosto);
  for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.44, 8), plast); p.position.set(lx, 0.22, lz); cadeira.add(p); }
  comoObjeto(cadeira);
  comoObjeto(caixa(0.5, 0.36, 0.34, mat('#f3f1ea'), 1.85, 0.18, 0.75));
  comoObjeto(caixa(0.52, 0.05, 0.36, mat('#2d6fb5'), 1.85, 0.385, 0.75));
  const lixo = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.5, 18), mat('#5b6168')); lixo.position.set(-1.6, 0.25, -1.55); add(comoObjeto(lixo));
  // expositor de cigarros no balcão (caixinhas genéricas coloridas)
  const expo = new THREE.Group(); expo.position.set(BALCAO.x0 + 0.25, BALCAO.altura, BALCAO.z0 + 0.12); add(expo);
  expo.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.14), new THREE.MeshBasicMaterial({ color: '#cfe7ff', transparent: true, opacity: 0.18, depthWrite: false })).translateY(0.17));
  const coresMaco = ['#c62828', '#f2f2f2', '#1f4e8c', '#d4a017', '#2e7d32'];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const mc = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.03), mat(coresMaco[(i + j * 2) % coresMaco.length])); mc.position.set(-0.13 + i * 0.087, 0.06 + j * 0.105, 0); expo.add(mc); }
  // placa de menores e cartaz de pagode
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), materialChapado('#ffffff', { volume: false, map: texturaTexto([
    ['PROIBIDA A VENDA DE BEBIDAS', '800 30px sans-serif', '#fff'], ['ALCOÓLICAS PARA MENORES', '800 30px sans-serif', '#fff'], ['DE 18 ANOS', '900 40px sans-serif', '#ffe14a']], { largura: 512, altura: 256, fundo: '#b71c1c' }) }));
  placa.position.set(SALA.x0 + 0.012, 2.3, 0.55); placa.rotation.y = Math.PI / 2; add(placa);
  const pagode = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), materialChapado('#ffffff', { volume: false, map: texturaTexto([
    ['PAGODE', '900 70px sans-serif', '#ffe14a'], ['DE SEXTA', '900 52px sans-serif', '#fff'], ['22H', '900 80px sans-serif', '#ff7a1a']], { largura: 360, altura: 500, fundo: '#3a1458' }) }));
  pagode.position.set(SALA.x1 - 0.012, 1.7, -2.1); pagode.rotation.y = -Math.PI / 2; add(pagode);
  // manchas no piso e na calçada
  const mancha = (x, z, rx, rz, op) => { const mm = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: '#2a2016', transparent: true, opacity: op, depthWrite: false })); mm.rotation.x = -Math.PI / 2; mm.scale.set(rx, rz, 1); mm.position.set(x, 0.003, z); return add(mm); };
  for (let i = 0; i < 9; i++) mancha(-1.8 + r() * 3.6, -2.6 + r() * 3.0, 0.08 + r() * 0.25, 0.06 + r() * 0.18, 0.06 + r() * 0.08);
  for (let i = 0; i < 6; i++) mancha(-4 + r() * 8, GRADE_Z + 0.3 + r() * 1.7, 0.15 + r() * 0.4, 0.1 + r() * 0.3, 0.12 + r() * 0.1);

  // ---------- Animação do cenário (determinística) ----------
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const corTubo = new THREE.Color('#f2fff8');
  // piscar: 0 = luz firme; 1 = falhando muito. Devolve o fator de luz (1 = normal).
  function fatorLuz(t, piscar) {
    if (piscar <= 0) return 1;
    const b = Math.floor(t * 18), h = hash(b), h2 = hash(b + 999);
    if (h < 0.18 * piscar) return 0.12 + h2 * 0.2;          // apagão curto
    if (h < 0.35 * piscar) return 0.55 + h2 * 0.3;          // tremida
    return 1;
  }
  function atualizar(t, { piscar = 0, luzes = null, neonFalha = 0.15 } = {}) {
    const f = fatorLuz(t, piscar);
    for (const tb of tubos) { tb.tubo.material.color.copy(corTubo).multiplyScalar(0.25 + 0.75 * f); if (tb.halo.isSprite) tb.halo.material.opacity = 0.3 * f; tb.luz.intensity = tb.base * f; }
    helice.rotation.z = -t * 14; vent.rotation.y = -Math.PI / 2 - 0.4 + Math.sin(t * 0.6) * 0.5;
    chiado(t);
    if (luzes) {
      luzes.sol.intensity = luzes._base.sol * f;
      luzes.ambiente.intensity = luzes._base.amb * (0.25 + 0.75 * f);
    }
    const fn = hash(Math.floor(t * 9) + 77) < neonFalha ? 0.35 : 1;
    neon.material.opacity = fn; neonHalo.material.opacity = 0.35 * fn; luzNeon.intensity = 1.6 * fn;
    const fv = hash(Math.floor(t * 7) + 31) < 0.06 ? 0.4 : 1; placaVerde.material.opacity = fv; haloVerde.material.opacity = 0.4 * fv; luzVerde.intensity = 2.2 * fv;
    return f;
  }

  // apagão: lâmpadas desligadas (só ficam neon, geladeiras, TV e o poste)
  function apagarLampadas() { for (const tb of tubos) { tb.tubo.material.color.setRGB(0.06, 0.06, 0.07); if (tb.halo.isSprite) tb.halo.material.opacity = 0; tb.luz.intensity = 0; } }

  return {
    raiz, marcas: MARCAS, atualizar, apagarLampadas,
    limites: { ...SALA, margem: 0.25 },          // a câmera de 3ª pessoa não sai da sala
    luzesExtras: [luzPoste],
    pos: { nevoaCor: '#04050a', nevoaIni: 6, nevoaFim: 26, nevoaMax: 0.97,      // a rua some no escuro (postes viram pontos)
           tomSombras: '#1d3a5f', tomLuzes: '#f4f1ea', tomForca: 0.45, contraste: 0.08 },
  };
}

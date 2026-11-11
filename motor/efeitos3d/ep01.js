// Efeitos do episódio 1 da terra, declarados no roteiro ("efeitos": [{ tipo, inicio, fim, … }]).
// EFEITOS[tipo].criar(cena) → { atualizar(t, e, ctx) → { objeto? } }   (e = efeito com de/ate absolutos)
// ctx: { ponto(nome|[x,y,z]), mao(ator, lado), pes(ator), peito(ator), evento(ator, nome), camera, cen }
// Tudo depende só do tempo: determinístico.
import * as THREE from 'three';
import { materialToon } from '../visual/estilo.js';
import { Texturas } from '../visual/texturas.js';
import { criarPoderTerra, criarRachaduraChao, criarImpactoTerra } from './terra.js';

const frac = (x) => x - Math.floor(x);
const ruido = (i) => frac(Math.sin(i * 91.7 + 13.1) * 43758.5453);
const suave = (k) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const prog = (t, e) => (t - e.de) / Math.max(0.05, e.ate - e.de);

function graos(cena, n, cor = '#8B5E3C') {
  const g = new THREE.Group(); cena.add(g);
  const m = materialToon(cor, { gMin: 0.75 });
  const lista = [...Array(n)].map((_, i) => { const me = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 0), m); me.castShadow = true; g.add(me); return me; });
  return { g, lista };
}

export const EFEITOS = {
  // impacto pequeno num ponto: pedrinhas, poeira e anel (tapa, pisão)
  impacto: { criar(cena) {
    const imp = criarImpactoTerra(); cena.add(imp.grupo); imp.grupo.scale.setScalar(1);
    return { atualizar(t, e, ctx) { const p = ctx.ponto(e.ponto); imp.grupo.scale.setScalar(e.escala || 0.6); imp.atualizar((t - e.de), [p[0] / (e.escala || 0.6), p[1] / (e.escala || 0.6), p[2] / (e.escala || 0.6)]); return { objeto: p }; } };
  } },
  // terra do vaso sobe em grãos e vira uma esfera pequena flutuando acima dele
  terra_vaso: { criar(cena) {
    const fx = criarPoderTerra(); cena.add(fx.grupo);
    const gr = graos(cena, 40);
    return { atualizar(t, e, ctx) {
      const k = prog(t, e), vaso = ctx.ponto(e.ponto || 'vaso'), alvo = [vaso[0] + 0.12, vaso[1] + 0.32, vaso[2] + 0.05];
      gr.g.visible = k > 0 && k < 1.3;
      gr.lista.forEach((m, i) => {
        const f = frac(k * 1.4 + ruido(i)), a = ruido(i + 3) * Math.PI * 2 + f * 5, r = 0.09 * (1 - f) + 0.02;
        const p = lerp3(vaso, alvo, suave(f));
        m.position.set(p[0] + Math.cos(a) * r, p[1], p[2] + Math.sin(a) * r);
        m.scale.setScalar(0.012 * (1 - f * 0.5) * (k < 1 ? 1 : Math.max(0, 1 - (k - 1) * 3))); m.rotation.set(t * 4 + i, t * 3, 0);
      });
      fx.atualizar(t, { prog: (k - 0.35) / 0.65, centro: alvo, raio: 0.07, camera: ctx.camera });
      return { objeto: alvo };
    } };
  } },
  // esfera acima da palma de um ator; o raio vai de raio[0] a raio[1] na janela do efeito
  esfera_mao: { criar(cena) {
    const fx = criarPoderTerra(); cena.add(fx.grupo);
    return { atualizar(t, e, ctx) {
      const k = suave(prog(t, e)), [r0, r1] = e.raio || [0.07, 0.07], r = r0 + (r1 - r0) * k;
      const c = e.ambas ? ctx.entreMaos(e.ator, r) : ctx.acimaMao(e.ator, e.lado || 'd', r);
      fx.atualizar(t, { prog: e.aparece ? (t - e.de) / 0.5 : 1, centro: c, raio: r, camera: ctx.camera });
      return { objeto: c };
    } };
  } },
  // esfera dá uma volta pelo quarto (passa perto da câmera) e volta para a mão
  esfera_voa: { criar(cena) {
    const fx = criarPoderTerra(); cena.add(fx.grupo);
    return { atualizar(t, e, ctx) {
      const k = Math.min(1, Math.max(0, prog(t, e))), mao = ctx.acimaMao(e.ator, e.lado || 'd', 0.08);
      const c = e.centro || [0, 1.5, -0.4], R = e.raioVolta || 1.15, a = -Math.PI / 2 + k * Math.PI * 2;
      const voo = [c[0] + Math.cos(a) * R, c[1] + Math.sin(k * Math.PI * 2) * 0.25, c[2] + Math.sin(a) * R * 0.8];
      const ida = suave(k / 0.15), volta = suave((k - 0.85) / 0.15);
      const p = lerp3(lerp3(mao, voo, ida), mao, volta);
      fx.atualizar(t, { prog: 1, centro: p, raio: 0.08, camera: ctx.camera });
      return { objeto: p };
    } };
  } },
  // esfera cai no tapete e desmancha numa nuvem de poeira; fica um montinho de terra
  esfera_cai: { criar(cena) {
    const fx = criarPoderTerra(); cena.add(fx.grupo);
    const imp = criarImpactoTerra(); cena.add(imp.grupo);
    const monte = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), materialToon('#FFFFFF', { mapa: Texturas.terra(false), gMin: 0.7 }));
    monte.scale.set(0.22, 0.06, 0.18); monte.receiveShadow = true; cena.add(monte);
    let inicio = null;
    return { atualizar(t, e, ctx) {
      const chao = ctx.ponto(e.alvo || 'tapete'), dur = 0.45;
      if (!inicio || e._t0 !== e.de) { inicio = ctx.entreMaosEm(e.ator, e.raio || 0.18, e.de); e._t0 = e.de; }
      const u = t - e.de;
      if (u < dur) {
        const k = u / dur, p = lerp3(inicio, [chao[0], chao[1] + 0.12, chao[2]], k * k);
        fx.atualizar(t, { prog: 1, centro: p, raio: (e.raio || 0.18) * (1 - k * 0.3), camera: ctx.camera });
        monte.visible = false; imp.grupo.visible = false;
        return { objeto: p };
      }
      fx.grupo.visible = false;
      imp.atualizar(u - dur, chao);
      monte.visible = true; monte.position.set(chao[0], chao[1], chao[2]);
      const s = suave((u - dur) / 0.3); monte.scale.set(0.22 * s, 0.06 * s, 0.18 * s);
      return { objeto: chao };
    } };
  } },
  // rachadura que corre de um ponto a outro, abrindo em pedaços (brilha por dentro)
  rachadura_corre: { criar(cena) {
    const pedacos = [...Array(10)].map(() => { const r = criarRachaduraChao(); cena.add(r.grupo); return r; });
    return { atualizar(t, e, ctx) {
      const k = prog(t, e), a = ctx.ponto(e.de_ponto), b = ctx.ponto(e.para_ponto);
      pedacos.forEach((r, i) => {
        const f = i / (pedacos.length - 1), p = lerp3(a, b, f), ki = (k * 1.2 - f) / 0.25;
        r.atualizar(ki, [p[0] + (ruido(i) - 0.5) * 0.3, p[2]], (e.largura || 1.6) * (1 - f * 0.4), (p[1] || 0) + 0.004);
      });
      return { objeto: lerp3(a, b, Math.min(1, k * 1.2)) };
    } };
  } },
  // onda de terra embaixo dos pés de um ator (acompanha o corpo dele): monte curvo, crista, respingos e rastro
  onda_terra: { criar(cena) {
    const mat = materialToon('#FFFFFF', { mapa: Texturas.terra(false), gMin: 0.66 });
    const crista = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), mat); crista.castShadow = true; cena.add(crista);
    const rastro = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, false, 0, Math.PI), mat); cena.add(rastro);
    const gr = graos(cena, 50, '#B07A4E');
    const pedras = graos(cena, 14, '#7A7480');
    return { atualizar(t, e, ctx) {
      const pes = ctx.pes(e.ator), k = prog(t, e);
      const vis = k >= 0 && k <= 1.05; crista.visible = rastro.visible = gr.g.visible = pedras.g.visible = vis;
      if (!vis) return {};
      const h = 0.48 * suave(k * 6);
      crista.position.set(pes[0], 0.12, pes[2] + 0.1); crista.scale.set(0.8, h + 0.05, 1.1);
      rastro.position.set(pes[0], 0.08, pes[2] - 1.6); rastro.rotation.set(Math.PI / 2, 0, Math.PI / 2); rastro.scale.set(0.45 * suave(k * 4), 3.2, 0.25);
      gr.lista.forEach((m, i) => {
        const f = frac(t * 1.6 + ruido(i)), a = (ruido(i + 5) - 0.5) * 2.4;
        m.position.set(pes[0] + Math.sin(a) * (0.5 + f * 0.6), 0.25 + h + f * 0.6 - f * f * 1.2, pes[2] - f * 1.2);
        m.scale.setScalar(0.025 * (1 - f)); m.rotation.set(t * 5 + i, t * 3, 0);
      });
      pedras.lista.forEach((m, i) => {
        const f = frac(t * 1.1 + ruido(i + 40)), a = (ruido(i + 50) - 0.5) * 2;
        m.position.set(pes[0] + a * 0.9, 0.15 + f * 0.7 - f * f * 0.9, pes[2] + 0.4 - f * 1.5); m.scale.setScalar(0.05 * (1 - f * 0.5)); m.rotation.set(t * 2 + i, i, t);
      });
      return { objeto: pes };
    } };
  } },
  // coluna de terra sobe do bueiro trazendo o celular em cima
  coluna_terra: { criar(cena) {
    const mat = materialToon('#FFFFFF', { mapa: Texturas.terra(true), gMin: 0.66 });
    if (Texturas.rachaduras()) { mat.emissiveMap = Texturas.rachaduras(); mat.emissive = new THREE.Color('#FFB347'); }
    const blocos = [...Array(9)].map((_, i) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), mat); m.castShadow = true; cena.add(m); m.userData.i = i; return m; });
    const imp = criarImpactoTerra(); cena.add(imp.grupo);
    const cel = criarCelular(cena);
    return { atualizar(t, e, ctx) {
      const b = ctx.ponto(e.ponto || 'bueiro'), k = prog(t, e), alt = (e.altura || 1.1) * suave(k * 1.6);
      blocos.forEach((m, i) => {
        const f = i / (blocos.length - 1);
        m.visible = k > 0 && f * (e.altura || 1.1) <= alt + 0.05;
        m.position.set(b[0] + Math.sin(i * 2.1 + t * 2) * 0.03, Math.min(f * (e.altura || 1.1), alt), b[2] + Math.cos(i * 1.7) * 0.03);
        m.scale.setScalar(0.17 - f * 0.06); m.rotation.set(i + t, i * 2, 0);
      });
      mat.emissiveIntensity = 0.8 + 0.4 * Math.sin(t * 8);
      imp.atualizar(t - e.de, b);
      const topo = [b[0], alt + 0.12, b[2]];
      cel.grupo.visible = e.celular !== false && k > 0.2; cel.grupo.position.set(...topo); cel.grupo.rotation.set(-0.3, t * 1.5, 0.2); cel.sujo(1);
      return { objeto: topo };
    } };
  } },
  // linhas de energia âmbar saindo da mão do ator até um ponto (fluxo de bolinhas brilhantes numa curva)
  energia: { criar(cena) {
    const m = new THREE.MeshBasicMaterial({ color: '#FFB347', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const bolas = [...Array(60)].map(() => { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), m); cena.add(b); return b; });
    return { atualizar(t, e, ctx) {
      const a = ctx.mao(e.ator, e.lado || 'd'), b = ctx.ponto(e.ponto || 'bueiro'), k = prog(t, e);
      const meio = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 0.5, (a[2] + b[2]) / 2];
      bolas.forEach((bo, i) => {
        const linha = i % 3, f = frac(t * 1.3 + i / bolas.length * 3), u = f;
        const p = lerp3(lerp3(a, meio, u), lerp3(meio, b, u), u);
        p[0] += Math.sin(u * 9 + linha * 2) * 0.05 * (linha - 1); p[1] += Math.cos(u * 7 + linha) * 0.04;
        bo.position.set(...p); bo.scale.setScalar(0.012 * (k > 0 && k < 1 ? 1 : 0) * (1 - Math.abs(u - 0.5)));
      });
      return {};
    } };
  } },
  // luz âmbar que sobe pelas rachaduras e ilumina o ator por baixo
  luz_baixo: { criar(cena) {
    const r = criarRachaduraChao(); cena.add(r.grupo);
    const r2 = criarRachaduraChao(); cena.add(r2.grupo);
    const luz = new THREE.PointLight('#FF9A3C', 0, 3.5, 1.2); cena.add(luz);
    const mFeixe = new THREE.MeshBasicMaterial({ map: Texturas.halo(), color: '#FFB347', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const feixes = [...Array(5)].map(() => { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.4), mFeixe); cena.add(f); return f; });
    return { atualizar(t, e, ctx) {
      const p = ctx.pes(e.ator), k = suave(prog(t, e) * 1.5);
      r.atualizar(k, [p[0] + 0.3, p[2] + 0.3], 3.0, 0.006); r2.atualizar(k, [p[0] - 0.4, p[2] - 0.2], 2.4, 0.007);
      luz.position.set(p[0], 0.1, p[2] + 0.3); luz.intensity = 7 * k * (0.9 + 0.1 * Math.sin(t * 9));
      feixes.forEach((f, i) => {
        f.position.set(p[0] + (ruido(i) - 0.5) * 1.6, 1.1, p[2] + (ruido(i + 9) - 0.5) * 1.2);
        if (ctx.camera) f.quaternion.copy(ctx.camera.quaternion);
        f.scale.set(0.6 + ruido(i + 3) * 0.6, k * (0.8 + 0.2 * Math.sin(t * 3 + i)), 1); f.material.opacity = 0.35 * k;
      });
      return { objeto: [p[0], 1.3, p[2]] };
    } };
  } },
  // poeira e pedrinhas caindo do teto (tremor dentro de casa)
  poeira_teto: { criar(cena) {
    const gr = graos(cena, 70, '#B5A48E');
    return { atualizar(t, e, ctx) {
      const k = prog(t, e), c = ctx.ponto(e.centro || [0, 2.65, -0.6]);
      gr.g.visible = k > 0 && k < 1.4;
      gr.lista.forEach((m, i) => {
        const f = frac((t - e.de) * 0.9 + ruido(i)), x = c[0] + (ruido(i + 1) - 0.5) * 3.2, z = c[2] + (ruido(i + 2) - 0.5) * 2.6;
        m.position.set(x, c[1] - f * f * 2.7, z); m.scale.setScalar(0.008 + ruido(i + 3) * 0.012); m.rotation.set(t * 3 + i, i, t);
      });
      return {};
    } };
  } },
  // copo de café na mão do ator; quando ele solta (evento "solta" da atuação), cai, gira e espirra no chão
  cafe: { criar(cena) {
    const copo = new THREE.Group(); cena.add(copo);
    const mc = materialToon('#F4EFE6', { gMin: 0.75 });
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.11, 16), mc); corpo.castShadow = true; copo.add(corpo);
    const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.015, 16), materialToon('#7A5236', { gMin: 0.75 })); tampa.position.y = 0.06; copo.add(tampa);
    const cinta = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.037, 0.04, 16), materialToon('#B5654A', { gMin: 0.75 })); copo.add(cinta);
    const poca = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#5A3A22', transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    poca.rotation.x = -Math.PI / 2; cena.add(poca);
    const gotas = graos(cena, 18, '#6E4A2E');
    let p0 = null;
    return { atualizar(t, e, ctx) {
      const solta = ctx.evento(e.ator, 'solta') ?? e.de + 0.5;
      const mao = ctx.mao(e.ator, 'd');
      const chao = e.chao === undefined ? (ctx.pes(e.ator)[1] || 0) : e.chao;
      if (t < solta) { copo.position.set(mao[0], mao[1] + 0.02, mao[2] + 0.03); copo.rotation.set(0, 0, 0); p0 = null; poca.visible = false; gotas.g.visible = false; return { objeto: mao }; }
      if (!p0) p0 = ctx.maoEm(e.ator, 'd', solta);
      const u = t - solta, tq = Math.sqrt(Math.max(0, (p0[1] - chao - 0.05) / 4.9));
      if (u < tq) { copo.position.set(p0[0] + u * 0.25, p0[1] - 4.9 * u * u, p0[2] + u * 0.2); copo.rotation.set(u * 6, 0, u * 4); return { objeto: copo.position.toArray() }; }
      const cx = p0[0] + tq * 0.25, cz = p0[2] + tq * 0.2, d = u - tq;
      copo.position.set(cx + 0.06, chao + 0.04, cz); copo.rotation.set(Math.PI / 2, 0, 0.6);
      poca.visible = true; poca.position.set(cx, chao + 0.003, cz); poca.scale.setScalar(0.04 + 0.22 * suave(d / 0.4));
      gotas.g.visible = d < 0.6;
      gotas.lista.forEach((m, i) => { const a = ruido(i) * Math.PI * 2, v = 0.6 + ruido(i + 4); m.position.set(cx + Math.cos(a) * v * d, chao + Math.max(0, 1.4 * d - 4.9 * d * d), cz + Math.sin(a) * v * d); m.scale.setScalar(0.012); });
      return { objeto: [cx, chao + 0.05, cz] };
    } };
  } },
  // celular na mão do ator; no evento "solta" voa em arco e some no bueiro. modo "sujo": na mão, sujo de terra
  celular: { criar(cena) {
    const cel = criarCelular(cena);
    let p0 = null;
    return { atualizar(t, e, ctx) {
      const mao = ctx.mao(e.ator, 'd');
      if (e.modo === 'sujo') { cel.grupo.visible = true; cel.grupo.position.set(mao[0], mao[1] + 0.03, mao[2] + 0.06); cel.grupo.rotation.set(-0.9, 0, 0); cel.sujo(1); return { objeto: mao }; }
      const solta = ctx.evento(e.ator, 'solta') ?? e.de + 0.4, b = ctx.ponto(e.ponto || 'bueiro');
      cel.sujo(0);
      if (t < solta) { cel.grupo.visible = true; cel.grupo.position.set(mao[0], mao[1] + 0.03, mao[2] + 0.05); cel.grupo.rotation.set(-0.9, 0, 0); p0 = null; return { objeto: mao }; }
      if (!p0) p0 = ctx.maoEm(e.ator, 'd', solta);
      const u = (t - solta) / 0.6;
      if (u >= 1) { cel.grupo.visible = false; return { objeto: b }; }
      const p = lerp3(p0, [b[0], b[1] - 0.05, b[2]], u); p[1] += 0.6 * 4 * u * (1 - u);
      cel.grupo.visible = true; cel.grupo.position.set(...p); cel.grupo.rotation.set(u * 10, u * 4, u * 7);
      return { objeto: p };
    } };
  } },
};

// celular simples: corpo escuro, tela que brilha, sujeira de terra (opcional)
function criarCelular(cena) {
  const grupo = new THREE.Group(); cena.add(grupo);
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.01), materialToon('#2A2632', { gMin: 0.75 })); corpo.castShadow = true; grupo.add(corpo);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshBasicMaterial({ color: '#9FD2EA' })); tela.position.z = 0.0055; grupo.add(tela);
  const sujeira = [...Array(5)].map((_, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.012 + ruido(i) * 0.01, 10), new THREE.MeshBasicMaterial({ color: '#8B5E3C' }));
    m.position.set((ruido(i + 1) - 0.5) * 0.05, (ruido(i + 2) - 0.5) * 0.11, 0.006); grupo.add(m); return m; });
  return { grupo, sujo(k) { sujeira.forEach((m) => { m.visible = k > 0.5; }); } };
}

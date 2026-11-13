// Estilo chapado (toon) para three.js.
//
// CONTA DA CALIBRAÇÃO (three 0.186, MeshToonMaterial):
//   cor_final = cor * ( Σ luz_direta * rampa(dotNL) * sombra  +  ambiente ) / π
//   (BRDF_Lambert = cor/π; a rampa é lida em u = dotNL*0.5 + 0.5.)
// Para uma superfície virada para a luz principal (dotNL = 1 -> rampa = 1,0) queremos cor_final = cor:
//   principal + ambiente = π
// Dia:   sol 2,0  + ambiente π-2,0 = 1,1416  (≈ 1,2 do pedido; 1,2 daria +1,9% de brilho)
// Noite: lua 0,30 + ambiente 0,30 + lanterna π-0,60 = 2,5416  -> cor exata dentro do facho;
//        fora do facho sobram (0,30*rampa + 0,30)/π ≈ 17-19% da cor: escuro, mas legível.
// A rampa vai de 0,8 (costas da luz) a 1,0 (de frente): variação pequena, cor parece lisa.
// Tone mapping desligado (NoToneMapping) para a conta valer.
import * as THREE from 'three';

export const RAMPA_MIN = 0.8;
export const RAMPA_MAX = 1.0;

let _rampa;
export function rampa() {
  if (_rampa) return _rampa;
  const n = 32, d = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const v = Math.round(255 * (RAMPA_MIN + (RAMPA_MAX - RAMPA_MIN) * (i / (n - 1))));
    d.set([v, v, v, 255], i * 4);
  }
  _rampa = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat);
  _rampa.minFilter = _rampa.magFilter = THREE.LinearFilter;
  _rampa.generateMipmaps = false;
  _rampa.colorSpace = THREE.NoColorSpace;
  _rampa.needsUpdate = true;
  return _rampa;
}

// Uniforms do "volume", compartilhados por todos os materiais (ajuste global por cena).
export const VOLUME = {
  uVolBaixo: { value: 0.22 },                      // quanto escurece o que aponta para baixo
  uRimCor: { value: new THREE.Color('#ffffff') },  // contorno de luz nas bordas
  uRimForca: { value: 0.0 },
  uRimPot: { value: 3.0 },
};

function aplicarVolume(m) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, VOLUME);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNormalMundo;')
      .replace('#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nvNormalMundo = normalize( mat3( modelMatrix ) * objectNormal );');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vNormalMundo;
uniform float uVolBaixo; uniform vec3 uRimCor; uniform float uRimForca; uniform float uRimPot;`)
      .replace('#include <opaque_fragment>', `
{
  float baixo = smoothstep( 0.0, -1.0, normalize( vNormalMundo ).y );
  outgoingLight *= 1.0 - uVolBaixo * baixo;
  float rim = pow( 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) ), uRimPot );
  outgoingLight += uRimCor * ( rim * uRimForca );
}
#include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'chapado-volume';
}

// Material chapado. volume=false desliga o escurecimento de baixo e o contorno.
export function materialChapado(cor, { volume = true, ...extra } = {}) {
  const m = new THREE.MeshToonMaterial({ color: cor, gradientMap: rampa(), ...extra });
  if (volume) aplicarVolume(m);
  return m;
}

// Sombras: personagens e objetos projetam mas não recebem; só o chão recebe.
export function comoObjeto(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return obj;
}
export function comoChao(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
  return obj;
}

export function prepararRenderer(renderer) {
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

// Luzes calibradas. 'dia': sol + ambiente. 'noite': lua + ambiente + lanterna presa à câmera (1ª pessoa).
export const LUZES = {
  dia:   { principal: 2.0, ambiente: Math.PI - 2.0, corAmbiente: '#ffffff', corPrincipal: '#ffffff', sombra: 0.55 },
  noite: { principal: 0.30, ambiente: 0.30, corAmbiente: '#c4ccff', corPrincipal: '#b8c6ff', sombra: 0.0,
           lanterna: Math.PI - 0.60, corLanterna: '#ffffff', sombraLanterna: 0.8 },
};

export function criarLuzes(cena, nome = 'dia', { camera, raioSombra = 8 } = {}) {
  const p = LUZES[nome];
  if (!p) throw new Error(`Luz "${nome}" não existe. Existentes: ${Object.keys(LUZES).join(', ')}`);
  const ambiente = new THREE.AmbientLight(p.corAmbiente, p.ambiente);
  const sol = new THREE.DirectionalLight(p.corPrincipal, p.principal);
  sol.position.set(3, 5, 4);
  if (p.sombra > 0) {
    sol.castShadow = true;
    sol.shadow.intensity = p.sombra;
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.radius = 3;
    sol.shadow.bias = -0.0005;
    const c = sol.shadow.camera;
    c.left = c.bottom = -raioSombra; c.right = c.top = raioSombra; c.near = 0.5; c.far = 40;
  }
  cena.add(ambiente, sol, sol.target);
  const luzes = { ambiente, sol, nome };
  if (p.lanterna) {
    if (!camera) throw new Error('Luz "noite" precisa da câmera (lanterna em 1ª pessoa).');
    const l = new THREE.SpotLight(p.corLanterna, p.lanterna, 18, 0.24, 0.6, 0);
    l.position.set(0.22, -0.28, 0.05);   // na mão direita, abaixo dos olhos
    l.target.position.set(0, -0.1, -4);
    l.castShadow = true;
    l.shadow.intensity = p.sombraLanterna;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.bias = -0.0008;
    l.shadow.camera.near = 0.2;
    camera.add(l, l.target);
    if (!camera.parent) cena.add(camera);
    luzes.lanterna = l;
  }
  return luzes;
}

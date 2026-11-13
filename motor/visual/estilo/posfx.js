// Pós-processo num passe só: névoa por profundidade, foco raso, vinheta e grão.
// A cena é desenhada num alvo HalfFloat (linear, MSAA 4x) com textura de profundidade;
// o passe final converte para sRGB. Com tudo zerado, a cor sai idêntica ao render direto.
import * as THREE from 'three';

export const POS_PADRAO = {
  nevoaCor: '#9fb3c8', nevoaIni: 12, nevoaFim: 45, nevoaMax: 0.85, // metros; fração máxima de névoa
  focoDist: 6, focoFaixa: 1.5, desfoqueMax: 10,  // m, m (nítido ±faixa), px por metro fora da faixa (limitado)
  desfoqueTeto: 14,                             // px máximo
  vinheta: 0.35, grao: 0.035,
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = `
#include <packing>
varying vec2 vUv;
uniform sampler2D tCor, tProf;
uniform float perto, longe, tempo;
uniform vec2 res;
uniform vec3 nevoaCor; uniform float nevoaIni, nevoaFim, nevoaMax;
uniform float focoDist, focoFaixa, desfoqueMax, desfoqueTeto, vinheta, grao;

float dist(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tProf, uv).x, perto, longe); }
vec3 corNevoa(vec2 uv, float d){
  float f = nevoaMax * smoothstep(nevoaIni, nevoaFim, d);
  return mix(texture2D(tCor, uv).rgb, nevoaCor, f);
}
float coc(float d){ return min(desfoqueTeto, max(0.0, abs(d - focoDist) - focoFaixa) * desfoqueMax); }
float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }

void main(){
  float dC = dist(vUv);
  vec3 c = corNevoa(vUv, dC);
  float r = coc(dC);
  if (r > 0.5) {
    vec3 soma = c; float peso = 1.0;
    const int N = TAPS;
    for (int i = 0; i < N; i++) {
      float fi = float(i);
      float ri = r * sqrt((fi + 0.5) / float(N));
      float a = fi * 2.39996323;
      vec2 uv = vUv + vec2(cos(a), sin(a)) * ri / res;
      float dS = dist(uv);
      float w = clamp(coc(dS) - ri + 1.0, 0.0, 1.0);   // amostra nítida não vaza para trás
      soma += corNevoa(uv, dS) * w; peso += w;
    }
    c = soma / peso;
  }
  vec2 q = vUv - 0.5; q.x *= res.x / res.y;
  c *= 1.0 - vinheta * smoothstep(0.25, 0.85, length(q) * 1.25);
  vec4 o = linearToOutputTexel(vec4(c, 1.0));
  o.rgb += (hash(vUv * res + fract(tempo * 7.31) * 113.0) - 0.5) * grao;
  gl_FragColor = vec4(o.rgb, 1.0);
}`;

export function criarPos(renderer, largura, altura, params = {}, { msaa = 4, taps = 16, tipo = 'half' } = {}) {
  const prof = new THREE.DepthTexture(largura, altura);
  const alvo = new THREE.WebGLRenderTarget(largura, altura, {
    type: tipo === 'half' ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: msaa, depthTexture: prof, colorSpace: THREE.LinearSRGBColorSpace,
  });
  const p = { ...POS_PADRAO, ...params };
  const u = {
    tCor: { value: alvo.texture }, tProf: { value: prof },
    perto: { value: 0.1 }, longe: { value: 100 }, tempo: { value: 0 },
    res: { value: new THREE.Vector2(largura, altura) },
  };
  for (const [k, v] of Object.entries(p)) u[k] = { value: k === 'nevoaCor' ? new THREE.Color(v) : v };
  const mat = new THREE.ShaderMaterial({ defines: { TAPS: taps }, uniforms: u, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const tela = new THREE.Mesh(geo, mat); tela.frustumCulled = false;
  const cenaTela = new THREE.Scene(); cenaTela.add(tela);
  const camTela = new THREE.Camera();

  return {
    params: u,
    definir(novos) { for (const [k, v] of Object.entries(novos)) { if (k === 'nevoaCor') u[k].value.set(v); else u[k].value = v; } },
    render(cena, cam, t = 0) {
      u.perto.value = cam.near; u.longe.value = cam.far; u.tempo.value = t;
      renderer.setRenderTarget(alvo);
      renderer.render(cena, cam);
      renderer.setRenderTarget(null);
      renderer.render(cenaTela, camTela);
    },
  };
}

// Pós sem efeito nenhum (para verificar que o caminho não altera a cor).
export const POS_NEUTRO = { nevoaMax: 0, desfoqueMax: 0, vinheta: 0, grao: 0 };

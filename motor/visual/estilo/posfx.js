// Pós-processo em dois passes.
//  Passe 1 (linear, HalfFloat): névoa por profundidade + foco raso.
//  Passe 2 (tela): lente (curvatura olho de peixe + aberração cromática), vinheta, conversão sRGB,
//                  correção de cor (tingir preservando o brilho, saturação, contraste) e grão.
// A cena é desenhada num alvo HalfFloat (MSAA 4x) com textura de profundidade.
// Com tudo zerado, a cor sai idêntica ao render direto (teste de calibração).
import * as THREE from 'three';

export const POS_PADRAO = {
  nevoaCor: '#9fb3c8', nevoaIni: 12, nevoaFim: 45, nevoaMax: 0.85, // metros; fração máxima de névoa
  focoDist: 6, focoFaixa: 1.5, desfoqueMax: 10,  // m, m (nítido ±faixa), px por metro fora da faixa (limitado)
  desfoqueTeto: 14,                             // px máximo
  vinheta: 0.35, grao: 0.035,
  // lente
  curvatura: 0,      // > 0 = olho de peixe (linhas retas curvam para fora nas bordas)
  aberracao: 0,      // separação vermelho/azul nas bordas (fração da tela)
  // cor: tinge preservando o brilho (sombras → tomSombras, luzes → tomLuzes), saturação e contraste
  tomSombras: '#1d3a5f', tomLuzes: '#ffd9a8', tomForca: 0, saturacao: 1, contraste: 0,
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG1 = `
#include <packing>
varying vec2 vUv;
uniform sampler2D tCor, tProf;
uniform float perto, longe;
uniform vec2 resInt;
uniform vec3 nevoaCor; uniform float nevoaIni, nevoaFim, nevoaMax;
uniform float focoDist, focoFaixa, desfoqueMax, desfoqueTeto;

float dist(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tProf, uv).x, perto, longe); }
vec3 corNevoa(vec2 uv, float d){
  float f = nevoaMax * smoothstep(nevoaIni, nevoaFim, d);
  return mix(texture2D(tCor, uv).rgb, nevoaCor, f);
}
float coc(float d){ return min(desfoqueTeto, max(0.0, abs(d - focoDist) - focoFaixa) * desfoqueMax); }

void main(){
  float dC = dist(vUv);
  vec3 c = corNevoa(vUv, dC);
  float r = coc(dC);
  if (r > 0.5) {
    vec3 soma = c; float peso = 1.0;
    const int N = TAPS;
    for (int i = 0; i < N; i++) {
      float fi = float(i);
      float ri = r * (resInt.y / 1920.0) * sqrt((fi + 0.5) / float(N));
      float a = fi * 2.39996323;
      vec2 uv = vUv + vec2(cos(a), sin(a)) * ri / resInt;
      float dS = dist(uv);
      float w = clamp(coc(dS) - ri + 1.0, 0.0, 1.0);   // amostra nítida não vaza para trás
      soma += corNevoa(uv, dS) * w; peso += w;
    }
    c = soma / peso;
  }
  gl_FragColor = vec4(c, 1.0);
}`;

const FRAG2 = `
varying vec2 vUv;
uniform sampler2D tCena;
uniform vec2 res;
uniform float tempo, vinheta, grao, curvatura, aberracao;
uniform vec3 tomSombras, tomLuzes; uniform float tomForca, saturacao, contraste;

float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }

void main(){
  vec2 asp = vec2(res.x / res.y, 1.0);
  vec2 d = (vUv - 0.5) * asp;
  float r2 = dot(d, d);
  vec3 c;
  if (curvatura > 0.0 || aberracao > 0.0) {
    float zoom = 1.0 + curvatura * 0.28;                     // aproxima para os cantos não saírem da imagem
    vec2 base = d * (1.0 + curvatura * r2) / zoom;
    vec2 uvR = base * (1.0 + aberracao * r2) / asp + 0.5;
    vec2 uvG = base / asp + 0.5;
    vec2 uvB = base * (1.0 - aberracao * r2) / asp + 0.5;
    c = vec3(texture2D(tCena, uvR).r, texture2D(tCena, uvG).g, texture2D(tCena, uvB).b);
  } else {
    c = texture2D(tCena, vUv).rgb;
  }
  vec2 q = vUv - 0.5; q.x *= res.x / res.y;
  c *= 1.0 - vinheta * smoothstep(0.25, 0.85, length(q) * 1.25);
  vec4 o = linearToOutputTexel(vec4(c, 1.0));
  if (tomForca > 0.0 || saturacao != 1.0 || contraste != 0.0) {    // cor em sRGB (perceptual)
    float lum = dot(o.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 tom = mix(tomSombras, tomLuzes, smoothstep(0.0, 0.9, lum));
    float lumTom = max(dot(tom, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
    o.rgb = mix(o.rgb, tom * (lum / lumTom), tomForca);              // tinge mantendo o brilho
    float l2 = dot(o.rgb, vec3(0.2126, 0.7152, 0.0722));
    o.rgb = mix(vec3(l2), o.rgb, saturacao);
    o.rgb = (o.rgb - 0.5) * (1.0 + contraste) + 0.5;
  }
  o.rgb += (hash(vUv * res + fract(tempo * 7.31) * 113.0) - 0.5) * grao;
  gl_FragColor = vec4(o.rgb, 1.0);
}`;

function telaCheia(mat) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false;
  const cena = new THREE.Scene(); cena.add(m); return cena;
}

// escala: resolução interna da cena (ex.: 0.75 = desenha em 75% e amplia no passe da lente — bem mais rápido).
export function criarPos(renderer, largura, altura, params = {}, { msaa = 4, taps = 16, tipo = 'half', escala = 1 } = {}) {
  const LI = Math.round(largura * escala), AI = Math.round(altura * escala);
  const prof = new THREE.DepthTexture(LI, AI);
  const tipoT = tipo === 'half' ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const alvo = new THREE.WebGLRenderTarget(LI, AI, { type: tipoT, samples: msaa, depthTexture: prof, colorSpace: THREE.LinearSRGBColorSpace });
  const alvo2 = new THREE.WebGLRenderTarget(LI, AI, { type: tipoT, depthBuffer: false, colorSpace: THREE.LinearSRGBColorSpace });
  const p = { ...POS_PADRAO, ...params };
  const COR = ['nevoaCor', 'tomSombras', 'tomLuzes'];
  const u = {
    tCor: { value: alvo.texture }, tProf: { value: prof }, tCena: { value: alvo2.texture },
    perto: { value: 0.1 }, longe: { value: 100 }, tempo: { value: 0 },
    res: { value: new THREE.Vector2(largura, altura) }, resInt: { value: new THREE.Vector2(LI, AI) },
  };
  for (const [k, v] of Object.entries(p)) u[k] = { value: COR.includes(k) ? new THREE.Color(v) : v };
  const opc = { uniforms: u, vertexShader: VERT, depthTest: false, depthWrite: false };
  const cena1 = telaCheia(new THREE.ShaderMaterial({ ...opc, defines: { TAPS: taps }, fragmentShader: FRAG1 }));
  const cena2 = telaCheia(new THREE.ShaderMaterial({ ...opc, fragmentShader: FRAG2 }));
  const camTela = new THREE.Camera();

  return {
    params: u,
    definir(novos) { for (const [k, v] of Object.entries(novos)) { if (COR.includes(k)) u[k].value.set(v); else u[k].value = v; } },
    render(cena, cam, t = 0) {
      u.perto.value = cam.near; u.longe.value = cam.far; u.tempo.value = t;
      renderer.setRenderTarget(alvo); renderer.render(cena, cam);
      renderer.setRenderTarget(alvo2); renderer.render(cena1, camTela);
      renderer.setRenderTarget(null); renderer.render(cena2, camTela);
    },
  };
}

// Pós sem efeito nenhum (para verificar que o caminho não altera a cor).
export const POS_NEUTRO = { nevoaMax: 0, desfoqueMax: 0, vinheta: 0, grao: 0, curvatura: 0, aberracao: 0, tomForca: 0, saturacao: 1, contraste: 0 };

// Visual "câmera verde" (referência do responsável): tom verde-água, lente olho de peixe, franja colorida.
export const VISUAL_VERDE = {
  tomSombras: '#03201a', tomLuzes: '#c9f3dc', tomForca: 0.36, saturacao: 1.05, contraste: 0.07,
  curvatura: 0.45, aberracao: 0.045, vinheta: 0.38, grao: 0.03,
};

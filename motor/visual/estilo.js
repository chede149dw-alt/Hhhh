// Estilo chapado (toon) do motor 3D — prompt 2 do PROMPTS_RECRIAR.
//
// CALIBRAÇÃO DA LUZ (por que a cor iluminada bate com a cor do material):
//   No three.js (luzes físicas), um material Lambert/Toon devolve, em espaço linear:
//     cor_final = cor * (1/π) * (sol * g(N·L) + ambiente)
//   onde g é o valor da rampa (gradientMap) do MeshToonMaterial.
//   Para a face iluminada sair exatamente com a cor escolhida: sol * g_max + ambiente = π.
//   Com sol = 2,0 e ambiente = 1,2:  g_max = (π − 1,2) / 2 = 0,9708.
//   A rampa vai de 0,80 (lado sem sol) a 0,9708 (lado com sol), com transição estreita:
//     lado sem sol: (2,0 × 0,80 + 1,2) / π = 0,891 → 11% mais escuro em linear (sombra suave, cor ainda lisa).
//   Sem tone mapping (NoToneMapping) e saída em sRGB, para a conta valer na tela.
import * as THREE from 'three';

export const LUZ = { sol: 2.0, ambiente: 1.2, gMin: 0.8 };
LUZ.gMax = (Math.PI - LUZ.ambiente) / LUZ.sol;

// rampa de 32 pixels: só entre gMin (80% por padrão) e 97% de brilho, transição estreita perto do terminador (N·L ≈ 0).
// Personagens podem usar gMin menor (sombra de desenho mais marcada); a face iluminada continua com a cor exata.
const rampas = new Map();
export function criarRampa(gMin = LUZ.gMin) {
  if (rampas.has(gMin)) return rampas.get(gMin);
  const n = 32, dados = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);                       // x = N·L * 0,5 + 0,5
    const k = Math.min(1, Math.max(0, (x - 0.47) / 0.08));
    const s = k * k * (3 - 2 * k);
    const v = Math.round((gMin + (LUZ.gMax - gMin) * s) * 255);
    dados.set([v, v, v, 255], i * 4);
  }
  const r = new THREE.DataTexture(dados, n, 1, THREE.RGBAFormat);
  r.minFilter = r.magFilter = THREE.LinearFilter;
  r.generateMipmaps = false;
  r.colorSpace = THREE.NoColorSpace;
  r.needsUpdate = true;
  rampas.set(gMin, r);
  return r;
}

// material chapado; o.volume: escurece a parte de baixo e acende a borda (contorno de luz)
export function materialToon(cor, o = {}) {
  const m = new THREE.MeshToonMaterial({ color: new THREE.Color(cor), gradientMap: criarRampa(o.gMin) });
  if (o.mapa) m.map = o.mapa;               // textura gerada por código (a cor do material multiplica a textura)
  if (o.volume) {
    const baixo = o.baixo === undefined ? 0.82 : o.baixo, borda = o.borda === undefined ? 0.35 : o.borda;
    const corBorda = new THREE.Color(o.corBorda || '#FFE7C2');
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uYmin = { value: o.yMin === undefined ? -0.5 : o.yMin };
      sh.uniforms.uYmax = { value: o.yMax === undefined ? 0.5 : o.yMax };
      sh.uniforms.uBaixo = { value: baixo };
      sh.uniforms.uBorda = { value: borda };
      sh.uniforms.uCorBorda = { value: corBorda };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vYobj;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvYobj = position.y;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vYobj;\nuniform float uYmin, uYmax, uBaixo, uBorda;\nuniform vec3 uCorBorda;')
        .replace('#include <opaque_fragment>', `
          float hY = smoothstep(uYmin, uYmax, vYobj);
          outgoingLight *= mix(uBaixo, 1.0, hY);
          float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 3.0);
          outgoingLight += uCorBorda * fres * uBorda;
          #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => `toon-vol-${baixo}-${borda}`;  // a rampa é textura: não muda o programa
  }
  return m;
}

// luzes calibradas: sol forte que projeta sombra + ambiente
export function criarLuzes(cena, o = {}) {
  const amb = new THREE.AmbientLight('#ffffff', LUZ.ambiente);
  const sol = new THREE.DirectionalLight('#ffffff', LUZ.sol);
  sol.position.set(...(o.direcao || [-4, 7, 5]));
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  const r = o.raioSombra || 6;
  Object.assign(sol.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: 30 });
  sol.shadow.bias = -0.0008;
  sol.shadow.radius = 4;  // borda da sombra macia
  cena.add(amb, sol, sol.target);
  return { amb, sol };
}

// chão que só recebe sombra (personagens e objetos não recebem)
export function criarChao(cena, cor, tamanho = 40) {
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho), materialToon(cor));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);
  return chao;
}

export function criarRenderer(W, H) {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H);
  r.toneMapping = THREE.NoToneMapping;
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild(r.domElement);
  return r;
}

// ---------- pós-processo: foco raso por profundidade, grão, vinheta (névoa via scene.fog) ----------
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = `
  uniform sampler2D tCor; uniform sampler2D tProf; uniform vec2 uRes;
  uniform float uNear, uFar, uFoco, uFaixa, uDesfoqueMax, uGrao, uVinheta, uT;
  varying vec2 vUv;
  float profLinear(vec2 uv){ float z = texture2D(tProf, uv).x * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); }
  void main(){
    float d = profLinear(vUv);
    float coc = clamp((abs(d - uFoco) - uFaixa) / max(uFoco, 0.001), 0.0, 1.0) * uDesfoqueMax; // raio do desfoque em px
    vec3 soma = texture2D(tCor, vUv).rgb; float peso = 1.0;
    if (coc > 0.5) {
      for (int i = 0; i < 24; i++) {
        float a = float(i) * 2.39996; float r = sqrt((float(i) + 0.5) / 24.0) * coc;
        vec2 o = vec2(cos(a), sin(a)) * r / uRes;
        soma += texture2D(tCor, vUv + o).rgb; peso += 1.0;
      }
    }
    vec3 c = soma / peso;
    // a cena foi desenhada em cor linear: converte para sRGB (tela) antes do grão e da vinheta
    c = linearToOutputTexel(vec4(c, 1.0)).rgb;
    // grão: muda a cada quadro, mas é função só de t (determinístico)
    float g = fract(sin(dot(vUv * uRes + vec2(uT * 61.0, uT * 37.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    c += g * uGrao;
    // vinheta
    vec2 q = vUv - 0.5; float v = smoothstep(0.85, 0.25, length(q * vec2(1.0, 0.75)));
    c *= mix(1.0 - uVinheta, 1.0, v);
    gl_FragColor = vec4(c, 1.0);
  }`;

export function criarPos(renderer, W, H) {
  const alvo = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
  alvo.depthTexture = new THREE.DepthTexture(W, H);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
    uniforms: { tCor: { value: alvo.texture }, tProf: { value: alvo.depthTexture }, uRes: { value: new THREE.Vector2(W, H) },
      uNear: { value: 0.1 }, uFar: { value: 100 }, uFoco: { value: 5 }, uFaixa: { value: 0.6 }, uDesfoqueMax: { value: 10 },
      uGrao: { value: 0.035 }, uVinheta: { value: 0.35 }, uT: { value: 0 } },
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const cenaPos = new THREE.Scene(); cenaPos.add(quad);
  const camPos = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    mat,
    render(cena, camera, o = {}) {
      if (o.desligado) { renderer.setRenderTarget(null); renderer.render(cena, camera); return; }
      const u = mat.uniforms;
      u.uNear.value = camera.near; u.uFar.value = camera.far;
      if (o.foco !== undefined) u.uFoco.value = o.foco;
      if (o.faixa !== undefined) u.uFaixa.value = o.faixa;
      if (o.desfoque !== undefined) u.uDesfoqueMax.value = o.desfoque;
      if (o.grao !== undefined) u.uGrao.value = o.grao;
      if (o.vinheta !== undefined) u.uVinheta.value = o.vinheta;
      u.uT.value = o.t || 0;
      renderer.setRenderTarget(alvo); renderer.render(cena, camera);
      renderer.setRenderTarget(null); renderer.render(cenaPos, camPos);
    },
  };
}

// chão invisível que só mostra a sombra (para fichas e fundos lisos); opacidade = força da sombra
export function criarChaoSombra(cena, opacidade = 0.18, tamanho = 40) {
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho), new THREE.ShadowMaterial({ opacity: opacidade }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);
  return chao;
}

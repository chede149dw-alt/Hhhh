// The Piazza: lawn, marble paving, cathedral, baptistery, city wall, houses and hills, plus the tower built floor by
// floor as a kinematic chain (each floor sits on the top of the one below, leaning, the upper ones bent back).
// Sky, light rig, clouds and the character cards work exactly like the bridge short.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house, Kit, quad, tri } from "./build";
import { rep, ctex, stoneHD, cobbleHD, grassHD, cloudHD, roofHD, brick } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone, twoTone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, D0, SHOTS, camAt, ShotDef, towerState, H1, H2, HTOP, HANT, V3 } from "./story";

export const loadKit = async (): Promise<Kit> => ({});

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 1: { az: 120 }, 2: { az: 110 }, 3: { az: 115 }, 4: { az: 125 }, 5: { az: 30, el: 8 }, 6: { az: 120 }, 7: { az: 115 }, 8: { az: 120 }, 9: { az: 125 }, 10: { az: 125, el: 40 } };

/** horizontal quad facing up at height y covering x0..x1, z0..z1 */
const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = D0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
const cyl = (r0: number, r1: number, h: number, n = 48, open = false) => new THREE.CylinderGeometry(r1, r0, h, n, 1, open).translate(0, h / 2, 0);
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);

/** wrought-iron lattice: bars on the borders, a big X and a mid rail; holes cut out with alphaTest */
const IRON = "#7a5236";
const latticeTex = () => ctex("eiffelLattice", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.strokeStyle = IRON; g.lineCap = "square";
  g.lineWidth = 30; g.strokeRect(0, 0, 256, 256);
  g.lineWidth = 16; g.beginPath(); g.moveTo(0, 0); g.lineTo(256, 256); g.moveTo(256, 0); g.lineTo(0, 256); g.stroke();
  g.lineWidth = 12; g.beginPath(); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
});
/** one slice of a square, tapering, open-ended lattice column: centre (cx0,cz0) half w0 at y0 to (cx1,cz1) half w1 at y1 */
const slice = (b: Batch, M: Record<string, THREE.Material>, c0: [number, number], w0: number, y0: number, c1: [number, number], w1: number, y1: number) => {
  const P = (c: [number, number], w: number, y: number) => [V(c[0] - w, y, c[1] - w), V(c[0] + w, y, c[1] - w), V(c[0] + w, y, c[1] + w), V(c[0] - w, y, c[1] + w)];
  const lo = P(c0, w0, y0), hi = P(c1, w1, y1);
  const tv = Math.max(1, Math.round((y1 - y0) / 3.2)), tu = Math.max(1, Math.round((w0 + w1) / 3.2));
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; b.add(quad(lo[i], lo[j], hi[j], hi[i], tu, tv), M.lattice); }
  // corner girders: solid, so the silhouette reads from far away
  for (let i = 0; i < 4; i++) {
    const p0 = lo[i], p1 = hi[i], d = p1.clone().sub(p0), L = d.length(), r = Math.max(0.25, 0.11 * (w0 + w1));
    const gq = new THREE.BoxGeometry(r, L, r); gq.translate(0, L / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize());
    b.add(gq, M.iron, new THREE.Matrix4().compose(p0, q, V(1, 1, 1)));
  }
};
/** a flat deck ring around a platform: box frame with a lattice skirt */
const deck = (b: Batch, M: Record<string, THREE.Material>, y: number, half: number, th: number) => {
  b.add(boxGeo(V(-half, y - th, -half), V(half, y, half)), M.iron);
  b.add(boxGeo(V(-half - 0.4, y, -half - 0.4), V(half + 0.4, y + 0.5, half + 0.4)), M.gold);
  // railing posts
  for (let k = -half; k <= half + 0.01; k += half / 4) for (const [x, z] of [[k, -half - 0.2], [k, half + 0.2], [-half - 0.2, k], [half + 0.2, k]] as [number, number][])
    b.add(boxGeo(V(x - 0.15, y + 0.5, z - 0.15), V(x + 0.15, y + 1.7, z + 0.15)), M.iron);
  for (const s of [-1, 1]) {
    b.add(boxGeo(V(-half - 0.35, y + 1.6, s * (half + 0.2) - 0.12), V(half + 0.35, y + 1.8, s * (half + 0.2) + 0.12)), M.iron);
    b.add(boxGeo(V(s * (half + 0.2) - 0.12, y + 1.6, -half - 0.35), V(s * (half + 0.2) + 0.12, y + 1.8, half + 0.35)), M.iron);
  }
};
/** half-width of the summit shaft at height y (the famous curve: wide at the 2nd floor, thin at the top) */
const shaftW = (y: number) => 1.1 + 5.6 * Math.pow(Math.max(0, (HTOP - y) / (HTOP - H2)), 1.7);
/** leg centre / half-width below the 1st floor (curving in) and between floors */
const legA = (y: number): [number, number] => { const u = y / H1; return [20 - 8.5 * Math.pow(u, 0.85), 5 - 2.2 * u]; };
const legB = (y: number): [number, number] => { const u = (y - H1) / (H2 - H1); return [11.2 - 6.2 * u, 2.8 - 1.0 * u]; };
type Piece = { g: THREE.Group; y0: number; y1: number };

const tree = (b: Batch, x: number, z: number, s: number, M: Record<string, THREE.Material>, seed: number) => {
  b.add(cyl(0.35 * s, 0.25 * s, 3.2 * s, 8), M.bark, at(x, D0, z));
  const g = new THREE.IcosahedronGeometry(2.2 * s, 1);
  b.add(g, seed % 2 ? M.leafA : M.leafB, at(x, D0 + 4.6 * s, z));
  b.add(new THREE.IcosahedronGeometry(1.6 * s, 1), seed % 3 ? M.leafB : M.leafA, at(x + 0.9 * s, D0 + 5.8 * s, z - 0.4 * s));
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private pieces: Piece[] = [];
  private antenna = new THREE.Group();
  private scaffold = new THREE.Group();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Record<string, THREE.Material> = {};
    // ---- sky + light (same as the bridge short) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- materials ----
    M.grass = lam("grassHD", () => ({ map: grassHD() }));
    M.pave = lam("paveHD", () => ({ map: stoneHD("paveHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    M.gravel = lam("gravel", () => ({ color: "#d9c9a8" }));
    M.bark = lam("bark", () => ({ color: "#8a5a3c" }));
    M.leafA = lam("leafA", () => ({ color: "#62ae4c" }));
    M.leafB = lam("leafB", () => ({ color: "#4f9a43" }));
    M.water = lam("seine", () => ({ color: "#4f86c4" }));
    M.quay = lam("quay", () => ({ map: stoneHD("quayHD", ["#d8ccb6", "#cfc2ab", "#e0d5c1", "#c7b9a1"], "#a39584") }));
    M.lattice = lam("eiffelLattice", () => ({ map: latticeTex(), alphaTest: 0.5, side: THREE.DoubleSide }));
    M.iron = lam("eiffelIron", () => ({ color: IRON }));
    M.gold = lam("eiffelGold", () => ({ color: "#b98a4a" }));
    M.cabin = lam("eiffelCabin", () => ({ color: "#d9c7a0" }));
    M.ant = lam("antennaRed", () => ({ color: "#d9473a" }));
    M.antW = lam("antennaWhite", () => ({ color: "#f1ece2" }));
    M.wood = lam("scaffoldWood", () => ({ color: "#a8724a" }));
    M.flag = lam("flagBlue", () => ({ color: "#2f56a8", side: THREE.DoubleSide }));
    M.flagR = lam("flagRed", () => ({ color: "#d63a3a", side: THREE.DoubleSide }));
    M.flagW = lam("flagWhite", () => ({ color: "#f4f0e6", side: THREE.DoubleSide }));
    const hm = [lam("hillA", () => ({ color: "#78b257" })), lam("hillB", () => ({ color: "#6aa24e" })), lam("hillC", () => ({ color: "#8bbf63" }))];

    // ---- Champ de Mars, the Seine and Paris around it ----
    const b = new Batch();
    b.add(quadUp(-900, 900, -900, 900, 450, 450), M.grass);
    b.add(quadUp(-32, 32, -32, 32, 20, 20, D0 + 0.02), M.gravel);             // under the tower
    b.add(quadUp(-5, 5, -220, -32, 3, 60, D0 + 0.015), M.gravel);             // the long central walk
    b.add(quadUp(-46, -40, -220, 40, 2, 80, D0 + 0.015), M.gravel);
    b.add(quadUp(40, 46, -220, 40, 2, 80, D0 + 0.015), M.gravel);
    b.add(quadUp(-400, 400, 48, 78, 200, 10, D0 - 1.2), M.water);             // the Seine behind the tower
    b.add(boxGeo(V(-400, D0 - 1.5, 44), V(400, D0 + 0.4, 48), 3), M.quay);
    b.add(boxGeo(V(-400, D0 - 1.5, 78), V(400, D0 + 0.4, 82), 3), M.quay);
    // Haussmann-ish blocks: both sides of the field, across the river, and behind the cameras
    let hs = 1;
    for (let z = -260; z < 30; z += 11) { house(b, 72, z, -Math.PI / 2, 10, 9, 13 + (hs % 3) * 1.4, hs); hs++; house(b, -72, z, Math.PI / 2, 10, 9, 13 + (hs % 3) * 1.4, hs); hs++; }
    for (let z = -260; z < 30; z += 13) { house(b, 86, z + 5, -Math.PI / 2, 12, 9, 15, hs); hs++; house(b, -86, z + 5, Math.PI / 2, 12, 9, 15, hs); hs++; }
    for (let x = -300; x < 300; x += 11) { house(b, x, 96 + (hs % 2) * 2, Math.PI, 10, 9, 13 + (hs % 3) * 1.5, hs); hs++; }
    for (let x = -300; x < 300; x += 13) { house(b, x + 5, 112, Math.PI, 12, 9, 16, hs); hs++; }
    for (let x = -120; x < 120; x += 11) { house(b, x, -270, 0, 10, 9, 14, hs); hs++; }
    ([[-360, 300, 200, 60, 130], [160, 420, 260, 70, 150], [460, 180, 180, 50, 140], [-480, -60, 200, 46, 150], [520, -120, 170, 44, 130]] as const)
      .forEach(([x, z, sx, sy, sz], i) => b.add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), hm[i % 3], new THREE.Matrix4().compose(V(x, D0 - 2, z), new THREE.Quaternion(), V(sx, sy, sz))));
    // two rows of trees along each side of the field
    let ts = 0;
    for (let z = -240; z <= 30; z += 9) for (const x of [-56, -50, 50, 56]) { tree(b, x + (ts % 3) * 0.6, z + (ts % 2) * 2, 1.25 + (ts % 3) * 0.15, M, ts); ts++; }
    b.build(R);

    // ---- the tower: slices that appear as `built` passes them ----
    const add = (y0: number, y1: number, fn: (pb: Batch) => void) => {
      const pb = new Batch(), g = new THREE.Group(); fn(pb); pb.build(g); R.add(g); this.pieces.push({ g, y0, y1 });
    };
    const NA = 4;
    for (let i = 0; i < NA; i++) {
      const y0 = (H1 * i) / NA, y1 = (H1 * (i + 1)) / NA, [c0, w0] = legA(y0), [c1, w1] = legA(y1);
      add(y0, y1, (pb) => { for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) slice(pb, M, [sx * c0, sz * c0], w0, y0, [sx * c1, sz * c1], w1, y1); });
    }
    // the four big arches under the 1st floor
    add(H1 - 6, H1, (pb) => {
      for (let k = 0; k < 4; k++) {
        const arc = new THREE.TorusGeometry(13.2, 0.55, 8, 40, Math.PI).translate(0, 5.0, 0);
        pb.add(arc, M.iron, new THREE.Matrix4().makeRotationY((k * Math.PI) / 2).multiply(new THREE.Matrix4().makeTranslation(0, 0, -14.5)));
      }
      deck(pb, M, H1, 15, 2.6);
    });
    const NB = 3;
    for (let i = 0; i < NB; i++) {
      const y0 = H1 + ((H2 - H1) * i) / NB, y1 = H1 + ((H2 - H1) * (i + 1)) / NB, [c0, w0] = legB(y0), [c1, w1] = legB(y1);
      add(y0, y1, (pb) => { for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) slice(pb, M, [sx * c0, sz * c0], w0, y0, [sx * c1, sz * c1], w1, y1); });
    }
    add(H2 - 1, H2, (pb) => deck(pb, M, H2, 8.2, 1.8));
    const NC = 8;
    for (let i = 0; i < NC; i++) {
      const y0 = H2 + ((HTOP - H2) * i) / NC, y1 = H2 + ((HTOP - H2) * (i + 1)) / NC;
      add(y0, y1, (pb) => slice(pb, M, [0, 0], shaftW(y0), y0, [0, 0], shaftW(y1), y1));
    }
    // the summit: cabin, lantern
    add(HTOP - 1, HTOP + 4, (pb) => {
      deck(pb, M, HTOP, 2.0, 0.6);
      pb.add(boxGeo(V(-1.3, HTOP, -1.3), V(1.3, HTOP + 2.4, 1.3)), M.cabin);
      pb.add(boxGeo(V(-1.6, HTOP + 2.4, -1.6), V(1.6, HTOP + 2.8, 1.6)), M.iron);
      pb.add(cyl(0.9, 0.6, 1.4, 16), M.iron, at(0, HTOP + 2.8, 0));
    });
    // the radio antenna (grows in shot 6): red and white bands
    const abt = new Batch();
    for (let k = 0; k < 7; k++) abt.add(cyl(0.32 - k * 0.03, 0.29 - k * 0.03, HANT / 7, 12), k % 2 ? M.antW : M.ant, at(0, (k * HANT) / 7, 0));
    abt.add(new THREE.SphereGeometry(0.35, 12, 8), M.ant, at(0, HANT, 0));
    abt.build(this.antenna); this.antenna.position.set(0, HTOP + 4.2, 0); R.add(this.antenna);

    // ---- building site: wooden scaffold towers + French flags (shots 2-3) ----
    const sb = new Batch();
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const cx = sx * 27, cz = sz * 27;
      for (const [dx, dz] of [[-2, -2], [2, -2], [2, 2], [-2, 2]]) sb.add(cyl(0.14, 0.14, 12, 6), M.wood, at(cx + dx, D0, cz + dz));
      for (const y of [3, 6, 9, 11.8]) { sb.add(boxGeo(V(cx - 2.2, y, cz - 2.2), V(cx + 2.2, y + 0.18, cz + 2.2)), M.wood); }
    }
    for (const [x, z] of [[-34, -34], [34, -34]]) {
      sb.add(cyl(0.12, 0.12, 9, 8), M.wood, at(x, D0, z));
      sb.add(boxGeo(V(x, D0 + 6.6, z), V(x + 1.0, D0 + 8.8, z + 0.05)), M.flag);
      sb.add(boxGeo(V(x + 1.0, D0 + 6.6, z), V(x + 2.0, D0 + 8.8, z + 0.05)), M.flagW);
      sb.add(boxGeo(V(x + 2.0, D0 + 6.6, z), V(x + 3.0, D0 + 8.8, z + 0.05)), M.flagR);
    }
    sb.build(this.scaffold); R.add(this.scaffold);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** show the slices that are up; the newest one slides up into place */
  private poseTower(id: number, t: number) {
    const st = towerState(id, t);
    for (const p of this.pieces) {
      const mid = (p.y0 + p.y1) / 2;
      p.g.visible = st.built >= mid;
      const u = Math.min(1, (st.built - mid) / Math.max(1, p.y1 - p.y0));
      p.g.position.y = u < 1 ? -(1 - u) * 1.2 : 0;
    }
    this.antenna.visible = st.antenna > 0;
    this.antenna.scale.set(1, Math.max(0.001, st.antenna), 1);
    this.scaffold.visible = id === 2 || id === 3;
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 14, 110);
    if (s.light === "golden") Rr = Math.max(Rr, 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear * 3; this.fog.far = L.fogFar * 2.6;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    this.poseTower(id, t);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }
}
export type { V3 };

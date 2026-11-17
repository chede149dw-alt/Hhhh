// "A Torre Eiffel era pra ter virado sucata": 33 s short, flat characters in a 3D toon world.
// Shots keyed to the narration word times in public/eiffel/words.json (free preview voice).
export const FPS = 30;
export const TOTAL = 990;
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

/** narration word times (s) */
export const T_PIECES = 6.49;   // "dezoito mil peças"
export const T_RIVETS = 7.83;   // "Dois milhões"
export const T_300 = 9.49;      // "Trezentos metros"
export const T_HATE = 12.46;    // "odiou"
export const T_DOWN = 20.18;    // "desmontada"
export const T_ANTENNA = 22.07; // "antena"
export const T_RADIO = 22.44;   // "rádio"
export const T_HIGH = 26.13;    // "quanto mais alto"
export const T_ARMY = 29.01;    // "exército"
// aliases the shared cast code still imports
export const T_SINK = T_HATE, T_WAR = T_ARMY, T_NOT = 30.0;

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "poster" | "tourists" | "masons" | "artists" | "kid" | "soldiers" | "none" | "cheer";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 60, light: "day", crowd: "tourists" },     // hook: today
  { id: 2, a: 60, b: 165, light: "day", crowd: "none" },       // Paris 1889: the site, leg stubs
  { id: 3, a: 165, b: 357, light: "day", crowd: "masons" },    // it goes up in three beats
  { id: 4, a: 357, b: 546, light: "day", crowd: "artists" },   // Paris hated it
  { id: 5, a: 546, b: 627, light: "golden", crowd: "none" },   // 1909: to be taken down
  { id: 6, a: 627, b: 702, light: "day", crowd: "none" },      // antenna on top
  { id: 7, a: 702, b: 842, light: "day", crowd: "kid" },       // kid on dad's shoulders
  { id: 8, a: 842, b: 892, light: "day", crowd: "soldiers" },  // the army
  { id: 9, a: 892, b: TOTAL, light: "day", crowd: "cheer" },   // today: 6 million a year
  { id: 10, a: TOTAL, b: TOTAL + 1, light: "day", crowd: "poster" }, // channel profile picture (not in the video)
];
export const XFADE: Record<number, number> = { 2: 8, 5: 10, 6: 10, 9: 8 };
export const FLASH_AT = 60;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- the tower ----------------
// Scaled to 0.4 of the real one: legs 25 m from the centre, 1st platform at 23 m, 2nd at 46 m, top at 110 m,
// the radio antenna adds 14 m. `built` = height in metres that is up; pieces appear as it passes them.
export const H1 = 23, H2 = 46, HTOP = 110, HANT = 14;
export type TowerState = { built: number; antenna: number; rings: number };
const grow = (t: number, t0: number, dur: number, from: number, to: number) => from + (to - from) * easeOut((t - t0) / dur);
export const towerState = (id: number, t: number): TowerState => {
  switch (id) {
    case 2: return { built: 7, antenna: 0, rings: -1 };
    case 3: {
      let h = 7;
      if (t >= T_PIECES - 0.07) h = grow(t, T_PIECES - 0.07, 0.9, 7, H1 + 1);
      if (t >= T_RIVETS - 0.07) h = grow(t, T_RIVETS - 0.07, 0.9, H1 + 1, H2 + 1);
      if (t >= T_300 - 0.07) h = grow(t, T_300 - 0.07, 1.5, H2 + 1, HTOP + 2);
      return { built: h, antenna: 0, rings: -1 };
    }
    case 4: case 5: return { built: 999, antenna: 0, rings: -1 };
    case 6: return { built: 999, antenna: clamp01((t - T_ANTENNA + 0.07) / 0.35), rings: t >= T_RADIO ? t - T_RADIO : -1 };
    case 7: case 8: return { built: 999, antenna: 1, rings: t - 23.0 };
    case 10: return { built: 999, antenna: 1, rings: 0.35 };
    default: return { built: 999, antenna: 1, rings: -1 };
  }
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** every hold creeps in: dolly toward the look point by rate per frame since f0 */
/** every hold creeps in: a slow zoom (the lens stays put, so the foreground cast never leaves the frame) */
const dolly = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, rest: Partial<Cam> = {}): Shot => {
  const k = Math.exp(-rate * Math.max(0, f - f0)), fov = rest.fov ?? 40;
  return { pos, look, ...rest, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k) };
};

const CAMS: Record<number, Key[]> = {
  // hook: low behind the tourists, tilting up the whole tower
  1: [
    { f: 0, s: (f) => dolly([-1, 1.5, -150], [1, 26, 0], f, 0, 0.002, { fov: 56, roll: 0.02 }) },
    { f: 14, dur: 40, s: (f) => dolly([-1.5, 1.8, -150], [0, 58, 0], f, 14, 0.0015, { fov: 56, roll: 0.04 }) },
  ],
  // Paris 1889: high over the roofs, the field with the four leg stubs
  2: [{ f: 56, s: (f) => dolly([95, 42, -150], [0, 4, 0], f, 56, 0.0025, { fov: 46, roll: -0.03 }) }],
  // it goes up: masons in front, tilt up on "Trezentos metros"
  3: [
    { f: 165, cut: true, s: (f) => dolly([10, 1.7, -110], [0, 16, 0], f, 165, 0.0015, { fov: 56, roll: -0.03 }) },
    { f: 230, dur: 30, s: (f) => dolly([10, 1.9, -110], [0, 26, 0], f, 230, 0.0012, { fov: 58, roll: -0.03 }) },
    { f: 280, dur: 45, s: (f) => dolly([10, 2.2, -110], [0, 42, 0], f, 280, 0.001, { fov: 64, roll: -0.05 }) },
  ],
  // Paris hated it: angry artists in front, then pull back on "licença"
  4: [
    { f: 357, cut: true, s: (f) => dolly([-1, 1.6, -133], [0.5, 8, 0], f, 357, 0.0022, { fov: 50, roll: 0.03 }) },
    { f: 490, dur: 40, s: (f) => dolly([-6, 3, -140], [0, 40, 0], f, 490, 0.0015, { fov: 60, roll: 0.04 }) },
  ],
  // 1909, dusk: the tower alone
  5: [{ f: 540, s: (f) => dolly([28, 3, -185], [0, 52, 0], f, 540, 0.0025, { fov: 50, roll: -0.03 }) }],
  // antenna on top: close on the summit
  6: [{ f: 620, s: (f) => dolly([18, 96, -34], [0, 113, 0], f, 620, 0.002, { fov: 48, roll: 0.04 }) }],
  // kid on dad's shoulders; on "quanto mais alto" tilt up to the antenna
  7: [
    { f: 702, cut: true, s: (f) => dolly([-3.2, 1.5, -147], [0.2, 2.1, -141], f, 702, 0.002, { fov: 46, roll: 0.02 }) },
    { f: 780, dur: 40, s: (f) => dolly([-3.6, 1.7, -147.5], [0, 70, 0], f, 780, 0.0012, { fov: 62, roll: 0.03 }) },
  ],
  // the army: riflemen march past, the tower sending behind them
  8: [{ f: 842, cut: true, s: (f) => dolly([-2, 2.0, -136], [2, 30, 0], f, 842, 0.002, { fov: 60 }) }],
  // today: cheering crowd
  // profile picture: low and far back, the whole cast in front of the tower
  10: [{ f: TOTAL, s: () => ({ pos: [0, 0.55, -232], look: [0, 0.55 + 230 * Math.tan(0.24), 0], fov: 62, roll: 0 }) }],
  9: [{ f: 884, s: (f) => dolly([-1.5, 1.6, -152], [1, 44, 0], f, 884, 0.0014, { fov: 60, roll: 0.02 }) }],
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [T_PIECES, T_RIVETS, T_300, T_HATE, T_DOWN, T_ANTENNA];
export const kickAt = (t: number) => {
  for (const k of KICKS) { const n = Math.round((t - k) * FPS); if (n >= 0 && n < 7) return (n % 2 ? -1 : 1) * (1 - n / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a * 2.5;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.006 };
};

// ---------------- lens blur per beat (cInf px at 1080; 0 = sharp) ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 9, focus: () => [0, 1.6, -144.5] },
  { f: 14, dur: 26, cInf: 0 },
  { f: 60, cInf: 0 },
  { f: 165, cInf: 9, focus: () => [9, 1.5, -104] },
  { f: 280, dur: 30, cInf: 0 },
  { f: 357, cInf: 11, focus: () => [0, 1.5, -125] },
  { f: 490, dur: 30, cInf: 0 },
  { f: 546, cInf: 0 },
  { f: 702, cInf: 12, focus: () => [0, 2.0, -141] },
  { f: 780, dur: 30, cInf: 0 },
  { f: 842, cInf: 7, focus: () => [0, 1.5, -128] },
  { f: 892, cInf: 7, focus: () => [0, 1.5, -146] },
  { f: TOTAL, cInf: 8, focus: () => [0, 1.6, -227] },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];

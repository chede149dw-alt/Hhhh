import React from "react";

// ---------- Boneco articulado dos lutadores ----------
// Ângulos em graus: 0 = para baixo, 90 = para a frente, -90 = para trás, 180 = para cima.

export type Pose = {
  torso: number; // inclinação do tronco para a frente
  cabeca: number; // inclinação da cabeça em relação ao tronco
  bF: [number, number]; // braço da frente: ombro, dobra do cotovelo
  bT: [number, number]; // braço de trás
  pF: [number, number]; // perna da frente: quadril, dobra do joelho
  pT: [number, number]; // perna de trás
  arma: number; // ângulo da lâmina em relação ao antebraço
};

const P = (
  torso: number,
  cabeca: number,
  bF: [number, number],
  bT: [number, number],
  pF: [number, number],
  pT: [number, number],
  arma = 50,
): Pose => ({ torso, cabeca, bF, bT, pF, pT, arma });

export const POSES = {
  dePe: P(0, 0, [10, 12], [-8, 10], [8, -4], [-8, -4], 10),
  guarda: P(12, 0, [50, 80], [20, 100], [28, -22], [-28, -18], 55),
  guardaLamina: P(10, 0, [55, 50], [25, 70], [30, -24], [-30, -16], 60),
  correr: P(58, -34, [-70, 25], [-55, 20], [72, -62], [-52, -72], -160),
  correr2: P(58, -34, [-60, 25], [-70, 20], [-40, -80], [78, -50], -160),
  socoPrep: P(-6, 0, [-45, 115], [55, 85], [30, -26], [-30, -20], 60),
  soco: P(30, -12, [88, 4], [-35, 105], [46, -42], [-46, -8], 0),
  gancho: P(-10, -14, [128, 46], [-20, 90], [22, -12], [-26, -26], 0),
  chutePrep: P(-4, 0, [45, 90], [-30, 80], [82, -112], [-6, -8], 60),
  chute: P(-32, 14, [40, 90], [-55, 60], [96, 0], [-8, -10], 60),
  cortePrep: P(-12, -6, [172, 24], [45, 80], [26, -20], [-30, -18], 150),
  corte: P(36, -14, [52, 10], [-40, 80], [48, -44], [-48, -8], 22),
  corteHoriz: P(24, -8, [92, 4], [-50, 70], [44, -40], [-44, -10], -4),
  bloqueio: P(-6, 4, [82, 96], [72, 100], [36, -32], [-42, -4], 0),
  esquiva: P(52, -30, [30, 70], [-30, 80], [70, -105], [-30, -75], 60),
  esquivaTras: P(-38, 10, [20, 60], [-50, 50], [20, -6], [-34, -30], 60),
  atingido: P(-36, -30, [-30, 40], [-65, 30], [42, -52], [-10, -42], 100),
  voando: P(-52, -20, [104, 20], [82, 30], [72, -30], [50, -42], 120),
  agachado: P(46, -28, [12, 30], [-42, 62], [76, -120], [-20, -100], 80),
  ajoelhado: P(30, 34, [22, 10], [-10, 12], [82, -96], [4, -94], 150),
  carga: P(-10, -22, [30, 72], [-28, 104], [36, -26], [-36, -14], 70),
  cargaGrito: P(-18, -30, [42, 84], [-40, 112], [40, -30], [-40, -12], 80),
  salto: P(6, -10, [-20, 30], [-40, 30], [34, -74], [-12, -52], -150),
  ataqueAereo: P(34, -20, [86, 6], [-40, 100], [24, -64], [-42, -52], 0),
  mergulho: P(62, -40, [98, 4], [-50, 60], [-20, -30], [-50, -40], 0),
  finalRenPrep: P(-12, -16, [168, 12], [152, 22], [30, -24], [-34, -14], 0),
  finalRen: P(32, -14, [90, 0], [78, 14], [50, -46], [-50, -6], 0),
  finalKaenPrep: P(-16, 4, [-60, 124], [62, 80], [34, -30], [-34, -18], 0),
  posCorte: P(40, -4, [58, 8], [-46, 70], [52, -50], [-52, -6], 30),
  posSoco: P(32, -10, [88, 2], [-40, 100], [50, -46], [-50, -6], 0),
} satisfies Record<string, Pose>;

export type NomePose = keyof typeof POSES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const par = (a: [number, number], b: [number, number], t: number): [number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];

export const misturar = (a: Pose, b: Pose, t: number): Pose => ({
  torso: lerp(a.torso, b.torso, t),
  cabeca: lerp(a.cabeca, b.cabeca, t),
  bF: par(a.bF, b.bF, t),
  bT: par(a.bT, b.bT, t),
  pF: par(a.pF, b.pF, t),
  pT: par(a.pT, b.pT, t),
  arma: lerp(a.arma, b.arma, t),
});

// ---------- Estado no mundo + animação por quadros-chave ----------
export type Estado = {
  x: number;
  alt: number; // altura dos pés acima do chão
  rot: number; // rotação do corpo inteiro
  face: 1 | -1;
  esc: number;
  pose: Pose;
};

export type Chave = {
  f: number;
  p?: NomePose | Pose;
  x?: number;
  alt?: number;
  rot?: number;
  face?: 1 | -1;
  esc?: number;
  e?: (t: number) => number; // suavização da chegada nesta chave
};

export const E = {
  linear: (t: number) => t,
  sai: (t: number) => 1 - Math.pow(1 - t, 3),
  entra: (t: number) => t * t * t,
  entraSai: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  seco: (t: number) => 1 - Math.pow(1 - t, 5),
  corte: (t: number) => (t < 1 ? 0 : 1),
};

type ChaveCheia = { f: number; est: Estado; e: (t: number) => number };

export const animar = (chaves: Chave[]) => {
  const cheias: ChaveCheia[] = [];
  let atual: Estado = { x: 0, alt: 0, rot: 0, face: 1, esc: 1, pose: POSES.dePe };
  for (const c of chaves) {
    atual = {
      x: c.x ?? atual.x,
      alt: c.alt ?? atual.alt,
      rot: c.rot ?? atual.rot,
      face: c.face ?? atual.face,
      esc: c.esc ?? atual.esc,
      pose: c.p === undefined ? atual.pose : typeof c.p === "string" ? POSES[c.p] : c.p,
    };
    cheias.push({ f: c.f, est: atual, e: c.e ?? E.sai });
  }
  return (frame: number): Estado => {
    if (frame <= cheias[0].f) return cheias[0].est;
    const ult = cheias[cheias.length - 1];
    if (frame >= ult.f) return ult.est;
    let i = 0;
    while (cheias[i + 1].f <= frame) i++;
    const a = cheias[i];
    const b = cheias[i + 1];
    const t = b.e((frame - a.f) / (b.f - a.f));
    return {
      x: lerp(a.est.x, b.est.x, t),
      alt: lerp(a.est.alt, b.est.alt, t),
      rot: lerp(a.est.rot, b.est.rot, t),
      face: a.est.face,
      esc: lerp(a.est.esc, b.est.esc, t),
      pose: misturar(a.est.pose, b.est.pose, t),
    };
  };
};

// ---------- Geometria ----------
const rad = (g: number) => (g * Math.PI) / 180;
type V = [number, number];
const dir = (o: V, ang: number, l: number): V => [o[0] + Math.sin(rad(ang)) * l, o[1] + Math.cos(rad(ang)) * l];

const TRONCO = 118;
const BRACO = 68;
const ANTEBRACO = 64;
const COXA = 88;
const CANELA = 88;
const RAIO_CABECA = 31;
export const LAMINA = 215;

export const esqueleto = (p: Pose) => {
  const quadril: V = [0, 0];
  const peito = dir(quadril, 180 - p.torso, TRONCO);
  const ombro = dir(quadril, 180 - p.torso, TRONCO - 12);
  const cabeca = dir(peito, 180 - p.torso - p.cabeca, 12 + RAIO_CABECA);
  const cotF = dir(ombro, p.bF[0], BRACO);
  const maoF = dir(cotF, p.bF[0] + p.bF[1], ANTEBRACO);
  const cotT = dir(ombro, p.bT[0], BRACO);
  const maoT = dir(cotT, p.bT[0] + p.bT[1], ANTEBRACO);
  const joeF = dir([5, 0], p.pF[0], COXA);
  const peF = dir(joeF, p.pF[0] + p.pF[1], CANELA);
  const joeT = dir([-5, 0], p.pT[0], COXA);
  const peT = dir(joeT, p.pT[0] + p.pT[1], CANELA);
  const angLamina = p.bF[0] + p.bF[1] + p.arma;
  const pontaLamina = dir(maoF, angLamina, LAMINA);
  const base = Math.max(peF[1], peT[1]) + 13;
  return { quadril, peito, ombro, cabeca, cotF, maoF, cotT, maoT, joeF, peF, joeT, peT, pontaLamina, angLamina, base };
};

// Posição no mundo (chão em y = 0) de um ponto do esqueleto.
export const noMundo = (est: Estado, pt: V): V => {
  const esq = esqueleto(est.pose);
  const r = rad(est.rot);
  const x = pt[0];
  const y = pt[1];
  const rx = x * Math.cos(r) - y * Math.sin(r);
  const ry = x * Math.sin(r) + y * Math.cos(r);
  return [est.x + rx * est.face * est.esc, -est.alt - esq.base * est.esc + ry * est.esc];
};

// ---------- Aparência ----------
export type Visual = {
  id: "ren" | "kaen";
  contorno: string;
  roupa: string;
  roupa2: string;
  pele: string;
  cabelo: string;
  destaque: string;
  brilho: string;
};

export const REN: Visual = {
  id: "ren",
  contorno: "#070a18",
  roupa: "#27336a",
  roupa2: "#151c3f",
  pele: "#f3ccab",
  cabelo: "#eaf4ff",
  destaque: "#54e0ff",
  brilho: "#8fefff",
};

export const KAEN: Visual = {
  id: "kaen",
  contorno: "#14060a",
  roupa: "#5a1626",
  roupa2: "#2a0b14",
  pele: "#dea77c",
  cabelo: "#ff5a1c",
  destaque: "#ff9a1c",
  brilho: "#ffd27a",
};

const CABELO_REN =
  "M 23,-12 L 37,-27 L 19,-28 L 24,-48 L 5,-37 L -3,-57 L -16,-37 L -35,-50 L -34,-27 L -57,-28 L -39,-9 L -55,7 L -35,8 L -31,22 L -22,6 L -8,-9 L 7,-15 Z";
const CABELO_KAEN =
  "M 25,-10 L 33,-36 L 17,-29 L 16,-62 L 1,-37 L -9,-70 L -18,-37 L -37,-58 L -32,-27 L -50,-24 L -35,-6 L -36,12 L -24,3 L -10,-11 L 8,-15 Z";

const Membro: React.FC<{ a: V; b: V; c: V; l1: number; l2: number; cor1: string; cor2: string; contorno: string | null }> = ({
  a,
  b,
  c,
  l1,
  l2,
  cor1,
  cor2,
  contorno,
}) => (
  <>
    {contorno ? (
      <>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={contorno} strokeWidth={l1 + 9} strokeLinecap="round" />
        <line x1={b[0]} y1={b[1]} x2={c[0]} y2={c[1]} stroke={contorno} strokeWidth={l2 + 9} strokeLinecap="round" />
      </>
    ) : null}
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={cor1} strokeWidth={l1} strokeLinecap="round" />
    <line x1={b[0]} y1={b[1]} x2={c[0]} y2={c[1]} stroke={cor2} strokeWidth={l2} strokeLinecap="round" />
  </>
);

const entre = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export const Lutador: React.FC<{
  est: Estado;
  vis: Visual;
  frame: number;
  mono?: string; // desenha como silhueta de uma cor só
  opacidade?: number;
  lamina?: number; // 0..1.5 intensidade da lâmina (Ren)
  fogo?: number; // 0..1.5 intensidade do fogo nos punhos (Kaen)
  vento?: number; // quanto o cachecol/faixa estica (1 = normal)
  brilho?: number; // halo colorido em volta do corpo
}> = ({ est, vis, frame, mono, opacidade = 1, lamina = 1, fogo = 0, vento = 1, brilho = 0 }) => {
  const p = est.pose;
  const s = esqueleto(p);
  const cont = mono ? null : vis.contorno;
  const c = (cor: string) => mono ?? cor;
  const angCabeca = p.torso * 0.55 + p.cabeca;

  // Cachecol (Ren) e faixa da testa (Kaen): fitas que ondulam para trás.
  const fita = (origem: V, comp: number, larg: number, fase: number) => {
    const pts: V[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const onda = Math.sin(frame * 0.42 + i * 0.9 + fase) * (4 + 16 * u) * (0.6 + 0.4 * vento);
      pts.push([origem[0] - u * comp * (0.75 + 0.35 * vento), origem[1] + onda + u * u * 34 * (1.4 - Math.min(vento, 1.3))]);
    }
    const cima = pts.map((q, i) => `${q[0]},${q[1] - (larg / 2) * (1 - (i / n) * 0.75)}`);
    const baixo = pts
      .map((q, i) => `${q[0]},${q[1] + (larg / 2) * (1 - (i / n) * 0.75)}`)
      .reverse();
    return `M ${cima.join(" L ")} L ${baixo.join(" L ")} Z`;
  };

  const yBase = -est.alt - s.base * est.esc;
  const transform = `translate(${est.x} ${yBase}) scale(${est.face * est.esc} ${est.esc}) rotate(${est.rot})`;
  const tremula = (k: number) => 0.75 + 0.25 * Math.sin(frame * 1.7 + k * 2.1);

  const Punho = ({ pt, k }: { pt: V; k: number }) =>
    fogo > 0 && !mono ? (
      <g>
        <circle cx={pt[0]} cy={pt[1]} r={34 * fogo * tremula(k)} fill={`url(#brasa-${vis.id})`} />
        {[0, 1, 2].map((i) => {
          const a = -90 + (i - 1) * 38 + Math.sin(frame * 1.3 + i + k) * 14;
          const l = (38 + 22 * tremula(i + k)) * fogo;
          const q: V = [pt[0] + Math.cos(rad(a)) * l, pt[1] + Math.sin(rad(a)) * l];
          return (
            <path
              key={i}
              d={`M ${pt[0] - 9},${pt[1]} Q ${pt[0]},${pt[1] - 6} ${q[0]},${q[1]} Q ${pt[0]},${pt[1] + 6} ${pt[0] + 9},${pt[1]} Z`}
              fill={i === 1 ? "#fff1b8" : vis.destaque}
              opacity={0.85}
            />
          );
        })}
      </g>
    ) : null;

  return (
    <g transform={transform} opacity={opacidade} style={brilho > 0 && !mono ? { filter: `drop-shadow(0 0 ${14 * brilho}px ${vis.destaque})` } : undefined}>
      {/* braço e perna de trás */}
      <Membro a={s.ombro} b={s.cotT} c={s.maoT} l1={24} l2={22} cor1={c(vis.roupa2)} cor2={c(vis.id === "kaen" ? "#b9243a" : vis.roupa2)} contorno={cont} />
      <circle cx={s.maoT[0]} cy={s.maoT[1]} r={14} fill={c(vis.pele)} stroke={cont ?? "none"} strokeWidth={4} />
      <Punho pt={s.maoT} k={3} />
      <Membro a={[-5, 0]} b={s.joeT} c={s.peT} l1={32} l2={26} cor1={c(vis.roupa2)} cor2={c(vis.roupa2)} contorno={cont} />
      <line
        x1={s.peT[0]}
        y1={s.peT[1]}
        x2={dir(s.peT, p.pT[0] + p.pT[1] + 84, 24)[0]}
        y2={dir(s.peT, p.pT[0] + p.pT[1] + 84, 24)[1]}
        stroke={c(vis.contorno)}
        strokeWidth={22}
        strokeLinecap="round"
      />

      {/* fitas atrás do corpo */}
      {vis.id === "ren" ? (
        <path d={fita(s.peito, 170, 26, 0)} fill={c(vis.destaque)} stroke={cont ?? "none"} strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <path d={fita([-8, -4], 120, 22, 1.3)} fill={c(vis.destaque)} stroke={cont ?? "none"} strokeWidth={4} strokeLinejoin="round" />
      )}

      {/* tronco */}
      {cont ? <line x1={0} y1={0} x2={s.peito[0]} y2={s.peito[1]} stroke={cont} strokeWidth={59} strokeLinecap="round" /> : null}
      <line x1={0} y1={0} x2={s.peito[0]} y2={s.peito[1]} stroke={c(vis.roupa)} strokeWidth={50} strokeLinecap="round" />
      {!mono ? (
        <>
          <line
            x1={entre([0, 0], s.peito, 0.5)[0]}
            y1={entre([0, 0], s.peito, 0.5)[1]}
            x2={s.peito[0]}
            y2={s.peito[1]}
            stroke={vis.id === "ren" ? "#34448a" : "#7a1f33"}
            strokeWidth={36}
            strokeLinecap="round"
          />
          <line
            x1={entre([0, 0], s.peito, 0.06)[0]}
            y1={entre([0, 0], s.peito, 0.06)[1]}
            x2={entre([0, 0], s.peito, 0.16)[0]}
            y2={entre([0, 0], s.peito, 0.16)[1]}
            stroke={vis.destaque}
            strokeWidth={52}
          />
        </>
      ) : null}

      {/* cabeça */}
      <g transform={`translate(${s.cabeca[0]} ${s.cabeca[1]}) rotate(${angCabeca})`}>
        <ellipse cx={0} cy={0} rx={28} ry={RAIO_CABECA} fill={c(vis.pele)} stroke={cont ?? "none"} strokeWidth={4.5} />
        {!mono ? (
          <>
            <path d="M 6,-7 L 25,-4 L 23,4 L 9,2 Z" fill="#fff" />
            <circle cx={18} cy={-1} r={4.2} fill={vis.destaque} />
            <circle cx={18.5} cy={-1} r={1.8} fill={vis.contorno} />
            <line x1={3} y1={-13} x2={27} y2={-7} stroke={vis.contorno} strokeWidth={4.5} strokeLinecap="round" />
            <line x1={15} y1={17} x2={24} y2={15.5} stroke={vis.contorno} strokeWidth={3} strokeLinecap="round" />
          </>
        ) : null}
        <path d={vis.id === "ren" ? CABELO_REN : CABELO_KAEN} fill={c(vis.cabelo)} stroke={cont ?? "none"} strokeWidth={4.5} strokeLinejoin="round" />
        {vis.id === "kaen" && !mono ? (
          <>
            <path d={fita([-28, -9], 70, 9, 2.2)} fill="#f4f1ea" stroke={vis.contorno} strokeWidth={3} />
            <line x1={27} y1={-12} x2={-30} y2={-9} stroke="#f4f1ea" strokeWidth={8} />
          </>
        ) : null}
      </g>
      {vis.id === "ren" ? <circle cx={s.peito[0]} cy={s.peito[1]} r={17} fill={c(vis.destaque)} stroke={cont ?? "none"} strokeWidth={4} /> : null}

      {/* perna da frente */}
      <Membro a={[5, 0]} b={s.joeF} c={s.peF} l1={34} l2={28} cor1={c(vis.roupa)} cor2={c(vis.roupa2)} contorno={cont} />
      <line
        x1={s.peF[0]}
        y1={s.peF[1]}
        x2={dir(s.peF, p.pF[0] + p.pF[1] + 84, 26)[0]}
        y2={dir(s.peF, p.pF[0] + p.pF[1] + 84, 26)[1]}
        stroke={c(vis.contorno)}
        strokeWidth={24}
        strokeLinecap="round"
      />

      {/* lâmina (Ren) */}
      {vis.id === "ren" && lamina > 0 ? (
        mono ? (
          <line x1={s.maoF[0]} y1={s.maoF[1]} x2={s.pontaLamina[0]} y2={s.pontaLamina[1]} stroke={mono} strokeWidth={8} strokeLinecap="round" />
        ) : (
          <g>
            <line x1={s.maoF[0]} y1={s.maoF[1]} x2={s.pontaLamina[0]} y2={s.pontaLamina[1]} stroke={vis.destaque} strokeWidth={22 * lamina} strokeLinecap="round" opacity={0.28} />
            <line x1={s.maoF[0]} y1={s.maoF[1]} x2={s.pontaLamina[0]} y2={s.pontaLamina[1]} stroke={vis.destaque} strokeWidth={11 * lamina} strokeLinecap="round" opacity={0.8} />
            <line x1={s.maoF[0]} y1={s.maoF[1]} x2={s.pontaLamina[0]} y2={s.pontaLamina[1]} stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" />
          </g>
        )
      ) : null}

      {/* braço da frente */}
      <Membro a={s.ombro} b={s.cotF} c={s.maoF} l1={26} l2={24} cor1={c(vis.roupa)} cor2={c(vis.id === "kaen" ? "#d7263d" : vis.roupa)} contorno={cont} />
      {!mono && vis.id === "ren" ? (
        <line
          x1={entre(s.cotF, s.maoF, 0.55)[0]}
          y1={entre(s.cotF, s.maoF, 0.55)[1]}
          x2={entre(s.cotF, s.maoF, 0.8)[0]}
          y2={entre(s.cotF, s.maoF, 0.8)[1]}
          stroke={vis.destaque}
          strokeWidth={25}
        />
      ) : null}
      <circle cx={s.maoF[0]} cy={s.maoF[1]} r={15} fill={c(vis.pele)} stroke={cont ?? "none"} strokeWidth={4} />
      <Punho pt={s.maoF} k={0} />
    </g>
  );
};

// Gradientes usados pelos lutadores; incluir uma vez dentro do <svg>.
export const DefsLutadores: React.FC = () => (
  <defs>
    <radialGradient id="brasa-kaen">
      <stop offset="0" stopColor="#fff6c9" stopOpacity="0.95" />
      <stop offset="0.45" stopColor="#ff9a1c" stopOpacity="0.6" />
      <stop offset="1" stopColor="#ff3d00" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="brasa-ren">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="0.45" stopColor="#54e0ff" stopOpacity="0.6" />
      <stop offset="1" stopColor="#1c6bff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import T from "./timing.json";
import { animar, Chave, DefsLutadores, E, esqueleto, Estado, KAEN, Lutador, misturar, noMundo, POSES, REN, Visual } from "./rig";
import {
  ANCORA_Y,
  ArcoCorte,
  Aura,
  Cam,
  camada,
  Cenario,
  Ceu,
  Cratera,
  DefsCena,
  Feixe,
  H,
  Impacto,
  LinhasVelocidade,
  Onda,
  Particulas,
  Pedras,
  Poeira,
  Primeiro,
  Raio,
  tremer,
  W,
} from "./fx";

const TITULO = "Anton";
loadFont({ family: TITULO, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: "Inter", url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
const KANJI = "'IPAGothic', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const trilho = (f: number, pts: [number, number][], ease: (t: number) => number = Easing.inOut(Easing.quad)) =>
  interpolate(
    f,
    pts.map((p) => p[0]),
    pts.map((p) => p[1]),
    { easing: ease, ...clamp },
  );
type Imp = 0 | 1 | 2;
const modoImpacto = (f: number, f0: number): Imp => {
  const t = f - f0;
  return t < 0 || t > 3 ? 0 : t < 2 ? 1 : 2;
};

// =====================================================================
// Coreografia no chão
// =====================================================================
const rajadaRen: Chave[] = [];
const rajadaKaen: Chave[] = [];
T.rajada.forEach((fh, i) => {
  if (i % 2 === 0) {
    rajadaRen.push({ f: fh - 3, p: i % 4 === 0 ? "cortePrep" : "guardaLamina", x: -205 }, { f: fh, p: i % 4 === 0 ? "corte" : "corteHoriz", x: -185, e: E.seco });
    rajadaKaen.push({ f: fh - 2, p: "guarda", x: 200 }, { f: fh, p: "bloqueio", x: 212, e: E.seco });
  } else {
    rajadaKaen.push({ f: fh - 3, p: "socoPrep", x: 190 }, { f: fh, p: i % 4 === 1 ? "soco" : "gancho", x: 110, e: E.seco });
    rajadaRen.push({ f: fh - 2, p: "guardaLamina", x: -200 }, { f: fh, p: "bloqueio", x: -214, e: E.seco });
  }
});

const TRAVA_REN = { ...POSES.corteHoriz, bF: [72, 28] as [number, number], arma: 36 };

const ren = animar([
  { f: 300, p: "guardaLamina", x: -330, face: 1 },
  { f: 378, p: "guardaLamina" },
  { f: 388, p: "esquiva", x: -345, e: E.entra },
  { f: 432, p: "correr", x: -560, e: E.corte },
  { f: 436, p: TRAVA_REN, x: -214, e: E.entra },
  { f: 478, p: TRAVA_REN, x: -214 },
  { f: 484, p: "guardaLamina", x: -330 },
  { f: 489, p: "cortePrep", x: -260 },
  { f: 494, p: "corte", x: -180, e: E.seco },
  { f: 502, p: "corte" },
  { f: 507, p: "esquivaTras", x: -200, e: E.seco },
  { f: 513, p: "cortePrep", x: -215 },
  { f: 518, p: "corteHoriz", x: -200, e: E.seco },
  { f: 528, p: "guardaLamina", x: -205 },
  ...rajadaRen,
  { f: 599, p: "cortePrep", x: -200 },
  { f: 604, p: "atingido", x: -215, e: E.seco },
  { f: 608, p: "voando", x: -300, alt: 80, rot: -30, e: E.linear },
  { f: 621, p: "voando", x: -560, alt: 120, rot: -80, e: E.linear },
  { f: 632, p: "agachado", x: -700, alt: 0, rot: 0, e: E.linear },
  { f: 652, p: "agachado", x: -790 },
  { f: 670, p: "guardaLamina", x: -790 },
  { f: 692, p: "guardaLamina" },
  { f: 696, p: "salto", x: -815, alt: 40 },
  { f: 708, p: "salto", x: -1045, alt: 300, rot: -190, e: E.linear },
  { f: 724, p: "agachado", x: -1150, alt: 0, rot: -360, e: E.linear },
  { f: 725, rot: 0, e: E.corte },
  { f: 744, p: "guardaLamina", x: -1150 },
  { f: 1050, p: "guardaLamina" },
  // pouso depois do combate aéreo
  { f: 1250, p: "voando", x: -140, alt: 1500, rot: -50, e: E.corte },
  { f: 1264, p: "agachado", x: -390, alt: 0, rot: 0, e: E.entra },
  { f: 1284, p: "agachado", x: -430 },
  { f: 1306, p: "guardaLamina" },
  { f: 1352, p: "guardaLamina" },
  { f: 1374, p: "finalRenPrep", e: E.entraSai },
  { f: 1467, p: "finalRenPrep" },
  { f: 1472, p: "finalRen", x: -412, e: E.seco },
  { f: 1565, p: "finalRen", x: -450, e: E.linear },
]);

const kaen = animar([
  { f: 300, p: "guarda", x: 330, face: -1 },
  { f: 378, p: "guarda" },
  { f: 388, p: "esquiva", x: 345, e: E.entra },
  { f: 432, p: "correr", x: 560, e: E.corte },
  { f: 436, p: "soco", x: 214, e: E.entra },
  { f: 478, p: "soco", x: 214 },
  { f: 484, p: "guarda", x: 330 },
  { f: 490, p: "guarda", x: 250 },
  { f: 494, p: "esquiva", x: 200, e: E.seco },
  { f: 500, p: "esquiva", x: 110 },
  { f: 505, p: "gancho", x: -10, e: E.seco },
  { f: 512, p: "guarda", x: 150 },
  { f: 517, p: "bloqueio", x: 190, e: E.seco },
  { f: 523, p: "bloqueio", x: 290 },
  { f: 529, p: "guarda", x: 200 },
  ...rajadaKaen,
  { f: 597, p: "chutePrep", x: 120 },
  { f: 603, p: "chute", x: -5, e: E.seco },
  { f: 614, p: "chute" },
  { f: 624, p: "guarda", x: 0 },
  { f: 638, p: "guarda" },
  { f: 645, p: "agachado", x: 0 },
  { f: 649, p: "salto", x: -30, alt: 90 },
  { f: 674, p: "salto", x: -300, alt: 540 },
  { f: 692, p: "finalKaenPrep", x: -360, alt: 560 },
  { f: 700, p: "mergulho", x: -420, alt: 500, rot: 25, e: E.entra },
  { f: 712, p: "mergulho", x: -730, alt: 10, rot: 40, e: E.entra },
  { f: 713, p: "agachado", x: -760, alt: 0, rot: 0, e: E.corte },
  { f: 736, p: "agachado" },
  { f: 749, p: "guarda", x: -760 },
  { f: 1050, p: "guarda" },
  { f: 1256, p: "voando", x: 140, alt: 1500, rot: -50, e: E.corte },
  { f: 1270, p: "agachado", x: 390, alt: 0, rot: 0, e: E.entra },
  { f: 1290, p: "agachado", x: 430 },
  { f: 1312, p: "guarda" },
  { f: 1412, p: "guarda" },
  { f: 1428, p: "finalKaenPrep", e: E.entraSai },
  { f: 1467, p: "finalKaenPrep" },
  { f: 1472, p: "soco", x: 412, e: E.seco },
  { f: 1565, p: "soco", x: 450, e: E.linear },
]);

const renFim = animar([
  { f: 1620, p: "posCorte", x: 330, face: 1 },
  { f: T.marcas, p: "posCorte" },
  { f: T.marcas + 5, p: "atingido", e: E.seco },
  { f: T.quedas[1], p: "ajoelhado", e: E.entraSai },
]);
const kaenFim = animar([
  { f: 1620, p: "posSoco", x: -330, face: -1 },
  { f: T.marcas, p: "posSoco" },
  { f: T.marcas + 5, p: "atingido", e: E.seco },
  { f: T.quedas[0], p: "ajoelhado", e: E.entraSai },
]);

// =====================================================================
// Peças comuns
// =====================================================================
const Palco: React.FC<{
  f: number;
  cam: Cam;
  tremor?: number;
  imp?: Imp;
  lua?: { x: number; y: number; r: number };
  tom?: [string, number];
  children?: React.ReactNode;
  tela?: React.ReactNode;
}> = ({ f, cam, tremor = 0, imp = 0, lua, tom, children, tela }) => {
  const [tx, ty] = tremor > 0 ? tremer(f, tremor) : [0, 0];
  const c = { x: cam.x + tx / cam.z, y: cam.y + ty / cam.z, z: cam.z };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <DefsCena />
      <DefsLutadores />
      {imp ? (
        <>
          <rect width={W} height={H} fill={imp === 1 ? "#fff" : "#000"} />
          <LinhasVelocidade f={f} modo="radial" cor={imp === 1 ? "#000" : "#fff"} n={70} miolo={330} cy={ANCORA_Y - 280} />
        </>
      ) : (
        <>
          <Ceu f={f} cam={c} lua={lua} />
          <Cenario cam={c} />
        </>
      )}
      <g transform={camada(c, 1)}>{children}</g>
      {imp ? null : <Primeiro cam={c} />}
      {tom && !imp ? <rect width={W} height={H} fill={tom[0]} opacity={tom[1]} style={{ mixBlendMode: "screen" }} /> : null}
      {tela}
    </svg>
  );
};

const Fig: React.FC<{
  est: Estado;
  vis: Visual;
  f: number;
  imp?: Imp;
  fn?: (f: number) => Estado;
  lamina?: number;
  fogo?: number;
  vento?: number;
  brilho?: number;
}> = ({ est, vis, f, imp = 0, fn, lamina = 1, fogo, vento, brilho }) => {
  const fogoPadrao = vis.id === "kaen" ? 1 : 0;
  if (imp) return <Lutador est={est} vis={vis} frame={f} mono={imp === 1 ? "#000" : "#fff"} lamina={lamina} />;
  const fantasmas: React.ReactNode[] = [];
  if (fn) {
    const antes = fn(f - 3);
    if (Math.hypot(antes.x - est.x, antes.alt - est.alt) > 30) {
      [4.5, 3, 1.5].forEach((d, i) => {
        fantasmas.push(<Lutador key={i} est={fn(f - d)} vis={vis} frame={f} mono={vis.destaque} opacidade={0.12 + i * 0.1} lamina={lamina} />);
      });
    }
  }
  return (
    <>
      {fantasmas}
      <Lutador est={est} vis={vis} frame={f} lamina={lamina} fogo={fogo ?? fogoPadrao} vento={vento} brilho={brilho} />
    </>
  );
};

const Letreiro: React.FC<{
  children: React.ReactNode;
  tam: number;
  cor?: string;
  sombra?: string;
  style?: React.CSSProperties;
}> = ({ children, tam, cor = "#fff", sombra = "#000", style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: TITULO,
      fontSize: tam,
      lineHeight: 1,
      color: cor,
      letterSpacing: tam * 0.02,
      whiteSpace: "nowrap",
      textShadow: `${tam * 0.03}px ${tam * 0.035}px 0 ${sombra}, 0 0 ${tam * 0.14}px rgba(0,0,0,0.55)`,
      WebkitTextStroke: `${Math.max(2, tam * 0.012)}px ${sombra}`,
      paintOrder: "stroke fill",
      ...style,
    }}
  >
    {children}
  </div>
);

const Legenda: React.FC<{ f: number; ini: number; fim: number; children: React.ReactNode }> = ({ f, ini, fim, children }) => {
  if (f < ini || f > fim) return null;
  const op = Math.min(lim((f - ini) / 5), lim((fim - f) / 5));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1610,
        textAlign: "center",
        fontFamily: "Inter",
        fontWeight: 800,
        fontSize: 52,
        color: "#fff",
        opacity: op,
        textShadow: "0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9), 3px 0 0 #000, -3px 0 0 #000",
      }}
    >
      {children}
    </div>
  );
};

const Clarao: React.FC<{ op: number; cor?: string }> = ({ op, cor = "#fff" }) =>
  op > 0 ? <AbsoluteFill style={{ backgroundColor: cor, opacity: lim(op) }} /> : null;

// Close dos olhos (desenhado numa área de 1080 x 560).
const CABELO_REN_FRANJA =
  "0,0 0,230 60,120 104,286 176,112 246,348 318,92 400,214 468,64 556,268 640,78 716,190 792,66 884,300 962,104 1030,236 1080,140 1080,0";
const CABELO_KAEN_FRANJA = "0,0 0,150 70,40 130,116 210,28 270,90 350,20 430,64 520,16 600,70 690,22 770,96 850,30 930,124 1010,44 1080,160 1080,0";

const Olhar: React.FC<{ vis: Visual; f: number; intenso?: number; y?: number }> = ({ vis, f, intenso = 0, y = 0 }) => {
  const pisca = 1 + Math.sin(f * 0.9) * 0.04 * intenso;
  const Olho = ({ lado }: { lado: 1 | -1 }) => (
    <g transform={`translate(${lado === 1 ? 292 : 788} 318) scale(${lado} 1)`}>
      <clipPath id={`esclera-${vis.id}-${lado}`}>
        <path d="M -150,18 C -100,-58 20,-84 140,-22 C 100,48 -40,66 -150,18 Z" />
      </clipPath>
      {intenso > 0 ? <circle cx={8} cy={-8} r={130 * pisca} fill={`url(#brasa-${vis.id})`} opacity={0.55 * intenso} /> : null}
      <path d="M -150,18 C -100,-58 20,-84 140,-22 C 100,48 -40,66 -150,18 Z" fill="#f6f8ff" />
      <g clipPath={`url(#esclera-${vis.id}-${lado})`}>
        <circle cx={8} cy={-8} r={64} fill={vis.destaque} />
        <circle cx={8} cy={-8} r={64} fill="none" stroke={vis.contorno} strokeWidth={9} opacity={0.75} />
        <circle cx={8} cy={-8} r={40} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />
        <ellipse cx={8} cy={-8} rx={17 - 7 * intenso} ry={30} fill={vis.contorno} />
        <circle cx={-16} cy={-34} r={15} fill="#fff" />
        <circle cx={32} cy={12} r={7} fill="#fff" opacity={0.9} />
        <rect x={-170} y={-100} width={340} height={62} fill="#1a1440" opacity={0.3} />
      </g>
      <path d="M -170,28 C -112,-68 20,-98 152,-28" fill="none" stroke={vis.contorno} strokeWidth={20} strokeLinecap="round" />
      <path d="M -168,28 L -198,2" fill="none" stroke={vis.contorno} strokeWidth={12} strokeLinecap="round" />
      <path d="M -120,46 C -40,72 60,58 122,6" fill="none" stroke={vis.contorno} strokeWidth={5} opacity={0.6} />
      <polygon points="-196,-158 -60,-134 152,-78 160,-52 -40,-100 -184,-122" fill={vis.contorno} />
    </g>
  );
  return (
    <g transform={`translate(0 ${y})`}>
      <rect width={W} height={560} fill={vis.pele} />
      <rect width={W} height={210} fill="#3a1d5a" opacity={0.32} />
      <rect y={470} width={W} height={90} fill="#3a1d5a" opacity={0.14} />
      <path d="M 550,372 L 528,452 L 556,458" fill="none" stroke="#8a5a48" strokeWidth={6} strokeLinecap="round" opacity={0.55} />
      <Olho lado={1} />
      <Olho lado={-1} />
      {vis.id === "kaen" ? (
        <>
          <rect y={104} width={W} height={84} fill="#f4f1ea" stroke={vis.contorno} strokeWidth={8} />
          <rect y={170} width={W} height={18} fill="#b9b3a2" opacity={0.6} />
          <polygon points={CABELO_KAEN_FRANJA} fill={vis.cabelo} stroke={vis.contorno} strokeWidth={8} strokeLinejoin="round" />
        </>
      ) : (
        <>
          <polygon points={CABELO_REN_FRANJA} fill={vis.cabelo} stroke={vis.contorno} strokeWidth={8} strokeLinejoin="round" />
          <polygon points="246,348 318,92 286,96" fill="#b9cdf0" />
          <polygon points="556,268 640,78 604,84" fill="#b9cdf0" />
          <polygon points="884,300 962,104 928,108" fill="#b9cdf0" />
        </>
      )}
    </g>
  );
};

// Painel inclinado com o close de um lutador.
const PainelOlhar: React.FC<{ vis: Visual; f: number; topo: number; alt: number; dx: number; intenso?: number; id: string; corte?: number }> = ({
  vis,
  f,
  topo,
  alt,
  dx,
  intenso = 0,
  id,
  corte = 0,
}) => (
  <g transform={`translate(${dx} ${topo})`}>
    <clipPath id={`painel-${id}`}>
      <polygon points={`0,36 ${W},0 ${W},${alt - 36} 0,${alt}`} />
    </clipPath>
    <g clipPath={`url(#painel-${id})`}>
      <Olhar vis={vis} f={f} intenso={intenso} y={-corte} />
      <LinhasVelocidade f={f} modo="h" cor="#fff" n={14} y0={0} y1={alt} opacidade={0.35} />
    </g>
    <polygon points={`0,36 ${W},0 ${W},10 0,46`} fill={vis.destaque} />
    <polygon points={`0,${alt - 10} ${W},${alt - 46} ${W},${alt - 36} 0,${alt}`} fill={vis.destaque} />
  </g>
);

// =====================================================================
// Cenas
// =====================================================================
const Abertura: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = {
    x: 0,
    y: trilho(f, [[0, -980], [86, -70]], Easing.inOut(Easing.cubic)),
    z: trilho(f, [[0, 0.8], [150, 0.9]], Easing.linear),
  };
  const r: Estado = { x: -330, alt: 0, rot: 0, face: 1, esc: 1, pose: POSES.dePe };
  const k: Estado = { x: 330, alt: 0, rot: 0, face: -1, esc: 1, pose: POSES.dePe };
  const t = f - T.titulo;
  const escT = t < 0 ? 0 : interpolate(t, [0, 6], [3.2, 1], { easing: Easing.out(Easing.cubic), ...clamp });
  const [sx, sy] = t >= 4 && t < 16 ? tremer(f, 14 * (1 - (t - 4) / 12)) : [0, 0];
  return (
    <>
      <Palco f={f} cam={cam} tremor={t >= 4 && t < 14 ? 10 * (1 - (t - 4) / 10) : 0}>
        <Fig est={r} vis={REN} f={f} lamina={0} vento={1.1} />
        <Fig est={k} vis={KAEN} f={f} fogo={0} vento={1.1} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Particulas f={f} cor="#f6c9e0" n={22} vx={-3.2} vy={1.4} semente="petala" />
      </svg>
      {t >= 0 ? (
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 548,
              textAlign: "center",
              fontFamily: KANJI,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: 26,
              color: "#ffd9e8",
              opacity: lim((t - 10) / 8),
              textShadow: "0 0 18px #ff4d8d, 0 3px 0 #000",
            }}
          >
            月下の決闘
          </div>
          <Letreiro tam={290} style={{ left: 0, right: 0, top: 612, textAlign: "center", transform: `scale(${escT}) skewX(-8deg)`, opacity: lim(t / 3) }} sombra="#b3123f">
            DUELO
          </Letreiro>
          <Letreiro
            tam={112}
            cor="#ffe9a8"
            sombra="#1a0d33"
            style={{
              left: 0,
              right: 0,
              top: 896,
              textAlign: "center",
              transform: `translateX(${interpolate(t, [10, 18], [-900, 0], { easing: Easing.out(Easing.cubic), ...clamp })}px) skewX(-8deg)`,
            }}
          >
            SOB A LUA
          </Letreiro>
        </AbsoluteFill>
      ) : null}
      <Clarao op={t >= 0 && t < 5 ? 0.8 - t * 0.2 : 0} />
      <Clarao op={1 - f / 18} cor="#000" />
    </>
  );
};

const Olhares: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = { x: 0, y: -70, z: 0.9 };
  const p1 = f - T.paineis[0];
  const p2 = f - T.paineis[1];
  const entra = (t: number, de: number) => interpolate(t, [0, 7], [de, 0], { easing: Easing.out(Easing.exp), ...clamp });
  const nome = (t: number) => interpolate(t, [6, 13], [0, 1], { easing: Easing.out(Easing.cubic), ...clamp });
  return (
    <>
      <Palco f={f} cam={cam}>
        <Fig est={{ x: -330, alt: 0, rot: 0, face: 1, esc: 1, pose: POSES.dePe }} vis={REN} f={f} lamina={0} />
        <Fig est={{ x: 330, alt: 0, rot: 0, face: -1, esc: 1, pose: POSES.dePe }} vis={KAEN} f={f} fogo={0} />
      </Palco>
      <AbsoluteFill style={{ backgroundColor: "#04050f", opacity: 0.72 }} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <DefsLutadores />
        {p1 >= 0 ? <PainelOlhar vis={REN} f={f} topo={210} alt={560} dx={entra(p1, -1200)} id="ren" intenso={lim((p1 - 20) / 20) * 0.6} /> : null}
        {p2 >= 0 ? <PainelOlhar vis={KAEN} f={f} topo={1000} alt={560} dx={entra(p2, 1200)} id="kaen" intenso={lim((p2 - 20) / 20) * 0.6} /> : null}
      </svg>
      {p1 >= 0 ? (
        <>
          <Letreiro tam={230} cor="#ffffff" sombra="#0b6f9c" style={{ left: 56, top: 750, transform: `translateX(${(1 - nome(p1)) * -600}px) skewX(-8deg)`, opacity: nome(p1) }}>
            REN
          </Letreiro>
          <Letreiro tam={62} cor={REN.destaque} sombra="#06142c" style={{ left: 420, top: 838, opacity: nome(p1 - 4) }}>
            LÂMINA DO TROVÃO
          </Letreiro>
          <div style={{ position: "absolute", left: 424, top: 912, fontFamily: KANJI, fontSize: 50, color: "#bff6ff", opacity: nome(p1 - 4) * 0.9, letterSpacing: 14 }}>雷刃</div>
        </>
      ) : null}
      {p2 >= 0 ? (
        <>
          <Letreiro tam={230} cor="#ffffff" sombra="#c2410c" style={{ right: 56, top: 1540, transform: `translateX(${(1 - nome(p2)) * 600}px) skewX(-8deg)`, opacity: nome(p2) }}>
            KAEN
          </Letreiro>
          <Letreiro tam={62} cor={KAEN.destaque} sombra="#2a0b06" style={{ right: 560, top: 1628, opacity: nome(p2 - 4) }}>
            PUNHO DE BRASA
          </Letreiro>
          <div style={{ position: "absolute", right: 566, top: 1702, fontFamily: KANJI, fontSize: 50, color: "#ffe1a8", opacity: nome(p2 - 4) * 0.9, letterSpacing: 14 }}>炎拳</div>
        </>
      ) : null}
      <Clarao op={p1 >= 0 && p1 < 4 ? 0.7 - p1 * 0.2 : 0} cor={REN.brilho} />
      <Clarao op={p2 >= 0 && p2 < 4 ? 0.7 - p2 * 0.2 : 0} cor={KAEN.brilho} />
    </>
  );
};

const Folha: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = { x: 0, y: -80, z: trilho(f, [[300, 0.9], [388, 1.02]], Easing.linear) };
  const u = lim((f - 300) / (T.folhaToca - 300));
  const fx = Math.sin(f * 0.13) * 46 * (1 - u * 0.6);
  const fy = -760 * (1 - u);
  const r = ren(f);
  const k = kaen(f);
  return (
    <>
      <Palco f={f} cam={cam}>
        <Fig est={r} vis={REN} f={f} lamina={lim((f - 318) / 12)} vento={0.8} />
        <Fig est={k} vis={KAEN} f={f} fogo={lim((f - 330) / 14)} vento={0.8} />
        {f < T.folhaToca + 2 ? (
          <g transform={`translate(${fx} ${fy - 6}) rotate(${Math.sin(f * 0.13) * 50 + 20})`}>
            <path d="M -22,0 Q 0,-16 24,0 Q 0,14 -22,0 Z" fill="#f6c9e0" stroke="#7a2a55" strokeWidth={3} />
            <line x1={-22} y1={0} x2={24} y2={0} stroke="#7a2a55" strokeWidth={2} />
          </g>
        ) : null}
        <Onda x={0} y={0} f={f} f0={T.folhaToca} tam={0.5} achatada={0.2} dur={12} />
        <Poeira x={r.x} y={0} f={f} f0={386} dir={-1} />
        <Poeira x={k.x} y={0} f={f} f0={386} dir={1} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Particulas f={f} cor="#f6c9e0" n={14} vx={-2.4} vy={1.2} semente="petala" opacidade={0.8} />
      </svg>
    </>
  );
};

const Corrida: React.FC<{ f: number; vis: Visual; f0: number }> = ({ f, vis, f0 }) => {
  const lado = vis.id === "ren" ? 1 : -1;
  const t = f - f0;
  const x = lado * (-2600 + t * 78);
  const cam: Cam = { x: x + lado * 60, y: -150, z: trilho(f, [[f0, 1.7], [f0 + 20, 1.45]], Easing.linear) };
  const ciclo = (t % 6) / 6;
  const mix = ciclo < 0.5 ? ciclo * 2 : 2 - ciclo * 2;
  const pose = misturar(POSES.correr, POSES.correr2, mix);
  const est: Estado = { x, alt: 6 + Math.abs(Math.sin((t / 6) * Math.PI * 2)) * 14, rot: 0, face: lado as 1 | -1, esc: 1, pose };
  return (
    <>
      <Palco f={f} cam={cam} tremor={4} tom={[vis.destaque, 0.1]}>
        {[3, 2, 1].map((i) => (
          <Lutador key={i} est={{ ...est, x: x - lado * i * 46 }} vis={vis} frame={f} mono={vis.destaque} opacidade={0.34 - i * 0.08} />
        ))}
        <Fig est={est} vis={vis} f={f} vento={1.5} lamina={1.2} fogo={lado === -1 ? 1.3 : 0} />
        <Poeira x={x - lado * 90} y={0} f={f} f0={f0 + Math.floor(t / 4) * 4} dir={-lado} tam={0.8} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <LinhasVelocidade f={f} modo="h" cor="#fff" n={44} opacidade={0.75} />
        <LinhasVelocidade f={f + 7} modo="h" cor={vis.destaque} n={18} opacidade={0.8} />
      </svg>
    </>
  );
};

const Choque: React.FC<{ f: number }> = ({ f }) => {
  const imp = modoImpacto(f, T.choque);
  const t = f - T.choque;
  const cam: Cam = { x: 0, y: -130, z: trilho(f, [[432, 0.95], [436, 1.15], [450, 1.42]], Easing.out(Easing.cubic)) };
  const r = ren(f);
  const k = kaen(f);
  const punho = noMundo(k, esqueleto(k.pose).maoF);
  return (
    <>
      <Palco f={f} cam={cam} imp={imp} tremor={t >= 0 ? 30 * Math.max(0, 1 - t / 14) : 0}>
        <Fig est={r} vis={REN} f={f} imp={imp} fn={ren} />
        <Fig est={k} vis={KAEN} f={f} imp={imp} fn={kaen} />
        <Onda x={punho[0]} y={punho[1]} f={f} f0={T.choque} tam={1.3} cor={imp === 1 ? "#000" : "#fff"} />
        <Onda x={punho[0]} y={punho[1]} f={f} f0={T.choque + 4} tam={2.2} dur={22} />
        <Onda x={0} y={0} f={f} f0={T.choque + 1} tam={1.8} achatada={0.18} cor="#aab4ff" />
        <Impacto x={punho[0]} y={punho[1]} f={f} f0={T.choque} tam={1.7} cor={imp ? (imp === 1 ? "#000" : "#fff") : "#ffe9a8"} dur={10} />
        <Poeira x={r.x - 40} y={0} f={f} f0={T.choque} dir={-1} tam={1.3} />
        <Poeira x={k.x + 40} y={0} f={f} f0={T.choque} dir={1} tam={1.3} />
      </Palco>
      {t < 0 ? (
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <LinhasVelocidade f={f} modo="h" cor="#fff" n={30} opacidade={0.6} />
        </svg>
      ) : null}
      <Clarao op={t >= 4 && t < 9 ? 0.75 - (t - 4) * 0.15 : 0} />
    </>
  );
};

const Troca: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = {
    x: trilho(f, [[450, 0], [598, 0], [606, -70], [632, -540], [650, -400], [690, -470], [716, -900], [750, -955]]),
    y: trilho(f, [[450, -130], [598, -140], [632, -110], [650, -170], [682, -290], [716, -110], [750, -110]]),
    z: trilho(f, [[450, 1.42], [528, 1.48], [598, 1.66], [607, 1.22], [632, 1.0], [650, 0.82], [690, 0.82], [716, 0.9], [750, 0.95]]),
  };
  const imp = (modoImpacto(f, T.chute) || modoImpacto(f, T.esmaga)) as Imp;
  let r = ren(f);
  let k = kaen(f);
  if (f < T.separa) {
    r = { ...r, x: r.x + (random(`jr${f}`) - 0.5) * 8 - Math.sin(f * 0.4) * 6 };
    k = { ...k, x: k.x + (random(`jk${f}`) - 0.5) * 8 - Math.sin(f * 0.4) * 6 };
  }
  const punho = noMundo(k, esqueleto(k.pose).maoF);
  const emRajada = f >= 530 && f < 598;
  let tremor = 0;
  if (f < T.separa) tremor = 5;
  if (emRajada) tremor = 7;
  if (f >= T.corte2 && f < T.corte2 + 8) tremor = 12 * (1 - (f - T.corte2) / 8);
  if (f >= T.chute && f < T.chute + 16) tremor = 30 * (1 - (f - T.chute) / 16);
  if (f >= T.quedaRen && f < T.quedaRen + 10) tremor = 10 * (1 - (f - T.quedaRen) / 10);
  if (f >= T.esmaga && f < T.esmaga + 24) tremor = 40 * (1 - (f - T.esmaga) / 24);
  const corImp = imp ? (imp === 1 ? "#000" : "#fff") : undefined;
  return (
    <>
      <Palco f={f} cam={cam} imp={imp} tremor={tremor}>
        <Cratera x={-760} f={f} f0={T.esmaga} tam={1.2} />
        <Fig est={r} vis={REN} f={f} imp={imp} fn={ren} />
        <Fig est={k} vis={KAEN} f={f} imp={imp} fn={kaen} fogo={f > 686 && f < 716 ? 1.6 : 1} />

        {/* travados: faíscas no ponto de contato */}
        {f < T.separa
          ? [0, 1, 2].map((i) => {
              const f0 = 450 + Math.floor((f - 450) / 4) * 4 - i * 4;
              return f0 >= 448 ? (
                <Impacto key={i} x={punho[0] + (random(`tx${f0}`) - 0.5) * 50} y={punho[1] + (random(`ty${f0}`) - 0.5) * 50} f={f} f0={f0} tam={0.45} cor={f0 % 8 === 0 ? REN.brilho : KAEN.brilho} />
              ) : null;
            })
          : null}
        <Onda x={0} y={-290} f={f} f0={T.separa} tam={0.9} />
        <Poeira x={-300} y={0} f={f} f0={T.separa + 3} dir={-1} />
        <Poeira x={300} y={0} f={f} f0={T.separa + 3} dir={1} />

        {/* corte 1 (Kaen abaixa), gancho (Ren recua), corte 2 (bloqueado) */}
        <ArcoCorte x={-150} y={-300} f={f} f0={T.corte1 - 2} raio={340} a0={-110} a1={50} />
        <ArcoCorte x={-30} y={-250} f={f} f0={T.gancho - 2} raio={170} a0={70} a1={-100} cor={KAEN.destaque} dir={-1} />
        <ArcoCorte x={-160} y={-290} f={f} f0={T.corte2 - 2} raio={330} a0={-60} a1={20} />
        <Impacto x={96} y={-300} f={f} f0={T.corte2} tam={1.1} cor={REN.brilho} />
        <Poeira x={260} y={0} f={f} f0={T.corte2 + 2} dir={1} />

        {/* rajada */}
        {T.rajada.map((fh, i) => (
          <React.Fragment key={fh}>
            <Impacto x={(random(`rx${i}`) - 0.5) * 150 + (i % 2 ? -70 : 70)} y={-240 - random(`ry${i}`) * 130} f={f} f0={fh} tam={0.75} cor={i % 2 ? KAEN.brilho : REN.brilho} dur={6} />
            {i % 4 === 0 ? <ArcoCorte x={-160} y={-300} f={f} f0={fh - 2} raio={330} a0={-110} a1={40} /> : null}
          </React.Fragment>
        ))}

        {/* chute */}
        <Impacto x={-205} y={-250} f={f} f0={T.chute} tam={1.9} cor={corImp ?? KAEN.brilho} dur={10} />
        <Onda x={-205} y={-250} f={f} f0={T.chute} tam={1.4} cor={corImp ?? "#fff"} />
        {[632, 638, 644, 650].map((f0, i) => (
          <Poeira key={f0} x={-700 - i * 30} y={0} f={f} f0={f0} dir={1} tam={1.2 - i * 0.15} />
        ))}

        {/* salto e mergulho do Kaen */}
        <Poeira x={0} y={0} f={f} f0={T.saltoKaen + 2} tam={1.2} />
        <Onda x={0} y={0} f={f} f0={T.saltoKaen + 2} tam={0.9} achatada={0.2} />
        <Poeira x={-800} y={0} f={f} f0={696} dir={1} />
        <Impacto x={-760} y={-30} f={f} f0={T.esmaga} tam={2.6} cor={corImp ?? KAEN.brilho} dur={12} />
        <Onda x={-760} y={0} f={f} f0={T.esmaga} tam={2.4} achatada={0.2} cor={corImp ?? KAEN.brilho} dur={22} />
        <Onda x={-760} y={-40} f={f} f0={T.esmaga + 2} tam={1.8} dur={20} />
        <Poeira x={-760} y={0} f={f} f0={T.esmaga + 2} tam={2} n={14} />
        <Pedras x={-760} f={f} f0={T.esmaga} forca={f >= T.esmaga ? 3.2 : 0} larg={560} n={14} />
        <Poeira x={-1150} y={0} f={f} f0={724} dir={-1} />
      </Palco>
      {emRajada ? (
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <LinhasVelocidade f={f} modo="h" cor="#fff" n={26} opacidade={0.4} />
        </svg>
      ) : null}
      {f >= 690 && f < T.esmaga ? (
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <LinhasVelocidade f={f} modo="v" cor={KAEN.brilho} n={22} opacidade={0.45} />
        </svg>
      ) : null}
      <Clarao op={f >= T.chute + 4 && f < T.chute + 8 ? 0.6 - (f - T.chute - 4) * 0.15 : 0} />
      <Clarao op={f >= T.esmaga + 4 && f < T.esmaga + 10 ? 0.8 - (f - T.esmaga - 4) * 0.13 : 0} cor="#ffe1a8" />
    </>
  );
};

// Um lutador carregando energia (close).
const CargaSolo: React.FC<{ f: number; vis: Visual; ini: number; fim: number }> = ({ f, vis, ini, fim }) => {
  const eRen = vis.id === "ren";
  const base = eRen ? ren(f) : kaen(f);
  const k = lim((f - ini) / (fim - ini));
  const pose = misturar(POSES.carga, POSES.cargaGrito, Math.min(1, k * 1.6));
  const est = { ...base, pose: misturar(base.pose, pose, lim((f - ini) / 12)) };
  const cam: Cam = { x: est.x + est.face * 20, y: trilho(f, [[ini, -190], [fim, -230]], Easing.linear), z: trilho(f, [[ini, 1.25], [fim, 1.8]], Easing.in(Easing.quad)) };
  const raios: React.ReactNode[] = [];
  if (k > 0.12) {
    for (let i = 0; i < 3; i++) {
      const s = `rc-${vis.id}-${Math.floor(f / 2)}-${i}`;
      if (random(s) < 0.35 + k * 0.5) {
        const xa = est.x + (random(s + "a") - 0.5) * 620;
        const xb = est.x + (random(s + "b") - 0.5) * 320;
        raios.push(
          eRen ? (
            <Raio key={i} x1={xa} y1={-1100} x2={xb} y2={-random(s + "y") * 240} semente={s} cor={vis.destaque} larg={5 + k * 4} />
          ) : (
            <Raio key={i} x1={xb} y1={0} x2={xa} y2={-300 - random(s + "y") * 500} semente={s} cor={vis.destaque} larg={4 + k * 3} desvio={30} />
          ),
        );
      }
    }
  }
  return (
    <>
      <Palco f={f} cam={cam} tremor={2 + k * 12} tom={[vis.destaque, 0.08 + k * 0.14]}>
        <Cratera x={est.x} f={f} f0={ini + 24} cor={vis.destaque} tam={0.9 + k * 0.5} />
        <Aura x={est.x} y={0} f={f} cor={vis.destaque} cor2={eRen ? "#2a7bff" : "#ff3d00"} forca={0.35 + k * 0.85} id={vis.id} />
        <Pedras x={est.x} f={f} f0={ini + 6} forca={0.5 + k} n={14} />
        {raios}
        <Fig est={est} vis={vis} f={f} lamina={1 + k * 0.9} fogo={1 + k * 0.8} vento={1.3} brilho={0.6 + k} />
        <Onda x={est.x} y={0} f={f} f0={ini + 8} tam={1.4} achatada={0.2} cor={vis.brilho} />
        <Onda x={est.x} y={0} f={f} f0={ini + 60} tam={1.8} achatada={0.2} cor={vis.brilho} />
        <Onda x={est.x} y={0} f={f} f0={ini + 100} tam={2.2} achatada={0.2} cor={vis.brilho} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <LinhasVelocidade f={f} modo="radial" cor="#fff" n={46} miolo={430} cy={1050} opacidade={k * 0.5} />
        <Particulas f={f} cor={vis.brilho} n={30} vx={0} vy={-9} semente={`sobe-${vis.id}`} opacidade={0.4 + k * 0.6} />
      </svg>
      <Clarao op={f < ini + 5 ? 0.7 - (f - ini) * 0.14 : 0} cor={vis.brilho} />
      <Clarao op={f > fim - 6 ? (f - (fim - 6)) / 6 : 0} cor={vis.brilho} />
    </>
  );
};

const Duplo: React.FC<{ f: number }> = ({ f }) => {
  const t = f - T.duplo;
  const [sx, sy] = tremer(f, 6 + t * 0.4);
  return (
    <AbsoluteFill style={{ backgroundColor: "#04050f" }}>
      <svg width={W} height={H} style={{ position: "absolute", transform: `translate(${sx}px, ${sy}px)` }}>
        <DefsLutadores />
        <rect width={W} height={H} fill="#04050f" />
        <PainelOlhar vis={REN} f={f} topo={interpolate(t, [0, 6], [-700, 330], { easing: Easing.out(Easing.exp), ...clamp })} alt={560} dx={0} id="ren2" intenso={1} />
        <PainelOlhar vis={KAEN} f={f} topo={interpolate(t, [0, 6], [2000, 1010], { easing: Easing.out(Easing.exp), ...clamp })} alt={560} dx={0} id="kaen2" intenso={1} />
        <LinhasVelocidade f={f} modo="radial" cor="#fff" n={50} miolo={520} cy={960} opacidade={0.55} />
        {[0, 1, 2].map((i) => {
          const s = `dp-${Math.floor(f / 2)}-${i}`;
          return (
            <React.Fragment key={i}>
              <Raio x1={random(s) * W} y1={0} x2={random(s + "b") * W} y2={330} semente={s} cor={REN.destaque} larg={7} />
              <Raio x1={random(s + "c") * W} y1={H} x2={random(s + "d") * W} y2={1570} semente={s + "k"} cor={KAEN.destaque} larg={7} />
            </React.Fragment>
          );
        })}
      </svg>
      <Clarao op={t < 4 ? 0.8 - t * 0.2 : 0} />
      <Clarao op={t > 30 ? (t - 30) / 9 : 0} />
    </AbsoluteFill>
  );
};

const Decolagem: React.FC<{ f: number }> = ({ f }) => {
  const t = f - T.decolagem;
  const sobe = t > 0 ? t * t * 4.4 : 0;
  const cam: Cam = {
    x: -955,
    y: trilho(f, [[1050, -120], [T.decolagem + 2, -120], [T.ceu, -1700]], Easing.in(Easing.quad)),
    z: 0.95,
  };
  const poseR = t < 0 ? misturar(POSES.guardaLamina, POSES.agachado, lim((f - 1050) / 8)) : POSES.salto;
  const poseK = t < 0 ? misturar(POSES.guarda, POSES.agachado, lim((f - 1050) / 8)) : POSES.salto;
  const r: Estado = { x: -1150, alt: sobe, rot: 0, face: 1, esc: 1, pose: poseR };
  const k: Estado = { x: -760, alt: sobe * 0.96, rot: 0, face: -1, esc: 1, pose: poseK };
  return (
    <>
      <Palco f={f} cam={cam} tremor={t >= 0 ? 22 * Math.max(0, 1 - t / 16) : 3}>
        <Cratera x={-760} f={f} f0={900} tam={1.3} />
        <Cratera x={-1150} f={f} f0={900} cor={REN.destaque} tam={1.3} />
        {t > 0 ? (
          <>
            <rect x={-1150 - 26} y={-sobe - 200} width={52} height={sobe + 200} fill={REN.destaque} opacity={0.75 * Math.max(0, 1 - t / 26)} />
            <rect x={-1150 - 9} y={-sobe - 200} width={18} height={sobe + 200} fill="#fff" opacity={Math.max(0, 1 - t / 26)} />
            <rect x={-760 - 26} y={-sobe - 200} width={52} height={sobe + 200} fill={KAEN.destaque} opacity={0.75 * Math.max(0, 1 - t / 26)} />
            <rect x={-760 - 9} y={-sobe - 200} width={18} height={sobe + 200} fill="#fff" opacity={Math.max(0, 1 - t / 26)} />
          </>
        ) : null}
        <Fig est={r} vis={REN} f={f} brilho={1.2} lamina={1.6} />
        <Fig est={k} vis={KAEN} f={f} brilho={1.2} fogo={1.6} />
        <Onda x={-1150} y={0} f={f} f0={T.decolagem} tam={1.6} achatada={0.2} cor={REN.brilho} />
        <Onda x={-760} y={0} f={f} f0={T.decolagem} tam={1.6} achatada={0.2} cor={KAEN.brilho} />
        <Poeira x={-1150} y={0} f={f} f0={T.decolagem} tam={1.8} n={12} />
        <Poeira x={-760} y={0} f={f} f0={T.decolagem} tam={1.8} n={12} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {t > 4 ? <LinhasVelocidade f={f} modo="v" cor="#fff" n={30} opacidade={lim((t - 4) / 8) * 0.6} /> : null}
      </svg>
      <Clarao op={f < 1056 ? 1 - (f - 1050) / 6 : 0} />
    </>
  );
};

// ---------- Combate no céu (espaço da tela) ----------
const CHOQUES = T.aereos as number[][];
const ULT = CHOQUES[CHOQUES.length - 1];
const posAereo = (f: number, lado: 1 | -1): [number, number] => {
  const c0 = CHOQUES[0];
  if (f <= c0[0]) {
    const t = E.sai(lim((f - T.ceu) / (c0[0] - T.ceu)));
    return [lerp(540 + lado * 420, c0[1] + lado * 50, t), lerp(2150, c0[2], t)];
  }
  if (f >= ULT[0]) {
    const t = lim((f - T.separacao) / 14);
    return [ULT[1] + lado * 50 + lado * 760 * t, ULT[2] + 1500 * t * t - 240 * t];
  }
  let i = 0;
  while (CHOQUES[i + 1][0] <= f) i++;
  const a = CHOQUES[i];
  const b = CHOQUES[i + 1];
  const t = E.entraSai((f - a[0]) / (b[0] - a[0]));
  const dx = b[1] - a[1];
  const dy = b[2] - a[2];
  const comp = Math.hypot(dx, dy) || 1;
  const arco = Math.sin(t * Math.PI) * 190 * lado * (i % 2 ? -1 : 1);
  return [lerp(a[1], b[1], t) + lado * 50 + (-dy / comp) * arco, lerp(a[2], b[2], t) + (dx / comp) * arco];
};

const Rastro: React.FC<{ f: number; lado: 1 | -1; vis: Visual }> = ({ f, lado, vis }) => {
  const pts: [number, number][] = [];
  for (let j = 0; j <= 12; j++) pts.push(posAereo(f - j * 0.55, lado));
  return (
    <g strokeLinecap="round">
      {pts.slice(0, -1).map((p, j) => (
        <line key={j} x1={p[0]} y1={p[1]} x2={pts[j + 1][0]} y2={pts[j + 1][1]} stroke={vis.destaque} strokeWidth={44 - j * 3.2} opacity={0.75 * (1 - j / 12)} />
      ))}
      {pts.slice(0, 7).map((p, j) => (
        <line key={`n${j}`} x1={p[0]} y1={p[1]} x2={pts[j + 1][0]} y2={pts[j + 1][1]} stroke="#fff" strokeWidth={18 - j * 2.4} opacity={1 - j / 8} />
      ))}
      <circle cx={pts[0][0]} cy={pts[0][1]} r={64} fill={`url(#brasa-${vis.id})`} />
    </g>
  );
};

const CeuLuta: React.FC<{ f: number }> = ({ f }) => {
  const imp = modoImpacto(f, ULT[0]);
  const travados = f >= ULT[0] && f < T.separacao;
  const tl = f - ULT[0];
  const zoom = travados ? 1 + lim(tl / 30) * 0.3 : f >= T.separacao ? Math.max(1, 1.3 - (f - T.separacao) * 0.03) : 1;
  let tremor = 0;
  CHOQUES.forEach((c) => {
    if (f >= c[0] && f < c[0] + 6) tremor = Math.max(tremor, 16 * (1 - (f - c[0]) / 6));
  });
  if (travados) tremor = 8 + tl * 0.5;
  if (f >= T.separacao && f < T.separacao + 12) tremor = 40 * (1 - (f - T.separacao) / 12);
  const [sx, sy] = tremer(f, tremor);
  const corMono = imp === 1 ? "#000" : "#fff";
  const subida = lim((f - T.ceu) / 14);

  // Lutadores visíveis só nos instantes de choque.
  const figuras: React.ReactNode[] = [];
  CHOQUES.forEach((c, i) => {
    const eUlt = i === CHOQUES.length - 1;
    const visivel = eUlt ? f >= c[0] - 1 && f < T.separacao + 2 : f >= c[0] - 1 && f <= c[0] + 3;
    if (!visivel) return;
    const s = eUlt ? 1.0 : 0.86;
    const giro = eUlt ? 0 : (random(`giro${i}`) - 0.5) * 70;
    const jit = eUlt ? (random(`jl${f}`) - 0.5) * 8 : 0;
    const poseR = eUlt ? TRAVA_REN : i % 2 ? POSES.corte : POSES.corteHoriz;
    const poseK = eUlt ? POSES.soco : i % 3 === 0 ? POSES.ataqueAereo : i % 3 === 1 ? POSES.gancho : POSES.chute;
    const pulo = { alt: 0, rot: 0, esc: 1 };
    const pernasAr = (p: typeof poseR) => ({ ...p, pF: [28, -66] as [number, number], pT: [-44, -58] as [number, number] });
    figuras.push(
      <g key={i} transform={`rotate(${giro} ${c[1]} ${c[2]})`}>
        <g transform={`translate(${c[1] - 214 * s + jit} ${c[2] + 300 * s}) scale(${s})`}>
          <Lutador est={{ ...pulo, x: 0, face: 1, pose: pernasAr(poseR) }} vis={REN} frame={f} mono={imp ? corMono : undefined} lamina={1.4} brilho={imp ? 0 : 1} vento={1.4} />
        </g>
        <g transform={`translate(${c[1] + 214 * s - jit} ${c[2] + 300 * s}) scale(${s})`}>
          <Lutador est={{ ...pulo, x: 0, face: -1, pose: pernasAr(poseK) }} vis={KAEN} frame={f} mono={imp ? corMono : undefined} fogo={1.5} brilho={imp ? 0 : 1} vento={1.4} />
        </g>
      </g>,
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050818" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <DefsCena />
        <DefsLutadores />
        <g transform={`translate(${sx} ${sy}) translate(540 860) scale(${zoom}) translate(-540 -860)`}>
          {imp ? (
            <>
              <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={imp === 1 ? "#fff" : "#000"} />
              <LinhasVelocidade f={f} modo="radial" cor={imp === 1 ? "#000" : "#fff"} n={70} miolo={330} cy={860} />
            </>
          ) : (
            <>
              <g transform="translate(540 960) scale(1.25) translate(-540 -960)">
                <Ceu f={f * 3} cam={{ x: 0, y: (1 - subida) * 2600, z: 1 }} lua={{ x: 540, y: 880, r: 330 }} nuvens={0.9} />
              </g>
              <rect x={-200} y={1500} width={W + 400} height={700} fill="url(#nevoa)" opacity={0.7} />
            </>
          )}
          {!travados || imp ? null : <LinhasVelocidade f={f} modo="radial" cor="#fff" n={40} miolo={420} cy={860} opacidade={0.45} />}
          {f < ULT[0] - 1 || f >= T.separacao ? (
            <>
              <Rastro f={f} lado={-1} vis={REN} />
              <Rastro f={f} lado={1} vis={KAEN} />
            </>
          ) : null}
          {figuras}
          {CHOQUES.map((c, i) => {
            const eUlt = i === CHOQUES.length - 1;
            return (
              <React.Fragment key={i}>
                <Onda x={c[1]} y={c[2]} f={f} f0={c[0]} tam={eUlt ? 2.4 : 0.95} cor={imp ? corMono : "#fff"} dur={eUlt ? 24 : 14} />
                <Impacto x={c[1]} y={c[2]} f={f} f0={c[0]} tam={eUlt ? 2.2 : 1.15} cor={imp ? corMono : i % 2 ? KAEN.brilho : REN.brilho} dur={eUlt ? 10 : 7} />
              </React.Fragment>
            );
          })}
          {travados && !imp
            ? [0, 1, 2].map((i) => {
                const f0 = ULT[0] + Math.floor(tl / 3) * 3 - i * 3;
                return (
                  <React.Fragment key={i}>
                    <Impacto x={ULT[1] + (random(`ux${f0}`) - 0.5) * 80} y={ULT[2] + (random(`uy${f0}`) - 0.5) * 80} f={f} f0={f0} tam={0.6} cor={f0 % 2 ? REN.brilho : KAEN.brilho} />
                    {f0 % 6 === 0 ? <Onda x={ULT[1]} y={ULT[2]} f={f} f0={f0} tam={1.3} dur={14} /> : null}
                  </React.Fragment>
                );
              })
            : null}
          {travados && !imp
            ? [0, 1, 2, 3].map((i) => {
                const s = `rl-${Math.floor(f / 2)}-${i}`;
                const a = random(s) * Math.PI * 2;
                return <Raio key={i} x1={ULT[1]} y1={ULT[2]} x2={ULT[1] + Math.cos(a) * 520} y2={ULT[2] + Math.sin(a) * 520} semente={s} cor={i % 2 ? KAEN.destaque : REN.destaque} larg={6} />;
              })
            : null}
          <Onda x={ULT[1]} y={ULT[2]} f={f} f0={T.separacao} tam={3.4} dur={20} />
          <Onda x={ULT[1]} y={ULT[2]} f={f} f0={T.separacao + 3} tam={2.6} dur={20} cor="#ffe9a8" />
          <Impacto x={ULT[1]} y={ULT[2]} f={f} f0={T.separacao} tam={3} cor="#fff" dur={12} />
        </g>
        {f < T.ceu + 16 ? <LinhasVelocidade f={f} modo="v" cor="#fff" n={30} opacidade={0.6 * (1 - subida)} /> : null}
      </svg>
      {CHOQUES.slice(0, -1).map((c, i) => (
        <Clarao key={i} op={f >= c[0] && f < c[0] + 2 ? 0.35 : 0} />
      ))}
      <Clarao op={f >= ULT[0] + 4 && f < ULT[0] + 9 ? 0.8 - (f - ULT[0] - 4) * 0.16 : 0} />
      <Clarao op={f >= T.separacao && f < T.separacao + 8 ? 1 - (f - T.separacao) / 8 : 0} />
      <Clarao op={f > T.pouso - 4 ? (f - (T.pouso - 4)) / 4 : 0} cor="#000" />
    </AbsoluteFill>
  );
};

const Pouso: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = { x: 0, y: trilho(f, [[1250, -260], [1272, -110], [1350, -100]]), z: trilho(f, [[1250, 0.8], [1350, 0.88]], Easing.linear) };
  const r = ren(f);
  const k = kaen(f);
  let tremor = 0;
  T.pousos.forEach((p) => {
    if (f >= p && f < p + 12) tremor = Math.max(tremor, 20 * (1 - (f - p) / 12));
  });
  const tiras = f - 1304;
  return (
    <>
      <Palco f={f} cam={cam} tremor={tremor}>
        <Fig est={r} vis={REN} f={f} fn={ren} brilho={0.5} />
        <Fig est={k} vis={KAEN} f={f} fn={kaen} brilho={0.5} />
        <Onda x={-390} y={0} f={f} f0={T.pousos[0]} tam={1.5} achatada={0.2} />
        <Onda x={390} y={0} f={f} f0={T.pousos[1]} tam={1.5} achatada={0.2} />
        {[0, 5, 10, 15].map((d, i) => (
          <React.Fragment key={d}>
            <Poeira x={-390 - i * 12} y={0} f={f} f0={T.pousos[0] + d} dir={1} tam={1.5 - i * 0.2} />
            <Poeira x={390 + i * 12} y={0} f={f} f0={T.pousos[1] + d} dir={-1} tam={1.5 - i * 0.2} />
          </React.Fragment>
        ))}
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <DefsLutadores />
        <Particulas f={f} cor="#ffd27a" n={16} vx={-1.5} vy={-2.4} semente="brasa" opacidade={0.8} />
        {tiras >= 0 ? (
          <>
            <PainelOlhar vis={REN} f={f} topo={250} alt={300} corte={150} dx={interpolate(tiras, [0, 7], [-1200, 0], { easing: Easing.out(Easing.exp), ...clamp })} id="ren3" intenso={0.8} />
            <PainelOlhar vis={KAEN} f={f} topo={570} alt={300} corte={150} dx={interpolate(tiras, [3, 10], [1200, 0], { easing: Easing.out(Easing.exp), ...clamp })} id="kaen3" intenso={0.8} />
          </>
        ) : null}
      </svg>
      <Legenda f={f} ini={1312} fim={1348}>
        — Última técnica.
      </Legenda>
      <Clarao op={f < 1256 ? 1 - (f - 1250) / 6 : 0} cor="#000" />
    </>
  );
};

const Tecnica: React.FC<{ f: number; vis: Visual; ini: number; fim: number; fNome: number; linha1: string; linha2: string; kanji: string }> = ({
  f,
  vis,
  ini,
  fim,
  fNome,
  linha1,
  linha2,
  kanji,
}) => {
  const eRen = vis.id === "ren";
  const est = eRen ? ren(f) : kaen(f);
  const k = lim((f - ini) / (fim - ini));
  const cam: Cam = { x: est.x + est.face * 70, y: trilho(f, [[ini, -240], [fim, -280]], Easing.linear), z: trilho(f, [[ini, 1.3], [fim, 1.55]], Easing.linear) };
  const esq = esqueleto(est.pose);
  const foco = noMundo(est, eRen ? esq.pontaLamina : esq.maoF);
  const t = f - fNome;
  const efeitos: React.ReactNode[] = [];
  if (eRen) {
    for (let i = 0; i < 4; i++) {
      const s = `tr-${Math.floor(f / 2)}-${i}`;
      if (random(s) < 0.3 + k * 0.6) efeitos.push(<Raio key={i} x1={foco[0] + (random(s + "x") - 0.5) * 900} y1={-1500} x2={foco[0]} y2={foco[1]} semente={s} cor={vis.destaque} larg={6 + k * 4} desvio={60} />);
    }
  } else {
    for (let i = 0; i < 16; i++) {
      const fase = ((f * 0.06 + random(`tk${i}`)) % 1 + 1) % 1;
      const a = random(`tka${i}`) * Math.PI * 2 + f * 0.12;
      const dist = (1 - fase) * 420;
      efeitos.push(<circle key={i} cx={foco[0] + Math.cos(a) * dist} cy={foco[1] + Math.sin(a) * dist} r={6 + fase * 16} fill={i % 2 ? "#fff1b8" : vis.destaque} opacity={0.3 + fase * 0.7} />);
    }
  }
  const nomeX = (d: number) => interpolate(t - d, [0, 7], [eRen ? -1100 : 1100, 0], { easing: Easing.out(Easing.exp), ...clamp });
  return (
    <>
      <Palco f={f} cam={cam} tremor={3 + k * 9} tom={[vis.destaque, 0.1 + k * 0.12]}>
        <Aura x={est.x} y={0} f={f} cor={vis.destaque} cor2={eRen ? "#2a7bff" : "#ff3d00"} forca={0.5 + k * 0.6} id={vis.id} />
        <Pedras x={est.x} f={f} f0={ini} forca={0.8 + k} n={12} />
        {efeitos}
        <circle cx={foco[0]} cy={foco[1]} r={(50 + k * (eRen ? 110 : 80)) * (0.9 + 0.1 * Math.sin(f * 1.3))} fill={`url(#brasa-${vis.id})`} />
        <Fig est={est} vis={vis} f={f} lamina={1.2 + k * 1.2} fogo={1.2 + k * 1.2} vento={1.4} brilho={0.8 + k} />
        <circle cx={foco[0]} cy={foco[1]} r={eRen ? 18 + k * 34 : 10 + k * 16} fill="#fff" opacity={0.9} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <LinhasVelocidade f={f} modo="radial" cor="#fff" n={44} miolo={470} cy={1000} opacidade={0.25 + k * 0.3} />
      </svg>
      {t >= 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 80,
              [eRen ? "right" : "left"]: 20,
              fontFamily: KANJI,
              fontWeight: 700,
              fontSize: 520,
              lineHeight: 1,
              color: vis.destaque,
              opacity: 0.22 * lim(t / 6),
            }}
          >
            {kanji}
          </div>
          <Letreiro tam={210} cor="#fff" sombra={eRen ? "#0b6f9c" : "#c2410c"} style={{ [eRen ? "left" : "right"]: 50, top: 200, transform: `translateX(${nomeX(0)}px) skewX(-8deg)` }}>
            {linha1}
          </Letreiro>
          <Letreiro tam={210} cor={vis.brilho} sombra={eRen ? "#06142c" : "#2a0b06"} style={{ [eRen ? "left" : "right"]: 110, top: 420, transform: `translateX(${nomeX(4)}px) skewX(-8deg)` }}>
            {linha2}
          </Letreiro>
        </>
      ) : null}
      <Clarao op={f < ini + 4 ? 0.7 - (f - ini) * 0.18 : 0} cor={vis.brilho} />
      <Clarao op={t >= 0 && t < 4 ? 0.6 - t * 0.15 : 0} />
    </>
  );
};

const Feixes: React.FC<{ f: number }> = ({ f }) => {
  const t = f - T.disparo;
  const r = ren(f);
  const k = kaen(f);
  const ponta = noMundo(r, esqueleto(r.pose).pontaLamina);
  const punho = noMundo(k, esqueleto(k.pose).maoF);
  const y = (ponta[1] + punho[1]) / 2;
  const cresce = lim(t / 6);
  const mx = t > 6 ? Math.sin((t - 6) * 0.33) * 90 + Math.sin((t - 6) * 0.11) * 50 : 0;
  const fimK = lim((f - (T.explosao - 22)) / 22);
  const raioEsfera = (60 + t * 1.5) * cresce + fimK * fimK * 1700;
  const larg = 70 + t * 0.7;
  const cam: Cam = { x: 0, y: -170, z: trilho(f, [[1468, 0.95], [1476, 0.82], [T.explosao, 0.9]]) };
  const tremor = t < 0 ? 4 : 8 + t * 0.22;
  return (
    <>
      <Palco f={f} cam={cam} tremor={tremor}>
        <Cratera x={0} f={f} f0={T.disparo + 10} cor="#ffe9a8" tam={1.6} />
        <Pedras x={0} f={f} f0={T.disparo + 6} forca={t > 6 ? 1.6 : 0} n={18} larg={1000} />
        <Aura x={r.x} y={0} f={f} cor={REN.destaque} cor2="#2a7bff" forca={0.9} id="ren" />
        <Aura x={k.x} y={0} f={f} cor={KAEN.destaque} cor2="#ff3d00" forca={0.9} id="kaen" />
        <Fig est={r} vis={REN} f={f} lamina={2} brilho={1.4} vento={1.6} />
        <Fig est={k} vis={KAEN} f={f} fogo={2} brilho={1.4} vento={1.6} />
        {t >= 0 ? (
          <>
            <Feixe x1={ponta[0] - 60} x2={lerp(ponta[0], mx, cresce)} y={y} f={f} cor={REN.destaque} cor2="#2a7bff" larg={larg} semente="fr" />
            <Feixe x1={punho[0] + 60} x2={lerp(punho[0], mx, cresce)} y={y} f={f} cor={KAEN.destaque} cor2="#ff3d00" larg={larg} semente="fk" />
            {[0, 1, 2, 3, 4].map((i) => {
              const s = `fe-${Math.floor(f / 2)}-${i}`;
              const a = random(s) * Math.PI * 2;
              const d = raioEsfera + 120 + random(s + "d") * 260;
              return <Raio key={i} x1={mx} y1={y} x2={mx + Math.cos(a) * d} y2={y + Math.sin(a) * d * 0.9} semente={s} cor={i % 2 ? KAEN.destaque : REN.destaque} larg={6} />;
            })}
            <circle cx={mx} cy={y} r={raioEsfera * 1.7} fill="url(#esfera)" opacity={0.55} />
            <circle cx={mx} cy={y} r={raioEsfera} fill="url(#esfera)" />
            <circle cx={mx} cy={y} r={raioEsfera * 0.55} fill="#fff" />
            {[0, 1, 2, 3].map((i) => (
              <Onda key={i} x={mx} y={0} f={f} f0={T.disparo + 6 + i * 22} tam={2} achatada={0.18} cor="#ffe9a8" dur={22} />
            ))}
            <Onda x={0} y={y} f={f} f0={T.disparo + 5} tam={2.2} dur={20} />
          </>
        ) : null}
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {t >= 0 ? <LinhasVelocidade f={f} modo="radial" cor="#fff" n={50} miolo={480} cy={1060} opacidade={0.3 + lim(t / 80) * 0.4} /> : null}
      </svg>
      <Clarao op={t >= 0 && t < 5 ? 0.9 - t * 0.18 : 0} />
      <Clarao op={fimK * 1.3} />
    </>
  );
};

const Cruzamento: React.FC<{ f: number }> = ({ f }) => {
  const t = f - T.explosao;
  const tc = f - T.cruzamento;
  const escuro = tc >= 0 && tc < 4;
  const k = lim((f - 1578) / (T.cruzamento - 1578));
  const e = Math.pow(k, 1.6);
  const xr = tc >= 0 ? 800 + tc * 30 : lerp(-260, 470, e);
  const xk = tc >= 0 ? 280 - tc * 30 : lerp(1340, 610, e);
  const poseR = tc >= 0 ? POSES.posCorte : misturar(POSES.correr, POSES.cortePrep, lim((k - 0.6) / 0.4));
  const poseK = tc >= 0 ? POSES.posSoco : misturar(POSES.correr, POSES.socoPrep, lim((k - 0.6) / 0.4));
  const mono = escuro ? "#fff" : "#000";
  const mostra = f >= 1578 && tc < 10;
  return (
    <AbsoluteFill style={{ backgroundColor: escuro ? "#000" : "#fff" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {t < 16 ? (
          <>
            <Onda x={540} y={1000} f={f} f0={T.explosao} tam={3.4} cor="#b9c4ff" dur={16} />
            <Onda x={540} y={1000} f={f} f0={T.explosao + 4} tam={3.4} cor="#ffd9a8" dur={16} />
          </>
        ) : null}
        {mostra ? (
          <>
            <LinhasVelocidade f={f} modo="h" cor={mono} n={46} opacidade={escuro ? 1 : 0.85} />
            <g transform="translate(0 1250) scale(1.5)">
              <Lutador est={{ x: xr / 1.5, alt: 0, rot: 0, face: 1, esc: 1, pose: poseR }} vis={REN} frame={f} mono={mono} />
              <Lutador est={{ x: xk / 1.5, alt: 0, rot: 0, face: -1, esc: 1, pose: poseK }} vis={KAEN} frame={f} mono={mono} />
            </g>
          </>
        ) : null}
        {escuro ? (
          <>
            <polygon points={`-40,1210 ${W + 40},640 ${W + 40},668 -40,1226`} fill="#fff" />
            <polygon points={`-40,1150 ${W + 40},560 ${W + 40},572 -40,1158`} fill={REN.destaque} />
            <polygon points={`-40,1290 ${W + 40},740 ${W + 40},752 -40,1298`} fill={KAEN.destaque} />
            <Impacto x={540} y={930} f={f} f0={T.cruzamento} tam={2.6} cor="#fff" dur={6} />
          </>
        ) : null}
      </svg>
      <Clarao op={tc >= 4 ? lim((tc - 4) / 6) : 0} />
    </AbsoluteFill>
  );
};

const Desfecho: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = {
    x: 0,
    y: trilho(f, [[1620, -110], [T.continua, -110], [1800, -230]]),
    z: trilho(f, [[1620, 0.86], [1800, 0.98]], Easing.linear),
  };
  const r = renFim(f);
  const k = kaenFim(f);
  const tm = f - T.marcas;
  const tc = f - T.continua;
  const apaga = lim((f - T.marcas) / 20);
  return (
    <>
      <Palco f={f} cam={cam} tremor={tm >= 0 && tm < 8 ? 12 * (1 - tm / 8) : 0}>
        <Cratera x={0} f={f} f0={1500} cor="#ffb86b" tam={2.2} />
        {[-220, -80, 60, 200].map((x, i) => (
          <ellipse key={x} cx={x + Math.sin(f * 0.02 + i) * 30} cy={-70 - ((f - 1620) * (0.5 + i * 0.12)) % 320} rx={120 + i * 14} ry={46} fill="#8a90bd" opacity={0.16 * (1 - (((f - 1620) * (0.5 + i * 0.12)) % 320) / 320)} />
        ))}
        <Fig est={r} vis={REN} f={f} lamina={1 - apaga} vento={0.7} />
        <Fig est={k} vis={KAEN} f={f} fogo={1 - apaga} vento={0.7} />
        {tm >= 0 && tm < 7 ? (
          <>
            <line x1={k.x - 110} y1={-360} x2={k.x + 110} y2={-150} stroke="#fff" strokeWidth={14 * (1 - tm / 7)} strokeLinecap="round" />
            <line x1={k.x - 110} y1={-360} x2={k.x + 110} y2={-150} stroke={REN.destaque} strokeWidth={30 * (1 - tm / 7)} strokeLinecap="round" opacity={0.5} />
          </>
        ) : null}
        <Impacto x={k.x} y={-250} f={f} f0={T.marcas} tam={0.9} cor={REN.brilho} />
        <Impacto x={r.x} y={-250} f={f} f0={T.marcas} tam={1.2} cor={KAEN.brilho} />
        <Poeira x={k.x} y={0} f={f} f0={T.quedas[0] - 4} tam={0.8} />
        <Poeira x={r.x} y={0} f={f} f0={T.quedas[1] - 4} tam={0.8} />
      </Palco>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Particulas f={f} cor="#ffd27a" n={18} vx={-1.2} vy={-2} semente="brasa" opacidade={0.8} />
        <Particulas f={f} cor="#8fefff" n={14} vx={1} vy={-1.6} semente="centelha" opacidade={0.7} />
      </svg>
      <Legenda f={f} ini={1736} fim={1786}>
        — Heh... empate. De novo.
      </Legenda>
      {tc >= 0 ? (
        <Letreiro
          tam={150}
          cor="#fff"
          sombra="#b3123f"
          style={{ left: 0, right: 0, top: 760, textAlign: "center", opacity: lim(tc / 8), transform: `skewX(-8deg) scale(${interpolate(tc, [0, 8], [1.25, 1], { easing: Easing.out(Easing.cubic), ...clamp })})` }}
        >
          CONTINUA...
        </Letreiro>
      ) : null}
      <Clarao op={1 - (f - 1620) / 34} />
      <Clarao op={(f - 1782) / 16} cor="#000" />
    </>
  );
};

// =====================================================================
// Composição
// =====================================================================
export const LutaAnime: React.FC = () => {
  const f = useCurrentFrame();
  let cena: React.ReactNode;
  if (f < T.olhares) cena = <Abertura f={f} />;
  else if (f < T.folha) cena = <Olhares f={f} />;
  else if (f < T.investida) cena = <Folha f={f} />;
  else if (f < T.corridas[1]) cena = <Corrida f={f} vis={REN} f0={T.corridas[0]} />;
  else if (f < 432) cena = <Corrida f={f} vis={KAEN} f0={T.corridas[1]} />;
  else if (f < T.troca) cena = <Choque f={f} />;
  else if (f < T.carga) cena = <Troca f={f} />;
  else if (f < T.cargaKaen) cena = <CargaSolo f={f} vis={REN} ini={T.cargaRen} fim={T.cargaKaen} />;
  else if (f < T.duplo) cena = <CargaSolo f={f} vis={KAEN} ini={T.cargaKaen} fim={T.duplo} />;
  else if (f < T.aereo) cena = <Duplo f={f} />;
  else if (f < T.ceu) cena = <Decolagem f={f} />;
  else if (f < T.pouso) cena = <CeuLuta f={f} />;
  else if (f < T.final) cena = <Pouso f={f} />;
  else if (f < T.viraKaen) cena = <Tecnica f={f} vis={REN} ini={T.final} fim={T.viraKaen} fNome={T.tecnicaRen} linha1="TROVÃO" linha2="CELESTE!" kanji="雷" />;
  else if (f < 1468) cena = <Tecnica f={f} vis={KAEN} ini={T.viraKaen} fim={1468} fNome={T.tecnicaKaen} linha1="PUNHO" linha2="SOLAR!" kanji="炎" />;
  else if (f < T.explosao) cena = <Feixes f={f} />;
  else if (f < T.desfecho) cena = <Cruzamento f={f} />;
  else cena = <Desfecho f={f} />;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("luta/trilha.wav")} />
      {cena}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
          opacity: 1 - Math.min(lim((f - (T.explosao - 16)) / 14), lim((T.desfecho + 30 - f) / 20)),
        }}
      />
    </AbsoluteFill>
  );
};

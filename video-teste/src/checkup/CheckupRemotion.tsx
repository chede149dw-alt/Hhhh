import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import T from "./timing.json";

// ---------- Fontes ----------
const SANS = "Inter";
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });

// ---------- Paleta ----------
const C = {
  fundo: "#0B0D1A",
  texto: "#F5F6FA",
  suave: "#8A90B0",
  linha: "rgba(255,255,255,0.08)",
  azul: "#4F7CFF",
  violeta: "#9B6BFF",
  menta: "#3EE6B0",
  coral: "#FF6B6B",
  cartao: "#14182B",
};

const W = 1080;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Faixa = readonly number[];

// ---------- Fundo ----------
const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame / 90;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.fundo,
        backgroundImage: `radial-gradient(${C.linha} 2px, transparent 2px)`,
        backgroundSize: "54px 54px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -350 + Math.sin(a) * 80,
          top: -300 + Math.cos(a * 0.8) * 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violeta}40, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          right: -450 + Math.cos(a * 0.9) * 90,
          bottom: -350 + Math.sin(a * 1.1) * 70,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.azul}38, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Cabeçalho com progresso do check-up ----------
const Cabecalho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = interpolate(frame, [T.intro[0] + 40, T.intro[0] + 58], [0, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 90,
        right: 90,
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * -30}px)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: C.suave }}>
          CHECK-UP · REMOTION
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.suave, fontVariantNumeric: "tabular-nums" }}>
          {String(frame).padStart(3, "0")} / {T.duration}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
        {T.checks.map((f, i) => {
          const p = spring({ frame: frame - f, fps, config: { damping: 18 } });
          return (
            <div key={i} style={{ flex: 1, height: 12, borderRadius: 6, background: C.linha, overflow: "hidden" }}>
              <div
                style={{
                  width: `${p * 100}%`,
                  height: "100%",
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${C.azul}, ${C.menta})`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Cena com entrada/saída ----------
const Cena: React.FC<{ faixa: Faixa; saida?: boolean; children: React.ReactNode }> = ({
  faixa,
  saida = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const [ini, fim] = faixa;
  if (frame < ini || frame >= fim) return null;
  const dentro = interpolate(frame, [ini, ini + 14], [0, 1], { ...clamp, easing: ease });
  const fora = saida ? interpolate(frame, [fim - 12, fim], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill
      style={{
        opacity: dentro * (1 - fora),
        transform: `translateY(${(1 - dentro) * 80 - fora * 80}px) scale(${1 - fora * 0.04})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Rotulo: React.FC<{ numero: string; titulo: string }> = ({ numero, titulo }) => (
  <div style={{ position: "absolute", top: 300, left: 90, right: 90 }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.azul, letterSpacing: 4 }}>{numero}</div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: C.texto, lineHeight: 1.05, marginTop: 10 }}>
      {titulo}
    </div>
  </div>
);

const SeloOk: React.FC<{ em: number }> = ({ em }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - em, fps, config: { damping: 11, stiffness: 160 } });
  if (frame < em) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 220,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "22px 44px",
          borderRadius: 999,
          background: `${C.menta}1F`,
          border: `3px solid ${C.menta}`,
          transform: `scale(${p})`,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 44,
          color: C.menta,
        }}
      >
        <Visto tamanho={44} cor={C.menta} progresso={p} /> OK
      </div>
    </div>
  );
};

const Visto: React.FC<{ tamanho: number; cor: string; progresso: number; espessura?: number }> = ({
  tamanho,
  cor,
  progresso,
  espessura = 5,
}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
    <path
      d="M4 12.5 L9.5 18 L20 6.5"
      fill="none"
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - Math.min(1, progresso)}
    />
  </svg>
);

// ---------- Intro ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palavra = "Remotion";
  const tag = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const sub = interpolate(frame, [34, 50], [0, 1], { ...clamp, easing: ease });
  const varredura = interpolate(frame, [20, 60], [-200, W + 200], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: 8,
          color: C.menta,
          padding: "14px 30px",
          border: `2px solid ${C.menta}80`,
          borderRadius: 999,
          transform: `scale(${tag})`,
          marginBottom: 50,
        }}
      >
        CHECK-UP
      </div>
      <div style={{ display: "flex", position: "relative", overflow: "hidden", padding: "0 20px" }}>
        {palavra.split("").map((letra, i) => {
          const p = spring({ frame: frame - 10 - i * 3, fps, config: { damping: 12, stiffness: 140 } });
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 190,
                color: C.texto,
                display: "inline-block",
                transform: `translateY(${(1 - p) * 140}px) rotate(${(1 - p) * 12}deg)`,
                opacity: Math.min(1, p * 1.5),
              }}
            >
              {letra}
            </span>
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: varredura,
            width: 120,
            background: `linear-gradient(90deg, transparent, ${C.azul}66, transparent)`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 46,
          color: C.suave,
          marginTop: 30,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        teste de recursos · 4 itens
      </div>
    </AbsoluteFill>
  );
};

// ---------- 01 · Física de mola ----------
const Mola: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ini = T.mola[0];
  const bolas = [
    { x: 250, damping: 3, cor: C.coral },
    { x: 540, damping: 9, cor: C.violeta },
    { x: 830, damping: 30, cor: C.azul },
  ];
  const TOPO = 640;
  return (
    <AbsoluteFill>
      <Rotulo numero="01" titulo="Física de mola" />
      <div style={{ position: "absolute", top: TOPO - 6, left: 130, right: 130, height: 12, borderRadius: 6, background: C.cartao, border: `2px solid ${C.linha}` }} />
      {bolas.map((b, i) => {
        const p = spring({ frame: frame - ini - 12 - i * 5, fps, config: { damping: b.damping, stiffness: 90, mass: 1 } });
        const comp = 40 + p * 520;
        return (
          <React.Fragment key={i}>
            <svg style={{ position: "absolute", left: b.x - 30, top: TOPO }} width={60} height={comp}>
              <path
                d={zigue(comp)}
                fill="none"
                stroke={C.suave}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: b.x - 70,
                top: TOPO + comp - 10,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${interpolateColors(0.55, [0, 1], [b.cor, "#ffffff"])}, ${b.cor} 55%)`,
                boxShadow: `0 20px 60px ${b.cor}66`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: b.x - 140,
                width: 280,
                top: 1420,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 32,
                color: C.suave,
              }}
            >
              damping <span style={{ color: b.cor, fontWeight: 800 }}>{b.damping}</span>
            </div>
          </React.Fragment>
        );
      })}
      <SeloOk em={T.checks[0]} />
    </AbsoluteFill>
  );
};

// Caminho em zigue-zague de uma mola com altura h
const zigue = (h: number) => {
  const voltas = 12;
  const passo = h / voltas;
  let d = `M30 0`;
  for (let i = 0; i < voltas; i++) {
    const x = i === voltas - 1 ? 30 : i % 2 === 0 ? 8 : 52;
    d += ` L${x} ${passo * (i + 1)}`;
  }
  return d;
};

// ---------- 02 · Contador e progresso ----------
const Contador: React.FC = () => {
  const frame = useCurrentFrame();
  const ini = T.contador[0];
  const p = interpolate(frame, [ini + 10, ini + 62], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const R = 250;
  const circ = 2 * Math.PI * R;
  const cor = interpolateColors(p, [0, 0.5, 1], [C.coral, C.violeta, C.menta]);
  return (
    <AbsoluteFill>
      <Rotulo numero="02" titulo="Números e progresso" />
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 640, height: 640 }}>
          <svg width={640} height={640} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={320} cy={320} r={R} fill="none" stroke={C.cartao} strokeWidth={44} />
            <circle
              cx={320}
              cy={320}
              r={R}
              fill="none"
              stroke={cor}
              strokeWidth={44}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - p)}
            />
          </svg>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 170, color: C.texto, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(p * 100)}
              <span style={{ fontSize: 90, color: cor }}>%</span>
            </div>
          </AbsoluteFill>
        </div>
      </div>
      <SeloOk em={T.checks[1]} />
    </AbsoluteFill>
  );
};

// ---------- 03 · Gráfico ----------
const DADOS = [
  { rotulo: "Seg", valor: 42 },
  { rotulo: "Ter", valor: 65 },
  { rotulo: "Qua", valor: 51 },
  { rotulo: "Qui", valor: 94 },
  { rotulo: "Sex", valor: 73 },
];

const Grafico: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ini = T.grafico[0];
  const BASE = 1340;
  const ALT = 620;
  const LARG = 120;
  const GAP = 52;
  const total = DADOS.length * LARG + (DADOS.length - 1) * GAP;
  const x0 = (W - total) / 2;
  const maior = Math.max(...DADOS.map((d) => d.valor));
  return (
    <AbsoluteFill>
      <Rotulo numero="03" titulo="Dados viram gráfico" />
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <div
          key={g}
          style={{ position: "absolute", left: x0 - 30, width: total + 60, top: BASE - ALT * g, height: 2, background: C.linha }}
        />
      ))}
      {DADOS.map((d, i) => {
        const p = spring({ frame: frame - ini - 12 - i * 5, fps, config: { damping: 14, stiffness: 110 } });
        const h = (d.valor / 100) * ALT * p;
        const destaque = d.valor === maior;
        return (
          <React.Fragment key={d.rotulo}>
            <div
              style={{
                position: "absolute",
                left: x0 + i * (LARG + GAP),
                top: BASE - h,
                width: LARG,
                height: h,
                borderRadius: "18px 18px 6px 6px",
                background: destaque
                  ? `linear-gradient(180deg, ${C.menta}, ${C.azul})`
                  : `linear-gradient(180deg, ${C.violeta}, ${C.violeta}66)`,
                boxShadow: destaque ? `0 0 50px ${C.menta}55` : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: x0 + i * (LARG + GAP) - 20,
                width: LARG + 40,
                top: BASE - h - 66,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 44,
                color: destaque ? C.menta : C.texto,
                opacity: Math.min(1, p * 2),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(d.valor * Math.min(1, p))}
            </div>
            <div
              style={{
                position: "absolute",
                left: x0 + i * (LARG + GAP) - 20,
                width: LARG + 40,
                top: BASE + 24,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 34,
                color: C.suave,
              }}
            >
              {d.rotulo}
            </div>
          </React.Fragment>
        );
      })}
      <SeloOk em={T.checks[2]} />
    </AbsoluteFill>
  );
};

// ---------- 04 · Formas e cores ----------
const Formas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ini = T.formas[0];
  const N = 6;
  const CEL = 110;
  const GAP = 26;
  const total = N * CEL + (N - 1) * GAP;
  const x0 = (W - total) / 2;
  const y0 = 640;
  const celulas = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const atraso = (x + y) * 2;
      const p = spring({ frame: frame - ini - 6 - atraso, fps, config: { damping: 13, stiffness: 120 } });
      const onda = Math.sin((frame - ini) / 7 - (x + y) * 0.55);
      const cor = interpolateColors((x + y) / (2 * N - 2), [0, 0.5, 1], [C.coral, C.violeta, C.menta]);
      celulas.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x0 + x * (CEL + GAP),
            top: y0 + y * (CEL + GAP),
            width: CEL,
            height: CEL,
            borderRadius: `${p * 50}%`,
            background: interpolateColors(p, [0, 1], [C.cartao, cor]),
            border: `2px solid ${C.linha}`,
            transform: `rotate(${p * 90}deg) scale(${0.78 + p * 0.12 + onda * 0.1 * p})`,
          }}
        />,
      );
    }
  }
  return (
    <AbsoluteFill>
      <Rotulo numero="04" titulo="Formas e cores" />
      {celulas}
      <SeloOk em={T.checks[3]} />
    </AbsoluteFill>
  );
};

// ---------- Final ----------
const ITENS = ["Física de mola", "Números e progresso", "Dados viram gráfico", "Formas e cores"];

const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titulo = interpolate(frame, [T.final[0] + 2, T.final[0] + 16], [0, 1], { ...clamp, easing: ease });
  const selo = spring({ frame: frame - T.selo, fps, config: { damping: 10, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 90,
          right: 90,
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * 40}px)`,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 1.05,
          color: C.texto,
        }}
      >
        Tudo
        <br />
        <span style={{ color: C.menta }}>funcionando.</span>
      </div>
      <div style={{ position: "absolute", top: 640, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 26 }}>
        {ITENS.map((item, i) => {
          const f = T.checksFinal[i];
          const p = spring({ frame: frame - f, fps, config: { damping: 15 } });
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 36px",
                borderRadius: 28,
                background: C.cartao,
                border: `2px solid ${C.linha}`,
                opacity: Math.min(1, p * 1.4),
                transform: `translateX(${(1 - p) * -120}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: `${C.menta}22`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Visto tamanho={44} cor={C.menta} progresso={interpolate(frame, [f + 4, f + 14], [0, 1], clamp)} />
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 46, color: C.texto }}>{item}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1360,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${selo})`,
          opacity: frame >= T.selo ? 1 : 0,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 64,
            color: C.fundo,
            background: `linear-gradient(90deg, ${C.azul}, ${C.menta})`,
            padding: "22px 56px",
            borderRadius: 999,
            boxShadow: `0 20px 80px ${C.menta}55`,
          }}
        >
          4 / 4 aprovados
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 36, color: C.suave, marginTop: 34 }}>
          feito só com código React
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Composição ----------
export const CheckupRemotion: React.FC = () => {
  const frame = useCurrentFrame();
  const fimGeral = interpolate(frame, [T.duration - 8, T.duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.fundo }}>
      <AbsoluteFill style={{ opacity: fimGeral }}>
        <Fundo />
        <Cabecalho />
        <Cena faixa={T.intro}>
          <Intro />
        </Cena>
        <Cena faixa={T.mola}>
          <Mola />
        </Cena>
        <Cena faixa={T.contador}>
          <Contador />
        </Cena>
        <Cena faixa={T.grafico}>
          <Grafico />
        </Cena>
        <Cena faixa={T.formas}>
          <Formas />
        </Cena>
        <Cena faixa={T.final} saida={false}>
          <Final />
        </Cena>
      </AbsoluteFill>
      <Audio src={staticFile("checkup/trilha.wav")} />
    </AbsoluteFill>
  );
};

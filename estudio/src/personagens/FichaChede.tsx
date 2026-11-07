import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/roboto-condensed/800.css";
import { APARENCIA_CHEDE, AparenciaCtx, Cabeca, Chede, Expressao, Pose, Vista } from "./Chede";
import { APARENCIA_KAIK } from "./Kaik";
import { APARENCIA_REGENTE, COR_PODER_REGENTE } from "./Regente";
import { OndasMentais } from "../efeitos/ControleMental";
import { Fenda } from "../efeitos/Fenda";

const W = 2400;
const T: React.FC<{ x: number; y: number; t: string; s?: number }> = ({ x, y, t, s = 40 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={s} fill="#2A2A2E">
    {t.toUpperCase()}
  </text>
);

const VISTAS: [Vista, string][] = [
  ["frente", "Frente"],
  ["tresQuartos", "3/4"],
  ["perfil", "Perfil"],
  ["costas", "Costas"],
];

const EXPR: [Expressao, string][] = [
  ["neutro", "Neutro"],
  ["feliz", "Feliz"],
  ["espanto", "Espanto"],
  ["medo", "Medo"],
  ["raiva", "Raiva"],
  ["determinado", "Determinado"],
  ["cansado", "Cansado"],
  ["rindo", "Rindo"],
];

const POSES: { nome: string; vista: Vista; expr: Expressao; pose: Pose; caido?: boolean; poder?: boolean }[] = [
  { nome: "Parado", vista: "frente", expr: "neutro", pose: {} },
  {
    nome: "Andando",
    vista: "tresQuartos",
    expr: "feliz",
    pose: { pernaE: 9, joelhoE: 12, pernaD: 10, joelhoD: -4, bracoE: -16, antebracoE: -14, bracoD: -16, antebracoD: 10 },
  },
  {
    nome: "Correndo",
    vista: "perfil",
    expr: "determinado",
    pose: { tronco: 10, pernaE: 28, joelhoE: 55, pernaD: 30, joelhoD: -20, bracoE: -40, antebracoE: -80, bracoD: -40, antebracoD: 70 },
  },
  { nome: "Apontando", vista: "frente", expr: "espanto", pose: { bracoD: 100, antebracoD: 0, cabeca: 6, olharX: 1 } },
  {
    nome: "Soltando o poder",
    vista: "tresQuartos",
    expr: "determinado",
    pose: { bracoE: -70, antebracoE: -40, bracoD: 100, antebracoD: 30, pernaE: 12, pernaD: 12, olharX: 1 },
    poder: true,
  },
  { nome: "Caído", vista: "frente", expr: "cansado", pose: { bracoE: 70, antebracoE: 30, bracoD: 20, pernaE: 10, pernaD: 30, joelhoD: -40 }, caido: true },
];

const QUEM = {
  chede: { nome: "Chede", ap: APARENCIA_CHEDE, cores: ["#F07C28", "#232327", "#9A6340", "#1C1817", "#EFEDE8", "#7B4DFF"] },
  kaik: { nome: "Kaik", ap: APARENCIA_KAIK, cores: ["#2F6FD6", "#C93A32", "#F1CBAE", "#1A1615", "#EFEDE8", "#59D8FF"] },
  regente: { nome: "O Regente", ap: APARENCIA_REGENTE, cores: ["#2B2E38", "#E8A317", "#F2F2EE", "#E3B993", "#8E9098", COR_PODER_REGENTE] },
};
type Quem = keyof typeof QUEM;

export const FichaChede: React.FC<{ quem?: Quem }> = ({ quem = "chede" }) => (
  <AparenciaCtx.Provider value={QUEM[quem].ap}>
  <AbsoluteFill style={{ background: "#EFE9DD" }}>
    <svg viewBox={`0 0 ${W} 2700`} width={W} height={2700}>
      <T x={W / 2} y={90} t={quem === "chede" ? "Chede — ficha oficial" : `${QUEM[quem].nome} — ficha`} s={72} />
      {/* faixa de cores */}
      {QUEM[quem].cores.map((c, i) => (
        <rect key={c} x={W / 2 - 270 + i * 90} y={120} width={80} height={36} rx={8} fill={c} />
      ))}
      {/* vistas */}
      {VISTAS.map(([v, nome], i) => (
        <g key={v}>
          <g transform={`translate(${300 + i * 600},1080) scale(0.53)`}>
            <Chede vista={v} />
          </g>
          <T x={300 + i * 600} y={1140} t={nome} />
        </g>
      ))}
      <line x1={80} x2={W - 80} y1={1190} y2={1190} stroke="#CFC6B6" strokeWidth={4} />
      {/* expressões */}
      {EXPR.map(([e, nome], i) => (
        <g key={e}>
          <g transform={`translate(${150 + i * 300},1400) scale(0.55)`}>
            <Cabeca expressao={e} pose={quem === "regente" && e === "determinado" ? { olhosPoder: 1 } : {}} />
          </g>
          <T x={150 + i * 300} y={1580} t={nome} s={36} />
        </g>
      ))}
      <line x1={80} x2={W - 80} y1={1630} y2={1630} stroke="#CFC6B6" strokeWidth={4} />
      {/* poses */}
      {POSES.map((p, i) => {
        const x = [170, 520, 880, 1260, 1640, 2130][i];
        return (
          <g key={p.nome}>
            <g transform={p.caido ? `translate(${x + 190},2540) rotate(-84) scale(0.28)` : `translate(${x},2580) scale(0.5)`}>
              <Chede vista={p.vista} expressao={p.expr} pose={p.poder && quem === "regente" ? { ...p.pose, olhosPoder: 1 } : p.pose} semSombra={p.caido} />
            </g>
            {p.poder && quem === "chede" && (
              <svg x={0} y={0} overflow="visible">
                <Fenda x={x + 615 * 0.5 + 40} y={2580 - 1375 * 0.5 - 30} tamanho={0.45} />
              </svg>
            )}
            {p.poder && quem === "regente" && (
              <OndasMentais x={x + 0.5 * 40} y={2580 - 1420 * 0.5} escala={0.5} f={14} />
            )}
            <T x={p.caido ? x + 20 : x} y={2650} t={p.poder && quem === "regente" ? "Controle mental" : p.nome} s={36} />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
  </AparenciaCtx.Provider>
);

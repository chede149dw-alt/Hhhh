import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/roboto-condensed/800.css";
import { Vivo } from "../episodios/comum";
import { AparenciaCtx, APARENCIA_CHEDE, Cabeca, Expressao, Rosto3Ctx } from "../personagens/Chede";
import { APARENCIA_KAIK } from "../personagens/Kaik";

// Teste 09/11: rosto atual (esquerda) x rosto 3 no estilo da referência 5 (direita)
const EXPR: Expressao[] = ["neutro", "feliz", "espanto", "medo", "raiva"];
const Lado: React.FC = () => (
  <>
    {[APARENCIA_CHEDE, APARENCIA_KAIK].map((ap, l) => (
      <AparenciaCtx.Provider key={l} value={ap}>
        {EXPR.map((e, i) => (
          <g key={e} transform={`translate(${130 + i * 230},${230 + l * 330}) scale(0.48)`}>
            <Cabeca expressao={e} pose={{}} vista={i === 4 ? "tresQuartos" : "frente"} />
          </g>
        ))}
      </AparenciaCtx.Provider>
    ))}
    <Vivo quem="chede" x={250} y={1820} s={0.62} vista="frente" expr="neutro" pose={{ bracoE: 14, bracoD: 14 }} />
    <Vivo quem="kaik" x={620} y={1820} s={0.62} vista="tresQuartos" expr="espanto" pose={{ bracoD: 120, antebracoD: -20 }} />
    <Vivo quem="chede" x={980} y={1820} s={0.62} vista="perfil" expr="determinado" pose={{ bracoD: 60, antebracoD: 40 }} />
  </>
);
const T: React.FC<{ x: number; t: string }> = ({ x, t }) => (
  <text x={x} y={80} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={56} fill="#2A2A2E">{t}</text>
);
export const Debug: React.FC = () => (
  <AbsoluteFill style={{ background: "#E6E1D8" }}>
    <svg viewBox="0 0 2400 1900" width={2400} height={1900}>
      <T x={600} t="ATUAL" />
      <T x={1800} t="NOVO (REFERÊNCIA 5)" />
      <Rosto3Ctx.Provider value={false}><Lado /></Rosto3Ctx.Provider>
      <line x1={1200} y1={0} x2={1200} y2={1900} stroke="#999" strokeWidth={4} />
      <g transform="translate(1200,0)">
        <Rosto3Ctx.Provider value={true}><Lado /></Rosto3Ctx.Provider>
      </g>
    </svg>
  </AbsoluteFill>
);

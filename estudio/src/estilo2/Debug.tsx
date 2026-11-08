import React from "react";
import { AbsoluteFill } from "remotion";
import { Vivo } from "../episodios/comum";
import { Corpo2Ctx } from "../personagens/Chede";

// Teste: proporção atual (esquerda) x proporção 2.0 da referência (direita)
const Fila: React.FC = () => (
  <>
    {(["frente", "tresQuartos", "perfil"] as const).map((v, i) => (
      <React.Fragment key={v}>
        <Vivo quem="chede" x={130 + i * 330} y={950} s={0.5} vista={v} expr="neutro" pose={{ bracoE: 12, bracoD: 12 }} />
      </React.Fragment>
    ))}
    <Vivo quem="kaik" x={1070} y={950} s={0.5} vista="tresQuartos" expr="feliz" pose={{ bracoD: 140, antebracoD: -30 }} />
  </>
);
export const Debug: React.FC = () => (
  <AbsoluteFill style={{ background: "#ddd" }}>
    <svg viewBox="0 0 2400 1000" width={2400} height={1000}>
      <Fila />
      <line x1={1200} y1={0} x2={1200} y2={1000} stroke="#999" strokeWidth={4} />
      <g transform="translate(1200,0)">
        <Corpo2Ctx.Provider value={true}><Fila /></Corpo2Ctx.Provider>
      </g>
    </svg>
  </AbsoluteFill>
);

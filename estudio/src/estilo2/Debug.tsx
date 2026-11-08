import React from "react";
import { AbsoluteFill } from "remotion";
import { Vivo } from "../episodios/comum";

// Teste isolado: tronco dobrado (sem buraco no quadril) e sangue no nariz.
export const Debug: React.FC = () => (
  <AbsoluteFill style={{ background: "#ddd" }}>
    <svg viewBox="0 0 2400 1000" width={2400} height={1000}>
      {[0, 25, 45, 60].map((t, i) => (
        <g key={t} transform={`translate(${200 + i * 300},950)`}>
          <Vivo quem="kaik" x={0} y={0} s={0.4} vista="perfil" expr="espanto" pose={{ tronco: t, cabeca: 20, bracoE: 30, bracoD: 20, olharY: 1 }} />
        </g>
      ))}
      {[25, 45].map((t, i) => (
        <g key={t} transform={`translate(${1400 + i * 300},950)`}>
          <Vivo quem="chede" x={0} y={0} s={0.4} vista="tresQuartos" expr="cansado" pose={{ tronco: t }} />
        </g>
      ))}
      <g transform="translate(2000,950)"><Vivo quem="chede" x={0} y={0} s={0.4} vista="tresQuartos" expr="cansado" pose={{ sangueNariz: 1 }} /></g>
      <g transform="translate(2250,950)"><Vivo quem="chede" x={0} y={0} s={0.4} vista="perfil" expr="cansado" pose={{ sangueNariz: 1 }} /></g>
    </svg>
  </AbsoluteFill>
);

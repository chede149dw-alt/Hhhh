import React from "react";
import { AbsoluteFill } from "remotion";
import { Vivo } from "../episodios/comum";
import { ChedeNasCostas, poseCorrida } from "../episodios/limites4/Comum4";

export const Debug: React.FC = () => (
  <AbsoluteFill style={{ background: "#ddd" }}>
    <svg viewBox="0 0 2400 1000" width={2400} height={1000}>
      {[0, 3, 6, 9].map((f, i) => (
        <g key={f} transform={`translate(${300 + i * 550},950)`}>
          <ChedeNasCostas f={f} s={0.5} />
          <Vivo quem="kaik" x={0} y={0} s={0.5} vista="perfil" expr="determinado" pose={poseCorrida(f)} />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

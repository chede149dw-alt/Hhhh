import React from "react";
import { AbsoluteFill } from "remotion";
import { AparenciaCtx, Chede, Vista } from "./Chede";
import { figurante } from "./Figurantes";
import "@fontsource/roboto-condensed/800.css";

const VISTAS: Vista[] = ["frente", "tresQuartos", "frente", "costas", "tresQuartos", "frente", "perfil", "frente", "tresQuartos", "costas", "frente", "tresQuartos"];
export const FichaFigurantes: React.FC = () => (
  <AbsoluteFill style={{ background: "#EFE8DC" }}>
    <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", fontFamily: "'Roboto Condensed'", fontWeight: 800, fontSize: 70, color: "#2A2A2E" }}>
      FIGURANTES — exemplos (gerados por semente)
    </div>
    <svg viewBox="0 0 2400 2000" width={2400} height={2000} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`translate(${200 + (i % 6) * 400},${i < 6 ? 1020 : 1940}) scale(0.5)`}>
          <AparenciaCtx.Provider value={figurante(i + 1)}>
            <Chede vista={VISTAS[i]} expressao={i % 3 ? "feliz" : "neutro"} />
          </AparenciaCtx.Provider>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

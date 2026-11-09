import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/roboto-condensed/800.css";
import { Vivo } from "../episodios/comum";
import { AparenciaCtx, APARENCIA_CHEDE, Cabeca } from "../personagens/Chede";
import { APARENCIA_KAIK } from "../personagens/Kaik";

// Referência 5 (quadros locais, fora do Git) ao lado dos nossos personagens, para ajustar o desenho.
const T: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Roboto Condensed", fontWeight: 800, fontSize: 44, color: "#222" }}>{t}</div>
);
export const Comparar: React.FC = () => (
  <AbsoluteFill style={{ background: "#E6E1D8" }}>
    <T x={40} y={20} t="REFERÊNCIA 6" />
    <T x={40} y={1000} t="NOSSOS (NOVO)" />
    {["q001", "q016", "q023", "q026", "q011"].map((q, i) => (
      <Img key={q} src={staticFile(`tmp-ref6/${q}.png`)} style={{ position: "absolute", left: 20 + i * 470, top: 80, width: 460, height: 818, objectFit: "cover" }} />
    ))}
    <svg viewBox="0 0 2400 900" width={2400} height={900} style={{ position: "absolute", left: 0, top: 1060 }}>
      <rect x={20} y={0} width={460} height={818} fill="#8C9BC8" />
      <rect x={490} y={0} width={460} height={818} fill="#7C88B8" />
      <g transform="translate(250,560) scale(0.95)"><AparenciaCtx.Provider value={APARENCIA_KAIK}><Cabeca expressao="neutro" pose={{}} /></AparenciaCtx.Provider></g>
      <g transform="translate(720,560) scale(0.95)"><AparenciaCtx.Provider value={APARENCIA_CHEDE}><Cabeca expressao="espanto" pose={{}} /></AparenciaCtx.Provider></g>
      <rect x={960} y={0} width={460} height={818} fill="#6E7FB8" />
      <Vivo quem="chede" x={1190} y={780} s={0.5} vista="frente" expr="raiva" pose={{ bracoE: 10, bracoD: 10 }} />
      <rect x={1430} y={0} width={460} height={818} fill="#6E7FB8" />
      <Vivo quem="kaik" x={1660} y={780} s={0.5} vista="tresQuartos" expr="determinado" pose={{ pernaE: 30, joelhoE: 40, pernaD: -10, bracoD: 40, antebracoD: 60 }} />
      <rect x={1900} y={0} width={460} height={818} fill="#5E6FA8" />
      <Vivo quem="chede" x={2130} y={780} s={0.5} vista="tresQuartos" expr="espanto" pose={{ bracoD: 70, antebracoD: 30, bracoE: 20 }} />
    </svg>
  </AbsoluteFill>
);

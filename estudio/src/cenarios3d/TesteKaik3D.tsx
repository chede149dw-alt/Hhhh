import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Rua3D, projetar, Cam } from "./Rua3D";
import { Kaik } from "../personagens/Kaik";
import { corridaForte } from "../personagens/poses";
import { Eletricidade, Faiscas } from "../efeitos/Eletricidade";
import { LinhasVento } from "../efeitos/Velocidade";
import { Gradacao, Grao } from "../estilo/Acabamento";

export const TesteKaik3D: React.FC = () => {
  const f = useCurrentFrame();
  const v = 0.9; // metros por quadro
  const zK = 8 - f * v;
  const cam: Cam = { pos: [-3.6, 0.7, zK + 0.9], alvo: [0, 1.15, zK - 0.3], fov: 55 };
  const p = projetar(cam, [0, 0, zK]);
  const s = (p.pxPorMetro * 1.75) / 1700;
  const kmh = Math.round(interpolate(f, [0, 50], [40, 300], { extrapolateRight: "clamp" }));
  const corpo = { x: p.x - 300 * s, y: p.y - 1750 * s, w: 600 * s, h: 1750 * s };
  return (
    <AbsoluteFill>
      <Rua3D cam={cam} onibusZ={-40 - f * 0.2} />
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} overflow="visible">
          <LinhasVento dir={1} n={16} />
          <g transform={`translate(${p.x},${p.y}) scale(${-s},${s})`}>
            <Kaik vista="perfil" expressao="espanto" pose={corridaForte(f)} semSombra />
          </g>
          <Eletricidade corpo={corpo} n={8} />
          <Faiscas x={p.x + 40 * s} y={p.y} dir={1} escala={1.8} n={34} />
        </svg>
      </AbsoluteFill>
      <Gradacao />
      <Grao />
      <div style={{ position: "absolute", top: 110, left: 70, fontFamily: "'Roboto Condensed'", fontWeight: 800, color: "#FFD23F",
        fontSize: 150, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
        {kmh}<span style={{ fontSize: 60, color: "#fff" }}> km/h</span>
      </div>
    </AbsoluteFill>
  );
};

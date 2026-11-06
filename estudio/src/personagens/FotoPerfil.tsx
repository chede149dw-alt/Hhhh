import React from "react";
import { AbsoluteFill } from "remotion";
import { Chede } from "./Chede";
import { Fenda } from "../efeitos/Fenda";
import { Grao } from "../estilo/Acabamento";

// Foto de perfil do canal: Chede espantado com a fenda aberta na mão.
// Composição pensada para o recorte redondo do Instagram (tudo importante dentro do círculo).
export const FotoPerfil: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 25% 38%, #6A3FE0 0%, #2A1650 45%, #120A24 100%)" }}>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
      {Array.from({ length: 45 }).map((_, i) => (
        <circle key={i} cx={(i * 211) % 1080} cy={(i * 137) % 1080} r={1.5 + (i % 3)} fill="#E9DCFF" opacity={0.25 + (i % 4) * 0.12} />
      ))}
      <defs><radialGradient id="luzLaranja"><stop offset="0" stopColor="#F07C28" stopOpacity={0.35} /><stop offset="1" stopColor="#F07C28" stopOpacity={0} /></radialGradient></defs>
      <circle cx={700} cy={520} r={420} fill="url(#luzLaranja)" />
      <g transform="translate(700,2050) scale(1.1)">
        <Chede expressao="espanto" pose={{ bracoE: 90, antebracoE: 90, olharX: -1, olharY: -0.3, cabeca: -6 }} />
      </g>
      <Fenda x={230} y={400} tamanho={0.95} />
    </svg>
    <Grao forca={0.08} />
  </AbsoluteFill>
);

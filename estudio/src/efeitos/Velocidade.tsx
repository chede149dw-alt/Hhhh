import React from "react";
import { useCurrentFrame } from "remotion";

// Poder do Kaik: rastro ciano/branco atrás de quem corre + linhas de vento.
// Uso: <Rastro dx={-60} n={5}>{personagem}</Rastro> desenha cópias "fantasma" deslocadas.
export const Rastro: React.FC<{ dx: number; dy?: number; n?: number; children: React.ReactNode }> = ({
  dx,
  dy = 0,
  n = 5,
  children,
}) => (
  <g>
    <defs>
      <filter id="tintaCiano" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.85  0 0 0 0 1  0 0 0 1 0" />
      </filter>
    </defs>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${dx * (n - i)},${dy * (n - i)})`} opacity={0.12 + (i / n) * 0.35} filter="url(#tintaCiano)">
        {children}
      </g>
    ))}
    {children}
  </g>
);

export const LinhasVento: React.FC<{ y0?: number; y1?: number; dir?: 1 | -1; n?: number; forca?: number }> = ({
  y0 = 300,
  y1 = 1700,
  dir = 1,
  n = 14,
  forca = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const fase = ((f * 3 + i * 17) % 30) / 30;
        const y = y0 + ((i * 97) % (y1 - y0));
        const x = dir === 1 ? 1300 - fase * 1700 : -220 + fase * 1700;
        const comp = 180 + (i % 4) * 90;
        return (
          <line key={i} x1={x} y1={y} x2={x + comp * dir} y2={y} stroke={i % 3 ? "#BFF4FF" : "#59D8FF"}
            strokeWidth={4 + (i % 3) * 2} strokeLinecap="round" opacity={0.6 * forca * (1 - Math.abs(fase - 0.5))} />
        );
      })}
    </g>
  );
};

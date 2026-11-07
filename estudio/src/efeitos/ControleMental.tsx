import React from "react";
import { useCurrentFrame } from "remotion";

// Ondas do controle mental: anéis âmbar que saem da cabeça do Regente.
// (x, y) = centro da cabeça; `forca` 0..1. Use sobre o personagem.
export const OndasMentais: React.FC<{ x: number; y: number; forca?: number; escala?: number; cor?: string; f?: number }> = ({
  x,
  y,
  forca = 1,
  escala = 1,
  cor = "#FFB21E",
  f,
}) => {
  const atual = useCurrentFrame();
  const q = f ?? atual;
  const n = 5;
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`} opacity={forca}>
      <defs>
        <filter id="brilhoMental" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const t = ((q / 40 + i / n) % 1 + 1) % 1;
        const r = 160 + t * 520;
        const op = (1 - t) * 0.8;
        return (
          <g key={i} opacity={op}>
            <ellipse rx={r} ry={r * 0.9} fill="none" stroke={cor} strokeWidth={14} filter="url(#brilhoMental)" />
            <ellipse rx={r} ry={r * 0.9} fill="none" stroke="#FFF1C9" strokeWidth={4} strokeDasharray="40 26" />
          </g>
        );
      })}
    </g>
  );
};

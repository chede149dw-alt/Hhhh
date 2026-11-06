import React from "react";
import { useCurrentFrame } from "remotion";

// Poder do Chede: uma fenda dimensional que puxa as coisas para "outro lugar".
// Visual original: rasgo escuro com borda brilhante violeta/ciano e partículas sendo sugadas.
export const Fenda: React.FC<{ x: number; y: number; tamanho?: number; intensidade?: number }> = ({
  x,
  y,
  tamanho = 1,
  intensidade = 1,
}) => {
  const f = useCurrentFrame();
  const pulso = 1 + 0.06 * Math.sin(f / 4);
  return (
    <g transform={`translate(${x},${y}) scale(${tamanho * pulso})`}>
      <defs>
        <radialGradient id="gHalo">
          <stop offset="0" stopColor="#C9A6FF" stopOpacity={0.9 * intensidade} />
          <stop offset="0.4" stopColor="#7B4DFF" stopOpacity={0.45 * intensidade} />
          <stop offset="1" stopColor="#3A1FA0" stopOpacity={0} />
        </radialGradient>
        <filter id="fBrilho" x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <circle r={230} fill="url(#gHalo)" />
      {/* anéis de distorção */}
      {[0, 1, 2].map((i) => {
        const t = ((f / 30 + i / 3) % 1);
        return (
          <ellipse key={i} rx={170 * (1 - t) + 20} ry={70 * (1 - t) + 8} fill="none" stroke="#B9F2FF"
            strokeWidth={4} opacity={t * 0.8 * intensidade} />
        );
      })}
      {/* rasgo */}
      <path d="M -120 0 Q -40 -46 0 -40 Q 50 -38 120 0 Q 40 44 0 40 Q -50 38 -120 0 Z" fill="#A779FF" filter="url(#fBrilho)" />
      <path d="M -104 0 Q -36 -34 0 -30 Q 44 -28 104 0 Q 36 32 0 30 Q -44 28 -104 0 Z" fill="#0B0618" />
      <path d="M -104 0 Q -36 -34 0 -30 Q 44 -28 104 0" fill="none" stroke="#E9DCFF" strokeWidth={5} />
      <path d="M -104 0 Q -44 28 0 30 Q 36 32 104 0" fill="none" stroke="#7FE7FF" strokeWidth={4} />
      {/* partículas sendo sugadas */}
      {Array.from({ length: 40 }).map((_, i) => {
        const fase = ((f * 1.6 + i * 9.7) % 60) / 60;
        const ang = i * 2.4;
        const r = 260 * (1 - fase);
        return (
          <circle key={i} cx={Math.cos(ang) * r} cy={Math.sin(ang) * r * 0.55} r={2 + 4 * (1 - fase)}
            fill={i % 3 ? "#D8C4FF" : "#9EF0FF"} opacity={fase * intensidade} />
        );
      })}
    </g>
  );
};

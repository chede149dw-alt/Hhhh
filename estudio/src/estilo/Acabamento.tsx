import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "@fontsource/roboto-condensed/800.css";

// Camadas de acabamento no estilo da referência:
// feixe de luz, poeira no ar, gradação quente, vinheta e grão de filme.

export const FeixeDeLuz: React.FC<{ x?: number; angulo?: number; largura?: number; forca?: number }> = ({
  x = 180,
  angulo = 28,
  largura = 520,
  forca = 0.55,
}) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <linearGradient id="gFeixe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6B0" stopOpacity={forca} />
          <stop offset="0.7" stopColor="#FFD08A" stopOpacity={forca * 0.35} />
          <stop offset="1" stopColor="#FFC070" stopOpacity={0} />
        </linearGradient>
        <filter id="fFeixe">
          <feGaussianBlur stdDeviation={18} />
        </filter>
      </defs>
      <g transform={`translate(${x},-200) skewX(${-angulo})`} filter="url(#fFeixe)">
        <rect x={0} y={0} width={largura} height={2400} fill="url(#gFeixe)" />
      </g>
    </svg>
  </AbsoluteFill>
);

const rand = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const Poeira: React.FC<{ n?: number }> = ({ n = 70 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {Array.from({ length: n }).map((_, i) => {
          const x = (rand(i) * 1080 + f * (0.3 + rand(i + 9) * 0.6)) % 1080;
          const y = (rand(i + 3) * 1920 - f * (0.2 + rand(i + 5) * 0.5) + 1920) % 1920;
          const r = 1 + rand(i + 7) * 2.6;
          const a = 0.25 + 0.5 * Math.abs(Math.sin(f / 20 + i));
          return <circle key={i} cx={x} cy={y} r={r} fill="#FFF2D6" opacity={a} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Gradacao: React.FC = () => (
  <>
    {/* tom quente e levemente dessaturado */}
    <AbsoluteFill style={{ background: "#C99A5C", mixBlendMode: "soft-light", opacity: 0.35 }} />
    {/* vinheta */}
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,8,6,0.55) 100%)" }}
    />
  </>
);

export const Grao: React.FC<{ forca?: number }> = ({ forca = 0.11 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: forca, pointerEvents: "none" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <filter id="fGrao">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={f % 30} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#fGrao)" />
      </svg>
    </AbsoluteFill>
  );
};

// Legenda: caixa alta, condensada, branca com contorno; palavra-chave em amarelo.
export const Legenda: React.FC<{ palavras: string[]; destaque?: number[]; cor?: string; y?: number }> = ({
  palavras,
  destaque = [],
  cor = "#FFD23F",
  y = 1290,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      width: "100%",
      textAlign: "center",
      fontFamily: "'Roboto Condensed'",
      fontWeight: 800,
      fontSize: 92,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: "#fff",
      WebkitTextStroke: "8px #000",
      paintOrder: "stroke fill",
      textShadow: "0 6px 0 rgba(0,0,0,0.6)",
    }}
  >
    {palavras.map((p, i) => (
      <span key={i} style={{ color: destaque.includes(i) ? cor : "#fff" }}>
        {p}
        {i < palavras.length - 1 ? " " : ""}
      </span>
    ))}
  </div>
);

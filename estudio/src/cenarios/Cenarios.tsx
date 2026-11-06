import React from "react";
import { useCurrentFrame } from "remotion";

// Cozinha do apartamento do Chede (fundo para planos médios).
export const Cozinha: React.FC<{ desfoque?: number }> = ({ desfoque = 6 }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#C9B79A" />
      {/* azulejos */}
      {Array.from({ length: 9 }).map((_, i) =>
        Array.from({ length: 8 }).map((__, j) => (
          <rect key={`${i}-${j}`} x={i * 124} y={560 + j * 124} width={118} height={118} fill={(i + j) % 2 ? "#DCE3E0" : "#E8EDEA"} />
        )),
      )}
      {/* janela */}
      <rect x={620} y={180} width={360} height={340} fill="#EFE7D3" />
      <rect x={640} y={200} width={320} height={300} fill="#FFF3D6" />
      <rect x={792} y={200} width={14} height={300} fill="#EFE7D3" />
      {/* armário alto */}
      <rect x={60} y={120} width={460} height={380} rx={10} fill="#6F8C86" />
      <rect x={286} y={140} width={8} height={340} fill="#4C6662" />
      {/* bancada */}
      <rect y={1300} width={1080} height={50} fill="#5A5048" />
      <rect y={1350} width={1080} height={570} fill="#6F8C86" />
      {[300, 700].map((x) => (
        <rect key={x} x={x} y={1390} width={8} height={500} fill="#4C6662" />
      ))}
      {/* pia */}
      <rect x={300} y={1240} width={480} height={70} rx={20} fill="#B9C3C9" />
      <rect x={520} y={1080} width={30} height={170} rx={12} fill="#9AA6AD" />
      <rect x={520} y={1080} width={140} height={28} rx={12} fill="#9AA6AD" />
      <path d="M 0 1300 L 420 1300 L 760 1920 L 0 1920 Z" fill="#FFD9A0" opacity={0.18} />
    </svg>
  </div>
);

// O "outro lugar": chão de pedra infinito, céu escuro, névoa.
export const Dimensao: React.FC<{ desfoque?: number; olhos?: number }> = ({ desfoque = 0, olhos = 0 }) => {
  const f = useCurrentFrame();
  const horizonte = 860;
  return (
    <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <linearGradient id="ceuD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#07060E" />
            <stop offset="1" stopColor="#1E1A33" />
          </linearGradient>
          <linearGradient id="chaoD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A2838" />
            <stop offset="1" stopColor="#5B5870" />
          </linearGradient>
          <radialGradient id="nevoaD" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#8E7CC3" stopOpacity={0.35} />
            <stop offset="1" stopColor="#8E7CC3" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1080} height={horizonte} fill="url(#ceuD)" />
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i * 263) % 1080} cy={(i * 137) % 800} r={1.5 + (i % 3)} fill="#CFC6FF" opacity={0.3 + 0.3 * Math.sin(f / 15 + i)} />
        ))}
        <rect y={horizonte} width={1080} height={1920 - horizonte} fill="url(#chaoD)" />
        {/* blocos de pedra em perspectiva */}
        {Array.from({ length: 12 }).map((_, i) => {
          const y = horizonte + Math.pow(i / 11, 2) * (1920 - horizonte);
          return <line key={`h${i}`} x1={0} x2={1080} y1={y} y2={y} stroke="#1A1826" strokeWidth={2 + i * 0.6} opacity={0.8} />;
        })}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = -1400 + i * 260;
          return <line key={`v${i}`} x1={540} y1={horizonte} x2={x} y2={1920} stroke="#1A1826" strokeWidth={3} opacity={0.7} />;
        })}
        <rect width={1080} height={1920} fill="url(#nevoaD)" />
        {olhos > 0 && (
          <g opacity={olhos}>
            <ellipse cx={500} cy={820} rx={14} ry={6} fill="#E9DCFF" />
            <ellipse cx={580} cy={820} rx={14} ry={6} fill="#E9DCFF" />
            <ellipse cx={540} cy={820} rx={140} ry={60} fill="#B39DFF" opacity={0.12} />
          </g>
        )}
      </svg>
    </div>
  );
};

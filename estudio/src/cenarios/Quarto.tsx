import React from "react";

// Quarto do Chede. Formas chapadas; a luz vem da janela à esquerda.
export const Quarto: React.FC<{ desfoque?: number; manha?: boolean }> = ({ desfoque = 7, manha = true }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <linearGradient id="parede" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6F8C86" />
          <stop offset="1" stopColor="#4C6662" />
        </linearGradient>
        <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6446" />
          <stop offset="1" stopColor="#5E412C" />
        </linearGradient>
        <linearGradient id="janelaLuz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6DE" />
          <stop offset="1" stopColor="#FFE3A8" />
        </linearGradient>
      </defs>
      {/* parede */}
      <rect width={1080} height={1500} fill="url(#parede)" />
      {/* mancha de sol na parede */}
      {manha && <path d="M 300 380 L 640 300 L 760 980 L 420 1060 Z" fill="#E9D7A8" opacity={0.35} />}
      {/* janela */}
      <rect x={-60} y={240} width={300} height={560} rx={8} fill="#E8E1D2" />
      <rect x={-40} y={262} width={256} height={516} fill="url(#janelaLuz)" />
      <rect x={80} y={262} width={14} height={516} fill="#E8E1D2" />
      <rect x={-40} y={512} width={256} height={14} fill="#E8E1D2" />
      {/* pôster (planeta) */}
      <rect x={720} y={300} width={250} height={340} rx={6} fill="#22232B" />
      <circle cx={845} cy={440} r={80} fill="#F07C28" />
      <ellipse cx={845} cy={440} rx={130} ry={26} fill="none" stroke="#F3E5C8" strokeWidth={8} transform="rotate(-18 845 440)" />
      <rect x={760} y={570} width={170} height={14} rx={7} fill="#F3E5C8" opacity={0.7} />
      {/* prateleira */}
      <rect x={640} y={820} width={360} height={18} fill="#6B4A32" />
      <rect x={670} y={740} width={36} height={80} fill="#D9C8A4" />
      <rect x={712} y={760} width={30} height={60} fill="#B8553A" />
      <rect x={748} y={750} width={34} height={70} fill="#3E5A7A" />
      <circle cx={900} cy={790} r={30} fill="#3F6E4A" />
      <rect x={884} y={800} width={32} height={20} fill="#8A5A3A" />
      {/* rodapé e chão */}
      <rect y={1480} width={1080} height={30} fill="#3E524F" />
      <rect y={1510} width={1080} height={410} fill="url(#chao)" />
      {[1580, 1680, 1800].map((y) => (
        <rect key={y} y={y} width={1080} height={4} fill="#4A3322" opacity={0.5} />
      ))}
      {/* cama à direita */}
      <rect x={700} y={1260} width={460} height={300} rx={20} fill="#3A4E78" />
      <rect x={700} y={1200} width={460} height={110} rx={30} fill="#F1EBDD" />
      <rect x={700} y={1520} width={460} height={60} fill="#2B3A5A" />
      {/* luz no chão */}
      {manha && <path d="M 0 1560 L 380 1520 L 620 1920 L 0 1920 Z" fill="#FFD9A0" opacity={0.28} />}
    </svg>
  </div>
);

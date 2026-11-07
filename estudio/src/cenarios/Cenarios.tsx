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

// Banheiro do Kaik.
export const Banheiro: React.FC<{ desfoque?: number }> = ({ desfoque = 6 }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#BFD3D6" />
      {Array.from({ length: 10 }).map((_, i) =>
        Array.from({ length: 16 }).map((__, j) => (
          <rect key={`${i}-${j}`} x={i * 110} y={j * 110} width={104} height={104} fill={(i + j) % 2 ? "#D7E5E7" : "#CADCDF"} />
        )),
      )}
      {/* espelho */}
      <rect x={270} y={260} width={540} height={620} rx={30} fill="#E9F2F3" />
      <rect x={290} y={280} width={500} height={580} rx={22} fill="#A9C4CB" />
      <path d="M 330 320 L 450 320 L 340 520 Z" fill="#FFFFFF" opacity={0.35} />
      {/* pia */}
      <rect x={220} y={1240} width={640} height={90} rx={30} fill="#F4F6F6" />
      <rect x={300} y={1330} width={480} height={600} fill="#E3E9EA" />
      <rect x={510} y={1120} width={30} height={130} rx={12} fill="#9AA6AD" />
      <path d="M 0 1000 L 300 980 L 420 1920 L 0 1920 Z" fill="#FFF2D6" opacity={0.18} />
    </svg>
  </div>
);

// Prédio visto de fora; janelas acesas. `vigia` mostra a silhueta filmando numa janela escura.
export const Predio: React.FC<{ vigia?: number; desfoque?: number; f?: number }> = ({ vigia = 0, desfoque = 0, f = 0 }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <linearGradient id="ceuTarde" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FA7C9" />
          <stop offset="1" stopColor="#E9C9A0" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ceuTarde)" />
      <rect x={60} y={140} width={960} height={1780} fill="#8E8378" />
      <rect x={60} y={140} width={960} height={40} fill="#6F665D" />
      {Array.from({ length: 4 }).map((_, i) =>
        Array.from({ length: 7 }).map((__, j) => {
          const x = 120 + i * 230;
          const y = 240 + j * 240;
          const escura = i === 2 && j === 2;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x} y={y} width={170} height={170} fill="#5E554D" />
              <rect x={x + 10} y={y + 10} width={150} height={150} fill={escura ? "#141418" : (i + j) % 3 ? "#A9BFCB" : "#F2D9A6"} />
              {escura && vigia > 0 && (
                <g opacity={vigia}>
                  <ellipse cx={x + 85} cy={y + 70} rx={34} ry={38} fill="#050507" />
                  <rect x={x + 40} y={y + 100} width={90} height={70} rx={30} fill="#050507" />
                  <rect x={x + 92} y={y + 72} width={30} height={46} rx={6} fill="#22232B" />
                  <circle cx={x + 107} cy={y + 80} r={6} fill="#FF3B30" opacity={Math.floor(f / 10) % 2 ? 1 : 0.3} />
                </g>
              )}
            </g>
          );
        }),
      )}
    </svg>
  </div>
);

// Rua do bairro (vista lateral) com calçada, casas e árvores.
export const Rua: React.FC<{ desfoque?: number; dx?: number; chuva?: boolean }> = ({ desfoque = 4, dx = 0, chuva = false }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <linearGradient id="ceuRua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={chuva ? "#7D8A96" : "#8FB6D4"} />
          <stop offset="1" stopColor={chuva ? "#B9C0C4" : "#F0D9B5"} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ceuRua)" />
      <g transform={`translate(${dx % 1200},0)`}>
        {[-1200, 0, 1200].map((ox) => (
          <g key={ox} transform={`translate(${ox},0)`}>
            <rect x={40} y={700} width={420} height={700} fill="#D9A97A" />
            <path d="M 20 710 L 250 520 L 480 710 Z" fill="#9E4B3A" />
            <rect x={110} y={860} width={120} height={140} fill="#F6E3B4" />
            <rect x={300} y={1060} width={110} height={340} fill="#6B4A32" />
            <rect x={560} y={760} width={480} height={640} fill="#9FB7A0" />
            <rect x={540} y={740} width={520} height={40} fill="#6E8470" />
            <rect x={640} y={880} width={140} height={150} fill="#E8EEF0" />
            <rect x={840} y={880} width={140} height={150} fill="#E8EEF0" />
            <rect x={490} y={1160} width={26} height={260} fill="#5E412C" />
            <circle cx={503} cy={1080} r={120} fill="#4F7A4A" />
            <circle cx={450} cy={1130} r={80} fill="#5E8A56" />
          </g>
        ))}
      </g>
      <rect y={1400} width={1080} height={120} fill="#B9B2A5" />
      <rect y={1520} width={1080} height={400} fill="#4A4A50" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={((i * 220 + dx * 1.2) % 1320) - 120} y={1700} width={120} height={18} fill="#E9E2CF" />
      ))}
    </svg>
  </div>
);

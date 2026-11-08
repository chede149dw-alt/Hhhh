import React from "react";

// Gato preto (Parte 5). Desenho chapado, sem contorno, mesmo estilo do Chede.
// Origem (0,0) = chão, no meio do gato. Unidades: ~300 de altura sentado (≈ 30 cm).
// A coleira é verde (cor da Lia) — pista discreta.
const C = {
  corpo: "#1E1B24",
  sombra: "#121017",
  luz: "#3A3446",
  olho: "#F4D23C",
  pupila: "#0A0A0C",
  nariz: "#C97C8C",
  bigode: "#9A96A8",
  coleira: "#5E7A45",
  dentro: "#6A4A5A",
};

export type PoseGato = "sentado" | "andando" | "correndo" | "arrepiado";

const Olhos: React.FC<{ x: number; y: number; brilho?: number; olharX?: number; piscar?: number }> = ({ x, y, brilho = 0, olharX = 0, piscar = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    {[-26, 26].map((dx) => (
      <g key={dx} transform={`translate(${dx},0)`}>
        {brilho > 0 && <circle r={34} fill={C.olho} opacity={0.35 * brilho} filter="url(#gatoBrilho)" />}
        <ellipse rx={16} ry={17 * (1 - piscar * 0.92)} fill={C.olho} />
        {piscar < 0.6 && <ellipse cx={olharX * 5} rx={4.5} ry={13 * (1 - piscar)} fill={C.pupila} />}
        {piscar < 0.6 && <circle cx={olharX * 5 - 5} cy={-6} r={3} fill="#fff" opacity={0.9} />}
      </g>
    ))}
  </g>
);

export const Gato: React.FC<{ pose?: PoseGato; f?: number; brilho?: number; olharX?: number; piscar?: number; soOlhos?: boolean }> = ({
  pose = "sentado", f = 0, brilho = 0, olharX = 0, piscar = 0, soOlhos,
}) => {
  const defs = (
    <defs>
      <filter id="gatoBrilho" x="-1" y="-1" width="3" height="3">
        <feGaussianBlur stdDeviation={10} />
      </filter>
    </defs>
  );
  if (soOlhos) return <g>{defs}<Olhos x={0} y={-230} brilho={brilho} olharX={olharX} piscar={piscar} /></g>;
  if (pose === "sentado" || pose === "arrepiado") {
    const arr = pose === "arrepiado";
    const rabo = Math.sin(f / 9) * 14;
    return (
      <g>
        {defs}
        {/* rabo enrolado */}
        <path d={`M 60 -20 C 150 -10 ${170 + rabo} -90 ${120 + rabo} -150`} stroke={C.corpo} strokeWidth={arr ? 34 : 24} fill="none" strokeLinecap="round" />
        {/* corpo */}
        <path d={`M -80 0 C -95 -90 -70 -170 0 ${arr ? -205 : -185} C 70 -170 95 -90 80 0 Z`} fill={C.corpo} />
        <path d="M 10 -175 C 70 -160 92 -90 80 0 L 30 0 C 50 -60 45 -130 10 -175 Z" fill={C.sombra} />
        <path d="M -70 -20 C -78 -90 -56 -150 -20 -172 C -52 -130 -62 -70 -55 -20 Z" fill={C.luz} opacity={0.8} />
        {/* patas da frente */}
        <rect x={-46} y={-70} width={30} height={72} rx={14} fill={C.corpo} />
        <rect x={16} y={-70} width={30} height={72} rx={14} fill={C.sombra} />
        {/* pelos arrepiados nas costas */}
        {arr && [-60, -30, 0, 30, 60].map((x, i) => <path key={i} d={`M ${x - 10} ${-180 + Math.abs(x) * 0.6} l 10 -26 l 10 26 Z`} fill={C.corpo} />)}
        {/* cabeça */}
        <g transform={`translate(0,-235) rotate(${Math.sin(f / 23) * 4})`}>
          <path d="M -70 -20 L -62 -96 L -18 -58 Z" fill={C.corpo} />
          <path d="M 70 -20 L 62 -96 L 18 -58 Z" fill={C.corpo} />
          <path d="M -58 -32 L -56 -80 L -28 -56 Z" fill={C.dentro} />
          <path d="M 58 -32 L 56 -80 L 28 -56 Z" fill={C.dentro} />
          <ellipse rx={78} ry={66} fill={C.corpo} />
          <path d="M 20 -62 C 70 -50 86 0 60 40 C 40 58 10 64 0 64 C 30 30 40 -20 20 -62 Z" fill={C.sombra} opacity={0.8} />
          <ellipse cx={-38} cy={-34} rx={22} ry={10} fill={C.luz} opacity={0.5} />
          <Olhos x={0} y={-6} brilho={brilho} olharX={olharX} piscar={piscar} />
          <path d="M -9 20 L 9 20 L 0 31 Z" fill={C.nariz} />
          <path d="M 0 31 Q -8 42 -16 38 M 0 31 Q 8 42 16 38" stroke={C.bigode} strokeWidth={3} fill="none" />
          {[-1, 1].map((l) => [0, 12].map((dy) => (
            <path key={`${l}${dy}`} d={`M ${l * 22} ${28 + dy} L ${l * 92} ${18 + dy * 1.6}`} stroke={C.bigode} strokeWidth={2.5} opacity={0.8} />
          )))}
        </g>
        {/* coleira verde */}
        <path d="M -52 -178 Q 0 -160 52 -178 L 50 -164 Q 0 -146 -50 -164 Z" fill={C.coleira} />
        <circle cx={0} cy={-150} r={9} fill="#C9C2A8" />
      </g>
    );
  }
  // perfil, indo para a direita: andando ou correndo
  const vel = pose === "correndo" ? 0.55 : 0.28;
  const ciclo = f * vel;
  const amp = pose === "correndo" ? 34 : 20;
  const corpoY = pose === "correndo" ? -110 + Math.abs(Math.sin(ciclo)) * -18 : -120;
  const esticar = pose === "correndo" ? 1 + Math.sin(ciclo) * 0.08 : 1;
  const perna = (x: number, fase: number, sombra: boolean) => {
    const a = Math.sin(ciclo + fase) * amp;
    return (
      <g transform={`translate(${x},${corpoY + 20}) rotate(${a})`}>
        <rect x={-13} y={0} width={26} height={-corpoY - 14} rx={12} fill={sombra ? C.sombra : C.corpo} />
      </g>
    );
  };
  return (
    <g>
      {defs}
      {perna(-70, Math.PI, true)}
      {perna(60, 0, true)}
      <path d={`M -100 ${corpoY} C ${-170} ${corpoY - 40} ${-190 + Math.sin(ciclo) * 12} ${corpoY - 120} ${-150 + Math.sin(ciclo * 0.7) * 20} ${corpoY - 170}`} stroke={C.corpo} strokeWidth={22} fill="none" strokeLinecap="round" />
      <g transform={`translate(0,${corpoY}) scale(${esticar},1)`}>
        <ellipse rx={118} ry={52} fill={C.corpo} />
        <path d="M -110 10 Q 0 60 110 10 Q 60 52 0 52 Q -60 52 -110 10 Z" fill={C.sombra} />
        <path d="M -90 -30 Q 0 -60 90 -32 Q 0 -44 -90 -30 Z" fill={C.luz} opacity={0.7} />
      </g>
      {perna(-50, 0, false)}
      {perna(80, Math.PI, false)}
      {/* cabeça de perfil */}
      <g transform={`translate(128,${corpoY - 52})`}>
        <path d="M -30 -40 L -18 -102 L 14 -52 Z" fill={C.corpo} />
        <path d="M -20 -48 L -14 -88 L 4 -56 Z" fill={C.dentro} />
        <ellipse rx={62} ry={54} fill={C.corpo} />
        <ellipse cx={46} cy={14} rx={30} ry={24} fill={C.corpo} />
        <path d="M -20 30 Q 30 60 70 30 Q 40 54 0 54 Z" fill={C.sombra} />
        <ellipse cx={30} cy={-8} rx={14} ry={15} fill={C.olho} />
        <ellipse cx={34} cy={-8} rx={4} ry={11} fill={C.pupila} />
        <path d="M 74 6 L 80 14 L 70 16 Z" fill={C.nariz} />
        <path d="M 60 22 L 120 14 M 60 28 L 118 30" stroke={C.bigode} strokeWidth={2.5} />
        <path d="M -44 30 Q -10 44 20 40 L 18 52 Q -12 56 -46 42 Z" fill={C.coleira} />
      </g>
    </g>
  );
};

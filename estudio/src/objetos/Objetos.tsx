import React from "react";
import { CORES_CHEDE as C } from "../personagens/Chede";

// Objetos da série. Origem no centro do objeto. Mesmo estilo: chapado, sombra em duas tonalidades.

export const Despertador: React.FC<{ tremor?: number }> = ({ tremor = 0 }) => (
  <g transform={`rotate(${tremor * 8})`}>
    <ellipse cx={0} cy={118} rx={110} ry={16} fill="#000" opacity={0.2} />
    <rect x={-70} y={70} width={20} height={50} rx={8} fill="#3A3A40" transform="rotate(20 -60 95)" />
    <rect x={50} y={70} width={20} height={50} rx={8} fill="#3A3A40" transform="rotate(-20 60 95)" />
    <circle cx={-70} cy={-92} r={42} fill="#C9B26A" />
    <circle cx={70} cy={-92} r={42} fill="#A8924F" />
    <rect x={-8} y={-130} width={16} height={40} fill="#3A3A40" />
    <circle cx={0} cy={0} r={110} fill="#D9483B" />
    <path d="M 40 -100 A 110 110 0 0 1 40 100 A 120 120 0 0 0 40 -100 Z" fill="#B0372C" />
    <circle cx={0} cy={0} r={84} fill="#F6F0E2" />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-3} y={-76} width={6} height={14} fill="#3A3A40" transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-5} y={-56} width={10} height={60} rx={5} fill="#22232B" transform="rotate(-30)" />
    <rect x={-4} y={-66} width={8} height={70} rx={4} fill="#22232B" transform="rotate(70)" />
    <circle r={9} fill="#22232B" />
    {tremor !== 0 &&
      [-1, 1].map((l) => (
        <g key={l} stroke="#FFF2D6" strokeWidth={8} strokeLinecap="round">
          <line x1={l * 150} y1={-120} x2={l * 190} y2={-160} />
          <line x1={l * 165} y1={-60} x2={l * 215} y2={-70} />
          <line x1={l * 160} y1={0} x2={l * 205} y2={18} />
        </g>
      ))}
  </g>
);

export const Meia: React.FC = () => (
  <g>
    <path d="M -40 -120 L 30 -120 L 30 20 Q 30 70 80 80 Q 120 90 110 120 Q 100 150 40 140 L -20 130 Q -50 120 -45 80 Z" fill="#E9E4D6" />
    <path d="M -40 -120 L 30 -120 L 30 -90 L -40 -90 Z" fill="#7A9BB8" />
    <path d="M 60 82 Q 112 92 110 120 Q 100 150 40 140 Z" fill="#C9C2B0" />
    <circle cx={-10} cy={40} r={8} fill="#9E9682" opacity={0.6} />
    <circle cx={10} cy={-30} r={6} fill="#9E9682" opacity={0.5} />
  </g>
);

export const Prato: React.FC<{ sujo?: boolean }> = ({ sujo = true }) => (
  <g>
    <ellipse rx={120} ry={34} fill="#E6E1D5" />
    <ellipse rx={84} ry={22} fill="#F5F1E7" />
    {sujo && (
      <>
        <ellipse cx={-20} cy={-2} rx={22} ry={7} fill="#B5651D" opacity={0.7} />
        <ellipse cx={30} cy={6} rx={14} ry={5} fill="#6B8E23" opacity={0.6} />
      </>
    )}
  </g>
);

export const PilhaPratos: React.FC<{ n?: number }> = ({ n = 6 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 8 - 4},${-i * 20}) rotate(${(i % 3) - 1})`}>
        <Prato />
      </g>
    ))}
    <rect x={60} y={-n * 20 - 70} width={22} height={120} rx={10} fill="#B9C3C9" transform="rotate(20 70 0)" />
  </g>
);

export const Celular: React.FC<{ tela?: React.ReactNode; gravando?: boolean; brilho?: number }> = ({ tela, gravando, brilho = 1 }) => (
  <g>
    <rect x={-120} y={-240} width={240} height={480} rx={36} fill="#1B1C22" />
    <rect x={-106} y={-222} width={212} height={444} rx={26} fill="#0E0F14" />
    <svg x={-106} y={-222} width={212} height={444} viewBox="0 0 212 444" overflow="hidden">
      <rect width={212} height={444} rx={26} fill="#0E0F14" />
      {tela}
    </svg>
    <rect x={-30} y={-214} width={60} height={14} rx={7} fill="#1B1C22" />
    {gravando && (
      <g>
        <circle cx={-70} cy={-180} r={10} fill="#E5332A" opacity={brilho} />
        <text x={-52} y={-172} fontFamily="Roboto Condensed" fontWeight={800} fontSize={24} fill="#fff">REC</text>
      </g>
    )}
  </g>
);

export const Mesa: React.FC = () => (
  <g>
    <rect x={-420} y={0} width={840} height={60} rx={10} fill="#9A6B45" />
    <rect x={-420} y={40} width={840} height={20} fill="#7A5236" />
    <rect x={-380} y={60} width={40} height={460} fill="#7A5236" />
    <rect x={340} y={60} width={40} height={460} fill="#6A452D" />
    {/* veios */}
    <path d="M -380 18 Q -200 8 0 20 T 380 16" stroke="#87593A" strokeWidth={4} fill="none" />
  </g>
);

// Mão em close (palma de frente, dedos para cima). Origem = centro da palma.
export const MaoClose: React.FC<{ translucida?: number; sombra?: boolean }> = ({ translucida = 0, sombra }) => {
  const pele = sombra ? C.peleSombra : C.pele;
  const op = 1 - translucida * 0.7;
  return (
    <g opacity={op}>
      <rect x={-110} y={60} width={220} height={900} rx={90} fill={pele} />
      <rect x={20} y={60} width={90} height={900} rx={45} fill={C.peleSombra} opacity={0.5} />
      {[
        [-105, -170, 200],
        [-38, -215, 240],
        [30, -205, 230],
        [96, -160, 190],
      ].map(([x, y, h], i) => (
        <rect key={i} x={x - 30} y={y} width={60} height={h + 40} rx={30} fill={pele} />
      ))}
      <ellipse cx={0} cy={0} rx={150} ry={160} fill={pele} />
      <ellipse cx={70} cy={10} rx={70} ry={140} fill={C.peleSombra} opacity={0.35} />
      <rect x={-210} y={-60} width={64} height={190} rx={32} fill={pele} transform="rotate(-35 -178 35)" />
      {/* linhas da palma */}
      <path d="M -90 -20 Q 0 20 90 -40" stroke={C.peleSombra} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M -100 40 Q -20 60 40 120" stroke={C.peleSombra} strokeWidth={6} fill="none" strokeLinecap="round" />
      {translucida > 0 && (
        <g fill="none" stroke="#B48CFF" strokeWidth={8} opacity={translucida}>
          <ellipse cx={0} cy={0} rx={156} ry={166} />
        </g>
      )}
    </g>
  );
};

export const Papel: React.FC<{ r?: number }> = ({ r = 0 }) => (
  <g transform={`rotate(${r})`}>
    <rect x={-60} y={-80} width={120} height={160} fill="#F4EFE3" />
    {[-40, -15, 10, 35].map((y) => (
      <rect key={y} x={-44} y={y} width={88} height={6} fill="#B9B2A2" />
    ))}
  </g>
);

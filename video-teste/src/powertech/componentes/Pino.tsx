import React from "react";
import { COR } from "../tema";

/** Ícone de localização (substitui o emoji 📍, que não tem fonte garantida na renderização). */
export const Pino: React.FC<{ tam: number; id: string; brilho?: number }> = ({ tam, id, brilho = 1 }) => (
  <svg
    width={tam}
    height={tam * 1.33}
    viewBox="0 0 120 160"
    style={{ display: "block", overflow: "visible", filter: `drop-shadow(0 0 ${18 * brilho}px rgba(255,30,10,${0.9 * brilho}))` }}
  >
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF5A4A" />
        <stop offset="55%" stopColor={COR.vermelho} />
        <stop offset="100%" stopColor="#6E0300" />
      </linearGradient>
      <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#9DA3AD" />
      </linearGradient>
    </defs>
    <path
      d="M60 156 C 52 132, 6 96, 6 58 A 54 54 0 1 1 114 58 C 114 96, 68 132, 60 156 Z"
      fill={`url(#${id}-g)`}
      stroke={`url(#${id}-m)`}
      strokeWidth={4}
    />
    <circle cx={60} cy={58} r={22} fill="#0A0A0D" stroke={`url(#${id}-m)`} strokeWidth={4} />
    <path d="M 22 40 A 44 44 0 0 1 60 14" stroke="rgba(255,255,255,0.55)" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

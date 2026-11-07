import React from "react";
import { useCurrentFrame } from "remotion";

// Poder do Kaik (versão 2): eletricidade ciano ramificada + brilho + faíscas no chão.
// Desenhado em SVG por cima do personagem. As coordenadas são da tela (px).

const rnd = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// raio entre dois pontos por deslocamento do ponto médio
const raio = (x1: number, y1: number, x2: number, y2: number, desvio: number, seed: number, nivel = 5): [number, number][] => {
  if (nivel === 0) return [[x1, y1], [x2, y2]];
  const mx = (x1 + x2) / 2 + (rnd(seed) - 0.5) * desvio;
  const my = (y1 + y2) / 2 + (rnd(seed + 1) - 0.5) * desvio;
  const a = raio(x1, y1, mx, my, desvio / 2, seed * 2 + 3, nivel - 1);
  const b = raio(mx, my, x2, y2, desvio / 2, seed * 2 + 7, nivel - 1);
  return [...a, ...b.slice(1)];
};
const d = (pts: [number, number][]) => "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");

type Caixa = { x: number; y: number; w: number; h: number }; // área do corpo na tela

export const Eletricidade: React.FC<{ corpo: Caixa; n?: number; intensidade?: number; cor?: string; id?: string }> = ({
  corpo,
  n = 7,
  intensidade = 1,
  cor = "#59D8FF",
  id = "el",
}) => {
  const f = useCurrentFrame();
  const troca = Math.floor(f / 2); // o raio muda a cada 2 quadros
  const arcos = Array.from({ length: n }).map((_, i) => {
    const s = troca * 31 + i * 7;
    const ax = corpo.x + rnd(s) * corpo.w;
    const ay = corpo.y + rnd(s + 1) * corpo.h;
    const ang = rnd(s + 2) * Math.PI * 2;
    const comp = (0.25 + rnd(s + 3) * 0.55) * corpo.h;
    const bx = ax + Math.cos(ang) * comp;
    const by = ay + Math.sin(ang) * comp * 0.7;
    const pts = raio(ax, ay, bx, by, comp * 0.45, s + 11);
    const galhos = [0, 1].map((g) => {
      const k = Math.floor(pts.length * (0.3 + g * 0.3));
      const [gx, gy] = pts[k];
      const a2 = ang + (rnd(s + 20 + g) - 0.5) * 2;
      const c2 = comp * 0.35;
      return raio(gx, gy, gx + Math.cos(a2) * c2, gy + Math.sin(a2) * c2, c2 * 0.5, s + 40 + g, 4);
    });
    return { pts, galhos, vivo: rnd(s + 9) < 0.85 };
  });
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={intensidade}>
      <defs>
        <filter id={`brilho-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <radialGradient id={`aura-${id}`}>
          <stop offset="0" stopColor={cor} stopOpacity={0.45} />
          <stop offset="1" stopColor={cor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={corpo.x + corpo.w / 2} cy={corpo.y + corpo.h / 2} rx={corpo.w * 0.9} ry={corpo.h * 0.65}
        fill={`url(#aura-${id})`} opacity={0.7 + 0.3 * Math.sin(f * 1.3)} />
      <g filter={`url(#brilho-${id})`}>
        {arcos.filter((a) => a.vivo).map((a, i) => (
          <path key={i} d={d(a.pts)} stroke={cor} strokeWidth={16} fill="none" strokeLinecap="round" />
        ))}
      </g>
      {arcos.filter((a) => a.vivo).map((a, i) => (
        <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={d(a.pts)} stroke={cor} strokeWidth={6} />
          {a.galhos.map((g, k) => (
            <path key={k} d={d(g)} stroke={cor} strokeWidth={3} />
          ))}
          <path d={d(a.pts)} stroke="#FFFFFF" strokeWidth={2.2} />
        </g>
      ))}
    </g>
  );
};

// Faíscas do atrito no asfalto, saindo de um ponto (pé) e voando para trás.
export const Faiscas: React.FC<{ x: number; y: number; dir?: 1 | -1; n?: number; escala?: number }> = ({
  x,
  y,
  dir = 1,
  n = 26,
  escala = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <circle cx={x} cy={y} r={30 * escala} fill="#FFD9A0" opacity={0.35 + 0.25 * Math.sin(f * 2)} />
      {Array.from({ length: n }).map((_, i) => {
        const vida = 12;
        const nasc = (i * 3) % vida;
        const t = ((f + nasc) % vida) / vida; // 0..1
        const s = Math.floor((f + nasc) / vida) * 97 + i;
        const vx = dir * (8 + rnd(s) * 22) * escala;
        const vy = -(4 + rnd(s + 1) * 14) * escala;
        const px = x + vx * t * 10;
        const py = y + vy * t * 10 + 40 * t * t * 10 * escala * 0.25;
        const cor = t < 0.4 ? "#FFFFFF" : t < 0.7 ? "#FFE08A" : "#FF8A3D";
        return (
          <line key={i} x1={px} y1={py} x2={px - vx * 0.9} y2={py - vy * 0.9} stroke={cor}
            strokeWidth={(3 - t * 2) * escala} strokeLinecap="round" opacity={1 - t} />
        );
      })}
    </g>
  );
};

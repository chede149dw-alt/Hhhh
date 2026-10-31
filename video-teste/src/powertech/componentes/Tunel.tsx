import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { H, W } from "../tema";

/** Rastros radiais que saem do centro: sensação de câmera avançando em alta velocidade. */
export const Tunel: React.FC<{
  intensidade: number; // 0..1
  velocidade?: number;
  cx?: number;
  cy?: number;
  quantidade?: number;
  semente?: string;
}> = ({ intensidade, velocidade = 1, cx = W / 2, cy = H * 0.45, quantidade = 90, semente = "tun" }) => {
  const frame = useCurrentFrame();
  const raios = useMemo(
    () =>
      new Array(quantidade).fill(0).map((_, i) => ({
        ang: random(`${semente}a${i}`) * 360,
        r0: random(`${semente}r${i}`),
        v: 0.6 + random(`${semente}v${i}`) * 0.8,
        esp: 1.5 + random(`${semente}e${i}`) * 2.5,
        vermelho: random(`${semente}c${i}`) < 0.5,
      })),
    [quantidade, semente],
  );
  if (intensidade <= 0.001) return null;
  const maxR = Math.hypot(W, H) * 0.6;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: intensidade }}>
      {raios.map((r, i) => {
        const p = (r.r0 + (frame * 0.03 * r.v * velocidade)) % 1; // 0..1 ao longo do raio
        const dist = Math.pow(p, 2.2) * maxR;
        const comp = 20 + Math.pow(p, 2) * 420 * velocidade;
        const alfa = Math.min(1, p * 3) * (1 - Math.pow(p, 6));
        const cor = r.vermelho ? "255,40,20" : "225,230,238";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: comp,
              height: r.esp,
              transformOrigin: "0 50%",
              transform: `rotate(${r.ang}deg) translateX(${dist}px)`,
              background: `linear-gradient(90deg, rgba(${cor},0), rgba(${cor},${alfa}))`,
              borderRadius: r.esp,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

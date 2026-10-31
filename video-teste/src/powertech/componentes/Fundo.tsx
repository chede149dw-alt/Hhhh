import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CLAMP, COR, H, W } from "../tema";

const MASCARA_PISO =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)";

/** Piso em perspectiva com grade vermelha avançando (simula câmera em movimento). */
const Piso: React.FC<{ opacidade: number; velocidade: number; camX: number }> = ({ opacidade, velocidade, camX }) => {
  const frame = useCurrentFrame();
  if (opacidade <= 0) return null;
  const desloc = (frame * velocidade) % 120;
  return (
    <div
      style={{
        position: "absolute",
        left: -W,
        right: -W,
        top: H * 0.62,
        height: H * 0.6,
        perspective: 700,
        opacity: opacidade,
        maskImage: MASCARA_PISO,
        WebkitMaskImage: MASCARA_PISO,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateX(72deg) translateX(${-camX * 0.6}px)`,
          transformOrigin: "50% 0%",
          backgroundImage:
            "linear-gradient(rgba(225,6,0,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(201,206,214,0.16) 2px, transparent 2px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${desloc}px`,
        }}
      />
    </div>
  );
};

/** Partículas metálicas e vermelhas em várias profundidades (parallax). */
const Particulas: React.FC<{ opacidade: number; camX: number; semente: string; quantidade: number }> = ({
  opacidade,
  camX,
  semente,
  quantidade,
}) => {
  const frame = useCurrentFrame();
  const lista = useMemo(
    () =>
      new Array(quantidade).fill(0).map((_, i) => {
        const z = 0.15 + random(`${semente}z${i}`) * 0.85;
        return {
          x: random(`${semente}x${i}`) * (W + 200) - 100,
          y: random(`${semente}y${i}`) * H,
          z,
          tam: 2 + z * 5,
          v: 0.4 + z * 1.6,
          fase: random(`${semente}f${i}`) * Math.PI * 2,
          vermelha: random(`${semente}c${i}`) < 0.35,
        };
      }),
    [semente, quantidade],
  );
  if (opacidade <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      {lista.map((p, i) => {
        const y = (((p.y - frame * p.v) % H) + H) % H;
        const x = p.x + Math.sin(frame / 40 + p.fase) * 14 * p.z - camX * p.z;
        const cintila = 0.6 + 0.4 * Math.sin(frame / 11 + p.fase);
        const cor = p.vermelha ? "255,60,40" : "220,226,235";
        const alfa = interpolate(p.z, [0.15, 1], [0.25, 0.9], CLAMP) * cintila;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.tam,
              height: p.tam,
              borderRadius: "50%",
              background: `rgba(${cor},${alfa})`,
              boxShadow: `0 0 ${p.tam * 3}px rgba(${cor},${0.6 * p.z})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Fundo preto profundo com brilho vermelho, piso em perspectiva, partículas e vinheta. */
export const Fundo: React.FC<{
  brilho?: number;
  brilhoY?: number;
  piso?: number;
  velocidadePiso?: number;
  particulas?: number;
  quantidade?: number;
  camX?: number;
  semente?: string;
}> = ({
  brilho = 0.6,
  brilhoY = 60,
  piso = 0.5,
  velocidadePiso = 6,
  particulas = 1,
  quantidade = 60,
  camX = 0,
  semente = "f",
}) => (
  <AbsoluteFill style={{ backgroundColor: COR.preto, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 45% at 50% ${brilhoY}%, rgba(225,6,0,${0.42 * brilho}) 0%, rgba(120,4,0,${0.22 * brilho}) 38%, rgba(0,0,0,0) 72%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 60% 22% at 50% 0%, rgba(201,206,214,${0.1 * brilho}) 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
    <Piso opacidade={piso} velocidade={velocidadePiso} camX={camX} />
    <Particulas opacidade={particulas} camX={camX} semente={semente} quantidade={quantidade} />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.9) 100%)",
      }}
    />
  </AbsoluteFill>
);

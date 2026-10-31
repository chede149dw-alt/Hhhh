import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, COR } from "../tema";
import { Gabinete } from "./Gabinete";

/** Tela do monitor: ondas de luz e formas abstratas (sem jogo, marca ou especificação). */
const Tela: React.FC<{ w: number; h: number; luz: number }> = ({ w, h, luz }) => {
  const frame = useCurrentFrame();
  const ondas = new Array(7).fill(0);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 90% at 50% 100%, #3A0703 0%, #120203 45%, #050507 100%)",
        opacity: luz,
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
        {ondas.map((_, i) => {
          const amp = 30 + i * 9;
          const fase = frame / 14 + i * 0.7;
          let d = `M 0 ${h * 0.62}`;
          for (let x = 0; x <= w; x += 20) {
            const y = h * 0.62 + Math.sin(x / 90 + fase) * amp * Math.sin(x / w * Math.PI) - i * 10;
            d += ` L ${x} ${y.toFixed(1)}`;
          }
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i === 3 ? "#FFD2C8" : `rgba(255,${40 + i * 12},30,${0.85 - i * 0.09})`}
              strokeWidth={i === 3 ? 3 : 2}
            />
          );
        })}
      </svg>
      {/* horizonte e grade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: h * 0.32,
          backgroundImage:
            "linear-gradient(rgba(255,40,20,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,40,20,0.25) 1px, transparent 1px)",
          backgroundSize: "40px 22px",
          backgroundPosition: `0 ${(frame * 2) % 22}px`,
          maskImage: "linear-gradient(180deg, transparent, black)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black)",
        }}
      />
      {/* reflexo no vidro da tela */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%)",
        }}
      />
    </div>
  );
};

/** Setup completo: parede com faixa de LED, mesa, monitor, teclado, mouse e gabinete. */
export const Setup: React.FC<{ camZoom?: number; camX?: number }> = ({ camZoom = 1, camX = 0 }) => {
  const frame = useCurrentFrame();
  const luz = interpolate(frame, [0, 10], [0.4, 1], CLAMP);
  const mesaY = 1390;
  const mon = { w: 800, h: 460, x: 70, y: mesaY - 620 };

  // Camadas com parallax: fundo (0.3), meio (1), frente (1.6)
  const camada = (fator: number): React.CSSProperties => ({
    transform: `translateX(${-camX * fator}px) scale(${1 + (camZoom - 1) * fator})`,
    transformOrigin: "50% 60%",
  });

  return (
    <AbsoluteFill>
      {/* Parede com faixa de LED */}
      <AbsoluteFill style={camada(0.3)}>
        <div
          style={{
            position: "absolute",
            left: -100,
            right: -100,
            top: mon.y + 30,
            height: 6,
            background: `linear-gradient(90deg, rgba(225,6,0,0), ${COR.vermelhoVivo} 20%, #FFB4A8 50%, ${COR.vermelhoVivo} 80%, rgba(225,6,0,0))`,
            boxShadow: "0 0 30px rgba(255,30,10,0.9), 0 0 120px rgba(225,6,0,0.6)",
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: mon.y + 30,
            height: 700,
            background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(225,6,0,0.28), rgba(0,0,0,0) 70%)",
          }}
        />
      </AbsoluteFill>

      {/* Mesa */}
      <AbsoluteFill style={camada(1)}>
        <div
          style={{
            position: "absolute",
            left: -200,
            right: -200,
            top: mesaY,
            height: 700,
            background: "linear-gradient(180deg, #17171C 0%, #0A0A0D 30%, #030304 100%)",
            borderTop: "2px solid rgba(201,206,214,0.35)",
          }}
        />
        {/* Gabinete à direita, atrás do monitor */}
        <div style={{ position: "absolute", left: 590, top: mesaY - 945, transform: "scale(0.66)", transformOrigin: "50% 100%" }}>
          <Gabinete angulo={34} inclinacao={-6} ligado={luz} reflexoPiso={false} />
        </div>

        {/* Monitor */}
        <div style={{ position: "absolute", left: mon.x, top: mon.y, width: mon.w, height: mon.h, perspective: 1600 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(8deg)",
              borderRadius: 14,
              background: "#060608",
              boxShadow:
                "0 0 0 3px rgba(201,206,214,0.35), 0 30px 80px rgba(0,0,0,0.9), 0 0 120px rgba(225,6,0,0.35)",
              padding: 12,
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 6, overflow: "hidden" }}>
              <Tela w={mon.w - 24} h={mon.h - 24} luz={luz} />
            </div>
          </div>
          {/* pedestal */}
          <div
            style={{
              position: "absolute",
              left: mon.w / 2 - 22,
              top: mon.h,
              width: 44,
              height: 120,
              background: "linear-gradient(90deg,#3A3D44,#C9CED6 50%,#3A3D44)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: mon.w / 2 - 150,
              top: mon.h + 112,
              width: 300,
              height: 20,
              borderRadius: "50%",
              background: "linear-gradient(180deg,#C9CED6,#3A3D44)",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Teclado e mouse (camada da frente) */}
      <AbsoluteFill style={camada(1.6)}>
        <div style={{ position: "absolute", left: 90, top: mesaY + 70, width: 640, height: 220, perspective: 900 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateX(58deg)",
              transformOrigin: "50% 100%",
              borderRadius: 14,
              background: "#0D0D11",
              boxShadow: "0 0 0 2px rgba(201,206,214,0.3), 0 0 60px rgba(225,6,0,0.7)",
              padding: 14,
              display: "grid",
              gridTemplateColumns: "repeat(15, 1fr)",
              gridTemplateRows: "repeat(5, 1fr)",
              gap: 6,
            }}
          >
            {new Array(75).fill(0).map((_, i) => {
              const onda = 0.5 + 0.5 * Math.sin(frame / 6 - (i % 15) * 0.5);
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 4,
                    background: "#1B1C21",
                    boxShadow: `0 0 0 1px rgba(255,${40 + 60 * onda},30,${0.35 + 0.55 * onda * luz}), inset 0 -3px 0 rgba(0,0,0,0.6)`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 800,
            top: mesaY + 170,
            width: 80,
            height: 120,
            borderRadius: "40px 40px 44px 44px",
            background: "linear-gradient(180deg,#26272D,#0A0A0D)",
            boxShadow: "0 0 0 2px rgba(201,206,214,0.25), 0 0 40px rgba(225,6,0,0.7)",
            transform: "perspective(600px) rotateX(50deg)",
          }}
        >
          <div style={{ position: "absolute", left: 38, top: 14, width: 4, height: 26, borderRadius: 2, background: COR.vermelhoVivo, boxShadow: "0 0 10px #f00" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

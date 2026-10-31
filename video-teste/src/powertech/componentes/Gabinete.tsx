import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, COR } from "../tema";

/**
 * Gabinete gamer estilizado em 3D (CSS 3D transforms), com lateral de vidro,
 * ventoinhas com anel de LED, placa de vídeo, memórias e iluminação RGB vermelha.
 * Ilustração genérica: não representa um produto ou especificação real.
 */

const L = 380; // largura (frente)
const A = 820; // altura
const P = 450; // profundidade (lateral)

// ---------- Ventoinha ----------
export const Ventoinha: React.FC<{ tam: number; giro: number; luz: number; id: string }> = ({ tam, giro, luz, id }) => {
  const pas = new Array(9).fill(0);
  return (
    <svg width={tam} height={tam} viewBox="-100 -100 200 200" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-cubo`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#F1F3F6" />
          <stop offset="55%" stopColor="#8D939C" />
          <stop offset="100%" stopColor="#2A2C31" />
        </radialGradient>
        <radialGradient id={`${id}-fundo`} r="60%">
          <stop offset="0%" stopColor={`rgba(255,40,20,${0.35 * luz})`} />
          <stop offset="100%" stopColor="rgba(8,8,10,1)" />
        </radialGradient>
      </defs>
      <circle r={97} fill={`url(#${id}-fundo)`} stroke="#1E1F24" strokeWidth={5} />
      {/* anel de LED */}
      <circle r={86} fill="none" stroke={`rgba(255,${40 + 120 * luz * 0.2},${30},${0.25 + 0.75 * luz})`} strokeWidth={8} />
      <circle r={86} fill="none" stroke={`rgba(255,200,190,${0.8 * luz})`} strokeWidth={2} />
      <g transform={`rotate(${giro})`}>
        {pas.map((_, i) => (
          <path
            key={i}
            transform={`rotate(${i * 40})`}
            d="M 4 -20 C 28 -30, 52 -52, 60 -80 C 38 -76, 18 -60, -6 -22 Z"
            fill={`rgba(${30 + 60 * luz},${22 + 8 * luz},${26},0.9)`}
            stroke={`rgba(255,90,70,${0.35 * luz})`}
            strokeWidth={1.2}
          />
        ))}
      </g>
      <circle r={24} fill={`url(#${id}-cubo)`} />
      <circle r={10} fill="#141518" />
    </svg>
  );
};

// ---------- Face genérica ----------
const Face: React.FC<{
  w: number;
  h: number;
  transform: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, transform, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: -w / 2,
      top: -h / 2,
      width: w,
      height: h,
      transform,
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
      ...style,
    }}
  >
    {children}
  </div>
);

const brilhoFace = (z: number) => interpolate(z, [-0.2, 1], [0.85, 0], CLAMP);

export const Gabinete: React.FC<{
  angulo?: number; // rotação em Y (graus); positivo mostra a lateral de vidro
  inclinacao?: number; // rotação em X (graus)
  ligado?: number; // 0..1 acende os LEDs
  escala?: number;
  reflexoPiso?: boolean;
}> = ({ angulo = 32, inclinacao = -8, ligado = 1, escala = 1, reflexoPiso = true }) => {
  const frame = useCurrentFrame();
  const giro = frame * 7.3 * (0.3 + 0.7 * ligado);
  const rad = (angulo * Math.PI) / 180;
  const zFrente = Math.cos(rad);
  const zDireita = -Math.sin(rad);
  const luz = ligado;
  const pulsar = 0.85 + 0.15 * Math.sin(frame / 12);

  const metalEscuro = "linear-gradient(160deg, #26272C 0%, #121216 45%, #0A0A0D 100%)";

  return (
    <div
      style={{
        width: L * 2,
        height: A * 1.3,
        position: "relative",
        perspective: 2200,
        transform: `scale(${escala})`,
        WebkitBoxReflect: reflexoPiso
          ? "below -110px linear-gradient(to bottom, rgba(0,0,0,0) 72%, rgba(0,0,0,0.22) 100%)"
          : undefined,
      }}
    >
      {/* brilho vermelho no piso */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: A * 0.65 + A / 2 - 10,
          width: L * 2.4,
          height: 160,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(225,6,0,${0.55 * luz}) 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: A * 0.65,
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${inclinacao}deg) rotateY(${angulo}deg)`,
        }}
      >
        {/* ---------- INTERIOR (visto através do vidro) ---------- */}
        {/* Parede traseira interna, com ventoinha de exaustão */}
        <Face
          w={L}
          h={A}
          transform={`translateZ(${-P / 2 + 2}px)`}
          style={{ background: "linear-gradient(180deg, #16161B 0%, #0B0B0E 100%)" }}
        >
          <div style={{ position: "absolute", left: (L - 150) / 2 + 30, top: 50 }}>
            <Ventoinha tam={150} giro={giro * 1.1} luz={luz * pulsar} id="vt" />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 80% 50% at 50% 30%, rgba(255,30,10,${0.25 * luz}) 0%, rgba(0,0,0,0) 70%)`,
            }}
          />
        </Face>
        {/* Parede frontal interna: traseira das ventoinhas frontais */}
        <Face
          w={L}
          h={A}
          transform={`rotateY(180deg) translateZ(${-P / 2 + 4}px)`}
          style={{ background: "#0A0A0D" }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: (L - 236) / 2, top: 84 + i * 244 }}>
              <Ventoinha tam={236} giro={-giro - i * 17} luz={luz * pulsar} id={`vfi${i}`} />
            </div>
          ))}
        </Face>
        {/* Teto interno */}
        <Face
          w={L}
          h={P}
          transform={`rotateX(-90deg) translateZ(${-A / 2 + 2}px)`}
          style={{ background: "linear-gradient(90deg, #121216, #1C1D22)" }}
        >
          <div style={{ position: "absolute", left: 20, right: 20, top: P / 2 - 3, height: 6, borderRadius: 4, background: `rgba(255,40,20,${0.25 + 0.75 * luz})`, boxShadow: `0 0 24px rgba(255,30,10,${luz})` }} />
        </Face>
        {/* Piso interno */}
        <Face
          w={L}
          h={P}
          transform={`rotateX(90deg) translateZ(${-A / 2 + 2}px)`}
          style={{ background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(120,4,0,${0.6 * luz}), #0A0A0D 80%)` }}
        />
        {/* Placa-mãe, junto à lateral direita */}
        <Face w={P} h={A} transform={`rotateY(-90deg) translateZ(${-L / 2 + 26}px)`}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #121217 0%, #0A0A0D 100%)" }} />
          <div
            style={{
              position: "absolute",
              left: 26,
              top: 40,
              width: P - 150,
              height: A - 270,
              borderRadius: 6,
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 22px), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 30px), linear-gradient(160deg, #24252C 0%, #15161B 60%, #101014 100%)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.7), 0 0 0 2px rgba(201,206,214,0.12)",
            }}
          >
            {/* dissipadores VRM */}
            <div style={{ position: "absolute", left: 18, top: 16, width: 150, height: 36, borderRadius: 4, background: "linear-gradient(180deg,#A9AFB8,#4C5058)" }} />
            <div style={{ position: "absolute", left: 18, top: 60, width: 36, height: 170, borderRadius: 4, background: "linear-gradient(90deg,#A9AFB8,#4C5058)" }} />
            {/* chipset / M.2 */}
            <div style={{ position: "absolute", left: 60, top: 400, width: 180, height: 28, borderRadius: 4, background: "linear-gradient(180deg,#8E949D,#3B3E45)" }} />
            <div style={{ position: "absolute", right: 22, bottom: 30, width: 70, height: 70, borderRadius: 6, background: "linear-gradient(135deg,#9AA0A9,#3A3D44)" }} />
          </div>
          {/* luz ambiente vermelha */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 70% 50% at 70% 45%, rgba(255,30,10,${0.6 * luz * pulsar}) 0%, rgba(120,4,0,${0.25 * luz}) 45%, rgba(0,0,0,0) 80%)`,
            }}
          />
        </Face>

        {/* Memórias RAM */}
        <Face w={P} h={A} transform={`rotateY(-90deg) translateZ(${-L / 2 + 70}px)`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 222 + i * 20,
                top: 100,
                width: 13,
                height: 190,
                borderRadius: 3,
                background: "linear-gradient(90deg,#3B3E45,#9CA2AB 50%,#3B3E45)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 34,
                  borderRadius: 3,
                  background: `rgba(255,${40 + i * 10},30,${0.2 + 0.8 * luz})`,
                  boxShadow: `0 0 18px rgba(255,30,10,${0.9 * luz})`,
                }}
              />
            </div>
          ))}
        </Face>

        {/* Water cooler (bomba sobre o processador) */}
        <Face w={P} h={A} transform={`rotateY(-90deg) translateZ(${-L / 2 + 110}px)`}>
          <div
            style={{
              position: "absolute",
              left: 90,
              top: 160,
              width: 116,
              height: 116,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 35%, #2E3036 0%, #0B0B0E 70%)",
              boxShadow: `0 0 0 6px rgba(255,40,20,${0.25 + 0.75 * luz}), 0 0 40px rgba(255,20,0,${0.8 * luz})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 26,
                borderRadius: "50%",
                border: "3px solid rgba(201,206,214,0.6)",
                transform: `rotate(${giro * 0.5}deg)`,
                borderTopColor: `rgba(255,60,40,${luz})`,
              }}
            />
          </div>
          {/* mangueiras */}
          <div style={{ position: "absolute", left: 140, top: 30, width: 14, height: 130, borderRadius: 8, background: "linear-gradient(90deg,#111,#33353B,#111)" }} />
          <div style={{ position: "absolute", left: 168, top: 30, width: 14, height: 130, borderRadius: 8, background: "linear-gradient(90deg,#111,#33353B,#111)" }} />
        </Face>

        {/* Placa de vídeo */}
        <Face w={P} h={A} transform={`rotateY(-90deg) translateZ(${-L / 2 + 150}px)`}>
          <div
            style={{
              position: "absolute",
              left: 22,
              top: A - 360,
              width: P - 70,
              height: 104,
              borderRadius: 10,
              background: "linear-gradient(180deg, #2B2D33 0%, #15161A 55%, #0C0C0F 100%)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.18)",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 30, top: 22, width: 170, height: 4, background: "linear-gradient(90deg,#C9CED6,rgba(201,206,214,0))", transform: "skewX(-30deg)" }} />
            <div style={{ position: "absolute", left: 30, top: 34, width: 120, height: 4, background: "linear-gradient(90deg,#C9CED6,rgba(201,206,214,0))", transform: "skewX(-30deg)" }} />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 14,
                height: 6,
                background: `linear-gradient(90deg, rgba(225,6,0,0), rgba(255,40,20,${luz}) 30%, rgba(255,180,160,${luz}) 60%, rgba(225,6,0,0))`,
                boxShadow: `0 0 22px rgba(255,30,10,${luz})`,
              }}
            />
          </div>
        </Face>

        {/* Cobertura da fonte */}
        <Face w={P} h={A} transform={`rotateY(-90deg) translateZ(${-L / 2 + 172}px)`}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 190,
              background: "linear-gradient(180deg, #1A1B20 0%, #0B0B0E 100%)",
              borderTop: "2px solid rgba(201,206,214,0.25)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 40,
                top: 50,
                width: 160,
                height: 80,
                backgroundImage: "radial-gradient(rgba(0,0,0,0.9) 3px, transparent 3.5px)",
                backgroundSize: "12px 12px",
                opacity: 0.9,
              }}
            />
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: `rgba(255,40,20,${0.7 * luz})`, boxShadow: `0 0 20px rgba(255,30,10,${luz})` }} />
          </div>
        </Face>

        {/* ---------- EXTERIOR ---------- */}
        {/* Frente com ventoinhas */}
        <Face
          w={L}
          h={A}
          transform={`translateZ(${P / 2}px)`}
          style={{ background: metalEscuro, borderRadius: 10, overflow: "hidden" }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: "linear-gradient(180deg,#2E3036,#15161A)" }}>
            <div
              style={{
                position: "absolute",
                left: L / 2 - 12,
                top: 20,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "3px solid #9AA0A9",
                boxShadow: `0 0 12px rgba(255,30,10,${luz})`,
              }}
            />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: (L - 236) / 2, top: 84 + i * 244 }}>
              <Ventoinha tam={236} giro={giro + i * 17} luz={luz * pulsar} id={`vf${i}`} />
            </div>
          ))}
          {/* malha */}
          <div
            style={{
              position: "absolute",
              inset: "64px 0 0 0",
              backgroundImage: "radial-gradient(rgba(0,0,0,0.55) 2.2px, transparent 2.6px)",
              backgroundSize: "9px 9px",
            }}
          />
          {/* filetes de LED nas bordas */}
          <div style={{ position: "absolute", left: 8, top: 70, bottom: 14, width: 4, borderRadius: 4, background: `rgba(255,40,20,${0.2 + 0.8 * luz})`, boxShadow: `0 0 18px rgba(255,30,10,${luz})` }} />
          <div style={{ position: "absolute", right: 8, top: 70, bottom: 14, width: 4, borderRadius: 4, background: `rgba(255,40,20,${0.2 + 0.8 * luz})`, boxShadow: `0 0 18px rgba(255,30,10,${luz})` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, boxShadow: "inset 0 0 0 3px rgba(201,206,214,0.35)" }} />
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${brilhoFace(zFrente)})` }} />
        </Face>

        {/* Lateral de vidro temperado */}
        <Face
          w={P}
          h={A}
          transform={`rotateY(-90deg) translateZ(${L / 2}px)`}
          style={{
            borderRadius: 10,
            background: "rgba(14,14,20,0.06)",
            boxShadow: "inset 0 0 0 6px rgba(20,20,24,0.95), inset 0 0 0 8px rgba(201,206,214,0.35)",
          }}
        >
          {/* reflexo do vidro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10,
              background: `linear-gradient(${120 + angulo}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.16}) 42%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 62%)`,
            }}
          />
        </Face>

        {/* Lateral direita (metal) */}
        <Face
          w={P}
          h={A}
          transform={`rotateY(90deg) translateZ(${L / 2}px)`}
          style={{ background: metalEscuro, borderRadius: 10 }}
        >
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${brilhoFace(zDireita)})` }} />
        </Face>

        {/* Traseira */}
        <Face w={L} h={A} transform={`rotateY(180deg) translateZ(${P / 2}px)`} style={{ background: "#0A0A0D", borderRadius: 10 }} />

        {/* Topo */}
        <Face
          w={L}
          h={P}
          transform={`rotateX(90deg) translateZ(${A / 2}px)`}
          style={{
            borderRadius: 10,
            background: "linear-gradient(90deg,#2A2B31,#18191D)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 30,
              backgroundImage: "radial-gradient(rgba(0,0,0,0.7) 2px, transparent 2.5px)",
              backgroundSize: "9px 9px",
            }}
          />
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, boxShadow: "inset 0 0 0 2px rgba(201,206,214,0.4)" }} />
        </Face>

        {/* Base */}
        <Face w={L} h={P} transform={`rotateX(-90deg) translateZ(${A / 2}px)`} style={{ background: "#050506" }} />
      </div>
    </div>
  );
};

export const GABINETE = { L, A, P, largura: L * 2, altura: A * 1.3, base: A * 0.65 + A / 2 };
export const corLed = COR.vermelhoVivo;

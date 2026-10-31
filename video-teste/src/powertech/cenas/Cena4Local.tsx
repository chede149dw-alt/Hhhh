import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../componentes/Fundo";
import { LinhasLuz } from "../componentes/LinhasLuz";
import { Marca } from "../componentes/Marca";
import { Pino } from "../componentes/Pino";
import { Titulo } from "../componentes/Texto";
import { CENAS, CLAMP, COR, E, ENTRA_SAI, FONTE_TITULO, SUAVE, W } from "../tema";

const INICIO = CENAS.local[0];
const rel = (f: number) => f - INICIO;

/** Plano abstrato em perspectiva: rede de pontos convergindo para o centro (presença local). */
const RedeLocal: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const t = frame - inicio;
  const nos = useMemo(
    () =>
      new Array(26).fill(0).map((_, i) => {
        const ang = random(`rn-a${i}`) * Math.PI * 2;
        const r = 160 + random(`rn-r${i}`) * 560;
        return { x: Math.cos(ang) * r, y: Math.sin(ang) * r, atraso: random(`rn-d${i}`) * 26 };
      }),
    [],
  );
  const S = 1400;
  return (
    <div style={{ position: "absolute", left: W / 2 - S / 2, top: -S / 2, width: S, height: S, perspective: 1100 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateX(64deg) rotateZ(${frame * 0.12}deg)`,
          backgroundImage: "radial-gradient(rgba(201,206,214,0.28) 2px, transparent 2.5px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 62%)",
        }}
      >
        <svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2, 3].map((i) => {
            const p = ((frame / 45 + i / 4) % 1);
            return (
              <circle
                key={`o${i}`}
                r={60 + p * 640}
                fill="none"
                stroke={`rgba(255,50,30,${(1 - p) * 0.75})`}
                strokeWidth={4}
              />
            );
          })}
          {nos.map((n, i) => {
            const p = interpolate(t - n.atraso, [0, 22], [0, 1], { ...CLAMP, easing: SUAVE });
            const comp = Math.hypot(n.x, n.y);
            return (
              <g key={i} opacity={p}>
                <line
                  x1={n.x}
                  y1={n.y}
                  x2={0}
                  y2={0}
                  stroke="rgba(255,40,20,0.6)"
                  strokeWidth={2}
                  strokeDasharray={comp}
                  strokeDashoffset={comp * (1 - p)}
                />
                <circle cx={n.x} cy={n.y} r={7} fill={i % 3 === 0 ? COR.vermelhoVivo : COR.prata} />
              </g>
            );
          })}
          <circle r={26} fill={COR.vermelhoVivo} opacity={0.9} />
        </svg>
      </div>
    </div>
  );
};

/** CENA 4 — Confiança e localização. */
export const Cena4Local: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duracao = CENAS.local[1] - INICIO;

  // Abertura elegante: uma linha de luz que se expande como cortina
  const abre = interpolate(frame, [0, 18], [0, 1], { ...CLAMP, easing: ENTRA_SAI });
  const linhaAbre = interpolate(frame, [0, 6, 22], [0, 1, 0], CLAMP);

  const pino = rel(E.pino);
  const queda = spring({ frame: frame - pino, fps, config: { damping: 11, mass: 0.7, stiffness: 160 } });
  const impacto = interpolate(frame - pino, [6, 30], [0, 1], { ...CLAMP, easing: SUAVE });
  const pill = spring({ frame: frame - rel(E.localTexto), fps, config: { damping: 200 } });
  const deriva = interpolate(frame, [0, duracao], [1.04, 1], CLAMP);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${deriva})` }}>
        <Fundo brilho={0.5} brilhoY={62} piso={0} particulas={0.8} semente="c4" />
        <AbsoluteFill style={{ top: 1110, opacity: interpolate(frame, [pino - 30, pino], [0, 1], CLAMP) }}>
          <RedeLocal inicio={pino - 20} />
        </AbsoluteFill>
      </AbsoluteFill>

      <LinhasLuz inicio={rel(E.marcaLocal) - 6} quantidade={6} janela={14} semente="c4l" angulo={0} faixaY={[0.18, 0.32]} />

      {/* Marca */}
      <AbsoluteFill style={{ alignItems: "center", top: 290 }}>
        <Marca inicio={rel(E.marcaLocal)} largura={700} brilho={0.8} />
      </AbsoluteFill>

      {/* Tagline */}
      <AbsoluteFill style={{ alignItems: "center", top: 690 }}>
        <Titulo
          inicio={rel(E.taglineLocal)}
          atraso={5}
          linhas={[
            { texto: "Tecnologia mais", estilo: "branco", tamanho: 92 },
            { texto: "perto de você.", estilo: "vermelho", tamanho: 112 },
          ]}
        />
      </AbsoluteFill>

      {/* Pino caindo sobre a rede */}
      {frame >= pino ? (
        <AbsoluteFill style={{ alignItems: "center", top: 960 }}>
          <div style={{ transform: `translateY(${(1 - queda) * -420}px) scale(${0.6 + 0.4 * queda})`, opacity: Math.min(1, queda * 3) }}>
            <Pino tam={110} id="pino4" />
          </div>
        </AbsoluteFill>
      ) : null}
      {impacto > 0 && impacto < 1 ? (
        <AbsoluteFill style={{ alignItems: "center", top: 1108 }}>
          <div
            style={{
              width: 60 + impacto * 560,
              height: (60 + impacto * 560) * 0.36,
              borderRadius: "50%",
              transform: "translateY(-50%)",
              border: `3px solid rgba(255,255,255,${0.9 * (1 - impacto)})`,
              boxShadow: `0 0 40px rgba(255,40,20,${1 - impacto})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Localização */}
      {pill > 0.001 ? (
        <AbsoluteFill style={{ alignItems: "center", top: 1250 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "22px 44px 22px 34px",
              borderRadius: 999,
              background: "linear-gradient(180deg, rgba(30,30,36,0.92), rgba(8,8,10,0.92))",
              boxShadow: "inset 0 0 0 2px rgba(201,206,214,0.45), 0 0 60px rgba(225,6,0,0.4), 0 20px 60px rgba(0,0,0,0.8)",
              transform: `translateY(${(1 - pill) * 60}px)`,
              opacity: pill,
              clipPath: `inset(0 ${(1 - pill) * 50}% 0 ${(1 - pill) * 50}% round 999px)`,
            }}
          >
            <Pino tam={44} id="pino4b" brilho={0.6} />
            <span
              style={{
                fontFamily: FONTE_TITULO,
                fontWeight: 700,
                fontSize: 70,
                color: COR.branco,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              Acreúna <span style={{ color: COR.vermelhoVivo }}>—</span> Goiás
            </span>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Cortina de abertura */}
      {abre < 1 ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${50 * (1 - abre)}%`, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${50 * (1 - abre)}%`, background: "#000" }} />
        </AbsoluteFill>
      ) : null}
      {linhaAbre > 0 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {[-1, 1].map((d) => (
            <div
              key={d}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `calc(50% + ${d * 50 * abre}% - 2px)`,
                height: 4,
                opacity: linhaAbre,
                background: `linear-gradient(90deg, rgba(225,6,0,0), ${COR.vermelhoVivo} 30%, #fff 50%, ${COR.vermelhoVivo} 70%, rgba(225,6,0,0))`,
                boxShadow: "0 0 30px rgba(255,30,10,1)",
              }}
            />
          ))}
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{ backgroundColor: "#000", opacity: interpolate(frame, [duracao - 10, duracao], [0, 0.6], CLAMP) }}
      />
    </AbsoluteFill>
  );
};

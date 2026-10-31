import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../componentes/Fundo";
import { Gabinete } from "../componentes/Gabinete";
import { LinhasLuz } from "../componentes/LinhasLuz";
import { Titulo } from "../componentes/Texto";
import { CENAS, CLAMP, COR, E, ENTRA_SAI, FONTE_TEXTO, FONTE_TITULO, SUAVE } from "../tema";

const INICIO = CENAS.parcelamento[0];
const rel = (f: number) => f - INICIO;

/** Pedestal circular iluminado sob o gabinete. */
const Pedestal: React.FC<{ luz: number }> = ({ luz }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: 900, height: 220 }}>
      {[0, 1, 2].map((i) => {
        const p = ((frame / 50 + i / 3) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 420 + p * 520,
              height: (420 + p * 520) * 0.22,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `2px solid rgba(255,50,30,${(1 - p) * 0.6 * luz})`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 520,
          height: 110,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, #1E1F24 0%, #0B0B0E 80%)",
          boxShadow: `0 0 0 3px rgba(201,206,214,0.45), 0 0 60px rgba(225,6,0,${0.7 * luz}), inset 0 0 30px rgba(225,6,0,${0.4 * luz})`,
        }}
      />
    </div>
  );
};

/** Ícone estilizado de boleto (código de barras) que se desenha. */
const CodigoBarras: React.FC<{ progresso: number }> = ({ progresso }) => {
  const barras = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2];
  let x = 0;
  return (
    <svg width={300} height={120} viewBox="0 0 300 120">
      {barras.map((b, i) => {
        const w = b * 2.6;
        const el = (
          <rect
            key={i}
            x={x}
            y={interpolate(progresso, [i / barras.length, i / barras.length + 0.15], [120, 0], CLAMP)}
            width={w}
            height={120}
            fill={i % 7 === 3 ? COR.vermelhoVivo : COR.branco}
            opacity={i % 2 === 0 ? 1 : 0.92}
          />
        );
        x += w + 4.6;
        return el;
      })}
    </svg>
  );
};

/** Cartão de destaque: consulte as opções de parcelamento em boleto. */
const CartaoBoleto: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 16, mass: 0.8, stiffness: 120 } });
  if (frame < inicio) return null;
  const borda = interpolate(frame - inicio, [0, 24], [0, 1], { ...CLAMP, easing: SUAVE });
  const barras = interpolate(frame - inicio, [6, 30], [0, 1], CLAMP);
  const reflexo = interpolate(frame - inicio, [18, 40], [-30, 130], { ...CLAMP, easing: ENTRA_SAI });

  return (
    <div
      style={{
        position: "relative",
        width: 880,
        padding: "44px 52px 46px",
        borderRadius: 28,
        transform: `perspective(1400px) rotateX(${(1 - s) * 28}deg) translateY(${(1 - s) * 140}px) scale(${0.9 + 0.1 * s})`,
        opacity: interpolate(s, [0, 0.4], [0, 1], CLAMP),
        background: "linear-gradient(160deg, rgba(36,36,42,0.92) 0%, rgba(12,12,15,0.94) 60%, rgba(40,6,4,0.94) 100%)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.9), 0 0 90px rgba(225,6,0,0.35)",
        overflow: "hidden",
      }}
    >
      {/* borda metálica que se desenha */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          padding: 3,
          background: `conic-gradient(from 200deg, ${COR.vermelhoVivo} 0deg, #fff ${40 * borda}deg, ${COR.prataEscura} ${180 * borda}deg, ${COR.vermelho} ${360 * borda}deg, rgba(0,0,0,0) ${360 * borda}deg)`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <div
          style={{
            flexShrink: 0,
            padding: "22px 20px",
            borderRadius: 16,
            background: "rgba(0,0,0,0.55)",
            boxShadow: "inset 0 0 0 2px rgba(201,206,214,0.25)",
          }}
        >
          <div style={{ transform: "scale(0.62)", transformOrigin: "0 0", width: 186, height: 75 }}>
            <CodigoBarras progresso={barras} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.18em",
              color: COR.prata,
              textTransform: "uppercase",
            }}
          >
            Consulte as opções de
          </div>
          <div
            style={{
              fontFamily: FONTE_TITULO,
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: COR.branco,
            }}
          >
            Parcelamento
            <br />
            <span style={{ color: COR.vermelhoVivo, textShadow: "0 0 30px rgba(225,6,0,0.6)" }}>em boleto.</span>
          </div>
        </div>
      </div>
      {/* reflexo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(110deg, rgba(255,255,255,0) ${reflexo - 10}%, rgba(255,255,255,0.14) ${reflexo}%, rgba(255,255,255,0) ${reflexo + 10}%)`,
        }}
      />
    </div>
  );
};

/** CENA 3 — Acessibilidade e parcelamento. */
export const Cena3Parcelamento: React.FC = () => {
  const frame = useCurrentFrame();
  const duracao = CENAS.parcelamento[1] - INICIO;
  const fimHeadline = rel(E.secundariaAcesso) - 14;
  const boleto = rel(E.boleto);

  // Gabinete em destaque girando lentamente sobre o pedestal
  const angulo = interpolate(frame, [0, duracao], [62, 18], CLAMP);
  const recuo = interpolate(frame, [boleto - 10, boleto + 20], [0, 1], { ...CLAMP, easing: ENTRA_SAI });
  const entrada = interpolate(frame, [0, 18], [0, 1], { ...CLAMP, easing: SUAVE });
  const escala = interpolate(frame, [0, duracao], [0.86, 0.94], CLAMP) * (1 - 0.14 * recuo);

  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, 6], [0, 1], CLAMP) }}>
      <Fundo brilho={0.55} brilhoY={70} piso={0.45} velocidadePiso={1.5} semente="c3" camX={angulo * 2} />
      <LinhasLuz inicio={0} quantidade={12} janela={22} semente="c3a" angulo={-24} />
      <LinhasLuz inicio={40} repetir={90} quantidade={4} janela={60} semente="c3b" angulo={-24} intensidade={0.6} />

      {/* Gabinete + pedestal */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          top: 640,
          transform: `translateY(${(1 - entrada) * 200 - recuo * 90}px)`,
          opacity: (0.3 + 0.7 * entrada) * (1 - 0.45 * recuo),
          filter: recuo > 0.01 ? `blur(${recuo * 3}px)` : undefined,
        }}
      >
        <div style={{ position: "absolute", top: 760 * escala + 30, transform: `scale(${escala})` }}>
          <Pedestal luz={entrada} />
        </div>
        <div style={{ transform: `scale(${escala})`, transformOrigin: "50% 0%" }}>
          <Gabinete angulo={angulo} inclinacao={-10} ligado={1} reflexoPiso={false} />
        </div>
      </AbsoluteFill>

      {/* Mensagem principal */}
      <AbsoluteFill style={{ alignItems: "center", top: 270 }}>
        <Titulo
          inicio={rel(E.headlineAcesso)}
          fim={fimHeadline}
          atraso={5}
          linhas={[
            { texto: "Seu computador pode", estilo: "branco", tamanho: 92 },
            { texto: "estar mais perto", estilo: "vermelho", tamanho: 116 },
            { texto: "do que você imagina.", estilo: "branco", tamanho: 92 },
          ]}
        />
      </AbsoluteFill>

      {/* Mensagem secundária */}
      <AbsoluteFill style={{ alignItems: "center", top: 290 }}>
        <Titulo
          inicio={rel(E.secundariaAcesso)}
          atraso={5}
          linhas={[
            { texto: "Opções acessíveis", estilo: "metal", tamanho: 104 },
            { texto: "para você conquistar seu PC.", estilo: "branco", tamanho: 70 },
          ]}
        />
      </AbsoluteFill>

      {/* Destaque do boleto */}
      <AbsoluteFill style={{ alignItems: "center", top: 1060 }}>
        <CartaoBoleto inicio={boleto} />
      </AbsoluteFill>

      {/* saída suave */}
      <AbsoluteFill
        style={{ backgroundColor: "#000", opacity: interpolate(frame, [duracao - 10, duracao], [0, 0.5], CLAMP) }}
      />
    </AbsoluteFill>
  );
};


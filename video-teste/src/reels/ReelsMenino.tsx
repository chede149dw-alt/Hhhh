import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { BATIDAS, DURACAO, INICIO_REFRAO, VERSOS, Verso } from "./letra";

// ---------- Fontes ----------
const SERIF = "PlayfairReels";
const SANS = "InterReels";
loadFont({ family: SERIF, url: staticFile("fonts/playfair-display-latin-500-italic.woff2"), weight: "500", style: "italic" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-400-normal.woff2"), weight: "400" });

// ---------- Paleta ----------
const C = {
  fundo: "#07080C",
  texto: "#F6F1E9",
  dourado: "#F2C27B",
  ambar: "#C9813F",
  azul: "#27385A",
  rosa: "#7A3B4A",
};

const W = 1080;
const H = 1920;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const easeIn = Easing.bezier(0.55, 0, 1, 0.45);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Intensidade (0..1) do pulso das batidas do refrão no instante t.
const pulso = (t: number) =>
  BATIDAS.reduce((acc, b) => (t >= b ? Math.max(acc, Math.exp(-(t - b) * 4.5)) : acc), 0);

// ---------- Fundo cinematográfico ----------
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const refrao = interpolate(t, [INICIO_REFRAO - 0.6, INICIO_REFRAO + 0.6], [0, 1], clamp);
  const fimGeral = interpolate(t, [DURACAO - 1.4, DURACAO - 0.2], [1, 0.25], clamp);
  const p = pulso(t);

  const blobs = [
    { cor: C.ambar, x: 0.25, y: 0.3, r: 900, fx: 0.11, fy: 0.07, o: 0.32 + refrao * 0.18 },
    { cor: C.azul, x: 0.8, y: 0.7, r: 1100, fx: 0.07, fy: 0.09, o: 0.55 },
    { cor: C.rosa, x: 0.65, y: 0.2, r: 800, fx: 0.09, fy: 0.05, o: 0.12 + refrao * 0.22 },
    { cor: C.dourado, x: 0.35, y: 0.85, r: 700, fx: 0.06, fy: 0.1, o: 0.08 + refrao * 0.16 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.fundo, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fimGeral }}>
        {blobs.map((b, i) => {
          const x = b.x * W + Math.sin(t * b.fx * 6.28 + i) * 140;
          const y = b.y * H + Math.cos(t * b.fy * 6.28 + i * 2) * 180;
          const r = b.r * (1 + p * 0.08);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - r / 2,
                top: y - r / 2,
                width: r,
                height: r,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${b.cor} 0%, transparent 68%)`,
                opacity: Math.min(1, b.o + p * 0.12),
                filter: "blur(40px)",
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Bokeh (partículas de luz) ----------
const Bokeh: React.FC<{ t: number }> = ({ t }) => {
  const itens = useMemo(
    () =>
      new Array(28).fill(0).map((_, i) => ({
        x: random(`bx${i}`) * W,
        y0: random(`by${i}`) * H,
        s: 10 + random(`bs${i}`) * 46,
        v: 18 + random(`bv${i}`) * 50,
        o: 0.1 + random(`bo${i}`) * 0.35,
        fase: random(`bf${i}`) * 6.28,
        desfoque: random(`bd${i}`) > 0.55,
      })),
    [],
  );
  const refrao = interpolate(t, [INICIO_REFRAO - 0.4, INICIO_REFRAO + 1], [0.55, 1], clamp);
  const p = pulso(t);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {itens.map((b, i) => {
        const y = (((b.y0 - t * b.v) % (H + 200)) + H + 200) % (H + 200) - 100;
        const x = b.x + Math.sin(t * 0.6 + b.fase) * 30;
        const brilho = b.o * refrao * (0.75 + 0.25 * Math.sin(t * 1.7 + b.fase)) + p * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: b.s,
              height: b.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,214,160,0.95) 0%, rgba(242,194,123,0.35) 45%, transparent 70%)`,
              opacity: brilho,
              filter: b.desfoque ? "blur(6px)" : "blur(1.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Granulação de filme + vinheta ----------
const Textura: React.FC<{ frame: number }> = ({ frame }) => {
  const seed = Math.floor(frame / 2) % 60;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 46%, transparent 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <AbsoluteFill style={{ opacity: 0.11, mixBlendMode: "overlay" }}>
        <svg width={W} height={H}>
          <filter id={`grao${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grao${seed})`} />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// ---------- Flash de luz na entrada do refrão e nas batidas ----------
const Luz: React.FC<{ t: number }> = ({ t }) => {
  const varre = interpolate(t, [INICIO_REFRAO - 0.15, INICIO_REFRAO + 0.9], [-0.6, 1.6], clamp);
  const varreO = interpolate(t, [INICIO_REFRAO - 0.15, INICIO_REFRAO + 0.1, INICIO_REFRAO + 0.9], [0, 0.85, 0], clamp);
  const p = pulso(t);
  return (
    <>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: varreO,
          background: `linear-gradient(115deg, transparent ${varre * 100 - 30}%, rgba(255,190,120,0.75) ${varre * 100}%, transparent ${varre * 100 + 30}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: p * 0.22,
          background: "radial-gradient(ellipse 70% 45% at 50% 48%, rgba(255,205,150,0.9), transparent 70%)",
        }}
      />
    </>
  );
};

// ---------- Versos ----------
const TAM = 88;

const VersoAnimado: React.FC<{ verso: Verso; t: number; fps: number }> = ({ verso, t }) => {
  const inicio = verso.palavras[0].t;
  if (t < inicio - 0.2 || t > verso.fim + 0.05) return null;

  const saida = interpolate(t, [verso.fim - 0.32, verso.fim], [0, 1], { ...clamp, easing: easeIn });
  const zoom = interpolate(t, [inicio, verso.fim], [1, 1.045], clamp);
  const p = pulso(t);

  const palavras = verso.final ? verso.palavras.slice(0, -1) : verso.palavras;
  const grande = verso.final ? verso.palavras[verso.palavras.length - 1] : null;

  const renderPalavra = (w: { p: string; t: number; destaque?: boolean }, i: number) => {
    const local = t - (w.t - 0.06);
    const e = interpolate(local, [0, 0.38], [0, 1], { ...clamp, easing: ease });
    const ativa = local >= 0 && local < 0.45;
    const destaque = !!w.destaque;
    return (
      <span
        key={i}
        style={{
          display: "inline-block",
          margin: "0 0.16em",
          fontFamily: destaque ? SERIF : SANS,
          fontStyle: destaque ? "italic" : "normal",
          fontWeight: destaque ? 500 : 600,
          fontSize: destaque ? TAM * 1.3 : TAM,
          color: destaque ? C.dourado : C.texto,
          opacity: e,
          transform: `translateY(${(1 - e) * 34}px) scale(${0.92 + e * 0.08})`,
          filter: `blur(${(1 - e) * 14}px)`,
          textShadow: destaque
            ? `0 0 ${28 + p * 30}px rgba(242,194,123,${0.45 + (ativa ? 0.3 : 0)}), 0 4px 30px rgba(0,0,0,0.5)`
            : `0 0 ${ativa ? 26 : 0}px rgba(255,240,220,0.45), 0 4px 30px rgba(0,0,0,0.55)`,
          letterSpacing: destaque ? "0" : "-0.01em",
        }}
      >
        {w.p}
      </span>
    );
  };

  let grandeEl: React.ReactNode = null;
  if (grande) {
    const local = t - (grande.t - 0.05);
    const e = interpolate(local, [0, 0.6], [0, 1], { ...clamp, easing: ease });
    const respira = 1 + Math.sin(Math.max(0, local) * 2.2) * 0.012;
    grandeEl = (
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 300,
          lineHeight: 1,
          marginTop: 20,
          color: C.dourado,
          opacity: e,
          transform: `scale(${(0.7 + e * 0.3) * respira})`,
          filter: `blur(${(1 - e) * 22}px)`,
          letterSpacing: interpolate(e, [0, 1], [0.25, 0]) + "em",
          textShadow: `0 0 ${50 + p * 50}px rgba(242,194,123,0.55), 0 6px 40px rgba(0,0,0,0.5)`,
        }}
      >
        {grande.p}
      </div>
    );
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
        opacity: 1 - saida,
        transform: `translateY(${-saida * 60 - 40}px) scale(${zoom * (1 + p * 0.015)})`,
        filter: `blur(${saida * 16}px)`,
      }}
    >
      <div style={{ textAlign: "center", lineHeight: 1.22, maxWidth: 900 }}>
        {palavras.map(renderPalavra)}
      </div>
      {grandeEl}
    </AbsoluteFill>
  );
};

// ---------- Cabeçalho: título + barra de progresso ----------
const Cabecalho: React.FC<{ t: number }> = ({ t }) => {
  const e = interpolate(t, [1.6, 2.6], [0, 1], { ...clamp, easing: ease });
  const sai = interpolate(t, [DURACAO - 2.2, DURACAO - 1.2], [1, 0], clamp);
  const progresso = interpolate(t, [0, DURACAO], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: e * sai,
        transform: `translateY(${(1 - e) * -20}px)`,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 30,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "rgba(246,241,233,0.7)",
        }}
      >
        lembranças
      </div>
      <div style={{ marginTop: 22, width: 260, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.14)" }}>
        <div style={{ width: `${progresso * 100}%`, height: "100%", borderRadius: 2, background: C.dourado, boxShadow: `0 0 12px ${C.dourado}` }} />
      </div>
    </div>
  );
};

// ---------- Abertura (antes da primeira frase) ----------
const Abertura: React.FC<{ t: number }> = ({ t }) => {
  if (t > 2.3) return null;
  const e = interpolate(t, [0.15, 1.1], [0, 1], { ...clamp, easing: ease });
  const sai = interpolate(t, [1.6, 2.1], [0, 1], { ...clamp, easing: easeIn });
  const linha = interpolate(t, [0.3, 1.4], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: e * (1 - sai),
        filter: `blur(${(1 - e) * 18 + sai * 14}px)`,
        transform: `translateY(-40px) scale(${1 + sai * 0.08})`,
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 150,
          color: C.texto,
          letterSpacing: interpolate(e, [0, 1], [0.2, 0.01]) + "em",
          textShadow: "0 0 40px rgba(242,194,123,0.35)",
        }}
      >
        lembro…
      </div>
      <div style={{ marginTop: 26, width: 420 * linha, height: 2, background: `linear-gradient(90deg, transparent, ${C.dourado}, transparent)` }} />
    </AbsoluteFill>
  );
};

// ---------- Encerramento ----------
const Encerramento: React.FC<{ t: number }> = ({ t }) => {
  const ini = 33.75;
  if (t < ini) return null;
  const e = interpolate(t, [ini, ini + 0.9], [0, 1], { ...clamp, easing: ease });
  const sai = interpolate(t, [DURACAO - 0.6, DURACAO - 0.05], [0, 1], clamp);
  const coracao = 1 + Math.max(0, Math.sin((t - ini) * 5.5)) * 0.06;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: e * (1 - sai),
        filter: `blur(${(1 - e) * 16}px)`,
        transform: "translateY(-40px)",
      }}
    >
      <svg width={70} height={64} viewBox="0 0 24 22" style={{ transform: `scale(${coracao})`, filter: `drop-shadow(0 0 18px ${C.dourado})` }}>
        <path
          d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2 4 6 3.4c2.3-.3 4.4 1 6 3 1.6-2 3.7-3.3 6-3 4 .6 5.7 5 4 8.3C19.5 16.4 12 21 12 21z"
          fill={C.dourado}
        />
      </svg>
      <div
        style={{
          marginTop: 30,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 92,
          color: C.texto,
          textShadow: "0 0 36px rgba(242,194,123,0.4)",
        }}
      >
        pro nosso menino
      </div>
    </AbsoluteFill>
  );
};

// ---------- Composição ----------
export const ReelsMenino: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Câmera: leve deriva contínua para dar vida ao quadro.
  const camX = Math.sin(t * 0.35) * 8;
  const camY = Math.cos(t * 0.27) * 10;
  const fadeIn = interpolate(t, [0, 0.5], [0, 1], clamp);
  const fadeOut = interpolate(t, [DURACAO - 0.5, DURACAO], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("reels/musica.m4a")} />
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Fundo t={t} />
        <Bokeh t={t} />
        <Luz t={t} />
        <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px)` }}>
          <Abertura t={t} />
          {VERSOS.map((v, i) => (
            <VersoAnimado key={i} verso={v} t={t} fps={fps} />
          ))}
          <Encerramento t={t} />
        </AbsoluteFill>
        <Cabecalho t={t} />
        <Textura frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

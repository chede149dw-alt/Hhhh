import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, COR, ENTRA_SAI, FONTE_TITULO, METAL } from "../tema";

export type EstiloLinha = "branco" | "vermelho" | "metal";

const estiloCor = (estilo: EstiloLinha): React.CSSProperties => {
  if (estilo === "vermelho") {
    return { color: COR.vermelhoVivo, textShadow: "0 0 28px rgba(225,6,0,0.55)" };
  }
  if (estilo === "metal") {
    return {
      backgroundImage: METAL,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.8))",
    };
  }
  return { color: COR.branco, textShadow: "0 4px 30px rgba(0,0,0,0.85)" };
};

/**
 * Bloco de títulos com revelação por máscara linha a linha (entrada com spring,
 * saída com deslocamento e desfoque). Frames relativos à Sequence pai.
 */
export const Titulo: React.FC<{
  linhas: { texto: string; estilo?: EstiloLinha; tamanho?: number }[];
  inicio: number;
  fim?: number; // frame em que começa a sair
  atraso?: number; // frames entre linhas
  tamanho?: number;
  alinhamento?: "center" | "left";
  espacamento?: number; // letter-spacing (em)
  peso?: number;
  altura?: number; // line-height
  style?: React.CSSProperties;
}> = ({
  linhas,
  inicio,
  fim,
  atraso = 5,
  tamanho = 110,
  alinhamento = "center",
  espacamento = 0.01,
  peso = 700,
  altura = 0.98,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < inicio - 1) return null;
  const saida = fim === undefined ? 0 : interpolate(frame, [fim, fim + 12], [0, 1], { ...CLAMP, easing: ENTRA_SAI });
  if (saida >= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: alinhamento === "center" ? "center" : "flex-start",
        textAlign: alinhamento,
        fontFamily: FONTE_TITULO,
        fontWeight: peso,
        textTransform: "uppercase",
        letterSpacing: `${espacamento}em`,
        lineHeight: altura,
        opacity: 1 - saida,
        transform: `translateY(${-50 * saida}px)`,
        filter: saida > 0 ? `blur(${saida * 10}px)` : undefined,
        ...style,
      }}
    >
      {linhas.map((l, i) => {
        const s = spring({ frame: frame - inicio - i * atraso, fps, config: { damping: 200, mass: 0.7 } });
        const brilho = interpolate(frame - inicio - i * atraso, [0, 6, 18], [0, 1, 0], CLAMP);
        const t = l.tamanho ?? tamanho;
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0.06em 0.12em", margin: "-0.04em 0" }}>
            <div
              style={{
                fontSize: t,
                transform: `translateY(${(1 - s) * 105}%) skewY(${(1 - s) * 6}deg)`,
                opacity: interpolate(s, [0, 0.3], [0, 1], CLAMP),
                whiteSpace: "nowrap",
                ...estiloCor(l.estilo ?? "branco"),
                ...(brilho > 0 && (l.estilo ?? "branco") === "branco"
                  ? { textShadow: `0 0 ${30 * brilho}px rgba(255,80,60,${0.8 * brilho}), 0 4px 30px rgba(0,0,0,0.85)` }
                  : null),
              }}
            >
              {l.texto}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Pequeno rótulo técnico com traços laterais (ex.: "— POWER TECH —"). */
export const Rotulo: React.FC<{
  texto: string;
  inicio: number;
  fim?: number;
  tamanho?: number;
  cor?: string;
  style?: React.CSSProperties;
}> = ({ texto, inicio, fim, tamanho = 34, cor = COR.prata, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inicio, inicio + 16], [0, 1], { ...CLAMP, easing: ENTRA_SAI });
  const saida = fim === undefined ? 0 : interpolate(frame, [fim, fim + 10], [0, 1], CLAMP);
  if (p <= 0 || saida >= 1) return null;
  const traco = 90 * p;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        opacity: p * (1 - saida),
        fontFamily: FONTE_TITULO,
        fontWeight: 600,
        fontSize: tamanho,
        letterSpacing: `${interpolate(p, [0, 1], [0.6, 0.32])}em`,
        color: cor,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <div style={{ width: traco, height: 2, background: `linear-gradient(90deg, transparent, ${COR.vermelho})` }} />
      <span style={{ marginRight: "-0.32em" }}>{texto}</span>
      <div style={{ width: traco, height: 2, background: `linear-gradient(270deg, transparent, ${COR.vermelho})` }} />
    </div>
  );
};

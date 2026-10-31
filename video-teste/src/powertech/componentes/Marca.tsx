import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, COR, ENTRA_SAI, FONTE_MARCA, METAL, SUAVE } from "../tema";

/**
 * Composição tipográfica TEMPORÁRIA do nome POWER TECH.
 * Não é um logotipo oficial: substitua pelo arquivo oficial da marca quando disponível.
 *
 * Animação: letras chegam do fundo com desfoque, uma linha de laser se desenha entre
 * as palavras e um reflexo metálico atravessa o nome (aplicado letra a letra, para
 * iluminar apenas o texto).
 */
const LARGURA_BASE = 760;
const VERMELHO_TECH = `linear-gradient(180deg, #FF5144 0%, ${COR.vermelhoVivo} 45%, #C80500 100%)`;

export const Marca: React.FC<{
  inicio: number;
  largura?: number;
  brilho?: number;
  reflexo?: number; // frame (relativo à Sequence) em que o reflexo atravessa
  instantanea?: boolean;
}> = ({ inicio, largura = LARGURA_BASE, brilho = 1, reflexo, instantanea = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = instantanea ? 1000 : frame - inicio;
  if (f < 0) return null;

  const escala = largura / LARGURA_BASE;
  const laser = interpolate(f, [10, 26], [0, 1], { ...CLAMP, easing: SUAVE });
  const tReflexo = frame - (reflexo ?? inicio + 22);
  // posição do reflexo em px dentro do bloco (de fora à esquerda até fora à direita)
  const xReflexo = interpolate(tReflexo, [0, 22], [-200, LARGURA_BASE + 200], { ...CLAMP, easing: ENTRA_SAI });
  const reflexoAtivo = tReflexo >= 0 && tReflexo <= 22;
  const espTech = interpolate(spring({ frame: f - 12, fps, config: { damping: 200 } }), [0, 1], [0.9, 0.44]);
  const halo = interpolate(f, [0, 14, 40], [0, 1.4, 1], CLAMP) * brilho;

  // Gradiente da letra com faixa de reflexo posicionada em coordenadas do bloco
  const fundoLetra = (base: string, centroX: number, larguraLetra: number) => {
    if (!reflexoAtivo) return base;
    const p = ((xReflexo - (centroX - larguraLetra / 2)) / larguraLetra) * 100;
    return `linear-gradient(105deg, rgba(255,255,255,0) ${p - 70}%, rgba(255,255,255,0.95) ${p}%, rgba(255,255,255,0) ${p + 70}%), ${base}`;
  };

  const letra = (c: string, i: number, base: number, fundo: string) => {
    const s = spring({ frame: f - base - i * 2, fps, config: { damping: 18, mass: 0.6, stiffness: 140 } });
    const des = interpolate(f - base - i * 2, [0, 10], [14, 0], CLAMP);
    return (
      <span
        key={i}
        style={{
          display: "inline-block",
          transform: `scale(${interpolate(s, [0, 1], [1.9, 1])})`,
          opacity: interpolate(s, [0, 0.4], [0, 1], CLAMP),
          filter: des > 0.2 ? `blur(${des}px)` : undefined,
          backgroundImage: fundo,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {c}
      </span>
    );
  };

  // Posições aproximadas das letras (Orbitron) dentro do bloco de 760 px
  const lPower = 146;
  const iniPower = (LARGURA_BASE - lPower * 5) / 2;
  const lTech = 92 * (0.78 + espTech);
  const iniTech = (LARGURA_BASE - lTech * 4) / 2;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${escala})`,
        width: LARGURA_BASE,
      }}
    >
      {/* Halo vermelho atrás do nome */}
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: -40,
          bottom: -40,
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(225,6,0,0.55) 0%, rgba(225,6,0,0) 70%)",
          opacity: halo * 0.8,
          filter: "blur(10px)",
        }}
      />

      {/* POWER — prata metálica */}
      <div
        style={{
          position: "relative",
          fontFamily: FONTE_MARCA,
          fontWeight: 900,
          fontSize: 168,
          lineHeight: 1,
          letterSpacing: "0.02em",
          filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.9))",
          whiteSpace: "nowrap",
        }}
      >
        {"POWER".split("").map((c, i) => letra(c, i, 0, fundoLetra(METAL, iniPower + lPower * (i + 0.5), lPower)))}
      </div>

      {/* Linha de laser entre as palavras */}
      <div style={{ position: "relative", width: 720, height: 10, margin: "18px 0 14px" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 3,
            height: 4,
            width: 720 * laser,
            transform: "translateX(-50%)",
            borderRadius: 4,
            background: `linear-gradient(90deg, rgba(225,6,0,0) 0%, ${COR.vermelho} 18%, #FFB4A8 50%, ${COR.vermelho} 82%, rgba(225,6,0,0) 100%)`,
            boxShadow: "0 0 18px rgba(255,30,10,0.95), 0 0 42px rgba(225,6,0,0.6)",
          }}
        />
      </div>

      {/* TECH — vermelho com brilho */}
      <div
        style={{
          position: "relative",
          fontFamily: FONTE_MARCA,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1,
          letterSpacing: `${espTech}em`,
          marginRight: `-${espTech}em`,
          whiteSpace: "nowrap",
          filter: `drop-shadow(0 0 ${14 * halo}px rgba(255,30,10,0.85)) drop-shadow(0 0 ${34 * halo}px rgba(225,6,0,0.55))`,
        }}
      >
        {"TECH".split("").map((c, i) => letra(c, i, 10, fundoLetra(VERMELHO_TECH, iniTech + lTech * (i + 0.5), lTech)))}
      </div>
    </div>
  );
};

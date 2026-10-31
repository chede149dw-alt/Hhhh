import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CLAMP, H, SUAVE, W } from "../tema";

type Feixe = { y: number; atraso: number; comp: number; travessia: number; esp: number; alfa: number; dir: 1 | -1 };

/**
 * Feixes de luz vermelha que atravessam a tela.
 * Os frames são relativos ao início da Sequence onde o componente está.
 */
export const LinhasLuz: React.FC<{
  inicio?: number;
  quantidade?: number;
  janela?: number; // intervalo (frames) em que os feixes são disparados
  angulo?: number;
  semente?: string;
  faixaY?: [number, number]; // faixa vertical (0..1)
  repetir?: number; // se > 0, reinicia o ciclo a cada N frames
  intensidade?: number;
}> = ({
  inicio = 0,
  quantidade = 8,
  janela = 20,
  angulo = -14,
  semente = "l",
  faixaY = [0.1, 0.9],
  repetir = 0,
  intensidade = 1,
}) => {
  const frameBruto = useCurrentFrame() - inicio;
  const frame = repetir > 0 && frameBruto >= 0 ? frameBruto % repetir : frameBruto;
  const feixes: Feixe[] = useMemo(
    () =>
      new Array(quantidade).fill(0).map((_, i) => ({
        y: interpolate(random(`${semente}y${i}`), [0, 1], faixaY),
        atraso: random(`${semente}a${i}`) * janela,
        comp: 280 + random(`${semente}c${i}`) * 700,
        travessia: 12 + random(`${semente}t${i}`) * 14,
        esp: 2 + random(`${semente}e${i}`) * 4,
        alfa: 0.5 + random(`${semente}o${i}`) * 0.5,
        dir: random(`${semente}d${i}`) < 0.5 ? 1 : -1,
      })),
    [quantidade, semente, janela, faixaY],
  );
  if (frame < 0) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: -W * 0.5,
          top: -H * 0.1,
          width: W * 2,
          height: H * 1.2,
          transform: `rotate(${angulo}deg)`,
        }}
      >
        {feixes.map((f, i) => {
          const p = interpolate(frame - f.atraso, [0, f.travessia], [0, 1], { ...CLAMP, easing: SUAVE });
          if (p <= 0 || p >= 1) return null;
          const largura = W * 2;
          const xIni = f.dir === 1 ? -f.comp : largura;
          const xFim = f.dir === 1 ? largura : -f.comp;
          const x = interpolate(p, [0, 1], [xIni, xFim]);
          const fade = interpolate(p, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
          const g = f.dir === 1 ? "90deg" : "270deg";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: f.y * H * 1.2,
                width: f.comp,
                height: f.esp,
                borderRadius: f.esp,
                opacity: fade * f.alfa * intensidade,
                background: `linear-gradient(${g}, rgba(225,6,0,0) 0%, rgba(225,6,0,0.9) 55%, rgba(255,190,170,1) 92%, #fff 100%)`,
                boxShadow: `0 0 ${f.esp * 6}px rgba(255,30,10,0.9), 0 0 ${f.esp * 16}px rgba(225,6,0,0.6)`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Transição: feixe largo + leque de linhas + clarão curto. Duração ~22 frames. */
export const TransicaoLuz: React.FC<{ semente?: string; angulo?: number }> = ({ semente = "tr", angulo = -14 }) => {
  const frame = useCurrentFrame();
  const clarao = interpolate(frame, [6, 10, 20], [0, 0.32, 0], CLAMP);
  const varredura = interpolate(frame, [0, 16], [-0.3, 1.3], { ...CLAMP, easing: SUAVE });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <LinhasLuz quantidade={14} janela={8} semente={semente} angulo={angulo} intensidade={1.1} />
      <AbsoluteFill style={{ mixBlendMode: "screen", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: -H * 0.25,
            left: varredura * W * 1.6 - W * 0.5,
            width: 260,
            height: H * 1.5,
            transform: `rotate(${-angulo + 2}deg)`,
            background:
              "linear-gradient(90deg, rgba(225,6,0,0) 0%, rgba(225,6,0,0.45) 40%, rgba(255,220,210,0.85) 50%, rgba(225,6,0,0.45) 60%, rgba(225,6,0,0) 100%)",
            filter: "blur(18px)",
            opacity: interpolate(frame, [0, 4, 16, 22], [0, 1, 1, 0], CLAMP),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(255,70,50,${clarao})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

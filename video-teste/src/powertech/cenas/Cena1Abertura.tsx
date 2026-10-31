import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../componentes/Fundo";
import { LinhasLuz } from "../componentes/LinhasLuz";
import { Marca } from "../componentes/Marca";
import { Titulo } from "../componentes/Texto";
import { Tunel } from "../componentes/Tunel";
import { ACELERA, CENAS, CLAMP, E, H, SUAVE, W } from "../tema";

/** CENA 1 — Abertura: escuridão, pulso de energia, avanço de câmera e revelação da marca. */
export const Cena1Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duracao = CENAS.abertura[1] - CENAS.abertura[0];

  // Pulso de energia horizontal
  const pulso = interpolate(frame, [E.pulso, E.pulso + 9], [0, 1], { ...CLAMP, easing: ACELERA });
  const rastroPulso = interpolate(frame, [E.pulso + 6, E.pulso + 30], [1, 0], CLAMP);
  const onda = interpolate(frame, [E.pulso + 8, E.pulso + 34], [0, 1], { ...CLAMP, easing: SUAVE });

  // Câmera avançando pelo ambiente
  const avanco = interpolate(frame, [E.pulso + 6, E.marcaAbertura + 10, 70], [0, 1, 0.15], CLAMP);
  const zoom = interpolate(spring({ frame: frame - E.pulso, fps, config: { damping: 200, mass: 1.4 } }), [0, 1], [1.35, 1]);
  const derivaZoom = interpolate(frame, [40, duracao], [1, 1.06], CLAMP);
  const luzAmbiente = interpolate(frame, [0, E.pulso, E.pulso + 14], [0.05, 0.1, 0.75], CLAMP);

  // Saída da cena
  const saida = interpolate(frame, [duracao - 14, duracao], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: 1 - saida * 0.6 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom * derivaZoom})` }}>
        <Fundo
          brilho={luzAmbiente}
          brilhoY={46}
          piso={interpolate(frame, [E.pulso, E.pulso + 20], [0, 0.55], CLAMP)}
          velocidadePiso={6 + avanco * 22}
          particulas={interpolate(frame, [0, E.pulso + 10], [0.25, 1], CLAMP)}
          semente="ab"
        />
        <Tunel intensidade={avanco * 0.9} velocidade={0.6 + avanco * 1.6} cy={H * 0.42} />
      </AbsoluteFill>

      {/* Pulso: linha incandescente que corta a tela */}
      {frame >= E.pulso && rastroPulso > 0 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: H * 0.42 - 3,
              left: 0,
              width: W * pulso,
              height: 6,
              opacity: rastroPulso,
              background: "linear-gradient(90deg, rgba(225,6,0,0) 0%, rgba(225,6,0,0.9) 60%, #FFD9D2 97%, #fff 100%)",
              boxShadow: "0 0 24px rgba(255,30,10,1), 0 0 80px rgba(225,6,0,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: H * 0.42 - 160,
              left: 0,
              right: 0,
              height: 320,
              opacity: rastroPulso * pulso * 0.6,
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(225,6,0,0.6), rgba(0,0,0,0) 70%)",
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Onda de choque circular */}
      {onda > 0 && onda < 1 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              left: W / 2,
              top: H * 0.42,
              width: 1600 * onda,
              height: 1600 * onda,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `${10 * (1 - onda) + 1}px solid rgba(255,60,40,${0.8 * (1 - onda)})`,
              boxShadow: `0 0 60px rgba(225,6,0,${0.7 * (1 - onda)}), inset 0 0 60px rgba(225,6,0,${0.5 * (1 - onda)})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      <LinhasLuz inicio={E.pulso + 4} quantidade={10} janela={26} semente="ab1" />
      <LinhasLuz inicio={E.marcaAbertura - 4} quantidade={6} janela={14} semente="ab2" angulo={-8} faixaY={[0.3, 0.6]} />

      {/* Marca */}
      <AbsoluteFill style={{ alignItems: "center", top: 640, height: 400 }}>
        <div style={{ transform: `translateY(${interpolate(frame, [70, duracao], [0, -40], CLAMP)}px)` }}>
          <Marca inicio={E.marcaAbertura} largura={800} />
        </div>
      </AbsoluteFill>

      {/* Frase de abertura */}
      <AbsoluteFill style={{ alignItems: "center", top: 1130 }}>
        <Titulo
          inicio={E.fraseAbertura}
          atraso={6}
          linhas={[
            { texto: "Sua próxima experiência", estilo: "branco", tamanho: 78 },
            { texto: "começa aqui.", estilo: "vermelho", tamanho: 118 },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

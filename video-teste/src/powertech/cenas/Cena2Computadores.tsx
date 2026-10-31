import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Fundo } from "../componentes/Fundo";
import { Gabinete } from "../componentes/Gabinete";
import { LinhasLuz, TransicaoLuz } from "../componentes/LinhasLuz";
import { Setup } from "../componentes/Setup";
import { Titulo } from "../componentes/Texto";
import { CENAS, CLAMP, E, ENTRA_SAI, SUAVE } from "../tema";

const INICIO = CENAS.computadores[0];
const rel = (f: number) => f - INICIO;

/** Plano A: close cinematográfico do gabinete ligando, com órbita de câmera. */
const PlanoGabinete: React.FC = () => {
  const frame = useCurrentFrame();
  const fim = rel(E.setupCorte);
  const ligado = interpolate(frame, [rel(E.tecnologia) - 10, rel(E.tecnologia) + 4], [0, 1], { ...CLAMP, easing: SUAVE });
  const angulo = interpolate(frame, [0, fim + 10], [22, 58], { easing: ENTRA_SAI, ...CLAMP });
  const escala = interpolate(frame, [0, fim + 10], [1.28, 1.08], { easing: SUAVE, ...CLAMP });
  const subida = interpolate(frame, [0, fim + 10], [80, 0], { easing: SUAVE, ...CLAMP });
  const entrada = interpolate(frame, [0, 10], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: entrada }}>
      <Fundo brilho={0.45 + 0.4 * ligado} brilhoY={64} piso={0.6} velocidadePiso={2} semente="c2a" camX={angulo * 4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 260 }}>
        <div style={{ transform: `translateY(${subida}px)` }}>
          <Gabinete angulo={angulo} inclinacao={-9} ligado={ligado} escala={escala} />
        </div>
      </AbsoluteFill>
      <LinhasLuz inicio={rel(E.tecnologia) - 4} quantidade={5} janela={12} semente="c2l" faixaY={[0.15, 0.35]} angulo={-6} />
      <AbsoluteFill style={{ alignItems: "center", top: 270 }}>
        <Titulo
          inicio={rel(E.tecnologia)}
          fim={fim - 10}
          atraso={5}
          linhas={[
            { texto: "Tecnologia", estilo: "metal", tamanho: 150 },
            { texto: "para o seu dia a dia.", estilo: "branco", tamanho: 84 },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Plano B: setup completo com parallax e as três afirmações. */
const PlanoSetup: React.FC = () => {
  const frame = useCurrentFrame(); // relativo ao corte
  const zoom = interpolate(frame, [0, 100], [1.0, 1.08], CLAMP);
  const camX = interpolate(frame, [0, 100], [-30, 30], { easing: ENTRA_SAI, ...CLAMP });
  const base = E.setupCorte;
  return (
    <AbsoluteFill>
      <Fundo brilho={0.5} brilhoY={40} piso={0} particulas={0.6} semente="c2b" camX={camX} />
      <Setup camZoom={zoom} camX={camX} />
      <AbsoluteFill style={{ top: 250, alignItems: "center", gap: 0 }}>
        <Titulo inicio={E.setup[0] - base} linhas={[{ texto: "Seu setup.", estilo: "branco", tamanho: 120 }]} />
        <Titulo inicio={E.setup[1] - base} linhas={[{ texto: "Seu estilo.", estilo: "metal", tamanho: 120 }]} />
        <Titulo inicio={E.setup[2] - base} linhas={[{ texto: "Sua conquista.", estilo: "vermelho", tamanho: 120 }]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** CENA 2 — Apresentação dos computadores. */
export const Cena2Computadores: React.FC = () => {
  const corte = rel(E.setupCorte);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={corte + 8} name="Plano gabinete">
        <PlanoGabinete />
      </Sequence>
      <Sequence from={corte} name="Plano setup">
        <PlanoSetup />
      </Sequence>
      <Sequence from={corte - 10} durationInFrames={24} name="Transição interna">
        <TransicaoLuz semente="c2t" angulo={-20} />
      </Sequence>
    </AbsoluteFill>
  );
};

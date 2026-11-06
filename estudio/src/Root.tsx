import React from "react";
import { AbsoluteFill, Composition, Still } from "remotion";
import { Chede, Expressao, Pose } from "./personagens/Chede";
import { Quarto } from "./cenarios/Quarto";
import { Fenda } from "./efeitos/Fenda";
import { FeixeDeLuz, Gradacao, Grao, Legenda, Poeira } from "./estilo/Acabamento";

const FundoNeutro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #D9D3C7 0%, #B9B2A5 100%)" }}>
    {children}
  </AbsoluteFill>
);

export const ChedeFrente: React.FC<{ expressao: Expressao }> = ({ expressao }) => (
  <FundoNeutro>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <g transform="translate(540,1840) scale(0.98)">
        <Chede expressao={expressao} />
      </g>
    </svg>
  </FundoNeutro>
);

// Quadro de estilo: Chede no quarto, descobrindo o poder.
export const FrameEstilo: React.FC<{ pose: Pose; expressao: Expressao }> = ({ pose, expressao }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Quarto />
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform="translate(540,2480) scale(1.32)">
          <Chede expressao={expressao} pose={pose} />
        </g>
        <Fenda x={312} y={1060} tamanho={0.75} />
      </svg>
    </AbsoluteFill>
    <FeixeDeLuz />
    <Poeira />
    <Gradacao />
    <Grao />
    <Legenda palavras={["SUMIU", "NA", "MÃO"]} destaque={[0]} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="ChedeFrente" component={ChedeFrente} width={1080} height={1920} defaultProps={{ expressao: "neutro" as Expressao }} />
    <Composition
      id="FrameEstilo"
      component={FrameEstilo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={60}
      defaultProps={{ expressao: "espanto" as Expressao, pose: { bracoE: 80, antebracoE: -152, olharX: -0.7, olharY: 0.9, cabeca: -4 } as Pose }}
    />
  </>
);

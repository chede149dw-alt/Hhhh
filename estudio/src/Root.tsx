import React from "react";
import { AbsoluteFill, Composition, Still } from "remotion";
import { Chede, Expressao, Pose } from "./personagens/Chede";
import { Quarto } from "./cenarios/Quarto";
import { FichaChede } from "./personagens/FichaChede";
import { Teste3D } from "./cenarios3d/Teste3D";
import { TesteKaik3D } from "./cenarios3d/TesteKaik3D";
import { FotoPerfil } from "./personagens/FotoPerfil";
import { DURACAO, FPS, Sumir1 } from "./episodios/sumir1/Sumir1";
import { DURACAO_VEL1, Velocidade1 } from "./episodios/velocidade1/Velocidade1";
import { DURACAO_VIG3, Vigiados3 } from "./episodios/vigiados3/Vigiados3";
import { Fenda } from "./efeitos/Fenda";
import { DURACAO_TESTE2, TesteEstilo2 } from "./estilo2/TesteEstilo2";
import { DURACAO_HIBRIDO, TesteHibrido } from "./estilo2/TesteHibrido";
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
    <Composition id="Velocidade1" component={Velocidade1} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO_VEL1} />
    <Composition id="Vigiados3" component={Vigiados3} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO_VIG3} />
    <Composition id="TesteEstilo2" component={TesteEstilo2} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO_TESTE2} />
    <Composition id="TesteHibrido" component={TesteHibrido} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO_HIBRIDO} />
    <Composition id="Sumir1" component={Sumir1} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO} />
    <Composition id="TesteKaik3D" component={TesteKaik3D} width={1080} height={1920} fps={30} durationInFrames={120} />
    <Composition id="Teste3D" component={Teste3D} width={1080} height={1920} fps={30} durationInFrames={90} defaultProps={{ modo: "baixo" as const }} />
    <Still id="FotoPerfil" component={FotoPerfil} width={1080} height={1080} />
    <Still id="FichaChede" component={FichaChede} width={2400} height={2700} />
    <Still id="FichaKaik" component={FichaChede} width={2400} height={2700} defaultProps={{ quem: "kaik" as const }} />
    <Still id="FichaRegente" component={FichaChede} width={2400} height={2700} defaultProps={{ quem: "regente" as const }} />
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

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import timing from "./timing.json";
import { FPS, Legendas } from "../comum";
import { Gradacao, Grao, Poeira } from "../../estilo/Acabamento";
import { Vinheta } from "../limites4/Comum4";
import * as E from "./Cenas5";

// Parte 5 · "E se você se escondesse dentro do seu poder?" — padrão da referência 5 (3D + 2D, cor única).
const T = timing as {
  duracao: number;
  linhas: { inicio: number; fim: number }[];
  palavras: { w: string; linha: number; destaque: string | null; inicio: number; fim: number }[];
};
export const DURACAO_ESC5 = Math.ceil((T.duracao + 1.2) * FPS);

const CENAS: React.FC[] = [
  E.E0_Capa, E.E1_Farois, E.E2_SeisCarros, E.E3_Agentes, E.E4_Juntos, E.E5_UmaMente, E.E6_SeisG, E.E7_Ideia,
  E.E8_FendaChao, E.E9_Caindo, E.E10_Vazio, E.E11_Termica, E.E12_Gato, E.E13_Volta, E.E14_Vazio, E.E15_Chamadas,
  E.E16_Data, E.E17_Tempo, E.E18_GatoJunto, E.E19_Esperando, E.E20_Final,
];

export const Esconder5: React.FC = () => {
  const ini = T.linhas.map((l, i) => (i === 0 ? 0 : Math.round(l.inicio * FPS) - 3));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map((Cena, i) => {
        const de = ini[i];
        const ate = i + 1 < CENAS.length ? ini[i + 1] : DURACAO_ESC5;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, ate - de)}>
            <Cena />
          </Sequence>
        );
      })}
      <Poeira n={30} />
      <Gradacao />
      <Vinheta forca={0.38} />
      <Grao forca={0.08} />
      <Legendas palavras={T.palavras} duracao={T.duracao} />
      <Audio src={staticFile("esconder5/narracao.mp3")} />
      <Audio src={staticFile("esconder5/trilha.wav")} volume={0.9} />
    </AbsoluteFill>
  );
};

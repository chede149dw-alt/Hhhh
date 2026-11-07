import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import timing from "./timing.json";
import { FPS, Legendas } from "../comum";
import { Gradacao, Grao, Poeira } from "../../estilo/Acabamento";
import { Vinheta } from "./Comum4";
import * as A from "./Cenas4a";
import * as B from "./Cenas4b";

// Parte 4 · "E se você testasse o limite do seu poder?" — visual 2.0 (cenário 3D + personagens 2D).
const T = timing as {
  duracao: number;
  linhas: { inicio: number; fim: number }[];
  palavras: { w: string; linha: number; destaque: string | null; inicio: number; fim: number }[];
};
export const DURACAO_LIM4 = Math.ceil((T.duracao + 1.2) * FPS);

const CENAS: React.FC[] = [
  A.L0_Capa, A.L1_CarroVai, A.L2_Relogio, A.L3_Mapa, A.L4_Sobe, A.L5_SeisG, A.L6_Piloto, A.L7_Verde, A.L8_CameraVira,
  A.L9_Aula, A.L10_Olhos, A.L11_CarroFora, A.L12_Intervalo, A.L13_Mora, A.L14_Ficha, A.L15_Capaz, A.L16_Campo,
  B.L17_Teste1, B.L18_DoisMil, B.L19_Sola, B.L20_Paes, B.L21_Circulo, B.L22_Ar, B.L23_Tornado, B.L24_Porta, B.L25_Tontura,
  B.L26_JogaPedra, B.L27_SoOlhando, B.L28_Testa, B.L29_Fenda, B.L30_OlhoVermelho, B.L31_Carro, B.L32_Respira,
  B.L33_QuatroMetros, B.L34_Marcas, B.L35_Final,
];

export const Limites4: React.FC = () => {
  const ini = T.linhas.map((l, i) => (i === 0 ? 0 : Math.round(l.inicio * FPS) - 3));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map((Cena, i) => {
        const de = ini[i];
        const ate = i + 1 < CENAS.length ? ini[i + 1] : DURACAO_LIM4;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, ate - de)}>
            <Cena />
          </Sequence>
        );
      })}
      <Poeira n={36} />
      <Gradacao />
      <Vinheta forca={0.35} />
      <Grao forca={0.08} />
      <Legendas palavras={T.palavras} duracao={T.duracao} />
      <Audio src={staticFile("limites4/narracao.mp3")} />
      <Audio src={staticFile("limites4/trilha.wav")} volume={0.9} />
    </AbsoluteFill>
  );
};

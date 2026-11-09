import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Vivo } from "../episodios/comum";

// Imagem-alvo do usuário (local, fora do Git) ao lado do nosso Chede, mesma altura.
export const Alvo: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Img src={staticFile("tmp-alvo/alvo.png")} style={{ position: "absolute", left: 0, top: 0, width: 1024, height: 1536 }} />
    <svg viewBox="0 0 1024 1536" width={1024} height={1536} style={{ position: "absolute", left: 1024, top: 0 }}>
      <Vivo quem="chede" x={512} y={1510} s={0.955} vista="frente" expr="neutro" pose={{ bracoE: 3, bracoD: 3, antebracoE: 0, antebracoD: 0 }} parado semSombra />
    </svg>
  </AbsoluteFill>
);

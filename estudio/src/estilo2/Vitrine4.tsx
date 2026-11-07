import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Plano3D, orbita } from "../cenarios3d/Kit3D";
import { Anfiteatro3D, Campo3D, Cantina3D, Faculdade3D, Tornado3D } from "../cenarios3d/Cenarios4";
import { useP } from "../episodios/comum";

const V1 = () => (
  <Plano3D clima="manha" cam={{ pos: [-7, 1.6, 9], alvo: [0, 2.6, -4], fov: 50 }} cenario={<Faculdade3D luzCamera={1} />}
    atores={[{ quem: "chede", x: -0.8, z: 3, vista: "tresQuartos", expr: "cansado" }, { quem: "kaik", x: 0.6, z: 3.3, vista: "tresQuartos", expr: "rindo", espelhar: true }]} />
);
const V2 = () => (
  <Plano3D clima="interior" cam={{ pos: [-6, 4.2, 10], alvo: [2, 2.2, -2], fov: 48 }} cenario={<Anfiteatro3D />}
    atores={[{ quem: "chede", x: -3.6, z: 3.1, y: 1.14, vista: "tresQuartos", expr: "medo", escala: 1 }]} desfoque={1.5} />
);
const V3 = () => (
  <Plano3D clima="dia" cam={orbita([0, 1, 0], 20, 5, 1.6, 42)} cenario={<Cantina3D />} desfoque={3}
    atores={[{ quem: "chede", x: 0, z: -1.1, vista: "tresQuartos", expr: "medo" }, { quem: "kaik", x: 0, z: 1.1, vista: "tresQuartos", expr: "espanto", espelhar: true }]} />
);
const V4 = () => {
  const { f } = useP();
  return (
    <Plano3D clima="porDoSol" cam={{ pos: [-14, 5, 14], alvo: [0, 3, -6], fov: 50 }} cenario={<><Campo3D marcas={1} /><Tornado3D p={[-3, 0, -2]} t={f / 30 + 3} forca={1} /></>}
      atores={[{ quem: "chede", x: -6, z: 4, vista: "tresQuartos", expr: "espanto" }]} />
  );
};
export const Vitrine4: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={1}><V1 /></Sequence>
    <Sequence from={1} durationInFrames={1}><V2 /></Sequence>
    <Sequence from={2} durationInFrames={1}><V3 /></Sequence>
    <Sequence from={3} durationInFrames={1}><V4 /></Sequence>
  </AbsoluteFill>
);

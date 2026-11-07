import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Rua3D } from "./Rua3D";

export const Teste3D: React.FC<{ modo?: "aereo" | "baixo" }> = ({ modo = "baixo" }) => {
  const f = useCurrentFrame();
  const cam =
    modo === "aereo"
      ? { pos: [0, 22, 14 - f * 0.05] as [number, number, number], alvo: [0, 0, -25 - f * 0.05] as [number, number, number], fov: 45 }
      : { pos: [-1.5, 1.2, 6] as [number, number, number], alvo: [0.5, 1.4, -10] as [number, number, number], fov: 55 };
  return (
    <AbsoluteFill>
      <Rua3D cam={cam} onibusZ={-30 + f * 0.3} />
    </AbsoluteFill>
  );
};

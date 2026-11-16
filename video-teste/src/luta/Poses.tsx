import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DefsLutadores, KAEN, Lutador, POSES, REN, NomePose } from "./rig";

// Folha de poses para conferência visual.
export const Poses: React.FC = () => {
  const frame = useCurrentFrame();
  const nomes = Object.keys(POSES) as NomePose[];
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a2150" }}>
      <svg width={1080} height={1920}>
        <DefsLutadores />
        {nomes.map((n, i) => {
          const col = i % 4;
          const lin = Math.floor(i / 4);
          const vis = i % 2 === 0 ? REN : KAEN;
          return (
            <g key={n} transform={`translate(${130 + col * 270} ${225 + lin * 235}) scale(0.5)`}>
              <line x1={-200} y1={0} x2={200} y2={0} stroke="#fff" opacity={0.3} />
              <Lutador est={{ x: 0, alt: 0, rot: 0, face: 1, esc: 1, pose: POSES[n] }} vis={vis} frame={frame} fogo={vis.id === "kaen" ? 1 : 0} />
              <text x={-180} y={50} fill="#fff" fontSize={36} fontFamily="sans-serif">{n}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

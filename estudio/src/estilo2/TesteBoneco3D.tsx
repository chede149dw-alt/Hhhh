import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Boneco3D, Expressao3D } from "../personagens/Boneco3D";

const Olhar: React.FC<{ alvo: [number, number, number] }> = ({ alvo }) => {
  const { camera } = useThree();
  camera.lookAt(new THREE.Vector3(...alvo));
  return null;
};

// Teste do Chede 3D: imagem do usuário (local, fora do Git) à esquerda, nosso modelo à direita.
export const TesteBoneco3D: React.FC<{ expr?: Expressao3D }> = ({ expr = "triste" }) => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Img src={staticFile("tmp-alvo/alvo.png")} style={{ position: "absolute", left: 0, top: 0, width: 1024, height: 1536 }} />
    <div style={{ position: "absolute", left: 1024, top: 0, width: 1024, height: 1536 }}>
      <ThreeCanvas width={1024} height={1536} camera={{ fov: 30, position: [0, 0.9, 3.45], near: 0.1, far: 50 }} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: "#fff" }}>
        <Olhar alvo={[0, 0.9, 0]} />
        <hemisphereLight args={["#ffffff", "#d8d2cc", 1.0]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-2.5, 4, 5]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[3, 2, -2]} intensity={0.6} color="#fff4e8" />
        <directionalLight position={[0.5, 0.4, 4]} intensity={0.55} />
        <Boneco3D expr={expr} />
      </ThreeCanvas>
    </div>
  </AbsoluteFill>
);

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";

// Rua 3D low-poly em fim de tarde. Unidades em metros. A rua corre ao longo do eixo Z
// (o personagem anda para -Z, "para dentro" da tela). Origem no centro da rua.

export type Cam = { pos: [number, number, number]; alvo: [number, number, number]; fov?: number };

const W = 1080;
const H = 1920;

// Projeta um ponto 3D na tela (px) com a mesma câmera usada no canvas — para posicionar o 2D por cima.
export const projetar = (cam: Cam, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 50, W / H, 0.1, 500);
  c.position.set(...cam.pos);
  c.lookAt(new THREE.Vector3(...cam.alvo));
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  // escala: tamanho em px de 1 metro na profundidade do ponto
  const dist = c.position.distanceTo(new THREE.Vector3(...p));
  const pxPorMetro = H / (2 * Math.tan(((cam.fov ?? 50) * Math.PI) / 360) * dist);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, pxPorMetro };
};

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// texturas procedurais (desenhadas em canvas)
const texCalcada = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#E4DED2";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#55555C";
  for (let y = -40; y < 300; y += 40) {
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin((x / 256) * Math.PI * 2) * 10);
    for (let x = 256; x >= 0; x -= 8) g.lineTo(x, y + 14 + Math.sin((x / 256) * Math.PI * 2) * 10);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 110);
  return t;
};

const texOnibus = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F2F2EE";
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = "#1F8A4C";
  g.fillRect(0, 70, 512, 58);
  g.fillStyle = "#F2C230";
  g.fillRect(0, 62, 512, 10);
  g.fillStyle = "#26303A";
  for (let x = 10; x < 500; x += 62) g.fillRect(x, 10, 54, 46);
  g.fillStyle = "#14181D";
  for (let x = 20; x < 500; x += 62) {
    g.beginPath();
    g.arc(x + 20, 48, 9, Math.PI, 0);
    g.fill();
  }
  return new THREE.CanvasTexture(c);
};

const texFrenteOnibus = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1F8A4C";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#F2F2EE";
  g.fillRect(0, 0, 256, 150);
  g.fillStyle = "#26303A";
  g.fillRect(14, 30, 228, 110);
  g.fillStyle = "#14181D";
  g.fillRect(14, 4, 228, 22);
  g.fillStyle = "#F2C230";
  g.font = "bold 18px sans-serif";
  g.fillText("37  CENTRO", 70, 22);
  g.fillStyle = "#FFF6D6";
  g.fillRect(16, 196, 44, 22);
  g.fillRect(196, 196, 44, 22);
  return new THREE.CanvasTexture(c);
};

const CORES_CASAS = ["#E9D3B4", "#D98E73", "#F0E6CF", "#C9D7DF", "#E8C07A", "#B7C9A8", "#F2D5C4"];

const Casas: React.FC<{ lado: 1 | -1 }> = ({ lado }) => {
  const casas = useMemo(() => {
    const out: { z: number; w: number; h: number; d: number; cor: string; telhado: boolean }[] = [];
    let z = 20;
    let i = lado === 1 ? 0 : 50;
    while (z > -180) {
      const w = 6 + rnd(i) * 6;
      out.push({ z: z - w / 2, w, h: 3 + rnd(i + 1) * (rnd(i + 7) > 0.8 ? 9 : 3), d: 8, cor: CORES_CASAS[Math.floor(rnd(i + 2) * 7)], telhado: rnd(i + 3) > 0.35 });
      z -= w + 0.4;
      i++;
    }
    return out;
  }, [lado]);
  const x0 = lado * 10.5;
  return (
    <group>
      {casas.map((c, k) => (
        <group key={k} position={[x0 + lado * c.d / 2, 0, c.z]}>
          <mesh position={[0, c.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[c.d, c.h, c.w]} />
            <meshStandardMaterial color={c.cor} roughness={0.95} />
          </mesh>
          {c.telhado && (
            <mesh position={[0, c.h + 0.9, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
              <boxGeometry args={[c.d * 0.72, c.d * 0.72, c.w + 0.3]} />
              <meshStandardMaterial color="#A6503B" roughness={0.9} />
            </mesh>
          )}
          {/* janelas e porta voltadas para a rua */}
          {Array.from({ length: Math.max(1, Math.floor(c.w / 3)) }).map((_, j) => (
            <mesh key={j} position={[-lado * (c.d / 2 + 0.02), Math.min(c.h - 1, 1.8), -c.w / 2 + 1.6 + j * 3]}>
              <boxGeometry args={[0.05, 1.1, 1.3]} />
              <meshStandardMaterial color="#3E5566" roughness={0.3} metalness={0.2} />
            </mesh>
          ))}
          {/* muro com grade */}
          <mesh position={[-lado * (c.d / 2 + 0.3), 0.5, 0]} castShadow>
            <boxGeometry args={[0.25, 1, c.w]} />
            <meshStandardMaterial color="#D9D2C4" />
          </mesh>
          {Array.from({ length: Math.floor(c.w / 0.5) }).map((_, j) => (
            <mesh key={`g${j}`} position={[-lado * (c.d / 2 + 0.3), 1.45, -c.w / 2 + j * 0.5]}>
              <boxGeometry args={[0.05, 0.9, 0.05]} />
              <meshStandardMaterial color="#2A2C33" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const Arvores: React.FC = () => (
  <group>
    {Array.from({ length: 12 }).map((_, i) => {
      const lado = i % 2 ? 1 : -1;
      const z = 10 - i * 16 - rnd(i) * 6;
      const s = 0.9 + rnd(i + 4) * 0.5;
      return (
        <group key={i} position={[lado * 8.6, 0, z]} scale={s}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.25, 3.2, 6]} />
            <meshStandardMaterial color="#6B4A32" />
          </mesh>
          {[
            [0, 4.0, 0, 1.8],
            [0.9, 3.5, 0.4, 1.3],
            [-0.8, 3.6, -0.3, 1.4],
          ].map(([x, y, z2, r], k) => (
            <mesh key={k} position={[x, y, z2]} castShadow>
              <icosahedronGeometry args={[r, 0]} />
              <meshStandardMaterial color={k ? "#5E9A4A" : "#4F8A3E"} flatShading roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

const Postes: React.FC = () => (
  <group>
    {Array.from({ length: 10 }).map((_, i) => (
      <group key={i} position={[-8.2, 0, 5 - i * 20]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 8, 6]} />
          <meshStandardMaterial color="#9C9890" />
        </mesh>
        <mesh position={[0.6, 7.6, 0]}>
          <boxGeometry args={[1.4, 0.12, 0.12]} />
          <meshStandardMaterial color="#9C9890" />
        </mesh>
      </group>
    ))}
  </group>
);

export const Onibus: React.FC<{ z: number; x?: number }> = ({ z, x = 2.2 }) => {
  const lado = useMemo(() => texOnibus(), []);
  const frente = useMemo(() => texFrenteOnibus(), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[2.5, 2.9, 11]} />
        <meshStandardMaterial attach="material-0" map={lado} />
        <meshStandardMaterial attach="material-1" map={lado} />
        <meshStandardMaterial attach="material-2" color="#E9E9E4" />
        <meshStandardMaterial attach="material-3" color="#222" />
        <meshStandardMaterial attach="material-4" map={frente} />
        <meshStandardMaterial attach="material-5" color="#1F8A4C" />
      </mesh>
      {[-1, 1].map((l) =>
        [-3.6, 3.6].map((zz) => (
          <mesh key={`${l}${zz}`} position={[l * 1.25, 0.55, zz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 16]} />
            <meshStandardMaterial color="#1B1B1E" />
          </mesh>
        )),
      )}
    </group>
  );
};

const Chao: React.FC = () => {
  const calcada = useMemo(() => texCalcada(), []);
  return (
    <group>
      {/* asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]} receiveShadow>
        <planeGeometry args={[14, 220]} />
        <meshStandardMaterial color="#6A6C73" roughness={0.85} />
      </mesh>
      {/* faixas amarelas tracejadas e bordas brancas */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 15 - i * 5.5]}>
          <planeGeometry args={[0.18, 3]} />
          <meshStandardMaterial color="#E8B92E" />
        </mesh>
      ))}
      {[-6.6, 6.6].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -80]}>
          <planeGeometry args={[0.15, 220]} />
          <meshStandardMaterial color="#E9E6DD" />
        </mesh>
      ))}
      {/* calçadas */}
      {[-1, 1].map((l) => (
        <group key={l}>
          <mesh position={[l * 8.5, 0.08, -80]} receiveShadow>
            <boxGeometry args={[3.8, 0.16, 220]} />
            <meshStandardMaterial map={calcada} roughness={0.9} />
          </mesh>
          <mesh position={[l * 6.65, 0.08, -80]}>
            <boxGeometry args={[0.2, 0.18, 220]} />
            <meshStandardMaterial color="#CFC9BD" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const Rua3D: React.FC<{ cam: Cam; onibusZ?: number; children?: React.ReactNode; sol?: number }> = ({
  cam,
  onibusZ,
  children,
  sol = 1,
}) => (
  <ThreeCanvas
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0, background: "linear-gradient(#8FB4D6 0%, #E9D2AE 55%, #F3C98E 100%)" }}
    shadows
    camera={{ fov: cam.fov ?? 50, position: cam.pos, near: 0.1, far: 500 }}
    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
  >
    <CameraAlvo cam={cam} />
    <fog attach="fog" args={["#E6D3B8", 40, 170]} />
    <hemisphereLight args={["#CFE2F5", "#9A7E62", 2.2 * sol]} />
    <ambientLight intensity={0.5 * sol} color="#FFE9CC" />
    <directionalLight
      position={[-25, 30, 18]}
      intensity={3.6 * sol}
      color="#FFD9A3"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-far={120}
    />
    <Chao />
    <Casas lado={1} />
    <Casas lado={-1} />
    <Arvores />
    <Postes />
    {onibusZ !== undefined && <Onibus z={onibusZ} />}
    {children}
  </ThreeCanvas>
);

// aplica posição/alvo/fov da câmera a cada quadro
import { useThree } from "@react-three/fiber";
const CameraAlvo: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 50;
  camera.lookAt(new THREE.Vector3(...cam.alvo));
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

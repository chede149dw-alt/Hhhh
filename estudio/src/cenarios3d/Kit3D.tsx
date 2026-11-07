import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill } from "remotion";
import { projetar, Cam } from "./Rua3D";
import { Vivo, lerp } from "../episodios/comum";
import { Aparencia, AparenciaCtx, Expressao, Pose, Vista } from "../personagens/Chede";
import { andar, conversar, figurante } from "../personagens/Figurantes";
import { LuzCena } from "../estilo2/TesteEstilo2";

// Kit do visual 2.0 (referências 4 e 5): cenário 3D de verdade + personagens 2D recortados dentro dele.
// Unidades em metros. Personagem 2D tem 1,75 m e é reposicionado a cada quadro pela projeção da câmera.

export type Clima = "manha" | "dia" | "porDoSol" | "interior" | "noite";
type Def = {
  ceu: string;
  fog: [string, number, number];
  hemi: [string, string, number];
  amb: [string, number];
  sol: { pos: [number, number, number]; cor: string; i: number };
  luz2D: { amb: string; ambForca: number; cor: string; forca: number; x: number; y: number };
};
export const CLIMAS: Record<Clima, Def> = {
  manha: {
    ceu: "linear-gradient(#86AEDB 0%, #CFE0EE 45%, #F6DDB4 100%)",
    fog: ["#E9DCC8", 35, 160],
    hemi: ["#D3E5F7", "#9A8467", 2.0],
    amb: ["#FFF0DC", 0.5],
    sol: { pos: [-25, 30, 18], cor: "#FFE0B0", i: 3.4 },
    luz2D: { amb: "#FFEBD6", ambForca: 0.3, cor: "#FFC67A", forca: 0.5, x: -500, y: -300 },
  },
  dia: {
    ceu: "linear-gradient(#6FA3DD 0%, #BFD9F0 55%, #EAF0F2 100%)",
    fog: ["#DCE6EE", 40, 180],
    hemi: ["#DDEBFA", "#8E8670", 2.2],
    amb: ["#FFFFFF", 0.55],
    sol: { pos: [20, 40, 15], cor: "#FFF3DE", i: 3.6 },
    luz2D: { amb: "#F4F1EC", ambForca: 0.2, cor: "#FFE2B0", forca: 0.4, x: 1500, y: -400 },
  },
  porDoSol: {
    ceu: "linear-gradient(#34407A 0%, #9C6A8A 35%, #F08A4B 70%, #FFC77E 100%)",
    fog: ["#E89A66", 25, 130],
    hemi: ["#A7A4D6", "#5E3C2E", 1.3],
    amb: ["#FFB98A", 0.45],
    sol: { pos: [-40, 9, -30], cor: "#FF9E58", i: 3.4 },
    luz2D: { amb: "#FFC6A0", ambForca: 0.5, cor: "#FF8A3D", forca: 0.75, x: -600, y: 500 },
  },
  interior: {
    ceu: "linear-gradient(#5A5048 0%, #2E2925 100%)",
    fog: ["#6A5A4C", 30, 140],
    hemi: ["#FFE8C8", "#5A4636", 1.2],
    amb: ["#FFE2BC", 0.6],
    sol: { pos: [-12, 10, 6], cor: "#FFE6C0", i: 2.4 },
    luz2D: { amb: "#FFE0C0", ambForca: 0.35, cor: "#FFC27A", forca: 0.55, x: -400, y: 200 },
  },
  noite: {
    ceu: "linear-gradient(#0B1530 0%, #1B2E5C 55%, #2C4579 100%)",
    fog: ["#24396A", 18, 110],
    hemi: ["#6F8FD8", "#1A2238", 1.1],
    amb: ["#8FA8FF", 0.35],
    sol: { pos: [20, 30, -10], cor: "#A9C2FF", i: 1.3 },
    luz2D: { amb: "#6F86CF", ambForca: 0.75, cor: "#FFB25C", forca: 0.6, x: 200, y: 400 },
  },
};

const CameraAlvo: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 50;
  camera.lookAt(new THREE.Vector3(...cam.alvo));
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const Palco3D: React.FC<{ cam: Cam; clima: Clima; children: React.ReactNode; semNeblina?: boolean }> = ({
  cam,
  clima,
  children,
  semNeblina,
}) => {
  const C = CLIMAS[clima];
  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, background: C.ceu }}
      shadows
      camera={{ fov: cam.fov ?? 50, position: cam.pos, near: 0.05, far: 600 }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
    >
      <CameraAlvo cam={cam} />
      {!semNeblina && <fog attach="fog" args={C.fog} />}
      <hemisphereLight args={C.hemi} />
      <ambientLight intensity={C.amb[1]} color={C.amb[0]} />
      <directionalLight
        position={C.sol.pos}
        intensity={C.sol.i}
        color={C.sol.cor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={160}
      />
      {children}
    </ThreeCanvas>
  );
};

// ---------- câmera com movimento suave ----------
export type Chave = { pos: [number, number, number]; alvo: [number, number, number]; fov?: number };
const v3 = (a: number[], b: number[], p: number) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)] as [number, number, number];
export const camEntre = (a: Chave, b: Chave, p: number): Cam => ({
  pos: v3(a.pos, b.pos, p),
  alvo: v3(a.alvo, b.alvo, p),
  fov: lerp(a.fov ?? 45, b.fov ?? 45, p),
});
// órbita em volta de um ponto: ângulo em graus (0 = câmera em -x olhando para +x), dist, altura
export const orbita = (c: [number, number, number], ang: number, dist: number, alt: number, fov = 40, alvoY?: number): Cam => {
  const a = (ang * Math.PI) / 180;
  return { pos: [c[0] - Math.cos(a) * dist, alt, c[2] + Math.sin(a) * dist], alvo: [c[0], alvoY ?? c[1], c[2]], fov };
};

// Projeção para personagens 2D (cartaz em pé): o tamanho vem da PROFUNDIDADE ao longo do olhar da câmera,
// não da distância até o pé — assim, em close, a cabeça não encolhe nem desce.
export const projetarP = (cam: Cam, p: [number, number, number]) => {
  const base = projetar(cam, p);
  const d = [cam.alvo[0] - cam.pos[0], cam.alvo[1] - cam.pos[1], cam.alvo[2] - cam.pos[2]];
  const n = Math.hypot(d[0], d[1], d[2]);
  const prof = ((p[0] - cam.pos[0]) * d[0] + (p[1] - cam.pos[1]) * d[1] + (p[2] - cam.pos[2]) * d[2]) / n;
  const px = 1920 / (2 * Math.tan(((cam.fov ?? 50) * Math.PI) / 360) * Math.max(0.05, prof));
  return { ...base, pxPorMetro: prof > 0.05 ? px : -1 };
};

// ---------- personagens 2D dentro do 3D ----------
export type Ator = {
  quem: "chede" | "kaik" | "agente";
  x: number;
  z: number;
  y?: number; // altura do pé (ex.: sentado num banco, pulando)
  vista?: Vista;
  expr?: Expressao;
  pose?: Pose;
  espelhar?: boolean;
  escala?: number; // 1 = 1,75 m
  sombra?: boolean;
  parado?: boolean;
  extra?: (s: number) => React.ReactNode; // desenho extra no espaço do personagem (já escalado)
  envolver?: (n: React.ReactNode, s: number) => React.ReactNode; // ex.: Rastro, alguém nas costas
  corte?: number; // altura (m) abaixo da qual o personagem some — fica "atrás" de mesa/carteira
  aparencia?: Aparencia; // figurante (usa o rig do Chede com outra aparência)
  dir?: [number, number]; // andando nessa direção (x, z): vira sozinho para o lado certo da tela
  tremor?: number; // px de tremida
};
const ALTURA_RIG = 1500;

const sombraDir = (clima: Clima) => {
  const [x, y, z] = CLIMAS[clima].sol.pos;
  const h = Math.hypot(x, z);
  return { dx: -x / h, dz: -z / h, k: Math.min(2.6, h / y) };
};

export const SombraChao: React.FC<{ cam: Cam; clima: Clima; x: number; z: number; alt?: number; forca?: number }> = ({
  cam,
  clima,
  x,
  z,
  alt = 1.6,
  forca = 0.4,
}) => {
  const d = sombraDir(clima);
  const a = projetar(cam, [x, 0.01, z]);
  const b = projetar(cam, [x + d.dx * alt * d.k, 0.01, z + d.dz * alt * d.k]);
  const c2 = projetar(cam, [x + d.dx * alt * d.k * 0.5, 0.01, z + d.dz * alt * d.k * 0.5]);
  if (a.pxPorMetro < 0) return null;
  return (
    <g filter="url(#sombraSuave)" opacity={forca}>
      <path d={`M ${a.x} ${a.y} L ${c2.x} ${c2.y} L ${b.x} ${b.y}`} stroke="#24160E" strokeWidth={0.38 * a.pxPorMetro} strokeLinecap="round" fill="none" />
      <ellipse cx={a.x} cy={a.y} rx={0.34 * a.pxPorMetro} ry={0.12 * a.pxPorMetro} fill="#24160E" />
    </g>
  );
};

export const Atores: React.FC<{ cam: Cam; clima: Clima; atores: Ator[]; id: string; luz?: boolean }> = ({ cam, clima, atores, id, luz = true }) => {
  const L = CLIMAS[clima].luz2D;
  const lista = atores
    .map((a) => ({ a, pe: projetarP(cam, [a.x, a.y ?? 0, a.z]) }))
    .filter((o) => o.pe.pxPorMetro > 0 && !(o.a.aparencia && o.pe.pxPorMetro > 1920 / (2 * Math.tan(((cam.fov ?? 50) * Math.PI) / 360) * 2.5)))
    .sort((m, n) => m.pe.pxPorMetro - n.pe.pxPorMetro);
  return (
    <g>
      {lista.map(({ a }) =>
        a.sombra === false || a.corte !== undefined || (a.y ?? 0) > 0.05 ? null : <SombraChao key={`s${a.quem}${a.x}${a.z}`} cam={cam} clima={clima} x={a.x} z={a.z} />,
      )}
      <defs>
        {lista.map(({ a }, k) =>
          a.corte === undefined ? null : (
            <clipPath key={k} id={`${id}c${k}`}>
              <rect x={-4000} y={-6000} width={9000} height={6000 + projetarP(cam, [a.x, a.corte, a.z]).y} />
            </clipPath>
          ),
        )}
      </defs>
      <LuzCena id={id} ativo={luz} amb={L.amb} ambForca={L.ambForca} luz={{ x: L.x, y: L.y, raio: 2600, cor: L.cor, forca: L.forca }}>
        {lista.map(({ a, pe }, k) => {
          const s = (pe.pxPorMetro * 1.75 * (a.escala ?? 1)) / ALTURA_RIG;
          let esp = a.espelhar;
          if (a.dir) {
            const q = projetarP(cam, [a.x + a.dir[0] * 0.5, a.y ?? 0, a.z + a.dir[1] * 0.5]);
            esp = q.x < pe.x;
          }
          const v = <Vivo quem={a.quem} x={0} y={0} s={s} vista={a.vista} expr={a.expr} pose={a.pose} espelhar={esp} semSombra parado={a.parado} />;
          const corpo = (
            <g>
              {a.aparencia ? <AparenciaCtx.Provider value={a.aparencia}>{v}</AparenciaCtx.Provider> : v}
              {a.extra?.(s)}
            </g>
          );
          const tr = a.tremor ? `translate(${a.tremor},0)` : "";
          const g = (
            <g key={`${a.quem}${a.x}${a.z}`} transform={`translate(${pe.x},${pe.y}) ${tr}`}>
              {a.envolver ? a.envolver(corpo, s) : corpo}
            </g>
          );
          if (a.corte === undefined) return g;
          return (
            <g key={`${a.quem}${a.x}${a.z}`} clipPath={`url(#${id}c${k})`}>
              {g}
            </g>
          );
        })}
      </LuzCena>
    </g>
  );
};

// Camada SVG por cima do 3D (mesmo tamanho da tela)
export const Sobre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} overflow="visible">
      <defs>
        <filter id="sombraSuave" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

// Plano completo: cenário 3D (com desfoque de fundo) + atores 2D + camada extra.
export const Plano3D: React.FC<{
  cam: Cam;
  clima: Clima;
  cenario: React.ReactNode;
  atores?: Ator[];
  desfoque?: number; // px de desfoque do cenário (profundidade de campo)
  id?: string;
  frente?: React.ReactNode; // SVG desenhado por cima dos atores
  fundo2D?: React.ReactNode; // SVG entre o 3D e os atores
  html?: React.ReactNode; // infográficos em HTML
  semNeblina?: boolean;
}> = ({ cam, clima, cenario, atores = [], desfoque = 0, id = "pl", frente, fundo2D, html, semNeblina }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ filter: desfoque > 0.2 ? `blur(${desfoque}px)` : undefined }}>
      <Palco3D cam={cam} clima={clima} semNeblina={semNeblina}>
        {cenario}
      </Palco3D>
    </AbsoluteFill>
    <Sobre>
      {fundo2D}
      <Atores cam={cam} clima={clima} atores={atores} id={id} />
      {frente}
    </Sobre>
    {html}
  </AbsoluteFill>
);

// Mesmo que Plano3D, mas com a rua 3D das partes anteriores (luz própria, manhã ou noite).
import { Rua3D } from "./Rua3D";
import { Nuvens } from "./Detalhes4";
export const PlanoRua: React.FC<{
  cam: Cam;
  atores?: Ator[];
  desfoque?: number;
  id?: string;
  frente?: React.ReactNode;
  html?: React.ReactNode;
  extra3D?: React.ReactNode;
}> = ({ cam, atores = [], desfoque = 0, id = "pr", frente, html, extra3D }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ filter: desfoque > 0.2 ? `blur(${desfoque}px)` : undefined }}>
      <Rua3D cam={cam} sol={1.05}>
        {extra3D}
        <Nuvens n={9} y={55} z={-190} />
      </Rua3D>
    </AbsoluteFill>
    <Sobre>
      <Atores cam={cam} clima="manha" atores={atores} id={id} />
      {frente}
    </Sobre>
    {html}
  </AbsoluteFill>
);

// Multidão de figurantes 2D: parados, conversando ou andando (determinístico pela semente).
export const multidao = (o: {
  semente: number;
  n: number;
  area: [number, number, number, number]; // x0, x1, z0, z1
  f: number;
  livre?: (x: number, z: number) => boolean; // true = não colocar ali
  andando?: number; // fração que anda (0..1)
  dir?: [number, number]; // direção principal de quem anda
  vel?: number; // m por quadro
  sentado?: { y: number; corte: number }; // sentados atrás de mesas
}): Ator[] => {
  const out: Ator[] = [];
  let k = 0;
  while (out.length < o.n && k < o.n * 6) {
    const i = o.semente * 1000 + k++;
    let x = o.area[0] + rnd(i) * (o.area[1] - o.area[0]);
    let z = o.area[2] + rnd(i + 0.5) * (o.area[3] - o.area[2]);
    if (o.livre && o.livre(x, z)) continue;
    const anda = !o.sentado && rnd(i + 0.7) < (o.andando ?? 0.3);
    const ap = figurante(i);
    if (anda) {
      const sentido = rnd(i + 0.9) < 0.5 ? 1 : -1;
      const d: [number, number] = o.dir ? [o.dir[0] * sentido, o.dir[1] * sentido] : [sentido, 0];
      const v = (o.vel ?? 0.025) * (0.8 + rnd(i + 1.1) * 0.4);
      const w = o.area[1] - o.area[0];
      const h = o.area[3] - o.area[2];
      x = o.area[0] + ((((x - o.area[0] + d[0] * v * o.f) % w) + w) % w);
      z = o.area[2] + ((((z - o.area[2] + d[1] * v * o.f) % h) + h) % h);
      out.push({ quem: "chede", aparencia: ap, x, z, vista: "perfil", dir: d, pose: andar(o.f + rnd(i) * 50), expr: "neutro" });
    } else {
      const fala = rnd(i + 1.3) < 0.6;
      out.push({
        quem: "chede", aparencia: ap, x, z, y: o.sentado?.y, corte: o.sentado?.corte,
        vista: rnd(i + 1.5) < 0.5 ? "tresQuartos" : rnd(i + 1.6) < 0.5 ? "frente" : "costas",
        espelhar: rnd(i + 1.7) < 0.5,
        expr: rnd(i + 1.8) < 0.5 ? "feliz" : rnd(i + 1.9) < 0.3 ? "rindo" : "neutro",
        pose: fala ? conversar(o.f, i) : { olharX: rnd(i + 2) * 2 - 1 },
      });
    }
  }
  return out;
};

export const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

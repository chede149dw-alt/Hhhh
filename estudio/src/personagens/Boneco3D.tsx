import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Chede em 3D de verdade (modelo "boneco" da imagem do usuário, 09/11).
// Feito com formas simples (esferas, cápsulas e caixas arredondadas) e material fosco tipo massinha.
// Unidades em metros: altura total ≈ 1,76 m. Origem = chão, entre os pés. Olha para +z.

export type Cores3D = {
  pele: string;
  camisa: string;
  camisaDetalhe: string;
  bermuda: string;
  cabelo: string;
  tenis: string;
  sola: string;
  olho: string;
};
export const CORES3D_CHEDE: Cores3D = {
  pele: "#B0622E",
  camisa: "#FF811F",
  camisaDetalhe: "#E16803",
  bermuda: "#211F1D",
  cabelo: "#2D241D",
  tenis: "#E4E0DC",
  sola: "#26231F",
  olho: "#2A2624",
};

export type Expressao3D = "neutro" | "triste" | "feliz" | "espanto" | "medo" | "raiva" | "determinado";
export type Pose3D = {
  bracoE?: number; // graus: abre o braço para o lado (esquerdo do personagem = direita da tela vista de frente)
  bracoD?: number;
  bracoEFrente?: number; // graus: levanta o braço para a frente
  bracoDFrente?: number;
  antebracoE?: number; // graus: dobra o cotovelo
  antebracoD?: number;
  pernaE?: number; // graus: perna para a frente (+) / trás (−)
  pernaD?: number;
  joelhoE?: number; // graus: dobra o joelho
  joelhoD?: number;
  cabeca?: number; // graus: inclina para o lado
  cabecaGiro?: number; // graus: vira a cabeça
  tronco?: number; // graus: inclina o tronco para a frente
  olharX?: number; // −1..1
  olharY?: number; // −1..1
  piscar?: number; // 0..1
};

const rad = (g?: number) => ((g ?? 0) * Math.PI) / 180;
const mat = (cor: string, rough = 0.72) => <meshStandardMaterial color={cor} roughness={rough} metalness={0} />;

const Caixa: React.FC<{ s: [number, number, number]; r?: number; p?: [number, number, number]; cor: string; rot?: [number, number, number] }> = ({ s, r = 0.02, p = [0, 0, 0], cor, rot }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 4, Math.min(r, Math.min(...s) / 2 - 0.0005)), [s, r]);
  return (
    <mesh geometry={g} position={p} rotation={rot} castShadow receiveShadow>
      {mat(cor)}
    </mesh>
  );
};
const Capsula: React.FC<{ r: number; l: number; p?: [number, number, number]; cor: string }> = ({ r, l, p = [0, 0, 0], cor }) => (
  <mesh position={p} castShadow receiveShadow>
    <capsuleGeometry args={[r, l, 8, 16]} />
    {mat(cor)}
  </mesh>
);

// ---------- braço: ombro → cotovelo → mão (pendurado para baixo) ----------
const Braco: React.FC<{ lado: 1 | -1; abre: number; frente: number; cotovelo: number; C: Cores3D }> = ({ lado, abre, frente, cotovelo, C }) => (
  <group position={[0.128 * lado, 1.235, 0]} rotation={[-rad(frente), 0, rad(abre) * lado + 0.05 * lado]}>
    {/* manga */}
    <mesh position={[0.008 * lado, -0.05, 0]} rotation={[0, 0, 0.12 * lado]} castShadow>
      <cylinderGeometry args={[0.046, 0.054, 0.11, 20]} />
      {mat(C.camisa)}
    </mesh>
    <mesh position={[0.015 * lado, -0.103, 0]} rotation={[0, 0, 0.12 * lado]}>
      <cylinderGeometry args={[0.055, 0.055, 0.012, 20]} />
      {mat(C.camisaDetalhe)}
    </mesh>
    {/* braço */}
    <Capsula r={0.026} l={0.25} p={[0, -0.15, 0]} cor={C.pele} />
    <group position={[0, -0.285, 0]} rotation={[-rad(cotovelo), 0, 0]}>
      <Capsula r={0.025} l={0.23} p={[0, -0.13, 0]} cor={C.pele} />
      {/* mão fechada, arredondada */}
      <mesh position={[0, -0.29, 0.004]} scale={[0.9, 1.12, 0.85]} castShadow>
        <sphereGeometry args={[0.043, 20, 16]} />
        {mat(C.pele)}
      </mesh>
      <mesh position={[0.026 * -lado, -0.275, 0.022]} scale={[0.55, 0.9, 0.6]}>
        <sphereGeometry args={[0.025, 14, 10]} />
        {mat(C.pele)}
      </mesh>
    </group>
  </group>
);

// ---------- perna: quadril → joelho → tênis ----------
const Perna: React.FC<{ lado: 1 | -1; quadril: number; joelho: number; C: Cores3D }> = ({ lado, quadril, joelho, C }) => (
  <group position={[0.08 * lado, 0.80, 0]} rotation={[-rad(quadril), 0, 0]}>
    {/* perna da bermuda */}
    <Caixa s={[0.13, 0.27, 0.15]} r={0.03} p={[0.002 * lado, -0.12, 0]} cor={C.bermuda} />
    <Capsula r={0.034} l={0.3} p={[0, -0.32, 0]} cor={C.pele} />
    <group position={[0, -0.42, 0]} rotation={[rad(joelho), 0, 0]}>
      <Capsula r={0.033} l={0.26} p={[0, -0.15, 0]} cor={C.pele} />
      {/* tênis grande */}
      <group position={[0.006 * lado, -0.33, 0.035]}>
        <Caixa s={[0.14, 0.075, 0.23]} r={0.032} p={[0, 0.036, 0]} cor={C.tenis} />
        <Caixa s={[0.138, 0.014, 0.226]} r={0.0068} p={[0, 0.002, 0]} cor={C.sola} />
        <Caixa s={[0.136, 0.018, 0.224]} r={0.0088} p={[0, -0.013, 0]} cor={C.tenis} />
        {[0.025, 0.05].map((z) => (
          <Caixa key={z} s={[0.07, 0.006, 0.012]} r={0.003} p={[0, 0.064, z + 0.04]} cor="#BDB7B1" />
        ))}
      </group>
    </group>
  </group>
);

// ---------- cabeça ----------
const RC = 0.222; // raio da cabeça
const Cabelo: React.FC<{ cor: string }> = ({ cor }) => {
  const bolinhas = useMemo(() => {
    const out: { p: [number, number, number]; r: number }[] = [];
    const n = 520;
    for (let i = 0; i < n; i++) {
      // pontos espalhados na esfera (espiral de Fibonacci)
      const y = 1 - (i / (n - 1)) * 2;
      const raio = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const x = Math.cos(th) * raio, z = Math.sin(th) * raio;
      // linha do cabelo: na frente começa acima da testa; nos lados acima da orelha; atrás desce até a nuca
      const limite = z > 0 ? 0.42 - (1 - z) * 0.25 : 0.12 + z * 0.3;
      if (y < limite) continue;
      const r = 0.026 + ((i * 37) % 7) * 0.0022;
      const d = RC + 0.004;
      out.push({ p: [x * d, y * d, z * d], r });
    }
    return out;
  }, []);
  return (
    <group>
      {/* massa de base (evita buracos) */}
      <mesh position={[0, 0.03, -0.01]} scale={[1.02, 0.94, 1.02]}>
        <sphereGeometry args={[RC, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        {mat(cor, 0.85)}
      </mesh>
      {bolinhas.map((b, i) => (
        <mesh key={i} position={b.p} castShadow>
          <sphereGeometry args={[b.r, 12, 10]} />
          {mat(cor, 0.85)}
        </mesh>
      ))}
    </group>
  );
};

// ponto na superfície do rosto (x, y relativos ao centro), um pouco para fora
const naFace = (x: number, y: number, fora = 0.002): [number, number, number] => [x, y, Math.sqrt(Math.max(0, RC * RC - x * x - y * y)) + fora];

const Rosto: React.FC<{ expr: Expressao3D; pose: Pose3D; C: Cores3D }> = ({ expr, pose, C }) => {
  const grande = expr === "espanto" || expr === "medo";
  const ox = (pose.olharX ?? 0) * 0.008;
  const oy = (pose.olharY ?? 0) * -0.008;
  const fecha = 1 - (pose.piscar ?? 0) * 0.92;
  // sobrancelhas: ângulo por expressão (positivo = ponta de dentro para cima = triste)
  const ang = { neutro: 0, triste: 0.22, feliz: -0.05, espanto: 0.1, medo: 0.28, raiva: -0.35, determinado: -0.2 }[expr];
  const subir = { neutro: 0, triste: 0.004, feliz: 0.006, espanto: 0.022, medo: 0.016, raiva: -0.006, determinado: -0.004 }[expr];
  return (
    <group>
      {[-1, 1].map((l) => {
        const pe = naFace(0.056 * l, -0.03, 0.0);
        return (
          <group key={l}>
            {grande ? (
              <group position={pe} rotation={[0.1, 0.25 * l, 0]}>
                <mesh scale={[1, 1 * fecha, 0.45]}>
                  <sphereGeometry args={[0.03, 20, 16]} />
                  {mat("#F7F3EE", 0.4)}
                </mesh>
                <mesh position={[ox, oy, 0.012]} scale={[1, fecha, 0.5]}>
                  <sphereGeometry args={[0.014, 16, 12]} />
                  {mat(C.olho, 0.3)}
                </mesh>
              </group>
            ) : (
              <mesh position={[pe[0] + ox, pe[1] + oy, pe[2]]} rotation={[0.12, 0.25 * l, 0]} scale={[0.017, 0.025 * fecha, 0.008]}>
                <sphereGeometry args={[1, 18, 14]} />
                {mat(C.olho, 0.35)}
              </mesh>
            )}
            {/* sobrancelha em barra */}
            <group position={naFace(0.058 * l, 0.018 + subir, 0.006)} rotation={[-0.08, 0.26 * l, -ang * l]}>
              <Caixa s={[0.082, 0.026, 0.016]} r={0.007} cor={C.olho} />
            </group>
            {/* orelha */}
            <mesh position={[0.214 * l, -0.03, -0.01]} scale={[0.6, 1, 0.9]}>
              <sphereGeometry args={[0.047, 16, 12]} />
              {mat(C.pele)}
            </mesh>
          </group>
        );
      })}
      {/* boca */}
      {expr === "espanto" || expr === "medo" ? (
        <mesh position={naFace(0, -0.115, 0)} scale={[0.018, expr === "espanto" ? 0.026 : 0.014, 0.006]}>
          <sphereGeometry args={[1, 16, 12]} />
          {mat("#3A1C14", 0.5)}
        </mesh>
      ) : (
        <Boca tipo={expr === "feliz" ? "sorriso" : expr === "neutro" || expr === "determinado" ? "reta" : "triste"} cor={C.olho} />
      )}
    </group>
  );
};

// boca como um tubo que segue a curva do rosto (nunca afunda na cabeça)
const Boca: React.FC<{ tipo: "triste" | "sorriso" | "reta"; cor: string }> = ({ tipo, cor }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const w = tipo === "reta" ? 0.03 : 0.032;
    const curva = tipo === "triste" ? 0.016 : tipo === "sorriso" ? -0.018 : 0;
    const y0 = tipo === "sorriso" ? -0.112 : -0.128;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16 * 2 - 1;
      const x = t * w;
      const y = y0 + curva * (1 - t * t);
      pts.push(new THREE.Vector3(...naFace(x, y, 0.004)));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0055, 8, false);
  }, [tipo]);
  return <mesh geometry={geo}>{mat(cor, 0.5)}</mesh>;
};

// ---------- corpo inteiro ----------
export const Boneco3D: React.FC<{ expr?: Expressao3D; pose?: Pose3D; cores?: Cores3D; p?: [number, number, number]; giro?: number }> = ({
  expr = "neutro", pose = {}, cores = CORES3D_CHEDE, p = [0, 0, 0], giro = 0,
}) => {
  const C = cores;
  return (
    <group position={p} rotation={[0, rad(giro), 0]}>
      <Perna lado={-1} quadril={pose.pernaD ?? 0} joelho={pose.joelhoD ?? 0} C={C} />
      <Perna lado={1} quadril={pose.pernaE ?? 0} joelho={pose.joelhoE ?? 0} C={C} />
      <group position={[0, 0.8, 0]} rotation={[rad(pose.tronco), 0, 0]}>
        <group position={[0, -0.8, 0]}>
          {/* bermuda (parte de cima) */}
          <Caixa s={[0.29, 0.18, 0.155]} r={0.03} p={[0, 0.755, 0]} cor={C.bermuda} />
          {/* camiseta: tronco comprido e fino */}
          <Caixa s={[0.25, 0.46, 0.15]} r={0.055} p={[0, 1.045, 0]} cor={C.camisa} />
          <Caixa s={[0.254, 0.03, 0.154]} r={0.012} p={[0, 0.83, 0]} cor={C.camisaDetalhe} />
          {/* ombros arredondados */}
          <mesh position={[0, 1.24, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.85]} castShadow>
            <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
            {mat(C.camisa)}
          </mesh>
          {/* bolso no peito */}
          <Caixa s={[0.052, 0.056, 0.008]} r={0.004} p={[-0.062, 1.17, 0.076]} cor={C.camisaDetalhe} />

          {/* pescoço curto */}
          <Capsula r={0.032} l={0.06} p={[0, 1.31, 0]} cor={C.pele} />
          <Braco lado={-1} abre={pose.bracoD ?? 0} frente={pose.bracoDFrente ?? 0} cotovelo={pose.antebracoD ?? 0} C={C} />
          <Braco lado={1} abre={pose.bracoE ?? 0} frente={pose.bracoEFrente ?? 0} cotovelo={pose.antebracoE ?? 0} C={C} />
          {/* cabeça grande e redonda */}
          <group position={[0, 1.34, 0]} rotation={[0, rad(pose.cabecaGiro), rad(pose.cabeca)]}>
            <group position={[0, RC - 0.025, 0]}>
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[RC, 48, 36]} />
                {mat(C.pele, 0.68)}
              </mesh>
              <Rosto expr={expr} pose={pose} C={C} />
              <Cabelo cor={C.cabelo} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

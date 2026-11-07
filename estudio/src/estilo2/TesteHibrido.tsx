import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Rua3D, projetar, Cam } from "../cenarios3d/Rua3D";
import { Vivo, lerp, useP } from "../episodios/comum";
import { corridaForte } from "../personagens/poses";
import { Rastro } from "../efeitos/Velocidade";
import { Gradacao, Grao, Poeira } from "../estilo/Acabamento";
import { LuzCena } from "./TesteEstilo2";

// Teste do jeito das referências 4 e 5: cenário 3D de verdade + personagens 2D recortados dentro dele.
// A câmera 3D nunca para (voa, sobe, gira em volta) e o personagem é reposicionado a cada quadro pela projeção.
const ALTURA_RIG = 1500; // unidades do rig ≈ 1,75 m
const SOL = [0.81, -0.58] as const; // direção da sombra no chão (x, z), oposta ao sol da Rua3D

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

// Sombra comprida no chão (projetada no 3D), embaixo do personagem 2D.
const SombraChao: React.FC<{ cam: Cam; x: number; z: number; comp?: number }> = ({ cam, x, z, comp = 1.6 }) => {
  const a = projetar(cam, [x, 0.01, z]);
  const b = projetar(cam, [x + SOL[0] * comp, 0.01, z + SOL[1] * comp]);
  return (
    <g filter="url(#sombraSuave)" opacity={0.38}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2A1A10" strokeWidth={0.42 * a.pxPorMetro} strokeLinecap="round" />
      <ellipse cx={a.x} cy={a.y} rx={0.35 * a.pxPorMetro} ry={0.1 * a.pxPorMetro} fill="#2A1A10" />
    </g>
  );
};

const LUZ_MANHA = { x: -400, y: -200, raio: 2600, cor: "#FFC67A", forca: 0.55 };

// ---------- 1) Vista do alto acompanhando o Kaik correndo pela rua ----------
const CorridaAlto: React.FC = () => {
  const { f, p } = useP();
  const v = 0.55; // m por quadro (~60 km/h, só pro teste)
  const zK = 6 - f * v;
  const xK = 2.6;
  const cam: Cam = {
    pos: [lerp(-6, -10, p), lerp(6, 9.5, p), zK + lerp(6, 2.5, p)],
    alvo: [xK, 0.6, zK - 1],
    fov: 42,
  };
  const pe = projetar(cam, [xK, 0, zK]);
  const frente = projetar(cam, [xK, 0, zK - 1]);
  const paraEsquerda = frente.x < pe.x;
  const s = (pe.pxPorMetro * 1.75) / ALTURA_RIG;
  return (
    <AbsoluteFill>
      <Rua3D cam={cam} sol={1.05} />
      <Svg>
        <SombraChao cam={cam} x={xK} z={zK} comp={1.8} />
        <g transform={`translate(${pe.x},${pe.y})`}>
          <Rastro dx={paraEsquerda ? 26 : -26} dy={-10} n={5}>
            <LuzCena id="lzA" ativo amb="#FFE9D2" ambForca={0.35} luz={{ ...LUZ_MANHA, x: -pe.x - 400, y: -pe.y - 200 }}>
              <Vivo quem="kaik" x={0} y={0} s={s} vista="perfil" expr="determinado" pose={corridaForte(f)} espelhar={paraEsquerda} semSombra />
            </LuzCena>
          </Rastro>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- 2) Os dois na calçada, câmera girando em volta (o cenário 3D muda, eles continuam 2D) ----------
const CalcadaOrbita: React.FC = () => {
  const { f, p } = useP();
  const C: [number, number, number] = [7.4, 1.05, 0];
  const a = ((lerp(-28, 18, p)) * Math.PI) / 180;
  const d = lerp(6.2, 5.0, p);
  const cam: Cam = { pos: [C[0] - Math.cos(a) * d, lerp(1.9, 1.5, p), C[2] + Math.sin(a) * d], alvo: C, fov: 40 };
  const quem = [
    { id: "chede" as const, z: -0.75, vista: "tresQuartos" as const, espelhar: false, expr: "espanto" as const,
      pose: { olharX: 0.9, cabeca: -4 } },
    { id: "kaik" as const, z: 0.75, vista: "tresQuartos" as const, espelhar: true, expr: "medo" as const,
      pose: { bracoD: 30 + Math.sin(f / 5) * 8, antebracoD: -70, olharX: 0.8 } },
  ]
    .map((q) => ({ ...q, pe: projetar(cam, [C[0], 0, q.z]) }))
    .sort((x, y) => x.pe.pxPorMetro - y.pe.pxPorMetro);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(3px)" }}>
        <Rua3D cam={cam} sol={1.05} />
      </AbsoluteFill>
      <Svg>
        {quem.map((q) => (
          <SombraChao key={`s${q.id}`} cam={cam} x={C[0]} z={q.z} />
        ))}
        <LuzCena id="lzB" ativo amb="#FFE9D2" ambForca={0.35} luz={LUZ_MANHA}>
          {quem.map((q) => (
            <Vivo key={q.id} quem={q.id} x={q.pe.x} y={q.pe.y} s={(q.pe.pxPorMetro * 1.75) / ALTURA_RIG} vista={q.vista} expr={q.expr} espelhar={q.espelhar} pose={q.pose} semSombra />
          ))}
        </LuzCena>
      </Svg>
      {/* relógio no pulso do Chede: 7:52 */}
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", fontFamily: "'Roboto Condensed'", fontWeight: 800 }}>
        <div style={{ fontSize: 40, color: "#fff", letterSpacing: 4, textShadow: "0 3px 8px rgba(0,0,0,.5)" }}>AULA ÀS 8:00</div>
        <div style={{ fontSize: 170, color: "#FFD23F", WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>7:52</div>
      </div>
    </AbsoluteFill>
  );
};

export const DURACAO_HIBRIDO = 270;
export const TesteHibrido: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={120}><CorridaAlto /></Sequence>
    <Sequence from={120} durationInFrames={150}><CalcadaOrbita /></Sequence>
    <Poeira n={30} />
    <Gradacao />
    <Grao forca={0.08} />
  </AbsoluteFill>
);

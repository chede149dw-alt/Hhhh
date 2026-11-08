import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { alcançar, clamp, lerp, useP } from "../comum";
import { Plano3D, camEntre, orbita } from "../../cenarios3d/Kit3D";
import type { Cam } from "../../cenarios3d/Rua3D";
import { projetar } from "../../cenarios3d/Rua3D";
import { Campo3D, Pedra3D, Tornado3D } from "../../cenarios3d/Cenarios4";
import { Rastro } from "../../efeitos/Velocidade";
import { Fenda } from "../../efeitos/Fenda";
import { Tenis } from "../../objetos/Objetos";
import { AMARELO, CIANO, ComOlhoRoxo, Info, SeloSegue, Relogio, contorno, fonte, poseCorrida } from "./Comum4";

const mao = (vista: "frente" | "tresQuartos" | "perfil", lado: 1 | -1, x: number, y: number) => {
  const a = alcançar(vista, lado, x, y);
  return lado === 1 ? { bracoD: a.braco, antebracoD: a.antebraco } : { bracoE: a.braco, antebracoE: a.antebraco };
};
const CH: [number, number] = [-0.9, 2.2]; // Chede (x, z) no campo
const KA: [number, number] = [1.0, 0.6]; // Kaik
const TORN: [number, number, number] = [-5, 0, -6];
// espelhar = true quando o outro está à esquerda na tela (o 3/4 e o perfil olham para a direita por padrão)
const encarar = (cam: Cam, eu: [number, number], outro: [number, number]) =>
  projetar(cam, [outro[0], 1.2, outro[1]]).x < projetar(cam, [eu[0], 1.2, eu[1]]).x;

// 17 · Primeiro teste: velocidade máxima
export const L17_Teste1: React.FC = () => {
  const { p } = useP();
  const cam = orbita([0, 1, 1.3], lerp(-30, -10, p), lerp(7.5, 6.5, p), 1.2, 50, 1.0);
  return (
    <Plano3D id="l17" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={1.5}
      atores={[
        { quem: "kaik", x: KA[0], z: KA[1], vista: "perfil", expr: "determinado", pose: { tronco: 25, bracoE: -30, antebracoE: -60, bracoD: 30, antebracoD: -60, pernaE: 10, pernaD: -10, olharX: 1 } },
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "feliz", pose: { ...mao("tresQuartos", -1, 140, -1200), olharY: 0.5, olharX: 0.3 } },
      ]}
      html={<Info rotulo="TESTE 1" valor="VELOCIDADE" y={190} cor={CIANO} tam={120} />}
    />
  );
};

// 18 · 100 m em 0,15 s: 2.000 km/h — vista do alto, mato deitando
export const L18_DoisMil: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [-16, 16, 18], alvo: [0, 0, -4], fov: 46 }, { pos: [-12, 12, 14], alvo: [0, 0, -4], fov: 44 }, p);
  const tr = interpolate(f, [8, 13], [0, 1], clamp);
  const a = projetar(cam, [-30, 0.4, -2]);
  const b = projetar(cam, [30, 0.4, -2]);
  const x2 = lerp(a.x, b.x, tr);
  const y2 = lerp(a.y, b.y, tr);
  const deita = interpolate(f, [9, 16], [0, 1], clamp) * interpolate(f, [16, 60], [1, 0.3], clamp);
  return (
    <Plano3D id="l18" clima="porDoSol" cam={cam} cenario={<Campo3D deita={deita} />}
      atores={[{ quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: f > 14 ? "espanto" : "neutro", pose: { ...mao("tresQuartos", -1, 140, -1200), olharY: 0.5 } }]}
      frente={
        tr > 0 ? (
          <g>
            <line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke={CIANO} strokeWidth={34} strokeLinecap="round" opacity={interpolate(f, [13, 40], [0.9, 0], clamp)} />
            <line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={interpolate(f, [13, 40], [1, 0], clamp)} />
          </g>
        ) : null
      }
      html={
        <>
          <Info rotulo="100 m EM" valor="0,15" unidade="s" y={190} />
          <Info rotulo="VELOCIDADE" valor="2.000" unidade="km/h" y={400} cor={CIANO} de={16} />
        </>
      }
    />
  );
};

// 19 · Sola a 300 °C, tênis derrete
export const L19_Sola: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([KA[0], 0.3, KA[1]], lerp(-60, -40, p), lerp(2.0, 1.4, p), 0.5, 40, 0.3);
  const pe = projetar(cam, [KA[0] + 0.1, 0.05, KA[1]]);
  const pinga = (f * 3) % 80;
  return (
    <Plano3D id="l19" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={7}
      frente={
        <g transform={`translate(${pe.x},${pe.y}) scale(${pe.pxPorMetro / 700})`}>
          <Tenis fumaca={(f % 45) / 45} />
          <path d="M -170 22 Q -160 60 -140 22 M -40 22 Q -30 80 -10 22 M 90 22 Q 100 70 120 22" fill="#2A2A2E" />
          <ellipse cx={-30} cy={40 + pinga} rx={12} ry={18} fill="#2A2A2E" opacity={1 - pinga / 80} />
          <rect x={-170} y={-14} width={384} height={36} rx={14} fill="#FF6A2A" opacity={0.35 + 0.25 * Math.sin(f / 3)} style={{ mixBlendMode: "screen" }} />
        </g>
      }
      html={<Info rotulo="SOLA DO TÊNIS" valor="300" unidade="°C" y={200} cor="#FF5A3A" tam={180} />}
    />
  );
};

// 20 · Maratona: 2.600 kcal, seis pães
const Pao: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <ellipse rx={70} ry={42} fill="#D99A4E" />
    <ellipse rx={70} ry={42} fill="none" stroke="#A9692E" strokeWidth={6} />
    <path d="M -40 -20 Q -20 -36 0 -20 M 0 -22 Q 20 -38 40 -22" stroke="#A9692E" strokeWidth={6} fill="none" />
  </g>
);
export const L20_Paes: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([KA[0], 0.9, KA[1]], lerp(-30, -15, p), lerp(5.2, 4.6, p), 1.2, 44, 1.0);
  const comidos = Math.min(6, Math.floor(interpolate(p, [0.15, 0.95], [0, 6.99], clamp)));
  return (
    <Plano3D id="l20" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={4}
      atores={[
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", expr: f % 12 < 6 ? "rindo" : "feliz", pose: { ...mao("tresQuartos", -1, 120, -1300 + Math.abs(Math.sin(f / 4)) * 60) },
          extra: (s) => <Pao x={120 * s} y={-1300 * s} s={s * 1.5} r={-20} /> },
      ]}
      html={
        <>
          <Info rotulo="CORRIDA = UMA MARATONA" valor="2.600" unidade="kcal" y={190} cor={AMARELO} />
          <div style={{ position: "absolute", top: 440, left: 70, display: "flex", gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <svg key={i} width={140} height={100} viewBox="-75 -50 150 100" style={{ opacity: i < comidos ? 0.25 : 1 }}>
                <Pao x={0} y={0} s={1} />
              </svg>
            ))}
          </div>
        </>
      }
    />
  );
};

// 21 · Correr em círculo (vista do alto, rastro desenhando o círculo)
const circulo = (cam: Cam, c: [number, number, number], r: number, de: number, ate: number, n = 64) => {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = de + ((ate - de) * i) / n;
    const q = projetar(cam, [c[0] + Math.cos(a) * r, 0.3, c[2] + Math.sin(a) * r]);
    d += `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)} `;
  }
  return d;
};
export const L21_Circulo: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [TORN[0] - 1, 26, TORN[2] + 12], alvo: [TORN[0], 0, TORN[2]], fov: 40 }, { pos: [TORN[0] - 4, 20, TORN[2] + 14], alvo: [TORN[0], 0, TORN[2]], fov: 40 }, p);
  const ang = f * 0.5;
  const q = projetar(cam, [TORN[0] + Math.cos(ang) * 3, 0, TORN[2] + Math.sin(ang) * 3]);
  return (
    <Plano3D id="l21" clima="porDoSol" cam={cam} cenario={<Campo3D porta />}
      frente={
        <g>
          <path d={circulo(cam, TORN, 3, ang - Math.min(6.2, f * 0.4), ang)} stroke={CIANO} strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d={circulo(cam, TORN, 3, ang - Math.min(6.2, f * 0.4), ang)} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={q.x} cy={q.y} r={16} fill="#fff" />
        </g>
      }
      html={<Info rotulo="TESTE 2" valor="CÍRCULO" y={190} cor={CIANO} tam={120} />}
    />
  );
};

// 22 · O ar começa a girar junto (infográfico)
export const L22_Ar: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [TORN[0] - 9, 7, TORN[2] + 10], alvo: [TORN[0], 1.5, TORN[2]], fov: 44 }, { pos: [TORN[0] - 6, 5.5, TORN[2] + 8], alvo: [TORN[0], 2, TORN[2]], fov: 44 }, p);
  const giro = f * 0.25;
  return (
    <Plano3D id="l22" clima="porDoSol" cam={cam} cenario={<><Campo3D /><Tornado3D p={TORN} t={f / 30} forca={interpolate(p, [0, 1], [0.05, 0.35])} porta={false} /></>}
      frente={
        <g>
          {[0.5, 1.6, 2.8].map((y, k) => (
            <g key={k}>
              {[0, 1, 2, 3].map((i) => {
                const a0 = giro + (i * Math.PI) / 2 + k;
                const d = (() => {
                  let s = "";
                  for (let j = 0; j <= 12; j++) {
                    const a = a0 + j * 0.08;
                    const r = 2.6 + k * 0.5;
                    const q = projetar(cam, [TORN[0] + Math.cos(a) * r, y, TORN[2] + Math.sin(a) * r]);
                    s += `${j ? "L" : "M"} ${q.x} ${q.y} `;
                  }
                  return s;
                })();
                return <path key={i} d={d} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" markerEnd="url(#seta)" opacity={0.9} />;
              })}
            </g>
          ))}
          <defs>
            <marker id="seta" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
              <path d="M 0 0 L 4 2 L 0 4 Z" fill="#fff" />
            </marker>
          </defs>
        </g>
      }
      html={<Info rotulo="O AR GIRA JUNTO" valor="300" unidade="km/h" y={190} cor={AMARELO} />}
    />
  );
};

// 23 · Tornado se forma (câmera gira em volta)
export const L23_Tornado: React.FC = () => {
  const { p, f } = useP();
  const forca = interpolate(p, [0, 0.8], [0.35, 1], clamp);
  const cam = orbita([TORN[0], 4, TORN[2]], lerp(-50, 10, p), lerp(16, 13, p), lerp(1.4, 2.0, p), 50, 5);
  return (
    <Plano3D id="l23" clima="porDoSol" cam={cam} cenario={<><Campo3D porta={false} /><Tornado3D p={TORN} t={f / 30 + 2} forca={forca} porta={false} /></>}
      atores={[{ quem: "chede", x: CH[0], z: CH[1] + 2, vista: "tresQuartos", espelhar: true, expr: "espanto", pose: { olharY: -0.6, bracoE: 30, bracoD: 30 } }]}
      html={<Info rotulo="NO MEIO, A PRESSÃO" valor="CAI ↓" y={190} cor="#FF5A4A" />}
    />
  );
};

// 24 · Porta velha voando a 10 m
export const L24_Porta: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [CH[0] - 2.5, 0.8, CH[1] + 6], alvo: [TORN[0], 3.6, TORN[2]], fov: 56 }, { pos: [CH[0] - 3, 0.7, CH[1] + 5.2], alvo: [TORN[0], 4.6, TORN[2]], fov: 56 }, p);
  const topo = projetar(cam, [TORN[0] + 3, 10, TORN[2]]);
  const base = projetar(cam, [TORN[0] + 3, 0, TORN[2]]);
  return (
    <Plano3D id="l24" clima="porDoSol" cam={cam} cenario={<><Campo3D porta={false} /><Tornado3D p={TORN} t={f / 30 + 4} forca={1} porta /></>}
      atores={[{ quem: "chede", x: CH[0], z: CH[1] + 1.5, vista: "tresQuartos", espelhar: true, expr: "medo", tremor: Math.sin(f * 2) * 5, pose: { tronco: -15, pernaE: 40, joelhoE: -70, pernaD: 20, joelhoD: -40, bracoE: 70, bracoD: 60, cabeca: 10, olharY: -0.8 } }]}
      frente={
        <g>
          <line x1={base.x + 60} y1={base.y} x2={topo.x + 60} y2={topo.y} stroke="#fff" strokeWidth={6} strokeDasharray="18 12" />
          <line x1={topo.x + 40} y1={topo.y} x2={topo.x + 80} y2={topo.y} stroke="#fff" strokeWidth={6} />
        </g>
      }
      html={<Info rotulo="PORTA VOANDO A" valor="10" unidade="m" y={190} cor={AMARELO} de={10} />}
    />
  );
};

// 25 · Tontura: ouvido não aguenta; devolveu os pães
const Labirinto: React.FC<{ f: number }> = ({ f }) => (
  <svg viewBox="-150 -150 300 300" width={300} height={300} style={{ position: "absolute", top: 420, left: 700, transform: `rotate(${f * 12}deg)` }}>
    <circle r={140} fill="rgba(0,0,0,0.45)" />
    <path d="M 0 0 m -10 0 a 10 10 0 1 1 20 0 a 25 25 0 1 1 -45 0 a 40 40 0 1 1 75 0 a 55 55 0 1 1 -105 0 a 70 70 0 1 1 135 0" stroke="#fff" strokeWidth={10} fill="none" />
  </svg>
);
export const L25_Tontura: React.FC = () => {
  const { p, f } = useP();
  const enjoo = p > 0.6;
  const w = Math.sin(f / 4) * 14;
  const cam = orbita([KA[0], 1.0, KA[1] - 2], lerp(-25, -10, p), lerp(4.5, 3.6, p), 1.3, 40, 1.0);
  return (
    <Plano3D id="l25" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={3}
      atores={[
        { quem: "kaik", x: KA[0], z: KA[1] - 2, vista: enjoo ? "perfil" : "tresQuartos", expr: enjoo ? "espanto" : "cansado", tremor: w,
          pose: enjoo ? { tronco: 45, cabeca: 20, bracoE: 30, bracoD: 20, olharY: 1 } : { tronco: w * 0.8, cabeca: -w, bracoE: 40, bracoD: 45, olharX: Math.sin(f / 3) } },
      ]}
      html={
        <>
          <Info rotulo="OUVIDO INTERNO" valor="TONTURA" y={190} cor="#9BE36A" tam={120} />
          {!enjoo && <Labirinto f={f} />}
        </>
      }
    />
  );
};

// 26 · Vez do Chede: "joga pedra em mim" (selo de engajamento)
export const L26_JogaPedra: React.FC = () => {
  const { p } = useP();
  const cam = orbita([0, 1, 1.3], lerp(5, -12, p), lerp(6.4, 5.6, p), 1.2, 50, 1.1);
  return (
    <Plano3D id="l26" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={1.5}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", espelhar: encarar(cam, CH, KA), expr: "determinado", pose: { ...mao("tresQuartos", -1, 40, -1080), olharX: 0.9 } },
        { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: encarar(cam, KA, CH), expr: "rindo", pose: { ...mao("tresQuartos", -1, 190, -900), olharX: 0.9 },
          extra: (s) => (
            <g transform={`translate(${-190 * s},${-900 * s})`}>
              {[[-20, -10], [10, -20], [0, 10], [25, 5]].map(([x, y], i) => (
                <circle key={i} cx={x * s * 3} cy={y * s * 3} r={34 * s} fill="#8C847A" stroke="#6C645A" strokeWidth={6 * s} />
              ))}
            </g>
          ) },
      ]}
      html={<SeloSegue top={1560} />}
    />
  );
};

// 27 · Sem as mãos, só olhando
export const L27_SoOlhando: React.FC = () => {
  const { p } = useP();
  const cam = orbita([CH[0], 1.55, CH[1]], lerp(-35, -20, p), lerp(2.6, 1.3, p), 1.6, 36, 1.55);
  return (
    <Plano3D id="l27" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={5}
      atores={[{ quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "determinado", pose: { bracoE: -22, antebracoE: -40, bracoD: -22, antebracoD: -40, olharX: 0.9 } }]}
      html={<Info rotulo="TESTE 3" valor="SEM AS MÃOS" y={190} cor="#B48CFF" tam={110} />}
    />
  );
};

// pedra voando do Kaik até a cabeça do Chede (t de 0 a 1)
const trajeto = (t: number): [number, number, number] => {
  const a: [number, number, number] = [KA[0] - 0.2, 1.5, KA[1]];
  const b: [number, number, number] = [CH[0] + 0.15, 1.62, CH[1]];
  return [lerp(a[0], b[0], t), a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 0.6, lerp(a[2], b[2], t)];
};

// 28 · 0,7 s; a primeira na testa
export const L28_Testa: React.FC = () => {
  const { p, f } = useP();
  const t = interpolate(f, [4, 40], [0, 1], clamp);
  const bateu = t >= 1;
  const cam = camEntre({ pos: [0.05, 1.55, 6.0], alvo: [0.05, 1.45, 1.35], fov: 52 }, { pos: [-0.3, 1.6, 5.0], alvo: [-0.3, 1.5, 1.35], fov: 48 }, p);
  const testa = projetar(cam, [CH[0] + 0.08, 1.8, CH[1]]);
  return (
    <AbsoluteFill>
      <Plano3D id="l28" clima="porDoSol" cam={cam} cenario={<><Campo3D />{!bateu && <Pedra3D p={trajeto(t)} r={0.08} giro={f * 0.4} />}</>} desfoque={2}
        atores={[
          { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", espelhar: encarar(cam, CH, KA), expr: bateu ? "raiva" : "determinado", tremor: bateu && f < 52 ? Math.sin(f * 3) * 10 : 0, pose: { bracoE: -22, antebracoE: -40, bracoD: -22, antebracoD: -40, cabeca: bateu ? -12 : 0, olharX: 0.9, piscar: bateu && f < 48 ? 1 : 0 } },
          { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: encarar(cam, KA, CH), expr: bateu ? "rindo" : "feliz", pose: { bracoD: 150, antebracoD: -30, olharX: 0.9 } },
        ]}
        frente={bateu ? <circle cx={testa.x - 6} cy={testa.y - 8} r={(0.025 + interpolate(f, [40, 50], [0, 0.015], clamp)) * testa.pxPorMetro} fill="#C77A55" stroke="#9A5236" strokeWidth={4} /> : null}
        html={<Info rotulo="A PEDRA LEVA" valor="0,7" unidade="s" y={190} de={0} />}
      />
      {bateu && f < 44 && <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [40, 44], [0.7, 0], clamp) }} />}
    </AbsoluteFill>
  );
};

// 29 · Na quinta, a fenda abriu onde ele olhou
export const L29_Fenda: React.FC = () => {
  const { p, f } = useP();
  const tFim = 0.62;
  const t = Math.min(tFim, interpolate(f, [2, 30], [0, tFim], clamp));
  const parou = f >= 30;
  const cam = orbita([lerp(CH[0], KA[0], 0.4), 1.5, lerp(CH[1], KA[1], 0.4)], lerp(-90, -75, p), lerp(5.6, 4.9, p), 1.6, 52, 1.5);
  const ponto = projetar(cam, trajeto(tFim));
  const brilho = interpolate(f, [18, 28], [0, 1], clamp);
  const some = interpolate(f, [30, 40], [1, 0], clamp);
  const tamanho = interpolate(f, [26, 34, 70], [0, 0.55, 0.5], clamp) * interpolate(f, [70, 82], [1, 0], clamp);
  return (
    <ComOlhoRoxo>
      <Plano3D id="l29" clima="porDoSol" cam={cam} cenario={<><Campo3D />{some > 0 && <Pedra3D p={trajeto(t)} r={0.08 * (parou ? some : 1)} giro={f * 0.4} />}</>} desfoque={2}
        atores={[
          { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", espelhar: encarar(cam, CH, KA), expr: "determinado", pose: { bracoE: -22, antebracoE: -40, bracoD: -22, antebracoD: -40, olharX: 0.9, olhosPoder: brilho } },
          { quem: "kaik", x: KA[0], z: KA[1], vista: "tresQuartos", espelhar: encarar(cam, KA, CH), expr: parou ? "espanto" : "feliz", pose: { bracoD: 150, antebracoD: -30, olharX: 0.9 } },
        ]}
        frente={tamanho > 0.01 ? <Fenda x={ponto.x} y={ponto.y} tamanho={tamanho * ponto.pxPorMetro / 160} /> : null}
        html={<Info rotulo="TENTATIVA" valor="5ª ✔" y={190} cor="#B48CFF" de={30} />}
      />
    </ComOlhoRoxo>
  );
};

// 30 · Olho vermelho (veia estourou)
export const L30_OlhoVermelho: React.FC = () => {
  const { p, f } = useP();
  const v = interpolate(p, [0.1, 0.7], [0, 1], clamp);
  const z = lerp(1, 1.15, p);
  return (
    <AbsoluteFill style={{ background: "#2A1A14" }}>
      <AbsoluteFill style={{ filter: "blur(14px) brightness(0.8)" }}>
        <Plano3D id="l30" clima="porDoSol" cam={orbita([CH[0], 1.6, CH[1]], -20, 1.2, 1.65, 36, 1.65)} cenario={<Campo3D />} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <rect x={-200} y={500} width={1480} height={900} fill="#9A6340" />
          <path d="M 120 960 Q 540 560 960 960 Q 540 1300 120 960 Z" fill="#FAF4EC" />
          <g opacity={v}>
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const r1 = 360;
              const x1 = 540 + Math.cos(a) * r1;
              const y1 = 960 + Math.sin(a) * r1 * 0.45;
              const x2 = 540 + Math.cos(a + 0.2) * 170;
              const y2 = 960 + Math.sin(a + 0.2) * 110;
              return <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 30} ${(y1 + y2) / 2 - 20} ${x2} ${y2}`} stroke="#D9332B" strokeWidth={6} fill="none" />;
            })}
            <path d="M 120 960 Q 540 560 960 960 Q 540 1300 120 960 Z" fill="#E0463A" opacity={0.3 * v} />
          </g>
          <circle cx={540} cy={960} r={150} fill="#3A2416" />
          <circle cx={540} cy={960} r={70} fill="#120B08" />
          <circle cx={500} cy={920} r={22} fill="#fff" />
          <path d="M 120 960 Q 540 560 960 960" stroke="#5A3420" strokeWidth={24} fill="none" />
          <path d="M 120 960 Q 540 1300 960 960" stroke="#7A4A2E" strokeWidth={14} fill="none" />
        </svg>
      </AbsoluteFill>
      <Info rotulo="ESFORÇO DEMAIS" valor="VEIA ESTOUROU" y={200} cor="#FF5A4A" tam={110} de={10} />
      {f % 40 < 3 && <AbsoluteFill style={{ background: "#FF2A20", opacity: 0.15 }} />}
    </AbsoluteFill>
  );
};

// 31 · Último teste: carro velho, 1 tonelada
export const L31_Carro: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [-2.6, 1.7, 7.5], alvo: [1.8, 1.0, -9], fov: 46 }, { pos: [-2.0, 1.6, 6.2], alvo: [1.8, 1.0, -9], fov: 44 }, p);
  return (
    <Plano3D id="l31" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={1}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "costas", pose: { bracoD: 75, antebracoD: -8 } },
        { quem: "kaik", x: KA[0], z: KA[1] + 0.6, vista: "costas" },
      ]}
      html={<Info rotulo="CARRO VELHO" valor="1" unidade="tonelada" y={190} cor={AMARELO} />}
    />
  );
};

// 32 · Com medo, fenda do tamanho de uma moeda; Kaik: respira
export const L32_Respira: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([lerp(CH[0], KA[0], 0.35), 1.3, CH[1] + 0.3], lerp(-15, -2, p), lerp(4.0, 3.4, p), 1.45, 48, 1.35);
  const palma = projetar(cam, [CH[0] + 0.62, 1.42, CH[1] - 0.05]);
  const resp = (Math.sin((f / 30) * (Math.PI / 4) * 2) + 1) / 2;
  return (
    <Plano3D id="l32" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={3}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: p < 0.5 ? "medo" : "neutro", tremor: p < 0.5 ? Math.sin(f * 3) * 4 : 0, pose: { ...mao("tresQuartos", 1, 420, -1200), olharX: 0.9, piscar: p > 0.6 ? 1 : 0 } },
        { quem: "kaik", x: CH[0] + 0.15, z: CH[1] + 0.9, vista: "tresQuartos", espelhar: true, expr: "neutro", pose: { ...mao("tresQuartos", -1, 260, -1250), olharX: 0.9 } },
      ]}
      frente={<Fenda x={palma.x + Math.sin(f * 2) * 3} y={palma.y} tamanho={(0.06 + (p > 0.6 ? resp * 0.04 : 0)) * palma.pxPorMetro / 100} intensidade={0.6} />}
      html={
        <>
          <Info rotulo="COM MEDO" valor="🪙 MOEDA" y={190} cor="#B48CFF" tam={110} />
          {p > 0.5 && (
            <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 220, height: 220, borderRadius: 200, border: "10px solid #fff", transform: `scale(${0.7 + resp * 0.5})`, display: "flex", alignItems: "center", justifyContent: "center", ...fonte, fontSize: 40, color: "#fff", ...contorno(5) }}>
                {resp > 0.5 ? "INSPIRA 4 s" : "SOLTA 4 s"}
              </div>
            </div>
          )}
        </>
      }
    />
  );
};

// 33 · Calmo, a fenda abre 4 m, o carro some; o nariz sangra
export const L33_QuatroMetros: React.FC = () => {
  const { p, f } = useP();
  const parte2 = p > 0.72;
  const carroEsc = interpolate(p, [0.3, 0.55], [1, 0], clamp);
  const abre = interpolate(p, [0.05, 0.3], [0, 1], clamp) * interpolate(p, [0.58, 0.68], [1, 0], clamp);
  // por cima do ombro do Chede, olhando o carro (antes a câmera ficava colada no carro)
  const cam = camEntre({ pos: [-1.9, 1.95, 6.4], alvo: [1.4, 1.3, -8], fov: 46 }, { pos: [-1.5, 1.85, 5.2], alvo: [1.6, 1.3, -8], fov: 44 }, p);
  const c = projetar(cam, [2.5, 1.2, -9]);
  if (parte2) {
    const cam2 = orbita([CH[0], 1.62, CH[1]], -25, 0.95, 1.62, 34, 1.6);
    const gota = interpolate(p, [0.74, 1], [0, 1], clamp);
    return (
      <Plano3D id="l33b" clima="porDoSol" cam={cam2} cenario={<Campo3D carro={false} />} desfoque={7}
        atores={[{ quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "cansado", pose: { olharX: 0.4, olharY: 0.4, sangueNariz: 0.15 + gota * 0.85 } }]}
        html={<Info rotulo="O CORPO PAGA" valor="LIMITE: 8" unidade="s" y={190} cor="#FF5A4A" tam={120} />}
      />
    );
  }
  return (
    <ComOlhoRoxo>
      <Plano3D id="l33" clima="porDoSol" cam={cam} cenario={<Campo3D carroEscala={carroEsc} />}
        atores={[{ quem: "chede", x: CH[0], z: CH[1], vista: "costas", pose: { bracoD: 75, antebracoD: -8 } }]}
        frente={abre > 0.01 ? <Fenda x={c.x} y={c.y} tamanho={(abre * 4.4 * c.pxPorMetro) / 240} /> : null}
        html={<Info rotulo="CALMO, A FENDA ABRIU" valor="4" unidade="m" y={190} cor="#B48CFF" />}
      />
    </ComOlhoRoxo>
  );
};

// 34 · Trouxe o carro de volta... com marcas de mão pretas
export const L34_Marcas: React.FC = () => {
  const { p } = useP();
  const abre = interpolate(p, [0, 0.2], [0, 1], clamp) * interpolate(p, [0.4, 0.5], [1, 0], clamp);
  const y = interpolate(p, [0.2, 0.4], [3.5, 0], clamp);
  const cam = orbita([2.5, 1, -9], lerp(-160, -60, p), lerp(9, 5.5, p), lerp(2.4, 1.3, p), 44, 0.9);
  const c = projetar(cam, [2.5, 3.5, -9]);
  return (
    <Plano3D id="l34" clima="porDoSol" cam={cam} cenario={<Campo3D carroY={y} marcas={interpolate(p, [0.4, 0.55], [0, 1], clamp)} carroEscala={p < 0.2 ? 0 : 1} />}
      atores={[
        { quem: "chede", x: CH[0], z: CH[1], vista: "tresQuartos", expr: "espanto", pose: { olharX: 0.9 } },
        { quem: "kaik", x: KA[0] - 0.4, z: KA[1] + 0.8, vista: "tresQuartos", espelhar: true, expr: "medo", pose: { olharX: 0.9 } },
      ]}
      frente={abre > 0.01 ? <Fenda x={c.x} y={c.y} tamanho={(abre * 3.5 * c.pxPorMetro) / 240} /> : null}
    />
  );
};

// 35 · Não estavam lá antes. Parte 5 + segue
export const L35_Final: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [5.2, 0.9, -6.2], alvo: [3.3, 0.8, -9.3], fov: 40 }, { pos: [4.4, 0.85, -7.2], alvo: [3.3, 0.8, -9.3], fov: 34 }, Math.min(1, p * 1.6));
  return (
    <AbsoluteFill>
      <Plano3D id="l35" clima="porDoSol" cam={cam} cenario={<Campo3D marcas={1} />} />
      {p > 0.45 && (
        <AbsoluteFill style={{ background: `rgba(10,6,14,${interpolate(p, [0.45, 0.6], [0, 0.55], clamp)})` }}>
          <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", ...fonte }}>
            <div style={{ fontSize: 200, color: AMARELO, ...contorno(14), transform: `rotate(-4deg) scale(${interpolate(p, [0.45, 0.55], [0.4, 1], clamp)})` }}>PARTE 5</div>
            <div style={{ fontSize: 64, color: "#fff", marginTop: 30, ...contorno(8) }}>O QUE TEM DO OUTRO LADO?</div>
          </div>
          <SeloSegue top={1180} />
        </AbsoluteFill>
      )}
      {f < 0 && <Relogio hora="" />}
    </AbsoluteFill>
  );
};

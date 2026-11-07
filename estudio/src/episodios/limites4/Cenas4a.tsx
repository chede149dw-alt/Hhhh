import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { clamp, lerp, useP } from "../comum";
import { Plano3D, PlanoRua, camEntre, orbita, Ator } from "../../cenarios3d/Kit3D";
import { projetar } from "../../cenarios3d/Rua3D";
import { Anfiteatro3D, Campo3D, Cantina3D, Carro, Faculdade3D } from "../../cenarios3d/Cenarios4";
import { alcançar } from "../comum";
import { Rastro } from "../../efeitos/Velocidade";
import { MaoFechada } from "../velocidade1/CenasNovas";
import { AMARELO, ChedeNasCostas, CIANO, Info, Relogio, Vento, contorno, fonte, poseCorrida } from "./Comum4";

const mao = (vista: "frente" | "tresQuartos" | "perfil", lado: 1 | -1, x: number, y: number) => {
  const a = alcançar(vista, lado, x, y);
  return lado === 1 ? { bracoD: a.braco, antebracoD: a.antebraco } : { bracoE: a.braco, antebracoE: a.antebraco };
};

// 0 · Capa — campo baldio no pôr do sol, os dois de costas
export const L0_Capa: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [0.2, 1.25, 10.5], alvo: [0, 1.45, -6], fov: 46 }, { pos: [0, 1.3, 9.2], alvo: [0, 1.5, -6], fov: 44 }, p);
  return (
    <Plano3D id="l0" clima="porDoSol" cam={cam} cenario={<Campo3D />} desfoque={1.2}
      atores={[
        { quem: "chede", x: -0.55, z: 3.2, vista: "costas", parado: true },
        { quem: "kaik", x: 0.6, z: 3.0, vista: "costas", parado: true },
      ]}
      html={
        <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", ...fonte, lineHeight: 1.02 }}>
          <div style={{ fontSize: 112, color: "#fff", ...contorno(12) }}>E SE VOCÊ TESTASSE</div>
          <div style={{ fontSize: 112, color: "#fff", ...contorno(12) }}>
            O LIMITE DO SEU <span style={{ color: AMARELO, textShadow: "0 0 40px rgba(255,190,60,0.8)" }}>PODER?</span>
          </div>
          <div style={{ marginTop: 1150, fontSize: 170, color: AMARELO, ...contorno(14), transform: "rotate(-4deg)" }}>PARTE 4</div>
        </div>
      }
    />
  );
};

// 1 · Carro preto indo embora; os dois na calçada
export const L1_CarroVai: React.FC = () => {
  const { p } = useP();
  const zc = lerp(-2, -34, p);
  const cam = camEntre({ pos: [3.5, 6.5, 15], alvo: [5.5, 0.4, -4], fov: 50 }, { pos: [4.5, 4.2, 11.5], alvo: [3.5, 0.8, -14], fov: 46 }, p);
  return (
    <PlanoRua id="l1" cam={cam} extra3D={<Carro p={[2.2, 0, zc]} />}
      atores={[
        { quem: "chede", x: 7.6, z: 3.2, vista: "costas" },
        { quem: "kaik", x: 8.6, z: 3.6, vista: "costas" },
      ]}
    />
  );
};

// 2 · Relógio 7:52
export const L2_Relogio: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([7.6, 1.2, 0], lerp(-12, 8, p), lerp(5.4, 4.6, p), 1.55, 46, 1.25);
  const susto = f > 24;
  return (
    <PlanoRua id="l2" cam={cam} desfoque={3}
      atores={[
        { quem: "chede", x: 7.6, z: -0.5, vista: "tresQuartos", expr: susto ? "espanto" : "neutro", pose: { ...mao("tresQuartos", -1, 120, -1180), olharX: 0.4, olharY: 0.6, cabeca: 8 } },
        { quem: "kaik", x: 7.6, z: 0.8, vista: "tresQuartos", espelhar: true, expr: susto ? "espanto" : "neutro", pose: { olharX: 0.9 } },
      ]}
      html={<Relogio hora="7:52" legenda="AGORA" />}
    />
  );
};

// 3 · Mapa de cima: casa → faculdade, 6 km
export const L3_Mapa: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [0.5, 48, 6], alvo: [0, 0, -10], fov: 50 }, { pos: [0.2, 62, -14], alvo: [0, 0, -30], fov: 50 }, p);
  const a = projetar(cam, [7.5, 0, 4]);
  const b = projetar(cam, [0, 0, -80]);
  const tr = interpolate(p, [0.05, 0.8], [0, 1], clamp);
  return (
    <PlanoRua id="l3" cam={cam}
      frente={
        <g>
          <line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, tr)} y2={lerp(a.y, b.y, tr)} stroke={AMARELO} strokeWidth={16} strokeDasharray="34 22" strokeLinecap="round" />
          <circle cx={a.x} cy={a.y} r={26} fill="#fff" stroke="#000" strokeWidth={6} />
          <text x={a.x + 40} y={a.y + 14} fill="#fff" fontSize={46} {...fonte} stroke="#000" strokeWidth={8} paintOrder="stroke">CASA</text>
        </g>
      }
      html={
        <>
          <Info rotulo="AULA ÀS" valor="8:00" y={200} cor={AMARELO} />
          <Info rotulo="FACULDADE" valor="6" unidade="km" y={200} x={640} de={18} />
        </>
      }
    />
  );
};

// 4 · Kaik vira de costas: "sobe"
export const L4_Sobe: React.FC = () => {
  const { p } = useP();
  const cam = orbita([7.6, 1.0, 0], lerp(25, 5, p), lerp(6.2, 5.4, p), 1.4, 46, 1.0);
  return (
    <PlanoRua id="l4" cam={cam} desfoque={3}
      atores={[
        { quem: "kaik", x: 7.6, z: 0.6, vista: "perfil", espelhar: true, expr: "feliz", pose: { tronco: 18, pernaE: 14, joelhoE: -28, pernaD: 14, joelhoD: -28, bracoE: 20, bracoD: 25, olharX: 1 } },
        { quem: "chede", x: 7.6, z: -0.8, vista: "tresQuartos", expr: "medo", pose: { ...mao("tresQuartos", 1, 260, -1250), olharX: 0.8 } },
      ]}
    />
  );
};

// 5 · De 0 a 200 km/h em 1 s: 6 G — vista do alto acompanhando
export const L5_SeisG: React.FC = () => {
  const { p, f } = useP();
  const v = interpolate(f, [0, 30], [0.05, 1.6], clamp);
  const zK = 4 - (f < 30 ? (0.05 * f + (1.55 * f * f) / 60) : 0.05 * 30 + 23.25 + (f - 30) * 1.6);
  const xK = 3;
  const cam = { pos: [lerp(-8, -13, p), lerp(7, 11, p), zK + lerp(6, 3, p)] as [number, number, number], alvo: [xK, 0.8, zK - 1.5] as [number, number, number], fov: 42 };
  const pe = projetar(cam, [xK, 0, zK]);
  const fr = projetar(cam, [xK, 0, zK - 1]);
  const esq = fr.x < pe.x;
  const ator: Ator = {
    quem: "kaik", x: xK, z: zK, vista: "perfil", expr: "determinado", pose: poseCorrida(f),
    envolver: (n, s) => (
      <g transform={esq ? "scale(-1,1)" : undefined}>
        <Rastro dx={-30} dy={8} n={Math.round(2 + v * 3)}>
          <g>
            <ChedeNasCostas f={f} s={s} />
            {n}
          </g>
        </Rastro>
      </g>
    ),
  };
  return (
    <PlanoRua id="l5" cam={cam} atores={[ator]}
      html={
        <>
          <Info rotulo="0 → 200 km/h EM 1 s" valor="6" unidade="G" y={190} cor={CIANO} tam={190} />
        </>
      }
    />
  );
};

// 6 · Close do Chede achatado pelo vento
export const L6_Piloto: React.FC = () => {
  const { f, p } = useP();
  const t = Math.sin(f * 2.3) * 7;
  const cz = -2.4 - f * 0.9;
  const cam = { pos: [5.9, 1.7, cz] as [number, number, number], alvo: [7.6, 1.6, cz - 1.0] as [number, number, number], fov: 36 };
  return (
    <PlanoRua id="l6" cam={cam} desfoque={9}
      atores={[{ quem: "chede", x: 7.6, z: cz - 1.0, vista: "tresQuartos", expr: "medo", tremor: t, pose: { cabeca: -8 + t * 0.4, olharX: 1, piscar: f % 20 < 3 ? 1 : 0 } }]}
      frente={<g />}
      html={
        <>
          <Vento n={26} dir={-1} />
          <Info rotulo="PILOTO DE CAÇA TREINADO" valor="9" unidade="G" y={190} de={4} />
          <Info rotulo="CHEDE, SEM TREINO" valor="6 G 😵" y={380} cor="#FF5A4A" de={interpolate(p, [0, 1], [30, 30])} />
        </>
      }
    />
  );
};

// 7 · Chegaram 7:53, Chede verde
const Verde: React.FC<{ s: number }> = ({ s }) => (
  <ellipse cx={0} cy={-1320 * s} rx={190 * s} ry={185 * s} fill="#6BCB4A" opacity={0.42} style={{ mixBlendMode: "color" }} />
);
export const L7_Verde: React.FC = () => {
  const { p, f } = useP();
  const cam = camEntre({ pos: [-3.8, 1.5, 9.5], alvo: [0, 1.6, 2.5], fov: 44 }, { pos: [-2.6, 1.4, 7.6], alvo: [0, 1.4, 2.6], fov: 40 }, p);
  const cambaleia = Math.sin(f / 5) * 10;
  return (
    <Plano3D id="l7" clima="manha" cam={cam} cenario={<Faculdade3D />} desfoque={2}
      atores={[
        { quem: "chede", x: -0.7, z: 3.4, vista: "tresQuartos", expr: "cansado", pose: { tronco: cambaleia, cabeca: -cambaleia, bracoE: 30, bracoD: 25 }, extra: (s) => <Verde s={s} /> },
        { quem: "kaik", x: 0.9, z: 3.1, vista: "tresQuartos", espelhar: true, expr: "rindo", pose: { bracoD: 140, antebracoD: -20, olharX: 0.9 } },
      ]}
      html={<Relogio hora="7:53" y={210} />}
    />
  );
};

// 8 · Câmera de segurança vira pra eles
export const L8_CameraVira: React.FC = () => {
  const { p } = useP();
  const giro = interpolate(p, [0.1, 0.75], [-1.2, -0.25], clamp);
  const luz = p > 0.78 ? 1 : 0;
  const cam = camEntre({ pos: [6.8, 4.5, 4.4], alvo: [3.6, 4.1, 0.7], fov: 30 }, { pos: [5.6, 4.4, 3.2], alvo: [3.6, 4.1, 0.7], fov: 26 }, p);
  return <Plano3D id="l8" clima="manha" cam={cam} cenario={<Faculdade3D giroCamera={giro} luzCamera={luz} />} />;
};

// 9 · Na aula, não conseguia prestar atenção (câmera desliza entre as fileiras)
const ASSENTO = (r: number) => ({ y: r * 0.38 + 0.38, z: -4 + r * 1.7 + 0.75 });
export const L9_Aula: React.FC = () => {
  const { p, f } = useP();
  const a = ASSENTO(3);
  const cam = camEntre({ pos: [-8.2, 3.6, 6.5], alvo: [-3.2, 2.2, a.z], fov: 42 }, { pos: [-6.2, 3.0, 2.6], alvo: [-3.2, 2.0, a.z], fov: 38 }, p);
  return (
    <Plano3D id="l9" clima="interior" cam={cam} cenario={<Anfiteatro3D />} desfoque={1.5}
      atores={[
        { quem: "chede", x: -3.2, y: a.y - 0.45, z: a.z, vista: "tresQuartos", expr: "cansado", corte: a.y + 0.74, pose: { olharX: 0.9, olharY: 0.3, cabeca: Math.sin(f / 18) * 4 } },
        { quem: "kaik", x: -2.1, y: a.y - 0.45, z: a.z, vista: "tresQuartos", expr: "feliz", corte: a.y + 0.74, pose: { olharX: -0.5, olharY: 0.4 } },
      ]}
    />
  );
};

// 10 · Fecha o olho e vê os olhos da fenda
export const L10_Olhos: React.FC = () => {
  const { f, p } = useP();
  const a = ASSENTO(3);
  const flash = f > 14 && f < 40;
  const cam = camEntre({ pos: [-4.6, a.y + 1.1, a.z - 1.5], alvo: [-3.2, a.y + 1.0, a.z], fov: 36 }, { pos: [-4.2, a.y + 1.05, a.z - 1.1], alvo: [-3.2, a.y + 1.0, a.z], fov: 32 }, p);
  return (
    <AbsoluteFill>
      <Plano3D id="l10" clima="interior" cam={cam} cenario={<Anfiteatro3D />} desfoque={5}
        atores={[{ quem: "chede", x: -3.2, y: a.y - 0.45, z: a.z, vista: "tresQuartos", expr: f > 40 ? "espanto" : "cansado", tremor: f > 40 && f < 50 ? Math.sin(f * 3) * 10 : 0, pose: { piscar: f > 10 && f < 42 ? 1 : 0, olharX: 0.6, cabeca: f > 40 ? -6 : 4 } }]}
      />
      {flash && (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, #2A1060 0%, #07020F 70%)" }}>
          <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
            <path d="M 140 900 Q 540 640 940 900 Q 540 1160 140 900 Z" fill="#0B0618" stroke="#A779FF" strokeWidth={10} />
            {[-1, 1].map((l) => (
              <g key={l} transform={`translate(${540 + l * 120},${900})`}>
                <ellipse rx={58} ry={interpolate(f, [14, 20], [2, 34], clamp)} fill="#E9F6FF" />
                <ellipse rx={22} ry={interpolate(f, [14, 20], [1, 30], clamp)} fill="#7FE7FF" />
                <ellipse rx={90} ry={60} fill="#B9F2FF" opacity={0.25} />
              </g>
            ))}
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// 11 · Lá fora, um carro preto parado
export const L11_CarroFora: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [7.2, 2.8, 2.6], alvo: [24, 0.9, 4], fov: 34 }, { pos: [8.3, 2.6, 2.9], alvo: [24, 0.9, 4], fov: 22 }, p);
  return (
    <Plano3D id="l11" clima="interior" cam={cam} cenario={<Anfiteatro3D />} semNeblina />
  );
};

// 12 · Intervalo: contou tudo (câmera gira em volta da mesa)
const MESA_ALT = 0.79;
const sentados = (exprC: Ator["expr"], exprK: Ator["expr"], poseK = {}, poseC = {}): Ator[] => [
  { quem: "chede", x: 0, z: -1.15, y: 0.0, vista: "tresQuartos", expr: exprC, corte: MESA_ALT, escala: 0.98, pose: { olharX: 0.9, ...poseC } },
  { quem: "kaik", x: 0, z: 1.15, y: 0.0, vista: "tresQuartos", espelhar: true, expr: exprK, corte: MESA_ALT, escala: 0.98, pose: { olharX: 0.9, ...poseK } },
];
export const L12_Intervalo: React.FC = () => {
  const { p, f } = useP();
  const fala = Math.sin(f / 4);
  return (
    <Plano3D id="l12" clima="dia" cam={orbita([0, 1.2, 0], lerp(-40, 0, p), 6.0, 1.75, 46, 1.2)} cenario={<Cantina3D />} desfoque={3}
      atores={sentados("medo", "feliz", {}, { ...mao("tresQuartos", -1, 260, -1000 + fala * 30) })}
    />
  );
};

// 13 · Kaik para de rir
const Salgado: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M 0 -60 Q 40 -10 36 30 Q 0 52 -36 30 Q -40 -10 0 -60 Z" fill="#D9892E" />
    <path d="M 0 -60 Q 20 -20 18 20" stroke="#F2B35A" strokeWidth={8} fill="none" />
  </g>
);
export const L13_Mora: React.FC = () => {
  const { p, f } = useP();
  const serio = f > 16;
  const cam = orbita([0, 1.3, 1.15], lerp(195, 185, p), lerp(2.2, 1.6, p), 1.35, 36, 1.3);
  return (
    <Plano3D id="l13" clima="dia" cam={cam} cenario={<Cantina3D />} desfoque={6}
      atores={[
        { quem: "kaik", x: 0, z: 1.15, vista: "tresQuartos", espelhar: true, expr: serio ? "medo" : "rindo", corte: MESA_ALT, pose: { ...mao("tresQuartos", -1, 200, -1240), olharX: 0.9 },
          extra: (s) => <Salgado x={-200 * s} y={-1240 * s} s={s * 1.4} /> },
      ]}
    />
  );
};

// 14 · A terceira ficha (lembrança)
export const L14_Ficha: React.FC = () => {
  const { p, f } = useP();
  const z = lerp(1, 1.12, p);
  return (
    <AbsoluteFill style={{ background: "#1A1420" }}>
      <AbsoluteFill style={{ filter: "grayscale(0.8) blur(6px) brightness(0.55)" }}>
        <Plano3D id="l14" clima="dia" cam={orbita([0, 1.2, 0], 10, 4.2, 1.7, 40, 1.25)} cenario={<Cantina3D />} atores={sentados("medo", "medo")} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${z}) rotate(${lerp(-5, -2, p)}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 760, height: 1000, background: "#EFE6D2", borderRadius: 18, boxShadow: "0 30px 80px rgba(0,0,0,.6)", position: "relative", ...fonte }}>
          <div style={{ position: "absolute", top: 50, left: 60, fontSize: 52, color: "#333" }}>CASO Nº 3</div>
          <div style={{ position: "absolute", top: 140, left: 60, width: 300, height: 380, background: "#555", filter: "blur(18px)" }}>
            <div style={{ position: "absolute", left: 70, top: 60, width: 160, height: 160, borderRadius: 80, background: "#C08A62" }} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "absolute", left: 400, top: 160 + i * 60, width: 290 - (i % 3) * 50, height: 22, background: "#9B9384" }} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 60, top: 600 + i * 70, width: 620 - (i % 2) * 140, height: 22, background: "#9B9384" }} />
          ))}
          <div style={{ position: "absolute", top: 700, left: 120, fontSize: 96, color: "#D9332B", border: "10px solid #D9332B", padding: "0 24px", transform: `rotate(-12deg) scale(${interpolate(f, [8, 14], [2, 1], clamp)})`, opacity: f > 8 ? 0.9 : 0 }}>
            NÃO ABORDAR
          </div>
        </div>
      </AbsoluteFill>
      <Info rotulo="TEM MAIS GENTE" valor="3+" y={160} centro cor={AMARELO} de={20} />
    </AbsoluteFill>
  );
};

// 15 · "a gente nem sabe do que é capaz" — Chede fecha a mão
export const L15_Capaz: React.FC = () => {
  const { p, f } = useP();
  const cam = orbita([0, 1.3, -1.15], lerp(-20, -8, p), lerp(2.0, 1.5, p), 1.4, 36, 1.3);
  const pe = projetar(cam, [0, 1.15, -1.15]);
  return (
    <Plano3D id="l15" clima="dia" cam={cam} cenario={<Cantina3D />} desfoque={6}
      atores={[{ quem: "chede", x: 0, z: -1.15, vista: "tresQuartos", expr: "determinado", corte: MESA_ALT, pose: { olharX: 0.9 } }]}
      frente={f > 10 ? <MaoFechada x={pe.x + 250} y={pe.y + 420} s={pe.pxPorMetro / 600} ang={-10} /> : null}
    />
  );
};

// 16 · Campo baldio: câmera desce do céu
export const L16_Campo: React.FC = () => {
  const { p } = useP();
  const cam = camEntre({ pos: [-6, 34, 30], alvo: [0, 0, -6], fov: 48 }, { pos: [-4.5, 1.8, 10], alvo: [0, 1.3, -4], fov: 46 }, p);
  return (
    <Plano3D id="l16" clima="porDoSol" cam={cam} cenario={<Campo3D />}
      atores={[
        { quem: "chede", x: -0.8, z: 3, vista: "tresQuartos", expr: "neutro", pose: { olharX: 0.5 } },
        { quem: "kaik", x: 0.8, z: 2.6, vista: "tresQuartos", expr: "feliz", espelhar: true },
      ]}
    />
  );
};

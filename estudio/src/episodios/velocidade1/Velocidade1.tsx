import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useVideoConfig } from "remotion";
import timing from "./timing.json";
import { Cabeca, Pose } from "../../personagens/Chede";
import { CabecaKaik } from "../../personagens/Kaik";
import { Quarto } from "../../cenarios/Quarto";
import { Banheiro, Cozinha, Predio, Rua } from "../../cenarios/Cenarios";
import { Fenda } from "../../efeitos/Fenda";
import { LinhasVento, Rastro } from "../../efeitos/Velocidade";
import { Celular, Despertador, Escova, Geladeira, Mesa, Papel, Passaro, Tenis } from "../../objetos/Objetos";
import { Acab, Camera, Flash, FPS, Legendas, Painel, Tela, Vivo, lerp, useP } from "../comum";
import {
  N0_Capa, N2_Escova, N3_Montagem, N6_Fome, N9_Aereo, N10_Parado, N11_Passaro, N12_Entra, N15_Puxa,
  N19_Sozinhos, N20_Filmava, N21_Parte3,
} from "./CenasNovas";

const T = timing as {
  duracao: number;
  linhas: { inicio: number; fim: number }[];
  palavras: { w: string; linha: number; destaque: string | null; inicio: number; fim: number }[];
};
export const DURACAO_VEL1 = Math.ceil((T.duracao + 1.2) * FPS);

const PAREDE_KAIK: [string, string] = ["#7E93AB", "#566A82"];
const CIANO = "#59D8FF";

// ciclo de corrida (vista de perfil, indo para a direita)
const corrida = (f: number, vel = 0.9): Pose => {
  const a = Math.sin(f * vel);
  return {
    tronco: 12,
    pernaD: 32 * a,
    pernaE: 32 * a,
    joelhoD: -10 - 55 * Math.max(0, -a),
    joelhoE: 10 + 55 * Math.max(0, a),
    bracoE: -45 * a,
    antebracoE: -85,
    bracoD: -45 * a,
    antebracoD: 75,
    olharX: 1,
  };
};

const Congelado: React.FC = () => (
  <AbsoluteFill style={{ background: "#7FB8FF", mixBlendMode: "color", opacity: 0.35, pointerEvents: "none" }} />
);

// ---------- cenas ----------
const C0_Capa: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]} tremor={0.3}>
        <Rua desfoque={10} dx={-f * 40} />
        <Tela>
          <Rastro dx={-70} n={6}>
            <Vivo quem="kaik" x={620} y={2020} s={0.8} vista="perfil" expr="determinado" pose={corrida(f)} semSombra />
          </Rastro>
          <LinhasVento dir={-1} />
        </Tela>
      </Camera>
      <Acab />
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center", textTransform: "uppercase" }}>
        <div style={{ position: "absolute", top: 120, width: "100%", fontSize: 86, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", transform: `scale(${pop(0)})` }}>
          E se você acordasse
        </div>
        <div style={{ position: "absolute", top: 220, width: "100%", fontSize: 118, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(5)}) rotate(-3deg)` }}>
          com super
          <br />
          <span style={{ color: "#BFF4FF", textShadow: `0 0 30px ${CIANO}, 0 0 60px ${CIANO}` }}>velocidade?</span>
        </div>
        <div style={{ position: "absolute", top: 1560, right: 70, fontSize: 130, color: "#FFD23F", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(14)}) rotate(-6deg)` }}>
          Parte 2
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cama: React.FC<{ children: React.ReactNode; tremorRelogio?: number }> = ({ children, tremorRelogio = 0 }) => (
  <>
    <rect x={700} y={1180} width={420} height={760} fill="#7A5236" />
    <rect x={700} y={1180} width={420} height={40} fill="#9A6B45" />
    <g transform="translate(880,1060) scale(0.9)">
      <Despertador tremor={tremorRelogio} />
    </g>
    <rect x={-40} y={1280} width={780} height={700} rx={30} fill="#F1EBDD" />
    <ellipse cx={240} cy={1270} rx={230} ry={90} fill="#FFFFFF" />
    {children}
    <path d="M -60 1330 Q 200 1280 760 1320 L 760 1960 L -60 1960 Z" fill="#C93A32" />
    <path d="M -60 1330 Q 200 1280 760 1320 L 760 1360 Q 200 1320 -60 1370 Z" fill="#E0574E" />
  </>
);

const C1_Atrasado: React.FC = () => {
  const { f, p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.12]} x={[0, -30]}>
        <Quarto desfoque={12} parede={PAREDE_KAIK} doKaik />
        <Tela>
          <Cama tremorRelogio={Math.sin(f * 1.9)}>
            <g transform="translate(250,1180) rotate(-78) scale(0.82)">
              <CabecaKaik expressao={p < 0.4 ? "cansado" : "espanto"} pose={{ piscar: p < 0.25 ? 1 : 0, olharX: 1 }} />
            </g>
          </Cama>
          <text x={880} y={900} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={110} fill="#FF4A3D" stroke="#000" strokeWidth={8} paintOrder="stroke">
            7:58
          </text>
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C2_Escova: React.FC = () => {
  const { f, p, d } = useP();
  if (p < 0.4) {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Camera z={[1.2, 1.3]}>
          <Quarto desfoque={14} parede={PAREDE_KAIK} doKaik />
          <Tela>
            <Cama>
              <g transform="translate(250,1180) rotate(-78) scale(0.82)">
                <CabecaKaik expressao="neutro" pose={{ piscar: p > 0.25 ? 1 : 0, olharX: 1 }} />
              </g>
            </Cama>
          </Tela>
        </Camera>
        <Acab feixe />
      </AbsoluteFill>
    );
  }
  return <N2_Escova quadroInicio={Math.round(0.4 * d)} />;
};

const C3_Montagem: React.FC = () => {
  const { f, p } = useP();
  const parte = Math.min(3, Math.floor(p * 4));
  const cron = (
    <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800 }}>
      <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", fontSize: 150, color: "#BFF4FF", WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>
        00:0{Math.min(2, Math.floor(p * 3))}
      </div>
    </AbsoluteFill>
  );
  let cena: React.ReactNode;
  if (parte === 0) {
    cena = (
      <>
        <Banheiro desfoque={10} />
        <Tela>
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={i} x1={300 + (i * 37) % 480} x2={300 + (i * 37) % 480} y1={((f * 40 + i * 90) % 1400) + 200} y2={((f * 40 + i * 90) % 1400) + 260} stroke="#BFE6FF" strokeWidth={6} opacity={0.7} />
          ))}
          <Rastro dx={-40} n={4}>
            <Vivo quem="kaik" x={540} y={2100} s={1.0} expr="feliz" />
          </Rastro>
        </Tela>
      </>
    );
  } else if (parte === 1) {
    cena = (
      <>
        <Quarto desfoque={10} parede={PAREDE_KAIK} doKaik />
        <Tela>
          <Rastro dx={60} n={5}>
            <Vivo quem="kaik" x={540} y={1960} s={1.0} expr="determinado" pose={{ bracoE: 160, antebracoE: 10, bracoD: 160, antebracoD: 10 }} />
          </Rastro>
        </Tela>
      </>
    );
  } else {
    cena = (
      <>
        <Cozinha desfoque={10} />
        <Tela>
          <Rastro dx={-50} n={5}>
            <g>
              <Vivo quem="kaik" x={540} y={2500} s={1.3} expr="feliz" pose={{ bracoE: 80, antebracoE: -150 }} />
              <g transform="translate(420,1080)">
                <rect x={-60} y={-70} width={120} height={140} rx={20} fill="#F2F4F8" />
                <path d="M 60 -30 Q 110 0 60 40" stroke="#F2F4F8" strokeWidth={18} fill="none" />
                {[0, 1].map((i) => (
                  <path key={i} d={`M ${-20 + i * 40} -90 q 20 -40 0 -80`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.6} />
                ))}
              </g>
            </g>
          </Rastro>
        </Tela>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]} tremor={0.4}>{cena}</Camera>
      {cron}
      <Acab />
    </AbsoluteFill>
  );
};

const C4_Tenis: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.18]}>
        <Quarto desfoque={18} parede={PAREDE_KAIK} doKaik />
        <Tela>
          <rect y={1300} width={1080} height={620} fill="#8A6446" />
          <g transform="translate(540,1320) scale(2)">
            <Tenis fumaca={(p * 2) % 1} />
          </g>
          <g transform="translate(540,1320) scale(2)">
            <Tenis fumaca={((p * 2) + 0.5) % 1} />
          </g>
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C5_Atrito: React.FC = () => {
  const { f, p } = useP();
  return (
    <Painel titulo="ATRITO = CALOR">
      <rect x={60} y={1150} width={960} height={30} fill="#8E97A8" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={((i * 120 - f * 40) % 1200 + 1200) % 1200 - 60} y={1186} width={60} height={8} fill="#5A6275" />
      ))}
      <g transform="translate(540,1150) scale(1.8)">
        <Tenis />
      </g>
      {[-260, -90, 80, 250].map((x, i) => (
        <path key={x} d={`M ${540 + x} 1100 q 30 -60 0 -120 q -30 -60 0 -120`} stroke={p > 0.2 ? "#FF7A3D" : "#FFB36B"}
          strokeWidth={14} fill="none" strokeLinecap="round" opacity={Math.min(1, p * 3)} transform={`translate(0,${-((f * 4 + i * 30) % 60)})`} />
      ))}
      <rect x={300} y={1210} width={480} height={60} rx={30} fill="#FF7A3D" opacity={0.3 + 0.5 * p} />
    </Painel>
  );
};

const C6_Fome: React.FC = () => {
  const { f, p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.08]}>
        <Cozinha desfoque={6} />
        <Tela>
          <g transform="translate(700,1160) scale(0.9)">
            <Geladeira comida={1 - p} />
          </g>
          <Rastro dx={30} n={p < 0.85 ? 4 : 0}>
            <Vivo quem="kaik" x={330} y={1980} s={0.95} vista="tresQuartos" expr={p < 0.85 ? "determinado" : "rindo"} pose={{ bracoD: 70 + Math.sin(f * 2) * 30, antebracoD: 20, olharX: 1 }} />
          </Rastro>
          {p > 0.3 && [0, 1, 2, 3].map((i) => (
            <circle key={i} cx={360 + i * 30} cy={1700 + (i % 2) * 20} r={8} fill="#B5651D" />
          ))}
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C7_Energia: React.FC = () => {
  const { p } = useP();
  const nivel = lerp(1, 0.08, p);
  const cor = nivel > 0.5 ? "#5BD66B" : nivel > 0.25 ? "#F2C14E" : "#FF4A3D";
  return (
    <Painel titulo="ENERGIA">
      <rect x={290} y={600} width={500} height={900} rx={50} fill="none" stroke="#E9EEF7" strokeWidth={20} />
      <rect x={440} y={540} width={200} height={60} rx={20} fill="#E9EEF7" />
      <rect x={320} y={630 + 840 * (1 - nivel)} width={440} height={840 * nivel} rx={30} fill={cor} />
      <text x={540} y={1620} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={60} fill="#E9EEF7">
        1 DIA → MINUTOS
      </text>
    </Painel>
  );
};

const TelaFoto: React.FC = () => (
  <g>
    <rect width={212} height={444} fill="#F2D9A6" />
    <g transform="translate(70,200) scale(0.22)">
      <CabecaKaik expressao="rindo" pose={{}} />
    </g>
    <g transform="translate(145,205) scale(0.22)">
      <Cabeca expressao="feliz" pose={{}} />
    </g>
    <rect y={330} width={212} height={114} fill="#14161E" />
    <text x={106} y={380} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={34} fill="#fff">CHEDE</text>
    <circle cx={106} cy={415} r={14} fill="#5BD66B" />
  </g>
);

const C8_Chede: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1, 1.12]}>
      <Quarto desfoque={18} parede={PAREDE_KAIK} doKaik />
      <Tela>
        <g transform="translate(540,960) scale(2.6) rotate(-5)">
          <Celular tela={<TelaFoto />} />
        </g>
      </Tela>
    </Camera>
    <Acab />
  </AbsoluteFill>
);

const C9_Corre: React.FC = () => {
  const { f } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.06]} tremor={0.5}>
        <Rua desfoque={12} dx={-f * 70} />
        <Tela>
          <Rastro dx={-90} n={7}>
            <Vivo quem="kaik" x={600} y={1900} s={0.9} vista="perfil" expr="feliz" pose={corrida(f, 1.2)} semSombra />
          </Rastro>
          <LinhasVento dir={-1} n={18} />
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={((i * 260 - f * 30) % 1200 + 1200) % 1200} cy={1500 - ((f * 6 + i * 50) % 300)} rx={18} ry={9} fill="#6E8A3E" transform={`rotate(${f * 10 + i * 40})`} />
          ))}
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const C10_Parado: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1, 1.1]}>
      <Rua desfoque={3} dx={-300} />
      <Tela>
        <Vivo quem="kaik" x={540} y={1900} s={0.95} expr="espanto" pose={{ olharX: -1, cabeca: -6 }} />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={220 + i * 300} cy={1340 + (i % 2) * 40} rx={18} ry={9} fill="#6E8A3E" transform={`rotate(${i * 40} ${220 + i * 300} 1340)`} />
        ))}
      </Tela>
    </Camera>
    <Congelado />
    <Acab />
  </AbsoluteFill>
);

const C11_Passaro: React.FC = () => {
  const { f, p } = useP();
  const toque = p > 0.55;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.12]} x={[0, -40]}>
        <Rua desfoque={6} dx={-300} chuva />
        <Tela>
          {Array.from({ length: 40 }).map((_, i) => (
            <ellipse key={i} cx={(i * 211) % 1080} cy={200 + ((i * 337) % 1300)} rx={6} ry={16} fill="#D6F0FF" opacity={0.75} />
          ))}
          <g transform="translate(330,640) scale(1.4)">
            <Passaro />
          </g>
          <Vivo quem="kaik" x={430} y={2350} s={1.2} vista="tresQuartos" expr={toque ? "rindo" : "espanto"} pose={{ bracoD: 125, antebracoD: 10, olharX: 1, olharY: -0.6 }} />
          <g transform={`translate(905,${720}) scale(${toque ? 1 + Math.sin(f) * 0.15 : 1},${toque ? 1 - Math.sin(f) * 0.15 : 1})`}>
            <ellipse rx={34} ry={46} fill="#BFE6FF" stroke="#fff" strokeWidth={4} />
          </g>
        </Tela>
      </Camera>
      <Congelado />
      <Acab />
    </AbsoluteFill>
  );
};

const POSE_MESA: Pose = { bracoD: 30, antebracoD: 40, bracoE: 10, olharX: 1, olharY: 1 };

const C12_Entra: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.06]}>
        <Quarto desfoque={7} />
        <Tela>
          <rect x={-40} y={700} width={260} height={860} fill="#3E2A1C" />
          <rect x={-20} y={720} width={220} height={840} fill="#2A1C12" />
          <Rastro dx={-60} n={p < 0.6 ? 5 : 0}>
            <Vivo quem="kaik" x={lerp(-200, 360, p * 1.6)} y={1960} s={0.95} vista="tresQuartos" expr="feliz" pose={{ olharX: 1 }} />
          </Rastro>
        </Tela>
      </Camera>
      <Congelado />
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C13_Buraco: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1, 1.15]} x={[0, -60]}>
      <Quarto desfoque={9} />
      <Tela>
        <Vivo quem="chede" x={400} y={2100} s={0.95} vista="tresQuartos" expr="medo" pose={{ ...POSE_MESA, tronco: -12 }} parado />
        <g transform="translate(560,1340) scale(1.1)">
          <Mesa />
        </g>
        <Fenda x={890} y={1345} tamanho={0.5} />
      </Tela>
    </Camera>
    <Congelado />
    <Acab feixe />
  </AbsoluteFill>
);

const Dedos: React.FC<{ g: number }> = ({ g }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const yy = 1140 - i * 70;
      const alcance = Math.min(1, Math.max(0, g * 1.6 - i * 0.18));
      return (
        <g key={i} opacity={alcance > 0 ? 1 : 0}>
          <path d={`M 420 ${yy + 40} Q 430 ${yy - 10} ${420 + 220 * alcance} ${yy - 20}`} stroke="#140A24" strokeWidth={24} strokeLinecap="round" fill="none" />
          <circle cx={420 + 220 * alcance} cy={yy - 20} r={9} fill="#C9A6FF" opacity={alcance} />
        </g>
      );
    })}
    <path d="M 650 1170 Q 700 1100 640 1060" stroke="#140A24" strokeWidth={28} strokeLinecap="round" fill="none" />
  </g>
);

const MesaClose: React.FC<{ fenda: number; children?: React.ReactNode }> = ({ fenda, children }) => (
  <>
    <g transform="translate(540,1150) scale(2.4)">
      <Mesa />
    </g>
    {fenda > 0 && <ellipse cx={540} cy={1190} rx={300 * fenda} ry={70 * fenda} fill="#0B0618" />}
    {fenda > 0 && <Fenda x={540} y={1190} tamanho={1.6 * fenda} />}
    {children}
  </>
);

const C14_Dedos: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.1, 1.22]}>
        <Quarto desfoque={18} />
        <Tela>
          <MesaClose fenda={1}>
            <rect x={470} y={0} width={140} height={1190 + p * 60} rx={60} fill="#9A6340" />
            <Dedos g={1} />
          </MesaClose>
        </Tela>
      </Camera>
      <Congelado />
      <Acab />
    </AbsoluteFill>
  );
};

const C15_Puxa: React.FC = () => {
  const { p } = useP();
  const k = Math.min(1, p * 1.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.1]} tremor={1.2}>
        <Quarto desfoque={9} />
        <Tela>
          <g transform="translate(560,1340) scale(1.1)">
            <Mesa />
          </g>
          <Fenda x={890} y={1345} tamanho={lerp(0.5, 0.2, k)} />
          <Vivo quem="chede" x={lerp(560, 420, k)} y={2060} s={0.85} vista="tresQuartos" expr="espanto" pose={{ tronco: -18, bracoD: lerp(30, 80, k), antebracoD: 0 }} />
          <Rastro dx={-50} n={4}>
            <Vivo quem="kaik" x={lerp(320, 200, k)} y={2060} s={0.85} vista="tresQuartos" expr="determinado" pose={{ tronco: -20, bracoD: 70, antebracoD: 10, bracoE: -60, antebracoE: -30 }} />
          </Rastro>
          <LinhasVento dir={1} n={10} />
        </Tela>
      </Camera>
      <Flash cor={CIANO} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C16_Estalo: React.FC = () => {
  const { p } = useP();
  const fenda = Math.max(0, 1 - p * 3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.15, 1.05]} tremor={p < 0.4 ? 1.5 : 0}>
        <Quarto desfoque={18} />
        <Tela>
          <MesaClose fenda={fenda} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${540 + (i - 2) * 120 * (1 + p * 3)},${1100 - p * (300 + i * 80)}) scale(0.7)`}>
              <Papel r={i * 50 + p * 400} />
            </g>
          ))}
        </Tela>
      </Camera>
      <Flash cor="#E9DCFF" quadros={8} />
      <Acab />
    </AbsoluteFill>
  );
};

const C17_Chao: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1.15, 1.0]}>
      <Tela>
        <rect width={1080} height={1920} fill="#8A6446" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={i * 120} width={4} height={1920} fill="#6E4E36" />
        ))}
        <Vivo quem="kaik" x={420} y={1500} s={0.62} expr="cansado" pose={{ bracoE: 40, bracoD: 20 }} semSombra />
        <Vivo quem="chede" x={680} y={1520} s={0.62} expr="cansado" pose={{ bracoD: 50, bracoE: 15 }} semSombra />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${200 + i * 330},${400 + (i % 2) * 900}) scale(0.6)`}>
            <Papel r={i * 70} />
          </g>
        ))}
      </Tela>
    </Camera>
    <Acab />
  </AbsoluteFill>
);

const C18_Tambem: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1, 1.1]}>
      <Quarto desfoque={14} />
      <Tela>
        <Vivo quem="kaik" x={290} y={2300} s={0.98} vista="tresQuartos" expr="espanto" pose={{ olharX: 1 }} />
        <Vivo quem="chede" x={800} y={2300} s={0.98} vista="tresQuartos" expr="espanto" pose={{ olharX: 1 }} espelhar />
      </Tela>
    </Camera>
    <Acab feixe />
  </AbsoluteFill>
);

const JANELA = { x: 665, y: 805 };
const zoomEm = (s: number) => ({ x: -(JANELA.x - 540) * (s - 1), y: -(JANELA.y - 864) * (s - 1) });

const C19_Sozinhos: React.FC = () => {
  const { f, p } = useP();
  const s = lerp(2.6, 1.0, p);
  const t = zoomEm(s);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${t.x}px,${t.y}px) scale(${s})`, transformOrigin: "50% 45%" }}>
        <Predio f={f} />
      </AbsoluteFill>
      <Acab />
    </AbsoluteFill>
  );
};

const C20_Filmava: React.FC = () => {
  const { f, p } = useP();
  const s = lerp(1.0, 2.6, p);
  const t = zoomEm(s);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${t.x}px,${t.y}px) scale(${s})`, transformOrigin: "50% 45%" }}>
        <Predio vigia={1} f={f} />
      </AbsoluteFill>
      <Flash cor="#FF4A3D" quadros={5} de={Math.round(FPS * 0.6)} />
      <Acab graoForte />
    </AbsoluteFill>
  );
};

const C21_Parte2: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 10, fps, config: { damping: 10 } });
  const t = zoomEm(2.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${t.x}px,${t.y}px) scale(2.6)`, transformOrigin: "50% 45%", filter: "brightness(0.45)" }}>
        <Predio vigia={1} f={f} desfoque={3} />
      </AbsoluteFill>
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center" }}>
        <div style={{ position: "absolute", top: 1450, width: "100%", fontSize: 190, color: "#FFD23F", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${sp}) rotate(-4deg)` }}>
          PARTE 3
        </div>
      </AbsoluteFill>
      <Acab graoForte />
    </AbsoluteFill>
  );
};

const C6_FomeNova: React.FC = () => <N6_Fome Geladeira={Geladeira} />;

// Versão 2 (estilo da referência 2): cenas de rua em 3D, eletricidade ciano, objetos presos na mão.
const CENAS: React.FC[] = [
  N0_Capa, C1_Atrasado, C2_Escova, N3_Montagem, C4_Tenis, C5_Atrito, C6_FomeNova, C7_Energia, C8_Chede, N9_Aereo, N10_Parado,
  N11_Passaro, N12_Entra, C13_Buraco, C14_Dedos, N15_Puxa, C16_Estalo, C17_Chao, C18_Tambem, N19_Sozinhos, N20_Filmava,
  N21_Parte3,
];
// cenas antigas guardadas (versão 1), fora do vídeo
export const CENAS_V1 = [C0_Capa, C3_Montagem, C6_Fome, C9_Corre, C10_Parado, C11_Passaro, C12_Entra, C15_Puxa, C19_Sozinhos, C20_Filmava, C21_Parte2];

export const Velocidade1: React.FC<{ trilha?: boolean }> = ({ trilha = true }) => {
  const inicios = T.linhas.map((l, i) => (i === 0 ? 0 : Math.round(l.inicio * FPS) - 2));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map((Cena, i) => {
        const de = inicios[i];
        const ate = i + 1 < inicios.length ? inicios[i + 1] : DURACAO_VEL1;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, ate - de)}>
            <Cena />
          </Sequence>
        );
      })}
      <Legendas palavras={T.palavras} duracao={T.duracao} />
      <Audio src={staticFile("velocidade1/narracao.mp3")} />
      {trilha && <Audio src={staticFile("velocidade1/trilha.wav")} />}
    </AbsoluteFill>
  );
};

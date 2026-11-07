import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useVideoConfig } from "remotion";
import timing from "./timing.json";
import { Cabeca, Pose } from "../../personagens/Chede";
import { CabecaKaik } from "../../personagens/Kaik";
import { CabecaAgente } from "../../personagens/Agente";
import { corridaForte } from "../../personagens/poses";
import { Quarto } from "../../cenarios/Quarto";
import { Rua3D, projetar, janelaVigia, Cam } from "../../cenarios3d/Rua3D";
import { Fenda } from "../../efeitos/Fenda";
import { LinhasVento } from "../../efeitos/Velocidade";
import { Celular, MaoClose } from "../../objetos/Objetos";
import { Gradacao, Grao, Poeira } from "../../estilo/Acabamento";
import { Acab, Camera, Flash, FPS, Legendas, Painel, Tela, Vivo, alcançar, lerp, useP, clamp } from "../comum";
import { KaikEletrico, MaoFechada, Vigia3D } from "../velocidade1/CenasNovas";

// Parte 3 · "E se filmassem o seu poder?" (Chede + Kaik). O Regente NÃO aparece.
const T = timing as {
  duracao: number;
  linhas: { inicio: number; fim: number }[];
  palavras: { w: string; linha: number; destaque: string | null; inicio: number; fim: number }[];
};
export const DURACAO_VIG3 = Math.ceil((T.duracao + 1.0) * FPS);

const CIANO = "#59D8FF";
const AMBAR = "#FFB21E";
const ROXO = "#7B4DFF";
const fonte = { fontFamily: "'Roboto Condensed'", fontWeight: 800 } as const;
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });
const numBR = (n: number) => Math.round(n).toLocaleString("pt-BR");

// Número grande com rótulo pequeno (estilo infográfico)
const Info: React.FC<{ rotulo: string; valor: string; unidade?: string; x: number; y: number; cor?: string; tam?: number }> = ({
  rotulo, valor, unidade, x, y, cor = "#fff", tam = 150,
}) => (
  <div style={{ position: "absolute", left: x, top: y, ...fonte, color: cor, lineHeight: 1 }}>
    <div style={{ fontSize: tam * 0.3, color: "#fff", letterSpacing: 2, ...contorno(6) }}>{rotulo}</div>
    <div style={{ fontSize: tam, ...contorno(10) }}>
      {valor}
      {unidade && <span style={{ fontSize: tam * 0.4, color: "#fff" }}> {unidade}</span>}
    </div>
  </div>
);

// Selo de engajamento (sem @, a pedido do usuário)
const SeloSegue: React.FC<{ top?: number }> = ({ top = 70 }) => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 6, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${sp})` }}>
      <div style={{ ...fonte, fontSize: 52, color: "#111", background: "#FFD23F", borderRadius: 60, padding: "14px 40px",
        border: "6px solid #000", boxShadow: "0 8px 0 rgba(0,0,0,0.5)", transform: `translateY(${Math.sin(f / 5) * 6}px)` }}>
        SEGUE PRA VER A PARTE 4 ▶
      </div>
    </div>
  );
};

// ---------- cenários próprios ----------
// Apartamento do prédio da frente, por dentro (meia-luz, janela clara ao fundo)
const ApDentro: React.FC<{ desfoque?: number }> = ({ desfoque = 8 }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${desfoque}px)` }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#2C303C" />
      <rect x={560} y={260} width={460} height={900} fill="#C9D9E6" />
      <rect x={580} y={280} width={420} height={860} fill="#E9C9A0" />
      <rect x={580} y={720} width={420} height={420} fill="#D9A97A" />
      <path d="M 580 720 L 790 560 L 1000 720 Z" fill="#9E4B3A" />
      <rect x={640} y={800} width={120} height={140} fill="#F6E3B4" />
      <rect x={780} y={280} width={16} height={860} fill="#3A3F4E" />
      <rect x={560} y={700} width={460} height={16} fill="#3A3F4E" />
      <path d="M 520 220 Q 560 700 500 1220 L 600 1220 Q 640 700 600 220 Z" fill="#4A2F3A" />
      <path d="M 980 220 Q 1060 700 1000 1220 L 1080 1220 L 1080 220 Z" fill="#4A2F3A" />
      <rect y={1300} width={1080} height={620} fill="#1C1F28" />
      <path d="M 560 1300 L 1020 1300 L 1080 1920 L 380 1920 Z" fill="#E9C9A0" opacity={0.12} />
      <rect x={40} y={980} width={300} height={320} rx={10} fill="#22252F" />
    </svg>
  </div>
);

// Carro preto de lado (unidades: cm; origem = centro das rodas no chão)
const CarroPreto: React.FC<{ farol?: number }> = ({ farol = 0 }) => (
  <g>
    <ellipse cx={0} cy={6} rx={250} ry={18} fill="#000" opacity={0.35} />
    <path d="M -230 -40 L -225 -95 Q -215 -110 -180 -112 L -110 -116 L -60 -160 Q -40 -170 0 -170 L 80 -170 Q 110 -168 130 -150 L 175 -116 L 215 -110 Q 235 -100 235 -70 L 232 -40 Z" fill="#101116" />
    <path d="M -90 -118 L -52 -154 Q -40 -162 -10 -162 L 20 -162 L 20 -118 Z" fill="#2A2F3C" />
    <path d="M 32 -118 L 32 -162 L 78 -162 Q 104 -160 120 -146 L 150 -118 Z" fill="#2A2F3C" />
    <path d="M -80 -122 L -60 -142 L -40 -142 L -62 -122 Z" fill="#fff" opacity={0.12} />
    <rect x={-230} y={-60} width={466} height={8} fill="#1C1E26" />
    {[-150, 150].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-30} r={34} fill="#050506" />
        <circle cx={x} cy={-30} r={16} fill="#4A4D57" />
      </g>
    ))}
    <rect x={222} y={-92} width={14} height={18} rx={4} fill="#FFF3C4" />
    <rect x={-236} y={-92} width={12} height={16} rx={4} fill="#C0262B" />
    {farol > 0 && <path d="M 236 -84 L 520 -150 L 520 -10 Z" fill="#FFF3C4" opacity={0.25 * farol} />}
  </g>
);

// ---------- cenas ----------
const S0_Capa: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: f - d, fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Vigia3D de={0.78} ate={0.9} vigia />
      <AbsoluteFill style={{ ...fonte, textAlign: "center", textTransform: "uppercase" }}>
        <div style={{ position: "absolute", top: 120, width: "100%", fontSize: 96, color: "#fff", ...contorno(10), transform: `scale(${pop(0)})` }}>
          E se filmassem
        </div>
        <div style={{ position: "absolute", top: 230, width: "100%", fontSize: 130, lineHeight: 1.05, color: "#fff", ...contorno(12), transform: `scale(${pop(5)}) rotate(-3deg)` }}>
          o seu{" "}
          <span style={{ color: "#FFE3A6", textShadow: `0 0 30px ${AMBAR}, 0 0 60px ${AMBAR}` }}>poder?</span>
        </div>
        <div style={{ position: "absolute", top: 1560, right: 70, fontSize: 130, color: "#FFD23F", ...contorno(12), transform: `scale(${pop(14)}) rotate(-6deg)` }}>
          Parte 3
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const S1_LuzVermelha: React.FC = () => (
  <AbsoluteFill>
    <Vigia3D de={-0.25} ate={0.15} vigia />
    <Tela>
      <Vivo quem="chede" x={250} y={2500} s={1.25} vista="costas" pose={{ cabeca: 4 }} />
    </Tela>
  </AbsoluteFill>
);

const TelaRec: React.FC = () => (
  <g>
    <rect width={212} height={444} fill="#E9C9A0" />
    <rect y={200} width={212} height={244} fill="#D9A97A" />
    <path d="M 0 200 L 106 120 L 212 200 Z" fill="#9E4B3A" />
    <rect x={56} y={250} width={100} height={110} fill="#F6E3B4" />
    <rect x={78} y={290} width={16} height={60} rx={6} fill="#F07C28" />
    <circle cx={86} cy={282} r={10} fill="#9A6340" />
    <rect x={112} y={290} width={16} height={60} rx={6} fill="#2F6FD6" />
    <circle cx={120} cy={282} r={10} fill="#F1CBAE" />
    {[0, 1].map((i) => <rect key={i} x={40 + i * 120} y={60} width={2} height={300} fill="#fff" opacity={0.3} />)}
  </g>
);

const S2_Gravando: React.FC = () => {
  const { f } = useP();
  return (
    <AbsoluteFill style={{ background: "#0B0C12" }}>
      <Camera z={[1.05, 1.2]}>
        <Tela>
          <rect width={1080} height={1920} fill="#0F1118" />
          <g transform="translate(540,900) scale(2.3) rotate(4)">
            <Celular tela={<TelaRec />} gravando brilho={Math.floor(f / 8) % 2 ? 1 : 0.3} />
          </g>
          {/* vidro da janela com reflexo */}
          <path d="M 80 0 L 300 0 L 0 700 L 0 360 Z" fill="#fff" opacity={0.07} />
          <path d="M 700 0 L 780 0 L 300 1920 L 220 1920 Z" fill="#fff" opacity={0.05} />
          <rect x={0} y={0} width={60} height={1920} fill="#1C1F28" />
          <rect x={1020} y={0} width={60} height={1920} fill="#1C1F28" />
        </Tela>
      </Camera>
      <Flash cor="#FF4A3D" quadros={4} de={8} />
      <Acab graoForte />
    </AbsoluteFill>
  );
};

const S3_Comigo: React.FC = () => {
  const { f, p } = useP();
  const estalo = Math.sin(f * 0.5) * (p < 0.5 ? 10 : 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.15]}>
        <Quarto desfoque={12} />
        <Tela>
          <Vivo quem="chede" x={820} y={2250} s={0.98} vista="tresQuartos" expr="medo" pose={{ olharX: 1 }} espelhar />
          <KaikEletrico x={330} y={2250} s={0.98} vista="tresQuartos" expr="determinado" forca={lerp(0, 1.3, p * 1.4)}
            pose={{ cabeca: estalo, bracoD: 20, antebracoD: 120, bracoE: 20, antebracoE: 110, olharX: 1 }} id="com" />
        </Tela>
      </Camera>
      <Flash cor={CIANO} quadros={6} de={Math.round(0.8 * 30)} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

const S4_Reacao: React.FC = () => {
  const { p } = useP();
  const k = interpolate(p, [0.15, 0.85], [0, 1], clamp);
  // caminho do olho até o fundo do cérebro
  const ax = 330, ay = 900, bx = 640, by = 860;
  const px = ax + (bx - ax) * k;
  const py = ay + (by - ay) * k - Math.sin(k * Math.PI) * 60;
  return (
    <AbsoluteFill>
      <Painel titulo="TEMPO DE REAÇÃO">
        <g fill="none" stroke="#8FD3FF" strokeWidth={8} opacity={0.9}>
          <path d="M 560 520 C 760 520 840 680 820 860 C 810 960 760 1020 740 1100 L 760 1260 L 560 1260 L 540 1160 C 460 1160 420 1120 420 1060 L 400 1000 L 360 980 L 400 940 C 330 900 320 860 340 820 C 360 640 420 520 560 520 Z" />
        </g>
        <ellipse cx={620} cy={800} rx={170} ry={130} fill="#8FD3FF" opacity={0.12} stroke="#8FD3FF" strokeWidth={4} />
        <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${ay - 120} ${bx} ${by}`} stroke="#8FD3FF" strokeWidth={4} strokeDasharray="14 12" fill="none" opacity={0.6} />
        <circle cx={ax} cy={ay} r={22} fill="#fff" />
        {/* luz chegando ao olho */}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={60} y1={860 + i * 40} x2={ax - 30} y2={ay - 10 + i * 10} stroke="#FFF6D8" strokeWidth={6} opacity={0.7} />
        ))}
        <circle cx={px} cy={py} r={26} fill="#FFF6D8" opacity={k > 0 && k < 1 ? 1 : 0} />
        <circle cx={px} cy={py} r={60} fill="#FFF6D8" opacity={k > 0 && k < 1 ? 0.25 : 0} />
        {k >= 1 && <circle cx={bx} cy={by} r={90} fill="#FFD23F" opacity={0.35} />}
      </Painel>
      <Info rotulo="REAÇÃO" valor={(0.2 * k).toFixed(1).replace(".", ",")} unidade="s" x={110} y={1450} cor="#FFD23F" />
    </AbsoluteFill>
  );
};

const S5_Cruza: React.FC = () => {
  const { f, p } = useP();
  const cam: Cam = { pos: [1.5, 24, -7 - p * 2], alvo: [1.5, 0, -24], fov: 52 };
  const A: [number, number, number] = [-7, 0, -23];
  const B: [number, number, number] = [10.4, 0, -24];
  const k = interpolate(p, [0.1, 0.45], [0, 1], clamp);
  const pos: [number, number, number] = [A[0] + (B[0] - A[0]) * k, 0, A[2] + (B[2] - A[2]) * k];
  const a = projetar(cam, A);
  const b = projetar(cam, B);
  const c = projetar(cam, pos);
  const s = (c.pxPorMetro * 1.75) / 1700;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Rua3D cam={cam} predio />
      <Tela>
        <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={CIANO} strokeWidth={34} strokeLinecap="round" opacity={0.35} />
        <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#E8FCFF" strokeWidth={10} strokeLinecap="round" />
        {k < 1 && <KaikEletrico x={c.x} y={c.y} s={s} vista="perfil" expr="determinado" pose={corridaForte(f)} faiscas id="cru" />}
        {/* cota de 40 m */}
        <g stroke="#fff" strokeWidth={5}>
          <line x1={a.x} y1={a.y + 120} x2={b.x} y2={b.y + 120} />
          <line x1={a.x} y1={a.y + 95} x2={a.x} y2={a.y + 145} />
          <line x1={b.x} y1={b.y + 95} x2={b.x} y2={b.y + 145} />
        </g>
        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 200} textAnchor="middle" {...fonte} fontSize={80} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">40 m</text>
      </Tela>
      <Gradacao />
      <Grao />
      <Info rotulo="KAIK" valor={(0.1 * k).toFixed(1).replace(".", ",")} unidade="s" x={70} y={110} cor={CIANO} />
    </AbsoluteFill>
  );
};

const S6_Som: React.FC = () => {
  const { f, p } = useP();
  const zK = 6 - f * 1.1;
  const cam: Cam = { pos: [-3.6, 0.8, zK + 0.9], alvo: [0, 1.15, zK - 0.3], fov: 55 };
  const k = projetar(cam, [0, 0, zK]);
  const s = (k.pxPorMetro * 1.75) / 1700;
  const vel = interpolate(p, [0, 0.7], [1100, 1440], clamp);
  const passou = vel >= 1235;
  const cx = k.x + 60 * s * 10;
  const cy = k.y - 1000 * s;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Rua3D cam={cam} />
      <Tela>
        <LinhasVento dir={1} n={18} />
        <KaikEletrico x={k.x} y={k.y} s={s} vista="perfil" expr="determinado" pose={corridaForte(f)} espelhar faiscas id="som" />
        {passou && (
          <g opacity={0.9}>
            {/* cone de choque */}
            <path d={`M ${cx} ${cy} L ${cx - 900} ${cy - 700}`} stroke="#fff" strokeWidth={10} opacity={0.8} />
            <path d={`M ${cx} ${cy} L ${cx - 900} ${cy + 700}`} stroke="#fff" strokeWidth={10} opacity={0.8} />
            {[0, 1, 2, 3].map((i) => {
              const r = ((f * 30 + i * 90) % 360) + 60;
              return <circle key={i} cx={cx - r * 0.9} cy={cy} r={r} fill="none" stroke="#DFF6FF" strokeWidth={6} opacity={0.5 * (1 - r / 420)} />;
            })}
          </g>
        )}
      </Tela>
      {passou && <Flash cor="#FFFFFF" quadros={6} de={Math.round(0.45 * 69)} />}
      <Gradacao />
      <Grao />
      <Info rotulo="KAIK" valor={numBR(vel)} unidade="km/h" x={70} y={110} cor={passou ? "#FF4A3D" : "#FFD23F"} />
      <Info rotulo="VELOCIDADE DO SOM" valor="1.235" unidade="km/h" x={70} y={360} tam={90} />
    </AbsoluteFill>
  );
};

const S7_Janelas: React.FC = () => {
  const { f, p } = useP();
  const cam: Cam = { pos: [-3, 1.6, -6], alvo: [5, 2.4, -16], fov: 58 };
  const origens = [
    [180, 760], [420, 640], [700, 820], [920, 600], [300, 1040], [820, 1080],
  ];
  const onda = f * 70;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera tremor={p < 0.5 ? 2 : 0.4} z={[1.04, 1.08]}>
        <Rua3D cam={cam} predio />
        <Tela>
          <circle cx={540} cy={900} r={onda} fill="none" stroke="#fff" strokeWidth={30} opacity={Math.max(0, 0.6 - onda / 2200)} />
          {origens.map(([ox, oy], i) => {
            const t0 = i * 4;
            const t = f - t0;
            if (t < 0) return null;
            return (
              <g key={i}>
                <rect x={ox - 70} y={oy - 80} width={140} height={160} fill="#fff" opacity={Math.max(0, 0.8 - t / 8)} />
                {Array.from({ length: 12 }).map((_, j) => {
                  const ang = (j / 12) * Math.PI * 2 + i;
                  const v = 14 + (j % 4) * 6;
                  const x = ox + Math.cos(ang) * v * t;
                  const y = oy + Math.sin(ang) * v * t * 0.6 + 0.9 * t * t;
                  return (
                    <path key={j} d="M 0 -18 L 14 10 L -12 14 Z" fill="#DFF3FF" stroke="#fff" strokeWidth={2}
                      transform={`translate(${x},${y}) rotate(${t * 25 + j * 40}) scale(${1 + (j % 3) * 0.4})`} opacity={Math.max(0, 1 - t / 50)} />
                  );
                })}
              </g>
            );
          })}
        </Tela>
      </Camera>
      <Flash cor="#FFFFFF" quadros={5} />
      <Gradacao />
      <Grao />
    </AbsoluteFill>
  );
};

const POSE_FILMANDO = (() => {
  const ik = alcançar("tresQuartos", 1, 330, -1330);
  return { ik, pose: { bracoD: ik.braco, antebracoD: ik.antebraco, oculos: 1, olharX: 1 } as Pose };
})();

const S8_Terno: React.FC = () => {
  const { p } = useP();
  const X = 560, Y = 2080, S = 1.0;
  const mx = X + 330 * S, my = Y - 1330 * S;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.0, 1.1]} x={[0, -20]}>
        <ApDentro desfoque={7} />
        <Tela>
          <Vivo quem="agente" x={X} y={Y} s={S} vista="tresQuartos" expr="neutro" pose={POSE_FILMANDO.pose} parado />
          <g transform={`translate(${mx + 10},${my - 40}) scale(0.32)`}>
            <Celular gravando />
          </g>
          <KaikEletrico x={190} y={2080} s={0.95} vista="tresQuartos" expr="espanto" pose={{ olharX: 1 }} forca={lerp(1.4, 0.4, p * 2)} id="ter" />
        </Tela>
      </Camera>
      <Flash cor={CIANO} quadros={6} />
      <Acab />
    </AbsoluteFill>
  );
};

const CloseAgente: React.FC<{ oculos: number; controlado: number; expr?: "neutro" | "espanto" | "medo"; piscar?: number; olharX?: number; brilho?: number }> = ({
  oculos, controlado, expr = "neutro", piscar = 0, olharX = 0, brilho = 0,
}) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1.0, 1.08]}>
      <ApDentro desfoque={16} />
      <Tela>
        <rect x={300} y={1380} width={480} height={600} rx={120} fill="#15161B" />
        <path d="M 470 1380 L 610 1380 L 540 1560 Z" fill="#ECECE8" />
        <g transform="translate(540,960) scale(2.15)">
          <CabecaAgente expressao={expr} pose={{ oculos, controlado, piscar, olharX }} />
        </g>
        {brilho > 0 && [-159, 159].map((dx) => (
          <circle key={dx} cx={540 + dx} cy={1003} r={70} fill={AMBAR} opacity={0.18 * brilho} />
        ))}
      </Tela>
    </Camera>
    <Acab graoForte />
  </AbsoluteFill>
);

const S9_Anel: React.FC = () => {
  const { p, f } = useP();
  const oc = interpolate(p, [0.1, 0.45], [1, 0], clamp);
  const ctl = interpolate(p, [0.35, 0.55], [0, 1], clamp);
  return <CloseAgente oculos={oc} controlado={ctl} brilho={ctl * (0.6 + 0.4 * Math.sin(f / 4))} />;
};

const S10_Voltou: React.FC = () => {
  const { f, p } = useP();
  const ik = alcançar("tresQuartos", 1, 300, -1250);
  const X = 400, Y = 2200, S = 0.98;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]}>
        <Quarto desfoque={12} />
        <Tela>
          <Vivo quem="chede" x={850} y={Y} s={S} vista="tresQuartos" expr="espanto" pose={{ olharX: 1 }} espelhar />
          <KaikEletrico x={X} y={Y} s={S} vista="tresQuartos" expr="rindo" pose={{ bracoD: ik.braco, antebracoD: ik.antebraco, olharX: 1 }} forca={lerp(1.5, 0.3, p * 2)} id="vol" />
          <g transform={`translate(${X + 300 * S},${Y - 1300 * S}) scale(0.3)`}>
            <Celular gravando brilho={0.3} />
          </g>
          <MaoFechada x={X + 300 * S} y={Y - 1250 * S} s={S * 0.8} ang={0} />
          {[0, 1, 2, 3].map((i) => {
            const t = ((f * 2 + i * 15) % 60) / 60;
            return <circle key={i} cx={X + (i - 1.5) * 50 + Math.sin(f / 5 + i) * 10} cy={Y - 1720 * S - t * 220} r={30 + t * 50} fill="#BDBDBD" opacity={0.5 * (1 - t)} />;
          })}
        </Tela>
      </Camera>
      <Flash cor={CIANO} quadros={6} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

// Ficha confidencial dentro da tela do celular (212x444)
const Ficha: React.FC<{ y: number; nome: string; foto: React.ReactNode; carimbo: string; corCarimbo?: string }> = ({ y, nome, foto, carimbo, corCarimbo = "#D7262B" }) => (
  <g transform={`translate(10,${y})`}>
    <rect width={192} height={150} rx={8} fill="#F4EFE3" />
    <rect x={8} y={8} width={70} height={84} fill="#CFC6B6" />
    <svg x={8} y={8} width={70} height={84} overflow="hidden">{foto}</svg>
    <text x={88} y={30} fontFamily="Roboto Condensed" fontWeight={800} fontSize={22} fill="#22232B">{nome}</text>
    {[44, 58, 72, 86].map((yy) => <rect key={yy} x={88} y={yy} width={90} height={6} fill="#B9B2A2" />)}
    <g transform="translate(100,124) rotate(-8)">
      <rect x={-86} y={-16} width={172} height={30} fill="none" stroke={corCarimbo} strokeWidth={3} />
      <text textAnchor="middle" y={8} fontFamily="Roboto Condensed" fontWeight={800} fontSize={20} fill={corCarimbo}>{carimbo}</text>
    </g>
  </g>
);

const TelaCasos: React.FC<{ terceira: number }> = ({ terceira }) => (
  <g>
    <rect width={212} height={444} fill="#1B1E27" />
    <rect width={212} height={50} fill="#272B37" />
    <path d="M 12 16 L 28 16 L 32 21 L 46 21 L 46 38 L 12 38 Z" fill="#F2C14E" />
    <text x={56} y={36} fontFamily="Roboto Condensed" fontWeight={800} fontSize={24} fill="#fff">CASOS</text>
    <g transform={`translate(${-212 * terceira},0)`}>
      <Ficha y={66} nome="CHEDE" carimbo="CONFIDENCIAL"
        foto={<g transform="translate(35,48) scale(0.15)"><Cabeca expressao="neutro" pose={{}} /></g>} />
      <Ficha y={232} nome="KAIK" carimbo="CONFIDENCIAL"
        foto={<g transform="translate(35,48) scale(0.15)"><CabecaKaik expressao="neutro" pose={{}} /></g>} />
    </g>
    <g transform={`translate(${212 * (1 - terceira)},0)`}>
      <Ficha y={120} nome="???" carimbo="NÃO ABORDAR"
        foto={
          <g filter="url(#borrao)">
            <rect width={70} height={84} fill="#8E8378" />
            <circle cx={35} cy={34} r={18} fill="#2A2522" />
            <rect x={14} y={54} width={42} height={40} rx={16} fill="#2A2522" />
          </g>
        } />
      <defs>
        <filter id="borrao"><feGaussianBlur stdDeviation={4} /></filter>
      </defs>
    </g>
  </g>
);

const S11_Casos: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1.0, 1.06]}>
      <Quarto desfoque={22} />
      <Tela>
        <g transform="translate(540,1010) scale(3.3)">
          <Celular tela={<TelaCasos terceira={0} />} />
        </g>
      </Tela>
    </Camera>
    <SeloSegue />
    <Acab />
  </AbsoluteFill>
);

const S12_Terceira: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.06, 1.25]} y={[0, 120]}>
        <Quarto desfoque={22} />
        <Tela>
          <g transform="translate(540,1010) scale(3.3)">
            <Celular tela={<TelaCasos terceira={interpolate(p, [0.05, 0.3], [0, 1], clamp)} />} />
          </g>
        </Tela>
      </Camera>
      <Acab graoForte />
    </AbsoluteFill>
  );
};

const S13_Ideia: React.FC = () => {
  const { f } = useP();
  const ik = alcançar("tresQuartos", -1, -330, -1400);
  const X = 600, Y = 2450, S = 1.2;
  const mx = X - 330 * S * 0.84 - 60, my = Y - 1400 * S;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.15]}>
        <Quarto desfoque={12} />
        <Tela>
          <circle cx={mx} cy={my} r={110 + Math.sin(f / 4) * 10} fill={ROXO} opacity={0.25} />
          <Vivo quem="chede" x={X} y={Y} s={S} vista="tresQuartos" expr="determinado" pose={{ bracoE: ik.braco, antebracoE: ik.antebraco, olharX: -1, olharY: 0.3 }} />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const S14_SemSinal: React.FC = () => {
  const { p } = useP();
  const k = interpolate(p, [0.05, 0.5], [0, 1], clamp);
  const barras = Math.max(0, 4 - Math.floor(interpolate(p, [0.3, 0.7], [0, 4.99], clamp)));
  return (
    <AbsoluteFill>
      <Painel titulo="A FENDA GUARDA, NÃO DESTRÓI">
        <Fenda x={540} y={1020} tamanho={0.9} />
        <g transform={`translate(540,${lerp(560, 1010, k)}) scale(${lerp(0.55, 0.05, k)}) rotate(${k * 200})`} opacity={k < 1 ? 1 : 0}>
          <Celular />
        </g>
        {/* barras de sinal */}
        <g transform="translate(410,1360)">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 70} y={-40 - i * 40} width={50} height={40 + i * 40} rx={8} fill={i < barras ? "#5BD66B" : "#3A4152"} />
          ))}
        </g>
        <text x={540} y={1460} textAnchor="middle" {...fonte} fontSize={60} fill={barras === 0 ? "#FF4A3D" : "#E9EEF7"}>
          {barras === 0 ? "SEM SINAL" : "SINAL"}
        </text>
        <rect x={190} y={1560} width={700} height={50} rx={25} fill="#3A4152" />
        <rect x={190} y={1560} width={14} height={50} rx={7} fill="#FF4A3D" />
      </Painel>
      <Info rotulo="UPLOAD" valor="0%" x={700} y={1640} tam={110} cor="#FF4A3D" />
    </AbsoluteFill>
  );
};

const S15_Treme: React.FC = () => {
  const { f } = useP();
  const tx = Math.sin(f * 2.3) * 8 + Math.sin(f * 3.9) * 5;
  const tam = 0.55 * (1 + 0.25 * Math.sin(f * 1.7));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.15]}>
        <Quarto desfoque={20} />
        <Tela>
          <g transform={`translate(${540 + tx},1350) scale(1.5)`}>
            <MaoClose />
          </g>
          <Fenda x={540 + tx} y={1300} tamanho={tam} intensidade={0.7 + 0.3 * Math.sin(f * 2.1)} />
          {Array.from({ length: 8 }).map((_, i) => {
            const t = ((f + i * 7) % 20) / 20;
            const a = i * 0.8;
            return <circle key={i} cx={540 + tx + Math.cos(a) * (80 + t * 160)} cy={1300 + Math.sin(a) * (40 + t * 100)} r={6} fill="#C9A6FF" opacity={1 - t} />;
          })}
          {[0, 1].map((i) => {
            const t = ((f + i * 20) % 40) / 40;
            return <ellipse key={i} cx={390 + i * 300} cy={1150 + t * 200} rx={10} ry={16} fill="#CFEFFF" opacity={0.8 * (1 - t)} />;
          })}
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const S16_Fechou: React.FC = () => {
  const { p, d } = useP();
  const X = 380, Y = 2200, S = 0.95;
  const fx = 820, fy = 1250;
  if (p < 0.5) {
    const k = p / 0.5;
    const ik = alcançar("tresQuartos", 1, lerp(150, 420, k), lerp(-1300, -1200, k));
    const hx = X + lerp(150, 420, k) * S, hy = Y - 1250 * S;
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Camera z={[1.05, 1.1]}>
          <Quarto desfoque={10} />
          <Tela>
            <Fenda x={fx} y={fy} tamanho={0.28} />
            <Vivo quem="chede" x={X} y={Y} s={S} vista="tresQuartos" expr="determinado" pose={{ bracoD: ik.braco, antebracoD: ik.antebraco, olharX: 1 }} />
            <g transform={`translate(${lerp(hx, fx, interpolate(k, [0.5, 1], [0, 1], clamp))},${lerp(hy, fy, interpolate(k, [0.5, 1], [0, 1], clamp))}) scale(${lerp(0.28, 0.06, interpolate(k, [0.5, 1], [0, 1], clamp))}) rotate(${k * 300})`}>
              <Celular />
            </g>
          </Tela>
        </Camera>
        <Acab feixe />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.1, 1.05]} tremor={0.8}>
        <Quarto desfoque={10} />
        <Tela>
          <Vivo quem="chede" x={X + 60} y={Y + 20} s={S} vista="tresQuartos" expr="cansado"
            pose={{ tronco: 18, pernaE: 75, joelhoE: -95, pernaD: 70, joelhoD: -90, bracoD: 40, bracoE: 30, olharX: 1 }} />
        </Tela>
      </Camera>
      <Flash cor="#E9DCFF" quadros={8} de={Math.round(0.5 * d)} />
      <Acab feixe />
    </AbsoluteFill>
  );
};

const S17_Sumiu: React.FC = () => {
  const { p } = useP();
  const ctl = interpolate(p, [0.15, 0.5], [1, 0], clamp);
  const piscar = p > 0.5 && p < 0.58 ? 1 : 0;
  return <CloseAgente oculos={0} controlado={ctl} piscar={piscar} expr={p > 0.6 ? "espanto" : "neutro"} olharX={p > 0.65 ? Math.sin(p * 30) : 0} />;
};

const S18_Nada: React.FC = () => {
  const { f } = useP();
  const a = Math.sin(f * 0.5);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.0, 1.08]}>
        <ApDentro desfoque={9} />
        <Tela>
          <Vivo quem="agente" x={540} y={2300} s={1.1} vista="frente" expr="medo"
            pose={{ bracoE: 15 + a * 10, antebracoE: -40 - a * 20, bracoD: 15 - a * 10, antebracoD: -40 + a * 20, olharX: Math.sin(f / 7) }} />
          {[0, 1, 2].map((i) => (
            <text key={i} x={360 + i * 180} y={640 - Math.abs(Math.sin(f / 6 + i)) * 40} textAnchor="middle" {...fonte} fontSize={120 - i * 10} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">?</text>
          ))}
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const S19_Fone: React.FC = () => {
  const { f } = useP();
  const ex = 540, ey = 960;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.1, 1.2]}>
        <ApDentro desfoque={20} />
        <Tela>
          <g transform={`translate(${ex + 20 * 3.4},${ey - 22 * 3.4}) scale(3.4)`}>
            <CabecaAgente expressao="medo" pose={{}} vista="perfil" />
          </g>
          <ellipse cx={ex} cy={ey} rx={34} ry={42} fill="#0B0C10" />
          <circle cx={ex} cy={ey} r={14} fill="#2A2D36" />
          <path d={`M ${ex} ${ey + 40} q 20 60 -10 120 q -30 60 0 140 q 20 60 -10 300`} stroke="#E6E6E6" strokeWidth={8} fill="none" />
          {[0, 1, 2, 3].map((i) => {
            const t = ((f * 1.5 + i * 12) % 48) / 48;
            const r = 60 + t * 300;
            return <path key={i} d={`M ${ex - r * 0.7} ${ey - r * 0.7} A ${r} ${r} 0 0 0 ${ex - r * 0.7} ${ey + r * 0.7}`} stroke={AMBAR} strokeWidth={10} fill="none" opacity={0.8 * (1 - t)} />;
          })}
        </Tela>
      </Camera>
      <Acab graoForte />
    </AbsoluteFill>
  );
};

// Carro preto encostando na frente da casa do Chede (rua 3D, fim de tarde)
const CarroChegando: React.FC<{ chegada: [number, number]; escuro: number; farol?: number }> = ({ chegada, escuro, farol = 1 }) => {
  const { p } = useP();
  const cam: Cam = { pos: [-10, 1.5, -15], alvo: [2, 1.2, -16], fov: 50 };
  const z = lerp(chegada[0], chegada[1], p * 1.3);
  const c = projetar(cam, [-1.6, 0, z]);
  const frente = projetar(cam, [-1.6, 0, z - 1]);
  const vira = frente.x < c.x ? -1 : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: `brightness(${escuro})` }}>
        <Rua3D cam={cam} sol={0.75} predio />
      </AbsoluteFill>
      <Tela>
        <g transform={`translate(${c.x},${c.y}) scale(${(vira * c.pxPorMetro) / 100},${c.pxPorMetro / 100})`}>
          <CarroPreto farol={farol} />
        </g>
      </Tela>
      <Poeira n={25} />
      <Gradacao />
      <Grao forca={0.16} />
    </AbsoluteFill>
  );
};

const S20_Moram: React.FC = () => <CarroChegando chegada={[-30, -16]} escuro={0.6} />;

const S21_Parte4: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 8, fps, config: { damping: 10 } });
  const sp2 = spring({ frame: f - 22, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <CarroChegando chegada={[-16, -16]} escuro={0.38} />
      <AbsoluteFill style={{ ...fonte, textAlign: "center" }}>
        <div style={{ position: "absolute", top: 1420, width: "100%", fontSize: 190, color: "#FFD23F", ...contorno(14), transform: `scale(${sp}) rotate(-4deg)` }}>
          PARTE 4
        </div>
        <div style={{ position: "absolute", top: 1660, width: "100%", fontSize: 80, color: "#fff", ...contorno(10), transform: `scale(${sp2})` }}>
          SEGUE PRA VER ▶
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CENAS: React.FC[] = [
  S0_Capa, S1_LuzVermelha, S2_Gravando, S3_Comigo, S4_Reacao, S5_Cruza, S6_Som, S7_Janelas, S8_Terno, S9_Anel,
  S10_Voltou, S11_Casos, S12_Terceira, S13_Ideia, S14_SemSinal, S15_Treme, S16_Fechou, S17_Sumiu, S18_Nada,
  S19_Fone, S20_Moram, S21_Parte4,
];

export const Vigiados3: React.FC<{ trilha?: boolean }> = ({ trilha = true }) => {
  const inicios = T.linhas.map((l, i) => (i === 0 ? 0 : Math.round(l.inicio * FPS) - 2));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map((Cena, i) => {
        const de = inicios[i];
        const ate = i + 1 < inicios.length ? inicios[i + 1] : DURACAO_VIG3;
        return (
          <Sequence key={i} from={de} durationInFrames={Math.max(1, ate - de)}>
            <Cena />
          </Sequence>
        );
      })}
      <Legendas palavras={T.palavras} duracao={T.duracao} />
      <Audio src={staticFile("vigiados3/narracao.mp3")} />
      {trilha && <Audio src={staticFile("vigiados3/trilha.wav")} />}
    </AbsoluteFill>
  );
};



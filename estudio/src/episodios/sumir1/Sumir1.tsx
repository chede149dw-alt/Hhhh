import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timing from "./timing.json";
import { Cabeca, Chede, Expressao, Pose, Vista } from "../../personagens/Chede";
import { Quarto } from "../../cenarios/Quarto";
import { Cozinha, Dimensao } from "../../cenarios/Cenarios";
import { Fenda } from "../../efeitos/Fenda";
import { FeixeDeLuz, Gradacao, Grao, Poeira } from "../../estilo/Acabamento";
import { Celular, Despertador, MaoClose, Meia, Mesa, Papel, PilhaPratos } from "../../objetos/Objetos";
import "@fontsource/roboto-condensed/800.css";

export const FPS = 30;
const T = timing as {
  duracao: number;
  linhas: { inicio: number; fim: number }[];
  palavras: { w: string; linha: number; destaque: string | null; inicio: number; fim: number }[];
};
export const DURACAO = Math.ceil((T.duracao + 1.2) * FPS);

// ---------- utilidades ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const useP = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { f, p: f / durationInFrames, d: durationInFrames, t: f / FPS };
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * ease(Math.min(1, Math.max(0, p)));

// Câmera: zoom lento + deslocamento + tremor. Nada fica parado.
const Camera: React.FC<{
  z?: [number, number];
  x?: [number, number];
  y?: [number, number];
  tremor?: number;
  children: React.ReactNode;
}> = ({ z = [1, 1.08], x = [0, 0], y = [0, 0], tremor = 0, children }) => {
  const { f, p } = useP();
  const s = lerp(z[0], z[1], p);
  const tx = lerp(x[0], x[1], p) + tremor * (Math.sin(f * 2.1) * 9 + Math.sin(f * 3.7) * 5);
  const ty = lerp(y[0], y[1], p) + tremor * (Math.cos(f * 2.7) * 9);
  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(${s})`, transformOrigin: "50% 45%" }}>
      {children}
    </AbsoluteFill>
  );
};

const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} overflow="visible">
      {children}
    </svg>
  </AbsoluteFill>
);

// Chede com respiração e piscar automáticos.
const ChedeVivo: React.FC<{
  x: number;
  y: number;
  s: number;
  vista?: Vista;
  expr?: Expressao;
  pose?: Pose;
}> = ({ x, y, s, vista = "frente", expr = "neutro", pose = {} }) => {
  const { f } = useP();
  const piscar = f % 95 < 4 ? 1 : 0;
  const resp = (Math.sin(f / 12) + 1) / 2;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Chede vista={vista} expressao={expr} pose={{ piscar, respiracao: resp, ...pose }} />
    </g>
  );
};

// posição da mão (centro) no espaço local do Chede
const maoPos = (pose: Pose, vista: Vista, lado: 1 | -1) => {
  const sx = vista === "perfil" ? 0.58 : vista === "tresQuartos" ? 0.84 : 1;
  const ox = (vista === "perfil" ? 20 : 150 * sx) * lado;
  const o = ((lado === 1 ? pose.bracoD : pose.bracoE) ?? 10) * (Math.PI / 180);
  const c = ((lado === 1 ? pose.antebracoD : pose.antebracoE) ?? -6) * (Math.PI / 180);
  const ex = ox + lado * 286 * Math.sin(o);
  const ey = -1150 + 286 * Math.cos(o);
  return { x: ex + lado * 272 * Math.sin(o + c), y: ey + 272 * Math.cos(o + c) };
};

const Flash: React.FC<{ cor?: string; quadros?: number }> = ({ cor = "#fff", quadros = 6 }) => {
  const { f } = useP();
  const o = interpolate(f, [0, quadros], [0.9, 0], clamp);
  return <AbsoluteFill style={{ background: cor, opacity: o, mixBlendMode: "screen" }} />;
};

const Acab: React.FC<{ feixe?: boolean }> = ({ feixe }) => (
  <>
    {feixe && <FeixeDeLuz />}
    <Poeira />
    <Gradacao />
    <Grao />
  </>
);

// ---------- cenas ----------
const PODER_D: Pose = { bracoE: 12, antebracoE: -8, bracoD: 70, antebracoD: 10, olharX: 1 };

const C0_Capa: React.FC = () => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const pop = (atraso: number) => spring({ frame: f - atraso, fps, config: { damping: 11, stiffness: 140 } });
  const pose: Pose = { bracoE: 80, antebracoE: -152, olharX: -0.7, olharY: 0.9, cabeca: -4 };
  const m = maoPos(pose, "frente", -1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]}>
        <Quarto desfoque={10} />
        <Tela>
          <ChedeVivo x={540} y={2480} s={1.32} expr="espanto" pose={pose} />
          <Fenda x={540 + m.x * 1.32} y={2480 + m.y * 1.32 - 70} tamanho={0.8} />
        </Tela>
      </Camera>
      <Acab feixe />
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center", textTransform: "uppercase" }}>
        <div style={{ position: "absolute", top: 120, width: "100%", fontSize: 86, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", transform: `scale(${pop(0)})` }}>
          E se você acordasse
        </div>
        <div style={{ position: "absolute", top: 220, width: "100%", fontSize: 118, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(5)}) rotate(-3deg)` }}>
          podendo{" "}
          <span style={{ color: "#C9A6FF", textShadow: "0 0 30px #8B5CFF, 0 0 60px #7B4DFF" }}>sumir</span>
          <br />
          com tudo?
        </div>
        <div style={{ position: "absolute", top: 1560, right: 70, fontSize: 130, color: "#FFD23F", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", transform: `scale(${pop(14)}) rotate(-6deg)` }}>
          Parte 1
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const C1_Cama: React.FC = () => {
  const { f, p } = useP();
  const tremor = Math.sin(f * 1.9);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]} x={[0, -40]}>
        <Quarto desfoque={12} />
        <Tela>
          {/* criado-mudo */}
          <rect x={700} y={1180} width={420} height={760} fill="#7A5236" />
          <rect x={700} y={1180} width={420} height={40} fill="#9A6B45" />
          <g transform="translate(880,1060) scale(0.9)">
            <Despertador tremor={tremor} />
          </g>
          {/* cama */}
          <rect x={-40} y={1280} width={780} height={700} rx={30} fill="#F1EBDD" />
          <ellipse cx={240} cy={1270} rx={230} ry={90} fill="#FFFFFF" />
          <g transform="translate(250,1180) rotate(-78) scale(0.82)">
            <Cabeca expressao={p < 0.6 ? "cansado" : "raiva"} pose={{ piscar: p < 0.35 ? 1 : 0, olharX: 1 }} />
          </g>
          <path d="M -60 1330 Q 200 1280 760 1320 L 760 1960 L -60 1960 Z" fill="#3A4E78" />
          <path d="M -60 1330 Q 200 1280 760 1320 L 760 1360 Q 200 1320 -60 1370 Z" fill="#4E6496" />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C2_Tapa: React.FC = () => {
  const { f, p } = useP();
  const y = lerp(-500, 820, Math.min(1, p * 1.3));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.1, 1.18]}>
        <Quarto desfoque={16} />
        <Tela>
          <rect x={-40} y={1380} width={1160} height={600} fill="#9A6B45" />
          <g transform="translate(540,1250) scale(1.7)">
            <Despertador tremor={Math.sin(f * 2.2)} />
          </g>
          <g transform={`translate(540,${y}) rotate(180) scale(1.1)`}>
            <MaoClose />
          </g>
          {p > 0.2 &&
            [-200, -80, 60, 180].map((x) => (
              <line key={x} x1={540 + x} x2={540 + x} y1={y - 900} y2={y - 500} stroke="#fff" strokeWidth={6} opacity={0.4} />
            ))}
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C3_Sumiu: React.FC = () => {
  const { p } = useP();
  const k = Math.min(1, p * 2.2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.15, 1.05]} tremor={p < 0.3 ? 1 : 0}>
        <Quarto desfoque={18} />
        <Tela>
          <g transform={`translate(${lerp(560, 560, k)},${lerp(1200, 1020, k)}) scale(${lerp(1.6, 0, k)}) rotate(${k * 260})`}>
            <Despertador tremor={0} />
          </g>
          <g transform="translate(540,1460) scale(1.2)">
            <MaoClose />
          </g>
          <Fenda x={540} y={1060} tamanho={lerp(1.3, 0.9, p)} />
        </Tela>
      </Camera>
      <Flash />
      <Acab />
    </AbsoluteFill>
  );
};

const C4_Procura: React.FC = () => {
  const { p } = useP();
  if (p > 0.66) {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Camera z={[1.0, 1.12]}>
          <Quarto desfoque={14} />
          <Tela>
            <ChedeVivo x={540} y={3500} s={2.0} expr="espanto" />
          </Tela>
        </Camera>
        <Acab feixe />
      </AbsoluteFill>
    );
  }
  const esq = p < 0.33;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.06]} x={[esq ? -20 : 20, esq ? 20 : -20]}>
        <Quarto desfoque={8} />
        <Tela>
          <ChedeVivo x={540} y={1960} s={0.95} vista="tresQuartos" expr="medo"
            pose={{ tronco: 16, olharX: esq ? -1 : 1, olharY: 1, bracoE: 20, bracoD: 20, cabeca: esq ? -8 : 8 }} />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C5_Rasgo: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.2]}>
        <Quarto desfoque={18} />
        <Tela>
          <g transform="translate(540,1380) scale(1.35)">
            <MaoClose />
          </g>
          <Fenda x={540} y={1250} tamanho={lerp(1.3, 0.12, p)} intensidade={lerp(1, 0.5, p)} />
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const CenaPoder: React.FC<{
  expr: Expressao;
  objeto: (k: number) => React.ReactNode; // k = 0..1 progresso do objeto rumo à fenda
  vento?: boolean;
}> = ({ expr, objeto, vento }) => {
  const { f, p } = useP();
  const cx = 300;
  const cy = 1880;
  const s = 0.9;
  const m = maoPos(PODER_D, "tresQuartos", 1);
  const fx = cx + m.x * s + 40;
  const fy = cy + m.y * s - 20;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.07]} tremor={vento ? 0.4 : 0}>
        <Quarto desfoque={7} />
        <Tela>
          <ChedeVivo x={cx} y={cy} s={s} vista="tresQuartos" expr={expr} pose={PODER_D} />
          {objeto(p)}
          <Fenda x={fx} y={fy} tamanho={0.7} />
          {vento &&
            Array.from({ length: 10 }).map((_, i) => {
              const fase = ((f * 2 + i * 13) % 40) / 40;
              const y = 300 + i * 150;
              return (
                <line key={i} x1={1080 - fase * 300 + 200} y1={y} x2={1080 - fase * 300 + 380} y2={y + 30}
                  stroke="#fff" strokeWidth={5} opacity={0.35 * (1 - fase)} transform={`rotate(${(fy - y) / 12} ${fx} ${fy})`} />
              );
            })}
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C6_Meia: React.FC = () => {
  const m = maoPos(PODER_D, "tresQuartos", 1);
  const fx = 300 + m.x * 0.9 + 40;
  const fy = 1880 + m.y * 0.9 - 20;
  return (
    <CenaPoder
      expr="feliz"
      objeto={(p) => {
        const k = Math.max(0, (p - 0.35) / 0.45);
        return (
          <g transform={`translate(${lerp(820, fx, k)},${lerp(1720, fy, k)}) scale(${lerp(0.9, 0, k)}) rotate(${k * 300})`}>
            <Meia />
          </g>
        );
      }}
    />
  );
};

const C7_Louca: React.FC = () => {
  const { p } = useP();
  const restantes = Math.max(0, Math.round(6 * (1 - Math.max(0, (p - 0.25) / 0.55))));
  const voando = p > 0.25 && p < 0.85;
  const k = ((p - 0.25) * 6) % 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]}>
        <Cozinha desfoque={5} />
        <Tela>
          <rect x={160} y={1320} width={760} height={160} rx={30} fill="#9AA6AD" />
          <rect x={200} y={1330} width={680} height={120} rx={24} fill="#6F7A80" />
          {restantes > 0 && (
            <g transform="translate(540,1380) scale(1.2)">
              <PilhaPratos n={restantes} />
            </g>
          )}
          {voando && (
            <g transform={`translate(540,${lerp(1260, 760, k)}) scale(${lerp(1.1, 0, k)}) rotate(${k * 400})`}>
              <PilhaPratos n={1} />
            </g>
          )}
          {p > 0.15 && <Fenda x={540} y={740} tamanho={p > 0.9 ? lerp(1, 0, (p - 0.9) * 10) : 1} />}
          {p > 0.85 &&
            [0, 1, 2].map((i) => (
              <path key={i} d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="#FFF6D6"
                transform={`translate(${380 + i * 160},${1360 - (i % 2) * 40}) scale(${1 + Math.sin(p * 40 + i)})`} />
            ))}
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C8_Vento: React.FC = () => {
  const m = maoPos(PODER_D, "tresQuartos", 1);
  const fx = 300 + m.x * 0.9 + 40;
  const fy = 1880 + m.y * 0.9 - 20;
  return (
    <CenaPoder
      expr="determinado"
      vento
      objeto={(p) => (
        <g>
          {Array.from({ length: 6 }).map((_, i) => {
            const k = Math.min(1, Math.max(0, (p * 1.4 - i * 0.12)));
            const x0 = 80 + (i % 3) * 140;
            const y0 = 500 + i * 190;
            return (
              <g key={i} transform={`translate(${lerp(x0, fx, k)},${lerp(y0, fy, k)}) scale(${lerp(0.7, 0, k)})`}>
                <Papel r={i * 40 + p * 500} />
              </g>
            );
          })}
        </g>
      )}
    />
  );
};

const C9_Ar: React.FC = () => {
  const { p } = useP();
  const sumiu = p > 0.3;
  const k = Math.max(0, (p - 0.35) / 0.5);
  return (
    <AbsoluteFill style={{ background: "#1C2130" }}>
      <Camera z={[1, 1.06]}>
        <Tela>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`a${i}`} x1={i * 90} x2={i * 90} y1={0} y2={1920} stroke="#2A3145" strokeWidth={2} />
          ))}
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={`b${i}`} y1={i * 90} y2={i * 90} x1={0} x2={1080} stroke="#2A3145" strokeWidth={2} />
          ))}
          {!sumiu && (
            <g transform="translate(540,900) scale(1.3)">
              <Despertador />
            </g>
          )}
          {sumiu && (
            <circle cx={540} cy={900} r={170} fill="none" stroke="#C9A6FF" strokeWidth={6} strokeDasharray="20 16" opacity={0.8} />
          )}
          {sumiu &&
            Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r0 = 520;
              const r = lerp(r0, 190, k);
              const x = 540 + Math.cos(a) * r;
              const y = 900 + Math.sin(a) * r;
              const deg = (a * 180) / Math.PI + 180;
              return (
                <g key={i} transform={`translate(${x},${y}) rotate(${deg})`}>
                  <rect x={-90} y={-10} width={90} height={20} rx={10} fill="#7FE7FF" />
                  <path d="M 0 -28 L 40 0 L 0 28 Z" fill="#7FE7FF" />
                </g>
              );
            })}
          <text x={540} y={300} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={70} fill="#E9EEF7">
            {sumiu ? "O AR OCUPA O VAZIO" : "OBJETO"}
          </text>
        </Tela>
      </Camera>
      {sumiu && p < 0.4 && <Flash cor="#C9A6FF" />}
      <Gradacao />
      <Grao />
    </AbsoluteFill>
  );
};

const C10_Pensa: React.FC = () => {
  const { f, p } = useP();
  const { fps } = useVideoConfig();
  const b = spring({ frame: f - 6, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.08]}>
        <Quarto desfoque={12} />
        <Tela>
          <ChedeVivo x={460} y={3150} s={1.75} expr="neutro" pose={{ olharX: 0.7, olharY: -1, cabeca: 6 }} />
          <g transform={`translate(800,420) scale(${b})`}>
            <circle cx={-160} cy={260} r={22} fill="#F4EFE3" />
            <circle cx={-110} cy={190} r={34} fill="#F4EFE3" />
            <ellipse cx={0} cy={0} rx={220} ry={170} fill="#F4EFE3" />
            <g transform={`rotate(${Math.sin(f / 8) * 12})`}>
              <text x={0} y={60} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={190} fill="#7B4DFF">?</text>
            </g>
          </g>
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const TelaGravando: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={212} height={444} fill="#3C4450" />
    <text x={106} y={420} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={26} fill="#fff">
      00:0{Math.min(9, Math.floor(t))}
    </text>
  </g>
);

const C11_Celular: React.FC = () => {
  const { p, t } = useP();
  const k = Math.max(0, (p - 0.4) / 0.5);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]}>
        <Quarto desfoque={18} />
        <Tela>
          <g transform="translate(540,1520) scale(1.3)">
            <MaoClose />
          </g>
          <Fenda x={540} y={1180} tamanho={1.2} />
          <g transform={`translate(540,${lerp(1260, 1180, k)}) scale(${lerp(1.1, 0, k)}) rotate(${-8 + k * 120})`}>
            <Celular gravando brilho={Math.floor(t * 2) % 2} tela={<TelaGravando t={t} />} />
          </g>
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const TelaPlay: React.FC = () => (
  <g>
    <rect width={212} height={444} fill="#141221" />
    <rect y={250} width={212} height={194} fill="#3B3850" />
    <circle cx={106} cy={200} r={42} fill="#ffffff" opacity={0.9} />
    <path d="M 94 180 L 126 200 L 94 220 Z" fill="#141221" />
    <text x={106} y={420} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={26} fill="#fff">0:10</text>
  </g>
);

const C12_Volta: React.FC = () => {
  const { p } = useP();
  if (p < 0.45) {
    const k = p / 0.45;
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <Camera z={[1.05, 1.12]} tremor={0.5}>
          <Quarto desfoque={18} />
          <Tela>
            <g transform="translate(540,1520) scale(1.3)">
              <MaoClose />
            </g>
            <Fenda x={540} y={1180} tamanho={1.2} />
            <g transform={`translate(540,${lerp(1180, 900, k)}) scale(${lerp(0, 1.2, k)}) rotate(${(1 - k) * 200})`}>
              <Celular tela={<TelaPlay />} />
            </g>
          </Tela>
        </Camera>
        <Flash />
        <Acab />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.15]}>
        <Quarto desfoque={22} />
        <Tela>
          <g transform="translate(540,960) scale(2.7) rotate(-4)">
            <Celular tela={<TelaPlay />} />
          </g>
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const MolduraVideo: React.FC = () => {
  const { t } = useP();
  return (
    <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, color: "#fff", fontSize: 44 }}>
      <div style={{ position: "absolute", top: 90, left: 70, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: "#E5332A", opacity: Math.floor(t * 2) % 2 }} />
        REC
      </div>
      <div style={{ position: "absolute", top: 90, right: 70 }}>00:0{Math.min(9, 2 + Math.floor(t))}</div>
      <div style={{ position: "absolute", inset: 40, border: "4px solid rgba(255,255,255,0.5)", borderRadius: 30 }} />
    </AbsoluteFill>
  );
};

const C13_Lugar: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1.25, 1.0]}>
      <Dimensao />
    </Camera>
    <MolduraVideo />
    <Flash cor="#C9A6FF" quadros={8} />
    <Poeira n={30} />
    <Grao forca={0.16} />
  </AbsoluteFill>
);

const C14_LoucaLa: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Camera z={[1, 1.18]} y={[0, -60]}>
      <Dimensao />
      <Tela>
        <g transform="translate(540,1330) scale(1.1)">
          <PilhaPratos n={6} />
        </g>
        <g transform="translate(260,1420) rotate(-80) scale(0.6)">
          <Despertador />
        </g>
        <g transform="translate(820,1440) rotate(70) scale(0.55)">
          <Meia />
        </g>
        <g transform="translate(860,1300) rotate(20) scale(0.5)">
          <Papel />
        </g>
      </Tela>
    </Camera>
    <MolduraVideo />
    <Poeira n={30} />
    <Grao forca={0.16} />
  </AbsoluteFill>
);

const C15_Guarda: React.FC = () => {
  const { f } = useP();
  const pulo = Math.abs(Math.sin(f / 7)) * 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.06]}>
        <Quarto desfoque={8} />
        <Tela>
          <ChedeVivo x={540} y={1960 - pulo} s={1.0} expr="rindo" pose={{ bracoE: 40, antebracoE: 60, bracoD: 40, antebracoD: 60 }} />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const POSE_MESA: Pose = { bracoD: 30, antebracoD: 40, bracoE: 10, olharX: 1, olharY: 1 };

const C16_Ousado: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.12]} x={[30, -30]}>
        <Quarto desfoque={9} />
        <Tela>
          <ChedeVivo x={420} y={2100} s={0.95} vista="tresQuartos" expr="determinado" pose={{ ...POSE_MESA, bracoD: lerp(10, 30, p * 1.5) }} />
          <g transform="translate(560,1340) scale(1.1)">
            <Mesa />
          </g>
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C17_Atravessa: React.FC = () => {
  const { f, p } = useP();
  const y = lerp(500, 1450, p);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]}>
        <Quarto desfoque={18} />
        <Tela>
          <g transform="translate(540,1150) scale(2.4)">
            <Mesa />
          </g>
          <circle cx={540} cy={y - 120} r={260} fill="#9B6BFF" opacity={0.18} />
          <g transform={`translate(540,${y}) rotate(180) scale(1.1)`}>
            <MaoClose translucida={0.45} />
          </g>
          {y > 900 &&
            [0, 1, 2].map((i) => {
              const r = ((f * 3 + i * 40) % 120) / 120;
              return <ellipse key={i} cx={540} cy={1180} rx={160 + r * 260} ry={30 + r * 50} fill="none" stroke="#B48CFF" strokeWidth={6} opacity={1 - r} />;
            })}
        </Tela>
      </Camera>
      <Acab />
    </AbsoluteFill>
  );
};

const C18_Rosto: React.FC = () => {
  const { f } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.15]}>
        <Quarto desfoque={14} />
        <Tela>
          <ChedeVivo x={540} y={3700} s={2.3} expr="medo" pose={{ olharX: 0.4, olharY: 0.8 }} />
          <path d={`M 860 ${560 + (f % 40) * 3} q 18 30 0 46 q -18 -16 0 -46 Z`} fill="#BFE6FF" opacity={0.85} />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C19_Puxa: React.FC = () => {
  const { p } = useP();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.05, 1.12]} tremor={lerp(0.3, 1.2, p)}>
        <Quarto desfoque={9} />
        <Tela>
          <ChedeVivo x={400} y={2100} s={0.95} vista="tresQuartos" expr="medo" pose={{ ...POSE_MESA, tronco: lerp(0, -14, p) }} />
          <g transform="translate(560,1340) scale(1.1)">
            <Mesa />
          </g>
          <Fenda x={890} y={1345} tamanho={0.5} />
        </Tela>
      </Camera>
      <Acab feixe />
    </AbsoluteFill>
  );
};

const C20_Segurou: React.FC = () => {
  const { p } = useP();
  const g = Math.min(1, Math.max(0, (p - 0.2) / 0.35));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1.1, 1.25]} tremor={p > 0.3 ? 2 : 0.5}>
        <Quarto desfoque={18} />
        <Tela>
          <g transform="translate(540,1150) scale(2.4)">
            <Mesa />
          </g>
          <ellipse cx={540} cy={1190} rx={300} ry={70} fill="#0B0618" />
          <Fenda x={540} y={1190} tamanho={1.6} />
          {/* antebraço do Chede entrando na fenda */}
          <rect x={470} y={0} width={140} height={1190} rx={60} fill="#9A6340" />
          <rect x={545} y={0} width={65} height={1190} rx={30} fill="#7A4A2E" opacity={0.5} />
          {/* dedos escuros do outro lado, agarrando o pulso */}
          {[0, 1, 2].map((i) => {
            const yy = 1140 - i * 70;
            const alcance = Math.min(1, Math.max(0, g * 1.6 - i * 0.18));
            return (
              <g key={i} opacity={alcance > 0 ? 1 : 0}>
                <path d={`M 420 ${yy + 40} Q 430 ${yy - 10} ${420 + 220 * alcance} ${yy - 20}`} stroke="#140A24" strokeWidth={24} strokeLinecap="round" fill="none" />
                <circle cx={420 + 220 * alcance} cy={yy - 20} r={9} fill="#C9A6FF" opacity={alcance} />
                <path d={`M 420 ${yy + 40} Q 430 ${yy - 10} ${420 + 220 * alcance} ${yy - 20}`} stroke="#8E6BFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} transform="translate(0,-14)" />
              </g>
            );
          })}
          {g > 0.3 && (
            <path d="M 650 1170 Q 700 1100 640 1060" stroke="#140A24" strokeWidth={28} strokeLinecap="round" fill="none" />
          )}
        </Tela>
      </Camera>
      {p > 0.25 && p < 0.4 && <Flash cor="#FF4A3D" />}
      <Acab />
    </AbsoluteFill>
  );
};

const C21_Parte2: React.FC = () => {
  const { f, p } = useP();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 10, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camera z={[1, 1.1]}>
        <Dimensao olhos={Math.min(1, p * 2)} desfoque={2} />
      </Camera>
      <AbsoluteFill style={{ fontFamily: "'Roboto Condensed'", fontWeight: 800, textAlign: "center" }}>
        <div style={{ position: "absolute", top: 1450, width: "100%", fontSize: 190, color: "#FFD23F", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${s}) rotate(-4deg)` }}>
          PARTE 2
        </div>
      </AbsoluteFill>
      <Gradacao />
      <Grao forca={0.16} />
    </AbsoluteFill>
  );
};

const CENAS: React.FC[] = [
  C0_Capa, C1_Cama, C2_Tapa, C3_Sumiu, C4_Procura, C5_Rasgo, C6_Meia, C7_Louca, C8_Vento, C9_Ar, C10_Pensa,
  C11_Celular, C12_Volta, C13_Lugar, C14_LoucaLa, C15_Guarda, C16_Ousado, C17_Atravessa, C18_Rosto, C19_Puxa,
  C20_Segurou, C21_Parte2,
];

// ---------- legenda palavra por palavra (até 3 palavras) ----------
type Grupo = { inicio: number; fim: number; palavras: typeof T.palavras };
const grupos: Grupo[] = (() => {
  const out: Grupo[] = [];
  let atual: typeof T.palavras = [];
  T.palavras.forEach((w, i) => {
    if (w.linha === 0) return; // a capa já mostra a premissa
    atual.push(w);
    const prox = T.palavras[i + 1];
    const fimFrase = /[.,:?!…]$/.test(w.w) || w.w.endsWith("...");
    if (atual.length === 3 || fimFrase || !prox || prox.linha !== w.linha) {
      out.push({ inicio: atual[0].inicio, fim: 0, palavras: atual });
      atual = [];
    }
  });
  out.forEach((g, i) => (g.fim = i + 1 < out.length ? Math.min(out[i + 1].inicio, g.palavras[g.palavras.length - 1].fim + 0.6) : T.duracao + 1));
  return out;
})();

const Legendas: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = grupos.find((x) => t >= x.inicio && t < x.fim);
  if (!g) return null;
  const pop = interpolate(t - g.inicio, [0, 0.08], [0.85, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 1290,
        width: "100%",
        textAlign: "center",
        fontFamily: "'Roboto Condensed'",
        fontWeight: 800,
        fontSize: 92,
        textTransform: "uppercase",
        color: "#fff",
        WebkitTextStroke: "8px #000",
        paintOrder: "stroke fill",
        textShadow: "0 6px 0 rgba(0,0,0,0.6)",
        transform: `scale(${pop})`,
      }}
    >
      {g.palavras.map((w, i) => (
        <span key={i} style={{ color: w.destaque === "amarelo" ? "#FFD23F" : w.destaque === "vermelho" ? "#FF4A3D" : "#fff" }}>
          {w.w.replace(/\.\.\.$/, "…")}
          {i < g.palavras.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

export const Sumir1: React.FC<{ trilha?: boolean }> = ({ trilha = true }) => {
  const inicios = T.linhas.map((l, i) => (i === 0 ? 0 : Math.round(l.inicio * FPS) - 2));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map((Cena, i) => {
        const de = inicios[i];
        const ate = i + 1 < inicios.length ? inicios[i + 1] : DURACAO;
        return (
          <Sequence key={i} from={de} durationInFrames={ate - de}>
            <Cena />
          </Sequence>
        );
      })}
      <Legendas />
      <Audio src={staticFile("sumir1/narracao.mp3")} />
      {trilha && <Audio src={staticFile("sumir1/trilha.wav")} />}
    </AbsoluteFill>
  );
};

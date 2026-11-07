import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Chede, Expressao, Pose, Vista } from "../personagens/Chede";
import { Kaik } from "../personagens/Kaik";
import { Agente } from "../personagens/Agente";
import { FeixeDeLuz, Gradacao, Grao, Poeira } from "../estilo/Acabamento";
import "@fontsource/roboto-condensed/800.css";

// Utilidades compartilhadas pelos episódios (a Parte 1 do Chede tem cópia própria, já aprovada).
export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * ease(Math.min(1, Math.max(0, p)));
export const useP = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { f, p: f / durationInFrames, d: durationInFrames, t: f / FPS };
};

export const Camera: React.FC<{
  z?: [number, number];
  x?: [number, number];
  y?: [number, number];
  tremor?: number;
  children: React.ReactNode;
}> = ({ z = [1, 1.08], x = [0, 0], y = [0, 0], tremor = 0, children }) => {
  const { f, p } = useP();
  const s = lerp(z[0], z[1], p);
  const tx = lerp(x[0], x[1], p) + tremor * (Math.sin(f * 2.1) * 9 + Math.sin(f * 3.7) * 5);
  const ty = lerp(y[0], y[1], p) + tremor * Math.cos(f * 2.7) * 9;
  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(${s})`, transformOrigin: "50% 45%" }}>
      {children}
    </AbsoluteFill>
  );
};

export const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} overflow="visible">
      {children}
    </svg>
  </AbsoluteFill>
);

export const Vivo: React.FC<{
  quem: "chede" | "kaik" | "agente";
  x: number;
  y: number;
  s: number;
  vista?: Vista;
  expr?: Expressao;
  pose?: Pose;
  parado?: boolean; // congelado (sem respirar/piscar)
  semSombra?: boolean;
  espelhar?: boolean;
}> = ({ quem, x, y, s, vista = "frente", expr = "neutro", pose = {}, parado, semSombra, espelhar }) => {
  const { f } = useP();
  const piscar = !parado && f % 95 < 4 ? 1 : 0;
  const resp = parado ? 0 : (Math.sin(f / 12) + 1) / 2;
  const P = { piscar, respiracao: resp, ...pose };
  const Comp = quem === "kaik" ? Kaik : quem === "agente" ? Agente : Chede;
  return (
    <g transform={`translate(${x},${y}) scale(${espelhar ? -s : s},${s})`}>
      <Comp vista={vista} expressao={expr} pose={P} semSombra={semSombra} />
    </g>
  );
};

export const maoPos = (pose: Pose, vista: Vista, lado: 1 | -1) => {
  const sx = vista === "perfil" ? 0.58 : vista === "tresQuartos" ? 0.84 : 1;
  const ox = (vista === "perfil" ? 20 : 150 * sx) * lado;
  const o = ((lado === 1 ? pose.bracoD : pose.bracoE) ?? 10) * (Math.PI / 180);
  const c = ((lado === 1 ? pose.antebracoD : pose.antebracoE) ?? -6) * (Math.PI / 180);
  const ex = ox + lado * 286 * Math.sin(o);
  const ey = -1150 + 286 * Math.cos(o);
  return { x: ex + lado * 272 * Math.sin(o + c), y: ey + 272 * Math.cos(o + c) };
};

export const Flash: React.FC<{ cor?: string; quadros?: number; de?: number }> = ({ cor = "#fff", quadros = 6, de = 0 }) => {
  const { f } = useP();
  const o = interpolate(f, [de, de + quadros], [0.9, 0], clamp);
  return <AbsoluteFill style={{ background: cor, opacity: f < de ? 0 : o, mixBlendMode: "screen" }} />;
};

export const Acab: React.FC<{ feixe?: boolean; graoForte?: boolean }> = ({ feixe, graoForte }) => (
  <>
    {feixe && <FeixeDeLuz />}
    <Poeira />
    <Gradacao />
    <Grao forca={graoForte ? 0.16 : 0.11} />
  </>
);

// Painel de explicação (fundo escuro quadriculado), igual ao do "ar ocupa o vazio".
export const Painel: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <AbsoluteFill style={{ background: "#1C2130" }}>
    <Camera z={[1, 1.06]}>
      <Tela>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`a${i}`} x1={i * 90} x2={i * 90} y1={0} y2={1920} stroke="#2A3145" strokeWidth={2} />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`b${i}`} y1={i * 90} y2={i * 90} x1={0} x2={1080} stroke="#2A3145" strokeWidth={2} />
        ))}
        <text x={540} y={300} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={70} fill="#E9EEF7">
          {titulo}
        </text>
        {children}
      </Tela>
    </Camera>
    <Gradacao />
    <Grao />
  </AbsoluteFill>
);

// Legenda palavra por palavra a partir do timing (até 3 palavras; pula a fala 0, que está na capa).
type Palavra = { w: string; linha: number; destaque: string | null; inicio: number; fim: number };
export const Legendas: React.FC<{ palavras: Palavra[]; duracao: number }> = ({ palavras, duracao }) => {
  const f = useCurrentFrame();
  const grupos = React.useMemo(() => {
    const out: { inicio: number; fim: number; ps: Palavra[] }[] = [];
    let atual: Palavra[] = [];
    palavras.forEach((w, i) => {
      if (w.linha === 0) return;
      atual.push(w);
      const prox = palavras[i + 1];
      const fimFrase = /[.,:?!…]$/.test(w.w);
      if (atual.length === 3 || fimFrase || !prox || prox.linha !== w.linha) {
        out.push({ inicio: atual[0].inicio, fim: 0, ps: atual });
        atual = [];
      }
    });
    out.forEach((g, i) => (g.fim = i + 1 < out.length ? Math.min(out[i + 1].inicio, g.ps[g.ps.length - 1].fim + 0.6) : duracao + 1));
    return out;
  }, [palavras, duracao]);
  const t = f / FPS;
  const g = grupos.find((x) => t >= x.inicio && t < x.fim);
  if (!g) return null;
  const pop = interpolate(t - g.inicio, [0, 0.08], [0.85, 1], clamp);
  return (
    <div
      style={{
        position: "absolute", top: 1290, width: "100%", textAlign: "center",
        fontFamily: "'Roboto Condensed'", fontWeight: 800, fontSize: 92, textTransform: "uppercase",
        color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill",
        textShadow: "0 6px 0 rgba(0,0,0,0.6)", transform: `scale(${pop})`,
      }}
    >
      {g.ps.map((w, i) => (
        <span key={i} style={{ color: w.destaque === "amarelo" ? "#FFD23F" : w.destaque === "vermelho" ? "#FF4A3D" : "#fff" }}>
          {w.w.replace(/\.\.\.$/, "…")}
          {i < g.ps.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

// IK de 2 ossos: ângulos de braço/antebraço para a mão (centro) chegar ao ponto (x,y) no espaço local do personagem.
export const alcançar = (vista: Vista, lado: 1 | -1, x: number, y: number) => {
  const sx = vista === "perfil" ? 0.58 : vista === "tresQuartos" ? 0.84 : 1;
  const ox = (vista === "perfil" ? 20 : 150 * sx) * lado;
  const L1 = 286;
  const L2 = 272;
  const dx = (x - ox) * lado;
  const dy = y + 1150;
  const D = Math.min(L1 + L2 - 1, Math.max(20, Math.hypot(dx, dy)));
  const phi = Math.atan2(dx, dy);
  const alfa = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D));
  const o = phi + alfa;
  const ex = L1 * Math.sin(o);
  const ey = L1 * Math.cos(o);
  const seg = Math.atan2(dx - ex, dy - ey);
  const graus = (r: number) => (r * 180) / Math.PI;
  return { braco: graus(o), antebraco: graus(seg - o), anguloMao: graus(seg) };
};

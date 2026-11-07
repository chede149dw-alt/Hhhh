import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { clamp, useP, Vivo } from "../comum";
import { corridaForte } from "../../personagens/poses";
import { Aparencia, AparenciaCtx, APARENCIA_CHEDE } from "../../personagens/Chede";
import "@fontsource/roboto-condensed/800.css";

export const CIANO = "#59D8FF";
export const ROXO = "#7B4DFF";
export const AMARELO = "#FFD23F";
export const fonte = { fontFamily: "'Roboto Condensed'", fontWeight: 800 } as const;
export const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });

// Número grande com rótulo pequeno e entrada com mola (infográfico)
export const Info: React.FC<{ rotulo: string; valor: string; unidade?: string; x?: number; y: number; cor?: string; tam?: number; de?: number; centro?: boolean }> = ({
  rotulo, valor, unidade, x = 70, y, cor = "#fff", tam = 150, de = 4, centro,
}) => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - de, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", left: centro ? 0 : x, width: centro ? "100%" : undefined, textAlign: centro ? "center" : "left", top: y, ...fonte, color: cor, lineHeight: 1, transform: `scale(${sp})`, transformOrigin: centro ? "50% 50%" : "0 50%", opacity: sp }}>
      <div style={{ fontSize: tam * 0.3, color: "#fff", letterSpacing: 3, ...contorno(6) }}>{rotulo}</div>
      <div style={{ fontSize: tam, ...contorno(10) }}>
        {valor}
        {unidade && <span style={{ fontSize: tam * 0.4, color: "#fff" }}> {unidade}</span>}
      </div>
    </div>
  );
};

// Contador que sobe (km/h etc.)
export const Conta: React.FC<{ rotulo: string; de: number; ate: number; unidade: string; y: number; cor?: string; ini?: number; fim?: number; casas?: number }> = ({
  rotulo, de, ate, unidade, y, cor = AMARELO, ini = 0, fim = 0.6, casas = 0,
}) => {
  const { p } = useP();
  const v = interpolate(p, [ini, fim], [de, ate], clamp);
  return <Info rotulo={rotulo} valor={v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })} unidade={unidade} y={y} cor={cor} de={0} />;
};

export const SeloSegue: React.FC<{ top?: number }> = ({ top = 70 }) => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 6, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${sp})` }}>
      <div style={{ ...fonte, fontSize: 52, color: "#111", background: AMARELO, borderRadius: 60, padding: "14px 40px", border: "6px solid #000", boxShadow: "0 8px 0 rgba(0,0,0,0.5)", transform: `translateY(${Math.sin(f / 5) * 6}px)` }}>
        SEGUE PRA VER A PARTE 5 ▶
      </div>
    </div>
  );
};

// Relógio grande
export const Relogio: React.FC<{ hora: string; legenda?: string; y?: number }> = ({ hora, legenda, y = 230 }) => {
  const { f } = useP();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 3, fps, config: { damping: 11 } });
  return (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", ...fonte, transform: `scale(${sp})` }}>
      {legenda && <div style={{ fontSize: 46, color: "#fff", letterSpacing: 4, ...contorno(6) }}>{legenda}</div>}
      <div style={{ fontSize: 190, color: AMARELO, ...contorno(12) }}>{hora}</div>
    </div>
  );
};

// Kaik correndo com o Chede nas costas (desenho composto, perfil indo para a direita)
export const ChedeNasCostas: React.FC<{ f: number; s: number; medo?: boolean }> = ({ f, s, medo = true }) => (
  <g transform={`translate(${-150 * s},${-560 * s}) rotate(-28) `}>
    <Vivo quem="chede" x={0} y={0} s={s * 0.95} vista="perfil" expr={medo ? "medo" : "espanto"}
      pose={{ bracoE: 95, antebracoE: 20, bracoD: 100, antebracoD: 30, pernaE: 70 + Math.sin(f) * 6, joelhoE: -100, pernaD: 60, joelhoD: -90, cabeca: 20 + Math.sin(f * 1.7) * 4, olharX: 1 }} />
  </g>
);
export const poseCorrida = (f: number) => corridaForte(f, 0.75, 1);

// Chede com os olhos roxos (poder da fenda pelo olhar)
const APARENCIA_ROXA: Aparencia = { ...APARENCIA_CHEDE, corPoder: "#B48CFF" };
export const ComOlhoRoxo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AparenciaCtx.Provider value={APARENCIA_ROXA}>{children}</AparenciaCtx.Provider>
);

// Faixa de vinheta + cor (acabamento por cima de tudo)
export const Vinheta: React.FC<{ forca?: number }> = ({ forca = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(8,6,12,${forca}) 100%)` }} />
);

// Linhas de velocidade (vento) por cima
export const Vento: React.FC<{ n?: number; dir?: number; forca?: number }> = ({ n = 22, dir = 1, forca = 1 }) => {
  const { f } = useP();
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const y = (i * 137) % 1920;
        const x = ((i * 389 + f * 90 * dir) % 1600) - 300;
        return <line key={i} x1={x} y1={y} x2={x - 260 * dir} y2={y} stroke="#fff" strokeWidth={4} opacity={0.35 * forca} strokeLinecap="round" />;
      })}
    </svg>
  );
};

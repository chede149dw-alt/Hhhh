import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { BATIDAS, DURACAO, VERSOS } from "./letra";

// Versão "motion graphics": cortes secos entre fundos preto / branco / laranja,
// tipografia pesada, pílulas e etiquetas, ícones em traço que se desenham
// e rabiscos à mão. Uma cena por verso, sincronizada palavra por palavra.

// ---------- Fontes ----------
const F = "InterMotion";
loadFont({ family: F, url: staticFile("fonts/inter-latin-900-normal.woff2"), weight: "900" });
loadFont({ family: F, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: F, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });

// ---------- Paleta ----------
const LARANJA = "#F7A51C";
const PRETO = "#0E0E0E";
const BRANCO = "#F5F4F0";
const CINZA = "#3A3A3A";

const FPS = 30;
const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Tempo (s) da palavra j do verso i.
const T = (i: number, j: number) => VERSOS[i].palavras[j].t;

// Contexto com o tempo atual em segundos.
const TempoCtx = React.createContext(0);
const useT = () => React.useContext(TempoCtx);

// Progresso com mola (0..1, com leve overshoot) a partir de t0.
const mola = (t: number, t0: number, cfg = { damping: 12, stiffness: 190, mass: 0.6 }) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: cfg });
const linear = (t: number, t0: number, dur: number, e = ease) =>
  interpolate(t, [t0, t0 + dur], [0, 1], { ...clamp, easing: e });

// ---------- Impactos (tremida de câmera) ----------
const IMPACTOS = [T(1, 7), T(5, 4), T(13, 3), 16.1];
const tremida = (t: number) => {
  let x = 0;
  let y = 0;
  for (const i of IMPACTOS) {
    const d = t - i;
    if (d < 0 || d > 0.5) continue;
    const a = Math.exp(-d * 9) * 22;
    x += Math.sin(d * 85) * a;
    y += Math.cos(d * 70) * a * 0.7;
  }
  return { x, y };
};
const pulso = (t: number) =>
  BATIDAS.reduce((acc, b) => (t >= b ? Math.max(acc, Math.exp(-(t - b) * 6)) : acc), 0);

// ---------- Primitivos de texto ----------
type TxtProps = {
  t0: number;
  size: number;
  color?: string;
  weight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  de?: "baixo" | "esquerda" | "direita" | "zoom";
};

// Palavra que "pula" na tela com mola + motion blur na entrada.
const Txt: React.FC<TxtProps> = ({ t0, size, color = PRETO, weight = 900, children, style, de = "baixo" }) => {
  const t = useT();
  const s = mola(t, t0);
  const vis = t >= t0 ? 1 : 0;
  const blur = interpolate(t - t0, [0, 0.12], [12, 0], clamp);
  const mov =
    de === "baixo"
      ? `translateY(${(1 - s) * 60}px) scale(${0.6 + 0.4 * s})`
      : de === "esquerda"
        ? `translateX(${(1 - s) * -260}px)`
        : de === "direita"
          ? `translateX(${(1 - s) * 260}px)`
          : `scale(${1.9 - 0.9 * s})`;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: F,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.035em",
        color,
        opacity: vis,
        transform: mov,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Linha de palavras sincronizadas.
const Linha: React.FC<{
  palavras: [string, number][];
  size: number;
  color?: string;
  weight?: number;
  gap?: number;
  style?: React.CSSProperties;
}> = ({ palavras, size, color, weight, gap = 0.24, style }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: `0 ${gap}em`, fontSize: size, flexWrap: "wrap", ...style }}>
    {palavras.map(([p, t0], k) => (
      <Txt key={k} t0={t0} size={size} color={color} weight={weight}>
        {p}
      </Txt>
    ))}
  </div>
);

// Pílula arredondada laranja (ou outra cor) que abre do centro.
const Pilula: React.FC<{
  t0: number;
  size: number;
  bg?: string;
  color?: string;
  rot?: number;
  children: React.ReactNode;
}> = ({ t0, size, bg = LARANJA, color = BRANCO, rot = -2, children }) => {
  const t = useT();
  const s = mola(t, t0, { damping: 13, stiffness: 210, mass: 0.6 });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color,
        borderRadius: size,
        padding: `${size * 0.12}px ${size * 0.42}px ${size * 0.16}px`,
        fontFamily: F,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: t >= t0 ? 1 : 0,
        boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// Etiqueta retangular que entra deslizando (estilo lista empilhada).
const Etiqueta: React.FC<{
  t0: number;
  size: number;
  bg: string;
  color: string;
  rot?: number;
  lado?: 1 | -1;
  children: React.ReactNode;
}> = ({ t0, size, bg, color, rot = 0, lado = 1, children }) => {
  const t = useT();
  const s = mola(t, t0, { damping: 15, stiffness: 220, mass: 0.7 });
  const blur = interpolate(t - t0, [0, 0.14], [18, 0], clamp);
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color,
        padding: `${size * 0.08}px ${size * 0.3}px ${size * 0.12}px`,
        fontFamily: F,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        opacity: t >= t0 ? 1 : 0,
        transform: `translateX(${(1 - s) * 700 * lado}px) rotate(${rot}deg)`,
        filter: `blur(${blur}px)`,
        boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

// Marca-texto laranja que varre por trás do conteúdo.
const MarcaTexto: React.FC<{ t0: number; children: React.ReactNode; cor?: string }> = ({ t0, children, cor = LARANJA }) => {
  const t = useT();
  const p = linear(t, t0, 0.35);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-4%",
          right: "-4%",
          top: "52%",
          bottom: "-4%",
          background: cor,
          transform: `scaleX(${p}) rotate(-1.5deg)`,
          transformOrigin: "left center",
          borderRadius: 6,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// ---------- Primitivos gráficos ----------
// Caminho SVG que se desenha (pathLength normalizado).
const Traco: React.FC<{
  d: string;
  t0: number;
  dur?: number;
  cor?: string;
  largura?: number;
  fill?: string;
}> = ({ d, t0, dur = 0.6, cor = LARANJA, largura = 10, fill = "none" }) => {
  const t = useT();
  const p = linear(t, t0, dur, easeInOut);
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      stroke={cor}
      strokeWidth={largura}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={fill}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
    />
  );
};

// Arco laranja que atravessa a tela (swoosh).
const Swoosh: React.FC<{ t0: number; d: string; cor?: string; largura?: number; dur?: number }> = ({
  t0,
  d,
  cor = LARANJA,
  largura = 14,
  dur = 0.7,
}) => {
  const t = useT();
  const p = linear(t, t0, dur, easeInOut);
  if (p <= 0 || p >= 1) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path
        d={d}
        pathLength={1}
        stroke={cor}
        strokeWidth={largura}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="0.28 2"
        strokeDashoffset={0.28 - p * 1.28}
      />
    </svg>
  );
};

// Estrela de pontas (starburst) girando.
const Explosao: React.FC<{
  x: number;
  y: number;
  r: number;
  cor: string;
  t0: number;
  pontas?: number;
  blur?: number;
  vel?: number;
}> = ({ x, y, r, cor, t0, pontas = 12, blur = 0, vel = 20 }) => {
  const t = useT();
  const s = mola(t, t0, { damping: 10, stiffness: 160, mass: 0.7 });
  const pts: string[] = [];
  for (let i = 0; i < pontas * 2; i++) {
    const ang = (i / (pontas * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.62;
    pts.push(`${Math.cos(ang) * rr},${Math.sin(ang) * rr}`);
  }
  return (
    <svg
      width={r * 2.4}
      height={r * 2.4}
      viewBox={`${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}`}
      style={{
        position: "absolute",
        left: x - r * 1.2,
        top: y - r * 1.2,
        transform: `scale(${s}) rotate(${t * vel}deg)`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      <polygon points={pts.join(" ")} fill={cor} />
    </svg>
  );
};

// Brilho de 4 pontas que pisca.
const Brilho: React.FC<{ x: number; y: number; s: number; t0: number; cor?: string }> = ({ x, y, s, t0, cor = LARANJA }) => {
  const t = useT();
  const k = mola(t, t0, { damping: 9, stiffness: 200, mass: 0.5 });
  const some = interpolate(t - t0, [0.6, 1.1], [1, 0.85], clamp);
  return (
    <svg
      width={s}
      height={s}
      viewBox="-12 -12 24 24"
      style={{ position: "absolute", left: x - s / 2, top: y - s / 2, transform: `scale(${k * some}) rotate(${(t - t0) * 90}deg)` }}
    >
      <path d="M0 -12 C1.5 -2 2 -1.5 12 0 C2 1.5 1.5 2 0 12 C-1.5 2 -2 1.5 -12 0 C-2 -1.5 -1.5 -2 0 -12Z" fill={cor} />
    </svg>
  );
};

// Ondas circulares que se expandem (impacto).
const Ondas: React.FC<{ x: number; y: number; t0: number; cor?: string; n?: number; max?: number }> = ({
  x,
  y,
  t0,
  cor = LARANJA,
  n = 3,
  max = 700,
}) => {
  const t = useT();
  if (t < t0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {new Array(n).fill(0).map((_, i) => {
        const p = linear(t, t0 + i * 0.12, 0.9, Easing.out(Easing.cubic));
        if (p <= 0) return null;
        return <circle key={i} cx={x} cy={y} r={p * max} stroke={cor} strokeWidth={14 * (1 - p)} fill="none" opacity={1 - p} />;
      })}
    </svg>
  );
};

// Ícone grande desfocado no fundo (profundidade, como na referência).
const Fantasma: React.FC<{ children: React.ReactNode; x: number; y: number; s: number; rot?: number; blur?: number; o?: number }> = ({
  children,
  x,
  y,
  s,
  rot = 0,
  blur = 8,
  o = 0.9,
}) => {
  const t = useT();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: s,
        height: s,
        filter: `blur(${blur}px)`,
        opacity: o,
        transform: `rotate(${rot + Math.sin(t * 1.3) * 4}deg) translateY(${Math.sin(t * 1.1) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Cena: corte seco com "punch-in" ----------
const Cena: React.FC<{ ini: number; fim: number; bg: string; children: React.ReactNode }> = ({ ini, fim, bg, children }) => {
  const t = useT();
  if (t < ini || t >= fim) return null;
  const e = linear(t, ini, 0.28);
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.14 - 0.14 * e})`, filter: `blur(${(1 - e) * 6}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Centro: React.FC<{ children: React.ReactNode; y?: number; gap?: number; style?: React.CSSProperties }> = ({
  children,
  y = 0,
  gap = 14,
  style,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap,
      transform: `translateY(${y}px)`,
      padding: "0 70px",
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ---------- Caminhos de ícones ----------
const CORACAO = "M120 210 C 40 160 0 110 10 70 C 20 25 75 10 120 60 C 165 10 220 25 230 70 C 240 110 200 160 120 210 Z";
const RABISCO_CIRCULO = "M40 90 C 20 30 300 10 360 60 C 400 100 330 150 180 150 C 60 150 10 120 30 80 C 50 45 140 30 230 34";
const RABISCO_SUB = "M10 30 C 90 8 210 44 300 18 C 330 10 350 12 370 20";

// ======================= CENAS =======================

// 0 · Abertura
const Abertura = () => (
  <Cena ini={0} fim={T(0, 0)} bg={PRETO}>
    <Fantasma x={-120} y={1350} s={420} rot={-18} blur={10}>
      <Txt t0={0.1} size={420} color={LARANJA}>?</Txt>
    </Fantasma>
    <Fantasma x={760} y={180} s={320} rot={16} blur={6}>
      <Txt t0={0.25} size={320} color={LARANJA}>?</Txt>
    </Fantasma>
    <Swoosh t0={0.15} d="M -100 700 C 300 380 800 420 1180 820" />
    <Centro gap={22}>
      <Txt t0={0.35} size={90} color={BRANCO} weight={800}>
        eu
      </Txt>
      <Txt t0={0.6} size={190} color={BRANCO} de="zoom">
        lembro
      </Txt>
      <Pilula t0={1.05} size={92}>
        de tudo
      </Pilula>
    </Centro>
  </Cena>
);

// 1 · que me afastei de Deus
const Cena1 = () => {
  const t = useT();
  return (
    <Cena ini={T(0, 0)} fim={T(1, 0)} bg={BRANCO}>
      <Explosao x={960} y={260} r={120} cor={PRETO} t0={T(0, 0)} pontas={11} />
      <Explosao x={90} y={1700} r={160} cor={LARANJA} t0={T(0, 2)} pontas={10} vel={-15} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* raios de luz acima do texto */}
        {new Array(9).fill(0).map((_, i) => {
          const a = (-160 + i * 17.5) * (Math.PI / 180);
          const cx = 540;
          const cy = 760;
          const r1 = 250;
          const r2 = 340 + (i % 2) * 50;
          return (
            <Traco
              key={i}
              d={`M ${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1} L ${cx + Math.cos(a) * r2} ${cy + Math.sin(a) * r2}`}
              t0={T(0, 4) + i * 0.03}
              dur={0.25}
              largura={14}
            />
          );
        })}
      </svg>
      <Centro y={60} gap={16}>
        <Linha palavras={[["que", T(0, 0)], ["me", T(0, 1)]]} size={96} />
        <Linha palavras={[["afastei", T(0, 2)], ["de", T(0, 3)]]} size={140} />
        <div style={{ marginTop: 20, transform: `rotate(${Math.sin(t * 2) * 1.5}deg)` }}>
          <Pilula t0={T(0, 4)} size={170}>
            Deus
          </Pilula>
        </div>
      </Centro>
      <Brilho x={250} y={1240} s={70} t0={T(0, 4) + 0.1} />
      <Brilho x={850} y={1180} s={50} t0={T(0, 4) + 0.2} />
    </Cena>
  );
};

// 2 · quando o meu melhor amigo de infância morreu
const Cena2 = () => {
  const t = useT();
  const tm = T(1, 7);
  const sai = linear(t, tm - 0.02, 0.2);
  const progresso = interpolate(t, [T(1, 0), tm - 0.05, tm + 0.6], [0, 0.72, 1], clamp);
  // Linha de batimento: picos e depois linha reta.
  const ecg =
    "M 0 0 L 120 0 L 150 -40 L 175 60 L 205 -170 L 235 120 L 260 0 L 380 0 L 410 -40 L 435 60 L 465 -170 L 495 120 L 520 0 L 640 0 L 665 -30 L 690 40 L 715 -90 L 740 60 L 760 0 L 1080 0";
  return (
    <Cena ini={T(1, 0)} fim={T(2, 0)} bg={PRETO}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(0 1360)">
          <path
            d={ecg}
            pathLength={1}
            stroke={t >= tm ? CINZA : LARANJA}
            strokeWidth={12}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="1 1"
            strokeDashoffset={1 - progresso}
          />
        </g>
      </svg>
      <Centro y={-140} gap={18} style={{ opacity: 1 - sai, filter: `blur(${sai * 14}px)`, transform: `translateY(${-140 - sai * 80}px)` }}>
        <Linha palavras={[["quando", T(1, 0)], ["o", T(1, 1)], ["meu", T(1, 2)]]} size={88} color={BRANCO} weight={800} />
        <Linha palavras={[["melhor", T(1, 3)], ["amigo", T(1, 4)]]} size={136} color={BRANCO} />
        <div style={{ marginTop: 10, display: "flex", gap: 0 }}>
          <Pilula t0={T(1, 5)} size={104} rot={2}>
            de <span style={{ opacity: t >= T(1, 6) ? 1 : 0 }}>&nbsp;infância</span>
          </Pilula>
        </div>
      </Centro>
      <Centro y={-140}>
        <Txt t0={tm} size={210} color={BRANCO} de="zoom">
          morreu
        </Txt>
      </Centro>
    </Cena>
  );
};

// 3 · lembro quando amor da minha vida
const Cena3 = () => {
  const t = useT();
  const bate = 1 + Math.max(0, Math.sin((t - T(2, 2)) * 9)) * 0.06 * (t > T(2, 2) ? 1 : 0);
  return (
    <Cena ini={T(2, 0)} fim={T(3, 0)} bg={BRANCO}>
      <Explosao x={980} y={1640} r={150} cor={PRETO} t0={T(2, 0)} pontas={11} />
      <svg
        width={480}
        height={430}
        viewBox="-10 -10 260 230"
        style={{ position: "absolute", left: 300, top: 360, transform: `scale(${bate})` }}
      >
        <Traco d={CORACAO} t0={T(2, 0)} dur={0.75} largura={12} />
        {t > T(2, 2) && <path d={CORACAO} fill={LARANJA} opacity={linear(t, T(2, 2), 0.2)} />}
      </svg>
      <Centro y={230} gap={10}>
        <Linha palavras={[["lembro", T(2, 0)], ["quando", T(2, 1)]]} size={92} />
        <Txt t0={T(2, 2)} size={190} color={LARANJA}>
          amor
        </Txt>
        <div style={{ display: "flex", gap: 26, alignItems: "baseline" }}>
          <Txt t0={T(2, 3)} size={110}>
            da
          </Txt>
          <MarcaTexto t0={T(2, 5)}>
            <Linha palavras={[["minha", T(2, 4)], ["vida", T(2, 5)]]} size={110} />
          </MarcaTexto>
        </div>
      </Centro>
    </Cena>
  );
};

// 4 · enfim me conheceu
const Cena4 = () => {
  const t = useT();
  const junta = linear(t, T(3, 0), 0.7);
  return (
    <Cena ini={T(3, 0)} fim={T(4, 0)} bg={LARANJA}>
      <Explosao x={110} y={1680} r={170} cor={PRETO} t0={T(3, 0)} pontas={12} vel={-18} />
      <Explosao x={980} y={240} r={90} cor={BRANCO} t0={T(3, 1)} pontas={10} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540 - 230 * (1 - junta) - 70} cy={560} r={150} stroke={BRANCO} strokeWidth={18} fill="none" opacity={junta} />
        <circle cx={540 + 230 * (1 - junta) + 70} cy={560} r={150} stroke={PRETO} strokeWidth={18} fill="none" opacity={junta} />
      </svg>
      <Centro y={200} gap={8}>
        <Txt t0={T(3, 0)} size={200} de="zoom">
          enfim
        </Txt>
        <Txt t0={T(3, 1)} size={100} color={BRANCO}>
          me
        </Txt>
        <div style={{ position: "relative" }}>
          <Txt t0={T(3, 2)} size={150} color={BRANCO}>
            conheceu
          </Txt>
          <svg width={820} height={250} viewBox="0 0 400 165" preserveAspectRatio="none" style={{ position: "absolute", left: -110, top: -45 }}>
            <Traco d={RABISCO_CIRCULO} t0={T(3, 2) + 0.2} dur={0.55} cor={PRETO} largura={6} />
          </svg>
        </div>
      </Centro>
    </Cena>
  );
};

// 5 · ou do outro dia
const Cena5 = () => {
  const t = useT();
  return (
    <Cena ini={T(4, 0)} fim={T(5, 0)} bg={PRETO}>
      <Fantasma x={700} y={1350} s={400} rot={-12} blur={9} o={0.7}>
        <Explosao x={200} y={200} r={170} cor={LARANJA} t0={T(4, 0)} pontas={9} />
      </Fantasma>
      <svg width={420} height={420} viewBox="0 0 120 120" style={{ position: "absolute", left: 330, top: 380 }}>
        <Traco d="M 15 28 L 105 28 L 105 105 L 15 105 Z" t0={T(4, 0)} dur={0.4} largura={6} />
        <Traco d="M 15 48 L 105 48" t0={T(4, 0) + 0.25} dur={0.2} largura={6} />
        <Traco d="M 38 16 L 38 36 M 82 16 L 82 36" t0={T(4, 0) + 0.3} dur={0.2} largura={6} />
        <Traco d="M 40 76 L 55 90 L 82 62" t0={T(4, 3)} dur={0.3} largura={8} cor={BRANCO} />
      </svg>
      <Centro y={230} gap={26}>
        <Linha palavras={[["ou", T(4, 0)], ["do", T(4, 1)]]} size={110} color={BRANCO} />
        <Pilula t0={T(4, 2)} size={140} rot={-3}>
          outro<span style={{ opacity: t >= T(4, 3) ? 1 : 0 }}>&nbsp;dia</span>
        </Pilula>
      </Centro>
    </Cena>
  );
};

// 6 · de que o nosso menino nasceu  (troca: "menina" -> "menino")
const Cena6 = () => {
  const t = useT();
  const tn = T(5, 5);
  const painel = mola(t, tn, { damping: 16, stiffness: 140, mass: 0.8 });
  return (
    <Cena ini={T(5, 0)} fim={T(6, 0)} bg={BRANCO}>
      <Explosao x={960} y={220} r={120} cor={PRETO} t0={T(5, 0)} pontas={11} />
      <Centro y={-260} gap={8}>
        <Linha palavras={[["de", T(5, 0)], ["que", T(5, 1)], ["o", T(5, 2)]]} size={92} />
        <Txt t0={T(5, 3)} size={130}>
          nosso
        </Txt>
        <div style={{ position: "relative" }}>
          <Txt t0={T(5, 4)} size={230} color={LARANJA} de="zoom">
            menino
          </Txt>
          <svg width={760} height={70} viewBox="0 0 380 40" style={{ position: "absolute", left: -10, bottom: -50 }}>
            <Traco d={RABISCO_SUB} t0={T(5, 4) + 0.15} dur={0.4} cor={PRETO} largura={7} />
          </svg>
        </div>
      </Centro>
      <Brilho x={170} y={520} s={80} t0={T(5, 4) + 0.05} />
      <Brilho x={920} y={640} s={60} t0={T(5, 4) + 0.15} />
      <Brilho x={240} y={980} s={46} t0={T(5, 4) + 0.25} cor={PRETO} />
      {/* painel laranja diagonal que sobe com "nasceu" */}
      <div
        style={{
          position: "absolute",
          left: -100,
          right: -100,
          top: 1180,
          height: 1000,
          background: LARANJA,
          transform: `translateY(${(1 - painel) * 900}px) rotate(-6deg)`,
          transformOrigin: "left top",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", top: 1330 }}>
        <Txt t0={tn + 0.05} size={210} color={BRANCO} style={{ transform: `rotate(-6deg) translateY(${(1 - painel) * 900}px)` }}>
          nasceu
        </Txt>
      </AbsoluteFill>
    </Cena>
  );
};

// 7 · lembro do seu primeiro sorriso  (entrada do refrão)
const Cena7 = () => {
  const t = useT();
  return (
    <Cena ini={T(6, 0)} fim={T(7, 0)} bg={LARANJA}>
      <Explosao x={100} y={260} r={130} cor={BRANCO} t0={T(6, 0)} pontas={12} />
      <Explosao x={1000} y={1700} r={180} cor={PRETO} t0={T(6, 1)} pontas={11} vel={-16} />
      <svg width={460} height={460} viewBox="0 0 120 120" style={{ position: "absolute", left: 310, top: 330 }}>
        <Traco d="M 60 8 A 52 52 0 1 1 59.9 8" t0={T(6, 0)} dur={0.6} cor={BRANCO} largura={7} />
        {t > T(6, 2) && (
          <>
            <circle cx={42} cy={50} r={6 * mola(t, T(6, 2))} fill={BRANCO} />
            <circle cx={78} cy={50} r={6 * mola(t, T(6, 2) + 0.08)} fill={BRANCO} />
          </>
        )}
        <Traco d="M 34 72 Q 60 100 86 72" t0={T(6, 4)} dur={0.35} cor={PRETO} largura={8} />
      </svg>
      <Centro y={260} gap={22}>
        <Linha palavras={[["lembro", T(6, 0)], ["do", T(6, 1)], ["seu", T(6, 2)]]} size={96} />
        <Etiqueta t0={T(6, 3)} size={120} bg={BRANCO} color={PRETO} rot={-3} lado={-1}>
          primeiro
        </Etiqueta>
        <Etiqueta t0={T(6, 4)} size={150} bg={PRETO} color={BRANCO} rot={2}>
          sorriso
        </Etiqueta>
      </Centro>
      <Swoosh t0={T(6, 0) - 0.05} d="M 1180 300 C 700 120 200 400 -100 120" cor={BRANCO} />
    </Cena>
  );
};

// 8 · e de te ensinar a andar
const Cena8 = () => {
  const t = useT();
  const passos = [0, 1, 2, 3, 4, 5];
  return (
    <Cena ini={T(7, 0)} fim={T(8, 0)} bg={BRANCO}>
      {passos.map((i) => {
        const t0 = T(7, 0) + i * 0.27;
        const s = mola(t, t0, { damping: 10, stiffness: 220, mass: 0.5 });
        const x = 470 + (i % 2 === 0 ? -70 : 70);
        const y = 1780 - i * 150;
        return (
          <svg
            key={i}
            width={90}
            height={140}
            viewBox="0 0 40 62"
            style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${i % 2 === 0 ? -10 : 10}deg)` }}
          >
            <ellipse cx="20" cy="38" rx="13" ry="20" fill={LARANJA} />
            <circle cx="8" cy="10" r="4" fill={LARANJA} />
            <circle cx="17" cy="6" r="4.4" fill={LARANJA} />
            <circle cx="27" cy="8" r="3.8" fill={LARANJA} />
            <circle cx="34" cy="14" r="3.2" fill={LARANJA} />
          </svg>
        );
      })}
      <Centro y={-330} gap={14}>
        <Linha palavras={[["e", T(7, 0)], ["de", T(7, 1)], ["te", T(7, 2)]]} size={100} />
        <Txt t0={T(7, 3)} size={170}>
          ensinar
        </Txt>
        <Pilula t0={T(7, 4)} size={130} rot={-3}>
          a<span style={{ opacity: t >= T(7, 5) ? 1 : 0 }}>&nbsp;andar</span>
        </Pilula>
      </Centro>
      <Explosao x={980} y={1500} r={110} cor={PRETO} t0={T(7, 3)} pontas={11} />
    </Cena>
  );
};

// 9 · lembro de tudo que eu tinha prometido  (etiquetas empilhadas)
const Cena9 = () => {
  const t = useT();
  return (
    <Cena ini={T(8, 0)} fim={T(9, 0)} bg={PRETO}>
      <Fantasma x={-80} y={1420} s={360} rot={-10} blur={8} o={0.8}>
        <Explosao x={180} y={180} r={150} cor={LARANJA} t0={T(8, 0)} pontas={9} />
      </Fantasma>
      <Swoosh t0={T(8, 0)} d="M -100 1500 C 300 1100 700 1700 1180 1250" />
      <Centro gap={6}>
        <Etiqueta t0={T(8, 0)} size={120} bg={LARANJA} color={BRANCO} rot={-2} lado={-1}>
          lembro
        </Etiqueta>
        <Etiqueta t0={T(8, 1)} size={130} bg={BRANCO} color={PRETO} rot={1}>
          de <span style={{ opacity: t >= T(8, 2) ? 1 : 0 }}>tudo</span>
        </Etiqueta>
        <Etiqueta t0={T(8, 3)} size={110} bg={LARANJA} color={BRANCO} rot={-1} lado={-1}>
          que <span style={{ opacity: t >= T(8, 4) ? 1 : 0 }}>eu</span>{" "}
          <span style={{ opacity: t >= T(8, 5) ? 1 : 0 }}>tinha</span>
        </Etiqueta>
        <Etiqueta t0={T(8, 6)} size={150} bg={BRANCO} color={PRETO} rot={2}>
          prometido
        </Etiqueta>
      </Centro>
    </Cena>
  );
};

// 10 · lembro de quando eu te vi chorar
const Cena10 = () => {
  const t = useT();
  const tc = T(9, 6);
  const queda = linear(t, tc - 0.35, 0.35, Easing.in(Easing.quad));
  const gotaY = 280 + queda * 620;
  return (
    <Cena ini={T(9, 0)} fim={T(10, 0)} bg={BRANCO}>
      <Explosao x={90} y={1700} r={150} cor={PRETO} t0={T(9, 0)} pontas={11} />
      {t < tc + 0.02 && (
        <svg width={120} height={160} viewBox="0 0 24 32" style={{ position: "absolute", left: 480, top: gotaY, transform: `scale(${mola(t, T(9, 0))})` }}>
          <path d="M12 1 C 12 1 3 13 3 20 A 9 9 0 0 0 21 20 C 21 13 12 1 12 1 Z" fill={LARANJA} />
        </svg>
      )}
      <Ondas x={540} y={980} t0={tc} n={3} max={520} />
      <Centro y={-40} gap={12}>
        <Linha palavras={[["lembro", T(9, 0)], ["de", T(9, 1)], ["quando", T(9, 2)]]} size={88} />
        <Linha palavras={[["eu", T(9, 3)], ["te", T(9, 4)], ["vi", T(9, 5)]]} size={130} />
        <div style={{ position: "relative", marginTop: 10 }}>
          <Txt t0={tc} size={210} color={LARANJA} de="zoom">
            chorar
          </Txt>
          <svg width={860} height={360} viewBox="0 0 400 165" style={{ position: "absolute", left: -120, top: -80 }}>
            <Traco d={RABISCO_CIRCULO} t0={tc + 0.15} dur={0.5} cor={PRETO} largura={6} />
          </svg>
        </div>
      </Centro>
    </Cena>
  );
};

// 11 · lembro de cada um dos sacrifícios
const Relogio: React.FC<{ vel: number }> = ({ vel }) => {
  const t = useT();
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <circle cx="60" cy="60" r="48" stroke={LARANJA} strokeWidth="10" fill="none" />
      <line x1="60" y1="60" x2="60" y2="30" stroke={LARANJA} strokeWidth="10" strokeLinecap="round" transform={`rotate(${t * vel} 60 60)`} />
      <line x1="60" y1="60" x2="80" y2="60" stroke={LARANJA} strokeWidth="10" strokeLinecap="round" transform={`rotate(${t * vel * 0.12} 60 60)`} />
    </svg>
  );
};
const Cena11 = () => (
  <Cena ini={T(10, 0)} fim={T(11, 0)} bg={PRETO}>
    <Fantasma x={640} y={140} s={520} blur={5} o={0.85}>
      <Relogio vel={360} />
    </Fantasma>
    <Fantasma x={-160} y={1320} s={560} blur={10} o={0.6}>
      <Relogio vel={-240} />
    </Fantasma>
    <Centro gap={16}>
      <Linha palavras={[["lembro", T(10, 0)], ["de", T(10, 1)]]} size={90} color={BRANCO} weight={800} />
      <Linha palavras={[["cada", T(10, 2)], ["um", T(10, 3)]]} size={150} color={BRANCO} />
      <Txt t0={T(10, 4)} size={96} color={BRANCO} weight={800}>
        dos
      </Txt>
      <Pilula t0={T(10, 5)} size={124} rot={-2}>
        sacrifícios
      </Pilula>
    </Centro>
    <Swoosh t0={T(10, 5) - 0.1} d="M 1180 1250 C 800 1500 300 1050 -100 1400" cor={BRANCO} largura={10} />
  </Cena>
);

// 12 · dos erros de andar entre o bem e o mal  (tela dividida)
const Cena12 = () => {
  const t = useT();
  const div = mola(t, T(11, 0), { damping: 18, stiffness: 120, mass: 0.8 });
  const inclS = interpolate(t, [T(11, 6), T(11, 6) + 0.2, T(11, 9), T(11, 9) + 0.2], [0, -3, -3, 3], clamp);
  return (
    <Cena ini={T(11, 0)} fim={T(12, 0)} bg={BRANCO}>
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 1010,
          height: 1400,
          background: PRETO,
          transform: `translateX(${(1 - div) * 1400}px) rotate(-4deg)`,
        }}
      />
      <AbsoluteFill style={{ transform: `rotate(${inclS}deg)` }}>
        <Centro y={-470} gap={14}>
          <Linha palavras={[["dos", T(11, 0)], ["erros", T(11, 1)]]} size={150} />
          <Linha palavras={[["de", T(11, 2)], ["andar", T(11, 3)], ["entre", T(11, 4)]]} size={96} />
        </Centro>
        <Centro y={-60} gap={10}>
          <Pilula t0={T(11, 5)} size={150} rot={-3}>
            o<span style={{ opacity: t >= T(11, 6) ? 1 : 0 }}>&nbsp;bem</span>
          </Pilula>
        </Centro>
        <Centro y={300} gap={10}>
          <div style={{ display: "flex", gap: 30, alignItems: "baseline" }}>
            <Txt t0={T(11, 7)} size={110} color={BRANCO}>
              e
            </Txt>
            <Txt t0={T(11, 8)} size={110} color={BRANCO}>
              o
            </Txt>
            <Txt t0={T(11, 9)} size={200} color={LARANJA} de="zoom">
              mal
            </Txt>
          </div>
        </Centro>
      </AbsoluteFill>
      <Explosao x={970} y={1720} r={120} cor={LARANJA} t0={T(11, 9)} pontas={11} />
    </Cena>
  );
};

// 13 · e se eu tivesse outra chance
const Cena13 = () => {
  const t = useT();
  const gira = interpolate(t, [T(12, 0), T(12, 5) + 0.4], [0, -540], { ...clamp, easing: easeInOut });
  return (
    <Cena ini={T(12, 0)} fim={T(13, 0)} bg={LARANJA}>
      <Explosao x={120} y={240} r={120} cor={PRETO} t0={T(12, 0)} pontas={12} />
      <svg
        width={400}
        height={400}
        viewBox="0 0 120 120"
        style={{ position: "absolute", left: 340, top: 300, transform: `rotate(${gira}deg)` }}
      >
        <Traco d="M 100 60 A 40 40 0 1 1 82 26" t0={T(12, 0)} dur={0.45} cor={BRANCO} largura={10} />
        <Traco d="M 70 16 L 86 27 L 76 44" t0={T(12, 0) + 0.4} dur={0.2} cor={BRANCO} largura={10} />
      </svg>
      <Centro y={230} gap={18}>
        <Linha palavras={[["e", T(12, 0)], ["se", T(12, 1)], ["eu", T(12, 2)]]} size={100} />
        <Txt t0={T(12, 3)} size={180} color={BRANCO}>
          tivesse
        </Txt>
        <Pilula t0={T(12, 4)} size={124} bg={PRETO} color={BRANCO} rot={-3}>
          outra<span style={{ opacity: t >= T(12, 5) ? 1 : 0, color: LARANJA }}>&nbsp;chance</span>
        </Pilula>
      </Centro>
      <Explosao x={980} y={1720} r={170} cor={BRANCO} t0={T(12, 5)} pontas={11} vel={-14} />
    </Cena>
  );
};

// 14 · eu faria tudo igual  (clímax)
const Cena14 = () => {
  const t = useT();
  const ti = T(13, 3);
  const respira = t > ti + 0.5 ? 1 + Math.sin((t - ti) * 3) * 0.02 : 1;
  return (
    <Cena ini={T(13, 0)} fim={33.75} bg={PRETO}>
      <Ondas x={540} y={1060} t0={ti} n={4} max={900} />
      <Explosao x={120} y={300} r={150} cor={LARANJA} t0={ti + 0.05} pontas={12} />
      <Explosao x={980} y={1650} r={190} cor={LARANJA} t0={ti + 0.12} pontas={11} vel={-18} />
      <Explosao x={960} y={360} r={70} cor={BRANCO} t0={ti + 0.2} pontas={10} />
      <Swoosh t0={ti} d="M -100 1500 C 300 1250 750 1650 1180 1300" />
      <Swoosh t0={ti + 0.1} d="M 1180 600 C 800 380 300 760 -100 520" cor={BRANCO} largura={10} />
      <Centro y={-60} gap={14}>
        <Linha palavras={[["eu", T(13, 0)], ["faria", T(13, 1)]]} size={110} color={BRANCO} />
        <Txt t0={T(13, 2)} size={170} color={BRANCO}>
          tudo
        </Txt>
        <div style={{ transform: `scale(${respira}) rotate(-4deg)`, marginTop: 10 }}>
          <Txt t0={ti} size={290} color={LARANJA} de="zoom">
            igual
          </Txt>
        </div>
      </Centro>
      <Brilho x={200} y={1300} s={80} t0={ti + 0.2} />
      <Brilho x={880} y={800} s={60} t0={ti + 0.3} cor={BRANCO} />
    </Cena>
  );
};

// 15 · Encerramento
const Encerramento = () => {
  const t = useT();
  const ini = 33.75;
  const bate = 1 + Math.max(0, Math.sin((t - ini) * 7)) * 0.07;
  return (
    <Cena ini={ini} fim={DURACAO + 1} bg={BRANCO}>
      <Explosao x={960} y={260} r={120} cor={PRETO} t0={ini} pontas={11} />
      <Explosao x={110} y={1690} r={160} cor={LARANJA} t0={ini + 0.1} pontas={10} vel={-15} />
      <svg
        width={300}
        height={270}
        viewBox="-10 -10 260 230"
        style={{ position: "absolute", left: 390, top: 520, transform: `scale(${mola(t, ini) * bate})` }}
      >
        <path d={CORACAO} fill={LARANJA} />
      </svg>
      <Centro y={180} gap={18}>
        <Txt t0={ini + 0.15} size={110}>
          pro nosso
        </Txt>
        <Pilula t0={ini + 0.35} size={170} rot={-3}>
          menino
        </Pilula>
      </Centro>
    </Cena>
  );
};

// ======================= COMPOSIÇÃO =======================
export const ReelsMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { x, y } = tremida(t);
  const p = pulso(t);
  const fadeOut = interpolate(t, [DURACAO - 0.45, DURACAO], [1, 0], clamp);

  return (
    <TempoCtx.Provider value={t}>
      <AbsoluteFill style={{ backgroundColor: PRETO }}>
        <Audio src={staticFile("reels/musica.m4a")} />
        <AbsoluteFill style={{ opacity: fadeOut, transform: `translate(${x}px, ${y}px) scale(${1 + p * 0.025})` }}>
          <Abertura />
          <Cena1 />
          <Cena2 />
          <Cena3 />
          <Cena4 />
          <Cena5 />
          <Cena6 />
          <Cena7 />
          <Cena8 />
          <Cena9 />
          <Cena10 />
          <Cena11 />
          <Cena12 />
          <Cena13 />
          <Cena14 />
          <Encerramento />
        </AbsoluteFill>
      </AbsoluteFill>
    </TempoCtx.Provider>
  );
};


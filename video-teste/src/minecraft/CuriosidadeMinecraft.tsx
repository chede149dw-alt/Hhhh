import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  interpolateColors,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import T from "./timing.json";

// ---------- Fontes ----------
const PIXEL = "PixelArte"; // Press Start 2P
const SANS = "Inter";
loadFont({ family: PIXEL, url: staticFile("fonts/press-start-2p-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: SANS, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });

// ---------- Paleta ----------
const C = {
  fundo: "#0E1116",
  grade: "rgba(255,255,255,0.035)",
  texto: "#F4F1EA",
  verde: "#7BD34F",
  amarelo: "#FFD54A",
  cartao: "#161B22",
};
const ROSA = ["#F2B8C0", "#F2B8C0", "#E8A3AE", "#E8A3AE", "#D98C99", "#F7CAD0"];
const VERDE = ["#5DA130", "#5DA130", "#4E8C27", "#6DB83A", "#3F7420", "#7BC94A"];
const GRAMA = ["#5DA130", "#6DB83A", "#4E8C27", "#7BC94A"];
const TERRA = ["#7A5233", "#7A5233", "#8B6040", "#6A4529", "#5C3B22", "#93694A"];

const CELULA = 24;
const CHAO = 1480; // linha do chão (px a partir do topo)
const W = 1080;
const H = 1920;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Textura de pixels (SVG gerado uma vez) ----------
const textura = (seed: string, cols: number, rows: number, cores: string[]) => {
  let rects = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cor = cores[Math.floor(random(`${seed}-${x}-${y}`) * cores.length)];
      rects += `<rect x="${x * CELULA}" y="${y * CELULA}" width="${CELULA}" height="${CELULA}" fill="${cor}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * CELULA}" height="${rows * CELULA}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

// ---------- Fundo: grade + partículas ----------
const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const particulas = useMemo(
    () =>
      new Array(26).fill(0).map((_, i) => ({
        x: random(`px${i}`) * W,
        y: random(`py${i}`) * H,
        s: 8 + Math.floor(random(`ps${i}`) * 3) * 8,
        v: 0.6 + random(`pv${i}`) * 1.4,
        o: 0.08 + random(`po${i}`) * 0.18,
      })),
    [],
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.fundo,
        backgroundImage: `linear-gradient(${C.grade} 2px, transparent 2px), linear-gradient(90deg, ${C.grade} 2px, transparent 2px)`,
        backgroundSize: "72px 72px",
      }}
    >
      {particulas.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: (((p.y - frame * p.v) % H) + H) % H,
            width: p.s,
            height: p.s,
            backgroundColor: C.verde,
            opacity: p.o,
          }}
        />
      ))}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// ---------- Chão de blocos ----------
const Chao: React.FC = () => {
  const grama = useMemo(() => textura("grama", Math.ceil(W / CELULA), 2, GRAMA), []);
  const terra = useMemo(() => textura("terra", Math.ceil(W / CELULA), 20, TERRA), []);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: CHAO, width: W, height: CELULA * 2, backgroundImage: grama }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CHAO + CELULA * 2,
          width: W,
          height: H - CHAO,
          backgroundImage: terra,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CHAO,
          width: W,
          height: H - CHAO,
          background: "linear-gradient(rgba(0,0,0,0) 0%, rgba(14,17,22,0.85) 70%)",
        }}
      />
    </>
  );
};

// ---------- Personagem: porco que vira "bicho alto e verde" ----------
type Caixa = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpCaixa = (a: Caixa, b: Caixa, t: number): Caixa => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: Math.max(10, lerp(a.w, b.w, t)),
  h: Math.max(10, lerp(a.h, b.h, t)),
});

// Coordenadas: x relativo ao centro, y para cima a partir do chão.
const PORCO = {
  pernas: [
    { x: -210, y: 0, w: 70, h: 110 },
    { x: -130, y: 0, w: 70, h: 110 },
    { x: 60, y: 0, w: 70, h: 110 },
    { x: 140, y: 0, w: 70, h: 110 },
  ],
  corpo: { x: -220, y: 110, w: 440, h: 240 },
  cabeca: { x: 170, y: 220, w: 210, h: 210 },
  deslocX: -80,
};
const ALTO = {
  pernas: [
    { x: -100, y: 0, w: 48, h: 90 },
    { x: -52, y: 0, w: 48, h: 90 },
    { x: 4, y: 0, w: 48, h: 90 },
    { x: 52, y: 0, w: 48, h: 90 },
  ],
  corpo: { x: -100, y: 90, w: 200, h: 400 },
  cabeca: { x: -110, y: 490, w: 220, h: 220 },
  deslocX: 0,
};

const Bloco: React.FC<{
  caixa: Caixa;
  queda: number;
  mistura: number;
  texRosa: string;
  texVerde: string;
  deslocX: number;
  children?: React.ReactNode;
}> = ({ caixa, queda, mistura, texRosa, texVerde, deslocX, children }) => (
  <div
    style={{
      position: "absolute",
      left: W / 2 + deslocX + caixa.x,
      top: CHAO - (caixa.y + caixa.h) - queda,
      width: caixa.w,
      height: caixa.h,
      backgroundImage: texRosa,
      boxShadow: "inset 0 0 0 5px rgba(0,0,0,0.22), inset 0 10px 0 rgba(255,255,255,0.12)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: texVerde,
        opacity: Math.min(1, Math.max(0, mistura)),
        boxShadow: "inset 0 0 0 5px rgba(0,0,0,0.22), inset 0 10px 0 rgba(255,255,255,0.12)",
      }}
    />
    {children}
  </div>
);

const Personagem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tex = useMemo(
    () => ({
      pernas: [0, 1, 2, 3].map((i) => [textura(`pr${i}`, 4, 6, ROSA), textura(`pv${i}`, 4, 6, VERDE)]),
      corpo: [textura("cr", 19, 17, ROSA), textura("cv", 19, 17, VERDE)],
      cabeca: [textura("hr", 10, 10, ROSA), textura("hv", 10, 10, VERDE)],
    }),
    [],
  );

  if (frame < T.build[0]) return null;

  // Transformação (spring com leve "elástico")
  const m = spring({ frame: frame - T.morph[0], fps, config: { damping: 11, mass: 0.9, stiffness: 90 } });
  const corMix = interpolate(frame, [T.morph[0], T.morph[0] + 25], [0, 1], clamp);

  // Respiração sutil
  const resp = Math.sin(frame / 9) * 4;

  const queda = (i: number) => {
    const s = spring({ frame: frame - T.partDrops[i], fps, config: { damping: 13, mass: 0.7 } });
    return (1 - s) * 1100;
  };

  const deslocX = lerp(PORCO.deslocX, ALTO.deslocX, m);
  const cabeca = lerpCaixa(PORCO.cabeca, ALTO.cabeca, m);
  const corpo = lerpCaixa(PORCO.corpo, ALTO.corpo, m);

  // Rosto
  const rostoS = spring({ frame: frame - T.facePop, fps, config: { damping: 10 } });
  const oy = lerp(0.25, 0.28, m);
  const os = lerp(30, 46, m) * rostoS;
  const olho = (lado: 0 | 1): React.CSSProperties => {
    const xPorco = lado === 0 ? 0.3 : 0.62;
    const xAlto = lado === 0 ? 0.2 : 0.59;
    const x = lerp(xPorco, xAlto, m);
    return {
      position: "absolute",
      left: cabeca.w * x,
      top: cabeca.h * oy,
      width: os,
      height: os,
      backgroundColor: "#1B1B1B",
    };
  };

  const sombraW = lerp(600, 280, m);

  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${resp * 0.3}px)` }}>
      <div
        style={{
          position: "absolute",
          left: W / 2 + deslocX + lerp(80, 0, m) - sombraW / 2,
          top: CHAO - 10,
          width: sombraW,
          height: 20,
          backgroundColor: "rgba(0,0,0,0.35)",
          opacity: interpolate(queda(4), [0, 400], [1, 0], clamp),
        }}
      />
      {PORCO.pernas.map((p, i) => (
        <Bloco
          key={i}
          caixa={lerpCaixa(p, ALTO.pernas[i], m)}
          queda={queda(i)}
          mistura={corMix}
          texRosa={tex.pernas[i][0]}
          texVerde={tex.pernas[i][1]}
          deslocX={deslocX}
        />
      ))}
      <Bloco
        caixa={corpo}
        queda={queda(4)}
        mistura={corMix}
        texRosa={tex.corpo[0]}
        texVerde={tex.corpo[1]}
        deslocX={deslocX}
      />
      <Bloco
        caixa={{ ...cabeca, y: cabeca.y + resp * (1 - m) * 0.5 }}
        queda={queda(5)}
        mistura={corMix}
        texRosa={tex.cabeca[0]}
        texVerde={tex.cabeca[1]}
        deslocX={deslocX}
      >
        <div style={olho(0)} />
        <div style={olho(1)} />
        {/* Focinho do porco: some na transformação */}
        <div
          style={{
            position: "absolute",
            left: cabeca.w * 0.52,
            top: cabeca.h * 0.52,
            width: 96 * rostoS,
            height: 66 * rostoS,
            backgroundColor: "#D47F8E",
            boxShadow: "inset 0 0 0 4px rgba(0,0,0,0.15)",
            opacity: 1 - corMix,
          }}
        >
          <div style={{ position: "absolute", left: 16, top: 22, width: 18, height: 22, backgroundColor: "#7A3E49" }} />
          <div style={{ position: "absolute", right: 16, top: 22, width: 18, height: 22, backgroundColor: "#7A3E49" }} />
        </div>
      </Bloco>
    </div>
  );
};

// ---------- Legenda palavra por palavra ----------
const Legenda: React.FC<{
  texto: string;
  destaque?: string[];
  cor?: string;
  inicio: number;
  fim: number;
  top: number;
  tamanho?: number;
}> = ({ texto, destaque = [], cor = C.verde, inicio, fim, top, tamanho = 84 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < inicio || frame >= fim) return null;
  const saida = interpolate(frame, [fim - 9, fim], [0, 1], clamp);
  const palavras = texto.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: tamanho * 0.28,
        rowGap: tamanho * 0.08,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: tamanho,
        lineHeight: 1.12,
        letterSpacing: -1.5,
        opacity: 1 - saida,
        transform: `translateY(${-saida * 40}px)`,
      }}
    >
      {palavras.map((p, i) => {
        const local = frame - inicio - i * 3;
        const s = spring({ frame: local, fps, config: { damping: 14, mass: 0.6 } });
        const limpa = p.toLowerCase().replace(/[.,!?:]/g, "");
        const realce = destaque.includes(limpa);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: realce ? cor : C.texto,
              opacity: interpolate(local, [0, 4], [0, 1], clamp),
              transform: `translateY(${(1 - s) * 50}px) scale(${0.9 + 0.1 * s})`,
              textShadow: "0 6px 0 rgba(0,0,0,0.35)",
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

// Etiqueta em fonte pixel
const Etiqueta: React.FC<{ texto: string; inicio: number; fim: number; top: number; cor?: string }> = ({
  texto,
  inicio,
  fim,
  top,
  cor = C.verde,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < inicio || frame >= fim) return null;
  const s = spring({ frame: frame - inicio, fps, config: { damping: 12 } });
  const saida = interpolate(frame, [fim - 9, fim], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: PIXEL,
          fontSize: 30,
          color: C.fundo,
          backgroundColor: cor,
          padding: "16px 22px 12px",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.45)",
          transform: `scale(${s})`,
          opacity: 1 - saida,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// ---------- Cena 1: gancho ----------
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const [ini, fim] = T.hook;
  if (frame >= fim) return null;
  const titulo = "VOCÊ SABIA?";
  const n = Math.min(titulo.length, Math.max(0, Math.floor((frame - 4) / 2.2)));
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const saida = interpolate(frame, [fim - 9, fim], [0, 1], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: PIXEL,
          fontSize: 76,
          color: C.verde,
          textShadow: "8px 8px 0 #1F3A12",
          opacity: 1 - saida,
          transform: `translateY(${-saida * 40}px)`,
        }}
      >
        {titulo.slice(0, n)}
        <span style={{ opacity: cursor && n < titulo.length + 1 ? 1 : 0 }}>_</span>
      </div>
      <Legenda
        texto="O monstro mais famoso do Minecraft nasceu de um erro."
        destaque={["erro"]}
        cor={C.amarelo}
        inicio={ini + 32}
        fim={fim}
        top={720}
        tamanho={96}
      />
    </>
  );
};

// ---------- Cena 3: cartão "troca" ----------
const CartaoTroca: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ini, fim] = T.swap;
  if (frame < ini || frame >= fim) return null;
  const entra = spring({ frame: frame - ini - 4, fps, config: { damping: 14 } });
  const saida = interpolate(frame, [fim - 8, fim], [0, 1], clamp);
  const troca = interpolate(frame, [T.swapAt, T.swapAt + 14], [0, 1], { ...clamp, easing: ease });
  const arco = Math.sin(troca * Math.PI) * 70;
  const linhaH = 96;
  const linha = (rotulo: string, icone: string, de: number, para: number, lado: 1 | -1) => (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 120 + lerp(de, para, troca) * linhaH,
        transform: `translateX(${arco * lado}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: PIXEL,
        fontSize: 34,
        color: troca > 0.98 ? C.amarelo : C.texto,
      }}
    >
      <span style={{ color: C.verde, width: 48, fontFamily: SANS, fontWeight: 800, fontSize: 48 }}>{icone}</span>
      {rotulo}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 600,
        width: 800,
        height: 330,
        backgroundColor: C.cartao,
        border: "4px solid #2A3240",
        boxShadow: "12px 12px 0 rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - entra) * 80}px) scale(${0.92 + 0.08 * entra})`,
        opacity: entra * (1 - saida),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 44,
          fontFamily: PIXEL,
          fontSize: 22,
          color: "#6B7686",
        }}
      >
        {"// porco (ilustração)"}
      </div>
      {linha("COMPRIMENTO", "↔", 0, 1, 1)}
      {linha("ALTURA", "↕", 1, 0, -1)}
    </div>
  );
};

// ---------- Cena 5: revelação ----------
const Revelacao: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ini, fim] = T.reveal;
  if (frame < ini || frame >= fim) return null;
  const s = spring({ frame: frame - ini, fps, config: { damping: 9, mass: 0.8 } });
  const saida = interpolate(frame, [fim - 9, fim], [0, 1], clamp);
  const pre = interpolate(frame, [ini, ini + 6], [0, 1], clamp);
  return (
    <div style={{ opacity: 1 - saida, transform: `translateY(${-saida * 40}px)` }}>
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 84,
          color: C.texto,
          opacity: pre,
          textShadow: "0 6px 0 rgba(0,0,0,0.35)",
        }}
      >
        Nascia o
      </div>
      <div
        style={{
          position: "absolute",
          top: 390,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: PIXEL,
          fontSize: 116,
          color: C.verde,
          textShadow: "10px 10px 0 #1F3A12",
          transform: `scale(${interpolate(s, [0, 1], [2.4, 1])})`,
          opacity: interpolate(frame - ini, [0, 3], [0, 1], clamp),
        }}
      >
        CREEPER
      </div>
    </div>
  );
};

// ---------- Cena 6: final ----------
const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ini, fim] = T.outro;
  if (frame < ini) return null;
  const cta = spring({ frame: frame - T.ctaAt, fps, config: { damping: 12 } });
  const pulo = Math.abs(Math.sin((frame - T.ctaAt) / 6)) * 10;
  return (
    <>
      <Legenda
        texto="Um erro virou o símbolo do jogo."
        destaque={["símbolo"]}
        cor={C.verde}
        inicio={ini + 4}
        fim={fim + 1}
        top={230}
        tamanho={80}
      />
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: frame >= T.ctaAt ? 1 : 0,
          transform: `scale(${cta})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            backgroundColor: C.amarelo,
            color: C.fundo,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 44,
            padding: "22px 36px",
            boxShadow: "8px 8px 0 rgba(0,0,0,0.5)",
          }}
        >
          Segue pra mais curiosidades
          <span style={{ fontFamily: PIXEL, fontSize: 34, transform: `translateY(${pulo}px)` }}>▼</span>
        </div>
      </div>
    </>
  );
};

// ---------- Barra de progresso ----------
const Progresso: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: W, height: 12, backgroundColor: "rgba(255,255,255,0.08)" }}>
      <div style={{ width: (frame / T.duration) * W, height: 12, backgroundColor: C.verde }} />
    </div>
  );
};

// ---------- Composição ----------
export const CuriosidadeMinecraft: React.FC = () => {
  const frame = useCurrentFrame();

  // Tremida e flash na revelação
  const tremor = interpolate(frame, [T.reveal[0], T.reveal[0] + 16], [1, 0], clamp);
  const tx = (random(`tx${frame}`) - 0.5) * 36 * tremor;
  const ty = (random(`ty${frame}`) - 0.5) * 36 * tremor;
  const flash = interpolate(frame, [T.reveal[0] - 1, T.reveal[0], T.reveal[0] + 8], [0, 0.85, 0], clamp);

  // Escurece levemente durante a transformação
  const tensao = interpolate(
    frame,
    [T.morph[0], T.morph[1], T.reveal[0] - 1, T.reveal[0]],
    [0, 0.25, 0.4, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.fundo, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px)` }}>
        <Fundo />
        <Chao />
        <Personagem />
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: tensao, pointerEvents: "none" }} />

        <Gancho />

        <Etiqueta texto="2009" inicio={T.facePop - 4} fim={T.build[1]} top={190} />
        <Legenda
          texto="Notch queria criar um porco para o jogo."
          destaque={["porco"]}
          cor="#F2B8C0"
          inicio={T.facePop}
          fim={T.build[1]}
          top={290}
        />

        <Legenda
          texto="Mas trocou a altura pelo comprimento no código."
          destaque={["altura", "comprimento"]}
          cor={C.amarelo}
          inicio={T.swap[0]}
          fim={T.morph[1]}
          top={290}
        />
        <CartaoTroca />

        <Legenda
          texto="O resultado: um bicho alto, verde e meio esquisito."
          destaque={["alto", "verde"]}
          cor={C.verde}
          inicio={T.result[0]}
          fim={T.result[1]}
          top={290}
        />

        <Revelacao />
        <Final />
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
      <Progresso />
      <Audio src={staticFile("minecraft/trilha.wav")} />
    </AbsoluteFill>
  );
};

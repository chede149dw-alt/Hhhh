import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fontes embutidas no projeto (pasta public/fonts).
const serif = "Playfair Display";
const serifItalic = "Playfair Display";
const sans = "Inter";
const fontes = [
  { family: serif, file: "playfair-display-latin-500-normal.woff2", weight: "500", style: "normal" },
  { family: serif, file: "playfair-display-latin-500-italic.woff2", weight: "500", style: "italic" },
  { family: sans, file: "inter-latin-400-normal.woff2", weight: "400", style: "normal" },
  { family: sans, file: "inter-latin-600-normal.woff2", weight: "600", style: "normal" },
];
fontes.forEach((f) =>
  loadFont({
    family: f.family,
    url: staticFile(`fonts/${f.file}`),
    weight: f.weight,
    style: f.style,
  }),
);

// Nome e textos da loja: troque aqui.
const MARCA = "ATELIÊ";
const TEMPORADA = "Outono / Inverno 2026";

const CORES = {
  creme: "#F3EDE4",
  tinta: "#1E1B18",
  terracota: "#B5643C",
  areia: "#D9C7AE",
  oliva: "#6B6B4E",
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fadeOut = (frame: number, end: number, dur = 12) =>
  interpolate(frame, [end - dur, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Texto que sobe de dentro de uma "máscara".
const Reveal: React.FC<{
  children: React.ReactNode;
  delay: number;
  style?: React.CSSProperties;
}> = ({ children, delay, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div style={{ overflow: "hidden", lineHeight: 1.05 }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, ...style }}>
        {children}
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = CORES.tinta,
}) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: 8,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

// Cena 1: título "Nova Coleção"
const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const linha = interpolate(frame, [5, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const labelOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: CORES.creme,
        padding: 110,
        justifyContent: "center",
        opacity: fadeOut(frame, 80),
      }}
    >
      <div style={{ opacity: labelOpacity, marginBottom: 50 }}>
        <Label>{TEMPORADA}</Label>
      </div>
      <div
        style={{
          height: 3,
          width: `${linha * 100}%`,
          backgroundColor: CORES.tinta,
          marginBottom: 60,
        }}
      />
      <Reveal delay={18} style={{ fontFamily: serif, fontSize: 230, color: CORES.tinta }}>
        Nova
      </Reveal>
      <Reveal
        delay={28}
        style={{
          fontFamily: serifItalic,
          fontStyle: "italic",
          fontSize: 230,
          color: CORES.terracota,
        }}
      >
        Coleção
      </Reveal>
    </AbsoluteFill>
  );
};

// Cena 2: três peças / tecidos entrando em sequência
const PECAS = [
  { nome: "Linho", cor: CORES.areia },
  { nome: "Lã", cor: CORES.terracota },
  { nome: "Algodão", cor: CORES.oliva },
];

const Pecas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: CORES.creme,
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
        opacity: fadeOut(frame, 95),
      }}
    >
      <Label>Materiais da estação</Label>
      <div style={{ display: "flex", gap: 36 }}>
        {PECAS.map((peca, i) => {
          const s = spring({
            frame: frame - 8 - i * 9,
            fps,
            config: { damping: 18, mass: 0.8 },
          });
          return (
            <div
              key={peca.nome}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30,
                opacity: s,
                transform: `translateY(${(1 - s) * 220}px)`,
              }}
            >
              <div
                style={{
                  width: 270,
                  height: 720,
                  backgroundColor: peca.cor,
                  borderRadius: "135px 135px 6px 6px",
                  boxShadow: "0 30px 60px rgba(30,27,24,0.15)",
                }}
              />
              <div style={{ fontFamily: serifItalic, fontStyle: "italic", fontSize: 58, color: CORES.tinta }}>
                {peca.nome}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Cena 3: frase palavra por palavra em fundo escuro
const FRASE = ["Peças", "feitas", "para", "durar."];

const Frase: React.FC = () => {
  const frame = useCurrentFrame();
  const cortina = interpolate(frame, [0, 14], [100, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: CORES.tinta,
        transform: `translateY(${cortina}%)`,
        padding: 110,
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: fadeOut(frame, 75) }}>
        {FRASE.map((palavra, i) => (
          <Reveal
            key={palavra}
            delay={8 + i * 8}
            style={{
              fontFamily: i === FRASE.length - 1 ? serifItalic : serif,
              fontStyle: i === FRASE.length - 1 ? "italic" : "normal",
              fontSize: 190,
              color: i === FRASE.length - 1 ? CORES.terracota : CORES.creme,
            }}
          >
            {palavra}
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Cena 4: marca e chamada final
const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const espacamento = interpolate(frame, [0, 45], [60, 22], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const marcaOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const sublinhado = interpolate(frame, [22, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const ctaOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: CORES.creme,
        justifyContent: "center",
        alignItems: "center",
        gap: 50,
      }}
    >
      <div
        style={{
          fontFamily: serif,
          fontSize: 150,
          letterSpacing: espacamento,
          marginRight: -espacamento,
          color: CORES.tinta,
          opacity: marcaOpacity,
        }}
      >
        {MARCA}
      </div>
      <div style={{ height: 3, width: 420 * sublinhado, backgroundColor: CORES.terracota }} />
      <div style={{ opacity: ctaOpacity, textAlign: "center" }}>
        <div style={{ fontFamily: serifItalic, fontStyle: "italic", fontSize: 72, color: CORES.tinta, marginBottom: 24 }}>
          Disponível agora
        </div>
        <Label color={CORES.oliva}>Link na bio</Label>
      </div>
    </AbsoluteFill>
  );
};

export const NovaColecao: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CORES.creme }}>
    <Sequence durationInFrames={80}>
      <Abertura />
    </Sequence>
    <Sequence from={75} durationInFrames={95}>
      <Pecas />
    </Sequence>
    <Sequence from={165} durationInFrames={80}>
      <Frase />
    </Sequence>
    <Sequence from={240} durationInFrames={60}>
      <Final />
    </Sequence>
  </AbsoluteFill>
);

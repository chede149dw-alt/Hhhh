import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/roboto-condensed/800.css";
import { Aparencia, AparenciaCtx, Cabeca, Chede, CORES_CHEDE, Expressao, Pose, Vista } from "./Chede";

// Lia Moraes — a dona da carteirinha. Mesmo rig, aparência própria.
// ANTES: 21 anos, aluna da faculdade. Cor dela: verde-musgo.
// DEPOIS: 16 anos presa no outro lugar (2 anos aqui × 8). Gravidade fraca esticou o corpo (≈2,3 m),
// poeira preta do chão grudada nas mãos e pés, olhos que refletem luz, cabelo grisalho com gelo.
export const CORES_LIA = {
  ...CORES_CHEDE,
  pele: "#C68B5E",
  peleSombra: "#A26E47",
  peleLuz: "#D9A27A",
  cabelo: "#3A2618",
  cabeloSombra: "#24170E",
  cabeloBrilho: "#6A4A33",
  camisa: "#5E7A45", // moletom verde-musgo
  camisaSombra: "#48613A",
  camisaDetalhe: "#3A4F2E",
  bermuda: "#8FA9C9", // calça jeans clara
  bermudaSombra: "#6F8AAD",
  boca: "#7A3A2E",
};
export const APARENCIA_LIA: Aparencia = {
  cores: CORES_LIA, cabelo: "ondulado", estampa: "bolso", roupa: "moletom", calca: true, cabeloLongo: "tranca", sardas: true,
};

export const CORES_LIA_DEPOIS = {
  ...CORES_LIA,
  pele: "#B39A88", // 16 anos sem sol
  peleSombra: "#8E7767",
  peleLuz: "#C9B2A2",
  cabelo: "#9C9A98",
  cabeloSombra: "#6E6C6B",
  cabeloBrilho: "#C9C7C4",
  camisa: "#6F7A62", // o mesmo moletom, desbotado
  camisaSombra: "#58614E",
  camisaDetalhe: "#454C3D",
  bermuda: "#6E7A88",
  bermudaSombra: "#56606C",
  tenis: "#1A181C", // pés descalços sujos de poeira preta
  tenisSombra: "#100F12",
  tenisSola: "#08070A",
};
export const COR_OLHOS_LIA = "#CFEFFF";
export const APARENCIA_LIA_DEPOIS: Aparencia = {
  cores: CORES_LIA_DEPOIS, cabelo: "ondulado", estampa: "bolso", roupa: "moletom", calca: true,
  cabeloLongo: "solto", sardas: true, maos: "#141216", dedosLongos: true, geada: true, corPoder: COR_OLHOS_LIA,
};

type P = { expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean };
export const Lia: React.FC<P> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_LIA}><Chede {...props} /></AparenciaCtx.Provider>
);
// esticada: mais alta e mais magra
export const LiaDepois: React.FC<P> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_LIA_DEPOIS}>
    <g transform="scale(0.84,1.3)"><Chede {...props} pose={{ olhosPoder: 1, ...props.pose }} /></g>
  </AparenciaCtx.Provider>
);

const W = 2400, H = 1900;
const T: React.FC<{ x: number; y: number; t: string; s?: number; c?: string }> = ({ x, y, t, s = 40, c = "#2A2A2E" }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={s} fill={c}>{t.toUpperCase()}</text>
);

export const FichaLia: React.FC = () => (
  <AbsoluteFill style={{ background: "#EFE9DD" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <radialGradient id="escuroLia" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#2A2440" />
          <stop offset="100%" stopColor="#0C0A12" />
        </radialGradient>
      </defs>
      <T x={W / 2} y={90} t="Lia Moraes — ficha (proposta)" s={72} />
      {/* ANTES */}
      <T x={600} y={180} t="Antes · 21 anos (carteirinha)" s={48} />
      {["#5E7A45", "#8FA9C9", "#C68B5E", "#3A2618", "#EFEDE8"].map((c, i) => (
        <rect key={c} x={600 - 225 + i * 90} y={205} width={80} height={32} rx={8} fill={c} />
      ))}
      <AparenciaCtx.Provider value={APARENCIA_LIA}>
        {(["frente", "tresQuartos", "costas"] as Vista[]).map((v, i) => (
          <g key={v} transform={`translate(${220 + i * 380},1180) scale(0.58)`}>
            <Chede vista={v} expressao={i === 0 ? "feliz" : "neutro"} pose={i === 1 ? { bracoD: 20, antebracoD: 40 } : {}} />
          </g>
        ))}
        {(["feliz", "determinado", "espanto", "medo"] as Expressao[]).map((e, i) => (
          <g key={e} transform={`translate(${180 + i * 280},1420) scale(0.45)`}>
            <Cabeca expressao={e} pose={{}} />
          </g>
        ))}
      </AparenciaCtx.Provider>
      {["Frente", "3/4", "Costas"].map((n, i) => <T key={n} x={220 + i * 380} y={1240} t={n} s={34} />)}
      {["Feliz", "Determinada", "Espanto", "Medo"].map((n, i) => <T key={n} x={180 + i * 280} y={1730} t={n} s={30} />)}
      <T x={600} y={1800} t="Moletom verde-musgo · trança · sardas" s={36} c="#5E7A45" />
      {/* DEPOIS */}
      <rect x={1220} y={140} width={1140} height={1720} rx={30} fill="url(#escuroLia)" />
      <T x={1790} y={210} t="Agora · 16 anos lá dentro (37 de corpo)" s={46} c="#EDE7FF" />
      {/* Chede para comparar a altura */}
      <g transform="translate(1380,1500) scale(0.55)" opacity={0.85}><Chede vista="tresQuartos" expressao="medo" pose={{ olharX: 1, olharY: -0.6 }} /></g>
      <T x={1380} y={1560} t="Chede 1,75 m" s={30} c="#BDB4D8" />
      <g transform="translate(1690,1500) scale(0.55)"><LiaDepois vista="frente" expressao="medo" pose={{ bracoE: 8, bracoD: 8, cabeca: 6 }} /></g>
      <T x={1690} y={1560} t="Lia ≈ 2,3 m" s={30} c="#EDE7FF" />
      <g transform="translate(2050,1500) scale(0.55)"><LiaDepois vista="tresQuartos" expressao="cansado" pose={{ cabeca: 16, bracoD: 40, antebracoD: 70, bracoE: 10, olharX: -0.6, olharY: 0.4 }} /></g>
      <T x={2050} y={1560} t="Pedindo ajuda" s={30} c="#EDE7FF" />
      {/* close dos olhos */}
      <AparenciaCtx.Provider value={APARENCIA_LIA_DEPOIS}>
        <g transform="translate(1440,420) scale(0.38)"><Cabeca expressao="medo" pose={{ olhosPoder: 1 }} /></g>
      </AparenciaCtx.Provider>
      <T x={1440} y={560} t="Olhos refletem luz" s={26} c="#CFEFFF" />
      {[
        "Gravidade fraca: corpo esticou (dedos 14 cm, pés 40 cm)",
        "Mãos e pés pretos: poeira do chão de pedra",
        "Cabelo grisalho com gelo (4 °C)",
        "O mesmo moletom verde, desbotado",
      ].map((t, i) => <T key={t} x={1790} y={1650 + i * 50} t={t} s={30} c="#D9D2F0" />)}
    </svg>
  </AbsoluteFill>
);

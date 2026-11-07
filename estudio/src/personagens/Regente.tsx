import React from "react";
import { Aparencia, AparenciaCtx, Cabeca, Chede, CORES_CHEDE, Expressao, Pose, Vista } from "./Chede";

// O Regente (Otávio Regis) — o vilão. Controle mental; manda no governo por dentro.
// Mesmo rig do Chede, aparência própria: terno grafite, gravata âmbar, cabelo grisalho penteado para trás.
export const COR_PODER_REGENTE = "#FFB21E"; // âmbar: brilho dos olhos, ondas mentais, anel dos controlados

export const CORES_REGENTE = {
  ...CORES_CHEDE,
  pele: "#E3B993",
  peleSombra: "#C29673",
  peleLuz: "#F1D2B3",
  cabelo: "#8E9098",
  cabeloSombra: "#5F616A",
  cabeloBrilho: "#C8CAD0",
  camisa: "#2B2E38", // paletó
  camisaSombra: "#1E2028",
  camisaDetalhe: "#14161C", // lapela / botões
  bermuda: "#2B2E38", // calça
  bermudaSombra: "#1C1E25",
  tenis: "#1A1A1E", // sapato social
  tenisSombra: "#101013",
  tenisSola: "#060608",
  boca: "#7A3A2E",
};

export const APARENCIA_REGENTE: Aparencia = {
  cores: CORES_REGENTE,
  cabelo: "penteado",
  estampa: "terno",
  camisaSocial: "#F2F2EE",
  gravata: "#E8A317",
  gravataSombra: "#B97F0E",
  corPoder: COR_PODER_REGENTE,
  rugas: true,
};

export const Regente: React.FC<{ expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_REGENTE}>
    <Chede {...props} />
  </AparenciaCtx.Provider>
);

export const CabecaRegente: React.FC<{ expressao: Expressao; pose: Pose; vista?: Vista }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_REGENTE}>
    <Cabeca {...props} />
  </AparenciaCtx.Provider>
);

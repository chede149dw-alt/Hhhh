import React from "react";
import { Aparencia, AparenciaCtx, Cabeca, Chede, CORES_CHEDE, Expressao, Pose, Vista } from "./Chede";

// Agente de terno (capanga sem nome). Óculos escuros: pose.oculos = 1. Sob controle mental: pose.controlado = 1.
export const CORES_AGENTE = {
  ...CORES_CHEDE,
  pele: "#6A432C",
  peleSombra: "#52331F",
  peleLuz: "#80553A",
  cabelo: "#121010",
  cabeloSombra: "#080707",
  cabeloBrilho: "#2A2624",
  camisa: "#15161B",
  camisaSombra: "#0D0E12",
  camisaDetalhe: "#08090C",
  bermuda: "#15161B",
  bermudaSombra: "#0D0E12",
  tenis: "#0E0E10",
  tenisSombra: "#08080A",
  tenisSola: "#040405",
  boca: "#3A1A10",
};
export const APARENCIA_AGENTE: Aparencia = {
  cores: CORES_AGENTE,
  cabelo: "raspado",
  estampa: "terno",
  camisaSocial: "#ECECE8",
  gravata: "#0B0C10",
  gravataSombra: "#050506",
  corPoder: "#FFB21E",
};

export const Agente: React.FC<{ expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_AGENTE}>
    <Chede {...props} />
  </AparenciaCtx.Provider>
);
export const CabecaAgente: React.FC<{ expressao: Expressao; pose: Pose; vista?: Vista }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_AGENTE}>
    <Cabeca {...props} />
  </AparenciaCtx.Provider>
);

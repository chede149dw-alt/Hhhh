import React from "react";
import { Aparencia, AparenciaCtx, Cabeca, Chede, CORES_CHEDE, Expressao, Pose, Vista } from "./Chede";

// Kaik — melhor amigo do Chede. Mesmo rig, aparência própria.
export const CORES_KAIK = {
  ...CORES_CHEDE,
  pele: "#F1CBAE",
  peleSombra: "#D7A786",
  peleLuz: "#FBE2CF",
  cabelo: "#1A1615",
  cabeloSombra: "#0D0B0A",
  cabeloBrilho: "#3B3330",
  camisa: "#2F6FD6",
  camisaSombra: "#2457A8",
  camisaDetalhe: "#1D4789",
  bermuda: "#C93A32",
  bermudaSombra: "#9A2A24",
  boca: "#8A3B2E",
};
export const APARENCIA_KAIK: Aparencia = { cores: CORES_KAIK, cabelo: "cacheado", estampa: "faixa" };

export const Kaik: React.FC<{ expressao?: Expressao; pose?: Pose; vista?: Vista; semSombra?: boolean }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_KAIK}>
    <Chede {...props} />
  </AparenciaCtx.Provider>
);

export const CabecaKaik: React.FC<{ expressao: Expressao; pose: Pose; vista?: Vista }> = (props) => (
  <AparenciaCtx.Provider value={APARENCIA_KAIK}>
    <Cabeca {...props} />
  </AparenciaCtx.Provider>
);

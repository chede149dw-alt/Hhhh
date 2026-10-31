import { Easing, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import T from "./timing.json";

export { T };

// ---------- Fontes (arquivos locais em public/fonts) ----------
export const FONTE_MARCA = "PT Orbitron"; // composição tipográfica temporária da marca
export const FONTE_TITULO = "PT Rajdhani"; // títulos robustos e condensados
export const FONTE_TEXTO = "PT Inter"; // textos de apoio

loadFont({ family: FONTE_MARCA, url: staticFile("fonts/orbitron-latin-900-normal.woff2"), weight: "900" });
loadFont({ family: FONTE_MARCA, url: staticFile("fonts/orbitron-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: FONTE_TITULO, url: staticFile("fonts/rajdhani-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: FONTE_TITULO, url: staticFile("fonts/rajdhani-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: FONTE_TITULO, url: staticFile("fonts/rajdhani-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: FONTE_TEXTO, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: FONTE_TEXTO, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });

// ---------- Paleta ----------
export const COR = {
  preto: "#030304",
  grafite: "#0B0B0E",
  painel: "#111116",
  vermelho: "#E10600",
  vermelhoVivo: "#FF2A1F",
  vermelhoEscuro: "#7A0400",
  prata: "#C9CED6",
  prataEscura: "#7D838D",
  branco: "#FFFFFF",
};

// Gradiente de prata metálica usado em textos e bordas
export const METAL =
  "linear-gradient(180deg, #FFFFFF 0%, #E9ECF0 28%, #9DA3AD 49%, #5F656F 52%, #C9CED6 70%, #FFFFFF 100%)";

// ---------- Tela e área segura (Reels / TikTok / Shorts) ----------
export const W = 1080;
export const H = 1920;
export const SEGURA = { topo: 250, base: 1460, lateral: 96 };

// ---------- Movimento ----------
export const SUAVE = Easing.bezier(0.22, 1, 0.36, 1); // saída rápida, chegada suave
export const ENTRA_SAI = Easing.bezier(0.65, 0, 0.35, 1);
export const ACELERA = Easing.bezier(0.55, 0, 1, 0.45);
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const E = T.eventos;
export const CENAS = T.cenas;

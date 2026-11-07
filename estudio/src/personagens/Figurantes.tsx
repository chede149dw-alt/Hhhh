import { Aparencia, CORES_CHEDE, Pose } from "./Chede";

// Figurantes: pessoas aleatórias no mesmo estilo 2D do Chede e do Kaik (originais).
// Mesma semente = mesma pessoa (o vídeo não muda entre renders).

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const escolhe = <T,>(lista: T[], i: number) => lista[Math.floor(rnd(i) * lista.length) % lista.length];

const mistura = (hex: string, alvo: string, k: number) => {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(alvo.slice(1), 16);
  const c = [16, 8, 0].map((sh) => Math.round(((a >> sh) & 255) * (1 - k) + ((b >> sh) & 255) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
const escurece = (h: string, k = 0.22) => mistura(h, "#000000", k);
const clareia = (h: string, k = 0.18) => mistura(h, "#FFFFFF", k);

const PELES = ["#F3D2B8", "#E8BE9C", "#D9A27A", "#C68B5E", "#A86F48", "#8A5634", "#6A432C", "#4E301F"];
const CABELOS = ["#17140F", "#17140F", "#2B1D14", "#4A3020", "#6E4A2E", "#C9A15E", "#8E4A2A"];
const TIPOS: Aparencia["cabelo"][] = ["ondulado", "cacheado", "penteado", "raspado"];
const CAMISAS = ["#E35D4F", "#3D7DD8", "#F2B33D", "#59A85A", "#9A5BD1", "#EDEDED", "#2C2C34", "#E58BB0", "#2FA3A3", "#B5482E", "#7D8A99", "#F07C28", "#3E4F7A"];
const CALCAS = ["#3B5B8C", "#2E4770", "#1F2128", "#B9A27A", "#6B6E75", "#4A3B2E"];
const BERMUDAS = ["#232327", "#3B5B8C", "#9A8A6A", "#5A6B4A", "#7A2E2E"];
const BONES = ["#C93A32", "#1F2128", "#2F6FD6", "#EDEDED", "#3E7A3E", "#F2B33D"];
const MOCHILAS = ["#2C2C34", "#C93A32", "#2F6FD6", "#3E7A3E", "#7A4A9A", "#E58BB0", "#6B6E75"];

export const figurante = (semente: number): Aparencia => {
  const i = semente * 17 + 3;
  const pele = escolhe(PELES, i);
  const cabelo = escolhe(CABELOS, i + 1);
  const camisa = escolhe(CAMISAS, i + 2);
  const roupa = rnd(i + 3) < 0.35 ? "moletom" : rnd(i + 3) < 0.6 ? "camisa" : "camiseta";
  const calca = rnd(i + 4) < 0.7;
  const perna = calca ? escolhe(CALCAS, i + 5) : escolhe(BERMUDAS, i + 5);
  return {
    cores: {
      ...CORES_CHEDE,
      pele,
      peleSombra: escurece(pele, 0.2),
      peleLuz: clareia(pele, 0.15),
      cabelo,
      cabeloSombra: escurece(cabelo, 0.4),
      cabeloBrilho: clareia(cabelo, 0.15),
      camisa,
      camisaSombra: escurece(camisa, 0.18),
      camisaDetalhe: escurece(camisa, 0.32),
      bermuda: perna,
      bermudaSombra: escurece(perna, 0.3),
      tenis: escolhe(["#EFEDE8", "#EFEDE8", "#2A2A2E", "#C93A32", "#D9D2C4"], i + 6),
      tenisSombra: "#C9C5BD",
      boca: escurece(pele, 0.55),
    },
    cabelo: escolhe(TIPOS, i + 7),
    estampa: roupa === "camiseta" ? (rnd(i + 8) < 0.5 ? "bolso" : "faixa") : "bolso",
    roupa,
    calca,
    bone: rnd(i + 9) < 0.28 ? escolhe(BONES, i + 10) : undefined,
    oculosGrau: rnd(i + 11) < 0.25,
    mochila: rnd(i + 12) < 0.45 ? escolhe(MOCHILAS, i + 13) : undefined,
    barba: rnd(i + 14) < 0.12,
  };
};

// Andar (vista de perfil ou 3/4, indo para a direita)
export const andar = (f: number, vel = 0.22, amp = 1): Pose => {
  const a = Math.sin(f * vel);
  return {
    pernaE: 24 * a * amp,
    pernaD: -24 * a * amp,
    joelhoE: -6 - 22 * Math.max(0, -a) * amp,
    joelhoD: -6 - 22 * Math.max(0, a) * amp,
    bracoE: -18 * a * amp,
    bracoD: 18 * a * amp,
    antebracoE: -12,
    antebracoD: -12,
    respiracao: (Math.abs(Math.cos(f * vel)) * 0.6),
    olharX: 1,
  };
};

// Conversando (gesto leve com a mão)
export const conversar = (f: number, semente: number): Pose => {
  const g = Math.sin(f / 6 + semente);
  return { bracoD: 30 + g * 12, antebracoD: -70 + g * 15, cabeca: Math.sin(f / 15 + semente) * 3, olharX: rnd(semente) > 0.5 ? 0.8 : -0.4 };
};

// Sentado (vista 3/4 ou perfil, virado para a direita; espelhe para virar para a esquerda).
// No 3D, use y = alturaDoAssento - SENTAR_ALTURA (o pé do desenho fica abaixo do chão e o pé de verdade, no chão).
export const SENTAR_ALTURA = 0.89;
export const sentar = (extra: Pose = {}): Pose => ({ pernaD: 90, joelhoD: -90, pernaE: -90, joelhoE: 90, ...extra });

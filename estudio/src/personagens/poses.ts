import { Pose } from "./Chede";

// Corrida forte (passada longa, corpo inclinado), vista de perfil indo para a direita.
// Para correr para a esquerda, desenhe o personagem espelhado.
export const corridaForte = (f: number, vel = 0.75, amp = 1): Pose => {
  const a = Math.sin(f * vel);
  return {
    tronco: 20 * amp,
    cabeca: -6,
    pernaD: 50 * a * amp,
    pernaE: 50 * a * amp,
    joelhoD: -15 - 70 * Math.max(0, -a) * amp,
    joelhoE: 15 + 70 * Math.max(0, a) * amp,
    bracoE: -65 * a * amp,
    antebracoE: -70,
    bracoD: -65 * a * amp,
    antebracoD: 65,
    olharX: 1,
  };
};

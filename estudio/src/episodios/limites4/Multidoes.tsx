import { Ator, multidao } from "../../cenarios3d/Kit3D";
import { figurante, conversar, sentar, SENTAR_ALTURA } from "../../personagens/Figurantes";

// Figurantes 2D de cada lugar da Parte 4.
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Mesas da cantina (iguais às do Cantina3D)
export const MESAS_CANTINA: [number, number][] = [];
[-12, -6, 0, 6, 12].forEach((x) => [-16, -8].forEach((z, j) => MESAS_CANTINA.push([x + (j ? 2 : 0), z])));

export const alunosCantina = (f: number): Ator[] => {
  const sentados: Ator[] = [];
  MESAS_CANTINA.forEach(([x, z], k) => {
    [-1, 1].forEach((l, j) => {
      if (rnd(k * 7 + j) < 0.25) return;
      const i = 500 + k * 2 + j;
      sentados.push({ quem: "chede", aparencia: figurante(i), x: x + l * 1.15, z, y: 0.48 - SENTAR_ALTURA, vista: "tresQuartos", espelhar: l === 1,
        expr: rnd(i) < 0.5 ? "feliz" : "rindo", pose: sentar(conversar(f, i)) });
    });
  });
  const andando = multidao({ semente: 7, n: 30, area: [-20, 20, -24, -3], f, andando: 0.6, dir: [1, 0.2], vel: 0.022,
    livre: (x, z) => MESAS_CANTINA.some(([a, b]) => Math.abs(x - a) < 2 && Math.abs(z - b) < 1.4) || (Math.abs(x) < 3.5 && z > -5) });
  return [...sentados, ...andando];
};

// Fileiras do anfiteatro (iguais às do Anfiteatro3D)
export const assento = (r: number) => ({ y: r * 0.38 + 0.38, banco: r * 0.38 + 0.69, z: -4 + r * 1.7 + 0.75 });
export const alunosAnfiteatro = (f: number, livre: (x: number, r: number) => boolean): Ator[] => {
  const out: Ator[] = [];
  for (let r = 0; r < 8; r++)
    for (const l of [-1, 1])
      for (let k = 0; k < 6; k++) {
        const x = l * (1.8 + k * 1.1);
        const i = 900 + r * 20 + (l + 1) * 6 + k;
        if (rnd(i) < 0.45 || livre(x, r)) continue;
        const a = assento(r);
        const costas = rnd(i + 1) < 0.7;
        const cab = { cabeca: Math.sin(f / 20 + i) * 3, olharX: -0.3, olharY: 0.3 };
        out.push({ quem: "chede", aparencia: figurante(i), x, y: a.banco - SENTAR_ALTURA, z: a.z, corte: costas ? a.banco + 0.08 : undefined,
          vista: costas ? "costas" : "tresQuartos", espelhar: x > 0, expr: "neutro", pose: costas ? cab : sentar(cab) });
      }
  return out;
};

// Frente da faculdade: gente entrando pelo portão, andando na calçada e conversando no gramado
export const alunosPortao = (f: number): Ator[] => [
  ...multidao({ semente: 11, n: 10, area: [-1.8, 1.8, -14, 2], f, andando: 0.8, dir: [0, -1], vel: 0.02 }),
  ...multidao({ semente: 12, n: 10, area: [-30, 30, 1.2, 4.8], f, andando: 0.7, dir: [1, 0], vel: 0.024, livre: (x) => Math.abs(x) < 2.5 }),
  ...multidao({ semente: 13, n: 10, area: [-22, 22, -14, -3], f, andando: 0.15, livre: (x) => Math.abs(x) < 3.5 }),
];

// Rua: alguns pedestres na calçada (dos dois lados)
export const pedestresRua = (f: number): Ator[] => [
  ...multidao({ semente: 21, n: 5, area: [7.2, 9.6, -60, 10], f, andando: 0.8, dir: [0, 1], vel: 0.02, livre: (x, z) => z > -3 && z < 6 }),
  ...multidao({ semente: 22, n: 6, area: [-9.6, -7.2, -60, 10], f, andando: 0.8, dir: [0, 1], vel: 0.02 }),
];

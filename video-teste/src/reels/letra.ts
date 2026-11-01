// Letra sincronizada com a música (tempos em segundos, medidos na faixa original).
// Pedido: onde a música diz "menina", o texto mostra "menino"
// (com o artigo ajustado: "a nossa menina" -> "o nosso menino").

export type Palavra = { p: string; t: number; destaque?: boolean };
export type Verso = { palavras: Palavra[]; fim: number; final?: boolean };

const v = (fim: number, ...itens: [string, number, boolean?][]): Verso => ({
  fim,
  palavras: itens.map(([p, t, destaque]) => ({ p, t, destaque })),
});

export const VERSOS: Verso[] = [
  v(3.95, ["que", 2.13], ["me", 2.47], ["afastei", 2.77], ["de", 2.9], ["Deus", 3.0, true]),
  v(8.2, ["quando", 4.17], ["o", 4.77], ["meu", 5.03], ["melhor", 5.37], ["amigo", 5.83], ["de", 6.43], ["infância", 6.6], ["morreu", 7.2, true]),
  v(10.3, ["lembro", 8.37], ["quando", 8.77], ["amor", 9.13], ["da", 9.53], ["minha", 9.8], ["vida", 10.1, true]),
  v(12.3, ["enfim", 10.43], ["me", 10.8], ["conheceu", 11.1, true]),
  v(13.55, ["ou", 12.47], ["do", 12.7], ["outro", 12.9], ["dia", 13.1]),
  v(15.95, ["de", 13.7], ["que", 13.97], ["o", 14.17], ["nosso", 14.27], ["menino", 14.43, true], ["nasceu", 14.97]),
  v(18.2, ["lembro", 16.07], ["do", 16.37], ["seu", 16.63], ["primeiro", 16.9], ["sorriso", 17.3, true]),
  v(20.0, ["e", 18.37], ["de", 18.6], ["te", 18.77], ["ensinar", 18.97], ["a", 19.2], ["andar", 19.37, true]),
  v(21.95, ["lembro", 20.13], ["de", 20.43], ["tudo", 20.63], ["que", 21.0], ["eu", 21.2], ["tinha", 21.33], ["prometido", 21.43, true]),
  v(23.98, ["lembro", 22.1], ["de", 22.47], ["quando", 22.6], ["eu", 22.93], ["te", 23.13], ["vi", 23.3], ["chorar", 23.5, true]),
  v(25.9, ["lembro", 24.13], ["de", 24.53], ["cada", 24.8], ["um", 24.97], ["dos", 25.27], ["sacrifícios", 25.5, true]),
  v(28.6, ["dos", 26.03], ["erros", 26.3], ["de", 26.73], ["andar", 26.9], ["entre", 27.17], ["o", 27.33], ["bem", 27.5, true], ["e", 27.6], ["o", 27.7], ["mal", 27.8, true]),
  v(30.55, ["e", 28.73], ["se", 28.83], ["eu", 28.97], ["tivesse", 29.07], ["outra", 29.33], ["chance", 29.8, true]),
  { ...v(33.7, ["eu", 30.7], ["faria", 30.97], ["tudo", 31.4], ["igual", 31.83, true]), final: true },
];

// Batidas fortes da segunda parte (refrão), usadas para pulsos de luz.
export const BATIDAS = [16.1, 18.3, 20.29, 22.21, 24.24, 26.27, 28.31, 30.34, 32.36];

export const INICIO_REFRAO = 16.05;
export const DURACAO = 35.6;

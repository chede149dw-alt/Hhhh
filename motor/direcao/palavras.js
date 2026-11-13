// Palavras e falas: estimativa de tempos (antes da voz) e utilidades. Puro.
// palavras: [{ i (1 = primeira palavra do episódio), texto, ini, fim, fala, plano, quem }]
// falas:    [{ indice, plano, quem, tipo, texto, ini, fim, voz }]
export const PAUSA_FALA = 0.35, PAUSA_PLANO = 0.6;

export const limpar = (p) => p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export const separar = (texto) => texto.split(/\s+/).filter(Boolean);

// Estimativa: ~0,36 s por palavra (+ pausas de pontuação). A voz real (etapa 8) substitui.
export function estimarPalavras(roteiro, { inicio = 0.6 } = {}) {
  const palavras = [], falas = [];
  let t = inicio;
  roteiro.planos.forEach((pl, ip) => {
    if (ip > 0) t += PAUSA_PLANO;
    (pl.falas || []).forEach((f, jf) => {
      if (jf > 0) t += PAUSA_FALA;
      const ini = t;
      for (const w of separar(f.texto)) {
        const dur = 0.13 + 0.045 * limpar(w).length;
        palavras.push({ i: palavras.length + 1, texto: w, ini: t, fim: t + dur, fala: falas.length, plano: pl.id, quem: f.quem });
        t += dur + (/[,;]$/.test(w) ? 0.22 : /(\.\.\.|…)$/.test(w) ? 0.45 : /[.!?]$/.test(w) ? 0.3 : 0.04);
      }
      falas.push({ indice: falas.length, plano: pl.id, quem: f.quem, tipo: f.tipo || 'fala', texto: f.texto, ini, fim: palavras.at(-1).fim });
    });
  });
  return { palavras, falas, estimado: true };
}

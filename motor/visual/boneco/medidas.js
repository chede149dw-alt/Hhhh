// Ficha → medidas (puro, sem three). Proporções de desenho animado (~6,5 cabeças).
export const PECAS_VALIDAS = {
  cabelo: ['curto', 'raspado', 'longo', 'coque', 'nenhum'],
  camisa: ['manga_curta', 'manga_longa', 'moletom', 'jaqueta'],
  calca: ['comprida', 'bermuda'],
  calcado: ['tenis', 'chinelo'],
  acessorios: ['bone', 'relogio', 'colar'],
};
const CORES_OBRIG = ['pele', 'cabelo', 'camisa', 'calca', 'calcado'];
const HEX = /^#[0-9a-fA-F]{6}$/;

export function validarFicha(f) {
  const e = [];
  if (!f || typeof f !== 'object') return ['ficha vazia'];
  if (!f.nome) e.push('falta nome');
  const h = f.altura ?? 1.6;
  if (typeof h !== 'number' || h < 1.0 || h > 2.3) e.push(`altura ${h} fora de 1,0-2,3 m`);
  for (const c of CORES_OBRIG) if (!HEX.test(f.cores?.[c] ?? '')) e.push(`cor "${c}" ausente ou não é #rrggbb`);
  for (const [c, v] of Object.entries(f.cores || {})) if (!HEX.test(v)) e.push(`cor "${c}" = ${v} não é #rrggbb`);
  for (const [p, v] of Object.entries(f.pecas || {})) {
    const ok = PECAS_VALIDAS[p];
    if (!ok) { e.push(`peça "${p}" não existe. Existentes: ${Object.keys(PECAS_VALIDAS).join(', ')}`); continue; }
    for (const x of [].concat(v)) if (!ok.includes(x)) e.push(`${p} "${x}" não existe. Existentes: ${ok.join(', ')}`);
  }
  return e;
}

export function calcularMedidas(f) {
  const erros = validarFicha(f);
  if (erros.length) throw new Error(`Ficha "${f?.nome}" inválida:\n- ` + erros.join('\n- '));
  const H = f.altura ?? 1.6;
  const larg = f.corpo?.largura ?? 1, peso = f.corpo?.peso ?? 1, omb = f.corpo?.ombros ?? 1;
  const m = {
    H,
    cabecaR: 0.09 * H,
    pescocoH: 0.04 * H, pescocoR: 0.028 * H * peso,
    colunaH: 0.125 * H, peitoH: 0.165 * H,
    abdomenL: 0.165 * H * larg * peso, abdomenP: 0.11 * H * peso,
    peitoL: 0.205 * H * larg * omb, peitoP: 0.12 * H * peso,
    quadrilL: 0.17 * H * larg * peso, quadrilH: 0.08 * H,
    ombros: 0.245 * H * larg * omb,
    bracoLen: 0.175 * H, anteLen: 0.155 * H, maoLen: 0.085 * H,
    bracoR: 0.03 * H * peso, anteR: 0.026 * H * peso,
    pernasDist: 0.105 * H * larg,
    coxaLen: 0.205 * H, canelaLen: 0.2 * H, peAlt: 0.045 * H, peComp: 0.15 * H,
    coxaR: 0.043 * H * peso, canelaR: 0.032 * H * peso,
  };
  m.pernaComp = m.coxaLen + m.canelaLen + m.peAlt;   // altura do pivô do quadril
  m.olhosY = m.pernaComp + 0.02 * H + m.colunaH + m.peitoH + m.pescocoH + m.cabecaR * 0.95;
  return { ...m, ...(f.medidas || {}) };
}

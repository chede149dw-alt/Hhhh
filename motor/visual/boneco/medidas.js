// Ficha → medidas (puro, sem three). Estilo "blocos" (referências em projetos/_referencias):
// cabeça caixa arredondada, ombros largos, mãos e calçados grandes.
export const PECAS_VALIDAS = {
  cabelo: ['curto', 'raspado', 'longo', 'coque', 'volumoso', 'nenhum'],
  camisa: ['manga_curta', 'camisa_social', 'manga_longa', 'moletom', 'jaqueta'],
  calca: ['comprida', 'bermuda', 'justa'],
  calcado: ['tenis', 'coturno', 'sapato', 'chinelo'],
  barba: ['nenhuma', 'bigode', 'cavanhaque', 'cheia'],
  acessorios: ['bone', 'relogio', 'colar', 'cinto', 'oculos', 'cilios'],
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
  const largo = f.pecas?.camisa === 'moletom' ? 1.1 : 1;     // roupa folgada
  const justa = f.pecas?.calca === 'justa' ? 0.82 : 1;
  const m = {
    H,
    cabecaL: 0.14 * H, cabecaH: 0.165 * H, cabecaP: 0.145 * H,
    pescocoH: 0.035 * H, pescocoL: 0.055 * H * peso,
    colunaH: 0.125 * H, peitoH: 0.17 * H,
    abdomenL: 0.17 * H * larg * peso * largo, abdomenP: 0.11 * H * peso * largo,
    peitoL: 0.215 * H * larg * omb * largo, peitoP: 0.12 * H * peso * largo,
    quadrilL: 0.17 * H * larg * peso, quadrilH: 0.075 * H,
    ombros: 0.25 * H * larg * omb * largo,
    bracoLen: 0.17 * H, anteLen: 0.15 * H, maoLen: 0.095 * H,
    bracoL: 0.062 * H * peso * largo, anteL: 0.05 * H * peso * largo,
    pernasDist: 0.09 * H * larg,
    coxaLen: 0.205 * H, canelaLen: 0.2 * H, peAlt: 0.045 * H, peComp: 0.16 * H,
    coxaL: 0.08 * H * peso * justa, canelaL: 0.068 * H * peso * justa,
  };
  m.pernaComp = m.coxaLen + m.canelaLen + m.peAlt;   // altura do pivô do quadril
  const baseCabeca = m.pernaComp + 0.02 * H + m.colunaH + m.peitoH + m.pescocoH;
  m.olhosY = baseCabeca + m.cabecaH * 0.52;
  m.topo = baseCabeca + m.cabecaH;
  return { ...m, ...(f.medidas || {}) };
}

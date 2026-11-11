# Série: "E se você acordasse podendo ficar invisível?"

Prancha de produção: `previas/serie-invisivel-prancha.png` (regerar com `node motor/prancha.js roteiros/invisivel/prancha.json previas/serie-invisivel-prancha.png`).

## Personagens
| Personagem | Arquivo | Status |
|---|---|---|
| Lucas (protagonista) | `personagens/lucas/` | Oficial |
| Mãe | `personagens/mae/` | Proposta |
| Rafael (amigo) | `personagens/rafael/` | Proposta |

## Cenários (`cenarios/`)
| Cenário | Arquivo | Chão (y) | Cabeça sugerida |
|---|---|---|---|
| Quarto de manhã | `quarto-manha.js` | 1640 | 145 px |
| Rua do bairro | `rua-bairro.js` (com paralaxe: `{ paralaxe: px }`) | 1470 | 115 px |
| Escola (corredor) | `escola.js` | 1620 | 140 px |

## Objetos (`cenarios/objetos/`)
cama (`{ cobertor }`), despertador (`{ tocando, hora, t }`), mochila (`{ cor }`).

## Efeito do poder (`efeitos/invisibilidade.js`)
Corpo se desfazendo em partículas azuis (cores do elemento Água), dos pés para a cabeça; no fim sobra só um contorno azul fino tremeluzindo.
`Efeitos.invisibilidade(ctx, canvasDoPersonagem, x, y, progresso 0–1, { t })`.

**Pendente:** o poder oficial do Lucas na ficha é Energia. Para ele usar a invisibilidade nesta série, a ficha precisa ser atualizada com aprovação.

## Episódios
| Ep. | Roteiro | Prévia | Status |
|---|---|---|---|
| 1 | `ep01.md` | `previas/invisivel-ep01-previa-v3.mp4` (voz espeak-ng) | Rascunho, aguardando aprovação |

Cenários de vídeo em perspectiva: `cenarios/quarto-3d.js`, `cenarios/rua-3d.js`, `cenarios/escola-3d.js`.

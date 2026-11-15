# VALDOR — bíblia da série

Roteiros: `roteiros/nova/ep01.*` (Parte 1 "Gastei tudo num videogame") e `roteiros/nova/ep02.*` (Parte 2 "O segredo do
Téo"). Os `.md` têm o roteiro aprovado cena a cena; os `.js` são o modelo de planos mais completo do motor.

## Premissa
Davi juntou dinheiro por dois anos e gastou tudo numa cadeira de realidade virtual para jogar **Valdor**, um RPG de
fantasia onde cada item vale dinheiro de verdade aqui fora. Tem R$ 7,90 e **30 dias para pagar o aluguel** (barra
`Combate.aluguel`, meta R$ 1.200 — valor que eu supus; confirmar com o autor se mudar). O sonho: a **Adaga Eclipse**
(épica, roxa, R$ 15.000). Formato: narrador em 3ª pessoa, ciência em raio-X no meio, gancho no fim.

## Personagens (fábricas e poses)
| Quem | Fábrica | Poses | Observações |
|---|---|---|---|
| Davi (vida real) | `criarDavi` | `DAVI_POSES` | protagonista |
| Davi no jogo | `criarDaviJogo` / `criarDaviLuvas` | `DAVI_JOGO_POSES` (`conjurando`, `magia-na-mao`, ...) | mago que também luta; luvas raras azul-ardósia com punho mostarda (Parte 2 em diante) |
| Téo (vida real) | `criarTeo` | `TEO_POSES` | melhor amigo |
| Téo no jogo | `criarTeoJogo` (escudo de madeira) / `criarTeoFerro` (escudo de ferro, em `ep02.js`) | `POSES_PADRAO` | homem-fera, parece humano de dia |
| Téo transformando | `criarTeoFera({ estagio: 0..3 })` | `TEO_FERA_POSES` (`tremendo`, `garras`) | etapas da transformação |
| Téo lobisomem | `criarTeoLobisomem` (A = 8 H) | `TEO_LOBISOMEM_POSES` (`parado`, `garras`, `rugindo`, `tq`, `perfil`, `bote`, `costas`); expressão `rugido` | pelo ruivo, olhos amarelos, aprovado pelo autor |
| Ladrões | `criarLadrao({ variante })` | `LADRAO_POSES` (`faca`, `aponta`, `tocha`, `caido`, `abrindoCapa`) | capuz fechado, máscara de pano, peitoral com tachas |
| Líder | `criarLadrao({ lider: true, estilo: 'C', semEspada, espadaNaMao })` | idem | bandana vermelha, cabelo branco, cicatriz cortando a sobrancelha (fora do olho), **Lâmina Rubra** nas costas (sacar: `semEspada` + `espadaNaMao` + `window.ESPADA_MAO = { t, ang, brilho }`); NÃO usar adaga na cintura (parecia o Kael) |
| Lobos | `Criaturas.lobo(ctx, x, y, s, t, { pose, dissolve, espelhar })` | — | inimigos de farm (recorte de perfil: girar no máx. ~35°) |
| Jogador forte | `criarJogadorForte` | — | figurante |

Equipamento por código: `equipar(def, eq)` em `personagens/nova/equipamento.js` (`luvas`, `peitoral`, `cinta`,
`ombreira`, `cinto`, `botas`, `bracadeira`, `manto`, `escudo`, `arma`, `adagaCinto`), com costuras e tachas no nível
de detalhe das referências. Cores nomeadas em `personagens/nova/cores.js`.

## Itens e interface
Cartas de loot de vidro (comum/raro/épico, preço em R$), selo VENDER/EQUIPAR, seta de atributo (+MAGIA, +DEFESA),
placa de nível, barras de vida/mana na cabeça, HUD com retrato, números de dano (crítico/esquiva), etiqueta
"LÂMINA RUBRA · LENDÁRIA". Luvas do Conjurador (raro, R$ 95), Anel de faísca (raro, R$ 60), Escudo de ferro.

## Ciência (raio-X)
Parte 1: mana/visor e reflexo; Parte 2: mielina (sinal 100x mais rápido) e tapetum lucidum (a luz passa 2x no olho).
Fundo `Valdor.raioFundo`, corpo `Valdor.corpoRaio`.

## Áudio
- Voz: ElevenLabs `eleven_v4`, narrador `cLjWzehDrurj3fqQ6yN7`, Davi `WFSxKvz27RguNRD3Phoq`; silêncio cortado + `atempo` 1,06.
- Efeitos em `audio/nova/sfx/` (whoosh, rosnado, rugido, transformacao, noite-ambiente, raio, corte, moeda, nivel, ping,
  visor, escudo, mordida, arrasta, carga, compra, desfaz, quarto). Volumes 0,12–0,25.
- Trilha sintetizada: `roteiros/nova/trilha-ep02.py` (climas: mistério, aventura, ciência, magia, suspense, batalha,
  final; ganho menor na noite caindo). Volume 0,4 no roteiro.

## Onde paramos e próximos passos
- Parte 2 termina com o líder sacando a Lâmina Rubra (mais rara que a adaga épica) e o Davi em choque.
- **Parte 3:** a luta continua (Téo-fera, Davi com as luvas novas, líder com a Lâmina Rubra), no modelo de batalha das
  referências (plano geral, depois um plano para cada herói); lembrar dos loots (vender × equipar).

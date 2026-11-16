---
name: animacao-do-chede-atualizacao-3d
description: Atualização do motor "Animação do Chede" só com o que foi aprendido (sem personagens) — cenário 3D de verdade (three.js) com personagens 2D dentro, sombras do sol e da lua, grama passando na frente das pernas, árvores 2D, profundidade de campo, magia 3D com luz, tochas, fumaça, câmeras de luta, e correções de posição (nada em cima da grama, ninguém na água, joelho dobrando, andar natural). Use ao montar cenas no cenário 3D do estilo do chede ou ao atualizar um projeto antigo do motor.
---

# Atualização 3D do motor (sem personagens)

Pacote para colocar por cima de um projeto do motor que já existe. Não traz personagens: use os seus.

## Como instalar

1. Faça uma cópia do projeto antes (se você mexeu em `motor/episodio.js` ou `motor/personagem-base.js`, junte à mão). Copie o conteúdo de `arquivos/` para a raiz do projeto (as pastas `motor/`, `cenarios/`, `efeitos/`, `roteiros/`
   já batem com as do motor). Os arquivos com o mesmo nome são as versões novas.
2. **Não rode `npm install three`**: o three.js já vem em `motor/vendor/three-r160.min.js` (um npm install troca a
   versão do Playwright e o navegador some).
3. Teste: `node motor/quadro.js roteiros/demo/cena3d.json roteiros/demo/cena3d.js magia teste.png --momento 0.7`
   Deve sair a silhueta em pé no caminho de pedra, com a grama na frente das pernas e o círculo mágico azul no chão.

## O que tem de novo

| Arquivo | O que mudou |
|---|---|
| `cenarios/valdor-3d.js` | o mundo 3D (`Valdor3D`): chão com textura, lajes, muros de tijolo, tochas com luz real, rochas, rio com ponte, espadas antigas, montanhas, céu com sol/lua/estrelas, grama 3D balançando, vaga-lumes; dia → pôr do sol → noite; sombras do sol (baixo, vindo da frente) e da lua (mais alta); árvores 2D de copa em bolas; desfoque de fundo e primeiro plano; magia 3D (`circulo`, `orbe`) com luz colorida |
| `motor/cena-noite.js` | **novo**: `CenaNoite.noite()` monta a cena (cada personagem vira placa no 3D com sombra), câmeras e efeitos de câmera (zoom-soco, rolo, borrão) |
| `motor/cena3d.js` | `window.SEM_SOMBRA_CHAO` desliga a sombra 2D antiga quando o 3D faz a sombra |
| `motor/episodio.js` | andar natural (joelho dobra, pé chato, impulso na ponta), `_plantar` (pé no chão ao agachar), capa que mexe |
| `motor/personagem-base.js` | poses `agachado`, `agachado-frente`, `base-luta` |
| `motor/mao-detalhe.js` | mãos com manga larga/comprida, luva com punho, sem faixa |
| `motor/video.js` | efeitos sonoros com `corte`, `entra`, `sai` (ambiente curto sem estourar) |
| `efeitos/noite.js` | `Noite.fumaca(ctx, x, y, raio, k, { cor, seed, sobe, largura, n })` volumosa |
| `efeitos/combate.js` | raios, arcos e mão elétrica 2D por cima do 3D |

Guia completo: `references/cenario-3d.md` (opções do `Valdor3D`, câmeras, magia, luzes, fumaça e as correções de
posição do personagem que o autor pediu).

## Regras que o autor já cobrou

- Cenário pintado em 2D "gruda" na câmera: use o 3D.
- Personagem sempre pela `noite()` (grama na frente das pernas + sombra). Nunca por cima da grama.
- Ninguém na água (rio em Z ≈ 19–22). Pernas nunca cruzadas em X.
- Objeto na mão: cabo embaixo da mão, lâmina acima de tudo; nunca por cima dos dedos nem dentro da máscara.
- Som de ambiente curto e baixo (0,12); efeitos 0,12–0,25; voz sempre acima.
- Render com 3D por software: ~1h30 para ~90 s. Confira na folha de teste antes.

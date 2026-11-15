---
name: animacao-do-chede
description: Motor "Animação do Chede" — vídeos verticais animados 9:16 (1080×1920) por código, com personagens 2D recortados e articulados DENTRO de um cenário 3D de verdade (WebGL/three.js) com sombras do sol/lua, grama na frente das pernas, árvores 2D, fundo desfocado, magia 3D, fumaça, câmera em órbita, raio-X de ciência, legendas de até 3 palavras, voz ElevenLabs, trilha sintetizada e cartela "PARTE X". Séries prontas: VALDOR (Davi e Téo num jogo de RPG onde os itens valem dinheiro; Téo vira lobisomem) e "E se você acordasse controlando a terra?" (Lucas). Use sempre que o usuário pedir "animação do chede", "estilo do chede", "o motor", VALDOR, Davi, Téo, Lucas, episódio/parte/série animada para Reels/TikTok/Shorts nesse estilo, cenário 3D com personagem 2D, ou quiser continuar uma dessas séries — mesmo que não diga a palavra "skill".
---

# Animação do Chede (personagens 2D + cenário 3D)

Personagens 2D recortados e articulados (desenhados por código em Canvas, modo suave) **dentro de um cenário 3D de
verdade** (WebGL, three.js r160 já incluído em `motor/vendor/`), como nas referências do autor: o cenário é 3D, os
personagens e as árvores são 2D. O vídeo sai pronto em MP4 vertical 1080×1920, 30 fps, com voz, legenda, efeitos
sonoros e trilha.

O autor fala português do Brasil e não é programador: responda em pt-BR, com palavras simples, mostrando o resultado
(imagens e vídeos) em vez de explicar código. Ele manda referências (vídeos/prints) e cobra nível profissional.

## 1. Preparar o projeto (uma vez por conversa)

```bash
bash <pasta-desta-skill>/scripts/preparar.sh [pasta-destino]     # padrão: ./animacao-do-chede
```

Copia o motor (`assets/motor2d/`) e confere Node, ffmpeg, espeak-ng, Python (numpy/scipy), fonte Inter, Playwright
com Chromium e **WebGL**. Se o projeto já existir, não sobrescreve. **Não rode `npm install three`**: o three.js já
está em `motor/vendor/three-r160.min.js` e um npm install pode trocar a versão do Playwright (o navegador some).

Pastas: `motor/` (código), `personagens/` (um por pasta, com ficha), `cenarios/`, `efeitos/`, `roteiros/<serie>/`,
`referencias/`, `audio/<serie>/` (vozes, sfx, trilha), `previas/`, `prontos/` (vídeo final, capa, descrição),
`guia-de-estilo.md` e `aprendizados.md` (**leia antes de começar**: é o que o autor já aprovou e já reclamou).

## 2. Fluxo de um episódio

1. **Roteiro para aprovação:** `roteiros/<serie>/<ep>.md` em linguagem simples (narrador em 3ª pessoa, gancho no
   início, ciência em raio-X no meio, gancho de continuação no fim). Só produza depois da aprovação.
2. **Fichas** de personagem/criatura novos para aprovação (folha com vistas e poses) antes de animar.
3. **Roteiro em dados** `roteiros/<serie>/<ep>.json` e **planos** `roteiros/<serie>/<ep>.js`
   (`window.PLANOS = { id(ctx, u, d, api) {...} }`). Formato e `api`: `references/roteiro-e-planos.md`.
   Cenas no cenário 3D: `references/cenario-3d.md`. Modelo completo: `roteiros/nova/ep02.js` (VALDOR Parte 2).
4. **Folha de teste** (um quadro de cada plano) e conferência visual de cada plano novo:
   `node motor/video.js <ep>.json <ep>.js x.mp4 --teste previas/<ep>-teste.png [--momento 0.5]`
   e um quadro só: `node motor/quadro.js <ep>.json <ep>.js <idDoPlano> saida.png --momento 0.6`.
5. **Voz final (ElevenLabs, conector restrito):** um `creative_generate_speech` por fala (modelo `eleven_v4`) num
   mesmo flow → baixar (`content_url`) para `audio/<serie>/<ep>/vozes/` → cortar silêncio das pontas → `atempo` ~1,06
   (o autor achou 1,2+ acelerado demais) → `vozes/final/<id>.wav` e `"voz_final": { "arquivo": "vozes/final/<id>.wav" }`.
   Vozes usadas no VALDOR: narrador `cLjWzehDrurj3fqQ6yN7`, Davi `WFSxKvz27RguNRD3Phoq` (sempre conferir com
   `creative_list_voices`). Efeitos sonoros: `creative_generate_in_flow` (eleven_text_to_sound_v2) → `audio/<serie>/sfx/`.
6. **Trilha:** gerada por código (`roteiros/nova/trilha-ep02.py`, clima por plano), a partir de `secoes.json` tirado
   da linha do tempo. No roteiro: `"trilha": { "arquivo": "ep02/trilha.wav", "volume": 0.4 }` (abaixa sozinha na voz).
7. **Render:** `node motor/video.js <ep>.json <ep>.js prontos/<nome>.mp4 --workers 4`. Com o cenário 3D (WebGL por
   software) um vídeo de ~88 s leva **~1h30**: junte as correções do autor numa rodada só e avise o tempo.
   Conferir áudio: média ~ -17 dB, pico ~ -1,5 dB.
8. **Capa** (`node motor/quadro.js ... capaReels prontos/capa-<ep>.png`, título/rosto entre y 280 e 1640) e
   **descrição** `prontos/descricao-<ep>.txt` no modelo de `prontos/descricao-parte1.txt` quando existir:
   título "🌀 SÉRIE · TÍTULO | PARTE X", 2 parágrafos sem entregar o final, pergunta com 🔥, "Segue pra ver a parte X+1!",
   hashtags. Entregue junto com cada vídeo final.
9. Anote em `aprendizados.md` o que funcionou ou não.

## 3. Regras do vídeo (pedidas pelo autor)

- 9:16, 1080×1920. Duração alvo ≤ 1 min 15 s (exceção aceita: ~80–90 s numa parte com luta).
- Cortes a cada 2–3 s, **nada parado** (câmera sempre se mexendo: dolly, órbita, zoom-soco, tremor no impacto).
- **Ritmo não acelerado:** planos de 3–4 s quando há ação para entender.
- Narrador em 3ª pessoa; legenda centralizada, até 3 palavras, palavra-chave em amarelo, nunca no rosto.
- **Modelo de batalha das referências:** um plano geral, depois um plano para cada herói (magia, esquiva, dano),
  números de dano (crítico/esquiva), barras de vida/mana, HUD.
- Primeiros segundos = capa com a premissa grande; final = cartela "PARTE X" + "SEGUE PRA VER A PARTE X+1".
- Efeitos sonoros **baixos** (0,12–0,25), ambiente de noite curto e baixinho; voz sempre acima.
- Efeitos visuais "impecáveis": magia, raio, esquiva, dano, fumaça, poeira, brilho, em camadas.

## 4. O modelo visual atual (o que o autor aprovou)

- **Cenário 3D de verdade** (`cenarios/valdor-3d.js`, `Valdor3D`): chão com textura, lajes de pedra, muros de tijolo,
  tochas com luz real, rochas, rio com ponte, espadas antigas, montanhas, céu com lua/estrelas, grama 3D balançando,
  vaga-lumes, dia → pôr do sol → noite. A câmera do three é montada igual à do motor (`cam.p()` bate com o 3D).
- **Personagens 2D dentro do 3D:** cada personagem vira uma placa em pé na profundidade dos pés — a grama da frente
  passa na frente das pernas e a luz (sol/lua) projeta a sombra da silhueta; sombra de contato embaixo dos pés.
- **Árvores 2D** no estilo das referências (tronco com galhos em V, copa de bolas chapadas em 3 verdes), em pé no 3D.
- **Profundidade de campo:** fundo além do foco desfocado, personagens nítidos; primeiro plano perto da lente desfocado.
- **Magia em 3D:** círculo mágico no chão em perspectiva (girando, grama na frente), faíscas 3D em volta das mãos e
  luz colorida de verdade iluminando o cenário. Raios/arcos/números continuam 2D por cima.
- **Fumaça/poeira volumosa** (`Noite.fumaca`), expressões mudando no meio do plano (olhar, boca).
- Closes de rosto continuam em tela (2D por cima do 3D desfocado).

## 5. Personagens e séries

- **VALDOR** (`roteiros/nova/`, `references/valdor.md`): Davi (mago que também luta; `criarDaviJogo`, com luvas raras
  `criarDaviLuvas`), Téo (homem-fera; `criarTeoJogo`, transformação `criarTeoFera({estagio})`, lobisomem
  `criarTeoLobisomem`), ladrões encapuzados e o líder estilo C com a Lâmina Rubra (`criarLadrao`), lobos
  (`Criaturas.lobo`). Partes 1 e 2 prontas; Parte 3 = a luta continua.
- **Terra** (`roteiros/terra/`): Lucas (`criarLucas`, poses `LUCAS_POSES`, poder de terra), Mãe, Rafael — cenários
  2D-3D antigos (`Cenarios3D.quarto/rua/escola/patio`).
- Mudança de design de personagem só com pedido e aprovação do autor.

## 6. Onde está cada coisa

- `references/roteiro-e-planos.md` — roteiro JSON (falas, sfx, trilha, voz final), `api` dos planos, poses e receitas.
- `references/cenario-3d.md` — `Valdor3D` (figuras, sombras, luzes, magia, foco), a função `noite()` que monta a cena
  e os cuidados que o autor cobrou. **Leia antes de escrever planos no cenário 3D.**
- `references/valdor.md` — bíblia da série VALDOR (personagens, equipamentos, efeitos, áudio, ganchos).
- `assets/motor2d/` — o motor completo, as séries e os efeitos (copiado pelo `preparar.sh`).

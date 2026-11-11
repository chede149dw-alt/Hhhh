---
name: animacao-do-chede
description: Estilo "Animação do Chede" — o primeiro motor do autor (2D recortado, modo suave, cenários em perspectiva) para criar vídeos verticais animados 9:16 (1080×1920) por código, com o protagonista Lucas (poder de controlar a terra), Mãe e Rafael, voz de prévia grátis, legendas de até 3 palavras e cartela "PARTE X". Use sempre que o usuário pedir "animação do chede", "estilo do chede", "o primeiro design", "o motor 2D", vídeo/episódio/série com o Lucas no estilo 2D, roteiro animado para Reels/TikTok/Shorts nesse estilo, ou quiser continuar a série "E se você acordasse controlando a terra?" — mesmo que não diga a palavra "skill".
---

# Animação do Chede (motor 2D, estilo suave)

Este é o **primeiro design** criado com o autor: personagens 2D recortados e articulados (cabeça grande, corpo fino),
desenhados por código em Canvas, no **modo suave** (sem contorno preto: borda fina da cor da peça, sombra em degradê e
sombra de contato), com cenários em perspectiva (câmera 3D simples, névoa, desfoque, luz quente) e pós de cinema
(brilho, vinheta, grão). O vídeo sai pronto em MP4 vertical 1080×1920, 30 fps, com voz, legenda e trilha de efeitos.

O autor fala português do Brasil e não é programador: responda em pt-BR, com palavras simples, mostrando o resultado
(imagens e vídeos) em vez de explicar código.

## 1. Preparar o projeto (uma vez por conversa)

```bash
bash <pasta-desta-skill>/scripts/preparar.sh [pasta-destino]     # padrão: ./animacao-do-chede
```

O script copia o motor (`assets/motor2d/`) para a pasta e confere: Node, ffmpeg, espeak-ng, Python, fonte Inter e
Playwright com Chromium. Se faltar algo, instale (`apt-get install -y ffmpeg espeak-ng fonts-inter`, `npm install`
na pasta) e rode de novo. Se o projeto já existir, o script não sobrescreve nada.

Pastas do projeto: `motor/` (código), `personagens/`, `cenarios/`, `efeitos/`, `roteiros/<serie>/`, `audio/`,
`previas/` (testes), `prontos/` (finais), `guia-de-estilo.md` (regras visuais) e `aprendizados.md` (o que funcionou).
Leia o `guia-de-estilo.md` antes de criar personagem, cenário ou efeito novo.

## 2. Fluxo de um episódio

1. **Roteiro para aprovação.** Escreva `roteiros/<serie>/<ep>.md` (cenas em linguagem simples) e mostre ao autor.
   Só produza depois da aprovação.
2. **Roteiro em dados:** `roteiros/<serie>/<ep>.json` — lista de planos com `id`, `fala` (texto, voz, velocidade),
   `destaque` (palavras da legenda em amarelo) e `duracao` opcional. Formato em `references/roteiro-e-planos.md`.
3. **Planos (desenho):** `roteiros/<serie>/<ep>.js` define `window.PLANOS = { <id>(ctx, u, d, api) { ... } }`.
   Use o exemplo pronto `roteiros/exemplo/teste.js` e o episódio completo `roteiros/terra/ep01.js` como modelo.
4. **Folha de teste** (um quadro de cada plano) e conferência visual antes de renderizar:
   `node motor/video.js roteiros/<serie>/<ep>.json roteiros/<serie>/<ep>.js previas/x.mp4 --previa --teste previas/<ep>-teste.png`
5. **Prévia com voz grátis** (espeak-ng) — sempre antes de qualquer voz paga:
   `node motor/video.js roteiros/<serie>/<ep>.json roteiros/<serie>/<ep>.js previas/<serie>-<ep>-previa.mp4 --previa --workers 4`
6. Mostre a prévia; ajuste; só então vá para a voz final (ElevenLabs ou Edge TTS), se o autor pedir.
7. Anote em `aprendizados.md` o que funcionou ou não.

Para conferir um vídeo: `ffmpeg -i v.mp4 -vf freezedetect=n=-60dB:d=1 -f null -` (nada parado >1 s) e
`ffprobe` (duração ≤ 1 min 15 s).

## 3. Regras do vídeo (pedidas pelo autor)

- 9:16, 1080×1920. **Duração máxima 1 min 15 s.**
- Cada plano dura no máximo 2–3 s; **nada fica parado mais de 1 s** (câmera sempre se mexendo, personagens com vida).
- **Primeiros 2 s = capa** com a premissa escrita grande (ex.: "E SE VOCÊ ACORDASSE CONTROLANDO A TERRA?").
- Legenda com **no máximo 3 palavras** por vez, **nunca cobrindo rosto** (o motor desvia sozinho dos rostos registrados).
- Objeto aparece **perto de quem usa**.
- Câmera **perto** dos personagens (da cintura para cima); reações em **três tempos**: olhos → cabeça vira e a
  expressão muda → pequeno ajuste de câmera.
- Cenas **ricas** em detalhes e poderes em camadas (textura, brilho, poeira, pedras, rachaduras).
- **Final:** cartela "PARTE X" + "SEGUE PRA VER A PARTE X+1", com o botão de seguir pulsando de leve —
  **sem mão clicando**. A narração diz "Segue pra ver a parte X+1!".

## 4. Personagens

- **Lucas** (protagonista, obrigatório seguir a ficha `personagens/lucas/ficha.md` e `ficha.jpg`): desenhe sempre com
  `{ fabrica: 'criarLucas', registroPoses: 'LUCAS_POSES' }`, sem mudar a aparência. Poder oficial: **controlar a
  terra** (`Efeitos['poder-terra']` e os efeitos de `efeitos/terra-cena.js`). Mudança de design só com pedido e
  aprovação explícitos do autor (depois, regerar a ficha com `motor/ficha.js`).
- **Mãe** (`criarMae`) e **Rafael**, melhor amigo do Lucas (`criarRafael`), usam `registroPoses: 'POSES_PADRAO'`.
- Poses, expressões, vistas e o que cada uma faz: `references/roteiro-e-planos.md`.

## 5. Onde está cada coisa

- `references/roteiro-e-planos.md` — formato do roteiro, a `api` dos planos, cenários, efeitos, poses, receitas de
  câmera e de reação. **Leia antes de escrever planos.**
- `assets/motor2d/` — o motor completo (é copiado pelo `preparar.sh`).
- `assets/motor2d/roteiros/terra/` — episódio 1 aprovado da série da terra (roteiro, planos e série).

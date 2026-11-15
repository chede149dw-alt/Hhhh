# Motor 2D (estilo "Animação do Chede")

Vídeos verticais animados 9:16 (1080×1920) desenhados por código, organizados com os princípios do livro *O Motor*.

## Por onde começar
- `regras.md`: as regras que valem, cada uma com motivo e data.
- `guia-de-estilo.md`: o visual (o que é gosto e precisa de olho).
- `biblioteca.json`: as peças aprovadas (personagens, cenários, efeitos). O motor só carrega o que está ali.
- `auditoria-regras.md`: o levantamento que deu origem a tudo isso (14/11/2026).

## Episódio novo
```bash
bash ferramentas/novo-episodio.sh terra ep02          # copia o MOLDE (nunca o último vídeo)
node motor/video.js roteiros/terra/ep02.json roteiros/terra/ep02.js previas/x.mp4 --previa --teste previas/terra-ep02-teste.png   # folha numerada
node motor/video.js roteiros/terra/ep02.json roteiros/terra/ep02.js previas/terra-ep02-previa.mp4 --previa --workers 4             # prévia com voz grátis
node motor/video.js roteiros/terra/ep02.json roteiros/terra/ep02.js prontos/terra-ep02.mp4 --workers 4                            # final (voz final)
```

## Travas
O `video.js` confere sozinho, antes, durante e depois do render: duração, capa, cartela final, fala no plano, legenda,
boneco único, só peça aprovada, câmera rente, personagem fantasma, nada parado, quadro que pisca, brilho estourado e volume.
Vídeo barrado sai com `-BARRADO` no nome e um relatório `.travas.txt` ao lado. Conferir um vídeo pronto:
`node motor/travas.js video.mp4`.

## Antes de mexer na base
`bash ferramentas/teste-diferenca.sh <commit-antigo>`: o episódio aprovado tem que sair idêntico. Mostra lado a lado o que mudou.

## Onde está cada coisa
- `motor/corpo.js`: um boneco só (esqueleto, mão oficial, catálogo de poses e expressões) para todos os personagens.
- `motor/kit.js`: o jeito de fazer aprovado (câmera, luz, capa, cartela final), usado pelo molde.
- `motor/travas.js` e `ferramentas/travas_video.py`: as travas.
- `roteiros/_molde/`: o molde de episódio. `roteiros/terra/`: a série da terra.
- `medicoes.csv`: tempo e travas de cada render.

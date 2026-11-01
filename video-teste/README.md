# Vídeos com Remotion

Vídeo vertical (1080x1920, 10 s) feito com [Remotion](https://www.remotion.dev/).

- Textos e nome da marca: `src/NovaColecao.tsx` (constantes `MARCA`, `TEMPORADA`, `PECAS`, `FRASE`)
- Cores: objeto `CORES` no mesmo arquivo
- Fontes: Playfair Display e Inter, em `public/fonts`

```bash
npm install
npm run studio   # pré-visualização no navegador
npm run render   # gera out/nova-colecao.mp4
```

## Curiosidade Minecraft

Vídeo vertical de 22 s sobre a origem do Creeper, em motion graphics no estilo pixel (arte original, sem assets do jogo).

- Cenas e textos: `src/minecraft/CuriosidadeMinecraft.tsx`
- Tempos das cenas (usados pelo vídeo e pela trilha): `src/minecraft/timing.json`
- Trilha e efeitos sintetizados: `python3 scripts/gerar_trilha.py` (gera `public/minecraft/trilha.wav`)

```bash
npx remotion render CuriosidadeMinecraft out/curiosidade-minecraft.mp4
```

## Reels "Lembranças" (lyric video)

Reels vertical de 35,6 s com a letra sincronizada palavra por palavra sobre a música (`public/reels/musica.m4a`), em estilo cinematográfico: fundo com luzes desfocadas, bokeh, granulação de filme, flash de luz na entrada do refrão e pulsos nas batidas.

- Letra e tempos de cada palavra: `src/reels/letra.ts` (onde a música diz "menina", o texto mostra "o nosso menino")
- Cenas e animações: `src/reels/ReelsMenino.tsx`

```bash
npm run render:reels   # gera out/reels-menino.mp4
```

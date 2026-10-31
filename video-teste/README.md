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

## Check-up do Remotion

Vídeo vertical de 16 s que testa os principais recursos do Remotion, um por cena: física de mola (`spring`), contador com anel de progresso, gráfico de barras animado, formas e cores (`interpolateColors`) e uma checklist final.

- Cenas: `src/checkup/CheckupRemotion.tsx`
- Tempos das cenas (usados pelo vídeo e pela trilha): `src/checkup/timing.json`
- Trilha e efeitos sintetizados: `python3 scripts/gerar_trilha_checkup.py` (gera `public/checkup/trilha.wav`)

```bash
npx remotion render CheckupRemotion out/checkup-remotion.mp4
```

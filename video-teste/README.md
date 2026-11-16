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

## Duelo sob a Lua (anime de luta)

Vídeo vertical de 60 s de uma luta em estilo anime, com personagens originais (Ren, da lâmina de trovão, e Kaen, do punho de brasa). Tudo é desenhado por código em SVG: bonecos articulados por poses, câmera com paralaxe, quadros de impacto, auras, raios e feixes.

- Cenas, câmera e coreografia: `src/luta/LutaAnime.tsx`
- Boneco articulado, poses e aparência dos lutadores: `src/luta/rig.tsx`
- Efeitos e cenário: `src/luta/fx.tsx`
- Tempos de cada cena e de cada golpe (usados pelo vídeo e pela trilha): `src/luta/timing.json`
- Trilha e efeitos sonoros sintetizados: `python3 scripts/gerar_trilha_luta.py` (precisa de `numpy` e `scipy`; gera `public/luta/trilha.wav`)
- A composição `LutaPoses` mostra todas as poses lado a lado, útil para ajustar a coreografia no `npm run studio`

```bash
npm run render:luta   # gera out/duelo-sob-a-lua.mp4
```

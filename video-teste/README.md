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

## Comercial POWER TECH

Comercial vertical (1080×1920, 30 fps, 32 s, H.264 + AAC) para Reels, TikTok e Shorts, com a identidade em vermelho, preto e prata da POWER TECH (Acreúna, GO).

| Cena | Tempo | Conteúdo |
| --- | --- | --- |
| 1 · Abertura | 0–4 s | Pulso de energia, avanço de câmera, revelação da marca e "Sua próxima experiência começa aqui." |
| 2 · Computadores | 4–10 s | Gabinete gamer 3D ligando + setup completo com "Tecnologia para o seu dia a dia." e "Seu setup. Seu estilo. Sua conquista." |
| 3 · Parcelamento | 10–17 s | Gabinete em pedestal, mensagens de acessibilidade e cartão "Consulte as opções de parcelamento em boleto." |
| 4 · Localização | 17–23 s | Marca, "Tecnologia mais perto de você." e pino em Acreúna — Goiás |
| 5 · Chamada | 23–32 s | "Chegou a hora de conquistar seu PC!", convite ao contato, assinatura e marca em destaque |

- Composição principal: `src/powertech/PowerTech.tsx` (id `PowerTech`)
- Cenas: `src/powertech/cenas/`; componentes reutilizáveis (fundo, feixes de luz, marca, gabinete 3D, setup, textos): `src/powertech/componentes/`
- Cores, fontes e área segura: `src/powertech/tema.ts`
- Tempos das cenas e dos eventos sonoros (usados pelo vídeo e pela trilha): `src/powertech/timing.json`
- Trilha eletrônica e efeitos 100% sintetizados (sem amostras de terceiros): `npm run trilha:powertech` gera `public/powertech/trilha.wav` (cerca de -14 LUFS, pico de -1 dBFS)
- Fontes locais: Orbitron (nome da marca), Rajdhani (títulos) e Inter, em `public/fonts`

O nome POWER TECH é uma **composição tipográfica temporária**, não um logotipo oficial. Para usar o logotipo oficial, coloque o arquivo em `public/powertech/` e substitua o componente `Marca` (`src/powertech/componentes/Marca.tsx`) por um `<Img src={staticFile("powertech/logo.png")} />`. Os computadores são ilustrações genéricas feitas em código; fotos reais dos produtos podem entrar nas cenas 2 e 3. Nenhum preço, telefone, endereço ou perfil foi incluído, porque essas informações não foram fornecidas.

```bash
npm install
npm run trilha:powertech   # (opcional) regera a trilha após mudar timing.json
npm run render:powertech   # gera out/powertech-comercial.mp4
```

Em ambientes sem acesso à internet para baixar o Chrome Headless Shell, informe um Chromium local com `--browser-executable=/caminho/do/chrome-headless-shell`.

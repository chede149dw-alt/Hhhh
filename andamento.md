# Andamento do projeto

Use este arquivo para retomar de onde parou. Atualizado a cada etapa.

## Onde estamos
- ✅ Pastas, estúdio (Remotion em `estudio/`), guia de estilo, ficha oficial do **Chede**.
- ✅ Série 1: "E se você acordasse podendo **sumir** com qualquer coisa?" · **Parte 1**
  - Roteiro aprovado: `roteiros/serie-sumir-parte-1.md`
  - Narração (ElevenLabs, voz Witalo Guimarães): `audio/serie-sumir-parte-1-narracao.mp3`
  - Trilha + efeitos: `audio/serie-sumir-parte-1-trilha-sfx.wav`
  - Animação completa (22 cenas): `estudio/src/episodios/sumir1/Sumir1.tsx`
  - Texto do post: `roteiros/serie-sumir-parte-1-post.md`
- ✅ **Parte 1 aprovada e pronta**: `prontos/serie-sumir-parte-1.mp4` (66 s, 1080x1920) + capa `prontos/serie-sumir-parte-1-capa.png`
- ✅ Foto de perfil do Instagram: `prontos/foto-perfil-instagram.png`
- ⏳ Usuário vai começar a postar no Instagram

## Próximos passos
1. Criar a skill da série (Passo 7 do ebook).
2. Roteiro da Parte 2 ("quem mais está nesse lugar?") → aprovação → vídeo.

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../prontos/serie-sumir-parte-1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../prontos/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

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
- ⏳ Render final em andamento → `previas/serie-sumir-parte-1-v1.mp4` (+ capa `previas/serie-sumir-parte-1-capa.png`)

## Próximos passos
1. Se o vídeo não estiver em `previas/`, renderizar de novo (ver comando abaixo).
2. Usuário assiste no celular e aponta correções (com o tempo, ex.: "0:12 – …").
3. Corrigir, anotar em `aprendizados.md`, renderizar de novo.
4. Aprovado → copiar para `prontos/` junto com a capa.
5. Criar a skill da série (Passo 7 do ebook) e começar a Parte 2.

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../previas/serie-sumir-parte-1-v1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../previas/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

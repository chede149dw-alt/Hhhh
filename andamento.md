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
- ✅ Descrição do Instagram da Parte 1: `roteiros/serie-sumir-parte-1-post.md`
- ⏸️ **Série do Chede pausada** depois da Parte 1. Tudo o que aconteceu e o que ficou em aberto está em `roteiros/universo.md`.
- ⏳ **Série 2 (Kaik, super velocidade)**: ficha de teste em `personagens/kaik/` e roteiro da Parte 1 em
  `roteiros/serie-velocidade-parte-1.md`, aguardando aprovação dos dois.

## Próximos passos
1. Aprovar o Kaik e o roteiro → narração → vídeo → capa + descrição.
2. Depois: Parte 2 do Chede ("quem mais está nesse lugar?"), seguindo `roteiros/universo.md`.
3. Criar a skill da série (Passo 7 do ebook).

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../prontos/serie-sumir-parte-1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../prontos/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

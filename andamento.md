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
- ✅ **Série 2 (Kaik, super velocidade)**: Kaik e roteiro aprovados. Animação completa em
  `estudio/src/episodios/velocidade1/Velocidade1.tsx`.
  - Prévia com **voz provisória** (robótica): `previas/serie-velocidade-parte-1-previa-voz-provisoria.mp4`
  - Capa: `previas/serie-velocidade-parte-1-capa.png` · Descrição: `roteiros/serie-velocidade-parte-1-post.md`
  - ⏳ Falta a **voz final no ElevenLabs** (estava ocupado). Depois: gerar a voz (mesma voz Witalo Guimarães,
    texto = `estudio/src/episodios/velocidade1/falas.json`), salvar em `estudio/public/velocidade1/narracao.mp3`,
    rodar `scripts/alinhar.py` e `scripts/gerar_trilha_velocidade1.py`, renderizar o final em `prontos/`.

## Próximos passos
1. Voz final da série de velocidade → render final em `prontos/` (ver acima).
2. Depois: Parte 2 do Chede ("quem mais está nesse lugar?"), seguindo `roteiros/universo.md`.
3. Criar a skill da série (Passo 7 do ebook).

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../prontos/serie-sumir-parte-1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../prontos/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

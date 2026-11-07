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
- ✅ **Parte 2 da história (Kaik, super velocidade)** · numeração única: Parte 1 = Chede, Parte 2 = Kaik, Parte 3 = próxima: Kaik e roteiro aprovados. Animação completa em
  `estudio/src/episodios/velocidade1/Velocidade1.tsx`.
  - Prévia com **voz provisória** (robótica): `previas/parte-2-kaik-velocidade-previa-voz-provisoria.mp4`
  - Capa: `previas/parte-2-kaik-velocidade-capa.png` · Descrição: `roteiros/parte-2-kaik-velocidade-post.md`
  - ✅ Prévia aprovada ("ficou top"). Voz final ElevenLabs (Witalo Guimarães, 66 s): `audio/parte-2-kaik-velocidade-narracao.mp3`
  - Renumerada para **Parte 2** (capa "PARTE 2", final "Na parte 3…" com a frase regravada e emendada).
  - ✅ **Final pronto**: `prontos/parte-2-kaik-velocidade.mp4` (67 s, 1080x1920) + `prontos/parte-2-kaik-velocidade-capa.png`
    (se não estiver lá: `cd estudio && npx remotion render Velocidade1 ../prontos/parte-2-kaik-velocidade.mp4 --concurrency=3 --timeout=240000 --crf=18 --browser-executable=/opt/pw-browsers/chromium`)

- ✅ **Parte 2 (Kaik) v2 PRONTA, no estilo da referência 2** (raios em ciano, mesmo roteiro e voz): `prontos/parte-2-kaik-velocidade-v2.mp4`
  (67,2 s) + `prontos/parte-2-kaik-velocidade-v2-capa.png`. Descrição: `roteiros/parte-2-kaik-velocidade-post.md`. Enviado ao usuário.
  Cenas novas em `estudio/src/episodios/velocidade1/CenasNovas.tsx` (3D: capa, vista aérea, mundo parado, pássaro,
  prédio do vigia). Render final → `prontos/parte-2-kaik-velocidade-v2.mp4`
  (`cd estudio && scripts/render_partes.sh Velocidade1 2016 ../prontos/parte-2-kaik-velocidade-v2.mp4` —
  renderiza em blocos e continua de onde parou se o container reiniciar).

- ⏳ **Parte 3 (Chede + Kaik, "E se filmassem o seu poder?")**: roteiro APROVADO (`roteiros/parte-3-vigiados.md`).
  Episódio em `estudio/src/episodios/vigiados3/` (composição `Vigiados3`, 2090 quadros). Voz PROVISÓRIA (espeak; ElevenLabs estava ocupado).
  Prévia: `cd estudio && ESCALA=0.5 scripts/render_partes.sh Vigiados3 2090 ../previas/parte-3-vigiados-previa.mp4` → enviar ao usuário.
  Depois da aprovação: voz final ElevenLabs (texto em `src/episodios/vigiados3/texto.txt`, voz cLjWzehDrurj3fqQ6yN7, eleven_v4) →
  `scripts/alinhar.py` → `scripts/gerar_trilha_vigiados3.py` → render final em blocos → capa + descrição (`roteiros/parte-3-vigiados-post.md`).

## Próximos passos
1. Postar a Parte 2 (Kaik). Depois: **Parte 3** — quem está vigiando os dois (e quem segurou a mão do Chede).
2. Depois: Parte 2 do Chede ("quem mais está nesse lugar?"), seguindo `roteiros/universo.md`.
3. Criar a skill da série (Passo 7 do ebook).

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../prontos/serie-sumir-parte-1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../prontos/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

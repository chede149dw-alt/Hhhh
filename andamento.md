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

- ✅ **Parte 3 (Chede + Kaik, "E se filmassem o seu poder?")**: PRONTA e entregue — `prontos/parte-3-vigiados.mp4`
  (75,5 s, voz final ElevenLabs) + `prontos/parte-3-vigiados-capa.png` + descrição em `roteiros/parte-3-vigiados-post.md`.
  Episódio em `estudio/src/episodios/vigiados3/` (composição `Vigiados3`, 2265 quadros).

## Próximos passos
1. Postar as Partes 2 e 3. Depois: **Parte 4** — os agentes chegam ao prédio; o Regente continua sem aparecer.
2. Depois: Parte 2 do Chede ("quem mais está nesse lugar?"), seguindo `roteiros/universo.md`.
3. Criar a skill da série (Passo 7 do ebook).

## Comandos para retomar
```bash
cd estudio && npm install
npx remotion render Sumir1 ../prontos/serie-sumir-parte-1.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium
npx remotion still Sumir1 ../prontos/serie-sumir-parte-1-capa.png --frame=40 --browser-executable=/opt/pw-browsers/chromium
```

## Visual 2.0 (em teste)
- Referências 4 e 5 (locais, fora do Git). Estilo é 2D — luz da cena tingindo o personagem, fundo desfocado,
  neblina, câmera suave. Teste em `estudio/src/estilo2/TesteEstilo2.tsx` → `previas/teste-visual-2.mp4`.
  Personagens oficiais NÃO foram alterados. Aguardando aprovação do usuário para levar aos episódios.

## Parte 4 — "E se você testasse o limite do seu poder?" (REENTREGUE 08/11 no padrão da referência 5)
- Refeita no padrão da referência 5: proporção 2.0, cor única por cena, mato desfocado em primeiro plano, close da câmera de segurança, carro visto pela janela, marcas de mão com brilho roxo, sangue saindo do nariz, Kaik encarando o Chede, corpo inteiro ao se curvar, rodas legíveis e enquadramento novo no gancho final (L34/L35).
- Vídeo final: `prontos/parte-4-limites.mp4` (4016 quadros, 2min14, crf 21, 56 MB). Capa: `prontos/parte-4-limites-capa.png`. Post: `roteiros/parte-4-limites-post.md`.
- Próximo: Parte 5 ("O que tem do outro lado?").
- ✅ Final: `prontos/parte-4-limites.mp4` (133,9 s, 1080x1920, voz ElevenLabs Witalo acelerada 1,09x) +
  `prontos/parte-4-limites-capa.png` + `roteiros/parte-4-limites-post.md`. Próximo: Parte 5 ("o que tem do outro lado?").
- Roteiro APROVADO: `roteiros/parte-4-limites.md` (36 falas, ~130 s; limite 2min15). Faculdade, tornado, fenda pelo olhar.
- Visual: cenários 3D + personagens 2D (ver `referencias/analise-video-referencia-4-5.md`, testes em `estudio/src/estilo2/`).
- Plano: (1) cenários 3D: rua manhã (Rua3D), faculdade (portão, anfiteatro, cantina), campo baldio pôr do sol;
  (2) efeitos: tornado, fenda pelo olhar, pedras, marcas de mão, infográficos; (3) episódio `estudio/src/episodios/limites4/`;
  (4) voz provisória espeak → prévia em `previas/` → aprovação → voz ElevenLabs → final em `prontos/` + capa + post.
- FEITO: kit `estudio/src/cenarios3d/Kit3D.tsx` (Plano3D/PlanoRua, Atores 2D com sombra, luz e corte atrás de mesa,
  projetarP), cenários `Cenarios4.tsx`, cenas `episodios/limites4/Cenas4a.tsx` e `Cenas4b.tsx`, trilha
  `scripts/gerar_trilha_limites4.py`, voz provisória espeak (115 s).
- Prévia: `cd estudio && ESCALA=0.5 scripts/render_partes.sh Limites4 3485 ../previas/parte-4-limites-previa.mp4 300`
  (continua de onde parou). Depois da aprovação: voz ElevenLabs (texto em `src/episodios/limites4/texto.txt`) →
  `scripts/alinhar.py` → trilha → render final (total = ceil((duracao+1.2)*30)) → capa (quadro ~40) → post.
- Dica: no vídeo vertical o ângulo horizontal é estreito (fov 40 → ±11,5°); planos com dois personagens pedem fov ~50
  e distância maior.

## Parte 5 — "E se você se escondesse dentro do seu poder?" (ENTREGUE 09/11)
- Roteiro APROVADO: `roteiros/parte-5-outro-lado.md` (21 falas, ~75 s — duração normal a pedido do usuário).
- Voz final ElevenLabs (Witalo, take 1, 74 s, acerto 0,975): `audio/parte-5-esconder-narracao.mp3` → `estudio/public/esconder5/`.
- Trilha: `python3 scripts/gerar_trilha_esconder5.py public/esconder5/trilha.wav ../audio/parte-5-esconder-trilha.wav`.
- Episódio: `estudio/src/episodios/esconder5/` (composição `Esconder5`, 2256 quadros). Cenários novos em
  `cenarios3d/Cenarios5.tsx` (CarroAgente com faróis, CirculoCarros, Vazio3D = o outro lugar), gato em `personagens/Gato.tsx`.
- Prévia: `cd estudio && ESCALA=0.5 scripts/render_partes.sh Esconder5 2256 ../previas/parte-5-esconder-previa.mp4 300`.
- Final: `scripts/render_partes.sh Esconder5 2256 ../prontos/parte-5-esconder.mp4 300` → capa (quadro ~40) → post `roteiros/parte-5-esconder-post.md`.
- Em aberto para a Parte 6: quem estava esperando (silhueta); a Lia (ficha proposta em `personagens/lia/`); a criatura "Coletor" (proposta, não aprovada).
- ✅ Final: `prontos/parte-5-esconder.mp4` (2256 quadros, 75,2 s, 1080x1920, 47 MB) + `prontos/parte-5-esconder-capa.png` + `roteiros/parte-5-esconder-post.md`. Miado real do ElevenLabs (`audio/sfx-miado-gato.mp3`).
- Próximo: Parte 6 — definir quem estava esperando, a Lia e a origem da criatura.

## Parte 6 — "E se alguém tivesse o mesmo poder que você?" (ENTREGUE 12/11) — primeiro episódio no motor da skill
- Motor: `animacao-do-chede/` (skill "Animação do Chede"). Roteiro `roteiros/parte-6-mesmo-poder.md`; planos `animacao-do-chede/roteiros/chede/ep06.{json,js}`.
- Personagens no motor novo: Chede, Kaik e Lia (`animacao-do-chede/personagens/`).
- Voz final Witalo (take 2, acerto 0,994): `audio/parte-6-mesmo-poder-narracao.mp3`.
- Final: `prontos/parte-6-mesmo-poder.mp4` (61,5 s, −16,8 LUFS) + capa `prontos/parte-6-mesmo-poder-capa.png` (padrão de capa novo) + post `roteiros/parte-6-mesmo-poder-post.md`.
- Render final: `cd animacao-do-chede && node motor/video.js roteiros/chede/ep06.json roteiros/chede/ep06.js ../prontos/parte-6-mesmo-poder.mp4 --workers 4` (~3 min).
- Próximo: Parte 7 — o que saiu da fenda (marcas de mão pretas indo para a cidade).

## Parte 7 — "A FENDA · PARTE FINAL" (final da 1ª temporada, ENTREGUE 14/11)
- Roteiro aprovado: `roteiros/parte-7-final-temporada.md`. Os planos estão em `animacao-do-chede/roteiros/chede/ep07.{json,js}`; são 49 planos, ~2min50.
- Prévia 1: `animacao-do-chede/previas/a-fenda-final-previa.mp4`. O usuário pediu (14/11):
  - cenário 3D bonito para a batalha (a criatura aparecia dentro da árvore);
  - tapa com o Kaik batendo na parede, que racha;
  - corrida de verdade;
  - anel nos olhos;
  - soco na barriga pegando o momento exato;
  - corrida em primeira pessoa.
- Prévia 2 (substituída pela 3): `animacao-do-chede/previas/a-fenda-parte-final-previa2.mp4`. Tem o cenário novo `animacao-do-chede/cenarios/cidade-noite-3d.js` e o ciclo `correr` no motor, e refaz o tapa, a fuga, o anel, o soco e a corrida.
- Pendente depois da aprovação:
  - vozes separadas do Kaik e do Chede nas falas (o usuário ainda não respondeu);
  - voz final do Witalo;
  - render final em `prontos/a-fenda-parte-final.mp4`;
  - capa "A FENDA" + "PARTE FINAL" e post "🌀 A FENDA · PARTE FINAL".
- Prévia 3 (substituída pela 4): `animacao-do-chede/previas/a-fenda-parte-final-previa3.mp4`. Mudanças:
  - Kaik correndo de frente;
  - hospital refeito;
  - Lia deitada no tamanho certo;
  - tipoia no Kaik;
  - Chede sugado para dentro da fenda.
- Prévia 4: `animacao-do-chede/previas/a-fenda-parte-final-previa4.mp4` (3min05). Mudanças:
  - lágrimas certas;
  - sequência nova depois do "Corre!": o Kaik corre até a Lia, pega ela no colo (primeira pessoa) e foge, e a fenda fecha e explode;
  - colo refeito, com braços curtos.
- Aprovada pelo usuário (14/11: "ficou ótimo, pode gerar versão final").
- Final: `prontos/a-fenda-parte-final.mp4` (3min15, 1080x1920, −16,1 LUFS, sem congelamentos) + capa `prontos/a-fenda-parte-final-capa.png` + post `roteiros/a-fenda-parte-final-post.md`.
- Vozes (ElevenLabs v4): Witalo narra (take B, acerto 0,958); Kaik = Wesley Bessa; Chede = Nick Storyteller Prime. Cortes em `animacao-do-chede/audio/chede/ep07/vozes/final/`.
- Som: 14 efeitos do ElevenLabs em `audio/chede/ep07/brutos/sfx_*.mp3`; trilha original `audio/chede/ep07/trilha.mp3`, feita por `animacao-do-chede/scripts/trilha_ep07.py`, que o motor abaixa embaixo da voz.
- Render final: `cd animacao-do-chede && node motor/video.js roteiros/chede/ep07.json roteiros/chede/ep07.js ../prontos/a-fenda-parte-final.mp4 --workers 4` e depois recomprimir com CRF 21 para ficar abaixo de 100 MB (limite do GitHub).
- FIM DA 1ª TEMPORADA. Ganchos para a 2ª temporada:
  - o Chede está vivo dentro da fenda?
  - a luz roxa na mão da Lia;
  - quem controla a mulher do governo (anel dourado).

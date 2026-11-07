# Aprendizados

Regras que valem para todos os vídeos. Cada uma com o motivo.

- **Estilo = vídeo de referência** (luz de janela, fundo desfocado, grão, legenda condensada com
  palavra-chave amarela). Motivo: o usuário quer a animação "exatamente igual" à referência.
- **Personagem principal: Chede** (23 anos, pele morena, cabelo preto, camiseta laranja, bermuda preta;
  corajoso, às vezes inseguro, esperto). Motivo: definido pelo usuário.
- **Poder inspirado em anime vira versão original** (fenda dimensional na mão, sem nome, olho ou espiral
  do anime). Motivo: o curso proíbe copiar poder famoso (risco de remoção/strike).
- **Roteiro no estilo da referência**: cada etapa mistura humor do dia a dia com uma consequência real
  (lei, ciência, tecnologia). Motivo: é o que segura a atenção na referência.

- **Chede aprovado como versão oficial** (cabelo ondulado e volumoso). Motivo: aprovado pelo usuário;
  a ficha `personagens/chede/ficha.png` é regra obrigatória em todos os vídeos.

## Técnico
- Whisper: usar `HF_HUB_DISABLE_XET=1` e passar o áudio como array (wav 16 kHz), não o caminho.
- Render: `npx remotion ... --browser-executable=/opt/pw-browsers/chromium`.
- Voz provisória gratuita: `espeak-ng -v pt-br`.
- **Bermuda presa às pernas**: cada perna da bermuda é desenhada junto com a coxa (não no tronco).
  Motivo: correndo, a perna saía da bermuda e parecia que o Chede estava pelado.
- **Série 1 = poder de sumir com as coisas (inspirado no kamui, versão original)**. Motivo: escolha do usuário.
- **Roteiro da Parte 1 aprovado** pelo usuário ("ficou muito top"). Não alterar o texto.
- **Voz: ElevenLabs direto quando o roteiro já está aprovado** (o texto não muda mais; só as cenas mudam).
- **Legenda do vídeo não aparece durante a capa** (a capa já mostra a premissa em letras grandes).
- **Música corta na virada** ("…segurou") e entra um impacto grave. Na "dimensão", a música fica mais baixa.

## Técnico (vídeo)
- Episódio = `estudio/src/episodios/<nome>/`: `falas.json` (fala por linha; *amarelo*, !vermelho!),
  `timing.json` (gerado por `scripts/alinhar.py`), uma cena por fala em `<Nome>.tsx`.
- Trilha/efeitos sintetizados: `scripts/gerar_trilha_sumir1.py` (usa o timing).
- Prévia rápida: `--scale=0.5` (~4 min). Final: `--crf=18` (~10–15 min, 4 núcleos).
- ElevenLabs: baixar os takes de `elevenlabsusercontent.com`; escolher o take com maior "acerto" no alinhamento.
- **Parte 1 aprovada** ("ficou legal") sem correções. Motivo: aprovação do usuário; o estilo da Parte 1 é o padrão da série.
- **Foto de perfil**: Chede espantado + fenda na mão, fundo roxo escuro com brilho; tudo dentro do círculo.
  Arquivo `prontos/foto-perfil-instagram.png` (código `estudio/src/personagens/FotoPerfil.tsx`).
- **Todo vídeo sai com capa + descrição do Instagram**, salvas em `prontos/` e `roteiros/<serie>-parte-N-post.md`,
  e enviadas ao usuário junto com o vídeo. Formato da descrição (modelo enviado pelo usuário):
  1. Emoji(s) + TÍTULO EM CAIXA ALTA com a premissa + " | PARTE N"
  2. Parágrafo 1: o que acontece no episódio (2–3 frases)
  3. Parágrafo 2: a virada, terminando em suspense ("Só que…", "…") + 😳
  4. "🔥 " + pergunta para os comentários
  5. 5 hashtags em CamelCase, terminando com #ReelsBrasil
- **Personagens novos usam o mesmo boneco** (`Chede.tsx`) com outra aparência (`AparenciaCtx`): cores,
  cabelo e estampa. Motivo: mesmo estilo e proporções entre todos os personagens do canal.
- **Séries se cruzam**: manter `roteiros/universo.md` atualizado a cada episódio (o que aconteceu e o que ficou em aberto).
- **Kaik aprovado** (versão oficial) e **roteiro da Parte 1 da série de velocidade aprovado**. Não alterar o texto.
- **Se o ElevenLabs estiver ocupado**: fazer a prévia com `espeak-ng -v pt-br -s 165` e trocar a voz depois;
  as cenas se reajustam sozinhas porque o tempo vem do alinhamento (`timing.json`).
- **Corrida de perfil**: usar a função `corrida(f)` (pernas e braços alternando) + `Rastro` ciano + `LinhasVento`.
- **Prévia do Kaik aprovada** ("ficou top") → voz final ElevenLabs e render final em `prontos/`.
- **Numeração única da história**: os episódios do Chede e do Kaik são uma história só e seguem a mesma
  contagem (Parte 1 = Chede, Parte 2 = Kaik, Parte 3 = próxima). A capa mostra a parte atual e o final chama a próxima.
  Motivo: o usuário achou estranho o episódio do Kaik começar como "Parte 1" se continua a do Chede.
- **Render final travando por tempo** (quadros pesados: muitas cópias com blur em resolução cheia):
  a causa foi o desfoque (feGaussianBlur) nas cópias do `Rastro`; removido. Usar `--timeout=120000`.
  Testar antes um trecho curto: `--frames=0-120`.
- **Novo padrão visual (referência 2)**: cenários de rua em **3D de verdade** (`estudio/src/cenarios3d/Rua3D.tsx`,
  three.js via @remotion/three) com o personagem 2D por cima (`projetar()` dá posição e escala na tela),
  poder com **raios ramificados + brilho + faíscas** (`efeitos/Eletricidade.tsx`), corrida com passada longa
  (`personagens/poses.ts`) e câmera colada no personagem. Objetos sempre presos à mão que se mexe.
- **Render com 3D**: usar `--gl=swangle` (os outros modos não criam WebGL aqui). ~2 s por quadro.
- **Raios do Kaik em ciano** (decisão do usuário). Objeto levado à boca: desenhar a mão e o antebraço por cima da cabeça (`MaoFechada`).
- **Render longo = `scripts/render_partes.sh`** (blocos de 300 quadros + áudio separado). O container pode reiniciar e matar o processo; os blocos prontos ficam em `estudio/out/`.

- **Áudio do render em blocos: montar no ffmpeg.** O render só de áudio do Remotion (`--codec=wav`) estourou o tempo nas cenas 3D e não gerou o arquivo. Motivo: ele ainda passa pelos quadros. Como a composição só soma narração + trilha sem ajuste de volume, o `render_partes.sh` agora mistura direto com `ffmpeg amix` (narração e trilha de `public/<episodio>/`).

## Regras vindas do vídeo de referência 3 (pedido do usuário, 07/11)

- **Sempre pedir engajamento.** Todo vídeo tem chamada para seguir: no fim, junto com o gancho
  ("Segue aí pra ver a parte 3!"), e de preferência também no meio, escrita dentro do cenário (placa, tela de
  celular, muro) ou como selo discreto com o @ do canal. Motivo: o usuário pediu, e é o que segura o público
  da série de uma parte para a outra.
- **Todo poder tem lógica e consequência.** Nenhum poder é de graça: cada episódio explica pelo menos uma regra
  física simples do poder (com números e um infográfico na tela) e mostra o custo dele (cansaço, calor, fome,
  parede de ar, risco). Motivo: o usuário pediu, e é o que deixa a história crível e viciante, como na referência.
- **Infográficos no estilo da referência 3**: número grande + rótulo pequeno em caixa alta, linha fina até o
  objeto, contador que sobe; metáforas visuais (raio-X da cabeça, moléculas de ar, elefante = força).
- Vídeo que o usuário manda acelerado serve igual para estudar: desacelerar o áudio com `atempo=0.5` antes de
  transcrever.
- **A ameaça da série é um vilão com poder (controle mental) que controla o governo.** Decisão do usuário (07/11).
  Detalhes e propostas de regras do poder em `roteiros/universo.md`. Motivo: dá um inimigo à altura e explica
  os agentes, a ficha confidencial e quem filmou do prédio.
- **Vilão criado e aprovado para criar: "o Regente" (Otávio Regis), controle mental, cor âmbar.** As 4 regras do
  poder (gatilho olhar/voz, limite, anel âmbar nos controlados, fraquezas) foram aprovadas pelo usuário (07/11).
  Âmbar foi escolhido para não confundir com o ciano do Kaik nem com o roxo da fenda do Chede: cada poder tem sua cor.
- **Correção do usuário no visual do Regente:** adulto de **35 anos**, **barba** e **cabelo preto lambido para trás**
  (antes eu tinha feito ~55 anos, grisalho e com rugas). Motivo: é assim que o usuário imagina o vilão. Barba feita
  curta e aparada; a primeira versão, cheia, pesou o rosto e cobria a nuca nas vistas de lado.
- **O Regente não aparece por enquanto** — nem rosto, nem silhueta, nem voz — até o usuário liberar. Motivo:
  decisão do usuário (07/11), para guardar o vilão para episódios futuros. Nos próximos episódios a ameaça fica só
  nos agentes / em quem filmou do prédio.
- **Roteiro da Parte 3 aprovado** (07/11). Não alterar o texto.
- **Engajamento sem @**: o usuário não quer o @ do canal escrito; usar só "SEGUE PRA VER A PARTE N" / "Segue aí pra não perder!".

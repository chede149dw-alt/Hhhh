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

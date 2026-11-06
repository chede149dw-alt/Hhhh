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

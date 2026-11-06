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

## Técnico
- Whisper: usar `HF_HUB_DISABLE_XET=1` e passar o áudio como array (wav 16 kHz), não o caminho.
- Render: `npx remotion ... --browser-executable=/opt/pw-browsers/chromium`.
- Voz provisória gratuita: `espeak-ng -v pt-br`.

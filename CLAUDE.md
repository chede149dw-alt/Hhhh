# Organização de arquivos

Sempre salve cada coisa na pasta certa:

- `referencias/` — materiais de referência
- `personagens/` — personagens
- `cenarios/` — cenários
- `efeitos/` — efeitos
- `roteiros/` — roteiros
- `audio/` — áudios (narração, trilha, SFX)
- `previas/` — prévias e versões de teste
- `prontos/` — entregas finais
- `aprendizados.md` — registro de aprendizados

# Como fazemos os vídeos

Seguimos o método do curso (`referencias/metodo-do-curso.md`) com o estilo visual do vídeo de
referência (`referencias/analise-video-referencia.md`). Personagens e histórias são sempre originais.

- Fluxo: ideia → roteiro (aprovado por escrito) → prévia em `previas/` → correções → voz → final em `prontos/`.
- Toda correção ou aprovação do usuário vira regra em `aprendizados.md` (com o motivo).
- Material de terceiros (PDF do curso, vídeos de referência) fica só local, fora do Git.
- Responder sempre em português.
- Estúdio de animação (Remotion): `estudio/` — personagens em `estudio/src/personagens`, cenários em
  `estudio/src/cenarios`, efeitos em `estudio/src/efeitos`, acabamento/legenda em `estudio/src/estilo`.
  Imagens e fichas renderizadas vão para as pastas do topo (`personagens/`, `cenarios/`…).
- Ler `guia-de-estilo.md` e `aprendizados.md` antes de criar qualquer cena.

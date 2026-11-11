# Organização de arquivos

Sempre salve cada arquivo na pasta certa:

- `motor/` — código do sistema de vídeos (renderizador, personagens, câmera, efeitos, comando de render)
- `referencias/` — materiais de referência (imagens, vídeos, links, exemplos de estilo)
- `personagens/` — personagens (designs, descrições, assets)
- `cenarios/` — cenários e fundos
- `efeitos/` — efeitos visuais e sonoros (SFX, overlays, transições)
- `roteiros/` — roteiros e textos de narração
- `audio/` — narrações, trilhas e demais áudios
- `previas/` — prévias, rascunhos e renders de teste
- `prontos/` — vídeos e entregas finais
- `aprendizados.md` — registro do que funcionou ou não, para consultar nos próximos trabalhos
- `guia-de-estilo.md` — regras visuais obrigatórias (cores, proporções, contorno, sombra, efeitos); seguir em todo personagem, cenário e efeito

# Personagens oficiais (regra obrigatória)

- **Lucas** (protagonista): seguir `personagens/lucas/ficha.md` e `personagens/lucas/ficha.png` em todos os vídeos.
  Desenhar sempre com `personagens/lucas/lucas.js` (`criarLucas(opcoes, vista)`), sem alterar a aparência.
  Usar só as vistas, expressões, poses e o poder definidos na ficha: **controlar a terra** (`efeitos/poder-terra.js`).
  Mudança de design só com pedido e aprovação explícitos; depois, regerar a ficha.
- **Mãe** e **Rafael** (melhor amigo do Lucas): propostas em `personagens/mae/` e `personagens/rafael/`, montadas com `motor/personagem-base.js`. Ainda não são obrigatórias; viram regra quando aprovadas.

# Séries
- Cada série tem uma pasta em `roteiros/<serie>/` com `serie.md` (lista de cenários, objetos, efeitos e personagens) e `prancha.json` (prancha de produção em `previas/`).

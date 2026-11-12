# Mãe — ficha (proposta)

> **Status: proposta, aguardando aprovação.** Depois de aprovada, vira regra obrigatória como a do Lucas.

![Ficha](ficha.jpg)

- Série: "E se você acordasse podendo ficar invisível?" (`roteiros/invisivel/`).
- Desenho: `personagens/mae/mae.js` (função `criarMae(opcoes, vista)`), montado sobre `motor/personagem-base.js`.
- Vistas: frente, 3/4 (`tq`), perfil, costas — olhando para a direita; espelhar para a esquerda.
- Expressões: neutro, feliz, espanto, medo, raiva, preocupado, cansado, rindo (também: determinado, sério).
- Poses: parado, andando, acenando, mãos na cintura (registro `POSES_PADRAO`).
- Cores e medidas: ver as regras no rodapé de `ficha.jpg` e as opções no início de `mae.js`.

Regerar: `node motor/ficha.js motor/personagem-base.js personagens/mae/mae.js personagens/mae/ficha.json personagens/mae`

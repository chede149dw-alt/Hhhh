# Protagonista — ficha

**Quem é:** um jovem comum que acorda com poderes. Idade aparente 18 a 25 anos.
**Personalidade:** curioso, assustado no começo, corajoso depois.

**Versão atual:** B2 ("Mais volume e traço"), escolhida na rodada 2. As opções estão em `personagem.js`
e o desenho vem de `gerador.js`. Histórico das rodadas em `rodadas/` e `previas/protagonista-rodada-*.png`.

| Item | Definição |
|---|---|
| Altura | 5,5 H (padrão do guia) |
| Silhueta | Cabeça redonda grande (largura 0,97 H, acima do padrão de 0,85 H), corpo magro, pernas retas, moletom largo |
| Contorno | 1,35× o padrão do guia (≈ 6 px no tamanho padrão) |
| Detalhe | Faixa Turquesa `#3DB5B0` na manga; tênis de cano alto com gola e biqueira Turquesa |
| Cor-assinatura | Moletom com capuz **Marinho** `#2B3B66` (sombra `#212A59`, luz `#515C7C`) |
| Calça | Grafite `#38343F`, larga, barra embolada |
| Tênis | Linho `#F2EDE6`, cadarço Pedra `#6A6573` |
| Pele | Pele 3 (morena) `#C98B63` / sombra `#B75F3F` |
| Cabelo | Cabelo Noite `#2C2936`, curto e bagunçado com volume (+10%), franja irregular em mechas |
| Olhos | Pequenos e ovais: 0,10 × 0,14 H (exceção do briefing; o guia pede 0,24 H de altura), íris Castanho `#6A4330`, cílio superior grosso |
| Sobrancelhas | Grossas e arqueadas: 0,2 H × 0,066 H |
| Boca | Simples, traço único |

## Exceções ao guia (pedidas no briefing)
- Marinho não estava na paleta: foi adicionado ao guia como cor-assinatura deste personagem.
- O moletom ocupa ~45% da área (o guia limita o acento a 10–20%): permitido por ser a cor-assinatura.
- Olhos menores que o padrão do guia.

## Peças articuladas (arquivo `personagem.js`)
`quadril` → `tronco` → `pescoco` → `cabeca`; `tronco` → `capuz`, `braco_d/e` → `antebraco_d/e` → `mao_d/e`;
`quadril` → `coxa_d/e` → `canela_d/e` → `pe_d/e`.
`_d` = lado direito do personagem (esquerda da tela). Ângulo positivo = horário na tela.
Braço+antebraço e coxa+canela são desenhados em grupo, para a articulação não mostrar emenda.

## Expressões
neutro, curioso, assustado (com gota de suor), determinado, feliz (olhos fechados em arco), sério, surpreso, triste.

## Renders
- `previas/protagonista-frente.png` — parado, de frente, expressão curioso.
- `previas/protagonista-b2-expressoes.png` — os 8 rostos.

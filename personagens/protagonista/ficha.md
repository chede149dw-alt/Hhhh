# Protagonista — ficha

**Quem é:** um jovem comum que acorda com poderes. Idade aparente 18 a 25 anos.
**Personalidade:** curioso, assustado no começo, corajoso depois.

| Item | Definição |
|---|---|
| Altura | 5,5 H (padrão do guia) |
| Silhueta | Cabeça redonda grande (largura 0,96 H, acima do padrão de 0,85 H), corpo magro, pernas retas |
| Cor-assinatura | Moletom com capuz **Marinho** `#2B3B66` (sombra `#212A59`, luz `#515C7C`) |
| Calça | Grafite `#38343F`, reta, barra embolada |
| Tênis | Linho `#F2EDE6`, cadarço Pedra `#6A6573` |
| Pele | Pele 3 (morena) `#C98B63` / sombra `#B75F3F` |
| Cabelo | Cabelo Noite `#2C2936`, curto com franja de 5 pontas e 1 mecha solta no topo |
| Olhos | Pequenos e redondos: raio 0,068 H (exceção do briefing; o guia pede 0,24 H de altura), íris Castanho `#6A4330` |
| Sobrancelhas | Grossas: 0,2 H × 0,06 H, cor do cabelo |
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

## Expressões prontas
neutro, curioso, assustado, determinado, feliz, sério, surpreso, triste.

## Renders
- `previas/protagonista-frente.png` — parado, de frente, expressão neutra.

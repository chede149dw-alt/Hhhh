# Chede (ficha oficial, aprovada)

> Regra obrigatória: em todo vídeo o Chede segue esta ficha (cores, proporções, roupa, cabelo).
> Nunca redesenhar: usar sempre `estudio/src/personagens/Chede.tsx`.

| Item | Definição |
|---|---|
| Quem é | Jovem comum que acorda com um poder |
| Idade aparente | 23 anos |
| Silhueta | Cabeça redonda grande (~24% da altura), corpo magro, braços e pernas finos e longos |
| Cor-assinatura | Camiseta laranja `#F07C28` (sombra `#C85F18`), gola e bolso no peito |
| Bermuda | Preta `#232327` (sombra `#141417`) |
| Tênis | Branco `#EFEDE8`, sola `#2A2A2E` |
| Pele | Morena `#9A6340` (sombra `#7A4A2E`) |
| Cabelo | Preto `#1C1817`, volumoso e ondulado, franja caída para a esquerda |
| Rosto | Olhos pequenos e redondos, sobrancelhas grossas, boca simples |
| Personalidade | Corajoso, às vezes inseguro, muito esperto |

## Poder (versão original)
Abre uma **fenda dimensional** na palma da mão: um rasgo escuro com borda violeta/ciano
que **puxa objetos para outra dimensão** (e pode devolvê-los). Depois pode evoluir para
**atravessar coisas** (o corpo fica translúcido, como se estivesse "em outro lugar").
Inspirado no tipo de poder pedido, mas com visual, nome e regras próprios: sem olho especial,
sem espiral, sem nome de anime.

## Arquivos
- Código do boneco (partes articuladas + 8 expressões): `estudio/src/personagens/Chede.tsx`
- Efeito do poder: `estudio/src/efeitos/Fenda.tsx`
- `ficha.png`: vistas (frente, 3/4, perfil, costas), 8 expressões e 6 poses
- `teste-frente.png`: de frente, fundo neutro (versão aprovada)
- `frame-estilo.png`: quadro de estilo no quarto (luz, poeira, grão, legenda)

## Como usar no código
`<Chede vista="frente|tresQuartos|perfil|costas" expressao="neutro|feliz|espanto|medo|raiva|determinado|cansado|rindo" pose={{...}} />`
As 6 poses prontas estão em `estudio/src/personagens/FichaChede.tsx` (Parado, Andando, Correndo,
Apontando, Soltando o poder, Caído).

# Auditoria de regras (capítulo 3 do livro)

> **Feito em 15/11/2026.** As 9 travas viraram 14 (`motor/travas.js`), as contradições do guia foram limpas, o boneco virou um só (`motor/corpo.js`) e as regras estão em `regras.md`. Este arquivo fica como registro de onde tudo começou.

Lido em 14/11/2026: `aprendizados.md`, `guia-de-estilo.md`, as regras do vídeo da skill e o código que já confere coisas
sozinho (`motor/video.js`, `motor/episodio.js`).

Os aprendizados não têm data, só o vídeo em que aconteceu. Daqui pra frente, toda linha nova entra com **regra · motivo · data**.

---

## 1. Erros que voltaram mais de uma vez

Erro repetido quer dizer que falta uma regra, ou que a regra está escrita mas ninguém lembra dela.

| # | Família do erro | Quantas vezes / onde | Pode medir? | Proposta |
|---|---|---|---|---|
| 1 | **Coisa perto demais da câmera:** quadrados pretos, brancos ou bege de 1 quadro, borrão gigante, personagem que some e volta, rachadura enorme | **4 vezes:** quadrados (terra dramático), borrão na troca de alvo, "some e reaparece" a menos de 0,6 m (voz final), rachadura a menos de 1,5 m (terra dramático) | Sim | **Trava:** nenhum personagem ou efeito a menos de 0,6 m da câmera, e detector de quadro que pisca rodando no vídeo inteiro |
| 2 | **Personagem "fantasma" (transparente)** quando a câmera para perto de 22,5°, 67,5° ou 125° e mistura duas vistas | **2 vezes:** tomadas contínuas e capa | Sim | **Trava:** a câmera não pode ficar mais de 0,3 s a menos de 4° de um desses limites. Na capa, a vista fixa vira o padrão. |
| 3 | **Sinal trocado:** sobrancelha de "assustado" com cara de bravo, pernas cruzando de costas, cabeça meia cabeça abaixo no close | **3 vezes:** protagonista, menos cartunesco, invisibilidade | Só pelo olho | **Padrão:** toda pose, expressão ou vista nova aparece na folha de teste antes de entrar num episódio |
| 4 | **Fala maior que o plano:** espeak passando de 2,5 s, voz real 25% mais lenta | **2 vezes:** terra dramático e voz final | Sim | **Trava:** fala maior que o plano (depois do `atempo` de até 1,25×) barra o render e diz qual plano |
| 5 | **Brilho estourado:** laranja virando lilás no fundo azul, rachadura acima de 0,45 vira mancha branca, efeito brilhante em fundo claro | **3 vezes:** vídeo de teste, ficha do Lucas, terra dramático | Sim | **Trava:** no máximo 6% de pixels quase brancos por quadro (o guia já pede isso para o núcleo dos efeitos) |
| 6 | **Renomear quebra episódio antigo:** `criarAmigo` → `criarRafael`, teste caindo com `fab is not a function` | **2 vezes:** Rafael e terra prévia | Sim | **Trava:** antes de mexer no motor, todos os episódios em `roteiros/` precisam gerar a folha de teste sem erro |
| 7 | **Mão:** bloco sem dedos não lê, duas mãos cruzam os dedos, linha de 160 px dentro da mão | **3 vezes:** terra prévia, efeitos e mão, terra dramático | Em parte | **Padrão:** uma mão oficial com gestos fixos (é o capítulo 8 do livro; entra na etapa 4, "um boneco só") |

## 2. O texto se contradiz (documento velho puxando pra baixo)

O livro fala disso no capítulo 9: regra velha que fica no texto confunde quem lê, gente ou IA.

| Onde | O que diz | O que vale hoje |
|---|---|---|
| Guia, seção 10 (checklist antes de aprovar) | "Contorno em Tinta", "sombra de borda dura" | Seção 14, modo suave: **sem contorno preto**, sombra em degradê. O checklist inteiro está desatualizado. |
| Guia, seção 1 e começo | "Contorno escuro médio, sombra de corte único" | Também foi substituído pelo modo suave |
| Aprendizados, "Efeitos e mão" | Botão "que é tocado e vira SEGUINDO ✓" | Regra atual: botão pulsando, **sem mão clicando** |
| Guia, seção 12 | Legenda "na faixa mais longe dos rostos" | Hoje tem mais um detalhe: não trocar de faixa no meio do bloco (só está nos aprendizados) |

**Proposta:** atualizar o checklist da seção 10 para o modo suave e apagar o que foi substituído, em vez de deixar as duas versões.

## 3. O que já é o "jeito padrão de sair" (não precisa lembrar)

Isso o motor já faz sozinho. Pode sair da lista de "não esquecer".

- Legenda de até 3 palavras, quebrando na pontuação (`video.js`)
- Legenda desviando dos rostos e sem pular de faixa no meio do bloco (`episodio.js`)
- Câmera na mão automática, com margem de zoom sem borda preta (`episodio.js`)
- Personagem com vida: respira, pisca, troca o peso do corpo (`vida()`)
- Plano entre 2 e 3 s, calculado pela fala (`video.js`)

## 4. Travas que eu proponho para a etapa 3 (por ordem de valor)

Regras que já existem e dá pra medir, mas que hoje dependem de alguém lembrar de rodar um comando:

1. **Duração** de no máximo 1 min 15 s (hoje é um `ffprobe` manual)
2. **Nada parado mais de 1 s** (hoje é um `freezedetect` manual)
3. **Quadro que pisca:** quadrados de 1 quadro (família 1)
4. **Fala cabe no plano** (família 4)
5. **Distância da câmera** de pelo menos 0,6 m (família 1)
6. **Câmera parada no limite das vistas** (família 2)
7. **Brilho estourado** de no máximo 6% (família 5)
8. **Todos os episódios ainda montam** (família 6)
9. **Capa nos 2 primeiros segundos e cartela "PARTE X" no fim**

Antes de ligar cada trava, ela roda no episódio 1 da terra (versão dramática), que já está aprovado. Se barrar esse
vídeo, está mal regulada e não entra.

## 5. O que fica como gosto (só texto, nada de trava)

- Câmera perto, da cintura pra cima, e tomadas contínuas girando em volta dos personagens
- Reação em três tempos (olhos → cabeça e expressão → ajuste de câmera)
- Cena rica: pelo menos 3 objetos além da arquitetura, poder em camadas
- Clima (madrugada com "multiply" azul, luz quente vindo da janela)
- Roteiro: premissa forte na capa, "PARTE X" no fim

---

**Para tu decidir:** aprovar a lista de travas da seção 4, tirar ou trocar alguma, e dizer se eu posso limpar as
contradições da seção 2.

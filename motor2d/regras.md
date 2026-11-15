# Regras do motor

Cada regra em uma linha: **regra · motivo · data**. Regra sem motivo ninguém entende, e aí alguém aplica onde não devia.
Regras antigas sem data registrada aparecem como "até 14/11". Quando uma regra nova substituir uma antiga, **apague a antiga**.

O que dá pra medir **não fica aqui**: virou trava em `motor/travas.js` (seção 1), com o limite e a calibragem anotados no próprio arquivo.
Este arquivo guarda o que só o olho do autor decide.

---

## 1. Travas (a máquina confere sozinha; o vídeo não passa enquanto o problema existir)

| Trava | Motivo | Desde |
|---|---|---|
| Duração até 1 min 15 s | Vídeo longo custa mais e perde gente | até 14/11 |
| Capa nos primeiros 2 s, com a premissa escrita grande | Um terço das pessoas sai nos 3 primeiros segundos: o esforço vai na abertura | até 14/11 |
| Cartela "PARTE X" no fim | Chamada para a próxima parte | até 14/11 |
| Fala cabe no plano (pode invadir o próximo até 0,3 s) | Voz real é ~25% mais lenta que a de prévia e estourava os planos | 15/11 |
| Legenda de até 3 palavras, sem cobrir rosto | Legenda é palavra por palavra o que a voz diz, e não esconde a reação | até 14/11 |
| Boneco único: corpo, mão e poses só em `motor/corpo.js` | A mão da Mãe e do Rafael era uma cópia pior da do Lucas (o "Pedro desconexo" do livro) | 15/11 |
| Só peça aprovada da biblioteca no vídeo final | Peça não aprovada volta com cara de oficial | 15/11 |
| Nada rente à câmera (menos de 0,6 m, dentro do quadro) | Quadrados de 1 quadro, borrão gigante e personagem que some e volta (4 vezes) | 15/11 |
| Sem personagem fantasma (mais de 1 s no meio da troca de vista) | Câmera parando perto de 22,5°, 67,5° ou 125° deixa o personagem transparente | 15/11 |
| Nada parado mais de 1 s | Nada fica parado: personagem age ou reage, câmera viva | até 14/11 |
| Nenhum quadro que pisca | Os quadrados pretos e brancos de 1 quadro | 15/11 |
| Brilho sem estourar (até 6% quase branco) | Brilho somado demais vira mancha branca (3 vezes) | 15/11 |
| Volume medido (-16 LUFS, pico até -1 dB) | Volume final sempre o mesmo | até 14/11 |

## 2. Direção (gosto do autor)

- Tomadas contínuas atravessando várias falas, câmera girando em volta dos personagens e revelando quem está ali · é o modelo de câmera que o autor pediu em todos os vídeos · 11/11
- Câmera perto, da cintura pra cima; plano aberto só pra situar, e curto · o assunto da cena é grande na tela · até 14/11
- Reação em três tempos: olhos → cabeça e expressão → ajuste curto de câmera · reação seca parece boneco · até 14/11
- Close só pra mão, efeito e reação rápida · close é onde a expressão importa · até 14/11
- Personagem nunca estátua: anda, vira, troca o peso do corpo · nada fica parado · até 14/11
- Cena rica: pelo menos 3 objetos além da arquitetura; poder em camadas (halo, corpo, anel, faíscas) · cenário vazio parece rascunho · até 14/11
- Objeto aparece perto de quem usa · senão o olho se perde · até 14/11
- Toda mudança de lugar e todo objeto novo têm uma causa mostrada antes · "como é que ele subiu lá?" (livro, cap. 3) · 15/11
- Tudo no tamanho real (lata 12 cm, bola 22 cm, pessoa 1,75 m); se for pequeno, a câmera chega perto, o objeto não cresce · o frango gigante do livro · 15/11
- Nenhum efeito sem motivo: se tem fumaça, alguma coisa está queimando · 15/11
- Nunca pelado: no mínimo um calção · 15/11

## 3. Roteiro e voz

- O roteiro chega em texto puro, só as falas; o autor edita do jeito dele, e a IA compara as duas versões e anota o que mudou · ensinar o gosto pela diferença (livro, cap. 2) · 15/11
- Referência (filme, anime) quem escolhe é o autor; o texto vem limpo e ele encaixa as dele · referência é gosto · 15/11
- Prévia sempre com voz grátis antes de qualquer voz paga · gastar só no que já foi aprovado · até 14/11
- Voz final: cortar silêncio das pontas, usar a versão mais curta, acelerar no máximo 1,25× · acima disso a voz fica estranha · até 14/11

## 4. O que deu certo (elogio vira padrão)

Quando o autor elogia uma coisa, ela sobe pro molde (`roteiros/_molde/`) ou pro kit (`motor/kit.js`) e vira padrão.

- Episódio 1 da terra, versão dramática: aprovado e postado → virou o molde e o kit · 15/11
- Clima de madrugada "desenha, escurece, acende" (`Kit.frio` + `Kit.aceso`): o laranja vira a única luz quente · até 14/11
- Batida de coração com som e imagem nos mesmos tempos (`Kit.pulso`) · até 14/11
- Mão do Lucas virou a mão oficial de todos (`Corpo.mao`) · 15/11

## 5. Processo

- Vídeo novo começa do molde, nunca do último vídeo: `bash ferramentas/novo-episodio.sh <serie> <ep>` · o último vídeo carrega os remendos dele · 15/11
- Folha de teste antes do render, com os planos numerados; o autor aponta "a 12" · corta metade do vai e vem · 15/11
- Depois de um conserto, vem só o que mudou (`ferramentas/comparar.py`) · não assistir de novo o que já foi aprovado · 15/11
- Mudar uma coisa de cada vez e comparar lado a lado com o último vídeo aprovado · comparação torta engana · 15/11
- Antes de mexer na base, teste de diferença: `bash ferramentas/teste-diferenca.sh <commit>`; o vídeo aprovado tem que sair idêntico · mexer na base dá medo · 15/11
- O autor aprova só: roteiro, protagonista e poder dele, prévia e final · o resto não muda a decisão · 15/11
- Faltou peça no meio de um vídeo: contorna ali mesmo, anota, e o conserto da base fica pra depois, em lote · parar tudo pra consertar a base custava horas · 15/11
- Cada render anota tempo e travas em `medicoes.csv` · mede antes de cortar: o caro quase sempre é o retrabalho · 15/11

## 6. Decisões

- 15/11 · Estilo dos personagens: fica o do autor (versão A). Foi testado um Lucas no estilo do canal @rmhkaiser (versão B: olho em ponto, sobrancelha grossa, sem blush), com autorização; o autor preferiu o próprio. A versão B não ficou guardada.
- 15/11 · A mão de punho da Mãe no episódio aprovado ganhou polegar e dedos (mão oficial). Foi a única diferença no teste de diferença zero (5 quadros, 0,03% dos pixels).
- 15/11 · Mãe, Rafael, escola, invisibilidade e energia: aprovados pelo autor e marcados como "aprovado" na biblioteca.
- 15/11 · Fantasma: a trava continua barrando só a partir de 1 s no meio da troca de vista. O trecho de 0,67 s em 0:50,6 do episódio aprovado fica como está; o motor não foi mudado.

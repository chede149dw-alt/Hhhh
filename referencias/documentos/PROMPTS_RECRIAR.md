# Prompts para recriar um motor igual (3D chapado, por código)

**Como usar:** abra uma pasta vazia de projeto no Claude Code (ou ferramenta equivalente), cole **um prompt por vez**, na ordem, e só avance quando o passo anterior estiver testado. Cada prompt assume que o anterior já existe. Os caminhos e nomes são sugestões; a pessoa pode trocá-los.

---

## 0. Prompt mestre (sempre colar primeiro)

```
Quero construir um motor audiovisual local e gratuito que gera vídeos verticais (1080x1920, 60 fps)
com personagens 3D de cor chapada (toon), cenários 3D low-poly, animação por poses-chave e narração
sincronizada. Regras:
- Sem dependências pagas e sem APIs com crédito. Execução 100% local. Única exceção: voz Edge TTS (gratuita).
- Uma única versão do three.js, colocada em motor/visual/lib/three (versão fixa, anotada no README).
- Todo código novo fica em motor/. Toda saída (vídeos, quadros, testes) fica em projetos/.
- Render determinístico: o mesmo instante de tempo sempre gera o mesmo quadro (verificar com md5).
- Antes de declarar qualquer etapa concluída, mostrar evidência: quadros renderizados, folha de contato
  ou teste automático que passa.
- Respostas curtas. Mantenha um PROJECT_STATE.md com decisões, testes, limitações e próxima etapa.
Confirme que entendeu e proponha a estrutura de pastas antes de codar.
```

---

## 1. Ambiente e render por quadro

```
Monte o ambiente: Node, three.js (versão fixa), e um renderizador que abre uma página HTML num Chrome
headless (puppeteer-core) e captura quadros em instantes de tempo escolhidos (ex.: "quadros 0,90,239").
A página deve expor uma função window.quadro(t) que posiciona toda a cena no instante t, sem depender
do relógio real. Crie também um comando que renderiza um intervalo de quadros em PNG e um comando que
junta os PNGs num MP4 com ffmpeg (60 fps, H.264, crf 20). Teste: renderizar os quadros 0 e 90 duas
vezes em ordem diferente e confirmar que os md5 são iguais.
```

---

## 2. Estilo chapado (o visual)

```
Crie um módulo de estilo chapado para three.js:
- Material MeshToonMaterial com uma rampa de luz estreita (só entre 80% e 100% de brilho), gerada como
  DataTexture de 32 pixels, para a cor parecer lisa.
- Uma luz calibrada: sol forte (~2.0) + luz ambiente (~1.2), ajustada para que a cor iluminada de uma
  superfície de frente seja igual à cor definida no material. Documente a conta.
- O personagem não recebe sombra. Só o chão recebe sombra simples.
- Um volume opcional: escurecer um pouco a parte de baixo das formas e acrescentar um contorno de luz
  nas bordas, via onBeforeCompile.
- Pós-processo: névoa de fundo, foco raso por profundidade (desfoque proporcional à distância do
  foco), grão leve e vinheta.
Crie uma página de teste com 3 cubos e 1 esfera de cores diferentes e mostre a imagem. Ajuste até a
cor iluminada bater com a cor escolhida.
```

---

## 3. Personagem articulado com ficha

```
Crie um personagem 3D articulado por código, sem modelo externo:
- Esqueleto como hierarquia de grupos: quadril → coluna → cabeça; coluna → ombros → cotovelos → mãos;
  quadril → coxas → joelhos → pés. Cada junta é um grupo que gira em torno do próprio ponto.
- Peças rígidas (caixas, cilindros, esferas) que se sobrepõem nas juntas. Não tente suavizar emendas:
  no estilo chapado elas não aparecem.
- Rosto: olhos, sobrancelhas e boca como peças planas sobre a esfera da cabeça. Boca com 4 formas
  (neutra, sorriso, triste, aberta).
- Uma FICHA em arquivo separado (JSON ou JS) com: nome, altura (padrão 1,6 m), cores de cada peça,
  medidas e lista de peças (cabelo, roupa, calçado, acessórios).
- Função criarBoneco(ficha) que devolve { raiz, juntas, posar(pose) }.
- Uma POSE é um objeto com ângulos por junta. Defina REPOUSO e uma função misturar(a, b, k).
Teste: uma página que mostra o personagem em repouso, de 4 vistas (frente, lados, costas), e em 4 poses
diferentes (acenar, apontar, sentar, assustado). Mostre a folha de imagens antes de seguir.
```

---

## 4. Animador por poses-chave

```
Crie um animador por poses-chave, puro (sem depender do three), que roda no navegador e no Node:
- criarAnimacao(chaves) onde cada chave é { t, pose, curva }. Curvas: suave (smoothstep), linear,
  entra, sai, estalo e antecipa. Chaves repetidas viram pausa.
- em(t) devolve a pose interpolada no instante t. Aplicar com aplicar(boneco, pose).
- Campos extras da pose: corpo inteiro (x, y, z, giro), quadril, estica (amassa e estica).
- IK dos pés: pede-se o ponto da sola (peDAlvo / peEAlvo). Pé plantado não desliza enquanto o corpo se
  move. Quando a perna não deve ter IK (no ar, sentado), usar pernas: 'fk'.
- IK das mãos: ponto do pulso (maoDAlvo / maoEAlvo), para apoiar ou segurar algo.
- Arrasto: cabeça, cotovelos e mãos chegam alguns quadros depois do tronco.
- Vida: respiração e piscar somados por cima de qualquer pose.
Testes automáticos (node --test):
- IK: o pé chega ao alvo com erro menor que 1e-6 m.
- Pé plantado: não se move em 60 quadros de um movimento de corpo.
- Interpolação: em(t) nos instantes exatos das chaves devolve a pose da chave.
Depois, crie uma atuação de exemplo: "ataque_salto" com antecipação, impulso, no ar, golpe, aterrissagem
e assentamento (7 a 10 chaves). Renderize uma folha de 18 quadros e mostre antes de seguir.
```

---

## 5. Biblioteca de atuações

```
Crie uma biblioteca de atuações: ATUACOES[nome] = { descricao, chaves(), impacto?, sons? }.
- impacto é o instante-chave (ex.: o golpe), que pode ser alinhado depois a uma palavra da narração.
- sons é uma lista de efeitos com o instante em que tocam, relativo à atuação.
- Comece com 5 atuações: andar, acenar, assustar, sentar_triste, comemorar.
- Teste: cada atuação deve ter chaves em ordem crescente de tempo, sem pose vazia, e a pose final deve
  ser igual ao repouso ou a um estado de pausa declarado.
```

---

## 6. Cenário e câmera

```
Crie cenários 3D simples e chapados, a partir de caixas, planos e formas procedurais, com texturas
geradas por código (pedra, grama, madeira, água). Dois cenários para começar: uma rua e uma floresta.
Cada cenário declara sua área livre (raio em torno da marca do personagem), para a câmera não bater nas
peças.
Câmera:
- Enquadramento por tamanho de plano: geral (plano inteiro), médio (da cintura para cima), close.
  Converter tamanho em distância e campo de visão, e fixar a câmera ao corpo do personagem.
- Movimento: empurrar, puxar, travelling lateral, tremor (para impactos). Interpolação suave.
- Teste: renderizar 3 enquadramentos do mesmo personagem e mostrar a folha de quadros.
```

---

## 7. Roteiro → planos → linha do tempo

```
Crie a camada de direção, que transforma um roteiro em planos:
- Entrada: roteiro.json com uma lista de frases. Cada frase vira um plano que começa na primeira
  palavra dela (ou em um instante marcado).
- Cada plano declara: cenário, atores (com atuação ou ações), câmera, efeitos, trilha.
- Palavra de destaque (ex.: "lança", "golpe") dispara uma ação no instante dela.
- Tempos aceitam formas como 0.8 (segundos), "p19+0.12" (palavra 19 mais 0,12 s) e "fim-0.3".
- Recusar com erro claro: palavra inexistente, cenário ou atuação desconhecidos (listar os existentes).
- Duração do vídeo = fim da última fala + uma folga.
Teste: um roteiro de 3 planos com um cenário, um personagem e uma atuação; checar que os tempos saem
como esperado e que os nomes errados são recusados.
```

---

## 8. Narração e áudio

```
Crie a camada de voz e som:
- Narração com Edge TTS (voz pt-BR, ex.: pt-BR-AntonioNeural). Use os eventos WordBoundary para obter o
  instante de cada palavra e salve em words.json. Esse arquivo comanda os planos e as legendas.
- Sons de efeito sintetizados em Python (numpy/scipy), como impacto, vento, passos, clarão. Gerar em
  WAV, sem arquivos de terceiros, para evitar problemas de licença.
- Mixagem: voz com leve compressão e EQ; efeitos e trilha com ducking (abaixar a trilha quando a voz fala);
  limitador; normalizar a -14 LUFS.
- Teste: medir o LUFS final com ffmpeg (loudnorm) e confirmar que está entre -14,5 e -13,5.
```

---

## 9. Legendas

```
Crie legendas animadas a partir do words.json: grupos de 1 a 3 palavras, sem cortar no meio de frase,
palavras-chave em destaque, entrada com leve escala. Posição vertical configurável por plano, para não
cobrir o rosto do personagem. Teste: gerar um quadro com legenda e conferir que o texto não sai da tela
em 1080x1920.
```

---

## 10. Render final, junção e QA

```
Crie um comando único: produzir <pasta do projeto> que faz, em ordem:
1. voz (se faltar) → 2. planos → 3. áudio → 4. render dos quadros (em paralelo, com N processos) →
5. junção com ffmpeg → 6. folha de contato de 20 quadros → 7. medição de LUFS.
Checagens automáticas no final, que devem falhar o build se algo quebrar:
- Nenhum quadro totalmente preto.
- Nenhum trecho parado por mais de X quadros (ex.: 1 s), salvo quando o roteiro pedir pausa.
- Sincronia: o instante do impacto no vídeo bate com a palavra marcada (tolerância de 2 quadros).
- Determinismo: dois quadros repetidos fora de ordem geram md5 idênticos.
- Duração do vídeo bate com o roteiro, com tolerância de meio segundo.
Ao fim, mostre a folha de contato e o relatório das checagens. Não declare o motor pronto sem isso.
```

---

## 11. Documentação e memória do projeto

```
Crie um README.md em motor/ com: como rodar cada comando, os módulos e o que cada um faz, e as versões
fixas. Crie um PROJECT_STATE.md com: decisões tomadas, testes e resultados, limitações conhecidas e a
próxima etapa. Atualize ao fim de cada etapa.
```

---

## Ordem de trabalho recomendada

1. Prompts 0 e 1: ambiente e render por quadro funcionando.
2. Prompts 2 e 3: um personagem chapado, em pose.
3. Prompt 4: uma animação (ataque_salto) aprovada visualmente.
4. Prompts 5 e 6: biblioteca de atuações e cenário com câmera.
5. Prompts 7 a 9: roteiro, voz, som e legendas, para o primeiro vídeo de ponta a ponta.
6. Prompts 10 e 11: comando único, checagens automáticas e documentação.

## Armadilhas conhecidas (vindas da experiência deste projeto)

- Render lento sem paralelismo: cerca de 5 a 6 quadros por segundo com 1 processo. Planeje os processos cedo.
- Sem IK nos pés o personagem desliza. Faça o IK antes de animar caminhada.
- Coluna rígida faz o tronco parecer de madeira. Considere uma junta extra na coluna.
- Modelo de linguagem pequeno (7B local) escreve frases confusas quando o catálogo cresce. Use arcos
  fixos (sequência de cenário e momento definida em código) e deixe o modelo só preencher o texto.
- Mostre os quadros ao responsável antes de renderizar vídeo longo: é mais barato corrigir um quadro.

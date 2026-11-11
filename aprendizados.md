# Aprendizados

## Vídeo de teste (previas/teste.mp4)
- Canvas 2D + Chromium headless (Playwright) + ffmpeg funciona bem: 150 quadros 1080x1920 renderizados em ~10 s, numa aba só.
- Levar os quadros como PNG (`canvas.toDataURL`) direto para o `ffmpeg -f image2pipe` pelo stdin, sem gravar arquivos intermediários.
- Cada quadro precisa depender só do número do quadro (`renderFrame(n)`), e o aleatório precisa de semente fixa, para o render sair sempre igual.
- Brilho com `globalCompositeOperation = 'lighter'` + gradiente radial. Sobre fundo azul escuro, um brilho laranja fica lilás nas bordas: para um brilho mais "quente", aumentar a opacidade do centro ou usar um fundo menos saturado.
- A fonte Inter já está instalada no sistema (peso 900 disponível): basta `ctx.font = '900 230px Inter'` e esperar `document.fonts.ready`.

## Protagonista (previas/protagonista-frente.png)
- Peças de recorte com contorno inteiro mostram "bolas" nas articulações (cotovelo, joelho). Solução: desenhar o membro em grupo, em duas passadas — primeiro o contorno de todas as peças em largura dobrada, depois o preenchimento por cima. A emenda some e a silhueta continua contornada mesmo dobrada (testado com cotovelo a 95°).
- Sombra de corte único automática: recortar a peça, pintar tudo na cor de sombra e repintar a peça deslocada na direção da luz. Calcular a direção da luz pela matriz inversa da peça, para a sombra não girar junto com o membro.
- Peças espelhadas (lado esquerdo/direito) usam a matriz já espelhada para o pincel; as filhas usam a matriz sem espelho.
- Topo da manga acima da linha do ombro vira ombreira: o raio do topo da cápsula do braço tem de terminar na linha do ombro (pivô do braço 0,18 H abaixo dela).
- Sinal do ângulo das sobrancelhas: conferir sempre em uma expressão de teste ("assustado" saiu com cara de bravo na primeira vez).
- Tons de cor nunca à mão: calcular pela fórmula do guia (o Marinho escrito à mão saiu diferente do calculado).

## Rodadas de personagem (protagonista)
- Gerar 6 variações numa folha (letra + nome) e deixar a pessoa escolher funciona rápido: rodada 1 → B, rodada 2 → B2.
- Na folha, escalar pelo tamanho da cabeça (não pela altura total), senão um personagem compacto parece do mesmo tamanho que um alongado.
- Olhos ovais com pálpebra reta deixam todas as expressões com cara de sono: a borda da pálpebra precisa ser curva e acompanhar o olho.
- Para expressões ficarem distintas, mexer em mais de uma coisa: olhos fechados em arco (feliz), gota de suor (assustado), pálpebra inclinada (triste/determinado).
- Folha de rostos: enquadrar com a cabeça a ~0,55 H do topo da célula, senão o volume do cabelo é cortado.

## Ficha oficial do Lucas
- Vistas de 3/4 e perfil saem de uma projeção cilíndrica simples (x de frente → r·sen(φ+θ)): olhos, sobrancelhas, blush e franja se posicionam sozinhos, e o olho do outro lado some quando cos < 0,22.
- No 3/4 e perfil, o cabelo precisa de um contorno próprio por trás: costeleta → volta por cima da orelha → nuca em pontas → silhueta de trás em cunhas. Sem as cunhas atrás, o cabelo fica liso e não parece o mesmo personagem.
- A nuca não pode descer abaixo de y ≈ −0,1 H, senão vira uma "mecha escorrendo" até o queixo.
- Linhas internas do cabelo: recortar (clip) dentro do cabelo, senão escapam no perfil.
- Profundidade de lado: lado perto (_d) na frente do tronco, lado longe (_e) atrás de tudo.
- Personagem deitado: girar a peça-raiz (quadril) e deslocá-la com `_desloca`; a sombra no chão precisa ficar mais comprida (`_sombra`).
- Boca de raiva com dentes parece sorriso se a borda de cima for reta: curvar para baixo nos cantos.
- Efeito brilhante só funciona em célula de fundo escuro (o guia já pedia luminância ≤ 20%).

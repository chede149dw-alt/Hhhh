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

# Aprendizados

## Vídeo de teste (previas/teste.mp4)
- Canvas 2D + Chromium headless (Playwright) + ffmpeg funciona bem: 150 quadros 1080x1920 renderizados em ~10 s, numa aba só.
- Levar os quadros como PNG (`canvas.toDataURL`) direto para o `ffmpeg -f image2pipe` pelo stdin, sem gravar arquivos intermediários.
- Cada quadro precisa depender só do número do quadro (`renderFrame(n)`), e o aleatório precisa de semente fixa, para o render sair sempre igual.
- Brilho com `globalCompositeOperation = 'lighter'` + gradiente radial. Sobre fundo azul escuro, um brilho laranja fica lilás nas bordas: para um brilho mais "quente", aumentar a opacidade do centro ou usar um fundo menos saturado.
- A fonte Inter já está instalada no sistema (peso 900 disponível): basta `ctx.font = '900 230px Inter'` e esperar `document.fonts.ready`.

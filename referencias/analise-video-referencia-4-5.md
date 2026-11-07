# Análise das referências 4 e 5 (vídeos do usuário, 07/11)

Vídeos ficam só locais (`referencias/video-referencia-4.mp4` e `-5.mp4`, fora do Git). Personagens e histórias
continuam originais — aqui só anotamos a **técnica**.

## O que faz esses vídeos parecerem caros

### 1. Cenário 3D + personagem 2D (o principal)
- Os **cenários são 3D de verdade** (low-poly, sombras suaves, neblina): estrada no campo, casas com telhado,
  cidade com lojas e faixa de pedestre, prédio com carro preto, poste com câmera, campo com mato à noite.
- Os **personagens são 2D chapados** (recortes, sem contorno, sem volume) colocados dentro do 3D.
- O personagem **projeta sombra no chão 3D** (sombra comprida e suave, na direção oposta ao sol/poste).
- Por isso a câmera pode **voar** pelo cenário e o personagem continua no lugar certo.

### 2. Câmera sempre em movimento, sempre suave
- Nenhum plano fica parado: aproximação lenta, deslize de lado, subida (grua), giro em volta.
- **Vista do alto** acompanhando quem corre pela estrada (a estrada na diagonal).
- **Descida do céu** até o chão (prédio + carro preto).
- **Giro em volta** dos personagens: o fundo 3D muda de ângulo, eles continuam 2D.
- Movimento com aceleração e freio suaves (sem tranco). Cada plano dura de 1 a 3 s.

### 3. Luz de cena
- **Pôr do sol** dourado com sombras longas (ref. 4); **noite azul** com lua (ref. 5); **abajur/lâmpada** quente em interior.
- O personagem 2D pega a cor do ambiente (azulado à noite, alaranjado no pôr do sol).
- Halo nas luzes (lua, poste), feixe de luz, poeira no ar.

### 4. Profundidade de campo
- Fundo **desfocado** atrás do personagem; **mato/objetos desfocados na frente** da câmera (primeiro plano).
- Nos closes, as luzes do fundo viram bolinhas (bokeh).

### 5. Infográficos de lógica (já usamos)
- Número grande com legenda pequena e uma linha fina apontando: "PESO 5 t", "PELE 150 °C", "FREADA 988 m",
  "CARRO 120 km/h", "GELO 0 °C".
- Raio-X/contorno transparente (invisível), tela de câmera térmica, "partículas" mostrando o ar.

### 6. Legenda e acabamento
- Legenda branca curta (1 a 3 palavras), grão leve, vinheta.

## Como fazemos no nosso estúdio
- Cenários 3D com `@remotion/three` (`estudio/src/cenarios3d/`), render com `--gl=swangle`.
- Personagem 2D em SVG por cima, posicionado a cada quadro com `projetar(cam, [x, 0, z])` (pé no chão) e tamanho
  por `pxPorMetro` (1,75 m de altura).
- Sombra no chão: `SombraChao` (linha borrada projetada no 3D). Luz no personagem: `LuzCena` (tom do ambiente +
  luz quente só dentro da silhueta). Fundo 3D desfocado com `filter: blur(…)`.
- Testes: `estudio/src/estilo2/TesteEstilo2.tsx` (2D com luz) e `TesteHibrido.tsx` (3D + 2D, câmera voando/girando).

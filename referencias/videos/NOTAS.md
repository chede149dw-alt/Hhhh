# Referências em vídeo

Só a **linguagem** (cenário, luz, câmera, efeitos). Os personagens e marcas d'água são de terceiros: não copiar.

| Arquivo | O que agradou | Como entrou no motor |
|---|---|---|
| `ref-cenario-01.mp4` | Qualidade de cenário: rua em perspectiva, sol baixo, névoa, desfoque de primeiro plano, cor quente | `motor/cena3d.js`, `motor/cinema.js`, `cenarios/rua-3d.js` |
| `ref-objetos-luz-camera-02.mp4` | Objetos 3D com volume e textura; quarto na penumbra com janela estourada, feixes e poeira; câmera que vira, passa do ponto e revela outro personagem | luz por face (`faceLuz`), `cenarios/quarto-3d.js`, giro de câmera (`yaw`), plano `mae-procura` |
| `ref-cenario-efeitos-03.mp4` | Cenário cheio de detalhes (arquibancada, pedra, faixas); poderes em camadas ricas (textura, halo, brasas, rastro, anéis, portal) | carro, lixeiras, arbustos, cartazes; sumiço com halo, anel e faíscas |
| `ref-rosto-camera-04.mp4` | Olhar primeiro, depois a cabeça vira e a expressão muda, com um pequeno ajuste de câmera; câmera sempre perto (cintura para cima) | `vistaCabeca`/`cabecaEsquerda` no motor de episódio; planos `acorda` e `armario`; lentes mais fechadas |

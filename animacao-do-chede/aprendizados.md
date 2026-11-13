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

## Série da invisibilidade (prancha)
- Personagens secundários numa base genérica (`motor/personagem-base.js`) em vez de copiar o código do Lucas: o Lucas fica intocado e os novos herdam vistas, expressões e poses.
- Moldura de janela com dois retângulos no mesmo Path2D é pintada inteira (regra nonzero): desenhar moldura, depois o vidro por cima.
- Céu em faixas precisa descer até a linha do chão do plano médio, senão aparecem buracos pretos entre as casas.
- Efeito de dissolução: em 0% desenhar a imagem inteira (as células deixam a borda serrilhada); usar ruído suave (interpolado) para a borda avançar em manchas; o "fantasma" final fica melhor como contorno fino do que como silhueta preenchida.
- Sempre criar todos os canvases auxiliares antes do laço (um `null` no meio do laço derrubou o desenho do efeito sem erro visível no render).
- Título longo em prancha: encolher a fonte até caber.

## Episódio 1 da invisibilidade (prévia)
- Qualidade de cenário da referência = perspectiva real + névoa por distância + luz baixa + desfoque de profundidade + pós (cor quente, bloom, vinheta, grão). Os personagens podem continuar flat.
- Névoa por profundidade precisa de chão em faixas de Z; um plano único pega a distância média e fica todo bege.
- `ctx.filter = blur()` em resolução cheia é o que mais pesa (1,2 s por quadro). Desfocar numa camada de 1/4 e ampliar: 140 ms por quadro. Sombra suave no chão: gradiente radial em vez de blur.
- Tempo de render: 785 quadros 1080×1920 em ~65 s com 4 abas paralelas, enviando JPEG (não PNG) para o ffmpeg.
- Close de rosto: pés em y = cy − 0,47·H + A·H (A = altura em cabeças). Errar o sinal deixa a cabeça meia cabeça mais baixa.
- Folha de teste (um quadro do meio de cada plano) antes do render completo pega quase todos os erros de enquadramento.
- `freezedetect` do ffmpeg confirma a regra "nada parado por mais de 1 s"; `ebur128` confere o volume.
- Contorno do personagem invisível precisa de espessura proporcional ao tamanho, senão some em fundo claro.

## Referências 2, 3 e 4 (prévia v2 do ep01)
- O Rig, os cenários, o desfoque e os objetos precisam respeitar a transformação atual do canvas (multiplicar por `ctx.getTransform()`); antes, o zoom de câmera só mexia no fundo.
- Luz por face com degradê (normal da face + distância até a janela) dá o volume dos objetos da referência sem sair do estilo flat; ambiente baixo (0,06) para a penumbra.
- Revelação com giro de câmera: calcular o ângulo até o alvo (atan2) antes; com yaw curto o personagem revelado fica colado na borda.
- Virada de cabeça: trocar só a peça `cabeca` por a de outra vista (mesmo pivô do pescoço) funciona bem se a troca acontece junto com a mudança de expressão e um ajuste de câmera.
- Lente fechada (f 1200–1500) aproxima sem distorcer a perspectiva; com f 720 e câmera perto o cenário fica deformado.
- Copa de árvore em primeiro plano tem de ficar na borda (x ≈ −2,6 m), senão cobre metade do quadro.
- Render da v2: 815 quadros em ~110 s (a luz por face e o contraluz custam ~30% a mais).

## Menos cartunesco (prévia v3)
- O que mais deixava o vídeo com cara de desenho: contorno preto grosso em tudo e sombra dura de um tom só. Trocar por borda fina na cor da peça (sombra × #9A8EAA, 42% da espessura) + sombra em degradê (4 camadas da cor base deslocadas para a luz) + sombra de contato entre peças resolve sem mudar o desenho dos personagens.
- A sombra de contato sai de graça: antes de preencher cada peça, pintar a própria forma deslocada para o lado da sombra com alfa 0,16.
- Andar de costas (rua adentro): de costas a passada vai para dentro da cena, então girar a perna não aparece. O que funciona é erguer a perna do passo (`_dy_coxa`, o topo fica escondido pelo moletom), balançar quadril/ombros e fazer o personagem diminuir com a distância, com a câmera seguindo atrás.
- O sinal do ângulo das pernas muda entre frente e costas (a perna da esquerda da tela troca de lado); errar o sinal faz as pernas cruzarem.

## Poder da terra e Rafael
- Efeito de terra funciona em cena clara porque é chapado (terra, pedras, poeira translúcida); o brilho das rachaduras (âmbar) dá o "poder" sem precisar de fundo escuro.
- Esfera do poder precisa de raio ~0,6 H para ler bem ao lado das mãos; com 0,4 H some.
- Renomear personagem: manter a função antiga como apelido (`criarAmigo = criarRafael`) para não quebrar episódios já montados.

## Episódio 1 da terra (prévia)
- Efeitos de terra como funções de cena reaproveitáveis (`efeitos/terra-cena.js`): poeira, terra subindo, terra caindo, rachadura 3D com brilho, onda de pedras, coluna de terra, poeira do teto. Todos usam a mesma pedra de poucos lados com face clara/escura, e isso dá unidade.
- "Surfar" na onda de pedras: a função da onda devolve o ponto do topo do monte, e o personagem é desenhado ali com a escala da profundidade.
- Pontos do Rig (`pontoMundo`) vêm em coordenadas de tela: desenhar o efeito depois de `ctx.restore()` do zoom, senão o zoom é aplicado duas vezes.
- Em close de objeto (despertador), uma mão simples feita com o pincel (punho do moletom com a faixa + palma + dedos) lê bem; um bloco sem dedos não.
- Ao renomear arquivo de personagem, atualizar também os scripts de teste (o teste quebrou com `fab is not a function`).
- Render: 1011 quadros em ~2 min com 4 abas.

## Efeitos e mão (prévia v2 da terra)
- Mão detalhada (ref. vídeo 05): cada dedo é uma cadeia de 3 falanges; dobrar = encurtar pelo cosseno do ângulo acumulado, e passando de 90° a falange volta por cima da palma — isso dá o punho fechando em 2D sem modelagem 3D.
- Larguras de linha dentro de `ctx.scale(escala)` estão em unidades da mão: nada de `Math.max(1, ...)` ali (virou bolha de 160 px).
- Esfera de terra com cara de "lava" (ref. 03): textura Voronoi calculada UMA vez (256²) com placas e rachaduras + versão só das rachaduras para somar com 'lighter' pulsando; sombreado esférico por cima.
- Vocabulário dos efeitos de terra (imagens de referência): anel no chão com rachaduras incandescentes, anéis de choque brancos, espinhos escuros em leque, poeira em bolhas cor de areia, brasas, jatos verticais de poeira.
- Objetos redondos (vaso) precisam de cilindro com degradê de cilindro (claro a 25%, escuro na borda direita) e boca elíptica; caixa não serve.
- Câmera auxiliar (`camEm`) permite usar efeitos 3D (impacto) em closes 2D.
- Chamada final: "PARTE 1" + "SEGUE PRA VER A PARTE 2" + botão que é tocado e vira "SEGUINDO ✓", com fala do narrador; cartela de 3 s.

## Episódio 1, versão dramática (previas/terra-ep01-dramatico-previa.mp4, 1 min 12 s)
- Clima de madrugada sem mexer nos cenários: desenhar a cena, aplicar um "multiply" azul (#4A5A8C, 0,5–0,65) + vinheta
  escura, e só depois desenhar o que emite luz (rachaduras, esfera, poeira brilhante). O laranja vira a única luz quente.
- Rachadura acesa por cima do escuro: redesenhar com "lighter" a 0,3–0,45. Acima disso estoura e vira uma mancha branca.
- Rachadura muito perto da câmera fica enorme: começar a pelo menos 1,5 m da câmera (na rua, 7 m).
- Duas mãos no mesmo close: ângulos pequenos (±0,15) e bem separadas (x 270 e 820), senão os dedos se cruzam.
- Batida de coração: o som e a imagem usam os mesmos tempos (`sfx` coracao → `api.batidas`); a imagem pulsa (brilho,
  zoom de 1–3%) exatamente quando o som bate. Alternar cortes a cada batida (plano "ritmo") dá muita tensão.
- Falas longas no espeak a 158 ppm passam de 2,5 s: medir antes e subir a velocidade (170–180) nas que não cabem.
- Mergulho na rachadura: camadas de rocha 2D (buraco irregular com "evenodd") vindo na direção da câmera + núcleo
  brilhante pulsando funciona bem e é barato.

## Câmera na mão e quadrados pretos/brancos (referências lv_0_20261111104800 e lv_0_20261111104328)
- Referências: câmera nunca parada — deriva lenta, giro de poucos décimos de grau, aproximação suave e, depois do
  corte, a câmera "chega" um pouco deslocada e se acomoda. Agora é automático no motor (episodio.js, cameraNaMao):
  o plano é desenhado numa camada e a camada vai para a tela com esse movimento.
- Margem de corte (zoom) automática = deriva + giro + força do tremor do plano: sem borda preta mesmo no tapa.
- Quadrados pretos/brancos/bege de 1 quadro: eram pontos 3D atrás ou rente à câmera (poste, pedra do pisão,
  rachadura antiga, vizinho) projetados enormes. Correção: recorte no plano perto (cena3d.caminho), `atras` em cam.p
  e efeitos/personagens rentes não são desenhados. Conferir com o detector de blocos (quadros que piscam).

## Modelo de câmera do autor: tomadas contínuas girando em volta dos personagens (referência lv_0_20261111104328, 9,5–17 s)
- Na referência, uma tomada de ~8 s atravessa 5 legendas: a câmera gira em volta do personagem (o quarto gira junto),
  sobe um pouco e revela o outro personagem. Personagens mexem o corpo o tempo todo. O autor quer isso em todos os vídeos.
- No motor: `api.orbita` (câmera 3D em volta de um ponto) + `personagem3d` com `rumo`/`olhaPara` (vista escolhida pelo
  ângulo: frente < 22,5° < 3/4 < 67,5° < perfil < 125° < costas, com mistura de ±4° na troca) + `api.desde(id)` para a
  mesma câmera continuar por vários planos + `chave()` para animar tudo por chaves.
- Mistura de vistas longa (câmera parada perto do limite) deixa o personagem "fantasma": não parar a órbita perto de
  22,5°/67,5°/125°.
- Câmera passando perto de personagem = borrão gigante: na troca de alvo, afastar a câmera (raio maior) no meio.
- `orbita` não pode repassar `nevoa: undefined` para a câmera (cores viram NaN: rua branca e chão preto).
- Legenda: não trocar de faixa no meio do bloco (fica onde estava enquanto não cobrir rosto).
- `vida()` agora tem movimentos lentos (troca de peso, tronco, cabeça olhando em volta, braços): ninguém fica estátua.

## Voz final ElevenLabs, capa e descrição (episódio 1 pronto)
- Vozes reais (eleven_v4) falam ~25% mais devagar que o espeak: 67 s de fala para 28 planos. Solução: cortar silêncio
  das pontas, usar a versão mais curta, `atempo` até ~1,25× e redistribuir o tempo (falas longas até 3 s, curtas cedem).
- Tomadas contínuas com `tempoTomada(api, ids, nominais)`: quando a duração dos planos muda, a câmera não sai do lugar.
- Personagem "some e reaparece" quando a câmera passa a menos de 0,6 m dele: planejar o caminho da câmera por fora
  (por cima do ombro → no outro personagem → volta pelo lado).
- Capa: `motor/quadro.js` + plano `capaReels`; personagem com vista FIXA (com órbita, um ângulo perto de 22,5° mistura
  duas vistas e ele fica transparente); título no terço de cima com faixa escura atrás; selo PARTE X.

## Série nova VALDOR (13/11)
- Formato do vídeo de referência: corte a cada 2–3 s, câmera sempre andando, ciência em raio-X, legenda NO MEIO
  (`"legenda": { "faixas": [1180, 1400, 760, 420] }` no roteiro). Textos/etiquetas de infográfico ficam abaixo de y ≈ 1300.
- O roteiro pode carregar arquivos próprios da série com `"scripts": [...]` (personagens, cenário, efeitos).
- Personagens de jogo = personagem da vida real + `equipar(def, eq)` (personagens/nova/equipamento.js): manto, capuz,
  cinto, botas, escudo, adaga; a magia nas mãos acende com `_magia` na pose.
- Narração de prévia a 210 ppm para caber 31 planos em 75 s.
- Luz do campo (pedido do autor, ref. imagens/cenarios/cenario-05-luz.jpg): céu azul mais forte, raios de sol diagonais do
  alto à direita (`Cenarios3D.valdor.luz`), névoa azul-acinzentada mais fraca, verdes menos amarelos.
- Andando: personagem anda reto, sem balançar para os lados. O motor usa o passo frontal quando a vista é de frente/costas
  e reduz o balanço de "vida" (0,15) enquanto anda.
- Criaturas (efeitos/criaturas.js) no estilo da referência de batalha: formas angulosas com facetas, dentes, barra de vida
  "Nome · Nv · vida/máx". A gosma foi reprovada pelo autor ("muito feia").
- Personagem andando de lado: o `rumo` aponta para onde ele vai (andar para −X = rumo +π/2). Errado = anda de ré.
- Cenário de Valdor: fim de tarde dourado, sol baixo à direita, sombras longas das árvores, sombras de nuvem no chão,
  árvores com luz quente na borda, pinheiros, samambaias escuras nos cantos e vinheta (refs: ref-batalha-luz.mp4).
- De costas, pose feita de frente cruzava os braços nas costas (print do autor). O motor agora inverte os ângulos dos braços
  na vista de costas (menos em poses feitas para costas e nas caminhadas).
- Voz final (13/11): Witalo Guimarães (pt-BR, energética, ideal para Shorts), eleven_v4, 2 versões por fala, a mais curta.
  Com voz real deu 92 s: acelerei 1,2× (atempo) e cortei 1 plano repetido ("progresso") para fechar em 74,8 s.
  Plano com animação longa (visor) precisa de duração mínima própria (2,4 s).
- Capa Reels: mesmo padrão da FENDA (capaReels + roteiros/nova/capa-reels.json).
- Som (14/11): efeitos sonoros do ElevenLabs (eleven_text_to_sound_v2, ~17 créditos cada) em audio/nova/sfx/, chamados
  por plano no roteiro com { "tipo": "arquivo", "arquivo": "sfx/x.mp3", "em", "volume", "corte" }. Trilha original
  sintetizada por código (roteiros/nova/trilha-ep01.py, climas por plano) e mixada com "trilha": { arquivo, volume }:
  abaixa sozinha quando o narrador fala (sidechain). O conector ElevenLabs restrito não gera música.
- Batalha no estilo das referências (ref-batalha-2..6): câmera baixa, bote do monstro, salto para trás em borrão
  (cópias transparentes + linhas de velocidade + poeira), close da mordida na perna (Criaturas.cabecaLobo, contorno
  escuro, cicatriz costurada; a cabeça é desenhada POR CIMA da perna, só o focinho e as presas cobrem a borda), arrasto
  com o personagem deitado (rotacionado -90°), barra de vida do herói (verde → amarelo → vermelho) e aviso LENTO.
- Exceção do autor: a Parte 1 pode ter até 80 s (luta completa).

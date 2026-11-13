# PROJECT_STATE

## Estrutura

```
motor/                  todo o código
  render/               servidor, navegador, renderizar, juntar
  visual/               páginas e módulos de navegador
    lib/three/          three.js 0.186.1 (única cópia)
    estilo/             (etapa 2) material chapado, luz, pós-processo
    boneco/             (etapa 3) esqueleto, ficha, poses
    cenarios/           (etapa 6)
  animacao/             (etapa 4-5) animador puro + atuações (Node e navegador)
  direcao/              (etapa 7) roteiro → planos → linha do tempo
  audio/                (etapa 8) voz Edge TTS, efeitos Python, mixagem
  testes/               node --test
projetos/               toda saída
  _evidencias/          folhas pequenas versionadas
  _testes/              saídas de teste (ignoradas no git)
  <nome>/               um vídeo: roteiro.json, words.json, quadros/, final.mp4
```

## Direção criativa

**Série: "Infiltrados".** Eduardo (protagonista, a câmera é o olhar dele) e o amigo Gabriel tomam conta de
uma distribuidora de madrugada. Às 3h chega uma cliente (moça conhecida) que chama Eduardo por um apelido
que ela nunca usou. Logo depois, alerta no celular: "Cuidado: criaturas estranhas estão entre nós. Imitam
vozes de pessoas conhecidas e aparência."
**Ep. 1 "Dudu"**: roteiro em `projetos/infiltrados_ep01/roteiro.md` (+ rascunho `roteiro.json`, formato a
fechar na etapa 7). A cliente é **Larissa** (vizinha da rua de trás, freguesa); o apelido é **Dudu** (só a mãe
do Eduardo usa). Atendimento pela grade de ferro; no fim ela pede para abrir com a voz da mãe dele.
Visual dos personagens aprovado pelo responsável.
**Gabriel é humano** (pode virar infiltrado em partes futuras; não usar o rosto estranho nele por ora).
**Todo episódio termina** com narração + cartela "Segue e comenta pra ver a parte N" (N = próxima parte;
campo `proxima_parte` no roteiro.json). A grade tem uma **portinhola** quadrada na altura do balcão
(~30×30 cm) por onde passam latas e dinheiro.

Fichas: `gabriel.json`, `cliente.json` (Larissa, infiltrada), `eduardo.json` (mãos em quadro), `exemplo_barba.json` (teste).

**Visual de câmera "verde"** (ref4, `projetos/_referencias/ref4_iluminacao_verde.jpg`, pedido do responsável):
interior claro de azulejo branco sob luz fluorescente esverdeada (menta), sombras verde-escuras, lente olho de
peixe com aberração cromática nas bordas, grão leve. Lá fora: rua com fileira de postes laranja sumindo no escuro.
Preset `VISUAL_VERDE` em `posfx.js`. **Legendas (etapa 9)** no estilo da ref4: texto amarelo grosso com contorno
escuro; selo verde arredondado "PARTE N" no topo, texto escuro.

**Estilo dos personagens: "blocos"** (referências em `projetos/_referencias/`):
- ref3 (principal): corpo de caixas arredondadas, cabelo em blocos, olhos escuros ovais sem branco com brilho,
  nariz em bloco, bigode, colarinho/botões/bolso, cinto, relógio, sapato → Gabriel.
- ref2: moletom largo cor-bloco (pala escura em V, detalhe laranja), gola alta com zíper, calça justa, coturno → Eduardo.
- ref1: cabelo volumoso e barba facetados (flatShading), óculos → peças disponíveis (exemplo_barba).
- Infiltrado (`rosto.estranho`), em etapas: até 0,3 sem brilho e sem piscar; 0,3–0,6 olhos pretos crescem e
  ficam tortos (um maior e mais baixo), órbitas fundas, pele pálida, sorriso largo demais; 0,6–1 boca de
  orelha a orelha com dentes pontudos irregulares, pupila vermelha minúscula que brilha no escuro, veias
  descendo dos olhos, sobrancelhas viram. Com `boca: 'aberta'` o queixo desce e a bocarra abre.
Cenário principal previsto: distribuidora (balcão, geladeiras, porta de aço, letreiro, rua às 3h).
Luz prevista: preset `interior` (fluorescente fria, com piscar) além de `noite`/lanterna.

**História de terror em primeira pessoa.** Consequências para as etapas:
- Câmera = olhos do protagonista (≈1,45-1,50 m para 1,6 m de altura). Sem planos geral/médio/close do
  protagonista: a etapa 6 vira câmera subjetiva (olhar para alvo, virar a cabeça, balanço do passo,
  respiração, tremor de susto, correr).
- Luz padrão de terror = `noite`: lua + ambiente fracos e **lanterna presa à câmera**. A cor real das coisas
  só aparece dentro do facho.
- O personagem articulado (etapa 3) serve para os outros personagens e a criatura e, opcionalmente, para as
  mãos/braços do protagonista em quadro (segurando a lanterna).
- Narração em primeira pessoa ("eu"). Efeitos sonoros de terror: passos, respiração, rangido, batida, sussurro.

## Decisões

- three.js 0.186.1 copiado para `motor/visual/lib/three` e carregado por import map.
- Render: puppeteer-core 25.15.0 + Chrome headless com `--use-angle=swiftshader` (WebGL por software):
  mais lento que GPU, mas determinístico e igual em qualquer máquina.
- Paralelismo: **um Chrome por processo**. Várias abas no mesmo Chrome travam (abas em segundo plano
  não pintam no headless).
- Captura por `page.screenshot` em viewport 1080x1920, `deviceScaleFactor: 1`.
- Quadro N ⇒ `t = N / fps`. Arquivos `quadro_00090.png` usam o número do quadro.
- Saídas regeráveis ficam fora do git; evidências pequenas em `projetos/_evidencias/`.
- Estilo (`visual/estilo/chapado.js`): MeshToonMaterial + rampa 0,8→1,0 (DataTexture 32 px).
  Calibração: luz principal + ambiente = π ⇒ face virada para a luz sai com a cor exata.
  Dia: sol 2,0 + ambiente 1,1416. Noite: lua 0,30 + ambiente 0,30 + lanterna 2,5416 (decay 0, cone 0,24 rad).
  Tone mapping desligado. Objetos projetam sombra e não recebem; só o chão recebe (`comoObjeto`/`comoChao`).
- Volume via onBeforeCompile: escurece até 22% o que aponta para baixo + contorno de luz (fresnel), global (`VOLUME`).
- Boneco (`visual/boneco/boneco.js`): peças = `RoundedBoxGeometry` (addon copiado para lib/three) e blocos
  facetados (icosaedro achatado + flatShading) para cabelo/barba. Juntas = grupos (quadril → coluna → peito → pescoço → cabeça; peito →
  ombros → cotovelos → mãos (+ dedos e indicador); quadril → coxas → joelhos → pés). Coluna em 2 juntas
  (coluna + peito) para não ficar "de madeira". Ordem de rotação XZY (giro no eixo do osso primeiro).
- Poses (`animacao/poses.js`, puro): canais anatômicos com nome (frente, abre, giro, dobra...), mesmos números
  nos dois lados (espelhamento automático). `derivar`, `misturar`, `validarPose` (erro lista os nomes válidos).
- Mão: palma + 4 dedos com 2 falanges + polegar (antes era um bloco; ficava feia em close).
- Rosto: olhos, sobrancelhas em bloco, nariz em bloco, 4 bocas como peças planas na face frontal da cabeça. Canal `rosto.estranho`
  (0..1) faz a revelação do infiltrado: pupilas tomam o olho e a boca alarga.
- Cinemática pura (`animacao/esqueleto.js`): única tabela de juntas (posições, eixos dos canais, ordem XZY);
  o boneco three usa a mesma tabela. Teste no navegador confirma: FK pura = three (erro < 1e-5 m, 34 poses).
- IK (`animacao/ik.js`): analítico de 2 ossos com polo (joelho p/ frente, cotovelo p/ trás-baixo-fora; o canal
  `giro` da coxa/ombro gira o polo). Pé fica plano. Alvos em coordenadas do mundo; o IK resolve no espaço da
  raiz, então giro e `corpo.estica` não tiram o pé do lugar.
- Animador (`animacao/animador.js`): curvas suave, linear, entra, sai, estalo, antecipa (+ passa, degrau).
  Chave sem pose = pausa. Alvos de IK valem até mudar; `null`/`pernas: 'fk'` solta (mistura de ângulos).
  Passo com arco automático. Arrasto = amostrar cabeça/pescoço/cotovelos/mãos alguns quadros antes.
  Vida: respiração (3,8 s) + piscadas determinísticas por semente; **infiltrado (estranho ≥ 0,3) não pisca**.
- Atuações (`animacao/atuacoes.js`): cada uma declara `inicio` e `final` (ESTADOS: em_pe, sentado,
  sentado_celular, sentado_triste, olhar_fixo, na_grade, no_cadeado, olhando, olhando_celular, segurando_lata,
  mao_estendida) para o diretor encadear sem salto. Escritas na origem olhando +z; `noLugar` leva à marca.
  `andar` é gerada por parâmetros (distância, tempo do passo) + camada contínua (balanço, braços).
  `cena` declara o que a atuação supõe (assento, grade, cadeado, geladeira); `objetos` declara adereços na mão.
- 1ª pessoa: braços "para a câmera" (mais altos que o natural, como em jogos), mãos guiadas por IK até pontos
  definidos em relação aos olhos (`naFrenteDosOlhos`). No vertical o campo horizontal é estreito (~±23° com
  FOV 75): mãos precisam ficar perto do centro.
- Cenário `distribuidora` (`visual/cenarios/distribuidora.js`): sala 4,4 × 4,2 m (teto 2,9), grade em z=1,2 com
  portinhola (moldura + bandeja) alinhada ao balcão, portão com cadeado, porta de aço enrolada, 2 geladeiras ocas
  com latas (instanced), prateleiras de garrafas, engradados, neon "ABERTO 24H", tabela de preços, 2 fluorescentes;
  fora: calçada de paralelepípedo, meio-fio, rua, poste com luz laranja, casas. MARCAS: balcao, geladeira,
  engradado, cadeado, portinhola, rua (com raio livre). `atualizar(t, {piscar})` = fluorescente falhando + neon.
- Luz `interior` (revista): principal 1,6 de dentro para fora (sombras caem para a rua) + ambiente 0,85, ambas
  esverdeadas, + 2 lâmpadas pontuais nas calhas ≈ π perto delas. Poste lá fora projeta a SOMBRA DA GRADE para
  dentro da loja (listras laranja no piso); no apagão sobram neon, geladeiras, TV e o poste. Luzes coloridas:
  geladeiras (frio), neon (vermelho), poste (laranja), tela do celular. Sombra de contato sob os personagens
  (`visual/estilo/sombras.js`); cantos (rodapé, teto, beirada do piso) escurecidos por degradê.
  A rua fica escura pela névoa preta do pós (6→26 m); postes distantes viram pontos de luz.
- Pós em 2 passes: (1) névoa + foco raso; (2) lente (curvatura olho de peixe + aberração cromática), vinheta,
  cor (tingir preservando brilho, saturação, contraste) e grão. Zerado = idêntico ao render direto (testado).
- Texturas por código (`visual/estilo/texturas.js`): azulejo, concreto, pedra, madeira, grama, água, metal
  ondulado, parede, asfalto + `texturaTexto` (cartazes/neon). Determinísticas (semente).
- Câmera (`animacao/camera.js`, puro): `enquadrar` por tamanho de plano (geral/medio/close) → distância e FOV,
  presa à marca do ator; respeita raio livre e os limites da sala (encurta e abre a lente). `mover` (empurrar,
  lateral, subir), `tremor` determinístico, `respiracaoCamera`, `projetar` (testes).
- Olhar (`animacao/olhar.js`, puro): `olharPara(pose, medidas, ponto)` — peito (se > 45°), pescoço leva o giro,
  cabeça leva o "para baixo" (evita rolar o horizonte). É o que move a câmera subjetiva.
- Pós (`visual/estilo/posfx.js`): um passe só (névoa por profundidade, foco raso com 16 amostras, vinheta, grão
  com semente no tempo). Alvo HalfFloat + MSAA 4x; com parâmetros zerados a cor sai idêntica.

## Testes e resultados

| Etapa | Teste | Resultado |
|---|---|---|
| 1 | `npm test`: quadros 0 e 90 em ordem 0,90 e 90,0 (Chromes distintos) têm md5 iguais | ✅ passa |
| 1 | md5 igual também no render paralelo (4 processos) | ✅ |
| 1 | 240 quadros → MP4: h264, 1080x1920, yuv420p, 60/1, 240 quadros (ffprobe) | ✅ |
| 1 | Velocidade (cena simples, 4 núcleos): 1 processo ≈ 2,5 q/s c/ abertura; 4 processos ≈ 16 q/s | — |
| 2 | `npm test`: cor medida na face = cor do material (4 cores), render direto e com pós neutro | ✅ exato, diferença 0 |
| 2 | Velocidade cena de teste noite + pós completo, 4 processos | ⚠️ 1,4 q/s |
| 3 | `npm test`: misturar (extremos, média, boca), padrões, derivar imutável, nomes errados recusados, 3 fichas válidas e altura coerente (±6%) | ✅ |
| 3 | Folha visual: 4 personagens (estilo blocos) × (4 vistas + acenar, apontar, sentar, assustado + infiltrado) | ✅ aprovação pendente |

Evidências: `projetos/_evidencias/etapa1_folha.png`, `projetos/_evidencias/etapa2_estilo.png`
(calibração com faixa de referência invisível | dia com pós | noite com lanterna, 2 instantes),
`projetos/_evidencias/etapa3_personagens.png` (Gabriel, Cliente, Eduardo, Exemplo barba),
`projetos/_evidencias/etapa3_referencias.png` (referência × resultado),
`projetos/_evidencias/etapa4_larissa_grade_folha.png`, `..._frente.png`, `etapa4_larissa_grade.mp4`,
`etapa4_revelacao_estagios.png`, `etapa4_revelacao_noite.png`, `etapa5_genericas.png`, `etapa5_roteiro.png`,
`etapa5_andar.mp4`, `etapa6_cenario_cameras.png`, `etapa6_pov_sequencia.mp4`,
`etapa6b_iluminacao.png`, `etapa6b_referencia_x_resultado.png`, `etapa6b_pov_sequencia.mp4`.

## Limitações conhecidas

- **Velocidade**: WebGL por software + pós ⇒ ~1,4 q/s com 4 processos na cena de teste; **~0,8 q/s no
  cenário completo com luzes e pós em 2 passes** (65 s a 60 fps ≈ 80 min). Prioridade da etapa 10.
  Medido: buffer intermediário c/ MSAA custa ~40%; o grão deixa o PNG com 2,4 MB e a captura ~30% mais
  lenta; reduzir amostras do desfoque não muda nada. Plano (etapa 10): capturar pixels crus e mandar direto
  ao ffmpeg (sem PNG), e opção de prévia com GPU/meia resolução.
- O teste de determinismo usa a cena de teste; repetir com a cena real na etapa 10.
- Boneco: peças rígidas aparecem como emendas em close extremo; cabelo longo é feito de caixas (sem
  física). Membros ainda mais finos e mãos menores que na ref3.
- Celular (`visual/objetos/celular.js`): tela desenhada por código e emissiva (aparece no escuro); em 1ª pessoa
  fica apoiado NA FRENTE da palma (`segurarNaFrente`) para a mão não tampar a tela (pedido do responsável).
- Caminhada só em linha reta (+z); curvas/virar no lugar ficam para quando o diretor precisar.
- Cenário `floresta` do roteiro original não foi feito (a série não usa); texturas grama/água já existem. Com a perna 100% esticada o pé no chão fica no limite do alcance do IK: poses em pé devem ter
  `desl.y` ≈ -0,03 (joelho levemente dobrado).

## Próxima etapa

Etapa 7: camada de direção. `roteiro.json` → planos → linha do tempo: cada fala vira plano que começa na
1ª palavra; atores com atuação + marca; câmera (subjetiva com olhar para alvo / 3ª pessoa com tamanho);
efeitos (piscar, tremor, corte para preto, cartela); palavra de destaque dispara ação; tempos "p19+0.12",
"fim-0.3"; erros claros listando nomes válidos. Sem voz ainda: tempos de palavra estimados (a etapa 8 troca
pelos do Edge TTS).

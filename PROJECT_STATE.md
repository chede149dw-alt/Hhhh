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
Fichas: `gabriel.json`, `cliente.json` (infiltrada), `eduardo.json` (mãos em quadro), `exemplo_barba.json` (teste).

**Estilo dos personagens: "blocos"** (referências em `projetos/_referencias/`):
- ref3 (principal): corpo de caixas arredondadas, cabelo em blocos, olhos escuros ovais sem branco com brilho,
  nariz em bloco, bigode, colarinho/botões/bolso, cinto, relógio, sapato → Gabriel.
- ref2: moletom largo cor-bloco (pala escura em V, detalhe laranja), gola alta com zíper, calça justa, coturno → Eduardo.
- ref1: cabelo volumoso e barba facetados (flatShading), óculos → peças disponíveis (exemplo_barba).
- Infiltrado (`rosto.estranho`): olhos crescem e perdem o brilho ("olhar morto"), boca alarga.
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
- Rosto: olhos, sobrancelhas em bloco, nariz em bloco, 4 bocas como peças planas na face frontal da cabeça. Canal `rosto.estranho`
  (0..1) faz a revelação do infiltrado: pupilas tomam o olho e a boca alarga.
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
`projetos/_evidencias/etapa3_referencias.png` (referência × resultado).

## Limitações conhecidas

- **Velocidade**: WebGL por software + pós ⇒ ~1,4 q/s com 4 processos (60 s de vídeo ≈ 43 min).
  Medido: buffer intermediário c/ MSAA custa ~40%; o grão deixa o PNG com 2,4 MB e a captura ~30% mais
  lenta; reduzir amostras do desfoque não muda nada. Plano (etapa 10): capturar pixels crus e mandar direto
  ao ffmpeg (sem PNG), e opção de prévia com GPU/meia resolução.
- O teste de determinismo usa a cena de teste; repetir com a cena real na etapa 10.
- Boneco: peças rígidas aparecem como emendas em close extremo; cabelo longo é feito de caixas (sem
  física). Membros ainda mais finos e mãos menores que na ref3. Sentar depende de `desl.y` manual até existir IK dos pés (etapa 4).

## Próxima etapa

Etapa 4: animador por poses-chave (curvas, IK de pés e mãos, arrasto, respiração e piscar) com testes
`node --test` e a atuação de exemplo. Para a série, trocar "ataque_salto" por uma atuação de susto da
cliente (aproximar, inclinar a cabeça, revelar o rosto estranho), mantendo antecipação/impulso/assentamento.

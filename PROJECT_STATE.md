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

Evidências: `projetos/_evidencias/etapa1_folha.png`, `projetos/_evidencias/etapa2_estilo.png`
(calibração com faixa de referência invisível | dia com pós | noite com lanterna, 2 instantes).

## Limitações conhecidas

- **Velocidade**: WebGL por software + pós ⇒ ~1,4 q/s com 4 processos (60 s de vídeo ≈ 43 min).
  Medido: buffer intermediário c/ MSAA custa ~40%; o grão deixa o PNG com 2,4 MB e a captura ~30% mais
  lenta; reduzir amostras do desfoque não muda nada. Plano (etapa 10): capturar pixels crus e mandar direto
  ao ffmpeg (sem PNG), e opção de prévia com GPU/meia resolução.
- O teste de determinismo usa a cena de teste; repetir com a cena real na etapa 10.

## Próxima etapa

Etapa 3: personagem articulado com ficha (esqueleto em grupos, peças rígidas, rosto com 4 bocas,
`criarBoneco(ficha)`, poses e `misturar`), com folha de 4 vistas + 4 poses. Para o terror: além do
humano padrão, prever ficha da criatura (proporções alongadas) usando o mesmo esqueleto.

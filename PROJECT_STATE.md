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

## Decisões

- three.js 0.186.1 copiado para `motor/visual/lib/three` e carregado por import map.
- Render: puppeteer-core 25.15.0 + Chrome headless com `--use-angle=swiftshader` (WebGL por software):
  mais lento que GPU, mas determinístico e igual em qualquer máquina.
- Paralelismo: **um Chrome por processo**. Várias abas no mesmo Chrome travam (abas em segundo plano
  não pintam no headless).
- Captura por `page.screenshot` em viewport 1080x1920, `deviceScaleFactor: 1`.
- Quadro N ⇒ `t = N / fps`. Arquivos `quadro_00090.png` usam o número do quadro.
- Saídas regeráveis ficam fora do git; evidências pequenas em `projetos/_evidencias/`.

## Testes e resultados

| Etapa | Teste | Resultado |
|---|---|---|
| 1 | `npm test`: quadros 0 e 90 em ordem 0,90 e 90,0 (Chromes distintos) têm md5 iguais | ✅ passa |
| 1 | md5 igual também no render paralelo (4 processos) | ✅ |
| 1 | 240 quadros → MP4: h264, 1080x1920, yuv420p, 60/1, 240 quadros (ffprobe) | ✅ |
| 1 | Velocidade (cena simples, 4 núcleos): 1 processo ≈ 2,5 q/s c/ abertura; 4 processos ≈ 16 q/s | — |

Evidência: `projetos/_evidencias/etapa1_folha.png`.

## Limitações conhecidas

- Velocidade vai cair com sombras e pós-processo; medir de novo na etapa 2.
- O teste de determinismo usa a cena de teste; repetir com a cena real na etapa 10.

## Próxima etapa

Etapa 2: estilo chapado (MeshToonMaterial com rampa estreita, luz calibrada, sombra só no chão,
volume opcional, pós-processo) e página de teste com 3 cubos e 1 esfera.

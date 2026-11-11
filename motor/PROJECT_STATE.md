# Estado do projeto — motor 3D

Roteiro de construção: `referencias/documentos/PROMPTS_RECRIAR.md` (prompts 0 a 11), um passo por vez, com evidência antes de avançar.

## Decisões
- **Motor 3D novo** com three.js 0.187.0 em `motor/visual/lib/three/`; o motor 2D atual fica até o 3D ficar pronto. (aprovado pelo autor)
- **Lucas refeito em 3D com o mesmo design** (cores, cabelo, moletom com faixa, calça, tênis); ficha 3D vai para aprovação. (aprovado)
- **Saídas:** testes em `previas/`, vídeos finais em `prontos/` (em vez de `projetos/` do documento). (aprovado)
- **Chrome:** `puppeteer-core` 25.17.0. Na nuvem usa o Chromium do ambiente por software (SwiftShader); no computador do autor (placa RX 7600) usa o Chrome instalado com GPU. Continuar o trabalho no computador é o recomendado para o 3D.
- **Voz:** Edge TTS (grátis); o host `speech.platform.bing.com` foi liberado na rede do ambiente.
- **60 fps**, 1080×1920.

## Testes e resultados
| Etapa | Teste | Resultado |
|---|---|---|
| 1 — render por quadro | quadros 0 e 90 renderizados nas ordens [0,90] e [90,0]: md5 iguais | **passou** |
| 1 — velocidade | 120 quadros 1080×1920 com 4 processos | 12,3 s (9,7 quadros/s) |
| 1 — junção | 120 PNG → MP4 60 fps H.264 crf 20 | ok (`previas/motor3d/teste-render.mp4`) |

## Limitações conhecidas
- WebGL por software (sem GPU): ~2,5 quadros/s por processo na cena de teste; cenas reais serão mais lentas. Planejar 4 processos.
- `node --test` no Node 22 precisa dos arquivos (`testes/*.test.js`), não da pasta.

## Próxima etapa
Prompt 2 — estilo chapado (MeshToonMaterial com rampa estreita, luz calibrada sol 2.0 + ambiente 1.2, sombra só no chão,
volume opcional, pós-processo com névoa, foco raso, grão e vinheta) e página de teste com 3 cubos e 1 esfera.

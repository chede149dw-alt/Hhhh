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
| 2 — calibração | face iluminada de 4 cubos/esfera = cor do guia (pós desligado, tolerância 4) | **passou**: marinho, turquesa e mostarda exatos; brasa −3 (faixa de volume) |
| 3 — boneco | juntas completas; sola no chão (±1 cm); altura = ficha (±5 cm); altura 1,8 escala tudo; misturar nas pontas e no meio; sentar abaixa o quadril | **passou** (`testes/boneco.test.js`) |
| 3 — ficha | 4 vistas, 4 bocas, 4 poses (acenar, apontar, sentar, assustado) | `personagens/lucas/3d/ficha.png` — **aguardando aprovação** |
| 2 — estilo | 180 quadros com névoa, foco raso, grão e vinheta | 84,6 s (2,1 quadros/s, nuvem); `previas/motor3d/teste-estilo.mp4` |

## Limitações conhecidas
- WebGL por software (sem GPU): ~2,5 quadros/s por processo na cena de teste; cenas reais serão mais lentas. Planejar 4 processos.
- `node --test` no Node 22 precisa dos arquivos (`testes/*.test.js`), não da pasta.

## Estilo (prompt 2) — `visual/estilo.js`
- Conta da luz: `sol × g_max + ambiente = π` → com sol 2,0 e ambiente 1,2, a rampa vai de 0,80 a 0,9708 (transição estreita).
- Sem tone mapping, saída sRGB. O pós converte de linear para sRGB **antes** do grão e da vinheta (sem isso a imagem fica escura e saturada).
- Sombra: só o chão recebe; objetos e personagens projetam, mas não recebem.
- `PCFSoftShadowMap` foi removido no three 0.187: usar `PCFShadowMap` com `shadow.radius`.

## Boneco (prompt 3) — `personagem/boneco.js`
- Lucas 3D com o mesmo design da ficha 2D; ficha em `personagens/lucas/3d/ficha.json`.
- A altura da ficha conta até o topo do cabelo: o boneco se mede montado e ajusta a escala.
- Coluna com 2 juntas (coluna + peito), como recomendam as armadilhas do documento.
- Cabelo: calota inclinada para trás + mechas em gota (LatheGeometry) apontando para fora; bolinhas pareciam "black power" e cones puros pareciam anime.
- Pastas `visual/` e `personagem/` têm `package.json` com `"type": "module"` para o Node importar os módulos nos testes.

## Próxima etapa
Depois da aprovação da ficha 3D: prompt 4 — animador por poses-chave (curvas, IK de pés e mãos, arrasto, vida)
com testes e a atuação "ataque_salto" (folha de 18 quadros).

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
| 3 — ficha | 4 vistas, 4 bocas, 4 poses (acenar, apontar, sentar, assustado) | `personagens/lucas/3d/ficha.png` — **aprovada** |
| 4 — interpolação | em(t) nos instantes das chaves = pose da chave (1e-12); curvas vão de 0 a 1 | **passou** |
| 4 — IK | sola e pulso no alvo, 3 casos (com giro, agachado, mãos) | **passou**, erro < 1e-6 m |
| 4 — pé plantado | 60 quadros de corpo descendo, girando e deslocando | **passou**, desliza < 1e-6 m |
| 4 — fluidez | variação da velocidade vertical por quadro no ataque_salto < 0,9 m/s (deu 0,31); chave no meio de uma subida não freia | **passou** |
| 4 — ataque_salto | 11 poses-chave + voo (parábola), folha de 18 quadros + vídeo 2,8 s 60 fps (168 quadros em 79,7 s, nuvem) | `previas/motor3d/ataque-salto-folha.png`, `ataque-salto.mp4` |
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

## Lucas 3D v2 (proposta, aguardando aprovação)
- Pedido do autor: estilo dos personagens das referências (3D chapado): cabelo em lascas planas e pontudas, tronco em bloco,
  mãos de luva, sombreado bem liso. Mantém a identidade do Lucas (cores, moletom, pele, cabelo escuro); não copia o personagem da referência.
- Cabelo: casco com borda recortada (franja/nuca) + lascas planas (ExtrudeGeometry fina, curvada) em camadas e dois tons.
  Tentativas que não funcionaram: bolinhas (black power), cones (anime), gotas, lâminas coladas (capacete).
- Roupa: RoundedBoxGeometry (addon do three 0.187 copiado para `visual/lib/three/addons/`) + `afunilar` e `placa` (Shape extrudado).
  Moletom solto com barra canelada, bolso canguru em trapézio com aberturas, costuras raglã, capuz em gota deitado nas costas
  com forro, ilhós e cordões; punho franzido; calça com barra dobrada; tênis com lingueta, cadarço, calcanhar e sola grossa.
- Folha: `previas/motor3d/lucas3d-v2-ficha.png`; comparação `lucas3d-antes-x-v2.png`; salto `lucas3d-v2-salto.mp4`.
  Quando aprovada: copiar a folha para `personagens/lucas/3d/ficha.png` e mudar o status na ficha.

## Animador (prompt 4) — `animacao/`
- `animador.js` (puro, sem three): chaves {t, pose, curva}. **Padrão 'fluida'**: spline cúbica monotônica (PCHIP)
  que passa pelas poses sem frear — o autor reclamou que o salto "engasgava": a versão antiga freava até parar em toda chave.
  Curvas por trecho (linear, suave, entra, sai, sobe, cai, estalo, antecipa) com `so: [...]` para valer só em alguns canais.
  **Voos**: no ar o corpo segue parábola de gravidade e anda em velocidade constante; impulso e aterrissagem
  emendam na velocidade do voo (4·h/T). Evitar 'estalo' em golpes: dá tranco no primeiro quadro.
  Campo que falta numa chave vale o neutro (corpo 0, estica 1…); só alvos de IK, mãos e rosto seguram o valor.
  (Bug achado pelo teste do pé plantado: segurar o `corpo` da outra chave girava o corpo antes da hora.)
- `aplicar.js`: IK analítico de 2 ossos (pés: alvo = ponto da sola; mãos: alvo = pulso), pesos `ikPes`/`ikMaos` 0–1
  misturam IK e ângulos sem pulo. Amassa-e-estica deforma o corpo inteiro: IK exato só com estica = 1.
- Arrasto: pescoço, cabeça, cotovelos e mãos usam a pose de 0,03–0,08 s antes. Vida: respiração (3,6 s) e piscadas fixas por tempo.
- `atuacoes.js`: `ataque_salto` (pronto, antecipação, impulso, no ar, golpe, aterrissagem, assentamento, pronto, segura).
- `visual/acao.html?acao=...` (vídeo) e `&modo=folha` (18 quadros).

## Próxima etapa
Prompt 5 — biblioteca de atuações (ATUACOES) e prompt 6 — cenário e câmera por tamanho de plano.

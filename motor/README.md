# Motor

Duas gerações de motor convivem aqui enquanto o 3D é construído:

- **Motor 3D (novo, em construção)** — segue `PROMPTS_RECRIAR` (prompts 0 a 11): three.js, personagens 3D toon,
  60 fps, poses-chave com IK, Edge TTS, testes automáticos. Estado em `PROJECT_STATE.md`.
- **Motor 2D (atual)** — Canvas 2D (`rig.js`, `cena3d.js`, `episodio.js`, `video.js`…). Continua funcionando
  até o 3D substituí-lo.

## Versões fixas (motor 3D)
| Peça | Versão | Onde |
|---|---|---|
| three.js | 0.187.0 | `motor/visual/lib/three/` (cópia de `three.module.js` + `three.core.js`) |
| puppeteer-core | 25.17.0 | `motor/node_modules` (`npm install` em `motor/`) |
| Chrome | Chromium do ambiente (`/opt/pw-browsers/chromium`, WebGL2 por SwiftShader) | variável `CHROME` para trocar |
| ffmpeg | 6.1.1 | sistema |

## Comandos (motor 3D)
Rodar da raiz do projeto (`npm install` dentro de `motor/` na primeira vez).

| Comando | O que faz |
|---|---|
| `node motor/render/quadros.js <pagina.html> --quadros 0,90,239 --saida <pasta>` | Renderiza quadros escolhidos em PNG |
| `node motor/render/quadros.js <pagina.html> --de 0 --ate 239 --saida <pasta> --processos 4` | Renderiza um intervalo, em paralelo |
| `node motor/render/juntar.js <pasta> <saida.mp4> [--fps 60] [--audio a.wav]` | Junta os PNGs num MP4 (H.264, crf 20) |
| `cd motor && npm run teste` | Testes automáticos (`node --test`) |

## Módulos (motor 3D)
| Arquivo | Função |
|---|---|
| `render/servidor.js` | Servidor estático local (módulos ES não carregam de `file://`) |
| `render/quadros.js` | Abre a página no Chrome sem tela, chama `window.quadro(t)` e salva cada quadro |
| `render/juntar.js` | PNGs → MP4 com ffmpeg |
| `visual/teste-render.html` | Página de teste do render por quadro |
| `testes/determinismo.test.js` | Mesmo instante → mesmo quadro (md5), em qualquer ordem |

Contrato de página: expor `window.quadro(t)` (posiciona tudo pelo tempo `t` em segundos e desenha, sem relógio real)
e `window.pronto = true` quando carregar. Opcional: `window.capturar()` devolvendo o PNG em base64.

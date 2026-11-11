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
| Chrome | Na nuvem: Chromium do ambiente (WebGL por software). No computador: Chrome ou Edge instalado, usando a placa de vídeo | variável `CHROME` para outro caminho; `SOFTWARE=1` força modo software |
| ffmpeg | 6.1.1 | sistema |
| Python | edge-tts 7.3.1, numpy, scipy | `pip install edge-tts scipy` |

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
| `visual/estilo.js` | Estilo chapado: `materialToon(cor, {volume})`, `criarLuzes`, `criarChao`, `criarRenderer`, `criarPos` (névoa, foco raso, grão, vinheta) |
| `personagem/boneco.js` | Boneco articulado: `criarBoneco(ficha)`, `REPOUSO`, `POSES`, `misturar`, `EXPRESSOES`, `JUNTAS` |
| `animacao/animador.js` | Poses-chave → pose no instante t: `criarAnimacao(chaves)`, `em(t)`, `final(t)`, `CURVAS`, `vida`, `piscar` (puro, sem three) |
| `animacao/aplicar.js` | `aplicar(boneco, pose)` com IK dos pés e das mãos; `pontoSola`, `pontoPulso` |
| `animacao/atuacoes.js` | Biblioteca de atuações: `ATUACOES`, `montarAtuacao(nome, opções)`, `PAUSAS` (andar, acenar, assustar, sentar_triste, comemorar, poder_terra, ataque_salto) |
| `visual/acao.html` | Mostra uma atuação: `?acao=ataque_salto` (vídeo) ou `&modo=folha` (18 quadros) |
| `visual/texturas.js` | Texturas geradas por código (asfalto, calçada, madeira, parede, tijolo, grama, pedra, terra, céu, halo) |
| `cena/cenarios.js` | Cenários 3D: `CENARIOS.rua()`, `CENARIOS.quarto()` (marca, área livre, luz, névoa) |
| `cena/camera.js` | Câmera por tamanho de plano: `enquadrar`, `camNoTempo` (empurrar, puxar, lateral, órbita, tremor) |
| `efeitos3d/terra.js` | Poder da terra 3D: `criarPoderTerra()`, `criarRachaduraChao()` |
| `visual/cena.html` | Cenário + câmera: `?cenario=quarto&modo=folha` ou `&demo=poder` / `?cenario=rua&demo=andar` |
| `direcao/direcao.js` | Roteiro → planos → linha do tempo: `dirigir`, `estimarPalavras`, `tempo`, `ErroRoteiro` |
| `direcao/dirigir.js` | Linha de comando: `node motor/direcao/dirigir.js roteiro.json [--palavras words.json] --saida linha.json` |
| `visual/episodio.html` | Toca uma linha do tempo: `?linha=…/linha-do-tempo.json` |
| `audio/narrar.py` | Narração Edge TTS: `python3 motor/audio/narrar.py roteiro.json audio/<serie>/<ep>` → narracao.wav + words.json |
| `audio/sfx.py` | Sons e trilhas sintetizados: `python3 motor/audio/sfx.py audio/sfx` |
| `audio/mixar.py` | Mixagem a −14 LUFS: `python3 motor/audio/mixar.py --voz … --linha … --saida mix.wav --trilha tensa` |
| `visual/ficha3d.html` | Folha do personagem 3D (`?ficha=personagens/.../ficha.json`): vistas, bocas e poses |
| `visual/teste-estilo.html` | Cena de teste do estilo (3 cubos + esfera nas cores do guia); `window.medirCores()` |
| `testes/determinismo.test.js` | Mesmo instante → mesmo quadro (md5), em qualquer ordem |
| `testes/boneco.test.js` | Juntas, altura, sola no chão, escala e mistura de poses |
| `testes/animador.test.js` | Chaves exatas, curvas, IK < 1e-6 m, pé plantado, arrasto e piscar |
| `testes/atuacoes.test.js` | Chaves em ordem, sem pose vazia, fim em repouso/pausa, pé de apoio do andar parado |
| `testes/camera.test.js` | Enquadramento por tamanho, área livre e movimentos de câmera |
| `testes/direcao.test.js` | Tempos dos planos, expressões de tempo, impacto na palavra e nomes errados recusados |
| `testes/audio.test.js` | Sons sintetizados e LUFS final da mixagem |
| `testes/estilo.test.js` | Cor iluminada = cor do material (calibração da luz) |

Contrato de página: expor `window.quadro(t)` (posiciona tudo pelo tempo `t` em segundos e desenha, sem relógio real)
e `window.pronto = true` quando carregar. Opcional: `window.capturar()` devolvendo o PNG em base64.

## Rodar no computador (com placa de vídeo)
1. Instalar: Git, Node.js 22, Python 3, ffmpeg (no PATH) e Google Chrome.
2. `git clone https://github.com/chede149dw-alt/Hhhh.git` e `git checkout ccr-b698bf6a-9k0oak`.
3. `cd Hhhh/motor && npm install`.
4. Testar: `npm run teste` e `node motor/render/quadros.js motor/visual/teste-render.html --de 0 --ate 119 --saida previas/motor3d/teste-render --processos 4` (da raiz).
   O render acha o Chrome sozinho; se não achar, defina `CHROME` com o caminho do `chrome.exe`.

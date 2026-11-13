# motor

Motor audiovisual local: vídeos verticais 1080x1920 a 60 fps, 3D chapado, tudo por código.

## Versões fixas

| Peça | Versão | Onde |
|---|---|---|
| three.js | **0.186.1** | `visual/lib/three/` (cópia local: `three.module.js`, `three.core.js`, `addons/` com postprocessing, shaders, math, utils, geometries/RoundedBoxGeometry) |
| puppeteer-core | 25.15.0 | `node_modules` (só controla o Chrome) |
| Node | 22.x | — |
| ffmpeg | 6.x | sistema |
| Chrome/Chromium | qualquer recente | `CHROME_PATH` ou caminho padrão |

O three é carregado **somente** de `visual/lib/three/` via import map. O pacote `three` do npm serve
apenas para copiar os arquivos; não importe de `node_modules/three`.

## Instalação

```bash
cd motor
npm install
# se o Chrome não estiver num caminho padrão:
export CHROME_PATH="/caminho/do/chrome"
```

## Comandos

Os caminhos de página são relativos à **raiz do repositório**.

```bash
# quadros avulsos (número do quadro; t = quadro / fps)
node render/renderizar.mjs motor/visual/testes/relogio.html --quadros 0,90,239 --saida ../projetos/_testes/x

# intervalo, em paralelo (1 Chrome por processo)
node render/renderizar.mjs motor/visual/testes/relogio.html --de 0 --ate 239 --processos 4 --saida ../projetos/_testes/x

# juntar PNGs em MP4 (H.264, crf 20, yuv420p, 60 fps; --audio opcional)
node render/juntar.mjs ../projetos/_testes/x ../projetos/_testes/x.mp4

# testes automáticos
npm test
```

Opções do renderizador: `--fps 60`, `--largura 1080`, `--altura 1920`, `--processos N`.

## Contrato da página

Toda página renderizável deve:

1. Expor `window.quadro(t)` (síncrona ou `async`): posiciona **toda** a cena no instante `t` (segundos) e
   desenha. Proibido usar `Date.now()`, `performance.now()`, `requestAnimationFrame` como relógio ou
   `Math.random()` sem semente.
2. Opcionalmente expor `window.pronto` (Promise) que resolve quando texturas/fontes carregaram.
3. Usar `preserveDrawingBuffer: true` e `setPixelRatio(1)`.

## Módulos

| Arquivo | Função |
|---|---|
| `render/servidor.mjs` | Servidor HTTP estático (raiz = repositório), porta aleatória. |
| `render/navegador.mjs` | Abre Chrome headless com WebGL por software (SwiftShader) para pixels determinísticos; `abrirPagina`, `capturar`. |
| `render/renderizar.mjs` | CLI e função `renderizar()`: quadros → `quadro_NNNNN.png`, com N processos. |
| `render/juntar.mjs` | CLI e função `juntar()`: PNGs (+ áudio) → MP4 via ffmpeg. |
| `visual/estilo/chapado.js` | Rampa toon, `materialChapado(cor)`, `VOLUME`, `criarLuzes(cena, 'dia'\|'noite', {camera})`, `comoObjeto`/`comoChao`, `prepararRenderer`. Conta da calibração no topo do arquivo. |
| `visual/estilo/posfx.js` | `criarPos(renderer, L, A, params, {msaa, taps})`: névoa, foco raso, vinheta, grão. `POS_NEUTRO`. |
| `animacao/poses.js` | Puro (Node + navegador): juntas, canais, `REPOUSO`, `POSES` (acenar, apontar, sentar, assustado), `derivar`, `misturar`, `validarPose`. |
| `visual/boneco/medidas.js` | Puro: `validarFicha`, `calcularMedidas` (proporções a partir da altura). |
| `visual/boneco/boneco.js` | `criarBoneco(ficha)` → `{ raiz, juntas, posar(pose), medidas }`; `carregarFicha(nome)`. |
| `visual/boneco/fichas/*.json` | Fichas: nome, papel, altura, corpo (largura/peso/ombros), cores, peças (cabelo, camisa, calca, calcado, barba, acessorios); cores extras opcionais: camisa2, detalhe, sola, cinto, fivela, barba. Valores válidos em `medidas.js` (`PECAS_VALIDAS`). |
| `visual/testes/boneco.html` | `?ficha=nome`, quadros 0-8 com `--fps 1`: 4 vistas, 4 poses e o rosto infiltrado. |
| `visual/testes/relogio.html` | Cena mínima de teste do contrato `quadro(t)`. |
| `visual/testes/estilo.html` | 3 cubos + 1 esfera. URL: `luz=dia\|noite`, `pos=0\|neutro\|1`, `calib=1`. Expõe `window.medir()`. |
| `render/medir_estilo.mjs` | Mede a cor na tela (face iluminada e faixa de referência). |
| `testes/determinismo.test.mjs` | Renderiza 0 e 90 em ordem direta e invertida e compara md5. |
| `testes/poses.test.mjs` | Poses, mistura, validação e fichas. |
| `testes/estilo.test.mjs` | Cor iluminada = cor do material (tolerância 2/255), direto e com pós neutro. |

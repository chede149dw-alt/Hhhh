#!/bin/bash
# Prepara um projeto do motor (2D recortado + cenário 3D WebGL) numa pasta (padrão: ./animacao-do-chede) e confere as ferramentas.
# Uso: bash scripts/preparar.sh [pasta-destino]
set -u
AQUI="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-animacao-do-chede}"
if [ -e "$DEST/motor/video.js" ]; then echo "Projeto já existe em $DEST (não sobrescrevi)."; else
  mkdir -p "$DEST" && cp -r "$AQUI/assets/motor2d/." "$DEST/" && mkdir -p "$DEST"/{audio,previas,prontos,referencias/videos,referencias/imagens}
  echo "Projeto criado em $DEST"
fi
falta=0
for c in node ffmpeg ffprobe espeak-ng python3; do command -v $c >/dev/null || { echo "FALTA: $c"; falta=1; }; done
fc-list 2>/dev/null | grep -qi "Inter" || echo "AVISO: fonte Inter não encontrada (legendas usarão outra fonte). Instale: apt-get install -y fonts-inter"
python3 -c "import numpy, scipy" 2>/dev/null || echo "AVISO: numpy/scipy faltando (trilha sintetizada por código). Instale: pip install numpy scipy"
# Playwright: usa o que já estiver disponível (global ou na pasta); senão instala na pasta do projeto.
# Atenção: não rode 'npm install three' na pasta — o three.js já vem em motor/vendor/ e um npm install pode trocar a versão do Playwright.
if ! (cd "$DEST" && node -e "require('playwright')" 2>/dev/null); then
  (cd "$DEST" && npm install --no-audit --no-fund >/dev/null 2>&1 && echo "playwright instalado") || { echo "FALTA: playwright (npm install em $DEST)"; falta=1; }
fi
(cd "$DEST" && node -e "
require('playwright').chromium.launch().then(async b => {
  const p = await b.newPage();
  const gl = await p.evaluate(() => { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); });
  console.log('Chromium ok' + (gl ? ', WebGL ok (cenário 3D)' : ' — SEM WebGL: o cenário 3D (cenarios/valdor-3d.js) não vai renderizar'));
  return b.close();
}).catch(e => { console.log('FALTA: navegador do Playwright ->', e.message.split('\n')[0]); process.exit(1); })") || falta=1
[ $falta = 0 ] && echo "Tudo pronto." || echo "Instale o que falta antes de renderizar (ffmpeg e espeak-ng: apt-get install -y ffmpeg espeak-ng)."

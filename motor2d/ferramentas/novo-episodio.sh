#!/bin/bash
# Cria um episódio novo A PARTIR DO MOLDE (capítulo 4 do livro): nunca copie o último vídeo,
# porque ele carrega os remendos dele. O molde só tem o que já foi aprovado.
# Uso: bash ferramentas/novo-episodio.sh <serie> <episodio>     ex.: bash ferramentas/novo-episodio.sh terra ep02
set -eu
cd "$(dirname "$0")/.."
[ $# -eq 2 ] || { echo "Uso: bash ferramentas/novo-episodio.sh <serie> <episodio>"; exit 1; }
DEST="roteiros/$1"
mkdir -p "$DEST"
for ext in json js; do
  if [ -e "$DEST/$2.$ext" ]; then echo "Já existe $DEST/$2.$ext (não sobrescrevi)."; exit 1; fi
done
cp roteiros/_molde/molde.json "$DEST/$2.json"
cp roteiros/_molde/molde.js "$DEST/$2.js"
python3 - "$DEST/$2.json" "$1" <<'PY'
import json, sys
p, serie = sys.argv[1], sys.argv[2]
r = json.load(open(p)); r.pop('_leia', None); r['serie'] = serie
json.dump(r, open(p, 'w'), ensure_ascii=False, indent=2)
PY
echo "Criado: $DEST/$2.json e $DEST/$2.js (cópia do molde)."
echo "1) Escreva o roteiro em $DEST/$2.md e mostre pro autor."
echo "2) Folha de teste: node motor/video.js $DEST/$2.json $DEST/$2.js previas/x.mp4 --previa --teste previas/$1-$2-teste.png"
echo "3) Prévia:         node motor/video.js $DEST/$2.json $DEST/$2.js previas/$1-$2-previa.mp4 --previa --workers 4"

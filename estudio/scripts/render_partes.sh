#!/bin/bash
# Render resistente a reinícios: renderiza em blocos (só vídeo), pula blocos já prontos,
# renderiza o áudio uma vez e junta tudo no final.
# Uso: scripts/render_partes.sh <Composicao> <total_quadros> <saida.mp4> [bloco=300]
set -e
COMP="$1"; TOTAL="$2"; SAIDA="$3"; BLOCO="${4:-300}"
DIR="out/partes-$COMP"
mkdir -p "$DIR"
OPTS="--gl=swangle --concurrency=4 --timeout=180000 --browser-executable=/opt/pw-browsers/chromium"
i=0
: > "$DIR/lista.txt"
while [ $((i * BLOCO)) -lt "$TOTAL" ]; do
  de=$((i * BLOCO)); ate=$(( (i + 1) * BLOCO - 1 )); [ $ate -ge "$TOTAL" ] && ate=$((TOTAL - 1))
  arq="$DIR/bloco-$(printf %03d $i).mp4"
  if [ ! -s "$arq" ]; then
    echo "bloco $i: quadros $de-$ate"
    npx remotion render "$COMP" "$arq.tmp.mp4" --frames=$de-$ate --muted --crf=18 $OPTS > "$DIR/log-$i.txt" 2>&1
    mv "$arq.tmp.mp4" "$arq"
  else
    echo "bloco $i já pronto"
  fi
  echo "file 'bloco-$(printf %03d $i).mp4'" >> "$DIR/lista.txt"
  i=$((i + 1))
done
if [ ! -s "$DIR/audio.wav" ]; then
  npx remotion render "$COMP" "$DIR/audio.tmp.wav" --codec=wav $OPTS > "$DIR/log-audio.txt" 2>&1
  mv "$DIR/audio.tmp.wav" "$DIR/audio.wav"
fi
ffmpeg -loglevel error -y -f concat -safe 0 -i "$DIR/lista.txt" -i "$DIR/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$SAIDA"
echo "pronto: $SAIDA"

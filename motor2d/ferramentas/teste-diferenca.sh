#!/bin/bash
# TESTE DE DIFERENÇA (capítulos 10 e 12): antes de mudar a base, confere que os vídeos aprovados continuam iguais.
# Gera quadros do episódio na versão antiga (um commit do git) e na atual, e compara pixel a pixel.
# Uso: bash ferramentas/teste-diferenca.sh <commit-antigo> [roteiro.json] [planos.js] [cada]
#   padrão: episódio 1 da terra (versão dramática), um quadro a cada 15
# Resultado: quantos quadros ficaram idênticos e uma imagem lado a lado (antes | depois | onde mudou) dos que mudaram.
set -eu
cd "$(dirname "$0")/.."
ANTES="${1:?Uso: bash ferramentas/teste-diferenca.sh <commit-antigo> [roteiro.json] [planos.js] [cada]}"
ROT="${2:-roteiros/terra/ep01-dramatico.json}"; PLA="${3:-roteiros/terra/ep01-dramatico.js}"; CADA="${4:-15}"
TMP="$(mktemp -d)"; trap 'git worktree remove --force "$TMP/antes" >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
REL="$(git rev-parse --show-prefix)"
git worktree add -q --detach "$TMP/antes" "$ANTES"
ln -s "$PWD/node_modules" "$TMP/antes/$REL/node_modules" 2>/dev/null || true
echo "Quadros da versão $ANTES..."; (cd "$TMP/antes/$REL" && node motor/video.js "$ROT" "$PLA" x.mp4 --previa --quadros "$TMP/a" --cada "$CADA" >/dev/null)
echo "Quadros da versão atual...";  node motor/video.js "$ROT" "$PLA" x.mp4 --previa --quadros "$TMP/b" --cada "$CADA" >/dev/null
mkdir -p previas
python3 -I ferramentas/comparar.py "$TMP/a" "$TMP/b" previas/diferenca.png

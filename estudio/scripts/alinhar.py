"""Alinha a narração com o roteiro: tempo de cada palavra e de cada fala.

Uso: HF_HUB_DISABLE_XET=1 python3 -I scripts/alinhar.py <audio.mp3> <falas.json> <saida.json>
Palavras entre *asteriscos* = destaque amarelo; entre !exclamações! = destaque vermelho.
"""
import json, re, subprocess, sys, unicodedata, difflib
import numpy as np
from faster_whisper import WhisperModel

audio, falas_p, saida = sys.argv[1:4]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
dur = len(a) / 16000

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

falas = json.load(open(falas_p))
roteiro = []  # (texto, linha, destaque)
for i, f in enumerate(falas):
    for tok in f.split():
        dest = "amarelo" if "*" in tok else "vermelho" if "!" in tok else None
        roteiro.append((tok.replace("*", "").replace("!", ""), i, dest))

m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="pt", word_timestamps=True, initial_prompt=" ".join(falas).replace("*", "").replace("!", ""))
ws = [w for s in segs for w in s.words]
hyp = [norm(w.word) for w in ws]
ref = [norm(t[0]) for t in roteiro]
sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
tempos = [None] * len(ref)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            tempos[i1 + k] = (ws[j1 + k].start, ws[j1 + k].end)
    elif tag == "replace":  # distribui o trecho proporcionalmente
        t0, t1 = ws[j1].start, ws[j2 - 1].end
        n = i2 - i1
        for k in range(n):
            tempos[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
# preenche faltantes por interpolação
for k in range(len(tempos)):
    if tempos[k] is None:
        ant = next((tempos[j][1] for j in range(k - 1, -1, -1) if tempos[j]), 0.0)
        prox = next((tempos[j][0] for j in range(k + 1, len(tempos)) if tempos[j]), dur)
        tempos[k] = (ant, max(ant + 0.05, min(prox, ant + 0.3)))

palavras = [{"w": t[0], "linha": t[1], "destaque": t[2], "inicio": round(tempos[k][0], 3), "fim": round(tempos[k][1], 3)}
            for k, t in enumerate(roteiro)]
linhas = []
for i in range(len(falas)):
    ps = [p for p in palavras if p["linha"] == i]
    linhas.append({"inicio": ps[0]["inicio"], "fim": ps[-1]["fim"]})
acerto = sm.ratio()
json.dump({"duracao": round(dur, 3), "acerto": round(acerto, 3), "linhas": linhas, "palavras": palavras},
          open(saida, "w"), ensure_ascii=False, indent=1)
print(f"{audio}: duração {dur:.1f}s, acerto {acerto:.3f}")

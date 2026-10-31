"""Gera a trilha e os efeitos sonoros do vídeo "Check-up do Remotion".

Uso: python3 scripts/gerar_trilha_checkup.py
Lê os tempos de src/checkup/timing.json e grava public/checkup/trilha.wav.
"""

import json
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
T = json.loads((RAIZ / "src/checkup/timing.json").read_text())
SR = 44100
FPS = T["fps"]
DUR = T["duration"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(11)


def seg(frame):
    return frame / FPS


def tempo(n):
    return np.arange(n) / SR


def adicionar(buf, sinal, inicio_s, ganho=1.0):
    i = int(inicio_s * SR)
    if i >= len(buf):
        return
    fim = min(len(buf), i + len(sinal))
    buf[i:fim] += sinal[: fim - i] * ganho


def nota_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def envelope(n, ataque=0.005, decaimento=0.2):
    t = tempo(n)
    return np.minimum(1, t / ataque) * np.exp(-t / decaimento)


def passa_baixa(x, alfa):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alfa * (v - acc)
        y[i] = acc
    return y


def pluck(freq, dur, brilho=3):
    n = int(dur * SR)
    t = tempo(n)
    s = sum(np.sin(2 * np.pi * freq * k * t) / k**1.6 for k in range(1, brilho + 1))
    return s * envelope(n, 0.003, 0.18)


# ---------------- Música ----------------
musica = np.zeros(N)
BPM = 120
semi = 60 / BPM
colcheia = semi / 2
# C - G - Am - F
acordes = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
padrao = [0, 1, 2, 1, 0, 2, 1, 2]
compasso = semi * 4
t = 0.0
c = 0
while t < DUR:
    acorde = acordes[c % 4]
    for k, idx in enumerate(padrao):
        adicionar(musica, pluck(nota_hz(acorde[idx] + 12), colcheia * 1.4), t + k * colcheia, 0.13)
    # pad suave
    pad_n = int(compasso * SR)
    tp = tempo(pad_n)
    pad = sum(np.sin(2 * np.pi * nota_hz(m) * tp) for m in acorde) / 3
    pad *= np.minimum(1, tp / 0.3) * np.minimum(1, (compasso - tp) / 0.3)
    adicionar(musica, pad, t, 0.07)
    # bumbo nas semínimas, chimbal nos contratempos
    for b in range(4):
        kn = int(0.25 * SR)
        f = np.geomspace(140, 45, kn)
        kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * envelope(kn, 0.002, 0.09)
        adicionar(musica, kick, t + b * semi, 0.45)
        hn = int(0.05 * SR)
        hat = rng.standard_normal(hn) * envelope(hn, 0.001, 0.012)
        adicionar(musica, hat, t + b * semi + colcheia, 0.04)
    # baixo
    for b in range(2):
        bn = int(semi * 1.8 * SR)
        baixo = np.sin(2 * np.pi * nota_hz(acorde[0] - 24) * tempo(bn)) * envelope(bn, 0.01, 0.4)
        adicionar(musica, baixo, t + b * semi * 2, 0.3)
    t += compasso
    c += 1

tt = tempo(N)
musica *= np.clip(tt / 0.5, 0, 1) * np.clip((DUR - tt) / 0.8, 0, 1)
musica = passa_baixa(musica, 0.4)

# ---------------- Efeitos ----------------
sfx = np.zeros(N)


def whoosh(dur=0.4):
    n = int(dur * SR)
    ruido = rng.standard_normal(n)
    alfas = 0.02 + 0.3 * np.sin(np.linspace(0, np.pi, n)) ** 2
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += alfas[i] * (ruido[i] - acc)
        y[i] = acc
    return y * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def boing(base=220, dur=0.7, wobble=6):
    n = int(dur * SR)
    t_ = tempo(n)
    f = base * (1 + 0.35 * np.sin(2 * np.pi * wobble * t_) * np.exp(-t_ / 0.25))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * envelope(n, 0.004, 0.22)


def ding(midi, dur=0.7):
    n = int(dur * SR)
    t_ = tempo(n)
    f = nota_hz(midi)
    s = np.sin(2 * np.pi * f * t_) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t_) + 0.15 * np.sin(2 * np.pi * f * 3 * t_)
    return s * envelope(n, 0.002, 0.22)


def tique(dur=0.03):
    n = int(dur * SR)
    return np.sin(2 * np.pi * 2200 * tempo(n)) * envelope(n, 0.001, 0.006)


# Transições entre cenas
for nome in ["mola", "contador", "grafico", "formas", "final"]:
    adicionar(sfx, whoosh(), seg(T[nome][0] - 5), 0.35)

# Letras do título
for i in range(8):
    adicionar(sfx, tique(), seg(14 + i * 3), 0.12)

# Molas
for i, (base, wob) in enumerate([(200, 5), (260, 7), (330, 9)]):
    adicionar(sfx, boing(base, 0.8 - i * 0.2, wob), seg(T["mola"][0] + 14 + i * 5), 0.3)

# Contador: tiques acelerando
ini = T["contador"][0] + 10
for k in range(26):
    adicionar(sfx, tique(), seg(ini + 52 * (k / 26) ** 0.9), 0.08)

# Barras do gráfico
for i in range(5):
    adicionar(sfx, pluck(nota_hz(72 + [0, 2, 4, 7, 9][i]), 0.3, 2), seg(T["grafico"][0] + 14 + i * 5), 0.18)

# Formas: subida
n = int(1.2 * SR)
f = np.geomspace(200, 800, n)
subida = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)) ** 2
adicionar(sfx, subida, seg(T["formas"][0] + 6), 0.08)

# Selos "OK"
for f in T["checks"]:
    adicionar(sfx, ding(84), seg(f), 0.22)
    adicionar(sfx, ding(91), seg(f) + 0.07, 0.16)

# Checklist final: notas subindo
for i, f in enumerate(T["checksFinal"]):
    adicionar(sfx, ding(79 + [0, 4, 7, 12][i], 0.5), seg(f + 4), 0.2)

# Selo final: acorde brilhante
for m in [72, 76, 79, 84]:
    adicionar(sfx, ding(m, 1.4), seg(T["selo"]), 0.12)

# ---------------- Mixagem ----------------
mix = musica + sfx
mix = np.tanh(mix * 1.1)
mix = mix / np.max(np.abs(mix)) * 0.89

saida = RAIZ / "public/checkup/trilha.wav"
saida.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(saida), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"Trilha gravada em {saida} ({DUR:.1f} s)")

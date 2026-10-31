"""Gera a trilha (chiptune suave) e os efeitos sonoros do vídeo do Minecraft.

Uso: python3 scripts/gerar_trilha.py
Lê os tempos de src/minecraft/timing.json e grava public/minecraft/trilha.wav.
"""

import json
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
T = json.loads((RAIZ / "src/minecraft/timing.json").read_text())
SR = 44100
FPS = T["fps"]
DUR = T["duration"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(7)


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


def triangulo(freq, dur):
    t = tempo(int(dur * SR))
    return 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1


def envelope(n, ataque=0.005, decaimento=0.2):
    t = tempo(n)
    env = np.minimum(1, t / ataque) * np.exp(-t / decaimento)
    return env


def passa_baixa(x, alfa):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alfa * (v - acc)
        y[i] = acc
    return y


# ---------------- Música ----------------
musica = np.zeros(N)
BPM = 120
oitava = 60 / BPM / 2  # colcheia
# Am - F - C - G
acordes = [
    [57, 60, 64],
    [53, 57, 60],
    [48, 52, 55],
    [55, 59, 62],
]
padrao = [0, 1, 2, 3, 2, 1, 0, 2]  # índices (3 = oitava acima da fundamental)
compasso = oitava * 8
t = 0.0
c = 0
while t < DUR:
    acorde = acordes[c % 4]
    for k, idx in enumerate(padrao):
        nota = acorde[0] + 12 if idx == 3 else acorde[idx]
        n_dur = oitava * 0.95
        s = triangulo(nota_hz(nota + 12), n_dur) * envelope(int(n_dur * SR), decaimento=0.16)
        adicionar(musica, s, t + k * oitava, 0.16)
    # baixo nas semínimas
    for b in range(4):
        bd = oitava * 1.6
        s = np.sin(2 * np.pi * nota_hz(acorde[0] - 12) * tempo(int(bd * SR))) * envelope(int(bd * SR), 0.01, 0.25)
        adicionar(musica, s, t + b * oitava * 2, 0.32)
    # chimbal suave nos contratempos
    for h in range(4):
        hd = 0.05
        s = rng.standard_normal(int(hd * SR)) * envelope(int(hd * SR), 0.001, 0.012)
        adicionar(musica, s, t + (h * 2 + 1) * oitava, 0.035)
    t += compasso
    c += 1

# Silêncio dramático antes da revelação e volta depois
env_m = np.ones(N)
tt = tempo(N)
corte_ini, corte_fim = seg(T["reveal"][0] - 22), seg(T["reveal"][0])
env_m[(tt >= corte_ini) & (tt < corte_fim)] = np.linspace(1, 0.0, np.sum((tt >= corte_ini) & (tt < corte_fim)))
volta = (tt >= corte_fim) & (tt < corte_fim + 0.6)
env_m[volta] = np.linspace(0.0, 1, np.sum(volta))
# entrada e saída
env_m *= np.clip(tt / 0.4, 0, 1)
env_m *= np.clip((DUR - tt) / 1.2, 0, 1)
musica *= env_m
musica = passa_baixa(musica, 0.35)

# ---------------- Efeitos ----------------
sfx = np.zeros(N)


def whoosh(dur=0.45):
    n = int(dur * SR)
    ruido = rng.standard_normal(n)
    # filtro que abre e fecha
    alfas = 0.02 + 0.25 * np.sin(np.linspace(0, np.pi, n)) ** 2
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += alfas[i] * (ruido[i] - acc)
        y[i] = acc
    return y * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def pop(freq_ini=600, freq_fim=180, dur=0.12):
    n = int(dur * SR)
    f = np.linspace(freq_ini, freq_fim, n)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(fase) * envelope(n, 0.002, dur / 3)


def blip(freq, dur=0.09):
    n = int(dur * SR)
    sq = np.sign(np.sin(2 * np.pi * freq * tempo(n)))
    return passa_baixa(sq, 0.3) * envelope(n, 0.002, 0.05)


def subida(dur):
    n = int(dur * SR)
    f = np.geomspace(120, 900, n)
    fase = 2 * np.pi * np.cumsum(f) / SR
    tri = 2 * np.abs(2 * ((fase / (2 * np.pi)) % 1) - 1) - 1
    env = np.linspace(0, 1, n) ** 2
    return passa_baixa(tri, 0.25) * env


def boom(dur=1.4):
    n = int(dur * SR)
    f = np.geomspace(110, 38, n)
    fase = 2 * np.pi * np.cumsum(f) / SR
    grave = np.sin(fase) * envelope(n, 0.003, 0.45)
    ruido = passa_baixa(rng.standard_normal(n), 0.08) * envelope(n, 0.001, 0.12) * 3
    return np.tanh((grave + ruido) * 1.6)


def sino(dur=0.9):
    n = int(dur * SR)
    t_ = tempo(n)
    s = sum(np.sin(2 * np.pi * nota_hz(m) * t_) / (k + 1) for k, m in enumerate([84, 88, 91]))
    return s * envelope(n, 0.003, 0.3)


# Gancho: digitação
for k in range(11):
    adicionar(sfx, blip(1200 + (k % 3) * 120, 0.04), seg(4 + k * 2.2), 0.08)
adicionar(sfx, whoosh(0.4), seg(T["hook"][0] + 30), 0.35)

# Transições
for f in [T["build"][0], T["swap"][0], T["result"][0], T["outro"][0]]:
    adicionar(sfx, whoosh(0.45), seg(f - 6), 0.4)

# Peças caindo
for f in T["partDrops"]:
    adicionar(sfx, pop(260, 70, 0.16), seg(f + 8), 0.55)
adicionar(sfx, pop(900, 500, 0.08), seg(T["facePop"]), 0.3)

# Troca dos valores
adicionar(sfx, blip(660), seg(T["swapAt"]), 0.25)
adicionar(sfx, blip(990), seg(T["swapAt"] + 6), 0.25)

# Transformação
adicionar(sfx, subida(seg(T["morph"][1] - T["morph"][0])), seg(T["morph"][0]), 0.22)

# Revelação
adicionar(sfx, boom(), seg(T["reveal"][0]), 0.9)

# CTA
adicionar(sfx, sino(), seg(T["ctaAt"]), 0.25)

# ---------------- Mixagem ----------------
mix = musica + sfx
mix = np.tanh(mix * 1.1) * 0.9
pico = np.max(np.abs(mix))
mix = mix / pico * 0.89

saida = RAIZ / "public/minecraft/trilha.wav"
saida.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(saida), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"OK: {saida} ({DUR:.1f}s)")

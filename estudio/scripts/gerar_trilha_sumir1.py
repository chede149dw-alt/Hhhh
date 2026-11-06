"""Trilha e efeitos sonoros sintetizados (originais) para a Parte 1, sincronizados com timing.json."""
import json, sys, wave
import numpy as np

SR = 44100
T = json.load(open("src/episodios/sumir1/timing.json"))
L = T["linhas"]
dur = T["duracao"] + 1.3
n = int(dur * SR)
rng = np.random.default_rng(7)
musica = np.zeros(n)
sfx = np.zeros(n)

def add(buf, t, sig, g=1.0):
    i = int(t * SR)
    j = min(n, i + len(sig))
    if i < n:
        buf[i:j] += sig[: j - i] * g

def env(N, a=0.01, r=0.2):
    e = np.ones(N)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e

def ruido_filtrado(N, f0, f1):
    x = rng.standard_normal(N)
    out = np.zeros(N); y = 0
    fs = np.linspace(f0, f1, N)
    a = 1 - np.exp(-2 * np.pi * fs / SR)
    for k in range(N):
        y += a[k] * (x[k] - y); out[k] = y
    return out / (np.abs(out).max() + 1e-9)

def sugar(d=0.6):  # som de sucção: ruído que fecha + tom descendo + estalo
    N = int(d * SR); t = np.arange(N) / SR
    r = ruido_filtrado(N, 4000, 300) * np.linspace(0.2, 1, N) ** 2
    tom = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 120, N)) / SR) * 0.4
    s = (r * 0.7 + tom) * env(N, 0.02, 0.05)
    pop = np.sin(2 * np.pi * 180 * t[: int(0.08 * SR)]) * np.exp(-t[: int(0.08 * SR)] * 60)
    return np.concatenate([s, pop])

def soltar(d=0.5):
    return sugar(d)[::-1] * 0.9

def whoosh(d=0.4):
    N = int(d * SR)
    return ruido_filtrado(N, 300, 2500) * np.sin(np.linspace(0, np.pi, N)) ** 2

def impacto(f=55, d=1.2):
    N = int(d * SR); t = np.arange(N) / SR
    return (np.sin(2 * np.pi * f * t * (1 - t * 0.3)) * np.exp(-t * 3) + ruido_filtrado(N, 2000, 80) * np.exp(-t * 8) * 0.6)

def alarme(d):
    N = int(d * SR); t = np.arange(N) / SR
    sq = np.sign(np.sin(2 * np.pi * 2200 * t)) * (np.sin(2 * np.pi * 7 * t) > 0)
    return sq * 0.25 * env(N, 0.005, 0.02)

def brilho(d=1.2):
    N = int(d * SR); t = np.arange(N) / SR
    s = sum(np.sin(2 * np.pi * f * t) for f in (1320, 1980, 2640)) / 3
    return s * np.exp(-t * 2) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t))

def drone(d):
    N = int(d * SR); t = np.arange(N) / SR
    s = np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + np.sin(t)) + 0.3 * ruido_filtrado(N, 200, 200)
    return s * env(N, 0.8, 0.8)

ini = lambda i: L[i]["inicio"]
fim = lambda i: L[i + 1]["inicio"] if i + 1 < len(L) else T["duracao"]
meio = lambda i, p: ini(i) + (fim(i) - ini(i)) * p

# ---- música: pad em Lá menor com pulso suave, corta na virada (fala 20) ----
acordes = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7), (164.8, 207.7, 246.9)]
corte = ini(20) - 0.15
t = np.arange(int(corte * SR)) / SR
pad = np.zeros_like(t)
for k, ac in enumerate(acordes * 20):
    t0 = k * 2.0
    if t0 > corte: break
    m = (t >= t0) & (t < t0 + 2.2)
    tt = t[m] - t0
    e = np.minimum(1, tt / 0.3) * np.minimum(1, (2.2 - tt) / 0.4)
    pad[m] += e * sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) for f in ac) / 3
pulso = (np.sin(2 * np.pi * 2.0 * t) > 0.6) * np.sin(2 * np.pi * 110 * t) * np.exp(-((t * 2) % 1) * 12)
musica[: len(t)] = pad * 0.5 + pulso * 0.35
# baixa a música na parte "dimensão"
for i in (13, 14):
    a, b = int(ini(i) * SR), int(fim(i) * SR)
    musica[a:b] *= 0.35

# ---- efeitos ----
add(sfx, ini(1) + 0.2, alarme(fim(2) - ini(1) + 0.3), 0.5)
add(sfx, ini(2) + 0.5, whoosh(0.35), 0.8)
add(sfx, ini(3) - 0.05, impacto(140, 0.3), 0.6)
add(sfx, ini(3), sugar(0.55), 0.9)
add(sfx, ini(5), brilho(1.5), 0.35)
add(sfx, meio(6, 0.4), sugar(0.6), 0.8)
for k in range(5):
    add(sfx, meio(7, 0.25 + k * 0.11), sugar(0.35), 0.5)
N8 = int((fim(8) - ini(8)) * SR)
add(sfx, ini(8), ruido_filtrado(N8, 500, 900) * env(N8, 0.3, 0.4), 0.35)
add(sfx, meio(9, 0.3), impacto(300, 0.25), 0.5)
add(sfx, meio(11, 0.4), sugar(0.7), 0.8)
add(sfx, ini(12), soltar(0.45), 0.8)
add(sfx, ini(13), drone(fim(14) - ini(13)), 0.45)
add(sfx, ini(17), brilho(2.0), 0.35)
N19 = int((fim(19) - ini(19)) * SR)
add(sfx, ini(19), ruido_filtrado(N19, 60, 200) * np.linspace(0, 1, N19), 0.5)
add(sfx, meio(20, 0.27), impacto(48, 1.6), 1.0)
add(sfx, ini(21), impacto(40, 2.0), 0.8)
add(sfx, ini(21), drone(fim(21) - ini(21) + 1), 0.4)

mix = musica / (np.abs(musica).max() + 1e-9) * 0.16 + sfx / (np.abs(sfx).max() + 1e-9) * 0.55
mix = np.clip(mix, -1, 1)
for saida in sys.argv[1:]:
    with wave.open(saida, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("trilha ok", round(dur, 1), "s")

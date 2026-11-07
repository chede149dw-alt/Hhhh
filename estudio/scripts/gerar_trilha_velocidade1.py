"""Trilha e efeitos sintetizados (originais) da Parte 1 da série de velocidade, sincronizados com timing.json."""
import json, sys, wave
import numpy as np

SR = 44100
T = json.load(open("src/episodios/velocidade1/timing.json"))
L = T["linhas"]
dur = T["duracao"] + 1.3
n = int(dur * SR)
rng = np.random.default_rng(11)
musica = np.zeros(n); sfx = np.zeros(n)

def add(buf, t, sig, g=1.0):
    i = int(t * SR); j = min(n, i + len(sig))
    if 0 <= i < n: buf[i:j] += sig[: j - i] * g

def env(N, a=0.01, r=0.2):
    e = np.ones(N); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

def ruido(N, f0, f1):
    x = rng.standard_normal(N); out = np.zeros(N); y = 0
    a = 1 - np.exp(-2 * np.pi * np.linspace(f0, f1, N) / SR)
    for k in range(N):
        y += a[k] * (x[k] - y); out[k] = y
    return out / (np.abs(out).max() + 1e-9)

def whoosh(d=0.35, f0=300, f1=3000):
    N = int(d * SR); return ruido(N, f0, f1) * np.sin(np.linspace(0, np.pi, N)) ** 2

def sugar(d=0.6):
    N = int(d * SR); t = np.arange(N) / SR
    r = ruido(N, 4000, 300) * np.linspace(0.2, 1, N) ** 2
    tom = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 120, N)) / SR) * 0.4
    return (r * 0.7 + tom) * env(N, 0.02, 0.05)

def impacto(f=55, d=1.2):
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * f * t * (1 - t * 0.3)) * np.exp(-t * 3) + ruido(N, 2000, 80) * np.exp(-t * 8) * 0.6

def alarme(d):
    N = int(d * SR); t = np.arange(N) / SR
    return np.sign(np.sin(2 * np.pi * 2200 * t)) * (np.sin(2 * np.pi * 7 * t) > 0) * 0.25 * env(N, 0.005, 0.02)

def chiado(d):
    N = int(d * SR); return ruido(N, 6000, 4000) * env(N, 0.05, 0.3) * (0.6 + 0.4 * rng.random(N))

def ronco(d=1.2):
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * (70 + 30 * np.sin(2 * np.pi * 3 * t)) * t) * env(N, 0.1, 0.3)

def brilho(d=1.5):
    N = int(d * SR); t = np.arange(N) / SR
    return sum(np.sin(2 * np.pi * f * t) for f in (1320, 1980, 2640)) / 3 * np.exp(-t * 1.5)

def drone(d):
    N = int(d * SR); t = np.arange(N) / SR
    return (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t + np.sin(t))) * env(N, 0.6, 0.8)

ini = lambda i: L[i]["inicio"]
fim = lambda i: L[i + 1]["inicio"] if i + 1 < len(L) else T["duracao"]
meio = lambda i, p: ini(i) + (fim(i) - ini(i)) * p

# música animada (Mi menor, pulso mais rápido); some no "mundo parado" e corta no buraco roxo
corte = ini(13) - 0.1
t = np.arange(int(corte * SR)) / SR
acordes = [(164.8, 196.0, 246.9), (130.8, 164.8, 196.0), (146.8, 185.0, 220.0), (123.5, 155.6, 185.0)]
pad = np.zeros_like(t)
for k, ac in enumerate(acordes * 30):
    t0 = k * 1.6
    if t0 > corte: break
    m = (t >= t0) & (t < t0 + 1.8); tt = t[m] - t0
    e = np.minimum(1, tt / 0.15) * np.minimum(1, (1.8 - tt) / 0.3)
    pad[m] += e * sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) for f in ac) / 3
batida = np.sin(2 * np.pi * 90 * t) * np.exp(-((t * 2.5) % 1) * 14) + 0.3 * ruido(len(t), 7000, 7000) * np.exp(-((t * 5) % 1) * 30)
musica[: len(t)] = pad * 0.45 + batida * 0.4
for i in (10, 11, 12):
    a, b = int(ini(i) * SR), int(fim(i) * SR); musica[a:b] *= 0.15

add(sfx, ini(1), alarme(fim(1) - ini(1)), 0.5)
add(sfx, meio(2, 0.4), whoosh(0.3), 0.9)
for k in range(3): add(sfx, meio(3, 0.05 + k * 0.25), whoosh(0.25, 500, 4000), 0.8)
add(sfx, ini(4), chiado(fim(5) - ini(4)), 0.35)
add(sfx, ini(6) + 0.3, ronco(1.0), 0.6)
for k in range(6): add(sfx, meio(6, 0.1 + k * 0.12), whoosh(0.15, 800, 3000), 0.4)
add(sfx, ini(9), whoosh(fim(9) - ini(9), 200, 1500), 0.7)
add(sfx, ini(10), brilho(2.0), 0.3)
add(sfx, meio(11, 0.55), brilho(0.8), 0.3)
add(sfx, ini(12), whoosh(0.4), 0.7)
add(sfx, ini(13), drone(fim(14) - ini(13)), 0.5)
add(sfx, ini(14), sugar(fim(14) - ini(14)), 0.5)
add(sfx, ini(15), whoosh(0.5, 200, 3000), 1.0)
add(sfx, ini(15) + 0.2, impacto(120, 0.4), 0.6)
add(sfx, ini(16), impacto(200, 0.3), 0.9)
add(sfx, ini(16), sugar(0.4)[::-1], 0.6)
add(sfx, ini(19), drone(fim(21) - ini(19) + 1), 0.45)
add(sfx, ini(20) + 0.6, impacto(48, 1.6), 1.0)
add(sfx, ini(21), impacto(40, 2.0), 0.8)

mix = musica / (np.abs(musica).max() + 1e-9) * 0.16 + sfx / (np.abs(sfx).max() + 1e-9) * 0.55
mix = np.clip(mix, -1, 1)
for saida in sys.argv[1:]:
    with wave.open(saida, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("trilha ok", round(dur, 1), "s")

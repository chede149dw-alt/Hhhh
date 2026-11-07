"""Trilha e efeitos sintetizados (originais) da Parte 3 (vigiados), sincronizados com timing.json."""
import json, sys, wave
import numpy as np

SR = 44100
T = json.load(open("src/episodios/vigiados3/timing.json"))
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

def vidro(d=0.8):
    N = int(d * SR); t = np.arange(N) / SR
    s = np.zeros(N)
    for k in range(40):
        i0 = int(rng.random() * N * 0.7); L2 = int(0.03 * SR)
        f = 3000 + rng.random() * 5000
        tt = np.arange(min(L2, N - i0)) / SR
        s[i0:i0 + len(tt)] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 120) * rng.random()
    return s + ruido(N, 8000, 3000) * np.exp(-t * 6) * 0.5

def bip(d=0.12, f=1800):
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * f * t) * env(N, 0.005, 0.03)

def radio(d):
    N = int(d * SR); t = np.arange(N) / SR
    return ruido(N, 3000, 2500) * (0.5 + 0.5 * (np.sin(2 * np.pi * 9 * t) > 0)) * env(N, 0.02, 0.1)

# suspense em Ré menor, pulso lento; corta no "moram"
corte = ini(23) + 0.6
t = np.arange(int(corte * SR)) / SR
acordes = [(146.8, 174.6, 220.0), (116.5, 146.8, 174.6), (130.8, 164.8, 196.0), (110.0, 138.6, 164.8)]
pad = np.zeros_like(t)
for k, ac in enumerate(acordes * 30):
    t0 = k * 2.4
    if t0 > corte: break
    m = (t >= t0) & (t < t0 + 2.6); tt = t[m] - t0
    e = np.minimum(1, tt / 0.4) * np.minimum(1, (2.6 - tt) / 0.5)
    pad[m] += e * sum(np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) for f in ac) / 3
pulso = np.sin(2 * np.pi * 60 * t) * np.exp(-((t * 1.25) % 1) * 10) + 0.25 * ruido(len(t), 6000, 6000) * np.exp(-((t * 2.5) % 1) * 40)
musica[: len(t)] = pad * 0.5 + pulso * 0.35
for i in (4, 14, 15, 16, 17, 18):
    a, b = int(ini(i) * SR), int(fim(i) * SR); musica[a:b] *= 0.4
for i in (6, 7):
    a, b = int(ini(i) * SR), int(fim(i) * SR); musica[a:b] *= 0.6

for k in range(5): add(sfx, meio(1, 0.2 + k * 0.15), bip(0.08, 1500), 0.35)
add(sfx, ini(2), bip(0.25, 1200), 0.5)
add(sfx, meio(3, 0.3), whoosh(0.4, 300, 3000), 0.6)
add(sfx, meio(3, 0.7), impacto(150, 0.3), 0.4)
add(sfx, ini(4), brilho(1.2), 0.2)
add(sfx, meio(5, 0.1), whoosh(0.5, 400, 5000), 1.0)
add(sfx, ini(6), whoosh(fim(6) - ini(6), 200, 2000), 0.6)
add(sfx, meio(6, 0.45), impacto(45, 1.6), 1.0)
add(sfx, ini(7), vidro(1.0), 0.9)
add(sfx, ini(7) + 0.25, vidro(0.8), 0.7)
add(sfx, ini(7) + 0.4, alarme(fim(7) - ini(7)), 0.25)
add(sfx, ini(8), whoosh(0.3), 0.6)
add(sfx, meio(9, 0.45), brilho(1.5), 0.4)
add(sfx, ini(10), whoosh(0.35), 0.8)
add(sfx, ini(11), bip(0.05, 2500), 0.4)
add(sfx, meio(12, 0.1), whoosh(0.2, 1000, 4000), 0.4)
add(sfx, meio(12, 0.3), impacto(70, 1.0), 0.6)
add(sfx, ini(13), brilho(0.8), 0.25)
add(sfx, meio(14, 0.1), sugar(0.8), 0.5)
def coracao(d):
    N = int(d * SR); t = np.arange(N) / SR; out = np.zeros(N)
    for b0 in np.arange(0, d, 0.8):
        for off, g in ((0, 1.0), (0.18, 0.7)):
            i0 = int((b0 + off) * SR); L2 = min(int(0.15 * SR), N - i0)
            if L2 <= 0: continue
            tt = np.arange(L2) / SR
            out[i0:i0 + L2] += np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 30) * g
    return out
add(sfx, ini(15), coracao(fim(18) - ini(15)), 0.9)
add(sfx, ini(16), drone(fim(17) - ini(16)), 0.5)
add(sfx, ini(16), sugar(1.0), 0.5)
add(sfx, ini(17), chiado(fim(17) - ini(17)), 0.25)
add(sfx, ini(18), chiado(fim(18) - ini(18)), 0.3)
add(sfx, meio(18, 0.5), impacto(60, 1.2), 1.0)
add(sfx, meio(19, 0.35), sugar(0.4), 0.6)
add(sfx, meio(19, 0.5), impacto(200, 0.3), 0.9)
add(sfx, meio(20, 0.3), brilho(0.6)[::-1], 0.3)
add(sfx, ini(22), radio(fim(23) - ini(22)), 0.35)
add(sfx, ini(23) + 0.6, impacto(48, 1.6), 1.0)
add(sfx, ini(23), ronco(fim(23) - ini(23)), 0.4)
add(sfx, ini(24), impacto(40, 2.0), 0.8)
add(sfx, ini(24), drone(fim(24) - ini(24) + 1), 0.4)
mix = musica / (np.abs(musica).max() + 1e-9) * 0.16 + sfx / (np.abs(sfx).max() + 1e-9) * 0.55
mix = np.clip(mix, -1, 1)
for saida in sys.argv[1:]:
    with wave.open(saida, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("trilha ok", round(dur, 1), "s")

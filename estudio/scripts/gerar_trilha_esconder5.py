"""Trilha e efeitos sintetizados (originais) da Parte 5 (esconder), sincronizados com timing.json."""
import json, sys, wave
import numpy as np

SR = 44100
T = json.load(open("src/episodios/esconder5/timing.json"))
L = T["linhas"]
dur = T["duracao"] + 1.3
n = int(dur * SR)
rng = np.random.default_rng(55)
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


def coracao(d):
    N = int(d * SR); out = np.zeros(N)
    for b0 in np.arange(0, d, 0.8):
        for off, g in ((0, 1.0), (0.18, 0.7)):
            i0 = int((b0 + off) * SR); L2 = min(int(0.15 * SR), N - i0)
            if L2 <= 0: continue
            tt = np.arange(L2) / SR
            out[i0:i0 + L2] += np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 30) * g
    return out

def vento(d, f0=200, f1=900):
    N = int(d * SR); t = np.arange(N) / SR
    return ruido(N, f0, f1) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * env(N, 0.4, 0.6)

def chiclete(d=0.25):  # "pop" de pedra/impacto leve
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * 180 * t * (1 - t * 2)) * np.exp(-t * 25)

def bloco(t0, t1, acordes, bpm, brilho_=0.0, baixo=True, bateria=True, g=1.0):
    """Música original em blocos (pad + baixo + bateria sintetizada)."""
    a, b = int(t0 * SR), int(min(t1, dur) * SR)
    t = np.arange(b - a) / SR
    beat = 60 / bpm
    pad = np.zeros_like(t); bx = np.zeros_like(t)
    for k in range(int(len(t) / SR / (beat * 4)) + 1):
        ac = acordes[k % len(acordes)]; c0 = k * beat * 4
        m = (t >= c0) & (t < c0 + beat * 4 + 0.2); tt = t[m] - c0
        e = np.minimum(1, tt / 0.15) * np.minimum(1, (beat * 4 + 0.2 - tt) / 0.3)
        pad[m] += e * sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt + 0.5) for f in ac) / 3
        if baixo:
            for q in range(4):
                mm = (t >= c0 + q * beat) & (t < c0 + q * beat + beat * 0.9); t2 = t[mm] - c0 - q * beat
                bx[mm] += np.sin(2 * np.pi * ac[0] / 2 * t2) * np.exp(-t2 * 4)
    bt = np.zeros_like(t)
    if bateria:
        ph = (t / beat) % 1; ph2 = (t / (beat / 2)) % 1
        bt += np.sin(2 * np.pi * 55 * t) * np.exp(-ph * 14) * ((np.floor(t / beat) % 2) == 0)
        bt += ruido(len(t), 1800, 1800) * np.exp(-ph * 20) * ((np.floor(t / beat) % 2) == 1) * 0.5
        bt += ruido(len(t), 8000, 8000) * np.exp(-ph2 * 50) * 0.18
    arp = np.zeros_like(t)
    if brilho_ > 0:
        for k in range(int(len(t) / SR / (beat / 2))):
            ac = acordes[int(k * beat / 2 / (beat * 4)) % len(acordes)]
            f = ac[k % 3] * 2; i0 = int(k * beat / 2 * SR); L2 = min(int(beat / 2 * SR), len(t) - i0)
            tt = np.arange(L2) / SR
            arp[i0:i0 + L2] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9)
    x = pad * 0.45 + bx * 0.45 + bt * 0.45 + arp * 0.25 * brilho_
    fade = np.minimum(1, np.minimum(t / 0.5, (t[-1] - t + 1e-3) / 0.6))
    musica[a:b] += x * fade * g

DO = [(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)]
RE_m = [(146.8, 174.6, 220.0), (116.5, 146.8, 174.6), (130.8, 164.8, 196.0), (110.0, 138.6, 164.8)]
EPICO = [(146.8, 220.0, 293.7), (116.5, 174.6, 233.1), (174.6, 220.0, 261.6), (130.8, 196.0, 261.6)]


def clique(d=0.05):  # clique seco (ecolocalização de algo no escuro)
    N = int(d * SR); t = np.arange(N) / SR
    return (ruido(N, 5000, 2500) * np.exp(-t * 160) + np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 220)) * 0.9

def miado(d=0.7):
    N = int(d * SR); t = np.arange(N) / SR
    f = 520 + 380 * np.sin(np.pi * t / d) - 120 * (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return s * env(N, 0.05, 0.25) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t))

def porta_carro(d=0.35):
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * 95 * t) * np.exp(-t * 18) + ruido(N, 1500, 300) * np.exp(-t * 25) * 0.6

def farol(d=0.25):  # "tunc" de farol acendendo
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30) + ruido(N, 4000, 2000) * np.exp(-t * 60) * 0.3

def vibra(d=1.5):  # celular vibrando
    N = int(d * SR); t = np.arange(N) / SR
    return np.sin(2 * np.pi * 170 * t) * ((t % 0.5) < 0.3) * 0.8 * env(N, 0.01, 0.05)

# tensão (agentes) → silêncio na queda → frio/escuro (drone) → alívio do gato → volta (dia, estranho) → final (suspense)
bloco(0, ini(8), RE_m, 92, brilho_=0.5)
bloco(ini(8), ini(10), EPICO, 112, brilho_=0.8)
bloco(ini(13), ini(17), DO, 84, bateria=False, g=0.6)
bloco(ini(17), ini(19), RE_m, 70, bateria=False, brilho_=0.6, g=0.8)
bloco(ini(19), dur, RE_m, 66, bateria=False, g=0.9)
add(sfx, ini(10), drone(fim(12) - ini(10)), 0.55)
add(sfx, ini(13), drone(fim(13) - ini(13)), 0.35)

add(sfx, meio(1, 0.25), farol(), 1.0)
add(sfx, meio(1, 0.33), farol(), 0.7)
add(sfx, ini(1), ronco(fim(1) - ini(1)), 0.25)
for k in range(5): add(sfx, meio(2, 0.08 + k * 0.15), whoosh(0.5, 200, 1400), 0.5)
for k in range(6): add(sfx, meio(3, 0.05 + k * 0.07), porta_carro(), 0.55)
add(sfx, meio(3, 0.55), brilho(1.0), 0.35)
add(sfx, ini(4), coracao(fim(6) - ini(4)), 0.55)
add(sfx, meio(5, 0.1), drone(fim(5) - ini(5)), 0.5)
add(sfx, meio(6, 0.55), bip(0.15, 900), 0.6)
add(sfx, meio(6, 0.7), bip(0.15, 900), 0.6)
add(sfx, meio(7, 0.3), brilho(1.0), 0.5)
add(sfx, meio(8, 0.05), sugar(0.9), 1.0)
add(sfx, ini(9), whoosh(1.2, 3000, 150), 0.9)
add(sfx, meio(9, 0.62), sugar(0.5)[::-1], 0.8)
add(sfx, meio(9, 0.78), impacto(45, 1.4), 1.0)
add(sfx, ini(10), vento(fim(10) - ini(10), 60, 300), 0.35)
for k in range(4): add(sfx, meio(11, 0.2 + k * 0.08), clique(), 0.5)
add(sfx, meio(11, 0.6), chiclete(0.2), 0.4)
add(sfx, meio(12, 0.6), miado(0.8), 0.9)
add(sfx, meio(13, 0.4), sugar(0.8), 0.7)
add(sfx, meio(13, 0.42), brilho(1.4), 0.5)
add(sfx, ini(14), vento(fim(14) - ini(14), 400, 1500), 0.25)
add(sfx, meio(15, 0.05), vibra(1.6), 0.8)
for k in range(8): add(sfx, meio(16, 0.15 + k * 0.06), bip(0.06, 2400), 0.3)
for k in range(7): add(sfx, meio(17, 0.12 + k * 0.11), whoosh(0.25, 800, 2600), 0.35)
add(sfx, meio(18, 0.3), miado(0.5), 0.7)
add(sfx, meio(19, 0.1), whoosh(0.4, 600, 2000), 0.4)
add(sfx, meio(19, 0.75), impacto(50, 1.4), 0.7)
add(sfx, ini(20), drone(fim(20) - ini(20) + 1), 0.6)
add(sfx, meio(20, 0.38), impacto(46, 1.8), 1.0)
mix = musica / (np.abs(musica).max() + 1e-9) * 0.17 + sfx / (np.abs(sfx).max() + 1e-9) * 0.5
mix = np.clip(mix, -1, 1)
for saida in sys.argv[1:]:
    with wave.open(saida, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("trilha ok", round(dur, 1), "s")

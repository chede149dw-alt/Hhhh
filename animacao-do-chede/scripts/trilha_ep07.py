"""Trilha original da Parte Final (A FENDA), sintetizada e sincronizada com os planos do roteiro.

Uso: python3 scripts/trilha_ep07.py roteiros/chede/ep07.json audio/chede/ep07/trilha.mp3
Seções (tom de Ré menor):
  abertura (golpe) · ato 1 tensão (drone + pulso) · ato 2 mistério (pads + arpejo; trajes = subida esperançosa)
  ato 3 batalha (tambores + ostinato + acordes; pancada no soco; quase silêncio na dor) · ato 4 épico e choro
  (coro + piano triste) · fuga (pulso + subida) · explosão (pancada e SILÊNCIO) · escuro · hospital (piano)
  · gancho (subida misteriosa) · tema final.
O volume é baixo de propósito: o motor ainda abaixa a trilha embaixo da voz (sidechain).
"""
import json, sys, wave
import numpy as np

SR = 44100
rot = json.load(open(sys.argv[1]))
ini, fim = {}, {}
t = 0.0
for p in rot["planos"]:
    d = p.get("duracao", 2.0); ini[p["id"]] = t; fim[p["id"]] = t + d; t += d
TOTAL = t + 1.0
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
mus = np.zeros((N, 2))

def nota(n):  # n = semitons a partir do Lá 440
    return 440.0 * 2 ** (n / 12)
D2, F2, A2, C3, D3, E3, F3, G3, A3, Bb2, Bb3, C4, D4, E4, F4, G4, A4, Bb4, C5, D5 = (
    -31, -28, -24, -21, -19, -17, -16, -14, -12, -23, -11, -9, -7, -5, -4, -2, 0, 1, 3, 5)

def add(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0: return
    a = max(0, -i); j = min(N, i + len(sig))
    s = sig[a:j - i] * g
    mus[i + a:j, 0] += s * np.sqrt(0.5 * (1 - pan)); mus[i + a:j, 1] += s * np.sqrt(0.5 * (1 + pan))

def env(n, a, r, sus=1.0):
    e = np.full(n, sus); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, sus, na); e[-nr:] = np.linspace(e[-nr], 0, nr); return e

def lp(x, fc):  # passa-baixa de 1 polo (fc pode variar no tempo)
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); v = 0.0
    for k in range(len(x)):
        v += a[k] * (x[k] - v); y[k] = v
    return y

def lp_rapido(x, fc):  # passa-baixa fixo (filtro de média exponencial por FFT)
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), n)

def saw(f, d, det=0.0):
    tt = np.arange(int(d * SR)) / SR
    return 2 * ((tt * f * (1 + det)) % 1) - 1

def pad(notas, d, brilho=1200, a=1.2, r=1.5, g=0.12):
    n = int(d * SR); s = np.zeros(n)
    for m in notas:
        for det in (-0.006, 0.0, 0.007):
            s += saw(nota(m), d, det)
    s = lp_rapido(s / (3 * len(notas)), brilho)
    return s * env(n, a, r) * g

def coro(notas, d, g=0.1):  # "aah": senoides com vibrato e formantes suaves
    n = int(d * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for m in notas:
        f = nota(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt + m))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s += np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph) + 0.12 * np.sin(5 * ph)
    return s / len(notas) * env(n, 0.9, 1.2) * g

def piano(m, d=2.5, g=0.22):
    n = int(d * SR); tt = np.arange(n) / SR; f = nota(m)
    s = sum((0.9 / (k ** 1.4)) * np.sin(2 * np.pi * f * k * tt * (1 + 0.0004 * k * k)) * np.exp(-tt * (1.6 + 0.9 * k)) for k in range(1, 7))
    return s * env(n, 0.004, 0.3) * g

def sino(m, d=3.0, g=0.08):
    n = int(d * SR); tt = np.arange(n) / SR; f = nota(m)
    return sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * k) for r, a, k in ((1, 1, 1.2), (2.76, 0.5, 2.2), (5.4, 0.25, 3.5))) * g

def baixo(m, d, g=0.25):
    n = int(d * SR); tt = np.arange(n) / SR; f = nota(m)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * lp_rapido(saw(f, d), 400)
    return s * env(n, 0.01, 0.12) * g

def tambor(g=0.6, f0=90, f1=42, d=0.9):  # taiko/bumbo grave
    n = int(d * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 18); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-tt * 5) + 0.35 * lp_rapido(rng.standard_normal(n), 900) * np.exp(-tt * 25)
    return s * g

def caixa(g=0.25, d=0.35):
    n = int(d * SR); tt = np.arange(n) / SR
    return (lp_rapido(rng.standard_normal(n), 5000) * np.exp(-tt * 18) + 0.4 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 22)) * g

def corda(m, d, g=0.07):  # ostinato de cordas (serra curta filtrada)
    n = int(d * SR); return lp_rapido(saw(nota(m), d) + saw(nota(m), d, 0.004), 2200) * env(n, 0.01, d * 0.5) * g

def subida(d, g=0.25):  # riser de ruído
    n = int(d * SR); x = rng.standard_normal(n); fc = np.geomspace(300, 9000, n)
    return lp(x, fc) * np.linspace(0, 1, n) ** 2 * g

def pancada(g=0.9, d=3.5):  # golpe cinematográfico
    n = int(d * SR); tt = np.arange(n) / SR
    f = 30 + 70 * np.exp(-tt * 9); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.4)
    s += 0.5 * lp_rapido(rng.standard_normal(n), 1800) * np.exp(-tt * 3)
    return s * g * 0.45

def drone(m, d, g=0.12):
    n = int(d * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * nota(m) * tt) + 0.6 * np.sin(2 * np.pi * nota(m + 7) * tt + np.sin(tt * 0.3)) + 0.3 * lp_rapido(saw(nota(m - 12), d), 220)
    return s * env(n, 1.5, 1.5) * g

def entre(a, b):
    return ini[a], fim[b]

def pulso(t0, t1, notas, bpm, g=0.22):
    passo = 60 / bpm / 2; k = 0; t = t0
    while t < t1 - 0.05:
        add(t, baixo(notas[(k // 8) % len(notas)], passo * 0.9), g); t += passo; k += 1

# ---------------- abertura ----------------
add(ini["capa"], pancada(0.8)); add(ini["capa"], pad([D3, A3, D4], fim["capa"] - ini["capa"] + 1.5, 900, 0.2, 1.4, 0.10))

# ---------------- ato 1: tensão (apagando → fugir) ----------------
a0, a1 = entre("apagando", "moeda")
add(a0, drone(D2, a1 - a0 + 1, 0.10))
pulso(ini["dezmetros"], a1, [D2, D2, Bb2 - 12 + 12, C3 - 12 + 12], 96, 0.18)
for k, m in enumerate([A4, F4, D5, A4, G4, F4]):
    add(a0 + 0.5 + k * 3.1, sino(m, 3.0, 0.05), pan=(-0.4 if k % 2 else 0.4))
for b in np.arange(ini["kaikcorre"], fim["tapa"], 60 / 96):
    add(b, tambor(0.25, 80, 45, 0.6))
add(ini["tapa"] + 0.515 * (fim["tapa"] - ini["tapa"]), pancada(0.5, 2.0))
f0, f1 = entre("fugir", "fugir")
for b in np.arange(f0, f1, 60 / 132 / 2): add(b, tambor(0.3, 100, 50, 0.4))
add(f0, pad([D3, F3, A3], f1 - f0 + 1, 1600, 0.05, 0.8, 0.10)); add(f0 - 1.2, subida(1.2, 0.15))

# ---------------- ato 2: mistério (beco → medo) ----------------
b0, b1 = entre("beco", "aceitam")
seq = [[D3, F3, A3], [Bb2 + 12, D3 + 12 - 12, F3], [G3 - 12, Bb2 + 12, D3], [A2 + 12, C4 - 12, E3]]
dur = (b1 - b0) / 4
for k, ac in enumerate(seq):
    add(b0 + k * dur, pad(ac, dur + 1.2, 1000, 1.0, 1.2, 0.09))
for k, t in enumerate(np.arange(b0, b1, 0.42)):
    add(t, sino([D4, F4, A4, E4, D4, A3][k % 6], 1.2, 0.035), pan=0.3 * np.sin(k))
add(ini["anel"] + 0.55 * (fim["anel"] - ini["anel"]), sino(A4 + 12, 3.0, 0.08))  # anel dourado
g0, g1 = entre("galpao", "medo")  # trajes: subida esperançosa (Ré maior emprestado)
dur = (g1 - g0) / 3
for k, ac in enumerate([[D3, F3 + 1, A3], [G3 - 12, G3 - 8, D3], [A2 + 12 - 12 + 12, C4 - 12 + 1, E3]]):
    add(g0 + k * dur, pad(ac, dur + 1.0, 1800, 0.6, 1.0, 0.10)); add(g0 + k * dur, coro([ac[0] + 12], dur + 1.0, 0.05))
for k, t in enumerate(np.arange(g0, g1, 0.3)):
    add(t, piano([D4, F4 + 1, A4, D5][k % 4], 1.0, 0.06))

# ---------------- ato 3: batalha (quinze → juntas) ----------------
q0 = ini["quinze"]; s0 = ini["soco"]; sd = fim["soco"] - s0; imp = s0 + 0.55 * sd
acordes = [[D3, F3, A3], [Bb2 + 12 - 12, D3, F3], [F3 - 12, A2 + 12, C4 - 12], [C3, E3, G3]]
blk = 2.5
t = q0; k = 0
while t < imp - 0.2:
    ac = acordes[k % 4]; d = min(blk, imp - t)
    add(t, pad(ac, d + 0.6, 1800, 0.05, 0.5, 0.11)); add(t, baixo(ac[0] - 12, d, 0.22))
    for j, tt in enumerate(np.arange(t, t + d, blk / 8)):
        add(tt, corda(ac[j % 3] + 12, blk / 8 * 0.8, 0.06), pan=0.5 * (-1) ** j)
    for j, tt in enumerate(np.arange(t, t + d, blk / 4)):
        add(tt, tambor(0.42 if j % 2 == 0 else 0.3));
        if j % 2: add(tt, caixa(0.18))
    t += blk; k += 1
add(imp - 1.6, subida(1.6, 0.3))
add(imp, pancada(1.0, 4.0)); add(imp, coro([D4, A4, D5], 3.0, 0.08))
# dor: quase silêncio, só um drone agudo (raio-X)
add(ini["braco"], drone(D4, fim["osso"] - ini["braco"], 0.05))
c0, c1 = entre("caiu", "juntas")
add(c0, pad([D3, F3, A3], c1 - c0 + 1, 700, 1.5, 1.0, 0.08))
for b in np.arange(ini["porta"], c1, 60 / 90): add(b, tambor(0.18, 70, 40, 0.5))
add(c1 - 2.0, subida(2.0, 0.25))

# ---------------- ato 4: épico + sacrifício ----------------
v0, v1 = entre("vinte", "borda")
for k, ac in enumerate([[D3, A3, D4, F4], [Bb2 + 12 - 12 + 0, D3, F3, Bb3], [C3, G3, C4, E4], [A2 + 12 - 12, E3, A3, C4 + 1]]):
    d = (v1 - v0) / 4; add(v0 + k * d, pad(ac, d + 1.0, 2200, 0.1, 0.8, 0.13)); add(v0 + k * d, coro(ac[1:], d + 1.0, 0.07))
for j, tt in enumerate(np.arange(v0, v1, 60 / 100)):
    add(tt, tambor(0.45 if j % 4 == 0 else 0.3)); add(tt + 30 / 100, caixa(0.12))
add(v0, pancada(0.6, 2.5))
# a mão / choro: piano triste sobre cordas (Ré menor: i – VI – iv – V)
e0, e1 = entre("dentro", "solta")
prog = [[D3, F3, A3], [Bb2 + 12 - 12, D3, F3], [G3 - 12, Bb2 + 12 - 12, D3], [A2 + 12 - 12, C4 - 12 + 1, E3]]
mel = [A4, G4, F4, E4, D4, F4, E4, C4 + 1, D4, A3 + 12, Bb4, A4, G4, F4, E4, D4]
dur = (e1 - e0) / 4
for k, ac in enumerate(prog):
    add(e0 + k * dur, pad(ac, dur + 1.5, 1300, 0.8, 1.2, 0.10)); add(e0 + k * dur, baixo(ac[0] - 12, dur, 0.12))
for k, tt in enumerate(np.arange(e0 + 0.4, e1, dur / 4)):
    add(tt, piano(mel[k % len(mel)], 2.6, 0.2), pan=0.15)
add(ini["solta"] + 0.45 * (fim["solta"] - ini["solta"]), coro([D4, F4, A4, D5], 3.5, 0.10))
add(ini["pulou"], pancada(0.6, 3.0))
# fuga com a Lia: pulso acelerando e subida até a explosão
p0, p1 = ini["pegalia"], ini["explodiu"] + 0.3 * (fim["explodiu"] - ini["explodiu"])
tt = p0; bpm = 110
while tt < p1:
    add(tt, tambor(0.35, 95, 45, 0.5)); add(tt, baixo(D2 + 12, 0.18, 0.18)); tt += 60 / bpm / 2; bpm = min(170, bpm + 1.2)
add(p0, pad([D3, F3, A3, C4], p1 - p0, 2600, 0.5, 0.05, 0.10))
add(p1 - 2.5, subida(2.5, 0.35))
add(p1, pancada(1.0, 4.5))
# depois: silêncio (só um resto de drone que some)
add(ini["fechou"] + 0.6, drone(D2, 2.5, 0.04))
# escuro lá dentro
d0, d1 = entre("semforca", "desmaiou")
add(d0, drone(D2 - 1, d1 - d0 + 0.5, 0.09)); add(d0, pad([D3, F3, Bb2 + 12 - 12 + 0], d1 - d0, 600, 1.5, 1.0, 0.07))

# ---------------- hospital: piano ----------------
h0, h1 = entre("coma", "naomorreu")
prog = [[D3, F3, A3], [Bb2 + 12 - 12, D3, F3], [F3 - 12, A2 + 12 - 12, C3], [C3, E3, G3]]
mel = [F4, E4, D4, A4, G4, F4, E4, C4, D4, F4, A4, G4, F4, E4, D4, D4]
dur = (h1 - h0) / 4
for k, ac in enumerate(prog):
    add(h0 + k * dur, pad(ac, dur + 1.2, 900, 1.0, 1.2, 0.06))
    for j, m in enumerate(ac + [ac[1] + 12]):
        add(h0 + k * dur + j * dur / 4, piano(m, 2.2, 0.08))
for k, tt in enumerate(np.arange(h0 + 0.2, h1, dur / 4)):
    add(tt, piano(mel[k % len(mel)] + 12, 2.4, 0.12), pan=-0.1)
# gancho: luz roxa
l0, l1 = entre("luz", "luz")
add(l0, drone(D3, l1 - l0 + 0.5, 0.08)); add(l0 + 0.3 * (l1 - l0) - 1.2, subida(1.2, 0.2)); add(l0 + 0.3 * (l1 - l0), sino(D5 + 12, 3.0, 0.10))
add(l0 + 0.55 * (l1 - l0), coro([D4, G4 - 1 + 1, A4], 2.5, 0.06))

# ---------------- tema final ----------------
z0, z1 = entre("parte", "parte")
add(z0, pancada(0.6, 3.0))
for k, ac in enumerate([[D3, A3, D4, F4], [Bb2 + 12 - 12, F3, Bb3, D4], [C3, G3, C4, E4], [D3, A3, D4, F4 + 1]]):
    d = (z1 - z0 + 1) / 4; add(z0 + k * d, pad(ac, d + 1.0, 2000, 0.1, 0.8, 0.12)); add(z0 + k * d, coro(ac[1:3], d + 1.0, 0.07))
for j, tt in enumerate(np.arange(z0, z1, 60 / 100)): add(tt, tambor(0.35 if j % 2 == 0 else 0.22))

# ---------------- reverb + saída ----------------
def reverb(x, dec=2.2, mix=0.28):
    n = int(dec * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / dec)
    ir = lp_rapido(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n; F = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    return x * (1 - mix) + y * mix * 0.6
out = np.stack([reverb(mus[:, 0]), reverb(mus[:, 1])], 1)
out /= max(1e-9, np.abs(out).max()); out *= 0.8
bruto = sys.argv[2].rsplit(".", 1)[0] + "-bruto.wav"
with wave.open(bruto, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
# compressão leve + volume final de fundo (-20 LUFS): as partes calmas aparecem e as pancadas não estouram
import subprocess
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", bruto, "-af",
                "acompressor=threshold=0.08:ratio=3:attack=15:release=300:makeup=2,loudnorm=I=-20:TP=-3:LRA=9", "-ar", "48000", sys.argv[2]], check=True)
print(f"trilha {TOTAL:.1f}s -> {sys.argv[2]}")

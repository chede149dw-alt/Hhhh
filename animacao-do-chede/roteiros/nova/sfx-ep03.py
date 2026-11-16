# Efeitos sonoros novos da VALDOR · Parte 3, sintetizados por código (metal, impacto de tijolos, trovão, dreno de vida, alerta).
# Escreve em audio/nova/sfx/*.wav. Uso: python3 roteiros/nova/sfx-ep03.py [raiz]
import sys, wave, numpy as np
from scipy.signal import butter, lfilter
SR = 48000; raiz = sys.argv[1] if len(sys.argv) > 1 else '.'
rng = np.random.default_rng(3)
t_ = lambda d: np.arange(int(d * SR)) / SR
def lp(x, fc): b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc): b, a = butter(2, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, f1, f2): b, a = butter(2, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return lfilter(b, a, x)
def salva(nome, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    with wave.open(f'{raiz}/audio/nova/sfx/{nome}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def soma(buf, x, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i]
# metal: lâmina contra lâmina (parciais inarmônicos + estalo + raspada)
d = 1.6; t = t_(d); x = np.zeros(len(t))
for f, a, k in [(612, 1, 2.4), (1517, .7, 3.1), (2489, .55, 3.8), (3620, .4, 4.6), (5130, .3, 6), (7020, .2, 8)]:
    x += a * np.sin(2 * np.pi * f * t * (1 + 0.002 * np.sin(2 * np.pi * 5 * t))) * np.exp(-t * k)
n = int(0.03 * SR); x[:n] += hp(rng.normal(0, 1, n), 3000) * np.exp(-t_(0.03) * 120) * 2.5
r = int(0.35 * SR); soma(x, bp(rng.normal(0, 1, r), 2500, 7000) * np.exp(-t_(0.35) * 9) * 0.5, 0.02)
salva('metal', x)
# impacto: corpo batendo no muro, tijolos caindo
d = 1.8; x = np.zeros(int(d * SR)); t = t_(0.6)
fr = 38 + 90 * np.exp(-t * 14); x[:len(t)] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 6) * 1.2
n = int(0.5 * SR); soma(x, lp(rng.normal(0, 1, n), 1800) * np.exp(-t_(0.5) * 8) * 0.9, 0)
for k in range(22):
    t0 = 0.08 + rng.uniform(0, 1.3) ** 1.4; dd = 0.07; f = rng.uniform(500, 1600)
    clk = bp(rng.normal(0, 1, int(dd * SR)), f * 0.7, f * 1.4) * np.exp(-t_(dd) * 60) * rng.uniform(0.2, 0.6) * (1 - t0 / 1.6)
    soma(x, clk, t0)
salva('impacto', x)
# trovão: estalo seco + ronco grave
d = 2.6; x = np.zeros(int(d * SR))
n = int(0.12 * SR); soma(x, hp(rng.normal(0, 1, n), 1500) * np.exp(-t_(0.12) * 30) * 1.5, 0)
rr = lp(rng.normal(0, 1, len(x)), 160) * np.exp(-t_(d) * 1.6) * 4
rr *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.1 * t_(d))); x += rr
z = int(0.5 * SR); soma(x, bp(rng.normal(0, 1, z), 3000, 9000) * (rng.random(z) > 0.93) * np.exp(-t_(0.5) * 6) * 0.8, 0.02)
salva('trovao', x)
# dreno de vida: sopro sugando (cresce e corta) + grave descendo
d = 1.7; t = t_(d); e = (t / d) ** 2.2 * np.exp(-np.maximum(0, t - d * 0.85) * 30)
ru = rng.normal(0, 1, len(t)); x = bp(ru, 300, 2400) * e * 0.8
x += np.sin(2 * np.pi * np.cumsum(220 - 150 * t / d) / SR) * e * 0.5
x += np.sin(2 * np.pi * np.cumsum(660 + 300 * np.sin(2 * np.pi * 1.5 * t)) / SR) * e * 0.15
salva('dreno', x)
# alerta: recompensa anunciada para todos (duas notas + zumbido grave)
d = 2.2; x = np.zeros(int(d * SR))
for t0, f in [(0, 988), (0.22, 740), (0.6, 988), (0.82, 740)]:
    tt = t_(0.5); soma(x, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7) * 0.6, t0)
tt = t_(d); x += np.sin(2 * np.pi * 55 * tt) * np.minimum(1, tt * 3) * np.exp(-tt * 0.8) * 0.5
salva('alerta', x)
print('ok')

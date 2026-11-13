# Trilha sonora original da VALDOR · Parte 1, sintetizada por código (sem samples externos).
# Lê audio/nova/ep01/secoes.json ([id, início, duração] de cada plano) e escreve audio/nova/ep01/trilha.wav.
# Climas por plano: mistério (quarto), ciência (raio-X), magia (visor), aventura (campo), batalha, suspense e final.
import json, sys, numpy as np, wave
from scipy.signal import butter, lfilter
SR = 48000
raiz = sys.argv[1] if len(sys.argv) > 1 else '.'
sec = json.load(open(f'{raiz}/audio/nova/ep01/secoes.json'))
TOTAL = sec[-1][1] + sec[-1][2] + 1.0
CLIMA = {}
for i in ['capa', 'saldo', 'comprar', 'mae', 'itens', 'precos', 'raro', 'teo', 'novatos']: CLIMA[i] = 'misterio'
for i in ['ouvido', 'pulso', 'cerebro', 'xp']: CLIMA[i] = 'ciencia'
CLIMA['visor'] = 'magia'
for i in ['raca', 'fera', 'classe', 'guardiao', 'nivel', 'explorar', 'drop', 'nivel2']: CLIMA[i] = 'aventura'
for i in ['gosma', 'bote', 'mordida', 'golpe']: CLIMA[i] = 'batalha'
for i in ['forte', 'adaga', 'aluguel', 'trinta']: CLIMA[i] = 'suspense'
CLIMA['parte'] = 'final'
rng = np.random.default_rng(7)
nota = lambda n: 440.0 * 2 ** ((n - 69) / 12)  # MIDI → Hz
def lp(x, fc, o=2): b, a = butter(o, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def env(n, a=0.01, r=0.2):
    e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def t_(d): return np.arange(int(d * SR)) / SR
def saw(f, d, det=0.0):
    t = t_(d); return sum(np.sin(2 * np.pi * f * (1 + det) * k * t) / k for k in range(1, 9))
def pad(ns, d, fc=1400, vol=0.12):
    x = sum(saw(nota(n), d, det) for n in ns for det in (-0.003, 0.003))
    return lp(x, fc) * env(len(x), 0.6, 0.8) * vol / len(ns)
def pluck(n, d=0.8, vol=0.2, brilho=3.0):
    t = t_(d); f = nota(n)
    x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (brilho + k * 2.5)) / k for k in range(1, 6))
    return x * env(len(x), 0.003, 0.05) * vol
def sino(n, d=1.6, vol=0.12):
    t = t_(d); f = nota(n)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)
    return x * vol
def baixo(n, d, vol=0.25):
    t = t_(d); f = nota(n); x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)
    return x * env(len(x), 0.01, min(0.3, d / 2)) * vol
def bumbo(vol=0.6, f0=120, f1=42, d=0.45):
    t = t_(d); fr = f1 + (f0 - f1) * np.exp(-t * 18); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * np.exp(-t * 7) * vol
def taiko(vol=0.7):
    x = bumbo(vol, 95, 38, 0.7); n = int(0.08 * SR)
    x[:n] += lp(rng.normal(0, 1, n), 900) * np.exp(-t_(0.08) * 40) * vol * 0.4
    return x
def chimbal(vol=0.08, d=0.05): x = hp(rng.normal(0, 1, int(d * SR)), 6000); return x * np.exp(-t_(d) * 60) * vol
def caixa(vol=0.25): d = 0.22; n = int(d * SR); x = hp(rng.normal(0, 1, n), 1200) * np.exp(-t_(d) * 18); return (x + bumbo(0.3, 220, 160, d)[:n]) * vol
def soma(buf, x, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if i < len(buf) and j > i: buf[i:j] += x[:j - i]
# acordes (MIDI) por clima
CH = {
  'misterio': ([[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]], 84),
  'ciencia': ([[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], 90),
  'aventura': ([[50, 54, 57], [45, 49, 52], [47, 50, 54], [43, 47, 50]], 104),
  'batalha': ([[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]], 132),
  'suspense': ([[50, 53, 57], [49, 53, 56], [50, 53, 57], [46, 49, 53]], 70),
}
def secao(clima, d, t_abs):
    buf = np.zeros(int((d + 2.5) * SR))
    if clima == 'magia':
        n = int(d * SR); x = lp(rng.normal(0, 1, n), 4000) * np.linspace(0, 1, n) ** 2 * 0.12
        soma(buf, x, 0)
        for k in range(int(d / 0.09)): soma(buf, sino(74 + [0, 4, 7, 12, 16][k % 5], 0.7, 0.05 + 0.06 * k * 0.09 / d), k * 0.09)
        return buf
    if clima == 'final':
        soma(buf, pad([50, 54, 57, 62], d + 1.5, 2200, 0.16), 0)
        for k, n in enumerate([62, 66, 69, 74, 78]): soma(buf, sino(n, 2.0, 0.08), 0.15 * k)
        soma(buf, bumbo(0.5), 0); return buf
    acordes, bpm = CH[clima]; beat = 60 / bpm; barra = beat * 4
    nb = int(np.ceil(d / barra)) + 1
    for b in range(nb):
        tb = b * barra; ac = acordes[(b + int(t_abs / barra)) % 4]
        if clima in ('misterio', 'ciencia', 'suspense', 'aventura'): soma(buf, pad(ac, barra + 0.8, 1100 if clima != 'aventura' else 1800, 0.10), tb)
        if clima == 'misterio':
            for k in range(8): soma(buf, pluck(ac[k % 3] + 12 + (12 if k % 4 == 3 else 0), 0.9, 0.06), tb + k * beat / 2)
            soma(buf, baixo(ac[0] - 12, barra, 0.12), tb)
        if clima == 'ciencia':
            for k in [0, 3, 5, 6]: soma(buf, sino(ac[k % 3] + 24, 1.4, 0.05), tb + k * beat / 2)
        if clima == 'aventura':
            for k in range(8): soma(buf, pluck(ac[[0, 1, 2, 1][k % 4]] + 12 + (12 if k in (3, 7) else 0), 0.6, 0.08, 4), tb + k * beat / 2)
            for k in range(4): soma(buf, baixo(ac[0] - 12, beat * 0.9, 0.16), tb + k * beat)
            for k in (0, 2): soma(buf, bumbo(0.35), tb + k * beat)
            for k in range(8): soma(buf, chimbal(0.05), tb + k * beat / 2)
        if clima == 'batalha':
            intens = min(1.0, 0.6 + 0.4 * tb / max(d, 0.1))
            for k in range(16): soma(buf, pluck(ac[0] - 12 + (12 if k % 4 == 2 else 0) + (3 if k % 8 == 7 else 0), 0.25, 0.13 * intens, 6), tb + k * beat / 4)
            for k in (0, 1.5, 2, 3.5): soma(buf, taiko(0.55 * intens), tb + k * beat)
            for k in (1, 3): soma(buf, caixa(0.22 * intens), tb + k * beat)
            for k in range(8): soma(buf, chimbal(0.06), tb + k * beat / 2)
            soma(buf, pad(ac, barra + 0.5, 900, 0.08), tb)
        if clima == 'suspense':
            for k in (0, 0.35): soma(buf, bumbo(0.45, 70, 35, 0.5), tb + k * beat * 2)
            soma(buf, bumbo(0.35, 70, 35, 0.5), tb + 2 * beat); soma(buf, bumbo(0.25, 70, 35, 0.5), tb + 2.35 * beat)
            t = t_(barra); trem = np.sin(2 * np.pi * nota(74) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) * 0.03
            soma(buf, trem * env(len(trem), 0.3, 0.3), tb)
            soma(buf, baixo(ac[0] - 24, barra, 0.18), tb)
    return buf
# junta os planos de mesmo clima em seções e cruza 0,4 s entre elas
out = np.zeros(int(TOTAL * SR) + SR * 3)
grupos = []
for pid, ini, dur in sec:
    c = CLIMA.get(pid, 'aventura')
    if grupos and grupos[-1][0] == c: grupos[-1][2] = ini + dur
    else: grupos.append([c, ini, ini + dur])
for c, a, b in grupos:
    d = b - a; x = secao(c, d + 0.4, a)
    x = x[:int((d + 0.8) * SR)]
    rms = np.sqrt(np.mean(x[: int(d * SR)] ** 2)) + 1e-9
    x = x * (0.08 / rms)
    fade = int(0.4 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    soma(out, x, max(0, a - 0.2))
out = out[: int(TOTAL * SR)]
out = out / (np.max(np.abs(out)) + 1e-9) * 0.7
with wave.open(f'{raiz}/audio/nova/ep01/trilha.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('trilha', round(TOTAL, 2), 's,', [g[0] for g in grupos])

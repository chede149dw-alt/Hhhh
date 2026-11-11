"""Sons de efeito e trilhas sintetizados em Python (prompt 8) — nada de arquivos de terceiros (sem problema de licença).

Uso: python3 motor/audio/sfx.py [pasta]   (padrão: audio/sfx)
Gera WAV 48 kHz mono, determinísticos (mesma semente = mesmo som):
  impacto, impacto_terra, tremor, terra_sobe, arremesso, whoosh, passo, pulo, aterrissa, golpe, susto, senta,
  suspiro, brilho, clarao, vento  +  trilhas: trilha_tensa, trilha_leve
"""
import os, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000


def ruido(n, semente):
    return np.random.default_rng(semente).standard_normal(n)


def env(n, ataque=0.005, queda=0.3, forma=4.0):
    t = np.arange(n) / SR
    a = np.clip(t / max(ataque, 1e-4), 0, 1)
    return a * np.exp(-forma * np.maximum(t - ataque, 0) / max(queda, 1e-4))


def filtro(x, tipo, f, ordem=4):
    sos = signal.butter(ordem, f, btype=tipo, fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def tom(n, f0, f1=None, semente=0):
    f1 = f0 if f1 is None else f1
    fase = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    return np.sin(fase)


def norm(x, pico=0.89):
    m = np.max(np.abs(x)) or 1
    return (x / m * pico).astype(np.float32)


def s(seg):
    return int(seg * SR)


def impacto(semente=1, grave=48):
    n = s(1.2)
    batida = tom(n, grave * 2.2, grave * 0.8) * env(n, 0.002, 0.25, 3)
    estalo = filtro(ruido(n, semente), 'bandpass', [400, 4000]) * env(n, 0.001, 0.06, 5)
    corpo = filtro(ruido(n, semente + 1), 'lowpass', 300) * env(n, 0.004, 0.5, 3) * 1.4
    return norm(batida * 1.1 + estalo * 0.7 + corpo)


def impacto_terra():
    n = s(2.2)
    base = np.zeros(n); b = impacto(3, 42); base[:len(b)] += b
    # cascalho caindo: estalinhos aleatórios
    rng = np.random.default_rng(7)
    for _ in range(70):
        i = int(rng.uniform(0.05, 1.6) * SR); m = s(0.03)
        if i + m < n:
            base[i:i + m] += filtro(ruido(m, int(rng.integers(1e6))), 'bandpass', [1500, 6000]) * env(m, 0.0005, 0.01, 6) * rng.uniform(0.1, 0.35)
    base += filtro(ruido(n, 9), 'lowpass', 120) * env(n, 0.05, 1.4, 2) * 0.8
    return norm(base)


def tremor(dur=2.0):
    n = s(dur); t = np.arange(n) / SR
    r = filtro(ruido(n, 11), 'lowpass', 90, 6) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
    r += filtro(ruido(n, 12), 'bandpass', [150, 600]) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t))
    fade = np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.5)
    return norm(r * fade)


def terra_sobe():
    n = s(1.4); t = np.arange(n) / SR
    rumor = filtro(ruido(n, 21), 'lowpass', 200) * np.minimum(1, t / 0.9)
    areia = filtro(ruido(n, 22), 'bandpass', [800, 5000]) * (0.2 + 0.5 * t / 1.4) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    sobe = tom(n, 60, 140) * np.minimum(1, t / 1.2) * 0.4
    return norm((rumor + areia * 0.6 + sobe) * np.minimum(1, (1.4 - t) / 0.15))


def whoosh(dur=0.6, f0=300, f1=2500, semente=31):
    n = s(dur); t = np.arange(n) / SR
    x = ruido(n, semente); y = np.zeros(n); bloco = 512
    for i in range(0, n, bloco):                      # filtro passa-banda que varre de f0 a f1 (e volta)
        k = i / n; fc = f0 + (f1 - f0) * np.sin(np.pi * k)
        seg = x[i:i + bloco]; y[i:i + bloco] = filtro(seg, 'bandpass', [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], 2)
    return norm(y * np.sin(np.pi * t / dur) ** 2)


def passo(semente=41):
    n = s(0.25)
    return norm(filtro(ruido(n, semente), 'bandpass', [120, 1800]) * env(n, 0.002, 0.04, 5) + tom(n, 90, 60) * env(n, 0.002, 0.05, 5) * 0.6, 0.6)


def golpe():
    n = s(0.5); a = np.zeros(n); w = whoosh(0.18, 600, 3000, 51); a[:len(w)] += w * 0.6
    b = impacto(52, 70)[:n - s(0.12)]; a[s(0.12):s(0.12) + len(b)] += b
    return norm(a)


def susto():
    n = s(1.0); t = np.arange(n) / SR
    acorde = sum(tom(n, f) for f in (466, 494, 523)) * env(n, 0.005, 0.5, 3)
    return norm(acorde * 0.5 + filtro(ruido(n, 61), 'highpass', 3000) * env(n, 0.002, 0.15, 4) * 0.3)


def suspiro():
    n = s(1.3); t = np.arange(n) / SR
    return norm(filtro(ruido(n, 71), 'bandpass', [300, 2500]) * np.sin(np.pi * t / 1.3) ** 2, 0.4)


def brilho():
    n = s(1.2); t = np.arange(n) / SR
    return norm(sum(tom(n, f) * env(n, 0.005, 0.8, 3) * np.exp(-i * 0.3) for i, f in enumerate((880, 1320, 1760, 2640))) * (1 + 0.1 * np.sin(2 * np.pi * 6 * t)), 0.5)


def clarao():
    n = s(1.0)
    return norm(filtro(ruido(n, 81), 'highpass', 2000) * env(n, 0.01, 0.6, 3) + brilho()[:n] * 0.6)


def vento(dur=4.0):
    n = s(dur); t = np.arange(n) / SR
    x = filtro(ruido(n, 91), 'bandpass', [200, 1200]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t))
    return norm(x * np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8), 0.5)


def trilha(estilo='tensa', dur=24.0):
    """Base musical simples: tensa = drone grave + pulso; leve = acordes suaves em arpejo."""
    n = s(dur); t = np.arange(n) / SR; y = np.zeros(n)
    if estilo == 'tensa':
        for f, a in ((55, 0.5), (82.4, 0.3), (110, 0.2)):
            y += np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.1 * t)) * a
        pulso = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 2.0 * t)) * np.exp(-((t * 2.0) % 1) * 6)
        y = y * (0.6 + 0.4 * pulso) + filtro(ruido(n, 101), 'lowpass', 400) * 0.08
        bpm = 120
        for k in range(int(dur * bpm / 60)):                # bumbo a cada batida
            i = int(k * 60 / bpm * SR); m = s(0.3)
            if i + m < n: y[i:i + m] += tom(m, 120, 45) * env(m, 0.002, 0.12, 4) * 0.8
    else:
        acordes = [(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)]
        passo_s = 0.25
        for k in range(int(dur / passo_s)):
            ac = acordes[(k // 8) % 4]; f = ac[k % 3] * (2 if k % 6 >= 3 else 1)
            i = int(k * passo_s * SR); m = s(0.9)
            if i + m < n: y[i:i + m] += tom(m, f) * env(m, 0.01, 0.6, 3) * 0.25
        for k in range(int(dur / 2)):
            ac = acordes[k % 4]; i = int(k * 2 * SR); m = s(2.0)
            if i + m <= n: y[i:i + m] += sum(np.sin(2 * np.pi * f / 2 * np.arange(m) / SR) for f in ac) * np.sin(np.pi * np.arange(m) / m) * 0.12
    fade = np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.5)
    return norm(y * fade, 0.7)


SONS = {
    'impacto': impacto, 'impacto_terra': impacto_terra, 'tremor': tremor, 'terra_sobe': terra_sobe,
    'arremesso': lambda: whoosh(0.5, 250, 2200, 33), 'whoosh': whoosh, 'passo': passo, 'pulo': lambda: whoosh(0.35, 400, 1800, 35),
    'aterrissa': lambda: impacto(5, 60), 'golpe': golpe, 'susto': susto, 'senta': lambda: impacto(6, 80) * 0.5, 'suspiro': suspiro,
    'brilho': brilho, 'yes': brilho, 'clarao': clarao, 'vento': vento,
    'trilha_tensa': lambda: trilha('tensa'), 'trilha_leve': lambda: trilha('leve'),
}


def gerar(pasta='audio/sfx'):
    os.makedirs(pasta, exist_ok=True)
    for nome, f in SONS.items():
        wavfile.write(os.path.join(pasta, nome + '.wav'), SR, (np.clip(f(), -1, 1) * 32767).astype(np.int16))
    return sorted(SONS)


if __name__ == '__main__':
    nomes = gerar(sys.argv[1] if len(sys.argv) > 1 else 'audio/sfx')
    print('Sons gerados:', ', '.join(nomes))

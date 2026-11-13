#!/usr/bin/env python3
"""Efeitos sonoros sintetizados (numpy/scipy), sem arquivos de terceiros. Determinísticos (semente fixa).
Uso: python3 audio/sfx.py [pasta_saida]   → <nome>.wav (48 kHz, mono, float→16 bits)"""
import os, sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(1234)

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def filt(x, tipo, f, ordem=4):
    sos = butter(ordem, f, btype=tipo, fs=SR, output='sos'); return sosfilt(sos, x)
def ruido(d): return rng.standard_normal(int(SR * d))
def norm(x, pico=0.9): m = np.max(np.abs(x)) or 1; return x / m * pico
def reverb(x, dur=0.8, mix=0.25, brilho=3000):
    ir = filt(ruido(dur), 'low', brilho) * np.exp(-t_(dur) / (dur / 5)); ir /= np.sqrt(np.sum(ir ** 2))
    w = np.convolve(x, ir)[: len(x) + int(SR * dur)]
    seco = np.pad(x, (0, len(w) - len(x)))
    return seco * (1 - mix) + w * mix

def zumbido_geladeira():
    t = t_(10.0)
    x = 0.5 * np.sin(2 * np.pi * 60 * t) + 0.35 * np.sin(2 * np.pi * 120 * t) + 0.12 * np.sin(2 * np.pi * 180 * t)
    x *= 1 + 0.08 * np.sin(2 * np.pi * 0.3 * t)
    x += 0.05 * filt(ruido(10.0), 'band', [200, 2000])
    return norm(x, 0.5)

def drone():
    t = t_(12.0)
    x = sum(np.sin(2 * np.pi * f * t + p) for f, p in [(55, 0), (55.3, 1), (82.4, 2), (110.6, 0.5)])
    x += 0.4 * filt(ruido(12.0), 'band', [60, 400])
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * t / 12)       # ciclo exato de 12 s (laço sem emenda)
    return norm(filt(x, 'low', 600), 0.6)

def passo(k=0):
    d = 0.22; n = int(SR * d)
    x = filt(ruido(d), 'low', 380 + 60 * k) * env(n, 0.002, 0.045)
    x += 0.4 * filt(ruido(d), 'band', [1500, 4000]) * env(n, 0.001, 0.012)    # raspar do sapato
    return norm(reverb(x, 0.4, 0.15), 0.8)

def tensao():
    d = 2.6; t = t_(d); k = t / d
    f = 180 + 700 * k ** 2
    x = 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * k ** 1.5
    x += filt(ruido(d), 'band', [400, 3500]) * k ** 2
    x[-int(SR * 0.03):] *= np.linspace(1, 0, int(SR * 0.03))
    return norm(reverb(x, 1.0, 0.3), 0.85)

def alerta():
    d = 3.2; t = t_(d)
    sel = (np.floor(t / 0.22) % 2).astype(bool)
    f = np.where(sel, 1100, 880)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.35 + 0.65 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = filt(x, 'low', 5000) * (0.5 + 0.5 * (np.sin(2 * np.pi * t / 0.44) > -0.9))
    vib = 0.6 * np.sin(2 * np.pi * 150 * t) * ((t % 0.8) < 0.45)               # vibração do aparelho
    x = 0.8 * x + filt(vib, 'low', 300)
    x *= np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.1)
    return norm(x, 0.8)

def batida():
    d = 3.0; t = t_(d)
    f = 30 + 32 * np.exp(-t / 0.15)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    x += 0.7 * filt(ruido(d), 'low', 900) * np.exp(-t / 0.06)
    return norm(reverb(x, 2.0, 0.35, 1500), 0.95)

def grade_impacto():
    d = 1.8; t = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in
            [(233, 1, 0.5), (418, 0.8, 0.35), (693, 0.6, 0.25), (1151, 0.45, 0.18), (1836, 0.3, 0.12), (2790, 0.2, 0.07)])
    x += 1.2 * filt(ruido(d), 'band', [800, 6000]) * np.exp(-t / 0.02)
    chacoalho = filt(ruido(d), 'band', [2000, 7000]) * np.exp(-t / 0.25) * (np.sin(2 * np.pi * 23 * t) > 0.6)
    return norm(reverb(x + 0.3 * chacoalho, 0.9, 0.2), 0.9)

def estalo_pescoco():
    x = np.zeros(int(SR * 0.4))
    for k, (ini, g) in enumerate([(0.0, 1), (0.07, 0.7), (0.16, 0.9)]):
        n = int(SR * 0.012); i = int(SR * ini)
        x[i:i + n] += g * filt(rng.standard_normal(n), 'high', 1200) * np.exp(-np.arange(n) / (SR * 0.002))
    return norm(reverb(x, 0.3, 0.12), 0.85)

def porta_geladeira():
    d = 0.8; t = t_(d); n = len(t)
    x = filt(ruido(d), 'low', 250) * env(n, 0.003, 0.05)
    x += 0.5 * filt(ruido(d), 'band', [300, 1200]) * np.exp(-((t - 0.12) / 0.06) ** 2)   # borracha descolando
    x += 0.15 * np.sin(2 * np.pi * 120 * t) * np.minimum(1, t / 0.2)
    return norm(reverb(x, 0.4, 0.15), 0.7)

def lata():
    d = 0.5; t = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in [(2450, 1, 0.08), (4100, 0.6, 0.05), (5600, 0.3, 0.03)])
    x += 0.4 * filt(ruido(d), 'high', 3000) * np.exp(-t / 0.01)
    return norm(x, 0.6)

def chave_cadeado():
    x = np.zeros(int(SR * 0.9))
    for ini in [0.0, 0.25, 0.42]:
        i = int(SR * ini); n = int(SR * 0.08); tt = np.arange(n) / SR
        x[i:i + n] += sum(np.sin(2 * np.pi * f * tt) for f in (3100, 4700, 6200)) * np.exp(-tt / 0.012)
    return norm(reverb(x, 0.3, 0.1), 0.6)

def rua_ambiente():
    d = 12.0; t = t_(d)
    vento = filt(ruido(d), 'band', [80, 700]) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 6))
    grilos = filt(ruido(d), 'band', [4200, 4800]) * (np.sin(2 * np.pi * 28 * t) > 0.7) * (np.sin(2 * np.pi * t / 3) > 0)
    return norm(vento + 0.15 * grilos, 0.5)

SONS = dict(zumbido_geladeira=zumbido_geladeira, drone=drone, tensao=tensao, alerta=alerta, batida=batida, grade_impacto=grade_impacto,
            estalo_pescoco=estalo_pescoco, porta_geladeira=porta_geladeira, lata=lata, chave_cadeado=chave_cadeado, rua_ambiente=rua_ambiente,
            passo=passo)

def gerar(pasta):
    os.makedirs(pasta, exist_ok=True)
    for nome, f in SONS.items():
        if nome == 'passo':
            for k in range(4): wavfile.write(os.path.join(pasta, f'passo_{k}.wav'), SR, (f(k) * 32767).astype(np.int16))
        else:
            wavfile.write(os.path.join(pasta, f'{nome}.wav'), SR, (f() * 32767).astype(np.int16))
    return sorted(os.listdir(pasta))

if __name__ == '__main__':
    print(gerar(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'sfx')))

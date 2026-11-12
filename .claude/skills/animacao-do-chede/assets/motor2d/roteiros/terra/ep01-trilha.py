# Trilha de fundo do episódio 1 (versão dramática), composta por código — suspense em Ré menor.
# Lê os tempos das cenas do roteiro (ep01-dramatico.json), então acompanha se uma cena mudar de duração.
# Uso: python3 roteiros/terra/ep01-trilha.py   → audio/terra/ep01-dramatico/trilha.wav (48 kHz, estéreo)
import json, os, wave
import numpy as np
from scipy.signal import lfilter, fftconvolve

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
ROT = json.load(open(os.path.join(AQUI, 'ep01-dramatico.json')))
SR = 48000
ini, t = {}, 0.0
for p in ROT['planos']:
    ini[p['id']] = t; t += p['duracao']
TOTAL = t
N = int(TOTAL * SR) + SR * 3
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def nota(n):  # nome → Hz (ex.: 'D2', 'A#3', 'Bb3')
    nomes = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    k, o = (n[:2], n[2:]) if n[1:2] in '#b' else (n[:1], n[1:])
    return 440.0 * 2 ** ((nomes[k] + 12 * (int(o) + 1) - 69) / 12)

def lp(x, fc):  # passa-baixa de 1 polo
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)

def hp(x, fc): return x - lp(x, fc)

def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def soma(x, t0, amp=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[:N - i] * amp
    L[i:i + len(x)] += x * (1 - pan) * 0.7071 * 1.414 / 2 * 2 ** 0.5
    R[i:i + len(x)] += x * (1 + pan) * 0.7071 * 1.414 / 2 * 2 ** 0.5

def serra(f, d, desaf=(0.0,)):
    tt = np.arange(int(d * SR)) / SR; y = np.zeros(len(tt))
    for dv in desaf:
        ff = f * (1 + dv)
        for h in range(1, 9): y += np.sin(2 * np.pi * ff * h * tt + h) / h
    return y / len(desaf)

def pad(notas, t0, d, amp, brilho=900, a=1.2, r=1.2):
    for k, n in enumerate(notas):
        y = lp(serra(nota(n), d, (-0.004, 0.0, 0.005)), brilho) * env(int(d * SR), a, r)
        soma(y, t0, amp / len(notas) * 2.2, pan=(-0.5 + k / max(1, len(notas) - 1)) * 0.6)

def drone(n, t0, d, amp):
    tt = np.arange(int(d * SR)) / SR; f = nota(n)
    y = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2 * tt + 0.3) + 0.25 * np.sin(2 * np.pi * f * 3.01 * tt)
    y *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * tt)) * env(len(tt), 1.5, 1.5)
    soma(y, t0, amp)

def pluck(n, t0, amp, dec=5.0, pan=0.0, d=1.2):
    tt = np.arange(int(d * SR)) / SR; f = nota(n)
    y = (np.sin(2 * np.pi * f * tt + 0.8 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 8)) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt * dec)
    y[:200] *= np.linspace(0, 1, 200)
    soma(y, t0, amp, pan)

def tique(t0, amp):
    n = int(0.03 * SR); y = hp(rng.standard_normal(n), 4000) * np.exp(-np.arange(n) / SR * 180)
    soma(y, t0, amp, pan=0.3)

def tambor(t0, amp, f0=110, f1=48):
    tt = np.arange(int(0.6 * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-tt * 18)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6) + 0.35 * lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 20)
    soma(y, t0, amp)

def boom(t0, amp, d=3.0):
    tt = np.arange(int(d * SR)) / SR; f = 28 + 70 * np.exp(-tt * 3)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.3) + 0.6 * lp(rng.standard_normal(len(tt)), 300) * np.exp(-tt * 4)
    soma(y, t0, amp)

def riser(t0, d, amp):
    tt = np.arange(int(d * SR)) / SR; k = tt / d
    ruido = rng.standard_normal(len(tt)); y = np.zeros(len(tt))
    for i, (a, b) in enumerate([(0, 0.33), (0.33, 0.66), (0.66, 1.0)]):  # filtro que abre aos poucos
        m = (k >= a) & (k < b); y[m] = lp(ruido, 300 + 3500 * b)[m]
    f = 120 + 900 * k ** 2
    y = 0.6 * y + 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    soma(y * k ** 2.2, t0, amp)

def tremolo(notas, t0, d, amp):
    tt = np.arange(int(d * SR)) / SR
    for k, n in enumerate(notas):
        y = lp(serra(nota(n), d, (-0.003, 0.003)), 2500) * (0.55 + 0.45 * np.sin(2 * np.pi * 11 * tt + k)) * env(len(tt), 0.6, 0.8)
        soma(y, t0, amp / len(notas), pan=-0.4 + 0.8 * k / max(1, len(notas) - 1))

# ---------------- composição ----------------
batida = 60 / 70  # 70 bpm
# abertura: batida grave + som de fundo
boom(0.05, 0.9); drone('D1', 0.0, ini['tapa'] - 0.1, 0.35); pad(['D4', 'A4'], 0.0, 3.0, 0.12, brilho=2500, a=0.3)
# noite / quarto: tique de relógio + acorde frio
t0, t1 = ini['noite'], ini['tapa']
pad(['D3', 'F3', 'A3'], t0, t1 - t0, 0.18, brilho=700, a=2.0, r=0.4)
x = t0
while x < t1 - 0.2: tique(x, 0.25); x += batida
pluck('D3', ini['despertador'], 0.25); pluck('A2', ini['despertador'] + batida, 0.2)
# silêncio antes do tapa → pancada
bate = ini['tapa'] + 0.45
boom(bate, 0.8, 2.5); drone('D1', bate, ini['mae'] - bate, 0.4)
# poder: pulsos em colcheia e acordes Dm–Bb–Gm–A crescendo
t0, t1 = bate + 0.3, ini['mae']
prog = [['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['G2', 'Bb2', 'D3'], ['A2', 'C#3', 'E3']]
baixos = ['D2', 'Bb1', 'G1', 'A1']
dur_c = (t1 - t0) / 4
for i, (ac, bx) in enumerate(zip(prog, baixos)):
    pad(ac, t0 + i * dur_c, dur_c + 0.6, 0.18 + 0.05 * i, brilho=800 + 200 * i, a=0.8, r=0.6)
    x = t0 + i * dur_c
    arp = [n[:-1] + str(int(n[-1]) + 1) for n in ac]
    j = 0
    while x < t0 + (i + 1) * dur_c - 0.05:
        pluck(bx, x, 0.22 + 0.04 * i, dec=7)
        pluck(arp[j % 3], x + batida / 4, 0.1 + 0.03 * i, dec=6, pan=0.35 * (1 if j % 2 else -1))
        x += batida / 2; j += 1
# mãe: cordas tremidas, tensas
t0, t1 = ini['mae'], ini['rua']
pluck('D4', t0 + 0.05, 0.3, dec=3)
tremolo(['D5', 'F5'], t0, (t1 - t0) / 2 + 0.3, 0.16)
tremolo(['E5', 'G5', 'Bb5'], t0 + (t1 - t0) / 2, (t1 - t0) / 2, 0.15)
drone('A0', t0, t1 - t0, 0.3)
# rua / escola: perseguição com tambores
t0, t1 = ini['rua'], ini['rafael']
passo = 0.5
x, k = t0, 0
prog2 = [['D3', 'F3', 'A3'], ['C3', 'E3', 'G3'], ['Bb2', 'D3', 'F3'], ['A2', 'C#3', 'E3']]
while x < t1 - 0.1:
    tambor(x, 0.55 if k % 4 in (0, 2) else 0.3, 120 if k % 4 == 0 else 95)
    pluck(['D2', 'D2', 'F2', 'D2'][k % 4], x, 0.25, dec=9)
    x += passo; k += 1
dc = (t1 - t0) / 4
for i, ac in enumerate(prog2): pad(ac, t0 + i * dc, dc + 0.4, 0.2, brilho=1200, a=0.3, r=0.4)
boom(ini['portao'] + 0.35, 0.5, 2.0)
# Rafael / buraco / coluna: cresce até o salvamento
t0, t1 = ini['rafael'], ini['amigo']
for i, (ac, bx) in enumerate(zip([['Bb2', 'D3', 'F3'], ['G2', 'Bb2', 'D3'], ['A2', 'C#3', 'E3', 'A3']], ['Bb1', 'G1', 'A1'])):
    a0 = t0 + i * (t1 - t0) / 3; d0 = (t1 - t0) / 3
    pad(ac, a0, d0 + 0.5, 0.2 + 0.07 * i, brilho=1000 + 400 * i, a=0.5, r=0.5)
    x = a0; st = batida / (2 + i)
    while x < a0 + d0 - 0.05: pluck(bx, x, 0.22 + 0.05 * i, dec=8); x += st
boom(ini['buraco'] + 0.3, 0.7, 2.5)
tambor(ini['coluna'] + 0.4, 0.8, 140, 40)
# amigo / resposta / sozinho: triste, notas soltas tipo piano
t0, t1 = ini['amigo'], ini['racha']
melod = ['A4', 'F4', 'E4', 'D4', 'F4', 'E4', 'C#4', 'D4']
x, i = t0 + 0.2, 0
while x < t1 - 0.3:
    pluck(melod[i % len(melod)], x, 0.22, dec=2.2, pan=0.2, d=2.5); x += batida * 1.5; i += 1
dt = (t1 - t0) / 3
for j, ac in enumerate([['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['F2', 'A2', 'C3']]): pad(ac, t0 + j * dt, dt + 0.8, 0.15, brilho=600, a=1.0, r=1.0)
# racha: grave subindo
drone('D1', ini['racha'], ini['fundo'] - ini['racha'] + 0.5, 0.45)
tremolo(['D4', 'Eb4'], ini['racha'], ini['fundo'] - ini['racha'], 0.12)
# fundo: subida até o estrondo; ritmo: grave pulsando
riser(ini['fundo'], ini['ritmo'] - ini['fundo'], 0.5)
drone('A0', ini['fundo'], ini['parte'] - ini['fundo'], 0.4)
boom(ini['ritmo'], 1.0, 3.0)
pad(['D3', 'Eb3', 'A3'], ini['ritmo'], ini['parte'] - ini['ritmo'], 0.2, brilho=1500, a=0.3, r=0.3)
# cartela final: acorde de fechamento
pad(['D3', 'A3', 'D4', 'E4', 'F4'], ini['parte'], TOTAL - ini['parte'] + 1.5, 0.3, brilho=1800, a=0.05, r=2.0)
boom(ini['parte'], 0.6, 2.5)

# reverb simples (sala grande) e master
ir_n = int(2.4 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.6)
ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
Lw = fftconvolve(L, ir)[:N]; Rw = fftconvolve(R, ir[::-1].copy() * 0 + np.roll(ir, 97))[:N]
L2 = 0.75 * L + 0.35 * Lw; R2 = 0.75 * R + 0.35 * Rw
fim = int((TOTAL + 1.0) * SR); L2, R2 = L2[:fim], R2[:fim]
fade = int(1.0 * SR); L2[-fade:] *= np.linspace(1, 0, fade); R2[-fade:] *= np.linspace(1, 0, fade)
pico = max(np.abs(L2).max(), np.abs(R2).max()); L2 *= 0.7 / pico; R2 *= 0.7 / pico
saida = os.path.join(RAIZ, 'audio', 'terra', 'ep01-dramatico', 'trilha.wav')
os.makedirs(os.path.dirname(saida), exist_ok=True)
dados = (np.stack([L2, R2], 1) * 32767).astype('<i2')
with wave.open(saida, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(dados.tobytes())
print('Trilha:', saida, f'{len(L2) / SR:.1f} s')

# Trilha de fundo do episódio 2 (Parte 2), composta por código — mistério e aventura em Mi menor.
# Lê os tempos das cenas do roteiro (ep02.json), então acompanha se uma cena mudar de duração.
# Uso: python3 roteiros/terra/ep02-trilha.py   → audio/terra/ep02/trilha.wav (48 kHz, estéreo)
import json, os, wave
import numpy as np
from scipy.signal import lfilter, fftconvolve

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
ROT = json.load(open(os.path.join(AQUI, 'ep02.json')))
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
B = 60 / 72
def secao(a, b): return ini[a], ini[b]
# capa: pancada + acorde aberto
boom(0.05, 0.9); pad(['E3', 'B3', 'E4', 'F#4'], 0.0, ini['lembra'] + 0.4, 0.2, brilho=2200, a=0.2, r=0.6)
# lembrança / meia-noite: quieto, Em, relógio
t0, t1 = secao('lembra', 'chamado')
pad(['E3', 'G3', 'B3'], t0, t1 - t0 + 0.3, 0.16, brilho=700, a=1.2, r=0.5)
drone('E1', t0, t1 - t0, 0.25)
x = ini['meianoite']
while x < t1 - 0.2: tique(x, 0.2); x += B
for i, n in enumerate(['B4', 'G4', 'E4', 'F#4']): pluck(n, t0 + 0.3 + i * B * 1.5, 0.16, dec=2.4, d=2.4, pan=0.2)
# a voz da terra: grave e cordas tremendo
t0, t1 = secao('chamado', 'desce')
drone('E1', t0, t1 - t0 + 0.4, 0.45); tremolo(['E4', 'F4'], t0, t1 - t0, 0.12)
riser(ini['abre'], ini['desce'] - ini['abre'], 0.45)
boom(ini['desce'], 0.75, 2.5)
# escada: arpejo de mistério, esquenta quando o Rafael chega e no "valeu"
t0, t1 = secao('desce', 'caverna')
prog = [(['E3', 'G3', 'B3'], 'E2'), (['C3', 'E3', 'G3'], 'C2'), (['A2', 'C3', 'E3'], 'A1'), (['G2', 'B2', 'D3'], 'G1'), (['C3', 'E3', 'G3', 'B3'], 'C2')]
dc = (t1 - t0) / len(prog)
for i, (ac, bx) in enumerate(prog):
    a0 = t0 + i * dc
    pad(ac, a0, dc + 0.5, 0.15 + 0.02 * i, brilho=800 + 150 * i, a=0.6, r=0.6)
    arp = [n[:-1] + str(int(n[-1]) + 1) for n in ac]; x, j = a0, 0
    while x < a0 + dc - 0.05:
        if j % 2 == 0: pluck(bx, x, 0.16, dec=6)
        pluck(arp[j % len(arp)], x + 0.05, 0.08 + 0.01 * i, dec=4, pan=0.4 * (1 if j % 2 else -1)); x += B / 2; j += 1
# caverna: revelação — acorde grande e brilho
t0, t1 = secao('caverna', 'coracao')
boom(t0 + 0.1, 0.5, 3.0)
prog = [['E3', 'B3', 'E4', 'F#4', 'G4'], ['C3', 'G3', 'C4', 'D4', 'E4'], ['G2', 'D3', 'G3', 'A3', 'B3'], ['D3', 'A3', 'D4', 'E4', 'F#4']]
dc = (t1 - t0) / 4
for i, ac in enumerate(prog):
    pad(ac, t0 + i * dc, dc + 0.8, 0.26, brilho=1600, a=0.5, r=0.8)
    for j in range(6): pluck(['E5', 'B5', 'G5', 'F#5', 'D5', 'A5'][(i + j) % 6], t0 + i * dc + j * dc / 6, 0.07, dec=3, pan=0.5 * ((-1) ** j), d=1.5)
drone('E1', t0, t1 - t0, 0.3)
# coração de pedra / mão: pulso grave junto com as batidas
t0, t1 = secao('coracao', 'guardiao')
drone('E1', t0, t1 - t0 + 0.3, 0.4)
pad(['E3', 'B3', 'G4'], t0, t1 - t0, 0.16, brilho=900, a=0.8, r=0.3)
tremolo(['B4', 'C5'], ini['mao'], t1 - ini['mao'], 0.12)
riser(ini['mao'], t1 - ini['mao'], 0.35)
# visão: cluster escuro
t0, t1 = secao('guardiao', 'treme')
boom(t0, 0.8, 2.6); drone('D#1', t0, t1 - t0, 0.45); tremolo(['E4', 'F4', 'A#4'], t0, t1 - t0, 0.16)
# treme: booms e subida
t0, t1 = secao('treme', 'levanta')
boom(t0 + 0.2, 0.7, 2.0); riser(t0, (t1 - t0) + 0.4, 0.4)
# luta: tambores a 144 bpm, Em–C–D–B
t0, t1 = secao('levanta', 'naoataca')
boom(t0, 0.8, 2.5)
passo = 60 / 144; x, k = t0, 0
while x < t1 - 0.05:
    tambor(x, 0.5 if k % 4 in (0, 2) else 0.28, 120 if k % 4 == 0 else 95)
    pluck(['E2', 'E2', 'G2', 'E2', 'C2', 'C2', 'D2', 'B1'][(k // 2) % 8], x, 0.22, dec=9)
    x += passo; k += 1
prog = [['E3', 'G3', 'B3'], ['C3', 'E3', 'G3'], ['D3', 'F#3', 'A3'], ['B2', 'D#3', 'F#3']]
dc = (t1 - t0) / 4
for i, ac in enumerate(prog): pad(ac, t0 + i * dc, dc + 0.4, 0.2, brilho=1300, a=0.2, r=0.4)
boom(ini['muro'] + 1.75, 0.85, 2.0); tambor(ini['muro'] + 1.75, 0.8, 150, 40)
boom(ini['manda'] + 0.75, 1.0, 2.6); tambor(ini['manda'] + 0.75, 0.9, 160, 38)
# não ataca / ajoelha: suspenso e depois um acorde maior (respeito)
t0, t1 = secao('naoataca', 'passos')
pad(['E3', 'A3', 'B3'], t0, ini['ajoelha'] - t0 + 0.4, 0.18, brilho=900, a=0.4, r=0.5)
pad(['E3', 'G#3', 'B3', 'E4'], ini['ajoelha'] + 0.6, t1 - ini['ajoelha'], 0.24, brilho=1500, a=0.6, r=0.6)
pluck('E4', ini['ajoelha'] + 0.9, 0.2, dec=2, d=2.5); pluck('B4', ini['ajoelha'] + 0.9 + B, 0.17, dec=2, d=2.5)
# passos / mãe: corta para silêncio tenso, cordas tremendo e notas soltas
t0, t1 = secao('passos', 'maeq')
tique(t0 + 0.1, 0.4); tique(t0 + 0.1 + B, 0.4)
tremolo(['E5', 'F5'], t0, t1 - t0, 0.12); drone('E1', t0, t1 - t0, 0.3)
for i, n in enumerate(['B4', 'A4', 'G4', 'F#4']): pluck(n, ini['mae'] + 0.2 + i * B, 0.16, dec=2.2, d=2.4)
# "Mãe?!": estrondo
boom(ini['maeq'] + 0.05, 0.9, 2.6); pad(['E3', 'Bb3', 'E4'], ini['maeq'], ini['parte'] - ini['maeq'], 0.22, brilho=1700, a=0.05, r=0.3)
# cartela
pad(['E3', 'B3', 'E4', 'F#4', 'G4'], ini['parte'], TOTAL - ini['parte'] + 1.5, 0.3, brilho=1800, a=0.05, r=2.0)
boom(ini['parte'], 0.6, 2.5)

# reverb simples (sala grande) e master
ir_n = int(2.4 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.6)
ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
Lw = fftconvolve(L, ir)[:N]; Rw = fftconvolve(R, ir[::-1].copy() * 0 + np.roll(ir, 97))[:N]
L2 = 0.75 * L + 0.35 * Lw; R2 = 0.75 * R + 0.35 * Rw
fim = int((TOTAL + 1.0) * SR); L2, R2 = L2[:fim], R2[:fim]
fade = int(1.0 * SR); L2[-fade:] *= np.linspace(1, 0, fade); R2[-fade:] *= np.linspace(1, 0, fade)
pico = max(np.abs(L2).max(), np.abs(R2).max()); L2 *= 0.7 / pico; R2 *= 0.7 / pico
saida = os.path.join(RAIZ, 'audio', 'terra', 'ep02', 'trilha.wav')
os.makedirs(os.path.dirname(saida), exist_ok=True)
dados = (np.stack([L2, R2], 1) * 32767).astype('<i2')
with wave.open(saida, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(dados.tobytes())
print('Trilha:', saida, f'{len(L2) / SR:.1f} s')

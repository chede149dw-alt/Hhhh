#!/usr/bin/env python3
"""Mixagem: vozes (words.json) + efeitos (timeline.sons) + fundos, com ducking, limitador e -14 LUFS.
Uso: python3 audio/mixar.py <pasta do projeto>  → audio.wav (48 kHz estéreo)  e imprime o LUFS final."""
import json, os, subprocess, sys, re
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
AQUI = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(AQUI, 'sfx')

def ler(arq):
    sr, x = wavfile.read(arq)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if x.ndim > 1: x = x.mean(axis=1)
    assert sr == SR, f'{arq}: {sr} Hz'
    return x
def db(v): return 10 ** (v / 20)
def filt(x, tipo, f): return sosfilt(butter(4, f, btype=tipo, fs=SR, output='sos'), x)
def reverb(x, dur=0.7, mix=0.18):
    rng = np.random.default_rng(7)
    n = int(SR * dur); ir = filt(rng.standard_normal(n), 'low', 3500) * np.exp(-np.arange(n) / (n / 5)); ir /= np.sqrt(np.sum(ir ** 2))
    w = np.convolve(x, ir)[: len(x)]
    return x * (1 - mix) + w * mix
def colocar(trilha, x, t, ganho=1.0):
    i = int(t * SR)
    if i >= len(trilha) or i + len(x) <= 0: return
    a, b = max(0, i), min(len(trilha), i + len(x))
    trilha[a:b] += x[a - i:b - i] * ganho
def laco(x, n): return np.tile(x, n // len(x) + 1)[:n]

def mixar(pasta):
    tl = json.load(open(os.path.join(pasta, 'timeline.json')))
    W = json.load(open(os.path.join(pasta, 'words.json')))
    N = int((tl['duracao'] + 0.5) * SR)
    voz, sfx, fundo = np.zeros(N, np.float32), np.zeros(N, np.float32), np.zeros(N, np.float32)
    # vozes: narração seca e próxima; diálogos com sala; Larissa do lado de fora (abafada)
    for f in W['falas']:
        x = ler(os.path.join(pasta, f['arquivo']))
        if f['tipo'] == 'narracao': g = db(0)
        elif f['quem'] == 'larissa': x = reverb(filt(x, 'low', 4500), 0.9, 0.25); g = db(-2)
        elif f['quem'] == 'mae': x = reverb(x, 1.2, 0.3); g = db(0)
        else: x = reverb(x, 0.6, 0.15); g = db(-1)
        colocar(voz, x, f['ini'], g)
    # efeitos pontuais
    GANHO = dict(risada=-5, passo=-14, tensao=-6, alerta=-7, batida=-1, grade_impacto=-4, estalo_pescoco=-6, porta_geladeira=-10, lata=-12, chave_cadeado=-12)
    npasso = 0; faltando = set()
    for s in tl['sons']:
        nome = s['som']
        if nome in ('zumbido_geladeira', 'drone'): continue
        arq = os.path.join(SFX, f'passo_{npasso % 4}.wav' if nome == 'passo' else f'{nome}.wav')
        if os.path.exists(os.path.join(pasta, 'voz', f'{nome}.wav')): arq = os.path.join(pasta, 'voz', f'{nome}.wav')   # som feito com voz
        if nome == 'passo': npasso += 1
        if not os.path.exists(arq): faltando.add(nome); continue
        g = GANHO.get(nome, -8) + (s.get('vol') or 0)
        if nome == 'passo' and s.get('de') == 'larissa':   # passos dela vêm de longe: começam fracos e chegam
            g += -10 + 10 * min(1, max(0, (s['t'] - (tl['planos'][2]['ini'] - 3.2)) / 4.0))
        colocar(sfx, ler(arq), s['t'], db(g))
    # fundos: geladeira (só com a cena aberta) + drone (sobe na reta final) + rua
    t = np.arange(N) / SR
    preto = np.zeros(N, bool)
    for e in tl['efeitos']:
        if e['tipo'] == 'preto': preto[int(e['ini'] * SR):int(e['fim'] * SR)] = True
    gel = laco(ler(os.path.join(SFX, 'zumbido_geladeira.wav')), N) * db(-30)
    gel *= np.where(preto, 0.25, 1.0)
    dr = laco(ler(os.path.join(SFX, 'drone.wav')), N)
    p8 = next(p['ini'] for p in tl['planos'] if p['id'] == 8)
    curva = db(-30) + (db(-17) - db(-30)) * np.clip((t - p8 + 6) / 10, 0, 1)
    fundo += gel + dr * curva + laco(ler(os.path.join(SFX, 'rua_ambiente.wav')), N) * db(-34)
    # ducking: fundo abaixa até 8 dB quando há voz
    envv = np.sqrt(np.convolve(voz ** 2, np.ones(int(SR * 0.05)) / int(SR * 0.05), 'same'))
    duck = 1 - (1 - db(-8)) * np.clip(envv / 0.05, 0, 1)
    duck = np.convolve(duck, np.ones(int(SR * 0.2)) / int(SR * 0.2), 'same')
    mix = voz + sfx * (0.6 + 0.4 * duck) + fundo * duck
    # limitador simples (pico -1 dBFS) antes do loudnorm
    pico = np.max(np.abs(mix)); mix = mix / max(pico, 1e-6) * db(-1)
    bruto = os.path.join(pasta, 'audio_bruto.wav')
    wavfile.write(bruto, SR, np.stack([mix, mix], 1).astype(np.float32))
    # loudnorm em 2 passes → -14 LUFS, pico verdadeiro -1,5 dBTP
    med = subprocess.run(['ffmpeg', '-hide_banner', '-i', bruto, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(med[med.rindex('{'):med.rindex('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
          f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    final = os.path.join(pasta, 'audio.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', bruto, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', final], check=True)
    os.remove(bruto)
    return final, medir_lufs(final), sorted(faltando)

def medir_lufs(arq):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', arq, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])

if __name__ == '__main__':
    final, lufs, falt = mixar(os.path.abspath(sys.argv[1]))
    print(f'{final}: {lufs:.1f} LUFS' + (f' (sem arquivo: {", ".join(falt)})' if falt else ''))

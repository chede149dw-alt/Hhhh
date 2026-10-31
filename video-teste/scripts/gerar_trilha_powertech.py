"""Gera a trilha eletrônica e os efeitos sonoros do comercial POWER TECH.

Uso: python3 scripts/gerar_trilha_powertech.py
Lê os tempos de src/powertech/timing.json e grava public/powertech/trilha.wav
(estéreo, 44,1 kHz, 16 bits). Todo o áudio é sintetizado aqui, sem amostras
de terceiros, portanto livre para uso no anúncio.

Estrutura (120 BPM, 1 tempo = 15 frames):
  0–4 s    abertura: pad grave + pulso de energia + impacto da marca
  4–10 s   construção: bumbo, baixo pulsante e arpejo
  10–23 s  energia total: arpejo aberto, chimbal, palmas
  ~22,5 s  respiro + subida antes da chamada final
  23–32 s  drop final, impacto da marca e cauda musical
"""

import json
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
T = json.loads((RAIZ / "src/powertech/timing.json").read_text())
E = T["eventos"]
C = T["cenas"]
SR = 44100
FPS = T["fps"]
DUR = T["duration"] / FPS
N = int(DUR * SR)
BPM = T["bpm"]
BATIDA = 60 / BPM
rng = np.random.default_rng(42)
GANHO_FINAL = 0.8


def s(frame):
    return frame / FPS


def tempo(n):
    return np.arange(n) / SR


def adicionar(buf, sinal, inicio_s, ganho=1.0, pan=0.0):
    """Mistura um sinal mono em um buffer estéreo (pan -1..1)."""
    i = int(round(inicio_s * SR))
    if i >= buf.shape[1] or i + len(sinal) <= 0:
        return
    if i < 0:
        sinal = sinal[-i:]
        i = 0
    fim = min(buf.shape[1], i + len(sinal))
    trecho = sinal[: fim - i] * ganho
    buf[0, i:fim] += trecho * np.sqrt((1 - pan) / 2) * np.sqrt(2)
    buf[1, i:fim] += trecho * np.sqrt((1 + pan) / 2) * np.sqrt(2)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(n, ataque=0.005, decaimento=0.2):
    t = tempo(n)
    return np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / decaimento)


def adsr(n, a=0.01, r=0.05):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def passa_baixa_fft(x, corte):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / corte) ** 4)
    return np.fft.irfft(X, len(x))


def passa_alta_fft(x, corte):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (corte / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def filtro_variavel(x, alfas):
    """Passa-baixa de um polo com coeficiente variável (varreduras de filtro)."""
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alfas[i] * (x[i] - acc)
        y[i] = acc
    return y


def serra(freq, n, detune=0.0):
    t = tempo(n)
    out = np.zeros(n)
    for d in (-detune, 0.0, detune) if detune else (0.0,):
        out += 2 * ((t * freq * (1 + d)) % 1) - 1
    return out / (3 if detune else 1)


# ---------------- Instrumentos ----------------
def bumbo():
    n = int(0.45 * SR)
    f = 48 + 110 * np.exp(-tempo(n) / 0.035)
    fase = 2 * np.pi * np.cumsum(f) / SR
    corpo = np.sin(fase) * env(n, 0.001, 0.16)
    clique = rng.standard_normal(n) * env(n, 0.0005, 0.004) * 0.4
    return np.tanh((corpo + clique) * 1.8)


def chimbal(aberto=False):
    n = int((0.22 if aberto else 0.06) * SR)
    r = passa_alta_fft(rng.standard_normal(n), 7000)
    return r * env(n, 0.001, 0.07 if aberto else 0.015)


def palma():
    n = int(0.25 * SR)
    r = passa_alta_fft(rng.standard_normal(n), 1200)
    e = np.zeros(n)
    for k, atraso in enumerate([0, 0.011, 0.022]):
        i = int(atraso * SR)
        e[i:] += env(n - i, 0.001, 0.012 if k < 2 else 0.09)
    return r * e * 0.8


def baixo(midi, dur):
    n = int(dur * SR)
    x = serra(hz(midi), n, 0.004) * 0.6 + np.sin(2 * np.pi * hz(midi - 12) * tempo(n)) * 0.7
    alfas = 0.02 + 0.10 * np.exp(-tempo(n) / 0.06)
    return np.tanh(filtro_variavel(x, alfas) * 2.2) * adsr(n, 0.003, 0.03)


def pluck(midi, dur, brilho=0.25):
    n = int(dur * SR)
    x = serra(hz(midi), n, 0.006)
    alfas = 0.03 + brilho * np.exp(-tempo(n) / 0.05)
    return filtro_variavel(x, alfas) * env(n, 0.002, 0.18) * adsr(n, 0.002, 0.02)


def pad(midis, dur, corte=900):
    n = int(dur * SR)
    x = sum(serra(hz(m), n, 0.008) for m in midis) / len(midis)
    x = passa_baixa_fft(x, corte)
    return x * adsr(n, dur * 0.35, dur * 0.35)


# ---------------- Efeitos ----------------
def whoosh(dur=0.5, sobe=True):
    n = int(dur * SR)
    ruido = rng.standard_normal(n)
    forma = np.sin(np.linspace(0, np.pi, n)) ** 2
    alfas = 0.01 + 0.35 * (np.linspace(0, 1, n) ** 1.5 if sobe else forma)
    return filtro_variavel(ruido, alfas) * forma * 1.6


def impacto(dur=1.8, grave=1.0):
    n = int(dur * SR)
    f = 36 + 90 * np.exp(-tempo(n) / 0.09)
    fase = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(fase) * env(n, 0.002, 0.55) * grave
    ruido = passa_baixa_fft(rng.standard_normal(n), 2500) * env(n, 0.001, 0.12) * 1.2
    metal = sum(np.sin(2 * np.pi * fr * tempo(n)) for fr in (523, 1187, 2311)) * env(n, 0.001, 0.4) * 0.08
    return np.tanh((sub + ruido + metal) * 1.4)


def subida(dur, f0=150, f1=2400):
    n = int(dur * SR)
    ruido = rng.standard_normal(n)
    alfas = np.geomspace(f0, f1, n) / SR * 2 * np.pi
    alfas = np.clip(alfas, 0, 0.9)
    r = filtro_variavel(ruido, alfas)
    f = np.geomspace(110, 880, n)
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (r + tom) * np.linspace(0, 1, n) ** 2.2


def zap(dur=0.35):
    n = int(dur * SR)
    f = np.geomspace(2400, 140, n)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * env(n, 0.001, 0.09)


def bip(freq=1800, dur=0.07):
    n = int(dur * SR)
    return np.sin(2 * np.pi * freq * tempo(n)) * env(n, 0.001, 0.025)


def batida_texto():
    n = int(0.3 * SR)
    f = 70 + 160 * np.exp(-tempo(n) / 0.02)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.08)
    ar = passa_alta_fft(rng.standard_normal(n), 3000) * env(n, 0.001, 0.03) * 0.5
    return corpo + ar


# ---------------- Composição musical ----------------
musica = np.zeros((2, N))
# Progressão em Lá menor: Am – F – C – G (um acorde por compasso de 4 tempos)
progressao = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
COMPASSO = BATIDA * 4

t_construcao = s(C["computadores"][0])
t_total = s(C["parcelamento"][0])
t_respiro = s(E["convergencia"] - 22)
t_drop = s(E["marcaFinal"])
t_fim_musica = s(E["impactoFinal"])

n_compassos = int(np.ceil(DUR / COMPASSO))
for c in range(n_compassos):
    t0 = c * COMPASSO
    raiz, acorde = progressao[c % 4]
    # Pad contínuo (mais aberto conforme a energia cresce)
    corte = 500 if t0 < t_construcao else (900 if t0 < t_total else 1400)
    if t0 < t_fim_musica:
        p = pad([m for m in acorde] + [acorde[0] + 12], COMPASSO * 1.05, corte)
        adicionar(musica, p, t0, 0.20, -0.3)
        adicionar(musica, p, t0 + 0.012, 0.20, 0.3)

    for b in range(16):  # semicolcheias
        tb = t0 + b * BATIDA / 4
        if tb >= DUR:
            break
        no_respiro = t_respiro <= tb < t_drop
        if tb >= t_fim_musica or no_respiro:
            continue
        # Bumbo a partir da construção
        if tb >= t_construcao and b % 4 == 0:
            adicionar(musica, bumbo(), tb, 0.85)
        # Baixo pulsante em colcheias fora do tempo
        if tb >= t_construcao and b % 2 == 0 and b % 4 != 0:
            adicionar(musica, baixo(raiz, BATIDA / 2 * 0.9), tb, 0.30)
        elif tb >= t_construcao - COMPASSO and tb < t_construcao and b % 4 == 2:
            adicionar(musica, baixo(raiz, BATIDA / 2 * 0.9), tb, 0.22)
        # Arpejo
        if tb >= t_construcao:
            notas = acorde + [acorde[0] + 12, acorde[1] + 12]
            nota = notas[(b * 3) % len(notas)] + 12
            brilho = 0.12 if tb < t_total else 0.3
            adicionar(musica, pluck(nota, BATIDA / 4 * 0.95, brilho), tb, 0.11, 0.5 if b % 2 else -0.5)
        # Chimbal e palmas na seção de energia total
        if tb >= t_total:
            if b % 4 == 2:
                adicionar(musica, chimbal(aberto=True), tb, 0.10, 0.25)
            elif b % 2 == 1:
                adicionar(musica, chimbal(), tb, 0.07, -0.25)
            if b % 8 == 4:
                adicionar(musica, palma(), tb, 0.28)
        elif tb >= t_construcao and b % 4 == 2:
            adicionar(musica, chimbal(), tb, 0.06)

# Acorde final sustentado (cauda) após o impacto da marca
adicionar(musica, pad([57, 60, 64, 69, 72], DUR - t_fim_musica + 0.5, 1800), t_fim_musica, 0.28, -0.2)
adicionar(musica, pad([45, 57], DUR - t_fim_musica + 0.5, 600), t_fim_musica, 0.25, 0.2)

# Envelope geral da música
tt = tempo(N)
env_m = np.clip(tt / 0.8, 0, 1) * np.clip((DUR - tt) / 1.6, 0, 1)
musica *= env_m

# ---------------- Efeitos sincronizados ----------------
sfx = np.zeros((2, N))
# Abertura
adicionar(sfx, subida(s(E["pulso"]) + 0.1, 80, 900), 0.0, 0.25)
adicionar(sfx, zap(0.5), s(E["pulso"]), 0.45, -0.6)
adicionar(sfx, whoosh(0.7), s(E["pulso"]) + 0.05, 0.45, 0.4)
adicionar(sfx, impacto(2.2), s(E["marcaAbertura"]), 0.95)
adicionar(sfx, batida_texto(), s(E["fraseAbertura"]), 0.45)
adicionar(sfx, batida_texto(), s(E["fraseAbertura"] + 6), 0.35)

# Transições entre cenas
for f in [C["computadores"][0], E["setupCorte"], C["parcelamento"][0], C["local"][0], C["cta"][0]]:
    adicionar(sfx, whoosh(0.55), s(f) - 0.4, 0.55, 0.3)

# Cena 2: gabinete ligando + textos
adicionar(sfx, subida(0.45, 300, 3000), s(E["tecnologia"] - 14), 0.15)
adicionar(sfx, bip(1600), s(E["tecnologia"]), 0.25)
adicionar(sfx, batida_texto(), s(E["tecnologia"]), 0.5)
for k, f in enumerate(E["setup"]):
    adicionar(sfx, batida_texto(), s(f), 0.5 + 0.1 * k)
    adicionar(sfx, bip(1400 + 300 * k), s(f), 0.12, (k - 1) * 0.5)

# Cena 3
adicionar(sfx, batida_texto(), s(E["headlineAcesso"]), 0.5)
adicionar(sfx, batida_texto(), s(E["secundariaAcesso"]), 0.45)
adicionar(sfx, impacto(1.2, 0.7), s(E["boleto"]), 0.55)
for k in range(6):
    adicionar(sfx, bip(2200 + 120 * k, 0.04), s(E["boleto"] + 6 + k * 4), 0.08, -0.4 + 0.16 * k)

# Cena 4
adicionar(sfx, impacto(1.4, 0.8), s(E["marcaLocal"]), 0.55)
adicionar(sfx, batida_texto(), s(E["taglineLocal"]), 0.45)
adicionar(sfx, whoosh(0.35), s(E["pino"]) - 0.2, 0.35)
adicionar(sfx, batida_texto(), s(E["pino"] + 6), 0.7)
adicionar(sfx, bip(1200), s(E["localTexto"]), 0.2)

# Cena 5
adicionar(sfx, subida(s(E["marcaFinal"] - E["convergencia"] + 22), 120, 4000), t_respiro, 0.4)
adicionar(sfx, impacto(2.4, 1.1), s(E["marcaFinal"]), 1.0)
adicionar(sfx, batida_texto(), s(E["ctaPrincipal"]), 0.55)
adicionar(sfx, batida_texto(), s(E["ctaPrincipal"] + 12), 0.55)
adicionar(sfx, batida_texto(), s(E["ctaSecundaria"]), 0.4)
adicionar(sfx, bip(1500), s(E["assinatura"]), 0.2)
adicionar(sfx, whoosh(0.6), s(E["impactoFinal"]) - 0.5, 0.5)
adicionar(sfx, impacto(3.0, 1.2), s(E["impactoFinal"]), 1.1)

# ---------------- Mixagem e masterização ----------------
mix = musica * 0.9 + sfx * 0.8
pico = np.max(np.abs(mix))
mix = mix / pico
mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # saturação leve, sem distorção audível
mix *= GANHO_FINAL  # ajustado para cerca de -14 LUFS (padrão das redes sociais)

saida = RAIZ / "public/powertech/trilha.wav"
saida.parent.mkdir(parents=True, exist_ok=True)
intercalado = (mix.T * 32767).astype(np.int16)
with wave.open(str(saida), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(intercalado.tobytes())
print(f"OK: {saida} ({DUR:.1f}s, estéreo)")

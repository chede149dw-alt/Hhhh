"""Gera a trilha e os efeitos sonoros (tudo sintetizado) do vídeo "Duelo sob a Lua".

Uso: python3 scripts/gerar_trilha_luta.py
Lê os tempos de src/luta/timing.json e grava public/luta/trilha.wav.
"""

import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

RAIZ = Path(__file__).resolve().parent.parent
T = json.loads((RAIZ / "src/luta/timing.json").read_text())
SR = 44100
FPS = T["fps"]
DUR = T["duration"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(11)

musica = np.zeros(N)
sfx = np.zeros(N)


def seg(frame):
    return frame / FPS


def tempo(n):
    return np.arange(n) / SR


def somar(buf, sinal, inicio_s, ganho=1.0):
    i = int(inicio_s * SR)
    if i >= len(buf) or i < 0:
        return
    fim = min(len(buf), i + len(sinal))
    buf[i:fim] += sinal[: fim - i] * ganho


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(n, ataque=0.004, decaimento=0.2):
    t = tempo(n)
    return np.minimum(1, t / ataque) * np.exp(-t / decaimento)


def filtro(x, tipo, corte, ordem=2):
    sos = butter(ordem, corte, btype=tipo, fs=SR, output="sos")
    return sosfilt(sos, x)


def ruido(n):
    return rng.standard_normal(n)


def serra(freq, n, desafina=0.0):
    t = tempo(n)
    return 2 * ((t * freq * (1 + desafina)) % 1) - 1


def varredura(f0, f1, n, forma="seno"):
    f = np.geomspace(f0, f1, n)
    fase = np.cumsum(f) / SR
    if forma == "seno":
        return np.sin(2 * np.pi * fase)
    return 2 * (fase % 1) - 1


# ---------------- Instrumentos ----------------
def bumbo(dur=0.32):
    n = int(dur * SR)
    return np.tanh(varredura(150, 42, n) * env(n, 0.002, 0.11) * 2.2)


def taiko(dur=1.1, grave=1.0):
    n = int(dur * SR)
    corpo = varredura(120 * grave, 50 * grave, n) * env(n, 0.003, 0.3)
    pele = filtro(ruido(n), "low", 900) * env(n, 0.001, 0.05) * 2.5
    return np.tanh((corpo + pele) * 1.8)


def caixa(dur=0.2):
    n = int(dur * SR)
    return filtro(ruido(n), "band", [1400, 6500]) * env(n, 0.001, 0.055) * 2.2 + np.sin(2 * np.pi * 190 * tempo(n)) * env(n, 0.001, 0.04)


def chimbal(dur=0.05):
    n = int(dur * SR)
    return filtro(ruido(n), "high", 7500) * env(n, 0.001, 0.014)


def baixo(midi, dur):
    n = int(dur * SR)
    f = hz(midi)
    s = serra(f, n) * 0.6 + np.sign(np.sin(2 * np.pi * f * tempo(n))) * 0.4
    return filtro(s, "low", 520) * env(n, 0.004, dur * 0.7)


def solo(midi, dur, brilho=3600):
    n = int(dur * SR)
    f = hz(midi)
    s = serra(f, n, 0.004) + serra(f, n, -0.004) + 0.5 * serra(f * 2, n, 0.002)
    return filtro(s, "low", brilho) * env(n, 0.004, dur * 0.55) * 0.5


def manto(midis, dur, corte=1300):
    n = int(dur * SR)
    s = np.zeros(n)
    for m in midis:
        f = hz(m)
        s += serra(f, n, 0.005) + serra(f, n, -0.006) + serra(f, n, 0.0)
    t = tempo(n)
    e = np.minimum(1, t / (dur * 0.3)) * np.minimum(1, (dur - t) / (dur * 0.25))
    return filtro(s, "low", corte) * e / (3 * len(midis))


def dedilhado(midi, dur=1.4):
    """Corda dedilhada (lembra um koto)."""
    n = int(dur * SR)
    t = tempo(n)
    f = hz(midi)
    s = np.zeros(n)
    for h in range(1, 9):
        s += np.sin(2 * np.pi * f * h * (1 + 0.0006 * h * h) * t) * np.exp(-t * (2.2 + h * 1.5)) / h
    return s * np.minimum(1, t / 0.002)


def zunido(dur=0.3, agudo=1.0):
    n = int(dur * SR)
    x = ruido(n)
    centro = np.sin(np.linspace(0, np.pi, n)) ** 2
    grave = filtro(x, "band", [300 * agudo, 1200 * agudo])
    alto = filtro(x, "band", [1500 * agudo, 6000 * agudo])
    return (grave * (1 - centro) + alto * centro * 1.6) * np.sin(np.linspace(0, np.pi, n)) ** 1.6


def tinido(dur=0.5, tom=1.0):
    n = int(dur * SR)
    t = tempo(n)
    s = np.zeros(n)
    for k, f in enumerate([1870, 2740, 3410, 4630, 6120, 7350]):
        s += np.sin(2 * np.pi * f * tom * t + k) * np.exp(-t * (9 + k * 5)) / (1 + k * 0.4)
    estalo = filtro(ruido(n), "high", 3000) * env(n, 0.0005, 0.012) * 2
    return s * 0.6 + estalo


def pancada(dur=0.22, peso=1.0):
    n = int(dur * SR)
    estalo = filtro(ruido(n), "low", 2400) * env(n, 0.001, 0.035) * 3
    corpo = varredura(130, 55, n) * env(n, 0.002, 0.07 * peso) * 1.6
    return np.tanh(estalo + corpo)


def estrondo(dur=1.8, peso=1.0):
    n = int(dur * SR)
    grave = varredura(105, 30, n) * env(n, 0.003, 0.5 * peso)
    racha = filtro(ruido(n), "low", 900) * env(n, 0.001, 0.14) * 3
    cauda = filtro(ruido(n), "low", 260) * env(n, 0.02, 0.6 * peso) * 2.5
    return np.tanh((grave + racha + cauda) * 1.5)


def gongo(dur=3.0):
    n = int(dur * SR)
    t = tempo(n)
    s = np.zeros(n)
    for k, f in enumerate([98, 147, 201, 263, 341, 428, 557]):
        s += np.sin(2 * np.pi * f * t + k * 1.3) * np.exp(-t * (0.9 + k * 0.55)) / (1 + k * 0.5)
    return s * np.minimum(1, t / 0.01)


def subida(dur, f0=70, f1=700, aspereza=0.3):
    n = int(dur * SR)
    s = varredura(f0, f1, n, "serra") + varredura(f0 * 1.5, f1 * 1.5, n, "serra") * 0.5
    chiado = filtro(ruido(n), "high", 2500) * np.linspace(0, 1, n) ** 2 * aspereza * 3
    return (filtro(s, "low", 3000) * 0.6 + chiado) * np.linspace(0, 1, n) ** 1.8


def estalos_eletricos(dur, densidade=40):
    n = int(dur * SR)
    x = np.zeros(n)
    qtd = int(dur * densidade)
    pos = rng.integers(0, n - 1, qtd)
    x[pos] = rng.uniform(-1, 1, qtd) * 6
    zum = np.sign(np.sin(2 * np.pi * 110 * tempo(n))) * 0.08 * (ruido(n) > 0.6)
    return filtro(x + zum, "band", [1800, 9000]) * np.linspace(0.2, 1, n)


def fogo(dur):
    n = int(dur * SR)
    base = filtro(ruido(n), "low", 700)
    tremula = 0.6 + 0.4 * filtro(ruido(n), "low", 14) * 12
    estalo = np.zeros(n)
    pos = rng.integers(0, n - 1, int(dur * 14))
    estalo[pos] = rng.uniform(-1, 1, len(pos)) * 5
    return (base * np.clip(tremula, 0, 2) * 3 + filtro(estalo, "band", [900, 5000])) * np.linspace(0.2, 1, n)


def feixe(dur):
    n = int(dur * SR)
    t = tempo(n)
    sobe = 2 ** (np.linspace(0, 5, n) / 12)
    s = np.zeros(n)
    for m, g in [(38, 1), (45, 0.8), (50, 0.7), (53, 0.5), (62, 0.35)]:
        fase = np.cumsum(hz(m) * sobe * (1 + 0.006 * np.sin(2 * np.pi * 6 * t))) / SR
        s += (2 * (fase % 1) - 1) * g
    chiado = filtro(ruido(n), "band", [400, 3800]) * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * t))
    e = np.minimum(1, t / 0.08) * np.linspace(0.7, 1, n)
    return (filtro(s, "low", 2600) * 0.5 + chiado * 0.9) * e


def vento(dur):
    n = int(dur * SR)
    x = filtro(ruido(n), "band", [250, 1100])
    ondula = 0.55 + 0.45 * np.sin(2 * np.pi * 0.21 * tempo(n) + 1.0) * np.sin(2 * np.pi * 0.07 * tempo(n))
    return x * ondula


# ---------------- Música ----------------
BATIDA = 0.4  # 150 BPM = 12 quadros por batida
COLCHEIA = BATIDA / 2
SEMI = BATIDA / 4

# i - VI - VII - V em ré menor
ACORDES = [(38, [62, 65, 69]), (34, [58, 62, 65]), (36, [60, 64, 67]), (33, [61, 64, 69])]
MELODIA = [
    [74, 77, 81, 79],
    [77, 74, 70, 74],
    [76, 79, 84, 79],
    [76, 73, 81, 81],
]


def trecho_batalha(ini_f, fim_f, transp=0, chimbal_rapido=False, ganho=1.0):
    t0 = seg(ini_f)
    t_fim = seg(fim_f)
    compasso = 0
    t = t0
    while t < t_fim - 0.01:
        raiz, acorde = ACORDES[compasso % 4]
        mel = MELODIA[compasso % 4]
        for b in range(4):
            tb = t + b * BATIDA
            if tb >= t_fim:
                break
            # bateria
            if b in (0, 2):
                somar(musica, bumbo(), tb, 0.75 * ganho)
            if b == 2:
                somar(musica, bumbo(), tb + COLCHEIA, 0.55 * ganho)
            if b in (1, 3):
                somar(musica, caixa(), tb, 0.42 * ganho)
            passo = SEMI if chimbal_rapido else COLCHEIA
            for h in range(int(BATIDA / passo)):
                somar(musica, chimbal(), tb + h * passo, (0.12 if h % 2 == 0 else 0.07) * ganho)
            # baixo em colcheias (fundamental / oitava)
            for c in range(2):
                nota = raiz + transp + (12 if (b * 2 + c) % 4 == 3 else 0)
                somar(musica, baixo(nota, COLCHEIA * 0.95), tb + c * COLCHEIA, 0.5 * ganho)
            # arpejo em semicolcheias
            for s in range(4):
                nota = acorde[(b + s) % 3] + transp + (12 if s == 3 else 0)
                somar(musica, solo(nota, SEMI * 0.9, 2600), tb + s * SEMI, 0.1 * ganho)
            # melodia
            somar(musica, solo(mel[b] + transp, BATIDA * 0.95), tb, 0.2 * ganho)
        somar(musica, taiko(0.8), t, 0.5 * ganho)
        somar(musica, manto([n + transp - 12 for n in acorde], min(BATIDA * 4, t_fim - t), 1500), t, 0.22 * ganho)
        t += BATIDA * 4
        compasso += 1


# Abertura: vento, bordão grave e cordas dedilhadas
somar(musica, manto([38, 45], 5.2, 500), 0, 0.5)
for f, nota in [(8, 62), (22, 65), (36, 69), (48, 67), (104, 74), (116, 72), (128, 69), (140, 65)]:
    somar(musica, dedilhado(nota), seg(f), 0.3)
somar(sfx, gongo(), seg(T["titulo"]), 0.5)
somar(sfx, estrondo(1.6), seg(T["titulo"]), 0.7)

# Apresentações: batidas de taiko e tensão crescendo
somar(musica, manto([38, 45, 50], 5.0, 800), seg(T["olhares"]), 0.45)
for i, f in enumerate(range(T["olhares"], T["folha"], 12)):
    somar(musica, taiko(0.5, 0.9), seg(f), 0.16 + 0.012 * i)
for p, nota in zip(T["paineis"], [74, 69]):
    somar(sfx, zunido(0.25), seg(p - 5), 0.5)
    somar(sfx, estrondo(1.2, 0.7), seg(p + 2), 0.75)
    somar(sfx, tinido(0.6, 0.8 if nota == 74 else 0.6), seg(p + 2), 0.2)
    somar(musica, dedilhado(nota, 1.8), seg(p + 8), 0.35)

# Silêncio antes do ataque: coração batendo
for f in range(T["folha"] + 6, T["folhaToca"], 26):
    somar(sfx, pancada(0.25, 1.4), seg(f), 0.35)
    somar(sfx, pancada(0.25, 1.4), seg(f + 6), 0.25)
somar(musica, np.sin(2 * np.pi * hz(86) * tempo(int(2.6 * SR))) * np.linspace(0, 1, int(2.6 * SR)) ** 2, seg(T["folha"]), 0.05)
somar(sfx, dedilhado(93, 0.5), seg(T["folhaToca"]), 0.3)
somar(sfx, zunido(0.4, 1.2), seg(T["folhaToca"] + 6), 0.7)

# Batalha 1
trecho_batalha(T["investida"], T["carga"])

# Carga de energia
dur_r = seg(T["cargaKaen"] - T["cargaRen"])
dur_k = seg(T["duplo"] - T["cargaKaen"])
somar(musica, manto([38, 45, 53], dur_r, 900), seg(T["cargaRen"]), 0.4)
somar(musica, manto([36, 43, 51], dur_k, 900), seg(T["cargaKaen"]), 0.4)
somar(sfx, subida(dur_r, 110, 880, 0.4), seg(T["cargaRen"]), 0.33)
somar(sfx, estalos_eletricos(dur_r, 55), seg(T["cargaRen"]), 0.55)
somar(sfx, subida(dur_k, 55, 440, 0.2), seg(T["cargaKaen"]), 0.4)
somar(sfx, fogo(dur_k), seg(T["cargaKaen"]), 0.5)
for f in (T["cargaRen"], T["cargaKaen"], T["duplo"]):
    somar(sfx, estrondo(1.2, 0.8), seg(f), 0.7)
for i, f in enumerate(range(T["cargaRen"], T["duplo"], 12)):
    somar(musica, taiko(0.5), seg(f), 0.3 + 0.01 * i)
# rufar antes da decolagem
for i in range(40):
    somar(musica, caixa(0.1), seg(T["duplo"]) + i * (seg(40) / 40), 0.12 + 0.012 * i)
somar(sfx, subida(seg(40), 200, 1600, 0.6), seg(T["duplo"]), 0.4)
somar(sfx, estalos_eletricos(seg(40), 70), seg(T["duplo"]), 0.4)
somar(sfx, fogo(seg(40)), seg(T["duplo"]), 0.35)

# Decolagem + batalha 2 (um tom acima, mais rápida)
somar(sfx, estrondo(2.0), seg(T["decolagem"]), 1.0)
somar(sfx, zunido(0.9, 0.7), seg(T["decolagem"]), 0.9)
trecho_batalha(T["decolagem"] + 2, T["pouso"] - 12, transp=2, chimbal_rapido=True, ganho=1.05)

# Pausa tensa antes das técnicas finais
somar(musica, manto([38, 45, 50], seg(100), 700), seg(T["pouso"]), 0.4)
for f, nota in [(1290, 62), (1302, 65), (1314, 69), (1326, 74)]:
    somar(musica, dedilhado(nota), seg(f), 0.3)

# Técnicas: pulso crescente
dur_t = seg(T["disparo"] - T["final"])
somar(musica, manto([38, 45, 53, 57], dur_t, 1400), seg(T["final"]), 0.45)
for i, f in enumerate(range(T["final"], T["disparo"], 6)):
    somar(musica, baixo(38 if i % 4 else 50, COLCHEIA * 0.9), seg(f), 0.3 + 0.012 * i)
    if i % 2 == 0:
        somar(musica, taiko(0.4), seg(f), 0.25 + 0.012 * i)
somar(sfx, subida(seg(T["viraKaen"] - T["final"]), 150, 1100, 0.4), seg(T["final"]), 0.3)
somar(sfx, estalos_eletricos(seg(T["viraKaen"] - T["final"]), 70), seg(T["final"]), 0.55)
somar(sfx, subida(seg(T["disparo"] - T["viraKaen"]), 70, 560, 0.25), seg(T["viraKaen"]), 0.38)
somar(sfx, fogo(seg(T["disparo"] - T["viraKaen"])), seg(T["viraKaen"]), 0.55)
for f in (T["tecnicaRen"], T["tecnicaKaen"]):
    somar(sfx, zunido(0.25), seg(f - 5), 0.5)
    somar(sfx, estrondo(1.3, 0.8), seg(f), 0.8)

# Feixes
dur_f = seg(T["explosao"] - T["disparo"])
somar(sfx, estrondo(2.2), seg(T["disparo"]), 1.0)
somar(sfx, feixe(dur_f + 0.3), seg(T["disparo"]), 0.55)
somar(sfx, estalos_eletricos(dur_f, 80), seg(T["disparo"]), 0.4)
somar(musica, manto([50, 57, 62, 65, 69], dur_f, 2600), seg(T["disparo"]), 0.6)
for i, f in enumerate(range(T["disparo"], T["explosao"], 6)):
    somar(musica, bumbo(), seg(f), 0.6)
    somar(musica, solo(86 if i % 2 else 81, COLCHEIA * 0.9, 5000), seg(f), 0.14)
    somar(musica, solo(89 if i % 2 else 93, SEMI * 0.9, 5000), seg(f + 3), 0.1)

# Explosão, zumbido e o corte no silêncio
somar(sfx, estrondo(3.2, 1.6), seg(T["explosao"]), 1.2)
n_z = int(2.4 * SR)
zumbido = (np.sin(2 * np.pi * 3150 * tempo(n_z)) + np.sin(2 * np.pi * 3162 * tempo(n_z))) * np.minimum(1, tempo(n_z) / 0.3) * np.exp(-tempo(n_z) / 0.9)
somar(sfx, zumbido, seg(T["explosao"] + 4), 0.07)
somar(sfx, zunido(0.3, 1.5), seg(T["cruzamento"] - 8), 0.8)
somar(sfx, tinido(0.9, 1.15), seg(T["cruzamento"]), 0.7)
somar(sfx, pancada(0.3, 1.5), seg(T["cruzamento"]), 0.9)

# Desfecho: vento, acorde que se resolve e cordas
somar(musica, manto([38, 45, 50, 53], 6.2, 900), seg(T["desfecho"] + 20), 0.4)
for f, nota in [(1650, 69), (1668, 65), (1686, 62), (1740, 62), (1752, 65), (1764, 69), (1776, 74)]:
    somar(musica, dedilhado(nota, 1.8), seg(f), 0.3)
somar(sfx, pancada(0.3, 1.2), seg(T["marcas"]), 0.8)
somar(sfx, tinido(0.5, 1.0), seg(T["marcas"]), 0.4)
somar(sfx, fogo(0.5)[::-1], seg(T["marcas"]), 0.5)
for f in T["quedas"]:
    somar(sfx, pancada(0.3, 1.6), seg(f), 0.55)
somar(sfx, taiko(1.6), seg(T["continua"]), 0.8)
somar(sfx, gongo(1.6), seg(T["continua"]), 0.3)

# Vento nas cenas calmas
env_vento = np.zeros(N)
tt = tempo(N)
for a, b, g in [(0, T["investida"], 1.0), (T["pouso"], T["final"], 0.7), (T["desfecho"], T["duration"], 1.0)]:
    trecho = (tt >= seg(a)) & (tt < seg(b))
    env_vento[trecho] = g * np.minimum(1, np.minimum(tt[trecho] - seg(a), seg(b) - tt[trecho]) / 0.6)
sfx += vento(DUR)[:N] * env_vento * 0.22

# ---------------- Efeitos da luta ----------------
# corridas e choque inicial
for f in T["corridas"]:
    somar(sfx, zunido(0.6, 0.9), seg(f), 0.8)
somar(sfx, estrondo(1.8), seg(T["choque"]), 1.0)
somar(sfx, tinido(0.9), seg(T["choque"]), 0.8)
# travados: faíscas
for f in range(T["troca"], T["separa"], 4):
    somar(sfx, tinido(0.12, 1.3 + 0.2 * rng.random()), seg(f), 0.18)
somar(sfx, zunido(0.25), seg(T["separa"]), 0.5)
# cortes e gancho
for f, g in [(T["corte1"], 0.8), (T["gancho"], 0.7), (T["corte2"], 0.8)]:
    somar(sfx, zunido(0.22, 1.5), seg(f - 4), g)
somar(sfx, tinido(0.6), seg(T["corte2"]), 0.75)
somar(sfx, pancada(), seg(T["corte2"]), 0.6)
# rajada
for i, f in enumerate(T["rajada"]):
    somar(sfx, zunido(0.12, 1.7), seg(f - 3), 0.45)
    if i % 2 == 0:
        somar(sfx, tinido(0.3, 0.9 + 0.3 * rng.random()), seg(f), 0.5)
    else:
        somar(sfx, pancada(0.18), seg(f), 0.7)
# chute, queda, salto, mergulho, esmagada
somar(sfx, zunido(0.2, 1.2), seg(T["chute"] - 5), 0.8)
somar(sfx, estrondo(1.4, 0.8), seg(T["chute"]), 1.0)
somar(sfx, pancada(0.3, 1.5), seg(T["chute"]), 1.0)
somar(sfx, pancada(0.3, 1.4), seg(T["quedaRen"]), 0.7)
somar(sfx, zunido(0.6, 0.6), seg(T["quedaRen"]), 0.5)
somar(sfx, zunido(0.5, 0.8), seg(T["saltoKaen"]), 0.7)
somar(sfx, zunido(0.45, 1.1), seg(T["mergulho"]), 0.9)
somar(sfx, fogo(0.5), seg(T["mergulho"] - 4), 0.6)
somar(sfx, estrondo(2.4, 1.3), seg(T["esmaga"]), 1.2)
somar(sfx, zunido(0.4, 1.0), seg(696), 0.5)
somar(sfx, pancada(0.3, 1.2), seg(724), 0.5)
# combate aéreo
for i, c in enumerate(T["aereos"]):
    somar(sfx, zunido(0.2, 1.6), seg(c[0] - 6), 0.6)
    somar(sfx, tinido(0.4, 0.85 + 0.1 * (i % 4)), seg(c[0]), 0.6)
    somar(sfx, pancada(0.2), seg(c[0]), 0.7)
ult = T["aereos"][-1][0]
somar(sfx, estrondo(2.0), seg(ult), 1.0)
for f in range(ult + 3, T["separacao"], 3):
    somar(sfx, tinido(0.12, 1.2 + 0.3 * rng.random()), seg(f), 0.2)
somar(sfx, subida(seg(T["separacao"] - ult), 300, 1500, 0.5), seg(ult), 0.3)
somar(sfx, estrondo(2.2, 1.2), seg(T["separacao"]), 1.1)
somar(sfx, zunido(0.5, 0.7), seg(T["separacao"] + 2), 0.7)
for f in T["pousos"]:
    somar(sfx, estrondo(1.0, 0.6), seg(f), 0.75)
    somar(sfx, zunido(0.5, 0.5), seg(f + 2), 0.4)

# ---------------- Mixagem ----------------
# a música abaixa um pouco nos golpes pesados e some nos silêncios dramáticos
ganho_m = np.ones(N)


def abaixar(ini_f, fim_f, nivel, borda=0.08):
    a, b = seg(ini_f), seg(fim_f)
    m = (tt >= a - borda) & (tt < b + borda)
    rampa = np.clip(np.minimum(tt[m] - (a - borda), (b + borda) - tt[m]) / borda, 0, 1)
    ganho_m[m] = np.minimum(ganho_m[m], 1 - (1 - nivel) * rampa)


for f in (T["choque"], T["chute"], T["esmaga"], ult):
    abaixar(f, f + 8, 0.35)
abaixar(T["explosao"], T["desfecho"] + 20, 0.0, 0.05)
musica *= ganho_m

mix = filtro(musica, "high", 30) * 0.8 + sfx * 0.85
mix *= np.clip(tt / 0.5, 0, 1) * np.clip((DUR - tt) / 0.6, 0, 1)
mix = np.tanh(mix * 1.15)
mix = mix / np.max(np.abs(mix)) * 0.92

saida = RAIZ / "public/luta/trilha.wav"
saida.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(saida), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"OK: {saida} ({DUR:.1f}s)")

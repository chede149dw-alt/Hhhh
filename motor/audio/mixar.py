"""Mixagem (prompt 8): voz + efeitos + trilha → WAV final a −14 LUFS.

Uso: python3 motor/audio/mixar.py --voz narracao.wav --linha linha-do-tempo.json --saida mix.wav
                                  [--sfx audio/sfx] [--trilha tensa|leve|nenhuma] [--duracao 15.4]
- Voz: corta graves (80 Hz), realça presença (3 kHz) e leve compressão.
- Efeitos: cada som da linha do tempo ("sons": [{t, som, ganho, dur}]) no seu instante.
- Trilha: em loop, com "ducking" (abaixa quando a voz fala).
- Final: limitador e normalização a −14 LUFS (2 passadas do loudnorm); confere a medida no fim.
"""
import argparse, json, os, subprocess, sys
import numpy as np
from scipy.io import wavfile

SR = 48000


def ler(arq):
    sr, x = wavfile.read(arq)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        raise SystemExit(f'{arq}: esperado {SR} Hz, veio {sr}')
    return x


def ffmpeg_filtro(entrada, saida, filtro):
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', entrada, '-af', filtro, '-ar', str(SR), saida])


def medir_lufs(arq, alvo=-14.0):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', arq, '-af', f'loudnorm=I={alvo}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    return json.loads(r[r.rindex('{'):r.rindex('}') + 1])


def envelope(x, janela=0.02):
    n = max(1, int(janela * SR))
    rms = np.sqrt(np.convolve(x * x, np.ones(n) / n, mode='same'))
    # ataque rápido, soltura lenta
    out = np.zeros_like(rms); a, r = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.35 * SR)); v = 0.0
    for i in range(0, len(rms), 64):
        alvo = rms[i]; c = a if alvo > v else r
        v = alvo + (v - alvo) * (c ** 64); out[i:i + 64] = v
    return out


def mixar(voz_arq, linha_arq, saida, pasta_sfx='audio/sfx', trilha='tensa', duracao=None):
    tmp = saida + '.voz.wav'
    ffmpeg_filtro(voz_arq, tmp, 'highpass=f=80,equalizer=f=3000:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2')
    voz = ler(tmp); os.remove(tmp)
    linha = json.load(open(linha_arq, encoding='utf-8')) if linha_arq else {'sons': []}
    dur = duracao or max(linha.get('duracao', 0), len(voz) / SR)
    n = int(dur * SR)
    voz = np.pad(voz, (0, max(0, n - len(voz))))[:n]
    efeitos = np.zeros(n, np.float32)
    faltando = set()
    for som in linha.get('sons', []):
        arq = os.path.join(pasta_sfx, som['som'] + '.wav')
        if not os.path.exists(arq):
            faltando.add(som['som']); continue
        x = ler(arq) * float(som.get('ganho', 1))
        if som.get('dur'):
            m = int(som['dur'] * SR); x = x[:m] if len(x) >= m else np.tile(x, m // len(x) + 1)[:m]
            x = x * np.minimum(1, np.minimum(np.arange(len(x)), len(x) - np.arange(len(x))) / (0.25 * SR))
        i = int(som['t'] * SR)
        if i < n:
            efeitos[i:i + len(x)] += x[:n - i]
    if faltando:
        print('  aviso: sons sem arquivo:', ', '.join(sorted(faltando)))
    mix = voz * 1.0 + efeitos * 0.55
    if trilha and trilha != 'nenhuma':
        t = ler(os.path.join(pasta_sfx, f'trilha_{trilha}.wav'))
        t = np.tile(t, n // len(t) + 1)[:n]
        ev = envelope(voz); limiar = max(1e-4, np.percentile(ev[ev > 1e-4], 60) if np.any(ev > 1e-4) else 1e-3)
        ganho = 1 - 0.7 * np.clip(ev / limiar, 0, 1)            # ducking: até −10 dB com a voz
        mix += t * 0.28 * ganho
    pre = saida + '.pre.wav'
    wavfile.write(pre, SR, np.clip(mix, -1, 1).astype(np.float32))
    # ganho + limitador, medindo e corrigindo até cair em −14 LUFS (o loudnorm sozinho falha com picos fortes de impacto)
    ganho = -14.0 - float(medir_lufs(pre)['input_i'])
    for _ in range(4):
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af',
                               f'volume={ganho:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=false', '-ar', str(SR), '-ac', '2', saida])
        erro = -14.0 - float(medir_lufs(saida)['input_i'])
        if abs(erro) < 0.15:
            break
        ganho += erro
    os.remove(pre)
    final = medir_lufs(saida)
    lufs = float(final['input_i'])
    print(f'Mix: {dur:.2f} s, {len(linha.get("sons", []))} efeitos, trilha {trilha} → {saida}  ({lufs:.2f} LUFS, pico {final["input_tp"]} dBTP)')
    return lufs


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--voz', required=True); ap.add_argument('--linha'); ap.add_argument('--saida', required=True)
    ap.add_argument('--sfx', default='audio/sfx'); ap.add_argument('--trilha', default='tensa'); ap.add_argument('--duracao', type=float)
    a = ap.parse_args()
    if not os.path.exists(os.path.join(a.sfx, 'impacto.wav')):
        subprocess.check_call([sys.executable, os.path.join(os.path.dirname(__file__), 'sfx.py'), a.sfx])
    lufs = mixar(a.voz, a.linha, a.saida, a.sfx, a.trilha, a.duracao)
    if not -14.5 <= lufs <= -13.5:
        sys.exit(f'Volume fora do alvo: {lufs:.2f} LUFS (esperado entre -14,5 e -13,5)')

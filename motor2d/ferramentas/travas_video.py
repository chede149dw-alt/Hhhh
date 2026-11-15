"""Travas que olham o vídeo pronto (chamado por motor/travas.js). Imprime um JSON com o resultado.
Uso: python3 ferramentas/travas_video.py <video.mp4>

- parado:     trecho de mais de 1 s sem a imagem mudar (ffmpeg freezedetect)
- pisca:      quadro que aparece por 1 quadro só e some (os quadrados pretos/brancos do aprendizado)
- estourado:  quadro com muito pixel quase branco (brilho que estourou e virou mancha)
- volume:     volume final medido (alvo -16 LUFS, pico até -1 dB)
"""
import json, re, subprocess, sys
import numpy as np

arq = sys.argv[1]
W, H = 108, 192          # quadro reduzido (1/10) para medir rápido
GRADE = (6, 12)          # pisca: a imagem é dividida em 6x12 quadrados


def rodar(cmd):
    return subprocess.run(cmd, capture_output=True, text=False)


# ---------- quadros reduzidos ----------
crus = rodar(['ffmpeg', '-v', 'error', '-i', arq, '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']).stdout
q = np.frombuffer(crus, np.uint8).reshape(-1, H, W, 3).astype(np.int16)
fps = 30.0
cinza = q.mean(axis=3)

# ---------- pisca ----------
# quadro t é "pisca" quando, num pedaço da imagem, ele fica FORA do intervalo entre o quadro antes e o depois
# (mais claro que os dois ou mais escuro que os dois) por mais de 45 tons: a coisa apareceu por 1 quadro e sumiu.
# Calibragem (15/11/2026): o episódio aprovado chega a 38,9 no movimento normal; um quadrado branco plantado dá 99,7.
# Ponto cego conhecido: quadrado escuro sobre área escura muda pouco e passa (também é o mais difícil de ver).
gy, gx = GRADE
ch, cw = H // gy, W // gx
blocos = cinza[:, :gy * ch, :gx * cw].reshape(len(cinza), gy, ch, gx, cw).mean(axis=(2, 4))
piscas = []
for t in range(1, len(blocos) - 1):
    a, b, c = blocos[t - 1], blocos[t], blocos[t + 1]
    fora = np.maximum(np.minimum(a, c) - b, b - np.maximum(a, c))
    n = int((fora > 45).sum())
    if n >= 1:
        piscas.append({'quadro': t, 'tempo': round(t / fps, 2), 'quadrados': n})

# ---------- estourado ----------
quase_branco = (q.min(axis=3) >= 245).mean(axis=(1, 2)) * 100
pior = int(np.argmax(quase_branco))
estourados = [{'quadro': int(t), 'tempo': round(t / fps, 2), 'pct': round(float(quase_branco[t]), 1)}
              for t in np.nonzero(quase_branco > 6.0)[0]]

# ---------- parado ----------
fd = rodar(['ffmpeg', '-v', 'info', '-i', arq, '-vf', 'freezedetect=n=-60dB:d=1', '-map', '0:v', '-f', 'null', '-']).stderr.decode('utf8', 'ignore')
parados = [{'inicio': float(a), 'duracao': float(b)} for a, b in re.findall(r'freeze_start: ([\d.]+).*?freeze_duration: ([\d.]+)', fd, re.S)]

# ---------- volume ----------
lo = rodar(['ffmpeg', '-v', 'info', '-i', arq, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr.decode('utf8', 'ignore')
resumo = lo[lo.rfind('Summary'):]
mI = re.search(r'I:\s+(-?[\d.]+) LUFS', resumo)
mP = re.search(r'Peak:\s+(-?[\d.]+) dBFS', resumo)
dur = float(rodar(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).stdout.decode().strip())

print(json.dumps({
    'duracao': round(dur, 2),
    'quadros': int(len(q)),
    'pisca': piscas,
    'estourado': estourados,
    'estourado_pior': {'tempo': round(pior / fps, 2), 'pct': round(float(quase_branco[pior]), 1)},
    'parado': parados,
    'volume': {'lufs': float(mI.group(1)) if mI else None, 'pico': float(mP.group(1)) if mP else None},
}))

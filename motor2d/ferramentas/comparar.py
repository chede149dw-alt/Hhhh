"""Compara duas pastas de quadros (PNG com o mesmo nome) e diz quanto mudou.
Uso: python3 ferramentas/comparar.py <pasta-antes> <pasta-depois> [saida-lado-a-lado.png]
Um pixel conta como diferente quando algum canal muda mais de 8 (em 255).
Se der saída, monta uma imagem com os quadros que mais mudaram: antes | depois | onde mudou.
"""
import sys, os
import numpy as np
from PIL import Image

a_dir, b_dir = sys.argv[1], sys.argv[2]
saida = sys.argv[3] if len(sys.argv) > 3 else None
nomes = sorted(n for n in os.listdir(a_dir) if n.endswith('.png'))
faltando = [n for n in nomes if not os.path.exists(os.path.join(b_dir, n))]
res = []
for n in nomes:
    if n in faltando:
        continue
    a = np.asarray(Image.open(os.path.join(a_dir, n)).convert('RGB')).astype(np.int16)
    b = np.asarray(Image.open(os.path.join(b_dir, n)).convert('RGB')).astype(np.int16)
    if a.shape != b.shape:
        res.append((n, 100.0, None)); continue
    m = (np.abs(a - b).max(axis=2) > 8)
    res.append((n, 100.0 * m.mean(), m))
iguais = sum(1 for _, p, _ in res if p == 0)
print(f'{len(res)} quadros comparados: {iguais} idênticos, {len(res) - iguais} com diferença.')
if faltando:
    print('Faltando na segunda pasta:', ', '.join(faltando))
pior = sorted(res, key=lambda r: -r[1])
for n, p, _ in pior[:8]:
    if p > 0:
        print(f'  {n}: {p:.3f}% dos pixels mudaram')
if saida and pior and pior[0][1] > 0:
    linhas = []
    for n, p, m in pior[:4]:
        if p == 0: break
        a = Image.open(os.path.join(a_dir, n)).convert('RGB'); b = Image.open(os.path.join(b_dir, n)).convert('RGB')
        d = Image.fromarray((np.asarray(a) * 0.35).astype(np.uint8))
        if m is not None:
            arr = np.asarray(d).copy(); arr[m] = [255, 60, 60]; d = Image.fromarray(arr)
        w, h = a.size
        lin = Image.new('RGB', (w * 3, h)); lin.paste(a, (0, 0)); lin.paste(b, (w, 0)); lin.paste(d, (w * 2, 0))
        linhas.append(lin.resize((w * 3 // 4, h // 4)))
    img = Image.new('RGB', (linhas[0].width, sum(l.height for l in linhas)))
    y = 0
    for l in linhas: img.paste(l, (0, y)); y += l.height
    img.save(saida); print('Lado a lado:', saida)
sys.exit(0 if iguais == len(res) and not faltando else 1)

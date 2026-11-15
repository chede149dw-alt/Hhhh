# Mixagem final da Parte 2: vídeo renderizado (vozes + sons do motor) + efeitos de arquivo + trilha com "ducking"
# (a música abaixa sozinha quando alguém fala). Uso: python3 roteiros/terra/ep02-mix.py <entrada.mp4> <saida.mp4>
import json, os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
rot = json.load(open(os.path.join(AQUI, 'ep02.json')))
ini, t = {}, 0.0
for p in rot['planos']: ini[p['id']] = t; t += p['duracao']
S = lambda n: os.path.join(RAIZ, 'audio', 'sfx', n + '.wav')
efeitos = [  # (arquivo, segundo, volume)
    ('terremoto', ini['capa'] + 0.05, 0.5),
    ('terra', ini['acordou'] + 0.1, 0.35),
    ('rachar', ini['abre'] + 0.3, 0.9), ('terremoto', ini['abre'] + 0.6, 0.7), ('rachar', ini['abre'] + 1.6, 0.7),
    ('whoosh', ini['guardiao'], 0.6),
    ('terremoto', ini['treme'] + 0.05, 1.0), ('terra', ini['treme'] + 0.3, 0.8),
    ('terra', ini['levanta'] + 0.1, 0.9), ('terremoto', ini['levanta'] + 0.5, 0.8),
    ('whoosh', ini['avanca'] + 0.6, 0.7),
    ('terra', ini['muro'] + 0.25, 0.9), ('impacto', ini['muro'] + 1.75, 1.0), ('rachar', ini['muro'] + 1.8, 1.0),
    ('whoosh', ini['manda'] + 0.35, 0.7), ('impacto', ini['manda'] + 0.75, 1.0), ('terra', ini['manda'] + 0.8, 0.8),
    ('impacto', ini['ajoelha'] + 0.9, 0.6),
    ('whoosh', ini['passos'] + 0.05, 0.9),
]
ent, filtros, mix = ['-i', sys.argv[1]], [], ''
for i, (n, s, v) in enumerate(efeitos):
    ent += ['-i', S(n)]; ms = int(s * 1000)
    filtros.append(f'[{i + 1}]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms},volume={v}[e{i}]'); mix += f'[e{i}]'
k = len(efeitos) + 1
ent += ['-i', os.path.join(RAIZ, 'audio', 'terra', 'ep02', 'trilha.wav')]
filtros.append('[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[voz][chave]')
filtros.append(f'[{k}]aresample=48000,volume=0.5,apad[mu]')
filtros.append('[mu][chave]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=500[mud]')
filtros.append(f'[voz]{mix}[mud]amix=inputs={len(efeitos) + 2}:normalize=0,atrim=0:{t:.3f},loudnorm=I=-16:TP=-1.5[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(filtros), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', sys.argv[2]], check=True)
print('Pronto:', sys.argv[2])

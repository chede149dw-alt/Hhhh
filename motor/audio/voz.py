#!/usr/bin/env python3
"""Narração com Edge TTS (grátis). Gera voz/fala_NN.mp3, words.json e voz.wav (falas posicionadas + tratadas).
Uso: python3 audio/voz.py <pasta do projeto> [--refazer]
- Cada fala usa a voz do personagem (roteiro.vozes). WordBoundary dá o instante de cada palavra.
- Pausas: 0,35 s entre falas do mesmo plano, 0,6 s entre planos (+ pausa_antes da fala, se houver).
- Tratamento: compressão + EQ leve em todas; a voz 'mae' fica grave, com eco e chiado (é a criatura imitando).
"""
import asyncio, json, os, ssl, subprocess, sys, hashlib
import edge_tts
import edge_tts.communicate as _c

CA = '/root/.ccr/ca-bundle.crt'   # proxy do ambiente na nuvem; numa máquina comum o padrão já funciona
if os.path.exists(CA):
    _c._SSL_CTX = ssl.create_default_context(cafile=CA)

PAUSA_FALA, PAUSA_PLANO, INICIO = 0.35, 0.6, 0.6
SR = 48000
TRATAMENTO = {
    'padrao': 'highpass=f=80,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=80',
    'mae': 'asetrate=48000*0.9,aresample=48000,atempo=1.11,highpass=f=70,lowpass=f=5200,'
           'aecho=0.7:0.6:55|140:0.35|0.22,acompressor=threshold=-22dB:ratio=4,volume=1.4',
}

def dur(arq):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).decode().strip())

async def sintetizar(texto, voz, arq_mp3):
    com = edge_tts.Communicate(texto, voz['voz'], rate=voz.get('velocidade', '+0%'), pitch=voz.get('tom', '+0Hz'), boundary='WordBoundary')
    palavras = []
    with open(arq_mp3, 'wb') as f:
        async for ch in com.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                palavras.append({'texto': ch['text'], 'ini': ch['offset'] / 1e7, 'fim': (ch['offset'] + ch['duration']) / 1e7})
    return palavras

def casar(tts, texto):
    """Casa as palavras do TTS com as do roteiro (mantém a pontuação do roteiro para as legendas)."""
    ws = texto.split()
    if len(tts) == len(ws):
        return [{**t, 'texto': w} for t, w in zip(tts, ws)]
    # TTS às vezes junta/separa palavras: distribui pelo número de letras dentro do intervalo falado
    ini, fim = tts[0]['ini'], tts[-1]['fim']
    pesos = [max(1, len(w)) for w in ws]; tot = sum(pesos); t = ini; out = []
    for w, p in zip(ws, pesos):
        d = (fim - ini) * p / tot; out.append({'texto': w, 'ini': t, 'fim': t + d * 0.92}); t += d
    return out

async def main(pasta, refazer):
    rot = json.load(open(os.path.join(pasta, 'roteiro.json')))
    os.makedirs(os.path.join(pasta, 'voz'), exist_ok=True)
    falas, palavras, trilhas = [], [], []
    t = INICIO
    for ip, pl in enumerate(rot['planos']):
        if ip > 0: t += PAUSA_PLANO
        for jf, f in enumerate(pl.get('falas', [])):
            if jf > 0: t += PAUSA_FALA
            t += f.get('pausa_antes', 0)
            voz = rot['vozes'][f['quem']]
            chave = hashlib.md5(json.dumps([f['texto'], voz]).encode()).hexdigest()[:8]
            base = os.path.join(pasta, 'voz', f'fala_{len(falas):02d}_{chave}')
            mp3, jsn = base + '.mp3', base + '.json'
            if refazer or not os.path.exists(jsn):
                tts = await sintetizar(f['texto'], voz, mp3)
                json.dump(tts, open(jsn, 'w'), ensure_ascii=False)
            tts = json.load(open(jsn))
            wav = base + '.wav'
            filtro = TRATAMENTO['mae' if f['quem'] == 'mae' else 'padrao']
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-af', filtro, '-ar', str(SR), '-ac', '1', wav], check=True)
            d = dur(wav)
            esc = 1.0 / 1.11 * (1 / 0.9) if f['quem'] == 'mae' else 1.0   # asetrate 0.9 + atempo 1.11 ≈ mesma duração
            ws = casar(tts, f['texto'])
            for w in ws:
                palavras.append({'i': len(palavras) + 1, 'texto': w['texto'], 'ini': round(t + w['ini'] * esc, 3), 'fim': round(t + w['fim'] * esc, 3),
                                 'fala': len(falas), 'plano': pl['id'], 'quem': f['quem']})
            falas.append({'indice': len(falas), 'plano': pl['id'], 'quem': f['quem'], 'tipo': f.get('tipo', 'fala'), 'texto': f['texto'],
                          'ini': round(t, 3), 'fim': round(t + d, 3), 'arquivo': os.path.relpath(wav, pasta)})
            trilhas.append((t, wav))
            t += d
    json.dump({'palavras': palavras, 'falas': falas, 'estimado': False}, open(os.path.join(pasta, 'words.json'), 'w'), ensure_ascii=False, indent=1)
    # voz.wav: todas as falas nos seus instantes
    total = t + 3.0
    args = ['ffmpeg', '-v', 'error', '-y']
    for _, w in trilhas: args += ['-i', w]
    filtros = [f'[{i}]adelay={int(ti * 1000)}|{int(ti * 1000)}[a{i}]' for i, (ti, _) in enumerate(trilhas)]
    mix = ''.join(f'[a{i}]' for i in range(len(trilhas))) + f'amix=inputs={len(trilhas)}:normalize=0,apad=whole_dur={total}[v]'
    args += ['-filter_complex', ';'.join(filtros) + ';' + mix, '-map', '[v]', '-ar', str(SR), '-ac', '1', os.path.join(pasta, 'voz.wav')]
    subprocess.run(args, check=True)
    # sons feitos com voz (risada etc.): ficam em voz/<nome>.wav e a mixagem usa como efeito
    for nome, (quem, texto) in rot.get('sons_de_voz', {}).items():
        arq = os.path.join(pasta, 'voz', f'{nome}.wav')
        if refazer or not os.path.exists(arq):
            await sintetizar(texto, rot['vozes'][quem], arq + '.mp3')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq + '.mp3', '-af', TRATAMENTO['padrao'], '-ar', str(SR), '-ac', '1', arq], check=True)
    print(f'{len(falas)} falas, {len(palavras)} palavras, fala termina em {t:.2f} s')

if __name__ == '__main__':
    asyncio.run(main(os.path.abspath(sys.argv[1]), '--refazer' in sys.argv))

"""Narração com Edge TTS (prompt 8): uma fala por frase do roteiro, com o instante de cada palavra.

Uso: python3 motor/audio/narrar.py roteiros/<serie>/roteiro.json audio/<serie>/<ep>
Saída: <pasta>/narracao.wav (48 kHz mono) e <pasta>/words.json  [{i, texto, inicio, fim, frase}]
O words.json comanda os planos (motor/direcao) e as legendas.

Vozes (campo "voz" da frase): narrador → pt-BR-AntonioNeural (padrão), mae → pt-BR-FranciscaNeural,
ou o nome completo de uma voz Edge. "velocidade" (ex.: "+8%") e "tom" (ex.: "-2Hz") opcionais.
As falas ficam em cache (mesmo texto + voz = não chama o serviço de novo).
"""
import asyncio, hashlib, json, os, re, subprocess, sys, time

# o proxy do ambiente usa um certificado próprio: o edge_tts precisa conhecê-lo (antes de importar)
import certifi
_CA = os.environ.get('CA_BUNDLE_EDGE', '/root/.ccr/ca-bundle.crt')
if os.path.exists(_CA):
    certifi.where = lambda: _CA
import edge_tts  # noqa: E402

VOZES = {'narrador': 'pt-BR-AntonioNeural', 'mae': 'pt-BR-FranciscaNeural', 'lucas': 'pt-BR-AntonioNeural'}
SR = 48000


async def falar(texto, voz, saida_mp3, velocidade='+0%', tom='+0Hz'):
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    c = edge_tts.Communicate(texto, voz, rate=velocidade, pitch=tom, boundary='WordBoundary', proxy=proxy)
    palavras = []
    with open(saida_mp3, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                palavras.append({'texto': ch['text'], 'inicio': ch['offset'] / 1e7, 'fim': (ch['offset'] + ch['duration']) / 1e7})
    return palavras


def falar_com_tentativas(texto, voz, mp3, velocidade, tom):
    for i in range(4):
        try:
            return asyncio.run(falar(texto, voz, mp3, velocidade, tom))
        except Exception as e:  # rede instável: tenta de novo (2, 4, 8 s)
            if i == 3:
                raise
            print(f'  falha na voz ({e.__class__.__name__}), tentando de novo…')
            time.sleep(2 ** (i + 1))


def duracao(arq):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).decode())


def main(roteiro_arq, pasta):
    roteiro = json.load(open(roteiro_arq, encoding='utf-8'))
    cache = os.path.join(pasta, 'falas'); os.makedirs(cache, exist_ok=True)
    pedacos, palavras, t = [], [], float(roteiro.get('inicioNarracao', 0.25))
    for k, fr in enumerate(roteiro['frases']):
        voz = VOZES.get(fr.get('voz', 'narrador'), fr.get('voz', 'pt-BR-AntonioNeural'))
        vel, tom = fr.get('velocidade', roteiro.get('velocidade', '+6%')), fr.get('tom', '+0Hz')
        chave = hashlib.md5(f'{fr["texto"]}|{voz}|{vel}|{tom}'.encode()).hexdigest()[:12]
        mp3, js, wav = (os.path.join(cache, f'{k:02d}-{chave}.{e}') for e in ('mp3', 'json', 'wav'))
        if not (os.path.exists(mp3) and os.path.exists(js)):
            print(f'  voz {k + 1}/{len(roteiro["frases"])}: {fr["texto"]}')
            ws = falar_com_tentativas(fr['texto'], voz, mp3, vel, tom)
            json.dump(ws, open(js, 'w'))
        ws = json.load(open(js))
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), wav])
        # pontuação do roteiro de volta nas palavras (o serviço devolve sem vírgula/ponto)
        toks = fr['texto'].split()
        if len(toks) == len(ws):
            for w, tk in zip(ws, toks):
                w['texto'] = tk
        for w in ws:
            palavras.append({'i': len(palavras), 'texto': w['texto'], 'inicio': round(t + w['inicio'], 3), 'fim': round(t + w['fim'], 3), 'frase': k})
        dur = ws[-1]['fim'] + 0.05 if ws else duracao(wav)
        pedacos.append((t, wav, dur))
        pausa = 0.32 if re.search(r'[.!?]$', fr['texto'].strip()) else 0.18
        t += dur + pausa + float(fr.get('pausaDepois', 0))
    # junta as falas na posição certa (silêncio entre elas)
    lista = os.path.join(pasta, 'narracao.txt')
    filtros, entradas = [], []
    for i, (ini, wav, dur) in enumerate(pedacos):
        entradas += ['-i', wav]
        filtros.append(f'[{i}]atrim=0:{dur:.3f},adelay={int(ini * 1000)}|{int(ini * 1000)}[a{i}]')
    filtros.append(''.join(f'[a{i}]' for i in range(len(pedacos))) + f'amix=inputs={len(pedacos)}:normalize=0,apad,atrim=0:{t:.3f}[s]')
    saida = os.path.join(pasta, 'narracao.wav')
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex', ';'.join(filtros), '-map', '[s]', '-ac', '1', '-ar', str(SR), saida])
    json.dump(palavras, open(os.path.join(pasta, 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if os.path.exists(lista):
        os.remove(lista)
    print(f'Narração: {t:.2f} s, {len(palavras)} palavras → {saida}')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    os.makedirs(sys.argv[2], exist_ok=True)
    main(sys.argv[1], sys.argv[2])

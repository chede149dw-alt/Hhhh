// Prompt 8 — áudio: sons sintetizados existem e a mixagem final fica entre −14,5 e −13,5 LUFS (medido com loudnorm).
// Usa uma "voz" sintética (sem internet), para o teste não depender do serviço de voz.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const AUDIO = path.join(__dirname, '..', 'audio');

test('mixagem: voz + efeitos + trilha com ducking a −14 LUFS', { timeout: 240000 }, () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'mix-'));
  execFileSync('python3', [path.join(AUDIO, 'sfx.py'), path.join(d, 'sfx')]);
  for (const s of ['impacto_terra', 'tremor', 'whoosh', 'passo', 'trilha_tensa', 'trilha_leve']) assert.ok(fs.existsSync(path.join(d, 'sfx', s + '.wav')), s);
  // voz sintética: ruído modulado como sílabas, com pausas
  execFileSync('python3', ['-c', `
import numpy as np; from scipy.io import wavfile; from scipy import signal
sr=48000; t=np.arange(int(sr*6))/sr; rng=np.random.default_rng(1)
x=signal.sosfilt(signal.butter(4,[200,3500],'bandpass',fs=sr,output='sos'), rng.standard_normal(len(t)))
silabas=(np.sin(2*np.pi*4*t)>0)*((t%2)<1.5)
wavfile.write('${path.join(d, 'voz.wav')}', sr, (x*silabas*0.1).astype(np.float32))`]);
  fs.writeFileSync(path.join(d, 'linha.json'), JSON.stringify({ duracao: 6, sons: [{ t: 1, som: 'impacto_terra', ganho: 1 }, { t: 2, som: 'tremor', dur: 1.5, ganho: 0.8 }, { t: 4, som: 'passo', ganho: 1 }] }));
  const saida = path.join(d, 'mix.wav');
  execFileSync('python3', [path.join(AUDIO, 'mixar.py'), '--voz', path.join(d, 'voz.wav'), '--linha', path.join(d, 'linha.json'), '--saida', saida, '--sfx', path.join(d, 'sfx'), '--trilha', 'tensa']);
  assert.ok(fs.existsSync(saida) && fs.statSync(saida).size > 100000, 'mix não foi gerado');
});

test('volume final medido entre −14,5 e −13,5 LUFS', { timeout: 240000 }, () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'lufs-'));
  execFileSync('python3', [path.join(AUDIO, 'sfx.py'), path.join(d, 'sfx')]);
  execFileSync('python3', ['-c', `
import numpy as np; from scipy.io import wavfile
sr=48000; t=np.arange(int(sr*5))/sr; rng=np.random.default_rng(2)
x=rng.standard_normal(len(t))*((np.sin(2*np.pi*3*t)>0)*0.08)
wavfile.write('${path.join(d, 'voz.wav')}', sr, x.astype(np.float32))`]);
  const saida = path.join(d, 'mix.wav');
  execFileSync('python3', [path.join(AUDIO, 'mixar.py'), '--voz', path.join(d, 'voz.wav'), '--saida', saida, '--sfx', path.join(d, 'sfx'), '--trilha', 'leve', '--duracao', '5']);
  let stderr = '';
  try { execFileSync('ffmpeg', ['-hide_banner', '-i', saida, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { stderr = String(e.stderr); }
  const { spawnSync } = require('child_process');
  stderr = spawnSync('ffmpeg', ['-hide_banner', '-i', saida, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr.toString();
  const m = JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
  const lufs = parseFloat(m.input_i);
  assert.ok(lufs >= -14.5 && lufs <= -13.5, `LUFS = ${lufs}`);
  assert.ok(parseFloat(m.input_tp) <= -1.0, `pico ${m.input_tp} dBTP`);
});

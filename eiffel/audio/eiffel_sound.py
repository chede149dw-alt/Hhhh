# Original soundtrack for the Eiffel short: a little Paris waltz (synthesized, own melody) + effects keyed to the
# picture timeline (story.ts) and the narration (public/eiffel/words.json). Output: out/mix.wav (48 kHz stereo, 33.0 s).
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from dsp import SR, ns, tt, rng, lp, hp, bp, fades, write_wav, read_wav, integrated, dbg, modal
from instruments import m2f, pluck, glock, pad, snare, cymbal, timpani, triangle

ROOT = os.path.join(os.path.dirname(__file__), "..")
DUR = 990 / 30
N = ns(DUR)
R = rng(7)
music = np.zeros((2, N)); fx = np.zeros((2, N))


def put(buf, x, t, g=1.0, p=0.0):
    x = np.asarray(x)
    if x.ndim == 1:
        th = (p + 1) * np.pi / 4
        x = np.stack([x * np.cos(th) * 1.414, x * np.sin(th) * 1.414])
    i = ns(t)
    if i >= N: return
    n = min(x.shape[1], N - i)
    buf[:, i:i + n] += g * x[:, :n]


# ---------------- music: 3/4 waltz, 150 bpm (beat 0.4 s, bar 1.2 s) ----------------
BEAT = 0.4
C, F, G, Am, Dm, E = [48, 52, 55], [53, 57, 60], [55, 59, 62], [57, 60, 64], [50, 53, 57], [52, 56, 59]
# (start s, end s, chords per bar, melody on?, level)
SECTIONS = [
    (0.0, 5.5, [C, G, C, F], True, 1.0),
    (5.5, 11.9, [C, F, G, C], True, 1.0),
    (11.9, 18.2, [Am, Dm, E, Am], False, 0.8),
    (20.9, 28.0, [F, C, G, C], True, 1.0),
    (29.7, DUR, [C, F, G, C], True, 1.15),
]
MEL = [[76, 74, 72], [71, 72, 74], [76, 79, 77], [76, 74, 72], [72, 76, 79], [81, 79, 77], [76, 74, 76], [72, 0, 0]]  # own tune
for a, b, chords, mel, lev in SECTIONS:
    t, bar = a, 0
    while t < b - 0.05:
        ch = chords[bar % len(chords)]
        put(music, pluck(m2f(ch[0] - 12), 0.9, R, 0.9), t, 0.55 * lev, -0.2)          # oom
        for k in (1, 2):                                                                  # pah pah
            if t + k * BEAT < b:
                for m in ch: put(music, pluck(m2f(m), 0.45, R, 0.5, bright=0.7), t + k * BEAT, 0.22 * lev, 0.25)
        if mel:
            for k, m in enumerate(MEL[bar % len(MEL)]):
                if m and t + k * BEAT < b: put(music, glock(m2f(m), 0.6, R, 1.2), t + k * BEAT, 0.16 * lev, 0.1)
        bar += 1; t += 3 * BEAT
# held pads under each section, a low drone for "Por azar"
for a, b, chords, _, lev in SECTIONS:
    put(music, pad([m2f(m) for m in chords[0]], b - a, 0.35, R, att=0.4, rel=0.4), a, 0.05 * lev)
put(music, pad([m2f(45), m2f(52)], 2.7, 0.4, R, att=0.3, rel=0.5), 18.2, 0.08)
# build: snare crescendo into "Trezentos metros", cymbal on it
for k in range(int((9.49 - 7.83) * 16)):
    tk = 7.83 + k / 16; put(music, snare(0.3 + 0.6 * k / 26, R, buzz=True), tk, 0.12 + 0.12 * k / 26)
put(music, cymbal(0.8, R), 9.47, 0.35)
put(music, cymbal(0.7, R), 29.73, 0.3)
put(music, triangle(0.6, R), 21.0, 0.25)
# march for "exército": snare + bass drum on the beat
for k in range(int((29.7 - 28.0) / 0.25)):
    put(music, snare(0.7 if k % 2 == 0 else 0.45, R), 28.0 + k * 0.25, 0.22)
put(music, pluck(m2f(36), 1, R, 1.4) * 1.5, DUR - 1.4, 0.5)

# ---------------- effects ----------------
def whoosh(d=0.45):
    t = tt(d); e = np.sin(np.pi * t / d) ** 2
    return bp(R.standard_normal(len(t)), 300, 2500) * e * 0.6

def clank(f0=180):
    return modal(1.1, [(f0, 1.0, 0.35), (f0 * 2.76, 0.6, 0.18), (f0 * 5.4, 0.35, 0.08), (f0 * 8.9, 0.2, 0.04)], R) * 0.8

def crowd(d, boo=False, seed=0):
    r = rng(seed); t = tt(d); y = np.zeros(len(t))
    for k in range(10):
        f = r.uniform(180, 320) if boo else r.uniform(400, 900)
        am = 0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(2, 6) * t + r.uniform(0, 6))
        y += bp(r.standard_normal(len(t)), f * 0.8, f * 1.6) * am
    e = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.6)
    return lp(y, 2500 if boo else 6000) * e * 0.25

def beep(f=1400, d=0.09):
    t = tt(d); return np.sin(2 * np.pi * f * t) * np.minimum(1, (d - t) / 0.02) * 0.25

for t in [2.0 - 0.15, 5.5 - 0.2, 11.9 - 0.2, 18.2 - 0.2, 20.9 - 0.25, 23.4 - 0.2, 28.07 - 0.2, 29.73 - 0.2]:
    put(fx, whoosh(), t, 0.7)
for t, f in [(6.49, 150), (7.83, 120), (9.49, 95)]:
    put(fx, clank(f), t - 0.03, 1.0, -0.2)
for k in range(10):                                                     # rivets
    put(fx, clank(R.uniform(900, 1400)) * 0.3, 5.6 + k * 0.33, 0.6, R.uniform(-0.6, 0.6))
put(fx, crowd(4.0, boo=True, seed=3), 12.4, 1.0)
put(fx, timpani(m2f(38), 0.9, R), 20.15, 0.8)
for k in range(10):
    put(fx, beep(1400 if k % 2 == 0 else 1050), 22.44 + k * 0.6, 0.5, 0.3)
for k in range(7):
    put(fx, hp(R.standard_normal(ns(0.08)), 200) * np.exp(-tt(0.08) / 0.02) * 0.4, 28.07 + k * 0.25, 0.8)
put(fx, crowd(3.3, seed=5), 29.7, 1.2)

# ---------------- mix: voice untouched, music bed under it, effects -6 dB ----------------
v, sr = read_wav(os.path.join(ROOT, "public/eiffel/voice.wav"))
v = v.mean(axis=0)
voice = np.zeros((2, N)); vv = v[:N]; voice[:, :len(vv)] = vv
words = json.load(open(os.path.join(ROOT, "public/eiffel/words.json")))
duck = np.ones(N)
for w in words:
    duck[max(0, ns(w["s"] - 0.08)):ns(w["e"] + 0.12)] = dbg(-3)
duck = np.convolve(duck, np.ones(ns(0.08)) / ns(0.08), mode="same")
lv = integrated(voice)
def at_lufs(x, target):
    cur = integrated(x); return x * dbg(target - cur)
music = at_lufs(music, lv - 13 + 3) * duck
fx = at_lufs(fx, lv - 12 - 6)
mix = voice + music + fx
pk = np.max(np.abs(mix))
if pk > 0.95: mix *= 0.95 / pk
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
write_wav(os.path.join(ROOT, "out/mix.wav"), mix)
print("voice LUFS", round(lv, 1), "peak", round(pk, 2), "dur", mix.shape[1] / SR)

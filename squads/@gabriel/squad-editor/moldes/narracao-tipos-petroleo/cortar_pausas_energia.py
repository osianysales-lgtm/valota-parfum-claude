# Corta pausas longas pelo SILÊNCIO REAL do áudio (volume), não pelos tempos do ElevenLabs.
# Motivo (v56, 18/11/2026): os tempos por palavra do ElevenLabs chegam a vir 0,25–0,7 s ATRASADOS em relação ao som,
# e o cortar_pausas.py (que corta em "início da palavra − 0,08 s") comia o começo da palavra depois da pausa ("E pra fechar" → "fechar").
# Uso: VEL=1.75 python3 moldes/narracao-tipos-petroleo/cortar_pausas_energia.py output/vN/
# Entrada: narracao_1x.mp3 + narracao_1x_palavras.json + roteiro.txt (mesmo nº de palavras)
# Saída: narracao_cortada.wav, narracao_175.wav (ou _165 etc.), palavras_1x.json (tempos remapeados)
import json, sys, subprocess, os, struct
P = sys.argv[1].rstrip('/') + '/'; VEL = float(os.environ.get('VEL', '1.75'))
FF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg')
MIN_SIL = float(os.environ.get('MIN_SIL', '0.45')); MANTER = float(os.environ.get('MANTER', '0.15'))   # silêncio ≥ MIN_SIL vira 2 × MANTER
raw = subprocess.run([FF, '-v', 'error', '-i', P + 'narracao_1x.mp3', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
n = len(raw) // 2; s = struct.unpack('<%dh' % n, raw); w = 160
E = [(sum(x * x for x in s[i * w:(i + 1) * w]) / w) ** .5 for i in range(n // w)]
ref = sorted(E)[int(len(E) * 0.95)]; LIM = max(120, ref * 0.035)
runs = []; i = 0
while i < len(E):
    if E[i] < LIM:
        j = i
        while j < len(E) and E[j] < LIM: j += 1
        if (j - i) / 100 >= MIN_SIL and i > 0 and j < len(E): runs.append((i / 100, j / 100))
        i = j
    else: i += 1
dur = len(E) / 100
segs = []; a = 0.0
for r0, r1 in runs: segs.append((a, r0 + MANTER)); a = r1 - MANTER
segs.append((a, dur))
def mapa(t):
    acc = 0.0
    for s0, s1 in segs:
        if t <= s1: return acc + max(0.0, t - s0)
        acc += s1 - s0
    return acc
W = json.load(open(P + 'narracao_1x_palavras.json'))['palavras']
ROT = open(P + 'roteiro.txt').read().split()
assert len(ROT) == len(W), f'roteiro {len(ROT)} x voz {len(W)} palavras'
out = [{'word': ROT[k], 'voz': x['word'], 'start': round(mapa(x['start']), 3), 'end': round(mapa(x['end']), 3)} for k, x in enumerate(W)]
json.dump({'palavras': out}, open(P + 'palavras_1x.json', 'w'), ensure_ascii=False, indent=0)
filt = ''.join(f'[0:a]atrim={s0:.3f}:{s1:.3f},asetpts=PTS-STARTPTS[a{k}];' for k, (s0, s1) in enumerate(segs))
filt += ''.join(f'[a{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1[c]'
subprocess.run([FF, '-y', '-v', 'error', '-i', P + 'narracao_1x.mp3', '-filter_complex', filt, '-map', '[c]', '-ar', '48000', '-ac', '2', P + 'narracao_cortada.wav'], check=True)
SUF = str(int(round(VEL * 100)))
subprocess.run([FF, '-y', '-v', 'error', '-i', P + 'narracao_cortada.wav', '-af', f'atempo={VEL}', '-ar', '48000', '-ac', '2', P + f'narracao_{SUF}.wav'], check=True)
tot = sum(s1 - s0 for s0, s1 in segs)
print(f'limiar {LIM:.0f} · pausas cortadas: {len(runs)} · 1x {dur:.2f}s → {tot:.2f}s · a {VEL}x ≈ {tot/VEL:.2f}s')

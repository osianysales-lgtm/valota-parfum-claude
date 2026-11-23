# Corta pausas longas da narração 1x usando os tempos do ElevenLabs (sem numpy/whisper)
# Uso: python3 moldes/narracao-limpo-creme/cortar_pausas.py output/vN/  [VEL=1.75]
# Entrada: narracao_1x.mp3 + narracao_1x_palavras.json + roteiro.txt (grafia da tela)
# Saída: narracao_cortada.wav, palavras_1x.json (word = grafia do roteiro, voz = palavra falada, tempos já cortados), narracao_175.wav
import json, sys, subprocess, os
P = sys.argv[1].rstrip('/') + '/'; VEL = float(os.environ.get('VEL', '1.75'))
FF = os.path.join(os.path.dirname(__file__), '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg')
W = json.load(open(P + 'narracao_1x_palavras.json'))['palavras']
ROT = open(P + 'roteiro.txt').read().split()
assert len(ROT) == len(W), f'roteiro {len(ROT)} x voz {len(W)} palavras'
MAXP, MARG = 0.26, 0.08
segs = []; a = 0.0
for i in range(len(W) - 1):
    gap = W[i + 1]['start'] - W[i]['end']
    if gap > MAXP:
        segs.append((a, W[i]['end'] + MARG)); a = W[i + 1]['start'] - MARG
fim = W[-1]['end'] + 0.3; segs.append((a, fim))
# remapear tempos
out = []; acc = 0.0; si = 0
def mapa(t):
    acc = 0.0
    for s, e in segs:
        if t <= e: return acc + max(0.0, t - s)
        acc += e - s
    return acc
for i, w in enumerate(W):
    out.append({'word': ROT[i], 'voz': w['word'], 'start': round(mapa(w['start']), 3), 'end': round(mapa(w['end']), 3)})
json.dump({'palavras': out}, open(P + 'palavras_1x.json', 'w'), ensure_ascii=False, indent=0)
filt = ''.join(f'[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS[a{k}];' for k, (s, e) in enumerate(segs))
filt += ''.join(f'[a{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1[c]'
subprocess.run([FF, '-y', '-v', 'error', '-i', P + 'narracao_1x.mp3', '-filter_complex', filt, '-map', '[c]', '-ar', '48000', '-ac', '2', P + 'narracao_cortada.wav'], check=True)
subprocess.run([FF, '-y', '-v', 'error', '-i', P + 'narracao_cortada.wav', '-af', f'atempo={VEL}', '-ar', '48000', '-ac', '2', P + 'narracao_175.wav'], check=True)
tot = sum(e - s for s, e in segs)
print(f'pausas cortadas: {len(segs)-1} · 1x {W[-1]["end"]:.2f}s → {tot:.2f}s · a {VEL}x ≈ {tot/VEL:.2f}s')

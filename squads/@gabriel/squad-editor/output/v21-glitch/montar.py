# Corta ~/Downloads/glitch.MOV conforme segmentos.json. Vídeo SEM espelhar (autorotate do iPhone mantido); áudio da versão limpa audio/c.wav (highpass 75 Hz + afftdn leve).
import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
FF = '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg'
segs = json.load(open('segmentos.json')); os.makedirs('cache', exist_ok=True)
SRC = os.path.expanduser('~/Downloads/glitch.MOV')
def corta(a):
    k, (s, e) = a
    out = f'cache/s{k:02d}.mov'
    nf = round((e - s) * 30); d = nf / 30
    vf = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p'
    af = f'afade=t=in:d=0.012,afade=t=out:st={d-0.015:.3f}:d=0.015,aresample=48000,apad,atrim=0:{d:.4f}'
    subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{s:.3f}', '-t', f'{d+0.5:.4f}', '-i', SRC,
        '-ss', f'{s:.3f}', '-t', f'{d+0.5:.4f}', '-i', 'audio/c.wav', '-t', f'{d:.4f}',
        '-map', '0:v:0', '-map', '1:a:0', '-vf', vf, '-af', af,
        '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-c:a', 'pcm_s16le', '-ac', '2', '-ar', '48000', out], check=True)
    return os.path.abspath(out)
outs = list(ThreadPoolExecutor(3).map(corta, enumerate(segs)))
open('cache/lista.txt', 'w').write('\n'.join(f"file '{o}'" for o in outs))
subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'cache/lista.txt', '-c:v', 'copy', '-c:a', 'pcm_s16le', 'cache/cortado.mov'], check=True)
subprocess.run([FF, '-v', 'error', '-y', '-i', 'cache/cortado.mov', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', 'cortado.mp4'], check=True)
subprocess.run([FF, '-v', 'error', '-y', '-i', 'cache/cortado.mov', '-vn', '-ac', '1', '-ar', '16000', 'audio/cortado.wav'], check=True)
print('ok', len(segs))

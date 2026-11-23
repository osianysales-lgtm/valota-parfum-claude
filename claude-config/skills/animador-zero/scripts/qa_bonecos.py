#!/usr/bin/env python3
"""QA obrigatorio dos bonecos ANTES do render (22/11/2026, depois de render de 2h refeito).

Uso: python3 qa_bonecos.py <projeto> [tempos extras...]

1. Tira 1 quadro no MEIO de cada corte (cuts do roteiro.js) + nos tempos extras
   (use: fim de cada caminhada do mov, momentos em que os dois ficam perto, acoes com objeto).
2. Mede o brilho (YAVG) de cada quadro. Brilho fora de mediana +-12 = PISCA no corte -> ajustar
   (quarto: quarto.expShot { PLANO: fator }). Ela chama diferenca de brilho entre cortes de "luz piscando".
3. Monta previa/qa.jpg com tempo, plano e brilho em cada quadro: OLHAR TODOS e conferir:
   - ninguem atravessa / encosta / entrelaca braco com ninguem (em pe E sentado)
   - nenhum plano mostra so ombro, nuca, braco ou parede sem contexto (camera dentro/atras de boneco ou movel)
   - objeto citado na fala aparece
"""
import os, re, subprocess, sys, statistics

proj = os.path.abspath(sys.argv[1])
extras = [float(x) for x in sys.argv[2:]]
motor = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'motor')
rot = open(os.path.join(proj, 'roteiro.js')).read()
dur = float(re.search(r'DUR\s*=\s*([\d.]+)', open(os.path.join(proj, 'tempos.js')).read()).group(1))
bloco = rot[rot.index('cuts:'):]
bloco = bloco[:bloco.index(']],') + 2] if ']],' in bloco else bloco
cuts = [(float(t), n) for t, n in re.findall(r"\[\s*([\d.]+)\s*,\s*'([A-Z0-9]+)'\s*\]", bloco)]
cuts.sort()
pts = []
for i, (t, n) in enumerate(cuts):
    t1 = cuts[i + 1][0] if i + 1 < len(cuts) else dur
    pts.append((round((t + t1) / 2, 2), n))
for e in extras:
    n = [c for c in cuts if c[0] <= e]
    pts.append((e, n[-1][1] if n else '?'))
pts.sort()
subprocess.run(['node', 'render.mjs', proj, 'still', *[f'{t:.2f}' for t, _ in pts]], cwd=motor, check=True, stdout=subprocess.DEVNULL)

def yavg(f):
    o = subprocess.run(['ffmpeg', '-v', 'info', '-i', f, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.search(r'YAVG=([\d.]+)', o).group(1))

prev = os.path.join(proj, 'previa'); tmp = os.path.join(prev, 'qa_tmp'); os.makedirs(tmp, exist_ok=True)
for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
ys = []
for k, (t, n) in enumerate(pts):
    f = os.path.join(prev, f'quadro_{t:06.2f}.jpg'); y = yavg(f); ys.append(y)
med = statistics.median(ys)
font = '/System/Library/Fonts/Supplemental/Arial.ttf'
for k, ((t, n), y) in enumerate(zip(pts, ys)):
    ruim = abs(y - med) > 12
    cor = 'red' if ruim else 'yellow'
    print(f'{t:7.2f} {n:7s} Y{y:5.1f}' + ('   <-- PISCA (ajustar expShot)' if ruim else ''))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(prev, f'quadro_{t:06.2f}.jpg'), '-vf',
                    f"scale=216:-1,drawtext=fontfile={font}:text='{t:.1f} {n} Y{y:.0f}':fontsize=20:fontcolor={cor}:box=1:boxcolor=black:x=4:y=4",
                    os.path.join(tmp, f'{k:03d}.jpg')], check=True)
cols = 10; rows = -(-len(pts) // cols)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '1', '-i', os.path.join(tmp, '%03d.jpg'), '-vf', f'tile={cols}x{rows}', '-frames:v', '1', os.path.join(prev, 'qa.jpg')], check=True)
print(f'mediana Y{med:.1f} · folha: {os.path.join(prev, "qa.jpg")}')

# v22 Glitch parte 2 (veredito) — plano editorial no tempo do bruto ~/Downloads/vale.MOV; depois comprime pausas pela energia (mesmo método do v19/v21).
import wave, json, numpy as np, sys
PLANO = [
 (0.00, 29.60),   # tudo até "selo de Vale o frasco." (sem o "E aí" final). O 1º "Mykonos," (falso início) FICA: ela está mostrando o frasco pra câmera nesse trecho.
]
# mostrando frasco/caixa pra câmera: NUNCA encurtar (conferido em folhas/geral.jpg e folhas/removidos.jpg)
PROTEGER = [(2.0, 3.4), (4.4, 5.4), (7.2, 9.2), (17.9, 19.3), (20.1, 21.3), (24.2, 25.8), (26.3, 27.7), (28.9, 29.6), (16.9, 17.45), (18.2, 20.0), (22.9, 23.8)]  # 18.2–20.0 frasco erguido; 22.9–23.8 girando a tampa pra câmera
prot = lambda a, b: any(a < pe and b > ps for ps, pe in PROTEGER)
FR = 0.02; TH_DB = float(sys.argv[1]) if len(sys.argv) > 1 else -34; MAXP = 0.32; KEEP = 0.18
w = wave.open('audio/a.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
n = int(16000 * FR); m = len(a) // n
rms = np.sqrt((a[:m*n].reshape(m, n) ** 2).mean(1) + 1e-12); db = 20 * np.log10(rms); db = db - np.percentile(db, 99)
segs = []; rem = []
for s, e in PLANO:
    f0, f1 = int(s / FR), int(e / FR); low = db[f0:f1] < TH_DB
    cur = s; k = 0; L = f1 - f0
    while k < L:
        if low[k]:
            j = k
            while j < L and low[j]: j += 1
            ts, te = (f0 + k) * FR, (f0 + j) * FR
            if te - ts > MAXP and k > 0 and j < L and not prot(ts, te):
                segs.append((round(cur, 3), round(ts + KEEP / 2, 3))); cur = te - KEEP / 2
                rem.append((round(ts + KEEP / 2, 3), round(te - KEEP / 2, 3)))
            k = j
        else: k += 1
    segs.append((round(cur, 3), round(e, 3)))
json.dump(segs, open('segmentos.json', 'w')); json.dump(rem, open('pausas_removidas.json', 'w'))
print(len(segs), 'trechos ·', round(sum(e - s for s, e in segs), 2), 's ·', len(rem), 'pausas encurtadas')
for x in rem: print(x, round(x[1]-x[0], 2))

# 2ª passada: buracos entre palavras > 0,45 s fora dos trechos protegidos (pega pausa com barulho de mão/embalagem)
W = json.load(open('audio/t.json')); GAP = 0.45; PAD0, PAD1 = 0.12, 0.10
SUSPENSE = (16.9, 17.4)  # respiro antes de "Vale o frasco" (fica)
cut2 = []
for x, y in zip(W, W[1:]):
    g0, g1 = x['end'] + PAD0, y['start'] - PAD1
    if y['start'] - x['end'] > GAP and g1 > g0 and not prot(g0, g1):
        if g0 < SUSPENSE[1] and g1 > SUSPENSE[0]: g1 = SUSPENSE[0]
        if g1 - g0 > 0.1: cut2.append((g0, g1))
out = []
for s, e in segs:
    pieces = [(s, e)]
    for c0, c1 in cut2:
        nxt = []
        for a0, a1 in pieces:
            if c1 <= a0 or c0 >= a1: nxt.append((a0, a1)); continue
            if c0 > a0 + 0.05: nxt.append((a0, c0))
            if c1 < a1 - 0.05: nxt.append((c1, a1))
            rem.append((round(max(a0, c0), 3), round(min(a1, c1), 3)))
        pieces = nxt
    out += [(round(a0, 3), round(a1, 3)) for a0, a1 in pieces if a1 - a0 > 0.06]
segs = out
json.dump(segs, open('segmentos.json', 'w')); json.dump(sorted(rem), open('pausas_removidas.json', 'w'))
print('2ª passada:', len(segs), 'trechos ·', round(sum(e - s for s, e in segs), 2), 's')
for c in cut2: print('  buraco', round(c[0], 2), round(c[1], 2))

# v21 Glitch (Mykonos) — plano editorial (início, fim) no tempo do bruto ~/Downloads/glitch.MOV; depois comprime pausas pela energia (mesmo método do v15/v19).
import wave, json, numpy as np, sys
PLANO = [
 (0.00, 8.30),     # "Chegou aqui um perfume Glitch, da marca Mykonos, é um perfume da Indonésia, que"
 (9.70, 16.22),    # "está muito hypado lá fora, né? E vamos abrir, será que vale o frasco?"
 (18.42, 29.70),   # "Vamos ver. Já ouvi muitas pessoas ... viralizado. Dizem que ele parece com,"
 (32.80, 33.74),   # "Aventus,"
 (35.62, 47.10),   # "com Creed Absolu, ó." + abre a caixa e mostra o frasco + "vamos ver se é tudo isso"
 (49.30, 51.80),   # pega a caixa + "Nossa, difícil de tirar."
 (53.90, 55.80),   # "Poxa, difícil mesmo."
 (58.00, 86.36),   # "Uma hora depois eu consegui tirar. Olha esse frasco." ... cheira, borrifa ... "Nossa,"
 (86.95, 109.15),  # "eu sinto o cheiro do abacaxi ... o abacaxi não tá tão forte,"
 (112.65, 124.15), # "não tem aquele esfumaçado forte ... Gente, que perfume bom, nossa, muito bom."
 (125.65, 130.40), # "eu acho, acho não. Dá pra usar de dia,"
 (132.15, 188.50), # "é aquele perfume versátil ... borrifador ... já vale. É, Mykonos ... E que frasco bonito. Depois eu vou trazer um vídeo falando qual foi a"
 (190.62, 198.30), # "projeção e fixação, passei ele e agora 1:50. Vamos ver até que horas ele vai durar. Vou tentar gravar o vídeo ainda hoje."
]
# cheirando / borrifando / mostrando frasco: NUNCA encurtar (conferido em folhas/g1..g8.jpg e folhas/removidos.jpg — cheirando o pulso em 84–86, 98, 100, 102, 108, 120, 128, 142)
PROTEGER = [(37.4, 44.7), (49.3, 51.0), (58.0, 64.3), (66.6, 75.3), (76.7, 86.3), (97.7, 98.8), (99.8, 100.3), (101.9, 102.7), (108.4, 109.2), (119.5, 120.7), (127.9, 129.0), (142.0, 143.0), (88.4, 90.9), (93.8, 95.4), (150.1, 161.0), (177.3, 186.0)]
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
tot = sum(e - s for s, e in segs)
json.dump(segs, open('segmentos.json', 'w')); json.dump(rem, open('pausas_removidas.json', 'w'))
print(len(segs), 'trechos ·', round(tot, 2), 's ·', len(rem), 'pausas encurtadas ·', round(sum(e-s for s,e in rem),2), 's')
for x in rem: print(x, round(x[1]-x[0], 2))

# 2ª passada: buracos entre palavras > 0,45 s fora dos trechos protegidos (pega pausa com barulho de embalagem, que a energia não vê)
W = json.load(open('audio/t.json')); GAP = 0.45; PAD0, PAD1 = 0.12, 0.10
cut2 = []
for x, y in zip(W, W[1:]):
    g0, g1 = x['end'] + PAD0, y['start'] - PAD1
    if y['start'] - x['end'] > GAP and g1 > g0 and not prot(g0, g1): cut2.append((g0, g1))
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

# v72 · máscara das MÃOS dela (pra mão ficar NA FRENTE dos frascos, regra "frasco nunca tampa o dedo")
# Uso: python maos.py <video> <ini> <fim> <saida_mascara.mkv> [--prev quadros_prev.raw]
# Lê o take 1080x1920 30 fps pelo ffmpeg (rgb24), acha pele (YCbCr) + o que se mexe e é claro
# (relógio/mão, comparando com a "placa" mediana do take), só na faixa dos frascos (Y0..Y1),
# limpa (abre/fecha), suaviza a borda e grava a máscara em cinza (ffv1) pro alphamerge.
import subprocess, sys, numpy as np

W, H = 1080, 1920
Y0, Y1 = 1120, 1720          # faixa onde ficam os frascos (com folga)

def ler(video, ini, fim):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ini), '-to', str(fim), '-i', video,
           '-vf', f'fps=30,scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (W * H * 3)
    return np.frombuffer(raw, np.uint8)[: n * W * H * 3].reshape(n, H, W, 3)

def caixa(m, r):
    # média em caixa (2r+1) via soma acumulada, 2D
    p = np.pad(m.astype(np.float32), r, mode='edge')
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)

def mascara(f, placa, y0=Y0):
    f = f.astype(np.float32)
    R, G, B = f[..., 0], f[..., 1], f[..., 2]
    Y = 0.299 * R + 0.587 * G + 0.114 * B
    Cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B
    Cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B
    pele = (Cr > 131) & (Cr < 180) & (Cb > 80) & (Cb < 130) & (Y > 40)   # inclui pele na sombra
    dif = np.abs(f - placa).max(-1)
    mexe = (dif > 38) & (Y > 85) & (np.abs(Cb - 128) < 14)              # relógio/metal que se mexe
    # madeira da borda da mesa: tom de pele, parada e embaixo (y > 1480) -> fora
    yy = np.arange(f.shape[0])[:, None] + y0
    madeira = (yy > 1480) & (dif < 22)
    m = ((pele | mexe) & ~madeira).astype(np.float32)
    m = (caixa(m, 3) > 0.5).astype(np.float32)    # tira pontinhos
    m = (caixa(m, 7) > 0.35).astype(np.float32)   # fecha tatuagem/buracos do braço
    m = (caixa(m, 3) > 0.6).astype(np.float32)    # devolve a borda pro lugar
    m = m * grandes(m)                             # só mão/braço
    m = tapar_buracos(m)
    return m

def tapar_buracos(m, f=4):
    # buraco = fundo que não encosta na borda da faixa (tatuagem no meio do braço)
    h, w = m.shape[0] // f, m.shape[1] // f
    p = m[:h * f, :w * f].reshape(h, f, w, f).min((1, 3)) > 0
    fora = np.zeros((h, w), bool); pilha = []
    for y in range(h):
        for x in (0, w - 1):
            if not p[y, x] and not fora[y, x]: fora[y, x] = True; pilha.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if not p[y, x] and not fora[y, x]: fora[y, x] = True; pilha.append((y, x))
    while pilha:
        y, x = pilha.pop()
        for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
            if 0 <= yy < h and 0 <= xx < w and not p[yy, xx] and not fora[yy, xx]:
                fora[yy, xx] = True; pilha.append((yy, xx))
    buraco = ~p & ~fora
    full = np.zeros(m.shape, bool); full[:h * f, :w * f] = np.repeat(np.repeat(buraco, f, 0), f, 1)
    return np.maximum(m, full.astype(np.float32))

def grandes(m, f=4, area=500):
    # rotula pedaços na máscara reduzida 1/f e mantém os de área >= area (em px reduzidos)
    h, w = m.shape[0] // f, m.shape[1] // f
    p = m[:h * f, :w * f].reshape(h, f, w, f).max((1, 3)) > 0
    lab = np.zeros((h, w), np.int32); ok = np.zeros(1, bool); n = 0
    manter = []
    for y0 in range(h):
        for x0 in np.nonzero(p[y0] & (lab[y0] == 0))[0]:
            if lab[y0, x0]: continue
            n += 1; pilha = [(y0, x0)]; lab[y0, x0] = n; cnt = 0
            while pilha:
                y, x = pilha.pop(); cnt += 1
                for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
                    if 0 <= yy < h and 0 <= xx < w and p[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; pilha.append((yy, xx))
            if cnt >= area: manter.append(n)
    k = np.isin(lab, manter)
    full = np.zeros(m.shape, np.float32)
    full[:h * f, :w * f] = np.repeat(np.repeat(k, f, 0), f, 1)
    return full



if __name__ == '__main__':
    video, ini, fim, saida = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
    fr = ler(video, ini, fim)
    faixa = fr[:, Y0:Y1]
    placa = np.median(faixa[::3], axis=0).astype(np.float32)
    out = np.zeros((len(fr), H, W), np.uint8)
    ms = [mascara(faixa[i], placa) for i in range(len(fr))]
    for i in range(len(fr)):
        a = ms[max(i - 1, 0)] * 0.25 + ms[i] * 0.5 + ms[min(i + 1, len(fr) - 1)] * 0.25   # sem tremer
        a = caixa((a > 0.5).astype(np.float32), 2)                                         # borda macia
        out[i, Y0:Y1] = np.clip(a * 255, 0, 255).astype(np.uint8)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}',
                            '-r', '30', '-i', '-', '-c:v', 'ffv1', saida], stdin=subprocess.PIPE)
    enc.stdin.write(out.tobytes()); enc.stdin.close(); enc.wait()
    print('ok', saida, len(fr), 'quadros', 'cobertura média %.1f%%' % (100 * (out[:, Y0:Y1] > 128).mean()))

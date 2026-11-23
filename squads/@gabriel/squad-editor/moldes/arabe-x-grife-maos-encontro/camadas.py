# v54 · separa cada imagem em 3 camadas: fundo limpo (sem mãos/frascos), lado esquerdo (mão + árabe) e lado direito (mão + grife).
# fundo limpo = a própria imagem fora do recorte + cenario_vazio.jpg (Gemini) dentro do buraco, com a cor ajustada à imagem.
# o buraco inclui o reflexo dos frascos na mesa (senão o reflexo ficaria parado enquanto o frasco anda).
# uso: <venv>/bin/python camadas.py   (lê imagens/NN-*.jpg, recortes/NN.png e cenario_vazio.jpg; grava camadas/)
import glob, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('camadas', exist_ok=True)
fs = sorted(glob.glob('imagens/0*.jpg'))
info = []
for f in fs:
    n = os.path.basename(f)[:2]
    im = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    H, W = im.shape[:2]
    m = np.asarray(Image.open(f'recortes/{n}.png').convert('RGBA'))[..., 3].astype(np.float32) / 255
    vz = np.asarray(Image.open('cenario_vazio.jpg').convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)
    sol = m > 0.08
    # reflexo: abaixo da base de cada coluna de frasco, até ~300 px (só onde já é mesa)
    bur = nd.binary_dilation(sol, iterations=24)
    ys, xs = np.where(sol)
    base = np.full(W, -1)
    for x in range(W):
        c = np.where(sol[:, x])[0]
        if len(c) and c.max() > H * 0.6: base[x] = c.max()
    for x in np.where(base > 0)[0]:
        bur[base[x]:min(H, base[x] + 330), x] = True
    bur = nd.binary_dilation(nd.binary_closing(bur, iterations=8), iterations=6)
    # cor do cenário vazio ajustada pela faixa em volta do buraco
    anel = nd.binary_dilation(bur, iterations=60) & ~bur
    for c in range(3):
        a, b = im[..., c][anel], vz[..., c][anel]
        vz[..., c] = (vz[..., c] - b.mean()) * (a.std() / max(b.std(), 1)) + a.mean()
    w = nd.gaussian_filter(bur.astype(np.float32), 14)[..., None]
    w = np.clip(w * 1.6, 0, 1)
    plate = im * (1 - w) + vz * w
    Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8)).save(f'camadas/{n}_fundo.jpg', quality=93)
    # divisão esquerda/direita: coluna com menos recorte entre os frascos
    rows = slice(int(H * 0.40), int(H * 0.80))
    col = m[rows].sum(0); x0, x1 = int(W * 0.38), int(W * 0.62)
    sx = x0 + int(np.argmin(col[x0:x1]))
    for lado, sel in (('esq', np.arange(W) < sx), ('dir', np.arange(W) >= sx)):
        a = m * sel[None, :]
        ys, xs = np.where(a > 0.02)
        y0, y1, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rgba = np.dstack([im, a * 255])[y0:y1, xa:xb]
        Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA').save(f'camadas/{n}_{lado}.png')
        info.append(dict(n=n, lado=lado, x=int(xa), y=int(y0), w=int(xb - xa), h=int(y1 - y0)))
    print(n, 'divisão x =', sx)
json.dump(dict(W=W, H=H, camadas=info), open('camadas/camadas.json', 'w'), indent=1)

# base de cada frasco (linha onde ele encosta na mesa), pro reflexo que anda junto
import numpy as np
cam = json.load(open('camadas/camadas.json'))
for c in cam['camadas']:
    a = np.asarray(Image.open(f"recortes/{c['n']}.png"))[..., 3] > 40
    x0, x1 = (c['x'] + c['w'] - 420, c['x'] + c['w'] - 80) if c['lado'] == 'esq' else (c['x'] + 80, c['x'] + 400)
    c['base'] = int(np.median([np.where(a[:, x])[0].max() for x in range(x0, x1) if a[:, x].any()]))
json.dump(cam, open('camadas/camadas.json', 'w'), indent=1)

# Vídeo "Hawas line 10/10" no tempo exato da referência (instagram.com/reel/Df7bo_-Oskb, 30 fps, 397 quadros)
# Uso: uv run --with pillow --with numpy --with fonttools python gerar.py [--previa n n n]
#   saída: v-hawas-10-de-10-sem-audio.mp4 (+ versão com o áudio dele só para conferir o tempo)
import os, io, math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from fontTools.ttLib import TTCollection

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, TOTAL = 1080, 1920, 30, 397

# quadros exatos medidos no vídeo dele
CORTES = [0, 29, 77, 161, 240, 312, 396]      # 396 = último quadro preto só com o texto
TEXTO_INI = [0, 29, 77, 162, 240, 312]
IMGS = ["01-hawas-for-him.jpg", "02-hawas-black.jpg", "03-hawas-ice.jpg",
        "04-hawas-tropical.jpg", "05-hawas-malibu.jpg", "06-hawas-fire.jpg"]
TEXTOS = [("10/10", ["u1FAD0", "u1F34B"]),        # 🫐🍋
          ("100/10", ["u1FAB5", "u1F34B"]),       # 🪵🍋
          ("1000/10", ["u1F34F", "u1F9CA"]),      # 🍏🧊
          ("10000/10", ["u1F965", "u1F331"]),     # 🥥🌱
          ("100000/10", ["u1F34D", "u1FABB"]),    # 🍍🪻
          ("/10", ["u1FAA8", "u1F30A"])]          # ♾️/10 🪨🌊

# ---------- texto (Lilita One branca com contorno preto, igual à letra dele) ----------
LILITA = os.path.join(AQUI, "fonts", "LilitaOne-Regular.ttf")
LARG_REF = 470            # largura de "100000/10" (com contorno) no vídeo dele
TOPO_Y = int(os.environ.get("TOPO_Y", 250))   # topo dos números
CONTORNO = 7
EMO = TTCollection("/System/Library/Fonts/Apple Color Emoji.ttc").fonts[0]["sbix"].strikes[160].glyphs

def emoji(nome, alt):
    im = Image.open(io.BytesIO(EMO[nome].imageData)).convert("RGBA")
    im = im.crop(im.getbbox())
    return im.resize((round(im.width * alt / im.height), alt), Image.LANCZOS)

def _fonte():
    for tam in range(60, 300):
        f = ImageFont.truetype(LILITA, tam)
        b = f.getbbox("100000/10", stroke_width=CONTORNO)
        if b[2] - b[0] >= LARG_REF:
            return f
F = _fonte()
_b0 = F.getbbox("0")
ALT_DIG = _b0[3] - _b0[1]

def digitos(txt):
    b = F.getbbox(txt, stroke_width=CONTORNO)
    im = Image.new("RGBA", (b[2] - b[0] + 4, b[3] - b[1] + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((2 - b[0], 2 - b[1]), txt, font=F, fill="white",
                            stroke_width=CONTORNO, stroke_fill="black")
    return im

def camada_texto(i):
    txt, emos = TEXTOS[i]
    alt_e = round(ALT_DIG * 1.12)
    pecas = []
    if i == 5:
        pecas.append(("e", emoji("u267E", round(alt_e * 0.95))))
    pecas.append(("d", digitos(txt)))
    for n in emos:
        pecas.append(("e", emoji(n, alt_e)))
    gaps = []
    for k in range(len(pecas) - 1):
        a, b = pecas[k][0], pecas[k + 1][0]
        gaps.append(34 if a == "d" else (4 if b == "d" else 12))
    larg = sum(p.width for _, p in pecas) + sum(gaps)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - larg) // 2
    meio = TOPO_Y + (ALT_DIG + 2 * CONTORNO) // 2
    for k, (t, p) in enumerate(pecas):
        y = TOPO_Y if t == "d" else meio - p.height // 2
        lay.alpha_composite(p, (x, y))
        x += p.width + (gaps[k] if k < len(gaps) else 0)
    a = lay.split()[3]
    sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sombra.putalpha(a.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.35)))
    final = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    final.alpha_composite(sombra, (0, 4))
    final.alpha_composite(lay)
    return final

CAMADAS = [camada_texto(i) for i in range(6)]

# ---------- fotos + movimento de mão ----------
FOTO = [Image.open(os.path.join(AQUI, "fotos", n)).convert("RGB") for n in IMGS]
DESCE = float(os.environ.get("DESCE", 34))   # empurra a foto pra baixo (px) se a tampa encostar no texto

def balanco(seg, t):
    ph = seg * 1.7
    dx = 7 * math.sin(2 * math.pi * 0.33 * t + ph) + 3 * math.sin(2 * math.pi * 1.1 * t + 2 * ph)
    dy = 6 * math.sin(2 * math.pi * 0.27 * t + 0.5 + ph) + 2.5 * math.sin(2 * math.pi * 1.3 * t + ph)
    rot = 0.4 * math.sin(2 * math.pi * 0.22 * t + ph)
    zoom = 1.04 + 0.012 * t
    return dx, dy + DESCE, rot, zoom

def quadro(img, dx, dy, rot, zoom):
    s = max(W / img.width, H / img.height) * zoom
    th = math.radians(rot); c, sn = math.cos(th), math.sin(th)
    scx, scy = img.width / 2, img.height / 2
    ox, oy = W / 2 + dx, H / 2 + dy
    coef = (c / s, sn / s, scx - (c * ox + sn * oy) / s,
            -sn / s, c / s, scy - (-sn * ox + c * oy) / s)
    return img.transform((W, H), Image.AFFINE, coef, resample=Image.BICUBIC, fillcolor=(0, 0, 0))

# ---------- transição "raio de luz da persiana" ----------
# A foto que sai é puxada na diagonal das listras de luz (com borrão de movimento),
# um feixe de sol quente varre a tela no ângulo da persiana e a foto nova chega do
# lado oposto, freando, com um soco de zoom e leve separação de cor.
ANG = math.radians(-32)                 # direção das listras de luz nas fotos (sobe pra direita)
DIR = (math.cos(ANG), math.sin(ANG))
ANTES, DEPOIS = 3, 5                    # quadros de transição antes/depois do corte
DESLOC = 300

def ease_in(q): return q ** 2.6
def ease_out(q): return 1 - (1 - q) ** 3

def pose_trans(seg, n):
    """pose da foto `seg` no quadro n, incluindo saída/entrada da transição; devolve (pose, velocidade)"""
    t = (n - CORTES[seg]) / FPS
    dx, dy, rot, zoom = balanco(seg, max(t, 0))
    off, vel = 0.0, 0.0
    if seg > 0 and 0 <= n - CORTES[seg] < DEPOIS:           # chegando
        q = (n - CORTES[seg] + 1) / DEPOIS
        off = -DESLOC * (1 - ease_out(q))
        vel = DESLOC * 3 * (1 - q) ** 2 / DEPOIS
        zoom += 0.10 * (1 - ease_out(q))
        rot += -1.6 * (1 - ease_out(q))
    fim = CORTES[seg + 1]
    if seg < 5 and 0 < fim - n <= ANTES:                     # saindo
        q = (ANTES - (fim - n) + 1) / (ANTES + 1)
        off = DESLOC * ease_in(q)
        vel = DESLOC * 2.6 * q ** 1.6 / (ANTES + 1)
        zoom += 0.06 * ease_in(q)
        rot += 1.2 * ease_in(q)
    return (dx + off * DIR[0], dy + off * DIR[1], rot, zoom), vel

def com_borrao(img, pose, vel):
    if vel < 6:
        return np.asarray(quadro(img, *pose), dtype=np.float32)
    passos = 13
    acc = np.zeros((H, W, 3), np.float32)
    for k in range(passos):
        d = (k / (passos - 1) - 0.5) * vel * 1.1
        p = (pose[0] + d * DIR[0], pose[1] + d * DIR[1], pose[2], pose[3])
        acc += np.asarray(quadro(img, *p), dtype=np.float32)
    return acc / passos

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
# coordenada perpendicular às listras (o feixe é uma faixa paralela a elas)
PERP = (XX - W / 2) * -DIR[1] + (YY - H / 2) * DIR[0]
RAIO = abs(W * DIR[1]) / 2 + abs(H * DIR[0]) / 2 + 300

def feixe(k):
    """k = quadros desde o corte (negativo = antes). Faixa de luz quente que varre de baixo pra cima."""
    q = (k + ANTES + 1) / (ANTES + DEPOIS + 1)            # 0..1 ao longo da transição
    if q <= 0 or q >= 1:
        return None, 0
    centro = RAIO - 2 * RAIO * q
    forca = math.sin(math.pi * q) ** 1.5
    nucleo = np.exp(-((PERP - centro) / 120) ** 2)
    halo = np.exp(-((PERP - centro) / 380) ** 2) * 0.30
    # 3 listras finas acompanhando (como as frestas da persiana)
    listras = sum(np.exp(-((PERP - centro - o) / 26) ** 2) * 0.55 for o in (-260, 230, 470))
    luz = (nucleo + halo + listras) * forca
    return luz[..., None] * np.array([255, 236, 205], np.float32)[None, None, :], forca

def separa_cor(arr, px):
    if px < 1:
        return arr
    out = arr.copy()
    d = int(round(px))
    out[:, d:, 0] = arr[:, :-d, 0]
    out[:, :-d, 2] = arr[:, d:, 2]
    return out

def render(n):
    seg = max(i for i, c in enumerate(CORTES) if c <= n)
    if seg == 6:
        base = np.zeros((H, W, 3), np.float32)
    else:
        pose, vel = pose_trans(seg, n)
        base = com_borrao(FOTO[seg], pose, vel)
        # quadro do corte mais próximo (pra luz e separação de cor)
        ks = [n - c for c in CORTES[1:6] if -ANTES <= n - c < DEPOIS]
        if ks:
            k = ks[0]
            luz, forca = feixe(k)
            if luz is not None:
                base = 255 - (255 - base) * (255 - np.minimum(luz, 255)) / 255   # screen
                base = separa_cor(base, 9 * forca)
                # leve escurecida nas bordas durante o pico, pra luz ter contraste
                base *= 1 - 0.10 * forca * np.clip((np.abs(XX - W / 2) / (W / 2)) ** 2, 0, 1)[..., None]
    out = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
    ti = max(i for i, c in enumerate(TEXTO_INI) if c <= n)
    out.alpha_composite(CAMADAS[ti])
    return out.convert("RGB")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--previa":
        os.makedirs(os.path.join(AQUI, "tmp"), exist_ok=True)
        for n in map(int, sys.argv[2:]):
            render(n).save(os.path.join(AQUI, "tmp", f"previa_{n:03d}.png"))
        sys.exit()
    saida = os.path.join(AQUI, "REELS VALOTA PARFUM HAWAS 10 DE 10 SEM AUDIO.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16",
                           "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida],
                          stdin=subprocess.PIPE)
    for n in range(TOTAL):
        ff.stdin.write(render(n).tobytes())
    ff.stdin.close(); ff.wait()
    conf = os.path.join(AQUI, "REELS VALOTA PARFUM HAWAS 10 DE 10 COM AUDIO DELE so pra conferir.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", saida, "-i", os.path.join(AQUI, "audio-referencia.m4a"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-shortest", conf], check=True)
    print(saida); print(conf)

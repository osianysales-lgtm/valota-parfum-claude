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

# ---------- transição "zoom pelo frasco" (só movimento de câmera, nada por cima) ----------
# A câmera mergulha no frasco que sai (zoom acelerando + giro leve + borrão radial de velocidade),
# corta no pico e o frasco novo chega já ampliado, desacelera até a mão parar, com um
# pequeno tranco de pouso. Sem luz, sem cor, sem camada por cima: só a imagem se movendo.
PONTO = (540, 930)                       # centro do frasco na tela (o zoom acontece em volta dele)
ANTES, DEPOIS = 3, 7                     # quadros de transição antes/depois do corte
ZOOM_SAI, ZOOM_ENTRA = 1.0, 0.70        # quanto amplia no mergulho / de quanto o novo parte
GIRO_SAI, GIRO_ENTRA = 2.2, -2.6         # graus

def ease_in(q): return q ** 2.4
def ease_out(q): return 1 - (1 - q) ** 3.2

def estado(seg, n):
    """fator de zoom extra f, giro extra e tranco (dx,dy) da foto `seg` no quadro n"""
    f, g, jx, jy = 1.0, 0.0, 0.0, 0.0
    k = n - CORTES[seg]
    if seg > 0 and 0 <= k < DEPOIS:                          # chegando
        q = (k + 1) / (DEPOIS + 1)
        r = 1 - ease_out(q)
        f = 1 + ZOOM_ENTRA * r
        g = GIRO_ENTRA * r
    if seg > 0 and 0 <= k < 10:                              # tranco de pouso, some rápido
        a = math.exp(-k / 2.2)
        jx = 5 * a * math.sin(k * 2.1 + 0.6)
        jy = 7 * a * math.cos(k * 1.7)
    fim = CORTES[seg + 1]
    if seg < 5 and 0 < fim - n <= ANTES:                     # saindo (mergulha no frasco)
        q = (ANTES - (fim - n) + 1) / (ANTES + 1)
        f = 1 + ZOOM_SAI * ease_in(q)
        g = GIRO_SAI * ease_in(q)
    return f, g, jx, jy

def pose_em(seg, n_frac):
    """pose completa num tempo fracionário (pro borrão de obturador)"""
    n0 = math.floor(n_frac); fr = n_frac - n0
    e0, e1 = estado(seg, n0), estado(seg, n0 + 1)
    # não interpolar atravessando o corte
    # no quadro do corte, continua o movimento (extrapola) pra o borrão não sumir
    if seg > 0 and n0 + 1 == CORTES[seg]:
        e2 = estado(seg, n0 + 2)
        e0 = tuple(2 * a - b for a, b in zip(e1, e2))
    if n0 + 1 == CORTES[seg + 1]:
        em = estado(seg, n0 - 1)
        e1 = tuple(2 * a - b for a, b in zip(e0, em))
    f, g, jx, jy = (a + (b - a) * fr for a, b in zip(e0, e1))
    t = max(n_frac - CORTES[seg], 0) / FPS
    dx, dy, rot, zoom = balanco(seg, t)
    # zoom em volta do frasco: o ponto PONTO fica parado na tela
    ox, oy = W / 2 + dx, H / 2 + dy
    ox = PONTO[0] + f * (ox - PONTO[0]); oy = PONTO[1] + f * (oy - PONTO[1])
    return (ox - W / 2 + jx, oy - H / 2 + jy, rot + g, zoom * f), f

def render_foto(seg, n):
    """média de sub-quadros ao longo do 'obturador' = borrão radial/rotacional de verdade"""
    p0, f0 = pose_em(seg, n)
    pa, fa = pose_em(seg, n - 0.5)
    pb, fb = pose_em(seg, n + 0.5)
    mov = abs(fb - fa) * 1000 + abs(pb[2] - pa[2]) * 40 + math.hypot(pb[0] - pa[0], pb[1] - pa[1])
    if mov < 8:
        return np.asarray(quadro(FOTO[seg], *p0), dtype=np.float32)
    passos = int(min(72, 10 + mov / 3))
    acc = np.zeros((H, W, 3), np.float32)
    for i in range(passos):
        u = n - 0.42 + 0.84 * i / (passos - 1)            # obturador de ~300°
        acc += np.asarray(quadro(FOTO[seg], *pose_em(seg, u)[0]), dtype=np.float32)
    return acc / passos

def render(n):
    seg = max(i for i, c in enumerate(CORTES) if c <= n)
    if seg == 6:
        base = np.zeros((H, W, 3), np.float32)
    else:
        base = render_foto(seg, n)
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

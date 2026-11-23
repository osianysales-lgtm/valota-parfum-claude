# Vídeo "mão + perfumes" no tempo exato do inspiracao.mp4 (30 fps, 417 quadros)
# Uso: python gerar.py [--flash]   (Python com Pillow, numpy e fonttools)
#   saída: v-mao-voltinha-sem-audio.mp4 (+ versão com áudio só para conferir)
import os, io, math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTCollection

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(AQUI, "gemini")
W, H, FPS, TOTAL = 1080, 1920, 30, 417

# quadros exatos medidos no vídeo dele (corte do frasco / troca do texto)
CORTES = [0, 16, 71, 160, 228, 302, 412]           # 412+ = tela preta só com texto
IMGS = ["01-liquid-brun.jpg", "02-vulcan-feu.jpg", "03-asad-bourbon.jpg",
        "04-his-confession.jpg", "05-spectre-ghost.jpg", "06-bidaya-sex-on-the-rocks.jpg"]
TEXTO_INI = [0, 17, 73, 163, 231, 306]
TEXTOS = [("10/10", ["u1F924", "u1F9C1"]),
          ("100/10", ["u1F96D", "u1F62E_u1F4A8"]),
          ("1000/10", ["u1F970", "u1F369"]),
          ("20/10", ["u1F36F", "u2728"]),
          ("10/10", ["u1F975", "u1F9C1"]),
          ("/10", ["u1F525", "u1F608", "u1F336"])]       # ∞ entra como emoji ♾️ antes

# ---------- texto ----------
DIDOT = os.path.expanduser("~/Library/Fonts/linotype-didot-bold.otf")
ALTURA_DIG = 94           # altura dos números no vídeo dele (conferido lado a lado)
LARG_1000 = 352           # largura de "1000/10" no vídeo dele
BASE_Y = 458              # linha de base dos números
EMO = TTCollection("/System/Library/Fonts/Apple Color Emoji.ttc").fonts[0]["sbix"].strikes[160].glyphs

def emoji(nome, alt):
    im = Image.open(io.BytesIO(EMO[nome].imageData)).convert("RGBA")
    im = im.crop(im.getbbox())
    return im.resize((round(im.width * alt / im.height), alt), Image.LANCZOS)

def fonte():
    for tam in range(80, 260):
        f = ImageFont.truetype(DIDOT, tam)
        b = f.getbbox("0")
        if b[3] - b[1] >= ALTURA_DIG:
            return f
F = fonte()
_b = F.getbbox("1000/10"); CONDENSA = LARG_1000 / (_b[2] - _b[0])

def digitos(txt):
    b = F.getbbox(txt)
    im = Image.new("RGBA", (b[2] - b[0] + 4, b[3] - b[1] + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((2 - b[0], 2 - b[1]), txt, font=F, fill="white", stroke_width=1, stroke_fill="white")
    return im.resize((round(im.width * CONDENSA), im.height), Image.LANCZOS)

def camada_texto(i):
    txt, emos = TEXTOS[i]
    alt_e = round(ALTURA_DIG * 1.02)
    pecas = []
    if i == 5:
        pecas.append(("e", emoji("u267E", alt_e)))
    pecas.append(("d", digitos(txt)))
    for n in emos:
        pecas.append(("e", emoji(n, alt_e)))
    gap = {"d": 2, "e": round(alt_e * 0.07)}
    larg = sum(p.width for _, p in pecas) + sum(gap[t] for t, _ in pecas[:-1])
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - larg) // 2
    for t, p in pecas:
        y = BASE_Y - p.height + (8 if t == "e" else 0)
        lay.alpha_composite(p, (x, y))
        x += p.width + gap[t]
    # sombra suave como no vídeo dele
    a = lay.split()[3]
    sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sombra.putalpha(a.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * 0.55)))
    final = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    final.alpha_composite(sombra, (2, 4))
    final.alpha_composite(lay)
    return final

CAMADAS = [camada_texto(i) for i in range(6)]

# ---------- movimento da mão ----------
FOTO = [Image.open(os.path.join(FOTOS, n)).convert("RGB") for n in IMGS]

def pose(seg, t):
    """deslocamento (dx,dy), rotação (graus) e zoom no tempo t (s) dentro do trecho"""
    ph = seg * 1.7
    dx = 7 * math.sin(2 * math.pi * 0.33 * t + ph) + 3 * math.sin(2 * math.pi * 1.1 * t + 2 * ph)
    dy = 6 * math.sin(2 * math.pi * 0.27 * t + 0.5 + ph) + 2.5 * math.sin(2 * math.pi * 1.3 * t + ph)
    rot = 0.45 * math.sin(2 * math.pi * 0.22 * t + ph)
    zoom = 1.06 + 0.012 * t
    # tremida da troca: forte no 1º quadro e some em ~0,3 s
    forca = 0.45 if seg == 0 else 1.0
    A = forca * math.exp(-t / 0.085)
    dx += 30 * A * math.sin(2 * math.pi * 9 * t + 1.2)
    dy += 20 * A * math.cos(2 * math.pi * 7 * t)
    rot += 1.8 * A * math.sin(2 * math.pi * 8 * t + 0.4)
    zoom += 0.07 * A
    return dx, dy, rot, zoom, A

def quadro(img, dx, dy, rot, zoom):
    s = max(W / img.width, H / img.height) * zoom
    th = math.radians(rot); c, sn = math.cos(th), math.sin(th)
    scx, scy = img.width / 2, img.height / 2
    ox, oy = W / 2 + dx, H / 2 + dy
    coef = (c / s, sn / s, scx - (c * ox + sn * oy) / s,
            -sn / s, c / s, scy - (-sn * ox + c * oy) / s)
    return img.transform((W, H), Image.AFFINE, coef, resample=Image.BICUBIC, fillcolor=(0, 0, 0))

FLASH = "--flash" in sys.argv
FLASH_CURVA = [0.85, 0.45, 0.18, 0.05]

def render(n):
    seg = max(i for i, c in enumerate(CORTES) if c <= n)
    if seg == 6:
        base = Image.new("RGB", (W, H), (0, 0, 0))
    else:
        img = FOTO[seg]
        t = (n - CORTES[seg]) / FPS
        A = pose(seg, t)[4]
        if A > 0.2:   # borrão de movimento durante a tremida
            subs = [pose(seg, max(0, t + k / (FPS * 5))) for k in (-2, -1, 0, 1, 2)]
            arr = sum(np.asarray(quadro(img, *p[:4]), dtype=np.float32) for p in subs) / len(subs)
            base = Image.fromarray(arr.astype(np.uint8))
        else:
            base = quadro(img, *pose(seg, t)[:4])
    if FLASH and seg in (1, 2, 3, 4, 5):   # flash branco rápido na troca (3 quadros)
        k = n - CORTES[seg]
        if k < len(FLASH_CURVA):
            base = Image.blend(base, Image.new("RGB", (W, H), (255, 250, 240)), FLASH_CURVA[k])
    ti = max(i for i, c in enumerate(TEXTO_INI) if c <= n)
    out = base.convert("RGBA"); out.alpha_composite(CAMADAS[ti])
    return out.convert("RGB")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--previa":
        for n in map(int, sys.argv[2:]):
            render(n).save(os.path.join(AQUI, f"_previa_{n}.png"))
        sys.exit()
    suf = "-FLASH" if FLASH else ""
    saida = os.path.join(AQUI, f"v-mao-voltinha{suf}-sem-audio.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16",
                           "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida],
                          stdin=subprocess.PIPE)
    for n in range(TOTAL):
        ff.stdin.write(render(n).tobytes())
    ff.stdin.close(); ff.wait()
    conf = os.path.join(AQUI, f"v-mao-voltinha{suf}-COM-AUDIO-so-pra-conferir.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", saida, "-i", os.path.join(AQUI, "audio-inspiracao.m4a"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", conf], check=True)
    print(saida); print(conf)

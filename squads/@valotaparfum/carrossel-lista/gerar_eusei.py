#!/usr/bin/env python3
"""Carrossel "Teu cheiro ficou no carro / Eu sei" da Valota Parfum, 1080x1440 (3:4).

Referência: post da @parfumeriaoficial (instagram.com/p/DfDgM_3mn4L), 16/11/2026.
- Capa: foto + frase fina (Raleway) entre aspas, centrada à direita, embaixo, com 3 emojis.
- Demais: foto do frasco + "Eu sei" (Poppins Bold creme #FDF4B0) em arco com 4 estrelas,
  no canto superior direito (ou esquerdo com "lado": "esq").

Uso:
    python3 gerar_eusei.py carrosseis/<nome>/carrossel.json [02,03]
    python3 gerar_eusei.py --calibrar <inspiracao.png> saida.png   (sobrepõe ao original)
Saída: carrosseis/<nome>/saida/01.png ...

JSON por slide:
  "foto": arquivo, "recorte": [x, y, largura] em px da foto original (altura = largura*4/3)
  capa: "frase": ["linha 1", "linha 2"], "emoji": "🔥🔥🔥", "cx": centro x do texto, "y": topo do texto
  eu sei: "lado": "dir" | "esq", "dx"/"dy": deslocamento do bloco
  "brilho"/"contraste"/"sat": ajuste leve da foto (padrão 1)
"""
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
FONTES = AQUI / "fontes"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
L, A = 1080, 1440
CREME = "#FDF4B0"

CSS = f"""
@font-face{{font-family:'Poppins';src:url('{(FONTES / "Poppins-Bold.ttf").as_uri()}');font-weight:700}}
@font-face{{font-family:'Raleway';src:url('{(FONTES / "Raleway.ttf").as_uri()}');font-weight:100 900}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{L}px;height:{A}px;overflow:hidden;background:#000}}
.foto{{position:absolute;inset:0;background-repeat:no-repeat}}
svg{{position:absolute;left:0;top:0}}
.frase{{position:absolute;transform:translateX(-50%);text-align:center;white-space:nowrap;
  font-family:'Raleway';font-weight:400;font-size:79px;line-height:1.08;color:#fff;letter-spacing:-.005em;
  text-shadow:0 2px 14px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.35)}}
.frase .emo{{font-family:'Apple Color Emoji';font-size:62px;letter-spacing:6px;line-height:1.25;display:block;margin-top:4px}}
"""

# "Eu sei" — letras uma a uma (x, y da linha de base, rotação), calibrado sobre o original (1080x1440)
LETRAS = [("E", 479, 164, 7), ("u", 549, 174, 10), ("s", 642, 202, 18), ("e", 704, 224, 25), ("i", 777, 238, 30)]
TAM = 136
# estrelas: (cx, cy, raio externo)
ESTRELAS = [(445, 183, 34), (757, 70, 26), (698, 273, 22), (882, 248, 40)]


def estrela(cx, cy, r, rot=-90, k=0.42):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * k
        a = math.radians(rot + i * 36)
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{CREME}"/>'


def eu_sei(lado="dir", dx=0, dy=0, cor=CREME):
    tx = ""
    for ch, x, y, r in LETRAS:
        tx += f'<text x="{x}" y="{y}" transform="rotate({r} {x} {y})">{ch}</text>'
    st = "".join(estrela(*e) for e in ESTRELAS)
    g = f'<g transform="translate({dx} {dy})">'
    if lado == "esq":  # espelha a posição (não as letras): bloco vai pro canto esquerdo
        g = f'<g transform="translate({dx - 330} {dy})">'
    sombra = '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity=".35"/></filter>'
    return (f'<svg width="{L}" height="{A}" viewBox="0 0 {L} {A}"><defs>{sombra}</defs>{g}<g filter="url(#s)">'
            f'<g font-family="Poppins" font-weight="700" font-size="{TAM}" fill="{cor}" >{tx}</g>{st}</g></g></svg>')


def fundo(foto, recorte, ajuste=""):
    x, y, w = recorte
    esc = L / w
    tam = f"{sips_w(foto) * esc:.2f}px auto"
    return (f'<div class="foto" style="background-image:url(\'{foto.as_uri()}\');background-size:{tam};'
            f'background-position:{-x * esc:.2f}px {-y * esc:.2f}px;{ajuste}"></div>')


_cache = {}


def sips_w(foto):
    if foto not in _cache:
        out = subprocess.run(["sips", "-g", "pixelWidth", str(foto)], capture_output=True, text=True).stdout
        _cache[foto] = int(out.strip().split()[-1])
    return _cache[foto]


def pagina(corpo):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{corpo}</body></html>'


def render(htmltxt, png):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as t:
        t.write(htmltxt)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--allow-file-access-from-files", "--force-device-scale-factor=1",
                    f"--window-size={L},{A}", "--virtual-time-budget=4000",
                    f"--screenshot={png}", Path(t.name).as_uri()], check=True, capture_output=True)


def slide(s, base):
    foto = (base / s["foto"]).resolve()
    aj = ""
    if any(k in s for k in ("brilho", "contraste", "sat")):
        aj = f'filter:brightness({s.get("brilho", 1)}) contrast({s.get("contraste", 1)}) saturate({s.get("sat", 1)});'
    corpo = fundo(foto, s["recorte"], aj)
    if "frase" in s:
        if s.get("escurecer", True):
            corpo += ('<div class="foto" style="background:radial-gradient(ellipse 70% 32% at 66% 80%,'
                      'rgba(0,0,0,.42) 0%,rgba(0,0,0,.18) 55%,rgba(0,0,0,0) 100%)"></div>')
        linhas = "<br>".join(s["frase"])
        emo = f'<span class="emo">{s["emoji"]}</span>' if s.get("emoji") else ""
        corpo += f'<div class="frase" style="left:{s.get("cx", 700)}px;top:{s.get("y", 1010)}px">{linhas}{emo}</div>'
    else:
        corpo += eu_sei(s.get("lado", "dir"), s.get("dx", 0), s.get("dy", 0))
    return pagina(corpo)


def main():
    if sys.argv[1] == "--calibrar":
        insp, png = Path(sys.argv[2]).resolve(), sys.argv[3]
        corpo = (f'<div class="foto" style="background:url(\'{insp.as_uri()}\') 0 0/{L}px {A}px"></div>'
                 + eu_sei(cor="rgba(255,0,0,.55)"))
        render(pagina(corpo), png)
        return
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    d = json.loads(arq.read_text(encoding="utf-8"))
    so = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
    saida = base / "saida"
    saida.mkdir(exist_ok=True)
    for i, s in enumerate(d["slides"], 1):
        n = f"{i:02d}"
        if so and n not in so:
            continue
        render(slide(s, base), str(saida / f"{n}.png"))
        print(saida / f"{n}.png")


if __name__ == "__main__":
    main()

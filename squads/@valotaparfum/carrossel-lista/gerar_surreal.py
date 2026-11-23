#!/usr/bin/env python3
"""Molde "BOM x SURREAL" (21/11/2026) — referência @belivparfum (instagram.com/p/DfPo_0hFMW_).

Capa com 8 frascos (fileira de cima = bons, de baixo = surreais), 1 slide por comparação
(bom à esquerda, inspiração pequena no meio, surreal à direita) e slide final de CTA.
Paleta Petróleo & Âmbar: fundo bege, texto petróleo, destaque âmbar/amarelo SEMPRE sobre petróleo.

uso: python3 gerar_surreal.py carrosseis/<nome>/carrossel.json [01,03]
Saída: carrosseis/<nome>/saida/NN.png (1080x1350) + NN-feed34.png (prévia do recorte 3:4 da grade).
"""
import html
import json
import subprocess
import sys
import tempfile
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
AQUI = Path(__file__).resolve().parent
FONTE = (AQUI.parent / "carrossel-tweet/fonts/Montserrat-VariableFont_wght.ttf").as_uri()
AVATAR = (AQUI.parent / "carrossel-tweet/avatar.png").as_uri()
L, A = 1080, 1350
PET, BEGE, AMBAR, AMAR, CREME = "#0F2E33", "#F2E8D8", "#D49A4E", "#FFC93C", "#FBF5EA"

CSS = f"""
@font-face{{font-family:M;src:url('{FONTE}');font-weight:100 900}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{L}px;height:{A}px;overflow:hidden}}
body{{background:{BEGE};font-family:M;color:{PET};position:relative;
  background-image:radial-gradient(ellipse 90% 60% at 50% 78%,rgba(255,255,255,.45),rgba(255,255,255,0) 70%)}}
.topo{{position:absolute;left:70px;top:66px;display:flex;align-items:center;gap:24px}}
.av{{width:108px;height:108px;border-radius:50%;background:url('{AVATAR}') center/cover;
  box-shadow:0 0 0 4px {BEGE},0 0 0 7px {AMBAR}}}
.nm{{font-weight:800;font-size:40px;letter-spacing:-.5px;line-height:1.1}}
.us{{font-weight:500;font-size:31px;color:rgba(15,46,51,.62);margin-top:4px}}
.tit{{position:absolute;left:70px;right:70px;top:222px;font-family:'Gotham Black',M;font-weight:900;
  font-size:84px;line-height:1.04;letter-spacing:-1.5px}}
.tit.cmp{{font-size:74px;line-height:1.2}}
.dest{{color:{AMAR};background:{PET};padding:0 18px 6px;border-radius:14px;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;display:inline-block;line-height:1.08;transform:rotate(-1.5deg)}}
.fr{{position:absolute;transform:translateX(-50%);filter:drop-shadow(0 20px 18px rgba(15,46,51,.20)) drop-shadow(0 4px 4px rgba(15,46,51,.12))}}
.insp{{position:absolute;left:{L//2}px;transform:translateX(-50%);text-align:center;width:300px}}
.insp .k{{font-weight:800;font-size:23px;letter-spacing:.2em;color:{AMBAR};
  background:{PET};display:inline-block;padding:7px 14px 6px 18px;border-radius:30px;margin-bottom:14px}}
.insp .n{{font-weight:800;font-size:36px;line-height:1.08}}
.insp .m{{font-weight:500;font-size:27px;color:rgba(15,46,51,.62);margin-top:6px;line-height:1.15}}
.rot{{position:absolute;transform:translateX(-50%);text-align:center;white-space:nowrap}}
.rot .t{{font-family:'Gotham Black',M;font-weight:900;font-size:50px;letter-spacing:-.5px;line-height:1}}
.rot .t.s{{background:{PET};color:{CREME};padding:14px 26px 12px;border-radius:12px;display:inline-block;transform:rotate(-2.5deg);
  box-shadow:0 10px 24px rgba(15,46,51,.25)}}
.rot .t.s b{{color:{AMAR}}}
.rot .p{{font-weight:700;font-size:29px;margin-top:20px;color:rgba(15,46,51,.88)}}
.arr{{position:absolute;right:66px;bottom:36px;background:{PET};color:{CREME};font-weight:800;font-size:32px;
  padding:14px 30px 15px;border-radius:40px}}
.arr b{{color:{AMAR}}}
.fim{{position:absolute;left:0;right:0;top:250px;text-align:center;font-family:'Gotham Black',M;font-weight:900;
  font-size:92px;line-height:1.1;letter-spacing:-1.5px}}
.cart{{position:absolute;left:50%;top:700px;transform:translateX(-50%);display:flex;align-items:center;gap:26px}}
.cart .av{{width:150px;height:150px}}
.cart .nm{{font-size:48px}}.cart .us{{font-size:36px}}
.bts{{position:absolute;left:50%;top:920px;transform:translateX(-50%);display:flex;gap:26px}}
.bt{{font-weight:800;font-size:38px;height:98px;display:flex;align-items:center;padding:0 44px;border-radius:60px;white-space:nowrap}}
.bt.o{{border:4px solid {PET}}}
.bt.c{{background:{PET};color:{CREME}}}
.sub{{position:absolute;left:0;right:0;top:1090px;text-align:center;font-weight:500;font-size:32px;color:rgba(15,46,51,.7)}}
"""


def esc(t):
    return html.escape(t)


def marcar(t):
    """*palavra* vira o destaque (amarelo sobre petróleo)."""
    partes = esc(t).split("*")
    return "".join(f'<span class="dest">{p}</span>' if i % 2 else p for i, p in enumerate(partes)).replace("\n", "<br>")


def topo():
    return ('<div class="topo"><div class="av"></div><div><div class="nm">Valota Parfum</div>'
            '<div class="us">@valotaparfum</div></div></div>')


def frasco(src, cx, base, alt):
    return (f'<img class="fr" src="{src}" style="left:{cx}px;top:{base - alt}px;height:{alt}px">')


def pagina(corpo):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{corpo}</body></html>'


def render(htmltxt, png):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as t:
        t.write(htmltxt)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--allow-file-access-from-files", "--force-device-scale-factor=1",
                    f"--window-size={L},{A}", "--virtual-time-budget=4000",
                    f"--screenshot={png}", Path(t.name).as_uri()], check=True, capture_output=True)


def capa(c, base):
    corpo = topo() + f'<div class="tit">{marcar(c["titulo"])}</div>'
    cols = c.get("colunas", [190, 430, 670, 905])
    for i, f in enumerate(c["cima"]):
        corpo += frasco((base / f["src"]).as_uri(), cols[i] + f.get("dx", 0), c.get("base_cima", 815), f.get("h", 260))
    for i, f in enumerate(c["baixo"]):
        corpo += frasco((base / f["src"]).as_uri(), cols[i] + f.get("dx", 0), c.get("base_baixo", 1205), f.get("h", 380))
    corpo += f'<div class="arr">{esc(c.get("arrasta", "Arrasta"))} <b>→</b></div>'
    return pagina(corpo)


def comparacao(s, titulo, base):
    b, i, r = s["bom"], s["insp"], s["surreal"]
    corpo = topo() + f'<div class="tit cmp">{marcar(titulo)}</div>'
    corpo += frasco((base / b["src"]).as_uri(), 245 + b.get("dx", 0), 1165, b.get("h", 520))
    corpo += frasco((base / r["src"]).as_uri(), 835 + r.get("dx", 0), 1162, r.get("h", 580))
    it = i.get("top", 600)
    corpo += frasco((base / i["src"]).as_uri(), L // 2, it + i.get("h", 240), i.get("h", 240))
    corpo += (f'<div class="insp" style="top:{it + i.get("h", 240) + 28}px"><div class="k">INSPIRAÇÃO</div>'
              f'<div class="n">{esc(i["nome"])}</div><div class="m">{esc(i["marca"])}</div></div>')
    corpo += f'<div class="rot" style="left:245px;top:1200px"><div class="t">Esse é bom</div></div>'
    corpo += f'<div class="rot" style="left:835px;top:1186px"><div class="t s">Esse é <b>surreal</b></div></div>'
    corpo += f'<div class="rot" style="left:245px;top:1270px"><div class="p" style="margin:0">{esc(b["nome"])}</div></div>'
    corpo += f'<div class="rot" style="left:835px;top:1270px"><div class="p" style="margin:0">{esc(r["nome"])}</div></div>'
    return pagina(corpo)


def final(f):
    corpo = f'<div class="fim">{marcar(f.get("titulo", "Gostou? Salva e\n*segue* a gente."))}</div>'
    corpo += ('<div class="cart"><div class="av"></div><div><div class="nm">Valota Parfum</div>'
              '<div class="us">@valotaparfum</div></div></div>')
    corpo += (f'<div class="bts"><div class="bt o">Salva</div><div class="bt c">{esc(f.get("botao", "Segue a Valota Parfum"))}</div></div>')
    if f.get("sub"):
        corpo += f'<div class="sub">{esc(f["sub"])}</div>'
    return pagina(corpo)


def main():
    cfg = Path(sys.argv[1]).resolve()
    base = cfg.parent
    d = json.loads(cfg.read_text(encoding="utf-8"))
    so = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
    out = base / "saida"
    out.mkdir(exist_ok=True)
    paginas = [capa(d["capa"], base)]
    paginas += [comparacao(s, d.get("titulo_comparacao", "Mesma inspiração. Só\num é *surreal.*"), base) for s in d["comparacoes"]]
    paginas.append(final(d.get("final", {})))
    ff = Path("/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg")
    for n, p in enumerate(paginas, 1):
        nn = f"{n:02d}"
        if so and nn not in so:
            continue
        png = out / f"{nn}.png"
        render(p, str(png))
        if n == 1 and ff.exists():  # prévia do miolo 3:4 que aparece na grade do perfil
            subprocess.run([str(ff), "-loglevel", "error", "-y", "-i", str(png), "-vf", "crop=1012:1350:34:0",
                            str(out / "01-feed34.png")], check=False)
        print("ok", png)


if __name__ == "__main__":
    main()

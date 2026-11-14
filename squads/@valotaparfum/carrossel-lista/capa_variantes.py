#!/usr/bin/env python3
"""Variações de capa 'estúdio' (sem clip-art): luz de cima, piso com reflexo, grão.
Uso: python3 capa_variantes.py carrosseis/<nome>/carrossel.json
Saída: saida/capa-A.png (fiel ao modelo, tarja) e saida/capa-B.png (editorial)."""
import html
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gerar as g  # noqa: E402

GRAO = ("<svg style='position:absolute;inset:0;width:100%;height:100%;opacity:.10;mix-blend-mode:overlay;z-index:8' >"
        "<filter id='grao'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
        "<feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#grao)'/></svg>")


def estudio(frasco, topo, altura, piso):
    """Fundo de estúdio + frasco apoiado no piso (y=piso) com reflexo e sombra de contato."""
    return f"""
<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 26%,{g.LUZ} 0%,{g.PETROLEO} 48%,{g.NOITE} 100%)"></div>
<div style="position:absolute;left:50%;top:{piso - 26}px;width:{int(altura * .80)}px;height:60px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,.45) 0%,rgba(0,0,0,.18) 45%,rgba(0,0,0,0) 72%);filter:blur(4px)"></div>
<img src="{frasco}" style="position:absolute;left:50%;top:{topo}px;height:{altura}px;transform:translateX(-50%);filter:drop-shadow(0 0 70px rgba(212,154,78,.22))">
<div style="position:absolute;inset:0;background:radial-gradient(ellipse 85% 75% at 50% 45%,transparent 55%,rgba(5,15,18,.55) 100%);z-index:6"></div>
{GRAO}"""


def marca():
    return f"""<div style="position:absolute;top:56px;left:60px;display:flex;align-items:center;gap:18px;z-index:9">
  <div style="width:80px;height:80px;border-radius:50%;background:url('{g.AVATAR}') center/cover;border:2px solid rgba(242,232,216,.5)"></div>
  <span style="color:{g.CREME};font-size:29px;font-weight:600">Valota Parfum</span></div>"""


def seta(y):
    return f"""<div style="position:absolute;top:{y}px;left:50%;transform:translateX(-50%);width:150px;height:48px;border:2px solid rgba(242,232,216,.7);border-radius:999px;display:flex;align-items:center;justify-content:center;z-index:9">
<svg viewBox="0 0 120 20" width="92" height="18" style="fill:none;stroke:{g.CREME};stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;opacity:.85"><path d="M4 10h108M100 2l12 8-12 8"/></svg></div>"""


def destaque_num(t):
    # número em Amarelo Laudo (punchline) sobre o Petróleo Noite
    import re
    return re.sub(r"(\d+)", lambda m: f'<span style="color:{g.AMARELO}">{m.group(1)}</span>', html.escape(t))


def grife(t):
    import re
    t = re.sub(r"\*\*(.+?)\*\*", r'<strong style="font-weight:900">\1</strong>', html.escape(t))
    return t.replace("perfume de grife", '<strong style="font-weight:900">perfume de grife</strong>')


def capa_a(c, frasco, cor=None):
    cor = cor or g.AMBAR
    # fiel ao modelo: título por cima do meio do objeto, tarja âmbar chapada + faixa creme
    return g.pagina(estudio(frasco, 150, 820, 970) + marca() + f"""
<div style="position:absolute;left:0;right:0;top:500px;display:flex;flex-direction:column;align-items:center;z-index:9">
  <div style="background:{g.NOITE};color:{g.CREME};font-size:{c.get('tam1', 78)}px;font-weight:900;letter-spacing:.04em;line-height:1;padding:20px 38px 18px">{destaque_num(c['linha1'])}</div>
  <div style="background:{cor};color:{g.NOITE};font-weight:900;font-size:{c.get('tam_destaque', 176)}px;letter-spacing:-.02em;line-height:1;padding:22px 48px 18px">{html.escape(c['destaque'])}</div>
  <div style="background:{g.CREME};color:{g.PETROLEO};font-size:56px;font-weight:600;line-height:1;padding:18px 34px 16px">{grife(c['linha3'])}</div>
</div>""" + seta(1220))


def capa_b(c, frasco):
    # editorial: frasco inteiro em destaque em cima, título limpo embaixo, sem caixa
    return g.pagina(estudio(frasco, 170, 640, 810) + marca() + f"""
<div style="position:absolute;left:0;right:0;top:900px;display:flex;flex-direction:column;align-items:center;z-index:9;text-align:center">
  <div style="color:{g.CREME};font-size:34px;font-weight:600;letter-spacing:.42em;margin-bottom:6px;opacity:.9">{html.escape(c['linha1'])}</div>
  <div style="color:{g.AMBAR};font-weight:900;font-size:186px;letter-spacing:-.02em;line-height:1.02">{html.escape(c['destaque'])}</div>
  <div style="color:{g.CREME};font-size:44px;font-weight:300;letter-spacing:.02em;margin-top:6px">{html.escape(c['linha3'])}</div>
</div>""" + seta(1238))


def main():
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    c = json.loads(arq.read_text(encoding="utf-8"))["capa"]
    frasco = g.uri(c["frasco"], base)
    for nome, f in (("capa-A", capa_a), ("capa-B", capa_b)):
        png = base / "saida" / f"{nome}.png"
        g.render(f(c, frasco), png)
        print("ok", png)


if __name__ == "__main__":
    main()

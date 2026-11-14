#!/usr/bin/env python3
"""Carrossel CA2 · "Ficha lado a lado" (comparativo nicho x árabe) da Valota Parfum.

Base Petróleo (estúdio: luz de cima, piso com reflexo, vinheta e grão, sem clip-art)
+ cartelas das famílias olfativas nas notas e nas fichas. 1080x1350 PNG.

Tipos de slide no JSON: capa · ficha · notas · texto · veredito · final

Uso:
    python3 gerar.py carrosseis/<nome>/carrossel.json
Saída: carrosseis/<nome>/saida/01.png ... + previa.html
"""
import html
import json
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent / "carrossel-lista"))
import gerar as g  # noqa: E402  (cartela, fontes, render e ícones do carrossel-lista)

P, N, LZ, C, AM, AY = g.PETROLEO, g.NOITE, g.LUZ, g.CREME, g.AMBAR, g.AMARELO
FAM = g.FAMILIAS
ICONES = dict(g.ICONES)
ICONES.update({
    "pimenta": '<circle cx="9" cy="10" r="2.2"/><circle cx="15.5" cy="8.5" r="2.2"/><circle cx="12.5" cy="15.5" r="2.2"/>',
    "flor": '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c-1.6-3.4-.6-6 0-6.6.6.6 1.6 3.2 0 6.6zM12 14.4c1.6 3.4.6 6 0 6.6-.6-.6-1.6-3.2 0-6.6zM9.6 12c-3.4 1.6-6 .6-6.6 0 .6-.6 3.2-1.6 6.6 0zM14.4 12c3.4-1.6 6-.6 6.6 0-.6.6-3.2 1.6-6.6 0z"/>',
    "folha": '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14z"/><path d="M5 19 14 10"/>',
    "nuvem": '<path d="M7 17.5h10a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 7.7 9.2 4.2 4.2 0 0 0 7 17.5z"/>',
})

GRAO = ("<svg style='position:absolute;inset:0;width:100%;height:100%;opacity:.09;mix-blend-mode:overlay;z-index:20;pointer-events:none'>"
        "<filter id='grao'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
        "<feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#grao)'/></svg>")
VINHETA = '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 85% 75% at 50% 45%,transparent 55%,rgba(5,15,18,.55) 100%);z-index:19;pointer-events:none"></div>'
FUNDO = f'<div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at 50% 30%,{LZ} 0%,{P} 50%,{N} 100%)"></div>'

CSS = """
.topo2{position:absolute;top:62px;left:0;right:0;text-align:center;font-size:24px;font-weight:600;letter-spacing:.22em;color:rgba(242,232,216,.55);z-index:21}
.rod2{position:absolute;bottom:64px;left:0;right:0;text-align:center;font-size:28px;font-weight:600;color:rgba(242,232,216,.8);z-index:21}
.miolo{position:absolute;left:96px;right:96px;top:140px;bottom:140px;display:flex;flex-direction:column;justify-content:center;color:#F2E8D8;z-index:10}
.kicker{font-size:26px;font-weight:800;letter-spacing:.2em;color:#D49A4E;margin-bottom:18px}
.h{font-weight:900;font-style:italic;font-size:76px;line-height:1.02;letter-spacing:-.01em;margin-bottom:40px}
.p{font-size:37px;font-weight:400;line-height:1.36;margin-top:34px}
.p strong{font-weight:800}
.faixa{margin-top:36px;display:flex;align-items:center;gap:20px;font-size:34px;font-weight:700;line-height:1.3}
.faixa i{flex:none;width:12px;align-self:stretch;background:#FFC93C;border-radius:6px}
.chip{display:inline-flex;align-items:center;gap:10px;padding:8px 20px 8px 14px;border-radius:999px;font-size:21px;font-weight:800;letter-spacing:.14em}
.chip svg,.ico svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.chip svg{width:24px;height:24px}
strong{font-weight:800}
"""


def rico(t):
    t = html.escape(t or "")
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return t.replace("\n", "<br>")


def borda(fam):
    return f"border:2px solid {C};" if fam in ("cedro", "pimenta") else "border:2px solid transparent;"


# Fundos da cartela oficial (sem HEX novo). Claro = texto Petróleo Noite e fontes mais grossas,
# nada de texto âmbar/amarelo sobre o creme.
FUNDOS = {
    "petroleo": FUNDO,
    "creme": (f'<div style="position:absolute;inset:0;background-color:{C};background-image:linear-gradient(rgba(15,46,51,.07) 1.5px,transparent 1.5px),'
              f'linear-gradient(90deg,rgba(15,46,51,.07) 1.5px,transparent 1.5px);background-size:54px 54px;background-position:-1px -1px"></div>'
              f'<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 35%,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 70%)"></div>'),
    "pimenta": f'<div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at 50% 30%,#9C452A 0%,#9C452A 45%,rgba(10,31,35,.55) 100%),#9C452A"></div>',
}
CLARO = f"""
.topo2{{color:rgba(10,31,35,.55)}} .rod2{{color:rgba(10,31,35,.75)}}
.miolo{{color:{N}}} .kicker{{color:{FAM['pimenta'][0]}}}
.p{{font-weight:500}} .faixa{{font-weight:800}} .faixa i{{background:{P}}}
.ck{{background:{P}!important}} .ck svg{{stroke:{C}!important}}
.cab{{color:rgba(10,31,35,.6)!important}}
.vcard{{background:rgba(255,255,255,.6)!important;border-color:rgba(15,46,51,.14)!important}} .vtxt{{color:{N}!important}}
"""
PIMENTA = f".kicker{{color:{AY}}} .faixa i{{background:{AY}}} .topo2{{color:rgba(242,232,216,.7)}}"


def pag(corpo, d, fundo="petroleo"):
    topo = f'<div class="topo2">{html.escape(d["topo"])}</div>' if d.get("topo") else ""
    rod = f'<div class="rod2">{html.escape(d["rodape"])}</div>'
    extra = CLARO if fundo == "creme" else PIMENTA if fundo == "pimenta" else ""
    vinheta = "" if fundo == "creme" else VINHETA
    return g.pagina(f"<style>{CSS}{extra}</style>{FUNDOS[fundo]}{topo}{corpo}{rod}{vinheta}{GRAO}")


def check(ok=True):
    if ok:
        return (f'<div class="ck" style="width:64px;height:64px;border-radius:50%;background:{C};display:flex;align-items:center;justify-content:center">'
                f'<svg viewBox="0 0 24 24" width="38" height="38" style="fill:none;stroke:{P};stroke-width:3;stroke-linecap:round;stroke-linejoin:round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>')
    return (f'<div style="width:64px;height:64px;border-radius:50%;border:3px solid rgba(242,232,216,.45);display:flex;align-items:center;justify-content:center">'
            f'<svg viewBox="0 0 24 24" width="30" height="30" style="fill:none;stroke:rgba(242,232,216,.6);stroke-width:3;stroke-linecap:round"><path d="M6 12h12"/></svg></div>')


def selo(tam=230):
    return f"""<div style="width:{tam}px;height:{tam}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,{AY} 0%,{AY} 45%,{AM} 100%);border:5px solid {N};box-shadow:0 14px 34px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;transform:rotate(-12deg)">
  <div style="width:{tam - 30}px;height:{tam - 30}px;border-radius:50%;border:3px dashed {N};display:flex;flex-direction:column;align-items:center;justify-content:center;color:{N};text-align:center;line-height:1">
    <div style="font-size:{tam * .075:.0f}px;font-weight:800;letter-spacing:.2em">SELO</div>
    <div style="font-family:'Gotham Black';font-size:{tam * .15:.0f}px;margin:{tam * .03:.0f}px 0 {tam * .02:.0f}px">VALE O<br>FRASCO</div>
    <div style="font-size:{tam * .058:.0f}px;font-weight:800;letter-spacing:.12em">VALOTA PARFUM</div>
  </div></div>"""


def frasco_piso(src, cx, piso, alt):
    """Frasco apoiado no piso (y=piso) com reflexo e sombra de contato, centrado em cx."""
    return f"""
<img src="{src}" style="position:absolute;left:{cx}px;top:{piso}px;height:{alt}px;transform:translateX(-50%) scaleY(-1);transform-origin:50% 0;opacity:.18;filter:blur(1.5px);-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9) 0%,transparent 22%);z-index:3">
<div style="position:absolute;left:{cx}px;top:{piso - 22}px;width:{int(alt * .62)}px;height:44px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,.55) 0%,rgba(0,0,0,.2) 45%,rgba(0,0,0,0) 72%);filter:blur(3px);z-index:3"></div>
<img src="{src}" style="position:absolute;left:{cx}px;top:{piso - alt}px;height:{alt}px;transform:translateX(-50%);filter:drop-shadow(0 0 60px rgba(212,154,78,.20)) drop-shadow(0 24px 30px rgba(0,0,0,.45));z-index:4">"""


def marca():
    return f"""<div style="position:absolute;top:56px;left:60px;display:flex;align-items:center;gap:18px;z-index:21">
  <div style="width:80px;height:80px;border-radius:50%;background:url('{g.AVATAR}') center/cover;border:2px solid rgba(242,232,216,.5)"></div>
  <span style="color:{C};font-size:29px;font-weight:600">Valota Parfum</span></div>"""


def seta(y):
    return f"""<div style="position:absolute;top:{y}px;left:50%;transform:translateX(-50%);width:150px;height:48px;border:2px solid rgba(242,232,216,.7);border-radius:999px;display:flex;align-items:center;justify-content:center;z-index:21">
<svg viewBox="0 0 120 20" width="92" height="18" style="fill:none;stroke:{C};stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;opacity:.85"><path d="M4 10h108M100 2l12 8-12 8"/></svg></div>"""


def s_capa(d, s, b):
    a, z = s["esq"], s["dir"]
    piso = 800
    etiqueta = lambda x, cor: (f'<div style="text-align:center;color:{C}"><div style="font-size:24px;font-weight:700;letter-spacing:.2em;opacity:.75">{html.escape(x["marca"])}</div>'
                               + (f'<div style="font-family:\'Gotham Black\';font-size:62px;line-height:1.05;white-space:nowrap;color:{cor}">{html.escape(x["preco"])}</div>' if x.get("preco") else "") + '</div>')
    corpo = f"""
<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 24%,{LZ} 0%,{P} 50%,{N} 100%)"></div>
{marca()}
{frasco_piso(g.uri(a['frasco'], b), 330, piso, a.get('alt', 560))}
{frasco_piso(g.uri(z['frasco'], b), 760, piso, z.get('alt', 540))}
<div style="position:absolute;left:540px;top:{piso - 300}px;transform:translateX(-50%);font-size:46px;font-weight:300;color:rgba(242,232,216,.7);z-index:5">x</div>
<div style="position:absolute;top:{piso + 26}px;left:330px;transform:translateX(-50%);z-index:9">{etiqueta(a, C)}</div>
<div style="position:absolute;top:{piso + 26}px;left:760px;transform:translateX(-50%);z-index:9">{etiqueta(z, AY)}</div>
<div style="position:absolute;left:70px;right:70px;top:{piso + s.get('topo_titulo', 170)}px;text-align:center;z-index:9">
  <div style="color:{C};font-size:{s.get('tam1', 84)}px;font-weight:900;line-height:1.08;letter-spacing:-.01em">{rico(s['linha1'])}</div>
  <div style="color:{AM};font-family:'Gotham Black';font-size:{s.get('tam2', 84)}px;line-height:1.12">{html.escape(s['linha2'])}</div>
</div>
{seta(1240)}"""
    return g.pagina(f"<style>{CSS}</style>{corpo}{VINHETA}{GRAO}")


def card_ficha(x, b):
    cor, txt = FAM[x["familia"]]
    linhas = "".join(
        f'<div style="display:flex;justify-content:space-between;gap:12px;padding:13px 0;border-top:1.5px solid {txt}33;font-size:25px">'
        f'<span style="opacity:.75;font-weight:500">{html.escape(k)}</span><span style="font-weight:800;text-align:right">{html.escape(v)}</span></div>'
        for k, v in x["linhas"])
    return f"""<div style="flex:1;background:{cor};color:{txt};{borda(x['familia'])}border-radius:30px;padding:26px 28px 14px;box-shadow:0 20px 40px rgba(0,0,0,.35)">
  <div style="height:250px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:14px"><img src="{g.uri(x['frasco'], b)}" style="max-height:250px;max-width:220px;filter:drop-shadow(0 14px 16px rgba(0,0,0,.35))"></div>
  <div style="font-size:20px;font-weight:800;letter-spacing:.18em;opacity:.8">{html.escape(x['marca'])}</div>
  <div style="font-size:34px;font-weight:900;line-height:1.08;margin:4px 0 14px">{html.escape(x['nome'])}</div>
  {linhas}
</div>"""


def s_ficha(d, s, b):
    corpo = f"""<div class="miolo">
  <div class="kicker">{html.escape(s.get('kicker', ''))}</div>
  <div class="h">{rico(s['titulo'])}</div>
  <div style="display:flex;gap:30px">{card_ficha(s['esq'], b)}{card_ficha(s['dir'], b)}</div>
  {f'<div class="faixa"><i></i><div>{rico(s["faixa"])}</div></div>' if s.get('faixa') else ''}
</div>"""
    return pag(corpo, d, s.get("fundo", "petroleo"))


def s_notas(d, s, b):
    cab = (f'<div class="cab" style="display:grid;grid-template-columns:1fr 150px 150px;align-items:end;gap:0;margin-bottom:14px;font-size:22px;font-weight:800;letter-spacing:.16em;color:rgba(242,232,216,.7);text-align:center">'
           f'<span></span><span>{html.escape(s["col"][0])}</span><span>{html.escape(s["col"][1])}</span></div>')
    linhas = ""
    for n in s["notas"]:
        cor, txt = FAM[n["familia"]]
        linhas += f"""<div style="display:grid;grid-template-columns:1fr 150px 150px;align-items:center;margin-bottom:22px">
  <div style="background:{cor};color:{txt};{borda(n['familia'])}border-radius:24px;padding:20px 26px;display:flex;align-items:center;gap:20px;box-shadow:0 14px 28px rgba(0,0,0,.3)">
    <span class="ico" style="flex:none;width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="36" height="36">{ICONES[n['icone']]}</svg></span>
    <div><div style="font-size:38px;font-weight:900;line-height:1.05">{html.escape(n['nome'])}</div>
    <div style="font-size:25px;font-weight:500;margin-top:5px;opacity:.85">{html.escape(n['traducao'])}</div></div>
  </div>
  <div style="display:flex;justify-content:center">{check(n.get('esq', True))}</div>
  <div style="display:flex;justify-content:center">{check(n.get('dir', True))}</div>
</div>"""
    corpo = f"""<div class="miolo">
  <div class="kicker">{html.escape(s.get('kicker', ''))}</div>
  <div class="h">{rico(s['titulo'])}</div>
  {cab}{linhas}
  {f'<div class="p">{rico(s["texto"])}</div>' if s.get('texto') else ''}
  {f'<div class="faixa"><i></i><div>{rico(s["faixa"])}</div></div>' if s.get('faixa') else ''}
</div>"""
    return pag(corpo, d, s.get("fundo", "petroleo"))


def s_texto(d, s, b):
    cards = ""
    if s.get("cards"):
        cs = ""
        for x in s["cards"]:
            cor, txt = FAM[x["familia"]]
            cs += (f'<div style="flex:1;background:{cor};color:{txt};{borda(x["familia"])}border-radius:26px;padding:26px 28px;box-shadow:0 16px 32px rgba(0,0,0,.3)">'
                   f'<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px"><img src="{g.uri(x["frasco"], b)}" style="height:110px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.3))">'
                   f'<div style="font-size:21px;font-weight:800;letter-spacing:.16em">{html.escape(x["marca"])}</div></div>'
                   f'<div style="font-size:31px;font-weight:600;line-height:1.3">{rico(x["texto"])}</div></div>')
        cards = f'<div style="display:flex;gap:26px">{cs}</div>'
    paras = "".join(f'<div class="p">{rico(t)}</div>' for t in s.get("paragrafos", []))
    corpo = f"""<div class="miolo">
  <div class="kicker">{html.escape(s.get('kicker', ''))}</div>
  <div class="h">{rico(s['titulo'])}</div>
  {cards}{paras}
  {f'<div class="faixa"><i></i><div>{rico(s["faixa"])}</div></div>' if s.get('faixa') else ''}
</div>"""
    return pag(corpo, d, s.get("fundo", "petroleo"))


def s_veredito(d, s, b):
    def lado(x, com_selo):
        cor, txt = FAM[x["familia"]]
        sel = f'<div style="position:absolute;right:-26px;top:-40px;z-index:6">{selo(196)}</div>' if com_selo else ""
        return f"""<div class="vcard" style="flex:1;position:relative;background:rgba(10,31,35,.55);border:2px solid rgba(242,232,216,.18);border-radius:30px;padding:28px 26px 30px;text-align:center">
  {sel}
  <div style="height:300px;display:flex;align-items:flex-end;justify-content:center"><img src="{g.uri(x['frasco'], b)}" style="max-height:300px;max-width:240px;filter:drop-shadow(0 18px 20px rgba(0,0,0,.45))"></div>
  <div style="display:inline-block;margin:22px 0 14px;background:{cor};color:{txt};{borda(x['familia'])}border-radius:999px;padding:8px 22px;font-size:22px;font-weight:800;letter-spacing:.14em">{html.escape(x['rotulo'])}</div>
  <div class="vtxt" style="font-size:30px;font-weight:500;line-height:1.32;color:{C}">{rico(x['texto'])}</div>
</div>"""
    corpo = f"""<div class="miolo">
  <div class="kicker">{html.escape(s.get('kicker', ''))}</div>
  <div class="h">{rico(s['titulo'])}</div>
  <div style="display:flex;gap:30px;margin-top:20px">{lado(s['esq'], False)}{lado(s['dir'], True)}</div>
  {f'<div class="faixa"><i></i><div>{rico(s["faixa"])}</div></div>' if s.get('faixa') else ''}
</div>"""
    return pag(corpo, d, s.get("fundo", "petroleo"))


def s_final(d, s, b):
    return g.slide_final(d, s, b)  # CTA SALVAR com a própria capa (saida/01.png)


TIPOS = {"capa": s_capa, "ficha": s_ficha, "notas": s_notas, "texto": s_texto, "veredito": s_veredito, "final": s_final}


def main():
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    d = json.loads(arq.read_text(encoding="utf-8"))
    saida = base / "saida"
    saida.mkdir(exist_ok=True)
    nomes = []
    for k, s in enumerate(d["slides"], 1):
        png = saida / f"{k:02d}.png"
        g.render(TIPOS[s["tipo"]](d, s, base), png)
        nomes.append(png.name)
        print("ok", png)
    (saida / "previa.html").write_text(
        '<body style="background:#222;display:flex;flex-wrap:wrap;gap:12px;padding:12px">' +
        "".join(f'<img src="{n}" style="width:360px">' for n in nomes) + "</body>", encoding="utf-8")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Carrossel NOIR da Valota Parfum (16/11/2026, tema "Perfumes árabes que o Batman usaria").

Inspirado no carrossel de referência (foto de fundo + frasco grande + caixa de NOTAS),
mas na identidade Petróleo & Âmbar: fundo = foto da nota principal escurecida em petróleo,
nome em Gotham Black, marca/rótulos em Montserrat espaçada âmbar, sem emoji nem ícone.

Tipos de slide no JSON: capa · perfume · final
Uso:
    python3 gerar_noir.py carrosseis/<nome>/carrossel.json
Saída: carrosseis/<nome>/saida/01.png ... + previa.html (1080x1350)
"""
import html
import json
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar as g  # noqa: E402  (fontes, cartela e render do carrossel-lista)

P, N, LZ, C, AM, AY = g.PETROLEO, g.NOITE, g.LUZ, g.CREME, g.AMBAR, g.AMARELO
L, A = g.L, g.A

GRAO = ("<svg style='position:absolute;inset:0;width:100%;height:100%;opacity:.10;mix-blend-mode:overlay;z-index:20;pointer-events:none'>"
        "<filter id='grao'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
        "<feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#grao)'/></svg>")
VINHETA = '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 70% at 50% 45%,transparent 50%,rgba(5,15,18,.7) 100%);z-index:19;pointer-events:none"></div>'

CSS = f"""
@font-face {{ font-family:'Montserrat'; src:url('{g.MONTSERRAT}') format('truetype'); font-weight:100 900; }}
@font-face {{ font-family:'Gotham Black'; src:url('{g.GOTHAM}'); font-weight:900; }}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:{L}px;height:{A}px;overflow:hidden;background:{N}}}
body{{font-family:'Montserrat',sans-serif;position:relative;color:{C}}}
strong{{font-weight:800}}
.foto{{position:absolute;inset:0;background-size:cover;z-index:1}}
.tinta{{position:absolute;inset:0;z-index:2}}
.camada{{position:absolute;z-index:10}}
.marca{{font-size:27px;font-weight:700;letter-spacing:.42em;color:{AM};text-align:center}}
.nome{{font-family:'Gotham Black','Montserrat',sans-serif;font-weight:900;text-transform:uppercase;text-align:center;line-height:.98;color:{C};letter-spacing:.01em;text-shadow:0 4px 30px rgba(5,15,18,.6)}}
.papel{{display:inline-block;font-size:22px;font-weight:800;letter-spacing:.3em;color:{N};background:{AM};padding:9px 20px 9px 26px;border-radius:999px}}
.card{{background:rgba(10,31,35,.74);border:1.5px solid rgba(212,154,78,.55);border-radius:30px;padding:40px 38px 36px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.card h3{{font-family:'Gotham Black',sans-serif;font-size:40px;letter-spacing:.06em;margin-bottom:26px}}
.lin{{margin-bottom:22px}}
.lin b{{display:block;font-size:19px;font-weight:800;letter-spacing:.28em;color:{AM};margin-bottom:6px}}
.lin span{{font-size:30px;font-weight:500;line-height:1.22}}
.sep{{height:1.5px;background:rgba(242,232,216,.18);margin:8px 0 22px}}
.lembra{{font-size:30px;font-weight:400;line-height:1.2}}
.lembra strong{{font-weight:800}}
.frase{{font-size:33px;font-weight:500;line-height:1.36;text-align:left;text-shadow:0 2px 16px rgba(5,15,18,.8)}}
.nafoto{{display:inline-block;font-size:19px;font-weight:700;letter-spacing:.24em;color:{C};border:1.5px solid rgba(242,232,216,.45);border-radius:999px;padding:8px 18px;margin-bottom:18px;background:rgba(10,31,35,.45)}}
.rod{{position:absolute;bottom:46px;left:0;right:0;text-align:center;font-size:26px;font-weight:600;color:rgba(242,232,216,.85);z-index:21}}
.cont{{position:absolute;top:58px;right:64px;font-size:22px;font-weight:700;letter-spacing:.18em;color:rgba(242,232,216,.6);z-index:21}}
.perfil{{position:absolute;top:56px;left:60px;display:flex;align-items:center;gap:18px;z-index:21}}
.perfil img{{width:78px;height:78px;border-radius:50%;object-fit:cover;border:2.5px solid {C}}}
.perfil span{{font-size:31px;font-weight:700;color:{C};text-shadow:0 2px 12px rgba(0,0,0,.5)}}
"""


def rico(t):
    t = html.escape(t or "")
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return t.replace("\n", "<br>")


def pagina(corpo):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{corpo}{VINHETA}{GRAO}</body></html>'


def perfil():
    return f'<div class="perfil"><img src="{g.AVATAR}"><span>Valota Parfum</span></div>'


def capa(c, base):
    foto = g.uri(c["foto"], base)
    pos = c.get("pos", "center 30%")
    l1, l2 = html.escape(c["linha1"]), html.escape(c["linha2"])
    corpo = f"""
<div class="foto" style="background-image:url('{foto}');background-position:{pos};background-size:{c.get('zoom', 'cover')};filter:contrast(1.1) brightness(1.06)"></div>
<div class="tinta" style="background:{P};mix-blend-mode:color;opacity:.38"></div>
<div class="tinta" style="background:linear-gradient(180deg,rgba(10,31,35,.55) 0%,rgba(10,31,35,0) 18%,rgba(10,31,35,0) 70%,rgba(10,31,35,.6) 84%,rgba(10,31,35,.95) 100%)"></div>
{perfil()}
<div class="camada" style="left:50px;right:50px;bottom:118px;text-align:center">
  <div style="font-size:{c.get('tam1', 56)}px;font-weight:800;letter-spacing:.03em;color:{C};margin-bottom:8px;text-shadow:0 3px 18px rgba(0,0,0,.7)">{l1}</div>
  <div class="nome" style="font-size:{c.get('tam2', 112)}px;color:{AM};white-space:nowrap">{l2}</div>
</div>
<div class="camada" style="left:0;right:0;bottom:62px;display:flex;justify-content:center">
  <div style="width:150px;height:50px;border:2.5px solid rgba(242,232,216,.8);border-radius:999px;display:flex;align-items:center;justify-content:center">
    <svg width="86" height="16" viewBox="0 0 86 16" fill="none" stroke="{C}" stroke-width="2.5" stroke-linecap="round"><path d="M2 8h80M72 2l9 6-9 6"/></svg>
  </div>
</div>"""
    return pagina(corpo)


def slide_perfume(p, k, total, base):
    foto = g.uri(p["fundo"], base)
    frasco = g.uri(p["frasco"], base)
    alt = p.get("altura", 700)
    larg = p.get("largura_max", 440)
    tam = p.get("tam_nome", 84)
    notas = "".join(f'<div class="lin"><b>{html.escape(r)}</b><span>{html.escape(v).replace('-', '‑')}</span></div>'
                    for r, v in (("TOPO", p["topo"]), ("CORAÇÃO", p["coracao"]), ("BASE", p["base"])))
    if p.get("lembra"):
        extra = f'<div class="sep"></div><div class="lin" style="margin-bottom:0"><b>LEMBRA</b></div><div class="lembra">{rico(p["lembra"])}</div>'
    elif p.get("extra"):
        extra = f'<div class="sep"></div><div class="lin" style="margin-bottom:0"><b>{html.escape(p["extra"][0])}</b></div><div class="lembra">{rico(p["extra"][1])}</div>'
    else:
        extra = ""
    corpo = f"""
<div class="foto" style="background-image:url('{foto}');background-position:{p.get('pos', 'center')};background-size:{p.get('zoom', 'cover')};filter:saturate({p.get('sat', .8)}) brightness({p.get('brilho', .78)}) contrast(1.08)"></div>
<div class="tinta" style="background:{P};mix-blend-mode:color;opacity:.32"></div>
<div class="tinta" style="background:linear-gradient(180deg,rgba(10,31,35,.9) 0%,rgba(10,31,35,.45) 24%,rgba(10,31,35,.12) 50%,rgba(10,31,35,.6) 76%,rgba(10,31,35,.95) 100%)"></div>
<div class="cont">{k:02d} / {total:02d}</div>
<div class="camada" style="left:60px;right:60px;top:66px;text-align:center">
  <div class="papel">{html.escape(p['papel'])}</div>
  <div class="marca" style="margin-top:26px">{html.escape(p['marca'].upper())}</div>
  <div class="nome" style="font-size:{tam}px;margin-top:10px">{html.escape(p['nome'])}</div>
</div>
<div class="camada" style="left:40px;width:{larg + 60}px;top:{p.get('topo_frasco', 330)}px;height:{alt + 10}px;display:flex;align-items:flex-end;justify-content:center">
  <img src="{frasco}" style="max-height:{alt}px;max-width:{larg}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.65)) drop-shadow(0 0 60px rgba(212,154,78,.18)){'' if p.get('reflexo') is False else ';-webkit-box-reflect:below 2px linear-gradient(transparent 88%,rgba(255,255,255,.12))'}">
</div>
<div class="camada card" style="left:{larg + 120}px;right:56px;top:{p.get('topo_card', 360)}px">
  <h3>NOTAS</h3>{notas}{extra}
</div>
<div class="camada" style="left:70px;right:70px;bottom:104px">
  {f'<div class="nafoto">NA FOTO · {html.escape(p["na_foto"].upper())}</div>' if p.get('na_foto') and p.get('mostrar_na_foto') else ''}
  <div class="frase">{rico(p['frase'])}</div>
</div>
<div class="rod">@valotaparfum</div>"""
    return pagina(corpo)


def slide_final(f, base):
    foto = g.uri(f["foto"], base)
    corpo = f"""
<div class="foto" style="background-image:url('{foto}');background-position:{f.get('pos', 'center 30%')};filter:blur(6px) brightness(.45);transform:scale(1.06)"></div>
<div class="tinta" style="background:{P};mix-blend-mode:color;opacity:.6"></div>
<div class="tinta" style="background:radial-gradient(ellipse 90% 70% at 50% 50%,rgba(10,31,35,.55) 0%,rgba(10,31,35,.92) 100%)"></div>
{perfil()}
<div class="camada" style="left:80px;right:80px;top:300px;text-align:center">
  <div style="font-size:34px;font-weight:600;line-height:1.35;color:{C}">{rico(f['pergunta'])}</div>
  <div class="nome" style="font-size:104px;margin-top:40px">{rico(f['titulo'])}</div>
  <div style="margin-top:46px"><span style="display:inline-block;background:{AM};color:{N};font-weight:900;font-size:44px;letter-spacing:.08em;padding:20px 46px;border-radius:999px">{html.escape(f['pilula'])}</span></div>
  <div style="margin-top:70px;height:1.5px;background:rgba(242,232,216,.25)"></div>
  <div style="margin-top:46px;font-size:34px;line-height:1.4">{rico(f['segue'])}</div>
  <div style="margin-top:26px;font-size:27px;font-weight:600;letter-spacing:.06em;color:rgba(242,232,216,.7)">{rico(f.get('salva', ''))}</div>
</div>
<div class="rod">@valotaparfum</div>"""
    return pagina(corpo)


def main():
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    d = json.loads(arq.read_text(encoding="utf-8"))
    saida = base / "saida"
    saida.mkdir(exist_ok=True)
    so = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None  # ex.: 01,03 para refazer só alguns
    ps = d["perfumes"]
    paginas = [capa(d["capa"], base)] + [slide_perfume(p, k, len(ps), base) for k, p in enumerate(ps, 1)] + [slide_final(d["final"], base)]
    nomes = []
    for k, pg in enumerate(paginas, 1):
        png = saida / f"{k:02d}.png"
        nomes.append(png.name)
        if so and f"{k:02d}" not in so:
            continue
        g.render(pg, png)
        print("ok", png)
    (saida / "previa.html").write_text(
        '<body style="background:#222;display:flex;flex-wrap:wrap;gap:12px;padding:12px">' +
        "".join(f'<img src="{n}" style="width:360px">' for n in nomes) + "</body>", encoding="utf-8")


if __name__ == "__main__":
    main()

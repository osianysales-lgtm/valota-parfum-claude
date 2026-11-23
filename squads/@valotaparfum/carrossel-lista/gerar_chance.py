#!/usr/bin/env python3
"""Carrossel "N% DE CHANCE DE SER ELOGIADO" da Valota Parfum, 1080x1350.

Referência: post da @ingridrezende_ (Harvey Specter + frascos, 1% -> 100%).
v2 (16/11/2026, pedido da Osiany): personagem RECORTADO e nítido no centro, cena ao fundo
desfocada e escurecida em petróleo, frascos EM VOLTA do personagem (arco de elipse) com
luz por trás pra realçar, texto embaixo. Último slide opcional: CTA do grupo (do NOIR).

Uso:
    python3 gerar_chance.py carrosseis/<nome>/carrossel.json [01,03]
Saída: carrosseis/<nome>/saida/01.png ... + previa.html

JSON por slide:
  "pct": "1%", "sub": "quase lá" (opcional)
  "foto": cena de fundo (fica desfocada), "pos": "50% 30%" (enquadramento do fundo)
  "pessoa": PNG recortado do personagem, "p_alt": altura em px, "p_x": centro x, "p_y": topo y
  "frascos": [lado esquerdo de cima pra baixo, depois lado direito de cima pra baixo; ímpar: o último vai embaixo no centro]
  "h": altura dos frascos, "cx","cy","rx","ry": elipse, "ang": abertura de cada lado (graus), "y_extra"/"esc_extra"
  "y_meio": centro vertical do texto (padrão 690 = meio do slide; texto com contorno petróleo)
Frasco: "frascos/x.png" ou {"src": "frascos/x.png", "esc": 1.1, "dx": 0, "dy": 0, "brilho": 1.6, "contraste": 1.25}.
"""
import html
import json
import math
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar as g  # noqa: E402
import gerar_noir as nr  # noqa: E402

P, N, C, AM = g.PETROLEO, g.NOITE, g.CREME, g.AMBAR

CSS_X = f"""<style>
.fr{{position:absolute;transform:translate(-50%,-50%);z-index:11}}
.fr .luz{{position:absolute;left:50%;top:55%;width:230%;height:120%;transform:translate(-50%,-50%);
  background:radial-gradient(ellipse at center,rgba(242,232,216,.34) 0%,rgba(212,154,78,.14) 34%,rgba(242,232,216,0) 66%);z-index:0}}
.fr img{{position:relative;z-index:1;display:block;height:100%;width:auto;
  filter:brightness(1.1) contrast(1.06) saturate(1.12) drop-shadow(0 16px 20px rgba(5,15,18,.6)) drop-shadow(0 0 1px rgba(242,232,216,.55))}}
.pessoa{{position:absolute;z-index:5;transform:translateX(-50%);
  filter:brightness(1.06) contrast(1.06) saturate(.85) drop-shadow(0 0 40px rgba(5,15,18,.6));
  -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 72%,transparent 100%)}}
.pct{{font-family:'Gotham Black','Montserrat',sans-serif;font-weight:900;color:{AM};font-size:172px;line-height:.92;letter-spacing:.01em;
  -webkit-text-stroke:16px {N};paint-order:stroke fill;text-shadow:0 8px 34px rgba(5,15,18,.85)}}
.chance{{font-family:'Montserrat',sans-serif;font-weight:900;font-size:62px;color:{C};line-height:1.06;margin-top:10px;letter-spacing:.005em;
  -webkit-text-stroke:11px {N};paint-order:stroke fill;text-shadow:0 5px 26px rgba(5,15,18,.9)}}
.sub{{display:inline-block;font-weight:800;font-size:30px;letter-spacing:.3em;text-transform:uppercase;color:{N};background:{AM};
  padding:10px 22px 10px 30px;border-radius:999px;margin-top:20px;box-shadow:0 6px 24px rgba(5,15,18,.6)}}
.miolo{{position:absolute;left:0;right:0;transform:translateY(-50%);text-align:center;z-index:12}}
.fundo-texto{{position:absolute;left:50%;transform:translate(-50%,-50%);width:900px;height:520px;z-index:7;
  background:radial-gradient(ellipse at center,rgba(10,31,35,.72) 0%,rgba(10,31,35,.45) 42%,rgba(10,31,35,0) 70%)}}
.rod{{bottom:30px!important;font-size:24px!important}}
</style>"""


def arco(n, a0, a1):
    if n == 1:
        return [(a0 + a1) / 2]
    return [a0 + (a1 - a0) * k / (n - 1) for k in range(n)]


def slide(s, base):
    foto = g.uri(s["foto"], base)
    h = s.get("h", 230)
    cx, cy, rx, ry = s.get("cx", 540), s.get("cy", 660), s.get("rx", 440), s.get("ry", 540)
    fs = [({"src": f} if isinstance(f, str) else f) for f in s["frascos"]]
    # Frascos nas DUAS LATERAIS do personagem (arco de elipse), deixando livre o rosto (em cima)
    # e o texto (no meio). Ordem da lista: lado esquerdo de cima pra baixo, depois o direito de cima
    # pra baixo; se for ímpar, o último vai embaixo no centro.
    meia = s.get("ang", 60)  # cada lado vai de +meia a -meia graus em torno do horizontal
    extra = fs.pop() if len(fs) % 2 else None
    k = len(fs) // 2
    pos = []
    for lado, grupo in ((-1, fs[:k]), (1, fs[k:])):
        for i, f in enumerate(grupo):
            a = math.radians(meia - (2 * meia) * (i / (k - 1) if k > 1 else .5))
            pos.append((f, cx + lado * rx * math.cos(a), cy - ry * math.sin(a), 1.0))
    if extra:
        pos.append((extra, cx, s.get("y_extra", 1100), s.get("esc_extra", .9)))
    frascos = ""
    for f, x, y, e in pos:
        src, esc = f["src"], f.get("esc", 1.0) * e
        x, y = x + f.get("dx", 0), y + f.get("dy", 0)
        realce = ""
        if f.get("brilho"):  # frasco escuro com rótulo pequeno (ex.: Hawas Black): clareia e dá mais contraste
            realce = (f' style="filter:brightness({f["brilho"]}) contrast({f.get("contraste", 1.25)}) '
                      f'drop-shadow(0 16px 20px rgba(5,15,18,.6)) drop-shadow(0 0 1.5px rgba(242,232,216,.8))"')
        frascos += (f'<div class="fr" style="left:{x:.0f}px;top:{y:.0f}px;height:{round(h * esc)}px">'
                    f'<div class="luz"></div><img src="{g.uri(src, base)}"{realce}></div>')
    pessoa = ""
    if s.get("pessoa"):
        # "p_oval": true -> foto INTEIRA (sem recorte) com bordas esfumadas em oval. Para foto de fundo preto,
        # onde o recorte automático "come" o topo do cabelo e deixa um risco reto.
        oval = ("-webkit-mask-image:radial-gradient(ellipse 50% 56% at 50% 44%,#000 58%,transparent 100%);"
                "filter:brightness(1.06) contrast(1.06) saturate(.85);") if s.get("p_oval") else ""
        pessoa = (f'<img class="pessoa" src="{g.uri(s["pessoa"], base)}" '
                  f'style="left:{s.get("p_x", 540)}px;top:{s.get("p_y", 200)}px;height:{s.get("p_alt", 1000)}px;{oval}">')
    ym = s.get("y_meio", 690)  # centro vertical do bloco de texto (meio do slide = aparece na grade do perfil)
    sub = f'<div class="sub">{html.escape(s["sub"])}</div>' if s.get("sub") else ""
    corpo = f"""{CSS_X}
<div class="foto" style="background-image:url('{foto}');background-size:cover;background-position:{s.get('pos', '50% 30%')};filter:blur(9px) brightness({s.get('brilho', .5)}) saturate(.4);transform:scale(1.08)"></div>
<div class="tinta" style="background:{P};mix-blend-mode:color;opacity:.6"></div>
<div class="tinta" style="background:radial-gradient(ellipse 70% 55% at 50% 40%,rgba(26,74,82,.35) 0%,rgba(10,31,35,0) 60%),linear-gradient(180deg,rgba(10,31,35,.2) 0%,rgba(10,31,35,0) 30%)"></div>
{pessoa}
<div class="tinta" style="z-index:6;background:linear-gradient(180deg,rgba(10,31,35,0) 0%,rgba(10,31,35,0) 76%,rgba(10,31,35,.8) 93%,rgba(10,31,35,.95) 100%)"></div>
<div class="fundo-texto" style="top:{ym}px"></div>
{frascos}
<div class="miolo" style="top:{ym}px">
  <div class="pct">{html.escape(s['pct'])}</div>
  <div class="chance">de chance de<br>ser elogiado</div>
  {sub}
</div>
<div class="rod">@valotaparfum</div>"""
    return nr.pagina(corpo)


CSS_CTA = f"""<style>
.cta{{position:absolute;left:70px;right:70px;top:150px;text-align:center;z-index:12}}
.cta h2{{font-family:'Gotham Black','Montserrat',sans-serif;font-weight:900;font-size:84px;line-height:1;color:{C};text-transform:uppercase;
  -webkit-text-stroke:12px {N};paint-order:stroke fill;text-shadow:0 6px 30px rgba(5,15,18,.85)}}
.cta h2 strong{{color:{AM};font-weight:900}}
.cta p{{font-size:44px;font-weight:500;line-height:1.32;color:{C};margin-top:34px;text-shadow:0 3px 18px rgba(5,15,18,.9)}}
.cta p strong{{font-weight:900;color:{AM}}}
.ig{{position:absolute;left:70px;right:70px;top:610px;z-index:12;background:{C};border-radius:36px;padding:38px 36px 36px;
  box-shadow:0 30px 70px rgba(0,0,0,.5)}}
.ig .lin{{display:flex;align-items:center;gap:26px;margin-bottom:32px}}
.ig .anel{{flex:none;width:132px;height:132px;border-radius:50%;padding:6px;
  background:conic-gradient(from 200deg,{g.AMARELO},{AM},{g.LUZ},{AM},{g.AMARELO})}}
.ig .anel div{{width:120px;height:120px;border-radius:50%;border:5px solid {C};background-size:cover;background-position:center}}
.ig .dados{{flex:1;min-width:0;color:{N}}}
.ig .usuario{{font-weight:800;font-size:42px;letter-spacing:-.3px}}
.ig .nm{{font-size:32px;color:rgba(10,31,35,.6);margin-top:4px}}
.ig .seguir{{flex:none;background:{P};color:{C};font-weight:800;font-size:34px;padding:22px 52px;border-radius:18px}}
.ig .grade{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}}
.ig .grade div{{aspect-ratio:3/4;border-radius:16px;background-size:cover;background-position:center}}
</style>"""


def slide_cta(f, base):
    """Último slide: CTA (salva + segue) + cartão do perfil do Instagram com botão Seguir e as 3 últimas
    publicações. Sem número de seguidores (pedido da Osiany)."""
    foto = g.uri(f["foto"], base)
    mini = "".join(f'<div style="background-image:url(\'{g.uri(m, base)}\')"></div>' for m in f["feed"][:3])
    corpo = f"""{CSS_CTA}
<div class="foto" style="background-image:url('{foto}');background-position:{f.get('pos', 'center 30%')};filter:blur(10px) brightness(.4) saturate(.4);transform:scale(1.08)"></div>
<div class="tinta" style="background:{P};mix-blend-mode:color;opacity:.6"></div>
<div class="tinta" style="background:radial-gradient(ellipse 90% 70% at 50% 40%,rgba(10,31,35,.4) 0%,rgba(10,31,35,.85) 100%)"></div>
<div class="cta">
  <h2>{nr.rico(f['titulo'])}</h2>
  <p>{nr.rico(f['texto'])}</p>
</div>
<div class="ig">
  <div class="lin">
    <div class="anel"><div style="background-image:url('{g.uri(f['avatar'], base)}')"></div></div>
    <div class="dados"><div class="usuario">{html.escape(f.get('usuario', 'valotaparfum'))}</div><div class="nm">{html.escape(f.get("nome", "Valota Parfum"))}</div></div>
    <div class="seguir">Seguir</div>
  </div>
  <div class="grade">{mini}</div>
</div>"""
    return nr.pagina(corpo)


def main():
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    d = json.loads(arq.read_text(encoding="utf-8"))
    saida = base / "saida"
    saida.mkdir(exist_ok=True)
    so = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
    paginas = [slide(s, base) for s in d["slides"]]
    if d.get("cta"):
        paginas.append(slide_cta(d["cta"], base))
    elif d.get("final"):
        paginas.append(nr.slide_final(d["final"], base))
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

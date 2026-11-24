#!/usr/bin/env python3
"""Capas novas da Black Friday (24/11) · 3 conceitos por parte, fora do modelo "tarja" dos outros carrosséis.
P1 (escuro): A etiqueta de loja · B vitrine com lockup · C cupom fiscal
P2 (creme):  A tag de presente · B caixa de presente · C lista de presentes
Uso: python3 capas_black.py  → carrosseis/2026-11-24-black-friday-parteN/saida/capa-opcoes/*.png"""
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar as g  # noqa: E402

C1 = AQUI / "carrosseis/2026-11-24-black-friday-parte1"
C2 = AQUI / "carrosseis/2026-11-24-black-friday-parte2"
P1 = [C1 / f"frascos/{n}.png" for n in ("liquid", "asadbourbon", "9pm", "supremacy", "hawas")]
P2 = [C2 / f"frascos/{n}.png" for n in ("cdnwoman2e", "yara2e", "delilah", "maleka", "vulcan")]
ROSA = "#E6AEB9"
ROSA_F = "#C9798A"   # sombra do cetim (mesma família rosa, mais funda)
MONO = "'Courier New',Courier,monospace"

GRAO = ("<svg style='position:absolute;inset:0;width:100%;height:100%;opacity:.09;mix-blend-mode:overlay;z-index:30;pointer-events:none'>"
        "<filter id='gr'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
        "<feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#gr)'/></svg>")


def marca(cor=g.CREME, borda="rgba(242,232,216,.5)"):
    return (f'<div style="position:absolute;top:52px;left:56px;display:flex;align-items:center;gap:16px;z-index:20">'
            f'<div style="width:72px;height:72px;border-radius:50%;background:url(\'{g.AVATAR}\') center/cover;border:2px solid {borda}"></div>'
            f'<span style="color:{cor};font-size:27px;font-weight:600">Valota Parfum</span></div>')


def arrasta(cor, y=1262):
    return (f'<div style="position:absolute;top:{y}px;left:0;right:0;text-align:center;color:{cor};font-size:24px;font-weight:600;'
            f'letter-spacing:.32em;z-index:20;opacity:.85">ARRASTA →</div>')


def fileira(frascos, base_y, alturas, xs, escuro=True, refl=True):
    """Frascos lado a lado apoiados numa prateleira em y=base_y (alinhados pela base)."""
    out = []
    for f, h, x in zip(frascos, alturas, xs):
        u = f.as_uri()
        if refl:
            out.append(f'<img src="{u}" style="position:absolute;left:{x}px;top:{base_y}px;height:{h}px;transform:translateX(-50%) scaleY(-1);'
                       f'transform-origin:50% 0;opacity:{.22 if escuro else .16};filter:blur(1.5px);'
                       f'-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9) 0%,transparent 30%);z-index:9">')
        out.append(f'<div style="position:absolute;left:{x}px;top:{base_y - 16}px;width:{int(h * .55)}px;height:30px;transform:translateX(-50%);'
                   f'background:radial-gradient(ellipse,rgba(0,0,0,{.6 if escuro else .32}) 0%,transparent 70%);z-index:9"></div>')
        out.append(f'<img src="{u}" style="position:absolute;left:{x}px;top:{base_y - h}px;height:{h}px;transform:translateX(-50%);'
                   f'filter:drop-shadow(0 18px 22px rgba(0,0,0,{.45 if escuro else .25}));z-index:10">')
    return "".join(out)


def fundo_noite():
    return (f'<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 30%,{g.LUZ} 0%,{g.PETROLEO} 45%,{g.NOITE} 78%,#061316 100%)"></div>')


def holofotes(xs, topo, base, cor="rgba(255,226,170,.16)"):
    return "".join(f'<div style="position:absolute;left:{x}px;top:{topo}px;width:260px;height:{base - topo}px;transform:translateX(-50%);'
                   f'background:linear-gradient(180deg,{cor},transparent);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%);z-index:2"></div>' for x in xs)


def barras(cor, w=230, h=70):
    larg = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2]
    x, r = 0, []
    for i, l in enumerate(larg):
        if i % 2 == 0: r.append(f'<rect x="{x}" y="0" width="{l * 2.2}" height="{h}" fill="{cor}"/>')
        x += l * 2.2 + 2
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {x} {h}" preserveAspectRatio="none">{"".join(r)}</svg>'


# ───────────────────────── PARTE 1 ─────────────────────────
XS5 = [150, 335, 540, 745, 930]


def p1_etiqueta():
    tag = f"""
<svg style="position:absolute;left:0;top:0;width:1080px;height:300px;z-index:11"><path d="M540 -10 C 560 80, 520 140, 548 206" stroke="{g.AMBAR}" stroke-width="4" fill="none"/></svg>
<div style="position:absolute;left:150px;top:180px;width:780px;height:600px;transform:rotate(-4deg);transform-origin:50% 0;z-index:12;
     filter:drop-shadow(0 30px 40px rgba(0,0,0,.55))">
  <div style="position:absolute;inset:0;background:{g.CREME};clip-path:polygon(16% 0,84% 0,100% 13%,100% 100%,0 100%,0 13%);border-radius:6px"></div>
  <div style="position:absolute;left:50%;top:26px;width:44px;height:44px;margin-left:-22px;border-radius:50%;background:#061316;box-shadow:inset 0 0 0 6px {g.AMBAR}"></div>
  <div style="position:absolute;left:0;right:0;top:100px;text-align:center;color:{g.PETROLEO};font-size:30px;font-weight:700;letter-spacing:.42em">★ BLACK FRIDAY ★</div>
  <div style="position:absolute;left:0;right:0;top:150px;text-align:center;color:{g.NOITE};font-family:'Gotham Black';font-size:100px;line-height:1;letter-spacing:-.01em;white-space:nowrap">OS 5 ÁRABES</div>
  <div style="position:absolute;left:0;right:0;top:272px;text-align:center;color:{g.PETROLEO};font-size:52px;font-weight:500;font-style:italic">que <b style="font-weight:900">valem o desconto</b></div>
  <div style="position:absolute;left:46px;right:46px;top:384px;border-top:4px dashed rgba(15,46,51,.35)"></div>
  <div style="position:absolute;left:52px;top:425px;display:flex;flex-direction:column;gap:8px">
    <span style="background:{g.NOITE};color:{g.AMARELO};font-size:40px;font-weight:900;letter-spacing:.08em;padding:12px 26px 10px;border-radius:10px">PARTE 1</span>
    <span style="color:{g.PETROLEO};font-size:24px;font-weight:600;letter-spacing:.2em;padding-left:4px">DE 2 · ANOTA</span>
  </div>
  <div style="position:absolute;right:52px;top:428px;text-align:center">{barras(g.NOITE, 260, 84)}
    <div style="font-family:{MONO};font-size:20px;color:{g.PETROLEO};letter-spacing:.2em;margin-top:6px">24·11·VALOTA</div></div>
</div>"""
    corpo = (fundo_noite() + holofotes(XS5, 760, 1200) + tag + fileira(P1, 1170, [300, 320, 330, 290, 300], XS5)
             + f'<div style="position:absolute;left:0;right:0;top:1170px;height:2px;background:linear-gradient(90deg,transparent,rgba(212,154,78,.6),transparent);z-index:8"></div>'
             + marca() + arrasta(g.CREME) + GRAO)
    return g.pagina(corpo)


def misterio(frascos, base_y, alturas, xs):
    """Frascos desfocados atrás de 'vidro fosco' + etiquetinha '?' pendurada em cada um: dá pra ver que são 5 perfumes, mas não quais."""
    out = []
    for i, (f, h, x) in enumerate(zip(frascos, alturas, xs)):
        out.append(f'<div style="position:absolute;left:{x}px;top:{base_y - 16}px;width:{int(h * .6)}px;height:30px;transform:translateX(-50%);'
                   f'background:radial-gradient(ellipse,rgba(0,0,0,.65) 0%,transparent 70%);z-index:9"></div>')
        out.append(f'<img src="{f.as_uri()}" style="position:absolute;left:{x}px;top:{base_y - h}px;height:{h}px;transform:translateX(-50%);z-index:10;'
                   f'filter:blur(16px) brightness(.9) drop-shadow(0 0 22px rgba(212,154,78,.35))">')
        rot = (-9, 7, -6, 8, -7)[i]
        ty = base_y - h * .62
        out.append(f'<svg style="position:absolute;left:{x - 40}px;top:{base_y - h - 10}px;width:80px;height:{ty - (base_y - h) + 20}px;z-index:11;overflow:visible">'
                   f'<path d="M40 0 C 30 {h * .2}, 50 {h * .35}, 40 {ty - (base_y - h) + 14}" stroke="{g.AMBAR}" stroke-width="3" fill="none"/></svg>')
        out.append(f'<div style="position:absolute;left:{x}px;top:{ty}px;width:118px;height:150px;transform:translateX(-50%) rotate({rot}deg);transform-origin:50% 0;z-index:12;'
                   f'filter:drop-shadow(0 12px 16px rgba(0,0,0,.55))">'
                   f'<div style="position:absolute;inset:0;background:{g.CREME};clip-path:polygon(22% 0,78% 0,100% 16%,100% 100%,0 100%,0 16%);border-radius:4px"></div>'
                   f'<div style="position:absolute;left:50%;top:10px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:#061316;box-shadow:inset 0 0 0 3px {g.AMBAR}"></div>'
                   f'<div style="position:absolute;left:0;right:0;top:30px;text-align:center;font-family:\'Gotham Black\';font-size:74px;line-height:1;color:{g.NOITE}">?</div>'
                   f'<div style="position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:18px;font-weight:800;letter-spacing:.18em;color:#9C452A">Nº {i + 1}</div></div>')
    return "".join(out)


def p1_etiqueta_misterio():
    h = p1_etiqueta()
    i0 = h.index('<img src="file://')  # 1º frasco da fileira → troca a fileira inteira pela silhueta
    real = fileira(P1, 1170, [300, 320, 330, 290, 300], XS5)
    h = h.replace(real, misterio(P1, 1170, [300, 320, 330, 290, 300], XS5))
    return h.replace('>ARRASTA →<', '>ARRASTA PRA DESCOBRIR →<')


def p1_vitrine():
    fil = f'<div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,{g.AMBAR})"></div>'
    filr = f'<div style="flex:1;height:2px;background:linear-gradient(90deg,{g.AMBAR},transparent)"></div>'
    titulo = f"""
<div style="position:absolute;left:70px;right:70px;top:170px;z-index:12;text-align:center">
  <div style="display:flex;align-items:center;gap:26px">{fil}<span style="color:{g.CREME};font-size:38px;font-weight:300;letter-spacing:.5em;padding-left:.5em">A LISTA DA</span>{filr}</div>
  <div style="font-family:'Gotham Black';font-size:248px;line-height:.95;margin-top:10px;letter-spacing:-.02em;
       background:linear-gradient(180deg,{g.AMARELO} 0%,{g.AMBAR} 70%,#B07A35 100%);-webkit-background-clip:text;color:transparent;
       filter:drop-shadow(0 10px 30px rgba(0,0,0,.45))">BLACK</div>
  <div style="display:flex;align-items:center;gap:26px;margin-top:8px">{fil}<span style="color:{g.CREME};font-size:40px;font-weight:300;letter-spacing:.06em">5 árabes que <b style="font-weight:800">valem o desconto</b></span>{filr}</div>
</div>
<div style="position:absolute;left:806px;top:640px;width:200px;height:200px;border-radius:50%;background:{g.AMARELO};transform:rotate(12deg);z-index:14;
     display:flex;flex-direction:column;align-items:center;justify-content:center;color:{g.NOITE};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 0 0 6px {g.AMARELO},inset 0 0 0 9px {g.NOITE}">
  <span style="font-size:26px;font-weight:800;letter-spacing:.2em">PARTE</span><span style="font-family:'Gotham Black';font-size:92px;line-height:.9">1</span><span style="font-size:22px;font-weight:700;letter-spacing:.2em">DE 2</span></div>"""
    corpo = (fundo_noite() + holofotes(XS5, 560, 1190, "rgba(255,226,170,.20)") + titulo
             + fileira(P1, 1150, [330, 360, 380, 330, 340], XS5)
             + f'<div style="position:absolute;left:0;right:0;top:1150px;height:2px;background:linear-gradient(90deg,transparent,rgba(212,154,78,.7),transparent);z-index:8"></div>'
             + marca() + arrasta(g.CREME, 1270) + GRAO)
    return g.pagina(corpo)


def cupom(titulo, sub, linhas, total, papel, tinta, carimbo, carimbo_cor):
    ls = "".join(f'<div style="display:flex;justify-content:space-between;gap:14px;padding:9px 0"><span><b>{n}</b> {t}</span><b style="white-space:nowrap">{v}</b></div>'
                 for n, t, v in linhas)
    serr = "polygon(" + ",".join(f"{i * 2.5}% {100 if i % 2 == 0 else 97.6}%" for i in range(41)) + ",100% 0,0 0)"
    return f"""
<div style="position:absolute;left:150px;top:150px;width:760px;transform:rotate(-3deg);z-index:12;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))">
 <div style="background:{papel};clip-path:{serr};padding:46px 50px 70px;font-family:{MONO};font-weight:700;color:{tinta};font-size:30px;line-height:1.25">
  <div style="text-align:center;font-family:'Montserrat';font-weight:900;font-size:34px;letter-spacing:.22em">VALOTA PARFUM</div>
  <div style="text-align:center;font-size:22px;letter-spacing:.12em;margin-top:4px;opacity:.8">achados de perfumaria</div>
  <div style="border-top:3px dashed {tinta};opacity:.45;margin:24px 0 18px"></div>
  <div style="text-align:center;font-family:'Gotham Black';font-size:66px;line-height:1.02;letter-spacing:-.01em">{titulo}</div>
  <div style="text-align:center;font-weight:700;font-size:26px;margin-top:10px;letter-spacing:.06em">{sub}</div>
  <div style="border-top:3px dashed {tinta};opacity:.45;margin:20px 0 10px"></div>
  {ls}
  <div style="border-top:3px dashed {tinta};opacity:.45;margin:12px 0 16px"></div>
  <div style="display:flex;justify-content:space-between;font-weight:700;font-size:30px"><span>TOTAL</span><span>{total}</span></div>
  <div style="display:flex;justify-content:center;margin-top:26px">{barras(tinta, 420, 70)}</div>
 </div>
 <div style="position:absolute;right:-60px;top:770px;transform:rotate(-12deg);border:7px solid {carimbo_cor};color:{carimbo_cor};border-radius:14px;
      padding:10px 22px 6px;font-family:'Gotham Black';font-size:50px;line-height:1;text-align:center;background:rgba(255,255,255,.55);letter-spacing:.02em">{carimbo}</div>
</div>"""


def p1_cupom():
    linhas = [("01", "lembra nicho francês", "✓ VALE"), ("02", "lembra Azzaro", "✓ VALE"), ("03", "lembra Jean Paul", "✓ VALE"),
              ("04", "lembra Creed", "✓ VALE"), ("05", "lembra Nishane", "✓ VALE")]
    corpo = (fundo_noite() + cupom("CUPOM DA<br>BLACK FRIDAY", "PARTE 1 DE 2 · 5 ÁRABES", linhas, "5 que valem o desconto",
                                   "#FBF6EC", g.NOITE, "SÓ OS QUE<br>VALEM", "#9C452A")
             + f'<img src="{P1[0].as_uri()}" style="position:absolute;left:40px;top:860px;height:400px;transform:rotate(-8deg);z-index:13;filter:drop-shadow(0 24px 30px rgba(0,0,0,.55))">'
             + marca() + arrasta(g.CREME) + GRAO)
    return g.pagina(corpo)


# ───────────────────────── PARTE 2 ─────────────────────────
def fundo_creme():
    return (f'<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 35%,#FBF5EA 0%,{g.CREME} 60%,#E6D9C3 100%)"></div>'
            f'<div style="position:absolute;inset:0;opacity:.35;background:repeating-linear-gradient(45deg,transparent 0 34px,rgba(230,174,185,.25) 34px 36px)"></div>')


def laco(cx, cy, s=1.0):
    """Laço de cetim rosa (SVG) centrado em (cx, cy)."""
    return f"""<svg viewBox="0 0 400 300" style="position:absolute;left:{cx - 200 * s}px;top:{cy - 150 * s}px;width:{400 * s}px;height:{300 * s}px;z-index:15;filter:drop-shadow(0 12px 16px rgba(10,31,35,.3))">
<defs><linearGradient id="ct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4C9D1"/><stop offset=".55" stop-color="{ROSA}"/><stop offset="1" stop-color="{ROSA_F}"/></linearGradient></defs>
<path d="M200 150 L150 290 L120 262 L95 286 L172 140 Z" fill="url(#ct)"/><path d="M200 150 L250 290 L280 262 L305 286 L228 140 Z" fill="url(#ct)"/>
<path d="M200 150 C 140 40, 20 40, 30 120 C 38 190, 140 180, 200 150 Z" fill="url(#ct)"/><path d="M200 150 C 260 40, 380 40, 370 120 C 362 190, 260 180, 200 150 Z" fill="url(#ct)"/>
<path d="M200 150 C 150 85, 70 80, 68 118" stroke="{ROSA_F}" stroke-width="5" fill="none" opacity=".55"/><path d="M200 150 C 250 85, 330 80, 332 118" stroke="{ROSA_F}" stroke-width="5" fill="none" opacity=".55"/>
<rect x="172" y="122" width="56" height="56" rx="18" fill="url(#ct)" stroke="{ROSA_F}" stroke-width="3"/></svg>"""


def fita_h(y, h=90):
    return (f'<div style="position:absolute;left:0;right:0;top:{y}px;height:{h}px;z-index:5;'
            f'background:linear-gradient(180deg,#F4C9D1 0%,{ROSA} 45%,{ROSA_F} 100%);box-shadow:0 8px 18px rgba(10,31,35,.18)"></div>')


def p2_tag():
    tag = f"""
<svg style="position:absolute;left:0;top:0;width:1080px;height:420px;z-index:13"><path d="M540 250 C 520 300, 560 330, 540 372" stroke="{g.AMBAR}" stroke-width="4" fill="none"/></svg>
<div style="position:absolute;left:190px;top:340px;width:700px;height:520px;transform:rotate(3deg);transform-origin:50% 0;z-index:12;filter:drop-shadow(0 26px 34px rgba(10,31,35,.4))">
  <div style="position:absolute;inset:0;background:{g.PETROLEO};clip-path:polygon(18% 0,82% 0,100% 15%,100% 100%,0 100%,0 15%);border-radius:6px"></div>
  <div style="position:absolute;inset:14px;border:2px solid rgba(212,154,78,.55);clip-path:polygon(18% 0,82% 0,100% 15%,100% 100%,0 100%,0 15%)"></div>
  <div style="position:absolute;left:50%;top:26px;width:40px;height:40px;margin-left:-20px;border-radius:50%;background:{g.CREME};box-shadow:inset 0 0 0 6px {g.AMBAR}"></div>
  <div style="position:absolute;left:60px;right:60px;top:100px;color:{g.CREME};font-size:34px;font-weight:300;line-height:1.5">
    <div><span style="font-weight:800;letter-spacing:.2em;font-size:26px;color:{g.AMBAR}">PARA</span>&nbsp; <i>quem você ama</i></div>
    <div><span style="font-weight:800;letter-spacing:.2em;font-size:26px;color:{g.AMBAR}">DE</span>&nbsp; <i>você, na Black 🎁</i></div></div>
  <div style="position:absolute;left:0;right:0;top:236px;text-align:center;color:{g.CREME};font-family:'Gotham Black';font-size:92px;line-height:1;white-space:nowrap">5 PRESENTES</div>
  <div style="position:absolute;left:0;right:0;top:350px;text-align:center;color:{ROSA};font-size:44px;font-weight:600;font-style:italic">que não erram</div>
  <div style="position:absolute;left:0;right:0;top:436px;text-align:center;color:{g.CREME};font-size:24px;font-weight:700;letter-spacing:.36em;opacity:.8">PARTE 2 DE 2</div>
</div>"""
    xs = [150, 335, 540, 745, 930]
    corpo = (fundo_creme() + f'<div style="position:absolute;left:490px;top:0;width:100px;height:1350px;z-index:4;background:linear-gradient(90deg,#F4C9D1,{ROSA} 50%,{ROSA_F})"></div>'
             + fita_h(180, 100) + laco(540, 230, 1.0) + tag + fileira(P2, 1180, [280, 300, 250, 300, 300], xs, escuro=False)
             + marca(g.NOITE, "rgba(15,46,51,.35)") + arrasta(g.PETROLEO) + GRAO)
    return g.pagina(corpo)


def p2_caixa():
    xs = [215, 380, 540, 700, 865]
    titulo = f"""
<div style="position:absolute;left:60px;right:60px;top:160px;text-align:center;z-index:12">
  <div style="display:flex;align-items:center;gap:24px"><div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,{g.AMBAR})"></div>
    <span style="color:{g.PETROLEO};font-size:34px;font-weight:300;letter-spacing:.5em;padding-left:.5em">OS 5</span>
    <div style="flex:1;height:2px;background:linear-gradient(90deg,{g.AMBAR},transparent)"></div></div>
  <div style="font-family:'Gotham Black';font-size:150px;line-height:1;color:{g.NOITE};margin-top:14px;letter-spacing:-.01em">PRESENTES</div>
  <div style="color:{g.PETROLEO};font-size:46px;font-weight:300;margin-top:14px">da Black <b style="font-weight:800">pra quem você ama</b></div>
</div>
<div style="position:absolute;left:810px;top:470px;width:180px;height:180px;border-radius:50%;background:{ROSA};transform:rotate(-10deg);z-index:14;
     display:flex;flex-direction:column;align-items:center;justify-content:center;color:{g.NOITE};box-shadow:0 12px 26px rgba(10,31,35,.25),inset 0 0 0 6px {ROSA},inset 0 0 0 9px {g.NOITE}">
  <span style="font-size:24px;font-weight:800;letter-spacing:.2em">PARTE</span><span style="font-family:'Gotham Black';font-size:84px;line-height:.9">2</span><span style="font-size:20px;font-weight:700;letter-spacing:.2em">DE 2</span></div>"""
    caixa = f"""
<div style="position:absolute;left:110px;top:1000px;width:860px;height:350px;z-index:11;background:linear-gradient(180deg,{g.LUZ},{g.PETROLEO} 40%,{g.NOITE});box-shadow:0 -10px 30px rgba(10,31,35,.3)"></div>
<div style="position:absolute;left:90px;top:985px;width:900px;height:44px;z-index:11;background:linear-gradient(180deg,{g.LUZ},{g.PETROLEO});border-radius:6px;box-shadow:0 8px 14px rgba(0,0,0,.3)"></div>
<div style="position:absolute;left:490px;top:985px;width:100px;height:365px;z-index:12;background:linear-gradient(90deg,#F4C9D1,{ROSA} 50%,{ROSA_F})"></div>
<div style="position:absolute;left:0;right:0;top:1110px;text-align:center;z-index:13"><span style="background:{g.CREME};color:{g.NOITE};font-size:30px;font-weight:800;letter-spacing:.14em;padding:12px 26px;border-radius:8px">🎀 NAMORADA · ESPOSA · ELE</span></div>"""
    corpo = (fundo_creme() + titulo + fileira(P2, 1010, [330, 350, 290, 360, 360], xs, escuro=False, refl=False) + caixa
             + laco(540, 1000, .62) + marca(g.NOITE, "rgba(15,46,51,.35)") + '<div style="position:absolute;left:0;right:0;top:1250px;text-align:center;z-index:21"><span style="background:'+g.NOITE+';color:'+g.CREME+';font-size:24px;font-weight:600;letter-spacing:.32em;padding:12px 22px 12px 30px;border-radius:999px">ARRASTA →</span></div>' + GRAO)
    return g.pagina(corpo)


def p2_cupom():
    linhas = [("01", "pra namorada · lembra Chanel", "✓"), ("02", "pra esposa · fofinho", "✓"), ("03", "pra ela · rosa e lichia", "✓"),
              ("04", "pra ela · lembra Carolina", "✓"), ("05", "pra ele · manga e gengibre", "✓")]
    corpo = (fundo_creme() + fita_h(1120, 80)
             + cupom("LISTA DE<br>PRESENTES", "PARTE 2 DE 2 · DA BLACK", linhas, "5 que não erram", "#FFFDF8", g.NOITE, "PRESENTE<br>GARANTIDO", ROSA_F)
             + laco(830, 1150, .55)
             + f'<img src="{P2[0].as_uri()}" style="position:absolute;left:40px;top:900px;height:360px;transform:rotate(-8deg);z-index:13;filter:drop-shadow(0 20px 24px rgba(10,31,35,.35))">'
             + marca(g.NOITE, "rgba(15,46,51,.35)") + arrasta(g.PETROLEO, 1280) + GRAO)
    return g.pagina(corpo)


def main():
    for pasta, itens in ((C1, (("A-etiqueta", p1_etiqueta), ("A-etiqueta-misterio", p1_etiqueta_misterio), ("B-vitrine", p1_vitrine), ("C-cupom", p1_cupom))),
                         (C2, (("A-tag-presente", p2_tag), ("B-caixa", p2_caixa), ("C-lista", p2_cupom)))):
        out = pasta / "saida/capa-opcoes"
        out.mkdir(parents=True, exist_ok=True)
        for nome, f in itens:
            g.render(f(), out / f"capa-{nome}.png")
            print("ok", out / f"capa-{nome}.png")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Carrossel Black Friday 24/11 · conceito CUPOM (lâminas de dentro + final de seguir).
Capa = capas_black.py (opção escolhida). Uso: python3 gerar_black_cupom.py → saida-cupom/02..07.png em cada parte."""
import html
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar as g  # noqa: E402
import capas_black as cb  # noqa: E402

C1, C2 = cb.C1, cb.C2
MONO = cb.MONO


def b(t):
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html.escape(t))


# nota: (rótulo, imagem em ing/ ou None)
P1 = dict(pasta=C1, tema="noite", cab="CUPOM DA BLACK · PARTE 1", selo="✓ VALE O DESCONTO", perfumes=[
    dict(nome="LIQUID BRUN", marca="FRENCH AVENUE", f="liquid", lm="Parfums de Marly", l="ALTHAÏR", tag="casa de nicho francesa",
         notas=[("canela", "canela"), ("baunilha", "baunilha"), ("praliné", "caramelo")], usa="USA: noite, frio e encontro",
         d="Aquele doce quentinho de **canela com baunilha** que faz todo mundo chegar mais perto, e o Althaïr que ele lembra custa **bem mais caro**."),
    dict(nome="ASAD BOURBON", marca="LATTAFA", f="asadbourbon", lm="Azzaro", l="THE MOST WANTED", tag="grife francesa",
         notas=[("cacau", "cacau"), ("baunilha", "baunilha"), ("lavanda", "lavanda")], usa="USA: frio, noite e date",
         d="**Cacau com baunilha** e um toque de lavanda: é doce sem enjoar e agrada quase todo mundo, por isso é um ótimo **presente**."),
    dict(nome="9PM", marca="AFNAN", f="9pm", lm="Jean Paul Gaultier", l="ULTRA MALE", tag="grife francesa",
         notas=[("maçã", "maca"), ("canela", "canela"), ("baunilha", "baunilha")], usa="USA: balada e noite",
         d="O **docinho de maçã com canela** de um dos vídeos que mais rodaram aqui no perfil, porque ninguém acredita que não é o **Ultra Male**."),
    dict(nome="SUPREMACY COLLECTOR'S", marca="AFNAN", f="supremacy", lm="Creed", l="ABSOLU AVENTUS", tag="casa de nicho",
         notas=[("abacaxi", "abacaxi"), ("bergamota", "bergamota"), ("madeira", "betula")], usa="USA: dia, trabalho e calor",
         d="O **queridinho mais recente** da Afnan: abre com abacaxi fresquinho e fica elegante, com cara de **perfume de rico**."),
    dict(nome="HAWAS BLACK", marca="RASASI", f="hawas", lm="Nishane", l="HACIVAT", tag="casa de nicho turca",
         notas=[("toranja", "toranja"), ("abacaxi", "abacaxi"), ("bergamota", "bergamota")], usa="USA: dia a dia e trabalho",
         d="É o meu: foi com ele que **uma pessoa me parou na rua** só pra perguntar o nome do perfume."),
])
P2 = dict(pasta=C2, tema="creme", cab="LISTA DE PRESENTES · PARTE 2", selo="🎁 PRESENTE GARANTIDO", perfumes=[
    dict(nome="CLUB DE NUIT WOMAN", marca="ARMAF", f="cdnwoman2e", lm="Chanel", l="COCO MADEMOISELLE", tag="grife francesa",
         notas=[("laranja", "laranja"), ("rosa", "rosa")], usa="PRESENTE PRA: a namorada elegante",
         d="O clássico chique de **laranja com rosa** que lembra o **Coco Mademoiselle**, perfeito pra mulher que gosta de chegar arrasando."),
    dict(nome="YARA", marca="LATTAFA", f="yara2e", lm="Aquolina", l="PINK SUGAR", tag="o mais comparado",
         notas=[("orquídea", "orquidea"), ("tangerina", "laranja"), ("baunilha", "baunilha")], usa="PRESENTE PRA: quem ama perfume docinho",
         d="**Cremoso e fofinho** com cara de abraço, é aquele que a pessoa passa e todo mundo pergunta qual é."),
    dict(nome="DELILAH", marca="MAISON ALHAMBRA", f="delilah", lm="Parfums de Marly", l="DELINA", tag="casa de nicho francesa",
         notas=[("rosa", "rosa"), ("lichia", "lichia"), ("baunilha", "baunilha")], usa="PRESENTE PRA: a esposa romântica",
         d="**Rosa com lichia** num frasco lindo de dar de presente, e o Delina que ele lembra custa **bem mais caro**."),
    dict(nome="CLUB DE NUIT MALEKA", marca="ARMAF", f="maleka", lm="Carolina Herrera", l="VERY GOOD GIRL", tag="grife",
         notas=[("lichia", "lichia"), ("praliné", "caramelo")], usa="PRESENTE PRA: quem ama um doce chique",
         d="**Lichia com docinho de praliné** que lembra o Very Good Girl, só que **sem o preço do salto vermelho**."),
    dict(nome="VULCAN FEU", marca="FRENCH AVENUE", f="vulcan", lm="Stéphane Humbert Lucas", l="GOD OF FIRE", tag="casa de nicho",
         notas=[("manga", "manga"), ("gengibre", "gengibre"), ("laranja", "laranja")], usa="PRESENTE PRA: o namorado, o marido ou o pai",
         d="**Manga com gengibre**, diferente de tudo que ele já usou, e lembra o God of Fire, um nicho de **cartão black**."),
])

# posições das notas flutuando no fundo (x, y, tamanho, giro)
FLUT = [(40, 400, 170, -14), (470, 360, 130, 18), (60, 760, 140, 10), (470, 800, 150, -20), (900, 330, 120, 12), (230, 300, 110, 25)]


def cores(tema):
    if tema == "noite":
        return dict(txt=g.CREME, sub="rgba(242,232,216,.72)", acc=g.AMARELO, cart=g.CREME, carttxt=g.NOITE, cartacc="#9C452A",
                    furo="#061316", linha="rgba(242,232,216,.35)", circ="#F2E8D8", circb="#D49A4E")
    return dict(txt=g.NOITE, sub="rgba(10,31,35,.7)", acc=cb.ROSA_F, cart=g.PETROLEO, carttxt=g.CREME, cartacc=g.AMBAR,
                furo=g.CREME, linha="rgba(10,31,35,.3)", circ="rgba(255,255,255,.7)", circb="rgba(201,121,138,.55)")


def fundo(tema):
    if tema == "noite":
        return cb.fundo_noite()
    return cb.fundo_creme()


def cabecalho(cab, i, n, c):
    return (f'<div style="position:absolute;left:64px;right:64px;top:58px;display:flex;justify-content:space-between;font-family:{MONO};font-weight:700;'
            f'font-size:25px;letter-spacing:.06em;color:{c["sub"]};z-index:20"><span>{cab}</span><span>ITEM {i:02d}/{n:02d}</span></div>'
            f'<div style="position:absolute;left:64px;right:64px;top:104px;border-top:3px dashed {c["linha"]};z-index:20"></div>')


def rodape(c):
    return (f'<div style="position:absolute;left:0;right:0;bottom:34px;text-align:center;color:{c["sub"]};font-size:24px;font-weight:600;'
            f'letter-spacing:.04em;z-index:20">@valotaparfum</div>')


def recibo(conteudo, top, altura, tinta=g.NOITE):
    serr = "polygon(0 3%," + ",".join(f"{i * 2.5}% {0 if i % 2 else 3}%" for i in range(41)) + ",100% 100%,0 100%)"
    return (f'<div style="position:absolute;left:58px;right:58px;top:{top}px;height:{altura}px;transform:rotate(-1deg);z-index:15;'
            f'filter:drop-shadow(0 18px 26px rgba(0,0,0,.35))"><div style="position:absolute;inset:0;background:#FBF6EC;clip-path:{serr}"></div>'
            f'<div style="position:absolute;inset:0;padding:42px 46px 30px;color:{tinta}">{conteudo}</div></div>')


def slide(parte, i, p):
    c = cores(parte["tema"])
    base = parte["pasta"]
    ing = lambda k: (base / f"ing/{k}.png").as_uri()  # noqa: E731
    imgs = [k for _, k in p["notas"] if k]
    escuro = parte["tema"] == "noite"
    flut = "".join(
        f'<img src="{ing(imgs[j % len(imgs)])}" style="position:absolute;left:{x}px;top:{y}px;width:{s}px;transform:rotate({r}deg);opacity:.5;z-index:3;'
        f'filter:{"drop-shadow(0 0 18px rgba(242,232,216,.35))" if escuro else "drop-shadow(0 10px 14px rgba(10,31,35,.18))"} blur(.6px)">'
        for j, (x, y, s, r) in enumerate(FLUT))
    luz = ("radial-gradient(circle,rgba(255,226,170,.30) 0%,rgba(255,226,170,0) 65%)" if escuro
           else "radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(255,255,255,0) 65%)")
    frasco = (f'<div style="position:absolute;left:300px;top:640px;width:640px;height:640px;transform:translate(-50%,-50%);background:{luz};z-index:4"></div>'
              f'<div style="position:absolute;left:300px;top:912px;width:300px;height:36px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(0,0,0,{.55 if escuro else .25}) 0%,transparent 70%);z-index:5"></div>'
              f'<img src="{(base / "frascos" / (p["f"] + ".png")).as_uri()}" style="position:absolute;left:300px;bottom:{1350 - 925}px;max-height:520px;max-width:420px;transform:translateX(-50%);z-index:6;'
              f'filter:drop-shadow(0 22px 26px rgba(0,0,0,{.5 if escuro else .25}))">')
    n = p["nome"]
    tam = 80 if len(n) <= 12 else 62
    titulo = f"""
<div style="position:absolute;left:58px;top:132px;font-family:'Gotham Black';font-size:176px;line-height:1.1;color:transparent;-webkit-text-stroke:4px {c['acc']};z-index:8">{i:02d}</div>
<div style="position:absolute;left:372px;right:50px;top:150px;height:200px;display:flex;flex-direction:column;justify-content:center;z-index:8">
  <div style="font-family:'Gotham Black';font-size:{tam}px;line-height:1;color:{c['txt']};letter-spacing:-.01em">{html.escape(n)}</div>
  <div style="font-size:26px;font-weight:600;letter-spacing:.32em;color:{c['sub']};margin-top:14px">{html.escape(p['marca'])}</div>
</div>"""
    lembra = f"""
<div style="position:absolute;left:580px;top:400px;width:440px;height:260px;transform:rotate(2.5deg);z-index:10;filter:drop-shadow(0 18px 24px rgba(0,0,0,.35))">
  <div style="position:absolute;inset:0;background:{c['cart']};clip-path:polygon(0 0,86% 0,100% 50%,86% 100%,0 100%);border-radius:6px"></div>
  <div style="position:absolute;right:32px;top:50%;width:30px;height:30px;margin-top:-15px;border-radius:50%;background:{c['furo']};box-shadow:inset 0 0 0 5px {g.AMBAR}"></div>
  <div style="position:absolute;left:38px;right:90px;top:34px;color:{c['carttxt']}">
    <div style="font-size:22px;font-weight:800;letter-spacing:.3em;color:{c['cartacc']}">LEMBRA O</div>
    <div style="font-family:'Gotham Black';font-size:{46 if len(p['l']) <= 12 else 36}px;line-height:1.02;margin-top:12px">{html.escape(p['l'])}</div>
    <div style="font-size:27px;font-weight:600;margin-top:12px">{html.escape(p['lm'])}</div>
    <div style="font-size:22px;font-style:italic;opacity:.75;margin-top:4px">{html.escape(p['tag'])}</div>
  </div></div>"""
    bolas = "".join(
        f'<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:126px">'
        f'<div style="width:118px;height:118px;border-radius:50%;background:{c["circ"]};border:2px solid {c["circb"]};display:flex;align-items:center;justify-content:center;overflow:hidden">'
        f'<img src="{ing(k)}" style="width:104px;height:104px;object-fit:contain"></div>'
        f'<span style="font-size:25px;font-weight:700;color:{c["txt"]}">{html.escape(rot)}</span></div>' for rot, k in p["notas"])
    notas = (f'<div style="position:absolute;left:590px;top:700px;z-index:10"><div style="font-size:22px;font-weight:800;letter-spacing:.3em;color:{c["sub"]};margin-bottom:14px">TEM CHEIRO DE</div>'
             f'<div style="display:flex;gap:14px">{bolas}</div></div>')
    rot_usa, txt_usa = p["usa"].split(":", 1)
    rec = recibo(f"""
<div style="font-family:{MONO};font-weight:700;font-size:27px;letter-spacing:.02em"><span style="opacity:.6">{rot_usa}:</span>{html.escape(txt_usa)}</div>
<div style="border-top:3px dashed rgba(10,31,35,.3);margin:14px 0 16px"></div>
<div style="font-size:31px;line-height:1.34;font-weight:500;padding-right:10px">{b(p['d'])}</div>""", 975, 300)
    selo = (f'<div style="position:absolute;right:46px;top:940px;transform:rotate(-7deg);z-index:16;background:{c["acc"] if escuro else cb.ROSA_F};'
            f'color:{g.NOITE if escuro else "#fff"};font-size:24px;font-weight:900;letter-spacing:.08em;padding:12px 20px;border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,.3)">{parte["selo"]}</div>')
    return g.pagina(fundo(parte["tema"]) + flut + frasco + titulo + lembra + notas + rec + selo
                    + cabecalho(parte["cab"], i, 5, c) + rodape(c) + cb.GRAO)


def perfil(c, cta, escuro):
    fundo_card = "#FBF6EC" if escuro else "#fff"
    return f"""
<div style="position:absolute;left:90px;right:90px;top:1000px;background:{fundo_card};border-radius:26px;padding:28px 30px;display:flex;align-items:center;gap:24px;z-index:15;box-shadow:0 18px 40px rgba(0,0,0,.3)">
  <div style="width:110px;height:110px;flex:none;border-radius:50%;background:url('{g.AVATAR}') center/cover;border:3px solid {g.AMBAR}"></div>
  <div style="flex:1;color:{g.NOITE}"><div style="font-size:30px;font-weight:800">@valotaparfum</div>
    <div style="font-size:26px;line-height:1.3;margin-top:6px">{b(cta)}</div></div>
  <div style="flex:none;background:{g.NOITE};color:{g.CREME};font-size:28px;font-weight:800;padding:18px 30px;border-radius:14px">Seguir</div>
</div>"""


def final_p1():
    c = cores("noite")
    linhas = [("01", "pra namorada · lembra Chanel 👀"), ("02", "pra esposa · ██████████"), ("03", "pra ela · ███████"),
              ("04", "pra ela · ██████████"), ("05", "pra ele · ████████")]
    ls = "".join(f'<div style="display:flex;gap:16px;padding:7px 0"><b>{a}</b><span>{t}</span></div>' for a, t in linhas)
    corpo = f"""
<div style="position:absolute;left:0;right:0;top:150px;text-align:center;z-index:12">
  <div style="font-size:30px;font-weight:700;letter-spacing:.36em;color:{g.AMARELO}">NO PRÓXIMO POST</div>
  <div style="font-family:'Gotham Black';font-size:124px;line-height:1;color:{g.CREME};margin-top:14px">E PRA ELA?</div>
</div>
<div style="position:absolute;left:150px;top:400px;width:780px;transform:rotate(-2deg);z-index:12;filter:drop-shadow(0 24px 34px rgba(0,0,0,.5))">
 <div style="background:#FBF6EC;padding:38px 46px 40px;font-family:{MONO};font-weight:700;color:{g.NOITE};font-size:31px;line-height:1.25;
      clip-path:polygon({','.join(f'{k * 2.5}% {100 if k % 2 == 0 else 96}%' for k in range(41))},100% 0,0 0)">
  <div style="text-align:center;font-family:'Gotham Black';font-size:52px;line-height:1.05">LISTA DE PRESENTES</div>
  <div style="text-align:center;font-size:24px;margin-top:8px;opacity:.75">PARTE 2 · CHEGA LOGO</div>
  <div style="border-top:3px dashed rgba(10,31,35,.4);margin:18px 0 10px"></div>{ls}
 </div>
 <div style="position:absolute;right:-30px;bottom:30px;transform:rotate(-12deg);border:7px solid #9C452A;color:#9C452A;border-radius:14px;padding:10px 20px 6px;
      font-family:'Gotham Black';font-size:44px;line-height:1;background:rgba(255,255,255,.6)">EM BREVE</div>
</div>"""
    html_ = g.pagina(cb.fundo_noite() + corpo + perfil(c, "**Segue a Valota Parfum** pra não perder a parte 2 e mais achados de perfumaria.", True)
                     + cabecalho(P1["cab"], 5, 5, c).replace("ITEM 05/05", "FIM DA PARTE 1") + rodape(c) + cb.GRAO)
    return html_


def final_p2():
    c = cores("creme")
    xs = [170, 355, 540, 725, 910]
    corpo = f"""
<div style="position:absolute;left:0;right:0;top:160px;text-align:center;z-index:12">
  <div style="font-size:30px;font-weight:700;letter-spacing:.36em;color:{cb.ROSA_F}">PERDEU A PARTE 1?</div>
  <div style="font-family:'Gotham Black';font-size:118px;line-height:1;color:{g.NOITE};margin-top:14px">TÁ NO PERFIL</div>
  <div style="font-size:36px;font-weight:500;color:{g.PETROLEO};margin-top:18px">os <b>5 masculinos</b> que valem o desconto 👇</div>
</div>""" + cb.holofotes(xs, 430, 900, "rgba(212,154,78,.16)") + cb.fileira(cb.P1, 880, [300, 320, 330, 290, 300], xs, escuro=False)
    html_ = g.pagina(cb.fundo_creme() + corpo + perfil(c, "**Segue a Valota Parfum** pra mais achados de perfumaria e presentes que não erram.", False)
                     + cabecalho(P2["cab"], 5, 5, c).replace("ITEM 05/05", "FIM DA PARTE 2") + rodape(c) + cb.GRAO)
    return html_


def main():
    for parte, fin in ((P1, final_p1), (P2, final_p2)):
        out = parte["pasta"] / "saida-cupom"
        out.mkdir(exist_ok=True)
        for i, p in enumerate(parte["perfumes"], 1):
            g.render(slide(parte, i, p), out / f"{i + 1:02d}.png")
        g.render(fin(), out / "07.png")
        print("ok", out)


if __name__ == "__main__":
    main()

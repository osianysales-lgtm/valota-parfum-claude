#!/usr/bin/env python3
"""Carrossel Black Friday · versão INSTAGRAM (24/11) · mesmo molde do TikTok (capa etiqueta-mistério + lâminas cupom),
outros perfumes. Uso: python3 gerar_black_instagram.py [1|2]  → carrosseis/2026-11-24-black-friday-ig-parteN/saida-cupom/"""
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar as g  # noqa: E402
import capas_black as cb  # noqa: E402
import gerar_black_cupom as gc  # noqa: E402

I1 = AQUI / "carrosseis/2026-11-24-black-friday-ig-parte1"
I2 = AQUI / "carrosseis/2026-11-24-black-friday-ig-parte2"

P1 = dict(pasta=I1, tema="noite", cab="CUPOM DA BLACK · PARTE 1", selo="✓ VALE O DESCONTO", perfumes=[
    dict(nome="AETHER", marca="FRENCH AVENUE", f="aether", lm="Parfums de Marly", l="GREENLEY", tag="casa de nicho francesa",
         notas=[("maçã verde", "maca"), ("bergamota", "bergamota")], usa="USA: dia, calor e trabalho",
         d="**Maçã verde gelada** virando madeira limpa, aquele cheiro de banho caro que faz alguém perguntar no elevador se é **importado**."),
    dict(nome="MANDARIN SKY", marca="ARMAF · ODYSSEY", f="msky", lm="Jean Paul Gaultier", l="SCANDAL POUR HOMME", tag="grife francesa",
         notas=[("tangerina", "laranja"), ("caramelo", "caramelo"), ("baunilha", "baunilha")], usa="USA: balada, noite e frio",
         d="**Tangerina com caramelo**, o docinho de balada que a galera chama de melhor alternativa ao Scandal, num frasco que já chega **chamando atenção**."),
    dict(nome="MAAHIR HONOR", marca="LATTAFA", f="maahir", lm="Xerjoff", l="TORINO21", tag="casa de nicho italiana",
         notas=[("menta", "hortela"), ("limão", "limao"), ("lavanda", "lavanda")], usa="USA: calor, dia a dia e academia",
         d="Lançamento da Lattafa com **menta e limão**, cheiro de banho de hotel cinco estrelas, e o Torino21 que ele lembra custa **bem mais caro**."),
    dict(nome="SPECTRE GHOST", marca="FRENCH AVENUE", f="spectre", lm="Nishane", l="ANI", tag="casa de nicho turca",
         notas=[("gengibre", "gengibre"), ("baunilha", "baunilha"), ("bergamota", "bergamota")], usa="USA: date, noite e frio",
         d="**Baunilha com gengibre** picante, uma sobremesa que não enjoa e faz ela chegar perto pra perguntar **onde você comprou**."),
    dict(nome="LIONHEART", marca="ARMAF · CLUB DE NUIT", f="lion", lm="Jean Paul Gaultier", l="LE MALE ELIXIR", tag="grife francesa",
         notas=[("hortelã", "hortela"), ("mel", "mel"), ("tabaco", "tabaco")], usa="USA: noite, frio e encontro",
         d="Abre fresquinho de **hortelã** e vira **mel com tabaco**, daqueles que fazem ela te abraçar pra dar tchau e **esquecer de soltar**."),
])
P2 = dict(pasta=I2, tema="creme", cab="LISTA DE PRESENTES · PARTE 2", selo="🎁 PRESENTE GARANTIDO", perfumes=[
    dict(nome="ANGHAM", marca="LATTAFA", f="angham", lm="Burberry", l="GODDESS", tag="grife inglesa",
         notas=[("cacau", "cacau"), ("baunilha", "baunilha"), ("gengibre", "gengibre")], usa="PRESENTE PRA: a namorada que ama doce",
         d="**Chocolate com baunilha** cremosa e um toque de gengibre, o queridinho que a comunidade compara com o **Goddess da Burberry**."),
    dict(nome="ATHEERI", marca="LATTAFA", f="atheeri", lm="Gucci", l="FLORA GORGEOUS ORCHID", tag="grife italiana",
         notas=[("maracujá", "maracuja"), ("orquídea", "orquidea"), ("baunilha", "baunilha")], usa="PRESENTE PRA: a esposa elegante",
         d="**Maracujá com orquídea** num floral chique, e o frasco dourado de colmeia já chega com cara de **presente caro**."),
    dict(nome="HABIK", marca="LATTAFA · FOR WOMEN", f="habik", lm="Versace", l="DYLAN PURPLE", tag="grife italiana",
         notas=[("pera", "pera"), ("flores brancas", "flores_brancas")], usa="PRESENTE PRA: quem ama perfume leve",
         d="**Pera com flores brancas** e cheiro de pele limpinha, perfeito pro calor de dezembro, num frasco rosa **lindo de embrulhar**."),
    dict(nome="VICTORIA", marca="LATTAFA", f="victoria", lm="Dolce & Gabbana", l="DEVOTION", tag="grife italiana",
         notas=[("limão", "limao"), ("flor de laranjeira", "flor_laranjeira"), ("baunilha", "baunilha")], usa="PRESENTE PRA: a mulher alegre",
         d="Cheiro de **torta de limão com suspiro**, docinho e fresquinho ao mesmo tempo, num frasco que parece **joia antiga**."),
    dict(nome="YOUR TOUCH INTENSE", marca="MAISON ALHAMBRA", f="yti", lm="Emporio Armani", l="STRONGER WITH YOU INTENSELY", tag="grife italiana",
         notas=[("toffee", "caramelo"), ("canela", "canela"), ("baunilha", "baunilha")], usa="PRESENTE PRA: o namorado, o marido ou o pai",
         d="Eu já usei e a fixação é alta: **toffee com canela e baunilha**, cheiro de sobremesa que faz alguém chegar perto e dizer que ele tá **cheiroso**."),
])
DICAS2 = ["pra namorada · lembra Burberry 👀", "pra esposa · lembra Gucci", "pra ela · pera e flores", "pra ela · torta de limão", "pra ele · lembra Armani"]


def capa_p2():
    linhas = [("0" + str(i), t, "✓") for i, t in enumerate(DICAS2, 1)]
    linhas[0] = ("01", "pra namorada · lembra Burberry", "✓")
    corpo = (cb.fundo_creme() + cb.fita_h(1120, 80)
             + cb.cupom("LISTA DE<br>PRESENTES", "PARTE 2 DE 2 · DA BLACK", linhas, "5 que não erram", "#FFFDF8", g.NOITE, "PRESENTE<br>GARANTIDO", cb.ROSA_F)
             + cb.laco(830, 1150, .55)
             + f'<img src="{(I2 / "frascos/angham.png").as_uri()}" style="position:absolute;left:40px;top:880px;height:380px;transform:rotate(-8deg);z-index:13;filter:drop-shadow(0 20px 24px rgba(10,31,35,.35))">'
             + cb.marca(g.NOITE, "rgba(15,46,51,.35)") + cb.arrasta(g.PETROLEO, 1280) + cb.GRAO)
    return g.pagina(corpo)


def gerar_p2():
    out = I2 / "saida-cupom"
    out.mkdir(parents=True, exist_ok=True)
    g.render(capa_p2(), out / "01.png")
    for i, p in enumerate(P2["perfumes"], 1):
        g.render(gc.slide(P2, i, p), out / f"{i + 1:02d}.png")
    cb.P1 = frascos(P1)
    gc.P2 = P2
    g.render(gc.final_p2(), out / "07.png")
    print("ok", out)


def frascos(parte):
    return [parte["pasta"] / "frascos" / f'{p["f"]}.png' for p in parte["perfumes"]]


def capa_p1():
    cb.P1 = frascos(P1)
    return cb.p1_etiqueta_misterio()


def final_p1(dicas):
    """dicas = 5 linhas da lista da parte 2; só a 1ª aparece, o resto tarjado."""
    c = gc.cores("noite")
    linhas = [("01", dicas[0])] + [(f"0{i}", d.split("·")[0] + "· " + "█" * (6 + (i * 3) % 6)) for i, d in enumerate(dicas[1:], 2)]
    ls = "".join(f'<div style="display:flex;gap:16px;padding:7px 0"><b>{a}</b><span>{t}</span></div>' for a, t in linhas)
    corpo = f"""
<div style="position:absolute;left:0;right:0;top:150px;text-align:center;z-index:12">
  <div style="font-size:30px;font-weight:700;letter-spacing:.36em;color:{g.AMARELO}">NO PRÓXIMO POST</div>
  <div style="font-family:'Gotham Black';font-size:124px;line-height:1;color:{g.CREME};margin-top:14px">E PRA ELA?</div>
</div>
<div style="position:absolute;left:150px;top:400px;width:780px;transform:rotate(-2deg);z-index:12;filter:drop-shadow(0 24px 34px rgba(0,0,0,.5))">
 <div style="background:#FBF6EC;padding:38px 46px 40px;font-family:{gc.MONO};font-weight:700;color:{g.NOITE};font-size:31px;line-height:1.25;
      clip-path:polygon({','.join(f'{k * 2.5}% {100 if k % 2 == 0 else 96}%' for k in range(41))},100% 0,0 0)">
  <div style="text-align:center;font-family:'Gotham Black';font-size:52px;line-height:1.05">LISTA DE PRESENTES</div>
  <div style="text-align:center;font-size:24px;margin-top:8px;opacity:.75">PARTE 2 · CHEGA LOGO</div>
  <div style="border-top:3px dashed rgba(10,31,35,.4);margin:18px 0 10px"></div>{ls}
 </div>
 <div style="position:absolute;right:-30px;bottom:30px;transform:rotate(-12deg);border:7px solid #9C452A;color:#9C452A;border-radius:14px;padding:10px 20px 6px;
      font-family:'Gotham Black';font-size:44px;line-height:1;background:rgba(255,255,255,.6)">EM BREVE</div>
</div>"""
    return g.pagina(cb.fundo_noite() + corpo + gc.perfil(c, "**Segue a Valota Parfum** pra não perder a parte 2 e mais achados de perfumaria.", True)
                    + gc.cabecalho(P1["cab"], 5, 5, c).replace("ITEM 05/05", "FIM DA PARTE 1") + gc.rodape(c) + cb.GRAO)


def gerar_p1(dicas):
    out = I1 / "saida-cupom"
    out.mkdir(parents=True, exist_ok=True)
    g.render(capa_p1(), out / "01.png")
    for i, p in enumerate(P1["perfumes"], 1):
        g.render(gc.slide(P1, i, p), out / f"{i + 1:02d}.png")
    g.render(final_p1(dicas), out / "07.png")
    print("ok", out)


if __name__ == "__main__":
    qual = sys.argv[1] if len(sys.argv) > 1 else "1"
    if qual in ("1", "todos"):
        gerar_p1(DICAS2)
    if qual in ("2", "todos"):
        gerar_p2()

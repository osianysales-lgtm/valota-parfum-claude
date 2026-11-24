#!/usr/bin/env python3
"""Carrossel RANKING em série (Top N · Parte 1/Parte 2) da Valota Parfum, 1080x1350.

Capa A aprovada (3 tarjas sobre o frasco em estúdio) + 1 slide por perfume
(posição gigante, frasco num cartão da cor da família, "lembra" o nicho,
notas em pílulas) + slide final de SÉRIE (pódio escondido + seguir pra ver).
Reaproveita cores, fontes e render do gerar.py. Só cores da cartela oficial.

Uso:
    python3 gerar_ranking.py carrosseis/<nome>/carrossel.json
Saída: carrosseis/<nome>/saida/01.png ... + previa.html
"""
import html
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gerar as g  # noqa: E402
import capa_variantes  # noqa: E402

CSS_R = """<style>
.pos{font-size:230px;font-weight:900;font-style:italic;line-height:.82;letter-spacing:-.04em}
.pos{position:relative;padding-right:58px}
.anel{position:absolute;right:0;top:8px;width:46px;height:46px;border-radius:50%;border:12px solid currentColor}
.cab{position:absolute;left:96px;right:80px;top:150px;display:flex;align-items:flex-end;gap:34px}
.cab .chips{margin-bottom:16px}
.cab h2{font-size:62px;line-height:1.02;margin:0}
.grade2{position:absolute;left:96px;right:80px;top:420px;display:grid;grid-template-columns:420px 1fr;gap:44px;align-items:stretch}
.cartao{height:590px;border-radius:36px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.cartao img{max-width:340px;max-height:500px;object-fit:contain;position:relative;filter:drop-shadow(0 22px 26px rgba(10,31,35,.35))}
.rot{font-size:23px;font-weight:800;letter-spacing:.2em;opacity:.6;margin-bottom:10px}
.nicho{font-size:44px;font-weight:500;line-height:1.1}
.nicho strong{font-weight:900;display:block}
.tag{display:inline-block;margin-top:14px;font-size:24px;font-weight:700;padding:7px 18px;border-radius:999px;border:2px solid currentColor;opacity:.75}
.pilulas{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.pilula{font-size:30px;font-weight:800;padding:10px 24px;border-radius:999px}
.usa{font-size:29px;font-weight:500;line-height:1.3}
.usa strong{font-weight:800}
.desc{position:absolute;left:96px;right:80px;top:1052px;font-size:33px;font-weight:500;line-height:1.32}
.desc strong{font-weight:900}
</style>"""


def slide_perfume(d, p, base):
    escuro = p["fundo"] == "petroleo"
    txt = g.CREME if escuro else g.NOITE
    num = g.acento(d) if escuro else g.LUZ
    apoio = "rgba(242,232,216,.6)" if escuro else "rgba(10,31,35,.55)"
    cor_fam, txt_fam = g.FAMILIAS[p["chip"]["familia"]]
    borda_cartao = f"border:2px solid {g.CREME};" if (escuro and p["chip"]["familia"] in ("cedro", "pimenta")) else ""
    pos = html.escape(p["posicao"])
    pilulas = "".join(f'<span class="pilula" style="background:{cor_fam};color:{txt_fam};{borda_cartao}">{html.escape(n)}</span>'
                      for n in p["notas"])
    corpo = f"""{CSS_R}
<div class="topo" style="color:{apoio}">{html.escape(d['topo'])}</div>
<div class="cab" style="color:{txt}">
  <div class="pos" style="color:{num}">{pos}<span class="anel"></span></div>
  <div><div class="chips">{g.chip(p['chip'], escuro)}</div><h2>{html.escape(p['nome'])}</h2></div>
</div>
<div class="grade2" style="color:{txt}">
  <div class="cartao" style="background:{cor_fam};{borda_cartao}">
    <div style="position:absolute;left:50%;top:50%;width:520px;height:520px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(242,232,216,.55) 0%,rgba(242,232,216,0) 65%)"></div>
    <img src="{g.uri(p['frasco'], base)}">
  </div>
  <div style="display:flex;flex-direction:column;justify-content:space-between;padding:6px 0">
    <div>
      <div class="rot">{html.escape(p.get('rot_lembra', 'LEMBRA'))}</div>
      <div class="nicho">{html.escape(p['lembra_marca'])}<strong>{html.escape(p['lembra'])}</strong></div>
      <div class="tag">{html.escape(p['tag'])}</div>
    </div>
    <div><div class="rot">TEM CHEIRO DE</div><div class="pilulas">{pilulas}</div></div>
    <div class="usa">{g.rico(p['usa'])}</div>
  </div>
</div>
<div class="desc" style="color:{txt}">{g.rico(p['descricao'])}</div>
<div class="rodape" style="color:{txt}">{html.escape(d['rodape'])}</div>"""
    return g.pagina(corpo, "grade-petroleo" if escuro else "grade-creme")


FRASCO_MISTERIO = ('<svg viewBox="0 0 100 150" width="150" height="225" style="display:block">'
                   '<rect x="38" y="6" width="24" height="26" rx="4" fill="{c}"/>'
                   '<rect x="30" y="30" width="40" height="12" rx="3" fill="{c}"/>'
                   '<rect x="8" y="44" width="84" height="100" rx="16" fill="{c}"/>'
                   '<text x="50" y="118" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="54" fill="{t}">?</text></svg>')


def slide_serie(d, f, base):
    """Final de série: pódio escondido (gatilho de curiosidade) + UM CTA: seguir pra ver a parte 2."""
    usuario = d["rodape"].lstrip("@")
    cartoes = "".join(f"""
    <div style="width:330px;height:430px;border-radius:34px;background:radial-gradient(circle at 50% 45%,{g.LUZ} 0%,{g.PETROLEO} 60%,{g.NOITE} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;box-shadow:0 26px 50px rgba(10,31,35,.30);{'transform:translateY(-34px);' if lugar == '1' else ''}">
      <div style="font-size:92px;font-weight:900;font-style:italic;color:{g.AMARELO if lugar == '1' else g.CREME};line-height:1">{lugar}º</div>
      {FRASCO_MISTERIO.format(c='rgba(242,232,216,.16)', t=g.CREME)}
    </div>""" for lugar in ("2", "1"))
    corpo = f"""
<div class="topo" style="color:{g.NOITE}">{html.escape(d['topo'])}</div>
<div style="position:absolute;left:0;right:0;top:140px;text-align:center;color:{g.NOITE}">
  <div style="display:inline-block;background:{g.NOITE};color:{g.CREME};font-size:30px;font-weight:800;letter-spacing:.14em;padding:12px 30px;border-radius:999px">{html.escape(f['kicker'])}</div>
  <div style="font-size:112px;font-weight:900;font-style:italic;letter-spacing:-.02em;line-height:1;margin-top:26px">{html.escape(f['titulo'])}</div>
</div>
<div style="position:absolute;left:0;right:0;top:420px;display:flex;justify-content:center;align-items:flex-end;gap:40px">{cartoes}</div>
<div style="position:absolute;left:110px;right:110px;top:880px;text-align:center;color:{g.NOITE};font-size:36px;font-weight:500;line-height:1.3">{g.rico(f['previa'])}</div>
<div style="position:absolute;left:96px;right:96px;top:1040px;background:{g.CREME};border-radius:30px;padding:24px 28px;display:flex;align-items:center;gap:22px;box-shadow:0 20px 40px rgba(10,31,35,.22)">
  <div style="width:96px;height:96px;flex:none;border-radius:50%;padding:4px;background:conic-gradient({g.AMBAR},{g.AMARELO},#9C452A,{g.AMBAR})">
    <div style="width:100%;height:100%;border-radius:50%;border:3px solid {g.CREME};background:url('{g.AVATAR}') center/cover"></div></div>
  <div style="flex:1;color:{g.NOITE}">
    <div style="font-size:30px;font-weight:900">{html.escape(usuario)}</div>
    <div style="font-size:27px;font-weight:500;line-height:1.25;margin-top:4px">{g.rico(f['cta'])}</div>
  </div>
  <div style="flex:none;background:{g.PETROLEO};color:{g.CREME};font-size:30px;font-weight:800;padding:16px 32px;border-radius:16px">Seguir</div>
</div>"""
    return g.pagina(corpo, "", f"background:{g.acento(d)}")


def main():
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    d = json.loads(arq.read_text(encoding="utf-8"))
    saida = base / "saida"
    saida.mkdir(exist_ok=True)
    paginas = [capa_variantes.capa_a(d["capa"], g.uri(d["capa"]["frasco"], base), g.acento(d))]
    paginas += [slide_perfume(d, p, base) for p in d["perfumes"]]
    f = d["final"]
    # final de série (parte 2 amanhã) ou SALVA (aprovado no carrossel-lista) quando o top é completo
    paginas += [g.slide_final(d, f, base) if f.get("tipo") == "salvar" else slide_serie(d, f, base)]
    nomes = []
    for k, pg in enumerate(paginas, 1):
        png = saida / f"{k:02d}.png"
        g.render(pg, png)
        nomes.append(png.name)
        print("ok", png)
    (saida / "previa.html").write_text(
        '<body style="background:#222;display:flex;flex-wrap:wrap;gap:12px;padding:12px">' +
        "".join(f'<img src="{n}" style="width:360px">' for n in nomes) + "</body>", encoding="utf-8")


if __name__ == "__main__":
    main()

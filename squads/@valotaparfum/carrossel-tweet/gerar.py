#!/usr/bin/env python3
"""Gera os slides do carrossel "estilo tweet" da Valota Parfum (1080x1350, PNG).

Uso:
    python3 gerar.py carrosseis/exemplo/carrossel.json

Lê o JSON, monta um HTML por slide e tira um print de cada um com o Chrome
(sem abrir janela). Os PNGs vão para a pasta "saida" ao lado do JSON, junto
com um previa.html para ver tudo lado a lado.
"""
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LARGURA, ALTURA = 1080, 1350

# Paleta oficial Petróleo & Âmbar (nenhum HEX novo)
PETROLEO = "#0F2E33"
PETROLEO_NOITE = "#0A1F23"
PETROLEO_LUZ = "#1A4A52"
CREME = "#F2E8D8"
AMBAR = "#D49A4E"
AMARELO = "#FFC93C"

FUNDOS = {
    "branco": {"fundo": "#FFFFFF", "texto": PETROLEO_NOITE, "apoio": "rgba(10,31,35,.55)"},
    "creme": {"fundo": CREME, "texto": PETROLEO_NOITE, "apoio": "rgba(10,31,35,.60)"},
}


def uri(caminho: str, base: Path) -> str:
    if re.match(r"^(https?|file|data):", caminho):
        return caminho
    p = (base / caminho).resolve()
    if not p.exists():
        print(f"  aviso: imagem não encontrada: {p}")
    return p.as_uri()


def rico(texto: str) -> str:
    """Escapa o texto e aceita **negrito** e quebra de linha."""
    t = html.escape(texto or "")
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = t.replace("→", '<span class="seta">→</span>')
    return t.replace("\n", "<br>")


def avatar(perfil: dict, base: Path, classe: str = "avatar") -> str:
    foto = perfil.get("avatar")
    if foto and (re.match(r"^(https?|file|data):", foto) or (base / foto).exists()):
        return f'<div class="{classe}" style="background-image:url(\'{uri(foto, base)}\')"></div>'
    return f'<div class="{classe} monograma"><span>V</span></div>'


def cabecalho(perfil: dict, base: Path) -> str:
    return f"""
    <header class="autor">
      {avatar(perfil, base)}
      <div>
        <div class="nome">{html.escape(perfil['nome'])}</div>
        <div class="arroba">@{html.escape(perfil['usuario'])}</div>
      </div>
    </header>"""


def bloco_recorte(item: dict, base: Path, classe: str) -> str:
    """PNG recortado (sem fundo) inteiro sobre um painel, com nome embaixo.
    Se o arquivo ainda não existe, mostra um marcador no lugar."""
    legenda = item.get("legenda", "")
    leg = f'<div class="legenda">{rico(legenda)}</div>' if legenda else ""
    painel = item.get("painel", "creme")
    nome = f'<div class="rec-nome">{rico(item["nome"])}</div>' if item.get("nome") else ""
    caminho = item["recorte"]
    existe = re.match(r"^(https?|file|data):", caminho) or (base / caminho).exists()
    if existe and item.get("forma") == "circulo":
        # textura (ex.: casca, madeira) que não dá pra recortar: vira amostra redonda
        miolo = (f'<div class="rec-img"><div class="rec-circulo" style="background-image:url(\'{uri(caminho, base)}\');'
                 f'background-position:{item.get("pos", "center")}"></div></div>')
    elif existe:
        miolo = (f'<div class="rec-img" style="background-image:url(\'{uri(caminho, base)}\');'
                 f'background-position:{item.get("pos", "center bottom")}"></div>')
    else:
        print(f"  aviso: recorte ainda não existe (vai marcador): {caminho}")
        miolo = f'<div class="rec-img rec-falta"><span>{rico(item.get("marcador", "foto aqui"))}</span></div>'
    extra = " com-legenda" if legenda else ""
    return f'<div class="{classe} recorte painel-{painel}{extra}">{leg}{miolo}{nome}</div>'


def bloco_imagem(item, base: Path, classe: str) -> str:
    if isinstance(item, str):
        item = {"img": item}
    if item.get("recorte"):
        return bloco_recorte(item, base, classe)
    legenda = item.get("legenda", "")
    leg = f'<div class="legenda">{rico(legenda)}</div>' if legenda else ""
    if item.get("img"):
        # "pos" escolhe o enquadramento da foto, ex.: "center 30%" (miniaturas: topo)
        pos = item.get("pos", "center top" if classe == "mini" else "center")
        return (f'<div class="{classe}" style="background-image:url(\'{uri(item["img"], base)}\');'
                f'background-position:{pos}">{leg}</div>')
    marcador = item.get("marcador", "")
    return (f'<div class="{classe} vazio">{leg}'
            f'<div class="marcador">{rico(marcador)}</div></div>')


def slide_capa(s: dict, perfil: dict, base: Path) -> str:
    imgs = s.get("imagens", [])
    fotos = ""
    if imgs:
        fotos = '<div class="fotos n%d">%s</div>' % (
            len(imgs), "".join(bloco_imagem(i, base, "foto") for i in imgs))
    sub = f'<p class="subtitulo">{rico(s["subtitulo"])}</p>' if s.get("subtitulo") else ""
    return f"""{cabecalho(perfil, base)}
    <h1 class="titulo-capa">{rico(s['titulo'])}</h1>
    {sub}
    {fotos}"""


def slide_texto(s: dict, perfil: dict, base: Path) -> str:
    texto = "".join(f"<p>{rico(p)}</p>" for p in re.split(r"\n\s*\n", s.get("texto", "")) if p.strip())
    passos = s.get("passo") or s.get("passos") or []
    if isinstance(passos, str):
        passos = [passos]
    lista = "".join(f'<li><i></i><span>{rico(p)}</span></li>' for p in passos)
    lista = f'<ul class="passos">{lista}</ul>' if lista else ""
    img = bloco_imagem(s["imagem"], base, "foto-unica") if s.get("imagem") else ""
    recs = s.get("recortes") or []
    if recs:
        # fileira de recortes (frascos, notas) no pé do slide
        img += '<div class="recortes n%d">%s</div>' % (
            len(recs), "".join(bloco_imagem(r, base, "rec") for r in recs))
    return f"""{cabecalho(perfil, base)}
    <h2 class="titulo">{rico(s['titulo'])}</h2>
    <div class="corpo">{texto}</div>
    {lista}
    {img}"""


def slide_final(s: dict, perfil: dict, base: Path) -> str:
    texto = s.get("texto") or (
        "Se esse post te ajudou, já segue a **Valota Parfum** que por aqui eu te mostro "
        "de forma prática qual perfume vale cada centavo :)")
    posts = s.get("posts")
    if not posts:
        # padrão: prints das 3 últimas publicações do feed, em feed-atual/1, 2 e 3
        feed = AQUI / "feed-atual"
        achados = []
        for n in (1, 2, 3):
            arq = next((p for p in sorted(feed.glob(f"{n}.*"))
                        if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")), None)
            if arq:
                achados.append({"img": arq.as_uri()})
        if len(achados) == 3:
            posts = achados
        else:
            print("  ⚠ FALTAM OS PRINTS DO FEED: peça à Osiany print das 3 últimas publicações "
                  "e salve em feed-atual/1.png (mais recente), 2.png e 3.png")
            posts = [{"marcador": "print do post 1"}, {"marcador": "print do post 2"},
                     {"marcador": "print do post 3"}]
    posts = posts[:3]
    miniaturas = "".join(bloco_imagem(p, base, "mini") for p in posts)
    return f"""
    <p class="texto-final">{rico(texto)}</p>
    <div class="cartao">
      <div class="linha-perfil">
        <div class="anel">{avatar(perfil, base, "avatar-ig")}</div>
        <div class="dados">
          <div class="usuario">{html.escape(perfil['usuario'])}</div>
          <div class="nome-ig">{html.escape(perfil['nome'])}</div>
        </div>
        <div class="seguir">Seguir</div>
      </div>
      <div class="grade">{miniaturas}</div>
    </div>"""


TIPOS = {"capa": slide_capa, "texto": slide_texto, "final": slide_final}


def css(tema: dict) -> str:
    montserrat = (AQUI / "fonts" / "Montserrat-VariableFont_wght.ttf").as_uri()
    gotham = Path.home() / "Library/Fonts/Gotham Black.otf"
    gotham_src = f"url('{gotham.as_uri()}')" if gotham.exists() else "local('Gotham Black')"
    return f"""
@font-face {{ font-family: 'Montserrat'; src: url('{montserrat}') format('truetype'); font-weight: 100 900; }}
@font-face {{ font-family: 'Gotham Black'; src: {gotham_src}; font-weight: 900; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: {LARGURA}px; height: {ALTURA}px; overflow: hidden; }}
body {{
  background: {tema['fundo']}; color: {tema['texto']};
  font-family: 'Montserrat', sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased;
}}
.slide {{ width: 100%; height: 100%; padding: 150px 64px 70px; display: flex; flex-direction: column; }}
.slide.capa {{ padding-top: 160px; }}
.slide.final {{ padding-top: 250px; }}
strong {{ font-weight: 800; }}
.seta {{ font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 400; padding: 0 .12em; }}

/* autor */
.autor {{ display: flex; align-items: center; gap: 30px; margin-bottom: 78px; }}
.avatar, .avatar-ig {{ border-radius: 50%; background-size: 108%; background-position: center; flex: none; }}
.avatar {{ width: 146px; height: 146px; }}
.monograma {{
  background: radial-gradient(90% 90% at 35% 40%, {PETROLEO_LUZ} 0%, {PETROLEO} 55%, {PETROLEO_NOITE} 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 0 5px {AMBAR};
}}
.monograma span {{ font-family: 'Gotham Black', 'Montserrat'; font-weight: 900; color: {AMBAR}; font-size: 0.48em; }}
.avatar.monograma {{ font-size: 146px; }}
.avatar-ig.monograma {{ font-size: 104px; box-shadow: inset 0 0 0 3px {AMBAR}; }}
.nome {{ font-family: 'Gotham Black', 'Montserrat'; font-weight: 900; font-size: 44px; letter-spacing: -0.5px; line-height: 1.15; }}
.arroba {{ font-size: 40px; font-weight: 400; color: {tema['apoio']}; margin-top: 4px; }}

/* capa */
.titulo-capa {{ font-weight: 800; font-size: 66px; line-height: 1.16; letter-spacing: -1px; margin-bottom: 44px; }}
.subtitulo {{ font-size: 43px; font-weight: 400; line-height: 1.38; margin-bottom: 48px; }}
.fotos {{ margin: auto -34px 0; display: grid; gap: 14px; flex: 1; min-height: 360px; max-height: 540px; }}
.fotos.n1 {{ grid-template-columns: 1fr; }}
.fotos.n2 {{ grid-template-columns: 1fr 1fr; }}
.fotos.n3 {{ grid-template-columns: 1fr 1fr 1fr; }}
.foto, .foto-unica, .mini {{ border-radius: 26px; background-size: cover; background-position: center; position: relative; overflow: hidden; }}
.foto-unica {{ margin-top: auto; height: 480px; }}
.vazio {{
  background: radial-gradient(90% 90% at 35% 40%, {PETROLEO_LUZ} 0%, {PETROLEO} 55%, {PETROLEO_NOITE} 100%);
  display: flex; align-items: center; justify-content: center; text-align: center;
}}
.marcador {{ color: {CREME}; font-weight: 800; font-size: 40px; line-height: 1.15; padding: 0 24px; text-transform: uppercase; letter-spacing: 1px; }}

/* texto */
.titulo {{ font-weight: 600; font-size: 54px; line-height: 1.3; letter-spacing: -0.5px; margin-bottom: 64px; }}
.corpo p {{ font-size: 45px; font-weight: 400; line-height: 1.45; margin-bottom: 34px; }}
.passos {{ list-style: none; margin-top: 30px; }}
.passos li {{ display: flex; gap: 22px; font-size: 39px; line-height: 1.45; margin-bottom: 20px; }}
.passos i {{ flex: none; width: 30px; height: 30px; margin-top: 13px; border-radius: 50%; background: {AMBAR}; box-shadow: inset 0 0 0 9px {AMBAR}, inset 0 0 0 30px {tema['fundo']}; }}

/* final */
.texto-final {{ font-size: 46px; line-height: 1.42; font-weight: 400; margin-bottom: 92px; }}
.cartao {{ margin: 0 -26px; }}
.linha-perfil {{ display: flex; align-items: center; gap: 24px; margin-bottom: 40px; padding: 0 8px; }}
.anel {{ flex: none; width: 128px; height: 128px; border-radius: 50%; padding: 6px;
  background: conic-gradient(from 200deg, {AMARELO}, {AMBAR}, {PETROLEO_LUZ}, {AMBAR}, {AMARELO}); }}
.anel .avatar-ig {{ width: 116px; height: 116px; border: 5px solid {tema['fundo']}; }}
.dados {{ flex: 1; min-width: 0; }}
.usuario {{ font-weight: 700; font-size: 42px; letter-spacing: -0.3px; }}
.nome-ig {{ font-size: 34px; color: {tema['apoio']}; margin-top: 4px; }}
.seguir {{ flex: none; background: {PETROLEO}; color: {CREME}; font-weight: 700; font-size: 34px;
  padding: 22px 54px; border-radius: 18px; }}
.grade {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; height: 420px; }}
.mini {{ border-radius: 18px; }}
.mini .marcador {{ font-size: 30px; }}
/* recortes (PNG sem fundo, inteiro, sobre painel) */
.recortes {{ margin: auto -34px 0; display: grid; gap: 14px; flex: 1; min-height: 250px; max-height: 420px; }}
.recortes.n1 {{ grid-template-columns: 1fr; }}
.recortes.n2 {{ grid-template-columns: 1fr 1fr; }}
.recortes.n3 {{ grid-template-columns: 1fr 1fr 1fr; }}
.recortes.n4 {{ grid-template-columns: 1fr 1fr 1fr 1fr; }}
.recorte {{ border-radius: 26px; position: relative; overflow: hidden; display: flex; flex-direction: column;
  padding: 20px 16px 16px; background-image: none !important; }}
.recorte.com-legenda {{ padding-top: 62px; }}
.painel-creme {{ background-color: {CREME}; color: {PETROLEO_NOITE}; }}
.painel-branco {{ background-color: #FFFFFF; color: {PETROLEO_NOITE}; }}
.painel-petroleo {{ background: radial-gradient(90% 90% at 35% 40%, {PETROLEO_LUZ} 0%, {PETROLEO} 55%, {PETROLEO_NOITE} 100%); color: {CREME}; }}
.rec-img {{ flex: 1; min-height: 0; background-size: contain; background-repeat: no-repeat;
  filter: drop-shadow(0 12px 14px rgba(10,31,35,.22)); }}
.rec-circulo {{ height: 100%; aspect-ratio: 1; margin: 0 auto; border-radius: 50%; background-size: cover;
  box-shadow: inset 0 0 0 4px rgba(255,255,255,.5); }}
/* slide de texto com fileira de recortes: tudo um pouco mais compacto pra caber */
.slide.texto:has(.recortes) {{ padding-top: 104px; padding-bottom: 56px; }}
.slide.texto:has(.recortes) .autor {{ margin-bottom: 46px; }}
.slide.texto:has(.recortes) .titulo {{ margin-bottom: 34px; }}
.slide.texto:has(.recortes) .corpo p {{ font-size: 41px; line-height: 1.4; margin-bottom: 22px; }}
.slide.texto:has(.recortes) .passos {{ margin-top: 6px; }}
.slide.texto:has(.recortes) .passos li {{ font-size: 37px; margin-bottom: 0; }}
.slide.texto:has(.recortes) .recortes {{ margin-top: 34px; min-height: 300px; }}
.rec-falta {{ display: flex; align-items: center; justify-content: center; text-align: center; filter: none;
  border: 3px dashed rgba(10,31,35,.25); border-radius: 18px; }}
.rec-falta span {{ font-weight: 700; font-size: 26px; text-transform: uppercase; letter-spacing: 1px; opacity: .55; padding: 0 12px; }}
.rec-nome {{ flex: none; text-align: center; font-weight: 700; font-size: 27px; letter-spacing: 2px;
  text-transform: uppercase; margin-top: 12px; }}
.legenda {{ position: absolute; top: 0; left: 0; right: 0; background: {PETROLEO_NOITE}; color: {CREME};
  font-weight: 800; font-size: 22px; line-height: 1.15; text-align: center; padding: 10px 10px 12px; }}
"""


def montar(slide: dict, perfil: dict, tema: dict, base: Path) -> str:
    tipo = slide.get("tipo", "texto")
    corpo = TIPOS[tipo](slide, perfil, base)
    return f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<style>{css(tema)}</style></head>
<body><main class="slide {tipo}">{corpo}</main></body></html>"""


def fotografar(html_path: Path, png_path: Path):
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--allow-file-access-from-files", "--force-device-scale-factor=1",
        f"--window-size={LARGURA},{ALTURA}", "--virtual-time-budget=4000",
        f"--screenshot={png_path}", html_path.as_uri(),
    ], check=True, capture_output=True)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    arq = Path(sys.argv[1]).resolve()
    base = arq.parent
    dados = json.loads(arq.read_text(encoding="utf-8"))

    perfil = json.loads((AQUI / "perfil.json").read_text(encoding="utf-8"))
    # caminho do avatar do perfil.json é relativo à pasta do template
    if perfil.get("avatar") and not re.match(r"^(https?|file|data):", perfil["avatar"]):
        p = AQUI / perfil["avatar"]
        perfil["avatar"] = p.as_uri() if p.exists() else None
    perfil.update(dados.get("perfil", {}))
    tema = FUNDOS[dados.get("fundo", "branco")]

    saida = base / "saida"
    if saida.exists():
        shutil.rmtree(saida)
    saida.mkdir()

    pngs = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, slide in enumerate(dados["slides"], 1):
            h = Path(tmp) / f"{i:02d}.html"
            h.write_text(montar(slide, perfil, tema, base), encoding="utf-8")
            png = saida / f"{i:02d}.png"
            fotografar(h, png)
            pngs.append(png.name)
            print(f"  ok {png.relative_to(base)}")

    imgs = "".join(f'<img src="{n}">' for n in pngs)
    (saida / "previa.html").write_text(
        f"""<!DOCTYPE html><meta charset="utf-8"><title>Prévia</title>
<style>body{{margin:0;padding:40px;background:{PETROLEO_NOITE};display:flex;gap:24px;overflow-x:auto}}
img{{height:80vh;border-radius:12px}}</style>{imgs}""", encoding="utf-8")
    print(f"Pronto: {len(pngs)} slides em {saida}")


if __name__ == "__main__":
    main()

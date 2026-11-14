#!/usr/bin/env python3
"""Valota Parfum · Direção de Arte Editorial com Cadência Cromática Assimétrica.

Lê feed-log.csv, aplica as regras de DIRECAO-DE-ARTE.md e sugere a próxima capa.
Gera grade-preview.html (grade de 3 colunas com a próxima capa no lugar).

Uso:
  python3 proxima-capa.py                       # sugere a próxima capa + gera a prévia
  python3 proxima-capa.py --especial            # libera a família A (data/marco/veredito polêmico)
  python3 proxima-capa.py --testar F1           # diz se o template F1 pode ser o próximo e por quê
  python3 proxima-capa.py --simular 9           # planeja as próximas 9 capas (não grava)
  python3 proxima-capa.py --registrar D1 "Fahad vale o hype?" --formato reel [--data 2026-11-10]
"""
import argparse, csv, datetime, html, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(AQUI, "feed-log.csv")
PREVIEW = os.path.join(AQUI, "grade-preview.html")
CAMPOS = ["n", "data", "formato", "familia", "template", "posicao_texto", "tipo_dominante", "tema", "status"]

META = {"D": 0.50, "L": 0.30, "F": 0.15, "A": 0.05}
NOME_FAM = {"D": "Dark Petróleo", "L": "Light Bege", "F": "Fotográfica", "A": "Âmbar/Amarelo"}

# código: (família, nome, posição do texto, tipografia dominante, título de exemplo)
TEMPLATES = {
    "D1": ("D", "Frasco Herói", "base", "bodoni", "Fahad vale o *hype*?"),
    "D2": ("D", "Manchete Bodoni", "topo", "bodoni", "O perfume que todo mundo elogia e *ninguém* admite"),
    "D3": ("D", "Número Âmbar", "lateral", "figtree", "3 árabes que rendem *elogio*"),
    "D4": ("D", "Plantão", "topo", "anton", "Bidaya em alta"),
    "D5": ("D", "Split Noite", "lateral", "bodoni", "Árabe ou *grife*?"),
    "D6": ("D", "Tribunal", "centro", "anton", "Fahad vs Club de Nuit"),
    "D7": ("D", "Manchete + Rosto", "topo", "anton", "O hábito mais *saudável*"),
    "L1": ("L", "Página de Revista", "topo", "bodoni", "Cheiro de rico, preço de *gente*"),
    "L2": ("L", "Ficha Laudo", "grade", "figtree", "Liquid Brun"),
    "L3": ("L", "Citação", "centro", "bodoni", "Comprei às cegas e me arrependi em 3 borrifadas."),
    "L4": ("L", "Janela Petróleo", "base", "bodoni", "Presente sem *erro*"),
    "F1": ("F", "Cena Editorial", "base", "bodoni", "Teste do *calor*"),
    "F2": ("F", "Na Pele", "lateral", "figtree", "*8h* na pele"),
    "F3": ("F", "Notas à Mesa", "topo", "anton", "O que tem dentro"),
    "A1": ("A", "Veredito Amarelo", "centro", "anton", "Passa longe"),
    "A2": ("A", "Âmbar Noturno", "base", "bodoni", "Baunilha que *abraça*"),
}


# ───────────────────────── registro ─────────────────────────
LEGADO = {"LEG": ("X", "Legado (fora da paleta)", "?", "?", "")}


def info(tid):
    return TEMPLATES.get(tid) or LEGADO["LEG"]


def ler_log():
    if not os.path.exists(LOG):
        return []
    with open(LOG, newline="", encoding="utf-8") as f:
        return [r for r in csv.DictReader(f) if r.get("template")]


def linha_de(tid, tema, formato="", data="", status="planejado", n=0):
    fam, _, pos, tipo, _ = TEMPLATES[tid]
    return {"n": str(n), "data": data, "formato": formato, "familia": fam, "template": tid,
            "posicao_texto": pos, "tipo_dominante": tipo, "tema": tema, "status": status}


def registrar(tid, tema, formato, data):
    hist = ler_log()
    nova = linha_de(tid, tema, formato, data, "publicado", len(hist) + 1)
    existe = os.path.exists(LOG) and os.path.getsize(LOG) > 0
    with open(LOG, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS)
        if not existe:
            w.writeheader()
        w.writerow(nova)
    return nova


# ───────────────────────── regras ─────────────────────────
def violacoes(hist, tid, especial=False):
    fam, _, pos, tipo, _ = TEMPLATES[tid]
    fams = [h["familia"] for h in hist]
    tids = [h["template"] for h in hist]
    v = []
    # R1 composição
    if tids and tids[-1] == tid:
        v.append("R1: mesmo template da capa anterior")
    if tids[-9:].count(tid) >= 2:
        v.append("R1: template já usado 2x nas últimas 9")
    # R2 família
    if len(fams) >= 2 and fams[-1] == fams[-2] == fam:
        v.append(f"R2: seria a 3ª {NOME_FAM[fam]} seguida (linha da grade monocromática)")
    if fam in ("F", "A") and fams and fams[-1] == fam:
        v.append(f"R2: {NOME_FAM[fam]} nunca em sequência")
    if fam == "A":
        if "A" in fams[-12:]:
            v.append("R2: já houve capa A nos últimos 12 posts")
        sem_a = len(fams) - (len(fams) - 1 - fams[::-1].index("A")) - 1 if "A" in fams else len(fams)
        if not especial and sem_a < 19:
            v.append("A só com --especial (ou depois de ~20 posts sem A)")
    # R3 sem alternância rígida (padrões de período 2, 3 e 4)
    for p in (2, 3, 4):
        s = fams[-(2 * p - 1):] + [fam]
        if len(s) == 2 * p and s[:p] == s[p:] and len(set(s[:p])) > 1:
            v.append(f"R3: repetiria o padrão {'-'.join(s[:p])} (alternância rígida)")
            break
    # R4 grade: capa de baixo = 3 posts antes
    if len(hist) >= 3:
        baixo = hist[-3]
        if baixo["template"] == tid:
            v.append("R4: mesmo template da capa logo abaixo na grade")
        elif (baixo["familia"], baixo["posicao_texto"], baixo["tipo_dominante"]) == (fam, pos, tipo):
            v.append("R4: igual à capa de baixo em família, posição e tipografia")
    # R5 variação
    if hist and hist[-1]["posicao_texto"] == pos:
        v.append(f"R5: texto em '{pos}' de novo (variar posição)")
    if len(hist) >= 2 and hist[-1]["tipo_dominante"] == hist[-2]["tipo_dominante"] == tipo:
        v.append(f"R5: 3ª capa seguida com {tipo} dominante")
    return v


def pontuar(hist, tid):
    fam, _, pos, tipo, _ = TEMPLATES[tid]
    janela = [h["familia"] for h in hist if h["familia"] in META][-19:]
    deficit = META[fam] * (len(janela) + 1) - janela.count(fam)
    tids = [h["template"] for h in hist]
    desde = (len(tids) - 1 - tids[::-1].index(tid)) if tid in tids else -99
    recencia = min(len(tids) - desde, 20) / 20 if desde != -99 else 1.0
    dif_baixo = 0
    if len(hist) >= 3:
        b = hist[-3]
        dif_baixo = sum([b["familia"] != fam, b["posicao_texto"] != pos, b["tipo_dominante"] != tipo]) / 3
    prioridade_fam = {"D": 0.03, "L": 0.02, "F": 0.01, "A": 0}[fam]
    return deficit + 0.35 * recencia + 0.15 * dif_baixo + prioridade_fam


def sugerir(hist, especial=False):
    ok, bloqueados = [], {}
    for tid in TEMPLATES:
        v = violacoes(hist, tid, especial)
        if v:
            bloqueados[tid] = v
        else:
            ok.append((pontuar(hist, tid), tid))
    ok.sort(reverse=True)
    return [t for _, t in ok], bloqueados


def proporcoes(hist):
    janela = [h["familia"] for h in hist if h["familia"] in META][-20:]
    n = len(janela) or 1
    return {f: janela.count(f) / n for f in META}, len(janela)


# ───────────────────────── render (wireframe na paleta oficial) ─────────────────────────
def hl(txt, modo):
    txt = html.escape(txt)
    return re.sub(r"\*(.+?)\*", rf'<span class="hl-{modo}">\1</span>', txt)


def frasco(left, top, w, liq="ambar", rot=0):
    return (f'<div class="frasco liq-{liq}" style="left:{left}%;top:{top}%;width:{w}cqw;'
            f'transform:rotate({rot}deg)"><i class="tampa"></i><i class="colo"></i><i class="corpo"></i></div>')


SELO = '<div class="selo"><span>VALE O<br>FRASCO</span></div>'
MARCA = '<div class="marca">VALOTA</div>'
MARCA_N = '<div class="marca noite">VALOTA</div>'


def tile(tid, titulo=None):
    fam, nome, pos, tipo, ex = info(tid)
    t = titulo or ex
    T = lambda m: hl(t, m)
    plain = html.escape(t.replace("*", ""))
    if tid == "LEG":
        return (f'<div class="tile leg"><div class="tx fig creme up" style="top:40%;font-size:6cqw;right:6cqw">{plain}</div>'
                f'<div class="tx fig creme small" style="bottom:8cqw">ANTES DA PALETA</div></div>')
    fam, nome, pos, tipo, ex = TEMPLATES[tid]
    if tid == "D7":
        body = (f'{MARCA}<div class="tx ant creme up" style="top:13cqw;font-size:8cqw;left:6cqw;right:6cqw;text-align:center">{T("am").replace("hl-am","hl-am big-am")}</div>'
                f'{frasco(24,40,20,"escuro")}{frasco(54,40,20,"claro")}<div class="rosto"></div>')
        cls = "g1 pont"
        return f'<div class="tile {cls}">{body}</div>'
    if tid == "D1":
        body = f'{MARCA}{SELO}{frasco(33,17,34)}<div class="tx b bod creme" style="bottom:8cqw;font-size:9cqw">{T("am")}</div>'
        cls = "g1"
    elif tid == "D2":
        body = f'{MARCA}{SELO}<div class="tx bod creme" style="top:30cqw;font-size:10.5cqw;right:12cqw">{T("am")}</div><i class="filete" style="top:auto;bottom:22cqw"></i><div class="tx fig creme small" style="bottom:12cqw">LAUDO VALOTA · Nº 01</div>'
        cls = "g1"
    elif tid == "D3":
        m = re.match(r"\s*(\d+)\s*(.*)", t)
        num, resto = (m.group(1), m.group(2)) if m else ("5", t)
        body = (f'{MARCA}{SELO}<div class="num">{num}</div>'
                f'<div class="tx fig creme up" style="left:50cqw;top:52cqw;font-size:6.2cqw">{hl(resto, "am")}</div>'
                f'{frasco(62,82,12)}')
        cls = "g1"
    elif tid == "D4":
        body = (f'<div class="faixa">PLANTÃO VALOTA</div>{SELO.replace("selo", "selo low")}{frasco(34,30,32)}'
                f'<div class="tx ant creme up" style="bottom:9cqw;font-size:11cqw;text-align:center;left:4cqw;right:4cqw">{plain}</div>')
        cls = "g1"
    elif tid == "D5":
        body = (f'<div class="meia-luz"></div>{frasco(9,30,30)}<i class="filete-v"></i>{SELO}'
                f'<div class="tx bod creme" style="left:55cqw;right:5cqw;top:62cqw;font-size:8.5cqw">{T("am")}</div>{MARCA}')
        cls = "noite"
    elif tid == "D6":
        partes = re.split(r"\s+vs\.?\s+", plain, flags=re.I)
        a, b = (partes + ["?"])[:2]
        body = (f'{MARCA}{SELO}<div class="tx ant creme up" style="top:24cqw;font-size:7cqw;text-align:center;left:4cqw;right:4cqw">TRIBUNAL DO FRASCO</div>'
                f'{frasco(8,40,26,"escuro")}{frasco(66,40,26,"claro")}<div class="vs">VS</div>'
                f'<div class="tx bod creme" style="bottom:9cqw;font-size:5.6cqw;text-align:center;left:4cqw;right:4cqw">{a} <span class="ab">×</span> {b}</div>')
        cls = "g1"
    elif tid == "L1":
        body = f'{MARCA_N}{SELO}<div class="tx bod noite" style="top:28cqw;font-size:11cqw;right:8cqw">{T("mt")}</div>{frasco(64,66,18)}<div class="tx fig noite small" style="bottom:9cqw">ACHADINHOS · Nº 04</div>'
        cls = "creme"
    elif tid == "L2":
        body = (f'{MARCA_N}{SELO}<div class="tx fig noite small" style="top:30cqw">LAUDO VALOTA</div>'
                f'<div class="tx bod noite" style="top:36cqw;font-size:9.5cqw">{plain}</div>'
                f'<div class="chips" style="top:58cqw"><span class="chip c-ambar">ÂMBAR</span><span class="chip c-cedro">AMADEIRADO</span></div>'
                f'<div class="ficha" style="top:72cqw"><div>Fixação <b class="etq">8h</b></div><div>Projeção <b>média</b></div><div>Preço <b class="etq">R$ 189</b></div></div>')
        cls = "creme"
    elif tid == "L3":
        body = (f'{MARCA_N}<div class="aspas">“</div><div class="tx bod it noite" style="top:46cqw;font-size:7.6cqw;right:8cqw">{plain}</div>'
                f'<div class="tx fig noite small" style="bottom:12cqw">— CONFISSÕES DOS BORRIFADOS</div>')
        cls = "creme"
    elif tid == "L4":
        body = f'{MARCA_N}<div class="janela">{frasco(30,22,40)}</div>{SELO}<div class="tx bod noite" style="bottom:10cqw;font-size:9cqw;text-align:center;left:4cqw;right:4cqw">{T("mt")}</div>'
        cls = "creme"
    elif tid == "F1":
        body = f'<div class="foto cena"></div>{frasco(36,24,30)}<div class="vinheta"></div>{MARCA}{SELO}<div class="tx bod creme" style="bottom:9cqw;font-size:9.5cqw">{T("am")}</div><div class="foto-tag">FOTO REAL</div>'
        cls = ""
    elif tid == "F2":
        body = (f'<div class="foto pele"></div><div class="pulso"></div>{frasco(54,22,26,"claro",8)}{MARCA}{SELO}'
                f'<div class="painel"><div class="tx fig creme up" style="position:static;font-size:7cqw">{T("am")}</div></div><div class="foto-tag">FOTO REAL</div>')
        cls = ""
    elif tid == "F3":
        body = (f'<div class="foto linho"></div><i class="nota n1"></i><i class="nota n2"></i><i class="nota n3"></i>{frasco(38,44,24,"ambar",-28)}'
                f'<div class="tx ant noite up" style="top:9cqw;font-size:10cqw;right:30cqw">{plain}</div>{SELO}<div class="foto-tag escuro">FOTO REAL</div>')
        cls = ""
    elif tid == "A1":
        body = (f'{frasco(40,10,20,"escuro")}<div class="tx ant noite up" style="top:62cqw;font-size:17cqw;text-align:center;left:2cqw;right:2cqw;line-height:.95">{plain}</div>'
                f'<div class="tx fig noite small" style="bottom:7cqw;text-align:center;left:0;right:0">NA PELE, NÃO NO HYPE.</div><div class="mono">V</div>')
        cls = "amarelo"
    elif tid == "A2":
        body = (f'<div class="marca noite">VALOTA</div>{frasco(34,14,32,"escuro")}<div class="tx bod noite" style="bottom:11cqw;font-size:9.5cqw;text-align:center;left:3cqw;right:3cqw">{T("nb")}</div>'
                f'<i class="filete-n"></i><div class="mono">V</div>')
        cls = "ambar"
    return f'<div class="tile {cls}">{body}</div>'


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Bodoni+Moda:ital,opsz,wght@0,6..96,500..700;1,6..96,500..700&family=Figtree:wght@500;600;700&display=swap');
:root{--pet:#0F2E33;--noite:#0A1F23;--luz:#1A4A52;--creme:#F2E8D8;--ambar:#D49A4E;--am:#FFC93C}
*{box-sizing:border-box;margin:0}
body{background:#0A1F23;color:var(--creme);font-family:Figtree,sans-serif;padding:32px 20px 80px}
.wrap{max-width:1180px;margin:0 auto}
h1{font-family:'Bodoni Moda';font-weight:600;font-size:40px;font-variation-settings:'opsz' 18}
h1 span{color:var(--am)} h2{font-family:'Bodoni Moda';font-weight:600;font-size:26px;margin:44px 0 16px}
.sub{opacity:.88;margin-top:6px;font-size:15px}
.cols{display:grid;grid-template-columns:minmax(300px,520px) 1fr;gap:36px;margin-top:28px;align-items:start}
@media(max-width:900px){.cols{grid-template-columns:1fr}}
.phone{background:#000;border-radius:28px;padding:14px;border:1px solid #1A4A52}
.phone .perfil{display:flex;gap:12px;align-items:center;padding:6px 6px 14px;font-size:13px}
.phone .av{width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#1A4A52,#0F2E33 60%,#0A1F23);display:grid;place-items:center;color:var(--am);font-family:'Bodoni Moda';font-weight:700;font-size:26px;box-shadow:inset 0 0 0 3px var(--am),0 0 0 2px var(--ambar)}
.grade{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.slot{position:relative}
.slot .lbl{position:absolute;left:4px;bottom:4px;background:rgba(10,31,35,.85);color:var(--creme);font-size:10px;padding:2px 6px;border-radius:4px;z-index:5;font-weight:600}
.slot.nova{outline:3px dashed var(--am);outline-offset:-3px;z-index:3}
.slot.nova .lbl{background:var(--am);color:var(--noite)}
.slot.plano{outline:2px dashed rgba(242,232,216,.55);outline-offset:-2px}
.card{background:#0F2E33;border:1px solid #1A4A52;border-radius:12px;padding:20px 22px;margin-bottom:16px}
.card h3{font-family:Figtree;font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--ambar);margin-bottom:10px}
.big{font-family:'Bodoni Moda';font-weight:600;font-size:28px}
.big b{color:var(--am);font-weight:600}
.alts{margin-top:8px;font-size:15px;line-height:1.7}
.barra{display:grid;grid-template-columns:120px 1fr 90px;gap:10px;align-items:center;font-size:14px;margin:7px 0}
.barra .t{height:12px;background:#0A1F23;border-radius:6px;position:relative;overflow:hidden}
.barra .t i{position:absolute;inset:0 auto 0 0;border-radius:6px}
.barra .t b{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--creme)}
ul.bloq{font-size:13px;line-height:1.6;padding-left:18px;opacity:.9}
.galeria{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}
.galeria figcaption{font-size:13px;margin-top:8px;line-height:1.4}
.galeria figcaption b{color:var(--am)}
/* ── tiles ── */
.tile{position:relative;aspect-ratio:3/4;overflow:hidden;container-type:inline-size;font-family:Figtree}
.g1{background:radial-gradient(90% 90% at 35% 40%,#1A4A52 0%,#0F2E33 55%,#0A1F23 100%)}
.noite{background:#0A1F23}
.creme{background:#F2E8D8}
.creme::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1.5cqw;background:#0F2E33}
.leg{background:repeating-linear-gradient(135deg,#3a3f44 0 10px,#33383d 10px 20px)}
.pont{background-image:radial-gradient(rgba(242,232,216,.07) 1px,transparent 1.2px),radial-gradient(90% 90% at 35% 40%,#1A4A52 0%,#0F2E33 55%,#0A1F23 100%);background-size:3cqw 3cqw,auto}
.big-am{display:block;font-size:1.6em;line-height:1}
.rosto{position:absolute;left:28cqw;right:28cqw;bottom:0;height:34cqw;border-radius:4cqw 4cqw 0 0;background:linear-gradient(180deg,#cdd3d2,#8e9a99);border:.6cqw solid #0A1F23}
.amarelo{background:#FFC93C} .ambar{background:#D49A4E}
.tx{position:absolute;left:6cqw;line-height:1.05}
.bod{font-family:'Bodoni Moda';font-weight:600;font-variation-settings:'opsz' 18}
.it{font-style:italic;font-weight:500}
.ant{font-family:Anton;letter-spacing:.01em}
.fig{font-family:Figtree;font-weight:700}
.up{text-transform:uppercase}
.small{font-size:3.2cqw;letter-spacing:.18em}
.tx.creme,.creme-t{color:#F2E8D8;background:none}
.tx.creme::after{display:none}
.tx.noite{color:#0A1F23;background:none}
.hl-am{color:#FFC93C}
.hl-mt{background:#FFC93C;color:#0A1F23;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.hl-nb{background:#0A1F23;color:#F2E8D8;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.ab{color:#D49A4E}
.marca{position:absolute;top:5cqw;left:6cqw;font-family:'Bodoni Moda';font-weight:500;font-size:3.4cqw;letter-spacing:.32em;color:rgba(242,232,216,.75);z-index:4}
.marca.noite{color:#0A1F23;background:none}
.selo{position:absolute;top:4.5cqw;right:5cqw;width:22cqw;aspect-ratio:1;border-radius:50%;background:#FFC93C;color:#0A1F23;transform:rotate(-8deg);display:grid;place-items:center;text-align:center;font-family:Anton;font-size:4cqw;line-height:1.02;box-shadow:inset 0 0 0 1.1cqw #FFC93C,inset 0 0 0 1.5cqw #0A1F23,inset 0 0 0 4.2cqw #FFC93C,inset 0 0 0 4.5cqw #0A1F23;z-index:6}
.selo.low{top:20cqw}
.filete{position:absolute;left:6cqw;width:20cqw;height:.5cqw;background:#D49A4E}
.filete-v{position:absolute;left:50cqw;top:12%;bottom:12%;width:.4cqw;background:#D49A4E}
.filete-n{position:absolute;left:0;right:0;bottom:0;height:1.5cqw;background:#0A1F23}
.num{position:absolute;left:4cqw;top:22cqw;font-family:'Bodoni Moda';font-weight:700;font-size:78cqw;line-height:.9;color:#D49A4E;font-variation-settings:'opsz' 18}
.faixa{position:absolute;left:0;right:0;top:0;height:16cqw;background:#0A1F23;color:#FFC93C;font-family:Anton;font-size:8.5cqw;display:grid;place-items:center;letter-spacing:.04em}
.meia-luz{position:absolute;left:0;top:0;bottom:0;width:50%;background:radial-gradient(70% 55% at 50% 52%,#1A4A52 0%,#0F2E33 60%,#0A1F23 100%)}
.vs{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);font-family:Anton;color:#FFC93C;font-size:15cqw}
.aspas{position:absolute;left:4cqw;top:6cqw;font-family:'Bodoni Moda';font-weight:700;font-size:58cqw;line-height:1;color:#0F2E33}
.janela{position:absolute;left:18cqw;right:18cqw;top:15cqw;height:78cqw;border-radius:40cqw 40cqw 2cqw 2cqw;background:radial-gradient(90% 80% at 40% 40%,#1A4A52,#0F2E33 60%,#0A1F23);overflow:hidden;container-type:normal}
.chips{position:absolute;left:6cqw;display:flex;gap:2cqw}
.chip{font-family:Figtree;font-weight:700;font-size:3.2cqw;padding:1.2cqw 2.6cqw;border-radius:1cqw;letter-spacing:.06em}
.c-ambar{background:#D49A4E;color:#0A1F23}.c-cedro{background:#6B4430;color:#F2E8D8}
.ficha{position:absolute;left:6cqw;right:6cqw;color:#0A1F23;font-size:4.6cqw;font-weight:600}
.ficha div{display:flex;justify-content:space-between;align-items:center;border-top:.3cqw solid rgba(10,31,35,.25);padding:2cqw 0}
.etq{background:#D49A4E;color:#0A1F23;padding:.4cqw 2cqw;border-radius:9999px}
.foto{position:absolute;inset:0}
.cena{background:linear-gradient(180deg,#2c241c 0%,#4a3826 48%,#8a6a45 48.2%,#5b4430 100%)}
.cena::before{content:"";position:absolute;left:55%;top:8%;width:40%;aspect-ratio:1;border-radius:50%;background:radial-gradient(#d9b37a55,transparent 70%)}
.pele{background:linear-gradient(160deg,#9fb0ad 0%,#5f7472 60%,#2e3f40 100%)}
.pulso{position:absolute;left:-10%;top:58%;width:120%;height:24%;background:linear-gradient(180deg,#c99877,#a87458);border-radius:40%;transform:rotate(-14deg)}
.linho{background:repeating-linear-gradient(90deg,#e4d6bd 0 3px,#dccdb2 3px 6px)}
.nota{position:absolute;border-radius:50%}
.n1{left:8%;top:52%;width:22cqw;height:22cqw;background:radial-gradient(circle at 40% 40%,#f2b45a,#c97a1f)}
.n2{left:66%;top:70%;width:6cqw;height:40cqw;border-radius:3cqw;background:#4b2e1a;transform:rotate(35deg)}
.n3{left:70%;top:36%;width:18cqw;height:12cqw;background:#5f7d3d;border-radius:60% 0}
.vinheta{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,31,35,0) 45%,rgba(10,31,35,.92) 100%)}
.painel{position:absolute;left:0;top:30cqw;width:46cqw;padding:4cqw 5cqw;background:rgba(10,31,35,.86)}
.foto-tag{position:absolute;left:6cqw;top:11cqw;font-size:2.6cqw;letter-spacing:.2em;font-weight:700;color:rgba(242,232,216,.7);z-index:4}
.foto-tag.escuro{color:rgba(10,31,35,.6);top:auto;bottom:4cqw}
.mono{position:absolute;right:5cqw;top:5cqw;width:12cqw;aspect-ratio:1;border-radius:50%;background:#0F2E33;color:#FFC93C;display:grid;place-items:center;font-family:'Bodoni Moda';font-weight:700;font-size:7cqw;box-shadow:inset 0 0 0 .7cqw #FFC93C}
.frasco{position:absolute;aspect-ratio:1/1.6;z-index:2;filter:drop-shadow(0 2cqw 2cqw rgba(0,0,0,.45))}
.frasco i{position:absolute;left:50%;transform:translateX(-50%);display:block}
.frasco .tampa{top:0;width:46%;height:24%;border-radius:6% 6% 3% 3%;background:linear-gradient(90deg,#1b1410,#4a3a2c 40%,#1b1410)}
.frasco .colo{top:24%;width:20%;height:6%;background:linear-gradient(90deg,#8a6a3a,#e9c27e,#8a6a3a)}
.frasco .corpo{top:30%;width:100%;height:70%;border-radius:8%;border:.5cqw solid rgba(255,255,255,.35)}
.liq-ambar .corpo{background:linear-gradient(100deg,#b8792c,#e6ad55 35%,#c7883a 70%,#9a5f20)}
.liq-claro .corpo{background:linear-gradient(100deg,#c9b98a,#efe2b8 35%,#d6c693 70%,#a8976a)}
.liq-escuro .corpo{background:linear-gradient(100deg,#2b1a10,#5e3b22 35%,#3e2716 70%,#1f130b)}
"""


def pct(x):
    return f"{round(x * 100)}%"


def gerar_html(hist, sugestoes, bloqueados, especial, plano=None):
    props, n = proporcoes(hist + (plano or []))
    cores = {"D": "#1A4A52", "L": "#F2E8D8", "F": "#8a6a45", "A": "#FFC93C"}
    barras = "".join(
        f'<div class="barra"><span>{NOME_FAM[f]}</span><div class="t"><i style="width:{props[f]*100:.0f}%;background:{cores[f]}"></i>'
        f'<b style="left:{META[f]*100:.0f}%"></b></div><span>{pct(props[f])} / {pct(META[f])}</span></div>' for f in META)

    slots = []
    if plano:
        for i, p in enumerate(reversed(plano)):
            k = len(plano) - i
            slots.append(f'<div class="slot plano">{tile(p["template"])}<span class="lbl">plano {k} · {p["template"]}</span></div>')
    elif sugestoes:
        s = sugestoes[0]
        slots.append(f'<div class="slot nova">{tile(s)}<span class="lbl">PRÓXIMA · {s}</span></div>')
    for h in reversed(hist[-(12 - len(slots)):] if len(slots) < 12 else []):
        slots.append(f'<div class="slot">{tile(h["template"], h["tema"] or None)}<span class="lbl">{h["template"]} · {html.escape(h["data"])}</span></div>')

    if plano:
        topo = (f'<div class="card"><h3>Plano das próximas {len(plano)} capas</h3><div class="alts">'
                + "<br>".join(f'{i+1}. <b>{p["template"]}</b> · {TEMPLATES[p["template"]][1]} ({NOME_FAM[p["familia"]]})' for i, p in enumerate(plano))
                + '</div><p class="sub" style="margin-top:12px">Na grade, o plano 1 é o mais antigo (embaixo) e o último fica no canto superior esquerdo.</p></div>')
    elif sugestoes:
        s = sugestoes[0]
        fam, nome, pos, tipo, _ = TEMPLATES[s]
        alts = "<br>".join(f'<b>{a}</b> · {TEMPLATES[a][1]} ({NOME_FAM[TEMPLATES[a][0]]}, texto {TEMPLATES[a][2]}, {TEMPLATES[a][3]})' for a in sugestoes[1:4])
        topo = (f'<div class="card"><h3>Próxima capa</h3><div class="big"><b>{s}</b> · {nome}</div>'
                f'<p class="sub">{NOME_FAM[fam]} · texto {pos} · {tipo} dominante</p>'
                f'<h3 style="margin-top:18px">Alternativas liberadas</h3><div class="alts">{alts}</div></div>')
    else:
        topo = '<div class="card"><h3>Próxima capa</h3><p>Nenhum template passou nas regras. Revisar o feed-log.</p></div>'
    bloq = "".join(f"<li><b>{t}</b>: {'; '.join(v)}</li>" for t, v in list(bloqueados.items()))
    gal = "".join(
        f'<figure>{tile(t)}<figcaption><b>{t}</b> · {v[1]}<br>{NOME_FAM[v[0]]} · texto {v[2]} · {v[3]}</figcaption></figure>'
        for t, v in TEMPLATES.items())
    hoje = datetime.date.today().strftime("%d/%m/%Y")
    return f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Valota · Direção de arte do feed</title><style>{CSS}</style></head><body><div class="wrap">
<h1>Valota · <span>Cadência Cromática</span> do feed</h1>
<p class="sub">Gerado em {hoje} a partir de feed-log.csv ({len(hist)} posts registrados){' · modo especial (A liberada)' if especial else ''}. Wireframe na paleta oficial Petróleo &amp; Âmbar: frascos e fotos são marcadores de posição.</p>
<div class="cols"><div class="phone"><div class="perfil"><div class="av">V</div><div><b>valotaparfum</b><br>Valota | Perfume sem hype</div></div><div class="grade">{''.join(slots)}</div></div>
<div>{topo}<div class="card"><h3>Proporções (últimos {n} posts) · meta</h3>{barras}</div>
<div class="card"><h3>Bloqueados agora</h3><ul class="bloq">{bloq or '<li>nenhum</li>'}</ul></div></div></div>
<h2>Biblioteca de templates</h2><div class="galeria">{gal}</div>
</div></body></html>"""


# ───────────────────────── CLI ─────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Sugere a próxima capa da Valota no Instagram.")
    ap.add_argument("--especial", action="store_true", help="libera a família A (Âmbar/Amarelo)")
    ap.add_argument("--testar", metavar="TEMPLATE")
    ap.add_argument("--simular", type=int, metavar="N")
    ap.add_argument("--registrar", nargs=2, metavar=("TEMPLATE", "TEMA"))
    ap.add_argument("--formato", default="", help="reel | carrossel | estatico")
    ap.add_argument("--data", default=datetime.date.today().isoformat())
    ap.add_argument("--sem-html", action="store_true")
    a = ap.parse_args()

    if a.registrar:
        tid = a.registrar[0].upper()
        if tid not in TEMPLATES:
            sys.exit(f"Template desconhecido: {tid}. Opções: {', '.join(TEMPLATES)}")
        v = violacoes(ler_log(), tid, especial=True)
        r = registrar(tid, a.registrar[1], a.formato, a.data)
        print(f"Registrado #{r['n']}: {tid} · {TEMPLATES[tid][1]} · {r['tema']}")
        if v:
            print("Atenção, este post quebrou regras: " + "; ".join(v))

    hist = ler_log()

    if a.testar:
        tid = a.testar.upper()
        v = violacoes(hist, tid, a.especial)
        print(f"{tid} · {TEMPLATES[tid][1]}: " + ("LIBERADO" if not v else "BLOQUEADO\n  - " + "\n  - ".join(v)))
        return

    plano = None
    if a.simular:
        plano, h = [], list(hist)
        for _ in range(a.simular):
            s, _ = sugerir(h, a.especial)
            if not s:
                break
            p = linha_de(s[0], "")
            plano.append(p)
            h.append(p)
        print("Plano:", " → ".join(f"{p['template']}" for p in plano))
        print("Famílias:", " ".join(p["familia"] for p in plano))

    sugestoes, bloqueados = sugerir(hist, a.especial)
    if not a.simular:
        print(f"Analisados: últimos {min(len(hist), 9)} de {len(hist)} posts.")
        if sugestoes:
            s = sugestoes[0]
            print(f"PRÓXIMA CAPA: {s} · {TEMPLATES[s][1]} ({NOME_FAM[TEMPLATES[s][0]]}, texto {TEMPLATES[s][2]}, {TEMPLATES[s][3]})")
            print("Alternativas:", ", ".join(f"{t} {TEMPLATES[t][1]}" for t in sugestoes[1:4]))
    props, n = proporcoes(hist)
    if n and hist:
        print("Proporção (últimos %d): " % n + " · ".join(f"{f} {pct(props[f])}/{pct(META[f])}" for f in META))

    if not a.sem_html:
        with open(PREVIEW, "w", encoding="utf-8") as f:
            f.write(gerar_html(hist, sugestoes, bloqueados, a.especial, plano))
        print("Prévia:", PREVIEW)


if __name__ == "__main__":
    main()

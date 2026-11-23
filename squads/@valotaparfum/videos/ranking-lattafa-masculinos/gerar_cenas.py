# Gera as cenas do reel "Ranking masculinos LATTAFA" (Valota Parfum).
# Rode: python3 gerar_cenas.py  -> reescreve index.html e compositions/*.html
# Ranking, nomes e tempos ficam nas listas abaixo.
import json, os, random, struct

ROOT = os.path.dirname(os.path.abspath(__file__))

RANKING = [  # (posição, nome, arquivo do recorte)
    (10, "Khamrah", "khamrah"),
    (9, "Asad", "asad"),
    (8, "Asad Elixir", "asad-elixir"),
    (7, "Fakhar Black", "fakhar-black"),
    (6, "Fahad", "fahad"),
    (5, "Asad Bourbon", "asad-bourbon"),
    (4, "His Confession", "his-confession"),
    (3, "Maahir Honor", "maahir-honor"),
    (2, "Art of Universe", "art-of-universe"),
    (1, "The Kingdom", "the-kingdom"),
]
INTRO_FLASH = ["khamrah", "asad-elixir", "fakhar-black", "fahad", "his-confession", "maahir-honor", "the-kingdom"]

INTRO_DUR = 1.75
FLASH = 0.25
SLIDE = 1.3
FINAL_DUR = 3.25
RANK_DUR = SLIDE * len(RANKING)
TOTAL = INTRO_DUR + RANK_DUR + FINAL_DUR  # 18.0

W, H = 1080, 1920
FLOOR_Y = 1250  # topo do pedestal (base do frasco)
DEPTH_LAYERS = 14
DEPTH_STEP = 4.0  # px entre camadas -> espessura ~56 px


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    return struct.unpack(">II", head[16:24])


def bottle(pid, slug, max_h, max_w=600):
    src = f"assets/bottles/{slug}.webp"
    w, h = png_size(os.path.join(ROOT, f"assets/cut/{slug}.png"))
    bh = min(max_h, max_w * h / w)
    bw = bh * w / h
    layers = []
    for i in range(DEPTH_LAYERS, 0, -1):
        z = i * DEPTH_STEP
        b = 0.30 + 0.25 * (1 - i / DEPTH_LAYERS)
        layers.append(
            f'<img class="layer" src="{src}" alt="" style="transform:translateZ(-{z:.1f}px);filter:brightness({b:.2f}) saturate(0.9)" />'
        )
    layers = "\n          ".join(layers)
    return f"""
      <div class="stage">
        <div class="shadow" id="{pid}-shadow"></div>
        <div class="spin" id="{pid}-spin" style="width:{bw:.0f}px;height:{bh:.0f}px;margin-left:-{bw/2:.0f}px;top:{FLOOR_Y - bh:.0f}px">
          {layers}
          <img class="front" src="{src}" alt="" />
          <div class="shine" id="{pid}-shine" style="-webkit-mask-image:url({src});mask-image:url({src})"></div>
        </div>
      </div>"""


def particles(prefix, n=16, seed=7):
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        x = rnd.uniform(60, W - 60)
        y = rnd.uniform(300, 1500)
        s = rnd.uniform(4, 11)
        o = rnd.uniform(0.18, 0.55)
        out.append(
            f'<i class="dot" id="{prefix}-dot{i}" style="left:{x:.0f}px;top:{y:.0f}px;width:{s:.1f}px;height:{s:.1f}px;opacity:{o:.2f}"></i>'
        )
    return "\n      ".join(out), rnd


BASE_CSS = f"""
    @font-face {{ font-family: 'Gotham Black'; src: url('assets/fonts/GothamBlack.otf'); font-weight: 900; }}
    #root {{ position: absolute; inset: 0; overflow: hidden; background: #0F2E33; font-family: 'Montserrat', sans-serif; }}
    .bg {{ position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 70% 42% at 50% 46%, rgba(212,154,78,0.30) 0%, rgba(212,154,78,0.08) 45%, rgba(15,46,51,0) 70%),
        radial-gradient(ellipse 120% 80% at 50% 40%, #17454B 0%, #0F2E33 55%, #071B1E 100%); }}
    .dot {{ position: absolute; border-radius: 50%; background: radial-gradient(circle, #FFD58A 0%, rgba(212,154,78,0) 70%); }}
    .pedestal {{ position: absolute; left: 50%; top: {FLOOR_Y - 60}px; width: 700px; margin-left: -350px; height: 190px; }}
    .pedestal .side {{ position: absolute; left: 0; right: 0; top: 60px; height: 95px;
      background: linear-gradient(90deg, #061518 0%, #12363B 30%, #1B474D 50%, #12363B 70%, #061518 100%);
      border-radius: 0 0 50% 50% / 0 0 60px 60px; }}
    .pedestal .top {{ position: absolute; left: 0; right: 0; top: 0; height: 120px; border-radius: 50%;
      background: radial-gradient(ellipse at 50% 40%, #24565C 0%, #143B40 55%, #0B2629 100%);
      box-shadow: inset 0 0 0 2px rgba(212,154,78,0.55), 0 0 40px rgba(212,154,78,0.18); }}
    .stage {{ position: absolute; inset: 0; perspective: 1700px; perspective-origin: 50% 45%; }}
    .spin {{ position: absolute; left: 50%; transform-style: preserve-3d; }}
    .spin img {{ position: absolute; inset: 0; width: 100%; height: 100%; display: block; }}
    .shine {{ position: absolute; inset: 0; -webkit-mask-size: 100% 100%; mask-size: 100% 100%;
      background: linear-gradient(100deg, rgba(255,255,255,0) 38%, rgba(255,246,225,0.55) 49%, rgba(255,255,255,0) 60%);
      background-size: 300% 100%; background-position: 130% 0; mix-blend-mode: screen; }}
    .shadow {{ position: absolute; left: 50%; top: {FLOOR_Y + 22}px; width: 460px; height: 70px; margin-left: -230px;
      border-radius: 50%; background: radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%); }}
    .slide {{ position: absolute; inset: 0; }}
"""


def write(path, text):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
        f.write(text)


# ---------------- intro ----------------
dots, _ = particles("in", seed=3)
flashes = []
for i, slug in enumerate(INTRO_FLASH):
    flashes.append(
        f"""    <div id="in-f{i}" class="clip slide" data-start="{i*FLASH:.2f}" data-duration="{FLASH:.2f}">{bottle(f"in-f{i}", slug, 560, 480)}
    </div>"""
)
intro_js = []
for i in range(len(INTRO_FLASH)):
    t = i * FLASH
    intro_js.append(
        f'tl.fromTo("#in-f{i}-spin", {{rotationY: {-30 if i%2==0 else 30}, scale: 1.12}}, {{rotationY: {18 if i%2==0 else -18}, scale: 1, duration: {FLASH}, ease: "power2.out"}}, {t:.2f});'
    )
    intro_js.append(
        f'tl.fromTo("#in-f{i}-shine", {{backgroundPosition: "130% 0"}}, {{backgroundPosition: "-30% 0", duration: {FLASH}, ease: "none"}}, {t:.2f});'
    )
intro = f"""<template>
  <style>
{BASE_CSS}
    #in-title {{ position: absolute; left: 0; right: 0; top: 285px; text-align: center; color: #fff; }}
    #in-t1 {{ display: block; font-weight: 300; font-size: 46px; letter-spacing: 0.42em; color: #F2E8D8; margin-left: 0.42em; }}
    #in-t2 {{ display: block; font-weight: 900; font-size: 100px; line-height: 1.02; letter-spacing: -0.01em; margin-top: 10px; }}
    #in-t3 {{ display: block; font-family: 'Gotham Black', 'Montserrat', sans-serif; font-weight: 900; font-size: 112px; line-height: 1; color: #D49A4E; letter-spacing: 0.04em; }}
  </style>
  <div id="root" data-composition-id="intro" data-width="1080" data-height="1920" data-layout-allow-overlap>
    <div class="bg"></div>
      {dots}
    <div class="pedestal"><div class="side"></div><div class="top"></div></div>
{chr(10).join(flashes)}
    <div id="in-title">
      <span id="in-t1">RANQUEANDO</span>
      <span id="in-t2">MASCULINOS</span>
      <span id="in-t3">LATTAFA</span>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join("    " + l for l in intro_js).strip()}
    tl.fromTo("#in-t3", {{ scale: 1.12 }}, {{ scale: 1, duration: 0.6, ease: "power3.out" }}, 0);
    tl.fromTo("[id^='in-dot']", {{ y: 0 }}, {{ y: -60, duration: {INTRO_DUR}, ease: "none" }}, 0);
    window.__timelines["intro"] = tl;
  </script>
</template>
"""
write("compositions/intro.html", intro)

# ---------------- ranking ----------------
dots, _ = particles("rk", seed=11)
slides, js = [], []
for i, (pos, name, slug) in enumerate(RANKING):
    t = i * SLIDE
    pid = f"rk{pos}"
    slides.append(
        f"""    <div id="{pid}" class="clip slide" data-start="{t:.2f}" data-duration="{SLIDE:.2f}">{bottle(pid, slug, 660, 580)}
      <div class="rk-title" id="{pid}-title">
        <span class="rk-num" id="{pid}-num">{pos}º</span>
        <span class="rk-name" id="{pid}-name">{name}</span>
      </div>
    </div>"""
    )
    d = -1 if i % 2 == 0 else 1
    js += [
        f'tl.fromTo("#{pid}-spin", {{rotationY: {-38*d}, rotationX: 5}}, {{rotationY: {34*d}, rotationX: -3, duration: {SLIDE}, ease: "sine.inOut"}}, {t:.2f});',
        f'tl.fromTo("#{pid}-spin", {{scale: 1.14, y: 26}}, {{scale: 1, y: 0, duration: 0.42, ease: "power3.out"}}, {t:.2f});',
        f'tl.fromTo("#{pid}-shine", {{backgroundPosition: "{130 if d<0 else -30}% 0"}}, {{backgroundPosition: "{-30 if d<0 else 130}% 0", duration: {SLIDE}, ease: "sine.inOut"}}, {t:.2f});',
        f'tl.fromTo("#{pid}-shadow", {{scaleX: 0.8, opacity: 0.6}}, {{scaleX: 1, opacity: 1, duration: 0.42, ease: "power3.out"}}, {t:.2f});',
        f'tl.fromTo("#{pid}-num", {{scale: 1.6, opacity: 0}}, {{scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.2)"}}, {t:.2f});',
        f'tl.fromTo("#{pid}-name", {{y: 34, opacity: 0}}, {{y: 0, opacity: 1, duration: 0.24, ease: "power3.out"}}, {t+0.04:.2f});',
    ]
ranking = f"""<template>
  <style>
{BASE_CSS}
    #rk-label {{ position: absolute; left: 0; right: 0; top: 186px; text-align: center; font-weight: 300; font-size: 28px;
      letter-spacing: 0.38em; color: #F2E8D8; opacity: 0.85; }}
    #rk-label b {{ font-weight: 800; color: #D49A4E; }}
    .rk-title {{ position: absolute; left: 0; right: 0; top: 285px; text-align: center; color: #fff; }}
    .rk-num {{ display: block; font-family: 'Gotham Black', 'Montserrat', sans-serif; font-weight: 900; font-size: 150px; line-height: 1;
      color: #D49A4E; text-shadow: 0 6px 30px rgba(0,0,0,0.45); }}
    .rk-name {{ display: block; font-weight: 800; font-size: 80px; line-height: 1.05; margin-top: 4px; letter-spacing: -0.01em;
      text-shadow: 0 4px 24px rgba(0,0,0,0.5); }}
  </style>
  <div id="root" data-composition-id="ranking" data-width="1080" data-height="1920" data-layout-allow-overlap>
    <div class="bg"></div>
      {dots}
    <div class="pedestal"><div class="side"></div><div class="top"></div></div>
{chr(10).join(slides)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join("    " + l for l in js).strip()}
    tl.fromTo("[id^='rk-dot']", {{ y: 0 }}, {{ y: -220, duration: {RANK_DUR:.2f}, ease: "none" }}, 0);
    window.__timelines["ranking"] = tl;
  </script>
</template>
"""
write("compositions/ranking.html", ranking)

# ---------------- final ----------------
dots, _ = particles("fn", seed=5)
lines = [["E", "pra", "você,"], ["qual", "é", "o", "seu"], ["perfume", "masculino"], ["favorito", "da"], ["LATTAFA?"]]
words_html, wjs, k = [], [], 0
for ln in lines:
    spans = []
    for wd in ln:
        cls = "fn-w fn-brand" if wd.startswith("LATTAFA") else "fn-w"
        spans.append(f'<span class="{cls}" id="fn-w{k}">{wd}</span>')
        wjs.append(f'tl.fromTo("#fn-w{k}", {{opacity: 0, y: 26, filter: "blur(8px)"}}, {{opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out"}}, {0.10 + k*0.08:.2f});')
        k += 1
    words_html.append('<div class="fn-line">' + " ".join(spans) + "</div>")
final = f"""<template>
  <style>
{BASE_CSS}
    #fn-q {{ position: absolute; left: 110px; right: 110px; top: 470px; text-align: center; color: #fff; }}
    .fn-line {{ font-weight: 800; font-size: 72px; line-height: 1.12; letter-spacing: -0.01em; }}
    .fn-w {{ display: inline-block; }}
    .fn-brand {{ font-family: 'Gotham Black', 'Montserrat', sans-serif; font-weight: 900; color: #D49A4E; font-size: 100px; margin-top: 14px; letter-spacing: 0.03em; }}
    #fn-cta {{ position: absolute; left: 0; right: 0; top: 1030px; text-align: center; font-weight: 400; font-size: 38px; color: #F2E8D8; }}
    #fn-sign {{ position: absolute; left: 0; right: 0; top: 1130px; text-align: center; font-weight: 600; font-size: 30px; letter-spacing: 0.45em; color: #D49A4E; margin-left: 0.45em; }}
    #fn-rule {{ position: absolute; left: 50%; top: 1105px; width: 120px; margin-left: -60px; height: 2px; background: #D49A4E; opacity: 0.7; }}
  </style>
  <div id="root" data-composition-id="final" data-width="1080" data-height="1920" data-layout-allow-overlap>
    <div class="bg"></div>
      {dots}
    <div id="fn-q">
      {chr(10).join("      " + w for w in words_html).strip()}
    </div>
    <div id="fn-cta">Comenta aqui embaixo</div>
    <div id="fn-rule"></div>
    <div id="fn-sign">VALOTA PARFUM</div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join("    " + l for l in wjs).strip()}
    tl.fromTo("#fn-cta", {{opacity: 0, y: 20}}, {{opacity: 1, y: 0, duration: 0.35, ease: "power2.out"}}, 0.95);
    tl.fromTo("#fn-rule", {{scaleX: 0}}, {{scaleX: 1, duration: 0.4, ease: "power2.out"}}, 1.05);
    tl.fromTo("#fn-sign", {{opacity: 0, y: 16}}, {{opacity: 1, y: 0, duration: 0.4, ease: "power3.out"}}, 1.1);
    tl.fromTo("[id^='fn-dot']", {{ y: 0 }}, {{ y: -80, duration: {FINAL_DUR}, ease: "none" }}, 0);
    window.__timelines["final"] = tl;
  </script>
</template>
"""
write("compositions/final.html", final)

# ---------------- index ----------------
R0, F0 = INTRO_DUR, INTRO_DUR + RANK_DUR
index = f"""<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0F2E33; }}
      #root {{ position: relative; width: 100%; height: 100%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.2f}" data-width="1080" data-height="1920">
      <div id="intro" data-composition-id="intro" data-composition-src="compositions/intro.html" data-start="0" data-duration="{INTRO_DUR:.2f}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="ranking" data-composition-id="ranking" data-composition-src="compositions/ranking.html" data-start="{R0:.2f}" data-duration="{RANK_DUR:.2f}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="final" data-composition-id="final" data-composition-src="compositions/final.html" data-start="{F0:.2f}" data-duration="{FINAL_DUR:.2f}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <audio id="bgm" src=".media/audio/bgm/bgm_001.wav" data-timeline-role="music" class="clip" data-start="0" data-duration="{TOTAL:.2f}" data-track-index="5" data-volume="0.9" data-fade-out="0.6"></audio>
      <audio id="whoosh-1" src=".media/audio/sfx/sfx_001.mp3" class="clip" data-start="{R0-0.12:.2f}" data-duration="0.3" data-track-index="6" data-volume="0.45"></audio>
      <audio id="whoosh-2" src=".media/audio/sfx/sfx_001.mp3" class="clip" data-start="{F0-0.12:.2f}" data-duration="0.3" data-track-index="6" data-volume="0.45"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""
write("index.html", index)
print("ok", TOTAL)

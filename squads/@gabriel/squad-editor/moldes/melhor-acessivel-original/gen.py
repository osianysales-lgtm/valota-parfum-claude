# Molde "MELHOR · ACESSÍVEL · ORIGINAL" (1º uso: v48, 17/11/2026) · NARRAÇÃO PETRÓLEO
# Inspiração: reel do original x acessível (Downloads/ClaudCode/original. acessivel/inspiracao.mp4).
# Faixa fixa MELHOR · ACESSÍVEL · ORIGINAL (3 colunas) → frascos entram 1 por vez (original → acessível → melhor),
# mãozinha aponta cada um na palavra falada, coluna da vez acende; "melhor" ganha halo amarelo + raios + brilho.
# CTA no meio: frascos tremem no "calma", a tela encolhe num card ("desse formato") + ícone SALVAR que a mãozinha toca no "salva".
# Uso: VEL=1.5 python3 moldes/melhor-acessivel-original/gen.py output/vN/
#   precisa: palavras_1x.json (cortar_pausas.py), narracao_150.wav / narracao_165.wav, frascos/*.png, fontes/
import json, sys, re, os, struct, unicodedata
P = sys.argv[1].rstrip('/') + '/'
VEL = float(os.environ.get('VEL', '1.5')); SUF = str(int(round(VEL * 100)))
W = json.load(open(P + 'palavras_1x.json'))['palavras']
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def T(i, adiant=0.0): return round(max(0.0, W[i]['start'] / VEL - adiant), 3)
def chk(i, w):
    assert n(W[i]['word']) == n(w), f'palavra {i} é "{W[i]["word"]}", esperava "{w}"'
    return i
FALA_FIM = round(W[-1]['end'] / VEL, 3); END = round(FALA_FIM + 1.5, 2)

def png_wh(f):
    with open(P + f, 'rb') as fh: fh.read(16); return struct.unpack('>II', fh.read(8))
BOX_W, BOX_H = 325, 690
def frasco(img, marca, nome, col, i_in, i_lbl, w_in, w_lbl):
    w, h = png_wh(img); s = min(BOX_W / w, BOX_H / h)
    return dict(img=img, marca=marca, nome=nome, col=col, w=round(w * s), h=round(h * s),
                tin=T(chk(i_in, w_in), 0.06), tlbl=T(chk(i_lbl, w_lbl)))
# col 0 = MELHOR (esq) · 1 = ACESSÍVEL (meio) · 2 = ORIGINAL (dir) — entram 2 → 1 → 0
TRIOS = [
 dict(b=[frasco('frascos/01-vibrato.png', 'SOSPIRO', 'VIBRATO', 2, 0, 4, 'Esse', 'original'),
         frasco('frascos/02-attar-wesal-gold.png', 'AL WATANIAH', 'ATTAR AL WESAL GOLD', 1, 5, 11, 'Esse', 'acessível'),
         frasco('frascos/03-murade.png', 'RASASI', 'MURADE', 0, 12, 19, 'E', 'melhor')], fim=T(22, 0.06)),
 dict(b=[frasco('frascos/04-erba-pura.png', 'XERJOFF', 'ERBA PURA', 2, 22, 23, 'Perfume', 'original'),
         frasco('frascos/05-amber-oud-gold.png', 'AL HARAMAIN', 'AMBER OUD GOLD', 1, 25, 26, 'Versão', 'acessível'),
         frasco('frascos/06-voux-turquoise.png', 'EMIR', 'VOUX TURQUOISE', 0, 31, 40, 'Mas', 'melhor')], fim=T(63, 0.06)),
 dict(b=[frasco('frascos/07-absolu-aventus.png', 'CREED', 'ABSOLU AVENTUS', 2, 63, 64, 'Perfume', 'original'),
         frasco('frascos/08-cdn-precieux.png', 'ARMAF', 'CLUB DE NUIT PRÉCIEUX I', 1, 77, 78, 'Versão', 'acessível'),
         frasco('frascos/09-supremacy-collectors.png', 'AFNAN', "SUPREMACY COLLECTOR'S", 0, 83, 88, 'Mas', 'melhor')], fim=T(91, 0.06),
      brilho_original=T(chk(75, 'perfumaço'))),
 dict(b=[frasco('frascos/10-naxos.png', 'XERJOFF', 'NAXOS', 2, 91, 92, 'Perfume', 'original'),
         frasco('frascos/11-voux-elegante.png', 'EMIR', 'VOUX ELEGANTE', 1, 93, 94, 'Versão', 'acessível'),
         frasco('frascos/12-italia-rayhaan.png', 'RAYHAAN', 'ITALIA', 0, 97, 102, 'Mas', 'melhor')], fim=END + 5,
      final=T(chk(105, 'de'))),
]
TRIOS[0]['b'][0]['tin'] = -0.6  # 1º frasco já pronto no quadro 0 (capa do reels)
for k, tr in enumerate(TRIOS):
    tr['ini'] = tr['b'][0]['tin']; tr['tmel'] = tr['b'][2]['tlbl']
CTA = dict(calma=[T(chk(i, 'calma')) for i in (43, 44, 45, 46)], se=T(chk(47, 'Se')), curte=T(chk(54, 'curte')),
           salva=T(chk(57, 'salva')), simb=T(chk(61, 'Vamos')))

SFX = []
for tr in TRIOS:
    for j, b in enumerate(tr['b']):
        SFX.append(('pop_leve.mp3', max(0.0, b['tin'] + 0.04), .32)) if b['tin'] >= 0 else None
    SFX.append(('shine_brilho.mp3', tr['tmel'], .38))
    if tr['fim'] < END: SFX.append(('whoosh_suave.mp3', tr['fim'] - 0.3, .22))
SFX += [('whoosh_suave.mp3', CTA['se'], .25), ('pop_leve.mp3', CTA['curte'], .25), ('ding_acerto.mp3', CTA['salva'] + 0.05, .32),
        ('whoosh_suave.mp3', CTA['simb'], .3), ('shine_brilho.mp3', TRIOS[2]['brilho_original'], .3),
        ('shine_brilho.mp3', TRIOS[3]['final'], .35)]
SFX += [('click_ui.mp3', c, .22) for c in CTA['calma']]

D = dict(TRIOS=TRIOS, CTA=CTA, END=END, FALA_FIM=FALA_FIM)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + f'index_{SUF}.html', 'w').write(html)
json.dump({'narracao': {'file': f'narracao_{SUF}.wav', 'volume': 1},
           'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': round(t, 3), 'volume': v} for a, t, v in sorted(SFX, key=lambda x: x[1])]},
          open(P + f'audio_map_{SUF}.json', 'w'), indent=1)
for k, tr in enumerate(TRIOS):
    print(f"trio {k+1}: " + ' | '.join(f"{b['nome']} in {b['tin']:.2f} lbl {b['tlbl']:.2f} ({b['w']}x{b['h']})" for b in tr['b']) + f" · fim {tr['fim']:.2f}")
print('CTA', CTA); print('VEL', VEL, 'FALA_FIM', FALA_FIM, 'END', END, 'sfx', len(SFX))

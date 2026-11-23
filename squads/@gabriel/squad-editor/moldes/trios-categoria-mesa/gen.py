# Molde "TRIOS POR CATEGORIA NA MESA" (1º uso: v51, 17/11/2026)
# Referência: carrossel @perfumaria.dubaii (24/10) "Qual perfume você tem dessa lista?": 5 slides,
# cada um com categoria em cima, 3 frascos com emojis das notas e 3 adjetivos embaixo.
# Mesa petróleo do v49/v50, SEM MÃO: os frascos surgem um a um na mesa e DEPOIS entram as letras
# (emojis → nomes → categoria → adjetivos). SEM MÚSICA (ela põe no Instagram). Final = CTA do v49/v50.
# Uso: python3 moldes/trios-categoria-mesa/gen.py output/vN/
#   precisa em output/vN/: frascos/NN-*.png (recortados), mao/cenario_petroleo.jpg, mao/avatar.png, fontes/
#   render: node daphne.js output/vN/index.html <END> --out "output/vN/REELS ....mp4"
import json, sys, os, struct
P = sys.argv[1].rstrip('/') + '/'

def png_wh(f):
    with open(P + f, 'rb') as fh: fh.read(16); return struct.unpack('>II', fh.read(8))

BOX_W, BOX_H = 262, 520          # caixa máxima de cada frasco na tela
def fr(img, nome, marca, emo):
    w, h = png_wh(img); s = min(BOX_W / w, BOX_H / h)
    return dict(img=img, nome=nome, marca=marca, emo=emo, w=round(w * s), h=round(h * s))

GANCHO = ['QUAL DESSES', 'VOCÊ TEM?']
# cada trio: categoria, adjetivos, [esquerda, meio, direita]
TRIOS = [
 dict(cat='HOMEM DE NEGÓCIOS', adj=['Sofisticado', 'moderno', 'marcante'], fr=[
  fr('frascos/01-supremacy.png', "Supremacy Collector's Edition", 'AFNAN', '🍍'),
  fr('frascos/02-hawas-black.png', 'Hawas Black', 'RASASI', '🍍🪵'),
  fr('frascos/03-cdn-intense-man.png', 'Club de Nuit Intense Man', 'ARMAF', '🍋🍍💨')]),
 dict(cat='O REI DELAS', adj=['Romântico', 'conquistador', 'sedutor'], fr=[
  fr('frascos/04-asad-bourbon.png', 'Asad Bourbon', 'LATTAFA', '🍦'),
  fr('frascos/05-the-kingdom.png', 'The Kingdom', 'LATTAFA', '🍯'),
  fr('frascos/06-liquid-brun.png', 'Liquid Brun Limited Edition', 'FRENCH AVENUE', '🍪🍫')]),
 dict(cat='PARA TODAS AS HORAS', adj=['Frescor', 'versátil', 'limpo'], fr=[
  fr('frascos/07-hawas-kobra.png', 'Hawas Kobra', 'RASASI', '💦🚿🫚'),
  fr('frascos/08-burkan.png', 'Burkan', 'FERASSA', '🍊🍊'),
  fr('frascos/09-cdn-iconic.png', 'Club de Nuit Iconic', 'ARMAF', '🍋‍🟩🫧')]),
 dict(cat='FRUTADOS E COMPARTILHÁVEIS', adj=['Fresco', 'cremoso', 'gostoso'], fr=[
  fr('frascos/10-badee-sublime.png', "Bade'e Al Oud Sublime", 'LATTAFA', '🍏'),
  fr('frascos/11-qaed-al-fursan.png', 'Qaed Al Fursan', 'LATTAFA', '🍍🍍🍍'),
  fr('frascos/12-opulent-dubai.png', 'Opulent Dubai', 'LATTAFA', '🥭🥭')]),
 dict(cat='CHEIRO DE MACHO', adj=['Intenso', 'magnético', 'masculino'], fr=[
  fr('frascos/13-musamam-black-intense.png', 'Musamam Black Intense', 'LATTAFA', '🪵'),
  fr('frascos/14-sauvage.png', 'Sauvage EDT', 'DIOR', '💰💸'),
  fr('frascos/15-asad-elixir.png', 'Asad Elixir', 'LATTAFA', '🚬💨🪵')]),
]
DUR = 6.6                         # segundos por trio
INI = [round(k * DUR, 2) for k in range(len(TRIOS))]
INI[0] = -0.35                    # 1º frasco já entrando no 1º quadro (gancho + frasco desde o início)
FIM = INI[1:] + [round(len(TRIOS) * DUR, 2)]
C0 = FIM[-1]
CTA = dict(ini=C0, card=C0 + 1.6, siga=C0 + 2.2, toque=C0 + 3.4)
END = round(C0 + 6.0, 2)
D = dict(GANCHO=GANCHO, TRIOS=TRIOS, INI=INI, FIM=FIM, CTA=CTA, END=END)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
for k, t in enumerate(TRIOS):
    print(f"trio {k+1} {INI[k]:.1f}–{FIM[k]:.1f}s · {t['cat']} · " + ' | '.join(f"{b['nome']} ({b['w']}x{b['h']})" for b in t['fr']))
print('END', END)

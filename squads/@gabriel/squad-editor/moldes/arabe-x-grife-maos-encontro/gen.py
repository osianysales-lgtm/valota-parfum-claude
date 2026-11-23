# v54 · ÁRABE X GRIFE · MÃOS SE ENCONTRANDO (cena noturna do Gemini) · 17/11/2026
# Cada dupla: fundo limpo + mão esquerda (árabe) e mão direita (grife) entram pelas laterais e se encontram no meio;
# no fim do encontro a foto original aparece por cima (reflexos na mesa). Preço + nome de cada lado também vêm se encontrando.
# SEM MÚSICA (ela põe no Instagram). Final = card de seguir do v50.
# Uso: python3 gen.py   →  index.html  ·  render: node daphne.js output/v54-.../index.html <END> --out "output/v54-.../REELS ....mp4"
import json, os, glob
P = os.path.dirname(os.path.abspath(__file__)) + '/'
CAM = json.load(open(P + 'camadas/camadas.json'))
L = {(c['n'], c['lado']): c for c in CAM['camadas']}

# ordem: grife mais cara → mais barata · [árabe (esq), grife (dir)]
DUPLAS = [
 ('01', ['Maahir Honor', 'R$ 339'], ['Torino 21<br>Xerjoff', 'R$ 3.599,00']),
 ('02', ['Vulcan Feu', 'R$ 389'], ['God of Fire<br>S. H. Lucas', 'R$ 2.944,05']),
 ('03', ['Spectre Ghost', 'R$ 389'], ['Ani<br>Nishane', 'R$ 2.243,99']),
 ('04', ['Corium<br>Rayhaan', 'R$ 399'], ['Stronger With<br>You Leather', 'R$ 1.348,69']),
 ('05', ['Fakhar Platin', 'R$ 299'], ['Y EDP<br>Intense', 'R$ 1.199,00']),
 ('06', ['Hawas<br>For Him', 'R$ 359'], ['Invictus<br>Rabanne', 'R$ 963,21']),
 ('07', ['Fakhar Black', 'R$ 299'], ['Y EDP<br>YSL', 'R$ 899']),
 ('08', ['Fakhar Gold', 'R$ 299'], ['One Million<br>Rabanne', 'R$ 769']),
 ('09', ['9 PM Elixir', 'R$ 389'], ['Le Male<br>Elixir', 'R$ 764,65']),
]
DUR = 3.2
INI = [round(k * DUR, 2) for k in range(len(DUPLAS))]
INI[0] = -0.45                       # 1º quadro (capa) já com as mãos quase se encontrando
FIM = INI[1:] + [round(len(DUPLAS) * DUR, 2)]
C0 = FIM[-1]
CTA = dict(ini=999, card=999, siga=999, toque=999)   # SEM CTA dentro do criativo (pedido dela no v54)
END = C0
# frasco árabe que o Gemini deixou flutuando: desce a mão+frasco até a mesa (px da imagem original)
DESCE = {'07': 159, '08': 202}

def preco(v):                       # 'R$ 3.599,00' → ('3.599', '00')
    n = v.replace('R$', '').strip()
    return (n.split(',')[0], n.split(',')[1]) if ',' in n else (n, '00')

D = []
for k, (n, a, g) in enumerate(DUPLAS):
    foto = glob.glob(P + f'imagens/{n}-*.jpg')[0].replace(P, '')
    D.append(dict(n=n, foto=foto, fundo=f'camadas/{n}_fundo.jpg', esq=L[(n, 'esq')], dir=L[(n, 'dir')],
                  desce=DESCE.get(n, 0), a=dict(nome=a[0], preco=preco(a[1])), g=dict(nome=g[0], preco=preco(g[1])), ini=INI[k], fim=FIM[k]))
DADOS = dict(DUPLAS=D, CTA=CTA, END=END, W=CAM['W'], H=CAM['H'])
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(DADOS, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
for d in D: print(f"{d['n']} {d['ini']:>5}–{d['fim']:<5} {d['a']['nome'].replace('<br>',' ')} ({','.join(d['a']['preco'])}) x {d['g']['nome'].replace('<br>',' ')} ({','.join(d['g']['preco'])})")
print('END', END)

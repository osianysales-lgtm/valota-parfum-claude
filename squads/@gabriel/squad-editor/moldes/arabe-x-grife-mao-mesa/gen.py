# Molde "ÁRABE X GRIFE" com MÃO REAL colocando o árabe na mesa (1º uso: v50, 17/11/2026)
# Inspiração: Downloads/ClaudCode/inspiracao3.mp4 (11 duplas árabe × grife com preço, ~3,2 s cada).
# SEM MÚSICA (ela põe no Instagram). Paleta petróleo: cenário da mesa tingido de petróleo.
# A grife já está na mesa quando a dupla entra (corte seco); a mão traz o árabe pela esquerda; o preço do árabe acende em amarelo.
# Final: pergunta + card do perfil (sem seguidores) + "me segue e clica no link da bio" (informal coerente, pedido dela 17/11).
# Uso: python3 moldes/arabe-x-grife-mao-mesa/gen.py output/vN/
#   precisa em output/vN/: frascos/rec/*.png (recortados), mao/mao_final.png, mao/cenario_mesa.jpg, mao/avatar.png, fontes/
#   render: node daphne.js output/vN/index.html <END> --out "output/vN/REELS ....mp4"
import json, sys, os, struct
P = sys.argv[1].rstrip('/') + '/'

def png_wh(f):
    with open(P + f, 'rb') as fh: fh.read(16); return struct.unpack('>II', fh.read(8))

BOX_W, BOX_H = 400, 680
def fr(img, nome, preco, esc=1.0, brilho=1.0):
    w, h = png_wh('frascos/rec/' + img); s = min(BOX_W / w, BOX_H / h) * esc
    return dict(img='frascos/rec/' + img, nome=nome, preco=preco, w=round(w * s), h=round(h * s), brilho=brilho)

# cada dupla: [ÁRABE (esq, a mão traz), GRIFE (dir, já na mesa)]
DUPLAS = [
 [fr('01-spectre-ghost.png', 'Spectre<br>Ghost', 'R$ 389', brilho=1.25), fr('02-ani.png', 'Ani<br>Nishane', 'R$ 2.243,99', .92)],
 [fr('03-fakhar-black.png', 'Fakhar<br>Black', 'R$ 299', brilho=1.2), fr('04-y-edp.png', 'Y EDP<br>YSL', 'R$ 899')],
 [fr('05-corium.png', 'Corium<br>Rayhaan', 'R$ 399', .9), fr('06-swy-leather.png', 'Stronger With<br>You Leather', 'R$ 1.348,69', .9)],
 [fr('07-hawas-black.png', 'Hawas<br>Black', 'R$ 359', brilho=1.25), fr('08-hacivat.png', 'Hacivat<br>Nishane', 'R$ 1.829,00', .9)],
 [fr('09-fakhar-platin.png', 'Fakhar<br>Platin', 'R$ 299'), fr('10-y-edp-intense.png', 'Y EDP<br>Intense', 'R$ 1.199,00')],
 [fr('11-muharib.png', 'Muharib', 'R$ 549'), fr('12-naxos.png', 'Naxos<br>Xerjoff', 'R$ 2.763,78')],
 [fr('13-hawas-for-him.png', 'Hawas<br>For Him', 'R$ 359'), fr('14-invictus.png', 'Invictus<br>Rabanne', 'R$ 963,21')],
 [fr('15-vulcan-feu.png', 'Vulcan<br>Feu', 'R$ 389'), fr('16-god-of-fire.png', 'God of Fire<br>S. H. Lucas', 'R$ 2.944,05')],
 [fr('17-9pm-elixir.png', '9 PM<br>Elixir', 'R$ 389', brilho=1.15), fr('18-le-male-elixir.png', 'Le Male<br>Elixir', 'R$ 764,65')],
 [fr('19-fakhar-gold.png', 'Fakhar<br>Gold', 'R$ 299'), fr('20-one-million.png', 'One Million<br>Rabanne', 'R$ 769')],
 [fr('21-maahir-honor.png', 'Maahir<br>Honor', 'R$ 339'), fr('22-torino-21.png', 'Torino 21<br>Xerjoff', 'R$ 3.599,00')],
]
DUR = 3.2                                   # ritmo do original (~3,2 s por dupla)
INI = [round(k * DUR, 2) for k in range(len(DUPLAS))]
FIM = INI[1:] + [round(len(DUPLAS) * DUR, 2)]
for k, d in enumerate(DUPLAS):
    d[0]['tin'] = -0.45 if k == 0 else round(INI[k] + 0.05, 2)   # 1º já chegando no quadro 0 (capa)
C0 = FIM[-1]
CTA = dict(ini=C0, card=round(C0 + 1.4, 2), siga=round(C0 + 1.9, 2), toque=round(C0 + 3.0, 2))
END = round(C0 + 5.2, 2)
D = dict(DUPLAS=DUPLAS, INI=INI, FIM=FIM, CTA=CTA, END=END)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
for k, d in enumerate(DUPLAS):
    print(f'dupla {k+1}: ' + ' x '.join(f"{b['nome'].replace('<br>',' ')} ({b['w']}x{b['h']})" for b in d) + f' · {INI[k]}–{FIM[k]}')
print('END', END)

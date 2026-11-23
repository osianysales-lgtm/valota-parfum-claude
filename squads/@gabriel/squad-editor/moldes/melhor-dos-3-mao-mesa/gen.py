# Molde "O MELHOR DOS 3 · SURREAL · BOM" com MÃO REAL colocando os frascos na mesa (1º uso: v49, 17/11/2026)
# Inspiração: Downloads/inspiracao.mp4 (5 trios, mão coloca 1 frasco por vez: BOM (dir) → SURREAL (meio) → O MELHOR DOS 3 (esq)).
# SEM MÚSICA (ela põe no Instagram). Final escuro: pergunta + card do perfil (sem seguidores) + "me siga e clique no link da bio".
# Uso: python3 moldes/melhor-dos-3-mao-mesa/gen.py output/vN/
#   precisa em output/vN/: frascos/*.png (recortados), mao/mao_final.png, mao/cenario_mesa.jpg, mao/avatar.png, fontes/
#   render: node daphne.js output/vN/index.html <END> --out "output/vN/REELS ....mp4"
import json, sys, os, struct
P = sys.argv[1].rstrip('/') + '/'

def png_wh(f):
    with open(P + f, 'rb') as fh: fh.read(16); return struct.unpack('>II', fh.read(8))

BOX_W, BOX_H = 300, 600          # caixa máxima de cada frasco na tela
def fr(img, nome, marca):
    w, h = png_wh(img); s = min(BOX_W / w, BOX_H / h)
    return dict(img=img, nome=nome, marca=marca, w=round(w * s), h=round(h * s))

# cada trio: [BOM, SURREAL, O MELHOR DOS 3] = ordem em que a mão coloca (direita → meio → esquerda)
TRIOS = [
 [fr('frascos/01-regent.png', 'Regent', 'MAISON ASRAR'),
  fr('frascos/02-belgravia.png', 'Belgravia', 'MAISON ASRAR'),
  fr('frascos/03-vanguard.png', 'Vanguard', 'MAISON ASRAR')],
 [fr('frascos/04-cdn-elite.png', 'Club de Nuit Elite', 'ARMAF'),
  fr('frascos/05-cdn-intenso-fuego.png', 'Club de Nuit Intenso Fuego', 'ARMAF'),
  fr('frascos/06-cdn-intense-overdose.png', 'Club de Nuit Intense Overdose', 'ARMAF')],
 [fr('frascos/07-elliur.png', 'Elliur', 'BIDAYA'),
  fr('frascos/08-habibi-king.png', 'Habibi King', 'BIDAYA'),
  fr('frascos/09-sex-on-the-rocks.png', 'S*x On The Rocks', 'BIDAYA')],
 [fr('frascos/10-tropical-vibe.png', 'Tropical Vibe', 'RAYHAAN'),
  fr('frascos/11-aquatica.png', 'Aquatica', 'RAYHAAN'),
  fr('frascos/12-pacific-aura.png', 'Pacific Aura', 'RAYHAAN')],
 [fr('frascos/13-asad.png', 'Asad', 'LATTAFA'),
  fr('frascos/14-asad-bourbon.png', 'Asad Bourbon', 'LATTAFA'),
  fr('frascos/15-asad-elixir.png', 'Asad Elixir', 'LATTAFA')],
]
# tempos (iguais ao ritmo do original: ~3 s por frasco, trio de 9 s; o 1º trio um pouco mais rápido)
INI = [0.0, 7.5, 16.5, 25.5, 34.5]
DT = [[-0.45, 2.3, 4.9], [0.05, 3.0, 6.0], [0.05, 3.0, 6.0], [0.05, 3.0, 6.0], [0.05, 3.0, 6.0]]
FIM = INI[1:] + [43.5]
for k, tr in enumerate(TRIOS):
    for j, b in enumerate(tr): b['tin'] = round(INI[k] + DT[k][j], 2)
CTA = dict(ini=43.5, card=45.1, siga=45.7, toque=46.9)
END = 49.5
D = dict(TRIOS=TRIOS, INI=INI, FIM=FIM, CTA=CTA, END=END)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
for k, tr in enumerate(TRIOS):
    print(f'trio {k+1}: ' + ' | '.join(f"{b['nome']} {b['tin']:.2f}s ({b['w']}x{b['h']})" for b in tr) + f' · fim {FIM[k]}')
print('END', END)

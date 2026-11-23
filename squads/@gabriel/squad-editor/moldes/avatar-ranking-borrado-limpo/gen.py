# MOLDE LIMPO/FORMAL · ranking "afasta x atrai" com frascos BORRADOS · avatar centralizado (card 500 px, formato v13/v14)
# Uso: python3 moldes/avatar-ranking-borrado-limpo/gen.py output/vN/
# Pasta do projeto precisa de: palavras_1x.json, narracao_175.wav, gravacao/avatar_175.mp4, frascos/, fontes/
import json, sys, re, unicodedata, os
P = sys.argv[1].rstrip('/') + '/'
VEL = 1.75
W = json.load(open(P + 'palavras_1x.json'))['palavras']
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii','ignore').decode())
def ix(word, after=0):
    for i in range(after, len(W)):
        if n(W[i]['word']) == n(word): return i
    raise SystemExit('palavra não achada: ' + word)
def T(i): return round(W[i]['start'] / VEL, 3)
def TE(i): return round(W[i]['end'] / VEL, 3)
FALA_FIM = TE(len(W) - 1); END = round(FALA_FIM + 3.0, 2)

i_contra = ix('contra'); i_sabe = ix('sabe'); i_entao = ix('então', i_sabe)
i_fah = ix('fahrenheit'); i_viol = ix('violeta'); i_ai = ix('aí', i_fah); i_polo = ix('polo'); i_pinho = ix('pinho')
i_terc = ix('terceiro'); i_mil = ix('million'); i_canela = ix('canela'); i_agora = ix('agora')
i_isl = ix('island'); i_coco = ix('coco'); i_xt = ix('xtreme'); i_oud2 = ix('oud', i_xt + 2); i_lembra = ix('lembra', i_xt)
i_mas = ix('mas', i_lembra); i_lion = ix('lionheart'); i_hort = ix('hortelã'); i_comp = next((i for i in range(i_lion, len(W)) if n(W[i]['word']) in ('compartilha','quer')), None)  # 1ª palavra do CTA
i_segue = ix('segue', i_comp)

F = {'fah': ('frascos/fahrenheit.jpg', 'FAHRENHEIT', 'DIOR', 'violeta  ·  couro', ''),
     'polo': ('frascos/polo.jpg', 'POLO GREEN', 'RALPH LAUREN', 'pinho  ·  tabaco  ·  couro', ''),
     'mil': ('frascos/million.jpg', '1 MILLION', 'RABANNE', 'canela  ·  couro  ·  doce', ''),
     'isl': ('frascos/island.jpg', 'ISLAND', 'KHADLAJ', 'coco  ·  abacaxi  ·  gengibre', ''),
     'xt': ('frascos/assala.webp', 'XTREME OUD', 'ASSALA', 'oud  ·  âmbar', 'lembra Bleu de Chanel'),
     'lion': ('frascos/lionheart.jpg', 'LIONHEART', 'ARMAF', 'hortelã  ·  mel  ·  baunilha  ·  tabaco', '')}
REVELA = {'fah': T(i_fah), 'polo': T(i_polo), 'mil': T(i_mil) - 0.15, 'isl': T(i_isl), 'xt': T(i_xt), 'lion': T(i_lion)}
NOTAS = {'fah': T(i_viol), 'polo': T(i_pinho), 'mil': T(i_canela), 'isl': T(i_coco), 'xt': T(i_oud2), 'lion': T(i_hort)}
SUB = {'xt': T(i_lembra)}
CENA = {'abertura': (0, T(i_sabe)), 'trioA2': (T(i_sabe), T(i_fah)),
 'big_fah': (T(i_fah), T(i_ai)), 'big_polo': (T(i_ai), T(i_terc) - 0.2), 'big_mil': (T(i_terc) - 0.2, T(i_agora)),
 'trioB2': (T(i_agora), T(i_isl)), 'big_isl': (T(i_isl), T(i_xt) - 0.25), 'big_xt': (T(i_xt) - 0.25, T(i_mas)),
 'lionB': (T(i_mas), T(i_lion)), 'big_lion': (T(i_lion), T(i_comp) + 0.6), 'cta': (T(i_comp) + 0.6, END)}
VERED = {k: round(max(CENA['big_'+k][0] + 1.0, CENA['big_'+k][1] - 1.6), 3) for k in F}
SFX = [('whoosh_suave.mp3', 0.1, .35), ('whoosh_suave.mp3', T(i_contra), .35), ('whoosh_suave.mp3', T(i_sabe), .35)]
for k in ('fah','polo','mil'): SFX += [('pop_leve.mp3', REVELA[k], .4), ('click_ui.mp3', VERED[k], .35)]
SFX += [('suspense_dun.mp3', T(i_agora) + 0.2, .35)]
for k in ('isl','xt'): SFX += [('shine_brilho.mp3', REVELA[k], .35), ('click_ui.mp3', VERED[k], .35)]
SFX += [('riser_curto.mp3', T(i_mas), .35), ('impact_grave.mp3', T(i_lion), .45), ('shine_brilho.mp3', T(i_lion) + .1, .35), ('click_ui.mp3', VERED['lion'], .35), ('whoosh_suave.mp3', CENA['cta'][0], .3), ('ding_notificacao.mp3', T(i_segue), .3)]

NOMES = {'fahrenheit','dior','ralph','lauren','million','island','khadlaj','xtreme','oud','assala','bleu','chanel','lionheart','armaf','valota','parfum','parfa'}
grupos = []; cur = []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 22 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = []
for g in grupos:
    pal = [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': n(W[j]['word']) in NOMES or (n(W[j]['word']) in ('polo','verde') and abs(j - i_polo) <= 1) or (W[j]['word'] == '1' and j + 1 == i_mil)} for j in g]
    LEG.append({'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3), 'p': pal})
# títulos que preenchem o topo dos trios borrados (combinam com a fala daquele trecho)
TIT = {'trioA2': ('A CULPA É DE', 'UM DESSES'), 'trioB2': ('PRO CONTRÁRIO,', 'VAI DE ÁRABE')}
D = dict(TIT=TIT, CONTRA=T(i_contra), END=END, FALA_FIM=FALA_FIM, CENA=CENA, REVELA=REVELA, NOTAS=NOTAS, SUB=SUB, VERED=VERED, F=F, LEG=LEG)
html = open(os.path.join(os.path.dirname(__file__), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]}, open(P + 'audio_map.json', 'w'), indent=1)
print('END', END, 'legendas', len(LEG), 'sfx', len(SFX))

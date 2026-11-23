# MOLDE AV1 PETRÓLEO · ranking "afasta x atrai" com frascos BORRADOS revelados um a um
# Uso: python3 moldes/av1-ranking-borrado/gen.py output/v42-.../   (lê palavras_1x.json, escreve index.html + audio_map.json)
# Tudo que muda de vídeo pra vídeo fica em CENAS (abaixo). Avatar 1x é acelerado por VEL.
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
FALA_FIM = TE(len(W) - 1)
END = round(FALA_FIM + 3.0, 2)

# ---------- marcos da fala ----------
i_contra = ix('contra'); i_pode = ix('pode'); i_sabe = ix('sabe'); i_entao = ix('então', i_sabe)
i_fah = ix('fahrenheit'); i_viol = ix('violeta'); i_posto = ix('posto'); i_calib = ix('calibrar'); i_pneu = ix('pneu')
i_ai = ix('aí', i_pneu); i_polo = ix('polo'); i_pinho = ix('pinho'); i_1978 = ix('1978'); i_gaveta = ix('gaveta'); i_vovo = ix('vovô')
i_terc = ix('terceiro'); i_mil = ix('million'); i_canela = ix('canela'); i_todo = ix('todo', i_mil); i_ex = ix('ex', i_mil)
i_agora = ix('agora'); i_isl = ix('island'); i_coco = ix('coco'); i_ferias = ix('férias'); i_praia = ix('praia')
i_xt = ix('xtreme'); i_oud2 = ix('oud', i_xt + 2); i_lembra = ix('lembra', i_xt); i_trab = ix('trabalho'); i_noite = ix('noite')
i_mas = ix('mas', i_noite); i_lion = ix('lionheart'); i_hort = ix('hortelã'); i_mel = ix('mel'); i_baun = ix('baunilha'); i_tab = ix('tabaco', i_lion)
i_descer = ix('descer'); i_andar = ix('andar', i_descer); i_comp = ix('compartilha'); i_segue = ix('segue', i_comp)
i_dez = None

F = {  # frascos: arquivo, nome, marca, grupo
 'fah': ('frascos/fahrenheit.jpg', 'FAHRENHEIT', 'DIOR', 'afasta'),
 'polo': ('frascos/polo.jpg', 'POLO GREEN', 'RALPH LAUREN', 'afasta'),
 'mil': ('frascos/million.jpg', '1 MILLION', 'RABANNE', 'afasta'),
 'isl': ('frascos/island.jpg', 'ISLAND', 'KHADLAJ', 'atrai'),
 'xt': ('frascos/assala.webp', 'XTREME OUD', 'ASSALA', 'atrai'),
 'lion': ('frascos/lionheart.jpg', 'LIONHEART', 'ARMAF', 'atrai'),
}
REVELA = {'fah': T(i_fah), 'polo': T(i_polo), 'mil': T(i_mil) - 0.15, 'isl': T(i_isl), 'xt': T(i_xt), 'lion': T(i_lion)}

# blocos de cena: (id, inicio, fim)
CENA = {
 'hook':   (0, T(i_sabe)),
 'trioA':  (0.25, T(i_contra)),
 'trioB':  (T(i_contra), T(i_pode)),
 'seis':   (T(i_pode), T(i_sabe)),
 'elev':   (T(i_sabe), T(i_entao)),
 'trioA2': (T(i_entao), T(i_fah)),
 'big_fah':  (T(i_fah), T(i_ai)),
 'big_polo': (T(i_ai), T(i_terc) - 0.2),
 'big_mil':  (T(i_terc) - 0.2, T(i_agora)),
 'trioB2': (T(i_agora), T(i_isl)),
 'big_isl':  (T(i_isl), T(i_xt) - 0.25),
 'big_xt':   (T(i_xt) - 0.25, T(i_mas)),
 'lionB':  (T(i_mas), T(i_lion)),
 'big_lion': (T(i_lion), T(i_comp) + 0.8),
 'cta':    (T(i_comp) + 0.8, END),
}
# extras que entram por cima do frasco grande: (cena, t, html, x, y, classe)
EXTRA = [
 ('big_fah', T(i_viol), '<span class="pill">💜 violeta</span>', 70, 640, ''),
 ('big_fah', T(i_viol)+0.35, '<span class="pill">🟫 couro</span>', 760, 700, ''),
 ('big_fah', T(i_posto), '<span class="ico">⛽</span>', 800, 860, 'pop'),
 ('big_fah', T(i_calib), '<span class="chip">CALIBRA O PNEU? 🛞</span>', 60, 930, ''),
 ('big_fah', T(i_calib)+0.5, '<span class="stamp red">AFASTA</span>', 300, 760, 'stamp'),
 ('big_polo', T(i_pinho), '<span class="pill">🌲 pinho</span>', 60, 620, ''),
 ('big_polo', T(i_pinho)+0.3, '<span class="pill">🍂 tabaco</span>', 770, 650, ''),
 ('big_polo', T(i_pinho)+0.6, '<span class="pill">🟫 couro</span>', 60, 760, ''),
 ('big_polo', T(i_1978), '<span class="badge">1978</span>', 790, 800, 'pop'),
 ('big_polo', T(i_gaveta), '<span class="ico">🗄️🕸️</span>', 40, 900, 'pop'),
 ('big_polo', T(i_vovo), '<span class="ico">👴</span>', 840, 930, 'pop'),
 ('big_polo', T(i_gaveta)+0.4, '<span class="stamp red">AFASTA</span>', 300, 760, 'stamp'),
 ('big_mil', T(i_canela), '<span class="pill">🟤 canela</span>', 60, 640, ''),
 ('big_mil', T(i_canela)+0.3, '<span class="pill">🍭 doce demais</span>', 700, 700, ''),
 ('big_mil', T(i_todo), '<span class="chip">👥 TODO MUNDO JÁ USOU</span>', 60, 930, ''),
 ('big_mil', T(i_ex), '<span class="polaroid">EX 💔</span>', 790, 820, 'pop'),
 ('big_mil', T(i_ex)-0.35, '<span class="stamp red">AFASTA</span>', 300, 760, 'stamp'),
 ('big_isl', T(i_coco), '<span class="pill">🥥 coco</span>', 60, 640, ''),
 ('big_isl', T(i_coco)+0.3, '<span class="pill">🍍 abacaxi</span>', 760, 680, ''),
 ('big_isl', T(i_coco)+0.6, '<span class="pill">🫚 gengibre</span>', 60, 780, ''),
 ('big_isl', T(i_ferias), '<span class="ico">🏖️</span>', 820, 880, 'pop'),
 ('big_isl', T(i_ferias)+0.3, '<span class="stamp amb">ATRAI</span>', 330, 760, 'stamp'),
 ('big_xt', T(i_oud2), '<span class="pill">🪵 oud</span>', 60, 640, ''),
 ('big_xt', T(i_oud2)+0.3, '<span class="pill">✨ âmbar</span>', 780, 680, ''),
 ('big_xt', T(i_lembra), '<span class="chip">LEMBRA BLEU DE CHANEL</span>', 150, 930, ''),
 ('big_xt', T(i_trab), '<span class="ico">💼</span>', 60, 800, 'pop'),
 ('big_xt', T(i_noite), '<span class="ico">🌙</span>', 860, 800, 'pop'),
 ('big_xt', T(i_trab)+0.2, '<span class="stamp amb">ATRAI</span>', 330, 760, 'stamp'),
 ('big_lion', T(i_hort), '<span class="pill">🌿 hortelã</span>', 60, 640, ''),
 ('big_lion', T(i_mel), '<span class="pill">🍯 mel</span>', 790, 640, ''),
 ('big_lion', T(i_baun), '<span class="pill">🍦 baunilha</span>', 60, 760, ''),
 ('big_lion', T(i_tab), '<span class="pill">🍂 tabaco</span>', 770, 760, ''),
 ('big_lion', T(i_descer), '<span class="chip">🛗 ELA DESCEU NO SEU ANDAR</span>', 110, 930, ''),
 ('big_lion', T(i_descer)+0.3, '<span class="stamp amb">ATRAI</span>', 330, 760, 'stamp'),
]
SFX = [  # (arquivo, t, volume)
 ('whoosh_suave.mp3', 0.15, .45), ('whoosh_rapido.mp3', T(i_contra), .45), ('relogio_tique.mp3', T(i_pode), .25),
 ('ziper_bolsa.mp3', T(i_sabe), .0), ('ding_notificacao.mp3', T(i_entao)-0.25, .4), ('whoosh_suave.mp3', T(i_entao), .4),
 ('pop_leve.mp3', T(i_fah), .55), ('pop_leve.mp3', T(i_posto), .5), ('boing_cartoon.mp3', T(i_calib), .4), ('carimbo.mp3', T(i_calib)+0.5, .6),
 ('pop_leve.mp3', T(i_polo), .55), ('pop_leve.mp3', T(i_1978), .45), ('disco_arranhado.mp3', T(i_gaveta), .35), ('carimbo.mp3', T(i_gaveta)+0.4, .6),
 ('pop_leve.mp3', T(i_mil)-0.15, .55), ('trombone_triste.mp3', T(i_ex), .45), ('carimbo.mp3', T(i_ex)-0.35, .6),
 ('suspense_dun.mp3', T(i_agora)+0.2, .5), ('plim_brilho_magico.mp3', T(i_isl), .5), ('agua_ondas.mp3', T(i_ferias), .25), ('carimbo.mp3', T(i_ferias)+0.3, .55),
 ('plim_brilho_magico.mp3', T(i_xt), .5), ('ding_acerto.mp3', T(i_lembra), .4), ('carimbo.mp3', T(i_trab)+0.2, .55),
 ('riser_curto.mp3', T(i_mas), .5), ('impact_grave.mp3', T(i_lion), .6), ('shine_brilho.mp3', T(i_lion)+0.1, .45),
 ('carimbo.mp3', T(i_descer)+0.3, .6), ('whoosh_suave.mp3', T(i_comp), .4), ('ding_notificacao.mp3', T(i_segue), .45),
]
SFX = [s for s in SFX if s[2] > 0]
# carimbos: sempre 1,5 s antes do fim da própria cena (a fala acelerada é curta)
for j,e in enumerate(EXTRA):
    if 'stamp' in e[2]:
        ts=round(max(CENA[e[0]][0]+1.0, CENA[e[0]][1]-1.5),3); EXTRA[j]=(e[0],ts)+e[2:]
        SFX=[s for s in SFX if not (s[0]=='carimbo.mp3' and CENA[e[0]][0]<=s[1]<CENA[e[0]][1])]+[('carimbo.mp3',ts,.6)]


# ---------- legenda: grupos de até 20 caracteres ----------
NOMES = {'fahrenheit','dior','polo','verde','ralph','lauren','1','million','island','khadlaj','xtreme','oud','assala','bleu','chanel','lionheart','armaf','valota','parfum'}
grupos = []; cur = []
for i, w in enumerate(W):
    txt = w['word']
    cand = ' '.join([W[j]['word'] for j in cur] + [txt])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])):
        grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = []
for g in grupos:
    pal = []
    for j in g:
        raw = re.sub(r'[.,?!]', '', W[j]['word']).upper()
        nome = n(W[j]['word']) in NOMES and not (n(W[j]['word']) in ('polo','verde','1') and abs(j - i_polo) > 3 and abs(j - i_mil) > 2)
        pal.append({'w': raw, 'h': bool(nome), 't': T(j)})
    LEG.append({'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3), 'p': pal})

DADOS = dict(END=END, FALA_FIM=FALA_FIM, CENA=CENA, REVELA=REVELA, F=F, EXTRA=EXTRA, LEG=LEG, VEL=VEL)
html = open(os.path.join(os.path.dirname(__file__), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(DADOS, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]}, open(P + 'audio_map.json', 'w'), indent=1)
print('END', END, 'fala', FALA_FIM, 'legendas', len(LEG), 'sfx', len(SFX))

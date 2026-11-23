# v74 · LIQUID BRUN · NÃO COMPRE ANTES DE SABER ESSAS 5 COISAS · AVATAR AV1 (capa A = foto dela)
# Uso: python3 gen.py   (na pasta do vídeo) → index.html + audio_map.json
import json, re, os, unicodedata
P = os.path.dirname(os.path.abspath(__file__)) + '/'
VEL = 1.75
W = json.load(open(P + 'palavras_1x.json'))['palavras']
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def T(i): return round(W[i]['start'] / VEL, 3)
def TE(i): return round(W[i]['end'] / VEL, 3)
FALA_FIM = TE(len(W) - 1)
END = round(FALA_FIM + 1.8, 2)

# âncoras por índice (conferidas pela palavra)
A = dict(cheiro=(28, 'cheiro'), doce=(29, 'doce'), quente=(30, 'quente'), chique=(33, 'chique'), canela=(38, 'canela'),
         flor=(40, 'flor'), baunilha=(47, 'baunilha'), pralina=(54, 'praline'), castanha=(59, 'castanha'), madeira=(63, 'madeira'),
         segunda=(67, 'so'), todo=(79, 'todo'), calor=(84, 'calor'), pesa=(86, 'pesa'), ja=(87, 'ja'), jantar=(89, 'jantar'),
         encontro=(90, 'encontro'), balada=(92, 'balada'), brilha=(96, 'brilha'),
         terceira=(98, 'a'), fixacao=(102, 'fixacao'), dura=(109, 'dura'), pele=(112, 'pele'), chega=(117, 'chega'),
         agora=(123, 'agora'), althair2=(136, 'althair'), lembrasim=(139, 'lembra'), lista=(143, 'lista'), quase=(149, 'quase'),
         tanto=(151, 'tanto'), primos=(156, 'primos'), foto=(162, 'foto'),
         quinta=(165, 'e'), arabe=(174, 'arabe'), falso=(175, 'falso'), porisso=(180, 'por'), loja=(185, 'loja'),
         grupo=(193, 'grupo'), link=(201, 'link'), bio=(203, 'bio'), entao=(204, 'entao'), salva=(205, 'salva'), segue=(212, 'segue'))
TT = {}
for k, (i, w) in A.items():
    assert n(W[i]['word']) == w, f'âncora {k}: {W[i]["word"]} != {w}'
    TT[k] = T(i)

CENA = {
    'capa': (0, TT['cheiro']),
    's1': (TT['cheiro'], TT['segunda']),
    's2': (TT['segunda'], TT['terceira']),
    's3': (TT['terceira'], TT['agora']),
    's4a': (TT['agora'], TT['lista'] - 0.1),
    's4b': (TT['lista'] - 0.1, TT['tanto']),
    's4c': (TT['tanto'], TT['quinta']),
    's5a': (TT['quinta'], TT['porisso']),
    's5b': (TT['porisso'], TT['entao']),
    'cta': (TT['entao'], END + 1),
}
HEAD = [  # (início, fim, nº, título)
    (TT['cheiro'], TT['segunda'], 1, 'O CHEIRO'),
    (TT['segunda'], TT['terceira'], 2, 'NÃO É PRA TODO DIA'),
    (TT['terceira'], TT['agora'], 3, 'A FIXAÇÃO'),
    (TT['agora'], TT['quinta'], 4, 'LEMBRA O ALTHAÏR?'),
    (TT['quinta'], TT['entao'], 5, 'ONDE COMPRAR'),
]

SFX = [  # (arquivo, t, volume)
    ('impact_grave.mp3', 0.05, .45),
    ('whoosh_suave.mp3', TT['cheiro'] - 0.1, .4),
    ('pop_leve.mp3', TT['doce'], .4), ('pop_leve.mp3', TT['quente'], .4), ('pop_leve.mp3', TT['chique'], .4),
    ('pop_leve.mp3', TT['canela'], .5), ('pop_leve.mp3', TT['flor'], .5), ('pop_leve.mp3', TT['baunilha'], .5),
    ('pop_leve.mp3', TT['pralina'], .5), ('pop_leve.mp3', TT['castanha'], .4), ('pop_leve.mp3', TT['madeira'], .45),
    ('whoosh_suave.mp3', TT['segunda'] - 0.1, .4), ('carimbo.mp3', TT['pesa'], .55),
    ('pop_leve.mp3', TT['jantar'], .45), ('pop_leve.mp3', TT['encontro'], .45), ('pop_leve.mp3', TT['balada'], .45),
    ('carimbo.mp3', TT['brilha'], .55), ('shine_brilho.mp3', TT['brilha'] + 0.1, .35),
    ('whoosh_suave.mp3', TT['terceira'] - 0.1, .4), ('relogio_tique.mp3', TT['dura'], .12), ('plim_brilho_magico.mp3', TT['chega'], .45),
    ('whoosh_suave.mp3', TT['agora'] - 0.1, .4), ('carimbo.mp3', TT['lembrasim'], .55), ('ding_acerto.mp3', TT['lembrasim'] + 0.15, .35),
    ('swipe_tela.mp3', TT['lista'] - 0.1, .35), ('flash_camera.mp3', TT['foto'], .5),
    ('whoosh_suave.mp3', TT['quinta'] - 0.1, .4), ('buzzer_erro.mp3', TT['falso'], .3), ('carimbo.mp3', TT['falso'] + 0.05, .5),
    ('ding_acerto.mp3', TT['loja'], .4), ('ding_notificacao.mp3', TT['grupo'], .45), ('click_ui.mp3', TT['link'], .5),
    ('whoosh_suave.mp3', TT['entao'] - 0.1, .4), ('pop_leve.mp3', TT['salva'], .5), ('ding_notificacao.mp3', TT['segue'], .45),
]

# ---------- legenda: grupos de até 20 caracteres, conectivo nunca no fim da linha ----------
NOMES = {'liquid', 'brun', 'althair', 'valota', 'parfum', 'whatsapp'}
CON = {'o', 'a', 'de', 'do', 'da', 'dos', 'no', 'na', 'nas', 'num', 'numa', 'e', 'com', 'um', 'uma', 'que', 'se', 'pra', 'por', 'meu', 'aquele', 'aqueles', 'ou', 'a', 'à', 'tem'}
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])):
        mov = []
        while len(cur) > 1 and n(W[cur[-1]]['word']) in CON and not re.search(r'[.?!,]$', W[cur[-1]]['word']):
            mov.insert(0, cur.pop())
        grupos.append(cur); cur = mov
    cur.append(i)
grupos.append(cur)
LEG = []
for g in grupos:
    pal = [{'w': re.sub(r'[.,?!]', '', W[j]['word']).upper(), 'h': n(W[j]['word']) in NOMES} for j in g]
    LEG.append({'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.4), 'p': pal})

AV = 'gravacao/avatar_175.mp4' if os.path.exists(P + 'gravacao/avatar_175.mp4') else ''
D = dict(END=END, FALA_FIM=FALA_FIM, CENA=CENA, HEAD=HEAD, T=TT, LEG=LEG, AV=AV)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1},
           'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': round(t, 3), 'volume': v} for a, t, v in SFX]},
          open(P + 'audio_map.json', 'w'), indent=1)
print('END', END, 'fala', FALA_FIM, 'legendas', len(LEG), 'sfx', len(SFX), 'avatar', AV or '(placeholder)')
for g in LEG: print(f"{g['t0']:6.2f} {' '.join(p['w'] for p in g['p'])}")

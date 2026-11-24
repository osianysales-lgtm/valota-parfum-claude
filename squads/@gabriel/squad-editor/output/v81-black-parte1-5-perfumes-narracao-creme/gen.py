# v81 · BLACK FRIDAY PARTE 1 · 5 masculinos do histórico · NARRAÇÃO CREME (template.html = molde do v80 com card branco, tema creme/petróleo)
# Copy: squad copy-viral (gancho C "SEXTA É BLACK") · roteiro em copy-viral-perfumes/output/videos/2026-11-24-top10-black-friday-grupo-presente-SQUAD.md
# Uso: python3 gen.py → index.html + audio_map.json   (voz: narracao_175.wav · tempos: palavras_1x.json ÷ 1,75)
import json, re, unicodedata, os
P = os.path.dirname(os.path.abspath(__file__)) + '/'
VEL = 1.75
ADI = 0.10
W = json.load(open(P + 'palavras_1x.json'))['palavras']
W = [dict(word=w['word'], start=w['start'] / VEL, end=w['end'] / VEL) for w in W]
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
NW = [n(w['word']) for w in W]
def ix(frase, depois=0.0):
    f = [n(x) for x in frase.split()]
    for i in range(len(W)):
        if W[i]['start'] >= depois and NW[i:i + len(f)] == f: return i
    raise SystemExit('não achei: ' + frase)
def T(frase, depois=0.0): return round(max(0, W[ix(frase, depois)]['start'] - ADI), 3)

FIM = round(W[-1]['end'], 3); END = round(FIM + 1.4, 3)
S = dict(p1=T('Começando pelo'), p2=T('enquanto o Asad'), p3=T('Já o 9pm'), p4=T('e o Supremacy'), p5=T('E o último'),
         cta=T('Só que Black'), fim=T('E a parte dois'))
K = dict(
 l_nome=T('Liquid'), l_card=T('lembra o Althaïr'), l_baun=T('baunilha'), l_can=T('canela'),
 b_nome=T('Asad Bourbon'), b_card=T('lembra o Most'), b_cac=T('cacau'),
 n_nome=T('9pm'), n_card=T('lembra o Ultra'), n_maca=T('maçã'),
 c_nome=T('Supremacy'), c_card=T('lembra o Absolu'), c_aba=T('abacaxi'), c_quer=T('queridinho'),
 h_nome=T('Hawas'), h_card=T('lembra o Hacivat'), h_parou=T('parou'),
 f_linha=T('presentes pra'), f_cards=T('namorada'), f_rodape=T('próximo vídeo'))
K.update(b_baun=T('baunilha', K['b_cac']), c_falsa=S['cta'] + 0.15, c_grupo=T('grupo'), c_link=T('link'), c_presente=T('presente de fim'), c_slogan=T('original'))

PF = [
 dict(k='l', n=1, nome='LIQUID BRUN', marca='FRENCH AVENUE', img='liquid', bg=['baunilha', 'canela', 'laranja', 'bergamota'], t0=S['p1'], t1=S['p2'], show=K['l_nome'],
      g='althair', gnome='ALTHAÏR', gmarca='PARFUMS DE MARLY', chip='LEMBRA O', tl=K['l_card'],
      notas=[['baunilha', 'BAUNILHA', K['l_baun']], ['canela', 'CANELA', K['l_can']]], pills=[], fm='#D49A4E'),
 dict(k='b', n=2, nome='ASAD BOURBON', marca='LATTAFA', img='asadbourbon', bg=['cacau', 'baunilha', 'lavanda', 'pimenta'], t0=S['p2'], t1=S['p3'], show=K['b_nome'],
      g='mostwanted', gnome='THE MOST WANTED', gmarca='AZZARO', chip='LEMBRA O', tl=K['b_card'],
      notas=[['cacau', 'CACAU', K['b_cac']], ['baunilha', 'BAUNILHA', K['b_baun']]], pills=[], fm='#9C452A'),
 dict(k='n', n=3, nome='9PM', marca='AFNAN', img='9pm', bg=['maca', 'canela', 'lavanda', 'baunilha'], t0=S['p3'], t1=S['p4'], show=K['n_nome'],
      g='ultramale', gnome='ULTRA MALE', gmarca='JEAN PAUL GAULTIER', chip='LEMBRA O', tl=K['n_card'],
      notas=[['maca', 'MAÇÃ', K['n_maca']], ['canela', 'CANELA', K['n_maca'] + 0.22], ['baunilha', 'BAUNILHA', K['n_maca'] + 0.44]], pills=[], fm='#9C452A'),
 dict(k='c', n=4, nome="SUPREMACY COLLECTOR'S", marca='AFNAN', img='supremacy', bg=['abacaxi', 'maca', 'bergamota', 'betula'], t0=S['p4'], t1=S['p5'], show=K['c_nome'],
      g='absoluaventus', gnome='ABSOLU AVENTUS', gmarca='CREED', chip='LEMBRA O', tl=K['c_card'],
      notas=[['abacaxi', 'ABACAXI', K['c_aba']], ['bergamota', 'BERGAMOTA', K['c_aba'] + 0.22]],
      pills=[['O QUERIDINHO MAIS RECENTE 🔥', K['c_quer'], 'ama']], fm='#7FA8A1'),
 dict(k='h', n=5, nome='HAWAS BLACK', marca='RASASI', img='hawas', bg=['bergamota', 'abacaxi', 'toranja'], t0=S['p5'], t1=S['cta'], show=K['h_nome'], rank=S['p5'] + 0.1,
      g='hacivat', gnome='HACIVAT', gmarca='NISHANE', chip='LEMBRA O', tl=K['h_card'], notas=[],
      pills=[['ME PARARAM SÓ PRA PERGUNTAR O NOME 😳', K['h_parou'], 'ama']], fm='#0F2E33'),
]
CAPA = dict(html='<div class="cparte">PARTE 1</div><div class="c1">SEXTA É</div><div class="c2">BLACK 🖤</div>'
                 '<div class="cpil">anota esses 5 antes 👇</div>', q=['', '', '', '', ''])
SELOS = [['🖤 BLACK FRIDAY · PARTE 1', S['p1'], S['cta']]]
CTA = dict(presente='🎁 PRESENTE DE FIM DE ANO GARANTIDO')
FIM_PARTE = dict(chip='<span class="tag pim" style="font-size:34px">⏭️ NO PRÓXIMO VÍDEO</span>', big='PARTE 2',
                 linha='PRESENTES PRA NAMORADA E ESPOSA 🎁', cards=[[None, '🎀'], [None, '🎀'], [None, '🎀']], rodape='A BLACK CONTINUA 👀')
BG_CTA = ['baunilha', 'canela', 'maca', 'cacau', 'bergamota', 'abacaxi']
AR = json.load(open(P + 'frascos/ar.json'))

# legenda (obrigatória do começo ao fim): grupos curtos, nomes de perfume/marca destacados
NOMES = {'liquid', 'brun', 'althair', 'asad', 'bourbon', 'most', 'wanted', 'azzaro', '9pm', 'ultra', 'male', 'supremacy', 'collectors', 'absolu', 'aventus',
         'hawas', 'black', 'hacivat', 'friday', 'whatsapp'}
def nome(i):
    w = NW[i]
    if w == 'de': return 0 < i and NW[i - 1] == 'club'
    return w in NOMES
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    meio_nome = cur and nome(i) and nome(cur[-1]) and len(cand) <= 30
    comeca_nome = cur and nome(i) and not nome(cur[-1]) and len(cand) > 16
    if cur and not meio_nome and (comeca_nome or len(cand) > 24 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'por', 'que', 'em', 'sem', 'pro', 'nao', 'pelo', 'tipo', 'as', 'se', 'ja', 'mas', 'so', 'os'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and NW[grupos[k][-1]] in CON and not nome(grupos[k][-1]) and not re.search(r'[.?!,]$', W[grupos[k][-1]]['word']):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': nome(j)} for j in g]} for g in grupos]
LEG[-1]['t1'] = END + 1   # última frase fica até o fim

# efeitos (sem música — ela põe no Instagram)
FX = [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3)]
for k in ['p1', 'p2', 'p3', 'p4', 'p5', 'cta', 'fim']: FX.append((S[k], 'whoosh_rapido', .28))
for k in ['l_nome', 'b_nome', 'n_nome', 'c_nome', 'h_nome']: FX.append((K[k] + .05, 'impact_grave', .2))
for k in ['l_card', 'b_card', 'n_card', 'c_card', 'h_card']: FX.append((K[k], 'shine_brilho', .28))
for k in ['l_baun', 'l_can', 'b_cac', 'b_baun', 'n_maca', 'c_aba']: FX.append((K[k], 'pop_leve', .32))
FX += [(S['p5'], 'suspense_dun', .28), (K['h_parou'], 'ding_acerto', .3), (K['c_falsa'], 'carimbo', .4), (K['c_grupo'], 'ding_notificacao', .35),
       (K['c_link'], 'click_ui', .4), (K['c_presente'], 'caixa_registradora', .25), (S['fim'] + .1, 'plim_brilho_magico', .32)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='petroleo', S=S, K=K, FIM=FIM, END=END, LEG=LEG, PF=PF, CAPA=CAPA, SELOS=SELOS, CTA=CTA, FIM_PARTE=FIM_PARTE, BG_CTA=BG_CTA, AR=AR)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})

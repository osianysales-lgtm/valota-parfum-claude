# v88 · OS 5 PERFUMES QUE MAIS ATRAEM AS MULHERES · OS ORIGINAIS (grife) · NARRAÇÃO CREME · molde v81/v82 (card branco)
# Continuação do v87 (pesquisa 3.743 mulheres: madeira, ervas/lavanda, especiarias quentes + estudo 2022 da baunilha).
# O v89 tem o MESMO título com os 5 árabes que lembram estes.
# Uso: python3 gen.py → index.html + audio_map.json
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
S = dict(p1=T('Começando pelo'), p2=T('Já o Layton'), p3=T('E o Tobacco'), p4=T('Agora, o Grand'), p5=T('E o último'), fim=T('Só que eu sei'))
K = dict(f_linha=T('árabes que lembram'), f_cards=T('cada um deles'), f_rodape=T('bem menos'), f_rodape2=T('segue'))

PF = [
 dict(k='d', n=1, nome='DIOR HOMME INTENSE', marca='DIOR', img='dhi', bg=['lavanda', 'iris', 'madeira'], t0=S['p1'], t1=S['p2'], show=T('Dior Homme'),
      notas=[['lavanda', 'LAVANDA', T('lavanda')], ['iris', 'ÍRIS', T('íris')], ['madeira', 'MADEIRA', T('madeira')]],
      pills=[['😌 O CHEIRO DE CONFORTO', T('conforto'), 'ama']], fm='#7FA8A1'),
 dict(k='l', n=2, nome='LAYTON', marca='PARFUMS DE MARLY', img='layton', bg=['maca', 'lavanda', 'baunilha', 'cardamomo'], t0=S['p2'], t1=S['p3'], show=T('Layton'),
      notas=[['maca', 'MAÇÃ', T('maçã')], ['lavanda', 'LAVANDA', T('lavanda', S['p2'])], ['baunilha', 'BAUNILHA', T('baunilha', S['p2'])], ['cardamomo', 'CARDAMOMO', T('cardamomo', S['p2'])]],
      pills=[['🙋 FAZEM VOCÊ PARAR PRA PERGUNTAR O NOME', T('parar você'), 'ama']], fm='#7FA8A1'),
 dict(k='t', n=3, nome='TOBACCO VANILLE', marca='TOM FORD', img='tobaccovanille', bg=['tabaco', 'baunilha', 'canela'], t0=S['p3'], t1=S['p4'], show=T('Tobacco Vanille'),
      notas=[['tabaco', 'TABACO', T('tabaco')], ['baunilha', 'BAUNILHA', T('baunilha', S['p3'])], ['canela', 'ESPECIARIAS', T('especiarias')]],
      pills=[['🔥 CHEIRO DE LAREIRA · PEDE MÃO LEVE', T('lareira'), 'ama']], fm='#9C452A'),
 dict(k='g', n=4, nome='GRAND SOIR', marca='MAISON FRANCIS KURKDJIAN', img='grandsoir', bg=['ambar', 'baunilha', 'caramelo'], t0=S['p4'], t1=S['p5'], show=T('Grand Soir'),
      notas=[['ambar', 'ÂMBAR', T('âmbar')], ['baunilha', 'BAUNILHA', T('baunilha', S['p4'])]],
      pills=[['💭 ELA LEMBRA DE VOCÊ NO DIA SEGUINTE', T('lembrar'), 'ama']], fm='#D49A4E'),
 dict(k='n', n=5, nome='NOIR EXTREME', marca='TOM FORD', img='noirextreme', bg=['sorvete', 'baunilha', 'cardamomo', 'sandalo'], t0=S['p5'], t1=S['fim'], show=T('Noir Extreme'), rank=S['p5'] + 0.1,
      notas=[['sorvete', 'BAUNILHA CREMOSA', T('cremosa', S['p5'])], ['cardamomo', 'CARDAMOMO', T('cardamomo', S['p5'])], ['sandalo', 'SÂNDALO', T('sândalo')]],
      pills=[['🏆 O DOCE NA MEDIDA DO ESTUDO', T('topo'), 'ama']], fm='#D49A4E'),
]
CAPA = dict(html='<div class="cparte">OS ORIGINAIS 💎</div><div class="c1" style="font-size:84px">OS 5 PERFUMES QUE</div><div class="c2" style="font-size:116px">MAIS ATRAEM</div>'
                 '<div class="c1" style="font-size:96px">AS MULHERES</div><div class="cpil">segundo a pesquisa 🔬</div>', q=['', '', '', '', ''])
SELOS = [['💘 OS 5 QUE MAIS ATRAEM AS MULHERES', S['p1'], END + 1]]
CTA = None
FIM_PARTE = dict(chip='<span class="tag pim" style="font-size:34px">⏭️ NO PRÓXIMO VÍDEO</span>', big='<span style="font-size:100px">VERSÃO ÁRABE</span>',
                 linha='OS QUE LEMBRAM CADA UM 💸', cards=[[None, '💸']] * 5, rodape='PAGANDO BEM MENOS 👀', rodape2='👉 SEGUE A @VALOTAPARFUM')
BG_FIM = ['baunilha', 'lavanda', 'tabaco', 'ambar', 'sorvete', 'maca']
AR = json.load(open(P + 'frascos/ar.json'))

# legenda (obrigatória do começo ao fim)
NOMES = {'dior', 'homme', 'intense', 'layton', 'parfums', 'marly', 'tobacco', 'vanille', 'tom', 'ford', 'grand', 'soir', 'maison', 'francis', 'kurkdjian', 'noir', 'extreme',
         'arabes', 'valota', 'parfum'}
def nome(i):
    w = NW[i]
    if w == 'de': return 0 < i and NW[i - 1] == 'parfums'
    return w in NOMES
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    meio_nome = cur and nome(i) and nome(cur[-1]) and len(cand) <= 26
    comeca_nome = cur and nome(i) and not nome(cur[-1]) and len(cand) > 14
    if cur and not meio_nome and (comeca_nome or len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'uma', 'por', 'que', 'em', 'sem', 'pro', 'nao', 'pelo', 'tipo', 'as', 'os', 'se', 'ja', 'mas', 'so', 'num', 'ao'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and NW[grupos[k][-1]] in CON and not nome(grupos[k][-1]) and not re.search(r'[.?!,]$', W[grupos[k][-1]]['word']):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': nome(j)} for j in g]} for g in grupos]
LEG[-1]['t1'] = END + 1
for g in LEG: assert len(' '.join(x['w'] for x in g['p'])) <= 30, g

# efeitos (sem música)
FX = [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3)]
for k in ['p1', 'p2', 'p3', 'p4', 'p5', 'fim']: FX.append((S[k], 'whoosh_rapido', .28))
for p in PF:
    FX.append((p['show'] + .05, 'impact_grave', .2))
    for _, _, t in p['notas']: FX.append((t, 'pop_leve', .3))
    for _, t, _ in p['pills']: FX.append((t, 'ding_acerto', .25))
FX += [(S['p5'], 'suspense_dun', .28), (K['f_cards'], 'pop_leve', .3), (K['f_rodape'], 'caixa_registradora', .22), (K['f_rodape2'], 'click_ui', .4), (S['fim'] + .1, 'plim_brilho_magico', .3)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='creme', S=S, K=K, FIM=FIM, END=END, LEG=LEG, PF=PF, CAPA=CAPA, SELOS=SELOS, CTA=CTA, FIM_PARTE=FIM_PARTE, BG_FIM=BG_FIM, AR=AR)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})

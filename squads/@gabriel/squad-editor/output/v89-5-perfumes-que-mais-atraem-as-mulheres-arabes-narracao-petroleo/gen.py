# v89 · OS 5 PERFUMES QUE MAIS ATRAEM AS MULHERES · VERSÃO ÁRABE · NARRAÇÃO PETRÓLEO · molde v81/v82 (card branco + LEMBRA O)
# Mesmo título do v88 (os originais). Árabe à esquerda + card da grife à direita.
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
S = dict(p1=T('Começando pelo'), p2=T('Já o Détour'), p3=T('E o Tobacco'), p4=T('Agora, o Eternal'), p5=T('E o último'), fim=T('Então salva'))
K = dict(f_linha=T('pra não esquecer'), f_cards=T('se você quer'), f_rodape=T('preço de grife'), f_rodape2=T('segue'))
L = 'LEMBRA O'
PF = [
 dict(k='h', n=1, nome='HIS CONFESSION', marca='LATTAFA', img='hisconf', bg=['lavanda', 'canela', 'baunilha', 'madeira'], t0=S['p1'], t1=S['p2'], show=T('His Confession'),
      g='dhi', gnome='DIOR HOMME INTENSE', gmarca='DIOR', chip=L, tl=T('lembra o Dior'),
      notas=[['lavanda', 'LAVANDA', T('lavanda')], ['canela', 'CANELA', T('canela')], ['baunilha', 'BAUNILHA', T('baunilha', S['p1'])], ['madeira', 'MADEIRA', T('madeira', S['p1'])]],
      pills=[['🍬 SÓ QUE MAIS DOCINHO', T('docinho'), 'ama']], fm='#7FA8A1'),
 dict(k='d', n=2, nome='DÉTOUR NOIR', marca='AL HARAMAIN', img='detour', bg=['maca', 'lavanda', 'baunilha', 'sandalo'], t0=S['p2'], t1=S['p3'], show=T('Détour Noir'),
      g='layton', gnome='LAYTON', gmarca='PARFUMS DE MARLY', chip=L, tl=T('lembra o Layton'),
      notas=[['maca', 'MAÇÃ', T('maçã')], ['lavanda', 'LAVANDA', T('lavanda', S['p2'])], ['baunilha', 'BAUNILHA', T('baunilha', S['p2'])], ['sandalo', 'SÂNDALO', T('sândalo', S['p2'])]],
      pills=[['👀 CHAMA ATENÇÃO SEM EXAGERO', T('chamar atenção'), 'ama']], fm='#7FA8A1'),
 dict(k='t', n=3, nome='TOBACCO TOUCH', marca='MAISON ALHAMBRA', img='tobaccotouch', bg=['tabaco', 'baunilha', 'canela'], t0=S['p3'], t1=S['p4'], show=T('Tobacco Touch'),
      g='tobaccovanille', gnome='TOBACCO VANILLE', gmarca='TOM FORD', chip=L, tl=T('lembra o Tobacco'),
      notas=[['tabaco', 'TABACO', T('tabaco')], ['baunilha', 'BAUNILHA', T('baunilha', S['p3'])], ['canela', 'ESPECIARIA', T('especiaria')]],
      pills=[['⚠️ PEDE MÃO LEVE', T('mão leve'), 'pim']], fm='#9C452A'),
 dict(k='e', n=4, nome='ETERNAL OUD', marca='LATTAFA', img='eternaloud', bg=['ambar', 'baunilha', 'madeira'], t0=S['p4'], t1=S['p5'], show=T('Eternal Oud'),
      g='grandsoir', gnome='GRAND SOIR', gmarca='M. F. KURKDJIAN', chip=L, tl=T('lembra o Grand'),
      notas=[['ambar', 'ÂMBAR', T('âmbar')], ['baunilha', 'BAUNILHA', T('baunilha', S['p4'])]],
      pills=[['🤫 O OUD QUASE NÃO APARECE', T('suave'), 'ama']], fm='#D49A4E'),
 dict(k='o', n=5, nome='ODYSSEY HOMME', marca='ARMAF', img='odyssey', bg=['sorvete', 'baunilha', 'cardamomo', 'sandalo'], t0=S['p5'], t1=S['fim'], show=T('Odyssey Homme'), rank=S['p5'] + 0.1,
      g='noirextreme', gnome='NOIR EXTREME', gmarca='TOM FORD', chip=L, tl=T('lembra o Noir'),
      notas=[['sorvete', 'BAUNILHA CREMOSA', T('cremosa', S['p5'])], ['cardamomo', 'CARDAMOMO', T('cardamomo', S['p5'])], ['sandalo', 'SÂNDALO', T('sândalo', S['p5'])]],
      pills=[['😂 O IRMÃO MANDARIN SKY FICOU COM O HYPE', T('irmão'), 'ama']], fm='#D49A4E'),
]
CAPA = dict(html='<div class="cparte">VERSÃO ÁRABE 💸</div><div class="c1" style="font-size:84px">OS 5 PERFUMES QUE</div><div class="c2" style="font-size:116px">MAIS ATRAEM</div>'
                 '<div class="c1" style="font-size:96px">AS MULHERES</div><div class="cpil">os árabes que lembram 👀</div>', q=['', '', '', '', ''])
SELOS = [['💘 OS 5 QUE MAIS ATRAEM AS MULHERES · ÁRABES', S['p1'], END + 1]]
CTA = None
FIM_PARTE = dict(chip='<span class="tag pim" style="font-size:34px">📌 SALVA PRA NÃO ESQUECER</span>', big='<span style="font-size:110px">OS 5 ÁRABES</span>',
                 linha='QUE LEMBRAM OS ORIGINAIS 💘', cards=[['hisconf', None], ['detour', None], ['tobaccotouch', None], ['eternaloud', None], ['odyssey', None]],
                 rodape='CHEIROSO SEM PAGAR PREÇO DE GRIFE 💸', rodape2='👉 SEGUE A @VALOTAPARFUM')
BG_FIM = ['baunilha', 'lavanda', 'tabaco', 'ambar', 'sorvete', 'maca']
AR = json.load(open(P + 'frascos/ar.json'))

# legenda (obrigatória do começo ao fim)
NOMES = {'dior', 'homme', 'intense', 'layton', 'parfums', 'marly', 'tobacco', 'vanille', 'touch', 'tom', 'ford', 'grand', 'soir', 'maison', 'alhambra', 'noir', 'extreme',
         'his', 'confession', 'lattafa', 'detour', 'al', 'haramain', 'eternal', 'oud', 'odyssey', 'armaf', 'mandarin', 'sky', 'valota', 'parfum'}
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
    FX.append((p['show'] + .05, 'impact_grave', .2)); FX.append((p['tl'], 'shine_brilho', .28))
    for _, _, t in p['notas']: FX.append((t, 'pop_leve', .3))
    for _, t, _ in p['pills']: FX.append((t, 'ding_acerto', .25))
FX += [(S['p5'], 'suspense_dun', .28), (K['f_cards'], 'pop_leve', .3), (K['f_rodape'], 'caixa_registradora', .22), (K['f_rodape2'], 'click_ui', .4), (S['fim'] + .1, 'plim_brilho_magico', .3)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='petroleo', S=S, K=K, FIM=FIM, END=END, LEG=LEG, PF=PF, CAPA=CAPA, SELOS=SELOS, CTA=CTA, FIM_PARTE=FIM_PARTE, BG_FIM=BG_FIM, AR=AR)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})

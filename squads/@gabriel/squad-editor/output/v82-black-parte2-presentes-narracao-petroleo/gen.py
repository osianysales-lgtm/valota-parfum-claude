# v82 · BLACK FRIDAY PARTE 2 · presentes (3 pra ela + 2 pra ele) · NARRAÇÃO PETRÓLEO (template.html = molde do v80 com card branco, tema creme/petróleo)
# Copy: squad copy-viral (gancho B "O PRESENTE DE NATAL SE COMPRA NA BLACK") · roteiro em copy-viral-perfumes/output/videos/2026-11-24-top10-black-friday-grupo-presente-SQUAD.md
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
S = dict(p1=T('Começando por ela'), p2=T('enquanto o Yara'), p3=T('E o Delilah'), p4=T('Já o Club'), p5=T('Agora pro namorado'),
         cta=T('Só que na Black'), fim=T('E a parte um'))
K = dict(
 w_nome=T('Club de Nuit Woman'), w_card=T('lembra o Coco'), w_mad=T('Mademoiselle'),
 y_nome=T('Yara'), y_crem=T('cremoso'), y_card=T('lembra o Pink'),
 d_nome=T('Delilah'), d_card=T('lembra o Delina'), d_rosa=T('rosa'), d_lic=T('lichia'), d_caro=T('custa'),
 m_nome=T('Club de Nuit Maleka'), m_card=T('lembra o Very'), m_pral=T('praliné'),
 v_nome=T('Vulcan'), v_card=T('lembra o God'), v_manga=T('manga'), v_gen=T('gengibre'),
 c_grupo=T('grupo'), c_link=T('link'), c_slogan=T('original'), c_presente=T('aproveita'),
 f_linha=T('masculinos'), f_cards=T('masculinos') + 0.15, f_rodape=T('perfil'))
K.update(m_lic=T('lichia', K['m_nome']), c_falsa=S['cta'] + 0.15)

PF = [
 dict(k='w', n=1, nome='CLUB DE NUIT WOMAN', marca='ARMAF', img='cdnwoman', bg=['laranja', 'rosa', 'lichia', 'baunilha'], t0=S['p1'], t1=S['p2'], show=K['w_nome'],
      g='coco', gnome='COCO MADEMOISELLE', gmarca='CHANEL', chip='LEMBRA O', tl=K['w_card'],
      notas=[['laranja', 'LARANJA', K['w_mad']], ['rosa', 'ROSA', K['w_mad'] + 0.22], ['baunilha', 'BAUNILHA', K['w_mad'] + 0.44]], pills=[], fm='#C98A8A'),
 dict(k='y', n=2, nome='YARA', marca='LATTAFA', img='yara', bg=['orquidea', 'laranja', 'baunilha'], t0=S['p2'], t1=S['p3'], show=K['y_nome'],
      g='pinksugar', gnome='PINK SUGAR', gmarca='AQUOLINA', chip='LEMBRA O', tl=K['y_card'],
      notas=[['orquidea', 'ORQUÍDEA', K['y_nome'] + 0.3], ['baunilha', 'BAUNILHA', K['y_nome'] + 0.5]],
      pills=[['CREMOSO E FOFINHO 🧸', K['y_crem'], 'ama']], fm='#E8B4C0'),
 dict(k='d', n=3, nome='DELILAH', marca='MAISON ALHAMBRA', img='delilah', bg=['rosa', 'lichia', 'bergamota', 'baunilha'], t0=S['p3'], t1=S['p4'], show=K['d_nome'],
      g='delina', gnome='DELINA', gmarca='PARFUMS DE MARLY', chip='LEMBRA O', tl=K['d_card'],
      notas=[['rosa', 'ROSA', K['d_rosa']], ['lichia', 'LICHIA', K['d_lic']]],
      pills=[['O NICHO CUSTA BEM MAIS CARO 💸', K['d_caro'], 'ama']], fm='#C98A8A'),
 dict(k='m', n=4, nome='CLUB DE NUIT MALEKA', marca='ARMAF', img='maleka', bg=['lichia', 'caramelo', 'pimenta', 'baunilha'], t0=S['p4'], t1=S['p5'], show=K['m_nome'],
      g='verygoodgirl', gnome='VERY GOOD GIRL', gmarca='CAROLINA HERRERA', chip='LEMBRA O', tl=K['m_card'],
      notas=[['lichia', 'LICHIA', K['m_lic']], ['caramelo', 'PRALINÉ', K['m_pral']]], pills=[], fm='#9C452A'),
 dict(k='v', n=5, nome='VULCAN FEU', marca='FRENCH AVENUE', img='vulcan', bg=['manga', 'gengibre', 'laranja'], t0=S['p5'], t1=S['cta'], show=K['v_nome'], rank=S['p5'] + 0.1,
      g='godoffire', gnome='GOD OF FIRE', gmarca='SHL 777', chip='LEMBRA O', tl=K['v_card'],
      notas=[['manga', 'MANGA', K['v_manga']], ['gengibre', 'GENGIBRE', K['v_gen']]], pills=[], fm='#E0A040'),
]
CAPA = dict(html='<div class="cparte">PARTE 2</div><div class="c1">O PRESENTE</div><div class="c2">DE NATAL</div>'
                 '<div class="cpil">se compra na Black 🎁</div>', q=['🎀', '🎀', '🎀', '🎀', '🎀'])
SELOS = [['🎁 PARTE 2 · PRA ELA', S['p1'], S['p5']], ['🎁 PARTE 2 · PRA ELE', S['p5'], S['cta']]]
CTA = dict(presente='🎁 PRESENTE DA FAMÍLIA GARANTIDO')
FIM_PARTE = dict(chip='<span class="tag pim" style="font-size:34px">PERDEU A PARTE 1?</span>', big='PARTE 1',
                 linha='OS 5 MASCULINOS DA BLACK 🖤', cards=[['liquid', ''], ['asadbourbon', ''], ['9pm', ''], ['supremacy', ''], ['hawas', '']], rodape='TÁ NO MEU PERFIL 👆')
EXTRAS = [['<span class="tag ama" style="font-size:40px;padding:20px 42px 16px">🎁 PRO NAMORADO, MARIDO OU PAI</span>', 600, T('namorado'), K['v_nome'] + 0.05]]
BG_CTA = ['rosa', 'lichia', 'baunilha', 'manga', 'canela', 'laranja']
AR = json.load(open(P + 'frascos/ar.json'))

# legenda (obrigatória do começo ao fim): grupos curtos, nomes de perfume/marca destacados
NOMES = {'club', 'nuit', 'woman', 'coco', 'mademoiselle', 'chanel', 'yara', 'pink', 'sugar', 'delilah', 'delina', 'maleka', 'very', 'good', 'girl',
         'carolina', 'herrera', 'vulcan', 'feu', 'god', 'of', 'fire', 'black', 'friday', 'whatsapp'}
def nome(i):
    w = NW[i]
    if w == 'de': return 0 < i and NW[i - 1] == 'club'
    if w == 'of': return 0 < i and NW[i - 1] == 'god'
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
for k in ['w_nome', 'y_nome', 'd_nome', 'm_nome', 'v_nome']: FX.append((K[k] + .05, 'impact_grave', .2))
for k in ['w_card', 'y_card', 'd_card', 'm_card', 'v_card']: FX.append((K[k], 'shine_brilho', .28))
for k in ['w_mad', 'd_rosa', 'd_lic', 'm_lic', 'm_pral', 'v_manga', 'v_gen']: FX.append((K[k], 'pop_leve', .32))
FX += [(K['y_crem'], 'ding_acerto', .3), (K['d_caro'], 'caixa_registradora', .25), (K['c_falsa'], 'carimbo', .4), (K['c_grupo'], 'ding_notificacao', .35),
       (K['c_link'], 'click_ui', .4), (K['c_presente'], 'plim_brilho_magico', .28), (S['fim'] + .1, 'plim_brilho_magico', .32)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='creme', S=S, K=K, FIM=FIM, END=END, LEG=LEG, PF=PF, CAPA=CAPA, SELOS=SELOS, CTA=CTA, FIM_PARTE=FIM_PARTE, BG_CTA=BG_CTA, AR=AR, EXTRAS=EXTRAS)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})

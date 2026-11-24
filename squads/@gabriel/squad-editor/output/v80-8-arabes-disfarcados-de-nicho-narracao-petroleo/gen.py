# v80 · 8 ÁRABES DISFARÇADOS DE NICHO · NARRAÇÃO PETRÓLEO (molde guia-carrossel-petroleo-escuro, v67)
# Ref.: reel Be Parfums Df4dHNfhuce (talking head 2min51) → versão C da squad copy-viral (cômica, ~44 s)
# Uso: python3 gen.py → index.html + audio_map.json   (voz: narracao_175.wav · tempos: palavras_1x.json ÷ 1,75)
import json, re, unicodedata, os
P = os.path.dirname(os.path.abspath(__file__)) + '/'
VEL = 1.75
ADI = 0.10   # os tempos do ElevenLabs chegam um pouco atrasados: elementos entram 0,1 s antes da palavra
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

FIM = round(W[-1]['end'], 3); END = round(FIM + 1.6, 3)
S = dict(p1=T('Começando pelo'), p2=T('Já o Elliur'), p3=T('E o Karus'), p4=T('Depois o Gris'), p5=T('Só que aqui'),
         p6=T('Já o Vulcan'), p7=T('E o Maahir'), p8=T('Mas o mestre'), cta=T('Salva esse'))
p = S
K = dict(
 h_ultimo=T('último'), h_nariz=T('nariz treinado'),
 m_nome=T('Muharib'), m_card=T('disfarçado'), m_mel=T('mel'), m_tab=T('tabaco'), m_herd=T('herdeiro'),
 e_nome=T('Elliur'), e_card=T('finge'), e_hort=T('hortelã'), e_drink=T('drink'),
 k_nome=T('Karus'), k_card=T('se infiltra'), k_limp=T('limpinho'), k_orla=T('orla'),
 g_nome=T('Gris'), g_card=T('treinou'), g_him=T('Himalaya'), g_chefe=T('chefe'),
 o_ousado=T('ousado'), b_nome=T('Blind'), b_card=T('imita'), b_conh=T('conhaque'), b_festa=T('festa', p['p5']),
 v_nome=T('Vulcan'), v_card=T('se passa pelo'), v_manga=T('manga', p['p6']), v_suco=T('suco'),
 h_nome=T('Maahir'), h_card=T('faz o papel'), h_menta=T('menta'), h_lim=T('limão', p['p7']), h_banho=T('banho', p['p7']),
 l_mestre=T('mestre'), l_nome=T('Liquid'), l_card=T('lembra', p['p8']), l_baun=T('baunilha', p['p8']), l_desc=T('desconfiar'), l_sorri=T('sorri'),
 salva=T('Salva esse'), quer=T('Quer ficar'), segue=T('Segue a Valota'), arroba=T('Parfum pra mais'))

# legenda (obrigatória do começo ao fim): grupos curtos, nomes de perfume/marca em amarelo
NOMES = {'muharib', 'naxos', 'xerjoff', 'elliur', 'pacific', 'chill', 'louis', 'vuitton', 'karus', 'gold', 'bal', 'dafrique',
         'byredo', 'gris', 'himalaya', 'creed', 'blind', 'ecstasy', 'drunk', 'lovers', 'vulcan', 'feu', 'god', 'of', 'fire',
         'maahir', 'honor', 'torino', '21', 'liquid', 'brun', 'althair', 'parfums', 'marly', 'valota', 'parfum'}
def nome(i):
    w = NW[i]
    if w == 'de': return 0 < i < len(NW) - 1 and NW[i - 1] == 'parfums'
    if w == 'of': return i > 0 and NW[i - 1] == 'god'
    if w == 'bal': return i < len(NW) - 1 and NW[i + 1] == 'dafrique'
    return w in NOMES
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    meio_nome = cur and nome(i) and nome(cur[-1]) and len(cand) <= 30
    comeca_nome = cur and nome(i) and not nome(cur[-1]) and len(cand) > 16
    if cur and not meio_nome and (comeca_nome or len(cand) > 24 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'por', 'que', 'em', 'sem', 'pro', 'nao', 'pelo', 'tipo', 'as', 'se', 'ja', 'mas', 'so'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and NW[grupos[k][-1]] in CON and not nome(grupos[k][-1]) and not re.search(r'[.?!,]$', W[grupos[k][-1]]['word']):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': nome(j)} for j in g]} for g in grupos]

# efeitos (sem música — ela põe no Instagram)
FX = [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3), (K['h_ultimo'], 'suspense_dun', .28), (K['h_nariz'] + .1, 'lupa_whoosh', .3)]
for k in ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'cta']: FX.append((S[k], 'whoosh_rapido', .28))
for k in ['m_nome', 'e_nome', 'k_nome', 'g_nome', 'b_nome', 'v_nome', 'h_nome', 'l_nome']: FX.append((K[k] + .05, 'impact_grave', .2))
for k in ['m_card', 'e_card', 'k_card', 'g_card', 'b_card', 'v_card', 'h_card', 'l_card']: FX.append((K[k], 'shine_brilho', .28))
for k in ['m_mel', 'm_tab', 'e_hort', 'k_limp', 'b_conh', 'v_manga', 'h_menta', 'h_lim', 'l_baun']: FX.append((K[k], 'pop_leve', .32))
FX += [(K['g_him'] + .4, 'pop_leve', .3), (K['m_herd'], 'caixa_registradora', .25), (K['e_drink'], 'vidro_tilintar', .3),
       (K['k_orla'], 'passo_squish', .25), (K['g_chefe'], 'martelo_juiz', .28), (K['o_ousado'], 'carimbo', .4),
       (K['b_festa'], 'vidro_tilintar', .3), (K['v_suco'], 'caixa_registradora', .25), (K['h_banho'], 'agua_splash', .2),
       (K['l_mestre'], 'carimbo', .4), (K['l_nome'] + .15, 'plim_brilho_magico', .32), (K['l_sorri'], 'ding_acerto', .3),
       (K['salva'], 'ding_notificacao', .35)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(S=S, K=K, FIM=FIM, END=END, LEG=LEG)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
for k, v in {**S, **K}.items(): print(f'  {k:10s} {v}')

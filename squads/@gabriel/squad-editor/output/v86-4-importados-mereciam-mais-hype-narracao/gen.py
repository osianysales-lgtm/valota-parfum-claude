# v86 · 4 PERFUMES IMPORTADOS QUE MERECIAM MAIS HYPE · NARRAÇÃO CREME (molde v82: card branco, notas no fundo)
# Ref: @lucasleitefrag instagram.com/reels/Dfvcm6xtKpQ · último trocado (Bleu Noir → Acqua di Giò Parfum)
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
S = dict(p1=T('Sabe o Le Male'), p2=T('Já o segundo'), p3=T('Agora o terceiro'), p4=T('E pra fechar'), fim=T('E aí você concorda'))
K = dict(
 a_nome=T('Armani Code Parfum'), a_fav=T('favoritos'),
 c_card=T('Le Male'), c_iris=T('íris'), c_baun=T('baunilha'), c_fix=T('fixação'),
 g_nome=T('Gentleman'), g_cafe=T('café'), g_baun=T('baunilha', S['p2']), g_form=T('formiguinha'), g_mad=T('maduro sério'),
 v_nome=T('Valentino'), v_iris=T('íris', S['p3']), v_baun=T('baunilha', S['p3']), v_erv=T('ervinha'), v_couro=T('couro'),
 v_bruto=T('bruto'), v_card=T('Dior Homme'), v_banho=T('passa das 10'),
 q_nome=T('Acqua di Giò Parfum'), q_mar=T('mar'), q_inc=T('incenso'), q_mad=T('madeira'), q_card=T('clássico'),
 q_melh=T('melhorado'), q_v2=T('versão dois'),
 f_salva=T('salva'), f_segue=T('segue'))
K['f_cards'] = S['fim'] + 0.5

PF = [
 dict(k='c', n=1, nome='ARMANI CODE PARFUM', marca='GIORGIO ARMANI', img='code', bg=['iris', 'baunilha', 'bergamota', 'salvia'], t0=S['p1'], t1=S['p2'], show=S['p1'],
      g='lemale', gnome='LE MALE LE PARFUM', gmarca='JEAN PAUL GAULTIER', chip='VERSÃO ADULTA DO', tl=K['c_card'],
      notas=[['iris', 'ÍRIS', K['c_iris']], ['baunilha', 'BAUNILHA', K['c_baun']]],
      pills=[['❤️ UM DOS MEUS FAVORITOS', S['p1'], 'pim', K['c_fix']], ['⏱️ +10H NA MINHA PELE', K['c_fix'], 'ama']], fm='#9C452A'),
 dict(k='g', n=2, nome='GENTLEMAN SOCIETY<br>EXTRÊME', fs='60px', my='432px', h=500, marca='GIVENCHY', img='gentleman', bg=['cafe', 'baunilha', 'hortela', 'salvia', 'madeira'], t0=S['p2'], t1=S['p3'], show=K['g_nome'],
      notas=[['cafe', 'CAFÉ', K['g_cafe']], ['baunilha', 'BAUNILHA', K['g_baun']]],
      pills=[['🐜 NADA DE PERFUME DE FORMIGUINHA', K['g_form'], 'pim', K['g_mad']], ['MADURO, SÉRIO E +8H ⏱️', K['g_mad'], 'ama']], fm='#8A5A3A'),
 dict(k='v', n=3, nome='VALENTINO UOMO INTENSE', fs='58px', marca='VALENTINO', img='valentino', bg=['iris', 'couro', 'baunilha', 'salvia', 'laranja'], t0=S['p3'], t1=S['p4'], show=K['v_nome'],
      g='diorhi', gnome='DIOR HOMME INTENSE', gmarca='DIOR', chip='VIBE DO', tl=K['v_card'],
      notas=[['iris', 'ÍRIS', K['v_iris']], ['baunilha', 'BAUNILHA', K['v_baun']], ['salvia', 'ERVINHA', K['v_erv']], ['couro', 'COURO', K['v_couro']]],
      pills=[['🔥 CHEIRO BRUTO MESMO', K['v_bruto'], 'pim', K['v_banho']], ['🚿 +10H, SÓ SAI NO BANHO', K['v_banho'], 'ama']], fm='#5A3A2A'),
 dict(k='q', n=4, nome='ACQUA DI GIÒ PARFUM', marca='GIORGIO ARMANI', img='adgparfum', bg=['mar', 'bergamota', 'salvia', 'incenso', 'madeira'], t0=S['p4'], t1=S['fim'], show=K['q_nome'],
      g='adg', gnome='ACQUA DI GIÒ CLÁSSICO', gmarca='GIORGIO ARMANI', chip='VERSÃO 2.0 DO', tl=K['q_card'],
      notas=[['mar', 'MAR', K['q_mar']], ['incenso', 'INCENSO', K['q_inc']], ['madeira', 'MADEIRA', K['q_mad']]],
      pills=[['😅 "MUITO MAIS MELHORADO"', K['q_melh'], 'pim', K['q_v2']], ['🖤 MAIS ESCURO E ELEGANTE', K['q_v2'], 'ama']], fm='#3E7C8A'),
]
CAPA = dict(html='<div class="cparte">4 PERFUMES IMPORTADOS</div><div class="c1">QUE MERECIAM</div><div class="c2" style="font-size:150px">MAIS HYPE</div>'
                 '<div class="cpil">e são excelentes ✨</div>', q=['', '', '', ''], rev=[['code', K['a_nome']]], fav=['❤️ UM DOS MEUS FAVORITOS', K['a_fav']])
SELOS = [['🔥 MERECIAM MAIS HYPE', S['p1'], S['fim']]]
FIMC = dict(cards=['code', 'gentleman', 'valentino', 'adgparfum'])
BG_FIM = ['iris', 'cafe', 'couro', 'mar', 'baunilha', 'incenso']
AR = json.load(open(P + 'frascos/ar.json'))

# legenda (obrigatória do começo ao fim): grupos curtos, nomes de perfume/marca destacados
NOMES = {'armani', 'code', 'parfum', 'male', 'gentleman', 'society', 'extreme', 'givenchy', 'valentino', 'uomo', 'intense',
         'dior', 'homme', 'acqua', 'gio', 'valota'}
def nome(i):
    w = NW[i]
    if w == 'le': return (i + 1 < len(NW) and NW[i + 1] == 'male') or (i > 0 and NW[i - 1] == 'male')
    if w == 'di': return i > 0 and NW[i - 1] == 'acqua'
    return w in NOMES
DISP = [w['word'] for w in W]
for i in range(len(W) - 2):
    if NW[i:i + 3] == ['dois', 'ponto', 'zero']: DISP[i] = '2.0' + (',' if DISP[i + 2].endswith(',') else ''); DISP[i + 1] = DISP[i + 2] = None
grupos, cur = [], []
for i, w in enumerate(W):
    if DISP[i] is None: cur.append(i); continue
    cand = ' '.join([DISP[j] for j in cur if DISP[j]] + [DISP[i]])
    meio_nome = cur and nome(i) and nome(cur[-1]) and len(cand) <= 30
    comeca_nome = cur and nome(i) and not nome(cur[-1]) and len(cand) > 16
    if cur and not meio_nome and (comeca_nome or len(cand) > 24 or re.search(r'[.?!,:]$', [DISP[j] for j in cur if DISP[j]][-1])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'uma', 'por', 'que', 'em', 'sem', 'pro', 'nao', 'pelo', 'tipo', 'as', 'se', 'ja', 'mas', 'so', 'os', 'das', 'essa', 'esse'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and DISP[grupos[k][-1]] and NW[grupos[k][-1]] in CON and not nome(grupos[k][-1]) and not re.search(r'[.?!,:]$', DISP[grupos[k][-1]]):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[,?!:]$|\.$', '', DISP[j]), 'h': nome(j)} for j in g if DISP[j]]} for g in grupos]
LEG[-1]['t1'] = END + 1   # última frase fica até o fim

# efeitos (sem música — ela põe no Instagram)
FX = [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3), (K['a_nome'], 'shine_brilho', .3), (K['a_fav'], 'ding_acerto', .3)]
for k in ['p1', 'p2', 'p3', 'p4', 'fim']: FX.append((S[k], 'whoosh_rapido', .28))
for k in ['g_nome', 'v_nome', 'q_nome']: FX.append((K[k] + .05, 'impact_grave', .2))
for k in ['c_card', 'v_card', 'q_card']: FX.append((K[k], 'shine_brilho', .28))
for p in PF:
    for _, _, t in p['notas']: FX.append((t, 'pop_leve', .3))
    for pl in p['pills']: FX.append((pl[1] + (0.15 if pl[1] == p['t0'] else 0), 'ding_acerto', .26))
FX += [(K['f_salva'], 'click_ui', .4), (K['f_segue'], 'plim_brilho_magico', .3)]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='creme', TOT=4, S=S, K=K, FIM=FIM, END=END, LEG=LEG, PF=PF, CAPA=CAPA, SELOS=SELOS, FIMC=FIMC, BG_FIM=BG_FIM, AR=AR)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})
for g in LEG: print(f"{g['t0']:5.1f} {' '.join(('*' if w['h'] else '') + w['w'] for w in g['p'])}")

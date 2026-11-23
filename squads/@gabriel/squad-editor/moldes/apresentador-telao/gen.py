# v68 · STRONGER WITH YOU EXTREMELY · APRESENTADOR DE TELÃO (1º vídeo do molde)
# Uso: python3 gen.py  → index.html + audio_map.json   (voz: narracao_175.wav · tempos: palavras_1x.json ÷ 1,75)
import json, re, unicodedata, os
P = os.path.dirname(os.path.abspath(__file__)) + '/'
VEL = 1.75
W = json.load(open(P + 'palavras_1x.json'))['palavras']
W = [dict(word=w['word'], start=w['start'] / VEL, end=w['end'] / VEL) for w in W]
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
NW = [n(w['word']) for w in W]
def ix(frase, depois=0.0):
    f = [n(x) for x in frase.split()]
    for i in range(len(W)):
        if W[i]['start'] >= depois - 0.01 and NW[i:i + len(f)] == f: return i
    raise SystemExit('não achei: ' + frase)
def T(frase, depois=0.0): return round(W[ix(frase, depois)]['start'], 3)

FIM = round(W[-1]['end'], 3); END = round(FIM + 1.6, 3)
S = dict(intro=T('Ele se chama'), brasil=T('Enquanto isso'), prova=T('Só que ontem'), boato=T('Porque tá todo mundo'),
         conf=T('Já a única'), cta=T('Então, Armani'))
K = dict(
 vendendo=T('vendendo'), nota=T('E ainda tem'), extremely=T('Extremely'), dolares=T('dólares'), apareceu=T('nem apareceu'),
 y2027=T('2027', S['prova']), oriental=T('oriental'), frutado=T('nesse frutado'),
 mar1=T('maracujá', S['boato']), pou=T('Power of You'), nenhuma=T('nenhuma fonte'),
 familia=T('família de perfume'), castanha=T('castanha'), parfum=T('Stronger With You Parfum'), intenso=T('intenso'),
 dna=T('DNA'), forte=T('mais forte'), chegar=T('E quando ele chegar'), grupo=T('grupo de perfumes'),
 link=T('link da bio'), segue=T('segue a Valota'))

# legenda (à direita do avatar): grupos de até 30 caracteres; "cento e trinta e cinco dólares" vira "135 dólares"
tok = []; i = 0
while i < len(W):
    if NW[i:i + 6] == ['cento', 'e', 'trinta', 'e', 'cinco', 'dolares']:
        tok.append({'w': '135 dólares,', 's': W[i]['start'], 'e': W[i + 5]['end'], 'k': 'dolares'}); i += 6; continue
    tok.append({'w': W[i]['word'], 's': W[i]['start'], 'e': W[i]['end'], 'k': NW[i]}); i += 1
DEST = {'armani', '2027', 'extremely', 'dolares', 'brasil', 'oriental', 'frutado', 'boato', 'maracuja', 'castanha',
        'intenso', 'forte', 'saudade', 'grupo', 'bio', 'parfum', 'novo', 'dna', 'confirmou'}
grupos, cur = [], []
for j, t in enumerate(tok):
    cand = ' '.join([tok[x]['w'] for x in cur] + [t['w']])
    if cur and (len(cand) > 30 or re.search(r'[.?!]$', tok[cur[-1]]['w']) or (re.search(r',$', tok[cur[-1]]['w']) and len(cand) > 16)):
        grupos.append(cur); cur = []
    cur.append(j)
grupos.append(cur)
LEG = [{'t0': tok[g[0]]['s'], 't1': (tok[g[-1] + 1]['s'] if g[-1] + 1 < len(tok) else FIM + 0.3),
        'p': [{'w': re.sub(r'[.,?!]$', '', tok[x]['w']), 'h': tok[x]['k'] in DEST} for x in g]} for g in grupos]

# efeitos sonoros (sem música)
FX = [(0.05, 'click_ui', .45), (0.5, 'swipe_tela', .3), (K['vendendo'] + .2, 'lupa_whoosh', .35),
      (S['intro'], 'whoosh_suave', .35), (K['dolares'], 'caixa_registradora', .3), (K['apareceu'] + .1, 'carimbo', .35),
      (S['prova'], 'whoosh_suave', .35), (K['y2027'], 'click_ui', .45), (K['oriental'], 'lupa_whoosh', .35), (K['frutado'], 'click_ui', .45),
      (S['boato'], 'whoosh_suave', .35), (K['mar1'], 'pop_leve', .4), (K['pou'], 'pop_leve', .4), (K['nenhuma'] + .1, 'carimbo', .35),
      (S['conf'], 'whoosh_suave', .35), (K['castanha'], 'ding_acerto', .32), (K['parfum'], 'pop_leve', .4),
      (K['intenso'], 'lupa_whoosh', .35), (K['dna'], 'whoosh_rapido', .3), (K['forte'], 'shine_brilho', .32),
      (S['cta'], 'whoosh_suave', .35), (K['chegar'], 'whoosh_rapido', .3), (K['grupo'], 'pop_leve', .4),
      (K['link'], 'ding_notificacao', .35), (K['segue'], 'pop_leve', .4)]
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(S=S, K=K, FIM=FIM, END=END, LEG=LEG)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG))
for k, v in {**S, **K}.items(): print(f'  {k:10s} {v}')

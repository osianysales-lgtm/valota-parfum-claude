# v67 · 4 ÁRABES MAIS HYPADOS DO MOMENTO · NARRAÇÃO PETRÓLEO (fundo mais escuro, notas + fumaça, legenda discreta)
# Molde "guia de carrossel" (pegada v53/v56/v59, base do template do v65 sem avatar).
# Uso: python3 gen.py → index.html + audio_map.json   (voz: narracao_175.wav · tempos: palavras_1x.json ÷ 1,75)
import json, re, unicodedata, os
P = os.path.dirname(os.path.abspath(__file__)) + '/'
VEL = 1.75
ADI = 0.10   # o ElevenLabs entrega os tempos um pouco atrasados: elementos entram 0,1 s antes da palavra
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
S = dict(capa=0, s4=T('Então, em quarto'), s3=T('Já em terceiro'), grupo=T('Inclusive'), s2=T('Voltando'),
         ponta=T('Só que o primeiro', 40), s1=T('Porque o Cedrus'), hype=T('Ou seja'), cta=T('Salva esse'))
s4, s3, s2, s1 = S['s4'], S['s3'], S['s2'], S['s1']
K = dict(
 # 4º Élite
 e_lembra=T('lembra', s4), e_berg=T('bergamota', s4), e_gros=T('groselha', s4), e_vet=T('e vetiver', s4),
 e_calor=T('calor', s4), e_hora=T('oito horas', s4), e_preco=T('trezentos e oitenta', s4),
 # 3º Fahad
 f_lembra=T('lembra', s3), f_citr=T('cítrico', s3), f_abac=T('abacaxi', s3), f_flor=T('flor de laranjeira', s3),
 f_inc=T('incenso', s3), f_ocas=T('qualquer ocasião', s3), f_hora=T('sete horas', s3), f_preco=T('trezentos e vinte', s3),
 # grupo
 g_orig=T('original', S['grupo']), g_conf=T('loja de confiança'), g_verd=T('preço de verdade'), g_link=T('link da bio'), g_grupo=T('grupo de ofertas'),
 # 2º Fuego
 u_lembra=T('lembra', s2), u_frut=T('frutado', s2), u_abac=T('abacaxi', s2), u_pim=T('pimenta', s2), u_baun=T('baunilha', s2),
 u_mel=T('mel', s2), u_hora=T('nove horas', s2), u_dia=T('dia ou de noite', s2), u_preco=T('quatrocentos', s2),
 # ponta solta
 p_doce=T('doce', S['ponta']), p_ganhar=T('ganhar', S['ponta']),
 # 1º Cedrus
 c_lembra=T('lembra', s1), c_limpo=T('limpo', s1), c_lar=T('laranja', s1), c_berg=T('bergamota', s1), c_cedro=T('cedro', s1),
 c_camisa=T('cheiro de camisa', s1), c_hora=T('oito horas', s1), c_preco=T('trezentos e dez', s1),
 # hype + cta
 h_merece=T('merece', S['hype']), h_perg=T('perguntarem', S['hype']),
 salva=T('Salva esse'), quer=T('Quer ficar'), segue=T('Segue a Valota'), arroba=T('Parfum pra mais'))

# legenda discreta (pegada v56): grupos curtos, nomes de perfume/marca em amarelo; some na capa
NOMES = {'club', 'de', 'nuit', 'elite', 'armaf', 'wild', 'vetiver', 'creed', 'fahad', 'lattafa', 'myslf', 'ysl', 'intenso',
         'fuego', 'cedrus', 'blanc', 'rayhaan', 'cedar', 'chic', 'carolina', 'herrera', 'valota', 'parfum', 'whatsapp'}
def nome(i):
    w = NW[i]
    if w == 'de': return 0 < i < len(NW) - 1 and NW[i - 1] == 'club' and NW[i + 1] == 'nuit'
    if w == 'vetiver': return i > 0 and NW[i - 1] == 'wild'
    return w in NOMES
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    meio_nome = cur and nome(i) and nome(cur[-1]) and len(cand) <= 34
    comeca_nome = cur and nome(i) and not nome(cur[-1]) and len(cand) > 16
    if cur and not meio_nome and (comeca_nome or len(cand) > 26 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
# regra v56: linha não termina em conectivo ("da", "no", "a"...): ele desce pra linha seguinte
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'uns', 'umas', 'por', 'que', 'em', 'meu', 'qual', 'sem', 'pro', 'nao'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and NW[grupos[k][-1]] in CON and not re.search(r'[.?!,]$', W[grupos[k][-1]]['word']):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': nome(j)} for j in g]} for g in grupos]

# efeitos sonoros (sem música — ela põe no Instagram)
FX = [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3)]
for k in ['s4', 's3', 'grupo', 's2', 'ponta', 's1', 'hype', 'cta']: FX.append((S[k], 'whoosh_rapido', .3))
for k in ['s4', 's3', 's2', 's1']: FX.append((S[k] + 0.35, 'impact_grave', .22))
for k in ['e_berg', 'e_gros', 'e_vet', 'f_citr', 'f_abac', 'f_flor', 'f_inc', 'u_abac', 'u_pim', 'u_baun', 'u_mel', 'c_lar', 'c_berg', 'c_cedro']:
    FX.append((K[k], 'pop_leve', .35))
for k in ['e_lembra', 'f_lembra', 'u_lembra', 'c_lembra']: FX.append((K[k], 'shine_brilho', .3))
for k in ['e_hora', 'f_hora', 'u_hora', 'c_hora']: FX.append((K[k], 'riser_curto', .2))
for k in ['e_preco', 'f_preco', 'u_preco', 'c_preco']: FX.append((K[k], 'caixa_registradora', .3))
FX += [(K['e_calor'], 'flash_camera', .25), (K['g_grupo'], 'pop_leve', .4), (K['g_link'], 'ding_notificacao', .35),
       (K['g_orig'], 'click_ui', .3), (K['g_conf'], 'click_ui', .3), (K['g_verd'], 'click_ui', .3),
       (K['p_doce'] + .05, 'carimbo', .35), (K['p_ganhar'], 'suspense_dun', .3), (S['s1'] + .2, 'plim_brilho_magico', .35),
       (K['c_camisa'], 'spray_perfume', .25), (K['h_merece'] + .05, 'carimbo', .4), (K['salva'], 'ding_notificacao', .35)]
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

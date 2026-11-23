# Molde NARRAÇÃO "MOTIVOS" ÂMBAR (NA2) · 1º uso: v52 "Por que o perfume árabe é tão mais barato?" (17/11/2026)
# Estrutura: gancho fixo + FOTO REAL (card) → 3 cards 1·2·? → 1 tela por motivo (barra 1·2·3 no topo, rótulo MOTIVO N,
#   nome revelado na fala, ilustração desenhada, pílulas que trocam na fala) → história (pergaminho) → fecho que volta no gancho
#   (foto do gancho + carimbo) → CTA do grupo do WhatsApp (sem print inventado) → assinatura.
# Fundo ÂMBAR (#D49A4E) com brilho creme e vinheta Cedro; textos Petróleo Noite; amarelo só em selo/palavra-chave.
# Fluxo: tools/voz.js → VEL=1.65 moldes/narracao-limpo-creme/cortar_pausas.py (renomear narracao_175.wav → narracao_165.wav)
#        → VEL=1.65 python3 moldes/narracao-motivos-ambar/gen.py output/vN/ → plano → daphne index_165.html
import json, sys, re, unicodedata, os
P = sys.argv[1].rstrip('/') + '/'
VEL = float(os.environ.get('VEL', '1.75')); SUF = str(int(round(VEL * 100)))
W = json.load(open(P + 'palavras_1x.json'))['palavras']
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def ix(word, after=0):
    for i in range(after, len(W)):
        if n(W[i]['word']) == n(word): return i
    raise SystemExit('palavra não achada: ' + word)
def T(i): return round(W[i]['start'] / VEL, 3)
FALA_FIM = round(W[-1]['end'] / VEL, 3); END = round(FALA_FIM + 3.0, 2)

# ── CONFIG do v52 (por que o árabe é mais barato) ─────────────
i_com = ix('comercial'); i_pag = ix('pagou'); i_ult = ix('último')
i_M1 = ix('Porque'); i_prop = ix('propaganda', i_M1); i_marca = ix('marca', i_prop); i_cresce = ix('cresce', i_marca)
i_M2 = ix('E', i_cresce); i_muita = ix('muita', i_M2); i_aluga = ix('aluga', i_muita); i_ja = ix('Já', i_aluga); i_nome2 = ix('nome', i_M2)
i_M3 = ix('Só', i_ja); i_resp = ix('respeito', i_M3); i_la = ix('lá', i_resp); i_todo = ix('todo', i_la); i_fab = ix('fabricam', i_todo); i_cada = ix('cada', i_fab)
i_H = ix('E', i_cada); i_mil = ix('mil', i_H); i_sab = ix('sábio', i_mil); i_liv = ix('livro', i_sab)
i_F = ix('Ou', i_liv); i_eco = ix('economizar', i_F)
i_C = ix('Agora', i_eco); i_orig = ix('original', i_C); i_conf = ix('confiança', i_orig); i_verd = ix('verdade', i_conf)
i_link = ix('link', i_verd); i_grupo = ix('grupo', i_link); i_segue = ix('segue', i_grupo)

CENA = {'abertura': (0, T(i_M1)), 'm1': (T(i_M1), T(i_M2)), 'm2': (T(i_M2), T(i_M3)), 'm3': (T(i_M3), T(i_H)),
        'hist': (T(i_H), T(i_F)), 'fecho': (T(i_F), T(i_C)), 'cta': (T(i_C), END)}
HOOK = ['VOCÊ PAGOU<br>O CACHÊ DO ATOR', 'e o perfume veio de brinde']
FOTO_ATOR = dict(img='fotos/ator_mar.jpg', x=210, y=640, w=660, h=450, rot=-3)
FOTO_CULT = dict(img='fotos/frascos_arabes.jpg', x=250, y=500, w=580, h=580, rot=3)
MOTIVOS = [
 dict(id='m1', rot='MOTIVO 1', nome='PROPAGANDA', t_nome=T(i_prop), ilu='propaganda',
      t_a=T(i_marca), t_b=T(i_cresce),
      slots=[[T(i_marca), 'cont', 'GRIFE: ATOR FAMOSO NO COMERCIAL'], [T(i_cresce), 'ama', 'ÁRABE: GENTE INDICANDO PRO AMIGO']]),
 dict(id='m2', rot='MOTIVO 2', nome='ALUGUEL<br>DO NOME', fs=104, t_nome=T(i_nome2), ilu='aluguel',
      t_a=T(i_aluga), t_b=T(i_ja),
      slots=[[T(i_muita), 'cont', 'MUITA GRIFE NEM FABRICA O PERFUME'], [T(i_aluga), 'cont', 'SÓ ALUGA O NOME E COBRA POR ISSO'],
             [T(i_ja), 'ama', 'LATTAFA E ARMAF: FÁBRICA PRÓPRIA NOS EMIRADOS']]),
 dict(id='m3', rot='MOTIVO 3 · O QUE NINGUÉM CONTA', nome='CULTURA', t_nome=T(i_resp), ilu='cultura',
      t_a=T(i_la), t_b=T(i_fab),
      slots=[[T(i_la), 'cont', 'LÁ, PERFUME É ARROZ E FEIJÃO'], [T(i_todo), 'cont', 'TODO MUNDO PASSA TODO DIA'],
             [T(i_fab), 'cont', 'FABRICAM EM QUANTIDADE GIGANTE'], [T(i_cada), 'ama', 'CADA FRASCO SAI MAIS BARATO']]),
]
HIST = dict(t1='HÁ MAIS DE', t2='MIL ANOS', t_mil=T(i_mil),
            slots=[[T(i_sab), 'cont', 'UM SÁBIO ÁRABE JÁ ESCREVIA'], [T(i_liv), 'ama', 'LIVRO DE RECEITA DE PERFUME']])
FECHO = dict(t1='ELES PERFUMAVAM O MUNDO', t2='ANTES DE<br>HOLLYWOOD', selo='CACHÊ ECONOMIZADO ✓', t_eco=T(i_eco))
CTA = dict(tit_a='QUER ÁRABE<br>DE VERDADE?', tit_b='O LINK<br>TÁ NA BIO',
           itens=[[T(i_orig), 'ORIGINAL'], [T(i_conf), 'LOJA DE CONFIANÇA'], [T(i_verd), 'PREÇO DE VERDADE']],
           grupo='ENTRA NO MEU GRUPO DO WHATSAPP', slogan='SEM ÁRABE FALSO, SEM OFERTA FALSA',
           t_link=T(i_link), t_grupo=T(i_grupo), t_segue=T(i_segue))
SFX = [('whoosh_suave.mp3', 0.05, .3), ('impact_grave.mp3', 0.0, .3), ('flash_camera.mp3', T(i_com), .22),
       ('pop_leve.mp3', T(i_pag) + 0.3, .4), ('suspense_dun.mp3', T(i_ult), .32)]
for m in MOTIVOS:
    a = CENA[m['id']][0]
    SFX += [('whoosh_suave.mp3', a, .28), ('pop_leve.mp3', m['t_nome'], .38)] + [('click_ui.mp3', s[0], .25) for s in m['slots'][1:]]
SFX += [('whoosh_suave.mp3', T(i_H), .28), ('shine_brilho.mp3', T(i_mil), .35), ('click_ui.mp3', T(i_liv), .25),
        ('whoosh_suave.mp3', T(i_F), .28), ('ding_acerto.mp3', T(i_eco), .32),
        ('whoosh_suave.mp3', T(i_C), .28)] + [('pop_leve.mp3', t, .3) for t, _ in CTA['itens']] + \
       [('pop_leve.mp3', T(i_link), .3), ('ding_notificacao.mp3', T(i_grupo), .3), ('shine_brilho.mp3', T(i_segue), .3)]
NOMES = {'hollywood', 'cache', 'propaganda', 'lattafa', 'armaf', 'emirados', 'mil', 'original', 'bio', 'whatsapp', 'valota', 'parfum'}
# ───────────────────────────────────────────────────────────────
grupos = []; cur = []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = [{'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': n(W[j]['word']) in NOMES} for j in g]} for g in grupos]
D = dict(CENA=CENA, HOOK=HOOK, FOTO_ATOR=FOTO_ATOR, FOTO_CULT=FOTO_CULT, MOTIVOS=MOTIVOS, HIST=HIST, FECHO=FECHO, CTA=CTA,
         T_COM=T(i_com), T_PAG=T(i_pag) + 0.3, T_ULT=T(i_ult), END=END, FALA_FIM=FALA_FIM, LEG=LEG)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + f'index_{SUF}.html', 'w').write(html)
json.dump({'narracao': {'file': f'narracao_{SUF}.wav', 'volume': 1}, 'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]}, open(P + f'audio_map_{SUF}.json', 'w'), indent=1)
for k, (a, b) in CENA.items(): print(f'{k:9s} {a:6.2f} → {b:6.2f}')
print('VEL', VEL, 'END', END, 'legendas', len(LEG), 'sfx', len(SFX))

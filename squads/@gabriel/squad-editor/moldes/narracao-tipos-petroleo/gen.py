# v47 · 5 tipos de pessoa que usam perfume · "olha pro seu frasco" · NARRAÇÃO PETRÓLEO
# Molde novo: tipos/quiz (abertura com 5 silhuetas + "?" → 1 tela por tipo com FOTO REAL em miniatura + FRASCO DESENHADO
#   + barra de progresso 1..5,? → ponte → fecho → CTA com foto). Fundo petróleo (pedido da Osiany 16/11).
# Uso: VEL=1.75 python3 gen.py output/vN/   (VEL=1.65 pra versão mais lenta; usa narracao_175.wav / narracao_165.wav)
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
FALA_FIM = round(W[-1]['end'] / VEL, 3); END = round(FALA_FIM + 2.6, 2)

# ── âncoras ──
i_olhar = ix('olhar'); i_entao = ix('Então'); i_sexto0 = ix('sexto')
i_T1 = ix('Se', i_entao); i_exa = ix('exagerado', i_T1); i_adi = ix('adianta', i_exa)
i_T2 = ix('Agora', i_adi); i_fiel = ix('fiel', i_T2); i_seg = ix('segundo', i_fiel)
i_po = ix('Mas', i_seg); i_T3 = ix('estante', i_po) - 2; i_col = ix('colecionador', i_T3); i_rod = ix('rodízio', i_col)
i_T4 = ix('Já', i_rod); i_qua = ix('quarto', i_T4); i_not = ix('notas', i_qua); i_oca = ix('ocasião', i_not)
i_T5 = ix('E', i_oca); i_proc = ix('procurar', i_T5); i_banh = ix('banheiro', i_proc); i_rep = ix('repara', i_banh); i_comp = ix('compra', i_rep)
i_T6 = ix('Já', i_comp); i_dura = ix('dura', i_T6); i_perg = ix('pergunta', i_T6)
i_fe = ix('E', i_perg); i_qui = ix('quinto', i_fe); i_hora = ix('hora', i_qui)
i_cta = ix('Então', i_hora); i_link = ix('link', i_cta); i_ofe = ix('melhores', i_link); i_segue = ix('segue', i_ofe)

FY = 265  # topo da foto
def foto(img, rot, cut=False): return dict(img=img, x=110, y=FY, w=530, h=640, rot=rot, cut=cut)
def ilu(tipo, rot=6): return dict(tipo=tipo, x=660, y=360, w=300, rot=rot)
TIPOS = [
 dict(id='t1', rot='TIPO 1', nome='O EXAGERADO', t_nome=T(i_exa), foto=foto('fotos/exagerado.png', -3), ilu=ilu('quase_vazio'),
      slots=[[T(i_T1), 'sinal', 'FRASCO QUASE NO FIM'], [T(i_adi), 'dica', 'NÃO ADIANTA BORRIFAR ATÉ SENTIR']]),
 dict(id='t2', rot='TIPO 2', nome='O FIEL', t_nome=T(i_fiel), foto=foto('fotos/fiel.jpg', 3), ilu=ilu('dez_anos', -6),
      slots=[[T(i_T2), 'sinal', 'O MESMO FRASCO HÁ 10 ANOS'], [T(i_seg), 'dica', 'TENHA UM 2º PRA ALTERNAR']]),
 dict(id='t3', rot='TIPO 3', nome='O COLECIONADOR', fs=92, t_nome=T(i_col), foto=foto('fotos/colecao.jpg', -3), ilu=ilu('estante'),
      slots=[[T(i_T3), 'sinal', 'ESTANTE CHEIA, SÓ 2 EM USO'], [T(i_rod), 'dica', 'RODÍZIO: UM POR DIA']]),
 dict(id='t4', rot='TIPO 4', nome='O QUE GUARDA', t_nome=T(i_qua), foto=foto('fotos/presente_b.png', 3, True), ilu=ilu('presente', -6),
      slots=[[T(i_T4), 'sinal', 'O CARO QUASE CHEIO HÁ ANOS'], [T(i_not), 'sinal', 'ABERTO, ELE PERDE AS NOTAS DE SAÍDA'], [T(i_oca), 'dica', 'A OCASIÃO ESPECIAL É HOJE']]),
 dict(id='t5', rot='TIPO 5', nome='O QUE PEGA<br>EMPRESTADO', fs=84, t_nome=T(i_banh), foto=foto('fotos/prateleira_vazia.jpg', -3), ilu=ilu('sumiu'),
      slots=[[T(i_proc), 'sinal', 'PROCURA O FRASCO E NÃO ACHA'], [T(i_rep), 'dica', 'REPARA DE QUEM VOCÊ MAIS PEGA'], [T(i_comp), 'dica', 'COMPRA UM SÓ SEU']]),
 dict(id='t6', rot='TIPO 6 · O MAIS RARO', nome='O QUE SABE USAR', fs=92, t_nome=T(i_T6) + 0.3, foto=foto('fotos/raro.png', 3, True), ilu=ilu('raro', -6),
      slots=[[T(i_dura), 'sinal', 'FRASCO QUE DURA · ALTERNA · USA O BOM NUMA TERÇA'], [T(i_perg), 'dica', 'TODO MUNDO PERGUNTA O QUE ELE USA']]),
]
CENA = {'abertura': (0, T(i_T1)), 't1': (T(i_T1), T(i_T2)), 't2': (T(i_T2), T(i_po)), 'ponte': (T(i_po), T(i_T3)),
        't3': (T(i_T3), T(i_T4)), 't4': (T(i_T4), T(i_T5)), 't5': (T(i_T5), T(i_T6)), 't6': (T(i_T6), T(i_fe)),
        'fecho': (T(i_fe), T(i_cta)), 'cta': (T(i_cta), END)}
HOOK = ['SEU FRASCO<br>JÁ CONTOU', 'qual tipo é você?']
ABFOTO = dict(img='fotos/banheiro.jpg', x=290, y=600, w=500, h=720, rot=-3)
CTAFOTO = dict(img='fotos/amigos.jpg', x=130, y=470, w=820, h=560, rot=-2)
PONTE = ['FRASCO DEMAIS?', 'AÍ O PAPO<br>É OUTRO']
FECHO = ['VOLTOU DO BANHEIRO', 'SEM NENHUM<br>FRASCO?', 'ENTÃO VOCÊ É O', '5º', 'TÁ NA HORA DE TER UM SÓ SEU']
CTA = ['COMPARTILHA<br>COM O AMIGO', 'O LINK<br>TÁ NA BIO', 'AS MELHORES OFERTAS DE<br>PERFUMES ORIGINAIS']

SFX = [('whoosh_suave.mp3', 0.05, .3), ('flash_camera.mp3', 0.45, .22), ('pop_leve.mp3', T(i_entao), .3), ('shine_brilho.mp3', T(i_sexto0), .35)]
for tp in TIPOS:
    a = CENA[tp['id']][0]
    SFX += [('whoosh_suave.mp3', a, .28), ('pop_leve.mp3', tp['t_nome'], .38)] + [('click_ui.mp3', s[0], .25) for s in tp['slots'][1:]]
SFX += [('shine_brilho.mp3', TIPOS[-1]['t_nome'], .35), ('suspense_dun.mp3', T(i_po) + 0.05, .3), ('impact_grave.mp3', T(i_qui), .4),
        ('ding_acerto.mp3', T(i_hora), .3), ('whoosh_suave.mp3', T(i_cta), .28), ('pop_leve.mp3', T(i_link), .3), ('ding_notificacao.mp3', T(i_segue), .3)]
NOMES = {'exagerado', 'fiel', 'colecionador', 'quarto', 'quinto', 'sexto', 'valota', 'parfum', 'bio'}
# ── legenda ──
grupos = []; cur = []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = [{'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': n(W[j]['word']) in NOMES} for j in g]} for g in grupos]
D = dict(TIPOS=TIPOS, CENA=CENA, HOOK=HOOK, HK2_TOP=470, ABFOTO=ABFOTO, CTAFOTO=CTAFOTO, PONTE=PONTE, FECHO=FECHO, CTA=CTA,
         T_OLHAR=0.45, T_ENTAO=T(i_entao), T_SEXTO=T(i_sexto0), T_QUINTO=T(i_qui), T_HORA=T(i_hora),
         T_LINK=T(i_link), T_OFERTA=T(i_ofe), T_SEGUE=T(i_segue), END=END, FALA_FIM=FALA_FIM, LEG=LEG)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + f'index_{SUF}.html', 'w').write(html)
json.dump({'narracao': {'file': f'narracao_{SUF}.wav', 'volume': 1}, 'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]}, open(P + f'audio_map_{SUF}.json', 'w'), indent=1)
for k, (a, b) in CENA.items(): print(f'{k:9s} {a:6.2f} → {b:6.2f}')
print('VEL', VEL, 'END', END, 'legendas', len(LEG), 'sfx', len(SFX))

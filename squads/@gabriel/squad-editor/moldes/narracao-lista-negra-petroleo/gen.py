# MOLDE NARRAÇÃO PETRÓLEO · "LISTA NEGRA" (1º uso: v78 "5 perfumes que a internet fala mal", 23/11/2026)
# Gancho fixo (tarja Pimenta LISTA NEGRA + 5 frascos borrados com "?") → vira cabeçalho fixo no topo →
# 1 tela por perfume: posição #5…#1, nome, etiqueta GRIFE/ÁRABE, frasco revela na fala, pílulas do que a internet fala,
# chip da piada, carimbo LISTA NEGRA → último borrado tremendo → revelação → segredo (5 riscados) → CTA compartilha → assinatura.
# Fluxo: tools/voz.js (roteiro_voz.txt) → VEL=1.75 moldes/narracao-limpo-creme/cortar_pausas.py output/vN/
#        → python3 moldes/narracao-lista-negra-petroleo/gen.py output/vN/ → daphne index_175.html
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

# ── CONFIG do v78 ─────────────────────────────────────────────
i_ult = ix('último'); i_nasc = ix('nascer')
i_J = ix('Começando'); i_jn = ix('Joop'); i_xar = ix('xarope'); i_grip = ix('gripado')
i_P = ix('Depois'); i_pn = ix('Phantom'); i_rob = ix('robô'); i_deso = ix('desodorante'); i_nost = ix('nostalgia')
i_A = ix('Já'); i_an = ix('Ana'); i_talc = ix('talco'); i_nen = ix('neném')
i_E = ix('E', i_nen); i_en = ix('Eclaire'); i_doce = ix('doce', i_en); i_dor = ix('dor'); i_lado = ix('lado')
i_U = ix('Só', i_lado); i_ult2 = ix('último', i_U)
i_K = ix('Porque', i_ult2); i_kn = ix('Kouros'); i_banh = ix('banheiro'); i_onib = ix('ônibus'); i_fin = ix('finge')
i_S = ix('E', i_fin); i_lis = ix('lista', i_S); i_seg = ix('segredo')
i_C = ix('Agora', i_seg); i_comp = ix('compartilha'); i_segue = ix('segue', i_comp)

F = {  # frasco, nome, marca, tipo (GRIFE/ÁRABE), posição
 'joop':    ('frascos/joop.jpg',    'JOOP! HOMME', 'JOOP!',              'GRIFE', 5),
 'phantom': ('frascos/phantom.jpg', 'PHANTOM',     'RABANNE',            'GRIFE', 4),
 'ana':     ('frascos/ana.jpg',     'ANA ABIYEDH', 'LATTAFA',            'ÁRABE', 3),
 'eclaire': ('frascos/eclaire.jpg', 'ECLAIRE',     'LATTAFA',            'ÁRABE', 2),
 'kouros':  ('frascos/kouros.jpg',  'KOUROS',      'YVES SAINT LAURENT', 'GRIFE', 1),
}
ORDEM = ['joop', 'phantom', 'ana', 'eclaire', 'kouros']
REVELA = {'joop': T(i_jn), 'phantom': T(i_pn), 'ana': T(i_an), 'eclaire': T(i_en), 'kouros': T(i_kn)}
CENA = {
 'hook': (0, T(i_J)),
 'big_joop': (T(i_J), T(i_P)), 'big_phantom': (T(i_P), T(i_A)), 'big_ana': (T(i_A), T(i_E)),
 'big_eclaire': (T(i_E), T(i_U)), 'ultB': (T(i_U), T(i_K)), 'big_kouros': (T(i_K), T(i_S)),
 'segredo': (T(i_S), T(i_C)), 'cta': (T(i_C), END),
}
HOOK = dict(tarja='LISTA NEGRA 🚫', sub='DOS PERFUMES', chip='segundo a internet', t_ult=T(i_ult), t_nasc=T(i_nasc), selo='DESDE 1981 🥊')
# extras por cima do frasco grande: (cena, t, html, x, y, classe) · x/y em px de 1080x1920
EXTRA = [
 ('big_joop', T(i_xar), '<span class="pill">🍒 xarope de cereja</span>', 40, 650, ''),
 ('big_joop', T(i_grip), '<span class="ico">🤧</span>', 880, 980, 'pop'),
 ('big_joop', T(i_grip), '<span class="chip">TÁ GRIPADO?</span>', 0, 1150, 'centro'),
 ('big_phantom', T(i_rob), '<span class="pill">🤖 frasco de robô</span>', 600, 650, ''),
 ('big_phantom', T(i_deso), '<span class="pill">🧴 desodorante da 6ª série</span>', 40, 1030, ''),
 ('big_phantom', T(i_nost), '<span class="chip">NOSTALGIA QUE NINGUÉM PEDIU</span>', 0, 1150, 'centro'),
 ('big_ana', T(i_talc), '<span class="pill">👶 talco de bebê</span>', 40, 650, ''),
 ('big_ana', T(i_nen), '<span class="ico">🍼</span>', 880, 980, 'pop'),
 ('big_ana', T(i_nen), '<span class="chip">CADÊ O NENÉM?</span>', 0, 1150, 'centro'),
 ('big_eclaire', T(i_doce), '<span class="pill">🍮 doce demais</span>', 640, 650, ''),
 ('big_eclaire', T(i_dor), '<span class="ico">🤕</span>', 60, 980, 'pop'),
 ('big_eclaire', T(i_dor), '<span class="chip">DOR DE CABEÇA PRA DOIS</span>', 0, 1150, 'centro'),
 ('big_kouros', T(i_banh), '<span class="pill">🚻 banheiro de rodoviária</span>', 40, 650, ''),
 ('big_kouros', T(i_onib), '<span class="ico">🚌</span>', 880, 980, 'pop'),
 ('big_kouros', T(i_onib), '<span class="chip">VEIO DE ÔNIBUS?</span>', 0, 1150, 'centro'),
]
for k in ORDEM:  # carimbo LISTA NEGRA 1,5 s antes do fim da cena
    a, b = CENA['big_' + k]
    EXTRA.append(('big_' + k, round(max(a + 1.0, b - 1.5), 3), '<span class="stamp">LISTA NEGRA</span>', 0, 790, 'stamp centro'))
SEGREDO = dict(t='O SEGREDO FICA', t2='ENTRE A GENTE 🤫', t_seg=T(i_seg), t_lis=T(i_lis))
CTA = dict(t_comp=T(i_comp), t_segue=T(i_segue))
SFX = [('impact_grave.mp3', 0.0, .35), ('suspense_dun.mp3', T(i_ult), .32), ('martelo_juiz.mp3', T(i_nasc) + 0.2, .35)]
for k in ORDEM:
    a, b = CENA['big_' + k]
    SFX += [('whoosh_suave.mp3', a, .3), ('pop_leve.mp3', REVELA[k], .45), ('carimbo.mp3', round(max(a + 1.0, b - 1.5), 3), .55)]
SFX += [('pop_leve.mp3', T(i_xar), .3), ('boing_cartoon.mp3', T(i_grip), .32),
        ('pop_leve.mp3', T(i_rob), .3), ('disco_arranhado.mp3', T(i_nost), .3),
        ('pop_leve.mp3', T(i_talc), .3), ('boing_cartoon.mp3', T(i_nen), .3),
        ('pop_leve.mp3', T(i_doce), .3), ('trombone_triste.mp3', T(i_dor), .3),
        ('riser_curto.mp3', T(i_U), .45), ('impact_grave.mp3', T(i_kn), .5),
        ('pop_leve.mp3', T(i_banh), .3), ('badum_tss.mp3', T(i_fin), .35),
        ('whoosh_suave.mp3', T(i_S), .3), ('ziper_bolsa.mp3', T(i_seg), .3),
        ('whoosh_suave.mp3', T(i_C), .3), ('ding_notificacao.mp3', T(i_segue), .35)]
NOMES = {'joop', 'homme', 'phantom', 'ana', 'abiyedh', 'eclaire', 'kouros', 'yves', 'saint', 'laurent', 'valota', 'parfum'}
# ───────────────────────────────────────────────────────────────
grupos = []; cur = []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = [{'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']).upper(), 'h': n(W[j]['word']) in NOMES} for j in g]} for g in grupos]
D = dict(CENA=CENA, F=F, ORDEM=ORDEM, REVELA=REVELA, HOOK=HOOK, EXTRA=EXTRA, SEGREDO=SEGREDO, CTA=CTA,
         END=END, FALA_FIM=FALA_FIM, LEG=LEG)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + f'index_{SUF}.html', 'w').write(html)
json.dump({'narracao': {'file': f'narracao_{SUF}.wav', 'volume': 1},
           'bgm': {'file': '../../biblioteca_audio/trilhas/trilha_detetive_comica.mp3', 'volume': 0.13},
           'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]},
          open(P + f'audio_map_{SUF}.json', 'w'), indent=1)
for k, (a, b) in CENA.items(): print(f'{k:12s} {a:6.2f} → {b:6.2f}')
print('VEL', VEL, 'END', END, 'legendas', len(LEG), 'sfx', len(SFX))

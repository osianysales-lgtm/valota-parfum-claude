# MOLDE NARRAÇÃO LIMPA CREME · top 3 (frascos escondidos → 1 por vez → fecho → CTA grupo)
# 1º uso: v45 "Perfumes que as mulheres nunca vão ignorar" (16/11/2026)
# Fluxo: tools/voz.js (roteiro_voz.txt) → cortar_pausas.py (gera palavras_1x.json + narracao_175.wav) → este gen.py → plano → daphne
# Uso: python3 moldes/narracao-limpo-creme/gen.py output/vN/
# FOTOS: frasco no fundo creme = dict(img='frascos/x_f.png', ..., cut=False, solto=True) (sem card verde; aprovado no v46). Opcionais: HK2_TOP, SALVA_TXT.
# Para outro vídeo: trocar o bloco CONFIG (âncoras = palavras do roteiro.txt).
import json, sys, re, unicodedata, os
P = sys.argv[1].rstrip('/') + '/'
VEL = 1.75
W = json.load(open(P + 'palavras_1x.json'))['palavras']
def n(s): return re.sub(r'[^\w]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def ix(word, after=0):
    for i in range(after, len(W)):
        if n(W[i]['word']) == n(word): return i
    raise SystemExit('palavra não achada: ' + word)
def T(i): return round(W[i]['start'] / VEL, 3)
FALA_FIM = round(W[-1]['end'] / VEL, 3); END = round(FALA_FIM + 3.0, 2)

# ── CONFIG do v45 ──────────────────────────────────────────────
i_salva = ix('salva'); i_entao = ix('começa') - 1
i_sup = ix('supremacy'); i_todo = ix('todo', i_sup); i_comp = ix('compara', i_sup); i_abac = ix('abacaxi')
i_ai = ix('aí', i_sup) - 1; i_cheiro = ix('cheiro', i_abac)
i_9 = ix('9pm'); i_porque = i_9 - 2; i_enc = ix('encontro', i_9); i_baun = ix('baunilha'); i_pesc = ix('pescoço'); i_motivo = ix('motivo', i_9)
i_mas = ix('repara') - 1
i_mou = ix('mousuf'); i_que = i_mou - 3; i_doce = ix('doce', i_mou); i_mulher = ix('mulher', i_mou)
i_prox = ix('próximo', i_mulher); i_quer = ix('quer', i_prox); i_segue = ix('segue', i_quer)

F = {
 'sup': dict(img='frascos/supremacy_f.png', num='O DE DIA', nome='SUPREMACY', marca="COLLECTOR'S EDITION · AFNAN",
             notas='abacaxi  ·  maçã  ·  fundo defumado', lembra='ABSOLU AVENTUS · CREED', t_notas=T(i_abac),
             slots=[[T(i_todo), 'tag', 'TODO SANTO DIA'], [T(i_comp), 'lem']]),
 'pm9': dict(img='frascos/9pm_f.png', num='O DA NOITE', nome='9PM ELIXIR', marca='AFNAN',
             notas='baunilha  ·  couro', t_notas=T(i_baun),
             slots=[[T(i_enc), 'tag', 'ENCONTRO À NOITE'], [T(i_motivo) - 0.15, 'tag', 'O MOTIVO: SEU PESCOÇO']]),
 'mou': dict(img='frascos/mousuf_f.png', num='O ÚLTIMO', nome='MOUSUF', marca='ARD AL ZAAFARAN',
             notas='', t_notas=99, slots=[[T(i_doce), 'tag', 'DOCE FORA DO PADRÃO']]),
}
CENA = {'abertura': (0, T(i_entao)), 'big_sup': (T(i_entao), T(i_ai)), 'ponte1': (T(i_ai), T(i_porque)),
        'big_pm9': (T(i_porque), T(i_mas) + 0.7), 'ponte2': (T(i_mas) + 0.7, T(i_que)), 'big_mou': (T(i_que), T(i_mulher)),
        'investiga': (T(i_mulher), T(i_quer)), 'cta': (T(i_quer), END)}
HOOK = ['SOU MULHER', 'e vou entregar o jogo']
P1 = ['E AGORA,', 'O DA NOITE']; P2 = ['NENHUM DESSES É', 'O ÓBVIO']
INV = ['COM ELE, ELA NÃO IGNORA', 'ELA<br>INVESTIGA']; MOL = ['PRÓXIMO PASSO:', 'ROUBAR SEU<br>MOLETOM']
SFX = [('whoosh_suave.mp3', 0.05, .35), ('pop_leve.mp3', T(i_salva), .35)]
for k, ini in (('sup', T(i_entao)), ('pm9', T(i_porque)), ('mou', T(i_que))):
    SFX += [('shine_brilho.mp3', ini, .35)] + [('click_ui.mp3', s[0], .3) for s in F[k]['slots']]
SFX += [('whoosh_suave.mp3', T(i_ai), .3), ('suspense_dun.mp3', T(i_mas) + 0.1, .35), ('impact_grave.mp3', T(i_mulher), .4),
        ('pop_leve.mp3', T(i_prox), .35), ('whoosh_suave.mp3', T(i_quer), .3), ('ding_notificacao.mp3', T(i_segue), .3)]
NOMES = {'supremacy', 'collectors', 'edition', 'afnan', 'absolu', 'aventus', 'creed', '9pm', 'elixir', 'mousuf', 'ard', 'al', 'zaafaran', 'valota', 'parfum', 'whatsapp'}
# ───────────────────────────────────────────────────────────────
grupos = []; cur = []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
LEG = [{'t0': T(g[0]), 't1': (T(g[-1] + 1) if g[-1] + 1 < len(W) else FALA_FIM + 0.3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': n(W[j]['word']) in NOMES} for j in g]} for g in grupos]
FOTOS = [dict(img='cenas/arrumado.jpg', t0=T(i_cheiro) - 0.1, t1=T(i_ai), x=250, y=455, w=580, h=740, rot=-3, cut=False, esconde='big_sup'),
         dict(img='cenas/moletom.png', t0=T(i_prox), t1=T(i_quer), x=250, y=520, w=580, h=860, rot=3, cut=True)]
D = dict(FOTOS=FOTOS, F=F, CENA=CENA, HOOK=HOOK, P1=P1, P2=P2, INV=INV, MOL=MOL, SALVA=T(i_salva), MOLETOM=T(i_prox), SEGUE=T(i_segue), END=END, FALA_FIM=FALA_FIM, LEG=LEG)
html = open(os.path.join(os.path.dirname(__file__), 'template.html')).read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': [{'file': '../../biblioteca_audio/efeitos/' + a, 't': t, 'volume': v} for a, t, v in SFX]}, open(P + 'audio_map.json', 'w'), indent=1)
for k, (a, b) in CENA.items(): print(f'{k:10s} {a:6.2f} → {b:6.2f}')
print('END', END, 'legendas', len(LEG), 'sfx', len(SFX))

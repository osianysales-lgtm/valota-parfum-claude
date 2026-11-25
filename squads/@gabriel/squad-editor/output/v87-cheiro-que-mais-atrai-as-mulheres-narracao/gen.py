# v87 · O CHEIRO QUE MAIS ATRAI AS MULHERES · NARRAÇÃO PETRÓLEO (motor do v82 com cenas livres)
# Ref.: reel @albertokouty.perfumes DbRmwTBlJw8 (referencias/DbRmwTBlJw8/) · roteiro igual ao dele com dados reais:
#   pesquisa Showers To You × Fragrantica (3.743 mulheres: madeira 86%, aromáticos 78%, especiarias quentes 72%)
#   estudo Karolinska / Current Biology 2022 (225 pessoas, 9 povos: baunilha e pêssego = cheiros mais agradáveis)
# Uso: python3 gen.py → index.html + audio_map.json  (voz: narracao_175.wav · tempos: palavras_1x.json ÷ 1,75)
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
S = dict(c1=T('Porque uma pesquisa'), c1b=T('Elas votaram'), g1=T('O grupo que menos'), g2=T('Já o grupo'),
         res=T('E sabe o que mais'), bau=T('Agora, sendo'), bau2=T('sabe aquela baunilha'), hype=T('E o mais engraçado'), fim=T('Então, no próximo'))
ELS, FX = [], [(0.05, 'whoosh_suave', .4), (0.3, 'impact_grave', .3)]
def el(h, css, t0, t1, fx='pop', som=None, vol=.3, **extra):
    ELS.append([h, css, round(t0, 3), round(t1, 3), fx, extra])
    if som: FX.append((t0, som, vol))
def centro(y, **k): return dict(left='0', right='0', top=f'{y}px', textAlign='center', **k)
def pos(x, y, **k): return dict(left=f'{x}px', top=f'{y}px', **k)
def tag(tx, c='cre', fs=34, st=''): return f'<span class="tag {c}" style="font-size:{fs}px;{st}">{tx}</span>'

# ---------- CAPA (quadro 0 = capa do feed) · gancho fixo até "Porque uma pesquisa"
CAPA = ('<div class="cparte">PESQUISA 🔬</div><div class="c1">O CHEIRO QUE</div><div class="c2 ouro">MAIS ATRAI</div>'
        '<div class="c1">AS MULHERES</div><div class="cpil">quase nenhum cara sabe 🤫</div>')
for i, (fr, tx) in enumerate([('caro', 'NÃO É O MAIS CARO'), ('grife', 'NÃO É O DE GRIFE'), ('famoso', 'NEM O MAIS FAMOSO')]):
    el(tag('✕ ' + tx, 'pim', 38), centro(1095 + i * 112, transform='rotate(-2deg)'), T(fr), S['c1'], 'stamp', 'carimbo', .3, rot=-2)

# selo do gancho fixo no topo depois da capa
el('<span>💘 O CHEIRO QUE MAIS ATRAI AS MULHERES</span>', dict(top='52px'), S['c1'], END + 1, 'fade', cls='selo')

# ---------- PESQUISA
t1 = S['c1b']
el(tag('🔬 PESQUISA DE PERFUMARIA', 'cre', 36), centro(300), T('pesquisa'), t1, 'pop', 'whoosh_rapido', .28)
el('+3.700', dict(top='400px', fontSize='200px'), T('três mil'), t1, 'pop', 'impact_grave', .3, cls='big')
el('MULHERES OUVIDAS', dict(top='620px', fontSize='44px', letterSpacing='10px'), T('mulheres', 6), t1, 'up', cls='marca')
el(tag('🤫 E DESCOBRIU O QUE QUASE NENHUM CARA SABE', 'ama', 33), centro(760), T('quase nenhum'), t1, 'pop', 'pop_leve', .32)
t1 = S['g1']
el(tag('🗳️ ELAS VOTARAM EM DEZENAS DE CHEIROS', 'cre', 34), centro(290), T('votaram'), t1, 'pop', 'click_ui', .35)
for i, nt in enumerate(['madeira', 'lavanda', 'canela', 'baunilha', 'ambar', 'almiscar']):
    x = 540 - 3 * 165 + i * 165 + 8
    el(f'<div class="bola"><img src="notas/{nt}.png"></div>', pos(x, 420), T('dezenas') + i * 0.12, t1, 'pop', 'pop_leve' if i % 2 == 0 else None, .22)
el(tag('QUAL É MAIS ATRAENTE NUM HOMEM? 🤔', 'out', 34), centro(640), T('atraentes'), t1, 'pop')
el(tag('+ O QUE TODO PERFUMISTA FALA 👃', 'cre', 34), centro(760), T('perfumista'), t1, 'pop', 'pop_leve', .3)
el('<div class="grp nao">❌ NÃO<br>ATRAI</div>', pos(110, 920), T('dois grupos'), t1, 'pop', 'impact_grave', .25)
el('<div class="grp sim">✅<br>ATRAI</div>', pos(570, 920), T('dois grupos') + 0.25, t1, 'pop', 'ding_acerto', .3)
el('pesquisa Showers To You × Fragrantica · 3.743 mulheres', dict(top='1390px'), T('votaram'), t1, 'fade', cls='fonte')

# ---------- GRUPO QUE MENOS ATRAI
t1 = S['g2']
el(tag('❌ O GRUPO QUE MENOS ATRAI', 'pim', 44, 'font-family:GB;padding:20px 40px 14px'), centro(280), S['g1'] + 0.05, t1, 'pop', 'buzzer_erro', .22)
ITENS = [('óbvio', '1', 'ÓBVIO E SATURADO', 'oito em', '👥 8 EM CADA 10 CARAS USAM'),
         ('forte', '2', 'FORTE E ENJOATIVO 🤢', 'implora', '📢 IMPLORA PRA SER NOTADO'),
         ('não marca', '3', 'O QUE NÃO MARCA 😶', 'não fede', '🫥 NÃO FEDE NEM CHEIRA')]
for k, (fa, nn, tit, fb, sub) in enumerate(ITENS):
    y = 460 + k * 300
    el(f'<div class="box ruim"><div class="bt"><i>{nn}</i>{tit}</div></div>', pos(80, y), T(fa, S['g1']), t1, 'up', 'whoosh_rapido', .25)
    el(f'<div class="box ruim" style="background:none;border-color:transparent;box-shadow:none;padding-top:0"><div class="bs" style="margin-top:0">{sub}</div></div>', pos(80, y + 105), T(fb, S['g1']), t1, 'fade', 'pop_leve', .28)

# ---------- GRUPO QUE ATRAI
t1 = S['res']
el(tag('✅ O GRUPO QUE ATRAI', 'ama', 44, 'font-family:GB;padding:20px 40px 14px'), centro(280), S['g2'] + 0.05, t1, 'pop', 'ding_acerto', .3)
el('CONSTRÓI<br>MEMÓRIA', dict(top='420px', fontSize='130px'), T('constrói'), t1, 'pop', 'impact_grave', .28, cls='big')
el('<div class="emo">🧠</div>', centro(720), T('cérebro'), t1, 'pop', 'shine_brilho', .3, pulse=1)
el(tag('❤️ EMOÇÃO', 'cre', 40), pos(150, 1000), T('emoção'), t1, 'pop', 'pop_leve', .3)
el(tag('💭 LEMBRANÇA', 'cre', 40), pos(560, 1000), T('lembrança'), t1, 'pop', 'pop_leve', .3)
el(tag('✨ MESMO SEM ELA QUERER', 'ama', 40), centro(1150), T('mesmo sem'), t1, 'pop', 'plim_brilho_magico', .28)

# ---------- O QUE MAIS ATRAIU (barras com o número real da pesquisa)
t1 = S['bau']
el(tag('🏆 O QUE MAIS ATRAIU NA PESQUISA', 'cre', 36), centro(280), S['res'] + 0.05, t1, 'pop', 'whoosh_rapido', .28)
el(tag('🔥 NOTAS QUENTES', 'pim', 40), centro(390), T('notas quentes'), t1, 'pop', 'impact_grave', .22)
def barra(y, img, lb, sub, v, t0, tb, top=False):
    el(f'<div class="barra{" top" if top else ""}"><div class="ic"><img src="notas/{img}.png"></div><div class="dir"><div class="lb">{lb}<small>{sub}</small></div>'
       f'<div class="tr"><div class="fill"></div><div class="num">0%</div></div></div></div>', pos(80, y), t0, t1, 'up', 'pop_leve', .3, bar=v, tb=tb)
barra(530, 'madeira', '1º MADEIRA 🥇', 'DISPARADA EM PRIMEIRO', 86, T('madeira'), T('oitenta'), True)
barra(950, 'canela', 'ESPECIARIAS QUENTES', 'CANELA, PIMENTA, CARDAMOMO', 72, T('especiarias'), T('especiarias') + 0.2)
barra(740, 'lavanda', 'ERVAS', 'LAVANDA E ALECRIM', 78, T('ervas'), T('ervas') + 0.2)
el(tag('😌 DEIXA ELA MAIS CONFORTÁVEL', 'ama', 36), centro(1180), T('confortável'), t1, 'pop', 'pop_leve', .3)
el('votos das mulheres · pesquisa Showers To You × Fragrantica', dict(top='1390px'), T('madeira'), t1, 'fade', cls='fonte')

# ---------- BAUNILHA (estudo de 2022)
t1 = S['bau2']
el(tag('🎯 SENDO MAIS ESPECÍFICA', 'cre', 36), centro(280), S['bau'] + 0.05, S['hype'], 'pop', 'whoosh_rapido', .28)
el('O MAIS SIMPLES DE TODOS', dict(top='385px', fontSize='70px'), T('mais simples'), S['hype'], 'up', cls='nome')
el('<div class="estudo"><b>📚 ESTUDO DE 2022</b><span>225 pessoas de 9 povos diferentes do mundo</span><small>Karolinska Institutet · revista Current Biology</small></div>',
   pos(110, 500), T('estudo'), t1, 'pop', 'click_ui', .35)
el('<div class="baun"><img src="notas/baunilha.png"></div>', centro(790), T('baunilha'), S['hype'], 'pop', 'shine_brilho', .3)
el('BAUNILHA', dict(top='1010px', fontSize='120px'), T('baunilha') + 0.1, S['hype'], 'pop', 'impact_grave', .25, cls='big')
el(tag('🏆 NO TOPO DOS CHEIROS MAIS AGRADÁVEIS', 'ama', 34), centro(1160), T('topo'), t1, 'pop', 'ding_acerto', .3)
el(tag('🔥 QUENTE', 'pim', 40), pos(170, 1160), T('quente,'), S['hype'], 'pop', 'pop_leve', .3)
el(tag('🍦 CREMOSA', 'cre', 40), pos(560, 1160), T('cremosa'), S['hype'], 'pop', 'pop_leve', .3)
el(tag('🫶 GRUDA NA PELE', 'ama', 40), centro(1280), T('gruda'), S['hype'], 'pop', 'shine_brilho', .28)

# ---------- HYPE
t1 = S['fim']
el(tag('😅 O MAIS ENGRAÇADO', 'cre', 36), centro(280), S['hype'] + 0.05, t1, 'pop', 'whoosh_rapido', .28)
el('POUCOS CARAS<br>USAM ISSO', dict(top='390px', fontSize='76px'), T('poucos'), t1, 'up', 'boing_cartoon', .2, cls='nome')
el('PRÓXIMO<br>HYPE 🔥', dict(top='600px', fontSize='120px'), T('próximo hype'), t1, 'pop', 'impact_grave', .28, cls='big')
for k, (fr, tx) in enumerate([('forte,', '💪 MAIS FORTE'), ('caro', '💸 MAIS CARO'), ('hypado', '📈 MAIS HYPADO')]):
    el(tag(tx, 'out', 38), centro(920 + k * 115), T(fr, S['hype']), t1, 'pop', 'pop_leve', .3)

# ---------- FIM: chamada do próximo vídeo (gatilho de curiosidade)
el(tag('⏭️ NO PRÓXIMO VÍDEO', 'pim', 36), centro(270), S['fim'] + 0.05, END + 1, 'pop', 'whoosh_rapido', .28)
el('3+ PERFUMES', dict(top='380px', fontSize='130px'), T('três perfumes'), END + 1, 'pop', 'impact_grave', .28, cls='big')
el(tag('💘 DO GRUPO QUE ATRAI AS MULHERES', 'ama', 36), centro(560), T('nesse grupo'), END + 1, 'pop', 'pop_leve', .3)
for i in range(3):
    el('<div class="mq" style="position:relative">?</div>', pos(540 - 250 + i * 250 - 75, 690), T('mulheres', S['fim']) + i * 0.1, END + 1, 'pop', 'pop_leve' if i == 0 else None, .3)
el(tag('📌 PRA NÃO PERDER A LISTA', 'out', 36), centro(1000), T('perder'), END + 1, 'pop')
el(tag('👉 SEGUE A @VALOTAPARFUM', 'cre', 40, 'font-family:GB;padding:20px 40px 14px'), centro(1120), T('segue'), END + 1, 'pop', 'click_ui', .4)
FX.append((T('segue') + 0.3, 'plim_brilho_magico', .3))

# ---------- fundos (notas flutuando) e cenas
SC = [['capa', 0, S['c1'], '#D49A4E'], ['pesq', S['c1'], S['g1'], '#7FA8A1'], ['g1', S['g1'], S['g2'], '#9C452A'], ['g2', S['g2'], S['res'], '#D49A4E'],
      ['res', S['res'], S['bau'], '#B98A5A'], ['bau', S['bau'], S['hype'], '#D49A4E'], ['hype', S['hype'], S['fim'], '#9C452A'], ['fim', S['fim'], END + 1, '#D49A4E']]
BGL = dict(capa=['madeira', 'baunilha', 'ambar', 'lavanda'], pesq=['madeira', 'lavanda', 'canela', 'baunilha', 'ambar', 'almiscar'],
           g1=['almiscar', 'ambar'], g2=['baunilha', 'ambar', 'almiscar', 'madeira'], res=['madeira', 'lavanda', 'alecrim', 'canela'],
           bau=['baunilha', 'caramelo', 'ambar'], hype=['ambar', 'madeira'], fim=['madeira', 'baunilha', 'lavanda', 'ambar', 'alecrim', 'canela'])
BGS = [[BGL[k], (a if a > 0 else -1), b] for k, a, b, _ in SC]
TROCAS = [S[k] for k in ['c1', 'c1b', 'g1', 'g2', 'res', 'bau', 'hype', 'fim']]
for k in ['g1', 'g2', 'res', 'bau', 'hype', 'fim']: FX.append((S[k], 'whoosh_suave', .3))

# ---------- legenda (obrigatória do começo ao fim)
NOMES = {'madeira', 'baunilha', 'lavanda', 'alecrim', 'especiarias', 'quentes', 'mulheres', 'memoria', 'hype', 'hypado', 'valota', 'parfum', 'tres', 'mil', 'setecentas',
         'oitenta', 'seis', 'cento', '2022', 'cremosa', 'cerebro', 'saturado', 'enjoativo', 'grupos'}
def nome(i): return NW[i] in NOMES
grupos, cur = [], []
for i, w in enumerate(W):
    cand = ' '.join([W[j]['word'] for j in cur] + [w['word']])
    if cur and (len(cand) > 20 or re.search(r'[.?!,]$', W[cur[-1]]['word'])): grupos.append(cur); cur = []
    cur.append(i)
grupos.append(cur)
CON = {'da', 'do', 'de', 'dos', 'o', 'a', 'no', 'na', 'e', 'com', 'pra', 'um', 'uma', 'por', 'que', 'em', 'sem', 'pro', 'nao', 'pelo', 'tipo', 'as', 'os', 'se', 'ja', 'mas', 'so', 'num', 'nem', 'ao'}
for k in range(len(grupos) - 1):
    while len(grupos[k]) > 1 and NW[grupos[k][-1]] in CON and not re.search(r'[.?!,]$', W[grupos[k][-1]]['word']):
        grupos[k + 1].insert(0, grupos[k].pop())
LEG = [{'t0': round(W[g[0]]['start'] - ADI, 3), 't1': round((W[g[-1] + 1]['start'] - ADI) if g[-1] + 1 < len(W) else FIM + 0.4, 3),
        'p': [{'w': re.sub(r'[.,?!]', '', W[j]['word']), 'h': nome(j)} for j in g]} for g in grupos]
LEG[-1]['t1'] = END + 1
for g in LEG: assert len(' '.join(x['w'] for x in g['p'])) <= 28, g

FX = [f for f in FX if f[1]]
FX.sort()
sfx = [{'file': f'../../biblioteca_audio/efeitos/{f}.mp3', 't': round(t, 3), 'volume': v} for t, f, v in FX]
for s in sfx:
    if not os.path.exists(P + s['file']): raise SystemExit('efeito não existe: ' + s['file'])

D = dict(TEMA='petroleo', S=S, FIM=FIM, END=END, LEG=LEG, CAPA=CAPA, ELS=ELS, BGS=BGS, SC=SC, TROCAS=TROCAS)
html = open(P + 'template.html').read().replace('/*DADOS*/', 'window.D=' + json.dumps(D, ensure_ascii=False) + ';')
open(P + 'index.html', 'w').write(html)
json.dump({'narracao': {'file': 'narracao_175.wav', 'volume': 1}, 'sfx': sfx}, open(P + 'audio_map.json', 'w'), indent=1)
print('fim fala', FIM, '| END', END, '| legendas', len(LEG), '| elementos', len(ELS), '| sfx', len(sfx))
print({k: round(v, 2) for k, v in S.items()})

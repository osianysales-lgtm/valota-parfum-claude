# Molde "guia de carrossel" · narração petróleo ESCURO (v67, 21/11/2026)
Carrossel de N perfumes (árabe + grife que ele lembra) virando vídeo narrado.
- Capa = foto que a Osiany manda, chamada no TOPO dentro do recorte 3:4 do feed (y 240–1680), foto encolhida (860 px) com laterais em desfoque escuro. `capa.html` + `snap_capa.js`.
- Cena por perfume: "Nº LUGAR" dourado, nome GB + marca âmbar, frasco do árabe à esquerda com brilho, card da grife à direita ("LEMBRA O"), linha de 3–5 notas que entram na palavra, pílulas ocasião (linha 1) + fixação/preço (linha 2), legenda discreta MV 600 42 px com nomes em amarelo (nunca termina em "da/no/a").
- Fundo mais escuro (petróleo → noite → preto + vinheta), fumaça tingida pela família, notas do perfume flutuando no fundo.
- CTA do grupo no meio (grupo.png), ponta solta com silhueta "?" do 1º, carimbo de volta do gancho, CTA final com os frascos.
- Fluxo: voz.js → cortar_pausas_energia.py (VEL=1.75) → `python3 gen.py` → `node snap.js t1 t2…` → `node qa.js` → plano.js preparar/aprovar → daphne `--workers 2` → loudness −14.
- Frascos: os árabes saíram melhores recortados da PRÓPRIA imagem da capa dela (recortar-objeto.swift com o ponto no centro do crop); grifes = Fragrantica jpg + BiRefNet (tools/recorte.js).

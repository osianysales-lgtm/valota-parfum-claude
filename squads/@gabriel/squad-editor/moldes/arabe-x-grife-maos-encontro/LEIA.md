# Molde ÁRABE VS GRIFE · mãos se encontrando (1º uso: v54, 17/11/2026, aprovado "agora sim pode fazer")
1. Fundo: a Osiany manda uma foto de cenário. Ela gera no Gemini (Nano Banana) a dupla 01 com o prompt base e depois TODAS as outras com PROMPT-GEMINI.txt, sempre anexando a 01 como base (base encadeada quadricula a mão).
2. Pedir também o CENÁRIO VAZIO (01 sem mãos/frascos) → cenario_vazio.jpg. Juntar as 9 imagens pra montar o fundo NÃO funciona (sobram dedos/tampas).
3. Copiar estes arquivos pra output/vN/ + fontes/ (Montserrat-VariableFont_wght.ttf, ExtraBold, Bold, GothamBlack) + avatar.png.
4. Recortes: swift direcao-de-arte/ferramentas/recortar-objeto.swift imagens/NN-*.jpg recortes/NN.png (pega as 2 mãos + frascos, sem a mulher). Conferir em magenta: tampa preta em fundo escuro some (Corium) → somar retângulo na máscara.
5. <venv numpy+pillow+scipy>/bin/python camadas.py → camadas/NN_fundo.jpg (buraco + reflexo preenchidos pelo cenário vazio), NN_esq.png, NN_dir.png.
6. Editar DUPLAS no gen.py (ordem grife mais cara → mais barata), python3 gen.py → index.html → plano.json → aprovação → node daphne.js output/vN/index.html <END> --out ... --workers 2.
Letra (pedido dela): estilo do reel DfzhFuNzIgK — "ÁRABE VS GRIFE" Montserrat 800 creme apagado, rótulo ÁRABE/GRIFE pequeno espaçado, R$ pequeno + número grande + centavos no alto, nome caixa alta fino. NADA de pílula/amarelo ("letra bruta"). Texto logo acima dos frascos (pode tampar a mulher).

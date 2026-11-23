# Molde MELHOR · ACESSÍVEL · ORIGINAL (1º uso: v48, 17/11/2026) — narração, fundo petróleo
Inspiração: Downloads/ClaudCode/original. acessivel/inspiracao.mp4 (4 trios, frascos entram 1 por vez: original → acessível → melhor).
Tela: faixa fixa MELHOR · ACESSÍVEL · ORIGINAL (colunas esq/meio/dir) · linhas âmbar descem até o frasco · mãozinha desenhada aponta
o frasco da vez e "toca" na palavra · MELHOR acende amarelo + halo + raios + brilho. Sem legenda corrida.
CTA no meio: frascos tremem no "calma", a tela encolhe num card ("nesse formato") + SEGUE A VALOTA PARFUM + SALVA ESSE VÍDEO.
Fluxo: tools/voz.js (roteiro_voz.txt) → aprovar voz → VEL=1.5 python3 moldes/narracao-tipos-petroleo/cortar_pausas.py output/vN/
  (renomear narracao_175.wav → narracao_150.wav; atempo 1.65 → narracao_165.wav) → frascos/ recortados (Bing + recortar-fundo-branco.swift;
  frasco BRANCO → recortar-objeto.swift) → VEL=1.5 python3 moldes/melhor-acessivel-original/gen.py output/vN/ → daphne --quadros → plano → daphne.
gen.py: TRIOS com índice da palavra de entrada e da palavra-rótulo (chk confere a palavra); trocar ao mudar o roteiro.

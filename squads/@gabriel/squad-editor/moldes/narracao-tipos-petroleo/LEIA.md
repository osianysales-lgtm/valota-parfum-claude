# Molde NARRAÇÃO "TIPOS" PETRÓLEO (1º uso: v47 "5 tipos de pessoa que usam perfume / olha pro seu frasco", 16/11/2026)
Vídeo de identificação ("existem N tipos… qual é você?"): fundo petróleo, gancho fixo + FOTO REAL no gancho → N silhuetas borradas + "?" (o mais raro)
→ 1 tela por tipo: barra de progresso 1..5,? no topo · FOTO REAL em miniatura (card creme inclinado) + FRASCO DESENHADO ao lado
(quase_vazio, dez_anos, estante, presente, sumiu, raro, muitos) · "TIPO N" + nome revelado na palavra · pílulas sinal (contorno) → dica (amarela)
→ ponte → fecho → CTA com foto (compartilha → link da bio → segue) → assinatura.
Fluxo: tools/voz.js → cortar_pausas.py (VEL=1.75 gera narracao_175.wav; fazer também atempo 1.65 → narracao_165.wav se ela pedir versão lenta)
→ VEL=1.75 python3 gen.py output/vN/ (gera index_175.html + audio_map_175.json) → daphne --quadros pra revisar → plano → daphne.
Fotos: media-use resolve (banco grátis); miniatura aceita foto de 540–800 px. Borrar marca visível (sharp extract+blur).

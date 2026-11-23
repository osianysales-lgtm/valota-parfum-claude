---
name: texto-tela-feed-e-fonte-referencia
description: Texto na tela tem que caber no recorte 3:4 da grade/feed (y 240–1680 em 1080x1920) e ser grande; letra = idêntica à da referência (reel com letra CapCut/TikTok = TikTok Sans branca com contorno preto)
metadata:
  node_type: memory
  type: feedback
  originSessionId: fb595251-2f13-4f4f-a0d2-3c6db8424dcd
  modified: 2026-11-22T15:44:30.575Z
---

22/11/2026, v71: ela pediu "a legenda pode ser um pouco maior, fácil de ler, pensa no feed" e "a letra precisa ser mais idêntica ao do vídeo, modificou um pouco". Eu tinha usado Montserrat com sombra no lugar da letra do reel, e o texto ficava em y~150, fora do recorte da grade do perfil.

**Why:** a capa e o começo do reel aparecem cortados em 3:4 na grade (e 4:5 no feed); texto fora disso some. E quando ela manda referência, a letra conta como parte do "igual dele".

**How to apply:** todo texto fixo na tela fica entre y≈260 e o rosto, conferido com as linhas de recorte 3:4 (y 240/1680) e numa prévia recortada. Letra da referência: ampliar o texto do reel, identificar e usar a mesma. A letra padrão de CapCut/TikTok = **TikTok Sans** (Google Fonts, variável; peso ~720, branca, contorno preto ~4 px, sem sombra), salva em `squad-editor/output/v71-perfume-horario-errado/fonts/TikTokSans-VF.ttf`. No Pillow, o stroke não funciona com fonte variável: fazer o contorno com MaxFilter na máscara. Ver [[letra-neutra-arabe-vs-grife]] e [[gancho-escrito-fixo-na-tela]].

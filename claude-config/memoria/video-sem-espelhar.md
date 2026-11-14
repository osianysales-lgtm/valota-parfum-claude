---
name: video-sem-espelhar
description: "Vídeos gravados da Osiany (câmera frontal) ficam SEM espelhar: nunca aplicar hflip, mesmo com rótulo/camiseta invertidos"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ccc14cb6-8e48-4b0a-91d1-e3f97138b35c
  modified: 2026-11-10T14:19:19.140Z
---

Em todo vídeo gravado pela Osiany (câmera frontal do iPhone), manter a orientação original da gravação: **não aplicar hflip**. A camiseta e os rótulos dos frascos aparecem invertidos, e é assim que ela quer.

**Why:** em 10/11/2026 (v15-academia) eu espelhei o vídeo para deixar os rótulos legíveis. Ela mandou um print do bruto e pediu para "inverter o lado", e depois: "é para você fazer isso em todos os vídeos".

**How to apply:** no corte (ex.: `montar.py`), o filtro de vídeo vai sem `hflip`. Se o nome do perfume precisar ficar legível, isso fica a cargo da cartela/legenda, não do espelhamento. A regra antiga da [[valota-instagram-direcao-de-arte]] (hflip no frame do rosto para capa) vale só para capa estática, e mesmo assim vale confirmar com ela. Ver também [[video-nao-cortar-cheirando-perfume]].

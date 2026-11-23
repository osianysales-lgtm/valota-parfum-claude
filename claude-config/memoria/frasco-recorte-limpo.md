---
name: frasco-recorte-limpo
description: "Frasco recortado tem que sair sem sobra de fundo (halo, faixa, pedaço do cenário); conferir em fundo magenta antes de usar"
metadata:
  node_type: memory
  type: feedback
  originSessionId: db829d34-e7ae-4db5-9ad3-395783257f69
  modified: 2026-11-15T06:40:10.830Z
---

Em 15/11/2026, no v36 (perfume pro trabalho), a Osiany pediu "recorta direito esse frasco": o Heaven da Maison Viegas tinha vindo de uma foto com fundo de aquarela azul, e o recorte automático deixou sobra branca na tampa e uma faixa azul na base.

**Why:** frasco com borda suja deixa o vídeo com cara de amador, e ela repara.

**How to apply:**
- Todo recorte de frasco passa por uma conferência em fundo magenta (e no fundo do vídeo) antes de entrar na cena.
- Quando o fundo da foto é colorido ou texturizado, usar máscara geométrica (tampa, gargalo e corpo), como em `squad-editor/output/v36-perfume-pro-trabalho-narracao-na1/fotos/mascara_heaven.js`.
- Também tirar ingrediente ou caixa que vier junto, cortando a área.
- Ver [[sistema-templates-por-formato]] (recorte com halo no CA2) e [[video-cenas-adultas-pouco-texto]].

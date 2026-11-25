---
name: emoji-nitido-sem-contorno
description: "24/11 v83: emoji da referência (Instagram) \"ficou muito ruim\" — usar Apple Color Emoji nítido, um pouco menor que a letra e sem contorno preto"
metadata:
  node_type: memory
  type: feedback
  originSessionId: df091731-5a6d-4daa-86d2-9da56f00abd4
  modified: 2026-11-24T22:10:16.769Z
---

No v83 (Bleu de Chanel "igual IPhone", ref Dfc0xdIpIkA), ela pediu a letra e o texto iguais aos da referência, mas: "deixa os emoji mais de boas, o emoji dela ficou muito ruim". Na ref, os emojis do Instagram saíram serrilhados e com o contorno preto do texto em volta.

**Why:** emoji borrado ou com contorno deixa a peça com cara de amadora, mesmo quando a letra está igual.

**How to apply:** em texto copiado de referência, renderizar os emojis com Apple Color Emoji no Puppeteer, em ~0,6em da letra, sem stroke (escondidos na camada preta do contorno), como no `output/v83-bleu-de-chanel-igual-iphone/gerar.js`. LETRA (decisão final 24/11): o "efeito" era a **letra curvada viralizada do app Edits** (tutorial ref DYCzqY8h8l2): fonte **Advercase** + efeito de texto **"Olho de peixe"** (o meio da frase estufa e as pontas encolhem e curvam). Ela confirmou: "isso, usa essa fonte e esse efeito". A Advercase é paga (US$ 15 MyFonts, Indieground) e não está no Mac; enquanto ela não comprar, uso Instrument Serif + olho de peixe feito no gerar.js do v83 (OLHO k 0,11, elipse rx 1,04/ry 1,7), branca com contorno preto por letra. Os emojis NÃO levam o olho de peixe ("não precisa deixar os emoji com todo esse efeito"): ficam retos e só acompanham a posição do fim da frase. Se o fundo atrás do texto for escuro, o contorno some: subir o texto pra área clara (v83 y 17,5%). Antes disso eu errei 3 vezes ("onda respirando", Montserrat esticada, serifada sem efeito), então quando ela falar em "efeito da letra", pedir/olhar o nome do efeito no Edits/CapCut. Emenda de tomadas = corte seco (dissolve reprovado). Ver [[video-referencia-letra-sons-dedo]].

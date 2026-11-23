---
name: capa-foto-dela-frasco-em-pe
description: "22/11 v74 Liquid Brun: capa com foto dela = frasco recortado EM PÉ no centro, foto desfocada no fundo, chamada centralizada no topo; foto deitada + texto à esquerda foi reprovada"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 8a465964-be60-4fef-8bd9-3584c0361fe1
  modified: 2026-11-22T20:10:19.534Z
---

No v74 (carrossel @homemcheirosoreal "Não compre o Liquid Brun" → avatar AV1) ela mandou uma foto flat-lay (frasco deitado na diagonal, notas em volta, veludo vinho) pra usar de capa. A 1ª versão usava a foto inteira em cima, com a chamada alinhada à esquerda por cima do frasco, e ela respondeu "a capa eu não gostei muito, você consegue melhorar". Mandei 2 opções e ela escolheu a **A**: o fundo é a própria foto com blur 18 px e brilho .62, o frasco foi recortado da foto (BiRefNet), girado pra ficar em pé (eixo principal medido pelo alfa) e posto no centro com um brilho âmbar atrás. As notas recortadas da foto ficam em volta, a chamada centralizada no topo (y≈305: branco Gotham 128 + nome em dourado degradê + pílula amarela) e os sinais de proibido neon fazem um par simétrico ao lado do frasco. A opção B (fundo petróleo) perdeu.

**Why:** texto fora do centro e frasco cortado atrás do texto parecem desarrumados ([[video-layout-encaixado-centralizado]]); com o frasco em pé e grande a capa fica nítida no feed.

**How to apply:** quando a capa vier de uma foto dela com o frasco deitado ou torto, recortar o frasco e pôr em pé no centro sobre a própria foto desfocada; chamada centralizada dentro do recorte do feed ([[texto-tela-feed-e-fonte-referencia]]). Molde: `squad-editor/output/v74-liquid-brun-5-coisas-avatar/capa.html` + template.html (capa + notas flutuando no fundo + AV1).

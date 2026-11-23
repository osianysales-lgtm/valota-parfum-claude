---
name: template-carrossel-em-video-v53
description: "'Nosso template / estilo do nosso carrossel' em VÍDEO = fundo do v53 (7 Club de Nuit): petróleo + fumaça tingida + notas flutuando desfocadas; molde em v73"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b3de42b8-de11-4561-865f-890a419e7b39
  modified: 2026-11-22T19:35:19.700Z
---

Em 22/11/2026 ela pediu um vídeo igual ao reel Df93Xk7x9oG (9 frascos em 3 fileiras AMADEIRADO / ASSINATURA / ENCONTROS), "só muda o fundo, usa o nosso template e coloca algumas notas no fundo, estilo aquele do nosso carrossel". No meio do trabalho ela explicou: "o carrossel que estou falando é quando peço pra criar um vídeo de um carrossel" e "quero o template igual o do 7 Club de Nuit" (v53, Guia do Club de Nuit).

**Why:** ela chama de "carrossel" o formato de vídeo que vira carrossel em vídeo (v53/v67), não os carrosséis de imagem.

**How to apply:** quando ela falar em "nosso template" ou "notas no fundo estilo carrossel" num vídeo, usar fundo petróleo radial (Luz no centro → Noite), fumaça tingida (Cedro em cima, verde-petróleo no meio, Âmbar embaixo), 8–10 notas recortadas desfocadas (blur 2,2 px, opacidade ~0,32) que flutuam devagar, e vinheta. A pasta do v53 sumiu; o molde que está valendo é `squads/@gabriel/squad-editor/output/v73-amadeirado-assinatura-encontros/` (template.html + gerar.js, com máscaras de fumaça geradas e notas em notas/). Também existe o `moldes/guia-carrossel-petroleo-escuro` (v67, mais escuro). Letra da ref Df93Xk7x9oG = Barlow Condensed ExtraBold Italic branca com contorno preto. Ver [[referencia-igual-nao-perguntar]] e [[formato-viral-frascos-so-musica]].

**22/11, ajuste dela ("ajusta um pouco a fumaça"):** na 1ª versão a fumaça quase não aparecia. Ficou aprovada para render com a máscara mais contrastada (feColorMatrix alfa `4 -1.55`) e opacidade de 0,50 em cima (#a07c60), 0,36 no meio (#7fb0a8) e 0,42 embaixo (Âmbar): fumaça visível de leve em volta dos frascos, sem tampar nada.

**22/11, frascos flutuando:** depois de pronto, ela pediu "os perfumes como se tivessem flutuando, algo sutil, nada agressivo". Ficou assim no v73: cada frasco sobe e desce 7 px e balança 0,8°, cada um num tempo diferente. O período é de 3,35 s, então são 2 ciclos exatos no reel e o loop não dá pulo. Isso vale só para este vídeo; nos próximos, perguntar ou oferecer ([[nao-generalizar-ajuste-de-uma-saga]]).

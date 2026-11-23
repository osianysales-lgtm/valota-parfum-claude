---
name: video-prints-prova-social-legiveis
description: "Prints de depoimento/prova social em vídeo: todos legíveis, devagar, em FEED descendo (um embaixo do outro, nunca empilhados), frase de insegurança em destaque; início com prints reais, nunca simulação de conversa"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 22ef726a-2c48-453b-8296-32df1432a8b4
  modified: 2026-11-15T16:09:39.925Z
---

No v39 (golpe do árabe falso, 15/11/2026) ela reprovou a 1ª versão: os prints "passavam rápido" e caíam um em cima do outro. Pediu:
- **Mostrar TODOS os prints das pessoas, sem passar nenhum rápido.** Cada um precisa dar tempo de ler.
- **Nada de um em cima do outro:** os comentários vão **descendo como um feed** (um embaixo do outro, largura ~1000 px, e a coluna rola pra cima quando não cabe). O print que entra fica aceso e os anteriores ficam a ~60%.
- **Ênfase na insegurança das pessoas:** a frase-chave de cada print aparece grande no topo, entre aspas, com a parte forte em Pimenta ("PRECISEI DEVOLVER", "O BARATO SAI CARO").
- **Início já com prints reais**, que impactam desde o 1º quadro. Nada de simulação de conversa de grupo ou chat inventado.
- Quando a fala não dá tempo pros prints, inserir **pausas na narração** (`pausas_prints.py` do v39) em vez de acelerar os prints.

**Why:** "são muitos depoimentos, tem que dar tempo de mostrar todos tranquilamente"; "quero ênfase maior nas pessoas falando inseguras".

**How to apply:** em todo vídeo com prova social (comentários, depoimentos, notícias), partir da cena `coment` do `squads/@gabriel/squad-editor/output/v39-golpe-arabe-falso-grupos-narracao-na2/body.js`. No v39 ela também pediu a narração **um pouco mais lenta (1,6x)**, mas isso valeu SÓ para esse vídeo ([[nao-generalizar-ajuste-de-uma-saga]]); o padrão segue 1,75x ([[voz-velocidade-padrao]]). Ver [[cta-grupo-whatsapp-ofertas]].

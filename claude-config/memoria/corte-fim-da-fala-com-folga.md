---
name: corte-fim-da-fala-com-folga
description: "23/11 v75: corte de take não pode comer o fim da última palavra (\"Natura\" saiu cortado); medir o fim real da voz pelo volume e deixar ~0,25 s de folga"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1f756014-c058-40ce-9daf-df3dd2bffa1f
  modified: 2026-11-23T19:30:17.066Z
---

No v75 (melhor clone da Natura), ela reclamou: "tem alguns que o corte termina antes de eu falar Natura por completo". Eu tinha usado o fim da palavra do Whisper e uma leitura grosseira do volume; o take 2 terminava a voz em 7,76 s e eu cortava em 7,50.

**Why:** a vogal final arrastada ("Naturaaa") fica abaixo do limiar que eu usava e o Whisper marca o fim cedo demais; cortado, soa amador.

**How to apply:** em todo corte de take dela, imprimir o volume em dB a cada 20 ms no fim da frase e achar onde cai abaixo de ~-40 dB; cortar 0,25 s depois disso (com fade de 30 ms). Depois do render, transcrever cada trecho do final e conferir que a última palavra termina ≥ 0,2 s antes do corte. Ver [[video-nao-cortar-cheirando-perfume]] e [[video-fim-take-braco-e-cortes-calmos]].

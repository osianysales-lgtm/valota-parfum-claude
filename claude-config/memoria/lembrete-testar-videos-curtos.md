---
name: lembrete-testar-videos-curtos
description: Lembrar a Osiany de testar vídeos de 15–30 s quando vários vídeos seguidos saírem com 50 s a 1 min
metadata:
  node_type: memory
  type: feedback
  originSessionId: cfe3d1df-cb2b-4890-ba70-903b2b593292
  modified: 2026-11-11T22:36:25.367Z
---

Quando vários vídeos seguidos (3 ou mais) saírem com **50 s a 1 min**, avise a Osiany que vale a pena **testar um vídeo de 15 a 30 s**. Faça o aviso a cada vez que isso acontecer.

**Why:** em 11/11/2026 ela leu no guia de Reels que vídeos de 15–30 s têm viralizado mais. Ela nunca testou e pediu: "me lembra quando os vídeos foram só de 50 segundos a 1 minuto demais, toda vez". O padrão dela hoje é 45–60 s (vencedor #1 ≈ 51 s, voz a 1,3x).

**How to apply:**
- Antes de pedir copy ou roteiro de vídeo, olhe a duração dos últimos vídeos (`squad-editor/output/v*` e o campo "Duração alvo" em `copy-viral-perfumes/output/videos/`).
- Se os 3 últimos ou mais tiveram 45–60 s, abra a resposta com o lembrete e ofereça uma versão curta de 15–30 s (≈ 65–130 palavras no ritmo do v24, ~4,3 palavras/s). É só um teste sugerido: não troque a duração sem ela aceitar.
- Quando ela testar, registre o resultado em `vencedores.md`.
- Também está na Helena (`diretora-pauta.agent.md`).
- Ver [[voz-velocidade-padrao]] e [[cta-final-indicacao-perfume]].

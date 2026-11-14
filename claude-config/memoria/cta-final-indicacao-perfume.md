---
name: cta-final-indicacao-perfume
description: "CTA padrão 13/11/2026: fala termina em \"Segue a Valota Parfum pra mais dicas e achados de perfumaria.\"; legenda em \"Siga @valotaparfum para mais dicas e achados de perfumaria.\"; salva (indicação/dica), compartilha (engraçado), comenta quase nunca"
metadata:
  node_type: memory
  type: feedback
  originSessionId: bf8dc2b3-68fd-45f1-9697-9ee042037b1f
  modified: 2026-11-13T12:55:24.090Z
---

**CTA padrão desde 13/11/2026** (vale só para conteúdo novo; não refazer carrossel/avatar pronto — ver [[regra-nova-vale-pros-proximos]]).

**Fala final** (narração, avatar, criativo): termina SEMPRE em "Segue a Valota Parfum pra mais dicas e achados de perfumaria." Na fala é "segue", sem "arroba" (ela confirmou: "coloca segue, era só pra acrescentar o pra").
- Indicou perfume (vale o frasco, comparativo de preço com um bom, ranking, top, indicação por ocasião): "Salva esse vídeo pra não esquecer. Quer ficar cheiroso sem pagar preço de grife? Segue a Valota Parfum pra mais dicas e achados de perfumaria." O "Quer ficar cheiroso…" CONTINUA.
- Copy engraçada: "Compartilha com alguém que você quer ver cheiroso e segue a Valota Parfum pra mais dicas e achados de perfumaria."
- Dica/curiosidade: "Salva esse vídeo pra não esquecer e segue a Valota Parfum pra mais dicas e achados de perfumaria."
- Carrossel: "esse vídeo" vira "esse post". O slide final desenhado "SALVA ESSE POST" (carrossel-lista/gerar.py → slide_final) continua.

**Legenda**: última linha antes das hashtags = "Siga @valotaparfum para mais dicas e achados de perfumaria." (substitui "Siga: @valotaparfum"), com "Salva pra não esquecer e…" em indicação/dica e "Compartilha com alguém que você quer ver cheiroso e…" em engraçado. Ver [[legenda-complementa-gancho-1a-linha]].

**"Comenta aqui" é o que menos se usa** (perfil ainda pequeno, pedido de 11/11 e reforçado em 13/11).

**Why:** ela treinou os agentes de copy em 13/11/2026 e pediu que a mudança fosse no plano, nos agentes e na memória.

**How to apply:** a fonte é `ctas.py` (Documentos/Controle de Conteúdo Valota Parfum: FECHO_FALA, CTA_FALA, CTA_LEGENDA). Ele gera `copy-viral-perfumes/conhecimento/ctas.md` via `python3 atualizar_ctas.py --so-md`. A regra também está em estrutura-viral §9, Téo, Nina, Otto (eliminatório), Helena, Lara, squad.yaml regra 7, boas-praticas e carrossel-tweet/ESTRUTURA-DE-COPY.md. Os 155 posts futuros do plano já foram trocados (backup em `dados/backups/plano-antes-cta-padrao-20261113-095355.json`). O fechamento de indicação tem ≈24 palavras, que entram na contagem do roteiro. Ver [[copy-sempre-squad-e-narracao]] e [[nome-valota-parfum]].

**EXCEÇÃO · série de bonecos (14/11/2026, vale pra TODA saga):** fala final (personagem no papel) = "E a parte X sai no próximo episódio aqui com a gente, então segue a Valota Parfum pra/porque [prévia criativa]". **O "aproveita e comenta aqui" é decidido POR SAGA:** fica no "Cobrar pra cheirar" (ela quer comentário lá) e sai da Bidaya (pedido de 14/11 só pra ela). Saga nova: perguntar. A próxima parte sai no próximo episódio DOS BONECOS, não no próximo post (nunca "amanhã"); tela final diz "no próximo episódio dos bonecos 🎬". Pergunta ABERTA com as palavras dela; ela não gostou de "time Rafa ou time Seu Valdir" nem de voto por emoji. Regra em `serie-bonecos.md` §2. Ver [[serie-bonecos-vozes-elenco]].
**+ GATILHO DE CURIOSIDADE (14/11/2026, reforçado: "isso em TODOS os episódios"):** TODO final que pede pra seguir tem que dar VONTADE de ver o próximo vídeo; quando a fala anuncia o próximo episódio, ela tem que dar uma PRÉVIA que gere curiosidade: "segue a Valota Parfum pra saber [o que acontece/quem/por que…] no próximo episódio". A prévia tem que ser cumprida na parte seguinte (nunca prometer o que não vem). Na fala, "no próximo episódio" (nunca "parte dois"). Nunca entregar um "segue a gente" seco, sem motivo pra seguir.

---
name: copy-sempre-squad-e-narracao
description: "Toda copy da Valota Parfum sai do squad copy-viral-perfumes, sempre com narração; perguntar antes se vai ser com avatar (avatar = fala fluida, poucas pausas, com vícios de linguagem)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e7604ba6-8a58-48c3-a898-fca7f70571e2
  modified: 2026-11-11T12:38:55.949Z
---

Toda vez que for escrever copy (roteiro, legenda de vídeo, carrossel), usar a estratégia dos agentes treinados do squad `squads/@valotaparfum/copy-viral-perfumes`: diretora-pauta → perfumista-pesquisador → mestre-ganchos → roteirista → revisor-retencao → apresentadora-visual → copy-distribuicao, com a base em `conhecimento/` (ganchos, estrutura-viral, ctas, vencedores). A copy **sempre leva narração**.

**Antes de escrever, perguntar:** "Esse vai ser com avatar?"

- **Com avatar:** a narração tem que soar como uma conversa de verdade e não parecer robô. Usar frases mais corridas, com **poucos pontos finais e poucas pausas**, e emendar as ideias com vírgula e "e". Colocar **vícios de linguagem naturais** do jeito que brasileira fala, por exemplo "tipo", "né", "gente", "olha", "sabe?", "aí", "então", "assim", "tá?", "pô", "cara". Usar com moderação, sem exagerar a ponto de ficar forçado.
- **Sem avatar** (ela grava): seguir o roteiro normal do squad.

**Why:** em 11/11/2026 ela pediu: "sempre quando for fazer copy usar estratégia dos agentes treinados de copy, sempre com narração, me pergunta se vou usar avatar, porque quando for avatar quero a conversa mais fluida, sem muitos pontos e pausas pra não parecer robô, coloca até alguns vícios de linguagem pra parecer o mais natural possível". Na voz ElevenLabs/HeyGen, cada ponto final vira uma pausa que soa mecânica.

**How to apply:** vale para todo pedido de copy, roteiro ou vídeo. Fazer a pergunta do avatar logo no início, antes de rodar o squad. No caso de avatar, escrever o `roteiro_voz.txt` já nesse estilo fluido e mostrar a ela antes de gerar (ver [[video-avatar-formato]]). Também valem [[nome-valota-parfum]] e [[modelo-que-perfume-e-esse]].

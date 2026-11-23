---
name: video-desenhos-ilustracao-velma
description: "Animação de vídeo = ilustração vetorial de verdade feita pela Velma (motion designer do squad-editor), nunca emoji dentro de círculo; e prévia pra aprovar sempre em TELA INTEIRA com o avatar"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b695c35b-f95b-4f9d-8820-78c21613ef24
  modified: 2026-11-20T14:12:43.018Z
---

No v62 ("O que é oud de verdade", AV2 creme, 20/11/2026), as cenas foram montadas com emoji dentro de círculo (🌳 🚗 🧪 🏋️) e SVG simples. Ela respondeu "MELHORE OS DESENHOS" e "USE MOTION DESIGNER". O vídeo foi refeito com ilustrações vetoriais animadas, só nas cores da cartela e com contorno Petróleo Noite. Exemplos: pessoa andando com rastro âmbar, pessoas virando o pescoço, árvore doente com termômetro, carro com passageiro enjoado, tronco com resina escorrendo, balança com lingotes, frasco de laboratório borbulhando, pesos de academia, termômetro subindo e pirâmide 3D. Depois ela aprovou com "MANDA BALA".

**Why:** emoji em círculo parece amador. Ela quer um motion de editor profissional, em que o desenho explica a frase.

**How to apply:**
- "Motion designer" = a **Velma** (`squads/@gabriel/squad-editor/agents/velma.agent.md`). Seguir as regras dela:
  - nenhum texto abaixo de 32 px;
  - alternar cenas de lettering com cenas de ilustração;
  - toda tela com movimento vivo (balanço, bolhas, rodas girando).
- Molde das ilustrações: `squad-editor/output/v62-o-que-e-oud-avatar-av2/template.html`. Tem funções SVG prontas: pessoa, busto, árvore, carro, tora, balança, frasco, balão de laboratório, kettlebell, termômetro, pirâmide e ícone de salvar.
- Emoji só como detalhe pequeno (chip, painel), nunca como a ilustração principal da cena.
- O storyboard do `tools/plano.js` mostra só o topo da tela. Ao ver isso, ela achou que estava sem avatar ("EU QUERO COM AVATAR"). **Sempre mandar junto uma prévia em TELA INTEIRA com o avatar** (`snap.js` + folha). Ver [[video-avatar-formato]] e [[sistema-templates-por-formato]].

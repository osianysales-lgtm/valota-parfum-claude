---
name: template-veredito-selo-capa
description: "Template fixo do episódio de veredito (HU Vale o Frasco) — selo amarelo/Pimenta na capa junto com o gancho, ~10 s, sem cobrir nada"
metadata:
  node_type: memory
  type: project
  originSessionId: b5ccaf27-4180-4985-89d5-69c2988b6152
  modified: 2026-11-12T15:21:41.076Z
---

Episódio de veredito (ex.: Glitch parte 2, v22) = template fixo. Só muda o selo: **amarelo "VALE O FRASCO"** (aprovado) ou **Pimenta #9C452A "NÃO VALE O FRASCO"** (reprovado — é o "vermelho" da paleta). No v22/gen.js é a chave `const VEREDITO = 'vale' | 'nao'`.

- Gancho (card Petróleo, 70,110, 940x250) + selo ficam presos desde o 1º quadro (capa) até a entrada do bloco seguinte (~9,5 s, "9H").
- Selo da capa: 220 px, lateral direita ao lado da cabeça (x 846, y 560), sobre a parede/quadro — não cobre rosto, gancho, chips nem legenda.
- Chips do começo descem pra baixo do gancho (y ≥ 380) enquanto ele está na tela.
- O selo grande do fim e o chip do veredito seguem a mesma cor.

**Why:** pedido da Osiany em 12/11/2026 pra virar template fixo de veredito; já previsto no DIRECAO-DE-ARTE.md (HU · Vale o Frasco).
**How to apply:** em todo vídeo de veredito, copiar o layout do v22 e só trocar `VEREDITO`. Ver [[sistema-templates-por-formato]] e [[gancho-escrito-fixo-na-tela]].

---
name: jose-inspetor-frascos
description: "24/11: ela pediu o JOSÉ (agente inspetor) pra SEMPRE verificar os frascos antes de mandar qualquer coisa pra ela; nada com frasco sai sem o José aprovar"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0eecaf3a-f264-48cd-94b9-0017a154e307
  modified: 2026-11-24T17:24:35.168Z
---

Em 24/11/2026, depois de mais uma bronca por recorte ("melhore o recorte dos frascos", carrossel Black Friday), ela pediu: "quero que você crie o José para sempre verificar os frascos antes de me mandar, porque quero tudo perfeito, antes de mandar o José tem que verificar".

**Why:** foi a 4ª bronca por recorte (18/11, 19/11, 23/11 e 24/11). Ela não quer ser a pessoa que acha o defeito.

**How to apply:**
- Toda peça com frasco recortado (vídeo, carrossel, capa, storyboard, prévia) passa pelo José ANTES de ir pra ela.
- O José é o subagente `.claude/agents/jose.md` e a ferramenta `squads/@gabriel/squad-editor/tools/jose.js`: `node tools/jose.js --fundo <cor> --out <pasta> frascos...`. Ela gera a folha ampliada (900 px, no fundo da peça e no magenta), o zoom de tampa e base e um relatório automático de halo, corte reto, pedaços soltos e resolução.
- Abrir a folha e os zooms e olhar um por um. Só mandar com todos ✅.
- Na mensagem pra ela, avisar em uma linha que "o José conferiu os frascos".
- Consertos que funcionaram estão em [[recorte-frasco-perfeito]] e [[frasco-recorte-limpo]].
- Em 24/11 a Yara tinha uma "mordida" da caixa, resolvida espelhando o alfa pelo centro. O 9pm e o Club de Nuit Woman foram trocados por fotos em alta da intenseoud.

---
name: nao-gerar-html
description: Nunca gerar painel HTML de copy/roteiro; entregar tudo direto no chat (consome muito token). Só fazer HTML se ela pedir
metadata:
  type: feedback
---

Nunca gerar o painel HTML da Íris (squad copy-viral-perfumes) nem nenhum outro HTML de apresentação. Roteiros, legendas e a tabela "Qual escolher?" vão **direto no chat**. O `.md` em `output/` pode continuar sendo salvo.

**Why:** em 08/11/2026 ela pediu "só o texto aqui, não precisa de HTML", mas a regra antiga "sempre gerar o painel HTML" continuou no squad.yaml e no topo da memória do squad. Em 11/11/2026 o HTML foi gerado de novo e ela reclamou: "tínhamos combinado de não gerar html porque consome muito token, e sim mandar por aqui".

**How to apply:** o step-08 (Íris) do `squad.yaml` está desativado e o agente `apresentadora-visual` tem um aviso de bloqueio. Só gerar HTML quando ela pedir com todas as letras. Ver [[copy-sempre-squad-e-narracao]].

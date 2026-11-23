---
name: video-cliente-sobrio-sem-rosto
description: "Vídeo editado para CLIENTE (não Valota) = sem marca/CTA da Valota, paleta sóbria (preto, branco e dourado) e nada por cima do rosto"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4abb5c6e-f15f-4a6c-9660-a7faf38bfe34
  modified: 2026-11-20T19:19:22.615Z
---

Em 20/11/2026, no v63 "olinda" (Musamam White Intense, gravado numa loja), ela avisou no meio da edição: "não quero nada que fique por cima do rosto, e não deixa muito colorido, pois é para uma cliente". A 1ª versão saiu na cartela Valota (petróleo, cores das famílias, corações rosa, selo "VALOTA PARFUM", CTA @valotaparfum) e foi refeita.

**Why:** o vídeo é entregue a uma cliente. A identidade da Valota Parfum e o excesso de cor não cabem, e o rosto da pessoa precisa ficar limpo.

**How to apply:**
- Antes de editar um vídeo que chega dela, perguntar se é da Valota Parfum ou de cliente. Se for de cliente, não usar marca, @, CTA nem a cartela da Valota.
- **Paleta sóbria:** cartão preto translúcido, texto branco e dourado só como destaque (puxado do próprio produto). Ícones em traço, nada de cores de família.
- **Rosto livre:** rodar o Vision (`rosto.json` a cada 0,25 s) e o `qa_rosto.js` do v63 (`squad-editor/output/v63-olinda-gravado/`), que compara cada elemento com o rosto + 30 px. Renderizar só com "ROSTO LIVRE OK". Elementos ficam acima da cabeça ou abaixo do queixo; nada de partículas, névoa ou corações nas laterais do rosto.
- Ver também [[video-layout-encaixado-centralizado]] e [[nao-generalizar-ajuste-de-uma-saga]]: isso vale para vídeos de cliente, não muda o padrão Valota.

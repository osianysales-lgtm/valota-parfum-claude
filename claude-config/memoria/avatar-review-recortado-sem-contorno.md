---
name: avatar-review-recortado-sem-contorno
description: "21/11 v69 Granado: formato avatar REVIEW = recorte dela à esquerda embaixo SEM contorno (só sombra), fotos reais no fundo e nas notas; frascos HD legíveis (belezanaweb/época), nunca Fragrantica pequeno"
metadata:
  type: feedback
---

No v69 (Granado review, `squads/@gabriel/squad-editor/output/v69-granado-review-avatar/`) ela pediu avatar "recortado, rosto do lado esquerdo, como se estivesse comentando, sem cadeira, imagens reais no fundo e nas notas". Base = molde `moldes/apresentador-telao` (máscaras Vision sem cadeira), mas com FUNDO FOTO REAL tela cheia por perfume (sem telão).

Correções dela na prévia:
- **Sem contorno:** coloquei contorno creme no recorte → "não gostei desse contorno branco no meu cabelo, geralmente não tem contorno nenhum". Só drop-shadow suave.
- **Frasco real e legível:** Fragrantica (.png ~600–800 px) deixou o rótulo do Carioca ilegível → "preciso de frascos reais e legíveis pra pessoa identificar". Solução: belezanaweb via Playwright (fetch na mesma origem; cdn.gbmedia.com.br/images/v1/imagens/product/... = PNG 2560 px já recortado) e Época (VTEX `/api/catalog_system/pub/products/search`, imagem `ids/<id>-2000-2000/`). granado.com.br bloqueia robô. Frasco igual a outro (Aurora = mesmo vidro do Carioca/Bossa) → usar o alfa do irmão como máscara.

**How to apply:** em todo vídeo de avatar recortado, nada de contorno; conferir rótulo LEGÍVEL de cada frasco no tamanho do vídeo antes de mandar prévia. Notas e cards nunca abaixo de y≈930 (a cabeça do avatar começa ~y 990). Ver [[video-avatar-formato]], [[recorte-frasco-perfeito]].

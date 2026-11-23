---
name: recorte-frasco-perfeito
description: "18/11 v56: ela reprovou recorte com halo/serrilhado (\"não quero vídeo mal feito\"); buscar foto boa (Fragrantica alta) e conferir cada frasco AMPLIADO antes de mostrar"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6bd7a180-7f37-4016-a5b4-9a2310376255
  modified: 2026-11-18T14:57:22.409Z
---

Em 18/11/2026 (v56, 5 árabes para roupa social), ela viu o storyboard e reprovou o Hawas Black e o Infinity: "você recortou igual a sua cara… recorta direito todos os perfumes ou vai atrás de um png perfeito, não quero vídeo mal feito". Os recortes tinham halo branco, serrilhado e um resto da caixa.

**Why:** o frasco é o protagonista do vídeo, e em tela grande qualquer borda suja aparece. Ela prefere que eu demore um pouco mais a mostrar coisa mal recortada.

**How to apply:**
- Antes de mostrar qualquer storyboard, conferir TODOS os frascos ampliados (~900 px de altura) sobre o fundo do vídeo e em magenta.
- Se a foto tiver caixa, sombra ou resolução baixa (< ~1000 px de altura), buscar outra foto em vez de remendar.
- O fluxo que funcionou está no memories.md do squad-editor (seção v56): Fragrantica o.<id>.jpg → cortar pelo fundo → refinar → alisar.
- Vale junto com [[frasco-recorte-limpo]].

**19/11/2026 (v59, ela lembrou no meio: "não esquece que gosto de recortes perfeitos"):** a prévia ampliada (prev.js) passou, mas no quadro REAL do vídeo (1080 px, fundo petróleo com fumaça) apareceu filete branco no Hawas Verde, Pacific Aura e CDN Sillage. Agora: depois do render, tirar quadro de cada perfume e recortar a área dos frascos em tamanho real ANTES de entregar; filete claro → `frascos/defringe.js` (tira pixel claro e sem cor na faixa de 5–6 px da borda) + `alisar.js 2–3`; frasco geométrico → estreitar a máscara 2–3 px.
**19/11/2026 (v59, Sospiro Vibrato):** ela pegou no vídeo pronto: "o sospiro vibrato ficou recortado errado". O `o.<id>.png` do Fragrantica (que eu tratava como "já recortado = confiável") veio com um pedaço do lado direito do frasco faltando. Agora: PNG pronto também passa pela conferência ampliada (comparar o contorno com a foto .jpg original: formato igual, sem mordida); se divergir, recortar do .jpg (o 75930 tinha 5000 px) e tirar o reflexo cinza da base.

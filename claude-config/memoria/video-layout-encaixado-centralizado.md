---
name: video-layout-encaixado-centralizado
description: Todo elemento de vídeo/motion encaixado dentro da moldura e CENTRALIZADO (ou em par simétrico), nada encostando em outro; rodar o qa_layout.js antes de renderizar
metadata:
  type: feedback
---

Em 18/11/2026 (v58 "5 erros", motion petróleo) ela reprovou o render com raiva: "o quadrado praticamente fora da linha, eu preciso que tudo seja encaixado e nada fora do lugar… e preciso tudo seja centralizado". A lista de erros (card 880 px × escala 1,1) colava na moldura e saía deslocada pra esquerda: `.e` absoluto sem largura em left:540 encolhia o conteúdo e o translate(-50%) centralizava errado. Figurinhas soltas (👍, 😨, ❌, coroa, balões, pílula "1ª HORA") estavam fora do centro.

**Why:** pra ela, peça desalinhada é "vídeo mal feito"; o olhar dela pega qualquer coisa fora do eixo ou encostando na moldura.

**How to apply:**
- Âncora de elemento: `.e{width:0;height:0}` + `.in{position:absolute;width:max-content;transform:translate(-50%,-50%)}`.
- Elemento sozinho = x 540. Lado a lado = par simétrico (540 ± d). Se o 2º do par entra depois, o 1º nasce no centro e desliza (`mv`).
- Área segura: x 70–1010; nada abaixo de ~1470 (legenda) nem subindo no título (<395).
- Antes de renderizar, rodar `node qa_layout.js <pasta>` (a pasta do v58 se perdeu; o atual é `squad-editor/output/v61-5-erros-perfume-avatar/qa.js`, que mede só texto + caixas com fundo, ignora quem está deslizando e acusa COLADO com menos de 10 px): varre o vídeo a cada 0,2 s e acusa fora da área, fora do centro e elementos batendo (marcar `sobre=1` nas sobreposições de propósito). Só renderizar com "OK". Ver [[recorte-frasco-perfeito]].

**19/11/2026 (v61):** "cuidado para não deixar as letras coladas, presta atenção nisso". Pílula "ERRO X DE 5" encostava no título → pílula em 50, título em 122, line-height 1.12 e letter-spacing 2px no Gotham. Conferir AMPLIADO (crop do topo) além do QA.

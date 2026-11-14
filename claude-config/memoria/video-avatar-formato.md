---
name: video-avatar-formato
description: "Vídeos de avatar HeyGen da Valota Parfum: sempre o formato do v13/v14 (avatar pequeno em card embaixo, motion em cima), perfil osianyreal + voz ElevenLabs"
metadata:
  type: feedback
---

Em todo vídeo de avatar da Valota Parfum, usar o mesmo formato dos vídeos v13 (amigo secreto) e v14 (check-up): avatar **pequeno**, num card de 500 px embaixo e centralizado; legenda logo acima do card; animações, frascos e piadas na área de cima; fundo na paleta Petróleo & Âmbar. Avatar = perfil "osianyreal", look do quadro Van Gogh; voz = ElevenLabs "Osiany Sales v2". Animações e sons saem do squad-editor (`squads/@gabriel/squad-editor`, gen.js do v16 como modelo mais recente).

**Why:** em 10/11/2026 ela pediu "deixa o avatar igual nos outros vídeos, pequeno, usa o mesmo formato" e "usa os squad para usar animações e sons e não esquece de usar minha paleta de cores".

Regras da rodada de correções (10/11/2026), em que ela pediu "preste atenção nos mínimos detalhes":
- avatar nunca com cara feia, boca aberta ou travado (sem congelar quadro; mandar a narração com 3 s de silêncio no fim para a HeyGen);
- frasco recortado inteiro, com o vidro (recorte por fundo branco, não BiRefNet), conferido numa folha;
- nenhum texto saindo do balão/caixa/tela (auditoria automática antes do render);
- sem música de fundo, só efeitos sonoros.

**How to apply:** partir do `output/v16-borrifadas-avatar/gen.js` (ou gen3 do v13). Gerar avatar só com `tools/avatar.js --confirmar` (gasta créditos HeyGen, ~1 crédito a cada ~3,5 s). Ver [[tipografia-posts-videos]], [[valota-instagram-direcao-de-arte]] e [[nome-valota-parfum]].

Atualização em 10/11/2026 (v17 "make masculina"):
- **Look Van Gogh:** passar `--avatar edcd5b037ccf449ca8b4036b9d1e2af7` junto com `--perfil osianyreal`. Sem isso, a HeyGen usa outro look.
- **Narração longa:** acelerar com `atempo=1.1` (ffmpeg) e dividir os tempos do `narracao_palavras.json` por 1,1. O `--velocidade` do ElevenLabs quase não muda a duração.
- **Antes de gerar o avatar:** mostrar o roteiro final à Osiany. No v17 ela trocou um perfume no meio da geração e cerca de 18 créditos foram perdidos.

Atualização em 11/11/2026: **a velocidade padrão agora é 1,3x** no vídeo final inteiro (ver [[voz-velocidade-padrao]]). Isso substitui o atempo 1,1 do v17. O áudio vai pra HeyGen em 1x.

**Atualização em 11/11/2026 (templates):** o formato acima é o **AV1 (petróleo)**. Existe também o **AV2**: estilo react/comentário, com avatar pequeno no canto inferior esquerdo, conteúdo ocupando a tela e fundo CREME (base; Cedro é família, nunca fundo inteiro). Intercalar AV1 e AV2. Nunca usar avatar grande ou meia tela ("mostra que é muito IA"). Ver [[sistema-templates-por-formato]].

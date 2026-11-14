---
name: serie-bonecos-6-episodios
description: Produção aprovada em 14/11/2026 de 6 vídeos de bonecos 3D (sagas "Cobrar pra cheirar" e "Bidaya", 3 eps cada); roteiros finais e regras de produção
metadata:
  type: project
---

Em 14/11/2026 a Osiany aprovou os roteiros FINAIS e pediu os 6 vídeos (2 sagas × 3 partes):
- `squads/@valotaparfum/copy-viral-perfumes/output/videos/2026-11-14-serie-bonecos-cobrar-pra-cheirar-ROTEIRO-FINAL.md` (Rafa, Seu Valdir, Bia; P1 loja, P2 escritório, P3 loja com plaquinha trocada por "CHEIRAR É GRÁTIS")
- `.../2026-11-14-serie-bonecos-bidaya-ROTEIRO-FINAL.md` (Rafa + Bia; P1 escritório, P2 copa, P3 mesa da Bia)

**Regras dos roteiros finais (valem acima de qualquer versão anterior):** selo "PARTE 1/2/3" no canto; tela final "PARTE X · no próximo episódio dos bonecos 🎬" (+ "comenta o que você acha 👇" só onde a fala pede comentário); **legenda na tela no máximo 20 caracteres por linha, sem cortar palavra**; na P3 de "Cobrar" o fim é só o "segue" (sem comentar, pedido dela); Bidaya: "Vanilla P*rn" com bipe na fala e asterisco na tela, não criticar a marca, Paraguai só como "muito vendida lá", nunca falar de nota fiscal/imposto. Cards "no celular" = celular na mão do personagem.

Produção em `squads/@gabriel/squad-editor/output/serie-bonecos-cobrar-pra-cheirar/` (p1, p2, p3) e `.../serie-bonecos-bidaya/`. Fluxo e elenco: [[serie-bonecos-vozes-elenco]].

**Lição (14/11/2026):** a 1ª leva dos 6 saiu com os bonecos de BOCA FECHADA (ela percebeu comparando com os exemplos da skill). Causa: `tools/dialogo.js` media o volume com índice fracionado (533,33 amostras/quadro) → NaN → env.json zerado. Corrigido. **Antes de renderizar qualquer episódio, conferir o env.json: a boca tem que abrir em ~55–70% dos quadros de fala** (e olhar um close na prévia com a boca aberta).

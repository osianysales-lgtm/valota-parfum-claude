---
name: carrossel-dossie-celebridades
description: "19/11 carrossel 'Perfumes das celebridades · edição 007' (dossiê, 1 ator/slide); sem árabe inspirado = árabe com a cara da PERSONALIDADE do famoso"
metadata:
  node_type: memory
  type: project
  originSessionId: c4987a3c-eb45-4d8a-a24e-19dea2458bf0
  modified: 2026-11-19T15:36:25.385Z
---

Em 19/11/2026 ela mandou o carrossel do @luisjordao (instagram.com/p/Df2cU2hloFG, "Perfumes das celebridades · edição James Bond 007", 6 slides: capa colagem, Connery/Moore/Brosnan/Pattinson em dossiê com polaroid e frasco, final "Missão 007") e pediu igual, só que com perfumes árabes. Ela disse "olha todo carrossel": abrir TODOS os slides, não só a capa.

**Virada de conceito (pedido dela):** o Habit Rouge (Connery) e o Jicky (Moore) não têm árabe inspirado à venda no Mercado Livre. Ela disse: "o gancho na versão árabe não vai dar certo… tenta achar algum árabe que condiz com a personalidade dos atores". Então o post virou **"o árabe com a cara de cada Bond"**. Quando o árabe também lembra o perfume do ator, isso entra como bônus no texto.

Escalação: Connery "O ORIGINAL" → Lattafa Qaa'ed Intense (Qaa'ed = comandante; o Bond é Comandante) · Moore "O BEM-HUMORADO" → Asdaaf Ameer Al Arab (Príncipe dos Árabes, lavanda como o Jicky) · Brosnan "O GALÃ" → Armaf Tres Nuit (lembra Green Irish Tweed) · Craig "O BRUTO" → Maison Alhambra Tobacco Touch (Tom Ford vestiu ele em 4 filmes; fãs ligam ao Tobacco Vanille) · Pattinson "O MISTERIOSO" (novo 007, anunciado em 16/11/2026, rosto do Dior Homme desde 2013) → Al Wataniah Kayaan Classic.

Arquivos: `squads/@valotaparfum/carrossel-lista/carrosseis/2026-11-19-celebridades-007-arabe/` (gerar.js + carrossel.json → saida/01–07.png; layouts A/B/C de dossiê com couro Cedro, papel Creme, polaroid, fita Âmbar). As fotos dos atores vêm do Wikimedia Commons (CC, com crédito vertical no slide; créditos em atores/CREDITOS.txt). A Montserrat Italic foi baixada para carrossel-tweet/fonts/.

**Como aplicar:**
- Ligação famoso → perfume quase nunca tem entrevista. Escrever "dizem que" ou "os fãs ligam", e só afirmar o que tem fonte (ver [[marca-real-nao-inventar-afirmacao]]).
- O Playwright MCP pode estar ocupado por outra sessão. Nesse caso, Chrome headless próprio com cópia do perfil (scratchpad/prof) abre o Instagram logado. O Mercado Livre bloqueia esse Chrome (verificação de conta), então os preços ficam pendentes.
- **Capa (19/11):** frasco nunca pode cobrir rosto de ator ("os frascos ficou na cara dos atores"). Ela pediu mistério, "não entrega todos de cara". A silhueta escurecida com luz âmbar ela achou "horrível" ("do jeito que você apagou"). **Nunca escurecer o frasco nem fazer silhueta falsa.** Depois testei os frascos à mostra num grupo no centro, embaixo das fotos, e ela pediu pra voltar: "volta para versão anterior, que os perfumes ficaram atrás das fotos deles… ficou melhor daquela forma". **Versão APROVADA:** os 5 frascos REAIS, com cor, em pé atrás de uma fileira de 5 polaroids (fotos na frente, rostos livres). Só aparecem a tampa e o ombro de cada frasco, e o rótulo fica tapado. Tem brilho âmbar suave atrás e fita nas fotos. A cópia da versão "grupo no centro" ficou em html/gerar-capa-grupo-centro.js.bak. As mensagens dela chegam no meio da renderização, então confirmar qual versão ela está vendo antes de concluir.
- O resto do carrossel ainda não foi aprovado. Ver [[carrossel-lista-por-blocos]] e [[variar-perfumes]].

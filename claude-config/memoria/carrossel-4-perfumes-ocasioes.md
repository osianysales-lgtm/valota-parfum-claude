---
name: carrossel-4-perfumes-ocasioes
description: "24/11 carrossel da ref @ruanparfum_ (DgEAyjMjfWB) 'me indica 4 perfumes: dia, noite, versátil e um mais... 🔞' — sem 'Mano', sem 'derruba calcinha'; capa direct creme + 1 lâmina por perfume na cor da família"
metadata:
  node_type: memory
  type: project
  originSessionId: 7e4e9d21-93ae-4e13-90e3-0246dd951c10
  modified: 2026-11-24T02:48:39.700Z
---

Em 24/11/2026 ela mandou instagram.com/p/DgEAyjMjfWB (@ruanparfum_, 5 lâminas: capa com balões de direct sobre foto borrada + 4 fotos de mão segurando o frasco no veludo vermelho). Pediu: tirar o "Mano", trocar "É um derruba calcinha hahahah" por "É um mais... 🔞", usar a paleta dela e "ser criativo".

Perfumes da ref: Dia = Khadlaj Shiyaaka Sky · Noite = **Nayaat** XLNC Imperium (no frasco parece "hayaat", mas a marca é Nayaat/Orientica) · Versátil = Armaf Club de Nuit Élite · 🔞 = Maison Asrar Muharib.

Pasta: `squads/@valotaparfum/carrossel-lista/carrosseis/2026-11-24-4-perfumes-ocasioes/` → `gerar.js` → `saida/01–06.png` (1080×1440, só Montserrat). Capa creme com grade (balões Algodão, o 🔞 em Rosa Antigo, resposta dela em petróleo com o avatar), Dia em Menta com sol Amarelo, Noite em petróleo com brilho âmbar e lua, Versátil em diagonal creme × petróleo, 🔞 em Pimenta com etiqueta "USE COM MODERAÇÃO", final Âmbar com os 4 frascos + CTA da bio + cartão de perfil.

Frascos: Fragrantica `o.<id>.jpg` (137096, 119247, 139792, 115636) + recortar-fundo-branco.swift. A tampa prateada do Élite serrilha no recorte por cor → `frascos/mascara_elite.js` (máscara geométrica medida na foto, já estreitada 2–3 px contra o filete claro).

Feed não deu pra conferir (Playwright deslogado = "perfil restrito +18"); escolhi capa clara porque o último output era o v80 petróleo. Aguardando aprovação dela.

Ver [[carrossel-lista-por-blocos]], [[paleta-50-50-cores-familia]], [[recorte-frasco-perfeito]].

**24/11 · v1 REPROVADA: "eu não gostei, faz o mais parecido com o dele, ficou muito colorido".** A v1 (uma cor de família por lâmina, chips, notas, frase, slide final âmbar) está em `gerar_v1_colorido.js` + `saida-v1-colorido/`. **Lição: mesmo com "seja criativo", ref com estética de FOTO sóbria = manter a estética da ref; "usa minha paleta" aqui era só trocar a cor (veludo vermelho → petróleo), não pintar cada lâmina de uma cor.**
v2 (`gerar.js`, 5 lâminas como a ref, sem slide de CTA): capa = avatar dela borrado + balões creme em Helvetica Neue + avatar ao lado do último; lâminas = veludo petróleo feito em SVG (feTurbulence + luz difusa, dobras diagonais) + frasco grande com sombra dura pra direita, XLNC inclinado 22°, palavra em Didot branca no canto, "@valotaparfum" com filetes âmbar. Sem mão: a HyperFrames só gera imagem (Nano Banana) no plano Pro, e o Chrome do Playwright (com o Gemini) estava preso em outra sessão.
v2 também leva o LEMBRA O discreto embaixo da palavra ([[sempre-mostrar-inspirado]]): Sky→Météore LV (fraco: 1 review Parfumo + linha Shiyaaka), XLNC→Bottled Beyond Hugo Boss (fraco: 1 review cada, sem consenso), Élite→Wild Vetiver Creed (3 fontes), Muharib→Naxos Xerjoff (3 fontes). Avisei ela dos fracos.
**24/11 · v2 aprovada ("ficou bom"), mas a capa virou PRINT DE WHATSAPP** a pedido dela: tela de quem manda mensagem pra Valota Parfum (foto dela + "digitando…" no cabeçalho), 3 mensagens enviadas com 21:47 e ✓✓, papel de parede com rabiscos (frasco/coração/estrela/gota) e barra "Mensagem" + mic. Modo escuro nos tons da paleta (Noite/Petróleo/Luz, ✓✓ e mic em Menta). A capa borrada anterior ficou em `gerar_v2_capa_borrada.js`.
**24/11 · bronca: "você esqueceu de fazer um CTA pra me seguirem no final, é pro TikTok".** Na v2 eu tirei a lâmina de CTA só porque a ref não tinha. Agora existe a `saida/06.png`, no mesmo veludo petróleo: "Segue a Valota Parfum" em Didot, "pra mais dicas e achados de perfumaria", cartão de perfil estilo TikTok (avatar com o "+" âmbar, @valotaparfum e botão Seguir, sem número) e os 4 frascos embaixo. **Lição: mesmo copiando uma ref sem CTA, o carrossel dela SEMPRE termina numa lâmina de seguir.**
**24/11 · capa VOLTOU A SER IGUAL À REF** ("faz de novo, é como se a pessoa tivesse me mandando mensagem, coloca 'valotaa' e deixa minha foto de fundo, faz igual o dele"). Agora é a foto dela borrada no fundo com os balões creme recebidos: "Valotaa" (no lugar do "Mano"), "Me indica 4 perfumes aí", "Um pra noite, dia, versátil" e "E um mais... 🔞 haha" (com E sem acento; "haha" a pedido dela, de "e mais um"; ela corrigiu o "É"). Ela confirmou: "só tira o derruba calcinha e mantém o +18", então o "hahahah" saiu junto. Ao lado do último balão vai um avatar genérico, porque representa quem mandou. A capa no estilo WhatsApp ficou guardada em `gerar_v3_capa_whatsapp.js`. A lâmina 06 é o CTA de seguir, feito pro TikTok.

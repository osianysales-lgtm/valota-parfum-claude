---
name: carrossel-8-arabes-sem-testar
description: "22/11 carrossel cópia do @satefragrances (DfuXYvqkYoI) '10 árabes pra comprar sem testar' → 8 (sem Philos Pura/Erba Pura e sem Salvo/Sauvage), fundo petróleo, CTA 'Quer perfume cheiroso sem pagar preço de grife? Clica no link da bio e segue a Valota Parfum'"
metadata:
  node_type: memory
  type: project
  originSessionId: 2db0d7f1-4a6a-498f-b2c7-f0ea62a60fb5
  modified: 2026-11-22T17:48:06.686Z
---

Em 22/11/2026 ela mandou instagram.com/p/DfuXYvqkYoI (@satefragrances, 13 lâminas) e pediu "bem parecido", na paleta dela, de preferência em **verde petróleo**. Os prints estão em `squads/@valotaparfum/carrossel-lista/carrosseis/2026-11-22-8-perfumes-sem-testar/ref/s01–s13.jpg`.

**Estrutura da referência:**
- Capa com o guia "10 árabes pra comprar sem testar" e silhuetas de frascos.
- Uma lâmina por perfume: em cima a grife (ocasião, "Lembra o" + nome em código, preço riscado); no meio a faixa "A VERSÃO ÁRABE ↓"; embaixo o árabe (preço, selo "X× mais barato", fixa/projeta, frase).
- Depois vem o resumo "Qual levar?", agrupado por ocasião, e o final "Qual foi o seu primeiro árabe?".

**Ela tirou** o Philos Pura (Erba Pura) e o Salvo (Sauvage). **Ficaram 8:** Turathi Blue, Maahir Legacy, CDNIM, Asad Bourbon, Khamrah Qahwa, Liquid Brun, Lion e Rayhaan Elixir.

**CTA final, escolhido por ela:** "Quer perfume cheiroso sem pagar preço de grife? Clica no link da bio e segue a Valota Parfum." Vai junto com o cartão de perfil (foto + @valotaparfum + Seguir), como nos outros carrosséis.

**How to apply:** não copiar as frases de opinião dele; escrever as nossas em linguagem leiga ([[linguagem-leiga-sem-termo-tecnico]]). Para os preços, ver [[preco-mercado-livre-mais-barato]]. Usar só Montserrat ([[carrossel-lista-por-blocos]]).

Decidido: nome da grife EM CÓDIGO igual a ele (S3DL3Y / P4RF4MS D3 M4RLY), capa "8 árabes pra comprar sem testar" (igual à ref).

**22/11, montado:** `gerar.js` gera `saida/01–11.png` em 1080×1440 (3:4, igual à ref). As lâminas são: capa + 8 perfumes + resumo + CTA.
- **Visual:** fundo petróleo com brilho Luz atrás do frasco, faixa creme "A VERSÃO ÁRABE", preço da grife em Rosa Antigo riscado de Pimenta, preço do árabe em caixa creme, selo Amarelo Laudo, alerta em Âmbar, só Montserrat.
- **Frascos:** foto da Fragrantica recortada com cortar_fundo + defringe. Os dois Khamrah vieram do Shopify da lattafa-usa em 1500 px, porque a foto pequena serrilhava.
- **Preços de 22/11** (vendedor MercadoLíder, loja oficial ou +1000 vendas, nacional e frasco cheio): Tygar 3.555, Sedley 2.139, Aventus 3.199, Most Wanted Intense 549, Althair 2.791, Ultra Male 466, Le Male Elixir 408 (75 ml). Árabes: Turathi Blue 315,90, Maahir 198, CDNIM 193,10, Asad Bourbon 169 (o de R$ 94 é Isabelle La Belle, não Lattafa), Khamrah Qahwa 160,99, Liquid Brun 249, Lion 193, Rayhaan Elixir 199. O "X× mais barato" arredonda para baixo.
- **Busca de preço:** o Mercado Livre bloqueia a busca sem login. Ela entra na conta pela janela do Chrome do Playwright, que é separada do navegador dela, e eu trago a janela pra frente com osascript.
- **22/11, ajustes dela ("não gostei"):** a faixa "A VERSÃO ÁRABE" estava creme e ela achou "meio confuso". Agora é **Amarelo Laudo** com texto Petróleo Noite. Ela também pediu a letra "o mais próximo possível da inspiração": a da ref é a **Inter** (ExtraBold 800, letras apertadas, optical sizing). Baixei em `fonts/Inter.ttf` e `fonts/Inter-Italic.ttf` e troquei a Montserrat. Calibrei os tamanhos na comparação lado a lado com a ref: capa 124 px com espaçamento -5.5. Isso vale para este carrossel; nos outros, letra igual à da ref quando ela pedir "igual" ([[video-referencia-letra-sons-dedo]]).

# Modelo TOP 5 / ranking (motion, só produto + narração)

Modelo aprovado pela Osiany em 08/11/2026 ("estrutura ótima, apresentação também").
Exemplo pronto: `output/v4-top5arabes/` → `REELS VALOTA TOP 5 ARABES EDITADO.mp4` (50,9 s em 1.3x).
Use este modelo **sempre que o vídeo for um Top 5 ou um ranking**.

## Estrutura (não mudar a ordem)
| # | Bloco | O que aparece |
|---|---|---|
| 1 | Gancho (0–5 s) | Os 5 frascos entram enfileirados, um a um, com o número embaixo (5 4 3 2 1, o 1 em amarelo). No topo, o gancho escrito (ex.: **5 ÁRABES / que deixam ela louca**) |
| 2 | Promessa | O nº 1 só em **silhueta** com contraluz, um "?" gigante atrás e o texto "o Nº 1 / fica pro final" |
| 3 | Critério | A fila dos 5 de novo + ênfase amarela (ex.: DNA DE GRIFE) |
| 4 | Itens 5 → 3 | Para cada item: **whip-pan** → **número gigante amarelo** (impacto) → **flash + cartela** com o NOME em dourado e a MARCA → "lembra o / ORIGINAL" → **notas em PNG** quando faladas → **ocasião** em ênfase (☀️ DIA, 🌙 NOITE...) |
| 5 | Ponta solta 1 | O palco escurece, o top 2 em silhueta, ênfase **TOP 2** |
| 6 | Item 2 | Igual aos outros itens + efeito especial de ocasião (ex.: luzes de balada girando) |
| 7 | Ponta solta 2 | O nº 1 em silhueta, ênfase da curiosidade (ex.: NOTA ÚNICA) e um riser |
| 8 | Nº 1 | Revelação com flash forte, luz acendendo e halo. A nota única com brilho amarelo + ênfase dela |
| 9 | CTA | A fila dos 5 + a pílula dourada (ex.: SALVA ESSA LISTA 📌) + @valotaparfum |
| 10 | Assinatura | VALOTA PARFUM dourado, frascos ao fundo com luz baixa (nunca terminar em tela preta) |

## Como adaptar o cena.html (só trocar os dados, sem mudar o motor)
1. Narração: `tools/voz.js` → `narracao_palavras.json`. Gerar o `cena_dados.js` (palavras + palavras_chave), como em output/v4-top5arabes.
2. `IM` (lista de PNGs), `ORDEM` (5 → 1), `ALT` (altura de cada frasco no herói, 600–760), `LINE` (centro x de cada um na fila; recalcular pelas larguras para caber em 1080).
3. `NOTAS`: [png, t da palavra, t fim do item, x, y, largura, destaque]. Coluna da esquerda x≈40, da direita x≈760, y entre 260 e 700.
4. `TOP`: cartelas (nome/marca) e "lembra o / ORIGINAL", com os tempos tirados das palavras.
5. `ENF`: ênfases amarelas (ocasião, pontas soltas, nota única).
6. `PL`: planos. `numero` na palavra do número (whip:1) → `heroi` no nome → 2º `heroi` quando as notas começam. `misterio`/`escuro` nas pontas soltas, `revela:1` no nº 1, `cta`, `assin`.
7. `BATIDAS` (punch na câmera), tempos do flash em `fim()`, janela do `#balada` e `DUR`.
8. `audio_map.json`: whoosh em todo whip, impact_grave em cada número e ponta solta, shine em cada cartela, pop em cada nota e frasco, riser antes da revelação, vidro na revelação, ding no CTA, shine na assinatura. BGM trilha_trap_luxo_beat a 0,14.
9. Velocidade: renderizar em 1x e acelerar depois (`setpts=PTS/1.3,fps=30` + `atempo=1.3`), se ela pedir.

## Imagens
- Frascos: foto oficial frontal da loja da marca (Shopify `/products/<handle>.json`), recortada com `tools/recorte.js` e aparada com `trim.js`. O frasco aparece **inteiro, em pé, nunca cropado**.
- Notas: Wikimedia Commons (BY/BY-SA/CC0), baixar com `curl -4`, recortar. Folhagem e coisas sem contorno (tabaco, lavanda) entram como card arredondado (`card.js`).
- ⚠️ **NÃO reutilizar `abacaxi.png` nem `baunilha.png` do v3-1mblack.** A Osiany não gostou delas (08/11/2026). Buscar fotos novas: abacaxi inteiro ou fatia fresca bem recortada (não anéis cristalizados) e favas de baunilha bonitas, com contorno limpo e visíveis no fundo escuro.

## Uso
Copie esta pasta para `output/vN-tema/`. Os scripts `trim.js`/`card.js` esperam estar em `output/vN/`, porque apontam para `../../node_modules/sharp`. O `cena.html` lê `cena_dados.js` e `png/<nome>.png` da mesma pasta. `exemplo_cena_dados.js` mostra o formato.

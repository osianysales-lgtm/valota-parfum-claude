---
name: valota-carrossel-tweet
description: "PADRÃO aprovado de carrossel da Valota Parfum (estilo tweet, capa/itens/final) + estrutura de copy; sempre pedir print das 3 últimas publicações para o slide final"
metadata:
  type: project
---

Em 10/11/2026 criamos o template padrão de carrossel "estilo tweet". A referência foi o carrossel da @luizacureau: fundo branco, foto, nome e @ no topo; na capa, título + subtítulo + 2 fotos; nos slides de texto, título + parágrafos + linha de passo com bolinha; no final, CTA + cartão de perfil com o botão Seguir e 3 miniaturas.

Fica em `/Users/osianysales/Downloads/ClaudCode/squads/@valotaparfum/carrossel-tweet/`. Para gerar: `python3 gerar.py carrosseis/<nome>/carrossel.json`. Ele usa o Chrome headless e solta PNGs 1080×1350 em `saida/`. O guia é o COMO-USAR.md.

**Why:** a Osiany quer um padrão fixo para os 2 carrosséis por dia. Ela pediu que o slide final **não mostre o número de seguidores**.

Aprovado em 10/11/2026 como **padrão de carrossel**, junto com a estrutura de copy, que está salva em `ESTRUTURA-DE-COPY.md` na mesma pasta:
- **Capa:** "🚨 N coisas que…!" + subtítulo que completa e termina com ➡️.
- **Itens:** "N. ação curta." + 1 ou 2 parágrafos + passo com setas.
- **Final:** "Se esse post te ajudou, já segue a Valota Parfum que por aqui eu te…".

**Antes de gerar qualquer carrossel, pedir à Osiany print de pelo menos as 3 últimas publicações** e salvar em `feed-atual/1.png` (a mais recente), `2.png` e `3.png`. O slide final usa esses prints pra ficar igual ao feed dela.

Já montados: `carrosseis/onde-borrifar` e `carrosseis/erros-perfume-some`, com 7 slides cada.

**How to apply:** quando ela pedir um carrossel, montar o JSON com os tipos capa/texto/final e rodar o gerar.py. O avatar.png saiu de um print pequeno (86 px) e fica um pouco borrado; trocar quando ela mandar a foto original. O fundo branco não faz parte da paleta: ela pediu igual à referência, e existe a opção "fundo": "creme". Vale junto com [[tipografia-posts-videos]], [[nome-valota-parfum]] e [[valota-instagram-direcao-de-arte]].

Ajustes em 10/11/2026:
- Na capa com foto vertical, o produto tem que aparecer inteiro, com bico e borrifador, sem corte. A Osiany reclamou do corte. O enquadramento se ajusta com `"pos": "center 20%"` na imagem. Conferir a capa renderizada antes de entregar.
- Os prints do feed ficam em `feed-atual/`. Em 10/11, a ordem era: 1 = O hábito mais saudável, 2 = Plantão Ela roubou o perfume dele, 3 = 5 árabes que rendem elogio.

Atualização em 10/11/2026 (recortes):
- **Pedido da Osiany:** no carrossel Creed Aventus x Club de Nuit Intense Man (post 17h, `carrosseis/creed-aventus-x-cdnim`), ela pediu o mesmo template, mas **com fotos dos perfumes e das notas recortadas**.
- **Recurso novo no gerar.py:** item `{"recorte": ...}` (capa) e `"recortes": [...]` (slides de texto), que põe o PNG sem fundo inteiro num painel creme. Para textura que não dá pra recortar existe `"forma": "circulo"`. Está documentado no COMO-USAR.md.
- **Fotos de frasco:** foto oficial da loja (Shopify `/products/<x>.json`, ex.: creedboutique.com e armaf.ae), recortada com o recortar-pessoa.swift e aparada com o novo `direcao-de-arte/ferramentas/aparar-recorte.swift`. Ela autorizou buscar fotos melhores quando as dela não servirem. Imagem colada no chat não vira arquivo, então é preciso baixar de novo.
- **Notas:** fotos do Wikimedia Commons com crédito no roteiro.
- **Espaço:** com fileira de recortes, o texto do slide precisa ser curto (1 ou 2 parágrafos), senão a fileira estoura o slide.

Atualização em 10/11/2026 (tarde): dá pra atualizar os prints do `feed-atual/` sem pedir à Osiany. Basta abrir instagram.com/valotaparfum no Playwright (já logado) e tirar screenshot de cada miniatura (`a[href*="/p/"]`, `a[href*="/reel/"]`) com scale device, o que dá 590×788. Os prints antigos ficam em `feed-atual/antigos-<data>/`. O carrossel de 11/11 às 08h está em `carrosseis/esfregar-pulso`. Esse tema já foi usado 3 vezes (onde-borrifar, erros-perfume-some e esfregar-pulso), então não repetir "não esfrega" nos próximos.

Atualização em 10/11/2026 (noite): a Osiany pediu para **não manter todo carrossel em "N coisas"** e **tirar o emoji 🚨** da capa. O carrossel de 11/11 às 17h (YSL Y EDP x Fakhar Black) virou uma sequência narrativa, com títulos sem número. O template visual continua o mesmo. Variar o formato da capa nos próximos carrosséis e não usar 🚨 sem ela pedir.

Atualização em 10/11/2026 (noite, 2): a capa de `carrosseis/esfregar-pulso` (11/11 às 08h) foi refeita. O gancho agora é "Você também esfrega um pulso no outro depois do perfume?", sem "5 coisas" e sem 🚨. Ela mandou uma foto (mão borrifando no pulso), que está em `capa-pulso.png` e entrou como imagem única na capa. Com 1 imagem (`.fotos.n1`), uma foto horizontal ocupa a largura toda e fica bem enquadrada.
Ela também pediu para tirar o ➡️ do fim do subtítulo. Daqui pra frente, a capa não leva emoji nenhum, nem 🚨 nem ➡️, a não ser que ela peça. O ➡️ que aparece no ESTRUTURA-DE-COPY.md é do padrão antigo.

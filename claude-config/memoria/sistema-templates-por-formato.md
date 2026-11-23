---
name: sistema-templates-por-formato
description: "Estratégia visual aprovada em 11/11/2026: cada FORMATO tem templates e cores fixos (AV1/AV2, NA1/NA2, HU, CA1–CA3, estático livre); intercalar os templates dentro de cada formato"
metadata:
  type: feedback
---

Em 11/11/2026 a Osiany recusou estratégias de cor por tema, por pilar e por horário: ela pensa nos temas de forma aleatória, posta virais de última hora e às vezes pula carrossel. Ela definiu: **a cor vem do formato**. Cada formato tem templates fixos para as pessoas reconhecerem.

| Formato | Template | Fundo |
|---|---|---|
| Reels avatar | **AV1**: avatar pequeno num card embaixo, centralizado, motion em cima (v13/v14/v23) | Petróleo |
| Reels avatar | **AV2**: estilo "react/comentário", avatar PEQUENO no canto inferior ESQUERDO, conteúdo ocupando a tela | **CREME Pergaminho #F2E8D8** (base), texto Petróleo Noite, fontes grossas; famílias só em chips/cards. ⚠️ NÃO é Cedro (Cedro é cor de FAMÍLIA, nunca fundo inteiro). Corrigido por ela em 12/11/2026 |
| Reels narração | **NA1**: creme + âmbar (v20) | Creme |
| Reels narração | **NA2**: base âmbar (v24 `output/v24-trabalho-comedia-ambar/gen.js`) | Âmbar |
| Reels humanizado | **HU**: série "Vale o Frasco", sempre igual ao v21/v22 (Glitch). Ver a seção HU abaixo | vídeo real dela |
| Carrossel | **CA1**: estilo tweet (ver [[valota-carrossel-tweet]]) | Creme/claro |
| Carrossel | **CA2**: Laudo/Comparativo/Ranking | Petróleo + cartelas das famílias |
| Carrossel | **CA3**: Família da vez, fundo na cor da família do perfume do tema (Menta, Rosa Antigo, Bergamota, Pimenta, Algodão…) | família |
| Estático | livre, sem template, conforme o pedido | — |

**NÃO usar avatar grande / meia tela**: ela disse que "mostra que é muito IA, não ficou bom comigo".

**Why:** ela precisa de uma regra que aguente tema aleatório, viral de última hora e post pulado. Formato fixo = reconhecimento + zero decisão de cor.

**How to apply:**
- Dentro de cada formato, **intercalar os templates** (último avatar AV1 → próximo AV2; última narração creme → próxima âmbar). Antes de cada peça, olhar o último do mesmo formato em `squad-editor/output/` e no `direcao-de-arte/feed-log.csv`, dizer a ela qual é a vez e registrar o template usado.
- Isso **substitui** a regra 50/30/15/5 do feed e o "âmbar 1 a cada 20". A grade se equilibra pelo mix de formatos do plano (2 carrosséis, 2 narrações e 2 avatares por dia).
- Continuam valendo as regras da cartela ([[paleta-50-50-cores-familia]]): 50% base + 50% famílias dentro de cada peça, sem texto âmbar/amarelo sobre o creme, sem HEX novo, fontes grossas em fundo claro.
- **AV2 aprovado (formato e cor) em 11/11/2026.** Em 11/11/2026 ainda faltava criar: o modelo do AV2, CA2 e CA3.

**HU · Vale o Frasco (corrigido por ela em 11/11/2026):** o template é o dos vídeos v21 e v22 (`squad-editor/output/v21-glitch/gen.js` e `v22-glitch-parte2/gen.js`), que ela publicou hoje.
- **Gancho inicial = capa:** card Petróleo (degradê Luz→Petróleo→Noite, borda inferior âmbar, cantos de 30 px) no topo, com o NOME DO PERFUME em Gotham Black 140 px creme (efeito glitch Menta/Rosa) e "VALE O **FRASCO?**" em Montserrat 900 68 px (FRASCO em amarelo). Chip creme com a marca embaixo. Ele aparece já no 1º quadro e **fica na tela uns 10 s** (no v21 saiu em ~11,5 s), como se fosse a capa. Mesmas letras e o mesmo layout em todo episódio.
- **Selo do veredito (são dois selos diferentes):**
  - aprovado = selo redondo **amarelo** "SELO · VALE O FRASCO · VALOTA PARFUM" (CSS `.selo` do v22: degradê Amarelo Laudo→Âmbar, borda Petróleo Noite e tracejado interno);
  - reprovado = selo **vermelho** "NÃO VALE", no mesmo desenho do amarelo, mas em **Pimenta #9C452A** com texto creme (o vermelho oficial da cartela; não inventar HEX).
- **Episódio do veredito (Parte 2, quando ela responde se vale o frasco ou não):** o MESMO gancho/capa, e **o selo do veredito já aparece na capa, junto do gancho, desde o 1º quadro e preso na tela por ~11 s**. O template é igual nos dois casos, só muda o selo (amarelo VALE O FRASCO ou Pimenta NÃO VALE). No momento em que ela fala o veredito, o selo pode carimbar de novo (como no v22).
- Legendas como no v21 (Montserrat 900, creme com palavra-chave amarela e contorno Petróleo Noite).

**AV2 criado em 12/11/2026 (v25, layering):** molde em `squads/@gabriel/squad-editor/output/v25-layering-av2-avatar/gen.js`: fundo CREME (o 1º render saiu em Cedro por engano e foi refeito), avatar 430×560 no canto inferior esquerdo e, ao lado dele, um painel creme persistente estilo react (ex.: "3 REGRAS" que ticam conforme a fala). O gancho escrito fica fixo no quadro 0 e depois vira selo no topo. O próximo avatar volta pro AV1 (petróleo).

**APROVADO pela Osiany em 12/11/2026:** o v25 (layering, AV2 creme) é o **template oficial do AV2**. Os próximos AV2 partem do `gen.js` dele: fundo creme, quadro petróleo estilo react ao lado do avatar, gancho escrito fixo e marca-texto nos destaques.

**Atualização em 12/11/2026 (claro × escuro entre posts seguidos):** no v26 (narração, Hawas Black x Hacivat) a Osiany perguntou "o último vídeo foi com paleta clara, não teria que ser uma escura agora?" e aprovou a **narração em fundo PETRÓLEO** (base do gen.js do v18). O `proxima-capa.py` também sugeria D (escuro). **Como aplicar:** antes de cada vídeo, olhar o post ANTERIOR (de qualquer formato). Se ele foi claro (creme), o próximo vai escuro (petróleo), mesmo que o template do formato fosse creme, e vice-versa. Avisar ela da escolha. O `proxima-capa.py` quebra com template AV2 no feed-log (KeyError 'AV2' no gerar_html): falta cadastrar AV2/NAR-PETROLEO na tabela TEMPLATES.

**CA2 criado em 12/11/2026 (carrossel 17h de 13/11, Initio Oud for Greatness x Lattafa Oud for Glory):** `squads/@valotaparfum/carrossel-ficha/gerar.py` + `carrosseis/<nome>/carrossel.json`. Slides tipo capa (2 frascos no piso de estúdio + preço embaixo, sem clip-art), ficha (2 cartões na cor da família), notas (tabela nota × ✓ ✓), texto (cards), veredito (selo amarelo VALE O FRASCO) e final (âmbar, reaproveita o carrossel-lista). Base petróleo com grão e vinheta. Ainda não aprovado por ela: confirmar e anotar aqui.

**CA2 ajustado a pedido dela em 13/11/2026:** "alternar a cor de cada página usando a minha paleta" → cada slide tem `"fundo"`: petroleo / creme (grade, texto Noite, kicker Pimenta, fontes grossas) / pimenta. Sequência usada: Petróleo → Creme → Petróleo → Creme → Pimenta → Creme → final Âmbar. No slide final, `"pos_miniatura"` ajusta o corte da capa dentro do post desenhado: ela reclamou que o frasco saiu cortado, então mostrar os frascos inteiros. Recorte de frasco com halo branco: `recortar-pessoa.swift` + `aparar-recorte.swift` + `encolher-borda.swift in out 5` (todos em direcao-de-arte/ferramentas). Ficou melhor que o recorte por cor.

**AV2 em 15/11/2026 (v38, Lista da Black Friday):** os moldes v25/v28/v31 não estão mais na máquina. O molde do AV2 agora é o `squads/@gabriel/squad-editor/output/v38-10-arabes-black-friday-avatar-av2/gen.js`: fundo creme, avatar pequeno no canto inferior esquerdo, painel petróleo "MINHA LISTA" ao lado e cards de vitrine com as fotos oficiais. Ela pediu "pode ser na versão clara sem problemas" mesmo depois de um post creme, ou seja, a regra claro × escuro pode ceder quando ela escolhe.

**18/11/2026 (v58 "5 erros"):** comecei a narração em creme pela alternância NA1/NA2 e ela cortou: "muda o template, olha o meu instagram… lembra da regra que criamos?". O último post do feed (sem contar o fixado) era o "Frio é só a desculpa" (creme) → o v58 foi pra PETRÓLEO. **A regra claro × escuro pelo POST ANTERIOR do feed vem ANTES da alternância do formato:** abrir instagram.com/valotaparfum no Playwright (já logado), pular o fixado, ver a cor do 1º post e escolher o oposto — sempre, antes de escrever qualquer template.

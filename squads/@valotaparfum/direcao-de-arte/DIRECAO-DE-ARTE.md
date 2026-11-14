# Direção de Arte Editorial · Cadência Cromática Assimétrica

**Valota Parfum (@valotaparfum) · Instagram · aprovada em 09/11/2026**

Vale para **toda capa que aparece na grade do Instagram**: capa de Reel, capa de carrossel e estático.
Paleta e regras de cada peça: `squads/@community/brand-squad/brand-squad/output/v1/step-04-identity-system.md` e `squads/@squad-design/criativos-estaticos/design-system.md`.
Este documento **não muda nenhuma cor oficial**. Ele define só **combinações e proporções no feed**.

---

## 0. Fluxo obrigatório antes de criar qualquer capa

1. Abrir `feed-log.csv` (registro das publicações, da mais antiga para a mais nova).
2. Rodar `python3 proxima-capa.py` nesta pasta. O script:
   - lê as **últimas 9** publicações (e as últimas 20 para as proporções);
   - aplica as regras da seção 4;
   - sugere a família e o template da próxima capa, com 2 alternativas;
   - gera `grade-preview.html` com a grade de 3 colunas já com a próxima capa no lugar.
3. Escolher o template que **também combina com o conteúdo** (entre as opções liberadas).
4. Depois de publicar, registrar: `python3 proxima-capa.py --registrar D1 "Tema do post" --formato reel`.
5. Posts anteriores à paleta ficam no log como família **X / template LEG** (legado): contam para a posição na grade, não para as proporções.
6. Se houver posts que não passaram por aqui, pedir um print da grade à Osiany e registrar antes de sugerir.

---

## 1. Paleta oficial "Petróleo & Âmbar" (inalterável)

| Nome | HEX | Papel |
|---|---|---|
| Petróleo | `#0F2E33` | Base das capas dark |
| Petróleo Noite | `#0A1F23` | Vinheta, faixas, **texto sobre bege, âmbar e amarelo** |
| Petróleo Luz | `#1A4A52` | Só no centro de degradês radiais |
| Creme Pergaminho (bege) | `#F2E8D8` | Base das capas light, texto sobre petróleo |
| Âmbar | `#D49A4E` | Luxo: filetes, números, preço, nota, monograma |
| Amarelo Laudo | `#FFC93C` | Selo, punchline, palavra-chave, veredito |

Degradê padrão das capas dark (G1): `radial-gradient(90% 90% at 35% 40%, #1A4A52 0%, #0F2E33 55%, #0A1F23 100%)`. **Nunca Petróleo chapado na capa inteira.**

---

## 2. Proporções do feed (janela móvel de 20 posts)

| Família | Código | Meta | Em 20 posts | O que é |
|---|---|---|---|---|
| Dark Petróleo | **D** | 50% | 10 | Fundo G1/Petróleo, texto creme |
| Light Bege | **L** | 30% | 6 | Fundo Creme `#F2E8D8`, texto Petróleo Noite, filete Petróleo de 16 px na base |
| Fotográfica editorial | **F** | 15% | 3 | Foto real (frasco em cena, pele, notas), grade de cor coerente com a família olfativa |
| Âmbar / Amarelo | **A** | 5% | 1 | Fundo Âmbar ou Amarelo Laudo, texto Petróleo Noite |

> **Exceção aprovada:** nas capas **A**, o amarelo/âmbar passa do teto de 15% por peça do manual. É a única família onde isso vale, e no máximo 1 a cada 20 posts.

> **ATUALIZAÇÃO 11/11/2026: A COR VEM DO FORMATO (substitui as metas 50/30/15/5 e o "âmbar 1 a cada 20").** Cada formato tem templates fixos, e dentro de cada formato os templates são intercalados:
>
> | Formato | Template | Fundo |
> |---|---|---|
> | Reels avatar | **AV1**: avatar pequeno num card embaixo, centralizado, motion em cima (v13/v14/v23) | Petróleo |
> | Reels avatar | **AV2**: estilo react/comentário, avatar pequeno no canto inferior esquerdo + painel petróleo ao lado (ex.: "3 REGRAS" que ticam), conteúdo na tela toda (nunca avatar grande). Modelo: `squad-editor/output/v25-layering-av2-avatar/gen.js` | **Creme** (base), títulos/legenda Petróleo Noite, destaque em marca-texto, fontes grossas. Em 11/11 tinha sido aprovado Cedro; em 12/11 a Osiany corrigiu para creme (Cedro é cor de família, não fundo) |
> | Reels narração | **NA1** (v20) | Creme + âmbar |
> | Reels narração | **NA2** (v24 `squad-editor/output/v24-trabalho-comedia-ambar/gen.js`) | Âmbar |
> | Reels humanizado | **HU · Vale o Frasco**: igual ao v21/v22 (Glitch). Gancho/capa = card Petróleo com NOME DO PERFUME (Gotham Black, glitch) + "VALE O FRASCO?" (FRASCO amarelo) + chip da marca, ~10 s na tela. Veredito: selo **amarelo VALE O FRASCO** (aprovado) ou selo **Pimenta NÃO VALE** (reprovado), no mesmo desenho. **No episódio do veredito, o selo já entra na capa junto com o gancho (desde o 1º quadro) e fica ~11 s preso na tela.** O template é igual nos dois casos, só muda o selo | vídeo real |
> | Carrossel | **CA1**: estilo tweet | Creme/claro |
> | Carrossel | **CA2**: Laudo/Comparativo/Ranking | Petróleo + cartelas das famílias |
> | Carrossel | **CA3**: Família da vez, fundo na cor da família do perfume do tema | Menta, Rosa Antigo, Bergamota, Pimenta, Algodão… |
> | Estático | livre | — |
>
> Registrar no `feed-log.csv` o template de cada publicação (coluna `template`). AV2 aprovado e criado (v25, creme). Ainda falta criar: o selo NÃO VALE, CA2 e CA3.

---

## 3. Biblioteca de templates de capa

Cada template tem família, posição do texto e tipografia dominante. Variar esses três eixos é o que impede o mosaico artificial.

### Dark Petróleo (D)
| Código | Nome | Texto | Tipo | Quando usar |
|---|---|---|---|---|
| **D1** | Frasco Herói | base | Bodoni | Laudo de 1 perfume. Frasco real frontal, em pé, centro; título curto embaixo; Selo |
| **D2** | Manchete Bodoni | topo | Bodoni | Sem foto. Frase forte; 1 palavra em Amarelo; filete Âmbar |
| **D3** | Número Âmbar | lateral | Figtree | Rankings e listas. Número gigante em Âmbar, texto em Figtree 700 ao lado |
| **D4** | Plantão | topo | Anton | Promoção real, notícia, comédia "plantão". Faixa Petróleo Noite + Anton amarela |
| **D5** | Split Noite | lateral | Bodoni | Árabe ou Grife?, contraste de ideias. Metade frasco em foco de luz, metade texto |
| **D6** | Tribunal | centro | Anton | Comparativos e "X vs Y". Dois frascos, "VS" em Anton amarelo |
| **D7** | Manchete + Rosto | topo | Anton | **Referência da paleta** (post "O hábito mais saudável"). Petróleo com textura de pontos, manchete Anton creme + palavra gigante Amarela, frascos no centro, rosto da Osiany em moldura arredondada embaixo |

### Light Bege (L)
| Código | Nome | Texto | Tipo | Quando usar |
|---|---|---|---|---|
| **L1** | Página de Revista | topo | Bodoni | Achadinhos, dicas, frases de marca. Título grande, frasco pequeno deslocado, marca-texto amarelo |
| **L2** | Ficha Laudo | grade | Figtree | Ficha técnica: chips de família, fixação, projeção, preço em etiqueta Âmbar |
| **L3** | Citação | centro | Bodoni | Confissões dos Borrifados, comentário de seguidor, frase da Osiany. Aspas gigantes em Petróleo |
| **L4** | Janela Petróleo | base | Bodoni | Presente sem erro, lançamentos. Arco Petróleo com o frasco dentro, texto embaixo |

### Fotográfica editorial (F)
| Código | Nome | Texto | Tipo | Quando usar |
|---|---|---|---|---|
| **F1** | Cena Editorial | base | Bodoni | Frasco em cenário (madeira, pedra, tecido) na cor da família olfativa; degradê Petróleo Noite na base |
| **F2** | Na Pele | lateral | Figtree | Pulso/mão da Osiany com o frasco. Teste do Calor, fixação |
| **F3** | Notas à Mesa | topo | Anton | Flat lay: frasco + ingredientes reais das notas |

### Âmbar / Amarelo (A)
| Código | Nome | Texto | Tipo | Quando usar |
|---|---|---|---|---|
| **A1** | Veredito Amarelo | centro | Anton | PASSA LONGE polêmico, estreia do Plantão (Black Friday 27/11), marcos do perfil |
| **A2** | Âmbar Noturno | base | Bodoni | Gourmand/baunilha/oud de destaque, Natal, edição especial |

---

## 4. Regras de alternância (o script aplica todas)

**Bloqueios (a capa não pode ser feita):**
- **R1 · Composição:** nunca o mesmo template duas vezes seguidas, e no máximo 2 vezes nas últimas 9. Isso garante que nunca existam 3 capas consecutivas com a mesma composição.
- **R2 · Família:** no máximo 2 capas seguidas da mesma família. F e A nunca seguidas. Entre duas capas A, no mínimo 12 posts.
- **R3 · Sem alternância rígida:** proibido criar padrão repetido nas famílias (D L D L, D L F D L F, D L D F D L D F…).
- **R4 · Grade de 3 colunas:** a capa nova fica em cima da que foi publicada 3 posts antes. As duas não podem ter o mesmo template e precisam diferir em família, posição do texto ou tipografia. A linha de cima nunca fica com 3 capas da mesma família.
- **R5 · Variação:** posição do texto diferente da capa anterior; a mesma tipografia dominante no máximo 2 vezes seguidas.

**Prioridade (entre as liberadas):**
1. Família mais atrasada em relação à meta dos últimos 20 posts.
2. Template usado há mais tempo.
3. Mais diferente da capa de baixo na grade.
4. **A** só é sugerida sozinha depois de ~20 posts sem ela. Antes disso, só com `--especial` (data comemorativa, veredito polêmico, marco).

---

## 5. Destaques com Âmbar e Amarelo (por família)

| Família | Palavra-chave / punchline | Números, nota, preço | Selo |
|---|---|---|---|
| **D** | Texto Amarelo `#FFC93C` | Texto Âmbar `#D49A4E` (≥ 24 px) | Canto superior direito |
| **L** | **Marca-texto**: bloco Amarelo atrás, texto Petróleo Noite | **Etiqueta** Âmbar com texto Petróleo Noite | Selo (anéis Petróleo Noite já separam do bege) |
| **F** | Amarelo só sobre degradê Petróleo Noite ≥ 70% | Âmbar só sobre degradê ≥ 70% | Canto superior direito |
| **A** | **Faixa** Petróleo Noite com texto Creme | Texto Petróleo Noite | Monograma no lugar do Selo |

- **Proibido:** texto Âmbar ou Amarelo direto sobre o bege (2,0:1 e 1,3:1). Creme sobre Âmbar/Amarelo também não.
- Âmbar e Amarelo **nunca como texto lado a lado**. Âmbar = luxo (linha, número). Amarelo = Selo e piada.
- Amarelo no máximo 1 vez por slide (exceto família A).

---

## 6. Grade do Instagram

- A grade do perfil mostra miniaturas **3:4**. Na arte 1080×1350, manter texto e Selo dentro da faixa central de **1012 px** de largura. Na capa de Reel 1080×1920, dentro da área 3:4 central (1080×1440).
- Antes de aprovar, olhar `grade-preview.html`: a próxima capa já aparece no canto superior esquerdo, empurrando as outras.
- Teste dos 2 segundos: de longe, a grade tem que parecer **uma marca** (Petróleo + Selo + Bodoni) e **não um tabuleiro** (nada de xadrez D/L perfeito, nada de colunas de uma cor só).

---

## 7. Checklist de aprovação da capa

- [ ] Rodei o script e o template escolhido está liberado.
- [ ] Só cores oficiais; nenhum HEX novo.
- [ ] Destaque segue a tabela da seção 5 (nada de âmbar/amarelo como texto no bege).
- [ ] Selo ou monograma presente; marca "VALOTA" visível.
- [ ] Texto dentro da área segura 3:4.
- [ ] Depois de publicar: registrado no `feed-log.csv`.

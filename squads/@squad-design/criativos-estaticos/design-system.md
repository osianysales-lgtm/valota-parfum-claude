# Design System — Valota Parfum

> **Identidade oficial aprovada em 09/11/2026** (brand-squad, estudo de cores com evidência científica).
> Vale para TODO criativo relacionado a perfume. Manual completo:
> `squads/@community/brand-squad/brand-squad/output/v1/step-04-identity-system.md`
> (O modelo em branco original está em `design-system.TEMPLATE.md`.)

---

## Identidade Visual

**Nome da empresa:** Valota Parfum (@valotaparfum)
**Segmento:** Criação de conteúdo sobre perfumes: resenhas sinceras de nicho, árabes e grife
**Tom visual:** luxo na forma, humor no conteúdo. Fundo petróleo profundo, serifa elegante, frasco real, e o Selo amarelo como "carimbo" de veredito. Sincera, cúmplice e direta. Nunca ostentação preto + dourado.

---

## Paleta de Cores

### Regra 60-30-10

**Cor primária** (60%: fundo principal, áreas dominantes):
`#0F2E33` Petróleo. Usar em degradê radial: centro `#1A4A52` (Petróleo Luz) e borda `#0A1F23` (Petróleo Noite). Nunca chapado em capa inteira.

**Cor secundária** (30%: slides internos, containers, texto sobre petróleo):
`#F2E8D8` Creme Pergaminho. Todo slide creme leva **filete Petróleo de 16 px na base**, porque o creme some no modo claro do Instagram.

**Cor de destaque** (10%: Selo, palavra-chave, punchline, preço de achadinho):
`#FFC93C` Amarelo Laudo, no máximo 15% da peça e no máximo 1 vez por slide.

---

### Paleta Completa

**Cores principais:**
- Petróleo: `#0F2E33`, base
- Petróleo Noite: `#0A1F23`, profundo, vinheta, **texto sobre creme e sobre o Selo**
- Petróleo Luz: `#1A4A52`, só no centro de degradês
- Creme Pergaminho: `#F2E8D8`, papel e texto sobre petróleo
- Âmbar: `#D49A4E`, detalhe de luxo (filetes finos, número de ranking, preço, "V" do monograma), 5%
- Amarelo Laudo: `#FFC93C`, Selo e humor

**Famílias olfativas (chips com nome escrito, nunca só a cor):**
- Cedro `#6B4430` (amadeirado/oud), texto creme
- Âmbar `#D49A4E` (baunilha/gourmand), texto `#0A1F23`
- Bergamota `#B8BC5C` (cítrico), texto `#0A1F23`
- Menta `#7DBFB3` (fresco/aquático), texto `#0A1F23`
- Rosa Antigo `#E6AEB9` (floral), texto `#0A1F23`
- Pimenta `#9C452A` (especiado/couro), texto creme
- Algodão `#DCD6E2` (almíscar/limpo), texto `#0A1F23`
- Cedro e Pimenta sobre petróleo levam contorno creme de 2 px.

**Neutros:**
- Texto principal (sobre petróleo): `#F2E8D8`
- Texto secundário (sobre petróleo): `#F2E8D8` com opacidade mínima de 88% (nunca abaixo de 78%)
- Texto sobre creme: `#0A1F23`
- Fundo base: `#0F2E33`
- Branco: não usar branco puro; usar o creme `#F2E8D8`

### Combinações proibidas
- Texto âmbar ou amarelo sobre creme (contraste de 2,0:1 e 1,3:1)
- Preto + dourado (código de todo o nicho, não diferencia)
- Texto com opacidade baixa ou letra fina

### Contraste (WCAG, calculado)
| Texto / Fundo | Contraste |
|---|---|
| Creme / Petróleo | 11,9:1 |
| Amarelo / Petróleo | 9,4:1 |
| Âmbar / Petróleo | 5,9:1 (só ≥ 24 px) |
| Petróleo Noite / Creme | 14,0:1 |
| Petróleo Noite / Amarelo (Selo) | 11,1:1 |

---

## Direção de arte do FEED (obrigatória antes de qualquer capa)

Toda capa que vai para a grade do Instagram segue `squads/@valotaparfum/direcao-de-arte/DIRECAO-DE-ARTE.md`:
proporções no feed **50% Dark Petróleo · 30% Light Bege · 15% Fotográfica · 5% Âmbar/Amarelo**, templates D1–D6, L1–L4, F1–F3, A1–A2,
e regras de alternância. Antes de escolher o layout, rodar `python3 squads/@valotaparfum/direcao-de-arte/proxima-capa.py`
(analisa as últimas 9 publicações do `feed-log.csv`). Depois de publicar, registrar com `--registrar`.

---

## Tipografia

**Fonte principal (títulos/display):** Bodoni Moda
> Disponível no Google Fonts: `Bodoni Moda`
> Pesos: **600 e 700** (nunca 400). Eixo óptico `opsz 18` para o traço fino não sumir (`font-variation-settings:'opsz' 18`).

**Fonte de humor / Selo:** Anton
> Disponível no Google Fonts: `Anton`
> Peso único. Para Selo, Plantão, punchline e manchete, no máximo 8 palavras.

**Fonte secundária (corpo/UI):** Figtree
> Disponível no Google Fonts: `Figtree`
> Pesos: 500, 600, 700 (400 só em corpo grande)

No máximo 2 famílias por peça.

### Hierarquia Tipográfica (canvas 1080 × 1350)

| Nível | Tamanho | Peso |
|-------|---------|------|
| Título de capa (Bodoni) | 88–120px | 600–700 |
| H1 de slide (Bodoni) | 72–88px | 600 |
| H2 / manchete (Anton) | 48–64px | 400 (único) |
| Corpo (Figtree) | 36–40px (nunca menos de 32) | 500 |
| Rótulo / chip (Figtree) | 28px | 700 |

---

## Logo

**Monograma:** anel do Selo + "V" em Bodoni 700. Círculo Petróleo com degradê Petróleo Luz, anel e "V" em Amarelo Laudo e filete Âmbar fino.
**Caminho:** `_assets/` (gerar os PNGs: monograma, Selo × 3 vereditos)

**Versão para fundo escuro:** monograma amarelo sobre petróleo / assinatura "VALOTA PARFUM" em Bodoni creme
**Versão para fundo claro:** assinatura em Petróleo Noite

### Selo Valota (ativo nº 1)
- Vereditos: **VALE O FRASCO · VALE O DECANT · PASSA LONGE**
- Fundo `#FFC93C`, anéis e texto `#0A1F23`, **vetor limpo, sem textura**
- Anel superior "VALOTA PARFUM", anel inferior "NA PELE, NÃO NO HYPE", ambos lidos de pé
- Girado −8°, sempre no canto superior direito, cerca de 22% da largura
- PASSA LONGE também é amarelo; muda só o texto. **PASSA LONGE nunca tem link.**

### Regras de uso
- Tamanho mínimo digital do Selo: 160px de largura
- Zona de proteção: 24px em volta do Selo
- Nada de brilho dourado na assinatura

---

## Gradientes Aprovados

```
G1 (fundo padrão): radial-gradient(90% 90% at 35% 40%, #1A4A52 0%, #0F2E33 55%, #0A1F23 100%)
G2 (faixa de Plantão / rodapé): linear-gradient(180deg, #0F2E33 0%, #0A1F23 100%)
```

---

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| sm | 4px | Chips de família, faixas |
| md | 8px | Cards de preço |
| lg | 12px | Cards grandes |
| full | 9999px | Selo, monograma, pills |

---

## Formatos

- **Capa de carrossel:** fundo G1, frasco real recortado (frontal, em pé), título Bodoni creme, Selo no canto superior direito
- **Slides internos:** fundo creme, texto `#0A1F23`, filete petróleo de 16 px na base, chips de família no topo
- **Slide final:** fundo G1, CTA em Figtree, preço em Amarelo Laudo se for achadinho, bordão "Se vale, a Valota fala."
- **Achadinho com link:** "#publi / link de afiliado" no início da legenda (CONAR 2026)

---

## Exemplos de artes anteriores (opcional)

- Prévia da identidade: `squads/@community/brand-squad/brand-squad/output/v1/brand-strategy-presentation.html`

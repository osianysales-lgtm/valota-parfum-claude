# Carrossel estilo tweet · Valota Parfum

Slides 1080×1350 (4:5) no formato "print de tweet": foto, nome e @ no topo e texto embaixo.
Tipografia: **Gotham Black** no nome, **Montserrat** no resto (ExtraBold no título da capa, SemiBold nos títulos, Regular no texto).
Cores: só a paleta Petróleo & Âmbar. O texto é em Petróleo Noite e a bolinha dos passos é Âmbar.

## Fazer um carrossel novo
1. Copie a pasta `carrosseis/exemplo` e dê outro nome a ela (ex.: `carrosseis/erros-perfume`).
2. Edite o `carrossel.json` dessa pasta e coloque as fotos dentro dela.
3. No Terminal:
   ```
   cd ~/Downloads/ClaudCode/squads/@valotaparfum/carrossel-tweet
   python3 gerar.py carrosseis/erros-perfume/carrossel.json
   ```
4. Os PNGs saem em `saida/` (01.png, 02.png…). O `previa.html` mostra todos lado a lado.

A estrutura do texto está em `ESTRUTURA-DE-COPY.md`.

## Tipos de slide
- **capa**: `titulo` (aceita emoji), `subtitulo`, `imagens` (0 a 3).
- **texto**: `titulo`, `texto` (linha em branco = parágrafo novo), `passo` ou `passos` (linhas com a bolinha âmbar), `imagem` (opcional).
- **final**: `texto` (CTA). Mostra o @ e o botão Seguir, **sem número de seguidores**. As 3 miniaturas saem dos prints em `feed-atual/` (1.png = mais recente, 2.png, 3.png). **Antes de gerar, peça à Osiany o print das 3 últimas publicações.** Sem os prints, o gerar.py avisa e põe marcadores no lugar.

Imagem pode ser `"foto.jpg"` ou `{"img": "foto.jpg", "legenda": "faixa no topo"}`.
Sem foto, use `{"marcador": "texto"}` e o espaço aparece com o degradê petróleo e o texto no meio.
`**palavra**` deixa a palavra em negrito. `→` sai com seta de tamanho normal.

## Recortes (frascos e notas sem fundo)
Usados em comparativos e em posts sobre notas. A imagem aparece inteira, sem corte, sobre um painel creme com sombra leve.
- **Na capa:** dentro de `imagens`, use `{"recorte": "frascos/x.png", "legenda": "NOME NO TOPO", "nome": "texto embaixo"}`.
- **Nos slides de texto:** `"recortes": [ ... ]` com 1 a 4 itens. A fileira vai no pé do slide, e o slide fica um pouco mais compacto pra caber (texto curto: 1 ou 2 parágrafos).
- **Opções:**
  - `"painel": "creme"` (padrão), `"branco"` ou `"petroleo"`;
  - `"forma": "circulo"` para textura que não dá pra recortar (casca, madeira), que vira amostra redonda;
  - `"marcador"` é o texto que aparece enquanto o arquivo não existe.
- **Para recortar:**
  - `swift ../direcao-de-arte/ferramentas/recortar-pessoa.swift foto.jpg recorte.png` (funciona com objeto também);
  - `swift ../direcao-de-arte/ferramentas/aparar-recorte.swift recorte.png final.png` tira a sobra transparente. Os argumentos opcionais `y0 y1` (0 a 1) escolhem a faixa da imagem, por exemplo quando o recorte pegou 2 objetos.
- **Fotos de frasco:** usar a foto oficial da loja da marca (Shopify: `<loja>/products/<produto>.json` lista as imagens).
- **Fotos de nota:** Wikimedia Commons, **sempre com crédito** no comentário ou na legenda.
- Exemplo completo: `carrosseis/creed-aventus-x-cdnim`.

## Opções
- `"fundo": "branco"` (igual à referência) ou `"creme"` (bege da família Light).
- Foto de perfil: `avatar.png`. O nome e o @ ficam em `perfil.json`.

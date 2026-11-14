# ranking (tier list)

**Ideia:** uma tier list clássica, no estilo TierMaker, sobe por baixo da pessoa. Cada item aparece grande no meio da tela e voa até a sua fileira, do pior para o melhor, e o campeão cai no S por último, com impacto.

## Obrigatório
- **Título em duas linhas** acima da cabeça: a primeira forte (Inter 800) e a segunda em `Instrument Serif` itálico, na cor de destaque. Ex.: "Melhores cafés / da cidade".
- **Quadro de fileiras S, A, B, C, D** com as cores clássicas: S `#ff7f7f`, A `#ffbf7f`, B `#ffdf7f`, C `#ffff7f`, D `#bfff7f`. Rótulo quadrado com a letra grande em preto e faixa escura (`#1e1e1e`) para os itens, sobre um painel ainda mais escuro, com sombra.
- **Cartinhas** quadradas escuras com borda clara e o nome em branco, centralizado (ou ícone simples desenhado + nome).
- Cada cartinha **aparece grande** (1,7× a 1,9×) perto do pescoço, segura um instante e **voa** até o lugar dela.
- O **S por último**, segurando um pouco mais.

## Liberdade
Tema, itens, quantas fileiras (4 ou 5), quantos itens (de 5 a 8). Uma fileira pode ficar vazia.

## Composição
- O quadro ocupa a largura (margem de 30 a 40 px) e vai do peito até cerca de y 1860, sem cobrir o queixo. Fileiras de 110 a 130 px.
- Título acima da cabeça, com `sombraTopo` se o fundo for claro.
- A cartinha grande aparece entre o queixo e o topo do quadro, sem cobrir a boca.

## Linha do tempo
- 0 a 0,15: título batendo (duas batidas).
- 0,05 a 0,2: o quadro sobe de baixo (`E.outCubic`).
- 0,2 a 0,85: as cartinhas, uma a cada 0,15 a 0,22 s (aparece, segura de 0,1 a 0,18 s, voa em 0,14 s).
- A última (S) termina perto de 85 % e o resto segura.

## Personalize
Tema e itens vêm da pessoa. Se ela não disse, pergunte ("qual o ranking? quais itens em cada fileira?"). É opinião dela: nunca escolha a ordem de marcas por conta própria sem confirmar.

## Evite
Emoji (sai cinza no render), nomes longos demais para a cartinha (use `caber()` ou abrevie), mais de 3 itens numa fileira.

# widgets-flutuantes

**Ideia:** widgets de vidro fosco, como os da tela do iPhone, aparecem um a um e flutuam em volta da cabeça da pessoa, contando uma mini história do vídeo (números, perfil, progresso).

## Obrigatório
- De 4 a 6 cards de **vidro fosco** (`vidro()`): o fundo desfocado atrás, tinta branca bem leve, borda clara de 2 px, cantos bem arredondados (28 a 40 px; 50 % nas pílulas e anéis).
- Pelo menos **um número grande** que conta (de 1 até o valor) e **um elemento de progresso** (barra que enche ou anel que fecha).
- **Um card de perfil** com foto redonda, nome e @. A foto vem de `imagens/` ou, sem foto, de um recorte quadrado do rosto no próprio quadro.
- Uma **pílula de assinatura** embaixo, centralizada (uma assinatura curta que faça sentido para o vídeo), com uma palavra na cor de destaque.
- Os cards **flutuam** depois de entrar (seno lento, fase diferente para cada um).

## Liberdade
O conteúdo de cada card (minigráfico de barras, contador, "Renderizando", clima, música, notificação...), o tamanho e a posição exata. Escolha pelo assunto do vídeo.

## Composição
- Cards nas laterais da cabeça e acima dela, sem invadir o rosto (o lado de dentro não passa da largura do rosto + 20 px).
- Dois cards mais altos acima da linha dos olhos e dois mais baixos na altura da boca, alternando os lados.
- A pílula fica perto de y 1600, centralizada, e não pode cobrir o queixo.

## Fontes e cores
Inter (600 a 800). Branco sobre vidro. Uma cor de destaque só: a das barras, do anel e da palavra da pílula.

## Linha do tempo (proporção do trecho `k.d`)
- 0,02 a 0,35: os cards entram um a um com `pop` (intervalo de 0,12 a 0,2 s).
- 0,15 a 0,6: os números contam e as barras crescem.
- 0,3 a 0,9: barra ou anel de progresso enchendo.
- 0,45: a pílula entra.
- O tempo todo depois de entrar: flutuação de 4 a 8 px.

## Personalize
Nome, @, foto, o número principal e o que ele significa ("3 dias", "12 receitas", "5 passos"). Sem dados reais, prefira números que não pareçam estatística da pessoa.

## Evite
Fundo muito claro e liso atrás dos cards (o vidro some: aumente a tinta ou escureça o card), cards cobrindo o rosto, mais de 6 cards.

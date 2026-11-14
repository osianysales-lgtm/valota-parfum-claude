# órbita

**Ideia:** os vídeos/reels da pessoa giram em volta dela num anel em perspectiva, passando **na frente** e **por trás** do corpo, com um título acima da cabeça.

## Obrigatório
- De 6 a 8 **cards verticais** (`cartao()`, 9:16) num anel elíptico inclinado (−6° a −10°). Os cards de trás ficam menores e são desenhados **antes** de `pessoa()`; os da frente, maiores e **depois**. Ordene pela profundidade.
- Uma **linha fina do anel** (branca, 30 % a 40 %), com a metade de trás atrás da pessoa e a metade da frente na frente.
- O anel **abre em espiral** (raio de pequeno a cheio) no começo e depois gira em velocidade constante.
- **Título em duas linhas** acima da cabeça (Inter 800 + `Instrument Serif` itálico na cor de destaque), batendo palavra por palavra, com `sombraTopo`.

## Liberdade
A altura do anel (peito é o mais seguro; cintura também funciona), a quantidade de cards, a velocidade (meia a uma volta no trecho), o texto do título.

## Composição
- Centro do anel na altura do peito: cerca de `k.rosto.queixo + 1,1 × altura do rosto`. Raio horizontal de 430 a 480 px, vertical de 110 a 150 px.
- Os cards da frente passam pelo peito, **nunca pelo rosto**. Se o anel subir, diminua os cards para não cobrir a boca.
- Fundo levemente escurecido (preto a 20 %–25 %) para os cards saltarem.

## Linha do tempo
- 0 a 0,2: o anel abre em espiral, girando mais rápido.
- 0,05 a 0,25: o título bate.
- 0,2 até o fim: giro constante (de 1 a 1,6 rad/s).

## Personalize
Imagens: prints dos reels da pessoa em `imagens/`. Sem prints, use `amostras/` (momentos do próprio vídeo). Título: algo do assunto dela, por exemplo "Tudo que eu / já gravei".

## Evite
Cards passando no rosto, todos os cards iguais lado a lado (alterne as imagens), anel tão inclinado que pareça torto.

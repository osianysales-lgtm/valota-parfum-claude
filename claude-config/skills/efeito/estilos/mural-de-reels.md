# mural-de-reels

**Ideia:** uma frase de impacto em tipografia grande no topo, enquanto cards de reels sobem e flutuam **atrás** da pessoa, como um mural vivo. Leve aproximação da câmera.

## Obrigatório
- **Frase em 3 linhas**, uma por vez:
  1. curta e forte (Inter 800, branca);
  2. a palavra-chave grande em `Instrument Serif` itálico, na cor de destaque;
  3. o fechamento em preto dentro de uma **caixa branca** que se abre da esquerda para a direita (o texto só aparece onde a caixa já chegou).
- De 4 a 6 **cards** (`cartao()`) atrás da pessoa, com rotações diferentes (−0,12 a 0,12 rad), entrando de baixo e subindo devagar em velocidades diferentes (paralaxe).
- **Câmera aproximando** de 1,0 a 1,05 durante o trecho, com o mesmo zoom em quadro, cards e recorte.

## Liberdade
O texto, quantos cards, onde ficam (nas laterais e atrás da cabeça), a cor de destaque.

## Composição
- As três linhas ficam entre y 150 e a altura do `topo` da cabeça, centralizadas, sem encostar umas nas outras (deixe espaço para o descendente da serifa).
- Os cards ficam nas laterais e atrás da cabeça. Os de baixo podem aparecer ao lado dos ombros.

## Linha do tempo
- 0 a 0,25: os cards entram de baixo, um a cada 0,1 s.
- 0,05 / 0,15 / 0,25: as três linhas batem (de 1,25× para 1×, descendo 50 px).
- Depois: os cards continuam subindo devagar e a câmera aproxima.

## Personalize
A frase vem do que a pessoa fala no trecho (use `palavras.py` se precisar). Imagens: prints dela, ou `amostras/`.

## Evite
Linhas longas (máximo de 12 a 14 caracteres por linha nos tamanhos grandes) e cards na frente do rosto.

# Guia de design: o que faz um efeito parecer de editor bom

Vale para todos os estilos, e é o roteiro para criar um efeito que **não está na lista**.

## Princípios
1. **A pessoa é a estrela.** O efeito emoldura, explica ou reforça o que ela fala. Rosto sempre livre; o que precisa cruzar a pessoa passa **atrás** dela (o recorte).
2. **Uma ideia por efeito.** Um título, um painel, uma ação. Se precisa de legenda para entender, está complicado demais.
3. **Hierarquia clara:** um elemento grande (o título ou o objeto principal), dois ou três médios, detalhes pequenos. Nada disputa com o rosto.
4. **Ritmo:** entra nos primeiros 0,3 s, algo novo a cada 0,4–0,8 s, auge perto de 70 % do trecho, os últimos 0,5 s seguram tudo legível. Nunca "tudo aparecendo devagar com fade": use escala com `pop`, deslizar com `E.outCubic`, batida de título (de 1,4× para 1×).
5. **Estilo coerente:** no máximo 2 fontes e 1 cor de destaque (mais as cores neutras). A cor de destaque sai do próprio vídeo (algo da roupa, do fundo, da marca) ou do guia do estilo.
6. **Feito para celular:** texto principal de 80 a 140 px, secundário de 34 a 48 px, nada abaixo de 22 px. Contraste alto: texto claro sobre fundo escuro, com `sombraTopo` ou um painel atrás quando o fundo é claro e cheio de detalhes.

## Onde colocar as coisas (tela 1080 × 1920)
- **Faixas que o Instagram cobre:** os 8 % de cima (y < 150) e os 18 % de baixo (y > 1570) ficam livres de texto importante.
- **Acima da cabeça** (`0` a `k.rosto.topo - 30`): títulos.
- **Dos lados da cabeça:** cards pequenos, que não passem da linha das orelhas para dentro.
- **Abaixo do queixo** (`k.rosto.queixo + 40` em diante): painéis, listas, tier lists. Cobrir a roupa é ok.
- **Atrás da cabeça** (desenhado antes de `pessoa()`): palavras gigantes, círculos, cards, colagens.
- Se a pessoa não está no centro, equilibre: título e elementos maiores para o lado com mais espaço.

## Qualidade que dá para ver
- **Alinhar e respirar:** margens de pelo menos 40 px da borda, elementos alinhados entre si, espaço entre cards.
- **Profundidade:** sombras suaves (`shadowBlur` de 20 a 40, deslocamento para baixo), vidro, pessoa por cima de camadas.
- **Movimento contínuo:** depois de entrar, os elementos flutuam um pouco (seno lento) ou o "câmera" aproxima levemente. Nada fica 100 % parado.
- **Nada pisca:** sem aleatório por quadro, a não ser grão e tremida de stop motion, feitos de propósito com semente.

## Criando um estilo novo
1. Traduza o pedido em **3 palavras de clima** (ex.: "neon, noturno, cyberpunk") e numa **paleta de 3 a 4 cores**.
2. Escolha **onde** o efeito acontece (acima, atrás, abaixo, em volta) e qual é o **elemento principal**.
3. Escreva uma linha do tempo de 4 a 6 batidas (o que entra, quando, como).
4. Faça, confira a folha e dê nota como no SKILL.md.

Exemplos de pedidos fora da lista e um caminho para cada:
- **"neon"**: escurece o fundo (`g.filter = 'brightness(.45)'` no quadro), palavra em neon atrás da cabeça (texto com `shadowBlur` colorido em 3 camadas) e a pessoa por cima.
- **"manchete de jornal"**: papel claro, recorte P&B da pessoa (`pessoaAdesivo`), manchete em serifa e uma data pequena.
- **"contador"**: número gigante acima da cabeça subindo de 0 até o valor que a pessoa disse, com uma barra que enche.
- **"setas e rabiscos"**: `tracoMao` desenhando círculo e setas em volta, com uma anotação em `Permanent Marker`.

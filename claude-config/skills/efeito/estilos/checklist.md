# checklist

**Ideia:** um painel escuro do Claude ("O Claude está editando seu clipe") sobe sob o queixo e marca as etapas uma a uma. **Cada etapa marcada acontece de verdade na tela**: o rosto é encontrado, o fundo some, uma palavra aparece atrás da pessoa, a cor muda.

## Obrigatório
- **Painel** de vidro escuro (`vidro()` com tinta `rgba(16,16,15,.62)`) com cabeçalho "O Claude está editando seu clipe" e contador "N de 5" à direita. Na última etapa, o cabeçalho muda para algo como "Pronto: seu clipe foi editado".
- **5 linhas**, cada uma com `check()` à esquerda, o texto (claro quando feito, apagado antes) e uma etiqueta pequena à direita na cor de destaque.
- As etapas visíveis, na ordem:
  1. **Achou seu rosto:** cantos de mira (4 "L") na cor de destaque em volta da cabeça, entrando com escala.
  2. **Recortou você do fundo:** o fundo vai para preto e branco escuro (o quadro com `grayscale(1) brightness(.35)`) e a pessoa continua colorida por cima.
  3. **Pôs o texto atrás de você:** uma palavra gigante (Inter 900, de 200 a 260 px) **atrás** da cabeça.
  4. **Ajustou a cor:** a pessoa ganha um tom quente (`sepia(.35) saturate(1.35)`).
  5. **Renderizou em 4K:** só o check e o cabeçalho de pronto.

## Liberdade
O texto das etapas e das etiquetas, a palavra de trás (o assunto do vídeo, o nome da pessoa, "CLAUDE"...), a cor de destaque (o laranja do Claude, `#D97757`, é o padrão).

## Composição
- Painel com largura de 1000 px, de `k.rosto.queixo + 80` até no máximo y 1850. Linhas de 90 a 100 px de altura.
- A palavra de trás centralizada na altura do topo da cabeça, sem sair da tela (use `caber()` com 1000 px).

## Linha do tempo
- 0 a 0,1: o painel sobe.
- Checks em 0,13 / 0,26 / 0,4 / 0,54 / 0,7 do trecho, com cada efeito visual acontecendo junto do seu check (transição de 0,25 s).
- Depois: tudo segura e o cabeçalho de pronto aparece.

## Personalize
As etapas podem descrever o que a pessoa fala no vídeo. Sem pedido, use as 5 acima.

## Evite
Recorte ruim (cabelo parecido com o fundo): nesse caso diminua a força da etapa 2 e não use a palavra atrás. Texto do painel abaixo de 30 px.

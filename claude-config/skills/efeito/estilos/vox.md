# vox

**Ideia:** colagem de papel no estilo dos vídeos explicativos da Vox. A pessoa vira um recorte em preto e branco com borda de papel sobre um fundo bege, um bloco colorido é colado com fita atrás dela, o título bate em letras pesadas e uma caneta vermelha marca e anota à mão. Tudo se move "aos trancos", como stop motion.

## Obrigatório
- **Fundo de papel** bege (`#EDE6D6`) com textura de fibras (linhas curtinhas com `rnd` fixo, desenhadas uma vez num canvas guardado) e vinheta marrom suave. O fundo original do vídeo **some**.
- **A pessoa** com `pessoaAdesivo(g, k.recorte, { filtro: 'grayscale(1) contrast(1.35) brightness(1.08)', reticula: .4, borda: 12 })`, ancorada embaixo e levemente menor (de 0,92 a 0,95).
- **Bloco amarelo** (`#FFDD3C`) atrás da pessoa, girado de −2° a −4°, com retícula leve e **dois pedaços de fita** (`rgba(236,226,190,.85)`) nos cantos de cima.
- **Etiqueta** preta com texto em `Plex Mono` claro e espaçado (ex.: "GUIA RÁPIDO · PARTE 1").
- **Título** em `Archivo Black`, preto, em duas linhas que batem uma de cada vez.
- **Marca-texto amarelo** (`marcaTexto`) atrás de uma das linhas do título.
- **Caneta vermelha** (`#E2382B`): um círculo à mão (`tracoMao`) em volta de uma palavra ou número e uma **anotação** em `Permanent Marker` com seta apontando para a pessoa.
- **Stop motion:** as peças da colagem se movem no relógio de 12 fps (`passo`), com uma tremida de 2 a 5 px e de 0,5° por passo (semente = número do passo).
- **Grão** por cima de tudo (`grao(g, k, .5, 'multiply')`).

## Liberdade
O texto da etiqueta, do título e da anotação, a cor do bloco (amarelo é o padrão; vermelho-claro ou azul-claro também funcionam), o que é circulado.

## Composição
- Etiqueta em y 140–200, título logo abaixo (até y ~480), centralizados.
- Bloco de y ~560 até ~1500, com 80 % da largura.
- Anotação do lado com mais espaço, na altura dos olhos, alinhada para não sair da tela (meça o texto). A seta aponta para o rosto sem tocá-lo.

## Linha do tempo (no relógio de stop motion)
- 0 a 0,12: o bloco cola, subindo de baixo com `E.outBack`.
- 0,03 a 0,12: o recorte entra (de 1,1× para 0,94×).
- 0,13: a etiqueta aparece com `pop`.
- 0,18 / 0,24: as linhas do título batem.
- 0,32 a 0,42: o marca-texto passa.
- 0,45 a 0,55: o círculo vermelho se desenha.
- 0,55 a 0,7: a anotação se escreve (revelada da esquerda para a direita) e a seta se desenha.

## Personalize
Título e anotação vêm do assunto do vídeo (curtos: até 12 caracteres por linha do título).

## Evite
O fundo original aparecendo, texto colorido demais (só preto, amarelo e vermelho), anotação saindo da borda.

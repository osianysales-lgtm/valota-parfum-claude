# interface-de-app

**Ideia:** interface de app clara e limpa por cima do vídeo: cards brancos com grades de reels atrás da pessoa, pílulas azuis com check "estourando" em volta dela e, no fim, um card de perfil em que um cursor clica em **Seguir**, que vira **Seguindo**.

## Obrigatório
- **Dois cards brancos** (`rgba(250,250,250,.94)`, cantos de 30 px, sombra) **atrás** da pessoa, um de cada lado da cabeça, levemente girados (±0,08 rad), cada um com uma grade de miniaturas (3×3 ou 2×3) e um título pequeno (o @, "Reels"). Entram deslizando das laterais.
- De 3 a 5 **pílulas azuis** (`#0095F6`) com texto branco e um check, aparecendo com `pop` em volta do peito e dos ombros.
- **Card de perfil** branco embaixo: foto redonda, nome em negrito, @ e "criador" em cinza, e o botão **Seguir** azul à direita.
- **Cursor** (seta preta com borda branca) que entra de baixo, para no botão, "clica" (botão e cursor encolhem para 92 % por 0,12 s) e o botão vira **Seguindo** (cinza claro, texto preto).
- Vídeo levemente mais claro (`brightness(1.1)`) para combinar com a UI clara.

## Liberdade
O texto das pílulas (o que o vídeo entrega, por exemplo: "Rápido", "Fácil", "Grátis"), o conteúdo das grades, a posição exata.

## Composição
- Cards de grade acima dos ombros, nas laterais, atrás da cabeça. Podem passar um pouco da borda da tela.
- Pílulas entre o queixo e o card de perfil, sem cobrir o rosto.
- Card de perfil de y 1500 a 1700 (cuidado com a faixa de baixo do Instagram), margens de 60 px.

## Linha do tempo
- 0 a 0,15: os cards de grade deslizam para dentro.
- 0,05 a 0,15: o card de perfil sobe.
- 0,2 a 0,45: as pílulas, uma a cada 0,1 s.
- 0,55 a 0,7: o cursor viaja até o botão.
- 0,72: o clique; Seguir vira Seguindo.

## Personalize
Nome, @ e foto (de `imagens/`; sem foto, use um recorte do rosto). Miniaturas: prints dela ou `amostras/`.

## Evite
Imitar a marca do Instagram (logo, ícones oficiais): é uma interface **inspirada**. Pílulas sobre o rosto.

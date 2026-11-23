---
name: bonecos-luz-escura-sem-estouro
description: "21/11 parceria paga v1: 'cenário todo estourou', luz 'piscando toda hora', Rafa 'muito claro'; ela quer quarto mais ESCURO; objeto citado na fala tem que aparecer (perfume na gaveta)"
metadata:
  type: feedback
---

Em 21/11/2026 ela viu a v1 do episódio "parceria paga" (quarto) e reclamou de quatro coisas:
1. **"O cenário todo estourou"** e **"a cor do Rafa tá bugada, muito claro"**: o moletom verde-água ficou desbotado.
2. **"A iluminação fica piscando toda hora"**. A causa eram os raios de sol (`cine.shafts`) e a poeira, uma névoa aditiva na frente da câmera que muda a cada corte, somada a bloom alto na parede creme.
3. Ela quer o **quarto "mais pro escuro, mais escuro do que claro"**.
4. **A gaveta abriu e não tinha perfume dentro**, mas a fala diz que ele estava guardado lá. A gaveta era um bloco maciço, então o frasco ficou escondido.

**Why:** cena estourada tira a cor dos personagens e cansa a vista. Se a fala cita um objeto e ele não aparece, a história perde o sentido.

**How to apply (feito no quarto, `bon.quartoLuz`):** sem shafts e sem poeira, bloom 0.08 com threshold 0.95, exposição 0.85, ambiente 0.3, persiana quase fechada, luz de teto apagada. A luz vem do abajur, de um spot quente em cima do mural (que continua legível) e do brilho do notebook. Gaveta oca, frasco em pé com líquido pimenta e um close (GAVC) antes de ele pegar. Ação `mostraFrasco` deixa o frasco em pé na mão na altura do peito. Nas outras cenas (praça, loja), só mudar se ela pedir ([[nao-generalizar-ajuste-de-uma-saga]]). Em todo episódio: se a fala cita um objeto, conferir na prévia que ele APARECE. Ver [[bonecos-cena-quarto-motor]], [[bonecos-direcao-cena]].

**Atualização 21/11 (v3, depois de bronca: "coisa feia", "parece balada", "Rafa tem duas cores"):** o "piscando" NÃO era luz mudando dentro do plano. Medi com signalstats e o brilho fica estável dentro de cada plano. A sensação vinha dos CORTES: um plano claro e outro escuro, mais o "soco de zoom" a cada corte (`V.semSoco: true` desliga). Ela quer **iluminação de cinema**: fundo escuro, de investigação, com o rosto sempre iluminado. Implementei uma luz de rosto (key) quente e um contorno frio que acompanham cada personagem do lado da câmera (`bon.keyH`/`bon.keyA`), exposição 0.72, bloom 0 e ambiente 0.18. **Rafa = uma cor só** (`capuzEscuro` igual a `capuz` #1fa79c). Ela também apontou a Bia **atravessando o Rafa** quando os dois iam sentar: conferir os caminhos do `mov` pra que ninguém cruze ninguém. Mostrar a prévia ANTES do render: ela reclamou de gasto de tokens à toa.

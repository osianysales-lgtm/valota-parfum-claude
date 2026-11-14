# Escrevendo a conversa para o ElevenLabs

Quando a pessoa ainda não tem o áudio, escreva a conversa para ela gerar no ElevenLabs (modelo v3, com tags de emoção).

## Regras que fazem a voz soar bem

- **Entregue o bloco completo, pronto para colar.** Nada de "e aí continua assim". A pessoa copia e cola de uma vez.
- **Uma tag de emoção por frase.** No ElevenLabs v3 a emoção "acaba" no ponto final. Se a frase seguinte não tiver tag, ela sai neutra. Então: `[excited] Mano, olha isso. [curious] Como você fez?`
- **Uma voz só** para os dois personagens dá certo: o robô fala em `[whispers]` (sussurro) e o personagem com emoções variadas. Fica claro quem é quem, e a legenda do robô aparece em itálico laranja.
- **Frases curtas**, de 3 a 12 palavras. Cada frase vira um corte de câmera.
- **De 25 a 45 segundos** no total. Mais curto que isso não dá tempo de virar a história; mais longo perde retenção.

Tags úteis: `[excited]`, `[curious]`, `[surprised]`, `[laughs]`, `[sighs]`, `[sarcastic]`, `[proud]`, `[confused]`, `[whispers]`, `[serious]`, `[happy]`, `[annoyed]`.

## Estrutura que retém

1. **Gancho em 2 segundos**: uma frase que contraria o esperado ou promete um segredo. ("Eu não fui feito no Blender.")
2. **Curiosidade**: por que isso importa ("E todo mundo quer saber o meu segredo.").
3. **Virada**: o antes ruim e o depois bom, ou o problema e a solução.
4. **Prova**: um número, um resultado, algo que dá para mostrar na tela do computador.
5. **Piada ou respiro**: uma fala curta do robô quebrando a tensão.
6. **Chamada para ação**: uma palavra para comentar ("Comenta 3D que eu te mando...").

Pense no que vai aparecer na tela do computador em cada parte. Se uma frase não tem imagem forte, ela provavelmente pode sair.

## Exemplo (o vídeo do exemplo, 37 s)

```
[proud] Eu não fui feito no Blender.
[curious] E todo mundo quer saber o meu segredo.
[whispers] Se você me pedir um vídeo 3D do jeito normal...
[whispers] sai isso.
[annoyed] Que coisa feia, Claude!
[whispers] Eu sei.
[whispers] Agora olha com a skill.
[surprised] Mano.
[excited] Nosso primeiro vídeo fez 100 mil views em um dia.
[whispers] Ela me dá a experiência de um animador de verdade.
[whispers] Câmera, luz, movimento e som.
[whispers] A boca mexe com a voz e a câmera troca a cada fala.
[whispers] Cada quadro em código.
[proud] E eu nunca abri o Blender.
[whispers] Nem eu.
[whispers] Comenta 3D que eu te mando o segredo completo!
```

Não prometa ganhos no roteiro ("você vai ficar rico"); fale do que o vídeo mostra.

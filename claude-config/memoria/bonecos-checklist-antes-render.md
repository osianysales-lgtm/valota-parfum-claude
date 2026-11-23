---
name: bonecos-checklist-antes-render
description: "22/11 bronca: 'já era pra ter aprendido' (luz piscando, boneco por cima do outro, só pedaço de corpo); rodar qa_bonecos.py e olhar TODO corte antes de qualquer render de bonecos"
metadata:
  node_type: memory
  type: feedback
  originSessionId: cc7614fe-669a-4793-b035-df28db36cd13
  modified: 2026-11-22T03:49:45.029Z
---

Em 22/11/2026 ela viu o render final do episódio "parceria paga", que levou 1h30, e voltaram três erros que ela já tinha pedido pra corrigir:
- A luz continuava "piscando". Era a diferença de brilho entre cortes: os closes do mural ficavam ~110 e o quarto ~52.
- A Bia e o Rafa ficavam com os braços entrelaçados, em pé e sentados na cama.
- Um corte mostrava só o ombro do Rafa: a câmera do tour do mural estava atrás dele.

Ela disse: "já era pra você ter aprendido isso… não tem lógica demorar mais duas horas… não aguento ficar pedindo as mesmas coisas sempre".

**Why:** cada erro que passa custa 1h30 de render dela. Eu tinha olhado só 6 quadros escolhidos, e não um quadro de cada corte. O "piscar" já estava documentado em [[bonecos-luz-escura-sem-estouro]], mas eu não medi antes de renderizar.

**How to apply:** em TODO vídeo de bonecos, antes do render, rodar `python3 ~/.claude/skills/animador-zero/scripts/qa_bonecos.py <projeto> <tempos extras>`. Ele tira 1 quadro por corte, mede o brilho e monta `previa/qa.jpg`. Olhar TODOS os quadros e só renderizar se passar nos 4 pontos (o checklist completo está no SKILL.md do animador-zero, Passo 5):
1. **Brilho igual entre cortes:** nenhum plano marcado como PISCA. No quarto, ajustar `quarto.expShot`.
2. **Ninguém atravessa, encosta ou entrelaça braço:** ≥1,1 de distância, em pé e sentado.
3. **Nenhum plano só com pedaço de corpo ou móvel tampando.**
4. **Objeto citado na fala aparece.**

Só depois mostrar a ela. Ver [[bonecos-direcao-cena]], [[bonecos-cena-quarto-motor]].

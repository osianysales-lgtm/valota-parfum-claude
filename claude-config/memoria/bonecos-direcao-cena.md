---
name: bonecos-direcao-cena
description: Regras de direção/câmera de TODO vídeo de bonecos 3D (14/11/2026) — seguir o reel de referência; ação vira cena; info = corte pra tela 3D; nada na cara; nunca só o casco; boca sempre mexendo
metadata:
  node_type: memory
  type: feedback
  originSessionId: 02bdb40f-fa2f-4926-bbea-c3f2c4a23276
  modified: 2026-11-14T17:45:54.057Z
---

Referência: reel de onde ela comprou a skill Animador Zero — instagram.com/reel/Dfp6Q94tYU6 (menino + robô laranja, quarto com computador antigo).

**História**
1. **Ação vira cena, nada surge do nada.** Em vez de explicar com imagem por cima, o boneco FAZ: o Seu Valdir anda até a parede e pendura a placa dos R$ 29,90 (e na Parte 3 vai lá e troca). Vale pra qualquer objeto ou mudança da história.
2. **Mostrar informação = trocar de cena** pra tela do computador ou do celular dentro do cenário 3D (a tela enche o quadro, como no reel). Nunca card/tablet 2D sobreposto aos bonecos.

**Câmera**
3. **Nada tampa o boneco:** card, placa, frasco ou o outro boneco passando na cara. Gancho e textos finais só em plano com as cabeças longe do texto.
4. **Nunca só o "casco"** (topo/nuca da cabeça enchendo o quadro, câmera de cima com boneco abaixando a cabeça, câmera dentro da cabeça).
5. **Por cima do ombro pode** se mostrar as costas (corpo) de um e quem está de frente inteiro; o de costas fica só na borda.
6. **Variar distância:** plano aberto (corpo inteiro) e fechado (rosto + peito) intercalados, cada corte com motivo (fala, reação, ação).

**Boca**
7. **Boca mexe em TODA fala**, bem visível, nunca parada enquanto o boneco fala. Conferir no close.

**Luz**
8. **Iluminação fixa, de ambiente, sem piscar/pulsar** (14/11): no motor, o brilho (bloom) seguia a voz (`0.3 + 0.05 * env`) e os raios de sol "respiravam" (seno) → a imagem brilhava indo e voltando. Nos próximos: bloom constante e raios constantes, como no reel de exemplo. (Também havia um render duplo no motor — `if (BON && V.telaCelular) … else composer.render()` — que deixava a loja estourada/tremendo; corrigido 14/11, conferir que `renderFrame` é só `if (CINE) cineRender else stepScene`.)
8b. **Sem granulado de filme**: o shader de cor (gradeQ) sorteava ruído novo a cada quadro e o vídeo em ALTA ficava cintilando (o "(celular)" escondia). Removido do motor 14/11; vídeo já renderizado com granulado → refazer só o arquivo final com `-vf hqdn3d=3:2:8:6`. Ela posta o "REELS … PARTE X.mp4" (alta), então conferir sempre ESSE arquivo.
9. **Info no celular = insert 3D** (feito 14/11, `bonTela` no motor): com `telaCelular`, o plano SCR leva a câmera até a tela do celular na mão da Bia (ou do Rafa se só o dele estiver visível); a tela enche o quadro, o que fica na frente é cortado, sem raio de sol nem brilho. O celular grande no topo da tela foi aposentado.

**Why:** ela viu os 6 primeiros episódios e reclamou: boca fechada falando, card sobre o rosto da Bia, plano só da cabeça, coisa surgindo do nada ("coisa de preguiçoso", "faz isso virar realmente uma história"). A tentativa de pôr o card no topo da tela também foi reprovada.

**How to apply:** em todo roteiro.js de boneco, transformar cada explicação em ação encenada ou corte pra tela 3D; gerar folha de prévia (um quadro de cada plano) e mandar pra ela aprovar ANTES de renderizar. Backup do motor antes dos ajustes: ~/.claude/skills/animador-zero/backup-antes-ajuste-cabeca-telas-1411/. Ver [[serie-bonecos-6-episodios]], [[serie-bonecos-vozes-elenco]], [[serie-bonecos-3d-episodios]].

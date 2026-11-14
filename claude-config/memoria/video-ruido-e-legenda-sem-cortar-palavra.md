---
name: video-ruido-e-legenda-sem-cortar-palavra
description: "Limpeza de ruído dos vídeos gravados sem comer o 's' (filtro dividido graves/agudos) e legenda com no máximo ~20 caracteres por linha para nenhuma palavra sair da tela"
metadata:
  type: feedback
---

Em 11/11/2026 (v19 "3 perfumes designer que valem o frasco"), a Osiany reclamou que o "fresco" aparecia cortado, "só parece fre". Foram duas causas:
1. **Áudio:** a cadeia `highpass + afftdn nr=14 tn=1 + anlmdn` aplicada na faixa toda abafava o "s" (chiado parecido com ruído) em cerca de 14 dB.
2. **Legenda:** "PERFUME EXTREMAMENTE FRESCO" (white-space:nowrap, 62 px) passou dos 1080 px e o "SCO" ficou fora da tela.

**Why:** ela percebe palavra comida, tanto no som quanto no texto, e pede correção.

**How to apply:**
- **Redução de ruído padrão** para vídeos gravados no quarto dela (ar-condicionado com zumbido de 100–300 Hz): `highpass=f=75:poles=2,acrossover=split=1200[lo][hi]; [lo]afftdn=nr=20:nf=-48:tn=1,anlmdn=s=6:p=0.002:r=0.006; [hi]afftdn=nr=6:nf=-60; amix=inputs=2:normalize=0`. O fundo fica em cerca de -66 dB e as sibilantes ficam iguais ao bruto. Conferir medindo a energia do "s" de alguma palavra, bruto contra o limpo.
- **Legenda:** agrupar por no máximo 3 palavras **e** cerca de 20 caracteres. Antes do render, tirar snapshot das legendas mais longas.
- Também vale: se ela disser que repetiu uma palavra no começo de um take (ex.: "segundo" duas vezes), olhar a energia do áudio. A 1ª tentativa pode vir curta e separada por silêncio, e a transcrição às vezes engole. Ver [[video-nao-cortar-cheirando-perfume]].

---
name: voz-eleven-v3-reprovada-narracao
description: "21/11 v66: voz dela no eleven_v3 (com tags [whispers]/[laughs]) ficou \"não parece minha voz, muito esquisito\"; narração dela = sempre eleven_multilingual_v2, emoção só por pontuação"
metadata:
  type: feedback
---

No v66 (Granado review avatar) ela pediu emoção/cochicho/respiro na fala. Gerei a voz "Osiany Sales v2" no **eleven_v3** com audio tags e ela reprovou: "não parece minha voz, tá muito esquisito". O v3 também errou palavra ("macas") e o clone muda de timbre.

**Why:** o clone dela soa fiel só no eleven_multilingual_v2; nos bonecos o v3 funciona porque são vozes de biblioteca, não o clone dela.

**How to apply:** narração/avatar com a voz dela = `tools/voz.js` (multilingual_v2), sem tags; emoção vem de pontuação, reticências, perguntas e vícios ("né", "gente", "olha"). Se ela pedir tags de novo, avisar antes que no clone dela o v3 muda a voz e oferecer um trecho curto de teste. Também: ela pergunta coisas diretas no meio do trabalho (ex.: "come crédito?") → responder primeiro e curto. Ver [[voz-velocidade-padrao]], [[serie-bonecos-vozes-elenco]].

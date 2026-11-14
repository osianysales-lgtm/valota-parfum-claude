---
name: serie-bonecos-vozes-elenco
description: "Vozes ElevenLabs aprovadas do elenco da série de bonecos 3D (Valdir, Rafa, Bia) — nunca usar a voz da Osiany nos bonecos"
metadata:
  node_type: memory
  type: project
  originSessionId: fbff249a-2f46-47b2-bdeb-c478f71c4e21
  modified: 2026-11-14T06:15:52.004Z
---

Série de bonecos 3D (Animador Zero adaptado, 14/11/2026): os bonecos NÃO usam a voz da Osiany. Vozes aprovadas por ela (todas opção A das amostras em `squad-editor/output/serie-bonecos-cobrar-pra-cheirar/amostras-voz/`):

- **Seu Valdir** (dono da perfumaria, mais velho): Sergio "Friendly and Encouraging" (senhor rabugento-engraçado) `RGbeQtiShYRDVCrd9b9w`
- **Rafa** (rapaz, cliente): Davi Andrei `2CECaLAGTS5NRGxgbcxr`
- **Bia** (colega): Raquel "Expressive and Energetic" `GDzHdQOi6jjf8zaXhCYD`

Todas da biblioteca pública do ElevenLabs, pt-BR, modelo eleven_multilingual_v2 (stability 0.4, similarity 0.8, style 0.3). Lucas, Dona Cida e o robô Nota ainda não têm voz definida: mandar amostras A/B antes.

**Why:** ela pediu "vozes naturais que combinem com eles", não a dela.
**How to apply:** toda parte/série de bonecos usa esses IDs. Visual (decisão final 14/11, ela mudou várias vezes): Rafa = moletom VERDE-ÁGUA #1fa79c, cabelo PRETO #141414, SEM óculos, SEM fone. Seu Valdir = careca grisalho, bigode, camisa ÂMBAR #D49A4E. Bia = cabelo comprido escuro, blusa ROSA ANTIGO #E6AEB9. Loja: parede PETRÓLEO NOITE #0A1F23 (tem que ser diferente do chão de madeira; cedro se confundia com o chão). Escritório: parede ALGODÃO #DCD6E2. Cores sempre da paleta oficial, nunca HEX inventado; testar 2–3 opções num quadro e mostrar. `~/.animador-zero/personagem.json`. Ver [[copy-sempre-squad-e-narracao]].

**Fluxo da série (P1 de 14/11/2026):** `dialogo.json` → `tools/dialogo.js` (aceita `ajustes` por fala) → `montar.py <parte> 1.25` (ela escolheu **1,25x** pra diálogo, não o 1,47 da narração) → `roteiro.js` importa `tempos.js` → motor do Animador Zero com `elenco` + `cena: 'loja'` (modo bonecos que eu acrescentei no motor.js). Pasta: `squad-editor/output/serie-bonecos-cobrar-pra-cheirar/`. **Palavra difícil (ex.: "decant") sai embolada:** gerar a fala mais devagar (speed 0.88, stability 0.6) com grafia fonética ("decânti") e conferir com faster-whisper no áudio JÁ acelerado; a legenda continua com a grafia certa.

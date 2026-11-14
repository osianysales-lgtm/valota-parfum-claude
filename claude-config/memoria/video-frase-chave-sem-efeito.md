---
name: video-frase-chave-sem-efeito
description: Frase-chave/lição do vídeo fica SEM efeito sonoro (só a voz); tique de roleta/relógio sempre baixo e curto
metadata:
  type: feedback
---

No v31 (13/11/2026) a Osiany pediu duas coisas sobre o som:
1. "o som da roletinha girando ficou legal, porém muito alto": o tique de 2 s se sobrepunha e somava.
2. "quero que escutem certinho com minha voz" a frase "e descobrir a sua favorita é o primeiro passo pra não errar na compra".

**Why:** a frase que carrega a lição/conclusão do vídeo não pode disputar com riser, brilho, ding nem tique. Ela quer a voz limpa ali.

**How to apply:** em todo vídeo novo, marcar a frase-chave (a lição/virada) e deixar uns 0,3 s antes até o fim dela sem nenhum efeito (no gen.js do v31: `LIMPO` filtra os SFX e corta a cauda dos anteriores). Tique de roleta/relógio: volume ~0,1 e duração máx. ~0,55 s. Ajuste só de áudio: dá pra renderizar só o trecho (`hyperframes render --start/--end`) e encaixar o áudio (no v31 o trecho vem adiantado 640 amostras a 48 kHz). Ver [[video-avatar-formato]].

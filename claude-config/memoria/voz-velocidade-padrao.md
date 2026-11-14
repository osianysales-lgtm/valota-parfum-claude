---
name: voz-velocidade-padrao
description: "Velocidade da voz: o que vale é o RITMO do v28 Liquid Brun (≈4,35 palavras/s), não o número; v28 = 1,47x, v29 = 1,67x (voz saiu mais lenta). Mandar amostras e ela escolhe"
metadata:
  type: feedback
---

**DECISÃO NO v29 (13/11/2026):** ela fixou "1,47", mas a voz do v29 saiu mais lenta do ElevenLabs e 1,47x deu só 3,8 palavras/s. Mandei 2 amostras (1,47x e 1,67x) e ela escolheu **1,67x**, que é o ritmo do v28. Ou seja: o alvo é o RITMO (~4,35 palavras/s), e o fator muda a cada geração. **Como aplicar:** calcular o fator = fim da fala cortada × 4,35 ÷ palavras. Se ele ficar diferente de 1,47, mandar 2 amostras curtas (1,47x e o fator calculado) antes de renderizar.

**(Anterior) REGRA de 13/11/2026, 19h: ela mandou "então pode deixar no ritmo 1,47". Usar FATOR FIXO 1,47x no MP4 final em todo vídeo** (voz em 1x → corta as pausas maiores que 0,26 s na narração → acelera 1,47x com `setpts=PTS/1.47` + `atempo=1.47`). Depois do render, medir as palavras/s. Se ficar muito longe de ~4,3 (a voz crua do ElevenLabs varia a cada geração), avisar ela antes de mudar o fator.

**Confusão resolvida em 13/11/2026 (19h):** ela pediu "fixa 1,15" e logo depois explicou: "o último vídeo que você fez eu gostei da velocidade". O último vídeo era o v28 final, que foi acelerado **1,47x** (148 palavras, fala em 1x terminando em 50,2 s, final ≈ 34 s ≈ 4,35 palavras/s). A versão 1,15x do v28 tinha ficado LENTA. Ou seja, ela quer FIXAR o ritmo do v28/v24, e não o fator 1,15. Se ela falar em número de novo, confirmar com essa conta.

**Desde 13/11/2026 o padrão é o RITMO DO v24** ("homem que vai pro trabalho": 278 palavras em ~63 s de fala, **≈ 4,3–4,4 palavras por segundo** no vídeo final). Vale pra todo vídeo, avatar ou narração. Ela pediu: "usa sempre em todos os vídeos da velocidade do vídeo do homem que vai para o trabalho".

Histórico: 1,3x (11/11, top 5 árabes) → 1,15x (12/11, pedido dela) → no v28 (Liquid Brun x Althaïr) ela achou 1,15x **lento** ("só ficou lento") → ritmo v24.

**Why:** a voz do ElevenLabs sai em velocidades diferentes a cada geração (v24 crua 2,4 palavras/s; v28 crua 2,95). Por isso um fator fixo (1,15 ou 1,3) não garante o mesmo ritmo. O que ela quer é o ritmo que ouve, ou seja, as palavras por segundo.

**How to apply:**
- Gerar a voz em 1x. **Narração:** cortar as pausas maiores que 0,26 s (`cortar_pausas.py`). **Avatar:** cortar as pausas ANTES da HeyGen, e só se elas somarem mais de ~3 s (no v28 eram só 1,5 s e não valeu regerar). Renderizar em 1x (guardar o `render_1x.mp4`).
- **Fator final = (fim da fala em 1x × 4,35) ÷ nº de palavras**: no v28 deu 1,47x; no v24 deu ~1,3x depois do corte. Acelerar o MP4 final com `setpts=PTS/F,fps=30` + `atempo=F`, e conferir a clareza transcrevendo o áudio final.
- **Tamanho do roteiro a ~4,3 palavras/s:** 20–30 s ≈ 85–130 palavras · 30–45 s ≈ 130–190 · 45–60 s ≈ 190–260.
- Não refazer vídeo antigo sem ela pedir ([[regra-nova-vale-pros-proximos]]). Ver [[video-avatar-formato]].

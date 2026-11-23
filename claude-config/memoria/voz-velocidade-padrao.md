---
name: voz-velocidade-padrao
description: "Velocidade da voz FIXA 1,75x em TODOS os vídeos (decisão dela 14/11/2026, v33: \"vamos manter 1,75 pra todos ok TODOSSS\"); voz em 1x → HeyGen/render em 1x → acelera o final 1,75x"
metadata:
  type: feedback
---

## ⭐ REGRA ATUAL (14/11/2026): 1,75x FIXO EM TODOS
Ela escolheu 1,75x no v33 e mandou: "vamos manter 1,75 pra todos ok TODOSSS". **Não calcular fator nem mandar amostras de velocidade:** todo vídeo (avatar, narração, criativo) leva a voz gerada em 1x, as pausas >0,26 s cortadas, e o MP4 final acelerado **1,75x** (`setpts=PTS/1.75` + `atempo=1.75`). Só voltar a falar de velocidade se ela pedir. O conteúdo abaixo é o histórico de como se chegou aqui.

**v59 (19/11/2026):** depois de aprovar o storyboard, ela pediu "a voz eu quero em 1,67x" → refeito com `VEL=1.67` (cortar_pausas_energia + gen.py + narracao_167.wav). Ela confirmou "sem padrão": 1,67x foi SÓ no v59, o padrão continua 1,75x.


**v66 Granado (21/11/2026):** ela achou 1,75x "muito pra ele" e pediu 1,65x SÓ nesse vídeo (narracao_165.wav). Padrão continua 1,75x. Mudar velocidade não gasta crédito ElevenLabs (é ffmpeg local) — ela perguntou isso; responder curto e direto.

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

**v32 (14/11/2026):** a conta deu 1,51x (67,42 s × 4,35 ÷ 194). Mandei 1,47x e 1,51x e ela pediu "mais acelerado" e confirmou "1,51". Histórico de escolhas: v28 1,47 · v29 1,67 · v31 1,73 · v32 1,51. Ela sempre escolhe a amostra MAIS RÁPIDA quando as duas ficam perto do ritmo. Ela lembra sempre: "não esquece a velocidade da voz que combinamos".

**v33 (14/11/2026) · MEDIR EM SÍLABAS, NÃO EM PALAVRAS:** a conta em palavras deu 1,58x (4,35 pal/s) e ela achou 1,58 e 1,65 "lentos". Ela mandou o v32 publicado (top 5 árabes, 1,51x) como "padrão de narração". O v32 tem nomes árabes longos (1,75 sílaba/palavra) e sai a **~7,6 sílabas/s**; o roteiro do v33 tem 1,65 sílaba/palavra, então pra igualar precisou de 1,67x, e ela escolheu **1,75x (~8 sílabas/s)**. **Como aplicar:** fator = (fim da fala em 1x × 7,6 a 8,0) ÷ nº de sílabas (contar grupos de vogal). Mandar a amostra no ritmo do v32 e uma ~5% mais rápida, porque ela sempre escolhe a mais rápida. Histórico: v28 1,47 · v29 1,67 · v31 1,73 · v32 1,51 · v33 1,75. **v52 (17/11): ela pediu 1,65x só nesse vídeo** ("coloca a voz em 1,65"); o padrão de 1,75x continua até ela dizer que mudou.

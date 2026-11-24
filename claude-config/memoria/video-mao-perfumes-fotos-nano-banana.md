---
name: video-mao-perfumes-fotos-nano-banana
description: "18/11 formato \"mão segurando perfumes\" a partir de fotos do Nano Banana (sem Veo) — tremida na troca, mesmos quadros da referência, reel sem áudio"
metadata:
  node_type: memory
  type: project
  originSessionId: 5b4d4aec-5dc6-497f-a649-c0dbc877d79b
  modified: 2026-11-19T01:08:45.607Z
---

Em 18/11/2026 a Osiany pediu um vídeo igual ao `inspiracao.mp4`: 6 perfumes numa mão, nota + emoji no topo e a fala "this is a 10…". A mão e a rua à noite foram feitas no Nano Banana (Gemini). Não deu pra gerar a voltinha no Veo, então ela pediu outro jeito: foto parada + "tremida na mão quando troca de perfume".

- O molde é `mao-voltinha/gerar.py`. Ele usa as fotos de `mao-voltinha/gemini/01..06-*.jpg` e corta nos quadros exatos da referência. Cada foto tem um balanço leve de celular, e cada troca tem uma tremida forte com borrão de movimento. Os textos ficam em Didot Bold condensada, com os emojis da Apple.
- Ela pediu **igual ao dele**: mesma ordem, mesmas notas, mesmos emojis, mesma letra e mesmos segundos. Isso vale só pra esta peça ([[nao-generalizar-ajuste-de-uma-saga]]). Aqui não entra a Montserrat ([[tipografia-posts-videos]]).
- O reel é entregue **sem áudio**, porque ela coloca no Instagram o áudio que salvou. A versão com áudio serve só pra conferir o tempo.
- Pra manter a mão igual no Gemini, sempre anexar a foto-base escura `01-liquid-brun.jpg` junto com a foto oficial do frasco. Conferir o rótulo ampliado em todas.

**Why:** é o formato de frascos só com música ([[formato-viral-frascos-so-musica]]) sem precisar ter os perfumes em mãos.
**How to apply:** pra um novo vídeo nesse estilo, gerar as fotos com o mesmo prompt-base, trocar `IMGS`, `TEXTOS` e `CORTES` no gerar.py e renderizar com um Python que tenha Pillow, numpy e fonttools.

**23/11 · 2º vídeo no formato (Hawas line 10/10, ref instagram.com/reel/Df7bo_-Oskb):** molde novo em `hawas-video/gerar.py`, com fotos em `hawas-video/fotos/01..06`, letra Lilita One branca com contorno preto, emojis da Apple e cortes nos quadros dele (397 q). A 1ª troca ("raio de luz da persiana", com feixe de luz passando por cima) foi REPROVADA: "parece folha virando, coisa de Word… preciso que você seja ótimo, não bom". Ela não quer NENHUMA camada por cima na troca (luz, flash, separação de cor). Ficou: "zoom pelo frasco", só movimento de câmera. Mergulha no frasco em 3 quadros (até 1,6x, giro de 2°), o novo entra a ~1,5x e assenta em 7 quadros com um tranco leve de pouso. O borrão é radial, feito com 72 sub-quadros e extrapolado no quadro do corte pra não sumir. A versão reprovada está em tmp/gerar_v1_raio_de_luz.py. O texto vai em y 250 porque a tampa nas fotos do Gemini fica mais alta que na ref. Reel de referência: `uvx yt-dlp` baixa sem login, mas post /p/ às vezes pede login (a inspiração Df67wV6z8aM não baixou).

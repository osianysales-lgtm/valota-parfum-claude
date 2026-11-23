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

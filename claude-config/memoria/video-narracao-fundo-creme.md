---
name: video-narracao-fundo-creme
description: Vídeos de NARRAÇÃO (sem avatar) da Valota Parfum = fundo creme com âmbar e fontes grossas (nada fino no fundo claro); tema TEMA=creme do gen.js do v20
metadata:
  node_type: memory
  type: feedback
  originSessionId: e7b6ec4f-2bb2-4155-9ab5-db5004836d15
  modified: 2026-11-11T17:37:31.571Z
---

Em 11/11/2026, com o v20 ("3 árabes que ganham da grife"), a Osiany pediu para os vídeos de narração terem um padrão próprio: **fundo creme com âmbar**, no lugar do petróleo. Ela disse: "podemos manter um padrão, os vídeos com narração com a cor de fundo creme e âmbar". Também pediu: "como é uma cor clara, não fontes tão finas".

O que já foi implementado no v20 (`squad-editor/output/v20-arabes-ganham-da-grife/parts/`, rodando com `TEMA=creme HFDIR=hf-creme node gen.js`):
- Fundo Creme #F2E8D8 com vinheta e brilho em Âmbar, pontinhos âmbar suaves e moldura âmbar fina.
- Títulos em Petróleo com sombra âmbar. Nunca texto âmbar, amarelo ou creme sobre o creme (regra da cartela).
- Legenda em Petróleo Noite. A palavra-chave vai num marca-texto Âmbar e as palavras-chave seguidas ficam num bloco só.
- Balões, pílulas claras e etiquetas em Petróleo com texto creme e sombra âmbar.
- Cartelas dos perfumes continuam nas cores de família (regra 50/50).
- **Fontes grossas em tudo:** Montserrat 800–900 até nos rótulos pequenos ("SAÍDA", "notas: Fragrantica", marca na cartela, @ da assinatura). Nada de Light/300/500 no fundo claro.

**Why:** ela quer que o formato seja reconhecível (narração = creme, avatar = petróleo) e que tudo seja legível no celular.

**How to apply:** todo vídeo novo de narração sai em creme, partindo do v20. Vídeos de avatar continuam no formato petróleo (ver [[video-avatar-formato]]). A regra de fontes grossas vale para qualquer fundo claro, inclusive capas e carrosséis. Ver também [[paleta-50-50-cores-familia]] e [[tipografia-posts-videos]].

**Atualização em 11/11/2026 (âmbar intercalado):** a Osiany gostou do fundo âmbar do v24 (`output/v24-trabalho-comedia-ambar/`, refação do v18) e pediu para intercalar. **Creme continua sendo o padrão da narração.** O âmbar entra em **1 a cada 20 publicações** (a fatia A de 5% do feed, que ela quis manter: 50 petróleo / 30 creme / 15 foto / 5 âmbar). Antes de cada vídeo de narração, rodar `python3 proxima-capa.py` em `direcao-de-arte/`: se não houver nenhum A nas últimas 20, sugerir esse vídeo em âmbar (modelo: gen.js do v24) e **avisar ela**. Registrar todo vídeo publicado no `feed-log.csv` com a família do fundo. Ela pediu esse monitoramento ("você consegue fazer esse monitoramento"). Na hora do pedido, ela disse que o âmbar era "só para esse vídeo"; depois aprovou a intercalação na proporção 1 a cada 20.

**Atualização em 11/11/2026 (2), substitui a de cima:** agora a narração tem 2 templates intercalados: **NA1 creme** (v20) e **NA2 âmbar** (v24). A regra de "1 a cada 20" caiu. Ver [[sistema-templates-por-formato]].

---
name: valota-instagram-direcao-de-arte
description: "Antes de criar qualquer conteúdo/capa de Instagram da Valota Parfum, analisar as últimas 9 publicações e seguir a cadência cromática Petróleo & Âmbar"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b73cbef6-bdcd-4fe7-90e2-ad9a59a61ea4
  modified: 2026-11-10T02:38:47.668Z
---

Toda vez que montar conteúdo para o Instagram da Valota Parfum (@valotaparfum), checar as últimas publicações e a paleta oficial Petróleo & Âmbar antes de propor a capa.

Sistema em /Users/osianysales/Downloads/ClaudCode/squads/@valotaparfum/direcao-de-arte/:
- DIRECAO-DE-ARTE.md (regras, templates D1–D6, L1–L4, F1–F3, A1–A2)
- feed-log.csv (registro do feed) + proxima-capa.py (sugere a próxima capa, gera grade-preview.html)

Proporções no feed: 50% dark petróleo #0F2E33 · 30% light bege #F2E8D8 · 15% foto editorial · 5% âmbar #D49A4E / amarelo #FFC93C. Nunca texto âmbar/amarelo direto sobre o bege.

Estado em 09/11/2026: 4 posts no perfil. O mais recente ("O hábito mais saudável") é a referência da paleta (template D7); os 3 anteriores (azul, marrom/dourado, roxo) estão no log como legado (X/LEG). Dá para ver o perfil pelo Playwright depois que a Osiany faz login nele; sem login o Instagram bloqueia.

**Why:** a Osiany pediu (09/11/2026) feed reconhecível, sem mosaico artificial nem monocromático, e definiu a paleta a partir do último post do perfil. O Instagram não abre sem login, então o feed-log é a fonte das "últimas 9".

**How to apply:** rodar `python3 proxima-capa.py` antes de propor capa; se houver posts fora do log, pedir print da grade e registrar com `--registrar`. Registrar cada post publicado. Ver [[valota-paleta-petroleo-ambar]].

Atualização em 10/11/2026:
- O Playwright já abre o perfil logado: dá pra ver o feed real em instagram.com/valotaparfum. Conferir antes de rodar o script, porque o feed-log fica desatualizado.
- **Carrossel estilo tweet:** não existe template para ele na biblioteca. Por isso foi registrado como **L1** (light, texto no topo). Ver [[valota-carrossel-tweet]].
- **Onde ficam as capas:** em `direcao-de-arte/capas/<data>-<tema>/` (capa.html, PNG 1080×1920 e prévia 3:4). A 1ª foi a D5 "o perfume DOCE que não enjoa" (Bidaya Vanilla P*rn), com o rosto da Osiany.
- **Rosto da Osiany na capa:**
  - Tirar o frame do vídeo **bruto** (sem legenda queimada).
  - O ffmpeg fica em `squads/@gabriel/squad-editor/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg`.
  - A câmera frontal espelha a imagem, então usar `hflip` para o rótulo do frasco ficar legível.
  - Recortar com `swift ferramentas/recortar-pessoa.swift entrada.png saida.png` (usa o Vision do macOS).

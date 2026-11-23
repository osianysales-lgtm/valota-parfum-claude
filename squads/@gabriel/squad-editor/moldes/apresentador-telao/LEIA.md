# Molde APRESENTADOR DE TELÃO (v68 · 21/11/2026)
Avatar osianyreal recortado no canto de baixo à esquerda + telão 980×900 que mostra SÓ imagem real
(prints das pesquisas com marcação amarela e lupa, fotos oficiais da marca, fotos reais das notas).

Fluxo (vN = pasta do vídeo):
1. roteiro.txt (tela) + roteiro_voz.txt (fonético, mesmo nº de palavras) → `node tools/voz.js --roteiro vN/roteiro_voz.txt --out vN/narracao_1x.mp3`
2. `VEL=1.75 .venv-whisper/bin/python moldes/narracao-tipos-petroleo/cortar_pausas_energia.py vN/` → mandar MP3 175 pra Osiany aprovar
3. narracao_cortada.wav + 3 s de silêncio → gravacao/narracao_heygen.mp3 → `node tools/avatar.js --audio … --perfil osianyreal --avatar edcd5b037ccf449ca8b4036b9d1e2af7 --confirmar`
4. Recorte do avatar (sem a cadeira):
   ffmpeg -i gravacao/avatar_1x.mp4 -vf "setpts=PTS/1.75,fps=30,scale=540:960:flags=lanczos" -q:v 2 gravacao/q/f%05d.jpg
   moldes/apresentador-telao/mascaras_avatar gravacao/q gravacao/m      (≈2 min; recompilar com swiftc -O se mudar o .swift)
   ffmpeg -framerate 30 -i q/f%05d.jpg -framerate 30 -i m/f%05d.png -filter_complex "[1]format=gray,tmix=frames=3:weights='1 2 1'[mm];[0]format=yuv420p[v];[v][mm]alphamerge,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 3M -deadline good -cpu-used 4 -row-mt 1 -auto-alt-ref 0 avatar_175.webm
   Depois apagar q/ e m/ (disco).
5. Prints: puppeteer 1280×900 @2x. Crops com ffmpeg. Fotos de nota: Wikimedia Commons (thumb 1280px).
6. gen.py (âncoras por frase falada + SFX) → snap.js / revisão em folha → plano.json → plano.js preparar/aprovar → daphne → loudness −14.
Cuidados: opacidade no #av NÃO funciona com vídeo+máscara → fade no #avv + visibility no #av. qa.js é do layout antigo (acusa telão/fonte como "fora da área": ignorar esses).

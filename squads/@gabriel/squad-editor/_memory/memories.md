# Memória da Squad Editor de Vídeo

## Sobre esta squad

Squad universal de vídeo. Serve qualquer marca: a identidade (cores, fontes, logo, estilo de legenda, linguagem de edição) vem da ficha `output/vN/ficha.json` e das referências analisadas em cada execução. Nada de identidade fixa nos scripts.

## Estado atual

- Versão: 3.9.0
- Caminhos: 1 motion · 2 gravado · 3 híbrido (gravado + camadas de motion) · 4 avatar HeyGen

## Vídeos produzidos

| Data | Arquivo | Duração | Caminho | Empresa | BGM |
|------|---------|---------|---------|---------|-----|
| 08/11/2026 | output/v3-1mblack/REELS VALOTA 1 MILLION BLACK EDITADO.mp4 | 59,1 s | 1 motion (fotos reais) | Valota Parfum | trilha_trap_luxo_beat |
| 08/11/2026 | output/v8-citricos-avatar/REELS VALOTA TOP 5 ARABES CITRICOS AVATAR EDITADO.mp4 | 65,2 s | 4 avatar HeyGen (voz HeyGen) | Valota Parfum | trilha_trap_luxo_beat (loop) |
| 10/11/2026 | output/v16-borrifadas-avatar/REELS VALOTA PARFUM QUANTAS BORRIFADAS AVATAR v2.mp4 | 58,3 s | 4 avatar HeyGen (voz ElevenLabs) | Valota Parfum | sem música (só SFX) |

## Como a v3 funciona (resumo)

- **Dafne v3:** render quadro a quadro com relógio virtual (PNG sem perda → ffmpeg, 30 fps fixos). Controla `window.render(t)`, GSAP (cópia local de `node_modules/gsap`, troca o `<script>` do CDN automaticamente), CSS animations, timers, rAF e `<video>` (sincronizado por seek). `--alpha` gera `.mov` ProRes 4444 com transparência. `--ficha` injeta `--cor-*`, `--fonte-*`, `@font-face` e `window.FICHA`.
- **Legenda:** `legenda_motion_template.js` com estilo da ficha (fonte por arquivo, tamanho, cores, destaque cor/pilula/sublinhado, caixa original/alta/baixa, 3 palavras por card). Renderizada com alfa e sobreposta direto — sem chroma key. Card nunca atravessa corte ou camada.
- **Salsicha v3:** faster-whisper com glossário da ficha; corte por pausa entre palavras (> 0,35 s); detecção de regravações; folhas de miniaturas (`--folhas`); `--zoom auto`; camadas (`cheia`/`topo`/`sobreposta`) e `--encerramento`; loudnorm −14 LUFS + ducking da BGM; `--max-mb` em 2 passes; `transcricao_editada.json` para posicionar camadas.
- **Setup automático:** `tools/setup.js` instala npm, FFmpeg, Python e faster-whisper na 1ª execução em cada computador (chamado pelo Fred, pela Dafne e pelo Salsicha). Cache em `.ambiente.json` (por máquina; guarda o caminho real do Python, nunca o atalho da Microsoft Store). Só o Node precisa existir antes.
- **Portão de aprovação (v3.1):** nada renderiza sem plano aprovado pelo usuário. Fluxo: `tools/frases.js` (significado por frase) → `tools/quadros.js` (takes pela imagem) → `plano.json` + `tools/plano.js preparar` (plano.md + storyboard.jpg) → ok explícito → `tools/plano.js aprovar`. Dafne/Salsicha bloqueiam (código 3) sem aprovação ou se plano/cortes/camadas mudarem. Revisão sem render: `daphne.js --quadros`; tempos sem render: `scrappy --simular`.
- **Motion explica, não enfeita:** uma cena por ideia (2–4 s), visual tirado do dicionário de conceitos da Velma. Legenda com `destaque: chave` destaca as palavras-chave da fala. Ênfases (punch-in) e `reforco.html` para números/ferramentas/resultados.
- **Motion de qualidade (aprendido no teste de 10/2026):** alternar cenas de lettering (só tipografia, `modelos/lettering.js`) com cenas de ilustração; logo nunca fixa durante o vídeo; símbolo animado ao fundo só em algumas cenas (`modelos/simbolo.js`); assinatura final com a logo sozinha e luzes (`modelos/assinatura.html`).
- **Papéis das cores se confirmam com o usuário** (fundo principal, destaque, terceira cor). Não deduzir pela primeira peça encontrada: a mesma marca pode ter peças claras e escuras.
- **Medir texto só depois da fonte carregar** (no 1º `render` do carregamento a largura sai errada) e gradiente de texto com `repeat-x`.
- **Abertura por formulário (v3.3):** A — marca (1ª vez, salva em `marcas/<marca>/`), B — vídeo (sempre, inclui narração MP3 e áudio). Áudio nunca implícito: o plano avisa se não houver decisão de áudio.
- **Narração:** `tools/narracao.js` alinha a voz ao roteiro (o texto na tela é sempre o do roteiro; diferenças vão para o usuário). Dafne `--narracao` faz ducking da trilha e −14 LUFS; `--remixar` troca só o áudio.
- **Montagem do gravado (v3.8):** nada de normalizar o clipe inteiro. Transcrição só do áudio; cada trecho é cortado direto do original (1080x1920, 30 fps, zoom, HDR→SDR) num intermediário CRF 16; trechos unidos sem recodificar (duração em quadros inteiros); UMA codificação final com camadas + legenda + áudio. Legenda e camadas renderizam em paralelo durante o corte. Cache em `output/vN/cache/` (apagar só na aprovação final). `tempos.json` mostra o tempo de cada etapa.
- **Tamanho/qualidade (v3.8):** padrão `--qualidade social` = CRF 20, preset medium, teto 12 Mbps (gravado) / CRF 18 + teto (motion). Teste de campo: um vídeo de 57 s tinha 160 MB (22 Mbps, CRF 18 fast, 5 gerações); no social fica ~12 Mbps (~90 MB) sem diferença visível. `--qualidade maxima` só para arquivo mestre.
- **iPhone grava em HDR (HLG, 10 bits):** sem tone mapping a imagem sai lavada e o MP4 de 8 bits ficava marcado como HDR. `tools/cor.js` converte para SDR (zscale + tonemap hable) no corte, nos quadros de análise e nas folhas.
- **Legenda mais rápida sem perda:** a legenda publica `window.__chaveQuadro`; a Dafne reaproveita a foto quando nada mudou (60–70% dos quadros, ~3x mais rápido, pixels idênticos). Recortar a captura numa faixa foi testado e descartado: mudava o antialiasing do texto.
- **Transcrição em partes (v3.8):** cada frase é salva na hora em `output/vN/cache/transcricao/`; para antes de 8 min com código 4 ("TRANSCRIÇÃO PARCIAL") e o mesmo comando retoma de onde parou, até no meio de um clipe. Assim gravação longa nunca estoura o tempo de um comando em primeiro plano.
- **Marca portátil:** `tools/marca.js salvar` copia fontes/logos para `marcas/<marca>/arquivos/` e grava caminhos relativos; `tools/ficha.js` resolve caminhos (e acha o arquivo em marcas/*/arquivos/ se a ficha tiver caminho absoluto de outro PC).
- **QA:** `tools/qa_video.js` roda no fim de toda edição: imagem travada na emenda, quadro preto, fps variável, dessincronia A/V, loudness, tamanho + folha de quadros. Motion parado > 1,5 s vira aviso.

## Voz e efeitos (11/2026)

- **Narração = sempre a voz da Osiany no ElevenLabs**, com o ID da voz do `.env` da raiz (`Elevenlabs_voz_id`, hoje LajrwgPkHCxzLCvnEwi7 = "Osiany Sales v2"; regra de 08/11/2026). A voz antiga GuuntRfY6J2EeSBkavod não deve ser usada. Modelo eleven_multilingual_v2 via `tools/voz.js`. Config em `config/elevenlabs.json`; chave em `ELEVENLABS_API_KEY` (.env.local da raiz). O endpoint with-timestamps devolve o tempo de cada palavra → `narracao.js --transcricao` (sem Whisper). Teste: 56 caracteres → 3,16 s, tempos exatos.
- **SFX = sempre da `biblioteca_audio/efeitos/`** (12 efeitos gerados com ElevenLabs Sound Effects em 07/11/2026, incluindo spray de perfume e vidro). Efeito novo: `tools/sfx.js --nome --texto`.
- **Mac da Osiany não tem FFmpeg nem Homebrew** (07/11/2026): instalar antes de renderizar.

## Formato "perfumes conversando" (11/2026)

- **Fotos reais, nunca desenho** (pedido da Osiany): foto do frasco → `tools/recorte.js` (BiRefNet, MIT, local, ~45–200 s por foto) → limpar pedaços soltos e endireitar → `animacoes/modelos/fotos3d.html` (Three.js: palco, chão espelhado, luzes, brilho de quem fala, tarja da narradora). `frascos3d.html` (desenho) ficou só como modelo, não usar para a Valota.
- **Fotos com licença:** Openverse (api.openverse.org) acha Flickr CC. Só BY/BY-SA (ND proíbe recorte; NC não serve para publi). Créditos em `fotos/CREDITOS.md`.
- **Diálogo:** `tools/dialogo.js` (várias vozes; cache por fala; lip-sync/voz por quadro; `cena_dados.js`). Narradora = Osiany. Roteiro pelo agente content-creator (agents/marketing).
- **Ambiente Mac:** FFmpeg vem dos pacotes npm (@ffmpeg-installer + @ffprobe-installer, sem zscale/HDR); WebGL roda na GPU (Metal) no headless; faster-whisper não instala no Python 3.15.

## Voz do .env (08/11/2026)

- `tools/elevenlabs.js` lê o `.env` e o `.env.local` da raiz (aceita nomes de variável com minúscula) e põe `Elevenlabs_voz_id` como `voz.voice_id` em `config()`. Isso vale para voz.js, dialogo.js e qualquer ferramenta nova. O `--voz` da narração é ignorado.
- Antes, a leitura do `.env` só aceitava MAIÚSCULAS e acontecia depois de a voz ser escolhida, então a variável do `.env` nunca era usada.

## 1 Million Black (08/11/2026) — aprendizados

- **Product shot de estúdio** (cena.html em output/v3-1mblack, 2D com render(t)): fundo #1A110C com bokeh, feixe de luz, poeira, chão com reflexo, faixa de brilho no vidro (canvas source-atop), grão de filme, câmera na mão e cortes secos por plano. Notas em PNG no padrão @matheusueta. Pode servir de modelo para os próximos reviews.
- **Rejeitado pela Osiany:** a animação de frasco saindo da caixa. A abertura agora é o frasco surgindo do escuro.
- **Recorte:** a foto 3/4 com a lateral de vidro saiu ruim. Usar a foto oficial frontal (medias.rabanne.com/cdn-cgi/image/width=N/...). Caixa branca em fundo branco e foto de folhagem não recortam com BiRefNet; folhagem entra como card arredondado.
- **Busca de fotos:** o Google Imagens dá CAPTCHA no headless, e o Bing degrada depois de 2–3 buscas seguidas. Para notas, usar o Wikimedia Commons (API, fotos livres e sem marca d'água). O Python do Mac está sem certificados SSL; usar Node fetch.
- **Voz v2** (LajrwgPkHCxzLCvnEwi7) com velocidade 0,95: a narração fica cerca de 30% mais longa que na voz antiga. Mudou a voz → remapear os tempos da cena palavra por palavra (narracao antiga × nova).
- **Atenção no zsh:** `$n:l` vira modificador e listas `$L` não se dividem em argumentos. Montar filtergraph do ffmpeg com `bash -c` ou Python.

## Aprendizados que continuam valendo

- **Vídeo nunca sai sem som (regra da squad):** áudio final sempre AAC 48 kHz estéreo e audível (~−14 LUFS). A Dafne saía em mono quando a narração era mono (um player tocou mudo); agora força `-ac 2`, e o `qa_video.js` trata sem áudio / mono / quase mudo como problema. O revisor (Fred) confere antes de mostrar.
- **Vídeo nunca termina em tela preta (regra da squad):** corte/fade para preto no fim é erro de edição, mesmo quando a referência termina assim. Último quadro = pessoa com CTA na tela ou assinatura. Quadro preto no fim apontado pelo QA é sempre problema.
- **Fala contínua não tem silêncio para cortar:** regravações e falsos inícios saem com corte editorial (`cortes.json`) decidido pelo Fred depois de abrir as folhas.
- **Corrigir nomes próprios no `analise.json` antes da legenda** (ex.: "Cloud Code" → Claude Code, "chat de APT" → ChatGPT). Fundir tokens quebrados (`e` + `-mail`, `100` + `%`). Conferir com slides/tela.
- **Corte seco em talking head:** fade/xfade entre takes do mesmo enquadramento gera rosto fantasma e engole sílabas.
- **Grafia original na legenda:** não rebaixar letras (ChatGPT, WhatsApp, IA).
- **Travada na emenda:** acontece quando o vídeo do trecho é mais longo que o áudio; a v3 corta cada trecho com duração exata. Conferir no relatório de QA.
- **Tarja preta nas laterais:** usar `force_original_aspect_ratio=increase,crop` (já aplicado).
- **Zona segura do Reels:** legenda com centro em y≈1330 (faixa 1150–1420); conteúdo importante entre y≈200 e y≈1450.
- **amix silencia o áudio:** multiplicar volumes por N antes do amix (compatível com FFmpeg antigo). Já aplicado na Dafne.
- **Whisper `small` perde regravações:** numa frase dita duas vezes, a repetição some da transcrição (com `beam` 1 ou 5), e a detecção de regravação deixa de funcionar. O `large-v3-turbo` acerta (medido: 13 s de áudio com a frase repetida, `small` 10 s e 8 palavras, `large-v3-turbo` 31 s e 23 palavras). Padrão do Salsicha e da narração: `large-v3-turbo`.
- **PyAV 19 quebra o decodificador do faster-whisper** (`open() got an unexpected keyword argument 'metadata_errors'`): passar o caminho do áudio para `transcribe()` falha. Ler o WAV 16 kHz mono com `wave` + `numpy` e passar o array (já aplicado no Salsicha e em `tools/narracao.js`). Qualquer script novo de transcrição precisa fazer o mesmo.
- **Puppeteer 25: `executablePath()` é assíncrona** (devolve Promise). Código que lê o caminho do Chrome de forma síncrona acha que o navegador não existe; use `Promise.resolve(...).then(...)` (já aplicado no `tools/setup.js`).
- **Render paralelo (Dafne `--workers`):** com 4 navegadores em página com `<video>` o primeiro quadro saía preto; o padrão limita a 2 nessas páginas. Cada navegador precisa do SEU HTML temporário (nome único), senão um apaga o arquivo do outro.

## Ambiente Windows

- **Drive de rede:** npm falha com TAR_ENTRY_ERROR e o ffmpeg bundled não roda em caminho de rede. Copiar a pasta inteira da squad para o disco local (sem `node_modules`; o `tools/setup.js` reinstala) e rodar de lá. TEMP do Salsicha em disco local.
- **Google Drive (H:):** copiar o bruto para disco local antes de editar (streaming lento).
- **FFmpeg:** usar o global (winget, `Gyan.FFmpeg_*\...\bin`); `ffbin()` usa `where ffmpeg` e cai para o bundled só se não houver global. `drawtext` falha no ffmpeg do winget (fontconfig).
- **Python:** `python` pode abrir a Microsoft Store; usar `--python py` ou o caminho completo. Saída do script de transcrição já forçada em UTF-8.
- **Usuário atual:** conferir com `$env:USERNAME` antes de montar caminhos de temp.

## Pexels (opcional)

- Só quando a referência pede vídeo real de fundo. Ler `PEXELS_API_KEY` do `.env` (sem `dotenv` se o npm não estiver na pasta: `fs.readFileSync` + `split('\n')`). Nunca expor a chave.
- Vídeo de fundo entra direto no HTML (`<video src="assets/..." muted loop playsinline>`): a Dafne v3 renderiza.

## Obsoleto (v2) — não aplicar mais

- CDP Screencast, `-fps_mode vfr`/`-vsync`, viewport 1080×810: a captura agora é quadro a quadro com fps fixo.
- Pipeline de 2 etapas para fundo Pexels (blend screen): `<video>` funciona no render.
- "GSAP CDN bloqueado → usar só CSS": GSAP funciona (cópia local).
- Legenda por chroma key verde, colorkey/despill, `visibility` para evitar flash verde: legenda agora é alfa.
- Estilo de legenda fixo (Poppins 56 px, `#AAFF00`, MarginV=160): estilo vem da ficha; Poppins é só o padrão de segurança.
- Whisper `small` como padrão de produção: usar `large-v3-turbo` com glossário (faster-whisper).
- BGM fixa "Uplifting Corporate" e volume 0,35: trilha e volume definidos pela referência; com ducking, 0,10–0,15.

## Top 5 árabes (08/11/2026) — aprendizados

- **Pedido de velocidade (ex.: 1.3x):** renderizar em 1x e acelerar o MP4 final com `setpts=PTS/1.3,fps=30` + `atempo=1.3`. Voz, trilha e SFX continuam em sincronia e o tom não muda. O QA roda no arquivo acelerado.
- **Fotos oficiais de frasco:** as lojas Shopify das marcas devolvem JSON (`/products/<handle>.json`, `/products.json?limit=250`), com fotos frontais 1500–2000 px em fundo claro. Funcionou para lattafa-usa.com, afnan.com e armaf.com. O BiRefNet recortou bem os 5 frascos, inclusive o vidro transparente do Khamrah. Depois, `sharp().trim()` tira só a borda transparente, sem cortar o frasco.
- **"Recortada, não cropada"** (pedido da Osiany): o frasco inteiro, com o fundo removido. Nunca enquadrar cortando o frasco.
- **Notas no Wikimedia:** a miniatura (thumb.wikimedia.org) dá timeout no Node fetch; baixar com `curl -4`. Tabaco e lavanda não recortam: entram como card arredondado (sharp + máscara SVG). Pimenta solta some no fundo escuro: usar a foto da tigela.
- **Scratchpad /private/tmp é apagado** quando a sessão reinicia: guardar os brutos dentro de output/vN/.
- **Ranking em motion** (output/v4-top5arabes/cena.html): fila dos 5 com números, número gigante amarelo por item, whip-pan com blur, cartela com flash, nº 1 em silhueta antes da revelação, luzes de balada (conic-gradient girando). Pode servir de modelo para os próximos rankings.
- **Modelo oficial de TOP 5 / ranking:** `animacoes/modelos/top5_ranking/` (LEIA.md explica a estrutura e como adaptar). A Osiany aprovou a estrutura e a apresentação em 08/11/2026. Usar sempre em vídeos de Top 5.
- **Feedback 08/11/2026:** as imagens de **abacaxi** (anéis cristalizados) e **baunilha** do v3 "não estão legais". Não reutilizar; buscar fotos novas, com recorte limpo e visíveis no fundo escuro.

## Avatar HeyGen — 1º vídeo (08/11/2026, v8-citricos-avatar)

- A Osiany pediu **avatar E voz da HeyGen** (não ElevenLabs) neste vídeo: `tools/avatar.js --roteiro` usa `heygen_voz_id` do .env (voz clonada "audio1", 7e08234c…). A voz padrão do avatar "Osiany 001" é a Annie (inglês) — nunca usar. Nomes árabes vão com grafia fonética só em `roteiro_voz.txt`.
- Custo: 67,7 s de avatar (Avatar IV, 1080p) = 19 créditos premium (plano Creator, 600/mês).
- Edição no modelo do v6 (HyperFrames): `cortes.py` (jump cuts) → `gen.js` (câmera com zoom in/out + grade aprovado do v6, cenas por item: Nº gigante, flash + cartela na cor do frasco, frasco flutuando à direita, notas PNG à esquerda, ênfase amarela; CTA com fila dos 5 + pílulas; assinatura sobre o último quadro congelado ~2,5 s). Legenda branca com contorno (a camiseta branca do avatar some com legenda só com sombra).
- Congelar um quadro de olhos ABERTOS no fim (o último quadro do avatar estava piscando).
- Transcrição: faster-whisper não instala no Python 3.15 do Mac → `.venv-whisper` (uv, Python 3.12) dentro da squad; `tools/setup.js` usa ele sozinho. Para voz limpa da HeyGen, o modelo small (efeito palavras) basta; o texto da legenda vem do roteiro.
- Frasco Hamsa (Mawwal) só existe com props/caixa: recortado da foto com notas e base espelhada (`base_hamsa.js`).

## Avatar HeyGen — v9 frascos árabes (08/11/2026)

- **Look específico do avatar:** `tools/avatar.js --avatar <look_id>` (só aceita look cujo `group_id` = heygen_avatar_id do .env). O look 8f6b34d0… (turbante, túnica bordada) tem o rosto alto: janela do avatar com `object-position:50% 36%`.
- **Trilha árabe:** `biblioteca_audio/trilhas/trilha_arabe_luxo.mp3` (ElevenLabs Music `POST /v1/music`, `music_length_ms`, `force_instrumental`; script em output/v9-frascos-arabes-avatar/musica.js). `tools/elevenlabs.js` não exporta a chave: usar `carregarEnv()` + `process.env.ELEVENLABS_API_KEY`.
- **Animação árabe na faixa** (gen.js do v9): muxarabi (estrela de 8 pontas em ladrilho, derivando devagar), arco dourado em ogiva, 4 lanternas balançando com brilho, estrelas piscando, losango dourado na linha; roseta dourada girando atrás do Nº e do frasco; anel dourado na tampa/detalhe quando ela fala ("olha essa tampa", "medalhão", "escudo").
- **gen.js do v9 acha as palavras pelo texto** (`F('palavra', depois_de)`), não por índice fixo: reaproveitar em vídeos novos sem recontar índices. Entrada = `tools/narracao.js` (texto do roteiro com tempos da voz) → `cortes.py` → `cortado.mp4` (trim/concat + `tpad` congelando o último quadro).
- **Fotos:** Maahir Legacy e Qaed Al Fursan (lattafa-usa.com JSON), Untold (armaf.com JSON), Hawas (dxbperfume.co.uk via Bing; Rasasi não tem Shopify). Todos recortaram bem no BiRefNet.
- **Render HyperFrames no Mac de 8 GB:** com workers "auto" o render falhou 2× (CAPTURE_PROTOCOL_TIMEOUT; encoder morto depois de 35 min). Com `--workers 2 --protocol-timeout 900000` saiu em 3,4 min. Usar isso como padrão.
- **Busca de palavra-âncora curta** (ex.: "E" de "E o quinto"): pega a 1ª ocorrência ("e um escudo") — ancorar na palavra seguinte única e voltar o índice.

## Gravado da Osiany — v15 academia (10/11/2026)

- **Fluxo usado (sem Salsicha):** `output/v15-academia/` → `transcrever.py` (large-v3-turbo, palavra a palavra) → `cortes.py` (plano editorial + comprime pausas pela energia, limiar −29 dB do pico) → `montar.py` (iPhone 4K HEVC SDR, rotate 270: scale 1080x1920 SEM hflip, CRF 16 por trecho, concat) → `rosto.swift` (Vision, rosto a cada 0,25 s → `rosto.json`) → `gen.js` (HyperFrames: cartela + notas no topo, legenda com altura pelo rosto) → render `--workers 2 --protocol-timeout 900000`.
- **NUNCA cortar quando ela cheira, borrifa ou mostra o frasco**, mesmo calada (pedido dela). Depois de calcular os cortes, tirar quadros de TODO trecho removido e olhar; devolver os que têm frasco. O corte por silêncio tinha tirado o momento em que ela cheirava o Infusão Botânica.
- **Ruído de manuseio do frasco** fica acima do limiar de silêncio: o detector de energia não acha essas pausas. Usar as lacunas entre palavras do Whisper (> 0,45 s) + mediana de energia.
- **`-frames:v` no ffmpeg corta o áudio do trecho antes da hora** (o muxer para no último quadro). Usar `-t` + `apad,atrim=0:d`. PCM não entra em MP4: intermediários em .mov.
- **Rosto nos vídeos dela (câmera frontal, sentada):** y ≈ 640–1400 em 1080x1920. A faixa de cima (y 120–600) fica livre para cartela + notas; a legenda vai abaixo do queixo (top = máx. y do rosto no trecho + 36, entre 1250 e 1500).
- **Tipografia nova:** Montserrat variável (Google Fonts, `hf/assets/fonts/Montserrat.ttf`) + Gotham Black. Legenda = estilo do v14 (caixa alta, creme + amarelo nas palavras-chave, contorno #0A1F23 13 px) em Montserrat 900.
- **Whisper inventa "Tchau. Tchau."** no fim do áudio cortado: filtrar.
- **NUNCA espelhar (hflip) vídeo gravado da Osiany** (regra dela, 10/11/2026, "em todos os vídeos"): manter a orientação da câmera frontal, mesmo com camiseta/rótulo invertidos.

## Avatar HeyGen — v16 quantas borrifadas (10/11/2026)

- **Formato fixo do avatar (pedido da Osiany: "deixa o avatar igual nos outros vídeos, pequeno"):** layout do v13/v14 = card de 500 px em top 1230 (cantos de cima arredondados), legenda em 1128, motion na área de cima (OFF 360, faixa de 640). Perfil osianyreal + look edcd5b… (Van Gogh) + voz ElevenLabs "Osiany Sales v2". Usar sempre esse formato em vídeo de avatar.
- **gen.js do v16** = base do gen3 do v13 com: tipografia nova (Gotham Black nos títulos/números + Montserrat; legenda Montserrat 900 com contorno 13 px), **contador de borrifadas** (um span por número, `A.conta()` com tl.set → determinístico no render), categoria com título gigante que vira cabeçalho, colagem de 4 frascos, chat fake de grupo, celular com busca digitando e mapa de estações (marcado "ilustrativo"), carimbo "PARA ✋", resumo 16 · 10 · 5 + assinatura.
- **Captions com a grafia do roteiro e o tempo da voz:** quando o `roteiro_voz.txt` só troca grafia (Sovaj, Blê de Chanél, Fragrântica) e tem o mesmo nº de palavras, casar por índice (`ROT[i]` + `VOZ[i].start`), sem rodar narracao.js.
- **Fotos de frasco de grife:** `https://fimgs.net/mdimg/perfume/o.<id>.jpg` (id da Fragrantica, via busca) dá foto frontal em fundo branco; conferir numa folha antes de recortar (2 de 13 ids chutados vieram errados). BiRefNet recortou os 11 bem. IDs: Acqua di Giò 410, 212 Men 297, Light Blue pour Homme 1068, Versace Pour Homme 2318, Bleu de Chanel 9099, Aventus 9828, Terre d'Hermès 17, Le Male Elixir 81642, SWY Absolutely 64501, Spicebomb Extreme 30499, Sauvage Elixir 68415.
- **Armadilhas:** `cp` encadeado com `&&` parou nos SFX quando a Gotham não foi achada (conferir os assets do index.html depois do gen); "11?!" com X por cima vira "1X!" (não sobrepor X em número); emoji 👉 no início de pill some; texto de chip no celular precisa ≤ 29 px; "MAPA DAS ESTAÇÕES" quebra em 2 linhas na tela de 430 px.
- Render final: `--workers 2 --protocol-timeout 900000`, 1m32 de captura; −13,9 LUFS.

### v16 · correções da Osiany (rodada 2) — REGRAS
- **Recorte de frasco com vidro: NÃO usar BiRefNet em foto de fundo branco.** Ele apagou o vidro (Versace quase transparente, 212 falhado, Creed/Terre com falhas, Stronger With You cortado). Usar `tools/recorte_branco.js 14 <brutas> <saida>` (flood fill do branco a partir das bordas: só some o fundo, o vidro fica inteiro) e SEMPRE conferir numa folha sobre o fundo petróleo, no tamanho do vídeo, antes de usar (`folha_frascos.js` do v16).
- **Texto nunca pode vazar** do balão/pílula/chip/card/tela ("OUTRA CONTA" saiu do balão; mensagem do grupo saiu do card). Antes de renderizar: servir a pasta hf (`python3 -m http.server`) e rodar `tools/qa_overflow.html` (copiar para hf/) no Playwright → `await auditar()` tem que voltar vazio (ignorar só "altura texto" das legendas). Balão não pode cobrir título.
- **Avatar nunca com cara feia, boca aberta ou travado.** Não congelar o último quadro (tpad): mandar a narração para a HeyGen com **3 s de silêncio no fim** (`apad=pad_dur=3`), assim o avatar fica ocioso de boca fechada e piscando naturalmente; o END fica em FALA + 2,8 s. Conferir o fim e o começo quadro a quadro.
- **Sem música** neste vídeo (pedido dela): só efeitos sonoros. No v13 também foi sem música → padrão de avatar = sem trilha, salvo pedido.
- **CTA com @:** na voz "arroba Valota Parfum", na legenda "@VALOTAPARFUM" (gen.js junta as 3 palavras da voz em 1).
- Emoji 🧮 vira quadrado vermelho no render: evitar emoji pouco comum em balão.

## Narração sem avatar — v20 3 árabes que ganham da grife (11/11/2026)
- Base = gen.js do v18, agora montado a partir de `parts/` (p1 header/SVGs, p2 helpers do v18, p3 cenas, p4 fundo, p5 legendas, p6 áudio/index): `cat parts/*.js > gen.js && node gen.js`.
- `tools/recorte_branco.js` falha rodando de tools/ (require de sharp com caminho relativo errado): usar a cópia local do v18 dentro da pasta do vídeo.
- Foto de frasco com SOMBRA no fundo branco (Marwa Extrait): o recorte por branco deixa a sombra; usar BiRefNet (`tools/recorte.js`) nesse caso (frasco opaco). Vidro continua com recorte_branco.
- Silhueta "?" do nº 1 = o mesmo PNG com `filter:brightness(0)` + "?" por cima, e crossfade para o frasco real na revelação.
- Fragrantica .com no Playwright: as notas vêm do `document.body.innerText` a partir de "PERFUME PYRAMID" (os h4 não têm texto de nota nos filhos).
- `qa_overflow.html` precisa trocar a lista `cenas` pelos ids do vídeo e incluir `.lbl,.card .n,.quote .t` no seletor.
- **Tema creme (padrão de NARRAÇÃO a partir de 11/11/2026):** `TEMA=creme HFDIR=hf-creme node gen.js` no v20. Fundo creme + âmbar, títulos petróleo com sombra âmbar, legenda petróleo com marca-texto âmbar nas palavras-chave, fontes 800–900 (nada fino no claro).
- **Render sem FFmpeg no PATH:** se o render der "FFmpeg not found", exportar `PATH=<squad>/node_modules/@ffmpeg-installer/darwin-arm64:<squad>/node_modules/@ffprobe-installer/darwin-arm64:$PATH` antes do `npx hyperframes render`.

## Avatar HeyGen — v23 Untold x Baccarat Rouge 540 (11/11/2026)
- Vídeo: `output/v23-untold-x-baccarat-avatar/REELS VALOTA PARFUM UNTOLD X BACCARAT AVATAR.mp4` · 56 s · −13,4 LUFS · sem música · voz ElevenLabs a 1x (53,2 s de fala, não precisou acelerar) · ~19 créditos HeyGen (404 → 385).
- gen.js montado em `parts/` (p1 = cabeçalho do v17 sem a junção "2009" · p2 = cenas · p3 = câmera/legendas/áudio/index do v17 com `marks = Object.values(B).slice(1)`): `cat parts/*.js > gen.js && node gen.js`.
- Cenas novas reaproveitáveis: **moça ilustrada que passa e volta de ré** (SV.moca + SV.rew + `disco_arranhado` + `passo_squish` + `fungada_cheirar`), **6 chips de nota nas cores das famílias** com ✓, **pirâmide SVG com o FUNDO acendendo** (`attr:{fill}` no GSAP), **algodão-doce SVG**, etiquetas de preço caindo + carimbo "18x".
- **O qa_overflow NÃO pegou o balão com emoji** ("ISSO É BACCARAT? 😳" a 66 px saiu do balão no render). Sempre tirar quadros do MP4 renderizado e olhar todos os balões e pílulas; deixar ~10% de folga na largura quando houver emoji.
- Recorte do BR540 (fimgs o.33519.jpg) por branco deixou a sombra embaixo: cortar 6% da base no prep.js (`node prep.js 0.06`) e conferir em `qa_folha_frascos.png`. O Untold foi reaproveitado do v9 (`fotos/sel/untold.jpg`).
- Grafia fonética usada: Bacarrá Ruj · Clâb dí Nuí Antôld · Ármaf · Fragrântica.
- **PADRÃO DE VELOCIDADE (11/11/2026):** a Osiany pediu a voz dela sempre na velocidade do top 5 árabes (v4) = **1,3x**, em todo vídeo (avatar e narração). Fluxo: voz em 1x → HeyGen em 1x → render em 1x (`render_1x.mp4` de backup) → `setpts=PTS/1.3,fps=30` + `atempo=1.3` no MP4 final (libx264 crf 16). O v23 ficou com 43,1 s e −13,6 LUFS.

## Avatar AV2 (1º) — v25 "Para de fazer layering errado" (12/11/2026)
- Vídeo: `output/v25-layering-av2-avatar/REELS VALOTA PARFUM LAYERING ERRADO AVATAR AV2.mp4` · ~49,8 s a 1,3x · sem música · ~19 créditos HeyGen · voz 911 créditos ElevenLabs.
- **Molde do AV2** (`gen.js` do v25): fundo **CREME Pergaminho** (base; o 1º render saiu em Cedro por engano — Cedro é cor de FAMÍLIA, nunca fundo inteiro; backup em `gen_cedro_backup.js`). Títulos Petróleo Noite com sombra âmbar; destaque = MARCA-TEXTO amarelo/âmbar/família atrás do texto petróleo (`.mk`), nunca texto amarelo/âmbar sobre creme; pílulas e painel em PETRÓLEO (base); legenda petróleo com marca-texto âmbar nas palavras-chave; avatar PEQUENO num card 430×560 no canto inferior ESQUERDO (left 48, top 1250, borda creme 8 px, cantos 40); ao lado, **painel persistente** creme (470×560) estilo react, com "3 REGRAS" que vão de "???" → nome → ✓ conforme a fala (`persist.html`); legenda em 1124; conteúdo ocupa 150–1100.
- **Gancho escrito FIXO** (regra nova): texto grande visível JÁ NO QUADRO 0 (sem fade de entrada; escala de "respiro" pode cortar texto na borda — o 1º render cortou o "E" do ERRADO) e parado durante todo o gancho falado (~10 s a 1,3x). Depois vira **selo** pequeno no topo até o CTA.
- Frascos desenhados em SVG (sem marca) quando o vídeo não cita perfume: `frs(cor, rótulo)`; pirâmide em 3 peças que voam entre pirâmides (transform-origin no centro da pirâmide); âncora segurando moléculas (strokeDashoffset nas cordas + elastic); placa PARE que vira PODE (flip scaleX).
- Grafia fonética: "lêiering" (Whisper reconheceu como layering).
- `hyperframes check`: fromTo de elemento escondido precisa de `opacity:1` no destino (erro gsap_cold_seek_hidden_fromto_missing_reveal).
- **Ritmo do v24 (perfumes pro trabalho), pedido como padrão no 17h Hawas Black de 12/11/2026:** 278 palavras em 64,9 s ≈ **4,3 palavras/s**. Voz ElevenLabs a 1x (116,9 s) → pausas cortadas (`silencios.txt`, 49 cortes, ~17,6 s) → render → `setpts=PTS/1.3` + `atempo=1.3` no MP4 final. No total fica ~1,8x mais rápido que a voz crua, e não só 1,3x. Pra repetir: usar o mesmo fluxo do v24 (cortar silêncios + 1,3x).

## Narração — v26 Hawas Black x Hacivat (12/11/2026)
- Vídeo: `output/v26-hawas-black-x-hacivat-narracao-petroleo/REELS VALOTA PARFUM HAWAS BLACK X HACIVAT NARRACAO.mp4` · 46,0 s · −14,9 LUFS · sem música, 64 SFX · voz 1.064 créditos ElevenLabs.
- Fundo PETRÓLEO (base do gen.js do v18), porque a Osiany pediu fundo escuro: o post anterior (v25) foi claro. O gen.js está em `parts/` (p1 = base do v18 · p2 = cenas · p4 = fundo/legendas/áudio/index do v18): `cat parts/*.js > gen.js && node gen.js`.
- Ritmo do v24 reproduzido: `cortar_pausas.py` (pausa máx. de 0,26 s, margem de 0,08 s, roda com `.venv-whisper/bin/python`, porque o python do sistema não tem numpy) → `atempo=1.3` na narração → render → `setpts=PTS/1.3` + `atempo=1.3` no final. Deu 200 palavras em 46 s.
- Recorte BiRefNet ok nos dois frascos (o Hacivat é creme e opaco: não usar recorte por branco).
- O hyperframes check acusa contraste baixo em emoji (🧳🚶): é falso positivo. "line_unread": segurar pílula/balão ≥ 0,5 s + 0,3 s por palavra NO TEMPO DO RENDER (no final fica 1,3x mais curto).
- 12/11: a pasta output/ ficou só com v18, v24, v25 (os outros foram movidos por ela, pelo Finder). O molde do NA1 creme (v20) não está mais em output/.

## Avatar AV1 — v27 "Tipos de pessoa na loja de perfume" (12/11/2026, post das 13h)
- Vídeo: `output/v27-tipos-loja-avatar-av1/REELS VALOTA PARFUM TIPOS NA LOJA DE PERFUME AVATAR AV1.mp4` · 32,5 s a 1,3x · −13,8 LUFS (pico −1,2 dBFS) · sem música, 55 SFX · 106 palavras · voz 1x de 39,4 s · HeyGen 12 créditos (333 → 321) · ElevenLabs 585 caracteres anunciados (o saldo da API só subiu 13.237 → 13.471).
- **Molde oficial do AV1 (petróleo):** `gen_molde_tipos.js` (genérico, CONFIG no topo com N tipos, modo prévia com tempos estimados + avatar placeholder) e `gen.js` (cenas deste vídeo). Layout: selo y 165–245 · motion y 280–1105 · legenda y 1128 (máx. 3 palavras / 20 caracteres, nomes compostos inteiros via `TX.fixos`) · card do avatar 500 px centralizado (x 290–790, y 1230 até o fim, cantos de cima 40, borda creme 8 px). `COMO-RODAR.md` tem a ordem completa.
- Ferramentas novas na pasta: `auditar.js` (sobe servidor próprio, lista de cenas gerada pelo gen.js e conta os elementos medidos: o qa_overflow do v25 auditava cenas de OUTRO vídeo), `folha_frascos.js`, `qa_final.js` (qa_video + folhas do gancho, balões, avatar no início e no fim).
- Cenas reaproveitáveis: vendedor SVG com leitor + feixe (`beam()`), clientes-boneco (`SV.boneco`), testador esvaziando 100→0% com fumacinha de borrifada, etiqueta "R$ ????" balançando, celular "0 CHAMADAS", carimbo ERRO + "???", celular de loja com carrinho e botão COMPRAR, placa P de estacionamento, porta "ABERTO" + relógio girando + teia no balcão, "AÍ PIORA" com a tela tremendo (`#win` na câmera).
- **Relógio SVG:** girar ponteiro com `svgOrigin:"50 54"` no tween. O `style="transform-origin:50px 54px"` no `<g>` (usado no v24) faz o GSAP girar em volta de um ponto fora do relógio: o ponteiro das horas foi parar na borda da tela.
- Fotos: Invictus Victory Absolu = fimgs o.103462 (troféu preto fosco com V dourado) · Boss Bottled = fimgs o.383 · Millésime Impérial = Les Senteurs (Shopify JSON; a fimgs o.471 é o Spring Flower, ERRADA) recortado com BiRefNet (foto com degradê e sombra: o recorte por branco deixou mancha) · Club de Nuit Milestone = armaf.com (Shopify, produto 3,6 oz). Os outros três com `recorte_branco.js 14`.
- Loudness: o render saiu em −15 LUFS com pico −0,97 dBTP (o loudnorm linear não consegue subir). Resolvido com `volume=1.2dB,alimiter=limit=0.84` só no áudio (vídeo copiado). No zsh, usar `${VAR}` antes de `:` em filtergraph (`$MI:linear` virou `$MI` + modificador `:l`).
- Gancho: "3 TIPOS / NA LOJA DE PERFUME / QUAL É VOCÊ? 👀" parado até 7 s em 1x (5,4 s finais). Comparação de perfumes só com o chip "A COMUNIDADE COMPARA": nunca "=", "VS" nem "igual".
- **NOVO PADRÃO DE VELOCIDADE (12/11/2026): 1,15x**, que substitui o 1,3x. Fluxo igual: voz 1x → HeyGen 1x → render 1x (`render_1x.mp4` de backup) → `setpts=PTS/1.15,fps=30` + `atempo=1.15` no MP4 final. Na narração com ritmo v24, trocar todos os 1,3 por 1,15. Pílulas/balões: o tempo final fica 1,15x mais curto que o do render.

## Avatar AV2 — v28 "Teste cego Liquid Brun x Althaïr" (12/11/2026, post das 11h de 13/11)
- Vídeo: `output/v28-liquid-brun-x-althair-av2-avatar/REELS VALOTA PARFUM LIQUID BRUN X ALTHAIR AVATAR AV2.mp4` · **46,1 s a 1,15x (1º vídeo no padrão novo)** · −13,8 LUFS · sem música, 52 SFX · 148 palavras · voz 1x de 50,2 s (751 créditos ElevenLabs) · HeyGen 15 créditos (321 → 306).
- gen.js = molde AV2 do v25 adaptado para QUIZ: painel persistente "TESTE CEGO / QUAL É O CARO?" com linhas A/B (??? → "12 NOTAS"/"10 NOTAS" → nome; ✓ no "eu uso") + linha amarela "≈ R$ 1.958". Gancho fixo "TESTE CEGO: R$ 287 x R$ 2.245" + frascos SVG A/B com "?" até 12,3 s em 1x (10,7 s finais).
- Cenas reaproveitáveis: chips de notas com ✓ do B, contador "10/12", slots tracejados que recebem as notas que faltam, **lembrancinha de casamento SVG** (saquinho de tule + amêndoas + laço rosa + alianças), etiqueta de preço pendurada (elastic), carteira chorando ("dói no bolso", sfx ziper_bolsa + trombone), troca do frasco SVG pela foto real na revelação, "BOM = CARO?" riscado + aviãozinho "manda esse teste".
- Fotos: fimgs o.84109 (Althaïr) e o.94713 (Liquid Brun), opacos em fundo branco → `recorte_branco.js 14` + `sharp.trim()` saiu limpo.
- QA adaptado ao AV2: `qa_final.js` recorta o avatar em `446:576:40:1242` (card no canto esquerdo) e o gancho em 0/2/5/9,5 s; `qa_overflow.tpl.html` não checa "invade card/legenda" na composição `persist`. Os avisos "imagem parada" do qa_video são o avatar pequeno mexendo pouco (conferido nas folhas, não travou).
- Grafia fonética: "Altaír" e "Líquid Brun" (o Whisper ouviu "alta-ir" e "líquido de brun": ok).
- Status no controle: usar **"produzido"** (o app só conhece ideia/roteiro/produzido/agendado/postado; "pronto" não aparece na tela).
- v28 gancho v2 (13/11): "UM DELES CUSTA QUASE / 8X MAIS / VOCÊ ACERTA QUAL? 👀" + **jogo dos frascos** (A e B trocam de lugar em x ±560 nos tempos 0,25/0,95/1,65/2,35 s, arco pequeno: A sobe só 28 px, B desce 4 px; com arco maior eles batiam nas faixas) + "?" central escondido durante a troca + 8X pulsando a cada 1,8 s + impact_grave no quadro 0. Reaproveitável em todo quiz "qual é o caro?". Render antigo guardado como "(gancho antigo).mp4" e render_1x_gancho_antigo.mp4; gen antigo em gen_gancho_teste_cego_backup.js. Sem crédito gasto (só re-render).
- v28 gancho v3 FINAL (13/11): "A LEMBRANCINHA DE / CASAMENTO (marca-texto Rosa) / MAIS CARA DO BRASIL 💍" + lembrancinha SVG com etiqueta R$ 1.958 balançando + frascos A/B à direita. Lição: soco de escala no quadro 0 tem que partir de MENOR que 1 (0,9 → 1); partindo de 1,16 o "CASAMENTO" saiu cortado nas bordas. Versões anteriores guardadas: "(gancho antigo).mp4", "(gancho 8x).mp4", gen_gancho_teste_cego_backup.js, gen_gancho_8x_backup.js.
- v28 gancho v4 FINAL (13/11): "A MENTIRA" em carimbo Pimenta (`.stp`: borda dupla, rotate −4° mantido no fromTo, e a batida em T10 volta pra −4°, não pra 0) + "QUE CUSTA" + "R$ 1.958" marca-texto amarelo + frascos A/B. O casamento ficou em "(gancho casamento).mp4". O ffmpeg da aceleração já foi morto por memória (exit 137) quando rodou junto com o render: rodar a aceleração separada, com `-threads 2`.
- **13/11/2026 · PADRÃO DE RITMO = v24 (~4,3–4,4 palavras/s finais) em TODO vídeo**, substitui o 1,15x (ela achou lento). O fator varia por vídeo: F = fim da fala 1x × 4,35 ÷ palavras (v28: 50,2 × 4,35 / 148 = 1,47x → 36,1 s). Corte de pausas (≤0,26 s) antes da HeyGen só quando a soma das pausas passar de ~3 s (no v28 eram 1,5 s e não regerei o avatar). Conferir a clareza com o Whisper no áudio final (a 1,47x ficou claro, só o "Altaír" embolou um pouco). Em `qa_final.js`, o gancho em 0/2/4/7,5 s (com 1,47x o gancho dura 8,4 s). A pasta do v24 foi movida por ela para `Documents/Projeto - Valota Parfum /squads/@gabriel/squad-editor/output/v24-trabalho-comedia-ambar` (o nome tem espaço no fim de "Parfum ").
- **13/11/2026 · REGRA GLOBAL DOS CONECTIVOS:** todo `roteiro_voz.txt` (avatar e narração) segue `ClaudCode/REGRA-CONECTIVOS.md` (15–25 palavras por frase, conectivo em toda frase). Menos pontos = menos pausas da ElevenLabs = menos cortes de silêncio.
- **v30 · Cor do frasco (NA1 creme, 13/11/2026):** 1º roteiro com a regra dos conectivos (147 palavras / 7 frases): a voz 1x saiu com só 5 pausas pra cortar (0,8 s), contra 16 no v29. Fator 1,40x (47,37 × 4,35 / 147) ≈ 35,8 s finais. gen.js = molde do v29 + cenas novas reaproveitáveis: `frasco(cor, forma)` com 4 formatos (classico/redondo/alto/facetado), cartões "dicionário das cores" (cor → família da cartela), prateleira de madeira, ratoeira ("pegadinha"), guru da internet com ring light, painel noite→dia (tween backgroundColor NOITE→MENTA + sol nascendo + lua descendo), balança COR x CHEIRO (braço `svgOrigin:"400 140"`, pratos ±52 px). Gancho escrito grande no `persist` (fica fixo enquanto as cenas mudam embaixo, ~15 s finais) e vira selo. Fotos fimgs o.31861 (Sauvage EDT), o.29727 (Acqua di Giò Profumo), o.34696 (CDNI Man). Sem ffmpeg no PATH: usar node_modules/@ffmpeg-installer. Sem `timeout` no Mac.

## Avatar AV2 — v31 "EDT, EDP ou elixir? + 3 partes + famílias" (13/11/2026)
- Vídeo: `output/v31-edt-edp-familias-av2-avatar/REELS VALOTA PARFUM EDT EDP ELIXIR FAMILIAS AVATAR AV2.mp4` · 65,3 s a **1,73x** (ela escolheu entre as amostras 1,47x e 1,73x) · −14,1 LUFS · 87 SFX · 276 palavras · voz 1x 110,1 s (1.461 caracteres ElevenLabs; pausas só 1,3 s, não cortei) · HeyGen 113 s (saldo antes: 306).
- Gancho fixo (fórmula D1 aprovada) "EDT, EDP / OU ELIXIR? / APOSTO QUE VOCÊ NÃO SABE 👀" + 3 frascos com "?" de 0 a 11,5 s finais, tudo entre y 262 e 1090 (área do feed 3:4 y 240–1680 e da Reels).
- **Cenas reaproveitáveis:** `bottle(kind, frac, label, {q})` com 5 formatos (colonia/edt/edp/parfum/elixir escuro) e líquido em 2 camadas (álcool claro + essência âmbar, `A.fill()` anima attr y/height do `.ess`) · linha de 5 concentrações · taças brindando + corações ("encontro") · pirâmide em 3 faixas (Bergamota/Rosa/Cedro) com nuvenzinha "evapora" · linha do dia sol/tarde/lua + "SUMIU?" riscado · **roleta das 7 famílias** (cor da cartela por família, rotação sempre decrescente, centro mostra o que lembra; ponteiro amarelo) · painel react "NO SEU FRASCO" com 3 tópicos que acendem e ticam.
- Família → cor: cítrico Bergamota, floral Rosa, aromático Algodão (lavanda), amadeirado Cedro, oriental Pimenta, gourmand Âmbar, aquático Menta.
- Pronúncia: "é-dê-tê", "é-dê-pê", "ô de toalete", "ô de parfã", "parfã", "gurmã" no roteiro_voz (1 token por palavra pra bater com roteiro.txt); "5%" o ElevenLabs lê certo.
- **Loudness:** `alimiter` tem auto-ganho (`level=1` padrão) — usar `alimiter=limit=0.84:level=0`, senão sobe pra −12 LUFS. O ganho da aceleração vem junto: medir DEPOIS do atempo.
- `tools/narracao.js` aponta pra venv antiga em Documentos; transcrever com `.venv-whisper/bin/python` + faster_whisper passando numpy (o PyAV quebra no decode_audio).
- v28, v29 e v30 sumiram de output/ em 13/11 (movidos por ela).

- **14/11/2026 · transcrição quebrada pelo iCloud:** o `.ambiente.json` ainda apontava para o `.venv-whisper` antigo em `Documents/Projeto - Valota Parfum /…`; a pasta Documentos sincroniza com o iCloud, que deixou os arquivos "dataless" (220 KB em vez de ~180 MB) → `numpy._utils` e `av/.dylibs` sumiram. Correção: cache aponta para `squads/@gabriel/squad-editor/.venv-whisper` (em Downloads, fora do iCloud) e `tools/setup.js` agora, se o Python salvo não importar o faster-whisper, procura de novo (venv da squad primeiro) antes de reinstalar. **Nunca criar venv/node_modules dentro de Documentos ou Mesa.**

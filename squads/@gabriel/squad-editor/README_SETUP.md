# Squad Editor de Vídeo — Setup e Uso (v3)

Squad universal de vídeo para qualquer marca. **Não tem identidade visual fixa:** cores, fontes, logo,
estilo de legenda e linguagem de edição vêm da ficha da marca (`output/vN/ficha.json`) e das referências
que o Fred analisa em cada execução.

Três caminhos:
- **Caminho 1 — motion:** vídeo animado a partir do roteiro do usuário
- **Caminho 2 — gravado:** seleção de takes, corte pela fala, reenquadramento, legenda e áudio
- **Caminho 3 — híbrido:** gravado + camadas de motion (tela dividida, B-roll, overlays, encerramento)

---

## Instalação (automática)

O único pré-requisito é o **Node.js 18 ou mais novo** (https://nodejs.org). O resto a squad instala sozinha.

Na primeira vez que a squad roda em um computador, `tools/setup.js` confere e instala o que faltar:

| Item | Como é instalado |
|---|---|
| Pacotes do npm (`puppeteer`, `gsap`...) | `npm install` na pasta da squad |
| FFmpeg | Windows: winget · Mac: brew |
| Python 3 | Windows: winget (só para o usuário, sem pedir admin) · Mac: brew |
| faster-whisper (transcrição) | `pip install` |

- O Fred roda o setup no início de cada execução; a Dafne e o Salsicha também conferem sozinhos. Depois da primeira vez, a conferência é instantânea.
- O que foi encontrado fica em `.ambiente.json`. Ele vale só para aquele computador: ao compartilhar a squad, cada máquina gera o seu.
- Na primeira transcrição, o modelo de voz (`large-v3-turbo`) é baixado da internet, uma vez só: cerca de 1,6 GB.
- Para rodar à mão: `node tools/setup.js` (ou `npm run setup`). `--forcar` refaz tudo.

> **Drive de rede:** o npm pode falhar com `TAR_ENTRY_ERROR` e o ffmpeg não roda em caminho de rede.
> Deixe a squad em uma pasta local (ex.: Documentos). Copie também o bruto do Google Drive para o disco local antes de editar.

---

## Ficha da marca (todos os caminhos)

O Fred monta a ficha no Bloco 0 e salva `output/vN/ficha.json`:

```json
{
  "marca": "Nome",
  "cores":  { "fundo": "#000000", "destaque": "#50FEB1", "texto": "#FFFFFF", "apoio": "#B9C2BD" },
  "fontes": { "titulo":  { "familia": "Anton", "arquivo": "C:/.../Anton-Regular.ttf" },
              "texto":   { "familia": "Montserrat", "arquivo": "C:/.../Montserrat-ExtraBold.ttf", "peso": 800 } },
  "logos":  { "principal": "C:/.../logo.png", "simbolo": "C:/.../simbolo.png", "assinatura": "C:/.../logo-3d.png" },
  "legenda": { "usar": true, "destaque": "cor", "caixa": "original", "tamanho": 84 },
  "glossario": ["NomeDaMarca", "Claude Code"]
}
```

---

## Como a squad começa (onboarding em etapas)

0. **Aviso de modelo + confirmação** — primeira mensagem, sozinha: a squad deve ser usada com **Claude Opus 5.5 ou Fable** (o controle de qualidade depende disso). Nada roda antes da confirmação.
1. **Briefing da marca** — 5 campos: nome, site/Instagram, pasta com a identidade visual, **vídeos de referência** (arquivos) e referências externas. Cores, fontes, logos, estilo de legenda e glossário o Fred extrai sozinho da pasta e das referências, e só pergunta o que não achar. Só na primeira vez: fica salvo em `marcas/<marca>/` (`ficha.json` + `perfil.md`).
2. **Efeitos sonoros e trilhas** — a pasta da pessoa (música de fundo, pop, whoosh...), também salva no perfil da marca.
3. **Tipo de vídeo** — motion (animação) ou vídeo gravado.
4. **Motion:** roteiro escrito + narração (MP3, WAV ou o próprio MP4). **Gravado:** roteiro escrito + pasta das gravações.

## Regra de todos os caminhos: nada renderiza sem aprovação

```
significado de cada frase → (gravado) quadros por frase → plano + storyboard → USUÁRIO APROVA → render → QA
```
A Dafne e o Salsicha **bloqueiam o render** ("RENDER BLOQUEADO", código 3) se o plano não foi aprovado ou mudou depois da aprovação.

| Ferramenta | Para quê |
|---|---|
| `tools/frases.js` | Divide a fala/roteiro em frases com tempo → `significado.json` (o Fred preenche função, ideia, palavras-chave, visual, manter). `--validar`, `--cortes` |
| `tools/quadros.js` | Quadros por frase para escolher takes pela imagem e achar gestos (1 por frase em grade; 3 nas frases para comparar take) |
| `tools/marca.js` | `salvar`: guarda a marca em `marcas/<marca>/` e copia fontes e logos para lá (caminhos relativos: funciona em qualquer computador). `conferir`: confere os arquivos da marca |
| `tools/plano.js` | `preparar` (valida + `plano.md` + `storyboard.jpg`), `aprovar` (só com o ok do usuário), `status` |
| `daphne.js --quadros` | Fotos de segundos específicos de um HTML, sem render (revisão e storyboard) |
| `scrappy_editor.js --simular` | Tempos do vídeo editado sem renderizar (para camadas e cenas) |
| `tools/narracao.js` | Narração em MP3 → tempo real de cada palavra do roteiro (o motion segue a voz) |
| `tools/audio_inventario.js` | Organiza uma pasta de trilhas/efeitos e gera prévias para escolher |
| `animacoes/modelos/reforco.html` | Elemento de reforço reutilizável (número, selo, logo, texto, lista) |
| `animacoes/modelos/lettering.js` | Cenas só de tipografia, nas cores/fontes da ficha |
| `animacoes/modelos/simbolo.js` | Símbolo da marca animado ao fundo |
| `animacoes/modelos/assinatura.html` | Assinatura final: logo sozinha com luzes na cor de destaque |

## Caminho 1 — Motion

```bash
# com narração (recomendado): tempos reais da voz
node tools/narracao.js --audio "C:/.../narracao.mp3" --roteiro output/v1/roteiro.txt --out output/v1/narracao.json
node tools/frases.js --editada output/v1/narracao.json --out output/v1/significado.json
# sem narração: tempos de leitura
node tools/frases.js --roteiro output/v1/roteiro.txt --out output/v1/significado.json   # Fred preenche
node daphne.js animacoes/anim.html 12 --ficha output/v1/ficha.json --quadros 0.5,2,4,6 --out output/v1/revisao/anim
# Fred escreve output/v1/plano.json → node tools/plano.js preparar output/v1/plano.json → usuário aprova → aprovar
node daphne.js animacoes/anim.html 12 [audio_map.json] [--narracao narracao.mp3] --ficha output/v1/ficha.json --out output/v1/anim.mp4
# trocar só o áudio de um vídeo pronto: ... --remixar output/v1/anim.mp4
```
Render quadro a quadro (30 fps fixos, sem perda). O HTML pode usar `window.render(t)`, GSAP, CSS animations
ou `<video>` de fundo — ver `agents/dafne.agent.md` e o padrão de qualidade em `agents/velma.agent.md`.

## Caminhos 2 e 3 — Gravado e híbrido

```bash
# 1) análise
node scrappy_editor.js --input "C:/local/bruto" --ficha output/v1/ficha.json --modelo large-v3-turbo \
  --dry-run --json-out output/v1/analise.json --output output/v1/video.mp4
# 2) significado + quadros (o Fred preenche e olha)
node tools/frases.js --analise output/v1/analise.json --out output/v1/significado.json
node tools/quadros.js --significado output/v1/significado.json --analise output/v1/analise.json --out output/v1/quadros --todas
# 3) cortes (+ ênfases) e tempos simulados
node tools/frases.js --cortes output/v1/significado.json --out output/v1/cortes.json
node scrappy_editor.js --input "C:/local/bruto" --analise output/v1/analise.json --cortes output/v1/cortes.json --simular --output output/v1/video.mp4
# 4) camadas/reforços (Velma) → plano.json → preparar → usuário aprova → aprovar
node tools/plano.js preparar output/v1/plano.json
node tools/plano.js aprovar output/v1/plano.json --nota "aprovado pelo usuário"
# 5) edição (cortes, camadas e palavras-chave vêm do plano)
node scrappy_editor.js --input "C:/local/bruto" --analise output/v1/analise.json \
  --ficha output/v1/ficha.json --zoom auto --legendas --output output/v1/video.mp4
```

## Conferência

Toda edição termina com `tools/qa_video.js` (também pode rodar sozinho):
```bash
node tools/qa_video.js output/v1/video.mp4 --limites 7.8,18.8
```
Gera `qa/<nome>_relatorio.md` e `qa/<nome>_folha.jpg`. Imagem travada na emenda, quadro preto,
dessincronia, fps variável, loudness e tamanho são apontados.

---

## Principais opções do Salsicha

| Opção | O que faz | Padrão |
|---|---|---|
| `--ficha` | Ficha da marca (legenda, glossário, cores, fontes) | — |
| `--glossario` | Lista extra de nomes próprios (txt/json) | — |
| `--modelo` | small · medium · large-v3 · large-v3-turbo (o `small` é ~3x mais rápido, mas pode perder frases repetidas, ou seja, regravações) | large-v3-turbo |
| `--dry-run --json-out` | Análise (transcrição) sem render | — |
| `--simular` | Tempos do vídeo editado sem render | — |
| `--plano` | Plano aprovado (padrão: `plano.json` na pasta de saída) | — |
| `--analise` / `--cortes` | Reaproveita análise / cortes editoriais | — |
| `--pausa` | Remove pausas entre palavras maiores que isso (s) | 0.35 |
| `--zoom auto` | Alterna enquadramento 1,00/1,08 entre cortes | off |
| `--legendas` / `--legenda-estilo` | Legenda no estilo da ficha / estilo extra (json) | — |
| `--camadas` / `--encerramento` | Caminho 3 | — |
| `--bgm` / `--bgm-volume` | Trilha com ducking | 0.12 |
| `--transition` | none · fade | none |
| `--qualidade` | `social`: CRF 20 + teto de 12 Mbps (sem diferença visível, arquivo 2–3x menor) · `maxima`: CRF 18 sem teto (arquivo mestre) | social |
| `--max-mb` | Limite de tamanho do arquivo — **só se o usuário pedir** | — |
| `--sem-cache` | Refaz trechos e renders mesmo sem mudança (o cache fica em `output/vN/cache/`) | — |
| `--limite-transcricao` | Para a transcrição com segurança depois de N s (código 4, "TRANSCRIÇÃO PARCIAL"); o mesmo comando continua de onde parou. 0 = sem limite | 480 |
| `--fps` / `--resolucao` / `--horizontal` | Saída | 30 / 1080x1920 |

---

## Estrutura

```
squad-editor/
├── squad.yaml                   pipeline (3 caminhos)
├── daphne.js                    Dafne v3 — render quadro a quadro (alfa, ficha, GSAP local, <video>)
├── scrappy_editor.js            Salsicha v3 — edição de gravado e híbrido
├── legenda_motion_template.js   legenda karaokê (estilo vindo da ficha), fundo transparente
├── tools/audio_inventario.js    Scooby — inventário da pasta de áudio informada pela pessoa
├── tools/setup.js               instalação automática (1ª execução em cada computador)
├── tools/frases.js              transcrição com significado (frases, cortes pelo sentido)
├── tools/quadros.js             quadros por frase (takes pela imagem)
├── tools/plano.js               plano + storyboard + aprovação obrigatória
├── tools/marca.js               salva/confere a marca (copia fontes e logos para marcas/<marca>/arquivos/)
├── tools/ficha.js               lê a ficha resolvendo caminhos de fonte/logo
├── tools/cor.js                 gravação HDR (iPhone) → SDR
├── tools/painel.js              monta folhas/storyboard
├── tools/qa_video.js            conferência automática
├── agents/                      Fred, Velma, Dafne, Scooby, Salsicha
├── animacoes/modelos/reforco.html     elemento de reforço reutilizável
├── animacoes/modelos/lettering.js     cenas só de tipografia (máscara, letras, corte, eco, pulso...)
├── animacoes/modelos/simbolo.js       símbolo da marca animado ao fundo (balanço, flutua, gira, respira)
├── animacoes/modelos/assinatura.html  encerramento: logo sozinha no fundo com luzes
├── animacoes/anim_01 a anim_03        animações de exemplo
├── docs/                        guias da Velma (GSAP, Three.js, Motion)
├── _memory/memories.md          aprendizados técnicos da squad
├── marcas/                      marcas salvas (criada pelo Fred; cada marca em marcas/<marca>/)
├── assets/                      vídeos/imagens de fundo (só se usar Pexels; criada sob demanda)
└── output/                      resultados de cada execução (output/vN/; criada sob demanda)
```

## Troubleshooting

- **Algo não instalou sozinho:** rode `node tools/setup.js --forcar` e siga a instrução que ele mostrar.
- **Transcrição falhou na primeira vez:** o modelo de voz precisa de internet para baixar; confira conexão/firewall.
- **Render lento:** normal ~10–25 quadros/s. Feche outros programas pesados.
- **Fonte errada no vídeo:** confira se o caminho `arquivo` da fonte na ficha existe.
- **`Cannot find module`:** rode `node tools/setup.js` na pasta de onde está executando.

## Versão
3.8.1 — correções para instalação nova: `tools/setup.js` com o Chrome do Puppeteer 25 (`executablePath()` assíncrona), `tools/narracao.js` sem o PyAV (que quebra a transcrição com o PyAV 19), modelo de voz padrão `large-v3-turbo` (o `small` perde regravações) e `condition` em cada step do pipeline; step final de entrega com o nome `REELS <MARCA> <CONTEÚDO> EDITADO.mp4`.
3.8.0 — montagem do gravado sem normalizar os clipes inteiros, qualidade `social`, transcrição em partes com retomada, HDR→SDR, cache de ajustes, render paralelo e legenda em caixa com CSS livre.
3.3.0 — formulário de abertura com marcas salvas, narração em MP3 sincronizada, inventário de áudio, áudio obrigatório no plano.
3.2.0 — lettering, símbolo animado, assinatura final, papéis das cores confirmados na ficha.
3.1.0 — significado por frase, quadros por frase, plano + storyboard com aprovação obrigatória, ênfases, reforços e legenda por palavra-chave.
3.0.0 — render determinístico, identidade vinda da ficha, Caminho 3, QA automático, setup automático.

---
name: efeito
description: Cria do zero um efeito visual em cima do vídeo da pessoa (talking head) e renderiza o MP4 com o áudio original. Estilos prontos para seguir - widgets-flutuantes, ranking (tier list), órbita, mural-de-reels, checklist, interface-de-app, vox - ou qualquer efeito descrito em palavras. Use quando o usuário digitar /efeito, pedir "coloca um efeito", "faz o efeito X no meu vídeo", "edita meu vídeo com efeito", ou mandar um vídeo pedindo títulos, cards, tier list, recorte atrás da pessoa, colagem ou animação por cima.
---

# /efeito: efeitos criados do zero no vídeo da pessoa

Quem usa esta skill normalmente não é técnico. Responda curto, em português, faça o trabalho por ela e nunca peça para ela rodar comandos.

Nada aqui é efeito pronto. Para cada pedido você **escreve o efeito do zero** em `efeito.js`, seguindo o guia do estilo, e confere o resultado com os próprios olhos antes de entregar. Todos os comandos passam por `bash <pasta desta skill>/scripts/efeito <comando>` (use o caminho absoluto da pasta onde está este SKILL.md; abaixo, `FX` = esse comando). Funciona no Claude Code e no Claude do navegador.

## 1. Primeira vez: instalar
Rode `FX setup`. Instala em `~/.efeito` o que faltar (Python com MediaPipe, ffmpeg, Node e o desenhista de canvas); se já estiver instalado, responde na hora. Primeira vez: de 2 a 5 minutos. A última linha diz o resultado:
- `PRONTO`: siga.
- `PRECISA_PYTHON`: falta um Python entre 3.9 e 3.12. No Mac, instale o uv (`curl -LsSf https://astral.sh/uv/install.sh | sh`) e rode de novo; o uv baixa o Python certo sozinho.
- Erro de download (internet bloqueada): diga à pessoa que o ambiente dela bloqueia a instalação e que no Claude Code funciona.

**No Claude do navegador**, cada conversa começa numa máquina nova: rode o setup no começo de toda conversa que usar a skill. Os arquivos que a pessoa manda ficam em `/mnt/user-data/uploads/` e o vídeo final é salvo sozinho em `/mnt/user-data/outputs/` (de onde ela baixa).

## 2. Entender o pedido (no máximo uma pergunta)
- **Vídeo:** o arquivo que ela arrastou para o chat ou o caminho que deu. Vertical funciona melhor; horizontal é cortado em 9:16 em volta do rosto. Se ela disser que o vídeo é grande demais para mandar, peça só o trecho do efeito (cortado no celular) ou o vídeo exportado em 1080p.
- **Estilo:** o nome depois de `/efeito`. Ache na tabela abaixo (aceite variações: sem acento, singular, inglês). Se não estiver na lista, é um **efeito novo**: crie seguindo `guias/design.md`.
- **Trecho:** "dos 3 aos 6 segundos", "no começo", "quando eu falar X". Para uma palavra, rode `FX palavras VIDEO` e use os tempos (se responder `NAO_DEU`, a internet bloqueou o transcritor: peça o segundo exato). Sem trecho dito: vídeo de até 8 s recebe o efeito inteiro; mais longo, use de 3 a 5 s logo no começo e diga isso na entrega. O efeito fica melhor com 3 a 5 s.
- **Textos e dados:** use o que ela disser. Se o estilo pede algo pessoal (nome, @, foto, números) e ela não disse, pergunte uma vez, juntando tudo numa pergunta só. Nunca invente números como se fossem dela; sem números, use textos sem número.

| estilo | arquivo | o que é |
|---|---|---|
| `widgets-flutuantes` (vidro, widgets, glass) | `estilos/widgets-flutuantes.md` | cards de vidro fosco flutuando em volta da cabeça |
| `ranking` (tier list, tierlist, tier) | `estilos/ranking.md` | tier list S-D com cartinhas que voam para as fileiras |
| `órbita` (orbita, orbit) | `estilos/orbita.md` | cards girando em volta da pessoa, passando por trás dela |
| `mural-de-reels` (mural, reels) | `estilos/mural-de-reels.md` | título grande e cards de reels flutuando atrás da pessoa |
| `checklist` (tarefas, check) | `estilos/checklist.md` | painel "O Claude está editando" que marca etapas e cada etapa acontece na tela |
| `interface-de-app` (app, interface, instagram, seguir) | `estilos/interface-de-app.md` | UI clara: pílulas azuis, cards de grade, cursor clicando em Seguir |
| `vox` (colagem, explainer) | `estilos/vox.md` | colagem de papel estilo Vox: recorte P&B, marca-texto, caneta vermelha |

## 3. Preparar o vídeo
`FX preparar VIDEO --inicio A --fim B` (segundos do vídeo original).
Cria a pasta de trabalho (`<video>_efeito/` ao lado do vídeo, ou em `~/efeito-trabalho/` se ali não der para gravar) com os quadros do trecho, o recorte da pessoa, a caixa do rosto e o esqueleto do efeito. Ele imprime onde está o rosto e as faixas livres. **Abra `visao.jpg` e olhe**: onde está a pessoa, para onde ela olha, o fundo, as mãos, o espaço acima da cabeça.

Se aparecer `AVISO: corte de câmera` ou `AVISO: a câmera aproxima ou afasta`, o enquadramento muda no meio. Escolha um trecho sem corte (mova `--inicio`/`--fim` e rode de novo) ou, se ela quer exatamente aquele trecho, avise que o recorte vai trocar no corte.

Imagens que ela mandar (foto de perfil, prints de reels, logos) vão para `<pasta>/imagens/`. Sem imagens, use as fotos de `<pasta>/amostras/` (12 momentos do próprio vídeo dela).

## 4. Criar o efeito do zero
1. Leia `guias/tecnico.md` (como escrever `efeito.js` e as ferramentas que já existem) e o guia do estilo. O efeito é desenhado para o enquadramento, as cores e o assunto *deste* vídeo.
2. Escreva `<pasta>/efeito.js`. Posicione tudo a partir de `k.rosto`. Textos em português, curtos.
3. Escreva a linha do tempo do efeito pensando no trecho real (`k.d`): entrada nos primeiros 0,3 s, algo novo a cada 0,4 a 0,8 s, auge perto de 70 % do trecho, segurar legível no fim.

## 5. Conferir com os próprios olhos (obrigatório)
1. `FX renderizar PASTA --folha` gera `checagem/folha.jpg` (8 momentos do trecho). **Abra e olhe.** Para detalhe: `--quadros 1.2,2.8`.
2. Dê nota de 1 a 10 para cada ponto:
   - **Rosto livre:** nada cobre olhos e boca (a não ser o que foi feito para ficar atrás da pessoa).
   - **Leitura no celular:** texto de pelo menos 34 px, contraste bom, nada cortado na borda, longe das faixas que o Instagram cobre (8 % de cima, 18 % de baixo).
   - **Movimento:** entra com energia, não é só aparecer devagar, e sempre tem algo novo.
   - **Fiel ao estilo:** tem os elementos obrigatórios do guia do estilo.
   - **Acabamento:** alinhamento, respiro entre elementos, recorte limpo, sem nada "piscando" de um quadro para o outro.
3. Corrija os 3 piores pontos e confira de novo. Repita até tudo ficar com 8 ou mais (no máximo 4 rodadas).

## 6. Renderizar e entregar
`FX renderizar PASTA --final` gera `<video>_efeito.mp4` (ao lado do original; no navegador, em `/mnt/user-data/outputs/`): o vídeo inteiro, com o efeito no trecho e o áudio original intacto. O caminho aparece na última linha (`PRONTO: ...`).
Entregue com uma linha: onde está o arquivo, o que foi feito e o lembrete de assistir antes de postar. Se ela pedir ajustes ("mais rápido", "o texto cobre meu rosto", "troca a cor"), edite `efeito.js`, confira a folha de novo e renderize.

**Mais de um efeito no mesmo vídeo:** faça um de cada vez. O segundo usa o vídeo que saiu do primeiro, com `--saida <video>_efeito2` e `--nome` para não sobrescrever.

## Regras
- O efeito é função pura do tempo: nada de `Math.random()` (use `rnd(semente)`), `Date.now()`, `setTimeout` nem estado guardado entre quadros.
- Nunca cubra o rosto. O que precisa passar pela pessoa vai **atrás** dela: desenhe antes de `pessoa(g, k.recorte)`.
- Não edite nada da pasta da skill. Tudo vai no `efeito.js` da pasta de trabalho.
- Esta skill coloca só o visual. Música, legendas e efeitos sonoros ficam com ela, no editor que ela usa.
- Sem exagero na entrega: é uma primeira versão feita por IA, e a pessoa aprova antes de postar.

---
name: backup-github
description: "Projeto tem backup no GitHub privado osianysales-lgtm/valota-parfum-claude; \"salva no GitHub\" = rodar ./salvar-no-github.sh"
metadata:
  node_type: memory
  type: reference
  originSessionId: 88b22d42-dd74-4e32-855e-552d56803ff5
  modified: 2026-11-14T16:44:58.923Z
---

Backup do projeto ClaudCode no GitHub **privado** `osianysales-lgtm/valota-parfum-claude` (criado 14/11/2026). Objetivo dela: não perder regras/memórias/copy/squads/templates/skills se o Mac (pouca memória) der pane, e poder usar o Claude Code em outro computador.

- Quando ela pedir "salva no GitHub" (ou ao fim de mudanças grandes em regras/memórias/skills), rodar `./salvar-no-github.sh` na raiz: copia esta pasta de memória + `~/.claude/skills/` + settings pra `claude-config/` e faz commit + push.
- `gh` foi instalado em `~/.local/bin/gh` (sem Homebrew no Mac), já logado.
- Ficam FORA (.gitignore): `.env*`, vídeos mp4/mov, mídia de `output/` e `carrosseis/` (posts já publicados, ela não precisa), venvs, node_modules.
- Guia de restauração: `COMO-RECUPERAR.md` na raiz.
- 14/11/2026: conta GitHub `isabella612` virou colaboradora (outro computador, outra conta). Scripts agora são portáteis (caminho da memória calculado pela pasta) e há `./puxar-do-github.sh` = "puxa as novidades do GitHub" (git pull + instala memórias/skills). `salvar` também puxa antes de enviar. settings.json não é mais copiado (é pessoal de cada computador).

#!/bin/zsh
# Junta as novidades do GitHub, copia memórias + skills do Claude pra dentro do projeto e envia tudo.
# Funciona em qualquer computador (o caminho da memória é calculado pela pasta atual).
# Uso: ./salvar-no-github.sh   (ou peça ao Claude: "salva no GitHub")
set -e; export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"
MEM="$HOME/.claude/projects/$(pwd | sed 's/[^a-zA-Z0-9]/-/g')/memory"
DEST=claude-config
mkdir -p "$MEM" "$HOME/.claude/skills" "$DEST/memoria" "$DEST/skills"
EXC=(--exclude node_modules --exclude '.env*' --exclude .DS_Store)

# 1. puxa o que a outra pessoa salvou e traz memórias/skills novas pra cá
git pull -q --rebase --autostash origin main || { echo "⚠️  Conflito ao puxar do GitHub, peça ajuda ao Claude."; exit 1; }
rsync -a --update $EXC "$DEST/memoria/" "$MEM/"
rsync -a --update $EXC "$DEST/skills/" "$HOME/.claude/skills/"

# 2. manda as memórias/skills deste computador pro projeto
rsync -a --delete $EXC "$MEM/" "$DEST/memoria/"
rsync -a --delete $EXC "$HOME/.claude/skills/" "$DEST/skills/"

git add -A
git commit -q -m "Backup $(date '+%d/%m/%Y %H:%M') ($(whoami))" || echo "Nada novo pra salvar."
git push -q origin main && echo "✅ Salvo no GitHub."

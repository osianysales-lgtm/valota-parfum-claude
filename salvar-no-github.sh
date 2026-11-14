#!/bin/zsh
# Copia memórias + skills do Claude pra dentro do projeto e envia tudo pro GitHub.
# Uso: ./salvar-no-github.sh   (ou peça ao Claude: "salva no GitHub")
set -e; export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"
DEST=claude-config
mkdir -p "$DEST"
rsync -a --delete --exclude node_modules --exclude '.env*' --exclude .DS_Store \
  "$HOME/.claude/projects/-Users-osianysales-Downloads-ClaudCode/memory/" "$DEST/memoria/"
rsync -a --delete --exclude node_modules --exclude '.env*' --exclude .DS_Store \
  "$HOME/.claude/skills/" "$DEST/skills/"
cp "$HOME/.claude/settings.json" "$DEST/settings.json"
git add -A
git commit -q -m "Backup $(date '+%d/%m/%Y %H:%M')" || echo "Nada novo pra salvar."
git push -q origin main && echo "✅ Salvo no GitHub."

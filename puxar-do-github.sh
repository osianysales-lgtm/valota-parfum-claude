#!/bin/zsh
# Baixa as novidades do GitHub e instala as memórias + skills novas neste computador.
# Uso: ./puxar-do-github.sh   (ou peça ao Claude: "puxa as novidades do GitHub")
set -e; export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"
MEM="$HOME/.claude/projects/$(pwd | sed 's/[^a-zA-Z0-9]/-/g')/memory"
mkdir -p "$MEM" "$HOME/.claude/skills"
EXC=(--exclude node_modules --exclude '.env*' --exclude .DS_Store)
git pull -q --rebase --autostash origin main || { echo "⚠️  Conflito ao puxar do GitHub, peça ajuda ao Claude."; exit 1; }
rsync -a --update $EXC claude-config/memoria/ "$MEM/"
rsync -a --update $EXC claude-config/skills/ "$HOME/.claude/skills/"
echo "✅ Novidades baixadas. Memórias em: $MEM"

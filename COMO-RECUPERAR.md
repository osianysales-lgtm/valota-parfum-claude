# Backup Valota Parfum · Claude Code

Aqui está tudo que o Claude aprendeu e usa no projeto Valota Parfum: regras (`CLAUDE.md`, `REGRA-CONECTIVOS.md`), squads, templates, copy, direção de arte e, na pasta `claude-config/`, as **memórias** e as **skills** (Animador Zero/bonecos, efeito, HyperFrames, media-use).

**Não está aqui:**
- chaves de API (arquivos `.env`), que precisam ser recriadas no computador novo;
- vídeos `.mp4`/`.mov`, imagens e áudios de posts já publicados;
- programas reinstaláveis (`node_modules`, `.venv`).

## Salvar de novo (no computador atual)

No terminal, dentro da pasta `ClaudCode`:

```
./salvar-no-github.sh
```

Ou peça ao Claude: **"salva no GitHub"**.

## Usar em outro computador

1. Instale o Claude Code e faça login no GitHub.
2. Baixe o projeto:
   ```
   cd ~/Downloads
   git clone https://github.com/SEU-USUARIO/valota-parfum-claude.git ClaudCode
   ```
3. Peça ao Claude: **"restaura as memórias e skills que estão em claude-config"**. Ele copia:
   - `claude-config/memoria/` → `~/.claude/projects/<nome-da-pasta>/memory/`
   - `claude-config/skills/` → `~/.claude/skills/`
   - `claude-config/settings.json` → `~/.claude/settings.json`
4. Recrie o arquivo `.env` com as chaves (ElevenLabs etc.) e reinstale as dependências (`npm install` dentro de `squads/@gabriel/squad-editor` e de `claude-config/skills/animador-zero/motor`).

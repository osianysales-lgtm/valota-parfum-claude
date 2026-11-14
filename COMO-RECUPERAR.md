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

1. A conta do GitHub precisa ser colaboradora do repositório (já feito pra `isabella612`).
2. Instale o VS Code + extensão Claude Code e clone o projeto (`Git: Clone` → `osianysales-lgtm/valota-parfum-claude`) dentro de `Downloads`.
3. Na pasta `ClaudCode`, rode `./puxar-do-github.sh` (ou peça ao Claude: **"puxa as novidades do GitHub"**). Ele instala as memórias e skills de `claude-config/` no lugar certo deste computador.
4. Recrie o arquivo `.env` com as chaves (ElevenLabs etc.) e reinstale as dependências (`npm install` dentro de `squads/@gabriel/squad-editor` e de `claude-config/skills/animador-zero/motor`).

## Duas pessoas usando ao mesmo tempo

- **Antes de começar:** `./puxar-do-github.sh` ("puxa as novidades do GitHub").
- **Ao terminar:** `./salvar-no-github.sh` ("salva no GitHub"). O script puxa antes de enviar, então junta as memórias das duas.
- Os dois scripts calculam sozinhos a pasta de memória de cada computador.

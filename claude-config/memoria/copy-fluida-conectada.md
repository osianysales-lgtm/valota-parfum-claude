---
name: copy-fluida-conectada
description: "Copy sempre com falas fluidas e conectadas; nada de final em lista (\"Calor: X. Encontro: Y.\") nem piada/bordão solto"
metadata:
  node_type: memory
  type: feedback
  originSessionId: cfe3d1df-cb2b-4890-ba70-903b2b593292
  modified: 2026-11-11T22:27:38.247Z
---

Toda copy precisa soar como uma conversa contínua, em que cada fala nasce da anterior.

- O final volta para a cena do gancho com frases completas e não vira resumo em tópicos.
- Piada e callback ("é... quase") só entram se foram armados antes e se voltam com uma frase que mostra o que mudou.

**Why:** em 11/11/2026 ela achou o final do v20 sem conexão: "pra calor Vulcan Feu ou Turathi, encontro de dia Marwa Extrait, do nada foi pra esse assunto". Também achou o "quando ela perguntar... é quase" solto. A squad tinha rodado inteira, mas nenhuma regra cobrava a costura entre as etapas. Ela pediu para **não mudar o v20**, então a regra vale para os próximos.

**How to apply:** a regra está em `estrutura-viral.md` (seção 10, "Costura", com exemplo ❌/✅), no roteirista, que marca as pontes com ↪, no revisor (Otto), como item eliminatório, na Lara, que define a "volta" do gancho, e no `squad.yaml` (regra 8). Ver [[copy-sempre-squad-e-narracao]] e [[regra-nova-vale-pros-proximos]].

**Causa encontrada (11/11/2026):** o `squad.yaml` tinha `format: roteiro + copy`, que não corresponde a nenhum arquivo em `_expxagents/core/best-practices/`. Por isso os guias `instagram-reels.md` e `copywriting.md` ("leia em voz alta", "cada parágrafo faz o próximo parecer necessário") nunca eram carregados. A correção foi mudar para `format: instagram-reels`, criar `conhecimento/boas-praticas-reels-copy.md` (os 2 guias em PT, adaptados) e colocar a leitura obrigatória dos 6 arquivos de conhecimento no topo dos 7 agentes. Em squad nova, conferir se o `format` bate com um arquivo de best-practices.

**Atualização em 13/11/2026: roteiro CONVERSACIONAL, poucos pontos (vale pra TODO roteiro, não só avatar).** Ela disse: "to sentindo muito ponto, muita coisa curta… a frase não pode ficar solta do nada pra não parecer um robô". Regra medível: média de 15–25 palavras por frase (6–9 pontos em 30 s), no máximo 1 frase de até 5 palavras (interjeição), toda frase começa com conectivo ou retoma a anterior, lista numa frase só. Conectivo custa ~10–15% de palavras: cortar item, nunca conectivo. Está em estrutura-viral §10 regra 7, na Nina, no Otto (eliminatório) e no squad.yaml regra 8. Exemplo aprovado: versão A do "cor do frasco" (147 palavras / 7 pontos).

**Regra GLOBAL (13/11/2026):** ela pediu que isso valha "pra tudo que uso IA, avatar, narração". O arquivo-fonte é `ClaudCode/REGRA-CONECTIVOS.md`, ligado no `ClaudCode/CLAUDE.md`, no `_expxagents/_memory/preferences.md` (todos os squads), no squad-editor e no carrossel-tweet. O texto de tela continua curto.

**14/11/2026 · VALE PRA DIÁLOGO E PRA COPY PRONTA (ela cansou de repetir):** na série de bonecos eu gerei a voz da P1 com o copy do squad picotado ("Vai levar?" / "Calma, Seu Valdir..." / "Experiência olfativa.") e ela reprovou: "muito pausado, poucas frases, parece que estão lendo um texto… isso é regra em criação de QUALQUER copy, não aguento mais ficar explicando". **How to apply:** antes de gerar voz/vídeo de QUALQUER copy (inclusive a que já chega pronta de outro agente/arquivo), conferir contra REGRA-CONECTIVOS.md e reescrever sem ela pedir. Diálogo = falas de ~12–25 palavras que começam com conectivo ou retomam a palavra do outro, máx. 1–2 reações curtas por parte. Corrigido também em `serie-bonecos.md` §5 e no `CLAUDE.md`. Ver [[serie-bonecos-vozes-elenco]].

---
name: valota-parfum-controle-conteudo
description: "Meta de 6 posts/dia da Valota Parfum (IG + TikTok) e o sistema local de controle em Documentos/Controle de Conteúdo Valota Parfum"
metadata:
  type: project
---

Desde 10/11/2026 a Osiany tem a meta de **6 posts por dia**, com o mesmo conteúdo no Instagram e no TikTok. O controle fica no sistema local `/Users/osianysales/Documents/Controle de Conteúdo Valota Parfum/`:
- servidor Python que roda só no Mac, porta 8765;
- abre pelo app "Controle Valota Parfum" (ou "Abrir Controle.command");
- dados em `dados/plano.json`;
- `gerar_plano.py --anexar` cria o mês seguinte;
- guia em COMO-USAR.md.

O 1º plano vai de 10/11 a 09/12/2026 (180 posts):
- **Formatos:** 2 carrosséis, 2 vídeos de narração e 2 de avatar por dia. Humanizado 3 vezes por semana (posta qua, sex e dom; grava na véspera), porque ela só consegue gravar 2 ou 3 por semana.
- **Pilares:** Nicho x Árabe 33% (o principal, ela quer volume), Indicação por ocasião 22%, Curiosidades, Ranking, Comédia e Notícias.
- **Postagem:** ela agenda tudo.

**Why:** ela pediu um "sisteminha local" em vez de planilha. Os 3 posts antigos do Instagram vão ser arquivados depois, quando houver mais conteúdo; o plano já traz as versões refeitas na paleta (19 a 21/11).

**How to apply:** quando ela pedir pauta, roteiro ou status da semana, ler e atualizar o `dados/plano.json` (ou usar a API em http://valotaparfum.localhost:8765). Quando ela trouxer métricas, registrar nos posts. No TikTok, em 10/11, os posts de ocasião (academia e date) tinham média de cerca de 1.176 views e os comparativos cerca de 486. Os carrosséis rendiam mais que os vídeos. Ver [[valota-instagram-direcao-de-arte]] e [[nome-valota-parfum]].

Atualização em 10/11/2026:
- **CTAs:** ela quer CTAs ligados ao conteúdo, no estilo "Já segue a Valota Parfum? Aqui eu te mostro como..." + o benefício real.
- **Séries Parte 1 → Parte 2** ("te conto no próximo vídeo") para levar gente ao perfil.
- **Onde fica:** a biblioteca está em `ctas.py` (na pasta do controle), que também gera `copy-viral-perfumes/conhecimento/ctas.md`. O plano tem 7 séries, com a Parte 2 sempre agendada no dia seguinte.
- **Cuidado:** o `gerar_plano.py --anexar` reaproveita as mesmas listas de pautas, então antes de gerar o mês seguinte é preciso renovar as pautas com ela.

Atualização em 10/11/2026 (2):
- **Como abrir:** pelo app `~/Applications/Controle Valota Parfum.app` (tem atalho na Mesa). Ele roda `abrir.sh`, que liga o servidor em segundo plano e abre http://valotaparfum.localhost:8765. O navegador padrão dela é o Chrome.
- **Por que local e não Vercel:** ela quer servidor local por ser mais simples. O Mac dela tem 8 GB de RAM e o servidor usa cerca de 13 MB.
- **Edição pela tela:** dá pra editar tudo, inclusive rotina e biblioteca de CTAs. A biblioteca editada fica em `config.cta_lib` e tem prioridade sobre o `ctas.py`.
- **Backups:** últimas 40 alterações + 1 cópia por dia guardada por 90 dias, em `dados/backups`.

Atualização em 10/11/2026 (3): a pedido dela, o controle foi movido de Downloads para **/Users/osianysales/Documents/Controle de Conteúdo Valota Parfum** (a pasta Documentos sincroniza com o iCloud). As squads continuam em Downloads/ClaudCode/squads/@valotaparfum; o controle aponta para elas com caminho absoluto (constante SQUADS no servidor.py e no gerar_plano.py).

Atualização em 10/11/2026 (4): a pedido dela, os roteiros da squad ficam separados por formato: `copy-viral-perfumes/output/carrosseis/` e `copy-viral-perfumes/output/videos/` (narração e avatar). Todo roteiro novo vai na subpasta certa, e o campo `roteiro` do plano aponta para ela.

# Instagram Advisor Squad

Squad especializado em análise de performance de conteúdo Instagram — identifica padrões de copy, tipos de conteúdo e estrutura que funcionam melhor.

## 📋 O que a Squad Faz

A squad analisa as **últimas 30 postagens** de uma conta Instagram Business e traz:

1. **Análise de Padrões de Conteúdo**
   - Classificação automática por tipo (Pergunta, Hashtag Heavy, CTA, Minimalista, etc)
   - Performance média por tipo
   - Identificação de qual tipo tem maior engagement

2. **Análise de Estrutura de Copy**
   - Quantidade de hashtags, emojis, perguntas
   - Comprimento médio de legenda
   - Presença de CTAs e links
   - Correlação com engagement

3. **Recomendações de Padrão**
   - Tipo de conteúdo mais efetivo
   - Estrutura de copy ideal
   - Características que aumentam engajamento
   - Timing recomendado

4. **Outputs Gerados**
   - `instagram_analysis.json` — dados estruturados completos
   - `instagram_analysis_report.md` — relatório executivo em Markdown

## 🔧 Como Configurar

### Variáveis de Ambiente Obrigatórias

Adicione ao seu `.env`:

```
METAADS_TOKEN=seu_token_aqui
METAADS_INSTAGRAM_ID=17841402362212327
```

### Como Obter o Token com Permissões Corretas

1. Acesse **Meta Business Suite** → Configurações
2. Vá em **Usuários e Permissões** → Contas de Anúncios
3. Selecione sua conta de anúncios
4. Adicione as permissões:
   - ✅ `instagram_business_read`
   - ✅ `pages_read_user_content`
   - ✅ `pages_read_engagement`
   - ✅ `ads_management` (opcional)

5. Gere novo token (pode precisar reconectar)

### Como Encontrar seu METAADS_INSTAGRAM_ID

Se você já tem a lista de contas:

```bash
python3 squads/instagram-advisor/fetch_instagram_accounts.py
```

Procure pela sua conta e copie o `instagram_business_id`.

Ou use o script que já tem na pasta:

```bash
grep "Software House\|sua_conta" instagram_accounts.json
```

## ▶️ Como Executar

### Opção 1: Executar Script Direto

```bash
cd "i:/Meu Drive/Cérebro"
python3 squads/instagram-advisor/analyze_instagram_posts.py
```

### Opção 2: Via ExpxAgents Squad

```bash
/expxagents run instagram-performance
```

## 📊 Output da Squad

### Arquivo: `instagram_analysis.json`

Contém dados estruturados para processamento:

```json
{
  "timestamp": "2026-04-16T12:35:20",
  "instagram_id": "17841402362212327",
  "username": "@thuliobittencourt",
  "account_name": "Thulio Bittencourt",
  "analysis_summary": {
    "total_posts_analyzed": 30,
    "avg_engagement_rate": 4.82,
    "avg_reach": 2345,
    "post_types": {
      "Pergunta/Engajamento": 8,
      "Hashtag Heavy": 7,
      "Padrão": 10,
      "Minimalista": 3,
      "Com Call-to-Action": 2
    },
    "avg_metrics_by_type": {
      "Pergunta/Engajamento": {
        "count": 8,
        "avg_engagement_rate": 6.45,
        "avg_reach": 3120,
        "avg_engagement_count": 189
      }
      // ... mais tipos
    },
    "characteristics": {
      "with_hashtags": 22,
      "with_emoji": 24,
      "with_cta": 8,
      "with_question": 12,
      "with_numbers": 18,
      "with_link": 5
    },
    "top_performing_posts": [...],
    "bottom_performing_posts": [...]
  },
  "detailed_posts": [...]
}
```

### Arquivo: `instagram_analysis_report.md`

Relatório executivo em Markdown com:

- 📊 Resumo de performance
- 🎯 Tipos de conteúdo analisados
- 🔍 Características de copy mais efetivas
- 💡 Padrão recomendado
- 🏆 Top 5 posts
- 📉 Bottom 5 posts

## 🎯 Como Usar os Resultados

### Exemplo Real

Se a análise mostrar:

```
📌 Tipo de Conteúdo Recomendado: 'Pergunta/Engajamento' com 6.45% de engagement rate
✅ Hashtags funcionam bem — continuar usando em >70%
✅ Emojis são eficazes — manter uso em >80%
🏆 Post Top Performer: Pergunta/Engajamento com 23 palavras (engagement: 7.82%)
```

**Então para próximas postagens:**

✅ **Fazer:**
- Posts com perguntas diretas ao público
- 20-30 palavras de legenda
- 2-4 emojis relevantes
- 4-6 hashtags no final
- Postar entre 9h-16h

❌ **Evitar:**
- Posts genéricos sem engajamento
- Legendas muito curtas (<50 palavras)
- Ausência de emojis ou hashtags
- Calls-to-action muito diretos (links)

## 🔄 Fluxo Recomendado

1. **Executar análise** (1x por semana)
   ```bash
   python3 squads/instagram-advisor/analyze_instagram_posts.py
   ```

2. **Revisar relatório** (`instagram_analysis_report.md`)
   - Entender quais tipos funcionam melhor
   - Identificar padrão de copy

3. **Aplicar padrão** nas próximas 10-15 postagens
   - Seguir recomendações
   - Manter consistência

4. **Medir resultado** (após 2 semanas)
   - Rodar análise novamente
   - Comparar engagement rate
   - Ajustar se necessário

## 🛠️ Troubleshooting

### Erro: "Application does not have permission"

**Causa:** Token não tem permissões de leitura para esta conta

**Solução:**
1. Gere novo token no Meta Business Suite
2. Certifique que tem permissões: `instagram_business_read`, `pages_read_user_content`
3. Adicione novo token ao `.env`

### Erro: "METAADS_INSTAGRAM_ID não encontrado"

**Causa:** Variável não está no `.env`

**Solução:**
1. Abra `.env`
2. Adicione: `METAADS_INSTAGRAM_ID=seu_id_aqui`
3. Salve e tente novamente

### Resultado: "0 postagens encontradas"

**Causa:** 
- Conta não tem 30 postagens ainda
- Token não tem permissões
- ID está incorreto

**Solução:**
1. Verifique se a conta tem postagens públicas
2. Gere novo token com permissões corretas
3. Confirme o ID com: `python3 squads/instagram-advisor/fetch_instagram_accounts.py`

## 📈 Métricas Rastreadas

A squad coleta para cada post:

| Métrica | O que é |
|---------|---------|
| **Impressões** | Quantas vezes o post foi exibido |
| **Alcance** | Quantas pessoas únicas viram |
| **Engajamento** | Total de likes + comentários + saves + shares |
| **Engagement Rate** | Engajamento ÷ Impressões × 100 |
| **Likes** | Número de curtidas |
| **Comentários** | Número de comentários |
| **Saves** | Número de vezes que foi salvo |
| **Shares** | Número de compartilhamentos |

## 🎨 Tipos de Conteúdo Classificados

- **Pergunta/Engajamento** — Post com pergunta para o público
- **Hashtag Heavy** — 6+ hashtags na legenda
- **Com Call-to-Action** — Links, CTAs diretos
- **Emoji Heavy** — 4+ emojis
- **Texto Longo/Story** — Legenda >500 palavras
- **Minimalista** — Legenda <100 palavras
- **Padrão** — Outros posts

## 📝 Próximos Passos

1. **Configurar token com permissões corretas**
2. **Rodar primeira análise**
3. **Aplicar recomendações em 10-15 posts**
4. **Rodar análise novamente após 2 semanas**
5. **Medir impacto no engagement rate**

---

**Status:** ✅ Squad pronta para uso  
**Última atualização:** 16/04/2026  
**Autor:** Meta Ads Integration Squad

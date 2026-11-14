#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Meta Ads API - Instagram Posts Performance Analysis
Analisa as últimas 30 postagens de uma conta Instagram Business
e identifica padrões de conteúdo que funcionam melhor
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from collections import Counter
import re
import sys

# Configure stdout para UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
METAADS_INSTAGRAM_ID = os.getenv('METAADS_INSTAGRAM_ID')
API_VERSION = 'v20.0'
GRAPH_API_FACEBOOK = f'https://graph.facebook.com/{API_VERSION}'


def validate_inputs() -> bool:
    """Valida se as variáveis obrigatórias estão configuradas"""
    if not METAADS_TOKEN:
        print('❌ Erro: METAADS_TOKEN não encontrado no .env')
        return False
    if not METAADS_INSTAGRAM_ID:
        print('❌ Erro: METAADS_INSTAGRAM_ID não encontrado no .env')
        return False
    return True


def get_account_info() -> Tuple[str, str]:
    """
    Obtém informações da conta Instagram para confirmar acesso
    """
    print(f'🔍 Verificando acesso à conta {METAADS_INSTAGRAM_ID}...\n')

    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{METAADS_INSTAGRAM_ID}',
            params={
                'fields': 'id,username,name,biography,profile_picture_url,followers_count,media_count',
                'access_token': METAADS_TOKEN
            }
        )
        response.raise_for_status()
        data = response.json()

        username = data.get('username', 'N/A')
        name = data.get('name', 'N/A')
        profile_pic = data.get('profile_picture_url', '')
        followers = data.get('followers_count', 0)
        media_count = data.get('media_count', 0)

        print(f'✅ Conta encontrada: @{username} ({name})')
        print(f'   Seguidores: {followers} | Posts: {media_count}\n')
        return username, name, profile_pic, followers, media_count

    except requests.exceptions.HTTPError as e:
        error_data = e.response.json()
        error_msg = error_data.get('error', {}).get('message', str(e))
        print(f'❌ Erro ao acessar conta:')
        print(f'   Status: {e.response.status_code}')
        print(f'   Mensagem: {error_msg}\n')
        return '', '', '', 0, 0
    except Exception as e:
        print(f'❌ Erro: {str(e)}\n')
        return '', '', '', 0, 0


def get_instagram_media(instagram_id: str, limit: int = 30) -> List[Dict]:
    """
    Busca as últimas N postagens (media) da conta Instagram
    Tenta múltiplos endpoints
    """
    print(f'🔍 Buscando últimas {limit} postagens...\n')

    endpoints = [
        f'{GRAPH_API_FACEBOOK}/{instagram_id}/media',
        f'{GRAPH_API_FACEBOOK}/{instagram_id.lstrip("act_")}/media' if instagram_id.startswith('act_') else None
    ]

    for endpoint in endpoints:
        if not endpoint:
            continue

        try:
            response = requests.get(
                endpoint,
                params={
                    'fields': 'id,caption,media_type,media_product_type,timestamp,like_count,comments_count,thumbnail_url,media_url,permalink',
                    'limit': limit,
                    'access_token': METAADS_TOKEN
                }
            )

            if response.status_code == 200:
                data = response.json()
                media_list = data.get('data', [])
                print(f'✅ {len(media_list)} postagens encontradas\n')
                return media_list
            elif response.status_code == 400:
                error_data = response.json()
                error_msg = error_data.get('error', {}).get('message', '')
                print(f'   Endpoint {endpoint.split("/")[-1]} retornou erro: {error_msg}')
                continue
            else:
                response.raise_for_status()

        except Exception as e:
            print(f'   Erro ao tentar {endpoint}: {str(e)}')
            continue

    print('❌ Não foi possível acessar nenhum endpoint de postagens\n')
    return []


def get_post_insights(post_id: str) -> Dict:
    """
    Busca insights detalhados de uma postagem específica
    """
    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{post_id}/insights',
            params={
                'metric': 'engagement,impressions,reach,saved,shares',
                'access_token': METAADS_TOKEN
            }
        )

        if response.status_code == 200:
            data = response.json()
            insights = {}
            for metric in data.get('data', []):
                metric_name = metric.get('name')
                metric_value = metric.get('values', [{}])[0].get('value', 0)
                insights[metric_name] = metric_value
            return insights
        else:
            return {}

    except Exception as e:
        return {}


def analyze_post_content(caption: str) -> Dict:
    """
    Analisa características do conteúdo da postagem
    """
    if not caption:
        return {
            'type': 'Sem legenda',
            'word_count': 0,
            'has_hashtags': False,
            'hashtag_count': 0,
            'has_emoji': False,
            'emoji_count': 0,
            'has_cta': False,
            'has_question': False,
            'has_numbers': False,
            'has_link': False
        }

    hashtags = re.findall(r'#\w+', caption)
    emojis = re.findall(r'[\U0001F300-\U0001F9FF]', caption)
    has_link = 'http' in caption or 'bit.ly' in caption or 'linktree' in caption.lower()
    has_question = '?' in caption
    has_numbers = bool(re.search(r'\d+', caption))

    # Detectar tipo de postagem pela estrutura
    post_type = 'Outro'
    if len(hashtags) > 5:
        post_type = 'Hashtag Heavy'
    elif has_question:
        post_type = 'Pergunta/Engajamento'
    elif has_link:
        post_type = 'Com Call-to-Action'
    elif len(emojis) > 3:
        post_type = 'Emoji Heavy'
    elif len(caption) > 500:
        post_type = 'Texto Longo/Story'
    elif len(caption) < 100:
        post_type = 'Minimalista'
    else:
        post_type = 'Padrão'

    return {
        'type': post_type,
        'word_count': len(caption.split()),
        'has_hashtags': len(hashtags) > 0,
        'hashtag_count': len(hashtags),
        'has_emoji': len(emojis) > 0,
        'emoji_count': len(emojis),
        'has_cta': has_link,
        'has_question': has_question,
        'has_numbers': has_numbers,
        'has_link': has_link
    }


def enrich_posts_with_insights(posts: List[Dict]) -> List[Dict]:
    """
    Enriquece cada postagem com insights e análise de conteúdo
    """
    enriched_posts = []
    total_posts = len(posts)

    for idx, post in enumerate(posts, 1):
        post_id = post.get('id')
        caption = post.get('caption', '')
        media_type = post.get('media_type', 'UNKNOWN')

        print(f'[{idx}/{total_posts}] Analisando postagem...', end=' ')

        # Buscar insights
        insights = get_post_insights(post_id)

        # Analisar conteúdo
        content_analysis = analyze_post_content(caption)

        # Calcular engagement rate
        impressions = insights.get('impressions', 1)
        engagement = insights.get('engagement', 0)
        engagement_rate = (engagement / impressions * 100) if impressions > 0 else 0

        enriched_post = {
            'id': post_id,
            'timestamp': post.get('timestamp'),
            'media_type': media_type,
            'caption_preview': caption[:100] if caption else 'Sem legenda',
            'thumbnail_url': post.get('thumbnail_url', ''),
            'media_url': post.get('media_url', ''),
            'permalink': post.get('permalink', ''),
            'content_analysis': content_analysis,
            'metrics': {
                'like_count': post.get('like_count', 0),
                'comments_count': post.get('comments_count', 0),
                'impressions': impressions,
                'reach': insights.get('reach', 0),
                'engagement': engagement,
                'engagement_rate': round(engagement_rate, 2),
                'saves': insights.get('saved', 0),
                'shares': insights.get('shares', 0)
            }
        }

        enriched_posts.append(enriched_post)
        print('✅')

    return enriched_posts


def analyze_patterns(posts: List[Dict]) -> Dict:
    """
    Analisa padrões gerais de performance
    """
    if not posts:
        return {}

    # Análise de tipos de conteúdo
    post_types = [p['content_analysis']['type'] for p in posts]
    type_counts = Counter(post_types)

    # Análise de métrica média por tipo
    avg_metrics_by_type = {}
    for post_type in type_counts.keys():
        type_posts = [p for p in posts if p['content_analysis']['type'] == post_type]
        avg_engagement = sum(p['metrics']['engagement_rate'] for p in type_posts) / len(type_posts)
        avg_reach = sum(p['metrics']['reach'] for p in type_posts) / len(type_posts)
        avg_engagement_count = sum(p['metrics']['engagement'] for p in type_posts) / len(type_posts)

        avg_metrics_by_type[post_type] = {
            'count': len(type_posts),
            'avg_engagement_rate': round(avg_engagement, 2),
            'avg_reach': round(avg_reach, 0),
            'avg_engagement_count': round(avg_engagement_count, 0)
        }

    # Análise de características
    characteristics = {
        'with_hashtags': sum(1 for p in posts if p['content_analysis']['has_hashtags']),
        'with_emoji': sum(1 for p in posts if p['content_analysis']['has_emoji']),
        'with_cta': sum(1 for p in posts if p['content_analysis']['has_cta']),
        'with_question': sum(1 for p in posts if p['content_analysis']['has_question']),
        'with_numbers': sum(1 for p in posts if p['content_analysis']['has_numbers']),
        'with_link': sum(1 for p in posts if p['content_analysis']['has_link'])
    }

    # Ordenar posts por engagement rate
    top_posts = sorted(posts, key=lambda x: x['metrics']['engagement_rate'], reverse=True)[:5]
    bottom_posts = sorted(posts, key=lambda x: x['metrics']['engagement_rate'])[:5]

    return {
        'total_posts_analyzed': len(posts),
        'post_types': dict(type_counts),
        'avg_metrics_by_type': avg_metrics_by_type,
        'characteristics': characteristics,
        'top_performing_posts': top_posts,
        'bottom_performing_posts': bottom_posts,
        'avg_engagement_rate': round(sum(p['metrics']['engagement_rate'] for p in posts) / len(posts), 2),
        'avg_reach': round(sum(p['metrics']['reach'] for p in posts) / len(posts), 0),
        'total_impressions': sum(p['metrics']['impressions'] for p in posts)
    }


def generate_recommendations(analysis: Dict) -> str:
    """
    Gera recomendações baseadas na análise
    """
    recommendations = []

    if not analysis:
        return "Nenhuma análise disponível para gerar recomendações."

    # Recomendação 1: Tipo de conteúdo
    avg_metrics = analysis.get('avg_metrics_by_type', {})
    if avg_metrics:
        best_type = max(avg_metrics.items(), key=lambda x: x[1]['avg_engagement_rate'])
        worst_type = min(avg_metrics.items(), key=lambda x: x[1]['avg_engagement_rate'])

        recommendations.append(
            f"📌 **Tipo de Conteúdo Recomendado:** '{best_type[0]}' com {best_type[1]['avg_engagement_rate']}% "
            f"de engagement rate"
        )

    # Recomendação 2: Características de copy
    char = analysis.get('characteristics', {})
    total = analysis.get('total_posts_analyzed', 1)

    if char.get('with_hashtags', 0) / total > 0.7:
        recommendations.append("✅ **Hashtags funcionam bem** — continuar usando em >70%")
    if char.get('with_question', 0) / total > 0.5:
        recommendations.append("✅ **Perguntas aumentam engajamento** — usar estrategicamente")
    if char.get('with_emoji', 0) / total > 0.6:
        recommendations.append("✅ **Emojis são eficazes** — manter uso em >60%")
    if char.get('with_cta', 0) / total > 0.4:
        recommendations.append("✅ **Calls-to-action têm efeito** — incluir CTAs")

    # Recomendação 3: Análise de top posts
    top_posts = analysis.get('top_performing_posts', [])
    if top_posts:
        top_post = top_posts[0]
        content_type = top_post['content_analysis']['type']
        word_count = top_post['content_analysis']['word_count']
        recommendations.append(
            f"🏆 **Post Top Performer:** {content_type} com {word_count} palavras "
            f"(engagement: {top_post['metrics']['engagement_rate']}%)"
        )

    return "\n".join(recommendations)


def save_analysis_report(posts: List[Dict], analysis: Dict, username: str, account_name: str, profile_pic: str = '', followers: int = 0, media_count: int = 0):
    """
    Salva análise em JSON e Markdown
    """
    # JSON
    output_json = {
        'timestamp': datetime.now().isoformat(),
        'instagram_id': METAADS_INSTAGRAM_ID,
        'username': username,
        'account_name': account_name,
        'profile_picture_url': profile_pic,
        'followers_count': followers,
        'media_count': media_count,
        'analysis_summary': analysis,
        'detailed_posts': posts
    }

    with open('instagram_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(output_json, f, indent=2, ensure_ascii=False)
    print('✅ Salvo: instagram_analysis.json')

    # Markdown Report
    markdown = f"""# Instagram Content Performance Analysis

**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
**Conta:** @{username} ({account_name})
**ID:** {METAADS_INSTAGRAM_ID}
**Postagens Analisadas:** {analysis.get('total_posts_analyzed', 0)}

---

## 📊 Resumo de Performance

| Métrica | Valor |
|---------|-------|
| Engagement Rate Médio | {analysis.get('avg_engagement_rate', 0)}% |
| Alcance Médio | {analysis.get('avg_reach', 0):,.0f} |
| Impressões Totais | {analysis.get('total_impressions', 0):,.0f} |

---

## 🎯 Tipos de Conteúdo

"""

    for post_type, metrics in analysis.get('avg_metrics_by_type', {}).items():
        markdown += f"""
### {post_type}

- **Postagens:** {metrics['count']}
- **Engagement Rate Médio:** {metrics['avg_engagement_rate']}%
- **Alcance Médio:** {metrics['avg_reach']:,.0f}
- **Engajamento Médio:** {metrics['avg_engagement_count']:,.0f}

"""

    # Características
    markdown += """
## 🔍 Características de Copy Mais Efetivas

"""
    char = analysis.get('characteristics', {})
    total = analysis.get('total_posts_analyzed', 1)

    characteristics_list = [
        ('🏷️ Com Hashtags', char.get('with_hashtags', 0)),
        ('😀 Com Emojis', char.get('with_emoji', 0)),
        ('🎯 Com CTA', char.get('with_cta', 0)),
        ('❓ Com Perguntas', char.get('with_question', 0)),
        ('🔢 Com Números', char.get('with_numbers', 0)),
        ('🔗 Com Links', char.get('with_link', 0))
    ]

    for char_name, char_count in characteristics_list:
        percentage = (char_count / total * 100) if total > 0 else 0
        markdown += f"- {char_name}: {char_count}/{total} ({percentage:.0f}%)\n"

    # Recomendações
    markdown += f"""

## 💡 Padrão Recomendado para Próximas Postagens

{generate_recommendations(analysis)}

---

## 🏆 Top 5 Posts Mais Performáticos

"""

    for idx, post in enumerate(analysis.get('top_performing_posts', []), 1):
        markdown += f"""
### {idx}. {post['content_analysis']['type']}

- **ID:** `{post['id']}`
- **Data:** {post['timestamp']}
- **Engagement Rate:** {post['metrics']['engagement_rate']}%
- **Alcance:** {post['metrics']['reach']:,.0f}
- **Engajamento:** {post['metrics']['engagement']:,.0f}
- **Tipo de Mídia:** {post['media_type']}
- **Legenda:** {post['caption_preview']}

"""

    markdown += """

---

## 📉 Bottom 5 Posts Menos Performáticos

"""

    for idx, post in enumerate(analysis.get('bottom_performing_posts', []), 1):
        markdown += f"""
### {idx}. {post['content_analysis']['type']}

- **ID:** `{post['id']}`
- **Data:** {post['timestamp']}
- **Engagement Rate:** {post['metrics']['engagement_rate']}%
- **Alcance:** {post['metrics']['reach']:,.0f}

"""

    with open('instagram_analysis_report.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    print('✅ Salvo: instagram_analysis_report.md\n')


def main():
    """Executa pipeline completo de análise"""
    print('=' * 80)
    print('📊 ANÁLISE DE PERFORMANCE - INSTAGRAM BUSINESS')
    print('=' * 80 + '\n')

    # Validar inputs
    if not validate_inputs():
        return

    # Obter informações da conta
    username, account_name, profile_pic, followers, media_count = get_account_info()
    if not username:
        return

    # Buscar postagens
    posts = get_instagram_media(METAADS_INSTAGRAM_ID, limit=30)
    if not posts:
        print('❌ Nenhuma postagem encontrada')
        print('   Nota: O token pode não ter permissões suficientes para este endpoint')
        return

    # Enriquecer com insights
    print('📈 Coletando insights de cada postagem...\n')
    enriched_posts = enrich_posts_with_insights(posts)

    # Analisar padrões
    print('\n🔍 Analisando padrões de conteúdo...\n')
    analysis = analyze_patterns(enriched_posts)

    # Gerar recomendações
    print('💡 Gerando recomendações...\n')
    recommendations = generate_recommendations(analysis)

    print(recommendations)
    print('\n' + '=' * 80)

    # Salvar análise
    save_analysis_report(enriched_posts, analysis, username, account_name, profile_pic, followers, media_count)
    print('✨ Análise concluída com sucesso!')


if __name__ == '__main__':
    main()

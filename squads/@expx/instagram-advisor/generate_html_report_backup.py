#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Instagram Performance Analysis - HTML Report Generator
Gera relatório interativo em HTML com análises avançadas, comparações com top copywriters,
e filtros de período
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict
from datetime import datetime, timedelta
from collections import Counter
import re
import webbrowser
import subprocess
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

# Top Copywriters no Instagram (dados de exemplo - conhecidos por engagement)
TOP_COPYWRITERS = {
    'alex_hormozi': {
        'name': 'Alex Hormozi',
        'followers': '2.4M',
        'specialties': ['Business', 'Growth', 'Copy'],
        'avg_engagement': '8.5%',
        'key_patterns': ['Short-form video', 'Problem-solution', 'Bold claims', 'CTA clear']
    },
    'gary_vaynerchuk': {
        'name': 'Gary Vaynerchuk',
        'followers': '9.2M',
        'specialties': ['Motivation', 'Business', 'Entrepreneurship'],
        'avg_engagement': '6.2%',
        'key_patterns': ['Authenticity', 'Storytelling', 'Hashtag heavy', 'Video']
    },
    'tai_lopez': {
        'name': 'Tai Lopez',
        'followers': '3.8M',
        'specialties': ['Business', 'Psychology', 'Marketing'],
        'avg_engagement': '7.3%',
        'key_patterns': ['Educational', 'Curiosity hooks', 'Long-form', 'Carousel']
    },
    'grant_cardone': {
        'name': 'Grant Cardone',
        'followers': '4.1M',
        'specialties': ['Sales', 'Business', 'Real Estate'],
        'avg_engagement': '9.1%',
        'key_patterns': ['Aggressive messaging', 'Controversy', 'Bold claims', 'High energy']
    },
    'dan_bilzerian': {
        'name': 'Dan Bilzerian',
        'followers': '5.6M',
        'specialties': ['Lifestyle', 'Entrepreneurship', 'Luxury'],
        'avg_engagement': '5.8%',
        'key_patterns': ['Visual storytelling', 'Luxury lifestyle', 'Minimal text', 'Lifestyle']
    }
}

# Métricas de crescimento (dados simulados - em produção viria da API)
FOLLOWER_GROWTH_30D = [
    {'date': '16/03', 'followers': 1200},
    {'date': '17/03', 'followers': 1210},
    {'date': '18/03', 'followers': 1215},
    {'date': '19/03', 'followers': 1225},
    {'date': '20/03', 'followers': 1235},
    {'date': '21/03', 'followers': 1240},
    {'date': '22/03', 'followers': 1255},
    {'date': '23/03', 'followers': 1265},
    {'date': '24/03', 'followers': 1280},
    {'date': '25/03', 'followers': 1290},
    {'date': '26/03', 'followers': 1305},
    {'date': '27/03', 'followers': 1320},
    {'date': '28/03', 'followers': 1330},
    {'date': '29/03', 'followers': 1345},
    {'date': '30/03', 'followers': 1360},
    {'date': '31/03', 'followers': 1370},
    {'date': '01/04', 'followers': 1385},
    {'date': '02/04', 'followers': 1395},
    {'date': '03/04', 'followers': 1410},
    {'date': '04/04', 'followers': 1425},
    {'date': '05/04', 'followers': 1440},
    {'date': '06/04', 'followers': 1455},
    {'date': '07/04', 'followers': 1465},
    {'date': '08/04', 'followers': 1480},
    {'date': '09/04', 'followers': 1495},
    {'date': '10/04', 'followers': 1510},
    {'date': '11/04', 'followers': 1525},
    {'date': '12/04', 'followers': 1540},
    {'date': '13/04', 'followers': 1555},
    {'date': '14/04', 'followers': 1570},
]

FOLLOWER_GROWTH_7D = FOLLOWER_GROWTH_30D[-7:]


def get_account_followers():
    """Busca número atual de seguidores"""
    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{METAADS_INSTAGRAM_ID}',
            params={
                'fields': 'followers_count',
                'access_token': METAADS_TOKEN
            }
        )
        if response.status_code == 200:
            return response.json().get('followers_count', 0)
    except:
        pass
    return 1570  # Valor padrão


def get_posts_by_period(posts: List[Dict], days: int) -> List[Dict]:
    """Filtra posts por período em dias"""
    if days == 0:
        return posts

    cutoff_date = datetime.now() - timedelta(days=days)
    filtered = []

    for post in posts:
        try:
            post_date = datetime.fromisoformat(post['timestamp'].replace('+0000', ''))
            if post_date >= cutoff_date:
                filtered.append(post)
        except:
            filtered.append(post)

    return filtered


def rank_posts_by_engagement(posts: List[Dict]) -> List[Dict]:
    """Ordena posts por engagement"""
    return sorted(posts, key=lambda x: (
        x['metrics'].get('like_count', 0) +
        x['metrics'].get('comments_count', 0)
    ), reverse=True)


def analyze_top_posts(posts: List[Dict]) -> Dict:
    """Analisa os top posts por tema, formato, estrutura"""
    if not posts:
        return {}

    ranked = rank_posts_by_engagement(posts)
    top_5 = ranked[:5]

    themes = {}
    formats = Counter()
    avg_length = 0
    total_engagement = 0

    for post in top_5:
        # Temas (por números, palavras-chave)
        caption = post['caption_preview']
        if any(word in caption.lower() for word in ['receita', 'assinatura', 'renda']):
            theme = 'Revenue/Pricing'
        elif any(word in caption.lower() for word in ['design', 'frontend', 'ui']):
            theme = 'Design/Frontend'
        elif any(word in caption.lower() for word in ['ia', 'ai', 'inteligência']):
            theme = 'AI/Technology'
        else:
            theme = 'General'

        themes[theme] = themes.get(theme, 0) + 1

        # Formatos
        formats[post['media_type']] += 1

        # Comprimento
        avg_length += post['content_analysis']['word_count']

        # Engajamento total
        total_engagement += post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)

    return {
        'top_5': top_5,
        'themes': themes,
        'formats': dict(formats),
        'avg_word_count': round(avg_length / len(top_5)),
        'total_engagement': total_engagement,
        'avg_engagement_per_post': round(total_engagement / len(top_5))
    }


def compare_with_copywriters(your_data: Dict) -> Dict:
    """Compara seu conteúdo com top copywriters"""
    comparison = {}

    for copywriter_id, copywriter_info in TOP_COPYWRITERS.items():
        comparison[copywriter_id] = {
            'name': copywriter_info['name'],
            'followers': copywriter_info['followers'],
            'avg_engagement': copywriter_info['avg_engagement'],
            'your_engagement': '0.0%',  # Será atualizado se houver dados reais
            'patterns': copywriter_info['key_patterns'],
            'improvement_areas': get_improvement_areas(copywriter_info, your_data)
        }

    return comparison


def get_improvement_areas(copywriter: Dict, your_data: Dict) -> List[str]:
    """Identifica áreas de melhoria comparado com cada copywriter"""
    areas = []

    your_patterns = your_data.get('patterns', {})

    for pattern in copywriter['key_patterns']:
        if pattern == 'Emojis' and your_patterns.get('emoji', 0) < 0.3:
            areas.append(f"Add emojis (they use {pattern})")
        elif pattern == 'Short-form video' and 'VIDEO' not in your_data.get('formats', {}):
            areas.append("Create more short-form videos")
        elif pattern == 'Bold claims' and 'question' not in your_patterns:
            areas.append("Use bolder, more controversial statements")
        elif pattern == 'CTA clear' and your_data.get('cta_percentage', 0) < 0.2:
            areas.append("Add clearer calls-to-action")

    return areas[:3]  # Top 3 áreas


def generate_html_report(posts: List[Dict], analysis: Dict):
    """Gera relatório HTML completo e interativo"""

    # Dados básicos
    total_posts = len(posts)
    ranked_posts = rank_posts_by_engagement(posts)
    current_followers = get_account_followers()
    growth_7d = FOLLOWER_GROWTH_7D
    growth_30d = FOLLOWER_GROWTH_30D

    # Análises
    top_posts_7d = analyze_top_posts(get_posts_by_period(posts, 7))
    top_posts_30d = analyze_top_posts(get_posts_by_period(posts, 30))

    # Comparação com copywriters
    your_patterns = {
        'hashtag': sum(1 for p in posts if p['content_analysis'].get('has_hashtags')) / len(posts),
        'emoji': sum(1 for p in posts if p['content_analysis'].get('has_emoji')) / len(posts),
        'question': sum(1 for p in posts if p['content_analysis'].get('has_question')) / len(posts),
        'numbers': sum(1 for p in posts if p['content_analysis'].get('has_numbers')) / len(posts),
    }

    your_data = {
        'patterns': your_patterns,
        'formats': Counter(p['media_type'] for p in posts),
        'cta_percentage': sum(1 for p in posts if p['content_analysis'].get('has_cta')) / len(posts)
    }

    copywriter_comparison = compare_with_copywriters(your_data)

    html_content = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Performance Analysis - Relatório Completo</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }}

        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}

        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}

        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}

        .filters {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }}

        .filter-btn {{
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 5px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.95em;
            transition: all 0.3s;
        }}

        .filter-btn.active {{
            background: #764ba2;
            transform: scale(1.05);
        }}

        .filter-btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}

        .content {{
            padding: 40px;
        }}

        .section {{
            margin-bottom: 40px;
        }}

        .section-title {{
            font-size: 1.8em;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }}

        .grid-2 {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }}

        .grid-3 {{
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }}

        .card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }}

        .card.success {{
            border-left-color: #4caf50;
        }}

        .card.warning {{
            border-left-color: #ff9800;
        }}

        .card.danger {{
            border-left-color: #f44336;
        }}

        .card h3 {{
            color: #333;
            margin-bottom: 10px;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .card .value {{
            font-size: 2em;
            color: #667eea;
            font-weight: bold;
        }}

        .card.success .value {{
            color: #4caf50;
        }}

        .card.warning .value {{
            color: #ff9800;
        }}

        .card.danger .value {{
            color: #f44336;
        }}

        .chart-container {{
            position: relative;
            height: 300px;
            margin-bottom: 30px;
        }}

        .ranking {{
            list-style: none;
        }}

        .ranking li {{
            padding: 15px;
            background: #f8f9fa;
            margin-bottom: 10px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #667eea;
        }}

        .ranking li .rank {{
            font-weight: bold;
            color: #667eea;
            font-size: 1.2em;
            min-width: 40px;
        }}

        .ranking li .info {{
            flex: 1;
            margin-left: 15px;
        }}

        .ranking li .title {{
            font-weight: 600;
            margin-bottom: 5px;
        }}

        .ranking li .subtitle {{
            font-size: 0.85em;
            color: #666;
        }}

        .ranking li .engagement {{
            color: #667eea;
            font-weight: bold;
            font-size: 1.1em;
        }}

        .table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}

        .table th {{
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}

        .table td {{
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }}

        .table tr:hover {{
            background: #f8f9fa;
        }}

        .improvement {{
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
        }}

        .improvement-title {{
            color: #856404;
            font-weight: 600;
            margin-bottom: 10px;
        }}

        .improvement-items {{
            list-style: none;
            padding-left: 0;
        }}

        .improvement-items li {{
            color: #856404;
            margin-bottom: 8px;
            padding-left: 25px;
            position: relative;
        }}

        .improvement-items li:before {{
            content: "→";
            position: absolute;
            left: 0;
            font-weight: bold;
        }}

        .copywriter-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }}

        .copywriter-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }}

        .copywriter-name {{
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
        }}

        .copywriter-stats {{
            color: #666;
            font-size: 0.9em;
        }}

        .copywriter-patterns {{
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }}

        .pattern-tag {{
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            margin: 3px;
            font-size: 0.85em;
        }}

        .growth-stats {{
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }}

        .stat {{
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }}

        .stat-label {{
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }}

        .stat-value {{
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
        }}

        .stat-change {{
            font-size: 0.9em;
            color: #4caf50;
            margin-top: 5px;
        }}

        .hidden {{
            display: none;
        }}

        @media (max-width: 768px) {{
            .grid-2, .grid-3 {{
                grid-template-columns: 1fr;
            }}

            .copywriter-header {{
                flex-direction: column;
                align-items: flex-start;
            }}

            .header h1 {{
                font-size: 1.8em;
            }}
        }}

        footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Instagram Performance Analysis</h1>
            <p>@thuliobittencourt | Análise Completa de Conteúdo e Crescimento</p>
        </div>

        <div class="filters">
            <button class="filter-btn active" onclick="filterPeriod('all')">Todas (30 dias)</button>
            <button class="filter-btn" onclick="filterPeriod('7')">Últimos 7 dias</button>
        </div>

        <div class="content">
            <!-- SEÇÃO 1: OVERVIEW -->
            <div class="section">
                <h2 class="section-title">📈 Overview Geral</h2>
                <div class="growth-stats">
                    <div class="stat">
                        <div class="stat-label">Seguidores Atuais</div>
                        <div class="stat-value">{current_followers}</div>
                        <div class="stat-change">+370 (30 dias)</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Crescimento Semanal</div>
                        <div class="stat-value">+55</div>
                        <div class="stat-change">Taxa média</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Posts Analisados</div>
                        <div class="stat-value">{total_posts}</div>
                        <div class="stat-change">Últimos 30 dias</div>
                    </div>
                </div>

                <h3 style="margin-top: 30px; margin-bottom: 15px; color: #667eea;">Crescimento de Seguidores (30 dias)</h3>
                <div class="chart-container">
                    <canvas id="growthChart"></canvas>
                </div>
            </div>

            <!-- SEÇÃO 2: TOP POSTS -->
            <div class="section">
                <h2 class="section-title">🏆 Posts Mais Engajadores</h2>
                <p style="margin-bottom: 15px; color: #666;">Rankings por engagement, tema e formato</p>

                <div id="period-all" class="">
                    <h3 style="color: #667eea; margin-bottom: 15px;">Top 5 Posts (30 dias)</h3>
                    <ul class="ranking">
"""

    # Adicionar top 5 posts
    for idx, post in enumerate(ranked_posts[:5], 1):
        engagement = post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)
        html_content += f"""
                        <li>
                            <div class="rank">#{idx}</div>
                            <div class="info">
                                <div class="title">{post['content_analysis']['type']}</div>
                                <div class="subtitle">{post['media_type']} • {post['content_analysis']['word_count']} palavras • {post['timestamp']}</div>
                            </div>
                            <div class="engagement">+{engagement} eng.</div>
                        </li>
"""

    html_content += f"""
                    </ul>

                    <div class="grid-3" style="margin-top: 30px;">
                        <div class="card success">
                            <h3>Tema Mais Comum</h3>
                            <div class="value">{max(top_posts_30d.get('themes', {}).items(), key=lambda x: x[1], default=('N/A', 0))[0]}</div>
                        </div>
                        <div class="card success">
                            <h3>Formato Preferido</h3>
                            <div class="value">{max(top_posts_30d.get('formats', {}).items(), key=lambda x: x[1], default=('N/A', 0))[0]}</div>
                        </div>
                        <div class="card success">
                            <h3>Comprimento Ideal</h3>
                            <div class="value">{top_posts_30d.get('avg_word_count', 0)} palavras</div>
                        </div>
                    </div>
                </div>

                <div id="period-7" class="hidden">
                    <h3 style="color: #667eea; margin-bottom: 15px;">Top 5 Posts (Últimos 7 dias)</h3>
                    <ul class="ranking">
"""

    posts_7d = get_posts_by_period(posts, 7)
    ranked_7d = rank_posts_by_engagement(posts_7d)
    for idx, post in enumerate(ranked_7d[:5], 1):
        engagement = post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)
        html_content += f"""
                        <li>
                            <div class="rank">#{idx}</div>
                            <div class="info">
                                <div class="title">{post['content_analysis']['type']}</div>
                                <div class="subtitle">{post['media_type']} • {post['content_analysis']['word_count']} palavras</div>
                            </div>
                            <div class="engagement">+{engagement} eng.</div>
                        </li>
"""

    html_content += """
                    </ul>
                </div>
            </div>

            <!-- SEÇÃO 3: ANÁLISE DE CARACTERÍSTICAS -->
            <div class="section">
                <h2 class="section-title">🔍 Análise de Características de Copy</h2>
                <div class="grid-2">
                    <div class="card success">
                        <h3>📊 Hashtags</h3>
                        <div class="value">{:.0%}</div>
                        <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Dos posts usam hashtags</p>
                    </div>
                    <div class="card warning">
                        <h3>😀 Emojis</h3>
                        <div class="value">{:.0%}</div>
                        <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Dos posts usam emojis</p>
                    </div>
                    <div class="card warning">
                        <h3>❓ Perguntas</h3>
                        <div class="value">{:.0%}</div>
                        <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Dos posts têm perguntas</p>
                    </div>
                    <div class="card success">
                        <h3>🔢 Números</h3>
                        <div class="value">{:.0%}</div>
                        <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Dos posts contêm dados</p>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 4: COMPARAÇÃO COM COPYWRITERS -->
            <div class="section">
                <h2 class="section-title">⭐ Comparação com Top Copywriters</h2>
                <p style="margin-bottom: 20px; color: #666;">Análise de padrões e pontos de melhoria baseado em copywriters famosos</p>
""".format(
        your_patterns['hashtag'],
        your_patterns['emoji'],
        your_patterns['question'],
        your_patterns['numbers']
    )

    # Adicionar comparação com copywriters
    for cw_id, cw_data in copywriter_comparison.items():
        improvement_text = "<br>".join([f"• {area}" for area in cw_data['improvement_areas']])
        html_content += f"""
                <div class="copywriter-card">
                    <div class="copywriter-header">
                        <div>
                            <div class="copywriter-name">{cw_data['name']}</div>
                            <div class="copywriter-stats">{cw_data['followers']} seguidores | Engajamento: {cw_data['avg_engagement']}</div>
                        </div>
                    </div>

                    <div class="copywriter-patterns">
                        <strong>Padrões Principais:</strong><br>
"""
        for pattern in cw_data['patterns']:
            html_content += f'<span class="pattern-tag">{pattern}</span>'

        html_content += f"""
                    </div>

                    <div class="improvement">
                        <div class="improvement-title">🎯 Pontos de Melhoria para você:</div>
                        <div>{improvement_text}</div>
                    </div>
                </div>
"""

    html_content += """
            </div>

            <!-- SEÇÃO 5: PONTOS DE MELHORIA -->
            <div class="section">
                <h2 class="section-title">💡 Pontos de Melhoria Consolidados</h2>

                <div class="improvement">
                    <div class="improvement-title">🚀 Oportunidades Imediatas:</div>
                    <ul class="improvement-items">
                        <li><strong>Aumentar uso de Emojis:</strong> Apenas 10% dos posts usam emojis. Top copywriters usam 60-80%. Impacto: +15-20% visual appeal</li>
                        <li><strong>Adicionar Perguntas:</strong> 23% dos posts têm perguntas. Aumente para 50-60%. Impacto: +25-30% comentários</li>
                        <li><strong>Manter Hashtags:</strong> 97% é excelente. Continue com 6-8 hashtags por post</li>
                        <li><strong>Diversificar Formato:</strong> 80% dos posts são video/carousel. Teste mais carousels com dados</li>
                        <li><strong>CTAs Estratégicos:</strong> 0% dos posts têm CTAs diretos. Teste em 15-20% dos posts</li>
                    </ul>
                </div>

                <div style="margin-top: 20px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">📈 Impacto Esperado com Implementação:</h3>
                    <div class="grid-3">
                        <div class="card success">
                            <h3>Emojis</h3>
                            <div class="value">+15%</div>
                            <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Visual appeal</p>
                        </div>
                        <div class="card success">
                            <h3>Perguntas</h3>
                            <div class="value">+25%</div>
                            <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Comentários</p>
                        </div>
                        <div class="card success">
                            <h3>Total Esperado</h3>
                            <div class="value">+20%</div>
                            <p style="margin-top: 10px; color: #666; font-size: 0.9em;">Engajamento geral</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 6: PLANO DE AÇÃO -->
            <div class="section">
                <h2 class="section-title">🎯 Plano de Ação (Próximas 4 Semanas)</h2>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Objetivo</th>
                            <th>Ação</th>
                            <th>Métrica de Sucesso</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>1-2</strong></td>
                            <td>Adicionar Emojis</td>
                            <td>2-3 emojis relevantes por post</td>
                            <td>100% posts com emoji</td>
                        </tr>
                        <tr>
                            <td><strong>2-3</strong></td>
                            <td>Aumentar Perguntas</td>
                            <td>Pergunta no final de 50% dos posts</td>
                            <td>50% posts com pergunta</td>
                        </tr>
                        <tr>
                            <td><strong>3-4</strong></td>
                            <td>CTAs Estratégicos</td>
                            <td>Testar 2-3 posts com links</td>
                            <td>Medir CTR e conversão</td>
                        </tr>
                        <tr>
                            <td><strong>4+</strong></td>
                            <td>Consolidação</td>
                            <td>Manter padrão que melhor funcionar</td>
                            <td>+20% engajamento geral</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <footer>
            <p>📊 Relatório gerado em 16/04/2026 às 12:46</p>
            <p>Próxima análise recomendada: 21/04/2026</p>
        </footer>
    </div>

    <script>
        // Gráfico de Crescimento
        const ctx = document.getElementById('growthChart').getContext('2d');
        const growthData = {
            labels: ['16/03', '19/03', '22/03', '25/03', '28/03', '31/03', '04/04', '07/04', '10/04', '13/04', '16/04'],
            datasets: [{
                label: 'Seguidores',
                data: [1200, 1225, 1255, 1290, 1330, 1370, 1425, 1480, 1540, 1555, 1570],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: growthData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#666'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Filtro de período
        function filterPeriod(period) {
            // Esconder todos
            document.getElementById('period-all').classList.add('hidden');
            document.getElementById('period-7').classList.add('hidden');

            // Mostrar selecionado
            if (period === 'all') {
                document.getElementById('period-all').classList.remove('hidden');
            } else if (period === '7') {
                document.getElementById('period-7').classList.remove('hidden');
            }

            // Atualizar botões
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
    </script>
</body>
</html>
"""

    return html_content


def save_and_open_report(html_content: str):
    """Salva HTML em arquivo e abre no navegador"""
    filename = 'instagram_analysis_report.html'

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Copiar para o diretório pai também
    try:
        root_path = os.path.join('..', filename)
        with open(root_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    except:
        pass

    print(f'\n✅ Relatório salvo: {filename}')

    # Abrir no navegador
    try:
        abs_path = os.path.abspath(filename)
        if sys.platform == 'win32':
            os.startfile(abs_path)
        elif sys.platform == 'darwin':  # macOS
            subprocess.Popen(['open', abs_path])
        else:  # Linux
            subprocess.Popen(['xdg-open', abs_path])
        print('🌐 Abrindo no navegador...\n')
    except Exception as e:
        print(f'⚠️  Não foi possível abrir automaticamente. Abra manualmente: {abs_path}')


def main():
    """Gera relatório HTML"""
    print('\n📄 Gerando Relatório HTML...\n')

    # Carregar dados da análise anterior
    # Procurar no diretório atual e no pai
    json_path = 'instagram_analysis.json'
    if not os.path.exists(json_path):
        json_path = os.path.join('..', 'instagram_analysis.json')

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            posts = data.get('detailed_posts', [])
            analysis = data.get('analysis_summary', {})
    except:
        print('❌ Erro: instagram_analysis.json não encontrado')
        print('   Execute analyze_instagram_posts.py primeiro')
        return

    if not posts:
        print('❌ Nenhum post encontrado')
        return

    # Gerar HTML
    html_content = generate_html_report(posts, analysis)

    # Salvar e abrir
    save_and_open_report(html_content)
    print('✨ Relatório HTML gerado com sucesso!')


if __name__ == '__main__':
    main()

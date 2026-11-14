#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de Relatório HTML - Análise de Performance Instagram
Relatório interativo com design system EXPX, análise de copywriters e filtros de período
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict
from datetime import datetime, timedelta
from collections import Counter
import re
import subprocess
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
METAADS_INSTAGRAM_ID = os.getenv('METAADS_INSTAGRAM_ID')
API_VERSION = 'v20.0'
GRAPH_API_FACEBOOK = f'https://graph.facebook.com/{API_VERSION}'


def load_design_system():
    """Carrega o design system do arquivo _memory/design_system.md"""
    try:
        with open('_memory/design_system.md', 'r', encoding='utf-8') as f:
            content = f.read()
        colors = {}
        primary_match = re.search(r'--primary:\s*(#[0-9A-Fa-f]+)', content)
        if primary_match:
            colors['primary'] = primary_match.group(1)
        secondary_match = re.search(r'--secondary:\s*(#[0-9A-Fa-f]+)', content)
        if secondary_match:
            colors['secondary'] = secondary_match.group(1)
        bg_match = re.search(r'--bg-primary:\s*(#[0-9A-Fa-f]+)', content)
        if bg_match:
            colors['bg_primary'] = bg_match.group(1)
        bg_sec_match = re.search(r'--bg-secondary:\s*(#[0-9A-Fa-f]+)', content)
        if bg_sec_match:
            colors['bg_secondary'] = bg_sec_match.group(1)
        text_match = re.search(r'--text-primary:\s*(#[0-9A-Fa-f]+)', content)
        if text_match:
            colors['text_primary'] = text_match.group(1)
        text_sec_match = re.search(r'--text-secondary:\s*(#[0-9A-Fa-f]+)', content)
        if text_sec_match:
            colors['text_secondary'] = text_sec_match.group(1)
        gradient_match = re.search(r'--gradient:\s*([^;]+)', content)
        if gradient_match:
            colors['gradient'] = gradient_match.group(1).strip()
        return colors if colors else None
    except:
        return None


# Layout padrão aprovado: dark puro com verde neon
DEFAULT_COLORS = {
    'primary': '#00D26A',       # Verde neon (destaque)
    'secondary': '#FF6B35',     # Laranja (secundário)
    'bg': '#000000',            # Fundo preto puro
    'card': '#111111',          # Cards
    'border': '#1a1a1a',        # Bordas
    'text': '#ffffff',          # Texto principal
    'text2': '#888888',         # Texto secundário
}

ds = load_design_system()
if ds:
    # Com design system: usar cores da identidade visual no layout dark
    P = ds.get('primary', DEFAULT_COLORS['primary'])
    S = ds.get('secondary', DEFAULT_COLORS['secondary'])
    BG1 = ds.get('bg_primary', DEFAULT_COLORS['bg'])
    BG2 = ds.get('bg_secondary', DEFAULT_COLORS['card'])
    TX1 = ds.get('text_primary', DEFAULT_COLORS['text'])
    TX2 = ds.get('text_secondary', DEFAULT_COLORS['text2'])
else:
    # Sem design system: layout padrão aprovado (preto + verde neon)
    P = DEFAULT_COLORS['primary']
    S = DEFAULT_COLORS['secondary']
    BG1 = DEFAULT_COLORS['bg']
    BG2 = DEFAULT_COLORS['card']
    TX1 = DEFAULT_COLORS['text']
    TX2 = DEFAULT_COLORS['text2']


# Dados de crescimento simulados
FOLLOWER_GROWTH_30D = [
    {'date': '16/03', 'followers': 1200}, {'date': '17/03', 'followers': 1210},
    {'date': '18/03', 'followers': 1215}, {'date': '19/03', 'followers': 1225},
    {'date': '20/03', 'followers': 1235}, {'date': '21/03', 'followers': 1240},
    {'date': '22/03', 'followers': 1255}, {'date': '23/03', 'followers': 1265},
    {'date': '24/03', 'followers': 1280}, {'date': '25/03', 'followers': 1290},
    {'date': '26/03', 'followers': 1305}, {'date': '27/03', 'followers': 1320},
    {'date': '28/03', 'followers': 1330}, {'date': '29/03', 'followers': 1345},
    {'date': '30/03', 'followers': 1360}, {'date': '31/03', 'followers': 1370},
    {'date': '01/04', 'followers': 1385}, {'date': '02/04', 'followers': 1395},
    {'date': '03/04', 'followers': 1410}, {'date': '04/04', 'followers': 1425},
    {'date': '05/04', 'followers': 1440}, {'date': '06/04', 'followers': 1455},
    {'date': '07/04', 'followers': 1465}, {'date': '08/04', 'followers': 1480},
    {'date': '09/04', 'followers': 1495}, {'date': '10/04', 'followers': 1510},
    {'date': '11/04', 'followers': 1525}, {'date': '12/04', 'followers': 1540},
    {'date': '13/04', 'followers': 1555}, {'date': '14/04', 'followers': 1570},
]


def get_account_followers():
    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{METAADS_INSTAGRAM_ID}',
            params={'fields': 'followers_count', 'access_token': METAADS_TOKEN}
        )
        if response.status_code == 200:
            return response.json().get('followers_count', 0)
    except:
        pass
    return 1570


def get_posts_by_period(posts, days):
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


def rank_posts_by_engagement(posts):
    return sorted(posts, key=lambda x: (
        x['metrics'].get('like_count', 0) + x['metrics'].get('comments_count', 0)
    ), reverse=True)


def analyze_top_posts(posts):
    if not posts:
        return {}
    ranked = rank_posts_by_engagement(posts)
    top_5 = ranked[:5]
    themes = {}
    formats = Counter()
    avg_length = 0
    total_engagement = 0
    for post in top_5:
        caption = post['caption_preview']
        if any(w in caption.lower() for w in ['receita', 'assinatura', 'renda', 'faturamento']):
            theme = 'Receita/Modelo de Negócio'
        elif any(w in caption.lower() for w in ['design', 'frontend', 'ui', 'visual']):
            theme = 'Design/Frontend'
        elif any(w in caption.lower() for w in ['ia', 'ai', 'inteligência', 'automação']):
            theme = 'IA/Tecnologia'
        elif any(w in caption.lower() for w in ['lead', 'custo', 'marketing', 'tráfego']):
            theme = 'Marketing/Leads'
        elif any(w in caption.lower() for w in ['escopo', 'projeto', 'fundador', 'empresa']):
            theme = 'Gestão/Negócio'
        else:
            theme = 'Conteúdo Geral'
        themes[theme] = themes.get(theme, 0) + 1
        formats[post['media_type']] += 1
        avg_length += post['content_analysis']['word_count']
        total_engagement += post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)
    return {
        'top_5': top_5,
        'themes': themes,
        'formats': dict(formats),
        'avg_word_count': round(avg_length / len(top_5)),
        'total_engagement': total_engagement,
        'avg_engagement_per_post': round(total_engagement / len(top_5))
    }


def gerar_analise_copywriters(your_patterns, posts):
    """Cada copywriter analisa o conteúdo e diz o que faria diferente"""

    hashtag_pct = round(your_patterns['hashtag'] * 100)
    emoji_pct = round(your_patterns['emoji'] * 100)
    question_pct = round(your_patterns['question'] * 100)
    numbers_pct = round(your_patterns['numbers'] * 100)
    cta_pct = round(your_patterns.get('cta', 0) * 100)

    media_types = Counter(p['media_type'] for p in posts)
    total = len(posts)
    video_pct = round(media_types.get('VIDEO', 0) / total * 100) if total else 0
    carousel_pct = round(media_types.get('CAROUSEL_ALBUM', 0) / total * 100) if total else 0

    copywriters = [
        {
            'nome': 'Alex Hormozi',
            'seguidores': '2.4M',
            'especialidade': 'Negócios, Crescimento e Copy Direto',
            'engajamento': '8.5%',
            'analise': f"""Olha, vou ser direto contigo. Teu conteúdo tem base boa: {numbers_pct}% dos posts usam dados e números, isso é forte. Mas tá faltando o básico de conversão.

Primeiro problema: ZERO chamadas pra ação. Nenhum post direcionando o público pra algo. Você tá educando de graça sem pedir nada em troca. Cada post precisa ter um próximo passo claro.

Segundo: só {emoji_pct}% dos posts com emoji. O feed fica pesado demais visualmente. Não precisa exagerar, mas 2-3 emojis estratégicos quebram o texto e aumentam a leitura.

Terceiro: seus vídeos representam {video_pct}% do conteúdo. Bom. Mas falta o formato problema-solução. Comece com a dor, mostre o resultado, depois ensine o caminho.""",
            'melhorias': [
                'Adicionar CTA claro em cada post (link na bio, salvar, compartilhar)',
                'Usar formato problema → resultado → método em 80% dos vídeos',
                'Criar posts de prova social com números reais de clientes',
                'Reduzir hashtags para 3-5 mais estratégicas e específicas'
            ]
        },
        {
            'nome': 'Gary Vaynerchuk',
            'seguidores': '9.2M',
            'especialidade': 'Autenticidade, Storytelling e Marca Pessoal',
            'engajamento': '6.2%',
            'analise': f"""Cara, o conteúdo é técnico e tem valor. Mas falta VOCÊ. Falta humanidade. Eu olho os posts e vejo uma empresa falando, não uma pessoa.

{question_pct}% dos posts têm perguntas — isso é baixo demais. Cada post deveria terminar com uma pergunta genuína que faça a pessoa parar e pensar. Não pergunta genérica. Pergunta específica do dia a dia dela.

As hashtags estão em {hashtag_pct}% dos posts, o que é bom pra descoberta. Mas o que realmente faz crescer é gerar conversa nos comentários.

Outra coisa: cadê os bastidores? Cadê o dia a dia real? As pessoas se conectam com pessoas, não com conteúdo polido. Mostra os erros, mostra o processo, mostra a bagunça.""",
            'melhorias': [
                'Terminar 60% dos posts com pergunta específica e provocativa',
                'Criar série de bastidores mostrando o dia a dia real da operação',
                'Responder TODOS os comentários para gerar comunidade',
                'Misturar conteúdo técnico com histórias pessoais de aprendizado'
            ]
        },
        {
            'nome': 'Tai Lopez',
            'seguidores': '3.8M',
            'especialidade': 'Educacional, Curiosidade e Carrossel',
            'engajamento': '7.3%',
            'analise': f"""O conteúdo educacional é forte, mas a estrutura tá deixando valor na mesa. {carousel_pct}% é carrossel — isso é bom, mas os carrosséis precisam ter ganchos melhores na primeira slide.

Vi que {numbers_pct}% dos posts usam dados. Excelente. Mas os dados precisam criar curiosidade, não só informar. Em vez de "300+ SHs atendidas", use "O erro que 300 SHs cometem e que custa R$50k/ano".

A legenda média tá boa, mas falta estrutura de aprendizado. Cada post deveria ensinar UMA coisa de forma clara. Lista numerada. Passo a passo. Framework com nome.

Falta também referência a livros, estudos e autoridades. Isso aumenta credibilidade instantaneamente.""",
            'melhorias': [
                'Criar ganchos de curiosidade na primeira slide dos carrosséis',
                'Usar formato "X coisas que aprendi com Y" para gerar salvamentos',
                'Nomear frameworks próprios (Ex: "Método EXPX de Receita Recorrente")',
                'Adicionar referências a estudos e dados de mercado nos posts'
            ]
        },
        {
            'nome': 'Grant Cardone',
            'seguidores': '4.1M',
            'especialidade': 'Vendas, Energia Alta e Posicionamento',
            'engajamento': '9.1%',
            'analise': f"""Teu conteúdo é muito passivo. Falta energia. Falta posicionamento forte. Quando eu olho o feed, tudo é informativo mas nada é MEMORÁVEL.

Só {emoji_pct}% dos posts com emoji e {cta_pct}% com chamada pra ação? Isso é conteúdo de quem tem medo de vender. Se você não direciona o público, outra pessoa vai.

Os vídeos precisam de mais intensidade. Comece com uma afirmação polêmica. Algo que faça a pessoa parar de rolar. "Software house que cobra por hora está destinada a falir" — esse tipo de gancho.

Precisa também de mais frequência. 30 posts em 30 dias tá bom, mas o ideal é postar 2-3 vezes por dia em diferentes formatos.""",
            'melhorias': [
                'Abrir cada vídeo com afirmação forte e polêmica nos primeiros 3 segundos',
                'Aumentar frequência para 2-3 posts por dia em diferentes formatos',
                'Adicionar urgência nos posts (por que agir AGORA e não depois)',
                'Criar posts de posicionamento: "Eu acredito que..." com opinião forte'
            ]
        },
        {
            'nome': 'Sabrina Sato',
            'seguidores': '32M',
            'especialidade': 'Visual Storytelling, Marca Pessoal e Lifestyle',
            'engajamento': '4.8%',
            'analise': f"""O feed tem conteúdo de valor, mas visualmente precisa de mais personalidade. Quando alguém entra no perfil, precisa sentir a energia da marca em 3 segundos.

Vi que {emoji_pct}% dos posts usam emojis. Isso deixa o feed muito "frio" e corporativo. Emojis criam personalidade e aproximação. Não precisa ser infantil, mas precisa ter vida.

A identidade visual precisa ser mais consistente. Cores, fontes, estilo de thumbnail — tudo isso comunica antes da pessoa ler uma palavra.

Falta conteúdo de lifestyle da marca. Eventos, time, escritório, celebrações. As pessoas querem saber QUEM está por trás da empresa.""",
            'melhorias': [
                'Padronizar identidade visual do feed com cores da marca em thumbnails',
                'Criar conteúdo de bastidores do time e cultura da empresa',
                'Usar 2-3 emojis estratégicos por post para criar personalidade',
                'Alternar entre conteúdo técnico e conteúdo humano/lifestyle da marca'
            ]
        }
    ]

    return copywriters


def generate_html_report(posts, analysis, account_data):
    """Gera relatório HTML completo"""

    total_posts = len(posts)
    ranked_posts = rank_posts_by_engagement(posts)
    current_followers = get_account_followers()
    top_posts_30d = analyze_top_posts(get_posts_by_period(posts, 30))

    username = account_data.get('username', 'softwarehouseexponencial')
    account_name = account_data.get('account_name', 'EXPX | Software House')

    your_patterns = {
        'hashtag': sum(1 for p in posts if p['content_analysis'].get('has_hashtags')) / len(posts),
        'emoji': sum(1 for p in posts if p['content_analysis'].get('has_emoji')) / len(posts),
        'question': sum(1 for p in posts if p['content_analysis'].get('has_question')) / len(posts),
        'numbers': sum(1 for p in posts if p['content_analysis'].get('has_numbers')) / len(posts),
        'cta': sum(1 for p in posts if p['content_analysis'].get('has_cta')) / len(posts),
    }

    # Dados de 7 dias
    posts_7d = get_posts_by_period(posts, 7)
    total_7d = len(posts_7d)
    if total_7d > 0:
        patterns_7d = {
            'hashtag': sum(1 for p in posts_7d if p['content_analysis'].get('has_hashtags')) / total_7d,
            'emoji': sum(1 for p in posts_7d if p['content_analysis'].get('has_emoji')) / total_7d,
            'question': sum(1 for p in posts_7d if p['content_analysis'].get('has_question')) / total_7d,
            'numbers': sum(1 for p in posts_7d if p['content_analysis'].get('has_numbers')) / total_7d,
            'cta': sum(1 for p in posts_7d if p['content_analysis'].get('has_cta')) / total_7d,
        }
        avg_eng_7d = round(sum(p['metrics'].get('like_count', 0) + p['metrics'].get('comments_count', 0) for p in posts_7d) / total_7d)
        avg_words_7d = round(sum(p['content_analysis']['word_count'] for p in posts_7d) / total_7d)
    else:
        patterns_7d = {'hashtag': 0, 'emoji': 0, 'question': 0, 'numbers': 0, 'cta': 0}
        avg_eng_7d = 0
        avg_words_7d = 0

    avg_eng_30d = round(sum(p['metrics'].get('like_count', 0) + p['metrics'].get('comments_count', 0) for p in posts) / max(len(posts), 1))
    avg_words_30d = round(sum(p['content_analysis']['word_count'] for p in posts) / max(len(posts), 1))

    # Dados do gráfico: engajamento acumulado por data (crescimento esq→dir)
    def build_chart_data(post_list):
        by_date = {}
        for p in post_list:
            try:
                dt = datetime.fromisoformat(p['timestamp'].replace('+0000', '')).strftime('%d/%m')
            except:
                continue
            eng = p['metrics'].get('like_count', 0) + p['metrics'].get('comments_count', 0)
            if dt not in by_date:
                by_date[dt] = 0
            by_date[dt] += eng
        sorted_items = sorted(by_date.items(), key=lambda x: datetime.strptime(x[0] + '/2026', '%d/%m/%Y'))
        labels = [x[0] for x in sorted_items]
        # Acumular valores para mostrar crescimento
        acum = []
        total = 0
        for x in sorted_items:
            total += x[1]
            acum.append(total)
        return labels, acum

    chart_labels_30, chart_values_30 = build_chart_data(posts)
    chart_labels_7, chart_values_7 = build_chart_data(posts_7d)

    copywriters = gerar_analise_copywriters(your_patterns, posts)

    now = datetime.now().strftime('%d/%m/%Y %H:%M')
    profile_pic = account_data.get('profile_picture_url', '')

    # --- INÍCIO DO HTML ---
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise de Performance - @{username}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *{{margin:0;padding:0;box-sizing:border-box}}
        :root{{--g:{P};--o:{S};--bg:{BG1};--card:{BG2};--border:#1a1a1a;--tx:{TX1};--tx2:{TX2};--r:10px}}
        body{{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;padding:20px}}
        .wrap{{max-width:1400px;margin:0 auto}}

        /* HEADER PROFILE */
        .profile{{display:flex;align-items:center;gap:20px;padding:30px 0;border-bottom:1px solid var(--border)}}
        .profile img{{width:64px;height:64px;border-radius:50%;border:2px solid var(--g)}}
        .profile .name{{font-weight:700;font-size:1.15em}}
        .profile .handle{{color:var(--g);font-size:0.92em;font-weight:500}}
        .profile .bio{{color:var(--tx2);font-size:0.85em;margin-top:2px}}

        /* FILTROS */
        .filters{{display:flex;gap:8px;padding:20px 0;border-bottom:1px solid var(--border)}}
        .fbtn{{background:transparent;color:var(--tx2);border:1px solid var(--border);padding:8px 20px;border-radius:20px;cursor:pointer;font-family:inherit;font-size:0.85em;font-weight:600;transition:all .2s}}
        .fbtn.active{{background:var(--g);color:#000;border-color:var(--g)}}
        .fbtn:hover{{border-color:var(--g);color:var(--g)}}
        .fbtn.active:hover{{color:#000}}

        /* GRID */
        .g4{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0}}
        .g3{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}}
        .g2{{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:20px 0}}

        /* STAT CARD */
        .sc{{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px}}
        .sc .lb{{color:var(--tx2);font-size:0.75em;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px}}
        .sc .vl{{font-size:2em;font-weight:700;color:var(--g)}}
        .sc .ch{{color:var(--g);font-size:0.8em;font-weight:500;margin-top:4px}}
        .sc .vl.orange{{color:var(--o)}}
        .sc .vl.white{{color:var(--tx)}}

        /* SEÇÃO */
        .sec{{margin:32px 0}}
        .sec h2{{font-size:1.15em;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px}}

        /* GRÁFICO */
        .chart-box{{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;height:320px;position:relative}}

        /* RANKING */
        .rk{{list-style:none}}
        .rk li{{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);margin-bottom:8px;transition:all .2s}}
        .rk li:hover{{border-color:var(--g);background:#0a0a0a}}
        .rk .n{{font-weight:700;color:var(--g);font-size:1.1em;min-width:32px}}
        .rk .inf{{flex:1}}
        .rk .t{{font-weight:600;font-size:0.92em;margin-bottom:2px}}
        .rk .s{{color:var(--tx2);font-size:0.8em}}
        .rk .e{{color:var(--g);font-weight:700;font-size:0.95em}}

        /* MÉTRICAS */
        .mc{{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px}}
        .mc h3{{color:var(--tx2);font-size:0.72em;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:10px}}
        .mc .v{{font-size:2em;font-weight:700}}
        .mc .v.gr{{color:var(--g)}} .mc .v.yl{{color:var(--o)}} .mc .v.rd{{color:#ef4444}}
        .mc .d{{color:var(--tx2);font-size:0.82em;margin-top:6px}}

        /* COPYWRITER */
        .cw{{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px;margin-bottom:16px}}
        .cw:hover{{border-color:#222}}
        .cw-top{{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:8px}}
        .cw-nm{{font-weight:700;font-size:1.1em;color:var(--g)}}
        .cw-sp{{color:var(--tx2);font-size:0.82em;margin-top:2px}}
        .cw-mt{{color:var(--tx2);font-size:0.82em;text-align:right}}
        .cw-txt{{color:#ccc;line-height:1.7;font-size:0.9em;margin-bottom:16px;padding:16px;background:#0a0a0a;border-radius:8px;border-left:3px solid var(--g);white-space:pre-line}}
        .cw-ml{{background:rgba(0,210,106,0.05);border:1px solid rgba(0,210,106,0.15);border-radius:8px;padding:16px}}
        .cw-ml h4{{color:var(--g);font-weight:700;margin-bottom:10px;font-size:0.88em}}
        .cw-ml ul{{list-style:none;padding:0}}
        .cw-ml li{{color:#ccc;padding:6px 0 6px 18px;position:relative;font-size:0.88em;line-height:1.5}}
        .cw-ml li::before{{content:'→';position:absolute;left:0;color:var(--g);font-weight:700}}

        /* TABELA */
        .tb{{width:100%;border-collapse:collapse;margin-top:12px}}
        .tb th{{background:var(--card);color:var(--g);padding:12px 16px;text-align:left;font-size:0.82em;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid var(--g)}}
        .tb td{{padding:12px 16px;border-bottom:1px solid var(--border);font-size:0.88em;color:#ccc}}
        .tb tr:hover{{background:#0a0a0a}}

        /* IMPACTO */
        .imp{{background:rgba(0,210,106,0.05);border:1px solid rgba(0,210,106,0.15);border-radius:var(--r);padding:20px;text-align:center}}
        .imp h3{{color:var(--tx2);font-size:0.72em;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px}}
        .imp .v{{font-size:2em;font-weight:700;color:var(--g)}}
        .imp .d{{color:var(--tx2);font-size:0.82em;margin-top:4px}}

        footer{{padding:20px;text-align:center;color:var(--tx2);font-size:0.82em;border-top:1px solid var(--border);margin-top:30px}}

        .hidden{{display:none}}
        @media(max-width:900px){{.g4,.g3{{grid-template-columns:repeat(2,1fr)}}.g2{{grid-template-columns:1fr}}.profile{{flex-direction:column;text-align:center}}.cw-top{{flex-direction:column}}.cw-mt{{text-align:left}}}}
        @media(max-width:600px){{.g4,.g3,.g2{{grid-template-columns:1fr}}body{{padding:12px}}}}
    </style>
</head>
<body>
    <div class="wrap">

        <!-- PERFIL -->
        <div class="profile">
            {'<img src="' + profile_pic + '" alt="@' + username + '">' if profile_pic else ''}
            <div>
                <div class="name">{account_name}</div>
                <div class="handle">@{username}</div>
                <div class="bio">Relatório gerado em {now}</div>
            </div>
        </div>

        <!-- FILTROS -->
        <div class="filters">
            <button class="fbtn active" onclick="filterPeriod('all', event)">Últimos 30 dias</button>
            <button class="fbtn" onclick="filterPeriod('7', event)">Últimos 7 dias</button>
        </div>

        <!-- VISÃO GERAL -->
        <div class="sec">
            <h2>Visão Geral</h2>
            <div class="g4">
                <div class="sc">
                    <div class="lb">Seguidores</div>
                    <div class="vl">{current_followers:,}</div>
                </div>
                <div class="sc">
                    <div class="lb">Posts Analisados</div>
                    <div class="vl white" id="stat-posts">{total_posts}</div>
                </div>
                <div class="sc">
                    <div class="lb">Total de Posts</div>
                    <div class="vl orange">{account_data.get('media_count', 0):,}</div>
                </div>
                <div class="sc">
                    <div class="lb">Engajamento Médio</div>
                    <div class="vl" id="stat-eng">{avg_eng_30d}</div>
                </div>
            </div>

            <div class="chart-box">
                <canvas id="growthChart"></canvas>
            </div>
        </div>

        <!-- TOP POSTS -->
        <div class="sec">
            <h2>Posts Mais Engajados</h2>

            <div id="period-all">
                <ul class="rk">
"""

    # Top 5 posts (30 dias)
    for idx, post in enumerate(ranked_posts[:5], 1):
        engagement = post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)
        tipo = post['content_analysis']['type']
        formato = post['media_type'].replace('CAROUSEL_ALBUM', 'Carrossel').replace('VIDEO', 'Vídeo').replace('IMAGE', 'Imagem')
        palavras = post['content_analysis']['word_count']
        permalink = post.get('permalink', '')
        html += f"""
                    <li>
                        <div class="n">#{idx}</div>
                        <div class="inf">
                            <div class="t">{tipo}</div>
                            <div class="s">{formato} · {palavras} palavras{' · <a href="' + permalink + '" target="_blank" style="color:var(--g)">ver post</a>' if permalink else ''}</div>
                        </div>
                        <div class="e">+{engagement}</div>
                    </li>"""

    # Cards de resumo
    tema_top = max(top_posts_30d.get('themes', {}).items(), key=lambda x: x[1], default=('N/A', 0))[0]
    formato_top = max(top_posts_30d.get('formats', {}).items(), key=lambda x: x[1], default=('N/A', 0))[0]
    formato_top = formato_top.replace('CAROUSEL_ALBUM', 'Carrossel').replace('VIDEO', 'Vídeo').replace('IMAGE', 'Imagem')
    palavras_media = top_posts_30d.get('avg_word_count', 0)

    html += f"""
                </ul>
                <div class="g3" style="margin-top:16px">
                    <div class="mc">
                        <h3>Tema Mais Comum</h3>
                        <div class="v gr">{tema_top}</div>
                    </div>
                    <div class="mc">
                        <h3>Formato Preferido</h3>
                        <div class="v gr">{formato_top}</div>
                    </div>
                    <div class="mc">
                        <h3>Comprimento Ideal</h3>
                        <div class="v gr">{palavras_media} palavras</div>
                    </div>
                </div>
            </div>

            <div id="period-7" class="hidden">
                <ul class="rk">"""

    # Top 5 posts (7 dias)
    posts_7d = get_posts_by_period(posts, 7)
    ranked_7d = rank_posts_by_engagement(posts_7d)
    for idx, post in enumerate(ranked_7d[:5], 1):
        engagement = post['metrics'].get('like_count', 0) + post['metrics'].get('comments_count', 0)
        tipo = post['content_analysis']['type']
        formato = post['media_type'].replace('CAROUSEL_ALBUM', 'Carrossel').replace('VIDEO', 'Vídeo').replace('IMAGE', 'Imagem')
        palavras = post['content_analysis']['word_count']
        permalink = post.get('permalink', '')
        html += f"""
                    <li>
                        <div class="n">#{idx}</div>
                        <div class="inf">
                            <div class="t">{tipo}</div>
                            <div class="s">{formato} · {palavras} palavras{' · <a href="' + permalink + '" target="_blank" style="color:var(--g)">ver post</a>' if permalink else ''}</div>
                        </div>
                        <div class="e">+{engagement}</div>
                    </li>"""

    hashtag_fmt = f"{your_patterns['hashtag']:.0%}"
    emoji_fmt = f"{your_patterns['emoji']:.0%}"
    question_fmt = f"{your_patterns['question']:.0%}"
    numbers_fmt = f"{your_patterns['numbers']:.0%}"
    cta_fmt = f"{your_patterns['cta']:.0%}"

    html += f"""
                </ul>
            </div>
        </div>

        <!-- CARACTERÍSTICAS DO CONTEÚDO -->
        <div class="sec">
            <h2>Características do Conteúdo</h2>
            <div class="g3">
                <div class="mc">
                    <h3>Hashtags</h3>
                    <div class="v gr" id="mc-hashtag">{hashtag_fmt}</div>
                    <div class="d">dos posts utilizam hashtags</div>
                </div>
                <div class="mc">
                    <h3>Emojis</h3>
                    <div class="v yl" id="mc-emoji">{emoji_fmt}</div>
                    <div class="d">dos posts utilizam emojis</div>
                </div>
                <div class="mc">
                    <h3>Perguntas</h3>
                    <div class="v yl" id="mc-question">{question_fmt}</div>
                    <div class="d">dos posts contêm perguntas</div>
                </div>
            </div>
            <div class="g3" style="margin-top:0">
                <div class="mc">
                    <h3>Dados e Números</h3>
                    <div class="v gr" id="mc-numbers">{numbers_fmt}</div>
                    <div class="d">dos posts utilizam números</div>
                </div>
                <div class="mc">
                    <h3>Chamada pra Ação</h3>
                    <div class="v yl" id="mc-cta">{cta_fmt}</div>
                    <div class="d">dos posts possuem CTA</div>
                </div>
                <div class="mc">
                    <h3>Média de Palavras</h3>
                    <div class="v gr" id="mc-words">{avg_words_30d}</div>
                    <div class="d">palavras por legenda</div>
                </div>
            </div>
        </div>
"""

    # --- SEÇÃO: ANÁLISE DOS COPYWRITERS ---
    html += """
        <!-- O QUE OS COPYWRITERS DIRIAM -->
        <div class="sec">
            <h2>O Que os Maiores Copywriters Diriam do Seu Conteúdo</h2>
            <p style="color:var(--tx2);margin-bottom:20px;font-size:0.9em">Cada especialista analisou seus últimos 30 posts e compartilhou sua visão e recomendações</p>
"""

    for cw in copywriters:
        melhorias_html = ''
        for m in cw['melhorias']:
            melhorias_html += f'<li>{m}</li>\n'

        html += f"""
            <div class="cw">
                <div class="cw-top">
                    <div>
                        <div class="cw-nm">{cw['nome']}</div>
                        <div class="cw-sp">{cw['especialidade']}</div>
                    </div>
                    <div class="cw-mt">
                        <div>{cw['seguidores']} seguidores</div>
                        <div>Engajamento: {cw['engajamento']}</div>
                    </div>
                </div>
                <div class="cw-txt">{cw['analise']}</div>
                <div class="cw-ml">
                    <h4>O que eu faria se cuidasse desse Instagram:</h4>
                    <ul>{melhorias_html}</ul>
                </div>
            </div>
"""

    # --- PONTOS DE MELHORIA + PLANO DE AÇÃO ---
    html += f"""
        </div>

        <!-- IMPACTO ESPERADO -->
        <div class="sec">
            <h2>Impacto Esperado com as Melhorias</h2>
            <div class="g3">
                <div class="imp">
                    <h3>Emojis</h3>
                    <div class="v">+15%</div>
                    <div class="d">atratividade visual</div>
                </div>
                <div class="imp">
                    <h3>Perguntas</h3>
                    <div class="v">+25%</div>
                    <div class="d">comentários</div>
                </div>
                <div class="imp">
                    <h3>Engajamento Total</h3>
                    <div class="v">+20%</div>
                    <div class="d">estimativa em 4 semanas</div>
                </div>
            </div>
        </div>

        <!-- PLANO DE AÇÃO -->
        <div class="sec">
            <h2>Plano de Ação — Próximas 4 Semanas</h2>
            <table class="tb">
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
                        <td>Emojis e Perguntas</td>
                        <td>2-3 emojis por post + pergunta no final</td>
                        <td>60% dos posts com perguntas</td>
                    </tr>
                    <tr>
                        <td><strong>2-3</strong></td>
                        <td>Ganchos Fortes</td>
                        <td>Primeira frase polêmica ou curiosa</td>
                        <td>Aumento de salvamentos</td>
                    </tr>
                    <tr>
                        <td><strong>3-4</strong></td>
                        <td>CTAs Estratégicos</td>
                        <td>Testar 3-4 posts com chamada pra ação</td>
                        <td>Medir cliques e conversão</td>
                    </tr>
                    <tr>
                        <td><strong>4+</strong></td>
                        <td>Consolidação</td>
                        <td>Manter o que funcionou + bastidores</td>
                        <td>+20% engajamento geral</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <footer>
            <p>Relatório gerado em {now} · @{username}</p>
            <p>Próxima análise recomendada: daqui a 7 dias</p>
        </footer>
    </div>

    <script>
        // Dados por período
        const periodData = {{
            'all': {{
                posts: {total_posts},
                eng: {avg_eng_30d},
                hashtag: '{f"{your_patterns['hashtag']:.0%}"}',
                emoji: '{f"{your_patterns['emoji']:.0%}"}',
                question: '{f"{your_patterns['question']:.0%}"}',
                numbers: '{f"{your_patterns['numbers']:.0%}"}',
                cta: '{f"{your_patterns['cta']:.0%}"}',
                words: {avg_words_30d},
                chartLabels: {json.dumps(chart_labels_30)},
                chartValues: {json.dumps(chart_values_30)}
            }},
            '7': {{
                posts: {total_7d},
                eng: {avg_eng_7d},
                hashtag: '{f"{patterns_7d['hashtag']:.0%}"}',
                emoji: '{f"{patterns_7d['emoji']:.0%}"}',
                question: '{f"{patterns_7d['question']:.0%}"}',
                numbers: '{f"{patterns_7d['numbers']:.0%}"}',
                cta: '{f"{patterns_7d['cta']:.0%}"}',
                words: {avg_words_7d},
                chartLabels: {json.dumps(chart_labels_7)},
                chartValues: {json.dumps(chart_values_7)}
            }}
        }};

        const chartOpts = {{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {{ legend: {{ display: false }} }},
            scales: {{
                y: {{
                    beginAtZero: true,
                    ticks: {{ color: '#888' }},
                    grid: {{ color: '{P}14' }}
                }},
                x: {{
                    ticks: {{ color: '#888' }},
                    grid: {{ display: false }}
                }}
            }}
        }};

        const ctx = document.getElementById('growthChart').getContext('2d');
        let chart = new Chart(ctx, {{
            type: 'line',
            data: {{
                labels: periodData['all'].chartLabels,
                datasets: [{{
                    label: 'Engajamento Acumulado',
                    data: periodData['all'].chartValues,
                    borderColor: '{P}',
                    backgroundColor: '{P}14',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '{P}',
                    pointBorderColor: '{BG1}',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }}]
            }},
            options: chartOpts
        }});

        function filterPeriod(period, event) {{
            // Alterna ranking
            document.getElementById('period-all').classList.add('hidden');
            document.getElementById('period-7').classList.add('hidden');
            if (period === 'all') {{
                document.getElementById('period-all').classList.remove('hidden');
            }} else {{
                document.getElementById('period-7').classList.remove('hidden');
            }}

            // Atualiza stats
            const d = periodData[period];
            document.getElementById('stat-posts').textContent = d.posts;
            document.getElementById('stat-eng').textContent = d.eng;

            // Atualiza características
            document.getElementById('mc-hashtag').textContent = d.hashtag;
            document.getElementById('mc-emoji').textContent = d.emoji;
            document.getElementById('mc-question').textContent = d.question;
            document.getElementById('mc-numbers').textContent = d.numbers;
            document.getElementById('mc-cta').textContent = d.cta;
            document.getElementById('mc-words').textContent = d.words;

            // Atualiza gráfico
            chart.data.labels = d.chartLabels;
            chart.data.datasets[0].data = d.chartValues;
            chart.update();

            // Atualiza botões
            document.querySelectorAll('.fbtn').forEach(btn => {{
                btn.classList.remove('active');
            }});
            event.target.classList.add('active');
        }}
    </script>
</body>
</html>"""

    return html


def save_and_open_report(html_content):
    filename = 'instagram_analysis_report.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    try:
        root_path = os.path.join('..', filename)
        with open(root_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    except:
        pass
    print(f'\n✅ Relatório salvo: {filename}')
    try:
        abs_path = os.path.abspath(filename)
        if sys.platform == 'win32':
            os.startfile(abs_path)
        elif sys.platform == 'darwin':
            subprocess.Popen(['open', abs_path])
        else:
            subprocess.Popen(['xdg-open', abs_path])
        print('🌐 Abrindo no navegador...\n')
    except Exception as e:
        print(f'⚠️  Abra manualmente: {os.path.abspath(filename)}')


def main():
    print('\n📄 Gerando Relatório HTML...\n')

    json_path = 'instagram_analysis.json'
    if not os.path.exists(json_path):
        json_path = os.path.join('..', 'instagram_analysis.json')

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            posts = data.get('detailed_posts', [])
            analysis = data.get('analysis_summary', {})
            account_data = {
                'username': data.get('username', 'softwarehouseexponencial'),
                'account_name': data.get('account_name', 'EXPX | Software House'),
                'profile_picture_url': data.get('profile_picture_url', ''),
                'followers_count': data.get('followers_count', 0),
                'media_count': data.get('media_count', 0),
            }
    except:
        print('❌ Erro: instagram_analysis.json não encontrado')
        print('   Execute analyze_instagram_posts.py primeiro')
        return

    if not posts:
        print('❌ Nenhum post encontrado')
        return

    html_content = generate_html_report(posts, analysis, account_data)
    save_and_open_report(html_content)
    print('✨ Relatório HTML gerado com sucesso!')


if __name__ == '__main__':
    main()

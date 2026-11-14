#!/usr/bin/env python3
"""
Meta Ads API - Fetch Instagram Accounts
Traz todas as contas Instagram vinculadas ao token
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict
from datetime import datetime

load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
API_VERSION = 'v20.0'
GRAPH_API_FACEBOOK = f'https://graph.facebook.com/{API_VERSION}'


def get_instagram_business_accounts() -> List[Dict]:
    """
    Busca todas as contas Instagram Business vinculadas
    """
    print('🔍 Buscando contas Instagram Business...\n')

    try:
        # Primeiro, pega as páginas Facebook vinculadas
        pages_response = requests.get(
            f'{GRAPH_API_FACEBOOK}/me/accounts',
            params={
                'fields': 'id,name,access_token,instagram_business_account',
                'limit': 100,
                'access_token': METAADS_TOKEN
            }
        )
        pages_response.raise_for_status()
        pages = pages_response.json().get('data', [])

        print(f'📄 Encontradas {len(pages)} páginas Facebook\n')

        instagram_accounts = []

        for page in pages:
            page_id = page.get('id')
            page_name = page.get('name', 'N/A')

            # Verifica se tem Instagram Business Account vinculado
            if 'instagram_business_account' in page:
                ig_account = page['instagram_business_account']
                ig_id = ig_account.get('id')

                instagram_accounts.append({
                    'facebook_page_id': page_id,
                    'facebook_page_name': page_name,
                    'instagram_business_id': ig_id,
                    'instagram_page_access_token': page.get('access_token')
                })

                print(f'✅ {page_name}')
                print(f'   Instagram ID: {ig_id}\n')

        if not instagram_accounts:
            print('⚠️  Nenhuma conta Instagram Business encontrada\n')
            return []

        print(f'✨ Total: {len(instagram_accounts)} contas Instagram Business\n')
        return instagram_accounts

    except Exception as e:
        print(f'❌ Erro ao buscar contas Instagram: {str(e)}\n')
        return []


def get_instagram_insights(instagram_id: str, page_token: str) -> Dict:
    """
    Busca insights de uma conta Instagram específica
    """
    try:
        insights_response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{instagram_id}/insights',
            params={
                'metric': 'impressions,reach,profile_views,website_clicks,follower_count,get_directions_clicks,phone_call_clicks,text_message_clicks,email_contacts',
                'period': 'day',
                'access_token': page_token
            }
        )
        insights_response.raise_for_status()
        return insights_response.json().get('data', [])

    except Exception as e:
        print(f'   ⚠️  Erro ao buscar insights: {str(e)}')
        return []


def get_instagram_basic_info(instagram_id: str, page_token: str) -> Dict:
    """
    Busca informações básicas da conta Instagram
    """
    try:
        info_response = requests.get(
            f'{GRAPH_API_FACEBOOK}/{instagram_id}',
            params={
                'fields': 'id,username,name,biography,website,profile_picture_url,follower_count,following_count,ig_id',
                'access_token': page_token
            }
        )
        info_response.raise_for_status()
        return info_response.json()

    except Exception as e:
        print(f'   ⚠️  Erro ao buscar info: {str(e)}')
        return {}


def analyze_instagram_performance(instagram_accounts: List[Dict]) -> List[Dict]:
    """
    Analisa performance de cada conta Instagram
    """
    print('=' * 80)
    print('📊 ANALISANDO PERFORMANCE DO INSTAGRAM')
    print('=' * 80 + '\n')

    performance_data = []

    for account in instagram_accounts:
        ig_id = account['instagram_business_id']
        page_token = account['instagram_page_access_token']
        fb_page_name = account['facebook_page_name']

        print(f'📱 {fb_page_name}')
        print(f'   ID: {ig_id}')

        # Buscar informações básicas
        basic_info = get_instagram_basic_info(ig_id, page_token)

        if basic_info:
            username = basic_info.get('username', 'N/A')
            followers = basic_info.get('follower_count', 'N/A')
            bio = basic_info.get('biography', 'N/A')

            print(f'   Username: @{username}')
            print(f'   Seguidores: {followers}')
            if bio:
                print(f'   Bio: {bio[:50]}...' if len(bio) > 50 else f'   Bio: {bio}')

            performance_data.append({
                'facebook_page_id': account['facebook_page_id'],
                'facebook_page_name': fb_page_name,
                'instagram_business_id': ig_id,
                'instagram_username': username,
                'follower_count': followers,
                'biography': bio,
                'profile_picture_url': basic_info.get('profile_picture_url'),
                'website': basic_info.get('website')
            })

        # Buscar insights
        insights = get_instagram_insights(ig_id, page_token)
        if insights:
            print(f'   📈 Insights encontrados')

        print()

    print('=' * 80 + '\n')
    return performance_data


def save_instagram_data(accounts: List[Dict], performance: List[Dict]):
    """
    Salva dados das contas Instagram
    """
    # JSON com contas
    output = {
        'timestamp': datetime.now().isoformat(),
        'total_accounts': len(accounts),
        'instagram_accounts': accounts,
        'performance_summary': performance
    }

    with open('instagram_accounts.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print('✅ Salvo: instagram_accounts.json')

    # Markdown
    markdown = f"""# Instagram Business Accounts Report

**Gerado:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
**Total de Contas:** {len(accounts)}

---

## Contas com Acesso

"""
    for account in performance:
        markdown += f"""
### @{account['instagram_username']}

- **Página Facebook:** {account['facebook_page_name']}
- **Instagram ID:** `{account['instagram_business_id']}`
- **Seguidores:** {account['follower_count']}
- **Website:** {account['website'] or 'Não configurado'}
- **Bio:** {account['biography'] or 'N/A'}

"""

    with open('instagram_accounts_report.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    print('✅ Salvo: instagram_accounts_report.md\n')


if __name__ == '__main__':
    instagram_accounts = get_instagram_business_accounts()

    if instagram_accounts:
        performance = analyze_instagram_performance(instagram_accounts)
        save_instagram_data(instagram_accounts, performance)
        print('✨ Operação concluída com sucesso!')
    else:
        print('⚠️  Nenhuma conta Instagram foi encontrada')
        exit(1)

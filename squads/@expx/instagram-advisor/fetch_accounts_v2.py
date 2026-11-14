#!/usr/bin/env python3
"""
Meta Ads API - Fetch Accounts (v2)
Tenta múltiplos endpoints e métodos para trazer contas
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
GRAPH_API_BASE = f'https://graph.instagram.com/{API_VERSION}'
GRAPH_API_FACEBOOK = f'https://graph.facebook.com/{API_VERSION}'


def get_accounts_via_facebook_api() -> List[Dict]:
    """
    Tenta via Facebook Graph API (mais confiável para ad accounts)
    """
    print('[1/3] Tentando Facebook Graph API...')

    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/me/adaccounts',
            params={
                'fields': 'id,name,currency,timezone_name,account_status,business_name,spend_cap,updated_time',
                'limit': 100,
                'access_token': METAADS_TOKEN
            }
        )

        if response.status_code == 200:
            data = response.json()
            accounts = data.get('data', [])
            print(f'✅ Sucesso! Encontradas {len(accounts)} contas\n')
            return accounts
        else:
            error = response.json().get('error', {})
            print(f'   Status {response.status_code}: {error.get("message", "Erro desconhecido")}\n')
            return []

    except Exception as e:
        print(f'   Erro: {str(e)}\n')
        return []


def get_accounts_via_user() -> List[Dict]:
    """
    Alternativa: Tenta obter contas via /me/accounts
    """
    print('[2/3] Tentando /me/accounts endpoint...')

    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/me/accounts',
            params={
                'fields': 'id,name,access_token,tasks',
                'limit': 100,
                'access_token': METAADS_TOKEN
            }
        )

        if response.status_code == 200:
            data = response.json()
            accounts = data.get('data', [])
            print(f'✅ Sucesso! Encontradas {len(accounts)} contas\n')
            return accounts
        else:
            error = response.json().get('error', {})
            print(f'   Status {response.status_code}: {error.get("message", "Erro desconhecido")}\n')
            return []

    except Exception as e:
        print(f'   Erro: {str(e)}\n')
        return []


def validate_token() -> bool:
    """
    Validar se o token é válido
    """
    print('[Validação] Testando token...')

    try:
        response = requests.get(
            f'{GRAPH_API_FACEBOOK}/me',
            params={
                'fields': 'id,name,email',
                'access_token': METAADS_TOKEN
            }
        )

        if response.status_code == 200:
            data = response.json()
            print(f'✅ Token válido!')
            print(f'   Usuário: {data.get("name", "N/A")}')
            print(f'   ID: {data.get("id", "N/A")}\n')
            return True
        else:
            error = response.json().get('error', {})
            print(f'❌ Token inválido: {error.get("message", "Erro desconhecido")}\n')
            return False

    except Exception as e:
        print(f'❌ Erro ao validar: {str(e)}\n')
        return False


def get_accounts_with_fallback() -> List[Dict]:
    """
    Tenta múltiplos métodos em ordem de confiabilidade
    """
    print('=' * 80)
    print('🔍 INICIANDO BUSCA DE CONTAS META ADS')
    print('=' * 80 + '\n')

    if not METAADS_TOKEN:
        print('❌ Erro: METAADS_TOKEN não encontrado no .env\n')
        return []

    # Validar token primeiro
    if not validate_token():
        return []

    # Tentar métodos em sequência
    accounts = get_accounts_via_facebook_api()

    if not accounts:
        accounts = get_accounts_via_user()

    if not accounts:
        print('❌ Nenhuma conta encontrada em nenhum dos endpoints\n')
        return []

    return accounts


def display_accounts(accounts: List[Dict]):
    """
    Exibir contas de forma formatada
    """
    print('=' * 80)
    print(f'📊 RESUMO: {len(accounts)} contas encontradas')
    print('=' * 80 + '\n')

    for idx, account in enumerate(accounts, 1):
        print(f'{idx}. {account.get("name", "N/A")}')
        print(f'   ID: {account.get("id")}')

        if 'account_status' in account:
            status = account.get('account_status')
            status_labels = {1: '✅ Ativa', 2: '⏸️ Suspensa', 3: '❌ Desativada'}
            print(f'   Status: {status_labels.get(status, f"Status {status}")}')

        if 'currency' in account:
            print(f'   Moeda: {account.get("currency")}')

        if 'timezone_name' in account:
            print(f'   Timezone: {account.get("timezone_name")}')

        if 'business_name' in account:
            print(f'   Business: {account.get("business_name")}')

        print()

    print('=' * 80 + '\n')


def save_results(accounts: List[Dict]):
    """
    Salvar resultados em JSON e Markdown
    """
    # JSON
    output_json = {
        'timestamp': datetime.now().isoformat(),
        'total_accounts': len(accounts),
        'accounts': accounts
    }

    with open('accounts.json', 'w', encoding='utf-8') as f:
        json.dump(output_json, f, indent=2, ensure_ascii=False)
    print('✅ Salvo: accounts.json')

    # Markdown
    markdown = f"""# Meta Ads Accounts Report

**Gerado:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
**Total de Contas:** {len(accounts)}

---

## Contas

"""
    for account in accounts:
        markdown += f"\n### {account.get('name', 'N/A')}\n"
        markdown += f"- **ID:** `{account.get('id')}`\n"

        for key, value in account.items():
            if key not in ['id', 'name']:
                markdown += f"- **{key.replace('_', ' ').title()}:** {value}\n"

    with open('accounts-report.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    print('✅ Salvo: accounts-report.md\n')


if __name__ == '__main__':
    accounts = get_accounts_with_fallback()

    if accounts:
        display_accounts(accounts)
        save_results(accounts)
        print('✨ Operação concluída com sucesso!')
    else:
        print('⚠️  Nenhuma conta foi encontrada')
        exit(1)

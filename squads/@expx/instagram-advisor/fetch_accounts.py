#!/usr/bin/env python3
"""
Meta Ads API - Fetch Accounts
Consulta a API do Meta Ads para trazer todas as contas disponíveis
para o token fornecido no .env
"""

import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict
from datetime import datetime

# Carregar variáveis de ambiente
load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
API_VERSION = 'v20.0'
GRAPH_API_BASE = f'https://graph.instagram.com/{API_VERSION}'


def get_meta_ad_accounts() -> List[Dict]:
    """
    Fetch all Meta Ads accounts available for the given token
    """
    if not METAADS_TOKEN:
        raise ValueError('❌ METAADS_TOKEN não encontrado no .env')

    try:
        print('🔄 Buscando contas Meta Ads...\n')

        # Passo 1: Validar token e pegar dados do usuário
        me_response = requests.get(
            f'{GRAPH_API_BASE}/me',
            params={
                'fields': 'id,name,email',
                'access_token': METAADS_TOKEN
            }
        )
        me_response.raise_for_status()
        me_data = me_response.json()

        print('✅ Usuário autenticado:')
        print(f"   ID: {me_data.get('id')}")
        print(f"   Nome: {me_data.get('name')}")
        print(f"   Email: {me_data.get('email', 'N/A')}\n")

        # Passo 2: Buscar contas de anúncios
        accounts_response = requests.get(
            f'{GRAPH_API_BASE}/me/adaccounts',
            params={
                'fields': 'id,name,currency,timezone_name,account_status,business_name,spend_cap',
                'limit': 100,
                'access_token': METAADS_TOKEN
            }
        )
        accounts_response.raise_for_status()
        accounts_data = accounts_response.json()

        accounts = accounts_data.get('data', [])

        if not accounts:
            print('⚠️  Nenhuma conta de anúncios encontrada.')
            return []

        print(f'📊 Total de contas encontradas: {len(accounts)}\n')
        print('📋 LISTA DE CONTAS:')
        print('=' * 80)

        for idx, account in enumerate(accounts, 1):
            status_label = get_status_label(account.get('account_status'))
            print(f'\n{idx}. {account.get("name")}')
            print(f'   ID: {account.get("id")}')
            print(f'   Status: {status_label}')
            print(f'   Moeda: {account.get("currency", "N/A")}')
            print(f'   Timezone: {account.get("timezone_name", "N/A")}')
            print(f'   Business: {account.get("business_name", "N/A")}')
            print(f'   Spend Cap: {account.get("spend_cap", "N/A")}')

        print('\n' + '=' * 80)
        print(f'\n✨ Todas as {len(accounts)} contas foram listadas com sucesso!\n')

        return accounts

    except requests.exceptions.HTTPError as e:
        error_data = e.response.json()
        error_msg = error_data.get('error', {}).get('message', str(e))
        print(f'❌ Erro na API Meta Ads:')
        print(f'   Status: {e.response.status_code}')
        print(f'   Mensagem: {error_msg}')
        raise
    except Exception as e:
        print(f'❌ Erro: {str(e)}')
        raise


def get_status_label(status_code: int) -> str:
    """Map Meta Ads account status codes to labels"""
    status_map = {
        1: '✅ Ativa',
        2: '⏸️  Suspensa',
        3: '❌ Desativada',
        9: '🔒 Bloqueada Pelo Business',
        100: '⚠️  Pendente',
    }
    return status_map.get(status_code, f'Status {status_code}')


def save_accounts_to_json(accounts: List[Dict], filename: str = 'accounts.json'):
    """Save accounts data to JSON file"""
    output = {
        'timestamp': datetime.now().isoformat(),
        'total_accounts': len(accounts),
        'accounts': accounts
    }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f'💾 Dados salvos em: {filename}')


def generate_markdown_report(accounts: List[Dict], filename: str = 'accounts-report.md'):
    """Generate Markdown report of accounts"""
    report = f"""# Meta Ads Accounts Report

**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
**Total de Contas:** {len(accounts)}

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de Contas | {len(accounts)} |
| Ativas | {sum(1 for a in accounts if a.get('account_status') == 1)} |
| Suspensas | {sum(1 for a in accounts if a.get('account_status') == 2)} |
| Desativadas | {sum(1 for a in accounts if a.get('account_status') == 3)} |

---

## Contas Detalhadas

"""

    for idx, account in enumerate(accounts, 1):
        status_label = get_status_label(account.get('account_status'))
        report += f"""
### {idx}. {account.get('name')}

- **ID da Conta:** `{account.get('id')}`
- **Status:** {status_label}
- **Moeda:** {account.get('currency', 'N/A')}
- **Timezone:** {account.get('timezone_name', 'N/A')}
- **Business:** {account.get('business_name', 'N/A')}
- **Spend Cap:** {account.get('spend_cap', 'Sem limite')}

"""

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f'📄 Relatório gerado em: {filename}')


if __name__ == '__main__':
    try:
        accounts = get_meta_ad_accounts()

        if accounts:
            # Salvar dados
            save_accounts_to_json(accounts)
            generate_markdown_report(accounts)

            print('\n✨ Operação concluída com sucesso!')

    except Exception as e:
        print(f'\n❌ Operação falhou: {str(e)}')
        exit(1)

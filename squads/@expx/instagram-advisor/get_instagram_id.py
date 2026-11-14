#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para obter o ID do Instagram Business Account pelo username
"""

import os
import requests
from dotenv import load_dotenv
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
API_VERSION = 'v20.0'

def get_instagram_id_by_username(username):
    """
    Busca o ID do Instagram Business Account pelo username
    """
    print(f"\n🔍 Buscando ID para @{username}...\n")

    # Opção 1: Tentar via /me (se for a conta do token)
    try:
        response = requests.get(
            f'https://graph.instagram.com/{API_VERSION}/me',
            params={'fields': 'id,username,name', 'access_token': METAADS_TOKEN}
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('username', '').lower() == username.lower():
                print(f"✅ ID encontrado (via /me):")
                print(f"   Username: {data.get('username')}")
                print(f"   ID: {data.get('id')}")
                print(f"   Nome: {data.get('name')}")
                return data.get('id')
    except:
        pass

    # Opção 2: Tentar via business discovery (precisa de permissões)
    try:
        me_response = requests.get(
            f'https://graph.instagram.com/{API_VERSION}/me',
            params={'fields': 'id', 'access_token': METAADS_TOKEN}
        )
        if me_response.status_code == 200:
            my_id = me_response.json().get('id')

            # Tentar descobrir via business discovery
            discovery_response = requests.get(
                f'https://graph.instagram.com/{API_VERSION}/{my_id}',
                params={
                    'fields': f'business_discovery.username({username}){{"id","name","username"}}',
                    'access_token': METAADS_TOKEN
                }
            )

            if discovery_response.status_code == 200:
                data = discovery_response.json()
                if 'business_discovery' in data and data['business_discovery']:
                    account = data['business_discovery']
                    print(f"✅ ID encontrado (via business_discovery):")
                    print(f"   Username: {account.get('username')}")
                    print(f"   ID: {account.get('id')}")
                    print(f"   Nome: {account.get('name')}")
                    return account.get('id')
    except Exception as e:
        pass

    print(f"❌ Erro: Não foi possível encontrar o ID para @{username}")
    print(f"\n💡 Alternativas:")
    print(f"   1. Acesse: https://developers.facebook.com/tools/explorer/")
    print(f"   2. Selecione a conta desejada")
    print(f"   3. Busque o endpoint: GET /{{account_id}}/instagram_business_account")
    print(f"   4. Copie o ID retornado\n")
    return None

if __name__ == '__main__':
    username = 'softwarehouseexponencial'
    instagram_id = get_instagram_id_by_username(username)

    if instagram_id:
        print(f"\n🔧 Para usar esta conta, atualize o .env:")
        print(f"   METAADS_INSTAGRAM_ID={instagram_id}\n")

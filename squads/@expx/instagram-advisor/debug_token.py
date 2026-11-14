#!/usr/bin/env python3
"""
Debug script para testar token e endpoints
"""

import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
METAADS_INSTAGRAM_ID = os.getenv('METAADS_INSTAGRAM_ID')

print("=" * 80)
print("🔍 DEBUG: Testando Token e Endpoints")
print("=" * 80 + "\n")

print(f"Token (primeiros 20 chars): {METAADS_TOKEN[:20]}...")
print(f"Instagram ID: {METAADS_INSTAGRAM_ID}\n")

# Test 1: Validar token
print("[1] Testando token com /me endpoint...")
try:
    response = requests.get(
        'https://graph.instagram.com/v20.0/me',
        params={'access_token': METAADS_TOKEN}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    if response.status_code == 200:
        print(f"✅ Token válido!")
        print(f"   ID: {data.get('id')}")
        print(f"   Username: {data.get('username')}")
    else:
        print(f"❌ Erro: {data.get('error', {}).get('message')}")
except Exception as e:
    print(f"❌ Erro: {str(e)}")

print("\n[2] Testando /media endpoint com ID fornecido...")
try:
    response = requests.get(
        f'https://graph.instagram.com/v20.0/{METAADS_INSTAGRAM_ID}/media',
        params={
            'fields': 'id,caption,media_type,timestamp',
            'limit': 5,
            'access_token': METAADS_TOKEN
        }
    )
    print(f"Status: {response.status_code}")
    data = response.json()

    if response.status_code == 200:
        media_list = data.get('data', [])
        print(f"✅ Sucesso! {len(media_list)} posts encontrados")
        if media_list:
            print(f"   Primeiro post ID: {media_list[0].get('id')}")
    else:
        error = data.get('error', {})
        print(f"❌ Erro {error.get('code')}: {error.get('message')}")
except Exception as e:
    print(f"❌ Erro: {str(e)}")

print("\n[3] Testando endpoints alternativos...")

# Tentar com diferentes endpoints
endpoints = [
    f'https://graph.facebook.com/v20.0/{METAADS_INSTAGRAM_ID}/media',
    f'https://graph.instagram.com/v20.0/me/media',
]

for endpoint in endpoints:
    try:
        print(f"\n   Testando: {endpoint.split('/v20.0/')[-1]}")
        response = requests.get(
            endpoint,
            params={'limit': 1, 'access_token': METAADS_TOKEN}
        )
        print(f"   Status: {response.status_code}", end='')
        if response.status_code == 200:
            print(" ✅")
        else:
            error = response.json().get('error', {})
            print(f" ❌ ({error.get('code')}: {error.get('message')})")
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")

print("\n[4] Testando se o ID é de Business ou User...")
try:
    response = requests.get(
        f'https://graph.instagram.com/v20.0/{METAADS_INSTAGRAM_ID}',
        params={'fields': 'id,username,name,biography,ig_id', 'access_token': METAADS_TOKEN}
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ID é válido")
        print(f"   ID: {data.get('id')}")
        print(f"   Username: {data.get('username')}")
        print(f"   Type: Business" if 'ig_id' not in data else "Type: Indeterminado")
except Exception as e:
    print(f"❌ Erro: {str(e)}")

print("\n" + "=" * 80)
print("💡 Se /media retornar erro (#10), tente:")
print("   1. Gerar novo token em: https://developers.facebook.com/tools/explorer/")
print("   2. Certificar que tem permissão: instagram_basic")
print("   3. Certificar que é um Instagram Business Account (não pessoal)")
print("=" * 80)

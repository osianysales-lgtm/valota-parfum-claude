#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar qual conta Instagram está vinculada ao ID no .env
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
METAADS_INSTAGRAM_ID = os.getenv('METAADS_INSTAGRAM_ID')
API_VERSION = 'v20.0'

print(f"\n🔍 Verificando conta Instagram...\n")
print(f"ID no .env: {METAADS_INSTAGRAM_ID}\n")

try:
    response = requests.get(
        f'https://graph.instagram.com/{API_VERSION}/{METAADS_INSTAGRAM_ID}',
        params={
            'fields': 'id,username,name,biography,followers_count,media_count,ig_id',
            'access_token': METAADS_TOKEN
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("✅ Conta encontrada!\n")
        print(f"📱 Username: @{data.get('username')}")
        print(f"👤 Nome: {data.get('name')}")
        print(f"📝 Bio: {data.get('biography')}")
        print(f"👥 Seguidores: {data.get('followers_count', 'N/A')}")
        print(f"📸 Posts: {data.get('media_count', 'N/A')}")
        print(f"🆔 ID: {data.get('id')}\n")
    else:
        error = response.json().get('error', {})
        print(f"❌ Erro {error.get('code')}: {error.get('message')}\n")

except Exception as e:
    print(f"❌ Erro: {str(e)}\n")

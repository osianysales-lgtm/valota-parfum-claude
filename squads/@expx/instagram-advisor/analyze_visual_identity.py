#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Análise de Identidade Visual - Instagram
Extrai cores dominantes da foto de perfil e posts via Meta Graph API.
Se não conseguir extrair, usa o layout padrão aprovado (dark + verde neon).
"""

import os
import sys
import io
import requests
import re
from datetime import datetime
from collections import Counter

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

METAADS_TOKEN = os.getenv('METAADS_TOKEN')
METAADS_INSTAGRAM_ID = os.getenv('METAADS_INSTAGRAM_ID')
API_VERSION = 'v20.0'
GRAPH_API = f'https://graph.facebook.com/{API_VERSION}'

# Layout padrão aprovado quando não há design system
DEFAULT_PRIMARY = '#00D26A'
DEFAULT_SECONDARY = '#FF6B35'
DEFAULT_BG = '#000000'
DEFAULT_BG2 = '#111111'
DEFAULT_TEXT = '#ffffff'
DEFAULT_TEXT2 = '#888888'


def fetch_profile_and_posts():
    """Busca dados do perfil e últimos posts para análise visual"""
    account_info = {}
    post_images = []

    try:
        # Buscar info da conta
        r = requests.get(f'{GRAPH_API}/{METAADS_INSTAGRAM_ID}', params={
            'fields': 'username,name,profile_picture_url,biography',
            'access_token': METAADS_TOKEN
        })
        if r.status_code == 200:
            data = r.json()
            account_info = {
                'username': data.get('username', ''),
                'name': data.get('name', ''),
                'profile_picture_url': data.get('profile_picture_url', ''),
                'biography': data.get('biography', ''),
            }
            print(f'  Conta: @{account_info["username"]} ({account_info["name"]})')

        # Buscar últimos posts com imagens
        r = requests.get(f'{GRAPH_API}/{METAADS_INSTAGRAM_ID}/media', params={
            'fields': 'media_type,media_url,thumbnail_url',
            'limit': 10,
            'access_token': METAADS_TOKEN
        })
        if r.status_code == 200:
            for post in r.json().get('data', []):
                url = post.get('media_url') or post.get('thumbnail_url')
                if url:
                    post_images.append(url)
            print(f'  {len(post_images)} imagens de posts coletadas')

    except Exception as e:
        print(f'  Erro ao buscar dados: {e}')

    return account_info, post_images


def extract_colors_from_images(image_urls):
    """
    Tenta extrair cores dominantes das imagens.
    Se Pillow estiver disponível, analisa os pixels.
    Caso contrário, retorna None para usar o padrão.
    """
    try:
        from PIL import Image
        from io import BytesIO

        all_colors = []
        for url in image_urls[:5]:  # Analisar até 5 imagens
            try:
                resp = requests.get(url, timeout=10)
                if resp.status_code != 200:
                    continue
                img = Image.open(BytesIO(resp.content)).convert('RGB')
                img = img.resize((50, 50))  # Reduzir para performance
                pixels = list(img.getdata())
                all_colors.extend(pixels)
            except:
                continue

        if not all_colors:
            return None

        # Filtrar pixels muito escuros ou muito claros (fundo/branco)
        filtered = [(r, g, b) for r, g, b in all_colors
                     if not (r < 30 and g < 30 and b < 30)      # Não preto
                     and not (r > 225 and g > 225 and b > 225)]  # Não branco

        if not filtered:
            return None

        # Quantizar para encontrar cores dominantes
        quantized = [((r // 32) * 32, (g // 32) * 32, (b // 32) * 32) for r, g, b in filtered]
        counter = Counter(quantized)
        top_colors = counter.most_common(5)

        if len(top_colors) >= 2:
            c1 = top_colors[0][0]
            c2 = top_colors[1][0]
            primary = f'#{c1[0]:02x}{c1[1]:02x}{c1[2]:02x}'
            secondary = f'#{c2[0]:02x}{c2[1]:02x}{c2[2]:02x}'
            return primary, secondary

        return None

    except ImportError:
        print('  Pillow não instalado — usando cores padrão')
        return None
    except Exception as e:
        print(f'  Erro na extração de cores: {e}')
        return None


def create_design_system(account_info, colors=None):
    """Cria design system baseado nas cores extraídas ou no padrão aprovado"""

    if colors:
        primary, secondary = colors
        method = 'Extraído das imagens do perfil e posts'
        print(f'\n  Cores extraídas: primária={primary}, secundária={secondary}')
    else:
        primary = DEFAULT_PRIMARY
        secondary = DEFAULT_SECONDARY
        method = 'Padrão aprovado (dark + verde neon) — sem extração de cores'
        print(f'\n  Usando cores padrão: primária={primary}, secundária={secondary}')

    username = account_info.get('username', 'desconhecido')
    name = account_info.get('name', '')

    md = f"""# Design System - @{username}

**Data de Análise**: {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}
**Método**: {method}
**Conta**: {name} (@{username})

---

## Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| ● | {primary} | Cor primária (destaque) |
| ● | {secondary} | Cor secundária |
| ● | {DEFAULT_BG} | Fundo principal |
| ● | {DEFAULT_BG2} | Fundo cards |
| ● | {DEFAULT_TEXT} | Texto principal |
| ● | {DEFAULT_TEXT2} | Texto secundário |

---

## CSS Variables

```css
:root {{
  --primary: {primary};
  --secondary: {secondary};

  --bg-primary: {DEFAULT_BG};
  --bg-secondary: {DEFAULT_BG2};
  --text-primary: {DEFAULT_TEXT};
  --text-secondary: {DEFAULT_TEXT2};

  --gradient: linear-gradient(135deg, {primary} 0%, {secondary} 100%);

  --font-display: 'DM Sans', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  --radius: 10px;
}}
```

---

**Layout**: Dark puro (fundo preto)
**Status**: Ativo
**Versão**: 7.0
"""

    os.makedirs('_memory', exist_ok=True)
    with open('_memory/design_system.md', 'w', encoding='utf-8') as f:
        f.write(md)

    print(f'\n  Design system salvo em _memory/design_system.md')
    return primary, secondary


def main():
    print('\n  Analisando identidade visual...\n')

    # Verificar se já existe
    if os.path.exists('_memory/design_system.md'):
        print('  Design system já existe. Para recriar, delete _memory/design_system.md')
        return

    if not METAADS_TOKEN or not METAADS_INSTAGRAM_ID:
        print('  METAADS_TOKEN ou METAADS_INSTAGRAM_ID não configurados')
        print('  Criando design system com cores padrão...')
        create_design_system({})
        return

    # Buscar dados do Instagram
    account_info, post_images = fetch_profile_and_posts()

    # Tentar extrair cores
    colors = None
    all_urls = []
    if account_info.get('profile_picture_url'):
        all_urls.append(account_info['profile_picture_url'])
    all_urls.extend(post_images)

    if all_urls:
        colors = extract_colors_from_images(all_urls)

    # Criar design system (com cores extraídas ou padrão)
    create_design_system(account_info, colors)

    print('\n  Análise de identidade visual concluída!\n')


if __name__ == '__main__':
    main()

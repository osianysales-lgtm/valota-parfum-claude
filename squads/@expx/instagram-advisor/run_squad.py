#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para executar a Instagram Advisor Squad
Pipeline completo: análise → geração de HTML → auto-abertura no navegador
"""

import os
import sys
import subprocess
from datetime import datetime

# Configure stdout para UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dotenv import load_dotenv

load_dotenv()

def print_header(text):
    """Imprime um header formatado"""
    print(f"\n{'='*80}")
    print(f"  {text}")
    print(f"{'='*80}\n")

def check_env_vars():
    """Valida variáveis de ambiente"""
    print_header("🔍 Validando Variáveis de Ambiente")

    required_vars = ['METAADS_TOKEN', 'METAADS_INSTAGRAM_ID']
    missing = []

    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing.append(var)
            print(f"❌ {var}: NÃO CONFIGURADA")
        else:
            # Mostrar apenas primeiros caracteres
            display_value = value[:20] + '...' if len(value) > 20 else value
            print(f"✅ {var}: {display_value}")

    if missing:
        print(f"\n❌ Erro: Variáveis faltando: {', '.join(missing)}")
        return False

    print(f"\n✅ Todas as variáveis configuradas!")
    return True

def run_analysis():
    """Executa a análise de Instagram"""
    print_header("📊 Executando Análise de Instagram")

    try:
        result = subprocess.run(
            ['python', 'analyze_instagram_posts.py'],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(result.stdout)
            print("✅ Análise concluída com sucesso!")
            return True
        else:
            print(f"❌ Erro na análise: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Erro ao executar análise: {str(e)}")
        return False

def run_html_report():
    """Executa a geração do relatório HTML"""
    print_header("📄 Gerando Relatório HTML Interativo")

    try:
        result = subprocess.run(
            ['python', 'generate_html_report.py'],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(result.stdout)
            print("✅ Relatório HTML gerado com sucesso!")
            return True
        else:
            print(f"❌ Erro na geração do relatório: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Erro ao executar relatório: {str(e)}")
        return False

def main():
    """Executa a pipeline completa da squad"""
    print_header("Instagram Advisor Squad")
    print(f"Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Step 1: Validar variáveis
    if not check_env_vars():
        return

    # Step 2: Executar análise
    if not run_analysis():
        print("\n⚠️  Pulando geração de relatório (análise falhou)")
        return

    # Step 3: Gerar relatório HTML
    if not run_html_report():
        print("\n⚠️  Falha na geração do relatório HTML")
        return

    # Success!
    print_header("✨ Pipeline Concluída com Sucesso!")
    print("📊 Relatório aberto no navegador automaticamente")
    print("📁 Arquivos gerados:")
    print("   - instagram_analysis.json")
    print("   - instagram_analysis_report.md")
    print("   - instagram_analysis_report.html")
    print(f"\n⏰ Concluído em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == '__main__':
    main()

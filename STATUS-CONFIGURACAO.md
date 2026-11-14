# Status de Configuração - Valota Parfum

**Atualizado:** 2026-11-14

## ✅ Pronto para usar

### copy-viral-perfumes
- **Tipo:** Squad Claude
- **Status:** ✅ Configurado
- **Como usar:** Abra no VS Code, use o squad para gerar copy viral

### direcao-de-arte
- **Tipo:** Documentação + Referências
- **Status:** ✅ Configurado
- **Como usar:** Leia DIRECAO-DE-ARTE.md para as regras visuais

---

## ⚠️ Precisa de configuração manual

### carrossel-tweet
- **Tipo:** Python + Chrome
- **Status:** ❌ Python não instalado
- **Dependências:**
  - Python 3.7+ (https://www.python.org/downloads/)
  - Google Chrome ou Chromium
- **Como usar:** `python3 gerar.py carrosseis/exemplo/carrossel.json`
- **O que faz:** Gera PNG slides (1080x1350) de carrossel estilo Tweet

### carrossel-ficha
- **Tipo:** Python
- **Status:** ❌ Python não instalado
- **Dependências:**
  - Python 3.7+
  - carrossel-lista (irmão, usa código dele)
- **Como usar:** `python3 gerar.py carrosseis/exemplo/carrossel.json`
- **O que faz:** Gera PNG de fichas (comparativo nicho x árabe)

### carrossel-lista
- **Tipo:** Python (suporte)
- **Status:** ❌ Python não instalado
- **Dependências:**
  - Python 3.7+
- **Como usar:** Importado pelo carrossel-ficha
- **O que faz:** Gerador base de carrosseis

---

## 📋 Para habilitar os carrosseis

1. **Instale Python 3.11** de https://www.python.org/downloads/
   - Na instalação, marque "Add Python to PATH"
   - Reinicie o VS Code depois

2. **Verifique Chrome instalado** (para carrossel-tweet)
   - Se usar outro navegador, edite a linha `CHROME = "..."` em `gerar.py`

3. **Teste:**
   ```bash
   cd squads/@valotaparfum/carrossel-tweet
   python3 gerar.py carrosseis/exemplo/carrossel.json
   ```

---

## Memórias + Skills

✅ **41 memórias** instaladas em: `~/.claude/projects/Downloads-ClaudCode/memory/`
✅ **Animador Zero** instalado em: `claude-config/skills/animador-zero/`

---

**Próximo passo:** Instale Python manualmente, depois volte aqui e avise!

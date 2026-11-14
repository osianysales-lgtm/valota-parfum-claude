# -*- coding: utf-8 -*-
"""Animador Zero - confere e instala o que a skill precisa.

  python setup.py              -> so confere e mostra o que falta
  python setup.py --instalar   -> instala o motor 3D (npm) e o ambiente proprio de audio/transcricao

Node.js, ffmpeg e Chrome nao sao instalados por aqui: o script mostra o comando certo para o sistema.
"""
import os
import platform
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from az_lib import HOME_DIR, MOTOR, VENV_DIR, say, venv_python  # noqa: E402

PYMODS = ["faster_whisper", "numpy", "scipy"]


def dica(prog):
    s = platform.system()
    tab = {
        "node": {"Windows": "winget install OpenJS.NodeJS.LTS -e", "Darwin": "brew install node", "Linux": "sudo apt install nodejs npm"},
        "ffmpeg": {"Windows": "winget install --id Gyan.FFmpeg -e", "Darwin": "brew install ffmpeg", "Linux": "sudo apt install ffmpeg"},
        "chrome": {"Windows": "winget install Google.Chrome -e", "Darwin": "brew install --cask google-chrome", "Linux": "instale o Google Chrome ou o Chromium"},
    }
    extra = "   (depois feche e abra o Claude de novo)" if s == "Windows" and prog != "chrome" else ""
    return tab[prog].get(s, tab[prog]["Linux"]) + extra


def tem_mods(py):
    r = subprocess.run([str(py), "-c", "import " + ",".join(PYMODS)], capture_output=True)
    return r.returncode == 0


def chrome_ok():
    cands = []
    if platform.system() == "Windows":
        for base in (os.environ.get("PROGRAMFILES", r"C:\Program Files"), os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"), os.environ.get("LOCALAPPDATA", "")):
            cands += [os.path.join(base, r"Google\Chrome\Application\chrome.exe"), os.path.join(base, r"Microsoft\Edge\Application\msedge.exe")]
    elif platform.system() == "Darwin":
        cands = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"]
    else:
        cands = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
    return next((c for c in cands if os.path.exists(c)), None)


def main():
    instalar = "--instalar" in sys.argv
    ok = True
    say(f"Sistema: {platform.system()} {platform.release()} | Python {platform.python_version()}")
    if sys.version_info < (3, 9):
        say("FALTA: Python 3.9 ou mais novo."); ok = False

    node = shutil.which("node")
    if node:
        v = subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip()
        major = int(v.lstrip("v").split(".")[0] or 0)
        if major < 18:
            say(f"FALTA: Node.js 18 ou mais novo (tem {v}). Instale com: {dica('node')}"); ok = False
        else:
            say(f"OK: Node.js {v}")
    else:
        say(f"FALTA: Node.js. Instale com: {dica('node')}"); ok = False

    for b in ("ffmpeg", "ffprobe"):
        p = shutil.which(b)
        if p: say(f"OK: {b} -> {p}")
        else: say(f"FALTA: {b}. Instale com: {dica('ffmpeg')}"); ok = False

    c = chrome_ok()
    if c: say(f"OK: navegador para renderizar -> {c}")
    else: say(f"FALTA: Google Chrome ou Microsoft Edge. Instale com: {dica('chrome')}"); ok = False

    motor_ok = (MOTOR / "node_modules" / "three").exists() and (MOTOR / "node_modules" / "puppeteer-core").exists()
    if not motor_ok and instalar and node:
        say("Instalando o motor 3D (three.js + puppeteer-core)...")
        npm = "npm.cmd" if platform.system() == "Windows" else "npm"
        r = subprocess.run([npm, "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=str(MOTOR))
        motor_ok = r.returncode == 0 and (MOTOR / "node_modules" / "three").exists()
    if motor_ok: say("OK: motor 3D instalado")
    else: say("FALTA: motor 3D. Rode: python scripts/setup.py --instalar"); ok = False

    py = sys.executable if tem_mods(sys.executable) else (venv_python() if venv_python() and tem_mods(venv_python()) else None)
    if not py and instalar:
        say(f"Criando ambiente proprio em {VENV_DIR} (nao mexe no resto do computador)...")
        HOME_DIR.mkdir(parents=True, exist_ok=True)
        if not venv_python():
            subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
        vp = venv_python()
        subprocess.run([str(vp), "-m", "pip", "install", "--upgrade", "pip", "-q"], check=False)
        say("Instalando transcritor e audio (faster-whisper, numpy, scipy). Pode levar alguns minutos...")
        r = subprocess.run([str(vp), "-m", "pip", "install", "-q", "faster-whisper", "numpy", "scipy"])
        py = vp if r.returncode == 0 and tem_mods(vp) else None
    if py: say(f"OK: transcritor e audio -> {py}")
    else: say("FALTA: transcritor e audio. Rode: python scripts/setup.py --instalar"); ok = False

    say("")
    say("TUDO PRONTO." if ok else "AINDA FALTA ALGO (veja as linhas FALTA acima).")
    sys.exit(0 if ok else 2)


if __name__ == "__main__":
    main()

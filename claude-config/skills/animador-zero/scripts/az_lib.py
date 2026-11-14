# -*- coding: utf-8 -*-
"""Funcoes comuns dos scripts do Animador Zero."""
import os
import platform
import subprocess
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
MOTOR = SKILL_DIR / "motor"
HOME_DIR = Path.home() / ".animador-zero"
VENV_DIR = HOME_DIR / "venv"


def say(msg=""):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode("ascii", "replace").decode(), flush=True)


def venv_python():
    p = VENV_DIR / ("Scripts/python.exe" if platform.system() == "Windows" else "bin/python")
    return p if p.exists() else None


def garantir_venv(*modulos):
    """Se este Python nao tem os modulos, roda o script de novo com o Python do ambiente proprio da skill."""
    try:
        for m in modulos:
            __import__(m)
        return
    except ImportError:
        pass
    vp = venv_python()
    if vp and Path(sys.executable).resolve() != vp.resolve():
        sys.exit(subprocess.call([str(vp), *sys.argv]))
    say("FALTA instalar as dependencias. Rode: python scripts/setup.py --instalar")
    sys.exit(2)


def run(cmd, **kw):
    return subprocess.run([str(c) for c in cmd], **kw)


def node_cmd():
    return "node.exe" if platform.system() == "Windows" else "node"

# -*- coding: utf-8 -*-
"""Animador Zero - gera quadros de previa e uma folha de contato para conferir enquadramento e luz.

  python previa.py <pasta-do-projeto> 0.5 4 9.2 15 22.6 30
Sai: <projeto>/previa/quadro_XXXX.jpg e <projeto>/previa.jpg (todos lado a lado).
"""
import glob
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from az_lib import MOTOR, node_cmd, say  # noqa: E402


def main():
    if len(sys.argv) < 3:
        say(__doc__); sys.exit(1)
    proj = Path(sys.argv[1]).resolve()
    tempos = sys.argv[2:]
    for f in glob.glob(str(proj / "previa" / "quadro_*.jpg")):
        os.remove(f)
    r = subprocess.run([node_cmd(), str(MOTOR / "render.mjs"), str(proj), "still", *tempos])
    if r.returncode != 0:
        say("A previa falhou. Veja o erro acima (geralmente um erro de digitacao no roteiro.js)."); sys.exit(r.returncode)
    quadros = sorted(glob.glob(str(proj / "previa" / "quadro_*.jpg")))
    ins = []
    for q in quadros: ins += ["-i", q]
    filt = "".join(f"[{i}]scale=360:-1[v{i}];" for i in range(len(quadros))) + "".join(f"[v{i}]" for i in range(len(quadros))) + f"hstack=inputs={len(quadros)}" if len(quadros) > 1 else "scale=360:-1"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", filt, str(proj / "previa.jpg")])
    say(f"Folha de previa: {proj / 'previa.jpg'}")


if __name__ == "__main__":
    main()

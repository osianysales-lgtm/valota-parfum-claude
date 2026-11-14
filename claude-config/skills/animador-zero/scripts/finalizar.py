# -*- coding: utf-8 -*-
"""Animador Zero - junta imagem, voz e trilha e entrega os arquivos finais.

  python finalizar.py <pasta-do-projeto> [--volume-trilha -11] [--sem-trilha]

Precisa de render-voz.mp4 (gerado pelo motor) e trilha.json. Gera trilha.wav se faltar.
Sai em <projeto>/prontos/:
  <nome>.mp4           qualidade alta (para postar)
  <nome>-celular.mp4   versao leve (menos de 30 MB, para mandar no WhatsApp/celular)
  <nome>-sem-trilha.mp4 so com a voz
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from az_lib import say  # noqa: E402

VOZ = "highpass=f=70,dynaudnorm=f=200:g=11:p=0.9:m=25:s=8,acompressor=threshold=0.08:ratio=3:attack=5:release=120:makeup=2"


def ff(*args):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)])
    if r.returncode != 0:
        say("O ffmpeg falhou (veja acima)."); sys.exit(r.returncode)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--volume-trilha", type=float, default=-11.0)
    ap.add_argument("--sem-trilha", action="store_true")
    a = ap.parse_args()
    proj = Path(a.projeto).resolve()
    vid = proj / "render-voz.mp4"
    if not vid.exists():
        say("Falta render-voz.mp4: renderize o video antes (node motor/render.mjs <projeto> video)."); sys.exit(2)
    nome = proj.name.replace("animador-", "") or "video"
    out = proj / "prontos"; out.mkdir(exist_ok=True)
    voz = proj / "voz.wav"
    mix = proj / "mix.wav"
    if not a.sem_trilha:
        tj, tw = proj / "trilha.json", proj / "trilha.wav"
        if tj.exists() and (not tw.exists() or tw.stat().st_mtime < tj.stat().st_mtime):
            say("Compondo a trilha...")
            subprocess.run([sys.executable, str(Path(__file__).with_name("musica.py")), str(proj)], check=True)
        if tw.exists():
            ff("-i", voz, "-i", tw, "-filter_complex",
               f"[0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,{VOZ},asplit[v][vs];"
               f"[1]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={a.volume_trilha}dB[m];"
               "[m][vs]sidechaincompress=threshold=0.02:ratio=8:attack=10:release=350[md];"
               "[v][md]amix=inputs=2,volume=2,loudnorm=I=-14:TP=-1.5:LRA=11[a]", "-map", "[a]", "-ar", "48000", mix)   # formatos explicitos: o ffmpeg 4.4 nao escolhe sozinho
        else:
            say("Sem trilha.json: saindo so com a voz.")
    seca = proj / "voz-tratada.wav"
    ff("-i", voz, "-af", f"aformat=channel_layouts=stereo,{VOZ},loudnorm=I=-14:TP=-1.5", "-ar", "48000", seca)
    audio = mix if mix.exists() and not a.sem_trilha else seca
    enc = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart"]
    ff("-i", vid, "-i", audio, "-map", "0:v", "-map", "1:a", *enc, "-b:v", "12M", "-maxrate", "16M", "-bufsize", "24M", "-c:a", "aac", "-b:a", "192k", "-shortest", out / f"{nome}.mp4")
    ff("-i", vid, "-i", audio, "-map", "0:v", "-map", "1:a", *enc, "-b:v", "5.6M", "-maxrate", "7M", "-bufsize", "11M", "-c:a", "aac", "-b:a", "160k", "-shortest", out / f"{nome}-celular.mp4")
    if audio != seca:
        ff("-i", vid, "-i", seca, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out / f"{nome}-sem-trilha.mp4")
    for f in sorted(out.glob("*.mp4")):
        say(f"PRONTO: {f}  ({f.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()

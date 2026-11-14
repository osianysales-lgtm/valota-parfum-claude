# -*- coding: utf-8 -*-
"""Animador Zero - prepara um projeto novo a partir do audio da conversa.

  python novo.py "C:/caminho/audio.mp3" [--nome meu-video] [--idioma pt]

Cria a pasta animador-<nome>/ ao lado do audio com:
  voz.wav      audio limpo, com 1,5 s de folga no fim
  env.json     volume da voz quadro a quadro (faz a boca mexer)
  falas.json   transcricao com tempo de cada palavra
  falas.txt    a mesma transcricao, facil de ler
  info.txt     duracao total
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from az_lib import garantir_venv, say  # noqa: E402

garantir_venv("numpy", "faster_whisper")
import numpy as np  # noqa: E402

FPS = 30


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--nome")
    ap.add_argument("--idioma", default="pt")
    ap.add_argument("--modelo", default="medium", help="small (rapido) | medium (padrao) | large-v3 (preciso)")
    a = ap.parse_args()
    src = Path(a.audio).expanduser().resolve()
    if not src.exists():
        say(f"Nao achei o arquivo: {src}"); sys.exit(2)
    nome = a.nome or re.sub(r"[^a-z0-9]+", "-", src.stem.lower()).strip("-")[:40] or "video"
    proj = src.parent / f"animador-{nome}"
    proj.mkdir(exist_ok=True)
    say(f"Pasta do projeto: {proj}")

    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], capture_output=True).stdout
    if not pcm:
        say("Nao consegui ler o audio (o ffmpeg esta instalado?)."); sys.exit(2)
    x = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    x = np.concatenate([x, np.zeros(int(1.5 * 48000), np.float32)])
    dur = len(x) / 48000
    import wave
    with wave.open(str(proj / "voz.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

    win = 48000 / FPS
    rms = np.array([np.sqrt(np.mean(x[int(i * win):int((i + 1) * win)] ** 2) + 1e-12) for i in range(int(np.ceil(len(x) / win)))])
    ref = np.sort(rms)[int(len(rms) * 0.95)] or 1.0
    env = np.minimum(1, (rms / ref) ** 0.7)
    (proj / "env.json").write_text(json.dumps([round(float(v), 3) for v in env]), encoding="utf-8")
    (proj / "info.txt").write_text(f"duracao_total={dur:.2f}\n", encoding="utf-8")
    say(f"Audio: {dur:.2f} s (ja com 1,5 s de folga no fim)")

    say("Transcrevendo (pode levar alguns minutos na primeira vez, baixa o modelo)...")
    from faster_whisper import WhisperModel
    m = WhisperModel(a.modelo, device="cpu", compute_type="int8")
    a16 = x[::3].copy()  # 48 kHz -> 16 kHz
    segs, _ = m.transcribe(a16, language=None if a.idioma == "auto" else a.idioma, word_timestamps=True, vad_filter=False, beam_size=5,
                           initial_prompt="Claude, skill, Blender, 3D.")
    out, linhas = [], []
    for s in segs:
        out.append({"s": round(s.start, 2), "e": round(s.end, 2), "t": s.text.strip(),
                    "w": [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for w in s.words]})
        palavras = " ".join(f"{w.word.strip()}[{w.start:.2f}]" for w in s.words)
        linhas.append(f"{s.start:6.2f}-{s.end:6.2f}  {s.text.strip()}\n        {palavras}")
    (proj / "falas.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    (proj / "falas.txt").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    say("Transcricao:")
    for s in out:
        say(f"  {s['s']:6.2f}-{s['e']:6.2f}  {s['t']}")
    say(f"\nPRONTO. Agora escreva {proj / 'roteiro.js'} e {proj / 'trilha.json'}.")


if __name__ == "__main__":
    main()

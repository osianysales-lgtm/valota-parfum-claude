# -*- coding: utf-8 -*-
"""Serie de bonecos: transforma o dialogo do ElevenLabs (tools/dialogo.js) num projeto do Animador Zero.

  python3 montar.py <pasta-da-parte> <fator> [--bipe=palavra1,palavra2]      ex.: python3 montar.py p1 1.25

Le  : dialogo.json, dialogo_tempos.json, dialogo.mp3
Gera: voz.wav   (acelerado no fator, sem mudar o tom, + 1,5 s de folga)
      env.json  (volume da boca por quadro, ja no tempo novo)
      tempos.js (DUR + FALAS com inicio/fim/palavras no tempo novo, pra o roteiro.js importar)
"""
import json
import subprocess
import sys
from pathlib import Path

FPS = 30


def main():
    proj = Path(sys.argv[1]).resolve()
    F = float(sys.argv[2])
    bipes = [w.lower() for a in sys.argv[3:] if a.startswith("--bipe=") for w in a[7:].split(",")]   # ex.: --bipe=porn
    D = json.loads((proj / "dialogo.json").read_text(encoding="utf-8"))
    T = json.loads((proj / "dialogo_tempos.json").read_text(encoding="utf-8"))

    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(proj / "dialogo.mp3"),
                    "-af", f"atempo={F},apad=pad_dur=1.5", "-ac", "1", "-ar", "48000", str(proj / "voz.wav")], check=True)
    if bipes:   # troca a palavra por um "piii" (mantem o comeco da palavra, como no roteiro: "Vanilla P... piii")
        jan = [(w["start"] / F + 0.07, w["end"] / F + 0.03) for f in T["falas"] for w in f["palavras"]
               if any(w["word"].lower().strip(".,!?…").startswith(b) for b in bipes)]
        if jan:
            cond = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in jan)
            tmp = proj / "voz-sem-bipe.wav"; (proj / "voz.wav").replace(tmp)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-filter_complex",
                            f"[0]volume=0:enable='{cond}'[v];aevalsrc='0.22*sin(2*PI*1000*t)*({cond})':s=48000:d=600[b];"
                            "[v][b]amix=inputs=2:duration=first:normalize=0[o]", "-map", "[o]", "-ac", "1", "-ar", "48000", str(proj / "voz.wav")], check=True)
            print(f"bipe em {len(jan)} palavra(s): " + ", ".join(f"{a:.2f}-{b:.2f}s" for a, b in jan))
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(proj / "voz.wav")], capture_output=True, text=True).stdout)

    boca = T["boca"]
    n = int(dur * FPS) + 1
    env, bocas = [], {q: [] for q in boca}
    for i in range(n):
        k = int(round(i * F))
        vals = {q: ((arr[k] or 0) if k < len(arr) else 0) for q, arr in boca.items()}
        for q, v in vals.items():
            bocas[q].append(round(v, 3))
        env.append(round(max(vals.values() or [0]), 3))
    (proj / "env.json").write_text(json.dumps(env), encoding="utf-8")

    falas = []
    for i, f in enumerate(T["falas"]):
        orig = D["falas"][i]
        falas.append({
            "quem": f["quem"], "ini": round(f["inicio"] / F, 2), "fim": round(f["fim"] / F, 2),
            "texto": orig.get("legenda", orig["texto"]),
            "palavras": [[w["word"], round(w["start"] / F, 2), round(w["end"] / F, 2)] for w in f["palavras"]],
        })
    js = (f"// gerado por montar.py (fator {F}) - nao editar a mao\n"
          f"export const DUR = {round(dur, 2)};\n"
          f"export const FALAS = {json.dumps(falas, ensure_ascii=False)};\n"
          f"export const BOCA = {json.dumps(bocas)};\n")
    (proj / "tempos.js").write_text(js, encoding="utf-8")
    (proj / "info.txt").write_text(f"duracao_total={dur:.2f}\nfator={F}\n", encoding="utf-8")
    print(f"voz.wav {dur:.2f}s (fator {F})")
    for f in falas:
        print(f"  {f['ini']:6.2f}-{f['fim']:6.2f}  {f['quem']}: {f['texto']}")


if __name__ == "__main__":
    main()

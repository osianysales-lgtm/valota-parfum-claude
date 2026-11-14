# -*- coding: utf-8 -*-
"""Animador Zero - compoe a trilha cinematografica original (sintetizada, sem samples de terceiros).

  python musica.py <pasta-do-projeto>      (le trilha.json, grava trilha.wav)

Estrutura: misterio -> (trecho "feio" com musiquinha barata) -> subida -> BOOM da revelacao -> trilha epica
com impactos nas palavras-chave -> respiro -> boom final. Todos os tempos vem do trilha.json.
"""
import os, sys, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from az_lib import garantir_venv  # noqa: E402
garantir_venv("numpy", "scipy")
import numpy as np  # noqa: E402

SR = 44100
DUR = 37.5
N = int(DUR * SR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)       # seco
VL = np.zeros(N); VR = np.zeros(N)     # envio para o reverb


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR


def add(sig, t0, pan=0.0, g=1.0, verb=0.3):
    i = int(t0 * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i] * g
    l, r = sig * (1 - pan * 0.6), sig * (1 + pan * 0.6)
    L[i:i + len(sig)] += l; R[i:i + len(sig)] += r
    VL[i:i + len(sig)] += l * verb; VR[i:i + len(sig)] += r * verb


def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for k in range(0, len(x), 4096):          # filtro de 1 polo em blocos (rapido o bastante)
        seg = x[k:k + 4096]
        from scipy.signal import lfilter
        out, zi = lfilter([a], [1, a - 1], seg, zi=[acc * (1 - a)])
        y[k:k + 4096] = out; acc = out[-1] if len(out) else acc
    return y


def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)


def saw(f, t, det=0.0):
    ph = (f * (1 + det) * t) % 1.0
    return 2 * ph - 1


# ---------------- instrumentos ----------------
def boom(d=3.5, f0=95, f1=32, g=1.0):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.25)
    n = rng.standard_normal(len(t)); n = lp(n, 0.08) * np.exp(-t * 9) * 1.6
    return (np.tanh(1.6 * sub) * 0.9 + n * 0.5) * g


def impact():                      # pancada de trailer: boom + corpo metalico + ruido
    t = tt(2.6)
    metal = sum(np.sin(2 * np.pi * f * t + p) * np.exp(-t * dk) for f, dk, p in [(180, 3, 0), (271, 4, 1), (402, 5, 2), (613, 7, 3)]) * 0.12
    n = lp(rng.standard_normal(len(t)), 0.25) * np.exp(-t * 14) * 0.7
    b = boom(2.6)
    return b + metal + n


def whoosh(d, up=True):
    t = tt(d); n = rng.standard_normal(len(t)); x = t / d
    a = 0.02 + 0.5 * (x if up else 1 - x) ** 2
    out = np.zeros_like(n); y = 0.0
    from scipy.signal import lfilter
    for k in range(0, len(n), 2048):
        aa = a[k]; seg, _ = lfilter([aa], [1, aa - 1], n[k:k + 2048], zi=[y * (1 - aa)]); out[k:k + 2048] = seg; y = seg[-1]
    return out * np.sin(np.pi * x) ** 2 * 0.9


def riser(d):
    t = tt(d); x = t / d
    tone = sum(np.sin(2 * np.pi * np.cumsum(f0 * 2 ** (2.5 * x ** 2)) / SR) for f0 in (110, 165, 220.5)) * 0.08
    n = rng.standard_normal(len(t)) * 0.18
    return (tone + n * x) * x ** 2.2 * (1 - np.exp(-(d - t) * 60))


def reverse_cym(d):
    t = tt(d); n = np.diff(np.diff(rng.standard_normal(len(t) + 2)))
    return (n * np.exp(-(d - t) * 2.2) * 0.12)


def crash():
    t = tt(2.2); return np.diff(np.diff(rng.standard_normal(len(t) + 2))) * np.exp(-t * 2.3) * 0.07


def pad(ms, d, bright=0.25, att=0.8, rel=1.2):
    t = tt(d); s = np.zeros_like(t)
    for m in ms:
        f = hz(m)
        for det in (-0.004, 0.0, 0.005):
            s += saw(f, t, det)
    s = lp(s, 0.02 + 0.06 * bright) * (1.0 / len(ms))
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    return s * env * 0.5


def drone(d):
    t = tt(d); f = hz(38)
    s = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.003 * t) + 0.3 * saw(f * 3, t) * 0.4
    return lp(s, 0.05) * np.minimum(1, t / 1.5) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.13 * t)) * 0.35


def heart():
    t = tt(0.5); f = 40 + 30 * np.exp(-t * 25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    return s * 0.55


def tick():
    t = tt(0.03); return np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t * 220) * 0.12


def tom(f0=90):
    t = tt(0.9); f = f0 * (1 + 0.6 * np.exp(-t * 18))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) + lp(rng.standard_normal(len(t)), 0.3) * np.exp(-t * 30) * 0.4
    return np.tanh(s * 1.4) * 0.5


def ost(m, d):                     # ostinato grave pulsante
    t = tt(d); f = hz(m)
    s = saw(f, t) + 0.5 * saw(f, t, 0.006)
    return lp(s, 0.07) * np.minimum(1, t / 0.004) * np.exp(-t * 7) * 0.32


def stab(ms, d=1.2):
    t = tt(d); s = np.zeros_like(t)
    for m in ms:
        for det in (-0.006, 0.0, 0.007): s += saw(hz(m), t, det)
    return lp(s, 0.18) / len(ms) * np.minimum(1, t / 0.006) * np.exp(-t * 3.5) * 0.35


def pluck(m, d=0.8, v=1.0):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)) * np.exp(-t * 5) * (1 - np.exp(-t * 500)) * 0.16 * v


def cheap(m, d):                   # timbre barato do "antes": onda quadrada fina, sem vida
    t = tt(d); f = hz(m)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5
    return s * np.minimum(1, t / 0.005) * np.minimum(1, np.maximum(0, (d - t) / 0.02)) * 0.07


def womp():                        # "uoon" descendo (vergonha do Claude)
    t = tt(0.9); f = 233 * 2 ** (-t * 0.9)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    return lp(s, 0.12) * np.minimum(1, t / 0.02) * np.exp(-t * 2.2) * 0.25


def shutter():
    t = tt(0.12); n = rng.standard_normal(len(t))
    a = n * (np.exp(-t * 180) + 0.7 * np.exp(-np.maximum(t - 0.06, 0) * 200) * (t > 0.06))
    return a * 0.35


def switch():
    t = tt(0.4); c = rng.standard_normal(len(t)) * np.exp(-t * 300) * 0.5
    hum = np.sin(2 * np.pi * 120 * t) * np.minimum(1, t / 0.05) * np.exp(-t * 3) * 0.12
    return c + hum


def key_click():
    t = tt(0.04); return lp(rng.standard_normal(len(t)), 0.5) * np.exp(-t * 160) * 0.18


def counter_tick(p):
    t = tt(0.05); return np.sin(2 * np.pi * (1800 + 900 * p) * t) * np.exp(-t * 90) * 0.06



# ---------------- arranjo guiado pelo trilha.json ----------------
def compor(cfg):
    global DUR, N, L, R, VL, VR
    DUR = float(cfg["dur"]); N = int(DUR * SR)
    L = np.zeros(N); R = np.zeros(N); VL = np.zeros(N); VR = np.zeros(N)
    feio = cfg.get("feio")
    rev = cfg.get("revelacao", feio[1] if feio else min(8.0, DUR * 0.25))
    resp = cfg.get("respiro")
    fim = cfg.get("final", DUR - 4.5)
    BPM = 100; B = 60 / BPM
    DM, BB, FM, CM = [50, 53, 57], [46, 50, 53], [45, 48, 53], [48, 52, 55]
    calma_ate = feio[0] if feio else rev
    # abertura: boom + impacto no titulo
    add(boom(4.0, 110, 30, 1.0), 0.0, verb=0.5)
    t_tit = cfg.get("titulo", 0.28)
    if t_tit is not None:
        add(impact(), t_tit, g=0.8, verb=0.6); add(whoosh(0.45), t_tit + 0.34, pan=-0.4, g=0.6)
    if cfg.get("risco") is not None:
        add(impact() * 0.55, cfg["risco"], verb=0.6)
    # misterio ate o "antes" (ou ate a revelacao)
    add(drone(calma_ate + 0.4), 0.0, g=1.0, verb=0.4)
    add(pad([m + 12 for m in DM], calma_ate + 0.2, 0.15, 2.5, 0.25), 0.2, g=0.8, verb=0.6)
    for k, t0 in enumerate(np.arange(2.0, calma_ate - 0.3, B / 2)):
        add(tick(), t0, pan=0.35 if k % 2 else -0.35, g=0.8 + 0.2 * (k % 2), verb=0.2)
    for t0 in np.arange(2.0, calma_ate - 0.3, B * 2):
        add(heart(), t0, g=0.9); add(heart() * 0.6, t0 + 0.24)
    if cfg.get("digitando"):
        a, b = cfg["digitando"]
        for t0 in np.arange(a, b, 0.105):
            add(key_click(), t0 + rng.uniform(-0.02, 0.02), pan=0.2, g=rng.uniform(0.6, 1.0), verb=0.05)
    if calma_ate > 1.2:
        add(riser(1.0), calma_ate - 1.0, g=0.6)
    # o "antes" feio: musiquinha barata
    if feio:
        mel = [(62, 0.3), (65, 0.3), (69, 0.6), (67, 0.3), (65, 0.3), (64, 0.6), (62, 0.3), (60, 0.3), (62, 0.9)]
        t0 = feio[0] + 0.07; stop = rev - 1.4
        while t0 < stop:
            for m, d in mel:
                if t0 >= stop: break
                add(cheap(m + 12, d * 0.9), t0, g=0.9, verb=0.0); t0 += d
        for t0 in np.arange(feio[0] + 0.07, stop, 0.6):
            add(cheap(38 + (0 if int((t0 - feio[0]) / 1.2) % 2 == 0 else 5), 0.25), t0, g=1.2, verb=0.0)
        for w in cfg.get("vergonha", []):
            add(womp(), w, g=0.9, verb=0.1)
    # subida e revelacao
    add(riser(1.32), rev - 1.32, g=1.0, verb=0.3); add(reverse_cym(1.3), rev - 1.3, g=1.0, verb=0.2); add(whoosh(0.9), rev - 0.87, pan=0.3, g=0.6)
    add(boom(4.5, 120, 28, 1.25), rev, verb=0.7); add(impact(), rev, g=1.0, verb=0.8); add(crash(), rev, verb=0.6); add(whoosh(0.8, up=False), rev, pan=-0.3, g=0.7)
    # trilha epica
    epic_fim = resp[0] if resp else fim
    prog = [DM, BB, FM, CM]; bar = 4 * B; t0 = rev; i = 0
    while t0 < epic_fim:
        ch = prog[i % 4]
        add(pad([m + 12 for m in ch] + [ch[0] + 24], bar + 0.6, 0.35 if t0 > rev + 5 else 0.22, 0.4, 0.6), t0, g=1.1, verb=0.6)
        for s in range(8):
            tt0 = t0 + s * B / 2
            if tt0 >= epic_fim: break
            add(ost(ch[0] - 12 + (12 if s in (3, 6) else 0), B / 2 * 0.95), tt0, g=1.0, verb=0.15)
            if tt0 > rev + 1.4 and s in (0, 3, 6): add(tom(80 if s == 0 else 105), tt0, pan=-0.2 if s == 3 else 0.2, g=0.9, verb=0.4)
            if tt0 > rev + 5 and s % 2 == 1: add(tick() * 1.4, tt0, pan=0.4, verb=0.2)
            if tt0 > rev + 5 and s in (1, 4, 6): add(pluck(ch[(s + i) % 3] + 24, 0.7, 0.7), tt0, pan=-0.35 if s % 2 else 0.35, verb=0.6)
        t0 += bar; i += 1
    if cfg.get("contador"):
        a, b = cfg["contador"]
        for p, t0 in enumerate(np.linspace(a, b, 18)): add(counter_tick(p / 18), t0, pan=0.25, g=0.9, verb=0.2)
        add(stab([62, 65, 69, 74], 1.6), b + 0.05, g=0.9, verb=0.6); add(crash() * 0.6, b + 0.05)
    for k, t0 in enumerate(cfg.get("impactos", [])):
        sfx = [shutter, switch, None, None][k % 4]
        if sfx: add(sfx(), t0, pan=0.2, g=1.0, verb=0.3)
        if k % 4 == 2: add(whoosh(0.7), t0 - 0.18, pan=0.5, g=0.8)
        add(impact() * 0.7, t0, verb=0.6)
        if k == len(cfg["impactos"]) - 1 and len(cfg["impactos"]) >= 3:
            add(boom(3.0, 100, 30, 1.0), t0, verb=0.7); add(stab([62, 65, 69, 74], 1.8), t0, verb=0.7); add(crash(), t0, verb=0.6)
    for t0 in cfg.get("viradas", []):
        add(whoosh(0.5), t0 - 0.15, pan=0.4 if int(t0) % 2 else -0.4, g=0.5)
    # respiro
    if resp:
        a, b = resp
        add(pad([m + 12 for m in BB], b - a + 0.2, 0.12, 0.3, 1.0), a, g=1.0, verb=0.8); add(drone(b - a + 0.2) * 0.7, a, verb=0.4)
        for k, t0 in enumerate([b - 0.77, b - 0.57, b - 0.37]): add(pluck(74 + [0, 3, 7][k], 0.5, 0.9), t0, pan=0.3, verb=0.5)
        add(riser(0.6), b - 0.6, g=0.6)
    # final
    add(boom(4.5, 110, 28, 1.2), fim, verb=0.8); add(impact(), fim, verb=0.8); add(crash(), fim, verb=0.7)
    add(pad([m + 12 for m in DM] + [74, 81], DUR - fim, 0.35, 0.2, 2.5), fim, g=1.2, verb=0.8)
    for k in range(8): add(ost(38 + (12 if k in (3, 6) else 0), B / 2 * 0.95), fim + k * B / 2, g=0.8 * (1 - k / 10), verb=0.2)
    # reverb e masterizacao
    ir_n = int(2.8 * SR); t = np.arange(ir_n) / SR
    def ir():
        x = rng.standard_normal(ir_n) * np.exp(-t * 2.3); x[: int(0.012 * SR)] = 0
        return lp(x, 0.35)
    def conv(x, h):
        n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
        return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]
    wl, wr = conv(VL, ir()), conv(VR, ir())
    k = 0.6 * max(np.abs(L).max(), 1e-9) / max(np.abs(wl).max(), 1e-9) * 0.5
    Lo = L + wl * k; Ro = R + wr * k
    fo = int(1.5 * SR); Lo[-fo:] *= np.linspace(1, 0, fo); Ro[-fo:] *= np.linspace(1, 0, fo)
    Lo = np.tanh(Lo / np.abs(Lo).max() * 1.3); Ro = np.tanh(Ro / np.abs(Ro).max() * 1.3)
    pk = max(np.abs(Lo).max(), np.abs(Ro).max()); Lo *= 0.85 / pk; Ro *= 0.85 / pk
    return (np.stack([Lo, Ro], 1) * 32767).astype(np.int16)


if __name__ == "__main__":
    import json, sys
    from pathlib import Path
    proj = Path(sys.argv[1]).resolve()
    cfg = json.loads((proj / "trilha.json").read_text(encoding="utf-8"))
    out = compor(cfg)
    with wave.open(str(proj / "trilha.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
    print("trilha pronta:", proj / "trilha.wav", cfg["dur"], "s")

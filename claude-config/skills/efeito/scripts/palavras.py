#!/usr/bin/env python3
"""Acha quando cada palavra é falada, para o efeito cair na palavra certa.

uso: bash scripts/efeito palavras VIDEO [--idioma pt] [--modelo small]
Imprime "12.34  palavra" por linha e salva VIDEO.palavras.json ao lado do vídeo.
Na primeira vez instala o faster-whisper e baixa o modelo (small: ~500 MB). Se a internet bloquear o download
(acontece no Claude do navegador), peça o segundo exato à pessoa em vez de usar a palavra.
"""
import argparse, json, os, subprocess, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--idioma', default='pt', help='pt, en, es... ou "auto"')
ap.add_argument('--modelo', default='small', help='tiny, base, small, medium')
a = ap.parse_args()

# áudio mono 16 kHz direto do ffmpeg, passado como array (evita problemas de versão do decodificador)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True).stdout
if not raw: sys.exit('esse vídeo não tem áudio')
audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0

try:
    from faster_whisper import WhisperModel
except ImportError:
    print('Instalando o transcritor (uma vez, cerca de 1 minuto)...', flush=True)
    r = subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'faster-whisper'])
    if r.returncode: r = subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', '--user', '--break-system-packages', 'faster-whisper'])
    if r.returncode: sys.exit('NAO_DEU: não consegui instalar o transcritor; peça à pessoa o segundo exato')
    from faster_whisper import WhisperModel
try:
    model = WhisperModel(a.modelo, device='cpu', compute_type='int8')
except Exception as e:
    sys.exit(f'NAO_DEU: não consegui baixar o modelo de transcrição ({type(e).__name__}); peça à pessoa o segundo exato')
segs, _ = model.transcribe(audio, language=None if a.idioma == 'auto' else a.idioma, word_timestamps=True, vad_filter=True)
words = [{'p': w.word.strip(), 'ini': round(w.start, 2), 'fim': round(w.end, 2)} for s in segs for w in (s.words or [])]

out = os.path.splitext(a.video)[0] + '.palavras.json'
json.dump(words, open(out, 'w'), ensure_ascii=False, indent=0)
for w in words: print(f"{w['ini']:7.2f}  {w['p']}")
print(f'\n{len(words)} palavras salvas em {out}')

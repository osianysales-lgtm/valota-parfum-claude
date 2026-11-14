import wave, json, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("mobiuslabsgmbh/faster-whisper-large-v3-turbo", device="cpu", compute_type="int8")
w = wave.open("audio/cortado.wav"); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
segs,_ = m.transcribe(a, language="pt", word_timestamps=True, beam_size=5,
    initial_prompt="Glitch, Mykonos, Indonésia, hypado, Creed Aventus Absolu, Hacivat Nishane, abacaxi, esfumaçado, borrifador, projeção, fixação.")
out=[{"word":x.word.strip(),"start":round(x.start,2),"end":round(x.end,2)} for s in segs for x in s.words]
json.dump(out, open("audio/cortado.json","w"), ensure_ascii=False, indent=0)
print(" ".join(f"[{x['start']}]{x['word']}" for x in out))

# v28 · ritmo do v24 no AVATAR: corta as pausas da voz 1x (máx. CAP s entre palavras, margem M) ANTES da HeyGen.
# Gera narracao.mp3 cortada (1x) + narracao_palavras.json nos tempos cortados (1x). A aceleração vem só no MP4 final.
import sys,json,wave,numpy as np
D=sys.argv[1]; CAP=0.26; M=0.08
w=wave.open(D+'/qa/n1x.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32); w.close()
P=json.load(open(D+'/narracao_1x_palavras.json'))['palavras']
keep=[]; cuts=[]; cur=[max(0,P[0]['start']-M),None]
for i in range(len(P)-1):
    e=P[i]['end']; n=P[i+1]['start']
    if n-e>CAP:
        a=e+max(M,CAP/2); b=n-max(M,CAP/2)
        if b>a: cur[1]=a; keep.append(cur); cuts.append((a,b)); cur=[b,None]
cur[1]=min(len(x)/sr,P[-1]['end']+0.35); keep.append(cur)
f=int(0.005*sr); out=[]
for a,b in keep:
    s=x[int(a*sr):int(b*sr)].copy()
    if len(s)>3*f: s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    out.append(s)
y=np.concatenate(out).astype(np.int16)
o=wave.open(D+'/qa/ncut.wav','wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(y.tobytes()); o.close()
def mp(t):
    acc=0
    for a,b in keep:
        if t<a: return acc
        if t<=b: return acc+(t-a)
        acc+=b-a
    return acc
NP=[{'word':p['word'],'start':round(mp(p['start']),3),'end':round(mp(p['end']),3)} for p in P]
json.dump({'fonte':'elevenlabs 1x -> pausas <=0,26 s (ritmo v24, aceleração só no final)','palavras':NP},open(D+'/narracao_palavras.json','w'),ensure_ascii=False,indent=1)
open(D+'/silencios.txt','w').write('\n'.join(f'{a:.3f}\t{b:.3f}' for a,b in cuts))
dur=len(y)/sr
print('cortes',len(cuts),'removido',round(sum(b-a for a,b in cuts),1),'s · voz cortada',round(dur,2),'s · palavras/s cortada',round(len(P)/NP[-1]['end'],2))
for R in (1.2,1.25,1.3): print(f'  final {R}x → fala {NP[-1]["end"]/R:.1f} s · {len(P)/(NP[-1]["end"]/R):.2f} palavras/s')

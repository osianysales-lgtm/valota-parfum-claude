import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
FF='../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg'
r=[x for x in json.load(open('pausas_removidas.json')) if x[1]-x[0]>0.3]
jobs=[]
for k,(s,e) in enumerate(r):
    for j,t in enumerate((s+0.03,(s+e)/2,e-0.03)): jobs.append((f'folhas/rem/r{k:02d}_{j}.jpg',t))
def go(a):
    o,t=a; subprocess.run([FF,'-v','error','-y','-ss',f'{t:.2f}','-i',os.path.expanduser('~/Downloads/glitch.MOV'),'-frames:v','1','-vf',f"scale=180:320,drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='{t:.2f}':x=3:y=3:fontsize=18:fontcolor=yellow:box=1:boxcolor=black",o],check=True)
list(ThreadPoolExecutor(6).map(go,jobs))
open('folhas/rem/lista.txt','w').write('\n'.join(f"file '{os.path.abspath(o)}'" for o,_ in jobs))
subprocess.run([FF,'-v','error','-y','-f','concat','-safe','0','-i','folhas/rem/lista.txt','-vf','tile=9x8','-frames:v','1','folhas/removidos.jpg'],check=True)
print(len(jobs))

import subprocess, sys, os
FF='../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg'
src, out, rate = sys.argv[1], sys.argv[2], sys.argv[3]
cols = sys.argv[4] if len(sys.argv)>4 else '7x4'
vf = f"fps={rate},scale=216:384,drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='%{{pts\\:hms}}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black,tile={cols}"
extra = sys.argv[5:]  # e.g. -ss -t
subprocess.run([FF,'-v','error','-y',*extra,'-i',os.path.expanduser(src),'-vf',vf,'-frames:v','1',out],check=True)

#!/usr/bin/env python3
"""Prepara um vídeo para receber um efeito.

uso: bash scripts/efeito preparar VIDEO --inicio 3.0 --fim 6.5 [--saida PASTA] [--nome FINAL.mp4]

Cria a pasta de trabalho (padrão: ao lado do vídeo, "<video>_efeito/"; se ali não der para gravar, em ~/efeito-trabalho/) com:
  base.mp4        o vídeo inteiro em 1080x1920, 30 fps, com o áudio original (enquadrado no rosto se for horizontal)
  quadros/        os quadros do trecho do efeito (0001.jpg = o instante --inicio)
  recorte/        a pessoa recortada do fundo, quadro a quadro (webp com transparência)
  amostras/       12 fotos espalhadas pelo vídeo inteiro (servem de "reels" quando a pessoa não manda imagens)
  imagens/        pasta vazia para imagens que a pessoa mandar (foto de perfil, prints de reels...)
  info.json       tempos, tamanho, e a caixa do rosto em cada quadro
  visao.jpg       6 quadros do trecho com o rosto marcado, para o Claude olhar antes de criar
  efeito.js       o esqueleto onde o efeito é escrito (não é sobrescrito se já existir)
O vídeo final vai ao lado do original; no Claude do navegador, para /mnt/user-data/outputs (para baixar).
"""
import argparse, json, os, shutil, subprocess, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1080, 1920, 30


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"erro no ffmpeg:\n{r.stderr[-1500:]}")
    return r.stdout


def probe(path):
    """largura, altura (já girada), duração e se tem áudio, lendo a saída do ffmpeg (sem ffprobe)."""
    import re
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    v = re.search(r'Stream #[^\n]*Video:[^\n]*?(\d{2,5})x(\d{2,5})', err)
    if not m or not v:
        sys.exit('não consegui ler esse vídeo (formato estranho ou arquivo corrompido)')
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    w, h = int(v.group(1)), int(v.group(2))
    rot = re.search(r'rotation of (-?[\d.]+)|rotate\s*:\s*(-?\d+)', err)
    if rot and abs(round(float(rot.group(1) or rot.group(2)))) % 180 == 90: w, h = h, w
    return w, h, dur, ('Audio:' in err)


def pick_face(dets, mask, prev, iw, ih):
    """Entre os rostos achados, o da pessoa recortada (um rosto num telão ou quadro não está no recorte);
    empate: o mais perto do rosto do quadro anterior."""
    best, best_s = None, -1e9
    for d in dets:
        b = d.location_data.relative_bounding_box
        x0, y0 = max(0, int(b.xmin * iw)), max(0, int(b.ymin * ih))
        x1, y1 = min(iw, int((b.xmin + b.width) * iw)), min(ih, int((b.ymin + b.height) * ih))
        if x1 <= x0 or y1 <= y0: continue
        cover = float(mask[y0:y1, x0:x1].mean()) if mask is not None else 0.5
        s = cover * 2 + d.score[0] * 0.5
        if prev is not None:
            cx, cy = b.xmin + b.width / 2, b.ymin + b.height / 2
            s -= abs(cx - prev[0]) + abs(cy - prev[1])
        if s > best_s: best, best_s = (b, cover), s
    if best is None: return None
    b, cover = best
    if mask is not None and cover < 0.3: return None                 # não está na pessoa: telão, foto, reflexo
    if prev is not None:
        cx, cy = b.xmin + b.width / 2, b.ymin + b.height / 2
        if abs(cx - prev[0]) + abs(cy - prev[1]) > 0.18 or not (0.55 < b.width / prev[2] < 1.8):
            return None                                               # pulo grande: mantém o rosto anterior
    return b


def face_x_guess(path, dur, w, h):
    """Para vídeos horizontais: onde (0..1) está o rosto na horizontal, olhando 7 quadros."""
    import mediapipe as mp
    xs = []
    with mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.4) as fd, \
         mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0) as seg:
        for k in range(7):
            t = dur * (k + 0.5) / 7
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', path, '-frames:v', '1',
                                  '-vf', 'scale=640:-2', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
            hh = round(640 * h / w / 2) * 2
            if len(raw) < 640 * hh * 3: continue
            img = np.frombuffer(raw[:640 * hh * 3], np.uint8).reshape(hh, 640, 3)
            r = fd.process(img)
            if r.detections:
                b = pick_face(r.detections, seg.process(img).segmentation_mask, None, 640, hh)
                if b: xs.append(b.xmin + b.width / 2)
    return float(np.median(xs)) if xs else 0.5


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--inicio', type=float, default=0.0)
    ap.add_argument('--fim', type=float, default=None)
    ap.add_argument('--saida', default=None, help='pasta de trabalho (padrão: <video>_efeito ao lado do vídeo)')
    ap.add_argument('--nome', default=None, help='arquivo final (padrão: <video>_efeito.mp4 ao lado do vídeo)')
    a = ap.parse_args()

    src = os.path.abspath(a.video)
    if not os.path.exists(src): sys.exit(f'não achei o vídeo: {src}')
    stem = os.path.splitext(os.path.basename(src))[0]
    vdir = os.path.dirname(src)
    gravavel = os.access(vdir, os.W_OK)
    out = os.path.abspath(a.saida or os.path.join(vdir if gravavel else os.path.expanduser('~/efeito-trabalho'), f'{stem}_efeito'))
    os.makedirs(out, exist_ok=True)
    w, h, dur, has_audio = probe(src)
    t0 = max(0.0, a.inicio)
    t1 = min(dur, a.fim if a.fim is not None else dur)
    if t1 - t0 < 0.3: sys.exit(f'trecho muito curto ({t0:.2f}s a {t1:.2f}s); o vídeo tem {dur:.2f}s')

    # 1. base.mp4: 1080x1920 30 fps. Vertical: preenche e corta o excesso; horizontal: corta 9:16 em volta do rosto.
    if w / h > W / H + 0.01:
        fx = face_x_guess(src, dur, w, h)
        sw = round(w * H / h / 2) * 2
        cx = int(min(max(fx * sw - W / 2, 0), sw - W))
        vf = f'scale={sw}:{H}:flags=lanczos,crop={W}:{H}:{cx}:0'
    else:
        vf = f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}'
    print('1/4 deixando o vídeo em 1080x1920...', flush=True)
    cmd = ['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', f'{vf},fps={FPS},setsar=1', '-c:v', 'libx264', '-crf', '18',
           '-preset', 'fast', '-pix_fmt', 'yuv420p']
    cmd += ['-c:a', 'aac', '-b:a', '256k'] if has_audio else ['-an']
    sh(cmd + [os.path.join(out, 'base.mp4')])

    # cortes de câmera dentro do trecho: o recorte e o rosto mudam de repente num corte, então avisamos
    r = subprocess.run(['ffmpeg', '-v', 'info', '-ss', f'{t0:.3f}', '-t', f'{t1 - t0:.3f}', '-i', os.path.join(out, 'base.mp4'),
                        '-vf', "select='gt(scene,0.35)',showinfo", '-an', '-f', 'null', '-'], capture_output=True, text=True)
    cortes = [round(t0 + float(x.split('pts_time:')[1].split()[0]), 2) for x in r.stderr.splitlines() if 'pts_time:' in x]
    cortes = [c for c in cortes if t0 + 0.15 < c < t1 - 0.15]

    # 2. quadros do trecho
    print('2/4 extraindo os quadros do trecho...', flush=True)
    qd = os.path.join(out, 'quadros'); rd = os.path.join(out, 'recorte')
    for d in (qd, rd): shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    sh(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t0:.3f}', '-i', os.path.join(out, 'base.mp4'), '-t', f'{t1 - t0:.3f}',
        '-q:v', '2', os.path.join(qd, '%04d.jpg')])
    names = sorted(os.listdir(qd)); n = len(names)

    # 3. recorte da pessoa + rosto, quadro a quadro
    print(f'3/4 recortando a pessoa e achando o rosto ({n} quadros)...', flush=True)
    import mediapipe as mp
    faces, prev, last_c = [], None, None
    with mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0) as seg, \
         mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.4) as fd:
        for i, nm in enumerate(names):
            bgr = cv2.imread(os.path.join(qd, nm)); rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            m = seg.process(rgb).segmentation_mask.astype(np.float32)
            if prev is not None: m = 0.7 * m + 0.3 * prev               # menos tremida na borda
            prev = m
            alpha = np.clip((m - 0.3) / 0.4, 0, 1)
            alpha = cv2.GaussianBlur(alpha, (5, 5), 0)
            rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
            Image.fromarray(rgba, 'RGBA').save(os.path.join(rd, nm.replace('.jpg', '.webp')), quality=88)
            r = fd.process(rgb)
            b = pick_face(r.detections, m, last_c, W, H) if r.detections else None
            if b:
                faces.append([b.xmin * W, b.ymin * H, b.width * W, b.height * H])
                last_c = (b.xmin + b.width / 2, b.ymin + b.height / 2, b.width)
            else:
                faces.append(None)
            if (i + 1) % 30 == 0: print(f'   {i + 1}/{n}', flush=True)

    # preenche quadros sem rosto e suaviza (mediana de 5 + média móvel), para nada "pular"
    found = [f for f in faces if f]
    if not found:
        print('AVISO: não achei rosto no trecho. Usando o centro do terço de cima como "rosto".')
        faces = [[W * 0.32, H * 0.22, W * 0.36, H * 0.22]] * n
    else:
        last = found[0]
        for i in range(n):
            if faces[i] is None: faces[i] = last
            else: last = faces[i]
    F = np.array(faces, dtype=np.float32)
    med = np.array([np.median(F[max(0, i - 2):i + 3], axis=0) for i in range(n)])
    k = np.array([1, 2, 3, 2, 1], np.float32); k /= k.sum()
    pad = np.pad(med, ((2, 2), (0, 0)), mode='edge')
    sm = np.stack([np.convolve(pad[:, j], k, mode='valid') for j in range(4)], 1)
    rosto = [[round(float(v), 1) for v in r] for r in sm]

    # 4. amostras do vídeo inteiro, pasta de imagens, esqueleto do efeito, info
    print('4/4 amostras e esqueleto...', flush=True)
    ad = os.path.join(out, 'amostras'); shutil.rmtree(ad, ignore_errors=True); os.makedirs(ad)
    for j in range(12):
        t = dur * (j + 0.5) / 12
        sh(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.3f}', '-i', os.path.join(out, 'base.mp4'), '-frames:v', '1',
            '-vf', 'scale=540:960', '-q:v', '3', os.path.join(ad, f'a{j + 1:02d}.jpg')])
    os.makedirs(os.path.join(out, 'imagens'), exist_ok=True)
    if not os.path.exists(os.path.join(out, 'efeito.js')): shutil.copy(os.path.join(SKILL, 'modelo', 'efeito.js'), out)

    nuvem = '/mnt/user-data/outputs'                                   # Claude do navegador: pasta de downloads
    if a.nome: final = os.path.abspath(a.nome)
    elif os.path.isdir(nuvem) and os.access(nuvem, os.W_OK): final = os.path.join(nuvem, f'{stem}_efeito.mp4')
    else: final = os.path.join(vdir if gravavel else out, f'{stem}_efeito.mp4')
    info = {'largura': W, 'altura': H, 'fps': FPS, 'quadros': n, 'inicio': round(t0, 3), 'fim': round(t0 + n / FPS, 3),
            'duracao': round(n / FPS, 3), 'duracao_video': round(dur, 3), 'video': src, 'final': final, 'cortes': cortes, 'rosto': rosto}
    json.dump(info, open(os.path.join(out, 'info.json'), 'w'))

    # visão: 6 quadros com o rosto marcado e as faixas livres
    thumbs = []
    for j in range(6):
        i = min(n - 1, int((j + 0.5) * n / 6))
        im = Image.open(os.path.join(qd, names[i])).convert('RGB')
        d = ImageDraw.Draw(im); x, y, fw, fh = rosto[i]
        d.rectangle([x, y, x + fw, y + fh], outline=(255, 60, 60), width=8)
        thumbs.append(im.resize((270, 480)))
    sheet = Image.new('RGB', (270 * 6 + 50, 500), (20, 20, 20))
    for j, im in enumerate(thumbs): sheet.paste(im, (10 + j * 278, 10))
    sheet.save(os.path.join(out, 'visao.jpg'), quality=85)

    x, y, fw, fh = np.mean(sm, axis=0)
    print('\nPRONTO')
    print(f'pasta: {out}')
    print(f'trecho: {t0:.2f}s a {t0 + n / FPS:.2f}s ({n} quadros)')
    print(f'rosto (média, em 1080x1920): x {x:.0f}-{x + fw:.0f}, y {y:.0f}-{y + fh:.0f}; centro ({x + fw / 2:.0f}, {y + fh / 2:.0f})')
    print(f'livre acima da cabeça: y 0-{max(0, y - fh * 0.35):.0f}  |  abaixo do queixo: y {y + fh * 1.15:.0f}-1920')
    larg = sm[:, 2]
    if larg.max() / max(1.0, larg.min()) > 1.6:
        i_min, i_max = int(larg.argmin()), int(larg.argmax())
        print(f'AVISO: a câmera aproxima ou afasta bastante no trecho (o rosto vai de {larg.min():.0f} a {larg.max():.0f} px, '
              f'perto de {t0 + min(i_min, i_max) / FPS:.2f}s-{t0 + max(i_min, i_max) / FPS:.2f}s). Prefira um trecho com '
              f'enquadramento estável, ou acompanhe k.rosto em tudo.')
    if cortes:
        print(f'AVISO: corte de câmera no trecho em {", ".join(f"{c:.2f}s" for c in cortes)}. O recorte e o rosto mudam no corte; '
              f'prefira um trecho sem corte (rode de novo com outro --inicio/--fim) ou um efeito que aguente a troca.')
    print(f'olhe: {os.path.join(out, "visao.jpg")}')
    print(f'o vídeo final vai para: {final}')


if __name__ == '__main__':
    main()

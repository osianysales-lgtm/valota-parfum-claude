// v72 · CTA "salva + segue" no fim do vídeo: áudio dela (Downloads/Cta.m4a) + cartão do perfil + 3 últimas postagens
// node cta/gerar_cta.js [--previa]   (rodar depois do gerar.js, usa tmp/take.mp4 e tmp/junto.mp4)
//   --previa: só 4 quadros parados em cta/previa.jpg
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const puppeteer = require(path.join(__dirname, '../../../node_modules/puppeteer'));
const D = __dirname, V = path.join(D, '..'), T = path.join(V, 'tmp');
const C = require('./cta.json'), CV = require('../config.json');
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
const PREVIA = process.argv.includes('--previa');
const FPS = 30;

// áudio: fala vai de 0,70 a 4,15 no arquivo → corta 0,45…4,60 (fala começa 0,25 s depois do corte)
const [A0, A1] = C.corte, DUR = +(A1 - A0).toFixed(2);
const tempos = {           // palavras (whisper) − A0 · posts = "mais" · "dicas" · "essa"
  salva: C.palavras.salva - A0, siga: C.palavras.siga - A0, posts: C.palavras.posts.map(x => x - A0),
};

(async () => {
  // fundo = último quadro do take dela (desfocado no HTML)
  const fundo = path.join(D, 'fundo.jpg');
  ff('-sseof', '-0.2', '-i', path.join(T, 'take.mp4'), '-frames:v', '1', '-q:v', '2', fundo);
  const abs = p => 'file://' + path.resolve(D, p);
  const dados = { ...C, tempos, fundo: abs(fundo), avatar: abs(C.avatar), posts: C.posts.map(abs) };

  const b = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1080, height: 1920 });
  await p.goto(abs('template.html'), { waitUntil: 'load' });
  await p.evaluate(d => window.iniciar(d), dados);
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.decode?.())));
  await new Promise(r => setTimeout(r, 400));   // background-image carregar

  if (PREVIA) {
    const qs = [0.25, tempos.salva + 0.4, tempos.siga + 0.05, tempos.posts[1] + 0.1];
    const arqs = [];
    for (const [i, t] of qs.entries()) {
      await p.evaluate(t => window.render(t), t);
      const f = path.join(T, `cta_prev_${i}.png`); await p.screenshot({ path: f }); arqs.push(f);
    }
    await b.close();
    ff(...arqs.flatMap(f => ['-i', f]), '-filter_complex', `hstack=${arqs.length},scale=1600:-1`, path.join(D, 'previa.jpg'));
    console.log('ok previa', path.join(D, 'previa.jpg')); return;
  }

  const Q = path.join(T, 'cta_quadros'); fs.rmSync(Q, { recursive: true, force: true }); fs.mkdirSync(Q, { recursive: true });
  const n = Math.round(DUR * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / FPS);
    await p.screenshot({ path: path.join(Q, `q${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
  }
  await b.close();

  // vídeo do CTA + voz + clique baixinho no toque do "Seguir"
  const cta = path.join(T, 'cta.mp4');
  const clique = path.join(V, '../../biblioteca_audio/efeitos/click_ui.mp3');
  const ms = Math.round(tempos.siga * 1000);
  ff('-framerate', FPS, '-i', path.join(Q, 'q%04d.jpg'), '-ss', A0, '-to', A1, '-i', C.audio, '-i', clique,
     '-filter_complex', `[1:a]${C.eq_voz ? C.eq_voz + ',' : ''}aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st=${DUR - 0.25}:d=0.25[v];` +
     `[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.35,adelay=${ms}|${ms}[c];[v][c]amix=inputs=2:duration=first:normalize=0[a]`,
     '-map', '0:v', '-map', '[a]', '-t', DUR, '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', cta);

  // vídeo das 4 rodadas + CTA → trilha por baixo de tudo → −14 LUFS
  const total = +(CV.rodadas_dur * 4 + DUR).toFixed(2);
  const trilha = path.join(V, '../../biblioteca_audio/trilhas/trilha_trap_luxo_beat.mp3');
  const saida = path.join(V, 'final/v72-clima-para-cada-perfume-com-cta.mp4');
  // a trilha (22 s) some em fade a partir de ~20,5 s → emenda no tempo do beat (90 bpm, compasso 2,667 s):
  // corpo 0–20,3 s + volta em 1,633 s (= 20,3 − 7 compassos), cruzando 0,4 s. Música contínua por baixo do CTA.
  ff('-i', path.join(T, 'junto.mp4'), '-i', cta, '-i', trilha, '-i', trilha, '-filter_complex',
     `[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][voz0];[voz0]aformat=sample_rates=48000:channel_layouts=stereo[voz];` +
     `[2:a]atrim=0:20.3,asetpts=PTS-STARTPTS[t1];[3:a]atrim=1.633:20.3,asetpts=PTS-STARTPTS[t2];[t1][t2]acrossfade=d=0.4:c1=tri:c2=tri[tt];` +
     `[tt]aformat=sample_rates=48000:channel_layouts=stereo,volume=${CV.trilha_db}dB,atrim=0:${total},afade=t=out:st=${total - 0.6}:d=0.6[bg];` +
     `[voz][bg]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89[au]`,
     '-map', '[v]', '-map', '[au]', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', saida);
  console.log('ok', saida, total + ' s');
})();

// v73 · node gerar.js [previa]  → final/v73-amadeirado-assinatura-encontros.mp4 (som da ref) + _sem-som.mp4
// 1) gera as máscaras de fumaça (feTurbulence) se não existirem  2) renderiza 30 fps  3) junta o áudio da referência
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));
const D = __dirname, FPS = 30, DUR = 6.7, N = Math.round(DUR * FPS);
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
(async () => {
  const b = await puppeteer.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage();
  for (const [nome, seed, freq] of [['fumaca_a', 3, 0.0021], ['fumaca_b', 11, 0.0028]]) {
    const out = path.join(D, 'fumaca', nome + '.png'); if (fs.existsSync(out)) continue;
    await pg.setViewport({ width: 1200, height: 1000 });
    await pg.setContent(`<body style="margin:0;background:transparent"><svg width="1200" height="1000"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4 -1.55"/></filter>
      <radialGradient id="g"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <mask id="m"><rect width="1200" height="1000" fill="url(#g)"/></mask>
      <rect width="1200" height="1000" filter="url(#f)" mask="url(#m)"/></svg></body>`);
    await pg.screenshot({ path: out, omitBackground: true });
  }
  await pg.setViewport({ width: 1080, height: 1920 });
  await pg.goto('file://' + path.join(D, 'template.html'), { waitUntil: 'networkidle0' });
  await pg.evaluate(() => document.fonts.ready);
  if (process.argv[2] === 'previa') { await pg.screenshot({ path: path.join(D, 'tmp', 'previa.png') }); await b.close(); return; }
  const Q = path.join(D, 'tmp', 'q'); fs.rmSync(Q, { recursive: true, force: true }); fs.mkdirSync(Q, { recursive: true });
  for (let i = 0; i < N; i++) {
    await pg.evaluate(t => seek(t), i / FPS);
    await pg.screenshot({ path: path.join(Q, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 95 });
  }
  await b.close();
  const mudo = path.join(D, 'final', 'v73-amadeirado-assinatura-encontros_sem-som.mp4');
  ff('-framerate', FPS, '-i', path.join(Q, '%04d.jpg'), '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mudo);
  ff('-i', mudo, '-i', path.join(D, 'ref', 'ref.mp4'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest',
     path.join(D, 'final', 'v73-amadeirado-assinatura-encontros.mp4'));
  console.log('ok', N, 'quadros');
})();

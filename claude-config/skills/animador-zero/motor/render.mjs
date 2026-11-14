// Animador Zero - renderiza o video quadro a quadro num Chrome invisivel.
//   node render.mjs <pasta-do-projeto> still 1.5 8 12.2      -> previa/quadro_XXXX.jpg
//   node render.mjs <pasta-do-projeto> video [inicio] [fim]   -> render-voz.mp4 (imagem + voz)
// A pasta do projeto precisa ter: roteiro.js, env.json e voz.wav (o scripts/novo.py cria env.json e voz.wav).
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(process.argv[2] || '.');
const mode = process.argv[3];
const FPS = 30;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };

function chromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const L = process.env.LOCALAPPDATA || '', PF = process.env.PROGRAMFILES || 'C:\\Program Files', PF86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const c = os.platform() === 'win32'
    ? [`${PF}\\Google\\Chrome\\Application\\chrome.exe`, `${PF86}\\Google\\Chrome\\Application\\chrome.exe`, `${L}\\Google\\Chrome\\Application\\chrome.exe`, `${PF86}\\Microsoft\\Edge\\Application\\msedge.exe`, `${PF}\\Microsoft\\Edge\\Application\\msedge.exe`]
    : os.platform() === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium']
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'];
  return c.find(p => fs.existsSync(p));
}

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/pagina.html';
      const base = p.startsWith('/projeto/') ? PROJ : ROOT;
      const f = path.join(base, p.startsWith('/projeto/') ? p.slice(9) : p);
      if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); rsp.end('nf'); return; }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

for (const f of ['roteiro.js', 'env.json']) if (!fs.existsSync(path.join(PROJ, f))) { console.error(`FALTA ${f} em ${PROJ}`); process.exit(2); }
const CHROME = chromePath();
if (!CHROME) { console.error('FALTA: Google Chrome ou Microsoft Edge. Instale o Chrome ou informe CHROME_PATH.'); process.exit(2); }

const srv = await serve();
const args = ['--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920', '--disable-background-timer-throttling'];
if (os.platform() === 'win32') args.push('--use-angle=d3d11');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args, protocolTimeout: 0 });   // sem limite: se o Mac engasgar, o quadro espera em vez de derrubar o render
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
let erro = null;
page.on('console', m => { const t = m.text(); if (!t.includes('GPU stall') && !t.includes('404')) console.log('[pagina]', t); });
page.on('pageerror', e => { erro = e.message; console.log('[ERRO NO ROTEIRO]', e.message); });
await page.goto(`http://127.0.0.1:${srv.address().port}/pagina.html`);
try { await page.waitForFunction('window.ready === true', { timeout: 90000 }); }
catch { console.error('A cena nao carregou.', erro ? 'Erro: ' + erro : 'Confira o roteiro.js.'); await browser.close(); srv.close(); process.exit(3); }
console.log('gpu:', await page.evaluate(() => window.gpuInfo));
const DURATION = await page.evaluate(() => window.DURATION);

if (mode === 'still') {
  const dir = path.join(PROJ, 'previa'); fs.mkdirSync(dir, { recursive: true });
  for (const a of process.argv.slice(4)) {
    const t = parseFloat(a);
    await page.evaluate(tt => window.renderFrame(tt), t);
    const f = path.join(dir, `quadro_${t.toFixed(2).padStart(6, '0')}.jpg`);
    await page.screenshot({ path: f, type: 'jpeg', quality: 88 });
    console.log('quadro', f);
  }
} else if (mode === 'video') {
  const start = parseFloat(process.argv[4] ?? '0'), end = parseFloat(process.argv[5] ?? String(DURATION));
  const out = path.join(PROJ, 'render-voz.mp4'), audio = path.join(PROJ, 'voz.wav');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(start), '-t', String(end - start), '-i', audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(start * FPS), n1 = Math.round(end * FPS), t0 = Date.now();
  const prog = path.join(PROJ, 'progresso.txt');
  for (let i = n0; i < n1; i++) {
    await page.evaluate(tt => window.renderFrame(tt), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - n0) % 60 === 0) { const msg = `quadro ${i - n0}/${n1 - n0}  ${((Date.now() - t0) / 1000).toFixed(0)}s`; console.log(msg); fs.writeFileSync(prog, msg); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  fs.writeFileSync(prog, `pronto em ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log('gerado', out, `em ${((Date.now() - t0) / 1000).toFixed(0)}s`);
} else {
  console.log('Use: node render.mjs <projeto> still <tempos...> | video [inicio] [fim]');
}
await browser.close();
srv.close();

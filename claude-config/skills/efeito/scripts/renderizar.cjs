#!/usr/bin/env node
// Renderiza o efeito escrito em PASTA/efeito.js. Rode por: bash scripts/efeito renderizar PASTA ...
//   --folha               8 momentos do trecho -> PASTA/checagem/folha.jpg
//   --quadros 0.5,2.1     quadros soltos (segundos DENTRO do trecho) -> PASTA/checagem/
//   --final               o vídeo inteiro com o efeito no trecho e o áudio original
// O tempo do efeito (k.t) começa em 0 no início do trecho. Desenha com @napi-rs/canvas, sem navegador.
const fs = require('fs'), path = require('path'), vm = require('vm'), { spawn, spawnSync } = require('child_process');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const SKILL = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const pasta = path.resolve(args[0] || '');
const tem = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
if (!fs.existsSync(path.join(pasta, 'info.json'))) { console.error('pasta de trabalho inválida (rode o preparar antes)'); process.exit(1); }

const I = JSON.parse(fs.readFileSync(path.join(pasta, 'info.json'), 'utf8'));
const W = I.largura, H = I.altura, FPS = I.fps, D = I.duracao;
const chk = path.join(pasta, 'checagem'); fs.mkdirSync(chk, { recursive: true });

// fontes da skill, com os mesmos nomes que o efeito usa
const F = path.join(SKILL, 'modelo', 'fontes');
for (const [arq, fam] of [['Inter.ttf', 'Inter'], ['instrumentserif-normal.woff2', 'Instrument Serif'], ['instrumentserif-italic.woff2', 'Instrument Serif'],
  ['archivoblack-400.woff2', 'Archivo Black'], ['permanentmarker-400.woff2', 'Permanent Marker'], ['ibmplexmono-700.woff2', 'Plex Mono']]) {
  GlobalFonts.registerFromPath(path.join(F, arq), fam);
}

// o efeito roda num contexto com as ferramentas de base.js como globais
const base = require(path.join(SKILL, 'modelo', 'base.js'))({ createCanvas, W, H });
const ctx = vm.createContext({ ...base, W, H, FPS, Math, JSON, console, Number, String, Array, Object,
  document: { createElement: (t) => { if (t !== 'canvas') throw new Error('só canvas'); return createCanvas(W, H); } } });
let EFEITO;
try {
  EFEITO = vm.runInContext(fs.readFileSync(path.join(pasta, 'efeito.js'), 'utf8') + '\n;EFEITO', ctx, { filename: path.join(pasta, 'efeito.js') });
} catch (e) { console.error('erro no efeito.js:\n' + e.stack.split('\n').slice(0, 4).join('\n')); process.exit(1); }
if (!EFEITO || typeof EFEITO.desenhar !== 'function') { console.error('efeito.js precisa definir const EFEITO = { desenhar(g, k) { ... } }'); process.exit(1); }

async function carregar(spec) {                                       // string | array | objeto de caminhos -> imagens
  if (typeof spec === 'string') {
    try { return await loadImage(path.join(pasta, spec)); } catch { throw new Error(`não consegui abrir a imagem ${spec}`); }
  }
  if (Array.isArray(spec)) return Promise.all(spec.map(carregar));
  const out = {}; for (const [k, v] of Object.entries(spec || {})) out[k] = await carregar(v); return out;
}

const tela = createCanvas(W, H), g = tela.getContext('2d');
async function desenhar(t, IMG) {
  t = Math.min(Math.max(t, 0), D - 1 / FPS);
  const i = Math.min(I.quadros, Math.floor(t * FPS + 1e-4) + 1), nm = String(i).padStart(4, '0');
  const [quadro, recorte] = await Promise.all([loadImage(path.join(pasta, 'quadros', nm + '.jpg')), loadImage(path.join(pasta, 'recorte', nm + '.webp'))]);
  const [x, y, w, h] = I.rosto[i - 1];
  const k = { t, d: D, p: t / D, i, fps: FPS, W, H, quadro, recorte, img: IMG,
    rosto: { x, y, w, h, cx: x + w / 2, cy: y + h / 2, topo: y - h * 0.5, queixo: y + h * 1.05 } };
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.shadowColor = 'transparent'; g.setLineDash([]); g.clearRect(0, 0, W, H);
  try { EFEITO.desenhar(g, k); } catch (e) {
    console.error(`erro no efeito.js em t=${t.toFixed(2)}s:\n` + e.stack.split('\n').slice(0, 4).join('\n')); process.exit(1);
  }
  return tela;
}

(async () => {
  let IMG;
  try { IMG = await carregar(EFEITO.imagens || {}); } catch (e) { console.error(e.message); process.exit(1); }

  if (val('--quadros')) {
    for (const s of val('--quadros').split(',')) {
      const t = Math.min(Math.max(+s, 0), D - 1 / FPS), out = path.join(chk, `quadro_${t.toFixed(2).padStart(5, '0')}.png`);
      fs.writeFileSync(out, await (await desenhar(t, IMG)).encode('png')); console.log(out);
    }
  }

  if (tem('--folha')) {
    const ts = [0.04, 0.16, 0.3, 0.44, 0.58, 0.72, 0.86, 0.98].map((f) => Math.min(D - 1 / FPS, D * f));
    const tw = 270, th = 480, folha = createCanvas(tw * 4 + 50, (th + 34) * 2 + 20), f = folha.getContext('2d');
    f.fillStyle = '#111'; f.fillRect(0, 0, folha.width, folha.height);
    for (let j = 0; j < ts.length; j++) {
      const x = 10 + (j % 4) * (tw + 10), y = 10 + Math.floor(j / 4) * (th + 34);
      f.drawImage(await desenhar(ts[j], IMG), x, y, tw, th);
      f.fillStyle = '#e6e6e6'; f.font = '500 18px "Inter"'; f.fillText(`${ts[j].toFixed(2)}s`, x + 4, y + th + 24);
    }
    const out = path.join(chk, 'folha.jpg'); fs.writeFileSync(out, await folha.encode('jpeg', 88)); console.log(out);
  }

  if (tem('--final')) {
    const trecho = path.join(pasta, 'trecho.mp4');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', trecho], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fim = new Promise((ok, erro) => ff.on('close', (c) => (c === 0 ? ok() : erro(new Error('ffmpeg falhou ao gravar o trecho')))));
    for (let i = 0; i < I.quadros; i++) {
      const jpg = await (await desenhar(i / FPS, IMG)).encode('jpeg', 92);
      if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % FPS === 0) process.stdout.write(`\rrenderizando ${i}/${I.quadros} quadros`);
    }
    ff.stdin.end(); await fim;
    console.log(`\rrenderizando ${I.quadros}/${I.quadros} quadros`);
    const t0 = I.inicio, t1 = I.fim;
    const fc = `[1:v]setpts=PTS-STARTPTS+${t0}/TB[fx];[0:v][fx]overlay=eof_action=pass:enable='between(t,${t0},${(t1 - 0.001).toFixed(3)})'[v]`;
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(pasta, 'base.mp4'), '-i', trecho, '-filter_complex', fc,
      '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'copy', '-movflags', '+faststart', I.final], { encoding: 'utf8' });
    if (r.status !== 0) { console.error('erro ao montar o vídeo final:\n' + (r.stderr || '').slice(-1500)); process.exit(1); }
    console.log(`PRONTO: ${I.final}`);
  }
})();

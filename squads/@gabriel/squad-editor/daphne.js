// DAPHNE v3 — renderiza HTML animado em vídeo QUADRO A QUADRO (determinístico)
//
// Por que mudou (v2 → v3):
//   A v2 gravava a tela em tempo real (CDP screencast, JPEG, timestamps do relógio).
//   Resultado: quadros perdidos quando a máquina engasga, vídeo com fps variável,
//   compressão JPEG e necessidade de chroma key para sobrepor legenda.
//   A v3 controla o RELÓGIO da página: avança o tempo exatamente 1/fps por quadro,
//   tira um PNG sem perda e entrega CFR (30 fps fixos). Mesmo HTML = mesmo vídeo, sempre.
//
// Uso:
//   node daphne.js <arquivo.html> <duracao_segundos> [audio_map.json] [opções]
//
// Opções:
//   --out <arquivo>     Caminho do vídeo de saída (padrão: <nome>.mp4 na pasta da squad;
//                       com --alpha: <nome>.mov)
//   --fps <n>           Quadros por segundo (padrão 30)
//   --alpha             Fundo transparente → .mov ProRes 4444 com canal alfa
//                       (para sobrepor legenda/motion em vídeo gravado, SEM chroma key)
//   --ficha <json>      Ficha de marca (cores, fontes, logos). Vira variáveis CSS
//                       (--cor-<nome>, --fonte-<papel>) e window.FICHA dentro do HTML.
//   --largura/--altura  Resolução (padrão 1080x1920)
//   --crf <n>           Qualidade H.264 (padrão 18)
//   --qualidade social|maxima  social (padrão): CRF 18 com teto de 12 Mbps — o dobro do que o Instagram entrega;
//                       maxima: CRF 18 sem teto (arquivo mestre). Motion costuma ficar bem abaixo do teto.
//   --intermediario     Vídeo que ainda vai ser editado (camada do Salsicha): CRF 14 rápido, sem teto
//   --cache <pasta>     Reaproveita renders idênticos (mesmo HTML, assets, params, ficha, duração, áudio).
//                       Padrão: <pasta do --out>/cache/render. --sem-cache força renderizar de novo.
//   --workers <n>       Faixas renderizadas em paralelo (padrão: metade dos núcleos, máx. 4; 1 = sem paralelo)
//
// Contrato de animação (qualquer um funciona; o 1º é o recomendado):
//   1. window.render(t)            → função pura do tempo em segundos
//   2. GSAP (timelines, tweens)    → o relógio virtual dirige o ticker do GSAP.
//      O <script src=".../gsap..."> do CDN é trocado automaticamente pela cópia local
//      (node_modules/gsap). Não precisa de internet.
//   3. CSS animations/transitions e Web Animations → controladas via document.getAnimations()
//   4. setTimeout / setInterval / requestAnimationFrame / performance.now / Date.now
//      → todos rodam no relógio virtual.
//   <video> dentro do HTML é sincronizado quadro a quadro (seek): fundos em vídeo aparecem.

'use strict';

// Primeira execução neste computador: instala o que faltar (npm, FFmpeg) — ver tools/setup.js
let AMB = {};
try { AMB = require('./tools/setup').garantir(['pacotes', 'ffmpeg']); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND') { console.error('[Dafne] ' + e.message); process.exit(1); } }

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

// ─────────────────────────────────────────────────────────────────────────────
// ARGUMENTOS
// ─────────────────────────────────────────────────────────────────────────────
const pos = [];
const opt = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2);
    if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opt[k] = argv[++i];
    else opt[k] = true;
  } else pos.push(argv[i]);
}

if (!pos[0]) {
  console.error('Uso: node daphne.js <arquivo.html> <duracao_segundos> [audio_map.json] [--alpha] [--out arquivo] [--fps 30] [--ficha ficha.json] [--params json] [--plano plano.json] [--quadros 0.5,2] [--narracao voz.mp3] [--remixar video.mp4]');
  process.exit(1);
}

const INPUT_HTML = path.resolve(process.cwd(), pos[0]);
const DURATION_SEC = parseFloat(pos[1] || '5');
const AUDIO_MAP = pos[2] ? path.resolve(process.cwd(), pos[2]) : null;
const FPS = parseInt(opt.fps || '30', 10);
const ALPHA = !!opt.alpha;
const WIDTH = parseInt(opt.largura || '1080', 10);
const HEIGHT = parseInt(opt.altura || '1920', 10);
const INTERMEDIARIO = !!opt.intermediario;
const QUALIDADE = String(opt.qualidade || 'social').toLowerCase() === 'maxima' ? 'maxima' : 'social';
const CRF = String(opt.crf || (INTERMEDIARIO ? '14' : '18'));
// Codificação do MP4: intermediário (vai ser editado de novo) é rápido e quase sem perda; o final tem teto de bitrate
const VCODEC_SAIDA = INTERMEDIARIO
  ? ['-c:v', 'libx264', '-crf', CRF, '-preset', 'veryfast', '-pix_fmt', 'yuv420p']
  : ['-c:v', 'libx264', '-crf', CRF, '-preset', 'medium', '-pix_fmt', 'yuv420p',
     ...(QUALIDADE === 'social' ? ['-maxrate', '12M', '-bufsize', '24M'] : [])];
// --params '{"texto":"..."}' ou arquivo.json → window.PARAMS (modelos reutilizáveis, ex.: animacoes/modelos/reforco.html)
const PARAMS = opt.params ? (fs.existsSync(path.resolve(process.cwd(), String(opt.params)))
  ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), String(opt.params)), 'utf8').replace(/^\uFEFF/, ''))
  : JSON.parse(String(opt.params))) : null;
// --quadros 0.5,1.2,3 → só tira fotos desses segundos (storyboard/revisão). NÃO é render: não precisa de plano aprovado.
const QUADROS = opt.quadros ? String(opt.quadros).split(',').map(Number).filter(x => x >= 0).sort((a, b) => a - b) : null;
// caminhos de fonte/logo resolvidos pela pasta da squad (fichas salvas em marcas/ usam caminho relativo)
const FICHA = opt.ficha ? require('./tools/ficha').carregarFicha(path.resolve(process.cwd(), opt.ficha)) : null;
const OUTPUT = opt.out
  ? path.resolve(process.cwd(), opt.out)
  : path.resolve(__dirname, path.basename(INPUT_HTML, '.html') + (ALPHA ? '.mov' : '.mp4'));

// ─────────────────────────────────────────────────────────────────────────────
// FFMPEG — prefere o global do sistema (o bundled falha em drives de rede)
// ─────────────────────────────────────────────────────────────────────────────
function ffbin() {
  if (AMB.ffmpeg && fs.existsSync(AMB.ffmpeg)) return AMB.ffmpeg;
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    const r = spawnSync(cmd, ['ffmpeg'], { encoding: 'utf8' });
    const p = (r.stdout || '').split(/\r?\n/)[0].trim();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch {}
  return 'ffmpeg';
}
const FFMPEG = ffbin();

function toFileUrl(p) {
  let s = path.resolve(p).replace(/\\/g, '/');
  if (!s.startsWith('/')) s = '/' + s;
  return 'file://' + encodeURI(s).replace(/#/g, '%23');
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIM DO RELÓGIO VIRTUAL — injetado antes de qualquer script do HTML
// ─────────────────────────────────────────────────────────────────────────────
const SHIM = `
(function(){
  var setTimeoutReal = window.setTimeout.bind(window);
  var vt = { now: 0, raf: [], timers: [], seq: 0 };
  var base = Date.now();
  try { Object.defineProperty(performance, 'now', { value: function(){ return vt.now; }, configurable: true }); } catch(e) {}
  Date.now = function(){ return base + vt.now; };
  window.requestAnimationFrame = function(cb){ var id = ++vt.seq; vt.raf.push({ id: id, cb: cb }); return id; };
  window.cancelAnimationFrame = function(id){ vt.raf = vt.raf.filter(function(r){ return r.id !== id; }); };
  window.setTimeout = function(cb, ms){
    var a = Array.prototype.slice.call(arguments, 2); var id = ++vt.seq;
    var fn = typeof cb === 'function' ? function(){ cb.apply(null, a); } : function(){ (0, eval)(cb); };
    vt.timers.push({ id: id, at: vt.now + Math.max(0, +ms || 0), fn: fn }); return id;
  };
  window.setInterval = function(cb, ms){
    var a = Array.prototype.slice.call(arguments, 2); var id = ++vt.seq; var iv = Math.max(1, +ms || 0);
    vt.timers.push({ id: id, at: vt.now + iv, fn: function(){ cb.apply(null, a); }, iv: iv }); return id;
  };
  window.clearTimeout = window.clearInterval = function(id){ vt.timers = vt.timers.filter(function(t){ return t.id !== id; }); };

  var animBirth = new WeakMap();
  var videoBirth = new WeakMap();
  window.__daphne = {
    vt: vt,
    advance: function(ms){
      var guard = 0;
      while (guard++ < 200000) {
        var due = null;
        for (var i = 0; i < vt.timers.length; i++) { var t = vt.timers[i]; if (t.at <= ms && (!due || t.at < due.at || (t.at === due.at && t.id < due.id))) due = t; }
        if (!due) break;
        vt.now = Math.max(vt.now, due.at);
        if (due.iv) due.at += due.iv; else vt.timers.splice(vt.timers.indexOf(due), 1);
        try { due.fn(); } catch(e) { console.error(e); }
      }
      vt.now = ms;
      var list = vt.raf; vt.raf = [];
      for (var j = 0; j < list.length; j++) { try { list[j].cb(ms); } catch(e) { console.error(e); } }
      if (typeof window.render === 'function') { try { window.render(ms / 1000); } catch(e) { console.error(e); } }
      var anims = document.getAnimations ? document.getAnimations() : [];
      for (var k = 0; k < anims.length; k++) {
        var an = anims[k];
        if (!animBirth.has(an)) animBirth.set(an, ms);
        try { an.pause(); an.currentTime = Math.max(0, ms - animBirth.get(an)); } catch(e) {}
      }
    },
    seekVideos: function(ms){
      var vids = Array.prototype.slice.call(document.querySelectorAll('video'));
      return Promise.all(vids.map(function(v){
        if (!videoBirth.has(v)) { videoBirth.set(v, ms); try { v.pause(); } catch(e) {} v.muted = true; v.autoplay = false; }
        var d = v.duration; if (!d || !isFinite(d)) return Promise.resolve();
        var t = (ms - videoBirth.get(v)) / 1000 * (v.playbackRate || 1);
        t = v.loop ? (t % d) : Math.min(t, d - 0.001);
        if (Math.abs(v.currentTime - t) < 0.0005) return Promise.resolve();
        return new Promise(function(res){
          var done = false; var fin = function(){ if (!done) { done = true; res(); } };
          v.addEventListener('seeked', fin, { once: true });
          setTimeoutReal(fin, 2000);
          v.currentTime = t;
        });
      }));
    }
  };
})();
`;

// ─────────────────────────────────────────────────────────────────────────────
// PREPARAR HTML — shim, base href, ficha de marca, GSAP local
// ─────────────────────────────────────────────────────────────────────────────
function gsapLocal(nome) {
  const cands = [
    path.join(__dirname, 'node_modules', 'gsap', 'dist', nome),
    path.join(process.cwd(), 'node_modules', 'gsap', 'dist', nome),
  ];
  for (const c of cands) if (fs.existsSync(c)) return fs.readFileSync(c, 'utf8');
  return null;
}

function fichaCSS(f) {
  if (!f) return '';
  const cores = f.cores || {};
  const fontes = f.fontes || {};
  let css = '';
  for (const [papel, fo] of Object.entries(fontes)) {
    if (fo && fo.arquivo && fs.existsSync(fo.arquivo)) {
      css += `@font-face{font-family:'${fo.familia || papel}';src:url('${toFileUrl(fo.arquivo)}');font-weight:${fo.peso || 'normal'};font-display:block}\n`;
    }
  }
  const vars = [];
  for (const [k, v] of Object.entries(cores)) vars.push(`--cor-${k}:${v}`);
  for (const [k, fo] of Object.entries(fontes)) if (fo && fo.familia) vars.push(`--fonte-${k}:'${fo.familia}'`);
  if (vars.length) css += `:root{${vars.join(';')}}\n`;
  return css;
}

function prepararHTML(htmlOriginal) {
  let html = htmlOriginal.replace(/^﻿/, '');
  // GSAP do CDN → cópia local inline (o render não depende de internet)
  html = html.replace(/<script[^>]*src=["'][^"']*gsap[^"']*\/([A-Za-z]+)(?:\.min)?\.js["'][^>]*>\s*<\/script>/gi, (m, nome) => {
    const code = gsapLocal(`${nome}.min.js`) || gsapLocal(`${nome}.js`);
    if (!code) { console.warn(`  [Dafne] GSAP local não encontrado para ${nome} — rode npm install`); return m; }
    return `<script>${code}</script>`;
  });
  const dir = path.dirname(INPUT_HTML);
  // Three.js (cenas 3D): import "three" e "three/addons/..." resolvem para a cópia local (node_modules/three), sem CDN
  const threeDir = path.join(__dirname, 'node_modules', 'three');
  const importmap = /from\s+['"]three(\/addons\/[^'"]*)?['"]/.test(html) && fs.existsSync(threeDir)
    ? `<script type="importmap">${JSON.stringify({ imports: {
        three: toFileUrl(path.join(threeDir, 'build', 'three.module.js')),
        'three/addons/': toFileUrl(path.join(threeDir, 'examples', 'jsm')) + '/' } })}</script>` : '';
  const head =
    `<meta charset="utf-8">` + importmap +
    `<base href="${toFileUrl(dir)}/">` +
    `<script>${SHIM}</script>` +
    (FICHA ? `<script>window.FICHA=${JSON.stringify(FICHA)};</script><style>${fichaCSS(FICHA)}</style>` : '') +
    (PARAMS ? `<script>window.PARAMS=${JSON.stringify(PARAMS)};</script>` : '') +
    (ALPHA ? `<style>html,body{background:transparent!important}</style>` : '');
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + head);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + '<head>' + head + '</head>');
  return head + html;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────────
function iniciarEncoder(dest) {
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
  if (ALPHA) {
    // O quadro já chega em PNG com alfa: por padrão vai direto para o .mov, sem recodificar (o ProRes era o gargalo).
    // --codec-alfa prores volta ao ProRes 4444.
    if (String(opt['codec-alfa'] || 'png') === 'prores') args.push('-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0');
    else args.push('-c:v', 'copy');
  }
  else args.push('-vf', `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
    ...VCODEC_SAIDA, '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(FPS), '-movflags', '+faststart');
  args.push(dest);
  return spawn(FFMPEG, args, { stdio: ['pipe', 'inherit', 'inherit'] });
}

let SEQ_PAGINA = 0;
const REUSO = { n: 0 };
async function abrirPagina() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files',
      '--autoplay-policy=no-user-gesture-required', `--window-size=${WIDTH},${HEIGHT}`, '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  const client = await page.createCDPSession();
  await client.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  if (ALPHA) await client.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  page.on('pageerror', e => console.warn('  [HTML erro]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.warn('  [HTML console]', m.text().slice(0, 200)); });

  // HTML preparado gravado ao lado do original (caminhos relativos de assets funcionam)
  // (nome único por navegador: em render paralelo, cada faixa grava e apaga o SEU arquivo)
  const tmpHtml = path.join(path.dirname(INPUT_HTML), `.__daphne_${process.pid}_${++SEQ_PAGINA}_${path.basename(INPUT_HTML)}`);
  fs.writeFileSync(tmpHtml, prepararHTML(fs.readFileSync(INPUT_HTML, 'utf8')), 'utf8');
  try {
    await page.goto(toFileUrl(tmpHtml), { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const imgs = Array.from(document.images).filter(i => !i.complete);
      await Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; })));
      const vids = Array.from(document.querySelectorAll('video'));
      await Promise.all(vids.map(v => v.readyState >= 1 ? 0 : new Promise(r => {
        v.addEventListener('loadedmetadata', r, { once: true }); v.addEventListener('error', r, { once: true });
      })));
    });
  } catch (e) {
    await browser.close().catch(() => {});   // não deixa um Chrome órfão segurando o processo
    throw e;
  } finally {
    try { fs.unlinkSync(tmpHtml); } catch {}
  }
  return { browser, page, client };
}

// Fotos de segundos específicos (storyboard / revisão rápida) — avança quadro a quadro até cada tempo
async function capturarQuadros(prefixo) {
  const { browser, page, client } = await abrirPagina();
  const saidas = [];
  try {
    let i = 0;
    for (const t of QUADROS) {
      const alvo = Math.round(t * FPS);
      for (; i <= alvo; i++) await page.evaluate(m => { window.__daphne.advance(m); return window.__daphne.seekVideos(m); }, (i * 1000) / FPS);
      const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      const dest = `${prefixo}_q${t.toFixed(2)}.png`;
      fs.writeFileSync(dest, Buffer.from(data, 'base64'));
      saidas.push(dest);
    }
  } finally { await browser.close(); }
  return saidas;
}

// Renderiza as faixas [i0, i1) de quadros num navegador próprio. O estado da animação é sequencial, então
// a faixa que não começa em 0 avança o relógio virtual (SEM tirar foto) até o seu primeiro quadro.
async function renderizarFaixa(i0, i1, dest, avanco) {
  const { browser, page, client } = await abrirPagina();
  try {
    if (i0 > 0) {
      // quadro 0 igual ao render sequencial (vídeos ancoram o tempo no 1º seek); depois avança em lotes DENTRO da página,
      // quadro a quadro e na mesma ordem (um vai-e-volta por quadro custava quase o mesmo que a foto)
      await page.evaluate(() => { window.__daphne.advance(0); return window.__daphne.seekVideos(0); });
      for (let a = 1; a < i0; a += 60) {
        await page.evaluate((de, ate, fps) => { for (let i = de; i < ate; i++) window.__daphne.advance((i * 1000) / fps); }, a, Math.min(i0, a + 60), FPS);
      }
    }
    // Página com <video>: o 1º seek de cada navegador pode ser fotografado antes do quadro ser pintado
    // (quadro preto; mais provável com vários navegadores abrindo juntos). Posiciona e espera pintar.
    const temVideo = await page.evaluate(() => document.querySelectorAll('video').length > 0);
    if (temVideo) {
      const ms0 = (i0 * 1000) / FPS;
      await page.evaluate(m => { window.__daphne.advance(m); return window.__daphne.seekVideos(m); }, ms0);
      await new Promise(r => setTimeout(r, 400));
    }
    const enc = iniciarEncoder(dest);
    const fim = new Promise((res, rej) => enc.on('close', c => (c === 0 ? res() : rej(new Error('encoder ffmpeg saiu com código ' + c)))));
    fim.catch(() => {});   // o erro é tratado abaixo; sem isto, uma queda do encoder viraria "unhandled rejection"
    enc.stdin.on('error', () => {});
    // Quadro repetido: se a página publica window.__chaveQuadro (a legenda publica) e a chave não mudou, a imagem é a
    // mesma do quadro anterior — reaproveita a foto em vez de tirar outra. Só vale sem <video> e sem animação CSS ativa.
    let chaveAnt = null, pngAnt = null;
    try {
      for (let i = i0; i < i1; i++) {
        const ms = (i * 1000) / FPS;
        const chave = await page.evaluate(m => {
          window.__daphne.advance(m);
          return window.__daphne.seekVideos(m).then(() => {
            const k = window.__chaveQuadro;
            const anim = document.getAnimations ? document.getAnimations().length : 0;
            return (typeof k === 'string' && !anim && !document.querySelector('video')) ? k : null;
          });
        }, ms);
        if (temVideo && i === i0) await new Promise(r => setTimeout(r, 400));   // 1º quadro da faixa: deixa o vídeo pintar
        let png;
        if (chave !== null && chave === chaveAnt && pngAnt) { png = pngAnt; REUSO.n++; }
        else {
          const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, optimizeForSpeed: true });
          png = Buffer.from(data, 'base64');
        }
        chaveAnt = chave; pngAnt = png;
        if (!enc.stdin.write(png)) await new Promise(r => enc.stdin.once('drain', r));
        avanco();
      }
      enc.stdin.end();
    } catch (e) {
      try { enc.kill(); } catch {}
      throw e;
    }
    await fim;
  } finally { await browser.close(); }
}

// Quantas faixas em paralelo: --workers N (1 = como antes). Padrão: metade dos núcleos (máx. 4) em vídeos de 3 s ou mais.
function quantasFaixas(total) {
  if (opt.workers) return Math.max(1, Math.min(parseInt(opt.workers, 10) || 1, total));
  if (total < FPS * 3) return 1;
  // Páginas com <video> de fundo: com 4 navegadores decodificando juntos o 1º quadro saía preto (medido); com 2, não.
  let max = 4;
  try { if (/<video[\s>]/i.test(fs.readFileSync(INPUT_HTML, 'utf8'))) max = 2; } catch {}
  return Math.max(1, Math.min(max, Math.floor(require('os').cpus().length / 2), total));
}

async function renderizar(destVideo) {
  const total = Math.round(DURATION_SEC * FPS);
  const W = quantasFaixas(total);
  const t0 = Date.now();
  let feitos = 0;
  const avanco = () => {
    feitos++;
    if (feitos % 15 === 0 || feitos === total) process.stdout.write(`\r  quadro ${feitos}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)}s${W > 1 ? `, ${W} em paralelo` : ''})`);
  };
  if (W === 1) {
    await renderizarFaixa(0, total, destVideo, avanco);
    console.log('');
    return;
  }
  // Paralelo: cada navegador renderiza uma faixa contínua; depois as faixas são unidas sem recodificar
  const passo = Math.ceil(total / W);
  const faixas = [];
  for (let k = 0; k < W; k++) {
    const i0 = k * passo, i1 = Math.min(total, i0 + passo);
    if (i0 < i1) faixas.push({ i0, i1, dest: destVideo.replace(/(\.\w+)$/, `.__parte${k}$1`) });
  }
  const lista = destVideo.replace(/(\.\w+)$/, `.__concat.txt`);
  const limpar = () => { for (const f of faixas) { try { fs.unlinkSync(f.dest); } catch {} } try { fs.unlinkSync(lista); } catch {} };
  try {
    // allSettled: se uma faixa cair, espera as outras fecharem os navegadores antes do plano B
    const res = await Promise.allSettled(faixas.map(f => renderizarFaixa(f.i0, f.i1, f.dest, avanco)));
    console.log('');
    const falhou = res.find(r => r.status === 'rejected');
    if (falhou) throw falhou.reason;
    fs.writeFileSync(lista, faixas.map(f => `file '${f.dest.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'), 'utf8');
    const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy',
      ...(ALPHA ? [] : ['-movflags', '+faststart']), destVideo], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error('união das faixas falhou: ' + (r.stderr || '').slice(-400));
  } catch (e) {
    limpar();
    console.warn(`\n  [Dafne] render em paralelo falhou (${e.message.split('\n')[0]}); refazendo em uma faixa só.`);
    feitos = 0;
    await renderizarFaixa(0, total, destVideo, avanco);
    console.log('');
    return;
  }
  limpar();
}

// ─────────────────────────────────────────────────────────────────────────────
// ÁUDIO (audio_map do Scooby) — BGM + SFX nos tempos exatos
// ─────────────────────────────────────────────────────────────────────────────
// --narracao <mp3/wav> (Caminho 1): voz principal; a BGM abaixa sozinha sob a voz. O volume final vai a −14 LUFS em toda mixagem.
const NARRACAO = opt.narracao ? path.resolve(process.cwd(), String(opt.narracao)) : null;
// --remixar <video.mp4>: só refaz o áudio de um vídeo já renderizado (não renderiza de novo)
const REMIXAR = opt.remixar ? path.resolve(process.cwd(), String(opt.remixar)) : null;

function carregarAudioMap() {
  const vazio = { bgm: null, sfx: [], narracao: null };
  const narrCli = NARRACAO && fs.existsSync(NARRACAO) ? { filePath: NARRACAO, volume: 1 } : null;
  if (NARRACAO && !narrCli) console.warn(`  [Dafne] narração não encontrada: ${NARRACAO}`);
  if (!AUDIO_MAP || !fs.existsSync(AUDIO_MAP)) return narrCli ? { ...vazio, narracao: narrCli } : null;
  const map = JSON.parse(fs.readFileSync(AUDIO_MAP, 'utf8').replace(/^﻿/, ''));
  const base = path.dirname(AUDIO_MAP);
  const bgm = map.bgm ? { ...map.bgm, filePath: path.resolve(base, map.bgm.file) } : null;
  const sfx = (map.sfx || []).map(s => ({ ...s, filePath: path.resolve(base, s.file) }))
    .filter(s => fs.existsSync(s.filePath) || (console.warn(`  [Scooby] ausente: ${s.file}`), false));
  const narr = narrCli || (map.narracao ? { ...map.narracao, filePath: path.resolve(base, map.narracao.file) } : null);
  return { bgm: bgm && fs.existsSync(bgm.filePath) ? bgm : null, sfx, narracao: narr && fs.existsSync(narr.filePath) ? narr : null };
}

function mixarAudio(videoMudo, dest, am) {
  const ins = ['-y', '-loglevel', 'error', '-i', videoMudo];
  const f = [];
  const labels = [];
  let idx = 1;
  let narrIdx = null;
  if (am.narracao) {
    ins.push('-i', am.narracao.filePath);
    narrIdx = idx++;
    // apad: a voz termina antes do vídeo; o silêncio depois dela mantém a trilha e o vídeo inteiros
    f.push(`[${narrIdx}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${am.narracao.volume ?? 1},apad,atrim=0:${DURATION_SEC}${am.bgm ? ',asplit=2[narr][narrsc]' : '[narr]'}`);
    labels.push('[narr]');
  }
  if (am.bgm) {
    ins.push('-stream_loop', '-1', '-i', am.bgm.filePath);
    // aformat nas duas entradas: o FFmpeg 4.4 (npm, Mac sem Homebrew) não negocia formato no sidechaincompress
    // com narração a trilha fica mais baixa e ainda abaixa sozinha quando a voz entra (ducking)
    const vol = am.bgm.volume ?? (am.narracao ? 0.14 : 0.35);
    f.push(`[${idx}:a]atrim=0:${DURATION_SEC},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${vol},afade=t=out:st=${Math.max(0, DURATION_SEC - 0.6)}:d=0.6${am.narracao ? '[bgm0]' : '[bgm]'}`);
    if (am.narracao) f.push(`[bgm0][narrsc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[bgm]`);
    labels.push('[bgm]'); idx++;
  }
  am.sfx.forEach((s, i) => {
    ins.push('-i', s.filePath);
    // +50 ms cancela o -50 embutido na fórmula do Scooby (t = (JS_ms-50)/1000)
    const d = Math.max(0, Math.round(s.t * 1000 + 50));
    f.push(`[${idx}:a]adelay=${d}|${d},volume=${s.volume ?? 0.5}[s${i}]`);
    labels.push(`[s${i}]`); idx++;
  });
  const N = labels.length;
  // volume=N depois do amix: compatível com FFmpeg antigo (sem normalize=0)
  // −14 LUFS sempre que há mixagem: sem a narração, uma trilha a 0,15 saía a −43 LUFS (quase muda; o QA reprova)
  const final = ',loudnorm=I=-14:TP=-1.5:LRA=11';
  f.push(`${labels.join('')}amix=inputs=${N}:duration=longest,volume=${N},atrim=0:${DURATION_SEC}${final},aresample=48000[aout]`);
  // áudio final SEMPRE AAC 48 kHz estéreo: narração mono vira estéreo (voz nos dois canais).
  // Mono toca num lado só ou fica mudo em alguns players — regra da squad: vídeo nunca sai sem som.
  const r = spawnSync(FFMPEG, [...ins, '-filter_complex', f.join(';'), '-map', '0:v', '-map', '[aout]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-t', String(DURATION_SEC), dest], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('Falha ao mixar áudio: ' + (r.stderr || '').slice(-500));
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE DE RENDER — rodada de ajuste que não mexeu numa animação não renderiza ela de novo
// A chave junta tudo que muda a imagem: HTML preparado (com ficha e params), duração, fps, tamanho, alfa, qualidade,
// áudio e a data/tamanho de cada arquivo local citado no HTML (e nos .js/.css que ele carrega) e na ficha.
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_DIR = opt['sem-cache'] ? null : path.resolve(process.cwd(), String(opt.cache || path.join(path.dirname(OUTPUT), 'cache', 'render')));
const EXT_ASSET = /\.(html?|js|mjs|css|json|svg|png|jpe?g|webp|gif|avif|ttf|otf|woff2?|mp4|webm|mov|m4v|mp3|wav|m4a|aac|ogg)$/i;

function carimbo(p) { try { const st = fs.statSync(p); return st.isFile() ? `${p}|${st.size}|${Math.round(st.mtimeMs)}` : ''; } catch { return ''; } }

function assetsCitados(texto, base, vistos, prof) {
  const re = /(?:src|href)\s*=\s*["']([^"'#?]+)|url\(\s*["']?([^"')#?]+)|["'`]([^"'`\s<>]+\.[a-z0-9]{2,5})["'`]/gi;
  let m;
  while ((m = re.exec(texto))) {
    const ref = (m[1] || m[2] || m[3] || '').trim();
    if (!ref || /^(data:|https?:|blob:|about:|#)/i.test(ref) || !EXT_ASSET.test(ref)) continue;
    let alvo;
    try { alvo = ref.startsWith('file://') ? decodeURI(ref.replace(/^file:\/\/\/?/, process.platform === 'win32' ? '' : '/')) : path.resolve(base, decodeURI(ref)); } catch { continue; }
    if (vistos.has(alvo) || !fs.existsSync(alvo)) continue;
    vistos.add(alvo);
    if (prof > 0 && /\.(js|mjs|css|html?)$/i.test(alvo)) {
      try { assetsCitados(fs.readFileSync(alvo, 'utf8'), path.dirname(alvo), vistos, prof - 1); } catch {}
    }
  }
}

function arquivosDaFicha(o, out) {
  if (typeof o === 'string') { if (o.length < 400 && EXT_ASSET.test(o) && fs.existsSync(o)) out.add(path.resolve(o)); }
  else if (o && typeof o === 'object') for (const v of Object.values(o)) arquivosDaFicha(v, out);
  return out;
}

function chaveCache(am) {
  const crypto = require('crypto');
  const h = crypto.createHash('sha1');
  const html = fs.readFileSync(INPUT_HTML, 'utf8');
  h.update('dafne-cache-2\n' + prepararHTML(html));
  h.update(JSON.stringify({ d: DURATION_SEC, FPS, WIDTH, HEIGHT, ALPHA, CRF, QUALIDADE, INTERMEDIARIO, ca: opt['codec-alfa'] || 'png' }));
  const vistos = new Set();
  assetsCitados(html, path.dirname(INPUT_HTML), vistos, 2);
  if (FICHA) arquivosDaFicha(FICHA, vistos);
  if (am) {
    if (AUDIO_MAP) h.update(fs.readFileSync(AUDIO_MAP, 'utf8'));
    for (const a of [am.narracao, am.bgm, ...(am.sfx || [])]) if (a && a.filePath) vistos.add(a.filePath);
    h.update(JSON.stringify(am));
  }
  vistos.delete(OUTPUT);
  for (const f of [...vistos].sort()) h.update(carimbo(f) + '\n');
  return h.digest('hex').slice(0, 20);
}

function lerDoCache(chave) {
  if (!CACHE_DIR) return false;
  const ext = path.extname(OUTPUT);
  const c = path.join(CACHE_DIR, chave + ext);
  if (!fs.existsSync(c)) return false;
  fs.copyFileSync(c, OUTPUT);
  return true;
}
function gravarNoCache(chave) {
  if (!CACHE_DIR) return;
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const c = path.join(CACHE_DIR, chave + path.extname(OUTPUT));
    fs.copyFileSync(OUTPUT, c);
  } catch (e) { console.warn('  [Dafne] cache não gravado: ' + e.message); }
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  try {
    if (QUADROS) {
      const prefixo = opt.out ? path.resolve(process.cwd(), String(opt.out)).replace(/\.(mp4|mov|png)$/i, '') : INPUT_HTML.replace(/\.html?$/i, '');
      fs.mkdirSync(path.dirname(prefixo), { recursive: true });
      const fotos = await capturarQuadros(prefixo);
      console.log(`[Dafne] ${fotos.length} quadro(s):\n  ` + fotos.join('\n  '));
      return;
    }
    // Portão obrigatório: só renderiza com plano aprovado pelo usuário (tools/plano.js)
    const P = require('./tools/plano');
    const planoPath = opt.plano ? path.resolve(process.cwd(), String(opt.plano)) : P.acharPlano(path.dirname(OUTPUT));
    const ap = P.verificar(planoPath);
    if (!ap.ok) {
      console.error(`\n[Dafne] RENDER BLOQUEADO — ${ap.motivo}\n        Para revisar sem renderizar: --quadros 0.5,2,4 (fotos de segundos específicos).\n`);
      process.exit(3);
    }
    console.log(`[Dafne] ${path.basename(INPUT_HTML)} → ${path.basename(OUTPUT)} | ${DURATION_SEC}s @ ${FPS}fps${ALPHA ? ' (alfa)' : ''}`);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    const am = ALPHA ? null : carregarAudioMap();
    const temAudio = am && (am.bgm || am.sfx.length || am.narracao);
    if (am && am.narracao) {
      const dn = parseFloat(spawnSync(FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', am.narracao.filePath], { encoding: 'utf8' }).stdout);
      if (dn > DURATION_SEC + 0.05) console.warn(`  [Dafne] ATENÇÃO: a narração tem ${dn.toFixed(2)}s e o vídeo ${DURATION_SEC}s — o final da voz será cortado.`);
    }
    if (REMIXAR) {
      if (!temAudio) throw new Error('--remixar precisa de áudio (audio_map.json e/ou --narracao).');
      console.log(`[Dafne] Refazendo só o áudio de ${path.basename(REMIXAR)} (sem renderizar de novo)`);
      const tmp = OUTPUT === REMIXAR ? OUTPUT.replace(/(\.\w+)$/, '.__comaudio$1') : OUTPUT;
      mixarAudio(REMIXAR, tmp, am);
      if (tmp !== OUTPUT) fs.renameSync(tmp, OUTPUT);
      console.log(`[Dafne] Pronto: ${OUTPUT}`);
      return;
    }
    const chave = CACHE_DIR ? chaveCache(temAudio ? am : null) : null;
    if (chave && lerDoCache(chave)) {
      console.log(`[Dafne] Nada mudou desde o último render — reaproveitado do cache: ${OUTPUT}`);
      return;
    }
    const t0 = Date.now();
    const destVideo = temAudio ? OUTPUT.replace(/(\.\w+)$/, '.__mudo$1') : OUTPUT;
    await renderizar(destVideo);
    if (temAudio) {
      console.log(`[Dafne] Mixando áudio: ${am.narracao ? 'narração + ' : ''}${am.bgm ? 'BGM + ' : ''}${am.sfx.length} SFX`);
      mixarAudio(destVideo, OUTPUT, am);
      fs.unlinkSync(destVideo);
    }
    if (chave) gravarNoCache(chave);
    const extra = REUSO.n ? `${REUSO.n} quadros repetidos reaproveitados` : '';
    console.log(`[Dafne] Pronto em ${((Date.now() - t0) / 1000).toFixed(0)}s${extra ? ` (${extra})` : ''}: ${OUTPUT}`);
  } catch (err) {
    console.error('[Dafne] Erro:', err.stack || err.message);
    process.exit(1);
  }
})();

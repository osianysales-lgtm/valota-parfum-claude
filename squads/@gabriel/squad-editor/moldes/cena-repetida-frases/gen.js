// Molde "cena repetida + frases" (inspiração: reel DefjNDYpi_S)
// Um clipe curto (~1 s) se repete; a cada repetição só a frase muda (corte seco).
// No fim entra um clipe extra com 1+ legendas. SEM música (ela põe no Instagram).
// Uso: node moldes/cena-repetida-frases/gen.js caminho/config.json
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = path.resolve(path.dirname(process.argv[2]));
const TMP = path.join(OUT, '_tmp');
fs.mkdirSync(TMP, { recursive: true });
const W = 1080, H = 1920, FPS = 30;

// Estilo aprovado (21/11/2026): Montserrat ExtraBold, branca, contorno preto relativamente grosso.
// grossura = traço branco extra; contorno = borda preta visível de cada lado (px, em 1080)
const EST = Object.assign({ fonte: 'Montserrat-ExtraBold.ttf', tam: 64, alarga: 1, grossura: 0, contorno: 5, espaco: 0, entrelinha: 74 }, cfg.estilo || {});
const FONT = path.join(__dirname, EST.fonte);
const css = `
@font-face{font-family:IS;src:url('file://${FONT}')}
html,body{margin:0;width:${W}px;height:${H}px;background:transparent}
.t{position:absolute;left:0;right:0;transform:translateY(-50%) scaleX(${EST.alarga});text-align:center;
  font-family:IS;font-size:${EST.tam}px;line-height:${EST.entrelinha}px;letter-spacing:${EST.espaco}px;white-space:nowrap}
.fundo{color:#000;-webkit-text-stroke:${EST.grossura + EST.contorno * 2}px #000;paint-order:stroke fill;
  filter:blur(0.3px) drop-shadow(0 2px 6px rgba(0,0,0,.35))}
.fundo .e{visibility:hidden}
.frente{color:#fff;-webkit-text-stroke:${EST.grossura}px #fff;paint-order:stroke fill}
.e{display:inline-block;transform:scaleX(${1 / EST.alarga});font-family:'Apple Color Emoji';-webkit-text-stroke:0;font-size:0.8em;vertical-align:0.05em}`;

async function legendas(lista) {
  const b = await puppeteer.launch();
  const pg = await b.newPage();
  await pg.setViewport({ width: W, height: H });
  const arquivos = [];
  for (const [i, l] of lista.entries()) {
    const linhas = l.texto.split('\n').map(s =>
      s.replace(/(\p{Extended_Pictographic})/gu, '<span class="e">$1</span>')).join('<br>');
    const html = path.join(TMP, `leg_${i}.html`);
    fs.writeFileSync(html, `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
      <div class="t fundo" style="top:${l.y ?? 71}%">${linhas}</div>
      <div class="t frente" style="top:${l.y ?? 71}%">${linhas}</div></body></html>`);
    await pg.goto('file://' + html);
    await pg.evaluate(() => document.fonts.ready);
    // encolhe só se a linha mais larga passar de 92% da tela
    await pg.evaluate((W) => { const t = document.querySelector('.frente'); const r = document.createRange(); r.selectNodeContents(t);
      const w = r.getBoundingClientRect().width;
      if (w > W * 0.92) document.querySelectorAll('.t').forEach(e => { const k = W * 0.92 / w;
        e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * k) + 'px'; e.style.lineHeight = (parseFloat(getComputedStyle(e).lineHeight) * k) + 'px'; }); }, W);
    const ok = await pg.evaluate(() => document.fonts.check('80px IS'));
    if (!ok) throw new Error('fonte Instrument Serif nao carregou');
    const f = path.join(TMP, `leg_${String(i).padStart(2, '0')}.png`);
    await pg.screenshot({ path: f, omitBackground: true });
    arquivos.push(f);
  }
  await b.close();
  return arquivos;
}

function ff(args) { execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' }); }
const base = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1`;

(async () => {
  const { cena, frases, final } = cfg;
  const todas = [...frases.map(t => ({ texto: t, y: cena.y })), ...final.legendas];
  const pngs = await legendas(todas);

  // 1) cena repetida: cada frase = mesmo trecho, com a legenda dela (corte seco)
  const partes = [];
  frases.forEach((_, i) => {
    const p = path.join(TMP, `parte_${String(i).padStart(2, '0')}.mp4`);
    ff(['-ss', String(cena.inicio), '-t', String(cena.dur), '-i', cena.arquivo, '-i', pngs[i],
      '-filter_complex', `[0:v]${base}[v];[v][1:v]overlay=0:0,format=yuv420p[o]`,
      '-map', '[o]', '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-r', String(FPS), p]);
    partes.push(p);
  });

  // 2) clipe final (ex.: cachorro) com legendas em sequência
  const fin = path.join(TMP, 'final.mp4');
  const leg = final.legendas;
  const inputs = ['-ss', String(final.inicio ?? 0), '-t', String(final.dur), '-i', final.arquivo];
  let fc = `[0:v]${base}[b0]`;
  leg.forEach((l, k) => {
    inputs.push('-i', pngs[frases.length + k]);
    fc += `;[b${k}][${k + 1}:v]overlay=0:0:enable='between(t,${l.de},${l.ate})'[b${k + 1}]`;
  });
  fc += `;[b${leg.length}]format=yuv420p[o]`;
  ff([...inputs, '-filter_complex', fc, '-map', '[o]', '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-r', String(FPS), fin]);
  partes.push(fin);

  // 3) junta tudo + trilha muda (o Instagram aceita melhor com faixa de áudio)
  const lista = path.join(TMP, 'lista.txt');
  fs.writeFileSync(lista, partes.map(p => `file '${p}'`).join('\n'));
  const saida = path.join(OUT, cfg.saida);
  ff(['-f', 'concat', '-safe', '0', '-i', lista, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-map', '0:v', '-map', '1:a', '-shortest', '-c:v', 'copy', '-c:a', 'aac', '-movflags', '+faststart', saida]);
  console.log('OK', saida);
})();

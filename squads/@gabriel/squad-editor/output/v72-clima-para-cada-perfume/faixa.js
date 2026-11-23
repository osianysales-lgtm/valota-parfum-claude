// v72 · faixa "-15°  +24°  ♾️°" igual ao reel @lautileria.ar (DczCNMfoT7C) → faixa.png 1080x1920 transparente
// node faixa.js   (usa o puppeteer da squad-editor; Chrome do Mac desenha o emoji ♾️ cinza igual ao do reel)
const path = require('path');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));
const C = require('./config.json');

const fonte = 'file://' + path.join(__dirname, 'fonts/Montserrat-VF.ttf');
const html = `<!doctype html><html><head><style>
@font-face{font-family:M;src:url('${fonte}');font-weight:100 900}
html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}
.faixa{position:absolute;left:0;width:1080px;top:${C.faixa.top}px;height:${C.faixa.alt}px;background:rgba(0,0,0,${C.faixa.opac})}
.t{position:absolute;top:${C.texto.y}px;transform:translate(-50%,-50%);font-family:M;font-weight:900;
   font-size:${C.texto.tam}px;line-height:1;color:${C.texto.cor};white-space:nowrap;letter-spacing:-1px;
   -webkit-text-stroke:${C.texto.contorno}px #0d0d0d;paint-order:stroke fill}
.g{font-size:${C.texto.tam * 0.62}px;vertical-align:top;position:relative;top:-6px;margin-left:2px;font-weight:700}
.inf{font-family:'Apple Color Emoji';-webkit-text-stroke:0;font-size:${C.texto.tam * 1.18}px;vertical-align:middle;position:relative;top:-6px}
</style></head><body>
<div class="faixa"></div>
${C.colunas.map((x, i) => `<div class="t" style="left:${x}px">${
    i === 2 ? '<span class="inf">♾️</span>' : C.rotulos[i]}<span class="g">°</span></div>`).join('')}
</body></html>`;

(async () => {
  const b = await puppeteer.launch({ headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 1080, height: 1920 });
  const fs = require('fs'); const arq = path.join(__dirname, 'faixa.html'); fs.writeFileSync(arq, html);
  await p.goto('file://' + arq, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, 'faixa.png'), omitBackground: true });
  await b.close();
  console.log('ok faixa.png');
})();

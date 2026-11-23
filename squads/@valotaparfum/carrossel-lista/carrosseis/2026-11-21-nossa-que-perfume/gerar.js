// Carrossel "NOSSA, que perfume" — cópia do @nevesperfume (Df5vZ8MGYfH) com árabes da Valota Parfum
// Letra: Bree Serif (igual à ref), tamanhos calibrados por sobreposição na ref (calib.js)
// node gerar.js  → saida/01.png … 15.png (1080x1350)
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const A = __dirname;
const b64 = (f, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(A, f)).toString('base64');
const FONT = b64('fonts/BreeSerif-Regular.ttf', 'font/ttf');
const FOTO = b64('foto-central-osiany.jpg', 'image/jpeg');
const PERG = '👱🏼‍♀️';

// [grife, árabe, pergunta (linhas), resposta (linhas), lado da figurinha]
const PARES = [
  { g: 'bleu', a: '6-cdn-iconic.jpg', q: [`${PERG} “MEU DEUS, Você está usando`, 'BLEU DE CHANEL????” 😱'], r: ['Como você sabe? 🫣'], lado: 'esq' },
  { g: 'imagination', a: '2-hawas-kobra.jpg', q: [`${PERG} “HUMMM, Esse eu conheço, é o`, 'Imagination, né?” 🫧'], r: ['Ele mesmo! 🔥'], lado: 'dir' },
  { g: 'erbagold', a: '1-bidaya-maktub-gold.jpg', q: [`${PERG} “NOSSA, que perfume gostoso,`, 'é o Erba Gold?” 🤌🏼'], r: ['Tipo isso! 🥵'], lado: 'esq' },
  { g: 'sauvage', a: '4-cdn-urban-elixir.jpg', q: [`${PERG} “Esse cheiro de EX, eu conheço!!`, 'Sauvage EDT, né?” 😭'], r: ['Ex não!!! 🫣'], lado: 'dir' },
  { g: 'vibrato', a: '3-rayhaan-amazonica.jpg', q: [`${PERG} “Cheirinho de refrigerante de laranja!`, 'é o vibrato?”'], r: ['É… Só que eu paguei', 'R$389,00!!!! 🥵'], lado: 'esq' },
  { g: 'aventus', a: '5-cdnim-limited-edition.jpg', q: [`${PERG} “AHHH, esse que é o famoso`, 'Creed Aventus?” 😮‍💨'], r: ['Tipo isso!', 'Mas com mais performance! 🥵'], lado: 'dir' },
  { g: 'lemaleelixir', a: '7-lattafa-the-kingdom.jpg', q: [`${PERG} “BAUNILHA E TABACO.`, 'Só pode ser o Le male elixir!!!!” 😊'], r: ['Acertou!!! ❤️'], lado: 'esq' },
];

const CSS = `
@font-face{font-family:Bree;src:url(${FONT})}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:Bree,serif;background:#000}
.bg{position:absolute;inset:0;background-repeat:no-repeat}
.t{position:absolute;left:30px;right:30px;text-align:center;color:#fff;white-space:nowrap}
.t div{display:block}
.q{font-size:54px;line-height:78px;text-shadow:0 0 3px rgba(0,0,0,.75),0 2px 8px rgba(0,0,0,.6),0 0 20px rgba(0,0,0,.4)}
.r{-webkit-text-stroke:0;paint-order:stroke fill;text-shadow:
  -2px -2px 0 #111,2px -2px 0 #111,-2px 2px 0 #111,2px 2px 0 #111,0 -2.6px 0 #111,0 2.6px 0 #111,-2.6px 0 0 #111,2.6px 0 0 #111,0 3px 8px rgba(0,0,0,.45)}
.emo{font-family:"Apple Color Emoji";text-shadow:none;-webkit-text-stroke:0}
.stk{position:absolute;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))}
.salva{position:absolute;right:124px;bottom:58px;font-size:22px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.mark{position:absolute;right:86px;bottom:42px;width:34px;height:42px}
`;

// emojis sem a sombra/contorno do texto
const emo = s => s.replace(/(\p{Extended_Pictographic}(?:️|‍|\p{Emoji_Modifier}|\p{Extended_Pictographic})*)/gu, '<span class="emo">$1</span>');

function fotoCentral(zoom = 1.125, ox = 0, oy = -40) {
  const w = 960 * zoom, h = 1280 * zoom;
  return `<div class="bg" style="background-image:url(${FOTO});background-size:${w}px ${h}px;background-position:${ox}px ${oy}px"></div>`;
}

function slidePergunta(p, i) {
  const img = b64('grife/' + p.g + '.png', 'image/png');
  const H = { bleu: 146, aventus: 160 }[p.g] || 168, esq = p.lado === 'esq';
  const rot = esq ? -8 : 9;
  const pos = esq ? `left:${118}px` : `right:${150}px`;
  const capa = i === 0 ? `<div class="salva">Já salva pra não perder!</div>
    <svg class="mark" viewBox="0 0 34 42"><path d="M3 3h28v36L17 28 3 39z" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>` : '';
  return `${fotoCentral()}
  <div class="t q" style="top:225px">${p.q.map(l => `<div>${emo(l)}</div>`).join('')}</div>
  <img class="stk" src="${img}" style="${pos};top:358px;height:${H}px;transform:rotate(${rot}deg)">
  ${capa}`;
}

function slideResposta(p) {
  const img = b64('arabes/' + p.a, 'image/jpeg');
  const duas = p.r.length > 1;
  const fs_ = duas ? 66 : 78, lh = duas ? 82 : 90;
  const top = duas ? 300 : 360;
  return `<div class="bg" style="background-image:url(${img});background-size:cover;background-position:center"></div>
  <div class="t r" style="top:${top}px;font-size:${fs_}px;line-height:${lh}px">${p.r.map(l => `<div>${emo(l)}</div>`).join('')}</div>`;
}

function slideFinal() {
  return `${fotoCentral(1.3, 0, -250)}
  <div class="t q" style="top:215px;font-size:72px;line-height:104px">
    <div>${emo(PERG + '”Como você faz para ter')}</div><div>um cheiro tão BOM assim??”</div>
    <div style="font-size:62px">${emo('😮‍💨🔥❤️🥵')}</div></div>
  <div class="t q" style="top:900px;font-size:54px;line-height:70px">
    <div>Eu sigo @valotaparfum</div><div style="font-size:44px;letter-spacing:-6px">${emo('🤦🏻‍♀️🤦🏻‍♀️🤦🏻‍♀️🤦🏻‍♀️')}</div></div>`;
}

(async () => {
  const so = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  fs.mkdirSync(path.join(A, 'saida'), { recursive: true });
  const slides = [];
  PARES.forEach((p, i) => { slides.push(slidePergunta(p, i)); slides.push(slideResposta(p)); });
  slides.push(slideFinal());
  const b = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const pg = await b.newPage(); await pg.setViewport({ width: 1080, height: 1350 });
  for (let i = 0; i < slides.length; i++) {
    if (so && !so.includes(i + 1)) continue;
    await pg.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS}</style><body>${slides[i]}</body>`);
    await pg.evaluate(() => document.fonts.ready);
    // encolhe linha que passar da largura útil (como "Cheirinho de refrigerante de laranja!")
    await pg.evaluate(() => { document.querySelectorAll('.t div').forEach(d => { d.style.display = 'inline-block'; const max = 1000; let fs = parseFloat(getComputedStyle(d).fontSize); while (d.getBoundingClientRect().width > max && fs > 30) { fs -= 1; d.style.fontSize = fs + 'px'; } d.style.display = 'block'; }); });
    const out = path.join(A, 'saida', String(i + 1).padStart(2, '0') + '.png');
    await pg.screenshot({ path: out });
    console.log('ok', out);
  }
  await b.close();
})();

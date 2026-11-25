// Post estático "O homem que usa esse perfume… IMPOSSÍVEL DE IGNORAR!!!" — Hawas Black (Rasasi)
// Ref: @leperfumaria.br instagram.com/p/Df5vAIGpaeY (tweet branco, frase centralizada + 2 fotos lado a lado).
// Pedido 24/11: mesmo perfume e frase, layout um pouco diferente.
// Aqui: creme (último post do feed = Lista Negra petróleo → este vai claro), frase à esquerda,
// "IMPOSSÍVEL DE IGNORAR!!!" em tarja petróleo, fotos em grade assimétrica + card LEMBRA O (Cedro).
// Fotos SEM recorte: mão = hawas-video/fotos/02-hawas-black.jpg · estúdio = v81 frascos/entrada/hawas.jpg (fundo branco, vai em card branco)
// node gerar.js → saida/hawas-black-impossivel-de-ignorar.png (1080x1440)
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const A = __dirname;
const b64 = (f, mime) => `data:${mime};base64,` + fs.readFileSync(path.resolve(A, f)).toString('base64');
const AVATAR = b64('../../avatar.png', 'image/png');
const MAO = b64('fotos/hawas-black-mao.jpg', 'image/jpeg');
const ESTUDIO = b64('fotos/hawas-black-estudio.jpg', 'image/jpeg');
const MONT = 'file://' + path.resolve(A, '../../fonts/Montserrat-VariableFont_wght.ttf');
const GOTHAM = 'file:///Users/osianysales/Library/Fonts/Gotham%20Black.otf';

const CREME = '#F2E8D8', NOITE = '#0A1F23', PETROLEO = '#0F2E33', LUZ = '#1A4A52', CEDRO = '#6B4430', AMBAR = '#D49A4E';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:M;src:url('${MONT}');font-weight:100 900}
@font-face{font-family:G;src:url('${GOTHAM}')}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1440px;background:${CREME};font-family:M;color:${NOITE};position:relative;overflow:hidden}
/* grão leve de papel */
body::before{content:'';position:absolute;inset:0;opacity:.05;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
.hd{position:absolute;left:80px;top:92px;display:flex;align-items:center;gap:22px}
.hd img{width:96px;height:96px;border-radius:50%;object-fit:cover}
.hd .n{font-family:G;font-size:34px;letter-spacing:.2px}
.hd .u{font-size:26px;font-weight:400;color:${LUZ};opacity:.8;margin-top:4px}
.fr{position:absolute;left:80px;top:238px;width:920px}
.fr p{font-size:50px;font-weight:600;line-height:1.22;letter-spacing:-.3px}
.tarjas{margin-top:28px;display:flex;flex-direction:column;align-items:flex-start;gap:14px;transform:rotate(-1.4deg);transform-origin:left center}
.tarja{background:${PETROLEO};color:${CREME};white-space:nowrap;
  font-weight:900;font-size:76px;line-height:1;letter-spacing:-.5px;padding:18px 30px 16px;border-radius:14px;
  box-shadow:0 9px 0 ${AMBAR}}
.tarja.b{margin-left:70px}
.g{position:absolute;left:80px;top:686px;width:920px;height:644px;display:flex;gap:22px}
.mao{width:556px;height:100%;border-radius:28px;overflow:hidden}
.mao img{width:100%;height:100%;object-fit:cover;object-position:center 40%}
.col{flex:1;display:flex;flex-direction:column;gap:22px}
.est{flex:1;background:#fff;border-radius:28px;overflow:hidden;position:relative}
.est img{position:absolute;left:50%;top:40%;width:330px;transform:translate(-50%,-50%)}
.est .nm{position:absolute;left:0;right:0;bottom:20px;text-align:center}
.est .nm b{display:block;font-weight:800;font-size:27px;letter-spacing:2px}
.est .nm span{font-weight:300;font-size:22px;letter-spacing:1px}
.lem{height:212px;background:${CEDRO};color:${CREME};border-radius:28px;padding:30px 32px;display:flex;flex-direction:column;justify-content:center}
.lem .k{font-weight:700;font-size:21px;letter-spacing:5px;opacity:.85}
.lem .p{font-weight:900;font-size:52px;line-height:1;margin-top:12px}
.lem .m{font-weight:300;font-size:24px;letter-spacing:1px;margin-top:8px}
</style></head><body>
<div class="hd"><img src="${AVATAR}"><div><div class="n">Valota Parfum</div><div class="u">@valotaparfum</div></div></div>
<div class="fr">
  <p>O homem que usa esse perfume não é só cheiroso não… ele é além,</p>
  <div class="tarjas"><div class="tarja">IMPOSSÍVEL</div><div class="tarja b">DE IGNORAR!!!</div></div>
</div>
<div class="g">
  <div class="mao"><img src="${MAO}"></div>
  <div class="col">
    <div class="est"><img src="${ESTUDIO}"><div class="nm"><b>HAWAS BLACK</b><span>Rasasi</span></div></div>
    <div class="lem"><div class="k">LEMBRA O</div><div class="p">Hacivat</div><div class="m">Nishane</div></div>
  </div>
</div>
</body></html>`;

(async () => {
  fs.mkdirSync(path.join(A, 'saida'), { recursive: true });
  const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
  const br = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files'], ...(CHROME ? { executablePath: CHROME } : {}) });
  const pg = await br.newPage();
  await pg.setViewport({ width: 1080, height: 1440 });
  const tmp = path.join(A, '_tmp.html');
  fs.writeFileSync(tmp, html);
  await pg.goto('file://' + tmp, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  const out = path.join(A, 'saida', 'hawas-black-impossivel-de-ignorar.png');
  await pg.screenshot({ path: out });
  fs.unlinkSync(tmp);
  console.log('ok', out);
  await br.close();
})();

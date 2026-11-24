// Carrossel "4 perfumes: dia, noite, versátil e um mais... 🔞" — v2 "o mais parecido com o dele"
// Ref @ruanparfum_ DgEAyjMjfWB (5 lâminas). 24/11 ela reprovou a v1 colorida (gerar_v1_colorido.js):
// "faz o mais parecido com o dele, ficou muito colorido".
// Igual à ref: capa = foto borrada + balões claros + avatar; lâminas = frasco grande no veludo, palavra em Didot
// no canto, "@valotaparfum" com filetes dourados. Muda só: sem "Mano", "É um mais... 🔞", veludo PETRÓLEO.
// node gerar.js [1,2,...] → saida/01.png … 05.png (1080x1440)
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const A = __dirname;
const b64 = (f, mime = 'image/png') => `data:${mime};base64,` + fs.readFileSync(path.resolve(A, f)).toString('base64');
const AVATAR = b64('../../../carrossel-tweet/avatar.png');
const img = n => b64('frascos/' + n + '.png');
const FR = {};
for (const n of ['sky', 'xlnc', 'elite', 'muharib']) {
  const b = fs.readFileSync(path.join(A, 'frascos', n + '.png'));
  FR[n] = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
const CREME = '#F2E8D8', NOITE = '#0A1F23', AMBAR = '#D49A4E';

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1440px;overflow:hidden;position:relative;background:${NOITE};font-family:'Helvetica Neue',Helvetica,'Apple Color Emoji',sans-serif}
.abs{position:absolute}
.rot{position:absolute;left:84px;top:150px;font-family:Didot,'Bodoni 72',serif;font-weight:700;font-size:124px;line-height:1;color:#fff;
  text-shadow:0 3px 2px rgba(0,0,0,.7),0 0 34px rgba(0,0,0,.6);letter-spacing:-1px}
.lembra{position:absolute;left:88px;top:296px;color:#fff;font-size:40px;font-weight:500;line-height:1.15;letter-spacing:-.3px;text-shadow:0 2px 3px rgba(0,0,0,.75),0 0 20px rgba(0,0,0,.65)}
.lembra b{font-weight:800}.lembra small{display:block;font-size:25px;letter-spacing:3px;font-weight:700;color:#fff;margin-top:8px}
.assina{position:absolute;left:0;right:0;bottom:70px;display:flex;align-items:center;justify-content:center;gap:28px;color:#fff;font-size:40px;letter-spacing:-.5px;text-shadow:0 2px 10px rgba(0,0,0,.5)}
.assina i{display:block;width:96px;height:3px;border-radius:2px;background:linear-gradient(90deg,rgba(212,154,78,0),${AMBAR} 35%,${AMBAR})}
.assina i:last-child{background:linear-gradient(90deg,${AMBAR},${AMBAR} 65%,rgba(212,154,78,0))}
.assina b{font-weight:700}.assina span{font-weight:400}
`;
const assina = `<div class="assina"><i></i><div><b>@valota</b><span>parfum</span></div><i></i></div>`;

// veludo amassado petróleo (dobras diagonais com brilho + pontinhos de brilho do veludo)
const veludo = seed => `<svg class="abs" width="1080" height="1440" style="inset:0">
<filter id="v" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.0011 0.0058" numOctaves="3" seed="${seed}" result="n"/>
 <feGaussianBlur in="n" stdDeviation="8" result="nb"/>
 <feDiffuseLighting in="nb" surfaceScale="75" diffuseConstant="1" lighting-color="#fff" result="l0"><feDistantLight azimuth="225" elevation="32"/></feDiffuseLighting>
 <feComponentTransfer in="l0" result="l"><feFuncR type="gamma" exponent="2.6" amplitude="1.25"/><feFuncG type="gamma" exponent="2.6" amplitude="1.25"/><feFuncB type="gamma" exponent="2.6" amplitude="1.25"/></feComponentTransfer>
 <feComponentTransfer in="l" result="cor"><feFuncR type="linear" slope="0.16" intercept="0.035"/><feFuncG type="linear" slope="0.46" intercept="0.11"/><feFuncB type="linear" slope="0.48" intercept="0.13"/></feComponentTransfer>
 <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="${seed + 3}" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.8  0 0 0 0 1  0 0 0 0 1  0 0 0 14 -8.6" result="p"/>
 <feComposite in="p" in2="l" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="b"/>
 <feGaussianBlur in="b" stdDeviation="0.5" result="b2"/>
 <feBlend in="b2" in2="cor" mode="screen"/>
</filter>
<g transform="rotate(-28 540 720)"><rect x="-500" y="-500" width="2080" height="2440" filter="url(#v)"/></g></svg>
<div class="abs" style="inset:0;background:radial-gradient(ellipse 560px 330px at 22% 17%, rgba(10,31,35,.62) 0%, rgba(10,31,35,0) 100%)"></div>
<div class="abs" style="inset:0;background:radial-gradient(ellipse 760px 900px at 38% 34%, rgba(242,232,216,.10) 0%, rgba(242,232,216,0) 60%),radial-gradient(ellipse 820px 1000px at 50% 50%, rgba(10,31,35,0) 50%, rgba(10,31,35,.6) 100%)"></div>`;

// frasco grande no centro + sombra dura projetada pra direita (luz de sol vindo da esquerda, como na ref)
const frasco = (n, h, base, cx, rot = 0) => {
  const p = FR[n]; const w = Math.round(h * p.w / p.h); const L = cx - w / 2, T = base - h;
  return `<img class="abs" src="${img(n)}" style="height:${h}px;left:${L + 70}px;top:${T + 26}px;transform:rotate(${rot}deg) skewX(-14deg);transform-origin:50% 100%;filter:brightness(0) blur(7px);opacity:.62">
  <img class="abs" src="${img(n)}" style="height:${h}px;left:${L}px;top:${T}px;transform:rotate(${rot}deg);transform-origin:50% 60%;filter:drop-shadow(0 18px 22px rgba(0,0,0,.55))">`;
};
// LEMBRA O (regra de 24/11: todo perfume indicado leva o inspirado)
const lembra = (nome, casa) => `<div class="lembra">lembra o <b>${nome}</b><small>${casa}</small></div>`;
const doc = corpo => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${corpo}</body></html>`;

const SLIDES = [
  // 01 · capa IGUAL À REF (24/11: "faz de novo, é como se a pessoa tivesse me mandando mensagem, coloca 'valotaa' e deixa minha foto de fundo")
  // Foto dela borrada no fundo + balões recebidos; "Mano" → "Valotaa"; "derruba calcinha hahahah" → "É um mais... 🔞".
  // Avatar ao lado do último balão = quem mandou (perfil genérico). Capa WhatsApp anterior em gerar_v3_capa_whatsapp.js.
  () => {
    const bolha = t => `<div style="align-self:flex-start;background:rgba(242,232,216,.93);color:#111;font-size:54px;font-weight:400;letter-spacing:-.5px;padding:30px 46px 28px;border-radius:60px;box-shadow:0 6px 24px rgba(0,0,0,.18)">${t}</div>`;
    const perfil = `<svg width="114" height="114" viewBox="0 0 114 114"><rect width="114" height="114" fill="#DCD6E2"/><circle cx="57" cy="44" r="21" fill="#F2E8D8"/><path d="M17 112c3-24 20-38 40-38s37 14 40 38z" fill="#F2E8D8"/></svg>`;
    return doc(`
    <div class="abs" style="inset:-80px;background:url(${AVATAR}) 50% 30%/cover;filter:blur(30px) brightness(.8) saturate(.9)"></div>
    <div class="abs" style="inset:0;background:rgba(10,31,35,.18)"></div>
    <div class="abs" style="left:210px;right:40px;top:440px;display:flex;flex-direction:column;gap:16px">
      ${bolha('Valotaa')}
      ${bolha('Me indica 4 perfumes aí')}
      ${bolha('Um pra noite, dia, versátil')}
      <div style="position:relative;align-self:flex-start">${bolha('E um mais... <span style="font-size:58px;vertical-align:-4px">🔞</span> haha')}
        <div style="position:absolute;left:-150px;top:0;width:124px;height:124px;border-radius:50%;border:5px solid #fff;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.3)">${perfil}</div></div>
    </div>
    ${assina}`);
  },
  // 02 · Dia
  () => doc(`${veludo(7)}<div class="rot">Dia</div>${lembra('Météore', 'LOUIS VUITTON')}${frasco('sky', 760, 1185, 570)}${assina}`),
  // 03 · Noite (frasco inclinado, como na ref)
  () => doc(`${veludo(21)}<div class="rot">Noite</div>${lembra('Bottled Beyond', 'HUGO BOSS')}${frasco('xlnc', 900, 1190, 600, 22)}${assina}`),
  // 04 · Versátil
  () => doc(`${veludo(13)}<div class="rot">Versátil</div>${lembra('Wild Vetiver', 'CREED')}${frasco('elite', 800, 1170, 570)}${assina}`),
  // 05 · 🔞 ...
  () => doc(`${veludo(31)}
    <div class="abs" style="left:84px;top:150px;display:flex;align-items:flex-end;gap:22px">
      <span style="font-size:150px;line-height:1;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))">🔞</span>
      <span style="display:flex;gap:16px;margin-bottom:16px">${'<i style="display:block;width:24px;height:24px;border-radius:50%;background:#fff"></i>'.repeat(3)}</span></div>
    ${lembra('Naxos', 'XERJOFF')}
    ${frasco('muharib', 860, 1190, 600)}${assina}`),
  // 06 · CTA SEGUIR pro TikTok (24/11: "esqueceu de fazer um cta para me seguirem no final, é para o tiktok")
  // Mesmo veludo/Didot das lâminas; cartão de perfil estilo TikTok (avatar com "+") sem números; os 4 frascos de recap.
  () => {
    const fr = (n, h, cx, base) => { const p = FR[n]; const w = Math.round(h * p.w / p.h);
      return `<img class="abs" src="${img(n)}" style="height:${h}px;left:${cx - w / 2}px;top:${base - h}px;filter:drop-shadow(10px 14px 10px rgba(0,0,0,.6))">`; };
    return doc(`${veludo(43)}
    <div class="rot" style="font-size:112px;line-height:1.02">Segue a<br>Valota Parfum</div>
    <div class="lembra" style="top:398px;font-size:42px;font-weight:500">pra mais dicas e achados<br>de perfumaria 🤍</div>
    <div class="abs" style="left:0;right:0;top:530px;display:flex;flex-direction:column;align-items:center">
      <div style="position:relative;width:250px;height:250px">
        <div style="width:250px;height:250px;border-radius:50%;background:url(${AVATAR}) center 30%/cover;border:5px solid ${CREME};box-shadow:0 14px 36px rgba(0,0,0,.55)"></div>
        <div style="position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);width:68px;height:68px;border-radius:50%;background:${AMBAR};border:5px solid ${CREME};display:flex;align-items:center;justify-content:center">
          <svg width="30" height="30" viewBox="0 0 30 30" stroke="${NOITE}" stroke-width="5.5" stroke-linecap="round"><path d="M15 3v24M3 15h24"/></svg></div>
      </div>
      <div style="margin-top:52px;color:#fff;font-size:48px;font-weight:700;letter-spacing:-.5px;text-shadow:0 2px 10px rgba(0,0,0,.5)">@valotaparfum</div>
      <div style="margin-top:24px;background:${AMBAR};color:${NOITE};font-size:40px;font-weight:700;padding:18px 110px;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.45)">Seguir</div>
    </div>
    ${fr('sky', 215, 215, 1350)}${fr('xlnc', 255, 420, 1350)}${fr('elite', 245, 650, 1350)}${fr('muharib', 255, 865, 1350)}`);
  },
];

(async () => {
  const pedidos = process.argv[2] ? process.argv[2].split(',').map(Number) : SLIDES.map((_, i) => i + 1);
  fs.mkdirSync(path.join(A, 'saida'), { recursive: true });
  const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
  const br = await puppeteer.launch({ headless: 'new', ...(CHROME ? { executablePath: CHROME } : {}) });
  const pg = await br.newPage();
  await pg.setViewport({ width: 1080, height: 1440 });
  for (const n of pedidos) {
    await pg.setContent(SLIDES[n - 1](), { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    const out = path.join(A, 'saida', String(n).padStart(2, '0') + '.png');
    await pg.screenshot({ path: out });
    console.log('ok', out);
  }
  await br.close();
})();

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
  // 01 · capa estilo PRINT DE WHATSAPP (24/11: "o começo consegue fazer como se fosse uma conversa do whatsapp")
  // Tela de quem manda mensagem pra Valota Parfum; modo escuro nos tons da paleta (Noite/Petróleo/Luz/Menta/Creme).
  // Mesmas falas da ref, sem o "Mano"; "derruba calcinha" → "É um mais... 🔞".
  () => {
    const PET = '#0F2E33', LUZ = '#1A4A52', MENTA = '#7DBFB3';
    const tique = `<svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="${MENTA}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11l5 5L19 3"/><path d="M14 14l2 2L28 3"/></svg>`;
    const msg = (t, primeira) => `<div style="align-self:flex-end;position:relative;max-width:820px;background:${LUZ};color:${CREME};font-size:50px;line-height:1.22;letter-spacing:-.3px;padding:20px 30px 18px 34px;border-radius:${primeira ? '30px 0 30px 30px' : '30px'};box-shadow:0 2px 3px rgba(0,0,0,.25)">
      ${primeira ? `<i style="position:absolute;right:-22px;top:0;width:24px;height:26px;background:${LUZ};clip-path:polygon(0 0,100% 0,0 100%)"></i>` : ''}
      <span>${t}</span><span style="display:inline-flex;align-items:center;gap:8px;margin-left:22px;font-size:25px;color:rgba(242,232,216,.6);vertical-align:-2px">21:47 ${tique}</span></div>`;
    // papel de parede com rabiscos (frasquinho, coração, estrela, gota) bem apagados, como o fundo do WhatsApp
    const doodle = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' fill='none' stroke='%23F2E8D8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><rect x='30' y='44' width='44' height='58' rx='10'/><rect x='42' y='28' width='20' height='16' rx='3'/><path d='M178 66c-10-16-36-8-28 14l28 24 28-24c8-22-18-30-28-14z'/><path d='M60 182l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3z'/><path d='M196 162c12 18 18 28 18 38a18 18 0 0 1-36 0c0-10 6-20 18-38z'/><circle cx='130' cy='136' r='5'/><circle cx='232' cy='240' r='4'/></svg>`;
    return doc(`
    <div class="abs" style="inset:0;background:${NOITE}"></div>
    <div class="abs" style="inset:0;opacity:.06;background-image:url(&quot;data:image/svg+xml;utf8,${doodle}&quot;);background-size:260px 260px"></div>
    <!-- barra de status + cabeçalho do contato -->
    <div class="abs" style="left:0;right:0;top:0;height:300px;background:${PET};box-shadow:0 2px 10px rgba(0,0,0,.35)">
      <div class="abs" style="left:70px;top:38px;color:${CREME};font-size:38px;font-weight:600">21:47</div>
      <div class="abs" style="right:66px;top:42px;display:flex;gap:14px;align-items:center">
        <svg width="44" height="28" viewBox="0 0 44 28" fill="${CREME}"><rect x="0" y="18" width="7" height="10" rx="2"/><rect x="11" y="12" width="7" height="16" rx="2"/><rect x="22" y="6" width="7" height="22" rx="2"/><rect x="33" y="0" width="7" height="28" rx="2"/></svg>
        <svg width="62" height="30" viewBox="0 0 62 30" fill="none"><rect x="1.5" y="1.5" width="52" height="27" rx="8" stroke="${CREME}" stroke-opacity=".5" stroke-width="3"/><rect x="6" y="6" width="38" height="18" rx="4" fill="${CREME}"/><rect x="57" y="10" width="4" height="10" rx="2" fill="${CREME}" fill-opacity=".5"/></svg></div>
      <div class="abs" style="left:34px;top:140px;display:flex;align-items:center;gap:22px">
        <svg width="40" height="64" viewBox="0 0 40 64" fill="none" stroke="${CREME}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M34 6L8 32l26 26"/></svg>
        <div style="width:116px;height:116px;border-radius:50%;background:url(${AVATAR}) center 30%/cover"></div>
        <div style="margin-left:6px"><div style="color:${CREME};font-size:46px;font-weight:600;letter-spacing:-.5px">Valota Parfum</div>
          <div style="color:${MENTA};font-size:32px;margin-top:4px">digitando…</div></div></div>
      <div class="abs" style="right:60px;top:170px;display:flex;gap:58px;align-items:center">
        <svg width="62" height="44" viewBox="0 0 62 44" fill="none" stroke="${CREME}" stroke-width="5" stroke-linejoin="round"><rect x="3" y="5" width="38" height="34" rx="8"/><path d="M41 18l17-10v28L41 26z"/></svg>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="${CREME}" stroke-width="2.1" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>
        <svg width="14" height="54" viewBox="0 0 14 54" fill="${CREME}"><circle cx="7" cy="7" r="6"/><circle cx="7" cy="27" r="6"/><circle cx="7" cy="47" r="6"/></svg></div>
    </div>
    <!-- etiqueta de data -->
    <div class="abs" style="left:0;right:0;top:400px;display:flex;justify-content:center"><span style="background:${PET};color:rgba(242,232,216,.75);font-size:30px;font-weight:500;letter-spacing:.5px;padding:12px 28px;border-radius:16px">HOJE</span></div>
    <!-- mensagens -->
    <div class="abs" style="left:60px;right:52px;top:540px;display:flex;flex-direction:column;gap:14px">
      ${msg('Me indica 4 perfumes aí', true)}
      ${msg('Um pra noite, dia, versátil')}
      ${msg('É um mais... <span style="font-size:54px;vertical-align:-4px">🔞</span>')}
    </div>
    <!-- barra de digitar -->
    <div class="abs" style="left:28px;right:28px;top:1150px;display:flex;gap:18px;align-items:center">
      <div style="flex:1;height:112px;border-radius:56px;background:${PET};display:flex;align-items:center;padding:0 36px;gap:26px;color:rgba(242,232,216,.5);font-size:42px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(242,232,216,.6)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/><circle cx="9" cy="9.5" r="1" fill="rgba(242,232,216,.6)"/><circle cx="15" cy="9.5" r="1" fill="rgba(242,232,216,.6)"/></svg>
        <span style="flex:1">Mensagem</span>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="rgba(242,232,216,.6)" stroke-width="2" stroke-linecap="round"><path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/></svg>
        <svg width="50" height="46" viewBox="0 0 26 24" fill="none" stroke="rgba(242,232,216,.6)" stroke-width="2" stroke-linejoin="round"><path d="M3 7h4l2-3h8l2 3h4v13H3z"/><circle cx="13" cy="13" r="4"/></svg></div>
      <div style="width:112px;height:112px;border-radius:50%;background:${MENTA};display:flex;align-items:center;justify-content:center">
        <svg width="40" height="54" viewBox="0 0 20 27" fill="none" stroke="${NOITE}" stroke-width="2.4" stroke-linecap="round"><rect x="6" y="1.5" width="8" height="15" rx="4" fill="${NOITE}"/><path d="M2 12a8 8 0 0 0 16 0M10 20v5"/></svg></div>
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

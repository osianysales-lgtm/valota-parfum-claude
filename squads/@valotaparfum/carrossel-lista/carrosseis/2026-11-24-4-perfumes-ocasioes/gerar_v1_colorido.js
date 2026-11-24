// Carrossel "4 perfumes: dia, noite, versátil e um mais... 🔞" (ref @ruanparfum_ DgEAyjMjfWB)
// Pedido 24/11: tirar o "Mano", trocar "derruba calcinha" por "um mais... 🔞", paleta Valota, criativo.
// node gerar.js [1,2,...] → saida/01.png … 06.png (1080x1440)
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const A = __dirname;
const b64 = (f, mime = 'image/png') => `data:${mime};base64,` + fs.readFileSync(path.resolve(A, f)).toString('base64');
const FONTE = b64('../../../carrossel-tweet/fonts/Montserrat-VariableFont_wght.ttf', 'font/ttf');
const FONTE_I = b64('../../../carrossel-tweet/fonts/Montserrat-Italic-VariableFont_wght.ttf', 'font/ttf');
const AVATAR = b64('../../../carrossel-tweet/avatar.png');
const img = n => b64('frascos/' + n + '.png');

// Cartela oficial (nenhum HEX novo)
const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMBAR = '#D49A4E', AMARELO = '#FFC93C',
  PIMENTA = '#9C452A', ROSA = '#E6AEB9', MENTA = '#7DBFB3', ALGODAO = '#DCD6E2', CEDRO = '#6B4430';

const CSS = `
@font-face{font-family:M;src:url(${FONTE});font-weight:100 900}
@font-face{font-family:M;src:url(${FONTE_I});font-weight:100 900;font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1440px;overflow:hidden;position:relative;font-family:M,'Apple Color Emoji',sans-serif;color:${NOITE};background:${CREME}}
.abs{position:absolute}
.grao{position:absolute;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.vinheta{position:absolute;inset:0;pointer-events:none}
/* assinatura igual à ref: ── @valotaparfum ── */
.assina{position:absolute;left:0;right:0;bottom:40px;display:flex;align-items:center;justify-content:center;gap:26px;font-size:32px;letter-spacing:-.3px}
.assina i{display:block;width:120px;height:3px;border-radius:2px}
.assina b{font-weight:800}.assina span{font-weight:400}
/* lâmina de perfume */
.rot{position:absolute;left:78px;top:92px;font-weight:900;font-style:italic;font-size:158px;line-height:1;letter-spacing:-6px}
.chip{position:absolute;left:84px;top:270px;font-weight:800;font-size:25px;letter-spacing:2.5px;padding:11px 18px 10px;border-radius:999px;line-height:1}
.frasco{position:absolute;filter:drop-shadow(0 30px 34px rgba(10,31,35,.42))}
.sombra{position:absolute;height:34px;border-radius:50%;background:radial-gradient(ellipse at center, rgba(10,31,35,.5) 0%, rgba(10,31,35,0) 70%)}
.info{position:absolute;left:78px;right:78px;top:1012px}
.nome{font-weight:900;font-size:68px;line-height:1;letter-spacing:-2.5px}
.casa{font-weight:700;font-size:23px;letter-spacing:4px;margin-top:12px;opacity:.75}
.notas{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}
.notas span{font-weight:700;font-size:26px;padding:10px 20px 9px;border-radius:999px;line-height:1}
.frase{margin-top:22px;font-weight:600;font-style:italic;font-size:30px;line-height:40px;letter-spacing:-.3px;max-width:900px}
`;

const assina = (cor, linha) => `<div class="assina" style="color:${cor}"><i style="background:${linha}"></i><div><b>@valota</b><span>parfum</span></div><i style="background:${linha}"></i></div>`;
const doc = (corpo, fundo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="background:${fundo}">${corpo}<div class="grao"></div></body></html>`;

// frasco centralizado: altura h, base em y (px do topo)
const frasco = (n, h, base, cx = 540, extra = '') => {
  const p = FR[n]; const w = Math.round(h * p.w / p.h);
  return `<div class="sombra" style="left:${cx - w * .62}px;width:${w * 1.24}px;top:${base - 18}px"></div>
  <img class="frasco" src="${img(n)}" style="height:${h}px;left:${cx - w / 2}px;top:${base - h}px;${extra}">`;
};
const FR = {}; // proporções lidas dos PNGs
for (const n of ['sky', 'xlnc', 'elite', 'muharib']) {
  const b = fs.readFileSync(path.join(A, 'frascos', n + '.png'));
  FR[n] = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const info = (p, c) => `<div class="info" style="color:${c.txt}">
  <div class="nome">${p.nome}</div><div class="casa">${p.casa}</div>
  <div class="notas">${p.notas.map(x => `<span style="background:${c.pilula};color:${c.pilulaTxt}">${x}</span>`).join('')}</div>
  <div class="frase">${p.frase}</div></div>`;

const SLIDES = [];

// 01 · CAPA — a conversa do direct (sem o "Mano"; "derruba calcinha" → "um mais... 🔞")
SLIDES.push(() => {
  const bolha = (t, extra = '') => `<div style="align-self:flex-start;background:${ALGODAO};color:${NOITE};font-weight:600;font-size:52px;letter-spacing:-1px;padding:26px 38px 24px;border-radius:52px;box-shadow:0 10px 30px rgba(10,31,35,.10);${extra}">${t}</div>`;
  return doc(`
  <div class="abs" style="inset:0;background-image:linear-gradient(rgba(15,46,51,.06) 2px,transparent 2px),linear-gradient(90deg,rgba(15,46,51,.06) 2px,transparent 2px);background-size:72px 72px"></div>
  <div class="abs" style="left:96px;top:150px;display:flex;align-items:center;gap:16px;font-weight:800;font-size:27px;letter-spacing:4px;color:${PIMENTA}">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${PIMENTA}" stroke-width="2.2" stroke-linejoin="round"><path d="M22 3 9.2 10.1M22 3l-7 18-3.4-7.6L4 10z"/></svg>CHEGOU NO DIRECT</div>
  <div class="abs" style="left:96px;top:226px;font-weight:900;font-size:40px;letter-spacing:-1px;color:rgba(15,46,51,.55)">e eu respondi 👇</div>
  <div class="abs" style="left:96px;right:70px;top:400px;display:flex;flex-direction:column;gap:18px">
    ${bolha('Me indica 4 perfumes aí')}
    ${bolha('Um pra noite, dia, versátil')}
    <div style="display:flex;align-items:center;gap:20px;margin-left:-4px">
      ${bolha('É um mais... <span style="font-size:60px;vertical-align:-6px">🔞</span>', 'background:' + ROSA)}
    </div>
    <div style="display:flex;gap:10px;margin:8px 0 0 30px">${[0, 1, 2].map(i => `<i style="width:16px;height:16px;border-radius:50%;background:${PET};opacity:${.25 + i * .2}"></i>`).join('')}</div>
  </div>
  <!-- resposta da Valota Parfum -->
  <div class="abs" style="right:96px;top:910px;display:flex;align-items:flex-end;gap:20px">
    <div style="background:${PET};color:${CREME};font-weight:700;font-size:48px;letter-spacing:-1px;padding:26px 38px 24px;border-radius:50px 50px 14px 50px;line-height:1.2;max-width:640px">Separei os 4 certinhos,<br>arrasta pro lado <span style="color:${AMARELO}">→</span></div>
    <div style="width:104px;height:104px;border-radius:50%;padding:5px;background:conic-gradient(${AMBAR},${AMARELO},${PIMENTA},${AMBAR});flex:none">
      <div style="width:100%;height:100%;border-radius:50%;border:4px solid ${CREME};background:url(${AVATAR}) center 30%/cover"></div></div>
  </div>
  <div class="abs" style="left:96px;top:1150px;display:flex;gap:14px">
    ${[['☀️', 'DIA', MENTA], ['🌙', 'NOITE', PET], ['🔁', 'VERSÁTIL', CEDRO], ['🔞', '...', PIMENTA]].map(([e, t, c]) =>
      `<span style="display:flex;align-items:center;gap:10px;background:${c};color:${c === MENTA ? NOITE : CREME};font-weight:800;font-size:24px;letter-spacing:2px;padding:12px 18px 11px;border-radius:999px">${e} ${t}</span>`).join('')}
  </div>
  ${assina(NOITE, AMBAR)}`, CREME);
});

// 02 · DIA — Shiyaaka Sky (cítrico/fresco → Menta, sol creme atrás)
SLIDES.push(() => doc(`
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 700px 640px at 50% 44%, rgba(242,232,216,.28) 0%, rgba(242,232,216,0) 60%), radial-gradient(ellipse 900px 1000px at 50% 50%, rgba(10,31,35,0) 55%, rgba(10,31,35,.18) 100%), ${MENTA}"></div>
  <div class="abs" style="left:300px;top:330px;width:520px;height:520px;border-radius:50%;background:${AMARELO};box-shadow:0 0 0 34px rgba(255,201,60,.22),0 0 0 70px rgba(255,201,60,.1)"></div>
  <div class="rot" style="color:${NOITE}">Dia</div>
  <div class="chip" style="background:${NOITE};color:${CREME}">☀️ DO CAFÉ AO EXPEDIENTE</div>
  ${frasco('sky', 620, 985, 560)}
  ${info({ nome: 'Shiyaaka Sky', casa: 'KHADLAJ', notas: ['Bergamota', 'Tangerina', 'Flor de laranjeira'],
    frase: 'Cheiro de banho tomado com casca de fruta, leve do café da manhã até o fim do expediente.' },
    { txt: NOITE, pilula: CREME, pilulaTxt: NOITE })}
  ${assina(NOITE, NOITE)}`, MENTA));

// 03 · NOITE — XLNC Imperium (âmbar/especiado → Petróleo com luz de vela âmbar)
SLIDES.push(() => doc(`
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 620px 760px at 55% 46%, ${LUZ} 0%, ${PET} 55%, ${NOITE} 100%)"></div>
  <div class="abs" style="left:300px;top:300px;width:520px;height:700px;border-radius:50%;background:radial-gradient(ellipse, rgba(212,154,78,.55) 0%, rgba(212,154,78,0) 68%)"></div>
  <!-- lua -->
  <div class="abs" style="right:110px;top:120px;width:150px;height:150px;border-radius:50%;box-shadow:-30px 18px 0 0 ${CREME};transform:rotate(-10deg)"></div>
  <div class="rot" style="color:${CREME}">Noite</div>
  <div class="chip" style="background:${AMBAR};color:${NOITE}">🌙 JANTAR, BALADA, ENCONTRO</div>
  ${frasco('xlnc', 640, 985, 560)}
  ${info({ nome: 'XLNC Imperium', casa: 'NAYAAT', notas: ['Conhaque', 'Canela', 'Baunilha'],
    frase: 'Quentinho e docinho, com aquele ar de bebida cara servida num jantar à luz de velas.' },
    { txt: CREME, pilula: AMBAR, pilulaTxt: NOITE })}
  ${assina(CREME, AMBAR)}`, PET));

// 04 · VERSÁTIL — Club de Nuit Élite (meio dia, meio noite: diagonal creme × petróleo)
SLIDES.push(() => doc(`
  <div class="abs" style="inset:0;background:${CREME}"></div>
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 700px 700px at 70% 80%, ${LUZ} 0%, ${PET} 50%, ${NOITE} 100%);clip-path:polygon(0 66%,100% 27%,100% 100%,0 100%)"></div>
  <div class="rot" style="color:${NOITE};font-size:150px">Versátil</div>
  <div class="chip" style="background:${CEDRO};color:${CREME}">🔁 SERVE PRA QUASE TUDO</div>
  <div class="abs" style="left:84px;top:470px;font-weight:800;font-size:34px;color:${NOITE};display:flex;align-items:center;gap:12px">☀️ <span>dia</span></div>
  <div class="abs" style="right:84px;top:820px;font-weight:800;font-size:34px;color:${CREME};display:flex;align-items:center;gap:12px"><span>noite</span> 🌙</div>
  ${frasco('elite', 630, 985, 540)}
  ${info({ nome: 'Club de Nuit Élite', casa: 'ARMAF', notas: ['Chá verde', 'Maçã', 'Madeira'],
    frase: 'Fresco quando o sol tá alto e elegante quando escurece, então vai do trabalho ao encontro.' },
    { txt: CREME, pilula: MENTA, pilulaTxt: NOITE })}
  ${assina(CREME, AMBAR)}`, PET));

// 05 · 🔞... — Muharib (mel, canela, tabaco → Pimenta, igual ao "🔞 ..." da ref)
SLIDES.push(() => doc(`
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 640px 760px at 52% 44%, rgba(212,154,78,.28) 0%, rgba(212,154,78,0) 55%), radial-gradient(ellipse 820px 1000px at 50% 48%, rgba(10,31,35,0) 45%, rgba(10,31,35,.55) 100%), ${PIMENTA}"></div>
  <div class="abs" style="left:250px;top:300px;width:600px;height:720px;border-radius:50%;background:radial-gradient(ellipse, rgba(212,154,78,.45) 0%, rgba(212,154,78,0) 66%)"></div>
  <div class="abs" style="left:78px;top:96px;display:flex;align-items:flex-end;gap:14px"><span style="font-size:150px;line-height:1">🔞</span><span style="font-weight:900;font-size:120px;line-height:.8;color:${CREME};letter-spacing:4px">...</span></div>
  <div class="chip" style="background:${CREME};color:${PIMENTA};top:280px">😏 PRA QUANDO A NOITE PROMETE</div>
  <div class="abs" style="right:64px;top:600px;transform:rotate(8deg);background:${AMARELO};color:${NOITE};font-weight:900;font-size:26px;letter-spacing:1px;line-height:1.15;padding:16px 20px 14px;border-radius:8px;text-align:center;box-shadow:0 12px 24px rgba(10,31,35,.3)">USE COM<br>MODERAÇÃO</div>
  ${frasco('muharib', 650, 985, 530)}
  ${info({ nome: 'Muharib', casa: 'MAISON ASRAR', notas: ['Mel', 'Canela', 'Tabaco'],
    frase: 'Mel, canela e tabaco num cheiro quente que faz a pessoa querer chegar mais perto… o resto é com você 😏' },
    { txt: CREME, pilula: CREME, pilulaTxt: PIMENTA })}
  ${assina(CREME, AMBAR)}`, PIMENTA));

// 06 · FINAL — Âmbar: qual você levaria? + CTA + cartão de perfil (sem número de seguidores)
SLIDES.push(() => {
  const mini = (n, h, e, t, cor) => { const p = FR[n]; const w = Math.round(h * p.w / p.h);
    return `<div style="display:flex;flex-direction:column;align-items:center;width:210px">
      <div style="height:330px;display:flex;align-items:flex-end"><img src="${img(n)}" style="height:${h}px;width:${w}px;filter:drop-shadow(0 16px 18px rgba(10,31,35,.35))"></div>
      <span style="margin-top:22px;background:${cor};color:${cor === MENTA ? NOITE : CREME};font-weight:800;font-size:23px;letter-spacing:2px;padding:10px 16px 9px;border-radius:999px;white-space:nowrap">${e} ${t}</span></div>`; };
  return doc(`
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 700px 600px at 50% 40%, rgba(255,201,60,.22) 0%, rgba(255,201,60,0) 60%), ${AMBAR}"></div>
  <div class="abs" style="left:0;right:0;top:130px;text-align:center;font-weight:900;font-style:italic;font-size:88px;line-height:.98;letter-spacing:-3.5px;color:${NOITE}">E aí, qual dos 4<br>você levaria?</div>
  <div class="abs" style="left:66px;right:66px;top:400px;display:flex;justify-content:space-between">
    ${mini('sky', 270, '☀️', 'DIA', MENTA)}${mini('xlnc', 310, '🌙', 'NOITE', PET)}${mini('elite', 270, '🔁', 'VERSÁTIL', CEDRO)}${mini('muharib', 320, '🔞', '...', PIMENTA)}
  </div>
  <div class="abs" style="left:60px;right:60px;top:910px;text-align:center;font-weight:600;font-size:38px;line-height:1.3;letter-spacing:-.8px;color:${NOITE}">Quer perfume cheiroso sem pagar<br>preço de grife? <b style="font-weight:900">Clica no link da bio</b><br><b style="font-weight:900">e segue a Valota Parfum.</b></div>
  <div class="abs" style="left:150px;right:150px;top:1140px;background:${CREME};border-radius:34px;padding:28px 32px;display:flex;align-items:center;gap:24px;box-shadow:0 18px 40px rgba(10,31,35,.22)">
    <div style="width:118px;height:118px;border-radius:50%;padding:5px;background:conic-gradient(${AMBAR},${AMARELO},${PIMENTA},${AMBAR});flex:none">
      <div style="width:100%;height:100%;border-radius:50%;border:4px solid ${CREME};background:url(${AVATAR}) center 30%/cover"></div></div>
    <div style="flex:1"><div style="font-weight:800;font-size:36px;letter-spacing:-.8px;color:${NOITE}">@valotaparfum</div><div style="font-weight:500;font-size:27px;color:${PET};opacity:.8;margin-top:4px">Valota Parfum</div></div>
    <div style="background:${PET};color:${CREME};font-weight:800;font-size:28px;padding:18px 30px;border-radius:16px">Seguir</div>
  </div>
  `, AMBAR);
});

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

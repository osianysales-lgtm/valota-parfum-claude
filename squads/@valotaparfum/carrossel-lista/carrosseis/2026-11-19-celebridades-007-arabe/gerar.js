// Carrossel "Perfumes das celebridades · edição 007" (estilo dossiê, cartela Valota Parfum)
// node gerar.js  → saida/01.png … 07.png (1080×1350)
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');

const AQUI = __dirname;
const C = JSON.parse(fs.readFileSync(path.join(AQUI, 'carrossel.json'), 'utf8'));
const FONTES = '/Users/osianysales/Downloads/ClaudCode/squads/@valotaparfum/carrossel-tweet/fonts';
const AVATAR = 'file:///Users/osianysales/Downloads/ClaudCode/squads/@valotaparfum/carrossel-tweet/avatar.png';
const u = p => 'file://' + path.join(AQUI, p);

// cartela oficial
const K = {
  pet: '#0F2E33', noite: '#0A1F23', luz: '#1A4A52', creme: '#F2E8D8', ambar: '#D49A4E', amarelo: '#FFC93C',
  cedro: '#6B4430', bergamota: '#B8BC5C', menta: '#7DBFB3', rosa: '#E6AEB9', pimenta: '#9C452A', algodao: '#DCD6E2',
};
const FAM = { // fundo do chip → cor do texto
  ambar: [K.ambar, K.noite], pimenta: [K.pimenta, K.creme], menta: [K.menta, K.noite],
  cedro: [K.cedro, K.creme], algodao: [K.algodao, K.noite], bergamota: [K.bergamota, K.noite], rosa: [K.rosa, K.noite],
};

const RUIDO = (op, freq = 0.9) => `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${op} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}")`;
const COURO = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='c'><feTurbulence type='turbulence' baseFrequency='0.045' numOctaves='4' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.05'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`)}")`;

const CSS = `
@font-face{font-family:'Montserrat';src:url('file://${FONTES}/Montserrat-VariableFont_wght.ttf') format('truetype');font-weight:100 900;font-style:normal}
@font-face{font-family:'Montserrat';src:url('file://${FONTES}/Montserrat-Italic-VariableFont_wght.ttf') format('truetype');font-weight:100 900;font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Montserrat';background:${K.noite};color:${K.noite};position:relative;-webkit-font-smoothing:antialiased}
.abs{position:absolute}
.grao{position:absolute;inset:0;background-image:${RUIDO(0.10)};mix-blend-mode:overlay;pointer-events:none;z-index:50}
.vinheta{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 55%,rgba(0,0,0,.45));pointer-events:none;z-index:49}
/* dossiê */
.couro{position:absolute;left:46px;top:58px;right:-60px;bottom:-60px;border-radius:44px 0 0 0;background:${K.cedro};
  box-shadow:0 30px 70px rgba(0,0,0,.55), inset 0 0 0 2px rgba(242,232,216,.08), inset 0 0 80px rgba(0,0,0,.45)}
.couro:after{content:'';position:absolute;inset:0;border-radius:inherit;background-image:${COURO};opacity:.55;mix-blend-mode:multiply}
.costura{position:absolute;left:62px;top:74px;right:-60px;bottom:-60px;border-radius:32px 0 0 0;border:2px dashed rgba(242,232,216,.22);border-right:0;border-bottom:0}
.aba{position:absolute;left:96px;top:118px;width:70px;bottom:-20px;background:${K.creme};filter:brightness(.93);border-radius:10px 0 0 0;
  box-shadow:0 6px 18px rgba(0,0,0,.3)}
.papel{position:absolute;left:150px;top:112px;right:-20px;bottom:-30px;background:${K.creme};border-radius:6px 0 0 0;
  box-shadow:-10px 14px 40px rgba(0,0,0,.35)}
.papel:before{content:'';position:absolute;inset:0;background-image:${RUIDO(0.07, 0.65)};mix-blend-mode:multiply}
.papel:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 30%,transparent 50%,rgba(107,68,48,.10))}
.furos{position:absolute;left:172px;top:150px;bottom:20px;width:26px;display:flex;flex-direction:column;justify-content:space-between;z-index:3}
.furos i{display:block;width:24px;height:24px;border-radius:50%;background:${K.cedro};box-shadow:inset 0 3px 5px rgba(0,0,0,.55);opacity:.85}
.vert{position:absolute;writing-mode:vertical-rl;transform:rotate(180deg);font-weight:600;letter-spacing:4px;font-size:17px;text-transform:uppercase}
/* texto */
.era{font-weight:800;font-size:28px;letter-spacing:3px;color:${K.pimenta}}
.tit{font-weight:900;font-size:66px;line-height:1;letter-spacing:-1px;color:${K.noite};margin-top:14px}
.txt{font-weight:500;font-size:28.5px;line-height:1.42;color:${K.noite};margin-top:26px}
/* polaroid */
.pol{position:absolute;background:${K.creme};padding:20px 20px 96px;box-shadow:0 22px 50px rgba(10,31,35,.38),0 2px 6px rgba(10,31,35,.25);z-index:5}
.pol:before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.35);pointer-events:none}
.pol .foto{position:relative;width:100%;height:100%;background-size:cover;filter:contrast(1.04) saturate(.88);z-index:1}
.pol .foto:after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(10,31,35,.25)}
.pol .nome{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-style:italic;font-weight:600;font-size:44px;color:${K.pimenta};z-index:1;letter-spacing:-.5px}
.fita{position:absolute;width:170px;height:46px;background:rgba(212,154,78,.62);z-index:6;box-shadow:0 2px 6px rgba(0,0,0,.12)}
.fita:after{content:'';position:absolute;inset:0;background-image:${RUIDO(0.18, 1.2)};mix-blend-mode:multiply}
/* frasco */
.frasco{position:absolute;z-index:4;filter:drop-shadow(0 26px 30px rgba(10,31,35,.38)) drop-shadow(0 6px 8px rgba(10,31,35,.25))}
.sombra{position:absolute;z-index:3;height:46px;border-radius:50%;background:radial-gradient(ellipse,rgba(10,31,35,.42),transparent 70%)}
.rot .k{font-weight:700;font-size:19px;letter-spacing:2.2px;white-space:nowrap;color:${K.pimenta}}
.rot .p{font-weight:900;font-size:52px;line-height:1.02;color:${K.noite};margin-top:10px;letter-spacing:-1px}
.rot .m{font-weight:400;font-size:27px;color:${K.noite};margin-top:6px;letter-spacing:1px}
.chip{display:inline-flex;align-items:center;gap:10px;margin-top:18px;padding:10px 22px;border-radius:999px;font-weight:700;font-size:21px;letter-spacing:.3px;white-space:nowrap}
.chip b{display:inline-block;width:12px;height:12px;border-radius:50%;background:currentColor;opacity:.7}
.clima{font-style:italic;font-weight:500;font-size:23px;margin-top:14px;color:${K.cedro};white-space:nowrap}
.seta{position:absolute;z-index:6}
`;

function base(conteudo) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${conteudo}<div class="vinheta"></div><div class="grao"></div></body></html>`;
}

function dossie(a, idx) {
  const [cb, ct] = FAM[a.familia];
  const furos = '<div class="furos">' + '<i></i>'.repeat(9) + '</div>';
  const molde = `<div class="couro"></div><div class="costura"></div><div class="aba"></div><div class="papel"></div>${furos}
    <div class="vert" style="left:66px;top:150px;color:rgba(242,232,216,.75)">@valotaparfum</div>
    <div class="vert" style="right:14px;bottom:40px;color:rgba(10,31,35,.45);font-size:13px;letter-spacing:1.5px;font-weight:500;text-transform:none;z-index:7">${a.credito}</div>`;
  const rotulo = (x, y, w) => `<div class="abs rot" style="left:${x}px;top:${y}px;width:${w}px;z-index:6">
      <div class="k">O ÁRABE COM A CARA DELE</div>
      <div class="p">${a.perfume}</div>
      <div class="m">${a.marca}</div>
      <div class="chip" style="background:${cb};color:${ct}"><b></b>${a.notas}</div>
      <div class="clima">${a.clima}</div></div>`;
  let corpo;
  const nomeTam = a.nome.length > 14 ? 36 : 44;
  const pol = (x, y, w, h, r) => `<div class="pol" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${r}deg)">
      <div class="foto" style="background-image:url('${u('atores/' + a.id + '.jpg')}');background-position:${a.pos || 'center 22%'}"></div>
      <div class="nome" style="font-size:${nomeTam}px">${a.nome}</div></div>`;
  const frasco = (x, bottom, h, sx, sw) => `<div class="sombra" style="left:${sx}px;width:${sw}px;bottom:${bottom - 18}px"></div>
    <img class="frasco" src="${u('frascos/' + a.frasco + '.png')}" style="left:${x}px;bottom:${bottom}px;height:${h}px">`;
  const texto = (w, tam) => `<div class="abs" style="left:236px;top:${w > 600 ? 176 : 190}px;width:${w}px;z-index:4">
      <div class="era">${a.era}</div><div class="tit">${a.titulo}</div><div class="txt" style="font-size:${tam}px">${a.texto}</div></div>`;
  if (a.layout === 'A') {
    // texto em cima à esquerda · polaroid à direita · frasco embaixo à esquerda · rótulo embaixo à direita
    corpo = `${texto(430, 28.5)}
    ${pol(690, 176, 372, 500, 3.5)}
    <div class="fita" style="left:800px;top:150px;transform:rotate(-6deg)"></div>
    ${frasco(a.fx || 240, 76, a.fh || 470, (a.fx || 240) + 10, a.sw || 320)}
    <svg class="seta" style="left:${a.setax || 575}px;top:1010px" width="100" height="60" viewBox="0 0 110 70"><path d="M104 10 C 70 8, 40 30, 14 56" fill="none" stroke="${K.noite}" stroke-width="2.6" stroke-linecap="round"/><path d="M14 56 L 30 52 M14 56 L 18 40" fill="none" stroke="${K.noite}" stroke-width="2.6" stroke-linecap="round"/></svg>
    ${rotulo(684, 880, 380)}`;
  } else if (a.layout === 'B') {
    // texto largo em cima · polaroid embaixo à esquerda · rótulo + frasco à direita
    corpo = `${texto(790, 28)}
    ${pol(228, 670, 380, 520, -3.5)}
    <div class="fita" style="left:330px;top:648px;transform:rotate(5deg)"></div>
    ${frasco(a.fx || 715, 70, a.fh || 380, 700, 300)}
    ${rotulo(636, 610, 400).replace('<div class="clima">' + a.clima + '</div>', '')}`;
  } else {
    // C = B espelhado: rótulo + frasco à esquerda · polaroid embaixo à direita
    corpo = `${texto(790, 28)}
    ${pol(650, 690, 390, 520, 3.5)}
    <div class="fita" style="left:760px;top:668px;transform:rotate(-5deg)"></div>
    ${frasco(a.fx || 300, 62, a.fh || 350, 270, 300)}
    ${rotulo(236, 640, 400).replace('<div class="clima">' + a.clima + '</div>', '')}`;
  }
  return base(molde + corpo);
}

function capa() {
  const cp = C.capa;
  // MISTÉRIO: frascos reais (sem escurecer) ESCONDIDOS atrás das polaroids: só tampa e ombro aparecem
  const fotos = [
    { id: 'connery', l: 18, t: 318, r: -6, z: 21 },
    { id: 'moore', l: 222, t: 300, r: 3, z: 22 },
    { id: 'brosnan', l: 420, t: 322, r: -2, z: 23 },
    { id: 'craig', l: 615, t: 300, r: 4, z: 22 },
    { id: 'pattinson', l: 815, t: 318, r: -5, z: 21 },
  ];
  const pols = fotos.map(f => `<div class="pol" style="left:${f.l}px;top:${f.t}px;width:250px;height:360px;padding:12px 12px 52px;z-index:${f.z};transform:rotate(${f.r}deg)">
      <div class="foto" style="background-image:url('${u('atores/' + f.id + '.jpg')}');background-position:center 18%"></div></div>`).join('');
  const fr = [ // l = esquerda, t = topo, h = altura (o corpo/rótulo fica atrás das fotos)
    { id: 'qaaed', l: 48, t: 128, h: 400, z: 11 },
    { id: 'ameer', l: 262, t: 70, h: 470, z: 12 },
    { id: 'tobaccotouch', l: 452, t: 96, h: 470, z: 13 },
    { id: 'kayaan', l: 655, t: 66, h: 470, z: 12 },
    { id: 'tresnuit', l: 752, t: 150, h: 330, z: 11 },
  ];
  const fras = fr.map(f => `<img class="frasco" src="${u('frascos/' + f.id + '.png')}" style="left:${f.l}px;top:${f.t}px;height:${f.h}px;z-index:${f.z};filter:drop-shadow(0 14px 22px rgba(0,0,0,.5))">`).join('');
  return base(`
    <div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 30%,${K.luz} 0%,${K.pet} 45%,${K.noite} 82%)"></div>
    <div class="abs" style="left:40px;right:40px;top:40px;height:420px;z-index:5;background:radial-gradient(ellipse 55% 50% at 50% 70%,rgba(212,154,78,.30),transparent 75%)"></div>
    ${fras}
    ${pols}
    <div class="fita" style="left:110px;top:296px;transform:rotate(-8deg);width:110px;z-index:30"></div>
    <div class="fita" style="left:500px;top:300px;transform:rotate(3deg);width:110px;z-index:30"></div>
    <div class="fita" style="left:880px;top:296px;transform:rotate(7deg);width:110px;z-index:30"></div>
    <div class="abs" style="left:0;right:0;top:790px;text-align:center;z-index:31">
      <div style="font-weight:900;font-size:100px;line-height:.98;color:${K.creme};letter-spacing:-2px">${cp.linha1}<br>${cp.linha2}</div>
      <div style="font-style:italic;font-weight:600;font-size:60px;color:${K.ambar};margin-top:12px;letter-spacing:-.5px">${cp.edicao}</div>
      <div style="display:inline-block;margin-top:20px;padding:11px 30px;border:2px solid rgba(242,232,216,.55);border-radius:999px;font-weight:600;font-size:28px;color:${K.creme};letter-spacing:.5px">${cp.pilula}</div>
    </div>
    <div class="abs" style="left:0;right:0;bottom:40px;display:flex;justify-content:center;align-items:center;gap:14px;z-index:31">
      <img src="${AVATAR}" style="width:58px;height:58px;border-radius:50%;border:3px solid ${K.ambar}">
      <span style="font-weight:700;font-size:28px;color:${K.creme}">@valotaparfum</span></div>`);
}

function final() {
  const f = C.final;
  const thumbs = C.atores.map(a => `<div style="width:120px;height:150px;background:${K.creme};padding:8px 8px 26px;box-shadow:0 10px 22px rgba(10,31,35,.3);transform:rotate(${a.layout === 'A' ? -3 : 3}deg)">
      <div style="width:100%;height:100%;background:url('${u('atores/' + a.id + '.jpg')}') center 20%/cover;filter:saturate(.85)"></div></div>`).join('');
  return base(`
    <div class="abs" style="inset:0;background:${K.ambar}"></div>
    <div class="abs" style="inset:0;background-image:${RUIDO(0.08, 0.7)};mix-blend-mode:multiply"></div>
    <div class="abs" style="left:60px;right:60px;top:170px;text-align:center;z-index:5">
      <div style="font-weight:800;font-size:30px;letter-spacing:6px;color:${K.noite}">${f.kicker}</div>
      <div style="font-style:italic;font-weight:800;font-size:70px;line-height:1.06;color:${K.noite};margin-top:26px;letter-spacing:-1.5px">${f.titulo}</div>
    </div>
    <div class="abs" style="left:0;right:0;top:600px;display:flex;justify-content:center;gap:18px;z-index:5">${thumbs}</div>
    <div class="abs" style="left:150px;right:150px;top:840px;background:${K.creme};border-radius:28px;padding:34px 40px;display:flex;align-items:center;gap:26px;box-shadow:0 22px 50px rgba(10,31,35,.28);z-index:5">
      <img src="${AVATAR}" style="width:118px;height:118px;border-radius:50%;border:5px solid ${K.ambar}">
      <div style="flex:1">
        <div style="font-weight:800;font-size:34px;color:${K.noite}">@valotaparfum</div>
        <div style="font-weight:500;font-size:26px;color:${K.noite};opacity:.75;margin-top:2px">Valota Parfum</div>
      </div>
      <div style="background:${K.pet};color:${K.creme};font-weight:700;font-size:28px;padding:16px 34px;border-radius:14px">Seguir</div>
    </div>
    <div class="abs" style="left:110px;right:110px;top:1060px;text-align:center;font-weight:600;font-size:34px;line-height:1.3;color:${K.noite};z-index:5">${f.cta.replace('@valotaparfum', '<b style="font-weight:900">@valotaparfum</b>')}</div>
    <div class="abs" style="left:90px;right:90px;bottom:42px;text-align:center;font-weight:500;font-size:17px;color:${K.noite};opacity:.6;z-index:5">${f.nota}</div>`);
}

(async () => {
  const saida = path.join(AQUI, 'saida'); fs.mkdirSync(saida, { recursive: true });
  const tmp = path.join(AQUI, 'html'); fs.mkdirSync(tmp, { recursive: true });
  const paginas = [capa(), ...C.atores.map(dossie), final()];
  const b = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  const so = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  for (let i = 0; i < paginas.length; i++) {
    if (so && !so.includes(i + 1)) continue;
    const nome = String(i + 1).padStart(2, '0');
    const h = path.join(tmp, nome + '.html'); fs.writeFileSync(h, paginas[i]);
    await p.goto('file://' + h, { waitUntil: 'load' }); await p.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 300));
    await p.screenshot({ path: path.join(saida, nome + '.png') });
    console.log('ok', nome);
  }
  await b.close();
})();

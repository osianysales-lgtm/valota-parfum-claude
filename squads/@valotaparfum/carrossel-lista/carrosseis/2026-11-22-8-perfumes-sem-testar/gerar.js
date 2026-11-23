// Carrossel "8 árabes pra comprar sem testar" — cópia do @satefragrances (DfuXYvqkYoI) na cartela Petróleo
// Sem Philos Pura (Erba Pura) e sem Salvo (Sauvage). CTA final da Osiany.
// node gerar.js [1,2,...] → saida/01.png … 11.png (1080x1440, 3:4 igual à ref)
const puppeteer = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const A = __dirname;
const b64 = (f, mime = 'image/png') => `data:${mime};base64,` + fs.readFileSync(path.resolve(A, f)).toString('base64');
const FONTE = b64('fonts/Inter.ttf', 'font/ttf'); // Inter = letra da referência
const FONTE_I = b64('fonts/Inter-Italic.ttf', 'font/ttf');
const AVATAR = b64('../../../carrossel-tweet/avatar.png');

// Cartela oficial (nenhum HEX novo)
const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMBAR = '#D49A4E', AMARELO = '#FFC93C', PIMENTA = '#9C452A', ROSA = '#E6AEB9';

const DATA_PRECOS = '22/11';
// precos: g = grife (riscado), a = árabe. null = ainda sem preço.
const P = [
  { tag: 'PRO DIA', lembra: 'Lembra o', grife: 'TYG4R', marca: 'BVLG4R1', g: 3555, fg: 'tygar',
    nome: 'Turathi Blue', casa: 'AFNAN', a: 315.90, fa: 'turathi',
    frase: '“Cheiro de banho tomado com um toque de fruta, gostoso do café da manhã até a noite.”', rodapeEsq: 'do dia pra noite' },
  { tag: 'PRO TRABALHO', lembra: 'Lembra o', grife: 'S3DL3Y', marca: 'P4RF4MS D3 M4RLY', g: 2139, fg: 'sedley',
    nome: ['Maahir', 'Legacy'], casa: 'LATTAFA', a: 198, fa: 'maahir', fixa: ['~7 h', '1h30'],
    frase: '“Limpinho e agradável, não incomoda ninguém do lado. Pro trabalho, é certeiro.”',
    alerta: 'É o PRATEADO. O dourado e o preto são bem mais fortes.' },
  { tag: 'SE FOR TER SÓ UM', lembra: 'Lembra o', grife: '4V3NTUS', marca: 'CR33D', g: 3199, fg: 'aventus',
    nome: ['Club de Nuit', 'Intense Man'], casa: 'ARMAF', a: 193.10, fa: 'cdnim', boxA: '85,790,420,552', nomeTam: 54,
    frase: '“Combina com quase tudo: trabalho, barzinho, encontro e balada, sem erro.”' },
  { tag: 'PRO ENCONTRO', lembra: 'Lembra, na secagem, o', grife: ['TH3 M0ST W4NT3D', '1NT3NS3'], marca: '4ZZ4R0', g: 549, fg: 'mostwanted',
    nome: ['Asad', 'Bourbon'], casa: 'LATTAFA', a: 169, fa: 'asad',
    frase: '“Docinho na medida e muito gostoso de sentir de perto. Tiro certo, sem erro.”' },
  { tag: 'JANTAR ELEGANTE', lembra: 'A versão com café do', grife: 'KHAMRAH', marca: 'LATTAFA', semPreco: true, fg: 'khamrah',
    faixa: 'O QUE EU INDICO', nome: ['Khamrah', 'Qahwa'], casa: 'LATTAFA', a: 160.99, fa: 'qahwa', semSelo: true,
    frase: '“Café com doce quentinho, chique de um jeito que chama atenção no jantar.”' },
  { tag: 'PRA QUEM AMA BAUNILHA', lembra: 'Lembra o', grife: '4LTH41R', marca: 'P4RF4MS D3 M4RLY', g: 2791, fg: 'althair',
    nome: 'Liquid Brun', casa: 'FRENCH AVENUE', a: 249, fa: 'liquidbrun',
    frase: '“Uma baunilha diferente de tudo que você já sentiu, quentinha e com cara de perfume caro.”' },
  { tag: 'PRA NOITE', lembra: 'Lembra o', grife: 'ULTR4 M4L3', marca: 'G4ULT13R', g: 466, fg: 'ultramale',
    nome: 'Lion', casa: 'RAYHAAN', a: 193, fa: 'lion', boxA: '85,790,420,552', fixa: ['12 h', '3h30'],
    frase: '“Forte e docinho, chega antes de você e rende muito elogio.”',
    alerta: 'Não use no trabalho nem no transporte público.' },
  { tag: 'BALADA', lembra: 'Lembra o', grife: 'L3 M4L3 3L1X1R', marca: 'G4ULT13R', g: 408, fg: 'lemaleelixir',
    nome: ['Rayhaan', 'Elixir'], casa: 'RAYHAAN', a: 199, fa: 'rayhaanelixir', boxA: '95,800,400,540',
    frase: '“Deixa rastro por onde passa e, na pele, dura tanto quanto o famoso.”', proximo: 'o resumo' },
];

const brl = v => v == null ? 'R$ —' : 'R$ ' + (Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const vezes = (g, a) => (g && a) ? Math.max(2, Math.floor(g / a)) : null;
const linhas = x => (Array.isArray(x) ? x : [x]).join('<br>');
const img = n => b64('frascos/' + n + '.png');

const CSS = `
@font-face{font-family:M;src:url(${FONTE});font-weight:100 900}
@font-face{font-family:M;src:url(${FONTE_I});font-weight:100 900;font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1440px;overflow:hidden;position:relative;font-family:M,sans-serif;font-optical-sizing:auto;color:${CREME};background:${PET}}
.abs{position:absolute}
.chip{position:absolute;background:${CREME};color:${NOITE};font-weight:800;font-size:27px;letter-spacing:.5px;padding:8px 16px 7px;border-radius:7px;line-height:1}
.cont{right:64px;top:48px;font-size:25px;padding:8px 13px 7px}
.topo{position:absolute;left:0;right:0;top:0;height:640px;background:radial-gradient(ellipse 520px 420px at 82% 50%, ${LUZ} 0%, ${PET} 70%)}
.baixo{position:absolute;left:0;right:0;top:713px;bottom:0;background:radial-gradient(ellipse 480px 520px at 26% 46%, ${LUZ} 0%, ${NOITE} 72%)}
.faixa{position:absolute;left:0;right:0;top:640px;height:73px;background:${AMARELO};color:${NOITE};font-weight:800;font-size:31px;letter-spacing:2.5px;padding:0 64px;display:flex;align-items:center;justify-content:space-between}
.lembra{left:64px;top:126px;font-weight:700;font-size:38px;letter-spacing:-.5px}
.grife{left:64px;top:174px;font-weight:800;font-size:66px;line-height:64px;letter-spacing:-1.5px}
.marca{left:66px;font-weight:700;font-size:23px;letter-spacing:2.5px;opacity:.6}
.rot{left:66px;top:426px;font-weight:700;font-size:23px;letter-spacing:2.5px;opacity:.75}
.risc{left:62px;top:462px;font-weight:800;font-size:82px;letter-spacing:-2.5px;color:${ROSA};position:absolute;line-height:1}
.risc::after{content:'';position:absolute;left:-4px;right:-4px;top:50%;height:8px;margin-top:-2px;background:${PIMENTA};border-radius:4px;box-shadow:0 0 0 2px ${PET}}
.fg{position:absolute;filter:drop-shadow(0 22px 26px rgba(0,0,0,.45))}
.sombra{position:absolute;height:26px;border-radius:50%;background:radial-gradient(ellipse at center, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 70%)}
.col{position:absolute;left:584px;right:50px}
.nome{font-weight:800;font-size:72px;line-height:70px;letter-spacing:-2.5px}
.casa{font-weight:700;font-size:23px;letter-spacing:2.5px;opacity:.6;margin-top:10px}
.preco{display:inline-block;margin-top:22px;background:${CREME};color:${NOITE};font-weight:800;font-size:58px;letter-spacing:-2px;padding:8px 18px 6px;border-radius:9px;line-height:1.08}
.selo{display:block;width:max-content;margin-top:20px;background:${AMARELO};color:${NOITE};font-weight:800;font-size:31px;letter-spacing:-.5px;padding:8px 14px 6px;transform:rotate(-1.5deg);border-radius:4px}
.fixa{margin-top:20px;font-size:26px;font-weight:500}
.fixa b{font-weight:800}
.frase{margin-top:20px;font-style:italic;font-weight:700;font-size:30px;line-height:37px;letter-spacing:-.3px}
.alerta{margin-top:14px;font-weight:800;font-size:22px;line-height:27px;color:${AMBAR}}
.rod{position:absolute;bottom:44px;font-weight:600;font-size:22px;opacity:.75}
`;

function seta(cor) { return `<svg width="30" height="34" viewBox="0 0 30 34"><path d="M15 3v26M4 18l11 11 11-11" fill="none" stroke="${cor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }

function slidePerfume(p, i) {
  const grifeL = Array.isArray(p.grife) ? p.grife.length : 1;
  const marcaTop = 174 + grifeL * 62 + 14;
  const x = vezes(p.g, p.a);
  return `
  <div class="topo"></div><div class="baixo"></div>
  <div class="chip" style="left:64px;top:48px">${p.tag}</div>
  <div class="chip cont">${i + 1}/${P.length}</div>
  <div class="abs lembra">${p.lembra}</div>
  <div class="abs grife">${linhas(p.grife)}</div>
  <div class="abs marca" style="top:${marcaTop}px">${p.marca}</div>
  ${p.semPreco ? '' : `<div class="abs rot">${p.rotPreco || 'A PARTIR DE'}</div><div class="risc">${brl(p.g)}</div>`}
  <div class="sombra" style="left:760px;width:240px;top:582px"></div>
  <img class="fg" src="${img(p.fg)}" data-box="700,96,360,500">
  <div class="faixa"><span>${p.faixa || 'A VERSÃO ÁRABE'}</span>${seta(NOITE)}</div>
  <div class="sombra" style="left:110px;width:360px;top:1334px"></div>
  <img class="fg" src="${img(p.fa)}" data-box="${p.boxA || '70,762,450,580'}">
  <div class="col" style="top:762px">
    <div class="nome" style="${p.nomeTam ? `font-size:${p.nomeTam}px;line-height:${p.nomeTam}px` : ''}">${linhas(p.nome)}</div>
    <div class="casa">${p.casa}</div>
    <div class="preco">${brl(p.a)}</div>
    ${p.semSelo ? '' : `<span class="selo">${x ? x + '× MAIS BARATO' : '?× MAIS BARATO'}</span>`}
    ${p.fixa ? `<div class="fixa">fixa <b>${p.fixa[0]}</b> · projeta <b>${p.fixa[1]}</b></div>` : ''}
    <div class="frase">${p.frase}</div>
    ${p.alerta ? `<div class="alerta">⚠ ${p.alerta}</div>` : ''}
  </div>
  ${p.rodapeEsq ? `<div class="rod" style="left:64px">${p.rodapeEsq}</div>` : ''}
  <div class="rod" style="right:64px">${p.proximo || 'próximo'} →</div>`;
}

function slideCapa() {
  const sil = P.map(p => p.fa);
  const prat = (arr, top) => `<div class="abs" style="left:64px;right:64px;top:${top}px;height:250px;display:flex;align-items:flex-end;justify-content:space-around;border-bottom:5px solid ${CREME}">
    ${arr.map(n => `<div style="height:210px;width:190px;display:flex;align-items:flex-end;justify-content:center"><div style="width:100%;height:100%;background:${CREME};-webkit-mask:url(${img(n)}) center bottom/contain no-repeat"></div></div>`).join('')}</div>`;
  return `
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 700px 600px at 50% 75%, ${LUZ} 0%, ${PET} 70%)"></div>
  <div class="chip" style="left:64px;top:52px;font-size:25px">GUIA</div>
  <div class="abs" style="left:172px;top:57px;font-weight:600;font-size:25px;opacity:.85">pra quem tá começando</div>
  <div class="abs" style="right:64px;top:58px;font-weight:600;font-size:25px;opacity:.85">@valotaparfum</div>
  <div class="abs" style="left:58px;top:112px;font-weight:800;font-size:124px;line-height:122px;letter-spacing:-5.5px">8 árabes<br>pra comprar<br><span style="background:${AMARELO};color:${NOITE};padding:2px 18px 8px;margin-left:-14px;line-height:1;border-radius:10px;box-decoration-break:clone;-webkit-box-decoration-break:clone">sem testar</span></div>
  <div class="abs" style="left:64px;top:532px;font-weight:700;font-size:40px;letter-spacing:-.5px">do trabalho à balada, sem erro</div>
  ${prat(sil.slice(0, 4), 690)}
  ${prat(sil.slice(4), 1010)}
  <div class="rod" style="left:64px">não é ranking: um pra cada ocasião</div>
  <div class="rod" style="right:64px">arrasta →</div>`;
}

function slideResumo() {
  const G = [
    ['DIA E TRABALHO', [0, 1]], ['SERVE PRA TUDO', [2]], ['ENCONTRO E JANTAR', [3, 4]], ['NOITE E BALADA', [5, 6, 7]],
  ];
  const item = i => { const p = P[i]; const n = Array.isArray(p.nome) ? p.nome.join(' ') : p.nome;
    return `<div style="display:flex;align-items:flex-end;gap:14px;width:318px">
      <div style="width:112px;height:190px;flex:none;display:flex;align-items:flex-end;justify-content:center"><img src="${img(p.fa)}" style="max-width:112px;max-height:190px;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))"></div>
      <div style="padding-bottom:6px"><div style="font-weight:800;font-size:29px;line-height:32px">${n}</div><div style="font-weight:700;font-size:27px;opacity:.85;margin-top:6px">${brl(p.a)}</div></div></div>`; };
  return `
  <div class="abs" style="inset:0;background:${PET}"></div>
  <div class="abs" style="left:64px;top:52px;font-weight:600;font-size:25px;opacity:.85">@valotaparfum</div>
  <div class="chip" style="right:64px;top:46px;font-size:25px">SALVA 📌</div>
  <div class="abs" style="left:62px;top:108px;font-weight:800;font-size:76px;letter-spacing:-3px">Qual levar? Resumo</div>
  <div class="abs" style="left:64px;right:64px;top:210px;height:4px;background:${CREME}"></div>
  <div class="abs" style="left:64px;right:64px;top:236px">
    ${G.map(([t, ids]) => `<div style="border-bottom:2px solid rgba(242,232,216,.18);padding:22px 0 24px">
      <div style="font-weight:800;font-size:25px;letter-spacing:2.5px;color:${AMARELO}">${t}</div>
      <div style="display:flex;gap:10px;margin-top:8px">${ids.map(item).join('')}</div></div>`).join('')}
  </div>
  <div class="rod" style="left:64px">preços de ${DATA_PRECOS}</div>
  <div class="rod" style="right:64px">→</div>`;
}

function slideCTA() {
  return `
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 700px 600px at 50% 40%, ${LUZ} 0%, ${PET} 70%)"></div>
  <div class="abs" style="left:64px;top:52px;font-weight:600;font-size:25px;opacity:.85">@valotaparfum</div>
  <div class="abs" style="left:60px;right:60px;top:380px;font-weight:800;font-size:100px;line-height:104px;letter-spacing:-4px">Quer perfume cheiroso sem pagar preço de grife?</div>
  <div class="abs" style="left:64px;right:64px;top:820px;font-weight:600;font-size:44px;line-height:62px">Clica no link da bio<br>e segue a <span style="background:${AMARELO};color:${NOITE};font-weight:800;padding:0 10px 3px">Valota Parfum</span></div>
  <div class="abs" style="left:64px;right:64px;top:1020px;height:4px;background:${CREME};opacity:.9"></div>
  <div class="abs" style="left:64px;right:64px;top:1070px;background:${CREME};border-radius:24px;padding:30px 34px;display:flex;align-items:center;gap:26px;color:${NOITE}">
    <div style="width:132px;height:132px;border-radius:50%;padding:5px;background:conic-gradient(${AMBAR},${AMARELO},${PIMENTA},${AMBAR});flex:none">
      <img src="${AVATAR}" style="width:100%;height:100%;border-radius:50%;border:4px solid ${CREME};object-fit:cover"></div>
    <div style="flex:1"><div style="font-weight:800;font-size:38px">@valotaparfum</div><div style="font-weight:600;font-size:28px;opacity:.75;margin-top:4px">Valota Parfum</div></div>
    <div style="background:${PET};color:${CREME};font-weight:800;font-size:30px;padding:16px 30px;border-radius:14px">Seguir</div>
  </div>`;
}

// encaixa cada frasco (data-box="x,y,w,h") mantendo proporção, apoiado na base da caixa
const FIT = `document.querySelectorAll('img[data-box]').forEach(im=>{const [x,y,w,h]=im.dataset.box.split(',').map(Number);
  const r=Math.min(w/im.naturalWidth,h/im.naturalHeight);const W=im.naturalWidth*r,H=im.naturalHeight*r;
  Object.assign(im.style,{left:(x+(w-W)/2)+'px',top:(y+h-H)+'px',width:W+'px',height:H+'px'});});`;

(async () => {
  const so = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const slides = [slideCapa(), ...P.map(slidePerfume), slideResumo(), slideCTA()];
  fs.mkdirSync(path.join(A, 'saida'), { recursive: true });
  const br = await puppeteer.launch({ headless: 'new' });
  const pg = await br.newPage();
  await pg.setViewport({ width: 1080, height: 1440 });
  for (let k = 0; k < slides.length; k++) {
    if (so && !so.includes(k + 1)) continue;
    await pg.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${slides[k]}</body></html>`, { waitUntil: 'load' });
    await pg.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    await pg.evaluate(FIT);
    const f = path.join(A, 'saida', String(k + 1).padStart(2, '0') + '.png');
    await pg.screenshot({ path: f });
    console.log('ok', f);
  }
  await br.close();
})();

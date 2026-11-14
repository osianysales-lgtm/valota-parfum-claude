// v32 · "Top 5 árabes até R$200" (post 29, 19h de 14/11/2026) · NARRAÇÃO NA2 ÂMBAR · voz ElevenLabs (Osiany Sales v2) · versão C
// Jorge di Profumo · Salvo · Attar Al Wesal · Qaed Al Fursan · Perseus (+ Pegasus como referência). Notas: Fragrantica (14/11).
// Base: gen.js do v24 (fundo âmbar, legenda creme + amarelo com contorno Noite, SFX sem música). Cartelas nas cores das famílias.
// Gancho escrito FIXO no quadro 0 até "E todos" (~9,7 s finais). Frase-chave ("Então, na próxima vez…") SEM efeito sonoro.
// Render em 1x → aceleração no MP4 final pelo ritmo de ~4,35 palavras/s (fator escolhido pela Osiany entre as amostras).
// Rodar: node gen.js  →  hf/index.html + hf/compositions/*.html
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const HF = path.join(__dirname, 'hf');
const VOZ = JSON.parse(fs.readFileSync(path.join(__dirname, 'narracao_palavras.json'), 'utf8')).palavras;
const ROT = fs.readFileSync(path.join(__dirname, 'roteiro.txt'), 'utf8').trim().split(/\s+/);
if (ROT.length !== VOZ.length) throw new Error(`roteiro ${ROT.length} x voz ${VOZ.length}`);
const W = VOZ.map((w, i) => ({ p: ROT[i], ini: w.start, fim: w.end }));
const FALA = W[W.length - 1].fim;
const END = +(FALA + 2.6).toFixed(2);

const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMB = '#D49A4E', YEL = '#FFC93C';
const MENTA = '#7DBFB3', PIM = '#9C452A', ALG = '#DCD6E2', CEDRO = '#6B4430', ROSA = '#E6AEB9', BERG = '#B8BC5C';
const INK = NOITE;
const OFF = 290;          // topo da área de motion (local 0–1100 = absoluto 290–1390)
const CAP_TOP = 1400;     // legenda

// ---------- palavras ----------
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '');
function F(q, from = 0) {
  const n = norm(q);
  for (let i = from; i < W.length; i++) if (norm(W[i].p) === n) return i;
  throw new Error(`palavra "${q}" não encontrada depois de ${from}`);
}
const T = i => W[i].ini;

// ---------- SVGs ----------
const SV = {
  check: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${MENTA}" stroke="${INK}" stroke-width="7"/><path d="M26 52 L44 70 L76 32" stroke="${INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  brilho: `<svg viewBox="0 0 100 100"><path d="M50 0 Q56 44 100 50 Q56 56 50 100 Q44 56 0 50 Q44 44 50 0Z" fill="${YEL}" stroke="${INK}" stroke-width="4"/></svg>`,
  risco: `<svg viewBox="0 0 400 120"><path d="M20 100 L380 20" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M20 100 L380 20" stroke="${PIM}" stroke-width="9" stroke-linecap="round"/></svg>`,
  cartao: `<svg viewBox="0 0 520 330"><rect x="8" y="8" width="504" height="314" rx="34" fill="${PET}" stroke="${INK}" stroke-width="10"/><rect x="8" y="70" width="504" height="54" fill="${NOITE}"/><rect x="50" y="160" width="86" height="64" rx="12" fill="${AMB}" stroke="${INK}" stroke-width="5"/><path d="M50 192 H136 M93 160 V224" stroke="${INK}" stroke-width="4"/><text x="50" y="290" font-family="Montserrat" font-weight="900" font-size="38" letter-spacing="6" fill="${CREME}">•••• •••• 3000</text><circle cx="420" cy="196" r="34" fill="${PIM}" opacity=".95"/><circle cx="460" cy="196" r="34" fill="${YEL}" opacity=".9"/></svg>`,
  // frasco genérico (silhueta) com "?" opcional
  frs: (q = '') => `<svg viewBox="0 0 300 460"><rect x="112" y="10" width="76" height="70" rx="12" fill="${NOITE}"/><rect x="128" y="78" width="44" height="34" fill="${NOITE}"/><rect x="30" y="108" width="240" height="340" rx="46" fill="${NOITE}" stroke="${CREME}" stroke-width="6"/>${q ? `<text x="150" y="340" text-anchor="middle" font-family="Gotham" font-size="190" fill="${YEL}">${q}</text>` : `<rect x="70" y="220" width="160" height="110" rx="12" fill="${AMB}" stroke="${CREME}" stroke-width="4"/>`}</svg>`,
};

// ---------- markup ----------
const pngDim = k => { const b = fs.readFileSync(path.join(HF, 'assets/img', k + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
let Z = 1;
const box = (id, l, t, w, h, inner, extra = '') => `<div id="${id}" class="abs" style="left:${Math.round(l)}px;top:${Math.round(t)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;z-index:${Z++};${extra}">${inner}</div>`;
const svgB = (id, markup, l, t, w, h, extra = '') => box(id, l, t, w, h, markup, extra);
const big = (id, text, l, t, w, h, fs, color = YEL, extra = '') => box(id, l, t, w, h, `<div class="big" style="font-size:${fs}px;color:${color}">${text}</div>`, extra);
const sub = (id, text, l, t, w, h, fs, color = CREME, extra = '') => box(id, l, t, w, h, `<div class="sub" style="font-size:${fs}px;color:${color}">${text}</div>`, extra);
const pill = (id, text, l, t, w, fs = 54, bg = CREME, fg = INK) => box(id, l, t, w, Math.round(fs * 1.8), `<div class="pill" style="background:${bg};color:${fg};font-size:${fs}px">${text}</div>`);
const frasco = (id, img, cx, bottom, h) => { const [w0, h0] = pngDim(img); const w = Math.round(h * w0 / h0); return box(id, cx - w / 2, bottom - h, w, h, `<div class="fr"><img src="assets/img/${img}.png"></div>`, 'transform-origin:50% 100%'); };
const fonte = (id, text, t) => box(id, 40, t, 1000, 40, `<div class="src">${text}</div>`);
// cartela do perfume: faixa na cor da família (nº + marca) + nome em Gotham
const cartela = (id, num, nome, marca, l, t, w, fam, famTxt) => box(id, l, t, w, 250, `<div class="ct"><div class="ct-h" style="background:${fam};color:${famTxt}">Nº ${num} · ${marca}</div><div class="ct-n">${nome}</div></div>`, 'transform-origin:50% 0');
// "lembra" (ou "a comunidade compara") + nome da grife
const lembra = (id, rot, grife, l, t, w) => box(id, l, t, w, 150, `<div class="lb"><div class="lb-r">${rot}</div><div class="lb-g">${grife}</div></div>`);
// etiqueta de preço (petróleo, preço em amarelo)
const preco = (id, valor, l, t, w = 400, rot = 'A PARTIR DE') => box(id, l, t, w, 150, `<div class="pr"><div class="pr-r">${rot}</div><div class="pr-v">${valor}</div></div>`, 'transform:rotate(-3deg);transform-origin:50% 0');

// ---------- animação ----------
const SFX = [];
const S = (file, at, vol = 0.4) => SFX.push([file, at, vol]);
function anim(start) {
  const L = []; const hidden = [];
  const t = x => Math.max(0, x - start).toFixed(3);
  return {
    L, t, hidden,
    hide: (...sel) => hidden.push(...sel),
    pop: (sel, x, rot = 0, d = 0.34) => L.push(`tl.fromTo("${sel}",{opacity:0,scale:0.2,rotation:${rot - 14}},{opacity:1,scale:1,rotation:${rot},duration:${d},ease:"back.out(2.2)"},${t(x)});`),
    slam: (sel, x, from = 2.4, rot = 0) => L.push(`tl.fromTo("${sel}",{opacity:0,scale:${from},rotation:${rot}},{opacity:1,scale:1,rotation:${rot},duration:0.24,ease:"power4.out"},${t(x)});`),
    out: (sel, x, d = 0.16) => L.push(`tl.to("${sel}",{opacity:0,scale:0.7,duration:${d},ease:"power3.in"},${t(x)});`),
    rise: (sel, x, dy = 60, d = 0.35) => L.push(`tl.fromTo("${sel}",{opacity:0,y:${dy}},{opacity:1,y:0,duration:${d},ease:"power3.out"},${t(x)});`),
    slide: (sel, x, dx, d = 0.32) => L.push(`tl.fromTo("${sel}",{opacity:0,x:${dx}},{opacity:1,x:0,duration:${d},ease:"back.out(1.8)"},${t(x)});`),
    to: (sel, x, props, d = 0.3, ease = 'power3.out') => L.push(`tl.to("${sel}",{${props},duration:${d},ease:"${ease}"},${t(x)});`),
    wiggle: (sel, x, n = 4, amp = 8) => L.push(`tl.to("${sel}",{keyframes:[${Array.from({ length: n }, (_, i) => `{rotation:${i % 2 ? -amp : amp},duration:0.06}`).join(',')},{rotation:0,duration:0.06}]},${t(x)});`),
    hop: (sel, x, hgt = 40) => L.push(`tl.to("${sel}",{keyframes:[{y:-${hgt},duration:0.16,ease:"power2.out"},{y:0,duration:0.22,ease:"bounce.out"}]},${t(x)});`),
    pulse: (sel, x, s = 1.06) => L.push(`tl.to("${sel}",{keyframes:[{scale:${s},duration:0.18,ease:"power2.out"},{scale:1,duration:0.28,ease:"power2.inOut"}]},${t(x)});`),
    // frasco entrando de baixo
    sobe: (sel, x) => L.push(`tl.fromTo("${sel}",{opacity:0,scale:0.5,y:180},{opacity:1,scale:1,y:0,duration:0.42,ease:"back.out(1.7)"},${t(x)});`),
    raw: s => L.push(s),
  };
}

const FONT = `@font-face{font-family:"Gotham";src:url("../assets/fonts/GothamBlack.otf");font-weight:900}@font-face{font-family:"Montserrat";src:url("../assets/fonts/Montserrat.ttf");font-weight:100 900}`;
const CSS = `${FONT}
#root{position:absolute;inset:0;overflow:visible;font-family:"Montserrat",sans-serif}
.abs{position:absolute}
.abs svg{width:100%;height:100%;overflow:visible}
.big{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Gotham",sans-serif;line-height:1.0;white-space:nowrap;text-transform:uppercase;-webkit-text-stroke:14px ${INK};paint-order:stroke fill;text-shadow:10px 12px 0 rgba(10,31,35,.55)}
.sub{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;white-space:nowrap;text-transform:uppercase;letter-spacing:.02em;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:6px 8px 0 rgba(10,31,35,.5)}
.fr{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}
.fr img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 34px rgba(242,232,216,.55)) drop-shadow(0 26px 26px rgba(10,31,35,.45))}
.pill{display:flex;align-items:center;justify-content:center;gap:14px;width:100%;height:100%;border-radius:999px;border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Montserrat",sans-serif;font-weight:900;letter-spacing:.01em;white-space:nowrap;text-transform:uppercase}
.stamp{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:12px solid ${YEL};border-radius:28px;font-family:"Gotham",sans-serif;color:${YEL};background:${NOITE};box-shadow:10px 12px 0 rgba(10,31,35,.35);text-shadow:6px 8px 0 rgba(10,31,35,.6);white-space:nowrap;text-transform:uppercase}
.ct{position:relative;width:100%;height:100%;border-radius:30px;background:${CREME};border:8px solid ${INK};box-shadow:10px 12px 0 rgba(10,31,35,.55);overflow:hidden;text-align:center;color:${NOITE}}
.ct-h{height:64px;font-family:"Montserrat",sans-serif;font-weight:900;font-size:27px;letter-spacing:.12em;display:flex;align-items:center;justify-content:center;white-space:nowrap;border-bottom:6px solid ${INK}}
.ct-n{height:170px;display:flex;align-items:center;justify-content:center;padding:0 18px;font-family:"Gotham",sans-serif;font-size:58px;line-height:1.02;text-transform:uppercase}
.lb{width:100%;height:100%;border-radius:26px;background:${PET};border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center}
.lb-r{font-family:"Montserrat",sans-serif;font-weight:900;font-size:26px;letter-spacing:.2em;color:${AMB};text-transform:uppercase;white-space:nowrap}
.lb-g{font-family:"Gotham",sans-serif;font-size:42px;color:${CREME};text-transform:uppercase;white-space:nowrap}
.pr{width:100%;height:100%;border-radius:24px;background:${NOITE};border:6px solid ${YEL};box-shadow:8px 10px 0 rgba(10,31,35,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.pr-r{font-family:"Montserrat",sans-serif;font-weight:900;font-size:24px;letter-spacing:.22em;color:${CREME};white-space:nowrap}
.pr-v{font-family:"Gotham",sans-serif;font-size:70px;line-height:1;color:${YEL};white-space:nowrap}
.src{width:100%;height:100%;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:26px;letter-spacing:.1em;color:${NOITE};text-transform:uppercase;white-space:nowrap}
.circ{width:100%;height:100%;border-radius:50%;background:${CREME};border:8px solid ${INK};box-shadow:10px 12px 0 rgba(10,31,35,.5);display:flex;align-items:center;justify-content:center;overflow:hidden}
.circ img{height:86%;object-fit:contain}
.assin{width:100%;text-align:center}
.assin .n{font-family:"Gotham",sans-serif;font-size:84px;letter-spacing:6px;color:${NOITE};white-space:nowrap}
.assin .l{margin:22px auto 0;width:560px;height:3px;background:linear-gradient(90deg,transparent,${NOITE},transparent)}
.assin .s{margin-top:22px;font-family:"Montserrat",sans-serif;font-weight:900;font-size:44px;letter-spacing:12px;color:${PET}}
`;

const scenes = [];
function scene(id, start, end, markup, fn) {
  Z = 1; const A = anim(start); const html0 = markup(); fn(A);
  const P = id.slice(0, 2) + '_';
  const html = html0.replace(/id="([^"]+)"/g, `id="${P}$1"`);
  const pre = str => str.replace(/#([A-Za-z][\w]*)/g, `#${P}$1`);
  A.L.forEach((l, i) => { A.L[i] = pre(l); }); A.hidden.forEach((h, i) => { A.hidden[i] = pre(h); });
  scenes.push({ id, start, end });
  fs.writeFileSync(path.join(HF, 'compositions', id + '.html'), `<template>
<style>${CSS}</style>
<div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-layout-allow-overlap data-layout-allow-overflow>
<div style="position:absolute;left:0;top:${OFF}px;width:1080px;height:1100px">
${html}
</div>
</div>
<script>
(function(){
  window.__timelines = window.__timelines || {};
  ${A.hidden.length ? `gsap.set(${JSON.stringify(A.hidden.join(','))},{opacity:0});` : ''}
  const tl = gsap.timeline({ paused: true });
  ${A.L.join('\n  ')}
  window.__timelines["${id}"] = tl;
})();
</script>
</template>`);
}

// ---------- âncoras ----------
const iTodos = F('todos'), iSo = F('Só'), iE1 = F('E', F('nenhuma.')), iEntao = F('Então,', F('baunilha.')), iSalva = F('Salva');
const B = { gancho: 0, lista: T(iTodos) - 0.35, dois: T(iSo) - 0.1, um: T(iE1) - 0.1, final: T(iEntao) - 0.1 };
const TA = FALA + 0.05;
// frase-chave sem efeito sonoro: de ~0,3 s antes de "Então," até o fim de "pedir."
const iPedir = F('pedir.');
const LIMPO = [T(iEntao) - 0.3, W[iPedir].fim + 0.05];

// layout padrão das cartelas (local): número à esquerda em cima, frasco à esquerda, cartões à direita
const LX = 560, LW = 480;

// ===== 1) GANCHO FIXO: ANTES DE GASTAR / R$ 300 / NUM ÁRABE… (quadro 0 até "todos") =====
{
  const iArabe = F('árabe'), iTrez = F('trezentos'), iPed = F('pedido,'), iSeg = F('segura'), iCart = F('cartão'), iLista = F('lista');
  const iPorque = F('Porque'), iDuz = F('duzentos'), iCheir = F('cheiroso,'), iNum = F('número'), iNicho = F('nicho'), iMil = F('mil'), iReais = F('reais.', iMil);
  scene('gancho', B.gancho, B.lista, () =>
    sub('g1', 'ANTES DE GASTAR', 40, 0, 1000, 110, 82, CREME)
    + big('g2', 'R$ 300', 20, 105, 1040, 250, 230, YEL)
    + sub('g3', 'NUM ÁRABE…', 40, 350, 1000, 110, 82, CREME)
    // embaixo do gancho
    + svgB('fa', SV.frs(), 150, 520, 270, 414)
    + pill('fp', '🔥 O MAIS PEDIDO', 450, 560, 560, 46, CREME, INK)
    + svgB('ca', SV.cartao, 470, 680, 470, 298)
    + pill('cs', '✋ SEGURA O CARTÃO', 420, 990, 620, 44, YEL, INK)
    + pill('d2', 'ATÉ R$ 200 DÁ', 90, 560, 620, 52, MENTA, INK)
    + svgB('dk', SV.check, 730, 560, 96, 96)
    + svgB('f1', SV.frs('?'), 150, 640, 270, 414)
    + big('n1', 'Nº 1', 440, 660, 560, 170, 140, YEL)
    + pill('nc', 'LEMBRA UM NICHO', 440, 850, 600, 44, CREME, INK)
    + box('mp', 470, 960, 540, 120, `<div class="stamp" style="font-size:64px;border-color:${PIM};color:${CREME}">R$ 1.500+</div>`, 'transform:rotate(-4deg)'),
  A => {
    A.hide('#fa', '#fp', '#ca', '#cs', '#d2', '#dk', '#f1', '#n1', '#nc', '#mp');
    S('impact_grave', 0.02, 0.4);
    A.pulse('#g2', 0.35, 1.06); A.pulse('#g2', T(iTrez), 1.08);
    A.sobe('#fa', T(iArabe) - 0.1); S('pop_leve', T(iArabe), 0.35);
    A.slide('#fp', T(iPed) - 0.25, 260); S('whoosh_rapido', T(iPed) - 0.3, 0.3);
    A.out('#fp', T(iSeg) - 0.15, 0.12);
    A.slam('#ca', T(iSeg), 1.8, -6); S('carimbo', T(iSeg) + 0.05, 0.4);
    A.rise('#cs', T(iCart), 30, 0.25); A.wiggle('#ca', T(iLista), 4, 3);
    A.out('#fa,#ca,#cs', T(iPorque) - 0.12, 0.14);
    A.slide('#d2', T(iDuz) - 0.2, -260); S('whoosh_rapido', T(iDuz) - 0.25, 0.3);
    A.pop('#dk', T(iCheir)); S('ding_acerto', T(iCheir), 0.35);
    A.out('#d2,#dk', T(iNum) - 0.15, 0.12);
    A.sobe('#f1', T(iNum) - 0.1); A.slam('#n1', T(iNum) + 0.1, 2.0); S('suspense_dun', T(iNum) + 0.1, 0.35);
    A.rise('#nc', T(iNicho) - 0.1, 30, 0.25);
    A.slam('#mp', T(iMil) - 0.05, 2.0, -4); S('caixa_registradora', T(iMil), 0.35); A.wiggle('#mp', T(iReais), 4, 3);
    A.out('#g1,#g2,#g3,#f1,#n1,#nc,#mp', B.lista - 0.14, 0.14);
  });
}

// ===== 2) LISTA 5 → 3 (Jorge di Profumo · Salvo · Attar Al Wesal) =====
{
  const iLoja = F('loja'), iEntao2 = F('então', iTodos);
  const ITENS = [
    { k: 'jorge', num: 5, nome: 'JORGE DI<br>PROFUMO', marca: 'MAISON ALHAMBRA', fam: MENTA, ft: INK, rot: 'LEMBRA', gr: 'ACQUA DI GIÒ PROFUMO', grfs: 34, vibe: '☀️ FRESQUINHO PRO CALOR', pr: 'R$ 154*',
      iNum: F('cinco'), iNome: F('Jorge'), iLb: F('lembra', F('Jorge')), iVibe: F('fresquinho'), iOut: F('Já') },
    { k: 'salvo', num: 4, nome: 'SALVO', marca: 'MAISON ALHAMBRA', fam: BERG, ft: INK, rot: 'LEMBRA', gr: 'SAUVAGE EDT', grfs: 42, vibe: '🌶️ FRESCO E APIMENTADO', pr: 'R$ 169*',
      iNum: F('quatro'), iNome: F('Salvo,'), iLb: F('lembra', F('Salvo,')), iVibe: F('Sauvage'), iOut: F('três') },
    { k: 'attar', num: 3, nome: 'ATTAR<br>AL WESAL', marca: 'AL WATANIAH', fam: ALG, ft: INK, rot: 'A COMUNIDADE COMPARA', gr: 'ULTRA MALE', grfs: 42, vibe: '🪩 DOCE PRA BALADA', pr: 'R$ 140*',
      iNum: F('três'), iNome: F('Attar'), iLb: F('comunidade'), iVibe: F('doce'), iOut: null },
  ];
  scene('lista', B.lista, B.dois, () =>
    pill('lg', '🛒 ACHEI EM LOJA GRANDE', 140, 300, 800, 50, CREME, INK)
    + pill('l2', 'TODOS ATÉ R$ 200', 190, 450, 700, 54, MENTA, INK)
    + ITENS.map(it =>
      big(`n${it.num}`, `#${it.num}`, 30, 0, 280, 190, 170, YEL)
      + frasco(`f${it.num}`, it.k, 290, 960, 640)
      + cartela(`c${it.num}`, it.num, it.nome, it.marca, LX, 70, LW, it.fam, it.ft)
      + box(`b${it.num}`, LX - 20, 350, LW + 40, 150, `<div class="lb"><div class="lb-r">${it.rot}</div><div class="lb-g" style="font-size:${it.grfs}px">${it.gr}</div></div>`)
      + pill(`v${it.num}`, it.vibe, LX - 20, 540, LW + 40, 32, it.fam, it.ft)
      + preco(`p${it.num}`, it.pr, LX + 60, 680, 380)
    ).join('')
    + fonte('fn', '*menor preço achado em 14/11 · muda por loja', 1040),
  A => {
    A.hide('#lg', '#l2', '#fn', ...ITENS.map(it => ['n', 'f', 'c', 'b', 'v', 'p'].map(x => `#${x}${it.num}`).join(',')));
    A.slide('#lg', T(iTodos) - 0.1, -260); S('whoosh_rapido', T(iTodos) - 0.15, 0.3);
    A.pop('#l2', T(iLoja) - 0.6); S('ding_acerto', T(iLoja) - 0.5, 0.3);
    A.out('#lg,#l2', T(iEntao2) + 0.15, 0.14);
    ITENS.forEach((it, j) => {
      const n = it.num;
      A.slam(`#n${n}`, T(it.iNum) - 0.05, 2.2); S('impact_grave', T(it.iNum), 0.35);
      A.sobe(`#f${n}`, T(it.iNome) - 0.15); S('shine_brilho', T(it.iNome), 0.3);
      A.raw(`tl.fromTo("#c${n}",{opacity:0,rotation:-14,y:-160},{opacity:1,rotation:-2,y:0,duration:0.45,ease:"back.out(1.6)"},${A.t(T(it.iNome) + 0.05)});`); S('click_ui', T(it.iNome) + 0.2, 0.3);
      A.slide(`#b${n}`, T(it.iLb) - 0.1, 240); S('whoosh_suave', T(it.iLb) - 0.1, 0.3);
      A.rise(`#v${n}`, T(it.iVibe) - 0.1, 30, 0.26);
      A.raw(`tl.fromTo("#p${n}",{opacity:0,y:-120,rotation:-14},{opacity:1,y:0,rotation:-3,duration:0.5,ease:"elastic.out(1,0.55)"},${A.t(T(it.iVibe) + 0.1)});`); S('caixa_registradora', T(it.iVibe) + 0.15, 0.25);
      if (j === 0) A.rise('#fn', T(it.iVibe) + 0.2, 10, 0.3);
      const fim = it.iOut != null ? T(it.iOut) - 0.12 : B.dois - 0.14;
      A.out(['n', 'f', 'c', 'b', 'v', 'p'].map(x => `#${x}${n}`).join(','), fim, 0.14);
    });
    A.out('#fn', B.dois - 0.14, 0.12);
  });
}

// ===== 3) Nº 2: o vendedor quase nunca oferece · Qaed Al Fursan (Lattafa) · abacaxi + açafrão · sem copiar grife =====
{
  const iVend = F('vendedor', iSo), iQaed = F('Qaed'), iAbac = F('abacaxi'), iAcaf = F('açafrão'), iCop = F('copiar'), iNen = F('nenhuma.');
  scene('dois', B.dois, B.um, () =>
    big('n2', '#2', 30, 0, 280, 190, 170, YEL)
    + pill('vn', '🤫 QUASE NINGUÉM OFERECE', 330, 40, 720, 40, CREME, INK)
    + frasco('f2', 'qaed', 290, 960, 520)
    + cartela('c2', 2, 'QAED<br>AL FURSAN', 'LATTAFA', LX, 170, LW, PIM, CREME)
    + pill('a1', '🍍 ABACAXI', LX, 450, 300, 36, BERG, INK)
    + pill('a2', 'AÇAFRÃO', LX + 140, 560, 340, 36, PIM, CREME)
    + box('sc', 470, 690, 580, 130, `<div class="stamp" style="font-size:46px">SEM COPIAR GRIFE</div>`, 'transform:rotate(-4deg)')
    + preco('p2', 'R$ 172*', 600, 860, 380, 'EM PROMOÇÃO')
    + fonte('fn', '*menor preço achado em 14/11 · muda por loja', 1040),
  A => {
    A.hide('#n2', '#vn', '#f2', '#c2', '#a1', '#a2', '#sc', '#p2', '#fn');
    A.slam('#n2', T(iSo) - 0.05, 2.2); S('impact_grave', T(iSo), 0.35);
    A.slide('#vn', T(iVend) - 0.1, 300); S('whoosh_rapido', T(iVend) - 0.15, 0.3);
    A.sobe('#f2', T(iQaed) - 0.15); S('shine_brilho', T(iQaed), 0.3);
    A.raw(`tl.fromTo("#c2",{opacity:0,rotation:-14,y:-160},{opacity:1,rotation:-2,y:0,duration:0.45,ease:"back.out(1.6)"},${A.t(T(iQaed) + 0.05)});`); S('click_ui', T(iQaed) + 0.2, 0.3);
    A.pop('#a1', T(iAbac) - 0.05); S('pop_leve', T(iAbac), 0.35);
    A.pop('#a2', T(iAcaf) - 0.05, 3); S('pop_leve', T(iAcaf), 0.35);
    A.slam('#sc', T(iCop) - 0.1, 2.0, -4); S('carimbo', T(iCop), 0.4);
    A.raw(`tl.fromTo("#p2",{opacity:0,y:-120,rotation:-14},{opacity:1,y:0,rotation:-3,duration:0.5,ease:"elastic.out(1,0.55)"},${A.t(T(iNen) + 0.05)});`); S('caixa_registradora', T(iNen) + 0.1, 0.25);
    A.rise('#fn', T(iNen) + 0.15, 10, 0.3);
    A.out('#n2,#vn,#f2,#c2,#a1,#a2,#sc,#p2,#fn', B.um - 0.14, 0.14);
  });
}

// ===== 4) Nº 1: o de R$ 300 fica caro · Perseus (Maison Alhambra) lembra o Pegasus (Parfums de Marly) · amêndoa e baunilha =====
{
  const iNum = F('número', iE1), iTrez = F('trezentos', iE1), iCaro = F('caro,'), iPers = F('Perseus,'), iLb = F('lembra', iPers), iPeg = F('Pegasus,'), iMarly = F('Marly,'), iAm = F('amêndoa'), iBau = F('baunilha.');
  scene('um', B.um, B.final, () =>
    big('n1', '#1', 30, 0, 280, 190, 170, YEL)
    + svgB('sq', SV.frs('?'), 155, 470, 270, 414)
    + pill('t3', 'R$ 300', 560, 120, 420, 70, CREME, INK)
    + svgB('rx', SV.risco, 560, 110, 420, 130)
    + sub('cr', 'FICOU CARO 😬', 500, 270, 560, 90, 54, CREME)
    + frasco('f1', 'perseus', 290, 960, 640)
    + cartela('c1', 1, 'PERSEUS', 'MAISON ALHAMBRA', LX, 90, LW, CEDRO, CREME)
    + pill('lm', 'LEMBRA ↓', LX + 90, 30, 300, 36, CREME, INK)
    + box('pg', LX + 70, 110, 340, 340, `<div class="circ"><img src="assets/img/pegasus.png"></div>`)
    + box('pn', LX - 20, 465, LW + 40, 190, `<div class="lb"><div class="lb-r">PARFUMS DE MARLY</div><div class="lb-g">PEGASUS</div><div class="lb-g" style="color:${YEL};font-size:46px">R$ 1.526+</div></div>`)
    + pill('m1', '🌰 AMÊNDOA', LX - 10, 680, 320, 34, CREME, INK)
    + pill('m2', 'BAUNILHA', LX + 180, 770, 320, 34, CREME, INK)
    + preco('p1', 'R$ 174*', LX + 60, 860, 380)
    + fonte('fn', '*menor preço achado em 14/11 · muda por loja', 1040),
  A => {
    A.hide('#n1', '#sq', '#t3', '#rx', '#cr', '#f1', '#c1', '#lm', '#pg', '#pn', '#m1', '#m2', '#p1', '#fn');
    A.slam('#n1', T(iNum) - 0.05, 2.2); S('suspense_dun', T(iNum), 0.35);
    A.sobe('#sq', T(iNum) + 0.05);
    A.pop('#t3', T(iTrez) - 0.1); S('pop_leve', T(iTrez), 0.3);
    A.raw(`tl.fromTo("#rx",{opacity:0,scaleX:0,transformOrigin:"0% 50%"},{opacity:1,scaleX:1,duration:0.22,ease:"power3.out"},${A.t(T(iCaro) - 0.15)});`); S('disco_arranhado', T(iCaro) - 0.1, 0.3);
    A.rise('#cr', T(iCaro) + 0.1, 30, 0.25);
    // revela o Perseus
    A.out('#sq', T(iPers) - 0.12, 0.12); A.out('#t3,#rx,#cr', T(iPers) - 0.05, 0.14);
    A.raw(`tl.fromTo("#f1",{opacity:0,scale:0.4,y:120},{opacity:1,scale:1,y:0,duration:0.45,ease:"back.out(1.8)"},${A.t(T(iPers) - 0.05)});`); S('plim_brilho_magico', T(iPers), 0.4);
    A.raw(`tl.fromTo("#c1",{opacity:0,rotation:-14,y:-160},{opacity:1,rotation:-2,y:0,duration:0.45,ease:"back.out(1.6)"},${A.t(T(iPers) + 0.25)});`); S('click_ui', T(iPers) + 0.4, 0.3);
    A.raw(`tl.fromTo("#p1",{opacity:0,y:-120,rotation:-14},{opacity:1,y:0,rotation:-3,duration:0.5,ease:"elastic.out(1,0.55)"},${A.t(T(iPers) + 0.6)});`); S('caixa_registradora', T(iPers) + 0.65, 0.25);
    A.rise('#fn', T(iPers) + 0.7, 10, 0.3);
    // lembra o Pegasus
    A.out('#c1', T(iLb) - 0.12, 0.14);
    A.pop('#lm', T(iLb) - 0.05); S('whoosh_suave', T(iLb) - 0.05, 0.3);
    A.raw(`tl.fromTo("#pg",{opacity:0,scale:0.3,rotation:-20},{opacity:1,scale:1,rotation:0,duration:0.45,ease:"back.out(1.7)"},${A.t(T(iPeg) - 0.1)});`); S('shine_brilho', T(iPeg), 0.35);
    A.slide('#pn', T(iMarly) - 0.1, 240); S('caixa_registradora', T(iMarly), 0.25);
    A.pop('#m1', T(iAm) - 0.05, -3); S('pop_leve', T(iAm), 0.3);
    A.pop('#m2', T(iBau) - 0.05, 3); S('pop_leve', T(iBau), 0.3);
    A.out('#n1,#f1,#lm,#pg,#pn,#m1,#m2,#p1,#fn', B.final - 0.14, 0.14);
  });
}

// ===== 5) FINAL: frase-chave (sem efeito) → SALVA → cheiroso sem preço de grife → SEGUE → assinatura =====
{
  const iLoja = F('loja', iEntao), iQuer = F('Quer'), iSegue = F('Segue');
  const FR = [['jorge', 140], ['salvo', 340], ['attar', 540], ['qaed', 740], ['perseus', 940]];
  scene('final', B.final, END, () =>
    FR.map(([k, cx], j) => frasco(`f${j}`, k, cx, 520, k === 'qaed' ? 250 : 330)).join('')
    + pill('sb', '🛒 SABENDO O QUE PEDIR', 120, 600, 840, 50, CREME, INK)
    + pill('sv', '📌 SALVA PRA NÃO ESQUECER', 70, 260, 940, 54, YEL, INK)
    + sub('cg', 'CHEIROSO SEM PREÇO DE GRIFE', 30, 440, 1020, 90, 54, CREME)
    + pill('sg', 'SEGUE @VALOTAPARFUM', 120, 600, 840, 54, YEL, INK)
    + box('as', 0, 330, 1080, 230, '<div class="assin"><div class="n">VALOTA PARFUM</div><div class="l"></div><div class="s">@VALOTAPARFUM</div></div>'),
  A => {
    A.hide(...FR.map((_, j) => `#f${j}`), '#sb', '#sv', '#cg', '#sg', '#as');
    // frase-chave: entra sem som
    FR.forEach((_, j) => A.raw(`tl.fromTo("#f${j}",{opacity:0,y:120,scale:0.6},{opacity:1,y:0,scale:1,duration:0.38,ease:"back.out(1.8)"},${A.t(T(iEntao) + j * 0.1)});`));
    A.rise('#sb', T(iLoja) - 0.1, 30, 0.3);
    A.out(FR.map((_, j) => `#f${j}`).join(',') + ',#sb', T(iSalva) - 0.12, 0.14);
    A.slam('#sv', T(iSalva) - 0.05, 1.8); S('ding_acerto', T(iSalva), 0.4); A.hop('#sv', T(iSalva) + 0.6, 24);
    A.rise('#cg', T(iQuer) + 0.1, 30, 0.28);
    A.slam('#sg', T(iSegue) - 0.05, 1.7); S('ding_notificacao', T(iSegue), 0.4);
    A.out('#sv,#cg,#sg', TA, 0.2);
    A.raw(`tl.fromTo("#as",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"power3.out"},${A.t(TA + 0.15)});`); S('shine_brilho', TA + 0.15, 0.45);
  });
}

// ---------- selo persistente (depois do gancho): TOP 5 ÁRABES · ATÉ R$ 200 ----------
fs.writeFileSync(path.join(HF, 'compositions', 'selo.html'), `<template>
<style>${FONT}
#root{position:absolute;inset:0}
#selo{position:absolute;left:250px;top:196px;width:580px;height:74px;border-radius:999px;background:${NOITE};border:5px solid ${CREME};box-shadow:6px 8px 0 rgba(10,31,35,.45);display:flex;align-items:center;justify-content:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:32px;letter-spacing:.06em;color:${CREME};white-space:nowrap}
#selo b{color:${YEL};font-weight:900;margin-left:10px}
</style>
<div id="root" data-composition-id="selo" data-width="1080" data-height="1920">
<div id="selo">TOP 5 ÁRABES ·<b>ATÉ R$ 200</b></div>
</div>
<script>
(function(){
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.fromTo("#selo",{opacity:0,y:-30},{opacity:1,y:0,duration:0.35,ease:"back.out(1.8)"},0.05);
  tl.to("#selo",{opacity:0,duration:0.2},${(TA - B.lista - 0.25).toFixed(3)});
  window.__timelines["selo"] = tl;
})();
</script>
</template>`);

// ---------- fundo (âmbar, igual ao v24) ----------
fs.writeFileSync(path.join(HF, 'compositions', 'fundo.html'), `<template>
<style>
#root{position:absolute;inset:0;overflow:hidden;background:${AMB}}
#band{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(ellipse 80% 48% at 50% 38%, rgba(255,201,60,.55) 0%, rgba(255,201,60,0) 60%), radial-gradient(ellipse 120% 75% at 50% 45%, ${AMB} 55%, rgba(107,68,48,.55) 100%), ${AMB}}
#dots{position:absolute;left:-46px;top:-46px;width:1172px;height:2012px;opacity:.10;background-image:radial-gradient(${NOITE} 2.5px,transparent 3px);background-size:46px 46px}
#luz{position:absolute;left:-500px;top:200px;width:900px;height:1000px;background:radial-gradient(ellipse at center,rgba(242,232,216,.32),rgba(242,232,216,0) 65%)}
</style>
<div id="root" data-composition-id="fundo" data-width="1080" data-height="1920">
<div id="band"><div id="dots"></div><div id="luz"></div></div>
</div>
<script>
(function(){
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.fromTo("#luz",{x:0},{x:1100,duration:${(END / 2).toFixed(2)},ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false},0);
  tl.fromTo("#dots",{x:0,y:0},{x:46,y:46,duration:${END},ease:"none",immediateRender:false},0);
  window.__timelines["fundo"] = tl;
})();
</script>
</template>`);

// ---------- legendas (caixa alta, creme + amarelo nas palavras-chave; ≤ 20 caracteres; nomes compostos inteiros) ----------
const KEY = /^(TREZENTOS|CARTÃO|DUZENTOS|NICHO|QUINHENTOS|CINCO|JORGE|DI|PROFUMO|ACQUA|GIÒ|QUATRO|SALVO|SAUVAGE|EDT|TRÊS|ATTAR|AL|WESAL|ULTRA|MALE|DOIS|QAED|FURSAN|LATTAFA|ABACAXI|AÇAFRÃO|UM|CARO|PERSEUS|MAISON|ALHAMBRA|PEGASUS|PARFUMS|DE MARLY|MARLY|AMÊNDOA|BAUNILHA|PEDIR|SALVA|SEGUE|VALOTA|PARFUM)$/;
const FIXOS = [['Jorge', 'di', 'Profumo,'], ['Acqua', 'di', 'Giò', 'Profumo,'], ['Sauvage', 'EDT,'], ['Attar', 'Al', 'Wesal,'], ['Ultra', 'Male,'], ['Qaed', 'Al', 'Fursan,'], ['Maison', 'Alhambra,'], ['Parfums', 'de', 'Marly,'], ['Valota', 'Parfum'], ['mil', 'e', 'quinhentos']];
const units = []; // cada unidade = lista de índices (nome composto fica junto)
for (let i = 0; i < W.length;) {
  const fx = FIXOS.find(f => f.every((w, k) => W[i + k] && W[i + k].p === w));
  if (fx) { units.push(fx.map((_, k) => i + k)); i += fx.length; } else { units.push([i]); i++; }
}
const len = idx => idx.reduce((s, k) => s + W[k].p.replace(/["“”.,:;!?]+/g, '').length + 1, -1);
const groups = []; let cur = [];
units.forEach((u, j) => {
  if (cur.length && len([...cur, ...u]) > 20) { groups.push(cur); cur = []; }
  cur.push(...u);
  const last = W[u[u.length - 1]]; const nx = units[j + 1] ? W[units[j + 1][0]] : null;
  const pont = /[.,:!?…]$/.test(last.p); const gap = nx ? nx.ini - last.fim : 9;
  if (cur.length >= 3 || pont || gap > 0.2) { groups.push(cur); cur = []; }
});
if (cur.length) groups.push(cur);
const capEls = [];
groups.forEach((g, gi) => {
  const st = gi === 0 ? 0.02 : W[g[0]].ini; if (st >= TA) return;
  const next = groups[gi + 1]; const nxt = next ? W[next[0]].ini : END;
  const en = Math.min(nxt, W[g[g.length - 1]].fim + 0.35, TA);
  const html = g.map(i => { const raw = W[i].p.replace(/["“”]/g, '').replace(/[.,:;!]+$/, '').toUpperCase(); const base = raw.replace(/\?$/, ''); return `<span style="color:${KEY.test(base) ? YEL : CREME}">${raw}</span>`; }).join(' ');
  const nch = len(g);
  const fsz = Math.min(64, Math.floor(980 / (nch * 0.74)));
  capEls.push(`<div id="cap${gi}" style="font-size:${fsz}px" class="clip cap" data-start="${st.toFixed(3)}" data-duration="${Math.max(0.2, en - st).toFixed(3)}" data-track-index="1">${html}</div>`);
});
const maxCap = Math.max(...groups.map(len));
fs.writeFileSync(path.join(HF, 'compositions', 'captions.html'), `<template>
<style>
${FONT}
#root{position:absolute;inset:0}
.cap{position:absolute;left:40px;top:${CAP_TOP}px;width:1000px;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:64px;line-height:1.08;white-space:nowrap;-webkit-text-stroke:14px ${INK};paint-order:stroke fill;text-shadow:0 7px 0 rgba(10,31,35,.6)}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-no-timeline>
${capEls.join('\n')}
</div>
</template>`);

// ---------- áudio: narração + SÓ efeitos sonoros (sem música); nada no trecho da frase-chave ----------
const FFM = path.join(__dirname, '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const LIB = path.join(__dirname, '../../biblioteca_audio/efeitos');
fs.copyFileSync(path.join(__dirname, 'narracao.mp3'), path.join(HF, 'assets/audio/narracao.mp3'));
const DUR = {};
const durOf = f => { if (DUR[f]) return DUR[f]; const dst = path.join(HF, 'assets/audio', f + '.mp3'); if (!fs.existsSync(dst)) fs.copyFileSync(path.join(LIB, f + '.mp3'), dst);
  let out = ''; try { execFileSync(FFM, ['-i', dst], { stdio: 'pipe' }); } catch (e) { out = String(e.stderr); }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/); return (DUR[f] = m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 1); };
const visto = new Set();
const sfxEls = SFX.filter(([f, at]) => { const k = f + '@' + at.toFixed(2); if (visto.has(k)) return false; visto.add(k); if (at >= LIMPO[0] && at <= LIMPO[1]) return false; return at < END - 0.05; }).map(([file, at, vol], i) => {
  const a = Math.max(0, at);
  let d = Math.min(durOf(file), END - a);
  if (a < LIMPO[0] && a + d > LIMPO[0]) d = Math.max(0.1, LIMPO[0] - a);   // corta a cauda antes da frase-chave
  return `<audio id="sfx${i}" class="clip" src="assets/audio/${file}.mp3" data-start="${a.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${12 + i}" data-volume="${vol}"></audio>`;
});
const voz = `<audio id="voz" class="clip" src="assets/audio/narracao.mp3" data-start="0" data-duration="${FALA.toFixed(3)}" data-track-index="10" data-volume="1"></audio>`;

// ---------- index ----------
const ORDER = Object.keys(B);
const hosts = ORDER.map((id, i) => {
  const sc = scenes.find(x => x.id === id);
  return `<div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${sc.start.toFixed(3)}" data-duration="${(sc.end - sc.start).toFixed(3)}" data-track-index="${2 + (i % 2)}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${10 + i}"></div>`;
});
fs.writeFileSync(path.join(HF, 'index.html'), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${AMB}}
#root{position:relative;width:100%;height:100%}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${END}" data-width="1080" data-height="1920">
<div id="fundo" data-composition-id="fundo" data-composition-src="compositions/fundo.html" data-start="0" data-duration="${END}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>
${hosts.join('\n')}
<div id="selo" data-composition-id="selo" data-composition-src="compositions/selo.html" data-start="${B.lista.toFixed(3)}" data-duration="${(TA - B.lista).toFixed(3)}" data-track-index="8" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:40"></div>
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${END}" data-track-index="9" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50" data-no-timeline></div>
${voz}
${sfxEls.join('\n')}
</div>
<script>
window.__timelines = window.__timelines || {};
window.__timelines["main"] = gsap.timeline({ paused: true });
</script>
</body>
</html>`);
console.log('ok · END', END, '· cenas', scenes.map(x => `${x.id}(${x.start.toFixed(2)}–${x.end.toFixed(2)})`).join(', '), '· legendas', capEls.length, '(maior', maxCap, 'caracteres) · sfx', sfxEls.length, '· limpo', LIMPO.map(x => x.toFixed(2)).join('–'));

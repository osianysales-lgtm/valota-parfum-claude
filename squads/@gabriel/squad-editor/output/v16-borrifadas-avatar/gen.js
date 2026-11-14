// v16 · Quantas borrifadas por categoria (leve 16 · médio 10 · pesado 5) · AVATAR osianyreal (look Van Gogh) + voz ElevenLabs
// Layout = v13/v14 (card do avatar 500 px em top 1230, legendas em 1128, motion na área de cima). Paleta Petróleo & Âmbar.
// Tipografia: Gotham Black (títulos/números) + Montserrat (texto, legenda 900). SEM música, só SFX.
// Rodar: node gen.js  →  hf/index.html + hf/compositions/*.html
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const HF = path.join(__dirname, 'hf');
const VOZ0 = JSON.parse(fs.readFileSync(path.join(__dirname, 'narracao_palavras.json'), 'utf8')).palavras;
const VOZ = [];   // "arroba Valota Parfum" (3 palavras na voz) = "@valotaparfum" (1 no roteiro)
for (let i = 0; i < VOZ0.length; i++) {
  if (/^arroba$/i.test(VOZ0[i].word)) { VOZ.push({ word: '@valotaparfum', start: VOZ0[i].start, end: VOZ0[i + 2].end }); i += 2; }
  else VOZ.push(VOZ0[i]);
}
const ROT = fs.readFileSync(path.join(__dirname, 'roteiro.txt'), 'utf8').trim().split(/\s+/);
if (ROT.length !== VOZ.length) throw new Error(`roteiro ${ROT.length} x voz ${VOZ.length}`);
const W = VOZ.map((w, i) => ({ p: ROT[i], ini: w.start, fim: w.end }));   // grafia do roteiro, tempo da voz
const FALA = W[W.length - 1].fim;
const END = +Math.min(FALA + 2.8, 58.3).toFixed(2);   // o avatar tem ~3 s ocioso (boca fechada) depois da fala: nada congelado
const GRADE = fs.readFileSync(path.join(__dirname, 'grade_attr.txt'), 'utf8').trim();

const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMB = '#D49A4E', YEL = '#FFC93C';
const MENTA = '#7DBFB3', PIM = '#9C452A', ALG = '#DCD6E2', CEDRO = '#6B4430';
const CORAL = '#E8674A';   // só "erro"
const INK = NOITE;
const COR = { leve: MENTA, medio: AMB, pesado: PIM };

const BAND = 640;
const CAM_P = 0.21;
const CARD = { w: 500, top: 1230, r: 60 };
const OFF = 360;

// ---------- palavras ----------
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '');
function F(q, from = 0) {
  const n = norm(q);
  for (let i = from; i < W.length; i++) if (norm(W[i].p) === n) return i;
  for (let i = from; i < W.length; i++) if (norm(W[i].p).startsWith(n)) return i;
  throw new Error(`palavra "${q}" não encontrada depois de ${from}`);
}
const T = i => W[i].ini;

// ---------- SVGs ----------
const SV = {
  elevador: `<svg viewBox="0 0 320 420"><rect x="10" y="60" width="300" height="350" rx="14" fill="${LUZ}" stroke="${CREME}" stroke-width="9"/><rect x="100" y="8" width="120" height="44" rx="10" fill="${INK}" stroke="${CREME}" stroke-width="6"/><text x="160" y="42" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="30" fill="${YEL}">▲ 8</text><rect x="34" y="84" width="252" height="310" fill="${INK}"/><text class="cara" x="160" y="280" text-anchor="middle" font-size="130">😷</text><rect class="dl" x="34" y="84" width="126" height="310" fill="${ALG}" stroke="${INK}" stroke-width="5"/><rect class="dr" x="160" y="84" width="126" height="310" fill="${ALG}" stroke="${INK}" stroke-width="5"/></svg>`,
  arvore: `<svg viewBox="0 0 200 330"><path d="M100 0 V70" stroke="${CREME}" stroke-width="5"/><path d="M100 60 L150 120 L128 120 L172 180 L146 180 L190 250 L112 250 L112 300 L88 300 L88 250 L10 250 L54 180 L28 180 L72 120 L50 120Z" fill="${MENTA}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><circle cx="100" cy="66" r="9" fill="${CREME}" stroke="${INK}" stroke-width="4"/></svg>`,
  lua: `<svg viewBox="0 0 120 120"><path d="M78 8 A54 54 0 1 0 112 92 A44 44 0 1 1 78 8Z" fill="${YEL}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${MENTA}" stroke="${INK}" stroke-width="7"/><path d="M26 52 L44 70 L76 32" stroke="${INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  xmark: `<svg viewBox="0 0 100 100"><path d="M16 16 L84 84 M84 16 L16 84" stroke="${CORAL}" stroke-width="15" stroke-linecap="round" fill="none"/></svg>`,
  brilho: `<svg viewBox="0 0 100 100"><path d="M50 0 Q56 44 100 50 Q56 56 50 100 Q44 56 0 50 Q44 44 50 0Z" fill="${YEL}" stroke="${INK}" stroke-width="4"/></svg>`,
};

// ---------- imagens ----------
const pngDim = k => { const b = fs.readFileSync(path.join(HF, 'assets/img', k + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

// ---------- markup ----------
let Z = 1;
const box = (id, l, t, w, h, inner, extra = '') => `<div id="${id}" class="abs" style="left:${Math.round(l)}px;top:${Math.round(t)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;z-index:${Z++};${extra}">${inner}</div>`;
const svg = (id, k, l, t, w, h, extra = '') => box(id, l, t, w, h, SV[k], extra);
const big = (id, text, l, t, w, h, fs, color = YEL, extra = '') => box(id, l, t, w, h, `<div class="big" style="font-size:${fs}px;color:${color}">${text}</div>`, extra);
const sub = (id, text, l, t, w, h, fs, color = CREME, peso = 900, extra = '') => box(id, l, t, w, h, `<div class="sub" style="font-size:${fs}px;color:${color};font-weight:${peso}">${text}</div>`, extra);
const pill = (id, text, l, t, w, fs = 54, bg = CREME, fg = INK) => box(id, l, t, w, Math.round(fs * 1.8), `<div class="pill" style="background:${bg};color:${fg};font-size:${fs}px">${text}</div>`);
const bubble = (id, text, l, t, w, fs = 70) => box(id, l, t, w, Math.round(fs * 1.9) + 30, `<div class="bub" style="font-size:${fs}px;height:${Math.round(fs * 1.9)}px">${text}</div><div class="tail"></div>`, 'transform-origin:20% 100%');
const frasco = (id, img, cx, bottom, h) => { const [w0, h0] = pngDim(img); const w = Math.round(h * w0 / h0); return box(id, cx - w / 2, bottom - h, w, h, `<div class="fr"><img src="assets/img/${img}.png"></div>`, 'transform-origin:50% 100%'); };
// contador: um span por número (determinístico no render)
const contador = (id, n, l, t, w, h, fs, color = YEL) => box(id, l, t, w, h, Array.from({ length: n }, (_, i) => `<div id="${id}_${i + 1}" class="cnum" style="font-size:${fs}px;color:${color}">${i + 1}</div>`).join(''), 'transform-origin:50% 60%');

// ---------- animação ----------
function anim(start) {
  const L = []; const hidden = [];
  const t = x => Math.max(0, x - start).toFixed(3);
  const A = {
    L, t, hidden,
    hide: (...sel) => hidden.push(...sel),
    pop: (sel, x, rot = 0, d = 0.34) => L.push(`tl.fromTo("${sel}",{opacity:0,scale:0.2,rotation:${rot - 14}},{opacity:1,scale:1,rotation:${rot},duration:${d},ease:"back.out(2.2)"},${t(x)});`),
    slam: (sel, x, from = 2.4, rot = 0) => L.push(`tl.fromTo("${sel}",{opacity:0,scale:${from},rotation:${rot}},{opacity:1,scale:1,rotation:${rot},duration:0.24,ease:"power4.out"},${t(x)});`),
    out: (sel, x, d = 0.18) => L.push(`tl.to("${sel}",{opacity:0,scale:0.7,duration:${d},ease:"power3.in"},${t(x)});`),
    fade: (sel, x, v, d = 0.25) => L.push(`tl.to("${sel}",{opacity:${v},duration:${d},ease:"power2.inOut"},${t(x)});`),
    rise: (sel, x, dy = 60, d = 0.35) => L.push(`tl.fromTo("${sel}",{opacity:0,y:${dy}},{opacity:1,y:0,duration:${d},ease:"power3.out"},${t(x)});`),
    to: (sel, x, props, d = 0.3, ease = 'power3.out') => L.push(`tl.to("${sel}",{${props},duration:${d},ease:"${ease}"},${t(x)});`),
    set: (sel, x, props) => L.push(`tl.set("${sel}",{${props}},${t(x)});`),
    wiggle: (sel, x, n = 4, amp = 8) => L.push(`tl.to("${sel}",{keyframes:[${Array.from({ length: n }, (_, i) => `{rotation:${i % 2 ? -amp : amp},duration:0.06}`).join(',')},{rotation:0,duration:0.06}]},${t(x)});`),
    hop: (sel, x, hgt = 60) => L.push(`tl.to("${sel}",{keyframes:[{y:-${hgt},duration:0.16,ease:"power2.out"},{y:0,duration:0.22,ease:"bounce.out"}]},${t(x)});`),
    flutua: (sel, x, d) => L.push(`tl.fromTo("${sel}",{y:0},{y:-12,duration:${(Math.max(0.6, d) / 2).toFixed(3)},ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false},${t(x)});`),
    raw: s => L.push(s),
    // conta 1→n entre x0 e x1; cada número aparece com um "soco" e um psst baixinho
    conta: (id, n, x0, x1, sprays = true) => {
      for (let i = 1; i <= n; i++) {
        const x = n === 1 ? x0 : x0 + (i - 1) * (x1 - x0) / (n - 1);
        if (i > 1) L.push(`tl.set("#${id}_${i - 1}",{opacity:0},${t(x)});`);
        L.push(`tl.fromTo("#${id}_${i}",{opacity:1,scale:1.35},{opacity:1,scale:1,duration:0.12,ease:"power2.out",immediateRender:false},${t(x)});`);
        if (sprays) { S('pop_leve', x, 0.18); if (i % 4 === 1 || i === n) S('spray_perfume', x - 0.02, 0.22); }
      }
    },
  };
  return A;
}

const FONT = `@font-face{font-family:"Gotham";src:url("../assets/fonts/GothamBlack.otf");font-weight:900}@font-face{font-family:"Montserrat";src:url("../assets/fonts/Montserrat.ttf");font-weight:100 900}`;
const CSS = `${FONT}
#root{position:absolute;inset:0;overflow:visible;font-family:"Montserrat",sans-serif}
.abs{position:absolute}
.abs svg{width:100%;height:100%;overflow:visible}
.big{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Gotham",sans-serif;line-height:1.0;white-space:nowrap;text-transform:uppercase;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:10px 12px 0 rgba(10,31,35,.55)}
.sub{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Montserrat",sans-serif;white-space:nowrap;text-transform:uppercase;letter-spacing:.02em;-webkit-text-stroke:8px ${INK};paint-order:stroke fill}
.fr{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}
.fr img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 26px rgba(242,232,216,.22)) drop-shadow(0 24px 26px rgba(0,0,0,.55))}
.cnum{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;font-family:"Gotham",sans-serif;line-height:1;-webkit-text-stroke:14px ${INK};paint-order:stroke fill;text-shadow:16px 18px 0 rgba(10,31,35,.55)}
.pill{display:flex;align-items:center;justify-content:center;gap:14px;width:100%;height:100%;border-radius:999px;border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Montserrat",sans-serif;font-weight:900;letter-spacing:.01em;white-space:nowrap;text-transform:uppercase}
.bub{display:flex;align-items:center;justify-content:center;width:100%;border-radius:40px;background:${CREME};color:${INK};border:7px solid ${INK};font-family:"Gotham",sans-serif;white-space:nowrap;box-shadow:8px 10px 0 rgba(10,31,35,.5)}
.tail{position:absolute;bottom:4px;left:60px;width:40px;height:40px;background:${CREME};border-right:7px solid ${INK};border-bottom:7px solid ${INK};transform:rotate(45deg)}
.hd{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:18px;font-family:"Gotham",sans-serif;font-size:84px;line-height:1;white-space:nowrap;text-transform:uppercase;-webkit-text-stroke:9px ${INK};paint-order:stroke fill}
.hd small{font-family:"Montserrat",sans-serif;font-weight:300;font-size:34px;letter-spacing:.32em;color:${CREME};-webkit-text-stroke:0}
.chip{display:flex;align-items:center;gap:18px;width:100%;height:100%;padding:0 26px;border-radius:26px;border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Montserrat",sans-serif;font-weight:900;font-size:46px;color:${INK};white-space:nowrap;text-transform:uppercase}
.chip b{margin-left:auto;font-family:"Gotham",sans-serif;font-size:64px}
.card{width:100%;height:100%;border-radius:36px;background:${CREME};border:8px solid ${INK};box-shadow:12px 14px 0 rgba(10,31,35,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;color:${PET}}
.card .t{font-family:"Gotham",sans-serif;font-size:66px;line-height:1}
.card .s{margin-top:12px;font-family:"Montserrat",sans-serif;font-weight:500;font-size:30px;letter-spacing:.18em;text-transform:uppercase;color:${CEDRO}}
.stamp{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:12px solid ${YEL};border-radius:28px;font-family:"Gotham",sans-serif;font-size:100px;color:${YEL};background:rgba(10,31,35,.55);text-shadow:6px 8px 0 rgba(10,31,35,.6)}
.chat{width:100%;height:100%;border-radius:34px;background:${CREME};border:8px solid ${INK};box-shadow:12px 14px 0 rgba(10,31,35,.55);overflow:hidden;font-family:"Montserrat",sans-serif}
.chat .h{height:96px;background:${PET};color:${CREME};display:flex;align-items:center;gap:16px;padding:0 26px;font-weight:800;font-size:38px}
.chat .h small{font-weight:400;font-size:26px;color:${MENTA};margin-left:auto}
.msg{position:absolute;left:24px;max-width:736px;padding:12px 20px;border-radius:24px 24px 24px 6px;background:#fff;border:4px solid ${INK};font-weight:600;font-size:31px;color:${INK};white-space:nowrap}
.msg i{display:block;font-style:normal;font-weight:800;font-size:28px;color:${CEDRO};margin-bottom:2px}
.phone{width:100%;height:100%;border-radius:56px;background:${INK};border:8px solid ${CREME};box-shadow:12px 14px 0 rgba(10,31,35,.55);padding:22px 18px;overflow:hidden}
.scr{position:relative;width:100%;height:100%;border-radius:36px;background:#FBF7F0;overflow:hidden;font-family:"Montserrat",sans-serif;color:${INK}}
.logo{position:absolute;left:0;top:26px;width:100%;text-align:center;font-weight:800;font-size:38px;letter-spacing:.02em;color:${PET}}
.busca{position:absolute;left:22px;right:22px;top:92px;height:70px;border-radius:35px;border:4px solid ${PET};display:flex;align-items:center;padding:0 22px;gap:12px;font-weight:600;font-size:32px;color:${INK};white-space:nowrap;overflow:hidden}
.busca .cur{width:3px;height:36px;background:${PET}}
.res{position:absolute;left:22px;right:22px;top:182px;height:110px;display:flex;align-items:center;gap:18px;font-weight:800;font-size:30px}
.res img{height:100px}
.res small{display:block;font-weight:500;font-size:28px;color:${CEDRO}}
.mapa{position:absolute;left:22px;right:22px;top:306px;bottom:20px}
.mapa .tt{font-weight:800;font-size:28px;letter-spacing:.08em;color:${CEDRO};text-align:center;margin-bottom:8px}
.col{position:absolute;bottom:40px;width:50px;display:flex;flex-direction:column;align-items:center}
.col .bar{width:40px;border-radius:12px 12px 4px 4px;border:3px solid ${INK};transform-origin:50% 100%}
.col .ic{position:absolute;bottom:-44px;font-size:30px}
.assin{width:100%;text-align:center}
.assin .n{font-family:"Gotham",sans-serif;font-size:84px;letter-spacing:6px;color:${CREME};white-space:nowrap}
.assin .l{margin:22px auto 0;width:560px;height:3px;background:linear-gradient(90deg,transparent,${AMB},transparent)}
.assin .s{margin-top:22px;font-family:"Montserrat",sans-serif;font-weight:300;font-size:44px;letter-spacing:12px;color:${AMB}}
.res3{width:100%;height:100%;border-radius:30px;border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;color:${INK}}
.res3 .c{font-family:"Montserrat",sans-serif;font-weight:900;font-size:40px;letter-spacing:.04em}
.res3 .n{font-family:"Gotham",sans-serif;font-size:120px;line-height:1}
.res3 .b{font-family:"Montserrat",sans-serif;font-weight:600;font-size:30px;letter-spacing:.2em}
`;

// ---------- cenas ----------
const scenes = [];
function scene(id, start, end, markup, fn) {
  Z = 1; const A = anim(start); const html = markup(); fn(A);
  scenes.push({ id, start, end });
  fs.writeFileSync(path.join(HF, 'compositions', id + '.html'), `<template>
<style>${CSS}</style>
<div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-layout-allow-overlap data-layout-allow-overflow>
<div style="position:absolute;left:0;top:${OFF}px;width:1080px;height:1920px">
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

const SFX = [];
const S = (file, at, vol = 0.5) => SFX.push([file, at, vol]);
const empSfx = x => S('impact_grave', x, 0.45);

// âncoras
const iHoje = F('Hoje'), iLeve = F('Leve'), iMas = F('Mas'), iEpes = F('E', F('carro')), iPra = F('Pra'), iSegue = F('Segue');
const B = { gancho: 0, promessa: T(iHoje) - 0.1, leve: T(iLeve) - 0.1, medio: T(iMas) - 0.1, pesado: T(iEpes) - 0.1, fragrantica: T(iPra) - 0.1, cta: T(iSegue) - 0.1 };
const TA = FALA + 0.05;

// ===== 1) GANCHO: 16 borrifadas (contador + Acqua di Giò) → 5 (Le Male Elixir) → elevador que já sabe seu nome =====
{
  const i16 = F('dezesseis'), iBorr = F('borrifadas'), iE = F('E', iBorr), iPerf = F('perfume', iE), iCinco = F('cinco'), iElev = F('elevador'), iSabe = F('sabe'), iNome = F('nome');
  scene('gancho', B.gancho, B.promessa, () =>
    box('hd', 40, 0, 1000, 100, `<div class="hd" style="color:${CREME};font-size:64px"><span style="color:${YEL}">16</span> BORRIFADAS OU <span style="color:${YEL}">5</span>?</div>`)
    + contador('c16', 16, 60, 120, 560, 380, 330)
    + sub('l16', 'BORRIFADAS', 60, 500, 560, 80, 58)
    + frasco('fa', 'acqua', 830, 600, 440)
    + frasco('fl', 'lemale', 290, 600, 450)
    + contador('c5', 5, 560, 120, 460, 380, 360)
    + sub('l5', 'E JÁ ERA', 560, 500, 460, 80, 58, CORAL)
    + svg('el', 'elevador', 200, 110, 330, 433)
    + bubble('bn', 'OI, FULANO! 👋', 540, 170, 500, 60)
    + pill('pn', '📛 JÁ SABE SEU NOME', 470, 450, 590, 46, YEL, INK),
  A => {
    A.hide('#hd', '#c16', '#l16', '#fa', '#fl', '#c5', '#l5', '#el', '#bn', '#pn');
    A.slam('#hd', 0.02, 1.8); S('impact_grave', 0.02, 0.5);
    A.set('#c16', 0.3, 'opacity:1');
    A.conta('c16', 16, 0.35, T(i16) + 0.35);
    A.raw(`tl.fromTo("#fa",{opacity:0,scale:0.4,y:120,rotation:8},{opacity:1,scale:1,y:0,rotation:0,duration:0.4,ease:"back.out(1.8)"},${A.t(0.5)});`); S('whoosh_suave', 0.45, 0.35);
    A.wiggle('#fa', T(i16), 6, 5);
    A.rise('#l16', T(iBorr), 24, 0.25); S('shine_brilho', T(iBorr), 0.35);
    A.out('#c16,#l16,#fa', T(iE) - 0.08, 0.16);
    A.raw(`tl.fromTo("#fl",{opacity:0,scale:0.4,y:120,rotation:-8},{opacity:1,scale:1,y:0,rotation:0,duration:0.4,ease:"back.out(1.8)"},${A.t(T(iPerf))});`); S('whoosh_suave', T(iPerf) - 0.05, 0.35);
    A.set('#c5', T(iCinco) - 0.02, 'opacity:1');
    A.conta('c5', 5, T(iCinco) - 0.02, T(iCinco) + 0.25, false); S('spray_perfume', T(iCinco), 0.3); empSfx(T(iCinco) + 0.25);
    A.rise('#l5', T(iCinco) + 0.1, 20, 0.15);
    A.out('#hd,#fl,#c5,#l5', T(iElev) - 0.1, 0.1);
    A.pop('#el', T(iElev) - 0.05); S('pop_leve', T(iElev) - 0.05, 0.5);
    A.raw(`tl.to("#el .dl",{x:-110,duration:0.35,ease:"power2.inOut"},${A.t(T(iElev) + 0.25)});tl.to("#el .dr",{x:110,duration:0.35,ease:"power2.inOut"},${A.t(T(iElev) + 0.25)});`);
    S('ding_acerto', T(iElev) + 0.2, 0.5);
    A.pop('#bn', T(iSabe) - 0.05, -3); S('ding_notificacao', T(iSabe), 0.45);
    A.slam('#pn', T(iNome), 1.7); S('badum_tss', T(iNome) + 0.35, 0.4);
    A.out('#el,#bn,#pn', B.promessa - 0.16, 0.14);
  });
}

// ===== 2) PROMESSA: HOJE CEDO (card do carrossel ✓) → AGORA: QUANTAS? → LEVE · MÉDIO · PESADO + QUAL É O SEU? =====
{
  const iCedo = F('cedo'), iOnde = F('onde', iHoje), iAgora = F('Agora'), iQuant = F('quantas'), iFim = F('fim'), iDesc = F('descobrir'), iTipo = F('tipo');
  const cats = [['LEVE', COR.leve], ['MÉDIO', COR.medio], ['PESADO', COR.pesado]];
  scene('promessa', B.promessa, B.leve, () =>
    pill('hc', '☀️ HOJE CEDO', 300, 20, 480, 46, AMB, INK)
    + box('cd', 270, 150, 540, 300, `<div class="card"><div class="t">ONDE</div><div class="t">BORRIFAR</div><div class="s">carrossel · 8h</div></div>`, 'transform:rotate(-3deg)')
    + svg('ck', 'check', 740, 110, 130, 130)
    + sub('ag', 'AGORA:', 40, 40, 1000, 110, 90, CREME)
    + big('qu', 'QUANTAS?', 20, 150, 1040, 300, 170)
    + cats.map(([c, cor], j) => box(`k${j}`, 60 + j * 330, 40, 300, 110, `<div class="pill" style="background:${cor};color:${j === 2 ? CREME : INK};font-size:50px">${c}</div>`)).join('')
    + big('qs', 'QUAL É O SEU?', 20, 230, 1040, 220, 120, YEL),
  A => {
    A.hide('#hc', '#cd', '#ck', '#ag', '#qu', '#k0', '#k1', '#k2', '#qs');
    A.slam('#hc', T(iHoje), 1.6); S('whoosh_rapido', T(iHoje) - 0.1, 0.35);
    A.raw(`tl.fromTo("#cd",{opacity:0,y:140,rotation:-10},{opacity:1,y:0,rotation:-3,duration:0.4,ease:"back.out(1.7)"},${A.t(T(iCedo) + 0.1)});`); S('swipe_tela', T(iCedo) + 0.1, 0.3);
    A.pop('#ck', T(iOnde) + 0.2); S('ding_acerto', T(iOnde) + 0.2, 0.5);
    A.out('#hc,#cd,#ck', T(iAgora) - 0.1, 0.14);
    A.slam('#ag', T(iAgora), 1.5); A.slam('#qu', T(iQuant), 2.4); empSfx(T(iQuant)); S('spray_perfume', T(iQuant) + 0.05, 0.3);
    A.wiggle('#qu', T(iQuant) + 0.4, 4, 3);
    A.out('#ag,#qu', T(iFim) - 0.2, 0.14);
    [0, 1, 2].forEach(j => { A.pop(`#k${j}`, T(iDesc) - 0.2 + j * 0.15); S('pop_leve', T(iDesc) - 0.2 + j * 0.15, 0.45); });
    A.slam('#qs', T(iTipo), 1.8); S('plim_brilho_magico', T(iTipo), 0.35);
    A.wiggle('#qs', T(iTipo) + 0.5, 4, 4);
    A.out('#k0,#k1,#k2,#qs', B.leve - 0.16, 0.14);
  });
}

// ---------- categoria: título gigante → vira cabeçalho; colagem de 4 frascos ----------
const titulo = (cor, nome) => big('tt', nome, 20, 170, 1040, 300, 210, cor)
  + box('hd', 40, 0, 1000, 100, `<div class="hd" style="color:${cor}"><small>PERFUME</small>${nome}</div>`);
const colagem = (ks, bottom = 560, h = 330) => { const cx = [170, 410, 670, 910]; return ks.map((k, j) => frasco(`f${j}`, k, cx[j], bottom, h)).join(''); };
const abreTitulo = (A, x, tHd) => { A.slam('#tt', x, 2.2); S('whoosh_rapido', x - 0.14, 0.45); empSfx(x); A.out('#tt', tHd - 0.12, 0.12); A.rise('#hd', tHd, -24, 0.25); };
const entraColagem = (A, xs) => xs.forEach((x, j) => { A.raw(`tl.fromTo("#f${j}",{opacity:0,scale:0.3,y:90,rotation:${j % 2 ? 10 : -10}},{opacity:1,scale:1,y:0,rotation:0,duration:0.36,ease:"back.out(1.9)"},${A.t(x)});`); S('pop_leve', x, 0.45); });

// ===== 3) LEVE: título → Acqua di Giò, 212, Light Blue, Versace → BANHO TOMADO → TÍMIDO → 16 = PELE 8 + CAMISETA 4 + POR DENTRO 4 =====
{
  const iCheiro = F('cheiro', iLeve), iBanho = F('banho'), iTim = F('tímido'), iEnt = F('então', iTim), i16 = F('dezesseis', iTim);
  const iOito = F('Oito', i16), iPele = F('pele'), iOutros = F('outros'), iDiv = F('divido'), iCam = F('camiseta'), iDentro = F('dentro'), iDela = F('dela');
  scene('leve', B.leve, B.medio, () =>
    titulo(COR.leve, 'LEVE')
    + colagem(['acqua', 'c212', 'lightblue', 'versace'])
    + pill('bt', '🛁 CHEIRO DE BANHO TOMADO', 150, 560, 780, 40, MENTA, INK)
    + bubble('tm', 'TÍMIDO 🫣', 600, 120, 420, 70)
    + contador('cn', 16, 20, 110, 470, 360, 300)
    + sub('cl', 'BORRIFADAS', 20, 470, 470, 70, 50)
    + box('p1', 520, 130, 520, 110, `<div class="chip" style="background:${AMB}">✋ PELE <b>8</b></div>`)
    + box('p2', 520, 265, 520, 110, `<div class="chip" style="background:${MENTA}">👕 CAMISETA <b>4</b></div>`)
    + box('p3', 520, 400, 520, 110, `<div class="chip" style="background:${CREME}">↩️ POR DENTRO <b>4</b></div>`)
    + sub('av', '⚠️ roupa clara pode manchar', 40, 560, 1000, 60, 34, CREME, 600),
  A => {
    A.hide('#tt', '#hd', '#f0', '#f1', '#f2', '#f3', '#bt', '#tm', '#cn', '#cl', '#p1', '#p2', '#p3', '#av');
    abreTitulo(A, T(iLeve), T(iCheiro) - 0.05);
    entraColagem(A, [0, 1, 2, 3].map(j => T(iCheiro) + j * 0.14));
    A.rise('#bt', T(iBanho), 30, 0.28); S('shine_brilho', T(iBanho), 0.35);
    // tímido: frascos se encolhem e tremem
    A.out('#bt', T(iTim) - 0.12, 0.12);
    A.to('#f0,#f1,#f2,#f3', T(iTim), 'scale:0.82', 0.25);
    A.wiggle('#f0,#f1,#f2,#f3', T(iTim) + 0.1, 6, 4);
    A.pop('#tm', T(iTim), -4); S('boing_cartoon', T(iTim), 0.4);
    A.out('#f0,#f1,#f2,#f3,#tm', T(iEnt) - 0.05, 0.16);
    A.set('#cn', T(iEnt) + 0.15, 'opacity:1');
    A.conta('cn', 16, T(iEnt) + 0.15, T(i16) + 0.35);
    A.rise('#cl', T(i16) + 0.3, 20, 0.22); empSfx(T(i16) + 0.35);
    A.raw(`tl.fromTo("#p1",{opacity:0,x:200},{opacity:1,x:0,duration:0.3,ease:"back.out(1.7)"},${A.t(T(iOito))});`); S('whoosh_suave', T(iOito) - 0.05, 0.35); S('spray_perfume', T(iPele), 0.25);
    A.hop('#p1', T(iPele) + 0.1, 24);
    A.raw(`tl.fromTo("#p2",{opacity:0,x:200},{opacity:1,x:0,duration:0.3,ease:"back.out(1.7)"},${A.t(T(iCam) - 0.05)});`); S('pop_leve', T(iCam), 0.5);
    A.raw(`tl.fromTo("#p3",{opacity:0,x:200},{opacity:1,x:0,duration:0.3,ease:"back.out(1.7)"},${A.t(T(iDentro) - 0.1)});`); S('pop_leve', T(iDentro), 0.5);
    A.wiggle('#cn', T(iDiv), 4, 4);
    A.rise('#av', T(iDela) + 0.05, 16, 0.25);
    A.out('#hd,#cn,#cl,#p1,#p2,#p3,#av', B.medio - 0.16, 0.14);
  });
}

// ===== 4) MÉDIO: OUTRA CONTA → título → Sauvage, Bleu, Aventus, Terre → 9, 10 → 11?! → CHEIRINHO DE CARRO =====
{
  const iMedio = F('médio'), iOutra = F('outra'), iSauv = F('Sauvage'), iBleu = F('Bleu'), iDou = F('dou', iBleu), iNove = F('nove'), iDez = F('dez', iNove);
  const iPass = F('Passou'), iVirou = F('virou'), iCheir = F('cheirinho'), iCarro = F('carro');
  scene('medio', B.medio, B.pesado, () =>
    titulo(COR.medio, 'MÉDIO')
    + colagem(['sauvage', 'bleu', 'aventus', 'terre'])
    + bubble('oc', 'É OUTRA CONTA!', 250, 470, 580, 54)
    + contador('cn', 10, 60, 110, 560, 380, 320)
    + sub('cl', 'BORRIFADAS', 60, 480, 560, 70, 50)
    + big('on', '11?!', 640, 150, 400, 300, 220, CORAL)
    + svg('ar', 'arvore', 200, 105, 230, 380, 'transform-origin:50% 0%')
    + pill('cc', '🚗 CHEIRINHO DE CARRO', 330, 490, 700, 46, MENTA, INK),
  A => {
    A.hide('#tt', '#hd', '#f0', '#f1', '#f2', '#f3', '#oc', '#cn', '#cl', '#on', '#ar', '#cc');
    abreTitulo(A, T(iMedio), T(iSauv) - 0.1);
    A.pop('#oc', T(iOutra), -3); S('ding_notificacao', T(iOutra), 0.4);
    A.out('#oc', T(iSauv) - 0.12, 0.12);
    entraColagem(A, [T(iSauv), T(iBleu), T(iBleu) + 0.3, T(iBleu) + 0.5]);
    A.out('#f0,#f1,#f2,#f3', T(iDou) - 0.1, 0.16);
    A.set('#cn', T(iDou), 'opacity:1');
    A.conta('cn', 10, T(iDou), T(iDez));
    A.rise('#cl', T(iDez) + 0.05, 20, 0.22); empSfx(T(iDez));
    // passou disso: 11?! em coral + X + buzina de erro
    A.slam('#on', T(iPass), 2); S('buzzer_erro', T(iPass) + 0.15, 0.45);
    A.wiggle('#on', T(iPass) + 0.3, 6, 6);
    A.out('#cn,#cl,#on', T(iVirou) - 0.1, 0.14);
    // árvore de cheirinho cai e balança
    A.raw(`tl.fromTo("#ar",{opacity:0,y:-300},{opacity:1,y:0,duration:0.4,ease:"bounce.out"},${A.t(T(iVirou))});`); S('boing_cartoon', T(iVirou) + 0.2, 0.45);
    A.raw(`tl.to("#ar",{keyframes:[{rotation:14,duration:0.3},{rotation:-12,duration:0.3},{rotation:9,duration:0.3},{rotation:-6,duration:0.3},{rotation:0,duration:0.3}],ease:"sine.inOut"},${A.t(T(iVirou) + 0.4)});`);
    A.slam('#cc', T(iCheir), 1.7); empSfx(T(iCarro)); S('trombone_triste', T(iCarro) + 0.15, 0.35);
    A.out('#hd,#ar,#cc', B.pesado - 0.16, 0.14);
  });
}

// ===== 5) PESADO: suspense → título → Le Male Elixir, Sauvage Elixir, SWY Absolutely, Spicebomb → DOCE, DE NOITE → 5 + PARA ✋ → 6?! → grupo do condomínio =====
{
  const iPes = F('pesado'), iDoce = F('Doce'), iNoite = F('noite', iDoce), iCinco = F('Cinco', iDoce), iParo = F('paro'), iSexto = F('sexto'), iRecl = F('reclamação'), iGrupo = F('grupo'), iCond = F('condomínio');
  scene('pesado', B.pesado, B.fragrantica, () =>
    titulo(COR.pesado, 'PESADO')
    + colagem(['lemale', 'elixir', 'swy', 'spicebomb'], 520, 320)
    + pill('dn', '🍯 DOCE · DE NOITE', 230, 545, 620, 44, YEL, INK)
    + svg('lu', 'lua', 870, 470, 110, 110)
    + contador('cn', 5, 60, 110, 480, 380, 340)
    + sub('cl', 'BORRIFADAS', 60, 480, 480, 70, 50)
    + box('st', 560, 190, 470, 200, `<div class="stamp">PARA<span style="font-size:84px">✋</span></div>`)
    + big('sx', '6?!', 600, 120, 400, 330, 260, CORAL)
    + box('ch', 120, 20, 840, 600, `<div class="chat"><div class="h">🏢 Condomínio · Bloco B<small>47 pessoas</small></div>
        <div id="m1" class="msg" style="top:130px"><i>Síndico</i>quem é o do perfume no elevador???</div>
        <div id="m2" class="msg" style="top:270px"><i>Dona Cida · 802</i>tô sentindo até no 8º andar 😷</div>
        <div id="m3" class="msg" style="top:410px"><i>Seu Zé · 304</i>😷😷😷</div></div>`),
  A => {
    A.hide('#tt', '#hd', '#f0', '#f1', '#f2', '#f3', '#dn', '#lu', '#cn', '#cl', '#st', '#sx', '#ch', '#m1', '#m2', '#m3');
    S('suspense_dun', T(iPes) - 0.15, 0.5);
    abreTitulo(A, T(iPes), T(iDoce) - 0.1);
    entraColagem(A, [0, 1, 2, 3].map(j => T(iDoce) - 0.05 + j * 0.13));
    A.rise('#dn', T(iDoce) + 0.2, 24, 0.25); A.pop('#lu', T(iNoite), -10); S('plim_brilho_magico', T(iNoite), 0.35);
    A.out('#f0,#f1,#f2,#f3,#dn,#lu', T(iCinco) - 0.1, 0.14);
    A.set('#cn', T(iCinco), 'opacity:1');
    A.conta('cn', 5, T(iCinco), T(iCinco) + 0.6);
    A.rise('#cl', T(iCinco) + 0.6, 20, 0.2);
    A.raw(`tl.fromTo("#st",{opacity:0,scale:2.6,rotation:-24},{opacity:1,scale:1,rotation:-9,duration:0.2,ease:"power4.in"},${A.t(T(iParo) - 0.05)});`);
    S('carimbo', T(iParo) + 0.12, 0.7);
    A.raw(`tl.to("#cn",{keyframes:[{x:-10,duration:0.04},{x:10,duration:0.04},{x:-6,duration:0.04},{x:0,duration:0.04}]},${A.t(T(iParo) + 0.16)});`);
    A.out('#st', T(iSexto) - 0.1, 0.1);
    A.slam('#sx', T(iSexto), 2); S('sirene_policia', T(iSexto), 0.3);
    A.wiggle('#sx', T(iSexto) + 0.25, 6, 7);
    A.out('#hd,#cn,#cl,#sx', T(iRecl) - 0.1, 0.14);
    A.raw(`tl.fromTo("#ch",{opacity:0,y:160,scale:0.9},{opacity:1,y:0,scale:1,duration:0.35,ease:"back.out(1.6)"},${A.t(T(iRecl))});`); S('swipe_tela', T(iRecl), 0.3);
    [['#m1', T(iGrupo) - 0.05], ['#m2', T(iCond) + 0.05], ['#m3', T(iCond) + 0.45]].forEach(([m, x]) => { A.rise(m, x, 30, 0.22); S('ding_notificacao', x, 0.45); });
    A.out('#ch', B.fragrantica - 0.16, 0.14);
  });
}

// ===== 6) FRAGRANTICA: celular → busca digitando "Acqua di Giò" → resultado → mapa das estações → VERÃO = MAIS / INVERNO = MENOS =====
{
  const iEntra = F('entra'), iFrag = F('Fragrantica'), iPesq = F('pesquisa'), iPerf = F('perfume', iPesq), iMostra = F('mostra'), iMapa = F('mapa'), iEst = F('estações');
  const iVer = F('Verão'), iMais = F('mais', iVer), iInv = F('Inverno'), iMenos = F('menos', iInv);
  const busca = 'Acqua di Giò';
  const est = [['❄️', 28, MENTA], ['🌸', 70, ALG], ['☀️', 100, YEL], ['🍂', 48, AMB], ['🌤️', 96, YEL], ['🌙', 38, MENTA]];   // ilustrativo (frescos tendem a verão/dia)
  const PH = { l: 50, t: 0, w: 430, h: 630 };
  scene('fragrantica', B.fragrantica, B.cta, () =>
    box('ph', PH.l, PH.t, PH.w, PH.h, `<div class="phone"><div class="scr">
      <div class="logo">fragrantica</div>
      <div class="busca">🔍 <span>${busca.split('').map((c, j) => `<span id="ch${j}" style="opacity:0">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span><span class="cur"></span></div>
      <div id="rs" class="res"><img src="assets/img/acqua.png"><div>Acqua di Giò<small>Giorgio Armani</small></div></div>
      <div id="mp" class="mapa"><div class="tt">ESTAÇÕES</div>
        ${est.map(([ic, v, c], j) => `<div class="col" style="left:${2 + j * 54}px"><div id="b${j}" class="bar" style="height:${Math.round(v * 1.75)}px;background:${c}"></div><div class="ic">${ic}</div></div>`).join('')}
      </div></div></div>`)
    + sub('sb', 'COMO DESCOBRIR O SEU', 500, 30, 560, 80, 40, CREME, 800)
    + ['1 · ENTRA NA FRAGRANTICA', '2 · PESQUISA O SEU', '3 · OLHA O MAPA'].map((s, j) => box(`s${j}`, 510, 130 + j * 120, 540, 96, `<div class="chip" style="background:${[CREME, AMB, MENTA][j]};font-size:29px;padding:0 20px">${s}</div>`)).join('')
    + box('vm', 510, 150, 540, 150, `<div class="chip" style="background:${YEL};font-size:48px">☀️ VERÃO <b>+</b></div>`)
    + box('im', 510, 340, 540, 150, `<div class="chip" style="background:${MENTA};font-size:48px">❄️ INVERNO <b>−</b></div>`)
    + box('el', 510, 520, 540, 60, `<div class="sub" style="font-size:30px;font-weight:500;-webkit-text-stroke:0;color:${ALG}">(mapa ilustrativo)</div>`),
  A => {
    A.hide('#ph', '#rs', '#mp', '#sb', '#s0', '#s1', '#s2', '#vm', '#im', '#el', ...est.map((_, j) => `#b${j}`));
    A.raw(`tl.fromTo("#ph",{opacity:0,y:200,rotation:-6},{opacity:1,y:0,rotation:0,duration:0.42,ease:"back.out(1.6)"},${A.t(T(iPra))});`); S('whoosh_suave', T(iPra), 0.4);
    A.rise('#sb', T(iPra) + 0.2, 20, 0.25);
    A.raw(`tl.fromTo("#s0",{opacity:0,x:160},{opacity:1,x:0,duration:0.28,ease:"back.out(1.7)"},${A.t(T(iEntra))});`); S('click_ui', T(iFrag), 0.5);
    A.raw(`tl.fromTo("#s1",{opacity:0,x:160},{opacity:1,x:0,duration:0.28,ease:"back.out(1.7)"},${A.t(T(iPesq))});`);
    // digitação
    const t0 = T(iPesq) + 0.05, t1 = T(iPerf) + 0.35;
    busca.split('').forEach((_, j) => A.set(`#ch${j}`, t0 + j * (t1 - t0) / busca.length, 'opacity:1'));
    S('typing_teclado', t0, 0.35);
    A.rise('#rs', t1 + 0.05, 20, 0.25); S('pop_leve', t1 + 0.05, 0.4);
    A.raw(`tl.fromTo("#s2",{opacity:0,x:160},{opacity:1,x:0,duration:0.28,ease:"back.out(1.7)"},${A.t(T(iMostra))});`);
    A.set('#mp', T(iMapa) - 0.1, 'opacity:1');
    est.forEach((_, j) => A.raw(`tl.fromTo("#b${j}",{opacity:1,scaleY:0},{opacity:1,scaleY:1,duration:0.4,ease:"back.out(1.5)"},${A.t(T(iMapa) + j * 0.1)});`));
    S('riser_curto', T(iMapa), 0.3); S('shine_brilho', T(iEst), 0.35);
    A.out('#sb,#s0,#s1,#s2', T(iVer) - 0.12, 0.12);
    A.slam('#vm', T(iVer), 1.7); empSfx(T(iVer)); A.hop('#b2', T(iMais), 18); S('ding_acerto', T(iMais), 0.4);
    A.slam('#im', T(iInv), 1.7); empSfx(T(iInv)); A.to('#b0', T(iMenos), 'scaleY:0.6', 0.3); S('pop_leve', T(iMenos), 0.4);
    A.rise('#el', T(iVer) + 0.3, 10, 0.25);
    A.out('#ph,#vm,#im,#el', B.cta - 0.16, 0.14);
  });
}

// ===== 7) CTA: SEGUE @VALOTAPARFUM (+ resumo 16 · 10 · 5) → MANDA PRO AMIGO QUE EXAGERA → assinatura =====
{
  const iVp = F('@valotaparfum'), iDicas = F('dicas'), iManda = F('manda'), iAmigo = F('amigo'), iExag = F('exagerar'), iBorr = F('borrifadas', iExag);
  const R3 = [['LEVE', 16, COR.leve, INK], ['MÉDIO', 10, COR.medio, INK], ['PESADO', 5, COR.pesado, CREME]];
  scene('cta', B.cta, END, () =>
    R3.map(([c, n, bg, fg], j) => box(`r${j}`, 60 + j * 330, 20, 300, 270, `<div class="res3" style="background:${bg};color:${fg}"><div class="c">${c}</div><div class="n">${n}</div><div class="b">BORRIFADAS</div></div>`)).join('')
    + pill('sg', 'SEGUE @VALOTAPARFUM', 120, 330, 840, 52, YEL, INK)
    + sub('md', '+ DICAS COMO ESSA', 120, 450, 840, 80, 46, CREME, 800)
    + box('am', 90, 90, 900, 230, `<div class="card"><div class="t" style="font-size:72px">📩 MANDA PRO AMIGO</div><div class="s" style="font-size:34px;letter-spacing:.1em">que exagera nas borrifadas</div></div>`, 'transform:rotate(-2deg)')
    + contador('ex', 30, 300, 330, 480, 230, 190, CORAL)
    + box('as', 0, 350, 1080, 230, '<div class="assin" style="transform:scale(.8);transform-origin:50% 0"><div class="n">VALOTA PARFUM</div><div class="l"></div><div class="s">@VALOTAPARFUM</div></div>'),
  A => {
    A.hide('#r0', '#r1', '#r2', '#sg', '#md', '#am', '#ex', '#as');
    [0, 1, 2].forEach(j => { A.pop(`#r${j}`, T(iSegue) - 0.05 + j * 0.12); S('pop_leve', T(iSegue) - 0.05 + j * 0.12, 0.45); });
    A.slam('#sg', T(iVp), 1.7); S('ding_acerto', T(iVp), 0.45);
    A.rise('#md', T(iDicas) - 0.1, 24, 0.25); S('shine_brilho', T(iDicas), 0.3);
    A.out('#r0,#r1,#r2,#sg,#md', T(iManda) - 0.12, 0.14);
    A.raw(`tl.fromTo("#am",{opacity:0,y:120,rotation:-8},{opacity:1,y:0,rotation:-2,duration:0.36,ease:"back.out(1.7)"},${A.t(T(iManda))});`); S('whoosh_rapido', T(iManda) - 0.08, 0.4); S('ding_notificacao', T(iAmigo), 0.5);
    // o amigo que exagera: contador disparando 1→30 em coral
    A.set('#ex', T(iExag) - 0.05, 'opacity:1');
    A.conta('ex', 30, T(iExag) - 0.05, T(iBorr) + 0.45, false);
    S('spray_perfume', T(iExag), 0.3); S('spray_perfume', T(iExag) + 0.35, 0.3); S('spray_perfume', T(iBorr), 0.3); S('sirene_policia', T(iBorr) + 0.3, 0.3);
    A.wiggle('#ex', T(iBorr) + 0.5, 6, 6);
    A.out('#am,#ex', TA, 0.2);
    A.raw(`tl.fromTo("#as",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"power3.out"},${A.t(TA + 0.15)});`); S('shine_brilho', TA + 0.15, 0.5);
  });
}

// ---------- câmera (avatar no card pequeno) + fundo da paleta ----------
const marks = [B.promessa, B.leve, B.medio, B.pesado, B.fragrantica, B.cta];
const camL = []; let s = 1.0, k = 0;
const bounds = [0, ...marks, END];
for (let i = 0; i < bounds.length - 1; i++) {
  const a = bounds[i], d = bounds[i + 1] - a;
  const alvo = a >= B.cta ? 1.0 : (k++ % 2 === 0 ? 1.06 : 1.0);
  camL.push(`tl.fromTo("#cam",{scale:${s.toFixed(3)}},{scale:${alvo.toFixed(3)},duration:${d.toFixed(3)},ease:"sine.inOut",immediateRender:false},${a.toFixed(3)});`);
  s = alvo;
}
const WIN_H = 1920 - CARD.top;
fs.writeFileSync(path.join(HF, 'compositions', 'camera.html'), `<template>
<style>
#root{position:absolute;inset:0;overflow:hidden;background:${NOITE}}
#band{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(ellipse 80% 55% at 50% 30%, ${LUZ} 0%, ${PET} 55%, ${NOITE} 100%)}
#dots{position:absolute;left:-46px;top:-46px;width:1172px;height:2012px;opacity:.07;background-image:radial-gradient(${CREME} 2.5px,transparent 3px);background-size:46px 46px}
#luz{position:absolute;left:-500px;top:-200px;width:900px;height:1000px;background:radial-gradient(ellipse at center,rgba(212,154,78,.12),rgba(212,154,78,0) 65%)}
#win{position:absolute;left:${(1080 - CARD.w) / 2}px;top:${CARD.top}px;width:${CARD.w}px;height:${WIN_H}px;overflow:hidden;border-radius:${CARD.r}px ${CARD.r}px 0 0;box-shadow:0 -12px 50px rgba(0,0,0,.45);transform:translateZ(0);background:${NOITE}}
#cam{position:absolute;left:0;top:0;width:${CARD.w}px;height:${WIN_H}px;transform-origin:50% 30%}
#base{position:absolute;left:0;top:0;width:${CARD.w}px;height:${WIN_H}px;object-fit:cover;object-position:50% ${CAM_P * 100}%}
</style>
<div id="root" data-composition-id="camera" data-width="1080" data-height="1920">
<div id="band"><div id="dots"></div><div id="luz"></div></div>
<div id="win"><div id="cam"><video id="base" class="clip" src="assets/video/avatar.mp4" data-start="0" data-duration="${END}" data-track-index="0" playsinline data-has-audio="true" ${GRADE}></video></div></div>
</div>
<script>
(function(){
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${camL.join('\n  ')}
  tl.fromTo("#luz",{x:0},{x:1100,duration:${(END / 2).toFixed(2)},ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false},0);
  tl.fromTo("#dots",{x:0,y:0},{x:46,y:46,duration:${END},ease:"none",immediateRender:false},0);
  window.__timelines["camera"] = tl;
})();
</script>
</template>`);

// ---------- legendas (estilo v14/v15: caixa alta, creme + amarelo nas palavras-chave, Montserrat 900, contorno #0A1F23) ----------
const CAP_TOP = 1128;
const KEY = /^(DEZESSEIS|CINCO|ELEVADOR|NOME|QUANTAS|LEVE|BANHO|TÍMIDO|PELE|CAMISETA|DENTRO|MÉDIO|SAUVAGE|CHANEL|NOVE|DEZ|CARRO|PESADO|DOCE|NOITE|PARO|SEXTO|CONDOMÍNIO|FRAGRANTICA|ESTAÇÕES|VERÃO|MAIS|INVERNO|MENOS|SEGUE|@VALOTAPARFUM|DICAS|AMIGO|EXAGERAR)$/;
const groups = []; let cur = [];
W.forEach((w, j) => {
  cur.push(j);
  const pont = /[.,:!?]$/.test(w.p); const nx = W[j + 1]; const gap = nx ? nx.ini - w.fim : 9;
  if (cur.length >= 3 || pont || gap > 0.2 || (w.p.length > 11 && cur.length >= 2) || cur.reduce((s, k) => s + W[k].p.length + 1, 0) > 21) { groups.push(cur); cur = []; }
});
if (cur.length) groups.push(cur);
const capEls = [];
groups.forEach((g, gi) => {
  const st = gi === 0 ? 0.02 : W[g[0]].ini; if (st >= TA) return;
  const next = groups[gi + 1]; const nxt = next ? W[next[0]].ini : END;
  const en = Math.min(nxt, W[g[g.length - 1]].fim + 0.35, TA);
  const html = g.map(i => { const raw = W[i].p.replace(/[.,:;!]+$/, '').toUpperCase(); const base = raw.replace(/\?$/, ''); return `<span style="color:${KEY.test(base) ? YEL : CREME}">${raw}</span>`; }).join(' ');
  capEls.push(`<div id="cap${gi}" class="clip cap" data-start="${st.toFixed(3)}" data-duration="${Math.max(0.2, en - st).toFixed(3)}" data-track-index="1">${html}</div>`);
});
fs.writeFileSync(path.join(HF, 'compositions', 'captions.html'), `<template>
<style>
${FONT}
#root{position:absolute;inset:0}
.cap{position:absolute;left:40px;top:${CAP_TOP}px;width:1000px;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:58px;line-height:1.08;white-space:nowrap;-webkit-text-stroke:13px ${INK};paint-order:stroke fill;text-shadow:0 7px 0 rgba(10,31,35,.6)}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-no-timeline>
${capEls.join('\n')}
</div>
</template>`);

// ---------- áudio: SÓ efeitos sonoros (sem música) ----------
const FFM = path.join(__dirname, '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const DUR = {};
const durOf = f => { if (DUR[f]) return DUR[f]; let out = ''; try { execFileSync(FFM, ['-i', path.join(HF, 'assets/audio', f + '.mp3')], { stdio: 'pipe' }); } catch (e) { out = String(e.stderr); }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/); return (DUR[f] = m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 1); };
const sfxEls = SFX.filter(([, at]) => at < END - 0.05).map(([file, at, vol], i) => {
  const a = Math.max(0, at);
  return `<audio id="sfx${i}" class="clip" src="assets/audio/${file}.mp3" data-start="${a.toFixed(3)}" data-duration="${Math.min(durOf(file), END - a).toFixed(3)}" data-track-index="${12 + i}" data-volume="${vol}"></audio>`;
});
const trilha = '';   // sem música de fundo (pedido da Osiany): só efeitos sonoros

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
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${NOITE}}
#root{position:relative;width:100%;height:100%}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${END}" data-width="1080" data-height="1920">
<div id="camera" data-composition-id="camera" data-composition-src="compositions/camera.html" data-start="0" data-duration="${END}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>
${hosts.join('\n')}
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${END}" data-track-index="9" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50" data-no-timeline></div>
${trilha}
${sfxEls.join('\n')}
</div>
<script>
window.__timelines = window.__timelines || {};
window.__timelines["main"] = gsap.timeline({ paused: true });
</script>
</body>
</html>`);
console.log('ok · END', END, '· cenas', scenes.map(x => `${x.id}(${x.start.toFixed(2)}–${x.end.toFixed(2)})`).join(', '), '· legendas', capEls.length, '· sfx', sfxEls.length);

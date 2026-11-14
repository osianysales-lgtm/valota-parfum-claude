// v17 · Tutorial de make masculina (perfume = make · Hawas Black ≈ Nishane Hacivat · estudo 2009) · AVATAR osianyreal (look Van Gogh) + voz ElevenLabs
// Layout = v13/v14 (card do avatar 500 px em top 1230, legendas em 1128, motion na área de cima). Paleta Petróleo & Âmbar.
// Tipografia: Gotham Black (títulos/números) + Montserrat (texto, legenda 900). SEM música, só SFX.
// Rodar: node gen.js  →  hf/index.html + hf/compositions/*.html
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const HF = path.join(__dirname, 'hf');
const VOZ0 = JSON.parse(fs.readFileSync(path.join(__dirname, 'narracao_palavras.json'), 'utf8')).palavras;
const VOZ = [];   // "dois mil e nove" (4 palavras na voz) = "2009" (1 no roteiro)
for (let i = 0; i < VOZ0.length; i++) {
  if (/^dois$/i.test(VOZ0[i].word) && VOZ0[i + 1] && /^mil$/i.test(VOZ0[i + 1].word)) { VOZ.push({ word: '2009,', start: VOZ0[i].start, end: VOZ0[i + 3].end }); i += 3; }
  else VOZ.push(VOZ0[i]);
}
const ROT = fs.readFileSync(path.join(__dirname, 'roteiro.txt'), 'utf8').trim().split(/\s+/);
if (ROT.length !== VOZ.length) throw new Error(`roteiro ${ROT.length} x voz ${VOZ.length}`);
const W = VOZ.map((w, i) => ({ p: ROT[i], ini: w.start, fim: w.end }));   // grafia do roteiro, tempo da voz
const FALA = W[W.length - 1].fim;
const AVJ = path.join(__dirname, 'gravacao/avatar_heygen.json');
const AV_DUR = fs.existsSync(AVJ) ? JSON.parse(fs.readFileSync(AVJ, 'utf8')).duracao : 99;   // sem avatar ainda: só prévia
const END = +Math.min(FALA + 2.8, AV_DUR - 0.08).toFixed(2);   // o avatar tem ~3 s ocioso (boca fechada) depois da fala: nada congelado
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

// v17 · cenas (inseridas no gen.js entre o cabeçalho do v16 e a câmera)
// âncoras
const iHoje = F('Hoje'), iE1 = F('E'), iP1 = F('Passo', F('ciência')), iMas = F('Mas'), iAgora = F('Agora'), iDepois = F('Depois'), iOu = F('Ou'), iSegue = F('Segue');
const B = { gancho: 0, promessa: T(iE1) - 0.1, passos: T(iP1) - 0.1, arabe: T(iMas) - 0.1, estudo: T(iAgora) - 0.1, resultado: T(iDepois) - 0.1, solucao: T(iOu) - 0.1, cta: T(iSegue) - 0.1 };
const TA = FALA + 0.05;

// SVGs extras do v17
Object.assign(SV, {
  paleta: `<svg viewBox="0 0 600 380"><rect x="8" y="8" width="584" height="364" rx="40" fill="${INK}" stroke="${CREME}" stroke-width="10"/>${[AMB, YEL, PIM, MENTA, CREME, CEDRO].map((c, j) => `<circle class="pan" cx="${110 + (j % 3) * 190}" cy="${120 + Math.floor(j / 3) * 150}" r="62" fill="${c}" stroke="${INK}" stroke-width="7"/>`).join('')}</svg>`,
  rim: `<svg viewBox="0 0 160 130"><path d="M95 10 C150 6 162 70 140 100 C118 130 60 128 34 104 C6 78 14 30 50 22 C70 18 76 46 92 50 C104 53 70 12 95 10Z" fill="#C46A5A" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M70 60 Q85 70 78 88" stroke="${CREME}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/></svg>`,
  homens: `<svg viewBox="0 0 440 300">${[0, 1, 2].map(j => { const x = 80 + j * 140; return `<circle cx="${x}" cy="80" r="44" fill="${CREME}" stroke="${INK}" stroke-width="7"/><path d="M${x - 62} 280 C${x - 62} 170 ${x + 62} 170 ${x + 62} 280Z" fill="${CREME}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`; }).join('')}</svg>`,
  polaroid: `<svg viewBox="0 0 400 420"><rect x="8" y="8" width="384" height="404" rx="18" fill="${CREME}" stroke="${INK}" stroke-width="9"/><rect x="40" y="40" width="320" height="270" rx="8" fill="${LUZ}"/><circle cx="200" cy="140" r="46" fill="${CREME}" stroke="${INK}" stroke-width="6"/><path d="M110 310 C110 210 290 210 290 310Z" fill="${CREME}" stroke="${INK}" stroke-width="6"/><text x="200" y="378" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="44" fill="${INK}">FOTO 📷</text></svg>`,
  player: `<svg viewBox="0 0 400 420"><rect x="8" y="8" width="384" height="404" rx="18" fill="${INK}" stroke="${CREME}" stroke-width="9"/><rect x="40" y="40" width="320" height="270" rx="8" fill="${LUZ}"/><circle cx="200" cy="140" r="46" fill="${CREME}" stroke="${INK}" stroke-width="6"/><path d="M110 310 C110 210 290 210 290 310Z" fill="${CREME}" stroke="${INK}" stroke-width="6"/><circle cx="200" cy="175" r="52" fill="rgba(10,31,35,.55)"/><path d="M184 148 L228 175 L184 202Z" fill="${YEL}"/><rect x="40" y="326" width="320" height="10" rx="5" fill="${LUZ}"/><rect x="40" y="326" width="190" height="10" rx="5" fill="${AMB}"/><text x="200" y="390" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="44" fill="${CREME}">VÍDEO ▶</text></svg>`,
  espelho: `<svg viewBox="0 0 360 470"><ellipse cx="180" cy="200" rx="160" ry="190" fill="${AMB}" stroke="${INK}" stroke-width="9"/><ellipse cx="180" cy="200" rx="128" ry="158" fill="#BFD7D3" stroke="${INK}" stroke-width="6"/><path d="M110 120 L150 80 M100 170 L170 100" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".7"/><rect x="160" y="388" width="40" height="70" rx="8" fill="${AMB}" stroke="${INK}" stroke-width="7"/></svg>`,
  coracao: `<svg viewBox="0 0 100 92"><path d="M50 88 C10 60 2 40 4 26 C6 10 20 2 32 2 C42 2 48 8 50 16 C52 8 58 2 68 2 C80 2 94 10 96 26 C98 40 90 60 50 88Z" fill="${CORAL}" stroke="${INK}" stroke-width="6"/></svg>`,
});

// ===== 1) GANCHO: OI, MENINOS! → MAKE MASCULINA ✨ =====
{
  const iTut = F('tutorial'), iMake = F('make'), iMasc = F('masculina');
  scene('gancho', B.gancho, B.promessa, () =>
    bubble('oi', 'OI, MENINOS! 👋', 250, 10, 580, 64)
    + big('mk', 'MAKE', 20, 170, 1040, 240, 230, YEL)
    + sub('ms', 'MASCULINA', 20, 410, 1040, 110, 92, CREME)
    + svg('s1', 'brilho', 110, 180, 110, 110) + svg('s2', 'brilho', 860, 150, 90, 90) + svg('s3', 'brilho', 900, 420, 70, 70) + svg('s4', 'brilho', 150, 440, 70, 70)
    + pill('tt', '💄 TUTORIAL', 360, 540, 360, 40, CREME, INK),
  A => {
    A.hide('#oi', '#mk', '#ms', '#s1', '#s2', '#s3', '#s4', '#tt');
    A.pop('#oi', 0.02, -3); S('ding_notificacao', 0.02, 0.45);
    A.pop('#tt', T(iTut), 0); S('pop_leve', T(iTut), 0.4);
    A.slam('#mk', T(iMake), 2.3); empSfx(T(iMake));
    A.rise('#ms', T(iMasc), 30, 0.28);
    ['#s1', '#s2', '#s3', '#s4'].forEach((s, j) => A.pop(s, T(iMasc) + 0.1 + j * 0.08, 0));
    S('plim_brilho_magico', T(iMasc) + 0.1, 0.45);
    A.wiggle('#mk', T(iMasc) + 0.5, 4, 3);
    A.out('#oi,#mk,#ms,#s1,#s2,#s3,#s4,#tt', B.promessa - 0.16, 0.14);
  });
}

// ===== 2) PROMESSA: ÚLTIMO PASSO = ??? → TEM CIÊNCIA 🧪 =====
{
  const iUlt = F('último'), iCien = F('ciência');
  scene('promessa', B.promessa, B.passos, () =>
    pill('up', 'O ÚLTIMO PASSO', 250, 30, 580, 50, AMB, INK)
    + big('q', '???', 20, 170, 1040, 300, 260, YEL)
    + box('ci', 190, 200, 700, 220, `<div class="stamp">🧪 CIÊNCIA</div>`, 'transform:rotate(-4deg)'),
  A => {
    A.hide('#up', '#q', '#ci');
    A.slam('#up', T(iUlt) - 0.05, 1.6); S('suspense_dun', T(iUlt), 0.4);
    A.pop('#q', T(iUlt) + 0.2); A.wiggle('#q', T(iUlt) + 0.6, 4, 5);
    A.out('#q', T(iCien) - 0.1, 0.1);
    A.slam('#ci', T(iCien), 2.0, -4); S('borbulha_lab', T(iCien), 0.4); S('carimbo', T(iCien) + 0.05, 0.45);
    A.out('#up,#ci', B.passos - 0.16, 0.14);
  });
}

// ===== 3) PASSOS: 1 BASE = banho · 2 PRIMER = hidratante · 3 ILUMINADOR = perfume → 3 borrifadas → MODO BLOGUEIRA =====
{
  const iP2 = F('Passo', iP1 + 1), iP3 = F('Passo', iP2 + 1), iBanho = F('banho'), iHid = F('hidratante'), iPerf = F('perfume', iP3), iTres = F('Três', iPerf), iBorr = F('borrifadas'), iBri = F('brilhando'), iBlog = F('blogueira');
  const linhas = [['1 · BASE', '🚿 BANHO TOMADO', MENTA], ['2 · PRIMER', '🧴 HIDRATANTE', CREME], ['3 · ILUMINADOR', '✨ PERFUME', YEL]];
  scene('passos', B.passos, B.arabe, () =>
    linhas.map(([l, v, cor], j) => box(`c${j}`, 40, 30 + j * 175, 1000, 140, `<div class="chip" style="background:${INK};color:${CREME};font-size:42px;border-color:${cor}">${l}</div>`)
      + box(`v${j}`, 585, 48 + j * 175, 430, 104, `<div class="pill" style="background:${cor};color:${INK};font-size:34px">${v}</div>`)).join('')
    + contador('cb', 3, 40, 60, 460, 380, 330)
    + sub('cbl', 'BORRIFADAS', 40, 450, 460, 80, 54)
    + bubble('bl', 'MODO BLOGUEIRA ✨', 420, 150, 650, 56)
    + svg('b1', 'brilho', 560, 40, 100, 100) + svg('b2', 'brilho', 960, 60, 80, 80) + svg('b3', 'brilho', 980, 400, 90, 90) + svg('b4', 'brilho', 600, 420, 70, 70),
  A => {
    A.hide('#c0', '#c1', '#c2', '#v0', '#v1', '#v2', '#cb', '#cbl', '#bl', '#b1', '#b2', '#b3', '#b4');
    [[iP1, iBanho], [iP2, iHid], [iP3, iPerf]].forEach(([p, v], j) => {
      A.raw(`tl.fromTo("#c${j}",{opacity:0,x:-160},{opacity:1,x:0,duration:0.3,ease:"back.out(1.7)"},${A.t(T(p))});`); S('whoosh_rapido', T(p) - 0.06, 0.35);
      A.pop(`#v${j}`, T(v) - 0.05, j === 1 ? 2 : -2); S(j === 2 ? 'spray_perfume' : 'pop_leve', T(v) - 0.05, 0.45);
    });
    S('shine_brilho', T(iPerf) + 0.1, 0.35);
    A.out('#c0,#c1,#c2,#v0,#v1,#v2', T(iTres) - 0.12, 0.14);
    A.set('#cb', T(iTres) - 0.02, 'opacity:1');
    A.conta('cb', 3, T(iTres) - 0.02, T(iBorr) + 0.15);
    A.rise('#cbl', T(iBorr), 24, 0.25);
    ['#b1', '#b2', '#b3', '#b4'].forEach((s, j) => A.pop(s, T(iBri) + j * 0.09, 0));
    S('plim_brilho_magico', T(iBri), 0.45);
    A.pop('#bl', T(iBlog) - 0.1, -3); S('badum_tss', T(iBlog) + 0.35, 0.35);
    ['#b1', '#b2', '#b3', '#b4'].forEach(b => A.wiggle(b, T(iBlog) + 0.3, 4, 10));
    A.out('#cb_3,#cb,#cbl,#bl,#b1,#b2,#b3,#b4', B.arabe - 0.16, 0.14);
  });
}

// ===== 4) ÁRABE: paleta → GRIFE ❌ → ÁRABE! (colagem) → Hawas Black (todo mundo usando) ≈ Nishane Hacivat (1 rim) · Hawas (1 dedinho) · rim no lugar ✅ =====
{
  const iPal = F('paleta'), iGrife = F('grife'), iArabe = F('árabe'), iTodo = F('Todo'), iHB = F('Hawas'), iInt = F('internet'), iNish = F('Nishane'), iNicho = F('nicho'), iRim = F('rim');
  const iHB2 = F('Hawas', iRim), iDed = F('dedinho'), iRim2 = F('rim', iDed), iLugar = F('lugar');
  const cx = [170, 410, 670, 910];
  scene('arabe', B.arabe, B.estudo, () =>
    svg('pl', 'paleta', 240, 60, 600, 380)
    + box('gr', 300, 160, 480, 180, `<div class="stamp" style="border-color:${CORAL};color:${CORAL}">GRIFE ✕</div>`, 'transform:rotate(-8deg)')
    + big('ar', 'ÁRABE!', 20, 0, 1040, 190, 160, YEL)
    + ['fahad', 'khamrah', 'maahir', 'elite'].map((k, j) => frasco(`f${j}`, k, cx[j], 600, 360)).join('')
    + pill('tm', '🔥 TODO MUNDO USANDO', 190, 0, 700, 46, AMB, INK)
    + frasco('hb', 'hawasblack', 540, 530, 450)
    + frasco('hc', 'hacivat', 800, 530, 360)
    + big('aq', '≈', 450, 230, 160, 160, 170, CREME)
    + sub('ij', 'A INTERNET JURA 🤞', 190, 10, 700, 70, 46, CREME, 800)
    + box('tr', 600, 548, 410, 92, `<div class="pill" style="background:${PIM};color:${CREME};font-size:38px">NICHO: 1 RIM</div>`)
    + box('td', 70, 548, 450, 92, `<div class="pill" style="background:${MENTA};color:${INK};font-size:38px">🤏 1 DEDINHO</div>`)
    + pill('rl', '✅ E O RIM NO LUGAR', 220, 0, 640, 46, YEL, INK),
  A => {
    A.hide('#pl', '#gr', '#ar', '#f0', '#f1', '#f2', '#f3', '#tm', '#hb', '#hc', '#aq', '#ij', '#tr', '#td', '#rl');
    A.raw(`tl.fromTo("#pl",{opacity:0,scale:0.3,rotation:-12},{opacity:1,scale:1,rotation:0,duration:0.4,ease:"back.out(1.8)"},${A.t(T(iPal) - 0.1)});`); S('ziper_bolsa', T(iPal) - 0.15, 0.4);
    A.slam('#gr', T(iGrife), 2.2, -8); S('carimbo', T(iGrife), 0.5); S('buzzer_erro', T(iGrife) + 0.1, 0.25);
    A.out('#pl,#gr', T(iArabe) - 0.1, 0.12);
    A.slam('#ar', T(iArabe), 2.2); empSfx(T(iArabe));
    cx.forEach((_, j) => { A.raw(`tl.fromTo("#f${j}",{opacity:0,scale:0.3,y:90,rotation:${j % 2 ? 10 : -10}},{opacity:1,scale:1,y:0,rotation:0,duration:0.32,ease:"back.out(1.9)"},${A.t(T(iArabe) + j * 0.09)});`); S('pop_leve', T(iArabe) + j * 0.09, 0.4); });
    A.out('#ar', T(iTodo) - 0.12, 0.12);
    A.out('#f0,#f1,#f2,#f3', T(iHB) - 0.2, 0.14);
    A.slam('#tm', T(iTodo), 1.6); S('whoosh_rapido', T(iTodo) - 0.08, 0.4);
    A.raw(`tl.fromTo("#hb",{opacity:0,scale:0.4,y:140},{opacity:1,scale:1,y:0,duration:0.42,ease:"back.out(1.7)"},${A.t(T(iHB) - 0.1)});`); S('shine_brilho', T(iHB), 0.45);
    A.wiggle('#hb', T(iHB) + 0.6, 4, 4);
    // internet jura: Hawas vai pra esquerda, Hacivat entra na direita
    A.out('#tm', T(iInt) - 0.1, 0.12);
    A.rise('#ij', T(iInt), -20, 0.25);
    A.to('#hb', T(iInt), 'x:-250,scale:0.86', 0.4);
    A.raw(`tl.fromTo("#hc",{opacity:0,scale:0.3,x:120},{opacity:1,scale:1,x:0,duration:0.42,ease:"back.out(1.7)"},${A.t(T(iNish) - 0.05)});`); S('whoosh_suave', T(iNish) - 0.1, 0.4); S('vidro_tilintar', T(iNish) + 0.2, 0.35);
    A.pop('#aq', T(iNish) + 0.4); S('pop_leve', T(iNish) + 0.4, 0.4);
    A.rise('#tr', T(iNicho), 30, 0.28);
    A.wiggle('#tr', T(iRim), 5, 4); S('caixa_registradora', T(iRim), 0.45);
    A.hop('#hc', T(iRim) + 0.1, 30);
    A.rise('#td', T(iDed) - 0.15, 30, 0.28); S('boing_cartoon', T(iDed), 0.35);
    A.hop('#hb', T(iDed), 30);
    A.out('#ij', T(iRim2) - 0.25, 0.12);
    A.slam('#rl', T(iRim2) - 0.1, 1.6); S('ding_acerto', T(iLugar), 0.5); S('badum_tss', T(iLugar) + 0.45, 0.35);
    A.out('#hb,#hc,#aq,#tr,#td,#rl', B.estudo - 0.16, 0.14);
  });
}

// ===== 5) ESTUDO: SEGREDO → 2009 · ESTUDO BRITÂNICO → GRUPO A (com perfume) x GRUPO B (sem perfume) =====
{
  const iBlog = F('blogueira', iAgora), iAno = F('2009'), iBrit = F('britânicos'), iDiv = F('dividiram'), iGrupos = F('grupos'), iUm = F('Um', iGrupos), iSpray = F('spray', iUm), iOutro = F('outro'), iIgual = F('igualzinho'), iSem = F('sem', iIgual);
  scene('estudo', B.estudo, B.resultado, () =>
    box('sg', 170, 90, 740, 300, `<div class="card"><div class="t" style="font-size:86px">🤫 SEGREDO</div><div class="s" style="font-size:34px;letter-spacing:.08em">que nenhuma blogueira conta</div></div>`, 'transform:rotate(-2deg)')
    + big('yr', '2009', 20, 30, 1040, 260, 250, YEL)
    + pill('br', '🇬🇧 ESTUDO BRITÂNICO', 200, 330, 680, 50, CREME, INK)
    + pill('la', 'GRUPO A', 140, 10, 320, 44, AMB, INK) + pill('lb', 'GRUPO B', 620, 10, 320, 44, ALG, INK)
    + svg('ga', 'homens', 60, 110, 440, 300) + svg('gb', 'homens', 580, 110, 440, 300)
    + pill('pa', '✨ COM PERFUME', 70, 440, 420, 40, YEL, INK)
    + pill('pb', '💨 SEM PERFUME', 590, 440, 420, 40, CREME, INK)
    + sub('ig', '(spray igualzinho)', 580, 540, 440, 60, 32, ALG, 600)
    + svg('sa', 'brilho', 400, 90, 90, 90) + svg('sb', 'brilho', 40, 260, 70, 70),
  A => {
    A.hide('#sg', '#yr', '#br', '#la', '#lb', '#ga', '#gb', '#pa', '#pb', '#ig', '#sa', '#sb');
    A.raw(`tl.fromTo("#sg",{opacity:0,y:140,rotation:-8},{opacity:1,y:0,rotation:-2,duration:0.4,ease:"back.out(1.7)"},${A.t(T(iAgora))});`); S('suspense_dun', T(iAgora), 0.45);
    A.wiggle('#sg', T(iBlog), 4, 3);
    A.out('#sg', T(iAno) - 0.12, 0.12);
    A.slam('#yr', T(iAno), 2.2); empSfx(T(iAno));
    A.slam('#br', T(iBrit) - 0.1, 1.6); S('lupa_whoosh', T(iBrit) - 0.1, 0.4);
    A.out('#yr,#br', T(iDiv) - 0.05, 0.14);
    A.pop('#ga', T(iDiv) + 0.15); A.pop('#gb', T(iDiv) + 0.3); S('pop_leve', T(iDiv) + 0.15, 0.4); S('pop_leve', T(iDiv) + 0.3, 0.4);
    A.rise('#la', T(iGrupos), -20, 0.25); A.rise('#lb', T(iGrupos) + 0.1, -20, 0.25); S('click_ui', T(iGrupos), 0.4);
    A.pop('#pa', T(iSpray) - 0.05); S('spray_perfume', T(iSpray), 0.45);
    A.pop('#sa', T(iSpray) + 0.2); A.pop('#sb', T(iSpray) + 0.3); S('shine_brilho', T(iSpray) + 0.25, 0.35);
    A.hop('#ga', T(iSpray) + 0.3, 24);
    A.pop('#pb', T(iOutro)); S('pop_leve', T(iOutro), 0.4);
    A.rise('#ig', T(iIgual), 16, 0.25);
    A.wiggle('#pb', T(iSem), 4, 4); S('spray_perfume', T(iSem), 0.15);
    A.out('#la,#lb,#ga,#gb,#pa,#pb,#ig,#sa,#sb', B.resultado - 0.16, 0.14);
  });
}

// ===== 6) RESULTADO: mulheres avaliaram FOTO x VÍDEO → foto: EMPATE → vídeo: ❤️ MAIS ATRAENTES → POR QUÊ? → CONFIANÇA ↑ → jeito de falar / de se mexer =====
{
  const iMulh = F('mulheres'), iFotos = F('fotos', iDepois), iVideos = F('vídeos'), iFoto = F('foto?'), iEmp = F('Empate.'), iVid = F('vídeo', iEmp), iAtr = F('atraentes');
  const iPor = F('Por'), iConf = F('confiantes'), iJeito = F('jeito'), iFalar = F('falar'), iMexer = F('mexer');
  scene('resultado', B.resultado, B.solucao, () =>
    pill('av', '👩 MULHERES AVALIARAM', 210, 0, 660, 44, CREME, INK)
    + svg('ft', 'polaroid', 90, 110, 380, 400) + svg('vd', 'player', 610, 110, 380, 400)
    + box('em', 80, 230, 400, 130, `<div class="stamp" style="font-size:66px">= EMPATE</div>`, 'transform:rotate(-10deg)')
    + pill('at', '❤️ MAIS ATRAENTES', 510, 530, 540, 40, CORAL, CREME)
    + svg('h1', 'coracao', 600, 90, 90, 84) + svg('h2', 'coracao', 930, 140, 100, 92) + svg('h3', 'coracao', 950, 400, 80, 74)
    + big('pq', 'POR QUÊ?', 20, 150, 1040, 260, 170, YEL)
    + box('mt', 90, 40, 900, 200, `<div class="card" style="align-items:stretch;padding:0 40px"><div class="t" style="font-size:58px;text-align:center">CONFIANÇA</div><div style="margin-top:18px;height:52px;border-radius:26px;border:6px solid ${INK};background:${ALG};overflow:hidden"><div id="mtb" style="width:100%;height:100%;background:${AMB};transform-origin:0 50%;transform:scaleX(.15)"></div></div></div>`)
    + pill('j1', '🗣️ NO JEITO DE FALAR', 140, 290, 800, 46, MENTA, INK)
    + pill('j2', '🕺 NO JEITO DE SE MEXER', 140, 430, 800, 46, YEL, INK),
  A => {
    A.hide('#av', '#ft', '#vd', '#em', '#at', '#h1', '#h2', '#h3', '#pq', '#mt', '#j1', '#j2');
    A.slam('#av', T(iMulh), 1.6); S('whoosh_rapido', T(iMulh) - 0.08, 0.35);
    A.pop('#ft', T(iFotos), -4); S('flash_camera', T(iFotos), 0.45);
    A.pop('#vd', T(iVideos), 4); S('click_ui', T(iVideos), 0.45);
    A.to('#ft', T(iFoto), 'scale:1.08', 0.2); A.wiggle('#ft', T(iFoto) + 0.1, 3, 3);
    A.slam('#em', T(iEmp), 2.2, -10); S('carimbo', T(iEmp), 0.5); S('trombone_triste', T(iEmp) + 0.2, 0.25);
    A.to('#ft', T(iVid) - 0.1, 'scale:0.92,opacity:0.55', 0.25); A.to('#em', T(iVid) - 0.1, 'opacity:0.55', 0.25);
    A.to('#vd', T(iVid), 'scale:1.1', 0.25); S('whoosh_suave', T(iVid), 0.35);
    A.pop('#at', T(iVid) + 0.35); S('ding_acerto', T(iVid) + 0.35, 0.5);
    ['#h1', '#h2', '#h3'].forEach((s, j) => A.pop(s, T(iAtr) + j * 0.12, j % 2 ? 10 : -10)); S('shine_brilho', T(iAtr) + 0.2, 0.35);
    A.out('#av,#ft,#vd,#em,#at,#h1,#h2,#h3', T(iPor) - 0.12, 0.14);
    A.slam('#pq', T(iPor), 2.0); S('suspense_dun', T(iPor), 0.4);
    A.out('#pq', T(iConf) - 0.35, 0.12);
    A.rise('#mt', T(iConf) - 0.25, 30, 0.28);
    A.raw(`tl.fromTo("#mtb",{scaleX:0.15},{scaleX:1,duration:0.9,ease:"power2.out"},${A.t(T(iConf))});`); S('riser_curto', T(iConf) - 0.1, 0.4); S('ding_acerto', T(iConf) + 0.9, 0.4);
    A.pop('#j1', T(iJeito) - 0.1); S('pop_leve', T(iJeito) - 0.1, 0.4); A.wiggle('#j1', T(iFalar), 3, 3);
    A.pop('#j2', T(iFalar) + 0.1); S('boing_cartoon', T(iFalar) + 0.1, 0.35); A.hop('#j2', T(iMexer) + 0.1, 20);
    A.out('#mt,#j1,#j2', B.solucao - 0.16, 0.14);
  });
}

// ===== 7) SOLUÇÃO: OU SEJA → espelho ✕ (não aparece) → "QUE CHEIRO BOM! 😍" ✓ (aparece no elogio) =====
{
  const iEsp = F('espelho'), iNao = F('não', iOu), iElog = F('elogio');
  scene('solucao', B.solucao, B.cta, () =>
    sub('os', 'OU SEJA:', 40, 0, 1000, 80, 56, CREME)
    + svg('es', 'espelho', 90, 100, 330, 430)
    + svg('ex', 'xmark', 165, 190, 180, 180)
    + pill('ne', 'NO ESPELHO ✕', 50, 540, 420, 40, CREME, INK)
    + bubble('el', 'QUE CHEIRO BOM! 😍', 470, 170, 590, 54)
    + pill('ny', '✅ NO ELOGIO', 560, 400, 440, 46, YEL, INK),
  A => {
    A.hide('#os', '#es', '#ex', '#ne', '#el', '#ny');
    A.rise('#os', T(iOu), -20, 0.25);
    A.pop('#es', T(iNao) - 0.1); S('vidro_tilintar', T(iNao), 0.4);
    A.slam('#ex', T(iEsp) - 0.05, 2.0); S('buzzer_erro', T(iEsp), 0.3);
    A.rise('#ne', T(iEsp) + 0.1, 20, 0.25);
    A.pop('#el', T(iEsp) + 0.45, -3); S('ding_notificacao', T(iEsp) + 0.45, 0.5);
    A.slam('#ny', T(iElog) + 0.05, 1.7); S('ding_acerto', T(iElog) + 0.1, 0.45);
    A.out('#os,#es,#ex,#ne,#el,#ny', B.cta - 0.16, 0.14);
  });
}

// ===== 8) CTA: SEGUE A VALOTA PARFUM → PRA NUNCA FICAR SEM MAKE ✨ → assinatura =====
{
  const iVal = F('Valota'), iNunca = F('nunca'), iMake2 = F('make', iNunca);
  scene('cta', B.cta, END, () =>
    pill('sg', 'SEGUE @VALOTAPARFUM', 120, 140, 840, 52, YEL, INK)
    + sub('md', 'PRA NUNCA FICAR SEM MAKE', 40, 280, 1000, 90, 54, CREME, 900)
    + svg('m1', 'brilho', 70, 120, 80, 80) + svg('m2', 'brilho', 960, 380, 70, 70)
    + box('as', 0, 220, 1080, 230, '<div class="assin" style="transform:scale(.8);transform-origin:50% 0"><div class="n">VALOTA PARFUM</div><div class="l"></div><div class="s">@VALOTAPARFUM</div></div>'),
  A => {
    A.hide('#sg', '#md', '#m1', '#m2', '#as');
    A.slam('#sg', T(iVal) - 0.1, 1.7); S('ding_acerto', T(iVal), 0.45);
    A.rise('#md', T(iNunca), 24, 0.25);
    A.pop('#m1', T(iMake2)); A.pop('#m2', T(iMake2) + 0.1); S('plim_brilho_magico', T(iMake2), 0.4);
    A.out('#sg,#md,#m1,#m2', TA, 0.2);
    A.raw(`tl.fromTo("#as",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"power3.out"},${A.t(TA + 0.15)});`); S('shine_brilho', TA + 0.15, 0.5);
  });
}

// ---------- câmera (avatar no card pequeno) + fundo da paleta ----------
const marks = [B.promessa, B.passos, B.arabe, B.estudo, B.resultado, B.solucao, B.cta];
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
#luz{position:absolute;left:-500px;top:0px;width:900px;height:1000px;background:radial-gradient(ellipse at center,rgba(212,154,78,.12),rgba(212,154,78,0) 65%)}
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
const KEY = /^(MAKE|MASCULINA|CIÊNCIA|BASE|BANHO|PRIMER|HIDRATANTE|ILUMINADOR|PERFUME|BLOGUEIRA|PALETA|GRIFE|ÁRABE|HAWAS|BLACK|NISHANE|HACIVAT|NICHO|RIM|DEDINHO|LUGAR|2009|BRITÂNICOS|GRUPOS|FOTO|EMPATE|VÍDEO|ATRAENTES|CONFIANTES|CONFIANÇA|FALAR|MEXER|ESPELHO|ELOGIO|SEGUE|VALOTA|PARFUM)$/;
const groups = []; let cur = [];
W.forEach((w, j) => {
  cur.push(j);
  if (/^(Valota|Hawas|Nishane)$/.test(w.p) && W[j + 1]) return;
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

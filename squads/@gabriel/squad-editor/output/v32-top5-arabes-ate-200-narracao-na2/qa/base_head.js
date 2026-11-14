// v18 · "Perfumes de homem que vai pro trabalho pra dar trabalho" · comédia SEM avatar · voz ElevenLabs (Osiany Sales v2)
// Glitch (Mykonos) · Fahad (Lattafa) · Rayhaan Pacific Aura. Notas: Fragrantica (Glitch: notas da marca, citadas na página do Fragrantica).
// Tela cheia: motion em cima (área 290–1350), legenda no terço de baixo. Gotham Black + Montserrat. SEM música, só SFX.
// v24 = refação do v18 com BASE ÂMBAR (fundo âmbar, texto petróleo noite / creme com contorno) + cartelas, notas e chips nas cores das famílias olfativas.
// Só cores da cartela oficial (nenhum HEX novo). Fontes grossas (fundo claro). Final acelerado 1,3x depois do render (1:05).
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
const CORAL = PIM;   // "erro/negação" agora em Pimenta (cartela oficial)
const INK = NOITE;
const OFF = 290;          // topo da área de motion
const CAP_TOP = 1400;     // legenda

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
  check: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${MENTA}" stroke="${INK}" stroke-width="7"/><path d="M26 52 L44 70 L76 32" stroke="${INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  xmark: `<svg viewBox="0 0 100 100"><path d="M16 16 L84 84 M84 16 L16 84" stroke="${INK}" stroke-width="25" stroke-linecap="round" fill="none"/><path d="M16 16 L84 84 M84 16 L16 84" stroke="${CORAL}" stroke-width="13" stroke-linecap="round" fill="none"/></svg>`,
  brilho: `<svg viewBox="0 0 100 100"><path d="M50 0 Q56 44 100 50 Q56 56 50 100 Q44 56 0 50 Q44 44 50 0Z" fill="${YEL}" stroke="${INK}" stroke-width="4"/></svg>`,
  ponto: `<svg viewBox="0 0 360 420"><rect x="10" y="10" width="340" height="400" rx="30" fill="${ALG}" stroke="${INK}" stroke-width="10"/><rect x="40" y="40" width="280" height="110" rx="14" fill="${INK}"/><text x="180" y="122" text-anchor="middle" font-family="Gotham" font-size="80" fill="${MENTA}">08:00</text><rect x="70" y="190" width="220" height="40" rx="8" fill="${INK}"/><rect x="100" y="250" width="160" height="130" rx="10" fill="${CREME}" stroke="${INK}" stroke-width="7"/><text x="180" y="300" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="30" fill="${INK}">PONTO</text><path d="M120 330 H240 M120 355 H210" stroke="${INK}" stroke-width="6"/></svg>`,
  cadeira: `<svg viewBox="0 0 400 460"><rect x="70" y="10" width="260" height="250" rx="60" fill="${PIM}" stroke="${INK}" stroke-width="10"/><path d="M110 50 V220 M290 50 V220" stroke="${CEDRO}" stroke-width="8" stroke-linecap="round"/><rect x="40" y="250" width="320" height="70" rx="30" fill="${PIM}" stroke="${INK}" stroke-width="10"/><rect x="186" y="320" width="28" height="70" fill="${INK}"/><path d="M60 440 L200 390 L340 440 M200 390 V440" stroke="${INK}" stroke-width="14" stroke-linecap="round" fill="none"/><circle cx="60" cy="444" r="14" fill="${INK}"/><circle cx="340" cy="444" r="14" fill="${INK}"/><circle cx="200" cy="444" r="14" fill="${INK}"/><rect x="130" y="70" width="140" height="56" rx="10" fill="${YEL}" stroke="${INK}" stroke-width="6"/><text x="200" y="111" text-anchor="middle" font-family="Gotham" font-size="34" fill="${INK}">CHEFE</text></svg>`,
  planilha: `<svg viewBox="0 0 420 320"><rect x="8" y="8" width="404" height="304" rx="22" fill="${CREME}" stroke="${INK}" stroke-width="9"/><rect x="8" y="8" width="404" height="64" rx="22" fill="${LUZ}"/><rect x="8" y="50" width="404" height="22" fill="${LUZ}"/><text x="210" y="54" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="32" fill="${CREME}">PLANILHA.xlsx</text>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${30 + c * 124}" y="${92 + r * 52}" width="112" height="40" rx="4" fill="${r === 0 ? MENTA : ALG}" stroke="${INK}" stroke-width="3"/>`).join('')).join('')}</svg>`,
  relogio: `<svg viewBox="0 0 100 100"><circle cx="50" cy="54" r="40" fill="${CREME}" stroke="${INK}" stroke-width="7"/><rect x="40" y="2" width="20" height="10" rx="3" fill="${INK}"/><path class="pt" d="M50 54 L50 26" stroke="${CORAL}" stroke-width="7" stroke-linecap="round" style="transform-origin:50px 54px"/><circle cx="50" cy="54" r="6" fill="${INK}"/></svg>`,
  pasta: `<svg viewBox="0 0 460 360"><path d="M20 60 Q20 40 40 40 H170 L200 70 H420 Q440 70 440 90 V330 Q440 350 420 350 H40 Q20 350 20 330Z" fill="${CEDRO}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><rect x="60" y="20" width="300" height="200" rx="8" fill="${CREME}" stroke="${INK}" stroke-width="6" transform="rotate(-4 210 120)"/><path d="M20 120 H440 V330 Q440 350 420 350 H40 Q20 350 20 330Z" fill="${ALG}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><text x="230" y="240" text-anchor="middle" font-family="Gotham" font-size="86" fill="${INK}">RH</text><text x="230" y="300" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="30" fill="${PIM}">CONFIDENCIAL</text></svg>`,
  tela: `<svg viewBox="0 0 640 420"><rect x="300" y="380" width="40" height="40" fill="${INK}"/><rect x="10" y="10" width="620" height="370" rx="18" fill="${CREME}" stroke="${INK}" stroke-width="10"/><g class="sl"><text x="40" y="70" font-family="Gotham" font-size="40" fill="${PET}">SLIDE 3 · METAS</text>${[90, 150, 120, 210, 260].map((h, j) => `<rect x="${70 + j * 100}" y="${350 - h}" width="64" height="${h}" rx="6" fill="${[MENTA, AMB, MENTA, AMB, YEL][j]}" stroke="${INK}" stroke-width="5"/>`).join('')}</g></svg>`,
};

// ---------- markup ----------
const pngDim = k => { const b = fs.readFileSync(path.join(HF, 'assets/img', k + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
let Z = 1;
const box = (id, l, t, w, h, inner, extra = '') => `<div id="${id}" class="abs" style="left:${Math.round(l)}px;top:${Math.round(t)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;z-index:${Z++};${extra}">${inner}</div>`;
const svg = (id, k, l, t, w, h, extra = '') => box(id, l, t, w, h, SV[k], extra);
const big = (id, text, l, t, w, h, fs, color = YEL, extra = '') => box(id, l, t, w, h, `<div class="big" style="font-size:${fs}px;color:${color}">${text}</div>`, extra);
const sub = (id, text, l, t, w, h, fs, color = CREME, peso = 900, extra = '') => box(id, l, t, w, h, `<div class="sub" style="font-size:${fs}px;color:${color};font-weight:${peso}">${text}</div>`, extra);
const pill = (id, text, l, t, w, fs = 54, bg = CREME, fg = INK) => box(id, l, t, w, Math.round(fs * 1.8), `<div class="pill" style="background:${bg};color:${fg};font-size:${fs}px">${text}</div>`);
const bubble = (id, text, l, t, w, fs = 60, cauda = 'esq') => box(id, l, t, w, Math.round(fs * 1.9) + 30, `<div class="bub" style="font-size:${fs}px;height:${Math.round(fs * 1.9)}px">${text}</div><div class="tail" style="${cauda === 'dir' ? 'left:auto;right:60px' : ''}"></div>`, `transform-origin:${cauda === 'dir' ? '80%' : '20%'} 100%`);
const frasco = (id, img, cx, bottom, h) => { const [w0, h0] = pngDim(img); const w = Math.round(h * w0 / h0); return box(id, cx - w / 2, bottom - h, w, h, `<div class="fr"><img src="assets/img/${img}.png"></div>`, 'transform-origin:50% 100%'); };
const emo = (id, e, l, t, s) => box(id, l, t, s, s, `<div class="emo" style="font-size:${Math.round(s * 0.82)}px">${e}</div>`);
const FOTO = new Set(['patchouli', 'lavanda', 'incenso']);   // notas que são foto quadrada (cover); o resto é recorte (contain)
const nota = (id, img, label, cx, top, bg = CREME, s = 200) => box(id, cx - s / 2 - 30, top, s + 60, s + 74, `<div class="nt" style="width:${s}px;height:${s}px;background:${bg}"><img src="assets/img/${img}.png" style="${FOTO.has(img) ? 'width:100%;height:100%;object-fit:cover' : 'width:84%;height:84%;object-fit:contain'}"></div><div class="nl">${label}</div>`);
const camada = (id, text, l, t, w) => box(id, l, t, w, 56, `<div class="cam">${text}</div>`);
const fonte = (id, text, t) => box(id, 40, t, 1000, 40, `<div class="src">${text}</div>`);
const cracha = (id, num, nome, marca, l, t, w = 470, fam = PET, famTxt = CREME) => box(id, l, t, w, 260, `<div class="cr"><div class="cr-h" style="background:${fam};color:${famTxt}">CRACHÁ · Nº ${num}</div><div class="cr-n">${nome}</div><div class="cr-m">${marca}</div><div class="cr-b"></div></div>`, 'transform-origin:50% 0');

// ---------- animação ----------
const SFX = [];
const S = (file, at, vol = 0.5) => SFX.push([file, at, vol]);
const empSfx = x => S('impact_grave', x, 0.45);
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
    set: (sel, x, props) => L.push(`tl.set("${sel}",{${props}},${t(x)});`),
    wiggle: (sel, x, n = 4, amp = 8) => L.push(`tl.to("${sel}",{keyframes:[${Array.from({ length: n }, (_, i) => `{rotation:${i % 2 ? -amp : amp},duration:0.06}`).join(',')},{rotation:0,duration:0.06}]},${t(x)});`),
    hop: (sel, x, hgt = 60) => L.push(`tl.to("${sel}",{keyframes:[{y:-${hgt},duration:0.16,ease:"power2.out"},{y:0,duration:0.22,ease:"bounce.out"}]},${t(x)});`),
    raw: s => L.push(s),
  };
}

const FONT = `@font-face{font-family:"Gotham";src:url("../assets/fonts/GothamBlack.otf");font-weight:900}@font-face{font-family:"Montserrat";src:url("../assets/fonts/Montserrat.ttf");font-weight:100 900}`;
const CSS = `${FONT}
#root{position:absolute;inset:0;overflow:visible;font-family:"Montserrat",sans-serif}
.abs{position:absolute}
.abs svg{width:100%;height:100%;overflow:visible}
.big{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Gotham",sans-serif;line-height:1.0;white-space:nowrap;text-transform:uppercase;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:10px 12px 0 rgba(10,31,35,.55)}
.sub{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:"Montserrat",sans-serif;white-space:nowrap;text-transform:uppercase;letter-spacing:.02em;-webkit-text-stroke:8px ${INK};paint-order:stroke fill}
.fr{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}
.fr img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 34px rgba(242,232,216,.55)) drop-shadow(0 26px 26px rgba(10,31,35,.45))}
.emo{width:100%;height:100%;display:flex;align-items:center;justify-content:center;line-height:1;filter:drop-shadow(6px 8px 0 rgba(10,31,35,.5))}
.pill{display:flex;align-items:center;justify-content:center;gap:14px;width:100%;height:100%;border-radius:999px;border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Montserrat",sans-serif;font-weight:900;letter-spacing:.01em;white-space:nowrap;text-transform:uppercase}
.bub{display:flex;align-items:center;justify-content:center;width:100%;border-radius:40px;background:${CREME};color:${INK};border:7px solid ${INK};font-family:"Gotham",sans-serif;white-space:nowrap;box-shadow:8px 10px 0 rgba(10,31,35,.5)}
.tail{position:absolute;bottom:4px;left:60px;width:40px;height:40px;background:${CREME};border-right:7px solid ${INK};border-bottom:7px solid ${INK};transform:rotate(45deg)}
.stamp{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:12px solid ${YEL};border-radius:28px;font-family:"Gotham",sans-serif;color:${YEL};background:${NOITE};box-shadow:10px 12px 0 rgba(10,31,35,.35);text-shadow:6px 8px 0 rgba(10,31,35,.6);white-space:nowrap;text-transform:uppercase}
.nt{margin:0 auto;border-radius:50%;background:${CREME};border:8px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);overflow:hidden;display:flex;align-items:center;justify-content:center}
.nl{margin-top:12px;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:34px;color:${CREME};text-transform:uppercase;white-space:nowrap;-webkit-text-stroke:7px ${INK};paint-order:stroke fill}
.cam{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:34px;letter-spacing:.28em;color:${NOITE};text-transform:uppercase;white-space:nowrap}
.src{width:100%;height:100%;text-align:center;font-family:"Montserrat",sans-serif;font-weight:800;font-size:28px;letter-spacing:.12em;color:${NOITE};opacity:.85;text-transform:uppercase}
.cr{position:relative;width:100%;height:100%;border-radius:30px;background:${CREME};border:8px solid ${INK};box-shadow:10px 12px 0 rgba(10,31,35,.55);overflow:hidden;text-align:center;color:${PET}}
.cr-h{height:62px;background:${PET};color:${AMB};font-family:"Montserrat",sans-serif;font-weight:800;font-size:28px;letter-spacing:.2em;display:flex;align-items:center;justify-content:center}
.cr-n{margin-top:24px;font-family:"Gotham",sans-serif;font-size:66px;line-height:1;white-space:nowrap}
.cr-m{margin-top:12px;font-family:"Montserrat",sans-serif;font-weight:800;font-size:30px;letter-spacing:.22em;color:${CEDRO};text-transform:uppercase;white-space:nowrap}
.cr-b{position:absolute;left:40px;right:40px;bottom:26px;height:16px;background:repeating-linear-gradient(90deg,${INK} 0 5px,transparent 5px 9px,${INK} 9px 11px,transparent 11px 16px)}
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
const iP1 = F('Primeiro'), iP2 = F('Segundo'), iP3 = F('Terceiro'), iAgora = F('Agora');
const B = { gancho: 0, glitch: T(iP1) - 0.1, fahad: T(iP2) - 0.1, aura: T(iP3) - 0.1, final: T(iAgora) - 0.1 };
const TA = FALA + 0.05;

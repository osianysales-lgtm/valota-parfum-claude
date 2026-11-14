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

// ===== 1) GANCHO: VAI PRO TRABALHO → PRA DAR TRABALHO! → ponto ✕ expediente → checklist → das mulheres 👀 → você é desse tipo? 🔍 =====
{
  const iTrab = F('trabalho'), iDar = F('dar'), iTrab2 = F('trabalho!'), iE = F('E'), iNao = F('não'), iCump = F('cumprir'), iVoce = F('Você', iCump);
  const iCham = F('chamar'), iMarc = F('marcar'), iVir = F('virar'), iAtr = F('atrair'), iPrin = F('principalmente'), iMulh = F('mulheres.'), iEnt = F('Então'), iTipo = F('tipo.');
  const lista = [['📣 CHAMAR ATENÇÃO', iCham], ['📍 MARCAR PRESENÇA', iMarc], ['💬 VIRAR ASSUNTO', iVir], ['👀 ATRAIR OLHARES', iAtr]];
  scene('gancho', B.gancho, B.glitch, () =>
    sub('l1', 'PERFUMES DE HOMEM', 40, 40, 1000, 80, 58, CREME)
    + sub('l2', 'QUE VAI PRO', 40, 125, 1000, 70, 46, CREME, 900)
    + big('t1', 'TRABALHO 💼', 20, 200, 1040, 190, 130, CREME)
    + sub('l3', 'PRA DAR', 40, 420, 1000, 80, 58, CREME)
    + big('t2', 'TRABALHO!', 20, 500, 1040, 230, 150, YEL)
    + svg('s1', 'brilho', 60, 470, 100, 100) + svg('s2', 'brilho', 930, 660, 90, 90)
    + svg('pt', 'ponto', 330, 60, 420, 490)
    + pill('ex', 'SÓ CUMPRIR EXPEDIENTE', 140, 600, 800, 48, CREME, INK)
    + svg('px', 'xmark', 400, 170, 280, 280)
    + lista.map(([txt], j) => pill(`c${j}`, txt, 120, 30 + j * 150, 740, 46, [MENTA, ROSA, BERG, ALG][j], INK) + svg(`k${j}`, 'check', 880, 40 + j * 150, 90, 90)).join('')
    + box('mu', 170, 650, 740, 150, `<div class="stamp" style="font-size:62px">👀 DAS MULHERES</div>`, 'transform:rotate(-4deg)')
    + emo('lp', '🔍', 340, 40, 400)
    + pill('tp', 'VOCÊ É DESSE TIPO?', 120, 520, 840, 56, YEL, INK),
  A => {
    A.hide('#l3', '#t2', '#s1', '#s2', '#pt', '#ex', '#px', ...lista.map((_, j) => `#c${j},#k${j}`), '#mu', '#lp', '#tp');
    A.set('#l1,#l2,#t1', 0, 'opacity:1');
    A.wiggle('#t1', T(iTrab), 4, 3); S('pop_leve', T(iTrab), 0.45);
    A.rise('#l3', T(iDar) - 0.15, 20, 0.22);
    A.slam('#t2', T(iTrab2), 2.4); empSfx(T(iTrab2));
    A.pop('#s1', T(iTrab2) + 0.2); A.pop('#s2', T(iTrab2) + 0.3); S('plim_brilho_magico', T(iTrab2) + 0.2, 0.4);
    A.wiggle('#t2', T(iTrab2) + 0.5, 5, 4);
    A.out('#l1,#l2,#t1,#l3,#t2,#s1,#s2', T(iE) - 0.12, 0.14);
    A.pop('#pt', T(iE) + 0.6); S('relogio_tique', T(iE) + 0.6, 0.35);
    A.rise('#ex', T(iCump) - 0.35, 30, 0.28);
    A.slam('#px', T(iNao) + 0.35, 2.2); S('buzzer_erro', T(iNao) + 0.4, 0.3);
    A.out('#pt,#ex,#px', T(iVoce) - 0.12, 0.14);
    lista.forEach(([, i], j) => { A.slide(`#c${j}`, T(i) - 0.08, -200); S('whoosh_rapido', T(i) - 0.1, 0.3); A.pop(`#k${j}`, T(i) + 0.25); S('ding_acerto', T(i) + 0.25, 0.3); });
    A.slam('#mu', T(iPrin), 2.0, -4); S('carimbo', T(iPrin), 0.45); A.wiggle('#mu', T(iMulh), 4, 3);
    A.out(lista.map((_, j) => `#c${j},#k${j}`).join(',') + ',#mu', T(iEnt) - 0.12, 0.14);
    A.pop('#lp', T(iEnt) + 0.05); S('lupa_whoosh', T(iEnt), 0.4);
    A.to('#lp', T(iEnt) + 0.5, 'x:-60,rotation:-10', 0.5, 'sine.inOut'); A.to('#lp', T(iEnt) + 1.0, 'x:60,rotation:10', 0.6, 'sine.inOut');
    A.slam('#tp', T(iEnt) + 0.45, 1.7); S('suspense_dun', T(iEnt) + 0.45, 0.4);
    A.out('#lp,#tp', B.glitch - 0.14, 0.12);
  });
}

// ===== 2) GLITCH: crachá #1 → senta na cadeira do CHEFE → CARGO ??? → SIM, SENHOR! → notas → planilha → reunião 15 min → almoço? → planilha sumiu =====
{
  const iG = F('Glitch,', iP1), iEsse = F('Esse', iP1), iChefe = F('chefe', iP1), iSenta = F('senta', iP1), iNing = F('Ninguém', iP1), iCargo = F('cargo', iP1), iTodo = F('todo', iCargo), iObed = F('obedece.', iP1);
  const iAbre = F('Abre', iP1), iAbac = F('abacaxi', iP1), iBerg = F('bergamota,', iP1), iTerm = F('termina', iP1), iPat = F('patchouli', iP1), iBau = F('baunilha', iP1), iGruda = F('gruda', iP1);
  const iVc = F('Você', iGruda), iPlan = F('planilha', iP1), iReun = F('reunião', iP1), iVirou = F('virou', iP1), iVamos = F('vamos', iP1), iA = F('A', iVamos), iNing2 = F('ninguém', iA), iParar = F('parar.', iP1);
  scene('glitch', B.glitch, B.fahad, () =>
    big('n1', '#1', 40, 0, 300, 220, 200, YEL)
    + svg('ch', 'cadeira', 80, 150, 440, 506)
    + frasco('fg', 'glitch', 700, 640, 600)
    + cracha('cg', '001', 'GLITCH', 'MYKONOS', 90, 300, 440, CEDRO, CREME)
    + pill('cg2', 'CARGO: ???', 560, 40, 440, 48, ALG, INK)
    + bubble('sim', 'SIM, SENHOR! 🫡', 470, 250, 560, 56, 'dir')
    + emo('e1', '🙇', 640, 470, 150) + emo('e2', '🙇‍♀️', 830, 470, 150)
    + camada('ks', 'SAÍDA', 330, 0, 600) + camada('kf', 'FUNDO', 330, 360, 600)
    + nota('na', 'abacaxi', 'ABACAXI', 500, 60, BERG) + nota('nb', 'bergamota', 'BERGAMOTA', 760, 60, CREME)
    + nota('nc', 'patchouli', 'PATCHOULI', 500, 420, CEDRO) + nota('nd', 'baunilha', 'BAUNILHA', 760, 420, CREME)
    + pill('gm', '🧠 GRUDA NA MEMÓRIA', 230, 800, 620, 44, YEL, INK)
    + fonte('fn', 'notas: Mykonos · via Fragrantica', 760)
    + svg('pl', 'planilha', 270, 40, 540, 412)
    + pill('rm', '⏱ REUNIÃO: 15 MIN', 220, 480, 640, 48, MENTA, INK)
    + bubble('al', 'VAMOS CONTINUAR NO ALMOÇO? 🍝', 30, 600, 1020, 46)
    + pill('sm', '📄 PLANILHA: DESAPARECIDA', 140, 200, 800, 46, CORAL, CREME),
  A => {
    A.hide('#n1', '#fg', '#cg', '#ch', '#cg2', '#sim', '#e1', '#e2', '#ks', '#kf', '#na', '#nb', '#nc', '#nd', '#gm', '#fn', '#pl', '#rm', '#al', '#sm');
    A.slam('#n1', T(iP1), 2.2); empSfx(T(iP1));
    A.raw(`tl.fromTo("#fg",{opacity:0,scale:0.4,y:160},{opacity:1,scale:1,y:0,duration:0.42,ease:"back.out(1.7)"},${A.t(T(iG) - 0.1)});`); S('shine_brilho', T(iG), 0.45);
    A.raw(`tl.fromTo("#cg",{opacity:0,rotation:-25,y:-200},{opacity:1,rotation:-4,y:0,duration:0.5,ease:"back.out(1.6)"},${A.t(T(iG) + 0.15)});`); S('click_ui', T(iG) + 0.3, 0.4);
    // chega antes do chefe e senta na cadeira
    A.out('#n1,#cg', T(iChefe) - 0.2, 0.14);
    A.pop('#ch', T(iChefe) - 0.1); S('pop_leve', T(iChefe) - 0.1, 0.4);
    A.to('#fg', T(iSenta) - 0.1, 'x:-400,y:-215,scale:0.72', 0.45, 'back.inOut(1.4)'); S('whoosh_suave', T(iSenta) - 0.1, 0.4); S('boing_cartoon', T(iSenta) + 0.35, 0.35);
    A.pop('#cg2', T(iNing) + 0.05, 3); S('suspense_dun', T(iCargo), 0.35); A.wiggle('#cg2', T(iCargo) + 0.1, 4, 4);
    A.pop('#sim', T(iTodo) - 0.05, -2); S('ding_notificacao', T(iTodo), 0.45);
    A.pop('#e1', T(iObed)); A.pop('#e2', T(iObed) + 0.12); S('pop_leve', T(iObed), 0.4);
    // notas
    A.out('#ch,#cg2,#sim,#e1,#e2', T(iAbre) - 0.15, 0.14);
    A.to('#fg', T(iAbre) - 0.15, 'x:-480,y:0,scale:0.8', 0.4);
    A.rise('#ks', T(iAbre), -20, 0.25);
    A.pop('#na', T(iAbac) - 0.05); S('pop_leve', T(iAbac), 0.45);
    A.pop('#nb', T(iBerg) - 0.05); S('pop_leve', T(iBerg), 0.45);
    A.rise('#kf', T(iTerm), -20, 0.25);
    A.pop('#nc', T(iPat) - 0.05); S('pop_leve', T(iPat), 0.45);
    A.pop('#nd', T(iBau) - 0.05); S('pop_leve', T(iBau), 0.45);
    A.rise('#fn', T(iPat), 10, 0.3);
    A.slam('#gm', T(iGruda) - 0.3, 1.7); S('ding_acerto', T(iGruda) - 0.2, 0.4);
    // planilha → reunião → almoço → sumiu
    A.out('#ks,#kf,#na,#nb,#nc,#nd,#gm,#fn,#fg', T(iVc) + 0.1, 0.14);
    A.pop('#pl', T(iPlan) - 0.1, -3); S('typing_teclado', T(iPlan) - 0.1, 0.3);
    A.rise('#rm', T(iReun), 30, 0.28); S('relogio_tique', T(iReun), 0.35);
    A.wiggle('#rm', T(iVirou), 4, 3);
    A.pop('#al', T(iVamos) - 0.05, -2); S('ding_notificacao', T(iVamos), 0.45);
    A.raw(`tl.to("#pl",{x:700,y:-300,rotation:120,opacity:0,duration:0.6,ease:"power2.in"},${A.t(T(iA))});`); S('whoosh_rapido', T(iA), 0.4);
    A.out('#rm,#al', T(iA) + 0.1, 0.14);
    A.slam('#sm', T(iNing2) - 0.1, 1.7, -3); S('trombone_triste', T(iNing2), 0.3);
    A.out('#sm', B.fahad - 0.14, 0.12);
  });
}

// ===== 3) FAHAD: crachá #2 → NÃO É PERFUME → PROCESSO ADMINISTRATIVO → pasta do RH → notas → slide some → SLIDE 3? → recomendação: moderação / advogado ⚖️ =====
{
  const iFa = F('Fahad,', iP2), iNao = F('não', iP2), iProc = F('processo', iP2), iRH = F('RH', iP2), iNome = F('nome', iP2), iAbac = F('Abacaxi,', iP2), iLav = F('lavanda', iP2), iInc = F('incenso:', iP2), iMasc = F('masculino,', iP2), iMarc = F('marcante', iP2), iEleg = F('elegante.', iP2);
  const iEle = F('Ele', iEleg), iSala = F('sala', iP2), iSome = F('some', iP2), iSl1 = F('"Slide', iP2), iQue = F('Que', iSl1), iRec = F('Recomendação', iP2), iUsar = F('usar', iP2), iOu = F('Ou', iUsar), iAdv = F('advogado.', iP2);
  scene('fahad', B.fahad, B.aura, () =>
    big('n2', '#2', 40, 0, 300, 220, 200, YEL)
    + frasco('ff', 'fahad', 700, 640, 600)
    + cracha('cf', '002', 'FAHAD', 'LATTAFA', 90, 300, 440, PIM, CREME)
    + pill('np', '❌ NÃO É PERFUME', 220, 40, 640, 50, CREME, INK)
    + box('pa', 60, 180, 960, 190, `<div class="stamp" style="font-size:56px;border-color:${CORAL};color:${CREME}">PROCESSO ADMINISTRATIVO</div>`, 'transform:rotate(-5deg)')
    + svg('rh', 'pasta', 290, 420, 500, 391)
    + box('tag', 610, 420, 300, 90, `<div class="pill" style="background:${CORAL};color:${CREME};font-size:40px">FAHAD 📌</div>`, 'transform:rotate(8deg)')
    + nota('na', 'abacaxi', 'ABACAXI', 480, 40, BERG) + nota('nb', 'lavanda', 'LAVANDA', 740, 40, ALG) + nota('nc', 'incenso', 'INCENSO', 610, 330, PIM)
    + fonte('fn', 'notas: Fragrantica', 640)
    + pill('m1', 'MASCULINO', 60, 720, 300, 38, MENTA, INK) + pill('m2', 'MARCANTE', 390, 720, 300, 38, PIM, CREME) + pill('m3', 'ELEGANTE', 720, 720, 300, 38, ALG, INK)
    + svg('tl', 'tela', 180, 30, 720, 472)
    + bubble('b1', 'SLIDE 3?', 80, 540, 420, 64)
    + bubble('b2', 'QUE SLIDE 3? 🫠', 440, 700, 580, 60, 'dir')
    + sub('ro', 'RECOMENDAÇÃO OFICIAL', 40, 40, 1000, 80, 58, CREME)
    + pill('u1', '⚠️ USAR COM MODERAÇÃO', 110, 200, 860, 50, ROSA, INK)
    + box('u2', 70, 400, 940, 190, `<div class="stamp" style="font-size:66px">⚖️ OU COM ADVOGADO</div>`, 'transform:rotate(-4deg)'),
  A => {
    A.hide('#n2', '#ff', '#cf', '#np', '#pa', '#rh', '#tag', '#na', '#nb', '#nc', '#fn', '#m1', '#m2', '#m3', '#tl', '#b1', '#b2', '#ro', '#u1', '#u2');
    A.slam('#n2', T(iP2), 2.2); empSfx(T(iP2));
    A.raw(`tl.fromTo("#ff",{opacity:0,scale:0.4,y:160},{opacity:1,scale:1,y:0,duration:0.42,ease:"back.out(1.7)"},${A.t(T(iFa) - 0.1)});`); S('shine_brilho', T(iFa), 0.45);
    A.raw(`tl.fromTo("#cf",{opacity:0,rotation:25,y:-200},{opacity:1,rotation:-4,y:0,duration:0.5,ease:"back.out(1.6)"},${A.t(T(iFa) + 0.15)});`); S('click_ui', T(iFa) + 0.3, 0.4);
    A.out('#n2,#cf,#ff', T(iNao) - 0.15, 0.14);
    A.slam('#np', T(iNao) - 0.05, 1.6); S('buzzer_erro', T(iNao), 0.25);
    A.slam('#pa', T(iProc), 2.2, -5); S('carimbo', T(iProc), 0.5);
    A.pop('#rh', T(iRH) - 0.05); S('ziper_bolsa', T(iRH) - 0.1, 0.35);
    A.slam('#tag', T(iNome) - 0.05, 1.8, 8); S('carimbo', T(iNome), 0.4); A.wiggle('#tag', T(iNome) + 0.3, 4, 5);
    // notas
    A.out('#np,#pa,#rh,#tag', T(iAbac) - 0.15, 0.14);
    A.raw(`tl.fromTo("#ff",{opacity:0,x:-480,scale:0.6,y:0},{opacity:1,x:-480,scale:0.8,y:0,duration:0.35,ease:"back.out(1.7)",immediateRender:false},${A.t(T(iAbac) - 0.1)});`);
    A.pop('#na', T(iAbac)); S('pop_leve', T(iAbac), 0.45);
    A.pop('#nb', T(iLav)); S('pop_leve', T(iLav), 0.45);
    A.pop('#nc', T(iInc)); S('pop_leve', T(iInc), 0.45);
    A.rise('#fn', T(iInc), 10, 0.3);
    [[iMasc, '#m1'], [iMarc, '#m2'], [iEleg, '#m3']].forEach(([i, s]) => { A.pop(s, T(i) - 0.05); S('pop_leve', T(i), 0.35); });
    S('fungada_cheirar', T(iMasc) - 0.1, 0.4);
    // apresentação
    A.out('#ff,#na,#nb,#nc,#fn,#m1,#m2,#m3', T(iEle) - 0.12, 0.14);
    A.pop('#tl', T(iSala) - 0.2); S('click_ui', T(iSala), 0.4);
    A.raw(`tl.to("#tl .sl",{opacity:0,duration:0.5,ease:"power2.in"},${A.t(T(iSome))});`); S('whoosh_suave', T(iSome), 0.4);
    A.pop('#b1', T(iSl1) - 0.05, -2); S('grilos_silencio', T(iSl1), 0.35);
    A.pop('#b2', T(iQue) - 0.2, 2); S('badum_tss', T(iQue) + 0.6, 0.3);
    // recomendação
    A.out('#tl,#b1,#b2', T(iRec) + 0.12, 0.14);
    A.rise('#ro', T(iRec) + 0.2, -20, 0.25); S('suspense_dun', T(iRec), 0.35);
    A.pop('#u1', T(iUsar) - 0.05); S('pop_leve', T(iUsar), 0.4);
    A.slam('#u2', T(iOu) - 0.05, 2.2, -4); S('martelo_juiz', T(iOu), 0.5);
    A.out('#ro,#u1,#u2', B.aura - 0.14, 0.12);
  });
}

// ===== 4) RAYHAAN PACIFIC AURA: crachá #3 → O SONSO 😇 → fone + acordou atrasado → girassóis 🌻 → chat → PASSOU SIM → notas → genérico ✕ → seduz sem esforço =====
{
  const iRay = F('Rayhaan', iP3), iEsse = F('Esse', iP3), iSonso = F('sonso.', iP3), iFone = F('fone,', iP3), iAcord = F('acordou', iP3), iEscr = F('escritório', iP3), iGira = F('girassol', iP3), iVir = F('virando', iP3);
  const iQP = F('"Que', iVir), iAh = F('"Ah,', iP3), iPassou = F('Passou.', iP3), iSim = F('sim.', iP3), iTang = F('Tangerina,', iP3), iMenta = F('menta', iP3), iBerg = F('bergamota:', iP3), iGen = F('genérico', iP3), iEleg = F('Elegante,', iP3), iSed = F('seduz', iP3), iEsf = F('esforço', iP3);
  const gir = [[60, 40], [60, 420], [860, 40], [860, 420]];
  scene('aura', B.aura, B.final, () =>
    big('n3', '#3', 40, 0, 300, 220, 200, YEL)
    + frasco('fa', 'aura', 700, 620, 470)
    + cracha('ca', '003', 'PACIFIC AURA', 'RAYHAAN', 50, 300, 520, MENTA, NOITE)
    + big('so', 'O SONSO 😇', 20, 0, 1040, 200, 130, YEL)
    + emo('fo', '🎧', 420, 150, 240)
    + pill('at', '😴 ACORDOU ATRASADO', 200, 720, 680, 44, ALG, INK)
    + gir.map(([l, t], j) => emo(`g${j}`, '🌻', l, t, 160)).join('')
    + bubble('q1', 'QUE PERFUME É ESSE? 😍', 40, 20, 760, 52)
    + bubble('q2', 'AH, SEI LÁ… NEM PASSEI 🤷', 180, 230, 860, 50, 'dir')
    + box('ps', 190, 480, 700, 180, `<div class="stamp" style="font-size:88px">PASSOU SIM ✅</div>`, 'transform:rotate(-4deg)')
    + camada('ks', 'CÍTRICO · FRESCO', 330, 0, 640)
    + nota('na', 'tangerina', 'TANGERINA', 500, 60, BERG) + nota('nb', 'hortela', 'MENTA', 760, 60, MENTA) + nota('nc', 'bergamota', 'BERGAMOTA', 630, 360, CREME)
    + fonte('fn', 'notas: Fragrantica', 690)
    + box('gx', 160, 760, 760, 100, `<div class="pill" style="background:${ALG};color:${INK};font-size:40px;text-decoration:line-through;text-decoration-thickness:6px;text-decoration-color:${CORAL}">GENÉRICO DE PÓS-ACADEMIA</div>`)
    + pill('se', '😌 SEDUZ SEM ESFORÇO', 160, 880, 760, 48, YEL, INK),
  A => {
    A.hide('#n3', '#fa', '#ca', '#so', '#fo', '#at', ...gir.map((_, j) => `#g${j}`), '#q1', '#q2', '#ps', '#ks', '#na', '#nb', '#nc', '#fn', '#gx', '#se');
    A.slam('#n3', T(iP3), 2.2); empSfx(T(iP3));
    A.raw(`tl.fromTo("#fa",{opacity:0,scale:0.4,y:160},{opacity:1,scale:1,y:0,duration:0.42,ease:"back.out(1.7)"},${A.t(T(iRay) - 0.1)});`); S('shine_brilho', T(iRay), 0.45);
    A.raw(`tl.fromTo("#ca",{opacity:0,rotation:-25,y:-200},{opacity:1,rotation:-4,y:0,duration:0.5,ease:"back.out(1.6)"},${A.t(T(iRay) + 0.2)});`); S('click_ui', T(iRay) + 0.35, 0.4);
    // sonso: frasco vai pro centro
    A.out('#n3,#ca', T(iEsse) - 0.1, 0.14);
    A.to('#fa', T(iEsse) - 0.1, 'x:-160,y:60,scale:0.9', 0.4);
    A.slam('#so', T(iSonso) - 0.05, 2.0); S('plim_brilho_magico', T(iSonso), 0.4);
    A.out('#so', T(iFone) - 0.2, 0.12);
    A.raw(`tl.fromTo("#fo",{opacity:0,y:-200},{opacity:1,y:0,duration:0.35,ease:"bounce.out"},${A.t(T(iFone) - 0.15)});`); S('boing_cartoon', T(iFone), 0.35);
    A.rise('#at', T(iAcord), 30, 0.28); S('alarme_despertador', T(iAcord), 0.25);
    A.out('#at', T(iEscr) - 0.1, 0.12);
    gir.forEach((_, j) => { A.pop(`#g${j}`, T(iEscr) + j * 0.1); });
    S('pop_leve', T(iEscr), 0.4);
    gir.forEach(([l], j) => A.to(`#g${j}`, T(iVir), `rotation:${l < 500 ? 35 : -35},scale:1.15`, 0.4, 'back.out(2)'));
    S('plim_brilho_magico', T(iVir), 0.4);
    // chat
    A.out('#fa,#fo,' + gir.map((_, j) => `#g${j}`).join(','), T(iQP) - 0.12, 0.14);
    A.pop('#q1', T(iQP) - 0.05, -2); S('ding_notificacao', T(iQP), 0.45);
    A.pop('#q2', T(iAh) - 0.05, 2); S('ding_notificacao', T(iAh), 0.35);
    A.slam('#ps', T(iPassou), 2.2, -4); S('carimbo', T(iPassou), 0.5); A.wiggle('#ps', T(iSim), 4, 4); S('badum_tss', T(iSim) + 0.1, 0.3);
    // notas
    A.out('#q1,#q2,#ps', T(iTang) - 0.12, 0.14);
    A.raw(`tl.fromTo("#fa",{opacity:0,x:-480,y:0,scale:0.6},{opacity:1,x:-480,y:0,scale:0.95,duration:0.35,ease:"back.out(1.7)",immediateRender:false},${A.t(T(iTang) - 0.1)});`);
    A.set('#fo', T(iTang) - 0.1, 'opacity:0');
    A.rise('#ks', T(iTang), -20, 0.25);
    A.pop('#na', T(iTang)); S('pop_leve', T(iTang), 0.45);
    A.pop('#nb', T(iMenta)); S('pop_leve', T(iMenta), 0.45);
    A.pop('#nc', T(iBerg)); S('pop_leve', T(iBerg), 0.45);
    A.rise('#fn', T(iBerg), 10, 0.3);
    A.pop('#gx', T(iGen) - 0.1); S('buzzer_erro', T(iGen) + 0.2, 0.25);
    A.slam('#se', T(iSed) - 0.1, 1.7); S('shine_brilho', T(iSed), 0.4); A.hop('#se', T(iEsf), 20);
    A.out('#fa,#ks,#na,#nb,#nc,#fn,#gx,#se', B.final - 0.14, 0.12);
  });
}

// ===== 5) FINAL: 3 frascos → QUAL DESSES? → transferência 🏃 x hora extra ⏰ → comenta 👇 → segue @valotaparfum → assinatura =====
{
  const iQual = F('qual', iAgora), iTransf = F('transferência', iAgora), iOu = F('ou', iTransf), iHora = F('hora', iAgora), iCom = F('Comenta', iAgora), iE = F('E', iCom), iSegue = F('segue', iAgora);
  const fr = [['glitch', 220, 'GLITCH'], ['fahad', 540, 'FAHAD'], ['aura', 860, 'PACIFIC AURA']];
  scene('final', B.final, END, () =>
    big('qd', 'QUAL DESSES?', 20, 0, 1040, 170, 120, YEL)
    + fr.map(([k, cx, n], j) => frasco(`f${j}`, k, cx, 520, k === 'aura' ? 260 : 320) + sub(`fl${j}`, n, cx - 170, 535, 340, 50, 32, CREME, 900)).join('')
    + pill('tr', '🏃 PEDIR TRANSFERÊNCIA', 40, 640, 640, 42, MENTA, INK)
    + pill('he', '⏰ FAZER HORA EXTRA', 400, 790, 640, 42, YEL, INK)
    + sub('ou', 'OU', 700, 640, 300, 76, 56, CREME)
    + pill('cm', '💬 COMENTA AÍ 👇', 220, 230, 640, 56, ROSA, INK)
    + sub('dt', 'PRA DAR TRABALHO NO TRABALHO', 40, 420, 1000, 80, 50, CREME)
    + pill('sg', 'SEGUE @VALOTAPARFUM', 120, 540, 840, 52, YEL, INK)
    + box('as', 0, 330, 1080, 230, '<div class="assin"><div class="n">VALOTA PARFUM</div><div class="l"></div><div class="s">@VALOTAPARFUM</div></div>'),
  A => {
    A.hide('#qd', ...fr.map((_, j) => `#f${j},#fl${j}`), '#tr', '#he', '#ou', '#cm', '#dt', '#sg', '#as');
    fr.forEach((_, j) => { A.raw(`tl.fromTo("#f${j}",{opacity:0,y:120,scale:0.5},{opacity:1,y:0,scale:1,duration:0.38,ease:"back.out(1.8)"},${A.t(T(iAgora) + j * 0.12)});`); A.rise(`#fl${j}`, T(iAgora) + 0.2 + j * 0.12, 20, 0.25); S('pop_leve', T(iAgora) + j * 0.12, 0.4); });
    A.slam('#qd', T(iQual), 1.8); S('suspense_dun', T(iQual), 0.4);
    A.slide('#tr', T(iTransf) - 0.1, -260); S('whoosh_rapido', T(iTransf) - 0.1, 0.4);
    A.pop('#ou', T(iOu) - 0.1); A.slide('#he', T(iOu) + 0.1, 260); S('relogio_tique', T(iHora), 0.4); S('badum_tss', T(iHora) + 0.6, 0.3);
    A.out('#qd,' + fr.map((_, j) => `#f${j},#fl${j}`).join(',') + ',#tr,#he,#ou', T(iCom) - 0.12, 0.14);
    A.slam('#cm', T(iCom), 1.7); S('ding_notificacao', T(iCom), 0.45); A.hop('#cm', T(iCom) + 0.5, 24);
    A.rise('#dt', T(iE) + 0.2, 24, 0.28);
    A.slam('#sg', T(iSegue) - 0.1, 1.7); S('ding_acerto', T(iSegue), 0.45);
    A.out('#cm,#dt,#sg', TA, 0.2);
    A.raw(`tl.fromTo("#as",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"power3.out"},${A.t(TA + 0.15)});`); S('shine_brilho', TA + 0.15, 0.5);
  });
}

// ---------- fundo (paleta) ----------
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

// ---------- legendas (caixa alta, creme + amarelo nas palavras-chave, Montserrat 900) ----------
const KEY = /^(TRABALHO|ATENÇÃO|PRESENÇA|ASSUNTO|OLHARES|MULHERES|TIPO|GLITCH|MYKONOS|CHEFE|CADEIRA|CARGO|OBEDECE|ABACAXI|BERGAMOTA|PATCHOULI|BAUNILHA|MEMÓRIA|PLANILHA|ALMOÇO|FAHAD|LATTAFA|PERFUME|PROCESSO|ADMINISTRATIVO|RH|PASTA|LAVANDA|INCENSO|SLIDE|MODERAÇÃO|ADVOGADO|RAYHAAN|PACIFIC|AURA|SONSO|FONE|GIRASSOL|PASSOU|SIM|TANGERINA|MENTA|CÍTRICO|SEDUZ|ESFORÇO|TRANSFERÊNCIA|HORA|EXTRA|COMENTA|VALOTA|PARFUM|SEGUE)$/;
const groups = []; let cur = [];
W.forEach((w, j) => {
  cur.push(j);
  if (/^(Valota|Rayhaan|Pacific|hora)$/.test(w.p) && W[j + 1]) return;
  const pont = /[.,:!?"…]$/.test(w.p) || /\.\.\.$/.test(w.p); const nx = W[j + 1]; const gap = nx ? nx.ini - w.fim : 9;
  if (cur.length >= 3 || pont || gap > 0.2 || (w.p.length > 11 && cur.length >= 2) || cur.reduce((s, k) => s + W[k].p.length + 1, 0) > 21) { groups.push(cur); cur = []; }
});
if (cur.length) groups.push(cur);
const capEls = [];
groups.forEach((g, gi) => {
  const st = gi === 0 ? 0.02 : W[g[0]].ini; if (st >= TA) return;
  const next = groups[gi + 1]; const nxt = next ? W[next[0]].ini : END;
  const en = Math.min(nxt, W[g[g.length - 1]].fim + 0.35, TA);
  const html = g.map(i => { const raw = W[i].p.replace(/["“”]/g, '').replace(/[.,:;!]+$/, '').toUpperCase(); const base = raw.replace(/\?$/, ''); return `<span style="color:${KEY.test(base) ? YEL : CREME}">${raw}</span>`; }).join(' ');
  const nch = g.reduce((s, i) => s + W[i].p.replace(/["“”.,:;!]+/g, '').length + 1, -1);
  const fsz = Math.min(64, Math.floor(980 / (nch * 0.74)));
  capEls.push(`<div id="cap${gi}" style="font-size:${fsz}px" class="clip cap" data-start="${st.toFixed(3)}" data-duration="${Math.max(0.2, en - st).toFixed(3)}" data-track-index="1">${html}</div>`);
});
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

// ---------- áudio: narração + SÓ efeitos sonoros (sem música) ----------
const FFM = path.join(__dirname, '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const LIB = path.join(__dirname, '../../biblioteca_audio/efeitos');
fs.copyFileSync(path.join(__dirname, 'narracao.mp3'), path.join(HF, 'assets/audio/narracao.mp3'));
const DUR = {};
const durOf = f => { if (DUR[f]) return DUR[f]; const dst = path.join(HF, 'assets/audio', f + '.mp3'); if (!fs.existsSync(dst)) fs.copyFileSync(path.join(LIB, f + '.mp3'), dst);
  let out = ''; try { execFileSync(FFM, ['-i', dst], { stdio: 'pipe' }); } catch (e) { out = String(e.stderr); }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/); return (DUR[f] = m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 1); };
const visto = new Set();
const sfxEls = SFX.filter(([f, at]) => { const k = f + '@' + at.toFixed(2); if (visto.has(k)) return false; visto.add(k); return at < END - 0.05; }).map(([file, at, vol], i) => {
  const a = Math.max(0, at);
  return `<audio id="sfx${i}" class="clip" src="assets/audio/${file}.mp3" data-start="${a.toFixed(3)}" data-duration="${Math.min(durOf(file), END - a).toFixed(3)}" data-track-index="${12 + i}" data-volume="${vol}"></audio>`;
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
console.log('ok · END', END, '· cenas', scenes.map(x => `${x.id}(${x.start.toFixed(2)}–${x.end.toFixed(2)})`).join(', '), '· legendas', capEls.length, '· sfx', sfxEls.length);

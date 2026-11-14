// v21 — "GLITCH (Mykonos) — vale o frasco?" (unboxing gravado da Osiany, ~/Downloads/glitch.MOV).
// Base = cortado.mp4 (falsos inícios/repetições + pausas cortadas; cheirando/borrifando/mostrando frasco preservados — ver cortes.py).
// Áudio limpo (highpass 75 Hz + afftdn leve), -14 LUFS. SEM trilha: só voz + SFX.
// Bandeira da Indonésia sempre que ela fala "Mykonos" (pedido da Osiany). CTA final: seguir pra ver a PARTE 2 (projeção e fixação).
// Paleta 50/50 (cartela oficial): base Petróleo/Creme + cores de família. Fontes: Montserrat + Gotham Black. Rodar: node gen.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const HF = path.join(__dirname, 'hf');
const W = require('./audio/cortado.json');
const ROSTO = require('./rosto.json'); // [t, x0, y0, x1, y1] a cada 0,25 s (1080x1920)
const FALA = +(W[W.length - 1].end + 0.35).toFixed(2); // fim da fala
const END = 166.9;                                        // base_fim.mp4 = cortado + 3,6 s de último quadro congelado (CTA)

// ---------- paleta oficial Valota Parfum ----------
const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMB = '#D49A4E', YEL = '#FFC93C';
const CEDRO = '#6B4430', BERG = '#B8BC5C', MENTA = '#7DBFB3', ROSA = '#E6AEB9', PIM = '#9C452A', ALG = '#DCD6E2';
const INK = NOITE;
const ID_VERM = '#CE1126', ID_BRANCO = '#FFFFFF'; // cores reais da bandeira da Indonésia (só na bandeira)

const F = (txt, depois = 0) => {
  const re = new RegExp('^' + txt, 'i');
  const w = W.find(x => x.start >= depois && re.test(x.word.replace(/[.,!?…]/g, '')));
  if (!w) throw new Error('palavra não achada: ' + txt + ' depois de ' + depois);
  return w.start;
};

// ---------- tempos ----------
const T = {};
T.glitch = F('Glitch'); T.myk = F('Mykonos'); T.indo = F('Indonésia'); T.hyp = F('hypado'); T.vale = F('vale');
T.vamos = F('Vamos', T.vale); T.dizem = F('Dizem'); T.aventus = F('Aventus'); T.absolu = F('Absolu');
T.ver = F('vamos', T.absolu); T.dificil = F('difícil'); T.hora = F('hora'); T.olha = F('olha', T.hora);
T.agora = F('Agora'); T.cheiro = F('cheiro', T.agora); T.mano = F('Mano'); T.borr1 = F('bo', T.mano);
T.nossa = F('Nossa', T.borr1); T.abacaxi = F('abacaxi'); T.gente = F('Gente'); T.lembrando = F('lembrando');
T.haci = F('Hacivat'); T.creed2 = F('Creed', T.haci); T.conf = F('confortável'); T.abac2 = F('abacaxi', T.conf);
T.esfum = F('esfumaçado'); T.equil = F('equilibrado'); T.bom = F('Gente', T.equil);
T.dia = F('dia', T.bom); T.versatil = F('versátil'); T.haci2 = F('Hacivat', T.versatil); T.dia2 = F('dia', T.haci2);
T.esse = F('Esse', T.dia2); T.assin = F('assinatura'); T.impress = F('impressionada'); T.borr2 = F('borrifador', T.impress);
T.cheiroso = F('Cara', T.borr2); T.proj = F('projeção'); T.fix = F('fixação'); T.mas2 = F('Mas', T.fix);
T.javale = F('vale', F('cheiro', T.mas2)); T.myk2 = F('Mykonos', T.javale); T.indo2 = F('Indonésia', T.myk2);
T.bonito = F('bonito'); T.depois = F('Depois', T.bonito); T.video = F('vídeo', T.depois); T.proj2 = F('projeção', T.depois);
T.fix2 = F('fixação', T.depois); T.passei = F('Passei'); T.hhmm = F('1', T.passei); T.durar = F('durar'); T.hoje = F('hoje');
console.log(Object.entries(T).map(([k, v]) => `${k}=${v}`).join(' '));

// ---------- SFX ----------
const FFM = path.join(__dirname, '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const DUR = {};
const durOf = f => { if (DUR[f]) return DUR[f]; let out = ''; try { execFileSync(FFM, ['-i', path.join(HF, 'assets/audio', f + '.mp3')], { stdio: 'pipe' }); } catch (e) { out = String(e.stderr); }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/); return (DUR[f] = m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : 1); };
const sfx = [];
const S = (file, at, vol = 0.35, maxd = 99) => sfx.push(`<audio id="sfx-${sfx.length}" class="clip" src="assets/audio/${file}.mp3" data-start="${Math.max(0, at).toFixed(3)}" data-duration="${Math.min(durOf(file), maxd, END - Math.max(0, at)).toFixed(3)}" data-track-index="${4 + (sfx.length % 6)}" data-volume="${vol}"></audio>`);

// ---------- GSAP helpers ----------
const L = []; const HID = [];
const pop = (sel, t, from = 0.6) => { HID.push(sel); L.push(`tl.fromTo("${sel}",{opacity:0,scale:${from},y:24},{opacity:1,scale:1,y:0,duration:0.38,ease:"back.out(2.2)",immediateRender:false},${t.toFixed(3)});`); };
const slideDown = (sel, t) => { HID.push(sel); L.push(`tl.fromTo("${sel}",{opacity:0,y:-60},{opacity:1,y:0,duration:0.45,ease:"power3.out",immediateRender:false},${t.toFixed(3)});`); };
const out = (sel, t, d = 0.3) => L.push(`tl.to("${sel}",{opacity:0,y:-30,duration:${d},ease:"power2.in"},${t.toFixed(3)});`);
const stamp = (sel, t, rot = -8) => { HID.push(sel); L.push(`tl.fromTo("${sel}",{opacity:0,scale:2.2,rotation:${rot - 10}},{opacity:1,scale:1,rotation:${rot},duration:0.28,ease:"power4.in",immediateRender:false},${t.toFixed(3)});`); };
// glitch: camadas Menta/Rosa saltam pros lados em degraus + o bloco treme
const glitch = (t, d = 0.5) => {
  const n = Math.round(d / 0.05);
  for (let i = 0; i < n; i++) {
    const tt = (t + i * 0.05).toFixed(3), a = ((i * 37) % 23) - 11, b = ((i * 53) % 19) - 9, c = ((i * 29) % 9) - 4;
    L.push(`tl.set(".gl-a",{x:${a},y:${c}},${tt});tl.set(".gl-b",{x:${-b},y:${-c}},${tt});tl.set(".gl-main",{x:${c},skewX:${i % 3 === 0 ? 8 : 0}},${tt});`);
  }
  const te = (t + n * 0.05).toFixed(3);
  L.push(`tl.set(".gl-a",{x:-5,y:0},${te});tl.set(".gl-b",{x:5,y:0},${te});tl.set(".gl-main",{x:0,skewX:0},${te});`);
};

const M = [];
const abs = (id, l, t, w, h, inner, extra = '') => `<div id="${id}" class="abs" style="left:${Math.round(l)}px;top:${Math.round(t)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;${extra}">${inner}</div>`;
const chip = (id, l, t, w, h, txt, bg, fg = INK, fs = 36, extra = '') => M.push(abs(id, l, t, w, h, `<div class="chip" style="background:${bg};color:${fg};font-size:${fs}px">${txt}</div>`, 'transform-origin:50% 50%;' + extra));
const CONTORNO = `box-shadow:0 0 0 2px ${CREME},6px 8px 0 rgba(10,31,35,.55)`; // Cedro/Pimenta sobre petróleo: contorno creme 2 px

// ---------- ícones (SVG) ----------
const ic = {
  flagID: (w = 58) => `<svg viewBox="0 0 60 40" width="${w}" height="${Math.round(w * 2 / 3)}"><clipPath id="fc${w}"><rect x="2" y="2" width="56" height="36" rx="6"/></clipPath><g clip-path="url(#fc${w})"><rect x="0" y="0" width="60" height="20" fill="${ID_VERM}"/><rect x="0" y="20" width="60" height="20" fill="${ID_BRANCO}"/></g><rect x="2" y="2" width="56" height="36" rx="6" fill="none" stroke="${INK}" stroke-width="4"/></svg>`,
  x: (c = PIM) => `<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="18" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M13 13l14 14M27 13L13 27" stroke="${CREME}" stroke-width="5" stroke-linecap="round"/></svg>`,
  ok: (c = YEL) => `<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="18" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M11 21l6 6 12-13" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sol: `<svg viewBox="0 0 48 48" width="42" height="42"><circle cx="24" cy="24" r="10" fill="${YEL}" stroke="${INK}" stroke-width="4"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M24 4v6" stroke="${INK}" stroke-width="4" stroke-linecap="round" transform="rotate(${a} 24 24)"/>`).join('')}</svg>`,
  lua: `<svg viewBox="0 0 44 44" width="38" height="38"><path d="M30 6a17 17 0 1 0 8 26A14 14 0 0 1 30 6z" fill="${CREME}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  brilho: `<svg viewBox="0 0 40 40" width="34" height="34"><path d="M20 2l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="${YEL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  relogio: `<svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="18" fill="${CREME}" stroke="${INK}" stroke-width="4"/><path d="M22 11v12l8 5" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  caixa: `<svg viewBox="0 0 48 44" width="42" height="38"><path d="M4 14l20-10 20 10v20L24 42 4 34z" fill="${CEDRO}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M4 14l20 10 20-10M24 24v18" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  fumaca: `<svg viewBox="0 0 44 44" width="40" height="40"><path d="M14 40c-6-6 6-10 0-16s6-10 0-18M26 40c-6-6 6-10 0-16s6-10 0-18" fill="none" stroke="${CREME}" stroke-width="5" stroke-linecap="round"/></svg>`,
  balanca: `<svg viewBox="0 0 48 44" width="44" height="40"><path d="M24 6v32M12 40h24M8 12h32" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M8 12l-6 14h12zM40 12l-6 14h12z" fill="${CREME}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  spray: `<svg viewBox="0 0 48 44" width="44" height="40"><rect x="22" y="16" width="20" height="26" rx="5" fill="${MENTA}" stroke="${INK}" stroke-width="4"/><rect x="26" y="6" width="12" height="10" rx="2" fill="${CREME}" stroke="${INK}" stroke-width="4"/>${[[14, 8], [8, 12], [14, 16], [4, 6], [6, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`).join('')}</svg>`,
  lupa: `<svg viewBox="0 0 44 44" width="38" height="38"><circle cx="18" cy="18" r="12" fill="${CREME}" stroke="${INK}" stroke-width="4"/><path d="M27 27l12 12" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg>`,
  coracao: `<svg viewBox="0 0 44 40" width="38" height="34"><path d="M22 37S4 26 4 14a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z" fill="${ROSA}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`,
};
// abacaxi desenhado (nota frutada) — sem foto de banco
const ABACAXI = `<svg viewBox="0 0 120 170" width="120" height="170">
  <path d="M60 60 C50 40 40 30 30 26 C46 30 54 38 58 50 C56 30 52 16 44 6 C60 16 64 32 62 50 C68 34 78 24 92 20 C80 30 72 42 68 60 Z" fill="${BERG}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="60" cy="112" rx="38" ry="50" fill="${AMB}" stroke="${INK}" stroke-width="5"/>
  <path d="M30 86 L90 146 M24 112 L72 160 M42 70 L96 124 M90 86 L30 146 M96 112 L48 160 M78 70 L24 124" stroke="${INK}" stroke-width="3.5" opacity=".55"/>
</svg>`;

// ================= ABERTURA: GLITCH — vale o frasco? (visível no 1º quadro = capa) =================
M.push(abs('ab', 90, 110, 900, 300, `<div class="card col" style="gap:14px">
  <div class="glw"><div class="gl gl-a">GLITCH</div><div class="gl gl-b">GLITCH</div><div class="gl gl-main">GLITCH</div></div>
  <div class="ab2">VALE O <span style="color:${YEL}">FRASCO?</span></div></div>`));
L.push(`tl.fromTo("#ab",{scale:1.06},{scale:1,duration:0.5,ease:"back.out(2)"},0);`);
L.push(`tl.set(".gl-a",{x:-5},0);tl.set(".gl-b",{x:5},0);`);
glitch(0.05, 0.55); S('glitch_digital', 0.0, 0.45);
glitch(T.glitch - 0.05, 0.6); S('glitch_digital', T.glitch - 0.1, 0.4);
// Mykonos → bandeira da Indonésia
chip('myk', 250, 432, 580, 92, `${ic.flagID(66)}&nbsp;&nbsp;MYKONOS`, CREME, INK, 50);
pop('#myk', T.myk - 0.08); S('whoosh_rapido', T.myk - 0.25, 0.35); S('pop_leve', T.myk - 0.05, 0.35);
chip('indo', 50, 540, 480, 62, 'PERFUME DA INDONÉSIA', ALG, INK, 29); pop('#indo', T.indo - 0.08); S('pop_leve', T.indo - 0.05, 0.3);
chip('hyp', 550, 540, 480, 62, `${ic.brilho}&nbsp;HYPADO LÁ FORA`, YEL, INK, 29); pop('#hyp', T.hyp - 0.08); S('shine_brilho', T.hyp - 0.1, 0.3);
out('#myk, #indo, #hyp', T.vale - 1.0);
glitch(T.vale - 0.1, 0.4); S('glitch_digital', T.vale - 0.15, 0.3);
out('#ab', T.vamos + 0.6);

// ================= "dizem que parece com..." =================
M.push(abs('diz', 240, 300, 600, 44, `<div class="rot">DIZEM QUE PARECE COM:</div>`)); pop('#diz', T.dizem - 0.05);
chip('cav', 120, 356, 840, 92, `${ic.fumaca}&nbsp;CREED AVENTUS ABSOLU`, PIM, CREME, 46, CONTORNO);
pop('#cav', T.aventus - 0.1); S('whoosh_suave', T.aventus - 0.3, 0.35); S('ding_acerto', T.absolu, 0.3);
out('#diz, #cav', T.absolu + 2.2);
chip('tudo', 250, 330, 580, 80, `${ic.lupa}&nbsp;SERÁ QUE É TUDO ISSO?`, CREME, INK, 36); pop('#tudo', T.ver - 0.05); S('pop_leve', T.ver - 0.05, 0.35);
out('#tudo', T.dificil - 0.5);

// ================= tirando da caixa =================
chip('dif', 230, 320, 620, 84, `${ic.caixa}&nbsp;DIFÍCIL DE TIRAR`, ALG, INK, 40); pop('#dif', T.dificil - 0.1); S('pop_leve', T.dificil - 0.1, 0.35);
out('#dif', T.hora - 0.45);
chip('hora', 250, 310, 580, 104, `${ic.relogio}&nbsp;1 HORA DEPOIS…`, YEL, INK, 50);
stamp('#hora', T.hora - 0.45, -4); S('relogio_tique', T.hora - 0.5, 0.35, 1.2); S('carimbo', T.hora - 0.2, 0.35);
out('#hora', T.olha - 0.25);
chip('olha', 230, 320, 620, 84, `${ic.brilho}&nbsp;OLHA ESSE FRASCO`, MENTA, INK, 42); pop('#olha', T.olha - 0.05); S('shine_brilho', T.olha - 0.05, 0.4);
out('#olha', T.agora - 0.3);
chip('imp', 160, 320, 760, 96, `${ic.coracao}&nbsp;A PARTE QUE IMPORTA: O CHEIRO`, ROSA, INK, 36);
stamp('#imp', T.cheiro - 0.1, -3); S('carimbo', T.cheiro + 0.05, 0.35);
out('#imp', T.cheiro + 3.0);
chip('borr1', 230, 320, 620, 84, `${ic.spray}&nbsp;OLHA ESSE BORRIFADOR`, MENTA, INK, 38); pop('#borr1', T.borr1 - 0.1); S('pop_leve', T.borr1 - 0.1, 0.35);
out('#borr1', T.borr1 + 3.0);

// ================= notas e comparações =================
M.push(abs('nab', 400, 260, 280, 300, `<div class="nota"><div class="nimg" style="background:radial-gradient(circle at 50% 42%, ${CREME} 0%, ${BERG} 72%)">${ABACAXI}</div><div class="nlab">ABACAXI</div></div>`, 'transform-origin:50% 80%'));
pop('#nab', T.abacaxi - 0.1); S('pop_leve', T.abacaxi - 0.1, 0.4); S('ding_acerto', T.abacaxi + 0.15, 0.3);
L.push(`tl.to("#nab",{y:-8,duration:1.1,ease:"sine.inOut",yoyo:true,repeat:1},${(T.abacaxi + 0.4).toFixed(3)});`);
out('#nab', T.gente - 0.3);
M.push(abs('lem', 240, 300, 600, 44, `<div class="rot">TÁ ME LEMBRANDO:</div>`)); pop('#lem', T.lembrando - 0.1);
chip('hac', 120, 356, 400, 92, `HACIVAT`, CEDRO, CREME, 46, CONTORNO); pop('#hac', T.haci - 0.08); S('pop_leve', T.haci - 0.08, 0.4);
M.push(abs('hacm', 120, 456, 400, 36, `<div class="rot" style="font-size:28px">NISHANE</div>`)); pop('#hacm', T.haci + 0.3);
chip('cab', 560, 356, 400, 92, `CREED ABSOLU`, PIM, CREME, 42, CONTORNO); pop('#cab', T.creed2 - 0.08); S('pop_leve', T.creed2 - 0.08, 0.4);
out('#lem, #hac, #hacm, #cab', T.conf - 0.6);
const lista = [['conf', `${ic.ok(BERG)}&nbsp;MAIS CONFORTÁVEL`, T.conf - 0.4, CREME, INK],
  ['abs', `${ic.ok(BERG)}&nbsp;ABACAXI MAIS SUAVE`, T.abac2 - 0.1, CREME, INK],
  ['esf', `${ic.balanca}&nbsp;ESFUMAÇADO EQUILIBRADO`, T.equil - 0.5, CEDRO, CREME]];
lista.forEach(([k, txt, t, bg, fg], i) => {
  chip(k, 150, 300 + i * 96, 780, 82, txt, bg, fg, 36, bg === CEDRO ? CONTORNO : '');
  pop('#' + k, t); S(i === 2 ? 'ding_acerto' : 'pop_leve', t, 0.35);
});
out('#conf, #abs, #esf', T.bom - 0.2);

// ================= uso =================
chip('dia', 150, 310, 380, 84, `${ic.sol}&nbsp;DE DIA`, YEL, INK, 44); pop('#dia', T.dia - 0.15); S('shine_brilho', T.dia - 0.15, 0.35);
chip('vers', 550, 310, 380, 84, 'VERSÁTIL', BERG, INK, 44); pop('#vers', T.versatil - 0.08); S('pop_leve', T.versatil - 0.08, 0.4);
chip('hdia', 190, 412, 700, 74, `${ic.lua}&nbsp;HACIVAT: SÓ À NOITE`, PET, CREME, 34, `border-color:${AMB}`); pop('#hdia', T.haci2 - 0.05); S('whoosh_suave', T.haci2 - 0.25, 0.3);
L.push(`tl.to("#hdia",{opacity:0.5,scale:0.92,duration:0.3},${(T.esse - 0.1).toFixed(3)});`);
chip('assin', 270, 500, 540, 92, 'ASSINATURA', YEL, INK, 52); stamp('#assin', T.assin - 0.1, -4); S('carimbo', T.assin + 0.1, 0.4);
out('#dia, #vers, #hdia, #assin', T.assin + 1.6);
chip('borr2', 140, 310, 800, 96, `${ic.spray}&nbsp;O BORRIFADOR IMPRESSIONA`, MENTA, INK, 40);
pop('#borr2', T.borr2 - 0.1); S('plim_brilho_magico', T.borr2 - 0.1, 0.35);
out('#borr2', T.cheiroso - 0.3);
chip('pj', 150, 320, 380, 80, `${ic.lupa}&nbsp;PROJEÇÃO`, ALG, INK, 38); pop('#pj', T.proj - 0.08); S('pop_leve', T.proj - 0.08, 0.35);
chip('fx', 550, 320, 380, 80, `${ic.lupa}&nbsp;FIXAÇÃO`, ALG, INK, 38); pop('#fx', T.fix - 0.08); S('pop_leve', T.fix - 0.08, 0.35);
M.push(abs('emt', 240, 412, 600, 44, `<div class="rot">AINDA EM TESTE</div>`)); pop('#emt', T.fix + 0.4);
out('#pj, #fx, #emt', T.mas2 - 0.1);
chip('jv', 300, 320, 480, 110, 'JÁ VALE!', YEL, INK, 64); stamp('#jv', T.javale - 0.12, -5); S('carimbo', T.javale + 0.05, 0.45);
out('#jv', T.myk2 - 0.35);
// 2ª vez que ela fala Mykonos → bandeira de novo
chip('myk2', 250, 320, 580, 96, `${ic.flagID(66)}&nbsp;&nbsp;MYKONOS`, CREME, INK, 50);
pop('#myk2', T.myk2 - 0.08); S('whoosh_rapido', T.myk2 - 0.25, 0.35); S('pop_leve', T.myk2 - 0.05, 0.35);
chip('indo2', 260, 432, 560, 64, 'PERFUME DA INDONÉSIA', ALG, INK, 32); pop('#indo2', T.indo2 - 0.1); S('pop_leve', T.indo2 - 0.1, 0.3);
out('#myk2, #indo2', T.bonito - 0.6);
chip('bon', 230, 320, 620, 84, `${ic.brilho}&nbsp;QUE FRASCO BONITO`, MENTA, INK, 42); pop('#bon', T.bonito - 0.4); S('shine_brilho', T.bonito - 0.4, 0.4);
out('#bon', T.depois - 0.3);

// ================= teaser PARTE 2 =================
M.push(abs('p2', 110, 110, 860, 250, `<div class="card col" style="gap:10px">
  <div class="p2a">EM BREVE</div>
  <div class="p2b">PARTE <span style="color:${YEL}">2</span></div></div>`));
slideDown('#p2', T.video - 0.2); S('swipe_tela', T.video - 0.3, 0.35);
chip('p2p', 150, 390, 380, 76, 'PROJEÇÃO', ALG, INK, 36); pop('#p2p', T.proj2 - 0.08); S('pop_leve', T.proj2 - 0.08, 0.35);
chip('p2f', 550, 390, 380, 76, 'FIXAÇÃO', ALG, INK, 36); pop('#p2f', T.fix2 - 0.08); S('pop_leve', T.fix2 - 0.08, 0.35);
chip('p2h', 230, 486, 620, 80, `${ic.relogio}&nbsp;PASSEI ÀS 1H50`, YEL, INK, 38); stamp('#p2h', T.hhmm - 0.1, -3); S('relogio_tique', T.hhmm - 0.15, 0.35, 1.4);
out('#p2, #p2p, #p2f, #p2h', FALA - 0.1, 0.25);

// ================= CTA: SEGUE PRA VER A PARTE 2 (tela final congelada) =================
M.unshift(abs('dim', 0, 0, 1080, 1920, '', `background:${NOITE}`));
HID.push('#dim'); L.push(`tl.fromTo("#dim",{opacity:0},{opacity:0.62,duration:0.5,ease:"power2.out",immediateRender:false},${(FALA - 0.1).toFixed(3)});`);
M.push(abs('fol', 90, 330, 900, 360, `<div class="card col" style="gap:12px">
  <div class="fol1">QUER VER A</div>
  <div class="fol2">PARTE 2?</div>
  <div class="fol3">me segue pra ver a projeção<br>e a fixação do Glitch</div></div>`));
slideDown('#fol', FALA); S('whoosh_rapido', FALA - 0.15, 0.4);
glitch(FALA + 0.1, 0.35); S('glitch_digital', FALA + 0.05, 0.3);
M.push(abs('btn', 290, 730, 500, 104, `<div class="btn"><span class="b1">+ ME SEGUE</span><span class="b2">${ic.ok(CREME)}&nbsp;SEGUINDO</span></div>`, 'transform-origin:50% 50%'));
pop('#btn', FALA + 0.5); S('pop_leve', FALA + 0.5, 0.4);
L.push(`tl.set(".b2",{display:"none"},0);`);
const CL = FALA + 1.5;
L.push(`tl.to("#btn",{scale:0.88,duration:0.1,ease:"power2.in"},${CL.toFixed(3)});`);
L.push(`tl.set(".b1",{display:"none"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.set(".b2",{display:"flex"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.set(".btn",{backgroundColor:"${PET}",color:"${CREME}",borderColor:"${AMB}"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.to("#btn",{scale:1,duration:0.35,ease:"back.out(3)"},${(CL + 0.1).toFixed(3)});`);
S('click_ui', CL, 0.5); S('ding_notificacao', CL + 0.15, 0.45);
M.push(abs('handle', 290, 858, 500, 50, `<div class="handle">@valotaparfum</div>`)); pop('#handle', FALA + 0.8);

// ---------- CSS ----------
const FONT = `@font-face{font-family:"Montserrat";src:url("../assets/fonts/Montserrat.ttf");font-weight:100 900}@font-face{font-family:"Gotham";src:url("../assets/fonts/GothamBlack.otf");font-weight:900}`;
const CSS = `${FONT}
#root{position:absolute;inset:0;overflow:hidden;font-family:"Montserrat",sans-serif}
.abs{position:absolute}
.card{width:100%;height:100%;background:radial-gradient(ellipse 90% 120% at 30% 40%, ${LUZ} 0%, ${PET} 60%, ${NOITE} 100%);border-radius:30px;box-shadow:0 14px 40px rgba(10,31,35,.55);border-bottom:6px solid ${AMB};display:flex}
.col{flex-direction:column;align-items:center;justify-content:center;text-align:center}
.glw{position:relative;height:140px;width:100%}
.gl{position:absolute;left:0;right:0;top:0;text-align:center;font-family:"Gotham",sans-serif;font-weight:900;font-size:140px;line-height:1;letter-spacing:.04em;white-space:nowrap}
.gl-a{color:${MENTA};mix-blend-mode:screen;opacity:.9}
.gl-b{color:${ROSA};mix-blend-mode:screen;opacity:.9}
.gl-main{color:${CREME}}
.ab2{font-family:"Montserrat",sans-serif;font-weight:900;font-size:68px;line-height:1.05;color:${CREME};letter-spacing:.02em;white-space:nowrap}
.chip{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:999px;font-weight:900;letter-spacing:.02em;white-space:nowrap;border:5px solid ${INK};box-shadow:6px 8px 0 rgba(10,31,35,.55)}
.chip svg{flex:none}
.rot{width:100%;text-align:center;font-weight:900;font-size:32px;letter-spacing:.08em;color:${CREME};-webkit-text-stroke:9px ${INK};paint-order:stroke fill}
.nota{width:100%;height:100%;display:flex;flex-direction:column;align-items:center}
.nimg{width:240px;height:240px;border-radius:28px;border:5px solid ${INK};display:flex;align-items:center;justify-content:center;box-shadow:8px 10px 0 rgba(10,31,35,.5);overflow:hidden}
.nlab{margin-top:-22px;padding:4px 18px;border-radius:999px;background:${INK};color:${CREME};font-weight:900;font-size:32px;letter-spacing:.02em;border:4px solid ${CREME};white-space:nowrap}
.p2a{font-weight:800;font-size:34px;letter-spacing:.3em;color:${CREME};opacity:.9}
.p2b{font-family:"Gotham",sans-serif;font-weight:900;font-size:110px;color:${CREME};line-height:1}
.fol1{font-weight:900;font-size:48px;color:${CREME};line-height:1;letter-spacing:.04em}
.fol2{font-family:"Gotham",sans-serif;font-weight:900;font-size:110px;color:${YEL};line-height:1}
.fol3{font-weight:800;font-size:32px;color:${CREME};line-height:1.2;padding:0 40px}
.btn{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:999px;background:${YEL};color:${INK};border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Gotham",sans-serif;font-weight:900;font-size:50px;letter-spacing:.03em;white-space:nowrap}
.btn span{display:flex;align-items:center;justify-content:center}
.handle{width:100%;text-align:center;font-weight:800;font-size:38px;letter-spacing:.12em;color:${CREME};-webkit-text-stroke:8px ${INK};paint-order:stroke fill}
`;

fs.mkdirSync(path.join(HF, 'compositions'), { recursive: true });
fs.writeFileSync(path.join(HF, 'compositions', 'graficos.html'), `<template>
<style>${CSS}</style>
<div id="root" data-composition-id="graficos" data-width="1080" data-height="1920" data-layout-allow-overlap data-layout-allow-overflow>
${M.join('\n')}
</div>
<script>
(function(){
  window.__timelines = window.__timelines || {};
  gsap.set(${JSON.stringify([...new Set(HID)].join(','))},{opacity:0});
  const tl = gsap.timeline({ paused: true });
  ${L.join('\n  ')}
  window.__timelines["graficos"] = tl;
})();
</script>
</template>`);

// ================= LEGENDAS (mesmo estilo dos vídeos anteriores) =================
const toks = [];
W.forEach(w => {
  const raw = w.word.replace(/[.,:;!?…]+$/, '').toUpperCase();
  const FIX = { 'BONFADOR': 'BORRIFADOR', 'BONIFADOR': 'BORRIFADOR', '1H50': '1H50' };
  toks.push({ ...w, txt: FIX[raw] || raw, pont: /[.,:!?…]$/.test(w.word) });
});
const ENF = /^(GLITCH|MYKONOS|INDONÉSIA|HYPADO|FRASCO|VIRALIZADO|AVENTUS|CREED|ABSOLU|DIFÍCIL|HORA|CHEIRO|BORRIFADOR|ABACAXI|HACIVAT|NISHANE|CONFORTÁVEL|ESFUMAÇADO|EQUILIBRADO|BOM|DIA|VERSÁTIL|ASSINATURA|IMPRESSIONADA|CHEIROSO|PROJEÇÃO|FIXAÇÃO|VALE|BONITO|VÍDEO|1H50|DURAR|HOJE)$/;
const groups = []; let cur = [];
toks.forEach((w, i) => { cur.push(i); const nx = toks[i + 1]; const pausa = nx && nx.start - w.end > 0.6;
  if (cur.length >= 3 || w.pont || pausa) { groups.push(cur); cur = []; } });
if (cur.length) groups.push(cur);
const faceY1 = (a, b) => { let m = 0; for (const r of ROSTO) if (r[0] >= a - 0.3 && r[0] <= b + 0.3 && r[4] > m) m = r[4]; return m; };
const capEls = groups.map((g, gi) => {
  const st = toks[g[0]].start; const next = groups[gi + 1]; const en = next ? toks[next[0]].start : FALA;
  const dur = Math.max(0.2, Math.min(en, toks[g[g.length - 1]].end + 0.35, FALA) - st);
  const top = Math.round(Math.min(1500, Math.max(1250, faceY1(st, st + dur) + 36)));
  const words = g.map(i => `<span style="color:${ENF.test(toks[i].txt) ? YEL : CREME}">${toks[i].txt}</span>`).join(' ');
  return `<div id="cap${gi}" class="clip cap" style="top:${top}px" data-start="${st.toFixed(3)}" data-duration="${dur.toFixed(3)}" data-track-index="1">${words}</div>`;
});
fs.writeFileSync(path.join(HF, 'compositions', 'captions.html'), `<template>
<style>
${FONT}
#root{position:absolute;inset:0}
.cap{position:absolute;left:40px;width:1000px;text-align:center;font-family:"Montserrat",sans-serif;font-weight:900;font-size:62px;white-space:nowrap;line-height:1.08;letter-spacing:-.005em;-webkit-text-stroke:13px ${INK};paint-order:stroke fill;text-shadow:0 8px 0 rgba(10,31,35,.6)}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-no-timeline>
${capEls.join('\n')}
</div>
</template>`);

// ================= INDEX =================
const GRADE = fs.readFileSync(path.join(__dirname, '../v14-checkup-avatar/grade_attr.txt'), 'utf8').trim();
fs.writeFileSync(path.join(HF, 'index.html'), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
:root{--ground:${PET};--ink:${CREME}}
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:var(--ground)}
#root{position:relative;width:100%;height:100%}
#base{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${END}" data-width="1080" data-height="1920">
<video id="base" class="clip" src="assets/video/base_fim.mp4" data-start="0" data-duration="${END}" data-track-index="0" playsinline muted data-has-audio="false" ${GRADE}></video>
<div id="graficos" data-composition-id="graficos" data-composition-src="compositions/graficos.html" data-start="0" data-duration="${END}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:20"></div>
<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${END}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50" data-no-timeline></div>
<audio id="voz" class="clip" src="assets/audio/voz.mp3" data-start="0" data-duration="${Math.min(FALA, 163.4)}" data-track-index="10" data-volume="1"></audio>
${sfx.join('\n')}
</div>
<script>
window.__timelines = window.__timelines || {};
window.__timelines["main"] = gsap.timeline({ paused: true });
</script>
</body>
</html>`);
console.log('ok · FALA', FALA, '· END', END, '· legendas', groups.length, '· sfx', sfx.length, '· elementos', M.length);

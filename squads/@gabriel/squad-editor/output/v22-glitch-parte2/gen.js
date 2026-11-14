// v22 — "GLITCH PARTE 2 · VALE O FRASCO?" (veredito do Glitch, Mykonos). Bruto: ~/Downloads/vale.MOV (gravado pela Osiany).
// Base = cortado.mp4 (só a pausa de 1,5 s e o "E aí" do fim saíram; momentos mostrando frasco/caixa preservados) + último quadro congelado pro CTA de seguir.
// Áudio limpo (highpass 75 Hz + afftdn leve) e normalizado em -14 LUFS. Sem trilha: só voz + SFX.
// Paleta 50/50: base Petróleo/Creme (chamada, legenda, CTA) + cores de família (Menta = tampa do Glitch, Bergamota, Âmbar).
// Fontes: Montserrat 800/900 + Gotham Black. Mesmo padrão do v19. Rodar: node gen.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const HF = path.join(__dirname, 'hf');
const W = require('./audio/cortado.json');
const ROSTO = require('./rosto.json'); // [t, x0, y0, x1, y1] a cada 0,25 s (1080x1920)
const FALA = 29.3;             // fim do cortado.mp4
const END = 32.8;              // +3,5 s de tela final (último quadro congelado) pro CTA de seguir

// ---------- paleta oficial Valota Parfum ----------
const PET = '#0F2E33', NOITE = '#0A1F23', LUZ = '#1A4A52', CREME = '#F2E8D8', AMB = '#D49A4E', YEL = '#FFC93C';
const CEDRO = '#6B4430', BERG = '#B8BC5C', MENTA = '#7DBFB3', ROSA = '#E6AEB9', PIM = '#9C452A', ALG = '#DCD6E2';
const INK = NOITE;

// ---------- TEMPLATE DE VEREDITO (só troca esta linha) ----------
// 'vale' = selo AMARELO "VALE O FRASCO" · 'nao' = selo PIMENTA (vermelho da paleta) "NÃO VALE O FRASCO"
const VEREDITO = 'vale';
const VD = VEREDITO === 'vale'
  ? { bg: `radial-gradient(circle at 50% 40%, ${YEL} 0%, ${YEL} 62%, ${AMB} 100%)`, fg: INK, chipBg: YEL, chipFg: INK, txt: 'VALE O<br>FRASCO', chip: 'VALE O FRASCO', s2: 1 }
  : { bg: `radial-gradient(circle at 50% 40%, #B85636 0%, ${PIM} 62%, #6E2E1B 100%)`, fg: CREME, chipBg: PIM, chipFg: CREME, txt: 'NÃO VALE<br>O FRASCO', chip: 'NÃO VALE O FRASCO', s2: 0.8 };
const seloHTML = (cls = '') => `<div class="selo ${cls}"><div class="s1">SELO</div><div class="s2">${VD.txt}</div><div class="s3" data-layout-ignore>VALOTA PARFUM</div></div>`;

const F = (txt, depois = 0) => {
  const re = new RegExp('^' + txt, 'i');
  const w = W.find(x => x.start >= depois && re.test(x.word.replace(/[.,!?…]/g, '')));
  if (!w) throw new Error('palavra não achada: ' + txt + ' depois de ' + depois);
  return w.start;
};

// ---------- tempos ----------
const T = {};
T.ver = F('veredito'); T.extrato = F('extrato'); T.isso = F('Isso'); T.tudo = F('tudo');
T.ficou = F('ficou'); T.ate = F('até'); T.noite = F('noite'); T.pele = F('pele'); T.nocao = F('noção');
T.nove = F('9'); T.fix = F('fixação'); T.proj = F('projeção'); T.dois = F('2', T.proj); T.meia = F('meia');
T.vamos = F('vamos'); T.ver2 = F('veredito', T.vamos); T.vale = F('Vale', T.ver2); T.frasco = F('frasco', T.vale);
T.myk = F('Mykonos'); T.marca = F('marca'); T.glitch = F('Glitch'); T.caixa = F('caixinha');
T.selo = F('selo'); T.vale2 = F('Vale', T.selo); T.frasco2 = F('frasco', T.vale2);
console.log(Object.entries(T).map(([k, v]) => `${k}=${v}`).join(' '));

// ---------- SFX ----------
const FFM = process.env.FF || path.join(__dirname, '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
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
const shake = (sel, t) => L.push(`tl.fromTo("${sel}",{x:-10},{x:0,duration:0.32,ease:"elastic.out(1.2,0.25)"},${t.toFixed(3)});`);
// efeito glitch (desloca o texto em saltos, sem tween suave)
const glitch = (sel, t, n = 7) => { const xs = [-14, 10, -6, 16, -10, 4, 0]; for (let i = 0; i < n; i++) L.push(`tl.set("${sel}",{x:${xs[i % xs.length]},skewX:${i % 2 ? 6 : -4}},${(t + i * 0.045).toFixed(3)});`); L.push(`tl.set("${sel}",{x:0,skewX:0},${(t + n * 0.045).toFixed(3)});`); };

const M = [];
const abs = (id, l, t, w, h, inner, extra = '') => `<div id="${id}" class="abs" style="left:${Math.round(l)}px;top:${Math.round(t)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;${extra}">${inner}</div>`;
const chip = (id, l, t, w, h, txt, bg, fg = INK, fs = 36, extra = '') => M.push(abs(id, l, t, w, h, `<div class="chip" style="background:${bg};color:${fg};font-size:${fs}px">${txt}</div>`, 'transform-origin:50% 50%;' + extra));

// ---------- ícones (SVG) ----------
const ic = {
  ok: (c = YEL) => `<svg viewBox="0 0 40 40" width="34" height="34"><circle cx="20" cy="20" r="18" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M11 21l6 6 12-13" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lua: `<svg viewBox="0 0 44 44" width="38" height="38"><path d="M30 6a17 17 0 1 0 8 26A14 14 0 0 1 30 6z" fill="${CREME}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  brilho: `<svg viewBox="0 0 40 40" width="34" height="34"><path d="M20 2l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="${YEL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  relogio: (c = CREME) => `<svg viewBox="0 0 44 44" width="40" height="40"><circle cx="22" cy="22" r="18" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M22 11v12l8 5" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`,
  ondas: `<svg viewBox="0 0 48 40" width="44" height="36"><circle cx="10" cy="20" r="6" fill="${INK}"/><path d="M20 10a14 14 0 0 1 0 20M28 5a22 22 0 0 1 0 30M36 1a29 29 0 0 1 0 38" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`,
  gota: `<svg viewBox="0 0 36 44" width="30" height="38"><path d="M18 3C12 13 5 20 5 28a13 13 0 0 0 26 0c0-8-7-15-13-25z" fill="${CREME}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  martelo: `<svg viewBox="0 0 44 44" width="40" height="40"><rect x="6" y="8" width="22" height="12" rx="3" transform="rotate(-35 17 14)" fill="${CEDRO}" stroke="${INK}" stroke-width="4"/><path d="M20 20l16 16" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></svg>`,
  caixa: `<svg viewBox="0 0 44 44" width="38" height="38"><path d="M6 14l16-8 16 8v18l-16 8-16-8z" fill="${CEDRO}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M6 14l16 8 16-8M22 22v18" fill="none" stroke="${INK}" stroke-width="4"/></svg>`,
  seta: `<svg viewBox="0 0 40 24" width="40" height="24"><path d="M2 12h30M24 4l10 8-10 8" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// ================= GANCHO: "GLITCH PARTE 2 · VALE O FRASCO?" (visível já no 1º quadro = capa) =================
// Gancho + SELO do veredito ficam PRESOS desde o 1º quadro até a entrada do "9H" (~9,5 s).
// Selo na lateral direita, ao lado da cabeça (parede/quadro): não cobre rosto, gancho, chips nem legenda.
const GANCHO_ATE = T.nove - 0.35;
M.push(abs('ab', 70, 110, 940, 250, `<div class="card col" style="gap:8px">
  <div class="ab1row"><span class="glt">GLITCH</span><span class="pt2">PARTE 2</span></div>
  <div class="ab2">VALE O <span style="color:${YEL}">FRASCO?</span></div></div>`));
L.push(`tl.fromTo("#ab",{scale:1.06},{scale:1,duration:0.5,ease:"back.out(2)"},0);`);
glitch('.glt', 0.05); glitch('.glt', 1.25, 5);
S('glitch_digital', 0.0, 0.35, 1.2); S('impact_grave', 0.0, 0.35);
M.push(abs('seloA', 846, 560, 220, 220, seloHTML('mini'), 'transform-origin:50% 50%'));
L.push(`tl.fromTo("#seloA",{scale:1.08,rotation:-8},{scale:1,rotation:-8,duration:0.5,ease:"back.out(2)"},0);`);
L.push(`tl.fromTo("#seloA",{scale:1},{scale:1.06,duration:0.18,yoyo:true,repeat:1,ease:"power1.inOut"},${(T.ver + 0.05).toFixed(3)});`);
S('shine_brilho', T.ver + 0.05, 0.25);
// chips do início descem pra baixo do gancho (y ≥ 380) enquanto ele está na tela
chip('verd', 290, 382, 500, 80, `${ic.martelo}&nbsp;O VEREDITO`, CREME, INK, 40);
stamp('#verd', T.ver - 0.05, -3); S('martelo_juiz', T.ver + 0.1, 0.4);
out('#verd', T.extrato - 0.4);
out('#ab, #seloA', GANCHO_ATE);

// ================= EXTRATO =================
chip('ext', 190, 380, 700, 86, `${ic.gota}&nbsp;EXTRATO DE PERFUME`, AMB, INK, 44);
stamp('#ext', T.extrato - 0.1, -3); S('carimbo', T.extrato + 0.05, 0.4);
chip('expl', 280, 478, 520, 66, `${ic.ok()}&nbsp;ISSO EXPLICA TUDO`, CREME, INK, 32);
pop('#expl', T.isso - 0.05); S('ding_acerto', T.tudo, 0.35);
out('#ext, #expl', T.ficou - 0.35);

// ================= ATÉ AS 22H NA PELE =================
chip('n22', 150, 380, 780, 86, `${ic.lua}&nbsp;ATÉ AS 22H NA MINHA PELE`, PET, CREME, 40, `--b:${AMB}`);
pop('#n22', T.ate - 0.1); S('whoosh_suave', T.ate - 0.3, 0.3); S('relogio_tique', T.noite, 0.3, 1.6);
chip('noc', 330, 478, 420, 70, 'TEM NOÇÃO?', YEL, INK, 38);
stamp('#noc', T.nocao - 0.25, -4); S('pop_leve', T.nocao - 0.25, 0.4);
out('#n22, #noc', T.nove - 0.35);

// ================= 9 HORAS DE FIXAÇÃO =================
M.push(abs('fix', 190, 290, 700, 230, `<div class="stat" style="background:${BERG};color:${INK}">
  ${ic.relogio(CREME).replace('width="40" height="40"', 'width="96" height="96"')}
  <div class="scol"><div class="big"><span class="cnt">${[1,2,3,4,5,6,7,8,9].map(i => `<span class="d" id="d${i}">${i}</span>`).join('')}</span>H</div><div class="lab">DE FIXAÇÃO</div></div></div>`, 'transform-origin:50% 50%'));
pop('#fix', T.nove - 0.15, 0.5); S('caixa_registradora', T.fix, 0.35);
// contador 1 → 9 (dígitos empilhados trocados com tl.set: determinístico no render)
L.push(`tl.set("#fix .d",{opacity:0},0);`); L.push(`tl.set("#d1",{opacity:1},0);`);
for (let i = 2; i <= 9; i++) { const t = (T.nove - 0.15 + (i - 1) * 0.045).toFixed(3); L.push(`tl.set("#d${i - 1}",{opacity:0},${t});`); L.push(`tl.set("#d${i}",{opacity:1},${t});`); }
shake('#fix', T.fix);
out('#fix', T.proj - 0.35);

// ================= PROJEÇÃO 2H A 2H30 =================
M.push(abs('prj', 190, 290, 700, 230, `<div class="stat" style="background:${MENTA};color:${INK}">
  ${ic.ondas.replace('width="44" height="36"', 'width="104" height="86"')}
  <div class="scol"><div class="lab">PROJEÇÃO</div><div class="big2">2H A 2H30</div></div></div>`, 'transform-origin:50% 50%'));
pop('#prj', T.proj - 0.1, 0.5); S('whoosh_rapido', T.proj - 0.25, 0.35);
L.push(`tl.set(".big2",{opacity:0},0);`);
L.push(`tl.fromTo(".big2",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.32,ease:"back.out(2.5)",immediateRender:false},${(T.dois - 0.05).toFixed(3)});`);
S('ding_acerto', T.meia, 0.35);
out('#prj', T.vamos - 0.3);

// ================= E O VEREDITO É... =================
chip('evd', 240, 330, 600, 90, `${ic.martelo}&nbsp;E O VEREDITO É…`, CREME, INK, 44);
pop('#evd', T.vamos - 0.05); S('suspense_dun', T.ver2, 0.4);
out('#evd', T.vale - 0.2, 0.18);

// ================= VALE O FRASCO =================
chip('vf', VEREDITO === 'vale' ? 170 : 90, 300, VEREDITO === 'vale' ? 740 : 900, 130, `${VEREDITO === 'vale' ? ic.ok(BERG).replace('width="34" height="34"', 'width="70" height="70"') + '&nbsp;' : ''}${VD.chip}`, VD.chipBg, VD.chipFg, VEREDITO === 'vale' ? 72 : 64);
stamp('#vf', T.vale - 0.12, -5); S('carimbo', T.vale + 0.05, 0.45); S('vidro_tilintar', T.frasco, 0.45); S('plim_brilho_magico', T.frasco + 0.2, 0.3);
out('#vf', T.myk - 0.3);

// ================= CARTELA: GLITCH · MYKONOS (Menta, cor da tampa) =================
M.push(abs('pc', 120, 110, 840, 170, `<div class="pcard col" style="background:${MENTA};color:${INK}">
  <div class="nome">Glitch</div><div class="marca">MYKONOS · EXTRATO</div></div>`));
slideDown('#pc', T.myk - 0.1); S('whoosh_rapido', T.myk - 0.28, 0.35);
glitch('#pc .nome', T.glitch - 0.05, 6); S('glitch_digital', T.glitch - 0.05, 0.25, 0.5);
chip('cx', 300, 310, 480, 76, `${ic.caixa}&nbsp;A CAIXINHA`, CREME, INK, 38);
pop('#cx', T.caixa - 0.25); S('pop_leve', T.caixa - 0.25, 0.4);
out('#cx', T.selo - 0.45);

// ================= SELO DO VEREDITO (mesmo desenho do selo da capa) =================
M.push(abs('selo', 50, 300, 330, 330, seloHTML(), 'transform-origin:50% 50%'));
stamp('#selo', T.selo - 0.05, -10); S('carimbo', T.selo + 0.18, 0.5);
L.push(`tl.fromTo("#selo .selo",{boxShadow:"0 0 0 0 rgba(255,201,60,.0)"},{boxShadow:"0 0 0 26px rgba(255,201,60,0)",duration:0.6,ease:"power2.out"},${(T.selo + 0.25).toFixed(3)});`);
S('shine_brilho', T.frasco2, 0.35);
out('#pc, #selo', FALA - 0.15, 0.25);

// ================= CTA: ME SEGUE (tela final, último quadro congelado) =================
M.unshift(abs('dim', 0, 0, 1080, 1920, '', `background:${NOITE}`));
HID.push('#dim'); L.push(`tl.fromTo("#dim",{opacity:0},{opacity:0.62,duration:0.5,ease:"power2.out",immediateRender:false},${(FALA + 0.05).toFixed(3)});`);
M.push(abs('fol', 90, 110, 900, 340, `<div class="card col" style="gap:10px">
  <div class="fol1">GOSTOU DO VEREDITO?</div>
  <div class="fol2">ME SEGUE!</div>
  <div class="fol3">e descobre se o próximo perfume<br>vale o frasco</div></div>`));
slideDown('#fol', FALA + 0.1); S('whoosh_rapido', FALA - 0.05, 0.35);
M.push(abs('btn', 310, 490, 460, 96, `<div class="btn"><span class="b1">+ SEGUIR</span><span class="b2">${ic.ok(CREME)}&nbsp;SEGUINDO</span></div>`, 'transform-origin:50% 50%'));
pop('#btn', FALA + 0.45); S('pop_leve', FALA + 0.45, 0.4);
L.push(`tl.set(".b2",{display:"none"},0);`);
const CL = FALA + 1.2;
L.push(`tl.to("#btn",{scale:0.88,duration:0.1,ease:"power2.in"},${CL.toFixed(3)});`);
L.push(`tl.set(".b1",{display:"none"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.set(".b2",{display:"flex"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.set(".btn",{backgroundColor:"${PET}",color:"${CREME}",borderColor:"${AMB}"},${(CL + 0.1).toFixed(3)});`);
L.push(`tl.to("#btn",{scale:1,duration:0.35,ease:"back.out(3)"},${(CL + 0.1).toFixed(3)});`);
S('click_ui', CL, 0.5); S('ding_notificacao', CL + 0.15, 0.45);
M.push(abs('handle', 290, 606, 500, 50, `<div class="handle">@valotaparfum</div>`));
pop('#handle', FALA + 0.75);

// ---------- CSS ----------
const FONT = `@font-face{font-family:"Montserrat";src:url("../assets/fonts/Montserrat.ttf");font-weight:100 900}@font-face{font-family:"Gotham";src:url("../assets/fonts/GothamBlack.otf");font-weight:900}`;
const CSS = `${FONT}
#root{position:absolute;inset:0;overflow:hidden;font-family:"Montserrat",sans-serif}
.abs{position:absolute}
.card{width:100%;height:100%;background:radial-gradient(ellipse 90% 120% at 30% 40%, ${LUZ} 0%, ${PET} 60%, ${NOITE} 100%);border-radius:30px;box-shadow:0 14px 40px rgba(10,31,35,.55);border-bottom:6px solid ${AMB};display:flex}
.col{flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ab1row{display:flex;align-items:center;gap:26px}
.glt{display:inline-block;font-family:"Gotham",sans-serif;font-weight:900;font-size:100px;line-height:1;color:${CREME};text-shadow:-6px 0 ${MENTA},6px 0 ${AMB}}
.pt2{font-weight:900;font-size:40px;line-height:1;color:${INK};background:${YEL};padding:12px 22px;border-radius:999px;border:5px solid ${INK};transform:rotate(-4deg);white-space:nowrap}
.ab2{font-family:"Montserrat",sans-serif;font-weight:900;font-size:70px;line-height:1.05;color:${CREME};letter-spacing:.02em;white-space:nowrap}
.pcard{width:100%;height:100%;border-radius:30px;display:flex;border:6px solid ${INK};box-shadow:10px 12px 0 rgba(10,31,35,.55);gap:4px}
.pcard .nome{display:inline-block;font-family:"Gotham",sans-serif;font-weight:900;font-size:88px;line-height:1;text-shadow:-5px 0 ${CREME},5px 0 ${AMB}}
.marca{font-weight:800;font-size:28px;letter-spacing:.3em;opacity:.9}
.chip{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:999px;font-weight:900;letter-spacing:.02em;white-space:nowrap;border:5px solid var(--b,${INK});box-shadow:6px 8px 0 rgba(10,31,35,.55)}
.chip svg{flex:none}
.stat{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:34px;border-radius:34px;border:6px solid ${INK};box-shadow:10px 12px 0 rgba(10,31,35,.55)}
.stat svg{flex:none}
.scol{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.cnt{display:inline-grid}.cnt .d{grid-area:1/1}
.big{font-family:"Gotham",sans-serif;font-weight:900;font-size:124px;line-height:.95}
.big2{font-family:"Gotham",sans-serif;font-weight:900;font-size:76px;line-height:1;white-space:nowrap}
.lab{font-weight:900;font-size:40px;letter-spacing:.06em;white-space:nowrap}
.selo{width:100%;height:100%;border-radius:50%;background:${VD.bg};border:8px solid ${INK};outline:4px dashed ${INK};outline-offset:-22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:10px 12px 0 rgba(10,31,35,.55);color:${VD.fg};text-align:center}
.s1{font-weight:900;font-size:28px;letter-spacing:.3em;padding-left:.3em}
.s2{font-family:"Gotham",sans-serif;font-weight:900;font-size:${Math.round(56 * VD.s2)}px;line-height:.95}
.s3{font-weight:900;font-size:22px;letter-spacing:.06em;color:${VD.fg};margin-top:4px}
.selo.mini{border-width:6px;outline-width:3px;outline-offset:-16px;box-shadow:7px 9px 0 rgba(10,31,35,.55)}
.mini .s1{font-size:19px}.mini .s2{font-size:${Math.round(38 * VD.s2)}px}.mini .s3{font-size:15px;margin-top:2px}
.fol1{font-weight:900;font-size:44px;color:${CREME};line-height:1;letter-spacing:.04em}
.fol2{font-family:"Gotham",sans-serif;font-weight:900;font-size:110px;color:${YEL};line-height:1}
.fol3{font-weight:800;font-size:32px;color:${CREME};line-height:1.15;padding:0 40px}
.btn{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:999px;background:${YEL};color:${INK};border:6px solid ${INK};box-shadow:8px 10px 0 rgba(10,31,35,.55);font-family:"Gotham",sans-serif;font-weight:900;font-size:50px;letter-spacing:.03em;white-space:nowrap}
.btn span{display:flex;align-items:center;justify-content:center}
.handle{width:100%;text-align:center;font-weight:800;font-size:36px;letter-spacing:.12em;color:${CREME};-webkit-text-stroke:8px ${INK};paint-order:stroke fill}
`;

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
const toks = W.map(w => ({ ...w, txt: w.word.replace(/[.,:;!?…]+$/, '').toUpperCase(), pont: /[.,:!?…]$/.test(w.word) }));
const ENF = /^(VEREDITO|EXTRATO|EXPLICA|TUDO|10|NOITE|PELE|NOÇÃO|9|FIXAÇÃO|PROJEÇÃO|2|MEIA|VALE|FRASCO|MYKONOS|GLITCH|CAIXINHA|SELO)$/;
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
const GRADE = fs.readFileSync(path.join(__dirname, 'grade_attr.txt'), 'utf8').trim();
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
<audio id="voz" class="clip" src="assets/audio/voz.mp3" data-start="0" data-duration="${FALA}" data-track-index="10" data-volume="1"></audio>
${sfx.join('\n')}
</div>
<script>
window.__timelines = window.__timelines || {};
window.__timelines["main"] = gsap.timeline({ paused: true });
</script>
</body>
</html>`);
console.log('ok · END', END, '· legendas', groups.length, '· sfx', sfx.length, '· elementos', M.length);

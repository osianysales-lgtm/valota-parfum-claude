// v17 · cenas (inseridas no gen.js entre o cabeçalho do v16 e a câmera)
// âncoras
const iHoje = F('Hoje'), iE1 = F('E'), iP1 = F('Passo', F('ciência')), iMas = F('Mas'), iAgora = F('Agora'), iDepois = F('Depois'), iOu = F('Ou'), iSegue = F('Segue');
const B = { gancho: 0, promessa: T(iE1) - 0.1, passos: T(iP1) - 0.1, arabe: T(iMas) - 0.1, estudo: T(iAgora) - 0.1, resultado: T(iDepois) - 0.1, solucao: T(iOu) - 0.1, cta: T(iSegue) - 0.1 };
const TA = FALA + 0.05;

// SVGs extras do v17
Object.assign(SV, {
  paleta: `<svg viewBox="0 0 600 380"><rect x="8" y="8" width="584" height="364" rx="40" fill="${INK}" stroke="${CREME}" stroke-width="10"/>${[AMB, YEL, PIM, MENTA, CREME, CEDRO].map((c, j) => `<circle class="pan" cx="${110 + (j % 3) * 190}" cy="${120 + Math.floor(j / 3) * 150}" r="62" fill="${c}" stroke="${INK}" stroke-width="7"/>`).join('')}<text x="300" y="356" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="24" letter-spacing="6" fill="${ALG}">PALETA DO MOMENTO</text></svg>`,
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
    bubble('oi', 'OI, MENINOS! 👋', 290, 10, 500, 64)
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
  const iP2 = F('Passo', iP1 + 1), iP3 = F('Passo', iP2 + 1), iBanho = F('banho'), iHid = F('hidratante'), iPerf = F('perfume', iP3), iTres = F('Três'), iBorr = F('borrifadas'), iBri = F('brilhando'), iBlog = F('blogueira');
  const linhas = [['1 · BASE', '🚿 BANHO TOMADO', MENTA], ['2 · PRIMER', '🧴 HIDRATANTE', CREME], ['3 · ILUMINADOR', '✨ PERFUME', YEL]];
  scene('passos', B.passos, B.arabe, () =>
    linhas.map(([l, v, cor], j) => box(`c${j}`, 40, 30 + j * 175, 1000, 140, `<div class="chip" style="background:${INK};color:${CREME};font-size:50px;border-color:${cor}">${l}</div>`)
      + box(`v${j}`, 545, 48 + j * 175, 470, 104, `<div class="pill" style="background:${cor};color:${INK};font-size:38px">${v}</div>`)).join('')
    + contador('cb', 3, 40, 60, 460, 380, 330)
    + sub('cbl', 'BORRIFADAS', 40, 450, 460, 80, 54)
    + bubble('bl', 'MODO BLOGUEIRA ✨', 470, 150, 580, 56)
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
    A.wiggle('#b1,#b2,#b3,#b4', T(iBlog) + 0.3, 4, 10);
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
    + svg('rk', 'rim', 885, 70, 160, 130)
    + svg('ok', 'check', 990, 40, 80, 80),
  A => {
    A.hide('#pl', '#gr', '#ar', '#f0', '#f1', '#f2', '#f3', '#tm', '#hb', '#hc', '#aq', '#ij', '#tr', '#td', '#rk', '#ok');
    A.raw(`tl.fromTo("#pl",{opacity:0,scale:0.3,rotation:-12},{opacity:1,scale:1,rotation:0,duration:0.4,ease:"back.out(1.8)"},${A.t(T(iPal) - 0.1)});`); S('ziper_bolsa', T(iPal) - 0.15, 0.4);
    A.slam('#gr', T(iGrife), 2.2, -8); S('carimbo', T(iGrife), 0.5); S('buzzer_erro', T(iGrife) + 0.1, 0.25);
    A.out('#pl,#gr', T(iArabe) - 0.1, 0.12);
    A.slam('#ar', T(iArabe), 2.2); empSfx(T(iArabe));
    cx.forEach((_, j) => { A.raw(`tl.fromTo("#f${j}",{opacity:0,scale:0.3,y:90,rotation:${j % 2 ? 10 : -10}},{opacity:1,scale:1,y:0,rotation:0,duration:0.36,ease:"back.out(1.9)"},${A.t(T(iArabe) + 0.1 + j * 0.13)});`); S('pop_leve', T(iArabe) + 0.1 + j * 0.13, 0.4); });
    A.out('#ar,#f0,#f1,#f2,#f3', T(iTodo) - 0.12, 0.14);
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
    A.pop('#rk', T(iRim), -10); S('caixa_registradora', T(iRim), 0.45);
    A.hop('#hc', T(iRim) + 0.1, 30);
    A.rise('#td', T(iDed) - 0.15, 30, 0.28); S('boing_cartoon', T(iDed), 0.35);
    A.hop('#hb', T(iDed), 30);
    A.wiggle('#rk', T(iRim2), 5, 8);
    A.pop('#ok', T(iLugar), 0); S('ding_acerto', T(iLugar), 0.5); S('badum_tss', T(iLugar) + 0.45, 0.35);
    A.out('#hb,#hc,#aq,#ij,#tr,#td,#rk,#ok', B.estudo - 0.16, 0.14);
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
    + box('em', 70, 220, 420, 150, `<div class="stamp" style="font-size:78px">= EMPATE</div>`, 'transform:rotate(-10deg)')
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
    A.pop('#at', T(iAtr) - 0.1); S('ding_acerto', T(iAtr), 0.5);
    ['#h1', '#h2', '#h3'].forEach((s, j) => A.pop(s, T(iAtr) + j * 0.12, j % 2 ? 10 : -10)); S('shine_brilho', T(iAtr) + 0.2, 0.35);
    A.out('#av,#ft,#vd,#em,#at,#h1,#h2,#h3', T(iPor) - 0.12, 0.14);
    A.slam('#pq', T(iPor), 2.0); S('suspense_dun', T(iPor), 0.4);
    A.out('#pq', T(iConf) - 0.35, 0.12);
    A.rise('#mt', T(iConf) - 0.25, 30, 0.28);
    A.raw(`tl.fromTo("#mtb",{scaleX:0.15},{scaleX:1,duration:0.9,ease:"power2.out"},${A.t(T(iConf))});`); S('riser_curto', T(iConf) - 0.1, 0.4); S('ding_acerto', T(iConf) + 0.9, 0.4);
    A.pop('#j1', T(iJeito) + 0.1); S('pop_leve', T(iJeito) + 0.1, 0.4); A.wiggle('#j1', T(iFalar), 3, 3);
    A.pop('#j2', T(iMexer) - 0.3); S('boing_cartoon', T(iMexer) - 0.3, 0.35); A.hop('#j2', T(iMexer) + 0.1, 20);
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
    A.pop('#el', T(iElog) - 0.4, -3); S('ding_notificacao', T(iElog) - 0.4, 0.5);
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
    + svg('m1', 'brilho', 70, 120, 80, 80) + svg('m2', 'brilho', 950, 300, 70, 70)
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

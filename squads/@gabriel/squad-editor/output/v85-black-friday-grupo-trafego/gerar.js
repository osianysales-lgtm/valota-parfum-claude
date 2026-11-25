// v85 · TRÁFEGO PAGO BLACK FRIDAY do grupo de ofertas (25/11) · molde v84 com cara de Black Friday
// ~/Downloads/black friday.MOV cortado 1,85 s → 14,35 s (2 s iniciais sem fala) → base.mp4 (vinheta) + audio.wav (-14)
// Preto + amarelo BF: fitas de "BLACK FRIDAY" no gancho (25/11: sem selo fixo no canto, ficava na cabeça dela); blocos pretos com letra amarela
// nas palavras de impacto; em "grupo" a tela do grupo (contorno amarelo, nomes borrados) rola ATRÁS dela;
// "cupom" = ticket; "o tempo todo" = leque de ofertas reais; print do Le Male com círculo no preço ("metade")
// e no VENDIDO POR ("loja de confiança"); "aproveite agora" + seta.
// Uso (de dentro desta pasta): node gerar.js   (SO=0,90 → só prévia desses quadros)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const DIR = __dirname;
const W = 1080, H = 1920, FPS = 30, N = 375, DUR = N / FPS;
const FONT = path.join(DIR, '../../moldes/cena-repetida-frases/Montserrat-ExtraBold.ttf');
const AM = '#FFD60A', VERM = '#FF2D2D';
const T_GRUPO = 4.55, M0 = 135;            // "grupo" · 1º quadro com máscara
const HOOK_FIM = 2.45;
const PRINT = { t0: 6.73, t1: 10.69, x: 160, y: 640, w: 760 };
const ESC = PRINT.w / 1290;
const CIRC = [
  { t: 8.71, cx: 470, cy: 832, rx: 232, ry: 92, rot: -3 },        // De R$ 839,00 / Por R$ 493,20 ("metade")
  { t: 10.01, cx: 735, cy: 1110, rx: 500, ry: 100, rot: -1.5 },   // VENDIDO POR: Jean Paul Gaultier Loja Oficial ("confiança")
];
const CUPOM = { t0: 4.95, t1: 5.83 };
const DECK = [ // "o tempo todo": leque de ofertas reais do grupo
  { t0: 5.83, img: 'mercedes', nome: 'Mercedes-Benz Club Black 100ml', de: '799,00', por: '257,40', rot: -7, dx: -60, dy: -20 },
  { t0: 5.98, img: 'rayhaan', nome: 'Rayhaan Lion 100ml', de: '549,90', por: '169,00', rot: 5, dx: 50, dy: 25 },
  { t0: 6.13, img: 'hawas', nome: 'Hawas Malibu 100ml', de: '418,56', por: '180,00', rot: -2, dx: 0, dy: 70 },
];
const DECK_FIM = 6.73;
// [início, fim, texto, destaques, bloco-grande (início do pop)]
const LEG = [
  [1.21, 1.87, 'e se você gosta', []],
  [1.87, 2.49, 'de perfume,', ['perfume']],
  [2.49, 3.05, 'essa é a melhor hora', ['melhor', 'hora']],
  [3.05, 4.31, 'de você|ECONOMIZAR', [], 3.37],
  [4.31, 4.77, 'No meu grupo', ['grupo']],
  [4.77, 5.33, 'tem cupom', ['cupom']],
  [5.33, 5.83, 'e eu oferto', []],
  [5.83, 6.39, 'o tempo todo,', ['tempo', 'todo']],
  [6.39, 6.73, 'onde você vai', []],
  [6.73, 7.53, 'comprar perfumes', []],
  [7.53, 8.55, 'originais', ['originais']],
  [8.55, 9.39, 'pela|METADE DO PREÇO', [], 8.71],
  [9.39, 9.91, 'e de loja', []],
  [9.91, 10.69, 'de confiança', ['confiança']],
  [10.69, DUR + 1, 'clique aqui e|APROVEITE AGORA', [], 11.33],
];
const fita = (n) => Array(n).fill('BLACK FRIDAY <i>★</i>').join(' ');

const css = `
@font-face{font-family:M;src:url('file://${FONT}')}
html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
.txt{font-family:M;color:#fff;-webkit-text-stroke:11px #000;paint-order:stroke fill;
  text-shadow:0 6px 18px rgba(0,0,0,.45);letter-spacing:-0.5px;white-space:nowrap}
.fita{position:absolute;left:-200px;width:1480px;height:92px;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.55);
  font-family:M;font-size:52px;line-height:92px;white-space:nowrap;letter-spacing:1px}
.fita span{display:inline-block}
.fita i{font-style:normal;margin:0 18px}
#f1{top:850px;background:${AM};color:#000;transform:rotate(-8deg)}
#f2{top:1215px;background:#000;color:${AM};transform:rotate(6deg);border-top:5px solid ${AM};border-bottom:5px solid ${AM}}
#hook{position:absolute;left:0;right:0;top:905px;text-align:center;transform-origin:50% 50%}
#hook .b{display:inline-block;background:#000;color:${AM};font-family:M;white-space:nowrap;text-align:center;
  padding:14px 34px 16px;transform:skewX(-8deg);box-shadow:0 0 0 6px ${AM},0 20px 50px rgba(0,0,0,.6)}
#hook .a{display:block;font-size:50px;line-height:56px;letter-spacing:12px;margin-right:-12px}
#hook .bf{display:block;font-size:110px;line-height:118px;letter-spacing:-2px}
#leg{position:absolute;left:0;right:0;top:1410px;transform:translateY(-50%);text-align:center;font-size:70px;line-height:78px}
#leg .h{color:${AM}}
#leg .w{display:inline-block}
#leg .peq{font-size:54px;line-height:64px;display:block}
#leg .big{display:inline-block;margin-top:6px;background:#000;color:${AM};-webkit-text-stroke:0;font-size:84px;line-height:100px;
  padding:4px 28px 10px;box-shadow:0 0 0 5px ${AM},0 18px 40px rgba(0,0,0,.55)}
#card{position:absolute;left:${PRINT.x}px;top:${PRINT.y}px;width:${PRINT.w}px;height:${Math.round(1225 * ESC)}px;
  border-radius:30px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,.55),0 0 0 7px ${AM};transform-origin:50% 40%;opacity:0}
#card img{width:100%;display:block}
#card svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}
#cupom{position:absolute;left:250px;top:930px;width:580px;height:250px;opacity:0;filter:drop-shadow(0 22px 40px rgba(0,0,0,.55))}
#cupom .tk{position:absolute;inset:0;background:${AM};border-radius:26px;
  -webkit-mask:radial-gradient(circle at 0 50%,transparent 34px,#000 35px) left/51% 100% no-repeat,radial-gradient(circle at 100% 50%,transparent 34px,#000 35px) right/51% 100% no-repeat}
#cupom .ct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:26px;font-family:M;color:#000}
#cupom .pc{font-size:150px;line-height:150px}
#cupom .tx{border-left:5px dashed rgba(0,0,0,.55);padding-left:28px}
#cupom .t1{font-size:96px;line-height:96px;letter-spacing:-1px}
#cupom .t2{font-size:34px;line-height:40px}
.of{position:absolute;left:275px;top:960px;width:530px;box-sizing:border-box;padding:18px 22px 20px 18px;border-radius:30px;
  background:#D9FDD3;box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 0 6px ${AM};display:flex;gap:18px;align-items:center;
  font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;color:#111;opacity:0;transform-origin:50% 50%}
.of img{width:150px;height:150px;object-fit:cover;border-radius:16px;flex:none;background:#fff}
.of .n{font-size:27px;font-weight:600;line-height:31px;margin-bottom:8px}
.of .de{font-size:30px;line-height:38px;color:#555}
.of .de s{text-decoration-thickness:3px;text-decoration-color:#d22}
.of .por{font-size:39px;line-height:48px;font-weight:800;white-space:nowrap}
.of .em{font-family:'Apple Color Emoji';font-size:.8em;margin-right:6px}
#seta{position:absolute;left:0;right:0;top:1545px;text-align:center;opacity:0}
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
${DECK.map((c, i) => `<div class="of" id="of${i}"><img src="file://${path.join(DIR, 'cards', c.img + '.png')}"><div>
  <div class="n">${c.nome}</div><div class="de"><span class="em">❌</span>De <s>R$ ${c.de}</s></div>
  <div class="por"><span class="em">✅</span>Por R$ ${c.por}</div></div></div>`).join('')}
<div id="cupom"><div class="tk"></div><div class="ct"><div class="pc">%</div><div class="tx"><div class="t1">CUPOM</div><div class="t2">de desconto no grupo</div></div></div></div>
<div id="card"><img src="file://${path.join(DIR, 'print_card.png')}">
<svg viewBox="0 0 ${PRINT.w} ${Math.round(1225 * ESC)}">${CIRC.map((c, i) => {
  const cx = c.cx * ESC, cy = c.cy * ESC, rx = c.rx * ESC, ry = c.ry * ESC;
  let d = ''; const passos = 80, voltas = 1.12;
  for (let k = 0; k <= passos; k++) {
    const a = -Math.PI * 0.62 + (k / passos) * voltas * 2 * Math.PI, f = 1 + 0.035 * (k / passos);
    d += (k ? 'L' : 'M') + (cx + rx * f * Math.cos(a)).toFixed(1) + ' ' + (cy + ry * f * Math.sin(a)).toFixed(1);
  }
  return `<path d="${d}" transform="rotate(${c.rot} ${cx} ${cy})" fill="none" stroke="${VERM}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"/>`;
}).join('')}</svg></div>
<div class="fita" id="f1"><span>${fita(8)}</span></div>
<div class="fita" id="f2"><span>${fita(8)}</span></div>
<div id="hook"><span class="b"><span class="a">COMEÇOU A</span><span class="bf">BLACK FRIDAY</span></span></div>
<div id="leg" class="txt"></div>
<div id="seta"><svg width="140" height="150" viewBox="0 0 140 150">
  <path d="M20 20 L70 70 L120 20" fill="none" stroke="#000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 20 L70 70 L120 20" fill="none" stroke="${AM}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 80 L70 130 L120 80" fill="none" stroke="#000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 80 L70 130 L120 80" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<script>
const LEG = ${JSON.stringify(LEG)}, PRINT = ${JSON.stringify(PRINT)}, CIRC = ${JSON.stringify(CIRC)};
const DECK = ${JSON.stringify(DECK)}, CUPOM = ${JSON.stringify(CUPOM)}, DECK_FIM = ${DECK_FIM}, HOOK_FIM = ${HOOK_FIM};
const cl = x => Math.min(1, Math.max(0, x));
const ease = x => 1 - Math.pow(1 - cl(x), 3);
const back = x => { x = cl(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const $ = id => document.getElementById(id);
const lens = [...document.querySelectorAll('#card path')].map(p => p.getTotalLength());
document.querySelectorAll('#card path').forEach((p, i) => { p.style.strokeDasharray = lens[i]; });
let legAtual = -1;
window.draw = t => {
  // gancho: fitas cruzando + "COMEÇOU A BLACK FRIDAY" desde o 1º quadro; depois some
  const sai = ease((t - HOOK_FIM) / 0.3);
  ['f1', 'f2'].forEach((id, k) => {
    const f = $(id), dir = k ? 1 : -1;
    f.style.opacity = 1 - sai;
    f.querySelector('span').style.transform = 'translateX(' + (dir * 160 * t - 300 + dir * 900 * sai) + 'px)';
  });
  const hk = $('hook');
  const pulsa = t < 0.69 ? 1 : 1 + 0.08 * Math.sin(cl((t - 0.69) / 0.35) * Math.PI);
  hk.querySelector('.b').style.transform = 'skewX(-8deg) scale(' + pulsa + ')';
  hk.style.opacity = 1 - cl((t - HOOK_FIM - 0.15) / 0.15);
  hk.style.transform = 'scale(' + (1 - 0.35 * sai) + ')';   // 25/11: sem selo no canto (ficava na cabeça dela)
  // cupom
  const cp = $('cupom'); const kc = (t - CUPOM.t0) / 0.3, zc = (CUPOM.t1 - t) / 0.15;
  cp.style.opacity = t >= CUPOM.t0 && t < CUPOM.t1 ? Math.min(1, kc * 3, zc) : 0;
  cp.style.transform = 'rotate(' + (-4 + 10 * (1 - back(kc))) + 'deg) scale(' + (0.3 + 0.7 * back(kc)) + ')';
  // leque de ofertas
  DECK.forEach((c, k) => {
    const el = $('of' + k), a = (t - c.t0) / 0.3, z = (t - DECK_FIM) / 0.25;
    if (t < c.t0 || z >= 1) { el.style.opacity = 0; return; }
    el.style.opacity = Math.min(1, a * 3, 1 - z);
    el.style.transform = 'translate(' + (c.dx + (k % 2 ? 1 : -1) * 500 * (1 - ease(a))) + 'px,' + (c.dy + 700 * ease(z)) + 'px) rotate(' + (c.rot * ease(a)) + 'deg) scale(' + (0.6 + 0.4 * back(a)) + ')';
  });
  // print
  const cd = $('card'); const vin = ease((t - PRINT.t0) / 0.3), fim = 1 - ease((t - PRINT.t1) / 0.22);
  cd.style.opacity = Math.min(vin, fim);
  cd.style.transform = 'scale(' + (0.82 + 0.18 * back((t - PRINT.t0) / 0.35)) * (1 - 0.06 * (1 - fim)) + ')';
  document.querySelectorAll('#card path').forEach((p, i) => {
    const k = ease((t - CIRC[i].t) / 0.42);
    p.style.strokeDashoffset = lens[i] * (1 - k); p.style.opacity = k > 0 ? 1 : 0;
  });
  // legenda
  const i = LEG.findIndex(l => t >= l[0] && t < l[1]);
  const lg = $('leg');
  if (i !== legAtual) {
    legAtual = i;
    lg.style.top = (i >= 0 && LEG[i][4]) ? '1440px' : '';
    if (i < 0) lg.innerHTML = '';
    else if (LEG[i][4]) { const [a, b] = LEG[i][2].split('|'); lg.innerHTML = '<span class="peq">' + a + '</span><span class="big">' + b + '</span>'; }
    else lg.innerHTML = LEG[i][2].split(' ').map(w => '<span class="w' + (LEG[i][3].includes(w.toLowerCase().replace(/[,.?!]/g, '')) ? ' h' : '') + '">' + w + '</span>').join(' ');
  }
  if (i >= 0) {
    const k = (t - LEG[i][0]) / 0.16;
    lg.style.opacity = cl(k * 1.5);
    lg.style.transform = 'translateY(-50%) scale(' + (0.9 + 0.1 * back(k)) + ')';
    const big = lg.querySelector('.big');
    if (big) { const kb = (t - LEG[i][4]) / 0.3; big.style.opacity = t < LEG[i][4] ? 0 : 1; big.style.transform = 'skewX(-8deg) scale(' + (0.5 + 0.5 * back(kb)) + ')'; }
  }
  // seta do "clique aqui"
  const st = $('seta'); const on = t >= 10.69;
  st.style.opacity = on ? cl((t - 10.69) / 0.12) : 0;
  st.style.transform = 'translateY(' + (on ? 14 * Math.abs(Math.sin((t - 10.69) * Math.PI * 2.4)) : 0) + 'px)';
};
</script></body></html>`;

(async () => {
  fs.writeFileSync(path.join(DIR, 'overlay.html'), html);
  const ov = path.join(DIR, 'ov'); fs.rmSync(ov, { recursive: true, force: true }); fs.mkdirSync(ov);
  const so = process.env.SO ? process.env.SO.split(',').map(Number) : null;
  const br = await puppeteer.launch({ headless: 'new' });
  const pg = await br.newPage();
  await pg.setViewport({ width: W, height: H });
  await pg.goto('file://' + path.join(DIR, 'overlay.html'));
  await pg.evaluate(() => document.fonts.ready);
  for (let f = 0; f < N; f++) {
    if (so && !so.includes(f)) continue;
    await pg.evaluate(t => window.draw(t), f / FPS);
    await pg.screenshot({ path: path.join(ov, `o${String(f).padStart(5, '0')}.png`), omitBackground: true });
  }
  await br.close();
  if (so) { console.log('prévia ok'); return; }

  const FX = [[0.0, 'impact_grave', .3], [0.69, 'shine_brilho', .3], [3.37, 'caixa_registradora', .26],
              [T_GRUPO, 'whoosh_suave', .35], [T_GRUPO + 0.25, 'ding_notificacao', .28], [CUPOM.t0, 'pop_leve', .35],
              ...DECK.map(c => [c.t0, 'pop_leve', .3]), [PRINT.t0, 'whoosh_suave', .3], [8.71, 'caixa_registradora', .26],
              [10.01, 'click_ui', .4], [11.33, 'ding_acerto', .3]];
  const fxIn = FX.flatMap(([, f]) => ['-i', path.join(DIR, `../../biblioteca_audio/efeitos/${f}.mp3`)]);
  const fxF = FX.map(([t, , v], k) => `[${5 + k}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${v}[f${k}]`).join(';');
  const mix = `[4:a]${FX.map((_, k) => `[f${k}]`).join('')}amix=inputs=${FX.length + 1}:normalize=0:duration=first[au]`;
  const t0 = (M0 / FPS).toFixed(4);
  const fc = [
    `[2]format=gray,tmix=frames=3:weights='1 2 1'[m]`,
    `[3:v]trim=start=${t0},setpts=PTS-STARTPTS[pp]`,
    `[pp][m]alphamerge,setpts=PTS+${t0}/TB[pes]`,
    `[1:v]fade=in:st=0:d=0.3:alpha=1,setpts=PTS+${T_GRUPO}/TB[pn]`,
    `[0:v][pn]overlay=x='-10-70*max(0,1-(t-${T_GRUPO})/0.35)^3':y=150:eof_action=pass[a]`,
    `[a][pes]overlay=0:0:eof_action=pass[b]`,
    `[${5 + FX.length}]format=rgba[ov]`,
    `[b][ov]overlay=0:0,format=yuv420p[v]`,
    fxF, mix,
  ].join(';');
  const out = path.join(DIR, 'v85-black-friday-grupo-trafego.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y',
    '-i', path.join(DIR, 'base.mp4'), '-i', path.join(DIR, 'painel.mov'),
    '-framerate', '30', '-start_number', String(M0), '-i', path.join(DIR, 'mk/f%05d.png'),
    '-i', path.join(DIR, 'base.mp4'), '-i', path.join(DIR, 'audio.wav'), ...fxIn,
    '-framerate', '30', '-i', path.join(ov, 'o%05d.png'),
    '-filter_complex', fc, '-map', '[v]', '-map', '[au]', '-t', DUR.toFixed(4),
    '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('ok', out);
})();

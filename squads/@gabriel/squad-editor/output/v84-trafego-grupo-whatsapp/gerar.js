// v84 · TRÁFEGO PAGO "grupo de ofertas" (inspiração: ~/Downloads/inspiracao.MP4, anúncio @clube.da.bc)
// ~/Downloads/Part 1 trafego.MOV + Part 2 trafego.MOV (corte seco) → base.mp4 + audio.wav (loudnorm -14)
// Print do Le Male (Print jean pulljpg.jpg, nomes borrados) entra em "esse mesmo Jean Paul Gaultier" com
// círculo no "VENDIDO POR" (em "grupo") e no preço (em "metade"). Na 2ª vez que ela fala "grupo" (9,3 s)
// a tela do grupo (video grupo.mov, nomes borrados, nada cortado) rola ATRÁS dela (recorte Vision, mk/).
// Uso (de dentro desta pasta): node gerar.js   → ov/ (PNG transparentes) + v84-trafego-grupo-whatsapp.mp4
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const DIR = __dirname;
const W = 1080, H = 1920, FPS = 30, N = 436, DUR = N / FPS;
const FONT = path.join(DIR, '../../moldes/cena-repetida-frases/Montserrat-ExtraBold.ttf');
const AMBAR = '#F2B544', VERMELHO = '#E8322E';
const T_GRUPO = 9.25;                 // 2ª vez que ela fala "grupo" → tela do grupo atrás dela
const PRINT = { t0: 3.55, t1: 6.80, x: 160, y: 640, w: 760 };   // card do print (1290×1225 → 760×722)
const ESC = PRINT.w / 1290;
const CIRC = [ // elipses no print (coordenadas do print original) e quando desenham
  { t: 4.68, cx: 735, cy: 1110, rx: 500, ry: 100, rot: -1.5 },   // VENDIDO POR: Jean Paul Gaultier Loja Oficial
  { t: 5.86, cx: 470, cy: 832, rx: 232, ry: 92, rot: -3 },      // De R$ 839,00 / Por R$ 493,20
];
const P2 = 9.6333; // início da parte 2
// legenda: [início, fim, texto, palavras de destaque (minúsculas), estilo]
const LEG = [
  [1.70, 3.04, 'Olha esse preço aqui', ['preço']],
  [3.04, 3.74, 'Eu mandei esse mesmo', []],
  [3.74, 4.42, 'Jean Paul Gaultier', []],
  [4.42, 4.90, 'no meu grupo', ['grupo']],
  [4.90, 5.62, 'de oferta, só que', []],
  [5.62, 6.82, 'pela|METADE DO PREÇO', [], 'metade'],
  [6.82, 7.20, 'E se você quer', []],
  [7.20, 8.00, 'economizar também,', ['economizar']],
  [8.00, 8.58, 'clica aqui embaixo', ['embaixo']],
  [8.58, 9.12, 'e faça parte', []],
  [9.12, P2, 'do meu grupo', ['grupo']],
  [P2 + 0.00, P2 + 0.78, 'que nesse grupo eu', ['grupo']],
  [P2 + 0.78, P2 + 1.40, 'vou estar mandando', []],
  [P2 + 1.40, P2 + 2.34, 'as melhores ofertas', ['melhores', 'ofertas']],
  [P2 + 2.34, P2 + 3.30, 'de lojas confiáveis', ['lojas', 'confiáveis']],
  [P2 + 3.30, DUR + 1, 'e perfumes originais', ['originais']],
];
// 25/11 "a tela atrás tampou os preços": as ofertas REAIS que passam na tela do grupo pulam pra frente
// como balão verde (foto recortada da gravação + preço igual ao post), alternando esquerda/direita.
const CARDS = [
  { t0: 9.55, t1: 10.85, img: 'mercedes', nome: 'Mercedes-Benz Club Black 100ml', de: '799,00', por: '257,40', lado: 'e' },
  { t0: 10.85, t1: 12.10, img: 'rayhaan', nome: 'Rayhaan Lion 100ml', de: '549,90', por: '169,00', lado: 'd' },
  { t0: 12.10, t1: 13.35, img: 'vanilla', nome: 'Khadlaj Island Vanilla Dunes 100ml', de: '234,90', por: '167,12', lado: 'e' },
  { t0: 13.35, t1: DUR + 1, img: 'hawas', nome: 'Hawas Malibu 100ml', de: '418,56', por: '180,00', lado: 'd' },
];

const css = `
@font-face{font-family:M;src:url('file://${FONT}')}
html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
.txt{font-family:M;color:#fff;-webkit-text-stroke:11px #000;paint-order:stroke fill;
  text-shadow:0 6px 18px rgba(0,0,0,.45);letter-spacing:-0.5px;white-space:nowrap}
#hook{position:absolute;left:0;right:0;top:960px;text-align:center;font-size:96px;line-height:104px;text-transform:uppercase}
#hook .c{color:${AMBAR};display:inline-block}
#leg{position:absolute;left:0;right:0;top:1410px;transform:translateY(-50%);text-align:center;font-size:70px;line-height:78px}
#leg .h{color:${AMBAR}}
#leg .w{display:inline-block}
#leg .peq{font-size:54px;line-height:60px;display:block}
#leg .big{font-size:92px;line-height:98px;color:${AMBAR};display:block}
#card{position:absolute;left:${PRINT.x}px;top:${PRINT.y}px;width:${PRINT.w}px;height:${Math.round(1225 * ESC)}px;
  border-radius:30px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,.45),0 0 0 4px rgba(255,255,255,.85);transform-origin:50% 40%}
#card img{width:100%;display:block}
#card svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}
#seta{position:absolute;left:0;right:0;top:1470px;text-align:center}
.of{position:absolute;top:975px;width:530px;box-sizing:border-box;padding:18px 22px 20px 18px;border-radius:30px;
  background:#D9FDD3;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 5px #fff;display:flex;gap:18px;align-items:center;
  font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;color:#111;opacity:0}
.of.e{left:28px;transform-origin:20% 0%} .of.d{left:522px;transform-origin:80% 0%}
.of img{width:150px;height:150px;object-fit:cover;border-radius:16px;flex:none;background:#fff}
.of .n{font-size:27px;font-weight:600;line-height:31px;margin-bottom:8px}
.of .de{font-size:30px;line-height:38px;color:#555}
.of .de s{text-decoration-thickness:3px;text-decoration-color:#d22}
.of .por{font-size:39px;line-height:48px;font-weight:800;white-space:nowrap}
.of .em{font-family:'Apple Color Emoji';font-size:.8em;margin-right:6px}
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div id="hook" class="txt">Você ainda está<br>pagando <span class="c">caro</span><br>em perfume?</div>
<div id="card"><img src="file://${path.join(DIR, 'print_card.png')}">
<svg viewBox="0 0 ${PRINT.w} ${Math.round(1225 * ESC)}">${CIRC.map((c, i) => {
  const cx = c.cx * ESC, cy = c.cy * ESC, rx = c.rx * ESC, ry = c.ry * ESC;
  // elipse "à mão": 1 volta e 1/8 com leve espiral
  let d = ''; const passos = 80, voltas = 1.12;
  for (let k = 0; k <= passos; k++) {
    const a = -Math.PI * 0.62 + (k / passos) * voltas * 2 * Math.PI, f = 1 + 0.035 * (k / passos);
    d += (k ? 'L' : 'M') + (cx + rx * f * Math.cos(a)).toFixed(1) + ' ' + (cy + ry * f * Math.sin(a)).toFixed(1);
  }
  return `<path id="c${i}" d="${d}" transform="rotate(${c.rot} ${cx} ${cy})" fill="none" stroke="${VERMELHO}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"/>`;
}).join('')}</svg></div>
${CARDS.map((c, i) => `<div class="of ${c.lado}" id="of${i}"><img src="file://${path.join(DIR, 'cards', c.img + '.png')}"><div>
  <div class="n">${c.nome}</div><div class="de"><span class="em">❌</span>De <s>R$ ${c.de}</s></div>
  <div class="por"><span class="em">✅</span>Por R$ ${c.por}</div></div></div>`).join('')}
<div id="leg" class="txt"></div>
<div id="seta"><svg width="140" height="150" viewBox="0 0 140 150">
  <path d="M20 20 L70 70 L120 20" fill="none" stroke="#000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 20 L70 70 L120 20" fill="none" stroke="${AMBAR}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 80 L70 130 L120 80" fill="none" stroke="#000" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 80 L70 130 L120 80" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<script>
const CARDS = ${JSON.stringify(CARDS)};
const LEG = ${JSON.stringify(LEG)}, PRINT = ${JSON.stringify(PRINT)}, CIRC = ${JSON.stringify(CIRC)};
const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const back = x => { x = Math.min(1, Math.max(0, x)); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lens = [...document.querySelectorAll('#card path')].map(p => p.getTotalLength());
document.querySelectorAll('#card path').forEach((p, i) => { p.style.strokeDasharray = lens[i]; });
let legAtual = -1;
window.draw = t => {
  // gancho: grande desde o 1º quadro, some antes do print
  const hk = document.getElementById('hook');
  hk.style.opacity = t < 2.85 ? 1 : Math.max(0, 1 - (t - 2.85) / 0.2);
  hk.querySelector('.c').style.transform = 'scale(' + (t < 0.78 ? 1 : 1 + 0.14 * Math.sin(Math.min(1, (t - 0.78) / 0.3) * Math.PI)) + ')';
  // card do print
  const cd = document.getElementById('card');
  const vin = ease((t - PRINT.t0) / 0.3), sai = 1 - ease((t - PRINT.t1) / 0.22);
  cd.style.opacity = Math.min(vin, sai);
  cd.style.transform = 'scale(' + (0.82 + 0.18 * back((t - PRINT.t0) / 0.35)) * (1 - 0.06 * (1 - sai)) + ')';
  document.querySelectorAll('#card path').forEach((p, i) => {
    const k = ease((t - CIRC[i].t) / 0.42);
    p.style.strokeDashoffset = lens[i] * (1 - k); p.style.opacity = k > 0 ? 1 : 0;
  });
  // legenda
  const i = LEG.findIndex(l => t >= l[0] && t < l[1]);
  const lg = document.getElementById('leg');
  if (i !== legAtual) {
    legAtual = i;
    lg.style.top = (i >= 0 && LEG[i][4] === 'metade') ? '1446px' : '';
    if (i < 0) lg.innerHTML = '';
    else if (LEG[i][4] === 'metade') { const [a, b] = LEG[i][2].split('|'); lg.innerHTML = '<span class="peq">' + a + '</span><span class="big w">' + b + '</span>'; }
    else lg.innerHTML = LEG[i][2].split(' ').map(w => '<span class="w' + (LEG[i][3].includes(w.toLowerCase().replace(/[,.?!]/g, '')) ? ' h' : '') + '">' + w + '</span>').join(' ');
  }
  if (i >= 0) {
    const k = (t - LEG[i][0]) / 0.16;
    lg.style.opacity = Math.min(1, Math.max(0, k * 1.5));
    lg.style.transform = 'translateY(-50%) scale(' + (0.9 + 0.1 * back(k)) + ')';
    const big = lg.querySelector('.big');
    if (big) big.style.transform = 'scale(' + (0.6 + 0.4 * back((t - 5.86) / 0.3)) + ')';
  }
  // ofertas pulando da tela do grupo
  CARDS.forEach((c, k) => {
    const el = document.getElementById('of' + k);
    const a = (t - c.t0) / 0.38, z = (c.t1 - t) / 0.18;
    if (t < c.t0 || t >= c.t1) { el.style.opacity = 0; return; }
    const ent = back(a), sx = c.lado === 'e' ? -1 : 1;
    el.style.opacity = Math.min(1, a * 2.5, z);
    const rot = sx * (3 - 3 * ent) + (c.lado === 'e' ? -2.5 : 2.5);
    el.style.transform = 'translate(' + (c.lado === 'e' ? 0 : -260 * (1 - ent)) + 'px,' + (-120 * (1 - ent)) + 'px) rotate(' + rot + 'deg) scale(' + (0.35 + 0.65 * ent) * (z < 1 ? 0.85 + 0.15 * z : 1) + ')';
  });
  // seta do "clica aqui embaixo"
  const st = document.getElementById('seta');
  const on = t >= 8.0 && t < 9.25;
  st.style.opacity = on ? Math.min(1, (t - 8.0) / 0.12, (9.25 - t) / 0.15) : 0;
  st.style.transform = 'translateY(' + (on ? 14 * Math.abs(Math.sin((t - 8.0) * Math.PI * 2.4)) : 0) + 'px)';
};
</script></body></html>`;

(async () => {
  fs.writeFileSync(path.join(DIR, 'overlay.html'), html);
  const ov = path.join(DIR, 'ov'); fs.rmSync(ov, { recursive: true, force: true }); fs.mkdirSync(ov);
  const so = process.env.SO ? process.env.SO.split(',').map(Number) : null; // SO=60,150 → só esses quadros (prévia)
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

  // efeitos sonoros (leves) + voz
  const FX = [[3.55, 'pop_leve', .35], [4.68, 'lupa_whoosh', .3], [5.86, 'caixa_registradora', .28],
              [8.0, 'click_ui', .4], [T_GRUPO, 'whoosh_suave', .35], [T_GRUPO + 0.25, 'ding_notificacao', .3],
              ...CARDS.slice(1).map(c => [c.t0, 'pop_leve', .32])];
  const fxIn = FX.flatMap(([, f]) => ['-i', path.join(DIR, `../../biblioteca_audio/efeitos/${f}.mp3`)]);
  const fxF = FX.map(([t, , v], k) => `[${5 + k}:a]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${v}[f${k}]`).join(';');
  const mix = `[4:a]${FX.map((_, k) => `[f${k}]`).join('')}amix=inputs=${FX.length + 1}:normalize=0:duration=first[au]`;
  const fc = [
    `[2]format=gray,tmix=frames=3:weights='1 2 1'[m]`,
    `[3:v]trim=start=${(276 / FPS).toFixed(4)},setpts=PTS-STARTPTS[pp]`,
    `[pp][m]alphamerge,setpts=PTS+${(276 / FPS).toFixed(4)}/TB[pes]`,
    // painel: entra deslizando da esquerda com fade em T_GRUPO
    `[1:v]fade=in:st=0:d=0.3:alpha=1,setpts=PTS+${T_GRUPO}/TB[pn]`,
    `[0:v][pn]overlay=x='-10-70*max(0,1-(t-${T_GRUPO})/0.35)^3':y=110:eof_action=pass[a]`,
    `[a][pes]overlay=0:0:eof_action=pass[b]`,
    `[b][ov]overlay=0:0,format=yuv420p[v]`,
    `[${5 + FX.length}]format=rgba[ov]`,
    fxF, mix,
  ].join(';');
  const out = path.join(DIR, 'v84-trafego-grupo-whatsapp.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y',
    '-i', path.join(DIR, 'base.mp4'), '-i', path.join(DIR, 'painel.mov'),
    '-framerate', '30', '-start_number', '276', '-i', path.join(DIR, 'mk/f%05d.png'),
    '-i', path.join(DIR, 'base.mp4'), '-i', path.join(DIR, 'audio.wav'), ...fxIn,
    '-framerate', '30', '-i', path.join(ov, 'o%05d.png'),
    '-filter_complex', fc, '-map', '[v]', '-map', '[au]', '-t', DUR.toFixed(4),
    '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('ok', out);
})();

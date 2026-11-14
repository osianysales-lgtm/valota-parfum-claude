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

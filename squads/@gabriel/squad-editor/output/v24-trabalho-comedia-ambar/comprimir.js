// node comprimir.js → narracao.mp3 + narracao_palavras.json
// Pausas da voz (silencedetect -38 dB, > 0,18 s) encurtadas para 0,14 s; depois atempo 1,3. Tempos das palavras remapeados.
const { execFileSync } = require('child_process'); const fs = require('fs');
const FF = '../../node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg';
const KEEP = 0.14, AT = 1.3;
const DUR = 116.95 + 0.6;
const sil = fs.readFileSync('silencios.txt', 'utf8').trim().split('\n').map(l => l.split(/\s+/).map(Number)).filter(([a, b]) => b - a > KEEP);
// segmentos mantidos: [início, fim) do original
const segs = []; let cur = 0;
for (const [a, b] of sil) { const m = (a + b) / 2; segs.push([cur, Math.min(a + KEEP / 2, m)]); cur = Math.max(b - KEEP / 2, m); }
segs.push([cur, DUR]);
const map = t => { let acc = 0; for (const [a, b] of segs) { if (t < a) return acc / AT; if (t <= b) return (acc + t - a) / AT; acc += b - a; } return acc / AT; };
const f = segs.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[s${i}]`).join(';') + ';' + segs.map((_, i) => `[s${i}]`).join('') + `concat=n=${segs.length}:v=0:a=1,atempo=${AT}[o]`;
execFileSync(FF, ['-y', '-i', 'narracao_1x.mp3', '-filter_complex', f, '-map', '[o]', '-ar', '44100', '-b:a', '192k', 'narracao.mp3'], { stdio: 'pipe' });
const P = require('./narracao_1x_palavras.json');
P.palavras = P.palavras.map(w => ({ word: w.word, start: +map(w.start).toFixed(3), end: +map(w.end).toFixed(3) }));
P.compressao = { keep: KEEP, atempo: AT };
fs.writeFileSync('narracao_palavras.json', JSON.stringify(P, null, 2));
console.log('segmentos', segs.length, 'fala termina em', P.palavras[P.palavras.length - 1].end);

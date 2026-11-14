// QA DE VÍDEO — conferência automática antes de entregar
//
// Uso: node tools/qa_video.js <video.mp4> [--limites 7.8,18.8] [--motion 7.8-18.8,25.4-30] [--max-mb 30]
//
// Verifica:
//   - resolução, fps fixo (CFR), duração de áudio x vídeo (dessincronia)
//   - imagem TRAVADA (freezedetect) — principalmente nas emendas
//   - quadros pretos (blackdetect)
//   - loudness integrado (alvo -14 LUFS para redes)
//   - tamanho do arquivo
// Gera: <pasta do vídeo>/qa/<nome>_folha.jpg (quadros a cada 2s + antes/depois de cada emenda)
//       <pasta do vídeo>/qa/<nome>_relatorio.md
// Saída: código 0 = ok, 2 = encontrou problemas (o agente DEVE abrir a folha e o relatório)

'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const video = argv.find(a => !a.startsWith('--'));
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[i + 1];
if (!video || !fs.existsSync(video)) { console.error('Uso: node tools/qa_video.js <video> [--limites a,b] [--max-mb n]'); process.exit(1); }

function bin(n) {
  try { const a = require('./setup').ambiente(); if (a[n] && fs.existsSync(a[n])) return a[n]; } catch {}
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [n], { encoding: 'utf8' });
  const p = (r.stdout || '').split(/\r?\n/)[0].trim();
  return p && fs.existsSync(p) ? p : n;
}
const FF = bin('ffmpeg'), FP = bin('ffprobe');
const run = (b, a) => { const r = spawnSync(b, a, { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }); return (r.stdout || '') + (r.stderr || ''); };
const probe = (e, s) => run(FP, ['-v', 'error', ...(s ? ['-select_streams', s] : []), '-show_entries', e, '-of', 'default=noprint_wrappers=1:nokey=1', video]).trim();

const problemas = [], avisos = [], info = [];
const limites = String(opt.limites || '').split(',').map(Number).filter(x => x > 0);

const [w, h] = probe('stream=width,height', 'v:0').split(/\s+/).map(Number);
const rfr = probe('stream=r_frame_rate', 'v:0'), afr = probe('stream=avg_frame_rate', 'v:0');
const ev = s => { const [a, b] = s.split('/').map(Number); return b ? a / b : a; };
const durV = parseFloat(probe('stream=duration', 'v:0')) || parseFloat(probe('format=duration'));
const durA = parseFloat(probe('stream=duration', 'a:0'));
const mb = fs.statSync(video).size / 1048576;
info.push(`Resolução ${w}x${h} | fps ${ev(rfr).toFixed(2)} (média ${ev(afr).toFixed(2)}) | vídeo ${durV.toFixed(2)}s | áudio ${isNaN(durA) ? '—' : durA.toFixed(2) + 's'} | ${mb.toFixed(1)} MB`);
if (Math.abs(ev(rfr) - ev(afr)) > 0.05) problemas.push(`FPS variável (${rfr} vs média ${afr}). Reencode com fps fixo.`);
// Regra da squad: o vídeo nunca sai sem som. Sem trilha, mono, codec fora do padrão ou áudio quase mudo = PROBLEMA.
const codecA = probe('stream=codec_name', 'a:0'), canaisA = parseInt(probe('stream=channels', 'a:0'), 10), srA = parseInt(probe('stream=sample_rate', 'a:0'), 10);
if (isNaN(durA)) problemas.push('Sem trilha de áudio — o vídeo sai mudo. Refaça a mixagem com a voz/narração (Dafne --remixar, ou Salsicha).');
else {
  info.push(`Áudio ${codecA} | ${canaisA} canal(is) | ${srA} Hz`);
  if (codecA !== 'aac') problemas.push(`Áudio em "${codecA}" — use AAC (toca em todos os players e redes).`);
  if (canaisA !== 2) problemas.push(`Áudio com ${canaisA} canal(is) — use estéreo (2 canais): mono toca num lado só ou fica mudo em alguns players.`);
  if (srA !== 48000) avisos.push(`Áudio a ${srA} Hz — o padrão da squad é 48000 Hz.`);
  if (Math.abs(durV - durA) > 0.12) problemas.push(`Áudio e vídeo com durações diferentes (${durV.toFixed(2)} x ${durA.toFixed(2)}s) — risco de dessincronia.`);
}
if (opt['max-mb'] && mb > +opt['max-mb']) problemas.push(`Arquivo com ${mb.toFixed(1)} MB (limite ${opt['max-mb']} MB).`);

// Imagem travada e quadros pretos
const out = run(FF, ['-hide_banner', '-i', video, '-vf', 'freezedetect=n=0.002:d=0.2,blackdetect=d=0.15:pix_th=0.06', '-an', '-f', 'null', '-']);
const freezes = [];
let ini = null;
for (const l of out.split('\n')) {
  const s = l.match(/freeze_start:\s*([\d.]+)/); if (s) ini = +s[1];
  const e = l.match(/freeze_end:\s*([\d.]+)/); if (e && ini !== null) { freezes.push([ini, +e[1]]); ini = null; }
  const b = l.match(/black_start:([\d.]+)\s+black_end:([\d.]+)/); if (b) problemas.push(`Quadro preto de ${(+b[1]).toFixed(2)}s a ${(+b[2]).toFixed(2)}s.`);
}
if (ini !== null) freezes.push([ini, durV]);
// junta trechos parados quase colados (o detector quebra movimentos muito lentos em pedaços)
for (let i = freezes.length - 1; i > 0; i--) if (freezes[i][0] - freezes[i - 1][1] < 0.15) { freezes[i - 1][1] = freezes[i][1]; freezes.splice(i, 1); }
// Trechos de motion (camadas/encerramento): imagem parada ali costuma ser intencional
const motion = String(opt.motion || '').split(',').map(r => r.split('-').map(Number)).filter(r => r.length === 2 && r.every(isFinite));
const emMotion = (a, b) => motion.some(([m0, m1]) => a >= m0 - 0.1 && b <= m1 + 0.1);
// Início e fim do vídeo não são emendas
const emendas = limites.filter(x => x > 0.3 && x < durV - 0.3);
// Movimento lento (brilho girando, partículas, símbolo balançando) engana o detector: compara o 1º e o último quadro
// do trecho. Se mudaram de verdade (PSNR < 40 dB), não está travado.
function mudou(a, b) {
  const r = run(FF, ['-hide_banner', '-ss', String(a), '-i', video, '-ss', String(Math.max(a, b - 0.05)), '-i', video,
    '-filter_complex', '[0:v]trim=end_frame=1[x];[1:v]trim=end_frame=1[y];[x][y]psnr', '-an', '-f', 'null', '-']);
  const m = r.match(/average:([\d.]+|inf)/);
  return m ? m[1] !== 'inf' && parseFloat(m[1]) < 40 : false;
}
for (const [a, b] of freezes) {
  const perto = emendas.find(x => x >= a - 0.25 && x <= b + 0.25);
  const msg = `Imagem parada de ${a.toFixed(2)}s a ${b.toFixed(2)}s (${(b - a).toFixed(2)}s)`;
  if (perto !== undefined && !emMotion(a, b)) problemas.push(`${msg} — NA EMENDA de ${perto.toFixed(2)}s (travada).`);
  else if (emMotion(a, b) && b - a > 1.5 && mudou(a, b)) info.push(`${msg} — motion em movimento lento (a imagem muda; não está travada).`);
  else if (emMotion(a, b) && b - a > 1.5) avisos.push(`${msg} — motion parado por mais de 1,5 s: considere um movimento vivo (zoom lento, brilho) para não parecer travado.`);
  else if (emMotion(a, b) && b - a < 0.6) { /* pausa curta de leitura no motion: normal */ }
  else if (emMotion(a, b)) info.push(`${msg} — dentro de um trecho de motion (pausa de leitura, provavelmente intencional).`);
  else avisos.push(`${msg} — confira se é intencional (tela de motion parada) ou travada.`);
}

// Loudness
const lo = run(FF, ['-hide_banner', '-i', video, '-af', 'ebur128', '-f', 'null', '-']);
const I = (lo.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop();
if (I) { const v = parseFloat(I.split(/\s+/)[1]); info.push(`Loudness ${v} LUFS`);
  if (!isNaN(durA) && (!isFinite(v) || v < -35)) problemas.push(`Áudio quase mudo (${v} LUFS) — o vídeo vai parecer sem som. Confira a mixagem.`);
  else if (v < -17 || v > -11) avisos.push(`Loudness ${v} LUFS fora do alvo (-14 ± 3).`); }
else if (!isNaN(durA)) problemas.push('Não foi possível medir o áudio (sem som audível) — confira a mixagem.');

// Folha de conferência
const qaDir = path.join(path.dirname(video), 'qa');
fs.mkdirSync(qaDir, { recursive: true });
const base = path.basename(video, path.extname(video));
const tempos = new Set();
for (let t = 0.3; t < durV; t += 2) tempos.add(+t.toFixed(2));
for (const l of limites) { tempos.add(Math.max(0, +(l - 0.1).toFixed(2))); tempos.add(+Math.min(durV - 0.05, l + 0.1).toFixed(2)); }
const lista = [...tempos].sort((a, b) => a - b);
const tmp = path.join(qaDir, `.${base}_q`);
fs.mkdirSync(tmp, { recursive: true });
lista.forEach((t, i) => run(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'scale=216:-1', path.join(tmp, `${String(i).padStart(3, '0')}.jpg`)]));
const cols = 8, linhas = Math.ceil(lista.length / cols);
run(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(tmp, '%03d.jpg'), '-vf', `tile=${cols}x${linhas}:padding=4:color=white`, '-frames:v', '1', path.join(qaDir, `${base}_folha.jpg`)]);
fs.rmSync(tmp, { recursive: true, force: true });

const rel = [`# QA — ${path.basename(video)}`, '', ...info.map(x => `- ${x}`), '',
  `## Problemas (${problemas.length})`, ...(problemas.length ? problemas.map(x => `- ${x}`) : ['- nenhum']), '',
  `## Avisos (${avisos.length})`, ...(avisos.length ? avisos.map(x => `- ${x}`) : ['- nenhum']), '',
  `## Folha de quadros`, `qa/${base}_folha.jpg — tempos (s): ${lista.join(', ')}`, '',
  'Abra a folha e confira: enquadramento (cabeça cortada?), legenda (nomes próprios, nada atravessando corte), camadas e encerramento.'].join('\n');
fs.writeFileSync(path.join(qaDir, `${base}_relatorio.md`), rel, 'utf8');
console.log('\n' + rel + '\n');
process.exit(problemas.length ? 2 : 0);

// INVENTÁRIO DE ÁUDIO — olha uma pasta de trilhas/efeitos/narrações e organiza para o Scooby escolher
//
// Uso:
//   node tools/audio_inventario.js --pasta "C:/.../audio da marca" [--duracao 44] --out output/vN/audio
//
// Para cada arquivo (.mp3 .wav .m4a .aac .ogg .flac): duração, loudness (LUFS), dinâmica (LRA), pico,
// e o tipo provável — trilha · efeito (whoosh, pop, click, impacto, riser, brilho, digitação) · narração —
// pelo nome do arquivo e pela duração.
// Gera <out>/inventario.json, <out>/inventario.md e, para as trilhas, prévias de 12 s em <out>/previas/
// (para o usuário ouvir na aprovação do plano).
//
// Limite: a escolha é feita por medidas e pelo nome — o gosto final é de quem aprova (por isso as prévias).

'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
if (!opt.pasta) { console.error('Uso: node tools/audio_inventario.js --pasta <pasta> [--duracao s] --out <pasta de saída>'); process.exit(1); }
const amb = require('./setup').garantir(['ffmpeg']);
const FF = amb.ffmpeg || 'ffmpeg', FP = amb.ffprobe || 'ffprobe';
const EXT = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;

function listar(dir, prof = 4) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && prof > 0) out = out.concat(listar(p, prof - 1));
    else if (e.isFile() && EXT.test(e.name)) out.push(p);
  }
  return out;
}
const TIPOS = [
  ['narracao', /narr|locu|voz|voice|vo[_ -]/i],
  ['whoosh', /whoosh|swoosh|swish|transi/i], ['pop', /pop|bubble|blip/i], ['click', /click|clique|tick|tap/i],
  ['impacto', /impact|hit|boom|thud|punch|impacto/i], ['riser', /riser|rise|build|uplift/i],
  ['brilho', /shine|sparkle|shimmer|brilho|glitter|magic/i], ['digitacao', /typ|keyboard|teclad/i],
  ['trilha', /bgm|music|musica|track|trilha|song|beat|loop|corporate|inspir|tech/i],
];
function medir(f) {
  const dur = parseFloat(spawnSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout) || 0;
  const r = spawnSync(FF, ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  const err = r.stderr || '', k = err.lastIndexOf('Summary:');
  const t = k >= 0 ? err.slice(k) : err;   // só o resumo final (as linhas por quadro também têm I:/LRA:)
  const pick = re => { const m = t.match(re); return m ? parseFloat(m[1]) : null; };
  return { dur, lufs: pick(/I:\s+(-?[\d.]+) LUFS/), lra: pick(/LRA:\s+([\d.]+) LU/), pico: pick(/Peak:\s+(-?[\d.]+) dBFS/) };
}

const out = path.resolve(opt.out || 'audio_inventario');
const arquivos = listar(path.resolve(opt.pasta)).filter(f => !path.resolve(f).startsWith(out + path.sep));
fs.mkdirSync(path.join(out, 'previas'), { recursive: true });
const alvo = opt.duracao ? parseFloat(opt.duracao) : null;
const itens = arquivos.map(f => {
  const m = medir(f), nome = path.basename(f);
  let tipo = (TIPOS.find(([, re]) => re.test(nome)) || [null])[0];
  if (!tipo) tipo = m.dur < 3 ? 'efeito' : m.dur < 12 ? 'efeito-longo' : 'trilha';
  if (['whoosh', 'pop', 'click', 'impacto', 'riser', 'brilho', 'digitacao'].includes(tipo)) tipo = 'efeito:' + tipo;
  return { arquivo: f, nome, tipo, duracao: +m.dur.toFixed(2), lufs: m.lufs, lra: m.lra, pico: m.pico };
});
// trilhas: nota simples para a duração do vídeo e para "ficar por baixo da voz"
for (const it of itens.filter(i => i.tipo === 'trilha')) {
  const cobre = alvo ? (it.duracao >= alvo ? 1 : it.duracao / alvo) : 1;
  const dinamica = it.lra == null ? 0.5 : it.lra <= 8 ? 1 : it.lra <= 14 ? 0.7 : 0.4;   // trilha muito dinâmica briga com a voz
  it.nota = +(cobre * 0.6 + dinamica * 0.4).toFixed(2);
  const prev = path.join(out, 'previas', it.nome.replace(EXT, '') + '_previa.mp3');
  const ini = Math.min(Math.max(0, it.duracao * 0.25), Math.max(0, it.duracao - 12));
  spawnSync(FF, ['-y', '-loglevel', 'error', '-ss', String(ini), '-t', '12', '-i', it.arquivo, '-af', 'afade=t=in:d=0.5,afade=t=out:st=11.3:d=0.7', prev]);
  it.previa = prev;
}
itens.sort((a, b) => (a.tipo > b.tipo ? 1 : a.tipo < b.tipo ? -1 : (b.nota || 0) - (a.nota || 0)));
fs.writeFileSync(path.join(out, 'inventario.json'), JSON.stringify({ pasta: path.resolve(opt.pasta), duracao_video: alvo, itens }, null, 2));
const md = ['# Inventário de áudio', '', `Pasta: ${path.resolve(opt.pasta)}${alvo ? ` · vídeo de ${alvo}s` : ''}`, '',
  '| tipo | arquivo | duração | LUFS | dinâmica (LRA) | nota |', '|---|---|---|---|---|---|',
  ...itens.map(i => `| ${i.tipo} | ${i.nome} | ${i.duracao}s | ${i.lufs ?? '—'} | ${i.lra ?? '—'} | ${i.nota ?? ''} |`), '',
  'Nota das trilhas: cobre a duração do vídeo + dinâmica baixa (fica bem por baixo de voz). Ouça as prévias antes de escolher.'].join('\n');
fs.writeFileSync(path.join(out, 'inventario.md'), md + '\n');
console.log(md);

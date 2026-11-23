// DIÁLOGO — vários personagens falando, cada um com sua voz do ElevenLabs (a protagonista é sempre a voz da Osiany)
//
// Uso:
//   node tools/dialogo.js --dialogo output/vN/dialogo.json --out output/vN
//
// dialogo.json:
// {
//   "personagens": { "dourado": { "voz": "osiany" }, "azul": { "voz": "N2lVS1w4EtoT3dr4eOWO", "velocidade": 1.05 } },
//   "pausa": 0.25,                        // silêncio entre falas (s)
//   "falas": [ { "quem": "azul", "texto": "Ei, você aí." }, { "quem": "dourado", "texto": "Achei não.", "pausa_antes": 0.4 } ]
// }
//   "osiany" = voz do .env da raiz (Elevenlabs_voz_id). Personagem sem "voz" também usa a voz do .env.
//
// Gera em --out:
//   dialogo.mp3          → todas as falas em sequência (entra na Dafne como --narracao)
//   dialogo.json (cópia) + dialogo_tempos.json → { duracao, fps, falas:[{quem,texto,inicio,fim,palavras:[{word,start,end}]}],
//                                                 boca:{ <personagem>: [0..1 por quadro] } }  (lip-sync)
//   falas/NN_quem.mp3    → cache: fala que não mudou não é gerada de novo (não gasta crédito)

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { config, chamar, args } = require('./elevenlabs');

const FPS = 30;
const r3 = x => Math.round(x * 1000) / 1000;

function palavrasDe(al, desloc) {
  const out = []; let at = null;
  al.characters.forEach((c, i) => {
    if (/\s/.test(c)) { if (at) { if (!/^\[.*\]$/.test(at.word)) out.push(at); at = null; } return; }   // 18/11: tags do v3 ([gasps]...) nao viram palavra
    if (!at) at = { word: '', start: r3(desloc + al.character_start_times_seconds[i]), end: 0 };
    at.word += c; at.end = r3(desloc + al.character_end_times_seconds[i]);
  });
  if (at && !/^\[.*\]$/.test(at.word)) out.push(at);
  return out;
}

function envelope(ff, arquivo) {
  // RMS por quadro (30 fps) a partir de PCM 16 kHz mono
  const r = spawnSync(ff, ['-v', 'error', '-i', arquivo, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], { maxBuffer: 200 * 1024 * 1024 });
  const pcm = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 2));
  const n = 16000 / FPS, env = [];   // 533,33 amostras por quadro: indices inteiros (antes virava NaN e a boca nao abria)
  for (let q = 0; q * n < pcm.length; q++) {
    const a = Math.floor(q * n), b = Math.min(Math.floor((q + 1) * n), pcm.length);
    let s = 0, k = 0;
    for (let j = a; j < b; j++) { s += pcm[j] * pcm[j]; k++; }
    env.push(Math.sqrt(s / Math.max(1, k)) / 32768);
  }
  return env;
}

(async function main() {
  const opt = args(process.argv.slice(2));
  if (!opt.dialogo) { console.error('Uso: node tools/dialogo.js --dialogo dialogo.json --out <pasta>'); process.exit(1); }
  const D = JSON.parse(fs.readFileSync(opt.dialogo, 'utf8'));
  const out = path.resolve(opt.out || path.dirname(opt.dialogo));
  const dirFalas = path.join(out, 'falas'); fs.mkdirSync(dirFalas, { recursive: true });
  const cfg = config().voz;
  const amb = require('./setup').garantir(['ffmpeg']);
  const FF = amb.ffmpeg, FP = amb.ffprobe;

  let custo = 0;
  const geradas = [];
  for (const [i, f] of D.falas.entries()) {
    const per = D.personagens[f.quem] || {};
    const voz = !per.voz || per.voz === 'osiany' ? cfg.voice_id : per.voz;
    const MOD = D.modelo || cfg.modelo;   // 18/11: dialogo.json pode pedir outro modelo (ex.: eleven_v3, que entende [whispers], [gasps]...)
    const ajustes = D.modelo ? { ...(per.ajustes || {}) } : { ...cfg.ajustes, ...(per.ajustes || {}) };
    if (per.velocidade) ajustes.speed = per.velocidade;
    if (f.ajustes) Object.assign(ajustes, f.ajustes);   // ajuste so desta fala (ex.: mais devagar/estavel pra ficar clara)
    const chave = crypto.createHash('md5').update(JSON.stringify([f.texto, voz, ajustes, MOD])).digest('hex').slice(0, 8);
    const base = path.join(dirFalas, `${String(i + 1).padStart(2, '0')}_${f.quem}_${chave}`);
    if (!fs.existsSync(base + '.json')) {
      console.log(`[Diálogo] ${f.quem}: "${f.texto}"`);
      const r = await chamar(`/v1/text-to-speech/${voz}/with-timestamps?output_format=mp3_44100_128`, {
        text: f.texto, model_id: MOD, language_code: 'pt', voice_settings: ajustes,
      });
      fs.writeFileSync(base + '.mp3', Buffer.from(r.audio_base64, 'base64'));
      fs.writeFileSync(base + '.json', JSON.stringify(r.normalized_alignment && !r.alignment ? r.normalized_alignment : r.alignment));
      custo += f.texto.length;
    } else console.log(`[Diálogo] = ${f.quem}: "${f.texto}" (cache)`);
    const dur = parseFloat(spawnSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base + '.mp3'], { encoding: 'utf8' }).stdout);
    geradas.push({ ...f, arquivo: base + '.mp3', alinhamento: JSON.parse(fs.readFileSync(base + '.json', 'utf8')), dur });
  }

  // linha do tempo
  let t = D.inicio ?? 0.4;
  const falas = [];
  for (const [i, g] of geradas.entries()) {
    if (i > 0) t += g.pausa_antes ?? D.pausa ?? 0.25;
    const palavras = palavrasDe(g.alinhamento, t);
    const fim = palavras.length ? palavras[palavras.length - 1].end : t + g.dur;
    falas.push({ quem: g.quem, texto: g.texto, inicio: r3(t), fim: r3(fim), arquivo: g.arquivo, palavras });
    t = fim;
  }
  const duracao = r3(t + (D.fim ?? 0.3));

  // mixagem: cada fala no seu tempo (adelay) e soma
  const ins = [], filt = [];
  geradas.forEach((g, i) => {
    ins.push('-i', g.arquivo);
    const ms = Math.round(falas[i].inicio * 1000);
    filt.push(`[${i}:a]aresample=44100,aformat=channel_layouts=mono,atrim=0:${(falas[i].fim - falas[i].inicio + 0.08).toFixed(3)},adelay=${ms}|${ms},apad=whole_dur=${duracao}[a${i}]`);
  });
  filt.push(`${geradas.map((_, i) => `[a${i}]`).join('')}amix=inputs=${geradas.length}:normalize=0,atrim=0:${duracao}[m]`);
  const mp3 = path.join(out, 'dialogo.mp3');
  const r = spawnSync(FF, ['-y', '-loglevel', 'error', ...ins, '-filter_complex', filt.join(';'), '-map', '[m]', '-ac', '2', '-c:a', 'libmp3lame', '-q:a', '2', mp3], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('mixagem falhou: ' + r.stderr);

  // boca de cada personagem por quadro (lip-sync), normalizada por personagem
  const nQ = Math.ceil(duracao * FPS), boca = {};
  for (const quem of Object.keys(D.personagens)) boca[quem] = new Array(nQ).fill(0);
  geradas.forEach((g, i) => {
    const env = envelope(FF, g.arquivo), q0 = Math.round(falas[i].inicio * FPS);
    env.forEach((v, k) => { if (q0 + k < nQ && boca[g.quem]) boca[g.quem][q0 + k] = Math.max(boca[g.quem][q0 + k], v); });
  });
  for (const q of Object.keys(boca)) {
    const arr = boca[q], pico = [...arr].sort((a, b) => b - a)[Math.floor(arr.filter(v => v > 0).length * 0.05)] || 1;
    boca[q] = arr.map(v => r3(Math.min(1, Math.max(0, (v / pico - 0.08) / 0.92))));
  }

  // selos (reforços) e palavras-chave: o tempo vem da palavra falada
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w%$]+/g, '');
  const reforcos = (D.reforcos || []).map(r => {
    const alvo = norm(String(r.palavra).split(/\s+/)[0]);
    for (const f of falas) {
      if (r.quem && f.quem !== r.quem) continue;
      const w = f.palavras.find(w => norm(w.word) === alvo || (alvo.length > 3 && norm(w.word).startsWith(alvo)));
      if (w) return { ...r, quem: f.quem, t: w.start };
    }
    console.warn(`[Diálogo] ⚠ reforço "${r.palavra}" não encontrado na fala`); return null;
  }).filter(Boolean);
  const tempos = { duracao, fps: FPS, audio: 'dialogo.mp3', palavras_chave: D.palavras_chave || [], reforcos,
    personagens: D.personagens, falas: falas.map(({ arquivo, ...f }) => f), boca };
  fs.writeFileSync(path.join(out, 'dialogo_tempos.json'), JSON.stringify(tempos));
  fs.writeFileSync(path.join(out, 'cena_dados.js'), 'window.DIALOGO=' + JSON.stringify(tempos) + ';\n');
  console.log(`[Diálogo] ${falas.length} falas · ${duracao}s · ${custo} créditos gastos agora`);
  falas.forEach(f => console.log(`  ${f.inicio.toFixed(2)}–${f.fim.toFixed(2)}  ${f.quem}: ${f.texto}`));
  console.log(`[Diálogo] → ${mp3}\n[Diálogo] → ${path.join(out, 'dialogo_tempos.json')}`);
})().catch(e => { console.error('[Diálogo] ' + e.message); process.exit(1); });

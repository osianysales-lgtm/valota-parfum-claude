// v72 · "Clima para cada perfume" (molde do reel @lautileria.ar DczCNMfoT7C)
// Take dela (IMG_9749.MOV) repetido em 4 rodadas, faixa "-15° +24° ♾️°" no peito,
// frascos aparecem SECO (sem animação) logo depois de cada "esse", mão dela NA FRENTE dos frascos.
// node gerar.js   → final/v72-clima-para-cada-perfume.mp4
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const sharp = require(path.join(__dirname, '../../node_modules/sharp'));
const C = require('./config.json');
const D = __dirname, T = path.join(D, 'tmp'); fs.mkdirSync(T, { recursive: true }); fs.mkdirSync(path.join(D, 'final'), { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
const PY = path.join(D, '../../.venv-whisper/bin/python');

const FONTE = path.join(process.env.HOME, 'Downloads/IMG_9749.MOV');
const INI = 0.55, DUR = 5.2;                 // fala começa 0,80 e termina 5,60 no original
// entrada de cada frasco no take (s): "esse" frio 0,80 · "esse" calor 2,35 · "e esse" 3,85 (+0,2 = igual ao reel)
const ENTRA = [0.45, 2.0, 3.55];
const RODADAS = [
  ['01_valhalla', '02_aquatica', '03_italia'],
  ['04_hawas_elixir', '05_hawas_kobra', '06_hawas_malibu'],
  ['07_9pm_elixir', '08_9am_dive', '09_9pm_night_out'],
  ['10_mandarin_sky_elixir', '11_odyssey_aqua', '12_odyssey_mega'],
];

(async () => {
  // 1) take cortado, 1080x1920 30 fps, SEM espelhar
  const take = path.join(T, 'take.mp4');
  ff('-ss', INI, '-t', DUR, '-i', FONTE, '-vf', 'fps=30,scale=1080:1920,format=yuv420p',
     '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-c:a', 'aac', '-b:a', '256k', take);
  // 2) máscara das mãos tirada do PRÓPRIO take (quadros batem 1:1)
  // (opcional) mão na frente dos frascos: recorte por cor deixou buraco no antebraço/tatuagem → desligado,
  // frascos por cima de tudo IGUAL ao reel de referência. Ligar com "mao_na_frente": true no config.json.
  const masc = path.join(T, 'mascara_maos.mkv');
  if (C.mao_na_frente) execFileSync(PY, [path.join(D, 'maos.py'), take, '0', String(DUR + 1), masc], { stdio: 'inherit' });
  // 3) faixa
  execFileSync('node', [path.join(D, 'faixa.js')], { stdio: 'inherit' });

  // 4) cada rodada
  const partes = [];
  for (const [r, trio] of RODADAS.entries()) {
    const ins = ['-i', take, ...(C.mao_na_frente ? ['-i', masc] : ['-i', take]), '-i', path.join(D, 'faixa.png')];
    const pos = [];
    for (const [i, n] of trio.entries()) {
      const out = path.join(T, `f_${n}.png`);
      const b = await sharp(path.join(D, 'frascos/final', n + '.png'))
        .resize(C.frasco.larg, C.frasco.altMax, { fit: 'inside' }).png().toFile(out);
      pos.push({ x: Math.round(C.colunas[i] - b.width / 2), y: C.frasco.topo });
      ins.push('-i', out);
    }
    const t = ENTRA.map((e, i) => (r === 0 && i === 0 ? 0 : e));   // 1ª rodada: 1º frasco já no quadro 0 (igual ao reel)
    const fc = [
      ...(C.mao_na_frente ? ['[0:v]split[base][src]', '[1:v]format=gray[m]', '[src][m]alphamerge[mao]'] : ['[0:v]null[base]', '[1:v]nullsink', '[1:a]anullsink']),
      `[base][3:v]overlay=${pos[0].x}:${pos[0].y}:enable='gte(t,${t[0]})'[a]`,
      `[a][4:v]overlay=${pos[1].x}:${pos[1].y}:enable='gte(t,${t[1]})'[b]`,
      `[b][5:v]overlay=${pos[2].x}:${pos[2].y}:enable='gte(t,${t[2]})'[c]`,
      C.mao_na_frente ? '[c][mao]overlay=0:0:shortest=1[d]' : '[c]null[d]', '[d][2:v]overlay=0:0,format=yuv420p[v]',
    ].join(';');
    const p = path.join(T, `rodada_${r + 1}.mp4`);
    ff(...ins, '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-t', DUR,
       '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-c:a', 'aac', '-b:a', '256k', p);
    partes.push(p);
    console.log('ok rodada', r + 1, trio.join(' · '));
  }

  // 5) junta + trilha baixinha (trap luxo da biblioteca) + -14 LUFS
  const lista = path.join(T, 'lista.txt');
  fs.writeFileSync(lista, partes.map(p => `file '${p}'`).join('\n'));
  const junto = path.join(T, 'junto.mp4');
  ff('-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', junto);
  const trilha = path.join(D, '../../biblioteca_audio/trilhas/trilha_trap_luxo_beat.mp3');
  const total = DUR * RODADAS.length;
  const saida = path.join(D, 'final/v72-clima-para-cada-perfume.mp4');
  ff('-i', junto, '-stream_loop', '-1', '-i', trilha, '-filter_complex',
     `[0:a]aformat=sample_rates=48000:channel_layouts=stereo[voz];` +
     `[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${C.trilha_db}dB,atrim=0:${total},afade=t=out:st=${total - 0.6}:d=0.6[bg];` +
     `[voz][bg]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89[au]`,
     '-map', '0:v', '-map', '[au]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-t', total, saida);
  console.log('ok', saida);
})();

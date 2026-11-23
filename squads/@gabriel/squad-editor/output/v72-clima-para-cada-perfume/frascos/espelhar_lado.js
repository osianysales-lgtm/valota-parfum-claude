// Frasco simétrico com sobra (sombra/reflexo) de UM lado: usa o lado esquerdo (íntegro) como régua.
// O centro vem do rótulo (pixels da cor do rótulo). Em cada linha, corta tudo além de C + (C - xEsq).
// node espelhar_lado.js <recorte.png sem trim> <saida.png> [corRotulo=amarelo]
const s = require('sharp');
(async () => {
  const [inp, out] = process.argv.slice(2);
  const { data, info } = await s(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // centro pelo rótulo dourado
  let sx = 0, n = 0;
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (data[i * 4 + 3] > 200 && r > 190 && g > 160 && b < 150 && r - b > 70) { sx += i % W; n++; }
  }
  const C = sx / n;
  let cortados = 0;
  for (let y = 0; y < H; y++) {
    let xl = -1;
    for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 128) { xl = x; break; }
    if (xl < 0) continue;
    const lim = C + (C - xl);
    for (let x = Math.floor(lim); x < W; x++) {
      const k = (y * W + x) * 4;
      const f = Math.max(0, Math.min(1, lim + 0.5 - x)); // antisserrilhado de 1 px
      const a = Math.round(data[k + 3] * f);
      if (a < data[k + 3]) { data[k + 3] = a; cortados++; }
    }
  }
  await s(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
  console.log('centro', C.toFixed(1), 'px rotulo', n, 'cortados', cortados);
})();

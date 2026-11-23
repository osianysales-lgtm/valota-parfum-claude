// Frasco ESCURO fotografado meio de lado: a face lateral reflete o fundo branco e vira "halo" no fundo escuro.
// Varre da borda direita pra dentro (e do topo pra baixo) apagando pixel claro e sem cor até achar o vidro escuro.
// node tirar_face_clara.js <in.png> <out.png> [maxDir=70] [maxTopo=30] [lum=95]
const s = require('sharp');
(async () => {
  const [inp, out, md = '70', mt = '30', lm = '95'] = process.argv.slice(2);
  const MD = +md, MT = +mt, LUM = +lm;
  const { data, info } = await s(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const claro = k => { const r = data[k], g = data[k + 1], b = data[k + 2]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return (0.3 * r + 0.59 * g + 0.11 * b) > LUM && (mx ? (mx - mn) / mx : 0) < 0.3; };
  let n = 0;
  for (let y = 0; y < H; y++) {
    let x = W - 1; while (x >= 0 && data[(y * W + x) * 4 + 3] < 20) x--;
    for (let d = 0; d < MD && x >= 0; d++, x--) { const k = (y * W + x) * 4; if (!claro(k)) break; data[k + 3] = 0; n++; }
  }
  for (let x = 0; x < W; x++) {
    let y = 0; while (y < H && data[(y * W + x) * 4 + 3] < 20) y++;
    for (let d = 0; d < MT && y < H; d++, y++) { const k = (y * W + x) * 4; if (!claro(k)) break; data[k + 3] = 0; n++; }
  }
  await s(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
  console.log('apagados', n);
})();

// Recorte por cor de fundo liso (qualquer cor, pega a do canto): flood fill a partir da borda.
// node cortar_fundo.js <entrada> <saida.png> [tol=10] [maxlado=2400]
// Borda suave: pixel de fronteira ganha alfa proporcional à distância da cor do fundo.
const sharp = require('sharp');
(async () => {
  const [inp, out, tl = '10', ml = '2400'] = process.argv.slice(2);
  const TOL = +tl;
  const img = sharp(inp).flatten({ background: '#ffffff' }).resize(+ml, +ml, { fit: 'inside', withoutEnlargement: true });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H, C = info.channels;
  const bg = [0, 1, 2].map(k => Math.round((data[k] + data[(W - 1) * C + k] + data[((H - 1) * W) * C + k] + data[(N - 1) * C + k]) / 4));
  const dist = new Float32Array(N);
  for (let i = 0; i < N; i++) dist[i] = Math.max(Math.abs(data[i * C] - bg[0]), Math.abs(data[i * C + 1] - bg[1]), Math.abs(data[i * C + 2] - bg[2]));
  const fundo = new Uint8Array(N); const q = new Int32Array(N); let h = 0, t = 0;
  const push = i => { if (!fundo[i] && dist[i] <= TOL) { fundo[i] = 1; q[t++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (h < t) { const i = q[h++]; const x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
  const o = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    let a = 255;
    if (fundo[i]) a = 0;
    else { // vizinho do fundo → alfa suave
      const x = i % W, y = (i / W) | 0;
      const viz = (x > 0 && fundo[i - 1]) || (x < W - 1 && fundo[i + 1]) || (y > 0 && fundo[i - W]) || (y < H - 1 && fundo[i + W]);
      if (viz) a = Math.max(0, Math.min(255, Math.round(255 * (dist[i] - TOL) / (TOL * 3))));
    }
    o[i * 4] = data[i * C]; o[i * 4 + 1] = data[i * C + 1]; o[i * 4 + 2] = data[i * C + 2]; o[i * 4 + 3] = a;
  }
  await sharp(o, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
  console.log('ok', out.split('/').pop(), W, H, 'fundo', bg.join(','), Math.round(100 * t / N) + '%');
})();

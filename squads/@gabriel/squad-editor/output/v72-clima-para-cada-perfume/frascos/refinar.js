// Acabamento de recorte de frasco (v56): tira halo branco da borda e restos soltos.
// node refinar.js <entrada.png> <saida.png> [encolher_px=2] [suave_px=1.1] [limiar=140]
// 1) alfa duro (limiar) 2) mantém só o maior pedaço (o frasco; buracos internos continuam buracos)
// 3) encolhe N px (some o brilho do fundo branco) 4) desfoca o alfa de leve 5) trim
const sharp = require('sharp');
(async () => {
  const [inp, out, er = '2', sv = '1.1', lim = '140'] = process.argv.slice(2);
  const ERO = +er, SUAVE = +sv, LIM = +lim;
  const { data, info } = await sharp(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  let m = new Uint8Array(N);
  for (let i = 0; i < N; i++) m[i] = data[i * 4 + 3] >= LIM ? 1 : 0;
  // maior componente conectado
  const lab = new Int32Array(N); let best = 0, bestSz = 0, cur = 0; const q = new Int32Array(N);
  for (let i = 0; i < N; i++) if (m[i] && !lab[i]) {
    cur++; let h = 0, t = 0; q[t++] = i; lab[i] = cur; let sz = 0;
    while (h < t) { const k = q[h++]; sz++; const x = k % W, y = (k / W) | 0;
      const nb = [x > 0 ? k - 1 : -1, x < W - 1 ? k + 1 : -1, y > 0 ? k - W : -1, y < H - 1 ? k + W : -1];
      for (const j of nb) if (j >= 0 && m[j] && !lab[j]) { lab[j] = cur; q[t++] = j; } }
    if (sz > bestSz) { bestSz = sz; best = cur; }
  }
  for (let i = 0; i < N; i++) m[i] = lab[i] === best ? 1 : 0;
  // erosão (quadrado separável)
  for (let r = 0; r < ERO; r++) {
    const a = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = y * W + x;
      a[k] = m[k] && (x === 0 || m[k - 1]) && (x === W - 1 || m[k + 1]) && (y === 0 || m[k - W]) && (y === H - 1 || m[k + W]) ? 1 : 0; }
    m = a;
  }
  const alpha = Buffer.alloc(N); for (let i = 0; i < N; i++) alpha[i] = m[i] * 255;
  const blurred = SUAVE > 0.3 ? await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(SUAVE).extractChannel(0).raw().toBuffer() : alpha;
  const outb = Buffer.from(data);
  for (let i = 0; i < N; i++) { const a = Math.min(data[i * 4 + 3] >= LIM ? 255 : data[i * 4 + 3], blurred[i]); outb[i * 4 + 3] = a; if (!a) outb[i * 4] = outb[i * 4 + 1] = outb[i * 4 + 2] = 0; }
  const png = await sharp(outb, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await sharp(png).trim({ threshold: 1 }).png().toFile(out);
  console.log('ok', out.split('/').pop(), W, H, 'pedaços', cur);
})();

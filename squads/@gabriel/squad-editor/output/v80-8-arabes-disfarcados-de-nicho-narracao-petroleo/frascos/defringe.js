// v59: tira o resto de fundo branco que fica na BORDA do recorte (filete claro no fundo escuro).
// Na faixa de B px a partir da borda do alfa, pixel claro e sem cor (fundo branco misturado) perde o alfa.
// node defringe.js in.png out.png [B=5] [lum=185] [sat=0.18]
const s = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/sharp');
(async () => {
  const [inp, out, b = '5', lm = '185', st = '0.18'] = process.argv.slice(2); const B = +b, LUM = +lm, SAT = +st;
  const { data, info } = await s(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height;
  const A = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) A[i] = data[i * 4 + 3];
  // distância (em px, quadrada) até um pixel transparente
  const D = new Int16Array(W * H).fill(999);
  for (let i = 0; i < W * H; i++) if (A[i] < 20) D[i] = 0;
  for (let k = 1; k <= B; k++) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (D[i] !== 999) continue;
    if ((x > 0 && D[i - 1] === k - 1) || (x < W - 1 && D[i + 1] === k - 1) || (y > 0 && D[i - W] === k - 1) || (y < H - 1 && D[i + W] === k - 1)) D[i] = k; }
  let n = 0;
  for (let i = 0; i < W * H; i++) { if (D[i] < 1 || D[i] > B) continue;
    const r = data[i * 4], g = data[i * 4 + 1], bl = data[i * 4 + 2], mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
    const lum = 0.3 * r + 0.59 * g + 0.11 * bl, sat = mx ? (mx - mn) / mx : 0;
    if (lum > LUM && sat < SAT) { data[i * 4 + 3] = 0; n++; } }
  // suaviza só a borda nova
  const buf = await s(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const al = await s(buf).extractChannel(3).blur(0.7).raw().toBuffer();
  for (let i = 0; i < W * H; i++) data[i * 4 + 3] = Math.min(data[i * 4 + 3], al[i] < 8 ? 0 : al[i]) ;
  await s(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toFile(out);
  console.log(out, 'pixels de fundo tirados:', n);
})();

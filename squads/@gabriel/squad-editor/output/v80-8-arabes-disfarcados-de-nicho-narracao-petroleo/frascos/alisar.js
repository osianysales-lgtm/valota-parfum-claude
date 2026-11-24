// alisa o contorno: alfa → desfoque R → limiar 128 → desfoque leve. node alisar.js in.png out.png [R=5] [suave=0.8]
const s = require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/sharp');
(async () => {
  const [inp, out, r = '5', sv = '0.8'] = process.argv.slice(2);
  const { data, info } = await s(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H; const a = Buffer.alloc(N); for (let i = 0; i < N; i++) a[i] = data[i * 4 + 3];
  const b = await s(a, { raw: { width: W, height: H, channels: 1 } }).blur(+r).extractChannel(0).raw().toBuffer();
  for (let i = 0; i < N; i++) b[i] = b[i] >= 140 ? 255 : 0;
  const c = await s(b, { raw: { width: W, height: H, channels: 1 } }).blur(+sv).extractChannel(0).raw().toBuffer();
  const o = Buffer.from(data); for (let i = 0; i < N; i++) { o[i * 4 + 3] = c[i]; if (!c[i]) o[i * 4] = o[i * 4 + 1] = o[i * 4 + 2] = 0; }
  const png = await s(o, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await s(png).trim({ threshold: 1 }).png().toFile(out);
})();

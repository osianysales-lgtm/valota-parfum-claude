// folha de conferência: cada frasco ampliado sobre petróleo e sobre magenta. node conferir.js saida.jpg a.png b.png ...
const s = require('sharp');
(async () => {
  const [out, ...fs] = process.argv.slice(2); const H = 900, cols = [];
  for (const f of fs) {
    const m = await s(f).metadata(); const w = Math.round(m.width * H / m.height);
    const b = await s(f).resize(w, H).png().toBuffer();
    for (const bg of ['#0F2E33', '#ff00ff']) cols.push(await s({ create: { width: w + 40, height: H + 40, channels: 3, background: bg } }).composite([{ input: b, left: 20, top: 20 }]).png().toBuffer());
  }
  let x = 0; const comp = []; const ws = [];
  for (const c of cols) { const m = await s(c).metadata(); comp.push({ input: c, left: x, top: 0 }); x += m.width; }
  await s({ create: { width: x, height: H + 40, channels: 3, background: '#222' } }).composite(comp).jpeg({ quality: 88 }).toFile(out);
})();
